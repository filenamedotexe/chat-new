# Playwright Testing Guide

This document contains comprehensive information for writing and running Playwright E2E tests for the Agency Client Platform.

## Quick Start

```bash
# Install Playwright (first time only)
npx playwright install

# Run all tests
npm run test

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run specific test file
npx playwright test tests/auth.spec.ts
```

## Test Structure

```
tests/
├── auth.setup.ts          # Authentication setup
├── auth.spec.ts           # Auth flow tests
├── dashboard.spec.ts      # Dashboard tests
├── projects.spec.ts       # Project management tests
└── *.spec.ts             # Other test files
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/some-page');
    
    // Interact with elements
    await page.fill('input[type="email"]', 'user@test.com');
    await page.click('button[type="submit"]');
    
    // Assert expectations
    await expect(page).toHaveURL('/expected-url');
    await expect(page.locator('h1')).toContainText('Expected Text');
  });
});
```

### Authentication Pattern

```typescript
test.beforeEach(async ({ page }) => {
  // Login before each test
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@test.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

### Test Users

For development and testing:
- **Admin**: admin@test.com / password123
- **Team Member**: team@test.com / password123
- **Client**: client@test.com / password123

## Best Practices

### 1. Use Data-TestId Attributes

Always add `data-testid` to interactive elements:

```tsx
// In your component
<Button data-testid="create-project-btn">Create Project</Button>

// In your test
await page.click('[data-testid="create-project-btn"]');
```

### 2. Wait for Elements Properly

```typescript
// Good - waits for element
await page.waitForSelector('[data-testid="project-list"]');

// Better - with timeout
await page.waitForSelector('[data-testid="project-list"]', { 
  timeout: 10000 
});

// Best - use expect with auto-waiting
await expect(page.locator('[data-testid="project-list"]')).toBeVisible();
```

### 3. Use Page Object Model (Optional)

For complex pages, create page objects:

```typescript
// pages/dashboard.page.ts
export class DashboardPage {
  constructor(private page: Page) {}
  
  async navigateTo() {
    await this.page.goto('/dashboard');
  }
  
  async getWelcomeMessage() {
    return this.page.locator('h1').textContent();
  }
}
```

### 4. Handle Async Operations

```typescript
// Wait for API calls
await page.waitForResponse(response => 
  response.url().includes('/api/projects') && response.status() === 200
);

// Wait for navigation
await page.waitForURL('/dashboard');

// Wait for element state
await page.waitForSelector('.loading', { state: 'hidden' });
```

## Common Test Scenarios

### Testing CRUD Operations

```typescript
test('should create a new project', async ({ page }) => {
  await page.goto('/projects');
  await page.click('[data-testid="create-project-btn"]');
  
  // Fill form
  await page.fill('#name', 'Test Project');
  await page.fill('#description', 'Test Description');
  await page.selectOption('#organizationId', 'org-123');
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Verify
  await expect(page).toHaveURL(/\/projects\/[a-z0-9-]+/);
  await expect(page.locator('h1')).toContainText('Test Project');
});
```

### Testing File Uploads

```typescript
test('should upload a file', async ({ page }) => {
  await page.goto('/files');
  
  // Upload file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('path/to/test-file.pdf');
  
  // Wait for upload
  await expect(page.locator('[data-testid="file-list"]')).toContainText('test-file.pdf');
});
```

### Testing Real-time Features

```typescript
test('should receive real-time updates', async ({ page, context }) => {
  // Open two pages
  const page2 = await context.newPage();
  
  // Login on both
  await loginAs(page, 'admin@test.com');
  await loginAs(page2, 'team@test.com');
  
  // Send message from page1
  await page.goto('/conversations/123');
  await page.fill('[data-testid="message-input"]', 'Hello');
  await page.click('[data-testid="send-btn"]');
  
  // Verify on page2
  await page2.goto('/conversations/123');
  await expect(page2.locator('[data-testid="message-list"]')).toContainText('Hello');
});
```

## Debugging Tests

### Visual Debugging

```bash
# Run with UI mode
npm run test:ui

