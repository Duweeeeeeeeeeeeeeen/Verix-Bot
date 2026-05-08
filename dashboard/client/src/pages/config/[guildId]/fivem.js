import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import { DiscordSelector, CustomSelect, EmbedMessageManager, NotificationSettings } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, Plus, Trash2, Settings2, Power, RefreshCcw, Server, Activity, Users, 
    MessageSquare, Globe, Cpu, Info, X, Crown, Lock, ChevronRight, BellRing, Palette, 
    Share2, Play, ExternalLink, Map, Zap, Layout, Terminal, Radio, Network, Wifi,
    Link2, MousePointer2, AlertCircle, Sparkles
} from 'lucide-react';
import { mergeConfig } from '../../../utils/defaults';
import Head from 'next/head';

export default function FiveMConfig() {
  const router = useRouter();
  const { t } = useT();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [guildData, setGuildData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('servers');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    if (!guildId || !mounted) return;
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [configRes, discordRes, guildRes] = await Promise.all([
        api.request(`/config/${guildId}/fivem`),
        api.request(`/config/${guildId}/discord-data`),
        api.request(`/config/${guildId}/guild`)
      ]);
      
      const data = configRes?.data || configRes || { servers: [] };
      const merged = mergeConfig(data, 'fivem');
      if (!merged.servers) merged.servers = [];
      setConfig(merged);
      setChannels(discordRes?.data?.channels || discordRes?.channels || []);
      setGuildData(guildRes?.data || guildRes);
    } catch (error) {
      console.error("FiveM config load error:", error);
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [guildId, mounted]);

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
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/fivem`, { method: 'POST', body: JSON.stringify(config) });
      showToast("Network Protocol FiveM aggiornato!");
    } catch (error) {
        showToast("Errore durante la sincronizzazione.", 'error');
    } finally { 
      setSaving(false); 
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const addServer = () => {
    const newServers = [...(config.servers || []), { 
        id: Date.now().toString(), 
        name: 'New Roleplay Instance', 
        serverIp: '', 
        statusChannelId: '',
        enabled: true,
        buttons: []
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
    const newButtons = [...(server.buttons || []), { label: 'Connect Now', url: '', style: 'LINK' }];
    updateServer(serverId, 'buttons', newButtons);
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  const isPremium = guildData?.isPremium || ['premium', 'platinum'].includes(guildData?.premiumTier);

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>FiveM Monitoring | Verix Studio</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #7f1d1d 100%)' }}>
                    <Radio size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>FiveM Network Hub</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? 'NETWORK MONITOR ACTIVE' : 'NETWORK STANDBY'}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <button 
                  className={`pc-status-toggle-v2 ${config.enabled ? 'active' : ''}`}
                  onClick={() => setConfig({...config, enabled: !config.enabled})}
                >
                  <Power size={18} />
                  <span>{config.enabled ? 'Online' : 'Offline'}</span>
                </button>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? 'Sincronizzazione...' : 'Salva Protocollo'}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-container-v2" style={{ marginBottom: '40px' }}>
            <div className="pc-tabs-v2">
                <button className={activeTab === 'servers' ? 'active' : ''} onClick={() => setActiveTab('servers')}>
                    <Server size={16} /> <span>Instance Fleet</span>
                    {config.servers?.length > 0 && <span className="tab-count-v2">{config.servers.length}</span>}
                </button>
                <button className={activeTab === 'design' ? 'active' : ''} onClick={() => setActiveTab('design')}>
                    <Palette size={16} /> <span>Visual Studio</span>
                </button>
            </div>
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'servers' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: '40px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        {config.servers?.length > 0 ? (
                            config.servers.map(server => (
                                <section key={server.id} className="pc-card-v2 animate slide-up" style={{ borderLeft: '10px solid #ef4444' }}>
                                    <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                        <div className="header-icon" style={{ background: '#fef2f2', color: '#ef4444' }}><Wifi size={18} /></div>
                                        <div className="v-stack" style={{ flex: 1 }}>
                                            <input 
                                                className="pc-input-inline-v2" 
                                                style={{ border: 'none', background: 'transparent', fontSize: '1.6rem', fontWeight: 950, color: '#1e293b', fontFamily: 'Outfit', outline: 'none', width: '100%', letterSpacing: '-0.5px' }}
                                                value={server.name} 
                                                onChange={e => updateServer(server.id, 'name', e.target.value)} 
                                                placeholder="Instance Identity..."
                                            />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>ID: {server.id}</span>
                                        </div>
                                        <div className="card-actions-v2" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <label className="pc-toggle-v2">
                                                <input type="checkbox" checked={!!server.enabled} onChange={e => updateServer(server.id, 'enabled', e.target.checked)} />
                                                <span className="pc-slider-v2"></span>
                                            </label>
                                            <button onClick={() => removeServer(server.id)} className="pc-btn-delete-studio-v2" style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}><Trash2 size={20} /></button>
                                        </div>
                                    </div>
                                    <div className="card-body-v2">
                                        <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                            <div className="pc-input-group-v2">
                                                <label>Status Channel (Live)</label>
                                                <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={server.statusChannelId || ''} onChange={val => updateServer(server.id, 'statusChannelId', val)} />
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>Network Endpoint (IP/Domain)</label>
                                                <div className="pc-input-wrapper-v2" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '18px' }}>
                                                    <Globe size={18} style={{ marginLeft: '18px', color: '#94a3b8' }} />
                                                    <input style={{ width: '100%', border: 'none', background: 'transparent', padding: '16px 20px', fontWeight: 900, fontSize: '1.05rem', outline: 'none' }} placeholder="es: play.verix.gg" value={server.serverIp || ''} onChange={e => updateServer(server.id, 'serverIp', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pc-action-studio-v2" style={{ marginTop: '40px', background: '#f8fafc', padding: '32px', borderRadius: '32px', border: '1.5px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                                <div className="v-stack">
                                                    <h4 style={{ margin: 0, fontWeight: 950, fontSize: '1.1rem', color: '#1e293b' }}>Interactive Buttons</h4>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action Deck Studio</span>
                                                </div>
                                                <button className="pc-btn-primary" style={{ padding: '10px 20px', borderRadius: '14px', fontSize: '0.85rem' }} onClick={() => addButton(server.id)}><Plus size={18} /> <span>Add Action</span></button>
                                            </div>
                                            <div className="v-stack" style={{ gap: '16px' }}>
                                                {(server.buttons || []).map((btn, idx) => (
                                                    <div key={idx} className="pc-btn-row-v2 animate slide-up" style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'white', padding: '16px', borderRadius: '18px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                                        <div className="v-stack" style={{ flex: 1, gap: '6px' }}>
                                                            <label style={{ fontSize: '0.65rem', fontWeight: 950, color: '#94a3b8' }}>Label</label>
                                                            <input style={{ width: '100%', border: 'none', background: '#f1f5f9', padding: '10px 14px', borderRadius: '10px', fontWeight: 850, fontSize: '0.9rem', outline: 'none' }} value={btn.label || ''} onChange={e => {
                                                                const newBtns = [...server.buttons];
                                                                newBtns[idx].label = e.target.value;
                                                                updateServer(server.id, 'buttons', newBtns);
                                                            }} placeholder="Connect now..." />
                                                        </div>
                                                        <div className="v-stack" style={{ flex: 2, gap: '6px' }}>
                                                            <label style={{ fontSize: '0.65rem', fontWeight: 950, color: '#94a3b8' }}>Endpoint URL</label>
                                                            <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '10px', padding: '0 12px' }}>
                                                                <Link2 size={14} style={{ color: '#94a3b8' }} />
                                                                <input style={{ width: '100%', border: 'none', background: 'transparent', padding: '10px 12px', fontWeight: 850, fontSize: '0.9rem', outline: 'none' }} value={btn.url || ''} onChange={e => {
                                                                    const newBtns = [...server.buttons];
                                                                    newBtns[idx].url = e.target.value;
                                                                    updateServer(server.id, 'buttons', newBtns);
                                                                }} placeholder="https://..." />
                                                            </div>
                                                        </div>
                                                        <button style={{ background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '12px', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => {
                                                            const newBtns = server.buttons.filter((_, i) => i !== idx);
                                                            updateServer(server.id, 'buttons', newBtns);
                                                        }}><Trash2 size={18} /></button>
                                                    </div>
                                                ))}
                                                {(!server.buttons || server.buttons.length === 0) && (
                                                    <div style={{ textAlign: 'center', padding: '32px', background: 'white', borderRadius: '24px', border: '1.5px dashed #e2e8f0', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 750 }}>
                                                        No active buttons. Users will only see the status.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            ))
                        ) : (
                            <div className="pc-empty-fleet-v2 animate fade-in" style={{ background: 'white', padding: '120px 40px', borderRadius: '48px', textAlign: 'center', boxShadow: 'var(--shadow-premium)', border: '1px solid var(--border-light)' }}>
                                <div style={{ width: '110px', height: '110px', background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', color: '#ef4444', borderRadius: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px', boxShadow: '0 20px 40px rgba(239, 68, 68, 0.15)' }}>
                                    <Network size={56} />
                                </div>
                                <h2 style={{ fontFamily: 'Outfit', fontWeight: 950, fontSize: '2.5rem', color: '#1e293b', marginBottom: '16px', letterSpacing: '-1.5px' }}>Network Deployment</h2>
                                <p style={{ color: '#64748b', fontSize: '1.2rem', marginBottom: '48px', maxWidth: '550px', margin: '0 auto 48px', fontWeight: 650, lineHeight: 1.6 }}>Inizia a monitorare i tuoi server FiveM. Visualizza player online, stato della rete e latenza direttamente su Discord con aggiornamenti real-time.</p>
                                <button className="pc-btn-primary" style={{ margin: '0 auto', padding: '18px 40px', borderRadius: '20px', fontSize: '1.1rem' }} onClick={addServer}><Plus size={24} /> <span>Deploy First Instance</span></button>
                            </div>
                        )}
                    </div>

                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: '#fff7ed', color: '#f97316' }}><Layers size={18} /></div>
                                <h3 style={{ margin: 0 }}>Fleet Management</h3>
                            </div>
                            <div className="card-body-v2">
                                {(!isPremium && config.servers?.length >= 1) ? (
                                    <div className="pc-tier-lock-v2" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '32px', borderRadius: '28px', textAlign: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden' }} onClick={() => router.push(`/config/${guildId}/premium`)}>
                                        <div style={{ position: 'relative', zIndex: 2 }}>
                                            <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.1)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#f59e0b' }}>
                                                <Sparkles size={28} />
                                            </div>
                                            <h4 style={{ margin: '0 0 8px 0', fontWeight: 950, color: 'white', fontSize: '1.1rem' }}>Multi-Server Unlock</h4>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontWeight: 750 }}>Monitora istanze illimitate con il piano Platinum.</p>
                                        </div>
                                        <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', opacity: 0.1 }}>
                                            <Lock size={120} color="white" />
                                        </div>
                                    </div>
                                ) : (
                                    <button className="pc-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '18px', borderRadius: '20px' }} onClick={addServer}>
                                        <Plus size={22} /> <span>Deploy New Instance</span>
                                    </button>
                                )}
                            </div>
                        </section>

                        <div className="pc-log-hub-v2" style={{ background: '#f8fafc', padding: '32px', borderRadius: '32px', border: '1.5px solid #e2e8f0' }}>
                            <NotificationSettings 
                                guildId={guildId}
                                value={config.notifications}
                                onChange={val => setNested('notifications', val)}
                                title="Network Downtime Alerts"
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'design' && (
                <div className="v-stack animate slide-up">
                    <EmbedMessageManager 
                        guildId={guildId}
                        module="fivem"
                        slugs={[
                            { key: 'status_embed', label: 'Network Status (Online)', description: 'Template visualizzato quando il server è raggiungibile.', variables: ['server_name', 'players', 'max_players', 'ip', 'uptime'], group: 'Network UI', groupIcon: Activity },
                            { key: 'offline_embed', label: 'Network Failure (Offline)', description: 'Template visualizzato quando l\'istanza non risponde.', variables: ['server_name', 'ip', 'downtime'], group: 'Network UI', groupIcon: Power }
                        ]}
                    />
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 40px; max-width: 1700px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: white; padding: 32px; border-radius: 32px; box-shadow: var(--shadow-premium); border: 1px solid var(--border-light); }
            .header-info { display: flex; align-items: center; gap: 24px; }
            .pc-icon-box { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 12px 24px rgba(239, 68, 68, 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Outfit', sans-serif; font-size: 2.2rem; font-weight: 950; margin: 0; color: #1e293b; letter-spacing: -1.2px; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 950; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px; }
            .pc-status-tag-v2.on { background: #ecfdf5; color: #10b981; }
            .pc-status-tag-v2.off { background: #fef2f2; color: #ef4444; }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: #f8fafc; color: #64748b; border: 1.5px solid #e2e8f0; padding: 12px 28px; border-radius: 18px; font-weight: 850; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: #fef2f2; color: #ef4444; border-color: #fecaca; }
            
            .pc-btn-primary { background: var(--primary); color: white; border: none; padding: 14px 28px; border-radius: 18px; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(99, 102, 241, 0.3); }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 8px; background: #f1f5f9; padding: 6px; border-radius: 20px; width: fit-content; overflow-x: auto; max-width: 100%; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 10px; padding: 14px 28px; border: none; background: transparent; color: #64748b; font-weight: 850; font-size: 0.95rem; border-radius: 16px; cursor: pointer; transition: 0.2s; white-space: nowrap; position: relative; }
            .pc-tabs-v2 button.active { background: white; color: var(--primary); box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .tab-count-v2 { background: var(--primary); color: white; font-size: 0.65rem; padding: 2px 8px; border-radius: 100px; margin-left: 4px; }

            /* Card V2 */
            .pc-card-v2 { background: white; border: 1px solid var(--border-light); border-radius: 32px; padding: 40px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 20px; margin-bottom: 40px; }
            .header-icon { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 950; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; }

            .pc-toggle-v2 { position: relative; width: 44px; height: 22px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: #cbd5e1; transition: .4s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background: white; transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: var(--primary); }
            input:checked + .pc-slider-v2:before { transform: translateX(22px); }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-btn-row-v2, :global(.light-theme) .pc-action-studio-v2 { background: #ffffff !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
