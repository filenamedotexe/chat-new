describe('Check API Response', () => {
  it('should check message API structure', () => {
    // Login
    cy.visit('/login');
    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');

    // Get project ID
    cy.visit('/projects');
    cy.get('a[href^="/projects/"]').not('[href="/projects/new"]').first().then($link => {
      const href = $link.attr('href');
      const projectId = href.split('/').pop();
      cy.log('Project ID:', projectId);
      
      // Make API request
      cy.request({
        method: 'GET',
        url: `/api/messages?projectId=${projectId}&limit=5`,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        cy.log('API Response:', JSON.stringify(response.body, null, 2));
        
        // Check structure
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('messages');
        expect(response.body.messages).to.be.an('array');
        
        if (response.body.messages.length > 0) {
          const firstMessage = response.body.messages[0];
          cy.log('First message structure:', JSON.stringify(firstMessage, null, 2));
          
          // Check if it has the expected structure
          expect(firstMessage).to.have.property('message');
          expect(firstMessage).to.have.property('sender');
          expect(firstMessage.message).to.have.property('content');
          expect(firstMessage.sender).to.have.property('id');
          expect(firstMessage.sender).to.have.property('email');
        }
      });
    });
  });
});