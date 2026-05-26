export default {
    "system": {
        "no_permission": {
            "title": "⚠️ Access Denied",
            "description": "You do not have the necessary permissions to perform this operation. Contact an administrator if you believe this is an error.",
            "color": "#e74c3c"
        },
        "module_disabled": {
            "title": "📡 Module Disabled",
            "description": "The **{module}** module is currently disabled on this server. Contact staff for more information.",
            "color": "#f1c40f"
        },
        "role_hierarchy": {
            "title": "⚖️ Role Hierarchy",
            "description": "Cannot assign role **{role}**. The bot cannot manage roles higher than or equal to its own in the server hierarchy.",
            "color": "#e74c3c"
        },
        "generic_error": {
            "title": "❌ System Error",
            "description": "An unexpected error occurred during processing. Technicians have been informed.",
            "color": "#e74c3c"
        },
        "setup_success": {
            "title": "✅ Setup Completed",
            "description": "The module has been correctly configured and is now operational.",
            "color": "#2ecc71"
        },
        "module_list": {
            "title": "⚙️ Module Management",
            "description": "List of modules currently loaded in the system:\n\n{list}",
            "color": "#5865f2"
        },
        "module_enabled": {
            "title": "✅ Module Activated",
            "description": "The **{module}** module has been successfully activated.",
            "color": "#2ecc71"
        },
        "module_disabled_success": {
            "title": "❌ Module Deactivated",
            "description": "The **{module}** module has been removed from the system. All related functions are suspended.",
            "color": "#e74c3c"
        },
        "module_already_in_state": {
            "title": "ℹ️ server Unchanged",
            "description": "The **{module}** module is already in the requested state.",
            "color": "#3498db"
        },
        "module_not_found": {
            "title": "❌ Module Not Found",
            "description": "The **{module}** module is not registered in the system.",
            "color": "#e74c3c"
        }
    },
    "utility": {
        "clear_success": {
            "title": "🧹 Chat Cleanup",
            "description": "Successfully deleted **{amount}** messages.",
            "color": "#2ecc71"
        },
        "clear_no_messages": {
            "title": "⚠️ No Messages Found",
            "description": "No messages were found matching the deletion criteria.",
            "color": "#f1c40f"
        },
        "clear_error": {
            "title": "❌ Cleanup Error",
            "description": "An error occurred during deletion. Note: messages older than 14 days cannot be bulk deleted.",
            "color": "#e74c3c"
        },
        "ping": {
            "title": "🏓 Connection Status",
            "description": ">>> **Latency:**\n• Bot: `{latency}ms`\n• API: `{api_latency}ms`",
            "color": "#3498db"
        }
    },
    "whitelist": {
        "panel": {
            "title": "Server Application",
            "description": "Apply for access to **{guild}**. Staff will review your answers and contact you when a decision is ready.\n\nClick the button below to start.",
            "color": "#3BA4FF",
            "footer": "{guild} Applications"
        },
        "start": {
            "title": "Application Started: {user_name}",
            "description": "Welcome. Please answer each question with clear and useful detail.\n\n**Before you begin**\n- Answer honestly.\n- Keep your replies relevant to the question.\n- Submit before the session expires.",
            "color": "#3BA4FF",
            "footer": "{guild} Applications"
        },
        "question": {
            "title": "Question {current_index} of {total_questions}",
            "description": ">>> {question}",
            "color": "#3BA4FF"
        },
        "review": {
            "title": "Review Your Answers",
            "description": "Check your answers before submitting. Once confirmed, your application will be sent to staff for review.",
            "color": "#2ecc71"
        },
        "not_configured": {
            "title": "Application Not Ready",
            "description": "This application system is not fully configured yet. Please contact staff or try again later.",
            "color": "#f1c40f"
        },
        "active_session": {
            "title": "Application Already Open",
            "description": "You already have an open application in <#{channelId}>. Finish that session before starting another one.",
            "color": "#3498db"
        },
        "already_submitted": {
            "title": "Application Under Review",
            "description": "Your application has already been submitted. Staff will review it and notify you when there is an update.",
            "color": "#3498db"
        },
        "already_passed": {
            "title": "Already Approved",
            "description": "Our records show that you have already been approved for **{guild}**.",
            "color": "#2ecc71"
        },
        "cooldown": {
            "title": "Cooldown Active",
            "description": "You must wait **{time}** before submitting another application.",
            "color": "#e74c3c"
        },
        "start_success": {
            "title": "Application Created",
            "description": "Your private application channel is ready: <#{channelId}>.",
            "color": "#2ecc71"
        },
        "session_completed": {
            "title": "Answers Complete",
            "description": "You answered all questions. Review your answers above, then confirm or cancel the submission.",
            "color": "#3498db"
        },
        "min_length_error": {
            "title": "More Detail Needed",
            "description": "Your answer must contain at least **{minLength}** characters. Please add more detail and try again.",
            "color": "#f1c40f"
        },
        "dm_accepted": {
            "title": "Application Approved",
            "description": "Congratulations {user}! Your application for **{guild}** has been approved.",
            "color": "#2ecc71"
        },
        "dm_rejected": {
            "title": "Application Rejected",
            "description": "Your application for **{guild}** was not approved.\n\n**Reason:**\n>>> {reason}\n\nYou can submit another application after the cooldown expires.",
            "color": "#e74c3c"
        },
        "dm_voice_rejected": {
            "title": "Voice Interview Rejected",
            "description": "Your voice interview for **{guild}** was not approved. Please review the requirements before trying again.",
            "color": "#e74c3c"
        },
        "dm_text_pass": {
            "title": "Written Step Approved",
            "description": "You passed the written step for **{guild}**. Join the configured voice channel when you are ready for the interview.",
            "color": "#f1c40f"
        },
        "staff_received": {
            "title": "New Application Submitted",
            "description": "**{user_name}** submitted an application for review.\n\n**Info**\n- Discord: <@{user_id}>\n- Application ID: `{app_id}`",
            "color": "#3498db"
        },
        "dm_submitted": {
            "title": "Application Received",
            "description": "Your application for **{guild}** has been submitted. Staff will review it soon and notify you when there is an outcome.",
            "color": "#3498db"
        },
        "submission_confirmed": {
            "title": "Application Submitted",
            "description": "Your application was sent to staff. You will be notified when a decision is ready.",
            "color": "#2ecc71"
        },
        "voice_procedural_error": {
            "title": "Voice Interview Unavailable",
            "description": "A voice interview is not available for this application flow.",
            "color": "#e74c3c"
        },
        "queue_log": {
            "title": "New Voice Queue Entry",
            "description": "{user} is waiting for a voice interview.\n\n**User ID:** `{user_id}`\n**Queue size:** `{waiting_count}`",
            "color": "#3498db"
        },
        "already_exists": {
            "title": "Application Already Exists",
            "description": "You already have an active or submitted application.",
            "color": "#f1c40f"
        },
        "app_not_found": {
            "title": "Application Not Found",
            "description": "The requested application could not be found.",
            "color": "#e74c3c"
        },
        "cooldown_error": {
            "title": "Cooldown Active",
            "description": "Please wait **{time}** before submitting another application.",
            "color": "#f1c40f"
        },
        "edit_closed": {
            "title": "Edit Closed",
            "description": "The edit menu has been closed. You can now continue.",
            "color": "#2ecc71"
        },
        "edit_error": {
            "title": "Edit Error",
            "description": "Could not edit your answer. {reason}",
            "color": "#e74c3c"
        },
        "edit_menu": {
            "title": "Edit Application",
            "description": "Select the answer you want to edit from the menu below.",
            "color": "#3498db"
        },
        "edit_success": {
            "title": "Answer Updated",
            "description": "Your answer to question **{index}** was saved successfully.",
            "color": "#2ecc71"
        },
        "promote_vip_success": {
            "title": "Priority Updated",
            "description": "User <@{userId}> was moved to the front of the queue.",
            "color": "#2ecc71"
        },
        "session_cancelled": {
            "title": "Session Cancelled",
            "description": "The session was cancelled. This channel will be removed in **{time}**.",
            "color": "#e74c3c"
        },
        "session_not_found": {
            "title": "Session Not Found",
            "description": "The requested session could not be found.",
            "color": "#e74c3c"
        },
        "setup_success": {
            "title": "Whitelist Configured",
            "description": "The whitelist panel was configured successfully.",
            "color": "#2ecc71"
        },
        "skip_error_no_session": {
            "title": "No Active Session",
            "description": "There is no active voice session to skip.",
            "color": "#e74c3c"
        },
        "skip_success": {
            "title": "Session Skipped",
            "description": "The current voice session was skipped.",
            "color": "#3498db"
        },
        "voice_guide": {
            "title": "Voice Interview Guide",
            "description": "You are reviewing user **<@{userId}>**. Use the controls below to approve or reject the interview.",
            "color": "#3498db"
        },
        "next_step_written": "The next step is to complete the Written Test. When you are ready, click the button below.",
        "next_step_voice": "The next step is to complete the Voice Test. Please wait for a staff member to join you.",
        "written_finish": "Your whitelist process is complete.",
        "start_written": "Start Written Test",
        "bg_story_title": "Character Story of {user}",
        "written_archive_title": "Written Answers of {user}",
        "voice_staff_present": "Staff Present",
        "bg_not_accepted": "Your background has not been approved yet.",
        "written_not_accepted": "Your written application has not been approved yet.",
        "voice_rejection_cooldown": "You must wait {hours} hour(s) before trying another voice interview.",
        "vip_priority": "VIP priority active.",
        "voice_session_start_log": "Voice whitelist session started for {user} in {channel}.",
        "no_written_found": "No written application answers were found.",
        "session_expired_title": "Session Expired",
        "session_expired_desc": "This application session expired and has been closed.",
        "time_expired_title": "Time Expired",
        "time_expired_desc": "The application time limit expired. Please start a new session if needed.",
        "rejection_modal_title": "Application Rejection",
        "rejection_modal_label": "Rejection reason",
        "rejection_modal_placeholder": "Example: answers too short, requirements not met...",
        "approved_title": "Application Approved",
        "rejected_title": "Application Rejected",
        "written_step_approved": "Written Step Approved",
        "approved_by": "Approved by {staff}",
        "rejected_by": "Rejected by {staff}",
        "written_step_approved_by": "Written step approved by {staff}",
        "waiting_voice_interview": "Waiting for voice interview",
        "dm_notification": "DM Notification",
        "bg_link_label": "Background Link",
        "bg_link_value": "[Open Document]({link})",
        "confirm_btn": "Confirm Application",
        "edit_btn": "Edit Answers",
        "cancel_btn": "Cancel Application",
        "close_btn": "Close Menu",
        "done_btn": "Done"
    },
    "background": {
        "panel": {
            "title": "Background Submission",
            "description": "Submit your background information for staff review.\n\nClick the button below to begin.",
            "color": "#5865f2",
            "footer": "{guild} Background Review"
        },
        "instructions": {
            "title": "Background Instructions",
            "description": "Use this channel to prepare and submit your background for review.\n\n**Requirements**\n- Follow the server guidelines.\n- Make sure any document link is accessible to staff.\n- Add enough context for reviewers to understand your submission.",
            "color": "#3498db"
        },
        "modal_title": "Background Details",
        "link_label": "Background Link (e.g. Google Doc)",
        "desc_label": "Short Description (Optional)",
        "desc_placeholder": "Summarize your background submission here...",
        "dm_accepted": {
            "title": "Background Approved",
            "description": "Your background for **{guild}** has been approved.",
            "color": "#2ecc71"
        },
        "dm_rejected": {
            "title": "Background Rejected",
            "description": "Your background for **{guild}** was not approved.\n\n**Staff notes:**\n>>> {reason}",
            "color": "#e74c3c"
        },
        "staff_received": {
            "title": "New Background Submitted",
            "description": "A user submitted a background for review.\n\n**User:** <@{userId}>\n**Link:** [Open Document]({bg_link})\n**Description:** {bg_desc}\n**ID:** `{app_id}`",
            "color": "#3498db"
        },
        "approve_btn": "Approve",
        "deny_btn": "Reject",
        "submit_btn": "Submit",
        "cancel_btn": "Cancel",
        "accepted_title": "Background Approved",
        "rejected_title": "Background Rejected",
        "staff_tag": "Staff Member",
        "subject_tag": "Applicant",
        "outcome_tag": "Staff Outcome",
        "already_exists": {
            "title": "Background Already Submitted",
            "description": "You already have an active background request or one waiting for review.",
            "color": "#f1c40f"
        },
        "channel_created": {
            "title": "Background Session Started",
            "description": "Your background submission channel is ready: {channel}",
            "color": "#2ecc71"
        },
        "cooldown": {
            "title": "Cooldown Active",
            "description": "You submitted a background too recently. You can submit another one {time_left}.",
            "color": "#f1c40f"
        },
        "cooldown_error": {
            "title": "Cooldown Active",
            "description": "Please wait **{time}** before starting a new background submission.",
            "color": "#f1c40f"
        },
        "dm_received": {
            "title": "Background Received",
            "description": "Your background for **{guild}** has been received. Staff will review it soon.",
            "color": "#2ecc71"
        },
        "error": {
            "title": "Background Error",
            "description": "An error occurred while processing the background. {reason}",
            "color": "#e74c3c"
        },
        "session_cancelled": {
            "title": "Session Cancelled",
            "description": "The background submission was cancelled. This channel will be removed in **{time}**.",
            "color": "#e74c3c"
        },
        "submission_success": {
            "title": "Background Submitted",
            "description": "Your background has been submitted successfully. Staff will review it soon.",
            "color": "#2ecc71"
        },
        "upload_success": {
            "title": "Attachment Saved",
            "description": "The file was saved successfully.\n\n**File:** [{filename}]({url})",
            "color": "#2ecc71"
        }
    },
    "staffapps": {
        "panel": {
            "title": "📝 Application Portal",
            "description": "Do you want to submit an application? Click the button below to get started.\n\nMake sure to answer all questions comprehensively.",
            "color": "#a855f7",
            "footer": "Application Portal | {guild}"
        },
        "dm_accepted": {
            "title": "🎊 Application Accepted!",
            "description": "Great news {user}! Your application for {guild} has been approved!",
            "color": "#2ecc71"
        },
        "dm_rejected": {
            "title": "❌ Application Rejected",
            "description": "We are sorry {user}, but your application for {guild} was not approved.\n\n**Reason:**\n>>> {reason}",
            "color": "#ff4757"
        },
        "staff_received": {
            "title": "📩 New Application Received",
            "description": "User **<@{userId}>** has submitted a new application.",
            "color": "#a855f7"
        }
    },
    "tickets": {
        "panel": {
            "title": "🎫 Support Center",
            "description": "Need assistance or want to report an issue? Open a support ticket by selecting the correct category from the menu below.",
            "color": "#2ECC71",
            "footer": "Support Team | {guild}"
        },
        "ticket": {
            "title": "📂 Support Ticket: {type}",
            "description": "Welcome, <@{user_id}>. A staff member will handle your request shortly.",
            "color": "#2ECC71"
        },
        "success_open": {
            "title": "✅ Ticket Created",
            "description": "Your ticket has been successfully opened.\n\n**Channel:** {channel}",
            "color": "#2ecc71"
        },
        "created_success": {
            "title": "✅ Ticket Created",
            "description": "Your ticket has been successfully opened in <#{channelId}>.",
            "color": "#2ecc71"
        },
        "close": {
            "title": "🔒 Ticket Closed",
            "description": "This ticket has been correctly closed and archived.",
            "color": "#E74C3C"
        },
        "close_started": {
            "title": "🔒 Closing in Progress",
            "description": "The ticket is being closed and archived. Please wait...",
            "color": "#e67e22"
        },
        "already_exists": {
            "title": "⚠️ Existing Ticket",
            "description": "You already have an open ticket of type **{type}** in channel <#{channelId}>.",
            "color": "#f1c40f"
        },
        "staff_claimed": {
            "title": "⚙️ Claimed",
            "description": "Staff member **{staff}** has taken over your ticket and will assist you shortly.",
            "color": "#3498db"
        },
        "claim_already": {
            "title": "⚠️ Already Claimed",
            "description": "This ticket has already been claimed by <@{staffId}>.",
            "color": "#f1c40f"
        },
        "status_updated": {
            "title": "🔄 Status Updated",
            "description": "The ticket status has been set to: **{status}**.",
            "color": "#3498db"
        },
        "inactivity_close": {
            "title": "⚠️ Closed for Inactivity",
            "description": "This ticket has been automatically closed due to lack of recent activity.",
            "color": "#e74c3c"
        },
        "default_welcome": {
            "title": "🎫 Assistance Request",
            "description": "Welcome to the support center. A staff member will be here shortly.\n\nReason: **{reason}**",
            "color": "#5865F2"
        },
        "priority_select": {
            "title": "⚡ Priority Selection",
            "description": "Please select the priority level for this ticket before proceeding.",
            "color": "#f1c40f"
        },
        "quick_reply_menu": {
            "title": "📝 Quick Replies",
            "description": "Select a response template to send in the ticket.",
            "color": "#3498db"
        },
        "tag_menu": {
            "title": "🏷️ Tag Management",
            "description": "Select a tag to add or remove from this ticket.",
            "color": "#3498db"
        },
        "staff_only": {
            "title": "⚠️ Restricted Access",
            "description": "Sorry, but only staff members can use these management features.",
            "color": "#e74c3c"
        },
        "blacklist_error": {
            "title": "🚫 Access Denied",
            "description": "Your account has been blacklisted from the ticket system. You cannot open new requests.",
            "color": "#e74c3c"
        },
        "note_success": {
            "title": "✅ Note Added",
            "description": "The internal note has been successfully recorded in the ticket database.",
            "color": "#2ecc71"
        },
        "config_not_found": {
            "title": "❌ Configuration Missing",
            "description": "The ticket system has not been configured for this server yet. Contact administrators.",
            "color": "#e74c3c"
        },
        "category_not_available": {
            "title": "❌ Category Not Available",
            "description": "The selected category is no longer available or has been removed by staff.",
            "color": "#e74c3c"
        },
        "staff_ticket_log": {
            "title": "📂 Closed Ticket Log",
            "description": ">>> **User:** {user}\n**Type:** `{type}`\n**Staff:** {staff}",
            "color": "#3498db"
        },
        "intelligence": {
            "title": "🔍 Intelligence: {user}",
            "prev_tickets": "🎫 Previous Tickets",
            "sessions_closed": "`{count}` closed sessions",
            "whitelist": "📋 Whitelist",
            "status": "Status: `{status}`",
            "no_app": "No application",
            "last_wl": "📅 Last Whitelist",
            "background": "📖 Background",
            "no_application": "No applications",
            "footer": "Staff Intelligence Module",
            "field_name": "🔍 User Intelligence"
        },
        "system_messages": {
            "priority_placeholder": "Select priority...",
            "priority_normal": "Normal",
            "priority_important": "Important",
            "priority_urgent": "Urgent",
            "claim_btn": "Claim",
            "close_btn": "Close",
            "quick_reply_btn": "Quick Replies",
            "note_btn": "Note",
            "status_placeholder": "Change status...",
            "status_processing": "Processing",
            "status_waiting": "Waiting (User)",
            "note_modal_title": "Add Internal Note",
            "note_input_label": "Note content",
            "note_input_placeholder": "Write a note visible only to staff...",
            "report_modal_title": "Report Form",
            "report_subject_label": "Subject",
            "report_desc_label": "Description",
            "no_quick_replies": "❌ No quick replies configured.",
            "quick_reply_placeholder": "Choose a template...",
            "tag_placeholder": "Select a tag...",
            "claim_success": "✅ Ticket claimed successfully.",
            "status_updated_msg": "✅ Ticket status updated to: **{status}**",
            "assigned_staff_label": "👤 Assigned Staff",
            "internal_notes_label": "📝 Internal Notes",
            "waiting_staff": "_Waiting..._",
            "none": "_None_",
            "new_ticket_ping": "{ping} - New **{type}** ticket opened.",
            "cooldown": "⚠️ **HIGH TRAFFIC:** Wait a few minutes before opening a new ticket.",
            "already_exists": "❌ **ERROR:** You already have a **{type}** ticket open.",
            "success_open": "✅ **TICKET OPENED:** Go to channel {channel}.",
            "success_close": "🛡️ **ARCHIVING IN PROGRESS...**",
            "staff_claimed": "✅ **{staff}** has claimed the ticket.",
            "claim_already": "❌ This ticket has already been claimed by <@{staffId}>.",
            "staff_only": "⚠️ Restricted access for staff members only.",
            "blacklist_error": "🚫 You have been blacklisted from the ticket system."
        },
        "claim_success": {
            "title": "Ticket Claimed",
            "description": "You claimed this ticket successfully.",
            "color": "#2ecc71"
        },
        "error": {
            "title": "Ticket Error",
            "description": "Could not complete the requested ticket action. {reason}",
            "color": "#e74c3c"
        },
        "generic_error": {
            "title": "Ticket Error",
            "description": "Could not complete the requested ticket action. {reason}",
            "color": "#e74c3c"
        },
        "status_updated_msg": {
            "title": "Status Updated",
            "description": "Ticket status updated to **{status}**.",
            "color": "#2ecc71"
        },
        "user_managed": {
            "title": "Ticket Member Updated",
            "description": "User **{user}** was **{action}** from the ticket.",
            "color": "#3498db"
        }
    },
    "verify": {
        "panel": {
            "title": "🛡️ Account Verification",
            "description": "To access the server channels, you must verify your identity. Click the button below to proceed.",
            "color": "#3BA4FF",
            "footer": "Security System | {guild}"
        },
        "success": {
            "title": "✅ Verification Completed",
            "description": "Welcome! Your verification on **{guild}** was successful. You now have access to all channels.",
            "color": "#2ecc71"
        },
        "already_verified": {
            "title": "⚠️ Already Verified",
            "description": "Your identity is already verified in the **{guild}** database.",
            "color": "#f1c40f"
        },
        "dm": {
            "title": "🎊 Welcome to the Server",
            "description": "You have successfully verified on **{guild}**. Enjoy your stay and have fun!",
            "color": "#2ecc71"
        },
        "staff_log": {
            "title": "🛂 Verification Log: New Member",
            "description": "A new user has completed verification.\n\n**User:** {user}\n**ID:** `{userId}`",
            "color": "#2ecc71"
        },
        "error": {
            "title": "Verification Error",
            "description": "A technical issue occurred while verifying your account. Please try again later or contact staff.",
            "color": "#e74c3c"
        },
        "role_not_found": {
            "title": "Verification Role Missing",
            "description": "The verification role is no longer available. Please contact staff.",
            "color": "#e74c3c"
        },
        "success_reply": {
            "title": "Verification Complete",
            "description": "Welcome {user}! Your permissions have been updated.",
            "color": "#2ecc71"
        }
    },
    "fivem": {
        "status_embed": {
            "title": "🏙️ City Status: Online",
            "description": "The heart of the metropolis is active. Members are invited to connect and start their day.\n\n📡 **Server:** `{serverName}`\n👥 **Members in City:** `{players}/{maxPlayers}`\n🟢 **Status:** Operational",
            "color": "#2ecc71",
            "footer": "Urban Monitoring | Verix RP"
        },
        "offline_embed": {
            "title": "🔴 City Status: Offline",
            "description": "Attention members. Connection to the metropolis has been interrupted. Technicians are working to restore access protocols.\n\n⚠️ **Status:** Inaccessible / Maintenance",
            "color": "#e74c3c",
            "footer": "Urban Emergency | Verix RP"
        }
    },
    "welcome": {
        "join": {
            "title": "👋 Welcome to the Server!",
            "description": "Hello **{user}**, welcome to **{guild}**! We are happy to have you with us.\n\nMake sure to read the rules for a pleasant stay.",
            "color": "#2ecc71"
        },
        "leave": {
            "title": "👋 Goodbye!",
            "description": "**{user}** has left the server. We hope to see you again soon!",
            "color": "#e74c3c"
        }
    },
    "voice": {
        "control_panel": {
            "title": "🎙️ Voice Control Panel",
            "description": "Welcome <@{user}>! This is your temporary channel.\nUse the buttons below to manage it quickly.",
            "color": "#5865F2"
        },
        "status_none": "None",
        "owner_field": "👑 Owner",
        "limit_field": "👥 Limit",
        "dm_accepted": {
            "title": "Voice Interview Approved",
            "description": "Congratulations {user}! Your voice interview for **{guild}** was approved.",
            "color": "#2ecc71"
        },
        "dm_rejected": {
            "title": "Voice Interview Rejected",
            "description": "Your voice interview for **{guild}** was not approved.\n\n**Reason:** {reason}",
            "color": "#e74c3c"
        },
        "staff_approved": {
            "title": "Voice Review Approved",
            "description": "User **<@{userId}>** was approved by **{staff}**.",
            "color": "#2ecc71"
        },
        "staff_denied": {
            "title": "Voice Review Rejected",
            "description": "User **<@{userId}>** was rejected by **{staff}**.\n\n**Reason:** {reason}",
            "color": "#e74c3c"
        },
        "rejection_modal_title": "Voice Interview Rejection",
        "rejection_modal_label": "Rejection reason"
    },
    "moderation": {
        "no_reason": "No reason provided",
        "result": "Result",
        "reason": "Reason",
        "next_step": "Next Step",
        "sent": "Sent",
        "error": {
            "title": "❌ Moderation Error",
            "description": "An error occurred while executing the command.",
            "color": "#e74c3c"
        },
        "command_ban": {
            "title": "✅ Ban Executed",
            "description": "User **{user}** has been successfully banned.\n\n**Reason:** {reason}",
            "color": "#2ecc71"
        },
        "warn": {
            "title": "🛡️ Official Warning",
            "description": "Attention **{user}**, you have received an official warning for violating the rules.\n\n**Reason:**\n>>> {reason}",
            "color": "#f1c40f",
            "footer": "Moderation | {guild}"
        },
        "timeout": {
            "title": "🔇 Temporary Timeout",
            "description": "User **{user}** has been temporarily muted for **{duration}**.\n\n**Reason:**\n>>> {reason}",
            "color": "#e67e22"
        },
        "kick": {
            "title": "👢 Kicked from Server",
            "description": "You have been kicked from the server for violating the rules.\n\n**Reason:**\n>>> {reason}",
            "color": "#e74c3c"
        },
        "ban": {
            "title": "🚫 Permanent Ban",
            "description": "Your access to this server has been permanently revoked.\n\n**Reason:**\n>>> {reason}",
            "color": "#000000"
        },
        "anti_raid": {
            "title": "Anti-Raid Action",
            "description": "A suspicious account joined and was handled by the anti-raid system.\n\n**User:** {user}\n**Reason:** {reason}",
            "color": "#e74c3c"
        },
        "command_kick": {
            "title": "Kick Executed",
            "description": "**User:** {user}\n**Moderator:** {mod}\n**Reason:** {reason}",
            "color": "#e74c3c"
        },
        "dm_kick": {
            "title": "Removed from Server",
            "description": "You were removed from **{guild}**.\n\n**Reason:** {reason}",
            "color": "#e74c3c"
        },
        "dm_ban": {
            "title": "Banned from Server",
            "description": "You were banned from **{guild}**.\n\n**Reason:** {reason}",
            "color": "#000000"
        },
        "ghost_ping": {
            "title": "Ghost Ping Detected",
            "description": "**User:** {user}\n**Channel:** {channel}\n\nDeleted message contained a mention.",
            "color": "#f59e0b"
        }
    },
    "giveaway": {
        "no_participants": {
            "title": "😔 Giveaway Ended",
            "description": "The giveaway for **{prize}** ended with no valid participants.",
            "color": "#e74c3c"
        },
        "winners": {
            "title": "🎉 Giveaway Winners!",
            "description": "The giveaway for **{prize}** has concluded!\n\n🏆 **Winners:** {winners}",
            "color": "#2ecc71"
        },
        "already_ended": {
            "title": "⚠️ Giveaway Already Ended",
            "description": "Sorry, this giveaway has already concluded.",
            "color": "#f1c40f"
        },
        "level_required": {
            "title": "🛡️ Level Requirement Unmet",
            "description": "You must be at least **Level {minLevel}** to join this giveaway!\nYour current level is **Level {currentLevel}**.",
            "color": "#e74c3c"
        }
    },
    "photocontest": {
        "panel": {
            "title": "📸 Photo Contest",
            "description": "Participate in our photo contest! Upload your best photo following the current theme.\n\n**Theme:** `{theme}`\n**Deadline:** {endTime}",
            "color": "#F39C12"
        },
        "submission": {
            "title": "🎨 Work by {username}",
            "description": "A new photo has been uploaded for the contest.\n\n**Theme:** `{theme}`\n**Deadline:** {endTime}",
            "color": "#3498db"
        },
        "already_submitted": {
            "title": "Already Submitted",
            "description": "You have already submitted a photo for this contest.",
            "color": "#f1c40f"
        },
        "already_voted_error": {
            "title": "Vote Already Registered",
            "description": "You have already voted on this submission.",
            "color": "#f1c40f"
        },
        "contest_end_log": {
            "title": "Photo Contest Ended",
            "description": "The contest has ended.\n\n**Winner:** {winner}\n**Score:** {score}",
            "color": "#F39C12"
        },
        "entry_not_found_error": {
            "title": "Submission Not Found",
            "description": "This submission could not be found. It may have been removed.",
            "color": "#e74c3c"
        },
        "error": {
            "title": "Photo Contest Error",
            "description": "Something went wrong while processing the photo contest action.",
            "color": "#e74c3c"
        },
        "error_no_participants": {
            "title": "No Participants",
            "description": "The photo contest ended without valid submissions.",
            "color": "#e74c3c"
        },
        "interaction_notify": {
            "title": "New Contest Interaction",
            "description": "Someone interacted with your photo contest submission.",
            "color": "#2ecc71"
        },
        "leaderboard": {
            "title": "Photo Contest Leaderboard",
            "description": "{list}",
            "color": "#F39C12"
        },
        "leaderboard_display": {
            "title": "Photo Contest Leaderboard",
            "description": "{leaderboard}",
            "color": "#F39C12"
        },
        "leaderboard_error": {
            "title": "Leaderboard Error",
            "description": "Could not load the photo contest leaderboard.",
            "color": "#e74c3c"
        },
        "no_contest_active": {
            "title": "No Active Contest",
            "description": "There is no active photo contest right now.",
            "color": "#f1c40f"
        },
        "no_submissions_leaderboard": {
            "title": "No Submissions",
            "description": "There are no submissions to show yet.",
            "color": "#f1c40f"
        },
        "no_winners": {
            "title": "No Winners Yet",
            "description": "There are no previous winners recorded yet.",
            "color": "#f1c40f"
        },
        "self_vote_error": {
            "title": "Vote Not Allowed",
            "description": "You cannot vote for your own submission.",
            "color": "#f1c40f"
        },
        "submission_data_saved": {
            "title": "Submission Saved",
            "description": "Your submission data was saved successfully.",
            "color": "#2ecc71"
        },
        "vote_success_down": {
            "title": "Vote Registered",
            "description": "Your downvote was registered.",
            "color": "#e74c3c"
        },
        "vote_success_up": {
            "title": "Vote Registered",
            "description": "Your upvote was registered.",
            "color": "#2ecc71"
        }
    },
    "logs": {
        "message_deleted": {
            "title": "🗑️ Message Deleted",
            "author": "Author",
            "channel": "Channel",
            "content": "Content",
            "no_text": "*No text (maybe an embed or file)*",
            "color": "#e74c3c"
        },
        "message_updated": {
            "title": "📝 Message Updated",
            "author": "Author",
            "channel": "Channel",
            "before": "Before",
            "after": "After",
            "color": "#3498db"
        }
    },
    "admin": {
        "embed_editor": {
            "title": "🛠️ Embed Editor",
            "description": "You are editing a default message. Use the buttons to change fields.",
            "color": "#F1C40F"
        }
    },
    "socials": {
        "twitch": {
            "title": "📡 **{streamer}** is live!",
            "description": "### {title}\n\nHey! **{streamer}** just turned on the camera on Twitch. Don't miss the show!\n\n[Join Live]({url})",
            "color": "#6441a5",
            "footer": "Social Notifications | Verix"
        },
        "youtube": {
            "title": "🎥 New video from **{streamer}**!",
            "description": "### {title}\n\nA new video just dropped on the channel! Go check it out.",
            "color": "#ff0000",
            "footer": "Social Notifications | Verix"
        },
        "twitter": {
            "title": "𝕏 (Twitter) New post from **{streamer}**",
            "description": "{description}",
            "color": "#000000",
            "footer": "Social Notifications | Verix"
        },
        "instagram": {
            "title": "📸 New post from **{streamer}**",
            "description": "### {title}\n\nNew content uploaded to Instagram! Go take a look.",
            "color": "#e1306c",
            "footer": "Social Notifications | Verix"
        },
        "tiktok": {
            "title": "🎵 New TikTok from **{streamer}**",
            "description": "### {title}\n\nA new video was just published on TikTok! Watch now.",
            "color": "#000000",
            "footer": "Social Notifications | Verix"
        },
        "reddit": {
            "title": "👾 New Post on **r/{username}**!",
            "description": "### {title}\n\n**{author}** published a new post on **r/{username}**!\n\n{description}",
            "color": "#ff4500",
            "footer": "Social Notifications | Verix"
        },
        "steam": {
            "title": "🎮 New Announcement for **{username}**!",
            "description": "### {title}\n\n**{username}** released a new update/announcement!\n\n{description}",
            "color": "#1b2838",
            "footer": "Social Notifications | Verix"
        },
        "kick": {
            "title": "Kick live: **{streamer}**",
            "description": "### {title}\n\nWatch the stream now on Kick.",
            "color": "#53fc18",
            "footer": "Social Notifications | Verix"
        },
        "github": {
            "title": "New GitHub update for **{username}**",
            "description": "### {title}\n\n{description}",
            "color": "#24292f",
            "footer": "Social Notifications | Verix"
        },
        "rss": {
            "title": "New update from **{username}**",
            "description": "### {title}\n\n{description}",
            "color": "#f97316",
            "footer": "Social Notifications | Verix"
        },
        "telegram": {
            "title": "New Telegram post from **{username}**",
            "description": "### {title}\n\n{description}",
            "color": "#26a5e4",
            "footer": "Social Notifications | Verix"
        },
        "default_titles": {
            "Twitch": "📡 **{streamer}** is live!",
            "YouTube": "🎥 New video from **{streamer}**!",
            "Twitter": "𝕏 (Twitter) New post from **{streamer}**",
            "Instagram": "📸 New post from **{streamer}**",
            "TikTok": "🎵 New TikTok from **{streamer}**",
            "Reddit": "👾 New Post on **r/{username}**!",
            "Steam": "🎮 New Announcement for **{username}**!"
        },
        "default_descriptions": {
            "Twitch": "### {title}\n\nHey! **{streamer}** just turned on the camera on Twitch. Don't miss the show!\n\n[Join Live]({url})",
            "YouTube": "### {title}\n\nA new video just dropped on the channel! Go check it out.",
            "Twitter": "{description}",
            "Instagram": "### {title}\n\nNew content uploaded to Instagram! Go take a look.",
            "TikTok": "### {title}\n\nA new video was just published on TikTok! Watch now.",
            "Reddit": "### {title}\n\n**{author}** published a new post on **r/{username}**!\n\n{description}",
            "Steam": "### {title}\n\n**{username}** released a new update/announcement!\n\n{description}"
        },
        "button_labels": {
            "Twitch": "Watch Live",
            "YouTube": "Watch Video",
            "Twitter": "View on 𝕏",
            "X": "View on 𝕏",
            "Instagram": "View on Instagram",
            "TikTok": "View on TikTok",
            "Reddit": "View on Reddit",
            "Steam": "View on Steam",
            "Kick": "Watch on Kick",
            "GitHub": "View on GitHub",
            "RSS": "Open Feed Item",
            "Telegram": "View on Telegram",
            "default": "Open Link"
        },
        "footer": "Social Notifications | Verix"
    },
    "leveling": {
        "disabled": {
            "title": "📡 Module Disabled",
            "description": "The **Leveling & Rewards** module is currently disabled on this server. Contact staff for more information.",
            "color": "#f1c40f"
        },
        "rank": {
            "title": "✨ Rank Card - {username}",
            "level": "📊 Level",
            "rank": "🏆 Rank",
            "xp": "🧪 XP Progress",
            "progress": "📈 Progression",
            "messages": "💬 Total Messages",
            "daily_limit": "📅 Daily Limit",
            "color": "#5865f2"
        },
        "leaderboard": {
            "title": "🏆 Server Leaderboard",
            "empty_title": "⚠️ Leaderboard Empty",
            "empty_desc": "The leaderboard is currently empty. Start messaging to earn XP!",
            "entry": "{pos} <@{userId}> • **Lvl {level}** ({xp} XP)",
            "footer": "Your Rank: {rank} | Active Community",
            "unranked": "Unranked",
            "color": "#5865f2"
        }
    },
    "poll": {
        "ended": {
            "title": "Poll Closed",
            "description": "This poll has already ended.",
            "color": "#f1c40f"
        },
        "invalid_option": {
            "title": "Invalid Poll Option",
            "description": "This poll option is no longer available.",
            "color": "#e74c3c"
        },
        "vote_removed": {
            "title": "Vote Removed",
            "description": "Your vote was removed successfully.",
            "color": "#2ecc71"
        },
        "vote_recorded": {
            "title": "Vote Recorded",
            "description": "Your vote was registered successfully.",
            "color": "#2ecc71"
        }
    },
    "reactionroles": {
        "role_not_found": {
            "title": "Role Not Found",
            "description": "The configured role no longer exists. Please contact an administrator.",
            "color": "#e74c3c"
        },
        "role_removed": {
            "title": "Role Removed",
            "description": "Role **{role}** removed successfully.",
            "color": "#2ecc71"
        },
        "role_assigned": {
            "title": "Role Assigned",
            "description": "Role **{role}** assigned successfully.",
            "color": "#2ecc71"
        },
        "update_error": {
            "title": "Role Update Failed",
            "description": "Unable to update the role. Check the bot permissions and role hierarchy.",
            "color": "#e74c3c"
        }
    },
    "common": {
        "no_reason": "No reason provided",
        "result": "Result",
        "reason": "Reason",
        "next_step": "Next Step",
        "sent": "Sent",
        "none": "None",
        "loading": "Loading...",
        "error": "An error occurred.",
        "immediately": "immediately",
        "start_time": "Start Time",
        "reset_timer": "Reset Timer",
        "antispam": "Please wait before trying again.",
    },
    "support": {
        "paused_reason": "The voice queue is currently paused.",
        "queue_log": {
            "title": "Support Queue",
            "description": "{vip_text}A user is waiting for support.\n\n**User:** {user}\n**ID:** `{user_id}`\n**Position:** `{position}`",
            "color": "#f1c40f"
        },
        "staffLog": {
            "title": "Support Session",
            "description": "User **{user}** entered support.\n\n**Channel:** {voice_channel}",
            "color": "#f1c40f"
        }
    },
    "tempvoice": {
        "not_manageable": {
            "title": "Voice Channel Not Managed",
            "description": "This temporary voice channel is not managed by Verix.",
            "color": "#e74c3c"
        },
        "not_owner": {
            "title": "Not Channel Owner",
            "description": "Only the temporary channel owner can use this control.",
            "color": "#e74c3c"
        },
        "lock_success": {
            "title": "Channel Locked",
            "description": "Your temporary voice channel has been locked.",
            "color": "#2ecc71"
        },
        "unlock_success": {
            "title": "Channel Unlocked",
            "description": "Your temporary voice channel has been unlocked.",
            "color": "#2ecc71"
        },
        "limit_update": {
            "title": "User Limit Updated",
            "description": "The user limit is now set to **{limit}**.",
            "color": "#2ecc71"
        },
        "rename_success": {
            "title": "Channel Renamed",
            "description": "The channel name was updated to **{name}**.",
            "color": "#2ecc71"
        }
    }
};
