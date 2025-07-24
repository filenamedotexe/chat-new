describe('Task Detail - Status Changes', () => {
  it('should test status changes on existing tasks', () => {
    // Login as admin
    cy.visit('/login');
    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Navigate to projects
    cy.visit('/projects');
    
    // If no projects exist, create one
    cy.get('body').then(($body) => {
      if ($body.text().includes('No projects yet')) {
        // Create organization first
        cy.visit('/organizations/new');
        cy.get('#name').type('Test Organization');
        cy.get('#contactEmail').type('test@example.com');
        cy.get('button[type="submit"]').click();
        cy.wait(1000);
        
        // Create project
        cy.visit('/projects/new');
        cy.get('#name').type('Test Project');
        cy.get('#organizationId').select(1);
        cy.get('button[type="submit"]').click();
        cy.wait(1000);
      }
    });
    
    // Go to first project
    cy.visit('/projects');
    cy.get('a[href^="/projects/"]').first().click();
    
    // Navigate to tasks
    cy.contains('Tasks').click();
    
    // Create a task if none exist
    cy.get('body').then(($body) => {
      if (!$body.find('.cursor-pointer').length) {
        cy.contains('Create Task').click();
        cy.get('#title').type('Test Task for Status Change');
        cy.get('#description').type('This is a test task');
        cy.get('button[type="submit"]').click();
        cy.wait(1000);
      }
    });
    
    // Click on first task
    cy.get('.cursor-pointer').first().click();
    
    // Test status changes
    cy.get('body').then(($body) => {
      // If task is not started, start it
      if ($body.text().includes('Start Task')) {
        cy.contains('Start Task').click();
        cy.on('window:alert', (text) => {
          expect(text).to.contain('Status updated successfully');
        });
        cy.wait(1000);
      }
      
      // If in progress, submit for review
      if ($body.text().includes('Submit for Review')) {
        cy.contains('Submit for Review').click();
        cy.wait(1000);
      }
      
      // If needs review, mark done
      if ($body.text().includes('Mark Done')) {
        cy.contains('Mark Done').click();
        cy.wait(1000);
      }
    });
    
    // Test edit functionality
    cy.contains('Edit Task').click();
    cy.get('#title').should('exist');
    cy.get('#status').should('exist');
    
    // Update title
    const newTitle = `Updated Task ${Date.now()}`;
    cy.get('#title').clear().type(newTitle);
    cy.get('button[type="submit"]').click();
    
    // Verify title updated
    cy.get('h1').should('contain', newTitle);
  });
  
  it('should test file upload functionality', () => {
    // Login as admin
    cy.visit('/login');
    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Navigate to first task
    cy.visit('/projects');
    cy.get('a[href^="/projects/"]').first().click();
    cy.contains('Tasks').click();
    cy.get('.cursor-pointer').first().click();
    
    // Add files
    cy.get('[data-testid="add-files-button"]').click();
    
    // Upload a file
    const fileName = 'test-file.txt';
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('Test file content'),
      fileName: fileName,
      mimeType: 'text/plain'
    }, { force: true });
    
    // Verify file appears
    cy.contains(fileName).should('be.visible');
    
    // Upload the file
    cy.contains('Upload Files').click();
    
    // Wait for success
    cy.contains('All files uploaded successfully', { timeout: 10000 }).should('be.visible');
    
    // Cancel to close upload form
    cy.contains('Upload More Files').click();
    cy.get('button').contains('Cancel').click();
    
    // Verify file in list
    cy.get('[data-testid="file-list"]').should('exist');
    cy.get('[data-testid="file-name"]').should('contain', fileName);
  });
});