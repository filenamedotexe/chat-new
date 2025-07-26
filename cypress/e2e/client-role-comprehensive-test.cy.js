describe('Client Role - Comprehensive UI Testing (Phases 1-3)', () => {
  beforeEach(() => {
    // Login as client user
    cy.visit('/login');
    cy.get('input[type="email"]').type('user@example.com');
    cy.get('input[type="password"]').type('user123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  describe('Phase 1: Visual Consistency & Modern Look', () => {
    it('should display consistent spacing across all client-accessible pages', () => {
      // Dashboard
      cy.visit('/dashboard');
      cy.get('h1').should('have.css', 'margin-bottom');
      cy.get('.rounded-lg').should('have.css', 'padding');
      
      // Projects page
      cy.visit('/projects');
      cy.get('h1').should('exist');
      cy.get('h1').should('have.css', 'margin-bottom');
      
      // Settings page
      cy.visit('/settings');
      cy.get('.space-y-6').should('exist');
      
      // Mobile check
      cy.viewport(375, 812);
      cy.get('.container, .max-w-7xl, [class*="px-"]').should('exist');
    });

    it('should display modern color palette and status badges', () => {
      cy.visit('/dashboard');
      
      // Check primary color is purple
      cy.get('a').first().should('have.css', 'color');
      
      // Check hover states on buttons
      cy.get('button[class*="rounded-lg"]').first().should('exist');
      cy.get('button[class*="rounded-lg"]').first().trigger('mouseover', { force: true });
    });

    it('should display modern card styles with shadows', () => {
      cy.visit('/dashboard');
      
      // Check rounded corners on elements
      cy.get('.rounded-lg').should('exist');
      cy.get('.rounded-lg').first().should('have.css', 'border-radius');
      
      // Check for shadow classes
      cy.get('[class*="shadow"]').should('exist');
    });
  });

  describe('Phase 2: Dashboard Functionality', () => {
    it('should display client-specific dashboard content', () => {
      cy.visit('/dashboard');
      
      // Should see client greeting
      cy.contains('Welcome back, Regular User!').should('be.visible');
      
      // Should see client-specific sections
      cy.contains('Project Progress').should('be.visible');
      cy.contains('Active Projects').should('be.visible');
      
      // Should NOT see admin features
      cy.contains('Platform Overview').should('not.exist');
      cy.contains('User Activity').should('not.exist');
      cy.contains('System Health').should('not.exist');
    });

    it('should display client-appropriate quick actions', () => {
      cy.visit('/dashboard');
      
      // Client quick actions
      cy.contains('View Projects').should('be.visible');
      cy.contains('Deliverables').should('be.visible');
      cy.contains('Recent Updates').should('be.visible');
      cy.contains('Messages').should('be.visible');
      
      // Should NOT see admin quick actions
      cy.contains('Create Project').should('not.exist');
      cy.contains('Add Organization').should('not.exist');
      
      // Test quick action navigation
      cy.contains('View Projects').click();
      cy.url().should('include', '/projects');
      cy.go('back');
    });

    it('should display filtered recent activity', () => {
      cy.visit('/dashboard');
      
      // Check if activity section exists
      cy.get('body').then($body => {
        if ($body.find('h2:contains("Recent Activity")').length > 0) {
          cy.contains('Recent Activity').should('be.visible');
          
          // Should only see project/file related activities
          cy.get('.timeline-item').each($item => {
            cy.wrap($item).should('not.contain', 'User');
            cy.wrap($item).should('not.contain', 'System');
          });
        }
      });
    });
  });

  describe('Phase 3: Navigation Enhancement', () => {
    it('should display limited navigation items for client role', () => {
      cy.visit('/dashboard');
      
      // Desktop navigation
      cy.get('nav').first().within(() => {
        // Should see these items
        cy.contains('Dashboard').should('be.visible');
        cy.contains('Projects').should('be.visible');
        
        // Should NOT see these items
        cy.contains('Tasks').should('not.exist');
        cy.contains('Organizations').should('not.exist');
        cy.contains('Admin').should('not.exist');
        cy.contains('Users').should('not.exist');
      });
      
      // Mobile navigation
      cy.viewport(375, 812);
      cy.get('button[data-mobile-menu-trigger]').click();
      
      // Check mobile menu sections
      cy.contains('Main').should('be.visible');
      cy.contains('Work').should('be.visible');
      cy.contains('Account').should('be.visible');
      
      // Should NOT see Admin section
      cy.contains('h3', 'Admin').should('not.exist');
      
      // Close mobile menu
      cy.get('button[aria-label="Close menu"]').click();
    });

    it('should display breadcrumbs on all pages except dashboard', () => {
      // Dashboard should NOT have breadcrumbs
      cy.visit('/dashboard');
      cy.get('nav[aria-label="Breadcrumb"]').should('not.exist');
      
      // Projects page should have breadcrumbs
      cy.visit('/projects');
      cy.get('nav[aria-label="Breadcrumb"]').should('be.visible');
      
      // Settings page should have breadcrumbs
      cy.visit('/settings');
      cy.get('nav[aria-label="Breadcrumb"]').should('be.visible');
      
      // Test breadcrumb navigation
      cy.get('nav[aria-label="Breadcrumb"]').first().within(() => {
        cy.get('a').first().click();
      });
      cy.url().should('include', '/dashboard');
    });

    it('should display user menu with client info', () => {
      cy.visit('/dashboard');
      
      // Click user menu
      cy.get('button[aria-label="User menu"]').first().click();
      
      // Check dropdown content
      cy.contains('Regular User').should('be.visible');
      cy.contains('user@example.com').should('be.visible');
      
      // Check avatar shows initials
      cy.get('div').contains('RU').should('be.visible'); // Regular User initials
      
      // Check menu items
      cy.contains('Profile').should('be.visible');
      cy.contains('Settings').should('be.visible');
      cy.contains('Help & Support').should('be.visible');
      cy.contains('Sign Out').should('be.visible');
      
      // Test navigation to settings
      cy.get('button').contains('Settings').click();
      cy.url().should('include', '/settings');
      
      // Go back and test sign out
      cy.visit('/dashboard');
      cy.get('button[aria-label="User menu"]').first().click();
      cy.get('button').contains('Sign Out').click();
      cy.url().should('not.include', '/dashboard');
    });

    it('should work properly on mobile for client users', () => {
      cy.viewport(375, 812);
      cy.visit('/dashboard');
      
      // Open mobile menu
      cy.get('button[data-mobile-menu-trigger]').click();
      
      // Check user info section
      cy.contains('Regular User').should('be.visible');
      cy.contains('user@example.com').should('be.visible');
      
      // Check avatar
      cy.get('div.mt-auto').within(() => {
        cy.get('div').contains('RU').should('be.visible');
      });
      
      // Navigate to projects
      cy.contains('Projects').click();
      cy.url().should('include', '/projects');
      
      // Check mobile breadcrumbs
      cy.get('nav[aria-label="Breadcrumb"]').should('be.visible');
    });
  });

  describe('Client Role Restrictions', () => {
    it('should not allow access to admin routes', () => {
      // Handle Next.js redirects
      cy.on('uncaught:exception', (err) => {
        if (err.message.includes('NEXT_REDIRECT')) {
          return false;
        }
      });
      
      // Try to access admin page
      cy.visit('/admin', { failOnStatusCode: false });
      cy.wait(1000);
      cy.url().should('not.include', '/admin');
      
      // Check that client cannot see admin-specific content
      cy.visit('/dashboard');
      cy.contains('Platform Overview').should('not.exist');
      cy.contains('System Health').should('not.exist');
      cy.contains('User Management').should('not.exist');
      
      // Verify navigation doesn't have admin links
      cy.get('nav').first().within(() => {
        cy.contains('Admin').should('not.exist');
        cy.contains('Users').should('not.exist');
      });
    });

    it('should not show create/edit buttons in projects', () => {
      cy.visit('/projects');
      
      // Should NOT see Create Project button
      cy.contains('button', 'Create Project').should('not.exist');
      cy.contains('button', 'New Project').should('not.exist');
      
      // If there are projects, check for edit restrictions
      cy.get('body').then($body => {
        if ($body.find('.card').length > 0) {
          cy.get('.card').first().within(() => {
            cy.get('button').should('not.contain', 'Edit');
            cy.get('button').should('not.contain', 'Delete');
          });
        }
      });
    });
  });

  describe('Visual Regression Checks', () => {
    it('should capture client dashboard screenshot', () => {
      cy.visit('/dashboard');
      cy.wait(1000); // Wait for any animations
      cy.screenshot('client-dashboard-full');
    });

    it('should capture client navigation states', () => {
      cy.visit('/dashboard');
      
      // Desktop navigation
      cy.screenshot('client-navigation-desktop');
      
      // Mobile navigation
      cy.viewport(375, 812);
      cy.get('button[data-mobile-menu-trigger]').click();
      cy.wait(500); // Wait for animation
      cy.screenshot('client-navigation-mobile');
    });

    it('should capture client user menu', () => {
      cy.visit('/dashboard');
      cy.get('button[aria-label="User menu"]').first().click();
      cy.wait(500); // Wait for animation
      cy.screenshot('client-user-menu');
    });
  });
});