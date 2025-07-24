describe('Task Detail Page', () => {
  beforeEach(() => {
    // Login as admin first
    cy.visit('/login');
    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.wait(1000); // Wait for dashboard to load
  });

  describe('View Task Details', () => {
    it('should display task information correctly', () => {
      // Navigate to projects to find a task
      cy.visit('/projects');
      
      // Click on first project - using Card component inside link
      cy.get('a[href^="/projects/"] .cursor-pointer').first().click();
      
      // Go to tasks tab
      cy.contains('Tasks').click();
      
      // Create a new task to test with
      cy.contains('Create Task').click();
      cy.get('#title').type('Test Task for Detail View');
      cy.get('#description').type('This is a test task description');
      cy.get('button[type="submit"]').click();
      
      // Click on the created task in kanban view
      cy.contains('Test Task for Detail View').click();
      
      // Verify task details are displayed
      cy.get('h1').should('contain', 'Test Task for Detail View');
      cy.contains('This is a test task description').should('be.visible');
      cy.contains('Not Started').should('be.visible');
    });
  });

  describe('Status Change Functionality', () => {
    it('should allow changing task status', () => {
      // Navigate to a task
      cy.visit('/projects');
      cy.get('a[href^="/projects/"] .cursor-pointer').first().click();
      cy.contains('Tasks').click();
      
      // Click on a task - tasks are rendered as clickable cards
      cy.get('.cursor-pointer').contains('Task').parent().click();
      
      // Test status changes
      cy.contains('Start Task').click();
      cy.contains('Status updated successfully').should('be.visible');
      
      // Verify status changed
      cy.contains('In Progress').should('be.visible');
      
      // Submit for review
      cy.contains('Submit for Review').click();
      cy.contains('Needs Review').should('be.visible');
      
      // Mark as done
      cy.contains('Mark Done').click();
      cy.contains('Done').should('be.visible');
    });
  });

  describe('Edit Task Functionality', () => {
    it('should allow editing task details', () => {
      // Navigate to a task
      cy.visit('/projects');
      cy.get('a[href^="/projects/"] .cursor-pointer').first().click();
      cy.contains('Tasks').click();
      cy.get('[data-testid="task-card"]').first().click();
      
      // Click edit button
      cy.contains('Edit Task').click();
      cy.url().should('include', '/edit');
      
      // Update task details
      cy.get('#title').clear().type('Updated Task Title');
      cy.get('#description').clear().type('Updated task description');
      
      // Change status in edit form
      cy.get('#status').select('in_progress');
      
      // Submit changes
      cy.get('button[type="submit"]').click();
      
      // Verify changes
      cy.get('h1').should('contain', 'Updated Task Title');
      cy.contains('Updated task description').should('be.visible');
      cy.contains('In Progress').should('be.visible');
    });
  });

  describe('Delete Task Functionality', () => {
    it('should allow deleting a task', () => {
      // Create a task to delete
      cy.visit('/projects');
      cy.get('a[href^="/projects/"] .cursor-pointer').first().click();
      cy.contains('Tasks').click();
      cy.contains('Create Task').click();
      cy.get('#title').type('Task to Delete');
      cy.get('button[type="submit"]').click();
      
      // Click on the created task
      cy.contains('Task to Delete').click();
      
      // Delete the task
      cy.contains('Delete').click();
      
      // Confirm deletion in dialog
      cy.on('window:confirm', () => true);
      
      // Should redirect back to project tasks
      cy.url().should('include', '/tasks');
      cy.contains('Task to Delete').should('not.exist');
    });
  });

  describe('File Attachment Functionality', () => {
    it('should allow uploading files to a task', () => {
      // Navigate to a task
      cy.visit('/projects');
      cy.get('a[href^="/projects/"] .cursor-pointer').first().click();
      cy.contains('Tasks').click();
      cy.get('[data-testid="task-card"]').first().click();
      
      // Open file upload
      cy.get('[data-testid="add-files-button"]').click();
      
      // Upload a file
      const fileName = 'test-file.txt';
      cy.get('[data-testid="file-dropzone"]').within(() => {
        cy.get('input[type="file"]').selectFile({
          contents: Cypress.Buffer.from('Test file content'),
          fileName: fileName,
          mimeType: 'text/plain'
        }, { force: true });
      });
      
      // Verify file appears in upload queue
      cy.contains(fileName).should('be.visible');
      
      // Upload the file
      cy.contains('Upload Files').click();
      
      // Wait for upload to complete
      cy.get('[data-testid="upload-success"]').should('be.visible');
      cy.contains('All files uploaded successfully').should('be.visible');
      
      // File should appear in the file list
      cy.get('[data-testid="file-list"]').within(() => {
        cy.get('[data-testid="file-name"]').should('contain', fileName);
      });
    });

    it('should allow downloading files', () => {
      // Assuming a file is already uploaded from previous test
      cy.visit('/projects');
      cy.get('a[href^="/projects/"] .cursor-pointer').first().click();
      cy.contains('Tasks').click();
      cy.get('[data-testid="task-card"]').first().click();
      
      // Find and click download button
      cy.get('[data-testid="file-list"]').within(() => {
        cy.get('[data-testid="download-button"]').first().click();
      });
      
      // Verify download initiated (browser handles actual download)
    });

    it('should allow deleting files', () => {
      // Navigate to a task with files
      cy.visit('/projects');
      cy.get('a[href^="/projects/"] .cursor-pointer').first().click();
      cy.contains('Tasks').click();
      cy.get('[data-testid="task-card"]').first().click();
      
      // Delete a file
      cy.get('[data-testid="file-list"]').within(() => {
        cy.get('[data-testid="delete-button"]').first().click();
      });
      
      // Confirm deletion
      cy.on('window:confirm', () => true);
      
      // File should be removed from list
      cy.get('[data-testid="file-count"]').should('not.exist');
    });
  });

  describe('Role-based Permissions', () => {
    it('client users should have read-only access', () => {
      // Logout and login as client
      cy.visit('/api/auth/signout');
      cy.visit('/login');
      cy.get('#email').type('user@example.com');
      cy.get('#password').type('user123');
      cy.get('button[type="submit"]').click();
      
      // Navigate to a task
      cy.visit('/projects');
      cy.get('a[href^="/projects/"] .cursor-pointer').first().click();
      cy.contains('Tasks').click();
      cy.get('[data-testid="task-card"]').first().click();
      
      // Verify read-only mode
      cy.contains('Edit Task').should('not.exist');
      cy.contains('Delete').should('not.exist');
      cy.contains('Start Task').should('not.exist');
      cy.get('[data-testid="add-files-button"]').should('not.exist');
      
      // Task details should still be visible
      cy.get('h1').should('be.visible');
      cy.contains('Description').should('be.visible');
      cy.contains('Status').should('be.visible');
    });
  });
});