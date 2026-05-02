/**
 * Default English "Human RP" Messages for all modules.
 * Standard for every server if no override is found in DB.
 */
export default {
    system: {
        no_permission: {
            title: '⚠️ Security Protocol',
            description: 'Sorry, you do not seem to have the necessary permissions to perform this operation. Contact a superior if you believe this is an error.',
            color: '#e74c3c'
        },
        module_disabled: {
            title: '📡 Network Communiqué',
            description: 'The **{module}** module is currently disabled in this district. Please try again later or contact staff.',
            color: '#f1c40f'
        },
        role_hierarchy: {
            title: '⚖️ Status Hierarchy',
            description: 'Cannot assign status **{role}**. Protocols prevent the bot from managing roles equal to or higher than its own in the server chart.',
            color: '#e74c3c'
        },
        generic_error: {
            title: '❌ System Anomaly',
            description: 'An unexpected error occurred during data processing. Technicians have been informed.',
            color: '#e74c3c'
        },
        setup_success: {
            title: '✅ System Initialized',
            description: 'The module has been configured correctly and protocols are now operational.',
            color: '#2ecc71'
        },
        module_list: {
            title: '⚙️ Module Organization',
            description: 'List of operational protocols loaded in the system.\n\n{list}',
            color: '#5865f2'
        },
        module_enabled: {
            title: '✅ Protocol Activated',
            description: 'The **{module}** module has been successfully loaded and its protocols are now operational.',
            color: '#2ecc71'
        },
        module_disabled_success: {
            title: '❌ Protocol Disabled',
            description: 'The **{module}** module has been unloaded from the system. All related functions are suspended.',
            color: '#e74c3c'
        },
        module_already_in_state: {
            title: 'ℹ️ State Unchanged',
            description: 'The **{module}** module is already in the state requested by protocols.',
            color: '#3498db'
        },
        module_not_found: {
            title: '❌ Unknown Subject',
            description: 'The **{module}** module is not registered in our ministerial databases.',
            color: '#e74c3c'
        }
    },
    utility: {
        clear_success: {
            title: '🧹 Cleanup Completed',
            description: 'I deleted **{amount}** messages as requested by protocols.',
            color: '#2ecc71'
        },
        clear_no_messages: {
            title: '⚠️ No Findings',
            description: 'I found no messages matching the specified deletion criteria.',
            color: '#f1c40f'
        },
        clear_error: {
            title: '❌ Decontamination Error',
            description: 'An error occurred while deleting messages. Note: I cannot delete messages older than 14 days.',
            color: '#e74c3c'
        },
        ping: {
            title: '🏓 Latency Protocol',
            description: '>>> **Network Status:**\n• Bot Latency: `{latency}ms`\n• API Latency: `{api_latency}ms`',
            color: '#3498db'
        }
    },
    whitelist: {
        panel: {
            title: '🛂 Immigration Office - City Entry',
            description: 'Welcome to the access portal. To reside permanently in the city, you must undergo a civil suitability assessment.\n\nEnsure you answer the protocols submitted to you honestly.',
            color: '#3BA4FF',
            footer: 'Civil Department | Verix RP'
        },
        start: {
            title: '📄 Entry Application: {user_name}',
            description: 'Welcome citizen. To be officially admitted, we must complete your information dossier.\n\n**MINISTERIAL DIRECTIVES:**\n• Answer honestly and in detail.\n• Respect time protocols to avoid application cancellation.',
            color: '#3BA4FF',
            footer: 'Welcome Office | Verix RP'
        },
        question: {
            title: '❓ Interview: Question {current_index} of {total_questions}',
            description: '>>> {question}',
            color: '#3BA4FF'
        },
        review: {
            title: '📋 Final Dossier Validation',
            description: 'Read your institutional declarations carefully. Once confirmed, your application will pass to the Higher Commission for the final verdict.',
            color: '#2ecc71'
        },
        not_configured: {
            title: '⏳ Incomplete Configuration',
            description: 'The procedure for entering the city has not yet been completed by staff. Please be patient a little longer.',
            color: '#f1c40f'
        },
        active_session: {
            title: '📄 Application in Progress',
            description: 'There is already an open dossier in your name in the <#{channelId}> channel. Complete that procedure before starting a new one.',
            color: '#3498db'
        },
        already_submitted: {
            title: '📂 Dossier under Evaluation',
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
            description: 'Your dossier has been opened correctly. Head to the <#{channelId}> channel to start the written interview.',
            color: '#2ecc71'
        },
        session_completed: {
            title: '📝 Interview Transcribed',
            description: 'You have answered all the interview questions. Staff will analyze your application shortly.\n\nCheck your answers above and use the buttons to confirm or cancel submission.',
            color: '#3498db'
        },
        min_length_error: {
            title: '⚠️ Insufficient Details',
            description: 'Your answer must contain at least **{minLength}** characters to be considered valid. Try to explain yourself a bit better.',
            color: '#f1c40f'
        },
        dm_accepted: {
            title: '✅ Suitability Confirmed',
            description: 'Congratulations citizen! Your application for **{guild}** has been approved by the Commission.\n\nYou can now access the official channels and start your experience.',
            color: '#2ecc71'
        },
        dm_rejected: {
            title: '❌ Negative Result',
            description: 'Sorry, but the evaluation of your dossier at **{guild}** did not result in approval.\n\n**REASON:**\n{reason}\n\nYou can try submitting a new application after the cooldown period.',
            color: '#e74c3c'
        },
        dm_voice_rejected: {
            title: '⚠️ Oral Protocol Rejected',
            description: 'You did not pass the oral evaluation at **{guild}**. We invite you to review the city protocols before reapplying.',
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
            description: 'Your application to join **{guild}** has been acquired by our systems.\n\nA Commission member will review it as soon as possible. You will be notified here as soon as there is a result.',
            color: '#3498db'
        },
        submission_confirmed: {
            title: '✅ Dossier Submitted',
            description: 'Your documentation has been sent correctly to the competent offices. You will be notified shortly of the result.',
            color: '#2ecc71'
        },
        voice_procedural_error: {
            title: '❌ Procedural Error',
            description: 'Sorry citizen, but the State does not provide oral interviews for the type of visa you requested.',
            color: '#e74c3c'
        },
        queue_log: {
            title: '📢 Queue Protocol: New Entry',
            description: 'A new citizen is waiting for the interview.\n\n**SUBJECT:** {user}\n**ID:** `{user_id}`\n**CURRENT QUEUE:** `{waiting_count}`',
            color: '#3498db'
        },
        promote_vip_success: {
            title: '💎 VIP Priority',
            description: 'User **{user}** has been moved to the front of the ministerial queue.',
            color: '#2ecc71'
        },
        pause_success: {
            title: '⏸️ System Paused',
            description: 'Voice access protocols have been suspended. No new citizens can join the queue.',
            color: '#f1c40f'
        },
        resume_success: {
            title: '▶️ System Reactivated',
            description: 'Voice access protocols have been restored. Offices are operational again.',
            color: '#2ecc71'
        },
        skip_success: {
            title: '⏭️ Session Skipped',
            description: 'The current session has been forcibly archived. The next citizen in the queue will be invited.',
            color: '#3498db'
        },
        skip_error_no_session: {
            title: '❌ No Session',
            description: 'There are no active sessions to skip at the moment.',
            color: '#e74c3c'
        },
        app_not_found: {
            title: '❌ Application Not Found',
            description: 'The requested dossier is not present in our digital archives.',
            color: '#e74c3c'
        },
        edit_menu: {
            title: '✏️ Correct Application',
            description: 'Select the question you wish to correct from the menu below.',
            color: '#3498db'
        },
        edit_success: {
            title: '✅ Answer Updated',
            description: 'Your answer to question **{index}** has been saved correctly.\n\nThe summary in the channel has been updated. Do you wish to modify anything else?',
            color: '#2ecc71'
        },
        edit_closed: {
            title: '✅ Correction Finished',
            description: 'The edit menu has been closed. You can now proceed with the final submission.',
            color: '#2ecc71'
        },
        voice_setup_success: {
            title: '🎙️ Voice Protocols Updated',
            description: 'Voice access protocols have been successfully updated.\n\n**DETAILS:**\n• Mode: `{mode}`\n• Concurrent Limit: `{limit}`\n• VIP Role: `{vip_role}`\n• Staff Pings: `{ping_staff}`',
            color: '#2ecc71'
        },
        questions_list: {
            title: '📋 Whitelist Questions Register',
            description: 'Here is the current list of ministerial queries:\n\n{questions}',
            color: '#3498db'
        },
        question_added: {
            title: '✅ Question Added',
            description: 'The new query has been correctly inserted into the protocol.\n\n**QUESTION:** {text}\n**MINIMUM CHARACTERS:** {min_length}',
            color: '#2ecc71'
        },
        question_removed: {
            title: '🗑️ Question Removed',
            description: 'The selected query has been removed from the official register.\n\n**QUESTION:** {text}',
            color: '#e74c3c'
        },
        dashboard_init_success: {
            title: '💻 Whitelist Dashboard Initialized',
            description: 'The web interface for citizen management has been configured correctly.',
            color: '#2ecc71'
        }
    },
    background: {
        panel: {
            title: '📜 Historical Archive: Background Deposit',
            description: 'Start writing your character\'s story to get final approval for your background.\n\nClick the button below to start the deposit protocol.',
            color: '#5865f2',
            footer: 'Vital Statistics Office | Verix RP'
        },
        instructions: {
            title: '✍️ Background Drafting',
            description: 'You are starting to draft your background. Ensure you accurately describe your character\'s origins and ambitions.\n\n**REQUIREMENTS:**\n• Consistency with the city setting.\n• Respect for narrative guidelines.',
            color: '#3498db'
        },
        dm_accepted: {
            title: '📜 Background Approved',
            description: 'Your background has been officially deposited in the archives of **{guild}**. Your story is now an integral part of the city.',
            color: '#2ecc71'
        },
        dm_rejected: {
            title: '⚠️ Text Revision Required',
            description: 'Your background proposal for **{guild}** was rejected or requires revisions.\n\n**STAFF NOTES:**\n{reason}',
            color: '#e74c3c'
        },
        staff_received: {
            title: '📑 New Background Received',
            description: 'User **<@{userId}>** sent their background for review.\n\n**INFO:**\n• Link: {bg_link}\n• Desc: {bg_desc}\n• Attachment: {bg_attachment}',
            color: '#3498db'
        },
        submission_confirmed: {
            title: '✅ Dossier Submitted',
            description: 'Your documentation has been sent correctly to the competent offices. You will be notified shortly of the result.',
            color: '#2ecc71'
        },
        session_cancelled: {
            title: '⚠️ Procedure Interrupted',
            description: 'The background deposit has been cancelled. The channel will be removed in **{time}**.',
            color: '#e74c3c'
        },
        dm_received: {
            title: '✅ Background Dossier Received',
            description: 'Your dossier for **{guild}** has been correctly archived in our systems. A commission official will review it shortly.',
            color: '#2ecc71'
        },
        cooldown: {
            title: '⚠️ Cooldown Protocol',
            description: 'You sent a background too recently. You can submit a new version {time_left}.\n\nUse this time to perfect your story.',
            color: '#f1c40f'
        },
        upload_success: {
            title: '✅ Attachment Registered',
            description: 'The file has been correctly acquired by the systems.\n\n**DOCUMENT:** [{filename}]({url})',
            color: '#2ecc71'
        },
        error: {
            title: '❌ Background Error',
            description: 'Could not process your request. {reason}',
            color: '#e74c3c'
        },
        channel_created: {
            title: '✅ Session Started',
            description: 'Your background deposit channel is ready: {channel}',
            color: '#2ecc71'
        },
        active_session: {
            title: '⚠️ Active Protocol',
            description: 'You already have an active background request or one under review.',
            color: '#f1c40f'
        },
        setup_success: {
            title: '📜 Background System Configured',
            description: 'Background deposit protocols are now active.\n\n**PANEL:** {channel}',
            color: '#2ecc71'
        },
        review_success: {
            title: '📝 Review Completed',
            description: 'You have processed the background request for user **<@{userId}>**.\n\n**RESULT:** {status}',
            color: '#2ecc71'
        }
    },
    tickets: {
        panel: {
            title: '🎫 Secretariat: Citizen Desk',
            description: 'Need support or wish to report something to staff? Open a support office by selecting the correct department.',
            color: '#2ECC71',
            footer: 'Public Relations Department | Verix RP'
        },
        ticket: {
            title: '📂 Support File: {type}',
            description: 'Welcome to the desk, <@{user_id}>. An operator will take charge of your request shortly.\n\n**DETAILS:**\n• Priority: `{priority}`\n• Status: `{status}`',
            color: '#2ECC71'
        },
        success_open: {
            title: '✅ Ticket Created',
            description: 'Your support office has been opened correctly.\n\n**CHANNEL:** {channel}',
            color: '#2ecc71'
        },
        close: {
            title: '🔒 Archive: Case Concluded',
            description: 'The documentation for this office has been correctly deposited in the archives.',
            color: '#E74C3C'
        },
        already_exists: {
            title: '⚠️ Pending Protocol',
            description: 'There is already an open case of type **{type}** in your name in the <#{channelId}> channel.',
            color: '#f1c40f'
        },
        already_claimed: {
            title: '🙋‍♂️ Report Taken in Charge',
            description: 'This case is already under the supervision of operator **<@{assignedStaffId}>**.',
            color: '#f1c40f'
        },
        staff_claimed: {
            title: '⚙️ Taken in Charge',
            description: 'Operator **{staff}** has taken over this case and will assist you shortly.',
            color: '#3498db'
        },
        status_updated: {
            title: '🔄 Protocol Updated',
            description: 'The status of the case has been officially set to: **{status}**.',
            color: '#3498db'
        },
        staff_ticket_log: {
            title: '📁 Ticket Archive',
            description: 'A ticket has been closed and archived.\n\n**INFO:**\n• User: {user}\n• Type: `{type}`\n• Staff: {staff}',
            color: '#ff4757'
        },
        close_status: {
            title: '🛡️ Closing in Progress',
            description: 'Archiving protocols have been started. The channel will be removed or moved shortly.',
            color: '#f1c40f'
        },
        cannot_close: {
            title: '⚠️ Closing Denied',
            description: 'The case could not be archived. Ensure all operational protocols have been concluded.',
            color: '#e74c3c'
        },
        default_welcome: {
            title: '🎫 Support Request',
            description: 'Welcome to the support office. A staff member will be here shortly.\n\nReason: **{reason}**',
            color: '#5865F2'
        },
        inactivity_close: {
            title: '⚠️ Inactivity Protocol',
            description: 'This office was automatically closed by systems due to lack of recent communication.',
            color: '#e74c3c'
        },
        claim_success: {
            title: '✅ Ticket Taken in Charge',
            description: 'You have correctly assumed supervision of this case.',
            color: '#2ecc71'
        },
        close_success: {
            title: '🔒 Ticket Archived',
            description: 'The case has been closed and records saved.',
            color: '#2ecc71'
        },
        priority_select: {
            title: '🎫 Priority Requested',
            description: 'Select the urgency level for your case of type **{type}**.',
            color: '#3498db'
        },
        quick_reply_menu: {
            title: '📝 Quick Replies',
            description: 'Select a predefined template to send to the user.',
            color: '#3498db'
        },
        tag_menu: {
            title: '🏷️ Tag Management',
            description: 'Choose a protocol or tag to assign to this case.',
            color: '#3498db'
        },
        close_error_logs: {
            title: '❌ Archiving Error',
            description: 'The bot does not have the necessary permissions in the LOGS channel ({channel}).\n\n**Missing:** {missing}',
            color: '#e74c3c'
        },
        close_error_category: {
            title: '❌ Missing Configuration',
            description: 'The category for closed tickets has not been correctly configured in the dashboard.',
            color: '#e74c3c'
        },
        error: {
            title: '❌ Ticket Error',
            description: 'Could not complete the requested operation. Try again or contact an administrator.',
            color: '#e74c3c'
        },
        user_managed: {
            title: '👥 User Management',
            description: 'User **{user}** was **{action}** from the ticket.',
            color: '#3498db'
        },
        setup_success: {
            title: '🎫 Support Panel Configured',
            description: 'The citizen desk portal has been sent successfully.\n\n**CHANNEL:** {channel}',
            color: '#2ecc71'
        },
        stats_display: {
            title: '📊 Support Statistics',
            description: 'Activity summary for server/operator:\n\n{stats}',
            color: '#3498db'
        },
        typesConfig: {
            supporto: { label: 'General Support', emoji: '🎫', color: '#6366f1', staffRoleIds: [] },
            segnalazione: { label: 'User Report', emoji: '🚨', color: '#ef4444', staffRoleIds: [] },
            donazione: { label: 'Donations', emoji: '💰', color: '#f59e0b', staffRoleIds: [] },
            bug: { label: 'Bug Report', emoji: '🐛', color: '#10b981', staffRoleIds: [] }
        }
    },
    verify: {
        panel: {
            title: '🛡️ Identification Protocol',
            description: 'To access the city, you must confirm your citizen identity. Click the button below to proceed.',
            color: '#3BA4FF'
        },
        success: {
            title: '✅ Identity Confirmed',
            description: 'Great news citizen! Your registration at **{guild}** was successful.',
            color: '#2ecc71'
        },
        success_reply: {
            title: '✅ Registration Completed',
            description: 'Officially welcome among us, {user}! All permissions have been activated.',
            color: '#2ecc71'
        },
        already_verified: {
            title: '⚠️ Protocol Already Executed',
            description: 'Your identity is already confirmed in our **{guild}** databases.',
            color: '#f1c40f'
        },
        dm: {
            title: '🎊 Welcome to the Server',
            description: 'You verified successfully on **{guild}**. You now have full access to server features!',
            color: '#2ecc71'
        },
        staff_log: {
            title: '🛂 Entry Register: New Citizen',
            description: 'A new user has completed verification.\n\n**IDENTITY:** {user}\n**ID:** `{userId}`\n**STATUS:** {role}',
            color: '#2ecc71'
        },
        error: {
            title: '❌ Identification Error',
            description: 'A technical issue occurred while confirming your identity. Please contact a Ministry official or try again later.',
            color: '#e74c3c'
        }
    },
    fivem: {
        status_embed: {
            title: '🏙️ City Status',
            description: 'Real-time information on the FiveM server.\n\n📡 **Server:** {serverName}\n👥 **Citizens:** {players}/{maxPlayers}\n🟢 **Status:** Operational',
            color: '#2ecc71'
        },
        offline_embed: {
            title: '🔴 City Inaccessible',
            description: 'The FiveM server is currently not responding. There may be a restart in progress.',
            color: '#e74c3c'
        }
    },
    welcome: {
        join: {
            title: '✈️ New Arrival in the City',
            description: 'Welcome **{user}** to **{guild}**! We are happy to see you here. Make sure to read the rules.',
            color: '#2ecc71'
        },
        leave: {
            title: '🚗 A Citizen has Left the City',
            description: 'Sorry to see **{user}** leave **{guild}**. We hope to see you back soon.',
            color: '#e74c3c'
        }
    },
    economy: {
        balance: {
            title: '💰 Bank Statement',
            description: 'Dear **{user}**, here is your financial summary:\n\n💵 **Cash:** `${cash}`\n🏦 **Bank:** `${bank}`',
            color: '#2ecc71'
        },
        daily: {
            title: '🎁 Loyalty Bonus',
            description: 'You withdrawn your daily bonus of **${amount}**. Come back tomorrow for the next credit!',
            color: '#f1c40f'
        },
        cooldown: {
            title: '⏳ Waiting Protocol',
            description: 'You have already redeemed your prize for today. Banking protocols require a wait of **{time}** before the next credit.',
            color: '#f1c40f'
        },
        user_not_found: {
            title: '❌ Subject Not Registered',
            description: 'The specified user is not registered in our economic databases.',
            color: '#e74c3c'
        },
        generic_error: {
            title: '❌ Transaction Error',
            description: 'An error occurred during the banking operation. Please try again later.',
            color: '#e74c3c'
        }
    },
    photocontest: {
        panel: {
            title: '🖼️ Art Gallery: Photo Exhibition',
            description: 'The city is looking for unique views. Capture a memorable moment and deposit it in this gallery to participate in the city contest.',
            color: '#F39C12',
            footer: 'Culture Department | Verix RP'
        },
        submission: {
            title: '🎨 New Work Exhibited',
            description: '>>> **Exhibition Details:**\n• Author: {username}\n• Theme: `{theme}`\n• Deadline: {endTime}',
            color: '#3498db'
        },
        already_submitted: {
            title: '⚠️ Participation Protocol',
            description: 'You have already deposited a work for this contest. Regulations allow only one participation per citizen.',
            color: '#f1c40f'
        },
        vote_up: {
            title: '👍 Vote Registered',
            description: 'You expressed your appreciation for this work. Your vote was added to the official count.',
            color: '#2ecc71'
        },
        vote_down: {
            title: '👎 Vote Registered',
            description: 'You registered your dissent for this work. The score was updated according to protocols.',
            color: '#e74c3c'
        },
        vote_removed: {
            title: '🔄 Vote Retracted',
            description: 'You removed your preference from this work. The count was updated.',
            color: '#f1c40f'
        },
        interaction_notify: {
            title: '📸 New Interaction!',
            description: 'Someone just appreciated your work in the contest! Your popularity in the city is growing.',
            color: '#00FF7F'
        },
        entry_not_found: {
            title: '❌ Work Not Found',
            description: 'Sorry, but this photograph seems to have been removed from the exhibition during the voting process.',
            color: '#e74c3c'
        },
        self_vote_error: {
            title: '⚖️ Conflict of Interest',
            description: 'City regulations prevent voting for your own work of art. Let others judge your talent!',
            color: '#f1c40f'
        },
        no_participants: {
            title: '😔 Contest Concluded',
            description: 'The photo contest has ended, but unfortunately no valid works were deposited in our archives.',
            color: '#e74c3c'
        },
        no_winners: {
            title: '😔 No Records',
            description: 'There are no winners registered for previous contests in our databases.',
            color: '#f1c40f'
        },
        leaderboard: {
            title: '🏆 Photo Contest Leaderboard',
            description: 'Users with most wins in the server!\n\n{list}',
            color: '#FFD700',
            thumbnail: 'https://i.imgur.com/89k5I5L.png'
        },
        error: {
            title: '❌ Contest Error',
            description: 'An error occurred during processing of photo contest data.',
            color: '#e74c3c'
        },
        themesList: ['Nature', 'Architecture', 'Sunsets', 'Food', 'Minimalism', 'Cyberpunk', 'Portraits', 'Animals']
    },
    twitch: {
        stream_online: {
            title: '🎥 Channel Live: {streamer}',
            description: 'Tune in now! **{streamer}** has just started a broadcast.\n\n📺 **Title:** {title}\n🎮 **Category:** {game}',
            color: '#a970ff'
        }
    },
    voice: {
        voice_waiting: {
            title: '⏳ Waiting Room: Oral Interview',
            description: 'Your written dossier has been approved! You are now on the waiting list for the oral interview.\n\nAn examiner will contact you as soon as they are available. Stay tuned.',
            color: '#f1c40f'
        },
        voice_guide: {
            title: '🎙️ Oral Interview Guide',
            description: 'You are about to examine user **<@{userId}>**.\n\n**PROCEDURE:**\n1. Move the user to a voice channel.\n2. Check microphone quality.\n3. Proceed with the routine questions.\n4. Use the buttons below to record the final result.',
            color: '#3498db'
        },
        voice_staff_log: {
            title: '🎙️ Voice Activity Log',
            description: 'User **{user}** started or ended a voice session with staff.',
            color: '#5865F2'
        },
        voice_error_flow: {
            title: '⚠️ Voice Protocol Error',
            description: 'An error occurred while managing the voice queue. Try again in a few moments.',
            color: '#e74c3c'
        },
        dm_accepted: {
            title: '✅ Suitability Confirmed',
            description: 'Congratulations citizen! You have successfully passed the oral interview at **{guild}**.',
            color: '#2ecc71'
        },
        dm_rejected: {
            title: '❌ Negative Result',
            description: 'Sorry, but the evaluation of your interview at **{guild}** was not favorable.\n\n**REASON:**\n{reason}\n\nYou can try again in **{cooldown}**.',
            color: '#e74c3c'
        },
        staff_approved: {
            title: '📝 Evaluation Log: APPROVED',
            description: 'User **<@{userId}>** was declared suitable by **{staff}**.',
            color: '#2ecc71'
        },
        staff_denied: {
            title: '📝 Evaluation Log: REJECTED',
            description: 'User **<@{userId}>** was rejected by **{staff}**.\n\n**Reason:** {reason}',
            color: '#e74c3c'
        }
    },
    moderation: {
        warn: {
            title: '⚠️ Official Warning',
            description: '{user}, your behaviors have violated city protocols.\n\n**REASON:** {reason}',
            color: '#f1c40f'
        },
        timeout: {
            title: '🔇 Communications Restriction',
            description: '{user}, you have been placed in isolation for **{duration} minutes**.\n\n**REASON:** {reason}',
            color: '#e67e22'
        },
        dm_kick: {
            title: '👢 Forced Expulsion',
            description: '{user}, you were removed from the city for serious protocol violations.\n\n**REASON:** {reason}',
            color: '#e74c3c'
        },
        dm_ban: {
            title: '🚫 Permanent Exile',
            description: '{user}, you were permanently banned from the city.\n\n**REASON:** {reason}',
            color: '#000000'
        },
        command_ban: {
            title: '🔨 Member Banned',
            description: '**User:** {user}\n**Moderator:** {mod}\n**Reason:** {reason}',
            color: '#FF0000'
        },
        command_kick: {
            title: '👢 Member Expelled',
            description: '**User:** {user}\n**Moderator:** {mod}\n**Reason:** {reason}',
            color: '#e74c3c'
        },
        error: {
            title: '❌ Moderation Error',
            description: 'Could not perform the requested disciplinary action. Check bot permissions or role hierarchy.',
            color: '#e74c3c'
        }
    },
    support: {
        paused: {
            title: '❌ Service Suspended',
            description: 'Voice support protocols are currently disabled. Try again later.',
            color: '#e74c3c'
        },
        cooldown: {
            title: '⏳ Cooldown Protocol',
            description: 'You have already requested assistance recently. You must wait before opening a new office.',
            color: '#f1c40f'
        },
        queueFull: {
            title: '📡 Offices Busy',
            description: 'All support channels are currently busy. You have been placed in the priority waiting system.',
            color: '#3498db'
        },
        sessionStart: {
            title: '✅ Operator Available',
            description: 'An office has been freed for you. You have been reallocated to your private support channel.',
            color: '#2ecc71'
        },
        staffLog: {
            title: '🎙️ Support Register',
            description: 'User **{user}** entered support.\n\n**Channel:** {voice_channel}',
            color: '#f1c40f'
        },
        queue_log: {
            title: '📢 Support Queue: New User',
            description: '{vip_text}A user is waiting for support.\n\n**USER:** {user}\n**ID:** `{user_id}`\n**POSITION:** `{position}`',
            color: '#f1c40f'
        }
    }
};
