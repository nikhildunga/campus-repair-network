// API_URL is defined in auth.js and exposed globally via window.API_URL
// We use a local variable with fallback to ensure it works even if loading order varies
const apiUrl = window.API_URL || 'http://localhost:5000/api';

class AdminManager {
  async getAllComplaints() {
    try {
      console.log('Fetching all complaints using API_URL:', apiUrl);
      console.log('Auth Header:', auth.getAuthHeader());

      const response = await fetch(`${apiUrl}/complaints`, {
        method: 'GET',
        headers: auth.getAuthHeader(),
      });

      console.log('Response Status:', response.status);

      if (response.status === 401) {
        console.warn('Unauthorized (401), redirecting to login...');
        window.location.href = 'admin_login.html';
        return { success: false, error: 'Unauthorized' };
      }

      const data = await response.json();
      console.log('Response Data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch complaints');
      }

      return { success: true, data: data.complaints };
    } catch (error) {
      console.error('getAllComplaints Error:', error);
      return { success: false, error: error.message };
    }
  }

  async getStats() {
    try {
      const response = await fetch(`${apiUrl}/complaints/stats/dashboard`, {
        method: 'GET',
        headers: auth.getAuthHeader(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch stats');
      }

      return { success: true, data: data.stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateComplaint(complaintId, updates) {
    try {
      const response = await fetch(`${apiUrl}/complaints/${complaintId}`, {
        method: 'PUT',
        headers: auth.getAuthHeader(),
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update complaint');
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteComplaint(complaintId) {
    try {
      const response = await fetch(`${apiUrl}/complaints/${complaintId}`, {
        method: 'DELETE',
        headers: auth.getAuthHeader(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete complaint');
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

const adminManager = new AdminManager();

// Load and display dashboard statistics
async function loadDashboardStats() {
  const result = await adminManager.getStats();

  console.log('Dashboard Stats Result:', result);

  if (result.success) {
    const stats = result.data;
    document.getElementById('totalCount').textContent = stats.total;
    document.getElementById('pendingCount').textContent = stats.pending;
    document.getElementById('inProgressCount').textContent = stats.inProgress;
    document.getElementById('completedCount').textContent = stats.completed;
  } else {
    console.error('Stats Error:', result.error);
    showAlert('Failed to load statistics', 'danger');
  }
}

// Load and display all complaints in table
async function loadAllComplaints() {
  const complaintsList = document.getElementById('complaintsList');

  if (!complaintsList) return;

  // Show loading state
  complaintsList.innerHTML = '<tr><td colspan="8" class="text-center"><div class="loading"><div class="spinner"></div> Loading complaints...</div></td></tr>';

  const result = await adminManager.getAllComplaints();

  console.log('Admin Get Complaints Result:', result);

  if (result.success) {
    const complaints = result.data;
    console.log('Complaints fetched:', complaints);

    if (complaints.length === 0) {
      complaintsList.innerHTML = '<tr><td colspan="8" class="text-center">No complaints found</td></tr>';
      return;
    }

    complaintsList.innerHTML = complaints.map(complaint => `
      <tr>
        <td>${escapeHtml(complaint.title || 'Untitled')}</td>
        <td>${complaint.category || 'Uncategorized'}</td>
        <td>${escapeHtml(complaint.studentEmail || 'Unknown')}</td>
        <td>${escapeHtml(complaint.location || 'Unknown')}</td>
        <td><span class="badge badge-${(complaint.status || 'pending').toLowerCase().replace('-', '-')}">${complaint.status || 'Pending'}</span></td>
        <td><span class="badge badge-${complaint.priority ? complaint.priority.toLowerCase() : 'medium'}">${complaint.priority || 'Medium'}</span></td>
        <td>${complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'N/A'}</td>
        <td>
          <button onclick="openEditModal('${complaint._id}')" class="btn btn-sm btn-primary">Edit</button>
          <button onclick="deleteComplaint('${complaint._id}')" class="btn btn-sm btn-danger">Delete</button>
        </td>
      </tr>
    `).join('');
  } else {
    complaintsList.innerHTML = `<tr><td colspan="8" class="text-center">Error loading complaints: ${result.error}</td></tr>`;
  }
}

// Open edit modal for complaint
async function openEditModal(complaintId) {
  const result = await adminManager.getAllComplaints();

  if (result.success) {
    const complaint = result.data.find(c => c._id === complaintId);

    if (complaint) {
      document.getElementById('editComplaintId').value = complaintId;
      document.getElementById('editStatus').value = complaint.status;
      document.getElementById('editPriority').value = complaint.priority || 'Medium';
      document.getElementById('editRemarks').value = complaint.remarks || '';

      // Display complaint details
      const detailsDiv = document.getElementById('complaintDetails');
      detailsDiv.innerHTML = `
        <div class="mb-3">
          <strong>Title:</strong> ${escapeHtml(complaint.title)}<br>
          <strong>Description:</strong> ${escapeHtml(complaint.description)}<br>
          <strong>Location:</strong> ${escapeHtml(complaint.location)}<br>
          <strong>Category:</strong> ${complaint.category}<br>
          <strong>Student:</strong> ${escapeHtml(complaint.studentName)} (${escapeHtml(complaint.studentEmail)})
        </div>
      `;

      openModal('editModal');
    }
  }
}

// Update complaint
async function updateComplaint() {
  const complaintId = document.getElementById('editComplaintId').value;
  const status = document.getElementById('editStatus').value;
  const priority = document.getElementById('editPriority').value;
  const remarks = document.getElementById('editRemarks').value;

  const result = await adminManager.updateComplaint(complaintId, {
    status,
    priority,
    remarks,
  });

  if (result.success) {
    showAlert('Complaint updated successfully', 'success');
    closeModal('editModal');
    loadAllComplaints();
    loadDashboardStats();
  } else {
    showAlert(result.error, 'danger');
  }
}

// Delete complaint
async function deleteComplaint(complaintId) {
  if (!confirm('Are you sure you want to delete this complaint?')) {
    return;
  }

  const result = await adminManager.deleteComplaint(complaintId);

  if (result.success) {
    showAlert('Complaint deleted successfully', 'success');
    loadAllComplaints();
    loadDashboardStats();
  } else {
    showAlert(result.error, 'danger');
  }
}

// Modal functions
function openModal(modalId) {
  document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('show');
}

// Close modal on outside click
window.addEventListener('click', (event) => {
  if (event.target.classList.contains('modal')) {
    event.target.classList.remove('show');
  }
});

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Filter complaints by status
function filterByStatus(status) {
  const rows = document.querySelectorAll('#complaintsList tr');

  rows.forEach(row => {
    if (status === 'all') {
      row.style.display = '';
    } else {
      const statusCell = row.cells[4]?.textContent;
      row.style.display = statusCell?.includes(status) ? '' : 'none';
    }
  });
}

// Filter complaints by category
function filterByCategory(category) {
  const rows = document.querySelectorAll('#complaintsList tr');

  rows.forEach(row => {
    if (category === 'all') {
      row.style.display = '';
    } else {
      const categoryCell = row.cells[1]?.textContent;
      row.style.display = categoryCell?.includes(category) ? '' : 'none';
    }
  });
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
  loadDashboardStats();
  loadAllComplaints();

  // Refresh data every 30 seconds
  setInterval(() => {
    loadDashboardStats();
    loadAllComplaints();
  }, 30000);
});
