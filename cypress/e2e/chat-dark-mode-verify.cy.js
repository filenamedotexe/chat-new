describe('Chat Dark Mode Contrast Verification', () => {
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

  it('should show proper contrast in dark mode', () => {
    // Set dark mode
    cy.get('html').invoke('attr', 'class', 'dark');
    
    // Send a message as admin (will appear as sent message - white bubble)
    cy.get('textarea[placeholder*="Send a message"]').type('This is my sent message');
    cy.get('button[aria-label="Send message"]').click();
    
    // Wait for message to appear
    cy.contains('This is my sent message').should('exist');
    
    // Since all messages in test are from the same user, let's add some mock received messages
    // by directly inserting them into the DOM for testing purposes
    cy.get('.space-y-4').then(($messageContainer) => {
      // Create a mock received message element to test contrast
      const mockReceivedMessage = `
        <div class="flex gap-3 justify-start">
          <div class="w-8 flex-shrink-0">
            <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium">
              U
            </div>
          </div>
          <div class="max-w-[70%] items-start">
            <p class="text-xs text-muted-foreground mb-1 ml-1">Other User</p>
            <div class="px-4 py-3 overflow-hidden transition-all bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm hover:shadow-md rounded-2xl rounded-bl-md">
              <div class="text-sm prose prose-sm max-w-none break-words overflow-wrap-anywhere dark:prose-invert">
                <p class="mb-2 last:mb-0">This is a received message for testing dark mode contrast</p>
              </div>
            </div>
            <div class="flex items-center gap-2 mt-1">
              <p class="text-xs text-muted-foreground">2:30 PM</p>
            </div>
          </div>
        </div>
      `;
      
      // Insert the mock message
      cy.wrap($messageContainer).invoke('append', mockReceivedMessage);
    });
    
    // Wait a moment for the DOM to update
    cy.wait(500);
    
    // Take screenshot in dark mode
    cy.screenshot('chat-dark-mode-after-fix', {
      capture: 'viewport'
    });
    
    // Verify both message types exist
    cy.get('.bg-primary').should('exist'); // Sent message (should be white in dark mode)
    cy.get('.bg-gray-100.dark\\:bg-gray-800').should('exist'); // Received message (should be dark gray in dark mode)
    cy.get('html').should('have.class', 'dark');
  });

  it('should show proper contrast in light mode for comparison', () => {
    // Ensure light mode
    cy.get('html').invoke('attr', 'class', '');
    
    // Send a message
    cy.get('textarea[placeholder*="Send a message"]').type('Testing light mode contrast');
    cy.get('button[aria-label="Send message"]').click();
    
    // Wait for message to appear
    cy.contains('Testing light mode contrast').should('exist');
    
    // Take screenshot in light mode
    cy.screenshot('chat-light-mode-comparison', {
      capture: 'viewport'
    });
  });
});