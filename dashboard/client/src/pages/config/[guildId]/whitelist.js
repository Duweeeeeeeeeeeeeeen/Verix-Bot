import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
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
  MessageSquare
} from 'lucide-react';
import GuideSidebar from '../../../components/GuideSidebar';

export default function WhitelistConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [activeTab, setActiveTab] = useState('settings');
  const [activeEmbedKey, setActiveEmbedKey] = useState('panel');
  const [config, setConfig] = useState(null);
  const [bgConfig, setBgConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingPanel, setSendingPanel] = useState(false);
  const [sendingBgPanel, setSendingBgPanel] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
      Promise.all([
        api.request(`/config/${guildId}/whitelist`),
        api.request(`/config/${guildId}/background`),
        api.request(`/config/${guildId}/discord-data`)
      ]).then(([wlData, bgData, discordRes]) => {
        setConfig(wlData.data || wlData);
        setBgConfig(bgData.data || bgData);
        setChannels(discordRes?.data?.channels || discordRes?.channels || []);
        setRoles(discordRes?.data?.roles || discordRes?.roles || []);
        setLoading(false);
      }).catch(err => {
        console.error("Error loading admission data:", err);
        setLoading(false);
      });
    }
  }, [guildId, mounted]);

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
        })
      ]);
      showToast('Tutte le configurazioni salvate!');
    } catch (error) {
       showToast('Errore durante il salvataggio unificato.', 'error');
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

  if (!mounted || loading || !config) return (
    <Layout guildId={guildId}>
      <div className="animate">
        <Skeleton width="300px" height="40px" style={{ marginBottom: '40px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
             <Skeleton height="400px" />
             <Skeleton height="400px" />
        </div>
      </div>
    </Layout>
  );

  const embedOptions = [
    { key: 'panel', label: 'Panel Whitelist', group: 'Whitelist' },
    { key: 'start', label: 'Avvio Candidatura', group: 'Whitelist' },
    { key: 'question', label: 'Domanda Standard', group: 'Whitelist' },
    { key: 'review', label: 'Revisione Staff', group: 'Whitelist' },
    { key: 'dm_accepted', label: 'Accettato (DM)', group: 'Feedback WL' },
    { key: 'dm_rejected', label: 'Rifiutato (DM)', group: 'Feedback WL' },
    { key: 'bg.panel', label: 'Panel Background', group: 'Background' },
    { key: 'bg.instructions', label: 'Istruzioni Iniziali', group: 'Background' },
    { key: 'bg.dm_accepted', label: 'BG Approvato (DM)', group: 'Feedback BG' },
    { key: 'bg.dm_rejected', label: 'BG Respinto (DM)', group: 'Feedback BG' },
    { key: 'bg.staff_received', label: 'Task Staff (BG)', group: 'Staff Log' },
    { key: 'dm_voice_rejected', label: 'Rifiutato Orale (DM)', group: 'Moduli Orale' },
    { key: 'voice_guide', label: 'Guida Staff (Vocale)', group: 'Moduli Orale' },
    { key: 'voice_waiting', label: 'Attesa (DM)', group: 'Moduli Orale' },
    { key: 'bg.integrated_accepted', label: 'Dossier Approvato (Int)', group: 'Background' },
    { key: 'bg.integrated_rejected', label: 'Dossier Respinto (Int)', group: 'Background' }
  ];

  const tabs = [
    { id: 'settings', name: 'Settaggi', icon: Settings2 },
    { id: 'background', name: 'Background', icon: Command, modes: ['BG_ONLY', 'BG_TEXT', 'BG_VOICE', 'FULL'] },
    { id: 'questions', name: 'Domande', icon: ListChecks, modes: ['TEXT', 'HYBRID', 'BG_TEXT', 'FULL'] },
    { id: 'voice', name: 'Vocale', icon: Mic2, modes: ['VOICE', 'HYBRID', 'BG_VOICE', 'FULL'] },
    { id: 'messages', name: 'Messaggi', icon: MessageSquare },
    { id: 'personalization', name: 'Design', icon: Palette },
  ].filter(tab => !tab.modes || tab.modes.includes(config.mode));

  return (
    <Layout guildId={guildId}>
      <div className="animate">
        
        {/* Modern Compact Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <ShieldCheck size={24} />
              </div>
              <div className="header-text">
                <h1>Sistema Whitelist</h1>
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
                <div className="config-grid">
                    <div className="grid-left">
                        <section className="card section-card">
                            <div className="section-header">
                                <div className="align-center">
                                    <Power size={18} color="var(--primary)" />
                                    <h3>Core Configuration</h3>
                                </div>
                                <label className="toggle">
                                    <input type="checkbox" checked={!!config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                                    <span className="slider"></span>
                                </label>
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
                                    <div className="stylized-select-wrapper">
                                        <select className="select" value={config.mode || 'TEXT'} onChange={e => setConfig({...config, mode: e.target.value})}>
                                            <optgroup label="Solo Whitelist">
                                                <option value="TEXT">📝 Solo Scritta</option>
                                                <option value="VOICE">🎤 Solo Vocale</option>
                                                <option value="HYBRID">⚖️ Ibrida (Scritto + Orale)</option>
                                            </optgroup>
                                            <optgroup label="Con Background">
                                                <option value="BG_ONLY">📖 Solo Background</option>
                                                <option value="BG_TEXT">📚 Background + Scritta</option>
                                                <option value="BG_VOICE">🗣️ Background + Orale</option>
                                                <option value="FULL">🏆 Full Suite (BG + Scritto + Orale)</option>
                                            </optgroup>
                                        </select>
                                    </div>
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
                                    </div>
                                    <div className="fields-grid-v">
                                        <div className="field-box">
                                            <label className="text-label">Ruoli da Aggiungere (Prova Superata)</label>
                                            <DiscordSelector type="role" multiple={true} options={roles} value={config.rolesToAddOnTextPass || []} onChange={val => setConfig({...config, rolesToAddOnTextPass: val})} />
                                        </div>
                                        <div className="field-box" style={{ marginTop: '16px' }}>
                                            <label className="text-label">Ruoli da Rimuovere (Prova Superata)</label>
                                            <DiscordSelector type="role" multiple={true} options={roles} value={config.rolesToRemoveOnTextPass || []} onChange={val => setConfig({...config, rolesToRemoveOnTextPass: val})} />
                                        </div>
                                    </div>
                                </section>

                                <section className="card section-card" style={{ marginTop: '24px' }}>
                                    <div className="align-center" style={{ marginBottom: '20px' }}>
                                        <RefreshCcw size={18} color="var(--primary)" />
                                        <h3>Requisiti di Accesso (Flow)</h3>
                                    </div>
                                    <div className="fields-grid-v">
                                        <div className="toggle-box">
                                            <div className="flex-col">
                                                <span style={{ fontWeight: 600 }}>Obbligo Background</span>
                                                <p className="text-dim" style={{ fontSize: '0.75rem' }}>Il cittadino deve avere un Background approvato per iniziare la WL.</p>
                                            </div>
                                            <label className="toggle">
                                                <input type="checkbox" checked={!!config.flowRequirements?.requireBackground} onChange={e => setNested('flowRequirements.requireBackground', e.target.checked)} />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                        <div className="toggle-box" style={{ marginTop: '12px' }}>
                                            <div className="flex-col">
                                                <span style={{ fontWeight: 600 }}>Obbligo WL Scritta</span>
                                                <p className="text-dim" style={{ fontSize: '0.75rem' }}>Richiede il superamento del test scritto prima del colloquio orale.</p>
                                            </div>
                                            <label className="toggle">
                                                <input type="checkbox" checked={!!config.flowRequirements?.requireTextWL} onChange={e => setNested('flowRequirements.requireTextWL', e.target.checked)} />
                                                <span className="slider"></span>
                                            </label>
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
                            <p className="text-description" style={{ marginTop: '12px' }}>I membri con questi ruoli potranno gestire le pratiche.</p>
                        </section>

                        <div style={{ marginTop: '24px' }}>
                            <GuideSidebar type="whitelist" context={config} />
                        </div>
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
                                        <label className="text-label">Canale Pubblicazione Pannello</label>
                                        <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={bgConfig.panelChannelId || ''} onChange={val => setBgConfig({...bgConfig, panelChannelId: val})} />
                                        <p className="text-dim" style={{ fontSize: '0.72rem', marginTop: '4px' }}>Canale dove verrà inviato il messaggio per depositare i Background (se non integrato).</p>
                                    </div>
                                )}
                                <div className="field-box">
                                    <label className="text-label">Canale Valutazione Staffer</label>
                                    <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={bgConfig.logChannelId || ''} onChange={val => setBgConfig({...bgConfig, logChannelId: val})} />
                                    <p className="text-dim" style={{ fontSize: '0.72rem', marginTop: '4px' }}>Canale log dove lo staff riceve e valuta le storie inviate.</p>
                                </div>
                                <div className="field-box">
                                    <label className="text-label">Staffer autorizzati (Background)</label>
                                    <DiscordSelector type="role" multiple={true} options={roles} value={bgConfig.staffRoleIds || []} onChange={val => setBgConfig({...bgConfig, staffRoleIds: val})} />
                                    <p className="text-dim" style={{ fontSize: '0.72rem', marginTop: '4px' }}>I ruoli autorizzati a revisionare e gestire i dossier storie.</p>
                                </div>
                                <div className="field-box">
                                    <label className="text-label">Punto di Ingresso Background</label>
                                    <div className="stylized-select-wrapper">
                                        <select className="select" value={bgConfig.entryPoint || 'PANEL'} onChange={e => setBgConfig({...bgConfig, entryPoint: e.target.value})}>
                                            <option value="PANEL">📂 Pannello Dedicato (Canale BG)</option>
                                            <option value="INTEGRATED">🔀 Integrato nel Tasto Whitelist</option>
                                        </select>
                                    </div>
                                </div>
                                 {bgConfig.entryPoint !== 'INTEGRATED' && (
                                    <div className="field-box">
                                        <label className="text-label">Cooldown Rifiuto - Pannello (Ore)</label>
                                        <input type="number" className="input" value={bgConfig.cooldown || 24} onChange={e => setBgConfig({...bgConfig, cooldown: parseInt(e.target.value)})} />
                                        <p className="text-dim" style={{ fontSize: '0.72rem', marginTop: '4px' }}>Ore di attesa dopo un rifiuto per inviare un nuovo dossier dal canale BG.</p>
                                    </div>
                                )}
                                <div className="field-box">
                                    <label className="text-label">Cooldown post-Correzione Ticket (Ore)</label>
                                    <input type="number" className="input" value={bgConfig.correctionCooldown || 0} onChange={e => setBgConfig({...bgConfig, correctionCooldown: parseInt(e.target.value)})} />
                                    <p className="text-dim" style={{ fontSize: '0.72rem', marginTop: '4px' }}>Ore di attesa richieste se la storia viene respinta dentro un ticket Whitelist.</p>
                                </div>
                            </div>
                        </section>

                        <section className="card section-card" style={{ marginTop: '24px' }}>
                            <div className="align-center" style={{ marginBottom: '20px' }}>
                                <ShieldCheck size={18} color="var(--primary)" />
                                <h3>Automazioni Esito (Background)</h3>
                            </div>
                            <div className="fields-grid-v">
                                <div className="field-box">
                                    <label className="text-label">Ruoli da Aggiungere (Approvazione)</label>
                                    <DiscordSelector type="role" multiple={true} options={roles} value={bgConfig.rolesToAdd || []} onChange={val => setBgConfig({...bgConfig, rolesToAdd: val})} />
                                    <p className="text-dim" style={{ fontSize: '0.72rem', marginTop: '4px' }}>Assegnati automaticamente quando la storia viene approvata.</p>
                                </div>
                                <div className="field-box" style={{ marginTop: '16px' }}>
                                    <label className="text-label">Ruoli da Rimuovere (Approvazione)</label>
                                    <DiscordSelector type="role" multiple={true} options={roles} value={bgConfig.rolesToRemove || []} onChange={val => setBgConfig({...bgConfig, rolesToRemove: val})} />
                                    <p className="text-dim" style={{ fontSize: '0.72rem', marginTop: '4px' }}>Rimossi automaticamente quando la storia viene approvata.</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="grid-right">
                        <div className="card section-card">
                            <h3 className="sidebar-title align-center" style={{ marginBottom: '12px' }}><Info size={16} /> Info Modulo</h3>
                            <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                                <strong>Pannello Dedicato:</strong> Richiede l'invio fisico della storia in un canale separato.
                                <br/><br/>
                                <strong>Integrato:</strong> Se un utente clicca "Inizia Whitelist" e non ha ancora una storia approvata, il bot gli chiederà di caricarla nello stesso ticket prima di passare al test scritto.
                            </p>
                        </div>
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
                            <div key={idx} className="question-row">
                                <div className="q-badge">{idx + 1}</div>
                                <div className="q-input-p">
                                    <textarea className="input" style={{ minHeight: '80px' }} value={q.text || ''} onChange={e => {
                                        const qs = [...config.questions];
                                        qs[idx].text = e.target.value;
                                        setConfig({...config, questions: qs});
                                    }} placeholder="Inserisci la domanda..." />
                                </div>
                                <div className="q-options">
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

            {/* TAB: Personalization */}
            {activeTab === 'personalization' && (
                <div className="editor-layout-modern card">
                    <div className="editor-sidebar-minimal">
                        {embedOptions.map(opt => (
                            <button key={opt.key} onClick={() => setActiveEmbedKey(opt.key)} className={`editor-tab ${activeEmbedKey === opt.key ? 'active' : ''}`}>
                                <span>{opt.label}</span>
                                <ChevronRight size={14} />
                            </button>
                        ))}
                    </div>
                    <div className="editor-content-p">
                        <EmbedEditor 
                            embed={activeEmbedKey.startsWith('bg.') 
                                ? (bgConfig.embeds?.[activeEmbedKey.split('.')[1]] || {}) 
                                : (config.embeds?.[activeEmbedKey] || {})} 
                            onChange={(data) => {
                                if (activeEmbedKey.startsWith('bg.')) {
                                    const key = activeEmbedKey.split('.')[1];
                                    const newBg = { ...bgConfig };
                                    if (!newBg.embeds) newBg.embeds = {};
                                    newBg.embeds[key] = data;
                                    setBgConfig(newBg);
                                } else {
                                    setNested(`embeds.${activeEmbedKey}`, data);
                                }
                            }}
                            variables={activeEmbedKey.startsWith('bg.') 
                                ? ['user', 'guild', 'bg_link', 'bg_desc', 'bg_attachment', 'reason', 'staff', 'next_attempt']
                                : ['user', 'guild', 'time_limit', 'total_questions', 'reason', 'app_id', 'recap']}
                        />
                    </div>
                </div>
            )}

            {/* TAB: Voice */}
            {activeTab === 'voice' && (
                <div className="config-grid">
                    <div className="grid-left">
                        <section className="card section-card">
                            <div className="align-center" style={{ marginBottom: '24px' }}>
                                <Mic2 size={18} color="var(--primary)" />
                                <h3>Configurazione Vocale</h3>
                            </div>
                            <div className="fields-grid">
                                <div className="field-box">
                                    <label className="text-label">Canale di Attesa</label>
                                    <DiscordSelector type="channel" options={channels.filter(c => c.type === 2)} value={config.voiceSettings?.joinChannelId || ''} onChange={val => setNested('voiceSettings.joinChannelId', val)} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">Categoria Canali</label>
                                    <DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.voiceSettings?.categoryId || ''} onChange={val => setNested('voiceSettings.categoryId', val)} />
                                </div>
                            </div>
                        </section>

                        <section className="card section-card" style={{ marginTop: '24px' }}>
                            <div className="align-center" style={{ marginBottom: '24px' }}>
                                <ShieldCheck size={18} color="var(--primary)" />
                                <h3>Automazioni Esito</h3>
                            </div>
                            <div className="fields-grid-v">
                                <div className="field-box">
                                    <label className="text-label">Ruoli da Aggiungere (Accettato)</label>
                                    <DiscordSelector type="role" multiple={true} options={roles} value={config.voiceSettings?.rolesToAdd || []} onChange={val => setNested('voiceSettings.rolesToAdd', val)} />
                                </div>
                                <div className="field-box" style={{ marginTop: '16px' }}>
                                    <label className="text-label">Ruoli da Rimuovere (Accettato)</label>
                                    <DiscordSelector type="role" multiple={true} options={roles} value={config.voiceSettings?.rolesToRemove || []} onChange={val => setNested('voiceSettings.rolesToRemove', val)} />
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="grid-right">
                         <div className="card section-card">
                            <h3 className="section-title align-center" style={{ marginBottom: '16px' }}><BellRing size={16} /> Notifiche</h3>
                            <div className="toggle-box">
                                <span>Ping Staff al Join</span>
                                <label className="toggle">
                                    <input type="checkbox" checked={!!config.voiceSettings?.pingStaffOnJoin} onChange={e => setNested('voiceSettings.pingStaffOnJoin', e.target.checked)} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                         </div>

                         <div className="card section-card" style={{ marginTop: '24px' }}>
                            <h3 className="section-title align-center" style={{ marginBottom: '16px' }}><Clock size={16} /> Penalità</h3>
                            <div className="field-box">
                                <label className="text-label">Cooldown Rifiuto (Ore)</label>
                                <input type="number" className="input" value={config.voiceSettings?.rejectionCooldown || 0} onChange={e => setNested('voiceSettings.rejectionCooldown', parseInt(e.target.value) || 0)} />
                                <p className="text-dim" style={{ fontSize: '0.75rem', marginTop: '4px' }}>Tempo di attesa prima di poter ripetere il colloquio orale.</p>
                            </div>
                         </div>
                    </div>
                </div>
            )}

            {/* TAB: Messages */}
            {activeTab === 'messages' && (
                <div className="animate">
                    <EmbedMessageManager 
                        guildId={guildId}
                        module="whitelist"
                        slugs={[
                            { key: 'not_configured', label: 'Whitelist disattivata', description: 'Messaggio mostrato quando un utente tenta di iniziare ma il modulo è spento.', variables: ['guild'] },
                            { key: 'active_session', label: 'Sessione in corso', description: 'Mostrato se l\'utente ha già un ticket aperto.', variables: ['channelId'] },
                            { key: 'already_submitted', label: 'Dossier in sospeso', description: 'Mostrato se una candidatura è già stata inviata.', variables: ['guild'] },
                            { key: 'already_passed', label: 'Già Cittadino', description: 'Mostrato se l\'utente ha già il ruolo whitelist.', variables: ['guild'] },
                            { key: 'cooldown', label: 'Blocco Cooldown', description: 'Messaggio di attesa dopo un rifiuto.', variables: ['time'] },
                            { key: 'start_success', label: 'Accesso Consentito', description: 'Inviato quando il ticket viene creato con successo.', variables: ['channelId'] },
                            { key: 'session_completed', label: 'Riepilogo Finale', description: 'Embed inviato alla fine del modulo per confermare l\'invio.', variables: ['recap'] },
                            { key: 'min_length_error', label: 'Errore Caratteri', description: 'Mostrato quando una risposta è troppo breve.', variables: ['minLength'] },
                            { key: 'question', label: 'Inviata Domanda', description: 'Embed standard per le domande interattive.', variables: ['currentIndex', 'totalQuestions', 'question', 'timeLeft'] },
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
            .header-buttons { display: flex; gap: 12px; }
            
            .tab-navigation { display: flex; gap: 8px; margin-bottom: 32px; padding: 6px; background: #070912; border-radius: 14px; border: 1px solid var(--border); width: fit-content; }
            .tab-link { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border: none; background: transparent; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; border-radius: 10px; cursor: pointer; transition: 0.2s; }
            .tab-link:hover { color: white; background: rgba(255,255,255,0.03); }
            .tab-link.active { color: white; background: var(--bg-card); box-shadow: var(--shadow-sm); border: 1px solid var(--border); }

            .config-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; }
            .section-card { border-radius: 16px; }
            .section-header { display: flex; justify-content: space-between; align-items: center; }
            .section-header h3 { font-size: 1.1rem; }
            
            .fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .field-box { display: flex; flex-direction: column; gap: 6px; }
            
            .question-row { display: flex; align-items: flex-start; gap: 16px; padding: 16px; background: rgba(255,255,255,0.01); border-radius: 12px; border: 1px solid var(--border); margin-bottom: 12px; transition: 0.2s; }
            .question-row:hover { border-color: var(--primary); background: rgba(255,255,255,0.02); }
            .q-badge { width: 32px; height: 32px; background: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; flex-shrink: 0; }
            .q-input-p { flex: 1; }
            .q-options { display: flex; flex-direction: column; gap: 10px; }
            
            .btn-icon-danger { background: rgba(244, 63, 94, 0.1); border: none; color: var(--error); padding: 8px; border-radius: 8px; cursor: pointer; transition: 0.2s; }
            .btn-icon-danger:hover { background: var(--error); color: white; }

            .editor-layout-modern { display: grid; grid-template-columns: 240px 1fr; padding: 0 !important; border-radius: 16px; }
            .editor-sidebar-minimal { background: rgba(0,0,0,0.1); padding: 20px; border-right: 1px solid var(--border); display: flex; flex-direction: column; gap: 6px; }
            .editor-tab { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: transparent; border: 1px solid transparent; color: var(--text-muted); border-radius: 10px; cursor: pointer; text-align: left; transition: 0.2s; font-size: 0.85rem; font-weight: 600; }
            .editor-tab:hover { color: white; background: rgba(255,255,255,0.03); }
            .editor-tab.active { color: var(--primary); background: rgba(129, 140, 248, 0.05); border-color: rgba(129, 140, 248, 0.1); }
            .editor-content-p { padding: 32px; }

            .toggle-box { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid var(--border); font-size: 0.85rem; font-weight: 600; }
            .checklist-grid { display: flex; flex-direction: column; gap: 8px; }
            .checklist-row { display: flex; gap: 10px; }

            @media (max-width: 1100px) { .config-grid { grid-template-columns: 1fr; } .editor-layout-modern { grid-template-columns: 1fr; } .editor-sidebar-minimal { border-right: none; border-bottom: 1px solid var(--border); } }
        `}</style>
      </div>
    </Layout>
  );
}
