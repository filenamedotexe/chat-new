import { db } from '@chat/database';
import { projects, organizations, organizationMembers, tasks, files } from '@chat/database';
import { eq, and, desc, inArray, sql, count } from 'drizzle-orm';
import type { UserRole } from '@chat/shared-types';
import { calculateMultipleProjectsProgress, calculateProjectProgress, type ProjectProgress } from '@/features/progress/lib/calculate-progress';

export interface CreateProjectInput {
  organizationId: string;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

// Create a new project
export async function createProject(input: CreateProjectInput) {
  const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  const [project] = await db
    .insert(projects)
    .values({
      ...input,
      slug,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
    })
    .returning();
    
  return project;
}

// Get all projects (with client scoping)
export async function getProjects(userId: string, userRole: UserRole) {
  // Admins and team members see all projects
  if (userRole === 'admin' || userRole === 'team_member') {
    return await db
      .select({
        project: projects,
        organization: organizations,
      })
      .from(projects)
      .leftJoin(organizations, eq(projects.organizationId, organizations.id))
      .orderBy(desc(projects.createdAt));
  }
  
  // Clients only see projects for their organizations
  const userOrgs = await db
    .select({ organizationId: organizationMembers.organizationId })
    .from(organizationMembers)
    .where(eq(organizationMembers.userId, userId));
    
  const orgIds = userOrgs.map(o => o.organizationId);
  
  if (orgIds.length === 0) {
    return [];
  }
  
  return await db
    .select({
      project: projects,
      organization: organizations,
    })
    .from(projects)
    .leftJoin(organizations, eq(projects.organizationId, organizations.id))
    .where(
      orgIds.length === 1 
        ? eq(projects.organizationId, orgIds[0])
        : inArray(projects.organizationId, orgIds)
    )
    .orderBy(desc(projects.createdAt));
}

// Get a single project by ID (with access check)
export async function getProjectById(projectId: string, userId: string, userRole: UserRole) {
  try {
    const [result] = await db
      .select({
        project: projects,
        organization: organizations,
      })
      .from(projects)
      .leftJoin(organizations, eq(projects.organizationId, organizations.id))
      .where(eq(projects.id, projectId))
      .limit(1);
    
  if (!result) {
    return null;
  }
  
  // Check access for clients
  if (userRole === 'client') {
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
      return null; // No access
    }
  }
  
  return result;
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

// Update a project
export async function updateProject(projectId: string, input: UpdateProjectInput) {
  const [updated] = await db
    .update(projects)
    .set({
      ...input,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))
    .returning();
    
  return updated;
}

// Delete a project (soft delete by setting status)
export async function deleteProject(projectId: string) {
  const [deleted] = await db
    .update(projects)
    .set({
      status: 'archived',
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))
    .returning();
    
  return deleted;
}

// Get projects for a specific organization
export async function getProjectsByOrganization(organizationId: string) {
  return await db
    .select({
      project: projects,
      organization: organizations,
    })
    .from(projects)
    .leftJoin(organizations, eq(projects.organizationId, organizations.id))
    .where(eq(projects.organizationId, organizationId))
    .orderBy(desc(projects.createdAt));
}

// Get projects with task and file counts
export async function getProjectsWithStats(userId: string, userRole: UserRole) {
  // Get base projects first
  const baseProjects = await getProjects(userId, userRole);
  
  // Get task counts for all projects
  const projectIds = baseProjects.map(p => p.project.id);
  
  if (projectIds.length === 0) {
    return baseProjects.map(p => ({
      ...p,
      taskCount: 0,
      completedTaskCount: 0,
      fileCount: 0
    }));
  }
  
  // Get task counts
  const taskStats = await db
    .select({
      projectId: tasks.projectId,
      totalCount: count(tasks.id),
      completedCount: sql<number>`COUNT(CASE WHEN ${tasks.status} = 'done' THEN 1 END)`,
    })
    .from(tasks)
    .where(inArray(tasks.projectId, projectIds))
    .groupBy(tasks.projectId);
  
  // Get file counts (files associated with project tasks)
  const fileStats = await db
    .select({
      projectId: tasks.projectId,
      fileCount: count(files.id),
    })
    .from(files)
    .innerJoin(tasks, eq(files.taskId, tasks.id))
    .where(inArray(tasks.projectId, projectIds))
    .groupBy(tasks.projectId);
  
  // Create lookup maps
  const taskStatsMap = new Map(taskStats.map(ts => [ts.projectId, ts]));
  const fileStatsMap = new Map(fileStats.map(fs => [fs.projectId, fs.fileCount]));
  
  // Get progress data
  const progressMap = await calculateMultipleProjectsProgress(projectIds);
  
  // Combine data
  return baseProjects.map(p => {
    const progress = progressMap.get(p.project.id) || {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      notStartedTasks: 0,
      needsReviewTasks: 0,
      progressPercentage: 0,
      isComplete: false
    };
    
    return {
      ...p,
      taskCount: taskStatsMap.get(p.project.id)?.totalCount || 0,
      completedTaskCount: taskStatsMap.get(p.project.id)?.completedCount || 0,
      fileCount: fileStatsMap.get(p.project.id) || 0,
      progress
    };
  });
}

// Get a single project with progress data
export async function getProjectWithProgress(projectId: string, userId: string, userRole: UserRole) {
  const projectData = await getProjectById(projectId, userId, userRole);
  
  if (!projectData) {
    return null;
  }
  
  const progress = await calculateProjectProgress(projectId);
  
  return {
    ...projectData,
    progress
  };
}