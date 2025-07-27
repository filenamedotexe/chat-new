describe('Chat UI Modernization - Simple', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should show modernized chat interface', () => {
    // Navigate to projects list
    cy.visit('/projects');
    
    // Find a project card and click View Details
    cy.get('[data-testid="project-card"]').first().within(() => {
      cy.contains('View Details').click();
    });
    
    // Wait for project detail page
    cy.url().should('match', /\/projects\/[a-f0-9-]+$/);
    
    // Click Team Chat button
    cy.contains('button', 'Team Chat').click();
    
    // Verify we're on chat page
    cy.url().should('include', '/chat');
    cy.get('h1').should('contain', 'Chat');
    
    // Check modern UI elements
    cy.get('.border-b.bg-background\\/50').should('exist'); // Header
    cy.get('.border-t.bg-background\\/50').should('exist'); // Input area
    
    // Send a message
    cy.get('textarea[placeholder*="Send a message"]').type('Testing modern chat UI!');
    cy.get('button[aria-label="Send message"]').click();
    
    // Verify message appears with modern styling
    cy.contains('Testing modern chat UI!', { timeout: 10000 }).should('exist');
    
    // Check for rounded bubbles
    cy.get('.rounded-2xl').should('exist');
    cy.get('.shadow-sm').should('exist');
    
    // Check dark mode contrast classes are present
    cy.get('.bg-primary').should('exist'); // Sent message uses primary color
    // Note: Received messages would have bg-gray-100 dark:bg-gray-800 for proper contrast
    
    // Check avatar exists
    cy.get('.rounded-full').should('exist').and('contain.text', 'A');
    
    // Send another message to test grouping
    cy.get('textarea').type('Second message for grouping test');
    cy.get('button[aria-label="Send message"]').click();
    
    // Check for message grouping
    cy.get('.-mt-2').should('exist'); // Reduced spacing for grouped messages
    
    // Test markdown
    cy.get('textarea').type('Testing **bold** and _italic_ text');
    cy.get('button[aria-label="Send message"]').click();
    
    cy.get('strong').should('exist').and('contain', 'bold');
    cy.get('em').should('exist').and('contain', 'italic');
  });

  it('should work on mobile viewport', () => {
    cy.viewport(375, 667);
    
    // Navigate to projects
    cy.visit('/projects');
    
    // Click on a project
    cy.get('[data-testid="project-card"]').first().within(() => {
      cy.contains('View Details').click();
    });
    
    // Click Team Chat
    cy.contains('button', 'Team Chat').click();
    
    // Check chat loads on mobile
    cy.url().should('include', '/chat');
    
    // Send a message
    cy.get('textarea[placeholder*="Send a message"]').type('Mobile test message');
    cy.get('button[aria-label="Send message"]').click();
    
    // Verify message appears
    cy.contains('Mobile test message').should('exist');
    
    // Check max width constraint
    cy.get('.max-w-\\[70\\%\\]').should('exist');
    
    // Test long message wrapping
    const longMsg = 'This is a very long message that should wrap properly on mobile without causing horizontal scroll';
    cy.get('textarea').type(longMsg);
    cy.get('button[aria-label="Send message"]').click();
    
    cy.contains(longMsg).should('exist');
    cy.get('.overflow-wrap-anywhere').should('exist');
  });

  it('should support keyboard shortcuts', () => {
    cy.visit('/projects');
    cy.get('[data-testid="project-card"]').first().within(() => {
      cy.contains('View Details').click();
    });
    cy.contains('button', 'Team Chat').click();
    
    // Test Enter to send
    cy.get('textarea').type('Keyboard test{enter}');
    cy.contains('Keyboard test').should('exist');
    
    // Test Shift+Enter for newline
    cy.get('textarea').type('Line 1{shift+enter}Line 2');
    cy.get('textarea').should('have.value', 'Line 1\nLine 2');
    
    // Clear textarea
    cy.get('textarea').clear();
    
    // Test character counter
    cy.get('textarea').type('x'.repeat(50));
    cy.contains('50/5000').should('be.visible');
  });
});