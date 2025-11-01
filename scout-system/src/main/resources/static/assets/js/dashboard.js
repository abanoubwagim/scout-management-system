// Authentication Check
window.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    
    if (!loggedInUser) {
        window.location.href = 'signIn.html';
        return;
    }
    
    displayUserInfo();
    fetchDashboardData();
    checkForRefreshFlag();
});

// API Configuration
const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:9090"
    : `${window.location.origin}`;

// Check for Refresh Flag
function checkForRefreshFlag() {
    const needsRefresh = localStorage.getItem('needsRefresh');
    if (needsRefresh === 'true') {
        localStorage.removeItem('needsRefresh');
        
        setTimeout(() => {
            fetchDashboardData();
            showToast('Dashboard updated with latest attendance!', 'success');
        }, 500);
    }
}

// Auto-Refresh When Page Becomes Visible
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        fetchDashboardData();
    }
});

window.addEventListener('focus', () => {
    fetchDashboardData();
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

// Date & Time Update
function updateDateTime() {
    const now = new Date();

    const dateOptions = { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    };
    const currentDate = now.toLocaleDateString('en-GB', dateOptions);

    const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true
    };
    const currentTime = now.toLocaleTimeString('en-GB', timeOptions);

    const dateElement = document.getElementById('currentDate');
    const timeElement = document.getElementById('currentTime');
    
    if (dateElement) dateElement.textContent = currentDate;
    if (timeElement) timeElement.textContent = currentTime;
}

setInterval(updateDateTime, 1000);
updateDateTime();

// Counter Animation
function animateCounter(element, target, duration = 1500) {
    if (target === 0) {
        element.textContent = 0;
        return;
    }
    
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Initialize Counter Animations
function initializeCounterAnimations() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        animateCounter(counter, target);
    });
}

// Stats Card Click Handler
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('.stat-title').textContent.trim();
            
            switch(title) {
                case 'Total Scouts':
                    window.location.href = 'members.html';
                    break;
                case 'Present Today':
                case 'Absent Today':
                    window.location.href = 'attendance.html';
                    break;
                case 'Upcoming Events':
                    window.location.href = 'activities.html';
                    break;
            }
        });
        
        card.style.cursor = 'pointer';
        card.setAttribute('title', 'Click to view details');
    });
});

// Fetch Real-Time Data from Backend
async function fetchDashboardData() {
    try {
        showLoadingState();
        
        const [totalScoutsResponse, presentTodayResponse, absentTodayResponse, upcomingEventsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/members/getCountAllMember`),
            fetch(`${API_BASE_URL}/attendance/presentToday`),
            fetch(`${API_BASE_URL}/attendance/absentToday`),
            fetch(`${API_BASE_URL}/activities/upComingActivity`)
        ]);
        
        if (!totalScoutsResponse.ok) {
            throw new Error('Failed to fetch total scouts');
        }
        if (!presentTodayResponse.ok) {
            throw new Error('Failed to fetch present attendance');
        }
        if (!absentTodayResponse.ok) {
            throw new Error('Failed to fetch absent attendance');
        }
        
        const totalScouts = await totalScoutsResponse.json();
        const presentToday = await presentTodayResponse.json();
        const absentToday = await absentTodayResponse.json();
        const upcomingEvents = upcomingEventsResponse.ok ? await upcomingEventsResponse.json() : 0;
        
        const data = {
            totalScouts: totalScouts || 0,
            presentToday: presentToday || 0,
            absentToday: absentToday || 0,
            upcomingEvents: upcomingEvents || 0
        };
        
        updateDashboardStats(data);
        
        setTimeout(() => {
            initializeCounterAnimations();
            hideLoadingState();
        }, 100);
        
    } catch (error) {
        showToast('Failed to load dashboard data. Please refresh the page.', 'error');
        
        const fallbackData = {
            totalScouts: 0,
            presentToday: 0,
            absentToday: 0,
            upcomingEvents: 0
        };
        
        updateDashboardStats(fallbackData);
        
        setTimeout(() => {
            initializeCounterAnimations();
            hideLoadingState();
        }, 100);
    }
}

// Update Dashboard Stats
function updateDashboardStats(data) {
    const totalScoutsCounter = document.querySelector('#totalScouts .counter');
    const presentTodayCounter = document.querySelector('#presentToday .counter');
    const absentTodayCounter = document.querySelector('#absentToday .counter');
    const upcomingEventsCounter = document.querySelector('#upcomingEvents .counter');
    
    if (totalScoutsCounter) {
        totalScoutsCounter.setAttribute('data-target', data.totalScouts);
    }
    if (presentTodayCounter) {
        presentTodayCounter.setAttribute('data-target', data.presentToday);
    }
    if (absentTodayCounter) {
        absentTodayCounter.setAttribute('data-target', data.absentToday);
    }
    if (upcomingEventsCounter) {
        upcomingEventsCounter.setAttribute('data-target', data.upcomingEvents);
    }
}

// Loading State Indicators
function showLoadingState() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        counter.style.opacity = '0.5';
    });
}

function hideLoadingState() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        counter.style.opacity = '1';
    });
}

// Toast Notification
function showToast(message, type = 'success') {
    let toast = document.getElementById('dashboardToast');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'dashboardToast';
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
    `;
    document.head.appendChild(style);
}

// Auto-refresh Data (Every 2 Minutes)
setInterval(() => {
    fetchDashboardData();
}, 2 * 60 * 1000);

