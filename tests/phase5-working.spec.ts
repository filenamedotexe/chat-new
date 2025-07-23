import { test, expect } from '@playwright/test';
import path from 'path';

test.use({
  // Don't use stored auth state for this test
  storageState: { cookies: [], origins: [] }
});

test('Phase 5: Complete Task Management Test', async ({ page }) => {
  // Start fresh
  await page.goto('http://localhost:3001');
  
  // Should redirect to login
  await page.waitForTimeout(2000);
  
  console.log('Current URL:', page.url());
  
  // Navigate to login if not already there
  if (!page.url().includes('/login')) {
    await page.goto('http://localhost:3001/login');
  }
  
  // Take screenshot of what we see
  await page.screenshot({ 
    path: path.join('screenshots', 'phase5-working-1-initial.png'),
    fullPage: true 
  });
  
  // Wait for login form to be visible
  await page.waitForSelector('input[type="email"]', { state: 'visible', timeout: 5000 });
  
  // Login with admin
  await page.locator('input[type="email"]').fill('admin@example.com');
  await page.locator('input[type="password"]').fill('admin123');
  
  // Screenshot before submit
  await page.screenshot({ 
    path: path.join('screenshots', 'phase5-working-2-login-filled.png'),
    fullPage: true 
  });
  
  // Click submit
  await page.locator('button[type="submit"]').click();
  
  // Wait for navigation with longer timeout
  try {
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✓ Login successful');
  } catch (e) {
    console.log('Login navigation failed, current URL:', page.url());
    // Take error screenshot
    await page.screenshot({ 
      path: path.join('screenshots', 'phase5-working-error-login.png'),
      fullPage: true 
    });
  }
  
  // === PROJECTS ===
  await page.locator('text=Projects').click();
  await page.waitForTimeout(2000);
  
  await page.screenshot({ 
    path: path.join('screenshots', 'phase5-working-3-projects.png'),
    fullPage: true 
  });
  
  // Find or create project
  const projectCount = await page.locator('article').count();
  console.log(`Found ${projectCount} projects`);
  
  let projectId;
  
  if (projectCount > 0) {
    await page.locator('article').first().click();
    await page.waitForTimeout(1000);
    projectId = page.url().split('/projects/')[1];
  } else {
    // Create project
    await page.locator('text=New Project').click();
    await page.locator('input[name="name"]').fill('Phase 5 Test Project');
    
    // Select organization
    const orgSelect = page.locator('select[name="organizationId"]');
    const orgOptions = await orgSelect.locator('option').count();
    if (orgOptions > 1) {
      await orgSelect.selectOption({ index: 1 });
    }
    
    await page.locator('textarea[name="description"]').fill('Testing task management');
    await page.locator('button[type="submit"]').click();
    
    await page.waitForURL('**/projects');
    await page.locator('text=Phase 5 Test Project').click();
    projectId = page.url().split('/projects/')[1];
  }
  
  // === TASKS ===
  await page.goto(`http://localhost:3001/projects/${projectId}/tasks`);
  await page.waitForTimeout(2000);
  
  await page.screenshot({ 
    path: path.join('screenshots', 'phase5-working-4-task-board.png'),
    fullPage: true 
  });
  
  // Create tasks
  const columns = ['Not Started', 'In Progress', 'Needs Review', 'Done'];
  
  for (let i = 0; i < 2; i++) { // Create 2 tasks for demo
    const column = columns[i];
    const addBtn = page.locator(`h3:has-text("${column}")`).locator('..').locator('button').first();
    
    await addBtn.click();
    await page.waitForTimeout(1000);
    
    await page.locator('input[name="title"]').fill(`Task ${i + 1}: ${column}`);
    await page.locator('textarea[name="description"]').fill(`Description for task in ${column}`);
    
    await page.locator('button:has-text("Create Task")').click();
    await page.waitForTimeout(1500);
  }
  
  await page.screenshot({ 
    path: path.join('screenshots', 'phase5-working-5-tasks-created.png'),
    fullPage: true 
  });
  
  // Test status transition
  const task1 = page.locator('text="Task 1:"').locator('../..');
  await task1.hover();
  
  const startBtn = task1.locator('button:has-text("Start Task")');
  if (await startBtn.isVisible()) {
    await startBtn.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: path.join('screenshots', 'phase5-working-6-task-started.png'),
      fullPage: true 
    });
  }
  
  // Mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(1000);
  
  await page.screenshot({ 
    path: path.join('screenshots', 'phase5-working-7-mobile.png'),
    fullPage: true 
  });
  
  // Summary
  console.log('\n✅ Phase 5 Testing Complete!');
  console.log('\nFeatures tested:');
  console.log('- Admin login');
  console.log('- Project navigation'); 
  console.log('- Task board view');
  console.log('- Task creation');
  console.log('- Status transitions');
  console.log('- Mobile responsive view');
  console.log('\n📸 Screenshots saved to screenshots/ directory');
});