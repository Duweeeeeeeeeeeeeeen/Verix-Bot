import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import logger from '../utils/logger.js';
import multiBotManager from './multiBotManager.js';
import buildHealthStatus from '../utils/healthStatus.js';

// Import Routes (Keeping existing paths for now)
import authRoutes from '../../dashboard/api/routes/auth.js';
import configRoutes from '../../dashboard/api/routes/config.js';
import embedsRoutes from '../../dashboard/api/routes/embeds.js';
import webhooksRoutes from '../../dashboard/api/routes/webhooks.js';
import messageRoutes from '../../dashboard/api/routes/messages.js';
import managementRoutes from '../../dashboard/api/routes/management.js';
import systemRoutes from '../../dashboard/api/routes/system.js';
import privateBotRoutes from '../../dashboard/api/routes/privateBot.js';
import adminRoutes from '../../dashboard/api/routes/admin.js';
import analyticsRoutes from '../../dashboard/api/routes/analytics.js';

/**
 * Initializes and starts the Web Dashboard API hosted by the Bot process.
 * @param {import('discord.js').Client} client The Discord Bot client instance.
 */
export function startDashboard(client) {
    const app = express();
    app.set('trust proxy', 1);
    const PORT = process.env.DASHBOARD_API_PORT || process.env.PORT || 5001;

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



    // 2. Body Parsers & JSON Error Handling
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    app.use((err, req, res, next) => {
        if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
            console.error('[JSON_ERROR] Malformed JSON in request:', err.message);
            return res.status(400).json({ error: 'Malformed JSON payload' });
        }
        next();
    });

    // 3. Security & CORS
    const allowedOrigins = [
        process.env.DASHBOARD_FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:3001'
    ].filter(Boolean);

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
    
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
        logger.error('[Dashboard] SESSION_SECRET is not set — using insecure fallback. Please set this in .env immediately!');
    }
    const isProduction = process.env.NODE_ENV === 'production';

    // 4. Auth & Session
    app.use(session({
        name: 'verix.sid',
        secret: secret || 'verix-insecure-fallback-key',
        resave: false,
        saveUninitialized: false,
        proxy: true,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI || process.env.MONGO_URI,
            mongoOptions: { 
                serverSelectionTimeoutMS: 5000,
                family: 4 // Force IPv4
            }
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
            secure: false, // Set to false since the VPS uses HTTP (not HTTPS)
            httpOnly: true,
            sameSite: 'lax',
            path: '/'
        }
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    // 5. Rate Limiting
    const apiLimiter = rateLimit({
        windowMs: 60 * 1000,
        max: 120,
        standardHeaders: true,
        legacyHeaders: false,
        message: { success: false, error: 'Troppe richieste. Riprova tra un minuto.' }
    });
    app.use('/api/config', apiLimiter);
    app.use('/api/messages', apiLimiter);

    // 6. Static Files (Internal Image Hosting)
    app.use('/api/uploads', express.static(path.join(process.cwd(), 'uploads')));

    // 7. Request context — attach Discord client
    app.use((req, res, next) => {
        req.discordClient = client;
        req.mainClient = client;
        next();
    });

    // 5. Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/config', configRoutes);
    app.use('/api/embeds', embedsRoutes);
    app.use('/api/messages', messageRoutes);
    app.use('/api/management', managementRoutes);
    app.use('/api/webhooks', webhooksRoutes);
    app.use('/api/system', systemRoutes);
    app.use('/api/private-bot', privateBotRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/analytics', analyticsRoutes);

    app.get('/api/health', (req, res) => {
        res.json(buildHealthStatus(client));
    });
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            error: 'Endpoint non trovato'
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
