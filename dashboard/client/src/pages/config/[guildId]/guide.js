import { useRouter } from 'next/router';
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
  Image as ImageIcon,
  BookOpen,
  Terminal,
  Layers
} from 'lucide-react';

export default function GuidePage() {
  const router = useRouter();
  const { guildId } = router.query;

  const placeholders = [
    { name: '{user}', desc: 'Menziona l\'utente coinvolto.', example: 'Ciao {user}!' },
    { name: '{guild}', desc: 'Il nome del server attuale.', example: 'Benvenuto in {guild}' },
    { name: '{reason}', desc: 'Motivazione dello staff.', example: 'Rifiutato per {reason}' },
    { name: '{staff}', desc: 'Lo staffer operativo.', example: 'Gestito da {staff}' },
    { name: '{channel}', desc: 'Canale di riferimento.', example: 'Vai in {channel}' }
  ];

  const limits = [
    { target: 'Titolo Embed', limit: '256 chars' },
    { target: 'Descrizione', limit: '4096 chars' },
    { target: 'Footer', limit: '2048 chars' },
    { target: 'Fields', limit: '25 max' }
  ];

  return (
    <>
      <div className="animate">
        
        {/* Module Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <BookOpen size={24} />
              </div>
              <div className="header-text">
                <h1>Documentazione</h1>
                <p>Guida rapida all'utilizzo di placeholders, formati e limiti di sistema.</p>
              </div>
           </div>
        </header>

        <div className="guide-grid-p">
           {/* Section: Placeholders */}
           <section className="card section-card-p">
              <div className="align-center" style={{ marginBottom: '24px' }}>
                <Variable size={20} color="var(--primary)" />
                <h3>Placeholder Dinamici</h3>
              </div>
              <div className="tags-grid-p">
                {placeholders.map((p, i) => (
                    <div key={i} className="tag-card-v2">
                        <div className="tag-header-p">
                            <code className="tag-p">{p.name}</code>
                        </div>
                        <p className="tag-desc-p">{p.desc}</p>
                        <div className="tag-example-p">
                            <span>Esempio:</span>
                            <code>{p.example}</code>
                        </div>
                    </div>
                ))}
              </div>
           </section>

           <div className="guide-side-p">
              {/* Section: Limits */}
              <section className="card section-card-p">
                <div className="align-center" style={{ marginBottom: '20px' }}>
                    <Layers size={18} color="var(--primary)" />
                    <h3>Limiti Discord</h3>
                </div>
                <div className="limits-stack-p">
                    {limits.map((l, i) => (
                        <div key={i} className="limit-row-p">
                            <span>{l.target}</span>
                            <b>{l.limit}</b>
                        </div>
                    ))}
                </div>
              </section>

              {/* Section: Markdown */}
              <section className="card section-card-p" style={{ marginTop: '24px' }}>
                <div className="align-center" style={{ marginBottom: '20px' }}>
                    <Terminal size={18} color="var(--primary)" />
                    <h3>Markdown</h3>
                </div>
                <div className="markdown-hints-p">
                    <code>**Bold**</code>
                    <code>*Italic*</code>
                    <code>__Underline__</code>
                    <code>`Code`</code>
                </div>
              </section>
           </div>
        </div>

        {/* Live Preview Area */}
        <section className="card section-card-p" style={{ marginTop: '32px' }}>
            <div className="align-center" style={{ marginBottom: '24px' }}>
                <ImageIcon size={20} color="var(--primary)" />
                <h3>Anteprima Simulazione</h3>
            </div>
            <div className="preview-demo-grid">
                <div className="input-mock-p">
                    <label className="text-label">Input nel Dashboard</label>
                    <div className="mock-field-v2">
                        <span>Benvenuto {'{user}'}!</span>
                        <p>Sei entrato in **{'{guild}'}**.</p>
                    </div>
                </div>
                <div className="discord-mock-p">
                    <label className="text-label">Risultato Discord</label>
                    <div className="embed-container-p">
                        <EmbedPreview 
                            data={{
                                title: 'Benvenuto {user}!',
                                description: 'Sei entrato in **{guild}**.\nLeggi i canali informativi per iniziare!',
                                color: '#6366f1'
                            }} 
                        />
                    </div>
                </div>
            </div>
        </section>

        <style jsx>{`
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: rgba(255,255,255,0.02); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: rgba(129, 140, 248, 0.1); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }

            .guide-grid-p { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
            
            .tags-grid-p { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
            .tag-card-v2 { background: rgba(255,255,255,0.02); border: 1px solid var(--border); padding: 16px; border-radius: 14px; display: flex; flex-direction: column; gap: 10px; transition: 0.2s; }
            .tag-card-v2:hover { border-color: var(--primary); transform: translateY(-2px); }
            .tag-p { color: var(--primary); font-weight: 800; font-family: monospace; background: rgba(129, 140, 248, 0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.85rem; }
            .tag-desc-p { font-size: 0.8rem; color: var(--text-muted); }
            .tag-example-p { font-size: 0.75rem; background: #020617; padding: 8px; border-radius: 6px; }
            .tag-example-p span { color: var(--text-dim); display: block; margin-bottom: 4px; font-size: 0.65rem; text-transform: uppercase; }
            .tag-example-p code { color: #10b981; }

            .limits-stack-p { display: flex; flex-direction: column; gap: 10px; }
            .limit-row-p { display: flex; justify-content: space-between; font-size: 0.85rem; padding: 8px 0; border-bottom: 1px solid var(--border); }
            .limit-row-p:last-child { border-bottom: none; }
            .limit-row-p span { color: var(--text-muted); }
            
            .markdown-hints-p { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .markdown-hints-p code { background: #020617; border: 1px solid var(--border); padding: 6px; border-radius: 6px; font-size: 0.75rem; text-align: center; }

            .preview-demo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
            .mock-field-v2 { background: #020617; border: 1px solid var(--border); border-radius: 12px; padding: 16px; font-family: monospace; font-size: 0.85rem; color: var(--text-muted); margin-top: 10px; height: 100px; }
            .embed-container-p { margin-top: 10px; }

            .align-center { display: flex; align-items: center; gap: 10px; }
            @media (max-width: 1000px) { .guide-grid-p { grid-template-columns: 1fr; } .preview-demo-grid { grid-template-columns: 1fr; } }
        `}</style>
      </div>
    </>
  );
}
