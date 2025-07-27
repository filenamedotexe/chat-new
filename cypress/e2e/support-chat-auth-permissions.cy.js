describe('Support Chat API - Authentication & Permissions (Section 1.3)', () => {
  let clientConversationId;
  let otherClientConversationId;
  let adminUserId = '550e8400-e29b-41d4-a716-446655440011';
  let clientUserId = '550e8400-e29b-41d4-a716-446655440012';
  let otherClientUserId = '550e8400-e29b-41d4-a716-446655440013';

  beforeEach(() => {
    cy.task('db:reset');
    
    // Create test users with different roles
    cy.task('db:seed', {
      users: [
        { id: clientUserId, email: 'client1@test.com', role: 'client' },
        { id: otherClientUserId, email: 'client2@test.com', role: 'client' },
        { id: adminUserId, email: 'admin@test.com', role: 'admin' },
        { id: '550e8400-e29b-41d4-a716-446655440014', email: 'team@test.com', role: 'team' }
      ]
    });

    // Create test conversations
    cy.task('db:createConversation', {
      clientId: clientUserId,
      subject: 'Client 1 Conversation'
    }).then((conv) => {
      clientConversationId = conv.id;
    });

    cy.task('db:createConversation', {
      clientId: otherClientUserId,
      subject: 'Client 2 Conversation'
    }).then((conv) => {
      otherClientConversationId = conv.id;
    });
  });

  describe('Role-Based Access Control - Admin Role', () => {
    it('should allow admin to view all conversations', () => {
      cy.request({
        method: 'GET',
        url: '/api/conversations',
        headers: {
          'x-test-user': JSON.stringify({
            id: adminUserId,
            email: 'admin@test.com',
            role: 'admin',
            name: 'Test Admin'
          })
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('conversations');
        expect(response.body.conversations).to.have.length(2);
      });
    });

    it('should allow admin to view any specific conversation', () => {
      cy.loginAs('admin@test.com');
      
      cy.request(`/api/conversations/${clientConversationId}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.subject).to.eq('Client 1 Conversation');
      });

      cy.request(`/api/conversations/${otherClientConversationId}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.subject).to.eq('Client 2 Conversation');
      });
    });

    it('should allow admin to update conversation metadata', () => {
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'PATCH',
        url: `/api/conversations/${clientConversationId}`,
        body: {
          status: 'in_progress',
          priority: 'high',
          assignedTo: adminUserId
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.status).to.eq('in_progress');
        expect(response.body.priority).to.eq('high');
        expect(response.body.assignedTo).to.eq(adminUserId);
      });
    });

    it('should allow admin to send regular messages', () => {
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${clientConversationId}/messages`,
        body: {
          content: 'Admin response to client'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.content).to.eq('Admin response to client');
        expect(response.body.isInternalNote).to.be.false;
      });
    });

    it('should allow admin to send internal notes', () => {
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${clientConversationId}/messages`,
        body: {
          content: 'Internal note about this client',
          isInternalNote: true
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.content).to.eq('Internal note about this client');
        expect(response.body.isInternalNote).to.be.true;
      });
    });

    it('should allow admin to view internal notes in message list', () => {
      // First create an internal note
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${clientConversationId}/messages`,
        body: {
          content: 'Internal admin note',
          isInternalNote: true
        }
      });

      // Then verify admin can see it
      cy.request(`/api/conversations/${clientConversationId}/messages`).then((response) => {
        expect(response.status).to.eq(200);
        const internalNotes = response.body.messages.filter(msg => msg.isInternalNote);
        expect(internalNotes).to.have.length.greaterThan(0);
        expect(internalNotes[0].content).to.eq('Internal admin note');
      });
    });

    it('should prevent admin from creating new conversations', () => {
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: 'Admin Created Conversation',
          message: 'This should not be allowed'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(403);
        expect(response.body.error).to.include('Only clients can create conversations');
      });
    });
  });

  describe('Role-Based Access Control - Client Role', () => {
    it('should allow client to view only their own conversations', () => {
      cy.loginAs('client1@test.com');
      cy.request('/api/conversations').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.length(1);
        expect(response.body[0].subject).to.eq('Client 1 Conversation');
        expect(response.body[0].clientId).to.eq(clientUserId);
      });
    });

    it('should prevent client from viewing other clients conversations', () => {
      cy.loginAs('client1@test.com');
      cy.request({
        url: `/api/conversations/${otherClientConversationId}`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(403);
        expect(response.body.error).to.include('Access denied');
      });
    });

    it('should allow client to view their own conversation details', () => {
      cy.loginAs('client1@test.com');
      cy.request(`/api/conversations/${clientConversationId}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.subject).to.eq('Client 1 Conversation');
        expect(response.body.clientId).to.eq(clientUserId);
      });
    });

    it('should prevent client from updating conversation metadata', () => {
      cy.loginAs('client1@test.com');
      cy.request({
        method: 'PATCH',
        url: `/api/conversations/${clientConversationId}`,
        body: {
          status: 'resolved',
          priority: 'high'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(403);
        expect(response.body.error).to.include('Only admins can update conversation metadata');
      });
    });

    it('should allow client to send regular messages', () => {
      cy.loginAs('client1@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${clientConversationId}/messages`,
        body: {
          content: 'Client message to support'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.content).to.eq('Client message to support');
        expect(response.body.isInternalNote).to.be.false;
        expect(response.body.senderId).to.eq(clientUserId);
      });
    });

    it('should prevent client from sending internal notes', () => {
      cy.loginAs('client1@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${clientConversationId}/messages`,
        body: {
          content: 'Attempted internal note',
          isInternalNote: true
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        // Should be forced to false
        expect(response.body.isInternalNote).to.be.false;
      });
    });

    it('should filter out internal notes from client message view', () => {
      // Admin creates internal note
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${clientConversationId}/messages`,
        body: {
          content: 'Secret internal note',
          isInternalNote: true
        }
      });

      // Client views messages - should not see internal note
      cy.loginAs('client1@test.com');
      cy.request(`/api/conversations/${clientConversationId}/messages`).then((response) => {
        expect(response.status).to.eq(200);
        const internalNotes = response.body.messages.filter(msg => msg.isInternalNote);
        expect(internalNotes).to.have.length(0);
        
        response.body.messages.forEach(message => {
          expect(message.isInternalNote).to.be.false;
        });
      });
    });

    it('should allow client to create new conversations', () => {
      cy.loginAs('client1@test.com');
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: 'New Support Request',
          message: 'I need help with something'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.subject).to.eq('New Support Request');
        expect(response.body.clientId).to.eq(clientUserId);
        expect(response.body.status).to.eq('open');
      });
    });

    it('should prevent client from sending messages to other clients conversations', () => {
      cy.loginAs('client1@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${otherClientConversationId}/messages`,
        body: {
          content: 'Unauthorized message'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(403);
      });
    });
  });

  describe('Role-Based Access Control - Team Role', () => {
    it('should allow team member to view all conversations like admin', () => {
      cy.loginAs('team@test.com');
      cy.request('/api/conversations').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.length(2);
      });
    });

    it('should allow team member to send messages and internal notes', () => {
      cy.loginAs('team@test.com');
      
      // Regular message
      cy.request({
        method: 'POST',
        url: `/api/conversations/${clientConversationId}/messages`,
        body: {
          content: 'Team member response'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.isInternalNote).to.be.false;
      });

      // Internal note
      cy.request({
        method: 'POST',
        url: `/api/conversations/${clientConversationId}/messages`,
        body: {
          content: 'Team internal note',
          isInternalNote: true
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.isInternalNote).to.be.true;
      });
    });

    it('should allow team member to update conversation metadata', () => {
      cy.loginAs('team@test.com');
      cy.request({
        method: 'PATCH',
        url: `/api/conversations/${clientConversationId}`,
        body: {
          status: 'in_progress',
          assignedTo: 'team-1'
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.status).to.eq('in_progress');
      });
    });

    it('should prevent team member from creating conversations', () => {
      cy.loginAs('team@test.com');
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: 'Team Created Conversation',
          message: 'Should not be allowed'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(403);
      });
    });
  });

  describe('Authentication Edge Cases', () => {
    it('should reject requests with no authentication', () => {
      cy.request({
        method: 'GET',
        url: '/api/conversations',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.error).to.include('Authentication required');
      });
    });

    it('should reject requests with invalid JWT token', () => {
      cy.request({
        method: 'GET',
        url: '/api/conversations',
        headers: {
          'Authorization': 'Bearer invalid-jwt-token'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('should reject requests with expired JWT token', () => {
      // This would require creating an expired token
      // For now, test with malformed token that might represent expired
      cy.request({
        method: 'GET',
        url: '/api/conversations',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('should reject requests from deactivated users', () => {
      // Create deactivated user
      cy.task('db:seed', {
        users: [
          { id: 'deactivated-1', email: 'deactivated@test.com', role: 'client', isActive: false }
        ]
      });

      cy.loginAs('deactivated@test.com', { isActive: false });
      cy.request({
        method: 'GET',
        url: '/api/conversations',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('should handle missing user in session', () => {
      // Create a JWT token for a user that doesn't exist in database
      cy.loginAs('nonexistent@test.com', { shouldExist: false });
      cy.request({
        method: 'GET',
        url: '/api/conversations',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  describe('Authorization Boundary Conditions', () => {
    it('should handle conversation ownership edge cases', () => {
      // Test with conversation that has null clientId
      cy.task('db:createConversation', {
        clientId: null,
        subject: 'Orphaned Conversation'
      }).then((conv) => {
        cy.loginAs('client1@test.com');
        cy.request({
          url: `/api/conversations/${conv.id}`,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(403);
        });
      });
    });

    it('should handle role changes during session', () => {
      // This would test scenarios where a user's role changes while they have an active session
      // For now, verify that each request checks current role
      cy.loginAs('client1@test.com');
      
      // Client should only see their own conversations
      cy.request('/api/conversations').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.length(1);
      });

      // If role were to change to admin (in a real scenario), 
      // next request should reflect new permissions
      // This would require a way to update user role mid-test
    });

    it('should prevent privilege escalation through request manipulation', () => {
      cy.loginAs('client1@test.com');
      
      // Try to escalate by manipulating request headers
      cy.request({
        method: 'PATCH',
        url: `/api/conversations/${clientConversationId}`,
        body: { status: 'resolved' },
        headers: {
          'X-User-Role': 'admin', // Attempt to spoof role
          'X-Admin': 'true'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(403);
      });

      // Try to escalate by manipulating request body
      cy.request({
        method: 'POST',
        url: `/api/conversations/${clientConversationId}/messages`,
        body: {
          content: 'Normal message',
          isInternalNote: true,
          senderId: adminUserId, // Try to spoof sender
          role: 'admin' // Try to spoof role
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        // Should ignore spoofed fields
        expect(response.body.isInternalNote).to.be.false;
        expect(response.body.senderId).to.eq(clientUserId);
      });
    });

    it('should handle concurrent access from same user', () => {
      cy.loginAs('client1@test.com');
      
      // Multiple concurrent requests should all respect same permissions
      const requests = [];
      for (let i = 0; i < 3; i++) {
        requests.push(
          cy.request(`/api/conversations/${clientConversationId}`)
        );
      }

      requests.forEach(req => {
        req.then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.clientId).to.eq(clientUserId);
        });
      });
    });
  });
});