// API Configuration
const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:9090"
    : `${window.location.origin}`;

const API_ENDPOINTS = {
    getLateMembers: `${API_BASE_URL}/attendance/lateToday`,
    updateTaxAmount: `${API_BASE_URL}/taxes/updateAmount`,
    getPresentCount: `${API_BASE_URL}/attendance/presentToday`,
    getLastCheckIn: `${API_BASE_URL}/attendance/lastCheckIn`
};

// Authentication Check
window.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = 'signIn.html';
        return;
    }
    displayUserInfo();
    loadUserProfilePhoto(); 
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

// API Service Class
class APIService {
    constructor() {
        this.isOnline = false;
    }

    async checkConnection() {
        try {
            const response = await fetch(API_ENDPOINTS.getLateMembers, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            this.isOnline = response.ok;
            updateConnectionStatus(this.isOnline);
            return this.isOnline;
        } catch (error) {
            this.isOnline = false;
            updateConnectionStatus(false);
            return false;
        }
    }

    async request(apiCall) {
        showLoading();
        try {
            const result = await apiCall();
            hideLoading();
            this.isOnline = true;
            updateConnectionStatus(true);
            return result;
        } catch (error) {
            hideLoading();
            showToast(error.message || 'Connection error occurred', 'error');
            return { success: false, error: error.message };
        }
    }

    async getLateMembers() {
        return await this.request(async () => {
            const response = await fetch(API_ENDPOINTS.getLateMembers, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch late members');
            }

            const data = await response.json();
            return {
                success: true,
                data: {
                    records: data || []
                }
            };
        });
    }

    async updateTaxAmount(taxId, amount) {
        return await this.request(async () => {
            const payload = {
                taxId: taxId,
                amount: amount
            };

            const response = await fetch(API_ENDPOINTS.updateTaxAmount, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                let errorMessage = 'Failed to update tax amount';
                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } else {
                        const errorText = await response.text();
                        errorMessage = errorText || errorMessage;
                    }
                } catch (e) {
                    // Error parsing failed
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            
            return {
                success: true,
                data: data,
                message: data.message || `Tax amount updated to ${amount} EGP`
            };
        });
    }

    async getPresentCount() {
        return await this.request(async () => {
            const response = await fetch(API_ENDPOINTS.getPresentCount, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                let errorMessage = 'Failed to fetch present count';
                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } else {
                        const errorText = await response.text();
                        errorMessage = errorText || errorMessage;
                    }
                } catch (e) {
                    // Error parsing failed
                }
                throw new Error(errorMessage);
            }

            const count = await response.json();
            return {
                success: true,
                count: count || 0
            };
        });
    }

    async getLastCheckIn() {
        return await this.request(async () => {
            const response = await fetch(API_ENDPOINTS.getLastCheckIn, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                let errorMessage = 'Failed to fetch last check-in time';
                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } else {
                        const errorText = await response.text();
                        errorMessage = errorText || errorMessage;
                    }
                } catch (e) {
                    // Error parsing failed
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return {
                success: true,
                lastCheckInTime: data.lastCheckInTime || '--:--:--'
            };
        });
    }
}

// UI Helper Functions
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('show');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.remove('show');
}

function updateConnectionStatus(isOnline) {
    const statusEl = document.getElementById('connectionStatus');
    const statusText = document.getElementById('statusText');

    if (statusEl && statusText) {
        if (isOnline) {
            statusEl.classList.remove('offline');
            statusEl.classList.add('online');
            statusText.textContent = 'Connected';
        } else {
            statusEl.classList.remove('online');
            statusEl.classList.add('offline');
            statusText.textContent = 'Disconnected';
        }
    }
}

