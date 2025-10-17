// --- Firebase Configuration is in firebase-config.js ---

const PRICING = {
    sanctuary: { hourly: 150, daily: 500, minHours: 2 },
    fellowship: { hourly: 50, daily: 150, minHours: 2 },
    classroomLarge: { hourly: 35, daily: 150, minHours: 2 },
    classroomSmall: { hourly: 25, daily: 120, minHours: 2 },
    greenScreen: { hourly: 50, minHours: 2 },
    packages: {
        basic: { base: 400, duration: 4 },
        complete: { base: 500, duration: 4 }
    },
    addons: {
        avAccess: 100, avStaff: 30, greenScreenLighting: 25, backline: 100,
        packageBackline: 50, tvUsage: 20, packageSmallRoom: 25, packageLargeRoom: 50
    }
};

const state = {
    currentStep: 1,
    details: {},
    selections: {},
    quote: { items: [], total: 0 }
};

// DOM Elements
const rentalTypeSelect = document.getElementById('rentalType');
const dynamicOptionsDiv = document.getElementById('dynamic-options');
const nextStepBtn = document.getElementById('next-step-btn');

// --- Event Listeners ---
if(rentalTypeSelect) {
    rentalTypeSelect.addEventListener('change', () => {
        state.selections = { rentalType: rentalTypeSelect.value };
        renderDynamicOptions(state.selections.rentalType);
        updateNextButtonState();
    });
}

document.getElementById('step-1')?.addEventListener('input', updateNextButtonState);
document.getElementById('next-step-btn')?.addEventListener('click', () => switchStep(2));
document.getElementById('back-step-btn')?.addEventListener('click', () => switchStep(1));
document.getElementById('submit-request-btn')?.addEventListener('click', handleSubmission);


// --- Core Functions ---
function renderDynamicOptions(type) {
    if(!dynamicOptionsDiv) return;
    dynamicOptionsDiv.innerHTML = '';
    if (type === 'package') {
        dynamicOptionsDiv.innerHTML = `
            <div>
                <label for="packageType" class="form-label">Choose your package:</label>
                <select id="packageType" class="form-input">
                    <option value="none" selected>-- Select a package --</option>
                    <option value="basic">Basic Package ($${PRICING.packages.basic.base})</option>
                    <option value="complete">Complete Space Package ($${PRICING.packages.complete.base})</option>
                </select>
                <p class="text-sm text-gray-500 mt-2" id="package-description">Select a package to see details.</p>
            </div>
            <div id="package-addons" class="hidden space-y-4 pt-4 border-t">
                <h3 class="text-md font-medium text-gray-700">Add-ons:</h3>
                <div class="space-y-2">
                     ${checkbox('packageBackline', `Stage Backline (+$${PRICING.addons.packageBackline})`)}
                     ${checkbox('packageAvStaff', `A/V Staffing (+$${PRICING.addons.avStaff}/hr)`)}
                     ${checkbox('packageLargeRoom', `Add Large Classroom (+$${PRICING.addons.packageLargeRoom})`)}
                     ${checkbox('packageSmallRooms', `Add Small Classrooms (+$${PRICING.addons.packageSmallRoom} each)`)}
                </div>
                <div id="package-av-hours-container" class="hidden mt-2"><label for="packageAvHours" class="form-label">A/V Staff Hours (min 2):</label><input type="number" id="packageAvHours" value="2" min="2" class="form-input w-28 no-spinner"></div>
                <div id="package-small-rooms-container" class="hidden mt-2"><label for="packageNumSmallRooms" class="form-label">Number of Small Rooms (1-3):</label><input type="number" id="packageNumSmallRooms" value="1" min="1" max="3" class="form-input w-28 no-spinner"></div>
            </div>
        `;
        document.getElementById('packageType').addEventListener('change', handlePackageSelection);
        document.getElementById('packageAvStaff').addEventListener('change', (e) => toggleInput('package-av-hours-container', e.target.checked));
        document.getElementById('packageSmallRooms').addEventListener('change', (e) => toggleInput('package-small-rooms-container', e.target.checked));
    } else if (type === 'room') {
         dynamicOptionsDiv.innerHTML = `
            <div>
                <label for="roomType" class="form-label">Choose the primary room:</label>
                <select id="roomType" class="form-input">
                     <option value="none" selected>-- Select a room --</option>
                     <option value="sanctuary">Large Space / Sanctuary</option><option value="fellowship">Medium Space / Fellowship Hall</option>
                     <option value="classroomLarge">Large Classroom (Rm 207)</option><option value="classroomSmall">Small Classroom</option>
                     <option value="greenScreen">Green Screen</option>
                </select>
            </div>
            <div>
                <label for="rentalDuration" class="form-label">Select rental duration:</label>
                <select id="rentalDuration" class="form-input"><option value="hourly">Hourly</option><option value="daily">Full Day</option></select>
            </div>
            <div id="hourly-duration-container"><label for="hours" class="form-label">Number of Hours (min 2):</label><input type="number" id="hours" min="2" value="2" class="form-input no-spinner"></div>
            <div id="room-addons" class="hidden space-y-4 pt-4 border-t"><h3 class="text-md font-medium text-gray-700">Add-ons:</h3><div id="room-addons-list"></div></div>
        `;
        document.getElementById('roomType').addEventListener('change', handleRoomSelection);
        document.getElementById('rentalDuration').addEventListener('change', handleDurationSelection);
    }
    dynamicOptionsDiv.addEventListener('change', updateSelections);
    dynamicOptionsDiv.addEventListener('input', updateSelections);
}

