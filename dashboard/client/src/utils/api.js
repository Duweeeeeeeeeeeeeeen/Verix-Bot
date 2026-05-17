const API_BASE_URL = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' ? 'http://localhost:5001/api' : '/api')
  : 'http://localhost:5001/api';

const CACHE_TTL = 45 * 1000;
const _cache = new Map();
const _inFlight = new Map();

function _methodOf(options) {
  return String(options.method || 'GET').toUpperCase();
}

function _isCacheable(endpoint, options) {
  if (typeof window === 'undefined' || _methodOf(options) !== 'GET') return false;
  return /\/config\/[^/]+\/(discord-data|guild|global)$/.test(endpoint);
}

function _guildFromEndpoint(endpoint) {
  return endpoint.match(/\/config\/([^/]+)\//)?.[1];
}

function _invalidateGuildCache(endpoint) {
  const guildId = _guildFromEndpoint(endpoint);
  if (!guildId) return;
  for (const key of _cache.keys()) {
    if (key.includes(`/config/${guildId}/`)) _cache.delete(key);
  }
}

function _cloneData(data) {
  if (data == null) return data;
  if (typeof structuredClone === 'function') return structuredClone(data);
  return JSON.parse(JSON.stringify(data));
}

// Counter-based loader: prevents the loader from flickering when multiple
// parallel requests are fired simultaneously (e.g., via Promise.all)
let _activeRequests = 0;
function _setActivity(active) {
  if (typeof window === 'undefined') return;
  if (active) _activeRequests++;
  else _activeRequests = Math.max(0, _activeRequests - 1);
  window.dispatchEvent(new CustomEvent('set-activity', { detail: _activeRequests > 0 }));
}

/**
 * Standardized request helper for fetch calls.
 * @param {string} endpoint - The API endpoint (starts with /).
 * @param {object} options - Fetch options.
 * @returns {Promise<any>} - The data from the API.
 */
export async function apiRequest(endpoint, options = {}) {
  // Prevent requests with 'undefined' in the path (usually due to uninitialized router)
  if (endpoint.includes('/undefined/')) {
    console.warn(`[API] Blocked request to ${endpoint} due to undefined parameter.`);
    return null;
  }
  const method = _methodOf(options);
  const cacheable = _isCacheable(endpoint, options);
  const cacheKey = cacheable ? `${method}:${endpoint}` : null;
  const cached = cacheKey ? _cache.get(cacheKey) : null;

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return _cloneData(cached.data);
  }

  if (cacheKey && _inFlight.has(cacheKey)) {
    return _cloneData(await _inFlight.get(cacheKey));
  }

  if (method !== 'GET') {
    _invalidateGuildCache(endpoint);
  }

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

  const requestPromise = (async () => {
    _setActivity(true);
    try {
    const response = await fetch(url, defaultOptions);
    
    // Check if redirect or error without body
    if (!response.ok && response.status === 401) {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('show-toast', { 
                detail: { message: 'Sessione scaduta. Riconnettiti.', type: 'error' } 
            }));
        }
        throw new Error('Unauthorized');
    }

    const result = await response.json();

    // Standardized check for success: false or HTTP error status
    if (!response.ok || result.success === false) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: result.error || 'Si è verificato un errore API.', type: 'error' } 
        }));
      }
      throw new Error(result.error || `HTTP ${response.status}`);
    }

    // Return the data object directly if it follows the success: true, data: ... pattern.
    // If 'data' is missing but success is true, return the whole result.
    const data = (result.success && result.data !== undefined) ? result.data : result;
    if (cacheKey) {
      _cache.set(cacheKey, { data: _cloneData(data), timestamp: Date.now() });
    }
    return data;

    } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: 'Errore di connessione al server.', type: 'error' } 
        }));
      }
    }
    throw error;
    } finally {
    // Always decrement — even on error — so the loader never stays stuck
      _setActivity(false);
      if (cacheKey) _inFlight.delete(cacheKey);
    }
  })();

  if (cacheKey) {
    _inFlight.set(cacheKey, requestPromise);
  }

  return _cloneData(await requestPromise);
}

export default {
    request: apiRequest
};
