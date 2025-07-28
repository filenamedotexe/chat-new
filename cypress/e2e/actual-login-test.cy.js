describe('Actual Login Test - Real User Interaction', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      if (err.message.includes('NEXT_REDIRECT')) {
        return false
      }
    })
  })

  it('should perform real login with admin credentials', () => {
    cy.log('🚀 Starting REAL login test with admin@test.com')
    
    // Clear everything first
    cy.clearCookies()
    cy.clearLocalStorage()
    
    // Visit login page
    cy.visit('/login', { failOnStatusCode: false })
    cy.wait(3000)
    
    // Verify login form loaded
    cy.get('body').should('contain', 'Supabase Auth Login')
    cy.log('✅ Login page loaded')
    
    // Enter REAL credentials
    cy.get('input[type="email"]')
      .should('be.visible')
      .clear()
      .type('admin@test.com')
      .should('have.value', 'admin@test.com')
    
    cy.get('input[type="password"]')
      .should('be.visible') 
      .clear()
      .type('password123')
      .should('have.value', 'password123')
    
    cy.log('✅ Credentials entered correctly')
    
    // Click submit and wait
    cy.get('button[type="submit"]')
      .should('contain', 'Sign In with Supabase')
      .click()
    
    cy.log('✅ Login button clicked')
    
    // Wait longer and check for results
    cy.wait(10000)
    
    // Check what happened
    cy.url().then(currentUrl => {
      cy.log(`Current URL: ${currentUrl}`)
    })
    
    cy.get('body').then($body => {
      const text = $body.text()
      
      if (text.includes('✅ Login successful')) {
        cy.log('🎉 LOGIN SUCCESSFUL!')
        
        // Check if redirected to dashboard
        cy.url({ timeout: 15000 }).should('include', '/dashboard')
        cy.log('🎉 REDIRECTED TO DASHBOARD!')
        
      } else if (text.includes('❌ Login failed')) {
        cy.log('❌ Login failed - checking error')
        
        // Look for specific error message
        if (text.includes('Invalid login credentials')) {
          cy.log('❌ Invalid credentials error')
        } else if (text.includes('User not found')) {
          cy.log('❌ User not found error')
        } else {
          cy.log('❌ Other login error')
        }
        
        // Capture the error message
        cy.get('[style*="fff2f0"], [style*="red"]').then($errorDiv => {
          if ($errorDiv.length > 0) {
            cy.log(`Error message: ${$errorDiv.text()}`)
          }
        })
        
      } else if (text.includes('🔄 Signing in')) {
        cy.log('⏳ Still loading...')
        cy.wait(5000)
        
        cy.get('body').then($body2 => {
          const text2 = $body2.text()
          if (text2.includes('✅')) {
            cy.log('✅ Login eventually succeeded')
          } else if (text2.includes('❌')) {
            cy.log('❌ Login eventually failed')
          } else {
            cy.log('⚠️ Still unclear result')
          }
        })
        
      } else {
        cy.log('⚠️ Unexpected page state')
        cy.log(`Page preview: ${text.substring(0, 300)}`)
      }
    })
  })

  it('should test with each user role to see which works', () => {
    const users = [
      { email: 'admin@test.com', password: 'password123', role: 'admin' },
      { email: 'team@test.com', password: 'password123', role: 'team_member' },
      { email: 'client@test.com', password: 'password123', role: 'client' }
    ]

    users.forEach(user => {
      cy.log(`🧪 Testing login for ${user.role}: ${user.email}`)
      
      cy.clearCookies()
      cy.clearLocalStorage()
      
      cy.visit('/login', { failOnStatusCode: false })
      cy.wait(2000)
      
      cy.get('input[type="email"]').clear().type(user.email)
      cy.get('input[type="password"]').clear().type(user.password)
      
      cy.get('button[type="submit"]').click()
      cy.wait(8000)
      
      cy.get('body').then($body => {
        const text = $body.text()
        
        if (text.includes('✅ Login successful')) {
          cy.log(`✅ ${user.role} login SUCCESSFUL`)
        } else if (text.includes('❌ Login failed')) {
          cy.log(`❌ ${user.role} login FAILED`)
        } else {
          cy.log(`⚠️ ${user.role} login UNCLEAR`)
        }
      })
    })
  })

  it('should monitor network requests during login', () => {
    cy.log('🌐 Monitoring network requests during login')
    
    // Intercept Supabase auth requests
    cy.intercept('POST', '**/auth/v1/token**').as('supabaseAuth')
    cy.intercept('GET', '**/auth/v1/user**').as('supabaseUser')
    cy.intercept('POST', '**/rest/v1/**').as('supabaseRest')
    
    cy.visit('/login', { failOnStatusCode: false })
    cy.wait(2000)
    
    cy.get('input[type="email"]').type('admin@test.com')
    cy.get('input[type="password"]').type('password123')
    
    cy.get('button[type="submit"]').click()
    
    // Wait for potential network requests
    cy.wait(10000)
    
    // Check what requests were made
    cy.get('@supabaseAuth.all').then(calls => {
      if (calls.length > 0) {
        cy.log(`✅ Supabase auth requests made: ${calls.length}`)
        calls.forEach((call, index) => {
          cy.log(`Request ${index + 1}: ${call.response?.statusCode}`)
        })
      } else {
        cy.log('❌ No Supabase auth requests detected')
      }
    })
    
    cy.get('@supabaseUser.all').then(calls => {
      cy.log(`User requests: ${calls.length}`)
    })
    
    cy.get('@supabaseRest.all').then(calls => {
      cy.log(`REST requests: ${calls.length}`)
    })
  })
})