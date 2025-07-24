describe('Test SQL Fix and Organization Files', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should load task management page without SQL errors', () => {
    // Navigate to projects
    cy.visit('/projects');
    
    // Click on the first project
    cy.get('a[href^="/projects/"]').first().click();
    
    // Click on Manage Tasks button
    cy.contains('a', 'Manage Tasks').click();
    
    // Should load without errors
    cy.url().should('include', '/tasks');
    cy.get('h1').should('exist');
    
    // Should not show any error messages
    cy.get('.error').should('not.exist');
    cy.get('body').should('not.contain', 'column reference "id" is ambiguous');
  });

  it('should show files in organization detail page', () => {
    // Navigate to organizations
    cy.visit('/organizations');
    
    // Click on the first organization
    cy.get('a[href^="/organizations/"]').first().click();
    
    // Should show files card
    cy.get('h3').contains('Files').should('exist');
    
    // Should show file count
    cy.get('p').contains('files across all projects').should('exist');
  });
});