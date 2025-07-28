describe('API Auth Isolated Test', () => {
  it('should test API routes are properly protected', () => {
    // Start with completely fresh browser state
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visit logout endpoint to ensure no session
    cy.visit('/api/auth/signout', { failOnStatusCode: false });
    cy.wait(1000);
    
    // Clear cookies again after logout
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Test that API returns 401 for unauthenticated requests
    cy.request({
      url: '/api/projects', 
      failOnStatusCode: false,
      headers: {
        'Cookie': '' // Explicitly send no cookies
      }
    }).then((response) => {
      cy.log(`API Response Status: ${response.status}`);
      cy.log('API Response Body:', response.body);
      
      // The API should return 401 when no valid session exists
      expect(response.status).to.eq(401);
      expect(response.body.error).to.eq('Unauthorized');
    });
  });
});