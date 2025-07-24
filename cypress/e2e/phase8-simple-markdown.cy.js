describe('Simple Markdown Test', () => {
  it('should check if markdown is rendered', () => {
    // Login
    cy.visit('/login');
    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');

    // Go to chat
    cy.visit('/projects');
    cy.get('a[href^="/projects/"]').not('[href="/projects/new"]').first().click();
    cy.contains('Team Chat').click();
    
    // Clear any existing messages by sending a unique message
    const uniqueMessage = `Unique test ${Date.now()}`;
    cy.get('textarea[placeholder*="message"]').type(uniqueMessage);
    cy.get('button[aria-label="Send message"]').click();
    cy.wait(1500);
    
    // Now send a bold message
    cy.get('textarea[placeholder*="message"]').clear().type('This is **bold** text');
    cy.get('button[aria-label="Send message"]').click();
    
    // Wait for the message to be loaded and rendered
    cy.wait(2000);
    
    // Check if the text exists at all
    cy.contains('This is').should('exist');
    cy.contains('bold').should('exist');
    cy.contains('text').should('exist');
    
    // Look for any element containing the word "bold"
    cy.get('*:contains("bold")').then($elements => {
      cy.log(`Found ${$elements.length} elements containing "bold"`);
      
      // Check each element
      $elements.each((index, element) => {
        const $el = Cypress.$(element);
        cy.log(`Element ${index}: ${element.tagName}, text: ${$el.text()}, html: ${$el.html()}`);
        
        // Check if this element or its children have strong tag
        if ($el.find('strong').length > 0) {
          cy.log('Found strong tag in children!');
        }
        if (element.tagName === 'STRONG') {
          cy.log('This element IS a strong tag!');
        }
      });
    });
    
    // Try different selectors
    cy.get('.prose').should('exist').then($prose => {
      cy.log('Prose element HTML:', $prose.html());
    });
    
    // Check the entire message structure
    cy.get('[class*="rounded-lg"][class*="px-4"]').last().then($message => {
      cy.log('Message bubble HTML:', $message.html());
    });
  });
});