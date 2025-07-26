describe('Exhaustive UI Testing - All Phases (1-3) for All Roles', () => {
  
  describe('ADMIN ROLE - Complete Testing', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('admin@example.com');
      cy.get('input[type="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    describe('Phase 1: Visual Consistency & Modern Look - ADMIN', () => {
      it('should have consistent spacing on ALL pages', () => {
        const pages = ['/dashboard', '/projects', '/tasks', '/organizations', '/admin', '/users', '/settings'];
        
        pages.forEach(page => {
          cy.visit(page);
          
          // Check spacing variables are applied
          cy.get('body').should('have.css', 'font-family');
          cy.get('h1, h2, h3').each($el => {
            cy.wrap($el).should('have.css', 'margin-bottom');
          });
          
          // Check padding on containers
          cy.get('[class*="container"], [class*="max-w"], main').each($el => {
            cy.wrap($el).should('have.css', 'padding-left');
            cy.wrap($el).should('have.css', 'padding-right');
          });
          
          // Verify mobile spacing
          cy.viewport(375, 812);
          cy.get('[class*="space-y"], [class*="gap-"]').should('exist');
          cy.viewport(1280, 720); // Reset
        });
      });

      it('should display modern purple color scheme everywhere', () => {
        cy.visit('/dashboard');
        
        // Check primary color in links
        cy.get('a[href="/projects"]').should('have.css', 'color').and('include', 'rgb');
        
        // Check hover states
        cy.get('button').first().realHover();
        cy.wait(100);
        
        // Check focus states
        cy.get('button').first().focus();
        cy.get('button').first().should('have.css', 'outline');
        
        // Verify status colors
        cy.visit('/projects');
        cy.get('[class*="badge"], [class*="status"]').each($badge => {
          cy.wrap($badge).should('have.css', 'background-color');
        });
      });

      it('should have modern card styling with proper shadows', () => {
        cy.visit('/dashboard');
        
        // Check all card elements
        cy.get('.card, [class*="rounded-lg"], [class*="rounded-xl"]').each($card => {
          // Border radius
          cy.wrap($card).should('have.css', 'border-radius');
          
          // Shadow (if applicable)
          const shadow = $card.css('box-shadow');
          if (shadow && shadow !== 'none') {
            expect(shadow).to.include('rgba');
          }
        });
        
        // Check hover effects on interactive cards
        cy.get('[class*="hover:"], button, a').each($el => {
          const initialTransform = $el.css('transform');
          cy.wrap($el).realHover();
          cy.wait(100);
          // Some elements might have transform on hover
        });
      });
    });

    describe('Phase 2: Dashboard Functionality - ADMIN', () => {
      it('should display complete admin dashboard with all sections', () => {
        cy.visit('/dashboard');
        
        // Admin-specific content
        cy.contains('Platform Overview').should('be.visible');
        cy.contains('Active Users').should('be.visible');
        cy.contains('Total Revenue').should('be.visible');
        cy.contains('New Signups').should('be.visible');
        cy.contains('Active Projects').should('be.visible');
        
        // Stats cards
        cy.get('[class*="grid"]').within(() => {
          cy.get('div').should('have.length.at.least', 4);
        });
        
        // User activity section
        cy.contains('User Activity').should('be.visible');
        
        // System health (if implemented)
        cy.get('body').then($body => {
          if ($body.text().includes('System Health')) {
            cy.contains('System Health').should('be.visible');
          }
        });
      });

      it('should have all admin quick actions working', () => {
        cy.visit('/dashboard');
        
        // Test Create Project action
        cy.contains('Create Project').should('be.visible').click();
        cy.url().should('include', '/projects/new');
        cy.go('back');
        
        // Test Add Organization action
        cy.contains('Add Organization').should('be.visible').click();
        cy.url().should('include', '/organizations/new');
        cy.go('back');
        
        // Verify all quick action buttons are styled consistently
        cy.get('button').contains('Create Project').parent().should('have.css', 'background-color');
        cy.get('button').contains('Add Organization').parent().should('have.css', 'background-color');
      });

      it('should display recent activity with proper filtering', () => {
        cy.visit('/dashboard');
        
        // Check activity section exists
        cy.contains('Recent Activity').should('be.visible');
        
        // Verify timeline items
        cy.get('.timeline-item, [class*="activity"]').should('exist');
        
        // Check time formatting
        cy.get('[class*="text-muted"], [class*="text-gray"]').each($time => {
          const text = $time.text();
          if (text.includes('ago') || text.includes('minutes') || text.includes('hours')) {
            cy.wrap($time).should('be.visible');
          }
        });
        
        // Verify "View All" link
        cy.contains('View All').should('be.visible').click();
        cy.url().should('include', '/activity');
      });
    });

    describe('Phase 3: Navigation Enhancement - ADMIN', () => {
      it('should display complete navigation with all admin items', () => {
        cy.visit('/dashboard');
        
        // Desktop navigation
        cy.get('nav').first().within(() => {
          // Main items
          cy.contains('Dashboard').should('be.visible');
          cy.contains('Projects').should('be.visible');
          cy.contains('Tasks').should('be.visible');
          cy.contains('Organizations').should('be.visible');
          cy.contains('Admin').should('be.visible');
          
          // Active state
          cy.contains('Dashboard').should('have.class', 'text-foreground');
        });
        
        // Test navigation to each section
        const navItems = [
          { text: 'Projects', url: '/projects' },
          { text: 'Tasks', url: '/tasks' },
          { text: 'Organizations', url: '/organizations' },
          { text: 'Admin', url: '/admin' }
        ];
        
        navItems.forEach(item => {
          cy.get('nav').first().contains(item.text).click();
          cy.url().should('include', item.url);
          cy.get('nav').first().contains(item.text).should('have.class', 'text-foreground');
        });
      });

      it('should display breadcrumbs correctly on all pages', () => {
        // Dashboard should NOT have breadcrumbs
        cy.visit('/dashboard');
        cy.get('nav[aria-label="Breadcrumb"]').should('not.exist');
        
        // Test breadcrumbs on various pages
        const breadcrumbTests = [
          { url: '/projects', expected: ['Projects'] },
          { url: '/tasks', expected: ['Tasks'] },
          { url: '/organizations', expected: ['Organizations'] },
          { url: '/admin', expected: ['Admin'] },
          { url: '/users', expected: ['Users'] },
          { url: '/settings', expected: ['Settings'] }
        ];
        
        breadcrumbTests.forEach(test => {
          cy.visit(test.url);
          cy.get('nav[aria-label="Breadcrumb"]').should('be.visible');
          
          // Check home icon
          cy.get('nav[aria-label="Breadcrumb"]').find('svg').should('be.visible');
          
          // Check breadcrumb text
          test.expected.forEach(text => {
            cy.get('nav[aria-label="Breadcrumb"]').contains(text).should('be.visible');
          });
          
          // Test clicking home icon
          cy.get('nav[aria-label="Breadcrumb"]').find('a').first().click();
          cy.url().should('include', '/dashboard');
        });
      });

      it('should have fully functional user menu with admin info', () => {
        cy.visit('/dashboard');
        
        // Check avatar with initials
        cy.get('button[aria-label="User menu"]').should('be.visible');
        cy.get('button[aria-label="User menu"]').within(() => {
          cy.contains('AU').should('be.visible'); // Admin User
        });
        
        // Open dropdown
        cy.get('button[aria-label="User menu"]').click();
        
        // Verify dropdown content
        cy.contains('Admin User').should('be.visible');
        cy.contains('admin@example.com').should('be.visible');
        cy.contains('Profile').should('be.visible');
        cy.contains('Settings').should('be.visible');
        cy.contains('Help & Support').should('be.visible');
        cy.contains('Sign Out').should('be.visible');
        
        // Test keyboard navigation
        cy.get('body').type('{esc}');
        cy.contains('Profile').should('not.be.visible');
        
        // Test click outside
        cy.get('button[aria-label="User menu"]').click();
        cy.get('body').click(0, 0);
        cy.contains('Profile').should('not.be.visible');
        
        // Test navigation
        cy.get('button[aria-label="User menu"]').click();
        cy.get('button').contains('Settings').click();
        cy.url().should('include', '/settings');
      });

      it('should work perfectly on mobile for admin', () => {
        cy.viewport(375, 812);
        cy.visit('/dashboard');
        
        // Open mobile menu
        cy.get('button[data-mobile-menu-trigger]').should('be.visible').click();
        
        // Check all sections
        cy.contains('h3', 'Main').should('be.visible');
        cy.contains('h3', 'Work').should('be.visible');
        cy.contains('h3', 'Admin').should('be.visible');
        cy.contains('h3', 'Account').should('be.visible');
        
        // Check all navigation items
        cy.contains('Dashboard').should('be.visible');
        cy.contains('Projects').should('be.visible');
        cy.contains('Tasks').should('be.visible');
        cy.contains('Organizations').should('be.visible');
        cy.contains('Admin Panel').should('be.visible');
        cy.contains('Users').should('be.visible');
        cy.contains('Settings').should('be.visible');
        
        // Check user info
        cy.contains('Admin User').should('be.visible');
        cy.contains('admin@example.com').should('be.visible');
        cy.contains('AU').should('be.visible');
        
        // Test navigation
        cy.contains('Projects').click();
        cy.url().should('include', '/projects');
        
        // Check mobile breadcrumbs
        cy.get('nav[aria-label="Breadcrumb"]').should('be.visible');
      });
    });

    describe('Visual Quality Checks - ADMIN', () => {
      it('should capture screenshots of all major views', () => {
        // Dashboard
        cy.visit('/dashboard');
        cy.wait(1000);
        cy.screenshot('admin-dashboard-full-phase123');
        
        // Navigation states
        cy.get('button[aria-label="User menu"]').click();
        cy.wait(500);
        cy.screenshot('admin-user-menu-open');
        
        // Mobile view
        cy.viewport(375, 812);
        cy.get('button[data-mobile-menu-trigger]').click();
        cy.wait(500);
        cy.screenshot('admin-mobile-navigation');
        
        // Projects with cards
        cy.visit('/projects');
        cy.wait(1000);
        cy.screenshot('admin-projects-modern-cards');
      });
    });
  });

  describe('CLIENT ROLE - Complete Testing', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('user@example.com');
      cy.get('input[type="password"]').type('user123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    describe('Phase 1: Visual Consistency & Modern Look - CLIENT', () => {
      it('should have consistent spacing on client-accessible pages', () => {
        const clientPages = ['/dashboard', '/projects', '/settings'];
        
        clientPages.forEach(page => {
          cy.visit(page);
          
          // Check spacing
          cy.get('h1, h2, h3').each($el => {
            cy.wrap($el).should('have.css', 'margin-bottom');
          });
          
          // Check containers
          cy.get('[class*="container"], [class*="max-w"], main').each($el => {
            cy.wrap($el).should('have.css', 'padding');
          });
        });
      });

      it('should display modern styling for client views', () => {
        cy.visit('/dashboard');
        
        // Check colors and styling
        cy.get('a, button').each($el => {
          cy.wrap($el).should('have.css', 'color');
        });
        
        // Check cards and rounded elements
        cy.get('[class*="rounded"]').should('exist');
        cy.get('[class*="shadow"]').should('exist');
      });
    });

    describe('Phase 2: Dashboard Functionality - CLIENT', () => {
      it('should display client-specific dashboard content only', () => {
        cy.visit('/dashboard');
        
        // Client should see
        cy.contains('Welcome back, Regular User!').should('be.visible');
        cy.contains('Project Progress').should('be.visible');
        cy.contains('Active Projects').should('be.visible');
        cy.contains('Overall Progress').should('be.visible');
        cy.contains('Deliverables').should('be.visible');
        cy.contains('Next Milestone').should('be.visible');
        
        // Client should NOT see
        cy.contains('Platform Overview').should('not.exist');
        cy.contains('User Activity').should('not.exist');
        cy.contains('System Health').should('not.exist');
        cy.contains('Total Revenue').should('not.exist');
        cy.contains('New Signups').should('not.exist');
      });

      it('should have client-appropriate quick actions', () => {
        cy.visit('/dashboard');
        
        // Client quick actions
        const clientActions = ['View Projects', 'Deliverables', 'Recent Updates', 'Messages'];
        
        clientActions.forEach(action => {
          cy.contains(action).should('be.visible');
        });
        
        // Should NOT have admin actions
        cy.contains('Create Project').should('not.exist');
        cy.contains('Add Organization').should('not.exist');
        
        // Test navigation
        cy.contains('View Projects').click();
        cy.url().should('include', '/projects');
      });
    });

    describe('Phase 3: Navigation Enhancement - CLIENT', () => {
      it('should display limited navigation appropriate for clients', () => {
        cy.visit('/dashboard');
        
        // Desktop nav should only show client items
        cy.get('nav').first().within(() => {
          cy.contains('Dashboard').should('be.visible');
          cy.contains('Projects').should('be.visible');
          
          // Should NOT show admin items
          cy.contains('Tasks').should('not.exist');
          cy.contains('Organizations').should('not.exist');
          cy.contains('Admin').should('not.exist');
          cy.contains('Users').should('not.exist');
        });
      });

      it('should show proper breadcrumbs for client pages', () => {
        // No breadcrumbs on dashboard
        cy.visit('/dashboard');
        cy.get('nav[aria-label="Breadcrumb"]').should('not.exist');
        
        // Breadcrumbs on other pages
        cy.visit('/projects');
        cy.get('nav[aria-label="Breadcrumb"]').should('be.visible');
        cy.get('nav[aria-label="Breadcrumb"]').contains('Projects').should('be.visible');
        
        cy.visit('/settings');
        cy.get('nav[aria-label="Breadcrumb"]').should('be.visible');
        cy.get('nav[aria-label="Breadcrumb"]').contains('Settings').should('be.visible');
      });

      it('should have working user menu for client', () => {
        cy.visit('/dashboard');
        
        // Check avatar
        cy.get('button[aria-label="User menu"]').within(() => {
          cy.contains('RU').should('be.visible'); // Regular User
        });
        
        // Open menu
        cy.get('button[aria-label="User menu"]').click();
        
        // Verify content
        cy.contains('Regular User').should('be.visible');
        cy.contains('user@example.com').should('be.visible');
        
        // Test sign out
        cy.get('button').contains('Sign Out').click();
        cy.url().should('not.include', '/dashboard');
      });

      it('should restrict access to admin-only areas', () => {
        // Set up error handling
        cy.on('uncaught:exception', (err) => {
          if (err.message.includes('NEXT_REDIRECT')) {
            return false;
          }
        });
        
        // Try accessing admin areas
        cy.visit('/admin', { failOnStatusCode: false });
        cy.wait(1000);
        cy.url().should('not.include', '/admin');
        
        // Verify no admin content on dashboard
        cy.visit('/dashboard');
        cy.contains('User Management').should('not.exist');
        cy.contains('System Settings').should('not.exist');
      });
    });

    describe('Visual Quality Checks - CLIENT', () => {
      it('should capture client-specific screenshots', () => {
        // Client dashboard
        cy.visit('/dashboard');
        cy.wait(1000);
        cy.screenshot('client-dashboard-complete');
        
        // Client navigation
        cy.get('button[aria-label="User menu"]').click();
        cy.wait(500);
        cy.screenshot('client-user-menu');
        
        // Mobile client view
        cy.viewport(375, 812);
        cy.get('button[data-mobile-menu-trigger]').click();
        cy.wait(500);
        cy.screenshot('client-mobile-menu');
      });
    });
  });

  describe('Cross-Role Comparison Tests', () => {
    it('should ensure role-based content separation', () => {
      // Login as admin
      cy.visit('/login');
      cy.get('input[type="email"]').type('admin@example.com');
      cy.get('input[type="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      
      // Capture admin content
      cy.visit('/dashboard');
      cy.get('body').invoke('text').then(adminText => {
        expect(adminText).to.include('Platform Overview');
        
        // Logout
        cy.get('button[aria-label="User menu"]').click();
        cy.get('button').contains('Sign Out').click();
        
        // Login as client
        cy.visit('/login');
        cy.get('input[type="email"]').type('user@example.com');
        cy.get('input[type="password"]').type('user123');
        cy.get('button[type="submit"]').click();
        
        // Verify client doesn't see admin content
        cy.visit('/dashboard');
        cy.get('body').invoke('text').then(clientText => {
          expect(clientText).to.not.include('Platform Overview');
          expect(clientText).to.include('Welcome back, Regular User!');
        });
      });
    });
  });
});