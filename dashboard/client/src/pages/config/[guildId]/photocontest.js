import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import { DiscordSelector, SystemMessagesSection } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { 
    Save, Settings2, Trash2, Plus, Calendar, Clock, Users, Bell, Layout, Type, 
    MessageSquare, Play, Square, Trophy, Target, Shield, Hash, Zap,
    ChevronRight, Search, Info, AlertCircle, Camera, Palette, CheckCircle2, 
    X, Image, Power, Layers, MousePointer2, Smartphone, Monitor,
    Gauge, Timer, Wand2, History, RotateCcw
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
      const dData = discordRes?.data || discordRes || { roles: [], channels: [] };
      setDiscordData({
        ...dData,
        channels: (dData.channels || []).filter(c => c.type === 0 || c.type === 5)
      });
    } catch (err) {
      if (!api.isAuthError(err)) {
        console.error("Failed to load photocontest config", err);
      }
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleReset = async () => {
    if (!confirm(t('common.reset_confirm'))) return;
    
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const res = await api.request(`/config/${guildId}/photocontest/reset`, { method: 'POST' });
      if (res.success) {
        setConfig(res.data);
        showToast(t('common.reset_success'));
      }
    } catch (error) {
      if (!api.isAuthError(error)) {
        console.error("Reset error:", error);
      }
      showToast(t('common.reset_error'), 'error');
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
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
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
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
                <div className="pc-toggle-container-v2">
                    <label className="pc-toggle-v2">
                        <input 
                            type="checkbox" 
                            checked={config.enabled} 
                            onChange={() => setConfig({...config, enabled: !config.enabled})} 
                        />
                        <span className="pc-slider-v2"></span>
                    </label>
                    <span className={config.enabled ? 'text-active' : 'text-inactive'}>
                        {config.enabled ? t('common.active') : t('common.inactive')}
                    </span>
                </div>

                <div className="pc-header-divider" style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 4px' }}></div>
                <button className="pc-btn-outline-v2" onClick={handleReset} title={t('common.reset_to_default')}>
                    <RotateCcw size={18} />
                </button>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('common.save_changes')}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-container-v2" style={{ marginBottom: '24px' }}>
            <div className="pc-tabs-v2">
                {[
                    { id: 'general', icon: <Settings2 size={18} />, label: t('pc.tab_core') },
                    { id: 'themes', icon: <Layers size={18} />, label: t('pc.tab_themes'), count: config.themes.length },
                    { id: 'design', icon: <Palette size={18} />, label: t('pc.tab_design') },
                    { id: 'system_messages', icon: <MessageSquare size={18} />, label: t('common.tab_system_messages') }
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
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 420px', gap: '24px' }}>
                    <div className="v-stack" style={{ gap: '24px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2" style={{ marginBottom: '22px' }}>
                                <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Target size={20} /></div>
                                <div className="v-stack" style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>{t('pc.destinations')}</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t('pc.destinations_desc')}</p>
                                </div>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>{t('pc.main_channel')}</label>
                                        <DiscordSelector type="channel" options={discordData.channels} value={config.channelId} onChange={v => setConfig({...config, channelId: v})} />
                                        <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('pc.main_channel_help')}</p>
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('pc.hof_channel')}</label>
                                        <DiscordSelector type="channel" options={discordData.channels} value={config.hallOfFameChannelId} onChange={v => setConfig({...config, hallOfFameChannelId: v})} />
                                        <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('pc.hof_channel_help')}</p>
                                    </div>
                                </div>
                                <div className="pc-input-group-v2" style={{ marginTop: '32px' }}>
                                    <label>{t('pc.winner_role')}</label>
                                    <DiscordSelector type="role" options={discordData.roles} value={config.winnerRoleId} onChange={v => setConfig({...config, winnerRoleId: v})} />
                                    <div style={{ marginTop: '20px', background: 'var(--primary-glow)', padding: '24px', borderRadius: '22px', border: '1.5px solid var(--primary-muted)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <Info size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 700, lineHeight: 1.6 }}>{t('pc.winner_role_desc')}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="card-header-v2" style={{ marginBottom: '22px' }}>
                                <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Timer size={20} /></div>
                                <div className="v-stack" style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>{t('pc.timeline_title')}</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t('pc.timeline_desc')}</p>
                                </div>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
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

                    <div className="v-stack" style={{ gap: '24px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2" style={{ marginBottom: '22px' }}>
                                <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Shield size={20} /></div>
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
                                            <strong style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-heading)', letterSpacing: '-0.5px' }}>{t('pc.ex_aequo')}</strong>
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
                    </div>
                </div>
            )}

            {activeTab === 'themes' && (
                <div className="v-stack animate slide-up" style={{ gap: '24px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2" style={{ marginBottom: '24px' }}>
                            <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Wand2 size={20} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>{t('pc.library_title')}</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t('pc.library_desc')}</p>
                            </div>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-add-theme-studio" style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                                <div className="pc-input-wrapper-v2" style={{ flex: 1, background: 'var(--bg-badge)', border: '1.5px solid var(--border)', borderRadius: '14px', display: 'flex', alignItems: 'center' }}>
                                    <Type size={18} style={{ marginLeft: '16px', color: 'var(--text-muted)' }} />
                                    <input 
                                        style={{ width: '100%', border: 'none', background: 'transparent', padding: '14px 16px', fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.95rem', outline: 'none' }}
                                        placeholder={t('pc.add_theme_placeholder')}
                                        value={newTheme}
                                        onChange={e => setNewTheme(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addTheme()}
                                    />
                                </div>
                                <button className="pc-btn-primary" onClick={addTheme}>
                                    <Plus size={18} />
                                    <span>{t('pc.add_theme_btn')}</span>
                                </button>
                            </div>

                            <div className="pc-themes-matrix-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
                                {config.themes.map((theme, idx) => (
                                    <div key={idx} className="pc-theme-studio-card animate slide-up" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', padding: '14px', borderRadius: '14px', transition: '0.2s' }}>
                                        <div style={{ width: '30px', height: '30px', background: 'var(--bg-badge)', color: 'var(--primary)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, border: '1.5px solid var(--border)' }}>#{idx + 1}</div>
                                        <span style={{ flex: 1, fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.95rem', letterSpacing: '-0.3px' }}>{theme}</span>
                                        <button onClick={() => removeTheme(theme)} className="pc-btn-delete-studio-mini" style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'var(--bg-badge)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}><X size={16} /></button>
                                    </div>
                                ))}
                                {config.themes.length === 0 && (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px', background: 'var(--bg-badge)', borderRadius: '16px', border: '1.5px dashed var(--border)' }}>
                                        <Image size={48} style={{ margin: '0 auto 20px', opacity: 0.3, color: 'var(--primary)' }} />
                                        <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--text-heading)', fontSize: '1.15rem', letterSpacing: '0' }}>{t('pc.empty_library')}</h3>
                                        <p style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '10px' }}>{t('pc.empty_library_desc')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'design' && (
                <div className="v-stack animate slide-up" style={{ gap: '24px' }}>
                    <EmbedMessageManager 
                        guildId={guildId}
                        module="photocontest"
                        slugs={[
                            { key: 'announcement', label: t('pc.announce_label'), description: t('pc.announce_desc'), variables: ['theme', 'duration', 'channel'], group: 'Comunicazioni', groupIcon: Bell },
                            { key: 'winner', label: t('pc.winner_label'), description: t('pc.winner_desc'), variables: ['user', 'theme', 'votes', 'image'], group: 'Vittoria', groupIcon: Trophy },
                            { key: 'end', label: t('pc.end_label'), description: t('pc.end_desc'), variables: ['theme'], group: 'Stato', groupIcon: Clock },
                        ]}
                    />
                </div>
            )}

            {activeTab === 'system_messages' && (
                <div className="v-stack animate slide-up">
                    <SystemMessagesSection 
                        config={config}
                        onUpdate={setConfig}
                        messages={[
                            { key: 'voted', label: t('pc.msg_voted'), placeholder: t('pc.msg_voted') },
                            { key: 'already_voted', label: t('pc.msg_already_voted'), placeholder: t('pc.msg_already_voted') },
                            { key: 'not_active', label: t('pc.msg_not_active'), placeholder: t('pc.msg_not_active') },
                            { key: 'staff_only', label: t('pc.msg_staff_only'), placeholder: t('pc.msg_staff_only') }
                        ]}
                    />
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 24px; max-width: 1280px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; background: var(--bg-card); padding: 20px 22px; border-radius: 16px; box-shadow: none; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 12px 24px rgba(var(--primary-rgb), 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Inter', sans-serif; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 700; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px;  width: fit-content; }
            .pc-status-tag-v2.on { background: rgba(16, 185, 129, 0.1); color: #10b981; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: #ef4444; }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 12px 22px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; box-shadow: none; }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(var(--primary-rgb), 0.3); }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: var(--bg-badge); color: var(--text-muted); border: 1.5px solid var(--border); padding: 12px 28px; border-radius: 18px; font-weight: 700; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: rgba(var(--primary-rgb), 0.1); color: var(--primary); border-color: rgba(var(--primary-rgb), 0.2); }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 8px; background: var(--bg-badge); padding: 6px; border-radius: 14px; width: fit-content; max-width: 100%; overflow-x: auto; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; font-size: 0.9rem; border-radius: 10px; cursor: pointer; transition: 0.2s; white-space: nowrap; position: relative; }
            .pc-tabs-v2 button.active { background: var(--bg-card); color: var(--primary); box-shadow: none; }
            .pc-tab-badge-v2 { background: var(--primary); color: #fff; font-size: 0.7rem; padding: 2px 8px; border-radius: 100px; margin-left: 6px; font-weight: 700; }

            /* Card V2 */
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; box-shadow: none; }
            .card-header-v2 { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
            .header-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: none; }
            .card-header-v2 h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--text-heading); letter-spacing: normal; }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 10px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }

            .pc-input-modern-v2 { width: 100%; background: var(--bg-badge); border: 1.5px solid var(--border); border-radius: 14px; padding: 12px 16px; font-weight: 700; color: var(--text-heading); outline: none; transition: 0.2s; display: flex; align-items: center; gap: 12px; }
            .pc-input-modern-v2:focus-within { border-color: var(--primary); }
            .pc-input-modern-v2 input { border: none; background: transparent; width: 100%; font-weight: 700; outline: none; color: var(--text-heading); }

            .pc-theme-studio-card:hover { border-color: var(--primary-muted) !important; background: var(--bg-badge) !important; }
            .pc-btn-delete-studio-mini:hover { background: rgba(239, 68, 68, 0.1) !important; color: #ef4444 !important; transform: rotate(8deg); }

            /* Toggle V2 */

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            @media (max-width: 1180px) {
                .pc-layout-grid-v2 { grid-template-columns: 1fr !important; }
            }

            @media (max-width: 720px) {
                .pc-premium-wrapper { padding: 16px; }
                .pc-header-v2 { flex-direction: column; align-items: stretch; gap: 18px; }
                .header-controls { flex-wrap: wrap; }
                .pc-input-grid-v2 { grid-template-columns: 1fr !important; }
                .pc-add-theme-studio { flex-direction: column; }
                .pc-add-theme-studio .pc-btn-primary { justify-content: center; min-height: 48px; }
            }
        `}</style>
    </div>
  );
}
