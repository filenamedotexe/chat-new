describe('Universal Chat System', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should display consistent UI across project chat', () => {
    // Navigate to project chat
    cy.visit('/projects');
    cy.get('[data-testid="project-card"]').first().within(() => {
      cy.contains('View Details').click();
    });
    cy.contains('button', 'Team Chat').click();
    cy.url().should('include', '/chat');
    
    // Verify chat UI elements
    cy.get('h2').should('contain', 'Project Chat');
    cy.get('textarea[placeholder*="Send a message"]').should('exist');
    cy.get('button[aria-label="Send message"]').should('exist');
    
    // Take screenshot in light mode
    cy.screenshot('universal-chat-project-light');
  });

  it('should display consistent UI across task chat', () => {
    // Create a task first
    cy.visit('/projects');
    cy.get('[data-testid="project-card"]').first().within(() => {
      cy.contains('View Details').click();
    });
    
    // Navigate to tasks and pick one
    cy.contains('Tasks').click();
    cy.get('[data-testid="task-card"]').first().click();
    
    // Navigate to task chat
    cy.contains('button', 'Comments').click();
    cy.url().should('include', '/chat');
    
    // Verify chat UI elements
    cy.get('h2').should('contain', 'Task Comments');
    cy.get('textarea[placeholder*="Add a comment"]').should('exist');
    cy.get('button[aria-label="Send message"]').should('exist');
    
    // Take screenshot
    cy.screenshot('universal-chat-task-light');
  });

  it('should maintain consistent dark mode across all chat types', () => {
    // Set dark mode
    cy.get('html').invoke('attr', 'class', 'dark');
    
    // Navigate to project chat
    cy.visit('/projects');
    cy.get('[data-testid="project-card"]').first().within(() => {
      cy.contains('View Details').click();
    });
    cy.contains('button', 'Team Chat').click();
    
    // Send a test message
    cy.get('textarea[placeholder*="Send a message"]').type('Testing universal dark mode');
    cy.get('button[aria-label="Send message"]').click();
    
    // Take screenshot
    cy.screenshot('universal-chat-dark-mode');
    
    // Verify dark mode classes
    cy.get('html').should('have.class', 'dark');
    cy.get('.chat-bubble-sent').should('exist');
  });

  it('should handle empty states consistently', () => {
    // Navigate to a new project chat (likely empty)
    cy.visit('/projects');
    cy.get('[data-testid="project-card"]').last().within(() => {
      cy.contains('View Details').click();
    });
    cy.contains('button', 'Team Chat').click();
    
    // Check empty state
    cy.contains('No messages yet').should('be.visible');
    cy.screenshot('universal-chat-empty-state');
  });
});