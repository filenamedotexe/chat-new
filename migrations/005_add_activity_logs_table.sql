-- Activity logs table for audit trail
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Actor information
  user_id UUID NOT NULL REFERENCES users(id),
  user_role TEXT NOT NULL,
  user_name TEXT,
  
  -- Action details
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  entity_name TEXT,
  
  -- Optional relations for context
  project_id UUID REFERENCES projects(id),
  task_id UUID REFERENCES tasks(id),
  organization_id UUID,
  
  -- Change details
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for efficient querying
CREATE INDEX activity_logs_user_id_idx ON activity_logs(user_id);
CREATE INDEX activity_logs_entity_idx ON activity_logs(entity_type, entity_id);
CREATE INDEX activity_logs_project_id_idx ON activity_logs(project_id);
CREATE INDEX activity_logs_created_at_idx ON activity_logs(created_at);
CREATE INDEX activity_logs_action_idx ON activity_logs(action);

-- Add comment
COMMENT ON TABLE activity_logs IS 'Audit trail of all major actions in the system';