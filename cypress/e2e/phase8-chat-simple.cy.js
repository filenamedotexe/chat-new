describe('Phase 8: Chat System - Simple Test', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should test chat on existing project', () => {
    // Go to projects
    cy.visit('/projects');
    
    // Get the first project (skip the new project link)
    cy.get('a[href^="/projects/"]').not('[href="/projects/new"]').first().then($link => {
      const href = $link.attr('href');
      cy.log('Found project link:', href);
      
      // Visit the project detail page directly
      cy.visit(href);
      
      // Verify we're on project page
      cy.url().should('match', /\/projects\/[^\/]+$/);
      
      // Click Team Chat button
      cy.contains('Team Chat').click();
      
      // Verify we're on chat page
      cy.url().should('include', '/chat');
      cy.contains('Project Chat').should('be.visible');
      
      // Send a message
      const testMessage = `Test message ${Date.now()}`;
      cy.get('textarea[placeholder*="message"]').type(testMessage);
      cy.get('button[aria-label*="Send"]').click();
      
      // Verify message appears
      cy.contains(testMessage).should('be.visible');
    });
  });

  it('should test task discussion', () => {
    // Go to projects
    cy.visit('/projects');
    
    // Click first project (skip new project link)
    cy.get('a[href^="/projects/"]').not('[href="/projects/new"]').first().click();
    
    // Go to tasks
    cy.contains('View Tasks').click();
    cy.url().should('include', '/tasks');
    
    // Check if there are any tasks
    cy.get('body').then($body => {
      // If no tasks exist, create one using the plus button
      if ($body.find('.cursor-pointer').length === 0) {
        cy.log('No tasks found, creating one');
        
        // Click plus button in first column
        cy.get('button[aria-label*="IconPlus"]').first().click();
        
        // Fill task form
        const taskTitle = `Test Task ${Date.now()}`;
        cy.get('#title').type(taskTitle);
        cy.get('#description').type('Task for testing discussions');
        cy.get('button[type="submit"]').click();
        
        // Wait for task to be created
        cy.contains(taskTitle).should('be.visible');
      }
      
      // Click on first task (which should navigate to task detail)
      cy.get('.cursor-pointer').first().click();
      
      // Wait for navigation
      cy.wait(500);
      
      // Should be on task detail page  
      cy.url().should('include', '/tasks/');
      
      // Click Discussion button
      cy.contains('Discussion').click();
      
      // Should be on task chat page
      cy.url().should('include', '/chat');
      cy.contains('Task Comments').should('be.visible');
      
      // Send a comment
      const comment = `Test comment ${Date.now()}`;
      cy.get('textarea[placeholder*="comment"]').type(comment);
      cy.get('button[aria-label*="Send"]').click();
      
      // Verify comment appears
      cy.contains(comment).should('be.visible');
    });
  });

  it('should test markdown rendering', () => {
    // Go to projects and then chat
    cy.visit('/projects');
    cy.get('a[href^="/projects/"]').not('[href="/projects/new"]').first().click();
    cy.contains('Team Chat').click();
    
    // Test bold text
    cy.get('textarea').type('**Bold text**');
    cy.get('button[aria-label*="Send"]').click();
    
    // Wait for message to be rendered
    cy.wait(500);
    cy.get('strong').contains('Bold text').should('be.visible');
    
    // Test italic text
    cy.get('textarea').type('_Italic text_');
    cy.get('button[aria-label*="Send"]').click();
    cy.get('em').contains('Italic text').should('be.visible');
    
    // Test inline code
    cy.get('textarea').type('Use `npm install` to install');
    cy.get('button[aria-label*="Send"]').click();
    cy.get('code').contains('npm install').should('be.visible');
  });
});