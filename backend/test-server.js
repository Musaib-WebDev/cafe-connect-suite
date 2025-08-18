import http from 'http';

console.log('🧪 Testing server endpoints...');

const testEndpoint = (path, expectedStatus = 200) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`✅ ${path} - Status: ${res.statusCode}`);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            console.log(`   Response: ${parsed.message || 'OK'}`);
          } catch (e) {
            console.log(`   Response: ${data.substring(0, 100)}...`);
          }
        }
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${path} - Error: ${err.message}`);
      reject(err);
    });

    req.setTimeout(5000, () => {
      console.log(`⏰ ${path} - Timeout`);
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
};

const runTests = async () => {
  try {
    console.log('🔍 Testing health endpoint...');
    await testEndpoint('/api/health');
    
    console.log('🔍 Testing 404 endpoint...');
    await testEndpoint('/api/nonexistent');
    
    console.log('\n🎉 Server tests completed!');
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
};

// Wait a moment for server to start, then run tests
setTimeout(runTests, 2000);