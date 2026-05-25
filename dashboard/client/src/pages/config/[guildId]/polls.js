import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, ListChecks, Plus, Trash2, Send, BarChart, Clock, Users, Settings2, Palette, CheckCircle2, 
    XCircle, Info, Calendar, Zap, Monitor, Smartphone, Sun, Moon, Power, Hash, ChevronRight, 
    Trash, ArrowRight, Layout, Layers, Box, Sparkles, MessageSquare, PieChart, Vote, Activity,
    Shapes, LayoutGrid, Timer, ShieldCheck, Flag, RotateCcw
} from 'lucide-react';
import { DiscordSelector, CustomSelect, SystemMessagesSection } from '../../../components/LazyConfigComponents';
import EmbedPreviewDrawer from '../../../components/EmbedPreviewDrawer';
import Head from 'next/head';

const POLL_OPTION_EMOJIS = ['1\uFE0F\u20E3', '2\uFE0F\u20E3', '3\uFE0F\u20E3', '4\uFE0F\u20E3', '5\uFE0F\u20E3', '6\uFE0F\u20E3', '7\uFE0F\u20E3', '8\uFE0F\u20E3', '9\uFE0F\u20E3', '\uD83D\uDD1F'];

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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const defaultPollOptions = () => ([
      { emoji: POLL_OPTION_EMOJIS[0], label: t('polls.option_1') },
      { emoji: POLL_OPTION_EMOJIS[1], label: t('polls.option_2') }
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [newPoll, setNewPoll] = useState({
      channelId: '',
      question: '',
      options: [
          { emoji: '1️⃣', label: t('polls.option_1') },
          { emoji: '2️⃣', label: t('polls.option_2') }
      ],
      duration: 60,
      mode: 'SINGLE',
      color: '#6366f1'
  });

  useEffect(() => {
    setNewPoll(current => ({ ...current, options: defaultPollOptions() }));
  }, []);

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
      
      setConfig(configRes.data?.polls || configRes.polls || { enabled: false, logChannelId: null, defaultColor: '#6366f1' });
      setChannels((discordRes.channels || discordRes.data?.channels || []).filter(c => c.type === 0 || c.type === 5));
      setActivePolls(pollsRes.data || pollsRes || []);
    } catch (e) {
      if (!api.isAuthError(e)) {
        console.error("Polls load error:", e);
      }
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [guildId, mounted]);

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleReset = async () => {
    if (!confirm(t('common.reset_confirm'))) return;
    
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const res = await api.request(`/config/${guildId}/polls/reset`, { method: 'POST' });
      if (res.success) {
        setConfig(res.data);
        showToast(t('common.reset_success'));
      }
    } catch (error) {
      if (!api.isAuthError(error)) {
        console.error("Reset error:", error);
      }
      showToast(t('common.reset_error'), 'error');
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const payload = {
        enabled: Boolean(config.enabled),
        logChannelId: config.logChannelId || null,
        defaultColor: config.defaultColor || '#5865F2'
      };
      const res = await api.request(`/config/${guildId}/polls/config`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res?.data) setConfig(res.data);
      showToast(t('polls.sync_success'));
    } catch (e) {
      showToast(t('common.save_error'), 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleCreatePoll = async () => {
    if (!newPoll.question || !newPoll.channelId) return showToast(t('polls.config_error'), 'error');
    if (newPoll.options.some(o => !o.label)) return showToast(t('polls.options_error'), 'error');

    setCreating(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const res = await api.request(`/config/${guildId}/polls/create`, {
        method: 'POST',
        body: JSON.stringify(newPoll)
      });
      if (res.success || res) {
          showToast(t('polls.launch_success'));
          setActiveTab('active');
          fetchData();
          setNewPoll(current => ({ ...current, question: '', options: defaultPollOptions() }));
      }
    } catch (e) {
      showToast(t('polls.launch_error'), 'error');
    } finally {
      setCreating(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const addOption = () => {
      if (newPoll.options.length >= 10) return showToast(t('polls.limit_error'), 'error');
      const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
      const nextEmoji = emojis[newPoll.options.length] || '🔘';
      setNewPoll({ ...newPoll, options: [...newPoll.options, { emoji: POLL_OPTION_EMOJIS[newPoll.options.length] || nextEmoji, label: `Choice ${newPoll.options.length + 1}` }] });
  };

  const removeOption = (index) => {
      if (newPoll.options.length <= 2) return showToast(t('polls.min_options_error'), 'error');
      setNewPoll({ ...newPoll, options: newPoll.options.filter((_, i) => i !== index) });
  };


  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  const previewPollEmbed = {
      title: `📊 POLL STUDIO: ${newPoll.question || '...' }`,
      description: newPoll.options.map(o => `${o.emoji} **${o.label}**`).join('\n\n'),
      color: newPoll.color,
      footer: t('polls.footer_text', { duration: newPoll.duration }),
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
                <div className="pc-icon-box" style={{ background: 'var(--bg-badge)', color: '#f59e0b', boxShadow: 'none' }}>
                    <ListChecks size={28} />
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
                <button className="pc-btn-outline-v2" onClick={handleReset} title={t('common.reset_to_default')}>
                    <RotateCcw size={18} />
                </button>
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
                <div className="v-stack" style={{ gap: '24px' }}>
                    <section className="pc-card-v2 preview-action-bar">
                        <div>
                            <h3 style={{ margin: 0 }}>{t('polls.preview_title')}</h3>
                            <p>{t('polls.preview_desc')}</p>
                        </div>
                        <div className="preview-action-buttons">
                            <button className="pc-btn-outline-v2 preview-action-btn" onClick={() => setPreviewOpen(true)}>
                                <Monitor size={18} /> <span>{t('common.preview')}</span>
                            </button>
                            <button className="pc-btn-primary preview-action-btn" onClick={handleCreatePoll} disabled={creating}>
                                <Send size={18} />
                                <span>{creating ? t('common.deploying') : t('polls.deploy_btn')}</span>
                            </button>
                        </div>
                    </section>

                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><MessageSquare size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('polls.q_timeline')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>{t('polls.project_q')}</label>
                                    <textarea 
                                        className={`pc-input-modern-v2 ${!newPoll.question ? 'has-error' : ''}`}
                                        style={{ minHeight: '120px', fontSize: '1.4rem', lineHeight: 1.4 }} 
                                        value={newPoll.question} 
                                        onChange={e => setNewPoll({...newPoll, question: e.target.value})} 
                                        placeholder={t('polls.q_placeholder')} 
                                    />
                                    {!newPoll.question && <span className="pc-required-hint">{t('common.required_to_publish')}</span>}
                                    <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('polls.question_help')}</p>
                                </div>
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', marginTop: '32px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>{t('polls.launch_channel')}</label>
                                        <DiscordSelector type="channel" options={channels} value={newPoll.channelId} onChange={v => setNewPoll({...newPoll, channelId: v})} error={!newPoll.channelId ? t('common.required_to_publish') : ''} />
                                        <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('polls.launch_channel_help')}</p>
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('polls.duration_mins')}</label>
                                        <div className="pc-input-modern-v2">
                                            <Timer size={18} />
                                            <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: 700, outline: 'none' }} value={newPoll.duration} onChange={e => setNewPoll({...newPoll, duration: parseInt(e.target.value)})} min="1" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="v-stack" style={{ marginTop: '48px', gap: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div className="v-stack">
                                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('polls.choices_matrix')}</label>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary)' }}>{t('polls.choices_limit')}</span>
                                        </div>
                                        <button className="pc-btn-secondary-v2" style={{ padding: '12px 24px', borderRadius: '14px', background: 'rgba(99,102,241,0.08)', border: '1.5px solid rgba(99,102,241,0.3)', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={addOption} disabled={newPoll.options.length >= 10}>
                                            <Plus size={18} /> <span>{t('polls.add_choice')}</span>
                                        </button>
                                    </div>
                                    <div className="v-stack" style={{ gap: '16px' }}>
                                        {newPoll.options.map((opt, idx) => (
                                            <div key={idx} className="pc-poll-option-v2 animate slide-up" style={{ display: 'flex', gap: '12px', alignItems: 'center', background: !opt.label ? 'rgba(239, 68, 68, 0.06)' : 'var(--bg-badge)', padding: '12px', borderRadius: '16px', border: !opt.label ? '1.5px solid var(--error)' : '1.5px solid var(--border)', transition: '0.3s', boxShadow: !opt.label ? '0 0 0 3px rgba(239, 68, 68, 0.12)' : '0 4px 12px rgba(0,0,0,0.02)' }}>
                                                <div style={{ width: '42px', height: '42px', background: 'var(--bg-card)', borderRadius: '12px', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 8px rgba(0,0,0,0.03)' }}>
                                                    <input style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center', fontSize: '1.2rem', outline: 'none' }} value={opt.emoji} onChange={e => {
                                                        const newOpts = [...newPoll.options];
                                                        newOpts[idx].emoji = e.target.value;
                                                        setNewPoll({...newPoll, options: newOpts});
                                                    }} />
                                                </div>
                                                <input style={{ flex: 1, border: 'none', background: 'transparent', fontWeight: 700, color: 'var(--text-heading)', outline: 'none', fontSize: '1rem' }} value={opt.label} onChange={e => {
                                                    const newOpts = [...newPoll.options];
                                                    newOpts[idx].label = e.target.value;
                                                    setNewPoll({...newPoll, options: newOpts});
                                                }} placeholder={t('polls.choice_placeholder', { idx: idx + 1 })} />
                                                <button onClick={() => removeOption(idx)} className="pc-btn-delete-studio-v2" style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Trash2 size={18} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pc-input-group-v2" style={{ marginTop: '48px' }}>
                                    <label>{t('polls.voting_policy')}</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '16px' }}>
                                        <button onClick={() => setNewPoll({...newPoll, mode: 'SINGLE'})} className={`pc-mode-btn-v2 ${newPoll.mode === 'SINGLE' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: newPoll.mode === 'SINGLE' ? 'rgba(99,102,241,0.08)' : 'var(--bg-badge)', border: newPoll.mode === 'SINGLE' ? '2px solid var(--primary)' : '2px solid var(--border)', borderRadius: '16px', cursor: 'pointer', transition: '0.3s', textAlign: 'left' }}>
                                            <div className="mode-icon-v2" style={{ width: '36px', height: '36px', borderRadius: '10px', background: newPoll.mode === 'SINGLE' ? 'var(--primary)' : 'var(--bg-badge)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: newPoll.mode === 'SINGLE' ? 'white' : 'var(--border)', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}><CheckCircle2 size={20} /></div>
                                            <div className="v-stack">
                                                <span className="mode-title-v2" style={{ fontWeight: 700, fontSize: '1rem', color: newPoll.mode === 'SINGLE' ? 'var(--primary-hover)' : 'var(--text-heading)' }}>{t('polls.mode_exclusive')}</span>
                                                <small style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8, color: newPoll.mode === 'SINGLE' ? 'var(--primary)' : 'var(--text-muted)' }}>{t('polls.mode_exclusive_desc')}</small>
                                            </div>
                                        </button>
                                        <button onClick={() => setNewPoll({...newPoll, mode: 'MULTIPLE'})} className={`pc-mode-btn-v2 ${newPoll.mode === 'MULTIPLE' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: newPoll.mode === 'MULTIPLE' ? 'rgba(99,102,241,0.08)' : 'var(--bg-badge)', border: newPoll.mode === 'MULTIPLE' ? '2px solid var(--primary)' : '2px solid var(--border)', borderRadius: '16px', cursor: 'pointer', transition: '0.3s', textAlign: 'left' }}>
                                            <div className="mode-icon-v2" style={{ width: '36px', height: '36px', borderRadius: '10px', background: newPoll.mode === 'MULTIPLE' ? 'var(--primary)' : 'var(--bg-badge)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: newPoll.mode === 'MULTIPLE' ? 'white' : 'var(--border)', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}><Layers size={20} /></div>
                                            <div className="v-stack">
                                                <span className="mode-title-v2" style={{ fontWeight: 700, fontSize: '1rem', color: newPoll.mode === 'MULTIPLE' ? 'var(--primary-hover)' : 'var(--text-heading)' }}>{t('polls.mode_multiple')}</span>
                                                <small style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8, color: newPoll.mode === 'MULTIPLE' ? 'var(--primary)' : 'var(--text-muted)' }}>{t('polls.mode_multiple_desc')}</small>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <EmbedPreviewDrawer open={previewOpen} onClose={() => setPreviewOpen(false)} data={previewPollEmbed} />
                </div>
            )}

            {activeTab === 'active' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                            <div className="header-icon" style={{ background: 'rgba(99,102,241,0.08)', color: 'var(--primary)' }}><Activity size={18} /></div>
                            <h3 style={{ margin: 0 }}>{t('polls.live_studio')}</h3>
                        </div>
                        <div className="card-body-v2">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                                {activePolls.map(poll => (
                                    <div key={poll._id} className="pc-matrix-item-v2 animate slide-up" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', padding: '20px', borderRadius: '18px', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.02)' }}>
                                        <div style={{ width: '72px', height: '72px', background: 'rgba(99,102,241,0.08)', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '1.5px solid rgba(99,102,241,0.2)' }}><BarChart size={32} /></div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 10px 0', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-heading)', letterSpacing: '-0.5px' }}>{poll.question}</h4>
                                            <div style={{ display: 'flex', gap: '14px' }}>
                                                <div className="pc-live-badge-v2" style={{ background: 'rgba(99,102,241,0.08)', color: 'var(--primary)', border: '1.5px solid rgba(99,102,241,0.2)', padding: '6px 14px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16} /> {new Date(poll.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                <div className="pc-live-badge-v2" style={{ background: 'rgba(99,102,241,0.08)', color: 'var(--primary)', border: '1.5px solid rgba(99,102,241,0.2)', padding: '6px 14px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={16} /> {t('polls.votes_count', { count: poll.options.reduce((acc, o) => acc + (o.votes?.length || 0), 0) })}</div>
                                            </div>
                                        </div>
                                        <button className="pc-btn-delete-studio-v2" style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}><Trash2 size={22} /></button>
                                    </div>
                                ))}
                                {activePolls.length === 0 && (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '56px 24px', background: 'var(--bg-badge)', borderRadius: '18px', border: '1.5px dashed var(--border)' }}>
                                        <div style={{ width: '80px', height: '80px', background: 'var(--bg-badge)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--border)' }}>
                                            <Shapes size={40} />
                                        </div>
                                        <p style={{ fontWeight: 700, color: 'var(--text-dim)', margin: 0, fontSize: '1.2rem' }}>{t('polls.empty_studio')}</p>
                                        <button onClick={() => setActiveTab('create')} className="pc-btn-primary" style={{ margin: '32px auto 0', padding: '12px 24px', borderRadius: '14px', background: 'var(--primary)' }}><Plus size={18} /> {t('polls.start_now')}</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="poll-settings-grid animate slide-up">
                    <section className="pc-card-v2 poll-settings-card">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Settings2 size={18} /></div>
                            <h3 style={{ margin: 0 }}>{t('polls.protocol_defaults')}</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-group-v2">
                                <label>{t('polls.target_results')}</label>
                                <DiscordSelector type="channel" options={channels} value={config.logChannelId} onChange={val => setConfig({...config, logChannelId: val})} />
                            </div>
                            <div className="pc-input-group-v2">
                                <label>{t('polls.branding_color')}</label>
                                <div className="poll-color-row">
                                    <div className="poll-color-swatch" style={{ background: config.defaultColor }}></div>
                                    <input type="color" style={{ width: '0', height: '0', opacity: 0, position: 'absolute' }} id="poll-def-color-studio" value={config.defaultColor} onChange={e => setConfig({...config, defaultColor: e.target.value})} />
                                    <button onClick={() => document.getElementById('poll-def-color-studio').click()} className="pc-btn-outline-v2 poll-color-button">{t('polls.hex_picker')}</button>
                                    <span className="poll-color-value">{config.defaultColor?.toUpperCase() || '#6366F1'}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'create' && (
                <div className="v-stack animate slide-up">
                    <SystemMessagesSection 
                        config={config}
                        onUpdate={setConfig}
                        messages={[
                            { key: 'voted', label: t('polls.msg_voted_label'), placeholder: t('polls.msg_voted_placeholder') },
                            { key: 'already_voted', label: t('polls.msg_already_voted_label'), placeholder: t('polls.msg_already_voted_placeholder') },
                            { key: 'ended', label: t('polls.msg_ended_label'), placeholder: t('polls.msg_ended_placeholder') }
                        ]}
                    />
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1650px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            @media (max-width: 1200px) {
                .pc-layout-grid-v2 { grid-template-columns: 1fr !important; gap: 24px !important; }
                .poll-settings-grid { grid-template-columns: 1fr; }
                .poll-settings-card .card-body-v2 { grid-template-columns: 1fr; }
            }
            
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
            .preview-action-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 20px !important; }
            .preview-action-bar p { margin: 4px 0 0 0; color: var(--text-muted); font-size: 0.85rem; font-weight: 650; }
            .preview-action-buttons { display: flex; align-items: center; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
            .preview-action-btn { min-height: 44px; justify-content: center; }
            @media (max-width: 720px) {
                .preview-action-bar { align-items: stretch; flex-direction: column; }
                .preview-action-buttons { justify-content: stretch; }
                .preview-action-buttons button { width: 100%; }
            }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: var(--bg-badge); color: var(--text-muted); border: 1.5px solid var(--border); padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: rgba(var(--primary-rgb), 0.1); color: var(--primary); border-color: rgba(var(--primary-rgb), 0.2); }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 6px; background: var(--bg-badge); padding: 5px; border-radius: 18px; width: fit-content; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; font-size: 0.9rem; border-radius: 14px; cursor: pointer; transition: 0.2s; }
            .pc-tabs-v2 button.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .pc-tab-badge-v2 { background: var(--primary); color: #fff; font-size: 0.65rem; padding: 1px 6px; border-radius: 100px; margin-left: 4px; }

            /* Card V2 */
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .poll-settings-grid { display: grid; grid-template-columns: minmax(0, 760px); gap: 20px; }
            .poll-settings-card { padding: 22px !important; border-radius: 18px !important; box-shadow: none !important; }
            .poll-settings-card .card-header-v2 { margin-bottom: 20px !important; }
            .poll-settings-card .card-body-v2 { display: grid; grid-template-columns: minmax(0, 1fr) minmax(260px, 0.55fr); gap: 18px; align-items: start; }
            .poll-color-row { display: flex; align-items: center; gap: 12px; min-height: 44px; }
            .poll-color-swatch { width: 40px; height: 40px; border-radius: 12px; border: 1px solid var(--border); box-shadow: none; flex-shrink: 0; }
            .poll-color-button { min-height: 40px; padding: 10px 14px !important; border-radius: 12px !important; background: var(--bg-badge) !important; font-weight: 700; }
            .poll-color-value { color: var(--text-muted); font-family: monospace; font-size: 0.86rem; font-weight: 700; }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; background: var(--bg-badge); color: var(--primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.3rem; font-weight: 700; color: var(--text-heading); }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; }

            .pc-input-modern-v2 { width: 100%; background: var(--bg-badge); border: 1.5px solid var(--border); border-radius: 14px; padding: 12px 16px; font-weight: 700; color: var(--text-heading); outline: none; transition: 0.2s; display: flex; align-items: center; gap: 12px; }
            .pc-input-modern-v2:focus-within { border-color: var(--primary); }
            .pc-input-modern-v2 input { width: 100%; background: transparent; border: none; font-weight: 700; color: var(--text-heading); outline: none; }

            .pc-poll-option-v2:hover { border-color: var(--primary) !important; transform: translateY(-3px); box-shadow: 0 8px 24px rgba(99,102,241,0.08) !important; }
            .pc-btn-delete-studio-v2:hover { background: #ef4444 !important; color: #fff !important; transform: rotate(8deg); }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-matrix-item-v2, :global(.light-theme) .pc-poll-option-v2 { box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
