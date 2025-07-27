# Claude Development Guide

This document contains important information for Claude (or other AI assistants) when working on this codebase.

## Quick Context Understanding

When starting work on this codebase:
1. First read `/upgrade.md` to understand the project structure and current status
2. Check `package.json` for available scripts and dependencies
3. Look at `/features/` directory to understand the modular architecture
4. Review recent test files in `/cypress/e2e/` to understand working patterns

## Cypress Testing Protocol (Complete Guide)

### CRITICAL SETUP REQUIREMENTS

#### 1. Environment Prerequisites
**ALWAYS verify these before writing any tests:**

```bash
# 1. Check server is running on correct port
lsof -i :3000  # Should show Next.js dev server

# 2. Verify database is seeded
node scripts/seed-users.js     # Creates test users
node scripts/seed-features.js  # Creates feature flags

# 3. Confirm cypress.config.js baseUrl
# Must be: baseUrl: 'http://localhost:3000'

# 4. Kill any conflicting processes
pkill -f "next dev"
```

#### 2. Mandatory Test Credentials
**NEVER use different credentials - these are seeded in database:**
- Admin: `admin@example.com` / `admin123`
- Client: `user@example.com` / `user123`

### COMPONENT TESTING STANDARDS

#### Data-TestId Requirements
**EVERY interactive element MUST have data-testid:**

```tsx
// ✅ CORRECT - Always add data-testid
<Button data-testid="create-project-btn">Create Project</Button>
<Card data-testid="project-card">...</Card>
<div data-testid="feature-flags-manager">...</div>

// ❌ WRONG - No data-testid
<Button>Create Project</Button>
<Card>...</Card>
```

#### Naming Convention for data-testid
```tsx
// Format: [component-type]-[identifier]-[action?]
data-testid="project-card"           // List items
data-testid="create-task-btn"        // Action buttons  
data-testid="toggle-featureName"     // Toggle controls
data-testid="task-detail-form"       // Forms
data-testid="admin-dashboard"        // Page sections
```

### AUTHENTICATION TESTING PROTOCOL

#### Standard Login Pattern
```javascript
describe('Feature Tests', () => {
  beforeEach(() => {
    // ALWAYS start with login - no exceptions
    cy.visit('/login');
    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
  
  // Tests go here...
});
```

#### Role-Based Testing
```javascript
// Admin Tests
beforeEach(() => {
  loginAsAdmin();
});

// Client Tests  
beforeEach(() => {
  loginAsClient();
});

function loginAsAdmin() {
  cy.visit('/login');
  cy.get('#email').type('admin@example.com');
  cy.get('#password').type('admin123');
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
}

function loginAsClient() {
  cy.visit('/login');
  cy.get('#email').type('user@example.com');
  cy.get('#password').type('user123');
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
}
```

### CRITICAL ERROR PREVENTION

#### 1. Server/Client Import Separation
**NEVER import server-only code in client components:**

```tsx
// ✅ CORRECT - Separate constants file
// /lib/features/constants.ts
export const FEATURES = { CHAT: 'chat' };

// Client component imports from constants
import { FEATURES } from '@/lib/features/constants';

// ❌ WRONG - Client importing server code
import { FEATURES } from '@/lib/features/featureFlags'; // Has database imports!
```

#### 2. Environment Variable Issues
```javascript
// Common error: "DATABASE_URL environment variable is not set"
// Solution: Only import database code on server side
if (typeof window !== 'undefined') {
  throw new Error('Database client should only be used on server side');
}
```

#### 3. Component Import Conflicts
```tsx
// ✅ CORRECT - Check if function exists
export async function getExtendedStats() { ... }

// ❌ WRONG - Importing non-existent function
import { getExtendedStats } from './stats-grid'; // Function doesn't exist
```

### SELECTOR HIERARCHY (Use in Order)

#### 1. data-testid (Preferred)
```javascript
cy.get('[data-testid="feature-flags-manager"]')
cy.get('[data-testid="toggle-betaFeatures"]').click()
```

#### 2. Semantic HTML
```javascript
cy.get('h1').should('contain', 'Admin Dashboard')
cy.get('button[type="submit"]').click()
```

