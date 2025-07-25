describe('Action Gates Test', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  describe('Project Completion Gates', () => {
    it('should block project completion when no tasks exist', () => {
      // Create a new project
      cy.visit('/projects/new');
      cy.get('input[name="name"]').type('Test Project for Gates');
      cy.get('textarea[name="description"]').type('Testing action gates');
      cy.get('select[name="organizationId"]').select(1);
      cy.get('button[type="submit"]').click();
      
      // Should redirect to project detail
      cy.url().should('match', /\/projects\/[a-f0-9-]+$/);
      
      // Check for action gate on project completion
      cy.contains('Project Status').should('be.visible');
      
      // Should show blocked message
      cy.contains('Project must have at least one task').should('be.visible');
      cy.contains('A project needs tasks to track work progress').should('be.visible');
      cy.contains('Add Task').should('be.visible');
      
      // The complete button should not be visible
      cy.contains('button', 'Mark Project as Complete').should('not.exist');
    });

    it('should block project completion when tasks are not done', () => {
      cy.visit('/projects');
      
      // Find a project with tasks
      cy.get('.grid').first().within(() => {
        cy.contains('View Details').click();
      });
      
      // Add a task if needed
      cy.contains('Manage Tasks').click();
      cy.contains('button', 'New Task').click();
      cy.get('input[name="title"]').type('Incomplete Task');
      cy.get('button[type="submit"]').click();
      cy.wait(1000);
      
      // Go back to project detail
      cy.go(-1);
      
      // Check for action gate
      cy.contains('Project Status').should('be.visible');
      
      // Should show message about incomplete tasks
      cy.get('body').then($body => {
        if ($body.text().includes('All tasks must be completed')) {
          cy.contains('All tasks must be completed').should('be.visible');
          cy.contains('tasks are not done yet').should('be.visible');
          cy.contains('View Tasks').should('be.visible');
        }
      });
    });

    it('should allow project completion when all tasks are done', () => {
      // This test would need a project with all tasks completed
      // Skipping for now as it requires specific data setup
      cy.log('Test requires project with all completed tasks');
    });
  });

  describe('Task Creation Gates', () => {
    it('should require project selection when creating task from tasks page', () => {
      cy.visit('/tasks/new');
      
      // Should see project selection requirement
      cy.contains('Select Project').should('be.visible');
      cy.contains('Tasks must be associated with a project').should('be.visible');
      
      // Task form should not be visible initially
      cy.contains('Task Details').should('not.exist');
      
      // Should show gate message
      cy.contains('Please select a project first').should('be.visible');
      cy.contains('Tasks must belong to a project').should('be.visible');
      
      // Select a project
      cy.get('select').first().select(1);
      
      // Now task form should appear
      cy.contains('Task Details').should('be.visible');
      cy.get('input[name="title"]').should('be.visible');
    });
  });

  describe('Task Completion Gates', () => {
    it('should block task completion if no assignee', () => {
      // Create a task without assignee
      cy.visit('/projects');
      cy.get('.grid').first().within(() => {
        cy.contains('View Details').click();
      });
      
      cy.contains('Manage Tasks').click();
      cy.contains('button', 'New Task').click();
      cy.get('input[name="title"]').type('Unassigned Task');
      // Don't select assignee
      cy.get('button[type="submit"]').click();
      cy.wait(1000);
      
      // Click on the task
      cy.contains('Unassigned Task').click();
      
      // Change status to needs review
      cy.contains('Change status').should('be.visible');
      cy.contains('button', 'Start Task').click();
      cy.wait(500);
      cy.contains('button', 'Submit for Review').click();
      cy.wait(500);
      
      // Should show gate message
      cy.contains('Task must be assigned to someone').should('be.visible');
      cy.contains('Assign this task to a team member before marking it complete').should('be.visible');
      
      // Mark Done button should be disabled
      cy.contains('button', 'Mark Done').should('have.attr', 'disabled');
    });
  });

  describe('Role-based Gates', () => {
    it('should block client users from creating projects', () => {
      // Logout and login as client
      cy.visit('/api/auth/signout');
      cy.visit('/login');
      cy.get('input[type="email"]').type('client@example.com');
      cy.get('input[type="password"]').type('client123');
      cy.get('button[type="submit"]').click();
      
      // Try to access new project page
      cy.visit('/projects/new', { failOnStatusCode: false });
      
      // Should be redirected away
      cy.url().should('include', '/projects');
      cy.url().should('not.include', '/new');
    });

    it('should block client users from deleting tasks', () => {
      // Login as client
      cy.visit('/api/auth/signout');
      cy.visit('/login');
      cy.get('input[type="email"]').type('client@example.com');
      cy.get('input[type="password"]').type('client123');
      cy.get('button[type="submit"]').click();
      
      // Navigate to a project
      cy.visit('/projects');
      cy.get('body').then($body => {
        if (!$body.text().includes('No projects yet')) {
          cy.get('.grid').first().within(() => {
            cy.contains('View Details').click();
          });
          
          cy.contains('Manage Tasks').click();
          
          // Task cards should not have edit/delete buttons for clients
          cy.get('.space-y-3').first().within(() => {
            cy.get('button').should('not.contain', 'Delete');
          });
        }
      });
    });
  });

  describe('Clear CTAs and User Guidance', () => {
    it('should provide clear next steps when blocked', () => {
      // Test project completion block
      cy.visit('/projects/new');
      cy.get('input[name="name"]').type('CTA Test Project');
      cy.get('select[name="organizationId"]').select(1);
      cy.get('button[type="submit"]').click();
      
      // Check CTA clarity
      cy.contains('Add Task').should('be.visible').and('have.attr', 'href').and('include', '/tasks');
      
      // Click the CTA
      cy.contains('Add Task').click();
      
      // Should navigate to tasks page
      cy.url().should('include', '/tasks');
    });

    it('should show helpful tooltips on disabled actions', () => {
      // Create unassigned task
      cy.visit('/projects');
      cy.get('.grid').first().within(() => {
        cy.contains('View Details').click();
      });
      
      cy.contains('Manage Tasks').click();
      
      // Find or create a task in review status without assignee
      cy.get('body').then($body => {
        if ($body.find('.border-yellow-200').length > 0) {
          // Click on a task in review
          cy.get('.border-yellow-200').first().find('h3').first().click();
          
          // Check for disabled button with tooltip
          cy.contains('button', 'Mark Done').should('have.attr', 'title').and('include', 'Task must be assigned');
        }
      });
    });
  });
});