// Console log for debugging Car Wash service type issues
document.addEventListener('DOMContentLoaded', function() {
    console.log('Debug Service Types script loaded');
    
    // Check service types dropdown when booking form is opened
    const bookServiceBtn = document.getElementById('bookServiceBtn');
    if (bookServiceBtn) {
        console.log('Book Service button found, adding listener');
        bookServiceBtn.addEventListener('click', function() {
            console.log('Book Service button clicked');
            setTimeout(() => {
                const serviceTypeDropdown = document.getElementById('serviceType');
                if (serviceTypeDropdown) {
                    console.log('Service Type Dropdown Options:', 
                        Array.from(serviceTypeDropdown.options)
                            .map(o => ({value: o.value, text: o.text}))
                    );
                    
                    // Add Car Wash option if it doesn't exist
                    if (!Array.from(serviceTypeDropdown.options).some(opt => opt.value === 'car_wash')) {
                        console.log('Car Wash option not found, adding it');
                        const option = document.createElement('option');
                        option.value = 'car_wash';
                        option.text = 'Car Wash';
                        serviceTypeDropdown.add(option);
                    } else {
                        console.log('Car Wash option is already in the dropdown');
                    }
                } else {
                    console.log('Service Type dropdown not found');
                }
            }, 1000); // Wait for dropdown to be populated
        });
    } else {
        console.log('Book Service button not found');
    }
    
    // Monitor DOM changes to catch when the dropdown is added to the page
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                mutation.addedNodes.forEach((node) => {
                    if (node.id === 'serviceType' || 
                        (node.querySelector && node.querySelector('#serviceType'))) {
                        console.log('Service Type dropdown added to DOM');
                        setTimeout(() => {
                            const dropdown = document.getElementById('serviceType');
                            if (dropdown && !Array.from(dropdown.options).some(opt => opt.value === 'car_wash')) {
                                console.log('Adding Car Wash option to newly added dropdown');
                                const option = document.createElement('option');
                                option.value = 'car_wash';
                                option.text = 'Car Wash';
                                dropdown.add(option);
                            }
                        }, 500);
                    }
                });
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
});
