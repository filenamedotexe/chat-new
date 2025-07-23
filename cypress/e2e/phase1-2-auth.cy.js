describe('Phase 1-2: Database Setup & Authentication', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  describe('Authentication Flow', () => {
    it('should redirect to login when not authenticated', () => {
      cy.visit('/dashboard');
      cy.url().should('include', '/login');
      cy.screenshot('phase1-2-redirect-to-login');
    });

    it('should show login form with all elements', () => {
      cy.visit('/login');
      
      // Check all form elements
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
      cy.contains('Sign In').should('be.visible');
      cy.contains("Don't have an account?").should('be.visible');
      
      cy.screenshot('phase1-2-login-form');
    });

    it('should login with admin credentials', () => {
      cy.visit('/login');
      
      // Fill login form
      cy.get('input[type="email"]').type('admin@example.com');
      cy.get('input[type="password"]').type('admin123');
      
      cy.screenshot('phase1-2-login-filled');
      
      // Submit
      cy.get('button[type="submit"]').click();
      
      // Verify redirect to dashboard
      cy.url().should('include', '/dashboard');
      cy.contains('Dashboard').should('be.visible');
      
      cy.screenshot('phase1-2-admin-dashboard');
    });

    it('should login with client credentials', () => {
      cy.visit('/login');
      
      cy.get('input[type="email"]').type('user@example.com');
      cy.get('input[type="password"]').type('user123');
      cy.get('button[type="submit"]').click();
      
      cy.url().should('include', '/dashboard');
      cy.screenshot('phase1-2-client-dashboard');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');
      
      cy.get('input[type="email"]').type('invalid@example.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      
      // Should stay on login page and show error
      cy.url().should('include', '/login');
      cy.contains('Invalid email or password').should('be.visible');
      
      cy.screenshot('phase1-2-login-error');
    });

    it('should handle registration flow', () => {
      cy.visit('/login');
      
      // Click sign up link
      cy.contains('Sign up').click();
      cy.url().should('include', '/register');
      
      // Check registration form
      cy.get('input[name="name"]').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      
      cy.screenshot('phase1-2-register-form');
    });

    it('should logout successfully', () => {
      // Login first
      cy.login('admin@example.com', 'admin123');
      
      // Find and click user menu
      cy.get('button[aria-label="User menu"]').click();
      cy.screenshot('phase1-2-user-menu');
      
      // Click sign out
      cy.contains('Sign out').click();
      
      // Should redirect to login
      cy.url().should('include', '/login');
      
      cy.screenshot('phase1-2-logged-out');
    });

    it('should persist session across page refreshes', () => {
      cy.login('admin@example.com', 'admin123');
      
      // Refresh page
      cy.reload();
      
      // Should still be on dashboard
      cy.url().should('include', '/dashboard');
      cy.contains('Dashboard').should('be.visible');
    });
  });

  describe('Protected Routes', () => {
    it('should protect all app routes', () => {
      const protectedRoutes = [
        '/dashboard',
        '/projects',
        '/organizations',
        '/settings'
      ];

      protectedRoutes.forEach(route => {
        cy.visit(route);
        cy.url().should('include', '/login');
      });
    });

    it('should allow access to public routes', () => {
      const publicRoutes = [
        '/login',
        '/register'
      ];

      publicRoutes.forEach(route => {
        cy.visit(route);
        cy.url().should('include', route);
      });
    });
  });
});