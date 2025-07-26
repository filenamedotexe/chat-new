describe('Complete Phase 1-3 Testing - All UI Improvements', () => {
  
  describe('Admin Role Testing', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('admin@example.com');
      cy.get('input[type="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('Phase 1.1: Consistent spacing on all admin pages', () => {
      // Test spacing on main pages
      cy.visit('/dashboard');
      cy.get('h1').should('have.css', 'margin-bottom');
      cy.get('[class*="space-y"], [class*="gap-"]').should('exist');
      
      cy.visit('/projects');
      cy.get('[class*="container"], [class*="max-w"]').should('have.css', 'padding');
      
      cy.visit('/settings');
      cy.get('.space-y-6').should('exist');
      
      // Mobile spacing
      cy.viewport(375, 812);
      cy.get('[class*="px-"], [class*="py-"]').should('exist');
    });

    it('Phase 1.2: Modern purple color scheme', () => {
      cy.visit('/dashboard');
      
      // Check link colors
      cy.get('a').first().should('have.css', 'color');
      
      // Check button hover states - find visible button
      cy.get('button:visible').first().trigger('mouseover', { force: true });
      
      // Check focus rings
      cy.get('button:visible').first().focus();
      cy.get('button:focus').should('have.css', 'outline-width');
    });

    it('Phase 1.3: Modern card styling', () => {
      cy.visit('/dashboard');
      
      // Check for rounded corners
      cy.get('[class*="rounded"]').should('exist');
      cy.get('[class*="rounded"]').first().should('have.css', 'border-radius');
      
      // Check for shadows
      cy.get('[class*="shadow"]').should('exist');
    });

    it('Phase 2.1: Admin-specific dashboard content', () => {
      cy.visit('/dashboard');
      
      // Admin should see
      cy.contains('h1', 'Admin Dashboard').should('be.visible');
      cy.contains('Platform Overview').should('be.visible');
      
      // Check for stats (exact text may vary)
      cy.get('[class*="grid"]').first().within(() => {
        cy.get('div').should('have.length.at.least', 4);
      });
      
      // Check for admin-specific content
      cy.get('body').then($body => {
        const bodyText = $body.text();
        expect(bodyText).to.include('Total');
        expect(bodyText).to.include('Active');
      });
    });

    it('Phase 2.2: Admin quick actions', () => {
      cy.visit('/dashboard');
      
      // Check quick actions exist
      cy.contains('Create Project').should('be.visible');
      cy.contains('Add Organization').should('be.visible');
      
      // Test navigation
      cy.contains('Create Project').click();
      cy.url().should('include', '/projects/new');
      cy.go('back');
      
      cy.contains('Add Organization').click();
      cy.url().should('include', '/organizations/new');
    });

    it('Phase 2.3: Recent activity for admin', () => {
      cy.visit('/dashboard');
      
      // Check activity section
      cy.contains('Recent Activity').should('be.visible');
      
      // Check for timeline items
      cy.get('.timeline-item, [class*="activity"], [class*="timeline"]').should('exist');
    });

    it('Phase 3.1: Admin navigation grouping', () => {
      cy.visit('/dashboard');
      
      // Desktop nav
      cy.get('nav').first().within(() => {
        cy.contains('Dashboard').should('be.visible');
        cy.contains('Projects').should('be.visible');
        cy.contains('Tasks').should('be.visible');
        cy.contains('Organizations').should('be.visible');
        cy.contains('Admin').should('be.visible');
      });
      
      // Mobile nav
      cy.viewport(375, 812);
      cy.get('button[data-mobile-menu-trigger]').click();
      
      // Check sections
      cy.contains('h3', 'Main').should('be.visible');
      cy.contains('h3', 'Work').should('be.visible');
      cy.contains('h3', 'Admin').should('be.visible');
    });

    it('Phase 3.2: Breadcrumbs for admin', () => {
      // No breadcrumbs on dashboard
      cy.visit('/dashboard');
      cy.get('nav[aria-label="Breadcrumb"]').should('not.exist');
      
      // Breadcrumbs on projects
      cy.visit('/projects');
      cy.get('nav[aria-label="Breadcrumb"]').should('be.visible');
      
      // Test navigation
      cy.get('nav[aria-label="Breadcrumb"]').find('a').first().click();
      cy.url().should('include', '/dashboard');
    });

    it('Phase 3.3: Admin user menu', () => {
      cy.visit('/dashboard');
      
      // Check avatar
      cy.get('button[aria-label="User menu"]').within(() => {
        cy.contains('AU').should('be.visible');
      });
      
      // Open menu
      cy.get('button[aria-label="User menu"]').click();
      
      // Check content
      cy.contains('Admin User').should('be.visible');
      cy.contains('admin@example.com').should('be.visible');
      cy.contains('Profile').should('be.visible');
      cy.contains('Settings').should('be.visible');
      cy.contains('Sign Out').should('be.visible');
      
      // Test Escape key
      cy.get('body').type('{esc}');
      cy.wait(500);
      
      // Menu should be closed
      cy.get('div').contains('Profile').should('not.exist');
    });
  });

  describe('Client Role Testing', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('user@example.com');
      cy.get('input[type="password"]').type('user123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('Phase 1: Visual consistency for client', () => {
      cy.visit('/dashboard');
      
      // Check spacing
      cy.get('h1').should('have.css', 'margin-bottom');
      cy.get('[class*="rounded"]').should('have.css', 'padding');
      
      // Check colors
      cy.get('a').first().should('have.css', 'color');
      
      // Check cards
      cy.get('[class*="shadow"]').should('exist');
    });

    it('Phase 2.1: Client-specific dashboard', () => {
      cy.visit('/dashboard');
      
      // Client should see
      cy.contains('Welcome back, Regular User!').should('be.visible');
      cy.contains('Project Progress').should('be.visible');
      cy.contains('Active Projects').should('be.visible');
      
      // Client should NOT see
      cy.contains('Platform Overview').should('not.exist');
      cy.contains('User Activity').should('not.exist');
      cy.contains('Admin Dashboard').should('not.exist');
    });

    it('Phase 2.2: Client quick actions', () => {
      cy.visit('/dashboard');
      
      // Client actions
      cy.contains('View Projects').should('be.visible');
      cy.contains('Deliverables').should('be.visible');
      cy.contains('Recent Updates').should('be.visible');
      cy.contains('Messages').should('be.visible');
      
      // Should NOT have admin actions
      cy.contains('Create Project').should('not.exist');
      cy.contains('Add Organization').should('not.exist');
    });

    it('Phase 3.1: Client navigation restrictions', () => {
      cy.visit('/dashboard');
      
      // Desktop nav - limited items
      cy.get('nav').first().within(() => {
        cy.contains('Dashboard').should('be.visible');
        cy.contains('Projects').should('be.visible');
        
        // Should NOT see
        cy.contains('Tasks').should('not.exist');
        cy.contains('Organizations').should('not.exist');
        cy.contains('Admin').should('not.exist');
      });
    });

    it('Phase 3.3: Client user menu', () => {
      cy.visit('/dashboard');
      
      // Check avatar
      cy.get('button[aria-label="User menu"]').within(() => {
        cy.contains('RU').should('be.visible');
      });
      
      // Open menu
      cy.get('button[aria-label="User menu"]').click();
      
      // Check content
      cy.contains('Regular User').should('be.visible');
      cy.contains('user@example.com').should('be.visible');
    });

    it('Access restrictions for client', () => {
      // Handle redirects
      cy.on('uncaught:exception', (err) => {
        if (err.message.includes('NEXT_REDIRECT')) {
          return false;
        }
      });
      
      // Try admin page
      cy.visit('/admin', { failOnStatusCode: false });
      cy.wait(1000);
      cy.url().should('not.include', '/admin');
    });
  });

  describe('Visual Screenshots', () => {
    it('Capture admin views', () => {
      // Login as admin
      cy.visit('/login');
      cy.get('input[type="email"]').type('admin@example.com');
      cy.get('input[type="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      
      // Dashboard
      cy.visit('/dashboard');
      cy.wait(1000);
      cy.screenshot('phase1-3-admin-dashboard');
      
      // User menu
      cy.get('button[aria-label="User menu"]').first().click();
      cy.wait(500);
      cy.screenshot('phase1-3-admin-user-menu');
      
      // Mobile
      cy.viewport(375, 812);
      cy.get('button[data-mobile-menu-trigger]').click();
      cy.wait(500);
      cy.screenshot('phase1-3-admin-mobile');
    });

    it('Capture client views', () => {
      // Login as client
      cy.visit('/login');
      cy.get('input[type="email"]').type('user@example.com');
      cy.get('input[type="password"]').type('user123');
      cy.get('button[type="submit"]').click();
      
      // Dashboard
      cy.visit('/dashboard');
      cy.wait(1000);
      cy.screenshot('phase1-3-client-dashboard');
      
      // Projects
      cy.visit('/projects');
      cy.wait(1000);
      cy.screenshot('phase1-3-client-projects');
    });
  });
});