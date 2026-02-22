// ============================================
// DASHBOARD JAVASCRIPT
// ============================================
// This file handles the dashboard functionality:
// - Fetching expense summary data from the API
// - Populating summary cards with data
// - Creating and updating Chart.js visualizations

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get JWT token from localStorage
 * The token is saved here when the user logs in
 * @returns {string|null} JWT token or null if not found
 */
function getToken() {
    return localStorage.getItem('expense_token');
}

/**
 * Fill the month selector dropdown with recent months
 * Creates options for the current month and 11 previous months
 */
function fillMonthSelect() {
    const sel = document.getElementById('monthSelect');
    const now = new Date();

    // Generate 12 months (current + 11 previous)
    for (let i = 0; i < 12; i++) {
        // Create a date for each month
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

        // Format as YYYY-MM (e.g., "2025-12")
        const month = d.toISOString().slice(0, 7);

        // Create option element
        const opt = document.createElement('option');
        opt.value = month;
        opt.textContent = month;
        sel.appendChild(opt);
    }

    // Set current month as default selected
    sel.value = now.toISOString().slice(0, 7);
}

// ============================================
// DATA FETCHING AND RENDERING
// ============================================

/**
 * Fetch summary data from API and update the dashboard
 * This is the main function that:
 * 1. Gets the JWT token
 * 2. Fetches summary data for the selected month
 * 3. Updates the summary cards
 * 4. Draws the charts
 */
async function loadSummary() {
    // Get JWT token from localStorage
    const token = getToken();

    // Check if user is logged in
    if (!token) {
        alert('Not logged in. Please login first.');
        // Optionally redirect to login page
        // window.location.href = 'login.html';
        return;
    }

    // Get selected month from dropdown
    const monthSelect = document.getElementById('monthSelect');
    const month = monthSelect ? monthSelect.value : '';

    // Validate that month parameter exists
    if (!month) {
        console.error('Month selector not ready or has no value');
        return;
    }

    try {
        // ===== FETCH DATA FROM API =====
        // Make GET request to summary endpoint
        const res = await fetch(`/api/summary/month?month=${month}`, {
            headers: {
                'Authorization': `Bearer ${token}` // Send JWT token for authentication
            }
        });

        // Parse JSON response
        const data = await res.json();

        // Check if request was successful
        if (!data.success) {
            alert('Failed to load summary: ' + (data.message || 'unknown error'));
            return;
        }

        // ===== UPDATE SUMMARY CARDS =====
        // Update total amount card
        document.getElementById('totalAmount').textContent =
            `₹${Number(data.total || 0).toFixed(2)}`;

        // Update category count card
        document.getElementById('categoryCount').textContent =
            (data.byCategory || []).length;

        // Update transaction days count card
        document.getElementById('daysCount').textContent =
            (data.byDay || []).length;

        // ===== PREPARE DATA FOR CHARTS =====

        // Pie Chart Data: Categories
        // Extract category names and totals from the response
        const catLabels = (data.byCategory || []).map(r => r.category || 'Unknown');
        const catData = (data.byCategory || []).map(r => Number(r.total));

        // Bar Chart Data: Daily spending
        // Extract dates and totals from the response
        const dayLabels = (data.byDay || []).map(r => r.date);
        const dayData = (data.byDay || []).map(r => Number(r.total));

        // ===== DRAW CHARTS =====
        // Create or update the pie chart
        drawPie('pieChart', catLabels, catData);

        // Create or update the bar chart
        drawBar('barChart', dayLabels, dayData);

    } catch (e) {
        // Handle network errors or other exceptions
        console.error('loadSummary error', e);
        alert('Failed to load summary. Please check your connection and try again.');
    }
}

// ============================================
// CHART.JS VISUALIZATION
// ============================================

// Store chart instances globally so we can update/destroy them
let pieInstance = null;
let barInstance = null;

/**
 * Draw or update a pie chart showing spending by category
 * @param {string} canvasId - ID of the canvas element
 * @param {Array} labels - Category names
 * @param {Array} data - Amounts for each category
 */
function drawPie(canvasId, labels, data) {
    // Get the canvas element and its 2D context
    const ctx = document.getElementById(canvasId).getContext('2d');

    // If a chart already exists, destroy it before creating a new one
    // This prevents memory leaks and ensures clean updates
    if (pieInstance) {
        pieInstance.destroy();
    }

    // Create new pie chart
    pieInstance = new Chart(ctx, {
        type: 'pie', // Chart type
        data: {
            labels, // Category names
            datasets: [{
                data, // Amounts
                // Chart.js will automatically assign colors
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                ]
            }]
        },
        options: {
            responsive: true, // Chart resizes with container
            plugins: {
                legend: {
                    position: 'bottom' // Show legend at bottom
                },
                tooltip: {
                    callbacks: {
                        // Format tooltip to show currency
                        label: function (context) {
                            return context.label + ': ₹' + context.parsed.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Draw or update a bar chart showing daily spending
 * @param {string} canvasId - ID of the canvas element
 * @param {Array} labels - Dates
 * @param {Array} data - Amounts for each date
 */
function drawBar(canvasId, labels, data) {
    // Get the canvas element and its 2D context
    const ctx = document.getElementById(canvasId).getContext('2d');

    // If a chart already exists, destroy it before creating a new one
    if (barInstance) {
        barInstance.destroy();
    }

    // Create new bar chart
    barInstance = new Chart(ctx, {
        type: 'bar', // Chart type
        data: {
            labels, // Dates
            datasets: [{
                label: 'Amount (₹)', // Label for the dataset
                data, // Amounts
                backgroundColor: '#36A2EB', // Bar color
                borderColor: '#2E86C1',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true, // Chart resizes with container
            scales: {
                y: {
                    beginAtZero: true, // Y-axis starts at 0
                    ticks: {
                        // Format Y-axis labels as currency
                        callback: function (value) {
                            return '₹' + value;
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // Hide legend for bar chart
                },
                tooltip: {
                    callbacks: {
                        // Format tooltip to show currency
                        label: function (context) {
                            return 'Amount: ₹' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// ============================================
// EVENT LISTENERS
// ============================================

// Wait for the DOM to be fully loaded before running code
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the month selector dropdown FIRST
    fillMonthSelect();

    // Small delay to ensure month selector is populated
    // Then load summary data for the current month
    setTimeout(() => {
        loadSummary();
    }, 100);

    // Add click event to refresh button
    document.getElementById('refreshBtn').addEventListener('click', loadSummary);

    // Add change event to month selector
    // When user selects a different month, reload the summary
    document.getElementById('monthSelect').addEventListener('change', loadSummary);
});

console.log('Dashboard script loaded successfully!');
