const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:9090"
    : `${window.location.origin}`;

// Authentication check
window.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = 'signIn.html';
        return;
    }
    displayUserInfo();
    loadUserProfilePhoto(); 
    loadPendingMembers();
    loadTotalMessagesSent();
});

// Display user info
function displayUserInfo() {
    const userName = localStorage.getItem('userFullName') || localStorage.getItem('loggedInUser') || 'User';
    const displayFullName = document.getElementById('displayFullName');
    if (displayFullName) {
        displayFullName.textContent = userName;
    }
}


// ADDED - Load User Profile Photo
async function loadUserProfilePhoto() {
    const username = localStorage.getItem('loggedInUser');
    
    if (!username) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/profile/${username}`);
        
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
                    img.style.borderRadius = '50%'; 
                    
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

// Load total messages sent
async function loadTotalMessagesSent() {
    try {
        const response = await fetch(`${API_URL}/whatsapp/totalMessageSent`);
        if (!response.ok) {
            throw new Error('Failed to fetch total messages sent');
        }
        const count = await response.json();

        const messagesSentElement = document.getElementById('messagesSentCount');
        if (messagesSentElement) {
            messagesSentElement.textContent = count;
        }
    } catch (error) {
        console.error('Error loading total messages sent:', error);
        const messagesSentElement = document.getElementById('messagesSentCount');
        if (messagesSentElement) {
            messagesSentElement.textContent = '0';
        }
    }
}

// Load pending members
async function loadPendingMembers() {
    try {
        const response = await fetch(`${API_URL}/whatsapp/pending`);
        const members = await response.json();

        document.getElementById('pendingCount').textContent = members.length;

        const memberList = document.getElementById('memberList');

        if (members.length === 0) {
            memberList.innerHTML = `
                <div class="empty-state">
                    <span class="material-symbols-outlined">check_circle</span>
                    <p>No pending messages</p>
                </div>
            `;
            document.getElementById('sendButton').disabled = true;
        } else {
            memberList.innerHTML = members.map(member => `
                <div class="member-item">
                    <div class="member-info">
                        <h4>${member.fullName}</h4>
                        <div class="member-details">${member.phone} • ${member.code}</div>
                    </div>
                    <div class="member-status">
                        <span class="material-symbols-outlined" style="color: #ffc107;">schedule</span>
                    </div>
                </div>
            `).join('');
            document.getElementById('sendButton').disabled = false;
        }
    } catch (error) {
        showStatus('error', 'Failed to load data: ' + error.message);
    }
}

// Send all messages
async function sendAllMessages() {
    const button = document.getElementById('sendButton');
    button.disabled = true;
    button.innerHTML = '<span class="loading-spinner"></span> Sending Messages...';

    try {
        // Get the list of pending members first
        const membersResponse = await fetch(`${API_URL}/whatsapp/pending`);
        const members = await membersResponse.json();

        if (members.length === 0) {
            showStatus('error', 'No pending members to send messages to');
            button.disabled = false;
            button.innerHTML = '<span class="material-symbols-outlined">send</span> Send Messages to All Members';
            return;
        }

        // Send messages one by one and show progress
        let sentCount = 0;
        let failedCount = 0;

        for (let i = 0; i < members.length; i++) {
            const member = members[i];
            showStatus('loading', `Sending to ${member.fullName} (${member.phone})... ${i + 1}/${members.length}`);

            try {
                // Send individual message using the member code
                const response = await fetch(`${API_URL}/whatsapp/send/${member.code}`, {
                    method: 'POST'
                });

                const result = await response.text();

                if (response.ok && !result.includes('❌')) {
                    sentCount++;
                } else {
                    failedCount++;
                    console.error(`Failed to send to ${member.fullName}:`, result);
                }

                // Small delay between messages to avoid overwhelming the system
                await new Promise(resolve => setTimeout(resolve, 800));

            } catch (error) {
                failedCount++;
                console.error(`Error sending to ${member.fullName}:`, error);
            }
        }

        // Show final summary message
        if (failedCount === 0) {
            showStatus('success', `✅ Successfully sent ${sentCount} message(s) to all members!`);
        } else {
            showStatus('success', `✅ Sent ${sentCount} message(s). ${failedCount} failed. Check console for details.`);
        }

        // Reload both pending members and total messages sent count
        setTimeout(() => {
            loadPendingMembers();
            loadTotalMessagesSent(); // Refresh the total count after sending
        }, 2500);

    } catch (error) {
        showStatus('error', 'Connection error: ' + error.message);
    } finally {
        button.disabled = false;
        button.innerHTML = '<span class="material-symbols-outlined">send</span> Send Messages to All Members';
    }
}

// Show status message
function showStatus(type, message) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.className = 'status-message ' + type + ' show';

    let icon = '';
    if (type === 'success') icon = 'check_circle';
    else if (type === 'error') icon = 'error';
    else if (type === 'loading') icon = 'hourglass_empty';

    statusDiv.innerHTML = `
        <span class="material-symbols-outlined">${icon}</span>
        <span>${message}</span>
    `;

    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            statusDiv.classList.remove('show');
        }, 5000);
    }
}

// Toast Notification Function
function showToast(message, type = 'success') {
    let toast = document.getElementById('whatsappToast');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'whatsappToast';
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

// Add toast animation styles
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

// Sign Out with API Session Invalidation
const signOutBtn = document.getElementById('signOutBtn');
const signOutSpinner = document.getElementById('signOutSpinner');

if (signOutBtn) {
    signOutBtn.addEventListener('click', async function (e) {
        e.preventDefault();

        // Update UI to show loading state
        signOutBtn.classList.add('bg-danger', 'text-white');
        signOutBtn.style.pointerEvents = 'none';
        signOutSpinner.style.display = 'inline-block';

        // Update text if elements exist
        const signOutText = signOutBtn.querySelector('span:not(.material-symbols-outlined)');
        if (signOutText) {
            signOutText.textContent = 'Signing out...';
        }

        try {
            // Call the logout endpoint to invalidate session
            const response = await fetch(`${API_URL}/logout`, {
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

                // Show success message
                showToast('Logged out successfully!', 'success');

                // Redirect to sign-in page
                setTimeout(() => {
                    window.location.href = 'signIn.html';
                }, 500);
            } else {
                throw new Error(result.error || 'Logout failed');
            }

        } catch (error) {

            // Even if API call fails, clear local storage and redirect
            localStorage.clear();
            showToast('Session ended. Redirecting...', 'error');

            setTimeout(() => {
                window.location.href = 'signIn.html';
            }, 1000);
        }
    });
}