describe('Action Gates Simple Test', () => {
  // Helper to create a project
  const createProject = (name) => {
    cy.visit('/projects/new');
    cy.get('input[name="name"]').type(name);
    cy.get('textarea[name="description"]').type('Testing action gates');
    cy.get('select[name="organizationId"]').then($select => {
      if ($select.find('option').length > 1) {
        cy.get('select[name="organizationId"]').select(1);
      }
    });
    cy.get('button[type="submit"]').click();
    cy.url().should('match', /\/projects\/[a-f0-9-]+$/);
  };

  beforeEach(() => {
    // Visit login page and wait for it to load
    cy.visit('/login');
    cy.wait(1000);
    
    // Clear any existing session
    cy.clearCookies();
    
    // Login
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Wait for redirect
    cy.url().should('include', '/dashboard', { timeout: 10000 });
  });

  it('should show action gate when project has no tasks', () => {
    // Create a new project
    createProject('Empty Project ' + Date.now());
    
    // Look for the action gate
    cy.contains('Project Status').should('be.visible');
    
    // Should show the requirement message
    cy.contains('Project must have at least one task').should('be.visible');
    cy.contains('A project needs tasks to track work progress').should('be.visible');
    
    // Should have Add Task CTA
    cy.contains('a', 'Add Task').should('be.visible').and('have.attr', 'href').and('include', '/tasks');
  });

  it('should show action gate for task creation without project', () => {
    cy.visit('/tasks/new');
    
    // Should see project selection section
    cy.contains('Select Project').should('be.visible');
    cy.contains('Tasks must be associated with a project').should('be.visible');
    
    // Should see the gate message
    cy.contains('Please select a project first').should('be.visible');
    
    // Task form should not be visible
    cy.contains('Task Details').should('not.exist');
    
    // Select a project if available
    cy.get('select').first().then($select => {
      if ($select.find('option').length > 1) {
        cy.get('select').first().select(1);
        // Now task form should appear
        cy.contains('Task Details').should('be.visible');
      }
    });
  });

  it('should show gate UI with proper styling', () => {
    createProject('Gate UI Test ' + Date.now());
    
    // Check gate card styling
    cy.get('.border-orange-200').should('be.visible');
    cy.get('.bg-orange-50').should('be.visible');
    
    // Check icons
    cy.get('.text-orange-600 svg').should('be.visible'); // Lock icon
    cy.get('h3 svg').should('be.visible'); // Alert icon
  });
});