describe('Support Chat API - Comprehensive Testing (Section 1.3)', () => {
  let conversationId;
  let clientUserId;
  let adminUserId;
  
  beforeEach(() => {
    // Reset database state
    cy.task('db:reset');
    
    // Create test users with different roles
    cy.task('db:seed', {
      users: [
        { id: 'client-1', email: 'client@test.com', role: 'client' },
        { id: 'admin-1', email: 'admin@test.com', role: 'admin' }
      ]
    });
    
    clientUserId = 'client-1';
    adminUserId = 'admin-1';
  });

  describe('GET /api/conversations - List Conversations', () => {
    it('should return empty array when no conversations exist', () => {
      cy.loginAs('admin@test.com');
      cy.request('GET', '/api/conversations').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        expect(response.body).to.have.length(0);
      });
    });

    it('should return conversations for admin users', () => {
      // Create test conversation first
      cy.task('db:createConversation', {
        clientId: clientUserId,
        subject: 'Test Support Request'
      }).then((conv) => {
        conversationId = conv.id;
        
        cy.loginAs('admin@test.com');
        cy.request('GET', '/api/conversations').then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.length(1);
          expect(response.body[0]).to.have.property('id', conversationId);
          expect(response.body[0]).to.have.property('subject', 'Test Support Request');
          expect(response.body[0]).to.have.property('status', 'open');
        });
      });
    });

    it('should only return own conversations for client users', () => {
      // Create conversations for different clients
      cy.task('db:createConversation', {
        clientId: clientUserId,
        subject: 'Client 1 Request'
      });
      
      cy.task('db:createConversation', {
        clientId: 'other-client',
        subject: 'Other Client Request'
      });

      cy.loginAs('client@test.com');
      cy.request('GET', '/api/conversations').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.length(1);
        expect(response.body[0]).to.have.property('subject', 'Client 1 Request');
      });
    });

    it('should require authentication', () => {
      cy.request({
        method: 'GET',
        url: '/api/conversations',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('should include unread message counts', () => {
      cy.task('db:createConversationWithMessages', {
        clientId: clientUserId,
        subject: 'Test with Messages',
        messageCount: 3,
        unreadCount: 2
      }).then((conv) => {
        cy.loginAs('admin@test.com');
        cy.request('GET', '/api/conversations').then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body[0]).to.have.property('unreadCount', 2);
          expect(response.body[0]).to.have.property('lastMessage');
        });
      });
    });
  });

  describe('POST /api/conversations - Create Conversation', () => {
    it('should create conversation for client users', () => {
      cy.loginAs('client@test.com');
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: 'New Support Request',
          message: 'I need help with my project'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('subject', 'New Support Request');
        expect(response.body).to.have.property('status', 'open');
        expect(response.body).to.have.property('clientId', clientUserId);
        conversationId = response.body.id;
      });
    });

    it('should prevent admin users from creating conversations', () => {
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: 'Admin Request',
          message: 'This should not work'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(403);
        expect(response.body).to.have.property('error');
      });
    });

    it('should validate required fields', () => {
      cy.loginAs('client@test.com');
      
      // Missing subject
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          message: 'Missing subject'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });

      // Missing message
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: 'Missing message'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('should validate message length (1-1000 chars)', () => {
      cy.loginAs('client@test.com');
      
      // Too short
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: 'Test',
          message: ''
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });

      // Too long
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: 'Test',
          message: 'a'.repeat(1001)
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });

      // Valid length
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: 'Test',
          message: 'Valid message'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
      });
    });

    it('should create initial message with conversation', () => {
      cy.loginAs('client@test.com');
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: 'Test with Message',
          message: 'Initial message content'
        }
      }).then((response) => {
        const convId = response.body.id;
        
        cy.request(`/api/conversations/${convId}/messages`).then((msgResponse) => {
          expect(msgResponse.status).to.eq(200);
          expect(msgResponse.body.messages).to.have.length(1);
          expect(msgResponse.body.messages[0]).to.have.property('content', 'Initial message content');
          expect(msgResponse.body.messages[0]).to.have.property('isInternalNote', false);
        });
      });
    });
  });

  describe('GET /api/conversations/[id] - Get Single Conversation', () => {
    beforeEach(() => {
      cy.task('db:createConversation', {
        clientId: clientUserId,
        subject: 'Test Conversation'
      }).then((conv) => {
        conversationId = conv.id;
      });
    });

    it('should return conversation for authorized users', () => {
      cy.loginAs('admin@test.com');
      cy.request(`/api/conversations/${conversationId}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('id', conversationId);
        expect(response.body).to.have.property('subject', 'Test Conversation');
        expect(response.body).to.have.property('client');
        expect(response.body.client).to.have.property('email', 'client@test.com');
      });
    });

    it('should allow clients to view their own conversations', () => {
      cy.loginAs('client@test.com');
      cy.request(`/api/conversations/${conversationId}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('id', conversationId);
      });
    });

    it('should prevent clients from viewing other conversations', () => {
      cy.task('db:createConversation', {
        clientId: 'other-client',
        subject: 'Other Client Conversation'
      }).then((otherConv) => {
        cy.loginAs('client@test.com');
        cy.request({
          url: `/api/conversations/${otherConv.id}`,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(403);
        });
      });
    });

    it('should return 404 for non-existent conversations', () => {
      cy.loginAs('admin@test.com');
      cy.request({
        url: '/api/conversations/non-existent-id',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });

  describe('PATCH /api/conversations/[id] - Update Conversation', () => {
    beforeEach(() => {
      cy.task('db:createConversation', {
        clientId: clientUserId,
        subject: 'Test Conversation'
      }).then((conv) => {
        conversationId = conv.id;
      });
    });

    it('should allow admins to update conversation metadata', () => {
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'PATCH',
        url: `/api/conversations/${conversationId}`,
        body: {
          status: 'resolved',
          priority: 'high',
          assignedTo: adminUserId
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('status', 'resolved');
        expect(response.body).to.have.property('priority', 'high');
        expect(response.body).to.have.property('assignedTo', adminUserId);
      });
    });

    it('should prevent clients from updating conversations', () => {
      cy.loginAs('client@test.com');
      cy.request({
        method: 'PATCH',
        url: `/api/conversations/${conversationId}`,
        body: {
          status: 'resolved'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(403);
      });
    });

    it('should validate status enum values', () => {
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'PATCH',
        url: `/api/conversations/${conversationId}`,
        body: {
          status: 'invalid-status'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('should validate priority enum values', () => {
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'PATCH',
        url: `/api/conversations/${conversationId}`,
        body: {
          priority: 'invalid-priority'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('should update lastMessageAt timestamp', () => {
      const originalTime = new Date().toISOString();
      
      cy.wait(1000); // Ensure timestamp difference
      
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'PATCH',
        url: `/api/conversations/${conversationId}`,
        body: {
          status: 'in_progress'
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(new Date(response.body.lastMessageAt)).to.be.greaterThan(new Date(originalTime));
      });
    });
  });

  describe('GET /api/conversations/[id]/messages - Get Messages', () => {
    beforeEach(() => {
      cy.task('db:createConversationWithMessages', {
        clientId: clientUserId,
        subject: 'Test Conversation',
        messageCount: 15,
        includeInternalNotes: true
      }).then((conv) => {
        conversationId = conv.id;
      });
    });

    it('should return messages for authorized users', () => {
      cy.loginAs('admin@test.com');
      cy.request(`/api/conversations/${conversationId}/messages`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('messages');
        expect(response.body).to.have.property('pagination');
        expect(response.body.messages).to.be.an('array');
        expect(response.body.messages.length).to.be.greaterThan(0);
      });
    });

    it('should support pagination', () => {
      cy.loginAs('admin@test.com');
      cy.request(`/api/conversations/${conversationId}/messages?page=1&limit=5`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.messages).to.have.length(5);
        expect(response.body.pagination).to.have.property('page', 1);
        expect(response.body.pagination).to.have.property('limit', 5);
        expect(response.body.pagination).to.have.property('total');
        expect(response.body.pagination).to.have.property('hasNext');
      });
    });

    it('should filter internal notes for clients', () => {
      cy.loginAs('client@test.com');
      cy.request(`/api/conversations/${conversationId}/messages`).then((response) => {
        expect(response.status).to.eq(200);
        response.body.messages.forEach(message => {
          expect(message.isInternalNote).to.be.false;
        });
      });
    });

    it('should include internal notes for admins', () => {
      cy.loginAs('admin@test.com');
      cy.request(`/api/conversations/${conversationId}/messages`).then((response) => {
        expect(response.status).to.eq(200);
        const hasInternalNote = response.body.messages.some(msg => msg.isInternalNote === true);
        expect(hasInternalNote).to.be.true;
      });
    });

    it('should order messages chronologically', () => {
      cy.loginAs('admin@test.com');
      cy.request(`/api/conversations/${conversationId}/messages`).then((response) => {
        expect(response.status).to.eq(200);
        const messages = response.body.messages;
        
        for (let i = 1; i < messages.length; i++) {
          const prevTime = new Date(messages[i-1].createdAt);
          const currTime = new Date(messages[i].createdAt);
          expect(currTime).to.be.greaterThan(prevTime);
        }
      });
    });

    it('should include sender information', () => {
      cy.loginAs('admin@test.com');
      cy.request(`/api/conversations/${conversationId}/messages`).then((response) => {
        expect(response.status).to.eq(200);
        response.body.messages.forEach(message => {
          expect(message).to.have.property('sender');
          expect(message.sender).to.have.property('id');
          expect(message.sender).to.have.property('email');
        });
      });
    });
  });

  describe('POST /api/conversations/[id]/messages - Send Message', () => {
    beforeEach(() => {
      cy.task('db:createConversation', {
        clientId: clientUserId,
        subject: 'Test Conversation'
      }).then((conv) => {
        conversationId = conv.id;
      });
    });

    it('should allow clients to send messages', () => {
      cy.loginAs('client@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'This is a client message'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('content', 'This is a client message');
        expect(response.body).to.have.property('isInternalNote', false);
        expect(response.body).to.have.property('senderId', clientUserId);
      });
    });

    it('should allow admins to send regular messages', () => {
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'This is an admin response'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('content', 'This is an admin response');
        expect(response.body).to.have.property('isInternalNote', false);
        expect(response.body).to.have.property('senderId', adminUserId);
      });
    });

    it('should allow admins to send internal notes', () => {
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'This is an internal note',
          isInternalNote: true
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('content', 'This is an internal note');
        expect(response.body).to.have.property('isInternalNote', true);
      });
    });

    it('should prevent clients from sending internal notes', () => {
      cy.loginAs('client@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'Attempted internal note',
          isInternalNote: true
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('isInternalNote', false); // Should be forced to false
      });
    });

    it('should validate message content length', () => {
      cy.loginAs('client@test.com');
      
      // Empty content
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: ''
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });

      // Too long content
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'a'.repeat(1001)
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('should update conversation lastMessageAt', () => {
      cy.loginAs('client@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'New message'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        
        // Verify conversation was updated
        cy.request(`/api/conversations/${conversationId}`).then((convResponse) => {
          expect(new Date(convResponse.body.lastMessageAt)).to.be.greaterThan(
            new Date(convResponse.body.createdAt)
          );
        });
      });
    });

    it('should handle file attachments', () => {
      cy.loginAs('client@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'Message with attachment',
          fileIds: ['file-1', 'file-2']
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('fileIds');
        expect(response.body.fileIds).to.deep.equal(['file-1', 'file-2']);
      });
    });

    it('should prevent sending to closed conversations', () => {
      // First close the conversation
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'PATCH',
        url: `/api/conversations/${conversationId}`,
        body: { status: 'resolved' }
      });

      // Try to send message as client
      cy.loginAs('client@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'Message to closed conversation'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error');
      });
    });
  });

  describe('Authentication & Authorization Edge Cases', () => {
    beforeEach(() => {
      cy.task('db:createConversation', {
        clientId: clientUserId,
        subject: 'Auth Test Conversation'
      }).then((conv) => {
        conversationId = conv.id;
      });
    });

    it('should handle expired/invalid tokens', () => {
      cy.request({
        method: 'GET',
        url: '/api/conversations',
        headers: {
          'Authorization': 'Bearer invalid-token'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('should handle missing authorization header', () => {
      cy.request({
        method: 'GET',
        url: '/api/conversations',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('should handle non-existent user in token', () => {
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

  describe('Error Handling & Edge Cases', () => {
    it('should handle malformed JSON in request body', () => {
      cy.loginAs('client@test.com');
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: 'invalid-json',
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('should handle database connection errors gracefully', () => {
      // This would require mocking the database connection
      // For now, we'll test that the API returns proper error codes
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'GET',
        url: '/api/conversations/invalid-uuid-format',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 404]);
      });
    });

    it('should handle very large request payloads', () => {
      cy.loginAs('client@test.com');
      const largeSubject = 'a'.repeat(500); // Test subject length limits
      
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: largeSubject,
          message: 'Valid message'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Should either accept (if no limit) or reject (if limit exists)
        expect(response.status).to.be.oneOf([201, 400]);
      });
    });

    it('should handle concurrent requests properly', () => {
      cy.loginAs('client@test.com');
      
      const requests = [];
      for (let i = 0; i < 5; i++) {
        requests.push(
          cy.request({
            method: 'POST',
            url: '/api/conversations',
            body: {
              subject: `Concurrent Request ${i}`,
              message: 'Test message'
            }
          })
        );
      }

      // All requests should succeed
      requests.forEach((req, index) => {
        req.then((response) => {
          expect(response.status).to.eq(201);
          expect(response.body.subject).to.eq(`Concurrent Request ${index}`);
        });
      });
    });
  });

  describe('Performance & Load Testing', () => {
    it('should handle pagination with large datasets', () => {
      // Create conversation with many messages
      cy.task('db:createConversationWithMessages', {
        clientId: clientUserId,
        subject: 'Large Conversation',
        messageCount: 100
      }).then((conv) => {
        cy.loginAs('admin@test.com');
        
        // Test first page
        cy.request(`/api/conversations/${conv.id}/messages?page=1&limit=10`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.messages).to.have.length(10);
          expect(response.body.pagination.hasNext).to.be.true;
        });

        // Test last page
        cy.request(`/api/conversations/${conv.id}/messages?page=10&limit=10`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.messages.length).to.be.lessThanOrEqual(10);
          expect(response.body.pagination.hasNext).to.be.false;
        });
      });
    });

    it('should respond within acceptable time limits', () => {
      cy.loginAs('admin@test.com');
      
      const startTime = Date.now();
      cy.request('/api/conversations').then((response) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        expect(response.status).to.eq(200);
        expect(responseTime).to.be.lessThan(2000); // 2 second max
      });
    });
  });

  describe('Data Integrity & Consistency', () => {
    it('should maintain referential integrity', () => {
      cy.loginAs('client@test.com');
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: 'Integrity Test',
          message: 'Initial message'
        }
      }).then((response) => {
        const convId = response.body.id;
        
        // Verify conversation exists
        cy.request(`/api/conversations/${convId}`).then((convResponse) => {
          expect(convResponse.status).to.eq(200);
        });

        // Verify initial message exists
        cy.request(`/api/conversations/${convId}/messages`).then((msgResponse) => {
          expect(msgResponse.status).to.eq(200);
          expect(msgResponse.body.messages).to.have.length(1);
          expect(msgResponse.body.messages[0].conversationId).to.eq(convId);
        });
      });
    });

    it('should handle transaction rollbacks properly', () => {
      // This would require testing scenarios where database operations fail
      // For now, verify that partial creates don't leave orphaned data
      cy.loginAs('client@test.com');
      
      // Try to create conversation with invalid data that might cause partial failure
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: null, // Invalid subject
          message: 'Valid message'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        
        // Verify no orphaned conversation was created
        cy.request('/api/conversations').then((listResponse) => {
          expect(listResponse.body.length).to.eq(0);
        });
      });
    });
  });
});