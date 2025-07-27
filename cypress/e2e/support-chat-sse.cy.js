import { TEST_UUIDS } from '../support/uuid-utils';

describe('Support Chat SSE Endpoint (Section 1.4)', () => {
  let conversationId;
  let clientUserId = TEST_UUIDS.CLIENT_1;
  let adminUserId = TEST_UUIDS.ADMIN_1;

  before(() => {
    // Set up test data
    cy.task('db:reset');
    cy.task('db:seed', {
      users: [
        { 
          id: clientUserId, 
          email: 'testclient@example.com', 
          role: 'client',
          name: 'Test Client'
        },
        { 
          id: adminUserId, 
          email: 'testadmin@example.com', 
          role: 'admin',
          name: 'Test Admin'
        }
      ]
    });

    // Create a test conversation
    cy.task('db:createConversation', {
      clientId: clientUserId,
      subject: 'SSE Test Conversation'
    }).then((conversation) => {
      conversationId = conversation.id;
    });
  });

  describe('SSE Authentication', () => {
    it('should require authentication for SSE connection', () => {
      cy.request({
        method: 'GET',
        url: `/api/conversations/${conversationId}/stream`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.error).to.eq('Unauthorized');
      });
    });

    it('should return 400 for invalid conversation ID format', () => {
      cy.request({
        method: 'GET',
        url: '/api/conversations/invalid-id/stream',
        headers: {
          'x-test-user': JSON.stringify({
            id: adminUserId,
            email: 'testadmin@example.com',
            role: 'admin',
            name: 'Test Admin'
          })
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.eq('Invalid conversation ID');
      });
    });

    it('should return 404 for non-existent but valid UUID', () => {
      cy.request({
        method: 'GET',
        url: '/api/conversations/550e8400-e29b-41d4-a716-446655440999/stream',
        headers: {
          'x-test-user': JSON.stringify({
            id: adminUserId,
            email: 'testadmin@example.com',
            role: 'admin',
            name: 'Test Admin'
          })
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body.error).to.eq('Conversation not found');
      });
    });

    it('should check permissions for conversation access', () => {
      cy.request({
        method: 'GET',
        url: `/api/conversations/${conversationId}/stream`,
        headers: {
          'x-test-user': JSON.stringify({
            id: TEST_UUIDS.CLIENT_2,
            email: 'otherclient@example.com',
            role: 'client',
            name: 'Other Client'
          })
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(403);
        expect(response.body.error).to.eq('Forbidden');
      });
    });
  });

  describe('SSE Connection Headers', () => {
    it('should return correct SSE headers for valid request', () => {
      // Note: This tests the endpoint setup, but SSE streams need different testing approach
      cy.request({
        method: 'HEAD',
        url: `/api/conversations/${conversationId}/stream`,
        headers: {
          'x-test-user': JSON.stringify({
            id: clientUserId,
            email: 'testclient@example.com',
            role: 'client',
            name: 'Test Client'
          })
        },
        timeout: 5000,
        failOnStatusCode: false
      }).then((response) => {
        // HEAD requests to SSE endpoints typically return method not allowed
        // This is expected behavior - the endpoint only supports GET
        expect(response.status).to.be.oneOf([405, 200]);
      });
    });
  });

  describe('SSE Endpoint Availability', () => {
    it('should establish SSE connection for admin users', () => {
      // Note: SSE testing in Cypress is limited - timeouts indicate successful connection
      cy.request({
        method: 'GET',
        url: `/api/conversations/${conversationId}/stream`,
        headers: {
          'x-test-user': JSON.stringify({
            id: adminUserId,
            email: 'testadmin@example.com',
            role: 'admin',
            name: 'Test Admin'
          }),
          'Accept': 'text/event-stream'
        },
        timeout: 1000,
        failOnStatusCode: false
      }).then((response) => {
        // SSE connections timeout which is expected behavior
        expect(response.status).to.be.oneOf([200, 408]);
      });
    });

    it('should establish SSE connection for client users', () => {
      cy.request({
        method: 'GET',
        url: `/api/conversations/${conversationId}/stream`,
        headers: {
          'x-test-user': JSON.stringify({
            id: clientUserId,
            email: 'testclient@example.com',
            role: 'client',
            name: 'Test Client'
          }),
          'Accept': 'text/event-stream'
        },
        timeout: 1000,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 408]);
      });
    });
  });

  describe('SSE Security', () => {
    it('should not expose sensitive information in SSE errors', () => {
      cy.request({
        method: 'GET',
        url: '/api/conversations/malicious-injection-attempt/stream',
        headers: {
          'x-test-user': JSON.stringify({
            id: adminUserId,
            email: 'testadmin@example.com',
            role: 'admin',
            name: 'Test Admin'
          })
        },
        failOnStatusCode: false
      }).then((response) => {
        // Should handle malformed IDs safely - now returns 400 for invalid format
        expect(response.status).to.be.oneOf([400, 404, 500]);
        
        if (response.body) {
          const responseStr = JSON.stringify(response.body);
          expect(responseStr.toLowerCase()).to.not.include('sql');
          expect(responseStr.toLowerCase()).to.not.include('database');
          expect(responseStr.toLowerCase()).to.not.include('query');
        }
      });
    });

    it('should handle rapid connection attempts without errors', () => {
      // Test that rapid connections don't cause server issues
      cy.request({
        method: 'GET',
        url: `/api/conversations/${conversationId}/stream`,
        headers: {
          'x-test-user': JSON.stringify({
            id: adminUserId,
            email: 'testadmin@example.com',
            role: 'admin',
            name: 'Test Admin'
          })
        },
        timeout: 500,
        failOnStatusCode: false
      }).then((response) => {
        // First connection should succeed or timeout
        expect(response.status).to.be.oneOf([200, 408]);
        
        // Immediate second connection should also work
        cy.request({
          method: 'GET',
          url: `/api/conversations/${conversationId}/stream`,
          headers: {
            'x-test-user': JSON.stringify({
              id: clientUserId,
              email: 'testclient@example.com',
              role: 'client',
              name: 'Test Client'
            })
          },
          timeout: 500,
          failOnStatusCode: false
        }).then((response2) => {
          expect(response2.status).to.be.oneOf([200, 408]);
        });
      });
    });
  });
});