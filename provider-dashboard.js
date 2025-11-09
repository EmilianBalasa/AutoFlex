// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBCJXaADkSOQO9CcV2qub7Fwlu9o4OPSPc",
    authDomain: "autoflex-83dba.firebaseapp.com",
    projectId: "autoflex-83dba",
    storageBucket: "autoflex-83dba.appspot.com",
    messagingSenderId: "921645337376",
    appId: "1:921645337376:web:fbd7dfd8fb9ef056e7a545",
    measurementId: "G-DV3KB8X20D"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// DOM Elements
const loading = document.getElementById('loading');
const notification = document.getElementById('notification');
const logoutBtn = document.getElementById('logoutBtn');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');
const addServiceBtn = document.getElementById('addServiceBtn');
const addServiceBtn2 = document.getElementById('addServiceBtn2');
const addServiceModal = document.getElementById('addServiceModal');
const closeAddServiceModal = document.getElementById('closeAddServiceModal');
const cancelAddService = document.getElementById('cancelAddService');
const saveService = document.getElementById('saveService');
const addServiceForm = document.getElementById('addServiceForm');
const contentSections = document.querySelectorAll('.content-section');
const navMenuLinks = document.querySelectorAll('.nav-menu a');
const viewAllLinks = document.querySelectorAll('.view-all');

// User data
let currentUser = null;
let providerData = null;
let providerServices = [];
let providerAppointments = [];
let currentSection = 'dashboard';

// Utility Functions
function showLoading(show) {
    loading.classList.toggle('active', show);
}

function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    setTimeout(() => notification.classList.remove('show'), 3000);
}

function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) {
        return "Invalid Date";
    }
    return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatTime(date) {
    if (!(date instanceof Date) || isNaN(date)) {
        return "Invalid Time";
    }
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Authentication and User Management
function initializeAuth() {
    auth.onAuthStateChanged(handleAuthState);
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            showLoading(true);
            auth.signOut()
                .then(() => {
                    window.location.href = 'index.html';
                })
                .catch(error => {
                    showLoading(false);
                    console.error('Logout error:', error);
                    showNotification('Logout failed. Please try again.', 'error');
                });
        });
    }
}

async function handleAuthState(user) {
    if (user) {
        currentUser = user;
        try {
            console.log('User authenticated:', user.uid);
            await createProviderProfile();
            // loadDashboardData is called from within createProviderProfile
        } catch (error) {
            console.error('Error initializing provider dashboard:', error);
            showNotification('Error loading dashboard. Please refresh the page.', 'error');
        }
    } else {
        window.location.href = 'login.html';
    }
}

