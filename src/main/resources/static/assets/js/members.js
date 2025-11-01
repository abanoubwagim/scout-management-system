// Authentication Check
window.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = localStorage.getItem('loggedInUser');

    if (!loggedInUser) {
        window.location.href = 'signIn.html';
        return;
    }

    displayUserInfo();
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


// Essential Page Elements
const btnAdd = document.getElementById('btnAddMember');
const addContentDiv = document.getElementById('addContentDiv');
const actionButtons = document.getElementById('actionButtons');
const searchInput = document.getElementById('searchInput');
const contents = document.querySelectorAll('#addContentDiv, #editContent, #removeContent, #attendContent, #showAllContent, #profileContent');
const buttons = actionButtons.querySelectorAll('button');
const exportPdfBtn = document.getElementById('exportPdfBtn');

// Global Validation Functions
function isCodeValid(val) {
    return /^\d{6}$/.test(val.trim());
}

function isPhoneValid(val) {
    const phone = val.trim();
    const pattern = /^01\d{9}$/;
    return pattern.test(phone);
}

function isNotEmpty(val) {
    return val.trim() !== '';
}

// Unified Code Validation Setup
function setupCodeValidation(input, button = null, errorDiv = null) {
    input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '');
        const valid = isCodeValid(input.value);
        input.classList.toggle('is-invalid', !valid);
        input.classList.toggle('is-valid', valid);
        if (errorDiv) errorDiv.style.display = valid ? 'none' : 'block';
        if (button) {
            button.classList.toggle('d-none', !valid);
            button.disabled = !valid;
        }
    });
}

// Unified Phone Validation Setup
function setupPhoneValidation(input, errorDiv = null) {
    input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '');
        const valid = isPhoneValid(input.value);
        input.classList.toggle('is-invalid', !valid);
        input.classList.toggle('is-valid', valid);
        if (errorDiv) errorDiv.style.display = valid ? 'none' : 'block';
    });
}


// Search Functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    const rows = document.querySelectorAll('#membersTableBody tr');

    let visibleCount = 0;

    rows.forEach(row => {
        if (row.cells.length < 3) {
            return;
        }

        const code = row.cells[0]?.textContent.toLowerCase() || '';
        const name = row.cells[1]?.textContent.toLowerCase() || '';

        if (code.includes(searchTerm) || name.includes(searchTerm)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    if (visibleCount === 0 && searchTerm !== '' && rows.length > 0) {
        const tbody = document.getElementById('membersTableBody');
        const existingNoResults = tbody.querySelector('.no-results-row');

        if (!existingNoResults) {
            const noResultsRow = document.createElement('tr');
            noResultsRow.className = 'no-results-row';
            noResultsRow.innerHTML = `
                <td colspan="3" class="text-center text-muted py-4">
                    <i class="bi bi-search me-2"></i>
                    No members found matching "${searchTerm}"
                </td>
            `;
            tbody.appendChild(noResultsRow);
        }
    } else {
        const noResultsRow = document.querySelector('.no-results-row');
        if (noResultsRow) {
            noResultsRow.remove();
        }
    }
});

function clearSearch() {
    searchInput.value = '';
    const rows = document.querySelectorAll('#membersTableBody tr');
    rows.forEach(row => {
        row.style.display = '';
    });
    const noResultsRow = document.querySelector('.no-results-row');
    if (noResultsRow) {
        noResultsRow.remove();
    }
}

// Section Navigation
btnAdd.addEventListener('click', () => {
    contents.forEach(c => c.classList.add('d-none'));
    addContentDiv.classList.toggle('d-none');

    buttons.forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline-primary');
    });

    searchInput.disabled = true;
    clearSearch();
    exportPdfBtn.classList.add('d-none');
});

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        contents.forEach(c => c.classList.add('d-none'));
        buttons.forEach(b => {
            b.classList.remove('btn-primary');
            b.classList.add('btn-outline-primary');
        });
        document.getElementById(targetId).classList.remove('d-none');
        btn.classList.remove('btn-outline-primary');
        btn.classList.add('btn-primary');

        if (targetId === 'showAllContent') {
            searchInput.disabled = false;
            searchInput.focus();
            exportPdfBtn.classList.remove('d-none');
            clearSearch();
        } else {
            searchInput.disabled = true;
            clearSearch();
            exportPdfBtn.classList.add('d-none');
        }
    });
});

window.addEventListener('DOMContentLoaded', () => {
    contents.forEach(c => c.classList.add('d-none'));
    document.getElementById('showAllContent').classList.remove('d-none');

    buttons.forEach(b => {
        if (b.getAttribute('data-target') === 'showAllContent') {
            b.classList.remove('btn-outline-primary');
            b.classList.add('btn-primary');
        } else {
            b.classList.remove('btn-primary');
            b.classList.add('btn-outline-primary');
        }
    });

    searchInput.disabled = false;
    searchInput.focus();
    exportPdfBtn.classList.remove('d-none');
});

//  Add Member Section
const memberCode = document.getElementById('memberCode');
const fullName = document.getElementById('fullName');
const titleSelect = document.getElementById('titleSelect');
const dob = document.getElementById('dob');
const phone = document.getElementById('phone');
const address = document.getElementById('address');
const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
const categoryCheckboxesDiv = document.getElementById('categoryCheckboxes');
const categoryError = document.getElementById('categoryError');
const saveBtn = document.getElementById('saveBtn');
const addAlert = document.getElementById('addAlert');
const memberForm = document.getElementById('memberForm');

