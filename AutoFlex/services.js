// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('show');
});

// Animation on scroll
document.addEventListener('DOMContentLoaded', function() {
    console.log('Services page loaded');
    const animatedElements = document.querySelectorAll('.animate');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
        element.style.opacity = 0;
        observer.observe(element);
    });

    // Initialize Search Functionality
    const searchBtn = document.getElementById('searchBtn');
    const serviceSearch = document.getElementById('serviceSearch');
    const locationSearch = document.getElementById('locationSearch');

    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
        console.log('Search button event listener added');
    } else {
        console.error('Search button not found');
    }

    function handleSearch() {
        console.log('Search function triggered');
        const service = serviceSearch ? serviceSearch.value.trim() : '';
        const location = locationSearch ? locationSearch.value.trim() : '';
        
        console.log('Search values:', { service, location });
        
        if (!service && !location) {
            showNotification('Please enter a service or location to search', 'error');
            return;
        }
        
        // Store search parameters in localStorage
        localStorage.setItem('searchService', service);
        localStorage.setItem('searchLocation', location);
        
        // Reload the services page with new query parameters
        window.location.href = `services.html?service=${encodeURIComponent(service)}&location=${encodeURIComponent(location)}`;
    }

    // Function to show notifications
    function showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.querySelector('.search-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'search-notification';
            document.body.appendChild(notification);
        }
        
        // Set notification content and style
        notification.textContent = message;
        notification.className = `search-notification ${type}`;
        notification.classList.add('show');
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Handle pressing Enter key in search inputs
    if (serviceSearch) {
        serviceSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }

    if (locationSearch) {
        locationSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }

    // Process search results
    processSearchResults();
});

// Function to get URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        service: params.get('service') || '',
        location: params.get('location') || ''
    };
}

// Function to check localStorage for search params if not in URL
function checkLocalStorageForParams(params) {
    if (!params.service && !params.location) {
        const storedService = localStorage.getItem('searchService');
        const storedLocation = localStorage.getItem('searchLocation');
        
        if (storedService || storedLocation) {
            console.log('Found search parameters in localStorage');
            return {
                service: storedService || '',
                location: storedLocation || ''
            };
        }
    }
    return params;
}

// Process and display search results
function processSearchResults() {
    console.log('Processing search results');
    
    let params = getUrlParams();
    params = checkLocalStorageForParams(params);
    
    const service = params.service;
    const location = params.location;
    
    console.log('Search parameters:', { service, location });
    
    // If coming from a search, populate the search inputs
    if (service || location) {
        const serviceSearch = document.getElementById('serviceSearch');
        const locationSearch = document.getElementById('locationSearch');
        
        if (serviceSearch && service) {
            serviceSearch.value = service;
        }
        
        if (locationSearch && location) {
            locationSearch.value = location;
        }
    }
    
    // Update search results heading
    updateSearchHeading(service, location);
    
    // Fetch and display search results
    fetchSearchResults(service, location);
}

// Update the search heading based on search parameters
function updateSearchHeading(service, location) {
    const heading = document.getElementById('searchResultsHeading');
    const searchTermsDiv = document.getElementById('searchTerms');
    
    if (!heading || !searchTermsDiv) return;
    
    if (!service && !location) {
        heading.textContent = 'All Services Offered by Providers';
        searchTermsDiv.style.display = 'none';
        return;
    }
    
    heading.textContent = 'Search Results';
    
    // Format the search terms display
    let searchTerms = '';
    if (service) {
        searchTerms += `<span class="search-term"><i class="fas fa-search"></i> ${service}</span>`;
    }
    
    if (location) {
        searchTerms += `<span class="search-term"><i class="fas fa-map-marker-alt"></i> ${location}</span>`;
    }
    
    searchTermsDiv.innerHTML = searchTerms;
    searchTermsDiv.style.display = 'flex';
}