// Data Loading
async function loadProviderData(userId) {
    showLoading(true);
    try {
        console.log('Loading provider data for:', userId);
        // Load provider profile
        const providerRef = db.collection('providers').doc(userId);
        const doc = await providerRef.get();
        
        if (!doc.exists) {
            console.log('No provider profile found, creating basic one');
            // Create basic provider profile if it doesn't exist
            await providerRef.set({
                userId: userId,
                email: currentUser.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        providerData = (await providerRef.get()).data();
        console.log('Provider data loaded:', providerData);
        
        // Update UI
        if (document.getElementById('userName')) {
            document.getElementById('userName').textContent = providerData.businessName || 'Provider';
        }
        if (document.getElementById('userEmail')) {
            document.getElementById('userEmail').textContent = providerData.email || currentUser.email;
        }
        if (document.getElementById('userAvatar') && currentUser.photoURL) {
            document.getElementById('userAvatar').src = currentUser.photoURL;
        }
        
        // Pre-fill settings form
        if (document.getElementById('businessName')) {
            document.getElementById('businessName').value = providerData.businessName || '';
        }
        if (document.getElementById('businessAddress')) {
            document.getElementById('businessAddress').value = providerData.address || '';
        }
        if (document.getElementById('businessPhone')) {
            document.getElementById('businessPhone').value = providerData.phone || '';
        }
        if (document.getElementById('businessHours')) {
            document.getElementById('businessHours').value = providerData.businessHours || '';
        }
        if (document.getElementById('businessDescription')) {
            document.getElementById('businessDescription').value = providerData.description || '';
        }
        
    } catch (error) {
        console.error('Error loading provider data:', error);
        showNotification('Error loading provider data. Please try again.', 'error');
    }
    showLoading(false);
}

async function loadDashboardData(userId) {
    showLoading(true);
    try {
        console.log('Loading dashboard data for user:', userId);
        
        // Load services count
        const servicesSnapshot = await db.collection('services')
            .where('providerId', '==', userId)
            .get();
        
        console.log('Services found:', servicesSnapshot.size);
        
        if (document.getElementById('servicesCount')) {
            document.getElementById('servicesCount').textContent = servicesSnapshot.size;
        }
        
        providerServices = [];
        servicesSnapshot.forEach(doc => {
            providerServices.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Load upcoming appointments
        const now = new Date();
        console.log('Querying upcoming appointments...');
        
        try {
            const upcomingSnapshot = await db.collection('appointments')
                .where('providerId', '==', userId)
                .where('status', 'in', ['scheduled', 'confirmed'])
                .get(); // Removing orderBy to avoid index issues
            
            console.log('Upcoming appointments found:', upcomingSnapshot.size);
            
            if (document.getElementById('upcomingAppointmentsCount')) {
                document.getElementById('upcomingAppointmentsCount').textContent = upcomingSnapshot.size;
            } else {
                console.log('upcomingAppointmentsCount element not found');
            }
            
            // Update appointments container
            const appointmentsContainer = document.getElementById('appointmentsContainer');
            if (appointmentsContainer) {
                appointmentsContainer.innerHTML = '';
                
                if (upcomingSnapshot.empty) {
                    console.log('No upcoming appointments found');
                    if (document.getElementById('noAppointmentsMessage')) {
                        document.getElementById('noAppointmentsMessage').style.display = 'block';
                    }
                } else {
                    if (document.getElementById('noAppointmentsMessage')) {
                        document.getElementById('noAppointmentsMessage').style.display = 'none';
                    }
                    
                    // Convert to array and sort manually
                    const appointments = [];
                    upcomingSnapshot.forEach(doc => {
                        const appointment = {
                            id: doc.id,
                            ...doc.data()
                        };
                        appointments.push(appointment);
                    });
                    
                    // Sort by date
                    appointments.sort((a, b) => {
                        const dateA = a.date instanceof firebase.firestore.Timestamp 
                            ? a.date.toDate() 
                            : new Date(a.date);
                        const dateB = b.date instanceof firebase.firestore.Timestamp 
                            ? b.date.toDate() 
                            : new Date(b.date);
                        return dateA - dateB;
                    });
                    
                    // Take only first 3
                    const recentAppointments = appointments.slice(0, 3);
                    
                    console.log('Processing appointments for display:', recentAppointments.length);
                    
                    recentAppointments.forEach(appointment => {
                        try {
                            const date = appointment.date instanceof firebase.firestore.Timestamp 
                                ? appointment.date.toDate() 
                                : new Date(appointment.date);
                            
                            const card = createAppointmentCard(appointment, date);
                            appointmentsContainer.appendChild(card);
                        } catch (cardError) {
                            console.error('Error creating appointment card:', cardError, appointment);
                        }
                    });
                }
            } else {
                console.log('appointmentsContainer element not found');
            }
        } catch (appointmentsError) {
            console.error('Error loading appointments:', appointmentsError);
        }
        
        // Load average rating if available
        if (providerData && providerData.rating && document.getElementById('averageRating')) {
            document.getElementById('averageRating').textContent = providerData.rating.toFixed(1);
        } else if (document.getElementById('averageRating')) {
            document.getElementById('averageRating').textContent = '0.0';
        }
        
        console.log('Dashboard data loaded successfully');
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading dashboard data. Please try again.', 'error');
    }
    showLoading(false);
}

async function loadServicesData(userId) {
    showLoading(true);
    try {
        const servicesSnapshot = await db.collection('services')
            .where('providerId', '==', userId)
            .get();
        
        const servicesContainer = document.getElementById('servicesContainer');
        if (servicesContainer) {
            servicesContainer.innerHTML = '';
            
            if (servicesSnapshot.empty) {
                if (document.getElementById('noServicesMessage')) {
                    document.getElementById('noServicesMessage').style.display = 'block';
                }
            } else {
                if (document.getElementById('noServicesMessage')) {
                    document.getElementById('noServicesMessage').style.display = 'none';
                }
                
                servicesSnapshot.forEach(doc => {
                    const service = {
                        id: doc.id,
                        ...doc.data()
                    };
                    servicesContainer.appendChild(createServiceCard(service));
                });
            }
        }
        
    } catch (error) {
        console.error('Error loading services data:', error);
        showNotification('Error loading services. Please try again.', 'error');
    }
    showLoading(false);
}

async function loadAppointmentsData(userId) {
    showLoading(true);
    try {
        // Load upcoming appointments
        try {
            const upcomingSnapshot = await db.collection('appointments')
                .where('providerId', '==', userId)
                .where('status', 'in', ['scheduled', 'confirmed'])
                .get(); // Removed orderBy to avoid index issues
            
            // Update upcoming appointments container
            const upcomingContainer = document.getElementById('upcomingAppointmentsContainer');
            if (upcomingContainer) {
                upcomingContainer.innerHTML = '';
                
                if (upcomingSnapshot.empty) {
                    if (document.getElementById('noUpcomingAppointmentsMessage')) {
                        document.getElementById('noUpcomingAppointmentsMessage').style.display = 'block';
                    }
                } else {
                    if (document.getElementById('noUpcomingAppointmentsMessage')) {
                        document.getElementById('noUpcomingAppointmentsMessage').style.display = 'none';
                    }
                    
                    // Convert to array and sort manually
                    const appointments = [];
                    upcomingSnapshot.forEach(doc => {
                        const appointment = {
                            id: doc.id,
                            ...doc.data()
                        };
                        appointments.push(appointment);
                    });
                    
                    // Sort by date
                    appointments.sort((a, b) => {
                        const dateA = a.date instanceof firebase.firestore.Timestamp 
                            ? a.date.toDate() 
                            : new Date(a.date);
                        const dateB = b.date instanceof firebase.firestore.Timestamp 
                            ? b.date.toDate() 
                            : new Date(b.date);
                        return dateA - dateB;
                    });
                    
                    appointments.forEach(appointment => {
                        try {
                            const date = appointment.date instanceof firebase.firestore.Timestamp 
                                ? appointment.date.toDate() 
                                : new Date(appointment.date);
                            
                            upcomingContainer.appendChild(createAppointmentCard(appointment, date, true));
                        } catch (cardError) {
                            console.error('Error creating appointment card:', cardError, appointment);
                        }
                    });
                }
            }
        } catch (upcomingError) {
            console.error('Error loading upcoming appointments:', upcomingError);
        }
        
        // Load past appointments
        try {
            const pastSnapshot = await db.collection('appointments')
                .where('providerId', '==', userId)
                .where('status', 'in', ['completed', 'cancelled'])
                .get(); // Removed orderBy to avoid index issues
            
            // Update past appointments container
            const pastContainer = document.getElementById('pastAppointmentsContainer');
            if (pastContainer) {
                pastContainer.innerHTML = '';
                
                if (pastSnapshot.empty) {
                    if (document.getElementById('noPastAppointmentsMessage')) {
                        document.getElementById('noPastAppointmentsMessage').style.display = 'block';
                    }
                } else {
                    if (document.getElementById('noPastAppointmentsMessage')) {
                        document.getElementById('noPastAppointmentsMessage').style.display = 'none';
                    }
                    
                    // Convert to array and sort manually
                    const appointments = [];
                    pastSnapshot.forEach(doc => {
                        const appointment = {
                            id: doc.id,
                            ...doc.data()
                        };
                        appointments.push(appointment);
                    });
                    
                    // Sort by date (descending)
                    appointments.sort((a, b) => {
                        const dateA = a.date instanceof firebase.firestore.Timestamp 
                            ? a.date.toDate() 
                            : new Date(a.date);
                        const dateB = b.date instanceof firebase.firestore.Timestamp 
                            ? b.date.toDate() 
                            : new Date(b.date);
                        return dateB - dateA; // Descending order
                    });
                    
                    appointments.forEach(appointment => {
                        try {
                            const date = appointment.date instanceof firebase.firestore.Timestamp 
                                ? appointment.date.toDate() 
                                : new Date(appointment.date);
                            
                            pastContainer.appendChild(createAppointmentCard(appointment, date, true));
                        } catch (cardError) {
                            console.error('Error creating appointment card:', cardError, appointment);
                        }
                    });
                }
            }
        } catch (pastError) {
            console.error('Error loading past appointments:', pastError);
        }
        
    } catch (error) {
        console.error('Error loading appointments data:', error);
        showNotification('Error loading appointments. Please try again.', 'error');
    }
    showLoading(false);
}

// UI Component Creators
function createAppointmentCard(appointment, date, includeActions = false) {
    console.log('Creating appointment card:', appointment.id);
    
    if (!appointment || !appointment.id) {
        console.error('Invalid appointment data:', appointment);
        return document.createElement('div'); // Return empty div if invalid data
    }
    
    const card = document.createElement('div');
    card.className = 'appointment-card';
    card.dataset.id = appointment.id;
    
    try {
        // Find matching service
        const matchingService = providerServices.find(s => s.id === appointment.serviceId);
        const serviceName = matchingService ? matchingService.name : 'Unknown Service';
        
        // Ensure appointment has a status
        const status = appointment.status || 'scheduled';
        
        // Status indicator class
        let statusClass = '';
        switch(status) {
            case 'scheduled': statusClass = 'status-scheduled'; break;
            case 'confirmed': statusClass = 'status-confirmed'; break;
            case 'completed': statusClass = 'status-completed'; break;
            case 'cancelled': statusClass = 'status-cancelled'; break;
            default: statusClass = '';
        }
        
        // Format date safely
        const formattedDate = date && !isNaN(date) ? formatDate(date) : 'Invalid Date';
        const formattedTime = date && !isNaN(date) ? formatTime(date) : 'Invalid Time';
        
        card.innerHTML = `
            <div class="appointment-header ${statusClass}">
                <h3 class="appointment-title">${serviceName}</h3>
                <span class="appointment-status">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
            </div>
            <div class="appointment-details">
                <div class="appointment-info">
                    <p><i class="fas fa-user"></i> ${appointment.clientName || 'Unknown Client'}</p>
                    <p><i class="fas fa-calendar"></i> ${formattedDate}</p>
                    <p><i class="fas fa-clock"></i> ${formattedTime}</p>
                    <p><i class="fas fa-phone"></i> ${appointment.clientPhone || 'N/A'}</p>
                </div>
                ${appointment.notes ? `<div class="appointment-notes"><p>${appointment.notes}</p></div>` : ''}
            </div>
            ${includeActions ? `
            <div class="appointment-actions">
                ${status === 'scheduled' || status === 'confirmed' ? 
                    `<button class="action-btn complete-btn" data-id="${appointment.id}">Complete</button>
                    <button class="action-btn cancel-btn" data-id="${appointment.id}">Cancel</button>` : 
                    ''}
                <button class="action-btn details-btn" data-id="${appointment.id}">Details</button>
            </div>` : ''}
        `;
        
        // Add event listeners for action buttons if needed
        if (includeActions) {
            const completeBtns = card.querySelectorAll('.complete-btn');
            completeBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleCompleteAppointment(btn.dataset.id);
                });
            });
            
            const cancelBtns = card.querySelectorAll('.cancel-btn');
            cancelBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleCancelAppointment(btn.dataset.id);
                });
            });
            
            const detailsBtns = card.querySelectorAll('.details-btn');
            detailsBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleViewAppointmentDetails(btn.dataset.id);
                });
            });
        }
    } catch (error) {
        console.error('Error rendering appointment card:', error);
        card.innerHTML = '<p>Error displaying appointment</p>';
    }
    
    return card;
}

