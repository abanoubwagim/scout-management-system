// Authentication Check
window.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    
    if (!loggedInUser) {
        window.location.href = 'signIn.html';
        return;
    }
    
    displayUserInfo();
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

// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:9090',
    ENDPOINTS: {
        DAILY_TOTAL: '/taxes/dailyTotal',
        MONTHLY_TOTAL: '/taxes/monthlyTotal',
        TOTAL_REVENUE: '/taxes/totalRevenue',
        CURRENT_MONTH: '/taxes/currentMonthTotal',
        TOTAL_TRANSACTIONS: '/taxes/totalTransactions',
        SCOUTS_GUIDES_TODAY: '/taxes/today/scoutsAndGuides',
        CUBS_BLOSSOMS_TODAY: '/taxes/today/cubsAndBlossoms',
        BUDS_TODAY: '/taxes/today/buds'
    }
};

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    try {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

// Data Management
let data = {
    day: [],
    month: []
};

let currentTab = 'day';
let isLoading = false;

const tabs = document.querySelectorAll('#tabs .nav-link');
const tbody = document.querySelector('#taxTable tbody');
const noDataMessage = document.getElementById('noDataMessage');
const totalAmountDiv = document.getElementById('totalAmount');
const exportPdfBtn = document.getElementById('exportPdfBtn');



// Fetch Data from Backend
async function fetchTaxesData(period = 'day') {
    try {
        isLoading = true;
        showLoadingState();

        let response;
        if (period === 'day') {
            response = await apiRequest(API_CONFIG.ENDPOINTS.DAILY_TOTAL);
        } else if (period === 'month') {
            response = await apiRequest(API_CONFIG.ENDPOINTS.MONTHLY_TOTAL);
        }

        if (Array.isArray(response)) {
            data[period] = response.map(item => {
                return {
                    date: item.date,
                    day: item.day,
                    amount: parseFloat(item.totalAmount || item.Amount || 0)
                };
            });
            
            return true;
        } else {
            throw new Error('Invalid response format');
        }

    } catch (error) {
        showToast(`Failed to load ${period} data`, 'error');
        data[period] = [];
        return false;
    } finally {
        isLoading = false;
        hideLoadingState();
    }
}

// Fetch Statistics from Backend
async function fetchStatistics() {
    try {
        const [totalRevenue, currentMonth, transactionCount] = await Promise.all([
            apiRequest(API_CONFIG.ENDPOINTS.TOTAL_REVENUE),
            apiRequest(API_CONFIG.ENDPOINTS.CURRENT_MONTH),
            apiRequest(API_CONFIG.ENDPOINTS.TOTAL_TRANSACTIONS)
        ]);

        document.getElementById('totalRevenue').textContent = 
            `${totalRevenue || 0} EGP`;
        document.getElementById('thisMonth').textContent = 
            `${currentMonth || 0} EGP`;
        document.getElementById('transactionCount').textContent = 
            transactionCount || 0;

    } catch (error) {
        showToast('Failed to load statistics', 'error');
        document.getElementById('totalRevenue').textContent = '0 EGP';
        document.getElementById('thisMonth').textContent = '0 EGP';
        document.getElementById('transactionCount').textContent = '0';
    }
}

// Render Table Function
function renderTable(tab) {
    tbody.innerHTML = '';
    let rows = data[tab];
    
    if (!rows || rows.length === 0) {
        noDataMessage.classList.remove('d-none');
        totalAmountDiv.classList.add('d-none');
        exportPdfBtn.disabled = true;
        exportPdfBtn.classList.add('opacity-50');
        return;
    }

    noDataMessage.classList.add('d-none');
    exportPdfBtn.disabled = false;
    exportPdfBtn.classList.remove('opacity-50');

    let total = 0;
    rows.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.style.animation = `fadeInUp 0.3s ease ${index * 0.05}s`;
        tr.style.animationFillMode = 'both';
        
        const displayDate = tab === 'day' 
            ? item.date
            : formatMonthYear(item.date);
        
        tr.innerHTML = `
            <td class="fw-bold text-primary">${displayDate}</td>
            <td>${item.day}</td>
            <td class="text-success fw-semibold">${item.amount.toFixed(2)} EGP</td>
        `;
        tbody.appendChild(tr);
        total += item.amount;
    });

    totalAmountDiv.classList.remove('d-none');
    totalAmountDiv.innerHTML = `
        <div class="d-flex align-items-center justify-content-center gap-2">
            <span class="material-symbols-outlined text-success" style="font-size: 28px;">account_balance_wallet</span>
            <span>Total Amount:</span>
            <span class="text-success counter" data-target="${total}">0</span>
            <span class="text-success">EGP</span>
        </div>
    `;

    animateCounter(total);
}

