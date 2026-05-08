import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import { DiscordSelector, CustomSelect, EmbedMessageManager, NotificationSettings } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, ShieldAlert, Settings2, Power, Clock, Trash2, Plus, X, AlertTriangle, Shield, Gavel, 
    History, MessageSquare, Type, AtSign, List, Ghost, RefreshCcw, Link, UserPlus, Zap, Ban, 
    Trash, Search, Settings, ShieldCheck, Lock, ChevronRight, ArrowRight, Info, AlertCircle, 
    Layout, Terminal, ShieldX, Activity, Eye, EyeOff, Globe, Layers, Palette, Users, 
    MessageCircle, Hash, Box, Filter, Sparkles, Star, MousePointer2, ShieldQuestion,
    VolumeX, UserMinus, ShieldEllipsis, Network, Timer, Gauge, ShieldHalf
} from 'lucide-react';
import { mergeConfig } from '../../../utils/defaults';
import Head from 'next/head';

export default function ModerationConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('antispam');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
      fetchData();
    }
  }, [guildId, mounted]);

  const fetchData = async () => {
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [configRes, discordRes] = await Promise.all([
        api.request(`/config/${guildId}/moderation`),
        api.request(`/config/${guildId}/discord-data`)
      ]);
      if (configRes) {
        setConfig(mergeConfig(configRes.data || configRes, 'moderation'));
      }
      if (discordRes) {
        setDiscordData(discordRes.data || discordRes);
      }
    } catch (error) {
      console.error("Moderation load error:", error);
    } finally {
        setLoading(false);
        window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/moderation`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast("Shield Protocol aggiornato con successo!");
    } catch (error) {
        showToast("Errore durante la sincronizzazione.", 'error');
    } finally { 
        setSaving(false); 
        window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const updateNested = (path, value) => {
    setConfig(prev => {
        const keys = path.split('.');
        const newConfig = { ...prev };
        let current = newConfig;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            else current[keys[i]] = { ...current[keys[i]] };
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newConfig;
    });
  };

  const addPunishment = () => {
    const newPunishments = [...(config.punishments || []), { level: (config.punishments?.length || 0) + 1, action: 'warn', duration: 0, message: '' }];
    setConfig({ ...config, punishments: newPunishments });
  };

  const removePunishment = (index) => {
    const newPunishments = config.punishments.filter((_, i) => i !== index);
    setConfig({ ...config, punishments: newPunishments });
  };

  const updatePunishment = (index, field, value) => {
    const newPunishments = [...config.punishments];
    newPunishments[index] = { ...newPunishments[index], [field]: value };
    setConfig({ ...config, punishments: newPunishments });
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>Shield Moderation Pro | Verix Studio</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #1e1b4b 100%)' }}>
                    <ShieldCheck size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>Shield Moderation Pro</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? 'PROTOCOLLO OPERATIVO' : 'PROTOCOLLO DISATTIVATO'}
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
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving} style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)' }}>
                    <Save size={18} />
                    <span>{saving ? 'Sincronizzazione...' : 'Salva Studio'}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-container-v2" style={{ marginBottom: '40px' }}>
            <div className="pc-tabs-v2">
                {[
                    { id: 'antispam', icon: <Activity size={18} />, label: 'Traffic Filters' },
                    { id: 'safety', icon: <Globe size={18} />, label: 'Integrity Hub' },
                    { id: 'antiraid', icon: <ShieldEllipsis size={18} />, label: 'Raid Shield' },
                    { id: 'punishments', icon: <Gavel size={18} />, label: 'Action Matrix' },
                    { id: 'settings', icon: <EyeOff size={18} />, label: 'Whitelists' },
                    { id: 'messages', icon: <Palette size={18} />, label: 'Policy Designer' }
                ].map(tab => (
                    <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
                        {tab.icon} <span>{tab.label}</span>
                    </button>
                ))}
            </div>
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'antispam' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                <div className="header-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}><MessageCircle size={20} /></div>
                                <div className="v-stack" style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>Rilevamento Spam Studio</h3>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Monitoraggio intensivo dei messaggi consecutivi rapidi.</span>
                                </div>
                                <label className="pc-toggle-v2">
                                    <input type="checkbox" checked={!!config.antispam?.enabled} onChange={e => updateNested('antispam.enabled', e.target.checked)} />
                                    <span className="pc-slider-v2"></span>
                                </label>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>Soglia Burst Messaggi</label>
                                        <div className="pc-input-wrapper-v2" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '20px' }}>
                                            <Hash size={18} style={{ marginLeft: '20px', color: '#94a3b8' }} />
                                            <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '20px', fontWeight: 950, fontSize: '1.2rem', color: '#1e293b' }} value={config.antispam?.maxMessages || 5} onChange={e => updateNested('antispam.maxMessages', parseInt(e.target.value))} />
                                        </div>
                                        <p className="pc-hint-v2" style={{ marginTop: '16px' }}>Numero massimo di messaggi consentiti prima dell'intervento.</p>
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Finestra Analisi (sec)</label>
                                        <div className="pc-input-wrapper-v2" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '20px' }}>
                                            <Timer size={18} style={{ marginLeft: '20px', color: '#94a3b8' }} />
                                            <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '20px', fontWeight: 950, fontSize: '1.2rem', color: '#1e293b' }} value={config.antispam?.timeWindow || 3} onChange={e => updateNested('antispam.timeWindow', parseInt(e.target.value))} />
                                        </div>
                                        <p className="pc-hint-v2" style={{ marginTop: '16px' }}>Arco di tempo critico per il rilevamento spam.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2">
                            <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                <div className="header-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><RefreshCcw size={20} /></div>
                                <div className="v-stack" style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>Protocollo Anti-Repeat</h3>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Blocco euristico della ripetizione testuale.</span>
                                </div>
                                <label className="pc-toggle-v2">
                                    <input type="checkbox" checked={!!config.antiRepeat?.enabled} onChange={e => updateNested('antiRepeat.enabled', e.target.checked)} />
                                    <span className="pc-slider-v2"></span>
                                </label>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>Tolleranza Duplicati Testo</label>
                                    <div className="pc-input-wrapper-v2" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '20px' }}>
                                        <List size={20} style={{ marginLeft: '20px', color: '#94a3b8' }} />
                                        <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '20px', fontWeight: 950, fontSize: '1.2rem', color: '#1e293b' }} value={config.antiRepeat?.maxDuplicates || 2} onChange={e => updateNested('antiRepeat.maxDuplicates', parseInt(e.target.value))} />
                                    </div>
                                    <p className="pc-hint-v2" style={{ marginTop: '20px' }}>Quante volte lo stesso contenuto può apparire in chat.</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="pc-card-v2">
                        <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                            <div className="header-icon" style={{ background: '#fff1f2', color: '#e11d48' }}><Filter size={20} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>Flood Security Protocol</h3>
                                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Analisi strutturale del volume dei messaggi.</span>
                            </div>
                            <label className="pc-toggle-v2">
                                <input type="checkbox" checked={!!config.antiFlood?.enabled} onChange={e => updateNested('antiFlood.enabled', e.target.checked)} />
                                <span className="pc-slider-v2"></span>
                            </label>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                                {[
                                    { label: 'Max Lines / Msg', path: 'antiFlood.maxLines', value: config.antiFlood?.maxLines || 10 },
                                    { label: 'Max Chars / Msg', path: 'antiFlood.maxCharacters', value: config.antiFlood?.maxCharacters || 1000 },
                                    { label: 'Max Emoji Count', path: 'antiFlood.maxEmojis', value: config.antiFlood?.maxEmojis || 15 }
                                ].map((field, i) => (
                                    <div key={i} className="pc-input-group-v2">
                                        <label>{field.label}</label>
                                        <input className="pc-input-modern-v2" style={{ borderRadius: '18px', padding: '20px' }} type="number" value={field.value} onChange={e => updateNested(field.path, parseInt(e.target.value))} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'safety' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2" style={{ marginBottom: '40px' }}>
                            <div className="header-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}><Globe size={20} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>Integrity Hub: Link & Domini</h3>
                                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Gestione centralizzata della navigazione esterna sicura.</span>
                            </div>
                            <label className="pc-toggle-v2">
                                <input type="checkbox" checked={!!config.antiLink?.enabled} onChange={e => updateNested('antiLink.enabled', e.target.checked)} />
                                <span className="pc-slider-v2"></span>
                            </label>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-group-v2">
                                <label>Whitelist Domini Certificati</label>
                                <div className="pc-pill-engine-v2" style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
                                    <div className="pc-input-wrapper-v2" style={{ flex: 1, background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '20px' }}>
                                        <Link size={20} style={{ marginLeft: '20px', color: '#94a3b8' }} />
                                        <input 
                                            style={{ width: '100%', border: 'none', background: 'transparent', padding: '20px', fontWeight: 950, fontSize: '1.1rem', outline: 'none', color: '#1e293b' }} 
                                            placeholder="Aggiungi dominio sicuro (es: verix.it)..." 
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && e.target.value) {
                                                    const list = [...(config.antiLink?.whitelist || [])];
                                                    if (!list.includes(e.target.value)) list.push(e.target.value);
                                                    updateNested('antiLink.whitelist', list);
                                                    e.target.value = '';
                                                }
                                            }} 
                                        />
                                    </div>
                                    <button className="pc-btn-primary" style={{ width: '60px', borderRadius: '20px', padding: 0, justifyContent: 'center' }}><Plus size={28} /></button>
                                </div>
                                <div className="pc-pill-cloud-v2" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                                    {(config.antiLink?.whitelist || []).map(d => (
                                        <div key={d} className="pc-pill-v2 animate slide-up" style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'white', border: '1.5px solid #e2e8f0', padding: '14px 24px', borderRadius: '18px', fontSize: '0.95rem', fontWeight: 950, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', color: '#1e293b' }}>
                                            <span>{d}</span>
                                            <X size={18} style={{ color: '#ef4444', cursor: 'pointer', opacity: 0.6 }} onClick={() => updateNested('antiLink.whitelist', config.antiLink.whitelist.filter(x => x !== d))} />
                                        </div>
                                    ))}
                                    {(config.antiLink?.whitelist || []).length === 0 && (
                                        <div style={{ width: '100%', padding: '48px', textAlign: 'center', background: '#f8fafc', borderRadius: '32px', border: '2px dashed #e2e8f0', color: '#94a3b8', fontSize: '1rem', fontWeight: 800 }}>
                                            Nessun dominio registrato nel protocollo di sicurezza.
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="pc-studio-divider-v2" style={{ height: '2px', background: 'linear-gradient(90deg, #f1f5f9 0%, transparent 100%)', margin: '56px 0' }}></div>

                            <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                                <div className="pc-input-group-v2">
                                    <label>Safe Channels (Bypass)</label>
                                    <DiscordSelector type="channel" multiple options={discordData.channels} value={config.antiLink?.allowChannels || []} onChange={v => updateNested('antiLink.allowChannels', v)} />
                                </div>
                                <div className="pc-input-group-v2">
                                    <label>Authorized Roles (Bypass)</label>
                                    <DiscordSelector type="role" multiple options={discordData.roles} value={config.antiLink?.allowRoles || []} onChange={v => updateNested('antiLink.allowRoles', v)} />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'antiraid' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2" style={{ marginBottom: '40px' }}>
                            <div className="header-icon" style={{ background: '#fff1f2', color: '#e11d48' }}><ShieldEllipsis size={20} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>Raid Prevention Matrix</h3>
                                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Blocco proattivo di attacchi massivi coordinati.</span>
                            </div>
                            <label className="pc-toggle-v2">
                                <input type="checkbox" checked={!!config.antiRaid?.enabled} onChange={e => updateNested('antiRaid.enabled', e.target.checked)} />
                                <span className="pc-slider-v2"></span>
                            </label>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px' }}>
                                <div className="pc-input-group-v2">
                                    <label>Soglia Critica Ingressi (Join/Minuto)</label>
                                    <div className="pc-input-wrapper-v2" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '24px' }}>
                                        <Gauge size={22} style={{ marginLeft: '24px', color: '#94a3b8' }} />
                                        <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '24px', fontWeight: 950, fontSize: '1.3rem', outline: 'none', color: '#1e293b' }} value={config.antiRaid?.joinsThreshold || 10} onChange={e => updateNested('antiRaid.joinsThreshold', parseInt(e.target.value))} />
                                    </div>
                                    <div style={{ marginTop: '24px', background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1.5px solid #e2e8f0', display: 'flex', gap: '16px' }}>
                                        <ShieldAlert size={24} color="#e11d48" style={{ flexShrink: 0 }} />
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 700, lineHeight: 1.6 }}>Se il volume di join supera questa soglia in 60 secondi, Verix attiverà istantaneamente il protocollo di difesa selezionato.</p>
                                    </div>
                                </div>
                                <div className="pc-input-group-v2">
                                    <label>Protocollo di Risposta Rapida</label>
                                    <CustomSelect 
                                        options={[
                                            { value: 'notify', label: 'Monitoraggio & Log (Staff Alert)' },
                                            { value: 'lockdown', label: 'Full Lockdown (Channel Lockdown)' },
                                            { value: 'quarantine', label: 'Quarantena (Role Lock Isolation)' }
                                        ]} 
                                        value={config.antiRaid?.action || 'notify'} 
                                        onChange={v => updateNested('antiRaid.action', v)} 
                                    />
                                    <div className="pc-alert-box-v2" style={{ background: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)', padding: '32px', borderRadius: '28px', marginTop: '32px', color: 'white' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                            <Terminal size={20} style={{ color: '#ef4444' }} />
                                            <span style={{ fontWeight: 950, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>System Alert</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, opacity: 0.9, lineHeight: 1.6 }}>La modalità selezionata influenzerà l'accesso di tutti i nuovi membri rilevati come parte dell'ondata di raid.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'punishments' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2" style={{ marginBottom: '40px' }}>
                            <div className="header-icon" style={{ background: '#f5f3ff', color: '#6366f1' }}><Gavel size={20} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>Action Matrix Studio</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Gerarchia progressiva delle sanzioni basata sullo storico violazioni.</p>
                            </div>
                            <button className="pc-btn-primary" style={{ padding: '14px 28px', borderRadius: '16px', fontSize: '0.95rem' }} onClick={addPunishment}>
                                <Plus size={20} /> <span>Aggiungi Step</span>
                            </button>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-log-config-v2" style={{ background: '#f8fafc', padding: '32px', borderRadius: '32px', border: '1.5px solid #e2e8f0', marginBottom: '48px' }}>
                                <NotificationSettings 
                                    guildId={guildId}
                                    value={config.notifications}
                                    onChange={val => setConfig({...config, notifications: val})}
                                    title="Protocollo Log Sanzioni"
                                />
                            </div>

                            <div className="pc-matrix-timeline-v2" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                {(config.punishments || []).sort((a,b) => a.level - b.level).map((p, idx) => (
                                    <div key={idx} className="pc-matrix-step-card-v2 animate slide-up" style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '32px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', marginBottom: '40px', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '32px' }}>
                                            <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #6366f1 0%, #312e81 100%)', color: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950, fontSize: '1.6rem', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.25)' }}>{p.level}</div>
                                            <div className="v-stack" style={{ flex: 1 }}>
                                                <h4 style={{ margin: 0, fontWeight: 950, fontSize: '1.4rem', color: '#1e293b', letterSpacing: '-0.5px' }}>Livello Sanzione {p.level}</h4>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 950, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px' }}>PROTOCOLLO DISCIPLINARE STEP {idx + 1}</span>
                                            </div>
                                            <button onClick={() => removePunishment(idx)} className="pc-btn-delete-studio-v2" style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }}>
                                                <Trash2 size={24} />
                                            </button>
                                        </div>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                                            <div className="pc-input-group-v2">
                                                <label>Azione Automatica Studio</label>
                                                <CustomSelect 
                                                    options={[
                                                        { value: 'warn', label: 'Warn (Ammonizione Formale)' },
                                                        { value: 'timeout', label: 'Timeout (Silenziamento Temporaneo)' },
                                                        { value: 'kick', label: 'Kick (Espulsione Immediata)' },
                                                        { value: 'ban', label: 'Ban (Bando Permanente)' }
                                                    ]} 
                                                    value={p.action} 
                                                    onChange={v => updatePunishment(idx, 'action', v)} 
                                                />
                                            </div>
                                            {p.action === 'timeout' && (
                                                <div className="pc-input-group-v2 animate slide-up">
                                                    <label>Durata Sospensione (Minuti)</label>
                                                    <div className="pc-input-wrapper-v2" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '20px' }}>
                                                        <Clock size={20} style={{ marginLeft: '20px', color: '#94a3b8' }} />
                                                        <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '20px', fontWeight: 950, fontSize: '1.2rem', color: '#1e293b' }} value={p.duration} onChange={e => updatePunishment(idx, 'duration', parseInt(e.target.value))} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="pc-input-group-v2" style={{ marginTop: '32px' }}>
                                            <label>Protocollo Notifica DM (Messaggio Utente)</label>
                                            <textarea 
                                                className="pc-input-modern-v2" 
                                                style={{ borderRadius: '24px', padding: '24px', minHeight: '120px', resize: 'none', fontSize: '1rem', lineHeight: 1.6 }} 
                                                value={p.message || ''} 
                                                onChange={e => updatePunishment(idx, 'message', e.target.value)} 
                                                placeholder="Il tuo account è stato sanzionato per violazione delle policy del server. Questa è un'azione automatica..." 
                                            />
                                        </div>
                                    </div>
                                ))}
                                {(config.punishments || []).length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '120px 40px', background: '#f8fafc', borderRadius: '40px', border: '2px dashed #e2e8f0' }}>
                                        <ShieldQuestion size={72} style={{ color: '#6366f1', opacity: 0.2, marginBottom: '24px' }} />
                                        <h3 style={{ margin: 0, fontWeight: 950, color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.8px' }}>Matrice Sanzioni Non Rilevata</h3>
                                        <p style={{ fontWeight: 700, color: '#94a3b8', fontSize: '1.1rem', marginTop: '10px' }}>Verix userà azioni di default finché non aggiungi configurazioni Studio.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2" style={{ marginBottom: '40px' }}>
                            <div className="header-icon" style={{ background: '#f8fafc', color: '#64748b' }}><EyeOff size={20} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>Whitelists & Esclusioni Studio</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Membri, ruoli e canali esenti dal monitoraggio Shield.</p>
                            </div>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                                <div className="pc-input-group-v2">
                                    <label>Ruoli Immuni (High Authority)</label>
                                    <DiscordSelector type="role" multiple options={discordData.roles} value={config.ignoredRoles || []} onChange={v => setConfig({...config, ignoredRoles: v})} />
                                </div>
                                <div className="pc-input-group-v2">
                                    <label>Safe Zones (Canali Protetti)</label>
                                    <DiscordSelector type="channel" multiple options={discordData.channels} value={config.ignoredChannels || []} onChange={v => setConfig({...config, ignoredChannels: v})} />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'messages' && (
                <div className="v-stack animate slide-up">
                    <EmbedMessageManager 
                        guildId={guildId}
                        module="moderation"
                        slugs={[
                            { key: 'warn', label: 'Warn Protocol (DM)', description: 'Notifica disciplinare inviata all\'utente per ammonimento.', variables: ['user', 'reason', 'moderator', 'warn_count'], group: 'Policy DM', groupIcon: ShieldAlert },
                            { key: 'timeout', label: 'Mute Protocol (DM)', description: 'Notifica disciplinare inviata all\'utente per silenziamento.', variables: ['user', 'duration', 'reason', 'moderator'], group: 'Policy DM', groupIcon: VolumeX },
                            { key: 'ban', label: 'Ban Protocol (DM)', description: 'Notifica finale di bando permanente dal server.', variables: ['user', 'reason', 'moderator'], group: 'Policy DM', groupIcon: UserMinus }
                        ]}
                    />
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 40px; max-width: 1700px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: white; padding: 32px; border-radius: 32px; box-shadow: var(--shadow-premium); border: 1px solid var(--border-light); }
            .header-info { display: flex; align-items: center; gap: 24px; }
            .pc-icon-box { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 12px 24px rgba(79, 70, 229, 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Outfit', sans-serif; font-size: 2.3rem; font-weight: 950; margin: 0; color: #1e293b; letter-spacing: -1.5px; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 950; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px; }
            .pc-status-tag-v2.on { background: #eef2ff; color: #4338ca; }
            .pc-status-tag-v2.off { background: #fef2f2; color: #ef4444; }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: white; border: none; padding: 14px 28px; border-radius: 18px; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.3s; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(99, 102, 241, 0.3); }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: #f8fafc; color: #64748b; border: 1.5px solid #e2e8f0; padding: 12px 28px; border-radius: 18px; font-weight: 850; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: #eef2ff; color: #4338ca; border-color: #c7d2fe; }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 10px; background: #f1f5f9; padding: 8px; border-radius: 24px; width: fit-content; overflow-x: auto; max-width: 100%; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 12px; padding: 16px 32px; border: none; background: transparent; color: #64748b; font-weight: 950; font-size: 1rem; border-radius: 18px; cursor: pointer; transition: 0.3s; white-space: nowrap; }
            .pc-tabs-v2 button.active { background: white; color: var(--primary); box-shadow: 0 8px 20px rgba(0,0,0,0.06); transform: translateY(-2px); }

            /* Card V2 */
            .pc-card-v2 { background: white; border: 1px solid var(--border-light); border-radius: 32px; padding: 40px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 20px; }
            .header-icon { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
            .card-header-v2 h3 { margin: 0; font-family: 'Outfit'; font-size: 1.5rem; font-weight: 950; color: #1e293b; letter-spacing: -0.5px; }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 10px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 950; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px; }
            .pc-input-modern-v2 { width: 100%; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 18px; padding: 18px 24px; font-weight: 950; color: #1e293b; outline: none; transition: 0.3s; }
            .pc-input-modern-v2:focus { border-color: var(--primary); background: white; box-shadow: 0 8px 25px rgba(99, 102, 241, 0.05); }

            /* Toggle V2 */
            .pc-toggle-v2 { position: relative; width: 44px; height: 22px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: #cbd5e1; transition: .4s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background: white; transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: var(--primary); }
            input:checked + .pc-slider-v2:before { transform: translateX(22px); }

            .pc-btn-delete-studio-v2:hover { background: #ef4444 !important; color: white !important; transform: rotate(8deg); }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-matrix-step-card-v2, :global(.light-theme) .pc-tabs-v2 { background: #ffffff !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
