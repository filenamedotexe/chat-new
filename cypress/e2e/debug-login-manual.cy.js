describe('Debug Login - Manual Test', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      if (err.message.includes('NEXT_REDIRECT')) {
        return false
      }
    })
  })

  it('should manually test login process step by step', () => {
    cy.log('🔍 Manual login debugging started')
    
    // Step 1: Visit login page
    cy.visit('/login', { failOnStatusCode: false })
    cy.wait(3000)
    
    // Step 2: Verify login page loaded
    cy.get('body').should('contain', 'Supabase Auth Login')
    cy.log('✅ Login page loaded successfully')
    
    // Step 3: Fill in admin credentials
    cy.get('input[type="email"]').should('be.visible').clear().type('admin@test.com')
    cy.get('input[type="password"]').should('be.visible').clear().type('password123')
    cy.log('✅ Credentials entered')
    
    // Step 4: Submit form and watch for changes
    cy.get('button[type="submit"]').should('contain', 'Sign In with Supabase').click()
    cy.log('✅ Login form submitted')
    
    // Step 5: Wait and check for success/error messages
    cy.wait(8000)
    
    cy.get('body').then($body => {
      const bodyText = $body.text()
      
      if (bodyText.includes('✅ Login successful')) {
        cy.log('✅ Login success message detected')
        
        // Wait for redirect
        cy.wait(3000)
        cy.url().then(url => {
          cy.log(`Current URL after login: ${url}`)
          
          if (url.includes('/dashboard')) {
            cy.log('✅ Successfully redirected to dashboard')
          } else {
            cy.log(`❌ Still on: ${url}`)
          }
        })
        
      } else if (bodyText.includes('❌ Login failed')) {
        cy.log('❌ Login failed - checking error message')
        
        // Look for specific error
        if (bodyText.includes('Invalid login credentials')) {
          cy.log('❌ Invalid credentials error')
        } else if (bodyText.includes('Invalid email or password')) {
          cy.log('❌ Invalid email/password error')
        } else {
          cy.log('❌ Other login error detected')
        }
        
      } else if (bodyText.includes('🔄 Signing in')) {
        cy.log('⏳ Still showing loading state - wait longer')
        cy.wait(5000)
        
        cy.get('body').then($body2 => {
          const bodyText2 = $body2.text()
          cy.log(`After additional wait: ${bodyText2.includes('✅') ? 'Success' : bodyText2.includes('❌') ? 'Failed' : 'Unknown'}`)
        })
        
      } else {
        cy.log('⚠️ Unexpected page state')
        cy.log(`Page contains: ${bodyText.substring(0, 200)}`)
      }
    })
    
    // Step 6: Final URL check
    cy.url().then(url => {
      cy.log(`Final URL: ${url}`)
    })
  })

  it('should test login with invalid credentials to verify error handling', () => {
    cy.log('🔍 Testing invalid credentials')
    
    cy.visit('/login', { failOnStatusCode: false })
    cy.wait(2000)
    
    // Try with invalid credentials
    cy.get('input[type="email"]').clear().type('invalid@test.com')
    cy.get('input[type="password"]').clear().type('wrongpassword')
    
    cy.get('button[type="submit"]').click()
    cy.wait(5000)
    
    cy.get('body').then($body => {
      const bodyText = $body.text()
      
      if (bodyText.includes('❌ Login failed')) {
        cy.log('✅ Invalid credentials correctly rejected')
      } else {
        cy.log('⚠️ Expected error message not found')
        cy.log(`Page contains: ${bodyText.substring(0, 200)}`)
      }
    })
  })

  it('should test console logs and network requests during login', () => {
    cy.log('🔍 Testing login with network monitoring')
    
    // Monitor console logs
    cy.window().then((win) => {
      cy.stub(win.console, 'log').as('consoleLog')
      cy.stub(win.console, 'error').as('consoleError')
    })
    
    // Monitor network requests
    cy.intercept('POST', '**/auth/v1/token*').as('authRequest')
    cy.intercept('POST', '**/functions/v1/**').as('functionRequest')
    
    cy.visit('/login', { failOnStatusCode: false })
    cy.wait(2000)
    
    cy.get('input[type="email"]').clear().type('admin@test.com')
    cy.get('input[type="password"]').clear().type('password123')
    
    cy.get('button[type="submit"]').click()
    
    // Wait for potential auth request
    cy.wait(5000)
    
    // Check if auth request was made
    cy.get('@authRequest.all').then((calls) => {
      if (calls.length > 0) {
        cy.log(`✅ Auth request made: ${calls.length} calls`)
        cy.log(`Auth request status: ${calls[0].response?.statusCode}`)
      } else {
        cy.log('❌ No auth requests detected')
      }
    })
    
    // Check console logs
    cy.get('@consoleLog').should('have.been.called')
    cy.get('@consoleError').then((stub) => {
      if (stub.callCount > 0) {
        cy.log(`⚠️ Console errors detected: ${stub.callCount}`)
      } else {
        cy.log('✅ No console errors')
      }
    })
  })
})