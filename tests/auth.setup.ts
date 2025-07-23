import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate as admin', async ({ page }) => {
  // Go to login page
  await page.goto('http://localhost:3001/login');
  
  // Perform login
  await page.locator('input[type="email"]').fill('admin@example.com');
  await page.locator('input[type="password"]').fill('admin123');
  await page.locator('button[type="submit"]').click();
  
  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard');
  
  // Verify we're logged in
  await expect(page.locator('text=Dashboard')).toBeVisible();
  
  // Save authenticated state
  await page.context().storageState({ path: authFile });
  
  console.log('✓ Authentication state saved');
});