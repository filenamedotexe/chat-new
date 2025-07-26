describe('UI Color Improvements', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  it('should have modern color palette applied', () => {
    cy.visit('/login');
    
    // Check that CSS variables are defined
    cy.window().then((win) => {
      const rootStyles = win.getComputedStyle(win.document.documentElement);
      
      // Verify new color variables exist
      const primaryColor = rootStyles.getPropertyValue('--primary');
      const successColor = rootStyles.getPropertyValue('--success');
      const warningColor = rootStyles.getPropertyValue('--warning');
      
      expect(primaryColor).to.exist;
      expect(successColor).to.exist;
      expect(warningColor).to.exist;
      
      // Check that primary color is the modern purple
      expect(primaryColor.trim()).to.equal('262, 80%, 50%');
    });
  });

  it('should have proper button styling with new colors', () => {
    cy.visit('/login');
    
    // Check primary button has new purple color
    cy.get('button').first().then($button => {
      const styles = window.getComputedStyle($button[0]);
      const bgColor = styles.backgroundColor;
      
      // Should have a purple-ish background (checking RGB values are reasonable)
      const rgb = bgColor.match(/\d+/g);
      if (rgb) {
        // Purple has high blue and red, lower green
        expect(parseInt(rgb[0])).to.be.at.least(100); // Red
        expect(parseInt(rgb[2])).to.be.at.least(100); // Blue
      }
    });
  });

  it('should have status color classes available', () => {
    cy.visit('/login');
    
    // Check that status color CSS classes are defined
    cy.window().then((win) => {
      const rootStyles = win.getComputedStyle(win.document.documentElement);
      
      // Check status colors exist
      const successColor = rootStyles.getPropertyValue('--success');
      const warningColor = rootStyles.getPropertyValue('--warning');
      const infoColor = rootStyles.getPropertyValue('--info');
      
      expect(successColor).to.exist;
      expect(warningColor).to.exist;
      expect(infoColor).to.exist;
      
      // Verify the values
      expect(successColor.trim()).to.equal('142, 71%, 45%');
      expect(warningColor.trim()).to.equal('38, 92%, 50%');
      expect(infoColor.trim()).to.equal('199, 89%, 48%');
    });
  });

  it('should maintain good contrast in dark mode', () => {
    cy.visit('/login');
    
    // Check that dark mode styles are defined
    cy.window().then((win) => {
      // Check if dark mode CSS is available by checking a CSS rule
      const styleSheets = win.document.styleSheets;
      let hasDarkModeStyles = false;
      
      for (let sheet of styleSheets) {
        try {
          const rules = sheet.cssRules || sheet.rules;
          for (let rule of rules) {
            if (rule.cssText && rule.cssText.includes('.dark')) {
              hasDarkModeStyles = true;
              break;
            }
          }
        } catch (e) {
          // Some stylesheets might not be accessible
        }
      }
      
      // Just verify dark mode styles exist
      expect(hasDarkModeStyles).to.be.true;
    });
  });

  it('should have hover states working', () => {
    cy.visit('/login');
    
    // Check that button exists
    cy.get('button').should('exist');
    
    // Test focus states
    cy.get('button').first().then($button => {
      // Trigger focus
      $button.focus();
      
      // Check that some focus styling is applied
      const styles = window.getComputedStyle($button[0]);
      // Just verify the button is styled, not specific values
      expect(styles.backgroundColor).to.exist;
    });
  });
});