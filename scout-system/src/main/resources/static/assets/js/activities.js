// API Configuration
const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:9090"
    : `${window.location.origin}`;

// Authentication Check
window.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = localStorage.getItem('loggedInUser');

    if (!loggedInUser) {
        window.location.href = 'signIn.html';
        return;
    }

    displayUserInfo();
    loadUserProfilePhoto();
    loadActivities();
});

// Display User Information
function displayUserInfo() {
    const userName = localStorage.getItem('userFullName') || localStorage.getItem('loggedInUser') || 'User';

    const displayFullName = document.getElementById('displayFullName');
    const userInitial = document.getElementById('userInitial');

    if (displayFullName) {
        displayFullName.textContent = userName;
    }

    if (userInitial) {
        userInitial.textContent = userName.charAt(0).toUpperCase();
    }
}




//Load User Profile Photo
async function loadUserProfilePhoto() {
    const username = localStorage.getItem('loggedInUser');

    if (!username) return;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/profile/${username}`);

        if (response.ok) {
            const data = await response.json();

            if (data.profileImage) {
                // Profile image is base64 encoded
                const profilePhotoElement = document.getElementById('sidebarProfilePhoto');

                if (profilePhotoElement) {
                    // Create image element
                    const img = document.createElement('img');
                    img.src = `data:image/jpeg;base64,${data.profileImage}`;
                    img.alt = 'Profile Photo';
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '50%'; // Make it circular

                    // Clear placeholder and add image
                    profilePhotoElement.innerHTML = '';
                    profilePhotoElement.appendChild(img);
                }
            }
        } else {
            console.warn('Profile photo not found, using default icon');
        }
    } catch (error) {
        console.error('Error loading profile photo:', error);
        // Keep default icon if error occurs
    }
}

// Display Current Date
function updateCurrentDate() {
    const now = new Date();
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('en-GB', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }
}

updateCurrentDate();

// Update Statistics
async function updateStatistics() {
    try {
        const [totalResponse, upcomingResponse, completedResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/activities/totalActivity`),
            fetch(`${API_BASE_URL}/activities/upComingActivity`),
            fetch(`${API_BASE_URL}/activities/completedActivity`)
        ]);

        if (!totalResponse.ok || !upcomingResponse.ok || !completedResponse.ok) {
            throw new Error("Failed to fetch statistics");
        }

        const total = await totalResponse.json();
        const upcoming = await upcomingResponse.json();
        const completed = await completedResponse.json();

        document.getElementById("totalActivities").textContent = total;
        document.getElementById("upcomingActivities").textContent = upcoming;
        document.getElementById("completedActivities").textContent = completed;

    } catch (error) {
        document.getElementById("totalActivities").textContent = 0;
        document.getElementById("upcomingActivities").textContent = 0;
        document.getElementById("completedActivities").textContent = 0;
    }
}

// Load Activities
async function loadActivities() {
    const tbody = document.getElementById('activitiesTableBody');
    const noDataMsg = document.getElementById('noActivitiesMessage');

    try {
        const response = await fetch(`${API_BASE_URL}/activities/allActivities`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to load activities'}`);
        }

        const data = await response.json();

        renderActivitiesTable(data);
        await updateStatistics();

    } catch (error) {
        let userMessage = 'Failed to load activities. ';
        if (error.message.includes('Failed to fetch')) {
            userMessage += 'Cannot connect to server.';
        } else if (error.message.includes('404')) {
            userMessage += 'Endpoint not found.';
        } else {
            userMessage += error.message;
        }

        showToast(userMessage, 'error');

        if (tbody) tbody.innerHTML = '';
        if (noDataMsg) noDataMsg.classList.remove('d-none');
    }
}

