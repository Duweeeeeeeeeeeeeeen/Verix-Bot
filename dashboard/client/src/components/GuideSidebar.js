import { useState, useEffect } from 'react';
import { HelpCircle, X, Lightbulb, Zap } from 'lucide-react';

const GUIDE_CONTENT = {
  whitelist: (context) => [
    {
      title: "Modalità d'ingresso",
      match: true,
      text: context.mode === 'HYBRID' 
        ? "Hai messo la modalità Ibrida: è la scelta dei pro. L'utente prima si suda il test scritto e poi lo staff gli fa l'orale per essere sicuri al 100%."
        : context.mode === 'VOICE'
        ? "Solo vocale? Preparati a passare le serate a parlare! Chi entra deve solo cliccare un tasto e aspettare che lo staff lo chiami."
        : "Semplice e pulito: l'utente risponde alle domande e lo staff decide se va bene. Ottimo per server con tanta utenza."
    },
    {
      title: "Cooldown Fallimento",
      match: context.cooldown > 48,
      text: "Occhio che con " + context.cooldown + " ore di blocco sei cattivissimo! Se uno sbaglia il test se ne va dal server per un bel pezzo."
    },
    {
      title: "Staff Roles",
      match: !context.staffRoleIds?.length,
      text: "Ehi! Non hai messo nessun ruolo staff. Se non lo fai, nessuno potrà accettare o rifiutare le richieste!"
    }
  ],
  verify: (context) => [
    {
      title: "Tipo di Verifica",
      match: true,
      text: "La verifica serve a non farti spaccare il server dai bot. Il 'Tasto' è il più veloce, ma il 'Codice' è quello che rompe più le scatole ai bot cattivi."
    },
    {
      title: "Ruolo da dare",
      match: !context.roleId,
      text: "Non hai scelto il ruolo da assegnare! Senza questo, l'utente clicca ma rimane un fantasma senza permessi."
    }
  ],
  tickets: (context) => [
    {
      title: "Panic Mode",
      match: context.panicMode,
      text: "PANICO ATTIVATO! Nessuno può aprire ticket ora. Usalo solo se il server sta andando a fuoco o se lo staff è tutto a nanna."
    },
    {
      title: "Naming Ticket",
      match: true,
      text: "Usa nomi chiari come 'ticket-{user}'. Se li chiami tutti uguali lo staff impazzisce a capire di chi è cosa."
    }
  ],
  welcome: (context) => [
      {
          title: "Messaggio d'ingresso",
          match: true,
          text: "Non dimenticare di usare {user} nel messaggio! Se non lo fai, sembrerà un messaggio freddo e automatico."
      },
      {
          title: "Embed vs Testo",
          match: context.useEmbed,
          text: "L'embed è molto più figo e professionale, ma ricorda di impostare un bel colore per non farlo apparire spento."
      }
  ],
  fivem: (context) => [
      {
          title: "Multi-Server",
          match: context.servers?.length > 1,
          text: "Stai gestendo più server? Grande! Ricorda solo di non mettere lo stesso canale per i log di tutti, o diventerà un macello."
      }
  ],
  photocontest: (context) => [
    {
      title: "Intervallo Contest",
      match: context.interval < 12,
      text: "Uh, contest ogni " + context.interval + " ore? Così li stressi! Magari allunga un po' i tempi per far salire l'attesa."
    },
    {
      title: "Hall of Fame",
      match: !context.hallOfFameChannelId,
      text: "Non hai messo un canale per la Hall of Fame. È un peccato, le foto dei vincitori andrebbero messe in bacheca!"
    },
    {
      title: "Premi Automonici",
      match: true,
      text: "Il Photo Contest è il modo migliore per tenere attivo il server. Ricorda che puoi forzare l'avvio di un contest in qualsiasi momento dal tasto in alto!"
    }
  ],
  global: (context) => [
    {
      title: "Permessi Master",
      match: context.adminRoleIds?.length > 1,
      text: "Hai messo diversi ruoli admin. Ricorda che questi utenti possono cambiare TUTTO, anche rompere il bot se non sanno cosa toccano!"
    },
    {
      title: "Logging Fallback",
      match: context.logs?.enabled && !context.logs?.channelId,
      text: "Hai attivato i log ma non hai messo un canale di fallback. Se un modulo non ha un log dedicato, scriverà qui."
    }
  ],
  autoclear: (context) => [
    {
      title: "Senza Slot",
      match: !context.slots || context.slots.length === 0,
      text: "Non hai ancora aggiunto nessuno slot! Clicca su 'Aggiungi Slot' per iniziare a ripulire in automatico i tuoi canali."
    },
    {
      title: "Frequenza Molto Alta",
      match: context.slots?.some(s => s.intervalMinutes < 10),
      text: "Hai impostato uno slot con una frequenza inferiore a 10 minuti. Il bot ripulirà il canale molto spesso, assicurati che sia davvero ciò che vuoi."
    }
  ],
  moderation_hub: (context) => [
    {
      title: "Protezione Attiva",
      match: context.enabled,
      text: "Il sistema è attivo! Ricorda di configurare i limiti anti-spam per non essere troppo punitivo con gli utenti normali."
    },
    {
      title: "Cooldown Warning",
      match: true,
      text: "Ho impostato un cooldown di 10 secondi per i messaggi di avviso del bot: così evitiamo che il bot stesso faccia spam!"
    },
    {
      title: "Punizioni Progressive",
      match: !context.punishments || context.punishments.length < 3,
      text: "Hai poche punizioni configurate. Un buon sistema ha almeno 3 livelli: Warn, Timeout e poi Ban."
    },
    {
      title: "Logs Staff",
      match: true,
      text: "La moderazione automatica è potente, ma controlla sempre i log per assicurarti che non ci siano falsi positivi con gli utenti più attivi."
    },
    {
      title: "Gestione Moderazione",
      match: true,
      text: "I comandi /ban e /kick sono disponibili su Discord per azioni rapide. Le punizioni seguiranno i protocolli configurati qui."
    }
  ],
  socials: (context) => [
    {
      title: "Configurazione Webhook",
      match: true,
      text: "Per Instagram, TikTok e Twitter devi usare un servizio come IFTTT. Copia il link che trovi nella tab 'Impostazioni' del social scelto."
    },
    {
      title: "Mention Everyone",
      match: Object.values(context.platforms || {}).some(p => p.mentionEveryone),
      text: "Hai attivato il ping @everyone su alcuni social. Occhio che se posti tanto, gli utenti potrebbero arrabbiarsi per le troppe notifiche!"
    }
  ],
  voice: (context) => [
    {
      title: "Canale Join",
      match: !context.joinChannelId,
      text: "Non hai messo un canale di join! Senza quello, il bot non sa dove 'ascoltare' gli utenti che vogliono fare il colloquio."
    },
    {
      title: "Staff Roles",
      match: !context.staffRoleIds?.length,
      text: "Mancano i ruoli staff. Ricorda che solo chi ha questi ruoli può vedere i comandi per spostare le persone dalle code."
    }
  ],
  management: (context) => [
    {
      title: "Ricerca Utente",
      match: true,
      text: "Inserisci l'ID Discord dell'utente per vedere tutto il suo passato: quante volte ha provato il test e se ha cooldown attivi."
    },
    {
      title: "Reset Totale",
      match: true,
      text: "Il tasto rosso 'Resetta Stato' cancella TUTTO. Usalo solo se vuoi dare una seconda possibilità completa a un utente."
    }
  ],
  embed_studio: (context) => [
    {
      title: "Variables Guide",
      match: true,
      text: "Usa le variabili come {user} o {guild} per rendere i messaggi dinamici. Il bot le sostituirà automaticamente all'invio."
    },
    {
      title: "Colori Premium",
      match: true,
      text: "Scegli colori che contrastino bene con il dark mode di Discord. Il verde smeraldo e il blu indigo sono i più eleganti."
    }
  ],
  system: (context) => [
    {
      title: "Manutenzione",
      match: true,
      text: "Da qui puoi controllare lo stato di salute dei processi. Se vedi errori rossi, prova a riavviare il modulo specifico."
    }
  ],
  giveaway: (context) => [
    {
      title: "Gestione Live",
      match: true,
      text: "Puoi gestire i partecipanti direttamente dal messaggio Discord cliccando sui tasti dell'embed."
    },
    {
      title: "Programmazione",
      match: true,
      text: "I giveaway programmati partono automaticamente al minuto esatto stabilito. Assicurati che l'ora sia corretta!"
    },
    {
      title: "Visibilità Canali",
      match: true,
      text: "Vengono mostrati solo i canali Testuali e di Annuncio. Se un canale non appare, verifica che il bot abbia i permessi di lettura."
    },
    {
      title: "Futuri Aggiornamenti",
      match: true,
      text: "Presto potrai visualizzare e gestire la lista nomi dei partecipanti direttamente da questa dashboard."
    }
  ]
};

