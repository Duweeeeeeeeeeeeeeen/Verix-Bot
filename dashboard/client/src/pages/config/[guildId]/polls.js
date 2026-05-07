import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, 
    ListChecks, 
    Plus, 
    Trash2, 
    Send, 
    BarChart, 
    Clock, 
    Users,
    Settings2,
    Palette,
    CheckCircle2,
    XCircle,
    Info,
    Calendar,
    Zap,
    Monitor,
    Smartphone,
    Sun,
    Moon
} from 'lucide-react';
import { DiscordSelector } from '../../../components/LazyConfigComponents';
import EmbedPreview from '../../../components/EmbedPreview';
import CustomSelect from '../../../components/CustomSelect';

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

  const [newPoll, setNewPoll] = useState({
      channelId: '',
      question: '',
      options: [
          { emoji: '1️⃣', label: t('polls.option_1') },
          { emoji: '2️⃣', label: t('polls.option_2') }
      ],
      duration: 60,
      mode: 'SINGLE',
      color: '#5865F2'
  });

  useEffect(() => {
    if (guildId) fetchData();
  }, [guildId]);

  const fetchData = async () => {
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [configRes, discordRes, pollsRes] = await Promise.all([
        api.request(`/config/${guildId}`),
        api.request(`/config/${guildId}/discord-data`),
        api.request(`/config/${guildId}/polls/active`) // I need to add this route
      ]);
      
      if (configRes) {
          setConfig(configRes.polls || { enabled: false, logChannelId: null, defaultColor: '#5865F2' });
      }
      if (discordRes) {
        setChannels(discordRes.channels?.filter(c => c.type === 0 || c.type === 5) || []);
      }
      if (pollsRes) setActivePolls(pollsRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/polls/config`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast(t('common.save_success'));
    } catch (e) {
      showToast(t('common.save_error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePoll = async () => {
    if (!newPoll.question || !newPoll.channelId) return showToast(t('polls.required_fields'), 'error');
    if (newPoll.options.some(o => !o.label)) return showToast(t('polls.label_required'), 'error');

    setCreating(true);
    try {
      const res = await api.request(`/config/${guildId}/polls/create`, {
        method: 'POST',
        body: JSON.stringify(newPoll)
      });
      if (res.success) {
          showToast(t('common.save_success'));
          setActiveTab('active');
          fetchData();
      }
    } catch (e) {
      showToast(e.message || t('common.save_error'), 'error');
    } finally {
      setCreating(false);
    }
  };

  const addOption = () => {
      if (newPoll.options.length >= 10) return showToast(t('polls.max_options'), 'error');
      const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
      const nextEmoji = emojis[newPoll.options.length] || '🔘';
      setNewPoll({ ...newPoll, options: [...newPoll.options, { emoji: nextEmoji, label: `Option ${newPoll.options.length + 1}` }] });
  };

  const removeOption = (index) => {
      if (newPoll.options.length <= 2) return showToast('Min 2 options required', 'error');
      setNewPoll({ ...newPoll, options: newPoll.options.filter((_, i) => i !== index) });
  };

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  if (loading || !config) return <Skeleton type="config" />;

  const previewPollEmbed = {
      title: `📊 Poll: ${newPoll.question || '...'}`,
      description: newPoll.options.map(o => `${o.emoji} **${o.label}**`).join('\n\n'),
      color: newPoll.color,
      footer: `Ends in ${newPoll.duration} minutes`,
      timestamp: true,
      buttons: newPoll.options.map((o, i) => ({
          emoji: o.emoji,
          style: 'SECONDARY'
      }))
  };

  return (
    <div className="config-page-layout animate">
      <div className="config-main-col">
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon" style={{ background: 'var(--primary-glow)', color: 'var(--accent-blue)' }}>
                <ListChecks size={24} />
              </div>
              <div className="header-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h1>{t('polls.title')}</h1>
                  <label className="toggle-mini">
                    <input type="checkbox" checked={!!config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                    <span className="slider-mini"></span>
                  </label>
                </div>
                <p>{t('polls.desc')}</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleSaveConfig} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? t('common.saving') : t('common.save')}
              </button>
           </div>
        </header>

        <div className="tab-navigation">
            <button onClick={() => setActiveTab('create')} className={`tab-link ${activeTab === 'create' ? 'active' : ''}`}>
                <Plus size={16} /> <span>{t('polls.create_poll')}</span>
            </button>
            <button onClick={() => setActiveTab('active')} className={`tab-link ${activeTab === 'active' ? 'active' : ''}`}>
                <Zap size={16} /> <span>{t('polls.active_polls')}</span>
            </button>
            <button onClick={() => setActiveTab('settings')} className={`tab-link ${activeTab === 'settings' ? 'active' : ''}`}>
                <Settings2 size={16} /> <span>{t('common.settings')}</span>
            </button>
        </div>

        <div className="tab-content">
            {activeTab === 'create' && (
                <div className="animate fade-in creation-grid">
                    <div className="creation-form">
                        <section className="card section-card">
                            <div className="align-center mb-4">
                                <Plus size={18} color="var(--primary)" />
                                <h3>{t('polls.new_poll')}</h3>
                            </div>
                            
                            <div className="field-box full-width mb-4">
                                <label className="text-label">{t('polls.question')}</label>
                                <input 
                                    type="text" 
                                    className="input large" 
                                    placeholder={t('polls.question_placeholder')}
                                    value={newPoll.question}
                                    onChange={e => setNewPoll({...newPoll, question: e.target.value})}
                                />
                            </div>

                            <div className="fields-grid mb-4">
                                <div className="field-box">
                                    <label className="text-label">{t('common.target_channel')}</label>
                                    <DiscordSelector 
                                        type="channel" 
                                        options={channels} 
                                        value={newPoll.channelId}
                                        onChange={val => setNewPoll({...newPoll, channelId: val})}
                                    />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">{t('polls.duration')}</label>
                                    <input 
                                        type="number" 
                                        className="input" 
                                        value={newPoll.duration}
                                        onChange={e => setNewPoll({...newPoll, duration: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="align-center mb-2" style={{ justifyContent: 'space-between' }}>
                                <label className="text-label">{t('polls.options')}</label>
                                <button onClick={addOption} className="btn-add-sm"><Plus size={12}/> {t('common.add')}</button>
                            </div>
                            <div className="options-list">
                                {newPoll.options.map((opt, idx) => (
                                    <div key={idx} className="option-item">
                                        <input 
                                            type="text" 
                                            className="input-emoji" 
                                            value={opt.emoji}
                                            onChange={e => {
                                                const newOpts = [...newPoll.options];
                                                newOpts[idx].emoji = e.target.value;
                                                setNewPoll({...newPoll, options: newOpts});
                                            }}
                                        />
                                        <input 
                                            type="text" 
                                            className="input-label" 
                                            value={opt.label}
                                            onChange={e => {
                                                const newOpts = [...newPoll.options];
                                                newOpts[idx].label = e.target.value;
                                                setNewPoll({...newPoll, options: newOpts});
                                            }}
                                        />
                                        <button onClick={() => removeOption(idx)} className="btn-remove"><Trash2 size={14}/></button>
                                    </div>
                                ))}
                            </div>

                            <div className="field-box mt-6">
                                <label className="text-label">{t('polls.mode')}</label>
                                <div className="mode-toggle">
                                    <button 
                                        className={`mode-btn ${newPoll.mode === 'SINGLE' ? 'active' : ''}`}
                                        onClick={() => setNewPoll({...newPoll, mode: 'SINGLE'})}
                                    >
                                        <CheckCircle2 size={14} /> {t('polls.mode_single')}
                                    </button>
                                    <button 
                                        className={`mode-btn ${newPoll.mode === 'MULTIPLE' ? 'active' : ''}`}
                                        onClick={() => setNewPoll({...newPoll, mode: 'MULTIPLE'})}
                                    >
                                        <CheckCircle2 size={14} /> {t('polls.mode_multiple')}
                                    </button>
                                </div>
                            </div>

                            <button onClick={handleCreatePoll} className="btn-create-poll" disabled={creating}>
                                <Send size={16} /> {creating ? t('common.creating') : t('polls.create_btn')}
                            </button>
                        </section>
                    </div>

                    <div className="creation-preview">
                        <div className="preview-sticky">
                            <div className="preview-header-actions">
                                <div className="preview-label">{t('common.live_preview')}</div>
                                <div className="preview-controls">
                                    <div className="control-group">
                                        <button 
                                            className={`control-btn ${previewTheme === 'light' ? 'active' : ''}`}
                                            onClick={() => setPreviewTheme('light')}
                                            title="Light Mode"
                                        >
                                            <Sun size={14} />
                                        </button>
                                        <button 
                                            className={`control-btn ${previewTheme === 'dark' ? 'active' : ''}`}
                                            onClick={() => setPreviewTheme('dark')}
                                            title="Dark Mode"
                                        >
                                            <Moon size={14} />
                                        </button>
                                    </div>
                                    <div className="control-divider" />
                                    <div className="control-group">
                                        <button 
                                            className={`control-btn ${!previewIsMobile ? 'active' : ''}`}
                                            onClick={() => setPreviewIsMobile(false)}
                                            title="Desktop View"
                                        >
                                            <Monitor size={14} />
                                        </button>
                                        <button 
                                            className={`control-btn ${previewIsMobile ? 'active' : ''}`}
                                            onClick={() => setPreviewIsMobile(true)}
                                            title="Mobile View"
                                        >
                                            <Smartphone size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <EmbedPreview data={previewPollEmbed} theme={previewTheme} isMobile={previewIsMobile} />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'active' && (
                <div className="animate fade-in">
                    <section className="card section-card">
                        <div className="align-center mb-4">
                            <BarChart size={18} color="var(--warning)" />
                            <h3>{t('polls.active_polls')}</h3>
                        </div>
                        
                        {activePolls.length === 0 ? (
                            <div className="empty-state">
                                <Clock size={32} opacity="0.2" />
                                <p>{t('polls.no_active')}</p>
                            </div>
                        ) : (
                            <div className="polls-list">
                                {activePolls.map(poll => (
                                    <div key={poll._id} className="poll-card">
                                        <div className="poll-info">
                                            <h4>{poll.question}</h4>
                                            <div className="poll-meta">
                                                <span><Clock size={12}/> Ends: {new Date(poll.endTime).toLocaleString()}</span>
                                                <span><Users size={12}/> {poll.options.reduce((acc, o) => acc + o.votes.length, 0)} votes</span>
                                            </div>
                                        </div>
                                        <div className="poll-badge">{poll.mode}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="animate fade-in">
                    <section className="card section-card">
                        <div className="align-center mb-4">
                            <Settings2 size={18} color="var(--primary)" />
                            <h3>{t('common.settings')}</h3>
                        </div>
                        <div className="field-box mb-4">
                            <label className="text-label">{t('common.logs_channel')}</label>
                            <DiscordSelector 
                                type="channel" 
                                options={channels} 
                                value={config.logChannelId} 
                                onChange={val => setConfig({...config, logChannelId: val})} 
                            />
                            <p className="field-help">{t('polls.logs_help')}</p>
                        </div>
                        <div className="field-box">
                            <label className="text-label">{t('common.default_color')}</label>
                            <input 
                                type="color" 
                                className="input" 
                                value={config.defaultColor} 
                                onChange={e => setConfig({...config, defaultColor: e.target.value})} 
                                style={{ width: '60px', height: '40px', padding: '0', border: 'none', background: 'none' }}
                            />
                        </div>
                    </section>
                </div>
            )}
        </div>
      </div>

      <style jsx>{`
        .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; background: var(--bg-badge); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
        .header-info { display: flex; align-items: center; gap: 16px; }
        .header-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; }
        .header-text p { font-size: 0.85rem; color: var(--text-dim); }

        .tab-navigation { display: flex; gap: 8px; margin-bottom: 24px; }
        .tab-link { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border: none; background: var(--bg-badge); color: var(--text-muted); font-size: 0.85rem; font-weight: 600; border-radius: 12px; cursor: pointer; transition: 0.2s; border: 1px solid var(--border); }
        .tab-link:hover { background: var(--bg-sidebar-alt); }
        .tab-link.active { color: var(--primary); background: var(--primary-glow); border-color: var(--primary); }

        .creation-grid { display: grid; grid-template-columns: 1fr 400px; gap: 24px; }
        .preview-sticky { position: sticky; top: 0; }
        .preview-header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .preview-label { font-size: 0.75rem; font-weight: 800; color: var(--text-dim); text-transform: uppercase; }
        
        .preview-controls { display: flex; align-items: center; gap: 8px; background: var(--bg-badge); padding: 4px; border-radius: 10px; border: 1px solid var(--border); }
        .control-group { display: flex; gap: 2px; }
        .control-btn { width: 28px; height: 28px; border-radius: 6px; border: none; background: transparent; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .control-btn:hover { background: var(--bg-sidebar-alt); color: var(--text-main); }
        .control-btn.active { background: var(--bg-card); color: var(--primary); box-shadow: var(--shadow-sm); }
        .control-divider { width: 1px; height: 16px; background: var(--border); margin: 0 2px; }

        .fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .input.large { font-size: 1.1rem; font-weight: 600; padding: 14px; }

        .options-list { display: flex; flex-direction: column; gap: 10px; }
        .option-item { display: grid; grid-template-columns: 50px 1fr 40px; gap: 10px; }
        .input-emoji { background: var(--bg-sidebar-alt); border: 1px solid var(--border); border-radius: 8px; color: var(--text-main); text-align: center; font-size: 1.2rem; }
        .input-label { background: var(--bg-sidebar-alt); border: 1px solid var(--border); border-radius: 8px; color: var(--text-main); padding: 10px; }
        .btn-remove { border: none; background: transparent; color: var(--error); cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0.6; }
        .btn-remove:hover { opacity: 1; }

        .mode-toggle { display: flex; gap: 12px; }
        .mode-btn { flex: 1; padding: 12px; background: var(--bg-sidebar-alt); border: 1px solid var(--border); border-radius: 10px; color: var(--text-dim); font-size: 0.85rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
        .mode-btn.active { background: var(--primary-glow); border-color: var(--primary); color: var(--primary); }

        .btn-create-poll { width: 100%; margin-top: 32px; padding: 14px; background: var(--primary); color: white; border: none; border-radius: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: 0.2s; }
        .btn-create-poll:hover { opacity: 0.9; transform: translateY(-2px); }
        .btn-create-poll:disabled { opacity: 0.5; cursor: not-allowed; }

        .poll-card { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-badge); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 12px; }
        .poll-info h4 { font-size: 1rem; font-weight: 600; margin-bottom: 4px; }
        .poll-meta { display: flex; gap: 16px; font-size: 0.75rem; color: var(--text-dim); }
        .poll-badge { padding: 4px 10px; background: var(--bg-sidebar-alt); border-radius: 6px; font-size: 0.65rem; font-weight: 800; color: var(--primary); }

        .empty-state { padding: 40px; text-align: center; color: var(--text-dim); }
        .mb-4 { margin-bottom: 16px; }
        .mb-2 { margin-bottom: 8px; }
        .mt-6 { margin-top: 24px; }
        .align-center { display: flex; align-items: center; gap: 10px; }
        
        @media (max-width: 1100px) {
            .creation-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
