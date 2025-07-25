import type { ClientStatus } from '../types/status';

export type ClientHealthStatus = 'active' | 'at-risk' | 'inactive';

export interface StatusMetrics {
  projectCompletionRate: number;
  taskCompletionRate: number;
  averageResponseTime: number; // in hours
  daysSinceLastActivity: number;
  overdueTasksCount: number;
  upcomingDeadlinesCount: number;
  totalActiveProjects: number;
  totalActiveTasks: number;
}

export interface StatusRules {
  inactive: {
    daysSinceLastActivity: number;
  };
  atRisk: {
    projectCompletionRate: number;
    overdueTasksRatio: number;
    daysSinceLastActivity: number;
  };
  active: {
    // If none of the above conditions are met
  };
}

// Default status calculation rules
export const DEFAULT_STATUS_RULES: StatusRules = {
  inactive: {
    daysSinceLastActivity: 30, // 30+ days = inactive
  },
  atRisk: {
    projectCompletionRate: 0.3, // Less than 30% completion
    overdueTasksRatio: 0.2, // More than 20% overdue tasks
    daysSinceLastActivity: 14, // 14+ days without activity
  },
  active: {},
};

/**
 * Calculate client health status based on various metrics
 */
export function calculateClientStatus(
  metrics: StatusMetrics,
  rules: StatusRules = DEFAULT_STATUS_RULES
): ClientHealthStatus {
  const {
    projectCompletionRate,
    daysSinceLastActivity,
    overdueTasksCount,
    totalActiveTasks,
  } = metrics;

  // Check for inactive status first (most severe)
  if (daysSinceLastActivity >= rules.inactive.daysSinceLastActivity) {
    return 'inactive';
  }

  // Check for at-risk status
  const overdueTasksRatio = totalActiveTasks > 0 ? overdueTasksCount / totalActiveTasks : 0;
  
  const isAtRisk = 
    projectCompletionRate < rules.atRisk.projectCompletionRate ||
    overdueTasksRatio > rules.atRisk.overdueTasksRatio ||
    daysSinceLastActivity >= rules.atRisk.daysSinceLastActivity;

  if (isAtRisk) {
    return 'at-risk';
  }

  // Default to active
  return 'active';
}

/**
 * Calculate comprehensive metrics for a client
 */
export function calculateClientMetrics(clientData: {
  totalProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  upcomingDeadlines: number;
  lastActivityDate: Date;
}): StatusMetrics {
  const {
    totalProjects,
    completedProjects,
    totalTasks,
    completedTasks,
    overdueTasks,
    upcomingDeadlines,
    lastActivityDate,
  } = clientData;

  const now = new Date();
  const daysSinceLastActivity = Math.floor(
    (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    projectCompletionRate: totalProjects > 0 ? completedProjects / totalProjects : 0,
    taskCompletionRate: totalTasks > 0 ? completedTasks / totalTasks : 0,
    averageResponseTime: 0, // TODO: Implement based on message response times
    daysSinceLastActivity,
    overdueTasksCount: overdueTasks,
    upcomingDeadlinesCount: upcomingDeadlines,
    totalActiveProjects: totalProjects - completedProjects,
    totalActiveTasks: totalTasks - completedTasks,
  };
}

/**
 * Get status color class for UI components
 */
export function getStatusColor(status: ClientHealthStatus): string {
  switch (status) {
    case 'active':
      return 'text-green-600 dark:text-green-400';
    case 'at-risk':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'inactive':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

/**
 * Get status background color class for badges
 */
export function getStatusBgColor(status: ClientHealthStatus): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'at-risk':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'inactive':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}

/**
 * Get status description for tooltips and legends
 */
export function getStatusDescription(status: ClientHealthStatus): string {
  switch (status) {
    case 'active':
      return 'Client is actively engaged with good project progress and recent activity.';
    case 'at-risk':
      return 'Client may need attention due to low progress, overdue tasks, or inactivity.';
    case 'inactive':
      return 'Client has been inactive for an extended period and may require follow-up.';
    default:
      return 'Status unknown.';
  }
}

/**
 * Get status priority for sorting (lower number = higher priority)
 */
export function getStatusPriority(status: ClientHealthStatus): number {
  switch (status) {
    case 'at-risk':
      return 0; // Highest priority
    case 'inactive':
      return 1;
    case 'active':
      return 2; // Lowest priority
    default:
      return 3;
  }
}