const API_BASE_URL = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' ? 'http://localhost:5001/api' : '/api')
  : 'http://localhost:5001/api';

const CACHE_TTL = 45 * 1000;
const _cache = new Map();
const _inFlight = new Map();

export class ApiError extends Error {
  constructor(message, { status, code, data } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export function isAuthError(error) {
  return error?.code === 'UNAUTHORIZED' || error?.status === 401 || error?.message === 'Unauthorized';
}

function _methodOf(options) {
  return String(options.method || 'GET').toUpperCase();
}

function _isCacheable(endpoint, options) {
  if (typeof window === 'undefined' || _methodOf(options) !== 'GET') return false;
  return /\/config\/[^/]+\/(discord-data|guild|global|module-status)$/.test(endpoint);
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
                detail: { message: 'Session expired. Please reconnect.', type: 'error' } 
            }));
        }
        throw new ApiError('Unauthorized', { status: 401, code: 'UNAUTHORIZED' });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const body = await response.text();
      throw new ApiError('Invalid API response', {
        status: response.status,
        code: 'INVALID_API_RESPONSE',
        data: { preview: body.slice(0, 160) }
      });
    }

    const result = await response.json();

    // Standardized check for success: false or HTTP error status
    if (!response.ok || result.success === false) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: result.error || 'An API error occurred.', type: 'error' } 
        }));
      }
      throw new ApiError(result.error || `HTTP ${response.status}`, {
        status: response.status,
        code: result.code,
        data: result
      });
    }

    // Return the data object directly if it follows the success: true, data: ... pattern.
    // If 'data' is missing but success is true, return the whole result.
    const data = (result.success && result.data !== undefined) ? result.data : result;
    if (method !== 'GET' && typeof window !== 'undefined') {
      const guildId = _guildFromEndpoint(endpoint);
      if (guildId) {
        window.dispatchEvent(new CustomEvent('refresh-module-status', { detail: { guildId } }));
      }
    }
    if (cacheKey) {
      _cache.set(cacheKey, { data: _cloneData(data), timestamp: Date.now() });
    }
    return data;

    } catch (error) {
    if (!isAuthError(error) && (error.message === 'Failed to fetch' || error.name === 'TypeError')) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: 'Could not connect to the server.', type: 'error' } 
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
    request: apiRequest,
    isAuthError
};
