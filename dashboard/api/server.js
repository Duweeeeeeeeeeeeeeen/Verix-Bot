import './env.js';
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import configRoutes from './routes/config.js';
import messageRoutes from './routes/messages.js';

const app = express();
const PORT = process.env.DASHBOARD_API_PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Dashboard API connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Passport Setup
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DASHBOARD_CALLBACK_URL,
    scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile));
}));

// Middleware
app.use(cors({
    origin: process.env.DASHBOARD_FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'dashboard-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { maxAge: 60000 * 60 * 24 * 7 } // 7 days
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => res.json({ success: true, message: 'Dashboard API is running...' }));

// Catch-all for undefined routes
app.use((req, res, next) => {
    res.status(404).json({ success: false, error: 'Endpoint non trovato' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
            ? 'Si è verificato un errore interno al server.' 
            : err.message
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Dashboard API listening on port ${PORT}`);
});
