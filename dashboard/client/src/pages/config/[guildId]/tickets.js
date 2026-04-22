import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import EmbedEditor from '../../../components/EmbedEditor';
import EmbedMessageManager from '../../../components/EmbedMessageManager';
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
import GuideSidebar from '../../../components/GuideSidebar';
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
  const [sendingPanel, setSendingPanel] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSendPanel = async () => {
    if (!config.panelChannelId) {
      showToast('Configura prima un Canale Pannello!', 'error');
      return;
    }
    setSendingPanel(true);
    try {
      const res = await api.request(`/config/${guildId}/tickets/send-panel`, { method: 'POST' });
      showToast(res.message || 'Pannello inviato con successo!');
    } catch (error) {
       console.error("Error sending ticket panel:", error);
       showToast('Errore durante l\'invio del pannello.', 'error');
    } finally {
      setSendingPanel(false);
    }
  };

  useEffect(() => {
    if (guildId && mounted) {
      Promise.all([
        api.request(`/config/${guildId}/tickets`),
        api.request(`/config/${guildId}/global`),
        api.request(`/config/${guildId}/discord-data`)
      ]).then(([data, globalData, discordRes]) => {
        const moduleConfig = data.data || data;
        const globalConfigData = globalData.data || globalData;
        
        if ((!moduleConfig.staffRoleIds || moduleConfig.staffRoleIds.length === 0) && globalConfigData.adminRoleIds?.length > 0) {
            moduleConfig.staffRoleIds = [...globalConfigData.adminRoleIds];
        }

        if (!moduleConfig.embeds) moduleConfig.embeds = {};
        if (!moduleConfig.embeds.panel) moduleConfig.embeds.panel = { title: '🎫 Centro Assistenza', description: 'Seleziona una categoria dal menu a tendina per aprire un ticket.', color: '#3498db' };
        if (!moduleConfig.embeds.ticket) moduleConfig.embeds.ticket = { title: '{emoji} Ticket: {type}', description: 'Bentornato <@{user_id}>, lo staff ti assisterà a breve.\n\n**Metadati Sessione:**\n• Priorità: `{priority}`\n• Stato: `{status}`', color: '#3498db' };
        if (!moduleConfig.embeds.close) moduleConfig.embeds.close = { title: '📁 Archivio Ticket', description: 'Il ticket è stato chiuso.', color: '#ff4757' };

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
  }, [guildId, mounted]);

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

  const setNested = (path, value) => {
    const newConfig = { ...config };
    const parts = path.split('.');
    let cur = newConfig;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!cur[parts[i]]) cur[parts[i]] = {};
        cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
    setConfig(newConfig);
  };

  const updateButton = (key, field, value) => {
    setNested(`buttons.${key}.${field}`, value);
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
      showToast('Configurazione salvata!');
    } catch (error) {
       showToast('Errore durante il salvataggio.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Vuoi davvero ripristinare?')) return;
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

  if (!mounted || loading || !config) return <Layout guildId={guildId}><Skeleton height="500px" /></Layout>;

  const tabs = [
    { id: 'settings', name: 'Core', icon: Settings2 },
    { id: 'categories', name: 'Struttura', icon: Layers },
    { id: 'messages', name: 'Messaggi', icon: MessageSquare },
    { id: 'personalization', name: 'Design', icon: Palette },
  ];

  return (
    <Layout guildId={guildId}>
      <div className="animate">
        
        {/* Module Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Ticket size={24} />
              </div>
              <div className="header-text">
                <h1>Verix Tickets</h1>
                <p>Sistema di supporto avanzato con categorie e auto-assegnazione.</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleSendPanel} className="btn-outline" disabled={sendingPanel || !config.panelChannelId}>
                <MessageSquare size={16} /> {sendingPanel ? 'Invio...' : 'Invia Pannello'}
              </button>
              <button onClick={handleReset} className="btn-outline">
                <RefreshCcw size={16} /> Reset
              </button>
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
           </div>
        </header>

        {/* Minimal Tab System */}
        <div className="tab-navigation">
            {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-link ${activeTab === tab.id ? 'active' : ''}`}>
                    <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                    <span>{tab.name}</span>
                </button>
            ))}
        </div>

        <div className="tab-panel animate">
            
            {/* TAB: Settings */}
            {activeTab === 'settings' && (
                <div className="config-grid-t">
                    <div className="grid-main-t">
                        <section className="card status-section-t" style={{ marginBottom: '24px' }}>
                            <div className="status-info-t">
                                <div className={`status-box-t ${config.enabled ? 'on' : ''}`}>
                                    <Power size={20} />
                                </div>
                                <div>
                                    <h3>Stato Modulo</h3>
                                    <p className="text-muted">Abilita o disabilita l'intero sistema ticket.</p>
                                </div>
                            </div>
                            <label className="toggle">
                                <input type="checkbox" checked={!!config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                                <span className="slider"></span>
                            </label>
                        </section>

                        <div className="two-cols-t">
                            <section className="card section-card-t">
                                <h3 className="align-center"><Type size={18} color="var(--primary)" /> Nome & Interfaccia</h3>
                                <div className="fields-stack-t">
                                    <div className="field-box">
                                        <label className="text-label">Naming Template</label>
                                        <input className="input" value={globalConfig.naming?.ticket || ''} onChange={e => setGlobalNested('naming.ticket', e.target.value)} placeholder="ticket-{user}" />
                                    </div>
                                    <div className="field-box">
                                        <label className="text-label">Interazione Pannello</label>
                                        <select className="select" value={config.inputType || 'BUTTONS'} onChange={e => setConfig({...config, inputType: e.target.value})}>
                                            <option value="BUTTONS">Pulsanti</option>
                                            <option value="SELECT">Menu a scelta</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            <section className="card section-card-t">
                                <h3 className="align-center"><Clock size={18} color="var(--primary)" /> Automazioni</h3>
                                <div className="fields-stack-t">
                                    <div className="field-box">
                                        <label className="text-label">Inattività (Ore)</label>
                                        <input type="number" className="input" value={config.inactivityTimeout || 24} onChange={e => setConfig({...config, inactivityTimeout: parseInt(e.target.value)})} />
                                    </div>
                                    <div className="toggle-list-t">
                                        <div className="toggle-row-t">
                                            <span>Trascrizioni HTML</span>
                                            <label className="toggle"><input type="checkbox" checked={!!config.transcriptionEnabled} onChange={e => setConfig({...config, transcriptionEnabled: e.target.checked})} /><span className="slider"></span></label>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    <aside className="grid-side-t">
                        <section className="card section-card-t">
                            <h3 className="align-center"><Bell size={18} color="var(--primary)" /> Protocollo Notifiche</h3>
                            <div className="events-stack-t">
                                {['onOpen', 'onClose'].map(ev => (
                                    <div key={ev} className="event-box-t">
                                        <span className="event-label-t">{ev === 'onOpen' ? 'Apertura' : 'Chiusura'}</span>
                                        <div className="event-options-t">
                                            <label className="mini-toggle-t"><input type="checkbox" checked={!!globalConfig.notifications[`tickets_${ev}`]?.dm} onChange={e => setGlobalNested(`notifications.tickets_${ev}.dm`, e.target.checked)} /> <span>DM</span></label>
                                            <label className="mini-toggle-t"><input type="checkbox" checked={!!globalConfig.logs[`log_${ev}`]} onChange={e => setGlobalNested(`logs.log_${ev}`, e.target.checked)} /> <span>LOG</span></label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div style={{ marginTop: '24px' }}>
                            <GuideSidebar type="tickets" context={config} />
                        </div>
                    </aside>
                </div>
            )}

            {/* TAB: Categories */}
            {activeTab === 'categories' && (
                <div className="categories-layout-t animate fade-in">
                    <section className="card section-card-t" style={{ marginBottom: '24px' }}>
                        <h3 className="align-center"><Hash size={20} color="var(--primary)" /> Canali & Ruoli Core</h3>
                        <div className="fields-grid-t">
                            <div className="field-box"><label className="text-label">Canale Pannello</label><DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.panelChannelId || ''} onChange={val => setConfig({...config, panelChannelId: val})} /></div>
                            <div className="field-box"><label className="text-label">Staff Predefinito</label><DiscordSelector type="role" multiple={true} options={roles} value={config.staffRoleIds || []} onChange={val => setConfig({...config, staffRoleIds: val})} /></div>
                            <div className="field-box"><label className="text-label">Categoria Aperti</label><DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.categoryOpenId || ''} onChange={val => setConfig({...config, categoryOpenId: val})} /></div>
                            <div className="field-box">
                                <label className="text-label">Azione alla Chiusura</label>
                                <select className="select" value={config.closeMode || 'DELETE'} onChange={e => setConfig({...config, closeMode: e.target.value})}>
                                    <option value="DELETE">Elimina & Salva Transcript</option>
                                    <option value="MOVE">Sposta nella Categoria Chiusi</option>
                                </select>
                            </div>
                            {(!config.closeMode || config.closeMode === 'DELETE') && (
                                <div className="field-box"><label className="text-label">Canale Transcript Logs</label><DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.logChannelId || ''} onChange={val => setConfig({...config, logChannelId: val})} /></div>
                            )}
                            {config.closeMode === 'MOVE' && (
                                <div className="field-box"><label className="text-label">Categoria Chiusi</label><DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.categoryClosedId || ''} onChange={val => setConfig({...config, categoryClosedId: val})} /></div>
                            )}
                        </div>
                    </section>
                    
                    <section className="card section-card-t">
                        <div className="card-header-t">
                            <h3 className="align-center"><Layers size={20} color="var(--primary)" /> Categorie Personalizzate</h3>
                            <button className="btn-outline"><Plus size={14} /> Nuova</button>
                        </div>
                        <div className="types-grid-t">
                            {config.typesConfig && Object.entries(config.typesConfig).map(([id, data]) => (
                                <div key={id} className="type-card-minimal" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Emoji</label>
                                        <input 
                                            className="input-small" 
                                            style={{ width: '40px', textAlign: 'center' }} 
                                            value={data.emoji || ''} 
                                            onChange={e => {
                                                const newTypes = { ...config.typesConfig };
                                                newTypes[id] = { ...data, emoji: e.target.value };
                                                setConfig({ ...config, typesConfig: newTypes });
                                            }} 
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Etichetta (ID: {id})</label>
                                        <input 
                                            className="input-small" 
                                            value={data.label || ''} 
                                            placeholder={id.charAt(0).toUpperCase() + id.slice(1)}
                                            onChange={e => {
                                                const newTypes = { ...config.typesConfig };
                                                newTypes[id] = { ...data, label: e.target.value };
                                                setConfig({ ...config, typesConfig: newTypes });
                                            }} 
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Colore</label>
                                        <input 
                                            type="color"
                                            style={{ width: '40px', height: '30px', padding: '2px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                            value={data.color || '#3498db'} 
                                            onChange={e => {
                                                const newTypes = { ...config.typesConfig };
                                                newTypes[id] = { ...data, color: e.target.value };
                                                setConfig({ ...config, typesConfig: newTypes });
                                            }} 
                                        />
                                    </div>
                                    <div className="type-actions-p" style={{ marginTop: '12px' }}>
                                        <button 
                                            className="btn-icon-danger"
                                            onClick={() => {
                                                const newTypes = { ...config.typesConfig };
                                                delete newTypes[id];
                                                setConfig({ ...config, typesConfig: newTypes });
                                            }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {/* TAB: Personalization */}
            {activeTab === 'personalization' && (
                <div className="personalization-flow-t animate fade-in">
                    <div className="config-grid-t">
                        <section className="card editor-wrapper-t">
                            <div className="editor-nav-t">
                                <h3>Design Embed</h3>
                                <select className="select" style={{ width: '220px' }} value={activeEmbedKey} onChange={e => setActiveEmbedKey(e.target.value)}>
                                    <option value="panel">Pannello Scelta</option>
                                    <option value="ticket">Interno Ticket (Staff)</option>
                                    <option value="close">Log Chiusura</option>
                                </select>
                            </div>
                            <div className="editor-main-t">
                                <EmbedEditor 
                                    embed={config.embeds?.[activeEmbedKey] || {}} 
                                    showButtonEditor={activeEmbedKey === 'panel'}
                                    onChange={(data) => updateEmbed(activeEmbedKey, data)}
                                    variables={['user', 'guild', 'ticket_id', 'staff', 'type', 'priority']}
                                />
                            </div>
                        </section>

                        <aside className="side-extras-t">
                            <section className="card section-card-t">
                                <h4 className="align-center"><Type size={16} /> Messaggi Effimeri</h4>
                                <div className="fields-stack-t">
                                    <div className="field-box">
                                        <input className="input" value={config.messages?.alreadyExists || ''} onChange={e => setNested('messages.alreadyExists', e.target.value)} placeholder="Già aperto..." />
                                    </div>
                                    <div className="field-box">
                                        <input className="input" value={config.messages?.successOpen || ''} onChange={e => setNested('messages.successOpen', e.target.value)} placeholder="Apertura!" />
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>

                    <section className="card buttons-overview-t">
                        <div className="align-center" style={{ marginBottom: '24px' }}>
                            <MousePointer2 size={20} color="var(--primary)" />
                            <h3>Configurazione Pulsanti Interni</h3>
                        </div>
                        <div className="btn-cards-grid-t">
                            {[
                                { key: 'claim', label: 'Claim' },
                                { key: 'close', label: 'Chiudi' },
                                { key: 'quickReply', label: 'Reply' },
                                { key: 'tag', label: 'Tag' },
                                { key: 'transcript', label: 'Logs' }
                            ].map(btn => (
                                <div key={btn.key} className="btn-config-box-t">
                                    <label className="label-tiny-t">{btn.label}</label>
                                    <div className="btn-fields-t">
                                        <input className="input-s" value={config.buttons?.[btn.key]?.label || ''} onChange={e => updateButton(btn.key, 'label', e.target.value)} />
                                        <input className="input-emoji" value={config.buttons?.[btn.key]?.emoji || ''} onChange={e => updateButton(btn.key, 'emoji', e.target.value)} />
                                    </div>
                                    <div className="style-dots-t">
                                        {['SUCCESS', 'DANGER', 'PRIMARY', 'SECONDARY'].map(style => (
                                            <button 
                                                key={style}
                                                onClick={() => updateButton(btn.key, 'style', style)}
                                                className={`dot-btn ${style} ${config.buttons?.[btn.key]?.style === style ? 'active' : ''}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}


            {/* TAB: Messages */}
            {activeTab === 'messages' && (
                <div className="animate">
                    <EmbedMessageManager 
                        guildId={guildId}
                        module="tickets"
                        slugs={[
                            { key: 'already_claimed', label: 'Ufficio Già Preso', description: 'Mostrato quando un altro Staff tenta di prendere un ticket già assegnato.', variables: ['assignedStaffId'] },
                            { key: 'status_updated', label: 'Protocollo Aggiornato', description: 'Conferma del cambio stato del ticket.', variables: ['status'] },
                            { key: 'cannot_close', label: 'Chiusura Negata', description: 'Errore quando le condizioni di chiusura non sono rispettate.' },
                        ]}
                    />
                </div>
            )}
        </div>

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

            .config-grid-t { display: grid; grid-template-columns: 1fr 300px; gap: 24px; }
            .grid-main-t { display: flex; flex-direction: column; gap: 24px; }
            .status-section-t { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; }
            .status-info-t { display: flex; align-items: center; gap: 16px; }
            .status-box-t { width: 40px; height: 40px; background: #1e293b; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); border: 1px solid var(--border); }
            .status-box-t.on { color: var(--primary); background: rgba(129, 140, 248, 0.1); border-color: rgba(129, 140, 248, 0.2); }
            
            .two-cols-t { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
            .fields-stack-t { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
            .toggle-list-t { margin-top: 8px; }
            .toggle-row-t { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: rgba(255,255,255,0.02); border-radius: 10px; border: 1px solid var(--border); font-size: 0.85rem; font-weight: 600; }

            .event-box-t { padding: 12px; background: rgba(0,0,0,0.1); border-radius: 10px; border: 1px solid var(--border); margin-bottom: 12px; }
            .event-label-t { display: block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-dim); margin-bottom: 8px; font-weight: 800; }
            .event-options-t { display: flex; gap: 15px; }
            .mini-toggle-t { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
            .mini-toggle-t input { accent-color: var(--primary); }

            .fields-grid-t { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 16px; }
            .card-header-t { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .types-grid-t { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
            .type-card-minimal { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.02); border-radius: 10px; border: 1px solid var(--border); transition: 0.2s; }
            .type-card-minimal:hover { background: rgba(255,255,255,0.03); border-color: var(--primary); }
            .type-icon-p { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
            .type-info-p h4 { font-size: 0.9rem; margin-bottom: 0; }
            .type-info-p span { font-size: 0.65rem; color: var(--text-dim); }
            .type-actions-p { margin-left: auto; }

            .editor-wrapper-t { padding: 0 !important; }
            .editor-nav-t { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
            .editor-main-t { padding: 24px; }
            
            .buttons-overview-t { margin-top: 32px; }
            .btn-cards-grid-t { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
            .btn-config-box-t { background: rgba(0,0,0,0.1); padding: 16px; border-radius: 12px; border: 1px solid var(--border); }
            .label-tiny-t { font-size: 0.65rem; text-transform: uppercase; color: var(--primary); font-weight: 900; margin-bottom: 10px; display: block; }
            .btn-fields-t { display: grid; grid-template-columns: 1fr 40px; gap: 8px; margin-bottom: 10px; }
            .input-s { background: #020617; border: 1px solid var(--border); padding: 6px 10px; border-radius: 6px; color: white; font-size: 0.8rem; flex: 1; }
            .input-emoji { background: #020617; border: 1px solid var(--border); padding: 6px 4px; border-radius: 6px; color: white; text-align: center; }
            .style-dots-t { display: flex; gap: 6px; }
            .dot-btn { width: 100%; height: 6px; border: none; border-radius: 100px; cursor: pointer; opacity: 0.2; transition: 0.2s; }
            .dot-btn.active { opacity: 1; height: 8px; }
            .dot-btn.SUCCESS { background: #22c55e; }
            .dot-btn.DANGER { background: #ef4444; }
            .dot-btn.PRIMARY { background: #6366f1; }
            .dot-btn.SECONDARY { background: #64748b; }

            .align-center { display: flex; align-items: center; gap: 10px; }
            @media (max-width: 1000px) { .config-grid-t { grid-template-columns: 1fr; } .two-cols-t { grid-template-columns: 1fr; } }
        `}</style>
      </div>
    </Layout>
  );
}
