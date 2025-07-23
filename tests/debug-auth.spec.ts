import { test } from '@playwright/test';
import fs from 'fs';

test('Debug login page issue', async ({ page }) => {
  console.log('1. Going to login page...');
  await page.goto('http://localhost:3001/login', { waitUntil: 'domcontentloaded' });
  
  console.log('2. Current URL:', page.url());
  
  // Take screenshot
  await page.screenshot({ path: 'debug-login-1.png' });
  
  // Get page content
  const content = await page.content();
  fs.writeFileSync('debug-login-content.html', content);
  console.log('3. Page content saved to debug-login-content.html');
  
  // Wait a bit for any client-side rendering
  await page.waitForTimeout(3000);
  
  // Take another screenshot
  await page.screenshot({ path: 'debug-login-2-after-wait.png' });
  
  // Try different ways to find the email input
  console.log('4. Looking for email input...');
  
  // Method 1: By type
  const emailByType = await page.locator('input[type="email"]').count();
  console.log('   - input[type="email"] count:', emailByType);
  
  // Method 2: By placeholder
  const emailByPlaceholder = await page.locator('input[placeholder*="email" i]').count();
  console.log('   - input with email placeholder count:', emailByPlaceholder);
  
  // Method 3: All inputs
  const allInputs = await page.locator('input').count();
  console.log('   - Total input count:', allInputs);
  
  // Method 4: By id
  const emailById = await page.locator('input#email').count();
  console.log('   - input#email count:', emailById);
  
  // Get all input details
  if (allInputs > 0) {
    console.log('5. Input details:');
    for (let i = 0; i < allInputs; i++) {
      const input = page.locator('input').nth(i);
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      const id = await input.getAttribute('id');
      const name = await input.getAttribute('name');
      console.log(`   Input ${i}: type="${type}", placeholder="${placeholder}", id="${id}", name="${name}"`);
    }
  }
  
  // Check if there's any redirect
  console.log('6. Final URL:', page.url());
  
  // Check for any error messages
  const bodyText = await page.locator('body').innerText();
  console.log('7. Page text preview:', bodyText.substring(0, 200));
});