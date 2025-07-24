# Claude Development Guide

This document contains important information for Claude (or other AI assistants) when working on this codebase.

## Quick Context Understanding

When starting work on this codebase:
1. First read `/upgrade.md` to understand the project structure and current status
2. Check `package.json` for available scripts and dependencies
3. Look at `/features/` directory to understand the modular architecture
4. Review recent test files in `/cypress/e2e/` to understand working patterns

## Cypress Testing Guidelines

### Test Credentials
Always use these credentials for Cypress tests:
- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`

### Common Issues and Solutions

#### 1. Server Port Conflicts
- Development server typically runs on port 3000
- If port 3000 is busy, it may use 3001
- Always check which port the server is running on
- Update `cypress.config.js` baseUrl accordingly

#### 2. Route Conflicts
- Next.js requires consistent parameter names across dynamic routes
- If you have `/users/[id]` in one layout group, ALL user routes must use `[id]`
- Common error: "You cannot use different slug names for the same dynamic path"
- Solution: Rename parameters to match existing routes

#### 3. Database Table Missing
- If API returns 500 errors, check server logs for database errors
- Common issue: "relation does not exist" means table is missing
- Solution: Create and run migration files
- Database connection available in `.env.local`

#### 4. Test Selectors
- Always add `data-testid` attributes to components for reliable testing
- Use semantic selectors when possible (e.g., `h1` for page titles)
- Check actual rendered HTML if tests can't find elements

#### 5. Authentication in Tests
- Always clear cookies/session before auth tests
- Use `cy.clearCookies()` for logout simulation
- Wait for redirects after login with `cy.url().should('include', '/dashboard')`

### Writing Robust Tests

```javascript
// Good test structure
describe('Feature Name', () => {
  beforeEach(() => {
    // Login first
    cy.visit('/login');
    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should do something specific', () => {
    // Navigate to feature
    cy.visit('/feature-page');
    
    // Wait for page load
    cy.get('h1').should('contain', 'Expected Title');
    
    // Interact with elements
    cy.get('[data-testid="specific-element"]').click();
    
    // Assert results
    cy.get('[data-testid="result"]').should('be.visible');
  });
});
```

### Debugging Failed Tests

1. **Check Screenshots**: Cypress saves screenshots on failure
2. **Add Logging**: Use `cy.log()` to debug test flow
3. **Check Network**: Use `cy.intercept()` to monitor API calls
4. **Verify Selectors**: Use browser DevTools to check element selectors
5. **Check Server Logs**: Tail the Next.js dev server output for errors

### Running Tests

```bash
# Start dev server first
npm run dev

# Run all Cypress tests
npx cypress run

# Run specific test file
npx cypress run --spec "cypress/e2e/specific-test.cy.js"

# Open Cypress UI for debugging
npx cypress open
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

# 2. Start fresh server
npm run dev

# 3. Wait for it to fully start (check the port!)
sleep 5

# 4. Run specific test
npx cypress run --spec "cypress/e2e/your-test.cy.js"

# 5. If test fails, check:
#    - Screenshot in cypress/screenshots/
#    - Server logs
#    - Correct port in cypress.config.js
```

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