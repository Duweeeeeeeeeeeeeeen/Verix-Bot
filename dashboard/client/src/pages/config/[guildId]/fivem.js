import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import api from '../../../utils/api';
import { Save, Globe, RefreshCcw, Power, Terminal, Zap, ShieldAlert, CheckCircle2, Plus, Trash2, ChevronDown, ChevronUp, MessageSquare, Shield } from 'lucide-react';
import DiscordSelector from '../../../components/DiscordSelector';
import { v4 as uuidv4 } from 'uuid';

export default function FiveMMultiConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingPanel, setSendingPanel] = useState({});
  const [expandedCards, setExpandedCards] = useState({});

  const [roles, setRoles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [globalConfig, setGlobalConfig] = useState(null);

  useEffect(() => {
    if (guildId) {
      Promise.all([
        api.request(`/config/${guildId}/fivem`),
        api.request(`/config/${guildId}/global`),
        api.request(`/config/${guildId}/discord-data`)
      ]).then(([data, globalData, discordRes]) => {
        let moduleConfig = data.data || data;
        if(!moduleConfig.servers) moduleConfig.servers = [];

        const globalConfigData = globalData.data || globalData;

        // Role Inheritance: If local roles are empty, pre-fill from global admin roles
        if ((!moduleConfig.staffRoleIds || moduleConfig.staffRoleIds.length === 0) && globalConfigData.adminRoleIds?.length > 0) {
            moduleConfig.staffRoleIds = [...globalConfigData.adminRoleIds];
        }

        setConfig(moduleConfig);
        setGlobalConfig(globalConfigData);
        setRoles(discordRes?.roles || discordRes?.data?.roles || []);
        setChannels(discordRes?.channels || discordRes?.data?.channels || []);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      showToast('Dashboard FiveM aggiornata e salvata nel Cloud!');
    } catch (error) {
       // handled globally
    } finally {
      setSaving(false);
    }
  };

  const handleSendPanel = async (serverId) => {
    const server = config.servers.find(s => s.id === serverId);
    if (!server.statusChannelId) {
        return showToast('Configura prima un ID Canale per questo server.', 'error');
    }

    setSendingPanel(prev => ({ ...prev, [serverId]: true }));
    try {
        const res = await api.request(`/config/${guildId}/fivem/send-panel`, {
            method: 'POST',
            body: JSON.stringify({ serverId })
        });
        
        if (res.success) {
            showToast(res.message);
            // Non c'è bisogno di ricaricare tutto, il background manager farà il resto
        } else {
            showToast(res.error || 'Errore nell\'invio del pannello.', 'error');
        }
    } catch (error) {
        // handled globally by api.request (connection error toast)
    } finally {
        setSendingPanel(prev => ({ ...prev, [serverId]: false }));
    }
  };

  const handlePing = async (serverIp) => {
      if(!serverIp) return showToast('Inserisci prima un IP Server.', 'warning');
      try {
          const res = await api.request(`/config/${guildId}/fivem/ping`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ serverIp })
          });
          if(res.success) {
              showToast(`Online: ${res.data.name} [${res.data.players}/${res.data.maxPlayers}]`, 'success');
          } else {
             showToast(res.error || 'Host irraggiungibile.', 'error');
          }
      } catch (err) {
         showToast('Timeout network durante test.', 'error');
      }
  };

  const addServer = () => {
      const newServer = {
          id: uuidv4(),
          enabled: true,
          serverIp: '',
          statusChannelId: '',
          messageId: null,
          uptimeStart: null,
          onlineMessage: '',
          offlineMessage: '',
          onlineEmbed: { enabled: true, title: '', description: '', color: '#2ecc71', footer: '' },
          offlineEmbed: { enabled: true, title: '', description: '', color: '#e74c3c', footer: '' }
      };
      setConfig({...config, servers: [...config.servers, newServer]});
      setExpandedCards({...expandedCards, [newServer.id]: true});
  };

  const removeServer = (serverId) => {
      if(!confirm("Sicuro di voler terminare ed eliminare il tracciamento di questo server?")) return;
      setConfig({...config, servers: config.servers.filter(s => s.id !== serverId)});
  };

  const updateServer = (serverId, payload) => {
      setConfig({
          ...config, 
          servers: config.servers.map(s => s.id === serverId ? { ...s, ...payload } : s)
      });
  };

  const toggleExpand = (id) => {
      setExpandedCards(prev => ({...prev, [id]: !prev[id]}));
  };

  if (loading || !config) return (
    <Layout guildId={guildId}>
      <div className="animate">
        <header style={{ marginBottom: '40px' }}>
             <Skeleton width="300px" height="40px" style={{ marginBottom: '12px' }} />
             <Skeleton width="500px" height="20px" />
        </header>
        <div className="card glass" style={{ padding: '60px', textAlign: 'center' }}>
            <div className="spinner-small" style={{ margin: '0 auto 20px', width: '40px', height: '40px' }}></div>
            <p className="text-description">Inizializzazione modulo FiveM...</p>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout guildId={guildId}>
      <div className="animate">
        <div className="card glass-heavy status-card" style={{ marginBottom: '40px' }}>
            <div className="align-center" style={{ gap: '15px' }}>
                <div className={`status-icon ${config.enabled ? 'active' : ''}`} style={{ display: 'flex' }}>
                    <Power size={22} />
                </div>
                <div>
                    <span style={{ fontWeight: '800', fontSize: '1rem', display: 'block' }}>Modulo Attivo</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Abilita o disabilita il sistema FiveM Status pinger.</span>
                </div>
            </div>
            <label className="toggle">
                <input type="checkbox" checked={config.enabled} onChange={(e) => setConfig({...config, enabled: e.target.checked})} />
                <span className="slider"></span>
            </label>
        </div>

        <section className="card glass-heavy" style={{ padding: '30px', marginBottom: '32px' }}>
            <div className="align-center" style={{ marginBottom: '24px' }}>
                <Shield size={24} color="var(--primary)" />
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Configurazione Staff & Permessi</h3>
                <HelpTooltip text="Definisci chi può gestire i server FiveM dalla dashboard e dai comandi." />
            </div>
            <div className="input-group">
                <label className="text-label">Ruoli Staff FiveM</label>
                <DiscordSelector 
                    type="role" 
                    multiple={true} 
                    options={roles} 
                    value={config?.staffRoleIds || []} 
                    onChange={val => setConfig({...config, staffRoleIds: val})} 
                    placeholder="Seleziona ruoli per la gestione FiveM..."
                />
                <p className="text-description" style={{ fontSize: '0.8rem', marginTop: '8px' }}>
                    Se non specificato, verranno ereditati automaticamente i ruoli Amministratori dalle impostazioni globali.
                </p>
            </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div className="align-center" style={{ color: 'var(--primary)', marginBottom: '8px' }}>
                <Globe size={18} fill="currentColor" />
                <span className="text-label" style={{ marginBottom: 0 }}>Gestione Moduli Multi-Istanza</span>
            </div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-1.5px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              Multi-Server <span style={{ fontSize: '0.8rem', background: '#eab308', color: 'white', padding: '4px 12px', borderRadius: '10px', verticalAlign: 'middle', fontWeight: '800', letterSpacing: '1px' }}>LIVEBOARD</span>
            </h1>
            <p className="text-description" style={{ fontSize: '1.1rem' }}>Genera pannelli tracker persistenti per infiniti server contemporaneamente.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={addServer} className="btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                <Plus size={18} /> Aggiungi Server
            </button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={18} className={saving ? 'spin' : ''} /> {saving ? 'Salva Modifiche' : 'Salva Modifiche'}
            </button>
          </div>
        </div>

        {(config?.servers || []).length === 0 && (
            <div className="card glass" style={{ textAlign: 'center', padding: '60px' }}>
                 <Terminal size={64} color="var(--primary)" opacity={0.3} style={{ marginBottom: '20px' }} />
                 <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Nessun Server Rilevato</h2>
                 <p className="text-description">Inizia aggiungendo il tuo primo host FiveM.</p>
                 <button onClick={addServer} className="btn-primary" style={{ marginTop: '20px' }}>Inizializza Primo Server</button>
            </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginBottom: '60px' }}>
            {(config?.servers || []).map((server, index) => {
                const isExpanded = expandedCards[server.id];
                return (
                    <div key={server.id} className="card glass" style={{ padding: '0', overflow: 'hidden' }}>
                        {/* Server Header */}
                        <div style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }} onClick={() => toggleExpand(server.id)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                 <label className="toggle" onClick={(e) => e.stopPropagation()} style={{ padding: '5px' }}>
                                    <input type="checkbox" checked={server.enabled} onChange={(e) => updateServer(server.id, {enabled: e.target.checked})} />
                                    <span className="slider"></span>
                                 </label>
                                 <div>
                                     <h3 style={{ fontSize: '1.3rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                         <Terminal size={20} color={server.enabled ? "var(--primary)" : "var(--text-dim)"} /> 
                                         {server.serverIp || `Node Server #${index + 1}`}
                                     </h3>
                                     <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        UUID: {server.id.substring(0,8)} | LiveBoard Attiva: {server.messageId ? '🟩 SÌ' : '⚠️ NO (Richiede Invio)'}
                                     </span>
                                 </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                 <button 
                                     onClick={(e) => { e.stopPropagation(); handleSendPanel(server.id); }} 
                                     className="btn-outline" 
                                     disabled={sendingPanel[server.id]}
                                     style={{ padding: '8px 15px', fontSize: '0.8rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                                 >
                                     <MessageSquare size={14} className={sendingPanel[server.id] ? 'spin' : ''} /> 
                                     {sendingPanel[server.id] ? 'Invio...' : 'Invia Pannello'}
                                 </button>
                                 <button onClick={(e) => { e.stopPropagation(); handlePing(server.ip || server.serverIp); }} className="btn-secondary" style={{ padding: '8px 15px', fontSize: '0.8rem' }}>
                                     <Zap size={14} /> Test Ping
                                 </button>
                                 <button onClick={(e) => { e.stopPropagation(); removeServer(server.id); }} style={{ background: 'transparent', border: 'none', color: '#e74c3c', padding: '10px', cursor: 'pointer' }}>
                                     <Trash2 size={20} />
                                 </button>
                                 {isExpanded ? <ChevronUp size={24} color="var(--text-dim)"/> : <ChevronDown size={24} color="var(--text-dim)"/>}
                            </div>
                        </div>

                        {/* Extended Payload */}
                        {isExpanded && (
                            <div style={{ padding: '30px', borderTop: '1px solid var(--border)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
                                    <div className="input-group">
                                        <label className="text-label">Indirizzo IP e Server Port (Indispensabile)</label>
                                        <input type="text" className="input" value={server.serverIp} onChange={(e) => updateServer(server.id, {serverIp: e.target.value})} placeholder="Es: 88.0.0.1:30120" />
                                    </div>
                                    <div className="input-group">
                                        <label className="text-label">Canale LiveBoard Discord</label>
                                        <DiscordSelector 
                                            type="channel" 
                                            options={channels.filter(c => c.type === 0 || c.type === 5)} 
                                            value={server.statusChannelId || ''} 
                                            onChange={val => updateServer(server.id, {statusChannelId: val})} 
                                            placeholder="Seleziona canale status..."
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                    {/* ONLINE CONFIG */}
                                    <div style={{ background: 'rgba(0, 255, 127, 0.02)', padding: '20px', borderRadius: '16px', borderTop: '3px solid #2ecc71' }}>
                                         <h4 style={{ color: '#2ecc71', fontWeight: 800, marginBottom: '20px' }}>Dettagli Status ONLINE</h4>
                                         
                                         <div className="input-group" style={{ marginBottom: '15px' }}>
                                             <label className="text-label" style={{ fontSize: '0.8rem' }}>Messaggio Base (Accetta Placeholder)</label>
                                             <textarea className="input" rows="2" value={server.onlineMessage} onChange={(e) => updateServer(server.id, {onlineMessage: e.target.value})} placeholder="Fantastico! Server {server} in gioco. (Sarà appendato con 🟢 L'Uptime automatico)" />
                                         </div>
                                         <div className="input-group">
                                             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <label className="text-label" style={{ fontSize: '0.8rem' }}>Rendering Embed e Background Color</label>
                                                <label className="toggle" style={{ transform: 'scale(0.8)', transformOrigin: 'right' }}><input type="checkbox" checked={server.onlineEmbed.enabled} onChange={e => updateServer(server.id, {onlineEmbed: {...server.onlineEmbed, enabled: e.target.checked}})}/><span className="slider"></span></label>
                                             </div>
                                             {server.onlineEmbed.enabled && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    <input type="text" className="input" style={{ fontSize: '0.85rem' }} value={server.onlineEmbed.title} onChange={(e) => updateServer(server.id, {onlineEmbed: {...server.onlineEmbed, title: e.target.value}})} placeholder="Es: ✅ Server Pinger Operativo" />
                                                    <textarea className="input" rows="2" style={{ fontSize: '0.85rem' }} value={server.onlineEmbed.description} onChange={(e) => updateServer(server.id, {onlineEmbed: {...server.onlineEmbed, description: e.target.value}})} placeholder="Descrizione del tuo bellissimo server RP" />
                                                </div>
                                             )}
                                         </div>
                                    </div>

                                    {/* OFFLINE CONFIG */}
                                    <div style={{ background: 'rgba(231, 76, 60, 0.02)', padding: '20px', borderRadius: '16px', borderTop: '3px solid #e74c3c' }}>
                                         <h4 style={{ color: '#e74c3c', fontWeight: 800, marginBottom: '20px' }}>Dettagli Status OFFLINE</h4>
                                         
                                         <div className="input-group" style={{ marginBottom: '15px' }}>
                                             <label className="text-label" style={{ fontSize: '0.8rem' }}>Messaggio Emergenza (Accetta @Tag)</label>
                                             <textarea className="input" rows="2" value={server.offlineMessage} onChange={(e) => updateServer(server.id, {offlineMessage: e.target.value})} placeholder="@here 🚨 Pinger bloccato, l'host sembra irraggiungibile!" />
                                         </div>
                                         <div className="input-group">
                                             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <label className="text-label" style={{ fontSize: '0.8rem' }}>Rendering Embed d'Emergenza</label>
                                                <label className="toggle" style={{ transform: 'scale(0.8)', transformOrigin: 'right' }}><input type="checkbox" checked={server.offlineEmbed.enabled} onChange={e => updateServer(server.id, {offlineEmbed: {...server.offlineEmbed, enabled: e.target.checked}})}/><span className="slider"></span></label>
                                             </div>
                                             {server.offlineEmbed.enabled && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    <input type="text" className="input" style={{ fontSize: '0.85rem' }} value={server.offlineEmbed.title} onChange={(e) => updateServer(server.id, {offlineEmbed: {...server.offlineEmbed, title: e.target.value}})} placeholder="Es: 🚨 Disconnessione Rete Cloud" />
                                                    <textarea className="input" rows="2" style={{ fontSize: '0.85rem' }} value={server.offlineEmbed.description} onChange={(e) => updateServer(server.id, {offlineEmbed: {...server.offlineEmbed, description: e.target.value}})} placeholder="Avvisa l'utenza di mantenere la calma..." />
                                                </div>
                                             )}
                                         </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>


        <div className="card glass" style={{ marginTop: '0px', background: 'rgba(var(--primary-rgb), 0.05)', display: 'flex', gap: '15px', alignItems: 'flex-start', padding: '24px' }}>
            <ShieldAlert size={28} color="var(--primary)" style={{ flexShrink: 0 }} />
            <div>
                <p style={{ fontWeight: '800', color: 'white' }}>Funzionamento Architettura Multi-Board</p>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p>
                        Il bot cercherà automaticamente di recuperare lo storico. A differenza del tracking base, <b>questo modulo stamperà un solo messaggio per ogni server (Gilda) che verrà aggiornato permanentemente nel tempo</b>. 
                        Mostrerà sempre un pulsante "Join" auto-generato e, per le istanze online, abiliterà il tracking dell'uptime tramite timestamp nativo Discord (<code>&lt;t:TIMESTAMP:R&gt;</code>).
                    </p>
                </div>
            </div>
        </div>

        <style jsx>{`
            .spin { animation: spin 1s linear infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </Layout>
  );
}
