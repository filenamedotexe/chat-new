import { test, expect } from '@playwright/test';

test('Organizations page works', async ({ page }) => {
  // Login as admin
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
  
  // Navigate to organizations
  await page.click('a[href="/organizations"]');
  await page.waitForURL('/organizations');
  await page.waitForLoadState('networkidle');
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/phase4/organizations-fixed.png', fullPage: true });
  
  // Check content
  await expect(page.locator('h1')).toHaveText('Organizations');
  
  // Check for organizations or empty state
  const hasOrgs = await page.locator('text=Acme Agency').count() > 0;
  const hasEmptyState = await page.locator('text=No organizations yet').count() > 0;
  
  expect(hasOrgs || hasEmptyState).toBeTruthy();
});