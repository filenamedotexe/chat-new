describe('Breadcrumbs Click Navigation Test', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should verify breadcrumbs are clickable and navigate correctly', () => {
    // Go to a deeply nested page
    cy.visit('/admin/activity');
    
    // Verify we're on the activity page
    cy.contains('h1', 'Activity Timeline').should('be.visible');
    
    // Click Admin breadcrumb
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.get('a').contains('Admin').click();
    });
    
    // Should navigate to admin page
    cy.url().should('equal', Cypress.config().baseUrl + '/admin');
    cy.contains('Admin Dashboard').should('be.visible');
    
    // Go back to test home icon
    cy.visit('/tasks/new');
    
    // Click home icon
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.get('a[href="/dashboard"]').first().click();
    });
    
    // Should be on dashboard
    cy.url().should('include', '/dashboard');
    
    // Test navigation from projects/new
    cy.visit('/projects/new');
    cy.contains('Create New Project').should('be.visible');
    
    // Click Projects breadcrumb
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.get('a').contains('Projects').click();
    });
    
    // Should be on projects listing
    cy.url().should('equal', Cypress.config().baseUrl + '/projects');
    cy.contains('h1', 'Projects').should('be.visible');
    
    // Test organizations navigation
    cy.visit('/organizations/new');
    
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.get('a').contains('Organizations').click();
    });
    
    cy.url().should('equal', Cypress.config().baseUrl + '/organizations');
  });

  it('should show correct breadcrumbs on all pages', () => {
    const pagesToTest = [
      { url: '/tasks', breadcrumbs: ['Tasks'] },
      { url: '/tasks/new', breadcrumbs: ['Tasks', 'New'] },
      { url: '/projects', breadcrumbs: ['Projects'] },
      { url: '/projects/new', breadcrumbs: ['Projects', 'New'] },
      { url: '/organizations', breadcrumbs: ['Organizations'] },
      { url: '/organizations/new', breadcrumbs: ['Organizations', 'New'] },
      { url: '/settings', breadcrumbs: ['Settings'] },
      { url: '/admin', breadcrumbs: ['Admin'] },
      { url: '/admin/activity', breadcrumbs: ['Admin', 'Activity'] }
    ];

    pagesToTest.forEach(page => {
      cy.visit(page.url);
      
      cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
        // Check home icon exists
        cy.get('a[href="/dashboard"]').should('exist');
        
        // Check each breadcrumb segment
        page.breadcrumbs.forEach((crumb, index) => {
          cy.contains(crumb).should('be.visible');
          
          // All but the last should be links
          if (index < page.breadcrumbs.length - 1) {
            cy.contains(crumb).should('match', 'a');
          } else {
            // Last item should not be a link
            cy.contains(crumb).should('not.match', 'a');
            cy.contains(crumb).should('have.class', 'font-medium');
          }
        });
      });
    });
  });
});