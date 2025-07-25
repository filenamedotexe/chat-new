export interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  entityName?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: Date | string;
}