// Animate Counter Function
function animateCounter(target) {
    const counter = document.querySelector('.counter');
    if (!counter) return;

    let current = 0;
    const increment = target / 50;
    const duration = 1000;
    const stepTime = duration / 50;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            counter.textContent = target.toFixed(2);
            clearInterval(timer);
        } else {
            counter.textContent = Math.floor(current);
        }
    }, stepTime);
}

// Tab Click Handler
tabs.forEach(tab => {
    tab.addEventListener('click', async (e) => {
        e.preventDefault();
        
        if (isLoading) return;
        
        tabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        
        currentTab = tab.dataset.tab;
        
        if (!data[currentTab] || data[currentTab].length === 0) {
            await fetchTaxesData(currentTab);
        }
        
        renderTable(currentTab);
    });
});

// Image Loading Helper
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
}

// Export PDF Handler
exportPdfBtn.addEventListener('click', async () => {
    if (tbody.children.length === 0) {
        showToast('No data available to export', 'error');
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        
        if (!jsPDF) {
            showToast('PDF library not loaded. Please refresh the page.', 'error');
            return;
        }

        exportPdfBtn.disabled = true;
        const originalHTML = exportPdfBtn.innerHTML;
        exportPdfBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            Generating...
        `;

        try {
            await generateTaxesPDF();
            showToast('PDF exported successfully!', 'success');
        } catch (error) {
            showToast(error.message || 'Failed to export PDF', 'error');
        } finally {
            exportPdfBtn.innerHTML = originalHTML;
            exportPdfBtn.disabled = false;
        }

    } catch (error) {
        showToast('An unexpected error occurred', 'error');
        exportPdfBtn.disabled = false;
    }
});

// Generate PDF Function
async function generateTaxesPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const tabName = currentTab === 'day' ? 'Per Day' : 'Per Month';

    let logo = null;
    try {
        logo = await loadImage('assets/img/lg-pdf.png');
    } catch (error) {
        // Continue without logo
    }

    const pdfData = [];
    let total = 0;
    
    Array.from(tbody.children).forEach(tr => {
        const cells = Array.from(tr.children);
        const row = cells.map(td => td.textContent.trim().replace(/\s+/g, ' '));
        pdfData.push(row);
        
        const amountText = cells[2]?.textContent.replace(/[^\d.]/g, '') || '0';
        const amount = parseFloat(amountText);
        if (!isNaN(amount)) total += amount;
    });

    if (logo) {
        try {
            const imgWidth = 25, imgHeight = 25;
            doc.addImage(logo, 'PNG', pageWidth - imgWidth - 14, 13, imgWidth, imgHeight);
        } catch (error) {
            // Continue without logo
        }
    }

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text("Scout Manager", pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text("Financial Report", pageWidth / 2, 30, { align: 'center' });
    
    const date = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Generated: ${date}     Report Type: ${tabName}     Records: ${pdfData.length}`, 
        pageWidth / 2, 38, { align: 'center' });
    
    doc.setTextColor(0);
    doc.setDrawColor(200);
    doc.line(14, 43, pageWidth - 14, 43);

    doc.autoTable({
        head: [['Date', 'Day', 'Amount']],
        body: pdfData,
        startY: 48,
        theme: 'grid',
        headStyles: { 
            fillColor: [13, 110, 253],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
        },
        bodyStyles: { 
            textColor: [33, 37, 41],
            halign: 'center'
        },
        columnStyles: {
            0: { cellWidth: 60, fontStyle: 'bold', textColor: [13, 110, 253] },
            1: { cellWidth: 60 },
            2: { cellWidth: 60, fontStyle: 'bold', textColor: [25, 135, 84] }
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 }
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFillColor(209, 244, 221);
    doc.setDrawColor(25, 135, 84);
    doc.roundedRect((pageWidth - 100) / 2, finalY, 100, 25, 3, 3, 'FD');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 135, 84);
    doc.text(`Total: ${total.toFixed(2)} EGP`, pageWidth / 2, finalY + 16, { align: 'center' });

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(doc, pageWidth, pageHeight, i, totalPages);
    }

    const timestamp = new Date().toISOString().split('T')[0];
    doc.save(`Financial_Report_${tabName.replace(/\s+/g, '_')}_${timestamp}.pdf`);
}

// Footer Helper
function addFooter(doc, pageWidth, pageHeight, currentPage, totalPages) {
    const footerY = pageHeight - 10;
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`Page ${currentPage} of ${totalPages}`, pageWidth / 2, footerY, { align: 'center' });
    doc.text('Scout Manager © 2025', 14, footerY);
    doc.setTextColor(0);
}

