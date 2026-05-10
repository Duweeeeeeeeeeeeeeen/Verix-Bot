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
      showToast(t('pc.sync_success'));
    } catch (error) {
      showToast(t('common.error'), 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const addTheme = () => {
    if (!newTheme.trim()) return;
    if (config.themes.includes(newTheme.trim())) {
        showToast(t('pc.theme_exists'), 'error');
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
            <title>{t('pc.title')} | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}>
                    <Camera size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('pc.title')}</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? t('pc.active') : t('pc.paused')}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <button 
                  className={`pc-status-toggle-v2 ${config.enabled ? 'active' : ''}`}
                  onClick={() => setConfig({...config, enabled: !config.enabled})}
                >
                  <Power size={18} />
                  <span>{config.enabled ? t('common.online') : t('common.offline')}</span>
                </button>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving} style={{ background: '#be185d' }}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('common.sync')}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-container-v2" style={{ marginBottom: '40px' }}>
            <div className="pc-tabs-v2">
                {[
                    { id: 'general', icon: <Settings2 size={18} />, label: t('pc.tab_core') },
                    { id: 'themes', icon: <Layers size={18} />, label: t('pc.tab_themes'), count: config.themes.length },
                    { id: 'design', icon: <Palette size={18} />, label: t('pc.tab_design') }
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
                                <div className="header-icon" style={{ background: 'var(--bg-badge)', color: '#db2777' }}><Target size={20} /></div>
                                <div className="v-stack" style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>{t('pc.destinations')}</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t('pc.destinations_desc')}</p>
                                </div>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>{t('pc.main_channel')}</label>
                                        <DiscordSelector type="channel" options={discordData.channels} value={config.channelId} onChange={v => setConfig({...config, channelId: v})} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('pc.hof_channel')}</label>
                                        <DiscordSelector type="channel" options={discordData.channels} value={config.hallOfFameChannelId} onChange={v => setConfig({...config, hallOfFameChannelId: v})} />
                                    </div>
                                </div>
                                <div className="pc-input-group-v2" style={{ marginTop: '32px' }}>
                                    <label>{t('pc.winner_role')}</label>
                                    <DiscordSelector type="role" options={discordData.roles} value={config.winnerRoleId} onChange={v => setConfig({...config, winnerRoleId: v})} />
                                    <div style={{ marginTop: '20px', background: 'rgba(219, 39, 119, 0.05)', padding: '24px', borderRadius: '22px', border: '1.5px solid rgba(219, 39, 119, 0.1)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <Info size={24} color="#db2777" style={{ flexShrink: 0 }} />
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 700, lineHeight: 1.6 }}>{t('pc.winner_role_desc')}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                <div className="header-icon" style={{ background: 'var(--bg-badge)', color: '#7c3aed' }}><Timer size={20} /></div>
                                <div className="v-stack" style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>{t('pc.timeline_title')}</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t('pc.timeline_desc')}</p>
                                </div>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>{t('pc.interval')}</label>
                                        <div className="pc-input-modern-v2">
                                            <History size={20} style={{ color: 'var(--primary)' }} />
                                            <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: 700, color: 'var(--text-heading)', outline: 'none' }} value={config.interval} onChange={e => setConfig({...config, interval: parseInt(e.target.value)})} />
                                        </div>
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('pc.duration')}</label>
                                        <div className="pc-input-modern-v2">
                                            <Zap size={20} style={{ color: 'var(--primary)' }} />
                                            <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: 700, color: 'var(--text-heading)', outline: 'none' }} value={config.duration} onChange={e => setConfig({...config, duration: parseInt(e.target.value)})} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                <div className="header-icon" style={{ background: 'var(--bg-badge)', color: '#ea580c' }}><Shield size={20} /></div>
                                <h3 style={{ margin: 0 }}>{t('pc.authority')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>{t('pc.moderators')}</label>
                                    <DiscordSelector type="role" multiple options={discordData.roles} value={config.staffRoles || []} onChange={v => setConfig({...config, staffRoles: v})} />
                                </div>
                                <div style={{ marginTop: '32px', background: 'var(--bg-badge)', padding: '28px', borderRadius: '28px', border: '1.5px solid var(--border)' }}>
                                    <div className="pc-toggle-row-v2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div className="v-stack" style={{ gap: '6px' }}>
                                            <strong style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-heading)', letterSpacing: '-0.5px' }}>{t('pc.ex_aequo')}</strong>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t('pc.ex_aequo_desc')}</span>
                                        </div>
                                        <label className="pc-toggle-v2">
                                            <input type="checkbox" checked={config.multiWinner} onChange={e => setConfig({...config, multiWinner: e.target.checked})} />
                                            <span className="pc-slider-v2"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="pc-info-banner-pink animate slide-up" style={{ background: 'linear-gradient(135deg, #db2777 0%, #9d174d 100%)', borderRadius: '32px', padding: '40px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(219, 39, 119, 0.2)' }}>
                            <div style={{ position: 'relative', zIndex: 2 }}>
                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '14px', width: 'fit-content', marginBottom: '24px' }}><Star size={24} /></div>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.5px' }}>{t('pc.social_title')}</h4>
                                <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9, lineHeight: 1.7, fontWeight: 700 }}>{t('pc.social_desc')}</p>
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
                            <div className="header-icon" style={{ background: 'var(--bg-badge)', color: '#db2777' }}><Wand2 size={20} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>{t('pc.library_title')}</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t('pc.library_desc')}</p>
                            </div>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-add-theme-studio" style={{ display: 'flex', gap: '20px', marginBottom: '48px' }}>
                                <div className="pc-input-wrapper-v2" style={{ flex: 1, background: 'var(--bg-badge)', border: '1.5px solid var(--border)', borderRadius: '24px', display: 'flex', alignItems: 'center' }}>
                                    <Type size={22} style={{ marginLeft: '24px', color: 'var(--text-muted)' }} />
                                    <input 
                                        style={{ width: '100%', border: 'none', background: 'transparent', padding: '24px', fontWeight: 700, color: 'var(--text-heading)', fontSize: '1.15rem', outline: 'none' }}
                                        placeholder={t('pc.add_theme_placeholder')}
                                        value={newTheme}
                                        onChange={e => setNewTheme(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addTheme()}
                                    />
                                </div>
                                <button className="pc-btn-primary" style={{ padding: '0 48px', borderRadius: '24px', fontSize: '1.1rem', background: '#db2777' }} onClick={addTheme}>
                                    <Plus size={24} />
                                    <span>{t('pc.add_theme_btn')}</span>
                                </button>
                            </div>

                            <div className="pc-themes-matrix-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                                {config.themes.map((theme, idx) => (
                                    <div key={idx} className="pc-theme-studio-card animate slide-up" style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', padding: '24px', borderRadius: '24px', transition: '0.3s', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                        <div style={{ width: '40px', height: '40px', background: 'var(--bg-badge)', color: '#db2777', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, border: '1.5px solid var(--border)' }}>#{idx + 1}</div>
                                        <span style={{ flex: 1, fontWeight: 700, color: 'var(--text-heading)', fontSize: '1.1rem', letterSpacing: '-0.3px' }}>{theme}</span>
                                        <button onClick={() => removeTheme(theme)} className="pc-btn-delete-studio-mini" style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-badge)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}><X size={20} /></button>
                                    </div>
                                ))}
                                {config.themes.length === 0 && (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '140px 40px', background: 'var(--bg-badge)', borderRadius: '40px', border: '2px dashed var(--border)' }}>
                                        <Image size={80} style={{ margin: '0 auto 32px', opacity: 0.15, color: '#db2777' }} />
                                        <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--text-heading)', fontSize: '1.6rem', letterSpacing: '-0.8px' }}>{t('pc.empty_library')}</h3>
                                        <p style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '10px' }}>{t('pc.empty_library_desc')}</p>
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
            .pc-premium-wrapper { padding: 32px; max-width: 1500px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 12px 24px rgba(236, 72, 153, 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Inter', sans-serif; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 700; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px; }
            .pc-status-tag-v2.on { background: rgba(16, 185, 129, 0.1); color: #10b981; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: #ef4444; }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 14px 28px; border-radius: 18px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.3s; box-shadow: 0 10px 20px rgba(var(--primary-rgb), 0.2); }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(var(--primary-rgb), 0.3); }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: var(--bg-badge); color: var(--text-muted); border: 1.5px solid var(--border); padding: 12px 28px; border-radius: 18px; font-weight: 700; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: rgba(236, 72, 153, 0.1); color: #ec4899; border-color: rgba(236, 72, 153, 0.2); }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 10px; background: var(--bg-badge); padding: 8px; border-radius: 24px; width: fit-content; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 12px; padding: 16px 32px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; font-size: 1rem; border-radius: 18px; cursor: pointer; transition: 0.3s; white-space: nowrap; position: relative; }
            .pc-tabs-v2 button.active { background: var(--bg-card); color: var(--primary); box-shadow: var(--shadow-premium); transform: translateY(-2px); }
            .pc-tab-badge-v2 { background: #ec4899; color: #fff; font-size: 0.7rem; padding: 2px 8px; border-radius: 100px; margin-left: 6px; font-weight: 700; }

            /* Card V2 */
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
            .card-header-v2 h3 { margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--text-heading); letter-spacing: normal; }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 10px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }

            .pc-input-modern-v2 { width: 100%; background: var(--bg-badge); border: 1.5px solid var(--border); border-radius: 14px; padding: 12px 16px; font-weight: 700; color: var(--text-heading); outline: none; transition: 0.2s; display: flex; align-items: center; gap: 12px; }
            .pc-input-modern-v2:focus-within { border-color: var(--primary); }
            .pc-input-modern-v2 input { border: none; background: transparent; width: 100%; font-weight: 700; outline: none; color: var(--text-heading); }

            .pc-theme-studio-card:hover { border-color: #ec4899 !important; transform: translateY(-4px); box-shadow: 0 10px 30px rgba(236, 72, 153, 0.1); }
            .pc-btn-delete-studio-mini:hover { background: rgba(239, 68, 68, 0.1) !important; color: #ef4444 !important; transform: rotate(8deg); }

            /* Toggle V2 */
            .pc-toggle-v2 { position: relative; width: 44px; height: 22px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: var(--bg-badge); transition: .4s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background: #fff; transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: #ec4899; }
            input:checked + .pc-slider-v2:before { transform: translateX(22px); }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
