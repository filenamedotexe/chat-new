import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('admin should see admin dashboard', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Check for admin-specific content
    await expect(page.locator('h1, h2').filter({ hasText: /Admin Dashboard|Welcome.*Admin/i })).toBeVisible();
    
    // Check navigation links (use first() to handle multiple matches)
    await expect(page.locator('a[href="/dashboard"]').first()).toBeVisible();
    await expect(page.locator('a[href="/admin"]').first()).toBeVisible();
  });

  test('client should see client dashboard', async ({ page }) => {
    // Login as client
    await page.goto('/login');
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'user123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Check for client-specific content
    await expect(page.locator('h1, h2').filter({ hasText: /Client Dashboard|Welcome/i })).toBeVisible();
    
    // Client should NOT see admin link
    await expect(page.locator('a[href="/admin"]')).not.toBeVisible();
  });

  test('navigation works correctly', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Click on Admin link
    await page.click('a[href="/admin"]');
    await expect(page).toHaveURL('/admin');
    
    // Navigate back to dashboard
    await page.click('a[href="/dashboard"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('theme toggle works', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Get initial theme
    const htmlElement = page.locator('html');
    const initialTheme = await htmlElement.getAttribute('class');
    
    // Look for theme toggle button (might be an icon)
    const themeToggle = page.locator('button[aria-label*="theme"], button[title*="theme"], button:has(svg[class*="sun"]), button:has(svg[class*="moon"])').first();
    
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      
      // Wait for theme change
      await page.waitForTimeout(500);
      
      // Check if theme changed
      const newTheme = await htmlElement.getAttribute('class');
      expect(newTheme).not.toBe(initialTheme);
    }
  });
});