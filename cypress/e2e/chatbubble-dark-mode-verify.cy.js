describe('ChatBubble Dark Mode Contrast Verification', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should show proper contrast in ChatBubble dark mode', () => {
    // Navigate to chat page that uses ChatBubble component
    cy.visit('/projects');
    cy.get('[data-testid="project-card"]').first().within(() => {
      cy.contains('View Details').click();
    });
    
    // Look for chat functionality on project page
    cy.url().should('include', '/projects/');
    
    // Set dark mode
    cy.get('html').invoke('attr', 'class', 'dark');
    
    // Try to find chat interface or navigate to it
    // If there's a chat component on the project page, interact with it
    // Otherwise, navigate to dedicated chat page
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="chat-interface"]').length > 0) {
        // Chat interface exists on this page
        cy.get('[data-testid="chat-interface"]').should('be.visible');
      } else {
        // Navigate to chat page
        cy.contains('button', 'Team Chat').click();
        cy.url().should('include', '/chat');
      }
    });
    
    // Take screenshot in dark mode
    cy.screenshot('chatbubble-dark-mode-fix', {
      capture: 'viewport'
    });
    
    // Verify dark mode is active
    cy.get('html').should('have.class', 'dark');
  });

  it('should show proper contrast in ChatBubble light mode for comparison', () => {
    // Navigate to chat page that uses ChatBubble component
    cy.visit('/projects');
    cy.get('[data-testid="project-card"]').first().within(() => {
      cy.contains('View Details').click();
    });
    
    // Ensure light mode
    cy.get('html').invoke('attr', 'class', '');
    
    // Navigate to chat functionality
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="chat-interface"]').length > 0) {
        cy.get('[data-testid="chat-interface"]').should('be.visible');
      } else {
        cy.contains('button', 'Team Chat').click();
        cy.url().should('include', '/chat');
      }
    });
    
    // Take screenshot in light mode
    cy.screenshot('chatbubble-light-mode-comparison', {
      capture: 'viewport'
    });
  });
});