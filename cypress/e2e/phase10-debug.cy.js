describe('Phase 10.2 Debug Tests', () => {
  it('should login as admin and check dashboard', () => {
    // Visit login page
    cy.visit('/login');
    
    // Take screenshot of login page
    cy.screenshot('debug-login-page');
    
    // Login as admin
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Wait for navigation
    cy.wait(2000);
    
    // Check URL
    cy.url().then(url => {
      cy.log('Current URL:', url);
    });
    
    // Take screenshot after login
    cy.screenshot('debug-after-login');
    
    // Check if we're on dashboard
    cy.url().should('include', '/dashboard');
    
    // Check page content
    cy.get('body').then($body => {
      cy.log('Page title:', $body.find('h1').text());
      cy.log('Page content preview:', $body.text().substring(0, 200));
    });
    
    // Take screenshot of dashboard
    cy.screenshot('debug-dashboard');
    
    // Check if admin content is visible
    cy.get('h1').then($h1 => {
      if ($h1.text().includes('Admin Dashboard')) {
        cy.log('Admin dashboard loaded successfully');
        
        // Check for Platform Overview
        cy.contains('Platform Overview').should('be.visible');
      } else {
        cy.log('Regular dashboard loaded - not admin dashboard');
      }
    });
  });
  
  it('should directly visit admin page', () => {
    // Login first
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Now try to visit admin page directly
    cy.visit('/admin');
    cy.wait(1000);
    
    // Check where we ended up
    cy.url().then(url => {
      cy.log('Admin page URL:', url);
    });
    
    cy.screenshot('debug-admin-page');
  });
});