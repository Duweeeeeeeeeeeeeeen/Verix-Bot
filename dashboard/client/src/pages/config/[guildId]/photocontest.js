import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, Trash2, Plus, X, Settings2, Calendar, Trophy, 
    Image as ImageIcon, UserCheck, Clock, RefreshCw, 
    Layout, AlertCircle, Play, Square, List, XCircle
} from 'lucide-react';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import api from '../../../utils/api';
import DiscordSelector from '../../../components/DiscordSelector';
import EmbedMessageManager from '../../../components/EmbedMessageManager';
import NotificationSettings from '../../../components/NotificationSettings';
import ConfirmModal from '../../../components/ConfirmModal';

export default function PhotoContestConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [] });
  const [guildData, setGuildData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: 'danger', title: '', message: '', onConfirm: null });

  useEffect(() => {
    if (guildId) {
      Promise.all([
        api.request(`/config/${guildId}/photocontest`),
        api.request(`/config/${guildId}/discord-data`),
        api.request(`/config/${guildId}/guild`)
      ]).then(([conf, disc, guildRes]) => {
        setConfig(conf.data || conf);
        setDiscordData(disc.data || disc);
        setGuildData(guildRes.data || guildRes);
        setLoading(false);
      }).catch(err => {
        console.error("Error loading photocontest config:", err);
        setLoading(false);
      });
    }
  }, [guildId]);

  const updateNested = (path, value) => {
    const keys = path.split('.');
    const newConfig = { ...config };
    let current = newConfig;
    for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setConfig(newConfig);
  };

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/photocontest`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast(t('photocontest.save_success'));
    } catch (error) {
        showToast(t('photocontest.save_error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const addTheme = (name) => {
    if (!name.trim()) return;

    // Check limit for FREE users
    if (!guildData?.isPremium && (config.themes || []).length >= 5) {
      showToast(t('premium.limit_reached'), 'error');
      router.push(`/config/${guildId}/premium`);
      return;
    }

    const newThemes = [...(config.themes || []), { name: name.trim(), durationHours: null }];
    setConfig({ ...config, themes: newThemes });
  };

  const removeTheme = (index) => {
    const newThemes = config.themes.filter((_, i) => i !== index);
    setConfig({ ...config, themes: newThemes });
  };

  const updateTheme = (index, field, value) => {
    const newThemes = [...config.themes];
    newThemes[index] = { ...newThemes[index], [field]: value };
    setConfig({ ...config, themes: newThemes });
  };

  const startContest = async () => {
    setConfirmModal({
        isOpen: true,
        type: 'success',
        title: <div className="align-center"><Play size={24} color="var(--success)" /> <h2>{t('photocontest.terminate_modal_title')}</h2></div>,
        message: t('photocontest.terminate_modal_msg'),
        onConfirm: async () => {
            try {
                await api.request(`/config/${guildId}/photocontest/start`, { method: 'POST' });
                showToast(t('photocontest.start_success'));
            } catch (e) { showToast(t('common.error'), 'error'); }
        }
    });
  };

  const terminateContest = async () => {
    setConfirmModal({
        isOpen: true,
        type: 'danger',
        title: <div className="align-center"><Square size={24} color="var(--error)" /> <h2>{t('photocontest.terminate_modal_title')}</h2></div>,
        message: t('photocontest.terminate_modal_msg'),
        onConfirm: async () => {
            try {
                await api.request(`/config/${guildId}/photocontest/terminate`, { method: 'POST' });
                showToast(t('photocontest.terminate_success'));
            } catch (e) { showToast(t('common.error'), 'error'); }
        }
    });
  };

  if (loading || !config) return <Skeleton type="config" />;

  return (
    <div className="photocontest-container animate">
        <header className="page-header-premium">
            <div className="header-info">
                <div className="header-icon-glow">
                    <ImageIcon size={28} />
                </div>
                <div className="header-text">
                    <div className="title-row">
                        <h1>{t('photocontest.title')}</h1>
                        <label className="premium-toggle">
                            <input 
                                type="checkbox" 
                                checked={!!config.enabled} 
                                onChange={e => setConfig({...config, enabled: e.target.checked})} 
                            />
                            <span className="premium-slider"></span>
                        </label>
                    </div>
                    <p>{t('photocontest.desc')}</p>
                </div>
            </div>
            <div className="header-actions">
                <button onClick={terminateContest} className="btn-glass-danger">
                    <Square size={16} /> {t('photocontest.btn_terminate')}
                </button>
                <button onClick={startContest} className="btn-glass-success">
                    <Play size={16} /> {t('photocontest.btn_start_now')}
                </button>
                <button onClick={handleSave} className="btn-primary-premium" disabled={saving}>
                    <Save size={16} /> {saving ? t('common.saving') : t('common.save')}
                </button>
            </div>
        </header>

        <div className="premium-tabs-nav">
            <button onClick={() => setActiveTab('settings')} className={`premium-tab ${activeTab === 'settings' ? 'active' : ''}`}>
                <Settings2 size={16} /> <span>{t('photocontest.tab_settings')}</span>
            </button>
            <button onClick={() => setActiveTab('themes')} className={`premium-tab ${activeTab === 'themes' ? 'active' : ''}`}>
                <ImageIcon size={16} /> <span>{t('photocontest.tab_themes')}</span>
            </button>
            <button onClick={() => setActiveTab('messages')} className={`premium-tab ${activeTab === 'messages' ? 'active' : ''}`}>
                <Layout size={16} /> <span>{t('photocontest.tab_design')}</span>
            </button>
        </div>

        <div className="tab-panel-content fade-in">
            {activeTab === 'settings' && (
                <div className="config-grid-premium">
                    <div className="grid-main">
                        <section className="glass-card premium-card">
                            <div className="card-header">
                                <div className="card-header-title">
                                    <Layout size={20} className="header-icon" />
                                    <h3>{t('photocontest.destinations_title')}</h3>
                                </div>
                                <span className="card-subtitle">Configura dove e come si svolge il contest</span>
                            </div>
                            <div className="card-content">
                                <div className="input-grid">
                                    <div className="field-group">
                                        <label>{t('photocontest.channel_label')}</label>
                                        <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 0 || c.type === 5)} value={config.channelId || ''} onChange={v => setConfig({...config, channelId: v})} />
                                    </div>
                                    <div className="field-group">
                                        <label>{t('photocontest.hall_of_fame_label')}</label>
                                        <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 0 || c.type === 5)} value={config.hallOfFameChannelId || ''} onChange={v => setConfig({...config, hallOfFameChannelId: v})} />
                                    </div>
                                    <div className="field-group">
                                        <label>{t('photocontest.winner_role_label')}</label>
                                        <DiscordSelector type="role" options={discordData.roles} value={config.winnerRoleId || ''} onChange={v => setConfig({...config, winnerRoleId: v})} />
                                    </div>
                                    <div className="field-group-row">
                                        <div className="field-group flex-1">
                                            <label>
                                                {t('photocontest.interval_label')}
                                                <HelpTooltip text={t('photocontest.interval_help')} />
                                            </label>
                                            <div className="input-unit-wrapper">
                                                <input type="number" className="premium-input" value={config.intervalHours || 24} onChange={e => setConfig({...config, intervalHours: parseInt(e.target.value) || 1})} />
                                                <span className="unit-label">ORE</span>
                                            </div>
                                        </div>
                                        <div className="field-group flex-1">
                                            <label>{t('photocontest.duration_label')}</label>
                                            <div className="input-unit-wrapper">
                                                <input type="number" className="premium-input" value={config.durationHours || 24} onChange={e => setConfig({...config, durationHours: parseInt(e.target.value) || 1})} />
                                                <span className="unit-label">ORE</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`premium-upsell-box ${guildData?.isPremium ? 'unlocked' : 'locked'}`}>
                                    <div className="upsell-info">
                                        <div className="upsell-title">
                                            <h4>{t('photocontest.multi_winner')}</h4>
                                            {!guildData?.isPremium && <span className="premium-badge">PRO</span>}
                                        </div>
                                        <p>{t('photocontest.multi_winner_desc')}</p>
                                    </div>
                                    <div className="upsell-controls">
                                        {config.multiWinner && (
                                            <div className="winners-selector">
                                                <span>Vincitori:</span>
                                                <input 
                                                    type="number" 
                                                    className="mini-input" 
                                                    value={config.winnersCount || 1}
                                                    disabled={!guildData?.isPremium}
                                                    onChange={(e) => setConfig({...config, winnersCount: parseInt(e.target.value) || 1})}
                                                />
                                            </div>
                                        )}
                                        <label className="premium-toggle">
                                            <input 
                                                type="checkbox" 
                                                checked={!!config.multiWinner} 
                                                disabled={!guildData?.isPremium}
                                                onChange={(e) => {
                                                    if (!guildData?.isPremium) {
                                                        router.push(`/config/${guildId}/premium`);
                                                        return;
                                                    }
                                                    setConfig({...config, multiWinner: e.target.checked});
                                                }}
                                            />
                                            <span className="premium-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="grid-sidebar">
                        <section className="glass-card side-card">
                            <div className="card-header">
                                <UserCheck size={18} className="header-icon" />
                                <h3>{t('photocontest.staff_roles_title')}</h3>
                            </div>
                            <div className="card-content">
                                <DiscordSelector type="role" multiple options={discordData.roles} value={config.staffRoles || []} onChange={v => setConfig({...config, staffRoles: v})} />
                                <p className="hint-text">{t('photocontest.staff_roles_help')}</p>
                            </div>
                        </section>

                        <NotificationSettings 
                            guildId={guildId}
                            value={config.notifications}
                            onChange={val => setConfig({...config, notifications: val})}
                            title={t('photocontest.notif_title')}
                            description={t('photocontest.notif_desc')}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'themes' && (
                <div className="themes-premium-layout fade-in">
                    <section className="glass-card rotation-status-card">
                        <div className="status-info">
                            <div className="status-icon-glow">
                                <RefreshCw size={20} />
                            </div>
                            <div className="status-text">
                                <h3>{t('photocontest.rotation_title')}</h3>
                                <p>Gestisci la rotazione automatica dei temi</p>
                            </div>
                        </div>
                        <label className="premium-toggle">
                            <input type="checkbox" checked={!!config.automaticThemes} onChange={e => setConfig({...config, automaticThemes: e.target.checked})} />
                            <span className="premium-slider"></span>
                        </label>
                    </section>

                    <section className="glass-card list-card">
                        <div className="card-header">
                            <div className="card-header-title">
                                <List size={20} className="header-icon" />
                                <h3>{t('photocontest.themes_list_title')}</h3>
                            </div>
                        </div>
                        <div className="card-content">
                            <div className="add-theme-premium">
                                <div className="premium-input-wrapper">
                                    <ImageIcon size={18} className="inner-icon" />
                                    <input 
                                        type="text" 
                                        id="new-theme-input" 
                                        placeholder={t('photocontest.theme_placeholder')}
                                        disabled={!guildData?.isPremium && (config.themes || []).length >= 5}
                                        onKeyDown={e => { 
                                            if(e.key === 'Enter') { 
                                                if (!guildData?.isPremium && (config.themes || []).length >= 5) {
                                                    router.push(`/config/${guildId}/premium`);
                                                } else {
                                                    addTheme(e.target.value); 
                                                    e.target.value = ''; 
                                                }
                                            } 
                                        }}
                                    />
                                </div>
                                <button className="btn-add-theme" onClick={() => {
                                    const inp = document.getElementById('new-theme-input');
                                    addTheme(inp.value);
                                    inp.value = '';
                                }}>
                                    <Plus size={20} />
                                </button>
                            </div>
                            
                            <div className="premium-themes-list">
                                {(config.themes || []).length === 0 ? (
                                    <div className="premium-empty-state">
                                        <div className="empty-icon">
                                            <ImageIcon size={48} />
                                        </div>
                                        <p>{t('photocontest.empty_themes')}</p>
                                    </div>
                                ) : (
                                    (config.themes || []).map((theme, index) => (
                                        <div key={index} className="premium-theme-item">
                                            <div className="item-rank">{index + 1}</div>
                                            <input 
                                                type="text" 
                                                className="item-name-input"
                                                value={theme.name} 
                                                onChange={e => updateTheme(index, 'name', e.target.value)} 
                                            />
                                            <div className="item-duration-pill">
                                                <Clock size={12} />
                                                <input 
                                                    type="number" 
                                                    value={theme.durationHours || ''} 
                                                    placeholder="Def"
                                                    onChange={e => updateTheme(index, 'durationHours', e.target.value ? parseInt(e.target.value) : null)}
                                                />
                                                <span>h</span>
                                            </div>
                                            <button className="item-delete-btn" onClick={() => removeTheme(index)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'messages' && (
                <div className="design-premium-layout fade-in">
                     <section className="glass-card design-card">
                        <div className="card-header">
                            <div className="card-header-title">
                                <Layout size={20} className="header-icon" />
                                <h3>{t('photocontest.buttons_title')}</h3>
                            </div>
                        </div>
                        <div className="card-content">
                            <div className="input-grid">
                                <div className="field-group">
                                    <label>{t('photocontest.submit_btn_label')}</label>
                                    <input className="premium-input" value={config.buttons?.participate?.label || ''} onChange={e => updateNested('buttons.participate.label', e.target.value)} placeholder={t('photocontest.submit_placeholder')} />
                                </div>
                                <div className="field-group">
                                    <label>{t('photocontest.vote_btn_label')}</label>
                                    <input className="premium-input" value={config.buttons?.leaderboard?.label || ''} onChange={e => updateNested('buttons.leaderboard.label', e.target.value)} placeholder={t('photocontest.vote_placeholder')} />
                                </div>
                                <div className="field-group">
                                    <label>{t('photocontest.upvote_icon')}</label>
                                    <input className="premium-input" value={config.buttons?.upvote?.emoji || ''} onChange={e => updateNested('buttons.upvote.emoji', e.target.value)} placeholder="👍" />
                                </div>
                                <div className="field-group">
                                    <label>{t('photocontest.downvote_icon')}</label>
                                    <input className="premium-input" value={config.buttons?.downvote?.emoji || ''} onChange={e => updateNested('buttons.downvote.emoji', e.target.value)} placeholder="👎" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <EmbedMessageManager 
                        guildId={guildId}
                        module="photocontest"
                        slugs={[
                            { key: 'contest_started', label: t('photocontest.msg_contest_started'), description: t('photocontest.msg_contest_started'), variables: ['theme', 'duration', 'end_time'], group: t('photocontest.group_contest'), groupIcon: Play },
                            { key: 'submission_received', label: t('photocontest.msg_submission_received'), description: t('photocontest.msg_submission_received'), variables: ['user', 'theme'], group: t('photocontest.group_participation'), groupIcon: UserCheck },
                            { key: 'vote_received', label: t('photocontest.msg_vote_received'), description: t('photocontest.msg_vote_received'), variables: ['user', 'voter', 'points', 'total_points'], group: t('photocontest.group_participation'), groupIcon: Trophy },
                            { key: 'contest_ended', label: t('photocontest.msg_contest_ended'), description: t('photocontest.msg_contest_ended'), variables: ['theme', 'winner', 'points'], group: t('photocontest.group_contest'), groupIcon: Trophy },
                            { key: 'hof_entry', label: t('photocontest.msg_hof_entry'), description: t('photocontest.msg_hof_entry'), variables: ['theme', 'winner', 'points', 'image_url'], group: t('photocontest.group_hof'), groupIcon: Trophy },
                            { key: 'winner_dm', label: t('photocontest.msg_winner_dm'), description: t('photocontest.msg_winner_dm'), variables: ['user', 'theme', 'points'], group: t('photocontest.group_hof'), groupIcon: UserCheck },
                            { key: 'error_no_participants', label: t('photocontest.msg_error_no_participants'), description: t('photocontest.msg_error_no_participants'), variables: [], group: t('photocontest.group_errors'), groupIcon: XCircle },
                            { key: 'leaderboard_error', label: t('photocontest.msg_leaderboard_error'), description: t('photocontest.msg_leaderboard_error'), variables: [], group: t('photocontest.group_errors'), groupIcon: XCircle }
                        ]}
                    />
                </div>
            )}
        </div>

        <ConfirmModal 
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal({...confirmModal, isOpen: false})}
            onConfirm={confirmModal.onConfirm}
            title={confirmModal.title}
            message={confirmModal.message}
            type={confirmModal.type}
        />

        <style jsx>{`
            .photocontest-container { padding: 32px; max-width: 1400px; margin: 0 auto; }
            
            /* Modern Header */
            .page-header-premium { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: var(--bg-card-glass); padding: 32px; border-radius: 24px; border: 1px solid var(--border-light); backdrop-filter: blur(12px); }
            .header-info { display: flex; align-items: center; gap: 24px; }
            .header-icon-glow { 
                width: 64px; height: 64px; background: var(--primary-glow); color: var(--primary); 
                border-radius: 18px; display: flex; align-items: center; justify-content: center;
                box-shadow: 0 8px 32px rgba(var(--primary-rgb), 0.2);
            }
            .title-row { display: flex; align-items: center; gap: 16px; margin-bottom: 4px; }
            .header-text h1 { font-size: 2rem; font-weight: 900; color: var(--text-main); margin: 0; }
            .header-text p { font-size: 1rem; color: var(--text-muted); margin: 0; }
            .header-actions { display: flex; gap: 12px; }

            /* Buttons */
            .btn-glass-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .btn-glass-danger:hover { background: #ef4444; color: white; transform: translateY(-2px); }
            .btn-glass-success { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .btn-glass-success:hover { background: #10b981; color: white; transform: translateY(-2px); }
            .btn-primary-premium { background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.3); }
            .btn-primary-premium:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(var(--primary-rgb), 0.4); }

            /* Tabs Navigation */
            .premium-tabs-nav { display: flex; gap: 12px; margin-bottom: 32px; background: var(--bg-badge); padding: 8px; border-radius: 20px; width: fit-content; }
            .premium-tab { display: flex; align-items: center; gap: 10px; padding: 12px 24px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; border-radius: 14px; cursor: pointer; transition: 0.3s; }
            .premium-tab:hover { color: var(--text-main); background: rgba(255, 255, 255, 0.05); }
            .premium-tab.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

            /* Grid & Cards */
            .config-grid-premium { display: grid; grid-template-columns: 1fr 360px; gap: 32px; }
            .glass-card { background: var(--bg-card-glass); backdrop-filter: blur(12px); border: 1px solid var(--border-light); border-radius: 24px; overflow: hidden; transition: 0.3s; }
            .card-header { padding: 24px 32px; border-bottom: 1px solid var(--border-light); background: rgba(255, 255, 255, 0.01); }
            .card-header-title { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
            .header-icon { color: var(--primary); }
            .card-header h3 { font-size: 1.1rem; font-weight: 800; color: var(--text-main); margin: 0; }
            .card-subtitle { font-size: 0.85rem; color: var(--text-muted); }
            .card-content { padding: 32px; }

            /* Forms & Inputs */
            .input-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
            .field-group { display: flex; flex-direction: column; gap: 10px; }
            .field-group-row { display: flex; gap: 24px; grid-column: span 2; }
            .field-group label { font-size: 0.8rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
            .premium-input { background: var(--bg-badge); border: 1px solid var(--border-light); padding: 12px 16px; border-radius: 12px; color: var(--text-main); font-weight: 600; transition: 0.3s; }
            .premium-input:focus { border-color: var(--primary); background: var(--bg-card); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
            
            .input-unit-wrapper { position: relative; }
            .input-unit-wrapper .premium-input { padding-right: 60px; width: 100%; }
            .unit-label { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); font-size: 0.7rem; font-weight: 900; color: var(--text-muted); }

            /* Upsell */
            .premium-upsell-box { grid-column: span 2; margin-top: 12px; display: flex; justify-content: space-between; align-items: center; padding: 24px; border-radius: 20px; background: rgba(99, 102, 241, 0.03); border: 1px solid rgba(99, 102, 241, 0.1); }
            .premium-upsell-box.locked { filter: grayscale(0.5); opacity: 0.8; }
            .upsell-title { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
            .upsell-title h4 { font-size: 1.05rem; font-weight: 800; margin: 0; }
            .premium-badge { background: linear-gradient(135deg, #f59e0b, #fbbf24); color: white; font-size: 0.65rem; font-weight: 900; padding: 2px 8px; border-radius: 6px; }
            .upsell-info p { font-size: 0.85rem; color: var(--text-muted); margin: 0; }
            .upsell-controls { display: flex; align-items: center; gap: 20px; }
            .winners-selector { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; font-weight: 700; color: var(--text-muted); }
            .mini-input { width: 54px; background: var(--bg-card); border: 1px solid var(--border-light); padding: 8px; border-radius: 10px; text-align: center; color: var(--primary); font-weight: 800; }

            /* Themes List */
            .rotation-status-card { display: flex; justify-content: space-between; align-items: center; padding: 24px 32px; margin-bottom: 24px; }
            .status-info { display: flex; align-items: center; gap: 20px; }
            .status-icon-glow { width: 44px; height: 44px; background: var(--primary-glow); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .status-text h3 { font-size: 1.1rem; font-weight: 800; margin: 0; }
            .status-text p { font-size: 0.85rem; color: var(--text-muted); margin: 2px 0 0 0; }

            .add-theme-premium { display: flex; gap: 12px; margin-bottom: 32px; background: var(--bg-badge); padding: 12px; border-radius: 20px; border: 1px solid var(--border-light); }
            .premium-input-wrapper { flex: 1; position: relative; display: flex; align-items: center; }
            .inner-icon { position: absolute; left: 16px; color: var(--text-muted); }
            .premium-input-wrapper input { width: 100%; background: transparent; border: none; padding: 12px 16px 12px 48px; color: var(--text-main); font-weight: 600; font-size: 1rem; }
            .btn-add-theme { background: var(--primary); color: white; border: none; width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; box-shadow: var(--primary-glow); }
            .btn-add-theme:hover { transform: scale(1.05) rotate(90deg); }

            .premium-themes-list { display: flex; flex-direction: column; gap: 12px; }
            .premium-theme-item { display: flex; align-items: center; gap: 16px; padding: 14px 20px; background: var(--bg-badge); border: 1px solid var(--border-light); border-radius: 18px; transition: 0.3s; }
            .premium-theme-item:hover { border-color: var(--primary-muted); transform: translateX(8px); background: var(--bg-card-glass); }
            .item-rank { width: 32px; height: 32px; background: var(--bg-card); color: var(--primary); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 900; }
            .item-name-input { flex: 1; background: transparent; border: none; color: var(--text-main); font-weight: 700; font-size: 1rem; }
            .item-duration-pill { display: flex; align-items: center; gap: 8px; background: var(--bg-card); padding: 6px 14px; border-radius: 12px; border: 1px solid var(--border-light); }
            .item-duration-pill input { width: 50px; background: transparent; border: none; color: var(--text-main); font-weight: 800; font-size: 0.9rem; text-align: right; }
            .item-duration-pill span { font-size: 0.7rem; font-weight: 900; color: var(--text-muted); text-transform: uppercase; }
            .item-delete-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; transition: 0.3s; padding: 10px; border-radius: 10px; }
            .item-delete-btn:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

            .premium-empty-state { padding: 60px; text-align: center; color: var(--text-muted); }
            .empty-icon { width: 100px; height: 100px; background: var(--bg-badge); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; opacity: 0.5; }

            /* Helper classes */
            .flex-1 { flex: 1; }
            .hint-text { font-size: 0.85rem; color: var(--text-muted); margin-top: 12px; line-height: 1.5; }

            .premium-toggle { position: relative; display: inline-block; width: 44px; height: 24px; }
            .premium-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--bg-badge); transition: .4s; border-radius: 34px; border: 1px solid var(--border-light); }
            .premium-slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: var(--text-muted); transition: .4s; border-radius: 50%; }
            input:checked + .premium-slider { background-color: var(--primary-glow); border-color: var(--primary-muted); }
            input:checked + .premium-slider:before { transform: translateX(20px); background-color: var(--primary); }

            @media (max-width: 1100px) {
                .config-grid-premium { grid-template-columns: 1fr; }
                .page-header-premium { flex-direction: column; align-items: flex-start; gap: 24px; }
                .input-grid { grid-template-columns: 1fr; }
            }

            /* Force Light Mode Visibility */
            :global(.light-theme) .glass-card { background: rgba(255, 255, 255, 0.9) !important; border-color: rgba(0, 0, 0, 0.1) !important; }
            :global(.light-theme) .premium-input { background: #f1f5f9 !important; border-color: #e2e8f0 !important; color: #0f172a !important; }
            :global(.light-theme) .card-header { background: rgba(0, 0, 0, 0.02) !important; border-bottom-color: rgba(0, 0, 0, 0.05) !important; }
            :global(.light-theme) .page-header-premium { background: white !important; box-shadow: 0 4px 20px rgba(0,0,0,0.05) !important; border-color: rgba(0,0,0,0.08) !important; }
            :global(.light-theme) .header-text h1 { color: #0f172a !important; }
            :global(.light-theme) .card-header h3 { color: #0f172a !important; }
            :global(.light-theme) .premium-tab { color: #64748b; }
            :global(.light-theme) .premium-tab.active { background: white !important; color: var(--primary) !important; }
            :global(.light-theme) .premium-tabs-nav { background: #f1f5f9 !important; }
        `}</style>
    </div>
  );
}
