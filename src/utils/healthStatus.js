import { execSync } from 'child_process';
import mongoose from 'mongoose';

const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
};

let cachedCommit = null;

const getCommit = () => {
    if (cachedCommit !== null) return cachedCommit;

    try {
        cachedCommit = execSync('git rev-parse --short HEAD', {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore']
        }).trim();
    } catch {
        cachedCommit = 'unknown';
    }

    return cachedCommit;
};

export const buildHealthStatus = (client = null) => {
    const dbState = mongoose.connection.readyState;
    const discordReady = Boolean(client?.isReady?.());
    const status = dbState === 1 && (!client || discordReady) ? 'ok' : 'degraded';

    return {
        status,
        service: 'verix',
        environment: process.env.NODE_ENV || 'development',
        uptime: Math.floor(process.uptime()),
        commit: getCommit(),
        timestamp: new Date().toISOString(),
        database: {
            status: dbStateMap[dbState] || 'unknown',
            host: mongoose.connection.host || null,
            name: mongoose.connection.name || null
        },
        discord: client ? {
            ready: discordReady,
            user: client.user?.tag || null,
            id: client.user?.id || null,
            guilds: client.guilds?.cache?.size || 0,
            wsPing: client.ws?.ping ?? null
        } : null,
        process: {
            pid: process.pid,
            node: process.version,
            memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024)
        }
    };
};

export default buildHealthStatus;
