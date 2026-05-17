import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import {
  Save, Settings2, Palette, Bell, FileText, Tag, Plus, Trash2, Hash, RefreshCcw, Eye, 
  ChevronRight, ChevronDown, Monitor, Mic2, Ticket, Shield, AlertCircle, Check, Zap, 
  Info, Globe, ShieldAlert, Layers, User, Lock, Crown, Key, Bot, Activity, Layout, 
  Sparkles, Terminal, Globe2, BellRing, Settings, CheckCircle2, Languages, ShieldCheck,
  MousePointer2, Palette as PaletteIcon, EyeOff, RefreshCw, RotateCcw
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
            setChannels((discordRes?.channels || []).filter(c => c.type === 0 || c.type === 5));
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

  const handleReset = async () => {
    if (!confirm(t('common.reset_confirm'))) return;
    
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const res = await api.request(`/config/${guildId}/global/reset`, { method: 'POST' });
      if (res.success) {
        setConfig(res.data);
        showToast(t('common.reset_success'));
      }
    } catch (error) {
      console.error("Reset error:", error);
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
            <title>{t('global.title')} | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
                    <Settings2 size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('global.title')}</h1>
                    <div className="pc-status-tag-v2 on">
                        <div className="status-dot-v2"></div>
                        {t('global.core_active')}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <button className="pc-btn-outline-v2" onClick={handleReset} title={t('common.reset_to_default')}>
                    <RotateCcw size={18} />
                </button>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('common.sync')}</span>
                </button>
            </div>
        </header>

        {/* V2 Tabs */}
        <nav className="pc-tabs-container-v2" style={{ marginBottom: '40px' }}>
            <div className="pc-tabs-v2">
                <button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>
                    <Globe size={16} /> <span>{t('global.tab_general')}</span>
                </button>
                <button className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>
                    <BellRing size={16} /> <span>{t('global.tab_notifications')}</span>
                </button>
                <button className={activeTab === 'branding' ? 'active' : ''} onClick={() => setActiveTab('branding')}>
                    <Palette size={16} /> <span>{t('global.tab_branding')}</span>
                </button>
            </div>
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'general' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 560px', gap: '32px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2">
                                <div className="header-icon"><Languages size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('global.language_settings')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>{t('global.primary_language')}</label>
                                    <CustomSelect 
                                        options={[
                                            { value: 'it', label: 'Italiano' },
                                            { value: 'en', label: 'English' },
                                            { value: 'fr', label: 'Français' },
                                            { value: 'es', label: 'Español' },
                                            { value: 'de', label: 'Deutsch' }
                                        ]} 
                                        value={config.language || 'it'} 
                                        onChange={v => setNested('language', v)} 
                                    />
                                    <p className="pc-hint-v2" style={{ marginTop: '12px' }}>{t('global.lang_hint')}</p>
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="card-header-v2">
                                <div className="header-icon"><Terminal size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('global.prefix_config')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>{t('global.bot_prefix')}</label>
                                    <div className="pc-input-modern-v2">
                                        <Hash size={18} color="var(--text-dim)" />
                                        <input value={config.prefix || '!'} onChange={e => setNested('prefix', e.target.value)} maxLength={5} />
                                    </div>
                                    <p className="pc-hint-v2" style={{ marginTop: '12px' }}>{t('global.prefix_hint')}</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon"><ShieldCheck size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('global.security_policy')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-toggle-card-v2">
                                    <div className="v-stack">
                                        <strong>{t('global.staff_bypass')}</strong>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('global.staff_bypass_desc')}</span>
                                    </div>
                                    <label className="pc-toggle-v2 mini">
                                        <input type="checkbox" checked={!!config.staffBypass} onChange={e => setNested('staffBypass', e.target.checked)} />
                                        <span className="pc-slider-v2"></span>
                                    </label>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            )}

            {activeTab === 'notifications' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon"><Bell size={18} /></div>
                            <h3 style={{ margin: 0 }}>{t('global.notification_channels')}</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div className="pc-input-group-v2">
                                    <label>{t('global.mod_logs')}</label>
                                    <DiscordSelector type="channel" options={channels} value={config.modLogChannelId} onChange={v => setNested('modLogChannelId', v)} placeholder={t('global.select_channel')} />
                                    <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('global.mod_logs_help') || 'Channel for moderation logs.'}</p>
                                </div>
                                <div className="pc-input-group-v2">
                                    <label>{t('global.admin_logs')}</label>
                                    <DiscordSelector type="channel" options={channels} value={config.adminLogChannelId} onChange={v => setNested('adminLogChannelId', v)} placeholder={t('global.select_channel')} />
                                    <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('global.admin_logs_help') || 'Channel for administration logs.'}</p>
                                </div>
                                <div className="pc-input-group-v2" style={{ gridColumn: 'span 2', marginTop: '16px' }}>
                                    <label>{t('global.fallback_channel')}</label>
                                    <DiscordSelector type="channel" options={channels} value={config.fallbackChannelId} onChange={v => setNested('fallbackChannelId', v)} placeholder={t('global.select_channel')} />
                                    <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('global.fallback_channel_help')}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'branding' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon"><PaletteIcon size={18} /></div>
                            <h3 style={{ margin: 0 }}>{t('global.embed_branding')}</h3>
                        </div>
                        <div className="card-body-v2">
                            {!isPremium && (
                                <div className="pc-premium-lock-banner" style={{ marginBottom: '24px' }}>
                                    <Crown size={20} color="#fbbf24" />
                                    <p>{t('global.premium_branding_required')}</p>
                                    <button className="pc-btn-premium-v2 mini">{t('common.upgrade')}</button>
                                </div>
                            )}
                            <div className="pc-input-group-v2" style={{ opacity: isPremium ? 1 : 0.5, pointerEvents: isPremium ? 'all' : 'none' }}>
                                <label>{t('global.brand_color')}</label>
                                <div className="pc-color-input-v2">
                                    <input type="color" value={config.embedColor || '#6366f1'} onChange={e => setNested('embedColor', e.target.value)} />
                                    <input type="text" value={config.embedColor || '#6366f1'} onChange={e => setNested('embedColor', e.target.value)} />
                                </div>
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
            .pc-icon-box { width: 52px; height: 52px; color: #fff; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
            .pc-title-row h1 { font-family: 'Inter'; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 6px; font-size: 0.6rem; font-weight: 700; padding: 4px 10px; border-radius: 100px;  width: fit-content; }
            .pc-status-tag-v2.on { background: rgba(var(--primary-rgb), 0.1); color: var(--primary); }
            .status-dot-v2 { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }

            .pc-tabs-v2 { display: flex; gap: 6px; background: var(--bg-badge); padding: 5px; border-radius: 18px; width: fit-content; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; font-size: 0.9rem; border-radius: 14px; cursor: pointer; transition: 0.2s; }
            .pc-tabs-v2 button.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: var(--bg-badge); color: var(--primary); }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.3rem; font-weight: 700; color: var(--text-heading); }

            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; display: block; }
            .pc-input-modern-v2 { display: flex; align-items: center; gap: 12px; background: var(--bg-badge); border: 1.5px solid var(--border); border-radius: 14px; padding: 12px 16px; transition: 0.2s; }
            .pc-input-modern-v2:focus-within { border-color: var(--primary); }
            .pc-input-modern-v2 input { width: 100%; border: none; background: transparent; font-weight: 700; color: var(--text-heading); outline: none; }

            .pc-toggle-card-v2 { background: var(--bg-badge); padding: 20px; border-radius: 20px; border: 1.5px solid var(--border); display: flex; justify-content: space-between; align-items: center; transition: 0.2s; }
            .pc-toggle-card-v2 strong { font-weight: 700; color: var(--text-heading); }
            
            .pc-toggle-v2 { position: relative; width: 44px; height: 22px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: var(--border); transition: .4s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background: #fff; transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: var(--primary); }
            input:checked + .pc-slider-v2:before { transform: translateX(22px); }

            .pc-premium-lock-banner { display: flex; align-items: center; gap: 16px; background: rgba(251, 191, 36, 0.1); border: 1.5px solid rgba(251, 191, 36, 0.2); padding: 20px; border-radius: 20px; }
            .pc-premium-lock-banner p { margin: 0; font-size: 0.85rem; font-weight: 700; color: #fbbf24; flex: 1; }
            .pc-btn-premium-v2.mini { background: #fbbf24; color: #000; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 800; font-size: 0.75rem; cursor: pointer; }

            .pc-color-input-v2 { display: flex; align-items: center; gap: 12px; background: var(--bg-badge); padding: 10px; border-radius: 14px; border: 1.5px solid var(--border); width: fit-content; }
            .pc-color-input-v2 input[type="color"] { border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; background: transparent; }
            .pc-color-input-v2 input[type="text"] { border: none; background: transparent; font-weight: 700; color: var(--text-heading); outline: none; width: 80px; }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