// Fetch service data from Firestore or mock data
function fetchSearchResults(service, location) {
    const resultsContainer = document.getElementById('resultsContainer');
    const noResultsMessage = document.getElementById('noResultsMessage');
    
    if (!resultsContainer || !noResultsMessage) return;
    
    resultsContainer.innerHTML = '';      // Try to initialize Firebase Firestore if available
    let db = null;
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            // Initialize Firebase with your config if not already initialized
            if (!firebase.apps || !firebase.apps.length) {
                // Firebase configuration - same as in other files
                const firebaseConfig = {
                    apiKey: "AIzaSyBCJXaADkSOQO9CcV2qub7Fwlu9o4OPSPc",
                    authDomain: "autoflex-83dba.firebaseapp.com",
                    projectId: "autoflex-83dba",
                    storageBucket: "autoflex-83dba.appspot.com",
                    messagingSenderId: "921645337376",
                    appId: "1:921645337376:web:fbd7dfd8fb9ef056e7a545",
                    measurementId: "G-DV3KB8X20D"
                };
                
                firebase.initializeApp(firebaseConfig);
                console.log('Firebase initialized with config');
            }
            
            db = firebase.firestore();
            console.log('Firebase Firestore initialized');
        } else {
            console.log('Firebase not available, using mock data');
        }
    } catch (error) {
        console.error('Error initializing Firebase:', error);
    }
    
    // If Firestore is available, fetch actual data
    if (db) {
        fetchServicesFromFirestore(db, service, location, resultsContainer, noResultsMessage);
    } else {
        // Otherwise use mock data for demonstration
        console.log('Using mock data for search results');
        displayMockResults(service, location, resultsContainer, noResultsMessage);
    }
}

