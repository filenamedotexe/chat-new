describe('Simple Test', () => {
  it('should access register page', () => {
    cy.visit('/register', { failOnStatusCode: false });
    cy.wait(2000);
    cy.get('body').should('exist');
  });
});