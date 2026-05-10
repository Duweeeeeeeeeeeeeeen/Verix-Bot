import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import {
  Save, Settings2, Palette, Bell, FileText, Tag, Plus, Trash2, Hash, RefreshCcw, Eye, 
  ChevronRight, ChevronDown, Monitor, Mic2, Ticket, Shield, AlertCircle, Check, Zap, 
  Info, Globe, ShieldAlert, Layers, User, Lock, Crown, Key, Bot, Activity, Layout, 
  Sparkles, Terminal, Globe2, BellRing, Settings, CheckCircle2, Languages, ShieldCheck,
  MousePointer2, Palette as PaletteIcon, EyeOff, RefreshCw
} from 'lucide-react';
import { useT } from '../../../contexts/LanguageContext';
import { DiscordSelector, CustomSelect } from '../../../components/LazyConfigComponents';
import Head from 'next/head';

export default function GlobalConfigPage() {
  const { t, setLanguage: setDashboardLanguage } = useT();
  const router = useRouter();
  const { guildId } = router.query;

  const [config, setConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [guildData, setGuildData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
        window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
        Promise.all([
            api.request(`/config/${guildId}/global`),
            api.request(`/config/${guildId}/discord-data`),
            api.request(`/config/${guildId}/guild`)
        ]).then(([cfgRes, discordRes, guildRes]) => {
            setConfig(cfgRes?.data || cfgRes);
            setChannels(discordRes?.channels || []);
            setRoles(discordRes?.roles || []);
            setGuildData(guildRes?.data || guildRes);
        }).catch(console.error).finally(() => {
            setLoading(false);
            window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
        });
    }
  }, [guildId, mounted]);

  const showToast = useCallback((message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/global`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      
      if (config.language) {
          setDashboardLanguage(config.language);
      }

      showToast(t('global.sync_success'));
    } catch (error) {
      showToast(t('common.error'), 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const setNested = (path, value) => {
    setConfig(prev => {
        const newConfig = { ...prev };
        const parts = path.split('.');
        let cur = newConfig;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!cur[parts[i]]) cur[parts[i]] = {};
            else cur[parts[i]] = { ...cur[parts[i]] };
            cur = cur[parts[i]];
        }
        cur[parts[parts.length - 1]] = value;
        return newConfig;
    });
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  const isPremium = guildData?.isPremium;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('global.title')} | Verix Studio</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
                    <Settings size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('global.title')}</h1>
                    <div className="pc-status-tag-v2 on">
                        <div className="status-dot-v2"></div>
                        {t('common.active_caps')}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('common.sync')}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-v2" style={{ marginBottom: '32px' }}>
            <button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>
                <Settings2 size={16} /> <span>{t('global.tab_general')}</span>
            </button>
            <button className={`${activeTab === 'identity' ? 'active' : ''} ${!isPremium ? 'premium-locked-tab' : ''}`} onClick={() => setActiveTab('identity')}>
                <User size={16} /> <span>{t('global.tab_identity')}</span>
                {!isPremium && <Lock size={12} style={{ marginLeft: '6px' }} />}
            </button>
            <button className={activeTab === 'logs' ? 'active' : ''} onClick={() => setActiveTab('logs')}>
                <BellRing size={16} /> <span>{t('global.tab_logs')}</span>
            </button>
            <button className={activeTab === 'advanced' ? 'active' : ''} onClick={() => setActiveTab('advanced')}>
                <Terminal size={16} /> <span>{t('global.tab_advanced')}</span>
            </button>
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'general' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                    <section className="pc-card-v2 animate slide-up">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}><Languages size={18} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>{t('global.loc_perms')}</h3>
                            </div>
                        </div>
                        <div className="card-body-v2">
                            <div className="v-stack" style={{ gap: '24px' }}>
                                <div className="pc-input-group-v2">
                                    <label>{t('global.sys_lang')}</label>
                                    <CustomSelect 
                                        options={[
                                            { value: 'it', label: 'Italiano 🇮🇹' },
                                            { value: 'en', label: 'English 🇺🇸' }
                                        ]} 
                                        value={config.language || 'en'} 
                                        onChange={val => setNested('language', val)} 
                                    />
                                </div>
                                <div className="pc-input-group-v2">
                                    <label>{t('global.admins')}</label>
                                    <DiscordSelector 
                                        type="role" 
                                        multiple 
                                        options={roles} 
                                        value={config.adminRoleIds || []} 
                                        onChange={val => setNested('adminRoleIds', val)} 
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}><PaletteIcon size={18} /></div>
                            <h3 style={{ margin: 0 }}>{t('global.branding')}</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-group-v2">
                                <label>{t('global.default_embed')}</label>
                                <div className="pc-color-box-v2">
                                    <div className="color-preview" style={{ backgroundColor: config.embedColor || '#6366f1' }}>
                                        <input type="color" value={config.embedColor || '#6366f1'} onChange={e => setNested('embedColor', e.target.value)} />
                                    </div>
                                    <input className="pc-input-modern-v2" style={{ flex: 1, fontWeight: 800 }} value={config.embedColor || '#6366f1'} onChange={e => setNested('embedColor', e.target.value)} />
                                    <button className="pc-btn-reset-v2" onClick={() => setNested('embedColor', '#6366f1')}><RefreshCcw size={16} /></button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'identity' && (
                <div className="v-stack animate slide-up">
                    {!isPremium ? (
                        <div className="pc-card-v2" style={{ textAlign: 'center', padding: '100px 32px' }}>
                             <Crown size={64} style={{ color: '#f59e0b', marginBottom: '24px', opacity: 0.5 }} />
                             <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '2rem', color: 'var(--text-heading)' }}>{t('global.tab_identity')}</h2>
                             <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontWeight: 700 }}>{t('global.platinum_locked')}</p>
                             <button className="pc-btn-primary" style={{ margin: '0 auto', background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }} onClick={() => router.push(`/config/${guildId}/premium`)}>
                                <Sparkles size={20} /> <span>Go Platinum</span>
                             </button>
                        </div>
                    ) : (
                        <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                             <section className="pc-card-v2 animate slide-up">
                                <div className="card-header-v2">
                                    <div className="header-icon" style={{ background: 'rgba(217, 119, 6, 0.1)', color: '#d97706' }}><Bot size={18} /></div>
                                    <h3 style={{ margin: 0 }}>{t('global.private_bot')}</h3>
                                </div>
                                <div className="card-body-v2">
                                    <div className="v-stack" style={{ gap: '24px' }}>
                                        <div className="pc-input-group-v2">
                                            <label>{t('global.dev_token')}</label>
                                            <div className="pc-input-modern-v2">
                                                <Key size={18} />
                                                <input type="password" placeholder="MTE5MzQyNjU0..." value={config.customBot?.token || ''} onChange={e => setNested('customBot.token', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="pc-input-group-v2">
                                            <label>{t('global.bot_name')}</label>
                                            <input className="pc-input-modern-v2" value={config.customBot?.name || ''} onChange={e => setNested('customBot.name', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                             </section>

                             <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                                <div className="card-header-v2">
                                    <div className="header-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><Activity size={18} /></div>
                                    <h3 style={{ margin: 0 }}>{t('global.presence')}</h3>
                                </div>
                                <div className="card-body-v2">
                                    <div className="v-stack" style={{ gap: '24px' }}>
                                        <div className="pc-input-group-v2">
                                            <label>{t('global.activity_msg')}</label>
                                            <textarea className="pc-input-modern-v2" style={{ minHeight: '80px' }} value={config.customBot?.status || ''} onChange={e => setNested('customBot.status', e.target.value)} />
                                        </div>
                                        <div className="pc-sub-card-v2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div className="v-stack">
                                                <strong style={{ fontWeight: 800 }}>{t('global.whitelabeling')}</strong>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t('global.whitelabeling_desc')}</span>
                                            </div>
                                            <label className="pc-toggle-v2">
                                                <input type="checkbox" checked={!!config.customBot?.noBranding} onChange={e => setNested('customBot.noBranding', e.target.checked)} />
                                                <span className="pc-slider-v2"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                             </section>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="v-stack animate slide-up">
                    <section className="pc-card-v2" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><BellRing size={18} /></div>
                            <h3 style={{ margin: 0, flex: 1 }}>{t('global.sys_registry')}</h3>
                            <label className="pc-toggle-v2">
                                <input type="checkbox" checked={!!config.logs?.enabled} onChange={e => setNested('logs.enabled', e.target.checked)} />
                                <span className="pc-slider-v2"></span>
                            </label>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-group-v2">
                                <label>{t('global.log_channel')}</label>
                                <DiscordSelector type="channel" options={channels} value={config.logs?.channelId || ''} onChange={val => setNested('logs.channelId', val)} />
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'advanced' && (
                <div className="v-stack animate slide-up">
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon"><Terminal size={18} /></div>
                            <h3 style={{ margin: 0 }}>{t('global.tab_advanced')}</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-code-shell-v2">
                                <pre><code>{JSON.stringify(config, null, 2)}</code></pre>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1500px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; color: white; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
            .pc-title-row h1 { font-family: 'Inter'; font-size: 1.8rem; font-weight: 800; margin: 0; color: var(--text-heading); letter-spacing: -0.5px; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 6px; font-size: 0.6rem; font-weight: 800; padding: 4px 10px; border-radius: 100px; background: rgba(37, 99, 235, 0.1); color: #2563eb; }
            .status-dot-v2 { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }

            .pc-tabs-v2 { display: flex; gap: 6px; background: var(--bg-badge); padding: 5px; border-radius: 16px; width: fit-content; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; background: transparent; color: var(--text-muted); font-weight: 800; font-size: 0.9rem; border-radius: 12px; cursor: pointer; transition: 0.2s; }
            .pc-tabs-v2 button.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .premium-locked-tab { color: #f59e0b !important; }

            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: var(--bg-badge); }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.3rem; font-weight: 800; color: var(--text-heading); }

            .pc-sub-card-v2 { background: var(--bg-badge); padding: 24px; border-radius: 20px; border: 1.5px solid var(--border); }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; display: block; }
            .pc-input-modern-v2 { display: flex; align-items: center; gap: 12px; background: var(--bg-card); padding: 10px 16px; border-radius: 14px; border: 1.5px solid var(--border); }
            .pc-input-modern-v2 input { border: none; background: transparent; width: 100%; font-weight: 800; font-size: 1rem; outline: none; color: var(--text-heading); }

            .pc-color-box-v2 { display: flex; align-items: center; gap: 12px; background: var(--bg-badge); padding: 12px; border-radius: 16px; border: 1.5px solid var(--border); }
            .color-preview { width: 40px; height: 40px; border-radius: 10px; border: 2px solid white; position: relative; overflow: hidden; }
            .color-preview input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
            .pc-btn-reset-v2 { background: transparent; border: none; color: var(--text-muted); cursor: pointer; }

            .pc-toggle-v2 { position: relative; width: 44px; height: 22px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: #cbd5e1; transition: .4s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background: white; transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: var(--primary); }
            input:checked + .pc-slider-v2:before { transform: translateX(22px); }

            .pc-code-shell-v2 { background: #0f172a; padding: 24px; border-radius: 20px; color: #38bdf8; font-family: monospace; overflow-x: auto; }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