function showToast(message, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }

    toast.className = `toast-notification ${type}`;
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Date & Time Updates
function updateDateTime() {
    const now = new Date();
    const dateOptions = { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' };
    const currentDate = document.getElementById('currentDate');
    if (currentDate) {
        currentDate.textContent = now.toLocaleDateString('en-GB', dateOptions);
    }

    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const currentTime = document.getElementById('currentTime');
    if (currentTime) {
        currentTime.textContent = now.toLocaleTimeString('en-GB', timeOptions);
    }
}

// Render Records
async function renderRecords() {
    const tbody = document.querySelector('#recordsTable tbody');
    const noRecordsMsg = document.getElementById('noRecordsMessage');

    if (!tbody) return;

    const result = await api.getLateMembers();

    if (!result.success) {
        if (noRecordsMsg) noRecordsMsg.classList.remove('d-none');
        tbody.innerHTML = '';
        await updateStatistics([]);
        return;
    }

    const records = result.data.records || [];
    tbody.innerHTML = '';

    if (records.length === 0) {
        if (noRecordsMsg) noRecordsMsg.classList.remove('d-none');
        await updateStatistics([]);
        return;
    }

    if (noRecordsMsg) noRecordsMsg.classList.add('d-none');

    records.forEach((r, index) => {
        const tr = document.createElement('tr');
        tr.classList.add('fade-in');
        tr.style.animationDelay = `${index * 0.05}s`;
        
        const taxId = r.id || r.taxId || null;
        tr.dataset.taxId = taxId;
        tr.dataset.code = r.code;

        // Code
        const codeCell = document.createElement('td');
        codeCell.className = 'fw-bold text-primary';
        codeCell.textContent = r.code || '';

        // Full Name
        const nameCell = document.createElement('td');
        nameCell.className = 'fw-bold text-primary';
        nameCell.textContent = r.fullName || '';

        // Date
        const dateCell = document.createElement('td');
        const dateValue = r.dateOfDay || '';
        dateCell.textContent = dateValue ? formatDate(dateValue) : '';

        // Check-in Time
        const timeCell = document.createElement('td');
        timeCell.textContent = r.checkInTime || '';

        // Action (Tax Amount Input)
        const actionCell = document.createElement('td');
        const actionDiv = document.createElement('div');
        actionDiv.className = 'd-flex gap-2 justify-content-center';

        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'form-control form-control-sm';
        input.style.width = '100px';
        input.placeholder = 'Amount';
        input.min = '0';
        input.value = r.amount || '';

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-success btn-sm save-btn';
        saveBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px;">save</span>';
        saveBtn.title = 'Update Tax Amount';
        
        if (!taxId) {
            saveBtn.disabled = true;
            saveBtn.title = 'No tax record found';
            saveBtn.classList.add('btn-secondary');
            saveBtn.classList.remove('btn-success');
        } else {
            input.addEventListener('input', () => {
                const value = input.value.trim();
                if (value === '' || isNaN(value) || Number(value) <= 0) {
                    input.classList.add('is-invalid');
                    input.classList.remove('is-valid');
                    saveBtn.disabled = true;
                    saveBtn.classList.add('btn-danger');
                    saveBtn.classList.remove('btn-success');
                } else {
                    input.classList.remove('is-invalid');
                    input.classList.add('is-valid');
                    saveBtn.disabled = false;
                    saveBtn.classList.remove('btn-danger');
                    saveBtn.classList.add('btn-success');
                }
            });
            
            saveBtn.addEventListener('click', () => handleUpdateTax(taxId, input, saveBtn, tr));
        }

        actionDiv.appendChild(input);
        actionDiv.appendChild(saveBtn);
        actionCell.appendChild(actionDiv);

        tr.appendChild(codeCell);
        tr.appendChild(nameCell);
        tr.appendChild(dateCell);
        tr.appendChild(timeCell);
        tr.appendChild(actionCell);

        tbody.appendChild(tr);
    });

    await updateStatistics(records);
}

// Format Date Helper
function formatDate(dateStr) {
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const [year, month, day] = parts;
            return `${day}/${month}/${year}`;
        }
        
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB');
    } catch (e) {
        return dateStr;
    }
}

// Handle Update Tax Amount
async function handleUpdateTax(taxId, input, button, row) {
    const value = input.value.trim();

    if (!taxId || taxId === 'null' || taxId === 'undefined') {
        showToast('Invalid tax record. Cannot update.', 'error');
        return;
    }

    if (value === '' || isNaN(value) || Number(value) <= 0) {
        input.classList.add('is-invalid');
        showToast('Amount must be greater than 0 EGP', 'error');
        return;
    }

    input.classList.remove('is-invalid');
    input.classList.add('is-valid');

    button.disabled = true;
    const originalHTML = button.innerHTML;
    button.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

    const result = await api.updateTaxAmount(Number(taxId), Number(value));

    if (result.success) {
        button.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px;">check_circle</span>';
        button.classList.replace('btn-success', 'btn-primary');
        showToast(`Tax amount updated to ${value} EGP successfully!`, 'success');

        row.style.transition = 'background-color 0.3s ease';
        row.style.backgroundColor = '#d1e7dd';
        
        setTimeout(async () => {
            row.style.backgroundColor = '';
            button.innerHTML = originalHTML;
            button.classList.replace('btn-primary', 'btn-success');
            button.disabled = false;
            input.classList.remove('is-valid');
            
            await renderRecords();
        }, 2000);
    } else {
        showToast(result.error || 'Failed to update tax amount', 'error');
        button.disabled = false;
        button.innerHTML = originalHTML;
        input.classList.remove('is-valid');
    }
}

