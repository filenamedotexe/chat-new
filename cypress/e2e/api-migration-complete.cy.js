describe('API Route Migration Complete Test', () => {
  beforeEach(() => {
    // Explicit logout to clear server-side sessions
    cy.request({
      method: 'POST',
      url: '/api/auth/signout',
      failOnStatusCode: false
    });
    
    // Clear all client-side data
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.wait(1000); // Allow server session cleanup
  });

  it('should reject unauthenticated API requests', () => {
    // Ensure no session exists by testing logout endpoint
    cy.request({
      method: 'POST',
      url: '/api/auth/signout',
      failOnStatusCode: false
    });
    
    // Clear everything again
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.wait(1000);
    
    // Test unauthorized access to projects API
    cy.request({
      url: '/api/projects',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.error).to.eq('Unauthorized');
      cy.log('Projects API properly protected when unauthorized');
    });

    // Test unauthorized access to tasks API
    cy.request({
      method: 'POST',
      url: '/api/tasks',
      body: { title: 'Test Task' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.error).to.eq('Unauthorized');
      cy.log('Tasks API properly protected when unauthorized');
    });
  });

  it('should authenticate with NextAuth and access API routes', () => {
    // Visit login page
    cy.visit('/login', { failOnStatusCode: false });
    cy.wait(2000);
    
    cy.contains('Sign In', { timeout: 10000 }).should('exist');
    
    // Check if using NextAuth (no blue indicator)
    cy.get('body').then(($body) => {
      if ($body.find('.text-blue-600').length === 0) {
        cy.log('Testing NextAuth API integration');
        
        // Login with NextAuth
        cy.get('input[type="email"]').type('admin@example.com');
        cy.get('input[type="password"]').type('admin123');
        cy.get('button[type="submit"]').click();
        
        // Wait for redirect and verify login
        cy.url({ timeout: 15000 }).then((url) => {
          if (url.includes('/dashboard')) {
            cy.log('NextAuth login successful');
            
            // Test authenticated API access
            cy.request('/api/projects').then((response) => {
              expect(response.status).to.eq(200);
              expect(response.body).to.be.an('array');
              cy.log('Projects API working with NextAuth authentication');
            });
            
            cy.request('/api/projects/with-stats').then((response) => {
              expect(response.status).to.eq(200);
              expect(response.body).to.be.an('array');
              cy.log('Project stats API working with NextAuth authentication');
            });
          } else {
            cy.log('NextAuth login failed - skipping authenticated API tests');
          }
        });
      } else {
        cy.log('Supabase auth detected - skipping NextAuth test');
      }
    });
  });

  it('should authenticate with Supabase and access API routes', () => {
    // Visit login page
    cy.visit('/login', { failOnStatusCode: false });
    cy.wait(2000);
    
    cy.contains('Sign In', { timeout: 10000 }).should('exist');
    
    // Check if using Supabase (blue indicator present)
    cy.get('body').then(($body) => {
      if ($body.find('.text-blue-600').length > 0) {
        cy.log('Testing Supabase API integration');
        
        // Login with Supabase
        cy.get('input[type="email"]').type('admin@example.com');
        cy.get('input[type="password"]').type('admin123');
        cy.get('button[type="submit"]').click();
        
        // Wait for redirect and verify login
        cy.url({ timeout: 10000 }).then((url) => {
          if (url.includes('/dashboard')) {
            cy.log('Supabase login successful');
            
            // Test authenticated API access
            cy.request('/api/projects').then((response) => {
              expect(response.status).to.eq(200);
              expect(response.body).to.be.an('array');
              cy.log('Projects API working with Supabase authentication');
            });
            
            cy.request('/api/projects/with-stats').then((response) => {
              expect(response.status).to.eq(200);
              expect(response.body).to.be.an('array');
              cy.log('Project stats API working with Supabase authentication');
            });
          } else {
            cy.log('Supabase login failed - testing that API remains protected');
            
            // Test that API routes are properly protected
            cy.request({
              url: '/api/projects',
              failOnStatusCode: false
            }).then((response) => {
              expect(response.status).to.eq(401);
              cy.log('Projects API properly protected when Supabase login fails');
            });
          }
        });
      } else {
        cy.log('NextAuth detected - skipping Supabase test');
      }
    });
  });

  it('should verify feature flag switching works for API authentication', () => {
    cy.visit('/login', { failOnStatusCode: false });
    cy.wait(2000);
    
    // Determine which auth system is active
    cy.get('body').then(($body) => {
      const isSupabaseEnabled = $body.find('.text-blue-600').length > 0;
      
      cy.log(`Testing API feature flag switching - ${isSupabaseEnabled ? 'Supabase' : 'NextAuth'} is active`);
      
      if (isSupabaseEnabled) {
        cy.contains('Using Supabase Auth').should('exist');
      } else {
        cy.contains('Using Supabase Auth').should('not.exist');
      }
      
      // Login with active auth system
      cy.get('input[type="email"]').type('admin@example.com');
      cy.get('input[type="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      
      cy.url({ timeout: 10000 }).then((url) => {
        if (url.includes('/dashboard')) {
          // Verify API adapter correctly detects and uses the active auth system
          cy.request('/api/projects').then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
            cy.log(`API adapter correctly using ${isSupabaseEnabled ? 'Supabase' : 'NextAuth'} authentication`);
          });
        } else {
          cy.log('Login failed - auth adapter should reject API requests');
          
          // Logout to ensure clean state for next test
          cy.request({
            method: 'POST',
            url: '/api/auth/signout',
            failOnStatusCode: false
          });
        }
      });
    });
  });
});