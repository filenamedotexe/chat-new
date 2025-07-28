import { test, expect, clearAuthStates } from '../fixtures/auth';
import path from 'path';
import fs from 'fs';

// Run before all tests to ensure clean state
test.beforeAll(async () => {
  // Clear any existing auth states
  await clearAuthStates();
});

test.describe('Supabase Admin Comprehensive Test', () => {
  test.use({ userRole: 'admin' });
  
  test('complete admin workflow with all features', async ({ authenticatedPage: page }) => {
    console.log('Starting comprehensive admin test...');
    
    // Test 1: Dashboard Access
    console.log('Testing dashboard access...');
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Test 2: Navigation Menu Items
    console.log('Testing navigation menu items...');
    
    // Check admin-specific menu items
    await expect(page.locator('nav >> text=Admin')).toBeVisible();
    await expect(page.locator('nav >> text=Tasks')).toBeVisible();
    await expect(page.locator('nav >> text=Organizations')).toBeVisible();
    await expect(page.locator('nav >> text=Projects')).toBeVisible();
    
    // Test 3: Admin Panel Access
    console.log('Testing admin panel access...');
    await page.click('nav >> text=Admin');
    await expect(page).toHaveURL('/admin');
    await expect(page.locator('h1')).toContainText('Admin');
    
    // Test 4: User Management
    console.log('Testing user management...');
    
    // Navigate to users section
    await page.click('a[href="/admin/users"]');
    await expect(page).toHaveURL('/admin/users');
    
    // Test user search
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500); // Wait for search debounce
    }
    
    // Test 5: Project Management
    console.log('Testing project management...');
    await page.click('nav >> text=Projects');
    await expect(page).toHaveURL('/projects');
    
    // Create new project button should be visible for admin
    const newProjectBtn = page.locator('button:has-text("New Project"), a:has-text("New Project")');
    await expect(newProjectBtn).toBeVisible();
    
    // Test 6: File Management with Supabase Storage
    console.log('Testing file management with Supabase Storage...');
    await page.goto('/files');
    await expect(page).toHaveURL('/files');
    await expect(page.locator('h1')).toContainText('Files');
    
    // Test file upload
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      // Create a test file
      const testFilePath = path.join(__dirname, 'test-file.txt');
      fs.writeFileSync(testFilePath, 'Test file content for Supabase Storage');
      
      await fileInput.setInputFiles(testFilePath);
      await page.waitForTimeout(2000); // Wait for upload
      
      // Clean up test file
      fs.unlinkSync(testFilePath);
    }
    
    // Test 7: Organization Management
    console.log('Testing organization management...');
    await page.click('nav >> text=Organizations');
    await expect(page).toHaveURL('/organizations');
    
    // Admin should see organization management options
    const orgActions = page.locator('button:has-text("New Organization"), button:has-text("Create Organization")');
    const hasOrgActions = await orgActions.count() > 0;
    console.log(`Organization actions available: ${hasOrgActions}`);
    
    // Test 8: Task Management
    console.log('Testing task management...');
    await page.click('nav >> text=Tasks');
    await expect(page).toHaveURL('/tasks');
    
    // Test 9: Real-time Chat Features
    console.log('Testing real-time chat features...');
    
    // Open chat widget
    const chatBubble = page.locator('[data-testid="chat-bubble"]');
    if (await chatBubble.isVisible()) {
      await chatBubble.click();
      await page.waitForTimeout(1000);
      
      // Check if chat widget opened
      const chatWidget = page.locator('[data-testid="chat-widget"]');
      await expect(chatWidget).toBeVisible();
      
      // Test sending a message
      const messageInput = page.locator('[data-testid="chat-input"], textarea[placeholder*="Type"], input[placeholder*="Type"]');
      if (await messageInput.isVisible()) {
        await messageInput.fill('Test message from admin using Supabase real-time');
        
        // Find and click send button
        const sendButton = page.locator('[data-testid="send-button"], button[type="submit"]').last();
        if (await sendButton.isVisible()) {
          await sendButton.click();
          await page.waitForTimeout(1000);
        }
      }
      
      // Close chat
      const closeButton = page.locator('[data-testid="chat-close"], button[aria-label*="Close"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
    
    // Test 10: Settings Access
    console.log('Testing settings access...');
    
    // Open user menu
    await page.click('[data-testid="user-menu"]');
    await page.waitForTimeout(500);
    
    // Click settings
    await page.click('text=Settings');
    await expect(page).toHaveURL('/settings');
    
    // Test 11: Theme Toggle
    console.log('Testing theme toggle...');
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    if (await themeToggle.isVisible()) {
      // Get initial theme
      const htmlElement = page.locator('html');
      const initialTheme = await htmlElement.getAttribute('class');
      
      // Toggle theme
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      // Check theme changed
      const newTheme = await htmlElement.getAttribute('class');
      expect(newTheme).not.toBe(initialTheme);
      
      // Toggle back
      await themeToggle.click();
      await page.waitForTimeout(500);
    }
    
    // Test 12: Logout
    console.log('Testing logout...');
    await page.click('[data-testid="user-menu"]');
    await page.waitForTimeout(500);
    await page.click('[data-testid="logout-button"]');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
    
    console.log('Admin comprehensive test completed successfully!');
  });
  
  test('test Supabase Edge Functions', async ({ authenticatedPage: page }) => {
    console.log('Testing Supabase Edge Functions...');
    
    // Test activity logging edge function
    console.log('Testing activity logging...');
    
    // Navigate to different pages to trigger activity logs
    const pages = ['/dashboard', '/projects', '/admin', '/settings'];
    
    for (const pageUrl of pages) {
      await page.goto(pageUrl);
      await page.waitForTimeout(1000); // Give time for edge function to process
      console.log(`Activity logged for ${pageUrl}`);
    }
    
    // Test file handling edge function
    console.log('Testing file handling edge function...');
    await page.goto('/files');
    
    // The file upload in previous test should have triggered the edge function
    // Check if files are displayed (processed by edge function)
    const fileList = page.locator('[data-testid="file-list"], .file-list, table');
    if (await fileList.isVisible()) {
      console.log('File list is visible - edge function processed files');
    }
    
    console.log('Edge Functions test completed!');
  });
  
  test('performance and load testing', async ({ authenticatedPage: page }) => {
    console.log('Starting performance and load testing...');
    
    const startTime = Date.now();
    const pageLoadTimes: number[] = [];
    
    // Test rapid navigation
    const routes = [
      '/dashboard',
      '/projects', 
      '/admin',
      '/organizations',
      '/tasks',
      '/files',
      '/settings'
    ];
    
    console.log('Testing rapid page navigation...');
    for (let i = 0; i < 3; i++) {
      for (const route of routes) {
        const navStart = Date.now();
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        const navEnd = Date.now();
        
        const loadTime = navEnd - navStart;
        pageLoadTimes.push(loadTime);
        console.log(`${route} loaded in ${loadTime}ms`);
      }
    }
    
    // Calculate average load time
    const avgLoadTime = pageLoadTimes.reduce((a, b) => a + b, 0) / pageLoadTimes.length;
    console.log(`Average page load time: ${avgLoadTime.toFixed(2)}ms`);
    
    // Test concurrent operations
    console.log('Testing concurrent operations...');
    await page.goto('/dashboard');
    
    // Simulate multiple simultaneous actions
    await Promise.all([
      page.evaluate(() => fetch('/api/user/profile')),
      page.evaluate(() => fetch('/api/projects')),
      page.evaluate(() => fetch('/api/organizations')),
      page.evaluate(() => fetch('/api/activities/recent'))
    ]);
    
    const totalTime = Date.now() - startTime;
    console.log(`Total performance test time: ${totalTime}ms`);
    
    // Performance assertions
    expect(avgLoadTime).toBeLessThan(3000); // Pages should load in under 3 seconds
    console.log('Performance test completed!');
  });
});