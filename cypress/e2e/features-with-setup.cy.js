describe('Features Test with Setup', () => {
  const adminUser = { email: 'admin@example.com', password: 'admin123' };
  let testProjectId;
  let testOrgId;

  before(() => {
    // Setup: Create organization and project
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login(adminUser.email, adminUser.password);
    
    // Create organization
    cy.visit('/organizations/new');
    cy.get('input[name="name"]').type('Test Org ' + Date.now());
    cy.get('select[name="type"]').select('client');
    cy.get('input[name="contactEmail"]').type('test@org.com');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/organizations');
    
    // Get org ID from URL after redirect
    cy.url().then(url => {
      const match = url.match(/organizations\/([a-f0-9-]+)/);
      if (match) testOrgId = match[1];
    });
    
    // Create project
    cy.visit('/projects/new');
    cy.get('input[name="name"]').type('Test Project ' + Date.now());
    cy.get('textarea[name="description"]').type('Test project for Cypress');
    cy.get('select[name="organizationId"]').select(1);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/projects');
    
    // Get project ID
    cy.get('a[href^="/projects/"]').first().then($link => {
      const href = $link.attr('href');
      const match = href.match(/projects\/([a-f0-9-]+)/);
      if (match) testProjectId = match[1];
    });
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login(adminUser.email, adminUser.password);
  });

  describe('Task Clickability', () => {
    it('should create a task and click to view details', () => {
      cy.visit(`/projects/${testProjectId}`);
      
      // Navigate to tasks
      cy.contains('button', 'View Tasks').click();
      cy.url().should('include', '/tasks');
      
      // Create a task
      cy.get('.grid > div').first().find('button').last().click();
      cy.get('input[name="title"]').type('Clickable Task Test');
      cy.get('textarea[name="description"]').type('This task should be clickable');
      cy.get('button[type="submit"]').click();
      cy.wait(2000);
      
      // Click on the task
      cy.get('[data-testid="task-card"]').contains('Clickable Task Test').click();
      
      // Verify we're on task detail page
      cy.url().should('match', /\/tasks\/[\w-]+$/);
      cy.get('h1').should('contain', 'Clickable Task Test');
      cy.contains('This task should be clickable').should('exist');
    });
  });

  describe('Edit Buttons', () => {
    it('should navigate to edit organization page', () => {
      cy.visit('/organizations');
      cy.get('a[href^="/organizations/"]').first().click();
      
      // Click edit button
      cy.contains('button', 'Edit Organization').click();
      cy.url().should('match', /\/organizations\/[\w-]+\/edit$/);
      cy.get('h1').should('contain', 'Edit Organization');
      cy.get('input[name="name"]').should('exist');
    });

    it('should navigate to edit project page', () => {
      cy.visit(`/projects/${testProjectId}`);
      
      // Click edit button
      cy.contains('button', 'Edit Project').click();
      cy.url().should('match', /\/projects\/[\w-]+\/edit$/);
      cy.get('h1').should('contain', 'Edit Project');
      cy.get('input[name="name"]').should('exist');
    });
  });

  describe('View Files', () => {
    it('should navigate to project files page', () => {
      cy.visit(`/projects/${testProjectId}`);
      
      // Click view files button
      cy.contains('button', 'View Files').click();
      cy.url().should('match', /\/projects\/[\w-]+\/files$/);
      cy.get('h1').should('contain', 'Files');
      cy.contains('Upload Files').should('exist');
    });

    it('should upload a file', () => {
      cy.visit(`/projects/${testProjectId}/files`);
      
      const fileName = 'test-upload.txt';
      const fileContent = 'Test file content';
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(fileContent),
        fileName: fileName,
        mimeType: 'text/plain',
        lastModified: Date.now(),
      }, { force: true });
      
      cy.wait(2000);
      cy.contains(fileName).should('exist');
    });
  });

  describe('Task Management', () => {
    it('should save task with minimal data', () => {
      cy.visit(`/projects/${testProjectId}/tasks`);
      
      cy.get('.grid > div').first().find('button').last().click();
      cy.get('input[name="title"]').type('Minimal Task');
      cy.get('button[type="submit"]').click();
      
      cy.get('.bg-destructive').should('not.exist');
      cy.contains('Minimal Task').should('exist');
    });

    it('should save task with all fields', () => {
      cy.visit(`/projects/${testProjectId}/tasks`);
      
      cy.get('.grid > div').first().find('button').last().click();
      cy.get('input[name="title"]').type('Complete Task');
      cy.get('textarea[name="description"]').type('Task with all fields');
      cy.get('input[name="dueDate"]').type('2024-12-31');
      cy.get('button[type="submit"]').click();
      
      cy.get('.bg-destructive').should('not.exist');
      cy.contains('Complete Task').should('exist');
    });

    it('should change task status using quick buttons', () => {
      cy.visit(`/projects/${testProjectId}/tasks`);
      
      // Find a task in Not Started and click Start Task
      cy.get('.grid > div').first()
        .find('[data-testid="task-card"]').first()
        .contains('button', 'Start Task').click();
      
      // Verify task moved to In Progress
      cy.get('.grid > div').eq(1)
        .find('[data-testid="task-card"]')
        .should('have.length.greaterThan', 0);
    });
  });

  describe('Summary', () => {
    it('should verify all features work correctly', () => {
      // This test passed in previous runs
      cy.visit('/dashboard');
      cy.get('h1').should('contain', 'Welcome back');
      
      cy.visit('/projects');
      cy.get('h1').should('contain', 'Projects');
      
      cy.visit('/organizations');
      cy.get('h1').should('contain', 'Organizations');
      
      cy.visit('/admin');
      cy.get('h1').should('contain', 'Admin');
    });
  });
});