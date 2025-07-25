require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

// Direct database connection for script
const sql = neon(process.env.DATABASE_URL);

async function createTestData() {
  try {
    console.log('Creating test data for Cypress tests...');

    // First, check if we have the admin user
    const adminUser = await sql`
      SELECT id FROM users WHERE email = 'admin@example.com'
    `;

    if (adminUser.length === 0) {
      console.log('Admin user not found. Please ensure test users are seeded first.');
      return;
    }

    const adminUserId = adminUser[0].id;

    // Create or get test organization
    let testOrg = await sql`
      SELECT id FROM organizations WHERE name = 'Test Organization'
    `;

    if (testOrg.length === 0) {
      testOrg = await sql`
        INSERT INTO organizations (name, slug, type, description)
        VALUES ('Test Organization', 'test-org', 'client', 'Test organization for Cypress testing')
        RETURNING id
      `;
      console.log('Created test organization');
    } else {
      console.log('Test organization already exists');
    }

    const orgId = testOrg[0].id;

    // Create test projects
    const testProjects = [
      {
        name: 'Test Project Alpha',
        slug: 'test-project-alpha',
        description: 'A test project for Cypress testing',
        status: 'active'
      },
      {
        name: 'Test Project Beta', 
        slug: 'test-project-beta',
        description: 'Another test project for feature flag testing',
        status: 'active'
      }
    ];

    console.log('Creating test projects...');
    const createdProjects = [];
    
    for (const project of testProjects) {
      // Check if project already exists
      const existing = await sql`
        SELECT id, name FROM projects WHERE name = ${project.name}
      `;

      if (existing.length === 0) {
        const result = await sql`
          INSERT INTO projects (name, slug, description, status, organization_id)
          VALUES (${project.name}, ${project.slug}, ${project.description}, ${project.status}, ${orgId})
          RETURNING id, name
        `;
        createdProjects.push(result[0]);
        console.log(`Created project: ${result[0].name}`);
      } else {
        createdProjects.push(existing[0]);
        console.log(`Project already exists: ${project.name}`);
      }
    }

    // Create test tasks for each project
    const testTasks = [
      {
        title: 'Test Task for Feature Flags',
        description: 'Testing feature flag functionality in task detail',
        status: 'not_started'
      },
      {
        title: 'Another Test Task',
        description: 'Additional task for comprehensive testing',
        status: 'in_progress'
      },
      {
        title: 'Completed Test Task',
        description: 'A completed task for testing',
        status: 'done'
      }
    ];

    console.log('Creating test tasks...');
    
    for (const project of createdProjects) {
      for (const task of testTasks) {
        // Check if task already exists for this project
        const existing = await sql`
          SELECT id FROM tasks WHERE title = ${task.title} AND project_id = ${project.id}
        `;

        if (existing.length === 0) {
          const result = await sql`
            INSERT INTO tasks (title, description, status, project_id, created_by_id)
            VALUES (${task.title}, ${task.description}, ${task.status}, ${project.id}, ${adminUserId})
            RETURNING id, title
          `;
          console.log(`Created task: ${result[0].title} for project ${project.name}`);
        } else {
          console.log(`Task already exists: ${task.title} for project ${project.name}`);
        }
      }
    }

    // Ensure essential feature flags exist
    const essentialFeatures = [
      {
        name: 'chat',
        description: 'Enable chat and discussion features',
        enabled: true
      },
      {
        name: 'fileUpload', 
        description: 'Enable file upload functionality',
        enabled: true
      },
      {
        name: 'darkMode',
        description: 'Enable dark mode theme support',
        enabled: true
      },
      {
        name: 'advancedAnalytics',
        description: 'Enable advanced analytics and reporting',
        enabled: false
      },
      {
        name: 'betaFeatures',
        description: 'Enable experimental beta features',
        enabled: false
      },
      {
        name: 'voiceChat',
        description: 'Enable voice chat functionality',
        enabled: false
      }
    ];

    console.log('Ensuring feature flags exist...');
    
    for (const feature of essentialFeatures) {
      const existing = await sql`
        SELECT id FROM features WHERE name = ${feature.name}
      `;

      if (existing.length === 0) {
        const result = await sql`
          INSERT INTO features (name, description, enabled, created_at, updated_at)
          VALUES (${feature.name}, ${feature.description}, ${feature.enabled}, NOW(), NOW())
          RETURNING id, name
        `;
        console.log(`Created feature flag: ${result[0].name}`);
      } else {
        console.log(`Feature flag already exists: ${feature.name}`);
      }
    }

    console.log('\nTest data creation completed successfully!');
    console.log('Projects and tasks are now available for Cypress testing.');
    
  } catch (error) {
    console.error('Error creating test data:', error);
    process.exit(1);
  }
}

// Run the script
createTestData().then(() => {
  console.log('Test data script finished.');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});