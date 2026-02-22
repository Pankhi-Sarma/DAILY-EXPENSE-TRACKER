// ============================================
// INTERACTIVE DASHBOARD JAVASCRIPT
// ============================================

let currentPeriod = 'today';
let dashboardData = null;

// Get token
function getToken() {
    return localStorage.getItem('expense_token');
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('expense_token');
        localStorage.removeItem('user_info');
        window.location.href = 'login.html';
    }
});

// ============================================
// LOAD DASHBOARD DATA
// ============================================
async function loadDashboard() {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    showSpinner('Loading dashboard...');

    try {
        const res = await fetch('/api/dashboard/overview', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();
        hideSpinner();

        if (data.success) {
            dashboardData = data;
            renderDashboard();
        } else {
            alert('Failed to load dashboard');
        }
    } catch (err) {
        hideSpinner();
        console.error('Dashboard error:', err);
        alert('Failed to load dashboard');
    }
}

// ============================================
// RENDER DASHBOARD
// ============================================
function renderDashboard() {
    const periodData = dashboardData[currentPeriod];

    // Render summary cards
    renderSummaryCards(periodData);

    // Render limit progress
    renderLimitProgress(periodData);

    // Render charts
    renderCharts(periodData);

    // Render recent transactions
    renderRecentTransactions();
}

// ============================================
// RENDER SUMMARY CARDS
// ============================================
function renderSummaryCards(data) {
    // Update the stat cards with new IDs
    document.getElementById('totalSpent').textContent = `₹${Number(data.total || 0).toFixed(2)}`;
    document.getElementById('transactionCount').textContent = data.count || 0;
    const avg = data.count > 0 ? (data.total / data.count) : 0;
    document.getElementById('avgTransaction').textContent = `₹${avg.toFixed(2)}`;
    document.getElementById('categoryCount').textContent = data.categories || 0;
}

// ============================================
// RENDER LIMIT PROGRESS
// ============================================
function renderLimitProgress(data) {
    const container = document.getElementById('limitProgress');
    const limits = dashboardData.limits.filter(l => l.period === currentPeriod);

    if (limits.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <p>No spending limits set</p>
                <small>Go to Add Expense to set limits</small>
            </div>
        `;
        return;
    }

    let html = '';

    limits.forEach(limit => {
        const spent = limit.category
            ? (data.byCategory.find(c => c.category === limit.category)?.total || 0)
            : data.total;

        const percentage = (spent / limit.limit_amount) * 100;
        const remaining = limit.limit_amount - spent;

        let borderColor = '#4facfe';
        let statusClass = 'safe';

        if (percentage >= 100) {
            borderColor = '#ff6b6b';
            statusClass = 'danger';
        } else if (percentage >= 80) {
            borderColor = '#fee140';
            statusClass = 'warning';
        }

        html += `
            <div class="limit-card ${statusClass}" style="border-left-color: ${borderColor};">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <strong style="color: #2d3436;">${limit.category || 'Total Spending'}</strong>
                        <br>
                        <small style="color: #6c757d;">${capitalizeFirst(limit.period)}</small>
                    </div>
                    <div class="text-end">
                        <div style="font-size: 1.25rem; font-weight: 700; color: ${borderColor};">
                            ₹${spent.toFixed(2)}
                        </div>
                        <small style="color: #6c757d;">of ₹${limit.limit_amount.toFixed(2)}</small>
                    </div>
                </div>
                <div class="progress-modern">
                    <div class="progress-bar-modern" style="width: ${Math.min(percentage, 100)}%; background: ${borderColor};"></div>
                </div>
                <div class="mt-2 d-flex justify-content-between align-items-center">
                    <small style="color: #6c757d;">
                        ${remaining > 0 ? `₹${remaining.toFixed(2)} remaining` : `₹${Math.abs(remaining).toFixed(2)} over limit`}
                    </small>
                    <small style="font-weight: 600; color: ${borderColor};">
                        ${percentage.toFixed(1)}%
                    </small>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================
// RENDER CHARTS
// ============================================
function renderCharts(data) {
    const categories = data.byCategory || [];

    // Use modern chart rendering if available
    if (typeof renderCategoryChart === 'function') {
        renderCategoryChart(categories);
    }

    if (typeof renderTrendChart === 'function') {
        renderTrendChart(categories);
    }
}

// ============================================
// RENDER RECENT TRANSACTIONS
// ============================================
function renderRecentTransactions() {
    const container = document.getElementById('recentList');
    const recent = dashboardData.recentExpenses || [];

    if (recent.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <p>No recent transactions</p>
            </div>
        `;
        return;
    }

    const categoryIcons = {
        'Food': '🍔',
        'Travel': '🚗',
        'Bills': '📄',
        'Shopping': '🛍️',
        'Entertainment': '🎬',
        'Healthcare': '🏥',
        'Education': '📚',
        'Other': '📦'
    };

    let html = '';
    recent.forEach(exp => {
        const icon = categoryIcons[exp.category] || '📦';
        html += `
            <div class="recent-transaction">
                <div class="d-flex align-items-center gap-3">
                    <div class="transaction-icon">
                        ${icon}
                    </div>
                    <div class="flex-grow-1">
                        <strong style="color: #2d3436;">${exp.category}</strong>
                        <br>
                        <small style="color: #6c757d;">${exp.note || 'No note'}</small>
                    </div>
                    <div class="text-end">
                        <strong style="color: #667eea; font-size: 1.125rem;">₹${Number(exp.amount).toFixed(2)}</strong>
                        <br>
                        <small style="color: #6c757d;">${exp.date}</small>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ============================================
// PERIOD TAB SWITCHING
// ============================================
document.querySelectorAll('.period-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Update active tab
        document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update current period
        currentPeriod = tab.dataset.period;

        // Re-render dashboard
        renderDashboard();
    });
});

// ============================================
// QUICK ADD EXPENSE
// ============================================
document.getElementById('quickAddBtn').addEventListener('click', async () => {
    const amount = document.getElementById('quickAmount').value;
    const category = document.getElementById('quickCategory').value;
    const note = document.getElementById('quickNote').value.trim();

    if (!amount || !category) {
        alert('Please enter amount and select category');
        return;
    }

    const token = getToken();
    const btn = document.getElementById('quickAddBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Adding...';

    try {
        const today = new Date().toISOString().split('T')[0];

        const res = await fetch('/api/expenses/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                date: today,
                category,
                amount: Number(amount),
                note: note || null
            })
        });

        const data = await res.json();

        if (data.success) {
            alert('✅ Expense added successfully!');
            document.getElementById('quickAmount').value = '';
            document.getElementById('quickCategory').value = '';
            document.getElementById('quickNote').value = '';

            // Reload dashboard
            loadDashboard();
        } else {
            alert(data.message || 'Failed to add expense');
        }
    } catch (err) {
        console.error('Quick add error:', err);
        alert('Failed to add expense');
    } finally {
        btn.disabled = false;
        btn.textContent = '➕ Add';
    }
});

// ============================================
// INITIALIZE
// ============================================
window.addEventListener('DOMContentLoaded', () => {
    if (!getToken()) {
        window.location.href = 'login.html';
        return;
    }

    loadDashboard();

    // Auto-refresh every 30 seconds
    setInterval(loadDashboard, 30000);
});
