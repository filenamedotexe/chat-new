describe('API Auth Debug', () => {
  it('should test unauthenticated API access', () => {
    // Clear everything
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Test API access without any authentication
    cy.request({
      url: '/api/projects',
      failOnStatusCode: false
    }).then((response) => {
      cy.log(`Status: ${response.status}`);
      cy.log('Body:', response.body);
      
      if (response.status === 200) {
        cy.log('WARNING: API returned 200 when it should return 401');
        cy.log('This indicates session persistence or auth adapter issue');
      } else {
        cy.log('API correctly returned non-200 status');
      }
    });
  });
  
  it('should test manual logout and API access', () => {
    // Visit logout to clear any sessions
    cy.visit('/api/auth/signout', { failOnStatusCode: false });
    cy.wait(1000);
    
    // Clear cookies again
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Test API access after logout
    cy.request({
      url: '/api/projects',
      failOnStatusCode: false
    }).then((response) => {
      cy.log(`Status after logout: ${response.status}`);
      cy.log('Body after logout:', response.body);
      
      expect(response.status).to.eq(401);
    });
  });
});