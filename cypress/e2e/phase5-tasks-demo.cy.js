describe('Phase 5: Tasks Functionality Demo', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.login('admin@example.com', 'admin123');
  });

  it('should demonstrate complete task workflow', () => {
    // Step 1: Create a project for testing
    cy.visit('/projects');
    cy.contains('button', 'Create Project').click();
    
    const projectName = `Demo Project ${Date.now()}`;
    cy.get('input[name="name"]').type(projectName);
    cy.get('select[name="organizationId"]').select(1);
    cy.get('textarea[name="description"]').type('Project to demonstrate task management');
    cy.get('button[type="submit"]').click();
    cy.wait(1000);
    
    // Step 2: Navigate to the project tasks
    cy.visit('/projects');
    cy.contains(projectName).click();
    cy.url().then(url => {
      const projectId = url.split('/projects/')[1];
      cy.visit(`/projects/${projectId}/tasks`);
    });
    
    // Step 3: Verify task board structure
    cy.contains('Tasks Board').should('be.visible');
    cy.contains('h3', 'Not Started').should('be.visible');
    cy.contains('h3', 'In Progress').should('be.visible');
    cy.contains('h3', 'Needs Review').should('be.visible');
    cy.contains('h3', 'Done').should('be.visible');
    cy.screenshot('phase5-1-empty-board');
    
    // Step 4: Create tasks in different columns
    const tasks = [
      { column: 'Not Started', title: 'Design Homepage', desc: 'Create mockups for new homepage' },
      { column: 'In Progress', title: 'API Integration', desc: 'Connect frontend to backend API' },
      { column: 'Needs Review', title: 'User Auth Flow', desc: 'Login and registration system' },
      { column: 'Done', title: 'Database Setup', desc: 'PostgreSQL configuration complete' }
    ];
    
    tasks.forEach((task, index) => {
      cy.contains('h3', task.column).parent().find('button').first().click();
      cy.get('input[name="title"]').type(task.title);
      cy.get('textarea[name="description"]').type(task.desc);
      
      // Add due date
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + index);
      cy.get('input[name="dueDate"]').type(dueDate.toISOString().split('T')[0]);
      
      cy.contains('button', 'Create Task').click();
      cy.wait(1500);
    });
    
    cy.screenshot('phase5-2-tasks-created');
    
    // Step 5: Test status transitions
    cy.contains('Design Homepage').parents('.cursor-pointer').within(() => {
      cy.contains('button', 'Start Task').click();
    });
    cy.wait(1000);
    cy.screenshot('phase5-3-task-started');
    
    cy.contains('Design Homepage').parents('.cursor-pointer').within(() => {
      cy.contains('button', 'Submit for Review').click();
    });
    cy.wait(1000);
    cy.screenshot('phase5-4-task-review');
    
    cy.contains('Design Homepage').parents('.cursor-pointer').within(() => {
      cy.contains('button', 'Mark Done').click();
    });
    cy.wait(1000);
    cy.screenshot('phase5-5-task-done');
    
    // Step 6: Create an overdue task
    cy.contains('h3', 'Not Started').parent().find('button').first().click();
    cy.get('input[name="title"]').type('URGENT: Fix Critical Bug');
    cy.get('textarea[name="description"]').type('This task is overdue!');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    cy.get('input[name="dueDate"]').type(yesterday.toISOString().split('T')[0]);
    
    cy.contains('button', 'Create Task').click();
    cy.wait(1500);
    
    // Verify overdue indicator
    cy.contains('URGENT: Fix Critical Bug').parents('.cursor-pointer').within(() => {
      cy.get('.text-red-600, .dark\\:text-red-400').should('exist');
    });
    cy.screenshot('phase5-6-overdue-task');
    
    // Step 7: Test drag and drop
    cy.contains('API Integration').parents('.cursor-move').trigger('mousedown', { button: 0 });
    cy.contains('h3', 'Done').parent().find('.min-h-\\[200px\\]').trigger('mousemove').trigger('mouseup');
    cy.wait(1000);
    cy.screenshot('phase5-7-drag-drop');
    
    // Final screenshot of complete board
    cy.screenshot('phase5-8-final-board');
  });
  
  it('should demonstrate client read-only access', () => {
    // First create a project as admin
    cy.visit('/projects');
    cy.get('article').first().click();
    cy.url().then(url => {
      const projectId = url.split('/projects/')[1];
      
      // Logout and login as client
      cy.visit('/');
      cy.get('button[aria-label*="menu"]').first().click({ force: true });
      cy.contains('Sign out').click();
      
      cy.login('user@example.com', 'user123');
      
      // Navigate to same project tasks
      cy.visit(`/projects/${projectId}/tasks`);
      
      // Verify read-only
      cy.get('button svg.h-4.w-4').should('not.exist'); // No create buttons
      cy.get('.cursor-pointer').first().within(() => {
        cy.get('button').should('not.exist'); // No status change buttons
      });
      
      cy.screenshot('phase5-9-client-readonly');
    });
  });
});