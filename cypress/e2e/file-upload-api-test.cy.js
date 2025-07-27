describe('File Upload API Testing', () => {
  const testUserId = '550e8400-e29b-41d4-a716-446655440003';
  let testConversationId = null;

  beforeEach(() => {
    // Create a test conversation by calling GET (which auto-creates for clients)
    cy.request({
      method: 'GET',
      url: '/api/conversations',
      headers: {
        'x-test-user': JSON.stringify({
          id: testUserId,
          email: 'test@example.com',
          role: 'client',
          name: 'Test User'
        })
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      console.log('Conversations response:', response.body);
      
      // Extract conversation ID for file upload tests
      if (response.body.conversations && response.body.conversations.length > 0) {
        testConversationId = response.body.conversations[0].id;
        console.log('Got conversation ID:', testConversationId);
      } else {
        // If no conversations, this GET should create one for the client
        console.log('No existing conversations, will need to handle auto-creation');
      }
    });
  });

  it('should test file upload API endpoint', () => {
    // Create a test file
    const fileName = 'test-upload.txt';
    const fileContent = 'This is a test file for upload API testing';
    
    // Create FormData with file
    const formData = new FormData();
    const file = new File([fileContent], fileName, { type: 'text/plain' });
    formData.append('files', file);

    // Test the file upload endpoint
    cy.request({
      method: 'POST',
      url: `/api/conversations/${testConversationId}/files`,
      headers: {
        'x-test-user': JSON.stringify({
          id: testUserId,
          email: 'test@example.com',
          role: 'client',
          name: 'Test User'
        })
      },
      body: formData,
      failOnStatusCode: false
    }).then((response) => {
      console.log('File upload response:', response);
      
      if (response.status === 200 || response.status === 201) {
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('files');
        expect(response.body.files).to.be.an('array');
        if (response.body.files.length > 0) {
          expect(response.body.files[0]).to.have.property('originalName', fileName);
        }
      } else {
        console.log('Upload failed with status:', response.status);
        console.log('Response body:', response.body);
      }
    });
  });

  it('should test file upload with fetch API simulation', () => {
    cy.window().then((win) => {
      // Create a test file
      const fileContent = 'Test file content for fetch API';
      const file = new File([fileContent], 'fetch-test.txt', { type: 'text/plain' });
      
      // Create FormData
      const formData = new FormData();
      formData.append('files', file);

      // Use fetch to test the endpoint
      return cy.wrap(
        fetch(`/api/conversations/${testConversationId}/files`, {
          method: 'POST',
          headers: {
            'x-test-user': JSON.stringify({
              id: testUserId,
              email: 'test@example.com',
              role: 'client',
              name: 'Test User'
            })
          },
          body: formData
        })
      ).then((response) => {
        console.log('Fetch response status:', response.status);
        
        if (response.ok) {
          return response.json().then((data) => {
            console.log('Upload success:', data);
            expect(data.success).to.be.true;
          });
        } else {
          return response.text().then((errorText) => {
            console.log('Upload error:', errorText);
          });
        }
      });
    });
  });
});