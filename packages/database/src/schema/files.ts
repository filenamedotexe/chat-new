import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { projects } from './organizations';
import { users } from './auth';
import { tasks } from './tasks';

export const files = pgTable('files', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  taskId: uuid('task_id')
    .references(() => tasks.id, { onDelete: 'cascade' }),
  uploadedById: uuid('uploaded_by_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  fileName: text('file_name').notNull(),
  filePath: text('file_path').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  s3Key: text('s3_key'),
  s3Bucket: text('s3_bucket'),
  s3Url: text('s3_url'),
  thumbnailUrl: text('thumbnail_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});