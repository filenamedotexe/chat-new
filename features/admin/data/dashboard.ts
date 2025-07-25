import { db } from '@/packages/database/src/client';
import { users, projects, tasks, files, organizations, activityLogs } from '@/packages/database/src';
import { eq, and, gte, sql, desc, isNull, inArray } from 'drizzle-orm';
import type { ExtendedStats } from '../components/stats-grid';
import type { ClientStatus } from '../../status/types/status';
import { getClientStatuses } from '../../status/data/client-status';

export async function getAdminDashboardStats(): Promise<ExtendedStats> {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Fetch all data in parallel
  const [
    allUsers,
    allProjects,
    allTasks,
    allFiles,
    allActivities,
    allOrgs
  ] = await Promise.all([
    db.select().from(users),
    db.select().from(projects),
    db.select().from(tasks),
    db.select({
      id: files.id,
      fileSize: files.fileSize,
      createdAt: files.createdAt
    }).from(files),
    db.select({
      id: activityLogs.id,
      createdAt: activityLogs.createdAt
    }).from(activityLogs),
    db.select().from(organizations)
  ]);

  // Calculate user stats
  const usersByRole = allUsers.reduce((acc, user) => {
    acc[user.role as keyof typeof acc]++;
    return acc;
  }, { admin: 0, client: 0, team_member: 0 });

  const newUsersThisWeek = allUsers.filter(u => 
    u.createdAt && new Date(u.createdAt) >= oneWeekAgo
  ).length;

  // Calculate project stats
  const activeProjects = allProjects.filter(p => p.status === 'active').length;
  const completedProjects = allProjects.filter(p => p.status === 'completed').length;
  const projectsThisMonth = allProjects.filter(p => 
    p.createdAt && new Date(p.createdAt) >= oneMonthAgo
  ).length;

  // Calculate task stats
  const completedTasks = allTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = allTasks.filter(t => 
    t.status === 'in_progress' || t.status === 'needs_review'
  ).length;
  const overdueTasks = allTasks.filter(t => 
    t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
  ).length;
  
  const tasksCompletedThisWeek = allTasks.filter(t => 
    t.status === 'done' && 
    t.updatedAt && 
    new Date(t.updatedAt) >= oneWeekAgo
  ).length;

  // Calculate file stats
  const totalFileSize = allFiles.reduce((sum, file) => sum + (file.fileSize || 0), 0);
  const filesUploadedThisWeek = allFiles.filter(f => 
    f.createdAt && new Date(f.createdAt) >= oneWeekAgo
  ).length;

  // Calculate activity stats
  const activitiesToday = allActivities.filter(a => 
    new Date(a.createdAt) >= startOfToday
  ).length;
  
  const activitiesThisWeek = allActivities.filter(a => 
    new Date(a.createdAt) >= oneWeekAgo
  ).length;

  // Calculate client stats
  const clientUsers = allUsers.filter(u => u.role === 'client');
  const activeClients = clientUsers.filter(client => {
    // Check if client has any active projects
    return allProjects.some(p => 
      p.organizationId && 
      p.status === 'active' && 
      allOrgs.some(org => 
        org.id === p.organizationId && 
        org.type === 'client'
      )
    );
  }).length;

  const clientsWithActiveProjects = new Set(
    allProjects
      .filter(p => p.status === 'active' && p.organizationId)
      .map(p => p.organizationId)
      .filter(Boolean)
  ).size;

  return {
    // User stats
    totalUsers: allUsers.length,
    activeUsers: allUsers.length, // TODO: Implement last login tracking
    newUsersThisWeek,
    usersByRole,

    // Project stats
    totalProjects: allProjects.length,
    activeProjects,
    completedProjects,
    projectsThisMonth,
    
    // Task stats
    totalTasks: allTasks.length,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    tasksCompletedThisWeek,
    
    // File stats
    totalFiles: allFiles.length,
    totalFileSize,
    filesUploadedThisWeek,
    
    // Activity stats
    totalActivities: allActivities.length,
    activitiesToday,
    activitiesThisWeek,
    
    // Client stats
    totalClients: clientUsers.length,
    activeClients,
    clientsWithActiveProjects
  };
}

export async function getClientStatusOverview(): Promise<ClientStatus[]> {
  // Use the new centralized status system
  return await getClientStatuses();
}