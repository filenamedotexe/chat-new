describe('Check Purple Color', () => {
  it('should show purple color is defined in CSS', () => {
    cy.visit('/login');
    
    // Check CSS variables
    cy.window().then((win) => {
      const rootStyles = win.getComputedStyle(win.document.documentElement);
      const primaryColor = rootStyles.getPropertyValue('--primary');
      cy.log('--primary CSS variable:', primaryColor);
      
      // Should be our purple color
      expect(primaryColor.trim()).to.equal('262 80% 50%');
    });
    
    // Check what color the button actually has
    cy.get('button').first().then($button => {
      const styles = window.getComputedStyle($button[0]);
      cy.log('Button background-color:', styles.backgroundColor);
      cy.log('Button color:', styles.color);
      
      // Check if button has bg-primary class
      cy.log('Button classes:', $button.attr('class'));
    });
    
    // Let's also check if primary color converts to RGB correctly
    cy.window().then((win) => {
      // HSL(262, 80%, 50%) should convert to purple RGB
      const testDiv = win.document.createElement('div');
      testDiv.style.backgroundColor = 'hsl(262, 80%, 50%)';
      win.document.body.appendChild(testDiv);
      const computed = win.getComputedStyle(testDiv);
      cy.log('HSL(262, 80%, 50%) converts to:', computed.backgroundColor);
      win.document.body.removeChild(testDiv);
    });
  });
});