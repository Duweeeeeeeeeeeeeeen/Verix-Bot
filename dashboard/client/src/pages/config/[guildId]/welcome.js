import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Skeleton from '../../../components/Skeleton';
import DiscordSelector from '../../../components/DiscordSelector';
import EmbedEditor from '../../../components/EmbedEditor';
import api from '../../../utils/api';
import { 
    Save, UserPlus, UserMinus, Settings2, RefreshCcw, 
    Power, Palette, Info, Bell, Layout as LayoutIcon, ChevronRight
} from 'lucide-react';
import GuideSidebar from '../../../components/GuideSidebar';

export default function WelcomeConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
   const [activeTab, setActiveTab] = useState('settings');
  const [activeEmbedKey, setActiveEmbedKey] = useState('welcome');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
      const fetchData = async () => {
        try {
          const [configRes, discordRes] = await Promise.all([
            api.request(`/config/${guildId}`),
            api.request(`/config/${guildId}/discord-data`)
          ]);

          if (configRes && configRes.data) {
            setConfig(configRes.data.welcome || configRes.data);
          } else if (configRes && configRes.welcome) {
            setConfig(configRes.welcome);
          }
          if (discordRes && discordRes.data) {
            setDiscordData(discordRes.data);
          } else if (discordRes) {
            setDiscordData(discordRes);
          }
          setLoading(false);
        } catch (error) {
          console.error("Error loading welcome config:", error);
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [guildId, mounted]);

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/welcome`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast('Configurazione salvata!');
    } catch (error) {}
    finally { setSaving(false); }
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

  if (loading || !config) return <Layout guildId={guildId}><Skeleton height="500px" /></Layout>;

  return (
    <Layout guildId={guildId}>
      <div className="animate">
        
        {/* Module Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Bell size={24} />
              </div>
              <div className="header-text">
                <h1>Welcome & Leave</h1>
                <p>Personalizza l'accoglienza automatica dei nuovi membri.</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
           </div>
        </header>

        {/* Minimal Tabs */}
        <div className="tab-navigation">
            <button onClick={() => setActiveTab('settings')} className={`tab-link ${activeTab === 'settings' ? 'active' : ''}`}>
                <Settings2 size={16} />
                <span>Configurazione</span>
            </button>
            <button onClick={() => setActiveTab('personalization')} className={`tab-link ${activeTab === 'personalization' ? 'active' : ''}`}>
                <Palette size={16} />
                <span>Personalizzazione</span>
            </button>
        </div>

        {activeTab === 'settings' && (
            <div className="animate fade-in contents-grid">
                <div className="card status-section">
                    <div className="section-info">
                        <div className={`status-box ${config.enabled ? 'on' : ''}`}>
                            <Power size={20} />
                        </div>
                        <div>
                            <h3>Stato Modulo</h3>
                            <p className="text-muted">Abilita o disabilita il sistema Join/Leave globale.</p>
                        </div>
                    </div>
                    <label className="toggle">
                        <input type="checkbox" checked={!!config.enabled} onChange={(e) => setConfig({...config, enabled: e.target.checked})} />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className="config-columns">
                    <section className="card content-card">
                        <div className="card-header-p">
                            <div className="align-center">
                                <UserPlus size={18} color="var(--primary)" />
                                <h3>Canali Welcome</h3>
                            </div>
                            <label className="toggle">
                                <input type="checkbox" checked={!!config.welcome?.enabled} onChange={e => updateMessageConfig('welcome', 'enabled', e.target.checked)} />
                                <span className="slider"></span>
                            </label>
                        </div>
                        <div className="field-box" style={{ marginTop: '20px' }}>
                            <label className="text-label">Target Channel</label>
                            <DiscordSelector type="channel" options={discordData.channels} value={config.welcome?.channelId || ''} onChange={v => updateMessageConfig('welcome', 'channelId', v)} />
                        </div>
                    </section>

                    <section className="card content-card">
                        <div className="card-header-p">
                            <div className="align-center">
                                <UserMinus size={18} color="var(--error)" />
                                <h3>Canali Leave</h3>
                            </div>
                            <label className="toggle">
                                <input type="checkbox" checked={!!config.leave?.enabled} onChange={e => updateMessageConfig('leave', 'enabled', e.target.checked)} />
                                <span className="slider"></span>
                            </label>
                        </div>
                        <div className="field-box" style={{ marginTop: '20px' }}>
                            <label className="text-label">Target Channel</label>
                            <DiscordSelector type="channel" options={discordData.channels} value={config.leave?.channelId || ''} onChange={v => updateMessageConfig('leave', 'channelId', v)} />
                        </div>
                    </section>
                </div>

                <div className="card info-card-p">
                    <Info size={20} color="var(--primary)" />
                    <p>Puoi usare variabili come <code>{'{user}'}</code>, <code>{'{guild}'}</code>, e <code>{'{member_count}'}</code> nei tuoi embed.</p>
                </div>

                <div style={{ marginTop: '24px' }}>
                    <GuideSidebar type="welcome" context={config} />
                </div>
            </div>
        )}

        {activeTab === 'personalization' && (
            <div className="animate fade-in card editor-container-p">
                <div className="editor-nav-p">
                    <button 
                        onClick={() => setActiveEmbedKey('welcome')} 
                        className={`editor-nav-link ${activeEmbedKey === 'welcome' ? 'active' : ''}`}
                    >
                        <UserPlus size={14} /> Benvenuto
                        <ChevronRight size={14} className="nav-arrow" />
                    </button>
                    <button 
                        onClick={() => setActiveEmbedKey('leave')} 
                        className={`editor-nav-link ${activeEmbedKey === 'leave' ? 'active' : ''}`}
                    >
                        <UserMinus size={14} /> Addio
                        <ChevronRight size={14} className="nav-arrow" />
                    </button>
                </div>
                <div className="editor-main-p">
                    <EmbedEditor 
                        embed={config[activeEmbedKey]?.embed || {}} 
                        onChange={d => updateEmbed(activeEmbedKey, d)}
                        variables={['user', 'user_mention', 'user_tag', 'guild', 'member_count']}
                    />
                </div>
            </div>
        )}

        <style jsx>{`
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: rgba(255,255,255,0.02); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: rgba(129, 140, 248, 0.1); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }
            
            .tab-navigation { display: flex; gap: 8px; margin-bottom: 32px; padding: 6px; background: #070912; border-radius: 14px; border: 1px solid var(--border); width: fit-content; }
            .tab-link { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border: none; background: transparent; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; border-radius: 10px; cursor: pointer; transition: 0.2s; }
            .tab-link:hover { color: white; background: rgba(255,255,255,0.03); }
            .tab-link.active { color: white; background: var(--bg-card); box-shadow: var(--shadow-sm); border: 1px solid var(--border); }

            .status-section { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; margin-bottom: 24px; }
            .section-info { display: flex; align-items: center; gap: 16px; }
            .status-box { width: 40px; height: 40px; background: #1e293b; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); border: 1px solid var(--border); transition: 0.3s; }
            .status-box.on { color: var(--primary); background: rgba(129, 140, 248, 0.1); border-color: rgba(129, 140, 248, 0.2); }
            .section-info h3 { font-size: 1rem; margin-bottom: 2px; }

            .config-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
            .card-header-p { display: flex; justify-content: space-between; align-items: center; }
            .card-header-p h3 { font-size: 1.05rem; }

            .info-card-p { margin-top: 24px; background: rgba(129, 140, 248, 0.05); border: 1px solid rgba(129, 140, 248, 0.1); display: flex; align-items: center; gap: 16px; padding: 16px 24px; font-size: 0.9rem; color: var(--text-muted); }
            .info-card-p code { background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 4px; color: var(--primary); font-family: monospace; }

            .editor-container-p { display: grid; grid-template-columns: 240px 1fr; padding: 0 !important; }
            .editor-nav-p { background: rgba(0,0,0,0.1); padding: 20px; border-right: 1px solid var(--border); display: flex; flex-direction: column; gap: 6px; }
            .editor-nav-link { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: transparent; border: 1px solid transparent; color: var(--text-muted); border-radius: 10px; cursor: pointer; text-align: left; transition: 0.2s; font-size: 0.85rem; font-weight: 600; }
            .editor-nav-link:hover { color: white; background: rgba(255,255,255,0.03); }
            .editor-nav-link.active { color: var(--primary); background: rgba(129, 140, 248, 0.05); border-color: rgba(129, 140, 248, 0.1); }
            .nav-arrow { margin-left: auto; opacity: 0.4; }
            .editor-main-p { padding: 32px; }

            @media (max-width: 900px) { .config-columns { grid-template-columns: 1fr; } .editor-container-p { grid-template-columns: 1fr; } .editor-nav-p { border-right: none; border-bottom: 1px solid var(--border); } }
        `}</style>
      </div>
    </Layout>
  );
}