function createServiceCard(service) {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.dataset.id = service.id;
      try {
        // Handle both old and new service data formats
        const serviceName = service.serviceName || service.name || 'Unnamed Service';        // Handle price formats (string with $, raw number, or undefined)
        let servicePrice = 'Price varies';
        if (typeof service.price === 'string') {
            servicePrice = service.price;
        } else if (typeof service.price === 'number') {
            servicePrice = `$${service.price.toFixed(2)}`;
        }
        
        // Handle category formatting safely
        const serviceCategory = service.category 
            ? service.category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
            : 'Other';
        const serviceLocation = service.location || 'Not specified';
        
        // Generate tags HTML if available
        const tagsHtml = service.tags && service.tags.length > 0 ? 
            `<p><strong>Tags:</strong> ${service.tags.join(', ')}</p>` : '';
            
        card.innerHTML = `
            <div class="service-header">
                <h3 class="service-title">${serviceName}</h3>
                <span class="service-price">${servicePrice}</span>
            </div>
            <div class="service-details">
                <p><strong>Category:</strong> ${serviceCategory}</p>
                <p><strong>Location:</strong> ${serviceLocation}</p>
                <p><strong>Duration:</strong> ${service.duration} minutes</p>
                <p><strong>Description:</strong> ${service.description}</p>
                ${tagsHtml}
            </div>
            <div class="service-actions">
                <button class="edit-service-btn" data-id="${service.id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete-service-btn" data-id="${service.id}"><i class="fas fa-trash"></i> Delete</button>
            </div>
        `;
        
        // Add event listeners
        const editBtn = card.querySelector('.edit-service-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleEditService(service.id);
        });
        
        const deleteBtn = card.querySelector('.delete-service-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleDeleteService(service.id);
        });
    } catch (error) {
        console.error('Error rendering service card:', error);
        card.innerHTML = '<p>Error displaying service</p>';
    }
    
    return card;
}

