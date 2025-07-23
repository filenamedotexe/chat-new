import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { organizations } from '../packages/database/src/schema/organizations';
import { projects } from '../packages/database/src/schema/organizations';
import { tasks } from '../packages/database/src/schema/tasks';
import { users } from '../packages/database/src/schema/auth';
import { eq, desc } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function verifyData() {
  console.log('🔍 Verifying all data in database...\n');

  // 1. List all users
  console.log('👥 USERS:');
  const allUsers = await db.select().from(users).orderBy(users.createdAt);
  allUsers.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email} (${user.role})`);
    console.log(`   Name: ${user.name || 'Not set'}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Created: ${new Date(user.createdAt).toLocaleDateString()}\n`);
  });

  // 2. List all organizations
  console.log('\n🏢 ORGANIZATIONS:');
  const allOrgs = await db.select().from(organizations).orderBy(desc(organizations.createdAt));
  allOrgs.forEach((org, index) => {
    console.log(`${index + 1}. ${org.name} (${org.type})`);
    console.log(`   Slug: ${org.slug}`);
    console.log(`   Description: ${org.description || 'None'}`);
    console.log(`   Email: ${org.contactEmail || 'None'}`);
    console.log(`   Website: ${org.website || 'None'}`);
    console.log(`   Phone: ${org.contactPhone || 'None'}`);
    console.log(`   ID: ${org.id}\n`);
  });

  // 3. List all projects with their organizations
  console.log('\n📁 PROJECTS:');
  const allProjects = await db
    .select({
      project: projects,
      org: organizations,
    })
    .from(projects)
    .leftJoin(organizations, eq(projects.organizationId, organizations.id))
    .orderBy(desc(projects.createdAt));

  allProjects.forEach((item, index) => {
    console.log(`${index + 1}. ${item.project.name} (${item.project.status})`);
    console.log(`   Organization: ${item.org?.name || 'Unknown'}`);
    console.log(`   Description: ${item.project.description || 'None'}`);
    console.log(`   Start: ${item.project.startDate ? new Date(item.project.startDate).toLocaleDateString() : 'Not set'}`);
    console.log(`   End: ${item.project.endDate ? new Date(item.project.endDate).toLocaleDateString() : 'Not set'}`);
    console.log(`   ID: ${item.project.id}\n`);
  });

  // 4. List all tasks with assignees
  console.log('\n📋 TASKS:');
  const allTasks = await db
    .select({
      task: tasks,
      assignee: users,
      project: projects,
    })
    .from(tasks)
    .leftJoin(users, eq(tasks.assignedToId, users.id))
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .orderBy(desc(tasks.createdAt));

  allTasks.forEach((item, index) => {
    const isOverdue = item.task.dueDate && 
                      new Date(item.task.dueDate) < new Date() && 
                      item.task.status !== 'done';
    
    console.log(`${index + 1}. ${item.task.title} [${item.task.status}]${isOverdue ? ' ⚠️ OVERDUE' : ''}`);
    console.log(`   Project: ${item.project?.name || 'Unknown'}`);
    console.log(`   Description: ${item.task.description || 'None'}`);
    console.log(`   Assigned to: ${item.assignee ? `${item.assignee.name || item.assignee.email} (${item.assignee.role})` : 'Unassigned'}`);
    console.log(`   Due: ${item.task.dueDate ? new Date(item.task.dueDate).toLocaleDateString() : 'No due date'}`);
    if (item.task.completedAt) {
      console.log(`   Completed: ${new Date(item.task.completedAt).toLocaleDateString()}`);
    }
    console.log(`   ID: ${item.task.id}\n`);
  });

  // 5. Summary stats
  console.log('\n📊 SUMMARY:');
  console.log(`Total Users: ${allUsers.length}`);
  console.log(`Total Organizations: ${allOrgs.length}`);
  console.log(`Total Projects: ${allProjects.length}`);
  console.log(`Total Tasks: ${allTasks.length}`);
  
  const tasksByStatus = allTasks.reduce((acc, { task }) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\nTasks by Status:');
  Object.entries(tasksByStatus).forEach(([status, count]) => {
    console.log(`   ${status}: ${count}`);
  });

  const overdueTasks = allTasks.filter(({ task }) => 
    task.dueDate && 
    new Date(task.dueDate) < new Date() && 
    task.status !== 'done'
  );
  console.log(`\nOverdue Tasks: ${overdueTasks.length}`);

  process.exit(0);
}

verifyData();