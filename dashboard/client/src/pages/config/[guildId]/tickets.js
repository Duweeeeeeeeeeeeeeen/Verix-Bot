import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import EmbedEditor from '../../../components/EmbedEditor';
import api from '../../../utils/api';
import { 
  Save, 
  Ticket, 
  Clock, 
  Plus, 
  Trash2, 
  RefreshCcw, 
  Power, 
  Settings2, 
  Info, 
  ChevronRight, 
  Bell, 
  Tag, 
  MessageSquare, 
  MousePointer2, 
  Type, 
  Hash, 
  Shield,
  Palette,
  Layers
} from 'lucide-react';
import DiscordSelector from '../../../components/DiscordSelector';

export default function TicketConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [activeTab, setActiveTab] = useState('settings');
  const [activeEmbedKey, setActiveEmbedKey] = useState('panel');
  const [config, setConfig] = useState(null);
  const [globalConfig, setGlobalConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (guildId) {
      Promise.all([
        api.request(`/config/${guildId}/tickets`),
        api.request(`/config/${guildId}/global`),
        api.request(`/config/${guildId}/discord-data`)
      ]).then(([data, globalData, discordRes]) => {
        const moduleConfig = data.data || data;
        const globalConfigData = globalData.data || globalData;
        
        // Role Inheritance: If local roles are empty, pre-fill from global admin roles
        if ((!moduleConfig.staffRoleIds || moduleConfig.staffRoleIds.length === 0) && globalConfigData.adminRoleIds?.length > 0) {
            moduleConfig.staffRoleIds = [...globalConfigData.adminRoleIds];
        }

        setConfig(moduleConfig);
        setGlobalConfig(globalConfigData);
        setChannels(discordRes?.data?.channels || discordRes?.channels || []);
        setRoles(discordRes?.data?.roles || discordRes?.roles || []);
        setLoading(false);
      }).catch(err => {
        console.error("Error loading ticket data:", err);
        setLoading(false);
      });
    }
  }, [guildId]);

  const setGlobalNested = (path, value) => {
    const newGlobal = { ...globalConfig };
    const parts = path.split('.');
    let cur = newGlobal;
    for (let i = 0; i < parts.length - 1; i++) {
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
    setGlobalConfig(newGlobal);
  };

  const updateButton = (index, field, value) => {
    const buttons = [...globalConfig.ui.ticketButtons];
    buttons[index] = { ...buttons[index], [field]: value };
    setGlobalNested('ui.ticketButtons', buttons);
  };

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        api.request(`/config/${guildId}/tickets`, {
          method: 'POST',
          body: JSON.stringify(config)
        }),
        api.request(`/config/${guildId}/global`, {
          method: 'POST',
          body: JSON.stringify(globalConfig)
        })
      ]);
      showToast('Configurazione Ticket salvata con successo!');
    } catch (error) {
       showToast('Errore durante il salvataggio.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Vuoi davvero ripristinare i valori predefiniti per il sistema ticket?')) return;
    try {
        await api.request(`/config/${guildId}/reset/tickets`, { method: 'POST' });
        window.location.reload();
    } catch (error) {}
  };

  const updateEmbed = (key, data) => {
    setConfig({
        ...config,
        embeds: {
            ...(config.embeds || {}),
            [key]: data
        }
    });
  };

  if (loading || !config) return (
    <Layout guildId={guildId}>
      <div className="animate">
        <Skeleton width="400px" height="40px" style={{ marginBottom: '40px' }} />
        <Skeleton height="600px" style={{ borderRadius: '24px' }} />
      </div>
    </Layout>
  );

  const tabs = [
    { id: 'settings', name: 'Impostazioni Generali', icon: Settings2 },
    { id: 'categories', name: 'Categorie & Canali', icon: Layers },
    { id: 'personalization', name: 'Embed & Bottoni', icon: Palette },
  ];

  // Mapping for integrated buttons - Case insensitive search
  const getButtonsForEmbed = (key) => {
    if (!globalConfig?.ui?.ticketButtons) return [];
    if (key === 'open') {
        const keywords = ['claim', 'close', 'reply', 'tag', 'transcript'];
        return keywords.map(kw => 
            globalConfig.ui.ticketButtons.findIndex(b => b.customId.toLowerCase().includes(kw))
        ).filter(idx => idx !== -1);
    }
    return [];
  };

  return (
    <Layout guildId={guildId}>
      <div className="animate">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <div className="align-center" style={{ color: 'var(--primary)', marginBottom: '8px' }}>
                <Ticket size={18} fill="currentColor" />
                <span className="text-label" style={{ marginBottom: 0 }}>Modo Supporto</span>
            </div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-1.5px' }}>Verix Tickets</h1>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleReset} className="btn-danger"><RefreshCcw size={18} /> Reset</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}><Save size={20} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}</button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="tabs-container glass shadow-glow" style={{ padding: '8px', display: 'flex', gap: '8px', marginBottom: '32px', borderRadius: '18px' }}>
            {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}>
                    <tab.icon size={18} />
                    <span>{tab.name}</span>
                </button>
            ))}
        </div>

        <div className="tab-content">
            {activeTab === 'settings' && (
                <div className="settings-grid">
                    <div className="main-settings">
                        {/* Status Card */}
                        <section className="card glass-heavy shadow-glow" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: config.enabled ? '1px solid var(--primary-glow)' : '1px solid var(--border)' }}>
                            <div className="align-center" style={{ gap: '20px' }}>
                                <div style={{ padding: '12px', background: config.enabled ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(255,255,255,0.05)', borderRadius: '14px', color: config.enabled ? 'var(--primary)' : 'var(--text-dim)' }}>
                                    <Power size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Stato del Modulo</h3>
                                    <p className="text-description">{config.enabled ? 'Il sistema ticket è attivo.' : 'Il sistema è inattivo interamente.'}</p>
                                </div>
                            </div>
                            <label className="toggle">
                                <input type="checkbox" checked={config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                                <span className="slider"></span>
                            </label>
                        </section>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <section className="card glass">
                                <h3 className="align-center" style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '800' }}><Type size={20} color="var(--primary)" /> Struttura & Tipo</h3>
                                <div className="input-group" style={{ marginBottom: '20px' }}>
                                    <label className="text-label">Template Nome Ticket</label>
                                    <input className="input" value={globalConfig.naming?.ticket || ''} onChange={e => setGlobalNested('naming.ticket', e.target.value)} placeholder="ticket-{user}" />
                                </div>
                                <div className="input-group">
                                    <label className="text-label">Interazione Pannello</label>
                                    <select className="input select" value={config.inputType || 'BUTTONS'} onChange={e => setConfig({...config, inputType: e.target.value})}>
                                        <option value="BUTTONS">Bottoni</option>
                                        <option value="SELECT">Menu a Discesa</option>
                                    </select>
                                </div>
                            </section>

                            <section className="card glass">
                                <h3 className="align-center" style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '800' }}><Clock size={20} color="var(--primary)" /> Automazioni</h3>
                                <div className="input-group" style={{ marginBottom: '20px' }}>
                                    <label className="text-label">Auto-chiusura (Ore)</label>
                                    <input type="number" className="input" value={config.inactivityTimeout || 24} onChange={e => setConfig({...config, inactivityTimeout: parseInt(e.target.value)})} />
                                </div>
                                <div className="input-group">
                                    <label className="text-label">Trascrizioni HTML</label>
                                    <label className="toggle"><input type="checkbox" checked={config.transcriptionEnabled} onChange={e => setConfig({...config, transcriptionEnabled: e.target.checked})} /><span className="slider"></span></label>
                                </div>
                            </section>
                        </div>
                    </div>

                    <aside className="sidebar-settings">
                        <section className="card glass">
                            <h3 className="align-center" style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '800' }}><Bell size={20} color="var(--primary)" /> Notifiche & Log</h3>
                            {['onOpen', 'onClose'].map(ev => {
                                const notify = globalConfig.notifications[`tickets_${ev}`];
                                return (
                                    <div key={ev} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px' }}>
                                        <p style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px', color: 'white' }}>Evento: {ev === 'onOpen' ? 'Apertura' : 'Chiusura'}</p>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <label className="toggle" style={{ transform: 'scale(0.7)' }}>
                                                <input type="checkbox" checked={notify?.dm} onChange={e => setGlobalNested(`notifications.tickets_${ev}.dm`, e.target.checked)} />
                                                <span className="slider"></span>
                                            </label>
                                            <span style={{ fontSize: '0.75rem' }}>DM</span>
                                            <label className="toggle" style={{ transform: 'scale(0.7)' }}>
                                                <input type="checkbox" checked={globalConfig.logs[`log_${ev}`]} onChange={e => setGlobalNested(`logs.log_${ev}`, e.target.checked)} />
                                                <span className="slider"></span>
                                            </label>
                                            <span style={{ fontSize: '0.75rem' }}>Log</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </section>
                    </aside>
                </div>
            )}

            {activeTab === 'categories' && (
                <div className="categories-container animate fade-in">
                    <section className="card glass" style={{ marginBottom: '24px' }}>
                        <h3 className="align-center" style={{ marginBottom: '24px', fontSize: '1.3rem', fontWeight: '800' }}><Hash size={22} color="var(--primary)" /> Canali Principali</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="input-group"><label className="text-label">Canale Pannello</label><DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.panelChannelId || ''} onChange={val => setConfig({...config, panelChannelId: val})} /></div>
                            <div className="input-group"><label className="text-label">Ruolo Staff Predefinito</label><DiscordSelector type="role" multiple={true} options={roles} value={config.staffRoleIds || []} onChange={val => setConfig({...config, staffRoleIds: val})} /></div>
                            <div className="input-group"><label className="text-label">Categoria Ticket Aperti</label><DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.categoryOpenId || ''} onChange={val => setConfig({...config, categoryOpenId: val})} /></div>
                            <div className="input-group"><label className="text-label">Categoria Archivio</label><DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.categoryClosedId || ''} onChange={val => setConfig({...config, categoryClosedId: val})} /></div>
                        </div>
                    </section>
                    
                    <section className="card glass">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 className="align-center" style={{ fontSize: '1.3rem', fontWeight: '800' }}><Layers size={22} color="var(--primary)" /> Categorie Ticket</h3>
                            <button className="btn-primary" style={{ padding: '8px 16px' }}><Plus size={18} /> Nuova Categoria</button>
                        </div>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {config.typesConfig && Object.entries(config.typesConfig).map(([id, data]) => (
                                <div key={id} className="ticket-type-card glass shadow-glow">
                                    <div className="type-emoji" style={{ background: `${data.color}15`, color: data.color }}>{data.emoji}</div>
                                    <div style={{ flex: 1 }}><p style={{ fontWeight: '800', fontSize: '1.1rem' }}>{id.toUpperCase()}</p><p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Identità: {data.color}</p></div>
                                    <button className="btn-outline" style={{ padding: '10px' }}><Trash2 size={18} color="var(--error)" /></button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'personalization' && (
                <div className="personalization-container animate fade-in">
                    <section className="card glass">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <div>
                                <h3 className="align-center" style={{ fontSize: '1.4rem', fontWeight: '800' }}><Palette size={22} color="var(--primary)" /> Personalizzazione Embed</h3>
                                <p className="text-description">Configura la grafica dei messaggi di supporto.</p>
                            </div>
                            <select className="input select" style={{ width: '250px' }} value={activeEmbedKey} onChange={e => setActiveEmbedKey(e.target.value)}>
                                <option value="panel">Pannello Iniziale</option>
                                <option value="open">Messaggio Apertura (Ticket Creato)</option>
                                <option value="close">Messaggio Chiusura</option>
                            </select>
                        </div>
                        <EmbedEditor 
                            embed={config.embeds?.[activeEmbedKey] || {}} 
                            onChange={(data) => updateEmbed(activeEmbedKey, data)}
                            variables={['user', 'guild', 'ticket_id', 'staff', 'time']}
                        />

                        {/* Integrated Buttons for Tickets */}
                        {getButtonsForEmbed(activeEmbedKey).length > 0 && (
                            <div style={{ marginTop: '30px', padding: '24px', background: 'rgba(0,229,255,0.03)', borderRadius: '20px', border: '1px solid var(--primary-glow)' }}>
                                <h4 className="align-center" style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '800' }}><MousePointer2 size={18} /> Bottoni Operativi</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                                    {getButtonsForEmbed(activeEmbedKey).map(idx => {
                                        const btn = globalConfig.ui.ticketButtons[idx];
                                        return (
                                            <div key={btn.customId} className="btn-config-card glass shadow-glow">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                    <span className="badge" style={{ fontSize: '0.6rem' }}>{btn.customId}</span>
                                                    {['close', 'claim', 'reply', 'tag', 'transcript'].some(k => btn.customId.toLowerCase().includes(k)) ? (
                                                        <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)' }}>Obbligatorio</span>
                                                    ) : (
                                                        <label className="toggle" style={{ transform: 'scale(0.7)' }}><input type="checkbox" checked={btn.enabled} onChange={e => updateButton(idx, 'enabled', e.target.checked)} /><span className="slider"></span></label>
                                                    )}
                                                </div>
                                                <div style={{ display: 'grid', gap: '10px' }}>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <input className="input" style={{ flex: 1 }} value={btn.label} onChange={e => updateButton(idx, 'label', e.target.value)} placeholder="Etichetta" />
                                                        <input 
                                                            className="input" 
                                                            style={{ 
                                                                width: '65px', 
                                                                textAlign: 'center',
                                                                background: 'rgba(255,255,255,0.08)',
                                                                padding: '14px 5px',
                                                                border: '1px solid var(--primary-glow)'
                                                            }} 
                                                            value={btn.emoji} 
                                                            onChange={e => updateButton(idx, 'emoji', e.target.value)} 
                                                            placeholder="🚀"
                                                         />
                                                    </div>
                                                    <select className="input select" style={{ fontSize: '0.8rem', padding: '10px' }} value={btn.style} onChange={e => updateButton(idx, 'style', e.target.value)}>
                                                        <option value="PRIMARY">Blu (Primario)</option>
                                                        <option value="SUCCESS">Verde (Successo)</option>
                                                        <option value="DANGER">Rosso (Pericolo)</option>
                                                        <option value="SECONDARY">Grigio (Secondario)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>

        <style jsx>{`
            .tab-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; border: none; background: transparent; color: var(--text-dim); font-weight: 700; cursor: pointer; border-radius: 14px; transition: 0.3s; }
            .tab-btn:hover { color: white; background: rgba(255,255,255,0.03); }
            .tab-btn.active { background: var(--primary); color: white; box-shadow: 0 4px 15px var(--primary-glow); }
            .settings-grid { display: grid; grid-template-columns: 1fr 300px; gap: 30px; }
            .btn-config-card { background: rgba(0,0,0,0.3); border: 1px solid var(--border); padding: 16px; border-radius: 14px; }
            .badge { background: rgba(var(--primary-rgb), 0.1); color: var(--primary); padding: 4px 8px; border-radius: 6px; }
            .ticket-type-card { display: flex; align-items: center; gap: 15px; background: rgba(255,255,255,0.02); padding: 15px; border-radius: 12px; border: 1px solid var(--border); }
            .type-emoji { width: 45px; height: 45px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
            .shadow-glow { box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.1); }
            @media (max-width: 1000px) { .settings-grid { grid-template-columns: 1fr; } }
        `}</style>
      </div>
    </Layout>
  );
}
