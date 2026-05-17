import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import api from '../../../utils/api';
import { 
    Save, Mic2, Users, MousePointer2, Shield, ListFilter, Info, CheckCircle, 
    XCircle, MessageSquare, Settings2, Palette, Zap, Power, Globe, Clock, Layout, Terminal,
    RotateCcw, ChevronRight, Hash, Sparkles, Box, Fingerprint, Activity, Volume2, BellRing, Layers, ShieldCheck
} from 'lucide-react';
import { DiscordSelector, SystemMessagesSection, EmbedMessageManager, EmbedEditor, NotificationSettings } from '../../../components/LazyConfigComponents';
import { mergeConfig } from '../../../utils/defaults';
import CustomSelect from '../../../components/CustomSelect';
import { useT } from '../../../contexts/LanguageContext';
import Head from 'next/head';

export default function VoiceHubPage() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Hub State
  const [activeModule, setActiveModule] = useState('provini'); 
  const [activeTab, setActiveTab] = useState('settings');
  
  // Data State
  const [voiceConfig, setVoiceConfig] = useState(null); 
  const [tempVoiceConfig, setTempVoiceConfig] = useState(null); 
  const [supportConfig, setSupportConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ channels: [], roles: [] });
  
  // Editor State
  const [activeEmbedKey, setActiveEmbedKey] = useState('voice_waiting');

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    if (!guildId || !mounted) return;
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
        const [wlRes, tvRes, suppRes, discordRes] = await Promise.all([
            api.request(`/config/${guildId}/whitelist`).catch(() => ({ data: {} })),
            api.request(`/config/${guildId}/tempvoice`).catch(() => ({ data: {} })),
            api.request(`/config/${guildId}/support`).catch(() => ({ data: {} })),
            api.request(`/config/${guildId}/discord-data`).catch(() => ({ roles: [], channels: [] }))
        ]);

        // Whitelist/Provini processing
        const wlData = wlRes?.data || wlRes || {};
        const vEmbeds = {};
        ['voice_waiting', 'voice_guide', 'voice_staff_log', 'voice_error_flow'].forEach(k => {
            if (wlData.embeds?.[k]) vEmbeds[k] = wlData.embeds[k];
        });
        const vConfig = { ...(wlData.voiceSettings || {}), embeds: vEmbeds };
        setVoiceConfig(mergeConfig(vConfig, 'voice'));
        
        // TempVoice processing
        setTempVoiceConfig(tvRes?.data || tvRes || {});
        
        // Support SOS processing
        setSupportConfig(suppRes?.data || suppRes || {});

        setDiscordData({
            channels: discordRes?.data?.channels || discordRes?.channels || [],
            roles: discordRes?.data?.roles || discordRes?.roles || []
        });
    } catch (err) {
        console.error('Failed to fetch voice hub data:', err);
    } finally {
        setLoading(false);
        window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [guildId, mounted]);

  const handleSave = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
        if (activeModule === 'provini') {
            await api.request(`/config/${guildId}/whitelist`, {
                method: 'POST',
                body: JSON.stringify({ 
                    voiceSettings: { ...voiceConfig, embeds: undefined },
                    embeds: { ...(voiceConfig.embeds || {}) }
                })
            });
        } else if (activeModule === 'tempvoice') {
            await api.request(`/config/${guildId}/tempvoice`, {
                method: 'POST',
                body: JSON.stringify(tempVoiceConfig)
            });
        } else if (activeModule === 'support') {
            await api.request(`/config/${guildId}/support`, {
                method: 'POST',
                body: JSON.stringify(supportConfig)
            });
        }
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.save_success'), type: 'success' } }));
    } catch (err) {
        console.error('Save failed:', err);
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.save_error'), type: 'error' } }));
    } finally {
        setSaving(false);
        window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const setNested = (module, path, value) => {
    const setters = {
        provini: setVoiceConfig,
        tempvoice: setTempVoiceConfig,
        support: setSupportConfig
    };
    
    setters[module](prev => {
        const next = { ...prev };
        const parts = path.split('.');
        let cur = next;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!cur[parts[i]]) cur[parts[i]] = {};
            else cur[parts[i]] = { ...cur[parts[i]] };
            cur = cur[parts[i]];
        }
        cur[parts[parts.length - 1]] = value;
        return next;
    });
  };

  if (!mounted || loading || !voiceConfig || !tempVoiceConfig || !supportConfig) return <Skeleton height="600px" />;

  const currentModuleConfig = activeModule === 'provini' ? voiceConfig : (activeModule === 'tempvoice' ? tempVoiceConfig : supportConfig);

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('voice.title')} | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)' }}>
                    <Mic2 size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('voice.header_title')}</h1>
                    <div className={`pc-status-tag-v2 ${currentModuleConfig.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {currentModuleConfig.enabled ? t('common.active_system') : t('common.inactive_system')}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <div className="pc-toggle-container-v2">
                    <label className="pc-toggle-v2">
                        <input 
                            type="checkbox" 
                            checked={currentModuleConfig.enabled} 
                            onChange={() => setNested(activeModule, 'enabled', !currentModuleConfig.enabled)} 
                        />
                        <span className="pc-slider-v2"></span>
                    </label>
                    <span className={currentModuleConfig.enabled ? 'text-active' : 'text-inactive'}>
                        {currentModuleConfig.enabled ? t('common.active') : t('common.inactive')}
                    </span>
                </div>
                <div className="pc-header-divider"></div>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('common.sync')}</span>
                </button>
            </div>
        </header>

        {/* 3-Module Switcher Tabs */}
        <div className="pc-module-switcher animate fade-in" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <button className={activeModule === 'provini' ? 'active' : ''} onClick={() => { setActiveModule('provini'); setActiveTab('settings'); }}>
                <div className="m-icon-row">
                    <Users size={20} />
                    <div className={`status-dot-v2 ${voiceConfig.enabled ? 'on' : 'off'}`} />
                </div>
                <div className="v-stack">
                    <span className="m-title">{t('voice.m_provini_title')}</span>
                    <span className="m-desc">{t('voice.m_provini_desc')}</span>
                </div>
                {activeModule === 'provini' && <div className="active-glow"></div>}
            </button>
            <button className={activeModule === 'tempvoice' ? 'active' : ''} onClick={() => { setActiveModule('tempvoice'); setActiveTab('settings'); }}>
                <div className="m-icon-row">
                    <Zap size={20} />
                    <div className={`status-dot-v2 ${tempVoiceConfig.enabled ? 'on' : 'off'}`} />
                </div>
                <div className="v-stack">
                    <span className="m-title">{t('voice.m_temp_title')}</span>
                    <span className="m-desc">{t('voice.m_temp_desc')}</span>
                </div>
                {activeModule === 'tempvoice' && <div className="active-glow"></div>}
            </button>
            <button className={activeModule === 'support' ? 'active' : ''} onClick={() => { setActiveModule('support'); setActiveTab('settings'); }}>
                <div className="m-icon-row">
                    <Volume2 size={20} />
                    <div className={`status-dot-v2 ${supportConfig.enabled ? 'on' : 'off'}`} />
                </div>
                <div className="v-stack">
                    <span className="m-title">{t('voice.m_support_title')}</span>
                    <span className="m-desc">{t('voice.m_support_desc')}</span>
                </div>
                {activeModule === 'support' && <div className="active-glow"></div>}
            </button>
        </div>

        {/* Sub-Tabs */}
        <nav className="pc-tabs-container-v2" style={{ marginBottom: '40px' }}>
            <div className="pc-tabs-v2">
                <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                    <Settings2 size={16} /> <span>{t('voice.tab_channels')}</span>
                </button>
                {activeModule === 'provini' && (
                    <button className={activeTab === 'ui' ? 'active' : ''} onClick={() => setActiveTab('ui')}>
                        <MousePointer2 size={16} /> <span>{t('voice.tab_ui')}</span>
                    </button>
                )}
                <button className={activeTab === 'design' ? 'active' : ''} onClick={() => setActiveTab('design')}>
                    <Palette size={16} /> <span>{t('voice.tab_design')}</span>
                </button>
            </div>
        </nav>

        <div className="pc-content-v2">
            {/* PROVINI MODULE */}
            {activeModule === 'provini' && activeTab === 'settings' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '32px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#0891b2' }}><Terminal size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('voice.card_system_channels')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>{t('voice.join_channel')}</label>
                                        <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 2)} value={voiceConfig.joinChannelId || ''} onChange={val => setNested('provini', 'joinChannelId', val)} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('voice.provini_category')}</label>
                                        <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 4)} value={voiceConfig.categoryId || ''} onChange={val => setNested('provini', 'categoryId', val)} />
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}><Zap size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('voice.card_role_automation')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>{t('voice.roles_to_add')}</label>
                                        <DiscordSelector type="role" multiple={true} options={discordData.roles} value={voiceConfig.rolesToAdd || []} onChange={val => setNested('provini', 'rolesToAdd', val)} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('voice.roles_to_remove')}</label>
                                        <DiscordSelector type="role" multiple={true} options={discordData.roles} value={voiceConfig.rolesToRemove || []} onChange={val => setNested('provini', 'rolesToRemove', val)} />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                    <aside className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><Shield size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('voice.card_policy')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>{t('voice.staff_team')}</label>
                                    <DiscordSelector type="role" multiple={true} options={discordData.roles} value={voiceConfig.staffRoleIds || []} onChange={val => setNested('provini', 'staffRoleIds', val)} />
                                </div>
                                <div className="pc-input-group-v2" style={{ marginTop: '24px' }}>
                                    <label>{t('voice.rejection_cooldown')}</label>
                                    <div className="pc-input-wrapper-v2" style={{ background: 'var(--bg-badge)', padding: '0 16px', borderRadius: '16px', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center' }}>
                                        <Clock size={16} style={{ color: 'var(--text-dim)' }} />
                                        <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '14px', fontWeight: 700, color: 'var(--text-heading)', outline: 'none' }} value={voiceConfig.rejectionCooldown || 24} onChange={e => setNested('provini', 'rejectionCooldown', parseInt(e.target.value))} />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            )}

            {activeModule === 'provini' && activeTab === 'ui' && (
                <div className="v-stack animate slide-up">
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}><MousePointer2 size={18} /></div>
                            <h3 style={{ margin: 0 }}>{t('voice.card_staff_branding')}</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-button-config-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                                {[
                                    { key: 'approve', label: t('voice.style_success'), icon: CheckCircle, color: '#10b981' },
                                    { key: 'deny', label: t('voice.style_danger'), icon: XCircle, color: '#ef4444' }
                                ].map(btn => (
                                    <div key={btn.key} className="pc-btn-item-v2" style={{ background: 'var(--bg-badge)', padding: '24px', borderRadius: '24px', border: '1.5px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                            <btn.icon size={18} color={btn.color} />
                                            <span style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{btn.label}</span>
                                        </div>
                                        <div className="v-stack" style={{ gap: '16px' }}>
                                            <div className="pc-input-group-v2">
                                                <label>{t('voice.display_text')}</label>
                                                <input className="pc-input-modern-v2" value={voiceConfig.voiceButtons?.[btn.key]?.label || ''} onChange={e => setNested('provini', `voiceButtons.${btn.key}.label`, e.target.value)} />
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>{t('common.style')}</label>
                                                <CustomSelect 
                                                    options={[
                                                        { value: 'SUCCESS', label: t('voice.style_success') },
                                                        { value: 'DANGER', label: t('voice.style_danger') },
                                                        { value: 'PRIMARY', label: t('voice.style_primary') },
                                                        { value: 'SECONDARY', label: t('voice.style_secondary') }
                                                    ]} 
                                                    value={voiceConfig.voiceButtons?.[btn.key]?.style || 'PRIMARY'} 
                                                    onChange={val => setNested('provini', `voiceButtons.${btn.key}.style`, val)} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {/* TEMP VOICE MODULE */}
            {activeModule === 'tempvoice' && activeTab === 'settings' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}><Zap size={18} /></div>
                            <h3 style={{ margin: 0 }}>{t('voice.m_temp_title')}</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div className="pc-input-group-v2">
                                    <label>{t('voice.generator_master')}</label>
                                    <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 2)} value={tempVoiceConfig.creatorChannelId || ''} onChange={val => setNested('tempvoice', 'creatorChannelId', val)} />
                                </div>
                                <div className="pc-input-group-v2">
                                    <label>{t('voice.target_category')}</label>
                                    <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 4)} value={tempVoiceConfig.categoryId || ''} onChange={val => setNested('tempvoice', 'categoryId', val)} />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {/* SUPPORT SOS MODULE */}
            {activeModule === 'support' && activeTab === 'settings' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '32px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><Volume2 size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('voice.card_sos_automation')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>{t('voice.trigger_channel')}</label>
                                        <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 2)} value={supportConfig.voiceSettings?.joinChannelId || ''} onChange={val => setNested('support', 'voiceSettings.joinChannelId', val)} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('voice.target_category')}</label>
                                        <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 4)} value={supportConfig.voiceSettings?.categoryId || ''} onChange={val => setNested('support', 'voiceSettings.categoryId', val)} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('voice.max_instances')}</label>
                                        <input type="number" className="pc-input-modern-v2" value={supportConfig.voiceSettings?.maxConcurrent || 1} onChange={e => setNested('support', 'voiceSettings.maxConcurrent', parseInt(e.target.value))} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('voice.naming_template')}</label>
                                        <input className="pc-input-modern-v2" value={supportConfig.voiceSettings?.channelNameTemplate || ''} onChange={e => setNested('support', 'voiceSettings.channelNameTemplate', e.target.value)} />
                                    </div>
                                </div>
                                <div className="v-stack" style={{ gap: '16px', marginTop: '24px' }}>
                                    <div className="pc-toggle-card-v2">
                                        <div className="v-stack">
                                            <strong>{t('voice.auto_cleanup')}</strong>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('support.auto_cleanup_desc')}</span>
                                        </div>
                                        <label className="pc-toggle-v2 mini">
                                            <input type="checkbox" checked={!!supportConfig.voiceSettings?.autoDelete} onChange={e => setNested('support', 'voiceSettings.autoDelete', e.target.checked)} />
                                            <span className="pc-slider-v2"></span>
                                        </label>
                                    </div>
                                    <div className="pc-toggle-card-v2">
                                        <div className="v-stack">
                                            <strong>{t('voice.ping_staff')}</strong>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('support.ping_staff_desc')}</span>
                                        </div>
                                        <label className="pc-toggle-v2 mini">
                                            <input type="checkbox" checked={!!supportConfig.voiceSettings?.pingStaffOnJoin} onChange={e => setNested('support', 'voiceSettings.pingStaffOnJoin', e.target.checked)} />
                                            <span className="pc-slider-v2"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                    <aside className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><ShieldCheck size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('voice.operative_team')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>{t('voice.staff_roles')}</label>
                                    <DiscordSelector type="role" multiple={true} options={discordData.roles} value={supportConfig.staffRoleIds || []} onChange={val => setNested('support', 'staffRoleIds', val)} />
                                </div>
                                <div className="pc-input-group-v2" style={{ marginTop: '24px' }}>
                                    <label>{t('voice.vip_role')}</label>
                                    <DiscordSelector type="role" options={discordData.roles} value={supportConfig.voiceSettings?.vipRoleId || ''} onChange={val => setNested('support', 'voiceSettings.vipRoleId', val)} />
                                </div>
                            </div>
                        </section>
                        <NotificationSettings 
                            guildId={guildId}
                            value={supportConfig.voiceSettings?.notifications}
                            onChange={val => setNested('support', 'voiceSettings.notifications', val)}
                            title={t('support.notifications')}
                        />
                    </aside>
                </div>
            )}

            {/* DESIGN TABS (MODULE AWARE) */}
            {activeTab === 'design' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    {activeModule === 'provini' && (
                        <>
                            <section className="pc-card-v2">
                                <div className="card-header-v2">
                                    <div className="header-icon" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}><Palette size={18} /></div>
                                    <h3 style={{ margin: 0 }}>{t('voice.card_temp_design')}</h3>
                                </div>
                                <div className="card-body-v2">
                                    <div className="pc-tabs-v2" style={{ marginBottom: '32px', background: 'var(--bg-badge)', padding: '6px' }}>
                                        {[
                                            { key: 'voice_waiting', label: t('voice.embed_waiting') },
                                            { key: 'voice_guide', label: t('voice.embed_guide') },
                                            { key: 'voice_staff_log', label: t('voice.embed_logs') },
                                            { key: 'voice_error_flow', label: t('voice.embed_error') }
                                        ].map(k => (
                                            <button key={k.key} onClick={() => setActiveEmbedKey(k.key)} className={activeEmbedKey === k.key ? 'active' : ''}>
                                                <span>{k.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <EmbedEditor 
                                        embed={voiceConfig.embeds?.[activeEmbedKey] || {}} 
                                        onChange={val => setNested('provini', `embeds.${activeEmbedKey}`, val)}
                                        variables={['user', 'staff', 'voice_channel', 'reason', 'cooldown']}
                                    />
                                </div>
                            </section>
                            <EmbedMessageManager 
                                guildId={guildId}
                                module="voice"
                                slugs={[
                                    { key: 'dm_accepted', label: t('voice.dm_accepted'), description: t('voice.dm_accepted_desc'), variables: ['user'], group: 'Outcome', groupIcon: CheckCircle },
                                    { key: 'dm_rejected', label: t('voice.dm_rejected'), description: t('voice.dm_rejected_desc'), variables: ['user', 'reason', 'cooldown'], group: 'Outcome', groupIcon: XCircle }
                                ]}
                            />
                        </>
                    )}

                    {activeModule === 'tempvoice' && (
                        <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                            <section className="pc-card-v2">
                                <div className="card-header-v2">
                                    <div className="header-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}><Layout size={18} /></div>
                                    <h3 style={{ margin: 0 }}>{t('voice.name_template')}</h3>
                                </div>
                                <div className="card-body-v2">
                                    <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        <div className="pc-input-group-v2">
                                            <label>{t('voice.name_template')}</label>
                                            <input className="pc-input-modern-v2" value={tempVoiceConfig.channelNameTemplate || ''} onChange={e => setNested('tempvoice', 'channelNameTemplate', e.target.value)} placeholder="Esempio: Stanza di {user}" />
                                        </div>
                                        <div className="pc-input-group-v2">
                                            <label>{t('voice.user_limit')}</label>
                                            <input type="number" className="pc-input-modern-v2" value={tempVoiceConfig.defaultUserLimit || 0} onChange={e => setNested('tempvoice', 'defaultUserLimit', parseInt(e.target.value))} />
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <SystemMessagesSection 
                                config={tempVoiceConfig}
                                onUpdate={setTempVoiceConfig}
                                messages={[
                                    { key: 'not_owner', label: t('voice.msg_not_owner'), placeholder: t('voice.msg_not_owner_desc') },
                                    { key: 'no_perms', label: t('voice.msg_no_perms'), placeholder: t('voice.msg_no_perms_desc') },
                                    { key: 'cooldown', label: t('voice.msg_cooldown'), placeholder: t('voice.msg_cooldown_desc') }
                                ]}
                            />
                        </div>
                    )}

                    {activeModule === 'support' && (
                        <div className="v-stack animate slide-up">
                            <EmbedMessageManager 
                                guildId={guildId}
                                module="support"
                                slugs={[
                                    { key: 'sessionStart', label: t('support.msg_session_start'), description: t('support.msg_session_start_desc'), variables: ['user', 'guild', 'channel'], group: 'User UI', groupIcon: Zap },
                                    { key: 'queueFull', label: t('support.msg_queue_full'), description: t('support.msg_queue_full_desc'), variables: ['user', 'guild', 'position'], group: 'User UI', groupIcon: Users },
                                    { key: 'paused', label: t('support.msg_paused'), description: t('support.msg_paused_desc'), variables: ['user', 'guild'], group: 'Status UI', groupIcon: Power },
                                    { key: 'cooldown', label: t('support.msg_cooldown'), description: t('support.msg_cooldown_desc'), variables: ['user', 'guild'], group: 'Status UI', groupIcon: Clock },
                                    { key: 'staffLog', label: t('support.msg_staff_log_start'), description: t('support.msg_staff_log_start_desc'), variables: ['user', 'voice_channel'], group: 'Staff UI', groupIcon: ShieldCheck },
                                    { key: 'queue_log', label: t('support.msg_queue_log'), description: t('support.msg_queue_log_desc'), variables: ['user', 'user_id', 'position', 'vip_text'], group: 'Staff UI', groupIcon: Terminal }
                                ]}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1500px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #fff; }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Inter', sans-serif; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 700; padding: 4px 12px; border-radius: 100px; width: fit-content; }
            .pc-status-tag-v2.on { background: rgba(16, 185, 129, 0.1); color: #10b981; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: #ef4444; }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
            .pc-header-divider { width: 1px; height: 24px; background: var(--border); margin: 0 4px; }
            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 14px 28px; border-radius: 18px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.3s; box-shadow: 0 10px 20px rgba(var(--primary-rgb), 0.2); }
            .pc-module-switcher { display: grid; gap: 24px; margin-bottom: 40px; }
            .pc-module-switcher button { position: relative; display: flex; align-items: center; gap: 20px; background: var(--bg-card); border: 1.5px solid var(--border); padding: 24px; border-radius: 28px; text-align: left; cursor: pointer; transition: 0.3s; overflow: hidden; }
            .pc-module-switcher button.active { border-color: var(--primary); background: rgba(var(--primary-rgb), 0.02); }
            .pc-module-switcher button:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.04); }
            .m-title { font-weight: 800; font-size: 1.1rem; color: var(--text-heading); }
            .m-desc { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
            .active-glow { position: absolute; inset: 0; background: radial-gradient(circle at top right, rgba(var(--primary-rgb), 0.1) 0%, transparent 70%); pointer-events: none; }
            .pc-tabs-v2 { display: flex; gap: 6px; background: var(--bg-badge); padding: 6px; border-radius: 18px; width: fit-content; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 10px; padding: 12px 24px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; font-size: 0.9rem; border-radius: 14px; cursor: pointer; transition: 0.2s; white-space: nowrap; }
            .pc-tabs-v2 button.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
            .header-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.4rem; font-weight: 800; color: var(--text-heading); }
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 10px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
            .pc-input-modern-v2 { width: 100%; background: var(--bg-badge); border: 1.5px solid var(--border); border-radius: 16px; padding: 16px 20px; font-weight: 700; color: var(--text-heading); outline: none; transition: 0.2s; }
            .pc-toggle-v2 { position: relative; width: 48px; height: 24px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: var(--border); transition: .4s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background: #fff; transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: var(--primary); }
            input:checked + .pc-slider-v2:before { transform: translateX(24px); }
            .pc-toggle-card-v2 { background: var(--bg-badge); padding: 20px; border-radius: 20px; border: 1.5px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
            .v-stack { display: flex; flex-direction: column; }
            .m-icon-row { display: flex; align-items: center; gap: 12px; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-module-switcher button { box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
