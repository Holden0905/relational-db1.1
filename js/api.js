// js/api.js

// --- INITIALIZATION ---
// These are your credentials from your original script.js file
const SUPABASE_URL = 'https://xonkcxtziopnrmtmbccl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvbmtjeHR6aW9wbnJtdG1iY2NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNDQyNTIsImV4cCI6MjA2OTgyMDI1Mn0.aV0o2ufPTzAn9hCxEJq1rGrB1EauRqfZYhbrGHt2JCM';

// We create the Supabase client here.
// The "export" keyword makes it available to our other files.
export const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Fetches the list of all components from the database.
 * This function ONLY gets data; it does not touch the HTML.
 */
export async function fetchComponents() {
    // This is the data-fetching part from your original loadComponents function
    const { data, error } = await client.from('Component Table').select('*');
    
    if (error) {
        console.error('Error loading components:', error);
        return []; // Return an empty array if there's an error
    }

    return data; // Return the fetched component data
}

/**
 * Fetches all readings for a specific component ID.
 */
export async function fetchReadingsForComponent(componentId) {
    const { data, error } = await client
        .from('Readings')
        .select('*')
        .eq('component_id', componentId)
        .order('test_date', { ascending: false });

    if (error) {
        console.error('Error loading readings:', error);
        return [];
    }
    
    return data;
}

/**
 * Inserts a new reading record into the database.
 * @param {object} readingData - An object with the new reading's info.
 */
export async function addReading(readingData) {
    const { error } = await client.from('Readings').insert([readingData]);

    if (error) {
        console.error('Error adding reading:', error);
        alert('Error adding reading: ' + error.message);
    }

    return { error };
}

/**
 * Deletes a reading from the database by its ID.
 * @param {number} readingId The ID of the reading to delete.
 */
export async function deleteReading(readingId) {
    const { error } = await client
        .from('Readings')
        .delete()
        .eq('id', readingId);

    if (error) {
        console.error('Error deleting reading:', error);
        alert('Error deleting reading: ' + error.message);
    }

    return { error };
}
// Add these two new functions to the end of js/api.js

/**
 * Fetches a single reading record by its ID.
 * @param {number} readingId The ID of the reading to fetch.
 */
export async function fetchSingleReading(readingId) {
    const { data, error } = await client
        .from('Readings')
        .select('*')
        .eq('id', readingId)
        .single(); // .single() gets one record instead of an array

    if (error) {
        console.error('Error fetching reading:', error);
    }
    
    return { data, error };
}

/**
 * Updates an existing reading in the database.
 * @param {number} readingId The ID of the reading to update.
 * @param {object} updatedData An object with the new data.
 */
export async function updateReading(readingId, updatedData) {
    const { error } = await client
        .from('Readings')
        .update(updatedData)
        .eq('id', readingId);

    if (error) {
        console.error('Error updating reading:', error);
        alert('Error updating reading: ' + error.message);
    }

    return { error };
}


/**
 * Uploads a file to Supabase Storage.
 * @param {string} fileName The unique name for the file in storage.
 * @param {File} file The file object to upload.
 */
export async function uploadPdfFile(fileName, file) {
    return await client.storage
        .from('pdfs')
        .upload(fileName, file);
}

/**
 * Gets the public URL for a file from Supabase Storage.
 * @param {string} fileName The name of the file in storage.
 */
export function getPdfPublicUrl(fileName) {
    return client.storage
        .from('pdfs')
        .getPublicUrl(fileName);
}

/**
 * Updates a component's record with the new PDF URL.
 * @param {number} componentId The ID of the component to update.
 * @param {string} pdfUrl The new public URL of the PDF.
 */
export async function updateComponentPdfUrl(componentId, pdfUrl) {
    return await client
        .from('Component Table')
        .update({ drawing_pdf_url: pdfUrl })
        .eq('id', componentId);
}

// Add this new function to js/api.js

/**
 * Fetches the data for a single component by its ID.
 */
export async function fetchSingleComponent(componentId) {
    return await client
        .from('Component Table')
        .select('*')
        .eq('id', componentId)
        .single();
}
// Add this new function to the end of js/api.js

/**
 * Inserts a new component record into the database.
 * @param {object} componentData - An object with the new component's info.
 */
export async function addComponent(componentData) {
    const { data, error } = await client
        .from('Component Table')
        .insert([componentData])
        .select(); // .select() returns the newly created data

    if (error) {
        console.error('Error adding component:', error);
        alert('Error adding component: ' + error.message);
    }
    
    return { data, error };
}

// Add these two new functions to the end of js/api.js

/**
 * Deletes all readings associated with a specific component ID.
 * @param {number} componentId The ID of the component whose readings will be deleted.
 */
export async function deleteReadingsForComponent(componentId) {
    return await client
        .from('Readings')
        .delete()
        .eq('component_id', componentId);
}

/**
 * Deletes a single component by its ID.
 * @param {number} componentId The ID of the component to delete.
 */
export async function deleteComponent(componentId) {
    return await client
        .from('Component Table')
        .delete()
        .eq('id', componentId);
}

// Add this new function to the end of js/api.js

/**
 * Updates an existing component record by its ID.
 * @param {number} componentId The ID of the component to update.
 * @param {object} componentData An object with the new data for the component.
 */
export async function updateComponent(componentId, componentData) {
    return await client
        .from('Component Table')
        .update(componentData)
        .eq('id', componentId);
}

// Add this new function to the end of js/api.js

/**
 * Inserts an array of new readings into the database in a single operation.
 * @param {Array<object>} readingsArray - An array of reading objects to insert.
 */
export async function addBulkReadings(readingsArray) {
    return await client
        .from('Readings')
        .insert(readingsArray);
}