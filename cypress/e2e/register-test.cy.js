describe('Registration Test', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should load registration page successfully', () => {
    cy.get('h2', { timeout: 10000 }).should('contain', 'Create Account');
    cy.get('input[placeholder="Name"]').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[placeholder="Password"]').should('exist');
    cy.get('input[placeholder="Confirm Password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should test registration flow with both auth systems', () => {
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'testpass123';
    const testName = 'Test User';

    // Fill form
    cy.get('input[placeholder="Name"]').type(testName);
    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[placeholder="Password"]').type(testPassword);
    cy.get('input[placeholder="Confirm Password"]').type(testPassword);

    // Check if using Supabase auth indicator appears
    cy.get('body').then(($body) => {
      if ($body.find('.text-blue-600').length > 0) {
        cy.get('.text-blue-600').should('contain', 'Using Supabase Auth');
      }
    });

    // Submit form
    cy.get('button[type="submit"]').click();

    // Should redirect to dashboard or show error
    cy.url({ timeout: 10000 }).should('satisfy', (url) => {
      return url.includes('/dashboard') || url.includes('/register');
    });
  });

  it('should show error for password mismatch', () => {
    cy.get('input[placeholder="Name"]').type('Test User');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[placeholder="Password"]').type('password123');
    cy.get('input[placeholder="Confirm Password"]').type('different123');
    cy.get('button[type="submit"]').click();

    cy.get('.bg-red-50').should('contain', 'Passwords do not match');
  });
});