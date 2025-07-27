describe('Universal Chat Basic Tests', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  describe('Project Chat Core Functionality', () => {
    it('should navigate to project chat and display UI', () => {
      // Navigate to project chat
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      cy.url().should('include', '/chat');
      
      // Take screenshot
      cy.screenshot('universal-chat-project-ui');
      
      // Verify core elements
      cy.get('h2').should('contain', 'Project Chat');
      cy.get('textarea[placeholder*="Send a message"]').should('exist');
      cy.get('button[aria-label="Send message"]').should('exist');
    });

    it('should send and display messages', () => {
      // Navigate to chat
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      
      // Send a message
      const testMessage = 'Test message ' + Date.now();
      cy.get('textarea[placeholder*="Send a message"]').type(testMessage);
      cy.get('button[aria-label="Send message"]').click();
      
      // Verify message appears
      cy.contains(testMessage).should('be.visible');
      
      // Take screenshot
      cy.screenshot('universal-chat-sent-message');
    });
  });

  describe('Dark Mode Functionality', () => {
    it('should work in dark mode', () => {
      // Set dark mode
      cy.get('html').invoke('attr', 'class', 'dark');
      
      // Navigate to chat
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      
      // Send a message
      cy.get('textarea[placeholder*="Send a message"]').type('Dark mode test');
      cy.get('button[aria-label="Send message"]').click();
      
      // Take screenshot
      cy.screenshot('universal-chat-dark-mode-basic');
      
      // Verify dark mode is active
      cy.get('html').should('have.class', 'dark');
    });
  });

  describe('Input Behavior', () => {
    it('should handle basic input operations', () => {
      // Navigate to chat
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      
      // Test input
      cy.get('textarea[placeholder*="Send a message"]').type('Testing input');
      cy.get('textarea[placeholder*="Send a message"]').should('have.value', 'Testing input');
      
      // Clear and verify
      cy.get('textarea[placeholder*="Send a message"]').clear();
      cy.get('textarea[placeholder*="Send a message"]').should('have.value', '');
      
      // Test send button state
      cy.get('button[aria-label="Send message"]').should('be.disabled');
      cy.get('textarea[placeholder*="Send a message"]').type('a');
      cy.get('button[aria-label="Send message"]').should('not.be.disabled');
    });
  });
});