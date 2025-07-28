const puppeteer = require('puppeteer');

async function testLoginInBrowser() {
  console.log('🌐 Testing login page in browser...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: null,
      args: ['--no-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Navigate to login page
    console.log('📍 Navigating to http://localhost:3000/login');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    
    // Check if page loaded successfully
    const title = await page.title();
    console.log('📄 Page title:', title);
    
    // Check for our test content
    const content = await page.evaluate(() => document.body.innerText);
    
    if (content.includes('Ultra Simple Login Test')) {
      console.log('✅ Login page loaded successfully!');
      console.log('✅ Test content found in page');
    } else {
      console.log('❌ Test content not found');
      console.log('Page content preview:', content.substring(0, 200));
    }
    
    // Wait a moment for user to see
    await new Promise(resolve => setTimeout(resolve, 3000));
    
  } catch (error) {
    console.error('❌ Browser test failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testLoginInBrowser();