import dotenv from 'dotenv';

console.log('🚀 Starting Cafe Management Server...');
console.log('📍 Current directory:', process.cwd());
console.log('🔧 Node.js version:', process.version);

// Load environment variables
console.log('📝 Loading environment variables...');
dotenv.config();

console.log('🌐 Environment:', process.env.NODE_ENV || 'development');
console.log('🔌 Port:', process.env.PORT || 5001);
console.log('💾 MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

// Test basic imports
try {
  console.log('📦 Testing imports...');
  const express = await import('express');
  console.log('✅ Express imported successfully');
  
  const mongoose = await import('mongoose');
  console.log('✅ Mongoose imported successfully');
  
  console.log('🚀 Starting server...');
  
  // Import and start the actual server
  await import('./server.js');
  
} catch (error) {
  console.error('❌ Error during startup:', error.message);
  console.error('📍 Stack trace:', error.stack);
  process.exit(1);
}