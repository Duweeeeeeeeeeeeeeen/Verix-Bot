export default {
    "system": {
        "no_permission": {
            "title": "⚠️ Acesso negado",
            "description": "Você não possui as permissões necessárias para realizar esta operação. Entre em contato com um administrador se você acredita que isso é um erro.",
            "color": "#e74c3c"
        },
        "module_disabled": {
            "title": "📡 Módulo desabilitado",
            "description": "O módulo **{module}** está atualmente desabilitado neste servidor. Entre em contato com a equipe para obter mais informações.",
            "color": "#f1c40f"
        },
        "role_hierarchy": {
            "title": "⚖️ Hierarquia de funções",
            "description": "Não é possível atribuir função **{role}**. O bot não pode gerenciar funções superiores ou iguais às suas na hierarquia do servidor.",
            "color": "#e74c3c"
        },
        "generic_error": {
            "title": "❌ Erro de sistema",
            "description": "Ocorreu um erro inesperado durante o processamento. Os técnicos foram informados.",
            "color": "#e74c3c"
        },
        "setup_success": {
            "title": "✅ Configuração concluída",
            "description": "O módulo foi configurado corretamente e agora está operacional.",
            "color": "#2ecc71"
        },
        "module_list": {
            "title": "⚙️ Gerenciamento de módulos",
            "description": "Lista de módulos atualmente carregados no sistema:\n\n{list}",
            "color": "#5865f2"
        },
        "module_enabled": {
            "title": "✅ Módulo ativado",
            "description": "O módulo **{module}** foi ativado com sucesso.",
            "color": "#2ecc71"
        },
        "module_disabled_success": {
            "title": "❌ Módulo desativado",
            "description": "O módulo **{module}** foi removido do sistema. Todas as funções relacionadas estão suspensas.",
            "color": "#e74c3c"
        },
        "module_already_in_state": {
            "title": "ℹ️ servidor Inalterado",
            "description": "O módulo **{module}** já está no estado solicitado.",
            "color": "#3498db"
        },
        "module_not_found": {
            "title": "❌ Módulo não encontrado",
            "description": "O módulo **{module}** não está cadastrado no sistema.",
            "color": "#e74c3c"
        }
    },
    "utility": {
        "clear_success": {
            "title": "🧹 Limpeza de bate-papo",
            "description": "**{amount}** mensagens excluídas com sucesso.",
            "color": "#2ecc71"
        },
        "clear_no_messages": {
            "title": "⚠️ Nenhuma mensagem encontrada",
            "description": "Nenhuma mensagem foi encontrada que corresponda aos critérios de exclusão.",
            "color": "#f1c40f"
        },
        "clear_error": {
            "title": "❌ Erro de limpeza",
            "description": "Ocorreu um erro durante a exclusão. Observação: mensagens com mais de 14 dias não podem ser excluídas em massa.",
            "color": "#e74c3c"
        },
        "ping": {
            "title": "🏓 Status da conexão",
            "description": ">>> **Latência:**\n• Bot: `{latency}ms`\n• API: `{api_latency}ms`",
            "color": "#3498db"
        }
    },
    "whitelist": {
        "panel": {
            "title": "Aplicativo de servidor",
            "description": "Solicite acesso a **{guild}**. A equipe analisará suas respostas e entrará em contato com você quando uma decisão estiver pronta.\n\nClique no botão abaixo para começar.",
            "color": "#3BA4FF",
            "footer": "{guild} Aplicativos"
        },
        "start": {
            "title": "Aplicativo iniciado: {user_name}",
            "description": "Bem vindo. Por favor, responda cada pergunta com detalhes claros e úteis.\n\n**Antes de começar**\n- Responda honestamente.\n- Mantenha suas respostas relevantes para a pergunta.\n- Envie antes que a sessão expire.",
            "color": "#3BA4FF",
            "footer": "{guild} Aplicações"
        },
        "question": {
            "title": "Pergunta {current_index} de {total_questions}",
            "description": ">>> {question}",
            "color": "#3BA4FF"
        },
        "review": {
            "title": "Revise suas respostas",
            "description": "Verifique suas respostas antes de enviar. Depois de confirmada, sua inscrição será enviada à equipe para análise.",
            "color": "#2ecc71"
        },
        "not_configured": {
            "title": "Aplicativo não pronto",
            "description": "Este sistema aplicativo ainda não está totalmente configurado. Entre em contato com a equipe ou tente novamente mais tarde.",
            "color": "#f1c40f"
        },
        "active_session": {
            "title": "Aplicativo já aberto",
            "description": "Você já tem uma inscrição aberta em <#{channelId}>. Termine essa sessão antes de iniciar outra.",
            "color": "#3498db"
        },
        "already_submitted": {
            "title": "Inscrição em análise",
            "description": "Sua inscrição já foi enviada. A equipe irá revisá-lo e notificá-lo quando houver uma atualização.",
            "color": "#3498db"
        },
        "already_passed": {
            "title": "Já aprovado",
            "description": "Nossos registros mostram que você já foi aprovado para **{guild}**.",
            "color": "#2ecc71"
        },
        "cooldown": {
            "title": "Cooldown ativo",
            "description": "Você deve esperar **{time}** antes de enviar outra inscrição.",
            "color": "#e74c3c"
        },
        "start_success": {
            "title": "Aplicativo criado",
            "description": "Seu canal de aplicativo privado está pronto: <#{channelId}>.",
            "color": "#2ecc71"
        },
        "session_completed": {
            "title": "Respostas completas",
            "description": "Você respondeu todas as perguntas. Revise suas respostas acima e confirme ou cancele o envio.",
            "color": "#3498db"
        },
        "min_length_error": {
            "title": "São necessários mais detalhes",
            "description": "Sua resposta deve conter pelo menos **{minLength}** caracteres. Adicione mais detalhes e tente novamente.",
            "color": "#f1c40f"
        },
        "dm_accepted": {
            "title": "Aplicativo aprovado",
            "description": "Parabéns {usuário}! Sua inscrição para **{guild}** foi aprovada.",
            "color": "#2ecc71"
        },
        "dm_rejected": {
            "title": "Inscrição rejeitada",
            "description": "Sua inscrição para **{guild}** não foi aprovada.\n\n**Motivo:**\n>>> {motivo}\n\nVocê pode enviar outra inscrição depois que o tempo de espera expirar.",
            "color": "#e74c3c"
        },
        "dm_voice_rejected": {
            "title": "Entrevista de voz rejeitada",
            "description": "Sua entrevista de voz para **{guild}** não foi aprovada. Revise os requisitos antes de tentar novamente.",
            "color": "#e74c3c"
        },
        "dm_text_pass": {
            "title": "Etapa escrita aprovada",
            "description": "Você passou na etapa escrita para **{guild}**. Junte-se ao canal de voz configurado quando estiver pronto para a entrevista.",
            "color": "#f1c40f"
        },
        "staff_received": {
            "title": "Nova inscrição enviada",
            "description": "**{user_name}** enviou uma inscrição para análise.\n\n**Informações**\n- Discordância: <@{user_id}>\n- ID da inscrição: `{app_id}`",
            "color": "#3498db"
        },
        "dm_submitted": {
            "title": "Inscrição recebida",
            "description": "Sua inscrição para **{guild}** foi enviada. A equipe irá revisá-lo em breve e notificá-lo quando houver um resultado.",
            "color": "#3498db"
        },
        "submission_confirmed": {
            "title": "Inscrição enviada",
            "description": "Sua inscrição foi enviada à equipe. Você será notificado quando uma decisão estiver pronta.",
            "color": "#2ecc71"
        },
        "voice_procedural_error": {
            "title": "Entrevista de voz indisponível",
            "description": "Uma entrevista de voz não está disponível para este fluxo de aplicativo.",
            "color": "#e74c3c"
        },
        "queue_log": {
            "title": "Nova entrada na fila de voz",
            "description": "{usuário} está aguardando uma entrevista de voz.\n\n**ID do usuário:** `{user_id}`\n**Tamanho da fila:** `{waiting_count}`",
            "color": "#3498db"
        },
        "already_exists": {
            "title": "A inscrição já existe",
            "description": "Você já tem uma inscrição ativa ou enviada.",
            "color": "#f1c40f"
        },
        "app_not_found": {
            "title": "Aplicativo não encontrado",
            "description": "O aplicativo solicitado não foi encontrado.",
            "color": "#e74c3c"
        },
        "cooldown_error": {
            "title": "Recarga ativa",
            "description": "Aguarde **{time}** antes de enviar outra inscrição.",
            "color": "#f1c40f"
        },
        "edit_closed": {
            "title": "Edição Fechada",
            "description": "O menu de edição foi fechado. Agora você pode continuar.",
            "color": "#2ecc71"
        },
        "edit_error": {
            "title": "Erro de edição",
            "description": "Não foi possível editar sua resposta. {motivo}",
            "color": "#e74c3c"
        },
        "edit_menu": {
            "title": "Editar aplicativo",
            "description": "Selecione a resposta que deseja editar no menu abaixo.",
            "color": "#3498db"
        },
        "edit_success": {
            "title": "Resposta atualizada",
            "description": "Sua resposta à pergunta **{index}** foi salva com sucesso.",
            "color": "#2ecc71"
        },
        "promote_vip_success": {
            "title": "Prioridade atualizada",
            "description": "O usuário <@{userId}> foi movido para o início da fila.",
            "color": "#2ecc71"
        },
        "session_cancelled": {
            "title": "Sessão cancelada",
            "description": "A sessão foi cancelada. Este canal será removido em **{time}**.",
            "color": "#e74c3c"
        },
        "session_not_found": {
            "title": "Sessão não encontrada",
            "description": "A sessão solicitada não foi encontrada.",
            "color": "#e74c3c"
        },
        "setup_success": {
            "title": "Lista de permissões configurada",
            "description": "O painel da lista de permissões foi configurado com sucesso.",
            "color": "#2ecc71"
        },
        "skip_error_no_session": {
            "title": "Nenhuma sessão ativa",
            "description": "Não há sessão de voz ativa para ignorar.",
            "color": "#e74c3c"
        },
        "skip_success": {
            "title": "Sessão ignorada",
            "description": "A sessão de voz atual foi ignorada.",
            "color": "#3498db"
        },
        "voice_guide": {
            "title": "Guia de entrevista de voz",
            "description": "Você está revisando o usuário **<@{userId}>**. Use os controles abaixo para aprovar ou rejeitar a entrevista.",
            "color": "#3498db"
        },
        "next_step_written": "O próximo passo é concluir a Prova Escrita. Quando estiver pronto, clique no botão abaixo.",
        "next_step_voice": "O pr��ximo passo é completar o Teste de Voz. Aguarde até que um membro da equipe se junte a você.",
        "written_finish": "Seu processo de lista de permissões foi concluído.",
        "start_written": "Iniciar teste escrito",
        "bg_story_title": "História do personagem de {usuário}",
        "written_archive_title": "Respostas escritas de {usuário}",
        "voice_staff_present": "Equipe presente",
        "bg_not_accepted": "Seu histórico ainda não foi aprovado.",
        "written_not_accepted": "Sua inscrição por escrito ainda não foi aprovada.",
        "voice_rejection_cooldown": "Você deve esperar {hours} hora(s) antes de tentar outra entrevista por voz.",
        "vip_priority": "Prioridade VIP ativa.",
        "voice_session_start_log": "A sessão da lista de permissões de voz foi iniciada para {user} em {channel}.",
        "no_written_found": "Nenhuma resposta escrita do aplicativo foi encontrada.",
        "session_expired_title": "Sessão expirada",
        "session_expired_desc": "Esta sessão do aplicativo expirou e foi fechada.",
        "time_expired_title": "Tempo expirado",
        "time_expired_desc": "O limite de tempo do aplicativo expirou. Por favor, inicie uma nova sessão, se necessário.",
        "rejection_modal_title": "Rejeição de inscrição",
        "rejection_modal_label": "Motivo da rejeição",
        "rejection_modal_placeholder": "Exemplo: respostas muito curtas, requisitos não atendidos...",
        "approved_title": "Solicitação aprovada",
        "rejected_title": "Solicitação rejeitada",
        "written_step_approved": "Etapa escrita aprovada",
        "approved_by": "Aprovada por {equipe}",
        "rejected_by": "Rejeitada por {equipe}",
        "written_step_approved_by": "Etapa escrita aprovada por {staff}",
        "waiting_voice_interview": "Aguardando entrevista de voz",
        "dm_notification": "Notificação DM",
        "bg_link_label": "Link de plano de fundo",
        "bg_link_value": "[Abrir documento]({link})",
        "confirm_btn": "Confirmar inscrição",
        "edit_btn": "Editar respostas",
        "cancel_btn": "Cancelar inscrição",
        "close_btn": "Fechar menu",
        "done_btn": "Concluído"
    },
    "background": {
        "panel": {
            "title": "Envio de antecedentes",
            "description": "Envie suas informações de antecedentes para revisão da equipe.\n\nClique no botão abaixo para começar.",
            "color": "#5865f2",
            "footer": "{guild} Revisão de antecedentes"
        },
        "instructions": {
            "title": "Instruções de antecedentes",
            "description": "Use este canal para preparar e enviar seu histórico para revisão.\n\n**Requisitos**\n- Siga as orientações do servidor.\n- Certifique-se de que qualquer link de documento esteja acessível à equipe.\n- Adicione contexto suficiente para que os revisores entendam seu envio.",
            "color": "#3498db"
        },
        "modal_title": "Detalhes do plano de fundo",
        "link_label": "Link do plano de fundo (por exemplo, Google Doc)",
        "desc_label": "Breve descrição (opcional)",
        "desc_placeholder": "Resuma seu envio de plano de fundo aqui...",
        "dm_accepted": {
            "title": "Plano de fundo aprovado",
            "description": "Seu plano de fundo para **{guild}** foi aprovado.",
            "color": "#2ecc71"
        },
        "dm_rejected": {
            "title": "Background rejeitado",
            "description": "Seu histórico para **{guild}** não foi aprovado.\n\n**Notas da equipe:**\n>>> {motivo}",
            "color": "#e74c3c"
        },
        "staff_received": {
            "title": "Novo plano de fundo enviado",
            "description": "Um usuário enviou um plano de fundo para revisão.\n\n**Usuário:** <@{userId}>\n**Link:** [Abrir documento]({bg_link})\n**Descrição:** {bg_desc}\n**ID:** `{app_id}`",
            "color": "#3498db"
        },
        "approve_btn": "Aprovar",
        "deny_btn": "Rejeitar",
        "submit_btn": "Enviar",
        "cancel_btn": "Cancelar",
        "accepted_title": "Antecedentes aprovados",
        "rejected_title": "Antecedentes rejeitados",
        "staff_tag": "Membro da equipe",
        "subject_tag": "Candidato",
        "outcome_tag": "Resultado da equipe",
        "already_exists": {
            "title": "Background já enviado",
            "description": "Você já tem uma solicitação de background ativa ou aguardando revisão.",
            "color": "#f1c40f"
        },
        "channel_created": {
            "title": "Sessão em segundo plano iniciada",
            "description": "Seu canal de envio em segundo plano está pronto: {channel}",
            "color": "#2ecc71"
        },
        "cooldown": {
            "title": "Cooldown ativo",
            "description": "Você enviou um histórico muito recentemente. Você pode enviar outro {time_left}.",
            "color": "#f1c40f"
        },
        "cooldown_error": {
            "title": "Recarga ativa",
            "description": "Aguarde **{time}** antes de iniciar um novo envio em segundo plano.",
            "color": "#f1c40f"
        },
        "dm_received": {
            "title": "Histórico recebido",
            "description": "Seu histórico para **{guild}** foi recebido. A equipe irá analisá-lo em breve.",
            "color": "#2ecc71"
        },
        "error": {
            "title": "Erro de plano de fundo",
            "description": "Ocorreu um erro ao processar o plano de fundo. {reason}",
            "color": "#e74c3c"
        },
        "session_cancelled": {
            "title": "Sessão cancelada",
            "description": "O envio em segundo plano foi cancelado. Este canal será removido em **{time}**.",
            "color": "#e74c3c"
        },
        "submission_success": {
            "title": "Plano de fundo enviado",
            "description": "Seu plano de fundo foi enviado com sucesso. A equipe irá analisá-lo em breve.",
            "color": "#2ecc71"
        },
        "upload_success": {
            "title": "Anexo salvo",
            "description": "O arquivo foi salvo com sucesso.\n\n**Arquivo:** [{nome do arquivo}]({url})",
            "color": "#2ecc71"
        }
    },
    "staffapps": {
        "panel": {
            "title": "📝 Portal de inscrições",
            "description": "Deseja enviar uma inscrição? Clique no botão abaixo para começar.\n\nCertifique-se de responder a todas as perguntas de forma abrangente.",
            "color": "#a855f7",
            "footer": "Portal de aplicativos | {guild}"
        },
        "dm_accepted": {
            "title": "🎊 Inscrição aceita!",
            "description": "Ótimas notícias {usuário}! Sua inscrição para {guild} foi aprovada!",
            "color": "#2ecc71"
        },
        "dm_rejected": {
            "title": "❌ Inscrição rejeitada",
            "description": "Lamentamos {user}, mas sua inscrição para {guild} não foi aprovada.\n\n**Motivo:**\n>>> {reason}",
            "color": "#ff4757"
        },
        "staff_received": {
            "title": "📩 Nova inscrição recebida",
            "description": "O usuário **<@{userId}>** enviou uma nova inscrição.",
            "color": "#a855f7"
        }
    },
    "tickets": {
        "panel": {
            "title": "🎫 Centro de suporte",
            "description": "Precisa de ajuda ou deseja relatar um problema? Abra um ticket de suporte selecionando a categoria correta no menu abaixo.",
            "color": "#2ECC71",
            "footer": "Equipe de suporte | {guild}"
        },
        "ticket": {
            "title": "📂 Ticket de suporte: {type}",
            "description": "Bem-vindo, <@{user_id}>. Um membro da equipe atenderá sua solicitação em breve.",
            "color": "#2ECC71"
        },
        "success_open": {
            "title": "✅ Ticket criado",
            "description": "Seu ticket foi aberto com sucesso.\n\n**Canal:** {canal}",
            "color": "#2ecc71"
        },
        "created_success": {
            "title": "✅ Ticket criado",
            "description": "Seu ticket foi aberto com sucesso em <#{channelId}>.",
            "color": "#2ecc71"
        },
        "close": {
            "title": "🔒 Ticket Fechado",
            "description": "Este ticket foi fechado e arquivado corretamente.",
            "color": "#E74C3C"
        },
        "close_started": {
            "title": "🔒 Fechamento em andamento",
            "description": "O ticket está sendo fechado e arquivado. Aguarde...",
            "color": "#e67e22"
        },
        "already_exists": {
            "title": "⚠️ Ticket existente",
            "description": "Você já tem um ticket aberto do tipo **{type}** no canal <#{channelId}>.",
            "color": "#f1c40f"
        },
        "staff_claimed": {
            "title": "⚙️ O membro da equipe",
            "description": "reivindicado **{staff}** assumiu seu ticket e irá ajudá-lo em breve.",
            "color": "#3498db"
        },
        "claim_already": {
            "title": "⚠️ Já reivindicado",
            "description": "Este ticket já foi reivindicado por <@{staffId}>.",
            "color": "#f1c40f"
        },
        "status_updated": {
            "title": "🔄 Status atualizado",
            "description": "O status do ticket foi definido como: **{status}**.",
            "color": "#3498db"
        },
        "inactivity_close": {
            "title": "⚠️ Fechado por inatividade",
            "description": "Este ticket foi fechado automaticamente devido à falta de atividade recente.",
            "color": "#e74c3c"
        },
        "default_welcome": {
            "title": "🎫 Solicitação de assistência",
            "description": "Bem-vindo ao centro de suporte. Um membro da equipe estará aqui em breve.\n\nMotivo: **{reason}**",
            "color": "#5865F2"
        },
        "priority_select": {
            "title": "⚡ Seleção de prioridade",
            "description": "Selecione o nível de prioridade para este ticket antes de continuar.",
            "color": "#f1c40f"
        },
        "quick_reply_menu": {
            "title": "📝 Respostas rápidas",
            "description": "Selecione um modelo de resposta para enviar no ticket.",
            "color": "#3498db"
        },
        "tag_menu": {
            "title": "🏷️ Gerenciamento de tags",
            "description": "Selecione uma tag para adicionar ou remover deste ticket.",
            "color": "#3498db"
        },
        "staff_only": {
            "title": "⚠️ Acesso restrito",
            "description": "Desculpe, mas apenas os membros da equipe podem usar esses recursos de gerenciamento.",
            "color": "#e74c3c"
        },
        "blacklist_error": {
            "title": "🚫 Acesso negado",
            "description": "Sua conta foi colocada na lista negra do sistema de tickets. Você não pode abrir novas solicitações.",
            "color": "#e74c3c"
        },
        "note_success": {
            "title": "✅ Nota adicionada",
            "description": "A nota interna foi registrada com sucesso no banco de dados de tickets.",
            "color": "#2ecc71"
        },
        "config_not_found": {
            "title": "❌ Configuração ausente",
            "description": "O sistema de tickets ainda não foi configurado para este servidor. Contate os administradores.",
            "color": "#e74c3c"
        },
        "category_not_available": {
            "title": "❌ Categoria não disponível",
            "description": "A categoria selecionada não está mais disponível ou foi removida pela equipe.",
            "color": "#e74c3c"
        },
        "staff_ticket_log": {
            "title": "📂 Registro de tickets fechados",
            "description": ">>> **Usuário:** {usuário}\n**Tipo:** `{tipo}`\n**Staff:** {staff}",
            "color": "#3498db"
        },
        "intelligence": {
            "title": "🔍 Inteligência: {user}",
            "prev_tickets": "🎫 Tickets anteriores",
            "sessions_closed": "`{count}` sessões fechadas",
            "whitelist": "📋 Lista de permissões",
            "status": "Status: `{status}`",
            "no_app": "Nenhuma aplicação",
            "last_wl": "📅 Última lista de permissões",
            "background": "📖 Histórico",
            "no_application": "Nenhuma aplicação",
            "footer": "Módulo de inteligência de equipe",
            "field_name": "🔍 Inteligência de usuário"
        },
        "system_messages": {
            "priority_placeholder": "Selecione prioridade...",
            "priority_normal": "Normal",
            "priority_important": "Importante",
            "priority_urgent": "Urgente",
            "claim_btn": "Reivindicação",
            "close_btn": "Fechar",
            "quick_reply_btn": "Respostas Rápidas",
            "note_btn": "Nota",
            "status_placeholder": "Alterar status...",
            "status_processing": "Processando",
            "status_waiting": "Aguardando (Usuário)",
            "note_modal_title": "Adicionar Nota Interna",
            "note_input_label": "Conteúdo da nota",
            "note_input_placeholder": "Escreva uma nota visível apenas para a equipe...",
            "report_modal_title": "Formulário de relatório",
            "report_subject_label": "Assunto",
            "report_desc_label": "Descrição",
            "no_quick_replies": "❌ Nenhuma resposta rápida configurada.",
            "quick_reply_placeholder": "Escolha um modelo...",
            "tag_placeholder": "Selecione uma tag...",
            "claim_success": "✅ Ticket reivindicado com sucesso.",
            "status_updated_msg": "✅ Status do ticket atualizado para: **{status}**",
            "assigned_staff_label": "👤 Equipe designada",
            "internal_notes_label": "📝 Notas internas",
            "waiting_staff": "_Aguardando..._",
            "none": "_Nenhum_",
            "new_ticket_ping": "{ping} - Novo **{type}** ticket aberto.",
            "cooldown": "⚠️ **TRÁFEGO ALTO:** Aguarde alguns minutos antes de abrir um novo ticket.",
            "already_exists": "❌ **ERRO:** Você já tem um ticket **{type}** aberto.",
            "success_open": "✅ **INGRESSOS ABERTOS:** Vá para o canal {channel}.",
            "success_close": "🛡️ **ARQUIVAMENTO EM ANDAMENTO...**",
            "staff_claimed": "✅ **{staff}** reivindicou o ticket.",
            "claim_already": "❌ Este ticket já foi reivindicado por <@{staffId}>.",
            "staff_only": "⚠️ Acesso restrito apenas para membros da equipe.",
            "blacklist_error": "🚫 Você foi colocado na lista negra do sistema de tickets."
        },
        "claim_success": {
            "title": "Ticket reivindicado",
            "description": "Você reivindicou este ticket com sucesso.",
            "color": "#2ecc71"
        },
        "error": {
            "title": "Erro de ticket",
            "description": "Não foi possível concluir a ação de ticket solicitada. {reason}",
            "color": "#e74c3c"
        },
        "generic_error": {
            "title": "Erro de ticket",
            "description": "Não foi possível concluir a ação de ticket solicitada. {reason}",
            "color": "#e74c3c"
        },
        "status_updated_msg": {
            "title": "Status atualizado",
            "description": "Status do ticket atualizado para **{status}**.",
            "color": "#2ecc71"
        },
        "user_managed": {
            "title": "Membro do ticket atualizado",
            "description": "O usuário **{user}** foi **{action}** do ticket.",
            "color": "#3498db"
        }
    },
    "verify": {
        "panel": {
            "title": "🛡️ Verificação de conta",
            "description": "Para acessar os canais do servidor, você deve verificar sua identidade. Clique no botão abaixo para prosseguir.",
            "color": "#3BA4FF",
            "footer": "Sistema de Segurança | {guild}"
        },
        "success": {
            "title": "✅ Verificação concluída",
            "description": "Bem vindo! Sua verificação em **{guild}** foi bem-sucedida. Agora você tem acesso a todos os canais.",
            "color": "#2ecc71"
        },
        "already_verified": {
            "title": "⚠️ Já verificado",
            "description": "Sua identidade já foi verificada no banco de dados **{guild}**.",
            "color": "#f1c40f"
        },
        "dm": {
            "title": "🎊 Bem vindo ao servidor",
            "description": "Você verificou com sucesso em **{guild}**. Aproveite sua estadia e divirta-se!",
            "color": "#2ecc71"
        },
        "staff_log": {
            "title": "🛂 Registro de verificação: novo membro",
            "description": "Um novo usuário concluiu a verificação.\n\n**Usuário:** {usuário}\n**ID:** `{userId}`",
            "color": "#2ecc71"
        },
        "error": {
            "title": "Erro de verificação",
            "description": "Ocorreu um problema técnico durante a verificação de sua conta. Tente novamente mais tarde ou entre em contato com a equipe.",
            "color": "#e74c3c"
        },
        "role_not_found": {
            "title": "Função de verificação ausente",
            "description": "A função de verificação não está mais disponível. Entre em contato com a equipe.",
            "color": "#e74c3c"
        },
        "success_reply": {
            "title": "Verificação concluída",
            "description": "Bem-vindo {usuário}! Suas permissões foram atualizadas.",
            "color": "#2ecc71"
        }
    },
    "fivem": {
        "status_embed": {
            "title": "🏙️ Status da cidade: Online",
            "description": "O coração da metrópole está ativo. Os membros são convidados a se conectar e começar o dia.\n\n📡 **Servidor:** `{serverName}`\n👥 **Membros na cidade:** `{players}/{maxPlayers}`\n🟢 **Status:** Operacional",
            "color": "#2ecc71",
            "footer": "Monitoramento Urbano | Verix RP"
        },
        "offline_embed": {
            "title": "🔴 Status da cidade: Offline",
            "description": "Atenção membros. A conexão com a metrópole foi interrompida. Técnicos trabalham para restaurar os protocolos de acesso.\n\n⚠️ **Status:** Inacessível / Manutenção",
            "color": "#e74c3c",
            "footer": "Emergência Urbana | Verix RP"
        }
    },
    "welcome": {
        "join": {
            "title": "👋 Bem-vindo ao servidor!",
            "description": "Olá **{usuário}**, bem-vindo à **{guild}**! Estamos felizes em ter você conosco.\n\nCertifique-se de ler as regras para uma estadia agradável.",
            "color": "#2ecc71"
        },
        "leave": {
            "title": "👋 Adeus!",
            "description": "**{user}** saiu do servidor. Esperamos vê-lo novamente em breve!",
            "color": "#e74c3c"
        }
    },
    "voice": {
        "control_panel": {
            "title": "🎙️ Painel de controle de voz",
            "description": "Bem-vindo <@{user}>! Este é o seu canal temporário.\nUse os botões abaixo para gerenciá-lo rapidamente.",
            "color": "#5865F2"
        },
        "status_none": "Nenhum",
        "owner_field": "👑 Proprietário",
        "limit_field": "👥 Limite",
        "dm_accepted": {
            "title": "Entrevista de voz aprovada",
            "description": "Parabéns {usuário}! Sua entrevista de voz para **{guild}** foi aprovada.",
            "color": "#2ecc71"
        },
        "dm_rejected": {
            "title": "Entrevista de voz rejeitada",
            "description": "Sua entrevista de voz para **{guild}** não foi aprovada.\n\n**Motivo:** {reason}",
            "color": "#e74c3c"
        },
        "staff_approved": {
            "title": "Revisão de voz aprovada",
            "description": "O usuário **<@{userId}>** foi aprovado por **{staff}**.",
            "color": "#2ecc71"
        },
        "staff_denied": {
            "title": "Revisão de voz rejeitada",
            "description": "O usuário **<@{userId}>** foi rejeitado por **{staff}**.\n\n**Motivo:** {motivo}",
            "color": "#e74c3c"
        },
        "rejection_modal_title": "Rejeição da entrevista de voz",
        "rejection_modal_label": "Motivo da rejeição"
    },
    "moderation": {
        "no_reason": "Nenhum motivo fornecido",
        "result": "Resultado",
        "reason": "Motivo",
        "next_step": "Próximo passo",
        "sent": "Enviado",
        "error": {
            "title": "❌ Erro de moderação",
            "description": "Ocorreu um erro ao executar o comando.",
            "color": "#e74c3c"
        },
        "command_ban": {
            "title": "✅ Banimento executado",
            "description": "Usuário **{user}** foi banido com sucesso.\n\n**Motivo:** {reason}",
            "color": "#2ecc71"
        },
        "warn": {
            "title": "🛡️ Aviso Oficial",
            "description": "Atenção **{usuário}**, você recebeu um aviso oficial por violar as regras.\n\n**Motivo:**\n>>> {motivo}",
            "color": "#f1c40f",
            "footer": "Moderação | {guild}"
        },
        "timeout": {
            "title": "🔇 Tempo limite temporário",
            "description": "O usuário **{user}** foi silenciado temporariamente por **{duration}**.\n\n**Motivo:**\n>>> {motivo}",
            "color": "#e67e22"
        },
        "kick": {
            "title": "👢 Expulso do servidor",
            "description": "Você foi expulso do servidor por violar as regras.\n\n**Motivo:**\n>>> {motivo}",
            "color": "#e74c3c"
        },
        "ban": {
            "title": "🚫 Banimento Permanente",
            "description": "Seu acesso a este servidor foi revogado permanentemente.\n\n**Motivo:**\n>>> {motivo}",
            "color": "#000000"
        },
        "anti_raid": {
            "title": "Ação Anti-Raid",
            "description": "Uma conta suspeita entrou e foi tratada pelo sistema anti-Raid.\n\n**Usuário:** {usuário}\n**Motivo:** {motivo}",
            "color": "#e74c3c"
        },
        "command_kick": {
            "title": "Kick executado",
            "description": "**Usuário:** {usuário}\n**Moderador:** {mod}\n**Motivo:** {reason}",
            "color": "#e74c3c"
        },
        "dm_kick": {
            "title": "Removido do servidor",
            "description": "Você foi removido de **{guild}**.\n\n**Motivo:** {reason}",
            "color": "#e74c3c"
        },
        "dm_ban": {
            "title": "Banido do servidor",
            "description": "Você foi banido de **{guild}**.\n\n**Motivo:** {motivo}",
            "color": "#000000"
        },
        "ghost_ping": {
            "title": "Ghost Ping detectado",
            "description": "**Usuário:** {usuário}\n**Canal:** {canal}\n\nA mensagem excluída continha uma menção.",
            "color": "#f59e0b"
        }
    },
    "giveaway": {
        "no_participants": {
            "title": "😔 Sorteio encerrado",
            "description": "O sorteio do **{prize}** terminou sem participantes válidos.",
            "color": "#e74c3c"
        },
        "winners": {
            "title": "🎉 Vencedores do sorteio!",
            "description": "O sorteio do **{prize}** foi concluído!\n\n🏆 **Vencedores:** {winners}",
            "color": "#2ecc71"
        },
        "already_ended": {
            "title": "⚠️ Sorteio já encerrado",
            "description": "Desculpe, este sorteio já foi concluído.",
            "color": "#f1c40f"
        },
        "level_required": {
            "title": "🛡️ Requisito de nível não atendido",
            "description": "Você deve ter pelo menos **Nível {minLevel}** para participar deste sorteio!\nSeu nível atual é **Level {currentLevel}**.",
            "color": "#e74c3c"
        }
    },
    "photocontest": {
        "panel": {
            "title": "📸 Concurso de Fotografia",
            "description": "Participe do nosso concurso de fotografia! Envie sua melhor foto seguindo o tema atual.\n\n**Tema:** `{tema}`\n**Prazo:** {endTime}",
            "color": "#F39C12"
        },
        "submission": {
            "title": "🎨 Trabalho de {username}",
            "description": "Uma nova foto foi enviada para o concurso.\n\n**Tema:** `{tema}`\n**Prazo:** {endTime}",
            "color": "#3498db"
        },
        "already_submitted": {
            "title": "Já enviada",
            "description": "Você já enviou uma foto para este concurso.",
            "color": "#f1c40f"
        },
        "already_voted_error": {
            "title": "Voto já registrado",
            "description": "Você já votou neste envio.",
            "color": "#f1c40f"
        },
        "contest_end_log": {
            "title": "Concurso de fotos encerrado",
            "description": "O concurso terminou.\n\n**Vencedor:** {vencedor}\n**Pontuação:** {pontuação}",
            "color": "#F39C12"
        },
        "entry_not_found_error": {
            "title": "Envio não encontrado",
            "description": "Este envio não foi encontrado. Pode ter sido removido.",
            "color": "#e74c3c"
        },
        "error": {
            "title": "Erro no concurso de fotos",
            "description": "Algo deu errado ao processar a ação do concurso de fotos.",
            "color": "#e74c3c"
        },
        "error_no_participants": {
            "title": "Sem participantes",
            "description": "O concurso de fotografia terminou sem inscrições válidas.",
            "color": "#e74c3c"
        },
        "interaction_notify": {
            "title": "Nova interação no concurso",
            "description": "Alguém interagiu com o envio do seu concurso de fotografia.",
            "color": "#2ecc71"
        },
        "leaderboard": {
            "title": "Classificação do concurso de fotos",
            "description": "{list}",
            "color": "#F39C12"
        },
        "leaderboard_display": {
            "title": "Classificação do concurso de fotos",
            "description": "{leaderboard}",
            "color": "#F39C12"
        },
        "leaderboard_error": {
            "title": "Erro na tabela de classificação",
            "description": "Não foi possível carregar a tabela de classificação do concurso de fotografia.",
            "color": "#e74c3c"
        },
        "no_contest_active": {
            "title": "Nenhum concurso ativo",
            "description": "Não há nenhum concurso de fotografia ativo no momento.",
            "color": "#f1c40f"
        },
        "no_submissions_leaderboard": {
            "title": "Sem inscrições",
            "description": "Ainda não há inscrições para mostrar.",
            "color": "#f1c40f"
        },
        "no_winners": {
            "title": "Ainda não há vencedores",
            "description": "Ainda não há vencedores anteriores registrados.",
            "color": "#f1c40f"
        },
        "self_vote_error": {
            "title": "Voto não permitido",
            "description": "Você não pode votar em seu próprio envio.",
            "color": "#f1c40f"
        },
        "submission_data_saved": {
            "title": "Envio salvo",
            "description": "Seus dados de envio foram salvos com sucesso.",
            "color": "#2ecc71"
        },
        "vote_success_down": {
            "title": "Voto registrado",
            "description": "Seu voto negativo foi registrado.",
            "color": "#e74c3c"
        },
        "vote_success_up": {
            "title": "Voto registrado",
            "description": "Seu voto positivo foi registrado.",
            "color": "#2ecc71"
        }
    },
    "logs": {
        "message_deleted": {
            "title": "🗑️ Mensagem excluída",
            "author": "Autor",
            "channel": "Canal",
            "content": "Conteúdo",
            "no_text": "*Sem texto (talvez uma incorporação ou arquivo)*",
            "color": "#e74c3c"
        },
        "message_updated": {
            "title": "📝 Mensagem atualizada",
            "author": "Autor",
            "channel": "Canal",
            "before": "Antes de",
            "after": "Depois de",
            "color": "#3498db"
        }
    },
    "admin": {
        "embed_editor": {
            "title": "🛠️ Editor incorporado",
            "description": "Você está editando uma mensagem padrão. Use os botões para alterar os campos.",
            "color": "#F1C40F"
        }
    },
    "socials": {
        "twitch": {
            "title": "📡 **{streamer}** está ao vivo!",
            "description": "### {título}\n\nEi! **{streamer}** acabei de ligar a câmera no Twitch. Não perca o show!\n\n[Participe ao vivo]({url})",
            "color": "#6441a5",
            "footer": "Notificações sociais | Verix"
        },
        "youtube": {
            "title": "🎥 Novo vídeo de **{streamer}**!",
            "description": "### {título}\n\nAcabou de sair vídeo novo no canal! Vá dar uma olhada.",
            "color": "#ff0000",
            "footer": "Notificações sociais | Verix"
        },
        "twitter": {
            "title": "𝕏 (Twitter) Nova postagem de **{streamer}**",
            "description": "{descrição}",
            "color": "#000000",
            "footer": "Notificações sociais | Verix"
        },
        "instagram": {
            "title": "📸 Nova postagem de **{streamer}**",
            "description": "### {title}\n\nNovo conteúdo carregado no Instagram! Vá dar uma olhada.",
            "color": "#e1306c",
            "footer": "Notificações sociais | Verix"
        },
        "tiktok": {
            "title": "🎵 Novo TikTok de **{streamer}**",
            "description": "### {title}\n\nUm novo vídeo acaba de ser publicado no TikTok! Assista agora.",
            "color": "#000000",
            "footer": "Notificações sociais | Vérix"
        },
        "reddit": {
            "title": "👾 Nova postagem em **r/{username}**!",
            "description": "### {título}\n\n**{author}** publicou uma nova postagem em **r/{username}**!\n\n{descrição}",
            "color": "#ff4500",
            "footer": "Notificações sociais | Verix"
        },
        "steam": {
            "title": "🎮 Novo anúncio para **{username}**!",
            "description": "### {título}\n\n**{username}** lançou uma nova atualização/anúncio!\n\n{descrição}",
            "color": "#1b2838",
            "footer": "Notificações sociais | Verix"
        },
        "kick": {
            "title": "Kick ao vivo: **{streamer}**",
            "description": "### {title}\n\nAssista à transmissão agora no Kick.",
            "color": "#53fc18",
            "footer": "Notificações sociais | Verix"
        },
        "github": {
            "title": "Nova atualização do GitHub para **{username}**",
            "description": "### {title}\n\n{descrição}",
            "color": "#24292f",
            "footer": "Notificações sociais | Verix"
        },
        "rss": {
            "title": "Nova atualização de **{username}**",
            "description": "### {title}\n\n{descrição}",
            "color": "#f97316",
            "footer": "Notificações sociais | Vérix"
        },
        "telegram": {
            "title": "Nova postagem no Telegram de **{nome de usuário}**",
            "description": "{descrição}",
            "color": "#26a5e4",
            "footer": "Notificações sociais | Verix"
        },
        "default_titles": {
            "Twitch": "📡 **{streamer}** está ao vivo!",
            "YouTube": "🎥 Novo vídeo de **{streamer}**!",
            "Twitter": "𝕏 (Twitter) Nova postagem de **{streamer}**",
            "Instagram": "📸 Nova postagem de **{streamer}**",
            "TikTok": "🎵 Novo TikTok de **{streamer}**",
            "Reddit": "👾 Nova postagem em **r/{username}**!",
            "Steam": "🎮 Novo anúncio para **{username}**!"
        },
        "default_descriptions": {
            "Twitch": "### {título}\n\nEi! **{streamer}** acabei de ligar a câmera no Twitch. Não perca o show!\n\n[Participe ao vivo]({url})",
            "YouTube": "### {title}\n\nAcabou de sair vídeo novo no canal! Vá dar uma olhada.",
            "Twitter": "{descrição}",
            "Instagram": "### {título}\n\nNovo conteúdo carregado no Instagram! Vá dar uma olhada.",
            "TikTok": "### {título}\n\nUm novo vídeo acaba de ser publicado no TikTok! Assista agora.",
            "Reddit": "### {título}\n\n**{author}** publicou uma nova postagem em **r/{username}**!\n\n{descrição}",
            "Steam": "### {título}\n\n**{username}** lançou uma nova atualização/anúncio!\n\n{description}"
        },
        "button_labels": {
            "Twitch": "Assistir ao vivo",
            "YouTube": "Assistir ao vídeo",
            "Twitter": "Ver no 𝕏",
            "X": "Ver no 𝕏",
            "Instagram": "Ver no Instagram",
            "TikTok": "Ver no TikTok",
            "Reddit": "Ver no Reddit",
            "Steam": "Ver no Steam",
            "Kick": "Ver no Kick",
            "GitHub": "Ver no GitHub",
            "RSS": "Abrir item de feed",
            "Telegram": "Ver no Telegram",
            "default": "Abrir link"
        },
        "footer": "Notificações Sociais | Verix"
    },
    "leveling": {
        "disabled": {
            "title": "📡 Módulo desativado",
            "description": "O módulo **Leveling & Rewards** está atualmente desativado neste servidor. Entre em contato com a equipe para obter mais informações.",
            "color": "#f1c40f"
        },
        "rank": {
            "title": "✨ Carta de classificação - {username}",
            "level": "📊 Nível",
            "rank": "🏆 Classificação",
            "xp": "🧪 Progresso de XP",
            "progress": "📈 Progressão",
            "messages": "💬 Total de mensagens",
            "daily_limit": "📅 Limite diário",
            "color": "#5865f2"
        },
        "leaderboard": {
            "title": "🏆 Tabela de classificação do servidor",
            "empty_title": "⚠️ Tabela de classificação vazia",
            "empty_desc": "A tabela de classificação está vazia no momento. Comece a enviar mensagens para ganhar XP!",
            "entry": "{pos} <@{userId}> • **Nível {level}** ({xp} XP)",
            "footer": "Sua classificação: {rank} | Comunidade ativa",
            "unranked": "Sem classificação",
            "color": "#5865f2"
        }
    },
    "poll": {
        "ended": {
            "title": "Enquete encerrada",
            "description": "Esta enquete já terminou.",
            "color": "#f1c40f"
        },
        "invalid_option": {
            "title": "Opção de enquete inválida",
            "description": "Esta opção de enquete não está mais disponível.",
            "color": "#e74c3c"
        },
        "vote_removed": {
            "title": "Voto removido",
            "description": "Seu voto foi removido com sucesso.",
            "color": "#2ecc71"
        },
        "vote_recorded": {
            "title": "Voto registrado",
            "description": "Seu voto foi registrado com sucesso.",
            "color": "#2ecc71"
        }
    },
    "reactionroles": {
        "role_not_found": {
            "title": "Função não encontrada",
            "description": "A função configurada não existe mais. Entre em contato com um administrador.",
            "color": "#e74c3c"
        },
        "role_removed": {
            "title": "Função removida",
            "description": "Função **{role}** removida com sucesso.",
            "color": "#2ecc71"
        },
        "role_assigned": {
            "title": "Função atribuída",
            "description": "Função **{role}** atribuída com sucesso.",
            "color": "#2ecc71"
        },
        "update_error": {
            "title": "Falha na atualização da função",
            "description": "Não é possível atualizar a função. Verifique as permissões do bot e a hierarquia de funções.",
            "color": "#e74c3c"
        }
    },
    "common": {
        "no_reason": "Nenhum motivo fornecido",
        "result": "Resultado",
        "reason": "Motivo",
        "next_step": "Próxima etapa",
        "sent": "Enviado",
        "none": "Nenhum",
        "loading": "Carregando...",
        "error": "Ocorreu um erro.",
        "immediately": "imediatamente",
        "start_time": "Hora de início",
        "reset_timer": "Redefinir temporizador",
        "antispam": "Aguarde antes de tentar novamente."
    },
    "support": {
        "paused_reason": "A fila de voz está pausada no momento.",
        "queue_log": {
            "title": "Fila de suporte",
            "description": "{vip_text}Um usuário está aguardando suporte.\n\n**Usuário:** {usuário}\n**ID:** `{user_id}`\n**Posição:** `{position}`",
            "color": "#f1c40f"
        },
        "staffLog": {
            "title": "Sessão de suporte",
            "description": "Usuário **{user}** entrou no suporte.\n\n**Canal:** {voice_channel}",
            "color": "#f1c40f"
        }
    },
    "tempvoice": {
        "not_manageable": {
            "title": "Canal de voz não gerenciado",
            "description": "Este canal de voz temporário não é gerenciado pela Verix.",
            "color": "#e74c3c"
        },
        "not_owner": {
            "title": "Não é proprietário do canal",
            "description": "Somente o proprietário temporário do canal pode usar este controle.",
            "color": "#e74c3c"
        },
        "lock_success": {
            "title": "Canal bloqueado",
            "description": "Seu canal de voz temporário foi bloqueado.",
            "color": "#2ecc71"
        },
        "unlock_success": {
            "title": "Canal desbloqueado",
            "description": "Seu canal de voz temporário foi desbloqueado.",
            "color": "#2ecc71"
        },
        "limit_update": {
            "title": "Limite de usuário atualizado",
            "description": "O limite de usuário agora está definido como **{limit}**.",
            "color": "#2ecc71"
        },
        "rename_success": {
            "title": "Canal renomeado",
            "description": "O nome do canal foi atualizado para **{name}**.",
            "color": "#2ecc71"
        }
    }
};
