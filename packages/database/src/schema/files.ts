import { pgTable, text, timestamp, uuid, integer, pgEnum } from 'drizzle-orm/pg-core';
import { projects } from './organizations';
import { users } from './auth';
import { tasks } from './tasks';

// File type enum for categorization
export const fileType = pgEnum('file_type', [
  'image', 
  'document', 
  'spreadsheet', 
  'presentation', 
  'archive', 
  'code', 
  'other'
]);

// File storage type enum
export const storageType = pgEnum('storage_type', ['local', 's3', 'gcs']);

export const files = pgTable('files', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // File metadata
  originalName: text('original_name').notNull(),
  fileName: text('file_name').notNull(),
  mimeType: text('mime_type').notNull(),
  fileType: fileType('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  
  // Storage information
  storageType: storageType('storage_type').notNull().default('local'),
  filePath: text('file_path').notNull(), // Local path or web URL
  
  // S3 fields (optional, for future use)
  s3Key: text('s3_key'),
  s3Bucket: text('s3_bucket'),
  s3Url: text('s3_url'),
  thumbnailUrl: text('thumbnail_url'),
  
  // Associations (both optional - can be standalone files)
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' }),
  taskId: uuid('task_id')
    .references(() => tasks.id, { onDelete: 'cascade' }),
  
  // Upload tracking
  uploadedById: uuid('uploaded_by_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  
  // Audit fields
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // Soft delete
});