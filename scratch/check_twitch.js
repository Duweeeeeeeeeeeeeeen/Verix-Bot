import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function testTwitch() {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;
    const username = 'shroud'; // A known streamer likely to be live or at least valid

    console.log('Testing Twitch API with Client ID:', clientId);

    try {
        const tokenRes = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials'
            }
        });

        const token = tokenRes.data.access_token;
        console.log('Token fetched successfully.');

        const streamRes = await axios.get('https://api.twitch.tv/helix/streams', {
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${token}`
            },
            params: {
                user_login: username
            }
        });

        console.log('Streams data:', JSON.stringify(streamRes.data, null, 2));
    } catch (err) {
        console.error('Twitch API Test FAILED:');
        console.error(err.response?.data || err.message);
    }
}

testTwitch();