function checkbox(id, label) {
    return `<label for="${id}" class="flex items-center space-x-3 cursor-pointer"><input type="checkbox" id="${id}" class="h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"><span class="text-gray-700">${label}</span></label>`;
}

function toggleInput(containerId, show) {
    document.getElementById(containerId).style.display = show ? 'block' : 'none';
}

function handlePackageSelection(e) {
    const pkg = e.target.value, desc = document.getElementById('package-description'), addons = document.getElementById('package-addons');
    if (pkg === 'basic') {
        desc.textContent = 'Includes 4 hours of access to common areas, large space, medium space, and parking. Basic A/V included.';
        addons.style.display = 'block';
        document.querySelector('label[for="packageLargeRoom"]').style.display = 'flex';
        document.querySelector('label[for="packageSmallRooms"]').style.display = 'flex';
    } else if (pkg === 'complete') {
        desc.textContent = 'Includes 4 hours of full premises usage (excluding offices), all classrooms, and parking. Basic A/V included.';
        addons.style.display = 'block';
        document.querySelector('label[for="packageLargeRoom"]').style.display = 'none';
        document.querySelector('label[for="packageSmallRooms"]').style.display = 'none';
    } else {
        desc.textContent = 'Select a package to see details.';
        addons.style.display = 'none';
    }
    updateSelections();
}

function handleRoomSelection(e) {
    const room = e.target.value, addonsContainer = document.getElementById('room-addons'), addonsList = document.getElementById('room-addons-list');
    addonsList.innerHTML = '';
    addonsContainer.style.display = room !== 'none' ? 'block' : 'none';
    if(room === 'sanctuary') {
        addonsList.innerHTML = `
            ${checkbox('avAccess', `A/V Access (no staff) (+$${PRICING.addons.avAccess})`)}
            ${checkbox('avStaff', `A/V Staffing (+$${PRICING.addons.avStaff}/hr)`)}
            ${checkbox('backline', `Stage Backline Equipment (+$${PRICING.addons.backline})`)}
            <div id="room-av-hours-container" class="hidden mt-2"><label for="roomAvHours" class="form-label">A/V Staff Hours (min 2):</label><input type="number" id="roomAvHours" value="2" min="2" class="form-input w-28 no-spinner"></div>
        `;
         document.getElementById('avStaff').addEventListener('change', (e) => toggleInput('room-av-hours-container', e.target.checked));
    } else if(room === 'fellowship') {
         addonsList.innerHTML = `${checkbox('tvUsage', `40" TV Usage (+$${PRICING.addons.tvUsage})`)}`;
    }
    updateSelections();
}

function handleDurationSelection(e) {
    document.getElementById('hourly-duration-container').style.display = e.target.value === 'hourly' ? 'block' : 'none';
    updateSelections();
}

function collectAllData() {
    state.details = {
         name: document.getElementById('requesterName').value, email: document.getElementById('requesterEmail').value, phone: document.getElementById('requesterPhone').value,
         organization: document.getElementById('organization').value, eventTitle: document.getElementById('eventTitle').value, eventType: document.getElementById('eventType').value,
         eventDescription: document.getElementById('eventDescription').value, attendees: document.getElementById('attendees').value, eventDate: document.getElementById('eventDate').value,
         flexibleDate: document.querySelector('input[name="flexibleDate"]:checked').value, startTime: document.getElementById('startTime').value, endTime: document.getElementById('endTime').value,
         foodAndBev: document.querySelector('input[name="food"]:checked').value, relationship: document.getElementById('relationship').value,
    };
    updateSelections();
}

