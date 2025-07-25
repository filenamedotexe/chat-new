describe('Responsive Audit - All Viewports', () => {
  const viewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone X', width: 375, height: 812 },
    { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
    { name: 'Pixel 5', width: 393, height: 851 },
    { name: 'Samsung Galaxy S20', width: 412, height: 915 },
    { name: 'iPad Mini', width: 768, height: 1024 },
    { name: 'iPad Pro', width: 1024, height: 1366 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];

  // Handle hydration errors
  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('Hydration') || err.message.includes('Text content')) {
      return false;
    }
  });

  viewports.forEach(viewport => {
    describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      beforeEach(() => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit('/login');
        cy.get('#email').type('admin@example.com');
        cy.get('#password').type('admin123');
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/dashboard');
      });

      it('should not have horizontal overflow on any page', () => {
        const pages = ['/dashboard', '/projects', '/organizations', '/tasks', '/settings'];
        
        pages.forEach(page => {
          cy.visit(page);
          
          // Check body width
          cy.get('body').should($body => {
            const bodyWidth = $body.width();
            const scrollWidth = $body[0].scrollWidth;
            expect(scrollWidth).to.be.lte(bodyWidth + 1); // Allow 1px tolerance
          });
          
          // Check for horizontal scrollbar
          cy.window().then(win => {
            const hasHorizontalScroll = win.document.documentElement.scrollWidth > win.innerWidth;
            expect(hasHorizontalScroll).to.be.false;
          });
        });
      });

      if (viewport.width < 768) {
        it('should show mobile navigation', () => {
          // Check hamburger menu is visible
          cy.get('[data-mobile-menu-trigger]').should('be.visible');
          
          // Desktop nav should be hidden
          cy.get('nav .hidden.md\\:flex').should('not.be.visible');
          
          // Open mobile menu
          cy.get('[data-mobile-menu-trigger]').click();
          cy.get('[data-mobile-menu]').should('be.visible');
          
          // Check menu items
          cy.get('[data-mobile-menu]').within(() => {
            cy.contains('Dashboard').should('be.visible');
            cy.contains('Projects').should('be.visible');
            cy.contains('Organizations').should('be.visible');
          });
        });

        it('should have proper touch targets', () => {
          // Check all buttons
          cy.get('button').each($button => {
            if ($button.is(':visible')) {
              const height = $button.height();
              const width = $button.width();
              expect(Math.max(height, width)).to.be.at.least(44);
            }
          });
          
          // Check all links
          cy.get('a').each($link => {
            if ($link.is(':visible') && !$link.parent().is('nav')) {
              const height = $link.height();
              if (height > 0) {
                expect(height).to.be.at.least(32); // Links can be smaller than buttons
              }
            }
          });
        });

        it('should have readable text sizes', () => {
          // Check heading sizes
          cy.get('h1').should('have.css', 'font-size').and('match', /^(20|24|28|32)/);
          cy.get('h2').should('have.css', 'font-size').and('match', /^(18|20|24)/);
          
          // Check body text
          cy.get('p').each($p => {
            if ($p.is(':visible')) {
              const fontSize = parseInt($p.css('font-size'));
              expect(fontSize).to.be.at.least(14);
            }
          });
        });

        it('should stack cards vertically', () => {
          cy.visit('/projects');
          
          cy.get('[data-testid="project-card"]').then($cards => {
            if ($cards.length >= 2) {
              const first = $cards.eq(0);
              const second = $cards.eq(1);
              
              // Should be stacked (same x position)
              expect(first.offset().left).to.equal(second.offset().left);
              // Second should be below first
              expect(second.offset().top).to.be.greaterThan(first.offset().top);
            }
          });
        });

        it('should have responsive forms', () => {
          cy.visit('/projects/new');
          
          // Form inputs should be full width
          cy.get('input[type="text"], select, textarea').each($input => {
            if ($input.is(':visible')) {
              const inputWidth = $input.width();
              const parentWidth = $input.parent().width();
              expect(inputWidth).to.be.closeTo(parentWidth, 32); // Allow for padding
            }
          });
          
          // Grid columns should stack
          cy.get('.grid.grid-cols-2').should('have.css', 'grid-template-columns', '1fr');
        });

        it('should handle tables with horizontal scroll', () => {
          cy.visit('/admin/activity');
          
          // Table container should scroll
          cy.get('table').parent().should($parent => {
            const overflow = $parent.css('overflow-x');
            expect(overflow).to.match(/auto|scroll/);
          });
        });
      }

      if (viewport.width >= 768 && viewport.width < 1024) {
        it('should show tablet-optimized layout', () => {
          // Check grid layouts
          cy.visit('/projects');
          cy.get('.grid').should('have.class', 'md:grid-cols-2');
          
          // Navigation should be visible
          cy.get('nav .hidden.md\\:flex').should('be.visible');
        });
      }

      if (viewport.width >= 1024) {
        it('should show desktop layout', () => {
          cy.visit('/projects');
          
          // Full grid should be visible
          cy.get('.grid').should('have.class', 'lg:grid-cols-3');
          
          // No mobile menu trigger
          cy.get('[data-mobile-menu-trigger]').should('not.exist');
        });
      }

      it('should have proper padding and margins', () => {
        // Check main containers
        cy.get('.mx-auto').each($container => {
          if ($container.is(':visible')) {
            const paddingLeft = parseInt($container.css('padding-left'));
            const paddingRight = parseInt($container.css('padding-right'));
            
            if (viewport.width < 640) {
              expect(paddingLeft).to.be.at.least(12);
              expect(paddingRight).to.be.at.least(12);
            } else {
              expect(paddingLeft).to.be.at.least(16);
              expect(paddingRight).to.be.at.least(16);
            }
          }
        });
      });

      it('should handle long text properly', () => {
        cy.visit('/projects');
        
        // Check for text truncation
        cy.get('.line-clamp-1, .line-clamp-2, .truncate').each($el => {
          if ($el.is(':visible')) {
            const scrollWidth = $el[0].scrollWidth;
            const clientWidth = $el[0].clientWidth;
            
            // If text is overflowing, it should be truncated
            if (scrollWidth > clientWidth) {
              const overflow = $el.css('overflow');
              const textOverflow = $el.css('text-overflow');
              expect(overflow).to.equal('hidden');
              expect(textOverflow).to.equal('ellipsis');
            }
          }
        });
      });
    });
  });
});