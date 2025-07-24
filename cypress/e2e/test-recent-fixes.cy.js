describe('Test Recent Fixes', () => {
  const adminUser = { email: 'admin@example.com', password: 'admin123' };
  
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Login as admin using custom command
    cy.login(adminUser.email, adminUser.password);
  });

  describe('Task Kanban Board', () => {
    it('should make tasks clickable in kanban view', () => {
      // Navigate to projects
      cy.visit('/projects');
      
      // Click on first project (or create one if needed)
      cy.get('a[href^="/projects/"]').first().click();
      
      // Navigate to tasks
      cy.contains('button', 'View Tasks').click();
      cy.url().should('include', '/tasks');
      
      // Check if there are any tasks, if not create one
      cy.get('body').then($body => {
        if ($body.text().includes('No tasks')) {
          // Create a task
          cy.get('.grid > div').first().find('button').contains('svg').parent().click();
          cy.get('input[name="title"]').type('Test Clickable Task');
          cy.get('textarea[name="description"]').type('This task should be clickable');
          cy.get('button[type="submit"]').click();
          
          // Wait for modal to close and page to refresh
          cy.wait(2000);
        }
      });
      
      // Click on a task card
      cy.get('[data-testid="task-card"]').first().click();
      
      // Should navigate to task detail page
      cy.url().should('match', /\/tasks\/[\w-]+$/);
      cy.get('h1').should('exist');
    });
  });

  describe('Organization Management', () => {
    it('should have working edit organization button', () => {
      // Navigate to organizations
      cy.visit('/organizations');
      
      // Click on first organization
      cy.get('a[href^="/organizations/"]').first().click();
      cy.url().should('match', /\/organizations\/[\w-]+$/);
      
      // Click edit organization button
      cy.contains('button', 'Edit Organization').click();
      
      // Should navigate to edit page
      cy.url().should('match', /\/organizations\/[\w-]+\/edit$/);
      cy.get('h1').should('contain', 'Edit Organization');
    });
  });

  describe('Project Management', () => {
    it('should have working edit project button', () => {
      // Navigate to projects
      cy.visit('/projects');
      
      // Click on first project
      cy.get('a[href^="/projects/"]').first().click();
      cy.url().should('match', /\/projects\/[\w-]+$/);
      
      // Click edit project button
      cy.contains('button', 'Edit Project').click();
      
      // Should navigate to edit page
      cy.url().should('match', /\/projects\/[\w-]+\/edit$/);
      cy.get('h1').should('contain', 'Edit Project');
    });

    it('should have working view files button', () => {
      // Navigate to projects
      cy.visit('/projects');
      
      // Click on first project
      cy.get('a[href^="/projects/"]').first().click();
      cy.url().should('match', /\/projects\/[\w-]+$/);
      
      // Click view files button
      cy.contains('button', 'View Files').click();
      
      // Should navigate to files page
      cy.url().should('match', /\/projects\/[\w-]+\/files$/);
      cy.get('h1').should('contain', 'Files');
    });
  });

  describe('Task Creation', () => {
    it('should save tasks without errors', () => {
      // Navigate to projects
      cy.visit('/projects');
      
      // Click on first project
      cy.get('a[href^="/projects/"]').first().click();
      
      // Navigate to tasks
      cy.contains('button', 'View Tasks').click();
      cy.url().should('include', '/tasks');
      
      // Create a new task
      cy.get('.grid > div').first().find('button').contains('svg').parent().click();
      
      // Fill form with minimal data
      cy.get('input[name="title"]').type('Test Task Save');
      cy.get('button[type="submit"]').click();
      
      // Task should be created without error
      cy.contains('Test Task Save').should('exist');
      
      // Create another task with all fields
      cy.get('.grid > div').first().find('button').contains('svg').parent().click();
      cy.get('input[name="title"]').type('Test Task Complete');
      cy.get('textarea[name="description"]').type('This is a complete task');
      cy.get('input[name="dueDate"]').type('2024-12-31');
      cy.get('button[type="submit"]').click();
      
      // Task should be created
      cy.contains('Test Task Complete').should('exist');
    });
  });

  describe('File Management', () => {
    it('should display file upload zone on project files page', () => {
      // Navigate to projects
      cy.visit('/projects');
      
      // Click on first project
      cy.get('a[href^="/projects/"]').first().click();
      
      // Click view files button
      cy.contains('button', 'View Files').click();
      
      // Should show upload zone
      cy.contains('Upload Files').should('exist');
      // Check for dropzone or file input
      cy.get('input[type="file"]').should('exist');
    });
  });
});