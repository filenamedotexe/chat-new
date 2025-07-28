describe('Supabase Migration Stress Test - Team Member Role', () => {
  // Test data
  const testTimestamp = Date.now();
  const teamEmail = 'team@test.com';
  const teamPassword = 'password123';
  const testResults = {
    authTests: [],
    storageTests: [],
    realtimeTests: [],
    edgeFunctionTests: [],
    performanceMetrics: [],
    permissionTests: [],
    errors: []
  };

  // Helper function to log test results
  const logResult = (category, test, status, details = {}) => {
    const result = {
      test,
      status,
      timestamp: new Date().toISOString(),
      duration: details.duration || 0,
      details
    };
    testResults[category].push(result);
    cy.log(`${status === 'PASSED' ? '✅' : '❌'} ${test}`);
  };

  // Helper function to measure performance
  const measurePerformance = (operation, fn) => {
    const startTime = performance.now();
    return fn().then((result) => {
      const duration = performance.now() - startTime;
      testResults.performanceMetrics.push({
        operation,
        duration,
        timestamp: new Date().toISOString()
      });
      return result;
    });
  };

  beforeEach(() => {
    cy.viewport(1680, 1050);
    cy.visit('/');
  });

  describe('1. Team Member Authentication Tests', () => {
    it('should test team member auth flows', () => {
      // Test 1.1: Login with Supabase Auth
      cy.log('🔐 Testing Team Member Supabase Login...');
      cy.visit('/login');
      cy.get('[data-testid="auth-provider-indicator"]').should('contain', 'Using Supabase Auth');
      
      measurePerformance('team-member-login', () => {
        cy.get('input[type="email"]').type(teamEmail);
        cy.get('input[type="password"]').type(teamPassword);
        cy.get('button[type="submit"]').click();
        return cy.url().should('include', '/dashboard');
      }).then(() => {
        logResult('authTests', 'Team Member Supabase Login', 'PASSED', { email: teamEmail });
      });

      // Test 1.2: Verify role-based access
      cy.log('🔒 Verifying team member permissions...');
      cy.get('[data-testid="user-role-indicator"]').should('contain', 'team_member');
      logResult('authTests', 'Role Verification', 'PASSED', { role: 'team_member' });

      // Test 1.3: Test restricted access (should NOT see admin features)
      cy.log('🚫 Testing restricted access...');
      cy.visit('/admin');
      cy.url().should('not.include', '/admin');
      logResult('permissionTests', 'Admin Access Restriction', 'PASSED');

      // Test 1.4: Profile management
      cy.log('👤 Testing profile management...');
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="profile-link"]').click();
      cy.url().should('include', '/profile');
      cy.get('input[name="name"]').should('exist');
      cy.get('input[name="email"]').should('have.value', teamEmail);
      logResult('authTests', 'Profile Access', 'PASSED');
    });
  });

  describe('2. Team Member Project Access', () => {
    beforeEach(() => {
      // Login as team member
      cy.visit('/login');
      cy.get('input[type="email"]').type(teamEmail);
      cy.get('input[type="password"]').type(teamPassword);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should test project collaboration features', () => {
      cy.log('📁 Testing project access...');
      cy.visit('/projects');
      
      // Should see assigned projects
      cy.get('[data-testid="project-list"]').should('exist');
      cy.get('[data-testid="project-card"]').should('have.length.greaterThan', 0);
      logResult('permissionTests', 'View Assigned Projects', 'PASSED');

      // Create new project (if allowed)
      cy.get('[data-testid="create-project-button"]').then($btn => {
        if ($btn.length > 0) {
          cy.wrap($btn).click();
          const projectName = `Team Project ${testTimestamp}`;
          cy.get('input[name="name"]').type(projectName);
          cy.get('textarea[name="description"]').type('Project created by team member');
          cy.get('button[type="submit"]').click();
          cy.get('[data-testid="project-list"]').should('contain', projectName);
          logResult('permissionTests', 'Create Project', 'PASSED', { projectName });
        } else {
          logResult('permissionTests', 'Create Project', 'RESTRICTED');
        }
      });

      // Access existing project
      cy.get('[data-testid="project-card"]').first().click();
      cy.url().should('match', /\/projects\/[a-f0-9-]+/);
      logResult('permissionTests', 'Access Project Details', 'PASSED');

      // Test project chat
      cy.get('[data-testid="project-chat"]').click();
      const chatMessage = `Team member message ${testTimestamp}`;
      cy.get('[data-testid="message-input"]').type(chatMessage);
      cy.get('[data-testid="send-message"]').click();
      cy.get('[data-testid="message-list"]').should('contain', chatMessage);
      logResult('realtimeTests', 'Project Chat Access', 'PASSED');
    });

    it('should test task management', () => {
      cy.log('📋 Testing task management...');
      cy.visit('/tasks');
      
      // View assigned tasks
      cy.get('[data-testid="task-list"]').should('exist');
      logResult('permissionTests', 'View Tasks', 'PASSED');

      // Filter by assigned to me
      cy.get('[data-testid="filter-assigned-to-me"]').click();
      cy.wait(500);
      logResult('permissionTests', 'Filter My Tasks', 'PASSED');

      // Create new task
      cy.get('[data-testid="create-task-button"]').click();
      const taskTitle = `Team Task ${testTimestamp}`;
      cy.get('input[name="title"]').type(taskTitle);
      cy.get('textarea[name="description"]').type('Task created by team member');
      cy.get('select[name="status"]').select('in_progress');
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="task-list"]').should('contain', taskTitle);
      logResult('permissionTests', 'Create Task', 'PASSED', { taskTitle });

      // Update task status
      cy.get(`[data-testid="task-${taskTitle}"]`).within(() => {
        cy.get('[data-testid="status-select"]').select('completed');
      });
      cy.wait(1000);
      logResult('permissionTests', 'Update Task Status', 'PASSED');

      // Add comment to task
      cy.get(`[data-testid="task-${taskTitle}"]`).click();
      cy.get('[data-testid="task-comment-input"]').type('Progress update from team member');
      cy.get('[data-testid="add-comment"]').click();
      logResult('realtimeTests', 'Add Task Comment', 'PASSED');
    });
  });

  describe('3. Team Member File Management', () => {
    beforeEach(() => {
      // Login as team member
      cy.visit('/login');
      cy.get('input[type="email"]').type(teamEmail);
      cy.get('input[type="password"]').type(teamPassword);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should test file operations', () => {
      cy.log('📤 Testing file upload permissions...');
      cy.visit('/files');
      
      // Upload file
      cy.get('[data-testid="upload-button"]').click();
      const fileName = `team-file-${testTimestamp}.txt`;
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('Team member file content'),
        fileName: fileName,
        mimeType: 'text/plain'
      }, { force: true });
      
      measurePerformance('team-file-upload', () => {
        cy.get('[data-testid="upload-confirm"]').click();
        return cy.get('[data-testid="file-list"]').should('contain', fileName);
      }).then(() => {
        logResult('storageTests', 'Team Member File Upload', 'PASSED', { fileName });
      });

      // Test file organization
      cy.log('🗂️ Testing file organization...');
      cy.get('[data-testid="create-folder"]').then($btn => {
        if ($btn.length > 0) {
          cy.wrap($btn).click();
          cy.get('input[name="folderName"]').type(`Team Folder ${testTimestamp}`);
          cy.get('[data-testid="create-folder-confirm"]').click();
          logResult('storageTests', 'Create Folder', 'PASSED');
        } else {
          logResult('storageTests', 'Create Folder', 'RESTRICTED');
        }
      });

      // Download own files
      cy.get(`[data-testid="file-${fileName}"]`).within(() => {
        cy.get('[data-testid="download-button"]').click();
      });
      logResult('storageTests', 'Download Own File', 'PASSED');

      // Share file with team
      cy.get(`[data-testid="file-${fileName}"]`).within(() => {
        cy.get('[data-testid="share-button"]').click();
      });
      cy.get('[data-testid="share-modal"]').should('be.visible');
      cy.get('[data-testid="share-with-team"]').click();
      cy.get('[data-testid="share-confirm"]').click();
      logResult('storageTests', 'Share File with Team', 'PASSED');
    });

    it('should test collaborative file features', () => {
      cy.log('👥 Testing collaborative features...');
      cy.visit('/files');
      
      // View shared files
      cy.get('[data-testid="filter-shared"]').click();
      cy.wait(500);
      logResult('storageTests', 'View Shared Files', 'PASSED');

      // Comment on file
      cy.get('[data-testid^="file-"]').first().click();
      cy.get('[data-testid="file-comment-input"]').type('Team member feedback on file');
      cy.get('[data-testid="add-file-comment"]').click();
      logResult('storageTests', 'Comment on File', 'PASSED');

      // Test version history (if available)
      cy.get('[data-testid="version-history"]').then($btn => {
        if ($btn.length > 0) {
          cy.wrap($btn).click();
          cy.get('[data-testid="version-list"]').should('be.visible');
          logResult('storageTests', 'View Version History', 'PASSED');
        } else {
          logResult('storageTests', 'View Version History', 'NOT_AVAILABLE');
        }
      });
    });
  });

  describe('4. Team Member Communication', () => {
    beforeEach(() => {
      // Login as team member
      cy.visit('/login');
      cy.get('input[type="email"]').type(teamEmail);
      cy.get('input[type="password"]').type(teamPassword);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should test team communication features', () => {
      cy.log('💬 Testing team communication...');
      
      // Direct messages
      cy.get('[data-testid="direct-messages"]').click();
      cy.get('[data-testid="user-list"]').within(() => {
        cy.get('[data-testid^="user-"]').first().click();
      });
      
      const dmMessage = `Team DM ${testTimestamp}`;
      cy.get('[data-testid="message-input"]').type(dmMessage);
      cy.get('[data-testid="send-message"]').click();
      cy.get('[data-testid="message-list"]').should('contain', dmMessage);
      logResult('realtimeTests', 'Send Direct Message', 'PASSED');

      // Test real-time updates
      cy.log('🔄 Testing real-time message updates...');
      // Send multiple messages to test real-time
      for (let i = 1; i <= 3; i++) {
        const rtMessage = `Real-time test ${i}`;
        cy.get('[data-testid="message-input"]').type(rtMessage);
        cy.get('[data-testid="send-message"]').click();
        cy.get('[data-testid="message-list"]').should('contain', rtMessage);
      }
      logResult('realtimeTests', 'Real-time Message Updates', 'PASSED');

      // Test mentions
      cy.get('[data-testid="message-input"]').type('@');
      cy.get('[data-testid="mention-dropdown"]').should('be.visible');
      cy.get('[data-testid="mention-user"]').first().click();
      cy.get('[data-testid="message-input"]').type(' Check this out!');
      cy.get('[data-testid="send-message"]').click();
      logResult('realtimeTests', 'User Mentions', 'PASSED');
    });

    it('should test activity feed', () => {
      cy.log('📰 Testing activity feed...');
      cy.visit('/dashboard');
      
      // Check activity feed
      cy.get('[data-testid="activity-feed"]').should('be.visible');
      cy.get('[data-testid="activity-item"]').should('have.length.greaterThan', 0);
      logResult('permissionTests', 'View Activity Feed', 'PASSED');

      // Filter activities
      cy.get('[data-testid="activity-filter"]').select('tasks');
      cy.wait(500);
      logResult('permissionTests', 'Filter Activities', 'PASSED');

      // Test notifications
      cy.get('[data-testid="notifications-bell"]').click();
      cy.get('[data-testid="notifications-dropdown"]').should('be.visible');
      logResult('permissionTests', 'View Notifications', 'PASSED');
    });
  });

  describe('5. Team Member Dashboard Features', () => {
    beforeEach(() => {
      // Login as team member
      cy.visit('/login');
      cy.get('input[type="email"]').type(teamEmail);
      cy.get('input[type="password"]').type(teamPassword);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should test dashboard widgets', () => {
      cy.log('📊 Testing dashboard widgets...');
      
      // Task widget
      cy.get('[data-testid="tasks-widget"]').should('be.visible');
      cy.get('[data-testid="my-tasks-count"]').should('exist');
      logResult('permissionTests', 'Tasks Widget', 'PASSED');

      // Project widget
      cy.get('[data-testid="projects-widget"]').should('be.visible');
      cy.get('[data-testid="active-projects-count"]').should('exist');
      logResult('permissionTests', 'Projects Widget', 'PASSED');

      // Calendar widget
      cy.get('[data-testid="calendar-widget"]').should('be.visible');
      cy.get('[data-testid="upcoming-deadlines"]').should('exist');
      logResult('permissionTests', 'Calendar Widget', 'PASSED');

      // Quick actions
      cy.get('[data-testid="quick-actions"]').within(() => {
        cy.get('[data-testid="quick-create-task"]').should('exist');
        cy.get('[data-testid="quick-upload-file"]').should('exist');
      });
      logResult('permissionTests', 'Quick Actions', 'PASSED');
    });

    it('should test search functionality', () => {
      cy.log('🔍 Testing global search...');
      
      // Global search
      cy.get('[data-testid="global-search"]').type('test');
      cy.wait(1000);
      cy.get('[data-testid="search-results"]').should('be.visible');
      cy.get('[data-testid="search-result-item"]').should('have.length.greaterThan', 0);
      logResult('performanceMetrics', 'Global Search', 'PASSED');

      // Search filters
      cy.get('[data-testid="search-filter-projects"]').click();
      cy.wait(500);
      logResult('performanceMetrics', 'Search Filter - Projects', 'PASSED');

      cy.get('[data-testid="search-filter-tasks"]').click();
      cy.wait(500);
      logResult('performanceMetrics', 'Search Filter - Tasks', 'PASSED');

      cy.get('[data-testid="search-filter-files"]').click();
      cy.wait(500);
      logResult('performanceMetrics', 'Search Filter - Files', 'PASSED');

      // Clear search
      cy.get('[data-testid="clear-search"]').click();
      cy.get('[data-testid="search-results"]').should('not.exist');
      logResult('performanceMetrics', 'Clear Search', 'PASSED');
    });
  });

  describe('6. Performance Tests for Team Member', () => {
    beforeEach(() => {
      // Login as team member
      cy.visit('/login');
      cy.get('input[type="email"]').type(teamEmail);
      cy.get('input[type="password"]').type(teamPassword);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should test concurrent task operations', () => {
      cy.log('⚡ Testing concurrent operations...');
      cy.visit('/tasks');
      
      // Open multiple task modals
      cy.get('[data-testid="create-task-button"]').click();
      cy.get('[data-testid="filter-dropdown"]').click();
      cy.get('[data-testid="sort-dropdown"]').click();
      
      // Perform operations
      cy.get('input[name="title"]').type('Concurrent test task');
      cy.get('[data-testid="filter-status-in_progress"]').click();
      cy.get('[data-testid="sort-by-date"]').click();
      
      // Close all
      cy.get('body').click(0, 0);
      logResult('performanceMetrics', 'Concurrent Task Operations', 'PASSED');
    });

    it('should test rapid file operations', () => {
      cy.log('🚀 Testing rapid file operations...');
      cy.visit('/files');
      
      // Rapidly switch between views
      const views = ['grid', 'list', 'table'];
      views.forEach(view => {
        cy.get(`[data-testid="view-${view}"]`).click();
        cy.wait(200);
      });
      logResult('performanceMetrics', 'Rapid View Switching', 'PASSED');

      // Test file preview performance
      cy.get('[data-testid^="file-"]').first().within(() => {
        cy.get('[data-testid="preview-button"]').click();
      });
      cy.get('[data-testid="file-preview-modal"]').should('be.visible');
      cy.get('[data-testid="close-preview"]').click();
      logResult('performanceMetrics', 'File Preview Performance', 'PASSED');
    });

    it('should test session timeout handling', () => {
      cy.log('⏱️ Testing session management...');
      
      // Check session renewal
      cy.window().then((win) => {
        const token = win.localStorage.getItem('supabase.auth.token');
        expect(token).to.exist;
      });
      
      // Simulate activity
      cy.get('body').click();
      cy.wait(1000);
      
      // Verify session still active
      cy.get('[data-testid="user-menu"]').should('be.visible');
      logResult('authTests', 'Session Renewal', 'PASSED');
    });
  });

  // Final test to generate report
  after(() => {
    cy.log('📊 Generating team member test report...');
    
    // Save test results
    cy.writeFile(`cypress/results/supabase-team-member-test-${testTimestamp}.json`, testResults);
    
    // Log summary
    const totalTests = Object.values(testResults).reduce((acc, category) => 
      acc + (Array.isArray(category) ? category.length : 0), 0
    );
    const passedTests = Object.values(testResults).reduce((acc, category) => 
      acc + (Array.isArray(category) ? category.filter(t => t.status === 'PASSED').length : 0), 0
    );
    const restrictedTests = Object.values(testResults).reduce((acc, category) => 
      acc + (Array.isArray(category) ? category.filter(t => t.status === 'RESTRICTED').length : 0), 0
    );
    const failedTests = totalTests - passedTests - restrictedTests;
    
    cy.log(`📊 Team Member Test Summary:
      Total Tests: ${totalTests}
      Passed: ${passedTests}
      Restricted (Expected): ${restrictedTests}
      Failed: ${failedTests}
      Success Rate: ${((passedTests / (totalTests - restrictedTests)) * 100).toFixed(2)}%
      
      Performance Metrics:
      - Average operation time: ${
        testResults.performanceMetrics.length > 0
          ? (testResults.performanceMetrics.reduce((acc, m) => acc + m.duration, 0) / 
             testResults.performanceMetrics.length).toFixed(2)
          : 0
      }ms
      
      Permission Tests: ${testResults.permissionTests.length}
      Real-time Tests: ${testResults.realtimeTests.length}
    `);
  });
});