#### 3. Content-based (Last Resort)
```javascript
cy.contains('Create Project').click()
cy.contains('button', 'Add Feature').click()
```

### API TESTING INTEGRATION

#### Test API Endpoints Directly
```javascript
it('should handle feature flag API correctly', () => {
  // Test API directly for reliability
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
```

### WAIT STRATEGIES

#### Use Proper Waits
```javascript
// ✅ CORRECT - Wait for elements
cy.get('[data-testid="feature-flags-manager"]', { timeout: 10000 }).should('be.visible');

// ✅ CORRECT - Wait for state changes
cy.get('[data-testid="toggle-betaFeatures"]').click();
cy.wait(1000); // Allow server update
cy.contains('Enabled').should('be.visible');

// ❌ WRONG - No timeout
cy.get('[data-testid="feature-flags-manager"]').should('be.visible');
```

### DEBUGGING FAILED TESTS

#### 1. Check Screenshots First
```bash
# Screenshots saved on failure
ls cypress/screenshots/
```

#### 2. Verify Component Rendering
```javascript
// Add debug logging
cy.get('body').then($body => {
  cy.log('Page content:', $body.text());
});

// Check if element exists
cy.get('[data-testid="target"]').should('exist');
```

#### 3. Server-Side Errors
```bash
# Check server logs for errors
# Look for database connection issues
# Verify environment variables loaded
```

### COMMON PATTERNS BY FEATURE TYPE

#### Feature Flag Testing
```javascript
describe('Feature Flags', () => {
  beforeEach(() => {
    loginAsAdmin();
  });

  it('should display feature flags manager', () => {
    cy.visit('/admin');
    cy.get('[data-testid="feature-flags-manager"]', { timeout: 10000 }).should('be.visible');
  });

  it('should toggle feature flags', () => {
    cy.visit('/admin');
    cy.get('[data-testid="toggle-betaFeatures"]').click();
    cy.wait(1000);
    cy.contains('Enabled').should('be.visible');
  });
});
```

#### CRUD Testing
```javascript
describe('Project CRUD', () => {
  beforeEach(() => {
    loginAsAdmin();
  });

  it('should create project', () => {
    cy.visit('/projects');
    cy.get('[data-testid="create-project-btn"]').click();
    cy.get('#name').type('Test Project');
    cy.get('#description').type('Test Description');
    cy.get('button[type="submit"]').click();
    cy.contains('Test Project').should('be.visible');
  });
});
```

### RUNNING TESTS PROTOCOL

#### Mandatory Pre-Test Checklist
```bash
# 1. Kill existing processes
pkill -f "next dev"

# 2. Start fresh server
npm run dev

# 3. Wait for server ready (check port 3000)
curl -s http://localhost:3000 | head -c 100

# 4. Verify database seeded
node scripts/seed-users.js
node scripts/seed-features.js

# 5. Run tests
npx cypress run --spec "cypress/e2e/test-file.cy.js"
```

#### Test Execution Commands
```bash
# Single test file
npx cypress run --spec "cypress/e2e/phase10-3-feature-flags.cy.js"

# With reporter for better output
npx cypress run --spec "cypress/e2e/test.cy.js" --reporter spec

# Headed mode for debugging
npx cypress run --spec "cypress/e2e/test.cy.js" --headed

# Open interactive mode
npx cypress open
```

### QUALITY ASSURANCE CHECKLIST

#### Before Submitting Tests
**Every test MUST pass this checklist:**

1. ✅ Environment seeded (users + features)
2. ✅ Server running on port 3000
3. ✅ All interactive elements have data-testid
4. ✅ Authentication handled in beforeEach
5. ✅ Proper wait strategies used
6. ✅ API endpoints tested directly
7. ✅ Error scenarios covered
8. ✅ No hardcoded selectors (use data-testid)
9. ✅ Tests pass 3 times in a row
10. ✅ No server/client import conflicts

