# Testing Guide

## Overview

This project uses Cypress for end-to-end testing. All major features have comprehensive test coverage.

## Quick Start

```bash
# 1. Start the development server
npm run dev

# 2. In another terminal, run tests
npm run test:e2e

# 3. Or open Cypress UI for debugging
npm run test:e2e:open
```

## Test Organization

Tests are organized by feature phase:

- `phase1-2-auth.cy.js` - Authentication and user management
- `phase3-ui-layout.cy.js` - UI components and layouts
- `phase4-organizations-projects.cy.js` - Organization and project CRUD
- `phase5-tasks.cy.js` - Task management and Kanban board
- `phase6-file-management-simple.cy.js` - File upload and management

## Running Specific Tests

```bash
# Run auth tests only
npm run cypress:phase1-2

# Run file management tests
npm run cypress:phase6

# Run all tests
npm run test:e2e
```

## Test Data

### Test Users
- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`

These users are created by the seed migration and have proper role assignments.

## Common Test Patterns

### Authentication Setup
```javascript
beforeEach(() => {
  cy.visit('/login');
  cy.get('#email').type('admin@example.com');
  cy.get('#password').type('admin123');
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});
```

### Testing File Uploads
```javascript
cy.get('[data-testid="file-dropzone"]').selectFile({
  contents: Cypress.Buffer.from('file content'),
  fileName: 'test.pdf',
  mimeType: 'application/pdf'
}, { action: 'drag-drop' });
```

### Waiting for API Calls
```javascript
cy.intercept('GET', '/api/users/*/files*').as('getUserFiles');
cy.visit('/users/123/files');
cy.wait('@getUserFiles');
```

## Debugging Failed Tests

1. **Screenshots**: Check `cypress/screenshots/` for failure screenshots
2. **Videos**: Check `cypress/videos/` for test recordings
3. **Console Logs**: Add `cy.log()` statements for debugging
4. **Network Tab**: Use `cy.intercept()` to monitor API calls

## Best Practices

1. **Use data-testid**: Add `data-testid` attributes to components
2. **Wait for elements**: Use `.should('be.visible')` instead of hard waits
3. **Clear state**: Use `beforeEach` to ensure clean test state
4. **Test user flows**: Test complete user journeys, not just individual features

## Troubleshooting

### Port Conflicts
If tests fail with connection errors:
1. Check which port the dev server is using
2. Update `cypress.config.js` baseUrl if needed

### Database Issues
If API calls return 500 errors:
1. Check server logs for database errors
2. Ensure all migrations have been run
3. Verify database connection in `.env.local`

### Authentication Failures
If login tests fail:
1. Clear browser cookies with `cy.clearCookies()`
2. Verify test user credentials exist in database
3. Check for session/cookie issues

## Adding New Tests

1. Create test file in `cypress/e2e/`
2. Follow naming convention: `feature-name.cy.js`
3. Include authentication setup if needed
4. Add data-testid attributes to new components
5. Run tests locally before committing

## CI/CD Integration

Tests can be run in CI pipelines:

```yaml
# Example GitHub Actions
- name: Run Cypress tests
  run: |
    npm run build
    npm start &
    npx wait-on http://localhost:3000
    npm run test:e2e
```