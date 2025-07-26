describe('Breadcrumbs Navigation', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should not show breadcrumbs on dashboard', () => {
    // Dashboard should not have breadcrumbs
    cy.get('nav[aria-label="Breadcrumb"]').should('not.exist');
  });

  it('should show breadcrumbs on project listing', () => {
    cy.visit('/projects');
    
    // Check breadcrumb structure
    cy.get('nav[aria-label="Breadcrumb"]').should('be.visible');
    
    // Check home icon - use first() to target desktop breadcrumbs
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.get('svg').first().should('exist'); // Home icon
      cy.contains('Projects').should('be.visible');
    });
    
    // Take screenshot
    cy.screenshot('breadcrumbs-projects');
  });

  it('should show nested breadcrumbs on project detail', () => {
    // Navigate to projects first
    cy.visit('/projects');
    
    // Click on first project
    cy.get('[data-testid="project-card"]').first().click();
    
    // Check breadcrumbs
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.get('a').should('have.length.at.least', 1);
      cy.contains('Projects').should('be.visible');
      // Should have a non-linked current page
      cy.get('span.font-medium').should('exist');
    });
    
    // Click Projects breadcrumb to navigate back
    cy.get('nav[aria-label="Breadcrumb"]').first().contains('Projects').click();
    cy.url().should('include', '/projects');
  });

  it('should show breadcrumbs on deeply nested pages', () => {
    cy.visit('/projects/new');
    
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.contains('Projects').should('be.visible');
      cy.contains('New').should('be.visible');
    });
    
    // Navigate to settings
    cy.visit('/settings');
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.contains('Settings').should('be.visible');
    });
    
    // Navigate to organizations
    cy.visit('/organizations');
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.contains('Organizations').should('be.visible');
    });
    
    // Take screenshot
    cy.screenshot('breadcrumbs-various-pages');
  });

  it('should work on mobile with truncated breadcrumbs', () => {
    cy.viewport(375, 812);
    
    // Navigate to a nested page
    cy.visit('/projects');
    cy.get('[data-testid="project-card"]').first().click();
    
    // Mobile breadcrumbs should be visible but more compact
    cy.get('nav[aria-label="Breadcrumb"]').should('be.visible');
    
    // Check that text is truncated (has max-width) - mobile breadcrumbs
    cy.get('nav[aria-label="Breadcrumb"]').last().within(() => {
      cy.get('.truncate').should('exist');
    });
    
    // Take mobile screenshot
    cy.screenshot('breadcrumbs-mobile');
  });

  it('should have proper hover states', () => {
    cy.visit('/projects/new');
    
    // Check hover state on breadcrumb links
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.contains('Projects')
        .should('have.class', 'hover:text-foreground')
        .trigger('mouseover');
    });
  });

  it('should handle special routes correctly', () => {
    // Test admin routes
    cy.visit('/admin');
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.contains('Admin').should('be.visible');
    });
    
    // Test admin activity
    cy.visit('/admin/activity');
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.contains('Admin').should('be.visible');
      cy.contains('Activity').should('be.visible');
    });
    
    // Test tasks
    cy.visit('/tasks');
    cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
      cy.contains('Tasks').should('be.visible');
    });
  });
});