// Event Handlers
function handleSwitchSection(section) {
    console.log('Switching to section:', section);
    // Hide all sections
    contentSections.forEach(el => {
        el.style.display = 'none';
        el.classList.remove('active-section');
    });
    
    // Update active menu item
    navMenuLinks.forEach(link => {
        if (link.dataset.section === section) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Show the selected section
    const targetSection = document.getElementById(`${section}Section`);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active-section');
        
        // Update current section
        currentSection = section;
        
        // Load section-specific data
        if (currentUser) {
            const userId = currentUser.uid;
            
            if (section === 'services') {
                loadServicesData(userId);
            } else if (section === 'appointments') {
                loadAppointmentsData(userId);
            } else if (section === 'dashboard') {
                loadDashboardData(userId);
            }
        }
    } else {
        console.error(`Section not found: ${section}Section`);
    }
}

function handleMobileMenuToggle() {
    if (navLinks) {
        navLinks.classList.toggle('show');
    }
}

function handleShowAddServiceModal() {
    if (addServiceModal) {
        addServiceModal.classList.add('active');
        addServiceModal.classList.add('show');
        
        // Reset the form
        if (addServiceForm) addServiceForm.reset();
        
        // Make sure we have the "Save Service" event listener
        const saveButton = document.getElementById('saveService');
        if (saveButton) {
            const newSaveButton = saveButton.cloneNode(true);
            saveButton.parentNode.replaceChild(newSaveButton, saveButton);
            newSaveButton.textContent = 'Save Service';
            newSaveButton.addEventListener('click', handleSaveService);
        }
    }
}

function handleCloseAddServiceModal() {
    if (addServiceModal) {
        addServiceModal.classList.remove('active');
        addServiceModal.classList.remove('show');
        
        // Reset the form
        if (addServiceForm) {
            addServiceForm.reset();
        }
        
        // Reset save button text and event listener
        const saveButton = document.getElementById('saveService');
        if (saveButton) {
            const newSaveButton = saveButton.cloneNode(true);
            saveButton.parentNode.replaceChild(newSaveButton, saveButton);
            newSaveButton.textContent = 'Save Service';
            newSaveButton.addEventListener('click', handleSaveService);
        }
        
        // Reset modal title
        const modalTitle = addServiceModal.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Add New Service';
        }
    }
}

