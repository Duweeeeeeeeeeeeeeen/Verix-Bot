import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = "mongodb+srv://admin:SessoDB00!@cluster0.pqntoni.mongodb.net/?appName=Cluster0";
const USER_ID = "361159834688552960";

async function check() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const backgrounds = await mongoose.connection.db.collection('backgrounds').find({ userId: USER_ID }).toArray();
    console.log('Backgrounds found:', backgrounds.length);
    backgrounds.forEach(bg => {
        console.log(`- ID: ${bg._id}, Guild: ${bg.guildId}, Status: ${bg.status}`);
    });

    const whitelist = await mongoose.connection.db.collection('whitelistapps').find({ userId: USER_ID }).toArray();
    console.log('Whitelist found:', whitelist.length);
    whitelist.forEach(wl => {
        console.log(`- ID: ${wl._id}, Guild: ${wl.guildId}, Status: ${wl.status}`);
    });

    process.exit(0);
}

check();
