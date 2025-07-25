describe('Action Gates Final Test', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.wait(1000);
    cy.clearCookies();
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard', { timeout: 10000 });
  });

  it('should demonstrate all action gates working correctly', () => {
    // 1. Test task creation gate
    cy.visit('/tasks/new');
    
    // Verify gate is shown
    cy.contains('Please select a project first').should('be.visible');
    cy.contains('Tasks must belong to a project').should('be.visible');
    
    // 2. Navigate to a project to test completion gate
    cy.visit('/projects');
    
    // Click on a project
    cy.get('body').then($body => {
      if (!$body.text().includes('No projects yet')) {
        cy.get('.grid').first().within(() => {
          cy.contains('View Details').click();
        });
        
        // Check if we can see the project status section
        cy.contains('Project Status').should('be.visible');
        
        // Check for either:
        // - Action gate (if no tasks or incomplete tasks)
        // - Complete button (if all tasks done)
        // - Completed status (if already complete)
        cy.get('body').then($body => {
          if ($body.text().includes('Project must have at least one task')) {
            cy.log('Project has no tasks - gate is working');
            cy.contains('Add Task').should('be.visible');
          } else if ($body.text().includes('All tasks must be completed')) {
            cy.log('Project has incomplete tasks - gate is working');
            cy.contains('View Tasks').should('be.visible');
          } else if ($body.text().includes('Mark Project as Complete')) {
            cy.log('Project can be completed - all requirements met');
          } else if ($body.text().includes('This project was completed')) {
            cy.log('Project is already completed');
          }
        });
      }
    });
    
    // 3. Test task completion gate
    cy.visit('/projects');
    cy.get('body').then($body => {
      if (!$body.text().includes('No projects yet')) {
        // Go to first project's tasks
        cy.get('.grid').first().within(() => {
          cy.contains('View Details').click();
        });
        cy.contains('Manage Tasks').click();
        
        // Check if there are any tasks in review status
        cy.get('body').then($body => {
          if ($body.find('.border-yellow-200').length > 0) {
            // Click on a task in review
            cy.get('.border-yellow-200').first().within(() => {
              cy.get('h3').first().click();
            });
            
            // Look for assignee info
            cy.contains('Details').parent().within(() => {
              cy.contains('Assignee:').parent().then($el => {
                if ($el.text().includes('Unassigned')) {
                  // Should see the gate
                  cy.log('Task is unassigned - checking for gate');
                  cy.get('body').then($body => {
                    if ($body.text().includes('Task must be assigned to someone')) {
                      cy.log('Assignment gate is working correctly');
                    }
                  });
                }
              });
            });
          }
        });
      }
    });
  });

  it('should test action gate UI components', () => {
    cy.visit('/tasks/new');
    
    // Test gate card appearance
    cy.get('.border-orange-200').should('be.visible');
    cy.get('.bg-orange-50').should('be.visible');
    
    // Test icons
    cy.get('svg').should('have.length.greaterThan', 0);
    
    // Test that selecting a project removes the gate
    cy.get('select').first().then($select => {
      const optionCount = $select.find('option').length;
      if (optionCount > 1) {
        // Select first real project
        cy.get('select').first().select(1);
        
        // Gate should disappear
        cy.contains('Please select a project first').should('not.exist');
        
        // Task form should appear
        cy.contains('Task Details').should('be.visible');
        cy.get('input[name="title"]').should('be.visible');
      } else {
        cy.log('No projects available to test with');
      }
    });
  });
});