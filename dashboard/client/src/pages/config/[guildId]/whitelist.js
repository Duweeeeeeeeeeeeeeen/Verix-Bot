import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import EmbedEditor from '../../../components/EmbedEditor';
import EmbedMessageManager from '../../../components/EmbedMessageManager';
import DiscordSelector from '../../../components/DiscordSelector';
import api from '../../../utils/api';
import { 
  Save, 
  Send, 
  Users, 
  Settings2, 
  ListChecks, 
  Palette, 
  Plus, 
  Trash2, 
  RefreshCcw, 
  Power, 
  Clock, 
  ShieldCheck, 
  Target, 
  BellRing,
  Type,
  Hash,
  MousePointer2,
  ChevronRight,
  Info,
  Mic2,
  Lock,
  Volume2,
  AlertCircle,
  ExternalLink,
  Command,
  MessageSquare,
  Play,
  HelpCircle,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import EmojiInput from '../../../components/EmojiInput';
import CustomSelect from '../../../components/CustomSelect';
import { mergeConfig } from '../../../utils/defaults';

export default function WhitelistConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [activeTab, setActiveTab] = useState('settings');
  const [config, setConfig] = useState(null);
  const [bgConfig, setBgConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingPanel, setSendingPanel] = useState(false);
  const [sendingBgPanel, setSendingBgPanel] = useState(false);
  const [messages, setMessages] = useState({});
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.request(`/messages/${guildId}/whitelist`);
      setMessages(res.data || res || {});
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (guildId && mounted) {
      fetchMessages();
      Promise.all([
        api.request(`/config/${guildId}/whitelist`),
        api.request(`/config/${guildId}/background`),
        api.request(`/config/${guildId}/discord-data`)
      ]).then(([wlData, bgData, discordRes]) => {
        const finalConfig = mergeConfig(wlData.data || wlData, 'whitelist');
        const finalBgConfig = mergeConfig(bgData.data || bgData, 'background');
        
        setConfig(finalConfig);
        setBgConfig(finalBgConfig);
        setChannels(discordRes?.data?.channels || discordRes?.channels || []);
        setRoles(discordRes?.data?.roles || discordRes?.roles || []);
        setLoading(false);
      }).catch(err => {
        console.error("Error loading admission data:", err);
        setLoading(false);
      });
    }
  }, [guildId, mounted]);

  useEffect(() => {
    if (config) {
      window.dispatchEvent(new CustomEvent('update-guide-context', { detail: config }));
    }
  }, [config]);

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

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        api.request(`/config/${guildId}/whitelist`, {
          method: 'POST',
          body: JSON.stringify(config)
        }),
        api.request(`/config/${guildId}/background`, {
          method: 'POST',
          body: JSON.stringify(bgConfig)
        }),
        api.request(`/messages/${guildId}/whitelist`, {
          method: 'POST',
          body: JSON.stringify(messages)
        })
      ]);
      showToast('Configurazioni salvate con successo!');
    } catch (error) {
       showToast('Errore durante il salvataggio.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendPanel = async () => {
    if (!config.panelChannelId) return showToast('Seleziona un canale per la Whitelist!', 'error');
    setSendingPanel(true);
    try {
      await handleSave();
      await api.request(`/config/${guildId}/whitelist/send-panel`, {
        method: 'POST',
        body: JSON.stringify({ channelId: config.panelChannelId })
      });
      showToast('Pannello Whitelist inviato!');
    } catch (error) {
       console.error(error);
    } finally {
      setSendingPanel(false);
    }
  };

  const handleSendBgPanel = async () => {
    if (!bgConfig.panelChannelId) return showToast('Seleziona un canale per il Background!', 'error');
    setSendingBgPanel(true);
    try {
      await handleSave();
      await api.request(`/config/${guildId}/background/send-panel`, {
        method: 'POST',
        body: JSON.stringify({ channelId: bgConfig.panelChannelId })
      });
      showToast('Pannello Background inviato!');
    } catch (error) {
       console.error(error);
    } finally {
      setSendingBgPanel(false);
    }
  };

  if (!mounted || loading || !config) return <Skeleton type="config" />;

  const tabs = [
    { id: 'settings', name: 'Settaggi', icon: Settings2 },
    { id: 'background', name: 'Background', icon: Command, modes: ['BG_ONLY', 'BG_TEXT', 'BG_VOICE', 'FULL'] },
    { id: 'questions', name: 'Domande', icon: ListChecks, modes: ['TEXT', 'HYBRID', 'BG_TEXT', 'FULL'] },
    { id: 'voice', name: 'Vocale', icon: Mic2, modes: ['VOICE', 'HYBRID', 'BG_VOICE', 'FULL'] },
    { id: 'personalization', name: 'Design & Messaggi', icon: Palette },
  ].filter(tab => !tab.modes || tab.modes.includes(config.mode));

  return (
    <div className="config-page-layout">
      <div className="config-main-col">
        <div className="animate">
        
        {/* Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <ShieldCheck size={24} />
              </div>
              <div className="header-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h1>Sistema Whitelist</h1>
                  <label className="toggle-mini" title={config.enabled ? 'Modulo Attivo' : 'Modulo Disattivato'}>
                    <input type="checkbox" checked={!!config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                    <span className="slider-mini"></span>
                  </label>
                </div>
                <p>Gestisci l'accesso dei cittadini al tuo universo RP.</p>
              </div>
           </div>
           <div className="header-buttons">
              {activeTab === 'background' ? (
                bgConfig.entryPoint !== 'INTEGRATED' && (
                  <button onClick={handleSendBgPanel} className="btn-outline" disabled={sendingBgPanel}>
                     <Send size={16} /> Invia Panel BG
                  </button>
                )
              ) : config.mode !== 'BG_ONLY' && (
                <button onClick={handleSendPanel} className="btn-outline" disabled={sendingPanel}>
                   <Send size={16} /> Invia Panel WL
                </button>
              )}
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Salvataggio...' : 'Salva'}
              </button>
           </div>
        </header>

        {/* Tab Navigation */}
        <div className="tab-navigation">
            {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-link ${activeTab === tab.id ? 'active' : ''}`}>
                        <Icon size={16} />
                        <span>{tab.name}</span>
                    </button>
                );
            })}
        </div>

        <div className="tab-panel animate">
            
            {/* TAB: Settings */}
            {activeTab === 'settings' && (
                <div className="config-grid">
                    <div className="grid-left">
                        <section className="card section-card">
                            <div className="section-header">
                                <div className="align-center">
                                    <Power size={18} color="var(--primary)" />
                                    <h3>Core Configuration</h3>
                                </div>
                            </div>
                            
                             <div className="fields-grid" style={{ marginTop: '24px' }}>
                                {config.mode !== 'BG_ONLY' && (
                                    <>
                                        <div className="field-box">
                                            <label className="text-label">Canale Pannello</label>
                                            <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.panelChannelId || ''} onChange={val => setConfig({...config, panelChannelId: val})} />
                                        </div>
                                        <div className="field-box">
                                            <label className="text-label">Categoria Ticket</label>
                                            <DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.categoryOpenId || ''} onChange={val => setConfig({...config, categoryOpenId: val})} />
                                        </div>
                                        <div className="field-box">
                                            <label className="text-label">Log Channel</label>
                                            <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.logChannelId || ''} onChange={val => setConfig({...config, logChannelId: val})} />
                                        </div>
                                    </>
                                )}
                                <div className="field-box">
                                    <label className="text-label">Modalità Percorso</label>
                                    <CustomSelect 
                                        options={[
                                            { value: 'TEXT', label: '📝 Solo Scritta' },
                                            { value: 'VOICE', label: '🎤 Solo Vocale' },
                                            { value: 'HYBRID', label: '⚖️ Ibrida (Scritto + Orale)' },
                                            { value: 'BG_ONLY', label: '📖 Solo Background' },
                                            { value: 'BG_TEXT', label: '📚 Background + Scritta' },
                                            { value: 'BG_VOICE', label: '🗣️ Background + Orale' },
                                            { value: 'FULL', label: '🏆 Full Suite (BG + Scritto + Orale)' }
                                        ]} 
                                        value={config.mode || 'TEXT'} 
                                        onChange={val => setConfig({...config, mode: val})} 
                                    />
                                </div>
                            </div>
                        </section>

                        {config.mode !== 'BG_ONLY' && (
                            <>
                                <section className="card section-card" style={{ marginTop: '24px' }}>
                                    <div className="align-center" style={{ marginBottom: '20px' }}>
                                        <Clock size={18} color="var(--primary)" />
                                        <h3>Limiti & Tempi</h3>
                                    </div>
                                    <div className="fields-grid">
                                        <div className="field-box">
                                            <label className="text-label">Durata Test (Min)</label>
                                            <input type="number" className="input" value={config.timeLimit || 30} onChange={e => setConfig({...config, timeLimit: parseInt(e.target.value)})} />
                                        </div>
                                        <div className="field-box">
                                            <label className="text-label">Cooldown Fallimento (Ore)</label>
                                            <input type="number" className="input" value={config.cooldown || 24} onChange={e => setConfig({...config, cooldown: parseInt(e.target.value)})} />
                                        </div>
                                    </div>
                                </section>

                                <section className="card section-card" style={{ marginTop: '24px' }}>
                                    <div className="align-center" style={{ marginBottom: '20px' }}>
                                        <ShieldCheck size={18} color="var(--primary)" />
                                        <h3>Automazioni Fase Scritta</h3>
                                        <HelpTooltip text="Ruoli assegnati o rimossi al termine della fase testuale." />
                                    </div>
                                    <div className="fields-grid">
                                        <div className="field-box">
                                            <label className="text-label">Ruoli da Aggiungere</label>
                                            <DiscordSelector type="role" multiple={true} options={roles} value={config.rolesToAddOnTextPass || []} onChange={val => setConfig({...config, rolesToAddOnTextPass: val})} />
                                        </div>
                                        <div className="field-box">
                                            <label className="text-label">Ruoli da Rimuovere</label>
                                            <DiscordSelector type="role" multiple={true} options={roles} value={config.rolesToRemoveOnTextPass || []} onChange={val => setConfig({...config, rolesToRemoveOnTextPass: val})} />
                                        </div>
                                    </div>
                                </section>
                            </>
                        )}
                    </div>

                    <div className="grid-right">
                        <section className="card section-card">
                            <h3 className="sidebar-title align-center" style={{ marginBottom: '16px' }}><Users size={18} /> Staff Roles</h3>
                            <DiscordSelector type="role" multiple={true} options={roles} value={config.staffRoleIds || []} onChange={val => setConfig({...config, staffRoleIds: val})} />
                            <p className="text-description" style={{ marginTop: '12px' }}>Ruoli che possono vedere i ticket e valutare le pratiche.</p>
                        </section>
                    </div>
                </div>
            )}

            {/* TAB: Background */}
            {activeTab === 'background' && (
                <div className="config-grid">
                    <div className="grid-left">
                        <section className="card section-card">
                            <div className="section-header">
                                <div className="align-center">
                                    <Command size={18} color="var(--primary)" />
                                    <h3>Configurazione Background</h3>
                                </div>
                                <label className="toggle">
                                    <input type="checkbox" checked={!!bgConfig.enabled} onChange={e => setBgConfig({...bgConfig, enabled: e.target.checked})} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            
                            <div className="fields-grid" style={{ marginTop: '24px' }}>
                                {bgConfig.entryPoint !== 'INTEGRATED' && (
                                    <div className="field-box">
                                        <label className="text-label">Canale Pannello BG</label>
                                        <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={bgConfig.panelChannelId || ''} onChange={val => setBgConfig({...bgConfig, panelChannelId: val})} />
                                    </div>
                                )}
                                <div className="field-box">
                                    <label className="text-label">Canale Log Background</label>
                                    <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={bgConfig.logChannelId || ''} onChange={val => setBgConfig({...bgConfig, logChannelId: val})} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">Punto di Ingresso</label>
                                    <CustomSelect 
                                        options={[
                                            { value: 'PANEL', label: '📂 Pannello Dedicato' },
                                            { value: 'INTEGRATED', label: '🔀 Integrato Whitelist' }
                                        ]} 
                                        value={bgConfig.entryPoint || 'PANEL'} 
                                        onChange={val => setBgConfig({...bgConfig, entryPoint: val})} 
                                    />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">Staffer Background</label>
                                    <DiscordSelector type="role" multiple={true} options={roles} value={bgConfig.staffRoleIds || []} onChange={val => setBgConfig({...bgConfig, staffRoleIds: val})} />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            )}

            {/* TAB: Voice (Vocale) */}
            {activeTab === 'voice' && (
                <div className="config-grid">
                    <div className="grid-left">
                        <section className="card section-card">
                            <div className="section-header">
                                <div className="align-center">
                                    <Mic2 size={18} color="var(--primary)" />
                                    <h3>Configurazione Colloquio Orale</h3>
                                </div>
                                <label className="toggle">
                                    <input type="checkbox" checked={!config.voiceSettings?.paused} onChange={e => setNested('voiceSettings.paused', !e.target.checked)} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            
                            <div className="fields-grid" style={{ marginTop: '24px' }}>
                                <div className="field-box">
                                    <label className="text-label">Canale Sala d'Attesa</label>
                                    <DiscordSelector type="channel" options={channels.filter(c => c.type === 2)} value={config.voiceSettings?.joinChannelId || ''} onChange={val => setNested('voiceSettings.joinChannelId', val)} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">Categoria Stanze Private</label>
                                    <DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.voiceSettings?.categoryId || ''} onChange={val => setNested('voiceSettings.categoryId', val)} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">Cooldown Rifiuto (Ore)</label>
                                    <input type="number" className="input" value={config.voiceSettings?.rejectionCooldown || 24} onChange={e => setNested('voiceSettings.rejectionCooldown', parseInt(e.target.value))} />
                                </div>
                                <div className="field-box" style={{ gridColumn: 'span 2' }}>
                                    <label className="text-label flex-between">
                                        Template Nome Canale
                                        <HelpTooltip text="Placeholders: {user}, {id}, {count} (es: whitelist-[#1])" />
                                    </label>
                                    <input 
                                        type="text" 
                                        className="input" 
                                        placeholder="es: wl-{user}" 
                                        value={config.voiceSettings?.channelNameTemplate || ''} 
                                        onChange={e => setNested('voiceSettings.channelNameTemplate', e.target.value)} 
                                    />
                                </div>
                                <div className="field-box" style={{ gridColumn: 'span 2' }}>
                                    <div className="alert-box" style={{ background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
                                        <div className="flex-between w-full">
                                            <div className="align-center">
                                                <Hash size={16} color="var(--primary)" />
                                                <span>Contatore Sessioni: <strong>{config.voiceSettings?.sessionCounter || 0}</strong></span>
                                            </div>
                                            <button 
                                                className="btn-outline-sm" 
                                                onClick={() => {
                                                    if(confirm('Sei sicuro di voler resettare il contatore a 0?')) {
                                                        setNested('voiceSettings.sessionCounter', 0);
                                                    }
                                                }}
                                            >
                                                <RefreshCcw size={14} /> Reset
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="toggle-list" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div className="toggle-box">
                                    <div className="flex-col">
                                        <span style={{ fontWeight: 600 }}>Cancellazione Automatica</span>
                                        <p className="text-dim" style={{ fontSize: '0.75rem' }}>Elimina la stanza al termine.</p>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" checked={!!config.voiceSettings?.autoDelete} onChange={e => setNested('voiceSettings.autoDelete', e.target.checked)} />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="toggle-box">
                                    <div className="flex-col">
                                        <span style={{ fontWeight: 600 }}>Notifica Staff all'Ingresso</span>
                                        <p className="text-dim" style={{ fontSize: '0.75rem' }}>Invia un alert nel log staff.</p>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" checked={!!config.voiceSettings?.pingStaffOnJoin} onChange={e => setNested('voiceSettings.pingStaffOnJoin', e.target.checked)} />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>
                        </section>

                        <section className="card section-card" style={{ marginTop: '24px' }}>
                            <div className="align-center" style={{ marginBottom: '20px' }}>
                                <ShieldCheck size={18} color="var(--primary)" />
                                <h3>Premi & Automazioni (Promosso Orale)</h3>
                            </div>
                            <div className="fields-grid">
                                <div className="field-box">
                                    <label className="text-label">Ruoli da Aggiungere</label>
                                    <DiscordSelector type="role" multiple={true} options={roles} value={config.voiceSettings?.rolesToAdd || []} onChange={val => setNested('voiceSettings.rolesToAdd', val)} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">Ruoli da Rimuovere</label>
                                    <DiscordSelector type="role" multiple={true} options={roles} value={config.voiceSettings?.rolesToRemove || []} onChange={val => setNested('voiceSettings.rolesToRemove', val)} />
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="grid-right">
                        <section className="card section-card">
                            <h3 className="sidebar-title align-center" style={{ marginBottom: '16px' }}><Users size={18} /> Staffers Orale</h3>
                            <DiscordSelector type="role" multiple={true} options={roles} value={config.voiceSettings?.staffRoleIds || []} onChange={val => setNested('voiceSettings.staffRoleIds', val)} />
                        </section>
                    </div>
                </div>
            )}

            {/* TAB: Questions */}
            {activeTab === 'questions' && (
                <div className="card section-card">
                    <div className="section-header">
                        <div>
                            <h3>Banca Domande</h3>
                            <p className="text-muted">Verranno estratte {config.questionsPerSession} domande casuali.</p>
                        </div>
                        <button onClick={() => setConfig({...config, questions: [{ text: '', minLength: 20 }, ...(config.questions || [])]})} className="btn-primary">
                            <Plus size={16} /> Aggiungi
                        </button>
                    </div>

                    <div className="questions-container" style={{ marginTop: '24px' }}>
                        {config.questions?.map((q, idx) => (
                            <div key={idx} className="question-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'flex-start' }}>
                                <div className="q-badge">{idx + 1}</div>
                                <div style={{ flex: 1 }}>
                                    <textarea className="input" rows="3" value={q.text || ''} onChange={e => {
                                        const qs = [...config.questions];
                                        qs[idx].text = e.target.value;
                                        setConfig({...config, questions: qs});
                                    }} placeholder="Inserisci la domanda..." />
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input type="number" className="input" style={{ width: '80px' }} value={q.minLength || 0} onChange={e => {
                                        const qs = [...config.questions];
                                        qs[idx].minLength = parseInt(e.target.value) || 0;
                                        setConfig({...config, questions: qs});
                                    }} />
                                    <button onClick={() => setConfig({...config, questions: config.questions.filter((_, i) => i !== idx)})} className="btn-icon-danger">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB: Design */}
            {activeTab === 'personalization' && (
                <div className="animate fade-in">
                    <section className="card section-card" style={{ marginBottom: '24px' }}>
                        <div className="section-header">
                            <div className="align-center">
                                <Palette size={18} color="var(--primary)" />
                                <h3>Branding & Colori</h3>
                            </div>
                        </div>
                        <div className="fields-grid" style={{ marginTop: '16px' }}>
                            <div className="field-box">
                                <label className="text-label">Colore Primario (Embed)</label>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <input type="color" value={messages.panel?.color || '#6366f1'} onChange={e => setMessages({...messages, panel: { ...messages.panel, color: e.target.value }})} style={{ width: '40px', height: '40px', border: '1px solid var(--border)', borderRadius: '6px' }} />
                                    <input type="text" className="input" value={messages.panel?.color || ''} onChange={e => setMessages({...messages, panel: { ...messages.panel, color: e.target.value }})} placeholder="#HEX" />
                                </div>
                            </div>
                            <div className="field-box">
                                <label className="text-label">Colore Successo</label>
                                <input type="color" value={config.colors?.success || '#2ecc71'} onChange={e => setNested('colors.success', e.target.value)} />
                            </div>
                        </div>
                    </section>

                    <EmbedMessageManager 
                        guildId={guildId}
                        module="whitelist"
                        slugs={[
                            { key: 'panel', label: 'Pannello Whitelist', description: 'Messaggio nel canale WL.', variables: ['guild'], group: '1. Accesso', groupIcon: Play },
                            { key: 'start', label: 'Avvio Candidatura', description: 'DM iniziale.', variables: ['user', 'time_limit'], group: '2. Colloquio', groupIcon: Play },
                            { key: 'question', label: 'Domanda Standard', description: 'Format domande.', variables: ['text', 'count', 'total'], group: '2. Colloquio', groupIcon: Play },
                            { key: 'review', label: 'Review Finale', description: 'Riepilogo pre-invio.', variables: ['user'], group: '2. Colloquio', groupIcon: Play },
                            { key: 'session_completed', label: 'Sessione Completata', description: 'DM fine domande.', variables: ['user'], group: '3. Fine', groupIcon: CheckCircle2 },
                            { key: 'submission_confirmed', label: 'Ricevuta Ufficiale', description: 'Conferma ricezione.', variables: ['user'], group: '3. Fine', groupIcon: CheckCircle2 },
                            { key: 'staff_received', label: 'Log Staff', description: 'Messaggio per i selezionatori.', variables: ['user', 'age', 'about'], group: '🛡️ Staff', groupIcon: ShieldCheck },
                            { key: 'dm_accepted', label: 'Esito Positivo', description: 'DM accettazione.', variables: ['user'], group: '✅ Esito', groupIcon: CheckCircle2 },
                            { key: 'dm_rejected', label: 'Esito Negativo', description: 'DM rifiuto scritto.', variables: ['user', 'reason'], group: '🟥 Esito', groupIcon: XCircle },
                            { key: 'dm_text_pass', label: 'Scritto Superato', description: 'DM idoneo orale.', variables: ['user'], group: '✅ Esito', groupIcon: CheckCircle2 },
                            { key: 'dm_voice_rejected', label: 'Bocciato Orale', description: 'DM rifiuto orale.', variables: ['user', 'reason'], group: '🟥 Esito', groupIcon: XCircle },
                            { key: 'voice_waiting', label: 'Sala d\'Attesa', description: 'DM utente in attesa.', variables: ['user'], group: '🎙️ Voce', groupIcon: Play },
                            { key: 'voice_guide', label: 'Guida Staff', description: 'Messaggio per lo staffer.', variables: ['user', 'start_time'], group: '🎙️ Voce', groupIcon: Mic2 },
                            { key: 'cooldown', label: 'In Cooldown', description: 'Errore tempo.', variables: ['time'], group: '🟥 Errori', groupIcon: XCircle }
                        ]}
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
          
          .tab-navigation { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px; padding: 6px; background: #070912; border-radius: 14px; border: 1px solid var(--border); }
          .tab-link { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border: none; background: transparent; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; border-radius: 10px; cursor: pointer; transition: 0.2s; }
          .tab-link:hover { color: white; background: rgba(255,255,255,0.03); }
          .tab-link.active { color: white; background: var(--bg-card); box-shadow: var(--shadow-sm); border: 1px solid var(--border); }

          .config-grid { display: grid; grid-template-columns: 1fr 300px; gap: 24px; }
          .grid-left { display: flex; flex-direction: column; gap: 24px; }
          .section-header { display: flex; justify-content: space-between; align-items: center; }
          
          .fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .field-box { display: flex; flex-direction: column; gap: 8px; }
          
          .toggle-box { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid var(--border); }
          .flex-col { display: flex; flex-direction: column; }
          
          .q-badge { width: 32px; height: 32px; background: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; fontWeight: bold; flex-shrink: 0; }
          
          .align-center { display: flex; align-items: center; gap: 10px; }
          @media (max-width: 1000px) { .config-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
