// Student Module - Handle complaint submission and student dashboard
// API_URL is declared in auth.js
const apiUrl = window.API_URL || 'http://localhost:5000/api';

class ComplaintManager {
  async submitComplaint(formData) {
    try {
      const response = await fetch(`${apiUrl}/complaints`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
        },
        body: formData, // FormData handles multipart/form-data
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit complaint');
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getMyComplaints() {
    try {
      const response = await fetch(`${apiUrl}/complaints/my`, {
        method: 'GET',
        headers: auth.getAuthHeader(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch complaints');
      }

      return { success: true, data: data.complaints };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

const complaintManager = new ComplaintManager();

// Handle complaint form submission
// Handle complaint form submission
function handleComplaintSubmit(event) {
  event.preventDefault();
  console.log('Handling complaint submission...');

  // 1. Check Authentication
  if (!auth || !auth.token) {
    alert('Authentication Error: You are not logged in. Redirecting to login.');
    window.location.href = 'login.html';
    return;
  }

  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const location = document.getElementById('location').value.trim();
  const category = document.getElementById('category').value;
  const photoInput = document.getElementById('photo');

  console.log('Form Data:', { title, description, location, category });

  // 2. Validation
  if (!title || !description || !location || !category) {
    alert('Please fill in all required fields (Title, Description, Location, Category).');
    return;
  }

  // Create FormData for multipart/form-data
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('location', location);
  formData.append('category', category);

  // Add photo if selected
  if (photoInput.files.length > 0) {
    formData.append('photo', photoInput.files[0]);
  }

  // 3. Submit complaint
  complaintManager.submitComplaint(formData)
    .then(result => {
      console.log('API Response:', result);

      if (result.success) {
        // Success Case
        window.scrollTo(0, 0);
        showAlert('Complaint submitted successfully! Redirecting...', 'success');

        // Native alert for user confirmation
        setTimeout(() => {
          alert('SUCCESS: Complaint submitted! Click OK to view Dashboard.');
          window.location.href = 'dashboard.html';
        }, 500);
      } else {
        // Failure Case
        console.error('Submission Failed:', result.error);
        showAlert(result.error, 'danger');
        alert('ERROR: Failed to submit complaint.\nReason: ' + result.error);
      }
    })
    .catch(err => {
      // Network/Unexpected Error
      console.error('Network Error:', err);
      alert('CRITICAL ERROR: ' + err.message);
    });
}

// Preview photo before upload
function previewPhoto(event) {
  const file = event.target.files[0];
  const previewContainer = document.getElementById('photoPreview');

  if (!file) {
    previewContainer.innerHTML = '';
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showAlert('Please select a valid image file', 'danger');
    event.target.value = '';
    previewContainer.innerHTML = '';
    return;
  }

  // Validate file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    showAlert('Image size should be less than 5MB', 'danger');
    event.target.value = '';
    previewContainer.innerHTML = '';
    return;
  }

  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewContainer.innerHTML = `<div class="file-preview">
      <img src="${e.target.result}" alt="Preview">
      <p class="text-muted mt-1">${file.name}</p>
    </div>`;
  };
  reader.readAsDataURL(file);
}

// Load and display complaints on dashboard
async function loadComplaints() {
  const complaintsList = document.getElementById('complaintsList');

  if (!complaintsList) return;

  // Show loading state
  complaintsList.innerHTML = '<div class="loading"><div class="spinner"></div> Loading complaints...</div>';

  console.log('Fetching complaints...');
  const result = await complaintManager.getMyComplaints();
  console.log('Fetch Result:', result);

  if (result.success) {
    const complaints = result.data;

    if (complaints.length === 0) {
      console.warn('No complaints found for this user.');
      complaintsList.innerHTML = `
        <div class="no-data">
          <div class="empty-state-icon">📋</div>
          <p>No complaints found.</p>
          <p class="text-muted">Submitted complaints should appear here.</p>
          <a href="complaint_form.html" class="btn btn-primary mt-3">Submit Complaint</a>
        </div>
      `;
      return;
    }

    complaintsList.innerHTML = complaints.map(complaint => `
      <div class="complaint-card ${complaint.status.toLowerCase().replace('-', '-')}">
        <div class="complaint-header">
          <div>
            <h3 class="complaint-title">${escapeHtml(complaint.title)}</h3>
            <div class="mt-1">
              <span class="badge badge-${complaint.status.toLowerCase().replace('-', '-')}">${complaint.status}</span>
              <span class="badge badge-${complaint.priority ? complaint.priority.toLowerCase() : 'medium'}">${complaint.priority || 'Medium'}</span>
            </div>
          </div>
        </div>

        <div class="complaint-details">
          <div class="detail-item">
            <div class="detail-label">📍 Location</div>
            <div class="detail-value">${escapeHtml(complaint.location)}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">🏷️ Category</div>
            <div class="detail-value">${complaint.category}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">📅 Submitted</div>
            <div class="detail-value">${new Date(complaint.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div class="detail-item">
          <div class="detail-label">📝 Description</div>
          <div class="detail-value">${escapeHtml(complaint.description)}</div>
        </div>

        ${complaint.photo ? `
          <div class="complaint-photo">
            <img src="http://localhost:5000/uploads/${complaint.photo}" alt="Complaint photo">
          </div>
        ` : ''}

        ${complaint.remarks ? `
          <div class="detail-item mt-2">
            <div class="detail-label">💬 Admin Remarks</div>
            <div class="detail-value">${escapeHtml(complaint.remarks)}</div>
          </div>
        ` : ''}

        <div class="complaint-actions">
          <button onclick="viewComplaintDetails('${complaint._id}')" class="btn btn-sm btn-secondary">
            View Details
          </button>
        </div>
      </div>
    `).join('');
  } else {
    complaintsList.innerHTML = `<div class="no-data">❌ Error loading complaints: ${result.error}</div>`;
  }
}

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

// View complaint details (can be extended)
function viewComplaintDetails(complaintId) {
  showAlert(`Viewing complaint: ${complaintId}`, 'info', 3000);
  // Can implement a modal view here
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
  loadComplaints();
});
