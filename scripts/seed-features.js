#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

// Direct PostgreSQL connection for seeding
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function seedFeatures() {
  console.log('Seeding feature flags...');
  
  await client.connect();

  const features = [
    {
      name: 'chat',
      description: 'Enable chat functionality for projects and tasks',
      enabled: true
    },
    {
      name: 'darkMode',
      description: 'Enable dark mode theme switching',
      enabled: true
    },
    {
      name: 'betaFeatures',
      description: 'Access to beta features and experimental functionality',
      enabled: false
    },
    {
      name: 'advancedAnalytics',
      description: 'Advanced analytics and reporting features',
      enabled: false
    },
    {
      name: 'fileUpload',
      description: 'File upload and attachment functionality',
      enabled: true
    },
    {
      name: 'voiceChat',
      description: 'Voice chat capabilities (coming soon)',
      enabled: false
    },
    {
      name: 'supabaseAuth',
      description: 'Use Supabase authentication instead of NextAuth',
      enabled: true
    }
  ];

  for (const feature of features) {
    try {
      await client.query(
        `INSERT INTO features (name, description, enabled) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (name) DO UPDATE 
         SET description = $2, enabled = $3`,
        [feature.name, feature.description, feature.enabled]
      );
      console.log(`✅ Created/updated feature: ${feature.name}`);
    } catch (error) {
      console.error(`❌ Failed to create feature ${feature.name}:`, error.message);
    }
  }

  await client.end();
  console.log('\n✨ Feature seeding complete!');
  process.exit(0);
}

seedFeatures().catch((error) => {
  console.error('Failed to seed features:', error);
  process.exit(1);
});