#### Test File Structure Template
```javascript
describe('Phase X.Y: Feature Name', () => {
  beforeEach(() => {
    // Always authenticate first
    cy.visit('/login');
    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  describe('Core Functionality', () => {
    it('should display feature UI correctly', () => {
      cy.visit('/feature-page');
      cy.get('[data-testid="main-component"]', { timeout: 10000 })
        .should('be.visible');
    });

    it('should handle user interactions', () => {
      cy.visit('/feature-page');
      cy.get('[data-testid="action-button"]').click();
      cy.wait(1000);
      cy.get('[data-testid="result"]').should('be.visible');
    });
  });

  describe('API Integration', () => {
    it('should handle API endpoints correctly', () => {
      cy.request('GET', '/api/feature/check').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('data');
      });
    });
  });

  describe('Error Scenarios', () => {
    it('should handle errors gracefully', () => {
      cy.intercept('GET', '/api/feature/*', { statusCode: 500 }).as('apiError');
      cy.visit('/feature-page');
      cy.wait('@apiError');
      cy.contains('Error').should('be.visible');
    });
  });
});
```

### MANDATORY CLEANUP PROTOCOL

#### After Each Test Session
```bash
# 1. Reset feature flags to defaults
node scripts/seed-features.js

# 2. Clean up test data
# (Add cleanup scripts as needed)

# 3. Stop dev server
pkill -f "next dev"
```

## File Management Testing

When testing file uploads:
1. Ensure the `files` table exists in the database
2. Check that `/public/uploads` directory is writable
3. Use Cypress file fixtures for test uploads
4. Remember to test both empty states and populated states

## Database Migrations

When adding new features that require database changes:
1. Create migration file in `/migrations/` directory
2. Use sequential numbering (e.g., `003_add_files_table.sql`)
3. Apply migrations with psql:
   ```bash
   psql $DATABASE_URL -f migrations/xxx_migration_name.sql
   ```

## Common Commands

```bash
# Check build errors
npm run build

# Type checking
npm run typecheck

# Lint checking
npm run lint

# Database operations
npm run db:generate  # Generate Drizzle migrations
npm run db:push     # Push schema to database
```

## Architecture Notes

- Using Next.js 14 App Router
- Authentication: NextAuth v5
- Database: PostgreSQL with Drizzle ORM
- UI Components: Custom components in `@chat/ui`
- File Storage: Local storage in `/public/uploads`
- Testing: Cypress for E2E tests

## Current Test Users in Database

The database is seeded with test users that have proper role assignments:
- Admin users can access all features
- Client users have restricted access
- Team members have intermediate access

Always verify role-based access in tests.

## Critical Workflow Tips

### When Making Changes

1. **Always run tests first**: Before making any changes, ensure existing tests pass
2. **Check for route conflicts**: Use `find` to check for existing dynamic routes before creating new ones
3. **Verify database state**: Check if tables exist before assuming they do
4. **Use TodoWrite**: Track your progress with todos, especially for multi-step tasks

### Efficient Debugging Process

1. **Server errors (500)**: Always check `/tmp/next-dev.log` or server console first
2. **Route not found (404)**: Check for route conflicts in app directory structure
3. **API failures**: Look at Network tab and server logs together
4. **Test failures**: Check screenshots first, then look at the specific error

### Common Gotchas

1. **Import paths**: Always use `@/` for app imports, `@chat/` for package imports
2. **Client/Server separation**: Don't import server-only code (fs, database) in client components
3. **Auth in API routes**: Use `auth()` from auth.config, not `getServerSession`
4. **File paths**: Always use absolute paths in server code, never relative
5. **Event handlers**: Use `e.stopPropagation()` on nested interactive elements

### Code Generation Best Practices

1. **Follow existing patterns**: Check similar files in the same directory first
2. **Use TypeScript strictly**: This project has strict mode enabled
3. **Add data-testid**: Always add these for Cypress testing
4. **Export types**: Put shared types in `@chat/shared-types`
5. **Modular structure**: Keep features self-contained in `/features/` directory

### Next.js App Router Specifics

1. **Layout groups**: `(auth)` and `(protected)` don't create URL segments
2. **Loading states**: Use `loading.tsx` for better UX
3. **Error boundaries**: Use `error.tsx` for error handling
4. **Server Components**: Default in app directory, use 'use client' directive when needed
5. **Metadata**: Export metadata object for SEO

