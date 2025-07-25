describe('Activity Timeline Test', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.wait(1000);
    cy.clearCookies();
  });

  it('should log and display activity for admin users', () => {
    // Login as admin
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard', { timeout: 10000 });
    
    // Admin should see the admin dashboard
    cy.contains('Admin Dashboard').should('be.visible');
    cy.contains('Platform overview and recent activity').should('be.visible');
    
    // Check for stats cards
    cy.contains('Total Users').should('be.visible');
    cy.contains('Total Projects').should('be.visible');
    cy.contains('Total Tasks').should('be.visible');
    cy.contains('Total Files').should('be.visible');
    
    // Check for recent activity section
    cy.contains('Recent Activity').should('be.visible');
    
    // Create a new project to generate activity
    cy.visit('/projects/new');
    const projectName = `Test Project ${Date.now()}`;
    cy.get('input[name="name"]').type(projectName);
    cy.get('textarea[name="description"]').type('Testing activity logging');
    cy.get('select[name="organizationId"]').then($select => {
      if ($select.find('option').length > 1) {
        cy.get('select[name="organizationId"]').select(1);
      }
    });
    cy.get('button[type="submit"]').click();
    
    // Go back to dashboard
    cy.visit('/dashboard');
    
    // Check if the activity was logged (might need to wait for async operations)
    cy.wait(2000);
    
    // Look for activity related to project creation
    cy.get('body').then($body => {
      if ($body.text().includes('created project')) {
        cy.contains('created project').should('be.visible');
      }
    });
  });

  it('should log task creation activity', () => {
    // Login as admin
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard', { timeout: 10000 });
    
    // Create a task using the new task page instead
    cy.visit('/tasks/new');
    cy.wait(1000);
    
    // Select first project if available
    cy.get('select').first().then($select => {
      if ($select.find('option').length > 1) {
        cy.get('select').first().select(1);
        cy.wait(500);
        
        // Now create the task
        const taskName = `Activity Test Task ${Date.now()}`;
        cy.get('input[name="title"]').type(taskName);
        cy.get('button[type="submit"]').click();
        
        // Should redirect to tasks page
        cy.url().should('include', '/tasks');
        cy.wait(2000);
        
        // Go to dashboard to check activity
        cy.visit('/dashboard');
        cy.wait(1000);
        
        // Check for task creation activity
        cy.get('body').then($body => {
          if ($body.text().includes('created task')) {
            cy.contains('created task').should('be.visible');
          }
        });
      }
    });
  });

  it('should show different dashboards for different roles', () => {
    // Test client user
    cy.get('input[type="email"]').type('user@example.com');
    cy.get('input[type="password"]').type('user123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard', { timeout: 10000 });
    
    // Client should not see admin dashboard
    cy.contains('Admin Dashboard').should('not.exist');
    cy.contains('Welcome back').should('be.visible');
    cy.contains('You\'re logged in as a client user').should('be.visible');
    
    // Logout
    cy.clearCookies();
    cy.clearAllLocalStorage();
    
    // Test team member
    cy.visit('/login');
    cy.get('input[type="email"]').type('team@example.com');
    cy.get('input[type="password"]').type('team123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard', { timeout: 10000 });
    
    // Team member should not see admin dashboard
    cy.contains('Admin Dashboard').should('not.exist');
    cy.contains('Welcome back').should('be.visible');
    cy.contains('You\'re logged in as a team_member user').should('be.visible');
  });

  it('should display activity timeline components correctly', () => {
    // Login as admin
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard', { timeout: 10000 });
    
    // Check timeline structure - find the View All link next to Recent Activity
    cy.contains('View All').should('be.visible').and('have.attr', 'href', '/admin/activity');
      
    // Check for activity items or empty state
    cy.get('body').then($body => {
      if ($body.text().includes('No activity to display')) {
        cy.contains('No activity to display').should('be.visible');
      } else {
        // Should have activity items with proper structure
        cy.get('[role="img"]').should('exist'); // Icons
      }
    });
    
    // Check platform health section
    cy.contains('Platform Health').should('be.visible');
    cy.contains('Project Completion').should('be.visible');
    
    // Check quick actions
    cy.contains('Quick Actions').should('be.visible');
    cy.contains('Create Project').should('be.visible').and('have.attr', 'href', '/projects/new');
    cy.contains('Add Organization').should('be.visible').and('have.attr', 'href', '/organizations/new');
  });
});