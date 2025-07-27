describe('Message Input Component - Comprehensive Testing', () => {
  beforeEach(() => {
    cy.visit('/test-message-input');
    cy.wait(1000); // Allow page to fully load
  });

  it('should render message input with all controls', () => {
    // Verify page loads
    cy.contains('Message Input Component Test').should('be.visible');
    
    // Verify all control buttons are present
    cy.get('[data-testid="toggle-loading"]').should('be.visible');
    cy.get('[data-testid="toggle-offline"]').should('be.visible');
    cy.get('[data-testid="toggle-disabled"]').should('be.visible');
    cy.get('[data-testid="toggle-file-upload"]').should('be.visible');
    cy.get('[data-testid="clear-history"]').should('be.visible');
    
    // Verify message input components are present
    cy.get('[data-testid="message-input"]').should('be.visible');
    cy.get('[data-testid="send-button"]').should('be.visible');
    cy.get('[data-testid="attach-file-button"]').should('be.visible');
    
    // Take initial screenshot
    cy.screenshot('message-input-initial-state');
  });

  it('should handle basic text input and sending', () => {
    const testMessage = 'This is a test message for the input component';
    
    // Type message
    cy.get('[data-testid="message-input"]').type(testMessage);
    
    // Send button should be enabled
    cy.get('[data-testid="send-button"]').should('not.be.disabled');
    
    // Send message by clicking button
    cy.get('[data-testid="send-button"]').click();
    cy.wait(500);
    
    // Verify message appears in history
    cy.contains('Last Message Sent').should('be.visible');
    cy.contains(testMessage).should('be.visible');
    
    // Verify input is cleared
    cy.get('[data-testid="message-input"]').should('have.value', '');
    
    cy.screenshot('message-input-after-sending-text');
  });

  it('should handle keyboard shortcuts correctly', () => {
    // Test Enter to send
    cy.get('[data-testid="message-input"]').type('Enter test message{enter}');
    cy.wait(500);
    cy.contains('Enter test message').should('be.visible');
    
    // Test Shift+Enter for new line
    cy.get('[data-testid="message-input"]').type('Line 1{shift+enter}Line 2{shift+enter}Line 3');
    
    // Verify textarea contains multiple lines
    cy.get('[data-testid="message-input"]').should('contain.value', 'Line 1\nLine 2\nLine 3');
    
    // Send with Enter
    cy.get('[data-testid="message-input"]').type('{enter}');
    cy.wait(500);
    
    // Verify multiline message was sent
    cy.contains('Line 1').should('be.visible');
    
    cy.screenshot('message-input-multiline-test');
  });

  it('should show character count when approaching limit', () => {
    // Clear any previous state
    cy.get('[data-testid="clear-history"]').click();
    cy.wait(200);
    
    // Type message approaching 800 characters (80% of 1000)
    const longMessage = 'A'.repeat(850);
    
    cy.get('[data-testid="message-input"]').clear().type(longMessage);
    
    // Should show character count
    cy.contains('850/1000').should('be.visible');
    
    // Type over limit (but textarea maxLength will prevent it, so we test at exactly 1000)
    cy.get('[data-testid="message-input"]').clear().type('A'.repeat(1000));
    
    // Should show over limit warning with proper styling
    cy.contains('1000/1000').should('be.visible');
    cy.contains('1000/1000').parent().should('have.class', 'text-destructive');
    
    // Send button should be disabled when over limit
    cy.get('[data-testid="send-button"]').should('be.disabled');
    
    cy.screenshot('message-input-character-limit');
  });

  it('should handle file upload interactions', () => {
    // Verify file upload button is present
    cy.get('[data-testid="attach-file-button"]').should('be.visible');
    
    // Create a test file
    const fileName = 'test-file.txt';
    const fileContent = 'This is a test file for upload';
    
    // Create file and attach
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from(fileContent),
      fileName: fileName,
      mimeType: 'text/plain'
    }, { force: true });
    
    cy.wait(500);
    
    // Verify file appears in preview
    cy.contains(fileName).should('be.visible');
    
    // Send message with file
    cy.get('[data-testid="message-input"]').type('Message with file attachment');
    cy.get('[data-testid="send-button"]').click();
    cy.wait(500);
    
    // Verify file info appears in last message
    cy.contains('Files (1)').should('be.visible');
    cy.contains(fileName).should('be.visible');
    
    cy.screenshot('message-input-file-upload');
  });

  it('should handle multiple file uploads and removal', () => {
    // Upload multiple files
    const files = [
      { fileName: 'file1.txt', content: 'File 1 content', mimeType: 'text/plain' },
      { fileName: 'file2.txt', content: 'File 2 content', mimeType: 'text/plain' },
      { fileName: 'file3.txt', content: 'File 3 content', mimeType: 'text/plain' }
    ];
    
    files.forEach(file => {
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(file.content),
        fileName: file.fileName,
        mimeType: file.mimeType
      }, { force: true });
      cy.wait(200);
    });
    
    // Verify all files appear
    files.forEach(file => {
      cy.contains(file.fileName).should('be.visible');
    });
    
    // Remove one file using X button
    cy.contains('file1.txt').parent().find('button').click();
    cy.wait(200);
    
    // Verify file1 is removed
    cy.contains('file1.txt').should('not.exist');
    cy.contains('file2.txt').should('be.visible');
    cy.contains('file3.txt').should('be.visible');
    
    cy.screenshot('message-input-multiple-files');
  });

  it('should handle loading state correctly', () => {
    // Enable loading state
    cy.get('[data-testid="toggle-loading"]').click();
    cy.wait(200);
    
    // Verify loading state UI
    cy.get('[data-testid="send-button"]').should('be.disabled');
    cy.get('[data-testid="message-input"]').should('be.disabled');
    cy.get('[data-testid="attach-file-button"]').should('be.disabled');
    
    // Send button should show loading spinner
    cy.get('[data-testid="send-button"]').find('svg').should('have.class', 'animate-spin');
    
    cy.screenshot('message-input-loading-state');
    
    // Disable loading
    cy.get('[data-testid="toggle-loading"]').click();
    cy.wait(200);
    
    // Verify controls are re-enabled
    cy.get('[data-testid="message-input"]').should('not.be.disabled');
    cy.get('[data-testid="attach-file-button"]').should('not.be.disabled');
  });

  it('should handle offline state correctly', () => {
    // Enable offline state
    cy.get('[data-testid="toggle-offline"]').click();
    cy.wait(200);
    
    // Verify offline placeholder text
    cy.get('[data-testid="message-input"]').should('have.attr', 'placeholder')
      .and('include', 'offline');
    
    // Verify offline warning message
    cy.contains('currently offline').should('be.visible');
    
    // Should still be able to type and send (for offline queuing)
    cy.get('[data-testid="message-input"]').type('Offline test message');
    cy.get('[data-testid="send-button"]').should('not.be.disabled');
    
    cy.screenshot('message-input-offline-state');
  });

  it('should handle disabled state correctly', () => {
    // Enable disabled state
    cy.get('[data-testid="toggle-disabled"]').click();
    cy.wait(200);
    
    // Verify all controls are disabled
    cy.get('[data-testid="message-input"]').should('be.disabled');
    cy.get('[data-testid="send-button"]').should('be.disabled');
    cy.get('[data-testid="attach-file-button"]').should('be.disabled');
    
    // Input should have opacity styling
    cy.get('[data-testid="message-input"]').should('have.class', 'opacity-50');
    
    cy.screenshot('message-input-disabled-state');
  });

  it('should toggle file upload functionality', () => {
    // Verify file upload is initially enabled
    cy.get('[data-testid="attach-file-button"]').should('be.visible');
    
    // Disable file upload
    cy.get('[data-testid="toggle-file-upload"]').click();
    cy.wait(200);
    
    // File upload button should be hidden
    cy.get('[data-testid="attach-file-button"]').should('not.exist');
    
    // Helper text should not mention file upload
    cy.contains('Drag and drop files').should('not.exist');
    
    cy.screenshot('message-input-no-file-upload');
    
    // Re-enable file upload
    cy.get('[data-testid="toggle-file-upload"]').click();
    cy.wait(200);
    
    // File upload button should be visible again
    cy.get('[data-testid="attach-file-button"]').should('be.visible');
  });

  it('should handle auto-resize textarea behavior', () => {
    // Ensure we're starting fresh and not disabled
    cy.get('[data-testid="clear-history"]').click();
    cy.wait(200);
    
    // Make sure disabled state is off
    cy.get('[data-testid="toggle-disabled"]').then(($btn) => {
      if ($btn.text().includes('Disabled: ON')) {
        cy.wrap($btn).click();
        cy.wait(200);
      }
    });
    
    // Start with short message  
    cy.get('[data-testid="message-input"]').should('not.be.disabled');
    cy.get('[data-testid="message-input"]').should('have.css', 'height', '40px');
    
    // Type multiple lines
    const longMessage = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8';
    cy.get('[data-testid="message-input"]').type(longMessage);
    
    // Should expand but not exceed max height
    cy.get('[data-testid="message-input"]').invoke('outerHeight').should('be.gte', 60);
    cy.get('[data-testid="message-input"]').invoke('outerHeight').should('be.lte', 120);
    
    cy.screenshot('message-input-auto-resize');
  });

  it('should handle empty message validation', () => {
    // Send button should be disabled with empty input
    cy.get('[data-testid="send-button"]').should('be.disabled');
    
    // Type only spaces
    cy.get('[data-testid="message-input"]').type('   ');
    
    // Should still be disabled
    cy.get('[data-testid="send-button"]').should('be.disabled');
    
    // Add actual content
    cy.get('[data-testid="message-input"]').clear().type('Real message');
    
    // Should be enabled
    cy.get('[data-testid="send-button"]').should('not.be.disabled');
    
    cy.screenshot('message-input-empty-validation');
  });

  it('should handle file-only messages', () => {
    // Ensure file upload is enabled
    cy.get('[data-testid="toggle-file-upload"]').then(($btn) => {
      if ($btn.text().includes('File Upload: OFF')) {
        cy.wrap($btn).click();
        cy.wait(200);
      }
    });
    
    // Upload a file without text
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('Test file content'),
      fileName: 'test-only-file.txt',
      mimeType: 'text/plain'
    }, { force: true });
    
    cy.wait(500);
    
    // Send button should be enabled with just file
    cy.get('[data-testid="send-button"]').should('not.be.disabled');
    
    // Send file-only message
    cy.get('[data-testid="send-button"]').click();
    cy.wait(500);
    
    // Verify message was sent with empty content but file attached
    cy.contains('Last Message Sent').should('be.visible');
    cy.contains('Files (1)').should('be.visible');
    
    cy.screenshot('message-input-file-only-message');
  });

  it('should provide comprehensive visual verification', () => {
    // Test all states in sequence for comprehensive visual record
    
    // Normal state
    cy.screenshot('01-message-input-normal-state');
    
    // With text
    cy.get('[data-testid="message-input"]').type('Sample message text');
    cy.screenshot('02-message-input-with-text');
    
    // With file
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('Sample file'),
      fileName: 'sample.txt',
      mimeType: 'text/plain'
    }, { force: true });
    cy.wait(500);
    cy.screenshot('03-message-input-with-file');
    
    // Character limit warning
    cy.get('[data-testid="message-input"]').clear().type('A'.repeat(850));
    cy.screenshot('04-message-input-char-warning');
    
    // Over limit
    cy.get('[data-testid="message-input"]').type('B'.repeat(200));
    cy.screenshot('05-message-input-over-limit');
    
    // Clear and test states
    cy.get('[data-testid="clear-history"]').click();
    cy.get('[data-testid="message-input"]').clear();
    
    // Loading state
    cy.get('[data-testid="toggle-loading"]').click();
    cy.screenshot('06-message-input-loading');
    
    // Offline state
    cy.get('[data-testid="toggle-loading"]').click();
    cy.get('[data-testid="toggle-offline"]').click();
    cy.screenshot('07-message-input-offline');
    
    // Disabled state
    cy.get('[data-testid="toggle-offline"]').click();
    cy.get('[data-testid="toggle-disabled"]').click();
    cy.screenshot('08-message-input-disabled');
    
    // No file upload
    cy.get('[data-testid="toggle-disabled"]').click();
    cy.get('[data-testid="toggle-file-upload"]').click();
    cy.screenshot('09-message-input-no-file-upload');
  });
});