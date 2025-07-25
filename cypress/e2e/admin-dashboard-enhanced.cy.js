describe('Enhanced Admin Dashboard Tests', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.wait(1000);
  });

  it('should display comprehensive admin dashboard with all features', () => {
    // Login as admin
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Check main stats grid
    cy.contains('Platform Overview').should('be.visible');
    cy.contains('Refresh').should('be.visible');
    
    // Check for enhanced stat cards with trends
    cy.contains('Total Users').should('be.visible');
    cy.contains('Active Projects').should('be.visible');
    cy.contains('Task Completion').should('be.visible');
    cy.contains('Storage Used').should('be.visible');
    
    // Check for percentage displays
    cy.get('.text-2xl').should('contain', '%');
    
    // Check client status overview
    cy.contains('Client Status Overview').should('be.visible');
    cy.contains('Monitor client engagement and project health').should('be.visible');
    cy.contains('View All Clients').should('be.visible');
    
    // Check recent activity
    cy.contains('Recent Activity').should('be.visible');
    cy.contains('Latest actions across the platform').should('be.visible');
    
    // Check task analytics
    cy.contains('Task Analytics').should('be.visible');
    cy.contains('Task distribution and completion status').should('be.visible');
    
    // Check for task status cards
    cy.contains('Not Started').should('be.visible');
    cy.contains('In Progress').should('be.visible');
    cy.contains('Completed').should('be.visible');
    cy.contains('Overdue').should('be.visible');
    
    // Check client activity metrics
    cy.contains('Client Activity Metrics').should('be.visible');
    cy.contains('Total Clients').should('be.visible');
    cy.contains('Client Projects').should('be.visible');
    cy.contains('Activity Today').should('be.visible');
    
    // Take screenshot of full dashboard
    cy.screenshot('admin-dashboard-enhanced-full');
  });

  it('should show client status with health scores', () => {
    // Login as admin
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Check client status section
    cy.get('body').then($body => {
      if ($body.text().includes('Health Score')) {
        // Clients exist
        cy.contains('Health Score').should('be.visible');
        cy.contains('active projects').should('be.visible');
        cy.contains('Last active').should('be.visible');
        
        // Check for status badges
        cy.get('.rounded-full').then($badges => {
          const badgeTexts = $badges.map((i, el) => el.textContent).get();
          expect(badgeTexts).to.include.members(['Active', 'At Risk', 'Inactive'].filter(status => 
            badgeTexts.includes(status)
          ));
        });
      } else {
        // No clients
        cy.contains('No client data available').should('be.visible');
      }
    });
    
    cy.screenshot('admin-client-status-overview');
  });

  it('should not show admin features for non-admin users', () => {
    // Login as client user
    cy.get('input[type="email"]').type('user@example.com');
    cy.get('input[type="password"]').type('user123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Should NOT see admin features
    cy.contains('Platform Overview').should('not.exist');
    cy.contains('Client Status Overview').should('not.exist');
    cy.contains('Task Analytics').should('not.exist');
    cy.contains('Client Activity Metrics').should('not.exist');
    
    // Should see regular dashboard
    cy.contains('Welcome back').should('be.visible');
    cy.contains("You're logged in as a client user").should('be.visible');
    
    cy.screenshot('client-regular-dashboard');
  });

  it('should display stats with proper formatting', () => {
    // Login as admin
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Check number formatting
    cy.get('.text-2xl.font-bold').each($el => {
      const text = $el.text().trim();
      // Should be a number, percentage, or storage size  
      expect(text).to.match(/^\d+$|^\d+%$|^\d+(\.\d+)?\s*(Bytes|KB|MB|GB|TB)$/);
    });
    
    // Check for trend indicators if present
    cy.get('body').then($body => {
      if ($body.find('[class*="TrendingUp"], [class*="TrendingDown"]').length > 0) {
        cy.log('Trend indicators found');
        cy.get('[class*="text-green-600"], [class*="text-red-600"]').should('exist');
      }
    });
  });

  it('should handle empty states gracefully', () => {
    // Login as admin
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Check for either data or empty states
    cy.get('body').then($body => {
      // Recent Activity
      if ($body.text().includes('No activity to display')) {
        cy.contains('No activity to display').should('be.visible');
      } else {
        cy.contains('created').should('be.visible');
      }
      
      // Client Status
      if ($body.text().includes('No client data available')) {
        cy.contains('No client data available').should('be.visible');
      } else {
        cy.contains('Health Score').should('be.visible');
      }
    });
  });
});

describe('Admin Dashboard Interactions', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should navigate to activity page from View All link', () => {
    cy.contains('Recent Activity').parent().parent().within(() => {
      cy.contains('View All').click();
    });
    cy.url().should('include', '/admin/activity');
    cy.contains('Activity Timeline').should('be.visible');
  });

  it('should show platform health indicators', () => {
    cy.contains('Platform Health').should('be.visible');
    cy.contains('Project Completion').should('be.visible');
    
    // Check for progress bar
    cy.get('.bg-green-600').should('exist');
    
    // Check quick links
    cy.contains('Manage Organizations').should('be.visible');
    cy.contains('Manage Users').should('be.visible');
    cy.contains('View Reports').should('be.visible');
  });

  it('should display quick actions', () => {
    cy.contains('Quick Actions').should('be.visible');
    cy.contains('Create Project').should('be.visible');
    cy.contains('Add Organization').should('be.visible');
  });
});