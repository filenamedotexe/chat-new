-- Migration 007: Fix message constraint to allow conversation_id
-- This updates the check constraint to include conversation_id as a valid context

-- Drop the existing constraint
ALTER TABLE messages DROP CONSTRAINT IF EXISTS chk_message_context;

-- Add updated constraint that includes conversation_id
ALTER TABLE messages ADD CONSTRAINT chk_message_context 
CHECK (
  project_id IS NOT NULL OR 
  task_id IS NOT NULL OR 
  recipient_id IS NOT NULL OR 
  conversation_id IS NOT NULL
);