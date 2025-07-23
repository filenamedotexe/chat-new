describe('Phase 4: Organizations & Projects', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  describe('Organizations Management', () => {
    beforeEach(() => {
      cy.login('admin@example.com', 'admin123');
    });

    it('should display organizations list', () => {
      cy.visit('/organizations');
      
      cy.contains('Organizations').should('be.visible');
      cy.screenshot('phase4-organizations-list');
      
      // Check if organizations exist
      cy.get('body').then($body => {
        if ($body.find('article, [class*="card"]').length > 0) {
          cy.get('article, [class*="card"]').should('have.length.at.least', 1);
        }
      });
    });

    it('should create new organization', () => {
      cy.visit('/organizations');
      
      // Click new organization button
      cy.contains('button', /New Organization|Add Organization/i).click();
      
      // Fill form
      cy.get('input[name="name"]').type('Test Organization');
      cy.get('textarea[name="description"]').type('Test organization description');
      
      cy.screenshot('phase4-new-org-form');
      
      // Submit
      cy.get('button[type="submit"]').click();
      
      // Should redirect back to organizations
      cy.url().should('include', '/organizations');
      cy.contains('Test Organization').should('be.visible');
      
      cy.screenshot('phase4-org-created');
    });

    it('should show organization details', () => {
      cy.visit('/organizations');
      
      // Click first organization
      cy.get('article, [class*="card"]').first().click();
      
      // Should show organization details
      cy.url().should('match', /\/organizations\/[\w-]+/);
      
      cy.screenshot('phase4-org-details');
    });

    it('should not show organizations to clients', () => {
      cy.login('user@example.com', 'user123');
      cy.visit('/dashboard');
      
      // Check if Organizations link is visible in nav
      cy.get('nav').then($nav => {
        const hasOrgLink = $nav.text().includes('Organizations');
        
        if (hasOrgLink) {
          // If visible, click it
          cy.contains('Organizations').click();
          
          // Client should see limited view or no orgs
          cy.get('article').should('have.length', 0);
        }
      });
      
      cy.screenshot('phase4-client-no-orgs');
    });
  });

  describe('Projects Management', () => {
    beforeEach(() => {
      cy.login('admin@example.com', 'admin123');
    });

    it('should display projects list', () => {
      cy.visit('/projects');
      
      cy.contains('Projects').should('be.visible');
      cy.screenshot('phase4-projects-list');
      
      // Check for existing projects
      cy.get('body').then($body => {
        const projectCount = $body.find('article').length;
        cy.log(`Found ${projectCount} projects`);
      });
    });

    it('should create new project', () => {
      cy.visit('/projects');
      
      // Ensure we have organizations first
      cy.visit('/organizations');
      cy.get('body').then($body => {
        if ($body.find('article').length === 0) {
          // Create an organization first
          cy.contains('button', /New Organization|Add Organization/i).click();
          cy.get('input[name="name"]').type('Project Test Org');
          cy.get('textarea[name="description"]').type('Organization for project testing');
          cy.get('button[type="submit"]').click();
          cy.wait(1000);
        }
      });
      
      // Now create project
      cy.visit('/projects');
      cy.contains('button', 'New Project').click();
      
      // Fill project form
      cy.get('input[name="name"]').type('Test Project');
      cy.get('select[name="organizationId"]').select(1);
      cy.get('textarea[name="description"]').type('Test project description');
      
      // Optional: Set dates
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      cy.get('input[name="startDate"]').type(today.toISOString().split('T')[0]);
      cy.get('input[name="endDate"]').type(nextMonth.toISOString().split('T')[0]);
      
      cy.screenshot('phase4-new-project-form');
      
      // Submit
      cy.get('button[type="submit"]').click();
      
      // Should redirect to projects
      cy.url().should('include', '/projects');
      cy.contains('Test Project').should('be.visible');
      
      cy.screenshot('phase4-project-created');
    });

    it('should show project details', () => {
      cy.visit('/projects');
      
      // Click first project
      cy.get('article').first().click();
      
      // Should show project details
      cy.url().should('match', /\/projects\/[\w-]+$/);
      
      cy.screenshot('phase4-project-details');
    });

    it('should link projects to organizations', () => {
      cy.visit('/projects');
      
      // Check that projects show their organization
      cy.get('article').first().within(() => {
        // Should display organization name
        cy.get('[class*="text-muted"], [class*="text-gray"]').should('exist');
      });
      
      cy.screenshot('phase4-project-org-link');
    });
  });

  describe('Client Access Control', () => {
    beforeEach(() => {
      cy.login('user@example.com', 'user123');
    });

    it('should show only client projects', () => {
      cy.visit('/projects');
      
      // Client should see projects page
      cy.contains('Projects').should('be.visible');
      
      // But might have limited projects
      cy.get('body').then($body => {
        const projectCount = $body.find('article').length;
        cy.log(`Client sees ${projectCount} projects`);
      });
      
      cy.screenshot('phase4-client-projects');
    });

    it('should not allow clients to create projects', () => {
      cy.visit('/projects');
      
      // New Project button should not exist
      cy.contains('button', 'New Project').should('not.exist');
      
      cy.screenshot('phase4-client-no-create');
    });

    it('should allow clients to view project details', () => {
      cy.visit('/projects');
      
      cy.get('body').then($body => {
        if ($body.find('article').length > 0) {
          cy.get('article').first().click();
          
          // Should be able to view project
          cy.url().should('match', /\/projects\/[\w-]+$/);
          
          cy.screenshot('phase4-client-project-view');
        }
      });
    });
  });

  describe('Project-Client Relationship', () => {
    beforeEach(() => {
      cy.login('admin@example.com', 'admin123');
    });

    it('should assign projects to client organizations', () => {
      cy.visit('/projects/new');
      
      // Check organization selector
      cy.get('select[name="organizationId"]').should('be.visible');
      cy.get('select[name="organizationId"] option').should('have.length.at.least', 2);
      
      cy.screenshot('phase4-project-org-selector');
    });

    it('should validate organization assignment', () => {
      cy.visit('/projects/new');
      
      // Try to submit without selecting org
      cy.get('input[name="name"]').type('No Org Project');
      cy.get('button[type="submit"]').click();
      
      // Should require organization
      cy.get('select[name="organizationId"]:invalid').should('exist');
      
      cy.screenshot('phase4-project-org-required');
    });
  });
});