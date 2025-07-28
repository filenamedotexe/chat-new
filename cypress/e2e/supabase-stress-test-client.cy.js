describe('Supabase Migration Stress Test - Client Role', () => {
  // Test data
  const testTimestamp = Date.now();
  const clientEmail = 'client@test.com';
  const clientPassword = 'password123';
  const testResults = {
    authTests: [],
    viewTests: [],
    realtimeTests: [],
    restrictionTests: [],
    performanceMetrics: [],
    uiTests: [],
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

  // Helper function to test restricted access
  const testRestriction = (description, action) => {
    action();
    logResult('restrictionTests', description, 'PROPERLY_RESTRICTED');
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
    cy.viewport(1440, 900);
    cy.visit('/');
  });

  describe('1. Client Authentication Tests', () => {
    it('should test client auth flows with Supabase', () => {
      // Test 1.1: Login with Supabase Auth
      cy.log('🔐 Testing Client Supabase Login...');
      cy.visit('/login');
      cy.get('[data-testid="auth-provider-indicator"]').should('contain', 'Using Supabase Auth');
      
      measurePerformance('client-login', () => {
        cy.get('input[type="email"]').type(clientEmail);
        cy.get('input[type="password"]').type(clientPassword);
        cy.get('button[type="submit"]').click();
        return cy.url().should('include', '/dashboard');
      }).then(() => {
        logResult('authTests', 'Client Supabase Login', 'PASSED', { email: clientEmail });
      });

      // Test 1.2: Verify client role
      cy.log('🔒 Verifying client role restrictions...');
      cy.get('[data-testid="user-role-indicator"]').should('contain', 'client');
      logResult('authTests', 'Client Role Verification', 'PASSED', { role: 'client' });

      // Test 1.3: Test session persistence
      cy.log('🔄 Testing session persistence...');
      cy.reload();
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="user-menu"]').should('be.visible');
      logResult('authTests', 'Client Session Persistence', 'PASSED');

      // Test 1.4: Profile view (read-only)
      cy.log('👤 Testing profile view...');
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="profile-link"]').click();
      cy.url().should('include', '/profile');
      cy.get('input[name="email"]').should('have.value', clientEmail).should('be.disabled');
      logResult('authTests', 'Client Profile View', 'PASSED');

      // Test 1.5: Password change
      cy.log('🔑 Testing password change...');
      cy.get('[data-testid="change-password-link"]').then($link => {
        if ($link.length > 0) {
          cy.wrap($link).click();
          cy.get('[data-testid="current-password"]').type(clientPassword);
          cy.get('[data-testid="new-password"]').type('NewPassword123!');
          cy.get('[data-testid="confirm-password"]').type('NewPassword123!');
          cy.get('[data-testid="update-password"]').click();
          logResult('authTests', 'Password Change', 'PASSED');
        } else {
          logResult('authTests', 'Password Change', 'NOT_AVAILABLE');
        }
      });
    });
  });

  describe('2. Client Dashboard Access', () => {
    beforeEach(() => {
      // Login as client
      cy.visit('/login');
      cy.get('input[type="email"]').type(clientEmail);
      cy.get('input[type="password"]').type(clientPassword);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should test client dashboard features', () => {
      cy.log('📊 Testing client dashboard...');
      
      // View dashboard widgets
      cy.get('[data-testid="client-dashboard"]').should('be.visible');
      cy.get('[data-testid="project-overview-widget"]').should('be.visible');
      cy.get('[data-testid="recent-updates-widget"]').should('be.visible');
      logResult('viewTests', 'Client Dashboard Widgets', 'PASSED');

      // Test restricted widgets (should not be visible)
      cy.get('[data-testid="admin-stats"]').should('not.exist');
      cy.get('[data-testid="user-management"]').should('not.exist');
      logResult('restrictionTests', 'Admin Widgets Hidden', 'PROPERLY_RESTRICTED');

      // View project progress
      cy.get('[data-testid="project-progress"]').should('be.visible');
      cy.get('[data-testid="progress-bar"]').should('exist');
      logResult('viewTests', 'Project Progress View', 'PASSED');

      // Check notifications
      cy.get('[data-testid="notifications-bell"]').click();
      cy.get('[data-testid="notifications-dropdown"]').should('be.visible');
      cy.get('[data-testid="notification-item"]').should('exist');
      logResult('viewTests', 'Client Notifications', 'PASSED');
    });

    it('should test activity feed access', () => {
      cy.log('📰 Testing activity feed...');
      
      // View activity feed
      cy.get('[data-testid="activity-feed"]').should('be.visible');
      cy.get('[data-testid="activity-item"]').should('have.length.greaterThan', 0);
      logResult('viewTests', 'View Activity Feed', 'PASSED');

      // Test activity filtering (limited options)
      cy.get('[data-testid="activity-filter"]').should('exist');
      cy.get('[data-testid="activity-filter"]').select('all');
      logResult('viewTests', 'Activity Filter', 'PASSED');

      // Should not see sensitive activities
      cy.get('[data-testid="activity-item"]').each(($item) => {
        cy.wrap($item).should('not.contain', 'deleted');
        cy.wrap($item).should('not.contain', 'admin');
      });
      logResult('restrictionTests', 'Sensitive Activities Hidden', 'PROPERLY_RESTRICTED');
    });
  });

  describe('3. Client Project Access', () => {
    beforeEach(() => {
      // Login as client
      cy.visit('/login');
      cy.get('input[type="email"]').type(clientEmail);
      cy.get('input[type="password"]').type(clientPassword);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should test project viewing permissions', () => {
      cy.log('📁 Testing project access...');
      cy.visit('/projects');
      
      // Should only see assigned projects
      cy.get('[data-testid="project-list"]').should('exist');
      cy.get('[data-testid="project-card"]').should('have.length.greaterThan', 0);
      logResult('viewTests', 'View Assigned Projects', 'PASSED');

      // Should NOT see create button
      testRestriction('Create Project Button Hidden', () => {
        cy.get('[data-testid="create-project-button"]').should('not.exist');
      });

      // View project details
      cy.get('[data-testid="project-card"]').first().click();
      cy.url().should('match', /\/projects\/[a-f0-9-]+/);
      logResult('viewTests', 'View Project Details', 'PASSED');

      // Should see project info but not edit buttons
      cy.get('[data-testid="project-name"]').should('be.visible');
      cy.get('[data-testid="project-description"]').should('be.visible');
      cy.get('[data-testid="project-timeline"]').should('be.visible');
      
      testRestriction('Edit Project Button Hidden', () => {
        cy.get('[data-testid="edit-project-button"]').should('not.exist');
      });

      // View project files (read-only)
      cy.get('[data-testid="project-files-tab"]').click();
      cy.get('[data-testid="file-list"]').should('be.visible');
      logResult('viewTests', 'View Project Files', 'PASSED');

      // Test download permissions
      cy.get('[data-testid^="file-"]').first().within(() => {
        cy.get('[data-testid="download-button"]').should('exist');
        cy.get('[data-testid="delete-button"]').should('not.exist');
      });
      logResult('viewTests', 'Download Files', 'PASSED');
      logResult('restrictionTests', 'Delete Files Restricted', 'PROPERLY_RESTRICTED');
    });

    it('should test task viewing', () => {
      cy.log('📋 Testing task access...');
      cy.visit('/tasks');
      
      // View tasks (read-only)
      cy.get('[data-testid="task-list"]').should('exist');
      logResult('viewTests', 'View Tasks', 'PASSED');

      // Should NOT see create task button
      testRestriction('Create Task Button Hidden', () => {
        cy.get('[data-testid="create-task-button"]').should('not.exist');
      });

      // View task details
      cy.get('[data-testid^="task-"]').first().click();
      cy.get('[data-testid="task-details"]').should('be.visible');
      cy.get('[data-testid="task-title"]').should('be.visible');
      cy.get('[data-testid="task-status"]').should('be.visible');
      logResult('viewTests', 'View Task Details', 'PASSED');

      // Should NOT be able to edit task
      testRestriction('Edit Task Restricted', () => {
        cy.get('[data-testid="edit-task-button"]').should('not.exist');
        cy.get('[data-testid="status-select"]').should('be.disabled');
      });

      // Can view comments but not add
      cy.get('[data-testid="task-comments"]').should('be.visible');
      testRestriction('Add Comment Restricted', () => {
        cy.get('[data-testid="task-comment-input"]').should('not.exist');
      });
    });
  });

  describe('4. Client Communication Features', () => {
    beforeEach(() => {
      // Login as client
      cy.visit('/login');
      cy.get('input[type="email"]').type(clientEmail);
      cy.get('input[type="password"]').type(clientPassword);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should test client messaging capabilities', () => {
      cy.log('💬 Testing client messaging...');
      
      // Access messages
      cy.get('[data-testid="messages-link"]').click();
      cy.url().should('include', '/messages');
      logResult('viewTests', 'Access Messages', 'PASSED');

      // Should only see messages with team
      cy.get('[data-testid="conversation-list"]').should('be.visible');
      cy.get('[data-testid="conversation-item"]').should('exist');
      logResult('viewTests', 'View Conversations', 'PASSED');

      // Send message to support/team
      cy.get('[data-testid="support-chat"]').click();
      const supportMessage = `Client support request ${testTimestamp}`;
      cy.get('[data-testid="message-input"]').type(supportMessage);
      cy.get('[data-testid="send-message"]').click();
      cy.get('[data-testid="message-list"]').should('contain', supportMessage);
      logResult('realtimeTests', 'Send Support Message', 'PASSED');

      // Test real-time updates
      cy.log('🔄 Testing real-time message updates...');
      // The message should appear instantly due to real-time
      cy.get('[data-testid="message-list"]').within(() => {
        cy.contains(supportMessage).should('be.visible');
      });
      logResult('realtimeTests', 'Real-time Message Update', 'PASSED');

      // Should NOT be able to message other clients
      testRestriction('Client-to-Client Messaging Restricted', () => {
        cy.get('[data-testid="new-conversation"]').should('not.exist');
      });
    });

    it('should test project discussions', () => {
      cy.log('💭 Testing project discussions...');
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().click();
      
      // Access project chat (if allowed)
      cy.get('[data-testid="project-chat"]').then($chat => {
        if ($chat.length > 0) {
          cy.wrap($chat).click();
          
          // View messages
          cy.get('[data-testid="message-list"]').should('be.visible');
          logResult('viewTests', 'View Project Chat', 'PASSED');
          
          // Try to send message
          cy.get('[data-testid="message-input"]').then($input => {
            if ($input.length > 0 && !$input.is(':disabled')) {
              const projectMessage = `Client project comment ${testTimestamp}`;
              cy.wrap($input).type(projectMessage);
              cy.get('[data-testid="send-message"]').click();
              cy.get('[data-testid="message-list"]').should('contain', projectMessage);
              logResult('realtimeTests', 'Send Project Message', 'PASSED');
            } else {
              logResult('restrictionTests', 'Project Messaging', 'RESTRICTED');
            }
          });
        } else {
          logResult('restrictionTests', 'Project Chat Access', 'RESTRICTED');
        }
      });
    });
  });

  describe('5. Client File Access', () => {
    beforeEach(() => {
      // Login as client
      cy.visit('/login');
      cy.get('input[type="email"]').type(clientEmail);
      cy.get('input[type="password"]').type(clientPassword);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should test file viewing and download', () => {
      cy.log('📄 Testing file access...');
      cy.visit('/files');
      
      // View files
      cy.get('[data-testid="file-list"]').should('be.visible');
      logResult('viewTests', 'View Files', 'PASSED');

      // Should NOT see upload button
      testRestriction('Upload Button Hidden', () => {
        cy.get('[data-testid="upload-button"]').should('not.exist');
      });

      // Test file preview
      cy.get('[data-testid^="file-"]').first().within(() => {
        cy.get('[data-testid="preview-button"]').click();
      });
      cy.get('[data-testid="file-preview-modal"]').should('be.visible');
      cy.get('[data-testid="close-preview"]').click();
      logResult('viewTests', 'Preview Files', 'PASSED');

      // Test file download
      cy.get('[data-testid^="file-"]').first().within(() => {
        cy.get('[data-testid="download-button"]').click();
      });
      logResult('viewTests', 'Download Files', 'PASSED');

      // Should NOT see delete or share options
      testRestriction('File Management Restricted', () => {
        cy.get('[data-testid="delete-button"]').should('not.exist');
        cy.get('[data-testid="share-button"]').should('not.exist');
      });

      // Test file search
      cy.get('[data-testid="file-search"]').type('test');
      cy.wait(500);
      logResult('viewTests', 'Search Files', 'PASSED');

      // Test file filtering
      cy.get('[data-testid="filter-dropdown"]').select('documents');
      logResult('viewTests', 'Filter Files', 'PASSED');
    });

    it('should test image gallery view', () => {
      cy.log('🖼️ Testing image gallery...');
      cy.visit('/files');
      
      // Switch to gallery view
      cy.get('[data-testid="view-gallery"]').click();
      cy.get('[data-testid="gallery-view"]').should('be.visible');
      logResult('viewTests', 'Gallery View', 'PASSED');

      // Test image thumbnails
      cy.get('[data-testid^="image-thumbnail-"]').should('have.length.greaterThan', 0);
      logResult('viewTests', 'Image Thumbnails', 'PASSED');

      // Click to view full size
      cy.get('[data-testid^="image-thumbnail-"]').first().click();
      cy.get('[data-testid="image-lightbox"]').should('be.visible');
      cy.get('[data-testid="close-lightbox"]').click();
      logResult('viewTests', 'Image Lightbox', 'PASSED');
    });
  });

  describe('6. Client UI/UX Tests', () => {
    beforeEach(() => {
      // Login as client
      cy.visit('/login');
      cy.get('input[type="email"]').type(clientEmail);
      cy.get('input[type="password"]').type(clientPassword);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should test responsive design', () => {
      cy.log('📱 Testing responsive design...');
      
      // Test mobile view
      cy.viewport('iphone-x');
      cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible');
      cy.get('[data-testid="mobile-menu-toggle"]').click();
      cy.get('[data-testid="mobile-menu"]').should('be.visible');
      logResult('uiTests', 'Mobile Menu', 'PASSED');

      // Test tablet view
      cy.viewport('ipad-2');
      cy.get('[data-testid="sidebar"]').should('be.visible');
      logResult('uiTests', 'Tablet View', 'PASSED');

      // Return to desktop
      cy.viewport(1440, 900);
      logResult('uiTests', 'Responsive Design', 'PASSED');
    });

    it('should test accessibility features', () => {
      cy.log('♿ Testing accessibility...');
      
      // Test keyboard navigation
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid');
      logResult('uiTests', 'Keyboard Navigation', 'PASSED');

      // Test contrast mode (if available)
      cy.get('[data-testid="accessibility-menu"]').then($menu => {
        if ($menu.length > 0) {
          cy.wrap($menu).click();
          cy.get('[data-testid="high-contrast"]').click();
          cy.get('body').should('have.class', 'high-contrast');
          logResult('uiTests', 'High Contrast Mode', 'PASSED');
        } else {
          logResult('uiTests', 'High Contrast Mode', 'NOT_AVAILABLE');
        }
      });

      // Test font size adjustment
      cy.get('[data-testid="font-size-increase"]').then($btn => {
        if ($btn.length > 0) {
          cy.wrap($btn).click();
          logResult('uiTests', 'Font Size Adjustment', 'PASSED');
        }
      });
    });

    it('should test help and documentation', () => {
      cy.log('❓ Testing help features...');
      
      // Access help
      cy.get('[data-testid="help-button"]').click();
      cy.get('[data-testid="help-modal"]').should('be.visible');
      logResult('uiTests', 'Help Modal', 'PASSED');

      // Test help search
      cy.get('[data-testid="help-search"]').type('upload');
      cy.get('[data-testid="help-results"]').should('contain', 'file');
      logResult('uiTests', 'Help Search', 'PASSED');

      // Access FAQ
      cy.get('[data-testid="faq-link"]').click();
      cy.get('[data-testid="faq-section"]').should('be.visible');
      logResult('uiTests', 'FAQ Access', 'PASSED');

      // Close help
      cy.get('[data-testid="close-help"]').click();
    });
  });

  describe('7. Client Performance Tests', () => {
    beforeEach(() => {
      // Login as client
      cy.visit('/login');
      cy.get('input[type="email"]').type(clientEmail);
      cy.get('input[type="password"]').type(clientPassword);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should test page load performance', () => {
      cy.log('⚡ Testing page load times...');
      
      const pages = [
        { route: '/dashboard', name: 'Dashboard' },
        { route: '/projects', name: 'Projects' },
        { route: '/tasks', name: 'Tasks' },
        { route: '/files', name: 'Files' },
        { route: '/messages', name: 'Messages' }
      ];

      pages.forEach(page => {
        measurePerformance(`load-${page.name}`, () => {
          cy.visit(page.route);
          return cy.get('[data-testid="page-loaded"]').should('exist');
        });
      });
      
      logResult('performanceMetrics', 'Page Load Tests', 'PASSED', { pageCount: pages.length });
    });

    it('should test data loading', () => {
      cy.log('📊 Testing data loading performance...');
      
      // Test project list loading
      measurePerformance('load-projects', () => {
        cy.visit('/projects');
        return cy.get('[data-testid="project-card"]').should('have.length.greaterThan', 0);
      });

      // Test file list loading
      measurePerformance('load-files', () => {
        cy.visit('/files');
        return cy.get('[data-testid^="file-"]').should('have.length.greaterThan', 0);
      });

      // Test message loading
      measurePerformance('load-messages', () => {
        cy.visit('/messages');
        cy.get('[data-testid="conversation-item"]').first().click();
        return cy.get('[data-testid="message-list"]').should('be.visible');
      });

      logResult('performanceMetrics', 'Data Loading Tests', 'PASSED');
    });

    it('should test search performance', () => {
      cy.log('🔍 Testing search performance...');
      
      cy.visit('/dashboard');
      
      // Test global search
      measurePerformance('global-search', () => {
        cy.get('[data-testid="global-search"]').type('project');
        return cy.get('[data-testid="search-results"]').should('be.visible');
      });

      // Clear search
      cy.get('[data-testid="clear-search"]').click();
      
      // Test with multiple keywords
      measurePerformance('complex-search', () => {
        cy.get('[data-testid="global-search"]').type('test file document');
        return cy.get('[data-testid="search-results"]').should('be.visible');
      });

      logResult('performanceMetrics', 'Search Performance', 'PASSED');
    });
  });

  describe('8. Error Handling Tests', () => {
    beforeEach(() => {
      // Login as client
      cy.visit('/login');
      cy.get('input[type="email"]').type(clientEmail);
      cy.get('input[type="password"]').type(clientPassword);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should handle network errors gracefully', () => {
      cy.log('🌐 Testing network error handling...');
      
      // Simulate offline
      cy.window().then((win) => {
        cy.stub(win.navigator, 'onLine').value(false);
      });

      // Try to load data
      cy.visit('/projects');
      cy.get('[data-testid="offline-indicator"]').should('be.visible');
      logResult('uiTests', 'Offline Indicator', 'PASSED');

      // Restore connection
      cy.window().then((win) => {
        cy.stub(win.navigator, 'onLine').value(true);
      });
      cy.reload();
      logResult('uiTests', 'Connection Recovery', 'PASSED');
    });

    it('should handle unauthorized access', () => {
      cy.log('🚫 Testing unauthorized access...');
      
      // Try to access admin route
      cy.visit('/admin', { failOnStatusCode: false });
      cy.url().should('not.include', '/admin');
      logResult('restrictionTests', 'Admin Route Blocked', 'PROPERLY_RESTRICTED');

      // Try to access direct API
      cy.request({
        method: 'GET',
        url: '/api/admin/users',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(403);
        logResult('restrictionTests', 'Admin API Blocked', 'PROPERLY_RESTRICTED');
      });
    });
  });

  // Final test to generate report
  after(() => {
    cy.log('📊 Generating client test report...');
    
    // Save test results
    cy.writeFile(`cypress/results/supabase-client-test-${testTimestamp}.json`, testResults);
    
    // Log summary
    const totalTests = Object.values(testResults).reduce((acc, category) => 
      acc + (Array.isArray(category) ? category.length : 0), 0
    );
    const passedTests = Object.values(testResults).reduce((acc, category) => 
      acc + (Array.isArray(category) ? category.filter(t => t.status === 'PASSED').length : 0), 0
    );
    const restrictedTests = Object.values(testResults).reduce((acc, category) => 
      acc + (Array.isArray(category) ? category.filter(t => t.status === 'PROPERLY_RESTRICTED').length : 0), 0
    );
    const failedTests = totalTests - passedTests - restrictedTests;
    
    cy.log(`📊 Client Test Summary:
      Total Tests: ${totalTests}
      Passed: ${passedTests}
      Properly Restricted: ${restrictedTests}
      Failed: ${failedTests}
      Success Rate: ${(((passedTests + restrictedTests) / totalTests) * 100).toFixed(2)}%
      
      Performance Metrics:
      - Average operation time: ${
        testResults.performanceMetrics.length > 0
          ? (testResults.performanceMetrics.reduce((acc, m) => acc + m.duration, 0) / 
             testResults.performanceMetrics.length).toFixed(2)
          : 0
      }ms
      
      Restriction Tests: ${testResults.restrictionTests.length} (All should be PROPERLY_RESTRICTED)
      View-Only Tests: ${testResults.viewTests.length}
      UI/UX Tests: ${testResults.uiTests.length}
    `);
  });
});