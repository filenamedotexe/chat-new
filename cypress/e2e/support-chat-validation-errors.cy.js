describe('Support Chat API - Validation & Error Handling (Section 1.3)', () => {
  let conversationId;
  let clientUserId = '550e8400-e29b-41d4-a716-446655440021';
  let adminUserId = '550e8400-e29b-41d4-a716-446655440022';

  beforeEach(() => {
    cy.task('db:reset');
    
    cy.task('db:seed', {
      users: [
        { id: clientUserId, email: 'client@test.com', role: 'client' },
        { id: adminUserId, email: 'admin@test.com', role: 'admin' }
      ]
    });

    cy.task('db:createConversation', {
      clientId: clientUserId,
      subject: 'Test Conversation'
    }).then((conv) => {
      conversationId = conv.id;
    });
  });

  describe('POST /api/conversations - Validation', () => {
    it('should validate required fields', () => {
      cy.loginAs('client@test.com');
      
      // Missing subject
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          message: 'Valid message'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('subject');
      });

      // Missing message
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: 'Valid subject'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('message');
      });

      // Missing both
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {},
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('subject');
      });
    });

    it('should validate subject length constraints', () => {
      cy.loginAs('client@test.com');
      
      // Empty subject
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: '',
          message: 'Valid message'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('subject');
      });

      // Subject too long (assuming 200 char limit)
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: 'a'.repeat(201),
          message: 'Valid message'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('subject');
      });

      // Valid subject length
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: 'Valid subject within limits',
          message: 'Valid message'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
      });
    });

    it('should validate message content constraints', () => {
      cy.loginAs('client@test.com');
      
      // Empty message
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: 'Valid subject',
          message: ''
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('message');
      });

      // Message too long (1000 char limit as per plan)
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: 'Valid subject',
          message: 'a'.repeat(1001)
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('message');
      });

      // Valid message at limit
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: 'Valid subject',
          message: 'a'.repeat(1000)
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
      });
    });

    it('should validate data types', () => {
      cy.loginAs('client@test.com');
      
      // Subject as number
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: 12345,
          message: 'Valid message'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });

      // Message as array
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: 'Valid subject',
          message: ['invalid', 'array']
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });

      // Subject as object
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: { invalid: 'object' },
          message: 'Valid message'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('should sanitize HTML and prevent XSS', () => {
      cy.loginAs('client@test.com');
      
      const xssPayloads = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert(document.cookie)',
        '<svg onload="alert(1)">',
        '"><script>alert(String.fromCharCode(88,83,83))</script>'
      ];

      xssPayloads.forEach((payload, index) => {
        cy.request({
          method: 'POST',
          url: '/api/conversations',
          body: {
            subject: `XSS Test ${index}`,
            message: payload
          }
        }).then((response) => {
          expect(response.status).to.eq(201);
          // Message should be sanitized or escaped
          expect(response.body.message || '').to.not.include('<script>');
          expect(response.body.message || '').to.not.include('javascript:');
          expect(response.body.message || '').to.not.include('onerror=');
        });
      });
    });

    it('should reject malformed JSON', () => {
      cy.loginAs('client@test.com');
      
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: 'invalid json string',
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('Invalid JSON');
      });
    });

    it('should handle special characters and unicode', () => {
      cy.loginAs('client@test.com');
      
      const specialChars = [
        '🎉 Emoji test message',
        'Unicode: café, naïve, résumé',
        'Special chars: !@#$%^&*()_+-={}[]|\\:";\'<>?,./',
        'Newlines\nand\ttabs',
        'Zero-width: ​‌‍'
      ];

      specialChars.forEach((content, index) => {
        cy.request({
          method: 'POST',
          url: '/api/conversations',
          body: {
            subject: `Special chars test ${index}`,
            message: content
          }
        }).then((response) => {
          expect(response.status).to.eq(201);
          // Should preserve safe special characters
        });
      });
    });
  });

  describe('PATCH /api/conversations/[id] - Validation', () => {
    it('should validate status enum values', () => {
      cy.loginAs('admin@test.com');
      
      const invalidStatuses = ['invalid', 'OPEN', 'pending', '', null, 123];
      
      invalidStatuses.forEach(status => {
        cy.request({
          method: 'PATCH',
          url: `/api/conversations/${conversationId}`,
          body: { status },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.error).to.include('status');
        });
      });

      // Valid statuses
      const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
      
      validStatuses.forEach(status => {
        cy.request({
          method: 'PATCH',
          url: `/api/conversations/${conversationId}`,
          body: { status }
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.status).to.eq(status);
        });
      });
    });

    it('should validate priority enum values', () => {
      cy.loginAs('admin@test.com');
      
      const invalidPriorities = ['urgent', 'NORMAL', 'medium', '', null, 123];
      
      invalidPriorities.forEach(priority => {
        cy.request({
          method: 'PATCH',
          url: `/api/conversations/${conversationId}`,
          body: { priority },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.error).to.include('priority');
        });
      });

      // Valid priorities
      const validPriorities = ['low', 'normal', 'high'];
      
      validPriorities.forEach(priority => {
        cy.request({
          method: 'PATCH',
          url: `/api/conversations/${conversationId}`,
          body: { priority }
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.priority).to.eq(priority);
        });
      });
    });

    it('should validate assignedTo user exists', () => {
      cy.loginAs('admin@test.com');
      
      // Non-existent user ID
      cy.request({
        method: 'PATCH',
        url: `/api/conversations/${conversationId}`,
        body: {
          assignedTo: 'non-existent-user-id'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('assignedTo');
      });

      // Valid user ID
      cy.request({
        method: 'PATCH',
        url: `/api/conversations/${conversationId}`,
        body: {
          assignedTo: adminUserId
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.assignedTo).to.eq(adminUserId);
      });

      // Null to unassign
      cy.request({
        method: 'PATCH',
        url: `/api/conversations/${conversationId}`,
        body: {
          assignedTo: null
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.assignedTo).to.be.null;
      });
    });

    it('should reject invalid conversation IDs', () => {
      cy.loginAs('admin@test.com');
      
      const invalidIds = [
        'invalid-uuid',
        '123',
        '',
        'not-a-uuid-at-all',
        '00000000-0000-0000-0000-000000000000'
      ];

      invalidIds.forEach(id => {
        cy.request({
          method: 'PATCH',
          url: `/api/conversations/${id}`,
          body: { status: 'in_progress' },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 404]);
        });
      });
    });

    it('should handle empty patch body', () => {
      cy.loginAs('admin@test.com');
      
      cy.request({
        method: 'PATCH',
        url: `/api/conversations/${conversationId}`,
        body: {}
      }).then((response) => {
        expect(response.status).to.eq(200);
        // Should return unchanged conversation
      });
    });

    it('should ignore unknown fields', () => {
      cy.loginAs('admin@test.com');
      
      cy.request({
        method: 'PATCH',
        url: `/api/conversations/${conversationId}`,
        body: {
          status: 'in_progress',
          unknownField: 'should be ignored',
          hackerField: '<script>alert("xss")</script>',
          id: 'should-not-change-id',
          clientId: 'should-not-change-client'
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.status).to.eq('in_progress');
        expect(response.body.id).to.eq(conversationId);
        expect(response.body.clientId).to.eq(clientUserId);
        expect(response.body).to.not.have.property('unknownField');
        expect(response.body).to.not.have.property('hackerField');
      });
    });
  });

  describe('POST /api/conversations/[id]/messages - Validation', () => {
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
        expect(response.body.error).to.include('content');
      });

      // Content too long
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'a'.repeat(1001)
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('content');
      });

      // Valid content at limit
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'a'.repeat(1000)
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
      });
    });

    it('should validate content is required', () => {
      cy.loginAs('client@test.com');
      
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {},
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('content');
      });
    });

    it('should validate content data type', () => {
      cy.loginAs('client@test.com');
      
      const invalidTypes = [123, [], {}, null, true];
      
      invalidTypes.forEach(content => {
        cy.request({
          method: 'POST',
          url: `/api/conversations/${conversationId}/messages`,
          body: { content },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
        });
      });
    });

    it('should validate fileIds array', () => {
      cy.loginAs('client@test.com');
      
      // Invalid fileIds format
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'Valid message',
          fileIds: 'not-an-array'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('fileIds');
      });

      // Valid fileIds array
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'Message with files',
          fileIds: ['file-1', 'file-2']
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.fileIds).to.deep.equal(['file-1', 'file-2']);
      });

      // Empty fileIds array
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: 'Message without files',
          fileIds: []
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.fileIds).to.deep.equal([]);
      });
    });

    it('should prevent sending to non-existent conversations', () => {
      cy.loginAs('client@test.com');
      
      cy.request({
        method: 'POST',
        url: '/api/conversations/non-existent-id/messages',
        body: {
          content: 'Message to nowhere'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it('should prevent sending to closed conversations', () => {
      // Close the conversation first
      cy.loginAs('admin@test.com');
      cy.request({
        method: 'PATCH',
        url: `/api/conversations/${conversationId}`,
        body: { status: 'closed' }
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
        expect(response.body.error).to.include('closed');
      });
    });

    it('should sanitize message content', () => {
      cy.loginAs('client@test.com');
      
      const xssContent = '<script>alert("xss")</script>Hello world';
      
      cy.request({
        method: 'POST',
        url: `/api/conversations/${conversationId}/messages`,
        body: {
          content: xssContent
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.content).to.not.include('<script>');
        expect(response.body.content).to.not.include('alert');
      });
    });

    it('should handle rate limiting', () => {
      cy.loginAs('client@test.com');
      
      // Send multiple messages rapidly
      const requests = [];
      for (let i = 0; i < 15; i++) { // Assuming 10/minute rate limit
        requests.push(
          cy.request({
            method: 'POST',
            url: `/api/conversations/${conversationId}/messages`,
            body: {
              content: `Rapid message ${i}`
            },
            failOnStatusCode: false
          })
        );
      }

      let successCount = 0;
      let rateLimitedCount = 0;

      requests.forEach(req => {
        req.then((response) => {
          if (response.status === 201) {
            successCount++;
          } else if (response.status === 429) {
            rateLimitedCount++;
            expect(response.body.error).to.include('rate limit');
          }
        });
      });

      // Should have some rate limiting after 10 messages
      cy.then(() => {
        expect(rateLimitedCount).to.be.greaterThan(0);
      });
    });
  });

  describe('GET Endpoints - Validation', () => {
    it('should validate pagination parameters', () => {
      cy.loginAs('admin@test.com');
      
      // Invalid page numbers
      const invalidPages = [-1, 0, 'abc', 1.5, null];
      
      invalidPages.forEach(page => {
        cy.request({
          url: `/api/conversations/${conversationId}/messages?page=${page}`,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([200, 400]); // Some might default to page 1
        });
      });

      // Invalid limit values
      const invalidLimits = [-1, 0, 'xyz', 1001, null]; // Assuming max limit of 100
      
      invalidLimits.forEach(limit => {
        cy.request({
          url: `/api/conversations/${conversationId}/messages?limit=${limit}`,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([200, 400]); // Some might default
        });
      });

      // Valid pagination
      cy.request(`/api/conversations/${conversationId}/messages?page=1&limit=10`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.pagination).to.have.property('page', 1);
        expect(response.body.pagination).to.have.property('limit', 10);
      });
    });

    it('should handle invalid conversation IDs gracefully', () => {
      cy.loginAs('admin@test.com');
      
      const invalidIds = [
        'not-a-uuid',
        '',
        '123',
        'null',
        'undefined',
        '../../../etc/passwd'
      ];

      invalidIds.forEach(id => {
        cy.request({
          url: `/api/conversations/${id}`,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 404]);
        });

        cy.request({
          url: `/api/conversations/${id}/messages`,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 404]);
        });
      });
    });
  });

  describe('Error Response Format', () => {
    it('should return consistent error format', () => {
      cy.loginAs('client@test.com');
      
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: '',
          message: 'Valid message'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.be.a('string');
        expect(response.body).to.have.property('code');
        expect(response.body).to.have.property('timestamp');
      });
    });

    it('should not leak sensitive information in errors', () => {
      cy.loginAs('client@test.com');
      
      cy.request({
        method: 'POST',
        url: '/api/conversations/sql-injection-test/messages',
        body: {
          content: "'; DROP TABLE conversations; --"
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 404]);
        expect(response.body.error || '').to.not.include('database');
        expect(response.body.error || '').to.not.include('SQL');
        expect(response.body.error || '').to.not.include('table');
        expect(response.body.error || '').to.not.include('DROP');
      });
    });

    it('should provide helpful validation messages', () => {
      cy.loginAs('client@test.com');
      
      cy.request({
        method: 'POST',
        url: '/api/conversations',
        body: {
          subject: 'a'.repeat(201),
          message: ''
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('subject');
        expect(response.body.error).to.include('message');
        // Should indicate what's wrong, not just "validation failed"
      });
    });
  });
});