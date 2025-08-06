// js/main.js

import { fetchComponents } from './api.js';
import { renderComponentTable, setupEventListeners, showAddComponentForm } from './ui.js';

console.log('Component Tracker Initializing...');

// This variable will hold our master list of components
let allComponents = [];

/**
 * The main function to start the application.
 */
async function initializeApp() {
    // We'll now use our new refresh function to handle the initial load
    await refreshComponentsList();

    // Listen for clicks on the "Add Component" button
    document.getElementById('add-component-btn').addEventListener('click', () => {
        showAddComponentForm();
    });
}

/**
 * Refreshes the component list, now with a default sort.
 */
export async function refreshComponentsList() {
    // 1. Re-fetch the data from the API
    allComponents = await fetchComponents();
    
    // 2. THIS IS THE FIX: Apply the default sort before doing anything else.
    // We sort by 'Drawing' in ascending order using our natural sort logic.
    allComponents.sort((a, b) => {
        return a.Component.localeCompare(b.Component, undefined, { numeric: true, sensitivity: 'base' });
    });

    // 3. Set up the search/sort event listeners with the now-sorted list.
    setupEventListeners(allComponents);

    // 4. Render the table. It will now be sorted by default.
    renderComponentTable(allComponents);
}


// Start the application!
initializeApp();