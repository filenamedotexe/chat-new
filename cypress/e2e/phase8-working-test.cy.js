describe('Phase 8 Working Tests', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should send messages in project chat', () => {
    // Navigate to projects
    cy.visit('/projects');
    
    // Use one of the existing projects
    cy.contains('Website Redesign Project').click();
    
    // Click Team Chat
    cy.contains('Team Chat').click();
    
    // Wait for chat to load
    cy.contains('Project Chat').should('be.visible');
    
    // Send a message
    const message = `Test message ${Date.now()}`;
    cy.get('textarea[placeholder*="message"]').type(message);
    cy.get('button[aria-label="Send message"]').click();
    
    // Wait for message to appear
    cy.wait(2000);
    cy.contains(message).should('be.visible');
  });

  it('should test markdown rendering', () => {
    cy.visit('/projects');
    cy.contains('Website Redesign Project').click();
    cy.contains('Team Chat').click();
    
    // Send markdown messages
    const messages = [
      { text: 'This has **bold** text', check: () => cy.get('strong').contains('bold').should('be.visible') },
      { text: 'This has _italic_ text', check: () => cy.get('em').contains('italic').should('be.visible') },
      { text: 'This has `inline code`', check: () => cy.get('code').contains('inline code').should('be.visible') }
    ];
    
    messages.forEach((msg, index) => {
      // Send message
      cy.get('textarea[placeholder*="message"]').clear().type(msg.text);
      cy.get('button[aria-label="Send message"]').click();
      
      // Wait for render
      cy.wait(2000);
      
      // Check if rendered
      msg.check();
    });
  });

  it('should upload files to task', () => {
    // Navigate to a project with tasks
    cy.visit('/projects');
    cy.contains('Website Redesign Project').click();
    cy.contains('View Tasks').click();
    
    // Wait for tasks to load
    cy.wait(1000);
    
    // Click on a task (any task)
    cy.get('.cursor-pointer').first().click();
    
    // Wait for task detail page
    cy.wait(1000);
    cy.url().should('include', '/tasks/');
    
    // Find attachments section
    cy.get('[data-testid="attachments-section"]').should('be.visible');
    
    // Click Add Files
    cy.get('[data-testid="add-files-button"]').click();
    
    // Upload a file
    const fileName = 'test-upload.txt';
    const fileContent = 'Test file content for Phase 8';
    
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from(fileContent),
      fileName: fileName,
      mimeType: 'text/plain',
    }, { force: true });
    
    // Wait for upload
    cy.wait(3000);
    
    // Check if file appears
    cy.contains(fileName).should('be.visible');
  });

  it('should navigate to task discussion', () => {
    cy.visit('/projects');
    cy.contains('Website Redesign Project').click();
    cy.contains('View Tasks').click();
    
    // Click on a task (any task)
    cy.get('.cursor-pointer').first().click();
    cy.wait(1000);
    
    // Click Discussion button
    cy.contains('Discussion').click();
    
    // Should be on task chat
    cy.url().should('include', '/chat');
    cy.contains('Task Comments').should('be.visible');
    
    // Send a comment
    const comment = `Task comment ${Date.now()}`;
    cy.get('textarea[placeholder*="comment"]').type(comment);
    cy.get('button[aria-label="Send message"]').click();
    
    cy.wait(2000);
    cy.contains(comment).should('be.visible');
  });

  it('should test client access', () => {
    // Logout
    cy.clearCookies();
    cy.clearAllLocalStorage();
    
    // Login as client
    cy.visit('/login');
    cy.get('#email').type('user@example.com');
    cy.get('#password').type('user123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Check what projects client can see
    cy.visit('/projects');
    
    cy.get('body').then($body => {
      // Look for project cards
      const projectCards = $body.find('.cursor-pointer').filter(':contains("View Details")');
      
      if (projectCards.length > 0) {
        cy.log(`Client has access to ${projectCards.length} projects`);
        
        // Click first project
        cy.get('.cursor-pointer').contains('View Details').first().click();
        
        // Check if Team Chat is available
        cy.get('body').then($projectBody => {
          if ($projectBody.find('button:contains("Team Chat")').length > 0) {
            cy.contains('Team Chat').click();
            
            // Try to send a message
            const clientMsg = `Client message ${Date.now()}`;
            cy.get('textarea[placeholder*="message"]').type(clientMsg);
            cy.get('button[aria-label="Send message"]').click();
            
            cy.wait(2000);
            cy.contains(clientMsg).should('be.visible');
          } else {
            cy.log('Client does not have Team Chat access');
          }
        });
      } else {
        cy.log('Client has no projects');
        // Either "No projects found" or empty state
        cy.get('body').should('contain.text', 'project');
      }
    });
  });
});