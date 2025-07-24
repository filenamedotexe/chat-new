import { test, expect } from '@playwright/test';

test.describe('Error Detection', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Capture page errors
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    // Store errors on page for later access
    await page.exposeFunction('getErrors', () => errors);
  });

  test('login page should have no console errors', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const errors = await page.evaluate(() => (window as any).getErrors());
    expect(errors).toHaveLength(0);
  });

  test('dashboard should have no console errors after login', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check for errors
    const errors = await page.evaluate(() => (window as any).getErrors());
    
    // Log errors if any
    if (errors.length > 0) {
      console.log('Console errors found:', errors);
    }
    
    expect(errors).toHaveLength(0);
  });

  test('navigation should not cause errors', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Navigate to admin
    await page.click('a[href="/admin"]');
    await page.waitForURL('/admin');
    await page.waitForLoadState('networkidle');
    
    // Back to dashboard
    await page.click('a[href="/dashboard"]');
    await page.waitForURL('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check for errors
    const errors = await page.evaluate(() => (window as any).getErrors());
    expect(errors).toHaveLength(0);
  });

  test('client-side hydration should work correctly', async ({ page }) => {
    // Go directly to dashboard (will redirect to login)
    await page.goto('/dashboard');
    await page.waitForURL('/login');
    
    // Check no hydration errors
    const errors = await page.evaluate(() => (window as any).getErrors());
    const hydrationErrors = errors.filter((e: any) => 
      e.includes('Hydration') || 
      e.includes('useTheme') || 
      e.includes('ThemeProvider')
    );
    
    if (hydrationErrors.length > 0) {
      console.log('Hydration/Theme errors found:', hydrationErrors);
    }
    
    expect(hydrationErrors).toHaveLength(0);
  });
});