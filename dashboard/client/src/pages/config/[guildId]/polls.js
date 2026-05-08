import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, ListChecks, Plus, Trash2, Send, BarChart, Clock, Users, Settings2, Palette, CheckCircle2, 
    XCircle, Info, Calendar, Zap, Monitor, Smartphone, Sun, Moon, Power, Hash, ChevronRight, 
    Trash, ArrowRight, Layout, Layers, Box, Sparkles, MessageSquare, PieChart, Vote, Activity,
    Shapes, LayoutGrid, Timer, ShieldCheck, Flag
} from 'lucide-react';
import { DiscordSelector, CustomSelect } from '../../../components/LazyConfigComponents';
import EmbedPreview from '../../../components/EmbedPreview';
import Head from 'next/head';

export default function PollsConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [config, setConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [activePolls, setActivePolls] = useState([]);
  const [activeTab, setActiveTab] = useState('create');
  const [previewTheme, setPreviewTheme] = useState('dark');
  const [previewIsMobile, setPreviewIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [newPoll, setNewPoll] = useState({
      channelId: '',
      question: '',
      options: [
          { emoji: '1️⃣', label: 'Option 1' },
          { emoji: '2️⃣', label: 'Option 2' }
      ],
      duration: 60,
      mode: 'SINGLE',
      color: '#f59e0b'
  });

  const fetchData = async () => {
    if (!guildId || !mounted) return;
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [configRes, discordRes, pollsRes] = await Promise.all([
        api.request(`/config/${guildId}`).catch(() => ({ polls: {} })),
        api.request(`/config/${guildId}/discord-data`).catch(() => ({ channels: [] })),
        api.request(`/config/${guildId}/polls/active`).catch(() => ({ data: [] }))
      ]);
      
      setConfig(configRes.data?.polls || configRes.polls || { enabled: false, logChannelId: null, defaultColor: '#f59e0b' });
      setChannels((discordRes.channels || discordRes.data?.channels || []).filter(c => c.type === 0 || c.type === 5));
      setActivePolls(pollsRes.data || pollsRes || []);
    } catch (e) {
      console.error("Polls load error:", e);
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [guildId, mounted]);

  const handleSaveConfig = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/polls/config`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast("Protocollo Sondaggi sincronizzato!");
    } catch (e) {
      showToast("Errore durante il salvataggio.", 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleCreatePoll = async () => {
    if (!newPoll.question || !newPoll.channelId) return showToast("Configura domanda e canale di lancio!", 'error');
    if (newPoll.options.some(o => !o.label)) return showToast("Tutte le opzioni richiedono un testo!", 'error');

    setCreating(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const res = await api.request(`/config/${guildId}/polls/create`, {
        method: 'POST',
        body: JSON.stringify(newPoll)
      });
      if (res.success || res) {
          showToast("Votazione lanciata con successo nello Studio!");
          setActiveTab('active');
          fetchData();
          setNewPoll({ ...newPoll, question: '', options: [{ emoji: '1️⃣', label: 'Option 1' }, { emoji: '2️⃣', label: 'Option 2' }] });
      }
    } catch (e) {
      showToast("Errore durante il lancio del sondaggio.", 'error');
    } finally {
      setCreating(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const addOption = () => {
      if (newPoll.options.length >= 10) return showToast("Limite massimo raggiunto (10 scelte).", 'error');
      const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
      const nextEmoji = emojis[newPoll.options.length] || '🔘';
      setNewPoll({ ...newPoll, options: [...newPoll.options, { emoji: nextEmoji, label: `Choice ${newPoll.options.length + 1}` }] });
  };

  const removeOption = (index) => {
      if (newPoll.options.length <= 2) return showToast('Minimo 2 opzioni richieste per lo Studio.', 'error');
      setNewPoll({ ...newPoll, options: newPoll.options.filter((_, i) => i !== index) });
  };

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  const previewPollEmbed = {
      title: `📊 POLL STUDIO: ${newPoll.question || '...' }`,
      description: newPoll.options.map(o => `${o.emoji} **${o.label}**`).join('\n\n'),
      color: newPoll.color,
      footer: `Votazione termina tra ${newPoll.duration} minuti • Verix Studio`,
      timestamp: true,
      buttons: newPoll.options.map((o, i) => ({
          emoji: o.emoji,
          style: 'SECONDARY'
      }))
  };

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>Polls Studio | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                    <Vote size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>Polls Studio Pro</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? 'MOTORE DI VOTO OPERATIVO' : 'MOTORE DI VOTO OFFLINE'}
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
                <button className="pc-btn-primary" onClick={handleSaveConfig} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? 'Sincronizzazione...' : 'Salva Studio'}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-container-v2" style={{ marginBottom: '40px' }}>
            <div className="pc-tabs-v2">
                <button className={activeTab === 'create' ? 'active' : ''} onClick={() => setActiveTab('create')}>
                    <Plus size={16} /> <span>Nuovo Progetto</span>
                </button>
                <button className={activeTab === 'active' ? 'active' : ''} onClick={() => setActiveTab('active')}>
                    <Activity size={16} /> <span>Votazioni Live</span>
                    {activePolls.length > 0 && <span className="tab-count-v2">{activePolls.length}</span>}
                </button>
                <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                    <ShieldCheck size={16} /> <span>Security & Studio</span>
                </button>
            </div>
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'create' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 480px', gap: '40px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                <div className="header-icon" style={{ background: '#fffbeb', color: '#d97706' }}><MessageSquare size={18} /></div>
                                <h3 style={{ margin: 0 }}>Domanda & Timeline</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>Domanda del Progetto</label>
                                    <textarea 
                                        className="pc-input-modern-v2" 
                                        style={{ width: '100%', minHeight: '120px', fontSize: '1.4rem', fontWeight: 950, borderRadius: '22px', padding: '24px', lineHeight: 1.4, letterSpacing: '-0.5px' }} 
                                        value={newPoll.question} 
                                        onChange={e => setNewPoll({...newPoll, question: e.target.value})} 
                                        placeholder="Cosa vuoi chiedere alla tua community?" 
                                    />
                                </div>
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', marginTop: '32px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>Canale di Lancio</label>
                                        <DiscordSelector type="channel" options={channels} value={newPoll.channelId} onChange={v => setNewPoll({...newPoll, channelId: v})} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Durata Votazione (Minuti)</label>
                                        <div className="pc-input-wrapper-v2" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '18px' }}>
                                            <Timer size={18} style={{ marginLeft: '18px', color: '#94a3b8' }} />
                                            <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '18px 20px', fontWeight: 950, fontSize: '1.1rem' }} value={newPoll.duration} onChange={e => setNewPoll({...newPoll, duration: parseInt(e.target.value)})} min="1" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="v-stack" style={{ marginTop: '48px', gap: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div className="v-stack">
                                            <label style={{ fontSize: '0.75rem', fontWeight: 950, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Matrice Scelte</label>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#f59e0b' }}>CONFIGURA FINO A 10 OPZIONI</span>
                                        </div>
                                        <button className="pc-btn-secondary-v2" style={{ padding: '12px 24px', borderRadius: '14px', background: '#fffbeb', border: '1.5px solid #fde68a', color: '#d97706', fontWeight: 950, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={addOption} disabled={newPoll.options.length >= 10}>
                                            <Plus size={18} /> <span>Aggiungi Scelta</span>
                                        </button>
                                    </div>
                                    <div className="v-stack" style={{ gap: '16px' }}>
                                        {newPoll.options.map((opt, idx) => (
                                            <div key={idx} className="pc-poll-option-v2 animate slide-up" style={{ display: 'flex', gap: '18px', alignItems: 'center', background: '#f8fafc', padding: '18px', borderRadius: '24px', border: '1.5px solid #e2e8f0', transition: '0.3s', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                                <div style={{ width: '56px', height: '56px', background: 'white', borderRadius: '14px', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.03)' }}>
                                                    <input style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center', fontSize: '1.5rem', outline: 'none' }} value={opt.emoji} onChange={e => {
                                                        const newOpts = [...newPoll.options];
                                                        newOpts[idx].emoji = e.target.value;
                                                        setNewPoll({...newPoll, options: newOpts});
                                                    }} />
                                                </div>
                                                <input style={{ flex: 1, border: 'none', background: 'transparent', fontWeight: 900, color: '#1e293b', outline: 'none', fontSize: '1.1rem' }} value={opt.label} onChange={e => {
                                                    const newOpts = [...newPoll.options];
                                                    newOpts[idx].label = e.target.value;
                                                    setNewPoll({...newPoll, options: newOpts});
                                                }} placeholder={`Inserisci opzione ${idx + 1}...`} />
                                                <button onClick={() => removeOption(idx)} className="pc-btn-delete-studio-v2" style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={22} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pc-input-group-v2" style={{ marginTop: '48px' }}>
                                    <label>Politica di Voto & Restrizioni</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '16px' }}>
                                        <button onClick={() => setNewPoll({...newPoll, mode: 'SINGLE'})} className={`pc-mode-btn-v2 ${newPoll.mode === 'SINGLE' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', background: newPoll.mode === 'SINGLE' ? '#fffbeb' : '#f8fafc', border: newPoll.mode === 'SINGLE' ? '2.5px solid #f59e0b' : '2.5px solid #e2e8f0', borderRadius: '24px', cursor: 'pointer', transition: '0.3s', textAlign: 'left' }}>
                                            <div className="mode-icon-v2" style={{ width: '48px', height: '48px', borderRadius: '14px', background: newPoll.mode === 'SINGLE' ? '#f59e0b' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: newPoll.mode === 'SINGLE' ? 'white' : '#cbd5e1', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}><CheckCircle2 size={24} /></div>
                                            <div className="v-stack">
                                                <span className="mode-title-v2" style={{ fontWeight: 950, fontSize: '1.1rem', color: newPoll.mode === 'SINGLE' ? '#b45309' : '#1e293b' }}>Voto Esclusivo</span>
                                                <small style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8, color: newPoll.mode === 'SINGLE' ? '#d97706' : '#64748b' }}>Un solo voto per identità</small>
                                            </div>
                                        </button>
                                        <button onClick={() => setNewPoll({...newPoll, mode: 'MULTIPLE'})} className={`pc-mode-btn-v2 ${newPoll.mode === 'MULTIPLE' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', background: newPoll.mode === 'MULTIPLE' ? '#fffbeb' : '#f8fafc', border: newPoll.mode === 'MULTIPLE' ? '2.5px solid #f59e0b' : '2.5px solid #e2e8f0', borderRadius: '24px', cursor: 'pointer', transition: '0.3s', textAlign: 'left' }}>
                                            <div className="mode-icon-v2" style={{ width: '48px', height: '48px', borderRadius: '14px', background: newPoll.mode === 'MULTIPLE' ? '#f59e0b' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: newPoll.mode === 'MULTIPLE' ? 'white' : '#cbd5e1', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}><Layers size={24} /></div>
                                            <div className="v-stack">
                                                <span className="mode-title-v2" style={{ fontWeight: 950, fontSize: '1.1rem', color: newPoll.mode === 'MULTIPLE' ? '#b45309' : '#1e293b' }}>Scelte Multiple</span>
                                                <small style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8, color: newPoll.mode === 'MULTIPLE' ? '#d97706' : '#64748b' }}>Più voti consentiti per utente</small>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="pc-preview-sticky-v2 animate fade-in" style={{ position: 'sticky', top: '40px', height: 'fit-content' }}>
                        <div className="pc-card-v2" style={{ padding: '0', overflow: 'hidden', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                            <div style={{ background: '#f8fafc', padding: '28px', borderBottom: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 950, color: '#1e293b', fontSize: '1rem' }}><PieChart size={22} style={{ color: '#f59e0b' }} /> Visual Studio Preview</div>
                                <div style={{ display: 'flex', gap: '6px', background: 'white', padding: '6px', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
                                    <button onClick={() => setPreviewIsMobile(false)} style={{ border: 'none', background: !previewIsMobile ? '#fffbeb' : 'transparent', color: !previewIsMobile ? '#f59e0b' : '#94a3b8', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: '0.2s' }}><Monitor size={18} /></button>
                                    <button onClick={() => setPreviewIsMobile(true)} style={{ border: 'none', background: previewIsMobile ? '#fffbeb' : 'transparent', color: previewIsMobile ? '#f59e0b' : '#94a3b8', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: '0.2s' }}><Smartphone size={18} /></button>
                                </div>
                            </div>
                            <div style={{ padding: '40px', background: previewTheme === 'dark' ? '#0f172a' : '#f8fafc', minHeight: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <EmbedPreview data={previewPollEmbed} isMobile={previewIsMobile} theme={previewTheme} />
                            </div>
                            <div style={{ padding: '20px 32px', background: 'white', borderTop: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                                <button onClick={() => setPreviewTheme('dark')} style={{ border: 'none', background: previewTheme === 'dark' ? '#fffbeb' : 'transparent', color: previewTheme === 'dark' ? '#f59e0b' : '#64748b', fontWeight: 950, fontSize: '0.8rem', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}><Moon size={16} /> DARK</button>
                                <button onClick={() => setPreviewTheme('light')} style={{ border: 'none', background: previewTheme === 'light' ? '#fffbeb' : 'transparent', color: previewTheme === 'light' ? '#f59e0b' : '#64748b', fontWeight: 950, fontSize: '0.8rem', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}><Sun size={16} /> LIGHT</button>
                            </div>
                        </div>
                        <button className="pc-btn-primary" style={{ marginTop: '32px', width: '100%', padding: '24px', borderRadius: '28px', fontSize: '1.2rem', justifyContent: 'center', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 10px 30px rgba(245, 158, 11, 0.2)' }} onClick={handleCreatePoll} disabled={creating}>
                            <Send size={24} />
                            <span>{creating ? 'Distribuzione...' : 'Lancia Votazione'}</span>
                        </button>
                    </aside>
                </div>
            )}

            {activeTab === 'active' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                            <div className="header-icon" style={{ background: '#fffbeb', color: '#d97706' }}><Activity size={18} /></div>
                            <h3 style={{ margin: 0 }}>Votazioni Live nello Studio</h3>
                        </div>
                        <div className="card-body-v2">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: '28px' }}>
                                {activePolls.map(poll => (
                                    <div key={poll._id} className="pc-matrix-item-v2 animate slide-up" style={{ background: 'white', border: '1.5px solid #e2e8f0', padding: '32px', borderRadius: '32px', display: 'flex', gap: '24px', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                                        <div style={{ width: '72px', height: '72px', background: '#fffbeb', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', border: '1.5px solid #fde68a' }}><BarChart size={32} /></div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 10px 0', fontSize: '1.3rem', fontWeight: 950, color: '#1e293b', letterSpacing: '-0.5px' }}>{poll.question}</h4>
                                            <div style={{ display: 'flex', gap: '14px' }}>
                                                <div className="pc-live-badge-v2" style={{ background: '#fffbeb', color: '#d97706', border: '1.5px solid #fde68a', padding: '6px 14px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16} /> {new Date(poll.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                <div className="pc-live-badge-v2" style={{ background: '#fffbeb', color: '#d97706', border: '1.5px solid #fde68a', padding: '6px 14px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={16} /> {poll.options.reduce((acc, o) => acc + (o.votes?.length || 0), 0)} Voti</div>
                                            </div>
                                        </div>
                                        <button className="pc-btn-delete-studio-v2" style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}><Trash2 size={22} /></button>
                                    </div>
                                ))}
                                {activePolls.length === 0 && (
                                    <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '120px 40px', background: '#f8fafc', borderRadius: '40px', border: '2px dashed #e2e8f0' }}>
                                        <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#cbd5e1' }}>
                                            <Shapes size={40} />
                                        </div>
                                        <p style={{ fontWeight: 950, color: '#94a3b8', margin: 0, fontSize: '1.2rem' }}>Nessun sondaggio attivo nello Studio.</p>
                                        <button onClick={() => setActiveTab('create')} className="pc-btn-primary" style={{ margin: '32px auto 0', padding: '12px 24px', borderRadius: '14px', background: '#f59e0b' }}><Plus size={18} /> Inizia Ora</button>
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
                        <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                            <div className="header-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}><Settings2 size={18} /></div>
                            <h3 style={{ margin: 0 }}>Protocollo & Studio Defaults</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-group-v2">
                                <label>Target Archivio Risultati</label>
                                <DiscordSelector type="channel" options={channels} value={config.logChannelId} onChange={val => setConfig({...config, logChannelId: val})} />
                            </div>
                            <div className="pc-input-group-v2" style={{ marginTop: '40px' }}>
                                <label>Branding Predefinito (Accent Color)</label>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: config.defaultColor, border: '3.5px solid white', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}></div>
                                    <input type="color" style={{ width: '0', height: '0', opacity: 0, position: 'absolute' }} id="poll-def-color-studio" value={config.defaultColor} onChange={e => setConfig({...config, defaultColor: e.target.value})} />
                                    <button onClick={() => document.getElementById('poll-def-color-studio').click()} className="pc-btn-outline-v2" style={{ background: '#f8fafc', padding: '16px 28px', borderRadius: '16px', fontWeight: 950, fontSize: '0.9rem', border: '1.5px solid #e2e8f0', cursor: 'pointer' }}>HEX PICKER</button>
                                    <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 950, fontFamily: 'monospace' }}>{config.defaultColor?.toUpperCase() || '#F59E0B'}</span>
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
            .pc-icon-box { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 12px 24px rgba(245, 158, 11, 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Outfit', sans-serif; font-size: 2.2rem; font-weight: 950; margin: 0; color: #1e293b; letter-spacing: -1.2px; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 950; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px; }
            .pc-status-tag-v2.on { background: #fffbeb; color: #d97706; }
            .pc-status-tag-v2.off { background: #fef2f2; color: #ef4444; }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: white; border: none; padding: 14px 28px; border-radius: 18px; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.3s; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(99, 102, 241, 0.3); }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: #f8fafc; color: #64748b; border: 1.5px solid #e2e8f0; padding: 12px 28px; border-radius: 18px; font-weight: 850; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: #fffbeb; color: #d97706; border-color: #fde68a; }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 8px; background: #f1f5f9; padding: 6px; border-radius: 20px; width: fit-content; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 10px; padding: 14px 28px; border: none; background: transparent; color: #64748b; font-weight: 850; font-size: 0.95rem; border-radius: 16px; cursor: pointer; transition: 0.2s; position: relative; }
            .pc-tabs-v2 button.active { background: white; color: var(--primary); box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .tab-count-v2 { background: var(--primary); color: white; font-size: 0.65rem; padding: 2px 8px; border-radius: 100px; margin-left: 4px; }

            /* Card V2 */
            .pc-card-v2 { background: white; border: 1px solid var(--border-light); border-radius: 32px; padding: 40px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 20px; }
            .header-icon { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
            .card-header-v2 h3 { margin: 0; font-family: 'Outfit'; font-size: 1.5rem; font-weight: 950; color: #1e293b; }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 950; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
            .pc-input-modern-v2 { width: 100%; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 18px; padding: 16px 20px; font-weight: 900; color: #1e293b; outline: none; transition: 0.2s; }
            .pc-input-modern-v2:focus { border-color: var(--primary); background: white; }

            .pc-poll-option-v2:hover { border-color: #f59e0b !important; transform: translateY(-3px); box-shadow: 0 8px 24px rgba(245, 158, 11, 0.08) !important; }
            .pc-btn-delete-studio-v2:hover { background: #ef4444 !important; color: white !important; transform: rotate(8deg); }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-matrix-item-v2, :global(.light-theme) .pc-poll-option-v2 { background: #ffffff !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
