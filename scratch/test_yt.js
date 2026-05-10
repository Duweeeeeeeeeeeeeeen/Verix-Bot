import axios from 'axios';
import Parser from 'rss-parser';

const rssParser = new Parser();

async function resolveYouTubeHandle(handle) {
    try {
        const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
        const url = `https://www.youtube.com/${cleanHandle}`;
        
        console.log(`Checking URL: ${url}`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // Regex to find "channelId":"UC..."
        const match = response.data.match(/\"channelId\":\"(UC[a-zA-Z0-9_-]+)\"/);
        if (match && match[1]) {
            console.log(`Resolved ${handle} to ${match[1]}`);
            return match[1];
        }
        
        // Alternative regex
        const altMatch = response.data.match(/\"externalId\":\"(UC[a-zA-Z0-9_-]+)\"/);
        if (altMatch && altMatch[1]) {
            console.log(`Resolved ${handle} to ${altMatch[1]} (via externalId)`);
            return altMatch[1];
        }

        console.log('No match found in response body');
        return null;
    } catch (error) {
        console.error(`Failed to resolve handle ${handle}: ${error.message}`);
        return null;
    }
}

async function testYouTubeFeed(handle) {
    const channelId = await resolveYouTubeHandle(handle);
    if (!channelId) return;

    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    console.log(`Fetching feed: ${feedUrl}`);

    try {
        const feed = await rssParser.parseURL(feedUrl);
        if (feed && feed.items && feed.items.length > 0) {
            const latestVideo = feed.items[0];
            console.log(`Latest Video: ${latestVideo.title}`);
            console.log(`Latest Video ID: ${latestVideo.id}`);
            
            const thumbnail = `https://i.ytimg.com/vi/${latestVideo.id.replace('yt:video:', '')}/maxresdefault.jpg`;
            console.log(`Thumbnail URL: ${thumbnail}`);
        } else {
            console.log('No videos found in feed');
        }
    } catch (err) {
        console.error(`Feed Error: ${err.message}`);
    }
}

testYouTubeFeed('@gpkingdom');
