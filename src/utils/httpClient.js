import axios from 'axios';

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_RETRIES = 2;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryable(error) {
    const status = error.response?.status;
    if (!status) return true;
    return status === 408 || status === 429 || status >= 500;
}

export async function axiosWithRetry(config, options = {}) {
    const retries = options.retries ?? DEFAULT_RETRIES;
    const baseDelayMs = options.baseDelayMs ?? 350;
    const timeout = config.timeout ?? options.timeout ?? DEFAULT_TIMEOUT_MS;
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await axios({ ...config, timeout });
        } catch (error) {
            lastError = error;
            if (attempt >= retries || !isRetryable(error)) {
                throw error;
            }
            await sleep(baseDelayMs * 2 ** attempt);
        }
    }

    throw lastError;
}
