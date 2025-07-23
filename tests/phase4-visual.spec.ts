import { test, expect } from '@playwright/test';

test.describe('Phase 4 - Visual and Functional Tests', () => {
  test('Admin - Complete flow with screenshots', async ({ page }) => {
    // 1. Login as admin
    await page.goto('/login');
    await page.screenshot({ path: 'test-results/phase4/01-login-page.png', fullPage: true });
    
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // 2. Dashboard
    await page.waitForURL('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/phase4/02-admin-dashboard.png', fullPage: true });
    
    // Check navigation links (use .first() to handle multiple matches)
    await expect(page.locator('a[href="/dashboard"]').first()).toBeVisible();
    await expect(page.locator('a[href="/projects"]')).toBeVisible();
    await expect(page.locator('a[href="/organizations"]')).toBeVisible();
    await expect(page.locator('a[href="/admin"]')).toBeVisible();
    
    // 3. Organizations page
    await page.click('a[href="/organizations"]');
    await page.waitForURL('/organizations');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/phase4/03-organizations-page.png', fullPage: true });
    
    // Check organizations exist
    await expect(page.locator('text=Acme Agency')).toBeVisible();
    await expect(page.locator('text=TechCorp Solutions')).toBeVisible();
    await expect(page.locator('text=Global Retail Inc')).toBeVisible();
    
    // 4. Projects page - empty state
    await page.click('a[href="/projects"]');
    await page.waitForURL('/projects');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/phase4/04-projects-empty.png', fullPage: true });
    
    // Check empty state
    await expect(page.locator('h3:has-text("No projects yet")')).toBeVisible();
    await expect(page.locator('text=Create Project')).toBeVisible();
    
    // 5. Create project form
    await page.click('text=Create Project');
    await page.waitForURL('/projects/new');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/phase4/05-create-project-form.png', fullPage: true });
    
    // Check form elements
    await expect(page.locator('h1')).toHaveText('Create New Project');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('select[name="organizationId"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await expect(page.locator('input[name="startDate"]')).toBeVisible();
    await expect(page.locator('input[name="endDate"]')).toBeVisible();
    
    // Check organization dropdown has options
    const orgOptions = await page.locator('select[name="organizationId"] option').count();
    expect(orgOptions).toBeGreaterThan(1); // Should have placeholder + orgs
    
    // 6. Fill and submit form
    await page.fill('input[name="name"]', 'Test Project Alpha');
    await page.selectOption('select[name="organizationId"]', { index: 1 }); // Select first org
    await page.fill('textarea[name="description"]', 'This is a test project created by Playwright');
    await page.fill('input[name="startDate"]', '2025-01-01');
    await page.fill('input[name="endDate"]', '2025-12-31');
    
    await page.screenshot({ path: 'test-results/phase4/06-create-project-filled.png', fullPage: true });
    
    // Submit
    await page.click('button:has-text("Create Project")');
    
    // Should redirect to project detail or projects list
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/phase4/07-after-create-project.png', fullPage: true });
    
    // 7. User menu and logout
    await page.click('text=AU'); // Admin User avatar
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/phase4/08-user-menu.png', fullPage: true });
    
    // Check logout option exists
    await expect(page.locator('text=Sign Out')).toBeVisible();
  });

  test('Client - Limited access flow', async ({ page }) => {
    // 1. Login as client
    await page.goto('/login');
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'user123');
    await page.click('button[type="submit"]');
    
    // 2. Client dashboard
    await page.waitForURL('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/phase4/09-client-dashboard.png', fullPage: true });
    
    // Check navigation - should NOT see organizations or admin
    await expect(page.locator('a[href="/dashboard"]').first()).toBeVisible();
    await expect(page.locator('a[href="/projects"]')).toBeVisible();
    await expect(page.locator('a[href="/organizations"]')).not.toBeVisible();
    await expect(page.locator('a[href="/admin"]')).not.toBeVisible();
    
    // 3. Projects page - client view
    await page.click('a[href="/projects"]');
    await page.waitForURL('/projects');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/phase4/10-client-projects.png', fullPage: true });
    
    // Should NOT see Create Project button
    await expect(page.locator('text=Create Project')).not.toBeVisible();
    
    // 4. Try to access restricted pages
    await page.goto('/organizations');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/phase4/11-client-org-access.png', fullPage: true });
    
    await page.goto('/projects/new');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/phase4/12-client-new-project-access.png', fullPage: true });
    
    // Should be redirected or see error
    const url = page.url();
    expect(url).not.toContain('/projects/new');
  });

  test('Theme and responsive check', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Test theme toggle
    const themeButton = page.locator('button').filter({ has: page.locator('svg').first() }).nth(1);
    await themeButton.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/phase4/13-dark-theme.png', fullPage: true });
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'test-results/phase4/14-mobile-dashboard.png', fullPage: true });
    
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/phase4/15-mobile-projects.png', fullPage: true });
  });

  test('Error handling', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Try to create project without required fields
    await page.goto('/projects/new');
    await page.waitForLoadState('networkidle');
    
    // Submit empty form
    await page.click('button:has-text("Create Project")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/phase4/16-form-validation.png', fullPage: true });
    
    // Check for validation messages
    const nameInput = page.locator('input[name="name"]');
    const isRequired = await nameInput.evaluate(el => el.hasAttribute('required'));
    expect(isRequired).toBeTruthy();
  });
});