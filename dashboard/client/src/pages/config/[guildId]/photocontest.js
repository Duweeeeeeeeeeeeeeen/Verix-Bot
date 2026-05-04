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
    <div className="config-page-layout animate">
      <div className="config-main-col">
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                <ImageIcon size={24} />
              </div>
              <div className="header-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h1>{t('photocontest.title')}</h1>
                  <label className="toggle-mini" title={config.enabled ? t('photocontest.active') : t('photocontest.inactive')}>
                    <input type="checkbox" checked={!!config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                    <span className="slider-mini"></span>
                  </label>
                </div>
                <p>{t('photocontest.desc')}</p>
              </div>
           </div>
           <div className="header-buttons-grid">
               <button onClick={terminateContest} className="btn-outline" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>
                  <Square size={16} /> {t('photocontest.btn_terminate')}
               </button>
               <button onClick={startContest} className="btn-outline" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
                  <Play size={16} /> {t('photocontest.btn_start_now')}
               </button>
               <button onClick={handleSave} className="btn-primary" disabled={saving}>
                  <Save size={16} /> {saving ? t('common.saving') : t('common.save')}
               </button>
           </div>
        </header>

        <div className="tab-navigation">
            <button onClick={() => setActiveTab('settings')} className={`tab-link ${activeTab === 'settings' ? 'active' : ''}`}>
                <Settings2 size={16} /> <span>{t('photocontest.tab_settings')}</span>
            </button>
            <button onClick={() => setActiveTab('themes')} className={`tab-link ${activeTab === 'themes' ? 'active' : ''}`}>
                <ImageIcon size={16} /> <span>{t('photocontest.tab_themes')}</span>
            </button>
            <button onClick={() => setActiveTab('messages')} className={`tab-link ${activeTab === 'messages' ? 'active' : ''}`}>
                <RefreshCw size={16} /> <span>{t('photocontest.tab_design')}</span>
            </button>
        </div>

        <div className="tab-panel animate">
            {activeTab === 'settings' && (
                <div className="config-grid animate fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
                    <div className="grid-left">
                        <section className="card section-card" style={{ padding: '24px' }}>
                            <div className="align-center">
                                <Layout size={18} color="var(--primary)" />
                                <h3>{t('photocontest.destinations_title')}</h3>
                            </div>
                            <div className="fields-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
                                <div className="field-box">
                                    <label className="text-label">{t('photocontest.channel_label')}</label>
                                    <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 0 || c.type === 5)} value={config.channelId || ''} onChange={v => setConfig({...config, channelId: v})} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">{t('photocontest.hall_of_fame_label')}</label>
                                    <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 0 || c.type === 5)} value={config.hallOfFameChannelId || ''} onChange={v => setConfig({...config, hallOfFameChannelId: v})} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">{t('photocontest.winner_role_label')}</label>
                                    <DiscordSelector type="role" options={discordData.roles} value={config.winnerRoleId || ''} onChange={v => setConfig({...config, winnerRoleId: v})} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">
                                        {t('photocontest.interval_label')}
                                        <HelpTooltip text={t('photocontest.interval_help')} />
                                    </label>
                                    <input type="number" className="input" value={config.intervalHours || 24} onChange={e => setConfig({...config, intervalHours: parseInt(e.target.value) || 1})} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">{t('photocontest.duration_label')}</label>
                                    <input type="number" className="input" value={config.durationHours || 24} onChange={e => setConfig({...config, durationHours: parseInt(e.target.value) || 1})} />
                                </div>
                                <div className="field-box" style={{ gridColumn: 'span 2' }}>
                                    <div className="premium-field-card" style={{ 
                                        padding: '16px', 
                                        background: guildData?.isPremium ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-badge)', 
                                        borderRadius: '12px', 
                                        border: guildData?.isPremium ? '1px solid var(--primary)' : '1px solid var(--border)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <h4 style={{ margin: 0 }}>Vincitori Multipli (PRO)</h4>
                                                {!guildData?.isPremium && <Crown size={12} color="var(--gold)" />}
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Permetti a più utenti di vincere il concorso contemporaneamente.</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            {config.multiWinner && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Numero:</span>
                                                    <input 
                                                        type="number" 
                                                        className="input-s" 
                                                        style={{ width: '50px', padding: '4px' }}
                                                        value={config.winnersCount || 1}
                                                        disabled={!guildData?.isPremium}
                                                        onChange={(e) => setConfig({...config, winnersCount: parseInt(e.target.value) || 1})}
                                                    />
                                                </div>
                                            )}
                                            <label className="switch">
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
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="grid-right">
                        <section className="card section-card" style={{ padding: '20px' }}>
                            <div className="align-center" style={{ marginBottom: '16px' }}>
                                <UserCheck size={18} color="var(--primary)" />
                                <h3>{t('photocontest.staff_roles_title')}</h3>
                            </div>
                            <DiscordSelector type="role" multiple options={discordData.roles} value={config.staffRoles || []} onChange={v => setConfig({...config, staffRoles: v})} />
                            <p className="field-help" style={{ marginTop: '12px' }}>{t('photocontest.staff_roles_help')}</p>
                        </section>

                        <div style={{ marginTop: '24px' }}>
                            <NotificationSettings 
                                guildId={guildId}
                                value={config.notifications}
                                onChange={val => setConfig({...config, notifications: val})}
                                title={t('photocontest.notif_title')}
                                description={t('photocontest.notif_desc')}
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'themes' && (
                <div className="animate fade-in">
                    <section className="card status-card-p" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px' }}>
                        <div className="align-center"><RefreshCw size={18} color="var(--primary)" /> <h3>{t('photocontest.rotation_title')}</h3></div>
                        <label className="toggle">
                            <input type="checkbox" checked={!!config.automaticThemes} onChange={e => setConfig({...config, automaticThemes: e.target.checked})} />
                            <span className="slider"></span>
                        </label>
                    </section>

                    <section className="card section-card" style={{ padding: '24px' }}>
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div className="align-center">
                                <List size={18} color="var(--primary)" />
                                <h3>{t('photocontest.themes_list_title')}</h3>
                            </div>
                        </div>

                        <div className="add-theme-row" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                            <input 
                                type="text" 
                                className="input" 
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
                            {!guildData?.isPremium && (config.themes || []).length >= 5 ? (
                                <button onClick={() => router.push(`/config/${guildId}/premium`)} className="btn-add-premium locked" style={{ padding: '0 20px' }}>
                                    <Plus size={18} /> <span>PRO</span>
                                </button>
                            ) : (
                                <button className="btn-primary" style={{ padding: '0 20px' }} onClick={() => {
                                    const inp = document.getElementById('new-theme-input');
                                    addTheme(inp.value);
                                    inp.value = '';
                                }}>
                                    <Plus size={18} />
                                </button>
                            )}
                        </div>
                        
                        <div className="themes-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {(config.themes || []).length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', opacity: 0.6 }}>
                                    <ImageIcon size={32} style={{ marginBottom: '12px' }} />
                                    <p>{t('photocontest.empty_themes')}</p>
                                </div>
                            ) : (
                                (config.themes || []).map((theme, index) => (
                                    <div key={index} className="theme-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-badge)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <div style={{ width: '28px', height: '28px', background: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                            {index + 1}
                                        </div>
                                        <input 
                                            type="text" 
                                            className="input-s" 
                                            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-main)', fontWeight: '600' }}
                                            value={theme.name} 
                                            onChange={e => updateTheme(index, 'name', e.target.value)} 
                                        />
                                        <div className="duration-field" title={t('photocontest.theme_duration_title')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                            <Clock size={14} color="var(--text-dim)" />
                                            <input 
                                                type="number" 
                                                className="input-inline" 
                                                style={{ width: '60px', background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem', textAlign: 'right' }}
                                                placeholder="Def." 
                                                value={theme.durationHours || ''} 
                                                onChange={e => updateTheme(index, 'durationHours', e.target.value ? parseInt(e.target.value) : null)}
                                            />
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>h</span>
                                        </div>
                                        <button className="btn-icon-danger-sm" style={{ color: 'var(--error)', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => removeTheme(index)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'messages' && (
                <div className="animate fade-in">
                     <section className="card section-card animate fade-in" style={{ marginBottom: '24px', padding: '24px' }}>
                        <div className="align-center"><Layout size={18} color="var(--primary)" /> <h3>{t('photocontest.buttons_title')}</h3></div>
                        <div className="fields-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
                            <div className="field-box">
                                <label className="text-label">{t('photocontest.submit_btn_label')}</label>
                                <input className="input" value={config.buttons?.participate?.label || ''} onChange={e => updateNested('buttons.participate.label', e.target.value)} placeholder={t('photocontest.submit_placeholder')} />
                            </div>
                            <div className="field-box">
                                <label className="text-label">{t('photocontest.vote_btn_label')}</label>
                                <input className="input" value={config.buttons?.leaderboard?.label || ''} onChange={e => updateNested('buttons.leaderboard.label', e.target.value)} placeholder={t('photocontest.vote_placeholder')} />
                            </div>
                            <div className="field-box">
                                <label className="text-label">{t('photocontest.upvote_icon')}</label>
                                <input className="input" value={config.buttons?.upvote?.emoji || ''} onChange={e => updateNested('buttons.upvote.emoji', e.target.value)} placeholder="👍" />
                            </div>
                            <div className="field-box">
                                <label className="text-label">{t('photocontest.downvote_icon')}</label>
                                <input className="input" value={config.buttons?.downvote?.emoji || ''} onChange={e => updateNested('buttons.downvote.emoji', e.target.value)} placeholder="👎" />
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
      </div>

      <style jsx>{`
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-badge); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; color: var(--text-main); }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }
            
            .tab-navigation { display: flex; gap: 8px; margin-bottom: 32px; padding: 6px; background: var(--bg-sidebar-alt); border-radius: 14px; border: 1px solid var(--border); width: fit-content; }
            .tab-link { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border: none; background: transparent; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; border-radius: 10px; cursor: pointer; transition: 0.2s; }
            .tab-link:hover { color: var(--text-main); background: var(--bg-badge); }
            .tab-link.active { color: var(--text-main); background: var(--bg-card); box-shadow: var(--shadow-sm); border: 1px solid var(--border); }

            .header-buttons-grid { display: flex; gap: 10px; }
            .align-center { display: flex; align-items: center; gap: 10px; }
            .input-inline:focus { outline: none; }
            @media (max-width: 1000px) { .header-buttons-grid { flex-direction: column; } }
        `}</style>
    </div>
  );
}