function updateSelections() {
    if(!rentalTypeSelect) return;
    const type = rentalTypeSelect.value;
    state.selections = { rentalType: type };
    if(type === 'package') {
        state.selections.packageType = document.getElementById('packageType').value;
        state.selections.packageBackline = document.getElementById('packageBackline').checked;
        state.selections.packageAvStaff = document.getElementById('packageAvStaff').checked;
         if(state.selections.packageAvStaff) state.selections.packageAvHours = parseInt(document.getElementById('packageAvHours').value);
        if (state.selections.packageType === 'basic') {
            state.selections.packageLargeRoom = document.getElementById('packageLargeRoom').checked;
            state.selections.packageSmallRooms = document.getElementById('packageSmallRooms').checked;
            if(state.selections.packageSmallRooms) state.selections.packageNumSmallRooms = parseInt(document.getElementById('packageNumSmallRooms').value);
        }
    } else if (type === 'room') {
        state.selections.roomType = document.getElementById('roomType').value;
        state.selections.rentalDuration = document.getElementById('rentalDuration').value;
        if(state.selections.rentalDuration === 'hourly') state.selections.hours = parseInt(document.getElementById('hours').value);
        if(state.selections.roomType === 'sanctuary') {
            state.selections.avAccess = document.getElementById('avAccess').checked;
            state.selections.avStaff = document.getElementById('avStaff').checked;
             if(state.selections.avStaff) state.selections.roomAvHours = parseInt(document.getElementById('roomAvHours').value);
            state.selections.backline = document.getElementById('backline').checked;
        } else if (state.selections.roomType === 'fellowship') {
             state.selections.tvUsage = document.getElementById('tvUsage').checked;
        }
    }
    updateNextButtonState();
}

function areRequiredFieldsFilled() {
    const requiredIds = ['requesterName', 'requesterEmail', 'requesterPhone', 'eventTitle', 'eventType', 'eventDescription', 'attendees', 'eventDate', 'startTime', 'endTime', 'relationship'];
    return requiredIds.every(id => document.getElementById(id) && document.getElementById(id).value.trim() !== '');
}

function updateNextButtonState() {
     if(!nextStepBtn) return;
     const { rentalType, packageType, roomType } = state.selections;
     const pricingSelected = (rentalType === 'package' && packageType !== 'none') || (rentalType === 'room' && roomType !== 'none');
     nextStepBtn.disabled = !(areRequiredFieldsFilled() && pricingSelected);
}

function calculateQuote() {
    const { selections } = state;
    const items = []; let total = 0;
    if (selections.rentalType === 'package') {
        const pkgDetails = PRICING.packages[selections.packageType];
        if(pkgDetails) {
            items.push({ description: `${selections.packageType.charAt(0).toUpperCase() + selections.packageType.slice(1)} Package`, cost: pkgDetails.base }); total += pkgDetails.base;
            if(selections.packageBackline) { items.push({ description: 'Add-on: Stage Backline', cost: PRICING.addons.packageBackline }); total += PRICING.addons.packageBackline; }
            if(selections.packageAvStaff) { const h = Math.max(2, selections.packageAvHours||2), c = h * PRICING.addons.avStaff; items.push({ description: `Add-on: A/V Staffing (${h} hrs)`, cost: c }); total += c; }
            if (selections.packageType === 'basic') {
                if(selections.packageLargeRoom) { items.push({ description: 'Add-on: Large Classroom', cost: PRICING.addons.packageLargeRoom }); total += PRICING.addons.packageLargeRoom; }
                if(selections.packageSmallRooms) { const n = Math.max(1, selections.packageNumSmallRooms||1), c = n * PRICING.addons.packageSmallRoom; items.push({ description: `Add-on: ${n} Small Classroom(s)`, cost: c }); total += c; }
            }
        }
    } else if (selections.rentalType === 'room') {
        const room = PRICING[selections.roomType];
        if(room) {
            if(selections.rentalDuration === 'hourly') { const h = Math.max(room.minHours, selections.hours||room.minHours), c = h * room.hourly; items.push({ description: `${selections.roomType.charAt(0).toUpperCase() + selections.roomType.slice(1)} rental (${h} hrs)`, cost: c }); total += c;
            } else { items.push({ description: `${selections.roomType.charAt(0).toUpperCase() + selections.roomType.slice(1)} rental (Full Day)`, cost: room.daily }); total += room.daily; }
            if(selections.roomType === 'sanctuary') {
                if(selections.avAccess && !selections.avStaff) { items.push({ description: 'Add-on: A/V Access', cost: PRICING.addons.avAccess }); total += PRICING.addons.avAccess; }
                if(selections.avStaff) { const h = Math.max(2, selections.roomAvHours||2), c = h * PRICING.addons.avStaff; items.push({ description: `Add-on: A/V Staffing (${h} hrs)`, cost: c }); total += c; }
                if(selections.backline) { items.push({ description: 'Add-on: Stage Backline', cost: PRICING.addons.backline }); total += PRICING.addons.backline; }
            } else if (selections.roomType === 'fellowship' && selections.tvUsage) { items.push({ description: 'Add-on: TV Usage', cost: PRICING.addons.tvUsage }); total += PRICING.addons.tvUsage; }
        }
    }
    state.quote = { items, total };
}

