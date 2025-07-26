describe('User Menu Enhancement', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should display user avatar with initials', () => {
    // Check desktop avatar
    cy.get('nav').first().within(() => {
      // Look for the avatar in the user menu trigger
      cy.get('button[aria-label="User menu"]').within(() => {
        // Check avatar exists and shows initials
        cy.get('div').contains('AU').should('be.visible'); // Admin User initials
      });
    });
  });

  it('should open dropdown menu on click', () => {
    // Click user menu button
    cy.get('button[aria-label="User menu"]').first().click();
    
    // Check dropdown is visible
    cy.get('div').contains('Profile').should('be.visible');
    cy.get('div').contains('Settings').should('be.visible');
    cy.get('div').contains('Help & Support').should('be.visible');
    cy.get('div').contains('Sign Out').should('be.visible');
    
    // Check user info section
    cy.get('p').contains('Admin User').should('be.visible');
    cy.get('p').contains('admin@example.com').should('be.visible');
  });

  it('should close dropdown with Escape key', () => {
    // Open dropdown
    cy.get('button[aria-label="User menu"]').first().click();
    cy.get('div').contains('Profile').should('be.visible');
    
    // Press Escape
    cy.get('body').type('{esc}');
    
    // Check dropdown is closed
    cy.get('div').contains('Profile').should('not.exist');
  });

  it('should close dropdown when clicking outside', () => {
    // Open dropdown
    cy.get('button[aria-label="User menu"]').first().click();
    cy.get('div').contains('Profile').should('be.visible');
    
    // Click outside
    cy.get('body').click(0, 0);
    
    // Check dropdown is closed
    cy.get('div').contains('Profile').should('not.exist');
  });

  it('should navigate to settings when clicking Settings', () => {
    // Open dropdown
    cy.get('button[aria-label="User menu"]').first().click();
    
    // Click Settings
    cy.get('button').contains('Settings').click();
    
    // Should navigate to settings page
    cy.url().should('include', '/settings');
    cy.get('h1').contains('Settings').should('be.visible');
  });

  it('should sign out when clicking Sign Out', () => {
    // Open dropdown
    cy.get('button[aria-label="User menu"]').first().click();
    
    // Click Sign Out
    cy.get('button').contains('Sign Out').click();
    
    // NextAuth redirects to signout page, then to login
    // Just verify we left the dashboard
    cy.url().should('not.include', '/dashboard');
  });

  it('should work on mobile', () => {
    // Set mobile viewport
    cy.viewport(375, 812);
    
    // Open mobile menu
    cy.get('button[data-mobile-menu-trigger]').click();
    
    // Check user info section at bottom
    cy.get('p').contains('Admin User').should('be.visible');
    cy.get('p').contains('admin@example.com').should('be.visible');
    
    // Check avatar in mobile menu
    cy.get('div.mt-auto').within(() => {
      // Avatar should show initials
      cy.get('div').contains('AU').should('be.visible');
    });
    
    // Click Sign Out in mobile menu
    cy.get('button').contains('Sign Out').click();
    
    // Should redirect away from dashboard
    cy.url().should('not.include', '/dashboard');
  });
});