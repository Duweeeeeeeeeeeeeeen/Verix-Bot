import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import EmbedEditor from '../../../components/EmbedEditor';
import DesignSectionManager from '../../../components/DesignSectionManager';
import api from '../../../utils/api';
import { 
  Save, Ticket, Clock, Plus, Trash2, RefreshCcw, Power, 
  Settings2, Info, ChevronRight, Bell, Tag, MessageSquare, 
  MousePointer2, Type, Hash, Shield, Palette, Layers,
  Archive, FileText, XCircle, CheckCircle2, Zap
} from 'lucide-react';
import DiscordSelector from '../../../components/DiscordSelector';
import EmojiInput from '../../../components/EmojiInput';
import EmbedMessageManager from '../../../components/EmbedMessageManager';
import { mergeConfig } from '../../../utils/defaults';

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

  const loadData = async () => {
    if (!guildId || !mounted) return;
    setLoading(true);
    try {
      const [data, globalData, discordRes] = await Promise.all([
        api.request(`/config/${guildId}/tickets`).catch(() => ({ data: {} })),
        api.request(`/config/${guildId}/global`).catch(() => ({ data: {} })),
        api.request(`/config/${guildId}/discord-data`).catch(() => ({ roles: [], channels: [] }))
      ]);

      const moduleConfig = mergeConfig(data?.data || data || {}, 'tickets');
      const globalConfigData = globalData?.data || globalData || {};
      
      setConfig(moduleConfig);
      setGlobalConfig(globalConfigData);
      setChannels(discordRes?.data?.channels || discordRes?.channels || []);
      setRoles(discordRes?.data?.roles || discordRes?.roles || []);
    } catch (err) {
      console.error("Error loading ticket data:", err);
      // Fallback to absolute defaults to at least show the page
      setConfig(mergeConfig({}, 'tickets'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
    setSaving(true);
    try {
      await Promise.all([
        api.request(`/config/${guildId}/tickets`, { method: 'POST', body: JSON.stringify(config) }),
        api.request(`/config/${guildId}/global`, { method: 'POST', body: JSON.stringify(globalConfig) })
      ]);
      showToast('Configurazione salvata con successo!');
    } catch (error) {
      showToast('Errore durante il salvataggio.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendPanel = async () => {
    if (!config.panelChannelId) return showToast('Configura prima un Canale Pannello!', 'error');
    setSendingPanel(true);
    try {
      await api.request(`/config/${guildId}/tickets/send-panel`, { method: 'POST' });
      showToast('Pannello inviato con successo!');
    } catch (error) {
      showToast('Errore durante l\'invio del pannello.', 'error');
    } finally {
      setSendingPanel(false);
    }
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

  const setGlobalNested = (path, value) => {
    const newGlobal = { ...globalConfig };
    const parts = path.split('.');
    let cur = newGlobal;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!cur[parts[i]]) cur[parts[i]] = {};
        cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
    setGlobalConfig(newGlobal);
  };

  const addCategory = () => {
    const id = `cat_${Math.random().toString(36).substr(2, 5)}`;
    const newTypes = { ...(config.typesConfig || {}) };
    newTypes[id] = { label: 'Nuova Categoria', emoji: '🎫', color: '#3498db', staffRoleIds: [] };
    setConfig({ ...config, typesConfig: newTypes });
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  const tabs = [
    { id: 'settings', name: 'Generale', icon: Settings2 },
    { id: 'categories', name: 'Categorie', icon: Layers },
    { id: 'personalization', name: 'Design & Messaggi', icon: Palette },
  ];

  return (
    <div className="config-page-layout animate">
      <div className="config-main-col">
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Ticket size={24} />
              </div>
              <div className="header-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h1>Gestione Ticket</h1>
                  <label className="toggle-mini" title={config.enabled ? 'Modulo Attivo' : 'Modulo Disattivato'}>
                    <input type="checkbox" checked={!!config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                    <span className="slider-mini"></span>
                  </label>
                </div>
                <p>Configura il sistema di supporto, le categorie e l'aspetto dei messaggi.</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleSendPanel} className="btn-outline" disabled={sendingPanel || !config.panelChannelId}>
                <Zap size={16} /> {sendingPanel ? 'Invio...' : 'Invia Pannello'}
              </button>
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
           </div>
        </header>

        <div className="tab-navigation">
            {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-link ${activeTab === tab.id ? 'active' : ''}`}>
                    <tab.icon size={16} />
                    <span>{tab.name}</span>
                </button>
            ))}
        </div>

        <div className="tab-panel animate fade-in">
            {/* TAB: Settings */}
            {activeTab === 'settings' && (
                <div className="config-grid-t">
                    <div className="grid-main-t">


                        <div className="two-cols-t">
                            <section className="card section-card-t">
                                <h3 className="align-center"><Type size={18} color="var(--primary)" /> Interfaccia</h3>
                                <div className="fields-stack-t">
                                    <div className="field-box">
                                        <label className="text-label">Template Nomi Canali</label>
                                        <input className="input" value={globalConfig?.naming?.ticket || ''} onChange={e => setGlobalNested('naming.ticket', e.target.value)} placeholder="ticket-{user}" />
                                    </div>
                                    <div className="field-box">
                                        <label className="text-label">Modalità Input</label>
                                        <select className="select" value={config.inputType || 'BUTTONS'} onChange={e => setConfig({...config, inputType: e.target.value})}>
                                            <option value="BUTTONS">Pulsanti</option>
                                            <option value="SELECT">Menu a Tendina</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            <section className="card section-card-t">
                                <h3 className="align-center"><Clock size={18} color="var(--primary)" /> Automazione</h3>
                                <div className="fields-stack-t">
                                    <div className="field-box">
                                        <label className="text-label">Timeout Inattività (Ore)</label>
                                        <input type="number" className="input" value={config.inactivityTimeout || 24} onChange={e => setConfig({...config, inactivityTimeout: parseInt(e.target.value)})} />
                                    </div>
                                    <div className="status-row-t">
                                        <span>Salva Transcript HTML</span>
                                        <label className="toggle">
                                            <input type="checkbox" checked={!!config.transcriptionEnabled} onChange={e => setConfig({...config, transcriptionEnabled: e.target.checked})} />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    <aside className="grid-side-t">
                        <section className="card section-card-t">
                            <h3 className="align-center"><Bell size={18} color="var(--primary)" /> Notifiche</h3>
                            <div className="events-stack-t">
                                {['onOpen', 'onClose'].map(ev => (
                                    <div key={ev} className="event-box-t">
                                        <span className="event-label-t">{ev === 'onOpen' ? 'Apertura' : 'Chiusura'}</span>
                                        <div className="event-options-t">
                                            <label className="mini-toggle-t">
                                                <input type="checkbox" checked={!!globalConfig?.notifications?.[`tickets_${ev}`]?.dm} onChange={e => setGlobalNested(`notifications.tickets_${ev}.dm`, e.target.checked)} /> 
                                                <span>DM</span>
                                            </label>
                                            <label className="mini-toggle-t">
                                                <input type="checkbox" checked={!!globalConfig?.logs?.[`log_${ev}`]} onChange={e => setGlobalNested(`logs.log_${ev}`, e.target.checked)} /> 
                                                <span>LOG</span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </aside>
                </div>
            )}

            {/* TAB: Categories */}
            {activeTab === 'categories' && (
                <div className="animate fade-in">
                    <section className="card section-card-t" style={{ marginBottom: '24px' }}>
                        <h3 className="align-center"><Hash size={20} color="var(--primary)" /> Struttura Canali Core</h3>
                        <div className="fields-grid-t">
                            <div className="field-box">
                                <label className="text-label">Canale Pannello</label>
                                <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.panelChannelId || ''} onChange={val => setConfig({...config, panelChannelId: val})} />
                            </div>
                            <div className="field-box">
                                <label className="text-label">Staff Predefinito</label>
                                <DiscordSelector type="role" multiple={true} options={roles} value={config.staffRoleIds || []} onChange={val => setConfig({...config, staffRoleIds: val})} />
                            </div>
                            <div className="field-box">
                                <label className="text-label">Categoria Ticket Aperti</label>
                                <DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.categoryOpenId || ''} onChange={val => setConfig({...config, categoryOpenId: val})} />
                            </div>
                            <div className="field-box">
                                <label className="text-label">Gestione Chiusura</label>
                                <select className="select" value={config.closeMode || 'DELETE'} onChange={e => setConfig({...config, closeMode: e.target.value})}>
                                    <option value="DELETE">Elimina Canale</option>
                                    <option value="MOVE">Sposta in Categoria</option>
                                </select>
                            </div>
                            {config.closeMode === 'MOVE' && (
                                <div className="field-box">
                                    <label className="text-label">Categoria Ticket Chiusi</label>
                                    <DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.categoryClosedId || ''} onChange={val => setConfig({...config, categoryClosedId: val})} />
                                </div>
                            )}
                            <div className="field-box">
                                <label className="text-label">Canale Log Archivio</label>
                                <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.logChannelId || ''} onChange={val => setConfig({...config, logChannelId: val})} />
                            </div>
                        </div>
                    </section>

                    <section className="card section-card-t">
                        <div className="card-header-t">
                            <h3 className="align-center"><Layers size={20} color="var(--primary)" /> Categorie Ticket</h3>
                            <button className="btn-outline" onClick={addCategory}><Plus size={14} /> Nuova Categoria</button>
                        </div>
                        <div className="types-grid-t">
                            {config.typesConfig && Object.entries(config.typesConfig).map(([id, data]) => (
                                <div key={id} className="type-card-minimal">
                                    <div className="type-fields-row">
                                        <div className="type-field-small">
                                            <label>Emoji</label>
                                            <EmojiInput value={data.emoji || '🎫'} onChange={e => {
                                                const newTypes = { ...config.typesConfig };
                                                newTypes[id] = { ...data, emoji: e.target.value };
                                                setConfig({ ...config, typesConfig: newTypes });
                                            }} />
                                        </div>
                                        <div className="type-field-main">
                                            <label>Etichetta</label>
                                            <input className="input" value={data.label || ''} onChange={e => {
                                                const newTypes = { ...config.typesConfig };
                                                newTypes[id] = { ...data, label: e.target.value };
                                                setConfig({ ...config, typesConfig: newTypes });
                                            }} />
                                        </div>
                                        <div className="type-field-small">
                                            <label>Colore</label>
                                            <input type="color" value={data.color || '#3498db'} onChange={e => {
                                                const newTypes = { ...config.typesConfig };
                                                newTypes[id] = { ...data, color: e.target.value };
                                                setConfig({ ...config, typesConfig: newTypes });
                                            }} />
                                        </div>
                                        <button className="btn-icon-danger" onClick={() => {
                                            const newTypes = { ...config.typesConfig };
                                            delete newTypes[id];
                                            setConfig({ ...config, typesConfig: newTypes });
                                        }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="type-staff-row">
                                        <label>Staff Specifico (Opzionale)</label>
                                        <DiscordSelector type="role" multiple options={roles} value={data.staffRoleIds || []} onChange={val => {
                                            const newTypes = { ...config.typesConfig };
                                            newTypes[id] = { ...data, staffRoleIds: val };
                                            setConfig({ ...config, typesConfig: newTypes });
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {/* TAB: Personalization */}
            {activeTab === 'personalization' && (
                <div className="animate fade-in">
                    <section className="card section-card-t" style={{ marginBottom: '24px' }}>
                         <h4 className="align-center"><Palette size={18} color="var(--primary)" /> Branding Bottoni</h4>
                         <div className="btn-cards-grid-t" style={{ padding: '20px 0' }}>
                            {[
                                { key: 'claim', label: 'Prendi in Carico' },
                                { key: 'close', label: 'Chiudi Ticket' },
                                { key: 'tag', label: 'Aggiorna Stato' }
                            ].map(btn => (
                                <div key={btn.key} className="btn-config-box-t">
                                    <label className="label-tiny-t">{btn.label}</label>
                                    <div className="btn-fields-t">
                                        <input className="input" value={config.buttons?.[btn.key]?.label || ''} onChange={e => setNested(`buttons.${btn.key}.label`, e.target.value)} />
                                        <div style={{ width: '60px' }}>
                                            <EmojiInput value={config.buttons?.[btn.key]?.emoji || ''} onChange={e => setNested(`buttons.${btn.key}.emoji`, e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="style-dots-t">
                                        {['SUCCESS', 'DANGER', 'PRIMARY', 'SECONDARY'].map(style => (
                                            <button 
                                                key={style}
                                                onClick={() => setNested(`buttons.${btn.key}.style`, style)}
                                                className={`dot-btn ${style} ${config.buttons?.[btn.key]?.style === style ? 'active' : ''}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <EmbedMessageManager 
                        guildId={guildId}
                        module="tickets"
                        slugs={[
                            { key: 'panel', label: 'Pannello Apertura Ticket', description: 'Il messaggio principale con i bottoni o il menu per aprire un ticket.', variables: ['guild'], group: '🎫 Ticket', groupIcon: Ticket },
                            { key: 'ticket', label: 'Ticket Benvenuto (Generale)', description: 'Messaggio iniziale mandato dentro il ticket se non c\'è un messaggio specifico per categoria.', variables: ['user'], group: '🎫 Ticket', groupIcon: Ticket },
                            { key: 'success_open', label: 'Ticket Aperto', description: 'Risposta effimera al bottone di apertura ticket.', variables: ['user', 'ticketChannel'], group: '🎫 Ticket', groupIcon: Ticket },
                            { key: 'close', label: 'Ticket Chiuso', description: 'Messaggio di conferma chiusura nel ticket prima dell\'archiviazione.', variables: ['user'], group: '🔒 Chiusura', groupIcon: Archive },
                            { key: 'already_exists', label: 'Ticket Esistente', description: 'Errore mostrato quando un utente ha già un ticket aperto.', variables: ['user', 'ticketChannel'], group: '🟥 Errori', groupIcon: XCircle },
                            { key: 'already_claimed', label: 'Ticket Già Preso', description: 'Errore mostrato quando un membro staff tenta di prendere un ticket già gestito.', variables: ['user'], group: '🟥 Errori', groupIcon: XCircle },
                            { key: 'staff_claimed', label: 'Ticket Preso in Carico', description: 'Messaggio inviato quando un membro dello staff clicca "Prendi in carico".', variables: ['staff'], group: '🛡️ Staff', groupIcon: Shield },
                            { key: 'status_updated', label: 'Stato Aggiornato', description: 'Messaggio che indica il cambio di stato del ticket (es. in attesa utente).', variables: ['user', 'status'], group: '🎫 Ticket', groupIcon: Tag },
                            { key: 'staff_ticket_log', label: 'Log Ticket Staff', description: 'Log inviato nel canale log ticket quando un ticket viene chiuso.', variables: ['user', 'staff', 'ticketId'], group: '🛡️ Staff', groupIcon: Shield },
                            { key: 'close_status', label: 'Trascrizione Ticket', description: 'Messaggio finale inviato in DM all\'utente con il transcript del ticket.', variables: ['user', 'ticketId', 'transcriptUrl'], group: '🔒 Chiusura', groupIcon: FileText },
                            { key: 'cannot_close', label: 'Errore Chiusura', description: 'Errore mostrato se il ticket non può essere chiuso (es. permessi mancanti).', variables: ['user'], group: '🟥 Errori', groupIcon: XCircle }
                        ]}
                    />
                </div>
            )}
        </div>
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
            .status-section-t { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px solid var(--border); }
            .status-info-t { display: flex; align-items: center; gap: 16px; }
            .status-box-t { width: 40px; height: 40px; background: #1e293b; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); border: 1px solid var(--border); }
            .status-box-t.on { color: var(--primary); background: rgba(129, 140, 248, 0.1); border-color: rgba(129, 140, 248, 0.2); }
            
            .two-cols-t { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
            .fields-stack-t { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
            .status-row-t { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: rgba(255,255,255,0.02); border-radius: 10px; border: 1px solid var(--border); font-size: 0.85rem; font-weight: 600; }

            .event-box-t { padding: 12px; background: rgba(0,0,0,0.1); border-radius: 10px; border: 1px solid var(--border); margin-bottom: 12px; }
            .event-label-t { display: block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-dim); margin-bottom: 8px; font-weight: 800; }
            .event-options-t { display: flex; gap: 15px; }
            .mini-toggle-t { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
            .mini-toggle-t input { accent-color: var(--primary); }

            .fields-grid-t { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 16px; }
            .card-header-t { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .types-grid-t { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 16px; }
            .type-card-minimal { display: flex; flex-direction: column; gap: 16px; padding: 20px; background: rgba(255,255,255,0.02); border-radius: 14px; border: 1px solid var(--border); }
            .type-fields-row { display: flex; gap: 12px; align-items: flex-end; }
            .type-field-small { width: 60px; display: flex; flex-direction: column; gap: 6px; }
            .type-field-main { flex: 1; display: flex; flex-direction: column; gap: 6px; }
            .type-field-small label, .type-field-main label, .type-staff-row label { font-size: 0.7rem; text-transform: uppercase; color: var(--text-dim); font-weight: 800; }
            .type-staff-row { display: flex; flex-direction: column; gap: 8px; border-top: 1px solid var(--border); pt: 12px; }

            .editor-wrapper-t { padding: 0 !important; overflow: hidden; border-radius: 16px; }
            .editor-nav-t { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.01); }
            .editor-main-t { padding: 0; }
            
            .btn-cards-grid-t { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
            .btn-config-box-t { background: rgba(255,255,255,0.02); padding: 20px; border-radius: 14px; border: 1px solid var(--border); }
            .label-tiny-t { font-size: 0.7rem; text-transform: uppercase; color: var(--primary); font-weight: 900; margin-bottom: 12px; display: block; }
            .btn-fields-t { display: flex; gap: 10px; margin-bottom: 12px; }
            .style-dots-t { display: flex; gap: 6px; height: 8px; margin-top: 10px; }
            .dot-btn { flex: 1; height: 6px; border: none; border-radius: 100px; cursor: pointer; opacity: 0.2; transition: 0.2s; }
            .dot-btn.active { opacity: 1; height: 8px; transform: translateY(-1px); }
            .dot-btn.SUCCESS { background: #22c55e; }
            .dot-btn.DANGER { background: #ef4444; }
            .dot-btn.PRIMARY { background: #6366f1; }
            .dot-btn.SECONDARY { background: #64748b; }

            .align-center { display: flex; align-items: center; gap: 10px; }
            @media (max-width: 1000px) { .config-grid-t { grid-template-columns: 1fr; } .two-cols-t { grid-template-columns: 1fr; } .type-fields-row { flex-direction: column; align-items: stretch; } }
        `}</style>
    </div>
  );
}