function renderReviewPage() {
    const summaryDiv = document.getElementById('request-summary');
    const { details } = state;
    summaryDiv.innerHTML = `
        <div><h4 class="font-bold text-gray-800">Event: ${details.eventTitle}</h4><p>${details.eventType} for ${details.attendees} guests.</p></div>
        <div><h4 class="font-bold text-gray-800">Contact: ${details.name}</h4><p>${details.email} | ${details.phone}</p></div>
        <div><h4 class="font-bold text-gray-800">Date & Time</h4><p>${details.eventDate} from ${details.startTime} to ${details.endTime}</p></div>
    `;
    renderQuote();
}

function renderQuote() {
    const { items, total } = state.quote;
    const summaryDiv = document.getElementById('quote-summary');
    const totalCostEl = document.getElementById('total-cost');
    if(summaryDiv) {
        summaryDiv.innerHTML = items.map(item => `<div class="flex justify-between items-center"><p>${item.description}</p><p class="font-medium font-sans">$${item.cost.toFixed(2)}</p></div>`).join('');
    }
    if(totalCostEl) {
        totalCostEl.textContent = `$${total.toFixed(2)}`;
    }
}

function switchStep(step) {
    const step1Indicator = document.getElementById('step-1-indicator'), step2Indicator = document.getElementById('step-2-indicator');
    const step1Div = document.getElementById('step-1'), step2Div = document.getElementById('step-2');
    if (step === 2) {
        collectAllData();
        calculateQuote();
        renderReviewPage();
        if(step1Div) step1Div.style.display = 'none';
        if(step2Div) step2Div.style.display = 'block';
        if(step1Indicator) step1Indicator.classList.replace('step-active', 'step-inactive');
        if(step2Indicator) step2Indicator.classList.replace('step-inactive', 'step-active');
    } else {
        if(step2Div) step2Div.style.display = 'none';
        if(step1Div) step1Div.style.display = 'block';
        if(step2Indicator) step2Indicator.classList.replace('step-active', 'step-inactive');
        if(step1Indicator) step1Indicator.classList.replace('step-inactive', 'step-active');
    }
    window.scrollTo(0, 0);
}

// --- NEW: handleSubmission with Timeout ---
async function handleSubmission() {
     if (!document.getElementById('termsConfirm').checked || !document.getElementById('termsPolicy').checked) {
         alert("Please agree to the terms before submitting."); return;
     }
     const submitBtn = document.getElementById('submit-request-btn');
     const successModal = document.getElementById('success-modal');
     const errorModal = document.getElementById('error-modal');
     const errorMessage = document.getElementById('error-message');

     submitBtn.disabled = true;
     submitBtn.textContent = 'Sending...';
     
     const submissionPromise = new Promise(async (resolve, reject) => {
        try {
            if (!db) throw new Error("Database not initialized.");
            const finalData = { ...state.details, quote: state.quote, selections: state.selections, status: 'pending', createdAt: firebase.firestore.FieldValue.serverTimestamp() };
            await db.collection('rentalRequests').add(finalData);
            resolve("success");
        } catch (error) {
            reject(error);
        }
     });

     const timeoutPromise = new Promise((_, reject) => {
         setTimeout(() => reject(new Error("Request timed out. Please check your internet connection and Firebase configuration.")), 10000); // 10-second timeout
     });

     try {
         await Promise.race([submissionPromise, timeoutPromise]);
         if(successModal) successModal.classList.remove('hidden');
         document.getElementById('step-1')?.querySelectorAll('input, select, textarea').forEach(el => { if(el.type !== 'radio' && el.type !== 'checkbox') el.value = ''; });
         switchStep(1);
     } catch (error) {
         console.error("Submission Error: ", error);
         if(errorMessage) errorMessage.textContent = error.message;
         if(errorModal) errorModal.classList.remove('hidden');
     } finally {
         submitBtn.disabled = false;
         submitBtn.textContent = 'Confirm & Send Request';
     }
}
// --- END NEW FUNCTION ---
        
