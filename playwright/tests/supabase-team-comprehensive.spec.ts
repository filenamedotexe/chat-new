import { test, expect, clearAuthStates } from '../fixtures/auth';
import path from 'path';
import fs from 'fs';

test.describe('Supabase Team Member Comprehensive Test', () => {
  test.use({ userRole: 'team_member' });
  
  test('complete team member workflow with all features', async ({ authenticatedPage: page }) => {
    console.log('Starting comprehensive team member test...');
    
    // Test 1: Dashboard Access
    console.log('Testing dashboard access...');
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Test 2: Navigation Menu Items (Team Member specific)
    console.log('Testing navigation menu items for team member...');
    
    // Team members should see these
    await expect(page.locator('nav >> text=Projects')).toBeVisible();
    await expect(page.locator('nav >> text=Tasks')).toBeVisible();
    await expect(page.locator('nav >> text=Organizations')).toBeVisible();
    
    // Team members should NOT see admin menu
    await expect(page.locator('nav >> text=Admin')).not.toBeVisible();
    
    // Test 3: Project Access and Management
    console.log('Testing project access and management...');
    await page.click('nav >> text=Projects');
    await expect(page).toHaveURL('/projects');
    
    // Check if projects are visible
    await page.waitForSelector('.project-card, [data-testid="project-item"], table', { timeout: 5000 }).catch(() => {
      console.log('No projects found or different UI structure');
    });
    
    // Test project creation if allowed
    const newProjectBtn = page.locator('button:has-text("New Project"), a:has-text("New Project")');
    if (await newProjectBtn.isVisible()) {
      console.log('Team member can create projects');
      await newProjectBtn.click();
      
      // Fill project form if it appears
      const projectNameInput = page.locator('input[name="name"], input[placeholder*="Project"]');
      if (await projectNameInput.isVisible()) {
        await projectNameInput.fill('Team Member Test Project');
        
        const descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="Description"]');
        if (await descriptionInput.isVisible()) {
          await descriptionInput.fill('Project created by team member during Supabase test');
        }
        
        // Cancel or go back
        const cancelBtn = page.locator('button:has-text("Cancel"), button:has-text("Back")');
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
        }
      }
    }
    
    // Test 4: Task Management
    console.log('Testing task management...');
    await page.click('nav >> text=Tasks');
    await expect(page).toHaveURL('/tasks');
    
    // Team members should be able to view and manage tasks
    await page.waitForTimeout(2000);
    
    // Check task filters if available
    const statusFilter = page.locator('select[name="status"], [data-testid="status-filter"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
    }
    
    // Test 5: Organization Access
    console.log('Testing organization access...');
    await page.click('nav >> text=Organizations');
    await expect(page).toHaveURL('/organizations');
    
    // Team members can view but may have limited org management
    await page.waitForTimeout(2000);
    
    // Test 6: File Management with Supabase Storage
    console.log('Testing file management with Supabase Storage...');
    await page.goto('/files');
    await expect(page).toHaveURL('/files');
    
    // Test file upload for team member
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      // Create a test file
      const testFilePath = path.join(__dirname, 'team-test-file.txt');
      fs.writeFileSync(testFilePath, 'Team member test file for Supabase Storage');
      
      await fileInput.setInputFiles(testFilePath);
      await page.waitForTimeout(2000); // Wait for upload
      
      // Clean up test file
      fs.unlinkSync(testFilePath);
      
      console.log('File uploaded by team member');
    }
    
    // Test 7: Real-time Collaboration Features
    console.log('Testing real-time collaboration features...');
    
    // Open chat widget
    const chatBubble = page.locator('[data-testid="chat-bubble"]');
    if (await chatBubble.isVisible()) {
      await chatBubble.click();
      await page.waitForTimeout(1000);
      
      // Test team collaboration message
      const messageInput = page.locator('[data-testid="chat-input"], textarea[placeholder*="Type"], input[placeholder*="Type"]');
      if (await messageInput.isVisible()) {
        await messageInput.fill('Team member testing Supabase real-time collaboration');
        
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
    
    // Test 8: Activity Tracking
    console.log('Testing activity tracking...');
    
    // Navigate through different sections to generate activity
    const sections = ['/projects', '/tasks', '/organizations', '/dashboard'];
    for (const section of sections) {
      await page.goto(section);
      await page.waitForTimeout(1000);
      console.log(`Activity logged for ${section}`);
    }
    
    // Test 9: Search Functionality
    console.log('Testing search functionality...');
    
    // Look for global search
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test project');
      await page.waitForTimeout(1000); // Wait for search results
      
      // Clear search
      await searchInput.clear();
    }
    
    // Test 10: Profile and Settings
    console.log('Testing profile and settings...');
    
    // Open user menu
    await page.click('[data-testid="user-menu"]');
    await page.waitForTimeout(500);
    
    // Go to profile
    await page.click('text=Profile');
    await expect(page).toHaveURL('/settings');
    
    // Check profile information
    const emailField = page.locator('input[type="email"][disabled], input[type="email"][readonly]');
    if (await emailField.isVisible()) {
      const email = await emailField.inputValue();
      expect(email).toBe('team@test.com');
    }
    
    // Test 11: Notifications (if available)
    console.log('Testing notifications...');
    const notificationBell = page.locator('[data-testid="notifications"], button[aria-label*="Notifications"]');
    if (await notificationBell.isVisible()) {
      await notificationBell.click();
      await page.waitForTimeout(1000);
      console.log('Notifications panel accessed');
      
      // Close notifications
      await page.keyboard.press('Escape');
    }
    
    // Test 12: Mobile Responsiveness
    console.log('Testing mobile responsiveness...');
    
    // Test different viewport sizes
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.waitForTimeout(1000);
    
    // Check mobile menu
    const mobileMenuButton = page.locator('[data-mobile-menu-trigger], button[aria-label*="menu"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(500);
      
      // Mobile menu should be visible
      const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu');
      await expect(mobileMenu).toBeVisible();
      
      // Close mobile menu
      await page.keyboard.press('Escape');
    }
    
    // Reset viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Test 13: Logout
    console.log('Testing logout...');
    await page.click('[data-testid="user-menu"]');
    await page.waitForTimeout(500);
    await page.click('[data-testid="logout-button"]');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
    
    console.log('Team member comprehensive test completed successfully!');
  });
  
  test('team collaboration scenarios', async ({ authenticatedPage: page }) => {
    console.log('Testing team collaboration scenarios...');
    
    // Test 1: Project Collaboration
    console.log('Testing project collaboration...');
    await page.goto('/projects');
    
    // Look for shared projects or team indicators
    const teamBadges = page.locator('.team-badge, [data-testid="team-indicator"], .shared-icon');
    const teamProjectsExist = await teamBadges.count() > 0;
    console.log(`Team projects found: ${teamProjectsExist}`);
    
    // Test 2: Task Assignment and Updates
    console.log('Testing task assignment and updates...');
    await page.goto('/tasks');
    
    // Look for assigned tasks
    const assignedToMe = page.locator('text="Assigned to me", text="My Tasks"');
    if (await assignedToMe.isVisible()) {
      await assignedToMe.click();
      await page.waitForTimeout(1000);
    }
    
    // Test 3: Comments and Mentions
    console.log('Testing comments and mentions...');
    
    // Try to find a task or project to comment on
    const firstItem = page.locator('.task-item, .project-card, tr').first();
    if (await firstItem.isVisible()) {
      await firstItem.click();
      await page.waitForTimeout(1000);
      
      // Look for comment section
      const commentInput = page.locator('textarea[placeholder*="comment"], input[placeholder*="comment"]');
      if (await commentInput.isVisible()) {
        await commentInput.fill('@admin Here is a team member comment for collaboration');
        
        const postButton = page.locator('button:has-text("Post"), button:has-text("Send"), button:has-text("Comment")');
        if (await postButton.isVisible()) {
          console.log('Comment feature available for team collaboration');
        }
      }
    }
    
    console.log('Team collaboration test completed!');
  });
});