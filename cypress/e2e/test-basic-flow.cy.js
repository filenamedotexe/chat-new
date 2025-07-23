describe('Basic Flow Test', () => {
  it('should login and navigate', () => {
    // Visit and login
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Wait for dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
    cy.screenshot('basic-1-dashboard');
    
    // Check projects
    cy.contains('Projects').click();
    cy.url().should('include', '/projects');
    cy.screenshot('basic-2-projects');
    
    // Check what buttons exist
    cy.get('button').then($buttons => {
      const buttonTexts = [];
      $buttons.each((i, el) => {
        const text = el.innerText;
        if (text) buttonTexts.push(text);
      });
      cy.log('Found buttons:', buttonTexts);
    });
    
    // Check organizations
    cy.contains('Organizations').click();
    cy.url().should('include', '/organizations');
    cy.screenshot('basic-3-organizations');
    
    // Check what's on the page
    cy.get('body').then($body => {
      cy.log('Page contains:', $body.text().substring(0, 200));
    });
    
    cy.log('✅ Basic navigation complete');
  });
});