// Render Activities Table
function renderActivitiesTable(activities) {
    const tbody = document.getElementById("activitiesTableBody");
    const noDataMsg = document.getElementById("noActivitiesMessage");

    if (!tbody) return;

    tbody.innerHTML = "";

    const upcomingActivities = activities.filter(activity => activity.status === 'upcoming');

    if (!upcomingActivities || upcomingActivities.length === 0) {
        if (noDataMsg) noDataMsg.classList.remove("d-none");
        return;
    }

    if (noDataMsg) noDataMsg.classList.add("d-none");

    upcomingActivities.forEach((activity, index) => {
        const tr = document.createElement('tr');
        tr.style.animation = `fadeInUp 0.3s ease ${index * 0.05}s`;
        tr.style.animationFillMode = 'both';

        let formattedDate = 'N/A';
        if (activity.date) {
            try {
                const dateParts = activity.date.split('-');
                if (dateParts.length === 3) {
                    const day = dateParts[0].padStart(2, '0');
                    const month = dateParts[1].padStart(2, '0');
                    const year = dateParts[2];
                    formattedDate = `${day}/${month}/${year}`;
                } else {
                    formattedDate = new Date(activity.date).toLocaleDateString('en-GB');
                }
            } catch (e) {
                formattedDate = activity.date;
            }
        }

        tr.innerHTML = `
            <td class="fw-bold">${activity.id || 'N/A'}</td>
            <td>${activity.name || 'N/A'}</td>
            <td>${formattedDate}</td>
            <td>${activity.location || 'N/A'}</td>
            <td>${activity.description || 'N/A'}</td>
            <td class="text-center">
                <button class="btn btn-outline-success btn-sm finish-btn" data-id="${activity.id}">
                    <i class="bi bi-check-circle me-1"></i>Finish
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// Form Handling
const form = document.getElementById('activityForm');
const inputs = form.querySelectorAll('input, textarea');
const saveBtn = document.getElementById('saveBtn');
const successAlert = document.getElementById('successAlert');

function checkFields() {
    let allFilled = true;
    inputs.forEach(input => {
        if (input.value.trim() === '') allFilled = false;
    });
    saveBtn.disabled = !allFilled;
}

inputs.forEach(input => {
    input.addEventListener('input', () => {
        if (input.value.trim() !== '') {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        } else {
            input.classList.remove('is-valid');
        }
        checkFields();
    });
});

// Add New Activity
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let allValid = true;
    inputs.forEach(input => {
        if (input.value.trim() === '') {
            input.classList.add('is-invalid');
            allValid = false;
        }
    });

    if (!allValid) return;

    saveBtn.disabled = true;
    const originalHTML = saveBtn.innerHTML;
    saveBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Saving...`;

    const dateInput = document.getElementById('date').value;
    const dateObj = new Date(dateInput);
    const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;

    const activityData = {
        name: document.getElementById('activityName').value.trim(),
        date: formattedDate,
        location: document.getElementById('location').value.trim(),
        description: document.getElementById('description').value.trim(),
        status: 'upcoming'
    };

    try {
        const response = await fetch(`${API_BASE_URL}/activities/addActivity`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(activityData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to add activity: ${errorText}`);
        }

        const result = await response.json();

        form.reset();
        inputs.forEach(input => input.classList.remove('is-valid', 'is-invalid'));
        checkFields();

        saveBtn.classList.replace("btn-primary", "btn-success");
        saveBtn.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i>Saved!`;

        successAlert.textContent = `✅ Activity "${result.name || 'New Activity'}" added successfully!`;
        successAlert.classList.remove('d-none');

        showToast(`Activity "${result.name || 'New Activity'}" added successfully!`, 'success');

        await loadActivities();

        setTimeout(() => {
            saveBtn.classList.replace("btn-success", "btn-primary");
            saveBtn.innerHTML = originalHTML;
            successAlert.classList.add('d-none');
            saveBtn.disabled = false;
        }, 2000);

    } catch (error) {
        showToast(error.message || 'Failed to add activity', 'error');
        saveBtn.innerHTML = originalHTML;
        saveBtn.disabled = false;
    }
});

// Delete Activity
const activityIdInput = document.getElementById('activityId');
const removeBtn = document.getElementById('removeBtn');
const removeAlert = document.getElementById('removeAlert');

activityIdInput.addEventListener('input', () => {
    const value = activityIdInput.value.trim();
    const isValid = /^[0-9]+$/.test(value) && Number(value) > 0;

    removeBtn.disabled = !isValid;
    activityIdInput.classList.toggle('is-valid', isValid);
    activityIdInput.classList.toggle('is-invalid', !isValid && value !== '');
});

removeBtn.addEventListener('click', async () => {
    const activityId = activityIdInput.value.trim();
    if (!activityId) return;

    removeBtn.disabled = true;
    const originalHTML = removeBtn.innerHTML;
    removeBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Removing...`;

    try {
        const response = await fetch(`${API_BASE_URL}/activities/delete/${activityId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Activity with ID ${activityId} not found`);
            }
            const errorText = await response.text();
            throw new Error(`Failed to delete activity: ${errorText}`);
        }

        removeBtn.classList.replace("btn-danger", "btn-success");
        removeBtn.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i>Removed!`;

        removeAlert.innerHTML = `
            <i class="bi bi-check-circle-fill me-2"></i>
            Activity (ID: ${activityId}) removed successfully!
        `;
        removeAlert.classList.remove('d-none');

        showToast(`Activity ID ${activityId} removed!`, 'success');

        await loadActivities();

        setTimeout(() => {
            removeBtn.classList.replace("btn-success", "btn-danger");
            removeBtn.innerHTML = originalHTML;
            activityIdInput.value = "";
            activityIdInput.classList.remove('is-valid');
            removeAlert.classList.add('d-none');
            removeBtn.disabled = false;
        }, 2000);

    } catch (error) {
        showToast(error.message, 'error');
        removeBtn.innerHTML = originalHTML;
        removeBtn.disabled = false;
        activityIdInput.classList.add('is-invalid');
    }
});

// Finish Activity (Mark as Completed)
document.getElementById('activitiesTable').addEventListener('click', async (e) => {
    const finishBtn = e.target.closest('.finish-btn');
    if (!finishBtn) return;

    const activityId = finishBtn.dataset.id;
    const row = finishBtn.closest('tr');
    const activityName = row.cells[1].textContent;

    finishBtn.disabled = true;
    const originalHTML = finishBtn.innerHTML;
    finishBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Finishing...`;

    try {
        const response = await fetch(`${API_BASE_URL}/activities/completed/${activityId}`, {
            method: "POST"
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to complete activity");
        }

        row.style.transition = 'opacity 0.5s ease';
        row.style.opacity = '0';

        setTimeout(async () => {
            await loadActivities();
            showToast(`"${activityName}" marked as completed!`, 'success');
        }, 600);

    } catch (error) {
        showToast(error.message, 'error');
        finishBtn.disabled = false;
        finishBtn.innerHTML = originalHTML;
    }
});

// Export PDF
const exportPdfBtn = document.getElementById('exportPdfBtn');

exportPdfBtn.addEventListener('click', async () => {
    const { jsPDF } = window.jspdf;

    if (!jsPDF) {
        showToast('PDF library not loaded. Please refresh.', 'error');
        return;
    }

    exportPdfBtn.disabled = true;
    const originalHTML = exportPdfBtn.innerHTML;
    exportPdfBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Generating...`;

    try {
        await generatePDF();
        showToast('PDF exported successfully!', 'success');
    } catch (error) {
        showToast(error.message || 'Failed to export PDF', 'error');
    } finally {
        exportPdfBtn.innerHTML = originalHTML;
        exportPdfBtn.disabled = false;
    }
});

async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const response = await fetch(`${API_BASE_URL}/activities/allActivities`);
    if (!response.ok) throw new Error('Failed to fetch activities');
    const allData = await response.json();

    const data = allData.filter(activity => activity.status === 'upcoming');

    if (!data || data.length === 0) {
        throw new Error('No upcoming activities found to export');
    }

    let logo = null;
    try {
        logo = await loadImage('assets/img/lg-pdf.png');
    } catch (error) {
        // Logo loading failed silently
    }

    if (logo) {
        try {
            const imgWidth = 25;
            const imgHeight = 25;
            const logoX = pageWidth - imgWidth - 14;
            const logoY = 13;
            doc.addImage(logo, 'PNG', logoX, logoY, imgWidth, imgHeight);
        } catch (error) {
            // Failed to add logo
        }
    }

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text("Scout Manager", pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(16);
    doc.text("Upcoming Activities Report", pageWidth / 2, 30, { align: 'center' });

    const date = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Africa/Cairo'
    });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Generated: ${date}`, 14, 37);
    doc.text(`Upcoming Activities: ${data.length}`, 14, 42);

    doc.setTextColor(0);
    doc.setDrawColor(200);
    doc.line(14, 45, pageWidth - 14, 45);

    const tableData = data.map(activity => [
        activity.id || 'N/A',
        activity.name || 'N/A',
        activity.date || 'N/A',
        activity.location || 'N/A',
        activity.description || 'N/A'
    ]);

    doc.autoTable({
        head: [['ID', 'Activity Name', 'Date', 'Location', 'Description']],
        body: tableData,
        startY: 50,
        theme: 'grid',
        headStyles: {
            fillColor: [13, 110, 253],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 10
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
            overflow: 'linebreak',
            halign: 'left'
        },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 45 },
            2: { cellWidth: 30, halign: 'center' },
            3: { cellWidth: 35 },
            4: { cellWidth: 'auto' }
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        }
    });

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const footerY = pageHeight - 10;
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, footerY, { align: 'center' });
        doc.text('Scout Manager © 2025', 14, footerY);
        doc.setTextColor(0);
    }

    const cairoDate = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Cairo' });
    const [day, month, year] = cairoDate.split(',')[0].split('/');
    const timestamp = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const filename = `Upcoming_Activities_Report_${timestamp}.pdf`;

    doc.save(filename);
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
}

// Toast Notification
function showToast(message, type = 'success') {
    let toast = document.getElementById('activitiesToast');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'activitiesToast';
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            min-width: 300px; padding: 15px 20px;
            border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999; display: flex; align-items: center; gap: 10px;
            font-weight: 500; animation: slideInRight 0.3s ease;
        `;
        document.body.appendChild(toast);
    }

    if (type === 'success') {
        toast.style.backgroundColor = '#d1e7dd';
        toast.style.color = '#0f5132';
        toast.style.border = '1px solid #badbcc';
        toast.innerHTML = `
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
            <span>${message}</span>
        `;
    } else {
        toast.style.backgroundColor = '#f8d7da';
        toast.style.color = '#842029';
        toast.style.border = '1px solid #f5c2c7';
        toast.innerHTML = `
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
            <span>${message}</span>
        `;
    }

    toast.style.display = 'flex';

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, 3000);
}

