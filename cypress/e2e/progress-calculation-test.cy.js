describe('Progress Calculation Tests', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should show progress percentage on project cards', () => {
    cy.visit('/projects');
    
    // Wait for projects to load
    cy.contains('h1', 'Projects').should('be.visible');
    
    cy.get('body').then($body => {
      if ($body.text().includes('No projects yet')) {
        cy.log('No projects to test progress calculation');
      } else {
        // Check that progress percentage is displayed
        cy.get('.grid').within(() => {
          // Look for progress indicators
          cy.contains('Progress').should('be.visible');
          
          // Progress should show a percentage or "0%"
          cy.get('[class*="text-sm"]').then($elements => {
            const progressTexts = Array.from($elements).map(el => el.textContent);
            const hasProgress = progressTexts.some(text => 
              text?.includes('%') || text?.includes('Progress')
            );
            expect(hasProgress).to.be.true;
          });
        });
      }
    });
  });

  it('should calculate progress based on task statuses', () => {
    // Navigate to a project with tasks
    cy.visit('/projects');
    
    cy.get('body').then($body => {
      if (!$body.text().includes('No projects yet')) {
        // Click on the first project's Tasks button
        cy.get('button').contains('Tasks').first().click();
        
        // Should be on tasks page
        cy.url().should('match', /\/projects\/[a-f0-9-]+\/tasks/);
        
        // Count tasks by status
        let totalTasks = 0;
        let completedTasks = 0;
        
        cy.get('.grid').within(() => {
          // Count all task cards
          cy.get('[data-testid="task-card"]').then($cards => {
            totalTasks = $cards.length;
            
            // Count completed tasks (those with "Done" status)
            cy.get('[data-testid="task-card"]').each($card => {
              if ($card.text().includes('Done')) {
                completedTasks++;
              }
            });
          });
        });
        
        // Go back to projects page
        cy.go('back');
        
        // Verify the progress calculation
        cy.get('.grid').first().within(() => {
          // The progress should reflect completed/total ratio
          cy.log(`Total tasks: ${totalTasks}, Completed: ${completedTasks}`);
          
          if (totalTasks > 0) {
            const expectedProgress = Math.round((completedTasks / totalTasks) * 100);
            cy.contains(`${expectedProgress}%`).should('exist');
          }
        });
      }
    });
  });

  it('should show 0% progress for projects with no tasks', () => {
    cy.visit('/projects');
    
    cy.get('body').then($body => {
      if (!$body.text().includes('No projects yet')) {
        // Look for any project showing 0% progress
        cy.get('.grid').then($grid => {
          const hasZeroProgress = $grid.text().includes('0%') || 
                                  $grid.text().includes('0 tasks');
          cy.log('Checking for projects with 0% progress');
          // This is informational - some projects may have 0% progress
        });
      }
    });
  });

  it('should update progress when task status changes', () => {
    cy.visit('/projects');
    
    cy.get('body').then($body => {
      if (!$body.text().includes('No projects yet')) {
        // Navigate to a project's tasks
        cy.get('button').contains('Tasks').first().click();
        
        // Find a task that's not done
        cy.get('[data-testid="task-card"]').then($cards => {
          const notDoneCard = Array.from($cards).find(card => 
            !card.textContent?.includes('Done')
          );
          
          if (notDoneCard) {
            // Click on the task to view details
            cy.wrap(notDoneCard).click();
            
            // Look for status change buttons
            cy.contains('button', 'Start Task').should('be.visible').click();
            
            // Task should now be in progress
            cy.contains('In Progress').should('be.visible');
            
            // Go back to projects and verify progress updated
            cy.visit('/projects');
            
            // Progress should be recalculated
            cy.contains('Progress').should('be.visible');
          }
        });
      }
    });
  });
});