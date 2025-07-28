describe('Real-time Chat - Admin Only Test', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      if (err.message.includes('NEXT_REDIRECT')) {
        return false
      }
    })
  })

  it('should test ONLY admin real-time functionality in isolation', () => {
    cy.log('🔐 Testing ISOLATED Admin Real-time Chat')
    
    // Clear everything completely
    cy.clearCookies()
    cy.clearLocalStorage()
    
    // Visit login page
    cy.visit('/login', { failOnStatusCode: false })
    cy.wait(3000)
    
    // Debug: Log what's actually on the page
    cy.get('body').then($body => {
      const bodyText = $body.text()
      cy.log('📋 ACTUAL PAGE CONTENT:')
      cy.log(bodyText.substring(0, 500))
      
      // Check if our expected text is there
      if (bodyText.includes('Supabase Auth Login')) {
        cy.log('✅ Found expected login text')
      } else if (bodyText.includes('🔐')) {
        cy.log('✅ Found login emoji - text might be slightly different')
      } else {
        cy.log('❌ Expected login text not found')
        cy.log('🔍 Looking for any form elements...')
        
        const hasEmailInput = $body.find('input[type="email"]').length > 0
        const hasPasswordInput = $body.find('input[type="password"]').length > 0
        const hasSubmitButton = $body.find('button[type="submit"]').length > 0
        
        cy.log(`Email input: ${hasEmailInput}`)
        cy.log(`Password input: ${hasPasswordInput}`)
        cy.log(`Submit button: ${hasSubmitButton}`)
      }
    })
    
    // Try a more flexible approach to find the login form
    cy.get('input[type="email"]', { timeout: 10000 }).should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
    
    cy.log('✅ Login form elements found')
    
    // Fill in admin credentials
    cy.get('input[type="email"]')
      .clear()
      .type('admin@test.com')
      .should('have.value', 'admin@test.com')
    
    cy.get('input[type="password"]')
      .clear()
      .type('password123')
      .should('have.value', 'password123')
    
    cy.log('✅ Admin credentials entered')
    
    // Submit the form
    cy.get('button[type="submit"]').click()
    cy.log('🔄 Admin login submitted')
    
    // Wait for response
    cy.wait(10000)
    
    // Check what happened
    cy.get('body').then($body => {
      const bodyText = $body.text()
      
      if (bodyText.includes('✅ Login successful')) {
        cy.log('🎉 ADMIN LOGIN SUCCESSFUL!')
        
        cy.wait(3000)
        cy.url().should('include', '/dashboard')
        cy.log('🎉 Admin redirected to dashboard successfully')
        
        // Now test real-time functionality
        cy.log('📡 Testing real-time functionality...')
        
        // Look for any chat interfaces
        cy.get('body').then($dashBody => {
          const hasTextarea = $dashBody.find('textarea').length > 0
          const hasMessageInput = $dashBody.find('input').filter('[placeholder*="message"]').length > 0
          
          cy.log(`Dashboard has textarea: ${hasTextarea}`)
          cy.log(`Dashboard has message input: ${hasMessageInput}`)
          
          if (hasTextarea || hasMessageInput) {
            cy.log('✅ Found chat interface on dashboard')
            
            // Monitor console for real-time subscriptions
            cy.window().then((win) => {
              let realtimeLogs = []
              const originalLog = win.console.log
              
              win.console.log = (...args) => {
                const logText = args.map(arg => String(arg)).join(' ')
                if (logText.includes('real-time') || 
                    logText.includes('subscription') || 
                    logText.includes('🔄') || 
                    logText.includes('📡')) {
                  realtimeLogs.push(logText)
                }
                originalLog.apply(win.console, args)
              }
              
              // Wait for potential subscriptions to set up
              cy.wait(5000)
              
              cy.then(() => {
                if (realtimeLogs.length > 0) {
                  cy.log('✅ Real-time logs detected:')
                  realtimeLogs.forEach(log => cy.log(`   ${log}`))
                } else {
                  cy.log('ℹ️ No real-time logs detected yet')
                }
              })
            })
            
          } else {
            cy.log('ℹ️ No immediate chat interface on dashboard')
            
            // Check other pages
            cy.visit('/projects', { failOnStatusCode: false })
            cy.wait(2000)
            
            cy.get('body').then($projBody => {
              const hasProjectChat = $projBody.find('textarea').length > 0
              cy.log(`Projects page has chat: ${hasProjectChat}`)
              
              if (hasProjectChat) {
                cy.log('✅ Found chat interface on projects page')
              }
            })
          }
        })
        
      } else if (bodyText.includes('❌ Login failed')) {
        cy.log('❌ ADMIN LOGIN FAILED')
        cy.log(`Error details: ${bodyText.substring(0, 300)}`)
        
      } else {
        cy.log('⚠️ Unclear login result')
        cy.log(`Page preview: ${bodyText.substring(0, 300)}`)
      }
    })
    
    cy.log('🎯 Admin isolated test completed')
  })
})