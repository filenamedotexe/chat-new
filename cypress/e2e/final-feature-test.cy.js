describe('Final Feature Test - All Fixes', () => {
  const adminUser = { email: 'admin@example.com', password: 'admin123' };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login(adminUser.email, adminUser.password);
  });

  afterEach(() => {
    // Clear any modals or overlays
    cy.get('body').then($body => {
      if ($body.find('.fixed.inset-0').length > 0) {
        cy.get('body').type('{esc}');
      }
    });
    
    // Clear cookies and storage after each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Task Clickability in Kanban', () => {
    it('should navigate to task details when clicking on a task', () => {
      // Navigate to first project with tasks
      cy.visit('/projects');
      
      // Click on first project
      cy.get('a[href^="/projects/"]').first().click();
      cy.url().should('match', /\/projects\/[\w-]+$/);
      
      // Navigate to tasks
      cy.contains('button', 'View Tasks').click();
      cy.url().should('include', '/tasks');
      
      // Wait for kanban board to load
      cy.get('.grid').should('exist');
      
      // Look for any task cards
      cy.get('[data-testid="task-card"]').then($cards => {
        if ($cards.length > 0) {
          // Click on the first task
          cy.get('[data-testid="task-card"]').first().click();
          
          // Should navigate to task detail page
          cy.url().should('match', /\/tasks\/[\w-]+$/);
          cy.get('h1').should('exist');
          
          // Should show task details
          cy.get('body').should('contain.text', 'Status');
          cy.get('body').should('contain.text', 'Created');
        } else {
          // Create a task if none exist
          cy.get('.grid > div').first().find('button').last().click();
          cy.get('input[name="title"]').type('Test Clickable Task');
          cy.get('textarea[name="description"]').type('This task should be clickable');
          cy.get('button[type="submit"]').click();
          cy.wait(2000);
          
          // Now click on the created task
          cy.get('[data-testid="task-card"]').contains('Test Clickable Task').click();
          cy.url().should('match', /\/tasks\/[\w-]+$/);
          cy.get('h1').should('contain', 'Test Clickable Task');
        }
      });
    });
  });

  describe('Edit Organization Button', () => {
    it('should navigate to edit organization page', () => {
      cy.visit('/organizations');
      
      // Click on first organization
      cy.get('a[href^="/organizations/"]').first().click();
      cy.url().should('match', /\/organizations\/[\w-]+$/);
      
      // Click edit button
      cy.contains('button', 'Edit Organization').click();
      cy.url().should('match', /\/organizations\/[\w-]+\/edit$/);
      cy.get('h1').should('contain', 'Edit Organization');
      
      // Form should be pre-filled
      cy.get('input[name="name"]').should('exist').and('not.be.empty');
    });
  });

  describe('Edit Project Button', () => {
    it('should navigate to edit project page', () => {
      cy.visit('/projects');
      
      // Click on first project
      cy.get('a[href^="/projects/"]').first().click();
      cy.url().should('match', /\/projects\/[\w-]+$/);
      
      // Click edit button
      cy.contains('button', 'Edit Project').click();
      cy.url().should('match', /\/projects\/[\w-]+\/edit$/);
      cy.get('h1').should('contain', 'Edit Project');
      
      // Form should be pre-filled
      cy.get('input[name="name"]').should('exist').and('not.be.empty');
    });
  });

  describe('View Files Button', () => {
    it('should navigate to project files page', () => {
      cy.visit('/projects');
      
      // Click on first project
      cy.get('a[href^="/projects/"]').first().click();
      cy.url().should('match', /\/projects\/[\w-]+$/);
      
      // Click view files button
      cy.contains('button', 'View Files').click();
      cy.url().should('match', /\/projects\/[\w-]+\/files$/);
      cy.get('h1').should('contain', 'Files');
      
      // Should show upload section for admin
      cy.contains('Upload Files').should('exist');
      cy.get('input[type="file"]').should('exist');
    });

    it('should upload a file', () => {
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('button', 'View Files').click();
      
      // Upload a test file
      const fileName = 'cypress-test.txt';
      const fileContent = 'This is a test file uploaded by Cypress';
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(fileContent),
        fileName: fileName,
        mimeType: 'text/plain',
        lastModified: Date.now(),
      }, { force: true });
      
      // Wait for upload to complete
      cy.wait(2000);
      
      // File should appear in the list
      cy.contains(fileName).should('exist');
    });
  });

  describe('Task Creation Without Errors', () => {
    it('should save tasks with minimal data', () => {
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('button', 'View Tasks').click();
      
      // Create task with only title
      cy.get('.grid > div').first().find('button').last().click();
      cy.get('input[name="title"]').type('Minimal Task ' + Date.now());
      cy.get('button[type="submit"]').click();
      
      // Should not show any error
      cy.get('.bg-destructive').should('not.exist');
      
      // Task should appear
      cy.contains('Minimal Task').should('exist');
    });

    it('should save tasks with all fields', () => {
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('button', 'View Tasks').click();
      
      // Create task with all fields
      cy.get('.grid > div').first().find('button').last().click();
      cy.get('input[name="title"]').type('Complete Task ' + Date.now());
      cy.get('textarea[name="description"]').type('This task has all fields filled');
      cy.get('input[name="dueDate"]').type('2024-12-31');
      
      // Select assignee if available
      cy.get('select[name="assignedToId"]').then($select => {
        if ($select.find('option').length > 1) {
          cy.get('select[name="assignedToId"]').select(1);
        }
      });
      
      cy.get('button[type="submit"]').click();
      
      // Should not show any error
      cy.get('.bg-destructive').should('not.exist');
      
      // Task should appear
      cy.contains('Complete Task').should('exist');
    });
  });

  describe('Quick Status Changes', () => {
    it('should change task status using quick buttons', () => {
      cy.visit('/projects');
      cy.get('a[href^="/projects/"]').first().click();
      cy.contains('button', 'View Tasks').click();
      
      // Find a task in Not Started column
      cy.get('.grid > div').first().then($column => {
        if ($column.find('[data-testid="task-card"]').length > 0) {
          // Click Start Task button
          cy.get('.grid > div').first()
            .find('[data-testid="task-card"]').first()
            .contains('button', 'Start Task').click();
          
          // Task should move to In Progress column
          cy.get('.grid > div').eq(1)
            .find('[data-testid="task-card"]').should('have.length.greaterThan', 0);
        }
      });
    });
  });

  describe('Navigation Summary', () => {
    it('should verify all navigation paths work', () => {
      // Dashboard
      cy.visit('/dashboard');
      cy.get('h1').should('contain', 'Welcome back');
      
      // Projects
      cy.visit('/projects');
      cy.get('h1').should('contain', 'Projects');
      
      // Organizations
      cy.visit('/organizations');
      cy.get('h1').should('contain', 'Organizations');
      
      // Admin
      cy.visit('/admin');
      cy.get('h1').should('contain', 'Admin');
      
      // Create pages
      cy.visit('/organizations/new');
      cy.get('h1').should('contain', 'Create New Organization');
      
      cy.visit('/projects/new');
      cy.get('h1').should('contain', 'Create New Project');
    });
  });
});