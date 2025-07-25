describe('UI Spacing Improvements', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    // Wait for redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });

  it('should have consistent spacing on dashboard', () => {
    // Check that CSS variables are defined
    cy.window().then((win) => {
      const rootStyles = win.getComputedStyle(win.document.documentElement);
      
      // Verify spacing variables exist
      expect(rootStyles.getPropertyValue('--space-1')).to.exist;
      expect(rootStyles.getPropertyValue('--space-4')).to.exist;
      expect(rootStyles.getPropertyValue('--space-6')).to.exist;
    });

    // Check dashboard header spacing
    cy.get('h1').should('be.visible');
    
    // Check card spacing
    cy.get('[data-testid="project-card"], .rounded-lg.border').first().should('be.visible');
    
    // Check button spacing on dashboard
    cy.get('button').first().then($button => {
      const styles = window.getComputedStyle($button[0]);
      
      // Should have proper padding using our CSS variables
      expect(parseInt(styles.paddingLeft)).to.be.at.least(12);
      expect(parseInt(styles.paddingRight)).to.be.at.least(12);
    });
  });

  it('should have appropriate mobile spacing', () => {
    // Test mobile viewport
    cy.viewport(375, 812);
    
    cy.visit('/dashboard');
    
    // Check that spacing is reduced on mobile
    cy.window().then((win) => {
      const rootStyles = win.getComputedStyle(win.document.documentElement);
      const space5Value = rootStyles.getPropertyValue('--space-5');
      
      // On mobile, space-5 should be 1.25rem (20px)
      expect(space5Value.trim()).to.equal('1.25rem');
    });
    
    // Check cards stack vertically on mobile
    cy.get('.grid').first().then($grid => {
      const styles = window.getComputedStyle($grid[0]);
      // On mobile, should be single column
      const cols = styles.gridTemplateColumns;
      // Should be single column (not contain multiple fractions)
      expect(cols.split(' ').length).to.equal(1);
    });
  });

  it('should have consistent form spacing', () => {
    cy.visit('/projects/new');
    
    // Check form field spacing
    cy.get('form').within(() => {
      cy.get('input, textarea, select').each($el => {
        if ($el.is(':visible')) {
          const styles = window.getComputedStyle($el[0]);
          
          // All form inputs should have consistent padding
          expect(parseInt(styles.paddingTop)).to.be.at.least(8);
          expect(parseInt(styles.paddingBottom)).to.be.at.least(8);
        }
      });
    });
  });
});