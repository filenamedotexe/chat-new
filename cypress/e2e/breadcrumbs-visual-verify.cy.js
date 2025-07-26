describe('Visual Breadcrumbs Verification', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should capture breadcrumbs on key pages', () => {
    // Tasks page
    cy.visit('/tasks');
    cy.wait(500);
    cy.screenshot('visual-breadcrumbs-tasks', { capture: 'viewport' });

    // Tasks new page
    cy.visit('/tasks/new');
    cy.wait(500);
    cy.screenshot('visual-breadcrumbs-tasks-new', { capture: 'viewport' });

    // Organizations
    cy.visit('/organizations');
    cy.wait(500);
    cy.screenshot('visual-breadcrumbs-organizations', { capture: 'viewport' });

    // Admin activity
    cy.visit('/admin/activity');
    cy.wait(500);
    cy.screenshot('visual-breadcrumbs-admin-activity', { capture: 'viewport' });

    // Settings
    cy.visit('/settings');
    cy.wait(500);
    cy.screenshot('visual-breadcrumbs-settings', { capture: 'viewport' });
  });
});