//  Update Save Button State
function updateSaveBtn() {
    const categoryValid = isCategoryValid();
    const allValid =
        isCodeValid(memberCode.value) &&
        isPhoneValid(phone.value) &&
        isNotEmpty(fullName.value) &&
        titleSelect.value !== '' &&
        isNotEmpty(dob.value) &&
        isNotEmpty(address.value) &&
        categoryValid;

    categoryCheckboxesDiv.classList.toggle('is-valid', categoryValid);
    categoryCheckboxesDiv.classList.toggle('is-invalid', !categoryValid);
    categoryError.style.display = categoryValid ? 'none' : 'block';

    saveBtn.disabled = !allValid;
    saveBtn.style.opacity = allValid ? '1' : '0.5';
}

// Category Validation
function isCategoryValid() {
    const checkboxes = document.querySelectorAll('.category-checkbox');
    return Array.from(checkboxes).some(cb => cb.checked);
}

categoryCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
        const valid = isCategoryValid();
        categoryCheckboxesDiv.classList.toggle('is-valid', valid);
        categoryCheckboxesDiv.classList.toggle('is-invalid', !valid);
        categoryError.style.display = valid ? 'none' : 'block';
        updateSaveBtn();
    });
});

// Code Input Validation
memberCode.addEventListener('input', () => {
    memberCode.value = memberCode.value.replace(/\D/g, '').slice(0, 6);
    const valid = isCodeValid(memberCode.value);
    memberCode.classList.toggle('is-valid', valid);
    memberCode.classList.toggle('is-invalid', !valid);
    document.getElementById('codeError').style.display = valid ? 'none' : 'block';

    if (memberCode.value.length === 6) {
        const year = memberCode.value.substring(0, 2);
        const month = memberCode.value.substring(2, 4);
        const day = memberCode.value.substring(4, 6);

        const currentYear = new Date().getFullYear();
        const currentCentury = Math.floor(currentYear / 100) * 100;
        const yearNum = parseInt(year);
        let fullYear = currentCentury + yearNum;

        if (fullYear > currentYear) {
            fullYear -= 100;
        }

        const monthNum = parseInt(month);
        const dayNum = parseInt(day);

        if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
            const dateString = `${fullYear}-${month}-${day}`;
            const testDate = new Date(dateString);

            if (testDate.getMonth() + 1 === monthNum && testDate.getDate() === dayNum) {
                dob.value = dateString;
                dob.classList.add('is-valid');
                dob.classList.remove('is-invalid');
            }
        }
    }

    updateSaveBtn();
});

memberCode.addEventListener('blur', () => {
    document.getElementById('codeError').style.display = isCodeValid(memberCode.value) ? 'none' : 'block';
});

// Phone Input Validation
phone.addEventListener('input', () => {
    phone.value = phone.value.replace(/\D/g, '').slice(0, 11);
    const valid = isPhoneValid(phone.value);
    phone.classList.toggle('is-valid', valid);
    phone.classList.toggle('is-invalid', !valid);
    document.getElementById('phoneError').style.display = valid ? 'none' : 'block';
    updateSaveBtn();
});

phone.addEventListener('blur', () => {
    document.getElementById('phoneError').style.display = isPhoneValid(phone.value) ? 'none' : 'block';
});

// Other Fields Validation
[fullName, titleSelect, dob, address].forEach(input => {
    input.addEventListener('input', updateSaveBtn);
});

