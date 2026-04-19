import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Skeleton from '../../../components/Skeleton';
import DiscordSelector from '../../../components/DiscordSelector';
import EmbedEditor from '../../../components/EmbedEditor';
import api from '../../../utils/api';
import { 
    Save, Globe, RefreshCcw, Power, Terminal, Zap, ShieldAlert, 
    Plus, Trash2, ChevronDown, ChevronUp, MessageSquare, 
    Shield, Palette, Settings2, MousePointer2, ExternalLink, ChevronRight
} from 'lucide-react';
import GuideSidebar from '../../../components/GuideSidebar';
import { v4 as uuidv4 } from 'uuid';

export default function FiveMMultiConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingPanel, setSendingPanel] = useState({});
  const [expandedCards, setExpandedCards] = useState({});
  const [activeSubTabs, setActiveSubTabs] = useState({});

  const [roles, setRoles] = useState([]);
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    if (guildId) {
      Promise.all([
        api.request(`/config/${guildId}/fivem`),
        api.request(`/config/${guildId}/discord-data`)
      ]).then(([data, discordRes]) => {
        let moduleConfig = data.data || data;
        if(!moduleConfig.servers) moduleConfig.servers = [];

        setConfig(moduleConfig);
        setRoles(discordRes?.roles || []);
        setChannels(discordRes?.channels || []);
        setLoading(false);
      }).catch(err => {
        console.error("API Error in FiveM Config:", err);
        setConfig({ servers: [] });
        setLoading(false);
      });
    }
  }, [guildId]);

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
      showToast('Configurazione salvata!');
    } catch (error) {}
    finally { setSaving(false); }
  };

  const handleSendPanel = async (serverId) => {
    setSendingPanel(prev => ({ ...prev, [serverId]: true }));
    try {
        const res = await api.request(`/config/${guildId}/fivem/send-panel`, {
            method: 'POST',
            body: JSON.stringify({ serverId })
        });
        showToast(res.message || 'LiveBoard inviata!');
    } catch (error) {}
    finally { setSendingPanel(prev => ({ ...prev, [serverId]: false })); }
  };

  const handlePing = async (serverIp) => {
      if(!serverIp) return showToast('Inserisci un IP!', 'warning');
      try {
          const res = await api.request(`/config/${guildId}/fivem/ping`, {
              method: 'POST',
              body: JSON.stringify({ serverIp })
          });
          if(res.success) showToast(`Online: ${res.data.name} [${res.data.players}/${res.data.maxPlayers}]`);
          else showToast(res.error || 'Host offline.', 'error');
      } catch (err) { showToast('Errore ping.', 'error'); }
  };

  const addServer = () => {
      const newServer = {
          id: uuidv4(),
          enabled: true,
          serverIp: '',
          statusChannelId: '',
          messageId: null,
          buttons: [{ label: 'Connettiti', url: '', emoji: '🎮', style: 'LINK' }],
          onlineEmbed: { enabled: true, title: '✅ Server Online', description: 'Il server è operativo.\n\n👤 Giocatori: {players}/{maxPlayers}', color: '#2ecc71' },
          offlineEmbed: { enabled: true, title: '🚨 Server Offline', description: 'Il server non è raggiungibile.', color: '#e74c3c' }
      };
      setConfig({...config, servers: [...config.servers, newServer]});
      setExpandedCards({...expandedCards, [newServer.id]: true});
      setActiveSubTabs({...activeSubTabs, [newServer.id]: 'settings'});
  };

  const removeServer = (serverId) => {
      if(!confirm("Eliminare?")) return;
      setConfig({...config, servers: config.servers.filter(s => s.id !== serverId)});
  };

  const updateServer = (serverId, payload) => {
      setConfig({
          ...config, 
          servers: config.servers.map(s => s.id === serverId ? { ...s, ...payload } : s)
      });
  };

  const addButton = (serverId) => {
    const server = config.servers.find(s => s.id === serverId);
    if (server.buttons?.length >= 5) return showToast('Massimo 5 bottoni!', 'warning');
    const newButtons = [...(server.buttons || []), { label: 'Link', url: '', emoji: '🔗', style: 'LINK' }];
    updateServer(serverId, { buttons: newButtons });
  };

  const removeButton = (serverId, index) => {
    const server = config.servers.find(s => s.id === serverId);
    const newButtons = server.buttons.filter((_, i) => i !== index);
    updateServer(serverId, { buttons: newButtons });
  };

  const updateBtnField = (serverId, index, field, value) => {
    const server = config.servers.find(s => s.id === serverId);
    const newButtons = server.buttons.map((b, i) => i === index ? { ...b, [field]: value } : b);
    updateServer(serverId, { buttons: newButtons });
  };

  if (loading || !config) return <Layout guildId={guildId}><Skeleton height="500px" /></Layout>;

  return (
    <Layout guildId={guildId}>
      <div className="animate">
        
        {/* Module Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Globe size={24} />
              </div>
              <div className="header-text">
                <h1>FiveM LiveBoard</h1>
                <p>Monitoraggio in tempo reale e status per i tuoi server di gioco.</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={addServer} className="btn-outline">
                <Plus size={16} /> Aggiungi Server
              </button>
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
           </div>
        </header>

        {/* Global Module Status */}
        <section className="card status-section" style={{ marginBottom: '24px' }}>
            <div className="section-info">
                <div className={`status-box ${config.enabled ? 'on' : ''}`}>
                    <Power size={20} />
                </div>
                <div>
                    <h3>Modulo FiveM</h3>
                    <p className="text-muted">Abilita o disabilita il tracking globale dei server.</p>
                </div>
            </div>
            <label className="toggle">
                <input type="checkbox" checked={config.enabled} onChange={(e) => setConfig({...config, enabled: e.target.checked})} />
                <span className="slider"></span>
            </label>
        </section>

        {/* Servers List */}
        <div className="servers-list">
            {config.servers.map((server, index) => (
                <div key={server.id} className="card server-card">
                    <div className="server-header" onClick={() => setExpandedCards({...expandedCards, [server.id]: !expandedCards[server.id]})}>
                        <div className="server-info-main">
                            <label className="toggle" onClick={e => e.stopPropagation()}>
                                <input type="checkbox" checked={server.enabled} onChange={e => updateServer(server.id, {enabled: e.target.checked})} />
                                <span className="slider"></span>
                            </label>
                            <div className="title-group">
                                <h3>{server.serverIp || `Nuovo Server #${index+1}`}</h3>
                                <span className="id-tag">ID: {server.id.substring(0,8)}</span>
                            </div>
                        </div>
                        <div className="server-actions">
                            <button onClick={e => { e.stopPropagation(); handleSendPanel(server.id); }} className="btn-pill" disabled={sendingPanel[server.id]}>
                                <MessageSquare size={14} /> {sendingPanel[server.id] ? 'Inviando...' : 'LiveBoard'}
                            </button>
                            <button onClick={e => { e.stopPropagation(); handlePing(server.serverIp); }} className="btn-pill secondary"><Zap size={14} /></button>
                            <button onClick={e => { e.stopPropagation(); removeServer(server.id); }} className="btn-del"><Trash2 size={16} /></button>
                            {expandedCards[server.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                    </div>

                    {expandedCards[server.id] && (
                        <div className="server-body animate">
                            <div className="sub-tab-nav">
                                <button onClick={() => setActiveSubTabs({...activeSubTabs, [server.id]: 'settings'})} className={`sub-tab-link ${activeSubTabs[server.id] !== 'design' ? 'active' : ''}`}>Impostazioni</button>
                                <button onClick={() => setActiveSubTabs({...activeSubTabs, [server.id]: 'design'})} className={`sub-tab-link ${activeSubTabs[server.id] === 'design' ? 'active' : ''}`}>Design Embed</button>
                            </div>

                            {activeSubTabs[server.id] !== 'design' ? (
                                <div className="server-grid">
                                    <div className="grid-main-p">
                                        <div className="fields-grid-p">
                                            <div className="field-box">
                                                <label className="text-label">IP & Porta del Server</label>
                                                <input className="input" placeholder="127.0.0.1:30120" value={server.serverIp} onChange={e => updateServer(server.id, {serverIp: e.target.value})} />
                                            </div>
                                            <div className="field-box">
                                                <label className="text-label">Canale Discord LiveBoard</label>
                                                <DiscordSelector type="channel" options={channels} value={server.statusChannelId} onChange={v => updateServer(server.id, {statusChannelId: v})} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid-side-p">
                                        <div className="buttons-config-card">
                                            <h4 className="align-center"><MousePointer2 size={16} /> Bottoni ({server.buttons?.length || 0}/5)</h4>
                                            <div className="buttons-list-p">
                                                {(server.buttons || []).map((btn, bIdx) => (
                                                    <div key={bIdx} className="btn-edit-row">
                                                        <input className="input-s" placeholder="Etichetta" value={btn.label} onChange={e => updateBtnField(server.id, bIdx, 'label', e.target.value)} />
                                                        <input className="input-s" placeholder="URL" value={btn.url} onChange={e => updateBtnField(server.id, bIdx, 'url', e.target.value)} />
                                                        <button onClick={() => removeButton(server.id, bIdx)} className="btn-del-s"><Trash2 size={14} /></button>
                                                    </div>
                                                ))}
                                                <button onClick={() => addButton(server.id)} className="btn-add-dashed"><Plus size={14} /> Aggiungi Bottone</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="design-editor-p">
                                    <div className="editor-top-p">
                                        <div className="pill-toggle">
                                            <button onClick={() => updateServer(server.id, { _tmp_key: 'online' })} className={server._tmp_key !== 'offline' ? 'active' : ''}>ONLINE</button>
                                            <button onClick={() => updateServer(server.id, { _tmp_key: 'offline' })} className={server._tmp_key === 'offline' ? 'active' : ''}>OFFLINE</button>
                                        </div>
                                    </div>
                                    <EmbedEditor 
                                        embed={server._tmp_key === 'offline' ? server.offlineEmbed : server.onlineEmbed}
                                        onChange={d => updateServer(server.id, { [server._tmp_key === 'offline' ? 'offlineEmbed' : 'onlineEmbed']: d })}
                                        variables={['server', 'players', 'maxPlayers', 'guild']}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>

        {/* Global Permissions */}
        <section className="card permissions-section" style={{ marginTop: '32px' }}>
            <div className="align-center" style={{ marginBottom: '16px' }}>
                <Shield size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.1rem' }}>Permessi Gestione Staff</h3>
            </div>
            <div className="field-box">
                <label className="text-label">Ruoli con accesso a questa dashboard</label>
                <DiscordSelector type="role" multiple={true} options={roles} value={config.staffRoleIds || []} onChange={v => setConfig({...config, staffRoleIds: v})} />
            </div>

            <div style={{ marginTop: '32px' }}>
                <GuideSidebar type="fivem" context={config} />
            </div>
        </section>

        <style jsx>{`
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: rgba(255,255,255,0.02); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: rgba(129, 140, 248, 0.1); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }

            .status-section { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; }
            .section-info { display: flex; align-items: center; gap: 16px; }
            .status-box { width: 40px; height: 40px; background: #1e293b; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); border: 1px solid var(--border); transition: 0.3s; }
            .status-box.on { color: var(--primary); background: rgba(129, 140, 248, 0.1); border-color: rgba(129, 140, 248, 0.2); }

            .server-card { padding: 0 !important; margin-bottom: 16px; }
            .server-header { padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: 0.2s; }
            .server-header:hover { background: rgba(255,255,255,0.02); }
            .server-info-main { display: flex; align-items: center; gap: 16px; }
            .title-group h3 { font-size: 1rem; margin-bottom: 0px; }
            .id-tag { font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; }

            .server-actions { display: flex; align-items: center; gap: 12px; color: var(--text-muted); }
            .btn-pill { background: rgba(255,255,255,0.04); border: 1px solid var(--border); color: white; padding: 6px 14px; border-radius: 100px; font-size: 0.8rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
            .btn-pill:hover { background: var(--border-strong); }
            .btn-pill.secondary { color: var(--text-muted); }
            .btn-del { background: transparent; border: none; color: var(--text-dim); cursor: pointer; transition: 0.2s; }
            .btn-del:hover { color: var(--error); }

            .server-body { padding: 0 24px 24px 24px; border-top: 1px solid var(--border); background: rgba(0,0,0,0.1); }
            .sub-tab-nav { display: flex; gap: 8px; padding: 16px 0; border-bottom: 1px dotted var(--border); margin-bottom: 24px; }
            .sub-tab-link { background: transparent; border: none; color: var(--text-dim); font-size: 0.85rem; font-weight: 700; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: 0.2s; }
            .sub-tab-link:hover { color: white; background: rgba(255,255,255,0.03); }
            .sub-tab-link.active { color: var(--primary); background: rgba(129, 140, 248, 0.05); }

            .server-grid { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
            .fields-grid-p { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .buttons-config-card { background: rgba(255,255,255,0.02); padding: 16px; border-radius: 12px; border: 1px solid var(--border); }
            .buttons-list-p { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
            .btn-edit-row { display: flex; gap: 8px; align-items: center; }
            .input-s { flex: 1; min-width: 0; background: #020617; border: 1px solid var(--border); color: white; padding: 6px 10px; border-radius: 6px; font-size: 0.8rem; }
            .btn-del-s { background: transparent; border: none; color: var(--text-dim); cursor: pointer; }
            .btn-del-s:hover { color: var(--error); }
            .btn-add-dashed { width: 100%; padding: 8px; border: 1px dashed var(--border); border-radius: 8px; background: transparent; color: var(--text-dim); cursor: pointer; display: flex; align-items: center; confirm: center; gap: 8px; font-size: 0.8rem; transition: 0.2s; }
            .btn-add-dashed:hover { border-color: var(--primary); color: var(--primary); }

            .editor-top-p { display: flex; justify-content: flex-end; margin-bottom: 20px; }
            .pill-toggle { display: flex; background: rgba(255,255,255,0.04); padding: 4px; border-radius: 10px; border: 1px solid var(--border); }
            .pill-toggle button { border: none; background: transparent; color: var(--text-muted); padding: 6px 14px; border-radius: 7px; font-size: 0.75rem; font-weight: 800; cursor: pointer; }
            .pill-toggle button.active { background: var(--primary); color: white; }

            .align-center { display: flex; align-items: center; gap: 10px; }
        `}</style>
      </div>
    </Layout>
  );
}
