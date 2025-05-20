        // Mobile Menu Toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.getElementById('navLinks');

        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });

        // Animation on scroll
        document.addEventListener('DOMContentLoaded', function() {
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
            });            // Initialize Search Functionality
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
        });