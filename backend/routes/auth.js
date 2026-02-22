// ============================================
// AUTHENTICATION ROUTES
// ============================================
// ============================================
// AUTHENTICATION ROUTES
// ============================================
// This file handles user registration and login endpoints
// Routes defined here will be accessible at /api/auth/*

// Import required modules
const express = require('express');
const bcrypt = require('bcrypt'); // For password hashing (security)
const jwt = require('jsonwebtoken'); // For creating authentication tokens
const db = require('../db'); // Import the database connection from db.js
const auth = require('../middleware/auth'); // Import authentication middleware for protected routes
const router = express.Router(); // Create a new router instance

// SALT_ROUNDS determines how many times the password is hashed
// Higher number = more secure but slower. 10 is a good balance.
const SALT_ROUNDS = 10;

// JWT_SECRET is used to sign and verify tokens
// In production, this should be a strong, random secret stored in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_to_a_strong_secret';

// JWT_EXPIRES_IN determines how long the token is valid
// '7d' means 7 days - after this, user needs to login again
const JWT_EXPIRES_IN = '7d';

// ============================================
// POST /api/auth/register
// ============================================
// This endpoint allows new users to create an account
router.post('/register', async (req, res) => {
    try {
        // Extract name, username, and password from the request body
        // req.body contains the JSON data sent from the frontend
        const { name, username, password } = req.body || {};

        // ===== VALIDATION =====
        // Check if all required fields are provided
        if (!name || !username || !password) {
            return res.status(400).json({
                success: false,
                message: 'name, username and password are required.'
            });
        }

        // Check if username and password are strings (type validation)
        if (typeof username !== 'string' || typeof password !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid input types.'
            });
        }

        // ===== CHECK IF USERNAME EXISTS =====
        // db.get() retrieves a single row from the database
        // The ? is a placeholder that gets replaced with the username value (prevents SQL injection)
        db.get('SELECT id FROM users WHERE username = ?', [username], async (err, row) => {
            if (err) {
                // Database error occurred
                console.error('DB error checking username:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error.'
                });
            }

            if (row) {
                // If row exists, username is already taken
                return res.status(409).json({
                    success: false,
                    message: 'Username already taken.'
                });
            }

            // ===== HASH THE PASSWORD =====
            // Never store passwords in plain text!
            // bcrypt.hash() creates a secure hash of the password
            try {
                const hashed = await bcrypt.hash(password, SALT_ROUNDS);

                // Get current timestamp in ISO format (e.g., "2025-12-05T00:47:30.000Z")
                const createdAt = new Date().toISOString();

                // ===== INSERT NEW USER INTO DATABASE =====
                const insertSql = 'INSERT INTO users (name, username, password, created_at) VALUES (?, ?, ?, ?)';

                // db.run() executes a SQL statement that modifies the database
                // The function keyword is important here because we need access to 'this.lastID'
                db.run(insertSql, [name, username, hashed, createdAt], function (insertErr) {
                    if (insertErr) {
                        console.error('DB insert error:', insertErr);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to create user.'
                        });
                    }

                    // this.lastID contains the auto-generated ID of the newly inserted user
                    return res.status(201).json({
                        success: true,
                        userId: this.lastID
                    });
                });

            } catch (hashErr) {
                // Error occurred during password hashing
                console.error('Hash error:', hashErr);
                return res.status(500).json({
                    success: false,
                    message: 'Server error.'
                });
            }
        });

    } catch (e) {
        // Catch any unexpected errors
        console.error('Register route error:', e);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
});

