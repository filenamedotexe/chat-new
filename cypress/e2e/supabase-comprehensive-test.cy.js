describe('Supabase Migration Comprehensive Test', () => {
  // Test configuration
  const testTimestamp = Date.now();
  const testResults = {
    admin: { passed: 0, failed: 0, tests: [] },
    teamMember: { passed: 0, failed: 0, tests: [] },
    client: { passed: 0, failed: 0, tests: [] },
    supabaseFeatures: { passed: 0, failed: 0, tests: [] }
  };

  // Helper to log test results
  const logTest = (category, testName, passed, details = '') => {
    const result = { testName, passed, details, timestamp: new Date().toISOString() };
    testResults[category].tests.push(result);
    if (passed) {
      testResults[category].passed++;
      cy.log(`✅ ${testName}`);
    } else {
      testResults[category].failed++;
      cy.log(`❌ ${testName}: ${details}`);
    }
  };

  beforeEach(() => {
    cy.viewport(1280, 720);
    // Handle Next.js redirects
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('NEXT_REDIRECT')) {
        return false;
      }
    });
  });

  describe('Admin Role - Supabase Features', () => {
    it('should test admin login and full feature access', () => {
      cy.log('🔐 Testing Admin Supabase Login...');
      
      // Login as admin
      cy.visit('/login');
      cy.contains('Supabase Auth Login').should('be.visible');
      
      cy.get('input[type="email"]').type('admin@test.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      // Wait for login success
      cy.contains('Login successful', { timeout: 10000 }).should('be.visible');
      cy.url().should('include', '/dashboard', { timeout: 10000 });
      logTest('admin', 'Supabase Admin Login', true);

      // Test dashboard access
      cy.contains('Admin Dashboard').should('be.visible');
      logTest('admin', 'Admin Dashboard Access', true);

      // Test session persistence
      cy.reload();
      cy.url().should('include', '/dashboard');
      cy.contains('Admin Dashboard').should('be.visible');
      logTest('admin', 'Session Persistence', true);

      // Test navigation to projects
      cy.visit('/projects');
      cy.url().should('include', '/projects');
      cy.get('h1').should('contain', 'Projects');
      logTest('admin', 'Projects Page Access', true);

      // Test file upload page access
      cy.visit('/files');
      cy.url().should('include', '/files');
      cy.contains(/files|documents/i).should('be.visible');
      logTest('admin', 'Files Page Access', true);

      // Test organizations access
      cy.visit('/organizations');
      cy.url().should('include', '/organizations');
      cy.contains(/organizations/i).should('be.visible');
      logTest('admin', 'Organizations Access', true);

      // Test admin page access
      cy.visit('/admin');
      cy.url().should('include', '/admin');
      cy.contains(/admin|management/i).should('be.visible');
      logTest('admin', 'Admin Panel Access', true);

      // Test logout
      cy.get('button').contains(/logout|sign out/i).click({ force: true });
      cy.url().should('include', '/login');
      logTest('admin', 'Logout Functionality', true);
    });

    it('should test admin-specific Supabase features', () => {
      // Login first
      cy.visit('/login');
      cy.get('input[type="email"]').type('admin@test.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.contains('Login successful', { timeout: 10000 });
      cy.url().should('include', '/dashboard', { timeout: 10000 });

      // Test feature flags (if available)
      cy.visit('/admin');
      cy.get('body').then($body => {
        if ($body.text().includes('feature') || $body.text().includes('Feature')) {
          logTest('supabaseFeatures', 'Feature Flags UI', true);
        } else {
          logTest('supabaseFeatures', 'Feature Flags UI', false, 'Not found');
        }
      });

      // Test user management
      cy.get('body').then($body => {
        if ($body.text().includes('user') || $body.text().includes('User')) {
          logTest('admin', 'User Management Section', true);
        } else {
          logTest('admin', 'User Management Section', false, 'Not found');
        }
      });

      // Test Supabase auth indicator
      cy.visit('/login');
      cy.contains('Supabase Auth').should('be.visible');
      logTest('supabaseFeatures', 'Supabase Auth Indicator', true);
    });
  });

  describe('Team Member Role - Supabase Features', () => {
    it('should test team member access and restrictions', () => {
      cy.log('👥 Testing Team Member Supabase Login...');
      
      // Login as team member
      cy.visit('/login');
      cy.get('input[type="email"]').clear().type('team@test.com');
      cy.get('input[type="password"]').clear().type('password123');
      cy.get('button[type="submit"]').click();
      
      cy.contains('Login successful', { timeout: 10000 }).should('be.visible');
      cy.url().should('include', '/dashboard', { timeout: 10000 });
      logTest('teamMember', 'Team Member Login', true);

      // Test dashboard (should not be admin dashboard)
      cy.get('h1').then($h1 => {
        if (!$h1.text().includes('Admin Dashboard')) {
          logTest('teamMember', 'Non-Admin Dashboard', true);
        } else {
          logTest('teamMember', 'Non-Admin Dashboard', false, 'Shows admin dashboard');
        }
      });

      // Test projects access
      cy.visit('/projects');
      cy.url().should('include', '/projects');
      logTest('teamMember', 'Projects Access', true);

      // Test files access
      cy.visit('/files');
      cy.url().should('include', '/files');
      logTest('teamMember', 'Files Access', true);

      // Test admin restriction
      cy.visit('/admin', { failOnStatusCode: false });
      cy.url().should('not.include', '/admin');
      logTest('teamMember', 'Admin Access Restricted', true);

      // Test tasks access
      cy.visit('/tasks');
      cy.url().should('include', '/tasks');
      logTest('teamMember', 'Tasks Access', true);
    });
  });

  describe('Client Role - Supabase Features', () => {
    it('should test client limited access', () => {
      cy.log('👤 Testing Client Supabase Login...');
      
      // Login as client
      cy.visit('/login');
      cy.get('input[type="email"]').clear().type('client@test.com');
      cy.get('input[type="password"]').clear().type('password123');
      cy.get('button[type="submit"]').click();
      
      cy.contains('Login successful', { timeout: 10000 }).should('be.visible');
      cy.url().should('include', '/dashboard', { timeout: 10000 });
      logTest('client', 'Client Login', true);

      // Test client dashboard
      cy.get('h1').then($h1 => {
        if ($h1.text().includes('Dashboard') && !$h1.text().includes('Admin')) {
          logTest('client', 'Client Dashboard', true);
        } else {
          logTest('client', 'Client Dashboard', false, 'Incorrect dashboard');
        }
      });

      // Test view-only projects
      cy.visit('/projects');
      cy.url().should('include', '/projects');
      logTest('client', 'Projects View Access', true);

      // Test admin restriction
      cy.visit('/admin', { failOnStatusCode: false });
      cy.url().should('not.include', '/admin');
      logTest('client', 'Admin Access Blocked', true);

      // Test organizations restriction
      cy.visit('/organizations');
      cy.get('body').then($body => {
        // Check if client has limited access
        if (!$body.find('button:contains("Create")').length) {
          logTest('client', 'Create Organization Restricted', true);
        } else {
          logTest('client', 'Create Organization Restricted', false, 'Has create button');
        }
      });
    });
  });

  describe('Supabase-Specific Features', () => {
    it('should test real-time functionality', () => {
      // Login as team member for testing
      cy.visit('/login');
      cy.get('input[type="email"]').clear().type('team@test.com');
      cy.get('input[type="password"]').clear().type('password123');
      cy.get('button[type="submit"]').click();
      cy.contains('Login successful', { timeout: 10000 });
      cy.url().should('include', '/dashboard', { timeout: 10000 });

      // Navigate to a project with chat
      cy.visit('/projects');
      cy.get('a[href*="/projects/"]').first().click();
      
      // Check for chat or messages functionality
      cy.get('body').then($body => {
        if ($body.text().includes('chat') || $body.text().includes('Chat') || 
            $body.text().includes('message') || $body.text().includes('Message')) {
          logTest('supabaseFeatures', 'Chat/Messaging UI', true);
          
          // Try to find message input
          const messageInput = $body.find('input[placeholder*="message"], textarea[placeholder*="message"]');
          if (messageInput.length > 0) {
            cy.wrap(messageInput.first()).type(`Test message ${testTimestamp}`);
            logTest('supabaseFeatures', 'Message Input', true);
          } else {
            logTest('supabaseFeatures', 'Message Input', false, 'Not found');
          }
        } else {
          logTest('supabaseFeatures', 'Chat/Messaging UI', false, 'Not found');
        }
      });
    });

    it('should test file storage integration', () => {
      // Login as admin for full access
      cy.visit('/login');
      cy.get('input[type="email"]').clear().type('admin@test.com');
      cy.get('input[type="password"]').clear().type('password123');
      cy.get('button[type="submit"]').click();
      cy.contains('Login successful', { timeout: 10000 });

      // Navigate to files
      cy.visit('/files');
      
      // Check for upload functionality
      cy.get('body').then($body => {
        const uploadButton = $body.find('button:contains("Upload"), button:contains("upload")');
        if (uploadButton.length > 0) {
          logTest('supabaseFeatures', 'File Upload Button', true);
          
          // Check for file input
          const fileInput = $body.find('input[type="file"]');
          if (fileInput.length > 0) {
            logTest('supabaseFeatures', 'File Input Element', true);
          } else {
            logTest('supabaseFeatures', 'File Input Element', false, 'Not found');
          }
        } else {
          logTest('supabaseFeatures', 'File Upload Button', false, 'Not found');
        }
      });
    });

    it('should test Edge Function connectivity', () => {
      // Test Edge Function endpoints (from browser context)
      cy.window().then((win) => {
        // Check if Supabase client is available
        if (win.localStorage.getItem('supabase.auth.token')) {
          logTest('supabaseFeatures', 'Supabase Auth Token', true);
        } else {
          logTest('supabaseFeatures', 'Supabase Auth Token', false, 'Not found');
        }
      });

      // Check for Supabase configuration
      cy.request({
        url: 'https://ixcsflqtipcfscbloahx.supabase.co/functions/v1/handle-chat',
        method: 'OPTIONS',
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200 || response.status === 204) {
          logTest('supabaseFeatures', 'Edge Function CORS', true);
        } else {
          logTest('supabaseFeatures', 'Edge Function CORS', false, `Status: ${response.status}`);
        }
      });
    });
  });

  // Generate comprehensive report
  after(() => {
    cy.log('📊 Generating Comprehensive Test Report...');
    
    // Calculate totals
    let totalPassed = 0;
    let totalFailed = 0;
    let categoryReports = [];

    Object.entries(testResults).forEach(([category, results]) => {
      totalPassed += results.passed;
      totalFailed += results.failed;
      
      const total = results.passed + results.failed;
      const successRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
      
      categoryReports.push(`
${category.toUpperCase()}:
  ✅ Passed: ${results.passed}
  ❌ Failed: ${results.failed}
  📊 Success Rate: ${successRate}%
  
Tests:
${results.tests.map(t => `  ${t.passed ? '✅' : '❌'} ${t.testName}${t.details ? ` (${t.details})` : ''}`).join('\n')}
`);
    });

    const totalTests = totalPassed + totalFailed;
    const overallSuccessRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;

    const report = `
🎯 SUPABASE MIGRATION COMPREHENSIVE TEST REPORT
================================================
Generated: ${new Date().toISOString()}
Test ID: ${testTimestamp}

📊 OVERALL SUMMARY:
  Total Tests: ${totalTests}
  ✅ Passed: ${totalPassed}
  ❌ Failed: ${totalFailed}
  📈 Success Rate: ${overallSuccessRate}%

📋 CATEGORY BREAKDOWN:
${categoryReports.join('\n')}

🔍 KEY FINDINGS:
1. Supabase Authentication: ${testResults.admin.tests.find(t => t.testName.includes('Login'))?.passed ? 'Working' : 'Issues Found'}
2. Role-Based Access: ${testResults.teamMember.tests.find(t => t.testName.includes('Restricted'))?.passed ? 'Properly Enforced' : 'Needs Review'}
3. Session Management: ${testResults.admin.tests.find(t => t.testName.includes('Session'))?.passed ? 'Functional' : 'Issues Found'}
4. Edge Functions: ${testResults.supabaseFeatures.tests.find(t => t.testName.includes('Edge'))?.passed ? 'Accessible' : 'Connection Issues'}
5. Real-time Features: ${testResults.supabaseFeatures.tests.find(t => t.testName.includes('Chat'))?.passed ? 'Available' : 'Not Detected'}

📝 RECOMMENDATIONS:
${totalFailed > 0 ? '- Review failed tests and fix implementation issues\n' : ''}${overallSuccessRate < 80 ? '- Improve test coverage for better reliability\n' : ''}${testResults.supabaseFeatures.failed > 2 ? '- Focus on Supabase-specific feature integration\n' : ''}
================================================
`;

    cy.log(report);
    
    // Save report to file
    cy.writeFile(`cypress/results/supabase-comprehensive-test-${testTimestamp}.json`, {
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        overallSuccessRate,
        timestamp: new Date().toISOString()
      },
      results: testResults,
      report: report
    });
  });
});