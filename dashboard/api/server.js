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

// ─── Critical startup guard ─────────────────────────────────────────────────
if (!process.env.SESSION_SECRET) {
    console.error('FATAL: SESSION_SECRET environment variable is not defined. Refusing to start.');
    process.exit(1);
}

const app = express();
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
    process.nextTick(() => done(null, profile));
}));

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.DASHBOARD_FRONTEND_URL,
    credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
        maxAge: 60000 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction  // true only over HTTPS in production
    }
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

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/messages', messageRoutes);

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

