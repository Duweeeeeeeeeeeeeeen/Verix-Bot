import { useState, useEffect } from 'react';
import { HelpCircle, ChevronRight, ChevronLeft, Lightbulb, AlertTriangle, Zap, Info } from 'lucide-react';

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
      title: "Rotazione Temi",
      match: context.automaticThemes && (!context.themesList || context.themesList.length < 5),
      text: "Hai pochi temi in lista. Se la rotazione è automatica, gli utenti si stuferanno presto di vedere le stesse sfide."
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
  ]
};

export default function GuideSidebar({ type, context }) {
  const [isOpen, setIsOpen] = useState(true);
  const [hints, setHints] = useState([]);

  useEffect(() => {
    if (GUIDE_CONTENT[type]) {
      setHints(GUIDE_CONTENT[type](context).filter(h => h.match));
    }
  }, [type, context]);

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="guide-toggle-closed">
        <Info size={20} />
      </button>
    );
  }

  return (
    <aside className="guide-sidebar animate fade-in">
      <div className="guide-header">
        <div className="guide-title">
          <HelpCircle size={18} className="text-primary" />
          <span>Guida</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="guide-close-btn">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="guide-content">
        {hints.length === 0 ? (
          <div className="guide-empty">
             <Zap size={24} opacity={0.3} />
             <p>Nulla da segnalare al momento, tutto sembra in ordine!</p>
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
      </div>

      <div className="guide-footer">
        <p>Verix Dashboard System v1.2</p>
      </div>

      <style jsx>{`
        .guide-sidebar {
          width: 320px;
          height: fit-content;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: sticky;
          top: 100px;
          backdrop-filter: blur(10px);
          box-shadow: var(--shadow-lg);
        }

        .guide-header {
          padding: 18px 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.02);
        }

        .guide-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: white;
        }

        .guide-close-btn {
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          transition: 0.2s;
        }

        .guide-close-btn:hover { color: white; transform: rotate(90deg); }

        .guide-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .guide-card {
          background: rgba(255,191,0,0.02);
          border-radius: 14px;
          padding: 16px;
          border: 1px solid rgba(255,191,0,0.1);
        }

        .guide-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .guide-card-title {
          font-size: 0.75rem;
          font-weight: 800;
          color: #f59e0b;
          text-transform: uppercase;
        }

        .guide-card-text {
          font-size: 0.85rem;
          color: #cbd5e1;
          line-height: 1.5;
        }

        .guide-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
          gap: 12px;
          color: var(--text-dim);
        }

        .guide-empty p { font-size: 0.8rem; }

        .guide-footer {
          padding: 12px 20px;
          text-align: center;
          border-top: 1px solid var(--border);
          font-size: 0.65rem;
          color: var(--text-dim);
          background: rgba(0,0,0,0.1);
        }

        .guide-toggle-closed {
          position: fixed;
          top: 100px;
          right: 24px;
          width: 52px;
          height: 52px;
          background: #818cf8; /* Solid base color */
          color: white;
          border: none;
          outline: none;
          appearance: none;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 10px 25px -5px rgba(129, 140, 248, 0.5), 0 8px 10px -6px rgba(129, 140, 248, 0.5);
          z-index: 1000; /* Ensure it stays on top */
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .guide-toggle-closed:hover { 
          transform: translateY(-4px) scale(1.05); 
          background: #6366f1; 
          box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.6);
        }

        .guide-toggle-closed svg {
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }

        .text-primary { color: var(--primary); }
        .text-amber { color: #f59e0b; }
      `}</style>
    </aside>
  );
}
