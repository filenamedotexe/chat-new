describe('Test Supabase Auth Simple', () => {
  beforeEach(() => {
    // Handle NEXT_REDIRECT errors
    cy.on('uncaught:exception', (err) => {
      // Return false to prevent the error from failing the test
      if (err.message.includes('NEXT_REDIRECT')) {
        return false;
      }
    });
  });

  it('should check if we can access login page', () => {
    cy.visit('/login');
    cy.wait(2000); // Wait for any redirects
    
    // Check current URL
    cy.url().then(url => {
      cy.log('Current URL:', url);
    });
    
    // Check if we're on login page
    cy.get('body').should('be.visible');
    
    // Look for any form elements
    cy.get('form, input[type="email"], input[type="password"], button').then($elements => {
      cy.log(`Found ${$elements.length} form elements`);
    });
  });

  it('should check NextAuth vs Supabase auth', () => {
    cy.visit('/login');
    cy.wait(2000);
    
    // Check page content
    cy.get('body').then($body => {
      const bodyText = $body.text();
      
      if (bodyText.includes('Supabase')) {
        cy.log('✅ Supabase auth detected');
        
        // Try Supabase login
        cy.get('input[type="email"]').type('admin@test.com');
        cy.get('input[type="password"]').type('password123');
        cy.get('button[type="submit"]').click();
        
        cy.wait(5000);
        cy.url().then(url => {
          cy.log('URL after Supabase login:', url);
        });
      } else {
        cy.log('⚠️ NextAuth detected or unknown auth system');
        
        // Check for NextAuth elements
        if ($body.find('#email, #password').length > 0) {
          cy.log('Found NextAuth form elements');
          cy.get('#email').type('admin@example.com');
          cy.get('#password').type('admin123');
          cy.get('button[type="submit"]').click();
          
          cy.wait(5000);
          cy.url().then(url => {
            cy.log('URL after NextAuth login:', url);
          });
        }
      }
    });
  });

  it('should test the actual login flow', () => {
    // First, let's check if the feature flag is enabled
    cy.request('/api/features/supabaseAuth/check').then(response => {
      cy.log('Supabase Auth Feature Flag:', response.body);
      
      if (response.body.enabled) {
        cy.log('✅ Supabase Auth is ENABLED');
      } else {
        cy.log('❌ Supabase Auth is DISABLED - using NextAuth');
      }
    });
    
    // Now try to login
    cy.visit('/login');
    cy.wait(2000);
    
    // Try both auth methods
    cy.get('body').then($body => {
      // First try Supabase selectors
      if ($body.find('input[type="email"]').length > 0) {
        cy.get('input[type="email"]').type('admin@test.com');
        cy.get('input[type="password"]').type('password123');
        cy.get('button[type="submit"]').click();
        cy.log('Used Supabase auth form');
      } 
      // Then try NextAuth selectors
      else if ($body.find('#email').length > 0) {
        cy.get('#email').type('admin@example.com');
        cy.get('#password').type('admin123');
        cy.get('button[type="submit"]').click();
        cy.log('Used NextAuth form');
      }
      
      // Wait for navigation
      cy.wait(5000);
      
      // Check if we're logged in
      cy.url().then(url => {
        if (url.includes('dashboard')) {
          cy.log('✅ Login successful - redirected to dashboard');
        } else {
          cy.log('❌ Login failed - still on:', url);
          
          // Check for error messages
          cy.get('body').then($body => {
            const errorText = $body.text();
            if (errorText.includes('error') || errorText.includes('failed')) {
              cy.log('Error message found:', errorText);
            }
          });
        }
      });
    });
  });
});