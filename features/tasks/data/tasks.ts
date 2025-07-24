import { db } from '@chat/database';
import { tasks, projects, users, files } from '@chat/database';
import { eq, and, desc, or, lt, not, inArray, count, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { UserRole } from '@chat/shared-types';

export type TaskStatus = 'not_started' | 'in_progress' | 'needs_review' | 'done';

// Task status transitions
export const TASK_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  not_started: ['in_progress'],
  in_progress: ['needs_review', 'not_started'],
  needs_review: ['done', 'in_progress'],
  done: ['needs_review'], // Allow reopening
};

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  assignedToId?: string;
  createdById: string;
  dueDate?: Date;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  assignedToId?: string | null;
  dueDate?: Date | null;
}

// Create a new task
export async function createTask(input: CreateTaskInput) {
  const [task] = await db
    .insert(tasks)
    .values({
      ...input,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    })
    .returning();
    
  return task;
}

// Get all tasks for a project (with access check)
export async function getTasksByProject(projectId: string, userId: string, userRole: UserRole) {
  // First check if user has access to the project
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
    
  if (!project) {
    throw new Error('Project not found');
  }
  
  // For clients, verify they have access through organization membership
  if (userRole === 'client') {
    const { organizationMembers } = await import('@chat/database');
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.organizationId, project.organizationId)
        )
      )
      .limit(1);
      
    if (!membership) {
      throw new Error('Access denied');
    }
  }
  
  // Get tasks with assignee info and file counts
  const fileCountSubquery = db
    .select({ 
      taskId: files.taskId,
      fileCount: count(files.id).as('fileCount')
    })
    .from(files)
    .groupBy(files.taskId)
    .as('fileCounts');

  const assigneeUser = alias(users, 'assigneeUser');
  const createdByUser = alias(users, 'createdByUser');

  return await db
    .select({
      task: tasks,
      assignee: {
        id: assigneeUser.id,
        name: assigneeUser.name,
        email: assigneeUser.email,
      },
      createdBy: {
        id: createdByUser.id,
        name: createdByUser.name,
        email: createdByUser.email,
      },
      fileCount: sql<number>`COALESCE(${fileCountSubquery.fileCount}, 0)`,
    })
    .from(tasks)
    .leftJoin(assigneeUser, eq(tasks.assignedToId, assigneeUser.id))
    .leftJoin(createdByUser, eq(tasks.createdById, createdByUser.id))
    .leftJoin(fileCountSubquery, eq(tasks.id, fileCountSubquery.taskId))
    .where(eq(tasks.projectId, projectId))
    .orderBy(desc(tasks.createdAt));
}

// Get a single task by ID with access check
export async function getTaskById(taskId: string, userId: string, userRole: UserRole) {
  const fileCountSubquery = db
    .select({ 
      taskId: files.taskId,
      fileCount: count(files.id).as('fileCount')
    })
    .from(files)
    .where(eq(files.taskId, taskId))
    .groupBy(files.taskId)
    .as('fileCounts');

  const assigneeUser = alias(users, 'assigneeUser');
  const createdByUser = alias(users, 'createdByUser');
  
  const [result] = await db
    .select({
      task: tasks,
      project: projects,
      assignee: assigneeUser,
      createdBy: createdByUser,
      fileCount: sql<number>`COALESCE(${fileCountSubquery.fileCount}, 0)`,
    })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .leftJoin(assigneeUser, eq(tasks.assignedToId, assigneeUser.id))
    .leftJoin(createdByUser, eq(tasks.createdById, createdByUser.id))
    .leftJoin(fileCountSubquery, eq(tasks.id, fileCountSubquery.taskId))
    .where(eq(tasks.id, taskId))
    .limit(1);
    
  if (!result) {
    return null;
  }
  
  // For clients, verify they have access through organization membership
  if (userRole === 'client' && result.project) {
    const { organizationMembers } = await import('@chat/database');
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.organizationId, result.project.organizationId)
        )
      )
      .limit(1);
      
    if (!membership) {
      return null;
    }
  }
    
  return result;
}

