/**
 * Default English Messages for all modules.
 * These are used as standard for every server if no override is found in DB.
 */
export default {
    system: {
        no_permission: {
            title: '⚠️ Security Protocol',
            description: 'Sorry, but you don\'t seem to have the necessary permissions to perform this operation. Contact a superior if you believe this is an error.',
            color: '#e74c3c'
        },
        module_disabled: {
            title: '📡 Network Broadcast',
            description: 'The **{module}** module is currently disabled in this district. Please try again later or contact staff.',
            color: '#f1c40f'
        },
        role_hierarchy: {
            title: '⚖️ Status Hierarchy',
            description: 'Cannot assign status **{role}**. Protocols prevent the bot from managing roles equal to or higher than its own in the server hierarchy.',
            color: '#e74c3c'
        },
        generic_error: {
            title: '❌ System Anomaly',
            description: 'An unexpected error occurred while processing data. Technicians have been informed.',
            color: '#e74c3c'
        },
        setup_success: {
            title: '✅ System Initialized',
            description: 'The module has been correctly configured and protocols are now operational.',
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
            title: '❌ Protocol Deactivated',
            description: 'The **{module}** module has been unloaded from the system. All related functions are suspended.',
            color: '#e74c3c'
        },
        module_already_in_state: {
            title: 'ℹ️ State Unchanged',
            description: 'The **{module}** module is already in the state requested by the protocols.',
            color: '#3498db'
        },
        module_not_found: {
            title: '❌ Unknown Subject',
            description: 'The **{module}** module is not registered in our departmental databases.',
            color: '#e74c3c'
        }
    },
    utility: {
        clear_success: {
            title: '🧹 Cleanup Completed',
            description: 'I have deleted **{amount}** messages as requested by protocols.',
            color: '#2ecc71'
        },
        clear_no_messages: {
            title: '⚠️ No Evidence Found',
            description: 'I couldn\'t find any messages matching the specified deletion criteria.',
            color: '#f1c40f'
        },
        clear_error: {
            title: '❌ Remediation Error',
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
        },
        promote_vip_success: {
            title: '💎 VIP Priority',
            description: 'User **{user}** has been moved to the top of the departmental queue.',
            color: '#2ecc71'
        },
        pause_success: {
            title: '⏸️ System Paused',
            description: 'Voice access protocols have been suspended. No new citizens can join the queue.',
            color: '#f1c40f'
        },
        resume_success: {
            title: '▶️ System Reactivated',
            description: 'Voice access protocols have been restored. Offices are now operational again.',
            color: '#2ecc71'
        },
        skip_success: {
            title: '⏭️ Session Skipped',
            description: 'The current session has been forcibly archived. The next citizen in queue will be invited.',
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
        setup_success: {
            title: '✅ Whitelist Configuration',
            description: 'The citizen access system has been configured and the panel has been sent to the indicated channel.',
            color: '#2ecc71'
        },
        edit_menu: {
            title: '✏️ Edit Application',
            description: 'Select the question you wish to correct from the menu below.',
            color: '#3498db'
        },
        edit_success: {
            title: '✅ Answer Updated',
            description: 'Your answer to question **{index}** has been correctly saved.\n\nThe summary in the channel has been updated. Do you wish to modify anything else?',
            color: '#2ecc71'
        },
        edit_closed: {
            title: '✅ Editing Finished',
            description: 'The edit menu has been closed. You can now proceed with the final submission.',
            color: '#2ecc71'
        },
        voice_setup_success: {
            title: '🎙️ Voice Configuration Updated',
            description: 'Voice access protocols have been successfully updated.\n\n**DETAILS:**\n• Mode: `{mode}`\n• Concurrent Limit: `{limit}`\n• VIP Role: `{vip_role}`\n• Staff Pings: `{ping_staff}`',
            color: '#2ecc71'
        },
        questions_list: {
            title: '📋 Whitelist Question Register',
            description: 'Here is the current list of departmental questions:\n\n{questions}',
            color: '#3498db'
        },
        question_added: {
            title: '✅ Question Added',
            description: 'The new question has been correctly inserted into the protocol.\n\n**QUESTION:** {text}\n**MIN CHARACTER LIMIT:** {min_length}',
            color: '#2ecc71'
        },
        question_removed: {
            title: '🗑️ Question Removed',
            description: 'The selected question has been removed from the official register.\n\n**QUESTION:** {text}',
            color: '#e74c3c'
        },
        dashboard_init_success: {
            title: '💻 Whitelist Dashboard Initialized',
            description: 'The web interface for citizen management has been correctly configured.',
            color: '#2ecc71'
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
        },
        submission_confirmed: {
            title: '✅ Dossier Submitted',
            description: 'Your documentation has been correctly sent to the relevant offices. You will be notified of the outcome shortly.',
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
            description: 'You submitted a background too recently. You can submit a new version in {time_left}.\n\nUse this time to perfect your story.',
            color: '#f1c40f'
        },
        upload_success: {
            title: '✅ Attachment Registered',
            description: 'The file has been correctly acquired by the systems.\n\n**DOCUMENT:** [{filename}]({url})',
            color: '#2ecc71'
        },
        error: {
            title: '❌ Background Error',
            description: 'It was not possible to process your request. {reason}',
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
            description: 'You have processed the background request for user **<@{userId}>**.\n\n**OUTCOME:** {status}',
            color: '#2ecc71'
        }
    },
    tickets: {
        panel: {
            title: '🎫 Secretariat: Citizen Counter',
            description: 'Need support or want to report something to staff? Open a support office by selecting the correct department.',
            color: '#2ECC71',
            footer: 'Public Relations Department | Verix RP'
        },
        ticket: {
            title: '📂 Assistive File: {type}',
            description: 'Welcome to the counter, <@{user_id}>. An operator will take care of your request shortly.\n\n**DETAILS:**\n• Priority: `{priority}`\n• Status: `{status}`',
            color: '#2ECC71'
        },
        success_open: {
            title: '✅ Ticket Created',
            description: 'Your support office has been correctly opened.\n\n**CHANNEL:** {channel}',
            color: '#2ecc71'
        },
        close: {
            title: '🔒 Archive: Case Concluded',
            description: 'The documentation for this office has been correctly deposited in the archives.',
            color: '#E74C3C'
        },
        already_exists: {
            title: '⚠️ Pending Protocol',
            description: 'There is already an open case of type **{type}** in your name in channel <#{channelId}>.',
            color: '#f1c40f'
        },
        already_claimed: {
            title: '🙋‍♂️ Report Claimed',
            description: 'This case is already under the supervision of operator **<@{assignedStaffId}>**.',
            color: '#f1c40f'
        },
        staff_claimed: {
            title: '⚙️ Claimed',
            description: 'Operator **{staff}** has taken over this case and will assist you shortly.',
            color: '#3498db'
        },
        status_updated: {
            title: '🔄 Protocol Updated',
            description: 'The case status has been officially set to: **{status}**.',
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
            description: 'It was not possible to archive the case. Make sure all operational protocols have been concluded.',
            color: '#e74c3c'
        },
        default_welcome: {
            title: '🎫 Support Request',
            description: 'Welcome to the support office. A staff member will be here shortly.\n\nReason: **{reason}**',
            color: '#5865F2'
        },
        inactivity_close: {
            title: '⚠️ Inactivity Protocol',
            description: 'This office has been automatically closed by the systems due to lack of recent communication.',
            color: '#e74c3c'
        },
        claim_success: {
            title: '✅ Ticket Claimed',
            description: 'You have correctly assumed supervision of this case.',
            color: '#2ecc71'
        },
        close_success: {
            title: '🔒 Ticket Archived',
            description: 'The case has been closed and records have been saved.',
            color: '#2ecc71'
        },
        priority_select: {
            title: '🎫 Priority Required',
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
            description: 'The bot does not have necessary permissions in the LOGS channel ({channel}).\n\n**Missing:** {missing}',
            color: '#e74c3c'
        },
        close_error_category: {
            title: '❌ Configuration Missing',
            description: 'The category for closed tickets has not been correctly configured in the dashboard.',
            color: '#e74c3c'
        },
        error: {
            title: '❌ Ticket Error',
            description: 'It was not possible to complete the requested operation. Try again or contact an administrator.',
            color: '#e74c3c'
        },
        user_managed: {
            title: '👥 User Management',
            description: 'User **{user}** has been **{action}** from the ticket.',
            color: '#3498db'
        },
        setup_success: {
            title: '🎫 Support Panel Configured',
            description: 'The citizen support portal has been successfully sent.\n\n**CHANNEL:** {channel}',
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
        },
        config_not_found: {
            title: '❌ Missing Configuration',
            description: 'Support protocols have not been correctly initialized for this server. Contact an administrator.',
            color: '#e74c3c'
        },
        category_not_available: {
            title: '❌ Inaccessible Sector',
            description: 'The requested support category is currently unavailable or has been removed from the records.',
            color: '#e74c3c'
        },
        staff_only: {
            title: '⚠️ Access Denied',
            description: 'Only authorized staff officials can use these administrative tools.',
            color: '#f1c40f'
        },
        claim_success: {
            title: '✅ Claimed',
            description: 'You have correctly assumed supervision of this case. The citizen has been informed.',
            color: '#2ecc71'
        },
        claim_already: {
            title: '⚠️ Case Already Assigned',
            description: 'This case is already under the supervision of operator <@{staffId}>.',
            color: '#f1c40f'
        },
        status_update_success: {
            title: '🔄 Status Updated',
            description: 'The case status has been correctly set to: **{status}**.',
            color: '#3498db'
        },
        note_success: {
            title: '📌 Note Archived',
            description: 'Your internal note has been correctly added to the case dossier.',
            color: '#2ecc71'
        },
        close_started: {
            title: '🛡️ Archiving Started',
            description: 'Closing protocols have been activated. The case will be removed or moved shortly.',
            color: '#f1c40f'
        },
        blacklist_error: {
            title: '🚫 Access Interdicted',
            description: 'Your permission to use support services has been revoked for violation of protocols.',
            color: '#000000'
        },
        created_success: {
            title: '✅ Case Opened',
            description: 'Your request has been filed. Go to the counter <#{channelId}> to proceed.',
            color: '#2ecc71'
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
            description: 'Welcome officially among us, {user}! All permissions have been activated.',
            color: '#2ecc71'
        },
        already_verified: {
            title: '⚠️ Protocol Already Executed',
            description: 'Your identity is already confirmed in our **{guild}** databases.',
            color: '#f1c40f'
        },
        dm: {
            title: '🎊 Welcome to the Server',
            description: 'You have successfully verified on **{guild}**. Now you have full access to the server\'s features!',
            color: '#2ecc71'
        },
        staff_log: {
            title: '🛂 Entry Log: New Citizen',
            description: 'A new user has completed verification.\n\n**IDENTITY:** {user}\n**ID:** `{userId}`\n**STATUS:** {role}',
            color: '#2ecc71'
        },
        error: {
            title: '❌ Identification Error',
            description: 'A technical problem occurred while confirming your identity. Please contact a Ministry official or try again later.',
            color: '#e74c3c'
        }
    },
    fivem: {
        status_embed: {
            title: '🏙️ City Status',
            description: 'Real-time information about the FiveM server.\n\n📡 **Server:** {serverName}\n👥 **Citizens:** {players}/{maxPlayers}\n🟢 **Status:** Operational',
            color: '#2ecc71'
        },
        offline_embed: {
            title: '🔴 City Inaccessible',
            description: 'The FiveM server is not responding at the moment. There might be a restart in progress.',
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
            description: 'You have claimed your daily bonus of **${amount}**. Come back tomorrow for the next credit!',
            color: '#f1c40f'
        },
        cooldown: {
            title: '⏳ Waiting Protocol',
            description: 'You have already claimed your prize for today. Banking protocols require a wait of **{time}** before the next credit.',
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
            description: 'The city is looking for unique views. Capture a memorable moment and deposit it in this gallery to participate in the city contest.\n\n**Current Theme:** `{theme}`\n**Duration:** `{duration} hours`\n**Deadline:** {endTime}',
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
            description: 'You have already deposited a work for this contest. Regulations provide for only one participation per citizen.',
            color: '#f1c40f'
        },
        vote_up: {
            title: '👍 Vote Registered',
            description: 'You expressed your appreciation for this work. Your vote has been added to the official count.',
            color: '#2ecc71'
        },
        vote_down: {
            title: '👎 Vote Registered',
            description: 'You registered your dissent for this work. The score has been updated according to protocols.',
            color: '#e74c3c'
        },
        vote_removed: {
            title: '🔄 Vote Retracted',
            description: 'You removed your preference from this work. The count has been updated.',
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
            description: 'City regulations prevent voting for your own artwork. Let others judge your talent!',
            color: '#f1c40f'
        },
        no_participants: {
            title: '😔 Contest Concluded',
            description: 'The photo contest has ended, but unfortunately no valid works were deposited in our archives.',
            color: '#e74c3c'
        },
        no_winners: {
            title: '😔 No Records',
            description: 'There are no registered winners for previous contests in our databases.',
            color: '#f1c40f'
        },
        leaderboard: {
            title: '🏆 Photo Contest Leaderboard',
            description: 'Users with the most wins on the server!\n\n{list}',
            color: '#FFD700',
            thumbnail: 'https://i.imgur.com/89k5I5L.png'
        },
        error: {
            title: '❌ Contest Error',
            description: 'An error occurred while processing photo contest data.',
            color: '#e74c3c'
        },
        no_contest_active: {
            title: '❌ No Contest',
            description: 'There is currently no photo contest in progress. Stay tuned for the next announcement!',
            color: '#e74c3c'
        },
        no_submissions_leaderboard: {
            title: '📊 Empty Leaderboard',
            description: 'There are currently no photos registered in the leaderboard for this contest.',
            color: '#3498db'
        },
        self_vote_error: {
            title: '⚖️ Conflict of Interest',
            description: 'City regulations prevent voting for your own artwork. Let others judge your talent!',
            color: '#f1c40f'
        },
        vote_success_up: {
            title: '👍 Vote Registered',
            description: 'You expressed your appreciation for this photograph. The score has been updated.',
            color: '#2ecc71'
        },
        vote_success_down: {
            title: '👎 Vote Registered',
            description: 'You registered your dissent for this photograph. The score has been updated.',
            color: '#e67e22'
        },
        already_voted_error: {
            title: '⚠️ Vote Protocol',
            description: 'You have already expressed your verdict for this work. Protocols do not allow changing or removing the vote once registered.',
            color: '#f1c40f'
        },
        submission_data_saved: {
            title: '✅ Data Acquired',
            description: 'Information successfully saved! Now send your photo (as an attachment) in this channel within 5 minutes to complete the procedure.',
            color: '#3498db'
        },
        themesList: ['Nature', 'Architecture', 'Sunsets', 'Food', 'Minimalism', 'Cyberpunk', 'Portraits', 'Animals']
    },
    twitch: {
        stream_online: {
            title: '🎥 Live Channel: {streamer}',
            description: 'Tune in now! **{streamer}** has just started a broadcast.\n\n📺 **Title:** {title}\n🎮 **Category:** {game}',
            color: '#a970ff'
        }
    },
    voice: {
        voice_waiting: {
            title: '⏳ Waiting Room: Oral Interview',
            description: 'Your written dossier has been approved! You are now in the waiting list for the oral interview.\n\nAn examiner will contact you as soon as they are available. Stay tuned.',
            color: '#f1c40f'
        },
        voice_guide: {
            title: '🎙️ Oral Interview Guide',
            description: 'You are about to examine user **<@{userId}>**.\n\n**PROCEDURE:**\n1. Move the user to a voice channel.\n2. Verify microphone quality.\n3. Proceed with standard questions.\n4. Use the buttons below to record the final outcome.',
            color: '#3498db'
        },
        voice_staff_log: {
            title: '🎙️ Voice Activity Log',
            description: 'User **{user}** started or ended a voice session with staff.',
            color: '#5865F2'
        },
        voice_error_flow: {
            title: '⚠️ Voice Protocol Error',
            description: 'An error occurred during voice queue management. Please try again in a moment.',
            color: '#e74c3c'
        },
        dm_accepted: {
            title: '✅ Suitability Confirmed',
            description: 'Congratulations citizen! You have successfully passed the oral interview at **{guild}**.',
            color: '#2ecc71'
        },
        dm_rejected: {
            title: '❌ Negative Outcome',
            description: 'Sorry, but your interview evaluation at **{guild}** was not favorable.\n\n**REASON:**\n{reason}\n\nYou can try again in **{cooldown}**.',
            color: '#e74c3c'
        },
        staff_approved: {
            title: '📝 Evaluation Log: APPROVED',
            description: 'User **<@{userId}>** has been declared suitable by **{staff}**.',
            color: '#2ecc71'
        },
        staff_denied: {
            title: '📝 Evaluation Log: REJECTED',
            description: 'User **<@{userId}>** has been rejected by **{staff}**.\n\n**Reason:** {reason}',
            color: '#e74c3c'
        }
    },
    antispam: {
        enabled: false,
        maxMessages: 5,
        timeWindow: 5000,
        deleteSpam: true,
        warnUser: true,
        ignoredRoles: [],
        ignoredChannels: []
    },
    moderation: {
        antispam: {
            enabled: false,
            maxMessages: 5,
            timeWindow: 5000,
        },
        antiFlood: {
            enabled: false,
            maxLines: 10,
            maxCharacters: 500,
            maxEmojis: 10,
        },
        antiLink: {
            enabled: false,
            whitelist: [],
            allowRoles: [],
            allowChannels: [],
        },
        antiInvite: {
            enabled: false,
            allowRoles: [],
            allowChannels: [],
        },
        ghost_ping: {
            title: '👻 Ghost Ping Detected',
            description: 'User **{user}** removed a message containing a mention.\n\n**CHANNEL:** {channel}\n**CONTENT:**\n>>> {content}',
            color: '#ff9900'
        },
        anti_raid: {
            title: '🚨 Anti-Raid Alarm',
            description: 'An unusual influx of new citizens detected!\n\n**DETAILS:** {details}\n**STATUS:** {status}\n**ACTION:** {action}',
            color: '#ff0000'
        },
        antiEveryone: {
            enabled: false,
            action: 'delete',
        },
        ghostPing: {
            enabled: false,
            logInChannel: true,
        },
        antiRaid: {
            enabled: false,
            joinsThreshold: 10,
            timeWindow: 10000,
            action: 'notify',
        },
        warn: {
            title: '🛡️ Recall Protocol',
            description: 'Attention **{user}**, you have received an official recall for violation of civil codes.\n\n**REASON:**\n>>> {reason}',
            color: '#f1c40f',
            footer: 'Disciplinary Office | Verix RP'
        },
        timeout: {
            title: '🔇 Communication Restriction',
            description: 'Citizen **{user}** has been placed in temporary isolation for **{duration}**.\n\n**REASON:**\n>>> {reason}',
            color: '#e67e22'
        },
        kick: {
            title: '👢 Forced Expulsion',
            description: 'You have been removed from the city for serious failure to follow city protocols.\n\n**REASON:**\n>>> {reason}',
            color: '#e74c3c'
        },
        ban: {
            title: '🚫 Permanent Exile',
            description: 'Your visa to reside in the city has been permanently revoked. Access is now denied.\n\n**REASON:**\n>>> {reason}',
            color: '#000000'
        },
        command_ban: {
            title: '🔨 Ban Protocol Executed',
            description: '**SUBJECT:** {user}\n**OFFICIAL:** {mod}\n**REASON:** {reason}',
            color: '#FF0000'
        },
        command_kick: {
            title: '👢 Member Kicked',
            description: '**User:** {user}\n**Moderator:** {mod}\n**Reason:** {reason}',
            color: '#e74c3c'
        },
        error: {
            title: '❌ Moderation Error',
            description: 'It was not possible to perform the requested disciplinary action. Check bot permissions or role hierarchy.',
            color: '#e74c3c'
        }
    },
    support: {
        paused: {
            title: '❌ Service Suspended',
            description: 'Voice support protocols are currently disabled. Please try again later.',
            color: '#e74c3c'
        },
        cooldown: {
            title: '⏳ Cooldown Protocol',
            description: 'You have already requested assistance recently. You must wait before you can open a new office.',
            color: '#f1c40f'
        },
        queueFull: {
            title: '📡 Offices Busy',
            description: 'All support channels are currently busy. You have been placed in the priority waiting system.',
            color: '#3498db'
        },
        sessionStart: {
            title: '✅ Operator Available',
            description: 'An office has been freed for you. You have been relocated to your private support channel.',
            color: '#2ecc71'
        },
        staffLog: {
            title: '🎙️ Support Log',
            description: 'User **{user}** has entered support.\n\n**Channel:** {voice_channel}',
            color: '#f1c40f'
        },
        queue_log: {
            title: '📢 Support Queue: New User',
            description: '{vip_text}A user is waiting for support.\n\n**USER:** {user}\n**ID:** `{user_id}`\n**POSITION:** `{position}`',
            color: '#f1c40f'
        }
    },
    tempvoice: {
        enabled: false,
        channelNameTemplate: '🔊 {user}\'s Room',
        defaultUserLimit: 0,
        not_manageable: {
            title: '❌ Unknown Channel',
            description: 'This channel is not registered as a manageable temporary room in our systems.',
            color: '#e74c3c'
        },
        not_owner: {
            title: '⚠️ Access Denied',
            description: 'Only the original creator of the room can use these management protocols.',
            color: '#f1c40f'
        },
        lock_success: {
            title: '🔒 Room Locked',
            description: 'The room has been closed. No other citizen can connect without authorization.',
            color: '#e67e22'
        },
        unlock_success: {
            title: '🔓 Room Unlocked',
            description: 'Access restrictions have been removed. Anyone can now join the conversation.',
            color: '#2ecc71'
        },
        limit_update: {
            title: '👥 Limit Updated',
            description: 'The maximum capacity of the room has been set to **{limit}** citizens.',
            color: '#3498db'
        },
        rename_success: {
            title: '✅ Name Modified',
            description: 'The channel identification protocol has been updated to: **{name}**.',
            color: '#2ecc71'
        }
    },
    giveaway: {
        enabled: false,
        managerRoles: [],
        no_participants: {
            title: '😔 Giveaway Concluded',
            description: 'The giveaway for **{prize}** has ended, but unfortunately no valid entries were deposited in our archives.',
            color: '#e74c3c'
        },
        winners: {
            title: '🎉 Congratulations Winners!',
            description: 'The protocols have drawn the winners for: **{prize}**!\n\n🏆 **Winners:** {winners}',
            color: '#2ecc71'
        },
        already_ended: {
            title: '⚠️ Giveaway Ended',
            description: 'Sorry, but this giveaway has already ended and it is no longer possible to participate.',
            color: '#f1c40f'
        }
    }
};