// Fetch services from Firestore
async function fetchServicesFromFirestore(db, service, location, resultsContainer, noResultsMessage) {
    try {
        // Start with the services collection
        const servicesRef = db.collection('services');
        let snapshot;
        
        try {
            // Since Firestore doesn't support OR queries directly, we'll need to do multiple queries
            // for a comprehensive search across provider-added services
            
            if (service && location) {
                // If both service and location are provided, we'll need separate queries
                console.log('Searching for both service and location');
                
                // We'll query all services and filter client-side
                snapshot = await servicesRef.get();
            } else if (service) {
                // If only service is provided, search across multiple fields
                console.log('Searching for service:', service);
                
                // For Firestore, we need to use a more sophisticated approach
                // because we can't easily search across multiple fields
                // We'll get all services and filter client-side
                snapshot = await servicesRef.get();
            } else if (location) {
                // If only location is provided
                console.log('Searching for location:', location);
                location = location.toLowerCase();
                
                // Location-based search can use a direct query
                snapshot = await servicesRef
                    .where('location', '>=', location)
                    .where('location', '<=', location + '\uf8ff')
                    .get();
            } else {
                // No filters, get all services
                snapshot = await servicesRef.get();
            }
        } catch (permissionError) {
            console.warn('Firebase permission error:', permissionError.message);
            console.log('Falling back to mock data due to permission issues');
            displayMockResults(service, location, resultsContainer, noResultsMessage);
            return;
        }
        
        if (snapshot.empty) {
            showNoResults(noResultsMessage, resultsContainer);
            return;
        }
          // Extract and filter all services based on search parameters
        let allServices = [];
        snapshot.forEach(doc => {
            allServices.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Filter services based on search parameters
        let filteredServices = allServices;
        
        if (service || location) {
            filteredServices = allServices.filter(item => {
                // Enhanced search that looks at multiple service fields that providers might have added
                const matchService = !service || 
                    (item.serviceName && item.serviceName.toLowerCase().includes(service.toLowerCase())) || 
                    (item.description && item.description.toLowerCase().includes(service.toLowerCase())) ||
                    (item.category && item.category.toLowerCase().includes(service.toLowerCase())) ||
                    (item.tags && Array.isArray(item.tags) && item.tags.some(tag => 
                        tag.toLowerCase().includes(service.toLowerCase())));
                
                const matchLocation = !location || 
                    (item.location && item.location.toLowerCase().includes(location.toLowerCase()));
                
                return matchService && matchLocation;
            });
        }
        
        if (filteredServices.length === 0) {
            showNoResults(noResultsMessage, resultsContainer);
        } else {
            displayResults(filteredServices, resultsContainer);
            noResultsMessage.style.display = 'none';
        }
          } catch (error) {
        console.error('Error fetching services:', error);
        console.log('Falling back to mock data due to error');
        displayMockResults(service, location, resultsContainer, noResultsMessage);
    }
}

// Display mock results for demonstration
function displayMockResults(service, location, resultsContainer, noResultsMessage) {    // Mock data for demonstration purposes - representing provider offered services
    const mockServices = [
        {
            id: '1',
            serviceName: 'Premium Oil Change Service',
            description: 'Full synthetic oil change with filter replacement and multi-point inspection',
            price: '$49.99',
            location: 'New York',
            provider: 'AutoCare Express',
            providerRating: 4.8,
            image: 'https://source.unsplash.com/random/300x200/?car,oil',
            category: 'Maintenance',
            tags: ['oil change', 'maintenance', 'fluid change']
        },
        {
            id: '2',
            serviceName: 'Professional Tire Replacement',
            description: 'All season tire replacement and balancing with alignment check',
            price: '$89.99 per tire',
            location: 'Chicago',
            provider: 'Tire Kings',
            providerRating: 4.5,
            image: 'https://source.unsplash.com/random/300x200/?car,tire',
            category: 'Tires',
            tags: ['tires', 'wheels', 'balancing', 'alignment']
        },
        {
            id: '3',
            serviceName: 'Complete Brake Service',
            description: 'Front and rear brake pad replacement with rotor inspection',
            price: '$159.99',
            location: 'Los Angeles',
            provider: 'Brake Masters',
            providerRating: 4.7,
            image: 'https://source.unsplash.com/random/300x200/?car,brake',
            category: 'Brakes',
            tags: ['brakes', 'safety', 'brake pads', 'rotors']
        },
        {
            id: '4',
            serviceName: 'Premium Car Detailing Package',
            description: 'Complete interior and exterior detailing with ceramic coating',
            price: '$199.99',
            location: 'New York',
            provider: 'Shine Pro Auto',
            providerRating: 4.9,
            image: 'https://source.unsplash.com/random/300x200/?car,detailing',
            category: 'Detailing',
            tags: ['detailing', 'cleaning', 'ceramic coating', 'interior', 'exterior']
        },
        {
            id: '5',
            serviceName: 'Advanced Engine Tune-Up',
            description: 'Comprehensive engine diagnostic and performance tune-up',
            price: '$129.99',
            location: 'Chicago',
            provider: 'Engine Works',
            providerRating: 4.6,
            category: 'Engine',
            image: 'https://source.unsplash.com/random/300x200/?car,engine',
            tags: ['engine', 'performance', 'tune-up', 'diagnostics']
        }
    ];
      // Filter mock data based on search parameters - includes search across multiple service fields
    let filteredServices = mockServices;
      if (service || location) {
        filteredServices = mockServices.filter(item => {
            // Enhanced search that looks at multiple service fields including tags
            const matchService = !service || 
                item.serviceName.toLowerCase().includes(service.toLowerCase()) || 
                (item.description && item.description.toLowerCase().includes(service.toLowerCase())) ||
                (item.category && item.category.toLowerCase().includes(service.toLowerCase())) ||
                (item.tags && Array.isArray(item.tags) && item.tags.some(tag => 
                    tag.toLowerCase().includes(service.toLowerCase())));
                
            const matchLocation = !location || item.location.toLowerCase().includes(location.toLowerCase());
            return matchService && matchLocation;
        });
    }
    
    // Display results or no results message
    if (filteredServices.length === 0) {
        showNoResults(noResultsMessage, resultsContainer);
    } else {
        displayResults(filteredServices, resultsContainer);
        noResultsMessage.style.display = 'none';
    }
}

// Display search results
function displayResults(services, container) {
    container.innerHTML = '';
    console.log('Displaying', services.length, 'services');
    
    services.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        
        // Add category tag if available
        const categoryTag = service.category ? 
            `<span class="service-category">${service.category}</span>` : '';
        
        // Add rating display if available
        const ratingDisplay = service.providerRating ? 
            `<div class="provider-rating">
                ${generateStarRating(service.providerRating)}
                <span>(${service.providerRating.toFixed(1)})</span>
            </div>` : '';
        
        serviceCard.innerHTML = `
            <div class="service-icon">
                <img src="${service.image || 'https://source.unsplash.com/random/300x200/?car'}" alt="${service.serviceName}">
                ${categoryTag}
            </div>
            <div class="service-content">
                <h3>${service.serviceName}</h3>
                <p>${service.description || 'No description available'}</p>
                <div class="service-details">
                    <span class="service-price">${service.price || 'Price varies'}</span>
                    <span class="service-location"><i class="fas fa-map-marker-alt"></i> ${service.location}</span>
                </div>                <div class="service-provider">
                    <span><i class="fas fa-user"></i> ${service.provider}</span>
                    ${ratingDisplay}
                </div>
                ${service.tags && service.tags.length > 0 ? 
                    `<div class="service-tags">
                        ${service.tags.slice(0, 3).map(tag => `<span class="service-tag">${tag}</span>`).join('')}
                    </div>` : ''}
                <a href="javascript:void(0);" onclick="showServiceDetail('${service.id}')" class="btn-service">View Details</a>
            </div>
        `;
        
        container.appendChild(serviceCard);
    });
}