### Database Workflow

```bash
# When you encounter "relation does not exist" error:
1. Check what tables exist:
   psql $DATABASE_URL -c "\dt"

2. Create missing migration:
   echo "CREATE TABLE ..." > migrations/00X_description.sql

3. Run migration:
   psql $DATABASE_URL -f migrations/00X_description.sql

4. Restart dev server to clear connection pool
```

### File Upload Debugging

1. **Check directory exists**: `mkdir -p public/uploads`
2. **Verify permissions**: File system must be writable
3. **Check file size limits**: Default is 10MB in client-utils.ts
4. **MIME type validation**: Ensure file type is allowed

### Authentication Flow

1. **Login**: `/api/auth/callback/credentials` → session cookie → redirect
2. **Protected routes**: middleware.ts checks session → redirect if not authenticated
3. **Role checks**: Use `session.user.role` in components and API routes
4. **Logout**: Clear NextAuth session with `/api/auth/signout`

### Testing Workflow That Actually Works

```bash
# 1. Kill any existing servers
pkill -f "next dev"

# 2. Start fresh server in background
cd /path/to/project && npm run dev > /tmp/next-dev-fresh.log 2>&1 &

# 3. Wait for it to fully start (check the port!)
sleep 5

# 4. Verify server is running
curl -s http://localhost:3000 > /dev/null && echo "Server running on 3000"

# 5. Run specific test
npx cypress run --spec "cypress/e2e/your-test.cy.js"

# 6. If test fails, check:
#    - Screenshot in cypress/screenshots/
#    - Server logs: tail -50 /tmp/next-dev-fresh.log
#    - Correct port in cypress.config.js
```

### Cypress Login Pattern That Works (UI Modernization)

When writing Cypress tests that require authentication, use this pattern:

```javascript
beforeEach(() => {
  cy.viewport(1280, 720);
  cy.visit('/login');
  cy.get('input[type="email"]').type('admin@example.com');
  cy.get('input[type="password"]').type('admin123');
  cy.get('button[type="submit"]').click();
  // Wait for redirect to dashboard
  cy.url().should('include', '/dashboard');
  cy.contains('Dashboard').should('be.visible');
});
```

**Important notes:**
- Use `input[type="email"]` and `input[type="password"]` selectors (not `#email` or `#password`)
- Always wait for the dashboard redirect with `cy.url().should('include', '/dashboard')`
- Add `cy.contains('Dashboard').should('be.visible')` to ensure page loaded
- Set viewport for consistent testing
- This pattern works better than the `#email` selector pattern shown earlier in this doc

### Performance Considerations

1. **Use dynamic imports**: For large components not needed immediately
2. **Image optimization**: Use Next.js Image component
3. **Database queries**: Use proper indexes (already set up in migrations)
4. **Client-side state**: Minimize to reduce re-renders

### Security Notes

1. **Environment variables**: Never commit `.env.local`
2. **API routes**: Always validate input and check authentication
3. **File uploads**: Validate MIME types and sizes
4. **SQL injection**: Drizzle ORM prevents this, but be careful with raw SQL
5. **CORS**: Configured in Next.js config if needed

### Useful Debugging Commands

```bash
# See what's running on ports
lsof -i :3000

# Check TypeScript errors
npm run typecheck

# See all routes in app directory
find app -name "page.tsx" -o -name "route.ts" | sort

# Check database connection
psql $DATABASE_URL -c "SELECT current_database()"

# Clear Next.js cache
rm -rf .next

# See recent git changes
git log --oneline -10
```

### When Things Go Wrong

1. **"Module not found"**: Run `npm install` and check import paths
2. **"Hydration mismatch"**: Check for client-only code in server components
3. **"Invalid hook call"**: Ensure hooks are only in client components
4. **Build failures**: Run `npm run typecheck` first to see all errors
5. **Mysterious 500 errors**: Check for missing await keywords

### Remember

- This is a production-grade codebase - maintain high quality
- Always test your changes with Cypress
- Follow the existing patterns and conventions
- When in doubt, check how similar features are implemented
- Use the upgrade.md as your guide for phased implementation