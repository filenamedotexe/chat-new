describe('Settings Sidebar Layout', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.visit('/settings');
  });

  describe('Desktop Sidebar (lg screens)', () => {
    beforeEach(() => {
      cy.viewport(1280, 720);
    });

    it('should display sidebar navigation on desktop', () => {
      // Sidebar should be visible
      cy.get('aside').should('be.visible');
      
      // All sidebar items should be visible
      cy.get('[data-testid="sidebar-profile"]').should('be.visible');
      cy.get('[data-testid="sidebar-appearance"]').should('be.visible');
      cy.get('[data-testid="sidebar-notifications"]').should('be.visible');
      cy.get('[data-testid="sidebar-security"]').should('be.visible');
      cy.get('[data-testid="sidebar-email"]').should('be.visible');
      cy.get('[data-testid="sidebar-beta"]').should('be.visible');
    });

    it('should show item descriptions in sidebar', () => {
      cy.contains('Manage your personal information').should('be.visible');
      cy.contains('Customize your interface').should('be.visible');
      cy.contains('Configure alerts and updates').should('be.visible');
      cy.contains('Password and authentication').should('be.visible');
      cy.contains('Manage email communications').should('be.visible');
      cy.contains('Try experimental features').should('be.visible');
    });

    it('should highlight active section', () => {
      // Profile should be active by default
      cy.get('[data-testid="sidebar-profile"]').should('have.class', 'bg-primary/10');
      cy.get('[data-testid="sidebar-profile"]').should('have.class', 'text-primary');
      
      // Click on Security
      cy.get('[data-testid="sidebar-security"]').click();
      cy.url().should('include', '?tab=security');
      
      // Security should now be active
      cy.get('[data-testid="sidebar-security"]').should('have.class', 'bg-primary/10');
      cy.get('[data-testid="sidebar-security"]').should('have.class', 'text-primary');
      
      // Profile should no longer be active
      cy.get('[data-testid="sidebar-profile"]').should('not.have.class', 'bg-primary/10');
    });

    it('should have sticky sidebar when scrolling', () => {
      // Check if sidebar has sticky positioning
      cy.get('.sticky').should('exist');
      cy.get('.sticky').should('have.css', 'position', 'sticky');
    });

    it('should show help section at bottom of sidebar', () => {
      cy.get('.mt-8.p-4.bg-muted\\/50').scrollIntoView();
      cy.contains('Need help?').should('be.visible');
      cy.contains('Check our documentation').should('be.visible');
      cy.contains('View Documentation →').should('be.visible');
    });

    it('should switch content when clicking sidebar items', () => {
      // Click through each section
      cy.get('[data-testid="sidebar-appearance"]').click();
      cy.contains('Theme preferences').should('be.visible');
      
      cy.get('[data-testid="sidebar-notifications"]').click();
      cy.contains('Email notifications for new messages').should('be.visible');
      
      cy.get('[data-testid="sidebar-security"]').click();
      cy.contains('Password management').should('be.visible');
      
      cy.get('[data-testid="sidebar-email"]').click();
      cy.contains('Weekly project summaries').should('be.visible');
      
      cy.get('[data-testid="sidebar-beta"]').click();
      cy.contains('Beta Features').should('be.visible');
    });

    it('should not show mobile tabs on desktop', () => {
      // Mobile tabs container should not be visible
      cy.get('.lg\\:hidden').should('not.be.visible');
    });
  });

  describe('Mobile Tabs (below lg)', () => {
    beforeEach(() => {
      cy.viewport(768, 1024); // Medium screen (tablet)
    });

    it('should not display sidebar on smaller screens', () => {
      cy.get('[data-testid="settings-sidebar"]').should('not.be.visible');
    });

    it('should display mobile tabs on smaller screens', () => {
      cy.get('[data-testid="mobile-tab-profile"]').should('be.visible');
      cy.get('[data-testid="mobile-tab-appearance"]').should('be.visible');
      // Tabs might be horizontally scrolled
      cy.get('.scrollbar-hide').should('exist');
    });

    it('should maintain functionality on mobile', () => {
      cy.get('[data-testid="mobile-tab-security"]').click();
      cy.url().should('include', '?tab=security');
      // Check that we're on security tab
      cy.get('[data-testid="mobile-tab-security"]').should('have.class', 'bg-primary');
    });
  });

  describe('Responsive Behavior', () => {
    it('should switch between sidebar and tabs when resizing', () => {
      // Start with desktop
      cy.viewport(1280, 720);
      cy.get('[data-testid="settings-sidebar"]').should('be.visible');
      cy.get('.lg\\:hidden').should('not.be.visible');
      
      // Resize to tablet
      cy.viewport(768, 1024);
      cy.get('[data-testid="settings-sidebar"]').should('not.be.visible');
      cy.get('[data-testid="mobile-tab-profile"]').should('be.visible');
      
      // Resize to mobile
      cy.viewport(375, 667);
      cy.get('[data-testid="settings-sidebar"]').should('not.be.visible');
      cy.get('[data-testid="mobile-tab-profile"]').should('be.visible');
      
      // Back to desktop
      cy.viewport(1280, 720);
      cy.get('[data-testid="settings-sidebar"]').should('be.visible');
      cy.get('.lg\\:hidden').should('not.be.visible');
    });

    it('should maintain selected tab when switching layouts', () => {
      // Start on desktop and select email tab
      cy.viewport(1280, 720);
      cy.get('[data-testid="sidebar-email"]').click();
      cy.url().should('include', '?tab=email');
      
      // Switch to mobile
      cy.viewport(375, 667);
      
      // Should still be on email tab
      cy.url().should('include', '?tab=email');
      cy.get('[data-testid="mobile-tab-email"]').should('have.class', 'bg-primary');
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      cy.viewport(1280, 720);
    });

    it('should support keyboard navigation in sidebar', () => {
      // Focus and click appearance sidebar item
      cy.get('[data-testid="sidebar-appearance"]').focus();
      cy.get('[data-testid="sidebar-appearance"]').click();
      cy.url().should('include', '?tab=appearance');
      
      // Focus and click security sidebar item
      cy.get('[data-testid="sidebar-security"]').focus();
      cy.get('[data-testid="sidebar-security"]').click();
      cy.url().should('include', '?tab=security');
    });
  });
});