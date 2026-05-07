import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import DiscordSelector from '../../../components/DiscordSelector';
import EmbedEditor from '../../../components/EmbedEditor';
import EmbedMessageManager from '../../../components/EmbedMessageManager';
import api from '../../../utils/api';
import { 
    Save, 
    Settings2, 
    Trash2, 
    Plus,
    Tv,
    Youtube,
    Instagram,
    Twitter,
    Share2,
    Hash,
    MessageSquare,
    BellRing,
    Copy,
    Link as LinkIcon,
    Lock
} from 'lucide-react';
import { useT } from '../../../contexts/LanguageContext';

const PLATFORMS = [
    { id: 'twitch', name: 'Twitch', icon: Tv, color: '#6441a5', description: 'socials.platform_twitch_desc' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#ff0000', description: 'socials.platform_youtube_desc' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#e1306c', description: 'socials.platform_instagram_desc' },
    { id: 'tiktok', name: 'TikTok', icon: Share2, color: '#000000', description: 'socials.platform_tiktok_desc' },
    { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: '#1da1f2', description: 'socials.platform_twitter_desc' }
];

export default function SocialsConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [] });
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
      Promise.all([
        api.request(`/config/${guildId}/socials`),
        api.request(`/config/${guildId}/discord-data`),
        api.request(`/config/${guildId}/guild`)
      ]).then(([configRes, discordRes, guildRes]) => {
        let moduleConfig = configRes?.data || configRes || { platforms: {} };
        if (!moduleConfig.platforms) moduleConfig.platforms = {};
        
        PLATFORMS.forEach(p => {
            if (!moduleConfig.platforms[p.id]) {
                moduleConfig.platforms[p.id] = { enabled: false, notificationChannelId: null, roleId: null, mentionEveryone: false, accounts: [], embed: {} };
            }
            if (moduleConfig.platforms[p.id].accounts) {
                moduleConfig.platforms[p.id].accounts = moduleConfig.platforms[p.id].accounts.map(acc => {
                    if (typeof acc === 'string') return { username: acc, discordUserId: null };
                    return { username: acc.username || '', discordUserId: acc.discordUserId || null };
                });
            } else {
                moduleConfig.platforms[p.id].accounts = [];
            }
        });
        
        setConfig(moduleConfig);

        if (discordRes && discordRes.data) {
          setDiscordData(discordRes.data);
        } else if (discordRes) {
          setDiscordData(discordRes);
        }

        if (guildRes) {
          setGuildData(guildRes.data || guildRes);
        }
      }).catch(err => {
        console.error("Failed to load socials config", err);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [guildId, mounted]);

  useEffect(() => {
    if (config) {
      window.dispatchEvent(new CustomEvent('update-guide-context', { detail: config }));
    }
  }, [config]);

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/socials`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast(t('common.save_success'));
    } catch (error) {
      console.error('Error saving config:', error);
      showToast(t('common.save_error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const updatePlatform = (field, value) => {
    const newConfig = { ...config };
    newConfig.platforms[activePlatform][field] = value;
    setConfig(newConfig);
  };

  const addAccount = () => {
    const newConfig = { ...config };
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

  if (loading || !config) return <Skeleton height="600px" />;

  const currentPlatformConfig = config.platforms[activePlatform];

  return (
    <div className="socials-premium-container animate">
        <header className="page-header-premium">
            <div className="header-info">
                <div className="header-icon-glow">
                    <Share2 size={28} />
                </div>
                <div className="header-text">
                    <h1>{t('socials.title')}</h1>
                    <p>{t('socials.desc')}</p>
                </div>
            </div>
            <div className="header-actions">
                <button onClick={handleSave} className="btn-primary-premium" disabled={saving}>
                    <Save size={16} /> {saving ? t('common.saving') : t('common.save')}
                </button>
            </div>
        </header>

        {/* Platform Selector Grid */}
        <div className="platforms-grid-premium">
            {PLATFORMS.map(p => {
                const isPremiumOnly = ['youtube', 'instagram', 'tiktok', 'twitter'].includes(p.id);
                const isActive = activePlatform === p.id;
                const isLocked = isPremiumOnly && !guildData?.isPremium;
                
                return (
                    <button 
                        key={p.id} 
                        onClick={() => setActivePlatform(p.id)}
                        className={`platform-btn ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                        style={{ '--p-color': p.color }}
                    >
                        <div className="p-icon-box">
                            {isLocked ? <Lock size={18} className="lock-icon" /> : <p.icon size={22} />}
                        </div>
                        <span className="p-name">{p.name}</span>
                        {isLocked && <div className="p-pro-badge">PRO</div>}
                        {config.platforms[p.id]?.enabled && <div className="p-status-dot"></div>}
                    </button>
                );
            })}
        </div>

        {/* Platform Specific Content */}
        <div className="platform-detail-glass fade-in" key={activePlatform}>
            <div className="detail-header">
                <div className="header-main-group">
                    <div className="detail-icon-glow" style={{ color: PLATFORMS.find(p => p.id === activePlatform).color, background: `${PLATFORMS.find(p => p.id === activePlatform).color}15` }}>
                        {(() => {
                            const Icon = PLATFORMS.find(p => p.id === activePlatform).icon;
                            return <Icon size={24} />;
                        })()}
                    </div>
                    <div className="detail-text-group">
                        <div className="detail-title-row">
                            <h2>{t('socials.config_for', { platform: PLATFORMS.find(p => p.id === activePlatform).name })}</h2>
                            <label className="premium-toggle">
                                <input type="checkbox" checked={!!currentPlatformConfig.enabled} onChange={e => updatePlatform('enabled', e.target.checked)} />
                                <span className="premium-slider"></span>
                            </label>
                        </div>
                        <p>{t(PLATFORMS.find(p => p.id === activePlatform).description)}</p>
                    </div>
                </div>
            </div>

            {currentPlatformConfig.enabled && (
                <div className="detail-body">
                    <div className="detail-tabs">
                        <button onClick={() => setActiveTab('settings')} className={`detail-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}>
                            <Settings2 size={16} /> <span>{t('socials.tab_settings')}</span>
                        </button>
                        <button onClick={() => setActiveTab('embed')} className={`detail-tab-btn ${activeTab === 'embed' ? 'active' : ''}`}>
                            <MessageSquare size={16} /> <span>{t('socials.tab_embed')}</span>
                        </button>
                    </div>

                    <div className="detail-panel">
                        {activeTab === 'settings' && (
                            <div className="settings-grid-premium">
                                <section className="glass-card-inner">
                                    <div className="card-header-premium">
                                        <div className="card-header-title">
                                            <BellRing size={18} className="header-icon" />
                                            <h3>{t('socials.accounts_title')}</h3>
                                        </div>
                                    </div>
                                    <div className="card-content-premium">
                                        <div className="accounts-stack">
                                            {currentPlatformConfig.accounts.map((acc, i) => (
                                                <div key={i} className="account-item-premium">
                                                    <div className="item-inputs">
                                                        <div className="input-group-premium flex-2">
                                                            <label>{t('socials.account_label')}</label>
                                                            <input 
                                                                className="premium-input" 
                                                                placeholder={t('socials.account_placeholder')} 
                                                                value={acc.username} 
                                                                onChange={e => updateAccount(i, 'username', e.target.value)} 
                                                            />
                                                        </div>
                                                        {activePlatform === 'twitch' && (
                                                            <div className="input-group-premium flex-1">
                                                                <label>{t('socials.discord_user_label')}</label>
                                                                <DiscordSelector 
                                                                    type="role" 
                                                                    placeholder={t('socials.discord_user_placeholder')}
                                                                    options={(discordData.members || []).map(m => ({ id: m.id, name: m.displayName || m.name }))} 
                                                                    value={acc.discordUserId || ''} 
                                                                    onChange={val => updateAccount(i, 'discordUserId', val)} 
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button onClick={() => removeAccount(i)} className="item-remove-btn">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                            
                                            {(!guildData?.isPremium && currentPlatformConfig.accounts.length >= 1) ? (
                                                <button className="btn-add-locked" onClick={() => router.push(`/config/${guildId}/premium`)}>
                                                    <Lock size={16} /> <span>{t('premium.get_premium')} (Max 1)</span>
                                                </button>
                                            ) : (
                                                <button onClick={addAccount} className="btn-add-account">
                                                    <Plus size={16} /> {t('socials.btn_add_account')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                <section className="glass-card-inner">
                                    <div className="card-header-premium">
                                        <div className="card-header-title">
                                            <Hash size={18} className="header-icon" />
                                            <h3>{t('socials.dest_ping_title')}</h3>
                                        </div>
                                    </div>
                                    <div className="card-content-premium">
                                        <div className="fields-vertical-stack">
                                            <div className="input-group-premium">
                                                <label>{t('socials.channel_label')}</label>
                                                <DiscordSelector type="channel" options={discordData.channels} value={currentPlatformConfig.notificationChannelId || ''} onChange={val => updatePlatform('notificationChannelId', val)} />
                                            </div>
                                            <div className="input-group-premium">
                                                <label>{t('socials.role_label')}</label>
                                                <DiscordSelector type="role" options={discordData.roles} value={currentPlatformConfig.roleId || ''} onChange={val => updatePlatform('roleId', val)} />
                                            </div>
                                            {activePlatform === 'twitch' && (
                                                <div className="input-group-premium">
                                                    <label>{t('socials.live_role_label')}</label>
                                                    <DiscordSelector type="role" options={discordData.roles} value={currentPlatformConfig.liveRoleId || ''} onChange={val => updatePlatform('liveRoleId', val)} />
                                                </div>
                                            )}
                                            <div className="premium-upsell-box-mini">
                                                <span>{t('socials.mention_everyone')}</span>
                                                <label className="premium-toggle">
                                                    <input type="checkbox" checked={!!currentPlatformConfig.mentionEveryone} onChange={e => updatePlatform('mentionEveryone', e.target.checked)} />
                                                    <span className="premium-slider"></span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'embed' && (
                            <div className="embed-panel-premium animate fade-in">
                                <div className="panel-header">
                                    <h3>{t('socials.embed_title')}</h3>
                                    <p className="hint-text">Personalizza il messaggio di notifica inviato su Discord</p>
                                </div>
                                <EmbedEditor 
                                    embed={currentPlatformConfig.embed || {}} 
                                    onChange={val => updatePlatform('embed', val)}
                                    variables={['username', 'link', 'title', 'preview_url', 'platform']}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>

        <style jsx>{`
            .btn-primary-premium { background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.3); }
            .btn-primary-premium:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(var(--primary-rgb), 0.4); }
            .btn-primary-premium:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

            .socials-premium-container { padding: 32px; max-width: 1400px; margin: 0 auto; }
            
            /* Modern Header */
            .page-header-premium { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: var(--bg-card-glass); padding: 32px; border-radius: 24px; border: 1px solid var(--border-light); backdrop-filter: blur(12px); }
            .header-info { display: flex; align-items: center; gap: 24px; }
            .header-icon-glow { 
                width: 64px; height: 64px; background: var(--primary-glow); color: var(--primary); 
                border-radius: 18px; display: flex; align-items: center; justify-content: center;
                box-shadow: 0 8px 32px rgba(var(--primary-rgb), 0.2);
            }
            .header-text h1 { font-size: 2rem; font-weight: 900; color: var(--text-main); margin: 0; }
            .header-text p { font-size: 1rem; color: var(--text-muted); margin: 0; }

            /* Platform Selector Grid */
            .platforms-grid-premium { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; margin-bottom: 40px; }
            .platform-btn { position: relative; background: var(--bg-card-glass); border: 1px solid var(--border-light); padding: 24px; border-radius: 24px; display: flex; flex-direction: column; align-items: center; gap: 14px; cursor: pointer; transition: 0.3s; overflow: hidden; }
            .platform-btn:hover { transform: translateY(-4px); background: var(--bg-badge); border-color: var(--p-color); }
            .platform-btn.active { background: rgba(var(--primary-rgb), 0.05); border-color: var(--p-color); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
            .platform-btn.active .p-icon-box { color: var(--p-color); transform: scale(1.1); }
            .p-icon-box { color: var(--text-muted); transition: 0.3s; }
            .p-name { font-size: 0.95rem; font-weight: 800; color: var(--text-main); }
            .p-status-dot { position: absolute; top: 16px; right: 16px; width: 10px; height: 10px; background: var(--success); border-radius: 50%; box-shadow: 0 0 12px var(--success); }
            .p-pro-badge { position: absolute; top: 12px; left: 12px; background: linear-gradient(135deg, #f59e0b, #fbbf24); color: white; font-size: 0.6rem; font-weight: 900; padding: 2px 8px; border-radius: 6px; }

            /* Detail Section */
            .platform-detail-glass { background: var(--bg-card-glass); backdrop-filter: blur(12px); border: 1px solid var(--border-light); border-radius: 32px; overflow: hidden; box-shadow: var(--shadow-premium); }
            .detail-header { padding: 40px; border-bottom: 1px solid var(--border-light); background: rgba(255, 255, 255, 0.01); }
            .header-main-group { display: flex; align-items: center; gap: 24px; }
            .detail-icon-glow { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
            .detail-title-row { display: flex; align-items: center; gap: 20px; margin-bottom: 4px; }
            .detail-title-row h2 { font-size: 1.5rem; font-weight: 850; margin: 0; }
            .detail-text-group p { font-size: 0.95rem; color: var(--text-muted); margin: 0; }

            .detail-tabs { display: flex; background: var(--bg-badge); padding: 6px; gap: 8px; border-bottom: 1px solid var(--border-light); }
            .detail-tab-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; cursor: pointer; border-radius: 12px; transition: 0.3s; }
            .detail-tab-btn:hover { color: var(--text-main); background: rgba(255, 255, 255, 0.03); }
            .detail-tab-btn.active { background: var(--bg-card); color: var(--primary); }

            .detail-panel { padding: 40px; }
            .settings-grid-premium { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
            .glass-card-inner { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-light); border-radius: 24px; }
            .card-header-premium { padding: 24px; border-bottom: 1px solid var(--border-light); }
            .card-header-title { display: flex; align-items: center; gap: 12px; }
            .header-icon { color: var(--primary); }
            .card-header-premium h3 { font-size: 1.1rem; font-weight: 800; margin: 0; }
            .card-content-premium { padding: 24px; }

            /* Accounts */
            .accounts-stack { display: flex; flex-direction: column; gap: 16px; }
            .account-item-premium { display: flex; align-items: center; gap: 12px; background: var(--bg-badge); padding: 16px; border-radius: 18px; border: 1px solid var(--border-light); transition: 0.3s; }
            .account-item-premium:hover { border-color: var(--primary-muted); background: var(--bg-card-glass); }
            .item-inputs { flex: 1; display: flex; gap: 12px; }
            .input-group-premium { display: flex; flex-direction: column; gap: 8px; }
            .input-group-premium label { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
            .premium-input { background: var(--bg-badge); border: 1px solid var(--border-light); padding: 10px 14px; border-radius: 10px; color: var(--text-main); font-weight: 600; width: 100%; }
            .item-remove-btn { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; }
            .item-remove-btn:hover { background: #ef4444; color: white; }
            
            .btn-add-account { background: var(--bg-badge); border: 1px dashed var(--border-light); color: var(--text-muted); padding: 16px; border-radius: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; }
            .btn-add-account:hover { border-color: var(--primary); color: var(--primary); background: rgba(var(--primary-rgb), 0.05); }
            .btn-add-locked { background: rgba(245, 158, 11, 0.05); border: 1px dashed #f59e0b; color: #f59e0b; padding: 16px; border-radius: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }

            .fields-vertical-stack { display: flex; flex-direction: column; gap: 20px; }
            .premium-upsell-box-mini { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-badge); border-radius: 14px; border: 1px solid var(--border-light); font-size: 0.9rem; font-weight: 700; }

            .embed-panel-premium { background: var(--bg-badge); padding: 32px; border-radius: 24px; border: 1px solid var(--border-light); }
            .panel-header { margin-bottom: 24px; }
            .panel-header h3 { font-size: 1.2rem; font-weight: 800; margin-bottom: 4px; }
            .hint-text { font-size: 0.85rem; color: var(--text-muted); }

            /* Premium Toggle UI */
            .premium-toggle { position: relative; display: inline-block; width: 44px; height: 24px; }
            .premium-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--bg-badge); transition: .4s; border-radius: 34px; border: 1px solid var(--border-light); }
            .premium-slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: var(--text-muted); transition: .4s; border-radius: 50%; }
            input:checked + .premium-slider { background-color: var(--primary-glow); border-color: var(--primary-muted); }
            input:checked + .premium-slider:before { transform: translateX(20px); background-color: var(--primary); }

            .flex-1 { flex: 1; }
            .flex-2 { flex: 2; }
            @media (max-width: 1100px) { .settings-grid-premium { grid-template-columns: 1fr; } }
        `}</style>
    </div>
  );
}
