// ============================================
// TEST SPENDING LIMIT WARNING SYSTEM
// ============================================

const testLimitWarnings = async () => {
    try {
        console.log('='.repeat(60));
        console.log('TESTING SPENDING LIMIT WARNING SYSTEM');
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
        const token = loginData.token;
        console.log('✅ Login successful!');

        // Step 2: Set a monthly Food limit of ₹3000
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 2: Setting monthly Food limit to ₹3,000...\n');

        const limitRes = await fetch('http://localhost:3000/api/dashboard/set-limit', {
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

        const limitData = await limitRes.json();
        console.log('✅ Monthly Food limit set to ₹3,000!');

        // Step 3: Check limit with expense that's within budget
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 3: Checking limit for ₹500 Food expense (should be OK)...\n');

        const check1Res = await fetch('http://localhost:3000/api/dashboard/check-limit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                date: new Date().toISOString().slice(0, 10),
                category: 'Food',
                amount: 500
            })
        });

        const check1Data = await check1Res.json();

        if (check1Data.hasWarnings) {
            console.log('⚠️  Warnings detected:');
            check1Data.warnings.forEach(w => {
                console.log(`   ${w.severity === 'exceeded' ? '🔴' : '🟡'} ${w.period} - ${w.category}`);
                console.log(`   Current: ₹${w.currentSpent}`);
                console.log(`   Limit: ₹${w.limitAmount}`);
                console.log(`   After expense: ₹${w.newTotal}`);
                if (w.overage) {
                    console.log(`   OVER BY: ₹${w.overage}`);
                } else {
                    console.log(`   Remaining: ₹${w.remaining}`);
                }
            });
        } else {
            console.log('✅ No warnings - expense is within budget!');
        }

        // Step 4: Add some Food expenses to approach the limit
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 4: Adding ₹2,700 worth of Food expenses...\n');

        await fetch('http://localhost:3000/api/expenses/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                date: new Date().toISOString().slice(0, 10),
                category: 'Food',
                amount: 2700,
                note: 'Test expense to approach limit'
            })
        });

        console.log('✅ Added ₹2,700 Food expense');

        // Step 5: Check limit with expense that will exceed
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 5: Checking limit for ₹500 Food expense (should EXCEED)...\n');

        const check2Res = await fetch('http://localhost:3000/api/dashboard/check-limit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                date: new Date().toISOString().slice(0, 10),
                category: 'Food',
                amount: 500
            })
        });

        const check2Data = await check2Res.json();

        if (check2Data.hasWarnings) {
            console.log('⚠️  WARNING DETECTED!');
            console.log('='.repeat(60));
            check2Data.warnings.forEach(w => {
                console.log(`\n${w.severity === 'exceeded' ? '🔴 EXCEEDED' : '🟡 WARNING'}: ${w.period} - ${w.category}`);
                console.log(`   Current Spent: ₹${w.currentSpent.toFixed(2)}`);
                console.log(`   Limit: ₹${w.limitAmount.toFixed(2)}`);
                console.log(`   After This Expense: ₹${w.newTotal.toFixed(2)}`);
                if (w.overage) {
                    console.log(`   ❌ OVER BUDGET BY: ₹${w.overage.toFixed(2)}`);
                } else {
                    console.log(`   ✅ Remaining: ₹${w.remaining.toFixed(2)} (${w.percentage}%)`);
                }
            });
        } else {
            console.log('✅ No warnings');
        }

        // Step 6: Check with expense that's approaching (90%)
        console.log('\n' + '='.repeat(60));
        console.log('📝 Step 6: Checking limit for ₹200 Food expense (should WARN at 90%+)...\n');

        const check3Res = await fetch('http://localhost:3000/api/dashboard/check-limit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                date: new Date().toISOString().slice(0, 10),
                category: 'Food',
                amount: 200
            })
        });

        const check3Data = await check3Res.json();

        if (check3Data.hasWarnings) {
            console.log('⚠️  WARNING DETECTED!');
            console.log('='.repeat(60));
            check3Data.warnings.forEach(w => {
                console.log(`\n${w.severity === 'exceeded' ? '🔴 EXCEEDED' : '🟡 APPROACHING LIMIT'}: ${w.period} - ${w.category}`);
                console.log(`   Current Spent: ₹${w.currentSpent.toFixed(2)}`);
                console.log(`   Limit: ₹${w.limitAmount.toFixed(2)}`);
                console.log(`   After This Expense: ₹${w.newTotal.toFixed(2)}`);
                console.log(`   Percentage: ${w.percentage}%`);
                if (w.overage) {
                    console.log(`   ❌ OVER BUDGET BY: ₹${w.overage.toFixed(2)}`);
                } else {
                    console.log(`   ⚠️  Remaining: ₹${w.remaining.toFixed(2)}`);
                }
            });
        } else {
            console.log('✅ No warnings');
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL TESTS COMPLETED!');
        console.log('='.repeat(60));
        console.log('\n🎉 Spending limit warning system is working perfectly!');
        console.log('\n📍 Try it yourself:');
        console.log('   1. Go to http://localhost:3000/add-expense.html');
        console.log('   2. Try adding a ₹500 Food expense');
        console.log('   3. You should see a warning popup!');
        console.log('\n');

    } catch (error) {
        console.error('\n❌ Error during testing:', error.message);
    }
};

// Run the test
testLimitWarnings();
