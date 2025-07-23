import { test, expect } from '@playwright/test';
import path from 'path';

test('Phase 5: Complete Task Testing', async ({ page }) => {
  // Login
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
  
  console.log('✓ Logged in');
  await page.screenshot({ path: 'screenshots/phase5-1-dashboard.png', fullPage: true });
  
  // Go to projects
  await page.click('text=Projects');
  await page.waitForURL('**/projects');
  await page.screenshot({ path: 'screenshots/phase5-2-projects.png', fullPage: true });
  
  // Check if we have projects
  const hasProjects = await page.locator('article').count() > 0;
  let projectId;
  
  if (hasProjects) {
    await page.locator('article').first().click();
    projectId = page.url().split('/projects/')[1];
  } else {
    // Create a project
    await page.click('text=New Project');
    await page.fill('input[name="name"]', 'Task Test');
    await page.locator('select[name="organizationId"]').selectOption({ index: 1 });
    await page.click('button[type="submit"]');
    await page.waitForURL('**/projects');
    await page.locator('text=Task Test').click();
    projectId = page.url().split('/projects/')[1];
  }
  
  // Go to tasks
  await page.goto(`http://localhost:3000/projects/${projectId}/tasks`);
  await page.waitForSelector('text=Tasks Board');
  await page.screenshot({ path: 'screenshots/phase5-3-tasks.png', fullPage: true });
  
  // Create task
  await page.locator('button').filter({ has: page.locator('svg') }).first().click();
  await page.fill('input#title', 'Demo Task');
  await page.fill('textarea#description', 'Test description');
  await page.click('button:has-text("Create Task")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/phase5-4-created.png', fullPage: true });
  
  // Start task
  const task = page.locator('text="Demo Task"').first();
  await task.hover();
  await page.click('button:has-text("Start Task")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/phase5-5-started.png', fullPage: true });
  
  // Mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({ path: 'screenshots/phase5-6-mobile.png', fullPage: true });
  
  console.log('✅ Phase 5 Testing Complete!');
});