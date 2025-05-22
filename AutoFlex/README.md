# AutoFlex - Auto Services Marketplace

## Overview
AutoFlex is a comprehensive marketplace platform connecting auto service providers with customers. Users can search for services, browse providers, and book appointments for various automotive needs.

## Features
- **Enhanced Search**: Find services by name, description, category, tags, or location
- **Provider Dashboard**: Service providers can manage their profile, services, and appointments
- **Customer Dashboard**: Users can book services and track their appointments
- **Responsive Design**: Optimized for all devices from mobile to desktop

## Key Files and Components

### Main Pages
- `autoflex.html` - Home page with featured services
- `services.html` - Search and browse all provider services
- `providers.html` - Browse and filter service providers
- `login.html` - Authentication page for customers and providers

### Dashboard Pages
- `provider-dashboard.html` - Service provider management interface
- `client-dashboard.html` - Customer interface for bookings and history

### Scripts
- `services.js` - Handles service searching and display
- `provider-dashboard.js` - Provider dashboard functionality
- `migrate-services.js` - Tool for updating services to support enhanced search

### Configuration Files
- `firebase.json` - Firebase configuration
- `firestore.rules` - Security rules for Firestore database

### Documentation
- `SEARCH-DOCUMENTATION.md` - Details about the search functionality
- `FIREBASE-SETUP.md` - Instructions for setting up Firebase

## Search Functionality
The improved search system allows users to find services offered by providers across multiple criteria:

1. **Service name** - The primary title of the service
2. **Service description** - Detailed information about what's included
3. **Service category** - The type of service (e.g., Maintenance, Repair)
4. **Service tags** - Keywords associated with the service
5. **Location** - Where the service is offered

The search now exclusively displays real services added by providers in the Firebase database, ensuring users only see actual available services. Mock/test services have been removed from search results.
3. **Service category** - Classification of the service
4. **Service tags** - Keywords to improve searchability
5. **Location** - Where the service is offered

The system is designed to match partial queries and works across all these fields to provide the most relevant results.

## Firebase Integration
AutoFlex uses Firebase for:
- Authentication (customer and provider accounts)
- Firestore (service listings, provider profiles, appointments)
- Storage (images and files)

Proper security rules are required for the search functionality to work correctly - see `FIREBASE-SETUP.md` for details.

## Getting Started

### Prerequisites
- Web server (Apache, Nginx, etc.)
- Firebase account with Firestore database

### Setup
1. Deploy files to a web server
2. Configure Firebase (follow instructions in `FIREBASE-SETUP.md`)
3. Run the service migration tool if upgrading from a previous version

## Developed By
The AutoFlex Team - ©2025 AutoFlex. All rights reserved.
