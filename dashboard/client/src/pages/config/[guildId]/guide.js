import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import EmbedPreview from '../../../components/EmbedPreview';
import { 
  Book, 
  Code, 
  Variable, 
  Shield, 
  Ticket, 
  Mic2, 
  Info,
  ChevronRight,
  Zap,
  MessageSquare,
  Type,
  Layout as LayoutIcon,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';

export default function GuidePage() {
  const router = useRouter();
  const { guildId } = router.query;

  const placeholders = [
    { name: '{user}', desc: 'Menziona l\'utente coinvolto nell\'azione.', example: 'Ciao {user}!' },
    { name: '{guild}', desc: 'Il nome del server Discord attuale.', example: 'Benvenuto in {guild}' },
    { name: '{reason}', desc: 'La motivazione inserita dallo staff (es. motivo rifiuto).', example: 'Rifiutato per {reason}' },
    { name: '{staff}', desc: 'Menziona lo staffer che ha eseguito il comando.', example: 'Gestito da {staff}' },
    { name: '{channel}', desc: 'Menziona il canale di riferimento.', example: 'Vai in {channel}' }
  ];

  const prefixes = [
    { module: 'Tickets', prefix: 'tk_', desc: 'Usa questo prefisso per le categorie Discord dedicate ai ticket (es. "tk_supporto"). Il bot riconoscerà automaticamente i canali creati qui.' },
    { module: 'Whitelist', prefix: 'wl_', desc: 'Utilizzato internamente per identificare i database e i log relativi alle candidature.' },
    { module: 'Voice', prefix: 'v_', desc: 'Identifica i canali vocali temporanei creati durante i colloqui.' }
  ];

  const limits = [
    { target: 'Titolo Embed', limit: '256 caratteri' },
    { target: 'Descrizione', limit: '4096 caratteri' },
    { target: 'Footer', limit: '2048 caratteri' },
    { target: 'Campi (Fields)', limit: '25 campi max' }
  ];

  return (
    <Layout guildId={guildId}>
      <div className="animate">
        <header style={{ marginBottom: '60px' }}>
          <div className="align-center" style={{ color: 'var(--primary)', marginBottom: '12px' }}>
             <Book size={20} fill="currentColor" />
             <span style={{ fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem' }}>Manuale Utente</span>
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '950', letterSpacing: '-2px', marginBottom: '15px' }}>Centrale Guida</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '800px', lineHeight: '1.6' }}>
            Impara a configurare Verix come un professionista. Qui trovi tutto il necessario su placeholders, formati e prefissi di sistema.
          </p>
        </header>

        <div className="guide-grid">
          
          {/* Section 1: Placeholders */}
          <section className="card glass-heavy" style={{ gridColumn: 'span 2' }}>
            <div className="align-center" style={{ marginBottom: '30px' }}>
              <div className="icon-box" style={{ color: 'var(--primary)', display: 'flex' }}><Variable size={24} /></div>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Placeholder Embed</h2>
                <p className="text-description">Usa questi tag dinamici per personalizzare i tuoi messaggi.</p>
              </div>
            </div>
            
            <div className="placeholder-list">
              {placeholders.map((p, i) => (
                <div key={i} className="placeholder-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <code className="tag-code">{p.name}</code>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', background: 'rgba(var(--primary-rgb), 0.1)', padding: '2px 8px', borderRadius: '4px' }}>TAG</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '12px' }}>{p.desc}</p>
                  <div className="example-box">
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Esempio</span>
                    <code style={{ fontSize: '0.8rem', color: 'var(--success)' }}>{p.example}</code>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Prefixes */}
          <section className="card glass">
            <div className="align-center" style={{ marginBottom: '30px' }}>
                <div className="icon-box" style={{ color: 'var(--accent)', display: 'flex' }}><Shield size={24} /></div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Prefissi Moduli</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {prefixes.map((p, i) => (
                    <div key={i} style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '800', fontSize: '1rem' }}>{p.module}</span>
                            <code className="tag-code" style={{ fontSize: '0.75rem', color: 'var(--accent)', background: 'rgba(245, 158, 11, 0.1)' }}>{p.prefix}</code>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.desc}</p>
                    </div>
                ))}
            </div>
          </section>

          {/* Section 3: Formats & Markdown */}
          <section className="card glass">
            <div className="align-center" style={{ marginBottom: '30px' }}>
                <div className="icon-box" style={{ color: '#8b5cf6', display: 'flex' }}><Type size={24} /></div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Formati & Limiti</h2>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '12px', textTransform: 'uppercase' }}>Markdown Supportato</h4>
                <div className="markdown-grid">
                    <div><b>**Grassetto**</b></div>
                    <div><i>*Corsivo*</i></div>
                    <div><u>__Sottolineato__</u></div>
                    <div><code>`Codice`</code></div>
                    <div style={{ gridColumn: 'span 2' }}><code>```Blocco Codice```</code></div>
                </div>
            </div>

            <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '12px', textTransform: 'uppercase' }}>Limiti Discord</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {limits.map((l, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{l.target}</span>
                            <span style={{ fontWeight: '700' }}>{l.limit}</span>
                        </div>
                    ))}
                </div>
            </div>
          </section>

          {/* Section 4: Live Example */}
          <section className="card glass-heavy shadow-glow" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div className="align-center">
                    <div className="icon-box" style={{ color: 'var(--primary)', display: 'flex' }}><ImageIcon size={24} /></div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Esempio di Embed Reale</h2>
                </div>
                <div className="badge-pro">LIVE PREVIEW</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
                <div>
                    <h4 style={{ marginBottom: '15px', fontWeight: '700' }}>Come appare nel Dashboard:</h4>
                    <div className="card" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Titolo:</p>
                        <code className="example-input">Benvenuto {`{user}`}!</code>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '20px', marginBottom: '10px' }}>Descrizione:</p>
                        <code className="example-input" style={{ height: '80px', display: 'block', padding: '10px' }}>
                            Sei entrato in **{`{guild}`}**.<br/>
                            Leggi il canale {`{channel}`} per iniziare!
                        </code>
                    </div>
                </div>
                <div>
                     <h4 style={{ marginBottom: '15px', fontWeight: '700' }}>Risultato su Discord:</h4>
                     <EmbedPreview 
                        data={{
                            title: 'Benvenuto {user}!',
                            description: 'Sei entrato in **{guild}**.\nLeggi il canale {channel} per iniziare!',
                            color: '#10b981',
                            footer: 'Verix Premium Integration'
                        }} 
                     />
                </div>
            </div>
          </section>

        </div>

        <style jsx>{`
          .guide-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
          }
          .icon-box {
            padding: 12px;
            background: rgba(var(--primary-rgb), 0.1);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .placeholder-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 20px;
          }
          .placeholder-card {
            padding: 20px;
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border);
            border-radius: 16px;
            transition: var(--transition-normal);
          }
          .placeholder-card:hover {
            border-color: var(--primary);
            background: rgba(var(--primary-rgb), 0.02);
            transform: translateY(-5px);
          }
          .tag-code {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 800;
            color: var(--primary);
          }
          .example-box {
            padding: 10px;
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
            border-left: 3px solid var(--primary);
          }
          .markdown-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            padding: 15px;
            background: rgba(255,255,255,0.02);
            border-radius: 12px;
            font-size: 0.9rem;
          }
          .example-input {
            display: block;
            background: #1e1e1e;
            color: #dcdcdc;
            padding: 8px 12px;
            border-radius: 6px;
            font-family: monospace;
            border: 1px solid #333;
          }
          .badge-pro {
            background: var(--primary);
            color: white;
            padding: 4px 12px;
            border-radius: 8px;
            font-size: 0.7rem;
            font-weight: 900;
            letter-spacing: 1px;
            box-shadow: 0 4px 12px var(--primary-glow);
          }
          .shadow-glow { box-shadow: 0 0 30px rgba(var(--primary-rgb), 0.1); }
          
          @media (max-width: 1200px) {
            .guide-grid { grid-template-columns: 1fr; }
            .guide-grid > :nth-child(n) { grid-column: span 1 !important; }
          }
        `}</style>
      </div>
    </Layout>
  );
}