// Sign Out with API Session Invalidation
const signOutBtn = document.getElementById('signOutBtn');
const signOutText = document.getElementById('signOutText');
const signOutSpinner = document.getElementById('signOutSpinner');

signOutBtn.addEventListener('click', async function (e) {
    e.preventDefault();

    signOutBtn.classList.add('bg-danger', 'text-white');
    signOutText.textContent = 'Signing out...';
    signOutSpinner.style.display = 'inline-block';
    signOutBtn.style.pointerEvents = 'none';

    try {
        const API_AUTH_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
            ? "http://localhost:9090"
            : window.location.origin;

        // Call the logout endpoint to invalidate session
        const response = await fetch(`${API_AUTH_URL}/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Logout request failed');
        }

        const result = await response.json();

        if (result.success) {
            // Clear local storage
            localStorage.clear();

            // Show success message briefly
            signOutText.textContent = 'Logged out successfully!';

            // Redirect to sign-in page
            setTimeout(() => {
                window.location.href = 'signIn.html';
            }, 500);
        } else {
            throw new Error(result.error || 'Logout failed');
        }

    } catch (error) {
        console.error('Logout error:', error);

        // Even if API call fails, clear local storage and redirect
        // This ensures the user can still log out from the frontend
        localStorage.clear();

        // Show error toast if the function exists
        if (typeof showToast === 'function') {
            showToast('Session ended. Redirecting...', 'error');
        }

        setTimeout(() => {
            window.location.href = 'signIn.html';
        }, 1000);
    }
});

// CSS Animations
if (!document.getElementById('toastStyles')) {
    const style = document.createElement('style');
    style.id = 'toastStyles';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
}