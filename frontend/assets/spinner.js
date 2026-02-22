// ============================================
// LOADING SPINNER UTILITIES
// ============================================
// Reusable functions for showing/hiding loading spinners

/**
 * Show full-screen loading spinner
 * @param {string} message - Optional message to display
 */
function showSpinner(message = 'Loading...') {
    // Check if spinner already exists
    let spinner = document.getElementById('globalSpinner');

    if (!spinner) {
        // Create spinner overlay
        spinner = document.createElement('div');
        spinner.id = 'globalSpinner';
        spinner.className = 'spinner-overlay';
        spinner.innerHTML = `
            <div class="spinner-container">
                <div class="spinner"></div>
                <p class="spinner-text">${message}</p>
            </div>
        `;
        document.body.appendChild(spinner);
    } else {
        // Update message if spinner exists
        const textElement = spinner.querySelector('.spinner-text');
        if (textElement) {
            textElement.textContent = message;
        }
        spinner.classList.remove('d-none');
    }
}

/**
 * Hide full-screen loading spinner
 */
function hideSpinner() {
    const spinner = document.getElementById('globalSpinner');
    if (spinner) {
        spinner.classList.add('d-none');
    }
}

/**
 * Show inline spinner in a button
 * @param {HTMLElement} button - Button element
 * @param {string} originalText - Original button text to restore later
 */
function showButtonSpinner(button, originalText) {
    button.disabled = true;
    button.setAttribute('data-original-text', originalText || button.textContent);
    button.innerHTML = '<span class="btn-spinner"></span> Loading...';
}

/**
 * Hide inline spinner in a button
 * @param {HTMLElement} button - Button element
 */
function hideButtonSpinner(button) {
    button.disabled = false;
    const originalText = button.getAttribute('data-original-text');
    if (originalText) {
        button.textContent = originalText;
        button.removeAttribute('data-original-text');
    }
}

/**
 * Show loading state in a table
 * @param {string} tableBodyId - ID of the table body element
 * @param {number} colspan - Number of columns to span
 * @param {string} message - Loading message
 */
function showTableSpinner(tableBodyId, colspan = 5, message = 'Loading data...') {
    const tbody = document.getElementById(tableBodyId);
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="${colspan}" class="table-loading">
                    <div class="spinner"></div>
                    <p>${message}</p>
                </td>
            </tr>
        `;
    }
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showSpinner,
        hideSpinner,
        showButtonSpinner,
        hideButtonSpinner,
        showTableSpinner
    };
}
