describe('Chat System Debug', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should find and click Team Chat button', () => {
    // Go to projects
    cy.visit('/projects');
    
    // Debug: Log what we see
    cy.get('body').then($body => {
      cy.log('Body HTML:', $body.html());
    });
    
    // Click on first project link
    cy.get('a[href^="/projects/"]').first().then($link => {
      cy.log('Project link found:', $link.attr('href'));
      cy.wrap($link).click();
    });
    
    // Wait for project page to load
    cy.url().should('match', /\/projects\/[^\/]+$/);
    
    // Debug: Check what's on the project page
    cy.get('body').then($body => {
      if ($body.text().includes('Team Chat')) {
        cy.log('Team Chat button found');
      } else {
        cy.log('Team Chat button NOT found');
        cy.log('Page text:', $body.text());
      }
    });
    
    // Try to find Team Chat button
    cy.contains('Team Chat').should('be.visible');
  });
});