// Form Submit Handler
memberForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (saveBtn.disabled) return;

    saveBtn.disabled = true;
    const originalHTML = saveBtn.innerHTML;

    saveBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Saving...
    `;

    const selectedCategories = Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value)
        .join(', ');

    function convertToDD_MM_YYYY(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    const member = {
        code: memberCode.value.trim(),
        fullName: fullName.value.trim(),
        title: titleSelect.value,
        dateOfBirth: convertToDD_MM_YYYY(dob.value),
        phone: phone.value.trim(),
        address: address.value.trim(),
        category: selectedCategories,
        sent: false
    };

    try {
        const response = await fetch('http://localhost:9090/members/addMember', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(member)
        });

        if (response.ok) {
            await refreshMembersList();

            saveBtn.innerHTML = `
                <span class="me-1">✅</span>
                Saved!
            `;

            addAlert.textContent = '✅ Member saved successfully!';
            addAlert.classList.remove('d-none', 'alert-danger');
            addAlert.classList.add('alert-success');

            setTimeout(() => {
                memberCode.value = '';
                phone.value = '';
                fullName.value = '';
                titleSelect.value = '';
                dob.value = '';
                address.value = '';
                categoryCheckboxes.forEach(cb => cb.checked = false);

                [memberCode, phone, fullName, titleSelect, dob, address].forEach(f => {
                    f.classList.remove('is-valid', 'is-invalid');
                });
                categoryCheckboxesDiv.classList.remove('is-valid', 'is-invalid');

                saveBtn.innerHTML = originalHTML;
                saveBtn.disabled = false;
                updateSaveBtn();

                addAlert.classList.add('d-none');
            }, 1500);

        } else {
            const errorText = await response.text();

            addAlert.textContent = `❌ ${errorText || 'Error saving member!'}`;
            addAlert.classList.remove('d-none', 'alert-success');
            addAlert.classList.add('alert-danger');

            saveBtn.innerHTML = originalHTML;
            saveBtn.disabled = false;
            updateSaveBtn();

            setTimeout(() => {
                addAlert.classList.add('d-none');
            }, 5000);
        }
    } catch (error) {
        addAlert.textContent = '⚠️ Network error. Please check if the server is running on port 9090.';
        addAlert.classList.remove('d-none', 'alert-success');
        addAlert.classList.add('alert-danger');

        saveBtn.innerHTML = originalHTML;
        saveBtn.disabled = false;
        updateSaveBtn();

        setTimeout(() => {
            addAlert.classList.add('d-none');
        }, 5000);
    }
});

// Auto-generate Code from Date of Birth
dob.addEventListener('change', () => {
    if (dob.value) {
        const date = new Date(dob.value);
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        memberCode.value = year + month + day;

        const valid = isCodeValid(memberCode.value);
        memberCode.classList.toggle('is-valid', valid);
        memberCode.classList.toggle('is-invalid', !valid);
        document.getElementById('codeError').style.display = valid ? 'none' : 'block';
        updateSaveBtn();
    }
});

// Set Date Constraints
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const maxDate = today.toISOString().split('T')[0];
    dob.setAttribute('max', maxDate);

    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 100);
    dob.setAttribute('min', minDate.toISOString().split('T')[0]);

    dob.addEventListener('focus', () => {
        dob.parentElement.style.transform = 'scale(1.02)';
    });

    dob.addEventListener('blur', () => {
        dob.parentElement.style.transform = 'scale(1)';
    });
});


// Edit Member Section
const editCode = document.getElementById('editCode');
const editFullName = document.getElementById('editFullName');
const editTitleSelect = document.getElementById('editTitleSelect');
const editDob = document.getElementById('editDob');
const editPhone = document.getElementById('editPhone');
const editAddress = document.getElementById('editAddress');
const editCategoryCheckboxes = document.querySelectorAll('.edit-category-checkbox');
const editCategoryCheckboxesDiv = document.getElementById('editCategoryCheckboxes');
const editCategoryError = document.getElementById('editCategoryError');
const searchMemberBtn = document.getElementById('btnSearchMember');
const saveChangesBtn = document.getElementById('btnSaveChanges');
const editFields = document.getElementById('editFields');
const editMessage = document.getElementById('editMessage');
const editCodeError = document.getElementById('editCodeError');
const editPhoneError = document.getElementById('editPhoneError');
const editForm = document.getElementById('editForm');

function isEditCategoryValid() {
    const checkboxes = document.querySelectorAll('.edit-category-checkbox');
    return Array.from(checkboxes).some(cb => cb.checked);
}

// Update Save Changes Button State
function updateSaveChangesBtn() {
    const allValid =
        isCodeValid(editCode.value) &&
        isPhoneValid(editPhone.value) &&
        isNotEmpty(editFullName.value) &&
        editTitleSelect.value !== '' &&
        isNotEmpty(editDob.value) &&
        isNotEmpty(editAddress.value) &&
        isEditCategoryValid();

    if (!editFields.classList.contains('d-none')) {
        saveChangesBtn.disabled = !allValid;
        saveChangesBtn.style.opacity = allValid ? '1' : '0.5';
    }
}

editCategoryCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
        const valid = isEditCategoryValid();
        editCategoryCheckboxesDiv.classList.toggle('is-valid', valid);
        editCategoryCheckboxesDiv.classList.toggle('is-invalid', !valid);
        editCategoryError.style.display = valid ? 'none' : 'block';
        updateSaveChangesBtn();
    });
});

editCode.addEventListener('input', () => {
    editCode.value = editCode.value.replace(/\D/g, '').slice(0, 6);

    const codeLength = editCode.value.length;
    const valid = codeLength === 6;

    editCode.classList.toggle('is-valid', valid);
    editCode.classList.toggle('is-invalid', !valid && codeLength > 0);

    if (codeLength === 0) {
        editCodeError.classList.add('d-none');
    } else if (codeLength < 6) {
        editCodeError.classList.remove('d-none');
    } else {
        editCodeError.classList.add('d-none');
    }

    searchMemberBtn.disabled = !valid;

    if (codeLength < 6) {
        editFields.classList.add('d-none');
        saveChangesBtn.classList.add('d-none');
        [editFullName, editTitleSelect, editDob, editPhone, editAddress].forEach(f => {
            f.value = '';
            f.classList.remove('is-valid', 'is-invalid');
        });
        editCategoryCheckboxes.forEach(cb => cb.checked = false);
    }
});

editPhone.addEventListener('input', () => {
    editPhone.value = editPhone.value.replace(/\D/g, '').slice(0, 11);

    const phoneLength = editPhone.value.length;
    const valid = phoneLength === 11;

    editPhone.classList.toggle('is-valid', valid);
    editPhone.classList.toggle('is-invalid', !valid && phoneLength > 0);

    if (phoneLength === 0) {
        editPhoneError.classList.add('d-none');
    } else if (phoneLength < 11) {
        editPhoneError.classList.remove('d-none');
    } else {
        editPhoneError.classList.add('d-none');
    }

    updateSaveChangesBtn();
});

[editFullName, editTitleSelect, editDob, editAddress].forEach(input => {
    input.addEventListener('blur', updateSaveChangesBtn);
    input.addEventListener('input', updateSaveChangesBtn);
});

searchMemberBtn.addEventListener('click', async () => {
    if (!isCodeValid(editCode.value)) return;

    const code = editCode.value.trim();

    searchMemberBtn.disabled = true;
    const originalText = searchMemberBtn.textContent;
    searchMemberBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2"></span>
        Searching...
    `;

    try {
        const response = await fetch(`http://localhost:9090/members/member/${code}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const member = await response.json();

            searchMemberBtn.innerHTML = `
                <span class="me-1">✅</span>
                Found!
            `;

            editFields.classList.remove('d-none');
            saveChangesBtn.classList.remove('d-none');

            editFullName.value = member.fullName || '';
            editTitleSelect.value = member.title || '';
            editPhone.value = member.phone || '';
            editAddress.value = member.address || '';

            if (member.dateOfBirth) {
                const [day, month, year] = member.dateOfBirth.split('/');
                editDob.value = `${year}-${month}-${day}`;
            }

            const categories = member.category ? member.category.split(', ') : [];
            editCategoryCheckboxes.forEach(cb => {
                cb.checked = categories.includes(cb.value);
            });

            updateSaveChangesBtn();

            showEditMessage('Member found! You can now edit the details.', 'success');

            setTimeout(() => {
                searchMemberBtn.textContent = originalText;
                searchMemberBtn.disabled = false;
            }, 1000);

        } else {
            editFields.classList.add('d-none');
            saveChangesBtn.classList.add('d-none');

            showEditMessage('❌ Member not found with this code.', 'danger');

            searchMemberBtn.textContent = originalText;
            searchMemberBtn.disabled = false;
        }

    } catch (error) {
        editFields.classList.add('d-none');
        saveChangesBtn.classList.add('d-none');
        showEditMessage('⚠️ Network error. Please check if the server is running.', 'danger');

        searchMemberBtn.textContent = originalText;
        searchMemberBtn.disabled = false;
    }
});

editForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (saveChangesBtn.disabled) return;

    saveChangesBtn.disabled = true;
    const originalHTML = saveChangesBtn.innerHTML;

    saveChangesBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Saving...
    `;

    const selectedCategories = Array.from(editCategoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value)
        .join(', ');

    function convertToDD_MM_YYYY(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    const updatedMember = {
        code: editCode.value.trim(),
        fullName: editFullName.value.trim(),
        title: editTitleSelect.value,
        dateOfBirth: convertToDD_MM_YYYY(editDob.value),
        phone: editPhone.value.trim(),
        address: editAddress.value.trim(),
        category: selectedCategories,
        sent: false
    };

    try {
        const response = await fetch(`http://localhost:9090/members/update/${updatedMember.code}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedMember)
        });

        if (response.ok) {
            await refreshMembersList();

            saveChangesBtn.innerHTML = `
                <span class="me-1">✅</span>
                Saved!
            `;

            showEditMessage('✅ Member updated successfully!', 'success');

            setTimeout(() => {
                [editCode, editFullName, editTitleSelect, editDob, editPhone, editAddress].forEach(f => {
                    f.value = '';
                    f.classList.remove('is-valid', 'is-invalid');
                });
                editCategoryCheckboxes.forEach(cb => cb.checked = false);
                editFields.classList.add('d-none');
                saveChangesBtn.classList.add('d-none');
                searchMemberBtn.disabled = true;

                saveChangesBtn.innerHTML = originalHTML;
                saveChangesBtn.disabled = false;

                setTimeout(() => {
                    editMessage.style.display = 'none';
                }, 2000);
            }, 1500);

        } else {
            const errorText = await response.text();
            showEditMessage(`❌ ${errorText || 'Error updating member!'}`, 'danger');

            saveChangesBtn.innerHTML = originalHTML;
            saveChangesBtn.disabled = false;
            updateSaveChangesBtn();
        }

    } catch (error) {
        showEditMessage('⚠️ Network error. Please check if the server is running.', 'danger');

        saveChangesBtn.innerHTML = originalHTML;
        saveChangesBtn.disabled = false;
        updateSaveChangesBtn();
    }
});

function showEditMessage(message, type = 'success') {
    editMessage.textContent = message;
    editMessage.className = `alert alert-${type} mt-3`;
    editMessage.style.display = 'block';

    setTimeout(() => {
        editMessage.style.display = 'none';
    }, 5000);
}


// Remove Member Section
const inputRemove = document.getElementById('memberCodeRemove');
const buttonRemove = document.getElementById('removeBtnMemeber');
const alertBox = document.getElementById('removeAlert');

setupCodeValidation(inputRemove, buttonRemove);

if (inputRemove && buttonRemove && alertBox) {
    buttonRemove.addEventListener('click', async () => {
        const code = inputRemove.value.trim().toUpperCase();

        if (!code || code.length !== 6) {
            return;
        }

        buttonRemove.disabled = true;
        const originalText = buttonRemove.textContent;
        buttonRemove.textContent = 'Deleting... ⏳';

        try {
            const response = await fetch(`http://localhost:9090/members/delete/${code}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                await refreshMembersList();

                buttonRemove.textContent = 'Deleted ✅';

                alertBox.textContent = '✅ Member deleted successfully.';
                alertBox.className = 'alert alert-success mt-3 w-50 p-2';
                alertBox.classList.remove('d-none');

                setTimeout(() => {
                    inputRemove.value = '';
                    inputRemove.classList.remove('is-valid', 'is-invalid');
                    buttonRemove.classList.add('d-none');

                    buttonRemove.disabled = false;
                    buttonRemove.textContent = originalText;

                    alertBox.classList.add('d-none');
                }, 1500);
            } else {
                const errorMessage = await response.text();
                alertBox.textContent = `❌ ${errorMessage || 'Member not found'}`;
                alertBox.className = 'alert alert-danger mt-3 w-50 p-2';
                alertBox.classList.remove('d-none');

                buttonRemove.disabled = false;
                buttonRemove.textContent = originalText;

                setTimeout(() => alertBox.classList.add('d-none'), 3000);
            }
        } catch (error) {
            alertBox.textContent = '❌ Failed to connect to server. Please try again.';
            alertBox.className = 'alert alert-danger mt-3 w-50 p-2';
            alertBox.classList.remove('d-none');

            buttonRemove.disabled = false;
            buttonRemove.textContent = originalText;

            setTimeout(() => alertBox.classList.add('d-none'), 3000);
        }
    });
}


