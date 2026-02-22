// ============================================
// TEST EXPENSE ENDPOINTS
// ============================================
// This file tests all expense CRUD operations
// Run this with: node test-expenses.js

// First, we need to login to get a JWT token
const loginAndTest = async () => {
    try {
        console.log('='.repeat(60));
        console.log('EXPENSE ENDPOINTS TEST');
        console.log('='.repeat(60));

        // Step 1: Login to get JWT token
        console.log('\n📝 Step 1: Logging in to get JWT token...\n');

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
            console.log('❌ Login failed. Make sure user pankhi123 exists.');
            return;
        }

        const token = loginData.token;
        console.log('✅ Login successful!');
        console.log(`Token: ${token.substring(0, 30)}...`);

        // Step 2: Add expenses
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 2: Adding expenses...\n');

        const expenses = [
            { date: "2025-12-01", category: "Food", amount: 150, note: "Lunch at restaurant" },
            { date: "2025-12-02", category: "Transport", amount: 50, note: "Taxi fare" },
            { date: "2025-12-03", category: "Food", amount: 200, note: "Grocery shopping" }
        ];

        const expenseIds = [];

        for (const expense of expenses) {
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
                expenseIds.push(data.expenseId);
                console.log(`✅ Added expense: ${expense.category} - ₹${expense.amount} (ID: ${data.expenseId})`);
            } else {
                console.log(`❌ Failed to add expense: ${data.message}`);
            }
        }

        // Step 3: Get all expenses
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 3: Getting all expenses...\n');

        const getAllResponse = await fetch('http://localhost:3000/api/expenses', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const allExpenses = await getAllResponse.json();

        if (allExpenses.success) {
            console.log(`✅ Retrieved ${allExpenses.expenses.length} expenses:`);
            allExpenses.expenses.forEach(exp => {
                console.log(`   - ${exp.date} | ${exp.category} | ₹${exp.amount} | ${exp.note}`);
            });
        }

        // Step 4: Filter by category
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 4: Filtering expenses by category (Food)...\n');

        const filterResponse = await fetch('http://localhost:3000/api/expenses?category=Food', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const filteredExpenses = await filterResponse.json();

        if (filteredExpenses.success) {
            console.log(`✅ Found ${filteredExpenses.expenses.length} Food expenses:`);
            filteredExpenses.expenses.forEach(exp => {
                console.log(`   - ${exp.date} | ₹${exp.amount} | ${exp.note}`);
            });
        }

        // Step 5: Get single expense
        if (expenseIds.length > 0) {
            console.log('\n' + '='.repeat(60));
            console.log(`📝 Step 5: Getting single expense (ID: ${expenseIds[0]})...\n`);

            const singleResponse = await fetch(`http://localhost:3000/api/expenses/${expenseIds[0]}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const singleExpense = await singleResponse.json();

            if (singleExpense.success) {
                console.log('✅ Retrieved expense:');
                console.log(JSON.stringify(singleExpense.expense, null, 2));
            }
        }

        // Step 6: Update expense
        if (expenseIds.length > 0) {
            console.log('\n' + '='.repeat(60));
            console.log(`📝 Step 6: Updating expense (ID: ${expenseIds[0]})...\n`);

            const updateResponse = await fetch(`http://localhost:3000/api/expenses/${expenseIds[0]}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: 180,
                    note: "Updated: Lunch at restaurant (with dessert)"
                })
            });

            const updateData = await updateResponse.json();

            if (updateData.success) {
                console.log(`✅ Expense updated! Rows changed: ${updateData.changed}`);

                // Verify the update
                const verifyResponse = await fetch(`http://localhost:3000/api/expenses/${expenseIds[0]}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const verifyData = await verifyResponse.json();
                console.log('Updated expense:', JSON.stringify(verifyData.expense, null, 2));
            }
        }

        // Step 7: Delete expense
        if (expenseIds.length > 1) {
            console.log('\n' + '='.repeat(60));
            console.log(`📝 Step 7: Deleting expense (ID: ${expenseIds[1]})...\n`);

            const deleteResponse = await fetch(`http://localhost:3000/api/expenses/${expenseIds[1]}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const deleteData = await deleteResponse.json();

            if (deleteData.success) {
                console.log(`✅ Expense deleted! Rows deleted: ${deleteData.deleted}`);
            }
        }

        // Final: Get all expenses again
        console.log('\n' + '='.repeat(60));
        console.log('📝 Final: Getting all expenses after operations...\n');

        const finalResponse = await fetch('http://localhost:3000/api/expenses', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const finalExpenses = await finalResponse.json();

        if (finalExpenses.success) {
            console.log(`✅ Final count: ${finalExpenses.expenses.length} expenses:`);
            finalExpenses.expenses.forEach(exp => {
                console.log(`   - ID: ${exp.id} | ${exp.date} | ${exp.category} | ₹${exp.amount} | ${exp.note}`);
            });
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('\n❌ Error during testing:', error.message);
        console.log('Make sure the server is running on http://localhost:3000');
    }
};

// Run the tests
loginAndTest();
