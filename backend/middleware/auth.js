// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
// This middleware protects routes that require authentication
// It verifies the JWT token sent by the frontend

// Import jsonwebtoken library
const jwt = require('jsonwebtoken');

// JWT_SECRET must match the one used in auth.js
// This is used to verify that the token is genuine and hasn't been tampered with
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_to_a_strong_secret';

// ============================================
// AUTH MIDDLEWARE FUNCTION
// ============================================
// This function checks if a valid JWT token is present in the request
// If valid, it allows the request to proceed to the protected route
// If invalid or missing, it returns an error
function authMiddleware(req, res, next) {
    // ===== EXTRACT TOKEN FROM HEADER =====
    // The token is typically sent in the Authorization header as: "Bearer <token>"
    const authHeader = req.headers.authorization || '';

    // Extract the token part (remove "Bearer " prefix)
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    // If no token provided
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token provided.'
        });
    }

    // ===== VERIFY TOKEN =====
    try {
        // jwt.verify() checks if the token is valid and not expired
        // It also decodes the payload (userId, username, name) from the token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach user info to the request object
        // This makes user data available to the route handler
        // Example: in a route, you can access req.user.id, req.user.username, etc.
        req.user = {
            id: decoded.userId,
            username: decoded.username,
            name: decoded.name
        };

        // Call next() to proceed to the actual route handler
        return next();

    } catch (err) {
        // Token is invalid, expired, or tampered with
        console.error('JWT verify error:', err);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
}

// Export the middleware so it can be used in server.js and other route files
module.exports = authMiddleware;
