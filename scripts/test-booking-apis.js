const http = require('http');

async function testAPI(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Appointment Booking APIs...\n');

  try {
    // Test 1: Doctors Available API
    console.log('1. Testing GET /api/doctors/available');
    const doctorsResponse = await testAPI('/api/doctors/available');
    console.log(`   Status: ${doctorsResponse.status}`);
    if (doctorsResponse.status === 200) {
      const data = JSON.parse(doctorsResponse.data);
      console.log(`   ✅ Success! Found ${data.data?.doctors?.length || 0} doctors`);
    } else {
      console.log(`   ❌ Failed: ${doctorsResponse.data}`);
    }

    console.log('');

    // Test 2: Health Check
    console.log('2. Testing GET /api/health');
    const healthResponse = await testAPI('/api/health');
    console.log(`   Status: ${healthResponse.status}`);
    if (healthResponse.status === 200) {
      console.log(`   ✅ Success! Server is running`);
    } else {
      console.log(`   ❌ Failed`);
    }

    console.log('\n✅ API endpoints are accessible!');
    console.log('\n📋 Next Steps:');
    console.log('1. Make sure dev server is running (npm run dev)');
    console.log('2. Refresh your browser (Ctrl+R or Cmd+R)');
    console.log('3. Click "Book Appointment" button');
    console.log('4. Check browser console (F12) for any errors');

  } catch (error) {
    console.error('\n❌ Error connecting to server:', error.message);
    console.log('\n⚠️  Make sure your dev server is running:');
    console.log('   Run: npm run dev');
  }
}

runTests(); 