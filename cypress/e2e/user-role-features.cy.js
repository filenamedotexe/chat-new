describe('User Role Features', () => {
  beforeEach(() => {
    // Login as a client user
    cy.visit('/login');
    cy.get('input[type="email"]').type('user@example.com');
    cy.get('input[type="password"]').type('user123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  describe('Dashboard', () => {
    it('should show My Files card on dashboard', () => {
      cy.get('[data-testid="my-files-card"]').should('be.visible');
      cy.get('[data-testid="my-files-card"]').within(() => {
        cy.contains('My Files').should('be.visible');
        cy.contains('View All Files').should('be.visible');
      });
    });

    it('should navigate to user files when clicking View All Files', () => {
      cy.get('[data-testid="my-files-card"]').within(() => {
        cy.contains('View All Files').click();
      });
      cy.url().should('match', /\/users\/[a-f0-9-]+\/files/);
    });
  });

  describe('Navigation', () => {
    it('should show correct navigation items for client user', () => {
      // Should show these items
      cy.contains('nav', 'Dashboard').should('be.visible');
      cy.contains('nav', 'Projects').should('be.visible');
      
      // Should NOT show admin/team member items
      cy.contains('nav', 'Organizations').should('not.exist');
      cy.contains('nav', 'Admin').should('not.exist');
    });
  });

  describe('Settings Page', () => {
    it('should access settings page', () => {
      cy.visit('/settings');
      cy.contains('h1', 'Settings').should('be.visible');
      
      // Check profile information section
      cy.contains('Profile Information').should('be.visible');
      cy.contains('user@example.com').should('be.visible');
      cy.contains('client').should('be.visible');
    });

    it('should show all settings sections', () => {
      cy.visit('/settings');
      
      // Check all sections exist
      cy.contains('Profile Information').should('be.visible');
      cy.contains('Appearance').should('be.visible');
      cy.contains('Notifications').should('be.visible');
      cy.contains('Security').should('be.visible');
      cy.contains('Email Preferences').should('be.visible');
    });
  });

  describe('My Tasks Page', () => {
    it('should access My Tasks page', () => {
      cy.visit('/tasks');
      cy.contains('h1', 'My Tasks').should('be.visible');
      cy.contains('All tasks assigned to you across all projects').should('be.visible');
    });

    it('should show task filters', () => {
      cy.visit('/tasks');
      
      // Check filter buttons
      cy.contains('button', 'All').should('be.visible');
      cy.contains('button', 'Not Started').should('be.visible');
      cy.contains('button', 'In Progress').should('be.visible');
      cy.contains('button', 'Needs Review').should('be.visible');
      cy.contains('button', 'Done').should('be.visible');
    });
  });

  describe('Enhanced Projects Page', () => {
    it('should show enhanced project cards', () => {
      cy.visit('/projects');
      
      // Check if project cards exist
      cy.get('.grid').should('exist');
      
      // If there are projects, check for enhanced features
      cy.get('body').then($body => {
        if ($body.find('[class*="card"]').length > 0) {
          // Check for stats (Tasks, Progress, Files)
          cy.contains('Tasks').should('be.visible');
          cy.contains('Progress').should('be.visible');
          cy.contains('Files').should('be.visible');
          
          // Check for quick action buttons
          cy.get('button').contains('Tasks').should('exist');
          cy.get('button').contains('Files').should('exist');
          cy.get('button').contains('Chat').should('exist');
        }
      });
    });

    it('should not show Create Project button for client users', () => {
      cy.visit('/projects');
      cy.contains('button', 'Create Project').should('not.exist');
    });
  });

  describe('Project Navigation', () => {
    it('should navigate to project tasks when clicking Tasks button', () => {
      cy.visit('/projects');
      
      // Only test if there are projects
      cy.get('body').then($body => {
        if ($body.find('button:contains("Tasks")').length > 0) {
          cy.get('button').contains('Tasks').first().click();
          cy.url().should('match', /\/projects\/[a-f0-9-]+\/tasks/);
        }
      });
    });

    it('should navigate to project files when clicking Files button', () => {
      cy.visit('/projects');
      
      // Only test if there are projects
      cy.get('body').then($body => {
        if ($body.find('button:contains("Files")').length > 0) {
          cy.get('button').contains('Files').first().click();
          cy.url().should('match', /\/projects\/[a-f0-9-]+\/files/);
        }
      });
    });

    it('should navigate to project chat when clicking Chat button', () => {
      cy.visit('/projects');
      
      // Only test if there are projects
      cy.get('body').then($body => {
        if ($body.find('button:contains("Chat")').length > 0) {
          cy.get('button').contains('Chat').first().click();
          cy.url().should('match', /\/projects\/[a-f0-9-]+\/chat/);
        }
      });
    });
  });
});