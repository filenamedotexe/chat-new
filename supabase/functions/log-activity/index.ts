import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ActivityLogRequest {
  action: string
  entityType: string
  entityId: string
  entityName: string
  projectId?: string
  taskId?: string
  organizationId?: string
  metadata?: Record<string, any>
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
}

// Valid activity actions
const VALID_ACTIONS = [
  'PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_DELETED',
  'TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED', 'TASK_STATUS_CHANGED',
  'FILE_UPLOADED', 'FILE_DOWNLOADED', 'FILE_SHARED', 'FILE_DELETED',
  'MESSAGE_SENT', 'MESSAGE_EDITED', 'MESSAGE_DELETED',
  'USER_CREATED', 'USER_UPDATED', 'USER_ROLE_CHANGED',
  'ORGANIZATION_CREATED', 'ORGANIZATION_UPDATED',
  'FEATURE_TOGGLED', 'LOGIN', 'LOGOUT'
]

// Valid entity types
const VALID_ENTITY_TYPES = [
  'PROJECT', 'TASK', 'FILE', 'MESSAGE', 'USER', 'ORGANIZATION', 'FEATURE'
]

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
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

    // Parse request body
    const activityData: ActivityLogRequest = await req.json()

    // Validate required fields
    if (!activityData.action || !activityData.entityType || !activityData.entityId || !activityData.entityName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: action, entityType, entityId, entityName' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate action and entity type
    if (!VALID_ACTIONS.includes(activityData.action)) {
      return new Response(
        JSON.stringify({ error: `Invalid action: ${activityData.action}` }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!VALID_ENTITY_TYPES.includes(activityData.entityType)) {
      return new Response(
        JSON.stringify({ error: `Invalid entity type: ${activityData.entityType}` }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Role-based access control for activity logging
    const userRole = userData.role
    const userName = userData.name || user.email

    // Only allow logging for entities the user has access to
    if (userRole === 'client') {
      // Clients can only log activities for projects they're assigned to
      if (activityData.projectId) {
        const { data: projectAccess } = await supabase
          .from('projects')
          .select('id')
          .eq('id', activityData.projectId)
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

      // Clients cannot log certain administrative actions
      const restrictedActions = [
        'USER_CREATED', 'USER_ROLE_CHANGED', 'ORGANIZATION_CREATED', 
        'ORGANIZATION_UPDATED', 'FEATURE_TOGGLED'
      ]
      if (restrictedActions.includes(activityData.action)) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions for this action' }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Determine the description based on action and entity
    let description = ''
    switch (activityData.action) {
      case 'PROJECT_CREATED':
        description = `Created project "${activityData.entityName}"`
        break
      case 'PROJECT_UPDATED':
        description = `Updated project "${activityData.entityName}"`
        break
      case 'TASK_CREATED':
        description = `Created task "${activityData.entityName}"`
        break
      case 'TASK_STATUS_CHANGED':
        description = `Changed status of task "${activityData.entityName}"`
        break
      case 'FILE_UPLOADED':
        description = `Uploaded file "${activityData.entityName}"`
        break
      case 'MESSAGE_SENT':
        description = `Sent message: "${activityData.entityName}"`
        break
      case 'FEATURE_TOGGLED':
        description = `Toggled feature "${activityData.entityName}"`
        break
      default:
        description = `${activityData.action.toLowerCase().replace(/_/g, ' ')} ${activityData.entityName}`
    }

    // Create the activity log entry
    const { data: activityLog, error: logError } = await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        user_role: userRole,
        user_name: userName,
        action: activityData.action,
        description: description,
        entity_type: activityData.entityType,
        entity_id: activityData.entityId,
        entity_name: activityData.entityName,
        project_id: activityData.projectId || null,
        task_id: activityData.taskId || null,
        organization_id: activityData.organizationId || null,
        metadata: activityData.metadata || null,
        old_values: activityData.oldValues || null,
        new_values: activityData.newValues || null
      })
      .select()
      .single()

    if (logError) {
      console.error('Activity log creation error:', logError)
      return new Response(
        JSON.stringify({ error: 'Failed to create activity log' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // For certain high-priority actions, also trigger real-time notifications
    if (['TASK_STATUS_CHANGED', 'MESSAGE_SENT', 'FILE_UPLOADED'].includes(activityData.action)) {
      try {
        // Send real-time notification via Supabase Realtime
        const channel = activityData.projectId ? `project:${activityData.projectId}` : 
                       activityData.taskId ? `task:${activityData.taskId}` : 
                       'global'
        
        // This would require Supabase Realtime configuration
        // For now, we'll just log that we would send a notification
        console.log(`Would send real-time notification to channel: ${channel}`, {
          type: 'activity_log',
          data: activityLog
        })
      } catch (notificationError) {
        console.error('Failed to send real-time notification:', notificationError)
        // Don't fail the request if notification fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        activityLog,
        message: 'Activity logged successfully'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

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