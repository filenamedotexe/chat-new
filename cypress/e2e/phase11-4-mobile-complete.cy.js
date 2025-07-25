describe('Phase 11.4: Complete Mobile Optimization', () => {
  // Test data
  const users = {
    admin: { email: 'admin@example.com', password: 'admin123' },
    team: { email: 'team@example.com', password: 'team123' },
    client: { email: 'client@example.com', password: 'client123' }
  };

  const viewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
    { name: 'Pixel 5', width: 393, height: 851 },
    { name: 'Samsung Galaxy S21', width: 360, height: 800 },
    { name: 'iPad Mini', width: 768, height: 1024 },
    { name: 'Landscape', width: 812, height: 375 }
  ];

  // Handle hydration errors
  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('Hydration') || err.message.includes('Text content')) {
      return false;
    }
  });

  // Helper function to login
  const login = (userType) => {
    cy.clearCookies();
    cy.visit('/login');
    cy.get('#email').type(users[userType].email);
    cy.get('#password').type(users[userType].password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  };

  describe('Admin Role - Complete Mobile Testing', () => {
    viewports.forEach((viewport) => {
      describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
        beforeEach(() => {
          cy.viewport(viewport.width, viewport.height);
          login('admin');
        });

        it('should navigate all admin pages', () => {
          // Dashboard
          cy.get('h1').contains('Admin Dashboard').should('be.visible');
          
          // Open mobile menu
          cy.get('[data-mobile-menu-trigger]').click();
          
          // Navigate to Projects
          cy.get('[data-mobile-menu]').contains('Projects').click();
          cy.url().should('include', '/projects');
          cy.get('h1').should('be.visible');
          
          // Check project cards are stacked
          if (viewport.width < 768) {
            cy.get('[data-testid="project-card"]').first().then(($first) => {
              cy.get('[data-testid="project-card"]').eq(1).then(($second) => {
                expect($first.offset().left).to.equal($second.offset().left);
              });
            });
          }
          
          // Navigate to Organizations
          cy.get('[data-mobile-menu-trigger]').click();
          cy.get('[data-mobile-menu]').contains('Organizations').click();
          cy.url().should('include', '/organizations');
          
          // Navigate to Admin
          cy.get('[data-mobile-menu-trigger]').click();
          cy.get('[data-mobile-menu]').contains('Admin').click();
          cy.url().should('include', '/admin');
        });

        it('should create and manage projects', () => {
          cy.visit('/projects');
          
          // Create new project
          cy.contains('button', 'New Project').click();
          
          // Fill form on mobile
          cy.get('input[name="name"]').type(`Mobile Test ${viewport.name}`);
          cy.get('textarea[name="description"]').type('Testing on mobile device');
          cy.get('select[name="organizationId"]').select(1);
          cy.get('button[type="submit"]').click();
          
          // Verify creation
          cy.contains(`Mobile Test ${viewport.name}`).should('be.visible');
        });

        it('should manage tasks with drag and drop', () => {
          cy.visit('/projects');
          cy.get('[data-testid="project-card"]').first().click();
          
          // Navigate to tasks
          cy.contains('Manage Tasks').click();
          
          // Create task
          cy.contains('button', 'Add Task').click();
          cy.get('input[name="title"]').type('Mobile Task');
          cy.get('textarea[name="description"]').type('Task for mobile testing');
          cy.get('button[type="submit"]').click();
          
          // Test drag and drop on mobile (should show alternative UI)
          if (viewport.width < 768) {
            // On mobile, drag might be replaced with buttons
            cy.contains('Mobile Task').parent().find('button[aria-label*="Move"]').should('exist');
          }
        });

        it('should handle file uploads', () => {
          cy.visit('/projects');
          cy.get('[data-testid="project-card"]').first().click();
          
          // Navigate to files
          cy.contains('View Files').click();
          
          // Upload file
          const fileName = 'test.txt';
          cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('Mobile file upload test'),
            fileName: fileName,
            mimeType: 'text/plain',
          }, { force: true });
          
          // Verify upload
          cy.contains(fileName).should('be.visible');
        });

        it('should handle all form inputs properly', () => {
          // Test various input types
          cy.visit('/projects/new');
          
          // Text inputs should be full width on mobile
          cy.get('input[name="name"]').should(($input) => {
            const inputWidth = $input.width();
            const parentWidth = $input.parent().width();
            expect(inputWidth).to.be.closeTo(parentWidth, 32); // Allow for padding
          });
          
          // Textareas should be properly sized
          cy.get('textarea').should('have.css', 'min-height').and('match', /\d+px/);
          
          // Selects should be tappable
          cy.get('select').each(($select) => {
            cy.wrap($select).should('have.css', 'min-height').and('match', /44px|4[5-9]px|[5-9]\dpx/);
          });
        });

        it('should handle tables with horizontal scroll', () => {
          cy.visit('/admin/activity');
          
          // Table should be scrollable on mobile
          if (viewport.width < 768) {
            cy.get('table').parent().should('have.css', 'overflow-x', 'auto');
          }
        });

        it('should show proper loading states', () => {
          cy.intercept('GET', '/api/projects/with-stats', { delay: 1000 }).as('slowProjects');
          cy.visit('/projects');
          
          // Should show loading skeletons
          cy.get('[data-testid="skeleton"]').should('be.visible');
          cy.wait('@slowProjects');
          cy.get('[data-testid="skeleton"]').should('not.exist');
        });

        it('should show proper error states', () => {
          cy.intercept('GET', '/api/projects/with-stats', { statusCode: 500 }).as('errorProjects');
          cy.visit('/projects');
          
          // Should show error message
          cy.contains('error', { matchCase: false }).should('be.visible');
        });

        it('should handle empty states', () => {
          cy.intercept('GET', '/api/projects/with-stats', { body: [] }).as('emptyProjects');
          cy.visit('/projects');
          
          // Should show empty state
          cy.contains('No projects').should('be.visible');
        });

        it('should have accessible touch targets everywhere', () => {
          cy.visit('/dashboard');
          
          // Check all interactive elements
          cy.get('button, a, input, select, textarea').each(($el) => {
            if ($el.is(':visible') && $el.css('display') !== 'none') {
              cy.wrap($el).then(($element) => {
                const height = $element.height();
                const width = $element.width();
                
                // Skip if element is part of a larger clickable area
                const parent = $element.parent();
                if (parent.is('a') || parent.is('button')) {
                  return;
                }
                
                // At least one dimension should be 44px+
                expect(Math.max(height, width)).to.be.at.least(44,
                  `Element ${$element.prop('tagName')} with text "${$element.text().trim()}" is too small`
                );
              });
            }
          });
        });
      });
    });
  });

  describe('Team Member Role - Mobile Testing', () => {
    beforeEach(() => {
      cy.viewport(375, 812); // iPhone X
      login('team');
    });

    it('should see limited navigation options', () => {
      cy.get('[data-mobile-menu-trigger]').click();
      
      // Should see these
      cy.get('[data-mobile-menu]').contains('Dashboard').should('be.visible');
      cy.get('[data-mobile-menu]').contains('Projects').should('be.visible');
      cy.get('[data-mobile-menu]').contains('Organizations').should('be.visible');
      
      // Should NOT see Admin
      cy.get('[data-mobile-menu]').contains('Admin').should('not.exist');
    });

    it('should manage assigned projects', () => {
      cy.visit('/projects');
      
      // Can view projects
      cy.get('[data-testid="project-card"]').should('be.visible');
      
      // Can create tasks in projects
      cy.get('[data-testid="project-card"]').first().click();
      cy.contains('Manage Tasks').click();
      cy.contains('Add Task').should('be.visible');
    });
  });

  describe('Client Role - Mobile Testing', () => {
    beforeEach(() => {
      cy.viewport(375, 812); // iPhone X
      login('client');
    });

    it('should see very limited navigation', () => {
      cy.get('[data-mobile-menu-trigger]').click();
      
      // Should only see these
      cy.get('[data-mobile-menu]').contains('Dashboard').should('be.visible');
      cy.get('[data-mobile-menu]').contains('Projects').should('be.visible');
      
      // Should NOT see these
      cy.get('[data-mobile-menu]').contains('Organizations').should('not.exist');
      cy.get('[data-mobile-menu]').contains('Admin').should('not.exist');
    });

    it('should have read-only access', () => {
      cy.visit('/projects');
      
      // Should NOT see create button
      cy.contains('button', 'New Project').should('not.exist');
      
      // Can view project details
      cy.get('[data-testid="project-card"]').first().click();
      
      // Should NOT see edit options
      cy.contains('button', 'Edit').should('not.exist');
    });
  });

  describe('Responsive Form Testing', () => {
    beforeEach(() => {
      cy.viewport(375, 812);
    });

    it('should handle login form on mobile', () => {
      cy.visit('/login');
      
      // Form should be properly sized
      cy.get('form').should('be.visible');
      
      // Inputs should be full width
      cy.get('#email').should(($input) => {
        const inputWidth = $input.outerWidth();
        expect(inputWidth).to.be.greaterThan(300);
      });
      
      // Password visibility toggle should work
      cy.get('#password').type('test');
      cy.get('#password').should('have.attr', 'type', 'password');
    });

    it('should handle registration form on mobile', () => {
      cy.visit('/register');
      
      // All inputs should be accessible
      cy.get('input[name="name"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('select[name="role"]').should('be.visible');
      
      // Submit button should be full width
      cy.get('button[type="submit"]').should(($btn) => {
        const btnWidth = $btn.outerWidth();
        const formWidth = $btn.closest('form').outerWidth();
        expect(btnWidth).to.be.closeTo(formWidth, 32);
      });
    });
  });

  describe('Landscape Orientation', () => {
    it('should handle landscape mode properly', () => {
      cy.viewport(812, 375); // Landscape
      login('admin');
      
      // Navigation should still work
      cy.get('[data-mobile-menu-trigger]').should('be.visible');
      
      // Content should not overflow
      cy.get('body').then(($body) => {
        const bodyWidth = $body.width();
        const scrollWidth = $body[0].scrollWidth;
        expect(scrollWidth).to.be.lte(bodyWidth);
      });
    });
  });

  describe('Performance on Mobile', () => {
    beforeEach(() => {
      cy.viewport(375, 812);
    });

    it('should load pages quickly', () => {
      login('admin');
      
      // Measure page load times
      const pages = ['/dashboard', '/projects', '/organizations'];
      
      pages.forEach(page => {
        const startTime = Date.now();
        cy.visit(page);
        cy.get('h1').should('be.visible');
        cy.then(() => {
          const loadTime = Date.now() - startTime;
          expect(loadTime).to.be.lessThan(3000); // 3 seconds max
        });
      });
    });
  });

  describe('Accessibility on Mobile', () => {
    beforeEach(() => {
      cy.viewport(375, 812);
      login('admin');
    });

    it('should have proper focus management', () => {
      // Open mobile menu
      cy.get('[data-mobile-menu-trigger]').click();
      
      // First focusable element in menu should receive focus
      cy.get('[data-mobile-menu]').should('be.visible');
      
      // Tab through menu items
      cy.focused().should('exist');
      
      // Escape should close menu
      cy.get('body').type('{esc}');
      cy.get('[data-mobile-menu]').should('not.exist');
    });

    it('should have proper ARIA labels', () => {
      // Check mobile menu trigger
      cy.get('[data-mobile-menu-trigger]').should('have.attr', 'aria-label');
      
      // Check other interactive elements
      cy.get('button').each(($btn) => {
        if ($btn.text().trim() === '' && $btn.is(':visible')) {
          // Icon-only buttons must have aria-label
          cy.wrap($btn).should('have.attr', 'aria-label');
        }
      });
    });
  });
});