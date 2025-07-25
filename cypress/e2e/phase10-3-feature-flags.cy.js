describe('Phase 10.3: Feature Flags System', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should display feature flags manager in admin dashboard', () => {
    cy.visit('/admin');
    cy.contains('h1', 'Admin Dashboard').should('be.visible');
    
    // Check for feature management section
    cy.contains('h2', 'Feature Management').should('be.visible');
    
    // Check for feature flags manager component
    cy.get('[data-testid="feature-flags-manager"]', { timeout: 10000 }).should('be.visible');
  });

  it('should toggle feature flags', () => {
    cy.visit('/admin');
    
    // Find the beta features flag
    cy.contains('betaFeatures').should('be.visible');
    
    // Check initial state (should be disabled)
    cy.contains('betaFeatures')
      .parent()
      .parent()
      .within(() => {
        cy.contains('Disabled').should('be.visible');
      });
    
    // Toggle the feature using data-testid
    cy.get('[data-testid="toggle-betaFeatures"]').click();
    
    // Wait for update
    cy.wait(1000);
    
    // Check new state
    cy.contains('betaFeatures')
      .parent()
      .parent()
      .within(() => {
        cy.contains('Enabled').should('be.visible');
      });
  });

  it('should create new feature flag', () => {
    cy.visit('/admin');
    
    // Click add feature button
    cy.contains('button', 'Add Feature').click();
    
    // Fill out form
    cy.get('input[placeholder*="advancedAnalytics"]').type('testFeature');
    cy.get('textarea[placeholder*="Describe what this feature"]').type('Test feature for Cypress');
    cy.get('#enabled').check();
    
    // Submit form
    cy.contains('button', 'Create Feature').click();
    
    // Verify new feature appears
    cy.contains('testFeature').should('be.visible');
    cy.contains('Test feature for Cypress').should('be.visible');
    cy.contains('testFeature')
      .parent()
      .parent()
      .within(() => {
        cy.contains('Enabled').should('be.visible');
      });
  });

  it('should respect feature flags in task detail', () => {
    // Navigate directly to test project tasks using known project ID from database
    cy.visit('/projects/ded3e96d-cba9-48c9-80b6-5b7de92e3665/tasks');
    
    // Wait for tasks to load and click on first task
    cy.get('[data-testid="task-card"]', { timeout: 10000 }).first().click();
    
    // Check that discussion button is visible (chat is enabled by default)
    cy.contains('button', 'Discussion').should('be.visible');
    
    // Check that attachments section is visible (fileUpload is enabled by default)
    cy.get('[data-testid="attachments-section"]').should('be.visible');
  });

  it('should hide features when flags are disabled', () => {
    // First disable the chat feature
    cy.visit('/admin');
    
    // Find and disable chat feature
    cy.get('[data-testid="toggle-chat"]').click();
    
    cy.wait(1000);
    
    // Navigate directly to test project tasks
    cy.visit('/projects/ded3e96d-cba9-48c9-80b6-5b7de92e3665/tasks');
    
    // Wait for tasks to load and click on first task
    cy.get('[data-testid="task-card"]', { timeout: 10000 }).first().click();
    
    // Discussion button should not be visible
    cy.contains('button', 'Discussion').should('not.exist');
  });

  it('should control theme features in navigation', () => {
    cy.visit('/dashboard');
    
    // Check if dark mode controls are present when darkMode feature is enabled
    cy.get('nav').should('exist');
    // Theme controls should be visible by default since darkMode is enabled
    cy.get('[data-testid="theme-toggle"]').should('exist');
  });

  it('should control advanced analytics in project detail', () => {
    // First enable advanced analytics
    cy.visit('/admin');
    
    // Find and enable advanced analytics feature
    cy.get('[data-testid="toggle-advancedAnalytics"]').click();
    
    cy.wait(1000);
    
    // Navigate to project detail using direct URL
    cy.visit('/projects/ded3e96d-cba9-48c9-80b6-5b7de92e3665');
    
    // Advanced analytics section should now be visible
    cy.contains('Advanced Analytics').should('be.visible');
    
    // Should show analytics cards
    cy.contains('Completion Rate').should('be.visible');
    cy.contains('Days Active').should('be.visible');
  });

  it('should control beta features in settings', () => {
    // Enable beta features first
    cy.visit('/admin');
    
    // Simply toggle betaFeatures to ensure it's enabled
    cy.get('[data-testid="toggle-betaFeatures"]').click();
    
    cy.wait(2000);
    
    // Navigate to settings
    cy.visit('/settings');
    
    // Beta features section should be accessible
    cy.contains('Beta Features').should('be.visible');
    // Check for experimental features text - use partial match
    cy.contains('experimental').should('be.visible');
  });

  it('should handle feature flag API correctly', () => {
    // Test feature flag API endpoint
    cy.request('GET', '/api/features/chat/check').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('enabled');
      expect(response.body.enabled).to.be.a('boolean');
    });
    
    // Test non-existent feature
    cy.request('GET', '/api/features/nonExistentFeature/check').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.enabled).to.be.false;
    });
  });

  it('should maintain feature flag state across page reloads', () => {
    cy.visit('/admin');
    
    // Toggle advancedAnalytics feature to enable it
    cy.get('[data-testid="toggle-advancedAnalytics"]').click();
    
    cy.wait(2000);
    
    // Verify it's enabled before reload
    cy.contains('advancedAnalytics')
      .parent()
      .parent()
      .within(() => {
        cy.contains('Enabled').should('be.visible');
      });
    
    // Reload the page
    cy.reload();
    
    // Feature should still be enabled after reload
    cy.contains('advancedAnalytics')
      .parent()
      .parent()
      .within(() => {
        cy.contains('Enabled').should('be.visible');
      });
  });
});

// Clean up test feature
after(() => {
  // Simple cleanup - just log a message
  cy.log('Tests completed - testFeature cleanup would be handled by admin if needed');
});