// Attend Member Section - FULL CODE
const attendInput = document.getElementById('memberCodeattend');
const attendBtn = document.querySelector('#attendContent button');
const attendAlert = document.querySelector('#attendContent .alert');
const fineQuestion = document.getElementById('fineQuestion');
const fineAmountDiv = document.getElementById('fineAmountDiv');
const btnFineYes = document.getElementById('btnFineYes');
const btnFineNo = document.getElementById('btnFineNo');
const fineAmountInput = document.getElementById('fineAmount');
const btnPayFine = document.getElementById('btnPayFine');

let currentAttendMember = null;
let selectedCategory = null;

setupCodeValidation(attendInput, attendBtn);

function resetAttendSection() {
    attendBtn.classList.add('d-none');
    attendBtn.disabled = false;
    fineQuestion.classList.add('d-none');
    fineQuestion.classList.remove('show');
    fineAmountDiv.classList.add('d-none');
    btnPayFine.classList.add('d-none');
    fineAmountInput.value = '';

    const categorySelection = document.getElementById('categorySelection');
    if (categorySelection) {
        categorySelection.remove();
    }

    currentAttendMember = null;
    selectedCategory = null;
}

function resetAttendInput() {
    attendInput.classList.remove('is-valid', 'is-invalid');
}

function isScoutLeader(member) {
    return member && member.title && member.title.toLowerCase() === 'scout leader';
}

