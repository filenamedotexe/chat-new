-- Create file type enum
CREATE TYPE file_type AS ENUM ('image', 'document', 'spreadsheet', 'presentation', 'archive', 'code', 'other');

-- Create storage type enum
CREATE TYPE storage_type AS ENUM ('local', 's3', 'gcs');

-- Create files table
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    file_type file_type NOT NULL DEFAULT 'other',
    file_size BIGINT NOT NULL,
    storage_type storage_type NOT NULL DEFAULT 'local',
    file_path TEXT NOT NULL,
    s3_key VARCHAR(255),
    s3_bucket VARCHAR(255),
    s3_url TEXT,
    thumbnail_url TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    uploaded_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    -- Ensure at least one association exists
    CONSTRAINT files_association_check CHECK (
        project_id IS NOT NULL OR task_id IS NOT NULL OR uploaded_by_id IS NOT NULL
    )
);

-- Create indexes for performance
CREATE INDEX idx_files_project_id ON files(project_id);
CREATE INDEX idx_files_task_id ON files(task_id);
CREATE INDEX idx_files_uploaded_by_id ON files(uploaded_by_id);
CREATE INDEX idx_files_created_at ON files(created_at DESC);
CREATE INDEX idx_files_deleted_at ON files(deleted_at);
CREATE INDEX idx_files_file_type ON files(file_type);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();