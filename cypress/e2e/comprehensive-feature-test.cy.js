describe('Comprehensive Feature Testing', () => {
  // Test credentials
  const adminUser = { email: 'admin@example.com', password: 'admin123' };
  const teamUser = { email: 'team@example.com', password: 'team123' };
  const clientUser = { email: 'user@example.com', password: 'user123' };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Authentication Tests', () => {
    it('should login as admin successfully', () => {
      cy.visit('/login');
      cy.get('#email').type(adminUser.email);
      cy.get('#password').type(adminUser.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
      cy.get('h1').should('contain', 'Dashboard');
    });

    it('should login as team member successfully', () => {
      cy.visit('/login');
      cy.get('#email').type(teamUser.email);
      cy.get('#password').type(teamUser.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should login as client successfully', () => {
      cy.visit('/login');
      cy.get('#email').type(clientUser.email);
      cy.get('#password').type(clientUser.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should logout successfully', () => {
      // Login first
      cy.visit('/login');
      cy.get('#email').type(adminUser.email);
      cy.get('#password').type(adminUser.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
      
      // Logout
      cy.get('[data-testid="user-menu-button"]').click();
      cy.get('[data-testid="logout-button"]').click();
      cy.url().should('include', '/login');
    });
  });

  describe('Navigation Tests', () => {
    beforeEach(() => {
      // Login as admin
      cy.visit('/login');
      cy.get('#email').type(adminUser.email);
      cy.get('#password').type(adminUser.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should navigate to all main pages', () => {
      // Dashboard
      cy.get('[href="/dashboard"]').click();
      cy.url().should('include', '/dashboard');
      cy.get('h1').should('contain', 'Dashboard');

      // Projects
      cy.get('[href="/projects"]').click();
      cy.url().should('include', '/projects');
      cy.get('h1').should('contain', 'Projects');

      // Organizations
      cy.get('[href="/organizations"]').click();
      cy.url().should('include', '/organizations');
      cy.get('h1').should('contain', 'Organizations');

      // Admin page (admin only)
      cy.get('[href="/admin"]').click();
      cy.url().should('include', '/admin');
      cy.get('h1').should('contain', 'Admin');
    });
  });

  describe('Organization Management', () => {
    beforeEach(() => {
      // Login as admin
      cy.visit('/login');
      cy.get('#email').type(adminUser.email);
      cy.get('#password').type(adminUser.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should create a new organization', () => {
      cy.visit('/organizations');
      cy.contains('button', 'New Organization').click();
      cy.url().should('include', '/organizations/new');

      // Fill form
      cy.get('#name').type('Test Organization');
      cy.get('#type').select('client');
      cy.get('#contactEmail').type('test@organization.com');
      cy.get('button[type="submit"]').click();

      // Should redirect to organizations list
      cy.url().should('match', /\/organizations$/);
      cy.contains('Test Organization').should('exist');
    });

    it('should view organization details', () => {
      cy.visit('/organizations');
      cy.contains('Test Organization').click();
      cy.url().should('match', /\/organizations\/[\w-]+$/);
      cy.get('h1').should('contain', 'Test Organization');
      cy.contains('Client Organization').should('exist');
    });

    it('should navigate to edit organization', () => {
      cy.visit('/organizations');
      cy.contains('Test Organization').click();
      cy.contains('button', 'Edit Organization').click();
      cy.url().should('match', /\/organizations\/[\w-]+\/edit$/);
      cy.get('h1').should('contain', 'Edit Organization');
    });
  });

  describe('Project Management', () => {
    beforeEach(() => {
      // Login as admin
      cy.visit('/login');
      cy.get('#email').type(adminUser.email);
      cy.get('#password').type(adminUser.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should create a new project', () => {
      cy.visit('/projects');
      cy.contains('button', 'New Project').click();
      cy.url().should('include', '/projects/new');

      // Fill form
      cy.get('#name').type('Test Project');
      cy.get('#description').type('This is a test project');
      cy.get('#organizationId').select(1); // Select first organization
      cy.get('#status').select('active');
      cy.get('#startDate').type('2024-01-01');
      cy.get('#endDate').type('2024-12-31');
      cy.get('button[type="submit"]').click();

      // Should redirect to projects list
      cy.url().should('match', /\/projects$/);
      cy.contains('Test Project').should('exist');
    });

    it('should view project details', () => {
      cy.visit('/projects');
      cy.contains('Test Project').click();
      cy.url().should('match', /\/projects\/[\w-]+$/);
      cy.get('h1').should('contain', 'Test Project');
      cy.contains('This is a test project').should('exist');
    });

    it('should navigate to edit project', () => {
      cy.visit('/projects');
      cy.contains('Test Project').click();
      cy.contains('button', 'Edit Project').click();
      cy.url().should('match', /\/projects\/[\w-]+\/edit$/);
      cy.get('h1').should('contain', 'Edit Project');
    });

    it('should navigate to project files', () => {
      cy.visit('/projects');
      cy.contains('Test Project').click();
      cy.contains('button', 'View Files').click();
      cy.url().should('match', /\/projects\/[\w-]+\/files$/);
      cy.get('h1').should('contain', 'Test Project - Files');
    });

    it('should navigate to project tasks', () => {
      cy.visit('/projects');
      cy.contains('Test Project').click();
      cy.contains('button', 'View Tasks').click();
      cy.url().should('match', /\/projects\/[\w-]+\/tasks$/);
      cy.get('h1').should('contain', 'Test Project - Tasks');
    });
  });

  describe('Task Management', () => {
    let projectId;

    beforeEach(() => {
      // Login as admin
      cy.visit('/login');
      cy.get('#email').type(adminUser.email);
      cy.get('#password').type(adminUser.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');

      // Get project ID
      cy.visit('/projects');
      cy.contains('Test Project').click();
      cy.url().then((url) => {
        projectId = url.split('/').pop();
      });
    });

    it('should create a new task', () => {
      cy.visit(`/projects/${projectId}/tasks`);
      
      // Click add task button in Not Started column
      cy.get('.grid > div').first().find('button').contains('svg').parent().click();
      
      // Fill form in modal
      cy.get('#title').type('Test Task');
      cy.get('#description').type('This is a test task');
      cy.get('#assignedToId').select(1); // Select first user
      cy.get('#dueDate').type('2024-12-31');
      cy.get('button[type="submit"]').click();

      // Task should appear in board
      cy.contains('Test Task').should('exist');
    });

    it('should click on task to view details', () => {
      cy.visit(`/projects/${projectId}/tasks`);
      
      // Click on task card
      cy.contains('[data-testid="task-card"]', 'Test Task').click();
      
      // Should navigate to task detail page
      cy.url().should('match', /\/tasks\/[\w-]+$/);
      cy.get('h1').should('contain', 'Test Task');
      cy.contains('This is a test task').should('exist');
    });

    it('should drag task between columns', () => {
      cy.visit(`/projects/${projectId}/tasks`);
      
      // Find the task in Not Started column
      const dataTransfer = new DataTransfer();
      cy.contains('[data-testid="task-card"]', 'Test Task')
        .trigger('dragstart', { dataTransfer });
      
      // Drop in In Progress column
      cy.get('.grid > div').eq(1).find('.border-2')
        .trigger('drop', { dataTransfer });
      
      // Task should now be in In Progress column
      cy.get('.grid > div').eq(1).contains('Test Task').should('exist');
    });

    it('should use quick status buttons', () => {
      cy.visit(`/projects/${projectId}/tasks`);
      
      // Find task and click Start Task button
      cy.contains('[data-testid="task-card"]', 'Test Task')
        .find('button').contains('Start Task').click();
      
      // Task should move to In Progress
      cy.get('.grid > div').eq(1).contains('Test Task').should('exist');
    });
  });

  describe('File Management', () => {
    let projectId;

    beforeEach(() => {
      // Login as admin
      cy.visit('/login');
      cy.get('#email').type(adminUser.email);
      cy.get('#password').type(adminUser.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');

      // Get project ID
      cy.visit('/projects');
      cy.contains('Test Project').click();
      cy.url().then((url) => {
        projectId = url.split('/').pop();
      });
    });

    it('should navigate to project files page', () => {
      cy.visit(`/projects/${projectId}`);
      cy.contains('button', 'View Files').click();
      cy.url().should('include', '/files');
      cy.get('h1').should('contain', 'Test Project - Files');
    });

    it('should show file upload zone for authorized users', () => {
      cy.visit(`/projects/${projectId}/files`);
      cy.contains('Upload Files').should('exist');
      cy.get('[data-testid="file-upload-zone"]').should('exist');
    });

    it('should upload a file', () => {
      cy.visit(`/projects/${projectId}/files`);
      
      // Create a test file
      const fileName = 'test-file.txt';
      const fileContent = 'This is a test file';
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(fileContent),
        fileName: fileName,
        mimeType: 'text/plain',
        lastModified: Date.now(),
      }, { force: true });
      
      // File should appear in the list
      cy.contains(fileName).should('exist');
    });
  });

  describe('Role-based Access Control', () => {
    it('should show admin menu only for admin users', () => {
      // Login as admin
      cy.visit('/login');
      cy.get('#email').type(adminUser.email);
      cy.get('#password').type(adminUser.password);
      cy.get('button[type="submit"]').click();
      
      // Admin link should be visible
      cy.get('[href="/admin"]').should('exist');
      
      // Logout
      cy.get('[data-testid="user-menu-button"]').click();
      cy.get('[data-testid="logout-button"]').click();
      
      // Login as client
      cy.get('#email').type(clientUser.email);
      cy.get('#password').type(clientUser.password);
      cy.get('button[type="submit"]').click();
      
      // Admin link should not be visible
      cy.get('[href="/admin"]').should('not.exist');
    });

    it('should restrict organization access for clients', () => {
      // Login as client
      cy.visit('/login');
      cy.get('#email').type(clientUser.email);
      cy.get('#password').type(clientUser.password);
      cy.get('button[type="submit"]').click();
      
      // Organizations link should not be visible
      cy.get('[href="/organizations"]').should('not.exist');
      
      // Direct access should redirect
      cy.visit('/organizations');
      cy.url().should('include', '/dashboard');
    });

    it('should not show create buttons for clients', () => {
      // Login as client
      cy.visit('/login');
      cy.get('#email').type(clientUser.email);
      cy.get('#password').type(clientUser.password);
      cy.get('button[type="submit"]').click();
      
      // Visit projects
      cy.visit('/projects');
      
      // New Project button should not exist
      cy.contains('button', 'New Project').should('not.exist');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 pages', () => {
      // Login first
      cy.visit('/login');
      cy.get('#email').type(adminUser.email);
      cy.get('#password').type(adminUser.password);
      cy.get('button[type="submit"]').click();
      
      // Visit non-existent page
      cy.visit('/non-existent-page', { failOnStatusCode: false });
      cy.contains('404').should('exist');
    });

    it('should handle invalid project/task IDs', () => {
      // Login first
      cy.visit('/login');
      cy.get('#email').type(adminUser.email);
      cy.get('#password').type(adminUser.password);
      cy.get('button[type="submit"]').click();
      
      // Visit invalid project
      cy.visit('/projects/invalid-id');
      cy.url().should('include', '/projects');
      cy.get('h1').should('contain', 'Projects');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      // Login as admin
      cy.visit('/login');
      cy.get('#email').type(adminUser.email);
      cy.get('#password').type(adminUser.password);
      cy.get('button[type="submit"]').click();
    });

    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.visit('/dashboard');
      
      // Mobile menu should be visible
      cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
      
      // Click mobile menu
      cy.get('[data-testid="mobile-menu-button"]').click();
      
      // Navigation items should be visible
      cy.get('[href="/projects"]').should('be.visible');
    });

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.visit('/dashboard');
      
      // Layout should adapt
      cy.get('h1').should('contain', 'Dashboard');
    });
  });
});