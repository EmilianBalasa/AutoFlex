document.addEventListener('DOMContentLoaded', function() {
    // Initialize Search Functionality
    const searchBtn = document.getElementById('searchBtn');
    const serviceSearch = document.getElementById('serviceSearch');
    const locationSearch = document.getElementById('locationSearch');

    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    function handleSearch() {
        const service = serviceSearch ? serviceSearch.value.trim() : '';
        const location = locationSearch ? locationSearch.value.trim() : '';
        
        if (!service && !location) {
            alert('Please enter a service or location to search');
            return;
        }
        
        localStorage.setItem('searchService', service);
        localStorage.setItem('searchLocation', location);
        
        window.location.href = `services.html?service=${encodeURIComponent(service)}&location=${encodeURIComponent(location)}`;
    }    // Handle Enter key in search inputs
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

    // Service card click handlers
    function initServiceCards() {
        const cards = document.querySelectorAll('.service-card');
        
        const serviceMap = {
            'Service Auto': 'service_auto',
            'Car Wash': 'car_wash', 
            'Rent a Car': 'rent_a_car',
            'Detailing': 'detailing',
            'Auto Parts': 'auto_parts',
            'Tire Service': 'tire_service'
        };

        cards.forEach(card => {
            const serviceName = card.querySelector('.service-name');
            
            if (serviceName) {
                const serviceText = serviceName.textContent.trim();
                const searchTerm = serviceMap[serviceText];
                
                if (searchTerm) {
                    card.style.cursor = 'pointer';
                    
                    card.addEventListener('click', function(e) {
                        e.preventDefault();
                        
                        localStorage.setItem('searchService', searchTerm);
                        localStorage.setItem('searchLocation', '');
                        
                        window.location.href = `services.html?service=${encodeURIComponent(searchTerm)}`;
                    });

                    card.addEventListener('mouseenter', function() {
                        card.style.transform = 'translateY(-5px)';
                        card.style.transition = 'transform 0.3s ease';
                    });

                    card.addEventListener('mouseleave', function() {
                        card.style.transform = 'translateY(0)';
                    });
                }
            }
        });
    }

    initServiceCards();
});