// ============================================
// POST /api/auth/login
// ============================================
// This endpoint allows existing users to log in
// Returns a JWT token that the frontend can use for authenticated requests
router.post('/login', (req, res) => {
    try {
        // Extract username and password from request body
        const { username, password } = req.body || {};

        // ===== VALIDATION =====
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'username and password are required.'
            });
        }

        // ===== FETCH USER FROM DATABASE =====
        // Retrieve user data including the hashed password for comparison
        db.get('SELECT id, username, password, name FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) {
                console.error('DB error during login:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error.'
                });
            }

            // If no user found with this username
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password.'
                });
            }

            // ===== VERIFY PASSWORD =====
            // bcrypt.compare() checks if the plain password matches the hashed password
            try {
                const match = await bcrypt.compare(password, user.password);

                if (!match) {
                    // Password doesn't match
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid username or password.'
                    });
                }

                // ===== CREATE JWT TOKEN =====
                // JWT (JSON Web Token) is like a secure ID card for the user
                // The frontend will send this token with future requests to prove they're logged in
                const payload = {
                    userId: user.id,
                    username: user.username,
                    name: user.name
                };

                // jwt.sign() creates the token
                // The token is signed with JWT_SECRET so it can't be tampered with
                const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

                // ===== SEND SUCCESS RESPONSE =====
                // Return the token and user info (but NOT the password!)
                return res.json({
                    success: true,
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        name: user.name
                    }
                });

            } catch (cmpErr) {
                // Error during password comparison
                console.error('Compare error:', cmpErr);
                return res.status(500).json({
                    success: false,
                    message: 'Server error.'
                });
            }
        });

    } catch (e) {
        // Catch any unexpected errors
        console.error('Login route error:', e);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
});

// ============================================
// GET /api/auth/profile
// ============================================
// This endpoint returns the logged-in user's profile information
// PROTECTED ROUTE: Requires valid JWT token
router.get('/profile', auth, (req, res) => {
    // The auth middleware has already verified the token
    // and attached user info to req.user
    const userId = req.user.id;

    // ===== FETCH USER PROFILE FROM DATABASE =====
    // Get user data but exclude the password for security
    db.get(
        'SELECT id, name, username, created_at FROM users WHERE id = ?',
        [userId],
        (err, row) => {
            if (err) {
                console.error('Profile DB error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error.'
                });
            }

            // If user not found (shouldn't happen if token is valid)
            if (!row) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.'
                });
            }

            // ===== SEND SUCCESS RESPONSE =====
            return res.json({
                success: true,
                user: row
            });
        }
    );
});

// ============================================
// PUT /api/auth/change-password
// ============================================
// This endpoint allows users to change their password
// PROTECTED ROUTE: Requires valid JWT token
// Request body: { oldPassword, newPassword }
router.put('/change-password', auth, (req, res) => {
    // Get user ID from the verified JWT token
    const userId = req.user.id;

    // Extract old and new passwords from request body
    const { oldPassword, newPassword } = req.body || {};

    // ===== VALIDATION =====
    if (!oldPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'oldPassword and newPassword are required.'
        });
    }

    // Validate new password length (security best practice)
    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'New password must be at least 6 characters long.'
        });
    }

    // ===== STEP 1: GET CURRENT HASHED PASSWORD =====
    db.get('SELECT password FROM users WHERE id = ?', [userId], async (err, row) => {
        if (err) {
            console.error('Change password DB error:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error.'
            });
        }

        if (!row) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        try {
            // ===== STEP 2: VERIFY OLD PASSWORD =====
            // Check if the provided old password matches the stored hash
            const match = await bcrypt.compare(oldPassword, row.password);

            if (!match) {
                // Old password is incorrect
                return res.status(401).json({
                    success: false,
                    message: 'Old password is incorrect.'
                });
            }

            // ===== STEP 3: HASH NEW PASSWORD =====
            // Create a secure hash of the new password
            const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);

            // ===== STEP 4: UPDATE PASSWORD IN DATABASE =====
            db.run(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashed, userId],
                function (updateErr) {
                    if (updateErr) {
                        console.error('Update password error:', updateErr);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to update password.'
                        });
                    }

                    // ===== SUCCESS =====
                    return res.json({
                        success: true,
                        message: 'Password updated successfully.'
                    });
                }
            );

        } catch (e) {
            // Handle any errors during password comparison or hashing
            console.error('Change password error:', e);
            return res.status(500).json({
                success: false,
                message: 'Server error.'
            });
        }
    });
});

// Export the router so it can be used in server.js
module.exports = router;

