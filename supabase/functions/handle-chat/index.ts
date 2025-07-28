import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface CreateMessageRequest {
  content: string
  projectId?: string
  taskId?: string
  recipientId?: string
  parentMessageId?: string
  type?: string
}

interface GetMessagesQuery {
  projectId?: string
  taskId?: string
  recipientId?: string
  limit?: number
  offset?: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify the user's JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get user data including role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, name')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: 'Failed to get user data' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const userRole = userData.role
    const userName = userData.name || user.email

    if (req.method === 'GET') {
      // Handle GET requests - retrieve messages
      const url = new URL(req.url)
      const query: GetMessagesQuery = {
        projectId: url.searchParams.get('projectId') || undefined,
        taskId: url.searchParams.get('taskId') || undefined,
        recipientId: url.searchParams.get('recipientId') || undefined,
        limit: parseInt(url.searchParams.get('limit') || '50'),
        offset: parseInt(url.searchParams.get('offset') || '0')
      }

      if (!query.projectId && !query.taskId && !query.recipientId) {
        return new Response(
          JSON.stringify({ error: 'Must provide projectId, taskId, or recipientId' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      let messagesQuery = supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          sender_id,
          project_id,
          task_id,
          recipient_id,
          parent_message_id,
          type,
          is_deleted,
          sender:sender_id(id, name, email)
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .range(query.offset!, query.offset! + query.limit! - 1)

      // Apply filters based on query parameters
      if (query.projectId) {
        messagesQuery = messagesQuery.eq('project_id', query.projectId)
      } else if (query.taskId) {
        messagesQuery = messagesQuery.eq('task_id', query.taskId)
      } else if (query.recipientId) {
        // Direct messages between current user and recipient
        messagesQuery = messagesQuery.or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${query.recipientId}),and(sender_id.eq.${query.recipientId},recipient_id.eq.${user.id})`
        )
      }

      // Role-based access control for messages
      if (userRole === 'client') {
        // Clients can only see messages in projects they're assigned to
        // This would require additional checks against project membership
        if (query.projectId) {
          const { data: projectAccess } = await supabase
            .from('projects')
            .select('id')
            .eq('id', query.projectId)
            .eq('client_id', user.id) // Assuming projects have client_id
            .single()

          if (!projectAccess) {
            return new Response(
              JSON.stringify({ error: 'Access denied to this project' }),
              { 
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            )
          }
        }
      }

      const { data: messages, error: messagesError } = await messagesQuery

      if (messagesError) {
        console.error('Messages query error:', messagesError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch messages' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      return new Response(
        JSON.stringify({ messages }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } else if (req.method === 'POST') {
      // Handle POST requests - create new message
      const messageData: CreateMessageRequest = await req.json()

      if (!messageData.content || messageData.content.trim().length === 0) {
        return new Response(
          JSON.stringify({ error: 'Message content is required' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Validate that at least one target is specified
      if (!messageData.projectId && !messageData.taskId && !messageData.recipientId) {
        return new Response(
          JSON.stringify({ error: 'Must specify projectId, taskId, or recipientId' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Role-based access control for message creation
      if (userRole === 'client' && messageData.projectId) {
        // Verify client has access to the project
        const { data: projectAccess } = await supabase
          .from('projects')
          .select('id')
          .eq('id', messageData.projectId)
          .eq('client_id', user.id) // Assuming projects have client_id
          .single()

        if (!projectAccess) {
          return new Response(
            JSON.stringify({ error: 'Access denied to this project' }),
            { 
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
      }

      // Create the message
      const { data: message, error: createError } = await supabase
        .from('messages')
        .insert({
          content: messageData.content.trim(),
          project_id: messageData.projectId || null,
          task_id: messageData.taskId || null,
          recipient_id: messageData.recipientId || null,
          parent_message_id: messageData.parentMessageId || null,
          sender_id: user.id,
          type: messageData.type || 'text'
        })
        .select(`
          id,
          content,
          created_at,
          updated_at,
          sender_id,
          project_id,
          task_id,
          recipient_id,
          parent_message_id,
          type,
          is_deleted,
          sender:sender_id(id, name, email)
        `)
        .single()

      if (createError) {
        console.error('Message creation error:', createError)
        return new Response(
          JSON.stringify({ error: 'Failed to create message' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Log activity for project/task messages
      if (messageData.projectId || messageData.taskId) {
        try {
          await supabase
            .from('activity_logs')
            .insert({
              user_id: user.id,
              user_role: userRole,
              user_name: userName,
              action: 'MESSAGE_SENT',
              entity_type: messageData.taskId ? 'TASK' : 'PROJECT',
              entity_id: messageData.taskId || messageData.projectId,
              entity_name: messageData.content.substring(0, 50) + (messageData.content.length > 50 ? '...' : ''),
              project_id: messageData.projectId || null,
              task_id: messageData.taskId || null,
              metadata: {
                messageId: message.id,
                messageType: messageData.type || 'text',
                contentLength: messageData.content.length
              }
            })
        } catch (logError) {
          console.error('Failed to log message activity:', logError)
          // Don't fail the request if logging fails
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})