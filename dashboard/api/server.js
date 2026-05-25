import './env.js';
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import configRoutes from './routes/config.js';
import messageRoutes from './routes/messages.js';
import analyticsRoutes from './routes/analytics.js';
import privateBotRoutes from './routes/privateBot.js';
import adminRoutes from './routes/admin.js';
import collaboratorsRoutes from './routes/collaborators.js';
import locksRoutes from './routes/locks.js';
import { stripeCheckoutRouter, stripeWebhookRouter } from './routes/stripe.js';
import { ONE_WEEK_MS, buildSessionCookieOptions } from './utils/sessionConfig.js';

// ─── Critical startup guard ─────────────────────────────────────────────────
if (!process.env.SESSION_SECRET) {
    console.error('FATAL: SESSION_SECRET environment variable is not defined. Refusing to start.');
    process.exit(1);
}

const app = express();
app.set('trust proxy', 1); // Trust the proxy (Nginx/VPS) to allow session cookies
const PORT = process.env.DASHBOARD_API_PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

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
    profile.accessToken = accessToken; // Save for guild refreshes
    process.nextTick(() => done(null, profile));
}));

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.DASHBOARD_FRONTEND_URL,
    credentials: true
}));
app.use('/api/stripe', stripeWebhookRouter);
app.use(express.json({ limit: '2mb' }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    proxy: true,
    rolling: true,
    cookie: buildSessionCookieOptions({ maxAge: ONE_WEEK_MS })
}));
app.use(passport.initialize());
app.use(passport.session());

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,    // 1 minute window
    max: 120,               // max 120 requests/min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Troppe richieste. Riprova tra un minuto.' }
});
app.use('/api/config', apiLimiter);
app.use('/api/messages', apiLimiter);

// Strict limiter for destructive operations (reset, delete, manual clear)
const strictLimiter = rateLimit({
    windowMs: 60 * 1000,    // 1 minute window
    max: 10,                // max 10 destructive actions/min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Troppe operazioni distruttive. Attendi un minuto.' }
});
// Apply to all POST routes under /management and all DELETE routes under /config
app.use('/api/management', strictLimiter);
app.use((req, res, next) => {
    if (req.method === 'DELETE') return strictLimiter(req, res, next);
    next();
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/private-bot', privateBotRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/collaborators', collaboratorsRoutes);
app.use('/api/locks', locksRoutes);
app.use('/api/stripe', stripeCheckoutRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.json({
        status: dbState === 1 ? 'ok' : 'degraded',
        uptime: Math.floor(process.uptime()),
        db: stateMap[dbState] || 'unknown',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => res.json({ success: true, message: 'Dashboard API is running...' }));

// ─── Error Handlers ───────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint non trovato' });
});

app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        error: isProduction ? 'Si è verificato un errore interno al server.' : err.message
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Dashboard API listening on port ${PORT}`);
});