// Update Statistics
async function updateStatistics(records) {
    const todayCount = document.getElementById('todayCount');
    const qrScans = document.getElementById('qrScans');
    const lastCheckin = document.getElementById('lastCheckin');

    if (todayCount) todayCount.textContent = records.length;

    const presentResult = await api.getPresentCount();
    if (presentResult.success && qrScans) {
        qrScans.textContent = presentResult.count;
    } else if (qrScans) {
        qrScans.textContent = '0';
    }

    const lastCheckInResult = await api.getLastCheckIn();
    if (lastCheckInResult.success && lastCheckin) {
        lastCheckin.textContent = lastCheckInResult.lastCheckInTime;
    } else if (lastCheckin) {
        lastCheckin.textContent = '--:--:--';
    }
}

// QR Code Functions
let qrCode1 = null;
let qrCode2 = null;

function openQr() {
    const qrOverlay = document.getElementById('qrOverlay');
    if (!qrOverlay) return;

    const size = Math.min(window.innerWidth * 0.35, 300);
    const container1 = document.getElementById('qrCodeContainer1');
    const container2 = document.getElementById('qrCodeContainer2');

    if (container1) container1.innerHTML = '';
    if (container2) container2.innerHTML = '';

    const wifiSsid = document.getElementById('wifiSsid')?.textContent || 'Kashafa_ElAgayebi';
    const wifiPass = document.getElementById('wifiPass')?.textContent || 'KashafaElAgayebi!Scouts#';

    if (container1 && typeof QRCode !== 'undefined') {
        try {
            qrCode1 = new QRCode(container1, {
                text: `WIFI:T:WPA;S:${wifiSsid};P:${wifiPass};;`,
                width: size,
                height: size,
                colorDark: "#0d6efd",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (e) {
            // QR generation failed
        }
    }

    if (container2 && typeof QRCode !== 'undefined') {
        try {
            qrCode2 = new QRCode(container2, {
                text: "http://192.168.137.1:9090/qr-checkin.html",
                width: size,
                height: size,
                colorDark: "#198754",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (e) {
            // QR generation failed
        }
    }

    qrOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    stopIntervals();
}

function closeQr() {
    const qrOverlay = document.getElementById('qrOverlay');
    if (!qrOverlay) return;

    qrOverlay.classList.remove('active');
    document.body.style.overflow = '';

    setTimeout(() => {
        const container1 = document.getElementById('qrCodeContainer1');
        const container2 = document.getElementById('qrCodeContainer2');
        if (container1) container1.innerHTML = '';
        if (container2) container2.innerHTML = '';
        qrCode1 = null;
        qrCode2 = null;
    }, 300);

    startIntervals();
}

const showQrBtn = document.getElementById('showQrBtn');
const closeQrOverlay = document.getElementById('closeQrOverlay');
const qrOverlay = document.getElementById('qrOverlay');

if (showQrBtn) showQrBtn.addEventListener('click', openQr);
if (closeQrOverlay) closeQrOverlay.addEventListener('click', closeQr);

if (qrOverlay) {
    qrOverlay.addEventListener('click', (e) => {
        if (e.target === qrOverlay) closeQr();
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && qrOverlay?.classList.contains('active')) {
        closeQr();
    }
});

// Refresh Button
const refreshBtn = document.getElementById('refreshBtn');
if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
        const icon = refreshBtn.querySelector('.material-symbols-outlined');

        if (icon) icon.style.animation = 'spin 1s linear';
        refreshBtn.disabled = true;

        await renderRecords();

        setTimeout(() => {
            if (icon) icon.style.animation = '';
            refreshBtn.disabled = false;
        }, 1000);
    });
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
        // Determine the API base URL
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

// Interval Management
const REFRESH_INTERVAL = 5000;
let autoRefreshInterval = null;

function startIntervals() {
    stopIntervals();
    autoRefreshInterval = setInterval(() => {
        renderRecords();
    }, REFRESH_INTERVAL);
}

function stopIntervals() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

document.addEventListener('focusin', (e) => {
    if (e.target.tagName === 'INPUT') {
        stopIntervals();
    }
});

document.addEventListener('focusout', (e) => {
    if (e.target.tagName === 'INPUT') {
        startIntervals();
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopIntervals();
    } else {
        renderRecords();
        startIntervals();
    }
});


// Load Image Helper
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// Export PDF Function
async function exportPaidRecordsToPDF() {
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    if (!exportPdfBtn) return;

    try {
        exportPdfBtn.disabled = true;
        const originalHTML = exportPdfBtn.innerHTML;
        exportPdfBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2"></span>
            Generating...
        `;

        showLoading();

        const response = await fetch(`${API_BASE_URL}/taxes/updatedTaxMembers`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch updated tax members');
        }

        const paidRecords = await response.json();

        if (!paidRecords || paidRecords.length === 0) {
            hideLoading();
            showToast('No paid records to export.', 'warning');
            exportPdfBtn.innerHTML = originalHTML;
            exportPdfBtn.disabled = false;
            return;
        }

        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
            hideLoading();
            showToast('PDF library not loaded.', 'error');
            exportPdfBtn.innerHTML = originalHTML;
            exportPdfBtn.disabled = false;
            return;
        }

        const doc = new jsPDF('p', 'pt', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        let logo = null;
        try {
            logo = await loadImage('assets/img/lg-pdf.png');
        } catch (error) {
            // Logo loading failed
        }

        if (logo) {
            try {
                const imgWidth = 57;
                const imgHeight = 57;
                doc.addImage(logo, 'PNG', pageWidth - imgWidth - 65, 20, imgWidth, imgHeight);
            } catch (error) {
                // Failed to add logo
            }
        }

        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Late Members — Tax Report', pageWidth / 2, 40, { align: 'center' });

        const now = new Date();
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const date = now.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            timeZone: 'Africa/Cairo'
        });
        doc.text(`Generated: ${date}`, pageWidth / 2, 60, { align: 'center' });

        const totalAmount = paidRecords.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
        const stats = `Total Members: ${paidRecords.length} | Total Tax: ${totalAmount.toFixed(2)} EGP`;
        doc.text(stats, pageWidth / 2, 75, { align: 'center' });

        doc.setDrawColor(200);
        doc.line(40, 85, pageWidth - 40, 85);

        const body = paidRecords.map((r, index) => [
            String(index + 1),
            r.code || '',
            r.fullName || '',
            r.category || '',
            r.checkInTime || '',
            `${Number(r.amount).toFixed(2)} EGP`
        ]);

        const columnWidths = [30, 60, 120, 80, 80, 80];
        const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
        const leftMargin = (pageWidth - tableWidth) / 2;

        doc.autoTable({
            startY: 100,
            head: [['#', 'Code', 'Name', 'Category', 'Check-in Time', 'Tax Amount']],
            body: body,
            theme: 'striped',
            headStyles: { fillColor: [220, 53, 69], textColor: 255, halign: 'center', fontSize: 10 },
            styles: { fontSize: 9, halign: 'center', cellPadding: 5 },
            columnStyles: {
                0: { cellWidth: 30, halign: 'center' },
                1: { cellWidth: 60, halign: 'center' },
                2: { cellWidth: 120, halign: 'left' },
                3: { cellWidth: 80, halign: 'center' },
                4: { cellWidth: 80, halign: 'center' },
                5: { cellWidth: 80, halign: 'center' }
            },
            margin: { left: leftMargin, right: leftMargin }
        });

        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 20, { align: 'center' });
            doc.text('Scout Manager © 2025', 40, pageHeight - 20);
        }

        const cairoDate = now.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });
        const filename = `Late_Members_Tax_${cairoDate}.pdf`;
        doc.save(filename);

        hideLoading();
        showToast('PDF exported successfully!', 'success');

        exportPdfBtn.innerHTML = originalHTML;
        exportPdfBtn.disabled = false;

    } catch (err) {
        hideLoading();
        showToast('Error exporting PDF: ' + err.message, 'error');
        if (exportPdfBtn) {
            exportPdfBtn.innerHTML = '<span class="material-symbols-outlined">picture_as_pdf</span><span>Export as PDF</span>';
            exportPdfBtn.disabled = false;
        }
    }
}

const exportPdfBtn = document.getElementById('exportPdfBtn');
if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', exportPaidRecordsToPDF);
}

// Initialize Application
const api = new APIService();

async function initializeApp() {
    await api.checkConnection();
    updateDateTime();
    setInterval(updateDateTime, 1000);

    await renderRecords();
    startIntervals();

    if (api.isOnline) {
        showToast('System initialized successfully!', 'success');
    } else {
        showToast('Unable to connect to server', 'warning');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

window.scoutAPI = api;
window.renderRecords = renderRecords;