// ============================================
// EDIT AND DELETE LIMIT FUNCTIONS
// ============================================

// Edit limit function
function editLimit(id, period, category, currentAmount) {
    // Pre-fill the modal with existing values
    document.getElementById('limitPeriod').value = period;
    document.getElementById('limitCategory').value = category;
    document.getElementById('limitAmount').value = currentAmount;

    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('limitModal'));
    modal.show();

    // Change modal title
    document.querySelector('#limitModal .modal-title').textContent = '✏️ Edit Spending Limit';
}

// Delete limit function
async function deleteLimit(id) {
    if (!confirm('Are you sure you want to delete this spending limit?')) {
        return;
    }

    const token = localStorage.getItem('expense_token');

    showSpinner('Deleting limit...');

    try {
        const res = await fetch(`/api/dashboard/limit/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();
        hideSpinner();

        if (data.success) {
            alert('✅ Limit deleted successfully!');

            // Reload dashboard
            loadDashboard();
        } else {
            alert(data.message || 'Failed to delete limit');
        }
    } catch (err) {
        hideSpinner();
        console.error('Delete limit error:', err);
        alert('Failed to delete limit');
    }
}
