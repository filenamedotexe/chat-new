import { test, expect } from '@playwright/test';

test.describe('Projects', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should navigate to projects page', async ({ page }) => {
    // Click projects link
    await page.click('a[href="/projects"]');
    await expect(page).toHaveURL('/projects');
    
    // Check page title
    await expect(page.locator('h1')).toHaveText('Projects');
    
    // Check create button exists for admin
    await expect(page.locator('text=Create Project')).toBeVisible();
  });

  test('should show empty state', async ({ page }) => {
    await page.goto('/projects');
    
    // Should show empty state message
    await expect(page.locator('h3:has-text("No projects yet")')).toBeVisible();
    await expect(page.locator('text=Create your first project')).toBeVisible();
  });

  test('should navigate to create project form', async ({ page }) => {
    await page.goto('/projects');
    
    // Click create project button
    await page.click('text=Create Project');
    await expect(page).toHaveURL('/projects/new');
    
    // Check form elements
    await expect(page.locator('h1')).toHaveText('Create New Project');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('select[name="organizationId"]')).toBeVisible();
  });

  test('organizations link should be visible for admin', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check organizations link exists
    const orgLink = page.locator('a[href="/organizations"]');
    await expect(orgLink).toBeVisible();
    await expect(orgLink).toHaveText('Organizations');
  });
});

test.describe('Client Access', () => {
  test('client should see projects but not organizations', async ({ page }) => {
    // Login as client
    await page.goto('/login');
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'user123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Should see projects link
    await expect(page.locator('a[href="/projects"]')).toBeVisible();
    
    // Should NOT see organizations link
    await expect(page.locator('a[href="/organizations"]')).not.toBeVisible();
    
    // Navigate to projects
    await page.click('a[href="/projects"]');
    await expect(page).toHaveURL('/projects');
    
    // Should NOT see create project button
    await expect(page.locator('text=Create Project')).not.toBeVisible();
  });
});