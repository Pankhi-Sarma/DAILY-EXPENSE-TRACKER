// ============================================
// TEST ADD EXPENSE FUNCTIONALITY
// ============================================
// This file tests adding expenses through the API
// Run this with: node test-add-expense.js

const testAddExpense = async () => {
    try {
        console.log('='.repeat(60));
        console.log('ADD EXPENSE FUNCTIONALITY TEST');
        console.log('='.repeat(60));

        // Step 1: Login to get token
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

        // Step 2: Add multiple expenses
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 2: Adding test expenses...\n');

        const testExpenses = [
            {
                date: '2025-12-05',
                category: 'Food',
                amount: 250,
                note: 'Dinner at restaurant'
            },
            {
                date: '2025-12-05',
                category: 'Travel',
                amount: 100,
                note: 'Uber to office'
            },
            {
                date: '2025-12-06',
                category: 'Shopping',
                amount: 1500,
                note: 'New shoes'
            },
            {
                date: '2025-12-06',
                category: 'Bills',
                amount: 800,
                note: 'Internet bill'
            }
        ];

        const addedExpenses = [];

        for (const expense of testExpenses) {
            const response = await fetch('http://localhost:3000/api/expenses/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(expense)
            });

            const data = await response.json();

            if (data.success) {
                addedExpenses.push(data.expenseId);
                console.log(`✅ Added: ${expense.category} - ₹${expense.amount} (${expense.date})`);
                console.log(`   Note: ${expense.note}`);
                console.log(`   ID: ${data.expenseId}`);
            } else {
                console.log(`❌ Failed to add: ${expense.category} - ${data.message}`);
            }
        }

        // Step 3: Verify expenses were added
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 3: Verifying expenses...\n');

        const getResponse = await fetch('http://localhost:3000/api/expenses', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const getExpenses = await getResponse.json();

        if (getExpenses.success) {
            console.log(`✅ Total expenses in database: ${getExpenses.expenses.length}`);
            console.log('\nRecent expenses:');
            getExpenses.expenses.slice(0, 5).forEach(exp => {
                console.log(`   - ${exp.date} | ${exp.category} | ₹${exp.amount} | ${exp.note}`);
            });
        }

        // Step 4: Get summary for December 2025
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 4: Checking December 2025 summary...\n');

        const summaryResponse = await fetch('http://localhost:3000/api/summary/month?month=2025-12', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const summaryData = await summaryResponse.json();

        if (summaryData.success) {
            console.log('📊 DECEMBER 2025 SUMMARY');
            console.log('='.repeat(60));
            console.log(`💰 Total Spending: ₹${summaryData.total.toFixed(2)}`);
            console.log(`📁 Categories: ${summaryData.byCategory.length}`);
            console.log(`📅 Transaction Days: ${summaryData.byDay.length}`);

            if (summaryData.byCategory.length > 0) {
                console.log('\n📊 By Category:');
                summaryData.byCategory.forEach(cat => {
                    console.log(`   - ${cat.category}: ₹${cat.total.toFixed(2)}`);
                });
            }
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
testAddExpense();
