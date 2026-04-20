import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Skeleton from '../../../components/Skeleton';
import DiscordSelector from '../../../components/DiscordSelector';
import EmbedEditor from '../../../components/EmbedEditor';
import api from '../../../utils/api';
import { 
    Save, Tv, Settings2, Power, Palette, Info, Bell, Plus, Trash2, User, RefreshCcw
} from 'lucide-react';
import GuideSidebar from '../../../components/GuideSidebar';
import EmbedMessageManager from '../../../components/EmbedMessageManager';

export default function TwitchConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  
  // Default structure to prevent crashes
  const defaultConfig = {
    enabled: false,
    notificationChannelId: '',
    streamingRoleId: '',
    mentionEveryone: false,
    streamers: [],
    embed: { 
        title: '🔴 {streamer} è ora in Live!', 
        description: 'Vieni a supportare la live su Twitch!\n\n**Gioco:** {game}\n**Titolo:** {title}', 
        color: '#6441a5', 
        thumbnail: '', 
        image: '', 
        footer: 'Verix Twitch System' 
    }
  };

  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [], members: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const [newStreamer, setNewStreamer] = useState({ twitchUsername: '', discordUserId: '' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
      const fetchData = async () => {
        try {
          const [configRes, discordRes] = await Promise.all([
            api.request(`/config/${guildId}/twitch`),
            api.request(`/config/${guildId}/discord-data`)
          ]);

          // Safety merge with defaults
          if (configRes && configRes.data) {
            const merged = { ...defaultConfig, ...configRes.data };
            // Ensure nested objects also have defaults
            merged.embed = { ...defaultConfig.embed, ...(configRes.data.embed || {}) };
            merged.streamers = configRes.data.streamers || [];
            setConfig(merged);
          } else {
            setConfig(defaultConfig);
          }

          if (discordRes && discordRes.data) {
            setDiscordData(discordRes.data);
          } else if (discordRes) {
            setDiscordData(discordRes);
          }
          setLoading(false);
        } catch (error) {
          console.error("Error loading twitch config:", error);
          setConfig(defaultConfig);
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
    if (saving) return;
    setSaving(true);
    try {
      const res = await api.request(`/config/${guildId}/twitch`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      if (res) {
          showToast('Configurazione salvata con successo!');
      }
    } catch (error) {
        // api.request already shows a toast for result.success === false
        console.error("Save error:", error);
    } finally { setSaving(false); }
  };

  const addStreamer = () => {
    if (!newStreamer.twitchUsername) return showToast('Inserisci un nome utente Twitch', 'error');
    
    // Safety check for streamers array
    const streamers = config.streamers || [];
    
    if (streamers.some(s => s.twitchUsername.toLowerCase() === newStreamer.twitchUsername.toLowerCase())) {
        return showToast('Questo streamer è già in lista', 'error');
    }

    const updatedStreamers = [...streamers, { ...newStreamer }];
    setConfig({ ...config, streamers: updatedStreamers });
    setNewStreamer({ twitchUsername: '', discordUserId: '' });
  };

  const removeStreamer = (index) => {
    const updated = (config.streamers || []).filter((_, i) => i !== index);
    setConfig({ ...config, streamers: updated });
  };

  const updateEmbed = (data) => {
    setConfig({
      ...config,
      embed: { ...config.embed, ...data }
    });
  };

  if (!mounted || loading || !config) return <Layout guildId={guildId}><Skeleton height="500px" /></Layout>;

  return (
    <Layout guildId={guildId}>
      <div className="animate fade-in">
        
        {/* Module Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon twitch-bg">
                <Tv size={24} />
              </div>
              <div className="header-text">
                <h1>Notifiche Twitch</h1>
                <p>Annuncia le live, gestisci i ruoli e mostra anteprime dinamiche.</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
           </div>
        </header>

        {/* Tabs */}
        <div className="tab-navigation">
            <button onClick={() => setActiveTab('settings')} className={`tab-link ${activeTab === 'settings' ? 'active' : ''}`}>
                <Settings2 size={16} />
                <span>Configurazione</span>
            </button>
            <button onClick={() => setActiveTab('personalization')} className={`tab-link ${activeTab === 'personalization' ? 'active' : ''}`}>
                <Palette size={16} />
                <span>Messaggio Live</span>
            </button>
            <button onClick={() => setActiveTab('messages')} className={`tab-link ${activeTab === 'messages' ? 'active' : ''}`}>
                <RefreshCcw size={16} />
                <span>Messaggi</span>
            </button>
        </div>

        {activeTab === 'settings' && (
            <div className="contents-grid">
                <div className="card status-section" style={{ marginBottom: '24px' }}>
                    <div className="section-info">
                        <div className={`status-box ${config.enabled ? 'on' : ''}`}>
                            <Power size={20} />
                        </div>
                        <div>
                            <h3>Stato Modulo</h3>
                            <p className="text-muted">Abilita o disabilita il monitoraggio Twitch per questo server.</p>
                        </div>
                    </div>
                    <label className="toggle">
                        <input type="checkbox" checked={config.enabled} onChange={(e) => setConfig({...config, enabled: e.target.checked})} />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className="config-grid">
                    <div className="col-left">
                        <section className="card content-card" style={{ height: '100%' }}>
                            <div className="card-header-p">
                                <div className="align-center">
                                    <Bell size={18} color="var(--primary)" />
                                    <h3>Notifiche</h3>
                                </div>
                            </div>
                            
                            <div className="field-group">
                                <div className="field-box">
                                    <label className="text-label">Canale Annuncio</label>
                                    <DiscordSelector 
                                        type="channel" 
                                        options={discordData.channels || []} 
                                        value={config.notificationChannelId || ''} 
                                        onChange={v => setConfig({...config, notificationChannelId: v})} 
                                    />
                                </div>

                                <div className="field-box">
                                    <label className="text-label">Ruolo "In Live"</label>
                                    <DiscordSelector 
                                        type="role" 
                                        options={discordData.roles || []} 
                                        value={config.streamingRoleId || ''} 
                                        onChange={v => setConfig({...config, streamingRoleId: v})} 
                                    />
                                    <p className="field-hint" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>Verrà assegnato automaticamente all'utente collegato.</p>
                                </div>

                                <div className="flex-between">
                                    <span>Menziona @everyone</span>
                                    <label className="toggle-sm">
                                        <input type="checkbox" checked={config.mentionEveryone} onChange={e => setConfig({...config, mentionEveryone: e.target.checked})} />
                                        <span className="slider-sm"></span>
                                    </label>
                                </div>
                                
                                <div className="card info-card-p" style={{ marginTop: 'auto' }}>
                                    <Info size={18} color="var(--primary)" />
                                    <p>Assicurati che il ruolo del Bot sia sopra il ruolo "In Live".</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="col-right">
                        <section className="card content-card">
                            <div className="card-header-p">
                                <div className="align-center">
                                    <Tv size={18} color="#a970ff" />
                                    <h3>Lista Streamer</h3>
                                </div>
                            </div>

                            <div className="streamer-add-box">
                                <div className="add-inputs">
                                    <div className="input-with-icon">
                                        <Tv size={14} className="icon" />
                                        <input 
                                            type="text" 
                                            placeholder="User Twitch" 
                                            value={newStreamer.twitchUsername}
                                            onChange={e => setNewStreamer({...newStreamer, twitchUsername: e.target.value})}
                                        />
                                    </div>
                                    <div className="id-selector-mini">
                                        <User size={14} />
                                        <input 
                                            type="text" 
                                            placeholder="Discord ID (Auto-ruolo)" 
                                            value={newStreamer.discordUserId}
                                            onChange={e => setNewStreamer({...newStreamer, discordUserId: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <button className="btn-add" onClick={addStreamer}><Plus size={18} /></button>
                            </div>

                            <div className="streamer-list">
                                {(!config.streamers || config.streamers.length === 0) ? (
                                    <div className="empty-list">Nessuno streamer aggiunto</div>
                                ) : (
                                    config.streamers.map((s, idx) => (
                                        <div key={`streamer-${idx}`} className="streamer-item animate" style={{ animationDelay: `${idx * 0.05}s` }}>
                                            <div className="streamer-info">
                                                <div className="streamer-titles">
                                                    <span className="twitch-name">{s.twitchUsername}</span>
                                                    {s.discordUserId && <span className="discord-id">ID: {s.discordUserId}</span>}
                                                </div>
                                            </div>
                                            <div className="streamer-actions">
                                                <button className="btn-icon-danger" onClick={() => removeStreamer(idx)} title="Rimuovi">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                    <GuideSidebar type="twitch" context={config} />
                </div>
            </div>
        )}

        {activeTab === 'personalization' && (
            <div className="contents-grid animate fade-in">
                <section className="card content-card">
                    <div className="card-header-p mb-24">
                        <div className="align-center">
                            <Palette size={18} color="var(--primary)" />
                            <h3>Editor Embed Notifica</h3>
                        </div>
                    </div>
                    <EmbedEditor 
                        embed={config.embed || defaultConfig.embed} 
                        onChange={updateEmbed}
                        variables={['streamer', 'title', 'game', 'url']}
                    />
                </section>
            </div>
        )}

        {activeTab === 'messages' && (
            <div className="animate fade-in">
                <EmbedMessageManager 
                    guildId={guildId}
                    module="twitch"
                    messages={[
                        { key: 'stream_online', label: 'Notifica Stream Online', description: 'Inviato quando uno streamer registrato va in live.', variables: ['streamer', 'title', 'game', 'url'] }
                    ]}
                />
            </div>
        )}

        <style jsx>{`
            .twitch-bg { background: rgba(169, 112, 255, 0.1) !important; color: #a970ff !important; }
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: rgba(255,255,255,0.02); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: rgba(129, 140, 248, 0.1); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }
            
            .tab-navigation { display: flex; gap: 8px; margin-bottom: 32px; padding: 6px; background: #070912; border-radius: 14px; border: 1px solid var(--border); width: fit-content; }
            .tab-link { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border: none; background: transparent; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; border-radius: 10px; cursor: pointer; transition: 0.2s; }
            .tab-link:hover { color: white; background: rgba(255,255,255,0.03); }
            .tab-link.active { color: white; background: var(--bg-card); box-shadow: var(--shadow-sm); border: 1px solid var(--border); }

            .config-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
            .status-section { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; }
            .section-info { display: flex; align-items: center; gap: 16px; }
            .status-box { width: 40px; height: 40px; background: #1e293b; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); border: 1px solid var(--border); transition: 0.3s; }
            .status-box.on { color: var(--primary); background: rgba(129, 140, 248, 0.1); border-color: rgba(129, 140, 248, 0.2); }

            .field-group { display: flex; flex-direction: column; gap: 20px; padding-top: 20px; }
            .flex-between { display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; font-weight: 500; }

            .streamer-add-box { display: flex; gap: 12px; margin: 20px 0; }
            .add-inputs { flex: 1; display: flex; flex-direction: column; gap: 8px; }
            .input-with-icon, .id-selector-mini { position: relative; display: flex; align-items: center; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; height: 38px; }
            .input-with-icon .icon, .id-selector-mini svg { margin-left: 12px; color: var(--text-dim); }
            .input-with-icon input, .id-selector-mini input { flex: 1; background: transparent; border: none; padding: 0 12px; color: white; font-size: 0.85rem; height: 100%; outline: none; }
            .btn-add { width: 38px; height: 38px; background: #a970ff; color: white; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; align-self: flex-start; transition: 0.2s; }
            .btn-add:hover { background: #9146ff; transform: scale(1.05); }
            
            .streamer-list { display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto; }
            .streamer-item { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 12px 16px; border-radius: 10px; border: 1px solid var(--border); transition: 0.2s; }
            .streamer-item:hover { background: rgba(255,255,255,0.05); border-color: var(--primary-dim); }
            .streamer-titles { display: flex; flex-direction: column; gap: 2px; }
            .twitch-name { font-weight: 600; font-size: 0.9rem; }
            .discord-id { font-size: 0.75rem; color: var(--text-muted); font-family: monospace; }
            .empty-list { text-align: center; color: var(--text-muted); padding: 20px; font-size: 0.85rem; font-style: italic; }

            .btn-icon-danger { width: 32px; height: 32px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
            .btn-icon-danger:hover { background: #ef4444; color: white; }

            .mb-24 { margin-bottom: 24px; }
            .info-card-p { margin-top: 24px; background: rgba(129, 140, 248, 0.05); border: 1px solid rgba(129, 140, 248, 0.1); display: flex; align-items: center; gap: 16px; padding: 16px 24px; font-size: 0.85rem; color: var(--text-muted); border-radius: 12px; }

            @media (max-width: 900px) { .config-grid { grid-template-columns: 1fr; } }
            
            .animate { animation: slideUp 0.4s ease-out forwards; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .fade-in { animation: fadeIn 0.5s ease-out forwards; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
      </div>
    </Layout>
  );
}
