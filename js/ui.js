// js/ui.js

// All your imports remain the same. We need all these functions.
// js/ui.js

// Replace all existing import lines at the top of this file with these two:
import { refreshComponentsList } from './main.js';
import * as api from './api.js';

// Add this new variable at the top of js/ui.js
export let currentlyDisplayedComponents = [];

/**
 * Shows a form to add a new component. This form will appear in the main content area.
 */
export function showAddComponentForm() {
    const mainContent = document.getElementById('pdf-main-content');
    
    mainContent.innerHTML = `
        <h2>Add New Component</h2>
        <div class="form-container">
            <form id="add-component-form">
                <div class="form-group">
                    <label for="comp-drawing">Drawing:</label>
                    <input type="text" id="comp-drawing" class="form-control" required placeholder="e.g., LDAR-1">
                </div>
                <div class="form-group">
                    <label for="comp-component">Component:</label>
                    <input type="text" id="comp-component" class="form-control" required placeholder="e.g., V-101">
                </div>
                <div class="form-group">
                    <label for="comp-unit">Unit:</label>
                    <input type="text" id="comp-unit" class="form-control" required placeholder="e.g., Unit 1">
                </div>
                <div style="text-align: center;">
                    <button type="submit" class="btn btn-primary">Save Component</button>
                    <button type="button" id="cancel-add-component" class="btn btn-danger" style="margin-left: 10px;">Cancel</button>
                </div>
            </form>
        </div>
    `;

    // Add listeners for the new form's buttons
    document.getElementById('add-component-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleAddComponent();
    });

    document.getElementById('cancel-add-component').addEventListener('click', () => {
        // On cancel, simply clear the main content area
        mainContent.innerHTML = '<h2>LDAR Drawing</h2><p>Select a component to view its technical drawing</p>';
    });
}

// Paste this function right after showAddComponentForm in ui.js

/**
 * Handles the submission of the "Add Component" form.
 */
async function handleAddComponent() {
    // 1. Get the data from the form
    const componentData = {
        Drawing: document.getElementById('comp-drawing').value,
        Component: document.getElementById('comp-component').value,
        Unit: document.getElementById('comp-unit').value
    };

    // 2. Call the API layer to save the new component
    const { error } = await api.addComponent(componentData);

    // 3. If successful, clear the form and refresh the component list
    if (!error) {
        alert('Component added successfully!');
        document.getElementById('pdf-main-content').innerHTML = '<h2>LDAR Drawing</h2><p>Select a component to view its technical drawing</p>';
        
        // This new function from main.js will re-fetch all components and re-render the table
        await refreshComponentsList();
    }
}

/**
 * Sets up the event listeners for the search and sort controls.
 * It's called once when the app starts.
 * @param {Array} allComponents The complete, unfiltered list of components from the database.
 */
export function setupEventListeners(allComponents) {
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');

    // This nested function will run every time the user types or changes the sort order.
    function filterAndSort() {
        const searchTerm = searchInput.value.toLowerCase();
        const sortValue = sortSelect.value;

        // Step 1: Apply search filter.
        // It keeps only the components where the Drawing, Component, or Unit includes the search term.
        let filteredComponents = allComponents.filter(component => {
            return component.Drawing.toLowerCase().includes(searchTerm) ||
                   component.Component.toLowerCase().includes(searchTerm) ||
                   component.Unit.toLowerCase().includes(searchTerm);
        });

        // Step 2: Apply sorting to the *filtered* results.
        const [property, order] = sortValue.split('.'); // e.g., "Drawing.asc" becomes ["Drawing", "asc"]
        
        filteredComponents.sort((a, b) => {
            const valA = a[property];
            const valB = b[property];

            // This is our special sort function that understands numbers inside text.
            const comparison = naturalSort(valA, valB);

            // If order is "asc", we use the result. If "desc", we flip the result.
            return order === 'asc' ? comparison : -comparison;
        });

        // Step 3: Re-render the table with the newly filtered and sorted data.
        renderComponentTable(filteredComponents);
    }

    // Tell the browser to run our filterAndSort function whenever the user types or selects a new option.
    searchInput.addEventListener('input', filterAndSort);
    sortSelect.addEventListener('change', filterAndSort);
}


