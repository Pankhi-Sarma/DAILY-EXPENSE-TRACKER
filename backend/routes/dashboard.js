// ============================================
// ENHANCED DASHBOARD ROUTES
// ============================================
// This file provides comprehensive dashboard data including:
// - Multi-period summaries (today, week, month, year)
// - Spending limits and progress
// - Recent transactions
// - Trends and insights

const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// ============================================
// GET /api/dashboard/overview
// ============================================
// Get comprehensive dashboard data for all time periods
router.get('/overview', auth, async (req, res) => {
    const userId = req.user.id;

    try {
        const today = new Date().toISOString().slice(0, 10);
        const thisMonth = new Date().toISOString().slice(0, 7);
        const thisYear = new Date().getFullYear().toString();

        // Calculate week start (Monday)
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const weekStart = new Date(now.setDate(diff)).toISOString().slice(0, 10);

        // Get all data in parallel
        const [todayData, weekData, monthData, yearData, limits, recentExpenses] = await Promise.all([
            getSummaryForPeriod(userId, 'day', today),
            getSummaryForPeriod(userId, 'week', weekStart),
            getSummaryForPeriod(userId, 'month', thisMonth),
            getSummaryForPeriod(userId, 'year', thisYear),
            getSpendingLimits(userId),
            getRecentExpenses(userId, 5)
        ]);

        res.json({
            success: true,
            today: todayData,
            week: weekData,
            month: monthData,
            year: yearData,
            limits,
            recentExpenses
        });

    } catch (error) {
        console.error('Dashboard overview error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Helper: Get summary for a specific period
function getSummaryForPeriod(userId, period, date) {
    return new Promise((resolve, reject) => {
        let dateCondition;

        if (period === 'day') {
            dateCondition = `date = '${date}'`;
        } else if (period === 'week') {
            dateCondition = `date >= '${date}'`;
        } else if (period === 'month') {
            dateCondition = `date LIKE '${date}%'`;
        } else if (period === 'year') {
            dateCondition = `date LIKE '${date}%'`;
        }

        const sql = `
            SELECT 
                IFNULL(SUM(amount), 0) as total,
                COUNT(*) as count,
                (SELECT COUNT(DISTINCT category) FROM expenses WHERE user_id = ? AND ${dateCondition}) as categories
            FROM expenses 
            WHERE user_id = ? AND ${dateCondition}
        `;

        db.get(sql, [userId, userId], (err, row) => {
            if (err) reject(err);
            else {
                // Get category breakdown
                db.all(
                    `SELECT category, SUM(amount) as total 
                     FROM expenses 
                     WHERE user_id = ? AND ${dateCondition}
                     GROUP BY category 
                     ORDER BY total DESC`,
                    [userId],
                    (err2, categories) => {
                        if (err2) reject(err2);
                        else resolve({ ...row, byCategory: categories || [] });
                    }
                );
            }
        });
    });
}

// Helper: Get spending limits
function getSpendingLimits(userId) {
    return new Promise((resolve, reject) => {
        db.all(
            'SELECT * FROM spending_limits WHERE user_id = ? ORDER BY period',
            [userId],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            }
        );
    });
}

// Helper: Get recent expenses
function getRecentExpenses(userId, limit = 5) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM expenses 
             WHERE user_id = ? 
             ORDER BY date DESC, id DESC 
             LIMIT ?`,
            [userId, limit],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            }
        );
    });
}

// ============================================
// POST /api/dashboard/set-limit
// ============================================
// Set or update spending limit
router.post('/set-limit', auth, (req, res) => {
    const userId = req.user.id;
    const { period, category, limitAmount } = req.body;

    if (!period || !limitAmount) {
        return res.status(400).json({
            success: false,
            message: 'Period and limit amount are required.'
        });
    }

    if (!['daily', 'weekly', 'monthly', 'yearly'].includes(period)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid period. Use: daily, weekly, monthly, or yearly.'
        });
    }

    const now = new Date().toISOString();

    const sql = `
        INSERT INTO spending_limits (user_id, period, category, limit_amount, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, period, category) 
        DO UPDATE SET limit_amount = excluded.limit_amount, updated_at = excluded.updated_at
    `;

    db.run(sql, [userId, period, category || null, limitAmount, now, now], function (err) {
        if (err) {
            console.error('Set limit error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }

        res.json({
            success: true,
            limitId: this.lastID,
            message: 'Spending limit updated successfully.'
        });
    });
});

// ============================================
// GET /api/dashboard/limits
// ============================================
// Get all spending limits for the user
router.get('/limits', auth, (req, res) => {
    const userId = req.user.id;

    db.all(
        'SELECT * FROM spending_limits WHERE user_id = ? ORDER BY period',
        [userId],
        (err, rows) => {
            if (err) {
                console.error('Get limits error:', err);
                return res.status(500).json({ success: false, message: 'Database error.' });
            }

            res.json({ success: true, limits: rows || [] });
        }
    );
});

// ============================================
// DELETE /api/dashboard/limit/:id
// ============================================
// Delete a spending limit
router.delete('/limit/:id', auth, (req, res) => {
    const userId = req.user.id;
    const limitId = req.params.id;

    db.run(
        'DELETE FROM spending_limits WHERE id = ? AND user_id = ?',
        [limitId, userId],
        function (err) {
            if (err) {
                console.error('Delete limit error:', err);
                return res.status(500).json({ success: false, message: 'Database error.' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ success: false, message: 'Limit not found.' });
            }

            res.json({ success: true, message: 'Limit deleted successfully.' });
        }
    );
});

// ============================================
// POST /api/dashboard/check-limit
// ============================================
// Check if adding an expense will exceed any limits
router.post('/check-limit', auth, async (req, res) => {
    const userId = req.user.id;
    const { date, category, amount } = req.body;

    if (!date || !category || !amount) {
        return res.status(400).json({
            success: false,
            message: 'Date, category, and amount are required.'
        });
    }

    try {
        // Determine which periods this expense affects
        const expenseDate = new Date(date);
        const today = new Date().toISOString().slice(0, 10);
        const thisMonth = new Date().toISOString().slice(0, 7);
        const thisYear = new Date().getFullYear().toString();

        // Calculate week start
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const weekStart = new Date(now.setDate(diff)).toISOString().slice(0, 10);

        // Get all limits for this user
        const limits = await getSpendingLimits(userId);

        const warnings = [];

        for (const limit of limits) {
            let shouldCheck = false;
            let currentSpent = 0;
            let periodName = '';

            // Determine if this limit applies to the expense date
            if (limit.period === 'daily' && date === today) {
                shouldCheck = true;
                periodName = 'Today';
                const data = await getSummaryForPeriod(userId, 'day', today);
                currentSpent = limit.category
                    ? (data.byCategory.find(c => c.category === limit.category)?.total || 0)
                    : data.total;
            } else if (limit.period === 'weekly' && date >= weekStart) {
                shouldCheck = true;
                periodName = 'This Week';
                const data = await getSummaryForPeriod(userId, 'week', weekStart);
                currentSpent = limit.category
                    ? (data.byCategory.find(c => c.category === limit.category)?.total || 0)
                    : data.total;
            } else if (limit.period === 'monthly' && date.startsWith(thisMonth)) {
                shouldCheck = true;
                periodName = 'This Month';
                const data = await getSummaryForPeriod(userId, 'month', thisMonth);
                currentSpent = limit.category
                    ? (data.byCategory.find(c => c.category === limit.category)?.total || 0)
                    : data.total;
            } else if (limit.period === 'yearly' && date.startsWith(thisYear)) {
                shouldCheck = true;
                periodName = 'This Year';
                const data = await getSummaryForPeriod(userId, 'year', thisYear);
                currentSpent = limit.category
                    ? (data.byCategory.find(c => c.category === limit.category)?.total || 0)
                    : data.total;
            }

            // Check if this limit applies to the category
            if (shouldCheck && (!limit.category || limit.category === category)) {
                const newTotal = currentSpent + parseFloat(amount);
                const percentage = (newTotal / limit.limit_amount) * 100;

                if (newTotal > limit.limit_amount) {
                    const overage = newTotal - limit.limit_amount;
                    warnings.push({
                        period: periodName,
                        category: limit.category || 'Total',
                        limitAmount: limit.limit_amount,
                        currentSpent,
                        newTotal,
                        overage,
                        percentage: percentage.toFixed(1),
                        severity: 'exceeded'
                    });
                } else if (percentage >= 90) {
                    warnings.push({
                        period: periodName,
                        category: limit.category || 'Total',
                        limitAmount: limit.limit_amount,
                        currentSpent,
                        newTotal,
                        remaining: limit.limit_amount - newTotal,
                        percentage: percentage.toFixed(1),
                        severity: 'warning'
                    });
                }
            }
        }

        res.json({
            success: true,
            hasWarnings: warnings.length > 0,
            warnings
        });

    } catch (error) {
        console.error('Check limit error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
