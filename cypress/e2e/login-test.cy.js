describe('Login Test', () => {
  beforeEach(() => {
    cy.visit('/login', { failOnStatusCode: false });
    cy.wait(2000);
  });

  it('should load login page successfully', () => {
    cy.contains('Sign In', { timeout: 15000 }).should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should test Supabase auth when feature flag is enabled', () => {
    // Check if using Supabase auth indicator appears
    cy.get('body').then(($body) => {
      if ($body.find('.text-blue-600').length > 0) {
        cy.get('.text-blue-600').should('contain', 'Using Supabase Auth');
        
        // Test Supabase login
        cy.get('input[type="email"]').type('admin@example.com');
        cy.get('input[type="password"]').type('admin123');
        cy.get('button[type="submit"]').click();
        
        // Should redirect to dashboard or show error
        cy.url().should('not.contain', '/login', { timeout: 10000 });
      } else {
        // NextAuth fallback test
        cy.get('input[type="email"]').type('admin@example.com');
        cy.get('input[type="password"]').type('admin123');
        cy.get('button[type="submit"]').click();
        
        // Should redirect to dashboard or show error
        cy.url().should('not.contain', '/login', { timeout: 10000 });
      }
    });
  });
});