async function handleSaveService() {
    if (!currentUser || !addServiceForm) return;
    
    const name = document.getElementById('serviceName')?.value;
    const category = document.getElementById('serviceCategory')?.value;
    const description = document.getElementById('serviceDescription')?.value;
    const price = document.getElementById('servicePrice')?.value;
    const duration = document.getElementById('serviceDuration')?.value;
    const location = document.getElementById('serviceLocation')?.value;
    const tagsInput = document.getElementById('serviceTags')?.value;
    const imageUrl = document.getElementById('serviceImage')?.value;
    
    if (!name || !category || !description || !price || !duration || !location) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        // Process tags into an array
        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim().toLowerCase()) : [];
        
        // Prepare data that matches the search structure in services.js
        const serviceData = {
            providerId: currentUser.uid,
            serviceName: name,
            category,
            description,
            price: `$${parseFloat(price).toFixed(2)}`,
            duration: parseInt(duration),
            location,
            tags,
            image: imageUrl || 'https://source.unsplash.com/random/300x200/?car',
            provider: providerData?.businessName || currentUser.displayName || 'Auto Service Provider',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('services').add(serviceData);
        
        showNotification('Service added successfully!', 'success');
        handleCloseAddServiceModal();
        
        // Reload services data
        if (currentSection === 'services') {
            await loadServicesData(currentUser.uid);
        } else {
            await loadDashboardData(currentUser.uid);
        }
        
    } catch (error) {
        console.error('Error adding service:', error);
        showNotification('Error adding service. Please try again.', 'error');
    }
    
    showLoading(false);
}

