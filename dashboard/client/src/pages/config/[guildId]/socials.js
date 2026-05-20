import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import { DiscordSelector, CustomSelect, EmbedMessageManager } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { 
    Save, Settings2, Trash2, Plus, Tv, Youtube, Instagram, Twitter, Share2, Hash, 
    MessageSquare, BellRing, ChevronRight, Sparkles, Lock, Search, Zap, Users, 
    Info, Layout, ArrowRight, X, CheckCircle2, Monitor, Globe, Cpu, UserPlus, 
    Power, Radio, Send, Bell, Palette, Globe2, Link2, Ghost, RotateCcw
} from 'lucide-react';
import { useT } from '../../../contexts/LanguageContext';
import Head from 'next/head';

const XLogo = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4l11.733 16H20L8.267 4H4z" fill={color} stroke="none" />
        <path d="M4 20l6.768-6.768m2.464-2.464L20 4" />
    </svg>
);

const RedditLogo = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.29-1.72l1.3-4.08 4.22.9c.04.93.8 1.66 1.74 1.66 1.65 0 3-1.35 3-3s-1.35-3-3-3c-.94 0-1.7.53-2.07 1.29l-4.73-1a.76.76 0 0 0-.91.56L10.3 6.94C7.8 7 5.54 7.64 3.9 8.65c-.56-.76-1.46-1.24-2.42-1.24-1.65 0-3 1.35-3 3 0 1.2.71 2.24 1.74 2.74-.03.22-.05.45-.05.67 0 3.73 4.3 6.75 9.6 6.75 5.3 0 9.6-3.02 9.6-6.75 0-.22-.02-.45-.05-.67 1.03-.5 1.74-1.54 1.74-2.74zm-18 1c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm11.4 4.89c-.9.9-2.61.98-3.4.98-.79 0-2.5-.08-3.4-.98-.24-.24-.24-.64 0-.88.24-.24.64-.24.88 0 .63.63 1.84.73 2.52.73.68 0 1.89-.1 2.52-.73.24-.24.64-.24.88 0 .24.24.24.64 0 .88zm.1-3.39c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>
);

const SteamLogo = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .002a12 12 0 0 0-12 12 12 12 0 0 0 7.828 11.237c.365-.418.665-.92.833-1.463l3.663-1.488a4.7 4.7 0 0 0 .546.069 4.7 4.7 0 0 0 4.673-4.707 4.7 4.7 0 0 0-4.673-4.707 4.7 4.7 0 0 0-1.328.2l-2.038-2.905c-.004-.326-.067-.655-.195-.97l-3.313 1.346c.168.544.468 1.045.833 1.463L4.85 17.584c-.22.09-.434.195-.643.32a3.8 3.8 0 0 1-.365-.418 3.8 3.8 0 0 1 3.818-3.818c1.328 0 2.457.685 3.09 1.724l2.037 2.905c.004.327.067.656.196.97a3.8 3.8 0 0 1-.546-.07z"/>
    </svg>
);

const PLATFORMS = [
    { id: 'twitch', nameKey: 'socials.twitch_name', icon: Tv, color: '#9146ff', descKey: 'socials.twitch_desc' },
    { id: 'youtube', nameKey: 'socials.youtube_name', icon: Youtube, color: '#ff0000', descKey: 'socials.youtube_desc' },
    { id: 'instagram', nameKey: 'socials.instagram_name', icon: Instagram, color: '#e1306c', descKey: 'socials.instagram_desc' },
    { id: 'tiktok', nameKey: 'socials.tiktok_name', icon: Share2, color: '#000000', descKey: 'socials.tiktok_desc' },
    { id: 'twitter', nameKey: 'socials.twitter_name', icon: XLogo, color: '#000000', descKey: 'socials.twitter_desc' },
    { id: 'reddit', nameKey: 'socials.reddit_name', icon: RedditLogo, color: '#ff4500', descKey: 'socials.reddit_desc' },
    { id: 'steam', nameKey: 'socials.steam_name', icon: SteamLogo, color: '#1b2838', descKey: 'socials.steam_desc' }
];