// Update a task
export async function updateTask(taskId: string, input: UpdateTaskInput) {
  // If status is being updated, validate the transition
  if (input.status) {
    const [currentTask] = await db
      .select({ status: tasks.status })
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);
      
    if (currentTask) {
      const allowedTransitions = TASK_STATUS_TRANSITIONS[currentTask.status];
      if (!allowedTransitions.includes(input.status as any)) {
        throw new Error(`Invalid status transition from ${currentTask.status} to ${input.status}`);
      }
    }
  }
  
  const updateData: any = {
    ...input,
    updatedAt: new Date(),
  };
  
  // Set completedAt when marking as done
  if (input.status === 'done') {
    updateData.completedAt = new Date();
  } else if (input.status) {
    updateData.completedAt = null;
  }
  
  const [updated] = await db
    .update(tasks)
    .set(updateData)
    .where(eq(tasks.id, taskId))
    .returning();
    
  return updated;
}

// Update task status specifically
export async function updateTaskStatus(taskId: string, status: TaskStatus, userId: string, userRole: UserRole) {
  // First check if user has access to this task
  const task = await getTaskById(taskId, userId, userRole);
  
  if (!task) {
    return null;
  }
  
  // Validate the transition
  const currentStatus = task.task.status;
  const allowedTransitions = TASK_STATUS_TRANSITIONS[currentStatus];
  
  if (!allowedTransitions.includes(status as any)) {
    throw new Error(`Invalid status transition from ${currentStatus} to ${status}`);
  }
  
  const updateData: any = {
    status,
    updatedAt: new Date(),
  };
  
  // Set completedAt when marking as done
  if (status === 'done') {
    updateData.completedAt = new Date();
  } else {
    updateData.completedAt = null;
  }
  
  const [updated] = await db
    .update(tasks)
    .set(updateData)
    .where(eq(tasks.id, taskId))
    .returning();
    
  return updated;
}

// Delete a task
export async function deleteTask(taskId: string) {
  const [deleted] = await db
    .delete(tasks)
    .where(eq(tasks.id, taskId))
    .returning();
    
  return deleted;
}

// Get tasks assigned to a user
export async function getTasksByAssignee(userId: string) {
  return await db
    .select({
      task: tasks,
      project: projects,
    })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .where(eq(tasks.assignedToId, userId))
    .orderBy(desc(tasks.dueDate));
}

// Get overdue tasks
export async function getOverdueTasks(userId: string, userRole: UserRole) {
  const now = new Date();
  
  let whereConditions = [
    lt(tasks.dueDate, now),
    not(eq(tasks.status, 'done'))
  ];
  
  // Filter by user's accessible projects for clients
  if (userRole === 'client') {
    const { organizationMembers } = await import('@chat/database');
    const userOrgs = await db
      .select({ organizationId: organizationMembers.organizationId })
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, userId));
      
    const orgIds = userOrgs.map(o => o.organizationId);
    if (orgIds.length > 0) {
      whereConditions.push(inArray(projects.organizationId, orgIds));
    }
  }
  
  return await db
    .select({
      task: tasks,
      project: projects,
      assignee: users,
    })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .leftJoin(users, eq(tasks.assignedToId, users.id))
    .where(and(...whereConditions))
    .orderBy(tasks.dueDate);
}

// Get all tasks for a user (either assigned to them or in their accessible projects)
export async function getAllUserTasks(userId: string, userRole: UserRole) {
  const assignee = alias(users, 'assignee');
  
  // Base query for all roles
  let query = db
    .select({
      task: tasks,
      project: projects,
      assignee: {
        id: assignee.id,
        name: assignee.name,
        email: assignee.email,
      },
      fileCount: count(files.id),
    })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .leftJoin(assignee, eq(tasks.assignedToId, assignee.id))
    .leftJoin(files, eq(files.taskId, tasks.id))
    .groupBy(tasks.id, projects.id, assignee.id, assignee.name, assignee.email);

  if (userRole === 'admin') {
    // Admins see all tasks
    return await query.orderBy(desc(tasks.createdAt));
  } else if (userRole === 'team_member') {
    // Team members see tasks assigned to them or created by them
    return await query
      .where(
        or(
          eq(tasks.assignedToId, userId),
          eq(tasks.createdById, userId)
        )
      )
      .orderBy(desc(tasks.createdAt));
  } else {
    // Clients see tasks in their organization's projects
    const { organizationMembers } = await import('@chat/database');
    const userOrgs = await db
      .select({ organizationId: organizationMembers.organizationId })
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, userId));
      
    const orgIds = userOrgs.map(o => o.organizationId);
    if (orgIds.length === 0) {
      return [];
    }
    
    return await query
      .where(inArray(projects.organizationId, orgIds))
      .orderBy(desc(tasks.createdAt));
  }
}