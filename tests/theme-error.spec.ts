import { test, expect } from '@playwright/test';

test.describe('Theme Provider Error', () => {
  test('should catch useTheme error', async ({ page }) => {
    const errors: string[] = [];
    
    // Capture all console messages
    page.on('console', (msg) => {
      console.log(`[${msg.type()}] ${msg.text()}`);
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Capture uncaught exceptions
    page.on('pageerror', (error) => {
      console.log('[PageError]', error.message);
      errors.push(error.message);
    });
    
    // Navigate directly to dashboard (should redirect to login)
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    
    // Wait a bit for any errors to appear
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/theme-error.png', fullPage: true });
    
    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Check for theme errors
    const themeErrors = errors.filter(e => e.includes('useTheme') || e.includes('ThemeProvider'));
    
    if (themeErrors.length > 0) {
      console.log('Theme errors found:', themeErrors);
      
      // Get the stack trace
      const errorDetails = await page.evaluate(() => {
        const errorElements = document.querySelectorAll('.nextjs-container-errors-body');
        return Array.from(errorElements).map(el => el.textContent);
      });
      
      console.log('Error details:', errorDetails);
    }
    
    // This test SHOULD fail if there's a useTheme error
    expect(themeErrors).toHaveLength(0);
  });
  
  test('check all pages for theme errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    const pages = [
      '/',
      '/login',
      '/register',
      '/dashboard',
      '/admin'
    ];
    
    for (const path of pages) {
      console.log(`Checking ${path}...`);
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      
      const pageErrors = errors.filter(e => e.includes('useTheme') || e.includes('ThemeProvider'));
      if (pageErrors.length > 0) {
        console.log(`Errors on ${path}:`, pageErrors);
        await page.screenshot({ path: `test-results/theme-error-${path.replace('/', '-')}.png` });
      }
    }
    
    expect(errors.filter(e => e.includes('useTheme') || e.includes('ThemeProvider'))).toHaveLength(0);
  });
});