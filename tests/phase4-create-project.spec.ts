import { test, expect } from '@playwright/test';

test('Create project flow', async ({ page }) => {
  // Login as admin
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
  
  // Go to projects
  await page.click('a[href="/projects"]');
  await page.waitForURL('/projects');
  await page.waitForLoadState('networkidle');
  
  // Screenshot empty projects
  await page.screenshot({ path: 'test-results/phase4/projects-empty-state.png', fullPage: true });
  
  // Click create project
  await page.click('text=Create Project');
  await page.waitForURL('/projects/new');
  await page.waitForLoadState('networkidle');
  
  // Screenshot empty form
  await page.screenshot({ path: 'test-results/phase4/create-project-empty.png', fullPage: true });
  
  // Fill form
  await page.fill('input[name="name"]', 'Website Redesign Project');
  
  // Select organization
  await page.waitForTimeout(1000); // Give time for options to load
  const orgOptions = await page.$$eval('select[name="organizationId"] option', options => 
    options.map(opt => ({ value: (opt as HTMLOptionElement).value, text: opt.textContent }))
  );
  console.log('Available organizations:', orgOptions);
  
  // Select TechCorp Solutions (client org)
  await page.selectOption('select[name="organizationId"]', { label: 'TechCorp Solutions' });
  
  await page.fill('textarea[name="description"]', 'Complete redesign of the TechCorp website including new branding, improved UX, and mobile optimization.');
  await page.fill('input[name="startDate"]', '2025-02-01');
  await page.fill('input[name="endDate"]', '2025-06-30');
  
  // Screenshot filled form
  await page.screenshot({ path: 'test-results/phase4/create-project-filled.png', fullPage: true });
  
  // Submit
  await page.click('button:has-text("Create Project")');
  
  // Wait for redirect or response
  await page.waitForTimeout(3000);
  
  // Screenshot result
  await page.screenshot({ path: 'test-results/phase4/after-project-creation.png', fullPage: true });
  
  // If we're back on projects page, check for the new project
  if (page.url().includes('/projects') && !page.url().includes('/new')) {
    await expect(page.locator('text=Website Redesign Project')).toBeVisible({ timeout: 10000 });
  }
});