import { test } from '@playwright/test';

test('Debug connection', async ({ page }) => {
  console.log('Starting test...');
  
  // Try to connect
  try {
    await page.goto('http://localhost:3001', { timeout: 5000 });
    console.log('✓ Connected to localhost:3001');
    
    // Take screenshot
    await page.screenshot({ path: 'debug-screenshot.png' });
    console.log('✓ Screenshot taken');
    
    // Check page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check if we're on login page
    const url = page.url();
    console.log('Current URL:', url);
    
  } catch (error) {
    console.error('Error:', error);
  }
});