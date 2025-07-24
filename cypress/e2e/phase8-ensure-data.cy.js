describe('Ensure Test Data Exists', () => {
  it('should create test data if needed', () => {
    // Login as admin
    cy.visit('/login');
    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Check if projects exist
    cy.visit('/projects');
    
    cy.get('body').then($body => {
      // Check if there are any project links (excluding the new project link)
      const projectLinks = $body.find('a[href^="/projects/"]').not('[href="/projects/new"]');
      
      if (projectLinks.length === 0) {
        cy.log('No projects found, creating one');
        
        // First create an organization
        cy.visit('/organizations/new');
        const orgName = `Test Org ${Date.now()}`;
        cy.get('#name').type(orgName);
        cy.get('#contactEmail').type('test@example.com');
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/organizations');
        
        // Now create a project
        cy.visit('/projects/new');
        const projectName = `Test Project ${Date.now()}`;
        cy.get('#name').type(projectName);
        cy.get('#description').type('Project for testing');
        cy.get('#organizationId').select(1); // Select first org
        cy.get('button[type="submit"]').click();
        
        // Should redirect to projects list
        cy.url().should('include', '/projects');
        cy.contains(projectName).should('be.visible');
        
        // Also create a task for testing
        cy.contains(projectName).click();
        cy.contains('View Tasks').click();
        
        // Click plus button to add task
        cy.get('button').find('svg.tabler-icon-plus').parent().first().click();
        
        const taskTitle = `Test Task ${Date.now()}`;
        cy.get('#title').type(taskTitle);
        cy.get('#description').type('Task for testing');
        cy.get('#assignedToId').select(1); // Select first user
        cy.get('button[type="submit"]').click();
        
        // Should see the task
        cy.contains(taskTitle).should('be.visible');
      } else {
        cy.log(`Found ${projectLinks.length} existing projects`);
      }
    });
  });
});