// --- Admin Functions ---
const ADMIN_PASS = "pastor123";
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');

function initAdmin() {
    if(window.location.hash === '#admin') {
        document.getElementById('quote-generator').style.display = 'none';
        if(sessionStorage.getItem('isAdmin') === 'true') {
            showAdminDashboard();
        } else {
            document.getElementById('admin-login').style.display = 'block';
        }
    }
    
    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const passwordInput = document.getElementById('admin-password');
            const loginError = document.getElementById('login-error');
            if(passwordInput.value === ADMIN_PASS) { 
                sessionStorage.setItem('isAdmin', 'true'); 
                showAdminDashboard(); 
            } else { 
                if(loginError) loginError.style.display = 'block'; 
            }
        });
    }
    
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
             sessionStorage.removeItem('isAdmin');
             document.getElementById('admin-dashboard').style.display = 'none';
             document.getElementById('quote-generator').style.display = 'block';
             window.location.hash = '';
        });
    }
}


function showAdminDashboard() {
    const loginDiv = document.getElementById('admin-login');
    const dashboardDiv = document.getElementById('admin-dashboard');
    if(loginDiv) loginDiv.style.display = 'none';
    if(dashboardDiv) dashboardDiv.style.display = 'block';
    loadRequests();
}

function loadRequests() {
    const list = document.getElementById('request-list');
    if(!db) { 
        if(list) list.innerHTML = `<p class="text-red-500">Database not connected.</p>`; 
        return; 
    };
    db.collection('rentalRequests').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        if(!list) return;
        if(snapshot.empty) { 
            list.innerHTML = `<p class="text-gray-500">No requests found.</p>`; 
            return; 
        }
        list.innerHTML = snapshot.docs.map(doc => renderRequest(doc.id, doc.data())).join('');
        document.querySelectorAll('.action-btn').forEach(btn => btn.addEventListener('click', handleStatusUpdate));
    }, error => { 
        console.error("Error fetching requests:", error); 
        if(list) list.innerHTML = `<p class="text-red-500">Could not load requests.</p>`; 
    });
}

function getStatusClass(s) { 
    return s==='approved' ? 'bg-green-100 text-green-800' : s==='denied' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'; 
}

function renderRequest(id, data) {
     const createdAt = data.createdAt ? data.createdAt.toDate().toLocaleDateString() : 'N/A';
     const quoteItems = data.quote.items.map(i => `<li>${i.description}: $${i.cost.toFixed(2)}</li>`).join('');
     return `
        <div class="border rounded-lg p-4 transition hover:shadow-md text-sm bg-white">
             <div class="flex justify-between items-start">
                 <div>
                    <p class="font-semibold text-lg">${data.eventTitle || 'No Title'} <span class="text-sm font-normal text-gray-500">- by ${data.name}</span></p>
                     <p class="text-gray-600">${data.eventType} | Attendees: ${data.attendees}</p>
                     <p class="text-gray-600">Date: ${data.eventDate} (${data.startTime} - ${data.endTime})</p>
                     <p class="text-xs text-gray-500 mt-1">Submitted: ${createdAt}</p>
                     <span class="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(data.status)}">${data.status}</span>
                 </div>
                 <div class="text-right">
                     <p class="text-xl font-bold text-black">$${data.quote.total.toFixed(2)}</p>
                 </div>
             </div>
             <div class="mt-4 border-t pt-4">
                 <p><strong>Description:</strong> ${data.eventDescription}</p>
                 <div class="mt-2 text-gray-600"><strong>Quote Breakdown:</strong><ul class="list-disc list-inside">${quoteItems}</ul></div>
                 <div class="mt-4 flex space-x-2">
                     <button data-id="${id}" data-action="approve" class="action-btn bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:bg-gray-400">Approve</button>
                     <button data-id="${id}" data-action="deny" class="action-btn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:bg-gray-400">Deny</button>
                 </div>
             </div>
        </div>`;
}

async function handleStatusUpdate(e) {
    const { id, action } = e.target.dataset;
    e.target.disabled = true; 
    e.target.textContent = 'Updating...';
    try {
        if(!db) throw new Error("Database not initialized.");
        await db.collection('rentalRequests').doc(id).update({ status: action === 'approve' ? 'approved' : 'denied' });
        console.log(`Request ${id} ${action}d successfully. Trigger email flow here.`);
    } catch (error) { 
        console.error("Error updating status: ", error); 
        e.target.textContent = `Error`; 
    }
}

// Initialize the correct view on page load
document.addEventListener('DOMContentLoaded', initAdmin);

