// ============================================
// TEST SUMMARY ENDPOINT
// ============================================
// This file tests the monthly summary endpoint
// Run this with: node test-summary.js

const testSummary = async () => {
    try {
        console.log('='.repeat(60));
        console.log('SUMMARY ENDPOINT TEST');
        console.log('='.repeat(60));

        // Step 1: Login to get JWT token
        console.log('\n📝 Step 1: Logging in...\n');

        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: "pankhi123",
                password: "mypassword"
            })
        });

        const loginData = await loginResponse.json();

        if (!loginData.success) {
            console.log('❌ Login failed.');
            return;
        }

        const token = loginData.token;
        console.log('✅ Login successful!');

        // Step 2: Get summary for December 2025
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 2: Fetching summary for December 2025...\n');

        const summaryResponse = await fetch('http://localhost:3000/api/summary/month?month=2025-12', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const summaryData = await summaryResponse.json();

        if (summaryData.success) {
            console.log('✅ Summary retrieved successfully!\n');
            console.log('📊 SUMMARY FOR', summaryData.month);
            console.log('='.repeat(60));
            console.log(`💰 Total Spending: ₹${summaryData.total.toFixed(2)}`);
            console.log(`📁 Number of Categories: ${summaryData.byCategory.length}`);
            console.log(`📅 Transaction Days: ${summaryData.byDay.length}`);

            if (summaryData.byCategory.length > 0) {
                console.log('\n📊 Spending by Category:');
                summaryData.byCategory.forEach(cat => {
                    console.log(`   - ${cat.category}: ₹${cat.total.toFixed(2)}`);
                });
            }

            if (summaryData.byDay.length > 0) {
                console.log('\n📈 Spending by Day:');
                summaryData.byDay.forEach(day => {
                    console.log(`   - ${day.date}: ₹${day.total.toFixed(2)}`);
                });
            }
        } else {
            console.log('❌ Failed to get summary:', summaryData.message);
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ TEST COMPLETED!');
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('\n❌ Error during testing:', error.message);
    }
};

// Run the test
testSummary();
