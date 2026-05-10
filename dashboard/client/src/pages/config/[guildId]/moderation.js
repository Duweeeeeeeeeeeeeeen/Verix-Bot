import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import { DiscordSelector, CustomSelect, EmbedMessageManager, NotificationSettings } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, ShieldAlert, Settings2, Power, Clock, Trash2, Plus, X, AlertTriangle, Shield, Gavel, 
    History, MessageSquare, Type, AtSign, List, Ghost, RefreshCcw, Link, UserPlus, Zap, Ban, 
    Trash, Search, Settings, ShieldCheck, Lock, ChevronRight, ArrowRight, Info, AlertCircle, 
    Layout, Terminal, ShieldX, Activity, Eye, EyeOff, Globe, Layers, Palette, Users, 
    MessageCircle, Hash, Box, Filter, Sparkles, Star, MousePointer2, ShieldQuestion,
    VolumeX, UserMinus, Network, Timer, Gauge, ShieldHalf, RefreshCw
} from 'lucide-react';
import { mergeConfig } from '../../../utils/defaults';
import Head from 'next/head';

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
      fetchData();
    }
  }, [guildId, mounted]);

  const fetchData = async () => {
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
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
    } catch (error) {
      console.error("Moderation load error:", error);
    } finally {
        setLoading(false);
        window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/moderation`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast(t('mod.sync_success'));
    } catch (error) {
        showToast(t('common.error'), 'error');
    } finally { 
        setSaving(false); 
        window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
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
    const newPunishments = [...(config.punishments || []), { level: (config.punishments?.length || 0) + 1, action: 'warn', duration: 0, message: '' }];
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

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('mod.title')} | Verix Studio</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
                    <ShieldCheck size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('mod.title')}</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? t('mod.active') : t('mod.standby')}
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
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('common.sync')}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-v2" style={{ marginBottom: '32px' }}>
            {[
                { id: 'antispam', icon: <Activity size={16} />, label: t('mod.tab_traffic') },
                { id: 'safety', icon: <Globe size={16} />, label: t('mod.tab_integrity') },
                { id: 'antiraid', icon: <ShieldEllipsis size={16} />, label: t('mod.tab_raid') },
                { id: 'punishments', icon: <Gavel size={16} />, label: t('mod.tab_punishments') },
                { id: 'settings', icon: <EyeOff size={16} />, label: t('mod.tab_whitelist') },
                { id: 'messages', icon: <Palette size={16} />, label: t('mod.tab_policy') }
            ].map(tab => (
                <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
                    {tab.icon} <span>{tab.label}</span>
                </button>
            ))}
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'antispam' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon"><MessageCircle size={18} /></div>
                                <h3 style={{ margin: 0, flex: 1 }}>{t('mod.antispam_title')}</h3>
                                <label className="pc-toggle-v2">
                                    <input type="checkbox" checked={!!config.antispam?.enabled} onChange={e => updateNested('antispam.enabled', e.target.checked)} />
                                    <span className="pc-slider-v2"></span>
                                </label>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>{t('mod.max_messages')}</label>
                                        <input className="pc-input-modern-v2" type="number" value={config.antispam?.maxMessages || 5} onChange={e => updateNested('antispam.maxMessages', parseInt(e.target.value))} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('mod.time_window')}</label>
                                        <input className="pc-input-modern-v2" type="number" value={config.antispam?.timeWindow || 3} onChange={e => updateNested('antispam.timeWindow', parseInt(e.target.value))} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon"><RefreshCw size={18} /></div>
                                <h3 style={{ margin: 0, flex: 1 }}>{t('mod.antirepeat_title')}</h3>
                                <label className="pc-toggle-v2">
                                    <input type="checkbox" checked={!!config.antiRepeat?.enabled} onChange={e => updateNested('antiRepeat.enabled', e.target.checked)} />
                                    <span className="pc-slider-v2"></span>
                                </label>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>{t('mod.max_duplicates')}</label>
                                    <input className="pc-input-modern-v2" type="number" value={config.antiRepeat?.maxDuplicates || 2} onChange={e => updateNested('antiRepeat.maxDuplicates', parseInt(e.target.value))} />
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon"><Filter size={18} /></div>
                            <h3 style={{ margin: 0, flex: 1 }}>{t('mod.flood_title')}</h3>
                            <label className="pc-toggle-v2">
                                <input type="checkbox" checked={!!config.antiFlood?.enabled} onChange={e => updateNested('antiFlood.enabled', e.target.checked)} />
                                <span className="pc-slider-v2"></span>
                            </label>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                                <div className="pc-input-group-v2">
                                    <label>{t('mod.max_lines')}</label>
                                    <input className="pc-input-modern-v2" type="number" value={config.antiFlood?.maxLines || 10} onChange={e => updateNested('antiFlood.maxLines', parseInt(e.target.value))} />
                                </div>
                                <div className="pc-input-group-v2">
                                    <label>{t('mod.max_chars')}</label>
                                    <input className="pc-input-modern-v2" type="number" value={config.antiFlood?.maxCharacters || 1000} onChange={e => updateNested('antiFlood.maxCharacters', parseInt(e.target.value))} />
                                </div>
                                <div className="pc-input-group-v2">
                                    <label>{t('mod.max_emojis')}</label>
                                    <input className="pc-input-modern-v2" type="number" value={config.antiFlood?.maxEmojis || 15} onChange={e => updateNested('antiFlood.maxEmojis', parseInt(e.target.value))} />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'safety' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon"><Globe size={18} /></div>
                            <h3 style={{ margin: 0, flex: 1 }}>{t('mod.link_title')}</h3>
                            <label className="pc-toggle-v2">
                                <input type="checkbox" checked={!!config.antiLink?.enabled} onChange={e => updateNested('antiLink.enabled', e.target.checked)} />
                                <span className="pc-slider-v2"></span>
                            </label>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-group-v2">
                                <label>{t('mod.whitelist_domains')}</label>
                                <div className="pc-pill-input-v2">
                                    <input 
                                        className="pc-input-modern-v2"
                                        placeholder={t('mod.add_domain')}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && e.target.value) {
                                                const list = [...(config.antiLink?.whitelist || [])];
                                                if (!list.includes(e.target.value)) list.push(e.target.value);
                                                updateNested('antiLink.whitelist', list);
                                                e.target.value = '';
                                            }
                                        }} 
                                    />
                                </div>
                                <div className="pc-pill-cloud-v2" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                                    {(config.antiLink?.whitelist || []).map(d => (
                                        <div key={d} className="pc-tag-v2">
                                            <span>{d}</span>
                                            <X size={14} onClick={() => updateNested('antiLink.whitelist', config.antiLink.whitelist.filter(x => x !== d))} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
                                <div className="pc-input-group-v2">
                                    <label>{t('mod.auth_channels')}</label>
                                    <DiscordSelector type="channel" multiple options={discordData.channels} value={config.antiLink?.allowChannels || []} onChange={v => updateNested('antiLink.allowChannels', v)} />
                                </div>
                                <div className="pc-input-group-v2">
                                    <label>{t('mod.auth_roles')}</label>
                                    <DiscordSelector type="role" multiple options={discordData.roles} value={config.antiLink?.allowRoles || []} onChange={v => updateNested('antiLink.allowRoles', v)} />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'antiraid' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon"><ShieldEllipsis size={18} /></div>
                            <h3 style={{ margin: 0, flex: 1 }}>{t('mod.raid_title')}</h3>
                            <label className="pc-toggle-v2">
                                <input type="checkbox" checked={!!config.antiRaid?.enabled} onChange={e => updateNested('antiRaid.enabled', e.target.checked)} />
                                <span className="pc-slider-v2"></span>
                            </label>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="pc-input-group-v2">
                                    <label>{t('mod.joins_threshold')}</label>
                                    <input className="pc-input-modern-v2" type="number" value={config.antiRaid?.joinsThreshold || 10} onChange={e => updateNested('antiRaid.joinsThreshold', parseInt(e.target.value))} />
                                </div>
                                <div className="pc-input-group-v2">
                                    <label>{t('mod.defense_protocol')}</label>
                                    <CustomSelect 
                                        options={[
                                            { value: 'notify', label: 'Notify Staff' },
                                            { value: 'lockdown', label: 'Lockdown Server' },
                                            { value: 'quarantine', label: 'Quarantine New Users' }
                                        ]} 
                                        value={config.antiRaid?.action || 'notify'} 
                                        onChange={v => updateNested('antiRaid.action', v)} 
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'punishments' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon"><Gavel size={18} /></div>
                            <h3 style={{ margin: 0, flex: 1 }}>{t('mod.punish_hierarchy')}</h3>
                            <button className="pc-btn-primary" onClick={addPunishment}><Shield size={18} /> <span>{t('mod.add_step')}</span></button>
                        </div>
                        <div className="card-body-v2">
                            <div className="v-stack" style={{ gap: '16px' }}>
                                {(config.punishments || []).map((p, idx) => (
                                    <div key={idx} className="pc-sub-card-v2 animate slide-up">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)' }}>LEVEL {p.level}</span>
                                            <button onClick={() => removePunishment(idx)} className="pc-btn-icon-danger-v2"><Trash2 size={18} /></button>
                                        </div>
                                        <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div className="pc-input-group-v2">
                                                <label>{t('mod.action')}</label>
                                                <CustomSelect 
                                                    options={[
                                                        { value: 'warn', label: 'Warn' },
                                                        { value: 'timeout', label: 'Timeout' },
                                                        { value: 'kick', label: 'Kick' },
                                                        { value: 'ban', label: 'Ban' }
                                                    ]} 
                                                    value={p.action} 
                                                    onChange={v => updatePunishment(idx, 'action', v)} 
                                                />
                                            </div>
                                            {p.action === 'timeout' && (
                                                <div className="pc-input-group-v2">
                                                    <label>{t('mod.duration')}</label>
                                                    <input className="pc-input-modern-v2" type="number" value={p.duration} onChange={e => updatePunishment(idx, 'duration', parseInt(e.target.value))} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="pc-input-group-v2" style={{ marginTop: '16px' }}>
                                            <label>{t('mod.dm_notif')}</label>
                                            <textarea className="pc-input-modern-v2" style={{ minHeight: '80px' }} value={p.message || ''} onChange={e => updatePunishment(idx, 'message', e.target.value)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="v-stack animate slide-up">
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon"><EyeOff size={18} /></div>
                            <h3 style={{ margin: 0 }}>{t('mod.global_whitelists')}</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="pc-input-group-v2">
                                    <label>{t('mod.immune_roles')}</label>
                                    <DiscordSelector type="role" multiple options={discordData.roles} value={config.ignoredRoles || []} onChange={v => setConfig({...config, ignoredRoles: v})} />
                                </div>
                                <div className="pc-input-group-v2">
                                    <label>{t('mod.safe_channels')}</label>
                                    <DiscordSelector type="channel" multiple options={discordData.channels} value={config.ignoredChannels || []} onChange={v => setConfig({...config, ignoredChannels: v})} />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'messages' && (
                <div className="v-stack animate slide-up">
                    <EmbedMessageManager 
                        guildId={guildId}
                        module="moderation"
                        slugs={[
                            { key: 'warn', label: 'Warn Template', description: 'User DM for warnings.', variables: ['user', 'reason', 'warn_count'], group: 'Policy', groupIcon: ShieldAlert },
                            { key: 'timeout', label: 'Timeout Template', description: 'User DM for mutes.', variables: ['user', 'duration', 'reason'], group: 'Policy', groupIcon: VolumeX },
                            { key: 'ban', label: 'Ban Template', description: 'User DM for bans.', variables: ['user', 'reason'], group: 'Policy', groupIcon: UserMinus }
                        ]}
                    />
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1500px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; color: #fff; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
            .pc-title-row h1 { font-family: 'Inter'; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 6px; font-size: 0.6rem; font-weight: 700; padding: 4px 10px; border-radius: 100px;  width: fit-content; }
            .pc-status-tag-v2.on { background: rgba(16, 185, 129, 0.1); color: #10b981; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: #ef4444; }
            .status-dot-v2 { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }

            .pc-tabs-v2 { display: flex; gap: 6px; background: var(--bg-badge); padding: 5px; border-radius: 16px; width: fit-content; overflow-x: auto; max-width: 100%; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 10px; padding: 10px 24px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; font-size: 0.9rem; border-radius: 14px; cursor: pointer; transition: 0.2s; white-space: nowrap; }
            .pc-tabs-v2 button.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: var(--bg-badge); }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.3rem; font-weight: 700; color: var(--text-heading); }

            .pc-sub-card-v2 { background: var(--bg-badge); padding: 24px; border-radius: 20px; border: 1.5px solid var(--border); }
            .pc-btn-icon-danger-v2 { width: 36px; height: 36px; border-radius: 10px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }

            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; display: block; }
            .pc-input-modern-v2 { width: 100%; background: var(--bg-badge); border: 1.5px solid var(--border); border-radius: 14px; padding: 12px 16px; font-weight: 700; color: var(--text-heading); outline: none; transition: 0.2s; }
            .pc-input-modern-v2:focus { border-color: var(--primary); }

            .pc-tag-v2 { display: flex; align-items: center; gap: 8px; background: var(--bg-badge); padding: 6px 12px; border-radius: 10px; border: 1.5px solid var(--border); font-size: 0.9rem; font-weight: 700; color: var(--text-heading); }

            .pc-toggle-v2 { position: relative; width: 44px; height: 22px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: var(--border); transition: .4s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background: #fff; transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: var(--primary); }
            input:checked + .pc-slider-v2:before { transform: translateX(22px); }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
