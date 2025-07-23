describe('Phase 5: Task Management - Complete Testing', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  describe('Admin Role - Full Task Management', () => {
    beforeEach(() => {
      cy.login('admin@example.com', 'admin123');
    });

    it('should access task board from projects', () => {
      cy.visit('/projects');
      cy.screenshot('phase5-1-projects-list');
      
      // Click on first project or create one
      cy.get('body').then($body => {
        if ($body.find('article').length > 0) {
          cy.get('article').first().click();
        } else {
          cy.createProject('Phase 5 Test Project', 'Testing task management');
          cy.contains('Phase 5 Test Project').click();
        }
      });
      
      // Navigate to tasks
      cy.url().then(url => {
        const projectId = url.split('/projects/')[1];
        cy.visit(`/projects/${projectId}/tasks`);
      });
      
      cy.contains('Tasks Board').should('be.visible');
      cy.screenshot('phase5-2-empty-task-board');
    });

    it('should create tasks in all columns', () => {
      // Navigate to a project's task board
      cy.visit('/projects');
      cy.get('article').first().click();
      cy.url().then(url => {
        const projectId = url.split('/projects/')[1];
        cy.visit(`/projects/${projectId}/tasks`);
      });

      // Create task in each column
      const tasks = [
        { column: 'Not Started', title: 'Design Homepage', desc: 'Create mockups' },
        { column: 'In Progress', title: 'Build Auth System', desc: 'Implement login' },
        { column: 'Needs Review', title: 'API Documentation', desc: 'Document endpoints' },
        { column: 'Done', title: 'Database Setup', desc: 'Configure PostgreSQL' }
      ];

      tasks.forEach((task, index) => {
        cy.createTask(task.column, task.title, task.desc);
        cy.contains(task.title).should('be.visible');
      });

      cy.screenshot('phase5-3-tasks-created');
    });

    it('should test task status transitions', () => {
      // Navigate to task board with tasks
      cy.visit('/projects');
      cy.get('article').first().click();
      cy.url().then(url => {
        const projectId = url.split('/projects/')[1];
        cy.visit(`/projects/${projectId}/tasks`);
      });

      // Find a "Not Started" task
      cy.contains('h3', 'Not Started')
        .parent()
        .within(() => {
          cy.get('.cursor-move').first().as('task');
        });

      // Start the task
      cy.get('@task').trigger('mouseover');
      cy.get('@task').contains('button', 'Start Task').click();
      cy.wait(1000);
      cy.screenshot('phase5-4-task-started');

      // Find it in "In Progress" and submit for review
      cy.contains('h3', 'In Progress')
        .parent()
        .within(() => {
          cy.get('.cursor-move').first().as('progressTask');
        });

      cy.get('@progressTask').trigger('mouseover');
      cy.get('@progressTask').contains('button', 'Submit for Review').click();
      cy.wait(1000);
      cy.screenshot('phase5-5-task-review');

      // Find it in "Needs Review" and mark as done
      cy.contains('h3', 'Needs Review')
        .parent()
        .within(() => {
          cy.get('.cursor-move').first().as('reviewTask');
        });

      cy.get('@reviewTask').trigger('mouseover');
      cy.get('@reviewTask').contains('button', 'Mark Done').click();
      cy.wait(1000);
      cy.screenshot('phase5-6-task-done');
    });

    it('should test drag and drop', () => {
      cy.visit('/projects');
      cy.get('article').first().click();
      cy.url().then(url => {
        const projectId = url.split('/projects/')[1];
        cy.visit(`/projects/${projectId}/tasks`);
      });

      // Create a task if none exist
      cy.get('body').then($body => {
        if ($body.find('.cursor-move').length === 0) {
          cy.createTask('Not Started', 'Drag Test Task', 'Task to drag');
        }
      });

      // Drag task from "Not Started" to "In Progress"
      cy.contains('h3', 'Not Started')
        .parent()
        .find('.cursor-move')
        .first()
        .as('dragTask');

      cy.contains('h3', 'In Progress')
        .parent()
        .find('.min-h-\\[200px\\]')
        .as('dropZone');

      cy.get('@dragTask').drag('@dropZone');
      cy.wait(1000);
      cy.screenshot('phase5-7-after-drag');
    });

    it('should create and display overdue tasks', () => {
      cy.visit('/projects');
      cy.get('article').first().click();
      cy.url().then(url => {
        const projectId = url.split('/projects/')[1];
        cy.visit(`/projects/${projectId}/tasks`);
      });

      // Create overdue task
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];

      cy.contains('h3', 'Not Started').parent().find('button').first().click();
      cy.get('input[name="title"]').type('OVERDUE: Security Audit');
      cy.get('textarea[name="description"]').type('This task is overdue');
      cy.get('input[name="dueDate"]').type(dateStr);
      cy.contains('button', 'Create Task').click();
      cy.wait(1000);

      // Verify overdue styling
      cy.contains('OVERDUE: Security Audit')
        .parents('.cursor-move')
        .within(() => {
          cy.get('.text-red-600, .dark\\:text-red-400').should('exist');
        });

      cy.screenshot('phase5-8-overdue-task');
    });
  });

  describe('Client Role - View Only Access', () => {
    beforeEach(() => {
      cy.login('user@example.com', 'user123');
    });

    it('should view tasks but not create them', () => {
      cy.visit('/projects');
      cy.screenshot('phase5-9-client-projects');

      // Check if client has access to any projects
      cy.get('body').then($body => {
        if ($body.find('article').length > 0) {
          cy.get('article').first().click();
          cy.url().then(url => {
            const projectId = url.split('/projects/')[1];
            cy.visit(`/projects/${projectId}/tasks`);
          });

          // Verify no add buttons visible
          cy.get('button svg.h-4.w-4').parent().should('not.exist');
          
          // Verify no status change buttons on hover
          cy.get('.cursor-move').first().trigger('mouseover');
          cy.get('button').contains(/Start Task|Submit for Review|Mark Done/).should('not.exist');

          cy.screenshot('phase5-10-client-readonly');
        }
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.viewport(375, 667);
      cy.login('admin@example.com', 'admin123');
    });

    it('should work on mobile devices', () => {
      cy.visit('/projects');
      cy.get('article').first().click();
      cy.url().then(url => {
        const projectId = url.split('/projects/')[1];
        cy.visit(`/projects/${projectId}/tasks`);
      });

      // Verify columns stack vertically
      cy.get('.grid').should('have.class', 'grid-cols-1');
      
      // Test creating task on mobile
      cy.contains('h3', 'Not Started').parent().find('button').first().click();
      cy.get('input[name="title"]').should('be.visible');
      cy.screenshot('phase5-11-mobile-form');
      
      // Cancel form
      cy.contains('button', 'Cancel').click();
      
      cy.screenshot('phase5-12-mobile-board');
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      cy.login('admin@example.com', 'admin123');
    });

    it('should validate required fields', () => {
      cy.visit('/projects');
      cy.get('article').first().click();
      cy.url().then(url => {
        const projectId = url.split('/projects/')[1];
        cy.visit(`/projects/${projectId}/tasks`);
      });

      // Open task form
      cy.contains('h3', 'Not Started').parent().find('button').first().click();
      
      // Try to submit empty form
      cy.contains('button', 'Create Task').click();
      
      // Check for HTML5 validation
      cy.get('input[name="title"]:invalid').should('exist');
      cy.screenshot('phase5-13-validation');
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      cy.login('admin@example.com', 'admin123');
    });

    it('should handle empty columns gracefully', () => {
      // Create new project to ensure empty board
      cy.createProject(`Empty Test ${Date.now()}`, 'Testing empty states');
      cy.contains(`Empty Test`).click();
      cy.url().then(url => {
        const projectId = url.split('/projects/')[1];
        cy.visit(`/projects/${projectId}/tasks`);
      });

      // Verify empty state messages
      cy.contains('No tasks').should('have.length', 4);
      cy.screenshot('phase5-14-empty-states');
    });

    it('should handle long content', () => {
      cy.visit('/projects');
      cy.get('article').first().click();
      cy.url().then(url => {
        const projectId = url.split('/projects/')[1];
        cy.visit(`/projects/${projectId}/tasks`);
      });

      const longTitle = 'This is a very long task title that should be truncated with ellipsis when displayed in the card view';
      const longDesc = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10);

      cy.createTask('Not Started', longTitle, longDesc);
      
      // Verify truncation
      cy.contains(longTitle.substring(0, 30)).should('be.visible');
      cy.get('.line-clamp-2').should('exist');
      cy.screenshot('phase5-15-long-content');
    });
  });
});