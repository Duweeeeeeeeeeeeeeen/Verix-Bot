import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import DiscordSelector from '../../../components/DiscordSelector';
import api from '../../../utils/api';
import { 
    Save, Plus, Trash2, Settings2, Power, 
    RefreshCcw, Server, Activity, Users, 
    MessageSquare, Globe, Cpu, Info, X
} from 'lucide-react';
import EmbedMessageManager from '../../../components/EmbedMessageManager';
import { mergeConfig } from '../../../utils/defaults';
import NotificationSettings from '../../../components/NotificationSettings';

export default function FiveMConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('servers');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
      const fetchData = async () => {
        try {
          const [configRes, discordRes] = await Promise.all([
            api.request(`/config/${guildId}/fivem`),
            api.request(`/config/${guildId}/discord-data`)
          ]);
          if (configRes) {
              const data = configRes.data || configRes;
              setConfig(mergeConfig(data, 'fivem'));
          }
          if (discordRes) setChannels(discordRes.channels || []);
          setLoading(false);
        } catch (error) {
          console.error("Error loading FiveM config:", error);
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [guildId, mounted]);

  useEffect(() => {
    if (config) {
      window.dispatchEvent(new CustomEvent('update-guide-context', { detail: config }));
    }
  }, [config]);

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

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/fivem`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast('Configurazione FiveM salvata!');
    } catch (error) {
        showToast('Errore durante il salvataggio', 'error');
    } finally { setSaving(false); }
  };

  const addServer = () => {
    const newServers = [...(config.servers || []), { 
        id: Date.now().toString(), 
        name: 'Nuovo Server', 
        serverIp: '', 
        statusChannelId: '',
        enabled: true 
    }];
    setConfig({ ...config, servers: newServers });
  };

  const removeServer = (id) => {
    setConfig({ ...config, servers: config.servers.filter(s => s.id !== id) });
  };

  const updateServer = (id, field, value) => {
    const newServers = config.servers.map(s => s.id === id ? { ...s, [field]: value } : s);
    setConfig({ ...config, servers: newServers });
  };

  const addButton = (serverId) => {
    const server = config.servers.find(s => s.id === serverId);
    const newButtons = [...(server.buttons || []), { label: 'Connettiti', url: '', style: 'LINK' }];
    updateServer(serverId, 'buttons', newButtons);
  };

  if (loading || !config) return <><Skeleton height="500px" /></>;

  return (
    <div className="config-page-layout animate">
      <div className="config-main-col">
        {/* Module Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Activity size={24} />
              </div>
              <div className="header-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h1>Integrazione FiveM</h1>
                  <label className="toggle-mini" title={config.enabled ? 'Modulo Attivo' : 'Modulo Disattivato'}>
                    <input type="checkbox" checked={!!config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                    <span className="slider-mini"></span>
                  </label>
                </div>
                <p>Monitora lo stato dei tuoi server e fornisci link rapidi ai cittadini.</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
           </div>
        </header>



        {/* Tab Navigation */}
        <div className="tab-navigation">
            <button onClick={() => setActiveTab('servers')} className={`tab-link ${activeTab === 'servers' ? 'active' : ''}`}>
                <Server size={16} /> <span>Server Monitorati</span>
            </button>
            <button onClick={() => setActiveTab('messages')} className={`tab-link ${activeTab === 'messages' ? 'active' : ''}`}>
                <MessageSquare size={16} /> <span>Design & Messaggi</span>
            </button>
        </div>

        {activeTab === 'servers' && (
            <div className="animate fade-in">
                <div className="section-header-row">
                    <h2>Lista Server</h2>
                    <button onClick={addServer} className="btn-add-premium"><Plus size={16} /> Aggiungi Server</button>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <NotificationSettings 
                        guildId={guildId}
                        value={config.notifications}
                        onChange={val => setNested('notifications', val)}
                        title="Notifiche Status"
                        description="Scegli come notificare lo staff quando un server cambia stato (Online/Offline)."
                    />
                </div>

                <div className="servers-list">
            {config.servers?.map(server => (
                <div key={server.id} className="server-card card animate fade-in">
                    <div className="server-card-header">
                        <div className="align-center">
                            <Server size={18} color="var(--primary)" />
                            <input className="input-minimal" value={server.name} onChange={e => updateServer(server.id, 'name', e.target.value)} placeholder="Nome Server..." />
                        </div>
                        <div className="align-center">
                             <label className="toggle-s">
                                <input type="checkbox" checked={!!server.enabled} onChange={e => updateServer(server.id, 'enabled', e.target.checked)} />
                                <span className="slider-s"></span>
                            </label>
                            <button className="btn-remove-premium" onClick={() => removeServer(server.id)}><X size={14} /></button>
                        </div>
                    </div>

                    <div className="server-card-body">
                        <div className="fields-grid-v">
                            <div className="field-box" style={{ gridColumn: 'span 2' }}>
                                <label className="text-label">Canale Live Status</label>
                                <DiscordSelector 
                                    type="channel" 
                                    options={channels.filter(c => c.type === 0 || c.type === 5)} 
                                    value={server.statusChannelId || ''} 
                                    onChange={val => updateServer(server.id, 'statusChannelId', val)} 
                                    placeholder="Seleziona il canale dove inviare il monitoraggio live..."
                                />
                                <p className="field-help">Il bot invierà un messaggio in questo canale e lo aggiornerà ogni minuto con i dati live.</p>
                            </div>
                            <div className="field-box" style={{ gridColumn: 'span 2' }}>
                                <label className="text-label">Indirizzo IP / Domain (con porta se non 30120)</label>
                                <div className="input-wrapper">
                                    <Globe size={16} className="input-icon" />
                                    <input className="input-v" value={server.serverIp || ''} onChange={e => updateServer(server.id, 'serverIp', e.target.value)} placeholder="Es: 127.0.0.1:30120 o cfx.re/join/xxxx" />
                                </div>
                            </div>
                        </div>

                        <div className="buttons-section" style={{ marginTop: '24px' }}>
                             <div className="section-header-row">
                                <h4 className="text-label">Bottoni di Collegamento</h4>
                                <button onClick={() => addButton(server.id)} className="btn-add-mini"><Plus size={12} /> Aggiungi</button>
                             </div>
                             <div className="buttons-grid">
                                {server.buttons?.map((btn, idx) => (
                                    <div key={idx} className="button-editor-row">
                                        <input className="input-s" value={btn.label || ''} onChange={e => {
                                            const newBtns = [...server.buttons];
                                            newBtns[idx].label = e.target.value;
                                            updateServer(server.id, 'buttons', newBtns);
                                        }} placeholder="Etichetta" />
                                        <input className="input-s" value={btn.url || ''} onChange={e => {
                                            const newBtns = [...server.buttons];
                                            newBtns[idx].url = e.target.value;
                                            updateServer(server.id, 'buttons', newBtns);
                                        }} placeholder="fivem://connect/..." />
                                        <button className="btn-remove-premium" onClick={() => {
                                            const newBtns = server.buttons.filter((_, i) => i !== idx);
                                            updateServer(server.id, 'buttons', newBtns);
                                        }}><X size={12} /></button>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        </div>
        )}

        {activeTab === 'messages' && (
            <div className="animate fade-in card glass-dark" style={{ padding: '32px' }}>
                <EmbedMessageManager 
                    guildId={guildId}
                    module="fivem"
                    slugs={[
                        { key: 'status_embed', label: 'Stato Server (Online)', description: 'Embed inviato quando il server è online.', variables: ['serverName', 'players', 'maxPlayers'], group: '🟢 Status', groupIcon: Activity },
                        { key: 'offline_embed', label: 'Stato Server (Offline)', description: 'Embed inviato quando il server non è raggiungibile.', variables: ['serverName'], group: '🔴 Offline', groupIcon: Power }
                    ]}
                />
            </div>
        )}
      </div>

      <style jsx>{`
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-badge); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: var(--primary-glow); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; color: var(--text-main); }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }

            .status-section { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; margin-bottom: 32px; }
            .section-info { display: flex; align-items: center; gap: 16px; }
            .status-box { width: 40px; height: 40px; background: var(--bg-status-box); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); border: 1px solid var(--border); transition: 0.3s; }
            .status-box.on { color: var(--primary); background: rgba(129, 140, 248, 0.1); border-color: rgba(129, 140, 248, 0.2); }

            .tab-navigation { display: flex; gap: 8px; margin-bottom: 32px; padding: 6px; background: var(--bg-sidebar-alt); border-radius: 14px; border: 1px solid var(--border); width: fit-content; }
            .tab-link { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border: none; background: transparent; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; border-radius: 10px; cursor: pointer; transition: 0.2s; }
            .tab-link:hover { color: var(--text-main); background: var(--bg-badge); }
            .tab-link.active { color: var(--text-main); background: var(--bg-card); box-shadow: var(--shadow-sm); border: 1px solid var(--border); }

            .section-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .btn-add-premium { background: var(--primary); color: var(--text-main); border: none; padding: 10px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: var(--primary-glow); }
            
            .server-card { padding: 0 !important; margin-bottom: 24px; }
            .server-card-header { padding: 16px 20px; background: var(--bg-badge); border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
            .server-card-body { padding: 24px; }

            .glass-dark { background: var(--bg-badge); border: 1px solid var(--border); border-radius: 24px; }

            .input-minimal { background: transparent; border: none; color: var(--text-main); font-weight: 700; font-size: 1rem; outline: none; width: 250px; }
            .fields-grid-v { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            
            .input-wrapper { position: relative; display: flex; align-items: center; }
            .input-icon { position: absolute; left: 14px; color: var(--text-muted); }
            .input-v { background: var(--bg-dark); border: 1px solid var(--border); color: var(--text-main); padding: 12px 16px 12px 42px; border-radius: 12px; width: 100%; }
            
            .button-editor-row { display: grid; grid-template-columns: 1fr 2fr 40px; gap: 12px; margin-bottom: 10px; }
            .input-s { background: var(--bg-badge); border: 1px solid var(--border); color: var(--text-main); padding: 8px 12px; border-radius: 8px; font-size: 0.85rem; }
            
            .btn-add-mini { background: var(--bg-badge); color: var(--text-main); border: 1px solid var(--border); padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; cursor: pointer; }
            
            .toggle-s { position: relative; width: 36px; height: 20px; }
            .toggle-s input { opacity: 0; width: 0; height: 0; }
            .slider-s { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--bg-badge); transition: 0.3s; border-radius: 20px; border: 1px solid var(--border); }
            .slider-s:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: var(--text-main); transition: 0.3s; border-radius: 50%; }
            input:checked + .slider-s { background-color: var(--primary); }
            input:checked + .slider-s:before { transform: translateX(16px); }

            .align-center { display: flex; align-items: center; gap: 12px; }
        `}</style>
    </div>
  );
}