// فحص إذا حضر المستخدم في category معينة اليوم
async function checkIfAlreadyAttendedCategory(code, category) {
    try {
        const response = await fetch(`http://localhost:9090/members/checkAttendance/${code}/${category}`);

        if (!response.ok) return false;

        const result = await response.json();

        if (typeof result === 'boolean') {
            return result;
        }
        if ('hasAttended' in result) {
            return result.hasAttended;
        }
        if ('attended' in result) {
            return result.attended;
        }

        return false;
    } catch (error) {
        console.error('Error checking attendance:', error);
        return false;
    }
}

attendInput.addEventListener('input', () => {
    if (isCodeValid(attendInput.value)) {
        attendBtn.classList.remove('d-none');
    } else {
        resetAttendSection();
    }
});

attendBtn.addEventListener('click', async () => {
    if (!isCodeValid(attendInput.value)) {
        resetAttendSection();
        return;
    }

    const code = attendInput.value.trim();

    attendBtn.disabled = true;
    const originalText = attendBtn.textContent;
    attendBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2"></span>
        Loading...
    `;

    try {
        const response = await fetch(`http://localhost:9090/members/member/${code}`);

        if (!response.ok) {
            throw new Error('Member not found');
        }

        const member = await response.json();
        currentAttendMember = member;

        let categories = [];
        if (member.category) {
            if (typeof member.category === 'string') {
                categories = member.category.split(',').map(cat => cat.trim());
            } else if (Array.isArray(member.category)) {
                categories = member.category;
            }
        }

        attendBtn.innerHTML = originalText;
        attendBtn.disabled = false;
        attendBtn.classList.add('d-none');

        if (categories.length === 0) {
            showAttendError('Member has no categories assigned.');
        } else if (categories.length === 1 && isScoutLeader(member)) {
            selectedCategory = categories[0];
            await markAttendanceDirectly(member.code, selectedCategory);
        } else {
            showCategorySelection(categories, member.fullName);
        }

    } catch (error) {
        attendBtn.innerHTML = originalText;
        attendBtn.disabled = false;
        showAttendError('Failed to load member details. Please try again.');
    }
});

async function markAttendanceDirectly(code, category) {
    try {
        const response = await fetch("http://localhost:9090/members/attend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code: code,
                category: category,
                amount: 0
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            showAttendError(errorText);
            return;
        }

        const categoryText = category ? ` (${category})` : '';
        attendAlert.textContent = `✅ Attendance recorded successfully${categoryText}.`;
        attendAlert.className = 'alert alert-success mt-3 w-50 p-2';
        attendAlert.classList.remove('d-none');

        attendInput.value = '';
        resetAttendInput();
        resetAttendSection();

        setTimeout(() => attendAlert.classList.add('d-none'), 2500);
    } catch (err) {
        showAttendError('Error while recording attendance.');
    }
}

function isCategoryTimeActive(category) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const parseTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const timeWindows = {
        'Scouts and Guides': {
            start: parseTime('11:55'),  // 11:55 AM 
            end: parseTime('12:30')     // 12:30 PM 
        },
        'Cubs and Blossoms': {
            start: parseTime('11:55'),  // 11:55 AM
            end: parseTime('12:30')     // 12:30 PM 
        },
        'Buds': {
            start: parseTime('11:00'),  // 11:00 AM
            end: parseTime('11:50')     // 11:50 AM
        }
    };

    const window = timeWindows[category];
    if (!window) return false;

    if (window.end < window.start) {
        
		return currentTimeInMinutes >= window.start || currentTimeInMinutes <= window.end;
    } else {
        return currentTimeInMinutes >= window.start && currentTimeInMinutes <= window.end;
    }
}

function getCategoryTimeRange(category) {
    const timeRanges = {
        'Scouts and Guides': '11:55 AM - 12:30 PM', 
        'Cubs and Blossoms': '11:55 AM - 12:30 PM',
        'Buds': '11:00 AM - 11:50 AM'
    };
    return timeRanges[category] || '';
}

