describe('Markdown Debug', () => {
  it('should check markdown rendering', () => {
    // Login as admin
    cy.visit('/login');
    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');

    // Go to chat
    cy.visit('/projects');
    cy.get('a[href^="/projects/"]').not('[href="/projects/new"]').first().click();
    cy.contains('Team Chat').click();
    
    // Send a bold message
    cy.get('textarea[placeholder*="message"]').type('**Testing bold**');
    cy.get('button[aria-label="Send message"]').click();
    
    // Wait for message to load
    cy.wait(2000);
    
    // Debug: Log what we see
    cy.get('body').then($body => {
      // Check if any strong elements exist
      const strongElements = $body.find('strong');
      cy.log('Found strong elements:', strongElements.length);
      
      // Check the actual message content
      const messageContent = $body.find('.prose').text();
      cy.log('Message content:', messageContent);
      
      // Check if the message appears as raw text
      if ($body.text().includes('**Testing bold**')) {
        cy.log('Message appears as raw markdown, not parsed');
      }
      
      // Look for the message in any format
      if ($body.text().includes('Testing bold')) {
        cy.log('Message text found');
        
        // Check parent element classes
        const messageElements = $body.find(':contains("Testing bold")');
        messageElements.each((i, el) => {
          cy.log(`Element ${i} tag:`, el.tagName);
          cy.log(`Element ${i} classes:`, el.className);
        });
      }
    });
    
    // Also check the API response
    cy.request('GET', `/api/messages?projectId=${Cypress.env('projectId') || 'test'}&limit=10`).then(response => {
      cy.log('API Response:', JSON.stringify(response.body));
    });
  });
});