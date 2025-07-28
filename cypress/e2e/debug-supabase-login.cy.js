describe('Debug Supabase Login', () => {
  it('should debug the login process', () => {
    cy.visit('/login');
    
    // Take screenshot of login page
    cy.screenshot('login-page');
    
    // Check what's on the page
    cy.get('body').then($body => {
      cy.log('Page HTML:', $body.html());
    });
    
    // Try to find the email input
    cy.get('input[type="email"]').should('exist').then($input => {
      cy.log('Email input found:', $input);
    });
    
    // Type credentials
    cy.get('input[type="email"]').type('admin@test.com');
    cy.get('input[type="password"]').type('password123');
    
    // Find and click submit button
    cy.get('button[type="submit"]').should('exist').click();
    
    // Wait and see what happens
    cy.wait(5000);
    
    // Check current URL
    cy.url().then(url => {
      cy.log('Current URL after login attempt:', url);
    });
    
    // Check for any error messages
    cy.get('body').then($body => {
      cy.log('Page content after login:', $body.text());
    });
    
    // Take screenshot after login attempt
    cy.screenshot('after-login-attempt');
  });
});