export default function GuideSidebar({ type, context = {}, isOpen, onToggle }) {
  const [hints, setHints] = useState([]);

  useEffect(() => {
    if (GUIDE_CONTENT[type]) {
      setHints(GUIDE_CONTENT[type](context || {}).filter(h => h.match));
    } else {
      setHints([]);
    }
  }, [type, context]);

  return (
    <>
      <aside className={`global-guide-sidebar animate fade-in ${isOpen ? 'is-open' : 'is-closed'}`}>
        <div className="guide-header">
          <div className="guide-title">
            <HelpCircle size={18} className="text-primary" />
            <span>Guida Contestuale</span>
          </div>
          <button onClick={onToggle} className="guide-close-btn">
            <X size={18} />
          </button>
        </div>

        <div className="guide-scroll-area">
          <div className="guide-content">
            {hints.length === 0 ? (
              <div className="guide-empty">
                 <Zap size={24} opacity={0.3} />
                 <p>Nulla da segnalare per questo modulo, sembra tutto configurato correttamente!</p>
              </div>
            ) : (
              hints.map((hint, i) => (
                <div key={i} className="guide-card">
                  <div className="guide-card-header">
                    <Lightbulb size={14} className="text-amber" />
                    <span className="guide-card-title">{hint.title}</span>
                  </div>
                  <p className="guide-card-text">{hint.text}</p>
                </div>
              ))
            )}
            
            <div className="guide-pro-tip">
                <div className="pro-tip-header">
                    <Zap size={14} />
                    <span>Pro Tip</span>
                </div>
                <p>Configura i log per ogni modulo per avere il pieno controllo su cosa accade nel server.</p>
            </div>
          </div>
        </div>


        <style jsx>{`
          .global-guide-sidebar {
            width: 320px;
            height: 100vh;
            background: var(--bg-sidebar);
            border-left: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
            overflow: hidden;
            position: relative;
            z-index: 50;
          }

          .global-guide-sidebar.is-closed {
            width: 0;
            border-left: none;
            opacity: 0;
            pointer-events: none;
          }

          .guide-header {
            padding: 32px 24px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--bg-sidebar);
            height: 108px;
            flex-shrink: 0;
            min-width: 320px; /* Prevent content squishing during transition */
          }

          .guide-title {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .guide-title span {
            font-size: 0.75rem;
            font-weight: 850;
            color: var(--text-main);
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .guide-close-btn {
            background: var(--bg-badge);
            border: 1px solid var(--border);
            color: var(--text-dim);
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: 0.2s;
          }

          .guide-close-btn:hover { 
            background: var(--error); 
            color: var(--text-on-primary); 
            border-color: var(--error);
          }

          .guide-scroll-area {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
          }

          /* Scrollbar Customization */
          .guide-scroll-area::-webkit-scrollbar { width: 4px; }
          .guide-scroll-area::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 10px; }

          .guide-content {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .guide-card {
            background: var(--bg-badge);
            border-radius: 16px;
            padding: 20px;
            border: 1px solid var(--border);
            transition: 0.3s;
          }

          .guide-card:hover {
            background: var(--bg-badge);
            border-color: var(--primary);
            transform: translateY(-2px);
          }

          .guide-card-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
          }

          .guide-card-title {
            font-size: 0.7rem;
            font-weight: 900;
            color: #f59e0b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .guide-card-text {
            font-size: 0.85rem;
            color: var(--text-dim);
            line-height: 1.6;
          }

          .guide-pro-tip {
            margin-top: 24px;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%);
            border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 16px;
            padding: 20px;
          }

          .pro-tip-header {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--primary);
            font-weight: 800;
            font-size: 0.75rem;
            text-transform: uppercase;
            margin-bottom: 8px;
          }

          .pro-tip-header span { letter-spacing: 1px; }

          .guide-pro-tip p {
            font-size: 0.8rem;
            color: var(--text-dim);
            line-height: 1.5;
          }

          .guide-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            text-align: center;
            gap: 16px;
            color: var(--text-muted);
          }

          .guide-empty p { font-size: 0.85rem; line-height: 1.5; }

          .guide-footer {
            padding: 24px;
            border-top: 1px solid var(--border);
            background: var(--bg-sidebar-alt);
          }

          .footer-logo {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 4px;
          }

          .footer-logo img { width: 16px; height: 16px; opacity: 0.5; }
          .footer-logo span { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }

          .guide-footer p {
            font-size: 0.6rem;
            color: var(--text-muted);
          }


          .guide-dot {
            position: absolute;
            top: -4px;
            right: -4px;
            width: 14px;
            height: 14px;
            background: #f59e0b;
            border: 3px solid var(--bg-sidebar);
            border-radius: 50%;
            animation: pulse-amber 2s infinite;
          }

          @keyframes pulse-amber {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.5); }
            70% { transform: scale(1.3); box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
          }

          .text-primary { color: var(--primary); }
          .text-amber { color: #f59e0b; }

          @media (max-width: 1000px) {
            .global-guide-sidebar {
              display: none;
            }
          }
        `}</style>
      </aside>
    </>
  );
}
