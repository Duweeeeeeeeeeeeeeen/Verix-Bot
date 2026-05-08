import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import { EmbedEditor } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
  Save, Ticket, Clock, Plus, Trash2, Power, Settings2, Info, ChevronRight, MessageSquare, 
  Type, Hash, Shield, Palette, Layers, Archive, FileText, XCircle, CheckCircle2, Zap, Send, 
  Users, ShieldAlert, BarChart3, Lock, Crown, Trash, ArrowRight, Sparkles, Star, Layout, 
  Terminal, BellRing, Globe, MessageCircle, Timer, Activity, MousePointer2, Play,
  Settings, LineChart, ShieldCheck, Mail, History, LifeBuoy
} from 'lucide-react';
import { DiscordSelector, CustomSelect, EmbedMessageManager } from '../../../components/LazyConfigComponents';
import EmojiInput from '../../../components/EmojiInput';
import { mergeConfig } from '../../../utils/defaults';
import Head from 'next/head';

export default function TicketConfig() {
  const router = useRouter();
  const { t } = useT();
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
  const [guildData, setGuildData] = useState(null);
  const [blacklistInput, setBlacklistInput] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = async () => {
    if (!guildId || !mounted) return;
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [data, globalData, discordRes, guildRes] = await Promise.all([
        api.request(`/config/${guildId}/tickets`).catch(() => ({ data: {} })),
        api.request(`/config/${guildId}/global`).catch(() => ({ data: {} })),
        api.request(`/config/${guildId}/discord-data`).catch(() => ({ roles: [], channels: [] })),
        api.request(`/config/${guildId}/guild`).catch(() => ({ data: {} }))
      ]);

      const moduleConfig = mergeConfig(data?.data || data || {}, 'tickets');
      const globalConfigData = globalData?.data || globalData || {};
      
      setConfig(moduleConfig);
      setGlobalConfig(globalConfigData);
      setChannels(discordRes?.data?.channels || discordRes?.channels || []);
      setRoles(discordRes?.data?.roles || discordRes?.roles || []);
      setGuildData(guildRes?.data || guildRes || {});
    } catch (err) {
      console.error("Ticket data load error:", err);
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  useEffect(() => {
    loadData();
  }, [guildId, mounted]);

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await Promise.all([
        api.request(`/config/${guildId}/tickets`, { method: 'POST', body: JSON.stringify(config) }),
        api.request(`/config/${guildId}/global`, { method: 'POST', body: JSON.stringify(globalConfig) })
      ]);
      showToast("Ticket Studio Pro sincronizzato!");
    } catch (error) {
      showToast("Errore durante il salvataggio.", 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleSendPanel = async () => {
    if (!config.panelChannelId) return showToast("Seleziona un canale per il panel!", 'error');
    setSendingPanel(true);
    try {
      await handleSave();
      await api.request(`/config/${guildId}/tickets/send-panel`, { method: 'POST' });
      showToast("Panel Ticket distribuito con successo!");
    } catch (error) {
      showToast("Errore nell'invio del panel.", 'error');
    } finally {
      setSendingPanel(false);
    }
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
    const id = `cat_${Math.random().toString(36).substr(2, 5)}`;
    const newTypes = { ...(config.typesConfig || {}) };
    newTypes[id] = { label: 'Nuova Categoria Supporto', emoji: '🎫', color: '#6366f1', style: 'PRIMARY', staffRoleIds: [] };
    setConfig({ ...config, typesConfig: newTypes });
  };

  const addCannedResponse = () => {
    setConfig({
        ...config,
        cannedResponses: [...(config.cannedResponses || []), { label: 'Template Risposta', content: 'Gentile utente, grazie per averci contattato...' }]
    });
  };

  const removeCannedResponse = (index) => {
    const newResponses = [...(config.cannedResponses || [])];
    newResponses.splice(index, 1);
    setConfig({ ...config, cannedResponses: newResponses });
  };

  const addToBlacklist = () => {
    if (!blacklistInput) return;
    setConfig({
        ...config,
        blacklist: [...new Set([...(config.blacklist || []), blacklistInput])]
    });
    setBlacklistInput('');
  };

  const removeFromBlacklist = (userId) => {
    setConfig({
        ...config,
        blacklist: (config.blacklist || []).filter(id => id !== userId)
    });
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>Ticket Studio Pro | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}>
                    <Ticket size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>Ticket Studio Pro</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? 'PROTOCOLLO SUPPORTO ATTIVO' : 'PROTOCOLLO DISATTIVATO'}
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
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving} style={{ background: '#6d28d9' }}>
                    <Save size={18} />
                    <span>{saving ? 'Sincronizzazione...' : 'Salva Studio'}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-container-v2" style={{ marginBottom: '40px' }}>
            <div className="pc-tabs-v2">
                {[
                    { id: 'settings', icon: <Settings2 size={18} />, label: 'Core Config' },
                    { id: 'categories', icon: <Layers size={18} />, label: 'Categorie Studio', count: Object.keys(config.typesConfig || {}).length },
                    { id: 'automation', icon: <Zap size={18} />, label: 'Logic Hub' },
                    { id: 'responses', icon: <MessageSquare size={18} />, label: 'Canned Library', count: config.cannedResponses?.length },
                    { id: 'blacklist', icon: <ShieldAlert size={18} />, label: 'Restrizioni' },
                    { id: 'design', icon: <Palette size={18} />, label: 'Design Studio' },
                    { id: 'stats', icon: <BarChart3 size={18} />, label: 'Analytics' }
                ].map(tab => (
                    <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
                        {tab.icon} <span>{tab.label}</span>
                        {tab.count !== undefined && tab.count > 0 && <span className="pc-tab-badge-v2">{tab.count}</span>}
                    </button>
                ))}
            </div>
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'settings' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '40px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                <div className="header-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}><Hash size={20} /></div>
                                <div className="v-stack" style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>Canali & Destinazioni</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Punti di accesso e archiviazione del protocollo ticket.</p>
                                </div>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>Canale Panel Pubblico</label>
                                        <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.panelChannelId || ''} onChange={val => setConfig({...config, panelChannelId: val})} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Canale Log Trascrizioni</label>
                                        <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.logChannelId || ''} onChange={val => setConfig({...config, logChannelId: val})} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Categoria Apertura Ticket</label>
                                        <DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.categoryOpenId || ''} onChange={val => setConfig({...config, categoryOpenId: val})} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Protocollo Chiusura</label>
                                        <CustomSelect 
                                            options={[
                                                { value: 'DELETE', label: 'Eliminazione Immediata' },
                                                { value: 'MOVE', label: 'Spostamento in Archivio' }
                                            ]} 
                                            value={config.closeMode || 'DELETE'} 
                                            onChange={val => setConfig({...config, closeMode: val})} 
                                        />
                                    </div>
                                    {config.closeMode === 'MOVE' && (
                                        <div className="pc-input-group-v2 animate slide-up" style={{ gridColumn: 'span 2' }}>
                                            <label>Categoria Archivio Permanente</label>
                                            <DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.categoryClosedId || ''} onChange={val => setConfig({...config, categoryClosedId: val})} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                <div className="header-icon" style={{ background: '#f0f9ff', color: '#0ea5e9' }}><ShieldCheck size={20} /></div>
                                <div className="v-stack" style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>Authority Master Team</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Ruoli con accesso privilegiato a tutti i ticket attivi.</p>
                                </div>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>Master Moderators Roles</label>
                                    <DiscordSelector type="role" multiple={true} options={roles} value={config.staffRoleIds || []} onChange={val => setConfig({...config, staffRoleIds: val})} />
                                    <div style={{ marginTop: '24px', background: 'rgba(14, 165, 233, 0.03)', padding: '24px', borderRadius: '22px', border: '1.5px solid #e0f2fe', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <Info size={24} color="#0ea5e9" style={{ flexShrink: 0 }} />
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 700, lineHeight: 1.6 }}>Questi ruoli avranno visibilità completa su ogni ticket aperto, indipendentemente dalla categoria selezionata.</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="v-stack" style={{ gap: '32px' }}>
                        <div className="pc-card-v2" style={{ padding: '40px', background: '#f5f3ff', border: '1.5px solid #ddd6fe', textAlign: 'center' }}>
                            <div style={{ background: 'white', width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: '0 10px 30px rgba(124, 58, 237, 0.15)' }}><Mail size={32} color="#7c3aed" /></div>
                            <h3 style={{ margin: '0 0 12px 0', fontWeight: 950, fontSize: '1.5rem', letterSpacing: '-0.8px', color: '#1e293b' }}>Distribuzione Panel</h3>
                            <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: 700, lineHeight: 1.6, marginBottom: '32px' }}>Invia o aggiorna l'interfaccia di apertura ticket nel canale pubblico selezionato.</p>
                            <button className="pc-btn-primary" style={{ width: '100%', background: '#7c3aed', justifyContent: 'center', borderRadius: '22px', padding: '18px' }} onClick={handleSendPanel} disabled={sendingPanel}>
                                <Send size={20} />
                                <span>{sendingPanel ? 'Operazione in corso...' : 'Invia Protocollo Panel'}</span>
                            </button>
                        </div>

                        <div className="pc-info-banner-purple animate slide-up" style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)', borderRadius: '32px', padding: '40px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'relative', zIndex: 2 }}>
                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '14px', width: 'fit-content', marginBottom: '24px' }}><Star size={24} /></div>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '1.4rem', fontWeight: 950, letterSpacing: '-0.5px' }}>Top Rated Support</h4>
                                <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9, lineHeight: 1.7, fontWeight: 700 }}>Un sistema di ticketing fluido riduce i tempi di attesa del 60%. Verix Studio garantisce performance d'elite.</p>
                            </div>
                            <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.1 }}><LifeBuoy size={180} /></div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'categories' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2" style={{ marginBottom: '40px' }}>
                            <div className="header-icon" style={{ background: '#fdf2f8', color: '#db2777' }}><Layers size={20} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>Studio Taxonomy: Categorie Supporto</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Definisci le diverse tipologie di contatto per una gestione granulare.</p>
                            </div>
                            <button className="pc-btn-primary" style={{ padding: '14px 28px', borderRadius: '18px', fontSize: '1rem' }} onClick={addCategory}>
                                <Plus size={20} /> <span>Aggiungi Categoria</span>
                            </button>
                        </div>
                        <div className="card-body-v2">
                            <div className="v-stack" style={{ gap: '32px' }}>
                                {config.typesConfig && Object.entries(config.typesConfig).map(([id, data]) => (
                                    <div key={id} className="pc-category-studio-card animate slide-up" style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '32px', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', marginBottom: '40px', borderBottom: '2px dashed #f1f5f9', paddingBottom: '32px' }}>
                                            <div style={{ width: '64px', height: '64px', background: '#f8fafc', borderRadius: '20px', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 8px 25px rgba(0,0,0,0.03)' }}>
                                                <EmojiInput value={data.emoji || '🎫'} hideInput={true} onChange={e => {
                                                    const newTypes = { ...config.typesConfig };
                                                    newTypes[id] = { ...data, emoji: e.target.value };
                                                    setConfig({ ...config, typesConfig: newTypes });
                                                }} />
                                            </div>
                                            <input style={{ border: 'none', background: 'transparent', fontSize: '1.6rem', fontWeight: 950, color: '#1e293b', outline: 'none', flex: 1, fontFamily: 'Outfit', letterSpacing: '-0.8px' }} value={data.label || ''} onChange={e => {
                                                const newTypes = { ...config.typesConfig };
                                                newTypes[id] = { ...data, label: e.target.value };
                                                setConfig({ ...config, typesConfig: newTypes });
                                            }} placeholder="Titolo Categoria..." />
                                            <button onClick={() => {
                                                const newTypes = { ...config.typesConfig };
                                                delete newTypes[id];
                                                setConfig({ ...config, typesConfig: newTypes });
                                            }} className="pc-btn-delete-studio-mini" style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#fff1f2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}><Trash2 size={24} /></button>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                                            <div className="pc-input-group-v2">
                                                <label>Staff Role (Target Identity)</label>
                                                <DiscordSelector type="role" multiple={true} options={roles} value={data.staffRoleIds || []} onChange={val => {
                                                    const newTypes = { ...config.typesConfig };
                                                    newTypes[id] = { ...data, staffRoleIds: val };
                                                    setConfig({ ...config, typesConfig: newTypes });
                                                }} />
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>Discord Button Aesthetic</label>
                                                <CustomSelect 
                                                    options={[
                                                        { value: 'PRIMARY', label: 'Blurple (Azione)' },
                                                        { value: 'SUCCESS', label: 'Green (Safe)' },
                                                        { value: 'DANGER', label: 'Red (Critical)' },
                                                        { value: 'SECONDARY', label: 'Gray (Neutral)' }
                                                    ]} 
                                                    value={data.style || 'PRIMARY'} 
                                                    onChange={val => {
                                                        const newTypes = { ...config.typesConfig };
                                                        newTypes[id] = { ...data, style: val };
                                                        setConfig({ ...config, typesConfig: newTypes });
                                                    }} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {Object.keys(config.typesConfig || {}).length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '140px 40px', background: '#f8fafc', borderRadius: '40px', border: '2px dashed #e2e8f0' }}>
                                        <Layout size={80} style={{ margin: '0 auto 32px', opacity: 0.15, color: '#6d28d9' }} />
                                        <h3 style={{ margin: 0, fontWeight: 950, color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.8px' }}>Nessuna Categoria Configurata</h3>
                                        <p style={{ fontWeight: 800, color: '#94a3b8', fontSize: '1.1rem', marginTop: '10px' }}>Aggiungi almeno una categoria per consentire l'apertura dei ticket.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'automation' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                <div className="header-icon" style={{ background: '#f1f5f9', color: '#475569' }}><Terminal size={20} /></div>
                                <h3 style={{ margin: 0 }}>System Logic: Naming & Layout</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="v-stack" style={{ gap: '32px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>Formato Nome Canale Ticket</label>
                                        <div className="pc-input-wrapper-v2" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '20px' }}>
                                            <Type size={20} style={{ marginLeft: '20px', color: '#94a3b8' }} />
                                            <input style={{ width: '100%', border: 'none', background: 'transparent', padding: '20px', fontWeight: 950, fontSize: '1.1rem', outline: 'none', color: '#1e293b' }} value={globalConfig?.naming?.ticket || ''} onChange={e => setGlobalNested('naming.ticket', e.target.value)} placeholder="ticket-{user}" />
                                        </div>
                                        <p className="pc-hint-v2" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginTop: '12px' }}>Tag disponibili: {`{user}, {id}, {category}`}</p>
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Layout Interfaccia Panel</label>
                                        <CustomSelect 
                                            options={[
                                                { value: 'BUTTONS', label: 'Grid Pulsanti (Modern)' },
                                                { value: 'SELECT', label: 'Dropdown Menu (Compact)' }
                                            ]} 
                                            value={config.inputType || 'BUTTONS'} 
                                            onChange={val => setConfig({...config, inputType: val})} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                <div className="header-icon" style={{ background: '#fffbeb', color: '#d97706' }}><Timer size={20} /></div>
                                <div className="v-stack" style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>Auto-Close Protocol</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Gestione automatizzata dei ticket inattivi.</p>
                                </div>
                                <label className="pc-toggle-v2">
                                    <input type="checkbox" checked={config.autoClose?.enabled || false} onChange={e => setConfig({...config, autoClose: {...(config.autoClose || {}), enabled: e.target.checked}})} />
                                    <span className="pc-slider-v2"></span>
                                </label>
                            </div>
                            <div className="card-body-v2">
                                {config.autoClose?.enabled ? (
                                    <div className="pc-input-group-v2 animate slide-up">
                                        <label>Time-To-Live (Ore Inattività)</label>
                                        <div className="pc-input-wrapper-v2" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '24px' }}>
                                            <Clock size={22} style={{ marginLeft: '24px', color: '#94a3b8' }} />
                                            <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '24px', fontWeight: 950, fontSize: '1.3rem', color: '#1e293b' }} value={config.autoClose?.hours || 24} onChange={e => setConfig({...config, autoClose: {...(config.autoClose || {}), hours: parseInt(e.target.value)}})} />
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '32px', border: '1.5px dashed #e2e8f0', color: '#94a3b8', fontWeight: 800 }}>Protocollo di auto-chiusura disabilitato.</div>
                                )}
                            </div>
                        </section>

                        <section className="pc-card-v2" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%)', border: '1.5px solid #fde047' }}>
                            <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                <div className="header-icon" style={{ background: 'white', color: '#ca8a04' }}><Crown size={20} /></div>
                                <h3 style={{ margin: 0, color: '#854d0e' }}>Platinum Support Suite</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="v-stack" style={{ gap: '24px' }}>
                                    {[
                                        { label: 'HTML Transcripts Studio', path: 'htmlTranscripts', desc: 'Archiviazione grafica navigabile dei ticket.' },
                                        { label: 'Feedback & Rating System', path: 'ratingEnabled', desc: 'Valutazione dello staff post-supporto.' }
                                    ].map((perk, i) => (
                                        <div key={i} className="pc-perk-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div className="v-stack" style={{ gap: '4px' }}>
                                                <span style={{ fontWeight: 950, fontSize: '1rem', color: '#854d0e', letterSpacing: '-0.3px' }}>{perk.label}</span>
                                                <span style={{ fontSize: '0.8rem', color: '#a16207', fontWeight: 800 }}>{perk.desc}</span>
                                            </div>
                                            <label className={`pc-toggle-v2 ${!guildData?.isPremium ? 'locked-v2' : ''}`}>
                                                <input type="checkbox" checked={!!config[perk.path]} disabled={!guildData?.isPremium} onChange={e => setConfig({...config, [perk.path]: e.target.checked})} />
                                                <span className="pc-slider-v2"></span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            )}

            {activeTab === 'responses' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2" style={{ marginBottom: '40px' }}>
                            <div className="header-icon" style={{ background: '#ecfdf5', color: '#059669' }}><MessageCircle size={20} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>Canned Responses: Library Studio</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Ottimizza la velocità di risposta con template predefiniti.</p>
                            </div>
                            <button className="pc-btn-primary" style={{ padding: '14px 28px', borderRadius: '18px', fontSize: '1rem', background: '#059669' }} onClick={addCannedResponse}>
                                <Plus size={20} /> <span>Aggiungi Template</span>
                            </button>
                        </div>
                        <div className="card-body-v2">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                {(config.cannedResponses || []).map((res, index) => (
                                    <div key={index} className="pc-canned-studio-card animate slide-up" style={{ background: '#f8fafc', padding: '32px', borderRadius: '32px', border: '1.5px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '2.5px dashed #e2e8f0', paddingBottom: '24px', marginBottom: '24px' }}>
                                            <input style={{ border: 'none', background: 'transparent', fontWeight: 950, color: '#1e293b', outline: 'none', flex: 1, fontFamily: 'Outfit', fontSize: '1.2rem', letterSpacing: '-0.5px' }} value={res.label || ''} onChange={e => {
                                                const newRes = [...config.cannedResponses];
                                                newRes[index].label = e.target.value;
                                                setConfig({...config, cannedResponses: newRes});
                                            }} placeholder="Titolo Template..." />
                                            <button onClick={() => removeCannedResponse(index)} className="pc-btn-delete-studio-mini" style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'white', color: '#ef4444', border: '1.5px solid #fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}><Trash2 size={20} /></button>
                                        </div>
                                        <textarea style={{ width: '100%', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '22px', padding: '24px', fontWeight: 800, color: '#475569', minHeight: '180px', outline: 'none', resize: 'none', fontSize: '1rem', lineHeight: 1.6, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} value={res.content || ''} onChange={e => {
                                            const newRes = [...config.cannedResponses];
                                            newRes[index].content = e.target.value;
                                            setConfig({...config, cannedResponses: newRes});
                                        }} placeholder="Contenuto della risposta rapida..." />
                                    </div>
                                ))}
                                {(config.cannedResponses || []).length === 0 && (
                                    <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '120px 40px', background: '#f8fafc', borderRadius: '40px', border: '2px dashed #e2e8f0' }}>
                                        <History size={80} style={{ margin: '0 auto 32px', opacity: 0.1, color: '#6366f1' }} />
                                        <p style={{ fontWeight: 950, color: '#94a3b8', fontSize: '1.2rem' }}>Libreria template vuota.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'blacklist' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2" style={{ marginBottom: '40px' }}>
                            <div className="header-icon" style={{ background: '#fef2f2', color: '#ef4444' }}><ShieldAlert size={20} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>Studio Restrictions: Blacklist</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Blocca utenti specifici dall'utilizzo del sistema ticket.</p>
                            </div>
                        </div>
                        <div className="card-body-v2">
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '48px' }}>
                                <div className="pc-input-wrapper-v2" style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '24px' }}>
                                    <Users size={22} style={{ marginLeft: '24px', color: '#94a3b8' }} />
                                    <input style={{ width: '100%', border: 'none', background: 'transparent', padding: '24px', fontWeight: 950, outline: 'none', fontSize: '1.1rem', color: '#1e293b' }} placeholder="Inserisci Discord User ID..." value={blacklistInput} onChange={e => setBlacklistInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addToBlacklist()} />
                                </div>
                                <button className="pc-btn-primary" onClick={addToBlacklist} style={{ background: '#ef4444', borderRadius: '24px', padding: '0 48px', fontSize: '1.1rem' }}>Blocca Utente</button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                {(config.blacklist || []).map(userId => (
                                    <div key={userId} className="pc-pill-v2 animate slide-up" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#fff1f2', color: '#ef4444', padding: '16px 32px', borderRadius: '20px', fontWeight: 950, fontSize: '1.05rem', border: '1.5px solid #fee2e2', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.05)' }}>
                                        <span>{userId}</span>
                                        <XCircle size={22} style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => removeFromBlacklist(userId)} />
                                    </div>
                                ))}
                                {(config.blacklist || []).length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '60px', width: '100%', color: '#94a3b8', background: '#f8fafc', borderRadius: '32px', border: '1.5px dashed #e2e8f0' }}>
                                        <p style={{ margin: 0, fontWeight: 950 }}>Nessun utente limitato.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'design' && (
                <div className="v-stack animate slide-up">
                    <EmbedMessageManager 
                        guildId={guildId}
                        module="tickets"
                        slugs={[
                            { key: 'panel', label: 'Layout Panel Pubblico', description: 'Design del messaggio di apertura ticket visualizzato nel canale pubblico.', variables: ['guild'], group: 'Studio Entry', groupIcon: Play },
                            { key: 'ticket', label: 'Interfaccia Canale Ticket', description: 'Design del messaggio di benvenuto all\'interno del canale ticket privato.', variables: ['user', 'category'], group: 'Studio Process', groupIcon: MessageSquare }
                        ]}
                    />
                </div>
            )}

            {activeTab === 'stats' && (
                <div className="v-stack animate slide-up" style={{ gap: '40px' }}>
                    <div className="pc-stats-grid-v2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                        {[
                            { label: 'Ticket Aperti (24h)', value: '28', icon: Ticket, color: '#8b5cf6', trend: '+12%' },
                            { label: 'Risposta Media', value: '14m', icon: Clock, color: '#10b981', trend: '-4m' },
                            { label: 'Customer Satisfaction', value: '4.9', icon: Star, color: '#f59e0b', trend: 'High' }
                        ].map((stat, i) => (
                            <div key={i} className="pc-stat-card-v2" style={{ background: 'white', padding: '48px 40px', borderRadius: '40px', boxShadow: 'var(--shadow-premium)', display: 'flex', alignItems: 'center', gap: '32px', border: '1px solid var(--border-light)' }}>
                                <div style={{ width: '88px', height: '88px', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, background: `${stat.color}12`, border: `1.5px solid ${stat.color}25` }}><stat.icon size={40} /></div>
                                <div className="v-stack">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '2.8rem', fontWeight: 950, fontFamily: 'Outfit', color: '#1e293b', lineHeight: 1, letterSpacing: '-1.5px' }}>{stat.value}</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 950, padding: '4px 10px', borderRadius: '100px', background: '#f1f5f9', color: '#64748b' }}>{stat.trend}</span>
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 950, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '12px' }}>{stat.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <section className="pc-card-v2" style={{ background: '#f8fafc' }}>
                        <div style={{ textAlign: 'center', padding: '80px 40px' }}>
                            <LineChart size={80} style={{ margin: '0 auto 32px', opacity: 0.1, color: '#64748b' }} />
                            <h3 style={{ margin: 0, fontWeight: 950, color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.8px' }}>Visual Metrics Engine</h3>
                            <p style={{ fontWeight: 800, color: '#94a3b8', fontSize: '1.1rem', marginTop: '10px' }}>I grafici dettagliati per orario e categoria saranno disponibili nella release v2.5.</p>
                        </div>
                    </section>
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 40px; max-width: 1700px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: white; padding: 32px; border-radius: 32px; box-shadow: var(--shadow-premium); border: 1px solid var(--border-light); }
            .header-info { display: flex; align-items: center; gap: 24px; }
            .pc-icon-box { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 12px 24px rgba(139, 92, 246, 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Outfit', sans-serif; font-size: 2.3rem; font-weight: 950; margin: 0; color: #1e293b; letter-spacing: -1.5px; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 950; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px; }
            .pc-status-tag-v2.on { background: #f5f3ff; color: #8b5cf6; }
            .pc-status-tag-v2.off { background: #fef2f2; color: #ef4444; }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: #f8fafc; color: #64748b; border: 1.5px solid #e2e8f0; padding: 12px 28px; border-radius: 18px; font-weight: 850; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: #f5f3ff; color: #8b5cf6; border-color: #ddd6fe; }
            .pc-btn-primary { background: var(--primary); color: white; border: none; padding: 14px 28px; border-radius: 18px; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.3s; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(99, 102, 241, 0.3); }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 10px; background: #f1f5f9; padding: 8px; border-radius: 24px; width: fit-content; overflow-x: auto; max-width: 100%; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 12px; padding: 16px 32px; border: none; background: transparent; color: #64748b; font-weight: 950; font-size: 1rem; border-radius: 18px; cursor: pointer; transition: 0.3s; white-space: nowrap; position: relative; }
            .pc-tabs-v2 button.active { background: white; color: var(--primary); box-shadow: 0 8px 20px rgba(0,0,0,0.06); transform: translateY(-2px); }
            .pc-tab-badge-v2 { background: var(--primary); color: white; font-size: 0.75rem; padding: 2px 10px; border-radius: 100px; margin-left: 6px; font-weight: 950; }

            /* Card V2 */
            .pc-card-v2 { background: white; border: 1px solid var(--border-light); border-radius: 32px; padding: 40px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 20px; }
            .header-icon { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
            .card-header-v2 h3 { margin: 0; font-family: 'Outfit'; font-size: 1.5rem; font-weight: 950; color: #1e293b; letter-spacing: -0.5px; }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 10px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 950; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px; }

            .pc-category-studio-card:hover { border-color: #8b5cf6 !important; transform: translateY(-4px); box-shadow: 0 12px 40px rgba(139, 92, 246, 0.08); }
            .pc-btn-delete-studio-mini:hover { background: #ef4444 !important; color: white !important; transform: rotate(8deg); }
            .pc-canned-studio-card:hover { border-color: #10b981 !important; transform: translateY(-4px); box-shadow: 0 12px 40px rgba(16, 185, 129, 0.08); }

            /* Toggle V2 */
            .pc-toggle-v2 { position: relative; width: 44px; height: 22px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: #cbd5e1; transition: .4s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background: white; transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: var(--primary); }
            input:checked + .pc-slider-v2:before { transform: translateX(22px); }
            .locked-v2 { filter: grayscale(1); opacity: 0.5; cursor: not-allowed; }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-category-studio-card, :global(.light-theme) .pc-canned-studio-card, :global(.light-theme) .pc-stat-card-v2, :global(.light-theme) .pc-tabs-v2 { background: #ffffff !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
