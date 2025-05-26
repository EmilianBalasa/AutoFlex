// Main autoflex page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Autoflex page - DOM Content Loaded');
    
    // Animation on scroll
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
        
        // Store search parameters in localStorage to use on services page
        localStorage.setItem('searchService', service);
        localStorage.setItem('searchLocation', location);
        
        // Redirect to services page with query parameters
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

    // Also handle pressing Enter key in search inputs
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

    // Function to initialize service card click handlers
    function initializeServiceCards() {
        console.log('🔄 initializeServiceCards called');
        const serviceCards = document.querySelectorAll('.service-card');
        console.log('🔍 Found', serviceCards.length, 'service cards');
        
        // Mapping of service names to search terms
        const serviceMapping = {
            'Service Auto': 'service_auto',
            'Car Wash': 'car_wash', 
            'Rent a Car': 'rent_a_car',
            'Detailing': 'detailing',
            'Auto Parts': 'auto_parts',
            'Tire Service': 'tire_service'
        };

        serviceCards.forEach((card, index) => {
            console.log(`📋 Processing card ${index + 1}`);
            const serviceName = card.querySelector('.service-name');
            console.log(`Card ${index + 1}:`, serviceName ? serviceName.textContent.trim() : 'No service name found');
            
            if (serviceName) {
                const serviceText = serviceName.textContent.trim();
                const searchTerm = serviceMapping[serviceText];
                
                if (searchTerm) {
                    console.log(`✅ Setting up click handler for: ${serviceText} -> ${searchTerm}`);
                    
                    // Add cursor pointer
                    card.style.cursor = 'pointer';
                    
                    // Add click event listener with event parameter
                    card.addEventListener('click', function(event) {
                        event.preventDefault();
                        event.stopPropagation();
                        console.log(`🖱️ CLICK DETECTED on service card: ${serviceText} -> searching for: ${searchTerm}`);
                        
                        // Show feedback to user
                        showNotification(`Searching for ${serviceText} services...`, 'info');
                        
                        // Store search parameters
                        localStorage.setItem('searchService', searchTerm);
                        localStorage.setItem('searchLocation', '');
                        
                        // Small delay to show notification, then redirect
                        setTimeout(() => {
                            console.log(`🔄 Redirecting to services.html with term: ${searchTerm}`);
                            window.location.href = `services.html?service=${encodeURIComponent(searchTerm)}`;
                        }, 500);
                    });

                    // Add visual feedback on hover
                    card.addEventListener('mouseenter', function() {
                        card.style.transform = 'translateY(-5px)';
                        card.style.transition = 'transform 0.3s ease';
                        console.log(`🖱️ Hover on: ${serviceText}`);
                    });

                    card.addEventListener('mouseleave', function() {
                        card.style.transform = 'translateY(0)';
                    });
                    
                    console.log(`✅ Successfully set up click handler for: ${serviceText}`);
                } else {
                    console.log(`❌ No search term mapping found for: ${serviceText}`);
                }
            } else {
                console.log(`❌ Card ${index + 1} has no .service-name element`);
            }
        });
        
        console.log('✅ initializeServiceCards completed');
    }

    // Initialize service card click handlers
    console.log('🚀 About to call initializeServiceCards...');
    initializeServiceCards();
    
    console.log('✅ All autoflex page initialization completed');
});
