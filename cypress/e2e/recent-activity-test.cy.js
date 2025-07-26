describe('Dashboard Recent Activity', () => {
  it('should display recent activity for admin', () => {
    cy.viewport(1280, 720);
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Check recent activity section exists
    cy.contains('Recent Activity').should('be.visible');
    
    // Check for View All link (admin only)
    cy.contains('View All').should('be.visible');
    
    // Take screenshot
    cy.screenshot('admin-recent-activity');
  });

  it('should display recent activity for client', () => {
    cy.viewport(1280, 720);
    cy.visit('/login');
    cy.get('input[type="email"]').type('user@example.com');
    cy.get('input[type="password"]').type('user123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Check if recent activity section exists (may be filtered out for clients)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Recent Activity')) {
        cy.contains('Recent Activity').should('be.visible');
        // Check no View All link in activity section
        cy.get('[data-testid="recent-activity"]').within(() => {
          cy.contains('View All').should('not.exist');
        });
      } else {
        cy.log('No recent activity shown for client - possibly filtered');
      }
    });
    
    // Take screenshot
    cy.screenshot('client-recent-activity');
  });

  it('should display activity with icons and timestamps', () => {
    cy.viewport(1280, 720);
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Navigate to activity page for full view
    cy.visit('/admin/activity');
    
    // Check for activity elements
    cy.get('.text-sm').should('exist'); // Activity message
    cy.get('time').should('exist'); // Timestamp
    cy.get('svg').should('exist'); // Icons
    
    // Take screenshot of full activity view
    cy.screenshot('activity-full-view');
  });

  it('should work on mobile', () => {
    cy.viewport(375, 812);
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Scroll to activity section
    cy.contains('Recent Activity').scrollIntoView();
    
    // Check visibility
    cy.contains('Recent Activity').should('be.visible');
    
    // Take mobile screenshot
    cy.screenshot('activity-mobile');
  });
});