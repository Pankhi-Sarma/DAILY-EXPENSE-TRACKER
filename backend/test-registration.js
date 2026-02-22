// ============================================
// TEST REGISTRATION FLOW
// ============================================
// This file tests the complete registration flow
// Run this with: node test-registration.js

const testRegistration = async () => {
    try {
        console.log('='.repeat(60));
        console.log('REGISTRATION FLOW TEST');
        console.log('='.repeat(60));

        // Generate a unique username for testing
        const timestamp = Date.now();
        const testUser = {
            name: "Test User",
            username: `testuser${timestamp}`,
            password: "testpass123"
        };

        console.log('\n📝 Step 1: Registering new user...\n');
        console.log('Test user data:');
        console.log(`  Name: ${testUser.name}`);
        console.log(`  Username: ${testUser.username}`);
        console.log(`  Password: ${testUser.password}`);
        console.log('');

        // Step 1: Register new user
        const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        const registerData = await registerResponse.json();

        if (registerData.success) {
            console.log(`✅ Registration successful! User ID: ${registerData.userId}`);
        } else {
            console.log(`❌ Registration failed: ${registerData.message}`);
            return;
        }

        // Step 2: Login with the new user
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 2: Logging in with new user...\n');

        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: testUser.username,
                password: testUser.password
            })
        });

        const loginData = await loginResponse.json();

        if (loginData.success) {
            console.log('✅ Login successful!');
            console.log(`   User: ${loginData.user.name} (${loginData.user.username})`);
            console.log(`   Token: ${loginData.token.substring(0, 30)}...`);
        } else {
            console.log(`❌ Login failed: ${loginData.message}`);
            return;
        }

        // Step 3: Test duplicate registration
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 3: Testing duplicate username prevention...\n');

        const duplicateResponse = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        const duplicateData = await duplicateResponse.json();

        if (!duplicateData.success && duplicateResponse.status === 409) {
            console.log('✅ Duplicate username correctly rejected!');
            console.log(`   Message: ${duplicateData.message}`);
        } else {
            console.log('❌ Duplicate username was not rejected (this is a problem!)');
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL REGISTRATION TESTS COMPLETED!');
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('\n❌ Error during testing:', error.message);
        console.log('Make sure the server is running on http://localhost:3000');
    }
};

// Run the test
testRegistration();
