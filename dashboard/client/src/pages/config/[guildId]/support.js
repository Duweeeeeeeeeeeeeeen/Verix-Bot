import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import DiscordSelector from '../../../components/DiscordSelector';
import api from '../../../utils/api';
import { 
  Save, 
  Settings2, 
  Users, 
  Palette, 
  Power, 
  Clock, 
  ShieldCheck, 
  BellRing,
  Mic2,
  Volume2,
  Hash,
  RefreshCcw,
  Layout,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import CustomSelect from '../../../components/CustomSelect';
import NotificationSettings from '../../../components/NotificationSettings';
import EmbedMessageManager from '../../../components/EmbedMessageManager';
import { MessageSquare as MsgIcon, LogOut, Terminal } from 'lucide-react';
import { useT } from '../../../contexts/LanguageContext';
import Head from 'next/head';

export default function SupportConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [activeTab, setActiveTab] = useState('settings');
  const [config, setConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
      Promise.all([
        api.request(`/config/${guildId}/support`),
        api.request(`/config/${guildId}/discord-data`)
      ]).then(([suppData, discordRes]) => {
        setConfig(suppData.data || suppData);
        setChannels(discordRes?.data?.channels || discordRes?.channels || []);
        setRoles(discordRes?.data?.roles || discordRes?.roles || []);
        setLoading(false);
      }).catch(err => {
        console.error("Error loading support data:", err);
        setLoading(false);
      });
    }
  }, [guildId, mounted]);

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
      await api.request(`/config/${guildId}/support`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast(t('common.save_success'));
    } catch (error) {
       showToast(t('common.save_error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || loading || !config) return <Skeleton type="config" />;

  const tabs = [
    { id: 'settings', name: t('support.tab_settings'), icon: Settings2 },
    { id: 'messages', name: t('support.tab_messages'), icon: MessageSquare },
  ];

  return (
    <div className="config-page-layout">
      <div className="config-main-col">
        <div className="animate">
        
        <Head>
            <title>{t('support.title')} | Verix</title>
        </Head>
        {/* Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Mic2 size={24} />
              </div>
              <div className="header-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h1>{t('support.title')}</h1>
                  <label className="toggle-mini" title={config.enabled ? t('common.enabled') : t('common.disabled')}>
                    <input type="checkbox" checked={!!config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                    <span className="slider-mini"></span>
                  </label>
                </div>
                <p>{t('support.desc')}</p>
              </div>
           </div>
           <div className="header-buttons">
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
                                    <Settings2 size={18} color="var(--primary)" />
                                    <h3>{t('support.config_title')}</h3>
                                </div>
                                <label className="toggle">
                                    <input type="checkbox" checked={!config.voiceSettings?.paused} onChange={e => setNested('voiceSettings.paused', !e.target.checked)} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            
                            <div className="fields-grid" style={{ marginTop: '24px' }}>
                                <div className="field-box">
                                    <label className="text-label">{t('support.join_label')}</label>
                                    <DiscordSelector type="channel" options={channels.filter(c => c.type === 2)} value={config.voiceSettings?.joinChannelId || ''} onChange={val => setNested('voiceSettings.joinChannelId', val)} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">{t('support.category_label')}</label>
                                    <DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.voiceSettings?.categoryId || ''} onChange={val => setNested('voiceSettings.categoryId', val)} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">{t('support.log_label')}</label>
                                    <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.logChannelId || ''} onChange={val => setConfig({...config, logChannelId: val})} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">{t('support.max_concurrent')}</label>
                                    <input type="number" className="input" min="1" max="10" value={config.voiceSettings?.maxConcurrent || 1} onChange={e => setNested('voiceSettings.maxConcurrent', parseInt(e.target.value))} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">{t('support.vip_role')}</label>
                                    <DiscordSelector type="role" options={roles} value={config.voiceSettings?.vipRoleId || ''} onChange={val => setNested('voiceSettings.vipRoleId', val)} />
                                </div>
                                <div className="field-box" style={{ gridColumn: 'span 2' }}>
                                    <label className="text-label flex-between">
                                        {t('support.template_label')}
                                        <HelpTooltip text={t('support.template_help')} />
                                    </label>
                                    <input 
                                        type="text" 
                                        className="input" 
                                        placeholder={t('support.template_placeholder')} 
                                        value={config.voiceSettings?.channelNameTemplate || ''} 
                                        onChange={e => setNested('voiceSettings.channelNameTemplate', e.target.value)} 
                                    />
                                </div>
                            </div>

                        </section>
                    </div>

                    <div className="grid-right">
                        <section className="card section-card">
                            <h3 className="sidebar-title align-center" style={{ marginBottom: '16px' }}><Users size={18} /> {t('support.assistants_title')}</h3>
                            <DiscordSelector type="role" multiple={true} options={roles} value={config.staffRoleIds || []} onChange={val => setConfig({...config, staffRoleIds: val})} />
                            <p className="text-description" style={{ marginTop: '12px' }}>{t('support.assistants_help')}</p>
                        </section>

                        <section className="card section-card" style={{ marginTop: '24px' }}>
                            <div className="align-center" style={{ marginBottom: '12px' }}>
                                <Hash size={18} />
                                <h3>{t('support.stats_title')}</h3>
                            </div>
                            <div className="stat-row">
                                <span>{t('support.total_sessions')}</span>
                                <strong>{config.voiceSettings?.sessionCounter || 0}</strong>
                            </div>
                            <button 
                                className="btn-outline-sm w-full" 
                                style={{ marginTop: '12px' }}
                                onClick={() => setNested('voiceSettings.sessionCounter', 0)}
                            >
                                <RefreshCcw size={14} /> {t('support.reset_counter')}
                            </button>
                        </section>

                        {/* Extra Settings */}
                        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="toggle-box-compact">
                                <div className="flex-col">
                                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t('support.auto_delete')}</span>
                                    <p className="text-dim" style={{ fontSize: '0.7rem' }}>{t('support.auto_delete_help')}</p>
                                </div>
                                <label className="toggle-mini">
                                    <input type="checkbox" checked={!!config.voiceSettings?.autoDelete} onChange={e => setNested('voiceSettings.autoDelete', e.target.checked)} />
                                    <span className="slider-mini"></span>
                                </label>
                            </div>

                            <div className="toggle-box-compact">
                                <div className="flex-col">
                                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t('support.ping_staff')}</span>
                                    <p className="text-dim" style={{ fontSize: '0.7rem' }}>{t('support.ping_staff_help')}</p>
                                </div>
                                <label className="toggle-mini">
                                    <input type="checkbox" checked={!!config.voiceSettings?.pingStaffOnJoin} onChange={e => setNested('voiceSettings.pingStaffOnJoin', e.target.checked)} />
                                    <span className="slider-mini"></span>
                                </label>
                            </div>

                            <div className="card-mini-notifications">
                                <NotificationSettings 
                                    guildId={guildId}
                                    value={config.voiceSettings?.notifications}
                                    onChange={val => setNested('voiceSettings.notifications', val)}
                                    title={t('support.user_notifications')}
                                    description={t('support.user_notifications_help')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* TAB: Messages */}
            {activeTab === 'messages' && (
                <div className="animate fade-in">
                    <EmbedMessageManager 
                        guildId={guildId}
                        module="support"
                        slugs={[
                            { 
                              key: 'paused', 
                              label: t('support.msg_paused'), 
                              description: t('support.msg_paused_desc'),
                              group: t('support.group_status'),
                              groupIcon: Power,
                              variables: ['user', 'guild']
                            },
                            { 
                              key: 'cooldown', 
                              label: t('support.msg_cooldown'), 
                              description: t('support.msg_cooldown_desc'),
                              group: t('support.group_status'),
                              groupIcon: Clock,
                              variables: ['user', 'guild']
                            },
                            { 
                              key: 'queueFull', 
                              label: t('support.msg_queue_full'), 
                              description: t('support.msg_queue_full_desc'),
                              group: t('support.group_queue'),
                              groupIcon: Users,
                              variables: ['user', 'guild', 'position']
                            },
                            { 
                              key: 'sessionStart', 
                              label: t('support.msg_session_start'), 
                              description: t('support.msg_session_start_desc'),
                              group: t('support.group_session'),
                              groupIcon: MsgIcon,
                              variables: ['user', 'guild', 'channel']
                            },
                            { 
                              key: 'staffLog', 
                              label: t('support.msg_staff_log_start'), 
                              description: t('support.msg_staff_log_start_desc'),
                              group: t('support.group_monitoring'),
                              groupIcon: ShieldCheck,
                              variables: ['user', 'voice_channel']
                            },
                            { 
                              key: 'queue_log', 
                              label: t('support.msg_queue_log'), 
                              description: t('support.msg_queue_log_desc'),
                              group: t('support.group_monitoring'),
                              groupIcon: Terminal,
                              variables: ['user', 'user_id', 'position', 'vip_text']
                            }
                        ]}
                    />
                </div>
            )}

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
          .toggle-box-compact { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-badge); border-radius: 10px; border: 1px solid var(--border); }
          .card-mini-notifications { background: var(--bg-badge); border-radius: 10px; border: 1px solid var(--border); padding: 4px; }
          .card-mini-notifications :global(.notification-settings-card) { background: transparent !important; border: none !important; padding: 8px !important; }
          .flex-col { display: flex; flex-direction: column; }
          
          .stat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
          .stat-row:last-of-type { border-bottom: none; }
          
          .align-center { display: flex; align-items: center; gap: 10px; }
          @media (max-width: 1000px) { .config-grid { grid-template-columns: 1fr; } }
      `}</style>
      </div>
    </div>
  );
}
