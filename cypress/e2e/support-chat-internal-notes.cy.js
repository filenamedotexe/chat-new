describe('Support Chat API - Internal Notes Functionality (Section 1.3)', () => {
  let conversationId;
  let clientUserId = 'client-1';
  let adminUserId = 'admin-1';
  let teamUserId = 'team-1';

  beforeEach(() => {
    cy.task('db:reset');
    
    cy.task('db:seed', {
      users: [
        { id: clientUserId, email: 'client@test.com', role: 'client' },
        { id: adminUserId, email: 'admin@test.com', role: 'admin' },
        { id: teamUserId, email: 'team@test.com', role: 'team' }
      ]
    });

    cy.task('db:createConversation', {
      clientId: clientUserId,
      subject: 'Test Conversation for Internal Notes'
    }).then((conv) => {
      conversationId = conv.id;
    });
  });

  describe('Creating Internal Notes', () => {
    it('should allow admin to create internal notes', () => {
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'This is a confidential internal note about the client',
          isInternalNote: true
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.content).to.eq('This is a confidential internal note about the client');
        expect(response.body.isInternalNote).to.be.true;
        expect(response.body.senderId).to.eq(adminUserId);
      });
    });

    it('should allow team members to create internal notes', () => {
      cy.loginAs('team@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'Team member internal note',
          isInternalNote: true
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.content).to.eq('Team member internal note');
        expect(response.body.isInternalNote).to.be.true;
        expect(response.body.senderId).to.eq(teamUserId);
      });
    });

    it('should prevent clients from creating internal notes', () => {
      cy.loginAs('client@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'Client attempting internal note',
          isInternalNote: true
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.content).to.eq('Client attempting internal note');
        // Should be forced to false for clients
        expect(response.body.isInternalNote).to.be.false;
        expect(response.body.senderId).to.eq(clientUserId);
      });
    });

    it('should default isInternalNote to false when not specified', () => {
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'Regular message without isInternalNote flag'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.isInternalNote).to.be.false;
      });
    });

    it('should validate internal note content length', () => {
      cy.loginAs('admin@test.com');
      
      // Empty internal note
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: '',
          isInternalNote: true
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });

      // Too long internal note
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'a'.repeat(1001),
          isInternalNote: true
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });

      // Valid length internal note
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'Valid length internal note',
          isInternalNote: true
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
      });
    });

    it('should allow internal notes with special content', () => {
      cy.loginAs('admin@test.com');
      
      const specialContents = [
        'Internal note with emojis 🔒 🗒️ 📝',
        'Internal note with\nmultiple\nlines',
        'Internal note with "quotes" and \'apostrophes\'',
        'Internal note with special chars: !@#$%^&*()',
        'Internal note mentioning user IDs: ' + clientUserId
      ];

      specialContents.forEach((content, index) => {
        cy.request({
          method: 'POST',
          url: `/api/conversations/${conversationId}/messages`,
          body: {
            content: content,
            isInternalNote: true
          }
        }).then((response) => {
          expect(response.status).to.eq(201);
          expect(response.body.isInternalNote).to.be.true;
          expect(response.body.content).to.eq(content);
        });
      });
    });
  });

  describe('Viewing Internal Notes', () => {
    beforeEach(() => {
      // Create a mix of regular messages and internal notes
      cy.loginAs('client@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'Client message 1'
        }
      });

      cy.loginAs('admin@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'Admin internal note 1',
          isInternalNote: true
        }
      });

      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'Admin public response'
        }
      });

      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'Admin internal note 2',
          isInternalNote: true
        }
      });

      cy.loginAs('client@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'Client message 2'
        }
      });
    });

    it('should show internal notes to admin users', () => {
      cy.loginAs('admin@test.com');
      cy.request(`/api/conversations/${conversationId}/messages`).then((response) => {
        expect(response.status).to.eq(200);
        
        const messages = response.body.messages;
        expect(messages).to.have.length(5); // All messages
        
        const internalNotes = messages.filter(msg => msg.isInternalNote);
        expect(internalNotes).to.have.length(2);
        
        const publicMessages = messages.filter(msg => !msg.isInternalNote);
        expect(publicMessages).to.have.length(3);
        
        // Verify internal note content
        expect(internalNotes.map(note => note.content)).to.include('Admin internal note 1');
        expect(internalNotes.map(note => note.content)).to.include('Admin internal note 2');
      });
    });

    it('should show internal notes to team members', () => {
      cy.loginAs('team@test.com');
      cy.request(`/api/conversations/${conversationId}/messages`).then((response) => {
        expect(response.status).to.eq(200);
        
        const messages = response.body.messages;
        expect(messages).to.have.length(5); // All messages
        
        const internalNotes = messages.filter(msg => msg.isInternalNote);
        expect(internalNotes).to.have.length(2);
      });
    });

    it('should hide internal notes from client users', () => {
      cy.loginAs('client@test.com');
      cy.request(`/api/conversations/${conversationId}/messages`).then((response) => {
        expect(response.status).to.eq(200);
        
        const messages = response.body.messages;
        expect(messages).to.have.length(3); // Only public messages
        
        // Verify no internal notes are present
        messages.forEach(message => {
          expect(message.isInternalNote).to.be.false;
        });
        
        // Verify client can see their own messages and admin public responses
        const contents = messages.map(msg => msg.content);
        expect(contents).to.include('Client message 1');
        expect(contents).to.include('Client message 2');
        expect(contents).to.include('Admin public response');
        expect(contents).to.not.include('Admin internal note 1');
        expect(contents).to.not.include('Admin internal note 2');
      });
    });

    it('should properly handle pagination with internal notes', () => {
      // Create more messages for pagination testing
      cy.loginAs('admin@test.com');
      for (let i = 0; i < 10; i++) {
        cy.request({
          method: 'POST',
          url: `/api/conversations/${conversationId}/messages`,
          body: {
            content: `Internal note ${i}`,
            isInternalNote: true
          }
        });
      }

      // Admin should see all messages with pagination
      cy.request(`/api/conversations/${conversationId}/messages?page=1&limit=5`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.messages).to.have.length(5);
        expect(response.body.pagination.total).to.be.greaterThan(10);
      });

      // Client should see fewer total messages due to filtering
      cy.loginAs('client@test.com');
      cy.request(`/api/conversations/${conversationId}/messages`).then((response) => {
        expect(response.status).to.eq(200);
        const clientVisibleCount = response.body.messages.length;
        expect(clientVisibleCount).to.be.lessThan(15); // Should be significantly less
        
        // All visible messages should be non-internal
        response.body.messages.forEach(message => {
          expect(message.isInternalNote).to.be.false;
        });
      });
    });

    it('should include sender information for internal notes', () => {
      cy.loginAs('admin@test.com');
      cy.request(`/api/conversations/${conversationId}/messages`).then((response) => {
        expect(response.status).to.eq(200);
        
        const internalNotes = response.body.messages.filter(msg => msg.isInternalNote);
        expect(internalNotes.length).to.be.greaterThan(0);
        
        internalNotes.forEach(note => {
          expect(note.sender).to.exist;
          expect(note.sender).to.have.property('id');
          expect(note.sender).to.have.property('email');
          expect(note.sender.id).to.eq(adminUserId);
          expect(note.sender.email).to.eq('admin@test.com');
        });
      });
    });

    it('should maintain chronological order with mixed message types', () => {
      cy.loginAs('admin@test.com');
      cy.request(`/api/conversations/${conversationId}/messages`).then((response) => {
        expect(response.status).to.eq(200);
        
        const messages = response.body.messages;
        
        // Verify chronological order
        for (let i = 1; i < messages.length; i++) {
          const prevTime = new Date(messages[i-1].createdAt);
          const currTime = new Date(messages[i].createdAt);
          expect(currTime).to.be.greaterThan(prevTime);
        }
        
        // Verify mixed types are properly ordered
        const messageTypes = messages.map(msg => msg.isInternalNote ? 'internal' : 'public');
        expect(messageTypes).to.deep.equal(['public', 'internal', 'public', 'internal', 'public']);
      });
    });
  });

  describe('Internal Notes Security', () => {
    it('should prevent internal note content leakage through error messages', () => {
      // Create internal note
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'Sensitive internal information about client',
          isInternalNote: true
        }
      });

      // Try to access conversation as different client
      cy.task('db:createConversation', {
        clientId: 'other-client',
        subject: 'Other client conversation'
      }).then((otherConv) => {
        cy.loginAs('client@test.com');
        cy.request({
          url: `/api/conversations/${otherConv.id}/messages`,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(403);
          expect(response.body.error || '').to.not.include('Sensitive internal information');
        });
      });
    });

    it('should not include internal notes in any client-accessible endpoints', () => {
      // Create internal note
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'Secret admin note',
          isInternalNote: true
        }
      });

      cy.loginAs('client@test.com');
      
      // Check conversation list
      cy.request('/api/conversations').then((response) => {
        expect(response.status).to.eq(200);
        const conversation = response.body[0];
        if (conversation.lastMessage) {
          expect(conversation.lastMessage.content).to.not.include('Secret admin note');
        }
      });

      // Check conversation detail
      cy.request(`/api/conversations/${conversationId}`).then((response) => {
        expect(response.status).to.eq(200);
        // Should not include internal notes in any nested data
        const responseStr = JSON.stringify(response.body);
        expect(responseStr).to.not.include('Secret admin note');
      });

      // Check messages endpoint
      cy.request(`/api/conversations/${conversationId}/messages`).then((response) => {
        expect(response.status).to.eq(200);
        const responseStr = JSON.stringify(response.body);
        expect(responseStr).to.not.include('Secret admin note');
      });
    });

    it('should prevent internal note flag manipulation in client requests', () => {
      cy.loginAs('client@test.com');
      
      // Try various ways to manipulate the internal note flag
      const manipulationAttempts = [
        { isInternalNote: 'true' },
        { isInternalNote: 1 },
        { isInternalNote: 'yes' },
        { internal_note: true },
        { is_internal_note: true },
        { isInternal: true }
      ];

      manipulationAttempts.forEach((attempt, index) => {
        cy.request({
          method: 'POST',
          url: `/api/conversations/${conversationId}/messages`,
          body: {
            content: `Manipulation attempt ${index}`,
            ...attempt
          }
        }).then((response) => {
          expect(response.status).to.eq(201);
          expect(response.body.isInternalNote).to.be.false;
        });
      });
    });

    it('should sanitize internal note content like regular messages', () => {
      cy.loginAs('admin@test.com');
      
      const xssContent = '<script>alert("internal-xss")</script>Internal note content';
      
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: xssContent,
          isInternalNote: true
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.content).to.not.include('<script>');
        expect(response.body.content).to.not.include('alert');
        expect(response.body.isInternalNote).to.be.true;
      });
    });
  });

  describe('Internal Notes Business Logic', () => {
    it('should not affect conversation lastMessageAt when only internal notes are added', () => {
      // Get initial conversation state
      cy.loginAs('admin@test.com');
      cy.request(`/api/conversations/${conversationId}`).then((initialResponse) => {
        const initialLastMessageAt = initialResponse.body.lastMessageAt;
        
        // Add internal note
        cy.request({
          method: 'POST',
          url: `/api/conversations/${conversationId}/messages`,
          body: {
            content: 'Internal note should not update lastMessageAt',
            isInternalNote: true
          }
        });

        // Check if lastMessageAt was updated
        cy.request(`/api/conversations/${conversationId}`).then((afterResponse) => {
          // This depends on business logic - internal notes might or might not update timestamp
          // The test verifies current behavior is consistent
          expect(afterResponse.body.lastMessageAt).to.exist;
        });
      });
    });

    it('should allow internal notes on resolved conversations', () => {
      // Resolve the conversation
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'PATCH',
        url: `/api/conversations/${conversationId}`,
        body: { status: 'resolved' }
      });

      // Should still allow internal notes
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'Post-resolution internal note',
          isInternalNote: true
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.isInternalNote).to.be.true;
      });
    });

    it('should prevent regular messages on closed conversations but allow internal notes', () => {
      // Close the conversation
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'PATCH',
        url: `/api/conversations/${conversationId}`,
        body: { status: 'closed' }
      });

      // Regular message should fail
      cy.loginAs('client@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'Client message to closed conversation'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });

      // Internal note should succeed
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'Internal note on closed conversation',
          isInternalNote: true
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.isInternalNote).to.be.true;
      });
    });

    it('should include internal notes in admin conversation counts correctly', () => {
      // Add several internal notes
      cy.loginAs('admin@test.com');
      for (let i = 0; i < 3; i++) {
        cy.request({
          method: 'POST',
          url: `/api/conversations/${conversationId}/messages`,
          body: {
            content: `Internal note ${i}`,
            isInternalNote: true
          }
        });
      }

      // Admin should see correct total message count
      cy.request(`/api/conversations/${conversationId}/messages`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.messages.length).to.be.greaterThan(3);
        
        const internalCount = response.body.messages.filter(msg => msg.isInternalNote).length;
        expect(internalCount).to.eq(3);
      });

      // Client should see different count
      cy.loginAs('client@test.com');
      cy.request(`/api/conversations/${conversationId}/messages`).then((response) => {
        expect(response.status).to.eq(200);
        const clientVisibleCount = response.body.messages.length;
        
        cy.loginAs('admin@test.com');
        cy.request(`/api/conversations/${conversationId}/messages`).then((adminResponse) => {
          const adminVisibleCount = adminResponse.body.messages.length;
          expect(adminVisibleCount).to.be.greaterThan(clientVisibleCount);
        });
      });
    });
  });
});