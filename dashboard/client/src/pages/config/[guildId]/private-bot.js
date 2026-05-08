import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Bot, Shield, Info, Save, 
    Key, Power, AlertTriangle, 
    ExternalLink, CheckCircle, XCircle, Zap, RefreshCcw,
    ChevronRight, ChevronLeft, Layout, Sparkles, Gem,
    Eye, EyeOff
} from 'lucide-react';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';

export default function PrivateBotPage() {
  const { t, language } = useT();
  const langPath = language === 'it' ? '' : '/en';
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [botData, setBotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    if (!guildId || !mounted) return;
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
        const [guildRes, botRes] = await Promise.all([
            api.request(`/config/${guildId}/guild`),
            api.request(`/private-bot/${guildId}`).catch(() => ({ bot: null }))
        ]);
        setConfig(guildRes.data || guildRes);
        setBotData(botRes.bot);
    } catch (err) {
        console.error('Failed to fetch data:', err);
    } finally {
        setLoading(false);
        window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [guildId, mounted]);

  const handleSave = async () => {
    if (!token && !botData) return;
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
        await api.request(`/private-bot/${guildId}`, {
            method: 'POST',
            data: { token: token || undefined, enabled: botData ? botData.enabled : true }
        });
        setToken('');
        fetchData();
    } catch (err) {
        console.error('Save failed:', err);
    } finally {
        setSaving(false);
        window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleToggle = async () => {
    if (!botData) return;
    try {
        const res = await api.request(`/private-bot/${guildId}/toggle`, { method: 'POST' });
        setBotData({ ...botData, enabled: res.enabled });
    } catch (err) {
        console.error('Toggle failed:', err);
    }
  };

  const handleRestart = async () => {
    if (!botData || !botData.enabled) return;
    setRestarting(true);
    try {
        await api.request(`/private-bot/${guildId}/restart`, { method: 'POST' });
        setTimeout(fetchData, 3000);
    } catch (err) {
        console.error('Restart failed:', err);
    } finally {
        setTimeout(() => setRestarting(false), 3000);
    }
  };

  if (!mounted || loading) return <Skeleton height="600px" />;

  const isPlatinum = config?.premiumTier === 'platinum';

  return (
    <div className="pc-premium-wrapper fade-in">
        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' }}>
                    <Bot size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>White-Label Bot</h1>
                    <div className={`pc-status-pill ${isPlatinum ? 'active' : 'off'}`}>
                        {isPlatinum ? 'PLATINUM ACTIVE' : 'NON DISPONIBILE'}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                {isPlatinum && (
                    <button className="pc-btn-primary" onClick={handleSave} disabled={saving || (!token && !botData)}>
                        <Save size={18} />
                        <span>{saving ? 'Salvataggio...' : 'Salva Token'}</span>
                    </button>
                )}
            </div>
        </header>

        <div className="pc-content-v2">
            {!isPlatinum ? (
                <div className="pc-pro-gate-v2 big">
                    <div className="gate-card-v2 big">
                        <div className="gate-icon-v2" style={{ background: 'var(--platinum-glow)', color: '#a855f7' }}>
                            <Gem size={40} />
                        </div>
                        <h2>Bot Privato & Identità</h2>
                        <p>Crea il tuo bot personalizzato con il tuo nome, avatar e stato. Nessun riferimento a Verix, solo il tuo brand.</p>
                        <div className="gate-features-v2">
                            <div className="gf-item">
                                <Check size={16} /> <span>White-Label Bot</span>
                            </div>
                            <div className="gf-item">
                                <Check size={16} /> <span>Custom Status & Presence</span>
                            </div>
                            <div className="gf-item">
                                <Check size={16} /> <span>Setup Dedicato</span>
                            </div>
                        </div>
                        <button className="pc-btn-primary platinum" onClick={() => router.push(`/config/${guildId}/premium`)}>
                            Passa a Platinum
                        </button>
                    </div>
                </div>
            ) : (
                <div className="pc-editor-grid-v2 animate slide-up" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon"><Key size={18} /></div>
                                <h3>Configurazione Credenziali</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-alert-v2 warning" style={{ marginBottom: '32px' }}>
                                    <AlertTriangle size={20} />
                                    <div className="v-stack">
                                        <span className="alert-title">Importante per la sicurezza</span>
                                        <span className="alert-desc">Non condividere mai il tuo bot token. Inseriscilo qui per avviare la tua istanza privata su Verix Ops.</span>
                                    </div>
                                </div>

                                <div className="pc-input-group-v2">
                                    <label>Discord Bot Token</label>
                                    <div className="pc-input-wrapper-v2">
                                        <Key size={16} className="input-icon" />
                                        <input 
                                            type={showToken ? 'text' : 'password'} 
                                            placeholder={botData ? '••••••••••••••••••••' : 'MTE3MjMx...'} 
                                            value={token}
                                            onChange={e => setToken(e.target.value)}
                                        />
                                        <button className="pc-input-eye-btn" onClick={() => setShowToken(!showToken)}>
                                            {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <p className="pc-hint-v2" style={{ marginTop: '12px' }}>
                                        Puoi ottenere il token nel <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="pc-link-v2">Developer Portal</a>
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2">
                             <div className="card-header-v2">
                                <div className="header-icon"><Layout size={18} /></div>
                                <h3>Guida al Setup</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-stepper-v2">
                                    {[1,2,3,4].map(step => (
                                        <div key={step} className="pc-step-item-v2">
                                            <div className="step-num">{step}</div>
                                            <div className="step-content">
                                                <h4 className="step-title">{t(`private_bot.step${step}_title`)}</h4>
                                                <p className="step-desc" dangerouslySetInnerHTML={{ __html: t(`private_bot.step${step}_desc`) }}></p>
                                                <div className="step-media-v2" onClick={() => setSelectedImage({ src: `/img/guide${langPath}/step${step}.png`, title: t(`private_bot.step${step}_title`) })}>
                                                    <img src={`/img/guide${langPath}/step${step}.png`} alt={`Step ${step}`} />
                                                    <div className="media-overlay"><Sparkles size={16} /> Ingrandisci</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 status-monitor-v2">
                            <div className="card-header-v2">
                                <div className="header-icon"><Power size={18} /></div>
                                <h3>Stato Istanza</h3>
                            </div>
                            <div className="card-body-v2">
                                {botData ? (
                                    <div className="v-stack" style={{ gap: '24px' }}>
                                        <div className="pc-bot-identity-v2">
                                            <img src={botData.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'} className="bot-avatar" />
                                            <div className="bot-info">
                                                <span className="bot-name">{botData.clientName || 'Private Bot'}</span>
                                                <div className={`pc-status-pill mini ${botData.status}`}>
                                                    {botData.status.toUpperCase()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pc-action-row-v2">
                                            <div className="v-stack">
                                                <span className="action-label">Abilitato</span>
                                                <span className="action-desc">Ricevi comandi</span>
                                            </div>
                                            <label className="pc-toggle-mini">
                                                <input type="checkbox" checked={!!botData.enabled} onChange={handleToggle} />
                                                <span className="pc-slider-mini"></span>
                                            </label>
                                        </div>

                                        <button className="pc-btn-outline" style={{ width: '100%', height: '56px' }} onClick={handleRestart} disabled={restarting}>
                                            <RefreshCcw size={18} className={restarting ? 'animate-spin' : ''} />
                                            <span>{restarting ? 'Riavvio...' : 'Riavvia Istanza'}</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="pc-empty-mini">Configura il token per avviare l'istanza.</div>
                                )}
                            </div>
                        </section>

                        <section className="pc-card-v2 help-card-v2">
                             <div className="v-stack" style={{ gap: '16px' }}>
                                 <div className="icon-glow"><Info size={24} /></div>
                                 <h3 style={{ margin: 0 }}>Bisogno di Aiuto?</h3>
                                 <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7, lineHeight: 1.5 }}>
                                     Il setup del bot privato richiede il <strong style={{ color: 'white' }}>Server Members Intent</strong> abilitato nel developer portal.
                                 </p>
                                 <button className="pc-btn-primary" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                                     Leggi Documentazione
                                 </button>
                             </div>
                        </section>
                    </div>
                </div>
            )}
        </div>

        {selectedImage && (
            <div className="pc-lightbox-v2" onClick={() => setSelectedImage(null)}>
                <div className="lightbox-content-v2 animate zoom-in" onClick={e => e.stopPropagation()}>
                    <div className="lightbox-header-v2">
                        <span>{selectedImage.title}</span>
                        <button onClick={() => setSelectedImage(null)}><XCircle size={24} /></button>
                    </div>
                    <img src={selectedImage.src} />
                </div>
            </div>
        )}

        <style jsx>{`
            .pc-premium-wrapper { padding: 40px; max-width: 1500px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: white; padding: 32px; border-radius: 32px; box-shadow: var(--shadow-premium); border: 1px solid var(--border-light); }
            .header-info { display: flex; align-items: center; gap: 24px; }
            .pc-icon-box { width: 64px; height: 64px; color: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 24px rgba(168, 85, 247, 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 900; margin: 0; color: var(--text-main); letter-spacing: -0.5px; }
            .pc-status-pill { font-size: 0.65rem; font-weight: 900; padding: 4px 12px; border-radius: 100px; letter-spacing: 1px; width: fit-content; }
            .pc-status-pill.active { background: #fdf4ff; color: #a855f7; border: 1px solid #a855f733; }
            .pc-status-pill.off { background: #fef2f2; color: #ef4444; border: 1px solid #ef444433; }
            .pc-status-pill.online { background: #ecfdf5; color: #10b981; border: 1px solid #10b98133; }
            .pc-status-pill.offline { background: #f9fafb; color: #6b7280; border: 1px solid #e5e7eb; }

            .header-controls { display: flex; gap: 16px; }
            .pc-btn-primary { display: flex; align-items: center; gap: 12px; background: var(--primary); color: white; border: none; padding: 14px 28px; border-radius: 16px; font-weight: 800; cursor: pointer; transition: 0.3s; }
            .pc-btn-primary.platinum { background: linear-gradient(135deg, #a855f7, #7c3aed); box-shadow: 0 10px 20px rgba(168, 85, 247, 0.2); }
            .pc-btn-outline { display: flex; align-items: center; gap: 10px; background: white; color: var(--text-main); border: 1.5px solid var(--border); padding: 14px 24px; border-radius: 16px; font-weight: 700; cursor: pointer; transition: 0.3s; }

            /* Gate */
            .pc-pro-gate-v2.big { min-height: 500px; display: flex; align-items: center; justify-content: center; }
            .gate-card-v2.big { background: white; border-radius: 40px; padding: 60px; text-align: center; max-width: 600px; box-shadow: var(--shadow-xl); border: 1px solid var(--border-light); }
            .gate-icon-v2 { width: 80px; height: 80px; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 32px; }
            .gate-card-v2 h2 { font-size: 2.2rem; font-weight: 900; margin-bottom: 16px; font-family: 'Outfit'; }
            .gate-card-v2 p { color: var(--text-muted); font-size: 1.1rem; line-height: 1.6; margin-bottom: 40px; }
            .gate-features-v2 { display: flex; flex-direction: column; gap: 16px; align-items: center; margin-bottom: 40px; }
            .gf-item { display: flex; align-items: center; gap: 12px; font-weight: 700; color: var(--text-main); }

            /* Cards */
            .pc-card-v2 { background: white; border: 1px solid var(--border-light); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 40px; height: 40px; background: var(--bg-badge); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .card-header-v2 h3 { margin: 0; font-size: 1.1rem; font-weight: 850; }

            .pc-alert-v2 { display: flex; gap: 16px; padding: 20px; border-radius: 20px; border: 1px solid transparent; }
            .pc-alert-v2.warning { background: #fffbeb; border-color: #fef3c7; color: #92400e; }
            .alert-title { font-weight: 900; font-size: 0.9rem; }
            .alert-desc { font-size: 0.85rem; opacity: 0.8; }

            .pc-input-group-v2 label { display: block; font-size: 0.65rem; font-weight: 900; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
            .pc-input-wrapper-v2 { display: flex; align-items: center; background: var(--bg-input); border: 1.5px solid var(--border); border-radius: 16px; overflow: hidden; }
            .pc-input-wrapper-v2 input { width: 100%; background: transparent; border: none; padding: 16px; font-weight: 700; color: var(--text-main); outline: none; }
            .input-icon { margin-left: 20px; color: var(--text-muted); }
            .pc-input-eye-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 0 20px; }

            /* Stepper */
            .pc-stepper-v2 { display: flex; flex-direction: column; gap: 40px; }
            .pc-step-item-v2 { display: flex; gap: 24px; position: relative; }
            .pc-step-item-v2:not(:last-child):after { content: ''; position: absolute; left: 19px; top: 48px; bottom: -48px; width: 2px; background: var(--border-light); }
            .step-num { width: 40px; height: 40px; border-radius: 14px; background: var(--bg-badge); border: 2px solid var(--border-light); display: flex; align-items: center; justify-content: center; font-weight: 900; color: var(--primary); z-index: 2; flex-shrink: 0; }
            .step-title { margin: 0 0 8px; font-size: 1.1rem; font-weight: 850; }
            .step-desc { font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 16px; }
            .step-media-v2 { border-radius: 20px; border: 1px solid var(--border-light); overflow: hidden; cursor: pointer; position: relative; max-width: 400px; }
            .step-media-v2 img { width: 100%; display: block; }
            .media-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; opacity: 0; transition: 0.3s; }
            .step-media-v2:hover .media-overlay { opacity: 1; }

            /* Status */
            .pc-bot-identity-v2 { display: flex; align-items: center; gap: 20px; background: var(--bg-badge); padding: 20px; border-radius: 20px; }
            .bot-avatar { width: 64px; height: 64px; border-radius: 50%; border: 3px solid white; box-shadow: 0 8px 16px rgba(0,0,0,0.1); }
            .bot-name { font-weight: 900; font-size: 1.1rem; display: block; margin-bottom: 4px; }
            
            .pc-action-row-v2 { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: white; border: 1px solid var(--border-light); border-radius: 20px; }
            .action-label { font-weight: 850; font-size: 0.9rem; }
            .action-desc { font-size: 0.8rem; color: var(--text-muted); }

            .help-card-v2 { background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); color: white; border: none; }
            .icon-glow { width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; }

            /* Lightbox */
            .pc-lightbox-v2 { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 40px; }
            .lightbox-content-v2 { background: white; border-radius: 32px; overflow: hidden; max-width: 1000px; width: 100%; }
            .lightbox-header-v2 { padding: 20px 32px; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; font-weight: 900; font-family: 'Outfit'; font-size: 1.2rem; }
            .lightbox-content-v2 img { width: 100%; height: auto; display: block; max-height: 80vh; object-fit: contain; background: #111; }

            .pc-toggle-mini { position: relative; width: 50px; height: 26px; }
            .pc-toggle-mini input { opacity: 0; width: 0; height: 0; }
            .pc-slider-mini { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border); transition: .4s; border-radius: 34px; }
            .pc-slider-mini:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-mini { background-color: #10b981; }
            input:checked + .pc-slider-mini:before { transform: translateX(24px); }

            .v-stack { display: flex; flex-direction: column; }
            .align-center { display: flex; align-items: center; gap: 12px; }
            .pc-link-v2 { color: var(--primary); text-decoration: none; font-weight: 800; border-bottom: 1.5px solid var(--primary-muted); }
            .pc-empty-mini { text-align: center; padding: 40px; color: var(--text-muted); font-style: italic; }

            @media (max-width: 1100px) { .pc-editor-grid-v2 { grid-template-columns: 1fr !important; } }
            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .gate-card-v2 { background: #ffffff !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
