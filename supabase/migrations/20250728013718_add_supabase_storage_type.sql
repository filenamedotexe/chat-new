-- Add 'supabase' to the storage_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'supabase' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'storage_type')) THEN
        ALTER TYPE storage_type ADD VALUE 'supabase';
    END IF;
END $$;