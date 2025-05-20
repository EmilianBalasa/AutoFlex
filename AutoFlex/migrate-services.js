// Service Migration Script
// This script updates existing services to include all fields needed for search functionality

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
const db = firebase.firestore();

// Function to update all services
async function updateAllServices() {
    try {
        console.log('Starting service migration...');
        
        // Get all services
        const servicesSnapshot = await db.collection('services').get();
        
        if (servicesSnapshot.empty) {
            console.log('No services found to update');
            return;
        }
        
        console.log(`Found ${servicesSnapshot.size} services to check/update`);
        let updatedCount = 0;
        
        // Process each service
        for (const doc of servicesSnapshot.docs) {
            const service = doc.data();
            const serviceId = doc.id;
            let needsUpdate = false;
            const updateData = {};
            
            // Check for missing fields
            if (!service.serviceName && service.name) {
                updateData.serviceName = service.name;
                needsUpdate = true;
            }
            
            if (!service.location) {
                // Try to get provider location
                try {
                    if (service.providerId) {
                        const providerDoc = await db.collection('providers').doc(service.providerId).get();
                        if (providerDoc.exists) {
                            const provider = providerDoc.data();
                            updateData.location = provider.address || 'Not specified';
                        } else {
                            updateData.location = 'Not specified';
                        }
                    } else {
                        updateData.location = 'Not specified';
                    }
                    needsUpdate = true;
                } catch (error) {
                    console.error(`Error getting provider location for service ${serviceId}:`, error);
                    updateData.location = 'Not specified';
                    needsUpdate = true;
                }
            }
            
            // Ensure price is formatted as string
            if (typeof service.price === 'number') {
                updateData.price = `$${service.price.toFixed(2)}`;
                needsUpdate = true;
            }
            
            // Add tags if missing
            if (!service.tags || !Array.isArray(service.tags) || service.tags.length === 0) {
                // Generate tags from service name, category and description
                const tags = [];
                
                // Add category as first tag
                if (service.category) {
                    const categoryTag = service.category.replace(/_/g, ' ').toLowerCase();
                    tags.push(categoryTag);
                }
                
                // Add words from service name
                if (service.serviceName || service.name) {
                    const name = service.serviceName || service.name;
                    const nameWords = name.toLowerCase().split(' ');
                    for (const word of nameWords) {
                        if (word.length > 3 && !tags.includes(word)) { // Only add meaningful words
                            tags.push(word);
                        }
                    }
                }
                
                updateData.tags = tags;
                needsUpdate = true;
            }
            
            // Add provider name if missing
            if (!service.provider && service.providerId) {
                try {
                    const providerDoc = await db.collection('providers').doc(service.providerId).get();
                    if (providerDoc.exists) {
                        const providerData = providerDoc.data();
                        updateData.provider = providerData.businessName || 'Auto Service Provider';
                        needsUpdate = true;
                    }
                } catch (error) {
                    console.error(`Error getting provider name for service ${serviceId}:`, error);
                }
            }
            
            // Add image if missing
            if (!service.image) {
                updateData.image = 'https://source.unsplash.com/random/300x200/?car';
                needsUpdate = true;
            }
            
            // Update service if needed
            if (needsUpdate) {
                try {
                    await db.collection('services').doc(serviceId).update({
                        ...updateData,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    updatedCount++;
                    console.log(`Updated service ${serviceId}`);
                } catch (error) {
                    console.error(`Error updating service ${serviceId}:`, error);
                }
            }
        }
        
        console.log(`Migration complete. Updated ${updatedCount} services.`);
        return updatedCount;
        
    } catch (error) {
        console.error('Error updating services:', error);
        return 0;
    }
}

// Function to run the migration
function runMigration() {
    updateAllServices()
        .then(count => {
            document.getElementById('result').innerHTML = `Successfully updated ${count} services.`;
        })
        .catch(error => {
            document.getElementById('result').innerHTML = `Error: ${error.message}`;
        });
}

// Add event listener to the button
document.addEventListener('DOMContentLoaded', () => {
    const migrateButton = document.getElementById('migrateButton');
    if (migrateButton) {
        migrateButton.addEventListener('click', runMigration);
    }
});
