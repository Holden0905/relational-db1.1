// js/main.js

// UPDATED: Added handleComponentClick to the import list
import { renderComponentTable, setupEventListeners, showAddComponentForm, handleComponentClick } from './ui.js';
import { fetchComponents } from './api.js';

console.log('Component Tracker Initializing...');

// This variable will hold our master list of components
let allComponents = [];

/**
 * The main function to start the application.
 */
async function initializeApp() {
    await refreshComponentsList();

    document.getElementById('add-component-btn').addEventListener('click', () => {
        showAddComponentForm();
    });

    // START: Add this new section for the theme toggle
    const themeCheckbox = document.getElementById('theme-checkbox');
    const body = document.body;

    // Listen for changes on the checkbox
    themeCheckbox.addEventListener('change', () => {
        if (themeCheckbox.checked) {
            // If checked, add the dark-mode class to the body
            body.classList.add('dark-mode');
        } else {
            // If unchecked, remove it
            body.classList.remove('dark-mode');
        }
    });
    // END: Add this new section
}

/**
 * Refreshes the component list and loads the first component by default.
 */
export async function refreshComponentsList() {
    // 1. Fetch the data
    allComponents = await fetchComponents();
    
    // 2. Apply the default sort
    allComponents.sort((a, b) => {
        return a.Component.localeCompare(b.Component, undefined, { numeric: true, sensitivity: 'base' });
    });

    // 3. Set up the event listeners
    setupEventListeners(allComponents);

    // 4. Render the table
    renderComponentTable(allComponents);

    // 5. NEW: Automatically load the first component in the list
    if (allComponents.length > 0) {
        handleComponentClick(allComponents[0]);
    }
}

// Start the application!
initializeApp();