import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import { EmbedEditor } from '../../../components/LazyConfigComponents';
import { EmbedMessageManager } from '../../../components/LazyConfigComponents';
import { DiscordSelector } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
  Save, Send, Users, Settings2, ListChecks, Palette, Plus, Trash2, RefreshCcw, Power, Clock, 
  ShieldCheck, Target, BellRing, Type, Hash, MousePointer2, ChevronRight, Info, Mic2, Lock, 
  Volume2, AlertCircle, ExternalLink, Command, MessageSquare, Play, HelpCircle, CheckCircle2, 
  XCircle, FileText, Trash, ChevronLeft, Zap, Layout, Sparkles, Layers, Award
} from 'lucide-react';
import EmojiInput from '../../../components/EmojiInput';
import CustomSelect from '../../../components/CustomSelect';
import { NotificationSettings } from '../../../components/LazyConfigComponents';
import { mergeConfig } from '../../../utils/defaults';
import Head from 'next/head';

export default function WhitelistConfig() {
  const { t } = useT();
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    if (!guildId || !mounted) return;
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [wlData, bgData, discordRes, msgRes] = await Promise.all([
        api.request(`/config/${guildId}/whitelist`),
        api.request(`/config/${guildId}/background`),
        api.request(`/config/${guildId}/discord-data`),
        api.request(`/messages/${guildId}/whitelist`).catch(() => ({}))
      ]);
      
      setConfig(mergeConfig(wlData.data || wlData, 'whitelist'));
      setBgConfig(mergeConfig(bgData.data || bgData, 'background'));
      setChannels(discordRes?.data?.channels || discordRes?.channels || []);
      setRoles(discordRes?.data?.roles || discordRes?.roles || []);
      setMessages(msgRes.data || msgRes || {});
    } catch (err) {
      console.error("Admission data load error:", err);
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
      await Promise.all([
        api.request(`/config/${guildId}/whitelist`, { method: 'POST', body: JSON.stringify(config) }),
        api.request(`/config/${guildId}/background`, { method: 'POST', body: JSON.stringify(bgConfig) }),
        api.request(`/messages/${guildId}/whitelist`, { method: 'POST', body: JSON.stringify(messages) })
      ]);
      showToast("Configurazione whitelist salvata!");
    } catch (error) {
       showToast("Errore durante il salvataggio", 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleSendPanel = async () => {
    if (!config.panelChannelId) return showToast("Seleziona un canale per il panel", 'error');
    setSendingPanel(true);
    try {
      await handleSave();
      await api.request(`/config/${guildId}/whitelist/send-panel`, { method: 'POST', body: JSON.stringify({ channelId: config.panelChannelId }) });
      showToast("Panel Whitelist inviato!");
    } catch (error) { console.error(error); } 
    finally { setSendingPanel(false); }
  };

  const handleSendBgPanel = async () => {
    if (!bgConfig.panelChannelId) return showToast("Seleziona un canale per il panel provini", 'error');
    setSendingBgPanel(true);
    try {
      await handleSave();
      await api.request(`/config/${guildId}/background/send-panel`, { method: 'POST', body: JSON.stringify({ channelId: bgConfig.panelChannelId }) });
      showToast("Panel Provini inviato!");
    } catch (error) { console.error(error); }
    finally { setSendingBgPanel(false); }
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  const tabs = [
    { id: 'settings', name: 'Configurazione', icon: Settings2 },
    { id: 'background', name: 'Provini Staff', icon: Command, modes: ['BG_ONLY', 'BG_TEXT', 'BG_VOICE', 'FULL'] },
    { id: 'questions', name: 'Domande Scritte', icon: ListChecks, modes: ['TEXT', 'HYBRID', 'BG_TEXT', 'FULL'] },
    { id: 'voice', name: 'Sistema Orale', icon: Mic2, modes: ['VOICE', 'HYBRID', 'BG_VOICE', 'FULL'] },
    { id: 'design', name: 'Design Studio', icon: Palette },
  ].filter(tab => !tab.modes || tab.modes.includes(config.mode));

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>Whitelist & Admissioni | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    <ShieldCheck size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>Whitelist & Admissioni</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? 'SISTEMA ADMISSIONI ATTIVO' : 'SISTEMA DISABILITATO'}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <button 
                  className={`pc-status-toggle-v2 ${config.enabled ? 'active' : ''}`}
                  onClick={() => setConfig({...config, enabled: !config.enabled})}
                >
                  <Power size={18} />
                  <span>{config.enabled ? 'Disattiva' : 'Attiva'}</span>
                </button>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? 'Salvataggio...' : 'Salva Modifiche'}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-container-v2" style={{ marginBottom: '40px' }}>
            <div className="pc-tabs-v2">
                {tabs.map(tab => (
                    <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
                        <tab.icon size={16} /> <span>{tab.name}</span>
                    </button>
                ))}
            </div>
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'settings' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}><Zap size={18} /></div>
                                <h3 style={{ margin: 0 }}>Struttura dell'Ammissione</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>Metodo di Selezione</label>
                                        <CustomSelect 
                                            options={[
                                                { value: 'TEXT', label: 'Solo Test Scritto' },
                                                { value: 'VOICE', label: 'Solo Orale Staff' },
                                                { value: 'HYBRID', label: 'Ibrido (Scritto + Orale)' },
                                                { value: 'BG_ONLY', label: 'Solo Provini Staff' },
                                                { value: 'BG_TEXT', label: 'Provini Staff + Scritto' },
                                                { value: 'FULL', label: 'Full Ecosystem' }
                                            ]} 
                                            value={config.mode || 'TEXT'} 
                                            onChange={val => setConfig({...config, mode: val})} 
                                        />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Canale Log Esiti</label>
                                        <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.logChannelId || ''} onChange={val => setConfig({...config, logChannelId: val})} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Canale del Panel</label>
                                        <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.panelChannelId || ''} onChange={val => setConfig({...config, panelChannelId: val})} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Categoria Stanza Esami</label>
                                        <DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.categoryOpenId || ''} onChange={val => setConfig({...config, categoryOpenId: val})} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: '#fffbeb', color: '#d97706' }}><Clock size={18} /></div>
                                <h3 style={{ margin: 0 }}>Vincoli Temporali</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>Tempo Scadenza Test (Min)</label>
                                        <div className="pc-input-wrapper-v2" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px' }}>
                                            <Clock size={16} style={{ marginLeft: '16px', color: '#94a3b8' }} />
                                            <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '14px 16px', fontWeight: 800, outline: 'none' }} value={config.timeLimit || 30} onChange={e => setConfig({...config, timeLimit: parseInt(e.target.value)})} />
                                        </div>
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Cooldown tra tentativi (Ore)</label>
                                        <div className="pc-input-wrapper-v2" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px' }}>
                                            <RefreshCcw size={16} style={{ marginLeft: '16px', color: '#94a3b8' }} />
                                            <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '14px 16px', fontWeight: 800, outline: 'none' }} value={config.cooldown || 24} onChange={e => setConfig({...config, cooldown: parseInt(e.target.value)})} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><Award size={18} /></div>
                                <h3 style={{ margin: 0 }}>Automazione Premi & Ruoli</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>Ruoli da Assegnare (Passato)</label>
                                        <DiscordSelector type="role" multiple={true} options={roles} value={config.rolesToAddOnTextPass || []} onChange={val => setConfig({...config, rolesToAddOnTextPass: val})} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Ruoli da Rimuovere (Passato)</label>
                                        <DiscordSelector type="role" multiple={true} options={roles} value={config.rolesToRemoveOnTextPass || []} onChange={val => setConfig({...config, rolesToRemoveOnTextPass: val})} />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: '#f0f9ff', color: '#0ea5e9' }}><Users size={18} /></div>
                                <h3 style={{ margin: 0 }}>Team Valutatori</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>Staff Whitelist Autorizzato</label>
                                    <DiscordSelector type="role" multiple={true} options={roles} value={config.staffRoleIds || []} onChange={val => setConfig({...config, staffRoleIds: val})} />
                                    <div style={{ marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 700, lineHeight: 1.5 }}>Questi ruoli avranno i permessi per gestire i ticket di ammissione.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <NotificationSettings 
                            guildId={guildId}
                            value={config.notifications}
                            onChange={val => setConfig({...config, notifications: val})}
                            title="Notifiche Log Ammissioni"
                        />

                        <button className="pc-btn-primary" style={{ width: '100%', background: '#f5f3ff', color: '#7c3aed', border: '1.5px solid #ddd6fe', boxShadow: 'none', justifyContent: 'center' }} onClick={handleSendPanel} disabled={sendingPanel}>
                            <Send size={18} />
                            <span>{sendingPanel ? 'Invio in corso...' : 'Invia Panel Whitelist'}</span>
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'background' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: '#fffbeb', color: '#d97706' }}><Command size={18} /></div>
                                <div className="v-stack" style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>Reclutamento Staff (Provini)</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Crea un percorso di ingresso dedicato per i nuovi membri del team.</p>
                                </div>
                                <label className="pc-toggle-v2 mini">
                                    <input type="checkbox" checked={!!bgConfig.enabled} onChange={e => setBgConfig({...bgConfig, enabled: e.target.checked})} />
                                    <span className="pc-slider-v2"></span>
                                </label>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>Logistica Ingresso</label>
                                        <CustomSelect 
                                            options={[
                                                { value: 'PANEL', label: 'Panel Separato' },
                                                { value: 'INTEGRATED', label: 'Unificato in Whitelist' }
                                            ]} 
                                            value={bgConfig.entryPoint || 'PANEL'} 
                                            onChange={val => setBgConfig({...bgConfig, entryPoint: val})} 
                                        />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Canale Log Staff</label>
                                        <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={bgConfig.logChannelId || ''} onChange={val => setBgConfig({...bgConfig, logChannelId: val})} />
                                    </div>
                                    {bgConfig.entryPoint === 'PANEL' && (
                                        <div className="pc-input-group-v2" style={{ gridColumn: 'span 2' }}>
                                            <label>Canale Pubblicazione Panel Provini</label>
                                            <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={bgConfig.panelChannelId || ''} onChange={val => setBgConfig({...bgConfig, panelChannelId: val})} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: '#fdf2f8', color: '#db2777' }}><ShieldCheck size={18} /></div>
                                <h3 style={{ margin: 0 }}>Team Selezionatori</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>Ruoli Staff Recruiters</label>
                                    <DiscordSelector type="role" multiple={true} options={roles} value={bgConfig.staffRoleIds || []} onChange={val => setBgConfig({...bgConfig, staffRoleIds: val})} />
                                </div>
                            </div>
                        </section>
                        <button className="pc-btn-primary" style={{ width: '100%', background: '#fffbeb', color: '#d97706', border: '1.5px solid #fde68a', boxShadow: 'none', justifyContent: 'center' }} onClick={handleSendBgPanel} disabled={sendingBgPanel}>
                            <Send size={18} />
                            <span>{sendingBgPanel ? 'Invio in corso...' : 'Invia Panel Provini'}</span>
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'questions' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}><ListChecks size={18} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>Banca Domande Scritte</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Le domande verranno pescate casualmente per ogni nuovo candidato.</p>
                            </div>
                            <button className="pc-btn-primary mini-v2" onClick={() => setConfig({...config, questions: [{ text: '', minLength: 30 }, ...(config.questions || [])]})}>
                                <Plus size={16} /> <span>Aggiungi Domanda</span>
                            </button>
                        </div>
                        <div className="card-body-v2">
                            <div className="v-stack" style={{ gap: '20px' }}>
                                {(config.questions || []).map((q, idx) => (
                                    <div key={idx} className="pc-question-slot-v2" style={{ display: 'flex', gap: '24px', background: '#f8fafc', padding: '28px', borderRadius: '28px', border: '1.5px solid #e2e8f0', position: 'relative' }}>
                                        <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '12px', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#7c3aed', flexShrink: 0, fontFamily: 'Outfit' }}>{idx + 1}</div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div className="pc-input-group-v2">
                                                <label>Testo della Domanda</label>
                                                <textarea 
                                                    style={{ width: '100%', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '16px', fontWeight: 700, color: '#1e293b', outline: 'none', resize: 'none', minHeight: '80px' }}
                                                    value={q.text || ''} 
                                                    onChange={e => {
                                                        const qs = [...config.questions];
                                                        qs[idx].text = e.target.value;
                                                        setConfig({...config, questions: qs});
                                                    }} 
                                                    placeholder="Inserisci la domanda per il candidato..." 
                                                />
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1.5px dashed #e2e8f0' }}>
                                                <div className="pc-input-group-v2">
                                                    <label>Caratteri Minimi Risposta</label>
                                                    <input 
                                                        type="number" 
                                                        style={{ width: '120px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', fontWeight: 800, textAlign: 'center' }}
                                                        value={q.minLength || 0} 
                                                        onChange={e => {
                                                            const qs = [...config.questions];
                                                            qs[idx].minLength = parseInt(e.target.value) || 0;
                                                            setConfig({...config, questions: qs});
                                                        }} 
                                                    />
                                                </div>
                                                <button style={{ width: '40px', height: '40px', background: '#fff1f2', color: '#ef4444', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setConfig({...config, questions: config.questions.filter((_, i) => i !== idx)})}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(config.questions || []).length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
                                        <FileText size={56} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
                                        <p style={{ fontWeight: 800 }}>Nessuna domanda configurata nella banca dati.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'voice' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: '#f0f9ff', color: '#0ea5e9' }}><Mic2 size={18} /></div>
                                <div className="v-stack" style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>Coda Colloqui (Voice Waiting)</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Gestisci il sistema di attesa vocale per i colloqui orali.</p>
                                </div>
                                <label className="pc-toggle-v2 mini">
                                    <input type="checkbox" checked={!config.voiceSettings?.paused} onChange={e => setNested('voiceSettings.paused', !e.target.checked)} />
                                    <span className="pc-slider-v2"></span>
                                </label>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>Canale Vocale Attesa</label>
                                        <DiscordSelector type="channel" options={channels.filter(c => c.type === 2)} value={config.voiceSettings?.joinChannelId || ''} onChange={val => setNested('voiceSettings.joinChannelId', val)} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Categoria Stanza Colloquio</label>
                                        <DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.voiceSettings?.categoryId || ''} onChange={val => setNested('voiceSettings.categoryId', val)} />
                                    </div>
                                    <div className="pc-input-group-v2" style={{ gridColumn: 'span 2' }}>
                                        <label>Naming Stanza Colloquio</label>
                                        <div className="pc-input-wrapper-v2" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px' }}>
                                            <Type size={16} style={{ marginLeft: '16px', color: '#94a3b8' }} />
                                            <input style={{ width: '100%', border: 'none', background: 'transparent', padding: '14px 16px', fontWeight: 800, outline: 'none' }} placeholder="es: colloquio-{user}" value={config.voiceSettings?.channelNameTemplate || ''} onChange={e => setNested('voiceSettings.channelNameTemplate', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2">
                             <div className="card-header-v2">
                                 <div className="header-icon" style={{ background: '#f1f5f9', color: '#475569' }}><Settings2 size={18} /></div>
                                 <h3 style={{ margin: 0 }}>Automazione Voice</h3>
                             </div>
                             <div className="card-body-v2">
                                 <div className="v-stack" style={{ gap: '20px' }}>
                                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                         <div className="v-stack">
                                             <strong style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1e293b' }}>Auto-Termina</strong>
                                             <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 650 }}>Elimina stanza all'uscita</span>
                                         </div>
                                         <label className="pc-toggle-v2 mini">
                                            <input type="checkbox" checked={!!config.voiceSettings?.autoDelete} onChange={e => setNested('voiceSettings.autoDelete', e.target.checked)} />
                                            <span className="pc-slider-v2"></span>
                                         </label>
                                     </div>
                                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                         <div className="v-stack">
                                             <strong style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1e293b' }}>Notifica Staff</strong>
                                             <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 650 }}>Ping staff all'ingresso utente</span>
                                         </div>
                                         <label className="pc-toggle-v2 mini">
                                            <input type="checkbox" checked={!!config.voiceSettings?.pingStaffOnJoin} onChange={e => setNested('voiceSettings.pingStaffOnJoin', e.target.checked)} />
                                            <span className="pc-slider-v2"></span>
                                         </label>
                                     </div>
                                 </div>
                             </div>
                        </section>
                    </div>
                </div>
            )}

            {activeTab === 'design' && (
                <div className="v-stack animate slide-up">
                     <EmbedMessageManager 
                        guildId={guildId}
                        module="whitelist"
                        slugs={[
                            { key: 'panel', label: 'Panel Ammissioni Principale', description: 'Messaggio iniziale con i pulsanti per iniziare il test.', variables: ['guild'], group: 'Entry UI', groupIcon: Play },
                            { key: 'dm_accepted', label: 'DM Esito Positivo', description: 'Inviato all\'utente quando viene ammesso al server.', variables: ['user'], group: 'Outcome UI', groupIcon: CheckCircle2 },
                            { key: 'dm_rejected', label: 'DM Esito Negativo', description: 'Inviato all\'utente in caso di bocciatura.', variables: ['user', 'reason'], group: 'Outcome UI', groupIcon: XCircle }
                        ]}
                     />
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 40px; max-width: 1600px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: white; padding: 32px; border-radius: 32px; box-shadow: var(--shadow-premium); border: 1px solid var(--border-light); }
            .header-info { display: flex; align-items: center; gap: 24px; }
            .pc-icon-box { width: 64px; height: 64px; color: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 24px rgba(16, 185, 129, 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Outfit', sans-serif; font-size: 2.2rem; font-weight: 900; margin: 0; color: #1e293b; letter-spacing: -0.5px; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 900; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px; }
            .pc-status-tag-v2.on { background: #ecfdf5; color: #10b981; }
            .pc-status-tag-v2.off { background: #fef2f2; color: #ef4444; }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: #f8fafc; color: #64748b; border: 1.5px solid #e2e8f0; padding: 12px 24px; border-radius: 16px; font-weight: 800; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: #f0fdf4; color: #10b981; border-color: #bbf7d0; }

            .pc-btn-primary { background: var(--primary); color: white; border: none; padding: 14px 28px; border-radius: 16px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 25px rgba(99, 102, 241, 0.3); }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 8px; background: #f1f5f9; padding: 6px; border-radius: 18px; width: fit-content; overflow-x: auto; max-width: 100%; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 10px; padding: 12px 24px; border: none; background: transparent; color: #64748b; font-weight: 800; font-size: 0.9rem; border-radius: 14px; cursor: pointer; transition: 0.2s; white-space: nowrap; }
            .pc-tabs-v2 button.active { background: white; color: var(--primary); box-shadow: 0 4px 15px rgba(0,0,0,0.05); }

            /* Card V2 */
            .pc-card-v2 { background: white; border: 1px solid var(--border-light); border-radius: 32px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
            .header-icon { width: 44px; height: 44px; background: #f5f3ff; color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
            .pc-input-group-v2 label { font-size: 0.7rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }

            /* Toggle V2 */
            .pc-toggle-v2 { position: relative; width: 44px; height: 22px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: #cbd5e1; transition: .4s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background: white; transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: var(--primary); }
            input:checked + .pc-slider-v2:before { transform: translateX(22px); }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-question-slot-v2 { background: #ffffff !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
