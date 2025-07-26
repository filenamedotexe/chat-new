describe('Comprehensive Breadcrumbs Testing', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should test breadcrumbs on every major route', () => {
    // Test Tasks page
    cy.visit('/tasks');
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.get('a[href="/dashboard"]').should('exist'); // Home link
      cy.contains('Tasks').should('be.visible');
    });
    cy.screenshot('breadcrumbs-tasks');

    // Test Tasks > New
    cy.visit('/tasks/new');
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.get('a[href="/dashboard"]').should('exist');
      cy.get('a').contains('Tasks').should('have.attr', 'href', '/tasks');
      cy.contains('New').should('be.visible');
    });
    cy.screenshot('breadcrumbs-tasks-new');

    // Test Projects
    cy.visit('/projects');
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.get('a[href="/dashboard"]').should('exist');
      cy.contains('Projects').should('be.visible');
    });

    // Test Projects > New
    cy.visit('/projects/new');
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.get('a[href="/dashboard"]').should('exist');
      cy.get('a').contains('Projects').should('have.attr', 'href', '/projects');
      cy.contains('New').should('be.visible');
    });
    cy.screenshot('breadcrumbs-projects-new');

    // Test Organizations
    cy.visit('/organizations');
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.get('a[href="/dashboard"]').should('exist');
      cy.contains('Organizations').should('be.visible');
    });

    // Test Organizations > New
    cy.visit('/organizations/new');
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.get('a[href="/dashboard"]').should('exist');
      cy.get('a').contains('Organizations').should('have.attr', 'href', '/organizations');
      cy.contains('New').should('be.visible');
    });

    // Test Settings
    cy.visit('/settings');
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.get('a[href="/dashboard"]').should('exist');
      cy.contains('Settings').should('be.visible');
    });

    // Test Admin
    cy.visit('/admin');
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.get('a[href="/dashboard"]').should('exist');
      cy.contains('Admin').should('be.visible');
    });

    // Test Admin > Activity
    cy.visit('/admin/activity');
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.get('a[href="/dashboard"]').should('exist');
      cy.get('a').contains('Admin').should('have.attr', 'href', '/admin');
      cy.contains('Activity').should('be.visible');
    });
    cy.screenshot('breadcrumbs-admin-activity');
  });

  it('should test breadcrumb click navigation', () => {
    // Start at a deep route
    cy.visit('/tasks/new');
    
    // Click Tasks breadcrumb
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.get('a').contains('Tasks').click();
    });
    cy.url().should('include', '/tasks');
    cy.url().should('not.include', '/new');

    // Go to projects/new and test
    cy.visit('/projects/new');
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.get('a').contains('Projects').click();
    });
    cy.url().should('equal', Cypress.config().baseUrl + '/projects');

    // Test home icon navigation
    cy.visit('/organizations/new');
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.get('a[href="/dashboard"]').click();
    });
    cy.url().should('include', '/dashboard');
  });

  it('should handle dynamic routes with IDs', () => {
    // First get a project ID
    cy.visit('/projects');
    cy.get('[data-testid="project-card"]').first().then($card => {
      const href = $card.find('a').attr('href');
      cy.visit(href);
      
      // Check breadcrumbs on project detail page
      cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
        cy.get('a[href="/dashboard"]').should('exist');
        cy.get('a').contains('Projects').should('have.attr', 'href', '/projects');
        // Should show project name or "Details" instead of ID
        cy.get('span.font-medium').should('exist');
      });
      cy.screenshot('breadcrumbs-project-detail');

      // Navigate to project tasks
      cy.visit(href + '/tasks');
      cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
        cy.get('a[href="/dashboard"]').should('exist');
        cy.get('a').contains('Projects').should('have.attr', 'href', '/projects');
        cy.contains('Tasks').should('be.visible');
      });
      cy.screenshot('breadcrumbs-project-tasks');

      // Navigate to project edit
      cy.visit(href + '/edit');
      cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
        cy.get('a[href="/dashboard"]').should('exist');
        cy.get('a').contains('Projects').should('have.attr', 'href', '/projects');
        cy.contains('Edit').should('be.visible');
      });
    });
  });

  it('should verify all breadcrumb links are clickable and styled', () => {
    cy.visit('/admin/activity');
    
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      // Check home icon
      cy.get('a[href="/dashboard"]')
        .should('have.class', 'hover:text-foreground')
        .and('have.css', 'cursor', 'pointer');
      
      // Check Admin link
      cy.get('a').contains('Admin')
        .should('have.class', 'hover:text-foreground')
        .and('have.css', 'cursor', 'pointer');
      
      // Check current page (not a link)
      cy.contains('Activity')
        .should('have.class', 'font-medium')
        .and('have.class', 'text-foreground');
    });
  });
});