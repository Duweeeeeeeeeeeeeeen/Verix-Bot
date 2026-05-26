/**
 * Default Professional Messages for all modules (English).
 * These are used as standard for every server if no override is found in DB.
 */
export default {
    system: {
        no_permission: {
            title: '⚠️ Acceso Denegado',
            description: 'No tienes los permisos necesarios para realizar esta operación. Contacta a un administrador si crees que es un error.',
            color: '#e74c3c'
        },
        module_disabled: {
            title: '📡 Módulo Desactivado',
            description: 'El módulo **{module}** está actualmente desactivado en este servidor. Contacta al staff para más información.',
            color: '#f1c40f'
        },
        role_hierarchy: {
            title: '⚖️ Jerarquía de Roles',
            description: 'No se puede asignar el rol **{role}**. El bot no puede gestionar roles iguales o superiores al suyo en la jerarquía del servidor.',
            color: '#e74c3c'
        },
        generic_error: {
            title: '❌ Error del Sistema',
            description: 'Ha ocurrido un error inesperado durante el procesamiento. Los técnicos han sido informados.',
            color: '#e74c3c'
        },
        setup_success: {
            title: '✅ Configuración Completada',
            description: 'El módulo ha sido configurado correctamente y ya está operativo.',
            color: '#2ecc71'
        },
        module_list: {
            title: '⚙️ Gestión de Módulos',
            description: 'Lista de módulos actualmente cargados en el sistema:\n\n{list}',
            color: '#5865f2'
        },
        module_enabled: {
            title: '✅ Módulo Activado',
            description: 'El módulo **{module}** ha sido activado con éxito.',
            color: '#2ecc71'
        },
        module_disabled_success: {
            title: '❌ Módulo Desactivado',
            description: 'El módulo **{module}** ha sido eliminado del sistema. Todas las funciones relacionadas están suspendidas.',
            color: '#e74c3c'
        },
        module_already_in_state: {
            title: 'ℹ️ Estado Sin Cambios',
            description: 'El módulo **{module}** ya se encuentra en el estado solicitado.',
            color: '#3498db'
        },
        module_not_found: {
            title: '❌ Módulo No Encontrado',
            description: 'El módulo **{module}** no está registrado en el sistema.',
            color: '#e74c3c'
        }
    },
    utility: {
        clear_success: {
            title: '🧹 Limpieza de Chat',
            description: 'Se han eliminado con éxito **{amount}** mensajes.',
            color: '#2ecc71'
        },
        clear_no_messages: {
            title: '⚠️ Sin Mensajes',
            description: 'No se encontraron mensajes que coincidan con los criterios de eliminación.',
            color: '#f1c40f'
        },
        clear_error: {
            title: '❌ Error de Limpieza',
            description: 'Ocurrió un error durante la eliminación. Nota: los mensajes de más de 14 días no pueden borrarse en bloque.',
            color: '#e74c3c'
        },
        ping: {
            title: '🏓 Estado de Conexión',
            description: '>>> **Latencia:**\n• Bot: `{latency}ms`\n• API: `{api_latency}ms`',
            color: '#3498db'
        }
    },
    whitelist: {
        panel: {
            title: '📋 Sistema de Solicitudes',
            description: 'Bienvenido al portal de acceso. Para obtener acceso completo o solicitar un rol específico, debes completar el formulario de solicitud.\n\nAsegúrate de responder con sinceridad a las preguntas que se te presenten.',
            color: '#3BA4FF',
            footer: 'Gestión de Solicitudes | {guild}'
        },
        start: {
            title: '📄 Nueva Solicitud: {user_name}',
            description: 'Bienvenido. Para proceder con tu solicitud, debemos recopilar cierta información necesaria para la evaluación.\n\n**INSTRUCCIONES:**\n• Responde con sinceridad y con gran detalle.\n• Respeta los protocolos de tiempo para evitar la cancelación de la sesión.',
            color: '#3BA4FF',
            footer: 'Oficina de Evaluación | {guild}'
        },
        question: {
            title: '❓ Pregunta: {current_index} de {total_questions}',
            description: '>>> {question}',
            color: '#3BA4FF'
        },
        review: {
            title: '📋 Revisión Final',
            description: 'Revisa cuidadosamente tus declaraciones. Una vez confirmada, tu solicitud pasará al staff para el veredicto final.',
            color: '#2ecc71'
        },
        not_configured: {
            title: '⏳ Configuración Incompleta',
            description: 'El procedimiento de solicitud aún no ha sido finalizado por el staff. Por favor, inténtalo de nuevo más tarde.',
            color: '#f1c40f'
        },
        active_session: {
            title: '📄 Sesión en Curso',
            description: 'Ya hay una sesión de solicitud abierta a tu nombre en el canal <#{channelId}>. Concluye ese procedimiento antes de iniciar uno nuevo.',
            color: '#3498db'
        },
        already_submitted: {
            title: '📂 En Evaluación',
            description: 'Tu documentación ya ha sido entregada y actualmente se encuentra en el escritorio del staff. Recibirás un resultado en breve.',
            color: '#3498db'
        },
        already_passed: {
            title: '✅ Acceso Ya Obtenido',
            description: 'Nuestros registros indican que ya eres un miembro aprobado de **{guild}**. No es necesario repetir el procedimiento.',
            color: '#2ecc71'
        },
        cooldown: {
            title: '⚠️ Período de Espera',
            description: 'Tu última solicitud fue rechazada recientemente. Por motivos de organización, debes esperar **{time}** antes de enviar una nueva solicitud.',
            color: '#e74c3c'
        },
        start_success: {
            title: '✅ Sesión Iniciada',
            description: 'Tu solicitud se ha abierto correctamente. Dirígete al canal <#{channelId}> para comenzar a proporcionar tu información.',
            color: '#2ecc71'
        },
        session_completed: {
            title: '📝 Entrevista Transcrita',
            description: 'Has respondido a todas las preguntas de la entrevista. El staff analizará tu solicitud en breve.\n\nRevisa tus respuestas arriba y usa los botones para confirmar o cancelar el envío.',
            color: '#3498db'
        },
        min_length_error: {
            title: '⚠️ Detalle Insuficiente',
            description: 'Tu respuesta debe contener al menos **{minLength}** caracteres para considerarse válida. Por favor, intenta explicarte un poco mejor.',
            color: '#f1c40f'
        },
        dm_accepted: {
            title: '✅ Idoneidad Confirmada',
            description: '¡Felicidades ciudadano! Tu solicitud a **{guild}** ha sido aprobada por la Comisión.\n\nAhora puedes acceder a los canales oficiales y comenzar tu experiencia.',
            color: '#2ecc71'
        },
        dm_rejected: {
            title: '❌ Resultado Negativo',
            description: 'Lo sentimos, pero la evaluación de tu expediente en **{guild}** no fue positiva.\n\n**MOTIVO:**\n{reason}\n\nPuedes intentar enviar una nueva solicitud después del período de espera.',
            color: '#e74c3c'
        },
        dm_voice_rejected: {
            title: '⚠️ Protocolo Oral Rechazado',
            description: 'No superaste la evaluación oral en **{guild}**. Te invitamos a revisar los protocolos de la ciudad antes de volver a solicitar.',
            color: '#e74c3c'
        },
        dm_text_pass: {
            title: '📝 Prueba Escrita Superada',
            description: '¡Superaste la prueba escrita en **{guild}**! Ahora puedes dirigirte al canal de voz de espera para la entrevista final.',
            color: '#f1c40f'
        },
        staff_received: {
            title: '📩 Nueva Solicitud (Whitelist)',
            description: 'El usuario **{user_name}** ha enviado su expediente para su evaluación.\n\n**INFO:**\n• Discord: <@{user_id}>\n• ID Solicitud: `{app_id}`',
            color: '#3498db'
        },
        dm_submitted: {
            title: '📋 Expediente Recibido',
            description: 'Tu solicitud para ingresar a **{guild}** ha sido adquirida por nuestros sistemas.\n\nUn miembro de la Comisión la revisará lo antes posible. Se te notificará aquí en cuanto haya un resultado.',
            color: '#3498db'
        },
        submission_confirmed: {
            title: '✅ Expediente Enviado',
            description: 'Tu documentación se ha enviado correctamente a las oficinas correspondientes. Se te notificará el resultado en breve.',
            color: '#2ecc71'
        },
        voice_procedural_error: {
            title: '❌ Error de Procedimiento',
            description: 'Lo sentimos ciudadano, pero el Estado no proporciona entrevistas orales para el tipo de visado que solicitaste.',
            color: '#e74c3c'
        },
        queue_log: {
            title: '📢 Protocolo de Cola: Nueva Entrada',
            description: 'Un nuevo ciudadano está esperando una entrevista.\n\n**SUJETO:** {user}\n**ID:** `{user_id}`\n**COLA ACTUAL:** `{waiting_count}`',
            color: '#3498db'
        },
        next_step_written: 'El siguiente paso es completar el Test Escrito. Cuando estés listo, haz clic en el botón de abajo.',
        next_step_voice: 'El siguiente paso es completar el Test de Voz. Por favor, espera a que un miembro del staff se una a ti.',
        written_finish: 'Tu proceso de whitelist ha finalizado.',
        start_written: 'Iniciar Test Escrito',
        bg_story_title: 'Historia del Personaje de {user}',
        written_archive_title: 'Respuestas Escritas de {user}',
        voice_staff_present: 'Staff presente',
        bg_link_label: 'Enlace de Background',
        bg_link_value: '[Abrir Documento]({link})',
        edit_closed: {
            title: 'Edición Cerrada',
            description: 'El menú de edición se ha cerrado. Ahora puedes continuar.',
            color: '#2ecc71'
        },
        edit_error: {
            title: 'Error de Edición',
            description: 'No se pudo editar tu respuesta. {reason}',
            color: '#e74c3c'
        },
        edit_menu: {
            title: 'Editar Solicitud',
            description: 'Selecciona la respuesta que deseas editar del menú de abajo.',
            color: '#3498db'
        },
        edit_success: {
            title: 'Respuesta Actualizada',
            description: 'Tu respuesta a la pregunta **{index}** se ha guardado correctamente.',
            color: '#2ecc71'
        },
        promote_vip_success: {
            title: 'Prioridad Actualizada',
            description: 'El usuario <@{userId}> ha sido movido al frente de la cola.',
            color: '#2ecc71'
        },
        session_cancelled: {
            title: 'Sesión Cancelada',
            description: 'La sesión ha sido cancelada. Este canal se eliminará en **{time}**.',
            color: '#e74c3c'
        },
        session_not_found: {
            title: 'Sesión No Encontrada',
            description: 'No se pudo encontrar la sesión solicitada.',
            color: '#e74c3c'
        },
        setup_success: {
            title: 'Whitelist Configurada',
            description: 'El panel de whitelist se ha configurado correctamente.',
            color: '#2ecc71'
        },
        skip_error_no_session: {
            title: 'Sin Sesión Activa',
            description: 'No hay ninguna sesión de voz activa para saltar.',
            color: '#e74c3c'
        },
        skip_success: {
            title: 'Sesión Saltada',
            description: 'La sesión de voz actual ha sido saltada.',
            color: '#3498db'
        },
        voice_guide: {
            title: 'Guía de Entrevista de Voz',
            description: 'Estás evaluando al usuario **<@{userId}>**. Usa los controles de abajo para aprobar o rechazar la entrevista.',
            color: '#3498db'
        },
        confirm_btn: 'Confirmar Solicitud',
        edit_btn: 'Editar Respuestas',
        cancel_btn: 'Cancelar Solicitud',
        close_btn: 'Cerrar Menú',
        done_btn: 'Hecho'
    },
    background: {
        panel: {
            title: '📜 Archivo Histórico: Depósito de Historia del Personaje',
            description: 'Empieza a redactar la historia de tu personaje para obtener la aprobación final de tu historial.\n\nHaz clic en el botón de abajo para iniciar el protocolo de depósito.',
            color: '#5865f2',
            footer: 'Oficina de Registro | {guild}'
        },
        instructions: {
            title: '✍️ Redacción de la Historia del Personaje',
            description: 'Estás empezando a redactar tu historia. Asegúrate de describir con precisión los orígenes y ambiciones de tu personaje.\n\n**REQUISITOS:**\n• Coherencia con la ambientación de la ciudad.\n• Respeto por las pautas narrativas.',
            color: '#3498db'
        },
        modal_title: 'Detalles de la Historia',
        link_label: 'Enlace a la Historia (ej. Google Doc)',
        desc_label: 'Breve Descripción (Opcional)',
        desc_placeholder: 'Resume la historia de tu personaje aquí...',
        dm_accepted: {
            title: '📜 Historia Aprobada',
            description: 'Tu historia ha sido depositada oficialmente en los archivos de **{guild}**. Tu personaje es ahora parte integral de la ciudad.',
            color: '#2ecc71'
        },
        dm_rejected: {
            title: '⚠️ Revisión Solicitada',
            description: 'Tu propuesta de historia para **{guild}** ha sido rechazada o requiere revisiones.\n\n**NOTAS DEL STAFF:**\n{reason}',
            color: '#e74c3c'
        },
        staff_received: {
            title: '📖 Nueva Historia Recibida',
            description: 'Un usuario ha enviado una historia para revisión.\n\n**Usuario:** <@{userId}>\n**Enlace:** [Abrir Documento]({bg_link})\n**Descripción:** {bg_desc}\n**ID:** `{app_id}`',
            color: '#3498db'
        },
        approve_btn: 'Aprobar',
        deny_btn: 'Rechazar',
        submit_btn: 'Enviar',
        cancel_btn: 'Cancelar',
        accepted_title: '✅ Historia APROBADA',
        rejected_title: '❌ Historia RECHAZADA',
        staff_tag: '👮 Miembro del Staff',
        subject_tag: '👤 Sujeto',
        outcome_tag: 'Resultado del Staff'
    },
    staffapps: {
        panel: {
            title: '📝 Portal de Solicitudes',
            description: '¿Quieres enviar una solicitud? Haz clic en el botón de abajo para comenzar.\n\nAsegúrate de responder exhaustivamente a todas las preguntas.',
            color: '#a855f7',
            footer: 'Portal de Solicitudes | {guild}'
        },
        dm_accepted: {
            title: '🎊 ¡Solicitud Aceptada!',
            description: '¡Grandes noticias {user}! ¡Tu solicitud para {guild} ha sido aprobada!',
            color: '#2ecc71'
        },
        dm_rejected: {
            title: '❌ Solicitud Rechazada',
            description: 'Lo sentimos {user}, pero tu solicitud para {guild} no fue aprobada.\n\n**Motivo:**\n>>> {reason}',
            color: '#ff4757'
        },
        staff_received: {
            title: '📩 Nueva Solicitud Recibida',
            description: 'El usuario **<@{userId}>** ha enviado una nueva solicitud.',
            color: '#a855f7'
        }
    },
    tickets: {
        panel: {
            title: '🎫 Centro de Soporte',
            description: '¿Necesitas asistencia o quieres reportar un problema? Abre un ticket de soporte seleccionando la categoría correcta en el menú a continuación.',
            color: '#2ECC71',
            footer: 'Equipo de Soporte | {guild}'
        },
        ticket: {
            title: '📂 Ticket de Soporte: {type}',
            description: 'Bienvenido, <@{user_id}>. Un miembro del staff atenderá tu solicitud en breve.',
            color: '#2ECC71'
        },
        success_open: {
            title: '✅ Ticket Creado',
            description: 'Tu ticket ha sido abierto con éxito.\n\n**Canal:** {channel}',
            color: '#2ecc71'
        },
        created_success: {
            title: '✅ Ticket Creado',
            description: 'Tu ticket ha sido abierto con éxito en <#{channelId}>.',
            color: '#2ecc71'
        },
        close: {
            title: '🔒 Ticket Cerrado',
            description: 'Este ticket ha sido cerrado y archivado correctamente.',
            color: '#E74C3C'
        },
        close_started: {
            title: '🔒 Cierre en Progreso',
            description: 'El ticket se está cerrando y archivando. Por favor, espera...',
            color: '#e67e22'
        },
        already_exists: {
            title: '⚠️ Ticket Existente',
            description: 'Ya tienes un ticket abierto del tipo **{type}** en el canal <#{channelId}>.',
            color: '#f1c40f'
        },
        staff_claimed: {
            title: '⚙️ Reclamado',
            description: 'El miembro del staff **{staff}** ha tomado tu ticket y te asistirá en breve.',
            color: '#3498db'
        },
        claim_already: {
            title: '⚠️ Ya Reclamado',
            description: 'Este ticket ya ha sido reclamado por <@{staffId}>.',
            color: '#f1c40f'
        },
        status_updated: {
            title: '🔄 Estado Actualizado',
            description: 'El estado del ticket ha cambiado a: **{status}**.',
            color: '#3498db'
        },
        inactivity_close: {
            title: '⚠️ Cerrado por Inactividad',
            description: 'Este ticket ha sido cerrado automáticamente debido a la falta de actividad reciente.',
            color: '#e74c3c'
        },
        default_welcome: {
            title: '🎫 Solicitud de Asistencia',
            description: 'Bienvenido al centro de soporte. Un miembro del staff estará aquí en breve.\n\nMotivo: **{reason}**',
            color: '#5865F2'
        },
        priority_select: {
            title: '⚡ Selección de Prioridad',
            description: 'Por favor, selecciona el nivel de prioridad para este ticket antes de proceder.',
            color: '#f1c40f'
        },
        quick_reply_menu: {
            title: '📝 Respuestas Rápidas',
            description: 'Selecciona una plantilla de respuesta para enviar en el ticket.',
            color: '#3498db'
        },
        tag_menu: {
            title: '🏷️ Gestión de Etiquetas',
            description: 'Selecciona una etiqueta para añadir o quitar de este ticket.',
            color: '#3498db'
        },
        staff_only: {
            title: '⚠️ Acceso Restringido',
            description: 'Lo sentimos, pero solo los miembros del staff pueden usar estas funciones de gestión.',
            color: '#e74c3c'
        },
        blacklist_error: {
            title: '🚫 Acceso Denegado',
            description: 'Tu cuenta ha sido incluida en la lista negra del sistema de tickets. No puedes abrir nuevas solicitudes.',
            color: '#e74c3c'
        },
        note_success: {
            title: '✅ Nota Añadida',
            description: 'La nota interna ha sido registrada con éxito en la base de datos del ticket.',
            color: '#2ecc71'
        },
        config_not_found: {
            title: '❌ Configuración Faltante',
            description: 'El sistema de tickets aún no se ha configurado para este servidor. Contacta a los administradores.',
            color: '#e74c3c'
        },
        category_not_available: {
            title: '❌ Categoría No Disponible',
            description: 'La categoría seleccionada ya no está disponible o ha sido eliminada por el staff.',
            color: '#e74c3c'
        },
        staff_ticket_log: {
            title: '📂 Registro de Tickets Cerrados',
            description: '>>> **Usuario:** {user}\n**Tipo:** `{type}`\n**Staff:** {staff}',
            color: '#3498db'
        },
        intelligence: {
            title: '🔍 Inteligencia: {user}',
            prev_tickets: '🎫 Tickets Anteriores',
            sessions_closed: '`{count}` sesiones cerradas',
            whitelist: '📋 Whitelist',
            status: 'Estado: `{status}`',
            no_app: 'Sin solicitud',
            last_wl: '📅 Última Whitelist',
            background: '📖 Historia',
            no_dossier: 'Sin expedientes',
            footer: 'Módulo de Inteligencia del Staff',
            field_name: '🔍 Inteligencia de Usuario'
        },
        system_messages: {
            priority_placeholder: 'Selecciona prioridad...',
            priority_normal: 'Normal',
            priority_important: 'Importante',
            priority_urgent: 'Urgente',
            claim_btn: 'Reclamar',
            close_btn: 'Cerrar',
            quick_reply_btn: 'Respuestas Rápidas',
            note_btn: 'Nota',
            status_placeholder: 'Cambiar estado...',
            status_processing: 'En Proceso',
            status_waiting: 'En Espera (Usuario)',
            note_modal_title: 'Añadir Nota Interna',
            note_input_label: 'Contenido de la nota',
            note_input_placeholder: 'Escribe una nota visible solo para el staff...',
            report_modal_title: 'Formulario de Reporte',
            report_subject_label: 'Asunto',
            report_desc_label: 'Descripción',
            no_quick_replies: '❌ No hay respuestas rápidas configuradas.',
            quick_reply_placeholder: 'Elige una plantilla...',
            tag_placeholder: 'Selecciona una etiqueta...',
            claim_success: '✅ Ticket reclamado con éxito.',
            status_updated_msg: '✅ Estado del ticket actualizado a: **{status}**',
            assigned_staff_label: '👤 Staff Asignado',
            internal_notes_label: '📝 Notas Internas',
            waiting_staff: '_En espera..._',
            none: '_Ninguno_',
            new_ticket_ping: '{ping} - Nuevo ticket **{type}** abierto.',
            cooldown: '⚠️ **ALTO TRÁFICO:** Espera unos minutos antes de abrir un nuevo ticket.',
            already_exists: '❌ **ERROR:** Ya tienes un ticket **{type}** abierto.',
            success_open: '✅ **TICKET ABIERTO:** Ve al canal {channel}.',
            success_close: '🛡️ **ARCHIVADO EN PROGRESO...**',
            staff_claimed: '✅ **{staff}** ha reclamado el ticket.',
            claim_already: '❌ Este ticket ya ha sido reclamado por <@{staffId}>.',
            staff_only: '⚠️ Acceso restringido solo para miembros del staff.',
            blacklist_error: '🚫 Has sido incluido en la lista negra del sistema de tickets.'
        }
    },
    verify: {
        panel: {
            title: '🛡️ Verificación de Cuenta',
            description: 'Para acceder a los canales del servidor, debes verificar tu identidad. Haz clic en el botón de abajo para proceder.',
            color: '#3BA4FF',
            footer: 'Sistema de Seguridad | {guild}'
        },
        success: {
            title: '✅ Verificación Completada',
            description: '¡Bienvenido! Tu verificación en **{guild}** ha sido exitosa. Ahora tienes acceso a todos los canales.',
            color: '#2ecc71'
        },
        already_verified: {
            title: '⚠️ Ya Verificado',
            description: 'Tu identidad ya está verificada en la base de datos de **{guild}**.',
            color: '#f1c40f'
        },
        dm: {
            title: '🎊 Bienvenido al Servidor',
            description: 'Te has verificado con éxito en **{guild}**. ¡Disfruta tu estancia y diviértete!',
            color: '#2ecc71'
        },
        staff_log: {
            title: '🛂 Registro de Verificación: Nuevo Miembro',
            description: 'Un nuevo usuario ha completado la verificación.\n\n**Usuario:** {user}\n**ID:** `{userId}`',
            color: '#2ecc71'
        },
        role_not_found: {
            title: 'Rol de verificacion no encontrado',
            description: 'El rol de verificacion ya no esta disponible. Contacta con el staff.',
            color: '#e74c3c'
        },

    },
    fivem: {
        status_embed: {
            title: '🏙️ Estado de la Ciudad: Online',
            description: 'El corazón de la metrópoli está activo. Se invita a los ciudadanos a conectarse y comenzar su día.\n\n📡 **Servidor:** `{serverName}`\n👥 **Ciudadanos en Ciudad:** `{players}/{maxPlayers}`\n🟢 **Estado:** Operativo',
            color: '#2ecc71',
            footer: 'Monitoreo Urbano | Verix RP'
        },
        offline_embed: {
            title: '🔴 Estado de la Ciudad: Offline',
            description: 'Atención ciudadanos. La conexión con la metrópoli ha sido interrumpida. Los técnicos están trabajando para restaurar los protocolos de acceso.\n\n⚠️ **Estado:** Inaccesible / Mantenimiento',
            color: '#e74c3c',
            footer: 'Emergencia Urbana | Verix RP'
        }
    },
    welcome: {
        join: {
            title: '👋 ¡Bienvenido al Servidor!',
            description: 'Hola **{user}**, ¡bienvenido a **{guild}**! Estamos felices de tenerte con nosotros.\n\nAsegúrate de leer las reglas para una estancia agradable.',
            color: '#2ecc71'
        },
        leave: {
            title: '👋 ¡Adiós!',
            description: '**{user}** ha abandonado el servidor. ¡Esperamos verte de nuevo pronto!',
            color: '#e74c3c'
        }
    },
    voice: {
        control_panel: {
            title: '🎙️ Panel de Control de Voz',
            description: '¡Bienvenido <@{user}>! Este es tu canal temporal.\nUsa los botones a continuación para gestionarlo rápidamente.',
            color: '#5865F2'
        },
        status_none: 'Ninguno',
        owner_field: '👑 Propietario',
        limit_field: '👥 Límite',
        dm_accepted: {
            title: 'Entrevista de Voz Aprobada',
            description: '¡Felicidades {user}! Tu entrevista de voz para **{guild}** ha sido aprobada.',
            color: '#2ecc71'
        },
        dm_rejected: {
            title: 'Entrevista de Voz Rechazada',
            description: 'Tu entrevista de voz para **{guild}** no ha sido aprobada.\n\n**Motivo:** {reason}',
            color: '#e74c3c'
        },
        staff_approved: {
            title: 'Evaluación de Voz Aprobada',
            description: 'El usuario **<@{userId}>** ha sido aprobado por **{staff}**.',
            color: '#2ecc71'
        },
        staff_denied: {
            title: 'Evaluación de Voz Rechazada',
            description: 'El usuario **<@{userId}>** ha sido rechazado por **{staff}**.\n\n**Motivo:** {reason}',
            color: '#e74c3c'
        },
        rejection_modal_title: 'Rechazo de entrevista de voz',
        rejection_modal_label: 'Motivo del rechazo'
    },
    moderation: {
        no_reason: 'Sin motivo proporcionado',
        error: {
            title: '❌ Error de Moderación',
            description: 'Ha ocurrido un error al ejecutar el comando.',
            color: '#e74c3c'
        },
        command_ban: {
            title: '✅ Baneo Ejecutado',
            description: 'El usuario **{user}** ha sido baneado con éxito.\n\n**Motivo:** {reason}',
            color: '#2ecc71'
        },
        warn: {
            title: '🛡️ Advertencia Oficial',
            description: 'Atención **{user}**, has recibido una advertencia oficial por violar las reglas.\n\n**Motivo:**\n>>> {reason}',
            color: '#f1c40f',
            footer: 'Moderación | {guild}'
        },
        timeout: {
            title: '🔇 Timeout Temporal',
            description: 'El usuario **{user}** ha sido silenciado temporalmente por **{duration}**.\n\n**Motivo:**\n>>> {reason}',
            color: '#e67e22'
        },
        kick: {
            title: '👢 Expulsado del Servidor',
            description: 'Has sido expulsado del servidor por violar las reglas.\n\n**Motivo:**\n>>> {reason}',
            color: '#e74c3c'
        },
        ban: {
            title: '🚫 Baneo Permanente',
            description: 'Tu acceso a este servidor ha sido revocado permanentemente.\n\n**Motivo:**\n>>> {reason}',
            color: '#000000'
        }
    },
    giveaway: {
        no_participants: {
            title: '😔 Sorteo Finalizado',
            description: 'El sorteo de **{prize}** finalizó sin participantes válidos.',
            color: '#e74c3c'
        },
        winners: {
            title: '🎉 ¡Ganadores del Sorteo!',
            description: '¡El sorteo de **{prize}** ha concluido!\n\n🏆 **Ganadores:** {winners}',
            color: '#2ecc71'
        },
        already_ended: {
            title: '⚠️ Sorteo Ya Finalizado',
            description: 'Lo sentimos, este sorteo ya ha concluido.',
            color: '#f1c40f'
        },
        level_required: {
            title: '🛡️ Requisito de Nivel No Cumplido',
            description: '¡Debes ser al menos **Nivel {minLevel}** para unirte a este sorteo!\nTu nivel actual es **Nivel {currentLevel}**.',
            color: '#e74c3c'
        }
    },
    photocontest: {
        panel: {
            title: '📸 Concurso de Fotografía',
            description: '¡Participa en nuestro concurso de fotografía! Sube tu mejor foto siguiendo el tema actual.\n\n**Tema:** `{theme}`\n**Fecha Límite:** {endTime}',
            color: '#F39C12'
        },
        submission: {
            title: '🎨 Obra de {username}',
            description: 'Se ha subido una nueva foto para el concurso.\n\n**Tema:** `{theme}`\n**Fecha Límite:** {endTime}',
            color: '#3498db'
        }
    },
    logs: {
        message_deleted: {
            title: '🗑️ Mensaje Eliminado',
            author: 'Autor',
            channel: 'Canal',
            content: 'Contenido',
            no_text: '*Sin texto (tal vez un embed o archivo)*',
            color: '#e74c3c'
        },
        message_updated: {
            title: '📝 Mensaje Actualizado',
            author: 'Autor',
            channel: 'Canal',
            before: 'Antes',
            after: 'Después',
            color: '#3498db'
        }
    },
    admin: {
        embed_editor: {
            title: '🛠️ Editor de Embeds',
            description: 'Estás editando un mensaje por defecto. Usa los botones para cambiar los campos.',
            color: '#F1C40F'
        }
    },
    socials: {
        twitch: {
            title: '📡 ¡**{streamer}** está en directo!',
            description: '### {title}\n\n¡Hola! **{streamer}** acaba de encender la cámara en Twitch. ¡No te pierdas el show!\n\n[Únete al Directo]({url})',
            color: '#6441a5',
            footer: 'Notificaciones Sociales | Verix'
        },
        youtube: {
            title: '🎥 ¡Nuevo video de **{streamer}**!',
            description: '### {title}\n\n¡Un nuevo video acaba de salir en el canal! Ve a revisarlo.',
            color: '#ff0000',
            footer: 'Notificaciones Sociales | Verix'
        },
        twitter: {
            title: '𝕏 (Twitter) Nueva publicación de **{streamer}**',
            description: '{description}',
            color: '#000000',
            footer: 'Notificaciones Sociales | Verix'
        },
        instagram: {
            title: '📸 Nueva publicación de **{streamer}**',
            description: '### {title}\n\n¡Nuevo contenido subido a Instagram! Ve a echar un vistazo.',
            color: '#e1306c',
            footer: 'Notificaciones Sociales | Verix'
        },
        tiktok: {
            title: '🎵 Nuevo TikTok de **{streamer}**',
            description: '### {title}\n\n¡Un nuevo video acaba de ser publicado en TikTok! Míralo ahora.',
            color: '#000000',
            footer: 'Notificaciones Sociales | Verix'
        },
        reddit: {
            title: '👾 ¡Nueva publicación en **r/{username}**!',
            description: '### {title}\n\n¡**{author}** publicó un nuevo contenido en **r/{username}**!\n\n{description}',
            color: '#ff4500',
            footer: 'Notificaciones Sociales | Verix'
        },
        steam: {
            title: '🎮 ¡Nuevo anuncio de **{username}**!',
            description: '### {title}\n\n¡**{username}** lanzó un nuevo anuncio o actualización!\n\n{description}',
            color: '#1b2838',
            footer: 'Notificaciones Sociales | Verix'
        },
        default_titles: {
            Twitch: '📡 ¡**{streamer}** está en directo!',
            YouTube: '🎥 ¡Nuevo video de **{streamer}**!',
            Twitter: '𝕏 (Twitter) Nueva publicación de **{streamer}**',
            Instagram: '📸 Nueva publicación de **{streamer}**',
            TikTok: '🎵 Nuevo TikTok de **{streamer}**',
            Reddit: '👾 ¡Nueva publicación en **r/{username}**!',
            Steam: '🎮 ¡Nuevo anuncio de **{username}**!'
        },
        default_descriptions: {
            Twitch: '### {title}\n\n¡Hola! **{streamer}** acaba de encender la cámara en Twitch. ¡No te pierdas el show!\n\n[Únete al Directo]({url})',
            YouTube: '### {title}\n\n¡Un nuevo video acaba de salir en el canal! Ve a revisarlo.',
            Twitter: '{description}',
            Instagram: '### {title}\n\n¡Nuevo contenido subido a Instagram! Ve a echar un vistazo.',
            TikTok: '### {title}\n\n¡Un nuevo video acaba de ser publicado en TikTok! Míralo ahora.',
            Reddit: '### {title}\n\n¡**{author}** publicó un nuevo contenido en **r/{username}**!\n\n{description}',
            Steam: '### {title}\n\n¡**{username}** lanzó un nuevo anuncio o actualización!\n\n{description}'
        },
        button_labels: {
            Twitch: 'Ver Directo',
            YouTube: 'Ver Video',
            Twitter: 'Ver en 𝕏',
            X: 'Ver en 𝕏',
            Instagram: 'Ver en Instagram',
            TikTok: 'Ver en TikTok',
            Reddit: 'Ver en Reddit',
            Steam: 'Ver en Steam',
            default: 'Abrir Enlace'
        },
        footer: 'Notificaciones Sociales | Verix'
    },
    leveling: {
        disabled: {
            title: '📡 Módulo Desactivado',
            description: 'El módulo **Leveling y Recompensas** está actualmente desactivado en este servidor. Contacta al staff para más información.',
            color: '#f1c40f'
        },
        rank: {
            title: '✨ Tarjeta de Rango - {username}',
            level: '📊 Nivel',
            rank: '🏆 Rango',
            xp: '🧪 Progreso de XP',
            progress: '📈 Progresión',
            messages: '💬 Mensajes Totales',
            daily_limit: '📅 Límite Diario',
            color: '#5865f2'
        },
        leaderboard: {
            title: '🏆 Tabla de Clasificación',
            empty_title: '⚠️ Tabla Vacía',
            empty_desc: 'La tabla de clasificación está vacía. ¡Empieza a escribir mensajes para ganar XP!',
            entry: '{pos} <@{userId}> • **Nivel {level}** ({xp} XP)',
            footer: 'Tu Rango: {rank} | Comunidad Activa',
            unranked: 'Sin Rango',
            color: '#5865f2'
        }
    },
    poll: {
        ended: { title: 'Encuesta cerrada', description: 'Esta encuesta ya ha terminado.', color: '#f1c40f' },
        invalid_option: { title: 'Opci?n no v?lida', description: 'Esta opci?n de la encuesta ya no est? disponible.', color: '#e74c3c' },
        vote_removed: { title: 'Voto eliminado', description: 'Tu voto se elimin? correctamente.', color: '#2ecc71' },
        vote_recorded: { title: 'Voto registrado', description: 'Tu voto se registr? correctamente.', color: '#2ecc71' }
    },
    reactionroles: {
        role_not_found: { title: 'Rol no encontrado', description: 'El rol configurado ya no existe. Contacta con un administrador.', color: '#e74c3c' },
        role_removed: { title: 'Rol eliminado', description: 'Rol **{role}** eliminado correctamente.', color: '#2ecc71' },
        role_assigned: { title: 'Rol asignado', description: 'Rol **{role}** asignado correctamente.', color: '#2ecc71' },
        update_error: { title: 'Error al actualizar el rol', description: 'No se pudo actualizar el rol. Revisa los permisos del bot y la jerarqu?a de roles.', color: '#e74c3c' }
    },
    common: {
        no_reason: 'Sin motivo proporcionado',
        none: 'Ninguno',
        loading: 'Cargando...',
        error: 'Ha ocurrido un error.',
        immediately: 'inmediatamente',
        start_time: 'Hora de Inicio'
    }
};