async function handleEditService(serviceId) {
    if (!currentUser || !serviceId) return;
    
    showLoading(true);
    
    try {
        // Get the current service data
        const serviceDoc = await db.collection('services').doc(serviceId).get();
        
        if (!serviceDoc.exists) {
            showNotification('Service not found.', 'error');
            showLoading(false);
            return;
        }
        
        const service = serviceDoc.data();
        
        // Show edit modal
        const modal = document.getElementById('addServiceModal');
        if (modal) {
            // Update modal title
            const modalTitle = modal.querySelector('.modal-title');
            if (modalTitle) modalTitle.textContent = 'Edit Service';
            
            // Fill in form fields with existing data
            document.getElementById('serviceName').value = service.serviceName || service.name || '';
            document.getElementById('serviceCategory').value = service.category || '';
            document.getElementById('serviceDescription').value = service.description || '';
            
            // Handle price formatting (could be string with $ or number)
            let priceValue = service.price;
            if (typeof priceValue === 'string') {
                priceValue = priceValue.replace(/[$,]/g, ''); // Remove $ and commas
            }
            document.getElementById('servicePrice').value = parseFloat(priceValue) || '';
            
            document.getElementById('serviceDuration').value = service.duration || '';
            
            // Set values for the new fields
            if (document.getElementById('serviceLocation')) {
                document.getElementById('serviceLocation').value = service.location || '';
            }
            
            if (document.getElementById('serviceTags')) {
                const tags = service.tags && Array.isArray(service.tags) ? service.tags.join(', ') : '';
                document.getElementById('serviceTags').value = tags;
            }
            
            if (document.getElementById('serviceImage')) {
                document.getElementById('serviceImage').value = service.image || '';
            }
            
            // Update save button to handle update instead of create
            const saveButton = document.getElementById('saveService');
            if (saveButton) {
                // Remove existing event listeners
                const newSaveButton = saveButton.cloneNode(true);
                saveButton.parentNode.replaceChild(newSaveButton, saveButton);
                
                // Add new event listener for update
                newSaveButton.addEventListener('click', async () => {
                    await handleUpdateService(serviceId);
                });
                
                newSaveButton.textContent = 'Update Service';
            }
            
            // Show the modal
            modal.classList.add('show');
        }
        
    } catch (error) {
        console.error('Error editing service:', error);
        showNotification('Error loading service data. Please try again.', 'error');
    }
    
    showLoading(false);
}

async function handleUpdateService(serviceId) {
    if (!currentUser || !serviceId || !addServiceForm) return;
    
    const name = document.getElementById('serviceName')?.value;
    const category = document.getElementById('serviceCategory')?.value;
    const description = document.getElementById('serviceDescription')?.value;
    const price = document.getElementById('servicePrice')?.value;
    const duration = document.getElementById('serviceDuration')?.value;
    const location = document.getElementById('serviceLocation')?.value;
    const tagsInput = document.getElementById('serviceTags')?.value;
    const imageUrl = document.getElementById('serviceImage')?.value;
    
    if (!name || !category || !description || !price || !duration || !location) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        // Process tags into an array
        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim().toLowerCase()) : [];
        
        // Prepare data that matches the search structure in services.js
        const serviceData = {
            providerId: currentUser.uid,
            serviceName: name,
            category,
            description,
            price: `$${parseFloat(price).toFixed(2)}`,
            duration: parseInt(duration),
            location,
            tags,
            image: imageUrl || 'https://source.unsplash.com/random/300x200/?car',
            provider: providerData?.businessName || currentUser.displayName || 'Auto Service Provider',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('services').doc(serviceId).update(serviceData);
        
        showNotification('Service updated successfully!', 'success');
        handleCloseAddServiceModal();
        
        // Reload services data
        if (currentSection === 'services') {
            await loadServicesData(currentUser.uid);
        } else {
            await loadDashboardData(currentUser.uid);
        }
        
    } catch (error) {
        console.error('Error updating service:', error);
        showNotification('Error updating service. Please try again.', 'error');
    }
    
    showLoading(false);
}
async function handleCompleteAppointment(appointmentId) {
    // Implementation details...
}

