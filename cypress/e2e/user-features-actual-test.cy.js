describe('User Features - Actual UI Test', () => {
  // Test with admin user first to ensure features work
  describe('Admin User Features', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('admin@example.com');
      cy.get('input[type="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should access settings page and see all sections', () => {
      cy.visit('/settings');
      
      // Page should load
      cy.contains('h1', 'Settings').should('be.visible');
      
      // Check all sections
      cy.contains('Profile Information').should('be.visible');
      cy.contains('admin@example.com').should('be.visible');
      cy.contains('admin').should('be.visible');
      
      cy.contains('Appearance').should('be.visible');
      cy.contains('Notifications').should('be.visible');
      cy.contains('Security').should('be.visible');
      cy.contains('Email Preferences').should('be.visible');
    });

    it('should access My Tasks page', () => {
      cy.visit('/tasks');
      
      // Page should load
      cy.contains('h1', 'My Tasks').should('be.visible');
      cy.contains('All tasks assigned to you across all projects').should('be.visible');
      
      // Check filters exist
      cy.contains('button', 'All').should('be.visible');
      cy.contains('button', 'Not Started').should('be.visible');
      cy.contains('button', 'In Progress').should('be.visible');
      cy.contains('button', 'Needs Review').should('be.visible');
      cy.contains('button', 'Done').should('be.visible');
    });

    it('should see enhanced project cards on projects page', () => {
      cy.visit('/projects');
      
      // Wait for page to load
      cy.contains('h1', 'Projects').should('be.visible');
      cy.contains('Manage and track all your projects in one place').should('be.visible');
      
      // Admin should see Create Project button
      cy.contains('button', 'Create Project').should('be.visible');
      
      // Check if any project cards exist
      cy.get('body').then($body => {
        // Log what we find
        cy.log('Checking for project cards...');
        
        if ($body.text().includes('No projects yet')) {
          cy.log('No projects found - this is OK for a fresh database');
          cy.contains('No projects yet').should('be.visible');
        } else {
          cy.log('Projects found - checking for enhanced features');
          // If projects exist, check for enhanced features
          cy.get('.grid').within(() => {
            // Check for stats labels
            cy.contains('Tasks').should('be.visible');
            cy.contains('Progress').should('be.visible');
            cy.contains('Files').should('be.visible');
            
            // Check for quick action buttons
            cy.get('button').contains('Tasks').should('be.visible');
            cy.get('button').contains('Files').should('be.visible');
            cy.get('button').contains('Chat').should('be.visible');
          });
        }
      });
    });
  });

  // Test with client user to verify permissions
  describe('Client User Features', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('user@example.com');
      cy.get('input[type="password"]').type('user123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should see My Files card on dashboard', () => {
      cy.get('[data-testid="my-files-card"]').should('be.visible');
      cy.get('[data-testid="my-files-card"]').within(() => {
        cy.contains('My Files').should('be.visible');
        cy.contains('View and manage your uploaded files').should('be.visible');
        cy.contains('Access all your files across projects').should('be.visible');
        cy.contains('button', 'View All Files').should('be.visible');
      });
    });

    it('should navigate to user files page', () => {
      cy.get('[data-testid="my-files-card"]').within(() => {
        cy.contains('button', 'View All Files').click();
      });
      
      // Should navigate to user files page
      cy.url().should('match', /\/users\/[a-f0-9-]+\/files/);
      cy.contains('My Files').should('be.visible');
    });

    it('should access settings as client user', () => {
      cy.visit('/settings');
      
      // Page should load
      cy.contains('h1', 'Settings').should('be.visible');
      
      // Check user info shows client role
      cy.contains('Profile Information').should('be.visible');
      cy.contains('user@example.com').should('be.visible');
      cy.contains('client').should('be.visible');
    });

    it('should NOT see Create Project button as client', () => {
      cy.visit('/projects');
      
      // Client should NOT see Create Project button
      cy.contains('button', 'Create Project').should('not.exist');
    });

    it('should see correct navigation items', () => {
      // Check top navigation
      cy.get('nav').within(() => {
        cy.contains('Dashboard').should('be.visible');
        cy.contains('Projects').should('be.visible');
        
        // Should NOT see admin/team items
        cy.contains('Organizations').should('not.exist');
        cy.contains('Admin').should('not.exist');
      });
    });
  });

  // Test actual functionality
  describe('Feature Functionality', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('admin@example.com');
      cy.get('input[type="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should filter tasks on My Tasks page', () => {
      cy.visit('/tasks');
      
      // Test filter buttons
      cy.contains('button', 'In Progress').click();
      cy.contains('button', 'In Progress').should('have.class', 'bg-blue-600');
      
      cy.contains('button', 'Done').click();
      cy.contains('button', 'Done').should('have.class', 'bg-green-600');
      
      cy.contains('button', 'All').click();
      cy.contains('button', 'All').should('have.class', 'bg-primary');
    });

    it('should navigate using quick actions if projects exist', () => {
      cy.visit('/projects');
      
      cy.get('body').then($body => {
        // Only test if projects exist
        if (!$body.text().includes('No projects yet')) {
          // Test Tasks quick action
          cy.get('button').contains('Tasks').first().click();
          cy.url().should('match', /\/projects\/[a-f0-9-]+\/tasks/);
          cy.go('back');
          
          // Test Files quick action
          cy.get('button').contains('Files').first().click();
          cy.url().should('match', /\/projects\/[a-f0-9-]+\/files/);
          cy.go('back');
          
          // Test Chat quick action
          cy.get('button').contains('Chat').first().click();
          cy.url().should('match', /\/projects\/[a-f0-9-]+\/chat/);
        }
      });
    });
  });
});