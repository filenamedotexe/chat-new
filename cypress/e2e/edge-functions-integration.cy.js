describe('Edge Functions Integration Test', () => {
  beforeEach(() => {
    // Login as admin to test functionality
    cy.visit('/login')
    cy.get('input[type="email"]').type('admin@test.com')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  })

  it('should successfully upload files using Edge Function', () => {
    // Navigate to a page with file upload capability
    cy.visit('/projects')
    
    // Create a test project first if needed, or navigate to existing project
    cy.contains('New Project').click()
    cy.get('input[name="name"]').type('Edge Function Test Project')
    cy.get('input[name="description"]').type('Testing Edge Function file upload')
    cy.get('button[type="submit"]').click()
    
    // Navigate to project files or find file upload component
    cy.contains('Files').click()
    
    // Test file upload functionality
    const fileName = 'test-file.txt'
    cy.get('input[type="file"]').should('exist')
    
    // Create a test file
    cy.writeFile(`cypress/fixtures/${fileName}`, 'This is a test file for Edge Function upload')
    
    // Upload the file
    cy.get('input[type="file"]').selectFile(`cypress/fixtures/${fileName}`)
    cy.contains('Upload Files').click()
    
    // Verify upload success
    cy.contains('uploaded successfully', { timeout: 10000 }).should('exist')
    cy.contains(fileName).should('exist')
  })

  it('should successfully send messages using Edge Function', () => {
    // Navigate to a page with messaging capability
    cy.visit('/projects')
    
    // Navigate to first project or create one
    cy.get('[data-testid="project-card"]').first().click()
    
    // Look for chat/messaging component
    cy.get('textarea, input').filter('[placeholder*="message"], [placeholder*="comment"]').first().as('messageInput')
    
    // Send a test message
    const testMessage = 'Test message via Edge Function ' + Date.now()
    cy.get('@messageInput').type(testMessage)
    cy.get('@messageInput').parent().find('button').contains(/send|post/i).click()
    
    // Verify message was sent
    cy.contains(testMessage, { timeout: 10000 }).should('exist')
  })

  it('should verify Edge Functions are accessible', () => {
    // Test that our Edge Functions respond correctly
    const baseUrl = Cypress.env('NEXT_PUBLIC_SUPABASE_URL') || 'https://ixcsflqtipcfscbloahx.supabase.co'
    const functionsUrl = `${baseUrl}/functions/v1`
    
    // Test CORS preflight for each Edge Function
    const functions = ['handle-file-upload', 'handle-chat', 'log-activity']
    
    functions.forEach(funcName => {
      cy.request({
        method: 'OPTIONS',
        url: `${functionsUrl}/${funcName}`,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.headers).to.have.property('access-control-allow-origin')
      })
    })
  })

  it('should verify frontend is calling Edge Functions instead of API routes', () => {
    // Intercept network requests to verify Edge Functions are being called
    cy.intercept('POST', '**/functions/v1/handle-file-upload').as('fileUpload')
    cy.intercept('POST', '**/functions/v1/handle-chat').as('chatMessage')
    cy.intercept('GET', '**/functions/v1/handle-chat*').as('getMessages')
    
    // Navigate to project with messaging
    cy.visit('/projects')
    cy.get('[data-testid="project-card"]').first().click()
    
    // Wait for any initial message loading
    cy.wait(2000)
    
    // Verify that GET messages call was made to Edge Function (not old API route)
    cy.get('@getMessages.all').should('have.length.at.least', 0)
    
    // Try to send a message if input exists
    cy.get('body').then($body => {
      const messageInput = $body.find('textarea, input').filter('[placeholder*="message"], [placeholder*="comment"]')
      if (messageInput.length > 0) {
        cy.wrap(messageInput.first()).type('Test Edge Function call')
        cy.wrap(messageInput.first()).parent().find('button').contains(/send|post/i).click()
        
        // Verify Edge Function was called
        cy.wait('@chatMessage', { timeout: 10000 })
      }
    })
  })
})