describe('Manual Test Flow - Create and Verify Data', () => {
  const timestamp = Date.now();
  
  it('should manually create organization, project, and tasks', () => {
    cy.viewport(1280, 720);
    
    // Login as admin
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Create Organization
    cy.visit('/organizations/new');
    cy.url().should('include', '/organizations/new');
    
    // Fill org form
    cy.get('input[name="name"]').type(`Manual Test Org ${timestamp}`);
    cy.get('input[name="slug"]').should('have.value', `manual-test-org-${timestamp}`);
    cy.get('textarea[name="description"]').type('Testing manual flow');
    cy.get('select[name="type"]').select('client');
    cy.get('input[name="contactEmail"]').type(`test${timestamp}@example.com`);
    
    cy.screenshot('manual-1-org-form');
    cy.get('button[type="submit"]').click();
    
    // Should redirect to organizations list
    cy.url().should('include', '/organizations');
    cy.contains(`Manual Test Org ${timestamp}`).should('be.visible');
    
    // Create Project
    cy.visit('/projects/new');
    cy.get('input[name="name"]').type(`Manual Test Project ${timestamp}`);
    cy.get('select[name="organizationId"]').then($select => {
      // Select the org we just created if it exists in the dropdown
      cy.wrap($select).select(`Manual Test Org ${timestamp}`);
    });
    cy.get('textarea[name="description"]').type('Testing project creation');
    
    // Set dates
    const today = new Date();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);
    
    cy.get('input[name="startDate"]').type(today.toISOString().split('T')[0]);
    cy.get('input[name="endDate"]').type(futureDate.toISOString().split('T')[0]);
    
    cy.screenshot('manual-2-project-form');
    cy.get('button[type="submit"]').click();
    
    // Should be on projects list
    cy.url().should('include', '/projects');
    cy.contains(`Manual Test Project ${timestamp}`).should('be.visible');
    
    // Click on the project
    cy.contains(`Manual Test Project ${timestamp}`).click();
    
    // Should be on project detail page
    cy.url().should('match', /\/projects\/[\w-]+$/);
    cy.contains('h1', `Manual Test Project ${timestamp}`).should('be.visible');
    cy.contains(`Manual Test Org ${timestamp}`).should('be.visible');
    cy.screenshot('manual-3-project-detail');
    
    // Go to tasks
    cy.contains('View Tasks').click();
    cy.url().should('match', /\/projects\/[\w-]+\/tasks$/);
    cy.contains('Tasks Board').should('be.visible');
    
    // Create a task
    cy.contains('h3', 'Not Started').parent().find('button').first().click();
    cy.get('input[name="title"]').type(`Manual Test Task ${timestamp}`);
    cy.get('textarea[name="description"]').type('Testing task creation with assignment');
    
    // Wait for users to load and try to select
    cy.get('select[name="assignedToId"]').should('not.be.disabled');
    cy.wait(1000); // Give time for users to load
    cy.get('select[name="assignedToId"] option').then($options => {
      if ($options.length > 1) {
        cy.get('select[name="assignedToId"]').select(1);
      }
    });
    
    // Set due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    cy.get('input[name="dueDate"]').type(dueDate.toISOString().split('T')[0]);
    
    cy.screenshot('manual-4-task-form');
    cy.contains('button', 'Create Task').click();
    cy.wait(2000);
    
    // Verify task appears
    cy.contains(`Manual Test Task ${timestamp}`).should('be.visible');
    cy.screenshot('manual-5-task-created');
    
    // Test status change
    cy.contains(`Manual Test Task ${timestamp}`).parent().parent().within(() => {
      cy.contains('button', 'Start Task').click();
    });
    cy.wait(1000);
    
    // Verify task moved to In Progress
    cy.contains('h3', 'In Progress').parent().within(() => {
      cy.contains(`Manual Test Task ${timestamp}`).should('exist');
    });
    
    cy.screenshot('manual-6-task-in-progress');
    
    // Go back and verify everything exists
    cy.visit('/organizations');
    cy.contains(`Manual Test Org ${timestamp}`).should('be.visible');
    
    cy.visit('/projects');
    cy.contains(`Manual Test Project ${timestamp}`).should('be.visible');
    
    cy.screenshot('manual-7-all-data-verified');
  });
});