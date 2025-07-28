const http = require('http');

function testRoute(path) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          headers: res.headers,
          bodyLength: data.length,
          isRedirect: res.statusCode >= 300 && res.statusCode < 400,
          redirectLocation: res.headers.location
        });
      });
    });
    
    req.on('error', (err) => {
      resolve({
        path,
        error: err.message
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        path,
        error: 'Timeout'
      });
    });
  });
}

async function testAuthFlow() {
  console.log('🧪 Testing Auth Routes...\n');
  
  const routes = ['/', '/login', '/register', '/dashboard'];
  
  for (const route of routes) {
    const result = await testRoute(route);
    console.log(`${route}:`);
    console.log(`  Status: ${result.status || 'ERROR'}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
    if (result.isRedirect) {
      console.log(`  Redirects to: ${result.redirectLocation}`);
    }
    console.log(`  Body length: ${result.bodyLength || 0} chars`);
    console.log('');
  }
}

testAuthFlow().catch(console.error);