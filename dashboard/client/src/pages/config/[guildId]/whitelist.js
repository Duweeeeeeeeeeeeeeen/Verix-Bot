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
  Volume2,
  AlertCircle,
  ExternalLink,
  Command
} from 'lucide-react';
import GuideSidebar from '../../../components/GuideSidebar';

export default function WhitelistConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [activeTab, setActiveTab] = useState('settings');
  const [activeEmbedKey, setActiveEmbedKey] = useState('panel');
  const [config, setConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingPanel, setSendingPanel] = useState(false);

  useEffect(() => {
    if (guildId) {
      Promise.all([
        api.request(`/config/${guildId}/whitelist`),
        api.request(`/config/${guildId}/discord-data`)
      ]).then(([data, discordRes]) => {
        setConfig(data.data || data);
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
      await api.request(`/config/${guildId}/whitelist`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast('Configurazione salvata!');
    } catch (error) {
       showToast('Errore durante il salvataggio.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendPanel = async () => {
    if (!config.panelChannelId) return showToast('Seleziona un canale!', 'error');
    setSendingPanel(true);
    try {
      await handleSave();
      await api.request(`/config/${guildId}/whitelist/send-panel`, {
        method: 'POST',
        body: JSON.stringify({ channelId: config.panelChannelId })
      });
      showToast('Pannello inviato correttamente!');
    } catch (error) {
       console.error(error);
    } finally {
      setSendingPanel(false);
    }
  };

  if (loading || !config) return (
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
    { key: 'panel', label: 'Pannello Iniziale', group: 'Whitelist' },
    { key: 'start', label: 'Apertura Ticket', group: 'Whitelist' },
    { key: 'question', label: 'Domanda Standard', group: 'Whitelist' },
    { key: 'review', label: 'Revisione Finale', group: 'Whitelist' },
    { key: 'dm_accepted', label: 'Accettato (DM)', group: 'Feedback' },
    { key: 'dm_rejected', label: 'Rifiutato (DM)', group: 'Feedback' },
    { key: 'dm_voice_rejected', label: 'Rifiutato Orale (DM)', group: 'Moduli Orale' },
    { key: 'voice_guide', label: 'Guida Staff (Vocale)', group: 'Moduli Orale' },
    { key: 'voice_waiting', label: 'Attesa (DM)', group: 'Moduli Orale' }
  ];

  const tabs = [
    { id: 'settings', name: 'Settaggi', icon: Settings2 },
    { id: 'questions', name: 'Domande', icon: ListChecks },
    { id: 'personalization', name: 'Design', icon: Palette },
    { id: 'voice', name: 'Vocale', icon: Mic2 },
  ];

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
              <button onClick={handleSendPanel} className="btn-outline" disabled={sendingPanel}>
                <Send size={16} /> Invia Panel
              </button>
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
                                    <input type="checkbox" checked={config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            
                            <div className="fields-grid" style={{ marginTop: '24px' }}>
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
                                <div className="field-box">
                                    <label className="text-label">Modalità</label>
                                    <select className="select" value={config.mode || 'TEXT'} onChange={e => setConfig({...config, mode: e.target.value})}>
                                        <option value="TEXT">📝 Solo Testuale</option>
                                        <option value="VOICE">🎤 Solo Vocale</option>
                                        <option value="HYBRID">⚖️ Ibrida (Orale + Scritto)</option>
                                    </select>
                                </div>
                            </div>
                        </section>

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
                                    <textarea className="input" style={{ minHeight: '80px' }} value={q.text} onChange={e => {
                                        const qs = [...config.questions];
                                        qs[idx].text = e.target.value;
                                        setConfig({...config, questions: qs});
                                    }} placeholder="Inserisci la domanda..." />
                                </div>
                                <div className="q-options">
                                    <input type="number" className="input" style={{ width: '80px' }} value={q.minLength} onChange={e => {
                                        const qs = [...config.questions];
                                        qs[idx].minLength = parseInt(e.target.value);
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
                            embed={config.embeds?.[activeEmbedKey] || {}} 
                            onChange={(data) => setNested(`embeds.${activeEmbedKey}`, data)}
                            variables={['user', 'guild', 'time_limit', 'total_questions', 'reason', 'app_id', 'recap']}
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
                                    <input type="checkbox" checked={config.voiceSettings?.pingStaffOnJoin} onChange={e => setNested('voiceSettings.pingStaffOnJoin', e.target.checked)} />
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
