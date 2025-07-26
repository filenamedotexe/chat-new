describe('Toggle Component - Complete Testing', () => {
  describe('Admin Role', () => {
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

      it('should display toggle switches in notifications tab', () => {
        cy.get('[data-testid="sidebar-notifications"]').click();
        
        // Should have exactly 3 toggles visible (desktop only)
        cy.get('.hidden.lg\\:block button[role="switch"]').should('have.length', 3);
        
        // Check that old checkboxes are gone
        cy.get('.hidden.lg\\:block input[type="checkbox"]:visible').should('not.exist');
      });

      it('should have working toggles in notifications tab', () => {
        cy.get('[data-testid="sidebar-notifications"]').click();
        
        // Get the first toggle in desktop view
        cy.get('.hidden.lg\\:block button[role="switch"]').first().as('messagesToggle');
        
        // Should start as on
        cy.get('@messagesToggle').should('have.attr', 'aria-checked', 'true');
        cy.get('@messagesToggle').should('have.class', 'bg-primary');
        
        // Click to turn off
        cy.get('@messagesToggle').click();
        cy.get('@messagesToggle').should('have.attr', 'aria-checked', 'false');
        cy.get('@messagesToggle').should('have.class', 'bg-muted');
        
        // Click to turn back on
        cy.get('@messagesToggle').click();
        cy.get('@messagesToggle').should('have.attr', 'aria-checked', 'true');
      });

      it('should display toggle switches in email tab', () => {
        cy.get('[data-testid="sidebar-email"]').click();
        
        // Should have exactly 3 toggles
        cy.get('.hidden.lg\\:block button[role="switch"]').should('have.length', 3);
        
        // Check initial states
        cy.get('.hidden.lg\\:block button[role="switch"]').eq(0).should('have.attr', 'aria-checked', 'true'); // Weekly
        cy.get('.hidden.lg\\:block button[role="switch"]').eq(1).should('have.attr', 'aria-checked', 'false'); // Daily
        cy.get('.hidden.lg\\:block button[role="switch"]').eq(2).should('have.attr', 'aria-checked', 'true'); // Newsletter
      });

      it('should toggle independently in email tab', () => {
        cy.get('[data-testid="sidebar-email"]').click();
        
        // Toggle daily reminders on
        cy.get('.hidden.lg\\:block button[role="switch"]').eq(1).as('dailyToggle');
        cy.get('@dailyToggle').click();
        cy.get('@dailyToggle').should('have.attr', 'aria-checked', 'true');
        
        // Other toggles should remain unchanged
        cy.get('.hidden.lg\\:block button[role="switch"]').eq(0).should('have.attr', 'aria-checked', 'true');
        cy.get('.hidden.lg\\:block button[role="switch"]').eq(2).should('have.attr', 'aria-checked', 'true');
      });

      it('should have proper labels and descriptions', () => {
        cy.get('[data-testid="sidebar-notifications"]').click();
        
        cy.contains('New Messages').should('be.visible');
        cy.contains('Get notified when you receive new messages').should('be.visible');
        
        cy.contains('Task Updates').should('be.visible');
        cy.contains('Stay informed about task assignments and status changes').should('be.visible');
        
        cy.contains('Project Updates').should('be.visible');
        cy.contains('Receive updates about project milestones and changes').should('be.visible');
      });

      it('should handle beta features if available', () => {
        cy.get('[data-testid="sidebar-beta"]').click();
        
        cy.get('body').then($body => {
          if ($body.text().includes('Voice Chat')) {
            // Beta features are available
            cy.get('.hidden.lg\\:block button[role="switch"]').should('have.length.at.least', 2);
            
            // AI Assistant should be disabled
            cy.get('.hidden.lg\\:block button[role="switch"][disabled]').should('exist');
          } else {
            // Beta features not available
            cy.contains('not available for your account').should('be.visible');
          }
        });
      });
    });

    describe('Mobile View', () => {
      beforeEach(() => {
        cy.viewport(375, 667);
      });

      it('should work on mobile notifications tab', () => {
        cy.get('[data-testid="mobile-tab-notifications"]').click();
        
        // Should have toggles visible
        cy.get('.lg\\:hidden button[role="switch"]').should('have.length', 3);
        
        // Test toggle functionality
        cy.get('.lg\\:hidden button[role="switch"]').first().as('mobileToggle');
        cy.get('@mobileToggle').should('have.attr', 'aria-checked', 'true');
        cy.get('@mobileToggle').click();
        cy.get('@mobileToggle').should('have.attr', 'aria-checked', 'false');
      });
    });

    describe('Accessibility', () => {
      beforeEach(() => {
        cy.viewport(1280, 720);
        cy.get('[data-testid="sidebar-notifications"]').click();
      });

      it('should support keyboard navigation', () => {
        cy.get('.hidden.lg\\:block button[role="switch"]').first().focus();
        
        // Space key should toggle
        cy.focused().type(' ');
        cy.get('.hidden.lg\\:block button[role="switch"]').first().should('have.attr', 'aria-checked', 'false');
        
        // Enter key should also toggle
        cy.focused().type('{enter}');
        cy.get('.hidden.lg\\:block button[role="switch"]').first().should('have.attr', 'aria-checked', 'true');
      });

      it('should have proper ARIA attributes', () => {
        cy.get('.hidden.lg\\:block button[role="switch"]').first().should('have.attr', 'role', 'switch');
        cy.get('.hidden.lg\\:block button[role="switch"]').first().should('have.attr', 'aria-checked');
        cy.get('.hidden.lg\\:block button[role="switch"]').first().should('have.attr', 'aria-label');
      });

      it('should show focus ring', () => {
        cy.get('.hidden.lg\\:block button[role="switch"]').first().focus();
        cy.focused().should('have.class', 'focus:ring-2');
      });
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
      cy.viewport(1280, 720);
    });

    it('should have toggle switches for client users', () => {
      cy.get('[data-testid="sidebar-notifications"]').click();
      
      // Client should see notification toggles
      cy.get('.hidden.lg\\:block button[role="switch"]').should('have.length', 3);
      
      // Check they work
      cy.get('.hidden.lg\\:block button[role="switch"]').first().click();
      cy.get('.hidden.lg\\:block button[role="switch"]').first().should('have.attr', 'aria-checked', 'false');
    });

    it('should have email preferences toggles for clients', () => {
      cy.get('[data-testid="sidebar-email"]').click();
      
      // Should have all email toggles
      cy.get('.hidden.lg\\:block button[role="switch"]').should('have.length', 3);
      cy.contains('Weekly Project Summaries').should('be.visible');
      cy.contains('Daily Task Reminders').should('be.visible');
      cy.contains('Monthly Newsletter').should('be.visible');
    });

    it('should handle beta features for clients', () => {
      cy.get('[data-testid="sidebar-beta"]').click();
      
      // Most clients won't have beta access
      cy.contains('Beta').should('be.visible');
      // Either shows features or "not available" message
      cy.get('body').should('contain.text', 'Beta');
    });
  });

  describe('Visual States', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('admin@example.com');
      cy.get('input[type="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
      cy.visit('/settings');
      cy.viewport(1280, 720);
      cy.get('[data-testid="sidebar-notifications"]').click();
    });

    it('should have smooth animations', () => {
      // Check transition classes
      cy.get('.hidden.lg\\:block button[role="switch"]').first().should('have.class', 'transition-colors');
      cy.get('.hidden.lg\\:block button[role="switch"] span').first().should('have.class', 'transition-transform');
    });

    it('should show disabled state properly', () => {
      cy.get('[data-testid="sidebar-beta"]').click();
      
      cy.get('body').then($body => {
        if ($body.text().includes('AI Assistant')) {
          // Find disabled toggle
          cy.get('.hidden.lg\\:block button[role="switch"][disabled]').should('have.class', 'opacity-50');
          cy.get('.hidden.lg\\:block button[role="switch"][disabled]').should('have.class', 'cursor-not-allowed');
        }
      });
    });
  });
});