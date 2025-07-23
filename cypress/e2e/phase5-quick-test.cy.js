describe('Phase 5: Quick Task Test', () => {
  it('should complete basic task workflow', () => {
    // Login
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Go to projects
    cy.contains('Projects').click();
    cy.url().should('include', '/projects');
    cy.screenshot('phase5-quick-1-projects');
    
    // Click first project
    cy.get('article').first().click();
    
    // Go to tasks
    cy.url().then(url => {
      const projectId = url.split('/projects/')[1];
      cy.visit(`/projects/${projectId}/tasks`);
    });
    
    cy.contains('Tasks Board').should('be.visible');
    cy.screenshot('phase5-quick-2-task-board');
    
    // Create a task
    cy.contains('h3', 'Not Started').parent().find('button').first().click();
    cy.get('input[name="title"]').type('Test Task');
    cy.get('textarea[name="description"]').type('Testing tasks feature');
    cy.contains('button', 'Create Task').click();
    cy.wait(1000);
    
    cy.contains('Test Task').should('be.visible');
    cy.screenshot('phase5-quick-3-task-created');
    
    // Test status change
    cy.contains('Test Task').parents('.cursor-move').trigger('mouseover');
    cy.contains('button', 'Start Task').click();
    cy.wait(1000);
    
    cy.screenshot('phase5-quick-4-task-started');
    
    console.log('✅ Basic task test complete!');
  });
});