// Toast Notification
function showToast(message, type = 'success') {
    let toast = document.getElementById('taxesToast');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'taxesToast';
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
        setTimeout(() => toast.style.display = 'none', 300);
    }, 3000);
}

// Loading States
function showLoadingState() {
    tbody.innerHTML = `
        <tr>
            <td colspan="3" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted">Loading financial data...</p>
            </td>
        </tr>
    `;
}

function hideLoadingState() {
    // Will be replaced by renderTable
}

// Utility Functions
function formatMonthYear(dateString) {
    try {
        const [year, month] = dateString.split('-');
        const date = new Date(year, parseInt(month) - 1);
        return date.toLocaleDateString('en-GB', {
            month: 'long',
            year: 'numeric'
        });
    } catch {
        return dateString;
    }
}

// Sign Out with API Session Invalidation
const signOutBtn = document.getElementById('signOutBtn');
const signOutText = document.getElementById('signOutText');
const signOutSpinner = document.getElementById('signOutSpinner');

signOutBtn.addEventListener('click', async function (e) {
    e.preventDefault();
    
    // Update UI to show loading state
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

// Refresh Function
async function refreshData() {
    showToast('Refreshing data...', 'success');
    await fetchTaxesData(currentTab);
    await fetchStatistics();
    renderTable(currentTab);
}

// Add Animation Styles
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

// Initialize Application
async function initializeApp() {
    displayUserInfo();

    try {
        await Promise.all([
            fetchTaxesData('day'),
            fetchTaxesData('month'),
            fetchStatistics()
        ]);

        renderTable(currentTab);

    } catch (error) {
        showToast('Error loading application', 'error');
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);

window.refreshTaxesData = refreshData;
window.getFinancialSummary = () => ({
    currentTab,
    dayRecords: data.day.length,
    monthRecords: data.month.length,
    totalDay: data.day.reduce((s, i) => s + i.amount, 0),
    totalMonth: data.month.reduce((s, i) => s + i.amount, 0)
});

// Category PDF Export Functions

const exportScoutsGuidesBtn = document.getElementById('exportScoutsGuidesBtn');
const exportCubsBtn = document.getElementById('exportCubsBtn');
const exportBudsBtn = document.getElementById('exportBudsBtn');

// Category Export Handlers

exportScoutsGuidesBtn.addEventListener('click', async () => {
    await exportCategoryPDF('scoutsAndGuides', 'Scouts & Guides');
});

exportCubsBtn.addEventListener('click', async () => {
    await exportCategoryPDF('cubsAndBlossoms', 'Cubs & Blossoms');
});

exportBudsBtn.addEventListener('click', async () => {
    await exportCategoryPDF('buds', 'Buds');
});

// Fetch Category Data
async function fetchCategoryData(category) {
    try {
        let endpoint;
        switch(category) {
            case 'scoutsAndGuides':
                endpoint = API_CONFIG.ENDPOINTS.SCOUTS_GUIDES_TODAY;
                break;
            case 'cubsAndBlossoms':
                endpoint = API_CONFIG.ENDPOINTS.CUBS_BLOSSOMS_TODAY;
                break;
            case 'buds':
                endpoint = API_CONFIG.ENDPOINTS.BUDS_TODAY;
                break;
            default:
                throw new Error('Invalid category');
        }

        const response = await apiRequest(endpoint);
        
        return response;
    } catch (error) {
        throw error;
    }
}

// Generate Category PDF
async function exportCategoryPDF(category, categoryName) {
    try {
        const button = category === 'scoutsAndGuides' ? exportScoutsGuidesBtn :
                      category === 'cubsAndBlossoms' ? exportCubsBtn : exportBudsBtn;
        
        button.disabled = true;
        const originalHTML = button.innerHTML;
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

        await generateCategoryTaxesPDF(data, categoryName, category);
        showToast(`${categoryName} PDF exported successfully!`, 'success');

        button.innerHTML = originalHTML;
        button.disabled = false;

    } catch (error) {
        showToast(`Failed to export ${categoryName} PDF`, 'error');
        
        const button = category === 'scoutsAndGuides' ? exportScoutsGuidesBtn :
                      category === 'cubsAndBlossoms' ? exportCubsBtn : exportBudsBtn;
        button.disabled = false;
        button.innerHTML = button.querySelector('span:last-child').textContent;
    }
}

// Generate Category PDF Document
async function generateCategoryTaxesPDF(data, categoryName, categoryType) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    let logo = null;
    try {
        logo = await loadImage('assets/img/lg-pdf.png');
    } catch (error) {
        // Continue without logo
    }

    const pdfData = [];
    let total = 0;
    
    data.forEach(item => {
        const row = [
            item.memberCode || '',
            item.memberName || '',
            formatDate(item.date),
            item.day || '',
            `${parseFloat(item.amount || 0).toFixed(2)} EGP`
        ];
        pdfData.push(row);
        total += parseFloat(item.amount || 0);
    });

    if (logo) {
        try {
            const imgWidth = 25, imgHeight = 25;
            doc.addImage(logo, 'PNG', pageWidth - imgWidth - 14, 13, imgWidth, imgHeight);
        } catch (error) {
            // Continue without logo
        }
    }

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text("Scout Manager", pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text(`${categoryName} - Tax Report`, pageWidth / 2, 30, { align: 'center' });
    
    const date = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Generated: ${date}     Category: ${categoryName}     Records: ${pdfData.length}`, 
        pageWidth / 2, 38, { align: 'center' });
    
    doc.setTextColor(0);
    doc.setDrawColor(200);
    doc.line(14, 43, pageWidth - 14, 43);

    let categoryColor = [13, 110, 253];
    if (categoryType === 'scoutsAndGuides') {
        categoryColor = [13, 110, 253];
    } else if (categoryType === 'cubsAndBlossoms') {
        categoryColor = [255, 193, 7];
    } else if (categoryType === 'buds') {
        categoryColor = [25, 135, 84];
    }

    doc.autoTable({
        head: [['Code', 'Name', 'Date', 'Day', 'Amount']],
        body: pdfData,
        startY: 48,
        theme: 'grid',
        headStyles: { 
            fillColor: categoryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
        },
        bodyStyles: { 
            textColor: [33, 37, 41],
            halign: 'center',
            fontSize: 9
        },
        columnStyles: {
            0: { cellWidth: 25, fontStyle: 'bold', textColor: categoryColor },
            1: { cellWidth: 55, halign: 'center' }, 
            2: { cellWidth: 30 },
            3: { cellWidth: 30 },
            4: { cellWidth: 35, fontStyle: 'bold', textColor: [25, 135, 84] }
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 }
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFillColor(209, 244, 221);
    doc.setDrawColor(25, 135, 84);
    doc.roundedRect((pageWidth - 100) / 2, finalY, 100, 25, 3, 3, 'FD');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 135, 84);
    doc.text(`Total: ${total.toFixed(2)} EGP`, pageWidth / 2, finalY + 16, { align: 'center' });

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(doc, pageWidth, pageHeight, i, totalPages);
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${categoryName.replace(/\s+/g, '_')}_Tax_Report_${timestamp}.pdf`;
    doc.save(filename);
}

// Helper: Format Date
function formatDate(dateString) {
    try {
        if (!dateString) return '';
        
        if (dateString.includes('-') && dateString.split('-').length === 3) {
            const parts = dateString.split('-');
            if (parts[0].length === 4) {
                const date = new Date(dateString);
                return date.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }).replace(/\//g, '-');
            }
            return dateString;
        }
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');
    } catch {
        return dateString;
    }
}