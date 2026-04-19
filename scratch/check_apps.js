import mongoose from 'mongoose';
import WhitelistApp from '../src/models/WhitelistApp.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkApps() {
    await mongoose.connect(process.env.MONGODB_URI);
    const apps = await WhitelistApp.find({ status: 'PENDING' });
    console.log(`Found ${apps.length} pending apps`);
    apps.forEach(app => {
        console.log(`App for User ${app.userId}: Status ${app.status}, Index ${app.currentQuestionIndex}`);
        console.log(`- StartTime: ${app.startTime} (Type: ${typeof app.startTime})`);
        console.log(`- Questions: ${app.sessionQuestions.length}`);
        if (app.sessionQuestions.length > 0) {
            console.log(`- Question 0: "${app.sessionQuestions[0].text}" (min: ${app.sessionQuestions[0].minLength})`);
            if (app.sessionQuestions.length > 1) {
                console.log(`- Question 1: "${app.sessionQuestions[1].text}" (min: ${app.sessionQuestions[1].minLength})`);
            }
        }
    });
    await mongoose.disconnect();
}

checkApps();
