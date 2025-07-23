describe('Phase 5: Robust Task Test', () => {
  it('should handle task workflow with proper setup', () => {
    // Login
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // First ensure we have an organization
    cy.visit('/organizations');
    cy.get('body').then($body => {
      if ($body.find('article').length === 0) {
        // Create organization
        cy.contains('button', /New Organization|Add Organization/i).click();
        cy.get('input[name="name"]').type('Test Organization');
        cy.get('textarea[name="description"]').type('Organization for testing');
        cy.get('button[type="submit"]').click();
        cy.wait(1000);
      }
    });
    
    // Go to projects
    cy.visit('/projects');
    cy.screenshot('phase5-robust-1-projects');
    
    // Create project if none exist
    cy.get('body').then($body => {
      if ($body.find('article').length === 0) {
        cy.contains('button', 'New Project').click();
        cy.get('input[name="name"]').type('Test Project for Tasks');
        cy.get('select[name="organizationId"]').select(1);
        cy.get('textarea[name="description"]').type('Testing task features');
        cy.get('button[type="submit"]').click();
        cy.wait(1000);
      }
    });
    
    // Now click on a project
    cy.visit('/projects');
    cy.get('article').first().click();
    
    // Go to tasks
    cy.url().then(url => {
      const projectId = url.split('/projects/')[1];
      cy.visit(`/projects/${projectId}/tasks`);
    });
    
    cy.contains('Tasks Board').should('be.visible');
    cy.screenshot('phase5-robust-2-task-board');
    
    // Create a task
    cy.contains('h3', 'Not Started').parent().find('button').first().click();
    cy.get('input[name="title"]').type('Demo Task');
    cy.get('textarea[name="description"]').type('This is a demo task');
    cy.contains('button', 'Create Task').click();
    cy.wait(1000);
    
    cy.contains('Demo Task').should('be.visible');
    cy.screenshot('phase5-robust-3-task-created');
    
    // Test status change
    cy.contains('Demo Task').parents('.cursor-move').trigger('mouseover');
    cy.contains('button', 'Start Task').click();
    cy.wait(1000);
    
    cy.screenshot('phase5-robust-4-task-started');
    
    cy.log('✅ Task test complete with proper setup!');
  });
});