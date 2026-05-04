import mongoose from 'mongoose';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import fetch from 'node-fetch';
import FiveMConfig from '../../models/FiveMConfig.js';
import logger from '../../utils/logger.js';
import { t } from '../../utils/translator.js';
import GlobalConfig from '../../models/GlobalConfig.js';
import { buildEmbed, replacePlaceholders } from '../../utils/embedHelper.js';
import messageService from '../../utils/messageService.js';

export class FiveMManager {
    constructor(client) {
        this.client = client;
        // Tracking changes locally: guildId_serverId -> 'ONLINE' | 'OFFLINE'
        this.statusCache = new Map();
        this.debounceCache = new Map(); // guildId_serverId -> { status, count }
        this.interval = null;
    }

    init() {
        logger.info('[FiveM] Multi-Server Status monitoring module initialized.');
        // Controlla ogni 60 secondi
        this.interval = setInterval(() => this.checkServers(), 60000);
        this.checkServers();
    }

    async checkServers() {
        if (mongoose.connection.readyState !== 1) return;
        try {
            // Find configurazioni che hanno ALMENO un server impostato
            const configs = await FiveMConfig.find({ enabled: true, "servers.0": { "$exists": true } });

            for (const config of configs) {
                const guild = this.client.guilds.cache.get(config.guildId);
                if (!guild) continue;

                let configUpdatedInDb = false;

                for (let i = 0; i < config.servers.length; i++) {
                    const serverConfig = config.servers[i];
                    if (!serverConfig.enabled || !serverConfig.serverIp || !serverConfig.statusChannelId) continue;

                    const cacheKey = `${config.guildId}_${serverConfig.id}`;
                    
                    const data = await this.fetchServerData(serverConfig.serverIp);
                    const isOnline = data.online;
                    const currentStatus = isOnline ? 'ONLINE' : 'OFFLINE';
                    const lastStatus = this.statusCache.get(cacheKey);

                    // First run or restart
                    if (lastStatus === undefined) {
                        this.statusCache.set(cacheKey, currentStatus);
                        
                        if (isOnline) {
                             if (!serverConfig.uptimeStart) {
                                serverConfig.uptimeStart = new Date();
                                configUpdatedInDb = true;
                             }
                        }

                        const newMsgId = await this.sendLog(guild, serverConfig, currentStatus, isOnline, data, serverConfig.messageId);
                        if (newMsgId && newMsgId !== serverConfig.messageId) {
                            serverConfig.messageId = newMsgId;
                            configUpdatedInDb = true;
                        }
                        continue;
                    }

                    // Status Change Logic (with debounce)
                    if (currentStatus !== lastStatus) {
                        const debounceData = this.debounceCache.get(cacheKey) || { status: currentStatus, count: 0 };
                        if (debounceData.status === currentStatus) {
                             debounceData.count += 1;
                        } else {
                             debounceData.status = currentStatus;
                             debounceData.count = 1;
                        }
                        this.debounceCache.set(cacheKey, debounceData);

                        if (debounceData.count >= 2) {
                            this.statusCache.set(cacheKey, currentStatus);
                            this.debounceCache.delete(cacheKey);

                            logger.info(`[FiveM] Server ${serverConfig.serverIp} formally changed to ${currentStatus} in guild: ${guild.name}.`);
                            
                            if (currentStatus === 'ONLINE') {
                                serverConfig.uptimeStart = new Date();
                            } else {
                                serverConfig.uptimeStart = null;
                            }
                            configUpdatedInDb = true;

                            const newMsgId = await this.sendLog(guild, serverConfig, currentStatus, isOnline, data, serverConfig.messageId);
                            if (newMsgId && newMsgId !== serverConfig.messageId) {
                                serverConfig.messageId = newMsgId;
                                configUpdatedInDb = true;
                            }
                        }
                    } else {
                        // Status stable: live update (players, etc)
                        this.debounceCache.delete(cacheKey);
                        const newMsgId = await this.sendLog(guild, serverConfig, currentStatus, isOnline, data, serverConfig.messageId);
                        if (newMsgId && newMsgId !== serverConfig.messageId) {
                            serverConfig.messageId = newMsgId;
                            configUpdatedInDb = true;
                        }
                    }
                }

                if (configUpdatedInDb) {
                    await config.save().catch(e => logger.error('[FiveM] Error saving state:', e));
                }
            }
        } catch (error) {
            logger.error('[FiveM] Error checking servers array:', error);
        }
    }