// --- NEW FUNCTION ---
/**
 * A "natural sort" function that correctly sorts strings containing numbers.
 * For example, it will sort "LDAR-2" before "LDAR-10".
 * The built-in .sort() would incorrectly place "LDAR-10" first.
 */
function naturalSort(a, b) {
    // The localeCompare method with these options is a powerful, built-in way to achieve natural sorting.
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}


// --- UPDATED FUNCTION ---
/**
 * Renders the list of components into the HTML table.
 * Now includes a message for when no components are found.
 * @param {Array} components - An array of component objects to display.
 */
export function renderComponentTable(components) {
    currentlyDisplayedComponents = components;
    const tableBody = document.getElementById('components-tbody');
    tableBody.innerHTML = '';
    
    // If the filtered array is empty, show a helpful message.
    if (components.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="3" style="text-align: center;">No components match your search.</td></tr>`;
        return;
    }

    // This part is the same as before.
    components.forEach(component => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${component.Drawing}</td>
            <td>${component.Component}</td>
            <td>${component.Unit}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm edit-component-btn" data-component-id="${component.id}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-component-btn" data-component-id="${component.id}">Delete</button>
                </div>
            </td>
        `;
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => handleComponentClick(component));
        tableBody.appendChild(row);

        
    });

    // Add this inside the renderComponentTable function, after the forEach loop

    document.querySelectorAll('.delete-component-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the row's click event from firing
            const componentId = e.target.dataset.componentId;
            handleDeleteComponent(componentId);
        });
    });

    // Add this inside the renderComponentTable function, after the delete listener

    document.querySelectorAll('.edit-component-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the row's click event from firing
            const componentId = e.target.dataset.componentId;
            showEditComponentForm(componentId);
        });
    });

}


// --- NO CHANGES NEEDED BELOW THIS LINE ---
// All the functions for handling clicks, PDFs, and readings are complete and correct.

export async function handleComponentClick(component) {
    renderPdfDisplay(component);
    renderComponentDetails(component);
    await renderReadings(component.id);
}
function renderPdfDisplay(component) {
    const pdfMainContent = document.getElementById('pdf-main-content');
    if (component.drawing_pdf_url) {
        pdfMainContent.innerHTML = `<div class="component-info-banner"><h3>${component.Drawing} - ${component.Component} (${component.Unit})</h3></div><iframe src="${component.drawing_pdf_url}" class="pdf-main-viewer"></iframe><div class="pdf-upload-main" style="margin-top: 1rem;"><button id="replace-pdf-btn" class="btn btn-warning">Replace PDF</button></div>`;
        document.getElementById('replace-pdf-btn').addEventListener('click', () => showPDFUploadForm(component.id));
    } else {
        pdfMainContent.innerHTML = `<div class="component-info-banner"><h3>${component.Drawing} - ${component.Component} (${component.Unit})</h3></div><div class="pdf-upload-main"><p style="color: var(--dark-gray); margin-bottom: 1.5rem;">No technical drawing available for this component.</p><button id="upload-pdf-btn" class="btn btn-primary">Upload PDF</button></div>`;
        document.getElementById('upload-pdf-btn').addEventListener('click', () => showPDFUploadForm(component.id));
    }
}
function renderComponentDetails(component) {
    const detailsContent = document.getElementById('details-content');
    detailsContent.innerHTML = `<h3>Component Information</h3><p><strong>Drawing:</strong> ${component.Drawing}</p><p><strong>Component:</strong> ${component.Component}</p><p><strong>Unit:</strong> ${component.Unit}</p><p><strong>Component ID:</strong> ${component.id}</p><div id="readings-section"><h4>Readings</h4><p>Loading readings...</p></div>`;
}
function showPDFUploadForm(componentId) {
    const pdfMainContent = document.getElementById('pdf-main-content');
    pdfMainContent.innerHTML = `<h2>Upload Technical Drawing</h2><div class="form-container"><form id="pdf-upload-form"><div class="form-group"><label for="pdf-file">Select PDF File:</label><input type="file" id="pdf-file" class="form-control" accept=".pdf" required></div><div style="text-align: center;"><button type="submit" class="btn btn-primary">Upload PDF</button><button type="button" id="cancel-pdf-upload" class="btn btn-danger" style="margin-left: 10px;">Cancel</button></div></form></div><div id="upload-progress" style="margin-top: 10px; display: none;"><div style="background: #f0f0f0; border-radius: 4px; padding: 8px;"><div id="progress-bar" style="background: var(--primary-green); height: 20px; border-radius: 4px; width: 0%; transition: width 0.3s;"></div></div><p id="progress-text">Uploading...</p></div>`;
    document.getElementById('pdf-upload-form').addEventListener('submit', (e) => { e.preventDefault(); handlePdfUpload(componentId); });
    document.getElementById('cancel-pdf-upload').addEventListener('click', async () => {
        const { data: component } = await fetchSingleComponent(componentId);
        if(component) handleComponentClick(component);
    });
}
async function handlePdfUpload(componentId) {
    const fileInput = document.getElementById('pdf-file');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a PDF file');
        return;
    }

    document.getElementById('upload-progress').style.display = 'block';
    const fileName = `component_${componentId}_${Date.now()}.pdf`;

    // 1. Upload to Storage - ADDED api.
    const { error: uploadError } = await api.uploadPdfFile(fileName, file);
    if (uploadError) {
        alert('Error uploading PDF: ' + uploadError.message);
        return;
    }

    // 2. Get Public URL - ADDED api.
    const { data: urlData } = api.getPdfPublicUrl(fileName);

    // 3. Update Database - ADDED api.
    const { error: updateError } = await api.updateComponentPdfUrl(componentId, urlData.publicUrl);
    if (updateError) {
        alert('Error saving PDF URL: ' + updateError.message);
        return;
    }

    alert('PDF uploaded successfully!');
    
    // 4. Refresh the UI - ADDED api.
    const { data: component, error: fetchError } = await api.fetchSingleComponent(componentId);
    if(fetchError){
        location.reload(); 
        return;
    }
    handleComponentClick(component);
}
// Replace your existing renderReadings function with this one

