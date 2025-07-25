describe('Responsive Check', () => {
  // Just check the login page for now
  const viewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone X', width: 375, height: 812 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];

  viewports.forEach(viewport => {
    it(`should render login page properly on ${viewport.name}`, () => {
      cy.viewport(viewport.width, viewport.height);
      cy.visit('/login');
      
      // Check no horizontal overflow
      cy.get('body').then($body => {
        const bodyWidth = $body.width();
        const scrollWidth = $body[0].scrollWidth;
        cy.log(`Body width: ${bodyWidth}, Scroll width: ${scrollWidth}`);
        expect(scrollWidth).to.be.lte(bodyWidth + 1);
      });
      
      // Check main container
      cy.get('.mx-auto').should('be.visible');
      
      // Check form elements
      cy.get('input#email').should('be.visible');
      cy.get('input#password').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
      
      // On mobile, check padding
      if (viewport.width < 640) {
        cy.get('.px-4').should('have.css', 'padding-left', '16px');
        cy.get('.px-4').should('have.css', 'padding-right', '16px');
      }
    });
  });
});