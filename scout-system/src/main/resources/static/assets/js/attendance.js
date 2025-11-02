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
    fetchTodayAttendance();
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


// Load User Profile Photo
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

// API Endpoints for Categories
const API_ENDPOINTS = {
    ALL_TODAY: '/attendance/allAttendancePerToday',
    SCOUTS_GUIDES: '/attendance/scouts-and-guides',
    CUBS_BLOSSOMS: '/attendance/cubs-and-blossoms',
    BUDS: '/attendance/buds'
};

// Fetch Today's Attendance from Backend
async function fetchTodayAttendance() {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ALL_TODAY}`);

        if (!response.ok) {
            throw new Error('Failed to fetch attendance data');
        }

        const attendances = await response.json();

        populateAttendanceTable(attendances);
        updateStatistics();
        checkTableData();

    } catch (error) {
        console.error('Error fetching attendance:', error);
        showNoResults(true);
        document.querySelector('#noDataMessage p').textContent = 'Failed to load attendance data. Please try again.';
    }
}

// Populate Attendance Table
function populateAttendanceTable(attendances) {
    const tbody = document.querySelector('#attendanceTable tbody');
    tbody.innerHTML = '';

    if (attendances.length === 0) {
        showNoResults(true);
        document.querySelector('#noDataMessage p').textContent = 'No attendance records for today';
        return;
    }

    attendances.forEach(attendance => {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';

        const date = formatDate(attendance.dateOfDay);
        const categoryBadge = getCategoryBadge(attendance.category);
        const statusPill = getStatusPill(attendance.status);

        row.innerHTML = `
            <td>${date}</td>
            <td>${attendance.memberCode}</td>
            <td>${attendance.fullName}</td>
            <td>${categoryBadge}</td>
            <td>${statusPill}</td>
        `;

        row.addEventListener('click', function () {
            document.querySelectorAll('#attendanceTable tbody tr').forEach(r => r.classList.remove('table-active'));
            this.classList.add('table-active');
        });

        tbody.appendChild(row);
    });

    showNoResults(false);
    animateTableRows();
}

// Get Category Badge HTML
function getCategoryBadge(category) {
    const categoryMap = {
        'Scouts and Guides': 'category-scout',
        'Cubs and Blossoms': 'category-leader',
        'Buds': 'category-volunteer'
    };

    const badgeClass = categoryMap[category] || 'category-scout';
    return `<span class="category-badge ${badgeClass}">${category}</span>`;
}

// Get Status Pill HTML
function getStatusPill(status) {
    const statusClass = status.toLowerCase() === 'present' ? 'status-present' : 'status-absent';
    return `<span class="status-pill ${statusClass}">${status}</span>`;
}

// Format Date
function formatDate(dateString) {
    if (!dateString) return 'N/A';

    try {
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);

        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

// Elements
const searchInput = document.getElementById("searchInput");
const exportPdfBtn = document.getElementById("exportPdfBtn");
const exportScoutsGuidesBtn = document.getElementById("exportScoutsGuidesBtn");
const exportCubsBtn = document.getElementById("exportCubsBtn");
const exportBudsBtn = document.getElementById("exportBudsBtn");
const attendanceTableBody = document.querySelector("#attendanceTable tbody");
const noDataMessage = document.getElementById("noDataMessage");

// Display Current Date
function updateCurrentDate() {
    const currentDate = new Date();
    const dateElement = document.getElementById("currentDate");

    if (dateElement) {
        dateElement.textContent = currentDate.toLocaleDateString("en-GB", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

updateCurrentDate();

// Calculate and Update Statistics
function updateStatistics() {
    const allRows = document.querySelectorAll("#attendanceTable tbody tr");
    const visibleRows = Array.from(allRows).filter(row => row.style.display !== 'none');

    let presentCount = 0;
    let absentCount = 0;

    visibleRows.forEach(row => {
        const statusCell = row.querySelector('.status-pill');
        if (statusCell) {
            const status = statusCell.textContent.trim().toLowerCase();
            if (status === 'present') {
                presentCount++;
            } else if (status === 'absent') {
                absentCount++;
            }
        }
    });

    const totalCount = visibleRows.length;

    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('presentCount').textContent = presentCount;
    document.getElementById('absentCount').textContent = absentCount;
}

// Search Functionality
searchInput.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase().trim();
    const tableRows = document.querySelectorAll("#attendanceTable tbody tr");
    let visibleCount = 0;

    tableRows.forEach(row => {
        const code = row.cells[1].textContent.toLowerCase();
        const name = row.cells[2].textContent.toLowerCase();
        const category = row.cells[3].textContent.toLowerCase();
        const match = code.includes(value) || name.includes(value) || category.includes(value);

        row.style.display = match ? "" : "none";
        if (match) visibleCount++;
    });

    updateStatistics();

    if (visibleCount === 0 && value !== '') {
        showNoResults(true);
        document.querySelector('#noDataMessage p').textContent = 'No matching records found';
    } else {
        showNoResults(false);
    }
});

// Show/Hide No Results Message
function showNoResults(show) {
    const tableContainer = document.querySelector('.table-responsive');
    if (show) {
        tableContainer.style.display = 'none';
        noDataMessage.classList.remove('d-none');
    } else {
        tableContainer.style.display = 'block';
        noDataMessage.classList.add('d-none');
    }
}

// Check Table Data 
function checkTableData() {
    const hasData = attendanceTableBody.querySelectorAll("tr").length > 0;

    exportPdfBtn.disabled = !hasData;
    if (hasData) {
        exportPdfBtn.classList.remove("opacity-50");
        exportPdfBtn.title = "Export table to PDF";
    } else {
        exportPdfBtn.classList.add("opacity-50");
        exportPdfBtn.title = "No data available";
    }

    searchInput.disabled = !hasData;
    if (!hasData) {
        searchInput.value = "";
        searchInput.placeholder = "No data available to search 🔒";
    } else {
        searchInput.placeholder = "Search members by name or code...";
    }
}

// Export All Attendance to PDF
exportPdfBtn.addEventListener("click", async () => {
    try {
        const { jsPDF } = window.jspdf;

        if (!jsPDF) {
            alert('PDF library not loaded. Please refresh the page.');
            return;
        }

        exportPdfBtn.disabled = true;
        const originalHTML = exportPdfBtn.innerHTML;
        exportPdfBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            Generating...
        `;

        await generatePDF();
        exportPdfBtn.innerHTML = originalHTML;
        exportPdfBtn.disabled = false;
        showToast('PDF exported successfully!', 'success');

    } catch (error) {
        console.error('PDF Export Error:', error);
        showToast('Failed to export PDF. Please try again.', 'error');
        exportPdfBtn.disabled = false;
    }
});

