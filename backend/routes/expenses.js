// ============================================
// EXPENSE ROUTES
// ============================================
// This file handles all expense-related operations (CRUD - Create, Read, Update, Delete)
// All routes here require authentication (JWT token)

// Import required modules
const express = require('express');
const db = require('../db'); // Database connection
const auth = require('../middleware/auth'); // JWT authentication middleware
const router = express.Router();

// ============================================
// HELPER FUNCTION: VALIDATE EXPENSE DATA
// ============================================
// Checks if the expense data has all required fields
function isValidExpense(body) {
    const { date, category, amount } = body || {};
    // date and category must exist, amount must be a valid number
    return date && category && (amount !== undefined && amount !== null && !isNaN(Number(amount)));
}

// ============================================
// POST /api/expenses/add
// ============================================
// Add a new expense for the logged-in user
// Required in body: { date: "YYYY-MM-DD", category: "Food", amount: 120.5, note: "lunch" }
// Note is optional
router.post('/add', auth, (req, res) => {
    try {
        // Get user ID from the JWT token (set by auth middleware)
        const userId = req.user.id;

        // Extract expense data from request body
        const { date, category, amount, note } = req.body || {};

        // ===== VALIDATION =====
        if (!isValidExpense(req.body)) {
            return res.status(400).json({
                success: false,
                message: 'date, category and amount are required (amount must be a number).'
            });
        }

        // ===== INSERT EXPENSE INTO DATABASE =====
        const sql = `INSERT INTO expenses (user_id, date, category, amount, note) VALUES (?, ?, ?, ?, ?)`;

        // db.run() executes the INSERT statement
        db.run(sql, [userId, date, category, amount, note || null], function (err) {
            if (err) {
                console.error('Insert expense error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error adding expense.'
                });
            }

            // Return the ID of the newly created expense
            return res.status(201).json({
                success: true,
                expenseId: this.lastID
            });
        });

    } catch (e) {
        console.error('POST /expenses/add error:', e);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
});

// ============================================
// GET /api/expenses
// ============================================
// Get all expenses for the logged-in user
// Optional query parameters: ?date=YYYY-MM-DD&category=Food
// This allows filtering expenses by date and/or category
router.get('/', auth, (req, res) => {
    try {
        // Get user ID from JWT token
        const userId = req.user.id;

        // Get optional filter parameters from query string
        const { date, category } = req.query;

        // ===== BUILD DYNAMIC SQL QUERY =====
        // Start with base query - get all expenses for this user
        let sql = `SELECT id, date, category, amount, note FROM expenses WHERE user_id = ?`;
        const params = [userId];

        // Add date filter if provided
        if (date) {
            sql += ` AND date = ?`;
            params.push(date);
        }

        // Add category filter if provided
        if (category) {
            sql += ` AND category = ?`;
            params.push(category);
        }

        // Order by most recent first
        sql += ` ORDER BY date DESC, id DESC`;

        // ===== EXECUTE QUERY =====
        // db.all() retrieves all matching rows
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Get expenses error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error fetching expenses.'
                });
            }

            // Return the list of expenses
            return res.json({
                success: true,
                expenses: rows
            });
        });

    } catch (e) {
        console.error('GET /api/expenses error:', e);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
});

// ============================================
// GET /api/expenses/:id
// ============================================
// Get a single expense by ID
// Only returns the expense if it belongs to the logged-in user
router.get('/:id', auth, (req, res) => {
    try {
        const userId = req.user.id;
        const id = Number(req.params.id); // Get ID from URL parameter

        // ===== FETCH EXPENSE FROM DATABASE =====
        db.get(`SELECT id, date, category, amount, note, user_id FROM expenses WHERE id = ?`, [id], (err, row) => {
            if (err) {
                console.error('Get expense by id error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error.'
                });
            }

            // Check if expense exists
            if (!row) {
                return res.status(404).json({
                    success: false,
                    message: 'Expense not found.'
                });
            }

            // ===== SECURITY CHECK =====
            // Make sure the expense belongs to the logged-in user
            if (row.user_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden.'
                });
            }

            // Remove user_id from response (not needed by frontend)
            delete row.user_id;

            return res.json({
                success: true,
                expense: row
            });
        });

    } catch (e) {
        console.error('GET /api/expenses/:id error:', e);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
});

// ============================================
// PUT /api/expenses/:id
// ============================================
// Update an existing expense
// Body can contain: date, category, amount, note (all optional)
// Only updates the fields that are provided
router.put('/:id', auth, (req, res) => {
    try {
        const userId = req.user.id;
        const id = Number(req.params.id);
        const { date, category, amount, note } = req.body || {};

        // ===== CHECK OWNERSHIP FIRST =====
        // Make sure the expense exists and belongs to the user
        db.get(`SELECT user_id FROM expenses WHERE id = ?`, [id], (err, row) => {
            if (err) {
                console.error('Select expense for update error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error.'
                });
            }

            if (!row) {
                return res.status(404).json({
                    success: false,
                    message: 'Expense not found.'
                });
            }

            if (row.user_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden.'
                });
            }

            // ===== BUILD DYNAMIC UPDATE QUERY =====
            // Only update the fields that were provided in the request
            const updates = [];
            const params = [];

            if (date) {
                updates.push('date = ?');
                params.push(date);
            }
            if (category) {
                updates.push('category = ?');
                params.push(category);
            }
            if (amount !== undefined && amount !== null) {
                updates.push('amount = ?');
                params.push(amount);
            }
            if (note !== undefined) {
                updates.push('note = ?');
                params.push(note);
            }

            // Check if at least one field was provided
            if (updates.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No fields provided to update.'
                });
            }

            // Build the final SQL query
            const sql = `UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`;
            params.push(id);

            // ===== EXECUTE UPDATE =====
            db.run(sql, params, function (updateErr) {
                if (updateErr) {
                    console.error('Update expense error:', updateErr);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error updating expense.'
                    });
                }

                // this.changes tells us how many rows were updated (should be 1)
                return res.json({
                    success: true,
                    changed: this.changes
                });
            });
        });

    } catch (e) {
        console.error('PUT /api/expenses/:id error:', e);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
});

// ============================================
// DELETE /api/expenses/:id
// ============================================
// Delete an expense
// Only allows deletion if the expense belongs to the logged-in user
router.delete('/:id', auth, (req, res) => {
    try {
        const userId = req.user.id;
        const id = Number(req.params.id);

        // ===== CHECK OWNERSHIP FIRST =====
        db.get(`SELECT user_id FROM expenses WHERE id = ?`, [id], (err, row) => {
            if (err) {
                console.error('Select expense for delete error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error.'
                });
            }

            if (!row) {
                return res.status(404).json({
                    success: false,
                    message: 'Expense not found.'
                });
            }

            if (row.user_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden.'
                });
            }

            // ===== DELETE THE EXPENSE =====
            db.run(`DELETE FROM expenses WHERE id = ?`, [id], function (delErr) {
                if (delErr) {
                    console.error('Delete expense error:', delErr);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error deleting expense.'
                    });
                }

                // this.changes tells us how many rows were deleted (should be 1)
                return res.json({
                    success: true,
                    deleted: this.changes
                });
            });
        });

    } catch (e) {
        console.error('DELETE /api/expenses/:id error:', e);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
});

// Export the router
module.exports = router;
