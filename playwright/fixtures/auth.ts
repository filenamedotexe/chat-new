import { test as base, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

export type UserRole = 'admin' | 'team_member' | 'client';

interface AuthFixtures {
  authenticatedPage: any;
  userRole: UserRole;
}

// Define test users
const TEST_USERS = {
  admin: {
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin' as UserRole,
  },
  team_member: {
    email: 'team@test.com', 
    password: 'password123',
    role: 'team_member' as UserRole,
  },
  client: {
    email: 'client@test.com',
    password: 'password123',
    role: 'client' as UserRole,
  },
};

// Extend base test with auth fixtures
export const test = base.extend<AuthFixtures>({
  userRole: ['admin', { option: true }],
  
  authenticatedPage: async ({ page, userRole }, use) => {
    // Path to store auth state
    const authFile = path.join(__dirname, `../.auth/${userRole}.json`);
    
    // Check if auth state exists
    if (fs.existsSync(authFile)) {
      // Load existing auth state
      await page.context().storageState({ path: authFile });
    } else {
      // Perform login
      await login(page, userRole);
      
      // Save auth state for reuse
      const authDir = path.dirname(authFile);
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }
      await page.context().storageState({ path: authFile });
    }
    
    // Verify we're authenticated
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    
    await use(page);
  },
});

async function login(page: any, role: UserRole) {
  const user = TEST_USERS[role];
  
  await page.goto('/login');
  
  // Wait for login form
  await page.waitForSelector('[data-testid="login-form"]', { timeout: 10000 });
  
  // Fill login form
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard', { timeout: 15000 });
  
  // Wait for user menu to ensure auth is complete
  await page.waitForSelector('[data-testid="user-menu"]', { timeout: 10000 });
}

// Helper to clear auth states
export async function clearAuthStates() {
  const authDir = path.join(__dirname, '../.auth');
  if (fs.existsSync(authDir)) {
    fs.rmSync(authDir, { recursive: true, force: true });
  }
}

export { expect };