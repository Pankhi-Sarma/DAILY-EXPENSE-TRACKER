// ============================================
// TEST REGISTRATION ENDPOINT
// ============================================
// This file tests the /api/auth/register endpoint
// Run this with: node test-register.js

// Import the fetch API for making HTTP requests
// Note: fetch is available in Node.js 18+ by default
const testRegister = async () => {
    try {
        console.log('Testing registration endpoint...\n');

        // Test data for registration
        const userData = {
            name: "Pankhi",
            username: "pankhi123",
            password: "mypassword"
        };

        console.log('Sending registration request with data:');
        console.log(JSON.stringify(userData, null, 2));
        console.log('');

        // Make POST request to register endpoint
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        // Get the response data
        const data = await response.json();

        // Display results
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));

        if (response.status === 201) {
            console.log('\n✅ SUCCESS! User registered successfully!');
        } else if (response.status === 409) {
            console.log('\n⚠️ Username already exists. Try a different username.');
        } else {
            console.log('\n❌ Registration failed.');
        }

    } catch (error) {
        console.error('Error testing registration:', error.message);
        console.log('\n❌ Make sure the server is running on http://localhost:3000');
    }
};

// Run the test
testRegister();
