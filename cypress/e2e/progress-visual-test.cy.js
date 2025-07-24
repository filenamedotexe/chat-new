describe('Progress Visual Test', () => {
  it('should display progress percentage on project cards', () => {
    // Login as admin
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Navigate to projects page
    cy.visit('/projects');
    cy.contains('h1', 'Projects').should('be.visible');
    
    // Wait for project cards to load
    cy.wait(1000);
    
    // Check if progress is displayed
    cy.get('.grid').first().within(() => {
      // Look for the Progress label and percentage
      cy.contains('Progress').should('be.visible');
      
      // Should show percentage (could be 0% or any value)
      cy.get('p').then($paragraphs => {
        const texts = Array.from($paragraphs).map(p => p.textContent);
        const hasPercentage = texts.some(text => text?.includes('%'));
        
        if (hasPercentage) {
          cy.log('✅ Progress percentage is displayed on project cards');
          const percentageText = texts.find(text => text?.includes('%'));
          cy.log('Found progress:', percentageText);
        } else {
          cy.log('❌ No progress percentage found');
        }
        
        expect(hasPercentage).to.be.true;
      });
    });
  });
});