describe('Demo - All Features Working', () => {
  const adminUser = { email: 'admin@example.com', password: 'admin123' };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login(adminUser.email, adminUser.password);
  });

  it('demonstrates task clickability in kanban view', () => {
    // Navigate to projects page
    cy.visit('/projects');
    
    // Check if there are any projects, if not create one
    cy.get('body').then($body => {
      if ($body.find('a[href^="/projects/"]').length === 0) {
        // Create a project
        cy.contains('button', 'Create Project').click();
        cy.get('input[name="name"]').type('Demo Project');
        cy.get('textarea[name="description"]').type('Demo project for testing');
        cy.get('select[name="organizationId"]').select(1);
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/projects');
      }
    });
    
    // Click on first project
    cy.get('a[href^="/projects/"]').first().click();
    cy.url().should('match', /\/projects\/[\w-]+$/);
    
    // Navigate to tasks
    cy.contains('button', 'View Tasks').click();
    cy.url().should('include', '/tasks');
    
    // Create a task
    cy.get('.grid > div').first().find('button').last().click();
    cy.get('input[name="title"]').type('Clickable Task Demo');
    cy.get('textarea[name="description"]').type('This demonstrates task clickability');
    cy.get('button[type="submit"]').click();
    cy.wait(2000);
    
    // Click on the task to view details
    cy.get('[data-testid="task-card"]').contains('Clickable Task Demo').click();
    
    // Verify we're on task detail page
    cy.url().should('match', /\/tasks\/[\w-]+$/);
    cy.get('h1').should('contain', 'Clickable Task Demo');
    cy.contains('This demonstrates task clickability').should('exist');
  });

  it('demonstrates edit organization button works', () => {
    cy.visit('/organizations');
    
    // Click on first organization
    cy.get('a[href^="/organizations/"]').first().click();
    cy.url().should('match', /\/organizations\/[\w-]+$/);
    
    // Click edit button
    cy.contains('button', 'Edit Organization').click();
    
    // Verify we're on edit page
    cy.url().should('match', /\/organizations\/[\w-]+\/edit$/);
    cy.get('h1').should('contain', 'Edit Organization');
    cy.get('input[name="name"]').should('exist');
  });

  it('demonstrates edit project button works', () => {
    cy.visit('/projects');
    
    // Click on first project
    cy.get('a[href^="/projects/"]').first().click();
    cy.url().should('match', /\/projects\/[\w-]+$/);
    
    // Click edit button
    cy.contains('button', 'Edit Project').click();
    
    // Verify we're on edit page
    cy.url().should('match', /\/projects\/[\w-]+\/edit$/);
    cy.get('h1').should('contain', 'Edit Project');
    cy.get('input[name="name"]').should('exist');
  });

  it('demonstrates view files button works', () => {
    cy.visit('/projects');
    
    // Click on first project
    cy.get('a[href^="/projects/"]').first().click();
    cy.url().should('match', /\/projects\/[\w-]+$/);
    
    // Click view files button
    cy.contains('button', 'View Files').click();
    
    // Verify we're on files page
    cy.url().should('match', /\/projects\/[\w-]+\/files$/);
    cy.get('h1').should('contain', 'Files');
    cy.contains('Upload Files').should('exist');
    cy.get('input[type="file"]').should('exist');
  });

  it('demonstrates task creation without errors', () => {
    cy.visit('/projects');
    cy.get('a[href^="/projects/"]').first().click();
    cy.contains('button', 'View Tasks').click();
    
    // Test minimal task creation
    cy.get('.grid > div').first().find('button').last().click();
    cy.get('input[name="title"]').type('Minimal Task ' + Date.now());
    cy.get('button[type="submit"]').click();
    
    // Should not show error
    cy.get('.bg-destructive').should('not.exist');
    cy.contains('Minimal Task').should('exist');
    
    // Test complete task creation
    cy.get('.grid > div').first().find('button').last().click();
    cy.get('input[name="title"]').type('Complete Task ' + Date.now());
    cy.get('textarea[name="description"]').type('Task with all fields');
    cy.get('input[name="dueDate"]').type('2024-12-31');
    cy.get('button[type="submit"]').click();
    
    // Should not show error
    cy.get('.bg-destructive').should('not.exist');
    cy.contains('Complete Task').should('exist');
  });

  it('demonstrates quick status changes work', () => {
    cy.visit('/projects');
    cy.get('a[href^="/projects/"]').first().click();
    cy.contains('button', 'View Tasks').click();
    
    // Find a task in Not Started column and start it
    cy.get('.grid > div').first().then($column => {
      if ($column.find('[data-testid="task-card"]').length > 0) {
        // Click Start Task button
        cy.get('.grid > div').first()
          .find('[data-testid="task-card"]').first()
          .contains('button', 'Start Task').click();
        
        // Verify task moved to In Progress
        cy.get('.grid > div').eq(1)
          .find('[data-testid="task-card"]')
          .should('have.length.greaterThan', 0);
      }
    });
  });

  it('demonstrates file upload works', () => {
    cy.visit('/projects');
    cy.get('a[href^="/projects/"]').first().click();
    cy.contains('button', 'View Files').click();
    
    // Upload a test file
    const fileName = 'demo-file.txt';
    const fileContent = 'This is a demo file upload';
    
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from(fileContent),
      fileName: fileName,
      mimeType: 'text/plain',
      lastModified: Date.now(),
    }, { force: true });
    
    // Wait for upload
    cy.wait(2000);
    
    // File should appear
    cy.contains(fileName).should('exist');
  });
});