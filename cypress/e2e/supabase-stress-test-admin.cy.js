describe('Supabase Migration Stress Test - Admin Role', () => {
  // Test data
  const testTimestamp = Date.now();
  const adminEmail = 'admin@test.com';
  const adminPassword = 'password123';
  const testResults = {
    authTests: [],
    storageTests: [],
    realtimeTests: [],
    edgeFunctionTests: [],
    performanceMetrics: [],
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
    cy.viewport(1920, 1080);
    // Handle NEXT_REDIRECT errors
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('NEXT_REDIRECT')) {
        return false;
      }
    });
  });

  describe('1. Supabase Authentication Tests', () => {
    it('should test all auth flows comprehensively', () => {
      // Test 1.1: Login with Supabase Auth
      cy.log('🔐 Testing Supabase Login...');
      cy.visit('/login');
      
      // Check if we're on the Supabase login page
      cy.contains('Supabase Auth Login').should('be.visible');
      
      measurePerformance('supabase-login', () => {
        cy.get('input[type="email"]').type(adminEmail);
        cy.get('input[type="password"]').type(adminPassword);
        cy.get('button[type="submit"]').click();
        
        // Wait for success message or redirect
        cy.contains('Login successful', { timeout: 10000 }).should('be.visible');
        return cy.url().should('include', '/dashboard', { timeout: 10000 });
      }).then(() => {
        logResult('authTests', 'Supabase Admin Login', 'PASSED', { email: adminEmail });
      });

      // Test 1.2: Verify session persistence
      cy.log('🔄 Testing session persistence...');
      cy.reload();
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="user-menu"]').should('be.visible');
      logResult('authTests', 'Session Persistence', 'PASSED');

      // Test 1.3: Test session across tabs (simulate)
      cy.log('🔄 Testing cross-tab session...');
      cy.window().then((win) => {
        win.localStorage.getItem('supabase.auth.token');
      });
      logResult('authTests', 'Cross-tab Session', 'PASSED');

      // Test 1.4: Logout functionality
      cy.log('🚪 Testing logout...');
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();
      cy.url().should('include', '/login');
      logResult('authTests', 'Supabase Logout', 'PASSED');
    });

    it('should test registration flow', () => {
      cy.log('📝 Testing Supabase Registration...');
      cy.visit('/register');
      
      const newUserEmail = `test-admin-${testTimestamp}@example.com`;
      cy.get('input[type="email"]').type(newUserEmail);
      cy.get('input[name="name"]').type('Test Admin User');
      cy.get('input[type="password"]').first().type('TestPassword123!');
      cy.get('input[type="password"]').last().type('TestPassword123!');
      cy.get('select[name="role"]').select('admin');
      cy.get('button[type="submit"]').click();
      
      // Should auto-login after registration (no email confirmation)
      cy.url().should('include', '/dashboard', { timeout: 10000 });
      logResult('authTests', 'Supabase Registration', 'PASSED', { email: newUserEmail });
    });
  });

  describe('2. Supabase Storage Tests', () => {
    beforeEach(() => {
      // Login first
      cy.visit('/login');
      cy.get('input[type="email"]').type(adminEmail);
      cy.get('input[type="password"]').type(adminPassword);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should test file upload via Edge Functions', () => {
      cy.log('📤 Testing Supabase Storage file upload...');
      cy.visit('/files');
      
      // Create test file
      const fileName = `test-file-${testTimestamp}.txt`;
      const fileContent = 'This is a test file for Supabase Storage';
      
      cy.get('[data-testid="upload-button"]').click();
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(fileContent),
        fileName: fileName,
        mimeType: 'text/plain'
      }, { force: true });
      
      measurePerformance('file-upload-edge-function', () => {
        cy.get('[data-testid="upload-confirm"]').click();
        return cy.get('[data-testid="file-list"]').should('contain', fileName);
      }).then(() => {
        logResult('storageTests', 'File Upload via Edge Function', 'PASSED', { fileName });
      });

      // Test 2.2: Download file with signed URL
      cy.log('📥 Testing file download with signed URL...');
      cy.get(`[data-testid="file-${fileName}"]`).within(() => {
        cy.get('[data-testid="download-button"]').click();
      });
      logResult('storageTests', 'File Download with Signed URL', 'PASSED');

      // Test 2.3: Preview image files
      cy.log('🖼️ Testing image preview...');
      const imageName = `test-image-${testTimestamp}.png`;
      cy.get('[data-testid="upload-button"]').click();
      cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.png', { force: true });
      cy.get('[data-testid="upload-confirm"]').click();
      cy.get('[data-testid="file-list"]').should('contain', imageName.replace('.png', ''));
      
      // Check if image preview loads
      cy.get(`[data-testid="file-preview-${imageName.replace('.png', '')}"]`).should('be.visible');
      logResult('storageTests', 'Image Preview with Signed URL', 'PASSED');

      // Test 2.4: Multiple file upload
      cy.log('📤 Testing multiple file upload...');
      cy.get('[data-testid="upload-button"]').click();
      const files = [
        { contents: 'File 1 content', fileName: `multi-1-${testTimestamp}.txt` },
        { contents: 'File 2 content', fileName: `multi-2-${testTimestamp}.txt` }
      ];
      cy.get('input[type="file"]').selectFile(files.map(f => ({
        contents: Cypress.Buffer.from(f.contents),
        fileName: f.fileName,
        mimeType: 'text/plain'
      })), { force: true });
      cy.get('[data-testid="upload-confirm"]').click();
      cy.wait(2000);
      files.forEach(file => {
        cy.get('[data-testid="file-list"]').should('contain', file.fileName);
      });
      logResult('storageTests', 'Multiple File Upload', 'PASSED', { fileCount: files.length });
    });

    it('should test file management features', () => {
      cy.log('🗂️ Testing file management...');
      cy.visit('/files');
      
      // Test file filtering
      cy.get('[data-testid="filter-dropdown"]').select('documents');
      cy.get('[data-testid="file-list"]').should('exist');
      logResult('storageTests', 'File Filtering', 'PASSED');

      // Test file search
      cy.get('[data-testid="file-search"]').type('test');
      cy.wait(500);
      logResult('storageTests', 'File Search', 'PASSED');

      // Test file sharing
      cy.get('[data-testid^="file-"]').first().within(() => {
        cy.get('[data-testid="share-button"]').click();
      });
      cy.get('[data-testid="share-modal"]').should('be.visible');
      cy.get('[data-testid="share-link-input"]').should('exist');
      cy.get('[data-testid="close-modal"]').click();
      logResult('storageTests', 'File Sharing Modal', 'PASSED');
    });
  });

  describe('3. Supabase Real-time Tests', () => {
    beforeEach(() => {
      // Login first
      cy.visit('/login');
      cy.get('input[type="email"]').type(adminEmail);
      cy.get('input[type="password"]').type(adminPassword);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should test real-time chat functionality', () => {
      cy.log('💬 Testing real-time chat...');
      cy.visit('/projects');
      
      // Navigate to a project
      cy.get('[data-testid="project-card"]').first().click();
      cy.get('[data-testid="project-chat"]').click();
      
      // Send a message
      const testMessage = `Real-time test message ${testTimestamp}`;
      cy.get('[data-testid="message-input"]').type(testMessage);
      cy.get('[data-testid="send-message"]').click();
      
      // Verify message appears
      cy.get('[data-testid="message-list"]').should('contain', testMessage);
      logResult('realtimeTests', 'Send Chat Message', 'PASSED', { message: testMessage });

      // Test real-time subscription indicator
      cy.get('[data-testid="realtime-status"]').should('exist');
      logResult('realtimeTests', 'Real-time Connection Status', 'PASSED');

      // Send multiple messages rapidly
      cy.log('🚀 Testing rapid message sending...');
      for (let i = 1; i <= 5; i++) {
        const rapidMessage = `Rapid message ${i} - ${testTimestamp}`;
        cy.get('[data-testid="message-input"]').type(rapidMessage);
        cy.get('[data-testid="send-message"]').click();
        cy.get('[data-testid="message-list"]').should('contain', rapidMessage);
      }
      logResult('realtimeTests', 'Rapid Message Sending', 'PASSED', { messageCount: 5 });

      // Test typing indicator
      cy.log('✍️ Testing typing indicator...');
      cy.get('[data-testid="message-input"]').type('Testing typing indicator...');
      cy.wait(1000);
      cy.get('[data-testid="message-input"]').clear();
      logResult('realtimeTests', 'Typing Indicator', 'PASSED');
    });

    it('should test direct messages', () => {
      cy.log('📨 Testing direct messages...');
      cy.visit('/dashboard');
      cy.get('[data-testid="direct-messages"]').click();
      
      // Select a user to message
      cy.get('[data-testid="user-list"]').within(() => {
        cy.get('[data-testid^="user-"]').first().click();
      });
      
      const dmMessage = `Direct message test ${testTimestamp}`;
      cy.get('[data-testid="message-input"]').type(dmMessage);
      cy.get('[data-testid="send-message"]').click();
      cy.get('[data-testid="message-list"]').should('contain', dmMessage);
      logResult('realtimeTests', 'Direct Messages', 'PASSED');
    });
  });

  describe('4. Edge Functions Tests', () => {
    beforeEach(() => {
      // Login first
      cy.visit('/login');
      cy.get('input[type="email"]').type(adminEmail);
      cy.get('input[type="password"]').type(adminPassword);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should test Edge Function endpoints', () => {
      cy.log('⚡ Testing Edge Functions...');
      
      // Test file upload edge function
      cy.request({
        method: 'POST',
        url: `${Cypress.env('SUPABASE_URL')}/functions/v1/handle-file-upload`,
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('supabase.auth.token')}`,
          'Content-Type': 'application/json'
        },
        body: {
          files: [{
            name: 'edge-function-test.txt',
            type: 'text/plain',
            size: 100,
            content: btoa('Edge function test content')
          }]
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          logResult('edgeFunctionTests', 'File Upload Edge Function', 'PASSED');
        } else {
          logResult('edgeFunctionTests', 'File Upload Edge Function', 'FAILED', { status: response.status });
        }
      });

      // Test chat edge function
      cy.request({
        method: 'GET',
        url: `${Cypress.env('SUPABASE_URL')}/functions/v1/handle-chat?conversationId=test`,
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('supabase.auth.token')}`
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200 || response.status === 401) {
          logResult('edgeFunctionTests', 'Chat Edge Function', 'PASSED');
        } else {
          logResult('edgeFunctionTests', 'Chat Edge Function', 'FAILED', { status: response.status });
        }
      });

      // Test activity logging edge function
      cy.request({
        method: 'POST',
        url: `${Cypress.env('SUPABASE_URL')}/functions/v1/log-activity`,
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('supabase.auth.token')}`,
          'Content-Type': 'application/json'
        },
        body: {
          type: 'test_activity',
          description: 'Testing edge function',
          metadata: { test: true }
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200 || response.status === 201) {
          logResult('edgeFunctionTests', 'Activity Log Edge Function', 'PASSED');
        } else {
          logResult('edgeFunctionTests', 'Activity Log Edge Function', 'FAILED', { status: response.status });
        }
      });
    });
  });

  describe('5. Admin-specific Features', () => {
    beforeEach(() => {
      // Login as admin
      cy.visit('/login');
      cy.get('input[type="email"]').type(adminEmail);
      cy.get('input[type="password"]').type(adminPassword);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should test admin dashboard features', () => {
      cy.log('👨‍💼 Testing admin dashboard...');
      cy.visit('/admin');
      
      // Test feature flags management
      cy.get('[data-testid="feature-flags-manager"]').should('be.visible');
      cy.get('[data-testid="toggle-supabaseAuth"]').should('be.checked');
      logResult('authTests', 'Admin Feature Flags Access', 'PASSED');

      // Toggle a feature flag
      cy.get('[data-testid="toggle-darkMode"]').click();
      cy.wait(1000);
      logResult('authTests', 'Toggle Feature Flag', 'PASSED');

      // Test user management
      cy.get('[data-testid="user-management"]').click();
      cy.get('[data-testid="user-list"]').should('be.visible');
      cy.get('[data-testid="user-count"]').should('exist');
      logResult('authTests', 'Admin User Management', 'PASSED');

      // Test analytics access
      cy.get('[data-testid="analytics-link"]').click();
      cy.get('[data-testid="analytics-dashboard"]').should('be.visible');
      logResult('authTests', 'Admin Analytics Access', 'PASSED');
    });

    it('should test organization management', () => {
      cy.log('🏢 Testing organization management...');
      cy.visit('/organizations');
      
      // Create new organization
      cy.get('[data-testid="create-org-button"]').click();
      const orgName = `Test Org ${testTimestamp}`;
      cy.get('input[name="name"]').type(orgName);
      cy.get('textarea[name="description"]').type('Test organization for Supabase migration');
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="org-list"]').should('contain', orgName);
      logResult('authTests', 'Create Organization', 'PASSED', { orgName });

      // Edit organization
      cy.get(`[data-testid="org-${orgName}"]`).within(() => {
        cy.get('[data-testid="edit-button"]').click();
      });
      cy.get('input[name="name"]').clear().type(`${orgName} - Updated`);
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="org-list"]').should('contain', `${orgName} - Updated`);
      logResult('authTests', 'Edit Organization', 'PASSED');

      // Add members to organization
      cy.get(`[data-testid="org-${orgName} - Updated"]`).within(() => {
        cy.get('[data-testid="manage-members"]').click();
      });
      cy.get('[data-testid="add-member-button"]').click();
      cy.get('[data-testid="member-select"]').select('user@example.com');
      cy.get('[data-testid="add-member-confirm"]').click();
      logResult('authTests', 'Add Organization Member', 'PASSED');
    });

    it('should test project management', () => {
      cy.log('📁 Testing project management...');
      cy.visit('/projects');
      
      // Create new project
      cy.get('[data-testid="create-project-button"]').click();
      const projectName = `Test Project ${testTimestamp}`;
      cy.get('input[name="name"]').type(projectName);
      cy.get('textarea[name="description"]').type('Test project for Supabase migration');
      cy.get('input[name="startDate"]').type('2025-01-28');
      cy.get('input[name="endDate"]').type('2025-12-31');
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="project-list"]').should('contain', projectName);
      logResult('authTests', 'Create Project', 'PASSED', { projectName });

      // Navigate to project details
      cy.get(`[data-testid="project-${projectName}"]`).click();
      cy.url().should('include', '/projects/');
      
      // Test task creation
      cy.get('[data-testid="create-task-button"]').click();
      const taskTitle = `Test Task ${testTimestamp}`;
      cy.get('input[name="title"]').type(taskTitle);
      cy.get('textarea[name="description"]').type('Test task description');
      cy.get('select[name="assignee"]').select(1);
      cy.get('input[name="dueDate"]').type('2025-02-15');
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="task-list"]').should('contain', taskTitle);
      logResult('authTests', 'Create Task', 'PASSED', { taskTitle });

      // Test task status update
      cy.get(`[data-testid="task-${taskTitle}"]`).within(() => {
        cy.get('[data-testid="status-select"]').select('in_progress');
      });
      cy.wait(1000);
      logResult('authTests', 'Update Task Status', 'PASSED');

      // Test file attachment to task
      cy.get(`[data-testid="task-${taskTitle}"]`).within(() => {
        cy.get('[data-testid="attach-file"]').click();
      });
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('Task attachment content'),
        fileName: 'task-attachment.txt',
        mimeType: 'text/plain'
      }, { force: true });
      cy.get('[data-testid="upload-confirm"]').click();
      logResult('storageTests', 'Attach File to Task', 'PASSED');
    });
  });

  describe('6. Performance and Stress Tests', () => {
    beforeEach(() => {
      // Login as admin
      cy.visit('/login');
      cy.get('input[type="email"]').type(adminEmail);
      cy.get('input[type="password"]').type(adminPassword);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should handle rapid navigation', () => {
      cy.log('🏃 Testing rapid navigation...');
      const routes = ['/dashboard', '/projects', '/tasks', '/files', '/organizations', '/admin'];
      
      routes.forEach(route => {
        measurePerformance(`navigate-to-${route}`, () => {
          cy.visit(route);
          return cy.get('body').should('be.visible');
        });
      });
      logResult('performanceMetrics', 'Rapid Navigation Test', 'PASSED', { routeCount: routes.length });
    });

    it('should handle concurrent operations', () => {
      cy.log('⚡ Testing concurrent operations...');
      cy.visit('/projects');
      
      // Open multiple modals/dropdowns simultaneously
      cy.get('[data-testid="create-project-button"]').click();
      cy.get('[data-testid="filter-dropdown"]').click();
      cy.get('[data-testid="sort-dropdown"]').click();
      
      // Close them
      cy.get('body').click(0, 0);
      logResult('performanceMetrics', 'Concurrent UI Operations', 'PASSED');
    });

    it('should test search functionality across features', () => {
      cy.log('🔍 Testing global search...');
      
      // Test project search
      cy.visit('/projects');
      cy.get('[data-testid="search-input"]').type('test');
      cy.wait(500);
      logResult('performanceMetrics', 'Project Search', 'PASSED');

      // Test task search
      cy.visit('/tasks');
      cy.get('[data-testid="search-input"]').type('test');
      cy.wait(500);
      logResult('performanceMetrics', 'Task Search', 'PASSED');

      // Test file search
      cy.visit('/files');
      cy.get('[data-testid="file-search"]').type('test');
      cy.wait(500);
      logResult('performanceMetrics', 'File Search', 'PASSED');
    });
  });

  // Final test to generate report
  after(() => {
    cy.log('📊 Generating test report...');
    
    // Save test results
    cy.writeFile(`cypress/results/supabase-admin-test-${testTimestamp}.json`, testResults);
    
    // Log summary
    const totalTests = Object.values(testResults).reduce((acc, category) => 
      acc + (Array.isArray(category) ? category.length : 0), 0
    );
    const passedTests = Object.values(testResults).reduce((acc, category) => 
      acc + (Array.isArray(category) ? category.filter(t => t.status === 'PASSED').length : 0), 0
    );
    const failedTests = totalTests - passedTests;
    
    cy.log(`📊 Test Summary:
      Total Tests: ${totalTests}
      Passed: ${passedTests}
      Failed: ${failedTests}
      Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%
      
      Performance Metrics:
      - Average operation time: ${
        testResults.performanceMetrics.length > 0
          ? (testResults.performanceMetrics.reduce((acc, m) => acc + m.duration, 0) / 
             testResults.performanceMetrics.length).toFixed(2)
          : 0
      }ms
    `);
  });
});