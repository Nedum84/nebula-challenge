#!/usr/bin/env node

// Simple API test script
const http = require('http');

const baseUrl = 'http://localhost:8012';
let authToken = '';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAPI() {
  console.log('🚀 Starting API tests...\n');

  try {
    // Test 1: Register a new user
    console.log('1️⃣  Testing user registration...');
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPass123'
    };

    const registerResponse = await makeRequest('POST', '/v1/auth/register', registerData);
    console.log(`Status: ${registerResponse.status}`);
    
    if (registerResponse.status === 201) {
      console.log('✅ Registration successful');
      authToken = registerResponse.data.data.token;
      console.log(`Token: ${authToken.substring(0, 20)}...`);
    } else {
      console.log('❌ Registration failed');
      console.log(JSON.stringify(registerResponse.data, null, 2));
    }
    console.log('');

    // Test 2: Login with the same user
    console.log('2️⃣  Testing user login...');
    const loginData = {
      email: 'test@example.com',
      password: 'TestPass123'
    };

    const loginResponse = await makeRequest('POST', '/v1/auth/login', loginData);
    console.log(`Status: ${loginResponse.status}`);
    
    if (loginResponse.status === 200) {
      console.log('✅ Login successful');
      authToken = loginResponse.data.data.token;
    } else {
      console.log('❌ Login failed');
      console.log(JSON.stringify(loginResponse.data, null, 2));
    }
    console.log('');

    // Test 3: Get user profile
    console.log('3️⃣  Testing get profile...');
    const profileResponse = await makeRequest('GET', '/v1/auth/profile');
    console.log(`Status: ${profileResponse.status}`);
    
    if (profileResponse.status === 200) {
      console.log('✅ Profile retrieved successfully');
      console.log(`User: ${profileResponse.data.data.name} (${profileResponse.data.data.email})`);
    } else {
      console.log('❌ Profile retrieval failed');
      console.log(JSON.stringify(profileResponse.data, null, 2));
    }
    console.log('');

    // Test 4: Test duplicate registration (should fail)
    console.log('4️⃣  Testing duplicate registration (should fail)...');
    const duplicateResponse = await makeRequest('POST', '/v1/auth/register', registerData);
    console.log(`Status: ${duplicateResponse.status}`);
    
    if (duplicateResponse.status === 400) {
      console.log('✅ Duplicate registration properly rejected');
    } else {
      console.log('❌ Duplicate registration should have failed');
      console.log(JSON.stringify(duplicateResponse.data, null, 2));
    }
    console.log('');

    // Test 5: Test invalid login (should fail)
    console.log('5️⃣  Testing invalid login (should fail)...');
    const invalidLoginData = {
      email: 'test@example.com',
      password: 'WrongPassword123'
    };

    const invalidLoginResponse = await makeRequest('POST', '/v1/auth/login', invalidLoginData);
    console.log(`Status: ${invalidLoginResponse.status}`);
    
    if (invalidLoginResponse.status === 401) {
      console.log('✅ Invalid login properly rejected');
    } else {
      console.log('❌ Invalid login should have failed');
      console.log(JSON.stringify(invalidLoginResponse.data, null, 2));
    }
    console.log('');

    // Test 6: Test profile without token (should fail)
    console.log('6️⃣  Testing profile without token (should fail)...');
    const tempToken = authToken;
    authToken = ''; // Remove token
    
    const noTokenResponse = await makeRequest('GET', '/v1/auth/profile');
    console.log(`Status: ${noTokenResponse.status}`);
    
    if (noTokenResponse.status === 401) {
      console.log('✅ Profile without token properly rejected');
    } else {
      console.log('❌ Profile without token should have failed');
      console.log(JSON.stringify(noTokenResponse.data, null, 2));
    }
    
    authToken = tempToken; // Restore token
    console.log('');

    console.log('🎉 All API tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running with: npm start');
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await makeRequest('GET', '/');
    if (response.status === 200) {
      console.log('✅ Server is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not running');
    console.log('💡 Start the server with: npm start');
    return false;
  }
}

async function main() {
  console.log('🔍 Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (serverRunning) {
    console.log('');
    await testAPI();
  }
}

main();