async function handleCancelAppointment(appointmentId) {
    // Implementation details...
}

async function handleViewAppointmentDetails(appointmentId) {
    // Implementation details...
}

async function handleSaveProfile() {
    if (!currentUser) return;
    
    const businessName = document.getElementById('businessName')?.value;
    const address = document.getElementById('businessAddress')?.value;
    const phone = document.getElementById('businessPhone')?.value;
    const hours = document.getElementById('businessHours')?.value;
    const description = document.getElementById('businessDescription')?.value;
    
    if (!businessName || !address || !phone) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        await db.collection('providers').doc(currentUser.uid).update({
            businessName,
            address,
            phone,
            businessHours: hours,
            description,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update provider data
        providerData = (await db.collection('providers').doc(currentUser.uid).get()).data();
        
        // Update UI
        if (document.getElementById('userName')) {
            document.getElementById('userName').textContent = businessName;
        }
        
        showNotification('Profile updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Error updating profile. Please try again.', 'error');
    }
    
    showLoading(false);
}

// Create provider profile function
async function createProviderProfile() {
    if (!currentUser) return;
    
    try {
        console.log('Creating/checking provider profile for user:', currentUser.uid);
        
        // Check if profile exists
        const providerDoc = await db.collection('providers').doc(currentUser.uid).get();
        
        if (!providerDoc.exists) {
            console.log('Provider profile does not exist, creating one...');
            
            // Get user data from users collection
            const userDoc = await db.collection('users').doc(currentUser.uid).get();
            console.log('User document exists:', userDoc.exists);
            const userData = userDoc.exists ? userDoc.data() : {};
            
            // Create provider profile with user data
            const providerData = {
                userId: currentUser.uid,
                email: userData.email || currentUser.email,
                businessName: userData.businessName || '',
                description: userData.businessDescription || '',
                address: userData.address || '',
                phone: userData.phone || '',
                businessHours: userData.businessHours || '',
                servicesOffered: userData.servicesOffered || '',
                profileImage: userData.profileImage || currentUser.photoURL,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            console.log('Creating provider profile with data:', providerData);
            await db.collection('providers').doc(currentUser.uid).set(providerData);
        } else {
            console.log('Provider profile exists');
        }
        
        // Reload provider data
        await loadProviderData(currentUser.uid);
        
        // Now load dashboard data after provider data is loaded
        await loadDashboardData(currentUser.uid);
        
    } catch (error) {
        console.error('Error creating provider profile:', error);
        showNotification('Error setting up provider profile. Please try again.', 'error');
        throw error; // Rethrow to be caught by the caller
    }
}

// Event Listeners for DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing provider dashboard...');
    // Initialize authentication
    initializeAuth();
    
    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', handleMobileMenuToggle);
    }
    
    // Navigation menu click handlers
    if (navMenuLinks) {
        navMenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                handleSwitchSection(section);
            });
        });
    }
    
    // View all links
    if (viewAllLinks) {
        viewAllLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                handleSwitchSection(section);
            });
        });
    }
    
    // Service modals
    if (addServiceBtn) addServiceBtn.addEventListener('click', handleShowAddServiceModal);
    if (addServiceBtn2) addServiceBtn2.addEventListener('click', handleShowAddServiceModal);
    if (closeAddServiceModal) closeAddServiceModal.addEventListener('click', handleCloseAddServiceModal);
    if (cancelAddService) cancelAddService.addEventListener('click', handleCloseAddServiceModal);
    if (saveService) saveService.addEventListener('click', handleSaveService);
    
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSaveProfile();
        });
    }
    
    console.log('Provider dashboard initialized');
});
