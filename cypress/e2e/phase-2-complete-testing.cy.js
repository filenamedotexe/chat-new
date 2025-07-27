describe('Phase 2 Complete - Chat System Testing', () => {
  beforeEach(() => {
    cy.visit('/test-chat-widget');
    cy.wait(2000); // Allow page and animations to fully load
  });

  it('should test complete chat widget functionality', () => {
    cy.screenshot('01-initial-page-load');

    // Test chat bubble click
    cy.get('[data-testid="chat-bubble"]').should('be.visible');
    cy.get('[data-testid="chat-bubble"]').click({ force: true });
    cy.wait(1000);

    // Verify chat widget opened
    cy.get('[data-testid="chat-widget"]').should('be.visible');
    cy.screenshot('02-chat-widget-opened');

    // Test message input functionality
    const testMessage = 'Testing the complete Phase 2.4 MessageInput functionality!';
    cy.get('[data-testid="message-input"]').should('be.visible');
    cy.get('[data-testid="message-input"]').type(testMessage);
    
    // Verify send button becomes enabled
    cy.get('[data-testid="send-button"]').should('not.be.disabled');
    
    // Send the message
    cy.get('[data-testid="send-button"]').click();
    cy.wait(2000); // Wait for message to be processed
    
    cy.screenshot('03-message-sent');

    // Wait for simulated response
    cy.wait(3000);
    cy.screenshot('04-response-received');

    // Test keyboard shortcut (Shift+Enter for new line)
    cy.get('[data-testid="message-input"]').type('Line 1{shift+enter}Line 2{shift+enter}Line 3');
    cy.screenshot('05-multiline-input');
    
    // Send multiline message
    cy.get('[data-testid="message-input"]').type('{enter}');
    cy.wait(2000);
    
    cy.screenshot('06-multiline-message-sent');

    // Test file upload if available
    cy.get('[data-testid="attach-file-button"]').should('be.visible');
    
    // Create and upload a test file
    const fileName = 'test-phase2.txt';
    const fileContent = 'This is a test file for Phase 2.4 comprehensive testing!';
    
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from(fileContent),
      fileName: fileName,
      mimeType: 'text/plain'
    }, { force: true });
    
    cy.wait(1000);
    cy.screenshot('07-file-attached');

    // Send message with file
    cy.get('[data-testid="message-input"]').type('Here is my test file attachment');
    cy.get('[data-testid="send-button"]').click();
    cy.wait(2000);
    
    cy.screenshot('08-file-message-sent');

    // Test character limit warning
    const longMessage = 'A'.repeat(850);
    cy.get('[data-testid="message-input"]').clear().type(longMessage);
    cy.wait(500);
    
    cy.screenshot('09-character-warning');

    // Clear and test empty state
    cy.get('[data-testid="message-input"]').clear();
    cy.get('[data-testid="send-button"]').should('be.disabled');
    
    cy.screenshot('10-empty-input-disabled');

    // Test minimize functionality
    cy.get('[data-testid="minimize-button"]').click();
    cy.wait(1000);
    
    cy.screenshot('11-widget-minimized');

    // Test close functionality
    cy.get('[data-testid="chat-bubble"]').click({ force: true });
    cy.wait(1000);
    cy.get('[data-testid="close-button"]').click();
    cy.wait(1000);
    
    cy.screenshot('12-widget-closed');
  });

  it('should test message list functionality', () => {
    // Open chat widget
    cy.get('[data-testid="chat-bubble"]').click({ force: true });
    cy.wait(1000);

    // Verify message list is visible with existing messages
    cy.get('[data-testid="message-list"]').should('be.visible');
    cy.screenshot('01-message-list-initial');

    // Test scroll behavior
    cy.get('[data-testid="message-list"]').scrollTo('top');
    cy.wait(2000); // Wait for load more
    cy.screenshot('02-message-list-load-more');

    // Send a new message to test auto-scroll
    cy.get('[data-testid="message-input"]').type('Testing auto-scroll functionality');
    cy.get('[data-testid="send-button"]').click();
    cy.wait(1000);
    
    cy.screenshot('03-new-message-auto-scroll');

    // Test empty state
    cy.contains('Clear Messages').click();
    cy.wait(500);
    cy.screenshot('04-message-list-empty-state');

    // Reload messages
    cy.contains('Load Mock Messages').click();
    cy.wait(500);
    cy.screenshot('05-message-list-reloaded');
  });

  it('should test all widget states and controls', () => {
    cy.screenshot('01-controls-initial');

    // Test online/offline toggle
    cy.contains('Toggle Online').click();
    cy.wait(500);
    cy.screenshot('02-offline-state');

    // Open widget in offline state
    cy.get('[data-testid="chat-bubble"]').click({ force: true });
    cy.wait(1000);
    cy.screenshot('03-widget-offline');

    // Test online state
    cy.contains('Toggle Online').click();
    cy.wait(500);
    cy.screenshot('04-online-state');

    // Test loading state
    cy.contains('Loading').click();
    cy.wait(500);
    cy.screenshot('05-loading-state');

    // Test unread count
    cy.contains('Toggle Unread Count').click();
    cy.wait(500);
    cy.screenshot('06-unread-count-changed');

    // Test minimized state
    cy.contains('Minimized State').click();
    cy.wait(500);
    cy.screenshot('07-minimized-state');
  });

  it('should capture comprehensive visual documentation', () => {
    // Document the complete Phase 2 implementation
    
    // Initial state
    cy.screenshot('phase2-01-page-loaded');

    // Open chat
    cy.get('[data-testid="chat-bubble"]').click({ force: true });
    cy.wait(1000);
    cy.screenshot('phase2-02-chat-opened');

    // Show all components working together
    cy.get('[data-testid="message-input"]').type('Phase 2.4 MessageInput integration test');
    cy.screenshot('phase2-03-typing-message');

    // Create test file
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('Phase 2.4 complete implementation'),
      fileName: 'phase2-complete.txt',
      mimeType: 'text/plain'
    }, { force: true });
    
    cy.wait(1000);
    cy.screenshot('phase2-04-file-attached');

    // Send message with file
    cy.get('[data-testid="send-button"]').click();
    cy.wait(2000);
    cy.screenshot('phase2-05-message-sent');

    // Wait for response
    cy.wait(3000);
    cy.screenshot('phase2-06-conversation-flow');

    // Test character limit
    cy.get('[data-testid="message-input"]').type('A'.repeat(900));
    cy.screenshot('phase2-07-character-limit');

    // Test all states
    cy.get('[data-testid="message-input"]').clear();
    cy.contains('Toggle Online').click();
    cy.wait(500);
    cy.screenshot('phase2-08-offline-input');

    // Final comprehensive view
    cy.contains('Toggle Online').click();
    cy.wait(500);
    cy.get('[data-testid="message-input"]').type('Phase 2 Complete! 🎉');
    cy.screenshot('phase2-09-final-state');
  });

  it('should test responsive behavior', () => {
    // Test desktop view
    cy.viewport(1280, 720);
    cy.screenshot('responsive-01-desktop');

    cy.get('[data-testid="chat-bubble"]').click({ force: true });
    cy.wait(1000);
    cy.screenshot('responsive-02-desktop-widget');

    // Test tablet view  
    cy.viewport(768, 1024);
    cy.screenshot('responsive-03-tablet');

    // Test mobile view
    cy.viewport(375, 667);
    cy.screenshot('responsive-04-mobile');

    // Test ultra-wide
    cy.viewport(2560, 1440);
    cy.screenshot('responsive-05-ultrawide');
  });
});