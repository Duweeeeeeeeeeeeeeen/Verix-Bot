import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, Gift, Trophy, Clock, Users, Trash2, Plus, RefreshCcw, Settings2, Shield, Power, Palette, Zap, 
    Info, MessageSquare, ExternalLink, History, X, Calendar, ChevronRight, AlertCircle, Square, 
    Monitor, Smartphone, Sun, Moon, ArrowRight, Search, Sparkles, Layout, CheckCircle2, Box, Send, Star,
    MousePointer2, Timer, Award, UserCheck, ShieldAlert, Layers, Target, Eye, EyeOff, Wand2
} from 'lucide-react';
import { DiscordSelector, CustomSelect } from '../../../components/LazyConfigComponents';
import EmbedPreview from '../../../components/EmbedPreview';
import Head from 'next/head';

export default function GiveawayConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [config, setConfig] = useState(null);
  const [roles, setRoles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [activeGiveaways, setActiveGiveaways] = useState([]);
  const [scheduledGiveaways, setScheduledGiveaways] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('create');
  const [isPreviewMobile, setIsPreviewMobile] = useState(false);
  const [previewTheme, setPreviewTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  const [newGw, setNewGw] = useState({
    prize: '',
    duration: 60,
    winnerCount: 1,
    channelId: '',
    scheduledStart: '',
    customTitle: '🎁 GIVEAWAY STUDIO: {prize}',
    customDescription: 'Unisciti alla sfida premium cliccando il bottone qui sotto!\n\n**Premio:** {prize}\n**Scadenza:** {endtime}',
    color: '#6366f1',
    buttonLabel: 'Partecipa Ora',
    buttonEmoji: '🎉',
    buttonStyle: 'PRIMARY'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const previewEmbed = {
    title: (newGw.customTitle || '').replace(/{prize}/g, newGw.prize || 'Nitro Classic'),
    description: (newGw.customDescription || '')
        .replace(/{prize}/g, newGw.prize || 'Nitro Classic')
        .replace(/{endtime}/g, `<t:${Math.floor((Date.now() + newGw.duration * 60000) / 1000)}:R>`),
    color: newGw.color,
    footer: 'Termina il',
    timestamp: true,
    fields: [
        { name: `👥 Partecipanti`, value: '1,248', inline: true }
    ],
    button: { 
        label: newGw.buttonLabel, 
        emoji: newGw.buttonEmoji, 
        style: newGw.buttonStyle 
    }
  };

  useEffect(() => {
    if (guildId && mounted) fetchData();
  }, [guildId, mounted]);

  const fetchData = async () => {
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [configRes, discordRes, activeRes, scheduledRes, logsRes] = await Promise.all([
        api.request('/config/' + guildId + '/giveaway').catch(() => ({ enabled: false })),
        api.request('/config/' + guildId + '/discord-data').catch(() => ({ roles: [], channels: [] })),
        api.request('/config/' + guildId + '/giveaways/active').catch(() => ({ data: [] })),
        api.request('/config/' + guildId + '/giveaways/scheduled').catch(() => ({ data: [] })),
        api.request('/config/' + guildId + '/giveaways/logs').catch(() => ({ data: [] }))
      ]);
      
      setConfig(configRes.data || configRes || { enabled: false });
      if (discordRes) {
        setRoles(discordRes.roles || []);
        setChannels(discordRes.channels?.filter(c => c.type === 0 || c.type === 5) || []);
      }
      setActiveGiveaways(activeRes.data || activeRes || []);
      setScheduledGiveaways(scheduledRes.data || scheduledRes || []);
      setLogs(logsRes.data || logsRes || []);
    } catch (e) {
      console.error("Giveaway load error:", e);
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request('/config/' + guildId + '/giveaway', {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast("Giveaway Studio Pro sincronizzato!");
    } catch (e) {
      showToast("Errore durante il salvataggio.", 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleCreateGiveaway = async (forceNow = false) => {
    if (!newGw.prize || !newGw.channelId) return showToast('Configura premio e canale di lancio!', 'error');
    
    const dataToPost = {
        ...newGw,
        scheduledStart: (newGw.scheduledStart && !forceNow) ? new Date(newGw.scheduledStart).getTime() : ''
    };
    
    setCreating(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const res = await api.request('/config/' + guildId + '/giveaways/create', {
        method: 'POST',
        body: JSON.stringify(dataToPost)
      });
      if (res) {
        showToast(dataToPost.scheduledStart ? 'Estrazione programmata nello Studio!' : 'Estrazione lanciata con successo!');
        setNewGw({ ...newGw, prize: '', scheduledStart: '' });
        fetchData();
        setActiveTab('live');
      }
    } catch (e) {
      showToast('Errore durante il lancio.', 'error');
    } finally {
      setCreating(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleDeleteGiveaway = async (id) => {
    if (!confirm('Sei sicuro di voler terminare definitivamente questa estrazione?')) return;
    try {
      await api.request('/config/' + guildId + '/giveaways/' + id, { method: 'DELETE' });
      showToast('Giveaway rimosso dallo Studio.');
      fetchData();
    } catch (e) {
      showToast('Errore durante la rimozione.', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>Giveaway Studio Pro | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #312e81 100%)' }}>
                    <Gift size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>Giveaway Studio Pro</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? 'MOTORE ESTRAZIONI ATTIVO' : 'MOTORE ESTRAZIONI OFFLINE'}
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
                <button className="pc-btn-primary" onClick={handleSaveConfig} disabled={saving} style={{ background: '#312e81' }}>
                    <Save size={18} />
                    <span>{saving ? 'Sincronizzazione...' : 'Salva Studio'}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-container-v2" style={{ marginBottom: '40px' }}>
            <div className="pc-tabs-v2">
                {[
                    { id: 'create', icon: <Plus size={18} />, label: 'Nuovo Progetto' },
                    { id: 'live', icon: <Zap size={18} />, label: 'Estrazioni Live', count: activeGiveaways.length },
                    { id: 'logs', icon: <History size={18} />, label: 'Archivio Storico' },
                    { id: 'settings', icon: <Shield size={18} />, label: 'Security & Roles' }
                ].map(tab => (
                    <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
                        {tab.icon} <span>{tab.label}</span>
                        {tab.count !== undefined && tab.count > 0 && <span className="pc-tab-badge-v2">{tab.count}</span>}
                    </button>
                ))}
            </div>
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'create' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '40px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                <div className="header-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}><Award size={20} /></div>
                                <div className="v-stack" style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>Core Configuration</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Definisci i parametri fondamentali del tuo giveaway.</p>
                                </div>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>Premio in Palio Studio</label>
                                    <div className="pc-input-wrapper-v2" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '22px' }}>
                                        <Gift size={22} style={{ marginLeft: '24px', color: '#94a3b8' }} />
                                        <input style={{ width: '100%', border: 'none', background: 'transparent', padding: '24px', fontWeight: 950, fontSize: '1.25rem', outline: 'none', color: '#1e293b' }} value={newGw.prize} onChange={e => setNewGw({...newGw, prize: e.target.value})} placeholder="Es: Nitro Classic Premium..." />
                                    </div>
                                </div>
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', marginTop: '32px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>Canale di Distribuzione</label>
                                        <DiscordSelector type="channel" options={channels} value={newGw.channelId} onChange={v => setNewGw({...newGw, channelId: v})} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Winner Pool Count</label>
                                        <div className="pc-input-wrapper-v2" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '22px' }}>
                                            <Users size={20} style={{ marginLeft: '20px', color: '#94a3b8' }} />
                                            <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '20px', fontWeight: 950, fontSize: '1.2rem', color: '#1e293b' }} value={newGw.winnerCount} onChange={e => setNewGw({...newGw, winnerCount: parseInt(e.target.value)})} min="1" max="50" />
                                        </div>
                                    </div>
                                </div>
                                <div className="pc-input-group-v2" style={{ marginTop: '32px' }}>
                                    <label>Durata Operativa (Minuti)</label>
                                    <div className="pc-input-wrapper-v2" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '22px' }}>
                                        <Timer size={22} style={{ marginLeft: '24px', color: '#94a3b8' }} />
                                        <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '24px', fontWeight: 950, fontSize: '1.3rem', color: '#1e293b' }} value={newGw.duration} onChange={e => setNewGw({...newGw, duration: parseInt(e.target.value)})} min="1" />
                                    </div>
                                    <div className="pc-time-presets-v2" style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                        {[60, 1440, 10080].map(m => (
                                            <button key={m} onClick={() => setNewGw({...newGw, duration: m})} className="pc-preset-btn-v2" style={{ background: '#f1f5f9', border: '1.5px solid #e2e8f0', padding: '10px 20px', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 950, color: '#475569', cursor: 'pointer', transition: '0.2s' }}>
                                                {m === 60 ? '1 Ora' : m === 1440 ? '24 Ore' : '1 Settimana'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                <div className="header-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><Palette size={20} /></div>
                                <div className="v-stack" style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>Studio Estetico & Branding</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Personalizza l'aspetto visivo del tuo giveaway.</p>
                                </div>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>Titolo Personalizzato (Branding)</label>
                                    <input className="pc-input-modern-v2" style={{ padding: '20px', fontSize: '1.15rem', borderRadius: '20px' }} value={newGw.customTitle} onChange={e => setNewGw({...newGw, customTitle: e.target.value})} />
                                </div>
                                <div className="pc-input-group-v2" style={{ marginTop: '32px' }}>
                                    <label>Descrizione & Protocolli</label>
                                    <textarea className="pc-input-modern-v2" style={{ padding: '24px', borderRadius: '28px', minHeight: '160px', resize: 'none', lineHeight: 1.7, fontSize: '1rem' }} value={newGw.customDescription} onChange={e => setNewGw({...newGw, customDescription: e.target.value})} />
                                    <div style={{ display: 'flex', gap: '14px', marginTop: '20px' }}>
                                        <div className="pc-var-chip-v2" style={{ background: '#f5f3ff', border: '1.5px solid #ddd6fe', color: '#6366f1', padding: '8px 18px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 950 }}>{`{prize}`}</div>
                                        <div className="pc-var-chip-v2" style={{ background: '#f5f3ff', border: '1.5px solid #ddd6fe', color: '#6366f1', padding: '8px 18px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 950 }}>{`{endtime}`}</div>
                                    </div>
                                </div>
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '40px', marginTop: '40px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>Label Pulsante Partecipazione</label>
                                        <input className="pc-input-modern-v2" style={{ padding: '20px', borderRadius: '20px' }} value={newGw.buttonLabel} onChange={e => setNewGw({...newGw, buttonLabel: e.target.value})} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Brand Accent Color</label>
                                        <div style={{ display: 'flex', gap: '14px' }}>
                                            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: newGw.color, border: '4px solid white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}></div>
                                            <input type="color" id="studio-color-picker" style={{ display: 'none' }} value={newGw.color} onChange={e => setNewGw({...newGw, color: e.target.value})} />
                                            <button onClick={() => document.getElementById('studio-color-picker').click()} style={{ background: '#f1f5f9', border: '1.5px solid #e2e8f0', borderRadius: '18px', padding: '0 20px', fontWeight: 950, fontSize: '0.8rem', cursor: 'pointer' }}>PICK</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                <div className="header-icon" style={{ background: '#fffbeb', color: '#d97706' }}><Calendar size={20} /></div>
                                <h3 style={{ margin: 0 }}>Timeline Protocol</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>Scheduled Start Time (Opzionale)</label>
                                    <input type="datetime-local" className="pc-input-modern-v2" style={{ padding: '20px', borderRadius: '20px' }} value={newGw.scheduledStart} onChange={e => setNewGw({...newGw, scheduledStart: e.target.value})} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', marginTop: '48px' }}>
                                    <button className="pc-btn-primary" style={{ padding: '24px', borderRadius: '28px', fontSize: '1.2rem', justifyContent: 'center', background: 'linear-gradient(135deg, #6366f1 0%, #312e81 100%)' }} onClick={() => handleCreateGiveaway(true)} disabled={creating}>
                                        <Zap size={28} />
                                        <span>Lancia Ora</span>
                                    </button>
                                    <button style={{ background: 'white', color: '#6366f1', border: '2.5px solid #ddd6fe', padding: '24px', borderRadius: '28px', fontSize: '1.15rem', fontWeight: 950, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', transition: '0.3s' }} onClick={() => handleCreateGiveaway(false)} disabled={creating}>
                                        <Calendar size={28} />
                                        <span>Programma</span>
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="pc-preview-sticky-v2 animate fade-in" style={{ position: 'sticky', top: '40px', height: 'fit-content' }}>
                        <div className="pc-card-v2" style={{ padding: '0', overflow: 'hidden', border: 'none', boxShadow: '0 25px 60px rgba(0,0,0,0.12)', borderRadius: '40px' }}>
                            <div style={{ background: '#f8fafc', padding: '32px', borderBottom: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontWeight: 950, color: '#1e293b', fontSize: '1.1rem' }}><Eye size={24} style={{ color: '#6366f1' }} /> Visual Studio Live</div>
                                <div style={{ display: 'flex', gap: '8px', background: 'white', padding: '6px', borderRadius: '18px', border: '1.5px solid #e2e8f0' }}>
                                    <button onClick={() => setIsPreviewMobile(false)} style={{ border: 'none', background: !isPreviewMobile ? '#f1f5f9' : 'transparent', color: !isPreviewMobile ? '#6366f1' : '#94a3b8', padding: '12px', borderRadius: '14px', cursor: 'pointer', transition: '0.2s' }}><Monitor size={20} /></button>
                                    <button onClick={() => setIsPreviewMobile(true)} style={{ border: 'none', background: isPreviewMobile ? '#f1f5f9' : 'transparent', color: isPreviewMobile ? '#6366f1' : '#94a3b8', padding: '12px', borderRadius: '14px', cursor: 'pointer', transition: '0.2s' }}><Smartphone size={20} /></button>
                                </div>
                            </div>
                            <div style={{ padding: '48px', background: previewTheme === 'dark' ? '#0f172a' : '#f8fafc', minHeight: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <EmbedPreview data={previewEmbed} isMobile={isPreviewMobile} theme={previewTheme} />
                            </div>
                            <div style={{ padding: '24px 40px', background: 'white', borderTop: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                                <button onClick={() => setPreviewTheme('dark')} style={{ border: 'none', background: previewTheme === 'dark' ? '#f1f5f9' : 'transparent', color: previewTheme === 'dark' ? '#6366f1' : '#64748b', fontWeight: 950, fontSize: '0.85rem', padding: '12px 24px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}><Moon size={18} /> DARK MODE</button>
                                <button onClick={() => setPreviewTheme('light')} style={{ border: 'none', background: previewTheme === 'light' ? '#f1f5f9' : 'transparent', color: previewTheme === 'light' ? '#6366f1' : '#64748b', fontWeight: 950, fontSize: '0.85rem', padding: '12px 24px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}><Sun size={18} /> LIGHT MODE</button>
                            </div>
                        </div>
                    </aside>
                </div>
            )}

            {activeTab === 'live' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2" style={{ marginBottom: '40px' }}>
                            <div className="header-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}><Zap size={20} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>Estrazioni Studio Live</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Monitoraggio in tempo reale delle estrazioni attive sul server.</p>
                            </div>
                        </div>
                        <div className="card-body-v2">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '32px' }}>
                                {activeGiveaways.map(gw => (
                                    <div key={gw.messageId} className="pc-matrix-item-v2 animate slide-up" style={{ background: 'white', border: '1.5px solid #e2e8f0', padding: '40px', borderRadius: '40px', display: 'flex', gap: '32px', alignItems: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                                        <div style={{ width: '88px', height: '88px', background: '#f5f3ff', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', border: '2px solid #ddd6fe' }}><Trophy size={40} /></div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 12px 0', fontSize: '1.5rem', fontWeight: 950, color: '#1e293b', letterSpacing: '-0.8px' }}>{gw.prize}</h4>
                                            <div style={{ display: 'flex', gap: '16px' }}>
                                                <div className="pc-live-badge-v2" style={{ background: '#f1f5f9', color: '#475569', padding: '10px 20px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 950, border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}><Clock size={18} /> {new Date(gw.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                <div className="pc-live-badge-v2" style={{ background: '#eef2ff', color: '#6366f1', padding: '10px 20px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 950, border: '1.5px solid #ddd6fe', display: 'flex', alignItems: 'center', gap: '10px' }}><Users size={18} /> {gw.participants?.length || 0} Entrate</div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteGiveaway(gw.messageId)} className="pc-btn-delete-studio-v2" style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }}>
                                            <Trash2 size={26} />
                                        </button>
                                    </div>
                                ))}
                                {activeGiveaways.length === 0 && (
                                    <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '140px 40px', background: '#f8fafc', borderRadius: '48px', border: '2px dashed #e2e8f0' }}>
                                        <Box size={100} style={{ margin: '0 auto 32px', opacity: 0.1, color: '#6366f1' }} />
                                        <h3 style={{ margin: 0, fontWeight: 950, color: '#1e293b', fontSize: '1.8rem', letterSpacing: '-1px' }}>Nessuna Estrazione Live</h3>
                                        <p style={{ fontWeight: 800, color: '#94a3b8', fontSize: '1.2rem', marginTop: '12px' }}>Inizia a coinvolgere la tua community creando un nuovo giveaway.</p>
                                        <button onClick={() => setActiveTab('create')} className="pc-btn-primary" style={{ margin: '40px auto 0', padding: '18px 40px', borderRadius: '20px', fontSize: '1.1rem' }}><Plus size={22} /> Nuovo Progetto</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="v-stack animate slide-up">
                    <section className="pc-card-v2" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '48px 48px 32px 48px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <div className="header-icon" style={{ background: '#f1f5f9', color: '#475569' }}><History size={24} /></div>
                            <h3 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 950, fontSize: '1.8rem', letterSpacing: '-0.8px' }}>Archivio Risultati Verix</h3>
                        </div>
                        <div style={{ width: '100%', overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '32px 48px', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2.5px', fontWeight: 950 }}>Premio Assegnato</th>
                                        <th style={{ textAlign: 'left', padding: '32px 48px', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2.5px', fontWeight: 950 }}>Timeline Conclusione</th>
                                        <th style={{ textAlign: 'left', padding: '32px 48px', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2.5px', fontWeight: 950 }}>User Engagement</th>
                                        <th style={{ textAlign: 'left', padding: '32px 48px', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2.5px', fontWeight: 950 }}>Studio Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log, i) => (
                                        <tr key={i} style={{ borderTop: '2px solid #f8fafc', transition: '0.2s' }}>
                                            <td style={{ padding: '40px 48px', fontWeight: 950, color: '#1e293b', fontSize: '1.25rem', letterSpacing: '-0.5px' }}>{log.prize}</td>
                                            <td style={{ padding: '40px 48px', fontWeight: 800, color: '#64748b', fontSize: '1.05rem' }}>{new Date(log.endTime).toLocaleDateString()}</td>
                                            <td style={{ padding: '40px 48px' }}>
                                                <div className="pc-live-badge-v2" style={{ background: '#f1f5f9', border: '1.5px solid #e2e8f0', color: '#475569', padding: '10px 20px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 950 }}><Users size={18} /> {log.participants?.length || 0} Membri</div>
                                            </td>
                                            <td style={{ padding: '40px 48px' }}>
                                                <div style={{ background: '#ecfdf5', color: '#10b981', padding: '12px 24px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 950, display: 'inline-flex', alignItems: 'center', gap: '12px', border: '1.5px solid #d1fae5' }}><CheckCircle2 size={18} /> ESTRATTO</div>
                                            </td>
                                        </tr>
                                    ))}
                                    {logs.length === 0 && (
                                        <tr><td colSpan="4" style={{ padding: '140px', textAlign: 'center', color: '#94a3b8', fontWeight: 950, fontSize: '1.4rem', opacity: 0.5 }}>L'archivio dello Studio è attualmente vuoto.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2" style={{ marginBottom: '40px' }}>
                            <div className="header-icon" style={{ background: '#fef2f2', color: '#ef4444' }}><ShieldAlert size={20} /></div>
                            <h3 style={{ margin: 0 }}>Protocollo Authority Studio</h3>
                        </div>
                        <div className="card-body-v2">
                             <div className="pc-input-group-v2">
                                <label>Authorized Giveaway Managers</label>
                                <DiscordSelector type="role" multiple={true} options={roles} value={config.managerRoles || []} onChange={v => setConfig({...config, managerRoles: v})} />
                             </div>
                             
                             <div className="pc-shield-banner-v2" style={{ marginTop: '56px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', padding: '48px', borderRadius: '40px', border: '1.5px solid #e2e8f0', display: 'flex', gap: '32px', alignItems: 'center' }}>
                                <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', boxShadow: '0 12px 24px rgba(0,0,0,0.06)' }}>
                                    <ShieldAlert size={40} />
                                </div>
                                <div className="v-stack" style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 10px 0', fontWeight: 950, fontSize: '1.4rem', color: '#1e293b', letterSpacing: '-0.5px' }}>Sicurezza & Privilegi Staff</h4>
                                    <p style={{ margin: 0, fontSize: '1.05rem', color: '#64748b', fontWeight: 700, lineHeight: 1.8, maxWidth: '900px' }}>I ruoli autorizzati potranno gestire l'intero ciclo di vita delle estrazioni. Questo include il bypass dei permessi standard per la creazione, terminazione anticipata e estrazione manuale dei vincitori.</p>
                                </div>
                             </div>
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
            .pc-icon-box { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 12px 24px rgba(99, 102, 241, 0.25); }
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
            .pc-tabs-v2 { display: flex; gap: 10px; background: #f1f5f9; padding: 8px; border-radius: 24px; width: fit-content; }
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
            .pc-input-modern-v2 { width: 100%; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 18px; padding: 18px 24px; font-weight: 950; color: #1e293b; outline: none; transition: 0.3s; }
            .pc-input-modern-v2:focus { border-color: var(--primary); background: white; box-shadow: 0 8px 25px rgba(99, 102, 241, 0.05); }

            .pc-matrix-item-v2:hover { border-color: #6366f1 !important; transform: translateY(-4px); box-shadow: 0 12px 40px rgba(99, 102, 241, 0.08) !important; }
            .pc-btn-delete-studio-v2:hover { background: #ef4444 !important; color: white !important; transform: rotate(8deg); }
            .pc-preset-btn-v2:hover { background: white !important; border-color: #6366f1 !important; color: #6366f1 !important; transform: translateY(-2px); }

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

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-matrix-item-v2, :global(.light-theme) .pc-tabs-v2 { background: #ffffff !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
