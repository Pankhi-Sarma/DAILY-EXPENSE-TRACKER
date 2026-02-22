// ============================================
// DATABASE CONNECTION FILE
// ============================================
// This file handles:
// - Connecting to SQLite database
// - Creating database tables (users, expenses)
// - Exporting database connection for use in server.js

// Import the sqlite3 library
// sqlite3 is a Node.js module that allows us to work with SQLite databases
const sqlite3 = require('sqlite3').verbose();

// Import the path module to handle file paths correctly across different operating systems
const path = require('path');

// Define the path to the database file
// __dirname is the current directory (backend folder)
// We go up one level (..) and then into the database folder
const dbPath = path.join(__dirname, '../database/expenses.db');

// Create a new database connection
// This will create the expenses.db file if it doesn't exist
// If it exists, it will connect to the existing database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        // If there's an error connecting to the database, log it
        console.error('Error connecting to database:', err.message);
    } else {
        // If connection is successful, log success message
        console.log('Connected to SQLite database');
    }
});

// Create the users and expenses tables
// serialize() ensures that database operations run in sequence (one after another)
db.serialize(() => {
    // Create users table if it doesn't already exist
    // IF NOT EXISTS prevents errors if the table already exists
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            username TEXT UNIQUE,
            password TEXT,
            created_at TEXT
        )
    `, (err) => {
        if (err) {
            // If there's an error creating the table, log it
            console.error('Error creating users table:', err.message);
        } else {
            // If table creation is successful, log success message
            console.log('Users table ready');
        }
    });

    // Create expenses table to store user expense records
    // Each expense is linked to a user via user_id (foreign key relationship)
    db.run(`
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            date TEXT,
            category TEXT,
            amount REAL,
            note TEXT
        )
    `, (err) => {
        if (err) {
            // If there's an error creating the table, log it
            console.error('Error creating expenses table:', err.message);
        } else {
            // If table creation is successful, log success message
            console.log('Expenses table ready');
        }
    });

    // Create spending_limits table to store user-defined expense limits
    // Users can set limits for different time periods (daily, weekly, monthly, yearly)
    // and optionally for specific categories
    db.run(`
        CREATE TABLE IF NOT EXISTS spending_limits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            period TEXT NOT NULL,
            category TEXT,
            limit_amount REAL NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(user_id, period, category)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating spending_limits table:', err.message);
        } else {
            console.log('Spending limits table ready');
        }
    });
});

// Print initialization message
console.log('Database initialized');

// Export the database connection so other files can use it
// This allows server.js and other files to import and use this database connection
module.exports = db;
