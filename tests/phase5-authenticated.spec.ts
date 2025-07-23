import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Phase 5: Task Management - Authenticated Tests', () => {
  test('Task board features - full workflow', async ({ page }) => {
    // We're already authenticated thanks to the setup!
    
    // Go directly to projects
    await page.goto('/projects');
    await expect(page.locator('h1:has-text("Projects")')).toBeVisible();
    
    // Screenshot projects list
    await page.screenshot({ 
      path: path.join('screenshots', 'phase5-auth-1-projects.png'),
      fullPage: true 
    });
    
    // Click on first project or create one
    const projectCard = page.locator('article.cursor-pointer').first();
    
    if (await projectCard.count() > 0) {
      await projectCard.click();
    } else {
      // Create a project
      await page.click('text=New Project');
      await page.fill('input[name="name"]', 'Task Test Project');
      await page.selectOption('select[name="organizationId"]', { index: 1 });
      await page.fill('textarea[name="description"]', 'Testing tasks');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/projects');
      await page.locator('text=Task Test Project').click();
    }
    
    // Get project ID and go to tasks
    const url = page.url();
    const projectId = url.split('/projects/')[1];
    await page.goto(`/projects/${projectId}/tasks`);
    
    // Wait for task board
    await expect(page.locator('text=Tasks Board')).toBeVisible();
    
    // Screenshot empty board
    await page.screenshot({ 
      path: path.join('screenshots', 'phase5-auth-2-empty-board.png'),
      fullPage: true 
    });
    
    // Create tasks in different columns
    const columns = ['Not Started', 'In Progress', 'Needs Review', 'Done'];
    const tasks = [
      { title: 'Design Homepage', desc: 'Create mockups for new homepage' },
      { title: 'Implement Auth', desc: 'Set up user authentication' },
      { title: 'Review API Docs', desc: 'Review and approve API documentation' },
      { title: 'Setup Database', desc: 'Initial database schema' }
    ];
    
    for (let i = 0; i < columns.length; i++) {
      // Find add button for column
      const columnHeader = page.locator(`h3:has-text("${columns[i]}")`);
      const addButton = columnHeader.locator('..').locator('button').first();
      
      await addButton.click();
      await expect(page.locator('text=Create New Task')).toBeVisible();
      
      // Fill form
      await page.fill('input[name="title"]', tasks[i].title);
      await page.fill('textarea[name="description"]', tasks[i].desc);
      
      // Set due date
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + i + 1);
      await page.fill('input[name="dueDate"]', dueDate.toISOString().split('T')[0]);
      
      // Submit
      await page.click('button:has-text("Create Task")');
      await page.waitForTimeout(1000);
    }
    
    // Screenshot board with tasks
    await page.screenshot({ 
      path: path.join('screenshots', 'phase5-auth-3-tasks-created.png'),
      fullPage: true 
    });
    
    // Test status transitions
    const designTask = page.locator('text="Design Homepage"').locator('../..');
    await designTask.hover();
    
    // Start task
    await designTask.locator('button:has-text("Start Task")').click();
    await page.waitForTimeout(500);
    
    // Submit for review
    await designTask.hover();
    await designTask.locator('button:has-text("Submit for Review")').click();
    await page.waitForTimeout(500);
    
    // Mark as done
    await designTask.hover();
    await designTask.locator('button:has-text("Mark Done")').click();
    await page.waitForTimeout(500);
    
    // Screenshot after transitions
    await page.screenshot({ 
      path: path.join('screenshots', 'phase5-auth-4-transitions.png'),
      fullPage: true 
    });
    
    // Test drag and drop
    const authTask = page.locator('text="Implement Auth"').locator('../..');
    const doneColumn = page.locator('h3:has-text("Done")').locator('..').locator('.min-h-\\[200px\\]');
    
    await authTask.dragTo(doneColumn);
    await page.waitForTimeout(1000);
    
    // Screenshot after drag
    await page.screenshot({ 
      path: path.join('screenshots', 'phase5-auth-5-drag-drop.png'),
      fullPage: true 
    });
    
    // Create overdue task
    const addNotStarted = page.locator('h3:has-text("Not Started")').locator('..').locator('button').first();
    await addNotStarted.click();
    
    await page.fill('input[name="title"]', 'OVERDUE: Security Audit');
    await page.fill('textarea[name="description"]', 'This task is overdue');
    
    // Set past date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await page.fill('input[name="dueDate"]', yesterday.toISOString().split('T')[0]);
    
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(1000);
    
    // Screenshot overdue task
    await page.screenshot({ 
      path: path.join('screenshots', 'phase5-auth-6-overdue.png'),
      fullPage: true 
    });
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: path.join('screenshots', 'phase5-auth-7-mobile.png'),
      fullPage: true 
    });
    
    console.log('✅ Phase 5 authenticated tests completed!');
  });
  
  test('Client view restrictions', async ({ page }) => {
    // Logout first
    await page.goto('/');
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Sign out');
    
    // Login as client
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('user@example.com');
    await page.locator('input[type="password"]').fill('user123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard');
    
    // Navigate to projects
    await page.click('text=Projects');
    
    // Screenshot client projects view
    await page.screenshot({ 
      path: path.join('screenshots', 'phase5-auth-8-client-projects.png'),
      fullPage: true 
    });
    
    // Check if client can see any projects
    const clientProjects = page.locator('article.cursor-pointer');
    if (await clientProjects.count() > 0) {
      await clientProjects.first().click();
      const url = page.url();
      const projectId = url.split('/projects/')[1];
      
      await page.goto(`/projects/${projectId}/tasks`);
      
      // Verify no add buttons visible
      const addButtons = page.locator('button svg.h-4.w-4').locator('..');
      const buttonCount = await addButtons.count();
      
      expect(buttonCount).toBe(0);
      
      // Screenshot client task view
      await page.screenshot({ 
        path: path.join('screenshots', 'phase5-auth-9-client-tasks.png'),
        fullPage: true 
      });
    }
    
    console.log('✅ Client restrictions verified!');
  });
});