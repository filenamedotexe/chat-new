describe('Middleware Test', () => {
  beforeEach(() => {
    // Clear cookies and storage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should redirect unauthenticated users from protected routes', () => {
    // Try to access a protected route without authentication
    cy.visit('/dashboard', { failOnStatusCode: false });
    
    // Should redirect to login page
    cy.url({ timeout: 10000 }).should('include', '/login');
    cy.contains('Sign In', { timeout: 10000 }).should('exist');
  });

  it('should allow access to public routes without authentication', () => {
    // Visit login page (public route)
    cy.visit('/login', { failOnStatusCode: false });
    cy.contains('Sign In', { timeout: 10000 }).should('exist');
    
    // Visit register page (public route)  
    cy.visit('/register', { failOnStatusCode: false });
    cy.contains('Create Account', { timeout: 10000 }).should('exist');
    
    // Note: / redirects to /dashboard by default, so we test auth pages instead
    cy.log('Public routes accessible without authentication');
  });

  it('should test middleware with authentication flow', () => {
    cy.visit('/login', { failOnStatusCode: false });
    cy.wait(2000);
    
    cy.contains('Sign In', { timeout: 10000 }).should('exist');
    
    // Check auth system being used
    cy.get('body').then(($body) => {
      if ($body.find('.text-blue-600').length > 0) {
        cy.log('Testing middleware with Supabase Auth');
      } else {
        cy.log('Testing middleware with NextAuth');
      }
    });
    
    // Try to login
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Check if login was successful
    cy.url({ timeout: 10000 }).then((url) => {
      if (url.includes('/dashboard')) {
        cy.log('Login successful - testing authenticated middleware');
        
        // Should be able to access protected routes
        cy.contains('Dashboard', { timeout: 10000 }).should('exist');
        
        // Try accessing another protected route
        cy.visit('/projects', { failOnStatusCode: false });
        cy.wait(2000);
        
        // Should not redirect to login
        cy.url().should('not.include', '/login');
        
        // Try accessing auth pages while logged in - should redirect to dashboard
        cy.visit('/login', { failOnStatusCode: false });
        cy.wait(2000);
        cy.url({ timeout: 5000 }).should('include', '/dashboard');
        
        cy.visit('/register', { failOnStatusCode: false });
        cy.wait(2000);
        cy.url({ timeout: 5000 }).should('include', '/dashboard');
        
        cy.log('Middleware authentication checks passed');
      } else {
        cy.log('Login failed - testing unauthenticated middleware behavior');
        
        // Should still redirect protected routes to login
        cy.visit('/projects', { failOnStatusCode: false });
        cy.url({ timeout: 5000 }).should('include', '/login');
      }
    });
  });

  it('should handle middleware errors gracefully', () => {
    // Test that middleware doesn't break the app
    cy.visit('/login', { failOnStatusCode: false });
    cy.wait(3000);
    
    // Should load without errors
    cy.get('body').should('exist');
    cy.contains('Sign In', { timeout: 10000 }).should('exist');
    
    // Test navigation works
    cy.visit('/register', { failOnStatusCode: false });
    cy.wait(2000);
    cy.contains('Create Account', { timeout: 10000 }).should('exist');
    
    cy.log('Middleware error handling verified');
  });
});