import mongoose from 'mongoose';

const uri = 'mongodb+srv://admin:SessoDB00!@cluster0.pqntoni.mongodb.net/?appName=Cluster0';

console.log('Attempting connection to MongoDB Atlas...');

mongoose.connect(uri, {
    family: 4, // Force IPv4
    serverSelectionTimeoutMS: 5000
}).then(() => {
    console.log('SUCCESS: Connected to MongoDB via IPv4!');
    process.exit(0);
}).catch(err => {
    console.error('FAILURE: Could not connect to MongoDB.');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    if (err.message.includes('SSL') || err.message.includes('handshake')) {
        console.log('\nTIP: This looks like an SSL/Whitelist issue. Even if IPv4 is whitelisted, the VPS might be trying to connect via IPv6.');
    }
    process.exit(1);
});
