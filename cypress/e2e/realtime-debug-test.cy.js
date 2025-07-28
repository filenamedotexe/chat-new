describe('Real-time Chat Debug Test', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      if (err.message.includes('NEXT_REDIRECT')) {
        return false
      }
    })
  })

  it('should debug real-time chat implementation step by step', () => {
    cy.log('🔍 Starting real-time chat debug test')
    
    // Login as admin
    cy.visit('/login', { failOnStatusCode: false })
    cy.wait(2000)
    
    cy.get('input[type="email"]').clear().type('admin@test.com')
    cy.get('input[type="password"]').clear().type('password123')
    cy.get('button[type="submit"]').click()
    cy.wait(5000)
    
    cy.url().should('include', '/dashboard')
    cy.log('✅ Successfully logged in as admin')
    
    // Check what's available on the dashboard
    cy.get('body').then($body => {
      const bodyText = $body.text()
      
      cy.log('📋 Dashboard content preview:')
      cy.log(bodyText.substring(0, 500))
      
      // Look for any chat-related components
      const hasChatContainer = $body.find('[data-testid*="chat"]').length > 0
      const hasMessageInput = $body.find('textarea').length > 0
      const hasMessagesList = $body.find('[data-testid*="message"]').length > 0
      
      cy.log(`Chat container found: ${hasChatContainer}`)
      cy.log(`Message input found: ${hasMessageInput}`)
      cy.log(`Messages list found: ${hasMessagesList}`)
      
      if (hasMessageInput) {
        cy.log('✅ Found message input - testing interaction')
        cy.get('textarea').first().type('Debug test message')
        cy.wait(1000)
      }
    })
    
    // Check projects page
    cy.visit('/projects', { failOnStatusCode: false })
    cy.wait(2000)
    
    cy.get('body').then($body => {
      cy.log('📋 Projects page loaded')
      
      // Look for any project that might have chat
      if ($body.find('a').filter(':contains("Project")').length > 0) {
        cy.log('🔗 Found project links - checking first project')
        cy.get('a').filter(':contains("Project")').first().click()
        cy.wait(3000)
        
        // Check project detail page for chat
        cy.get('body').then($projectBody => {
          const hasChat = $projectBody.find('textarea').length > 0
          cy.log(`Project detail has chat: ${hasChat}`)
          
          if (hasChat) {
            cy.log('💬 Found chat on project page - testing real-time setup')
            
            // Monitor console logs
            cy.window().then((win) => {
              const originalLog = win.console.log
              const logs = []
              
              win.console.log = (...args) => {
                logs.push(args.map(arg => String(arg)).join(' '))
                originalLog.apply(win.console, args)
              }
              
              // Wait for potential real-time setup
              cy.wait(5000).then(() => {
                const realtimeLogs = logs.filter(log => 
                  log.includes('real-time') || 
                  log.includes('subscription') || 
                  log.includes('supabase') ||
                  log.includes('🔄') ||
                  log.includes('📡')
                )
                
                cy.log(`📊 Total console logs: ${logs.length}`)
                cy.log(`📡 Real-time related logs: ${realtimeLogs.length}`)
                
                if (realtimeLogs.length > 0) {
                  cy.log('✅ Real-time logs detected:')
                  realtimeLogs.forEach(log => cy.log(`   ${log}`))
                } else {
                  cy.log('⚠️ No real-time logs detected')
                  cy.log('📝 Recent console logs:')
                  logs.slice(-10).forEach(log => cy.log(`   ${log}`))
                }
              })
            })
          }
        })
      } else {
        cy.log('ℹ️ No project links found on projects page')
      }
    })
    
    // Check tasks page
    cy.visit('/tasks', { failOnStatusCode: false })
    cy.wait(2000)
    
    cy.get('body').then($body => {
      cy.log('📋 Tasks page loaded')
      
      if ($body.find('a').filter(':contains("Task")').length > 0) {
        cy.log('🔗 Found task links - checking first task')
        cy.get('a').filter(':contains("Task")').first().click()
        cy.wait(3000)
        
        cy.get('body').then($taskBody => {
          const hasChat = $taskBody.find('textarea').length > 0
          cy.log(`Task detail has chat: ${hasChat}`)
          
          if (hasChat) {
            cy.log('💬 Found chat on task page - testing message sending')
            cy.get('textarea').first().type('Real-time test message for task{enter}')
            cy.wait(3000)
          }
        })
      }
    })
    
    cy.log('🎯 Debug test completed - check logs above for real-time activity')
  })

  it('should test Supabase client directly', () => {
    cy.log('🔧 Testing Supabase client functionality')
    
    cy.visit('/dashboard', { failOnStatusCode: false })
    cy.wait(2000)
    
    // Test Supabase client in browser context
    cy.window().then((win) => {
      // Try to access Supabase if it's available globally
      cy.log('🧪 Testing Supabase client access')
      
      // Execute client test in browser context
      cy.visit('/dashboard').then(() => {
        cy.window().then(async (win) => {
          try {
            // Try to import and test Supabase client
            const response = await fetch('/api/test-auth')
            const data = await response.json()
            cy.log('🧪 Auth test result:', JSON.stringify(data))
          } catch (error) {
            cy.log('❌ Supabase client test error:', error.message)
          }
        })
      })
    })
  })

  it('should check for existing conversations', () => {
    cy.log('🔍 Checking for existing conversations in database')
    
    // This would ideally test the database for existing conversations
    // For now, we'll test the Edge Function
    cy.request({
      method: 'POST',
      url: 'https://ixcsflqtipcfscbloahx.supabase.co/functions/v1/handle-chat',
      failOnStatusCode: false,
      body: { 
        action: 'get_messages',
        limit: 10
      }
    }).then(response => {
      cy.log(`📊 Chat Edge Function response: ${response.status}`)
      cy.log(`📝 Response body:`, response.body)
      
      if (response.status === 200) {
        cy.log('✅ Chat Edge Function is accessible')
      } else if (response.status === 401) {
        cy.log('🔐 Edge Function requires authentication (expected)')
      } else {
        cy.log('⚠️ Edge Function returned unexpected status')
      }
    })
  })
})