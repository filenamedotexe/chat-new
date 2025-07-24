describe('Progress UI Components Test', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  describe('Project Cards Progress', () => {
    it('should display compact progress bars on project cards', () => {
      cy.visit('/projects');
      cy.contains('h1', 'Projects').should('be.visible');
      
      // Wait for project data to load
      cy.wait(1000);
      
      cy.get('body').then($body => {
        if (!$body.text().includes('No projects yet')) {
          // Check for compact progress bar elements
          cy.get('.grid').first().within(() => {
            // Should show task count
            cy.contains(/\d+\/\d+ tasks/).should('be.visible');
            
            // Should show percentage
            cy.contains(/\d+%/).should('be.visible');
            
            // Should have progress bar
            cy.get('[role="progressbar"]').should('exist');
          });
        }
      });
    });
  });

  describe('Project Detail Page Progress', () => {
    it('should display full progress bar and checklist on project detail page', () => {
      cy.visit('/projects');
      
      cy.get('body').then($body => {
        if (!$body.text().includes('No projects yet')) {
          // Click on first project
          cy.get('.grid').first().within(() => {
            cy.contains('View Details').click();
          });
          
          // Should be on project detail page
          cy.url().should('match', /\/projects\/[a-f0-9-]+$/);
          
          // Check for progress bar with label
          cy.contains('Progress').should('be.visible');
          cy.get('[role="progressbar"]').should('exist');
          
          // Check for task breakdown
          cy.contains('done').should('be.visible');
          cy.contains('in progress').should('be.visible');
          cy.contains('review').should('be.visible');
          cy.contains('pending').should('be.visible');
          
          // Check for progress checklist - the header includes the project name
          cy.contains(/.*Progress$/).should('be.visible');
          cy.contains('Tasks Completed').should('be.visible');
          cy.contains('Tasks In Progress').should('be.visible');
          cy.contains('Tasks In Review').should('be.visible');
          cy.contains('Tasks Not Started').should('be.visible');
          
          // Check for completion requirements
          cy.contains('Completion Requirements').should('be.visible');
          cy.contains('Completion Requirements').click();
          cy.contains('All tasks must be marked as "Done"').should('be.visible');
        }
      });
    });

    it('should show different progress colors based on percentage', () => {
      cy.visit('/projects');
      
      cy.get('body').then($body => {
        if (!$body.text().includes('No projects yet')) {
          // Navigate to a project
          cy.get('.grid').first().within(() => {
            cy.contains('View Details').click();
          });
          
          // Check that progress bar exists and has appropriate color class
          cy.get('[role="progressbar"]').then($el => {
            const classes = $el.attr('class');
            const hasColorClass = /bg-(red|orange|yellow|blue|green)-500/.test(classes);
            expect(hasColorClass).to.be.true;
          });
        }
      });
    });
  });

  describe('Progress States', () => {
    it('should handle projects with no tasks gracefully', () => {
      cy.visit('/projects');
      
      // Look for any project showing 0 tasks or 0%
      cy.get('body').then($body => {
        const hasZeroProgress = $body.text().includes('0/') || $body.text().includes('0%');
        if (hasZeroProgress) {
          cy.log('Found project with 0 progress - UI handles it correctly');
          cy.contains(/0\/\d+ tasks|0%/).should('be.visible');
        }
      });
    });

    it('should show completion state for 100% progress', () => {
      cy.visit('/projects');
      
      cy.get('body').then($body => {
        if ($body.text().includes('100%')) {
          cy.log('Found completed project');
          // Should show checkmark or completion indicator
          cy.contains('100%').parent().within(() => {
            cy.contains('✓').should('be.visible');
          });
        }
      });
    });
  });

  describe('Progress Animations', () => {
    it('should animate progress bar on page load', () => {
      cy.visit('/projects');
      
      cy.get('body').then($body => {
        if (!$body.text().includes('No projects yet')) {
          // Navigate to project detail
          cy.get('.grid').first().within(() => {
            cy.contains('View Details').click();
          });
          
          // Progress bar should have transition class
          cy.get('[role="progressbar"]').first()
            .should('have.class', 'transition-all')
            .should('have.css', 'transition-duration');
        }
      });
    });
  });
});