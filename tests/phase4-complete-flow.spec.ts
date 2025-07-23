import { test, expect } from '@playwright/test';

test('Complete Phase 4 flow - Organizations and Projects', async ({ page }) => {
  // 1. Login as admin
  console.log('1. Logging in as admin...');
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
  await page.screenshot({ path: 'test-results/phase4/flow-01-dashboard.png', fullPage: true });

  // 2. View Organizations
  console.log('2. Viewing organizations...');
  await page.click('a[href="/organizations"]');
  await page.waitForURL('/organizations');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/phase4/flow-02-organizations.png', fullPage: true });
  
  // Verify organizations are visible
  await expect(page.locator('text=Acme Agency')).toBeVisible();
  await expect(page.locator('text=TechCorp Solutions')).toBeVisible();
  await expect(page.locator('text=Global Retail Inc')).toBeVisible();

  // 3. Go to Projects (empty state)
  console.log('3. Viewing projects (empty)...');
  await page.click('a[href="/projects"]');
  await page.waitForURL('/projects');
  await page.waitForLoadState('networkidle');
  
  // Check if empty or has projects
  const hasProjects = await page.locator('h3:has-text("No projects yet")').isVisible().catch(() => false);
  await page.screenshot({ path: 'test-results/phase4/flow-03-projects-initial.png', fullPage: true });

  // 4. Create a project
  console.log('4. Creating a project...');
  await page.click('text=Create Project');
  await page.waitForURL('/projects/new');
  await page.waitForLoadState('networkidle');
  
  // Fill form
  await page.fill('input[name="name"]', 'E-Commerce Platform Development');
  await page.waitForTimeout(500);
  await page.selectOption('select[name="organizationId"]', { label: 'Global Retail Inc' });
  await page.fill('textarea[name="description"]', 'Build a modern e-commerce platform with inventory management, payment processing, and customer analytics.');
  await page.fill('input[name="startDate"]', '2025-03-01');
  await page.fill('input[name="endDate"]', '2025-12-31');
  
  await page.screenshot({ path: 'test-results/phase4/flow-04-create-project-form.png', fullPage: true });
  
  // Submit
  await page.click('button:has-text("Create Project")');
  
  // 5. View projects list with new project
  console.log('5. Viewing projects list after creation...');
  await page.waitForURL('/projects', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Give time for any redirects
  
  await page.screenshot({ path: 'test-results/phase4/flow-05-projects-with-data.png', fullPage: true });
  
  // Verify project was created
  await expect(page.locator('text=E-Commerce Platform Development')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('text=Global Retail Inc')).toBeVisible();
  
  // 6. Test theme toggle
  console.log('6. Testing theme toggle...');
  await page.click('button[title*="theme"], button[aria-label*="theme"], button:has(svg.lucide-sun), button:has(svg.lucide-moon)').catch(() => {
    // Try the palette icon in navigation
    return page.click('button:has(svg[class*="tabler-icon-palette"])');
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/phase4/flow-06-theme-changed.png', fullPage: true });
  
  // 7. Logout and login as client
  console.log('7. Logging out and logging in as client...');
  await page.click('text=AU'); // Admin User avatar
  await page.waitForTimeout(500);
  await page.click('text=Sign Out');
  await page.waitForURL('/login');
  
  await page.fill('input[type="email"]', 'user@example.com');
  await page.fill('input[type="password"]', 'user123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
  
  // 8. Client view - verify limited access
  console.log('8. Verifying client access...');
  await page.screenshot({ path: 'test-results/phase4/flow-07-client-dashboard.png', fullPage: true });
  
  // Should NOT see Organizations link
  await expect(page.locator('a[href="/organizations"]')).not.toBeVisible();
  
  // Should see Projects but no create button
  await page.click('a[href="/projects"]');
  await page.waitForURL('/projects');
  await page.screenshot({ path: 'test-results/phase4/flow-08-client-projects.png', fullPage: true });
  
  await expect(page.locator('text=Create Project')).not.toBeVisible();
  
  console.log('✅ Phase 4 complete flow test finished!');
});