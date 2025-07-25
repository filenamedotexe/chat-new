describe('Activity Timeline Visual Test', () => {
  it('should display admin dashboard with activity timeline', () => {
    // Login as admin
    cy.visit('/login');
    cy.wait(1000);
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.wait(2000);
    cy.url().should('include', '/dashboard');
    
    // Check admin dashboard elements
    cy.contains('Admin Dashboard').should('be.visible');
    cy.contains('Platform overview and recent activity').should('be.visible');
    
    // Check stats cards
    cy.contains('Total Users').should('be.visible');
    cy.contains('Total Projects').should('be.visible');
    cy.contains('Total Tasks').should('be.visible');
    cy.contains('Total Files').should('be.visible');
    
    // Check activity timeline
    cy.contains('Recent Activity').should('be.visible');
    cy.contains('View All').should('be.visible');
    
    // Take screenshot
    cy.screenshot('admin-dashboard-with-timeline');
    
    // Create some activity
    cy.visit('/projects/new');
    const projectName = `Visual Test Project ${Date.now()}`;
    cy.get('input[name="name"]').type(projectName);
    cy.get('textarea[name="description"]').type('Testing activity logging visually');
    cy.get('select[name="organizationId"]').then($select => {
      if ($select.find('option').length > 1) {
        cy.get('select[name="organizationId"]').select(1);
      }
    });
    cy.get('button[type="submit"]').click();
    
    // Go back to dashboard
    cy.visit('/dashboard');
    cy.wait(2000);
    
    // Screenshot with activity
    cy.screenshot('admin-dashboard-after-activity');
  });
  
  it('should display regular dashboard for client users', () => {
    cy.clearCookies();
    cy.visit('/login');
    cy.get('input[type="email"]').type('user@example.com');
    cy.get('input[type="password"]').type('user123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard', { timeout: 10000 });
    
    // Should NOT see admin dashboard
    cy.contains('Admin Dashboard').should('not.exist');
    cy.contains('Welcome back').should('be.visible');
    
    // Take screenshot
    cy.screenshot('client-dashboard');
  });
  
  it('should display regular dashboard for team members', () => {
    cy.clearCookies();
    cy.visit('/login');
    cy.get('input[type="email"]').type('team@example.com');
    cy.get('input[type="password"]').type('team123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard', { timeout: 10000 });
    
    // Should NOT see admin dashboard
    cy.contains('Admin Dashboard').should('not.exist');
    cy.contains('Welcome back').should('be.visible');
    
    // Take screenshot
    cy.screenshot('team-member-dashboard');
  });
});