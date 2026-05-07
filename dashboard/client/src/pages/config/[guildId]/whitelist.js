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
  Save, 
  Send, 
  Users, 
  Settings2, 
  ListChecks, 
  Palette, 
  Plus, 
  Trash2, 
  RefreshCcw, 
  Power, 
  Clock, 
  ShieldCheck, 
  Target, 
  BellRing,
  Type,
  Hash,
  MousePointer2,
  ChevronRight,
  Info,
  Mic2,
  Lock,
  Volume2,
  AlertCircle,
  ExternalLink,
  Command,
  MessageSquare,
  Play,
  HelpCircle,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import EmojiInput from '../../../components/EmojiInput';
import CustomSelect from '../../../components/CustomSelect';
import { NotificationSettings } from '../../../components/LazyConfigComponents';
import { mergeConfig } from '../../../utils/defaults';

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
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.request(`/messages/${guildId}/whitelist`);
      setMessages(res.data || res || {});
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (guildId && mounted) {
      fetchMessages();
      Promise.all([
        api.request(`/config/${guildId}/whitelist`),
        api.request(`/config/${guildId}/background`),
        api.request(`/config/${guildId}/discord-data`)
      ]).then(([wlData, bgData, discordRes]) => {
        const finalConfig = mergeConfig(wlData.data || wlData, 'whitelist');
        const finalBgConfig = mergeConfig(bgData.data || bgData, 'background');
        
        setConfig(finalConfig);
        setBgConfig(finalBgConfig);
        setChannels(discordRes?.data?.channels || discordRes?.channels || []);
        setRoles(discordRes?.data?.roles || discordRes?.roles || []);
        setLoading(false);
      }).catch(err => {
        console.error("Error loading admission data:", err);
        setLoading(false);
      });
    }
  }, [guildId, mounted]);

  useEffect(() => {
    if (config) {
      window.dispatchEvent(new CustomEvent('update-guide-context', { detail: config }));
    }
  }, [config]);

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
    try {
      await Promise.all([
        api.request(`/config/${guildId}/whitelist`, {
          method: 'POST',
          body: JSON.stringify(config)
        }),
        api.request(`/config/${guildId}/background`, {
          method: 'POST',
          body: JSON.stringify(bgConfig)
        }),
        api.request(`/messages/${guildId}/whitelist`, {
          method: 'POST',
          body: JSON.stringify(messages)
        })
      ]);
      showToast(t('common.save_success'));
    } catch (error) {
       showToast(t('common.save_error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendPanel = async () => {
    if (!config.panelChannelId) return showToast(t('whitelist.panel_channel_error'), 'error');
    setSendingPanel(true);
    try {
      await handleSave();
      await api.request(`/config/${guildId}/whitelist/send-panel`, {
        method: 'POST',
        body: JSON.stringify({ channelId: config.panelChannelId })
      });
      showToast(t('common.save_success'));
    } catch (error) {
       console.error(error);
    } finally {
      setSendingPanel(false);
    }
  };

  const handleSendBgPanel = async () => {
    if (!bgConfig.panelChannelId) return showToast(t('whitelist.bg_channel_error'), 'error');
    setSendingBgPanel(true);
    try {
      await handleSave();
      await api.request(`/config/${guildId}/background/send-panel`, {
        method: 'POST',
        body: JSON.stringify({ channelId: bgConfig.panelChannelId })
      });
      showToast(t('common.save_success'));
    } catch (error) {
       console.error(error);
    } finally {
      setSendingBgPanel(false);
    }
  };

  if (!mounted || loading || !config) return <Skeleton type="config" />;

  const tabs = [
    { id: 'settings', name: t('whitelist.tab_settings'), icon: Settings2 },
    { id: 'background', name: t('whitelist.tab_background'), icon: Command, modes: ['BG_ONLY', 'BG_TEXT', 'BG_VOICE', 'FULL'] },
    { id: 'questions', name: t('whitelist.tab_questions'), icon: ListChecks, modes: ['TEXT', 'HYBRID', 'BG_TEXT', 'FULL'] },
    { id: 'voice', name: t('whitelist.tab_voice'), icon: Mic2, modes: ['VOICE', 'HYBRID', 'BG_VOICE', 'FULL'] },
    { id: 'personalization', name: t('whitelist.tab_design'), icon: Palette },
  ].filter(tab => !tab.modes || tab.modes.includes(config.mode));

  return (
    <div className="config-page-layout">
      <div className="config-main-col">
        <div className="animate">
        
        {/* Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <ShieldCheck size={24} />
              </div>
              <div className="header-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h1>{t('whitelist.title')}</h1>
                  <label className="toggle-mini" title={config.enabled ? t('whitelist.active') : t('whitelist.inactive')}>
                    <input type="checkbox" checked={!!config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                    <span className="slider-mini"></span>
                  </label>
                </div>
                <p>{t('whitelist.desc')}</p>
              </div>
           </div>
           <div className="header-buttons">
              {activeTab === 'background' ? (
                bgConfig.entryPoint !== 'INTEGRATED' && (
                  <button onClick={handleSendBgPanel} className="btn-outline" disabled={sendingBgPanel}>
                     <Send size={16} /> {t('whitelist.send_panel_bg')}
                  </button>
                )
              ) : config.mode !== 'BG_ONLY' && (
                <button onClick={handleSendPanel} className="btn-outline" disabled={sendingPanel}>
                   <Send size={16} /> {t('whitelist.send_panel_wl')}
                </button>
              )}
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? t('common.saving') : t('common.save')}
              </button>
           </div>
        </header>

        {/* Tab Navigation */}
        <div className="tab-navigation">
            {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-link ${activeTab === tab.id ? 'active' : ''}`}>
                        <Icon size={16} />
                        <span>{tab.name}</span>
                    </button>
                );
            })}
        </div>

        <div className="tab-panel animate">
            
            {/* TAB: Settings */}
            {activeTab === 'settings' && (
                <div className="config-grid">
                    <div className="grid-left">
                        <section className="card section-card">
                            <div className="section-header">
                                <div className="align-center">
                                    <Power size={18} color="var(--primary)" />
                                    <h3>{t('whitelist.core_config')}</h3>
                                </div>
                            </div>
                            
                             <div className="fields-grid" style={{ marginTop: '24px' }}>
                                {config.mode !== 'BG_ONLY' && (
                                    <>
                                        <div className="field-box">
                                            <label className="text-label">{t('whitelist.panel_channel')}</label>
                                            <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.panelChannelId || ''} onChange={val => setConfig({...config, panelChannelId: val})} />
                                        </div>
                                        <div className="field-box">
                                            <label className="text-label">{t('whitelist.ticket_category')}</label>
                                            <DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.categoryOpenId || ''} onChange={val => setConfig({...config, categoryOpenId: val})} />
                                        </div>
                                        <div className="field-box">
                                            <label className="text-label">{t('whitelist.log_channel')}</label>
                                            <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.logChannelId || ''} onChange={val => setConfig({...config, logChannelId: val})} />
                                        </div>
                                    </>
                                )}
                                <div className="field-box">
                                    <label className="text-label">{t('whitelist.mode')}</label>
                                    <CustomSelect 
                                        options={[
                                            { value: 'TEXT', label: t('whitelist.mode_text') },
                                            { value: 'VOICE', label: t('whitelist.mode_voice') },
                                            { value: 'HYBRID', label: t('whitelist.mode_hybrid') },
                                            { value: 'BG_ONLY', label: t('whitelist.mode_bg_only') },
                                            { value: 'BG_TEXT', label: t('whitelist.mode_bg_text') },
                                            { value: 'BG_VOICE', label: t('whitelist.mode_bg_voice') },
                                            { value: 'FULL', label: t('whitelist.mode_full') }
                                        ]} 
                                        value={config.mode || 'TEXT'} 
                                        onChange={val => setConfig({...config, mode: val})} 
                                    />
                                </div>
                            </div>
                        </section>



                        {config.mode !== 'BG_ONLY' && (
                            <>
                                <section className="card section-card" style={{ marginTop: '24px' }}>
                                    <div className="align-center" style={{ marginBottom: '20px' }}>
                                        <Clock size={18} color="var(--primary)" />
                                        <h3>{t('whitelist.limits_title')}</h3>
                                    </div>
                                    <div className="fields-grid">
                                        <div className="field-box">
                                            <label className="text-label">{t('whitelist.test_duration')}</label>
                                            <input type="number" className="input" value={config.timeLimit || 30} onChange={e => setConfig({...config, timeLimit: parseInt(e.target.value)})} />
                                        </div>
                                        <div className="field-box">
                                            <label className="text-label">{t('whitelist.cooldown')}</label>
                                            <input type="number" className="input" value={config.cooldown || 24} onChange={e => setConfig({...config, cooldown: parseInt(e.target.value)})} />
                                        </div>
                                    </div>
                                </section>

                                <section className="card section-card" style={{ marginTop: '24px' }}>
                                    <div className="align-center" style={{ marginBottom: '20px' }}>
                                        <ShieldCheck size={18} color="var(--primary)" />
                                        <h3>{t('whitelist.auto_text_title')}</h3>
                                        <HelpTooltip text={t('whitelist.staff_help')} />
                                    </div>
                                    <div className="fields-grid">
                                        <div className="field-box">
                                            <label className="text-label">{t('whitelist.roles_to_add')}</label>
                                            <DiscordSelector type="role" multiple={true} options={roles} value={config.rolesToAddOnTextPass || []} onChange={val => setConfig({...config, rolesToAddOnTextPass: val})} />
                                        </div>
                                        <div className="field-box">
                                            <label className="text-label">{t('whitelist.roles_to_remove')}</label>
                                            <DiscordSelector type="role" multiple={true} options={roles} value={config.rolesToRemoveOnTextPass || []} onChange={val => setConfig({...config, rolesToRemoveOnTextPass: val})} />
                                        </div>
                                    </div>
                                </section>
                            </>
                        )}
                    </div>

                    <div className="grid-right">
                        <section className="card section-card">
                            <h3 className="sidebar-title align-center" style={{ marginBottom: '16px' }}><Users size={18} /> {t('whitelist.staff_roles')}</h3>
                            <DiscordSelector type="role" multiple={true} options={roles} value={config.staffRoleIds || []} onChange={val => setConfig({...config, staffRoleIds: val})} />
                            <p className="text-description" style={{ marginTop: '12px' }}>{t('whitelist.staff_help')}</p>
                        </section>

                        <NotificationSettings 
                            guildId={guildId}
                            value={config.notifications}
                            onChange={val => setConfig({...config, notifications: val})}
                            title={t('whitelist.notif_title')}
                            description={t('whitelist.notif_desc')}
                        />
                    </div>
                </div>
            )}

            {/* TAB: Background */}
            {activeTab === 'background' && (
                <div className="config-grid">
                    <div className="grid-left">
                        <section className="card section-card">
                            <div className="section-header">
                                <div className="align-center">
                                    <Command size={18} color="var(--primary)" />
                                    <h3>{t('whitelist.bg_title')}</h3>
                                </div>
                                <label className="toggle">
                                    <input type="checkbox" checked={!!bgConfig.enabled} onChange={e => setBgConfig({...bgConfig, enabled: e.target.checked})} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            
                            <div className="fields-grid" style={{ marginTop: '24px' }}>
                                {bgConfig.entryPoint !== 'INTEGRATED' && (
                                    <div className="field-box">
                                        <label className="text-label">{t('whitelist.bg_channel')}</label>
                                        <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={bgConfig.panelChannelId || ''} onChange={val => setBgConfig({...bgConfig, panelChannelId: val})} />
                                    </div>
                                )}
                                <div className="field-box">
                                    <label className="text-label">{t('whitelist.bg_log')}</label>
                                    <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={bgConfig.logChannelId || ''} onChange={val => setBgConfig({...bgConfig, logChannelId: val})} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">{t('whitelist.entry_point')}</label>
                                    <CustomSelect 
                                        options={[
                                            { value: 'PANEL', label: t('whitelist.entry_panel') },
                                            { value: 'INTEGRATED', label: t('whitelist.entry_integrated') }
                                        ]} 
                                        value={bgConfig.entryPoint || 'PANEL'} 
                                        onChange={val => setBgConfig({...bgConfig, entryPoint: val})} 
                                    />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">{t('whitelist.bg_staff')}</label>
                                    <DiscordSelector type="role" multiple={true} options={roles} value={bgConfig.staffRoleIds || []} onChange={val => setBgConfig({...bgConfig, staffRoleIds: val})} />
                                </div>
                            </div>
                        </section>


                    </div>
                    <div className="grid-right">
                        <NotificationSettings 
                            guildId={guildId}
                            value={bgConfig.notifications}
                            onChange={val => setBgConfig({...bgConfig, notifications: val})}
                            title={t('whitelist.bg_notif_title')}
                            description={t('whitelist.bg_notif_desc')}
                        />
                    </div>
                </div>
            )}

            {/* TAB: Voice (Vocale) */}
            {activeTab === 'voice' && (
                <div className="config-grid">
                    <div className="grid-left">
                        <section className="card section-card">
                            <div className="section-header">
                                <div className="align-center">
                                    <Mic2 size={18} color="var(--primary)" />
                                    <h3>{t('whitelist.voice_title')}</h3>
                                </div>
                                <label className="toggle">
                                    <input type="checkbox" checked={!config.voiceSettings?.paused} onChange={e => setNested('voiceSettings.paused', !e.target.checked)} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            
                            <div className="fields-grid" style={{ marginTop: '24px' }}>
                                <div className="field-box">
                                    <label className="text-label">{t('whitelist.voice_waiting')}</label>
                                    <DiscordSelector type="channel" options={channels.filter(c => c.type === 2)} value={config.voiceSettings?.joinChannelId || ''} onChange={val => setNested('voiceSettings.joinChannelId', val)} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">{t('whitelist.voice_category')}</label>
                                    <DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.voiceSettings?.categoryId || ''} onChange={val => setNested('voiceSettings.categoryId', val)} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">{t('whitelist.voice_rejection_cooldown')}</label>
                                    <input type="number" className="input" value={config.voiceSettings?.rejectionCooldown || 24} onChange={e => setNested('voiceSettings.rejectionCooldown', parseInt(e.target.value))} />
                                </div>
                                <div className="field-box" style={{ gridColumn: 'span 2' }}>
                                    <label className="text-label flex-between">
                                        {t('whitelist.voice_name_template')}
                                        <HelpTooltip text={t('whitelist.voice_help_template')} />
                                    </label>
                                    <input 
                                        type="text" 
                                        className="input" 
                                        placeholder="es: wl-{user}" 
                                        value={config.voiceSettings?.channelNameTemplate || ''} 
                                        onChange={e => setNested('voiceSettings.channelNameTemplate', e.target.value)} 
                                    />
                                </div>
                                <div className="field-box" style={{ gridColumn: 'span 2' }}>
                                <div className="alert-box" style={{ background: 'var(--primary-glow)', borderColor: 'var(--primary)' }}>
                                        <div className="flex-between w-full">
                                            <div className="align-center">
                                                <Hash size={16} color="var(--primary)" />
                                                <span>{t('whitelist.voice_counter')}: <strong>{config.voiceSettings?.sessionCounter || 0}</strong></span>
                                            </div>
                                            <button 
                                                className="btn-outline-sm" 
                                                onClick={() => {
                                                    if(confirm(t('whitelist.voice_reset_confirm'))) {
                                                        setNested('voiceSettings.sessionCounter', 0);
                                                    }
                                                }}
                                            >
                                                <RefreshCcw size={14} /> {t('dashboard.refresh')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="toggle-list" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div className="toggle-box">
                                    <div className="flex-col">
                                        <span style={{ fontWeight: 600 }}>{t('whitelist.voice_auto_delete')}</span>
                                        <p className="text-dim" style={{ fontSize: '0.75rem' }}>{t('whitelist.voice_auto_delete_desc')}</p>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" checked={!!config.voiceSettings?.autoDelete} onChange={e => setNested('voiceSettings.autoDelete', e.target.checked)} />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="toggle-box">
                                    <div className="flex-col">
                                        <span style={{ fontWeight: 600 }}>{t('whitelist.voice_ping_staff')}</span>
                                        <p className="text-dim" style={{ fontSize: '0.75rem' }}>{t('whitelist.voice_ping_staff_desc')}</p>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" checked={!!config.voiceSettings?.pingStaffOnJoin} onChange={e => setNested('voiceSettings.pingStaffOnJoin', e.target.checked)} />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>
                        </section>

                        <section className="card section-card" style={{ marginTop: '24px' }}>
                            <div className="align-center" style={{ marginBottom: '20px' }}>
                                <ShieldCheck size={18} color="var(--primary)" />
                                <h3>{t('whitelist.voice_promo_title')}</h3>
                            </div>
                            <div className="fields-grid">
                                <div className="field-box">
                                    <label className="text-label">{t('whitelist.roles_to_add')}</label>
                                    <DiscordSelector type="role" multiple={true} options={roles} value={config.voiceSettings?.rolesToAdd || []} onChange={val => setNested('voiceSettings.rolesToAdd', val)} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">{t('whitelist.roles_to_remove')}</label>
                                    <DiscordSelector type="role" multiple={true} options={roles} value={config.voiceSettings?.rolesToRemove || []} onChange={val => setNested('voiceSettings.rolesToRemove', val)} />
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="grid-right">
                        <section className="card section-card">
                            <h3 className="sidebar-title align-center" style={{ marginBottom: '16px' }}><Users size={18} /> {t('whitelist.voice_staffers')}</h3>
                            <DiscordSelector type="role" multiple={true} options={roles} value={config.voiceSettings?.staffRoleIds || []} onChange={val => setNested('voiceSettings.staffRoleIds', val)} />
                        </section>
                    </div>
                </div>
            )}

            {/* TAB: Questions */}
            {activeTab === 'questions' && (
                <div className="card section-card">
                    <div className="section-header">
                        <div>
                            <h3>{t('whitelist.q_bank')}</h3>
                            <p className="text-muted">{t('whitelist.q_per_session', { count: config.questionsPerSession })}</p>
                        </div>
                        <button onClick={() => setConfig({...config, questions: [{ text: '', minLength: 20 }, ...(config.questions || [])]})} className="btn-primary">
                            <Plus size={16} /> {t('common.add')}
                        </button>
                    </div>

                    <div className="questions-container" style={{ marginTop: '24px' }}>
                        {config.questions?.map((q, idx) => (
                            <div key={idx} className="question-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'flex-start' }}>
                                <div className="q-badge">{idx + 1}</div>
                                <div style={{ flex: 1 }}>
                                    <textarea className="input" rows="3" value={q.text || ''} onChange={e => {
                                        const qs = [...config.questions];
                                        qs[idx].text = e.target.value;
                                        setConfig({...config, questions: qs});
                                    }} placeholder={t('whitelist.q_placeholder')} />
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input type="number" className="input" style={{ width: '80px' }} value={q.minLength || 0} onChange={e => {
                                        const qs = [...config.questions];
                                        qs[idx].minLength = parseInt(e.target.value) || 0;
                                        setConfig({...config, questions: qs});
                                    }} />
                                    <button onClick={() => setConfig({...config, questions: config.questions.filter((_, i) => i !== idx)})} className="btn-icon-danger">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB: Design */}
            {activeTab === 'personalization' && (
                <div className="animate fade-in">
                    <section className="card section-card" style={{ marginBottom: '24px' }}>
                        <div className="align-center" style={{ marginBottom: '20px' }}>
                            <MousePointer2 size={18} color="var(--primary)" />
                            <h3>{t('whitelist.btn_branding')}</h3>
                        </div>
                        <div className="fields-grid">
                            <div className="field-box">
                                <label className="label-tiny">{t('whitelist.btn_label')}</label>
                                <input className="input" value={config.buttons?.start_wl?.label || ''} onChange={e => setNested('buttons.start_wl.label', e.target.value)} placeholder={t('whitelist.msg_start')} />
                            </div>
                            <div className="field-box">
                                <label className="label-tiny">{t('whitelist.btn_emoji')}</label>
                                <div style={{ width: '60px' }}>
                                    <EmojiInput value={config.buttons?.start_wl?.emoji || ''} onChange={e => setNested('buttons.start_wl.emoji', e.target.value)} />
                                </div>
                            </div>
                            <div className="field-box" style={{ gridColumn: 'span 2' }}>
                                <label className="label-tiny">{t('whitelist.btn_style')}</label>
                                <div className="style-selector-v">
                                    {[
                                        { id: 'SUCCESS', label: t('tickets.btn_style_green'), color: 'var(--discord-green)' },
                                        { id: 'PRIMARY', label: t('tickets.btn_style_blue'), color: 'var(--discord-blurple)' },
                                        { id: 'SECONDARY', label: t('tickets.btn_style_gray'), color: 'var(--discord-gray)' },
                                        { id: 'DANGER', label: t('tickets.btn_style_red'), color: 'var(--discord-red)' },
                                        { id: 'LINK', label: t('tickets.btn_style_link'), color: 'var(--info)' }
                                    ].map(style => (
                                        <button 
                                            key={style.id}
                                            onClick={() => setNested('buttons.start_wl.style', style.id)}
                                            className={`style-btn ${config.buttons?.start_wl?.style === style.id ? 'active' : ''}`}
                                        >
                                            <div className="dot" style={{ backgroundColor: style.color }}></div>
                                            <span>{style.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {config.buttons?.start_wl?.style === 'LINK' && (
                                <div className="field-box animate fade-in" style={{ gridColumn: 'span 2' }}>
                                    <label className="label-tiny">{t('whitelist.btn_url')}</label>
                                    <input className="input" value={config.buttons?.start_wl?.url || ''} onChange={e => setNested('buttons.start_wl.url', e.target.value)} placeholder="https://..." />
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="card section-card" style={{ marginBottom: '24px' }}>
                        <div className="section-header">
                            <div className="align-center">
                                <Palette size={18} color="var(--primary)" />
                                <h3>{t('whitelist.global_colors')}</h3>
                            </div>
                        </div>
                        <div className="fields-grid" style={{ marginTop: '16px' }}>
                            <div className="field-box">
                                <label className="text-label">{t('whitelist.color_success')}</label>
                                <input type="color" value={config.colors?.success || 'var(--success)'} onChange={e => setNested('colors.success', e.target.value)} />
                            </div>
                            <div className="field-box">
                                <label className="text-label">{t('whitelist.color_danger')}</label>
                                <input type="color" value={config.colors?.danger || 'var(--error)'} onChange={e => setNested('colors.danger', e.target.value)} />
                            </div>
                        </div>
                    </section>

                    <EmbedMessageManager 
                        guildId={guildId}
                        module="whitelist"
                        slugs={[
                            { key: 'panel', label: t('whitelist.msg_panel'), description: t('whitelist.msg_panel'), variables: ['guild'], group: t('whitelist.group_access'), groupIcon: Play },
                            { key: 'start', label: t('whitelist.msg_start'), description: t('whitelist.msg_start'), variables: ['user', 'time_limit'], group: t('whitelist.group_interview'), groupIcon: Play },
                            { key: 'question', label: t('whitelist.msg_question'), description: t('whitelist.msg_question'), variables: ['text', 'count', 'total'], group: t('whitelist.group_interview'), groupIcon: Play },
                            { key: 'review', label: t('whitelist.msg_review'), description: t('whitelist.msg_review'), variables: ['user'], group: t('whitelist.group_interview'), groupIcon: Play },
                            { key: 'session_completed', label: t('whitelist.msg_completed'), description: t('whitelist.msg_completed'), variables: ['user'], group: t('whitelist.group_end'), groupIcon: CheckCircle2 },
                            { key: 'submission_confirmed', label: t('whitelist.msg_confirmed'), description: t('whitelist.msg_confirmed'), variables: ['user'], group: t('whitelist.group_end'), groupIcon: CheckCircle2 },
                            { key: 'staff_received', label: t('whitelist.msg_staff_received'), description: t('whitelist.msg_staff_received'), variables: ['user', 'age', 'about'], group: t('whitelist.group_staff'), groupIcon: ShieldCheck },
                            { key: 'queue_log', label: t('whitelist.msg_queue_log'), description: t('whitelist.msg_queue_log'), variables: ['user', 'waiting_count'], group: t('whitelist.group_staff'), groupIcon: ShieldCheck },
                            { key: 'dm_accepted', label: t('whitelist.msg_accepted'), description: t('whitelist.msg_accepted'), variables: ['user'], group: t('whitelist.group_outcome'), groupIcon: CheckCircle2 },
                            { key: 'dm_rejected', label: t('whitelist.msg_rejected'), description: t('whitelist.msg_rejected'), variables: ['user', 'reason'], group: t('whitelist.group_outcome_neg'), groupIcon: XCircle },
                            { key: 'dm_text_pass', label: t('whitelist.msg_text_pass'), description: t('whitelist.msg_text_pass'), variables: ['user'], group: t('whitelist.group_outcome'), groupIcon: CheckCircle2 },
                            { key: 'dm_voice_rejected', label: t('whitelist.msg_voice_rejected'), description: t('whitelist.msg_voice_rejected'), variables: ['user', 'reason'], group: t('whitelist.group_outcome_neg'), groupIcon: XCircle },
                            { key: 'promote_vip_success', label: t('whitelist.msg_promo_vip'), description: t('whitelist.msg_promo_vip'), variables: ['user'], group: t('whitelist.group_staff_actions'), groupIcon: Mic2 },
                            { key: 'pause_success', label: t('whitelist.msg_pause'), description: t('whitelist.msg_pause'), variables: [], group: t('whitelist.group_staff_actions'), groupIcon: Mic2 },
                            { key: 'resume_success', label: t('whitelist.msg_resume'), description: t('whitelist.msg_resume'), variables: [], group: t('whitelist.group_staff_actions'), groupIcon: Mic2 },
                            { key: 'skip_success', label: t('whitelist.msg_skip'), description: t('whitelist.msg_skip'), variables: [], group: t('whitelist.group_staff_actions'), groupIcon: Mic2 },
                            { key: 'voice_waiting', label: t('whitelist.msg_waiting'), description: t('whitelist.msg_waiting'), variables: ['user'], group: t('whitelist.group_voice'), groupIcon: Play },
                            { key: 'voice_guide', label: t('whitelist.msg_guide'), description: t('whitelist.msg_guide'), variables: ['user', 'start_time'], group: t('whitelist.group_voice'), groupIcon: Mic2 },
                            { key: 'voice_procedural_error', label: t('whitelist.msg_procedural_error'), description: t('whitelist.msg_procedural_error'), variables: [], group: t('whitelist.group_errors'), groupIcon: XCircle },
                            { key: 'cooldown', label: t('whitelist.msg_cooldown'), description: t('whitelist.msg_cooldown'), variables: ['time'], group: t('whitelist.group_errors'), groupIcon: XCircle },
                            { key: 'app_not_found', label: t('whitelist.msg_app_not_found'), description: t('whitelist.msg_app_not_found'), variables: [], group: t('whitelist.group_errors'), groupIcon: XCircle }
                        ]}
                        extraButtons={(slug) => {
                            if (slug === 'panel') {
                                return [config.buttons?.start_wl || { label: t('whitelist.msg_start'), emoji: '📝', style: 'SUCCESS' }];
                            }
                            return null;
                        }}
                    />
                </div>
            )}
        </div>
      </div>
    </div>

      <style jsx>{`
          .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-badge); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
          .header-info { display: flex; align-items: center; gap: 16px; }
          .header-icon { width: 48px; height: 48px; background: var(--primary-glow); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
          .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; color: var(--text-main); }
          .header-text p { font-size: 0.85rem; color: var(--text-muted); }
          
          .tab-navigation { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px; padding: 6px; background: var(--bg-sidebar-alt); border-radius: 14px; border: 1px solid var(--border); }
          .tab-link { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border: none; background: transparent; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; border-radius: 10px; cursor: pointer; transition: 0.2s; }
          .tab-link:hover { color: var(--text-main); background: var(--bg-badge); }
          .tab-link.active { color: var(--text-main); background: var(--bg-card); box-shadow: var(--shadow-sm); border: 1px solid var(--border); }

          .config-grid { display: grid; grid-template-columns: 1fr 300px; gap: 24px; }
          .grid-left { display: flex; flex-direction: column; gap: 24px; }
          .section-header { display: flex; justify-content: space-between; align-items: center; }
          
          .fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .field-box { display: flex; flex-direction: column; gap: 8px; }
          
          .toggle-box { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-badge); border-radius: 12px; border: 1px solid var(--border); }
          .flex-col { display: flex; flex-direction: column; }
          
          .q-badge { width: 32px; height: 32px; background: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--text-main); fontWeight: bold; flex-shrink: 0; }
          
          .align-center { display: flex; align-items: center; gap: 10px; }
          @media (max-width: 1000px) { .config-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
