// ============================================
// TEST INTERACTIVE DASHBOARD
// ============================================
// This tests the new dashboard features

const testDashboard = async () => {
    try {
        console.log('='.repeat(60));
        console.log('INTERACTIVE DASHBOARD TEST');
        console.log('='.repeat(60));

        // Step 1: Login
        console.log('\n📝 Step 1: Logging in...\n');

        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'pankhi123',
                password: 'mypassword'
            })
        });

        const loginData = await loginRes.json();

        if (!loginData.success) {
            console.log('❌ Login failed.');
            return;
        }

        const token = loginData.token;
        console.log('✅ Login successful!');

        // Step 2: Get dashboard overview
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 2: Getting dashboard overview...\n');

        const dashRes = await fetch('http://localhost:3000/api/dashboard/overview', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const dashData = await dashRes.json();

        if (dashData.success) {
            console.log('✅ Dashboard data retrieved!');
            console.log('\n📊 TODAY\'S SUMMARY:');
            console.log('='.repeat(60));
            console.log(`Total Spent: ₹${dashData.today.total}`);
            console.log(`Transactions: ${dashData.today.count}`);
            console.log(`Categories: ${dashData.today.categories}`);

            console.log('\n📊 THIS WEEK:');
            console.log('='.repeat(60));
            console.log(`Total Spent: ₹${dashData.week.total}`);
            console.log(`Transactions: ${dashData.week.count}`);

            console.log('\n📊 THIS MONTH:');
            console.log('='.repeat(60));
            console.log(`Total Spent: ₹${dashData.month.total}`);
            console.log(`Transactions: ${dashData.month.count}`);

            console.log('\n📊 THIS YEAR:');
            console.log('='.repeat(60));
            console.log(`Total Spent: ₹${dashData.year.total}`);
            console.log(`Transactions: ${dashData.year.count}`);

            console.log('\n🕒 RECENT TRANSACTIONS:');
            console.log('='.repeat(60));
            dashData.recentExpenses.forEach((exp, i) => {
                console.log(`${i + 1}. ${exp.category} - ₹${exp.amount} (${exp.date})`);
            });
        } else {
            console.log('❌ Failed to get dashboard data');
            return;
        }

        // Step 3: Set a spending limit
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 3: Setting monthly spending limit...\n');

        const limitRes = await fetch('http://localhost:3000/api/dashboard/set-limit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                period: 'monthly',
                category: null,
                limitAmount: 10000
            })
        });

        const limitData = await limitRes.json();

        if (limitData.success) {
            console.log('✅ Monthly limit set to ₹10,000!');
        } else {
            console.log(`❌ Failed to set limit: ${limitData.message}`);
        }

        // Step 4: Set category limit
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 4: Setting Food category limit...\n');

        const catLimitRes = await fetch('http://localhost:3000/api/dashboard/set-limit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                period: 'monthly',
                category: 'Food',
                limitAmount: 3000
            })
        });

        const catLimitData = await catLimitRes.json();

        if (catLimitData.success) {
            console.log('✅ Food limit set to ₹3,000/month!');
        } else {
            console.log(`❌ Failed to set category limit: ${catLimitData.message}`);
        }

        // Step 5: Get all limits
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 5: Getting all spending limits...\n');

        const getLimitsRes = await fetch('http://localhost:3000/api/dashboard/limits', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const getLimitsData = await getLimitsRes.json();

        if (getLimitsData.success) {
            console.log('✅ Limits retrieved!');
            console.log('\n💰 YOUR SPENDING LIMITS:');
            console.log('='.repeat(60));
            getLimitsData.limits.forEach(limit => {
                const cat = limit.category || 'Total';
                console.log(`${limit.period}: ${cat} - ₹${limit.limit_amount}`);
            });
        } else {
            console.log('❌ Failed to get limits');
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL TESTS COMPLETED!');
        console.log('='.repeat(60));
        console.log('\n🎉 Your interactive dashboard is ready!');
        console.log('📍 Open: http://localhost:3000/dashboard.html');
        console.log('\n');

    } catch (error) {
        console.error('\n❌ Error during testing:', error.message);
        console.log('Make sure the server is running on http://localhost:3000');
    }
};

// Run the test
testDashboard();
