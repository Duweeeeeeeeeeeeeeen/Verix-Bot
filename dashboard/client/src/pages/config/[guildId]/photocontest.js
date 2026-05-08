import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import { DiscordSelector } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { 
    Save, Settings2, Trash2, Plus, Calendar, Clock, Users, Bell, Layout, Type, 
    MessageSquare, Play, Square, Trophy, Target, Shield, Hash, Zap, Sparkles, 
    ChevronRight, Search, Info, AlertCircle, Camera, Palette, CheckCircle2, 
    X, Image, Star, Power, Layers, MousePointer2, Smartphone, Monitor,
    Gauge, Timer, CameraIcon, Wand2, History
} from 'lucide-react';
import { useT } from '../../../contexts/LanguageContext';
import { EmbedMessageManager } from '../../../components/LazyConfigComponents';
import Head from 'next/head';

export default function PhotoContestConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [newTheme, setNewTheme] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
      fetchData();
    }
  }, [guildId, mounted]);

  const fetchData = async () => {
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [configRes, discordRes] = await Promise.all([
        api.request(`/config/${guildId}/photocontest`),
        api.request(`/config/${guildId}/discord-data`)
      ]);
      const data = configRes?.data || configRes;
      setConfig({
        enabled: data?.enabled ?? false,
        channelId: data?.channelId || '',
        hallOfFameChannelId: data?.hallOfFameChannelId || '',
        winnerRoleId: data?.winnerRoleId || '',
        interval: data?.interval || 24,
        duration: data?.duration || 24,
        multiWinner: data?.multiWinner ?? false,
        themes: data?.themes || [],
        staffRoles: data?.staffRoles || [],
        notificationMode: data?.notificationMode || 'none'
      });
      setDiscordData(discordRes?.data || discordRes || { roles: [], channels: [] });
    } catch (err) {
      console.error("Failed to load photocontest config", err);
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/photocontest`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast("Photo Contest Studio sincronizzato!");
    } catch (error) {
      showToast("Errore durante il salvataggio.", 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const addTheme = () => {
    if (!newTheme.trim()) return;
    if (config.themes.includes(newTheme.trim())) {
        showToast("Questo tema esiste già nel database!", 'error');
        return;
    }
    setConfig({ ...config, themes: [...config.themes, newTheme.trim()] });
    setNewTheme('');
  };

  const removeTheme = (theme) => {
    setConfig({ ...config, themes: config.themes.filter(t => t !== theme) });
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>Photo Contest Studio Pro | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}>
                    <Camera size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>Photo Contest Studio Pro</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? 'CONTEST OPERATIVO' : 'CONTEST IN PAUSA'}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <button 
                  className={`pc-status-toggle-v2 ${config.enabled ? 'active' : ''}`}
                  onClick={() => setConfig({...config, enabled: !config.enabled})}
                >
                  <Power size={18} />
                  <span>{config.enabled ? 'Online' : 'Offline'}</span>
                </button>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving} style={{ background: '#be185d' }}>
                    <Save size={18} />
                    <span>{saving ? 'Sincronizzazione...' : 'Salva Studio'}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-container-v2" style={{ marginBottom: '40px' }}>
            <div className="pc-tabs-v2">
                {[
                    { id: 'general', icon: <Settings2 size={18} />, label: 'Core Protocol' },
                    { id: 'themes', icon: <Layers size={18} />, label: 'Libreria Temi', count: config.themes.length },
                    { id: 'design', icon: <Palette size={18} />, label: 'Design Studio' }
                ].map(tab => (
                    <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
                        {tab.icon} <span>{tab.label}</span>
                        {tab.count !== undefined && tab.count > 0 && <span className="pc-tab-badge-v2">{tab.count}</span>}
                    </button>
                ))}
            </div>
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'general' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '40px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                <div className="header-icon" style={{ background: '#fdf2f8', color: '#db2777' }}><Target size={20} /></div>
                                <div className="v-stack" style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>Canali & Destinazioni</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Gestisci dove Verix lancerà i contest e premierà i vincitori.</p>
                                </div>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>Canale Contest Principal</label>
                                        <DiscordSelector type="channel" options={discordData.channels} value={config.channelId} onChange={v => setConfig({...config, channelId: v})} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Hall of Fame (Annunci)</label>
                                        <DiscordSelector type="channel" options={discordData.channels} value={config.hallOfFameChannelId} onChange={v => setConfig({...config, hallOfFameChannelId: v})} />
                                    </div>
                                </div>
                                <div className="pc-input-group-v2" style={{ marginTop: '32px' }}>
                                    <label>Winner Role (Temporary Identity)</label>
                                    <DiscordSelector type="role" options={discordData.roles} value={config.winnerRoleId} onChange={v => setConfig({...config, winnerRoleId: v})} />
                                    <div style={{ marginTop: '20px', background: 'rgba(219, 39, 119, 0.03)', padding: '24px', borderRadius: '22px', border: '1.5px solid #fce7f3', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <Info size={24} color="#db2777" style={{ flexShrink: 0 }} />
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 700, lineHeight: 1.6 }}>Verix assegnerà automaticamente questo ruolo al vincitore fino al termine della rotazione successiva.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                <div className="header-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}><Timer size={20} /></div>
                                <div className="v-stack" style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>Timeline Protocol</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Configura la durata e l'intervallo tra le sfide fotografiche.</p>
                                </div>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>Intervallo Rotazione (Ore)</label>
                                        <div className="pc-input-wrapper-v2" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '20px', display: 'flex', alignItems: 'center' }}>
                                            <History size={20} style={{ marginLeft: '20px', color: '#94a3b8' }} />
                                            <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '20px', fontWeight: 950, fontSize: '1.2rem', color: '#1e293b' }} value={config.interval} onChange={e => setConfig({...config, interval: parseInt(e.target.value)})} />
                                        </div>
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Durata Votazioni (Ore)</label>
                                        <div className="pc-input-wrapper-v2" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '20px', display: 'flex', alignItems: 'center' }}>
                                            <Zap size={20} style={{ marginLeft: '20px', color: '#94a3b8' }} />
                                            <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '20px', fontWeight: 950, fontSize: '1.2rem', color: '#1e293b' }} value={config.duration} onChange={e => setConfig({...config, duration: parseInt(e.target.value)})} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                <div className="header-icon" style={{ background: '#fff7ed', color: '#ea580c' }}><Shield size={20} /></div>
                                <h3 style={{ margin: 0 }}>Studio Authority</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>Moderatori del Contest</label>
                                    <DiscordSelector type="role" multiple options={discordData.roles} value={config.staffRoles || []} onChange={v => setConfig({...config, staffRoles: v})} />
                                </div>
                                <div style={{ marginTop: '32px', background: '#f8fafc', padding: '28px', borderRadius: '28px', border: '1.5px solid #e2e8f0' }}>
                                    <div className="pc-toggle-row-v2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div className="v-stack" style={{ gap: '6px' }}>
                                            <strong style={{ fontWeight: 950, fontSize: '1.1rem', color: '#1e293b', letterSpacing: '-0.5px' }}>Ex-Aequo Protocol</strong>
                                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Consenti vincitori multipli in parità.</span>
                                        </div>
                                        <label className="pc-toggle-v2">
                                            <input type="checkbox" checked={config.multiWinner} onChange={e => setConfig({...config, multiWinner: e.target.checked})} />
                                            <span className="pc-slider-v2"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="pc-info-banner-pink animate slide-up" style={{ background: 'linear-gradient(135deg, #db2777 0%, #9d174d 100%)', borderRadius: '32px', padding: '40px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'relative', zIndex: 2 }}>
                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '14px', width: 'fit-content', marginBottom: '24px' }}><Star size={24} /></div>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '1.4rem', fontWeight: 950, letterSpacing: '-0.5px' }}>Social Engagement Pro</h4>
                                <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9, lineHeight: 1.7, fontWeight: 700 }}>I Photo Contest incrementano l'attività media del server del 35%. Rendi la tua community vibrante.</p>
                            </div>
                            <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.1 }}><CameraIcon size={180} /></div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'themes' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2" style={{ marginBottom: '40px' }}>
                            <div className="header-icon" style={{ background: '#fdf2f8', color: '#db2777' }}><Wand2 size={20} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>Studio Library: Temi Creativi</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Gestisci il database dei temi che Verix sceglierà casualmente.</p>
                            </div>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-add-theme-studio" style={{ display: 'flex', gap: '20px', marginBottom: '48px' }}>
                                <div className="pc-input-wrapper-v2" style={{ flex: 1, background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '24px', display: 'flex', alignItems: 'center' }}>
                                    <Type size={22} style={{ marginLeft: '24px', color: '#94a3b8' }} />
                                    <input 
                                        style={{ width: '100%', border: 'none', background: 'transparent', padding: '24px', fontWeight: 950, color: '#1e293b', fontSize: '1.15rem', outline: 'none' }}
                                        placeholder="Inserisci un nuovo tema creativo (es: Cinematic Nature)..." 
                                        value={newTheme}
                                        onChange={e => setNewTheme(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addTheme()}
                                    />
                                </div>
                                <button className="pc-btn-primary" style={{ padding: '0 48px', borderRadius: '24px', fontSize: '1.1rem', background: '#db2777' }} onClick={addTheme}>
                                    <Plus size={24} />
                                    <span>Aggiungi Tema</span>
                                </button>
                            </div>

                            <div className="pc-themes-matrix-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                                {config.themes.map((theme, idx) => (
                                    <div key={idx} className="pc-theme-studio-card animate slide-up" style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'white', border: '1.5px solid #e2e8f0', padding: '24px', borderRadius: '24px', transition: '0.3s', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                        <div style={{ width: '40px', height: '40px', background: '#fdf2f8', color: '#db2777', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 950, border: '1.5px solid #fbcfe8' }}>#{idx + 1}</div>
                                        <span style={{ flex: 1, fontWeight: 950, color: '#1e293b', fontSize: '1.1rem', letterSpacing: '-0.3px' }}>{theme}</span>
                                        <button onClick={() => removeTheme(theme)} className="pc-btn-delete-studio-mini" style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f1f5f9', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}><X size={20} /></button>
                                    </div>
                                ))}
                                {config.themes.length === 0 && (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '140px 40px', background: '#f8fafc', borderRadius: '40px', border: '2px dashed #e2e8f0' }}>
                                        <Image size={80} style={{ margin: '0 auto 32px', opacity: 0.15, color: '#db2777' }} />
                                        <h3 style={{ margin: 0, fontWeight: 950, color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.8px' }}>Libreria Temi Vuota</h3>
                                        <p style={{ fontWeight: 800, color: '#94a3b8', fontSize: '1.1rem', marginTop: '10px' }}>Aggiungi il tuo primo tema creativo per iniziare i contest.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'design' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <EmbedMessageManager 
                        guildId={guildId}
                        module="photocontest"
                        slugs={[
                            { key: 'announcement', label: 'Annuncio Inizio Contest', description: 'Messaggio inviato nel canale contest all\'avvio di una nuova sfida.', variables: ['theme', 'duration', 'channel'], group: 'Comunicazioni', groupIcon: Bell },
                            { key: 'winner', label: 'Proclamazione Vincitore', description: 'Inviato nella Hall of Fame per celebrare il partecipante con più voti.', variables: ['user', 'theme', 'votes', 'image'], group: 'Vittoria', groupIcon: Trophy },
                            { key: 'end', label: 'Chiusura Votazioni', description: 'Inviato allo scadere della durata del contest.', variables: ['theme'], group: 'Stato', groupIcon: Clock },
                        ]}
                    />
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 40px; max-width: 1700px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: white; padding: 32px; border-radius: 32px; box-shadow: var(--shadow-premium); border: 1px solid var(--border-light); }
            .header-info { display: flex; align-items: center; gap: 24px; }
            .pc-icon-box { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 12px 24px rgba(236, 72, 153, 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Outfit', sans-serif; font-size: 2.3rem; font-weight: 950; margin: 0; color: #1e293b; letter-spacing: -1.5px; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 950; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px; }
            .pc-status-tag-v2.on { background: #fdf2f8; color: #db2777; }
            .pc-status-tag-v2.off { background: #fef2f2; color: #ef4444; }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: white; border: none; padding: 14px 28px; border-radius: 18px; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.3s; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(99, 102, 241, 0.3); }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: #f8fafc; color: #64748b; border: 1.5px solid #e2e8f0; padding: 12px 28px; border-radius: 18px; font-weight: 850; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: #fdf2f8; color: #db2777; border-color: #fbcfe8; }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 10px; background: #f1f5f9; padding: 8px; border-radius: 24px; width: fit-content; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 12px; padding: 16px 32px; border: none; background: transparent; color: #64748b; font-weight: 950; font-size: 1rem; border-radius: 18px; cursor: pointer; transition: 0.3s; white-space: nowrap; position: relative; }
            .pc-tabs-v2 button.active { background: white; color: var(--primary); box-shadow: 0 8px 20px rgba(0,0,0,0.06); transform: translateY(-2px); }
            .pc-tab-badge-v2 { background: #db2777; color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 100px; margin-left: 6px; font-weight: 950; }

            /* Card V2 */
            .pc-card-v2 { background: white; border: 1px solid var(--border-light); border-radius: 32px; padding: 40px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 20px; }
            .header-icon { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
            .card-header-v2 h3 { margin: 0; font-family: 'Outfit'; font-size: 1.5rem; font-weight: 950; color: #1e293b; letter-spacing: -0.5px; }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 10px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 950; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px; }

            .pc-theme-studio-card:hover { border-color: #ec4899 !important; transform: translateY(-4px); box-shadow: 0 10px 30px rgba(236, 72, 153, 0.1); }
            .pc-btn-delete-studio-mini:hover { background: #fff1f2 !important; color: #ef4444 !important; transform: rotate(8deg); }

            /* Toggle V2 */
            .pc-toggle-v2 { position: relative; width: 44px; height: 22px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: #cbd5e1; transition: .4s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background: white; transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: #db2777; }
            input:checked + .pc-slider-v2:before { transform: translateX(22px); }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-theme-studio-card, :global(.light-theme) .pc-tabs-v2 { background: #ffffff !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
