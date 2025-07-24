describe('Phase 8: Chat System - Comprehensive Tests', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  describe('Project Chat', () => {
    it('should navigate to project chat from project page', () => {
      // Go to projects
      cy.visit('/projects');
      
      // Click on first project
      cy.get('a[href^="/projects/"]').first().click();
      
      // Find and click Team Chat button
      cy.contains('Team Chat').should('be.visible');
      cy.contains('Team Chat').click();
      
      // Verify we're on chat page
      cy.url().should('include', '/chat');
      cy.contains('Project Chat').should('be.visible');
      cy.contains('team discussion').should('be.visible');
    });

    it('should send and display messages in project chat', () => {
      // Navigate to a project chat
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('Team Chat').click();
      
      // Type a message
      const testMessage = `Test message ${Date.now()}`;
      cy.get('textarea[placeholder*="Send a message"]').type(testMessage);
      
      // Verify character count
      cy.contains(`${testMessage.length}/5000`).should('be.visible');
      
      // Send message
      cy.get('button[aria-label*="Send"]').click();
      
      // Verify message appears
      cy.contains(testMessage).should('be.visible');
      
      // Verify message has timestamp
      cy.contains(/\d{1,2}:\d{2} [AP]M/).should('be.visible');
    });

    it('should handle Enter key to send and Shift+Enter for new line', () => {
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('Team Chat').click();
      
      // Test Enter to send
      const message1 = 'Single line message';
      cy.get('textarea[placeholder*="Send a message"]').type(message1);
      cy.get('textarea[placeholder*="Send a message"]').type('{enter}');
      
      // Message should be sent and input cleared
      cy.contains(message1).should('be.visible');
      cy.get('textarea[placeholder*="Send a message"]').should('have.value', '');
      
      // Test Shift+Enter for new line
      const message2Line1 = 'Multi line';
      const message2Line2 = 'message test';
      cy.get('textarea[placeholder*="Send a message"]').type(message2Line1);
      cy.get('textarea[placeholder*="Send a message"]').type('{shift+enter}');
      cy.get('textarea[placeholder*="Send a message"]').type(message2Line2);
      
      // Verify multiline in textarea
      cy.get('textarea[placeholder*="Send a message"]').should('have.value', `${message2Line1}\n${message2Line2}`);
      
      // Send it
      cy.get('button[aria-label*="Send"]').click();
      
      // Verify multiline message appears
      cy.contains(message2Line1).should('be.visible');
      cy.contains(message2Line2).should('be.visible');
    });

    it('should show empty state when no messages', () => {
      // Create a new project to ensure empty chat
      cy.visit('/projects/new');
      const projectName = `Empty Chat Project ${Date.now()}`;
      cy.get('#name').type(projectName);
      cy.get('#organizationId').select(1);
      cy.get('button[type="submit"]').click();
      
      // Navigate to the new project's chat
      cy.contains(projectName).click();
      cy.contains('Team Chat').click();
      
      // Verify empty state
      cy.contains('No messages yet. Start the conversation!').should('be.visible');
    });

    it('should prevent sending empty messages', () => {
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('Team Chat').click();
      
      // Try to send empty message
      cy.get('textarea[placeholder*="Send a message"]').clear();
      cy.get('button[aria-label*="Send"]').should('be.disabled');
      
      // Try with just spaces
      cy.get('textarea[placeholder*="Send a message"]').type('   ');
      cy.get('button[aria-label*="Send"]').should('be.disabled');
    });

    it('should enforce character limit', () => {
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('Team Chat').click();
      
      // Type near limit (would need to mock or use shorter limit for practical testing)
      const longMessage = 'a'.repeat(4990);
      cy.get('textarea[placeholder*="Send a message"]').type(longMessage);
      
      // Character count should show warning color
      cy.get('.text-destructive').should('exist');
      cy.contains('4990/5000').should('be.visible');
    });
  });

  describe('Task Discussion', () => {
    it('should navigate to task discussion from task detail', () => {
      // Navigate to a task
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('Tasks').click();
      cy.get('.cursor-pointer').first().click();
      
      // Click Discussion button
      cy.contains('Discussion').should('be.visible');
      cy.contains('Discussion').click();
      
      // Verify we're on task chat page
      cy.url().should('include', '/chat');
      cy.contains('Task Comments').should('be.visible');
      cy.contains('Discuss progress and updates').should('be.visible');
    });

    it('should send comments on tasks', () => {
      // Navigate to task discussion
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('Tasks').click();
      cy.get('.cursor-pointer').first().click();
      cy.contains('Discussion').click();
      
      // Add a comment
      const comment = `Task update: Completed initial review ${Date.now()}`;
      cy.get('textarea[placeholder*="Add a comment"]').type(comment);
      cy.get('button[aria-label*="Send"]').click();
      
      // Verify comment appears
      cy.contains(comment).should('be.visible');
    });

    it('should show different placeholder for task comments', () => {
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('Tasks').click();
      cy.get('.cursor-pointer').first().click();
      cy.contains('Discussion').click();
      
      // Verify task-specific placeholder
      cy.get('textarea[placeholder*="Add a comment"]').should('exist');
    });
  });

  describe('Markdown Support', () => {
    it('should render markdown formatting', () => {
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('Team Chat').click();
      
      // Test bold
      cy.get('textarea').type('**Bold text**');
      cy.get('button[aria-label*="Send"]').click();
      cy.get('strong').contains('Bold text').should('be.visible');
      
      // Test italic
      cy.get('textarea').type('_Italic text_');
      cy.get('button[aria-label*="Send"]').click();
      cy.get('em').contains('Italic text').should('be.visible');
      
      // Test inline code
      cy.get('textarea').type('Use `npm install` to install');
      cy.get('button[aria-label*="Send"]').click();
      cy.get('code').contains('npm install').should('be.visible');
      
      // Test code block
      cy.get('textarea').type('```\nconst hello = "world";\nconsole.log(hello);\n```');
      cy.get('button[aria-label*="Send"]').click();
      cy.get('code').contains('const hello = "world"').should('be.visible');
    });

    it('should render markdown lists', () => {
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('Team Chat').click();
      
      // Test unordered list
      cy.get('textarea').type('- Item 1\n- Item 2\n- Item 3');
      cy.get('button[aria-label*="Send"]').click();
      cy.get('ul').should('exist');
      cy.get('li').should('have.length.at.least', 3);
      
      // Test ordered list
      cy.get('textarea').type('1. First\n2. Second\n3. Third');
      cy.get('button[aria-label*="Send"]').click();
      cy.get('ol').should('exist');
    });

    it('should render markdown links', () => {
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('Team Chat').click();
      
      // Test link
      cy.get('textarea').type('[Google](https://google.com)');
      cy.get('button[aria-label*="Send"]').click();
      cy.get('a[href="https://google.com"]').should('exist');
      cy.get('a[href="https://google.com"]').should('have.attr', 'target', '_blank');
    });

    it('should show markdown help text', () => {
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('Team Chat').click();
      
      // Verify markdown help is visible
      cy.contains('**bold** _italic_ `code`').should('be.visible');
    });
  });

  describe('Message Features', () => {
    it('should group messages by date', () => {
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('Team Chat').click();
      
      // Send a message
      cy.get('textarea').type('Message for today');
      cy.get('button[aria-label*="Send"]').click();
      
      // Should show "Today" separator
      cy.contains('Today').should('be.visible');
    });

    it('should show sender information', () => {
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('Team Chat').click();
      
      // Send a message
      const message = `Admin message ${Date.now()}`;
      cy.get('textarea').type(message);
      cy.get('button[aria-label*="Send"]').click();
      
      // For own messages, avatar should be on the right
      cy.get('.justify-end').within(() => {
        cy.contains(message).should('exist');
        // Avatar with first letter should exist
        cy.get('.bg-primary').should('exist');
      });
    });

    it('should handle emoji button (placeholder)', () => {
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('Team Chat').click();
      
      // Click emoji button
      cy.get('button[title="Emojis coming soon"]').should('exist');
      cy.get('button[title="Emojis coming soon"]').should('not.be.disabled');
    });

    it('should handle file attachment button (if implemented)', () => {
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('Team Chat').click();
      
      // Check if file attachment button exists
      cy.get('button svg.tabler-icon-paperclip').should('exist');
    });
  });

  describe('Role-based Permissions', () => {
    it('admin should be able to send messages in any project', () => {
      // Already logged in as admin
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('Team Chat').click();
      
      // Should be able to send message
      cy.get('textarea').should('not.be.disabled');
      cy.get('textarea').type('Admin message');
      cy.get('button[aria-label*="Send"]').click();
      cy.contains('Admin message').should('be.visible');
    });

    it('client users should be able to participate in their project chats', () => {
      // Logout and login as client
      cy.visit('/api/auth/signout');
      cy.visit('/login');
      cy.get('#email').type('user@example.com');
      cy.get('#password').type('user123');
      cy.get('button[type="submit"]').click();
      
      // Navigate to a project (if they have access)
      cy.visit('/projects');
      
      // If they have projects, test chat
      cy.get('body').then($body => {
        if ($body.find('a[href^="/projects/"]').length > 0) {
          cy.get('a[href^="/projects/"]').first().click();
          
          // Check if Team Chat is available
          cy.get('body').then($body => {
            if ($body.text().includes('Team Chat')) {
              cy.contains('Team Chat').click();
              
              // Client should be able to send messages
              cy.get('textarea').should('not.be.disabled');
              cy.get('textarea').type('Client message');
              cy.get('button[aria-label*="Send"]').click();
              cy.contains('Client message').should('be.visible');
            }
          });
        }
      });
    });
  });

  describe('Navigation and UI', () => {
    it('should have back button in chat pages', () => {
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('Team Chat').click();
      
      // Back button should exist
      cy.contains('Back to Project').should('be.visible');
      cy.contains('Back to Project').click();
      
      // Should be back on project page
      cy.url().should('not.include', '/chat');
      cy.contains('Quick Actions').should('be.visible');
    });

    it('should maintain chat scroll position', () => {
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('Team Chat').click();
      
      // Send multiple messages to create scroll
      for (let i = 0; i < 5; i++) {
        cy.get('textarea').type(`Message ${i}`);
        cy.get('button[aria-label*="Send"]').click();
        cy.wait(100);
      }
      
      // Should auto-scroll to bottom (latest message visible)
      cy.contains('Message 4').should('be.visible');
    });

    it('should show loading state', () => {
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      
      // Intercept chat API to delay response
      cy.intercept('GET', '/api/messages*', (req) => {
        req.reply((res) => {
          res.delay(1000);
          res.send({ messages: [] });
        });
      }).as('getMessages');
      
      cy.contains('Team Chat').click();
      
      // Should show loading spinner
      cy.get('.animate-spin').should('be.visible');
      
      cy.wait('@getMessages');
    });
  });

  describe('Error Handling', () => {
    it('should handle message send errors gracefully', () => {
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('Team Chat').click();
      
      // Intercept and force error
      cy.intercept('POST', '/api/messages', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('sendError');
      
      cy.get('textarea').type('This will fail');
      cy.get('button[aria-label*="Send"]').click();
      
      cy.wait('@sendError');
      
      // Input should still have the message (not cleared on error)
      cy.get('textarea').should('have.value', 'This will fail');
    });

    it('should show error state when messages fail to load', () => {
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      
      // Intercept and force error
      cy.intercept('GET', '/api/messages*', {
        statusCode: 500,
        body: { error: 'Failed to load messages' }
      }).as('loadError');
      
      cy.contains('Team Chat').click();
      
      cy.wait('@loadError');
      
      // Should show error message
      cy.contains('Failed to load messages').should('be.visible');
    });
  });
});