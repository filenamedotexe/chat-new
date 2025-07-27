describe('Chat Input Enhancements', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Navigate to a project chat
    cy.visit('/projects');
    cy.get('[data-testid="project-card"]').first().within(() => {
      cy.contains('View Details').click();
    });
    cy.contains('button', 'Team Chat').click();
    cy.url().should('include', '/chat');
  });

  describe('Desktop View', () => {
    beforeEach(() => {
      cy.viewport(1280, 720);
    });

    it('should display enhanced input field with larger size', () => {
      // Check textarea has larger minimum height
      cy.get('textarea').should('have.class', 'lg:min-h-[56px]');
      cy.get('textarea').should('have.class', 'text-base');
      cy.get('textarea').should('have.class', 'lg:text-lg');
      
      // Check rounded corners
      cy.get('textarea').should('have.class', 'rounded-xl');
      
      // Check padding
      cy.get('textarea').should('have.class', 'px-4');
      cy.get('textarea').should('have.class', 'py-3');
    });

    it('should display enhanced buttons with better placement', () => {
      // Check send button size and styling
      cy.get('button[aria-label="Send message"]').should('have.class', 'h-10');
      cy.get('button[aria-label="Send message"]').should('have.class', 'lg:h-11');
      cy.get('button[aria-label="Send message"]').should('have.class', 'rounded-xl');
      
      // Check icon buttons have consistent sizing
      cy.get('button[title="Emojis coming soon"]').should('have.class', 'h-10');
      cy.get('button[title="Emojis coming soon"]').should('have.class', 'lg:h-11');
      
      // Check hover states
      cy.get('button[title="Emojis coming soon"]').should('have.class', 'hover:bg-muted');
    });

    it('should show enhanced character count display', () => {
      // Type a short message
      cy.get('textarea').type('Hello');
      cy.contains('5/5000').should('exist');
      cy.get('.text-muted-foreground').contains('5/5000').should('exist');
      
      // Clear and type a long message (over 4500 chars)
      cy.get('textarea').clear();
      const longMessage = 'x'.repeat(4501);
      cy.get('textarea').type(longMessage, { delay: 0 });
      
      // Should show warning color
      cy.get('.text-warning').contains('4501/5000').should('exist');
      cy.contains('499 characters left').should('exist');
      
      // Type even more (over 4900 chars)
      cy.get('textarea').clear();
      const veryLongMessage = 'x'.repeat(4901);
      cy.get('textarea').type(veryLongMessage, { delay: 0 });
      
      // Should show destructive color
      cy.get('.text-destructive').contains('4901/5000').should('exist');
      cy.contains('99 characters left').should('exist');
    });

    it('should display keyboard shortcuts nicely', () => {
      // Check for kbd elements
      cy.get('kbd').contains('Enter').should('exist');
      cy.get('kbd').contains('Shift+Enter').should('exist');
      
      // Check styling
      cy.get('kbd').first().should('have.class', 'px-1.5');
      cy.get('kbd').first().should('have.class', 'rounded');
      cy.get('kbd').first().should('have.class', 'bg-muted');
    });

    it('should handle message sending with animations', () => {
      // Type and send a message
      cy.get('textarea').type('Test message');
      cy.get('button[aria-label="Send message"]').click();
      
      // Check message appears
      cy.contains('Test message').should('exist');
      
      // Textarea should be cleared
      cy.get('textarea').should('have.value', '');
    });
  });

  describe('Mobile View', () => {
    beforeEach(() => {
      cy.viewport(375, 667);
    });

    it('should be responsive on mobile', () => {
      // Check minimum height is appropriate for mobile
      cy.get('textarea').should('have.class', 'min-h-[48px]');
      
      // Check text size
      cy.get('textarea').should('have.class', 'text-base');
      
      // Check buttons are properly sized
      cy.get('button[aria-label="Send message"]').should('have.class', 'h-10');
      
      // Check padding is appropriate
      cy.get('.border-t.bg-background\\/50').should('have.class', 'p-4');
    });

    it('should show condensed keyboard shortcuts on mobile', () => {
      // Should hide "Press" text on mobile
      cy.get('span.hidden.sm\\:inline').contains('Press').should('not.be.visible');
      
      // Should still show Enter key
      cy.get('kbd').contains('Enter').should('be.visible');
      
      // Should hide Shift+Enter on mobile
      cy.get('span.hidden.sm\\:inline').contains('for new line').should('not.be.visible');
    });

    it('should handle long messages on mobile', () => {
      const longMessage = 'This is a long message that should work well on mobile devices without any issues';
      cy.get('textarea').type(longMessage);
      
      // Just verify the message can be typed and sent
      cy.get('textarea').should('have.value', longMessage);
      
      // Send the message
      cy.get('button[aria-label="Send message"]').click();
      
      // Verify message sent
      cy.contains(longMessage).should('exist');
      
      // Verify textarea cleared
      cy.get('textarea').should('have.value', '');
    });
  });

  describe('Functionality Tests', () => {
    it('should handle Enter key to send', () => {
      cy.get('textarea').type('Enter key test{enter}');
      cy.contains('Enter key test').should('exist');
    });

    it('should handle Shift+Enter for new line', () => {
      cy.get('textarea').type('Line 1{shift+enter}Line 2');
      cy.get('textarea').should('have.value', 'Line 1\nLine 2');
      
      // Send the message
      cy.get('button[aria-label="Send message"]').click();
      cy.contains('Line 1').should('exist');
    });

    it('should auto-resize textarea', () => {
      // Get initial height
      cy.get('textarea').invoke('height').then((initialHeight) => {
        // Type multiple lines
        cy.get('textarea').type('Line 1{shift+enter}Line 2{shift+enter}Line 3{shift+enter}Line 4');
        
        // Height should increase
        cy.get('textarea').invoke('height').should('be.gt', initialHeight);
      });
    });

    it('should respect max height', () => {
      // Type many lines to exceed max height
      const manyLines = Array(20).fill('Line').join('{shift+enter}');
      cy.get('textarea').type(manyLines, { delay: 0 });
      
      // Should have max-h-32 class (128px)
      cy.get('textarea').should('have.class', 'max-h-32');
    });
  });
});