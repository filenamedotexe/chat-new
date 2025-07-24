describe('Phase 8 Setup', () => {
  it('should create test project for chat testing', () => {
    // Login as admin
    cy.visit('/login');
    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Create organization first
    cy.visit('/organizations/new');
    const orgName = `Chat Test Org ${Date.now()}`;
    cy.get('#name').type(orgName);
    cy.get('#contactEmail').type('chat-test@example.com');
    cy.get('#contactPhone').type('555-0123');
    cy.get('#address').type('123 Chat Street');
    cy.get('button[type="submit"]').click();
    
    // Wait for redirect
    cy.url().should('include', '/organizations');
    
    // Create project
    cy.visit('/projects/new');
    const projectName = `Chat Test Project ${Date.now()}`;
    cy.get('#name').type(projectName);
    cy.get('#description').type('Project for testing chat functionality');
    
    // Select the organization we just created
    cy.get('#organizationId').select(1); // Select first available org
    
    cy.get('button[type="submit"]').click();
    
    // Should redirect to projects list
    cy.url().should('include', '/projects');
    cy.contains(projectName).should('be.visible');
    
    // Navigate to the project
    cy.contains(projectName).click();
    
    // Verify Team Chat button exists
    cy.contains('Team Chat').should('be.visible');
    
    // Create a task for testing task discussions
    cy.contains('Manage Tasks').click();
    cy.contains('Add Task').click();
    
    const taskTitle = `Chat Test Task ${Date.now()}`;
    cy.get('#title').type(taskTitle);
    cy.get('#description').type('Task for testing chat discussions');
    cy.get('#assignedToId').select(1); // Select first user
    cy.get('button[type="submit"]').click();
    
    // Should redirect back to tasks
    cy.url().should('include', '/tasks');
    cy.contains(taskTitle).should('be.visible');
  });
});