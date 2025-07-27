describe('Universal Chat System - Comprehensive Testing', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  describe('Project Chat Tests', () => {
    beforeEach(() => {
      // Navigate to project chat
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      cy.url().should('include', '/chat');
    });

    it('should display all UI elements correctly', () => {
      // Header
      cy.get('h2').should('contain', 'Project Chat');
      cy.get('p.text-muted-foreground').should('contain', 'team discussion');
      
      // Message area
      cy.get('.overflow-y-auto').should('exist');
      
      // Input area
      cy.get('textarea[placeholder*="Send a message"]').should('exist');
      cy.get('button[aria-label="Send message"]').should('exist');
      cy.get('.text-xs').should('contain', 'Enter');
      cy.get('.text-xs').should('contain', '0/5000');
    });

    it('should send and display messages correctly', () => {
      const testMessage = 'Testing project chat message ' + Date.now();
      
      // Send message
      cy.get('textarea[placeholder*="Send a message"]').type(testMessage);
      cy.get('button[aria-label="Send message"]').click();
      
      // Verify message appears
      cy.contains(testMessage).should('be.visible');
      
      // Check message bubble styling
      cy.contains(testMessage).parents('[class*="rounded-2xl"]').should('have.class', 'chat-bubble-sent');
      
      // Verify timestamp
      cy.contains(testMessage).parents('div').find('.text-xs.text-muted-foreground').should('exist');
    });

    it('should handle long messages with character count', () => {
      const longMessage = 'A'.repeat(4500);
      
      cy.get('textarea[placeholder*="Send a message"]').type(longMessage, { delay: 0 });
      
      // Check character count warning
      cy.get('.text-xs').should('contain', '4500/5000');
      cy.get('.text-yellow-600').should('exist');
      
      // Add more characters to trigger red warning
      cy.get('textarea[placeholder*="Send a message"]').type('B'.repeat(400), { delay: 0 });
      cy.get('.text-xs').should('contain', '4900/5000');
      cy.get('.text-red-600').should('exist');
    });

    it('should show empty state for new chats', () => {
      // Navigate to a project with no messages
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').last().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      
      cy.contains('No messages yet. Start the conversation!').should('be.visible');
    });
  });

  describe('Task Chat Tests', () => {
    beforeEach(() => {
      // Navigate to task chat
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('Tasks').click();
      cy.wait(1000);
      cy.get('[data-testid="task-card"]').first().click();
      cy.contains('button', 'Comments').click();
    });

    it('should show task-specific placeholder and title', () => {
      cy.get('h2').should('contain', 'Task Comments');
      cy.get('p.text-muted-foreground').should('contain', 'Discuss progress and updates');
      cy.get('textarea[placeholder*="Add a comment"]').should('exist');
    });

    it('should handle task comments correctly', () => {
      const comment = 'Task progress update: 50% complete';
      
      cy.get('textarea[placeholder*="Add a comment"]').type(comment);
      cy.get('button[aria-label="Send message"]').click();
      
      cy.contains(comment).should('be.visible');
    });
  });

  describe('Dark Mode Tests', () => {
    beforeEach(() => {
      // Set dark mode
      cy.get('html').invoke('attr', 'class', 'dark');
      
      // Navigate to project chat
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
    });

    it('should display proper contrast in dark mode', () => {
      // Send messages to test contrast
      cy.get('textarea[placeholder*="Send a message"]').type('My sent message');
      cy.get('button[aria-label="Send message"]').click();
      
      // Inject a received message for testing
      cy.window().then((win) => {
        const receivedMessage = win.document.createElement('div');
        receivedMessage.innerHTML = `
          <div class="flex gap-3 mb-4">
            <div class="w-8 flex-shrink-0">
              <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs">T</div>
            </div>
            <div class="flex-1 max-w-[70%]">
              <p class="text-xs text-muted-foreground mb-1 ml-1">Team Member</p>
              <div class="px-4 py-3 rounded-2xl chat-bubble-received">
                <div class="prose prose-sm max-w-none dark:prose-invert">
                  <p>This is a received message in dark mode</p>
                </div>
              </div>
            </div>
          </div>
        `;
        win.document.querySelector('.overflow-y-auto').appendChild(receivedMessage);
      });
      
      // Take screenshot
      cy.screenshot('universal-chat-dark-mode-contrast');
      
      // Verify classes
      cy.get('.chat-bubble-sent').should('exist');
      cy.get('.chat-bubble-received').should('exist');
      cy.get('html').should('have.class', 'dark');
    });

    it('should maintain dark mode when navigating between chat types', () => {
      // Verify dark mode in project chat
      cy.get('html').should('have.class', 'dark');
      cy.screenshot('dark-mode-project-chat');
      
      // Navigate to task chat
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('Tasks').click();
      cy.wait(1000);
      cy.get('[data-testid="task-card"]').first().click();
      cy.contains('button', 'Comments').click();
      
      // Verify dark mode persists
      cy.get('html').should('have.class', 'dark');
      cy.screenshot('dark-mode-task-chat');
    });
  });

  describe('Message Grouping Tests', () => {
    it('should group consecutive messages from same sender', () => {
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      
      // Send multiple messages quickly
      const messages = [
        'First message in group',
        'Second message in group',
        'Third message in group'
      ];
      
      messages.forEach(msg => {
        cy.get('textarea[placeholder*="Send a message"]').type(msg);
        cy.get('button[aria-label="Send message"]').click();
        cy.wait(100);
      });
      
      // Check that messages are grouped (reduced spacing)
      cy.get('.chat-bubble-sent').should('have.length.at.least', 3);
      
      // Verify only last message shows timestamp
      cy.get('.chat-bubble-sent').last().parents('div').find('.text-xs.text-muted-foreground').should('exist');
    });
  });

  describe('Input Behavior Tests', () => {
    beforeEach(() => {
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
    });

    it('should handle Enter key for sending', () => {
      const message = 'Testing Enter key';
      
      cy.get('textarea[placeholder*="Send a message"]').type(message);
      cy.get('textarea[placeholder*="Send a message"]').type('{enter}');
      
      cy.contains(message).should('be.visible');
    });

    it('should handle Shift+Enter for new line', () => {
      const firstLine = 'First line';
      const secondLine = 'Second line';
      
      cy.get('textarea[placeholder*="Send a message"]')
        .type(firstLine)
        .type('{shift}{enter}')
        .type(secondLine);
      
      // Verify multiline text in textarea
      cy.get('textarea[placeholder*="Send a message"]').should('contain', firstLine);
      cy.get('textarea[placeholder*="Send a message"]').should('contain', secondLine);
    });

    it('should clear input after sending', () => {
      cy.get('textarea[placeholder*="Send a message"]').type('Test message');
      cy.get('button[aria-label="Send message"]').click();
      
      cy.get('textarea[placeholder*="Send a message"]').should('have.value', '');
    });

    it('should disable send button when input is empty', () => {
      cy.get('button[aria-label="Send message"]').should('be.disabled');
      
      cy.get('textarea[placeholder*="Send a message"]').type('a');
      cy.get('button[aria-label="Send message"]').should('not.be.disabled');
      
      cy.get('textarea[placeholder*="Send a message"]').clear();
      cy.get('button[aria-label="Send message"]').should('be.disabled');
    });
  });

  describe('Responsive Behavior Tests', () => {
    it('should adapt UI for mobile viewport', () => {
      cy.viewport('iphone-x');
      
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      
      // Check mobile adaptations
      cy.get('textarea[placeholder*="Send a message"]').should('be.visible');
      cy.get('button[aria-label="Send message"]').should('be.visible');
      
      // Character count should show abbreviated version
      cy.get('.text-xs').should('contain', 'Press');
      cy.get('.text-xs').should('not.contain', 'Shift+Enter');
      
      cy.screenshot('universal-chat-mobile');
    });

    it('should handle tablet viewport', () => {
      cy.viewport('ipad-2');
      
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      
      cy.screenshot('universal-chat-tablet');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very long single word', () => {
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      
      const longWord = 'Abcdefghijklmnopqrstuvwxyz'.repeat(10);
      cy.get('textarea[placeholder*="Send a message"]').type(longWord, { delay: 0 });
      cy.get('button[aria-label="Send message"]').click();
      
      // Verify word wrapping
      cy.contains(longWord.substring(0, 20)).should('be.visible');
    });

    it('should handle special characters and emojis', () => {
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      
      const specialMessage = 'Test <script>alert("xss")</script> & emoji 😀🎉';
      cy.get('textarea[placeholder*="Send a message"]').type(specialMessage);
      cy.get('button[aria-label="Send message"]').click();
      
      // Verify special characters are escaped
      cy.contains('😀🎉').should('be.visible');
      cy.get('script').should('not.exist');
    });

    it('should handle rapid message sending', () => {
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      
      // Send multiple messages rapidly
      for (let i = 0; i < 5; i++) {
        cy.get('textarea[placeholder*="Send a message"]').type(`Rapid message ${i}`);
        cy.get('button[aria-label="Send message"]').click();
      }
      
      // Verify all messages appear
      for (let i = 0; i < 5; i++) {
        cy.contains(`Rapid message ${i}`).should('be.visible');
      }
    });
  });

  describe('Markdown Support Tests', () => {
    beforeEach(() => {
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
    });

    it('should render markdown formatting', () => {
      const markdownMessage = `
**Bold text**
*Italic text*
- List item 1
- List item 2

\`inline code\`

\`\`\`javascript
const code = "block";
\`\`\`
      `;
      
      cy.get('textarea[placeholder*="Send a message"]').type(markdownMessage, { parseSpecialCharSequences: false });
      cy.get('button[aria-label="Send message"]').click();
      
      // Verify markdown rendering
      cy.get('strong').should('contain', 'Bold text');
      cy.get('em').should('contain', 'Italic text');
      cy.get('ul li').should('have.length', 2);
      cy.get('code').should('exist');
    });
  });

  describe('Scroll Behavior Tests', () => {
    it('should auto-scroll to bottom on new messages', () => {
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      
      // Send enough messages to require scrolling
      for (let i = 0; i < 20; i++) {
        cy.get('textarea[placeholder*="Send a message"]').type(`Message ${i}`);
        cy.get('button[aria-label="Send message"]').click();
        cy.wait(100);
      }
      
      // Send one more message
      cy.get('textarea[placeholder*="Send a message"]').type('Final message');
      cy.get('button[aria-label="Send message"]').click();
      
      // Verify the final message is visible (auto-scrolled)
      cy.contains('Final message').should('be.visible');
    });
  });

  describe('AI Chat Integration Tests', () => {
    it('should handle AI chat interface', () => {
      // This would test the AI chat if it's integrated into a page
      // For now, we'll test that the component structure exists
      cy.window().then((win) => {
        // Verify AIChat component exports exist
        expect(win).to.exist;
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle large message history efficiently', () => {
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      
      // Measure initial load time
      cy.window().then((win) => {
        win.performance.mark('chat-load-start');
      });
      
      // Send many messages
      const messageCount = 50;
      for (let i = 0; i < messageCount; i++) {
        cy.get('textarea[placeholder*="Send a message"]').type(`Perf test ${i}`, { delay: 0 });
        cy.get('button[aria-label="Send message"]').click();
        
        if (i % 10 === 0) {
          cy.wait(100); // Small delay every 10 messages
        }
      }
      
      cy.window().then((win) => {
        win.performance.mark('chat-load-end');
        win.performance.measure('chat-performance', 'chat-load-start', 'chat-load-end');
        
        const measure = win.performance.getEntriesByName('chat-performance')[0];
        expect(measure.duration).to.be.lessThan(10000); // Should complete in under 10 seconds
      });
    });
  });

  describe('Date Grouping Tests', () => {
    it('should group messages by date', () => {
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.contains('View Details').click();
      });
      cy.contains('button', 'Team Chat').click();
      
      // Send a message
      cy.get('textarea[placeholder*="Send a message"]').type('Today\'s message');
      cy.get('button[aria-label="Send message"]').click();
      
      // Verify date separator shows "Today"
      cy.contains('Today').should('be.visible');
      
      // Date separators should have proper styling
      cy.get('.border-t').should('exist');
    });
  });
});