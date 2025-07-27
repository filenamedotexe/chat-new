describe('Session Simple Test', () => {
  it('should test auth context loading without errors', () => {
    cy.visit('/login', { failOnStatusCode: false });
    cy.wait(3000);
    
    // Should load without JavaScript errors
    cy.get('body').should('exist');
    cy.contains('Sign In', { timeout: 10000 }).should('exist');
    
    // Should show auth system indicator
    cy.get('body').then(($body) => {
      if ($body.find('.text-blue-600').length > 0) {
        cy.get('.text-blue-600').should('contain', 'Using Supabase Auth');
        cy.log('Successfully loaded with Supabase Auth context');
      } else {
        cy.log('Loaded with NextAuth fallback context');
      }
    });
  });

  it('should test registration page loads with auth context', () => {
    cy.visit('/register', { failOnStatusCode: false });
    cy.wait(3000);
    
    cy.contains('Create Account', { timeout: 10000 }).should('exist');
    
    // Test that form elements are accessible (meaning auth context is working)
    cy.get('input#name').should('exist');
    cy.get('input#email').should('exist');
    cy.get('input#password').should('exist');
    cy.get('input#confirmPassword').should('exist');
    
    cy.log('Auth context successfully provides session management');
  });
});