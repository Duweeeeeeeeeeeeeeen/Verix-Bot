import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import { DiscordSelector, HelpTooltip } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import {
    Save, Trophy, Settings2, Users, Flame, RotateCcw, Plus, Trash2,
    Shield, Star, Crown
} from 'lucide-react';
import Head from 'next/head';

export default function LevelingConfigPage() {
  const router = useRouter();
  const { t } = useT();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = async () => {
    if (!guildId || guildId === 'undefined' || !mounted) return;
    setLoading(true);
    try {
      const [configRes, discordRes] = await Promise.all([
        api.request(`/config/${guildId}/leveling`).catch(() => ({ data: { enabled: false, roleRewards: [] } })),
        api.request(`/config/${guildId}/discord-data`).catch(() => ({ roles: [], channels: [] }))
      ]);

      setConfig(configRes.data || { enabled: false, roleRewards: [] });
      setDiscordData({
        roles: discordRes.data?.roles || [],
        channels: discordRes.data?.channels || []
      });
    } catch (error) {
      console.error("Leveling config load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [guildId, mounted]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/leveling`, { method: 'POST', body: JSON.stringify(config) });
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.save_success'), type: 'success' } }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.save_error'), type: 'error' } }));
    } finally {
      setSaving(false);
    }
  };

  const addReward = () => {
    setConfig({
        ...config,
        roleRewards: [...(config.roleRewards || []), { level: 1, roleId: '' }]
    });
  };

  const removeReward = (index) => {
    const newRewards = [...config.roleRewards];
    newRewards.splice(index, 1);
    setConfig({ ...config, roleRewards: newRewards });
  };

  const updateReward = (index, field, value) => {
    const newRewards = [...config.roleRewards];
    newRewards[index][field] = field === 'level' ? parseInt(value) || 0 : value;
    setConfig({ ...config, roleRewards: newRewards });
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('leveling.title')} | Verix Dashboard</title>
        </Head>

        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                    <Trophy size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('leveling.title')}</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? t('common.active_system') : t('common.inactive_system')}
                    </div>
                </div>
            </div>

            <div className="header-controls">
                <div className="pc-toggle-container-v2">
                    <label className="pc-toggle-v2">
                        <input
                            type="checkbox"
                            checked={config.enabled}
                            onChange={() => setConfig({...config, enabled: !config.enabled})}
                        />
                        <span className="pc-slider-v2"></span>
                    </label>
                    <span className={config.enabled ? 'text-active' : 'text-inactive'}>
                        {config.enabled ? t('common.active') : t('common.inactive')}
                    </span>
                </div>
                <div className="pc-header-divider"></div>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('common.save_changes')}</span>
                </button>
            </div>
        </header>

        <nav className="pc-tabs-v2" style={{ marginBottom: '32px' }}>
            <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                <Settings2 size={16} /> <span>{t('leveling.tab_settings')}</span>
            </button>
            <button className={activeTab === 'rewards' ? 'active' : ''} onClick={() => setActiveTab('rewards')}>
                <Star size={16} /> <span>{t('leveling.role_rewards')}</span>
            </button>
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'settings' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 360px)', gap: '32px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2">
                                <div className="header-icon"><Flame size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('leveling.xp_config')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>{t('leveling.xp_rate')}</label>
                                        <input
                                            type="number"
                                            className="pc-input-modern-v2"
                                            value={config.xpRate}
                                            onChange={e => setConfig({...config, xpRate: parseFloat(e.target.value) || 1})}
                                            min="0.1"
                                            step="0.1"
                                        />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('leveling.cooldown')}</label>
                                        <input
                                            type="number"
                                            className="pc-input-modern-v2"
                                            value={config.cooldown}
                                            onChange={e => setConfig({...config, cooldown: parseInt(e.target.value) || 60})}
                                            min="10"
                                        />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('leveling.daily_xp_cap')}</label>
                                        <input
                                            type="number"
                                            className="pc-input-modern-v2"
                                            value={config.dailyXpCap || 0}
                                            onChange={e => setConfig({...config, dailyXpCap: parseInt(e.target.value) || 0})}
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="pc-toggle-card-v2" style={{ marginTop: '24px' }}>
                                    <div className="v-stack">
                                        <strong>{t('leveling.double_xp')}</strong>
                                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>{t('leveling.double_xp_desc')}</span>
                                    </div>
                                    <label className="pc-toggle-v2 mini">
                                        <input
                                            type="checkbox"
                                            checked={(config.xpMultiplier || 1) > 1}
                                            onChange={e => setConfig({...config, xpMultiplier: e.target.checked ? 2 : 1})}
                                        />
                                        <span className="pc-slider-v2"></span>
                                    </label>
                                </div>

                                <div className="pc-toggle-card-v2" style={{ marginTop: '24px' }}>
                                    <div className="v-stack">
                                        <strong>{t('leveling.double_xp_scheduled')}</strong>
                                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>{t('leveling.double_xp_scheduled_desc')}</span>
                                    </div>
                                    <label className="pc-toggle-v2 mini">
                                        <input
                                            type="checkbox"
                                            checked={config.doubleXpScheduled || false}
                                            onChange={e => setConfig({...config, doubleXpScheduled: e.target.checked})}
                                        />
                                        <span className="pc-slider-v2"></span>
                                    </label>
                                </div>

                                {config.doubleXpScheduled && (
                                    <div className="scheduler-section animate slide-up" style={{ marginTop: '20px', padding: '20px', background: 'rgba(0, 0, 0, 0.1)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('leveling.select_weekdays')}</label>
                                        <div className="days-selector" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                            {t('leveling.days_short', { defaultValue: 'Dom,Lun,Mar,Mer,Gio,Ven,Sab' }).split(',').map((dayName, idx) => {
                                                const isActive = (config.doubleXpDays || []).includes(idx);
                                                return (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => {
                                                            const currentDays = config.doubleXpDays || [];
                                                            const nextDays = isActive
                                                                ? currentDays.filter(d => d !== idx)
                                                                : [...currentDays, idx];
                                                            setConfig({ ...config, doubleXpDays: nextDays });
                                                        }}
                                                        style={{
                                                            padding: '8px 12px',
                                                            borderRadius: '8px',
                                                            border: '1px solid',
                                                            borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                                                            background: isActive ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                                            color: isActive ? 'var(--primary)' : 'inherit',
                                                            cursor: 'pointer',
                                                            fontWeight: '600',
                                                            transition: '0.2s'
                                                        }}
                                                    >
                                                        {dayName}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div className="pc-input-group-v2">
                                                <label>{t('leveling.start_hour')}</label>
                                                <input
                                                    type="text"
                                                    className="pc-input-modern-v2"
                                                    value={config.doubleXpStartHour || '00:00'}
                                                    onChange={e => setConfig({...config, doubleXpStartHour: e.target.value})}
                                                    placeholder="00:00"
                                                />
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>{t('leveling.end_hour')}</label>
                                                <input
                                                    type="text"
                                                    className="pc-input-modern-v2"
                                                    value={config.doubleXpEndHour || '23:59'}
                                                    onChange={e => setConfig({...config, doubleXpEndHour: e.target.value})}
                                                    placeholder="23:59"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="card-header-v2">
                                <div className="header-icon"><Users size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('leveling.notifications')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-toggle-card-v2">
                                    <strong>{t('leveling.notify_level_up')}</strong>
                                    <label className="pc-toggle-v2 mini">
                                        <input
                                            type="checkbox"
                                            checked={config.notifyLevelUp}
                                            onChange={e => setConfig({...config, notifyLevelUp: e.target.checked})}
                                        />
                                        <span className="pc-slider-v2"></span>
                                    </label>
                                </div>
                                {config.notifyLevelUp && (
                                    <>
                                        <div className="pc-input-group-v2 animate slide-up" style={{ marginTop: '24px' }}>
                                            <label>{t('leveling.notify_style')}</label>
                                            <div className="style-selector-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                                                {[
                                                    { value: 'channel', label: t('leveling.style_channel'), desc: t('leveling.style_channel_desc') },
                                                    { value: 'dm', label: t('leveling.style_dm'), desc: t('leveling.style_dm_desc') },
                                                    { value: 'ephemeral', label: t('leveling.style_ephemeral'), desc: t('leveling.style_ephemeral_desc') },
                                                    { value: 'silent', label: t('leveling.style_silent'), desc: t('leveling.style_silent_desc') }
                                                ].map((styleOption) => {
                                                    const isSelected = (config.levelUpNotificationType || 'channel') === styleOption.value;
                                                    return (
                                                        <div
                                                            key={styleOption.value}
                                                            onClick={() => setConfig({ ...config, levelUpNotificationType: styleOption.value })}
                                                            style={{
                                                                padding: '16px',
                                                                borderRadius: '12px',
                                                                border: '1px solid',
                                                                borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                                                                background: isSelected ? 'rgba(245, 158, 11, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                                                                cursor: 'pointer',
                                                                transition: '0.2s'
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                                <div style={{
                                                                    width: '18px', height: '18px', borderRadius: '50%',
                                                                    border: '2px solid',
                                                                    borderColor: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.3)',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    position: 'relative'
                                                                }}>
                                                                    {isSelected && (
                                                                        <div style={{
                                                                            width: '10px', height: '10px', borderRadius: '50%',
                                                                            background: 'var(--primary)'
                                                                        }}></div>
                                                                    )}
                                                                </div>
                                                                <strong style={{ fontSize: '0.9rem', color: isSelected ? 'var(--primary)' : 'inherit' }}>{styleOption.label}</strong>
                                                            </div>
                                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{styleOption.desc}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {(config.levelUpNotificationType || 'channel') === 'channel' && (
                                            <div className="pc-input-group-v2 animate slide-up" style={{ marginTop: '24px' }}>
                                                <label>{t('leveling.notify_channel')}</label>
                                                <DiscordSelector
                                                    type="channel"
                                                    options={discordData.channels.filter(c => c.type === 0)}
                                                    value={config.notifyChannelId}
                                                    onChange={v => setConfig({...config, notifyChannelId: v})}
                                                    placeholder={t('common.current_channel')}
                                                />
                                            </div>
                                        )}

                                        {(config.levelUpNotificationType || 'channel') !== 'silent' && (
                                            <div className="pc-input-group-v2 animate slide-up" style={{ marginTop: '24px' }}>
                                                <label>{t('leveling.custom_message')}</label>
                                                <textarea
                                                    className="pc-input-modern-v2"
                                                    style={{ minHeight: '80px', width: '100%', padding: '12px', background: 'rgba(0, 0, 0, 0.15)', color: 'inherit', border: '1px solid var(--border)', borderRadius: '8px' }}
                                                    value={config.notifyTextTemplate || ''}
                                                    onChange={e => setConfig({...config, notifyTextTemplate: e.target.value})}
                                                    placeholder={t('leveling.message_placeholder')}
                                                />
                                                <span className="text-muted" style={{ fontSize: '0.8rem', marginTop: '6px', display: 'block' }}>{t('leveling.custom_message_desc')}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </section>

                        <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.15s' }}>
                            <div className="card-header-v2">
                                <div className="header-icon"><Settings2 size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('leveling.voice_config')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>{t('leveling.voice_rate')}</label>
                                        <input
                                            type="number"
                                            className="pc-input-modern-v2"
                                            value={config.voiceXpRate !== undefined ? config.voiceXpRate : 10}
                                            onChange={e => setConfig({...config, voiceXpRate: parseInt(e.target.value) || 0})}
                                            min="0"
                                        />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('leveling.voice_interval')}</label>
                                        <input
                                            type="number"
                                            className="pc-input-modern-v2"
                                            value={config.voiceXpInterval !== undefined ? config.voiceXpInterval : 5}
                                            onChange={e => setConfig({...config, voiceXpInterval: parseInt(e.target.value) || 1})}
                                            min="1"
                                        />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('leveling.voice_min_users')}</label>
                                        <input
                                            type="number"
                                            className="pc-input-modern-v2"
                                            value={config.voiceMinUsers !== undefined ? config.voiceMinUsers : 2}
                                            onChange={e => setConfig({...config, voiceMinUsers: parseInt(e.target.value) || 1})}
                                            min="1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Sidebar Column */}
                    <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                        {/* Premium System Preview Card */}
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><Star size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('leveling.system_preview')}</h3>
                            </div>
                            <div className="card-body-v2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('leveling.module_status')}</span>
                                        <span style={{ 
                                            fontSize: '0.75rem', fontWeight: '800', padding: '4px 10px', borderRadius: '100px',
                                            background: config.enabled ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-badge)',
                                            color: config.enabled ? '#10b981' : 'var(--text-muted)'
                                        }}>
                                            {config.enabled ? 'ATTIVO' : 'DISATTIVATO'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('leveling.xp_per_message')}</span>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-heading)' }}>~{Math.round(15 * (config.xpRate || 1))} XP</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('leveling.active_multiplier')}</span>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#f59e0b' }}>x{config.xpMultiplier || 1}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('leveling.role_rewards')}</span>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-heading)' }}>{(config.roleRewards || []).length} {t('leveling.roles_count')}</span>
                                    </div>
                                </div>
                                
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '10px' }}>
                                    <Trophy size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
                                    <span><strong>{t('leveling.tip')}:</strong> {t('leveling.role_hierarchy_tip')}</span>
                                </div>
                            </div>
                        </section>

                        {/* Other Rewards */}
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon"><Trophy size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('leveling.other_rewards')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="v-stack" style={{ gap: '20px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>{t('leveling.giveaway_reward')}</label>
                                        <input
                                            type="number"
                                            className="pc-input-modern-v2"
                                            value={config.giveawayEntryXp !== undefined ? config.giveawayEntryXp : 15}
                                            onChange={e => setConfig({...config, giveawayEntryXp: parseInt(e.target.value) || 0})}
                                            min="0"
                                        />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('leveling.photo_contest_reward')}</label>
                                        <input
                                            type="number"
                                            className="pc-input-modern-v2"
                                            value={config.photoContestEntryXp !== undefined ? config.photoContestEntryXp : 25}
                                            onChange={e => setConfig({...config, photoContestEntryXp: parseInt(e.target.value) || 0})}
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Filters & Restrictions */}
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><Shield size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('leveling.filters_title')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="v-stack" style={{ gap: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>{t('leveling.ignored_channels')}</label>
                                        <DiscordSelector
                                            type="channel"
                                            options={discordData.channels.filter(c => c.type === 0)}
                                            value={config.ignoredChannels}
                                            onChange={v => setConfig({...config, ignoredChannels: v})}
                                            multi={true}
                                        />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('leveling.ignored_roles')}</label>
                                        <DiscordSelector
                                            type="role"
                                            options={discordData.roles}
                                            value={config.ignoredRoles}
                                            onChange={v => setConfig({...config, ignoredRoles: v})}
                                            multi={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            )}

            {activeTab === 'rewards' && (
                <div className="v-stack animate slide-up">
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon"><Crown size={18} /></div>
                            <h3 style={{ margin: 0 }}>{t('leveling.role_rewards')}</h3>
                            <button className="pc-btn-outline-v2 mini" onClick={addReward} style={{ marginLeft: 'auto' }}>
                                <Plus size={16} />
                                <span>{t('leveling.add_reward')}</span>
                            </button>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-rewards-list">
                                {(config.roleRewards || []).map((reward, index) => (
                                    <div key={index} className="pc-reward-item fade-in">
                                        <div className="reward-badge">#{index + 1}</div>
                                        <div className="reward-inputs">
                                            <div className="pc-input-group-v2">
                                                <label>{t('leveling.level_label')}</label>
                                                <input
                                                    type="number"
                                                    value={reward.level}
                                                    onChange={e => updateReward(index, 'level', e.target.value)}
                                                    min="1"
                                                />
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>{t('leveling.role_label')}</label>
                                                <DiscordSelector
                                                    type="role"
                                                    options={discordData.roles}
                                                    value={reward.roleId}
                                                    onChange={v => updateReward(index, 'roleId', v)}
                                                />
                                            </div>
                                        </div>
                                        <button className="pc-btn-delete-v2" onClick={() => removeReward(index)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                {(!config.roleRewards || config.roleRewards.length === 0) && (
                                    <div className="pc-empty-state-v2">
                                        <Star size={48} />
                                        <p>{t('leveling.no_rewards')}</p>
                                        <button className="pc-btn-primary" onClick={addReward}>{t('leveling.add_reward')}</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1650px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            @media (max-width: 1200px) {
                .pc-layout-grid-v2 { grid-template-columns: 1fr !important; gap: 24px !important; }
            }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }

            .pc-rewards-list { display: flex; flex-direction: column; gap: 16px; }
            .pc-reward-item {
                display: flex; align-items: center; gap: 20px;
                background: var(--bg-card-dark); border: 1px solid var(--border);
                padding: 20px; border-radius: 16px; transition: 0.2s;
            }
            .pc-reward-item:hover { border-color: var(--primary); transform: translateX(5px); }
            .reward-badge {
                width: 40px; height: 40px; border-radius: 12px;
                background: var(--bg-badge); color: var(--primary);
                display: flex; align-items: center; justify-content: center;
                font-weight: 800; font-size: 0.9rem;
            }
            .reward-inputs { display: grid; grid-template-columns: 120px 1fr; gap: 24px; flex: 1; }

            .pc-btn-delete-v2 {
                width: 44px; height: 44px; border-radius: 12px;
                background: rgba(239, 68, 68, 0.1); color: #ef4444;
                border: none; cursor: pointer; transition: 0.2s;
                display: flex; align-items: center; justify-content: center;
            }
            .pc-btn-delete-v2:hover { background: #ef4444; color: #fff; }

            .pc-empty-state-v2 {
                padding: 60px; text-align: center; color: var(--text-muted);
                background: var(--bg-badge); border-radius: 20px; border: 2px dashed var(--border);
                display: flex; flex-direction: column; align-items: center; gap: 16px;
            }

            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
