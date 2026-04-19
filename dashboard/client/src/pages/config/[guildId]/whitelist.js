import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import EmbedEditor from '../../../components/EmbedEditor';
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
  Volume2
} from 'lucide-react';

export default function WhitelistConfig() {
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

  useEffect(() => {
    if (guildId) {
      Promise.all([
        api.request(`/config/${guildId}/whitelist`),
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
        console.error("Error loading whitelist data:", err);
        setLoading(false);
      });
    }
  }, [guildId]);

  const setNested = (path, value) => {
    const newConfig = { ...config };
    const parts = path.split('.');
    let cur = newConfig;
    for (let i = 0; i < parts.length - 1; i++) {
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
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
    setGlobalConfig(newGlobal);
  };

  const updateButton = (index, field, value) => {
    const buttons = [...globalConfig.ui.whitelistButtons];
    buttons[index] = { ...buttons[index], [field]: value };
    setGlobalNested('ui.whitelistButtons', buttons);
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
        api.request(`/config/${guildId}/global`, {
          method: 'POST',
          body: JSON.stringify(globalConfig)
        })
      ]);
      showToast('Configurazione salvata con successo!');
    } catch (error) {
       showToast('Errore durante il salvataggio.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendPanel = async () => {
    if (!config.panelChannelId) return showToast('Seleziona un canale per il pannello!', 'error');
    
    setSendingPanel(true);
    try {
      // First, save the current configuration to ensure the backend has the latest data
      await handleSave();
      
      await api.request(`/config/${guildId}/whitelist/send-panel`, {
        method: 'POST',
        body: JSON.stringify({ channelId: config.panelChannelId })
      });
      showToast('Pannello Whitelist inviato correttamente!');
    } catch (error) {
       console.error("Error sending panel:", error);
    } finally {
      setSendingPanel(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Sei sicuro di voler resettare tutte le impostazioni Whitelist?')) return;
    try {
        await api.request(`/config/${guildId}/reset/whitelist`, { method: 'POST' });
        window.location.reload();
    } catch (error) {}
  };

  if (loading || !config) return (
    <Layout guildId={guildId}>
      <div className="animate">
        <Skeleton width="400px" height="40px" style={{ marginBottom: '40px' }} />
        <Skeleton height="600px" style={{ borderRadius: '24px' }} />
      </div>
    </Layout>
  );

  const embedOptions = [
    { key: 'panel', label: 'Pannello Iniziale' },
    { key: 'start', label: 'Benvenuto (Apertura)' },
    { key: 'question', label: 'Domanda Standard' },
    { key: 'error_min_length', label: 'Errore Lunghezza Minima' },
    { key: 'timeout', label: 'Sessione Scaduta (Timeout)' },
    { key: 'review', label: 'Revisione (Fine)' },
    { key: 'dm_submitted', label: 'DM Sottomissione (Utente)' },
    { key: 'dm_accepted', label: 'DM Accettazione (Utente)' },
    { key: 'dm_rejected', label: 'DM Rifiuto (Utente)' },
    { key: 'staff_received', label: 'Staff: Nuova Pratica' },
    { key: 'staff_accepted', label: 'Staff: Pratica Accettata' },
    { key: 'staff_rejected', label: 'Staff: Pratica Rifiutata' },
  ];

  const tabs = [
    { id: 'settings', name: 'Impostazioni Generali', icon: Settings2 },
    { id: 'questions', name: 'Gestione Domande', icon: ListChecks },
    { id: 'voice', name: 'Colloquio Vocale', icon: Mic2 },
    { id: 'personalization', name: 'Embed & Bottoni', icon: Palette },
  ];

  // Mapping embeds to buttons for integrated editing
  // Improved to be case-insensitive and support multiple legacy IDs
  const getButtonsForEmbed = (key) => {
    if (!globalConfig?.ui?.whitelistButtons) return [];
    
    const findIndexByPartialId = (idPart) => 
        globalConfig.ui.whitelistButtons.findIndex(b => b.customId.toLowerCase().includes(idPart.toLowerCase()));

    if (key === 'panel') {
        const idx = findIndexByPartialId('apply') !== -1 ? findIndexByPartialId('apply') : findIndexByPartialId('start_wl');
        return idx !== -1 ? [idx] : [];
    }
    
    if (key === 'review') {
        const confirmIdx = findIndexByPartialId('confirm');
        const cancelIdx = findIndexByPartialId('cancel');
        const res = [];
        if (confirmIdx !== -1) res.push(confirmIdx);
        if (cancelIdx !== -1) res.push(cancelIdx);
        return res;
    }
    return [];
  };

   return (
    <Layout guildId={guildId}>
      <div className="animate">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-1.5px' }}>Whitelist System</h1>
            <p className="text-description" style={{ fontSize: '1.1rem' }}>Configura il flusso di ingresso al tuo server.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleSendPanel} className="btn-outline" disabled={sendingPanel}><Send size={18} /> Invia Pannello</button>
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
                                    <p className="text-description">{config.enabled ? 'La whitelist è attiva e aperta.' : 'La whitelist è attualmente chiusa.'}</p>
                                </div>
                            </div>
                            <label className="toggle">
                                <input type="checkbox" checked={config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                                <span className="slider"></span>
                            </label>
                        </section>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <section className="card glass">
                                <h3 className="align-center" style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '800' }}><Target size={20} color="var(--primary)" /> Canali Principali</h3>
                                <div className="input-group" style={{ marginBottom: '20px' }}><label className="text-label">Canale Pannello</label><DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.panelChannelId || ''} onChange={val => setConfig({...config, panelChannelId: val})} /></div>
                                <div className="input-group" style={{ marginBottom: '20px' }}><label className="text-label">Categoria Canali Aperti</label><DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.categoryOpenId || ''} onChange={val => setConfig({...config, categoryOpenId: val})} /></div>
                                <div className="input-group"><label className="text-label">Canale Log</label><DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.logChannelId || ''} onChange={val => setConfig({...config, logChannelId: val})} /></div>
                            </section>
                            <section className="card glass">
                                <h3 className="align-center" style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '800' }}><Users size={20} color="var(--primary)" /> Ruoli & Permessi</h3>
                                <div className="input-group" style={{ marginBottom: '20px' }}><label className="text-label">Ruolo Staff Whitelist</label><DiscordSelector type="role" multiple={true} options={roles} value={config.staffRoleIds || []} onChange={val => setConfig({...config, staffRoleIds: val})} /></div>
                                <div className="input-group"><label className="text-label">Modalità Operativa</label>
                                    <select className="input select" value={config.mode || 'TEXT'} onChange={e => setConfig({...config, mode: e.target.value})}>
                                        <option value="TEXT">Solo Testuale</option>
                                        <option value="VOICE">Solo Vocale</option>
                                        <option value="HYBRID">Ibrida (Test + Vocale)</option>
                                    </select>
                                </div>
                            </section>
                        </div>

                        <section className="card glass">
                            <h3 className="align-center" style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '800' }}><Clock size={20} color="var(--primary)" /> Limiti & Sessione</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                <div><label className="text-label">Domande per Sessione</label><input type="number" className="input" value={config.questionsPerSession || 10} onChange={e => setConfig({...config, questionsPerSession: parseInt(e.target.value)})} /></div>
                                <div><label className="text-label">Durata Sessione (Minuti)</label><input type="number" className="input" value={config.timeLimit || 30} onChange={e => setConfig({...config, timeLimit: parseInt(e.target.value)})} /></div>
                            </div>
                        </section>
                    </div>

                    <aside className="sidebar-settings">
                        <section className="card glass">
                             <h3 className="align-center" style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '800' }}><ShieldCheck size={20} color="var(--primary)" /> Restrizioni</h3>
                              <div className="input-group" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                 <div className="align-center" style={{ gap: '10px' }}>
                                    <ShieldCheck size={18} color="var(--primary)" />
                                    <span style={{ fontWeight: '600' }}>Abilita Cooldown</span>
                                 </div>
                                 <label className="toggle">
                                    <input type="checkbox" checked={config.cooldownEnabled} onChange={e => setConfig({...config, cooldownEnabled: e.target.checked})} />
                                    <span className="slider"></span>
                                 </label>
                              </div>
                              {config.cooldownEnabled && (<div style={{ marginTop: '10px' }}><label className="text-label">Ore di Attesa</label><input type="number" className="input" value={config.cooldown || 24} onChange={e => setConfig({...config, cooldown: parseInt(e.target.value)})} /></div>)}
                        </section>

                        <section className="card glass" style={{ marginTop: '24px' }}>
                             <h3 className="align-center" style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '800' }}><BellRing size={20} color="var(--primary)" /> Notifiche Admin</h3>
                             <div style={{ display: 'grid', gap: '10px' }}>
                                {['onSubmit', 'onAccept', 'onReject'].map(ev => (
                                    <div key={ev} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{ev.replace('on', '')}</span>
                                         <div style={{ display: 'flex', gap: '15px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>DM</span>
                                                <label className="toggle" style={{ transform: 'scale(0.7)' }}>
                                                    <input type="checkbox" checked={globalConfig.notifications[`whitelist_${ev}`]?.dm} onChange={e => setGlobalNested(`notifications.whitelist_${ev}.dm`, e.target.checked)} />
                                                    <span className="slider"></span>
                                                </label>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Log</span>
                                                <label className="toggle" style={{ transform: 'scale(0.7)' }}>
                                                    <input type="checkbox" checked={globalConfig.logs[`log_${ev}`]} onChange={e => setGlobalNested(`logs.log_${ev}`, e.target.checked)} />
                                                    <span className="slider"></span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </section>
                    </aside>
                </div>
            )}

            {activeTab === 'questions' && (
                <div className="card glass animate fade-in">
                    {config.mode === 'VOICE' && (
                        <div className="card glass" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid var(--error)', padding: '15px', marginBottom: '30px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <Info size={20} color="var(--error)" />
                            <p style={{ fontSize: '0.9rem' }}><b>Attenzione:</b> La modalità operativa è impostata su <b>Solo Vocale</b>. Le domande qui sotto verranno ignorate dal bot.</p>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Banca Dati Domande</h3>
                            <p className="text-description">Le domande vengono pescate casualmente per ogni sessione.</p>
                        </div>
                        <button onClick={() => setConfig({...config, questions: [{ text: '', minLength: 20 }, ...(config.questions || [])]})} className="btn-primary"><Plus size={20} /> Aggiungi Domanda</button>
                    </div>

                    <div style={{ display: 'grid', gap: '16px' }}>
                        {config.questions?.map((q, idx) => (
                            <div key={idx} className="question-item glass shadow-glow">
                                <div style={{ flex: 1, display: 'flex', gap: '20px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem', flexShrink: 0 }}>{idx + 1}</div>
                                    <div style={{ flex: 1 }}>
                                        <textarea className="input" placeholder="Testo della domanda..." value={q.text} onChange={e => {
                                            const qs = [...config.questions];
                                            qs[idx].text = e.target.value;
                                            setConfig({...config, questions: qs});
                                        }} rows={2} style={{ marginBottom: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }} />
                                        <div className="align-center" style={{ gap: '20px' }}>
                                            <div className="align-center"><Clock size={14} color="var(--text-dim)" /><span className="text-label" style={{ marginBottom: 0 }}>Min. Caratteri:</span><input type="number" className="input" style={{ width: '80px', padding: '8px' }} value={q.minLength} onChange={e => {
                                                const qs = [...config.questions];
                                                qs[idx].minLength = parseInt(e.target.value);
                                                setConfig({...config, questions: qs});
                                            }} /></div>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setConfig({...config, questions: config.questions.filter((_, i) => i !== idx)})} style={{ color: 'var(--error)', background: 'rgba(239,68,68,0.1)', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}><Trash2 size={20} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'voice' && (
                <div className="animate fade-in">
                    {config.mode === 'TEXT' && (
                        <div className="card glass" style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid var(--primary)', padding: '15px', marginBottom: '30px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <Info size={20} color="var(--primary)" />
                            <p style={{ fontSize: '0.9rem' }}><b>Nota:</b> La modalità operativa è impostata su <b>Solo Testuale</b>. Il sistema vocale è attualmente disattivato.</p>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '30px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            {/* Flow Requirements Section */}
                            <section className="card glass shadow-glow">
                                <div className="align-center" style={{ marginBottom: '24px' }}>
                                    <Lock size={22} color="var(--primary)" />
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Requisiti di Flusso (Propedeuticità)</h3>
                                </div>
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    <div className="status-card-small">
                                        <div>
                                            <span style={{ fontWeight: '700', display: 'block' }}>Richiedi Whitelist Testuale</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>L'utente deve aver superato il test scritto prima di accedere al vocale.</span>
                                        </div>
                                        <label className="toggle">
                                            <input type="checkbox" checked={config.flowRequirements?.requireTextWL} onChange={e => setNested('flowRequirements.requireTextWL', e.target.checked)} />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </section>

                            <section className="card glass">
                                <div className="align-center" style={{ marginBottom: '24px' }}>
                                    <Volume2 size={22} color="var(--primary)" />
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Canali & Limiti Vocali</h3>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="input-group">
                                        <label className="text-label">Canale di Attesa (Join)</label>
                                        <DiscordSelector type="channel" options={channels.filter(c => c.type === 2)} value={config.voiceSettings?.joinChannelId || ''} onChange={val => setNested('voiceSettings.joinChannelId', val)} />
                                    </div>
                                    <div className="input-group">
                                        <label className="text-label">Categoria Canali Temporanei</label>
                                        <DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.voiceSettings?.categoryId || ''} onChange={val => setNested('voiceSettings.categoryId', val)} />
                                    </div>
                                    <div className="input-group">
                                        <label className="text-label">Sessioni Contemporanee</label>
                                        <input type="number" className="input" value={config.voiceSettings?.maxConcurrent || 1} onChange={e => setNested('voiceSettings.maxConcurrent', parseInt(e.target.value))} />
                                    </div>
                                    <div className="input-group">
                                        <label className="text-label">Cooldown tra Code (Minuti)</label>
                                        <input type="number" className="input" value={config.voiceSettings?.queueCooldown || 5} onChange={e => setNested('voiceSettings.queueCooldown', parseInt(e.target.value))} />
                                    </div>
                                </div>
                            </section>
                        </div>

                        <aside>
                             <section className="card glass" style={{ marginBottom: '20px' }}>
                                <h4 className="align-center" style={{ marginBottom: '15px' }}><ShieldCheck size={18} color="var(--primary)" /> Staff Vocale</h4>
                                <div className="input-group">
                                    <label className="text-label">Ruoli Abilitati</label>
                                    <DiscordSelector type="role" multiple={true} options={roles} value={config.voiceSettings?.staffRoleIds || []} onChange={val => setNested('voiceSettings.staffRoleIds', val)} />
                                    <p className="text-description" style={{ fontSize: '0.75rem', marginTop: '10px' }}>Se vuoto, eredita i ruoli staff generali della whitelist.</p>
                                </div>
                             </section>

                             <section className="card glass">
                                <h4 className="align-center" style={{ marginBottom: '15px' }}><BellRing size={18} color="var(--primary)" /> Notifiche Vocali</h4>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    <div className="status-card-small" style={{ padding: '12px' }}>
                                        <span style={{ fontSize: '0.85rem' }}>Tagga Staff su Join</span>
                                        <label className="toggle" style={{ transform: 'scale(0.8)' }}>
                                            <input type="checkbox" checked={config.voiceSettings?.pingStaffOnJoin} onChange={e => setNested('voiceSettings.pingStaffOnJoin', e.target.checked)} />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                    <div className="status-card-small" style={{ padding: '12px' }}>
                                        <span style={{ fontSize: '0.85rem' }}>Auto-Cancella Canale</span>
                                        <label className="toggle" style={{ transform: 'scale(0.8)' }}>
                                            <input type="checkbox" checked={config.voiceSettings?.autoDelete} onChange={e => setNested('voiceSettings.autoDelete', e.target.checked)} />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                             </section>
                        </aside>
                    </div>
                </div>
            )}

            {activeTab === 'personalization' && (
                <div className="personalization-container animate fade-in">
                    <section className="card glass" style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <div>
                                <h3 className="align-center" style={{ fontSize: '1.4rem', fontWeight: '800' }}>< Palette size={22} color="var(--primary)" /> Contenuti Messaggi (Embed)</h3>
                                <p className="text-description">Scegli quale messaggio personalizzare dal menu a destra.</p>
                            </div>
                            <select className="input select" style={{ width: '300px' }} value={activeEmbedKey} onChange={e => setActiveEmbedKey(e.target.value)}>
                                {embedOptions.map(opt => (
                                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="editor-with-preview">
                            <div className="editor-side">
                                <EmbedEditor 
                                    embed={config.embeds?.[activeEmbedKey] || {}} 
                                    onChange={(data) => setConfig({
                                        ...config,
                                        embeds: { ...(config.embeds || {}), [activeEmbedKey]: data }
                                    })}
                                    variables={['user', 'guild', 'time_limit', 'total_questions', 'reason', 'app_id', 'questions']}
                                />

                                {/* Integrated Buttons Section */}
                                {getButtonsForEmbed(activeEmbedKey).length > 0 && (
                                    <div style={{ marginTop: '30px', padding: '24px', background: 'rgba(0,229,255,0.03)', borderRadius: '20px', border: '1px solid var(--primary-glow)' }}>
                                        <h4 className="align-center" style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '800' }}><MousePointer2 size={18} /> Bottoni Collegati</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                                            {getButtonsForEmbed(activeEmbedKey).map(btnIdx => {
                                                if (btnIdx === -1) return null;
                                                const btn = globalConfig.ui.whitelistButtons[btnIdx];
                                                return (
                                                    <div key={btn.customId} className="btn-config-card glass shadow-glow">
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                            <span className="badge" style={{ fontSize: '0.6rem' }}>{btn.customId}</span>
                                                            {/* Hidden checkbox for mandatory buttons */}
                                                            {['apply', 'start', 'confirm', 'cancel', 'accept', 'reject'].some(k => btn.customId.toLowerCase().includes(k)) ? (
                                                                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)' }}>Obbligatorio</span>
                                                            ) : (
                                                                <input type="checkbox" checked={btn.enabled} onChange={e => updateButton(btnIdx, 'enabled', e.target.checked)} />
                                                            )}
                                                        </div>
                                                            <div style={{ display: 'grid', gap: '10px' }}>
                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                    <input className="input" style={{ flex: 1 }} value={btn.label} onChange={e => updateButton(btnIdx, 'label', e.target.value)} placeholder="Etichetta" />
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
                                                                        onChange={e => updateButton(btnIdx, 'emoji', e.target.value)} 
                                                                        placeholder="🚀" 
                                                                    />
                                                                </div>
                                                                <select className="input select" style={{ fontSize: '0.8rem', padding: '10px' }} value={btn.style} onChange={e => updateButton(btnIdx, 'style', e.target.value)}>
                                                                    <option value="PRIMARY">Blu (Primario)</option>
                                                                    <option value="SUCCESS">Verde (Successo)</option>
                                                                    <option value="DANGER">Rosso (Pericolo)</option>
                                                                    <option value="SECONDARY">Grigio (Secondario)</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>

        <style jsx>{`
            .tab-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; border: none; background: transparent; color: var(--text-dim); font-weight: 700; cursor: pointer; border-radius: 14px; transition: 0.3s; }
            .tab-btn:hover { color: white; background: rgba(255,255,255,0.03); }
            .tab-btn.active { background: var(--primary); color: white; box-shadow: 0 4px 15px var(--primary-glow); }
            .settings-grid { display: grid; grid-template-columns: 1fr 300px; gap: 30px; }
            .question-item { display: flex; align-items: flex-start; gap: 20px; padding: 20px; border-radius: 18px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); transition: 0.3s; }
            .question-item:hover { border-color: var(--primary-glow); background: rgba(255,255,255,0.04); }
            .btn-config-card { background: rgba(0,0,0,0.3); border: 1px solid var(--border); padding: 16px; border-radius: 14px; }
            .badge { background: rgba(var(--primary-rgb), 0.1); color: var(--primary); padding: 4px 8px; border-radius: 6px; }
            .shadow-glow { box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.1); }
            .status-card-small { display: flex; justify-content: space-between; align-items: center; padding: 18px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid var(--border); }
            .btn-icon-delete { background: rgba(239,68,68,0.1); border: none; color: var(--error); padding: 8px; border-radius: 8px; cursor: pointer; transition: 0.2s; }
            .btn-icon-delete:hover { background: var(--error); color: white; }
            @media (max-width: 1100px) { .settings-grid { grid-template-columns: 1fr; } }
        `}</style>
      </div>
    </Layout>
  );
}