    async fetchServerData(serverIp, isRetry = false) {
        // Support for cfx.re join codes
        if (serverIp.includes('cfx.re/join/')) {
            const cfxId = serverIp.split('join/').pop().split('/')[0];
            return this.fetchFromCfx(cfxId);
        }

        let baseUrl = serverIp.startsWith('http') ? serverIp : `http://${serverIp}`;
        
        // If it's a retry and no port was specified, try common FiveM port 30120
        if (isRetry && !serverIp.includes(':') && !serverIp.startsWith('http')) {
            baseUrl = `http://${serverIp}:30120`;
        }

        try {
            const infoController = new AbortController();
            const playersController = new AbortController();
            
            const infoTimeout = setTimeout(() => infoController.abort(), 5000);
            const playersTimeout = setTimeout(() => playersController.abort(), 5000);
            
            const [infoRes, playersRes] = await Promise.all([
                fetch(`${baseUrl}/info.json`, { signal: infoController.signal }).catch(() => null),
                fetch(`${baseUrl}/players.json`, { signal: playersController.signal }).catch(() => null)
            ]);

            clearTimeout(infoTimeout);
            clearTimeout(playersTimeout);

            if (!infoRes || !infoRes.ok || !playersRes || !playersRes.ok) {
                if (!isRetry) return this.fetchServerData(serverIp, true);
                return { online: false, players: 0, maxPlayers: 0, server: '' };
            }

            const info = await infoRes.json();
            const players = await playersRes.json();

            let rawHostname = info.vars?.sv_hostname || info.server || serverIp;
            rawHostname = rawHostname.replace(/\^[0-9]/g, '');

            return {
                online: true,
                server: rawHostname,
                players: Array.isArray(players) ? players.length : 0,
                maxPlayers: info.vars?.sv_maxClients || 0
            };
        } catch (error) {
            if (!isRetry) {
                return this.fetchServerData(serverIp, true);
            }
            logger.warn(`[FiveM] Failed to reach ${baseUrl}: ${error.message}`);
            return { online: false, players: 0, maxPlayers: 0, server: '' };
        }
    }

    async fetchFromCfx(cfxId) {
        try {
            const res = await fetch(`https://servers-frontend.fivem.net/api/servers/single/${cfxId}`, {
                headers: { 'User-Agent': 'Verix-Bot/1.0' }
            }).catch(() => null);

            if (!res || !res.ok) return { online: false, players: 0, maxPlayers: 0, server: '' };

            const data = await res.json();
            const server = data.Data;
            if (!server) return { online: false, players: 0, maxPlayers: 0, server: '' };

            return {
                online: true,
                server: (server.vars?.sv_hostname || cfxId).replace(/\^[0-9]/g, ''),
                players: server.clients || 0,
                maxPlayers: server.sv_maxclients || 0
            };
        } catch (error) {
            logger.warn(`[FiveM] Cfx API Error for ${cfxId}: ${error.message}`);
            return { online: false, players: 0, maxPlayers: 0, server: '' };
        }
    }

