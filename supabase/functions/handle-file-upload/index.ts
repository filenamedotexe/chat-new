import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface FileUploadRequest {
  files: Array<{
    name: string
    type: string
    size: number
    content: string // base64 encoded
  }>
  projectId?: string
  taskId?: string
}

interface ValidationResult {
  isValid: boolean
  error?: string
  warnings?: string[]
}

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain', 'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip', 'application/x-zip-compressed',
  'text/javascript', 'text/typescript', 'text/html', 'text/css'
]

function validateFile(file: { name: string; type: string; size: number }): ValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File ${file.name} is too large. Maximum size is 10MB.`
    }
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed for ${file.name}.`
    }
  }

  // Check file name
  if (file.name.length > 255) {
    return {
      isValid: false,
      error: `File name ${file.name} is too long. Maximum length is 255 characters.`
    }
  }

  // Security checks
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com']
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  if (dangerousExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `File type ${extension} is not allowed for security reasons.`
    }
  }

  return { isValid: true }
}

function getFileType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf') return 'document'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation'
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'archive'
  if (mimeType.includes('javascript') || mimeType.includes('typescript') || 
      mimeType.includes('html') || mimeType.includes('css')) return 'code'
  if (mimeType.startsWith('text/')) return 'text'
  return 'other'
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

    // Check user role - only admin and team_member can upload files
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
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

    if (userData.role === 'client') {
      return new Response(
        JSON.stringify({ error: 'Clients cannot upload files' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    const requestData: FileUploadRequest = await req.json()
    
    if (!requestData.files || requestData.files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No files provided' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const uploadedFiles = []
    const errors = []

    // Process each file
    for (const file of requestData.files) {
      try {
        // Validate file
        const validation = validateFile(file)
        if (!validation.isValid) {
          errors.push({
            fileName: file.name,
            error: validation.error
          })
          continue
        }

        // Convert base64 to buffer
        const fileBuffer = new Uint8Array(
          atob(file.content)
            .split('')
            .map(char => char.charCodeAt(0))
        )

        // Generate unique file path
        const fileExt = file.name.substring(file.name.lastIndexOf('.'))
        const fileName = `${crypto.randomUUID()}${fileExt}`
        const filePath = `user-uploads/${user.id}/${fileName}`

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user-uploads')
          .upload(filePath, fileBuffer, {
            contentType: file.type,
            upsert: false
          })

        if (uploadError) {
          console.error('Storage upload error:', uploadError)
          errors.push({
            fileName: file.name,
            error: 'Failed to upload to storage'
          })
          continue
        }

        // Create file record in database
        const { data: fileRecord, error: dbError } = await supabase
          .from('files')
          .insert({
            original_name: file.name,
            file_path: uploadData.path,
            storage_path: uploadData.path,
            storage_type: 'supabase',
            file_size: file.size,
            file_type: getFileType(file.type),
            mime_type: file.type,
            uploaded_by_id: user.id,
            project_id: requestData.projectId || null,
            task_id: requestData.taskId || null
          })
          .select()
          .single()

        if (dbError) {
          console.error('Database insert error:', dbError)
          // Try to clean up the uploaded file
          await supabase.storage
            .from('user-uploads')
            .remove([uploadData.path])
          
          errors.push({
            fileName: file.name,
            error: 'Failed to create file record'
          })
          continue
        }

        // Log activity
        try {
          await supabase
            .from('activity_logs')
            .insert({
              user_id: user.id,
              user_role: userData.role,
              user_name: user.user_metadata?.name || user.email,
              action: 'FILE_UPLOADED',
              entity_type: 'FILE',
              entity_id: fileRecord.id,
              entity_name: fileRecord.original_name,
              project_id: requestData.projectId || null,
              task_id: requestData.taskId || null,
              metadata: {
                fileSize: fileRecord.file_size,
                fileType: fileRecord.file_type,
                mimeType: fileRecord.mime_type
              }
            })
        } catch (logError) {
          console.error('Failed to log activity:', logError)
          // Don't fail the request if logging fails
        }

        uploadedFiles.push({
          ...fileRecord,
          warnings: validation.warnings
        })

      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        errors.push({
          fileName: file.name,
          error: 'Processing failed'
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        uploadedFiles,
        errors: errors.length > 0 ? errors : undefined,
        message: `${uploadedFiles.length} file(s) uploaded successfully${
          errors.length > 0 ? `, ${errors.length} failed` : ''
        }`
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