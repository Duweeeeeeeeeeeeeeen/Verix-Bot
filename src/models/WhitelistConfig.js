import mongoose from 'mongoose';

const whitelistConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: false },
    title: { type: String, default: 'Application System' },
    description: { type: String, default: 'Welcome. Complete the application to request access or a specific role on this server.' },
    color: { type: String, default: '#3BA4FF' },
    panelChannelId: { type: String, default: null },
    panelMessageId: { type: String, default: null },
    lastPanelChannelId: { type: String, default: null },
    lastPanelMessageId: { type: String, default: null },
    categoryOpenId: { type: String, default: null },
    staffRoleIds: { type: [String], default: [] },
    logChannelId: { type: String, default: null },
    questions: [
        {
            text: { type: String, required: true },
            minLength: { type: Number, default: 10 },
            category: { type: String, default: 'General' }
        }
    ],
    questionsPerSession: { type: Number, default: 5 },
    timeLimit: { type: Number, default: 30 }, // Minutes
    timeLimitEnabled: { type: Boolean, default: true },
    cooldown: { type: Number, default: 24 }, // Hours
    cooldownEnabled: { type: Boolean, default: true },
    mode: { type: String, enum: ['BG_ONLY', 'TEXT', 'VOICE', 'BG_TEXT', 'BG_VOICE', 'HYBRID', 'FULL'], default: 'TEXT' },
    rolesToAddOnTextPass: { type: [String], default: [] },
    rolesToRemoveOnTextPass: { type: [String], default: [] },
    notifications: {
        mode: { type: String, enum: ['DM', 'CHANNEL', 'BOTH', 'NONE'], default: 'DM' },
        channelId: { type: String, default: null }
    },
    voiceSettings: {
        joinChannelId: { type: String, default: null },
        categoryId: { type: String, default: null },
        autoDelete: { type: Boolean, default: true },
        maxConcurrent: { type: Number, default: 1 },
        queueCooldown: { type: Number, default: 5 }, // Minutes
        vipRoleId: { type: String, default: null },
        paused: { type: Boolean, default: false },
        dashboardChannelId: { type: String, default: null },
        dashboardMsgId: { type: String, default: null },
        pingStaffOnJoin: { type: Boolean, default: false },
        recentActionsCount: { type: Number, default: 3 },
        rejectionCooldown: { type: Number, default: 24 }, // Hours
        rolesToAdd: { type: [String], default: [] },
        rolesToRemove: { type: [String], default: [] },
        voiceMessages: {
            cooldown: { type: String, default: 'You requested an interview too recently. Please wait before trying again.' },
            queueFull: { type: String, default: 'All interview rooms are currently busy. You have been added to the queue.' },
            staffApproved: { type: String, default: 'Your voice interview was approved by {staff}.' },
            staffDenied: { type: String, default: 'Your voice interview was rejected by {staff}.' }
        },
        voiceButtons: {
            approve: { 
                label: { type: String, default: 'Accept' }, 
                emoji: { type: String, default: '✅' }, 
                style: { type: String, default: 'SUCCESS' } 
            },
            deny: { 
                label: { type: String, default: 'Reject' }, 
                emoji: { type: String, default: '❌' }, 
                style: { type: String, default: 'DANGER' } 
            },
            reset: { 
                label: { type: String, default: 'Reset Timer' }, 
                emoji: { type: String, default: '⏱️' }, 
                style: { type: String, default: 'SECONDARY' } 
            }
        },
        channelNameTemplate: { type: String, default: 'wl-{user}' },
        sessionCounter: { type: Number, default: 0 }
    },
    flowRequirements: {
        requireTextWL: { type: Boolean, default: false },
        requireBackground: { type: Boolean, default: false }
    },
    colors: {
        primary: { type: String, default: '#5865F2' },
        success: { type: String, default: '#2ecc71' },
        error: { type: String, default: '#ff4757' }
    },
    embeds: {
        panel: {
            title: { type: String, default: 'Whitelist Applications' },
            description: { type: String, default: 'Click the button below to start your application.' },
            color: { type: String, default: '#5865F2' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            footer: { type: String, default: null },
            fields: { type: [Object], default: [] },
            button: {
                label: { type: String, default: 'Start Application' },
                emoji: { type: String, default: '📝' },
                style: { type: String, default: 'PRIMARY' }
            }
        },
        start: {
            title: { type: String, default: 'Application Session: {user}' },
            description: { type: String, default: 'Welcome. We need to collect your answers for staff review.\n\n**INSTRUCTIONS:**\n- Answer honestly and in detail.\n- Respect the time limit to avoid session cancellation.\n- Your answers will be attached to your application.' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            footer: { type: String, default: 'Application System | {guild}' },
            fields: { type: [Object], default: [
                { name: 'Time Limit', value: '`{time_limit} minutes`', inline: true },
                { name: 'Questions', value: '`{total_questions}`', inline: true },
                { name: 'Application Status', value: '`Waiting for answers...`', inline: true }
            ]}
        },
        question: {
            title: { type: String, default: 'Question {current_index} of {total_questions}' },
            description: { type: String, default: '>>> {question}' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            footer: { type: String, default: 'You are completing an application.' },
            fields: { type: [Object], default: [
                { name: 'Minimum Detail', value: '`{min_length} characters`', inline: true },
                { name: 'Time Left', value: '`{time_left} min`', inline: true }
            ]}
        },
        error_min_length: {
            title: { type: String, default: 'More Detail Required' },
            description: { type: String, default: 'Your answer must contain at least **{min_length}** characters before it can be saved.' },
            color: { type: String, default: 'error' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        timeout: {
            title: { type: String, default: 'Session Expired' },
            description: { type: String, default: 'The session ended because too much time passed. Please start a new application if you still need access.' },
            color: { type: String, default: 'error' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        review: {
            title: { type: String, default: 'Final Application Review' },
            description: { type: String, default: 'Review your answers carefully. Once confirmed, your application will be sent to staff for review.' },
            color: { type: String, default: 'success' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            footer: { type: String, default: 'Application Review | {guild}' }
        },
        dm_submitted: {
            enabled: { type: Boolean, default: true },
            title: { type: String, default: 'Application Received' },
            description: { type: String, default: 'Your application for {guild} is now in staff review. You will receive an update when it has been checked.' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        dm_accepted: {
            enabled: { type: Boolean, default: true },
            title: { type: String, default: 'Application Approved' },
            description: { type: String, default: 'Congratulations {user}! Your application for {guild} has been approved.' },
            color: { type: String, default: 'success' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        dm_rejected: {
            enabled: { type: Boolean, default: true },
            title: { type: String, default: 'Application Rejected' },
            description: { type: String, default: 'Sorry {user}, your application for {guild} was not approved.\n\n**Reason:**\n>>> {reason}' },
            color: { type: String, default: 'error' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        staff_received: {
            title: { type: String, default: 'New Whitelist Application' },
            description: { type: String, default: 'User **{user_name}** submitted an application for review.\n\n**INFO:**\n- Discord: <@{user_id}>\n- Application ID: `{app_id}`' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            footer: { type: String, default: 'Application ID: {app_id}' }
        },
        staff_accepted: {
            title: { type: String, default: 'Application Approved' },
            color: { type: String, default: 'success' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            fields: { type: [Object], default: [
                { name: 'User', value: '{user}', inline: true },
                { name: 'Reviewer', value: '{staff}', inline: true },
                { name: 'Application ID', value: '`{app_id}`', inline: true }
            ]}
        },
        staff_rejected: {
            title: { type: String, default: 'Application Rejected' },
            color: { type: String, default: 'error' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            fields: { type: [Object], default: [
                { name: 'User', value: '{user}', inline: true },
                { name: 'Reviewer', value: '{staff}', inline: true },
                { name: 'Application ID', value: '`{app_id}`', inline: true },
                { name: 'Staff Note', value: '>>> {reason}', inline: false }
            ]}
        },
        voice_waiting: {
            title: { type: String, default: 'Voice Interview Started' },
            description: { type: String, default: 'Welcome to the interview room, {user}. A staff member will join soon to complete your application.' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        voice_staff_log: {
            title: { type: String, default: 'New Voice Interview' },
            description: { type: String, default: 'User {user} is ready for the voice interview in channel: {voice_channel}.' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        voice_error_flow: {
            title: { type: String, default: 'Voice Interview Error' },
            description: { type: String, default: 'Your voice interview cannot continue for the following reason:\n{reason}' },
            color: { type: String, default: 'error' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        voice_guide: {
            enabled: { type: Boolean, default: true },
            title: { type: String, default: 'Voice Interview Guide' },
            description: { type: String, default: 'Use the buttons below to manage the interview result.' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            footer: { type: String, default: 'Voice Whitelist System' },
            fields: { type: [Object], default: [
                { name: 'Elapsed Time', value: '{start_time}', inline: true },
                { name: '✅ Checklist', value: '{checklist}', inline: false }
            ]}
        },
        dm_voice_rejected: {
            enabled: { type: Boolean, default: true },
            title: { type: String, default: 'Voice Interview Rejected' },
            description: { type: String, default: 'Sorry {user}, your voice interview for {guild} was not approved.\n\n**Reason:**\n>>> {reason}\n\nYou can try again in **{cooldown} hours**.' },
            color: { type: String, default: 'error' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        }
    },
    systemMessages: {
        type: Map,
        of: String,
        default: {}
    }
});

export default mongoose.model('WhitelistConfig', whitelistConfigSchema);
