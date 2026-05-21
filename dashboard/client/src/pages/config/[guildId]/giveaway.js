import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, Gift, Trophy, Clock, Users, Trash2, Plus, RefreshCcw, Settings2, Shield, Power, Palette, Zap, Flame,
    Info, MessageSquare, ExternalLink, History, X, Calendar, ChevronRight, AlertCircle, Square, 
    Monitor, Smartphone, Sun, Moon, ArrowRight, Search, Sparkles, Layout, CheckCircle2, Box, Send, Star,
    MousePointer2, Timer, Award, UserCheck, ShieldAlert, Layers, Target, Eye, EyeOff, Wand2, RefreshCw, GripVertical, RotateCcw
} from 'lucide-react';
import { DiscordSelector, CustomSelect, SystemMessagesSection, HelpTooltip } from '../../../components/LazyConfigComponents';
import EmojiInput from '../../../components/EmojiInput';
import EmbedPreviewDrawer from '../../../components/EmbedPreviewDrawer';
import Head from 'next/head';

export default function GiveawayConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [config, setConfig] = useState(null);
  const [roles, setRoles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [activeGiveaways, setActiveGiveaways] = useState([]);
  const [scheduledGiveaways, setScheduledGiveaways] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('create');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [newGw, setNewGw] = useState({
    prize: '',
    duration: 60,
    winnerCount: 1,
    channelId: '',
    scheduledStart: '',
    customTitle: '',
    customDescription: '',
    color: '#6366f1',
    buttonLabel: '',
    buttonEmoji: '🎉',
    buttonStyle: 'PRIMARY',
    minLevel: 0
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const previewEmbed = {
    title: (newGw.customTitle || '').replace(/{prize}/g, newGw.prize || 'Nitro Classic'),
    description: (newGw.customDescription || '')
        .replace(/{prize}/g, newGw.prize || 'Nitro Classic')
        .replace(/{endtime}/g, `<t:${Math.floor((Date.now() + newGw.duration * 60000) / 1000)}:R>`),
    color: newGw.color,
    footer: t('giveaway.footer_placeholder'),
    timestamp: true,
    fields: [
        { name: `👥 ${t('giveaway.table_entries')}`, value: '1,248', inline: true }
    ],
    button: { 
        label: newGw.buttonLabel, 
        emoji: newGw.buttonEmoji, 
        style: newGw.buttonStyle 
    }
  };

  useEffect(() => {
    if (guildId && guildId !== 'undefined' && mounted) fetchData();
  }, [guildId, mounted]);

  const fetchData = async () => {
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [configRes, discordRes, activeRes, scheduledRes, logsRes] = await Promise.all([
        api.request('/config/' + guildId + '/giveaway').catch(() => ({ enabled: false })),
        api.request('/config/' + guildId + '/discord-data').catch(() => ({ roles: [], channels: [] })),
        api.request('/config/' + guildId + '/giveaways/active').catch(() => ({ data: [] })),
        api.request('/config/' + guildId + '/giveaways/scheduled').catch(() => ({ data: [] })),
        api.request('/config/' + guildId + '/giveaways/logs').catch(() => ({ data: [] }))
      ]);
      
      setConfig(configRes?.data || configRes || { enabled: false });
      if (discordRes) {
        setRoles(discordRes.roles || []);
        setChannels(discordRes.channels?.filter(c => c.type === 0 || c.type === 5) || []);
      }
      setActiveGiveaways(activeRes?.data || activeRes || []);
      setScheduledGiveaways(scheduledRes?.data || scheduledRes || []);
      setLogs(logsRes?.data || logsRes || []);
    } catch (e) {
      console.error("Giveaway load error:", e);
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request('/config/' + guildId + '/giveaway', {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast(t('giveaway.studio_sync_success'));
    } catch (e) {
      showToast(t('common.error'), 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleReset = async () => {
    if (!confirm(t('common.reset_confirm') || 'Sei sicuro di voler ripristinare questo modulo ai valori di default?')) return;
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const res = await api.request('/config/' + guildId + '/giveaway/reset', { method: 'POST' });
      if (res.success) {
        setConfig(res.data);
        showToast(t('common.reset_success') || 'Modulo ripristinato!');
      }
    } catch (e) {
      showToast(t('common.reset_error') || 'Errore durante il reset', 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleCreateGiveaway = async (forceNow = false) => {
    if (!newGw.prize || !newGw.channelId) return showToast(t('giveaway.config_error'), 'error');
    
    const dataToPost = {
        ...newGw,
        scheduledStart: (newGw.scheduledStart && !forceNow) ? new Date(newGw.scheduledStart).getTime() : ''
    };
    
    setCreating(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const res = await api.request('/config/' + guildId + '/giveaways/create', {
        method: 'POST',
        body: JSON.stringify(dataToPost)
      });
      if (res) {
        showToast(dataToPost.scheduledStart ? t('giveaway.scheduled_success') : t('giveaway.start_success'));
        setNewGw({ ...newGw, prize: '', scheduledStart: '' });
        fetchData();
        setActiveTab('live');
      }
    } catch (e) {
      showToast(t('giveaway.deploy_error'), 'error');
    } finally {
      setCreating(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleDeleteGiveaway = async (id) => {
    if (!confirm(t('giveaway.delete_confirm'))) return;
    try {
      await api.request('/config/' + guildId + '/giveaways/' + id, { method: 'DELETE' });
      showToast(t('giveaway.delete_success'));
      fetchData();
    } catch (e) {
      showToast(t('giveaway.delete_error'), 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('giveaway.studio_title')} | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
                    <Gift size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('giveaway.studio_title')}</h1>
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
                <button className="pc-btn-outline-v2" onClick={handleReset} title={t('common.reset_to_default')}>
                    <RotateCcw size={18} />
                </button>
                <button className="pc-btn-primary" onClick={handleSaveConfig} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('common.save_changes')}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-v2" style={{ marginBottom: '32px' }}>
            {[
                { id: 'create', icon: <Plus size={16} />, label: t('giveaway.tab_live') },
                { id: 'live', icon: <Zap size={16} />, label: t('common.active'), count: activeGiveaways.length },
                { id: 'logs', icon: <History size={16} />, label: t('giveaway.tab_logs') },
                { id: 'settings', icon: <Shield size={16} />, label: t('giveaway.tab_perms') }
            ].map(tab => (
                <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
                    {tab.icon} <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && <span className="pc-tab-badge-v2">{tab.count}</span>}
                </button>
            ))}
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'create' && (
                <div className="v-stack" style={{ gap: '24px' }}>
                    <section className="pc-card-v2 preview-action-bar">
                        <div>
                            <h3 style={{ margin: 0 }}>{t('giveaway.visual_designer')}</h3>
                            <p>{t('giveaway.preview_desc')}</p>
                        </div>
                        <button className="pc-btn-secondary-v2 preview-action-btn" onClick={() => setPreviewOpen(true)}>
                            <Monitor size={18} /> <span>{t('common.preview')}</span>
                        </button>
                    </section>

                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2">
                                <div className="header-icon"><Award size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('giveaway.core_params')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>{t('giveaway.prize_name')}</label>
                                    <div className={`pc-input-modern-v2 ${!newGw.prize ? 'has-error' : ''}`}>
                                        <Gift size={18} />
                                        <input value={newGw.prize} onChange={e => setNewGw({...newGw, prize: e.target.value})} placeholder={t('giveaway.prize_placeholder')} />
                                    </div>
                                    {!newGw.prize && <span className="pc-required-hint">{t('common.required_to_publish')}</span>}
                                </div>
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '20px', marginTop: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>{t('giveaway.target_channel')}</label>
                                        <DiscordSelector type="channel" options={channels} value={newGw.channelId} onChange={v => setNewGw({...newGw, channelId: v})} error={!newGw.channelId ? t('common.required_to_publish') : ''} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('giveaway.winners_count')}</label>
                                        <div className="pc-input-modern-v2">
                                            <Trophy size={18} />
                                            <input type="number" value={newGw.winnerCount} onChange={e => setNewGw({...newGw, winnerCount: parseInt(e.target.value) || 1})} min="1" max="50" style={{ width: '100%' }} />
                                        </div>
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('giveaway.min_level_req')}</label>
                                        <div className="pc-input-modern-v2">
                                            <Flame size={18} />
                                            <input type="number" value={newGw.minLevel !== undefined ? newGw.minLevel : 0} onChange={e => setNewGw({...newGw, minLevel: parseInt(e.target.value) || 0})} min="0" style={{ width: '100%' }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="pc-input-group-v2" style={{ marginTop: '24px' }}>
                                    <label>{t('giveaway.duration')}</label>
                                    <div className="pc-input-modern-v2">
                                        <Clock size={18} />
                                        <input type="number" value={newGw.duration} onChange={e => setNewGw({...newGw, duration: parseInt(e.target.value) || 60})} min="1" style={{ width: '100%' }} />
                                    </div>
                                    <div className="pc-time-presets-v2" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                        {[60, 1440, 10080].map(m => {
                                            const isActive = newGw.duration === m;
                                            return (
                                                <button 
                                                    key={m} 
                                                    onClick={() => setNewGw({...newGw, duration: m})} 
                                                    className={`pc-tag-v2 ${isActive ? 'active' : ''}`} 
                                                    style={{ 
                                                        cursor: 'pointer',
                                                        background: isActive ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' : 'rgba(255, 255, 255, 0.03)',
                                                        color: isActive ? '#fff' : 'var(--text-muted)',
                                                        borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                                                        fontWeight: isActive ? '700' : '500',
                                                        boxShadow: isActive ? '0 4px 12px var(--primary-glow)' : 'none',
                                                        transition: 'all 0.2s ease',
                                                        padding: '8px 16px',
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--border)',
                                                        transform: isActive ? 'scale(1.05)' : 'none'
                                                    }}
                                                >
                                                    {m === 60 ? '1h' : m === 1440 ? '24h' : '1w'}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="card-header-v2">
                                <div className="header-icon"><Palette size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('giveaway.visual_designer')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>{t('giveaway.embed_title')}</label>
                                    <input className="pc-input-modern-v2" value={newGw.customTitle} onChange={e => setNewGw({...newGw, customTitle: e.target.value})} placeholder={t('giveaway.custom_title_placeholder')} />
                                </div>
                                <div className="pc-input-group-v2" style={{ marginTop: '24px' }}>
                                    <label>{t('giveaway.embed_desc')}</label>
                                    <textarea className="pc-input-modern-v2" style={{ minHeight: '120px' }} value={newGw.customDescription} onChange={e => setNewGw({...newGw, customDescription: e.target.value})} placeholder={t('giveaway.custom_desc_placeholder')} />
                                </div>
                                <div className="pc-input-group-v2" style={{ marginTop: '24px' }}>
                                    <label>{t('giveaway.accent_color')}</label>
                                    <div className="pc-color-box-v2" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-card)', padding: '8px', borderRadius: '12px', border: '1.5px solid var(--border)', width: 'fit-content' }}>
                                        <div className="color-preview" style={{ width: '32px', height: '32px', borderRadius: '8px', position: 'relative', overflow: 'hidden', border: '1px solid #fff', backgroundColor: newGw.color }}>
                                            <input type="color" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} value={newGw.color} onChange={e => setNewGw({...newGw, color: e.target.value})} />
                                        </div>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{newGw.color.toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="pc-button-builder animate slide-up" style={{ marginTop: '24px' }}>
                                    <div className="pc-bb-left">
                                        <GripVertical size={20} color="rgba(255,255,255,0.2)" />
                                    </div>
                                    <div className="pc-bb-content">
                                        <div className="pc-bb-top-row">
                                            <div className={`pc-bb-preview ${newGw.buttonStyle || 'PRIMARY'}`}>
                                                <span>{newGw.buttonEmoji || '🎉'}</span>
                                                <span>{newGw.buttonLabel || t('giveaway.button_label_default')}</span>
                                            </div>
                                        </div>

                                        <div className="pc-bb-columns">
                                            <div className="pc-bb-col">
                                                <label>{t('common.emoji')}</label>
                                                <div className="pc-bb-emoji-box">
                                                    <EmojiInput value={newGw.buttonEmoji || '🎉'} hideInput={true} onChange={e => setNewGw({...newGw, buttonEmoji: e.target.value})} />
                                                </div>
                                            </div>
                                            <div className="pc-bb-col">
                                                <label>{t('giveaway.button_label')}</label>
                                                <div className="pc-bb-input-box">
                                                    <input value={newGw.buttonLabel} onChange={e => setNewGw({...newGw, buttonLabel: e.target.value})} placeholder={t('giveaway.button_label_default')} />
                                                </div>
                                            </div>
                                            <div className="pc-bb-col">
                                                <label>{t('common.color')}</label>
                                                <div className="pc-bb-color-picker">
                                                    {['PRIMARY', 'SUCCESS', 'DANGER', 'SECONDARY'].map(styleOption => (
                                                        <div 
                                                            key={styleOption}
                                                            className={`pc-bb-swatch swatch-${styleOption} ${(newGw.buttonStyle || 'PRIMARY') === styleOption ? 'active' : ''}`}
                                                            onClick={() => setNewGw({...newGw, buttonStyle: styleOption})}
                                                        >
                                                            {(newGw.buttonStyle || 'PRIMARY') === styleOption && <CheckCircle2 size={12} color="#fff" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="card-header-v2">
                                <div className="header-icon"><Calendar size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('giveaway.timeline_title')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>{t('giveaway.scheduled_start')}</label>
                                    <input type="datetime-local" className="pc-input-modern-v2" value={newGw.scheduledStart} onChange={e => setNewGw({...newGw, scheduledStart: e.target.value})} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '32px' }}>
                                    <button className="pc-btn-primary" style={{ height: '56px', fontSize: '1.1rem' }} onClick={() => handleCreateGiveaway(true)} disabled={creating}>
                                        <Zap size={20} /> <span>{t('giveaway.deploy_now')}</span>
                                    </button>
                                    <button className="pc-btn-secondary-v2" style={{ height: '56px', fontSize: '1.1rem', background: 'var(--bg-card)', color: 'var(--primary)', border: '1.5px solid var(--border)', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} onClick={() => handleCreateGiveaway(false)} disabled={creating}>
                                        <Calendar size={20} /> <span>{t('giveaway.schedule_btn')}</span>
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    <EmbedPreviewDrawer open={previewOpen} onClose={() => setPreviewOpen(false)} data={previewEmbed} />
                </div>
            )}

            {activeTab === 'live' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                        {activeGiveaways.map(gw => (
                            <div key={gw.messageId} className="pc-sub-card-v2" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                <div style={{ width: '64px', height: '64px', background: 'var(--bg-card)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '1.5px solid var(--border)' }}><Trophy size={32} /></div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-heading)' }}>{gw.prize}</h4>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}><Users size={14} /> {gw.participants?.length || 0} Entrate</span>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteGiveaway(gw.messageId)} className="pc-btn-icon-danger-v2" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', padding: '10px', borderRadius: '12px' }}><Trash2 size={20} /></button>
                            </div>
                        ))}
                        {activeGiveaways.length === 0 && (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '56px 24px', background: 'var(--bg-badge)', borderRadius: '18px', border: '1.5px dashed var(--border)' }}>
                                <Box size={64} style={{ margin: '0 auto 24px', opacity: 0.1 }} />
                                <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--text-heading)' }}>{t('giveaway.no_active')}</h3>
                                <button onClick={() => setActiveTab('create')} className="pc-btn-primary" style={{ margin: '24px auto 0' }}><Plus size={18} /> {t('giveaway.new_project')}</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="v-stack animate slide-up">
                    <section className="pc-card-v2" style={{ padding: 0, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'var(--bg-badge)' }}>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('giveaway.table_prize')}</th>
                                    <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('giveaway.table_date')}</th>
                                    <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('giveaway.table_entries')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, i) => (
                                    <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                                        <td style={{ padding: '24px 32px', fontWeight: 700, color: 'var(--text-heading)' }}>{log.prize}</td>
                                        <td style={{ padding: '24px 32px', color: 'var(--text-muted)' }}>{new Date(log.endTime).toLocaleDateString()}</td>
                                        <td style={{ padding: '24px 32px' }}><span className="pc-tag-v2" style={{ background: 'var(--bg-badge)', color: 'var(--text-muted)', padding: '4px 12px', borderRadius: '100px', border: '1.5px solid var(--border)', fontSize: '0.8rem', fontWeight: 700 }}>{log.participants?.length || 0}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="v-stack animate slide-up">
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon"><Shield size={18} /></div>
                            <h3 style={{ margin: 0 }}>{t('giveaway.perms_title')}</h3>
                        </div>
                        <div className="card-body-v2">
                             <div className="pc-input-group-v2">
                                <label>{t('giveaway.auth_roles')}</label>
                                <DiscordSelector type="role" multiple={true} options={roles} value={config.managerRoles || []} onChange={v => setConfig({...config, managerRoles: v})} />
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
                            { key: 'joined', label: t('giveaway.msg_joined_label'), placeholder: t('giveaway.msg_joined_placeholder') },
                            { key: 'left', label: t('giveaway.msg_left_label'), placeholder: t('giveaway.msg_left_placeholder') },
                            { key: 'already_joined', label: t('giveaway.msg_already_joined_label'), placeholder: t('giveaway.msg_already_joined_placeholder') },
                            { key: 'ended', label: t('giveaway.msg_ended_label'), placeholder: t('giveaway.msg_ended_placeholder') }
                        ]}
                    />
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1650px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            @media (max-width: 1200px) {
                .pc-layout-grid-v2 { grid-template-columns: 1fr !important; gap: 24px !important; }
            }
            
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-tab-badge-v2 { background: var(--primary); color: #fff; font-size: 0.7rem; padding: 2px 8px; border-radius: 100px; margin-left: 8px; }
            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            .preview-action-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 20px !important; }
            .preview-action-bar p { margin: 4px 0 0 0; color: var(--text-muted); font-size: 0.85rem; font-weight: 650; }
            .preview-action-btn { min-height: 44px; justify-content: center; display: flex; align-items: center; gap: 10px; border-radius: 14px; padding: 12px 20px; }
            @media (max-width: 720px) {
                .preview-action-bar { align-items: stretch; flex-direction: column; }
                .preview-action-btn { width: 100%; }
            }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