function showCategorySelection(categories, memberName) {
    const existingSelection = document.getElementById('categorySelection');
    if (existingSelection) {
        existingSelection.remove();
    }

    const isLeader = isScoutLeader(currentAttendMember);

    const categoryDiv = document.createElement('div');
    categoryDiv.id = 'categorySelection';
    categoryDiv.className = 'mt-4 text-center p-3 rounded-3 border shadow-sm bg-white w-75 mx-auto';
    categoryDiv.style.maxWidth = '500px';
    categoryDiv.style.transition = 'all 0.3s ease';
    categoryDiv.setAttribute('role', 'dialog');
    categoryDiv.setAttribute('aria-labelledby', 'categorySelectionTitle');

    categoryDiv.innerHTML = `
        <div class="d-flex flex-column align-items-center">
            <span class="material-symbols-outlined text-primary mb-2" style="font-size: 36px;" aria-hidden="true">
                category
            </span>
            <p id="categorySelectionTitle" class="fw-semibold mb-2 fs-5 text-dark">
                ${memberName}
                ${isLeader ? '<span class="badge bg-success ms-2" style="font-size: 0.7rem;">Scout Leader</span>' : ''}
            </p>
            <p class="text-muted mb-3 fs-6">
                Select the category for attendance:
            </p>
            <div class="d-flex flex-column gap-2 w-100" id="categoryButtons">
                ${categories.map((cat) => {
        const isActive = isLeader ? true : isCategoryTimeActive(cat);
        const timeRange = getCategoryTimeRange(cat);
        const disabledClass = !isActive ? 'disabled' : '';
        const btnClass = isActive ? 'btn-outline-primary' : 'btn-outline-secondary';

        return `
                        <button class="btn ${btnClass} category-select-btn ${disabledClass}" 
                                data-category="${cat}"
                                ${!isActive ? 'disabled' : ''}
                                style="padding: 0.75rem; font-weight: 500; ${!isActive ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
                            <div class="d-flex align-items-center justify-content-between w-100">
                                <div class="d-flex align-items-center">
                                    <span class="material-symbols-outlined me-2" style="font-size: 20px; vertical-align: middle;">
                                        ${getCategoryIcon(cat)}
                                    </span>
                                    <span>${cat}</span>
                                </div>
                                ${!isLeader ? `
                                <small class="text-muted ms-2" style="font-size: 0.75rem;">
                                    ${timeRange}
                                </small>
                                ` : ''}
                            </div>
                            ${!isActive && !isLeader ? '<small class="d-block text-danger mt-1" style="font-size: 0.7rem;">⏰ Time window closed</small>' : ''}
                        </button>
                    `;
    }).join('')}
            </div>
            ${!isLeader ? `
            <div class="mt-3 text-muted" style="font-size: 0.85rem;">
                <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">info</span>
                You can only attend during the category's time window
            </div>
            ` : `
            <div class="mt-3 text-success" style="font-size: 0.85rem;">
                <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">verified</span>
                Scout Leaders can attend anytime without time restrictions
            </div>
            `}
        </div>
    `;

    const attendContent = document.getElementById('attendContent');
    const attendInputContainer = attendContent.querySelector('.d-flex.flex-column');
    attendInputContainer.appendChild(categoryDiv);

    setTimeout(() => {
        categoryDiv.style.opacity = '1';
        categoryDiv.style.transform = 'translateY(0)';
    }, 50);

    // إعداد أزرار الـ categories
    const categoryButtons = categoryDiv.querySelectorAll('.category-select-btn:not(.disabled)');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            selectedCategory = btn.getAttribute('data-category');

            // تعطيل جميع الأزرار
            categoryButtons.forEach(b => b.disabled = true);

            btn.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2"></span>
                Checking...
            `;

            // فحص إذا حضر في هذه الـ category قبل كده - IMMEDIATELY
            const hasAttended = await checkIfAlreadyAttendedCategory(currentAttendMember.code, selectedCategory);

            if (hasAttended) {
                // حضر قبل كده في هذه الـ category - STOP HERE
                categoryDiv.remove();
                showAttendError(`Already attended today for ${selectedCategory}.`);
                attendInput.value = '';
                resetAttendInput();
                resetAttendSection();
                return; // EXIT - لا تكمل أي كود بعد كده
            }

            // لم يحضر بعد - استمر في العملية
            btn.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2"></span>
                Selected
            `;

            // الآن اعمل setTimeout بس لو مش حاضر
            setTimeout(() => {
                categoryDiv.remove();

                if (isLeader) {
                    markAttendanceDirectly(currentAttendMember.code, selectedCategory);
                } else {
                    showFineQuestion();
                }
            }, 500);
        });
    });

    const codeWatcher = () => {
        if (!isCodeValid(attendInput.value)) {
            resetAttendSection();
            attendInput.removeEventListener('input', codeWatcher);
        }
    };
    attendInput.addEventListener('input', codeWatcher);
}

function getCategoryIcon(category) {
    const icons = {
        'Scouts and Guides': 'hiking',
        'Cubs and Blossoms': 'sports_kabaddi',
        'Buds': 'child_care'
    };
    return icons[category] || 'group';
}

function showFineQuestion() {
    fineQuestion.classList.remove('d-none');
    setTimeout(() => fineQuestion.classList.add('show'), 50);

    const codeWatcher = () => {
        if (!isCodeValid(attendInput.value)) {
            resetAttendSection();
            attendInput.removeEventListener('input', codeWatcher);
        }
    };
    attendInput.addEventListener('input', codeWatcher);
}

function showAttendError(message) {
    attendAlert.textContent = `❌ ${message}`;
    attendAlert.className = 'alert alert-danger mt-3 w-50 p-2';
    attendAlert.classList.remove('d-none');

    setTimeout(() => {
        attendAlert.classList.add('d-none');
        resetAttendSection();
    }, 3000);
}

btnFineNo.addEventListener('click', async () => {
    fineQuestion.classList.add('d-none');

    if (!currentAttendMember || !selectedCategory) {
        showAttendError('Member or category missing.');
        return;
    }

    await markAttendanceDirectly(currentAttendMember.code, selectedCategory);
});

btnFineYes.addEventListener('click', () => {
    fineQuestion.classList.add('d-none');
    fineAmountDiv.classList.remove('d-none');
});

