describe('Visual Verification', () => {
  it('takes screenshots of current UI state', () => {
    // Login page
    cy.visit('/login');
    cy.screenshot('current-login-page');
    
    // Login and go to dashboard
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Dashboard
    cy.screenshot('current-dashboard');
    
    // Projects page
    cy.visit('/projects');
    cy.wait(1000); // Let it load
    cy.screenshot('current-projects-page');
    
    // Color test page
    cy.visit('/color-test');
    cy.wait(1000); // Let it load
    cy.screenshot('current-color-test-page');
  });
});