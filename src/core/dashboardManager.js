import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import cors from 'cors';
import logger from '../utils/logger.js';

// Import Routes (Keeping existing paths for now)
import authRoutes from '../../dashboard/api/routes/auth.js';
import configRoutes from '../../dashboard/api/routes/config.js';
import embedsRoutes from '../../dashboard/api/routes/embeds.js';
import messageRoutes from '../../dashboard/api/routes/messages.js';

/**
 * Initializes and starts the Web Dashboard API hosted by the Bot process.
 * @param {import('discord.js').Client} client The Discord Bot client instance.
 */
export function startDashboard(client) {
    const app = express();
    const PORT = process.env.DASHBOARD_API_PORT || 5000;

    // 1. Passport Setup with client context
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));

    const discClientId = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID;
    const discClientSecret = process.env.DISCORD_CLIENT_SECRET;

    if (!discClientId || !discClientSecret) {
        logger.warn('[Dashboard] Missing DISCORD_CLIENT_ID (or CLIENT_ID) or DISCORD_CLIENT_SECRET in .env. Login features will be unstable.');
    }

    passport.use(new DiscordStrategy({
        clientID: discClientId || 'missing',
        clientSecret: discClientSecret || 'missing',
        callbackURL: process.env.DASHBOARD_CALLBACK_URL || `${process.env.API_URL}/api/auth/callback`,
        scope: ['identify', 'guilds']
    }, (accessToken, refreshToken, profile, done) => {
        process.nextTick(() => done(null, profile));
    }));

    // 1. Diagnostics (MOVED TO TOP)
    app.use((req, res, next) => {
        console.log(`[DEBUG_API] ${req.method} ${req.url} | SessionID: ${req.sessionID?.substring(0, 8)}... | Auth: ${req.isAuthenticated ? req.isAuthenticated() : 'N/A'}`);
        req.discordClient = client;
        next();
    });

    // 2. Body Parsers & JSON Error Handling
    app.use(express.json());
    app.use((err, req, res, next) => {
        if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
            console.error('[JSON_ERROR] Malformed JSON in request:', err.message);
            return res.status(400).json({ error: 'Malformed JSON payload' });
        }
        next();
    });

    // 3. Security & CORS
    const allowedOrigins = [
        process.env.DASHBOARD_FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3000',
        'http://localhost:3001'
    ];

    app.use(cors({ 
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }, 
        credentials: true 
    }));
    
    // 4. Auth & Session (Harden for Local Dev)
    app.use(session({
        name: 'verix.sid',
        secret: process.env.SESSION_SECRET || 'verix-secret-key-development',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ 
            mongoUrl: process.env.MONGODB_URI || process.env.MONGO_URI,
            mongoOptions: {
                serverSelectionTimeoutMS: 5000
            }
        }),
        cookie: { 
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
            secure: false, // Set to true if using HTTPS
            httpOnly: true,
            sameSite: 'lax' // Essential for local dev cross-port
        }
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    // 5. Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/config', configRoutes);
    app.use('/api/embeds', embedsRoutes);
    app.use('/api/messages', messageRoutes);

    app.get('/api/health', (req, res) => {
        res.json({
            status: 'online',
            bot: client.user.tag,
            time: new Date().toISOString()
        });
    });

    // 5. Catch-all 404 Debug (MUST BE LAST)
    app.use((req, res) => {
        console.log(`[404_NOT_FOUND] ${req.method} ${req.url}`);
        res.status(404).json({ 
            error: 'Route not found in Integrated API',
            requestedUrl: req.url,
            method: req.method
        });
    });

    // 6. Global Error Handler
    app.use((err, req, res, next) => {
        logger.error('[Dashboard_API] Unhandled Error:', err);
        res.status(err.status || 500).json({
            success: false,
            error: process.env.NODE_ENV === 'production' 
                ? 'Internal Server Error' 
                : err.message
        });
    });

    // 5. Start Listening
    app.listen(PORT, () => {
        logger.info(`[Dashboard] API linked with Bot and listening on localhost:${PORT}`);
    });

    return app;
}