fineAmountInput.addEventListener('input', () => {
    const value = parseFloat(fineAmountInput.value);

    if (isNaN(value) || value <= 0 || !isCodeValid(attendInput.value)) {
        fineAmountInput.classList.add('is-invalid');
        btnPayFine.classList.add('d-none');
        if (!isCodeValid(attendInput.value)) fineAmountDiv.classList.add('d-none');
    } else {
        fineAmountInput.classList.remove('is-invalid');
        btnPayFine.classList.remove('d-none');
        fineAmountDiv.classList.remove('d-none');
    }
});

btnPayFine.addEventListener('click', async () => {
    const amount = parseFloat(fineAmountInput.value);
    if (isNaN(amount) || amount <= 0 || !isCodeValid(attendInput.value)) {
        alert('Please enter a valid fine amount.');
        return;
    }

    btnPayFine.disabled = true;
    btnPayFine.textContent = 'Processing... ⏳';

    try {
        const response = await fetch("http://localhost:9090/members/attend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code: currentAttendMember.code,
                category: selectedCategory,
                amount: amount
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            showAttendError(errorText);
            btnPayFine.disabled = false;
            btnPayFine.textContent = 'Pay Fine';
            return;
        }

        const categoryText = selectedCategory ? ` (${selectedCategory})` : '';
        attendAlert.textContent = `✅ Fine paid (${amount} EGP) and attendance marked${categoryText}.`;
        attendAlert.className = 'alert alert-success mt-3 w-50 p-2';
        attendAlert.classList.remove('d-none');

        fineAmountDiv.classList.add('d-none');
        btnPayFine.disabled = false;
        btnPayFine.textContent = 'Pay Fine';
        attendInput.value = '';
        fineAmountInput.value = '';
        resetAttendInput();
        resetAttendSection();

        setTimeout(() => attendAlert.classList.add('d-none'), 2500);
    } catch (err) {
        showAttendError('Error while paying fine.');
    }
});



// Fetch and Display All Members
const membersTableBody = document.getElementById('membersTableBody');
const profileContent = document.getElementById('profileContent');
const content = document.querySelectorAll('section[id$="Content"]');

const profileCode = document.getElementById('profileCode');
const profileFullName = document.getElementById('profileFullName');
const profileTitle = document.getElementById('profileTitle');
const profileDob = document.getElementById('profileDob');
const profilePhone = document.getElementById('profilePhone');
const profileAddress = document.getElementById('profileAddress');
const profileCategory = document.getElementById('profileCategory');

async function loadAllMembers() {
    try {
        const response = await fetch('http://localhost:9090/members/allMembers');

        if (!response.ok) {
            throw new Error('Failed to fetch members');
        }

        const members = await response.json();
        displayMembers(members);
    } catch (error) {
        membersTableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-danger text-center py-4">
                    ❌ Member not found with this code.
                </td>
            </tr>
        `;
    }
}

let allMembersData = [];

function displayMembers(members) {
    allMembersData = members;

    if (members.length === 0) {
        membersTableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-secondary text-center py-4">
                    No members found.
                </td>
            </tr>
        `;
        document.getElementById('exportPdfBtn')?.classList.add('d-none');
        return;
    }

    membersTableBody.innerHTML = members.map(member => `
        <tr class="align-middle">
            <td class="text-secondary">${member.code}</td>
            <td class="fw-medium">${member.fullName}</td>
            <td>
                <button class="btn btn-outline-primary btn-sm profile-btn" 
                        data-code="${member.code}"
                        aria-label="View profile of ${member.fullName}">
                    <i class="bi bi-person-circle me-1" aria-hidden="true"></i> Profile
                </button>
            </td>
        </tr>
    `).join('');

    attachProfileButtonListeners();

    document.getElementById('exportPdfBtn')?.classList.remove('d-none');
}

function attachProfileButtonListeners() {
    document.querySelectorAll('.profile-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const code = btn.getAttribute('data-code');
            await loadMemberProfile(code);
        });
    });
}

async function loadMemberProfile(code) {
    try {
        content.forEach(c => c.classList.add('d-none'));
        profileContent.classList.remove('d-none');

        profileCode.value = 'Loading...';
        profileFullName.value = '';
        profileTitle.value = '';
        profileDob.value = '';
        profilePhone.value = '';
        profileAddress.value = '';
        profileCategory.value = '';

        const response = await fetch(`http://localhost:9090/members/member/${code}`);

        if (!response.ok) {
            throw new Error('Member not found');
        }

        const member = await response.json();

        profileCode.value = member.code;
        profileFullName.value = member.fullName;
        profileTitle.value = member.title || 'N/A';

        profileDob.value = member.dob || member.dateOfBirth || member.birthDate || 'N/A';

        profilePhone.value = member.phone || 'N/A';
        profileAddress.value = member.address || 'N/A';

        if (member.categories) {
            if (Array.isArray(member.categories)) {
                profileCategory.value = member.categories.join(', ');
            } else if (typeof member.categories === 'string') {
                profileCategory.value = member.categories;
            } else {
                profileCategory.value = 'N/A';
            }
        } else if (member.category) {
            if (Array.isArray(member.category)) {
                profileCategory.value = member.category.join(', ');
            } else {
                profileCategory.value = member.category;
            }
        } else {
            profileCategory.value = 'N/A';
        }

    } catch (error) {
        alert('Failed to load member profile. Please try again.');

        content.forEach(c => c.classList.add('d-none'));
        document.getElementById('showAllContent').classList.remove('d-none');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadAllMembers();
});

function refreshMembersList() {
    loadAllMembers();
}


