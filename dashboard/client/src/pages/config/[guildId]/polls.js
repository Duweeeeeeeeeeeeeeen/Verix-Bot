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
            <title>{t('polls.studio_title')} | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
                    <Vote size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('polls.studio_title')}</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? t('polls.engine_active') : t('polls.engine_offline')}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-badge)', padding: '10px 20px', borderRadius: '14px', border: '1.5px solid var(--border)' }}>
                    <label className="pc-toggle-v2" style={{ position: 'relative', width: '42px', height: '22px' }}>
                        <input 
                            type="checkbox" 
                            style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                            checked={config.enabled} 
                            onChange={() => setConfig({...config, enabled: !config.enabled})} 
                        />
                        <span style={{ 
                            position: 'absolute', cursor: 'pointer', inset: 0, 
                            background: config.enabled ? '#10b981' : '#ef4444', 
                            transition: '.4s', borderRadius: '34px' 
                        }}>
                            <span style={{
                                position: 'absolute', content: '""', height: '16px', width: '16px', 
                                left: config.enabled ? '23px' : '3px', bottom: '3px', 
                                background: '#fff', transition: '.4s', borderRadius: '50%'
                            }}></span>
                        </span>
                    </label>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: config.enabled ? '#10b981' : '#ef4444' }}>
                        {config.enabled ? t('common.active') : t('common.inactive')}
                    </span>
                </div>
                <button className="pc-btn-primary" onClick={handleSaveConfig} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('polls.deploy_btn')}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-container-v2" style={{ marginBottom: '40px' }}>
            <div className="pc-tabs-v2">
                <button className={activeTab === 'create' ? 'active' : ''} onClick={() => setActiveTab('create')}>
                    <Plus size={16} /> <span>{t('polls.tab_new')}</span>
                </button>
                <button className={activeTab === 'active' ? 'active' : ''} onClick={() => setActiveTab('active')}>
                    <Activity size={16} /> <span>{t('polls.tab_live')}</span>
                    {activePolls.length > 0 && <span className="tab-count-v2">{activePolls.length}</span>}
                </button>
                <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                    <ShieldCheck size={16} /> <span>{t('polls.tab_security')}</span>
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
                                <h3 style={{ margin: 0 }}>{t('polls.q_timeline')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>{t('polls.project_q')}</label>
                                    <textarea 
                                        className="pc-input-modern-v2" 
                                        style={{ minHeight: '120px', fontSize: '1.4rem', lineHeight: 1.4 }} 
                                        value={newPoll.question} 
                                        onChange={e => setNewPoll({...newPoll, question: e.target.value})} 
                                        placeholder={t('polls.q_placeholder')} 
                                    />
                                </div>
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', marginTop: '32px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>{t('polls.launch_channel')}</label>
                                        <DiscordSelector type="channel" options={channels} value={newPoll.channelId} onChange={v => setNewPoll({...newPoll, channelId: v})} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('polls.duration_mins')}</label>
                                        <div className="pc-input-modern-v2">
                                            <Timer size={18} style={{ color: 'var(--primary)' }} />
                                            <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: 700, outline: 'none' }} value={newPoll.duration} onChange={e => setNewPoll({...newPoll, duration: parseInt(e.target.value)})} min="1" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="v-stack" style={{ marginTop: '48px', gap: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div className="v-stack">
                                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('polls.choices_matrix')}</label>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f59e0b' }}>{t('polls.choices_limit')}</span>
                                        </div>
                                        <button className="pc-btn-secondary-v2" style={{ padding: '12px 24px', borderRadius: '14px', background: '#fffbeb', border: '1.5px solid #fde68a', color: '#d97706', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={addOption} disabled={newPoll.options.length >= 10}>
                                            <Plus size={18} /> <span>{t('polls.add_choice')}</span>
                                        </button>
                                    </div>
                                    <div className="v-stack" style={{ gap: '16px' }}>
                                        {newPoll.options.map((opt, idx) => (
                                            <div key={idx} className="pc-poll-option-v2 animate slide-up" style={{ display: 'flex', gap: '18px', alignItems: 'center', background: 'var(--bg-badge)', padding: '18px', borderRadius: '24px', border: '1.5px solid var(--border)', transition: '0.3s', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                                <div style={{ width: '56px', height: '56px', background: 'white', borderRadius: '14px', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.03)' }}>
                                                    <input style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center', fontSize: '1.5rem', outline: 'none' }} value={opt.emoji} onChange={e => {
                                                        const newOpts = [...newPoll.options];
                                                        newOpts[idx].emoji = e.target.value;
                                                        setNewPoll({...newPoll, options: newOpts});
                                                    }} />
                                                </div>
                                                <input style={{ flex: 1, border: 'none', background: 'transparent', fontWeight: 700, color: 'var(--text-heading)', outline: 'none', fontSize: '1.1rem' }} value={opt.label} onChange={e => {
                                                    const newOpts = [...newPoll.options];
                                                    newOpts[idx].label = e.target.value;
                                                    setNewPoll({...newPoll, options: newOpts});
                                                }} placeholder={t('polls.choice_placeholder', { idx: idx + 1 })} />
                                                <button onClick={() => removeOption(idx)} className="pc-btn-delete-studio-v2" style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={22} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pc-input-group-v2" style={{ marginTop: '48px' }}>
                                    <label>{t('polls.voting_policy')}</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '16px' }}>
                                        <button onClick={() => setNewPoll({...newPoll, mode: 'SINGLE'})} className={`pc-mode-btn-v2 ${newPoll.mode === 'SINGLE' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', background: newPoll.mode === 'SINGLE' ? '#fffbeb' : 'var(--bg-badge)', border: newPoll.mode === 'SINGLE' ? '2.5px solid #f59e0b' : '2.5px solid var(--border)', borderRadius: '24px', cursor: 'pointer', transition: '0.3s', textAlign: 'left' }}>
                                            <div className="mode-icon-v2" style={{ width: '48px', height: '48px', borderRadius: '14px', background: newPoll.mode === 'SINGLE' ? '#f59e0b' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: newPoll.mode === 'SINGLE' ? 'white' : 'var(--border)', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}><CheckCircle2 size={24} /></div>
                                            <div className="v-stack">
                                                <span className="mode-title-v2" style={{ fontWeight: 700, fontSize: '1.1rem', color: newPoll.mode === 'SINGLE' ? '#b45309' : 'var(--text-heading)' }}>{t('polls.mode_exclusive')}</span>
                                                <small style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8, color: newPoll.mode === 'SINGLE' ? '#d97706' : 'var(--text-muted)' }}>{t('polls.mode_exclusive_desc')}</small>
                                            </div>
                                        </button>
                                        <button onClick={() => setNewPoll({...newPoll, mode: 'MULTIPLE'})} className={`pc-mode-btn-v2 ${newPoll.mode === 'MULTIPLE' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', background: newPoll.mode === 'MULTIPLE' ? '#fffbeb' : 'var(--bg-badge)', border: newPoll.mode === 'MULTIPLE' ? '2.5px solid #f59e0b' : '2.5px solid var(--border)', borderRadius: '24px', cursor: 'pointer', transition: '0.3s', textAlign: 'left' }}>
                                            <div className="mode-icon-v2" style={{ width: '48px', height: '48px', borderRadius: '14px', background: newPoll.mode === 'MULTIPLE' ? '#f59e0b' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: newPoll.mode === 'MULTIPLE' ? 'white' : 'var(--border)', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}><Layers size={24} /></div>
                                            <div className="v-stack">
                                                <span className="mode-title-v2" style={{ fontWeight: 700, fontSize: '1.1rem', color: newPoll.mode === 'MULTIPLE' ? '#b45309' : 'var(--text-heading)' }}>{t('polls.mode_multiple')}</span>
                                                <small style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8, color: newPoll.mode === 'MULTIPLE' ? '#d97706' : 'var(--text-muted)' }}>{t('polls.mode_multiple_desc')}</small>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="pc-preview-sticky-v2 animate fade-in" style={{ position: 'sticky', top: '40px', height: 'fit-content' }}>
                        <div className="pc-card-v2" style={{ padding: '0', overflow: 'hidden', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                            <div style={{ background: 'var(--bg-badge)', padding: '28px', borderBottom: '1.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700, color: 'var(--text-heading)', fontSize: '1rem' }}><PieChart size={22} style={{ color: '#f59e0b' }} /> {t('polls.preview_title')}</div>
                                <div style={{ display: 'flex', gap: '6px', background: 'white', padding: '6px', borderRadius: '16px', border: '1.5px solid var(--border)' }}>
                                    <button onClick={() => setPreviewIsMobile(false)} style={{ border: 'none', background: !previewIsMobile ? '#fffbeb' : 'transparent', color: !previewIsMobile ? '#f59e0b' : 'var(--text-dim)', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: '0.2s' }}><Monitor size={18} /></button>
                                    <button onClick={() => setPreviewIsMobile(true)} style={{ border: 'none', background: previewIsMobile ? '#fffbeb' : 'transparent', color: previewIsMobile ? '#f59e0b' : 'var(--text-dim)', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: '0.2s' }}><Smartphone size={18} /></button>
                                </div>
                            </div>
                            <div style={{ padding: '40px', background: previewTheme === 'dark' ? '#0f172a' : 'var(--bg-badge)', minHeight: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <EmbedPreview data={previewPollEmbed} isMobile={previewIsMobile} theme={previewTheme} />
                            </div>
                            <div style={{ padding: '20px 32px', background: 'white', borderTop: '1.5px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                                <button onClick={() => setPreviewTheme('dark')} style={{ border: 'none', background: previewTheme === 'dark' ? '#fffbeb' : 'transparent', color: previewTheme === 'dark' ? '#f59e0b' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}><Moon size={16} /> DARK</button>
                                <button onClick={() => setPreviewTheme('light')} style={{ border: 'none', background: previewTheme === 'light' ? '#fffbeb' : 'transparent', color: previewTheme === 'light' ? '#f59e0b' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}><Sun size={16} /> LIGHT</button>
                            </div>
                        </div>
                        <button className="pc-btn-primary" style={{ marginTop: '32px', width: '100%', padding: '24px', borderRadius: '28px', fontSize: '1.2rem', justifyContent: 'center' }} onClick={handleCreatePoll} disabled={creating}>
                            <Send size={24} />
                            <span>{creating ? t('common.deploying') : t('polls.deploy_btn')}</span>
                        </button>
                    </aside>
                </div>
            )}

            {activeTab === 'active' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                            <div className="header-icon" style={{ background: '#fffbeb', color: '#d97706' }}><Activity size={18} /></div>
                            <h3 style={{ margin: 0 }}>{t('polls.live_studio')}</h3>
                        </div>
                        <div className="card-body-v2">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: '28px' }}>
                                {activePolls.map(poll => (
                                    <div key={poll._id} className="pc-matrix-item-v2 animate slide-up" style={{ background: 'white', border: '1.5px solid var(--border)', padding: '32px', borderRadius: '32px', display: 'flex', gap: '24px', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                                        <div style={{ width: '72px', height: '72px', background: '#fffbeb', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', border: '1.5px solid #fde68a' }}><BarChart size={32} /></div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 10px 0', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-heading)', letterSpacing: '-0.5px' }}>{poll.question}</h4>
                                            <div style={{ display: 'flex', gap: '14px' }}>
                                                <div className="pc-live-badge-v2" style={{ background: '#fffbeb', color: '#d97706', border: '1.5px solid #fde68a', padding: '6px 14px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16} /> {new Date(poll.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                <div className="pc-live-badge-v2" style={{ background: '#fffbeb', color: '#d97706', border: '1.5px solid #fde68a', padding: '6px 14px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={16} /> {t('polls.votes_count', { count: poll.options.reduce((acc, o) => acc + (o.votes?.length || 0), 0) })}</div>
                                            </div>
                                        </div>
                                        <button className="pc-btn-delete-studio-v2" style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}><Trash2 size={22} /></button>
                                    </div>
                                ))}
                                {activePolls.length === 0 && (
                                    <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '120px 40px', background: 'var(--bg-badge)', borderRadius: '40px', border: '2px dashed var(--border)' }}>
                                        <div style={{ width: '80px', height: '80px', background: 'var(--bg-badge)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--border)' }}>
                                            <Shapes size={40} />
                                        </div>
                                        <p style={{ fontWeight: 700, color: 'var(--text-dim)', margin: 0, fontSize: '1.2rem' }}>{t('polls.empty_studio')}</p>
                                        <button onClick={() => setActiveTab('create')} className="pc-btn-primary" style={{ margin: '32px auto 0', padding: '12px 24px', borderRadius: '14px', background: '#f59e0b' }}><Plus size={18} /> {t('polls.start_now')}</button>
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
                            <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Settings2 size={18} /></div>
                            <h3 style={{ margin: 0 }}>{t('polls.protocol_defaults')}</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-group-v2">
                                <label>{t('polls.target_results')}</label>
                                <DiscordSelector type="channel" options={channels} value={config.logChannelId} onChange={val => setConfig({...config, logChannelId: val})} />
                            </div>
                            <div className="pc-input-group-v2" style={{ marginTop: '40px' }}>
                                <label>{t('polls.branding_color')}</label>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: config.defaultColor, border: '3.5px solid var(--border)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}></div>
                                    <input type="color" style={{ width: '0', height: '0', opacity: 0, position: 'absolute' }} id="poll-def-color-studio" value={config.defaultColor} onChange={e => setConfig({...config, defaultColor: e.target.value})} />
                                    <button onClick={() => document.getElementById('poll-def-color-studio').click()} className="pc-btn-outline-v2" style={{ background: 'var(--bg-badge)', padding: '16px 28px', borderRadius: '16px', fontWeight: 700, fontSize: '0.9rem', border: '1.5px solid var(--border)', cursor: 'pointer' }}>{t('polls.hex_picker')}</button>
                                    <span style={{ fontSize: '1rem', color: 'var(--text-dim)', fontWeight: 700, fontFamily: 'monospace' }}>{config.defaultColor?.toUpperCase() || '#F59E0B'}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1500px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #fff; }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Inter', sans-serif; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 6px; font-size: 0.6rem; font-weight: 700; padding: 4px 10px; border-radius: 100px;  width: fit-content; }
            .pc-status-tag-v2.on { background: rgba(16, 185, 129, 0.1); color: #10b981; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: #ef4444; }
            .status-dot-v2 { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: var(--bg-badge); color: var(--text-muted); border: 1.5px solid var(--border); padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: rgba(var(--primary-rgb), 0.1); color: var(--primary); border-color: rgba(var(--primary-rgb), 0.2); }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 6px; background: var(--bg-badge); padding: 5px; border-radius: 18px; width: fit-content; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; font-size: 0.9rem; border-radius: 14px; cursor: pointer; transition: 0.2s; }
            .pc-tabs-v2 button.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .pc-tab-badge-v2 { background: var(--primary); color: #fff; font-size: 0.65rem; padding: 1px 6px; border-radius: 100px; margin-left: 4px; }

            /* Card V2 */
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; background: var(--bg-badge); color: var(--primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.3rem; font-weight: 700; color: var(--text-heading); }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; }

            .pc-input-modern-v2 { width: 100%; background: var(--bg-badge); border: 1.5px solid var(--border); border-radius: 14px; padding: 12px 16px; font-weight: 700; color: var(--text-heading); outline: none; transition: 0.2s; display: flex; align-items: center; gap: 12px; }
            .pc-input-modern-v2:focus-within { border-color: var(--primary); }
            .pc-input-modern-v2 input { width: 100%; background: transparent; border: none; font-weight: 700; color: var(--text-heading); outline: none; }

            .pc-poll-option-v2:hover { border-color: #f59e0b !important; transform: translateY(-3px); box-shadow: 0 8px 24px rgba(245, 158, 11, 0.08) !important; }
            .pc-btn-delete-studio-v2:hover { background: #ef4444 !important; color: #fff !important; transform: rotate(8deg); }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-matrix-item-v2, :global(.light-theme) .pc-poll-option-v2 { box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
