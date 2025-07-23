describe('Complete Navigation Test - All Routes', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  describe('Admin Navigation Flow', () => {
    beforeEach(() => {
      cy.login('admin@example.com', 'admin123');
    });

    it('should navigate through all admin-accessible pages', () => {
      // Dashboard
      cy.visit('/dashboard');
      cy.url().should('include', '/dashboard');
      cy.contains('Dashboard').should('be.visible');
      cy.screenshot('nav-1-admin-dashboard');

      // Organizations List
      cy.contains('Organizations').click();
      cy.url().should('include', '/organizations');
      cy.contains('h1', 'Organizations').should('be.visible');
      cy.screenshot('nav-2-organizations-list');

      // Organization Detail
      cy.get('a[href*="/organizations/"]').first().click();
      cy.url().should('match', /\/organizations\/[\w-]+$/);
      cy.contains('Organization').should('be.visible');
      cy.screenshot('nav-3-organization-detail');

      // Back to Organizations
      cy.contains('Back to Organizations').click();
      cy.url().should('include', '/organizations');

      // Create Organization
      cy.contains('button', 'Create Organization').click();
      cy.url().should('include', '/organizations/new');
      cy.get('input[name="name"]').should('be.visible');
      cy.screenshot('nav-4-organization-new');

      // Cancel and go to Projects
      cy.visit('/projects');
      cy.url().should('include', '/projects');
      cy.contains('h1', 'Projects').should('be.visible');
      cy.screenshot('nav-5-projects-list');

      // Project Detail
      cy.get('article').first().click();
      cy.url().should('match', /\/projects\/[\w-]+$/);
      cy.contains('View Tasks').should('be.visible');
      cy.screenshot('nav-6-project-detail');

      // Navigate to Tasks
      cy.contains('View Tasks').click();
      cy.url().should('match', /\/projects\/[\w-]+\/tasks$/);
      cy.contains('Tasks Board').should('be.visible');
      cy.contains('Not Started').should('be.visible');
      cy.contains('In Progress').should('be.visible');
      cy.contains('Needs Review').should('be.visible');
      cy.contains('Done').should('be.visible');
      cy.screenshot('nav-7-tasks-board');

      // Back to Project
      cy.contains('Back to Projects').click();
      cy.url().should('include', '/projects');

      // Create Project
      cy.contains('button', 'Create Project').click();
      cy.url().should('include', '/projects/new');
      cy.get('input[name="name"]').should('be.visible');
      cy.screenshot('nav-8-project-new');

      // Test navigation menu
      cy.visit('/dashboard');
      cy.get('nav').within(() => {
        cy.contains('Dashboard').should('be.visible');
        cy.contains('Projects').should('be.visible');
        cy.contains('Organizations').should('be.visible');
      });
    });

    it('should handle navigation errors gracefully', () => {
      // Non-existent project
      cy.visit('/projects/non-existent-id');
      cy.contains('Project not found').should('be.visible');
      cy.contains('Back to Projects').click();
      cy.url().should('include', '/projects');

      // Non-existent organization
      cy.visit('/organizations/non-existent-id');
      cy.contains('Organization not found').should('be.visible');
      cy.contains('Back to Organizations').click();
      cy.url().should('include', '/organizations');

      // Non-existent task page
      cy.visit('/projects/non-existent-id/tasks');
      cy.contains('Project not found').should('be.visible');
    });
  });

  describe('Client Navigation Flow', () => {
    beforeEach(() => {
      cy.login('user@example.com', 'user123');
    });

    it('should navigate through client-accessible pages only', () => {
      // Dashboard
      cy.visit('/dashboard');
      cy.url().should('include', '/dashboard');
      cy.contains('Dashboard').should('be.visible');
      cy.screenshot('nav-9-client-dashboard');

      // Projects List
      cy.contains('Projects').click();
      cy.url().should('include', '/projects');
      cy.contains('h1', 'Projects').should('be.visible');
      
      // No Create Project button
      cy.contains('button', 'Create Project').should('not.exist');
      cy.screenshot('nav-10-client-projects');

      // Project Detail (if any exist)
      cy.get('body').then($body => {
        if ($body.find('article').length > 0) {
          cy.get('article').first().click();
          cy.url().should('match', /\/projects\/[\w-]+$/);
          
          // No Edit button
          cy.contains('button', 'Edit Project').should('not.exist');
          
          // Can view tasks
          cy.contains('View Tasks').click();
          cy.url().should('match', /\/projects\/[\w-]+\/tasks$/);
          
          // No create task buttons
          cy.get('button svg.h-4.w-4').should('not.exist');
          cy.screenshot('nav-11-client-tasks');
        }
      });

      // No Organizations in nav
      cy.get('nav').within(() => {
        cy.contains('Organizations').should('not.exist');
      });

      // Direct organization access should redirect
      cy.visit('/organizations');
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Authentication Redirects', () => {
    it('should redirect to login when not authenticated', () => {
      cy.clearCookies();
      
      const protectedRoutes = [
        '/dashboard',
        '/projects',
        '/projects/new',
        '/organizations',
        '/organizations/new',
        '/settings'
      ];

      protectedRoutes.forEach(route => {
        cy.visit(route);
        cy.url().should('include', '/login');
      });
    });

    it('should redirect to dashboard after login', () => {
      cy.clearCookies();
      cy.visit('/login');
      cy.get('input[type="email"]').type('admin@example.com');
      cy.get('input[type="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Breadcrumb Navigation', () => {
    beforeEach(() => {
      cy.login('admin@example.com', 'admin123');
    });

    it('should provide proper back navigation', () => {
      // Projects -> Project Detail -> Tasks -> Back flow
      cy.visit('/projects');
      cy.get('article').first().click();
      
      // On project detail
      cy.contains('Back to Projects').should('be.visible');
      
      // Go to tasks
      cy.contains('View Tasks').click();
      
      // On tasks page
      cy.contains('Back to Projects').should('be.visible');
      cy.contains('Back to Projects').click();
      cy.url().should('include', '/projects');
    });
  });

  describe('Complete User Journey', () => {
    it('should complete a full user journey', () => {
      // Login as admin
      cy.visit('/login');
      cy.get('input[type="email"]').type('admin@example.com');
      cy.get('input[type="password"]').type('admin123');
      cy.get('button[type="submit"]').click();

      // Create organization
      cy.visit('/organizations');
      cy.contains('button', 'Create Organization').click();
      cy.get('input[name="name"]').type('Test Navigation Org');
      cy.get('input[name="slug"]').should('have.value', 'test-navigation-org');
      cy.get('textarea[name="description"]').type('Testing navigation');
      cy.get('select[name="type"]').select('client');
      cy.get('button[type="submit"]').click();
      cy.wait(1000);

      // View the organization
      cy.visit('/organizations');
      cy.contains('Test Navigation Org').click();
      cy.contains('h1', 'Test Navigation Org').should('be.visible');
      cy.contains('No projects yet').should('be.visible');

      // Create project from org page
      cy.contains('Create Project').click();
      cy.get('input[name="name"]').type('Navigation Test Project');
      cy.get('select[name="organizationId"]').select('Test Navigation Org');
      cy.get('textarea[name="description"]').type('Testing project navigation');
      cy.get('button[type="submit"]').click();
      cy.wait(1000);

      // Navigate to project
      cy.visit('/projects');
      cy.contains('Navigation Test Project').click();
      cy.contains('h1', 'Navigation Test Project').should('be.visible');
      cy.contains('Test Navigation Org').should('be.visible');

      // Navigate to tasks
      cy.contains('Manage Tasks').click();
      cy.contains('Tasks Board').should('be.visible');

      // Create a task
      cy.contains('h3', 'Not Started').parent().find('button').first().click();
      cy.get('input[name="title"]').type('Complete Navigation Test');
      cy.contains('button', 'Create Task').click();
      cy.wait(1000);

      // Verify task appears
      cy.contains('Complete Navigation Test').should('be.visible');

      // Logout
      cy.get('button[aria-label*="menu"]').first().click({ force: true });
      cy.contains('Sign out').click();
      cy.url().should('include', '/login');

      cy.screenshot('nav-12-complete-journey');
    });
  });
});