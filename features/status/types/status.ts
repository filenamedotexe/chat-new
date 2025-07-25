export type ClientHealthStatus = 'active' | 'at-risk' | 'inactive';

export interface ClientStatus {
  id: string;
  name: string;
  email: string;
  status: ClientHealthStatus;
  activeProjects: number;
  totalProjects: number;
  completedTasks: number;
  totalTasks: number;
  lastActivity: Date;
  upcomingDeadlines: number;
  overdueItems: number;
  metrics?: {
    projectCompletionRate: number;
    taskCompletionRate: number;
    daysSinceLastActivity: number;
    overdueTasksRatio: number;
  };
}

export interface OrganizationStatus {
  id: string;
  name: string;
  type: 'client' | 'internal' | 'partner';
  status: ClientHealthStatus;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  lastActivity: Date;
  contactEmail: string;
  primaryContact?: {
    name: string;
    email: string;
  };
}

export interface StatusSummary {
  active: number;
  atRisk: number;
  inactive: number;
  total: number;
}

export interface StatusTrend {
  period: 'week' | 'month' | 'quarter';
  current: StatusSummary;
  previous: StatusSummary;
  change: {
    active: number;
    atRisk: number;
    inactive: number;
  };
}

export interface StatusAlert {
  id: string;
  type: 'client_at_risk' | 'client_inactive' | 'overdue_tasks' | 'missed_deadline';
  severity: 'low' | 'medium' | 'high' | 'critical';
  clientId: string;
  clientName: string;
  message: string;
  actionRequired: string;
  createdAt: Date;
  acknowledged: boolean;
}