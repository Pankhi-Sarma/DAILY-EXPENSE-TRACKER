// ============================================
// TEST VIEW & DELETE EXPENSES
// ============================================
// This file tests viewing and deleting expenses
// Run this with: node test-view-delete.js

const testViewDelete = async () => {
    try {
        console.log('='.repeat(60));
        console.log('VIEW & DELETE EXPENSES TEST');
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

        // Step 2: View all expenses
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 2: Viewing all expenses...\n');

        const allResponse = await fetch('http://localhost:3000/api/expenses', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const allData = await allResponse.json();

        if (allData.success) {
            console.log(`✅ Retrieved ${allData.expenses.length} expenses:`);
            allData.expenses.forEach((exp, index) => {
                console.log(`   ${index + 1}. ${exp.date} | ${exp.category} | ₹${exp.amount} | ${exp.note}`);
            });
        }

        // Step 3: Filter by category
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 3: Filtering by category (Food)...\n');

        const foodResponse = await fetch('http://localhost:3000/api/expenses?category=Food', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const foodData = await foodResponse.json();

        if (foodData.success) {
            console.log(`✅ Found ${foodData.expenses.length} Food expenses:`);
            foodData.expenses.forEach(exp => {
                console.log(`   - ${exp.date} | ₹${exp.amount} | ${exp.note}`);
            });
        }

        // Step 4: Filter by date
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 4: Filtering by date (2025-12-05)...\n');

        const dateResponse = await fetch('http://localhost:3000/api/expenses?date=2025-12-05', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const dateData = await dateResponse.json();

        if (dateData.success) {
            console.log(`✅ Found ${dateData.expenses.length} expenses on 2025-12-05:`);
            dateData.expenses.forEach(exp => {
                console.log(`   - ${exp.category} | ₹${exp.amount} | ${exp.note}`);
            });
        }

        // Step 5: Delete an expense
        if (allData.expenses.length > 0) {
            const expenseToDelete = allData.expenses[allData.expenses.length - 1];

            console.log('\n' + '='.repeat(60));
            console.log('📝 Step 5: Deleting an expense...\n');
            console.log(`Deleting: ${expenseToDelete.category} - ₹${expenseToDelete.amount}`);
            console.log(`ID: ${expenseToDelete.id}`);

            const deleteResponse = await fetch(`http://localhost:3000/api/expenses/${expenseToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const deleteData = await deleteResponse.json();

            if (deleteData.success) {
                console.log(`\n✅ Expense deleted successfully!`);
                console.log(`   Rows deleted: ${deleteData.deleted}`);
            } else {
                console.log(`❌ Failed to delete: ${deleteData.message}`);
            }

            // Step 6: Verify deletion
            console.log('\n' + '='.repeat(60));
            console.log('📝 Step 6: Verifying deletion...\n');

            const verifyResponse = await fetch('http://localhost:3000/api/expenses', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
                console.log(`✅ Current expense count: ${verifyData.expenses.length}`);
                console.log(`   (Was ${allData.expenses.length} before deletion)`);
            }
        }

        // Step 7: Get updated summary
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 7: Checking updated summary...\n');

        const summaryResponse = await fetch('http://localhost:3000/api/summary/month?month=2025-12', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const summaryData = await summaryResponse.json();

        if (summaryData.success) {
            console.log('📊 DECEMBER 2025 SUMMARY (After Deletion)');
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
testViewDelete();
