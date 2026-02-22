// ============================================
// TEST LOGIN ENDPOINT
// ============================================
// This file tests the /api/auth/login endpoint
// Run this with: node test-login.js

// Test login function
const testLogin = async () => {
    try {
        console.log('Testing login endpoint...\n');

        // Test data for login (using the user we registered earlier)
        const loginData = {
            username: "pankhi123",
            password: "mypassword"
        };

        console.log('Sending login request with data:');
        console.log(JSON.stringify(loginData, null, 2));
        console.log('');

        // Make POST request to login endpoint
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        // Get the response data
        const data = await response.json();

        // Display results
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));

        if (response.status === 200 && data.success) {
            console.log('\n✅ SUCCESS! Login successful!');
            console.log('\n📝 JWT Token (save this for authenticated requests):');
            console.log(data.token);

            // Test the protected route with the token
            console.log('\n\n🔒 Testing protected route with token...\n');
            await testProtectedRoute(data.token);
        } else if (response.status === 401) {
            console.log('\n❌ Invalid username or password.');
        } else {
            console.log('\n❌ Login failed.');
        }

    } catch (error) {
        console.error('Error testing login:', error.message);
        console.log('\n❌ Make sure the server is running on http://localhost:3000');
    }
};

// Test protected route with JWT token
const testProtectedRoute = async (token) => {
    try {
        const response = await fetch('http://localhost:3000/api/protected/hello', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        console.log('Protected Route Response Status:', response.status);
        console.log('Protected Route Response Data:', JSON.stringify(data, null, 2));

        if (response.status === 200) {
            console.log('\n✅ Protected route accessed successfully!');
        } else {
            console.log('\n❌ Failed to access protected route.');
        }

    } catch (error) {
        console.error('Error testing protected route:', error.message);
    }
};

// Run the test
testLogin();