// Export PDF Functionality
exportPdfBtn.addEventListener('click', async () => {
    try {
        const { jsPDF } = window.jspdf;

        if (!jsPDF) {
            showAlert('error', 'PDF library not loaded. Please refresh the page and try again.');
            return;
        }

        exportPdfBtn.disabled = true;
        const originalHTML = exportPdfBtn.innerHTML;
        exportPdfBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Generating PDF...
        `;

        try {
            await generatePDF();
            showAlert('success', 'PDF generated successfully!');

            setTimeout(() => {
                exportPdfBtn.innerHTML = originalHTML;
                exportPdfBtn.disabled = false;
            }, 1000);
        } catch (error) {
            showAlert('error', error.message || 'Failed to generate PDF. Please try again.');
            exportPdfBtn.innerHTML = originalHTML;
            exportPdfBtn.disabled = false;
        }

    } catch (error) {
        showAlert('error', 'An unexpected error occurred. Please try again.');
        const originalHTML = `<span class="material-symbols-outlined" aria-hidden="true">picture_as_pdf</span> <span>Export as PDF</span>`;
        exportPdfBtn.innerHTML = originalHTML;
        exportPdfBtn.disabled = false;
    }
});

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
}

async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const currentDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    const tableBody = [];

    if (!allMembersData || allMembersData.length === 0) {
        throw new Error('No members found to export');
    }

    allMembersData.forEach(member => {
        const code = member.code || 'N/A';
        const name = member.fullName || 'N/A';
        const phone = member.phone || 'N/A';
        const title = member.title || 'N/A';

        let categories = 'N/A';
        if (member.category) {
            if (typeof member.category === 'string') {
                categories = member.category;
            } else if (Array.isArray(member.category)) {
                categories = member.category.map(cat => cat.name || cat).join(', ');
            }
        } else if (member.categories) {
            if (Array.isArray(member.categories)) {
                categories = member.categories.map(cat => cat.name || cat).join(', ');
            } else if (typeof member.categories === 'string') {
                categories = member.categories;
            }
        }

        tableBody.push([code, name, phone, title, categories]);
    });

    if (tableBody.length === 0) {
        throw new Error('No visible members to export.');
    }

    let logo = null;
    try {
        logo = await loadImage('assets/img/lg-pdf.png');
    } catch (error) {
        // Continue without logo
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Add header only on first page
    if (logo) {
        const imgWidth = 25;
        const imgHeight = 25;
        doc.addImage(logo, 'PNG', pageWidth - imgWidth - 14, 13, imgWidth, imgHeight);
    }

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Scout Manager', 14, 20);

    doc.setFontSize(16);
    doc.text('Members List', 14, 30);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Generated: ${currentDate}`, 14, 37);
    doc.text(`Total Members: ${tableBody.length}`, 14, 42);

    doc.setTextColor(0);
    doc.setDrawColor(200);
    doc.line(14, 45, pageWidth - 14, 45);

    doc.autoTable({
        head: [['Code', 'Name', 'Phone', 'Title', 'Category']],
        body: tableBody,
        startY: 50,  // Start after header on first page
        theme: 'grid',
        styles: {
            fontSize: 9,
            cellPadding: 3,
            overflow: 'linebreak',
            halign: 'left',
            font: 'helvetica'
        },
        headStyles: {
            fillColor: [33, 37, 41],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { cellWidth: 22, halign: 'center' },
            1: { cellWidth: 40 },
            2: { cellWidth: 30 },
            3: { cellWidth: 35 },
            4: { cellWidth: 'auto' }
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        margin: { top: 20, left: 14, right: 14 },  // Changed top margin for subsequent pages
        didDrawPage: (data) => {
            // Only add footer (header is already drawn on first page)
            const pageNum = doc.internal.getCurrentPageInfo().pageNumber;
            const totalPages = doc.internal.getNumberOfPages();
            addFooter(doc, pageHeight, pageNum, totalPages);
        }
    });

    // Remove the duplicate footer loop since didDrawPage already handles it
    // The following code is no longer needed:
    // const pageCount = doc.internal.getNumberOfPages();
    // for (let i = 1; i <= pageCount; i++) {
    //     doc.setPage(i);
    //     addFooter(doc, pageHeight, i, pageCount);
    // }

    const cairoDate = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Cairo' });
    const [day, month, year] = cairoDate.split(',')[0].split('/');
    const timestamp = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    const filename = `Scout_Members_${timestamp}.pdf`;
    doc.save(filename);
}

function addFooter(doc, pageHeight, currentPage = null, totalPages = null) {
    doc.setFontSize(9);
    doc.setTextColor(150);

    const footerY = pageHeight - 10;

    if (currentPage !== null && totalPages !== null) {
        doc.text(
            `Page ${currentPage} of ${totalPages}`,
            doc.internal.pageSize.width / 2,
            footerY,
            { align: 'center' }
        );
    }

    doc.text('Scout Manager © 2025', 14, footerY);
}

function showAlert(type, message) {
    let alertBox = document.getElementById('pdfExportAlert');

    if (!alertBox) {
        alertBox = document.createElement('div');
        alertBox.id = 'pdfExportAlert';
        alertBox.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            min-width: 300px;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
        `;
        document.body.appendChild(alertBox);
    }

    if (type === 'success') {
        alertBox.style.backgroundColor = '#d1e7dd';
        alertBox.style.color = '#0f5132';
        alertBox.style.border = '1px solid #badbcc';
        alertBox.innerHTML = `
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
            <span>${message}</span>
        `;
    } else {
        alertBox.style.backgroundColor = '#f8d7da';
        alertBox.style.color = '#842029';
        alertBox.style.border = '1px solid #f5c2c7';
        alertBox.innerHTML = `
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
            <span>${message}</span>
        `;
    }

    alertBox.style.display = 'flex';

    setTimeout(() => {
        alertBox.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, 300);
    }, 3000);
}

if (!document.getElementById('pdfAlertStyles')) {
    const style = document.createElement('style');
    style.id = 'pdfAlertStyles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Display Current Date
const currentDate = new Date();
document.getElementById("currentDate").textContent = currentDate.toLocaleDateString("en-GB", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

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