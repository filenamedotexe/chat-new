describe('Progress API Tests', () => {
  it('should return progress data in projects API', () => {
    // Login first
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Get session cookie
    cy.getCookie('authjs.session-token').then(cookie => {
      // Make API request with auth cookie
      cy.request({
        url: '/api/projects/with-stats',
        headers: {
          Cookie: `authjs.session-token=${cookie?.value}`
        }
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        
        // Check if projects have progress data
        if (response.body.length > 0) {
          const firstProject = response.body[0];
          
          // Should have progress object
          expect(firstProject).to.have.property('progress');
          
          if (firstProject.progress) {
            // Check progress properties
            expect(firstProject.progress).to.have.property('totalTasks');
            expect(firstProject.progress).to.have.property('completedTasks');
            expect(firstProject.progress).to.have.property('progressPercentage');
            expect(firstProject.progress).to.have.property('isComplete');
            
            // Progress percentage should be between 0 and 100
            expect(firstProject.progress.progressPercentage).to.be.at.least(0);
            expect(firstProject.progress.progressPercentage).to.be.at.most(100);
            
            cy.log('Progress data:', JSON.stringify(firstProject.progress));
          }
        }
      });
    });
  });
});