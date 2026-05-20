import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import { DiscordSelector, SystemMessagesSection } from '../../../components/LazyConfigComponents';
import { EmbedEditor } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import {
    Save, UserPlus, UserMinus, Settings2, RefreshCcw, Power, Palette, Info, Bell, Layout as LayoutIcon,
    ChevronRight, Zap, ArrowRight, MessageSquare, Shield, Clock, Plus, Trash2, Camera,
    Terminal, Layout, Sparkles, CheckCircle2, Box, MessageCircle, Hash, ArrowLeft,
    Monitor, Smartphone, Laptop, RotateCcw, Send, RefreshCw, SendHorizontal
} from 'lucide-react';
import { mergeConfig } from '../../../utils/defaults';
import defaultMessagesMap from '../../../locales';
import Head from 'next/head';

export default function WelcomeConfig() {
  const router = useRouter();
  const { t, language } = useT();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const [activeEmbedKey, setActiveEmbedKey] = useState('welcome');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
      fetchData();
    }
  }, [guildId, mounted]);

  const fetchData = async () => {
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [configRes, discordRes] = await Promise.all([
        api.request(`/config/${guildId}/welcome`),
        api.request(`/config/${guildId}/discord-data`)
      ]);

      if (configRes) {
        setConfig(mergeConfig(configRes.data || configRes, 'welcome'));
      }
      if (discordRes && (discordRes.data || discordRes)) {
        const dData = discordRes.data || discordRes;
        setDiscordData({
          ...dData,
          channels: (dData.channels || []).filter(c => c.type === 0 || c.type === 5)
        });
      }
      setLoading(false);
    } catch (error) {
      if (!api.isAuthError(error)) {
        console.error("Welcome config load error:", error);
      }
      setLoading(false);
    } finally {
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
      const res = await api.request(`/config/${guildId}/welcome/reset`, { method: 'POST' });
      if (res.success) {
        setConfig(mergeConfig(res.data, 'welcome'));
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
      await api.request(`/config/${guildId}/welcome`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast(t('welcome.toast_saved'));
    } catch (error) {
        showToast(t('welcome.toast_save_error'), 'error');
    } finally {
        setSaving(false);
        window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleTest = async () => {
    if (!config.welcome?.channelId) return showToast(t('welcome.toast_test_no_channel'), 'error');
    setTesting(true);
    try {
        const res = await api.request(`/config/${guildId}/welcome/test`, { method: 'POST' });
        showToast(t('welcome.toast_test_success'));
    } catch (error) {
        showToast(t('welcome.toast_test_error'), 'error');
    } finally { setTesting(false); }
  };

  const updateMessageConfig = (type, field, value) => {
    setConfig({
      ...config,
      [type]: {
        ...config[type],
        [field]: value
      }
    });
  };

  const updateEmbed = (key, data) => {
    const newConfig = { ...config };
    if (!newConfig[key]) newConfig[key] = { embed: {} };
    newConfig[key].embed = { ...newConfig[key].embed, ...data };
    setConfig(newConfig);
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('welcome.title')} | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
                    <UserPlus size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('welcome.header_title')}</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? t('common.active_system') : t('common.inactive_system')}
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
                <div className="pc-header-divider"></div>
                <button className="pc-btn-outline-v2" onClick={handleReset} title={t('common.reset_to_default')}>
                    <RotateCcw size={18} />
                </button>
                <button
                    className="pc-btn-outline-v2"
                    onClick={handleTest}
                    disabled={testing || !config.welcome?.channelId}
                    title={t('welcome.send_test')}
                    style={{ color: 'var(--primary)', borderColor: testing ? 'var(--border)' : 'rgba(var(--primary-rgb), 0.2)' }}
                >
                    <Send size={18} className={testing ? 'spinning' : ''} />
                </button>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('common.save_changes')}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-v2" style={{ marginBottom: '32px' }}>
            {[
                { id: 'settings', icon: Settings2, label: t('welcome.tab_channels') },
                { id: 'personalization', icon: Palette, label: t('welcome.tab_creative') },
                { id: 'system_messages', icon: MessageCircle, label: t('common.tab_system_messages') }
            ].map(tab => (
                <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
                    <tab.icon size={16} /> <span>{tab.label}</span>
                </button>
            ))}
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'settings' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 360px)', gap: '32px' }}>
                        {/* Welcome Card */}
                        <section className="pc-card-v2">
                            <div className="card-header-v2" style={{ marginBottom: '24px' }}>
                                <div className="header-icon" style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981' }}><UserPlus size={18} /></div>
                                <div className="v-stack" style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>{t('welcome.card_welcome_title')}</h3>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 650 }}>{t('welcome.card_welcome_desc')}</span>
                                </div>
                                <label className="pc-toggle-v2 mini">
                                    <input type="checkbox" checked={!!config.welcome?.enabled} onChange={e => updateMessageConfig('welcome', 'enabled', e.target.checked)} />
                                    <span className="pc-slider-v2"></span>
                                </label>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>{t('welcome.channel_label')}</label>
                                    <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 0 || c.type === 5)} value={config.welcome?.channelId || ''} onChange={v => updateMessageConfig('welcome', 'channelId', v)} />
                                    <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('welcome.channel_help')}</p>
                                </div>
                                <div style={{ marginTop: '24px', background: 'var(--bg-badge)', padding: '16px', borderRadius: '14px', border: '1.5px solid var(--border)', textAlign: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700 }}>{t('welcome.test_header_hint')}</span>
                                </div>
                            </div>
                        </section>

                        {/* Leave Card */}
                        <section className="pc-card-v2">
                            <div className="card-header-v2" style={{ marginBottom: '24px' }}>
                                <div className="header-icon" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}><UserMinus size={18} /></div>
                                <div className="v-stack" style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>{t('welcome.card_leave_title')}</h3>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 650 }}>{t('welcome.card_leave_desc')}</span>
                                </div>
                                <label className="pc-toggle-v2 mini">
                                    <input type="checkbox" checked={!!config.leave?.enabled} onChange={e => updateMessageConfig('leave', 'enabled', e.target.checked)} />
                                    <span className="pc-slider-v2"></span>
                                </label>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>{t('welcome.channel_label')}</label>
                                    <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 0 || c.type === 5)} value={config.leave?.channelId || ''} onChange={v => updateMessageConfig('leave', 'channelId', v)} />
                                    <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('welcome.channel_help')}</p>
                                </div>
                                <div style={{ marginTop: '24px', background: 'var(--bg-badge)', padding: '16px', borderRadius: '14px', border: '1.5px solid var(--border)', textAlign: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700 }}>{t('welcome.test_leave_hint')}</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="pc-card-v2">
                        <div className="card-header-v2" style={{ marginBottom: '24px' }}>
                            <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--text-muted)' }}><Hash size={18} /></div>
                            <h3 style={{ margin: 0 }}>{t('welcome.variables_title')}</h3>
                        </div>
                        <div className="card-body-v2">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                {[
                                    { k: '{user}', v: t('welcome.var_user') },
                                    { k: '{user_mention}', v: t('welcome.var_user_mention') },
                                    { k: '{user_tag}', v: t('welcome.var_user_tag') },
                                    { k: '{guild}', v: t('welcome.var_guild') },
                                    { k: '{member_count}', v: t('welcome.var_member_count') }
                                ].map(x => (
                                    <div key={x.k} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-badge)', padding: '16px 20px', borderRadius: '18px', border: '1.5px solid var(--border)' }}>
                                        <code style={{ background: 'var(--bg-card)', color: '#f43f5e', padding: '4px 10px', borderRadius: '10px', fontWeight: 700, border: '1px solid var(--border)', fontSize: '0.85rem' }}>{x.k}</code>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 750 }}>{x.v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'personalization' && (
                <div className="pc-card-v2 welcome-editor-shell animate slide-up">
                    <div className="pc-studio-layout-v2 welcome-editor-layout">
                        <aside className="welcome-editor-sidebar">
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '24px' }}>{t('welcome.editor_title')}</div>
                            <div className="v-stack" style={{ gap: '12px' }}>
                                <button
                                    className={`pc-studio-tab-v2 ${activeEmbedKey === 'welcome' ? 'active' : ''}`}
                                    onClick={() => setActiveEmbedKey('welcome')}
                                    style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 24px', border: 'none', borderRadius: '20px', cursor: 'pointer', transition: '0.2s', background: activeEmbedKey === 'welcome' ? 'var(--bg-card)' : 'transparent', color: activeEmbedKey === 'welcome' ? 'var(--text-heading)' : 'var(--text-muted)', fontWeight: 700, textAlign: 'left', border: activeEmbedKey === 'welcome' ? '1.5px solid var(--border)' : '1.5px solid transparent', boxShadow: activeEmbedKey === 'welcome' ? '0 10px 20px rgba(0,0,0,0.04)' : 'none' }}
                                >
                                    <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(16,185,129,0.08)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserPlus size={18} /></div>
                                    <span style={{ flex: 1 }}>{t('welcome.studio_welcome')}</span>
                                    <ChevronRight size={16} style={{ opacity: activeEmbedKey === 'welcome' ? 1 : 0.3 }} />
                                </button>
                                <button
                                    className={`pc-studio-tab-v2 ${activeEmbedKey === 'leave' ? 'active' : ''}`}
                                    onClick={() => setActiveEmbedKey('leave')}
                                    style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 24px', border: 'none', borderRadius: '20px', cursor: 'pointer', transition: '0.2s', background: activeEmbedKey === 'leave' ? 'var(--bg-card)' : 'transparent', color: activeEmbedKey === 'leave' ? 'var(--text-heading)' : 'var(--text-muted)', fontWeight: 700, textAlign: 'left', border: activeEmbedKey === 'leave' ? '1.5px solid var(--border)' : '1.5px solid transparent', boxShadow: activeEmbedKey === 'leave' ? '0 10px 20px rgba(0,0,0,0.04)' : 'none' }}
                                >
                                    <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserMinus size={18} /></div>
                                    <span style={{ flex: 1 }}>{t('welcome.studio_leave')}</span>
                                    <ChevronRight size={16} style={{ opacity: activeEmbedKey === 'leave' ? 1 : 0.3 }} />
                                </button>
                            </div>

                            <div className="welcome-editor-reset">
                                <button className="pc-btn-reset-v2" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: 'none', width: '100%', padding: '16px', borderRadius: '18px', fontWeight: 700, cursor: 'pointer', justifyContent: 'center', transition: '0.2s' }} onClick={() => {
                                    if (window.confirm(t('welcome.reset_confirm_params'))) {
                                        const defaults = defaultMessagesMap[language] || defaultMessagesMap['en'];
                                        const fallback = (defaults['welcome'] && defaults['welcome'][activeEmbedKey]) || { title: 'Verix Welcome', description: 'Welcome!', color: '#6366f1' };
                                        updateEmbed(activeEmbedKey, fallback);
                                    }
                                }}>
                                    <RefreshCw size={18} className={saving ? 'spinning' : ''} /> <span>{t('welcome.reset_params')}</span>
                                </button>
                            </div>
                        </aside>

                        <main className="welcome-editor-main">
                            <EmbedEditor
                                embed={config[activeEmbedKey]?.embed || {}}
                                onChange={d => updateEmbed(activeEmbedKey, d)}
                                variables={['user', 'user_mention', 'user_tag', 'guild', 'member_count']}
                                compact
                            />
                        </main>
                    </div>
                </div>
            )}

            {activeTab === 'system_messages' && (
                <div className="v-stack animate slide-up">
                    <section className="pc-card-v2">
                        <SystemMessagesSection
                            config={config}
                            onUpdate={setConfig}
                            messages={[
                                { key: 'test_success', label: t('welcome.msg_test_success'), placeholder: t('welcome.placeholder_test_success') },
                                { key: 'test_error', label: t('welcome.msg_test_error'), placeholder: t('welcome.placeholder_test_error') }
                            ]}
                        />
                    </section>
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1650px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            @media (max-width: 1200px) {
                .pc-layout-grid-v2 { grid-template-columns: 1fr !important; gap: 24px !important; }
            }

            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 12px 24px rgba(var(--primary-rgb), 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 2px; }
            .pc-title-row h1 { font-family: 'Inter', sans-serif; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: -0.03em; }

            .pc-status-tag-v2 { display: flex; align-items: center; gap: 6px; font-size: 0.6rem; font-weight: 700; padding: 4px 10px; border-radius: 100px;  width: fit-content; }
            .pc-status-tag-v2.on { background: rgba(16, 185, 129, 0.1); color: #10b981; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: #ef4444; }
            .status-dot-v2 { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

            .header-controls { display: flex; align-items: center; gap: 12px; }
            .pc-header-divider { width: 1.5px; height: 24px; background: var(--border); margin: 0 4px; }

            .text-active { color: #10b981; }
            .text-inactive { color: #ef4444; }

            .pc-btn-outline-v2 { background: var(--bg-badge); color: var(--text-muted); border: 1.5px solid var(--border); width: 44px; height: 44px; border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
            .pc-btn-outline-v2:hover:not(:disabled) { background: var(--bg-card); border-color: var(--primary); color: var(--primary); transform: translateY(-2px); }
            .pc-btn-outline-v2:disabled { opacity: 0.5; cursor: not-allowed; }

            .welcome-editor-shell { padding: 0 !important; overflow: hidden; min-height: 640px; }
            .welcome-editor-layout { display: grid; grid-template-columns: 280px minmax(0, 1fr); min-height: 640px; }
            .welcome-editor-sidebar { background: var(--bg-badge); border-right: 1px solid var(--border); padding: 24px; }
            .welcome-editor-main { padding: 24px; background: var(--bg-card); overflow-y: auto; }
            .welcome-editor-reset { margin-top: 24px; padding-top: 24px; border-top: 1px dashed var(--border); }

            /* Card V2 */
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
            .header-icon { width: 44px; height: 44px; background: var(--bg-badge); color: var(--primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.3rem; font-weight: 700; color: var(--text-heading); }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @media (max-width: 980px) {
                .welcome-editor-layout { grid-template-columns: 1fr; }
                .welcome-editor-sidebar { border-right: 0; border-bottom: 1px solid var(--border); }
            }
        `}</style>
    </div>
  );
}