export default function SocialsConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [], members: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [guildData, setGuildData] = useState(null);
  
  const [activePlatform, setActivePlatform] = useState('twitch');
  const [activeTab, setActiveTab] = useState('settings'); 

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
      const [configRes, discordRes, guildRes] = await Promise.all([
        api.request(`/config/${guildId}/socials`),
        api.request(`/config/${guildId}/discord-data`),
        api.request(`/config/${guildId}/guild`)
      ]);
      let moduleConfig = configRes?.data || configRes || { platforms: {} };
      if (!moduleConfig.platforms) moduleConfig.platforms = {};
      
      PLATFORMS.forEach(p => {
          if (!moduleConfig.platforms[p.id]) {
              moduleConfig.platforms[p.id] = { enabled: false, notificationChannelId: null, roleId: null, mentionEveryone: false, accounts: [], embed: {} };
          }
      });
      
      setConfig(moduleConfig);
      const dData = discordRes?.data || discordRes || { roles: [], channels: [], members: [] };
      setDiscordData({
        ...dData,
        channels: (dData.channels || []).filter(c => c.type === 0 || c.type === 5)
      });
      setGuildData(guildRes?.data || guildRes);
    } catch (err) {
      if (!api.isAuthError(err)) {
        console.error("Failed to load socials config", err);
      }
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleReset = async () => {
    if (!confirm(t('common.reset_confirm'))) return;
    
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const res = await api.request(`/config/${guildId}/socials/reset`, { method: 'POST' });
      if (res.success) {
        setConfig(res.data);
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.reset_success'), type: 'success' } }));
      }
    } catch (error) {
      if (!api.isAuthError(error)) {
        console.error("Reset error:", error);
      }
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.reset_error'), type: 'error' } }));
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/socials`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('socials.sync_success'), type: 'success' } }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.error'), type: 'error' } }));
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const updatePlatform = (field, value) => {
    const newConfig = { ...config };
    newConfig.platforms[activePlatform][field] = value;
    setConfig(newConfig);
  };

  const addAccount = () => {
    const newConfig = { ...config };
    if (!newConfig.platforms[activePlatform].accounts) newConfig.platforms[activePlatform].accounts = [];
    newConfig.platforms[activePlatform].accounts.push({ username: '', discordUserId: null });
    setConfig(newConfig);
  };

  const removeAccount = (index) => {
    const newConfig = { ...config };
    newConfig.platforms[activePlatform].accounts.splice(index, 1);
    setConfig(newConfig);
  };

  const updateAccount = (index, field, value) => {
    const newConfig = { ...config };
    newConfig.platforms[activePlatform].accounts[index][field] = value;
    setConfig(newConfig);
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  const currentPlatformConfig = config.platforms[activePlatform];
  const pData = PLATFORMS.find(p => p.id === activePlatform);
  const platformName = t(pData.nameKey);
  const premiumTier = guildData?.premiumTier || (guildData?.isPremium ? 'premium' : 'none');
  const isLocked = !['premium', 'platinum'].includes(premiumTier) && 
    !(premiumTier === 'lite' && (activePlatform === 'twitch' || activePlatform === 'youtube')) && 
    !(premiumTier === 'none' && activePlatform === 'twitch');
  const getAccountStatus = (account) => {
    const backoffUntil = account.bridgeBackoffUntil ? new Date(account.bridgeBackoffUntil) : null;
    const isBackoff = backoffUntil && backoffUntil.getTime() > Date.now();

    if (isBackoff) {
      return {
        tone: 'warn',
        label: t('socials.status_retrying'),
        detail: `${t('socials.status_next_retry')} ${backoffUntil.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        isBackoff: true
      };
    }

    if (account.bridgeErrorCount > 0) {
      return {
        tone: 'warn',
        label: t('socials.status_unstable'),
        detail: t('socials.status_unstable_desc'),
        isBackoff: false
      };
    }

    if (account.lastPostId || account.isLive || account.lastCheckAt) {
      return {
        tone: 'ok',
        label: t('socials.status_monitoring'),
        detail: account.lastCheckAt
          ? `${t('socials.status_last_check')} ${new Date(account.lastCheckAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : t('socials.status_ready_desc'),
        isBackoff: false
      };
    }

    return {
      tone: 'idle',
      label: t('socials.status_pending'),
      detail: t('socials.status_pending_desc'),
      isBackoff: false
    };
  };

  const formatDiagnosticTime = (value) => {
    if (!value) return 'Never';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Invalid';
    return date.toLocaleString([], {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAccountDiagnostics = (account) => {
    const backoffUntil = account.bridgeBackoffUntil ? new Date(account.bridgeBackoffUntil) : null;
    const isBackoff = backoffUntil && backoffUntil.getTime() > Date.now();
    return [
      { label: 'Last check', value: formatDiagnosticTime(account.lastCheckAt), tone: account.lastCheckAt ? 'ok' : 'idle' },
      { label: activePlatform === 'twitch' ? 'Live state' : 'Last content', value: activePlatform === 'twitch' ? (account.isLive ? 'Live' : 'Offline') : (account.lastPostId ? 'Tracked' : 'Not initialized'), tone: account.lastPostId || account.isLive ? 'ok' : 'idle' },
      { label: 'Seen cache', value: `${account.seenPostIds?.length || 0}/100`, tone: (account.seenPostIds?.length || 0) > 0 ? 'ok' : 'idle' },
      { label: 'Feed health', value: isBackoff ? `Retry ${formatDiagnosticTime(backoffUntil)}` : ((account.bridgeErrorCount || 0) > 0 ? `${account.bridgeErrorCount} recent errors` : 'Healthy'), tone: isBackoff || (account.bridgeErrorCount || 0) > 0 ? 'warn' : 'ok' }
    ];
  };

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('socials.studio_title')} | Verix Dashboard</title>
        </Head>

        {/* V2 Header - Reduced padding */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
                    <Globe2 size={24} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('socials.studio_title')}</h1>
                    <div className="pc-status-tag-v2 on">
                        <div className="status-dot-v2"></div>
                        {t('common.active_system')}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <button className="pc-btn-outline-v2" onClick={handleReset} title={t('common.reset_to_default')}>
                    <RotateCcw size={18} />
                </button>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('common.save_changes')}</span>
                </button>
            </div>
        </header>

        <div className="pc-layout-grid-v2 socials-layout">
            {/* V2 Platform Navigator Sidebar */}
            <aside className="v-stack animate slide-up socials-sidebar" style={{ gap: '16px' }}>
                <div className="pc-sidebar-card-v2">
                    <span className="sidebar-label-v2">{t('socials.repository')}</span>
                    <nav className="pc-nav-stack-v2">
                        {PLATFORMS.map(p => {
                            const locked = !['premium', 'platinum'].includes(premiumTier) && 
                                !(premiumTier === 'lite' && (p.id === 'twitch' || p.id === 'youtube')) && 
                                !(premiumTier === 'none' && p.id === 'twitch');
                            const active = activePlatform === p.id;
                            const isEnabled = config.platforms[p.id]?.enabled;
                            return (
                                <button 
                                    key={p.id} 
                                    className={`pc-nav-item-v2 ${active ? 'active' : ''} ${locked ? 'locked' : ''}`}
                                    onClick={() => !locked && setActivePlatform(p.id)}
                                >
                                    <div className="p-icon-box-v2" style={{ background: active ? p.color : 'var(--bg-badge)', color: active ? '#fff' : locked ? 'var(--text-muted)' : p.color }}>
                                        {locked ? <Lock size={18} /> : <p.icon size={20} />}
                                    </div>
                                    <div className="v-stack" style={{ flex: 1, textAlign: 'left' }}>
                                        <div className="p-name-v2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {t(p.nameKey)}
                                            <div className={`nav-status-dot-mini ${isEnabled ? 'on' : 'off'}`} />
                                        </div>
                                        {isEnabled && <div className="nav-sync-tag-v2"><span>{t('socials.synchronized')}</span></div>}
                                    </div>
                                    {active && <ChevronRight size={16} color="var(--primary)" style={{ opacity: 0.5 }} />}
                                    {locked && <div className="lock-badge-v2"><Sparkles size={8} /></div>}
                                </button>
                            );
                        })}
                    </nav>
                </div>
                {!isLocked && currentPlatformConfig.enabled && activeTab === 'design' && (
                    <div className="pc-sidebar-card-v2 socials-library-card">
                        <span className="sidebar-label-v2">{t('embeds.manager.sidebar_title')}</span>
                        <button className="socials-library-item active" type="button">
                            <div className="p-icon-box-v2" style={{ background: 'var(--bg-badge)', color: pData.color }}>
                                <Globe2 size={18} />
                            </div>
                            <div className="v-stack" style={{ flex: 1, textAlign: 'left' }}>
                                <div className="p-name-v2">{platformName} {t('socials.announcement_label')}</div>
                                <div className="nav-sync-tag-v2"><span>{t('socials.design_tab')}</span></div>
                            </div>
                        </button>
                    </div>
                )}
            </aside>

            {/* V2 Main Platform Studio Area */}
            <main className="v-stack" style={{ gap: '24px' }}>
                {isLocked ? (
                    <div className="pc-tier-gate-v2 animate slide-up">
                        <div className="gate-icon-v2">
                            <Lock size={40} />
                        </div>
                        <h2>{t('premium.slot_locked')}</h2>
                        <p>{t('socials.tier_gate_desc', { platform: platformName })}</p>
                        <button className="pc-btn-primary" onClick={() => router.push(`/config/${guildId}/premium`)}>
                            <Sparkles size={20} />
                            <span>{t('socials.upgrade_now')}</span>
                        </button>
                    </div>
                ) : (
                    <div className="v-stack animate slide-up" key={activePlatform} style={{ gap: '24px' }}>
                        <section className="pc-platform-banner-v2">
                            <div className="p-hero-icon-v2" style={{ color: pData.color }}>
                                <pData.icon size={36} />
                            </div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-heading)' }}>{platformName}</h4>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, lineHeight: 1.4 }}>{t(pData.descKey)}</p>
                            </div>
                            <div className="v-stack" style={{ alignItems: 'flex-end', gap: '12px' }}>
                                <div className={`pc-status-badge-v2 ${currentPlatformConfig.enabled ? 'on' : 'off'}`}>
                                    <div className="dot"></div>
                                    {currentPlatformConfig.enabled ? t('socials.service_active') : t('socials.service_standby')}
                                </div>
                                <label className="pc-toggle-v2">
                                    <input type="checkbox" checked={currentPlatformConfig.enabled} onChange={e => updatePlatform('enabled', e.target.checked)} />
                                    <span className="pc-slider-v2"></span>
                                </label>
                            </div>
                        </section>

                        {!currentPlatformConfig.enabled ? (
                            <div className="pc-standby-view-v2">
                                <div className="standby-icon-v2">
                                    <Radio size={40} />
                                </div>
                                <h3>{t('socials.standby_title')}</h3>
                                <p>{t('socials.standby_desc')}</p>
                                <button className="pc-btn-primary" onClick={() => updatePlatform('enabled', true)}>{t('socials.deploy_modulo')} {platformName}</button>
                            </div>
                        ) : (
                            <>
                                <nav className="pc-tabs-v2">
                                    <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                                         <UserPlus size={16} /> <span>{t('socials.account_tab')}</span>
                                     </button>
                                     <button className={activeTab === 'design' ? 'active' : ''} onClick={() => setActiveTab('design')}>
                                         <Palette size={16} /> <span>{t('socials.design_tab')}</span>
                                     </button>
                                 </nav>

                                 {activeTab === 'settings' && (
                                     <div className="pc-settings-layout-v2">
                                         <div className="v-stack" style={{ gap: '24px' }}>
                                             <section className="pc-card-v2">
                                                 <div className="card-header-v2">
                                                     <div className="header-icon"><Users size={18} /></div>
                                                     <h3>
                                                         {activePlatform === 'steam' 
                                                             ? t('socials.monitored_games') 
                                                             : activePlatform === 'reddit' 
                                                                 ? t('socials.monitored_subreddits') 
                                                                 : t('socials.monitored_channels')}
                                                     </h3>
                                                 </div>
                                                 <div className="card-body-v2">
                                                     <div className="v-stack" style={{ gap: '16px' }}>
                                                         {(currentPlatformConfig.accounts || []).map((acc, i) => {
                                                            const accountStatus = getAccountStatus(acc);
                                                            const diagnostics = getAccountDiagnostics(acc);
                                                            return (
                                                             <div key={i} className="pc-sub-card-v2 animate slide-up">
                                                                 <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                                    <div className="v-stack" style={{ flex: 1, gap: '8px' }}>
                                                                        <label className="input-label-v2">{platformName} {t('socials.account_id_label')}</label>
                                                                        <div className="pc-input-modern-v2">
                                                                            <Link2 size={16} />
                                                                            <input 
                                                                                placeholder={t(`socials.placeholder_${pData.id}`)}
                                                                                value={acc.username}
                                                                                onChange={e => updateAccount(i, 'username', e.target.value)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <button onClick={() => removeAccount(i)} className="pc-btn-icon-danger-v2" style={{ marginTop: '22px' }}>
                                                                        <Trash2 size={20} />
                                                                    </button>
                                                                 </div>

                                                                 <div className={`social-account-status-v2 ${accountStatus.tone}`}>
                                                                    <div className="status-main-v2">
                                                                        <span className="status-dot-inline-v2"></span>
                                                                        <strong>{accountStatus.label}</strong>
                                                                    </div>
                                                                    <span>{accountStatus.detail}</span>
                                                                 </div>

                                                                 {activePlatform === 'twitter' && (accountStatus.isBackoff || acc.bridgeErrorCount > 0) && (
                                                                     <div className="twitter-bridge-alert">
                                                                         <div className="alert-header">
                                                                             <Info size={16} className="alert-icon" />
                                                                             <strong>{t('socials.twitter_bridge_title')}</strong>
                                                                         </div>
                                                                         <p className="alert-text">{t('socials.twitter_bridge_notice')}</p>
                                                                         <div className="alert-footer">
                                                                             <span className="status-badge-saved">{t('socials.settings_saved_status')}</span>
                                                                         </div>
                                                                     </div>
                                                                 )}

                                                                 <div className="social-diagnostics-grid">
                                                                    {diagnostics.map(item => (
                                                                        <div key={item.label} className={`social-diagnostic-cell ${item.tone}`}>
                                                                            <span>{item.label}</span>
                                                                            <strong>{item.value}</strong>
                                                                        </div>
                                                                    ))}
                                                                 </div>
                                                                 
                                                                 {activePlatform === 'twitch' && (
                                                                     <div className="v-stack animate slide-up" style={{ gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--border)', marginTop: '16px' }}>
                                                                         <label className="input-label-v2">{t('socials.discord_link_label')}</label>
                                                                         <DiscordSelector type="user" options={discordData.members || []} value={acc.discordUserId || ''} onChange={val => updateAccount(i, 'discordUserId', val)} placeholder="Seleziona l'utente Discord associato" />
                                                                     </div>
                                                                 )}
                                                             </div>
                                                            );
                                                         })}
                                                         <button className="pc-btn-add-account-v2" onClick={addAccount}>
                                                             <Plus size={20} /> <span>{t('socials.connect_new')} {platformName}</span>
                                                         </button>
                                                     </div>
                                                 </div>
                                             </section>
                                         </div>

                                        <div className="v-stack" style={{ gap: '24px' }}>
                                            <section className="pc-card-v2">
                                                <div className="card-header-v2">
                                                    <div className="header-icon"><Bell size={18} /></div>
                                                    <h3>{t('socials.dispatch_settings')}</h3>
                                                </div>
                                                <div className="card-body-v2">
                                                    <div className="pc-input-group-v2">
                                                        <label>{t('socials.target_channel')}</label>
                                                        <DiscordSelector type="channel" options={discordData.channels} value={currentPlatformConfig.notificationChannelId || ''} onChange={val => updatePlatform('notificationChannelId', val)} />
                                                        <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('socials.target_channel_help')}</p>
                                                    </div>
                                                    <div className="pc-input-group-v2" style={{ marginTop: '24px' }}>
                                                        <label>{t('socials.target_role')}</label>
                                                        <DiscordSelector type="role" options={discordData.roles} value={currentPlatformConfig.roleId || ''} onChange={val => updatePlatform('roleId', val)} />
                                                        <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('socials.target_role_help')}</p>
                                                    </div>

                                                    {activePlatform === 'twitch' && (
                                                        <div className="pc-input-group-v2 animate slide-up" style={{ marginTop: '24px' }}>
                                                            <label>{t('socials.twitch_live_role')}</label>
                                                            <DiscordSelector type="role" options={discordData.roles} value={currentPlatformConfig.liveRoleId || ''} onChange={val => updatePlatform('liveRoleId', val)} />
                                                            <p className="input-hint-v2">{t('socials.twitch_live_role_hint')}</p>
                                                        </div>
                                                    )}

                                                    <div className="pc-toggle-card-v2" style={{ marginTop: '32px' }}>
                                                        <div className="v-stack" style={{ gap: '4px' }}>
                                                            <strong>{t('socials.everyone_tag')}</strong>
                                                            <span>{t('socials.everyone_tag_desc')}</span>
                                                        </div>
                                                        <label className="pc-toggle-v2">
                                                            <input type="checkbox" checked={currentPlatformConfig.mentionEveryone} onChange={e => updatePlatform('mentionEveryone', e.target.checked)} />
                                                            <span className="pc-slider-v2"></span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                     </div>
                                 )}

                                 {activeTab === 'design' && (
                                     <div className="socials-message-manager animate slide-up">
                                         <EmbedMessageManager 
                                             guildId={guildId}
                                             module="socials"
                                             compact
                                             hideSidebar
                                             slugs={[
                                                 { key: pData.id, label: `${platformName} ${t('socials.announcement_label')}`, description: t('socials.announcement_desc', { platform: platformName }), variables: ['username', 'link', 'title', 'preview_url', 'platform'], group: t('socials.title'), groupIcon: Globe2 },
                                             ]}
                                         />
                                     </div>
                                 )}
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 24px; max-width: 1650px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            .socials-layout { display: grid; grid-template-columns: 230px minmax(0, 1fr) !important; gap: 20px; align-items: flex-start; }
            .socials-sidebar { position: sticky; top: 24px; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; color: #fff; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
            .pc-title-row h1 { font-family: 'Inter', sans-serif; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 6px; font-size: 0.6rem; font-weight: 700; padding: 4px 10px; border-radius: 100px;  width: fit-content; }
            .pc-status-tag-v2.on { background: rgba(16, 185, 129, 0.1); color: #10b981; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: #ef4444; }
            .status-dot-v2 { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
            .nav-status-dot-mini { width: 6px; height: 6px; border-radius: 50%; transition: 0.2s; }
            .nav-status-dot-mini.on { background: #10b981; box-shadow: 0 0 6px rgba(16, 185, 129, 0.4); }
            .nav-status-dot-mini.off { background: var(--text-dim); opacity: 0.3; }

            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }

            /* Sidebar */
            .pc-sidebar-card-v2 { background: var(--bg-card); padding: 14px; border-radius: 16px; box-shadow: none; border: 1px solid var(--border); }
            .sidebar-label-v2 { font-size: 0.68rem; font-weight: 750; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0; margin-bottom: 12px; display: block; padding: 0 4px; }
            .pc-nav-stack-v2 { display: flex; flex-direction: column; gap: 6px; }
            .pc-nav-item-v2 { display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid transparent; background: transparent; border-radius: 12px; cursor: pointer; transition: 0.2s; position: relative; width: 100%; min-height: 56px; }
            .pc-nav-item-v2:hover:not(.locked) { background: var(--bg-badge); color: var(--primary); }
            .pc-nav-item-v2.active { background: var(--bg-badge); border-color: var(--primary); color: var(--primary); }
            .p-icon-box-v2 { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; transition: 0.2s; flex-shrink: 0; }
            .p-name-v2 { font-weight: 700; font-size: 0.9rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 145px; }
            .nav-sync-tag-v2 { display: flex; align-items: center; gap: 4px; margin-top: 2px; }
            .nav-sync-tag-v2 .dot { width: 4px; height: 4px; border-radius: 50%; background: #10b981; }
            .nav-sync-tag-v2 span { font-size: 0.62rem; color: #10b981; font-weight: 700; text-transform: none; }
            .lock-badge-v2 { position: absolute; right: 10px; top: 10px; background: linear-gradient(135deg, #a855f7, #7c3aed); color: #fff; padding: 3px; border-radius: 6px; }

            .pc-pro-card-v2 { background: var(--bg-badge); padding: 16px; border-radius: 16px; color: var(--text-heading); border: 1px solid var(--border); }
            .pro-header-v2 { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
            .pro-icon-v2 { padding: 8px; background: var(--bg-card); border-radius: 10px; color: var(--primary); }
            .pc-pro-card-v2 p { margin: 0; font-size: 0.8rem; opacity: 0.8; line-height: 1.6; font-weight: 700; }

            /* Main Area */
            .pc-platform-banner-v2 { display: flex; align-items: center; gap: 18px; padding: 20px; background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border); position: relative; overflow: hidden; box-shadow: none; }
            .p-hero-icon-v2 { width: 52px; height: 52px; border-radius: 14px; background: var(--bg-badge); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .pc-platform-banner-v2 h2 { margin: 0; font-family: 'Inter'; font-size: 1.6rem; font-weight: 700; color: var(--text-heading); }
            .pc-platform-banner-v2 p { margin: 6px 0 0 0; color: var(--text-muted); font-size: 0.95rem; font-weight: 700; }
            .pc-status-badge-v2 { display: flex; align-items: center; gap: 6px; background: var(--bg-badge); color: var(--text-muted); padding: 5px 12px; border-radius: 100px; font-size: 0.65rem; font-weight: 700; border: 1px solid var(--border); }
            .pc-status-badge-v2.on { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: rgba(16, 185, 129, 0.2); }
            .pc-status-badge-v2 .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

            .pc-tabs-v2 { display: flex; gap: 6px; background: var(--bg-badge); padding: 5px; border-radius: 18px; width: fit-content; margin-top: 8px; overflow-x: auto; max-width: 100%; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 10px; padding: 10px 24px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; font-size: 0.9rem; border-radius: 14px; cursor: pointer; transition: 0.2s; }
            .pc-tabs-v2 button.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

            .pc-settings-layout-v2 { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr); gap: 20px; align-items: start; }
            .socials-library-card { animation: slideUp 0.25s ease-out; }
            .socials-library-item { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 14px; border: 1.5px solid rgba(var(--primary-rgb), 0.18); background: rgba(var(--primary-rgb), 0.06); color: var(--text-heading); cursor: default; }
            .socials-library-item .p-name-v2 { white-space: normal; overflow-wrap: anywhere; text-overflow: clip; max-width: none; line-height: 1.25; }
            .socials-message-manager :global(.manager-layout) { grid-template-columns: 1fr !important; max-width: 100% !important; margin: 0 !important; }
            .socials-message-manager :global(.slug-sidebar) { position: static !important; }
            .socials-message-manager :global(.pc-editor-layout-v2) { grid-template-columns: 1fr !important; max-width: 100% !important; }
            .socials-message-manager :global(.pc-preview-sidebar-v2) { position: static !important; }
            .socials-message-manager :global(.editor-header-v2) { align-items: flex-start !important; flex-wrap: wrap !important; }
            .socials-message-manager :global(.header-buttons-v2) { flex-wrap: wrap !important; }
            .socials-message-manager :global(.header-buttons-v2 button) { min-height: 44px; }
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 24px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 18px; }
            .header-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: var(--bg-badge); color: var(--primary); }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.3rem; font-weight: 700; color: var(--text-heading); }

            .pc-sub-card-v2 { background: var(--bg-badge); padding: 16px; border-radius: 14px; border: 1px solid var(--border); }
            .input-label-v2 { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0; }
            .pc-input-modern-v2 { display: flex; align-items: center; gap: 12px; background: var(--bg-card); padding: 10px 14px; border-radius: 12px; border: 1px solid var(--border); transition: 0.2s; }
            .pc-input-modern-v2:focus-within { border-color: var(--primary); }
            .pc-input-modern-v2 input { border: none; background: transparent; width: 100%; font-weight: 700; font-size: 1rem; outline: none; color: var(--text-heading); }
            
            .pc-btn-icon-danger-v2 { width: 40px; height: 40px; border-radius: 12px; background: rgba(239, 68, 68, 0.08); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.14); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
            .pc-btn-icon-danger-v2:hover { background: #ef4444; color: #fff; }

            .social-account-status-v2 { margin-top: 14px; padding: 12px 14px; border-radius: 14px; display: flex; justify-content: space-between; gap: 12px; align-items: center; font-size: 0.72rem; font-weight: 700; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-muted); }
            .social-account-status-v2.ok { border-color: rgba(16, 185, 129, 0.24); background: rgba(16, 185, 129, 0.08); color: #10b981; }
            .social-account-status-v2.warn { border-color: rgba(245, 158, 11, 0.28); background: rgba(245, 158, 11, 0.1); color: #d97706; }
            .social-account-status-v2.idle { color: var(--text-muted); }
            .status-main-v2 { display: flex; align-items: center; gap: 8px; color: inherit; }
            .status-dot-inline-v2 { width: 7px; height: 7px; border-radius: 999px; background: currentColor; flex-shrink: 0; }
            .social-diagnostics-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
            .social-diagnostic-cell { min-width: 0; padding: 10px 12px; border-radius: 12px; background: var(--bg-card); border: 1px solid var(--border); display: flex; flex-direction: column; gap: 4px; }
            .social-diagnostic-cell span { color: var(--text-muted); font-size: 0.66rem; font-weight: 750; text-transform: uppercase; letter-spacing: 0; }
            .social-diagnostic-cell strong { color: var(--text-heading); font-size: 0.78rem; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .social-diagnostic-cell.ok strong { color: #10b981; }
            .social-diagnostic-cell.warn strong { color: #d97706; }
            .social-diagnostic-cell.idle strong { color: var(--text-muted); }

            .pc-btn-add-account-v2 { width: 100%; padding: 16px; border: 1px dashed var(--border); background: transparent; border-radius: 14px; color: var(--text-muted); font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; transition: 0.2s; }
            .pc-btn-add-account-v2:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-glow); }

            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; display: block; letter-spacing: 0.5px; }
            .input-hint-v2 { margin: 10px 0 0 0; font-size: 0.7rem; color: var(--text-muted); font-weight: 650; line-height: 1.5; }

            .pc-toggle-card-v2 { background: var(--bg-badge); padding: 20px; border-radius: 20px; border: 1.5px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
            .pc-toggle-card-v2 strong { font-weight: 700; color: var(--text-heading); }
            .pc-toggle-card-v2 span { font-size: 0.75rem; color: var(--text-muted); font-weight: 700; }

            .pc-standby-view-v2 { text-align: center; padding: 44px 24px; background: var(--bg-badge); border: 1px dashed var(--border); border-radius: 16px; }
            .standby-icon-v2 { width: 58px; height: 58px; background: var(--bg-card); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; color: var(--text-muted); }

            .pc-tier-gate-v2 { padding: 48px 24px; background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border); text-align: center; box-shadow: none; }
            .gate-icon-v2 { width: 64px; height: 64px; background: var(--bg-badge); color: var(--primary); border-radius: 18px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }


            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .twitter-bridge-alert {
                margin-top: 12px;
                padding: 12px 16px;
                border-radius: 14px;
                background: rgba(245, 158, 11, 0.04);
                border: 1px solid rgba(245, 158, 11, 0.15);
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .twitter-bridge-alert .alert-header {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #d97706;
                font-size: 0.8rem;
                font-weight: 750;
            }
            .twitter-bridge-alert .alert-icon {
                color: #d97706;
                flex-shrink: 0;
            }
            .twitter-bridge-alert .alert-text {
                margin: 0;
                color: var(--text-dim);
                font-size: 0.75rem;
                font-weight: 600;
                line-height: 1.5;
            }
            .twitter-bridge-alert .alert-footer {
                display: flex;
                align-items: center;
                border-top: 1px dashed rgba(245, 158, 11, 0.15);
                padding-top: 8px;
                margin-top: 4px;
            }
            .twitter-bridge-alert .status-badge-saved {
                font-size: 0.68rem;
                font-weight: 750;
                color: #10b981;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            @media (max-width: 1100px) {
                .socials-layout { grid-template-columns: 1fr !important; }
                .socials-sidebar { position: static; }
                .pc-nav-stack-v2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
                .pc-settings-layout-v2 { grid-template-columns: 1fr; }
            }
            @media (max-width: 720px) {
                .pc-premium-wrapper { padding: 16px; }
                .pc-platform-banner-v2 { align-items: flex-start; flex-wrap: wrap; }
                .pc-platform-banner-v2 > .v-stack:last-child { width: 100%; align-items: flex-start !important; }
                .social-diagnostics-grid { grid-template-columns: 1fr; }
            }
        `}</style>
    </div>
  );
}
