/**
 * Service Types Management for AutoFlex
 * This file contains functions for loading service types in the AutoFlex application.
 * Created to ensure consistent handling of service types across the application.
 */

// Default service types that should always be available
const DEFAULT_SERVICE_TYPES = [
    {value: 'oil_change', text: 'Oil Change'},
    {value: 'tire_rotation', text: 'Tire Rotation'},
    {value: 'brake_service', text: 'Brake Service'},
    {value: 'battery_check', text: 'Battery Check'},
    {value: 'engine_diagnostic', text: 'Engine Diagnostic'},
    {value: 'transmission_service', text: 'Transmission Service'},
    {value: 'coolant_flush', text: 'Coolant Flush'},
    {value: 'air_filter', text: 'Air Filter Replacement'},
    {value: 'car_wash', text: 'Car Wash'}, // Ensuring Car Wash is always included
    {value: 'other', text: 'Other Service'}
];

/**
 * Adds default service types to a select element
 * @param {HTMLSelectElement} selectElement - The select element to populate
 * @param {Set} uniqueSet - Optional Set to track unique service types
 */
function addDefaultServiceTypes(selectElement, uniqueSet = new Set()) {
    if (!selectElement) return;
    
    DEFAULT_SERVICE_TYPES.forEach(type => {
        if (!uniqueSet || !uniqueSet.has(type.value)) {
            const option = document.createElement('option');
            option.value = type.value;
            option.text = type.text;
            selectElement.add(option);
            
            if (uniqueSet) {
                uniqueSet.add(type.value);
            }
        }
    });
    
    // Final verification for critical services
    ensureCriticalServiceTypes(selectElement, uniqueSet);
}

/**
 * Ensures critical service types (like Car Wash) are always present
 * @param {HTMLSelectElement} selectElement - The select element to check
 * @param {Set} uniqueSet - Optional Set to track unique service types
 */
function ensureCriticalServiceTypes(selectElement, uniqueSet = null) {
    // List of critical service types that must be present
    const criticalTypes = [
        {value: 'car_wash', text: 'Car Wash'}
    ];
    
    criticalTypes.forEach(type => {
        // Check if this type already exists in the select element
        if (!Array.from(selectElement.options).some(opt => opt.value === type.value)) {
            console.log(`Adding critical service type: ${type.text}`);
            const option = document.createElement('option');
            option.value = type.value;
            option.text = type.text;
            selectElement.add(option);
            
            if (uniqueSet) {
                uniqueSet.add(type.value);
            }
        }
    });
}

/**
 * Loads service types from Firebase into a select element
 * @param {HTMLSelectElement} selectElement - The select element to populate
 * @param {object} db - Firestore database instance
 * @returns {Promise<void>}
 */
async function loadServiceTypesFromFirebase(selectElement, db) {
    if (!selectElement || !db) return;
    
    try {
        // Clear existing options except the first one (placeholder)
        while (selectElement.options.length > 1) {
            selectElement.remove(1);
        }
        
        // Add a loading indicator
        const loadingOption = document.createElement('option');
        loadingOption.text = 'Loading service types...';
        loadingOption.disabled = true;
        selectElement.add(loadingOption);
        
        // Track unique service types to avoid duplicates
        const uniqueServiceTypes = new Set();
        
        // First add default service types including Car Wash
        addDefaultServiceTypes(selectElement, uniqueServiceTypes);
        
        // Explicitly ensure car_wash is in the uniqueServiceTypes set
        uniqueServiceTypes.add('car_wash');
        
        // Get services from Firebase to extract additional categories
        const servicesSnapshot = await db.collection('services').get();
        
        // Remove the loading indicator
        selectElement.remove(selectElement.querySelector('option[disabled]'));
        
        // Add service types from services collection if any
        if (!servicesSnapshot.empty) {
            servicesSnapshot.forEach(doc => {
                const service = doc.data();
                if (service.category && !uniqueServiceTypes.has(service.category.toLowerCase())) {
                    const value = service.category.toLowerCase().replace(/\s+/g, '_');
                    const text = service.category.charAt(0).toUpperCase() + service.category.slice(1);
                    
                    uniqueServiceTypes.add(value);
                    
                    const option = document.createElement('option');
                    option.value = value;
                    option.text = text;
                    selectElement.add(option);
                }
            });
        }
        
        // Final check to ensure critical services are included
        ensureCriticalServiceTypes(selectElement, uniqueServiceTypes);
        
    } catch (error) {
        console.error('Error loading service types:', error);
        
        // Remove the loading indicator if it exists
        const loadingOpt = selectElement.querySelector('option[disabled]');
        if (loadingOpt) selectElement.remove(loadingOpt);
        
        // Fall back to default options on error
        addDefaultServiceTypes(selectElement);
    }
}

// Export functions for use in other files
window.AutoFlexServices = {
    addDefaultServiceTypes,
    ensureCriticalServiceTypes,
    loadServiceTypesFromFirebase,
    DEFAULT_SERVICE_TYPES
};