async function renderReadings(componentId) {
    const readingsSection = document.getElementById('readings-section');
    const readings = await api.fetchReadingsForComponent(componentId);
    
    // This HTML string correctly includes the 'add-reading-btn'
    let readingsHTML = `
        <h4>Readings</h4>
        <div style="margin-bottom: 10px;">
            <button id="add-reading-btn" class="btn btn-primary">Add New Reading</button>
        </div>
    `;

    if (readings.length === 0) {
        readingsHTML += `<p>No readings found for this component.</p>`;
    } else {
        readingsHTML += `<div class="readings-list">`;
        readings.forEach(reading => {
            readingsHTML += `
                <div class="reading-item">
                    <div class="reading-info">
                        <strong>Date:</strong> ${reading.test_date} | 
                        <strong>Inspector:</strong> ${reading.inspector} | 
                        <strong>Value:</strong> ${reading.reading_value}
                        ${reading.notes ? ` | <strong>Notes:</strong> ${reading.notes}` : ''}
                    </div>
                    <div class="reading-actions">
                        <button class="btn btn-warning edit-reading-btn" data-reading-id="${reading.id}">Edit</button>
                        <button class="btn btn-danger delete-reading-btn" data-reading-id="${reading.id}">Delete</button>
                    </div>
                </div>
            `;
        });
        readingsHTML += '</div>';
    }

    // Render the complete HTML to the page
    readingsSection.innerHTML = readingsHTML;

    // Attach all necessary event listeners
    document.getElementById('add-reading-btn').addEventListener('click', () => showAddReadingForm(componentId));
    
    document.querySelectorAll('.delete-reading-btn').forEach(button => {
        button.addEventListener('click', (e) => handleDeleteReading(e.target.dataset.readingId, componentId));
    });
    
    document.querySelectorAll('.edit-reading-btn').forEach(button => {
        button.addEventListener('click', (e) => showEditReadingForm(e.target.dataset.readingId, componentId));
    });
}
function showAddReadingForm(componentId) {
    const readingsSection = document.getElementById('readings-section');
    const formHTML = `<h4>Readings</h4><div class="form-container"><h5>Add New Reading</h5><form id="reading-form"><div class="form-group"><label for="test-date">Test Date:</label><input type="date" id="test-date" class="form-control" required></div><div class="form-group"><label for="inspector">Inspector:</label><input type="text" id="inspector" class="form-control" required placeholder="Enter inspector name"></div><div class="form-group"><label for="reading-value">Reading Value:</label><input type="number" id="reading-value" class="form-control" step="0.1" required placeholder="Enter reading value"></div><div class="form-group"><label for="notes">Notes (optional):</label><textarea id="notes" class="form-control" rows="3" placeholder="Enter any notes"></textarea></div><button type="submit" class="btn btn-primary">Add Reading</button><button type="button" id="cancel-btn" class="btn btn-danger" style="margin-left: 10px;">Cancel</button></form></div>`;
    readingsSection.innerHTML = formHTML;
    document.getElementById('reading-form').addEventListener('submit', (e) => { e.preventDefault(); handleAddNewReading(componentId); });
    document.getElementById('cancel-btn').addEventListener('click', () => renderReadings(componentId));
}
async function handleAddNewReading(componentId) {
    const testDate = document.getElementById('test-date').value;
    const inspector = document.getElementById('inspector').value;
    const readingValue = document.getElementById('reading-value').value;
    const notes = document.getElementById('notes').value;
    const { error } = await api.addReading({ component_id: componentId, test_date: testDate, inspector: inspector, reading_value: parseFloat(readingValue), notes: notes || null });
    if (!error) { alert('Reading added successfully!'); await renderReadings(componentId); }
}
async function handleDeleteReading(readingId, componentId) {
    if (!confirm('Are you sure you want to delete this reading?')) return;
    const { error } = await api.deleteReading(readingId);
    if (!error) { alert('Reading deleted successfully!'); await renderReadings(componentId); }
}
async function showEditReadingForm(readingId, componentId) {
    const { data: reading, error } = await api.fetchSingleReading(readingId);
    if (error) return;
    const readingsSection = document.getElementById('readings-section');
    readingsSection.innerHTML = `<h4>Readings</h4><div id="edit-reading-form" style="margin-bottom: 20px; padding: 15px; border: 2px solid #FF9800; border-radius: 5px; background-color: #FFF3E0;"><h5>Edit Reading</h5><form id="edit-form"><div style="margin-bottom: 10px;"><label>Test Date:</label><br><input type="date" id="edit-test-date" value="${reading.test_date}" required style="width: 200px; padding: 5px;"></div><div style="margin-bottom: 10px;"><label>Inspector:</label><br><input type="text" id="edit-inspector" value="${reading.inspector}" required style="width: 200px; padding: 5px;"></div><div style="margin-bottom: 10px;"><label>Reading Value:</label><br><input type="number" id="edit-reading-value" value="${reading.reading_value}" step="0.1" required style="width: 200px; padding: 5px;"></div><div style="margin-bottom: 10px;"><label>Notes (optional):</label><br><textarea id="edit-notes" style="width: 200px; padding: 5px; height: 60px;">${reading.notes || ''}</textarea></div><button type="submit" style="background: #4CAF50; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">Save Changes</button><button type="button" id="cancel-edit-btn" style="background: #f44336; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">Cancel</button></form></div>`;
    document.getElementById('edit-form').addEventListener('submit', (e) => { e.preventDefault(); handleUpdateReading(readingId, componentId); });
    document.getElementById('cancel-edit-btn').addEventListener('click', () => renderReadings(componentId));
}
async function handleUpdateReading(readingId, componentId) {
    const updatedData = { test_date: document.getElementById('edit-test-date').value, inspector: document.getElementById('edit-inspector').value, reading_value: parseFloat(document.getElementById('edit-reading-value').value), notes: document.getElementById('edit-notes').value || null };
    const { error } = await api.updateReading(readingId, updatedData);
    if (!error) { alert('Reading updated successfully!'); await renderReadings(componentId); }
}

