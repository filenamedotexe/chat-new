describe('Verify Chat Working', () => {
  it('should send a simple message', () => {
    // Login
    cy.visit('/login');
    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');

    // Go to chat
    cy.visit('/projects');
    cy.get('a[href^="/projects/"]').not('[href="/projects/new"]').first().click();
    cy.contains('Team Chat').click();
    
    // Send a message
    const message = `Simple test ${Date.now()}`;
    cy.get('textarea[placeholder*="message"]').type(message);
    cy.get('button[aria-label="Send message"]').click();
    
    // Wait and check
    cy.wait(2000);
    cy.contains(message).should('be.visible');
  });
});