// Category Export Handlers
exportScoutsGuidesBtn.addEventListener('click', async () => {
    await exportCategoryPDF('scouts-and-guides', 'Scouts & Guides');
});

exportCubsBtn.addEventListener('click', async () => {
    await exportCategoryPDF('cubs-and-blossoms', 'Cubs & Blossoms');
});

exportBudsBtn.addEventListener('click', async () => {
    await exportCategoryPDF('buds', 'Buds');
});

// Fetch Category Data
async function fetchCategoryData(category) {
    try {
        let endpoint;
        switch (category) {
            case 'scouts-and-guides':
                endpoint = API_ENDPOINTS.SCOUTS_GUIDES;
                break;
            case 'cubs-and-blossoms':
                endpoint = API_ENDPOINTS.CUBS_BLOSSOMS;
                break;
            case 'buds':
                endpoint = API_ENDPOINTS.BUDS;
                break;
            default:
                throw new Error('Invalid category');
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`);

        if (!response.ok) {
            throw new Error('Failed to fetch category data');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

// Export Category PDF
async function exportCategoryPDF(category, categoryName) {
    const button = category === 'scouts-and-guides' ? exportScoutsGuidesBtn :
        category === 'cubs-and-blossoms' ? exportCubsBtn : exportBudsBtn;

    // Store original HTML BEFORE any changes
    const originalHTML = button.innerHTML;

    try {
        button.disabled = true;
        button.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            Generating...
        `;

        showToast(`Fetching ${categoryName} data...`, 'success');
        const data = await fetchCategoryData(category);

        if (!data || data.length === 0) {
            showToast(`No data available for ${categoryName}`, 'error');
            button.innerHTML = originalHTML;
            button.disabled = false;
            return;
        }

        await generateCategoryPDF(data, categoryName, category);
        showToast(`${categoryName} PDF exported successfully!`, 'success');

        button.innerHTML = originalHTML;
        button.disabled = false;

    } catch (error) {
        console.error('Category PDF Export Error:', error);
        showToast(`No data available for ${categoryName}`, 'error');

        // Restore button to original state
        button.innerHTML = originalHTML;
        button.disabled = false;
    }
}

// Load Image Helper
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// Generate PDF for All Attendance
async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    let logo = null;
    try {
        logo = await loadImage('assets/img/lg-pdf.png');
    } catch (error) {
        console.warn('Logo loading failed');
    }

    if (logo) {
        try {
            const imgWidth = 57;
            const imgHeight = 57;
            doc.addImage(logo, 'PNG', pageWidth - imgWidth - 65, 20, imgWidth, imgHeight);
        } catch (error) {
            console.warn('Failed to add logo');
        }
    }

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text("Attendance Report", pageWidth / 2, 40, { align: "center" });

    const date = new Date().toLocaleDateString("en-GB", {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${date}`, pageWidth / 2, 60, { align: "center" });

    const stats = `Total: ${document.getElementById('totalCount').textContent} | Present: ${document.getElementById('presentCount').textContent} | Absent: ${document.getElementById('absentCount').textContent}`;
    doc.text(stats, pageWidth / 2, 75, { align: "center" });

    doc.setDrawColor(200);
    doc.line(40, 85, pageWidth - 40, 85);

    const table = document.getElementById("attendanceTable");
    const rows = [];
    const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.textContent.trim());
    rows.push(headers);

    table.querySelectorAll("tbody tr").forEach(tr => {
        if (tr.style.display !== 'none') {
            const row = Array.from(tr.querySelectorAll("td")).map(td => td.textContent.trim());
            rows.push(row);
        }
    });

    const colWidths = [100, 70, 150, 90, 90];
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);
    const startX = (pageWidth - tableWidth) / 2;
    let y = 100;
    const rowHeight = 30;

    doc.setFontSize(9);
    rows.forEach((row, index) => {
        let x = startX;

        if (y + rowHeight > pageHeight - 40) {
            doc.addPage();
            y = 40;
        }

        row.forEach((cell, j) => {
            if (index === 0) {
                doc.setFillColor(13, 110, 253);
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'bold');
            } else {
                doc.setFillColor(255, 255, 255);
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');
            }

            doc.rect(x, y, colWidths[j], rowHeight, index === 0 ? 'F' : 'S');
            doc.text(cell, x + colWidths[j] / 2, y + rowHeight / 2 + 3, { align: "center" });
            x += colWidths[j];
        });

        y += rowHeight;
    });

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 20, { align: 'center' });
        doc.text('Scout Manager © 2025', 40, pageHeight - 20);
    }

    const timestamp = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });
    doc.save(`Attendance_Report_${timestamp}.pdf`);
}

// Generate Category PDF
async function generateCategoryPDF(data, categoryName, categoryType) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    let logo = null;
    try {
        logo = await loadImage('assets/img/lg-pdf.png');
    } catch (error) {
        console.warn('Logo loading failed');
    }

    if (logo) {
        try {
            const imgWidth = 57;
            const imgHeight = 57;
            doc.addImage(logo, 'PNG', pageWidth - imgWidth - 65, 20, imgWidth, imgHeight);
        } catch (error) {
            console.warn('Failed to add logo');
        }
    }

    // Determine category color
    let categoryColor = [13, 110, 253];
    if (categoryType === 'scouts-and-guides') {
        categoryColor = [13, 110, 253];
    } else if (categoryType === 'cubs-and-blossoms') {
        categoryColor = [255, 193, 7];
    } else if (categoryType === 'buds') {
        categoryColor = [25, 135, 84];
    }

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text("Scout Manager", pageWidth / 2, 40, { align: "center" });

    doc.setFontSize(16);
    doc.text(`${categoryName} - Attendance Report`, pageWidth / 2, 60, { align: "center" });

    const date = new Date().toLocaleDateString("en-GB", {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Generated: ${date}     Category: ${categoryName}     Records: ${data.length}`,
        pageWidth / 2, 75, { align: "center" });

    doc.setTextColor(0);
    doc.setDrawColor(200);
    doc.line(40, 85, pageWidth - 40, 85);

    // Prepare table data
    const pdfData = [];
    let presentCount = 0;
    let absentCount = 0;

    data.forEach(item => {
        const dateValue = item.date || item.dateOfDay || 'N/A';
        const memberCode = item.code || item.memberCode || 'N/A';
        const fullName = item.name || item.fullName || 'N/A';
        const category = item.category || 'N/A';
        const status = item.status || 'N/A';

        const dateFormatted = formatDateForPDF(dateValue);

        if (status.toLowerCase() === 'present') presentCount++;
        if (status.toLowerCase() === 'absent') absentCount++;

        pdfData.push([dateFormatted, memberCode, fullName, category, status]);
    });

    const colWidths = [90, 70, 140, 100, 80];
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);
    const startX = (pageWidth - tableWidth) / 2;
    let y = 100;
    const rowHeight = 30;

    // Draw header row
    doc.setFontSize(9);
    const headers = ['Date', 'Code', 'Name', 'Category', 'Status'];
    let x = startX;

    headers.forEach((header, j) => {
        doc.setFillColor(...categoryColor);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');

        doc.rect(x, y, colWidths[j], rowHeight, 'F');
        doc.text(header, x + colWidths[j] / 2, y + rowHeight / 2 + 3, { align: "center" });
        x += colWidths[j];
    });

    y += rowHeight;

    // Draw rows
    pdfData.forEach((row) => {
        let x = startX;

        if (y + rowHeight > pageHeight - 60) {
            doc.addPage();
            y = 40;
        }

        doc.setFillColor(255, 255, 255);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');

        row.forEach((cell, j) => {
            doc.rect(x, y, colWidths[j], rowHeight, 'S');

            if (j === 4) { // Status column
                const cellLower = String(cell).toLowerCase();
                if (cellLower === 'present') {
                    doc.setTextColor(25, 135, 84); // Green
                    doc.setFont('helvetica', 'bold');
                } else if (cellLower === 'absent') {
                    doc.setTextColor(220, 53, 69); // Red
                    doc.setFont('helvetica', 'bold');
                }
            }

            const cellText = String(cell);
            doc.text(cellText, x + colWidths[j] / 2, y + rowHeight / 2 + 3, { align: "center" });

            if (j === 4) {
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');
            }

            x += colWidths[j];
        });

        y += rowHeight;
    });

    // Add summary
    if (y + 80 > pageHeight - 40) {
        doc.addPage();
        y = 40;
    }

    const finalY = y + 20;
    doc.setFillColor(209, 244, 221);
    doc.setDrawColor(25, 135, 84);
    doc.roundedRect((pageWidth - 300) / 2, finalY, 300, 50, 3, 3, 'FD');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 135, 84);
    doc.text(`Total: ${data.length}`, pageWidth / 2, finalY + 18, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Present: ${presentCount}  |  Absent: ${absentCount}`, pageWidth / 2, finalY + 36, { align: 'center' });

    // Add footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 20, { align: 'center' });
        doc.text('Scout Manager © 2025', 40, pageHeight - 20);
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${categoryName.replace(/\s+/g, '_')}_Attendance_${timestamp}.pdf`;
    doc.save(filename);
}

