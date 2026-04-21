import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function testTwitch() {
    console.log('Testing Twitch Credentials...');
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    console.log(`Client ID: ${clientId}`);
    console.log(`Client Secret: ${clientSecret ? '*****' : 'MISSING'}`);

    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials'
            }
        });
        console.log('✅ Token obtained successfully!');
        console.log('Token expires in:', response.data.expires_in);
    } catch (error) {
        console.log('❌ Error fetching token:');
        console.log(error.response?.data || error.message);
    }
}

testTwitch();
