const mongoose = require('mongoose');

const uri = 'mongodb+srv://admin:SessoDB00!@cluster0.pqntoni.mongodb.net/?appName=Cluster0';

console.log('Attempting connection to MongoDB Atlas (Forced IPv4)...');

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
    process.exit(1);
});