    async sendLog(guild, serverConfig, statusString, isOnline, data, existingMessageId) {
        try {
            const channel = guild.channels.cache.get(serverConfig.statusChannelId);
            if (!channel) return null;

            const globalConf = await GlobalConfig.findOne({ guildId: guild.id });
            const lang = globalConf?.language || 'it';

            const placeholders = {
                guild: guild.name,
                server: data.server || serverConfig.name || serverConfig.serverIp,
                serverName: data.server || serverConfig.name || serverConfig.serverIp,
                players: String(data.players || 0),
                maxPlayers: String(data.maxPlayers || 0),
                lastCheck: `<t:${Math.floor(Date.now() / 1000)}:R>`
            };

            const payload = { embeds: [], components: [] };
            let rawContent = "";

            const isEffectiveEmbed = (e) => e && e.enabled && (
                (e.title && e.title.trim() !== '' && e.title !== 'Senza Titolo') || 
                (e.description && e.description.trim() !== '' && e.description !== 'Nessun contenuto impostato.')
            );

            if (isOnline) {
                if (serverConfig.onlineMessage && serverConfig.onlineMessage.trim().length > 0) {
                    rawContent = replacePlaceholders(serverConfig.onlineMessage, placeholders);
                }
                
                if (isEffectiveEmbed(serverConfig.onlineEmbed)) {
                    const embed = buildEmbed(serverConfig.onlineEmbed, placeholders);
                    if (embed) payload.embeds.push(embed);
                } else {
                    // Fallback to default
                    const defaultEmbed = await messageService.get(guild.id, 'fivem', 'status_embed', placeholders);
                    if (defaultEmbed) payload.embeds.push(defaultEmbed);
                }
            } else {
                if (serverConfig.offlineMessage && serverConfig.offlineMessage.trim().length > 0) {
                    rawContent = replacePlaceholders(serverConfig.offlineMessage, placeholders);
                }

                if (isEffectiveEmbed(serverConfig.offlineEmbed)) {
                    const embed = buildEmbed(serverConfig.offlineEmbed, placeholders);
                    if (embed) payload.embeds.push(embed);
                } else {
                    // Fallback to default
                    const defaultEmbed = await messageService.get(guild.id, 'fivem', 'offline_embed', placeholders);
                    if (defaultEmbed) payload.embeds.push(defaultEmbed);
                }
            }

            // Fallback base se l'admin non ha configurato né embed né testo custom
            if (!rawContent && payload.embeds.length === 0) {
                const fallbackType = isOnline ? 'status_embed' : 'offline_embed';
                const embed = await messageService.get(guild.id, 'fivem', fallbackType, {
                    serverName: placeholders.server,
                    players: placeholders.players,
                    maxPlayers: placeholders.maxPlayers
                });
                
                if (embed) {
                    embed.addFields({
                        name: 'IP Connessione',
                        value: `\`${serverConfig.serverIp}\``,
                        inline: false
                    });
                    payload.embeds.push(embed);
                }
            }

            // Process Uptime - DISABLED per user request
            // if (isOnline && serverConfig.uptimeStart) {
            //      const unixSec = Math.floor(new Date(serverConfig.uptimeStart).getTime() / 1000);
            //      const uptimeString = `\n\n🟢 **Online da:** <t:${unixSec}:R>`;
            //      rawContent += uptimeString;
            // }

            // Add Control Counter to content if no embeds, or we can just append it to rawContent
            rawContent += `\n\n🕒 **Ultimo Controllo:** ${placeholders.lastCheck}`;

            // Append Content
            payload.content = rawContent || null;

            // Generate Button ActionRow
            if (isOnline && serverConfig.buttons && serverConfig.buttons.length > 0) {
                 const row = new ActionRowBuilder();
                 for (const btn of serverConfig.buttons.slice(0, 5)) { // Discord limit
                    const btnLabel = replacePlaceholders(btn.label || 'Connettiti', placeholders);
                    let targetIp = serverConfig.serverIp;
                    if (targetIp.includes('cfx.re/join/')) {
                        targetIp = targetIp.split('join/').pop().split('/')[0];
                    }

                    let btnUrl = replacePlaceholders(btn.url || `https://cfx.re/join/${targetIp}`, placeholders);
                    
                    // Discord buttons only support http/https/discord protocols
                    if (btnUrl && !btnUrl.startsWith('http') && !btnUrl.startsWith('discord:')) {
                        // If it's a fivem:// link, try to convert to a web-friendly one or use cfx.re
                        if (btnUrl.startsWith('fivem://connect/')) {
                            const target = btnUrl.replace('fivem://connect/', '');
                            btnUrl = `https://cfx.re/join/${target}`;
                        } else {
                            // Fallback to https if unknown protocol
                            btnUrl = `https://${btnUrl}`;
                        }
                    }

                    const button = new ButtonBuilder()
                        .setLabel(btnLabel)
                        .setURL(btnUrl)
                        .setStyle(ButtonStyle.Link);
                    
                    if (btn.emoji) button.setEmoji(btn.emoji);
                    row.addComponents(button);
                 }
                 if (row.components.length > 0) payload.components.push(row);
            } else if (isOnline) {
                 // Fallback default button
                 let targetIp = serverConfig.serverIp;
                 if (targetIp.includes('cfx.re/join/')) {
                     targetIp = targetIp.split('join/').pop().split('/')[0];
                 }
                 
                 let fallbackUrl = `https://cfx.re/join/${targetIp}`;
                 if (serverConfig.serverIp.startsWith('http')) {
                     fallbackUrl = serverConfig.serverIp;
                 }

                 const row = new ActionRowBuilder()
                    .addComponents(
                         new ButtonBuilder()
                            .setLabel('Entra nel Server')
                            .setStyle(ButtonStyle.Link)
                            .setURL(fallbackUrl)
                    );
                 payload.components.push(row);
            }

            // Dispatch Logic: Edit if existing, otherwise Send new
            if (existingMessageId) {
                try {
                    const msg = await channel.messages.fetch(existingMessageId);
                    if (msg) {
                        await msg.edit(payload);
                        return existingMessageId; // unchanged
                    }
                } catch (e) {
                    // Message probably deleted -> Send a new one and overwrite messageId in DB
                }
            }
            
            const sentMsg = await channel.send(payload);
            return sentMsg.id;

        } catch (err) {
            logger.warn(`[FiveM] Failed to construct/send live-board status to ${serverConfig.statusChannelId}`, err);
            return null;
        }
    }
}
