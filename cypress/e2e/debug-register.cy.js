describe('Debug Register', () => {
  it('should debug register page content', () => {
    cy.visit('/register', { failOnStatusCode: false });
    cy.wait(3000);
    
    // Debug what's actually on the page
    cy.get('body').then(($body) => {
      console.log('Body HTML:', $body.html());
    });
    
    // Look for any text containing "Create"
    cy.contains('Create', { timeout: 15000 }).should('exist');
    
    // Look for form elements
    cy.get('form').should('exist');
    cy.get('input').should('have.length.at.least', 1);
  });
});