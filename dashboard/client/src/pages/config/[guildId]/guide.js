import { useRouter } from 'next/router';
import EmbedPreviewContainer from '../../../components/EmbedPreviewContainer';
import { useT } from '../../../contexts/LanguageContext';
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
  ImageIcon,
  BookOpen,
  Terminal,
  Layers
} from 'lucide-react';

export default function GuidePage() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;

  const placeholders = [
    { name: '{user}', desc: t('guide_page.placeholders.user.desc'), example: t('guide_page.placeholders.user.example') },
    { name: '{guild}', desc: t('guide_page.placeholders.guild.desc'), example: t('guide_page.placeholders.guild.example') },
    { name: '{reason}', desc: t('guide_page.placeholders.reason.desc'), example: t('guide_page.placeholders.reason.example') },
    { name: '{staff}', desc: t('guide_page.placeholders.staff.desc'), example: t('guide_page.placeholders.staff.example') },
    { name: '{channel}', desc: t('guide_page.placeholders.channel.desc'), example: t('guide_page.placeholders.channel.example') }
  ];

  const limits = [
    { target: t('guide_page.limits.embed_title'), limit: '256 chars' },
    { target: t('guide_page.limits.description'), limit: '4096 chars' },
    { target: t('guide_page.limits.footer'), limit: '2048 chars' },
    { target: t('guide_page.limits.fields'), limit: '25 max' }
  ];

  return (
    <>
      <div className="pc-premium-wrapper animate slide-up">
        
        {/* Module Header */}
        <header className="pc-header-v2">
           <div className="header-info">
              <div className="pc-icon-box" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                <BookOpen size={28} />
              </div>
              <div className="pc-title-row">
                <h1>{t('guide_page.title')}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, fontWeight: 700 }}>{t('guide_page.subtitle')}</p>
              </div>
           </div>
        </header>

        <div className="guide-grid-p">
           {/* Section: Placeholders */}
           <section className="pc-card-v2 section-card-p">
              <div className="align-center" style={{ marginBottom: '24px' }}>
                <Variable size={20} color="var(--primary)" />
                <h3>{t('guide_page.placeholders_title')}</h3>
              </div>
              <div className="tags-grid-p">
                {placeholders.map((p, i) => (
                    <div key={i} className="tag-card-v2">
                        <div className="tag-header-p">
                            <code className="tag-p">{p.name}</code>
                        </div>
                        <p className="tag-desc-p">{p.desc}</p>
                        <div className="tag-example-p">
                            <span>{t('common.example') || 'Esempio'}:</span>
                            <code>{p.example}</code>
                        </div>
                    </div>
                ))}
              </div>
           </section>

           <div className="guide-side-p">
              {/* Section: Limits */}
              <section className="pc-card-v2 section-card-p">
                <div className="align-center" style={{ marginBottom: '20px' }}>
                    <Layers size={18} color="var(--primary)" />
                    <h3>{t('guide_page.limits_title')}</h3>
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
              <section className="pc-card-v2 section-card-p" style={{ marginTop: '24px' }}>
                <div className="align-center" style={{ marginBottom: '20px' }}>
                    <Terminal size={18} color="var(--primary)" />
                    <h3>{t('guide_page.markdown_title')}</h3>
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
        <section className="pc-card-v2 section-card-p" style={{ marginTop: '32px' }}>
            <div className="align-center" style={{ marginBottom: '24px' }}>
                <ImageIcon size={20} color="var(--primary)" />
                <h3>{t('guide_page.preview_title')}</h3>
            </div>
            <div className="preview-demo-grid">
                <div className="input-mock-p">
                    <label className="text-label">{t('guide_page.preview.input_label')}</label>
                    <div className="mock-field-v2">
                        <span>{t('guide_page.preview.mock_text1')}</span>
                        <p>{t('guide_page.preview.mock_text2')}</p>
                    </div>
                </div>
                <div className="discord-mock-p">
                    <label className="text-label">{t('guide_page.preview.discord_label')}</label>
                    <div className="embed-container-p">
                        <EmbedPreview 
                            data={{
                                title: t('guide_page.preview.mock_text1'),
                                description: t('guide_page.preview.mock_desc'),
                                color: '#6366f1'
                            }} 
                        />
                    </div>
                </div>
            </div>
        </section>
      </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1500px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
            .pc-title-row h1 { font-family: 'Inter'; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }

            .guide-grid-p { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
            
            .tags-grid-p { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .tag-card-v2 { background: var(--bg-badge); border: 1px solid var(--border); padding: 16px; border-radius: 14px; display: flex; flex-direction: column; gap: 10px; transition: 0.2s; }
            .tag-card-v2:hover { border-color: var(--primary); transform: translateY(-2px); }
            .tag-p { color: var(--primary); font-weight: 700; font-family: monospace; background: rgba(129, 140, 248, 0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.85rem; }
            .tag-desc-p { font-size: 0.8rem; color: var(--text-muted); }
            .tag-example-p { font-size: 0.75rem; background: var(--bg-dark); padding: 8px; border-radius: 6px; }
            .tag-example-p span { color: var(--text-dim); display: block; margin-bottom: 4px; font-size: 0.65rem; text-transform: uppercase; }
            .tag-example-p code { color: #10b981; }

            .limits-stack-p { display: flex; flex-direction: column; gap: 10px; }
            .limit-row-p { display: flex; justify-content: space-between; font-size: 0.85rem; padding: 8px 0; border-bottom: 1px solid var(--border); }
            .limit-row-p:last-child { border-bottom: none; }
            .limit-row-p span { color: var(--text-muted); }
            
            .markdown-hints-p { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .markdown-hints-p code { background: var(--bg-dark); border: 1px solid var(--border); padding: 6px; border-radius: 6px; font-size: 0.75rem; text-align: center; }

            .preview-demo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
            .mock-field-v2 { background: var(--bg-dark); border: 1px solid var(--border); border-radius: 12px; padding: 16px; font-family: monospace; font-size: 0.85rem; color: var(--text-muted); margin-top: 10px; height: 100px; }
            .embed-container-p { margin-top: 10px; }

            .align-center { display: flex; align-items: center; gap: 10px; }
            @media (max-width: 1000px) { .guide-grid-p { grid-template-columns: 1fr; } .preview-demo-grid { grid-template-columns: 1fr; } }
        `}</style>
    </>
  );
}