// Add this new function to the end of js/ui.js

/**
 * Handles deleting a component and all its associated readings.
 * @param {number} componentId The ID of the component to delete.
 */
async function handleDeleteComponent(componentId) {
    const confirmation = `Are you sure you want to delete this component? This will also delete ALL of its readings. This action cannot be undone.`;
    if (!confirm(confirmation)) {
        return;
    }

    // 1. Delete all associated readings first
    const { error: readingsError } = await api.deleteReadingsForComponent(componentId);
    if (readingsError) {
        alert('Error deleting associated readings: ' + readingsError.message);
        return;
    }

    // 2. Delete the component itself
    const { error: componentError } = await api.deleteComponent(componentId);
    if (componentError) {
        alert('Error deleting component: ' + componentError.message);
        return;
    }

    alert('Component and all its readings deleted successfully!');
    
    // 3. Clear the main display and refresh the component list
    document.getElementById('pdf-main-content').innerHTML = '<h2>LDAR Drawing</h2><p>Select a component to view its technical drawing</p>';
    document.getElementById('details-content').innerHTML = '<p>Select a component to view details</p>';
    await refreshComponentsList();
}

// Add these two new functions to the end of js/ui.js

/**
 * Shows a pre-filled form to edit an existing component.
 * @param {number} componentId The ID of the component to edit.
 */
