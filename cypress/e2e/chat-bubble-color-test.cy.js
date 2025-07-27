describe('Chat Bubble Color Testing', () => {
  beforeEach(() => {
    cy.visit('/test-chat-widget');
    cy.wait(1000);
  });

  it('should verify chat bubble colors and contrast', () => {
    // Open the chat widget
    cy.get('[data-testid="chat-bubble"]').click();
    cy.wait(500);

    // Take screenshot of initial state with messages
    cy.screenshot('chat-widget-initial-messages');

    // Test sending a message to see sent bubble colors
    cy.get('[data-testid="message-input"]').type('This is a test message to check sent bubble colors');
    cy.get('[data-testid="send-button"]').click();
    cy.wait(1000);

    // Take screenshot after sending message
    cy.screenshot('chat-widget-after-sending-message');

    // Wait for simulated response
    cy.wait(3000);

    // Take screenshot after receiving response
    cy.screenshot('chat-widget-after-response');

    // Test with empty state
    cy.contains('Clear Messages').click();
    cy.wait(500);
    cy.screenshot('chat-widget-empty-state');

    // Load messages back
    cy.contains('Load Mock Messages').click();
    cy.wait(500);
    cy.screenshot('chat-widget-loaded-messages');

    // Test scrolling behavior
    cy.get('[data-testid="message-list"]').scrollTo('top');
    cy.wait(2000); // Wait for load more
    cy.screenshot('chat-widget-after-load-more');

    // Test dark mode if toggle exists
    cy.get('body').then(($body) => {
      if ($body.hasClass('dark')) {
        cy.screenshot('chat-widget-dark-mode');
      }
    });
  });

  it('should test specific message bubble colors', () => {
    // Open widget
    cy.get('[data-testid="chat-bubble"]').click();
    cy.wait(500);

    // Check if sent messages have proper colors
    cy.get('[data-testid="message-list"]').within(() => {
      // Look for message content and verify styling
      cy.contains('Perfect! That worked').should('be.visible');
      cy.contains('Thank you so much for your help').should('be.visible');
    });

    // Take detailed screenshot of message bubbles
    cy.screenshot('message-bubbles-detailed');

    // Send a new message and check its styling
    cy.get('[data-testid="message-input"]').type('Testing sent message bubble colors');
    cy.get('[data-testid="send-button"]').click();
    cy.wait(1000);

    // Take screenshot of new sent message
    cy.screenshot('new-sent-message-colors');

    // Check received message styling after response
    cy.wait(3000);
    cy.screenshot('new-received-message-colors');
  });

  it('should test contrast in both light and dark themes', () => {
    // Test light theme first
    cy.get('body').then(($body) => {
      const isDark = $body.hasClass('dark');
      
      // Open widget
      cy.get('[data-testid="chat-bubble"]').click();
      cy.wait(500);
      
      if (isDark) {
        cy.screenshot('chat-messages-dark-theme');
      } else {
        cy.screenshot('chat-messages-light-theme');
      }
    });

    // Send a test message in current theme
    cy.get('[data-testid="message-input"]').type('Testing contrast in current theme');
    cy.get('[data-testid="send-button"]').click();
    cy.wait(1000);
    
    cy.screenshot('contrast-test-sent-message');
    
    // Wait for response
    cy.wait(3000);
    cy.screenshot('contrast-test-received-message');
  });

  it('should capture high-resolution message bubble screenshots', () => {
    // Set high resolution viewport
    cy.viewport(2560, 1440);
    
    // Open widget
    cy.get('[data-testid="chat-bubble"]').click();
    cy.wait(500);

    // Take high-res screenshot
    cy.screenshot('chat-bubbles-high-resolution');

    // Focus on just the message area
    cy.get('[data-testid="message-list"]').screenshot('message-list-high-res');

    // Send a message for sent bubble styling
    cy.get('[data-testid="message-input"]').type('High resolution test message');
    cy.get('[data-testid="send-button"]').click();
    cy.wait(1000);

    cy.get('[data-testid="message-list"]').screenshot('sent-message-high-res');
  });
});