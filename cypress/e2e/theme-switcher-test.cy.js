describe('Theme Switcher', () => {
  describe('Admin Role', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('admin@example.com');
      cy.get('input[type="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should toggle theme on desktop', () => {
      // Check initial light theme
      cy.get('html').should('not.have.class', 'dark');
      
      // Find and click theme toggle in desktop nav
      cy.get('[data-testid="theme-toggle"]').should('be.visible');
      cy.get('[data-testid="theme-toggle"]').click();
      
      // Verify dark theme is applied
      cy.get('html').should('have.class', 'dark');
      
      // Toggle back to light
      cy.get('[data-testid="theme-toggle"]').click();
      cy.get('html').should('not.have.class', 'dark');
    });

    it('should toggle theme on mobile', () => {
      // Set mobile viewport
      cy.viewport(375, 667);
      
      // Open mobile menu
      cy.get('[data-mobile-menu-trigger]').click();
      
      // Find and click theme toggle in mobile nav
      cy.get('[data-testid="mobile-theme-toggle"]').should('be.visible');
      cy.get('[data-testid="mobile-theme-toggle"]').click();
      
      // Verify dark theme is applied
      cy.get('html').should('have.class', 'dark');
      
      // Toggle back to light
      cy.get('[data-testid="mobile-theme-toggle"]').click();
      cy.get('html').should('not.have.class', 'dark');
    });

    it('should persist theme preference', () => {
      // Toggle to dark theme
      cy.get('[data-testid="theme-toggle"]').click();
      cy.get('html').should('have.class', 'dark');
      
      // Reload page
      cy.reload();
      
      // Verify dark theme persists
      cy.get('html').should('have.class', 'dark');
    });
  });

  describe('Client Role', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('user@example.com');
      cy.get('input[type="password"]').type('user123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should have theme toggle available for client users', () => {
      // Check desktop theme toggle
      cy.get('[data-testid="theme-toggle"]').should('be.visible');
      cy.get('[data-testid="theme-toggle"]').click();
      cy.get('html').should('have.class', 'dark');
      
      // Check mobile theme toggle
      cy.viewport(375, 667);
      cy.get('[data-mobile-menu-trigger]').click();
      cy.get('[data-testid="mobile-theme-toggle"]').should('be.visible');
    });
  });
});