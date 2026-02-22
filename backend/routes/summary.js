// ============================================
// SUMMARY ROUTES
// ============================================
// This file provides summary and analytics endpoints
// Returns aggregated expense data for visualization and reporting

// Import required modules
const express = require('express');
const db = require('../db'); // Database connection
const auth = require('../middleware/auth'); // JWT authentication middleware
const router = express.Router();

// ============================================
// GET /api/summary/month?month=YYYY-MM
// ============================================
// Returns expense summary for a specific month
// Protected route: requires authentication
// Query parameter: month (format: YYYY-MM, example: 2025-12)
// 
// Response includes:
// - total: Total amount spent in the month
// - byCategory: Breakdown by expense categories
// - byDay: Daily spending breakdown
router.get('/month', auth, (req, res) => {
    try {
        // Get user ID from JWT token (set by auth middleware)
        const userId = req.user.id;

        // Get month parameter from query string
        const month = req.query.month; // Expected format: "YYYY-MM"

        // ===== VALIDATION =====
        // Check if month parameter is provided and in correct format
        if (!month || !/^\d{4}-\d{2}$/.test(month)) {
            return res.status(400).json({
                success: false,
                message: 'month query param required in YYYY-MM format (e.g., 2025-12)'
            });
        }

        // ===== PREPARE SQL QUERIES =====
        // monthLike will match all dates in the format YYYY-MM-DD for the given month
        // Example: "2025-12-%" matches "2025-12-01", "2025-12-15", etc.
        const monthLike = `${month}-%`;

        // Query 1: Get total amount spent in the month
        // IFNULL returns 0 if there are no expenses (instead of NULL)
        const totalSql = `SELECT IFNULL(SUM(amount), 0) AS total
                      FROM expenses
                      WHERE user_id = ? AND date LIKE ?`;

        // Query 2: Get spending breakdown by category
        // Groups expenses by category and sums the amounts
        // Ordered by total (highest spending categories first)
        const byCatSql = `SELECT category, IFNULL(SUM(amount), 0) as total
                      FROM expenses
                      WHERE user_id = ? AND date LIKE ?
                      GROUP BY category
                      ORDER BY total DESC`;

        // Query 3: Get spending breakdown by day
        // Groups expenses by date and sums the amounts
        // Ordered chronologically (earliest date first)
        const byDaySql = `SELECT date, IFNULL(SUM(amount), 0) as total
                      FROM expenses
                      WHERE user_id = ? AND date LIKE ?
                      GROUP BY date
                      ORDER BY date ASC`;

        // ===== EXECUTE QUERIES IN SEQUENCE =====
        // SQLite3 uses callbacks, so we nest them to run in order

        // Step 1: Get total amount
        db.get(totalSql, [userId, monthLike], (err, totalRow) => {
            if (err) {
                console.error('Summary total error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error fetching total'
                });
            }

            // Step 2: Get category breakdown
            db.all(byCatSql, [userId, monthLike], (err2, catRows) => {
                if (err2) {
                    console.error('Summary byCategory error:', err2);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error fetching category breakdown'
                    });
                }

                // Step 3: Get daily breakdown
                db.all(byDaySql, [userId, monthLike], (err3, dayRows) => {
                    if (err3) {
                        console.error('Summary byDay error:', err3);
                        return res.status(500).json({
                            success: false,
                            message: 'Database error fetching daily breakdown'
                        });
                    }

                    // ===== SEND RESPONSE =====
                    // Return all the aggregated data
                    return res.json({
                        success: true,
                        month, // The month that was queried
                        total: totalRow ? Number(totalRow.total) : 0, // Total spending
                        byCategory: catRows || [], // Array of {category, total}
                        byDay: dayRows || [] // Array of {date, total}
                    });
                });
            });
        });

    } catch (e) {
        console.error('GET /api/summary/month error:', e);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Export the router
module.exports = router;
