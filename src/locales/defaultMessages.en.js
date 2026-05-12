/**
 * Default Professional Messages for all modules (English).
 * These are used as standard for every server if no override is found in DB.
 */
export default {
    system: {
        no_permission: {
            title: '⚠️ Access Denied',
            description: 'You do not have the necessary permissions to perform this operation. Contact an administrator if you believe this is an error.',
            color: '#e74c3c'
        },
        module_disabled: {
            title: '📡 Module Disabled',
            description: 'The **{module}** module is currently disabled on this server. Contact staff for more information.',
            color: '#f1c40f'
        },
        role_hierarchy: {
            title: '⚖️ Role Hierarchy',
            description: 'Cannot assign role **{role}**. The bot cannot manage roles higher than or equal to its own in the server hierarchy.',
            color: '#e74c3c'
        },
        generic_error: {
            title: '❌ System Error',
            description: 'An unexpected error occurred during processing. Technicians have been informed.',
            color: '#e74c3c'
        },
        setup_success: {
            title: '✅ Setup Completed',
            description: 'The module has been correctly configured and is now operational.',
            color: '#2ecc71'
        },
        module_list: {
            title: '⚙️ Module Management',
            description: 'List of modules currently loaded in the system:\n\n{list}',
            color: '#5865f2'
        },
        module_enabled: {
            title: '✅ Module Activated',
            description: 'The **{module}** module has been successfully activated.',
            color: '#2ecc71'
        },
        module_disabled_success: {
            title: '❌ Module Deactivated',
            description: 'The **{module}** module has been removed from the system. All related functions are suspended.',
            color: '#e74c3c'
        },
        module_already_in_state: {
            title: 'ℹ️ State Unchanged',
            description: 'The **{module}** module is already in the requested state.',
            color: '#3498db'
        },
        module_not_found: {
            title: '❌ Module Not Found',
            description: 'The **{module}** module is not registered in the system.',
            color: '#e74c3c'
        }
    },
    utility: {
        clear_success: {
            title: '🧹 Chat Cleanup',
            description: 'Successfully deleted **{amount}** messages.',
            color: '#2ecc71'
        },
        clear_no_messages: {
            title: '⚠️ No Messages Found',
            description: 'No messages were found matching the deletion criteria.',
            color: '#f1c40f'
        },
        clear_error: {
            title: '❌ Cleanup Error',
            description: 'An error occurred during deletion. Note: messages older than 14 days cannot be bulk deleted.',
            color: '#e74c3c'
        },
        ping: {
            title: '🏓 Connection Status',
            description: '>>> **Latency:**\n• Bot: `{latency}ms`\n• API: `{api_latency}ms`',
            color: '#3498db'
        }
    },
    whitelist: {
        panel: {
            title: '🛂 Immigration Office - City Entry',
            description: 'Welcome to the access portal. To reside permanently in the city, you must undergo a civil suitability assessment.\n\nMake sure to answer honestly to the protocols presented to you.',
            color: '#3BA4FF',
            footer: 'Civil Department | Verix RP'
        },
        start: {
            title: '📄 Entry Application: {user_name}',
            description: 'Welcome citizen. To be officially admitted, we must complete your information dossier.\n\n**DEPARTMENTAL DIRECTIVES:**\n• Answer honestly and with plenty of detail.\n• Respect time protocols to avoid cancellation of the request.',
            color: '#3BA4FF',
            footer: 'Welcome Office | Verix RP'
        },
        question: {
            title: '❓ Examination: Question {current_index} of {total_questions}',
            description: '>>> {question}',
            color: '#3BA4FF'
        },
        review: {
            title: '📋 Final Dossier Validation',
            description: 'Carefully review your institutional statements. Once confirmed, your request will pass to the Superior Commission for the final verdict.',
            color: '#2ecc71'
        },
        not_configured: {
            title: '⏳ Incomplete Configuration',
            description: 'The city entry procedure has not yet been finalized by staff. Please be patient for a little longer.',
            color: '#f1c40f'
        },
        active_session: {
            title: '📄 Ongoing Application',
            description: 'There is already an open dossier in your name in channel <#{channelId}>. Conclude that procedure before starting a new one.',
            color: '#3498db'
        },
        already_submitted: {
            title: '📂 Dossier Under Evaluation',
            description: 'Your documentation has already been delivered and is currently on the staff\'s desk. You will receive a result shortly.',
            color: '#3498db'
        },
        already_passed: {
            title: '✅ Citizenship Already Obtained',
            description: 'Our records indicate that you are already a regular citizen of **{guild}**. It is not necessary to repeat the procedure.',
            color: '#2ecc71'
        },
        cooldown: {
            title: '⚠️ Cooldown Protocol',
            description: 'Your last request was recently rejected. For bureaucratic reasons, you must wait **{time}** before submitting a new dossier.',
            color: '#e74c3c'
        },
        start_success: {
            title: '✅ Path Started',
            description: 'Your dossier has been correctly opened. Head to channel <#{channelId}> to start the written interview.',
            color: '#2ecc71'
        },
        session_completed: {
            title: '📝 Interview Transcribed',
            description: 'You have answered all interview questions. Staff will analyze your application shortly.\n\nCheck your answers above and use the buttons to confirm or cancel the submission.',
            color: '#3498db'
        },
        min_length_error: {
            title: '⚠️ Insufficient Detail',
            description: 'Your answer must contain at least **{minLength}** characters to be considered valid. Please try to explain yourself a bit better.',
            color: '#f1c40f'
        },
        dm_accepted: {
            title: '✅ Suitability Confirmed',
            description: 'Congratulations citizen! Your application to **{guild}** has been approved by the Commission.\n\nYou can now access the official channels and begin your experience.',
            color: '#2ecc71'
        },
        dm_rejected: {
            title: '❌ Negative Outcome',
            description: 'Sorry, but the evaluation of your dossier at **{guild}** was not positive.\n\n**REASON:**\n{reason}\n\nYou can try submitting a new request after the cooldown period.',
            color: '#e74c3c'
        },
        dm_voice_rejected: {
            title: '⚠️ Oral Protocol Rejected',
            description: 'You did not pass the oral assessment at **{guild}**. We invite you to review the city protocols before reapplying.',
            color: '#e74c3c'
        },
        dm_text_pass: {
            title: '📝 Written Test Passed',
            description: 'You passed the written test on **{guild}**! Now you can go to the waiting voice channel for the final interview.',
            color: '#f1c40f'
        },
        staff_received: {
            title: '📩 New Whitelist Application',
            description: 'User **{user_name}** has submitted their dossier for evaluation.\n\n**INFO:**\n• Discord: <@{user_id}>\n• Application ID: `{app_id}`',
            color: '#3498db'
        },
        dm_submitted: {
            title: '📋 Dossier Received',
            description: 'Your application to enter **{guild}** has been acquired by our systems.\n\nA member of the Commission will review it as soon as possible. You will be notified here as soon as there is an outcome.',
            color: '#3498db'
        },
        submission_confirmed: {
            title: '✅ Dossier Submitted',
            description: 'Your documentation has been correctly sent to the relevant offices. You will be notified of the outcome shortly.',
            color: '#2ecc71'
        },
        voice_procedural_error: {
            title: '❌ Procedural Error',
            description: 'Sorry citizen, but the State does not provide oral interviews for the type of visa you requested.',
            color: '#e74c3c'
        },
        queue_log: {
            title: '📢 Queue Protocol: New Entry',
            description: 'A new citizen is waiting for an interview.\n\n**SUBJECT:** {user}\n**ID:** `{user_id}`\n**CURRENT QUEUE:** `{waiting_count}`',
            color: '#3498db'
        }
    },
    background: {
        panel: {
            title: '📜 Historical Archive: Background Deposit',
            description: 'Start writing your character\'s story to get final background approval.\n\nClick the button below to start the deposit protocol.',
            color: '#5865f2',
            footer: 'Registry Office | Verix RP'
        },
        instructions: {
            title: '✍️ Background Drafting',
            description: 'You are starting to draft your background. Make sure to accurately describe your character\'s origins and ambitions.\n\n**REQUIREMENTS:**\n• Consistency with the city setting.\n• Respect for narrative guidelines.',
            color: '#3498db'
        },
        dm_accepted: {
            title: '📜 Background Approved',
            description: 'Your background has been officially deposited in the archives of **{guild}**. Your story is now an integral part of the city.',
            color: '#2ecc71'
        },
        dm_rejected: {
            title: '⚠️ Revision Requested',
            description: 'Your background proposal for **{guild}** has been rejected or requires revisions.\n\n**STAFF NOTES:**\n{reason}',
            color: '#e74c3c'
        },
        staff_received: {
            title: '📑 New Background Received',
            description: 'User **<@{userId}>** has sent their background for review.\n\n**INFO:**\n• Link: {bg_link}\n• Desc: {bg_desc}\n• Attachment: {bg_attachment}',
            color: '#3498db'
        }
    },
    tickets: {
        panel: {
            title: '🎫 Support Center',
            description: 'Need assistance or want to report an issue? Open a support ticket by selecting the correct category from the menu below.',
            color: '#2ECC71',
            footer: 'Support Team | {guild}'
        },
        ticket: {
            title: '📂 Support Ticket: {type}',
            description: 'Welcome, <@{user_id}>. A staff member will handle your request shortly.\n\n**DETAILS:**\n• Priority: `{priority}`\n• Status: `{status}`',
            color: '#2ECC71'
        },
        success_open: {
            title: '✅ Ticket Created',
            description: 'Your ticket has been successfully opened.\n\n**Channel:** {channel}',
            color: '#2ecc71'
        },
        close: {
            title: '🔒 Ticket Closed',
            description: 'This ticket has been correctly closed and archived.',
            color: '#E74C3C'
        },
        already_exists: {
            title: '⚠️ Existing Ticket',
            description: 'You already have an open ticket of type **{type}** in channel <#{channelId}>.',
            color: '#f1c40f'
        },
        staff_claimed: {
            title: '⚙️ Claimed',
            description: 'Staff member **{staff}** has taken over your ticket and will assist you shortly.',
            color: '#3498db'
        },
        status_updated: {
            title: '🔄 Status Updated',
            description: 'The ticket status has been set to: **{status}**.',
            color: '#3498db'
        },
        inactivity_close: {
            title: '⚠️ Closed for Inactivity',
            description: 'This ticket has been automatically closed due to lack of recent activity.',
            color: '#e74c3c'
        },
        default_welcome: {
            title: '🎫 Assistance Request',
            description: 'Welcome to the support center. A staff member will be here shortly.\n\nReason: **{reason}**',
            color: '#5865F2'
        }
    },
    verify: {
        panel: {
            title: '🛡️ Account Verification',
            description: 'To access the server channels, you must verify your identity. Click the button below to proceed.',
            color: '#3BA4FF',
            footer: 'Security System | {guild}'
        },
        success: {
            title: '✅ Verification Completed',
            description: 'Welcome! Your verification on **{guild}** was successful. You now have access to all channels.',
            color: '#2ecc71'
        },
        already_verified: {
            title: '⚠️ Already Verified',
            description: 'Your identity is already verified in the **{guild}** database.',
            color: '#f1c40f'
        },
        dm: {
            title: '🎊 Welcome to the Server',
            description: 'You have successfully verified on **{guild}**. Enjoy your stay and have fun!',
            color: '#2ecc71'
        },
        staff_log: {
            title: '🛂 Verification Log: New Member',
            description: 'A new user has completed verification.\n\n**User:** {user}\n**ID:** `{userId}`',
            color: '#2ecc71'
        }
    },
    fivem: {
        status_embed: {
            title: '🏙️ City Status: Online',
            description: 'The heart of the metropolis is active. Citizens are invited to connect and start their day.\n\n📡 **Server:** `{serverName}`\n👥 **Citizens in City:** `{players}/{maxPlayers}`\n🟢 **Status:** Operational',
            color: '#2ecc71',
            footer: 'Urban Monitoring | Verix RP'
        },
        offline_embed: {
            title: '🔴 City Status: Offline',
            description: 'Attention citizens. Connection to the metropolis has been interrupted. Technicians are working to restore access protocols.\n\n⚠️ **Status:** Inaccessible / Maintenance',
            color: '#e74c3c',
            footer: 'Urban Emergency | Verix RP'
        }
    },
    welcome: {
        join: {
            title: '👋 Welcome to the Server!',
            description: 'Hello **{user}**, welcome to **{guild}**! We are happy to have you with us.\n\nMake sure to read the rules for a pleasant stay.',
            color: '#2ecc71'
        },
        leave: {
            title: '👋 Goodbye!',
            description: '**{user}** has left the server. We hope to see you again soon!',
            color: '#e74c3c'
        }
    },
    moderation: {
        warn: {
            title: '🛡️ Official Warning',
            description: 'Attention **{user}**, you have received an official warning for violating the rules.\n\n**Reason:**\n>>> {reason}',
            color: '#f1c40f',
            footer: 'Moderation | {guild}'
        },
        timeout: {
            title: '🔇 Temporary Timeout',
            description: 'User **{user}** has been temporarily muted for **{duration}**.\n\n**Reason:**\n>>> {reason}',
            color: '#e67e22'
        },
        kick: {
            title: '👢 Kicked from Server',
            description: 'You have been kicked from the server for violating the rules.\n\n**Reason:**\n>>> {reason}',
            color: '#e74c3c'
        },
        ban: {
            title: '🚫 Permanent Ban',
            description: 'Your access to this server has been permanently revoked.\n\n**Reason:**\n>>> {reason}',
            color: '#000000'
        }
    },
    giveaway: {
        no_participants: {
            title: '😔 Giveaway Ended',
            description: 'The giveaway for **{prize}** ended with no valid participants.',
            color: '#e74c3c'
        },
        winners: {
            title: '🎉 Giveaway Winners!',
            description: 'The giveaway for **{prize}** has concluded!\n\n🏆 **Winners:** {winners}',
            color: '#2ecc71'
        },
        already_ended: {
            title: '⚠️ Giveaway Already Ended',
            description: 'Sorry, this giveaway has already concluded.',
            color: '#f1c40f'
        }
    },
    photocontest: {
        panel: {
            title: '📸 Photo Contest',
            description: 'Participate in our photo contest! Upload your best photo following the current theme.\n\n**Theme:** `{theme}`\n**Deadline:** {endTime}',
            color: '#F39C12'
        },
        submission: {
            title: '🎨 Work by {username}',
            description: 'A new photo has been uploaded for the contest.\n\n**Theme:** `{theme}`\n**Deadline:** {endTime}',
            color: '#3498db'
        }
    }
};
