describe('Settings Tabs', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.visit('/settings');
  });

  describe('Desktop View', () => {
    beforeEach(() => {
      cy.viewport(1280, 720);
    });

    it('should display all tabs', () => {
      cy.get('[data-testid="tab-profile"]').should('be.visible').and('contain', 'Profile');
      cy.get('[data-testid="tab-appearance"]').should('be.visible').and('contain', 'Appearance');
      cy.get('[data-testid="tab-notifications"]').should('be.visible').and('contain', 'Notifications');
      cy.get('[data-testid="tab-security"]').should('be.visible').and('contain', 'Security');
      cy.get('[data-testid="tab-email"]').should('be.visible').and('contain', 'Email');
      cy.get('[data-testid="tab-beta"]').should('be.visible').and('contain', 'Beta Features');
    });

    it('should show profile tab by default', () => {
      cy.get('[data-testid="tab-profile"]').should('have.class', 'text-primary');
      cy.contains('Profile Information').should('be.visible');
      cy.contains('admin@example.com').should('be.visible');
    });

    it('should switch between tabs and update URL', () => {
      // Click on Appearance tab
      cy.get('[data-testid="tab-appearance"]').click();
      cy.url().should('include', '?tab=appearance');
      cy.contains('Theme preferences').should('be.visible');
      
      // Click on Notifications tab
      cy.get('[data-testid="tab-notifications"]').click();
      cy.url().should('include', '?tab=notifications');
      cy.contains('Email notifications for new messages').should('be.visible');
      
      // Click on Security tab
      cy.get('[data-testid="tab-security"]').click();
      cy.url().should('include', '?tab=security');
      cy.contains('Password management and two-factor authentication').should('be.visible');
      
      // Click on Email tab
      cy.get('[data-testid="tab-email"]').click();
      cy.url().should('include', '?tab=email');
      cy.contains('Weekly project summaries').should('be.visible');
      
      // Click on Beta Features tab
      cy.get('[data-testid="tab-beta"]').click();
      cy.url().should('include', '?tab=beta');
      cy.contains('Beta Features').should('be.visible');
    });

    it('should maintain tab state on page reload', () => {
      // Navigate to security tab
      cy.get('[data-testid="tab-security"]').click();
      cy.url().should('include', '?tab=security');
      
      // Reload page
      cy.reload();
      
      // Should still be on security tab
      cy.url().should('include', '?tab=security');
      cy.get('[data-testid="tab-security"]').should('have.class', 'text-primary');
      cy.contains('Password management and two-factor authentication').should('be.visible');
    });
  });

  describe('Mobile View', () => {
    beforeEach(() => {
      cy.viewport(375, 667);
    });

    it('should display mobile tabs with horizontal scrolling', () => {
      // Mobile tabs should be visible
      cy.get('[data-testid="mobile-tab-profile"]').should('be.visible');
      cy.get('[data-testid="mobile-tab-appearance"]').should('be.visible');
      
      // Tabs container should be scrollable
      cy.get('.scrollbar-hide').should('have.css', 'overflow-x', 'auto');
    });

    it('should switch between tabs on mobile', () => {
      // Click on Notifications tab
      cy.get('[data-testid="mobile-tab-notifications"]').click();
      cy.url().should('include', '?tab=notifications');
      cy.get('[data-testid="mobile-tab-notifications"]').should('have.class', 'bg-primary');
      cy.contains('Email notifications for new messages').should('be.visible');
      
      // Click on Email tab
      cy.get('[data-testid="mobile-tab-email"]').click();
      cy.url().should('include', '?tab=email');
      cy.get('[data-testid="mobile-tab-email"]').should('have.class', 'bg-primary');
      cy.contains('Weekly project summaries').should('be.visible');
    });

    it('should hide desktop tabs on mobile', () => {
      cy.get('[data-testid="tab-profile"]').should('not.be.visible');
      cy.get('.hidden.md\\:block').should('exist');
    });
  });

  describe('Tab Content', () => {
    it('should display correct content for each tab', () => {
      // Profile tab
      cy.visit('/settings?tab=profile');
      cy.contains('Profile Information').should('be.visible');
      cy.contains('admin@example.com').should('be.visible');
      cy.contains('admin').should('be.visible');
      
      // Appearance tab
      cy.visit('/settings?tab=appearance');
      cy.contains('Appearance').should('be.visible');
      cy.contains('Theme preferences are automatically synced').should('be.visible');
      
      // Notifications tab
      cy.visit('/settings?tab=notifications');
      cy.contains('Notifications').should('be.visible');
      cy.get('input[type="checkbox"]').should('have.length.at.least', 3);
      
      // Security tab
      cy.visit('/settings?tab=security');
      cy.contains('Security').should('be.visible');
      cy.contains('Password management').should('be.visible');
      
      // Email tab
      cy.visit('/settings?tab=email');
      cy.contains('Email Preferences').should('be.visible');
      cy.contains('Weekly project summaries').should('be.visible');
    });
  });
});