import { db } from '@chat/database';
import { tasks, projects } from '@chat/database';
import { eq, and, count, sql } from 'drizzle-orm';
import type { TaskStatus } from '@/features/tasks/data/tasks';

// Progress calculation utilities for projects

export interface ProjectProgress {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  needsReviewTasks: number;
  progressPercentage: number;
  isComplete: boolean;
}

export interface TaskTypeRules {
  type: string;
  weight: number; // Weight for different task types if needed
  requiredForCompletion: boolean;
}

// Default task type rules - can be extended in the future
export const DEFAULT_TASK_RULES: TaskTypeRules[] = [
  {
    type: 'default',
    weight: 1,
    requiredForCompletion: true
  }
];

/**
 * Calculate progress for a single project based on its tasks
 */
export async function calculateProjectProgress(projectId: string): Promise<ProjectProgress> {
  // Get all tasks for the project
  const projectTasks = await db
    .select({
      status: tasks.status,
      count: count()
    })
    .from(tasks)
    .where(eq(tasks.projectId, projectId))
    .groupBy(tasks.status);

  // Initialize counters
  let totalTasks = 0;
  let completedTasks = 0;
  let inProgressTasks = 0;
  let notStartedTasks = 0;
  let needsReviewTasks = 0;

  // Count tasks by status
  projectTasks.forEach(row => {
    const taskCount = Number(row.count);
    totalTasks += taskCount;

    switch (row.status) {
      case 'done':
        completedTasks += taskCount;
        break;
      case 'in_progress':
        inProgressTasks += taskCount;
        break;
      case 'not_started':
        notStartedTasks += taskCount;
        break;
      case 'needs_review':
        needsReviewTasks += taskCount;
        break;
    }
  });

  // Calculate percentage
  const progressPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  // Project is complete when all tasks are done
  const isComplete = totalTasks > 0 && completedTasks === totalTasks;

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    notStartedTasks,
    needsReviewTasks,
    progressPercentage,
    isComplete
  };
}

/**
 * Calculate weighted progress if tasks have different weights
 * This can be extended to support different task types with different importance
 */
export async function calculateWeightedProgress(
  projectId: string,
  taskRules: TaskTypeRules[] = DEFAULT_TASK_RULES
): Promise<ProjectProgress> {
  // For now, use simple progress calculation
  // This can be extended to support weighted calculations based on task type
  return calculateProjectProgress(projectId);
}

/**
 * Get progress for multiple projects at once (efficient batch query)
 */
export async function calculateMultipleProjectsProgress(
  projectIds: string[]
): Promise<Map<string, ProjectProgress>> {
  if (projectIds.length === 0) {
    return new Map();
  }

  // Get task counts for all projects in one query
  const taskCounts = await db
    .select({
      projectId: tasks.projectId,
      status: tasks.status,
      count: count()
    })
    .from(tasks)
    .where(sql`${tasks.projectId} IN ${projectIds}`)
    .groupBy(tasks.projectId, tasks.status);

  // Group by project and calculate progress
  const progressMap = new Map<string, ProjectProgress>();

  // Initialize all projects with zero counts
  projectIds.forEach(projectId => {
    progressMap.set(projectId, {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      notStartedTasks: 0,
      needsReviewTasks: 0,
      progressPercentage: 0,
      isComplete: false
    });
  });

  // Update counts based on query results
  taskCounts.forEach(row => {
    const progress = progressMap.get(row.projectId)!;
    const taskCount = Number(row.count);
    
    progress.totalTasks += taskCount;

    switch (row.status) {
      case 'done':
        progress.completedTasks += taskCount;
        break;
      case 'in_progress':
        progress.inProgressTasks += taskCount;
        break;
      case 'not_started':
        progress.notStartedTasks += taskCount;
        break;
      case 'needs_review':
        progress.needsReviewTasks += taskCount;
        break;
    }
  });

  // Calculate percentages and completion status
  progressMap.forEach((progress, projectId) => {
    progress.progressPercentage = progress.totalTasks > 0
      ? Math.round((progress.completedTasks / progress.totalTasks) * 100)
      : 0;
    
    progress.isComplete = progress.totalTasks > 0 && 
      progress.completedTasks === progress.totalTasks;
  });

  return progressMap;
}

/**
 * Determine if a project has stalled (no progress in X days)
 */
export async function isProjectStalled(
  projectId: string, 
  stalledThresholdDays: number = 7
): Promise<boolean> {
  const recentActivity = await db
    .select({
      count: count()
    })
    .from(tasks)
    .where(
      and(
        eq(tasks.projectId, projectId),
        sql`${tasks.updatedAt} > NOW() - INTERVAL '${stalledThresholdDays} days'`
      )
    );

  return Number(recentActivity[0]?.count || 0) === 0;
}

/**
 * Get completion rules for display in UI
 */
export function getCompletionRules(): string[] {
  return [
    'All tasks must be marked as "Done" for the project to be complete',
    'Tasks in "Needs Review" status are not considered complete',
    'Progress percentage is based on the ratio of completed tasks to total tasks',
    'Projects with no tasks show 0% progress'
  ];
}