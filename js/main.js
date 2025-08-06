// js/main.js

// UPDATED: Added handleComponentClick to the import list
import { renderComponentTable, setupEventListeners, showAddComponentForm, handleComponentClick, currentlyDisplayedComponents, handleGlobalCsvImport } from './ui.js';
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

    // START: Add this new section for the export button
    document.getElementById('export-csv-btn').addEventListener('click', () => {
        exportToCSV();
    });
    // END: Add this new section

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
    // Add this line after the other 'addEventListener' calls
    document.getElementById('import-csv-global-btn').addEventListener('click', () => {
        handleGlobalCsvImport();
    });
    
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

// Add this new function to the end of js/main.js

/**
 * Converts the currently displayed components to a CSV format and downloads the file.
 */
function exportToCSV() {
    // Use the component list that is currently being displayed in the table
    const componentsToExport = currentlyDisplayedComponents;

    if (componentsToExport.length === 0) {
        alert('There are no components to export.');
        return;
    }

    // 1. Define CSV Headers
    const headers = ['Drawing', 'Component', 'Unit'];
    const csvRows = [headers.join(',')]; // Start with the header row

    // 2. Convert each component object to a CSV row
    for (const component of componentsToExport) {
        const values = headers.map(header => {
            const escaped = ('' + component[header]).replace(/"/g, '\\"'); // Handle quotes
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    
    // 3. Create a Blob and trigger the download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'components_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Start the application!
initializeApp();

