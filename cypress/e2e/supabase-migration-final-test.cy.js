describe('Supabase Migration Final Comprehensive Test', () => {
  const timestamp = Date.now();
  const testLog = [];
  
  // Helper to add to test log
  const addLog = (category, test, result, details = '') => {
    const entry = {
      timestamp: new Date().toISOString(),
      category,
      test,
      result,
      details
    };
    testLog.push(entry);
    cy.log(`${result === 'PASS' ? '✅' : '❌'} [${category}] ${test} ${details ? `- ${details}` : ''}`);
  };

  beforeEach(() => {
    cy.viewport(1920, 1080);
    // Handle Next.js redirects
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('NEXT_REDIRECT')) {
        return false;
      }
    });
  });

  describe('1. Supabase Authentication Testing', () => {
    it('should verify Supabase auth is enabled', () => {
      cy.request('/api/features/supabaseAuth/check').then(response => {
        if (response.body.enabled) {
          addLog('AUTH', 'Supabase Feature Flag', 'PASS', 'Feature is enabled');
        } else {
          addLog('AUTH', 'Supabase Feature Flag', 'FAIL', 'Feature is disabled');
        }
      });
    });

    it('should test admin login with Supabase', () => {
      cy.visit('/login');
      cy.wait(2000);
      
      // Check for Supabase login page
      cy.get('body').then($body => {
        if ($body.text().includes('Supabase')) {
          addLog('AUTH', 'Supabase Login Page', 'PASS');
          
          // Login as admin
          cy.get('input[type="email"]').type('admin@test.com');
          cy.get('input[type="password"]').type('password123');
          cy.get('button[type="submit"]').click();
          
          // Wait for login
          cy.wait(5000);
          
          cy.url().then(url => {
            if (url.includes('dashboard')) {
              addLog('AUTH', 'Admin Login', 'PASS', 'Redirected to dashboard');
              
              // Check for admin content
              cy.get('h1').then($h1 => {
                if ($h1.text().includes('Admin')) {
                  addLog('AUTH', 'Admin Dashboard Access', 'PASS');
                } else {
                  addLog('AUTH', 'Admin Dashboard Access', 'FAIL', 'Not admin dashboard');
                }
              });
            } else {
              addLog('AUTH', 'Admin Login', 'FAIL', `Still on ${url}`);
            }
          });
        } else {
          addLog('AUTH', 'Supabase Login Page', 'FAIL', 'Not using Supabase auth');
        }
      });
    });

    it('should test session persistence', () => {
      // Login first
      cy.visit('/login');
      cy.get('input[type="email"]').type('admin@test.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.wait(5000);
      
      // Reload page
      cy.reload();
      cy.wait(2000);
      
      cy.url().then(url => {
        if (url.includes('dashboard')) {
          addLog('AUTH', 'Session Persistence', 'PASS', 'Still logged in after reload');
        } else {
          addLog('AUTH', 'Session Persistence', 'FAIL', 'Lost session after reload');
        }
      });
      
      // Check localStorage for Supabase token
      cy.window().then(win => {
        const token = win.localStorage.getItem('supabase.auth.token');
        if (token) {
          addLog('AUTH', 'Supabase Auth Token', 'PASS', 'Token found in localStorage');
        } else {
          addLog('AUTH', 'Supabase Auth Token', 'FAIL', 'No token in localStorage');
        }
      });
    });

    it('should test logout functionality', () => {
      // Login first
      cy.visit('/login');
      cy.get('input[type="email"]').type('admin@test.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.wait(5000);
      
      // Find and click logout
      cy.get('button').contains(/logout|sign out/i).click({ force: true });
      cy.wait(2000);
      
      cy.url().then(url => {
        if (url.includes('login')) {
          addLog('AUTH', 'Logout', 'PASS', 'Redirected to login');
        } else {
          addLog('AUTH', 'Logout', 'FAIL', `Still on ${url}`);
        }
      });
    });
  });

  describe('2. Role-Based Access Testing', () => {
    it('should test team member access', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('team@test.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.wait(5000);
      
      // Check dashboard
      cy.get('h1').then($h1 => {
        if (!$h1.text().includes('Admin')) {
          addLog('RBAC', 'Team Member Dashboard', 'PASS', 'Not admin dashboard');
        } else {
          addLog('RBAC', 'Team Member Dashboard', 'FAIL', 'Shows admin dashboard');
        }
      });
      
      // Try to access admin page
      cy.visit('/admin', { failOnStatusCode: false });
      cy.wait(2000);
      
      cy.url().then(url => {
        if (!url.includes('/admin')) {
          addLog('RBAC', 'Admin Page Restriction', 'PASS', 'Cannot access admin');
        } else {
          addLog('RBAC', 'Admin Page Restriction', 'FAIL', 'Can access admin');
        }
      });
    });

    it('should test client access', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('client@test.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.wait(5000);
      
      // Check limited access
      cy.visit('/projects');
      cy.wait(2000);
      
      // Check for create button (should not exist for clients)
      cy.get('body').then($body => {
        const createBtn = $body.find('button:contains("Create"), button:contains("New")');
        if (createBtn.length === 0) {
          addLog('RBAC', 'Client Create Restriction', 'PASS', 'No create buttons');
        } else {
          addLog('RBAC', 'Client Create Restriction', 'FAIL', 'Has create buttons');
        }
      });
    });
  });

  describe('3. Supabase Storage Testing', () => {
    it('should test file page access', () => {
      // Login as admin for full access
      cy.visit('/login');
      cy.get('input[type="email"]').type('admin@test.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.wait(5000);
      
      cy.visit('/files');
      cy.wait(2000);
      
      cy.url().then(url => {
        if (url.includes('/files')) {
          addLog('STORAGE', 'Files Page Access', 'PASS');
          
          // Check for upload button
          cy.get('body').then($body => {
            const uploadBtn = $body.find('button:contains("Upload"), button:contains("upload")');
            if (uploadBtn.length > 0) {
              addLog('STORAGE', 'Upload Button', 'PASS', 'Found upload button');
            } else {
              addLog('STORAGE', 'Upload Button', 'FAIL', 'No upload button found');
            }
          });
        } else {
          addLog('STORAGE', 'Files Page Access', 'FAIL', `Redirected to ${url}`);
        }
      });
    });
  });

  describe('4. Real-time Features Testing', () => {
    it('should test chat/messaging UI', () => {
      // Login first
      cy.visit('/login');
      cy.get('input[type="email"]').type('team@test.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.wait(5000);
      
      // Navigate to a project
      cy.visit('/projects');
      cy.wait(2000);
      
      // Click first project
      cy.get('a[href*="/projects/"]').first().then($link => {
        const href = $link.attr('href');
        cy.visit(href);
        cy.wait(2000);
        
        // Look for chat/message elements
        cy.get('body').then($body => {
          const hasChat = $body.text().toLowerCase().includes('chat') || 
                         $body.text().toLowerCase().includes('message');
          if (hasChat) {
            addLog('REALTIME', 'Chat UI', 'PASS', 'Found chat/message elements');
            
            // Look for input
            const msgInput = $body.find('input[placeholder*="message"], textarea[placeholder*="message"]');
            if (msgInput.length > 0) {
              addLog('REALTIME', 'Message Input', 'PASS', 'Found message input');
            } else {
              addLog('REALTIME', 'Message Input', 'FAIL', 'No message input found');
            }
          } else {
            addLog('REALTIME', 'Chat UI', 'FAIL', 'No chat/message elements found');
          }
        });
      });
    });
  });

  describe('5. Edge Functions Testing', () => {
    it('should test Edge Function connectivity', () => {
      // Test CORS preflight
      cy.request({
        method: 'OPTIONS',
        url: 'https://ixcsflqtipcfscbloahx.supabase.co/functions/v1/handle-file-upload',
        failOnStatusCode: false
      }).then(response => {
        if (response.status === 200 || response.status === 204) {
          addLog('EDGE', 'File Upload Function CORS', 'PASS', `Status: ${response.status}`);
        } else {
          addLog('EDGE', 'File Upload Function CORS', 'FAIL', `Status: ${response.status}`);
        }
      });
      
      cy.request({
        method: 'OPTIONS',
        url: 'https://ixcsflqtipcfscbloahx.supabase.co/functions/v1/handle-chat',
        failOnStatusCode: false
      }).then(response => {
        if (response.status === 200 || response.status === 204) {
          addLog('EDGE', 'Chat Function CORS', 'PASS', `Status: ${response.status}`);
        } else {
          addLog('EDGE', 'Chat Function CORS', 'FAIL', `Status: ${response.status}`);
        }
      });
    });
  });

  describe('6. Performance Testing', () => {
    it('should test page load times', () => {
      // Login first
      cy.visit('/login');
      cy.get('input[type="email"]').type('admin@test.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.wait(5000);
      
      const pages = [
        { path: '/dashboard', name: 'Dashboard' },
        { path: '/projects', name: 'Projects' },
        { path: '/files', name: 'Files' },
        { path: '/tasks', name: 'Tasks' }
      ];
      
      pages.forEach(page => {
        const start = Date.now();
        cy.visit(page.path);
        cy.wait(2000);
        const loadTime = Date.now() - start;
        
        if (loadTime < 3000) {
          addLog('PERFORMANCE', `${page.name} Load Time`, 'PASS', `${loadTime}ms`);
        } else {
          addLog('PERFORMANCE', `${page.name} Load Time`, 'FAIL', `${loadTime}ms (too slow)`);
        }
      });
    });
  });

  // Generate final report
  after(() => {
    cy.log('📊 GENERATING FINAL TEST REPORT...');
    
    // Count results
    const summary = {
      total: testLog.length,
      passed: testLog.filter(t => t.result === 'PASS').length,
      failed: testLog.filter(t => t.result === 'FAIL').length,
      categories: {}
    };
    
    // Group by category
    testLog.forEach(entry => {
      if (!summary.categories[entry.category]) {
        summary.categories[entry.category] = { passed: 0, failed: 0, tests: [] };
      }
      summary.categories[entry.category].tests.push(entry);
      if (entry.result === 'PASS') {
        summary.categories[entry.category].passed++;
      } else {
        summary.categories[entry.category].failed++;
      }
    });
    
    const successRate = (summary.passed / summary.total * 100).toFixed(1);
    
    // Generate report
    const report = `
🎯 SUPABASE MIGRATION TEST REPORT
================================
Generated: ${new Date().toISOString()}
Test ID: ${timestamp}

📊 OVERALL RESULTS:
Total Tests: ${summary.total}
✅ Passed: ${summary.passed}
❌ Failed: ${summary.failed}
📈 Success Rate: ${successRate}%

📋 CATEGORY BREAKDOWN:
${Object.entries(summary.categories).map(([category, data]) => {
  const catSuccessRate = (data.passed / (data.passed + data.failed) * 100).toFixed(1);
  return `
${category}:
  ✅ Passed: ${data.passed}
  ❌ Failed: ${data.failed}
  📈 Success Rate: ${catSuccessRate}%
  Tests:
${data.tests.map(t => `    ${t.result === 'PASS' ? '✅' : '❌'} ${t.test} ${t.details ? `(${t.details})` : ''}`).join('\n')}`;
}).join('\n')}

🔍 KEY FINDINGS:
1. Authentication: ${summary.categories.AUTH?.passed > 0 ? '✅ Working' : '❌ Issues Found'}
2. Role-Based Access: ${summary.categories.RBAC?.passed > 0 ? '✅ Properly Configured' : '❌ Needs Review'}
3. Storage: ${summary.categories.STORAGE?.passed > 0 ? '✅ Accessible' : '❌ Issues Found'}
4. Real-time: ${summary.categories.REALTIME?.passed > 0 ? '✅ Detected' : '❌ Not Found'}
5. Edge Functions: ${summary.categories.EDGE?.passed > 0 ? '✅ Connected' : '❌ Connection Issues'}
6. Performance: ${summary.categories.PERFORMANCE?.passed > 2 ? '✅ Good' : '⚠️ Needs Optimization'}

📝 RECOMMENDATIONS:
${summary.failed > 0 ? '- Fix failed tests before production deployment\n' : ''}${successRate < 80 ? '- Improve overall success rate to at least 80%\n' : ''}${summary.categories.REALTIME?.failed > 0 ? '- Implement real-time features fully\n' : ''}${summary.categories.EDGE?.failed > 0 ? '- Verify Edge Function deployment and CORS settings\n' : ''}
================================
`;
    
    cy.log(report);
    
    // Save report
    cy.writeFile(`cypress/results/supabase-migration-final-${timestamp}.json`, {
      summary,
      testLog,
      report
    });
    
    cy.writeFile(`cypress/results/supabase-migration-final-${timestamp}.txt`, report);
  });
});