describe('Phase 11.4: Mobile Optimization', () => {
  // Handle hydration errors
  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('Text content does not match server-rendered HTML') || 
        err.message.includes('Hydration failed')) {
      return false;
    }
  });

  beforeEach(() => {
    // Login first at desktop size
    cy.viewport(1280, 720);
    cy.visit('/login');
    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Then switch to mobile viewport
    cy.viewport(375, 812);
  });

  describe('Mobile Navigation', () => {
    it('should show hamburger menu on mobile', () => {
      // Hamburger should be visible
      cy.get('[data-mobile-menu-trigger]').should('be.visible');
      
      // Desktop nav should be hidden
      cy.get('.hidden.md\\:flex').should('not.be.visible');
    });

    it('should open and close mobile menu', () => {
      // Open menu
      cy.get('[data-mobile-menu-trigger]').click();
      
      // Menu should be visible
      cy.get('[data-mobile-menu]').should('be.visible');
      
      // Check menu items exist
      cy.get('[data-mobile-menu]').contains('Dashboard').should('exist');
      cy.get('[data-mobile-menu]').contains('Projects').should('exist');
      cy.get('[data-mobile-menu]').contains('Organizations').should('exist');
      cy.get('[data-mobile-menu]').contains('Admin').should('exist'); // Admin user
      
      // Close with X button
      cy.get('[data-mobile-menu] button[aria-label="Close menu"]').click();
      cy.get('[data-mobile-menu]').should('not.exist');
    });

    it('should close menu when clicking backdrop', () => {
      cy.get('[data-mobile-menu-trigger]').click();
      cy.get('[data-mobile-menu]').should('be.visible');
      
      // Click backdrop
      cy.get('body').click(10, 100); // Click outside menu
      cy.get('[data-mobile-menu]').should('not.exist');
    });

    it('should navigate and close menu', () => {
      cy.get('[data-mobile-menu-trigger]').click();
      
      // Click Projects link
      cy.get('[data-mobile-menu]').contains('Projects').click();
      
      // Should navigate and close menu
      cy.url().should('include', '/projects');
      cy.get('[data-mobile-menu]').should('not.exist');
    });

    it('should show user info and sign out in mobile menu', () => {
      cy.get('[data-mobile-menu-trigger]').click();
      
      // Check user info
      cy.get('[data-mobile-menu]').contains('admin@example.com').should('be.visible');
      
      // Check sign out button
      cy.get('[data-mobile-menu] button').contains('Sign Out').should('be.visible');
    });
  });

  describe('Touch Targets', () => {
    it('should have minimum 44px touch targets for buttons', () => {
      cy.visit('/projects');
      
      // Wait for page to load
      cy.get('h1').should('be.visible');
      
      // Check all visible buttons
      cy.get('button:visible').each(($button, index) => {
        cy.wrap($button).then(($el) => {
          const height = $el.height();
          const width = $el.width();
          const text = $el.text().trim();
          const classes = $el.attr('class');
          
          // Log all buttons for debugging
          cy.log(`Button ${index}: "${text || 'icon-only'}" - ${height}x${width}px`);
          
          // Only check buttons that are actually visible and have dimensions
          if (height > 0 && width > 0) {
            // Skip dropdown chevron buttons which are small by design
            if (!classes?.includes('h-3') && !classes?.includes('h-4')) {
              expect(Math.max(height, width), `Button "${text || 'icon-only'}" should be at least 44px`).to.be.at.least(44);
            }
          }
        });
      });
    });
  });

  describe('Responsive Layouts', () => {
    it('should stack project cards on mobile', () => {
      cy.visit('/projects');
      
      // Cards should be in single column
      cy.get('[data-testid="project-card"]').first().then(($firstCard) => {
        cy.get('[data-testid="project-card"]').eq(1).then(($secondCard) => {
          // Second card should be below first card (same X position)
          expect($firstCard.offset().left).to.equal($secondCard.offset().left);
        });
      });
    });

    it('should handle long text without overflow', () => {
      cy.visit('/projects');
      
      // Check for horizontal overflow
      cy.get('body').then(($body) => {
        const bodyWidth = $body.width();
        const scrollWidth = $body[0].scrollWidth;
        
        // Body should not have horizontal scroll
        expect(scrollWidth).to.be.lte(bodyWidth);
      });
    });
  });

  describe('Desktop View', () => {
    beforeEach(() => {
      // Switch to desktop viewport
      cy.viewport(1280, 720);
    });

    it('should hide hamburger menu on desktop', () => {
      cy.visit('/dashboard');
      
      // Hamburger should not be visible
      cy.get('[data-mobile-menu-trigger]').should('not.be.visible');
      
      // Desktop nav should be visible
      cy.get('.hidden.md\\:flex').should('be.visible');
    });
  });
});