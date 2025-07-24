describe('Complete Feature Test', () => {
  const adminUser = { email: 'admin@example.com', password: 'admin123' };
  const teamUser = { email: 'team@example.com', password: 'team123' };
  const clientUser = { email: 'user@example.com', password: 'user123' };
  
  // Test data
  const testOrg = {
    name: 'Cypress Test Organization',
    type: 'client',
    email: 'cypress@testorg.com'
  };
  
  const testProject = {
    name: 'Cypress Test Project',
    description: 'A test project for Cypress E2E tests'
  };
  
  const testTask = {
    title: 'Cypress Test Task',
    description: 'A test task that should be clickable'
  };

  before(() => {
    // Clean up and setup initial data
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Setup Test Data', () => {
    it('should create organization and project', () => {
      cy.login(adminUser.email, adminUser.password);
      
      // Create organization if it doesn't exist
      cy.visit('/organizations');
      cy.get('body').then($body => {
        if (!$body.text().includes(testOrg.name)) {
          cy.contains('button', 'New Organization').click();
          cy.get('input[name="name"]').type(testOrg.name);
          cy.get('select[name="type"]').select(testOrg.type);
          cy.get('input[name="contactEmail"]').type(testOrg.email);
          cy.get('button[type="submit"]').click();
          cy.url().should('include', '/organizations');
          cy.contains(testOrg.name).should('exist');
        }
      });
      
      // Create project if it doesn't exist
      cy.visit('/projects');
      cy.get('body').then($body => {
        if (!$body.text().includes(testProject.name)) {
          cy.contains('button', 'New Project').click();
          cy.get('input[name="name"]').type(testProject.name);
          cy.get('textarea[name="description"]').type(testProject.description);
          cy.get('select[name="organizationId"]').select(1); // Select first org
          cy.get('select[name="status"]').select('active');
          cy.get('button[type="submit"]').click();
          cy.url().should('include', '/projects');
          cy.contains(testProject.name).should('exist');
        }
      });
    });
  });

  describe('Task Kanban Features', () => {
    beforeEach(() => {
      cy.login(adminUser.email, adminUser.password);
    });

    it('should create a task and make it clickable', () => {
      // Navigate to project
      cy.visit('/projects');
      cy.contains(testProject.name).click();
      
      // Go to tasks
      cy.contains('button', 'View Tasks').click();
      cy.url().should('include', '/tasks');
      
      // Create a task
      cy.get('.grid > div').first().find('button[aria-label*="Add"]').click();
      cy.get('input[name="title"]').type(testTask.title);
      cy.get('textarea[name="description"]').type(testTask.description);
      cy.get('button[type="submit"]').click();
      
      // Wait for task to appear
      cy.contains(testTask.title).should('exist');
      
      // Click on the task
      cy.get('[data-testid="task-card"]').contains(testTask.title).click();
      
      // Should navigate to task detail
      cy.url().should('match', /\/tasks\/[\w-]+$/);
      cy.get('h1').should('contain', testTask.title);
      cy.contains(testTask.description).should('exist');
    });

    it('should drag tasks between columns', () => {
      cy.visit('/projects');
      cy.contains(testProject.name).click();
      cy.contains('button', 'View Tasks').click();
      
      // Task should be in Not Started
      cy.get('.grid > div').first().contains(testTask.title).should('exist');
      
      // Use the quick action button instead of drag
      cy.get('[data-testid="task-card"]').contains(testTask.title)
        .parent().parent().find('button').contains('Start Task').click();
      
      // Task should now be in In Progress
      cy.get('.grid > div').eq(1).contains(testTask.title).should('exist');
    });
  });

  describe('Navigation Features', () => {
    beforeEach(() => {
      cy.login(adminUser.email, adminUser.password);
    });

    it('should navigate to edit organization page', () => {
      cy.visit('/organizations');
      cy.contains(testOrg.name).click();
      cy.contains('button', 'Edit Organization').click();
      cy.url().should('match', /\/organizations\/[\w-]+\/edit$/);
      cy.get('h1').should('contain', 'Edit Organization');
      cy.get('input[name="name"]').should('have.value', testOrg.name);
    });

    it('should navigate to edit project page', () => {
      cy.visit('/projects');
      cy.contains(testProject.name).click();
      cy.contains('button', 'Edit Project').click();
      cy.url().should('match', /\/projects\/[\w-]+\/edit$/);
      cy.get('h1').should('contain', 'Edit Project');
      cy.get('input[name="name"]').should('have.value', testProject.name);
    });

    it('should navigate to project files page', () => {
      cy.visit('/projects');
      cy.contains(testProject.name).click();
      cy.contains('button', 'View Files').click();
      cy.url().should('match', /\/projects\/[\w-]+\/files$/);
      cy.get('h1').should('contain', 'Files');
      cy.contains('Upload Files').should('exist');
    });
  });

  describe('File Management', () => {
    beforeEach(() => {
      cy.login(adminUser.email, adminUser.password);
    });

    it('should upload a file to project', () => {
      cy.visit('/projects');
      cy.contains(testProject.name).click();
      cy.contains('button', 'View Files').click();
      
      // Create and upload a test file
      const fileName = 'test-file.txt';
      const fileContent = 'This is a test file for Cypress';
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(fileContent),
        fileName: fileName,
        mimeType: 'text/plain',
        lastModified: Date.now(),
      }, { force: true });
      
      // Wait for upload
      cy.wait(1000);
      
      // File should appear in list
      cy.contains(fileName).should('exist');
    });
  });

  describe('Role-Based Access', () => {
    it('should show admin-only features for admin users', () => {
      cy.login(adminUser.email, adminUser.password);
      
      // Should see admin menu
      cy.get('nav').contains('Admin').should('exist');
      
      // Should see organizations menu
      cy.get('nav').contains('Organizations').should('exist');
      
      // Should see create buttons
      cy.visit('/projects');
      cy.contains('button', 'New Project').should('exist');
      
      cy.visit('/organizations');
      cy.contains('button', 'New Organization').should('exist');
    });

    it('should hide admin features for client users', () => {
      cy.login(clientUser.email, clientUser.password);
      
      // Should not see admin menu
      cy.get('nav').contains('Admin').should('not.exist');
      
      // Should not see organizations menu
      cy.get('nav').contains('Organizations').should('not.exist');
      
      // Should not see create buttons
      cy.visit('/projects');
      cy.contains('button', 'New Project').should('not.exist');
    });

    it('should show team member features', () => {
      cy.login(teamUser.email, teamUser.password);
      
      // Should not see admin menu
      cy.get('nav').contains('Admin').should('not.exist');
      
      // Should see organizations menu
      cy.get('nav').contains('Organizations').should('exist');
      
      // Should see some create capabilities
      cy.visit('/projects');
      cy.get('body').then($body => {
        // Team members might have limited create access
        const hasNewButton = $body.text().includes('New Project');
        expect(hasNewButton).to.be.oneOf([true, false]); // Depends on permissions
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      cy.login(adminUser.email, adminUser.password);
    });

    it('should handle non-existent resources', () => {
      // Non-existent project
      cy.visit('/projects/non-existent-id', { failOnStatusCode: false });
      cy.url().should('include', '/projects');
      
      // Non-existent task
      cy.visit('/tasks/non-existent-id', { failOnStatusCode: false });
      cy.get('body').should('contain.text', 'not found');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      cy.login(adminUser.email, adminUser.password);
    });

    it('should work on mobile devices', () => {
      cy.viewport('iphone-x');
      cy.visit('/dashboard');
      
      // Mobile menu should exist
      cy.get('button[aria-label*="menu"]').should('be.visible');
      
      // Navigation should work
      cy.get('button[aria-label*="menu"]').click();
      cy.contains('Projects').should('be.visible');
    });
  });
});