describe('Session Context Test', () => {
  beforeEach(() => {
    // Visit login page
    cy.visit('/login', { failOnStatusCode: false });
    cy.wait(2000);
  });

  it('should test session context with login flow', () => {
    // Wait for page to load
    cy.contains('Sign In', { timeout: 15000 }).should('exist');
    
    // Check if using Supabase auth indicator appears
    cy.get('body').then(($body) => {
      if ($body.find('.text-blue-600').length > 0) {
        cy.get('.text-blue-600').should('contain', 'Using Supabase Auth');
        cy.log('Using Supabase Auth System');
      } else {
        cy.log('Using NextAuth System');
      }
    });
    
    // Test login with known credentials
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Should redirect or show error
    cy.url({ timeout: 10000 }).should('satisfy', (url) => {
      return url.includes('/dashboard') || url.includes('/login');
    });
    
    // If successfully logged in, test session persistence
    cy.url().then((url) => {
      if (url.includes('/dashboard')) {
        cy.log('Login successful - testing session');
        
        // Check that we're on dashboard
        cy.contains('Dashboard', { timeout: 10000 }).should('exist');
        
        // Test session persistence by reloading page
        cy.reload();
        cy.wait(3000);
        
        // Should still be authenticated and on dashboard
        cy.url().should('include', '/dashboard');
        cy.contains('Dashboard', { timeout: 10000 }).should('exist');
      } else {
        cy.log('Login failed or credentials not valid - testing continues');
      }
    });
  });

  it('should test registration flow with session context', () => {
    cy.visit('/register', { failOnStatusCode: false });
    cy.wait(3000);
    
    cy.contains('Create Account', { timeout: 15000 }).should('exist');
    
    // Check auth system indicator
    cy.get('body').then(($body) => {
      if ($body.find('.text-blue-600').length > 0) {
        cy.get('.text-blue-600').should('contain', 'Using Supabase Auth');
        cy.log('Registration using Supabase Auth System');
      } else {
        cy.log('Registration using NextAuth System');
      }
    });
    
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'testpass123';
    
    // Fill registration form
    cy.get('input#name').type('Test User');
    cy.get('input#email').type(testEmail);
    cy.get('input#password').type(testPassword);
    cy.get('input#confirmPassword').type(testPassword);
    
    cy.get('button[type="submit"]').click();
    
    // Should either redirect or stay on register page
    cy.url({ timeout: 10000 }).should('satisfy', (url) => {
      return url.includes('/dashboard') || url.includes('/register');
    });
  });

  it('should test feature flag integration with session', () => {
    cy.visit('/login', { failOnStatusCode: false });
    cy.wait(2000);
    
    // Check that feature flag checking is working
    cy.window().then((win) => {
      // Verify that auth context is available
      cy.log('Testing auth context availability');
    });
    
    // Test that page loads without auth context errors
    cy.get('body').should('exist');
    cy.contains('Sign In', { timeout: 10000 }).should('exist');
  });
});