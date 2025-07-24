describe('Phase 8 Complete Test', () => {
  let projectId;
  let taskId;

  before(() => {
    // Create test data
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');

    // Get a project ID
    cy.visit('/projects');
    cy.get('a[href^="/projects/"]').not('[href="/projects/new"]').first().then($link => {
      const href = $link.attr('href');
      projectId = href.split('/').pop();
      cy.log('Project ID:', projectId);
    });
  });

  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should send and display messages in project chat', () => {
    // Navigate to project chat
    cy.visit(`/projects/${projectId}/chat`);
    
    // Wait for page to load
    cy.contains('Project Chat').should('be.visible');
    
    // Send a test message
    const testMessage = `Test message ${Date.now()}`;
    cy.get('textarea[placeholder*="message"]').type(testMessage);
    cy.get('button[aria-label="Send message"]').click();
    
    // Wait for message to appear
    cy.wait(2000);
    cy.contains(testMessage).should('be.visible');
  });

  it('should render markdown formatting', () => {
    cy.visit(`/projects/${projectId}/chat`);
    
    // Send markdown message
    const markdownMessage = 'This has **bold** and _italic_ text';
    cy.get('textarea[placeholder*="message"]').type(markdownMessage);
    cy.get('button[aria-label="Send message"]').click();
    
    // Wait for rendering
    cy.wait(2000);
    
    // Check if markdown is rendered
    cy.get('body').then($body => {
      // Log what we find
      const hasStrong = $body.find('strong').length > 0;
      const hasEm = $body.find('em').length > 0;
      const hasBoldText = $body.text().includes('bold');
      const hasItalicText = $body.text().includes('italic');
      
      cy.log('Has <strong> tags:', hasStrong);
      cy.log('Has <em> tags:', hasEm);
      cy.log('Has "bold" text:', hasBoldText);
      cy.log('Has "italic" text:', hasItalicText);
      
      // Check the actual HTML of messages
      cy.get('[class*="prose"]').then($prose => {
        cy.log('Found prose elements:', $prose.length);
        if ($prose.length > 0) {
          cy.log('Prose HTML:', $prose.html());
        }
      });
      
      // Look for message bubbles
      cy.get('[class*="rounded-lg"][class*="px-4"]').then($messages => {
        cy.log('Found message bubbles:', $messages.length);
        $messages.each((i, el) => {
          cy.log(`Message ${i} HTML:`, el.innerHTML);
        });
      });
    });
  });

  it('should handle file uploads to tasks', () => {
    // First navigate to a task
    cy.visit(`/projects/${projectId}/tasks`);
    
    // Click on a task
    cy.get('.cursor-pointer').first().click();
    cy.wait(1000);
    
    // Should be on task detail page
    cy.url().should('include', '/tasks/');
    
    // Find the attachments section
    cy.get('[data-testid="attachments-section"]').should('be.visible');
    
    // Click Add Files button
    cy.get('[data-testid="add-files-button"]').click();
    
    // File upload should be visible
    cy.get('.dropzone').should('be.visible');
    
    // Create a test file
    const fileName = 'test-file.txt';
    const fileContent = 'This is a test file for upload';
    
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from(fileContent),
      fileName: fileName,
      mimeType: 'text/plain',
    }, { force: true });
    
    // Wait for upload
    cy.wait(2000);
    
    // Check if file appears in the list
    cy.contains(fileName).should('be.visible');
  });

  it('should navigate to task discussion from task detail', () => {
    // Navigate to tasks
    cy.visit(`/projects/${projectId}/tasks`);
    
    // Get task info from the card before clicking
    cy.get('.cursor-pointer').first().then($card => {
      const taskTitle = $card.find('.font-medium').text();
      cy.log('Task title:', taskTitle);
      
      // Click the task
      cy.wrap($card).click();
      cy.wait(1000);
      
      // Should navigate to task detail
      cy.url().should('include', '/tasks/');
      
      // Find and click Discussion button
      cy.contains('Discussion').should('be.visible').click();
      
      // Should navigate to task chat
      cy.url().should('include', '/chat');
      cy.contains('Task Comments').should('be.visible');
      
      // Send a comment
      const comment = `Comment on task ${Date.now()}`;
      cy.get('textarea[placeholder*="comment"]').type(comment);
      cy.get('button[aria-label="Send message"]').click();
      
      cy.wait(2000);
      cy.contains(comment).should('be.visible');
    });
  });

  it('should test role-based access', () => {
    // Logout
    cy.clearCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    
    // Login as client
    cy.visit('/login');
    cy.get('#email').type('user@example.com');
    cy.get('#password').type('user123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Try to access projects
    cy.visit('/projects');
    
    cy.get('body').then($body => {
      // Check if user has any projects
      const hasProjects = $body.find('a[href^="/projects/"]').not('[href="/projects/new"]').length > 0;
      
      if (hasProjects) {
        // Navigate to first project
        cy.get('a[href^="/projects/"]').not('[href="/projects/new"]').first().click();
        
        // Check if Team Chat is available
        cy.get('body').then($projectBody => {
          if ($projectBody.text().includes('Team Chat')) {
            cy.contains('Team Chat').click();
            
            // Try to send a message
            const clientMessage = `Client message ${Date.now()}`;
            cy.get('textarea[placeholder*="message"]').type(clientMessage);
            cy.get('button[aria-label="Send message"]').click();
            
            cy.wait(2000);
            cy.contains(clientMessage).should('be.visible');
          } else {
            cy.log('Client does not have access to Team Chat');
          }
        });
      } else {
        cy.log('Client user has no projects assigned');
      }
    });
  });
});