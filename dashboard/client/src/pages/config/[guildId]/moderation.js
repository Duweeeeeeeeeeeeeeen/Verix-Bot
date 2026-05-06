import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import DiscordSelector from '../../../components/DiscordSelector';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, ShieldAlert, Settings2, Power, 
    Clock, Trash2, Plus, X, AlertTriangle, 
    Shield, Gavel, History, MessageSquare, 
    Type, AtSign, List, Ghost, RefreshCcw,
    Link, UserPlus, Zap, Ban, Trash, Search,
    Settings, ShieldCheck, Lock
} from 'lucide-react';
import CustomSelect from '../../../components/CustomSelect';
import EmbedMessageManager from '../../../components/EmbedMessageManager';
import { mergeConfig } from '../../../utils/defaults';
import NotificationSettings from '../../../components/NotificationSettings';

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
      const fetchData = async () => {
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
          setLoading(false);
        } catch (error) {
          console.error("Error loading moderation config:", error);
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [guildId, mounted]);

  useEffect(() => {
    if (config) {
      window.dispatchEvent(new CustomEvent('update-guide-context', { detail: config }));
    }
  }, [config]);

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/moderation`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast(t('moderation.save_success'));
    } catch (error) {
        showToast(t('moderation.save_error'), 'error');
    }
    finally { setSaving(false); }
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
    const newPunishments = [...(config.punishments || []), { level: 1, action: 'warn', duration: 0, message: '' }];
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

  const addBlacklistWord = (word) => {
    if (!word) return;
    const words = [...(config.blacklist?.words || [])];
    if (!words.includes(word)) {
        words.push(word);
        updateNested('blacklist.words', words);
    }
  };

  const removeBlacklistWord = (word) => {
    const words = (config.blacklist?.words || []).filter(w => w !== word);
    updateNested('blacklist.words', words);
  };

  if (loading || !config) return <><Skeleton height="500px" /></>;

  return (
    <div className="config-page-layout animate">
      <div className="config-main-col">
        {/* Module Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Shield size={24} />
              </div>
              <div className="header-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h1 style={{ color: 'var(--text-main)' }}>{t('moderation.title')}</h1>
                  <label className="toggle-mini" title={config.enabled ? t('moderation.active') : t('moderation.inactive')}>
                    <input type="checkbox" checked={!!config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                    <span className="slider-mini"></span>
                  </label>
                </div>
                <p>{t('moderation.desc')}</p>
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
            <button onClick={() => setActiveTab('antispam')} className={`tab-link ${activeTab === 'antispam' ? 'active' : ''}`}>
                <MessageSquare size={16} /> <span>{t('moderation.tab_antispam')}</span>
            </button>
            <button onClick={() => setActiveTab('safety')} className={`tab-link ${activeTab === 'safety' ? 'active' : ''}`}>
                <ShieldCheck size={16} /> <span>{t('moderation.tab_safety')}</span>
            </button>
            <button onClick={() => setActiveTab('antiraid')} className={`tab-link ${activeTab === 'antiraid' ? 'active' : ''}`}>
                <Lock size={16} /> <span>{t('moderation.tab_antiraid')}</span>
            </button>
            <button onClick={() => setActiveTab('filters')} className={`tab-link ${activeTab === 'filters' ? 'active' : ''}`}>
                <Type size={16} /> <span>{t('moderation.tab_filters')}</span>
            </button>
            <button onClick={() => setActiveTab('punishments')} className={`tab-link ${activeTab === 'punishments' ? 'active' : ''}`}>
                <Gavel size={16} /> <span>{t('moderation.tab_punishments')}</span>
            </button>
            <button onClick={() => setActiveTab('settings')} className={`tab-link ${activeTab === 'settings' ? 'active' : ''}`}>
                <Settings size={16} /> <span>{t('moderation.tab_settings')}</span>
            </button>
            <button onClick={() => setActiveTab('messages')} className={`tab-link ${activeTab === 'messages' ? 'active' : ''}`}>
                <RefreshCcw size={16} /> <span>{t('moderation.tab_design')}</span>
            </button>
        </div>

        <div className="contents-grid-m">
            <div className="main-col-m">
                
                {/* TAB: ANTI-SPAM */}
                {activeTab === 'antispam' && config.antispam && (
                    <div className="animate fade-in">
                        <section className="card section-card-v">
                            <div className="section-title-row">
                                <div className="align-center">
                                    <MessageSquare size={18} color="var(--primary)" />
                                    <h3>{t('moderation.antispam_title')}</h3>
                                </div>
                                <label className="toggle">
                                    <input type="checkbox" checked={!!config.antispam.enabled} onChange={e => updateNested('antispam.enabled', e.target.checked)} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="fields-grid-v" style={{ marginTop: '24px' }}>
                                <div className="field-box">
                                    <label className="text-label">{t('moderation.max_messages')}</label>
                                    <input type="number" className="input" value={config.antispam.maxMessages} onChange={e => updateNested('antispam.maxMessages', parseInt(e.target.value))} />
                                    <p className="field-help">{t('moderation.max_messages_help')}</p>
                                </div>
                                <div className="field-box">
                                    <label className="text-label">{t('moderation.interval')}</label>
                                    <input type="number" className="input" value={config.antispam.timeWindow} onChange={e => updateNested('antispam.timeWindow', parseInt(e.target.value))} />
                                    <p className="field-help">{t('moderation.interval_help')}</p>
                                </div>
                            </div>
                        </section>

                        {config.antiFlood && (
                            <section className="card section-card-v" style={{ marginTop: '24px' }}>
                                <div className="section-title-row">
                                    <div className="align-center">
                                        <Zap size={18} color="var(--primary)" />
                                        <h3>{t('moderation.antiflood_title')}</h3>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" checked={!!config.antiFlood.enabled} onChange={e => updateNested('antiFlood.enabled', e.target.checked)} />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="fields-grid-v" style={{ marginTop: '24px' }}>
                                    <div className="field-box">
                                        <label className="text-label">{t('moderation.max_lines')}</label>
                                        <input type="number" className="input" value={config.antiFlood.maxLines} onChange={e => updateNested('antiFlood.maxLines', parseInt(e.target.value))} />
                                    </div>
                                    <div className="field-box">
                                        <label className="text-label">{t('moderation.max_chars')}</label>
                                        <input type="number" className="input" value={config.antiFlood.maxCharacters} onChange={e => updateNested('antiFlood.maxCharacters', parseInt(e.target.value))} />
                                    </div>
                                    <div className="field-box">
                                        <label className="text-label">{t('moderation.max_emojis')}</label>
                                        <input type="number" className="input" value={config.antiFlood.maxEmojis} onChange={e => updateNested('antiFlood.maxEmojis', parseInt(e.target.value))} />
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                )}

                {/* TAB: SAFETY */}
                {activeTab === 'safety' && (
                    <div className="animate fade-in">
                        {/* Anti-Link */}
                        <section className="card section-card-v">
                            <div className="section-title-row">
                                <div className="align-center">
                                    <Link size={18} color="var(--primary)" />
                                    <h3>{t('moderation.antilink_title')}</h3>
                                </div>
                                <label className="toggle">
                                    <input type="checkbox" checked={!!config.antiLink?.enabled} onChange={e => updateNested('antiLink.enabled', e.target.checked)} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="fields-stack-v" style={{ marginTop: '24px' }}>
                                <div className="field-box">
                                    <label className="text-label">{t('moderation.whitelist_domains')}</label>
                                    <div className="add-word-row">
                                        <input type="text" className="input" id="new-domain" placeholder="google.com, discord.gg..." onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                const list = [...(config.antiLink?.whitelist || [])];
                                                if (!list.includes(e.target.value)) list.push(e.target.value);
                                                updateNested('antiLink.whitelist', list);
                                                e.target.value = '';
                                            }
                                        }} />
                                        <button className="btn-add-word" onClick={() => {
                                            const inp = document.getElementById('new-domain');
                                            const list = [...(config.antiLink?.whitelist || [])];
                                            if (!list.includes(inp.value)) list.push(inp.value);
                                            updateNested('antiLink.whitelist', list);
                                            inp.value = '';
                                        }}><Plus size={16} /></button>
                                    </div>
                                    <div className="words-tags-container">
                                        {(config.antiLink?.whitelist || []).map(d => (
                                            <div key={d} className="word-tag">
                                                <span>{d}</span>
                                                <button onClick={() => updateNested('antiLink.whitelist', config.antiLink.whitelist.filter(x => x !== d))}><X size={10} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="fields-grid-v" style={{ marginTop: '16px' }}>
                                    <div className="field-box">
                                        <label className="text-label">{t('moderation.allow_roles')}</label>
                                        <DiscordSelector type="role" multiple options={discordData.roles} value={config.antiLink?.allowRoles || []} onChange={v => updateNested('antiLink.allowRoles', v)} />
                                    </div>
                                    <div className="field-box">
                                        <label className="text-label">{t('moderation.allow_channels')}</label>
                                        <DiscordSelector type="channel" multiple options={discordData.channels} value={config.antiLink?.allowChannels || []} onChange={v => updateNested('antiLink.allowChannels', v)} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Anti-Invite */}
                        <section className="card section-card-v" style={{ marginTop: '24px' }}>
                            <div className="section-title-row">
                                <div className="align-center">
                                    <UserPlus size={18} color="var(--primary)" />
                                    <h3>{t('moderation.antiinvite_title')}</h3>
                                </div>
                                <label className="toggle">
                                    <input type="checkbox" checked={!!config.antiInvite?.enabled} onChange={e => updateNested('antiInvite.enabled', e.target.checked)} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="fields-grid-v" style={{ marginTop: '24px' }}>
                                <div className="field-box">
                                    <label className="text-label">{t('moderation.allow_roles')}</label>
                                    <DiscordSelector type="role" multiple options={discordData.roles} value={config.antiInvite?.allowRoles || []} onChange={v => updateNested('antiInvite.allowRoles', v)} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">{t('moderation.allow_channels')}</label>
                                    <DiscordSelector type="channel" multiple options={discordData.channels} value={config.antiInvite?.allowChannels || []} onChange={v => updateNested('antiInvite.allowChannels', v)} />
                                </div>
                            </div>
                        </section>

                        {/* Anti-Everyone */}
                        <section className="card section-card-v" style={{ marginTop: '24px' }}>
                            <div className="section-title-row">
                                <div className="align-center">
                                    <AtSign size={18} color="var(--primary)" />
                                    <h3>{t('moderation.antieveryone_title')}</h3>
                                </div>
                                <label className="toggle">
                                    <input type="checkbox" checked={!!config.antiEveryone?.enabled} onChange={e => updateNested('antiEveryone.enabled', e.target.checked)} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="field-box" style={{ marginTop: '24px' }}>
                                <label className="text-label">{t('moderation.action_label')}</label>
                                <CustomSelect 
                                    options={[
                                        { value: 'delete', label: t('moderation.action_delete') },
                                        { value: 'warn', label: t('moderation.action_warn') },
                                        { value: 'none', label: t('moderation.action_none') }
                                    ]} 
                                    value={config.antiEveryone?.action || 'delete'} 
                                    onChange={v => updateNested('antiEveryone.action', v)} 
                                />
                            </div>
                        </section>

                        {/* Ghost Ping */}
                        <section className="card section-card-v" style={{ marginTop: '24px' }}>
                            <div className="section-title-row">
                                <div className="align-center">
                                    <History size={18} color="var(--primary)" />
                                    <h3>{t('moderation.ghostping_title')}</h3>
                                </div>
                                <label className="toggle">
                                    <input type="checkbox" checked={!!config.ghostPing?.enabled} onChange={e => updateNested('ghostPing.enabled', e.target.checked)} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="field-box" style={{ marginTop: '24px' }}>
                                <div className="align-center">
                                    <input type="checkbox" checked={!!config.ghostPing?.logInChannel} onChange={e => updateNested('ghostPing.logInChannel', e.target.checked)} />
                                    <label className="text-label" style={{ marginBottom: 0 }}>{t('moderation.log_in_channel')}</label>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* TAB: ANTI-RAID */}
                {activeTab === 'antiraid' && (
                    <div className="animate fade-in">
                        <section className="card section-card-v">
                            <div className="section-title-row">
                                <div className="align-center">
                                    <Lock size={18} color="var(--primary)" />
                                    <h3>{t('moderation.antiraid_title')}</h3>
                                </div>
                                <label className="toggle">
                                    <input type="checkbox" checked={!!config.antiRaid?.enabled} onChange={e => updateNested('antiRaid.enabled', e.target.checked)} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="fields-grid-v" style={{ marginTop: '24px' }}>
                                <div className="field-box">
                                    <label className="text-label">{t('moderation.joins_threshold')}</label>
                                    <input type="number" className="input" value={config.antiRaid?.joinsThreshold} onChange={e => updateNested('antiRaid.joinsThreshold', parseInt(e.target.value))} />
                                    <p className="field-help">{t('moderation.joins_threshold_help')}</p>
                                </div>
                                <div className="field-box">
                                    <label className="text-label">{t('moderation.interval_ms')}</label>
                                    <input type="number" className="input" value={config.antiRaid?.timeWindow} onChange={e => updateNested('antiRaid.timeWindow', parseInt(e.target.value))} />
                                    <p className="field-help">{t('moderation.interval_ms_help')}</p>
                                </div>
                                <div className="field-box">
                                    <label className="text-label">{t('moderation.raid_action')}</label>
                                    <CustomSelect 
                                        options={[
                                            { value: 'notify', label: t('moderation.action_notify') },
                                            { value: 'lockdown', label: t('moderation.action_lockdown') },
                                            { value: 'quarantine', label: t('moderation.action_quarantine') }
                                        ]} 
                                        value={config.antiRaid?.action || 'notify'} 
                                        onChange={v => updateNested('antiRaid.action', v)} 
                                    />
                                </div>
                                {config.antiRaid?.action === 'quarantine' && (
                                    <div className="field-box">
                                        <label className="text-label">{t('moderation.quarantine_role')}</label>
                                        <DiscordSelector type="role" options={discordData.roles} value={config.antiRaid?.quarantineRoleId} onChange={v => updateNested('antiRaid.quarantineRoleId', v)} />
                                    </div>
                                )}
                                {config.antiRaid?.action === 'lockdown' && (
                                    <div className="field-box">
                                        <label className="text-label">{t('moderation.lockdown_channels')}</label>
                                        <DiscordSelector type="channel" multiple options={discordData.channels} value={config.antiRaid?.lockdownChannels || []} onChange={v => updateNested('antiRaid.lockdownChannels', v)} />
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}

                {/* TAB: FILTERS (Caps, Mentions, Blacklist) */}
                {activeTab === 'filters' && (
                    <div className="animate fade-in">
                        {/* Caps Lock */}
                        {config.capsLock && (
                            <section className="card section-card-v">
                                <div className="section-title-row">
                                    <div className="align-center">
                                        <Type size={18} color="var(--primary)" />
                                        <h3>{t('moderation.caps_title')}</h3>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" checked={!!config.capsLock.enabled} onChange={e => updateNested('capsLock.enabled', e.target.checked)} />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="fields-grid-v" style={{ marginTop: '24px' }}>
                                    <div className="field-box">
                                        <label className="text-label">{t('moderation.caps_percentage')}</label>
                                        <input type="number" className="input" value={config.capsLock.percentage} onChange={e => updateNested('capsLock.percentage', parseInt(e.target.value))} />
                                    </div>
                                    <div className="field-box">
                                        <label className="text-label">{t('moderation.caps_min_chars')}</label>
                                        <input type="number" className="input" value={config.capsLock.minCharacters} onChange={e => updateNested('capsLock.minCharacters', parseInt(e.target.value))} />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Mention Spam */}
                        {config.mentionSpam && (
                            <section className="card section-card-v" style={{ marginTop: '24px' }}>
                                <div className="section-title-row">
                                    <div className="align-center">
                                        <AtSign size={18} color="var(--primary)" />
                                        <h3>{t('moderation.mention_title')}</h3>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" checked={!!config.mentionSpam.enabled} onChange={e => updateNested('mentionSpam.enabled', e.target.checked)} />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="field-box" style={{ marginTop: '24px' }}>
                                    <label className="text-label">{t('moderation.mention_limit')}</label>
                                    <input type="number" className="input" value={config.mentionSpam.limit} onChange={e => updateNested('mentionSpam.limit', parseInt(e.target.value))} />
                                    <p className="field-help">{t('moderation.mention_limit_help')}</p>
                                </div>
                            </section>
                        )}

                        {/* Blacklist */}
                        {config.blacklist && (
                            <section className="card section-card-v" style={{ marginTop: '24px' }}>
                                <div className="section-title-row">
                                    <div className="align-center">
                                        <List size={18} color="var(--primary)" />
                                        <h3>{t('moderation.blacklist_title')}</h3>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" checked={!!config.blacklist.enabled} onChange={e => updateNested('blacklist.enabled', e.target.checked)} />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div style={{ marginTop: '24px' }}>
                                    <div className="add-word-row">
                                        <input type="text" className="input" id="new-word" placeholder={t('moderation.blacklist_placeholder')} onKeyDown={e => e.key === 'Enter' && (addBlacklistWord(e.target.value), e.target.value = '')} />
                                        <button className="btn-add-word" onClick={() => {
                                            const inp = document.getElementById('new-word');
                                            addBlacklistWord(inp.value);
                                            inp.value = '';
                                        }}><Plus size={16} /></button>
                                    </div>
                                    <div className="words-tags-container">
                                        {config.blacklist.words?.map(word => (
                                            <div key={word} className="word-tag">
                                                <span>{word}</span>
                                                <button className="btn-remove-premium" style={{ padding: '2px', borderRadius: '4px' }} onClick={() => removeBlacklistWord(word)}><X size={10} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                )}

                {/* TAB: PUNISHMENTS */}
                {activeTab === 'punishments' && (
                    <section className="card section-card-v animate fade-in">
                        <div className="header-with-action">
                            <div className="align-center">
                                <Gavel size={18} color="var(--warning)" />
                                <h3>{t('moderation.punishments_title')}</h3>
                            </div>
                            <button className="btn-add-small" onClick={addPunishment}>
                                <Plus size={14} /> {t('moderation.add_level')}
                            </button>
                        </div>
                        <NotificationSettings 
                            guildId={guildId}
                            value={config.notifications}
                            onChange={val => setConfig({...config, notifications: val})}
                            title={t('moderation.notif_title')}
                            description={t('moderation.notif_desc')}
                        />

                        <div className="punishments-list" style={{ marginTop: '24px' }}>
                            {(config.punishments || []).sort((a,b) => a.level - b.level).map((p, index) => (
                                <div key={index} className="punishment-item card">
                                    <div className="p-item-header">
                                        <div className="p-level-badge">{t('moderation.threshold_label', { count: p.level })}</div>
                                        <button className="btn-remove-premium" onClick={() => removePunishment(index)}><X size={14} /></button>
                                    </div>
                                    <div className="p-item-grid">
                                        <div className="field-box">
                                            <label className="text-label">{t('moderation.threshold_label', { count: '' })}</label>
                                            <input type="number" className="input" value={p.level} onChange={e => updatePunishment(index, 'level', parseInt(e.target.value))} />
                                        </div>
                                        <div className="field-box">
                                            <label className="text-label">{t('moderation.action_label')}</label>
                                            <CustomSelect 
                                                options={[
                                                    { value: 'warn', label: t('moderation.action_warn') },
                                                    { value: 'timeout', label: t('moderation.action_timeout') },
                                                    { value: 'mute', label: t('moderation.action_mute') },
                                                    { value: 'kick', label: t('moderation.action_kick') },
                                                    { value: 'ban', label: t('moderation.action_ban') }
                                                ]} 
                                                value={p.action} 
                                                onChange={val => updatePunishment(index, 'action', val)} 
                                            />
                                        </div>
                                        {(p.action === 'timeout' || p.action === 'mute') && (
                                            <div className="field-box">
                                                <label className="text-label">{t('moderation.duration_label')}</label>
                                                <input type="number" className="input" value={p.duration} onChange={e => updatePunishment(index, 'duration', parseInt(e.target.value))} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="field-box" style={{ marginTop: '12px' }}>
                                        <label className="text-label">{t('common.message')}</label>
                                        <input className="input" value={p.message || ''} onChange={e => updatePunishment(index, 'message', e.target.value)} placeholder={t('moderation.message_placeholder')} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* TAB: SETTINGS */}
                {activeTab === 'settings' && (
                    <div className="animate fade-in">
                        <section className="card section-card-v">
                            <div className="align-center" style={{ marginBottom: '24px' }}>
                                <Ghost size={18} color="var(--primary)" />
                                <h3>{t('moderation.ignored_title')}</h3>
                            </div>
                            <div className="fields-stack-v">
                                <div className="field-box">
                                    <label className="text-label">{t('moderation.ignored_roles')}</label>
                                    <DiscordSelector type="role" multiple options={discordData.roles} value={config.ignoredRoles || []} onChange={v => setConfig({...config, ignoredRoles: v})} />
                                    <p className="field-help">{t('moderation.ignored_roles_help')}</p>
                                </div>
                                <div className="field-box" style={{ marginTop: '24px' }}>
                                    <label className="text-label">{t('moderation.ignored_channels')}</label>
                                    <DiscordSelector type="channel" multiple options={discordData.channels} value={config.ignoredChannels || []} onChange={v => setConfig({...config, ignoredChannels: v})} />
                                    <p className="field-help">{t('moderation.ignored_channels_help')}</p>
                                </div>
                            </div>
                        </section>

                        <section className="card section-card-v" style={{ marginTop: '24px' }}>
                            <div className="align-center" style={{ marginBottom: '16px' }}>
                                <Settings2 size={16} color="var(--primary)" />
                                <h3>{t('moderation.global_config')}</h3>
                            </div>
                            <div className="field-box">
                                <label className="text-label">{t('moderation.reset_time')}</label>
                                <input type="number" className="input" value={config.resetTime || 0} onChange={e => setConfig({...config, resetTime: parseInt(e.target.value)})} />
                                <p className="field-help">{t('moderation.reset_time_help')}</p>
                            </div>
                        </section>
                    </div>
                )}

                {/* TAB: MESSAGES */}
                {activeTab === 'messages' && (
                    <div className="animate fade-in">
                        <EmbedMessageManager 
                            guildId={guildId}
                            module="moderation"                             slugs={[
                                { key: 'warn', label: t('moderation.msg_warn'), description: t('moderation.notif_desc'), variables: ['user', 'reason', 'moderator'], group: t('moderation.group_actions'), groupIcon: ShieldAlert },
                                { key: 'timeout', label: t('moderation.msg_timeout'), description: t('moderation.notif_desc'), variables: ['user', 'duration', 'reason', 'moderator'], group: t('moderation.group_actions'), groupIcon: Clock },
                                { key: 'kick', label: t('moderation.msg_kick'), description: t('moderation.notif_desc'), variables: ['user', 'reason', 'moderator'], group: t('moderation.group_actions'), groupIcon: AlertTriangle },
                                { key: 'ban', label: t('moderation.msg_ban'), description: t('moderation.notif_desc'), variables: ['user', 'reason', 'moderator'], group: t('moderation.group_actions'), groupIcon: Gavel },
                                { key: 'command_ban', label: t('moderation.msg_command_ban'), description: t('moderation.notif_desc'), variables: ['user', 'target', 'reason'], group: t('moderation.group_commands'), groupIcon: MessageSquare },
                                { key: 'command_kick', label: t('moderation.msg_command_kick'), description: t('moderation.notif_desc'), variables: ['user', 'target', 'reason'], group: t('moderation.group_commands'), groupIcon: MessageSquare }
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

            .status-section { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; margin-bottom: 24px; }
            .section-info { display: flex; align-items: center; gap: 16px; }
            .status-box { width: 40px; height: 40px; background: var(--bg-status-box); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); border: 1px solid var(--border); transition: 0.3s; }
            .status-box.on { color: var(--primary); background: var(--primary-glow); border-color: var(--primary); }

            .tab-navigation { display: flex; gap: 8px; margin-bottom: 32px; padding: 6px; background: var(--bg-sidebar-alt); border-radius: 14px; border: 1px solid var(--border); width: fit-content; }
            .tab-link { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border: none; background: transparent; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; border-radius: 10px; cursor: pointer; transition: 0.2s; }
            .tab-link:hover { color: var(--text-main); background: var(--bg-badge); }
            .tab-link.active { color: var(--text-main); background: var(--bg-card); box-shadow: var(--shadow-sm); border: 1px solid var(--border); }

            .section-title-row { display: flex; justify-content: space-between; align-items: center; }
            .header-with-action { display: flex; justify-content: space-between; align-items: center; }
            
            .btn-add-small { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--primary); color: var(--text-main); border: none; border-radius: 8px; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: 0.2s; }
            
            .add-word-row { display: flex; gap: 12px; }
            .btn-add-word { background: var(--primary); color: var(--text-main); border: none; border-radius: 8px; width: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
            
            .words-tags-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
            .word-tag { display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: var(--bg-badge); border-radius: 8px; border: 1px solid var(--border); font-size: 0.85rem; }
            .word-tag button { background: transparent; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; }
            .word-tag button:hover { color: var(--error); }
            .punishment-item { padding: 16px; background: var(--bg-badge); margin-bottom: 12px; border-radius: 12px; border: 1px solid var(--border); }
            .p-item-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
            .p-level-badge { padding: 4px 8px; background: var(--primary-glow); color: var(--primary); border-radius: 6px; font-size: 0.65rem; font-weight: 700; }
            .p-item-grid { display: grid; grid-template-columns: 1fr 1.5fr 1fr; gap: 12px; }
            .fields-grid-v { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .fields-stack-v { display: flex; flex-direction: column; gap: 20px; }
            .align-center { display: flex; align-items: center; gap: 10px; }
            .section-card-v { padding: 32px; border-radius: 20px; }
            .field-help { font-size: 0.75rem; color: var(--text-muted); margin-top: 6px; }
        `}</style>
      </div>
    </div>
  );
}
