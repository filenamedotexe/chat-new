import { sql } from '@chat/database';
import type { ClientStatus, OrganizationStatus } from '../types/status';
import { 
  calculateClientStatus, 
  calculateClientMetrics,
  type StatusMetrics 
} from '../lib/calculate-status';

export async function getClientStatuses(): Promise<ClientStatus[]> {
  // Get organizations with client type and their project/task data
  const clients = await sql`
    SELECT 
      o.id,
      o.name,
      o.contact_email as email,
      COUNT(DISTINCT p.id) as total_projects,
      COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_projects,
      COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.id END) as completed_projects,
      COUNT(DISTINCT t.id) as total_tasks,
      COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) as completed_tasks,
      COUNT(DISTINCT CASE WHEN t.due_date < NOW() AND t.status != 'done' THEN t.id END) as overdue_tasks,
      COUNT(DISTINCT CASE WHEN t.due_date BETWEEN NOW() AND NOW() + INTERVAL '7 days' AND t.status != 'done' THEN t.id END) as upcoming_deadlines,
      MAX(GREATEST(
        COALESCE(al.created_at, '1970-01-01'::timestamp),
        COALESCE(p.updated_at, '1970-01-01'::timestamp),
        COALESCE(t.updated_at, '1970-01-01'::timestamp)
      )) as last_activity
    FROM organizations o
    LEFT JOIN projects p ON p.organization_id = o.id
    LEFT JOIN tasks t ON t.project_id = p.id
    LEFT JOIN activity_logs al ON al.organization_id = o.id
    WHERE o.type = 'client'
    GROUP BY o.id, o.name, o.contact_email
    ORDER BY o.name
  `;

  return clients.map((client): ClientStatus => {
    const totalProjects = Number(client.total_projects) || 0;
    const completedProjects = Number(client.completed_projects) || 0;
    const totalTasks = Number(client.total_tasks) || 0;
    const completedTasks = Number(client.completed_tasks) || 0;
    const overdueTasks = Number(client.overdue_tasks) || 0;
    const upcomingDeadlines = Number(client.upcoming_deadlines) || 0;
    const lastActivity = client.last_activity ? new Date(client.last_activity) : new Date('1970-01-01');

    // Calculate metrics
    const metrics = calculateClientMetrics({
      totalProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      upcomingDeadlines,
      lastActivityDate: lastActivity,
    });

    // Calculate status
    const status = calculateClientStatus(metrics);

    return {
      id: client.id,
      name: client.name || 'Unknown Client',
      email: client.email || '',
      status,
      activeProjects: totalProjects - completedProjects,
      totalProjects,
      completedTasks,
      totalTasks,
      lastActivity,
      upcomingDeadlines,
      overdueItems: overdueTasks,
      metrics: {
        projectCompletionRate: metrics.projectCompletionRate,
        taskCompletionRate: metrics.taskCompletionRate,
        daysSinceLastActivity: metrics.daysSinceLastActivity,
        overdueTasksRatio: totalTasks > 0 ? overdueTasks / totalTasks : 0,
      },
    };
  });
}

export async function getClientStatusById(clientId: string): Promise<ClientStatus | null> {
  const clients = await getClientStatuses();
  return clients.find(client => client.id === clientId) || null;
}

export async function getStatusSummary() {
  const clients = await getClientStatuses();
  
  const summary = {
    active: 0,
    atRisk: 0,
    inactive: 0,
    total: clients.length,
  };

  clients.forEach(client => {
    switch (client.status) {
      case 'active':
        summary.active++;
        break;
      case 'at-risk':
        summary.atRisk++;
        break;
      case 'inactive':
        summary.inactive++;
        break;
    }
  });

  return summary;
}

export async function getOrganizationStatuses(): Promise<OrganizationStatus[]> {
  const organizations = await sql`
    SELECT 
      o.id,
      o.name,
      o.type,
      o.contact_email,
      COUNT(DISTINCT p.id) as total_projects,
      COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_projects,
      COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.id END) as completed_projects,
      COUNT(DISTINCT t.id) as total_tasks,
      COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) as completed_tasks,
      COUNT(DISTINCT CASE WHEN t.due_date < NOW() AND t.status != 'done' THEN t.id END) as overdue_tasks,
      MAX(GREATEST(
        COALESCE(al.created_at, '1970-01-01'::timestamp),
        COALESCE(p.updated_at, '1970-01-01'::timestamp),
        COALESCE(t.updated_at, '1970-01-01'::timestamp)
      )) as last_activity
    FROM organizations o
    LEFT JOIN projects p ON p.organization_id = o.id
    LEFT JOIN tasks t ON t.project_id = p.id
    LEFT JOIN activity_logs al ON al.organization_id = o.id
    GROUP BY o.id, o.name, o.type, o.contact_email
    ORDER BY o.name
  `;

  return organizations.map((org): OrganizationStatus => {
    const totalProjects = Number(org.total_projects) || 0;
    const completedProjects = Number(org.completed_projects) || 0;
    const totalTasks = Number(org.total_tasks) || 0;
    const completedTasks = Number(org.completed_tasks) || 0;
    const overdueTasks = Number(org.overdue_tasks) || 0;
    const lastActivity = org.last_activity ? new Date(org.last_activity) : new Date('1970-01-01');

    // Calculate metrics for status determination
    const metrics = calculateClientMetrics({
      totalProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      upcomingDeadlines: 0, // Not calculated for organizations
      lastActivityDate: lastActivity,
    });

    // Calculate status
    const status = calculateClientStatus(metrics);

    return {
      id: org.id,
      name: org.name || 'Unknown Organization',
      type: org.type as 'client' | 'internal' | 'partner',
      status,
      totalProjects,
      activeProjects: totalProjects - completedProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      lastActivity,
      contactEmail: org.contact_email || '',
    };
  });
}