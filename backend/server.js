// ============================================
// DAILY EXPENSE TRACKER - SERVER FILE
// ============================================
// This is the main server file that handles:
// - Starting the web server (Express)
// - Handling HTTP requests from the frontend
// - Connecting to the database
// - Managing user authentication
// - Managing expense operations (add, view, edit, delete)

// Import required modules
const express = require('express'); // Web framework for Node.js
const cors = require('cors'); // Allows frontend to communicate with backend (Cross-Origin Resource Sharing)
const path = require('path'); // For handling file paths

// Create an Express application instance
const app = express();

// Define the port number the server will listen on
const PORT = process.env.PORT || 3000;

// ===== SECURITY WARNING =====
// Check if JWT_SECRET is set in environment variables
// In production, ALWAYS set a strong, random JWT_SECRET
if (!process.env.JWT_SECRET) {
    console.warn('⚠️  Warning: JWT_SECRET not set. Using default insecure secret.');
    console.warn('⚠️  Set JWT_SECRET in environment variables for production!');
}

// ===== MIDDLEWARE =====
// Middleware are functions that process requests before they reach your routes

// Enable CORS - allows your frontend (HTML files) to make requests to this server
// Without this, browsers block requests from different origins (security feature)
app.use(cors());

// Parse incoming JSON data from request bodies
// This allows us to access req.body in our routes
app.use(express.json());

// ===== SERVE FRONTEND STATIC FILES =====
// This serves your HTML, CSS, and JavaScript files from the frontend folder
// Now you can access your frontend by visiting http://localhost:3000/login.html
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ===== DEFAULT ROUTE (ROOT) =====
// When someone visits http://localhost:3000/, show the login page
// This makes login.html the default landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});

// ===== IMPORT ROUTES =====
// Import the authentication routes from routes/auth.js
const authRoutes = require('./routes/auth');

// Import the authentication middleware
const authMiddleware = require('./middleware/auth');

// Import the expense routes from routes/expenses.js
const expenseRoutes = require('./routes/expenses');

// Import the summary routes from routes/summary.js
const summaryRoutes = require('./routes/summary');

// Import the dashboard routes from routes/dashboard.js
const dashboardRoutes = require('./routes/dashboard');

// ===== MOUNT ROUTES =====
// Mount the auth routes at /api/auth
// This means all routes in authRoutes will be prefixed with /api/auth
// Example: POST /api/auth/register, POST /api/auth/login
app.use('/api/auth', authRoutes);

// Mount the expense routes at /api/expenses
// This means all routes in expenseRoutes will be prefixed with /api/expenses
// Examples: 
//   POST /api/expenses/add
//   GET /api/expenses
//   GET /api/expenses/:id
//   PUT /api/expenses/:id
//   DELETE /api/expenses/:id
app.use('/api/expenses', expenseRoutes);

// Mount the summary routes at /api/summary
// This provides analytics and reporting endpoints
// Example: GET /api/summary/month?month=2025-12
app.use('/api/summary', summaryRoutes);

// Mount the dashboard routes at /api/dashboard
// This provides comprehensive dashboard data with multi-period views
// Examples: GET /api/dashboard/overview, POST /api/dashboard/set-limit
app.use('/api/dashboard', dashboardRoutes);

// ===== PROTECTED ROUTE EXAMPLE =====
// This is an example of a route that requires authentication
// The authMiddleware checks if the user has a valid JWT token
app.get('/api/protected/hello', authMiddleware, (req, res) => {
    // If we reach here, the user is authenticated
    // req.user contains the user info from the JWT token
    res.json({
        success: true,
        message: `Hello ${req.user.name || req.user.username}!`,
        user: req.user
    });
});

// ===== TEST ROUTE =====
// A simple route to test if the server is running
app.get('/api', (req, res) => {
    res.json({
        message: 'Daily Expense Tracker API is running!',
        endpoints: {
            // Authentication endpoints
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',

            // Expense endpoints (require authentication)
            addExpense: 'POST /api/expenses/add',
            getExpenses: 'GET /api/expenses (optional: ?date=YYYY-MM-DD&category=Food)',
            getExpenseById: 'GET /api/expenses/:id',
            updateExpense: 'PUT /api/expenses/:id',
            deleteExpense: 'DELETE /api/expenses/:id',

            // Summary endpoints (require authentication)
            monthlySummary: 'GET /api/summary/month?month=YYYY-MM',

            // Protected route example
            protectedExample: 'GET /api/protected/hello (requires token)'
        }
    });
});

// ===== START THE SERVER =====
// Start listening for incoming requests
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
    console.log(`📁 Frontend files served from /frontend`);
    console.log(`🔗 API available at http://localhost:${PORT}/api`);
});