// Show no results message
function showNoResults(noResultsMessage, resultsContainer) {
    resultsContainer.innerHTML = '';
    noResultsMessage.style.display = 'flex';
}

// Generate star rating HTML based on rating value
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHtml = '';
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    
    // Add half star if needed
    if (hasHalfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
    }
    
    return starsHtml;
}

// Function to show service details
async function showServiceDetail(serviceId) {
    try {
        // First, check if Firebase is available and initialized
        let service = null;
        
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            try {
                // Try to get the service from Firebase
                const db = firebase.firestore();
                const serviceDoc = await db.collection('services').doc(serviceId).get();
                
                if (serviceDoc.exists) {
                    service = {
                        id: serviceDoc.id,
                        ...serviceDoc.data()
                    };
                    console.log('Service found in Firebase:', service);
                } else {
                    console.log('Service not found in Firebase, falling back to mock data');
                }
            } catch (permissionError) {
                console.warn('Firebase permission error when accessing service details:', permissionError.message);
                console.log('Falling back to mock data due to permission issues');
            }
        }
        
        // If service not found in Firebase, check mock data
        if (!service) {
            const mockServices = [
                {
                    id: '1',
                    serviceName: 'Premium Oil Change Service',
                    description: 'Full synthetic oil change with filter replacement and multi-point inspection',
                    price: '$49.99',
                    location: 'New York',
                    provider: 'AutoCare Express',
                    providerRating: 4.8,
                    image: 'https://source.unsplash.com/random/300x200/?car,oil',
                    category: 'Maintenance',
                    tags: ['oil change', 'maintenance', 'fluid change'],
                    details: 'Our premium oil change service includes high-quality synthetic oil, a new oil filter, and a comprehensive multi-point inspection of your vehicle. We check fluid levels, filter conditions, and perform a basic safety inspection.'
                },
        {
            id: '2',
            serviceName: 'Professional Tire Replacement',
            description: 'All season tire replacement and balancing with alignment check',
            price: '$89.99 per tire',
            location: 'Chicago',
            provider: 'Tire Kings',
            providerRating: 4.5,
            image: 'https://source.unsplash.com/random/300x200/?car,tire',
            category: 'Tires',
            tags: ['tires', 'wheels', 'balancing', 'alignment'],
            details: 'Get your tires replaced by professionals. Our complete tire service includes removal of old tires, mounting of new tires, balancing, alignment check, and proper disposal of old tires. All work performed by certified technicians.'
        },
        {
            id: '3',
            serviceName: 'Complete Brake Service',
            description: 'Front and rear brake pad replacement with rotor inspection',
            price: '$159.99',
            location: 'Los Angeles',
            provider: 'Brake Masters',
            providerRating: 4.7,
            image: 'https://source.unsplash.com/random/300x200/?car,brake',
            category: 'Brakes',
            tags: ['brakes', 'safety', 'brake pads', 'rotors'],
            details: 'Our complete brake service includes premium brake pads, thorough inspection of rotors, calipers, and brake lines for safety. We test your braking system to ensure it meets all safety standards and performs optimally.'
        },
        {
            id: '4',
            serviceName: 'Premium Car Detailing Package',
            description: 'Complete interior and exterior detailing with ceramic coating',
            price: '$199.99',
            location: 'New York',
            provider: 'Shine Pro Auto',
            providerRating: 4.9,
            image: 'https://source.unsplash.com/random/300x200/?car,detailing',
            category: 'Detailing',
            tags: ['detailing', 'cleaning', 'ceramic coating', 'interior', 'exterior'],
            details: 'Our comprehensive detailing service includes exterior wash and wax, ceramic coating application, interior vacuuming, steam cleaning, leather conditioning, and treatment of all surfaces. Your car will look showroom new.'
        },
        {
            id: '5',
            serviceName: 'Advanced Engine Tune-Up',
            description: 'Comprehensive engine diagnostic and performance tune-up',
            price: '$129.99',
            location: 'Chicago',
            provider: 'Engine Works',
            providerRating: 4.6,
            category: 'Engine',
            tags: ['engine', 'performance', 'tune-up', 'diagnostics'],
            image: 'https://source.unsplash.com/random/300x200/?car,engine',
            details: 'Our advanced engine tune-up includes spark plug replacement, fuel system cleaning, complete computer diagnostics, and adjustments to restore optimal engine performance and fuel efficiency.'
        }
    ];    service = mockServices.find(s => s.id === serviceId);
        }
    
        if (!service) {
            showNotification('Service details not found', 'error');
            return;
        }
    } catch (error) {
        console.error('Error getting service details:', error);
        showNotification('Error loading service details', 'error');
        return;
    }
    
    // Create a modal to display service details
    const modal = document.createElement('div');
    modal.className = 'service-modal';
    
    // Generate rating stars if rating is available
    const ratingDisplay = service.providerRating ? 
        `<div class="provider-rating">
            ${generateStarRating(service.providerRating)}
            <span>(${service.providerRating.toFixed(1)})</span>
        </div>` : '';
    
    // Generate tags if available
    let tagsHtml = '';
    if (service.tags && service.tags.length > 0) {
        tagsHtml = `
            <div class="service-tags">
                ${service.tags.map(tag => `<span class="service-tag">${tag}</span>`).join('')}
            </div>
        `;
    }
    
    modal.innerHTML = `
        <div class="service-modal-content">
            <span class="close-modal">&times;</span>
            <div class="service-modal-header">
                <h2>${service.serviceName}</h2>
                <span class="service-price">${service.price}</span>
            </div>
            <div class="service-modal-body">
                <img src="${service.image}" alt="${service.serviceName}" class="service-detail-image">
                <div class="service-info">
                    <p class="service-description">${service.details || service.description}</p>
                    ${tagsHtml}
                    <div class="service-meta">
                        <div class="service-meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${service.location}</span>
                        </div>
                        <div class="service-meta-item">
                            <i class="fas fa-user"></i>
                            <span>${service.provider}</span>
                            ${ratingDisplay}
                        </div>
                        <div class="service-meta-item">
                            <i class="fas fa-tag"></i>
                            <span>${service.category || 'General Service'}</span>
                        </div>
                    </div>
                </div>
                <div class="service-actions">
                    <button class="btn-book">Book Now</button>
                    <button class="btn-contact">Contact Provider</button>
                </div>
            </div>
        </div>
    `;
    
    // Add the modal to the body
    document.body.appendChild(modal);
    
    // Show the modal
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Close modal when clicking the close button
    const closeButton = modal.querySelector('.close-modal');
    closeButton.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
    
    // Close modal when clicking outside the content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    });
    
    // Handle booking button
    const bookButton = modal.querySelector('.btn-book');
    if (bookButton) {
        bookButton.addEventListener('click', () => {
            showNotification('Booking feature will be available soon!', 'info');
        });
    }
    
    // Handle contact button
    const contactButton = modal.querySelector('.btn-contact');
    if (contactButton) {
        contactButton.addEventListener('click', () => {
            showNotification('Contact feature will be available soon!', 'info');
        });
    }
}
