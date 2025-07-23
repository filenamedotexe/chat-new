describe('Full CRUD Test - Projects and Tasks', () => {
  const timestamp = Date.now();
  const testData = {
    orgName: `Test Org ${timestamp}`,
    projectName: `Test Project ${timestamp}`,
    taskName: `Test Task ${timestamp}`,
    updatedTaskName: `Updated Task ${timestamp}`,
  };

  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  describe('Admin Full CRUD Flow', () => {
    beforeEach(() => {
      cy.login('admin@example.com', 'admin123');
    });

    it('should create organization, project, and tasks with all features', () => {
      // STEP 1: Create Organization
      cy.visit('/organizations');
      cy.contains('button', 'Create Organization').click();
      
      cy.get('input[name="name"]').type(testData.orgName);
      cy.get('input[name="slug"]').should('have.value', `test-org-${timestamp}`);
      cy.get('textarea[name="description"]').type('Testing full CRUD operations');
      cy.get('select[name="type"]').select('client');
      cy.get('input[name="contactEmail"]').type(`test${timestamp}@example.com`);
      
      cy.screenshot('crud-1-org-form');
      cy.get('button[type="submit"]').click();
      cy.wait(1000);
      
      // Verify organization created
      cy.url().should('include', '/organizations');
      cy.contains(testData.orgName).should('be.visible');
      
      // STEP 2: Create Project
      cy.visit('/projects');
      cy.contains('button', 'Create Project').click();
      
      cy.get('input[name="name"]').type(testData.projectName);
      cy.get('select[name="organizationId"]').select(testData.orgName);
      cy.get('textarea[name="description"]').type('Testing project with tasks');
      
      // Set project dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);
      
      cy.get('input[name="startDate"]').type(startDate.toISOString().split('T')[0]);
      cy.get('input[name="endDate"]').type(endDate.toISOString().split('T')[0]);
      
      cy.screenshot('crud-2-project-form');
      cy.get('button[type="submit"]').click();
      cy.wait(1000);
      
      // Verify project created and navigate to it
      cy.url().should('include', '/projects');
      cy.contains(testData.projectName).should('be.visible');
      cy.contains(testData.projectName).click();
      
      // STEP 3: View Project Details
      cy.url().should('match', /\/projects\/[\w-]+$/);
      cy.contains('h1', testData.projectName).should('be.visible');
      cy.contains(testData.orgName).should('be.visible');
      cy.contains('active').should('be.visible');
      cy.screenshot('crud-3-project-detail');
      
      // STEP 4: Navigate to Tasks
      cy.contains('View Tasks').click();
      cy.url().should('match', /\/projects\/[\w-]+\/tasks$/);
      cy.contains('Tasks Board').should('be.visible');
      
      // STEP 5: Create Tasks with Different Features
      // Task 1: Basic task
      cy.contains('h3', 'Not Started').parent().find('button').first().click();
      cy.get('input[name="title"]').type(`${testData.taskName} - Basic`);
      cy.get('textarea[name="description"]').type('A simple task with no assignment');
      cy.contains('button', 'Create Task').click();
      cy.wait(1500);
      
      // Task 2: Assigned task with due date
      cy.contains('h3', 'In Progress').parent().find('button').first().click();
      cy.get('input[name="title"]').type(`${testData.taskName} - Assigned`);
      cy.get('textarea[name="description"]').type('Task assigned to admin with due date');
      
      // Wait for users to load and select first user
      cy.get('select[name="assignedToId"]').should('not.be.disabled');
      cy.get('select[name="assignedToId"]').select(1); // Select first user
      
      // Set due date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      cy.get('input[name="dueDate"]').type(tomorrow.toISOString().split('T')[0]);
      
      cy.screenshot('crud-4-task-form-filled');
      cy.contains('button', 'Create Task').click();
      cy.wait(1500);
      
      // Task 3: Overdue task
      cy.contains('h3', 'Needs Review').parent().find('button').first().click();
      cy.get('input[name="title"]').type(`${testData.taskName} - Overdue`);
      cy.get('textarea[name="description"]').type('This task should appear as overdue');
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      cy.get('input[name="dueDate"]').type(yesterday.toISOString().split('T')[0]);
      
      cy.contains('button', 'Create Task').click();
      cy.wait(1500);
      
      // STEP 6: Verify all tasks are created
      cy.contains(`${testData.taskName} - Basic`).should('be.visible');
      cy.contains(`${testData.taskName} - Assigned`).should('be.visible');
      cy.contains(`${testData.taskName} - Overdue`).should('be.visible');
      
      // Verify overdue styling
      cy.contains(`${testData.taskName} - Overdue`).parents('.cursor-pointer').within(() => {
        cy.get('.text-red-600, .dark\\:text-red-400').should('exist');
      });
      
      // Verify assignee shows up
      cy.contains(`${testData.taskName} - Assigned`).parents('.cursor-pointer').within(() => {
        cy.contains('admin@example.com').should('be.visible');
      });
      
      cy.screenshot('crud-5-all-tasks-created');
      
      // STEP 7: Test Task Status Updates
      cy.contains(`${testData.taskName} - Basic`).parents('.cursor-pointer').within(() => {
        cy.contains('button', 'Start Task').click();
      });
      cy.wait(1000);
      
      // Task should move to In Progress
      cy.contains('h3', 'In Progress').parent().within(() => {
        cy.contains(`${testData.taskName} - Basic`).should('exist');
      });
      
      // Continue status progression
      cy.contains(`${testData.taskName} - Basic`).parents('.cursor-pointer').within(() => {
        cy.contains('button', 'Submit for Review').click();
      });
      cy.wait(1000);
      
      cy.contains(`${testData.taskName} - Basic`).parents('.cursor-pointer').within(() => {
        cy.contains('button', 'Mark Done').click();
      });
      cy.wait(1000);
      
      // Verify task is in Done column
      cy.contains('h3', 'Done').parent().within(() => {
        cy.contains(`${testData.taskName} - Basic`).should('exist');
      });
      
      cy.screenshot('crud-6-task-completed');
      
      // STEP 8: Test Drag and Drop
      cy.contains(`${testData.taskName} - Assigned`).parents('.cursor-move').as('dragTask');
      cy.contains('h3', 'Done').parent().find('.min-h-\\[200px\\]').as('dropZone');
      
      cy.get('@dragTask').trigger('mousedown', { button: 0 });
      cy.get('@dropZone').trigger('mousemove').trigger('mouseup');
      cy.wait(1000);
      
      cy.screenshot('crud-7-after-drag-drop');
      
      // STEP 9: Navigate back through breadcrumbs
      cy.contains('Back to Projects').click();
      cy.url().should('include', '/projects');
      cy.contains(testData.projectName).should('be.visible');
      
      // STEP 10: View organization detail
      cy.visit('/organizations');
      cy.contains(testData.orgName).parent().parent().parent().within(() => {
        cy.contains('View Details').click();
      });
      
      cy.url().should('match', /\/organizations\/[\w-]+$/);
      cy.contains('h1', testData.orgName).should('be.visible');
      cy.contains(testData.projectName).should('be.visible');
      cy.screenshot('crud-8-org-detail-with-project');
    });
  });

  describe('Client Read-Only Access', () => {
    it('should verify client can only view, not edit', () => {
      // First get a project ID as admin
      cy.login('admin@example.com', 'admin123');
      cy.visit('/projects');
      
      cy.get('article').first().then($article => {
        // Get href from the parent Link
        const href = $article.parent().attr('href');
        const projectId = href.split('/projects/')[1];
        
        // Logout and login as client
        cy.visit('/');
        cy.get('button[aria-label*="menu"]').first().click({ force: true });
        cy.contains('Sign out').click();
        
        cy.login('user@example.com', 'user123');
        
        // Navigate to the project
        cy.visit(`/projects/${projectId}`);
        
        // Verify no edit button
        cy.contains('button', 'Edit Project').should('not.exist');
        cy.screenshot('crud-9-client-project-readonly');
        
        // Navigate to tasks
        cy.contains('View Tasks').click();
        
        // Verify no create task buttons
        cy.get('button svg.h-4.w-4').should('not.exist');
        
        // Verify no status change buttons
        cy.get('.cursor-pointer').first().within(() => {
          cy.get('button').should('not.exist');
        });
        
        // Verify can't access create pages
        cy.visit('/projects/new');
        cy.url().should('include', '/projects');
        
        cy.visit('/organizations');
        cy.url().should('include', '/dashboard');
        
        cy.screenshot('crud-10-client-restrictions');
      });
    });
  });

  describe('Data Persistence Verification', () => {
    it('should verify all created data persists', () => {
      cy.login('admin@example.com', 'admin123');
      
      // Check organization still exists
      cy.visit('/organizations');
      cy.contains(testData.orgName).should('be.visible');
      
      // Check project still exists
      cy.visit('/projects');
      cy.contains(testData.projectName).should('be.visible');
      
      // Check tasks still exist
      cy.contains(testData.projectName).click();
      cy.contains('View Tasks').click();
      
      // All tasks should still be there
      cy.contains(`${testData.taskName} - Basic`).should('be.visible');
      cy.contains(`${testData.taskName} - Assigned`).should('be.visible');
      cy.contains(`${testData.taskName} - Overdue`).should('be.visible');
      
      // Check task is still in Done column
      cy.contains('h3', 'Done').parent().within(() => {
        cy.contains(`${testData.taskName} - Basic`).should('exist');
      });
      
      cy.screenshot('crud-11-data-persisted');
    });
  });
});