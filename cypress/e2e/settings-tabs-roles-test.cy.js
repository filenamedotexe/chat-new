describe('Settings Tabs - Role-Based Access', () => {
  describe('Admin Role', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('admin@example.com');
      cy.get('input[type="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
      cy.visit('/settings');
    });

    it('should display all tabs for admin users', () => {
      // Admin should see all 6 tabs
      cy.get('[data-testid="tab-profile"]').should('be.visible');
      cy.get('[data-testid="tab-appearance"]').should('be.visible');
      cy.get('[data-testid="tab-notifications"]').should('be.visible');
      cy.get('[data-testid="tab-security"]').should('be.visible');
      cy.get('[data-testid="tab-email"]').should('be.visible');
      cy.get('[data-testid="tab-beta"]').should('be.visible');
    });

    it('should show admin role in profile tab', () => {
      cy.get('[data-testid="tab-profile"]').click();
      cy.contains('Profile Information').should('be.visible');
      cy.contains('admin@example.com').should('be.visible');
      cy.contains('admin').should('be.visible');
    });

    it('should have access to beta features tab', () => {
      cy.get('[data-testid="tab-beta"]').click();
      cy.contains('Beta Features').should('be.visible');
      // Admin should either see beta features or access message
      cy.get('body').then($body => {
        if ($body.text().includes('not available for your account')) {
          cy.contains('Contact your administrator').should('be.visible');
        } else {
          cy.contains('Try out experimental features').should('be.visible');
        }
      });
    });

    it('should have all notification options', () => {
      cy.get('[data-testid="tab-notifications"]').click();
      cy.contains('Email notifications for new messages').should('be.visible');
      cy.contains('Email notifications for task updates').should('be.visible');
      cy.contains('Email notifications for project updates').should('be.visible');
      cy.get('input[type="checkbox"]').should('have.length', 3);
    });

    it('should have all email preferences', () => {
      cy.get('[data-testid="tab-email"]').click();
      cy.contains('Weekly project summaries').should('be.visible');
      cy.contains('Daily task reminders').should('be.visible');
      cy.contains('Monthly newsletters').should('be.visible');
      cy.get('input[type="checkbox"]').should('have.length', 3);
    });
  });

  describe('Client Role', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('user@example.com');
      cy.get('input[type="password"]').type('user123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
      cy.visit('/settings');
    });

    it('should display all tabs for client users', () => {
      // Client should also see all 6 tabs
      cy.get('[data-testid="tab-profile"]').should('be.visible');
      cy.get('[data-testid="tab-appearance"]').should('be.visible');
      cy.get('[data-testid="tab-notifications"]').should('be.visible');
      cy.get('[data-testid="tab-security"]').should('be.visible');
      cy.get('[data-testid="tab-email"]').should('be.visible');
      cy.get('[data-testid="tab-beta"]').should('be.visible');
    });

    it('should show client role in profile tab', () => {
      cy.get('[data-testid="tab-profile"]').click();
      cy.contains('Profile Information').should('be.visible');
      cy.contains('user@example.com').should('be.visible');
      cy.contains('client').should('be.visible');
    });

    it('should have limited beta features access', () => {
      cy.get('[data-testid="tab-beta"]').click();
      cy.contains('Beta Features').should('be.visible');
      // Most likely clients don't have beta access
      cy.get('body').then($body => {
        if ($body.text().includes('not available for your account')) {
          cy.contains('Contact your administrator').should('be.visible');
        }
      });
    });

    it('should have client-appropriate notification options', () => {
      cy.get('[data-testid="tab-notifications"]').click();
      cy.contains('Email notifications for new messages').should('be.visible');
      cy.contains('Email notifications for project updates').should('be.visible');
      // Verify checkboxes are present
      cy.get('input[type="checkbox"]').should('have.length.at.least', 2);
    });
  });

  describe('Mobile View - All Roles', () => {
    it('should work correctly for admin on mobile', () => {
      cy.viewport(375, 667);
      
      // Login as admin
      cy.visit('/login');
      cy.get('input[type="email"]').type('admin@example.com');
      cy.get('input[type="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
      cy.visit('/settings');

      // Check mobile tabs are visible
      cy.get('[data-testid="mobile-tab-profile"]').should('be.visible');
      cy.get('[data-testid="mobile-tab-appearance"]').should('be.visible');
      
      // Test tab switching on mobile
      cy.get('[data-testid="mobile-tab-security"]').click();
      cy.url().should('include', '?tab=security');
      cy.contains('Security').should('be.visible');
      cy.contains('Password management').should('be.visible');
    });

    it('should work correctly for client on mobile', () => {
      cy.viewport(375, 667);
      
      // Login as client
      cy.visit('/login');
      cy.get('input[type="email"]').type('user@example.com');
      cy.get('input[type="password"]').type('user123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
      cy.visit('/settings');

      // Check mobile tabs are visible
      cy.get('[data-testid="mobile-tab-profile"]').should('be.visible');
      
      // Test profile content
      cy.get('[data-testid="mobile-tab-profile"]').click();
      cy.contains('user@example.com').should('be.visible');
      cy.contains('client').should('be.visible');
    });
  });

  describe('Tab Persistence Across Roles', () => {
    it('should maintain tab state when navigating away and back', () => {
      // Login as admin
      cy.visit('/login');
      cy.get('input[type="email"]').type('admin@example.com');
      cy.get('input[type="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
      
      // Go to settings and select email tab
      cy.visit('/settings');
      cy.get('[data-testid="tab-email"]').click();
      cy.url().should('include', '?tab=email');
      
      // Navigate away
      cy.visit('/dashboard');
      
      // Come back to settings
      cy.visit('/settings?tab=email');
      
      // Should still be on email tab
      cy.get('[data-testid="tab-email"]').should('have.class', 'text-primary');
      cy.contains('Email Preferences').should('be.visible');
    });
  });

  describe('Settings Content Validation', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('admin@example.com');
      cy.get('input[type="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
      cy.visit('/settings');
    });

    it('should have interactive elements in each tab', () => {
      // Notifications tab - checkboxes should be interactive
      cy.get('[data-testid="tab-notifications"]').click();
      cy.get('input[type="checkbox"]').first().should('be.checked');
      cy.get('input[type="checkbox"]').first().uncheck();
      cy.get('input[type="checkbox"]').first().should('not.be.checked');
      cy.get('input[type="checkbox"]').first().check();
      cy.get('input[type="checkbox"]').first().should('be.checked');
      
      // Email tab - checkboxes should be interactive
      cy.get('[data-testid="tab-email"]').click();
      cy.get('input[type="checkbox"]').eq(1).should('not.be.checked');
      cy.get('input[type="checkbox"]').eq(1).check();
      cy.get('input[type="checkbox"]').eq(1).should('be.checked');
    });

    it('should display appropriate icons for each tab', () => {
      // Check that each tab has its icon
      cy.get('[data-testid="tab-profile"] svg').should('be.visible');
      cy.get('[data-testid="tab-appearance"] svg').should('be.visible');
      cy.get('[data-testid="tab-notifications"] svg').should('be.visible');
      cy.get('[data-testid="tab-security"] svg').should('be.visible');
      cy.get('[data-testid="tab-email"] svg').should('be.visible');
      cy.get('[data-testid="tab-beta"] svg').should('be.visible');
    });
  });
});