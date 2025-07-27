-- Migration 006: Add Support Chat Tables
-- This migration adds tables and columns needed for the support chat feature

-- Add columns to messages table for support chat functionality
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS conversation_id UUID,
ADD COLUMN IF NOT EXISTS is_internal_note BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;

-- Create enums for type safety
-- Check and create conversation_status enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_status') THEN
    CREATE TYPE conversation_status AS ENUM ('active', 'resolved');
  END IF;
END
$$;

-- Check and create conversation_priority enum  
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_priority') THEN
    CREATE TYPE conversation_priority AS ENUM ('high', 'normal', 'low');
  END IF;
END
$$;

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status conversation_status DEFAULT 'active',
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  priority conversation_priority DEFAULT 'normal',
  last_message_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_to ON conversations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at);

-- Add foreign key constraint to messages table
ALTER TABLE messages
ADD CONSTRAINT fk_messages_conversation_id 
FOREIGN KEY (conversation_id) 
REFERENCES conversations(id) 
ON DELETE CASCADE;

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to conversations table
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a trigger to update last_message_at in conversations
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.conversation_id IS NOT NULL THEN
        UPDATE conversations 
        SET last_message_at = NOW() 
        WHERE id = NEW.conversation_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to messages table
CREATE TRIGGER update_conversation_last_message_at 
AFTER INSERT ON messages
FOR EACH ROW 
WHEN (NEW.conversation_id IS NOT NULL)
EXECUTE FUNCTION update_conversation_last_message();