describe('Task Detail Page - Simple Test', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should create and view a task', () => {
    // First create an organization
    cy.visit('/organizations/new');
    const orgName = `Test Org ${Date.now()}`;
    cy.get('#name').type(orgName);
    cy.get('#email').type('test@example.com');
    cy.get('#phone').type('1234567890');
    cy.get('button[type="submit"]').click();
    
    // Create a project
    cy.visit('/projects/new');
    const projectName = `Test Project ${Date.now()}`;
    cy.get('#name').type(projectName);
    cy.get('#description').type('Test project description');
    cy.get('#organizationId').select(1); // Select first option
    cy.get('button[type="submit"]').click();
    
    // Navigate to the created project
    cy.contains(projectName).should('be.visible');
    
    // Go to tasks tab
    cy.contains('Tasks').click();
    
    // Create a task
    cy.contains('Create Task').click();
    const taskTitle = `Test Task ${Date.now()}`;
    cy.get('#title').type(taskTitle);
    cy.get('#description').type('Test task description');
    cy.get('button[type="submit"]').click();
    
    // Click on the created task
    cy.contains(taskTitle).click();
    
    // Verify task details
    cy.get('h1').should('contain', taskTitle);
    cy.contains('Test task description').should('be.visible');
    cy.contains('Not Started').should('be.visible');
    
    // Test status change
    cy.contains('Start Task').click();
    cy.on('window:alert', (text) => {
      expect(text).to.contain('Status updated successfully');
    });
    cy.contains('In Progress').should('be.visible');
    
    // Test edit functionality
    cy.contains('Edit Task').click();
    cy.get('#title').clear().type('Updated Task Title');
    cy.get('#status').select('needs_review');
    cy.get('button[type="submit"]').click();
    
    // Verify changes
    cy.get('h1').should('contain', 'Updated Task Title');
    cy.contains('Needs Review').should('be.visible');
  });

  it('should test file attachments', () => {
    // Navigate to first available project
    cy.visit('/projects');
    cy.get('a[href^="/projects/"]').first().click();
    cy.contains('Tasks').click();
    
    // Create or click on a task
    if (cy.contains('Create Task').should('exist')) {
      cy.contains('Create Task').click();
      cy.get('#title').type('Task with Files');
      cy.get('button[type="submit"]').click();
      cy.contains('Task with Files').click();
    } else {
      cy.get('.cursor-pointer').first().click();
    }
    
    // Test file upload
    cy.get('[data-testid="add-files-button"]').click();
    
    const fileName = 'test-document.txt';
    cy.get('[data-testid="file-dropzone"]').within(() => {
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('This is test file content'),
        fileName: fileName,
        mimeType: 'text/plain'
      }, { force: true });
    });
    
    cy.contains(fileName).should('be.visible');
    cy.contains('Upload Files').click();
    
    // Wait for upload
    cy.get('[data-testid="upload-success"]', { timeout: 10000 }).should('be.visible');
    
    // Verify file in list
    cy.get('[data-testid="file-list"]').within(() => {
      cy.get('[data-testid="file-name"]').should('contain', fileName);
    });
  });

  it('should test client permissions', () => {
    // First create data as admin
    cy.visit('/projects');
    cy.get('a[href^="/projects/"]').first().click();
    cy.contains('Tasks').click();
    cy.get('.cursor-pointer').first().click();
    cy.url().then((taskUrl) => {
      // Logout
      cy.visit('/api/auth/signout');
      
      // Login as client
      cy.visit('/login');
      cy.get('#email').type('user@example.com');
      cy.get('#password').type('user123');
      cy.get('button[type="submit"]').click();
      
      // Visit the same task
      cy.visit(taskUrl);
      
      // Verify read-only access
      cy.contains('Edit Task').should('not.exist');
      cy.contains('Delete').should('not.exist');
      cy.contains('Start Task').should('not.exist');
      cy.get('[data-testid="add-files-button"]').should('not.exist');
      
      // But can view details
      cy.get('h1').should('be.visible');
      cy.contains('Description').should('be.visible');
    });
  });
});