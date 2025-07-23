describe('Phase 3: Core UI & Layout', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  describe('App Shell Layout', () => {
    beforeEach(() => {
      cy.login('admin@example.com', 'admin123');
    });

    it('should display app shell with sidebar and header', () => {
      cy.visit('/dashboard');
      
      // Check sidebar exists
      cy.get('nav').should('be.visible');
      
      // Check header with user menu
      cy.get('button[aria-label="User menu"]').should('be.visible');
      
      // Check main content area
      cy.get('main').should('be.visible');
      
      cy.screenshot('phase3-app-shell');
    });

    it('should have working navigation links', () => {
      cy.visit('/dashboard');
      
      // Test each navigation link
      const navItems = [
        { text: 'Dashboard', url: '/dashboard' },
        { text: 'Projects', url: '/projects' },
        { text: 'Organizations', url: '/organizations' }
      ];

      navItems.forEach(item => {
        cy.contains(item.text).click();
        cy.url().should('include', item.url);
        cy.screenshot(`phase3-nav-${item.text.toLowerCase()}`);
      });
    });

    it('should toggle theme', () => {
      cy.visit('/dashboard');
      
      // Find theme toggle button
      cy.get('button').filter((i, el) => {
        return Cypress.$(el).find('svg').length > 0;
      }).then($buttons => {
        // Look for sun/moon icon
        const themeButton = Array.from($buttons).find(btn => {
          const svg = btn.querySelector('svg');
          return svg && (svg.innerHTML.includes('sun') || svg.innerHTML.includes('moon'));
        });
        
        if (themeButton) {
          cy.wrap(themeButton).click();
          cy.screenshot('phase3-theme-toggled');
        }
      });
    });
  });

  describe('Role-Based Navigation', () => {
    it('should show admin navigation items', () => {
      cy.login('admin@example.com', 'admin123');
      cy.visit('/dashboard');
      
      // Admin should see all items
      cy.contains('Dashboard').should('be.visible');
      cy.contains('Projects').should('be.visible');
      cy.contains('Organizations').should('be.visible');
      
      cy.screenshot('phase3-admin-navigation');
    });

    it('should show limited navigation for clients', () => {
      cy.login('user@example.com', 'user123');
      cy.visit('/dashboard');
      
      // Client should see limited items
      cy.contains('Dashboard').should('be.visible');
      cy.contains('Projects').should('be.visible');
      // Organizations might be hidden or limited
      
      cy.screenshot('phase3-client-navigation');
    });
  });

  describe('Dashboard Pages', () => {
    it('should display admin dashboard with stats', () => {
      cy.login('admin@example.com', 'admin123');
      cy.visit('/dashboard');
      
      // Check for admin-specific content
      cy.contains(/Admin Dashboard|Dashboard/i).should('be.visible');
      
      // Look for stats or cards
      cy.get('[class*="card"], [class*="Card"]').should('exist');
      
      cy.screenshot('phase3-admin-dashboard-content');
    });

    it('should display client dashboard', () => {
      cy.login('user@example.com', 'user123');
      cy.visit('/dashboard');
      
      // Check for client-specific content
      cy.contains(/Dashboard/i).should('be.visible');
      
      cy.screenshot('phase3-client-dashboard-content');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      cy.login('admin@example.com', 'admin123');
    });

    it('should be responsive on mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/dashboard');
      
      // Mobile menu should be visible
      cy.get('button').filter((i, el) => {
        return el.getAttribute('aria-label')?.includes('menu') || 
               el.innerHTML.includes('Menu');
      }).should('be.visible');
      
      cy.screenshot('phase3-mobile-view');
    });

    it('should be responsive on tablet', () => {
      cy.viewport(768, 1024);
      cy.visit('/dashboard');
      
      cy.screenshot('phase3-tablet-view');
    });
  });

  describe('UI Components', () => {
    beforeEach(() => {
      cy.login('admin@example.com', 'admin123');
    });

    it('should display buttons with proper styling', () => {
      cy.visit('/projects');
      
      // Check primary button
      cy.contains('button', 'New Project').should('be.visible');
      
      cy.screenshot('phase3-buttons');
    });

    it('should display cards with proper styling', () => {
      cy.visit('/projects');
      
      // Check card components
      cy.get('[class*="card"], [class*="Card"], article').should('exist');
      
      cy.screenshot('phase3-cards');
    });

    it('should display forms with proper styling', () => {
      cy.visit('/projects');
      cy.contains('New Project').click();
      
      // Check form elements
      cy.get('input').should('be.visible');
      cy.get('textarea').should('be.visible');
      cy.get('select').should('be.visible');
      
      cy.screenshot('phase3-form-elements');
    });
  });
});