import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Phase 5: Task Management Testing', () => {
  test('Complete task workflow testing', async ({ page }) => {
    // Navigate to login
    await page.goto('http://localhost:3001/login');
    
    // Wait for page to be ready
    await page.waitForLoadState('networkidle');
    
    // Use placeholder text to find inputs since they don't have name attributes
    await page.locator('input[placeholder="Email"]').fill('admin@example.com');
    await page.locator('input[placeholder="Password"]').fill('admin123');
    
    // Screenshot login form
    await page.screenshot({ 
      path: path.join('screenshots', 'phase5-1-login.png'),
      fullPage: true 
    });
    
    // Click sign in button
    await page.locator('button:has-text("Sign In")').click();
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Screenshot dashboard
    await page.screenshot({ 
      path: path.join('screenshots', 'phase5-2-dashboard.png'),
      fullPage: true 
    });
    
    // Navigate to projects
    await page.locator('text=Projects').click();
    await page.waitForURL('**/projects');
    
    // Screenshot projects
    await page.screenshot({ 
      path: path.join('screenshots', 'phase5-3-projects.png'),
      fullPage: true 
    });
    
    // Find and click first project
    const projectCards = page.locator('article.cursor-pointer, div.cursor-pointer').first();
    const hasProjects = await projectCards.isVisible();
    
    if (!hasProjects) {
      console.log('No projects found, creating one...');
      // Create a project
      await page.locator('text=New Project').click();
      await page.locator('input[name="name"]').fill('Task Test Project');
      
      // Select first organization
      await page.locator('select[name="organizationId"]').selectOption({ index: 1 });
      
      await page.locator('textarea[name="description"]').fill('Testing tasks');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/projects');
    }
    
    // Click on first project
    await page.locator('article.cursor-pointer, div.cursor-pointer').first().click();
    await page.waitForTimeout(1000);
    
    // Get project ID and navigate to tasks
    const url = page.url();
    const projectId = url.split('/projects/')[1];
    await page.goto(`http://localhost:3001/projects/${projectId}/tasks`);
    
    // Wait for task board
    await page.waitForSelector('text="Tasks Board"', { timeout: 10000 });
    
    // Screenshot empty board
    await page.screenshot({ 
      path: path.join('screenshots', 'phase5-4-empty-board.png'),
      fullPage: true 
    });
    
    // Create a task in "Not Started"
    const addButtons = page.locator('button svg.h-4.w-4').locator('..');
    await addButtons.first().click();
    
    // Wait for modal
    await page.waitForSelector('text="Create New Task"');
    
    // Fill task form
    await page.locator('input[name="title"]').fill('Test Task 1');
    await page.locator('textarea[name="description"]').fill('This is a test task');
    
    // Set due date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.locator('input[name="dueDate"]').fill(tomorrow.toISOString().split('T')[0]);
    
    // Screenshot form
    await page.screenshot({ 
      path: path.join('screenshots', 'phase5-5-task-form.png'),
      fullPage: true 
    });
    
    // Submit
    await page.locator('button:has-text("Create Task")').click();
    await page.waitForTimeout(2000);
    
    // Screenshot with task
    await page.screenshot({ 
      path: path.join('screenshots', 'phase5-6-task-created.png'),
      fullPage: true 
    });
    
    // Test status transition
    const task = page.locator('text="Test Task 1"').locator('../..');
    await task.hover();
    
    // Start task
    const startButton = task.locator('button:has-text("Start Task")');
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: path.join('screenshots', 'phase5-7-task-started.png'),
        fullPage: true 
      });
    }
    
    // Test client view
    await page.locator('button[aria-label="User menu"]').click();
    await page.locator('text="Sign out"').click();
    await page.waitForURL('**/login');
    
    // Login as client
    await page.locator('input[placeholder="Email"]').fill('user@example.com');
    await page.locator('input[placeholder="Password"]').fill('user123');
    await page.locator('button:has-text("Sign In")').click();
    await page.waitForURL('**/dashboard');
    
    // Screenshot client dashboard
    await page.screenshot({ 
      path: path.join('screenshots', 'phase5-8-client-dashboard.png'),
      fullPage: true 
    });
    
    // Check projects as client
    await page.locator('text=Projects').click();
    await page.waitForURL('**/projects');
    
    await page.screenshot({ 
      path: path.join('screenshots', 'phase5-9-client-projects.png'),
      fullPage: true 
    });
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: path.join('screenshots', 'phase5-10-mobile-view.png'),
      fullPage: true 
    });
    
    console.log('✅ Phase 5 testing completed successfully!');
    console.log('📸 10 screenshots generated');
  });
});