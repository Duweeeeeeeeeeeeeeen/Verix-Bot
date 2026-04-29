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
  Archive, FileText, XCircle, CheckCircle2, Zap, Send, Users,
  GripVertical, Play
} from 'lucide-react';
import DiscordSelector from '../../../components/DiscordSelector';
import EmojiInput from '../../../components/EmojiInput';
import EmbedMessageManager from '../../../components/EmbedMessageManager';
import CustomSelect from '../../../components/CustomSelect';
import { mergeConfig } from '../../../utils/defaults';
import NotificationSettings from '../../../components/NotificationSettings';

export default function TicketConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  
  const [activeTab, setActiveTab] = useState('settings');
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
      await handleSave();
      await api.request(`/config/${guildId}/tickets/send-panel`, { method: 'POST' });
      showToast('Pannello inviato con successo!');
    } catch (error) {
      showToast('Errore durante l\'invio del pannello.', 'error');
    } finally {
      setSendingPanel(false);
    }
  };

  const setNested = (path, value) => {
    setConfig(prev => {
        const newConfig = { ...prev };
        const parts = path.split('.');
        let cur = newConfig;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!cur[parts[i]]) cur[parts[i]] = {};
            else cur[parts[i]] = { ...cur[parts[i]] }; // Clone level
            cur = cur[parts[i]];
        }
        cur[parts[parts.length - 1]] = value;
        return newConfig;
    });
  };

  const setGlobalNested = (path, value) => {
    setGlobalConfig(prev => {
        const newGlobal = { ...prev };
        const parts = path.split('.');
        let cur = newGlobal;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!cur[parts[i]]) cur[parts[i]] = {};
            else cur[parts[i]] = { ...cur[parts[i]] };
            cur = cur[parts[i]];
        }
        cur[parts[parts.length - 1]] = value;
        return newGlobal;
    });
  };

  const addCategory = () => {
    setConfig(prev => {
        const id = `cat_${Math.random().toString(36).substr(2, 5)}`;
        const newTypes = { ...(prev.typesConfig || {}) };
        newTypes[id] = { label: 'Nuova Categoria', emoji: '🎫', color: '#6366f1', style: 'PRIMARY', staffRoleIds: [] };
        return { ...prev, typesConfig: newTypes };
    });
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  const tabs = [
    { id: 'settings', name: 'Settaggi', icon: Settings2 },
    { id: 'categories', name: 'Categorie', icon: Layers },
    { id: 'automation', name: 'Automazione', icon: Zap },
    { id: 'personalization', name: 'Design & Messaggi', icon: Palette },
  ];

  return (
    <div className="config-page-layout">
      <div className="config-main-col">
        <div className="animate">
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
                        <Send size={16} /> {sendingPanel ? 'Invio...' : 'Invia Pannello'}
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
                {/* TAB: Settaggi */}
                {activeTab === 'settings' && (
                    <div className="config-grid">
                        <div className="grid-left">
                            <section className="card section-card">
                                <div className="section-header">
                                    <div className="align-center">
                                        <Hash size={18} color="var(--primary)" />
                                        <h3>Canali Core</h3>
                                    </div>
                                </div>
                                <div className="fields-grid" style={{ marginTop: '20px' }}>
                                    <div className="field-box">
                                        <label className="text-label">Canale Pannello</label>
                                        <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.panelChannelId || ''} onChange={val => setConfig({...config, panelChannelId: val})} />
                                    </div>
                                    <div className="field-box">
                                        <label className="text-label">Canale Log Archivio</label>
                                        <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.logChannelId || ''} onChange={val => setConfig({...config, logChannelId: val})} />
                                    </div>
                                    <div className="field-box">
                                        <label className="text-label">Categoria Ticket Aperti</label>
                                        <DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.categoryOpenId || ''} onChange={val => setConfig({...config, categoryOpenId: val})} />
                                    </div>
                                    <div className="field-box">
                                        <label className="text-label">Modalità Chiusura</label>
                                        <CustomSelect 
                                            options={[
                                                { value: 'DELETE', label: '🗑️ Elimina Canale' },
                                                { value: 'MOVE', label: '📂 Sposta in Categoria' }
                                            ]} 
                                            value={config.closeMode || 'DELETE'} 
                                            onChange={val => setConfig({...config, closeMode: val})} 
                                        />
                                    </div>
                                    {config.closeMode === 'MOVE' && (
                                        <div className="field-box" style={{ gridColumn: 'span 2' }}>
                                            <label className="text-label">Categoria Ticket Chiusi</label>
                                            <DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.categoryClosedId || ''} onChange={val => setConfig({...config, categoryClosedId: val})} />
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                        <div className="grid-right">
                            <section className="card section-card">
                                <h3 className="sidebar-title align-center" style={{ marginBottom: '16px' }}><Shield size={18} /> Staff Roles</h3>
                                <DiscordSelector type="role" multiple={true} options={roles} value={config.staffRoleIds || []} onChange={val => setConfig({...config, staffRoleIds: val})} />
                                <p className="text-description" style={{ marginTop: '12px' }}>Ruoli che possono vedere e gestire tutti i ticket per impostazione predefinita.</p>
                            </section>
                        </div>
                    </div>
                )}

                {/* TAB: Categorie */}
                {activeTab === 'categories' && (
                    <div className="animate fade-in">
                        <section className="card section-card">
                            <div className="section-header">
                                <div className="align-center">
                                    <Layers size={20} color="var(--primary)" />
                                    <h3>Categorie Ticket</h3>
                                </div>
                                <button className="btn-outline" onClick={addCategory}><Plus size={14} /> Nuova Categoria</button>
                            </div>
                            <p className="text-description" style={{ marginBottom: '24px' }}>Definisci i diversi tipi di ticket che gli utenti possono aprire (es. Supporto, Segnalazioni).</p>
                            
                            <div className="categories-stack">
                                {config.typesConfig && Object.entries(config.typesConfig).length > 0 ? (
                                    Object.entries(config.typesConfig).map(([id, data]) => (
                                        <div key={id} className="category-item animate fade-in">
                                            <div className="category-main">
                                                <div className="category-drag">
                                                    <GripVertical size={20} className="text-dim" />
                                                </div>
                                                <div className="category-emoji-picker">
                                                    <EmojiInput 
                                                        value={data.emoji || '🎫'} 
                                                        hideInput={true}
                                                        onChange={e => {
                                                            const newTypes = { ...config.typesConfig };
                                                            newTypes[id] = { ...data, emoji: e.target.value };
                                                            setConfig({ ...config, typesConfig: newTypes });
                                                        }} 
                                                    />
                                                </div>
                                                <div className="category-label">
                                                    <input className="input-transparent" value={data.label || ''} onChange={e => {
                                                        const newTypes = { ...config.typesConfig };
                                                        newTypes[id] = { ...data, label: e.target.value };
                                                        setConfig({ ...config, typesConfig: newTypes });
                                                    }} placeholder="Nome categoria..." />
                                                </div>
                                                <div className="category-color" title="Colore dell'Embed del Ticket">
                                                    <label className="label-tiny">Colore Embed</label>
                                                    <input type="color" value={data.color || '#6366f1'} onChange={e => {
                                                        const newTypes = { ...config.typesConfig };
                                                        newTypes[id] = { ...data, color: e.target.value };
                                                        setConfig({ ...config, typesConfig: newTypes });
                                                    }} />
                                                </div>
                                                <div className="category-style">
                                                    <label className="label-tiny">Colore Bottone</label>
                                                    <div className="style-selector-mini">
                                                        {[
                                                            { id: 'SUCCESS', label: 'V' },
                                                            { id: 'DANGER', label: 'R' },
                                                            { id: 'PRIMARY', label: 'B' },
                                                            { id: 'SECONDARY', label: 'G' },
                                                            { id: 'LINK', label: 'L' }
                                                        ].map(style => (
                                                            <button 
                                                                key={style.id}
                                                                title={style.id === 'LINK' ? 'Link Esterno' : style.label}
                                                                onClick={() => {
                                                                    const newTypes = { ...config.typesConfig };
                                                                    newTypes[id] = { ...data, style: style.id };
                                                                    setConfig({ ...config, typesConfig: newTypes });
                                                                }}
                                                                className={`style-pill-mini ${style.id} ${data.style === style.id ? 'active' : ''}`}
                                                            >
                                                                {style.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="category-actions">
                                                    <button className="btn-icon-danger" onClick={() => {
                                                        if(confirm('Eliminare questa categoria?')) {
                                                            const newTypes = { ...config.typesConfig };
                                                            delete newTypes[id];
                                                            setConfig({ ...config, typesConfig: newTypes });
                                                        }
                                                    }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="category-details">
                                                <div style={{ display: 'grid', gridTemplateColumns: data.style === 'LINK' ? '1fr 1fr' : '1fr', gap: '20px' }}>
                                                    {/* Staff Specifico rimosso */}
                                                    {data.style === 'LINK' && (
                                                        <div className="detail-field animate fade-in">
                                                            <label className="label-tiny">URL Destinazione</label>
                                                            <input 
                                                                className="input" 
                                                                value={data.url || ''} 
                                                                onChange={e => {
                                                                    const newTypes = { ...config.typesConfig };
                                                                    newTypes[id] = { ...data, url: e.target.value };
                                                                    setConfig({ ...config, typesConfig: newTypes });
                                                                }} 
                                                                placeholder="https://..."
                                                                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <Ticket size={48} />
                                        <p>Nessuna categoria configurata. Clicca su "Nuova Categoria" per iniziare.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}

                {/* TAB: Automazione */}
                {activeTab === 'automation' && (
                    <div className="config-grid">
                        <div className="grid-left">
                            <section className="card section-card">
                                <div className="align-center" style={{ marginBottom: '20px' }}>
                                    <Zap size={18} color="var(--primary)" />
                                    <h3>Impostazioni Avanzate</h3>
                                </div>
                                <div className="fields-grid">
                                    <div className="field-box">
                                        <label className="text-label">Template Nomi Canali</label>
                                        <input className="input" value={globalConfig?.naming?.ticket || ''} onChange={e => setGlobalNested('naming.ticket', e.target.value)} placeholder="ticket-{user}" />
                                        <p className="text-tiny">Usa {`{user}`} per il nome utente.</p>
                                    </div>
                                    <div className="field-box">
                                        <label className="text-label">Modalità Input Pannello</label>
                                        <CustomSelect 
                                            options={[
                                                { value: 'BUTTONS', label: '🔘 Pulsanti' },
                                                { value: 'SELECT', label: '🔽 Menu a Tendina' }
                                            ]} 
                                            value={config.inputType || 'BUTTONS'} 
                                            onChange={val => setConfig({...config, inputType: val})} 
                                        />
                                    </div>
                                    <div className="field-box">
                                        <label className="text-label">Timeout Inattività (Ore)</label>
                                        <input type="number" className="input" value={config.inactivityTimeout || 24} onChange={e => setConfig({...config, inactivityTimeout: parseInt(e.target.value)})} />
                                    </div>
                                    <div className="transcription-box">
                                        <div className="flex-col">
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Trascrizioni HTML</span>
                                            <p className="text-dim" style={{ fontSize: '0.75rem', margin: 0 }}>Salva la cronologia chat alla chiusura.</p>
                                        </div>
                                        <label className="toggle">
                                            <input type="checkbox" checked={!!config.transcriptionEnabled} onChange={e => setConfig({...config, transcriptionEnabled: e.target.checked})} />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </section>
                        </div>
                        <div className="grid-right">
                             <section className="card section-card">
                                <NotificationSettings 
                                    guildId={guildId}
                                    value={config.notifications}
                                    onChange={val => setConfig({...config, notifications: val})}
                                    title="Notifiche Utente"
                                    description="Scegli come notificare l'utente per apertura e chiusura ticket."
                                />
                                <div className="events-stack" style={{ marginTop: '16px' }}>
                                    <div className="event-item-v">
                                        <div className="event-info-v">
                                            <span className="event-name">Log Amministrazione</span>
                                            <p className="text-tiny" style={{ margin: 0 }}>Invia log nel canale dedicato.</p>
                                        </div>
                                        <div className="event-switches-v">
                                            <div className="switch-with-label">
                                                <span className="label-tiny">Apertura</span>
                                                <label className="toggle">
                                                    <input type="checkbox" checked={!!globalConfig?.logs?.log_onOpen} onChange={e => setGlobalNested('logs.log_onOpen', e.target.checked)} /> 
                                                    <span className="slider"></span>
                                                </label>
                                            </div>
                                            <div className="switch-with-label">
                                                <span className="label-tiny">Chiusura</span>
                                                <label className="toggle">
                                                    <input type="checkbox" checked={!!globalConfig?.logs?.log_onClose} onChange={e => setGlobalNested('logs.log_onClose', e.target.checked)} /> 
                                                    <span className="slider"></span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {/* TAB: Design & Messaggi */}
                {activeTab === 'personalization' && (
                    <div className="animate fade-in">
                        <section className="card section-card" style={{ marginBottom: '24px' }}>
                             <div className="align-center" style={{ marginBottom: '20px' }}>
                                <Palette size={18} color="var(--primary)" />
                                <h3>Branding Bottoni</h3>
                             </div>
                             <div className="buttons-config-grid">
                                {[
                                    { key: 'claim', label: 'Prendi in Carico' },
                                    { key: 'close', label: 'Chiudi Ticket' },
                                    { key: 'tag', label: 'Aggiorna Stato' }
                                ].map(btn => (
                                    <div key={btn.key} className="btn-config-card">
                                        <label className="label-tiny">{btn.label}</label>
                                        <div className="btn-inputs">
                                            <input className="input" value={config.buttons?.[btn.key]?.label || ''} onChange={e => setNested(`buttons.${btn.key}.label`, e.target.value)} placeholder="Testo..." />
                                            <div style={{ width: '60px' }}>
                                                <EmojiInput value={config.buttons?.[btn.key]?.emoji || ''} onChange={e => setNested(`buttons.${btn.key}.emoji`, e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="style-selector">
                                            {[
                                                { id: 'SUCCESS', label: 'Verde' },
                                                { id: 'DANGER', label: 'Rosso' },
                                                { id: 'PRIMARY', label: 'Blu' },
                                                { id: 'SECONDARY', label: 'Grigio' },
                                                { id: 'LINK', label: 'Link 🔗' }
                                            ].map(style => (
                                                <button 
                                                    key={style.id}
                                                    onClick={() => setNested(`buttons.${btn.key}.style`, style.id)}
                                                    className={`style-pill ${style.id} ${config.buttons?.[btn.key]?.style === style.id ? 'active' : ''}`}
                                                >
                                                    {style.label}
                                                </button>
                                            ))}
                                        </div>
                                        {config.buttons?.[btn.key]?.style === 'LINK' && (
                                            <div className="animate fade-in" style={{ marginTop: '12px' }}>
                                                <label className="label-tiny">URL del Link</label>
                                                <input className="input" value={config.buttons?.[btn.key]?.url || ''} onChange={e => setNested(`buttons.${btn.key}.url`, e.target.value)} placeholder="https://..." />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <EmbedMessageManager 
                            guildId={guildId}
                            module="tickets"
                            slugs={[
                                { key: 'panel', label: 'Pannello Apertura Ticket', description: 'Il messaggio principale con i bottoni o il menu per aprire un ticket.', variables: ['guild'], group: '1. Accesso', groupIcon: Play },
                                { key: 'ticket', label: 'Ticket Benvenuto (Generale)', description: 'Messaggio iniziale mandato dentro the ticket se non c\'è un messaggio specifico per categoria.', variables: ['user'], group: '2. Gestione', groupIcon: Ticket },
                                { key: 'success_open', label: 'Ticket Aperto', description: 'Risposta effimera al bottone di apertura ticket.', variables: ['user', 'ticketChannel'], group: '2. Gestione', groupIcon: Ticket },
                                { key: 'priority_select', label: 'Scelta Priorità', description: 'Messaggio che chiede la priorità all\'apertura.', variables: ['type'], group: '2. Gestione', groupIcon: Clock },
                                { key: 'quick_reply_menu', label: 'Menu Risposte Rapide', description: 'Pannello di selezione template per lo staff.', variables: [], group: '🛡️ Staff Tools', groupIcon: MessageSquare },
                                { key: 'tag_menu', label: 'Menu Tag/Protocolli', description: 'Pannello di selezione tag per lo staff.', variables: [], group: '🛡️ Staff Tools', groupIcon: Tag },
                                { key: 'staff_claimed', label: 'Ticket Preso in Carico', description: 'Messaggio inviato quando un membro dello staff clicca "Prendi in carico".', variables: ['staff'], group: '🛡️ Staff', groupIcon: Shield },
                                { key: 'status_updated', label: 'Stato Aggiornato', description: 'Messaggio che indica il cambio di stato del ticket (es. in attesa utente).', variables: ['user', 'status'], group: '2. Gestione', groupIcon: Tag },
                                { key: 'inactivity_close', label: 'Chiusura per Inattività', description: 'Messaggio inviato prima di chiudere un ticket inattivo.', variables: ['hours'], group: '🔒 Chiusura', groupIcon: Archive },
                                { key: 'close', label: 'Ticket Chiuso', description: 'Messaggio di conferma chiusura nel ticket prima dell\'archiviazione.', variables: ['user'], group: '🔒 Chiusura', groupIcon: Archive },
                                { key: 'close_status', label: 'Trascrizione Ticket', description: 'Messaggio finale inviato in DM all\'utente con il transcript del ticket.', variables: ['user', 'ticketId', 'transcriptUrl'], group: '🔒 Chiusura', groupIcon: FileText },
                                { key: 'staff_ticket_log', label: 'Log Ticket Staff', description: 'Log inviato nel canale log ticket quando un ticket viene chiuso.', variables: ['user', 'staff', 'ticketId'], group: '🛡️ Staff', groupIcon: Shield },
                                { key: 'already_exists', label: 'Ticket Esistente', description: 'Errore mostrato quando un utente ha già un ticket aperto.', variables: ['user', 'ticketChannel'], group: '🟥 Errori', groupIcon: XCircle },
                                { key: 'already_claimed', label: 'Ticket Già Preso', description: 'Errore mostrato quando un membro staff tenta di prendere un ticket già gestito.', variables: ['user'], group: '🟥 Errori', groupIcon: XCircle },
                                { key: 'cannot_close', label: 'Errore Chiusura (Generico)', description: 'Errore mostrato se il ticket non può essere chiuso.', variables: ['user'], group: '🟥 Errori', groupIcon: XCircle },
                                { key: 'close_error_logs', label: 'Errore Permessi Log', description: 'Errore mostrato se il bot non può scrivere nel canale log.', variables: ['channel', 'missing'], group: '🟥 Errori', groupIcon: XCircle },
                                { key: 'close_error_category', label: 'Errore Config Categoria', description: 'Errore mostrato se la categoria chiusi manca.', variables: [], group: '🟥 Errori', groupIcon: XCircle }
                            ]}
                            extraButtons={(slug) => {
                                if (slug === 'panel') {
                                    return Object.values(config.typesConfig || {}).map(cat => ({
                                        label: cat.label,
                                        emoji: cat.emoji,
                                        style: cat.style || 'PRIMARY',
                                        url: cat.url
                                    }));
                                }
                                if (slug === 'ticket') {
                                    return [
                                        { label: config.buttons?.claim?.label || 'Prendi in Carico', emoji: config.buttons?.claim?.emoji || '🙋‍♂️', style: config.buttons?.claim?.style || 'SUCCESS', url: config.buttons?.claim?.url },
                                        { label: config.buttons?.close?.label || 'Chiudi Ticket', emoji: config.buttons?.close?.emoji || '🔒', style: config.buttons?.close?.style || 'DANGER', url: config.buttons?.close?.url },
                                        { label: config.buttons?.tag?.label || 'Aggiorna Stato', emoji: config.buttons?.tag?.emoji || '🏷️', style: config.buttons?.tag?.style || 'SECONDARY', url: config.buttons?.tag?.url }
                                    ];
                                }
                                return null;
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
      </div>

        <style jsx>{`
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: rgba(255,255,255,0.02); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: rgba(129, 140, 248, 0.1); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }
            
            .tab-navigation { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px; padding: 6px; background: #070912; border-radius: 14px; border: 1px solid var(--border); width: fit-content; }
            .tab-link { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border: none; background: transparent; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; border-radius: 10px; cursor: pointer; transition: 0.2s; }
            .tab-link:hover { color: white; background: rgba(255,255,255,0.03); }
            .tab-link.active { color: white; background: var(--bg-card); box-shadow: var(--shadow-sm); border: 1px solid var(--border); }

            .config-grid { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
            .grid-left { display: flex; flex-direction: column; gap: 24px; }
            .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
            
            .fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .field-box { display: flex; flex-direction: column; gap: 8px; }
            
            .categories-stack { display: flex; flex-direction: column; gap: 16px; }
            .category-item { background: rgba(255,255,255,0.015); border-radius: 12px; border: 1px solid var(--border); overflow: visible; position: relative; transition: z-index 0s; }
            .category-item:focus-within { z-index: 100; }
            .category-main { display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: rgba(255,255,255,0.01); border-bottom: 1px solid var(--border); overflow: visible; }
            .category-drag { cursor: grab; }
            .category-emoji-picker { width: 44px; height: 44px; flex-shrink: 0; }
            .category-label { flex: 1; }
            .category-color { display: flex; flex-direction: column; align-items: center; gap: 4px; }
            .category-color input { width: 28px; height: 28px; border: none; border-radius: 6px; background: none; cursor: pointer; }
            .input-transparent { width: 100%; background: transparent; border: none; color: white; font-weight: 600; font-size: 1rem; padding: 4px 0; border-bottom: 1px solid transparent; }
            .input-transparent:focus { border-color: var(--primary); outline: none; }
            .category-details { padding: 16px 20px; background: rgba(0,0,0,0.1); overflow: visible; }
            .label-tiny { font-size: 0.65rem; text-transform: uppercase; color: var(--text-dim); font-weight: 800; margin-bottom: 4px; display: block; white-space: nowrap; }
            
            .event-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255,255,255,0.02); border-radius: 10px; border: 1px solid var(--border); margin-bottom: 8px; }
            .event-name { font-size: 0.85rem; font-weight: 600; }
            .event-actions { display: flex; gap: 12px; }
            .mini-check { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 700; cursor: pointer; }
            
            .buttons-config-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
            .btn-config-card { background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 14px; padding: 16px; }
            .btn-inputs { display: flex; gap: 10px; margin-bottom: 16px; }
            .style-selector { display: flex; gap: 6px; margin-top: 12px; }
            .style-pill { flex: 1; padding: 6px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: white; opacity: 0.25; transition: 0.2s; }
            .style-pill.active { opacity: 1; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
            .style-pill.SUCCESS { background: #248046; }
            .style-pill.DANGER { background: #da373c; }
            .style-pill.PRIMARY { background: #5865f2; }
            .style-pill.SECONDARY { background: #4f545c; }
            
            .style-selector-mini { display: flex; gap: 4px; }
            .style-pill-mini { width: 24px; height: 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 0.6rem; font-weight: 800; color: white; opacity: 0.3; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
            .style-pill-mini.active { opacity: 1; transform: scale(1.1); }
            .style-pill-mini.SUCCESS { background: #248046; }
            .style-pill-mini.DANGER { background: #da373c; }
            .style-pill-mini.PRIMARY { background: #5865f2; }
            .style-pill-mini.SECONDARY { background: #4f545c; }
            .style-pill-mini.LINK { background: #4f545c; position: relative; }
            .style-pill-mini.LINK::after { content: '🔗'; position: absolute; top: -5px; right: -5px; font-size: 0.5rem; }

            .preview-button { padding: 6px 12px; border-radius: 4px; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; justify-content: center; color: white; border: none; margin-right: 8px; }
            .preview-button.SUCCESS { background: #248046; }
            .preview-button.DANGER { background: #da373c; }
            .preview-button.PRIMARY { background: #5865f2; }
            .preview-button.SECONDARY, .preview-button.LINK { background: #4f545c; }

            .empty-state { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 48px; color: var(--text-dim); opacity: 0.5; }
            .align-center { display: flex; align-items: center; gap: 10px; }
            .flex-center-between { display: flex; align-items: center; justify-content: space-between; }
            
            .transcription-box { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 16px; border-radius: 12px; border: 1px solid var(--border); margin-top: 12px; }
            .event-item-v { display: flex; flex-direction: column; gap: 12px; padding: 16px; background: rgba(255,255,255,0.015); border-radius: 12px; border: 1px solid var(--border); margin-top: 12px; }
            .event-info-v { display: flex; flex-direction: column; }
            .event-switches-v { display: flex; gap: 20px; border-top: 1px solid var(--border); padding-top: 12px; }
            .switch-with-label { display: flex; align-items: center; gap: 10px; }
            
            @media (max-width: 1000px) { .config-grid { grid-template-columns: 1fr; } .fields-grid { grid-template-columns: 1fr; } }
        `}</style>
    </div>
  );
}
