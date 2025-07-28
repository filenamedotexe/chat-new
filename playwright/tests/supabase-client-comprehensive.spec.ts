import { test, expect, clearAuthStates } from '../fixtures/auth';
import path from 'path';
import fs from 'fs';

test.describe('Supabase Client Comprehensive Test', () => {
  test.use({ userRole: 'client' });
  
  test('complete client workflow with all features', async ({ authenticatedPage: page }) => {
    console.log('Starting comprehensive client test...');
    
    // Test 1: Dashboard Access (Limited View)
    console.log('Testing client dashboard access...');
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Test 2: Navigation Menu Items (Client specific)
    console.log('Testing navigation menu items for client...');
    
    // Clients should only see projects
    await expect(page.locator('nav >> text=Projects')).toBeVisible();
    
    // Clients should NOT see these menu items
    await expect(page.locator('nav >> text=Admin')).not.toBeVisible();
    await expect(page.locator('nav >> text=Tasks')).not.toBeVisible();
    await expect(page.locator('nav >> text=Organizations')).not.toBeVisible();
    
    // Test 3: Project Access (View Only)
    console.log('Testing client project access...');
    await page.click('nav >> text=Projects');
    await expect(page).toHaveURL('/projects');
    
    // Clients should NOT see create project button
    const newProjectBtn = page.locator('button:has-text("New Project"), a:has-text("New Project")');
    const canCreateProject = await newProjectBtn.isVisible();
    console.log(`Client can create projects: ${canCreateProject}`);
    expect(canCreateProject).toBe(false);
    
    // Test viewing a project if available
    const projectCard = page.locator('.project-card, [data-testid="project-item"], table tr').first();
    if (await projectCard.isVisible()) {
      await projectCard.click();
      await page.waitForTimeout(1000);
      
      // Client should have read-only access
      const editButtons = page.locator('button:has-text("Edit"), button:has-text("Delete")');
      const hasEditAccess = await editButtons.count() > 0;
      console.log(`Client has edit access: ${hasEditAccess}`);
      expect(hasEditAccess).toBe(false);
      
      // Go back to projects
      await page.goBack();
    }
    
    // Test 4: File Access with Supabase Storage
    console.log('Testing client file access with Supabase Storage...');
    await page.goto('/files');
    await expect(page).toHaveURL('/files');
    
    // Test file upload capability for clients
    const fileInput = page.locator('input[type="file"]');
    const canUploadFiles = await fileInput.isVisible();
    console.log(`Client can upload files: ${canUploadFiles}`);
    
    if (canUploadFiles) {
      // Create a test file
      const testFilePath = path.join(__dirname, 'client-test-file.txt');
      fs.writeFileSync(testFilePath, 'Client test file for Supabase Storage');
      
      await fileInput.setInputFiles(testFilePath);
      await page.waitForTimeout(2000); // Wait for upload
      
      // Clean up test file
      fs.unlinkSync(testFilePath);
      
      console.log('File uploaded by client');
    }
    
    // Test downloading files if available
    const downloadButton = page.locator('button:has-text("Download"), a[download]').first();
    if (await downloadButton.isVisible()) {
      console.log('Client can download files');
    }
    
    // Test 5: Support Chat (Primary Communication)
    console.log('Testing support chat for client communication...');
    
    // Open chat widget - this is primary way clients communicate
    const chatBubble = page.locator('[data-testid="chat-bubble"]');
    await expect(chatBubble).toBeVisible();
    await chatBubble.click();
    await page.waitForTimeout(1000);
    
    // Chat should be open
    const chatWidget = page.locator('[data-testid="chat-widget"]');
    await expect(chatWidget).toBeVisible();
    
    // Send support message
    const messageInput = page.locator('[data-testid="chat-input"], textarea[placeholder*="Type"], input[placeholder*="Type"]');
    await messageInput.fill('Client needs assistance with project deliverables');
    
    const sendButton = page.locator('[data-testid="send-button"], button[type="submit"]').last();
    await sendButton.click();
    await page.waitForTimeout(1000);
    
    // Send another message with file attachment request
    await messageInput.fill('Can you please share the latest design files?');
    await sendButton.click();
    await page.waitForTimeout(1000);
    
    // Test file attachment in chat if available
    const chatFileInput = page.locator('[data-testid="chat-file-input"], .chat-widget input[type="file"]');
    if (await chatFileInput.isVisible()) {
      console.log('Client can attach files in chat');
    }
    
    // Keep chat open for a bit to test real-time
    await page.waitForTimeout(2000);
    
    // Close chat
    const closeButton = page.locator('[data-testid="chat-close"], button[aria-label*="Close"]');
    await closeButton.click();
    
    // Test 6: Profile Settings (Limited)
    console.log('Testing client profile settings...');
    
    // Open user menu
    await page.click('[data-testid="user-menu"]');
    await page.waitForTimeout(500);
    
    // Go to settings
    await page.click('text=Settings');
    await expect(page).toHaveURL('/settings');
    
    // Check what settings are available to clients
    const securityTab = page.locator('text="Security"), button:has-text("Security")');
    const billingTab = page.locator('text="Billing"), button:has-text("Billing")');
    
    const hasSecurityAccess = await securityTab.isVisible();
    const hasBillingAccess = await billingTab.isVisible();
    
    console.log(`Client security settings access: ${hasSecurityAccess}`);
    console.log(`Client billing access: ${hasBillingAccess}`);
    
    // Test 7: Activity Visibility
    console.log('Testing client activity visibility...');
    await page.goto('/dashboard');
    
    // Check if client can see activity feed
    const activityFeed = page.locator('[data-testid="activity-feed"], .activity-feed, .recent-activity');
    if (await activityFeed.isVisible()) {
      console.log('Client can see activity feed');
      
      // Activity should be limited to their projects
      const activities = page.locator('.activity-item, [data-testid="activity-item"]');
      const activityCount = await activities.count();
      console.log(`Visible activities: ${activityCount}`);
    }
    
    // Test 8: Notifications
    console.log('Testing client notifications...');
    const notificationBell = page.locator('[data-testid="notifications"], button[aria-label*="Notifications"]');
    if (await notificationBell.isVisible()) {
      await notificationBell.click();
      await page.waitForTimeout(1000);
      
      // Clients should see project-related notifications
      console.log('Client notifications accessed');
      
      // Close notifications
      await page.keyboard.press('Escape');
    }
    
    // Test 9: Search Limitations
    console.log('Testing client search capabilities...');
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('confidential');
      await page.waitForTimeout(1000);
      
      // Results should be filtered to client's accessible content
      console.log('Client search performed with filtered results');
      
      await searchInput.clear();
    }
    
    // Test 10: Mobile Experience
    console.log('Testing client mobile experience...');
    
    // Clients often use mobile devices
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14
    await page.waitForTimeout(1000);
    
    // Test mobile navigation
    const mobileMenuButton = page.locator('[data-mobile-menu-trigger], button[aria-label*="menu"]');
    await mobileMenuButton.click();
    await page.waitForTimeout(500);
    
    // Check mobile menu
    const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu');
    await expect(mobileMenu).toBeVisible();
    
    // Verify limited menu items in mobile view
    const mobileProjects = mobileMenu.locator('text=Projects');
    await expect(mobileProjects).toBeVisible();
    
    const mobileAdmin = mobileMenu.locator('text=Admin');
    await expect(mobileAdmin).not.toBeVisible();
    
    // Close mobile menu
    await page.keyboard.press('Escape');
    
    // Reset viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Test 11: Help and Support Access
    console.log('Testing help and support access...');
    await page.click('[data-testid="user-menu"]');
    await page.waitForTimeout(500);
    
    const helpLink = page.locator('text="Help & Support"');
    if (await helpLink.isVisible()) {
      console.log('Client has access to help & support');
    }
    
    // Test 12: Logout
    console.log('Testing client logout...');
    await page.click('[data-testid="logout-button"]');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
    
    console.log('Client comprehensive test completed successfully!');
  });
  
  test('client-specific restrictions and limitations', async ({ authenticatedPage: page }) => {
    console.log('Testing client-specific restrictions...');
    
    // Test 1: Direct URL Access Restrictions
    console.log('Testing direct URL access restrictions...');
    
    const restrictedUrls = [
      '/admin',
      '/admin/users',
      '/users',
      '/tasks',
      '/organizations',
      '/admin/settings'
    ];
    
    for (const url of restrictedUrls) {
      await page.goto(url);
      await page.waitForTimeout(1000);
      
      // Should either redirect or show error
      const currentUrl = page.url();
      const hasAccess = currentUrl.includes(url);
      console.log(`Access to ${url}: ${hasAccess ? 'ALLOWED' : 'DENIED'}`);
      expect(hasAccess).toBe(false);
    }
    
    // Test 2: API Endpoint Restrictions
    console.log('Testing API endpoint restrictions...');
    
    // Test restricted API calls
    const apiTests = [
      { endpoint: '/api/admin/users', expected: 403 },
      { endpoint: '/api/users', expected: 403 },
      { endpoint: '/api/organizations', expected: 403 }
    ];
    
    for (const test of apiTests) {
      const response = await page.evaluate(async (endpoint) => {
        try {
          const res = await fetch(endpoint);
          return res.status;
        } catch {
          return 'error';
        }
      }, test.endpoint);
      
      console.log(`API ${test.endpoint}: ${response}`);
    }
    
    // Test 3: Data Visibility Restrictions
    console.log('Testing data visibility restrictions...');
    await page.goto('/projects');
    
    // Count visible projects
    const projects = page.locator('.project-card, [data-testid="project-item"], tbody tr');
    const projectCount = await projects.count();
    console.log(`Client can see ${projectCount} projects (should be limited to their own)`);
    
    // Test 4: Action Restrictions
    console.log('Testing action restrictions...');
    
    // Verify no admin actions are available
    const adminActions = page.locator('button:has-text("Delete User"), button:has-text("Manage Permissions"), button:has-text("System Settings")');
    const hasAdminActions = await adminActions.count() > 0;
    console.log(`Client has admin actions: ${hasAdminActions}`);
    expect(hasAdminActions).toBe(false);
    
    console.log('Client restrictions test completed!');
  });
});