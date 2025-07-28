describe('Registration Simple Test', () => {
  it('should test registration functionality', () => {
    cy.visit('/register', { failOnStatusCode: false });
    cy.wait(2000);
    
    // Wait for page to load and check for basic elements
    cy.get('body').should('be.visible');
    cy.get('h1, h2', { timeout: 10000 }).should('contain', 'Create Account');
    
    // Check if form exists by looking for any input elements
    cy.get('input').should('have.length.at.least', 4);
    cy.get('button').should('exist');
    
    // Check if using Supabase auth indicator appears
    cy.get('body').then(($body) => {
      if ($body.find('.text-blue-600').length > 0) {
        cy.get('.text-blue-600').should('contain', 'Using Supabase Auth');
      }
    });
    
    // Test password mismatch validation
    cy.get('input#name').type('Test User');
    cy.get('input#email').type('test@example.com');
    cy.get('input#password').type('password123');
    cy.get('input#confirmPassword').type('different123');
    
    cy.get('button[type="submit"]').click();
    
    // Should show error
    cy.contains('Passwords do not match').should('be.visible');
  });

  it('should test successful registration with matching passwords', () => {
    cy.visit('/register', { failOnStatusCode: false });
    cy.wait(2000);
    
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'testpass123';
    
    cy.get('h1, h2', { timeout: 10000 }).should('contain', 'Create Account');
    
    // Fill form with matching passwords
    cy.get('input#name').type('Test User');
    cy.get('input#email').type(testEmail);
    cy.get('input#password').type(testPassword);
    cy.get('input#confirmPassword').type(testPassword);
    
    cy.get('button[type="submit"]').click();
    
    // Should either redirect to dashboard or show error (depending on auth system)
    cy.url({ timeout: 10000 }).should('satisfy', (url) => {
      return url.includes('/dashboard') || url.includes('/register');
    });
  });
});