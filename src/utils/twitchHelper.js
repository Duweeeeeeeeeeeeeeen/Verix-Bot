import axios from 'axios';
import logger from './logger.js';

let accessToken = null;
let tokenExpires = 0;

/**
 * Fetches the Twitch App Access Token using Client ID and Secret.
 */
async function getAccessToken() {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret || clientId.includes('your_') || clientSecret.includes('your_')) {
        logger.error('[Twitch] Missing or placeholder TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET in .env');
        return null;
    }

    // Return cached token if still valid
    if (accessToken && Date.now() < tokenExpires) {
        return accessToken;
    }

    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials'
            }
        });

        accessToken = response.data.access_token;
        // Set expiry slightly earlier than reported (usually 2 months, but better be safe)
        tokenExpires = Date.now() + (response.data.expires_in - 60) * 1000;
        
        logger.info('[Twitch] Successfully refreshed App Access Token.');
        return accessToken;
    } catch (error) {
        logger.error('[Twitch] Error fetching access token:', error.response?.data || error.message);
        return null;
    }
}

/**
 * Fetches stream data for multiple usernames.
 * @param {string[]} usernames List of Twitch usernames.
 */
export async function getStreams(usernames) {
    if (!usernames.length) return [];
    
    const token = await getAccessToken();
    if (!token) return [];

    try {
        const streamRes = await axios.get('https://api.twitch.tv/helix/streams', {
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${token}`
            },
            params: {
                user_login: usernames
            }
        });

        if (!streamRes.data || !streamRes.data.data) {
            logger.error('[TwitchHelper] Unexpected API response structure:', streamRes.data);
            return [];
        }

        return streamRes.data.data;
    } catch (error) {
        logger.error('[TwitchHelper] Error fetching streams:', error.response?.data || error.message);
        return [];
    }
}

/**
 * Gets the static URL for a stream thumbnail with timestamp to bypass Discord cache.
 */
export function getThumbnailUrl(username) {
    return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${username.toLowerCase()}-1280x720.jpg?t=${Date.now()}`;
}
