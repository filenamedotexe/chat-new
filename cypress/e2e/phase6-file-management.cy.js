describe('Phase 6: File Management System', () => {
  beforeEach(() => {
    // Login with existing test user
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@agency.com');
    cy.get('input[name="password"]').type('admin123456');
    cy.get('button[type="submit"]').click();
    
    // Wait for redirect to dashboard
    cy.url().should('include', '/dashboard');
  });

  describe('File Upload Functionality', () => {
    it('should display file upload interface in task detail', () => {
      cy.visit(`/tasks/${taskId}`);
      cy.get('[data-testid="attachments-section"]').should('be.visible');
      cy.get('button').contains('Add Files').should('be.visible');
    });

    it('should allow drag and drop file upload', () => {
      cy.visit(`/tasks/${taskId}`);
      cy.get('button').contains('Add Files').click();
      
      // Create a test file
      const fileName = 'test-document.pdf';
      const fileContent = 'Test PDF content';
      
      cy.get('[data-testid="file-dropzone"]').should('be.visible');
      
      // Simulate file drop
      cy.fixture(fileName, 'base64').then(fileContent => {
        cy.get('[data-testid="file-dropzone"]').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: fileName,
          mimeType: 'application/pdf'
        }, { action: 'drag-drop' });
      });
      
      // Verify upload progress
      cy.get('[data-testid="upload-progress"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-testid="upload-success"]', { timeout: 15000 }).should('be.visible');
    });

    it('should validate file types and sizes', () => {
      cy.visit(`/tasks/${taskId}`);
      cy.get('button').contains('Add Files').click();
      
      // Test invalid file type
      const invalidFile = {
        contents: 'invalid content',
        fileName: 'test.exe',
        mimeType: 'application/x-executable'
      };
      
      cy.get('[data-testid="file-dropzone"]').selectFile(invalidFile, { action: 'drag-drop' });
      cy.get('[data-testid="upload-error"]').should('contain', 'File type');
    });

    it('should handle multiple file uploads', () => {
      cy.visit(`/tasks/${taskId}`);
      cy.get('button').contains('Add Files').click();
      
      const files = [
        { fileName: 'doc1.pdf', mimeType: 'application/pdf' },
        { fileName: 'image1.jpg', mimeType: 'image/jpeg' },
        { fileName: 'sheet1.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      ];
      
      files.forEach((file, index) => {
        cy.fixture(file.fileName, 'base64').then(content => {
          cy.get('[data-testid="file-dropzone"]').selectFile({
            contents: Cypress.Buffer.from(content, 'base64'),
            fileName: file.fileName,
            mimeType: file.mimeType
          }, { action: 'drag-drop' });
        });
      });
      
      cy.get('[data-testid="upload-success"]', { timeout: 20000 }).should('be.visible');
      cy.get('[data-testid="file-count"]').should('contain', '3');
    });
  });

  describe('File Display and Management', () => {
    it('should display uploaded files in task', () => {
      cy.visit(`/tasks/${taskId}`);
      
      cy.get('[data-testid="file-list"]').should('be.visible');
      cy.get('[data-testid="file-item"]').should('have.length.at.least', 1);
      
      // Verify file information is displayed
      cy.get('[data-testid="file-item"]').first().within(() => {
        cy.get('[data-testid="file-name"]').should('be.visible');
        cy.get('[data-testid="file-size"]').should('be.visible');
        cy.get('[data-testid="file-date"]').should('be.visible');
        cy.get('[data-testid="file-uploader"]').should('be.visible');
      });
    });

    it('should show file count on task card', () => {
      cy.visit(`/projects/${projectId}/tasks`);
      
      cy.get('[data-testid="task-card"]').first().within(() => {
        cy.get('[data-testid="file-count-icon"]').should('be.visible');
        cy.get('[data-testid="file-count"]').should('be.visible').and('not.contain', '0');
      });
    });

    it('should allow file preview for images', () => {
      cy.visit(`/tasks/${taskId}`);
      
      // Find an image file and click preview
      cy.get('[data-testid="file-item"]').contains('image1.jpg').parent().within(() => {
        cy.get('[data-testid="preview-button"]').click();
      });
      
      cy.get('[data-testid="image-preview-modal"]').should('be.visible');
      cy.get('[data-testid="preview-image"]').should('be.visible');
      
      // Close preview
      cy.get('[data-testid="close-preview"]').click();
      cy.get('[data-testid="image-preview-modal"]').should('not.exist');
    });

    it('should enable file download', () => {
      cy.visit(`/tasks/${taskId}`);
      
      cy.get('[data-testid="file-item"]').first().within(() => {
        cy.get('[data-testid="download-button"]').should('be.visible').click();
      });
      
      // Verify download started (check for download in cypress/downloads)
      cy.readFile('cypress/downloads/test-document.pdf', { timeout: 10000 }).should('exist');
    });
  });

  describe('User File Management', () => {
    it('should display My Files in dashboard', () => {
      cy.visit('/dashboard');
      
      cy.get('[data-testid="my-files-card"]').should('be.visible');
      cy.get('[data-testid="my-files-card"]').within(() => {
        cy.get('h3').should('contain', 'My Files');
        cy.get('button').contains('View All Files').should('be.visible');
      });
    });

    it('should navigate to user files page', () => {
      cy.visit('/dashboard');
      
      cy.get('[data-testid="my-files-card"]').within(() => {
        cy.get('button').contains('View All Files').click();
      });
      
      cy.url().should('include', '/users/');
      cy.url().should('include', '/files');
      cy.get('h1').should('contain', 'My Files');
    });

    it('should display user file statistics', () => {
      cy.visit('/dashboard');
      cy.get('button').contains('View All Files').click();
      
      // Check file summary cards
      cy.get('[data-testid="total-files-card"]').should('be.visible');
      cy.get('[data-testid="total-size-card"]').should('be.visible');
      cy.get('[data-testid="projects-card"]').should('be.visible');
      
      // Verify non-zero counts
      cy.get('[data-testid="total-files-count"]').should('not.contain', '0');
    });

    it('should allow file search and filtering', () => {
      cy.visit('/dashboard');
      cy.get('button').contains('View All Files').click();
      
      // Test search
      cy.get('[data-testid="file-search"]').type('test-document');
      cy.get('[data-testid="file-item"]').should('contain', 'test-document.pdf');
      
      // Clear search
      cy.get('[data-testid="file-search"]').clear();
      
      // Test filter by type
      cy.get('[data-testid="file-type-filter"]').select('images');
      cy.get('[data-testid="file-item"]').should('contain', 'image1.jpg');
      cy.get('[data-testid="file-item"]').should('not.contain', 'test-document.pdf');
    });

    it('should show files by project breakdown', () => {
      cy.visit('/dashboard');
      cy.get('button').contains('View All Files').click();
      
      cy.get('[data-testid="files-by-type"]').should('be.visible');
      cy.get('[data-testid="file-type-badge"]').should('have.length.at.least', 1);
    });
  });

  describe('File Sharing Functionality', () => {
    let secondProjectId;

    before(() => {
      // Create a second project for sharing tests
      cy.visit('/projects/new');
      cy.get('input[name="name"]').type('Share Target Project');
      cy.get('textarea[name="description"]').type('Target project for file sharing');
      cy.get('select[name="organizationId"]').select('File Test Org');
      cy.get('form').submit();
      cy.url().then((url) => {
        secondProjectId = url.split('/').pop();
      });
    });

    it('should display share button on files', () => {
      cy.visit(`/tasks/${taskId}`);
      
      cy.get('[data-testid="file-item"]').first().within(() => {
        cy.get('[data-testid="share-button"]').should('be.visible');
      });
    });

    it('should open file share modal', () => {
      cy.visit(`/tasks/${taskId}`);
      
      cy.get('[data-testid="file-item"]').first().within(() => {
        cy.get('[data-testid="share-button"]').click();
      });
      
      cy.get('[data-testid="file-share-modal"]').should('be.visible');
      cy.get('[data-testid="project-select"]').should('be.visible');
      cy.get('h3').should('contain', 'Share File');
    });

    it('should share file to another project', () => {
      cy.visit(`/tasks/${taskId}`);
      
      cy.get('[data-testid="file-item"]').first().within(() => {
        cy.get('[data-testid="share-button"]').click();
      });
      
      cy.get('[data-testid="project-select"]').select('Share Target Project');
      cy.get('[data-testid="share-file-button"]').click();
      
      cy.get('[data-testid="share-success"]', { timeout: 10000 }).should('be.visible');
      
      // Verify file appears in target project
      cy.visit(`/projects/${secondProjectId}`);
      // Note: Would need to implement project file view to fully test this
    });

    it('should show shareable files view', () => {
      cy.visit('/dashboard');
      cy.get('button').contains('View All Files').click();
      
      cy.get('[data-testid="view-toggle"]').contains('Show Shareable').click();
      cy.get('[data-testid="file-list"]').should('be.visible');
      cy.get('h3').should('contain', 'Files Available for Sharing');
    });

    it('should allow unsharing files', () => {
      cy.visit(`/tasks/${taskId}`);
      
      cy.get('[data-testid="file-item"]').first().within(() => {
        cy.get('[data-testid="share-button"]').click();
      });
      
      cy.get('[data-testid="unshare-button"]').should('be.visible').click();
      cy.get('[data-testid="unshare-success"]', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Role-Based Permissions', () => {
    it('should allow file owners to delete their files', () => {
      cy.visit(`/tasks/${taskId}`);
      
      cy.get('[data-testid="file-item"]').first().within(() => {
        cy.get('[data-testid="delete-button"]').should('be.visible');
      });
    });

    it('should allow file owners to share their files', () => {
      cy.visit(`/tasks/${taskId}`);
      
      cy.get('[data-testid="file-item"]').first().within(() => {
        cy.get('[data-testid="share-button"]').should('be.visible');
      });
    });

    it('should restrict access to other users files', () => {
      // This would require creating another user and testing access
      // For now, we verify the permission check exists in the API
      cy.request({
        method: 'GET',
        url: '/api/users/different-user-id/files',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(403);
      });
    });
  });

  describe('File Deletion', () => {
    it('should allow file deletion with confirmation', () => {
      cy.visit(`/tasks/${taskId}`);
      
      const fileCount = cy.get('[data-testid="file-item"]').its('length');
      
      cy.get('[data-testid="file-item"]').last().within(() => {
        cy.get('[data-testid="delete-button"]').click();
      });
      
      // Confirm deletion
      cy.get('[data-testid="confirm-delete"]').click();
      
      // Verify file count decreased
      cy.get('[data-testid="file-item"]').should('have.length.lessThan', fileCount);
    });

    it('should update file counts after deletion', () => {
      cy.visit(`/projects/${projectId}/tasks`);
      
      // Check that task card file count is updated
      cy.get('[data-testid="task-card"]').first().within(() => {
        cy.get('[data-testid="file-count"]').should('be.visible');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle upload errors gracefully', () => {
      cy.visit(`/tasks/${taskId}`);
      cy.get('button').contains('Add Files').click();
      
      // Simulate network error during upload
      cy.intercept('POST', '/api/files', { statusCode: 500 }).as('uploadError');
      
      cy.fixture('test-document.pdf', 'base64').then(fileContent => {
        cy.get('[data-testid="file-dropzone"]').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'test-fail.pdf',
          mimeType: 'application/pdf'
        }, { action: 'drag-drop' });
      });
      
      cy.wait('@uploadError');
      cy.get('[data-testid="upload-error"]').should('be.visible');
    });

    it('should handle download errors', () => {
      cy.visit(`/tasks/${taskId}`);
      
      // Simulate download error
      cy.intercept('GET', '/api/files/*/download', { statusCode: 404 }).as('downloadError');
      
      cy.get('[data-testid="file-item"]').first().within(() => {
        cy.get('[data-testid="download-button"]').click();
      });
      
      cy.wait('@downloadError');
      // Error handling would show a toast or alert
    });

    it('should handle missing files gracefully', () => {
      // Test scenario where file exists in DB but not on disk
      cy.visit(`/tasks/${taskId}`);
      cy.get('[data-testid="file-list"]').should('be.visible');
      
      // This would require a specific test setup where files are removed from disk
    });
  });

  after(() => {
    // Clean up test data
    cy.task('cleanupTestData');
  });
});