// Helper: Format Date for PDF
function formatDateForPDF(dateString) {
    try {
        if (!dateString) return 'N/A';

        if (typeof dateString === 'string' && dateString.includes('-')) {
            const parts = dateString.split('-');
            if (parts.length === 3 && parts[0].length === 4) {
                const date = new Date(dateString);
                return date.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
            }
        }

        return dateString.toString();
    } catch {
        return dateString;
    }
}

// Toast Notification
function showToast(message, type = 'success') {
    let toast = document.getElementById('attendanceToast');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'attendanceToast';
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; min-width: 300px;
            padding: 15px 20px; border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999;
            display: flex; align-items: center; gap: 10px; font-weight: 500;
            animation: slideInRight 0.3s ease;
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
        setTimeout(() => {
            toast.style.display = 'none';
        }, 300);
    }, 3000);
}

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
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
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
            localStorage.clear();
            signOutText.textContent = 'Logged out successfully!';

            setTimeout(() => {
                window.location.href = 'signIn.html';
            }, 500);
        } else {
            throw new Error(result.error || 'Logout failed');
        }

    } catch (error) {
        console.error('Sign out error:', error);
        localStorage.clear();

        if (typeof showToast === 'function') {
            showToast('Session ended. Redirecting...', 'error');
        }

        setTimeout(() => {
            window.location.href = 'signIn.html';
        }, 1000);
    }
});

// Table Animations
function animateTableRows() {
    const tableRows = document.querySelectorAll('#attendanceTable tbody tr');
    tableRows.forEach((row, index) => {
        row.style.animation = `fadeInUp 0.3s ease ${index * 0.05}s`;
        row.style.animationFillMode = 'both';
    });
}

// Auto-refresh
setInterval(() => {
    fetchTodayAttendance();
}, 10 * 1000); // Every 10 seconds