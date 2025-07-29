import { test, expect } from '@playwright/test';

test.describe('File Upload API - Direct Testing', () => {
  
  async function loginAndGetCookies(page: any, email: string, password: string) {
    await page.goto('/login');
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    return await page.context().cookies();
  }

  test('API: Admin can upload files via updated API route', async ({ page }) => {
    // Login as admin to get session cookies
    const cookies = await loginAndGetCookies(page, 'admin@test.com', 'password123');
    
    // Test API directly with session cookies
    const response = await page.evaluate(async (cookies) => {
      // Set cookies for the request
      document.cookie = cookies.map((c: any) => `${c.name}=${c.value}`).join('; ');
      
      const formData = new FormData();
      const blob = new Blob(['Test file content for API upload'], { type: 'text/plain' });
      formData.append('files', blob, 'api-upload-test.txt');
      
      const res = await fetch('/api/files', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      return {
        status: res.status,
        data: await res.json().catch(() => ({})),
        headers: Object.fromEntries(res.headers.entries())
      };
    }, cookies);
    
    console.log('API Response:', response);
    
    // Verify successful upload or get detailed error info
    if (response.status !== 200) {
      console.log('Upload failed with status:', response.status);
      console.log('Error data:', response.data);
    }
    
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.uploadedFiles).toBeDefined();
    expect(response.data.uploadedFiles.length).toBeGreaterThan(0);
  });

  test('API: Team member can upload files', async ({ page }) => {
    const cookies = await loginAndGetCookies(page, 'team@test.com', 'password123');
    
    const response = await page.evaluate(async (cookies) => {
      document.cookie = cookies.map((c: any) => `${c.name}=${c.value}`).join('; ');
      
      const formData = new FormData();
      const blob = new Blob(['Team member upload test'], { type: 'text/plain' });
      formData.append('files', blob, 'team-upload-test.txt');
      
      const res = await fetch('/api/files', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      return {
        status: res.status,
        data: await res.json().catch(() => ({}))
      };
    }, cookies);
    
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });

  test('API: Client upload is blocked correctly', async ({ page }) => {
    const cookies = await loginAndGetCookies(page, 'client@test.com', 'password123');
    
    const response = await page.evaluate(async (cookies) => {
      document.cookie = cookies.map((c: any) => `${c.name}=${c.value}`).join('; ');
      
      const formData = new FormData();
      const blob = new Blob(['Client should not upload this'], { type: 'text/plain' });
      formData.append('files', blob, 'client-blocked-test.txt');
      
      const res = await fetch('/api/files', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      return {
        status: res.status,
        data: await res.json().catch(() => ({}))
      };
    }, cookies);
    
    expect(response.status).toBe(403);
    expect(response.data.error).toContain('Clients cannot upload files');
  });

  test('API: File listing works correctly', async ({ page }) => {
    const cookies = await loginAndGetCookies(page, 'admin@test.com', 'password123');
    
    const response = await page.evaluate(async (cookies) => {
      document.cookie = cookies.map((c: any) => `${c.name}=${c.value}`).join('; ');
      
      const res = await fetch('/api/files', {
        method: 'GET',
        credentials: 'include'
      });
      
      return {
        status: res.status,
        data: await res.json().catch(() => ({}))
      };
    }, cookies);
    
    expect(response.status).toBe(200);
    expect(response.data.files).toBeDefined();
    expect(Array.isArray(response.data.files)).toBe(true);
  });

  test('API: File validation works (large files rejected)', async ({ page }) => {
    const cookies = await loginAndGetCookies(page, 'admin@test.com', 'password123');
    
    const response = await page.evaluate(async (cookies) => {
      document.cookie = cookies.map((c: any) => `${c.name}=${c.value}`).join('; ');
      
      const formData = new FormData();
      // Create a large file (> 10MB)
      const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
      const blob = new Blob([largeContent], { type: 'text/plain' });
      formData.append('files', blob, 'large-file.txt');
      
      const res = await fetch('/api/files', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      return {
        status: res.status,
        data: await res.json().catch(() => ({}))
      };
    }, cookies);
    
    expect(response.status).toBe(400);
    expect(response.data.error).toMatch(/too large|size/i);
  });

  test('API: Invalid file types are rejected', async ({ page }) => {
    const cookies = await loginAndGetCookies(page, 'admin@test.com', 'password123');
    
    const response = await page.evaluate(async (cookies) => {
      document.cookie = cookies.map((c: any) => `${c.name}=${c.value}`).join('; ');
      
      const formData = new FormData();
      const blob = new Blob(['fake executable'], { type: 'application/x-executable' });
      formData.append('files', blob, 'malicious.exe');
      
      const res = await fetch('/api/files', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      return {
        status: res.status,
        data: await res.json().catch(() => ({}))
      };
    }, cookies);
    
    expect(response.status).toBe(400);
    expect(response.data.error).toBeDefined();
  });
});