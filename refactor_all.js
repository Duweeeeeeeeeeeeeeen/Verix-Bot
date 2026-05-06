import mongoose from 'mongoose';
import dotenv from 'dotenv';
import WhitelistConfig from './src/models/WhitelistConfig.js';
import TicketConfig from './src/models/TicketConfig.js';
import VerifyConfig from './src/models/VerifyConfig.js';
import PhotoContestConfig from './src/models/PhotoContestConfig.js';
import SocialConfig from './src/models/SocialConfig.js';

dotenv.config();

async function refactorAll() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Whitelist
        const wlUpdate = {
            title: '🛂 Ufficio Immigrazione - Richiesta di Cittadinanza',
            description: 'Benvenuto. Se desideri stabilirti stabilmente nel nostro Stato, devi prima sottoporti a una valutazione d\'idoneità da parte del Dipartimento Civile.',
            color: '#3BA4FF',
            'embeds.start.title': '🛂 Pratica d\'Ingresso: {user}',
            'embeds.start.description': 'Benvenuto cittadino. Per essere ammesso ufficialmente, dobbiamo compilare il tuo dossier informativo.\n\n**DIRETTIVE MINISTERIALI:**\n• Rispondi onestamente e con dovizia di particolari.\n• Rispetta i protocolli di tempo per evitare l\'annullamento dell\'istanza.\n• Ogni dichiarazione verrà registrata nel tuo archivio civile.',
            'embeds.start.footer': 'Dipartimento di Accoglienza Civile | Verix RP',
            'embeds.review.title': '📋 Validazione Finale del Dossier',
            'embeds.review.description': 'Rileggi attentamente le tue dichiarazioni istituzionali. Una volta confermate, la tua istanza passerà alla Commissione Superiore per il verdetto finale.',
            'embeds.review.footer': 'Ufficio Validazione Documenti | Verix RP',
            'embeds.dm_accepted.title': '🛂 VISTO CONCESSO: Benvenuto in Città!',
            'embeds.dm_accepted.description': 'Congratulazioni {user}! Il tuo visto di residenza per {guild} è stato approvato dalla Commissione.\nTi auguriamo una permanenza sicura e prospera ai confini dello Stato.',
            'embeds.dm_rejected.title': '❌ VISTO NEGATO: Pratica Archiviata',
            'embeds.dm_rejected.description': 'Gentile utente, la Commissione per l\'Immigrazione di {guild} ha respinto la tua istanza di cittadinanza.\n\n**MOTIVAZIONE UFFICIALE:**\n>>> {reason}'
        };
        await WhitelistConfig.updateMany({}, { $set: wlUpdate });
        console.log('Whitelist refactored for all guilds');

        // Tickets
        const tkUpdate = {
            'embeds.panel.title': '🎫 Segretariato di Stato - Sportello al Cittadino',
            'embeds.panel.description': 'Hai bisogno di assistenza o vuoi segnalare un\'anomalia? Seleziona il dipartimento competente qui sotto per aprire una pratica ufficiale.',
            'embeds.panel.color': '#2ECC71',
            'embeds.panel.footer': 'Dipartimento Pubbliche Relazioni | Verix RP',
            'embeds.ticket.title': '{emoji} Pratica {type} - In Carico',
            'embeds.ticket.description': 'Benvenuto allo sportello assistenziale, <@{user_id}>. Un operatore prenderà in carico la tua richiesta a breve.\n\n**DETTAGLI PROTOCOLLO:**\n• Priorità Operativa: `{priority}`\n• Stato Corrente: `{status}`',
            'embeds.ticket.color': '#2ECC71',
            'embeds.close.title': '📂 Archivio di Stato: Pratica Conclusa',
            'embeds.close.description': 'La documentazione relativa a questo ticket è stata archiviata nei nostri sistemi con successo.',
            'embeds.close.color': '#E74C3C'
        };
        await TicketConfig.updateMany({}, { $set: tkUpdate });
        console.log('Tickets refactored for all guilds');

        // Verify
        const verifyUpdate = {
            'embeds.panel.title': '🛡️ Checkpoint di Sicurezza - Dogana',
            'embeds.panel.description': 'Per garantire l\'incolumità dei cittadini, è necessario confermare la tua identità prima di attraversare la dogana e accedere alla città.',
            'embeds.panel.color': '#9146FF',
            'embeds.panel.footer': 'Dipartimento di Sicurezza Nazionale | Verix RP',
            'embeds.dm.title': '✅ Identità Confermata: Visto d\'Ingresso',
            'embeds.dm.description': 'Benvenuto cittadino! La tua registrazione presso lo Stato di **{guild}** è andata a buon fine. I cancelli sono ora aperti.',
            'embeds.dm.color': '#2ecc71',
            'embeds.dm.footer': 'Verificato tramite Verix Security'
        };
        await VerifyConfig.updateMany({}, { $set: verifyUpdate });
        console.log('Verify refactored for all guilds');

        // Photo Contest
        const photoUpdate = {
            'embedSettings.title': '🖼️ Galleria d\'Arte: Esposizione Fotografica',
            'embedSettings.description': 'La città è alla ricerca di scorci unici. Cattura un momento memorabile e depositalo in questa galleria per partecipare al concorso cittadino.',
            'embedSettings.color': '#F39C12'
        };
        await PhotoContestConfig.updateMany({}, { $set: photoUpdate });
        console.log('PhotoContest refactored for all guilds');

        // Socials (Twitch)
        const socialUpdate = {
            'platforms.twitch.embed.title': '📡 Segnale in Entrata: {streamer} è in Live!',
            'platforms.twitch.embed.description': '**{title}**\n\nLa rete locale sta catturando delle immagini da: **{game}**.\n\n[Connettiti alla frequenza]({url})',
            'platforms.twitch.embed.color': '#6441a5',
            'platforms.twitch.embed.footer': 'Notifiche Broadcast Automatiche | Verix RP'
        };
        await SocialConfig.updateMany({}, { $set: socialUpdate });
        console.log('Socials (Twitch) refactored for all guilds');

        await mongoose.disconnect();
        console.log('Mission accomplished.');
    } catch (err) {
        console.error(err);
    }
}

refactorAll();
