import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, Trash2, Plus, Clock, Zap, Layout, Power, X, Hash, MessageSquare, Send, MousePointer2, 
    Settings2, Palette, ChevronLeft, Monitor, Smartphone, Lock, ArrowRight, ChevronRight, 
    Trash, CheckCircle2, AlertCircle, Globe, Cpu, Sparkles, Box, Activity, Info, Timer, MessageCircle, Star,
    Terminal, Layers, Shield, RefreshCcw, RotateCcw
} from 'lucide-react';
import { DiscordSelector, EmbedEditor, CustomSelect, SystemMessagesSection } from '../../../components/LazyConfigComponents';
import Head from 'next/head';

export default function AutomationsConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('autoclear');
  const [guildData, setGuildData] = useState(null);
  const [editingEmbedIndex, setEditingEmbedIndex] = useState(null);

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
      const [configRes, discordRes, guildRes] = await Promise.all([
        api.request(`/config/${guildId}/automations`).catch(() => ({ autoClear: { slots: [] }, autoMessage: { slots: [] } })),
        api.request(`/config/${guildId}/discord-data`).catch(() => ({ channels: [] })),
        api.request(`/config/${guildId}/guild`).catch(() => ({ isPremium: false }))
      ]);
      
      setConfig(configRes.data || configRes);
      const rawChannels = discordRes.channels || discordRes.data?.channels || [];
      setChannels(rawChannels.filter(c => c.type === 0 || c.type === 5));
      setGuildData(guildRes.data || guildRes);
    } catch (error) {
      console.error("Automations load error:", error);
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleReset = async () => {
    if (!confirm(t('common.reset_confirm'))) return;
    
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const res = await api.request(`/config/${guildId}/automations/reset`, { method: 'POST' });
      if (res.success) {
        setConfig(res.data);
        showToast(t('common.reset_success'));
      }
    } catch (error) {
      console.error("Reset error:", error);
      showToast(t('common.reset_error'), 'error');
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/automations`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast(t('common.sync_success'));
    } catch (error) {
      showToast(t('common.save_error'), 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const addClearSlot = () => {
    if (!guildData?.isPremium && (config.autoClear?.slots || []).length >= 5) {
      showToast(t('automations.limit_reached'), 'error');
      return;
    }
    const newSlots = [...(config.autoClear?.slots || []), { id: `slot_${Date.now()}`, channelId: '', intervalMinutes: 60, amount: 100, enabled: true }];
    setConfig({ ...config, autoClear: { ...config.autoClear, slots: newSlots } });
  };

  const removeClearSlot = (index) => {
    const newSlots = config.autoClear.slots.filter((_, i) => i !== index);
    setConfig({ ...config, autoClear: { ...config.autoClear, slots: newSlots } });
  };

  const updateClearSlot = (index, field, value) => {
    const newSlots = [...config.autoClear.slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setConfig({ ...config, autoClear: { ...config.autoClear, slots: newSlots } });
  };

  const addMessageSlot = () => {
    if (!guildData?.isPremium && (config.autoMessage?.slots || []).length >= 5) {
      showToast(t('automations.limit_reached'), 'error');
      return;
    }
    const newSlots = [...(config.autoMessage?.slots || []), { 
        id: `msg_${Date.now()}`, 
        channelId: '', 
        content: '', 
        triggerType: 'TIME', 
        triggerValue: 60, 
        enabled: true,
        useEmbed: false,
        embed: {}
    }];
    setConfig({ ...config, autoMessage: { ...config.autoMessage, slots: newSlots } });
  };

  const removeMessageSlot = (index) => {
    const newSlots = config.autoMessage.slots.filter((_, i) => i !== index);
    setConfig({ ...config, autoMessage: { ...config.autoMessage, slots: newSlots } });
  };

  const updateMessageSlot = (index, field, value) => {
    const newSlots = [...config.autoMessage.slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setConfig({ ...config, autoMessage: { ...config.autoMessage, slots: newSlots } });
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  const isPremium = guildData?.isPremium;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('automations.title')} | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
                    <Cpu size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('automations.title')}</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? t('automations.active_tag') : t('automations.inactive_tag')}
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
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('common.save_changes')}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-container-v2" style={{ marginBottom: '40px' }}>
            <div className="pc-tabs-v2">
                <button className={activeTab === 'autoclear' ? 'active' : ''} onClick={() => setActiveTab('autoclear')}>
                    <Trash2 size={16} /> <span>{t('automations.tab_autoclear')}</span>
                    {(config.autoClear?.slots || []).length > 0 && <span className="tab-count-v2">{(config.autoClear?.slots || []).length}</span>}
                </button>
                <button className={activeTab === 'automessage' ? 'active' : ''} onClick={() => setActiveTab('automessage')}>
                    <RefreshCcw size={16} /> <span>{t('automations.tab_automessage')}</span>
                    {(config.autoMessage?.slots || []).length > 0 && <span className="tab-count-v2">{(config.autoMessage?.slots || []).length}</span>}
                </button>
                <button className={activeTab === 'system_messages' ? 'active' : ''} onClick={() => setActiveTab('system_messages')}>
                    <Settings2 size={16} /> <span>{t('common.tab_system_messages')}</span>
                </button>
            </div>
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'autoclear' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    {!isPremium && (
                        <div className="pc-premium-banner-v2 animate slide-up">
                            <Star size={20} style={{ color: '#d97706' }} />
                            <div style={{ flex: 1 }}>
                                <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-heading)' }}>{t('automations.banner_title')}</strong>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t('automations.banner_desc')}</span>
                            </div>
                            <button className="pc-btn-upgrade-v2" onClick={() => router.push(`/config/${guildId}/premium`)}>{t('common.upgrade')}</button>
                        </div>
                    )}
                    
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}><Trash2 size={18} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>{t('automations.autoclear_title')}</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 650 }}>{t('automations.autoclear_desc')}</p>
                            </div>
                            <button className="pc-btn-add-v2" onClick={addClearSlot}>
                                <Plus size={18} /> <span>{t('automations.new_channel_btn')}</span>
                            </button>
                        </div>
                        <div className="card-body-v2">
                            <div className="v-stack" style={{ gap: '28px' }}>
                                {(config.autoClear?.slots || []).map((slot, index) => (
                                    <div key={slot.id} className="pc-sub-card-v2 animate slide-up" style={{ background: 'var(--bg-badge)', padding: '32px', borderRadius: '28px', border: '1.5px solid var(--border)', position: 'relative' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', borderBottom: '1.5px dashed var(--border)', paddingBottom: '24px' }}>
                                            <div style={{ width: '48px', height: '48px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}><Hash size={20} /></div>
                                            <div className="v-stack">
                                                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-heading)' }}>{t('automations.slot_title', { index: index + 1 })}</h4>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('automations.engine_config')}</span>
                                            </div>
                                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                <div className="pc-status-tag-mini-v2" style={{ background: slot.enabled ? 'rgba(16,185,129,0.08)' : 'var(--bg-badge)', color: slot.enabled ? '#10b981' : 'var(--text-dim)' }}>{slot.enabled ? t('automations.status_active') : t('automations.status_pause')}</div>
                                                <label className="pc-toggle-v2 mini">
                                                    <input type="checkbox" checked={!!slot.enabled} onChange={e => updateClearSlot(index, 'enabled', e.target.checked)} />
                                                    <span className="pc-slider-v2"></span>
                                                </label>
                                                <button onClick={() => removeClearSlot(index)} className="pc-btn-delete-mini"><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                        
                                        <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '28px' }}>
                                            <div className="pc-input-group-v2">
                                                <label>{t('automations.select_channel')}</label>
                                                <DiscordSelector 
                                                    type="channel" 
                                                    options={channels.filter(c => c.type === 0 || c.type === 5)} 
                                                    value={slot.channelId || ''} 
                                                    onChange={val => updateClearSlot(index, 'channelId', val)} 
                                                />
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>{t('automations.interval_label')}</label>
                                                <div className="pc-input-wrapper-v2" style={{ background: 'var(--bg-input)', border: '1.5px solid var(--border)', borderRadius: '16px', display: 'flex', alignItems: 'center' }}>
                                                    <Timer size={18} style={{ marginLeft: '16px', color: 'var(--text-dim)' }} />
                                                    <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '16px', fontWeight: 700, color: 'var(--text-heading)' }} value={slot.intervalMinutes || 60} onChange={e => updateClearSlot(index, 'intervalMinutes', parseInt(e.target.value))} />
                                                </div>
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>{t('automations.messages_per_cycle')}</label>
                                                <div className="pc-input-wrapper-v2" style={{ background: 'var(--bg-input)', border: '1.5px solid var(--border)', borderRadius: '16px', display: 'flex', alignItems: 'center' }}>
                                                    <Layers size={18} style={{ marginLeft: '16px', color: 'var(--text-dim)' }} />
                                                    <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '16px', fontWeight: 700, color: 'var(--text-heading)' }} value={slot.amount || 100} onChange={e => updateClearSlot(index, 'amount', parseInt(e.target.value))} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(config.autoClear?.slots || []).length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '120px 20px', color: 'var(--text-dim)', background: 'var(--bg-badge)', borderRadius: '32px', border: '2px dashed var(--border)' }}>
                                        <Box size={56} style={{ margin: '0 auto 24px', opacity: 0.2, color: '#ef4444' }} />
                                        <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{t('automations.no_autoclear')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'automessage' && editingEmbedIndex === null && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    {!isPremium && (
                        <div className="pc-premium-banner-v2 animate slide-up" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', color: '#92400e', border: '1.5px solid #fde68a' }}>
                            <Zap size={20} style={{ color: '#ea580c' }} />
                            <div style={{ flex: 1 }}>
                                <strong style={{ display: 'block', fontSize: '1rem', color: '#92400e' }}>{t('automations.banner_designer_title')}</strong>
                                <span style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 700 }}>{t('automations.banner_designer_desc')}</span>
                            </div>
                            <button className="pc-btn-upgrade-v2" style={{ background: '#ea580c' }} onClick={() => router.push(`/config/${guildId}/premium`)}>{t('automations.unlock_designer')}</button>
                        </div>
                    )}

                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b' }}><MessageCircle size={18} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>{t('automations.broadcast_title')}</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 650 }}>{t('automations.broadcast_desc')}</p>
                            </div>
                            <button className="pc-btn-add-v2" style={{ background: 'rgba(245,158,11,0.08)', color: '#d97706', border: '1.5px solid rgba(245,158,11,0.3)' }} onClick={addMessageSlot}>
                                <Plus size={18} /> <span>{t('automations.new_broadcast_btn')}</span>
                            </button>
                        </div>
                        <div className="card-body-v2">
                            <div className="v-stack" style={{ gap: '28px' }}>
                                {(config.autoMessage?.slots || []).map((slot, index) => (
                                    <div key={slot.id} className="pc-sub-card-v2 animate slide-up" style={{ background: 'var(--bg-badge)', padding: '32px', borderRadius: '28px', border: '1.5px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', borderBottom: '1.5px dashed var(--border)', paddingBottom: '24px' }}>
                                            <div style={{ width: '48px', height: '48px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}><Send size={20} /></div>
                                            <div className="v-stack">
                                                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-heading)' }}>{t('automations.broadcast_slot', { index: index + 1 })}</h4>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('automations.studio_broadcast')}</span>
                                            </div>
                                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <button onClick={() => setEditingEmbedIndex(index)} disabled={!isPremium} className={`pc-btn-studio-v2 ${slot.useEmbed ? 'active' : ''}`} style={{ opacity: isPremium ? 1 : 0.5, cursor: isPremium ? 'pointer' : 'not-allowed' }}>
                                                    <Palette size={16} /> <span>{slot.useEmbed ? t('automations.design_active') : t('automations.create_embed')}</span>
                                                </button>
                                                <div style={{ width: '1.5px', height: '28px', background: 'var(--border)', margin: '0 4px' }}></div>
                                                <label className="pc-toggle-v2 mini">
                                                    <input type="checkbox" checked={!!slot.enabled} onChange={e => updateMessageSlot(index, 'enabled', e.target.checked)} />
                                                    <span className="pc-slider-v2"></span>
                                                </label>
                                                <button onClick={() => removeMessageSlot(index)} className="pc-btn-delete-mini"><Trash2 size={18} /></button>
                                            </div>
                                        </div>

                                        <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 0.6fr', gap: '28px' }}>
                                            <div className="pc-input-group-v2">
                                                <label>{t('automations.target_channel')}</label>
                                                <DiscordSelector 
                                                    type="channel" 
                                                    options={channels.filter(c => c.type === 0 || c.type === 5)} 
                                                    value={slot.channelId || ''} 
                                                    onChange={val => updateMessageSlot(index, 'channelId', val)} 
                                                />
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>{t('automations.activation_metric')}</label>
                                                <CustomSelect 
                                                    options={[
                                                        { value: 'TIME', label: t('automations.trigger_time') },
                                                        { value: 'MESSAGES', label: t('automations.trigger_messages') }
                                                    ]} 
                                                    value={slot.triggerType || 'TIME'} 
                                                    onChange={val => updateMessageSlot(index, 'triggerType', val)} 
                                                />
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>{t('automations.trigger_value')}</label>
                                                <div className="pc-input-modern-v2">
                                                    <Activity size={18} style={{ color: 'var(--primary)' }} />
                                                    <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: 700, color: 'var(--text-heading)', outline: 'none' }} value={slot.triggerValue || 60} onChange={e => updateMessageSlot(index, 'triggerValue', parseInt(e.target.value))} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pc-input-group-v2" style={{ marginTop: '28px' }}>
                                            <label>{t('automations.message_text')} {slot.useEmbed && t('automations.message_text_hint')}</label>
                                            <textarea 
                                                className="pc-input-modern-v2"
                                                style={{ minHeight: '100px', resize: 'none' }} 
                                                value={slot.content} 
                                                onChange={e => updateMessageSlot(index, 'content', e.target.value)} 
                                                placeholder={t('automations.message_placeholder')} 
                                            />
                                        </div>
                                    </div>
                                ))}
                                {(config.autoMessage?.slots || []).length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '120px 20px', color: 'var(--text-dim)', background: 'var(--bg-badge)', borderRadius: '32px', border: '2px dashed var(--border)' }}>
                                        <MessageCircle size={56} style={{ margin: '0 auto 24px', opacity: 0.2, color: '#f59e0b' }} />
                                        <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{t('automations.no_broadcast')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {editingEmbedIndex !== null && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <header style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <button onClick={() => setEditingEmbedIndex(null)} className="pc-btn-back-v2">
                            <ChevronLeft size={22} />
                        </button>
                        <div className="v-stack">
                            <h2 style={{ margin: 0, fontFamily: 'Inter', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-heading)' }}>{t('automations.designer_title', { index: editingEmbedIndex + 1 })}</h2>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t('automations.designer_desc')}</p>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-card)', padding: '12px 24px', borderRadius: '20px', border: '1.5px solid var(--border)' }}>
                            <div className="v-stack" style={{ alignItems: 'flex-end' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-heading)' }}>{t('automations.use_graphic')}</span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700 }}>{t('automations.replace_plain')}</span>
                            </div>
                            <label className="pc-toggle-v2 mini">
                                <input type="checkbox" checked={!!config.autoMessage.slots[editingEmbedIndex].useEmbed} onChange={e => updateMessageSlot(editingEmbedIndex, 'useEmbed', e.target.checked)} />
                                <span className="pc-slider-v2"></span>
                            </label>
                        </div>
                    </header>

                    <section className="pc-card-v2 animate slide-up" style={{ padding: '40px' }}>
                         <div className="card-body-v2">
                             {config.autoMessage.slots[editingEmbedIndex].useEmbed ? (
                                <div className="fade-in">
                                    <EmbedEditor 
                                        embed={config.autoMessage.slots[editingEmbedIndex].embed || {}} 
                                        onChange={val => {
                                            const newSlots = [...config.autoMessage.slots];
                                            newSlots[editingEmbedIndex].embed = val;
                                            setConfig({...config, autoMessage: {...config.autoMessage, slots: newSlots}});
                                        }}
                                        variables={['guild', 'member_count', 'date', 'time', 'channel']}
                                    />
                                </div>
                             ) : (
                                <div style={{ textAlign: 'center', padding: '140px 20px', color: 'var(--text-dim)', background: 'var(--bg-badge)', borderRadius: '32px', border: '3px dashed var(--border)' }}>
                                    <Terminal size={64} style={{ margin: '0 auto 24px', opacity: 0.2 }} />
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: 'var(--text-heading)', fontWeight: 700 }}>{t('automations.designer_standby_title')}</h4>
                                    <p style={{ fontWeight: 700, fontSize: '1rem', maxWidth: '400px', margin: '0 auto' }}>{t('automations.designer_standby_desc')}</p>
                                </div>
                             )}
                         </div>
                    </section>
                </div>
            )}

            {activeTab === 'system_messages' && (
                <div className="v-stack animate slide-up">
                    <SystemMessagesSection 
                        config={config}
                        onUpdate={setConfig}
                        messages={[
                            { key: 'clear_success', label: t('automations.msg_clear_success'), placeholder: t('automations.msg_clear_success') },
                            { key: 'broadcast_sent', label: t('automations.msg_broadcast_sent'), placeholder: t('automations.msg_broadcast_sent') }
                        ]}
                    />
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1650px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #fff; }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Inter', sans-serif; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 6px; font-size: 0.6rem; font-weight: 700; padding: 4px 10px; border-radius: 100px;  width: fit-content; }
            .pc-status-tag-v2.on { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: var(--text-muted); }
            .status-dot-v2 { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }

            /* Premium Banner */
            .pc-premium-banner-v2 { display: flex; align-items: center; gap: 24px; background: var(--bg-badge); color: #1e40af; padding: 24px 32px; border-radius: 28px; border: 1.5px solid var(--border); box-shadow: 0 10px 25px rgba(59, 130, 246, 0.08); }
            .pc-btn-upgrade-v2 { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; }
            .pc-btn-upgrade-v2:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 6px; background: var(--bg-badge); padding: 5px; border-radius: 18px; width: fit-content; overflow-x: auto; max-width: 100%; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; font-size: 0.9rem; border-radius: 14px; cursor: pointer; transition: 0.2s; white-space: nowrap; }
            .pc-tabs-v2 button.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .pc-tab-badge-v2 { background: var(--primary); color: #fff; font-size: 0.65rem; padding: 1px 6px; border-radius: 100px; margin-left: 4px; }

            /* Card V2 */
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; background: var(--bg-badge); color: var(--primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.3rem; font-weight: 700; color: var(--text-heading); }

            .pc-btn-add-v2 { background: var(--bg-badge); color: var(--text-heading); border: 1.5px solid var(--border); padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
            .pc-btn-add-v2:hover { background: var(--bg-card); border-color: var(--primary); color: var(--primary); transform: translateY(-2px); }

            /* Sub Cards */
            .pc-sub-card-v2 { background: var(--bg-badge); padding: 24px; border-radius: 20px; border: 1.5px solid var(--border); }
            .pc-sub-card-v2:hover { border-color: var(--primary); box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
            .pc-status-tag-mini-v2 { font-size: 0.6rem; font-weight: 700; padding: 4px 10px; border-radius: 8px; }

            .pc-btn-delete-mini { width: 44px; height: 44px; border-radius: 14px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
            .pc-btn-delete-mini:hover { background: #ef4444; color: #fff; transform: rotate(8deg); }

            .pc-btn-studio-v2 { background: var(--bg-card); color: var(--text-muted); border: 1.5px solid var(--border); padding: 10px 18px; border-radius: 12px; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
            .pc-btn-studio-v2:hover:not(:disabled) { border-color: #7c3aed; color: #7c3aed; background: rgba(124,58,237,0.08); }
            .pc-btn-studio-v2.active { background: #7c3aed; color: #fff; border-color: #7c3aed; }

            .pc-btn-back-v2 { width: 52px; height: 52px; border-radius: 16px; border: 1.5px solid var(--border); background: var(--bg-card); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
            .pc-btn-back-v2:hover { border-color: var(--primary); color: var(--primary); background: rgba(var(--primary-rgb), 0.08); }

            /* Toggle V2 */

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; }

            .pc-input-modern-v2 { width: 100%; background: var(--bg-badge); border: 1.5px solid var(--border); border-radius: 14px; padding: 12px 16px; font-weight: 700; color: var(--text-heading); outline: none; transition: 0.2s; display: flex; align-items: center; gap: 12px; }
            .pc-input-modern-v2:focus-within { border-color: var(--primary); }
            .pc-input-modern-v2 input { width: 100%; background: transparent; border: none; font-weight: 700; color: var(--text-heading); outline: none; }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-sub-card-v2, :global(.light-theme) .pc-btn-back-v2 { box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
