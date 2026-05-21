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
            title: 'ℹ️ server Unchanged',
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
            title: '📋 Application System',
            description: 'Welcome to the access portal. To obtain full access or request a specific role, you must complete the application form.\n\nMake sure to answer honestly to the questions presented to you.',
            color: '#3BA4FF',
            footer: 'Application Management | {guild}'
        },
        start: {
            title: '📄 New Application: {user_name}',
            description: 'Welcome. To proceed with your request, we must collect some information necessary for evaluation.\n\n**INSTRUCTIONS:**\n• Answer honestly and with plenty of detail.\n• Respect time protocols to avoid cancellation of the session.',
            color: '#3BA4FF',
            footer: 'Evaluation Office | {guild}'
        },
        question: {
            title: '❓ Question: {current_index} of {total_questions}',
            description: '>>> {question}',
            color: '#3BA4FF'
        },
        review: {
            title: '📋 Final Review',
            description: 'Carefully review your statements. Once confirmed, your application will pass to the staff for the final verdict.',
            color: '#2ecc71'
        },
        not_configured: {
            title: '⏳ Incomplete Configuration',
            description: 'The application procedure has not yet been finalized by staff. Please try again later.',
            color: '#f1c40f'
        },
        active_session: {
            title: '📄 Ongoing Session',
            description: 'There is already an open application session in your name in channel <#{channelId}>. Conclude that procedure before starting a new one.',
            color: '#3498db'
        },
        already_submitted: {
            title: '📂 Under Evaluation',
            description: 'Your documentation has already been delivered and is currently on the staff\'s desk. You will receive a result shortly.',
            color: '#3498db'
        },
        already_passed: {
            title: '✅ Access Already Obtained',
            description: 'Our records indicate that you are already an approved member of **{guild}**. It is not necessary to repeat the procedure.',
            color: '#2ecc71'
        },
        cooldown: {
            title: '⚠️ Waiting Period',
            description: 'Your last request was recently rejected. For organizational reasons, you must wait **{time}** before submitting a new application.',
            color: '#e74c3c'
        },
        start_success: {
            title: '✅ Session Started',
            description: 'Your application has been correctly opened. Head to channel <#{channelId}> to start providing your information.',
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
            description: 'Congratulations member! Your application to **{guild}** has been approved by the staff team.\n\nYou can now access the official channels and begin your experience.',
            color: '#2ecc71'
        },
        dm_rejected: {
            title: '❌ Negative Outcome',
            description: 'Sorry, but the evaluation of your application at **{guild}** was not positive.\n\n**REASON:**\n{reason}\n\nYou can try submitting a new request after the cooldown period.',
            color: '#e74c3c'
        },
        dm_voice_rejected: {
            title: '⚠️ Oral Protocol Rejected',
            description: 'You did not pass the oral assessment at **{guild}**. We invite you to review the server rules before reapplying.',
            color: '#e74c3c'
        },
        dm_text_pass: {
            title: '📝 Written Test Passed',
            description: 'You passed the written test on **{guild}**! Now you can go to the waiting voice channel for the final interview.',
            color: '#f1c40f'
        },
        staff_received: {
            title: '📩 New Whitelist Application',
            description: 'User **{user_name}** has submitted their application for evaluation.\n\n**INFO:**\n• Discord: <@{user_id}>\n• Application ID: `{app_id}`',
            color: '#3498db'
        },
        dm_submitted: {
            title: '📋 Application Received',
            description: 'Your application to enter **{guild}** has been acquired by our systems.\n\nA member of the staff team will review it as soon as possible. You will be notified here as soon as there is an outcome.',
            color: '#3498db'
        },
        submission_confirmed: {
            title: '✅ Application Submitted',
            description: 'Your documentation has been correctly sent to the relevant tickets. You will be notified of the outcome shortly.',
            color: '#2ecc71'
        },
        voice_procedural_error: {
            title: '❌ Procedural Error',
            description: 'Sorry member, but the server does not provide oral interviews for the type of application you requested.',
            color: '#e74c3c'
        },
        queue_log: {
            title: '📢 Queue Protocol: New Entry',
            description: 'A new member is waiting for an interview.\n\n**SUBJECT:** {user}\n**ID:** `{user_id}`\n**CURRENT QUEUE:** `{waiting_count}`',
            color: '#3498db'
        }
    },
    background: {
        panel: {
            title: '📜 Historical Archive: Character Story Deposit',
            description: 'Start writing your character\'s story to get final background approval.\n\nClick the button below to start the deposit protocol.',
            color: '#5865f2',
            footer: 'Registry Office | {guild}'
        },
        instructions: {
            title: '✍️ Character Story Drafting',
            description: 'You are starting to draft your story. Make sure to accurately describe your character\'s origins and ambitions.\n\n**REQUIREMENTS:**\n• Consistency with the server guidelines.\n• Respect for narrative guidelines.',
            color: '#3498db'
        },
        modal_title: 'Story Details',
        link_label: 'Link to Story (e.g. Google Doc)',
        desc_label: 'Short Description (Optional)',
        desc_placeholder: 'Summarize your character story here...',
        dm_accepted: {
            title: '📜 Story Approved',
            description: 'Your story has been officially deposited in the archives of **{guild}**. Your character is now an integral part of the server.',
            color: '#2ecc71'
        },
        dm_rejected: {
            title: '⚠️ Revision Requested',
            description: 'Your story proposal for **{guild}** has been rejected or requires revisions.\n\n**STAFF NOTES:**\n{reason}',
            color: '#e74c3c'
        },
        staff_received: {
            title: '📖 New Story Received',
            description: 'A user has submitted a story for review.\n\n**User:** <@{userId}>\n**Link:** [Open Document]({bg_link})\n**Description:** {bg_desc}\n**ID:** `{app_id}`',
            color: '#3498db'
        },
        approve_btn: 'Approve',
        deny_btn: 'Reject',
        accepted_title: '✅ Story APPROVED',
        rejected_title: '❌ Story REJECTED',
        staff_tag: '👮 Staff Member',
        subject_tag: '👤 Subject',
        outcome_tag: 'Staff Outcome'
    },
    staffapps: {
        panel: {
            title: '🛡️ Staff Recruitment - Application Portal',
            description: 'Do you want to join our team? By submitting your application, you will be evaluated by the HR managers.\n\nMake sure to answer all questions comprehensively.',
            color: '#a855f7',
            footer: 'HR Department | {guild}'
        },
        dm_accepted: {
            title: '🎊 Application Accepted!',
            description: 'Great news {user}! Your application for the staff of {guild} has been approved. Welcome to the team!',
            color: '#2ecc71'
        },
        dm_rejected: {
            title: '❌ Application Rejected',
            description: 'We are sorry {user}, but your application for {guild} was not approved.\n\n**Reason:**\n>>> {reason}',
            color: '#ff4757'
        },
        staff_received: {
            title: '🛡️ New Staff Application',
            description: 'User **<@{userId}>** has submitted a new application for the staff team.',
            color: '#a855f7'
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
        created_success: {
            title: '✅ Ticket Created',
            description: 'Your ticket has been successfully opened in <#{channelId}>.',
            color: '#2ecc71'
        },
        close: {
            title: '🔒 Ticket Closed',
            description: 'This ticket has been correctly closed and archived.',
            color: '#E74C3C'
        },
        close_started: {
            title: '🔒 Closing in Progress',
            description: 'The ticket is being closed and archived. Please wait...',
            color: '#e67e22'
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
        claim_already: {
            title: '⚠️ Already Claimed',
            description: 'This ticket has already been claimed by <@{staffId}>.',
            color: '#f1c40f'
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
        },
        priority_select: {
            title: '⚡ Priority Selection',
            description: 'Please select the priority level for this ticket before proceeding.',
            color: '#f1c40f'
        },
        quick_reply_menu: {
            title: '📝 Quick Replies',
            description: 'Select a response template to send in the ticket.',
            color: '#3498db'
        },
        tag_menu: {
            title: '🏷️ Tag Management',
            description: 'Select a tag to add or remove from this ticket.',
            color: '#3498db'
        },
        staff_only: {
            title: '⚠️ Restricted Access',
            description: 'Sorry, but only staff members can use these management features.',
            color: '#e74c3c'
        },
        blacklist_error: {
            title: '🚫 Access Denied',
            description: 'Your account has been blacklisted from the ticket system. You cannot open new requests.',
            color: '#e74c3c'
        },
        note_success: {
            title: '✅ Note Added',
            description: 'The internal note has been successfully recorded in the ticket database.',
            color: '#2ecc71'
        },
        config_not_found: {
            title: '❌ Configuration Missing',
            description: 'The ticket system has not been configured for this server yet. Contact administrators.',
            color: '#e74c3c'
        },
        category_not_available: {
            title: '❌ Category Not Available',
            description: 'The selected category is no longer available or has been removed by staff.',
            color: '#e74c3c'
        },
        staff_ticket_log: {
            title: '📂 Closed Ticket Log',
            description: '>>> **User:** {user}\n**Type:** `{type}`\n**Staff:** {staff}',
            color: '#3498db'
        },
        intelligence: {
            title: '🔍 Intelligence: {user}',
            prev_tickets: '🎫 Previous Tickets',
            sessions_closed: '`{count}` closed sessions',
            whitelist: '📋 Whitelist',
            status: 'Status: `{status}`',
            no_app: 'No application',
            last_wl: '📅 Last Whitelist',
            background: '📖 Background',
            no_application: 'No applications',
            footer: 'Staff Intelligence Module',
            field_name: '🔍 User Intelligence'
        },
        system_messages: {
            priority_placeholder: 'Select priority...',
            priority_normal: 'Normal',
            priority_important: 'Important',
            priority_urgent: 'Urgent',
            claim_btn: 'Claim',
            close_btn: 'Close',
            quick_reply_btn: 'Quick Replies',
            note_btn: 'Note',
            status_placeholder: 'Change status...',
            status_processing: 'Processing',
            status_waiting: 'Waiting (User)',
            note_modal_title: 'Add Internal Note',
            note_input_label: 'Note content',
            note_input_placeholder: 'Write a note visible only to staff...',
            report_modal_title: 'Report Form',
            report_subject_label: 'Subject',
            report_desc_label: 'Description',
            no_quick_replies: '❌ No quick replies configured.',
            quick_reply_placeholder: 'Choose a template...',
            tag_placeholder: 'Select a tag...',
            claim_success: '✅ Ticket claimed successfully.',
            status_updated_msg: '✅ Ticket status updated to: **{status}**',
            assigned_staff_label: '👤 Assigned Staff',
            internal_notes_label: '📝 Internal Notes',
            waiting_staff: '_Waiting..._',
            none: '_None_',
            new_ticket_ping: '{ping} - New **{type}** ticket opened.',
            cooldown: '⚠️ **HIGH TRAFFIC:** Wait a few minutes before opening a new ticket.',
            already_exists: '❌ **ERROR:** You already have a **{type}** ticket open.',
            success_open: '✅ **TICKET OPENED:** Go to channel {channel}.',
            success_close: '🛡️ **ARCHIVING IN PROGRESS...**',
            staff_claimed: '✅ **{staff}** has claimed the ticket.',
            claim_already: '❌ This ticket has already been claimed by <@{staffId}>.',
            staff_only: '⚠️ Restricted access for staff members only.',
            blacklist_error: '🚫 You have been blacklisted from the ticket system.'
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
            description: 'The heart of the metropolis is active. Members are invited to connect and start their day.\n\n📡 **Server:** `{serverName}`\n👥 **Members in City:** `{players}/{maxPlayers}`\n🟢 **Status:** Operational',
            color: '#2ecc71',
            footer: 'Urban Monitoring | Verix RP'
        },
        offline_embed: {
            title: '🔴 City Status: Offline',
            description: 'Attention members. Connection to the metropolis has been interrupted. Technicians are working to restore access protocols.\n\n⚠️ **Status:** Inaccessible / Maintenance',
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
    voice: {
        control_panel: {
            title: '🎙️ Voice Control Panel',
            description: 'Welcome <@{user}>! This is your temporary channel.\nUse the buttons below to manage it quickly.',
            color: '#5865F2'
        },
        status_none: 'None',
        owner_field: '👑 Owner',
        limit_field: '👥 Limit'
    },
    moderation: {
        no_reason: 'No reason provided',
        error: {
            title: '❌ Moderation Error',
            description: 'An error occurred while executing the command.',
            color: '#e74c3c'
        },
        command_ban: {
            title: '✅ Ban Executed',
            description: 'User **{user}** has been successfully banned.\n\n**Reason:** {reason}',
            color: '#2ecc71'
        },
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
        },
        level_required: {
            title: '🛡️ Level Requirement Unmet',
            description: 'You must be at least **Level {minLevel}** to join this giveaway!\nYour current level is **Level {currentLevel}**.',
            color: '#e74c3c'
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
    },
    logs: {
        message_deleted: {
            title: '🗑️ Message Deleted',
            author: 'Author',
            channel: 'Channel',
            content: 'Content',
            no_text: '*No text (maybe an embed or file)*',
            color: '#e74c3c'
        },
        message_updated: {
            title: '📝 Message Updated',
            author: 'Author',
            channel: 'Channel',
            before: 'Before',
            after: 'After',
            color: '#3498db'
        }
    },
    admin: {
        embed_editor: {
            title: '🛠️ Embed Editor',
            description: 'You are editing a default message. Use the buttons to change fields.',
            color: '#F1C40F'
        }
    },
    socials: {
        twitch: {
            title: '📡 **{streamer}** is live!',
            description: '### {title}\n\nHey! **{streamer}** just turned on the camera on Twitch. Don\'t miss the show!\n\n[Join Live]({url})',
            color: '#6441a5',
            footer: 'Social Notifications | Verix'
        },
        youtube: {
            title: '🎥 New video from **{streamer}**!',
            description: '### {title}\n\nA new video just dropped on the channel! Go check it out.',
            color: '#ff0000',
            footer: 'Social Notifications | Verix'
        },
        twitter: {
            title: '𝕏 (Twitter) New post from **{streamer}**',
            description: '{description}',
            color: '#000000',
            footer: 'Social Notifications | Verix'
        },
        instagram: {
            title: '📸 New post from **{streamer}**',
            description: '### {title}\n\nNew content uploaded to Instagram! Go take a look.',
            color: '#e1306c',
            footer: 'Social Notifications | Verix'
        },
        tiktok: {
            title: '🎵 New TikTok from **{streamer}**',
            description: '### {title}\n\nA new video was just published on TikTok! Watch now.',
            color: '#000000',
            footer: 'Social Notifications | Verix'
        },
        reddit: {
            title: '👾 New Post on **r/{username}**!',
            description: '### {title}\n\n**{author}** published a new post on **r/{username}**!\n\n{description}',
            color: '#ff4500',
            footer: 'Social Notifications | Verix'
        },
        steam: {
            title: '🎮 New Announcement for **{username}**!',
            description: '### {title}\n\n**{username}** released a new update/announcement!\n\n{description}',
            color: '#1b2838',
            footer: 'Social Notifications | Verix'
        },
        kick: {
            title: 'Kick live: **{streamer}**',
            description: '### {title}\n\nWatch the stream now on Kick.',
            color: '#53fc18',
            footer: 'Social Notifications | Verix'
        },
        github: {
            title: 'New GitHub update for **{username}**',
            description: '### {title}\n\n{description}',
            color: '#24292f',
            footer: 'Social Notifications | Verix'
        },
        rss: {
            title: 'New update from **{username}**',
            description: '### {title}\n\n{description}',
            color: '#f97316',
            footer: 'Social Notifications | Verix'
        },
        telegram: {
            title: 'New Telegram post from **{username}**',
            description: '### {title}\n\n{description}',
            color: '#26a5e4',
            footer: 'Social Notifications | Verix'
        },
        default_titles: {
            Twitch: '📡 **{streamer}** is live!',
            YouTube: '🎥 New video from **{streamer}**!',
            Twitter: '𝕏 (Twitter) New post from **{streamer}**',
            Instagram: '📸 New post from **{streamer}**',
            TikTok: '🎵 New TikTok from **{streamer}**',
            Reddit: '👾 New Post on **r/{username}**!',
            Steam: '🎮 New Announcement for **{username}**!'
        },
        default_descriptions: {
            Twitch: '### {title}\n\nHey! **{streamer}** just turned on the camera on Twitch. Don\'t miss the show!\n\n[Join Live]({url})',
            YouTube: '### {title}\n\nA new video just dropped on the channel! Go check it out.',
            Twitter: '{description}',
            Instagram: '### {title}\n\nNew content uploaded to Instagram! Go take a look.',
            TikTok: '### {title}\n\nA new video was just published on TikTok! Watch now.',
            Reddit: '### {title}\n\n**{author}** published a new post on **r/{username}**!\n\n{description}',
            Steam: '### {title}\n\n**{username}** released a new update/announcement!\n\n{description}'
        },
        button_labels: {
            Twitch: 'Watch Live',
            YouTube: 'Watch Video',
            Twitter: 'View on 𝕏',
            X: 'View on 𝕏',
            Instagram: 'View on Instagram',
            TikTok: 'View on TikTok',
            Reddit: 'View on Reddit',
            Steam: 'View on Steam',
            Kick: 'Watch on Kick',
            GitHub: 'View on GitHub',
            RSS: 'Open Feed Item',
            Telegram: 'View on Telegram',
            default: 'Open Link'
        },
        footer: 'Social Notifications | Verix'
    },
    leveling: {
        disabled: {
            title: '📡 Module Disabled',
            description: 'The **Leveling & Rewards** module is currently disabled on this server. Contact staff for more information.',
            color: '#f1c40f'
        },
        rank: {
            title: '✨ Rank Card - {username}',
            level: '📊 Level',
            rank: '🏆 Rank',
            xp: '🧪 XP Progress',
            progress: '📈 Progression',
            messages: '💬 Total Messages',
            daily_limit: '📅 Daily Limit',
            color: '#5865f2'
        },
        leaderboard: {
            title: '🏆 Server Leaderboard',
            empty_title: '⚠️ Leaderboard Empty',
            empty_desc: 'The leaderboard is currently empty. Start messaging to earn XP!',
            entry: '{pos} <@{userId}> • **Lvl {level}** ({xp} XP)',
            footer: 'Your Rank: {rank} | Active Community',
            unranked: 'Unranked',
            color: '#5865f2'
        }
    },
    common: {
        no_reason: 'No reason provided',
        none: 'None',
        loading: 'Loading...',
        error: 'An error occurred.',
        immediately: 'immediately'
    }
};
