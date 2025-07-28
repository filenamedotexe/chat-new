import { createClient } from '@/lib/supabase/client'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`

/**
 * Upload files using Supabase Edge Function
 */
export async function uploadFilesEdgeFunction(
  files: File[],
  options: {
    projectId?: string
    taskId?: string
  } = {}
) {
  const supabase = createClient()
  
  // Get current session for auth token
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  // Convert files to base64 for Edge Function
  const fileData = await Promise.all(
    files.map(async (file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
      content: btoa(
        new Uint8Array(await file.arrayBuffer())
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      )
    }))
  )

  const response = await fetch(`${FUNCTIONS_URL}/handle-file-upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      files: fileData,
      projectId: options.projectId,
      taskId: options.taskId
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to upload files')
  }

  return response.json()
}

/**
 * Send message using Supabase Edge Function
 */
export async function sendMessageEdgeFunction(
  content: string,
  options: {
    projectId?: string
    taskId?: string
    recipientId?: string
    parentMessageId?: string
    type?: string
  } = {}
) {
  const supabase = createClient()
  
  // Get current session for auth token
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`${FUNCTIONS_URL}/handle-chat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content,
      ...options
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to send message')
  }

  return response.json()
}

/**
 * Get messages using Supabase Edge Function
 */
export async function getMessagesEdgeFunction(
  options: {
    projectId?: string
    taskId?: string
    recipientId?: string
    limit?: number
    offset?: number
  } = {}
) {
  const supabase = createClient()
  
  // Get current session for auth token
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const params = new URLSearchParams()
  if (options.projectId) params.append('projectId', options.projectId)
  if (options.taskId) params.append('taskId', options.taskId)
  if (options.recipientId) params.append('recipientId', options.recipientId)
  if (options.limit) params.append('limit', options.limit.toString())
  if (options.offset) params.append('offset', options.offset.toString())

  const response = await fetch(`${FUNCTIONS_URL}/handle-chat?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get messages')
  }

  return response.json()
}

/**
 * Log activity using Supabase Edge Function
 */
export async function logActivityEdgeFunction(
  action: string,
  entityType: string,
  entityId: string,
  entityName: string,
  options: {
    projectId?: string
    taskId?: string
    organizationId?: string
    metadata?: Record<string, unknown>
    oldValues?: Record<string, unknown>
    newValues?: Record<string, unknown>
  } = {}
) {
  const supabase = createClient()
  
  // Get current session for auth token
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`${FUNCTIONS_URL}/log-activity`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action,
      entityType,
      entityId,
      entityName,
      ...options
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to log activity')
  }

  return response.json()
}

/**
 * Test Edge Function connectivity
 */
export async function testEdgeFunctions() {
  const supabase = createClient()
  
  // Get current session for auth token
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const tests = []

  // Test file upload function (without actually uploading)
  try {
    const response = await fetch(`${FUNCTIONS_URL}/handle-file-upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ files: [] })
    })
    tests.push({
      function: 'handle-file-upload',
      status: response.status,
      accessible: true
    })
  } catch (error) {
    tests.push({
      function: 'handle-file-upload',
      status: 'error',
      accessible: false,
      error: error instanceof Error ? error.message : String(error)
    })
  }

  // Test chat function
  try {
    const response = await fetch(`${FUNCTIONS_URL}/handle-chat`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    })
    tests.push({
      function: 'handle-chat',
      status: response.status,
      accessible: true
    })
  } catch (error) {
    tests.push({
      function: 'handle-chat',
      status: 'error',
      accessible: false,
      error: error instanceof Error ? error.message : String(error)
    })
  }

  // Test activity logging function
  try {
    const response = await fetch(`${FUNCTIONS_URL}/log-activity`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'TEST',
        entityType: 'TEST',
        entityId: 'test',
        entityName: 'test'
      })
    })
    tests.push({
      function: 'log-activity',
      status: response.status,
      accessible: true
    })
  } catch (error) {
    tests.push({
      function: 'log-activity',
      status: 'error',
      accessible: false,
      error: error instanceof Error ? error.message : String(error)
    })
  }

  return tests
}