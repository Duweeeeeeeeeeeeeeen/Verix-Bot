const API_BASE_URL = typeof window !== 'undefined' 
  ? '/api' 
  : 'http://localhost:5001/api';

/**
 * Standardized request helper for fetch calls.
 * @param {string} endpoint - The API endpoint (starts with /).
 * @param {object} options - Fetch options.
 * @returns {Promise<any>} - The data from the API.
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (options.data && !defaultOptions.body) {
    defaultOptions.body = JSON.stringify(options.data);
  }

  try {
    const response = await fetch(url, defaultOptions);
    
    // Check if redirect or error without body
    if (!response.ok && response.status === 401) {
        window.dispatchEvent(new CustomEvent('show-toast', { 
            detail: { message: 'Sessione scaduta. Riconnettiti.', type: 'error' } 
        }));
        throw new Error('Unauthorized');
    }

    const result = await response.json();

    // Standardized check for success: false
    if (result.success === false) {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: result.error || 'Si è verificato un errore API.', type: 'error' } 
      }));
      throw new Error(result.error);
    }

    // Return the data object directly if it follows the success: true, data: ... pattern
    return result.success ? result.data : result;
    
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Errore di connessione al server.', type: 'error' } 
      }));
    }
    throw error;
  }
}

export default {
    request: apiRequest
};
