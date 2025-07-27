describe('Support Chat API - Pagination Testing (Section 1.3)', () => {
  let conversationId;
  let clientUserId = 'client-1';
  let adminUserId = 'admin-1';

  beforeEach(() => {
    cy.task('db:reset');
    
    cy.task('db:seed', {
      users: [
        { id: clientUserId, email: 'client@test.com', role: 'client' },
        { id: adminUserId, email: 'admin@test.com', role: 'admin' }
      ]
    });

    // Create conversation with many messages for pagination testing
    cy.task('db:createConversationWithMessages', {
      clientId: clientUserId,
      subject: 'Pagination Test Conversation',
      messageCount: 55, // Enough for multiple pages
      includeInternalNotes: true,
      internalNoteCount: 20
    }).then((conv) => {
      conversationId = conv.id;
    });
  });

  describe('Basic Pagination', () => {
    it('should return correct page structure', () => {
      cy.loginAs('admin@test.com');
      cy.request(`/api/conversations/${conversationId}/messages?page=1&limit=10`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('messages');
        expect(response.body).to.have.property('pagination');
        
        const pagination = response.body.pagination;
        expect(pagination).to.have.property('page', 1);
        expect(pagination).to.have.property('limit', 10);
        expect(pagination).to.have.property('total');
        expect(pagination).to.have.property('totalPages');
        expect(pagination).to.have.property('hasNext');
        expect(pagination).to.have.property('hasPrev');
      });
    });

    it('should return correct number of messages per page', () => {
      cy.loginAs('admin@test.com');
      
      const pageSizes = [5, 10, 20, 50];
      
      pageSizes.forEach(limit => {
        cy.request(`/api/conversations/${conversationId}/messages?page=1&limit=${limit}`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.messages).to.have.length.at.most(limit);
          expect(response.body.pagination.limit).to.eq(limit);
        });
      });
    });

    it('should handle default pagination parameters', () => {
      cy.loginAs('admin@test.com');
      
      // No pagination params
      cy.request(`/api/conversations/${conversationId}/messages`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.pagination).to.have.property('page');
        expect(response.body.pagination).to.have.property('limit');
        // Should use sensible defaults (e.g., page=1, limit=20)
      });

      // Only page param
      cy.request(`/api/conversations/${conversationId}/messages?page=2`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.pagination.page).to.eq(2);
        expect(response.body.pagination).to.have.property('limit');
      });

      // Only limit param
      cy.request(`/api/conversations/${conversationId}/messages?limit=15`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.pagination.limit).to.eq(15);
        expect(response.body.pagination).to.have.property('page');
      });
    });

    it('should calculate total pages correctly', () => {
      cy.loginAs('admin@test.com');
      cy.request(`/api/conversations/${conversationId}/messages?page=1&limit=10`).then((response) => {
        expect(response.status).to.eq(200);
        
        const { total, limit, totalPages } = response.body.pagination;
        const expectedTotalPages = Math.ceil(total / limit);
        
        expect(totalPages).to.eq(expectedTotalPages);
        expect(total).to.be.greaterThan(50); // We created 55+ messages
      });
    });

    it('should set hasNext and hasPrev correctly', () => {
      cy.loginAs('admin@test.com');
      
      // First page
      cy.request(`/api/conversations/${conversationId}/messages?page=1&limit=10`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.pagination.hasPrev).to.be.false;
        expect(response.body.pagination.hasNext).to.be.true;
      });

      // Middle page
      cy.request(`/api/conversations/${conversationId}/messages?page=3&limit=10`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.pagination.hasPrev).to.be.true;
        expect(response.body.pagination.hasNext).to.be.true;
      });

      // Last page
      cy.request(`/api/conversations/${conversationId}/messages?page=1&limit=10`).then((firstResponse) => {
        const totalPages = firstResponse.body.pagination.totalPages;
        
        cy.request(`/api/conversations/${conversationId}/messages?page=${totalPages}&limit=10`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.pagination.hasPrev).to.be.true;
          expect(response.body.pagination.hasNext).to.be.false;
        });
      });
    });
  });

  describe('Pagination Validation', () => {
    it('should handle invalid page numbers', () => {
      cy.loginAs('admin@test.com');
      
      // Negative page
      cy.request(`/api/conversations/${conversationId}/messages?page=-1&limit=10`).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
        if (response.status === 200) {
          // Should default to page 1
          expect(response.body.pagination.page).to.be.greaterThan(0);
        }
      });

      // Zero page
      cy.request(`/api/conversations/${conversationId}/messages?page=0&limit=10`).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
        if (response.status === 200) {
          expect(response.body.pagination.page).to.be.greaterThan(0);
        }
      });

      // Non-numeric page
      cy.request({
        url: `/api/conversations/${conversationId}/messages?page=abc&limit=10`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });

      // Decimal page
      cy.request(`/api/conversations/${conversationId}/messages?page=2.5&limit=10`).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
        if (response.status === 200) {
          expect(response.body.pagination.page).to.be.a('number');
          expect(response.body.pagination.page % 1).to.eq(0); // Should be integer
        }
      });
    });

    it('should handle invalid limit values', () => {
      cy.loginAs('admin@test.com');
      
      // Negative limit
      cy.request({
        url: `/api/conversations/${conversationId}/messages?page=1&limit=-5`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
        if (response.status === 200) {
          expect(response.body.pagination.limit).to.be.greaterThan(0);
        }
      });

      // Zero limit
      cy.request({
        url: `/api/conversations/${conversationId}/messages?page=1&limit=0`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
        if (response.status === 200) {
          expect(response.body.pagination.limit).to.be.greaterThan(0);
        }
      });

      // Excessive limit
      cy.request({
        url: `/api/conversations/${conversationId}/messages?page=1&limit=1000`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
        if (response.status === 200) {
          expect(response.body.pagination.limit).to.be.lessThan(1000); // Should be capped
        }
      });

      // Non-numeric limit
      cy.request({
        url: `/api/conversations/${conversationId}/messages?page=1&limit=xyz`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('should handle page beyond available data', () => {
      cy.loginAs('admin@test.com');
      
      // Get total pages first
      cy.request(`/api/conversations/${conversationId}/messages?page=1&limit=10`).then((firstResponse) => {
        const totalPages = firstResponse.body.pagination.totalPages;
        const beyondLastPage = totalPages + 5;
        
        cy.request(`/api/conversations/${conversationId}/messages?page=${beyondLastPage}&limit=10`).then((response) => {
          expect(response.status).to.be.oneOf([200, 404]);
          if (response.status === 200) {
            expect(response.body.messages).to.have.length(0);
            expect(response.body.pagination.hasNext).to.be.false;
          }
        });
      });
    });
  });

  describe('Pagination with Filtering (Internal Notes)', () => {
    it('should paginate correctly for admin users (with internal notes)', () => {
      cy.loginAs('admin@test.com');
      
      cy.request(`/api/conversations/${conversationId}/messages?page=1&limit=10`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.messages).to.have.length(10);
        
        // Should include both regular messages and internal notes
        const hasInternalNotes = response.body.messages.some(msg => msg.isInternalNote);
        const hasRegularMessages = response.body.messages.some(msg => !msg.isInternalNote);
        
        expect(hasInternalNotes).to.be.true;
        expect(hasRegularMessages).to.be.true;
        
        // Total should include all messages
        expect(response.body.pagination.total).to.be.greaterThan(50);
      });
    });

    it('should paginate correctly for client users (filtered)', () => {
      cy.loginAs('client@test.com');
      
      cy.request(`/api/conversations/${conversationId}/messages?page=1&limit=10`).then((clientResponse) => {
        expect(clientResponse.status).to.eq(200);
        
        // Should only include non-internal messages
        clientResponse.body.messages.forEach(message => {
          expect(message.isInternalNote).to.be.false;
        });
        
        // Total should be less than admin total
        cy.loginAs('admin@test.com');
        cy.request(`/api/conversations/${conversationId}/messages?page=1&limit=10`).then((adminResponse) => {
          expect(clientResponse.body.pagination.total).to.be.lessThan(adminResponse.body.pagination.total);
        });
      });
    });

    it('should maintain consistent pagination across role-filtered views', () => {
      cy.loginAs('client@test.com');
      
      // Get first page
      cy.request(`/api/conversations/${conversationId}/messages?page=1&limit=5`).then((page1Response) => {
        expect(page1Response.status).to.eq(200);
        const page1Ids = page1Response.body.messages.map(msg => msg.id);
        
        // Get second page
        cy.request(`/api/conversations/${conversationId}/messages?page=2&limit=5`).then((page2Response) => {
          expect(page2Response.status).to.eq(200);
          const page2Ids = page2Response.body.messages.map(msg => msg.id);
          
          // No overlap between pages
          const overlap = page1Ids.filter(id => page2Ids.includes(id));
          expect(overlap).to.have.length(0);
          
          // All messages should be non-internal
          [...page1Response.body.messages, ...page2Response.body.messages].forEach(message => {
            expect(message.isInternalNote).to.be.false;
          });
        });
      });
    });

    it('should handle edge cases with filtering', () => {
      // Create conversation with only internal notes
      cy.task('db:createConversation', {
        clientId: clientUserId,
        subject: 'Internal Notes Only'
      }).then((conv) => {
        // Add only internal notes
        cy.loginAs('admin@test.com');
        for (let i = 0; i < 5; i++) {
          cy.request({
            method: 'POST',
            url: `/api/conversations/${conv.id}/messages`,
            body: {
              content: `Internal note ${i}`,
              isInternalNote: true
            }
          });
        }
        
        // Client should see empty result
        cy.loginAs('client@test.com');
        cy.request(`/api/conversations/${conv.id}/messages`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.messages).to.have.length(0);
          expect(response.body.pagination.total).to.eq(0);
        });
        
        // Admin should see all
        cy.loginAs('admin@test.com');
        cy.request(`/api/conversations/${conv.id}/messages`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.messages).to.have.length(5);
          expect(response.body.pagination.total).to.eq(5);
        });
      });
    });
  });

  describe('Pagination Performance', () => {
    it('should handle large page sizes efficiently', () => {
      cy.loginAs('admin@test.com');
      
      const startTime = Date.now();
      cy.request(`/api/conversations/${conversationId}/messages?page=1&limit=50`).then((response) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        expect(response.status).to.eq(200);
        expect(response.body.messages.length).to.be.lessThanOrEqual(50);
        expect(responseTime).to.be.lessThan(2000); // Should respond within 2 seconds
      });
    });

    it('should handle deep pagination efficiently', () => {
      cy.loginAs('admin@test.com');
      
      // Get a page deep in the results
      cy.request(`/api/conversations/${conversationId}/messages?page=1&limit=10`).then((firstResponse) => {
        const totalPages = firstResponse.body.pagination.totalPages;
        const deepPage = Math.max(1, totalPages - 1);
        
        const startTime = Date.now();
        cy.request(`/api/conversations/${conversationId}/messages?page=${deepPage}&limit=10`).then((response) => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          expect(response.status).to.eq(200);
          expect(responseTime).to.be.lessThan(3000); // Should still be reasonable
        });
      });
    });

    it('should cache or optimize repeated pagination requests', () => {
      cy.loginAs('admin@test.com');
      
      // First request
      const startTime1 = Date.now();
      cy.request(`/api/conversations/${conversationId}/messages?page=1&limit=10`).then((response1) => {
        const endTime1 = Date.now();
        const responseTime1 = endTime1 - startTime1;
        
        expect(response1.status).to.eq(200);
        
        // Immediate repeated request
        const startTime2 = Date.now();
        cy.request(`/api/conversations/${conversationId}/messages?page=1&limit=10`).then((response2) => {
          const endTime2 = Date.now();
          const responseTime2 = endTime2 - startTime2;
          
          expect(response2.status).to.eq(200);
          expect(response2.body).to.deep.equal(response1.body);
          
          // Second request might be faster due to caching
          // This is optional behavior, so we just log the times
          cy.log(`First request: ${responseTime1}ms, Second request: ${responseTime2}ms`);
        });
      });
    });
  });

  describe('Pagination Data Consistency', () => {
    it('should maintain message order across pages', () => {
      cy.loginAs('admin@test.com');
      
      // Get first two pages
      cy.request(`/api/conversations/${conversationId}/messages?page=1&limit=10`).then((page1) => {
        cy.request(`/api/conversations/${conversationId}/messages?page=2&limit=10`).then((page2) => {
          expect(page1.status).to.eq(200);
          expect(page2.status).to.eq(200);
          
          if (page1.body.messages.length > 0 && page2.body.messages.length > 0) {
            const lastMessagePage1 = page1.body.messages[page1.body.messages.length - 1];
            const firstMessagePage2 = page2.body.messages[0];
            
            // Page 2 first message should be after page 1 last message
            expect(new Date(firstMessagePage2.createdAt)).to.be.greaterThan(
              new Date(lastMessagePage1.createdAt)
            );
          }
        });
      });
    });

    it('should handle concurrent pagination requests', () => {
      cy.loginAs('admin@test.com');
      
      // Send multiple concurrent pagination requests
      const requests = [];
      for (let page = 1; page <= 3; page++) {
        requests.push(
          cy.request(`/api/conversations/${conversationId}/messages?page=${page}&limit=5`)
        );
      }
      
      // All should succeed and return consistent data
      let allMessageIds = [];
      requests.forEach((req, index) => {
        req.then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.pagination.page).to.eq(index + 1);
          
          const messageIds = response.body.messages.map(msg => msg.id);
          allMessageIds = [...allMessageIds, ...messageIds];
        });
      });
      
      // No duplicate messages across pages
      cy.then(() => {
        const uniqueIds = [...new Set(allMessageIds)];
        expect(uniqueIds).to.have.length(allMessageIds.length);
      });
    });

    it('should handle real-time updates during pagination', () => {
      cy.loginAs('admin@test.com');
      
      // Get initial pagination state
      cy.request(`/api/conversations/${conversationId}/messages?page=1&limit=10`).then((initialResponse) => {
        const initialTotal = initialResponse.body.pagination.total;
        
        // Add a new message
        cy.request({
          method: 'POST',
          url: `/api/conversations/${conversationId}/messages`,
          body: {
            content: 'New message during pagination test'
          }
        });
        
        // Check pagination after new message
        cy.request(`/api/conversations/${conversationId}/messages?page=1&limit=10`).then((afterResponse) => {
          expect(afterResponse.status).to.eq(200);
          expect(afterResponse.body.pagination.total).to.eq(initialTotal + 1);
          
          // New message should appear in results (probably on first page)
          const newMessage = afterResponse.body.messages.find(msg => 
            msg.content === 'New message during pagination test'
          );
          expect(newMessage).to.exist;
        });
      });
    });
  });

  describe('Pagination Edge Cases', () => {
    it('should handle empty conversations', () => {
      cy.task('db:createConversation', {
        clientId: clientUserId,
        subject: 'Empty Conversation'
      }).then((conv) => {
        cy.loginAs('admin@test.com');
        cy.request(`/api/conversations/${conv.id}/messages?page=1&limit=10`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.messages).to.have.length(0);
          expect(response.body.pagination.total).to.eq(0);
          expect(response.body.pagination.totalPages).to.eq(0);
          expect(response.body.pagination.hasNext).to.be.false;
          expect(response.body.pagination.hasPrev).to.be.false;
        });
      });
    });

    it('should handle single message conversations', () => {
      cy.task('db:createConversation', {
        clientId: clientUserId,
        subject: 'Single Message Conversation'
      }).then((conv) => {
        cy.loginAs('client@test.com');
        cy.request({
          method: 'POST',
          url: `/api/conversations/${conv.id}/messages`,
          body: {
            content: 'Only message'
          }
        });
        
        cy.request(`/api/conversations/${conv.id}/messages?page=1&limit=10`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.messages).to.have.length(1);
          expect(response.body.pagination.total).to.eq(1);
          expect(response.body.pagination.totalPages).to.eq(1);
          expect(response.body.pagination.hasNext).to.be.false;
          expect(response.body.pagination.hasPrev).to.be.false;
        });
      });
    });

    it('should handle exact page boundary conditions', () => {
      cy.task('db:createConversation', {
        clientId: clientUserId,
        subject: 'Boundary Test'
      }).then((conv) => {
        // Create exactly 20 messages
        cy.loginAs('client@test.com');
        for (let i = 0; i < 20; i++) {
          cy.request({
            method: 'POST',
            url: `/api/conversations/${conv.id}/messages`,
            body: {
              content: `Message ${i + 1}`
            }
          });
        }
        
        // Test with limit of 10 (should be exactly 2 pages)
        cy.request(`/api/conversations/${conv.id}/messages?page=1&limit=10`).then((page1) => {
          expect(page1.status).to.eq(200);
          expect(page1.body.messages).to.have.length(10);
          expect(page1.body.pagination.totalPages).to.eq(2);
          expect(page1.body.pagination.hasNext).to.be.true;
          expect(page1.body.pagination.hasPrev).to.be.false;
        });
        
        cy.request(`/api/conversations/${conv.id}/messages?page=2&limit=10`).then((page2) => {
          expect(page2.status).to.eq(200);
          expect(page2.body.messages).to.have.length(10);
          expect(page2.body.pagination.hasNext).to.be.false;
          expect(page2.body.pagination.hasPrev).to.be.true;
        });
      });
    });
  });
});