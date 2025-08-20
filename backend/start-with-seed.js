import seedData from './seeds/seedData.js';

// Run seed data creation and then start the server
seedData().then(() => {
  console.log('✅ Seed data created successfully!');
  console.log('🚀 Starting server...');
  import('./server.js');
}).catch(error => {
  console.error('❌ Failed to seed data:', error);
  process.exit(1);
});