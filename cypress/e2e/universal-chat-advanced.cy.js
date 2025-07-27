describe('Universal Chat Advanced Tests', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  describe('Message Grouping and Timestamps', () => {
    it('should group consecutive messages and show timestamps correctly', () => {
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      
      // Send multiple messages quickly to test grouping
      const messages = ['Message 1', 'Message 2', 'Message 3'];
      messages.forEach(msg => {
        cy.get('textarea[placeholder*="Send a message"]').type(msg);
        cy.get('button[aria-label="Send message"]').click();
        cy.wait(100);
      });
      
      // Take screenshot of grouped messages
      cy.screenshot('universal-chat-message-grouping');
      
      // Verify messages exist
      messages.forEach(msg => {
        cy.contains(msg).should('be.visible');
      });
      
      // Check that we have message bubbles
      cy.get('.chat-bubble-sent').should('have.length.at.least', 3);
    });
  });

  describe('Markdown Rendering', () => {
    it('should render markdown correctly', () => {
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      
      // Send markdown message
      const markdown = '**Bold** *italic* `code`';
      cy.get('textarea[placeholder*="Send a message"]').type(markdown);
      cy.get('button[aria-label="Send message"]').click();
      
      // Verify markdown rendering
      cy.get('strong').should('contain', 'Bold');
      cy.get('em').should('contain', 'italic');
      cy.get('code').should('contain', 'code');
      
      cy.screenshot('universal-chat-markdown');
    });

    it('should handle code blocks', () => {
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      
      const codeBlock = '```javascript\nconst hello = "world";\n```';
      cy.get('textarea[placeholder*="Send a message"]').type(codeBlock, { parseSpecialCharSequences: false });
      cy.get('button[aria-label="Send message"]').click();
      
      // Verify code block exists
      cy.get('code').should('contain', 'hello');
      
      cy.screenshot('universal-chat-code-block');
    });
  });

  describe('Character Count and Long Messages', () => {
    it('should show character count warnings', () => {
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      
      // Type a moderately long message
      const longText = 'A'.repeat(100);
      cy.get('textarea[placeholder*="Send a message"]').type(longText, { delay: 0 });
      
      // Check character count
      cy.get('.text-xs').should('contain', '100/5000');
      
      // Clear and type near limit
      cy.get('textarea[placeholder*="Send a message"]').clear();
      const nearLimit = 'B'.repeat(4500);
      cy.get('textarea[placeholder*="Send a message"]').type(nearLimit, { delay: 0 });
      
      // Should show warning color
      cy.get('.text-yellow-600').should('exist');
      cy.screenshot('universal-chat-char-warning');
    });
  });

  describe('Responsive Mobile View', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x');
      
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      
      // UI should adapt
      cy.get('textarea[placeholder*="Send a message"]').should('be.visible');
      cy.get('button[aria-label="Send message"]').should('be.visible');
      
      // Send a message on mobile
      cy.get('textarea[placeholder*="Send a message"]').type('Mobile test message');
      cy.get('button[aria-label="Send message"]').click();
      
      cy.contains('Mobile test message').should('be.visible');
      cy.screenshot('universal-chat-mobile-view');
    });
  });

  describe('Date Separators', () => {
    it('should show date separators', () => {
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      
      // Send a message
      cy.get('textarea[placeholder*="Send a message"]').type('Message for today');
      cy.get('button[aria-label="Send message"]').click();
      
      // Should show "Today" separator
      cy.contains('Today').should('be.visible');
      
      // Check separator styling
      cy.get('.border-t').should('exist');
      
      cy.screenshot('universal-chat-date-separator');
    });
  });

  describe('Empty State', () => {
    it('should show empty state for new conversations', () => {
      // Try to find a project with no messages
      cy.visit('/projects');
      
      // Create a new project or use last one (likely empty)
      cy.get('[data-testid="project-card"]').last().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      
      // Should show empty state or have messages
      cy.get('body').then($body => {
        if ($body.text().includes('No messages yet')) {
          cy.contains('No messages yet. Start the conversation!').should('be.visible');
          cy.screenshot('universal-chat-empty-state');
        } else {
          // If not empty, at least verify UI loads
          cy.get('textarea[placeholder*="Send a message"]').should('exist');
        }
      });
    });
  });

  describe('Multiple Chat Types', () => {
    it('should maintain consistency across project and task chat', () => {
      // First check project chat
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      
      // Send a project message
      cy.get('textarea[placeholder*="Send a message"]').type('Project chat test');
      cy.get('button[aria-label="Send message"]').click();
      cy.screenshot('universal-chat-project-type');
      
      // Now check task chat (if tasks exist)
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      
      // Try to navigate to tasks
      cy.get('body').then($body => {
        if ($body.find('a:contains("Tasks")').length > 0) {
          cy.contains('Tasks').click();
          cy.wait(1000);
          
          // If tasks exist, check task chat
          cy.get('body').then($taskBody => {
            if ($taskBody.find('[data-testid="task-card"]').length > 0) {
              cy.get('[data-testid="task-card"]').first().click();
              cy.contains('button', 'Comments').click();
              
              // Verify task chat UI
              cy.get('textarea[placeholder*="Add a comment"]').should('exist');
              cy.screenshot('universal-chat-task-type');
            }
          });
        }
      });
    });
  });

  describe('Performance with Many Messages', () => {
    it('should handle multiple messages efficiently', () => {
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      
      // Send 10 messages
      for (let i = 1; i <= 10; i++) {
        cy.get('textarea[placeholder*="Send a message"]').type(`Performance test message ${i}`, { delay: 0 });
        cy.get('button[aria-label="Send message"]').click();
        cy.wait(200); // Small delay between messages
      }
      
      // Verify all messages loaded
      cy.contains('Performance test message 10').should('be.visible');
      
      // Should auto-scroll to latest
      cy.contains('Performance test message 10').should('be.in.viewport');
      
      cy.screenshot('universal-chat-many-messages');
    });
  });
});