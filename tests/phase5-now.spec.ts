import { test, expect } from '@playwright/test';
import path from 'path';

test('Phase 5: Task Management Test', async ({ page }) => {
  // Just go straight to login on port 3000
  await page.goto('http://localhost:3000/login');
  
  // Fill login form
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  // Wait for dashboard
  await page.waitForURL('**/dashboard');
  
  // Screenshot dashboard
  await page.screenshot({ 
    path: path.join('screenshots', 'phase5-1-dashboard.png'),
    fullPage: true 
  });
  
  // Go to projects
  await page.click('text=Projects');
  await page.waitForURL('**/projects');
  
  // Screenshot projects
  await page.screenshot({ 
    path: path.join('screenshots', 'phase5-2-projects.png'),
    fullPage: true 
  });
  
  // Click first project
  await page.locator('article').first().click();
  const projectId = page.url().split('/projects/')[1];
  
  // Go to tasks
  await page.goto(`http://localhost:3000/projects/${projectId}/tasks`);
  await page.waitForSelector('text=Tasks Board');
  
  // Screenshot task board
  await page.screenshot({ 
    path: path.join('screenshots', 'phase5-3-task-board.png'),
    fullPage: true 
  });
  
  // Create a task
  await page.locator('h3:has-text("Not Started")').locator('..').locator('button').first().click();
  await page.fill('input[name="title"]', 'New Task');
  await page.fill('textarea[name="description"]', 'Task description');
  await page.click('button:has-text("Create Task")');
  await page.waitForTimeout(1000);
  
  // Screenshot with task
  await page.screenshot({ 
    path: path.join('screenshots', 'phase5-4-task-created.png'),
    fullPage: true 
  });
  
  // Test status change
  const task = page.locator('text="New Task"').locator('../..');
  await task.hover();
  await task.locator('button:has-text("Start Task")').click();
  await page.waitForTimeout(500);
  
  // Final screenshot
  await page.screenshot({ 
    path: path.join('screenshots', 'phase5-5-task-started.png'),
    fullPage: true 
  });
  
  console.log('✅ Phase 5 test complete!');
});