# Run in headed mode
npm run test:headed

# Debug specific test
npx playwright test tests/auth.spec.ts --debug
```

### Screenshots and Videos

Tests automatically capture screenshots and videos on failure. Find them in:
- `test-results/` - Test artifacts
- `playwright-report/` - HTML report

### Trace Viewer

```bash
# Run with trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

## Environment Setup

### Local Development

1. Ensure development server is running on port 3000
2. Ensure test users exist in Supabase
3. Run tests

### CI Environment

The playwright.config.ts handles CI-specific settings:
- Retries: 2 attempts on failure
- Single worker to avoid conflicts
- Automatic server startup

## Common Issues and Solutions

### 1. Authentication Failures

**Problem**: Login fails with "Invalid credentials"
**Solution**: Ensure test users exist in Supabase with correct passwords

### 2. Timeout Errors

**Problem**: Tests timeout waiting for elements
**Solution**: 
- Increase timeout: `{ timeout: 30000 }`
- Check if dev server is running
- Verify element selectors

### 3. Flaky Tests

**Problem**: Tests pass/fail inconsistently
**Solution**:
- Add proper waits
- Use `waitForLoadState('networkidle')`
- Avoid hardcoded delays

### 4. Database State

**Problem**: Tests fail due to existing data
**Solution**:
- Clean up after tests
- Use unique names/IDs
- Consider test isolation

## Test Organization

### By Feature

```
tests/
├── auth/
│   ├── login.spec.ts
│   ├── register.spec.ts
│   └── logout.spec.ts
├── projects/
│   ├── create.spec.ts
│   ├── update.spec.ts
│   └── delete.spec.ts
└── support-chat/
    ├── client-widget.spec.ts
    └── admin-dashboard.spec.ts
```

### By User Role

```
tests/
├── admin/
│   └── admin-features.spec.ts
├── team-member/
│   └── team-features.spec.ts
└── client/
    └── client-features.spec.ts
```

## Performance Testing

```typescript
test('should load dashboard quickly', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000); // 3 seconds
});
```

## Accessibility Testing

```typescript
test('should be accessible', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Check for accessibility issues
  const accessibilitySnapshot = await page.accessibility.snapshot();
  expect(accessibilitySnapshot).toBeTruthy();
  
  // Check specific ARIA attributes
  await expect(page.locator('nav')).toHaveAttribute('aria-label', 'Main navigation');
});
```

## Mobile Testing

```typescript
test.describe('Mobile', () => {
  test.use({ 
    viewport: { width: 375, height: 667 },
    isMobile: true 
  });
  
  test('should show mobile menu', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="mobile-menu-btn"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });
});
```

## API Testing

```typescript
test('should handle API errors gracefully', async ({ page }) => {
  // Intercept API call
  await page.route('/api/projects', route => {
    route.fulfill({ status: 500, body: 'Server Error' });
  });
  
  await page.goto('/projects');
  await expect(page.locator('.error-message')).toContainText('Failed to load projects');
});
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install
      - run: npm run test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Tips for Success

1. **Keep tests independent**: Each test should be able to run in isolation
2. **Use meaningful test names**: Describe what the test does
3. **Avoid hardcoded values**: Use environment variables or test data
4. **Clean up after tests**: Delete created data when possible
5. **Test happy paths first**: Then edge cases and error scenarios
6. **Use fixtures**: For common setup like authentication
7. **Parallelize carefully**: Some tests may conflict if run simultaneously
8. **Monitor test duration**: Keep individual tests under 30 seconds

## Useful Commands

```bash
# Install specific browser
npx playwright install chromium

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests matching pattern
npx playwright test -g "login"

# Generate test code
npx playwright codegen http://localhost:3000

# Update snapshots
npx playwright test --update-snapshots

# Run specific test file
npx playwright test tests/auth.spec.ts

# Run with specific reporter
npx playwright test --reporter=list
```