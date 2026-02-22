// ============================================
// TEST PROFILE & CHANGE PASSWORD
// ============================================
// This file tests profile viewing and password changing
// Run this with: node test-profile.js

const testProfile = async () => {
    try {
        console.log('='.repeat(60));
        console.log('PROFILE & CHANGE PASSWORD TEST');
        console.log('='.repeat(60));

        // Step 1: Login
        console.log('\n📝 Step 1: Logging in...\n');

        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'pankhi123',
                password: 'mypassword'
            })
        });

        const loginData = await loginResponse.json();

        if (!loginData.success) {
            console.log('❌ Login failed.');
            return;
        }

        const token = loginData.token;
        console.log('✅ Login successful!');
        console.log(`User: ${loginData.user.name} (${loginData.user.username})`);

        // Step 2: Get profile
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 2: Getting profile information...\n');

        const profileResponse = await fetch('http://localhost:3000/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const profileData = await profileResponse.json();

        if (profileData.success) {
            console.log('✅ Profile retrieved successfully!');
            console.log('\n👤 PROFILE INFORMATION');
            console.log('='.repeat(60));
            console.log(`ID: ${profileData.user.id}`);
            console.log(`Name: ${profileData.user.name}`);
            console.log(`Username: ${profileData.user.username}`);
            console.log(`Joined: ${profileData.user.created_at}`);
        } else {
            console.log(`❌ Failed to get profile: ${profileData.message}`);
        }

        // Step 3: Change password (test with wrong old password)
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 3: Testing password change with wrong old password...\n');

        const wrongPwdResponse = await fetch('http://localhost:3000/api/auth/change-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                oldPassword: 'wrongpassword',
                newPassword: 'newpassword123'
            })
        });

        const wrongPwdData = await wrongPwdResponse.json();

        if (!wrongPwdData.success && wrongPwdResponse.status === 401) {
            console.log('✅ Correctly rejected wrong old password!');
            console.log(`   Message: ${wrongPwdData.message}`);
        } else {
            console.log('❌ Should have rejected wrong old password!');
        }

        // Step 4: Change password (correct)
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 4: Changing password (correct old password)...\n');

        const changePwdResponse = await fetch('http://localhost:3000/api/auth/change-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                oldPassword: 'mypassword',
                newPassword: 'mynewpassword'
            })
        });

        const changePwdData = await changePwdResponse.json();

        if (changePwdData.success) {
            console.log('✅ Password changed successfully!');
            console.log(`   Message: ${changePwdData.message}`);
        } else {
            console.log(`❌ Failed to change password: ${changePwdData.message}`);
            return;
        }

        // Step 5: Try logging in with old password (should fail)
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 5: Testing login with old password (should fail)...\n');

        const oldPwdLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'pankhi123',
                password: 'mypassword'
            })
        });

        const oldPwdLoginData = await oldPwdLoginResponse.json();

        if (!oldPwdLoginData.success) {
            console.log('✅ Old password correctly rejected!');
            console.log(`   Message: ${oldPwdLoginData.message}`);
        } else {
            console.log('❌ Old password should have been rejected!');
        }

        // Step 6: Login with new password (should succeed)
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 6: Testing login with new password (should succeed)...\n');

        const newPwdLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'pankhi123',
                password: 'mynewpassword'
            })
        });

        const newPwdLoginData = await newPwdLoginResponse.json();

        if (newPwdLoginData.success) {
            console.log('✅ New password works!');
            console.log(`   User: ${newPwdLoginData.user.name}`);
        } else {
            console.log(`❌ New password should have worked: ${newPwdLoginData.message}`);
            return;
        }

        // Step 7: Change password back to original
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 7: Changing password back to original...\n');

        const revertPwdResponse = await fetch('http://localhost:3000/api/auth/change-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newPwdLoginData.token}`
            },
            body: JSON.stringify({
                oldPassword: 'mynewpassword',
                newPassword: 'mypassword'
            })
        });

        const revertPwdData = await revertPwdResponse.json();

        if (revertPwdData.success) {
            console.log('✅ Password reverted to original!');
        } else {
            console.log(`❌ Failed to revert password: ${revertPwdData.message}`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL TESTS COMPLETED!');
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('\n❌ Error during testing:', error.message);
        console.log('Make sure the server is running on http://localhost:3000');
    }
};

// Run the test
testProfile();
