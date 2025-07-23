// Simple script to display test user credentials
// These users should be created via the database seed or the create-test-users.ts script

console.log('\n🔐 Test User Credentials for Agency Client Platform\n');
console.log('=====================================');
console.log('Role: Admin (Full Access)');
console.log('Email: admin@agency.com');
console.log('Password: admin123456');
console.log('=====================================\n');

console.log('=====================================');
console.log('Role: Client (Client Access)');
console.log('Email: client@example.com');
console.log('Password: client123456');
console.log('=====================================\n');

console.log('=====================================');
console.log('Role: Team Member (Team Access)');
console.log('Email: team@agency.com');
console.log('Password: team123456');
console.log('=====================================\n');

console.log('Note: If these users don\'t exist yet, run:');
console.log('npx tsx scripts/create-test-users.ts\n');