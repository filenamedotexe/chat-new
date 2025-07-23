import { db } from '@chat/database';
import { projects, organizations, organizationMembers } from '@chat/database';
import { eq, and, desc, inArray } from 'drizzle-orm';
import type { UserRole } from '@chat/shared-types';

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