describe('Messages API - Simple Tests', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should return 400 when no context is provided', () => {
    cy.request({
      method: 'GET',
      url: '/api/messages',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.error).to.include('Must provide projectId, taskId, or recipientId');
    });
  });

  it('should return 400 when content is empty', () => {
    cy.request({
      method: 'POST',
      url: '/api/messages',
      body: {
        content: '',
        recipientId: 'bdad9e87-d94a-4375-afef-5bfcf43d074b' // Admin's own ID
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.error).to.include('Message content is required');
    });
  });

  it('should handle self-messages (admin to admin)', () => {
    const adminId = 'bdad9e87-d94a-4375-afef-5bfcf43d074b'; // From seed data
    
    // Create a message to self
    cy.request({
      method: 'POST',
      url: '/api/messages',
      body: {
        content: 'Test self-message',
        recipientId: adminId,
        type: 'text'
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.success).to.be.true;
      expect(response.body.message).to.have.property('id');
      expect(response.body.message.content).to.eq('Test self-message');
      expect(response.body.message.recipientId).to.eq(adminId);
      expect(response.body.message.senderId).to.eq(adminId);
    });

    // Get the messages
    cy.request({
      method: 'GET',
      url: `/api/messages?recipientId=${adminId}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.messages).to.be.an('array');
      expect(response.body.messages.length).to.be.at.least(1);
      
      // Find our test message
      const testMessage = response.body.messages.find(m => 
        m.message.content === 'Test self-message'
      );
      expect(testMessage).to.exist;
      expect(testMessage.sender.email).to.eq('admin@example.com');
    });
  });

  it('should enforce authentication', () => {
    // Logout
    cy.clearCookies();
    
    // Try to access messages without auth
    cy.request({
      method: 'GET',
      url: '/api/messages?recipientId=bdad9e87-d94a-4375-afef-5bfcf43d074b',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.error).to.eq('Unauthorized');
    });

    // Try to post message without auth
    cy.request({
      method: 'POST',
      url: '/api/messages',
      body: {
        content: 'Unauthorized test',
        recipientId: 'bdad9e87-d94a-4375-afef-5bfcf43d074b'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.error).to.eq('Unauthorized');
    });
  });

  it('should validate message content length', () => {
    const longContent = 'x'.repeat(5001); // Over 5000 character limit
    
    cy.request({
      method: 'POST',
      url: '/api/messages',
      body: {
        content: longContent,
        recipientId: 'bdad9e87-d94a-4375-afef-5bfcf43d074b'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(500);
      expect(response.body.error).to.include('5000 characters');
    });
  });
});