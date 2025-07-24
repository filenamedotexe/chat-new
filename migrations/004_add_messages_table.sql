-- Drop existing messages table if it exists with wrong schema
DROP TABLE IF EXISTS messages CASCADE;

-- Create messages table for chat functionality
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'text',
  sender_id UUID NOT NULL REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  task_id UUID REFERENCES tasks(id),
  recipient_id UUID REFERENCES users(id),
  parent_message_id UUID REFERENCES messages(id),
  is_edited BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_messages_project_id ON messages(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_messages_task_id ON messages(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id) WHERE recipient_id IS NOT NULL;
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_deleted_at ON messages(deleted_at) WHERE deleted_at IS NULL;

-- Add check constraint to ensure message has a context (project, task, or recipient)
ALTER TABLE messages ADD CONSTRAINT chk_message_context 
  CHECK (project_id IS NOT NULL OR task_id IS NOT NULL OR recipient_id IS NOT NULL);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();