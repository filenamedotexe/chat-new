describe('Manual Activity Test', () => {
  it('should create various activities and view them', () => {
    // Login as admin
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Create a project
    cy.visit('/projects/new');
    const projectName = `Activity Test ${Date.now()}`;
    cy.get('input[name="name"]').type(projectName);
    cy.get('textarea[name="description"]').type('Testing activity logging');
    cy.get('select[name="organizationId"]').then($select => {
      if ($select.find('option').length > 1) {
        cy.get('select[name="organizationId"]').select(1);
      }
    });
    cy.get('button[type="submit"]').click();
    cy.wait(2000);
    
    // Create a task
    cy.visit('/tasks/new');
    cy.get('select').first().then($select => {
      if ($select.find('option').length > 1) {
        cy.get('select').first().select(1);
        cy.wait(500);
        cy.get('input[name="title"]').type('Test Task for Activity');
        cy.get('button[type="submit"]').click();
        cy.wait(2000);
      }
    });
    
    // View all activities
    cy.visit('/admin/activity');
    cy.wait(2000);
    
    // Take screenshot
    cy.screenshot('admin-activity-page-full');
    
    // Go back to dashboard
    cy.visit('/dashboard');
    cy.wait(2000);
    cy.screenshot('admin-dashboard-with-activities');
  });
});