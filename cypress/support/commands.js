// Custom commands for authentication and common tasks

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('logout', () => {
  cy.get('button[aria-label="User menu"]').click();
  cy.contains('Sign out').click();
  cy.url().should('include', '/login');
});

Cypress.Commands.add('createProject', (name, description) => {
  cy.visit('/projects');
  cy.contains('New Project').click();
  cy.get('input[name="name"]').type(name);
  cy.get('select[name="organizationId"]').select(1);
  cy.get('textarea[name="description"]').type(description);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/projects');
});

Cypress.Commands.add('createTask', (column, title, description, dueDate) => {
  // Find the column and click add button
  cy.contains('h3', column).parent().find('button').first().click();
  
  // Fill task form
  cy.get('input[name="title"]').type(title);
  if (description) {
    cy.get('textarea[name="description"]').type(description);
  }
  if (dueDate) {
    cy.get('input[name="dueDate"]').type(dueDate);
  }
  
  cy.contains('button', 'Create Task').click();
  cy.wait(1000); // Wait for task to be created
});