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
    Link as LinkIcon
} from 'lucide-react';

const PLATFORMS = [
    { id: 'twitch', name: 'Twitch', icon: Tv, color: '#6441a5', description: 'Notifiche in tempo reale quando uno streamer va in live.' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#ff0000', description: 'Notifiche automatiche per la pubblicazione di nuovi video.' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#e1306c', description: 'Inoltra i nuovi post o reel direttamente su Discord.' },
    { id: 'tiktok', name: 'TikTok', icon: Share2, color: '#000000', description: 'Annuncia i nuovi TikTok nel server.' },
    { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: '#1da1f2', description: 'Invia i nuovi tweet in tempo reale.' }
];

export default function SocialsConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [activePlatform, setActivePlatform] = useState('twitch');
  const [activeTab, setActiveTab] = useState('settings'); 

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
      Promise.all([
        api.request(`/config/${guildId}/socials`),
        api.request(`/config/${guildId}/discord-data`)
      ]).then(([configRes, discordRes]) => {
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
      showToast('Configurazione salvata con successo!');
    } catch (error) {
      console.error('Error saving config:', error);
      showToast('Errore durante il salvataggio', 'error');
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
    <div className="config-page-layout animate">
      <div className="config-main-col">
        {/* Module Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Share2 size={24} />
              </div>
              <div className="header-text">
                <h1>Social Notifications</h1>
                <p>Annuncia automaticamente nuovi contenuti dai tuoi social preferiti.</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
           </div>
        </header>

        {/* Platform Selector */}
        <div className="platform-grid-s">
            {PLATFORMS.map(p => (
                <button 
                    key={p.id} 
                    onClick={() => setActivePlatform(p.id)}
                    className={`platform-card-s ${activePlatform === p.id ? 'active' : ''}`}
                    style={{ '--platform-color': p.color }}
                >
                    <div className="p-icon-s"><p.icon size={20} /></div>
                    <span>{p.name}</span>
                    {config.platforms[p.id]?.enabled && <div className="p-active-dot"></div>}
                </button>
            ))}
        </div>

        {/* Platform Content */}
        <div className="platform-content-s animate fade-in" key={activePlatform}>
            <div className="content-header-s">
                <div className="align-center">
                    <div className="p-hero-icon" style={{ backgroundColor: `${PLATFORMS.find(p => p.id === activePlatform).color}20`, color: PLATFORMS.find(p => p.id === activePlatform).color }}>
                        {(() => {
                            const Icon = PLATFORMS.find(p => p.id === activePlatform).icon;
                            return <Icon size={24} />;
                        })()}
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h2>Configurazione {PLATFORMS.find(p => p.id === activePlatform).name}</h2>
                            <label className="toggle-mini">
                                <input type="checkbox" checked={!!currentPlatformConfig.enabled} onChange={e => updatePlatform('enabled', e.target.checked)} />
                                <span className="slider-mini"></span>
                            </label>
                        </div>
                        <p className="text-muted">{PLATFORMS.find(p => p.id === activePlatform).description}</p>
                    </div>
                </div>
            </div>

            {currentPlatformConfig.enabled && (
                <div className="platform-tabs-s">
                    <div className="tab-nav-s">
                        <button onClick={() => setActiveTab('settings')} className={`tab-btn-s ${activeTab === 'settings' ? 'active' : ''}`}>Impostazioni</button>
                        <button onClick={() => setActiveTab('embed')} className={`tab-btn-s ${activeTab === 'embed' ? 'active' : ''}`}>Messaggio Personalizzato</button>
                    </div>

                    <div className="tab-body-s">
                        {activeTab === 'settings' && (
                            <div className="settings-grid-s animate fade-in">
                                <section className="card section-card-s">
                                    <div className="align-center"><LinkIcon size={18} color="var(--primary)" /> <h3>Account da Monitorare</h3></div>
                                    <div className="accounts-list-s">
                                        {currentPlatformConfig.accounts.map((acc, i) => (
                                            <div key={i} className="account-row-premium animate fade-in">
                                                <div className="acc-main-inputs">
                                                    <div className="field-box flex-2">
                                                        <label className="text-label-small">Twitch/YouTube Link o Username</label>
                                                        <input 
                                                            className="input" 
                                                            placeholder="Username o Link..." 
                                                            value={acc.username} 
                                                            onChange={e => updateAccount(i, 'username', e.target.value)} 
                                                        />
                                                    </div>
                                                    {activePlatform === 'twitch' && (
                                                        <div className="field-box flex-1">
                                                            <label className="text-label-small">Utente Discord (per Ruolo Live)</label>
                                                            <DiscordSelector 
                                                                type="role" // Using role style for users too, but with user icon if possible
                                                                placeholder="Collega Utente..."
                                                                options={(discordData.members || []).map(m => ({ id: m.id, name: m.displayName || m.name }))} 
                                                                value={acc.discordUserId || ''} 
                                                                onChange={val => updateAccount(i, 'discordUserId', val)} 
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <button onClick={() => removeAccount(i)} className="btn-remove-s" title="Rimuovi account">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button onClick={addAccount} className="btn-add-s"><Plus size={16} /> Aggiungi Account</button>
                                    </div>
                                </section>

                                <section className="card section-card-s">
                                    <div className="align-center"><BellRing size={18} color="var(--primary)" /> <h3>Destinazione e Ping</h3></div>
                                    <div className="fields-stack-s">
                                        <div className="field-box">
                                            <label className="text-label">Canale Notifica</label>
                                            <DiscordSelector type="channel" options={discordData.channels} value={currentPlatformConfig.notificationChannelId || ''} onChange={val => updatePlatform('notificationChannelId', val)} />
                                        </div>
                                        <div className="field-box">
                                            <label className="text-label">Ruolo da Menzionare</label>
                                            <DiscordSelector type="role" options={discordData.roles} value={currentPlatformConfig.roleId || ''} onChange={val => updatePlatform('roleId', val)} />
                                        </div>
                                        <div className="status-row-s">
                                            <span>Menziona @everyone</span>
                                            <label className="toggle-s">
                                                <input type="checkbox" checked={!!currentPlatformConfig.mentionEveryone} onChange={e => updatePlatform('mentionEveryone', e.target.checked)} />
                                                <span className="slider-s"></span>
                                            </label>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'embed' && (
                            <div className="embed-tab-s animate fade-in card glass-dark" style={{ padding: '32px' }}>
                                <h3>Design Annuncio Live</h3>
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
      </div>

      <style jsx>{`
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-badge); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: var(--primary-glow); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; color: var(--text-main); }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }
            
            .platform-grid-s { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; margin-bottom: 32px; }
            .platform-card-s { position: relative; background: var(--bg-card); border: 1px solid var(--border); padding: 20px; border-radius: 18px; display: flex; flex-direction: column; align-items: center; gap: 12px; cursor: pointer; transition: 0.3s; border-bottom: 3px solid var(--border); }
            .platform-card-s:hover { transform: translateY(-4px); background: var(--bg-badge); }
            .platform-card-s.active { border-color: var(--platform-color); border-bottom-color: var(--platform-color); background: var(--bg-badge); }
            .platform-card-s.active .p-icon-s { color: var(--platform-color); transform: scale(1.1); }
            .p-icon-s { color: var(--text-muted); transition: 0.3s; }
            .platform-card-s span { font-size: 0.85rem; font-weight: 800; }
            .p-active-dot { position: absolute; top: 12px; right: 12px; width: 8px; height: 8px; background: var(--success); border-radius: 50%; box-shadow: 0 0 10px var(--success); }

            .platform-content { background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; overflow: hidden; }
            .content-header-s { padding: 32px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: var(--bg-badge); }
            .p-hero-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
            .content-header-s h2 { font-size: 1.25rem; font-weight: 850; color: var(--text-main); }

            .platform-tabs-s { padding: 0; }
            .tab-nav-s { display: flex; background: var(--bg-sidebar-alt); padding: 0 32px; border-bottom: 1px solid var(--border); gap: 32px; }
            .tab-btn-s { background: transparent; border: none; padding: 20px 0; color: var(--text-muted); font-size: 0.85rem; font-weight: 700; cursor: pointer; position: relative; }
            .tab-btn-s.active { color: var(--text-main); }
            .tab-btn-s.active:after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: var(--primary); }

            .tab-body-s { padding: 32px; }
            .settings-grid-s { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
            
            .accounts-list-s { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
            .account-row-premium { display: flex; align-items: flex-end; gap: 12px; background: var(--bg-card); border: 1px solid var(--border); padding: 16px; border-radius: 16px; transition: 0.3s; }
            .account-row-premium:hover { border-color: var(--primary); background: var(--bg-badge); }
            .acc-main-inputs { flex: 1; display: flex; gap: 12px; }
            .flex-1 { flex: 1; }
            .flex-2 { flex: 2; }
            .text-label-small { font-size: 0.7rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase; margin-bottom: 6px; display: block; }
            .btn-remove-s { background: var(--error-glow); border: 1px solid var(--error); color: var(--error); width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
            .btn-remove-s:hover { background: var(--error); color: white; }
            .btn-add-s { margin-top: 8px; background: var(--bg-sidebar-alt); border: 1px dashed var(--border); color: var(--text-muted); padding: 14px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 700; font-size: 0.85rem; width: 100%; transition: 0.2s; }
            .btn-add-s:hover { border-color: var(--primary); color: var(--primary); background: var(--bg-badge); }

            .fields-stack-s { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
            .status-row-s { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: var(--bg-badge); border-radius: 10px; border: 1px solid var(--border); font-size: 0.85rem; font-weight: 700; }

            .toggle-s { position: relative; width: 36px; height: 20px; }
            .toggle-s input { opacity: 0; width: 0; height: 0; }
            .slider-s { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--bg-badge); transition: 0.3s; border-radius: 20px; border: 1px solid var(--border); }
            .slider-s:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: var(--text-main); transition: 0.3s; border-radius: 50%; }
            input:checked + .slider-s { background-color: var(--primary); }
            input:checked + .slider-s:before { transform: translateX(16px); }

            .align-center { display: flex; align-items: center; gap: 12px; }
            .glass-dark { background: var(--bg-badge); border: 1px solid var(--border); border-radius: 24px; }
            @media (max-width: 1100px) { .settings-grid-s { grid-template-columns: 1fr; } }
        `}</style>
    </div>
  );
}
