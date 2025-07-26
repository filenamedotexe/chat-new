describe('Navigation Improvements', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  it('should display navigation with proper grouping for admin', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Check desktop navigation items
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Projects').should('be.visible');
    cy.contains('Tasks').should('be.visible');
    cy.contains('Organizations').should('be.visible');
    cy.contains('Admin').should('be.visible');
    
    // Check active state on dashboard
    cy.get('nav').first().within(() => {
      cy.contains('Dashboard').should('have.class', 'text-foreground');
    });
    
    // Navigate to projects and check active state
    cy.contains('Projects').first().click();
    cy.url().should('include', '/projects');
    cy.get('nav').first().within(() => {
      cy.contains('Projects').should('have.class', 'text-foreground');
      cy.contains('Dashboard').should('have.class', 'text-muted-foreground');
    });
    
    // Take screenshot
    cy.screenshot('desktop-navigation-admin');
  });

  it('should display mobile navigation with section headers', () => {
    cy.viewport(375, 812);
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Open mobile menu
    cy.get('[data-mobile-menu-trigger]').click();
    
    // Check section headers (case-sensitive)
    cy.contains('Main').should('be.visible');
    cy.contains('Work').should('be.visible');
    cy.contains('Admin').should('be.visible');
    cy.contains('Account').should('be.visible');
    
    // Check navigation items under sections
    cy.contains('Work').parent().within(() => {
      cy.contains('Projects').should('be.visible');
      cy.contains('Tasks').should('be.visible');
      cy.contains('Organizations').should('be.visible');
    });
    
    // Take screenshot
    cy.screenshot('mobile-navigation-sections');
  });

  it('should show limited navigation for clients', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('user@example.com');
    cy.get('input[type="password"]').type('user123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Check desktop navigation - clients should not see Tasks, Organizations, or Admin
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Projects').should('be.visible');
    
    // Check that admin-only links are not present in navigation
    cy.get('nav').first().within(() => {
      cy.contains('Tasks').should('not.exist');
      cy.contains('Organizations').should('not.exist');
      cy.contains('Admin').should('not.exist');
    });
    
    // Take screenshot
    cy.screenshot('client-navigation');
  });

  it('should maintain active state across navigation', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Navigate through different sections
    cy.contains('Tasks').click();
    cy.url().should('include', '/tasks');
    cy.get('nav').first().within(() => {
      cy.contains('Tasks').should('have.class', 'text-foreground');
    });
    
    cy.contains('Organizations').click();
    cy.url().should('include', '/organizations');
    cy.get('nav').first().within(() => {
      cy.contains('Organizations').should('have.class', 'text-foreground');
    });
    
    cy.contains('Admin').first().click();
    cy.url().should('include', '/admin');
    cy.get('nav').first().within(() => {
      cy.contains('Admin').should('have.class', 'text-foreground');
    });
  });
});