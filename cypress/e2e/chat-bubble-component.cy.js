describe('Chat Bubble Component (Phase 2.1)', () => {
  beforeEach(() => {
    // Visit the test page for the chat bubble
    cy.visit('/test-chat-bubble');
    
    // Wait for animations to complete
    cy.wait(1000);
  });

  describe('Component Rendering and Positioning', () => {
    it('should render the chat bubble in bottom-right corner', () => {
      // Check that chat bubble exists
      cy.get('[data-testid="chat-bubble"]')
        .should('be.visible')
        .and('have.class', 'fixed')
        .and('have.class', 'bottom-6')
        .and('have.class', 'right-6');

      // Take screenshot of initial state
      cy.screenshot('chat-bubble-initial-state');
    });

    it('should have proper z-index for overlay positioning', () => {
      cy.get('[data-testid="chat-bubble"]')
        .should('have.class', 'z-50');
    });

    it('should show scale animation on mount', () => {
      // Reload page to see animation
      cy.reload();
      
      // Chat bubble should start hidden then appear
      cy.get('[data-testid="chat-bubble"]')
        .should('be.visible');
      
      // Take screenshot after animation
      cy.wait(500);
      cy.screenshot('chat-bubble-after-animation');
    });
  });

  describe('Interactive Behavior', () => {
    it('should toggle between chat and close icons when clicked', () => {
      // Initial state should show chat icon
      cy.get('[data-testid="chat-bubble"]').within(() => {
        cy.get('svg').should('exist');
      });
      
      // Take screenshot of chat icon state
      cy.screenshot('chat-bubble-chat-icon');
      
      // Click to toggle to close icon
      cy.get('[data-testid="chat-bubble"]').click();
      
      // Wait for icon transition
      cy.wait(300);
      
      // Should now show close icon (X)
      cy.get('[data-testid="chat-bubble"]').within(() => {
        cy.get('svg').should('exist');
      });
      
      // Take screenshot of close icon state
      cy.screenshot('chat-bubble-close-icon');
      
      // Click again to toggle back
      cy.get('[data-testid="chat-bubble"]').click();
      cy.wait(300);
      
      // Should be back to chat icon
      cy.screenshot('chat-bubble-back-to-chat-icon');
    });

    it('should show hover effects on desktop', () => {
      // Hover over the bubble
      cy.get('[data-testid="chat-bubble"]').trigger('mouseover');
      
      // Wait for hover animations
      cy.wait(200);
      
      // Take screenshot of hover state
      cy.screenshot('chat-bubble-hover-state');
      
      // Move mouse away
      cy.get('[data-testid="chat-bubble"]').trigger('mouseout');
      cy.wait(200);
    });
  });

  describe('Status Indicator', () => {
    it('should show online status by default', () => {
      // Check for online indicator
      cy.get('[data-testid="chat-bubble"]').within(() => {
        cy.get('[title*="online"]').should('be.visible');
      });
      
      // Take screenshot of online status
      cy.screenshot('chat-bubble-online-status');
    });

    it('should toggle to offline status', () => {
      // Click toggle online button in controls
      cy.contains('Toggle Online').click();
      
      // Wait for status change
      cy.wait(200);
      
      // Check for offline indicator
      cy.get('[data-testid="chat-bubble"]').within(() => {
        cy.get('[title*="offline"]').should('be.visible');
      });
      
      // Take screenshot of offline status
      cy.screenshot('chat-bubble-offline-status');
      
      // Toggle back to online
      cy.contains('Toggle Online').click();
      cy.wait(200);
      cy.screenshot('chat-bubble-back-to-online');
    });
  });

  describe('Unread Count Badge', () => {
    it('should show unread count badge with default value', () => {
      // Should show unread count (default is 3)
      cy.get('[data-testid="chat-bubble"]').within(() => {
        cy.contains('3').should('be.visible');
      });
      
      // Take screenshot with unread count
      cy.screenshot('chat-bubble-with-unread-count');
    });

    it('should hide badge when unread count is zero', () => {
      // Click to toggle unread count to 0
      cy.contains('Toggle Unread Count').click();
      
      // Wait for animation
      cy.wait(300);
      
      // Badge should not be visible
      cy.get('[data-testid="chat-bubble"]').within(() => {
        cy.contains('3').should('not.exist');
      });
      
      // Take screenshot without unread count
      cy.screenshot('chat-bubble-no-unread-count');
      
      // Toggle back to show count
      cy.contains('Toggle Unread Count').click();
      cy.wait(300);
      cy.screenshot('chat-bubble-unread-count-restored');
    });

    it('should show pulse animation with unread messages', () => {
      // Ensure we have unread count
      cy.get('[data-testid="chat-bubble"]').within(() => {
        cy.contains('3').should('be.visible');
      });
      
      // Take screenshot during pulse animation
      cy.wait(500);
      cy.screenshot('chat-bubble-pulse-animation');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      cy.get('[data-testid="chat-bubble"] button')
        .should('have.attr', 'aria-label')
        .and('include', 'chat');
        
      cy.get('[data-testid="chat-bubble"] button')
        .should('have.attr', 'aria-expanded', 'false');
    });

    it('should update ARIA labels when toggled', () => {
      // Click to open
      cy.get('[data-testid="chat-bubble"]').click();
      
      // Should update ARIA labels
      cy.get('[data-testid="chat-bubble"] button')
        .should('have.attr', 'aria-label')
        .and('include', 'Close');
        
      cy.get('[data-testid="chat-bubble"] button')
        .should('have.attr', 'aria-expanded', 'true');
    });

    it('should be keyboard accessible', () => {
      // Focus the button
      cy.get('[data-testid="chat-bubble"] button').focus();
      
      // Should be visually focused
      cy.get('[data-testid="chat-bubble"] button')
        .should('have.focus');
      
      // Take screenshot of focus state
      cy.screenshot('chat-bubble-focus-state');
      
      // Press Enter to activate
      cy.get('[data-testid="chat-bubble"] button').type('{enter}');
      
      // Should toggle state
      cy.wait(300);
      cy.screenshot('chat-bubble-after-keyboard-activation');
    });
  });

  describe('Mobile Responsive Behavior', () => {
    it('should adjust size for mobile viewport', () => {
      // Switch to mobile viewport
      cy.viewport(375, 667); // iPhone 6/7/8 size
      
      // Wait for responsive changes
      cy.wait(200);
      
      // Take screenshot on mobile
      cy.screenshot('chat-bubble-mobile-view');
      
      // Bubble should still be visible and properly positioned
      cy.get('[data-testid="chat-bubble"]')
        .should('be.visible');
    });

    it('should work on tablet viewport', () => {
      // Switch to tablet viewport
      cy.viewport(768, 1024); // iPad size
      
      cy.wait(200);
      cy.screenshot('chat-bubble-tablet-view');
      
      // Test interaction on tablet
      cy.get('[data-testid="chat-bubble"]').click();
      cy.wait(300);
      cy.screenshot('chat-bubble-tablet-clicked');
    });

    it('should work on large desktop viewport', () => {
      // Switch to large desktop
      cy.viewport(1920, 1080);
      
      cy.wait(200);
      cy.screenshot('chat-bubble-desktop-large');
      
      // Test hover on large screen
      cy.get('[data-testid="chat-bubble"]').trigger('mouseover');
      cy.wait(200);
      cy.screenshot('chat-bubble-desktop-large-hover');
    });
  });

  describe('Component State Combinations', () => {
    it('should handle all state combinations correctly', () => {
      // Test: Online + Unread + Closed
      cy.screenshot('state-online-unread-closed');
      
      // Test: Online + Unread + Open
      cy.get('[data-testid="chat-bubble"]').click();
      cy.wait(300);
      cy.screenshot('state-online-unread-open');
      
      // Test: Online + No Unread + Open
      cy.contains('Toggle Unread Count').click();
      cy.wait(300);
      cy.screenshot('state-online-no-unread-open');
      
      // Test: Offline + No Unread + Open
      cy.contains('Toggle Online').click();
      cy.wait(300);
      cy.screenshot('state-offline-no-unread-open');
      
      // Test: Offline + No Unread + Closed
      cy.get('[data-testid="chat-bubble"]').click();
      cy.wait(300);
      cy.screenshot('state-offline-no-unread-closed');
      
      // Test: Offline + Unread + Closed
      cy.contains('Toggle Unread Count').click();
      cy.wait(300);
      cy.screenshot('state-offline-unread-closed');
    });
  });

  describe('Visual Regression Tests', () => {
    it('should match visual baseline for default state', () => {
      // Ensure consistent state
      cy.contains('Toggle Open: Closed').should('be.visible');
      cy.contains('Toggle Unread Count: 3').should('be.visible');
      cy.contains('Toggle Online: Online').should('be.visible');
      
      // Take baseline screenshot
      cy.screenshot('chat-bubble-visual-baseline');
    });

    it('should maintain visual consistency across interactions', () => {
      // Perform a series of interactions
      cy.get('[data-testid="chat-bubble"]').click(); // Open
      cy.wait(300);
      cy.get('[data-testid="chat-bubble"]').click(); // Close
      cy.wait(300);
      
      // Should look identical to baseline
      cy.screenshot('chat-bubble-after-interactions');
    });
  });
});