async function showEditComponentForm(componentId) {
    // 1. Fetch the component's current data
    const { data: component, error } = await api.fetchSingleComponent(componentId);
    if (error) {
        alert('Could not fetch component details to edit.');
        return;
    }

    // 2. Display the form in the main content area, pre-filled with data
    const mainContent = document.getElementById('pdf-main-content');
    mainContent.innerHTML = `
        <h2>Edit Component</h2>
        <div class="form-container">
            <form id="edit-component-form">
                <div class="form-group">
                    <label for="comp-drawing">Drawing:</label>
                    <input type="text" id="comp-drawing" class="form-control" required value="${component.Drawing}">
                </div>
                <div class="form-group">
                    <label for="comp-component">Component:</label>
                    <input type="text" id="comp-component" class="form-control" required value="${component.Component}">
                </div>
                <div class="form-group">
                    <label for="comp-unit">Unit:</label>
                    <input type="text" id="comp-unit" class="form-control" required value="${component.Unit}">
                </div>
                <div style="text-align: center;">
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                    <button type="button" id="cancel-edit-component" class="btn btn-danger" style="margin-left: 10px;">Cancel</button>
                </div>
            </form>
        </div>
    `;

    // 3. Add event listeners for the new form's buttons
    document.getElementById('edit-component-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleUpdateComponent(componentId);
    });

    document.getElementById('cancel-edit-component').addEventListener('click', () => {
        mainContent.innerHTML = '<h2>LDAR Drawing</h2><p>Select a component to view its technical drawing</p>';
    });
}

/**
 * Handles saving the updated component data.
 * @param {number} componentId The ID of the component being edited.
 */
async function handleUpdateComponent(componentId) {
    // 1. Get the updated data from the form
    const componentData = {
        Drawing: document.getElementById('comp-drawing').value,
        Component: document.getElementById('comp-component').value,
        Unit: document.getElementById('comp-unit').value
    };

    // 2. Call the API layer to save the changes
    const { error } = await api.updateComponent(componentId, componentData);

    // 3. If successful, clear the form and refresh the list
    if (error) {
        alert('Error updating component: ' + error.message);
    } else {
        alert('Component updated successfully!');
        document.getElementById('pdf-main-content').innerHTML = '<h2>LDAR Drawing</h2><p>Select a component to view its technical drawing</p>';
        await refreshComponentsList();
    }
}

// Add this new function to the end of js/ui.js

/**
 * Handles the CSV import process for readings.
 * @param {number} componentId The ID of the component to associate the new readings with.
 */


// Add this new function to the end of js/ui.js
import { processAndImportReadings } from './api.js';

/**
 * Handles the new global CSV import process for readings.
 */
export function handleGlobalCsvImport() {
    // 1. Create a hidden file input element.
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';

    // 2. Listen for when the user selects a file.
    fileInput.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;

        // 3. Use Papa Parse to read the file.
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async function(results) {
                if (!results.data || results.data.length === 0) {
                    alert('CSV file is empty or could not be read.');
                    return;
                }

                // 4. Send the data to our powerful API function.
                const { successCount, errorCount, errors } = await processAndImportReadings(results.data);

                // 5. Report the results to the user.
                let message = `${successCount} readings were imported successfully.`;
                if (errorCount > 0) {
                    message += `\n\n${errorCount} readings failed because the following components could not be found:\n- ${errors.join('\n- ')}`;
                }
                alert(message);

                // 6. Refresh the main component list to reflect any potential new readings.
                await refreshComponentsList();
            },
            error: function(err) {
                alert("An error occurred while parsing the CSV: " + err.message);
            }
        });
    };

    // 7. Programmatically click the hidden input to open the file dialog.
    fileInput.click();
}