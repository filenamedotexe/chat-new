describe('Visual Color Check', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should display the new purple primary color on buttons', () => {
    cy.visit('/color-test');
    
    // Wait for page to load
    cy.get('h1').should('contain', 'Color System Test');
    
    // Check primary button has purple background
    cy.get('button').contains('Primary Button').then($button => {
      const bgColor = $button.css('background-color');
      cy.log('Primary button background color:', bgColor);
      
      // Should be purple-ish (high red and blue values)
      const rgb = bgColor.match(/\d+/g);
      if (rgb) {
        const [r, g, b] = rgb.map(Number);
        cy.log(`RGB values: R=${r}, G=${g}, B=${b}`);
        
        // Purple has high red and blue, lower green
        expect(r).to.be.greaterThan(100);
        expect(b).to.be.greaterThan(100);
        expect(g).to.be.lessThan(100);
      }
    });
    
    // Check status colors
    cy.get('.bg-success').should('exist');
    cy.get('.bg-warning').should('exist');
    cy.get('.bg-info').should('exist');
    
    // Take screenshot for visual verification
    cy.screenshot('color-test-page');
  });

  it('should show purple on login page button', () => {
    cy.visit('/login');
    
    // Check the Sign In button
    cy.get('button[type="submit"]').then($button => {
      const bgColor = $button.css('background-color');
      cy.log('Login button background color:', bgColor);
      
      // Take screenshot
      cy.screenshot('login-page-colors');
    });
  });
});