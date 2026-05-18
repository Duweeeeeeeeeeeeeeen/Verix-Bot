import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, Ticket, Settings2, Shield, Plus, MessageSquare, Trash2, 
    ChevronRight, CheckCircle2, Layout, Clock, UserPlus, FileText,
    RotateCcw, Send, GripVertical, AlertCircle
} from 'lucide-react';
import { DiscordSelector, CustomSelect, SystemMessagesSection } from '../../../components/LazyConfigComponents';
import EmojiInput from '../../../components/EmojiInput';
import { mergeConfig } from '../../../utils/defaults';
import Head from 'next/head';

export default function TicketConfig() {
  const router = useRouter();
  const { t } = useT();
  const { guildId } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [], categories: [] });
  const [activeTab, setActiveTab] = useState('settings');
  const [mounted, setMounted] = useState(false);
  const [sendingPanel, setSendingPanel] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && guildId !== 'undefined' && mounted) fetchData();
  }, [guildId, mounted]);

  const fetchData = async () => {
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [configRes, discordRes] = await Promise.all([
        api.request(`/config/${guildId}/tickets`).catch(() => ({ enabled: false })),
        api.request(`/config/${guildId}/discord-data`).catch(() => ({ roles: [], channels: [], categories: [] }))
      ]);
      
      const rawConfig = configRes?.data || configRes || { enabled: false };
      setConfig(mergeConfig(rawConfig, 'tickets'));
      
      if (discordRes) {
        setDiscordData({
          roles: discordRes.roles || [],
          channels: discordRes.channels?.filter(c => c.type === 0 || c.type === 5) || [],
          categories: discordRes.channels?.filter(c => c.type === 4) || []
        });
      }
    } catch (e) {
      if (!api.isAuthError(e)) {
        console.error("Ticket config load error:", e);
      }
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/tickets`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast(t('tickets.sync_success'));
    } catch (e) {
      showToast(t('common.error'), 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleSendPanel = async () => {
    if (!config.panelChannelId) return showToast(t('tickets.panel_no_channel') || 'Seleziona prima un canale per il pannello.', 'error');
    setSendingPanel(true);
    try {
        await handleSave();
        await api.request(`/config/${guildId}/tickets/send-panel`, { method: 'POST' });
        showToast(t('tickets.panel_success') || 'Pannello ticket inviato correttamente!');
    } catch (e) {
        showToast(t('tickets.panel_error') || 'Errore durante l\'invio del pannello.', 'error');
    } finally {
        setSendingPanel(false);
    }
  };

  const handleReset = async () => {
    if (!confirm(t('common.reset_confirm'))) return;
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const res = await api.request(`/config/${guildId}/tickets/reset`, { method: 'POST' });
      if (res.success) {
        setConfig(mergeConfig(res.data, 'tickets'));
        showToast(t('common.reset_success'));
      }
    } catch (e) {
      showToast(t('common.reset_error'), 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const addTicketType = () => {
    const id = 'type_' + Date.now();
    setConfig({
      ...config,
      types: [...(config.types || []), id],
      typesConfig: {
        ...(config.typesConfig || {}),
        [id]: { label: t('tickets.new_ticket_default'), emoji: '🎫', categoryId: '', welcomeMessage: t('tickets.welcome_message_default') }
      }
    });
  };

  const removeTicketType = (id) => {
    const newTypes = config.types.filter(tid => tid !== id);
    const newConfig = { ...config.typesConfig };
    delete newConfig[id];
    setConfig({ ...config, types: newTypes, typesConfig: newConfig });
  };

  const addCannedResponse = () => {
    setConfig({
      ...config,
      cannedResponses: [...(config.cannedResponses || []), { label: '', content: '' }]
    });
  };

  const removeCannedResponse = (index) => {
    const newResponses = [...config.cannedResponses];
    newResponses.splice(index, 1);
    setConfig({ ...config, cannedResponses: newResponses });
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('tickets.title')} | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
                    <Ticket size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('tickets.title')}</h1>
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
                <button 
                    className="pc-btn-outline-v2" 
                    onClick={handleSendPanel} 
                    disabled={sendingPanel || !config.panelChannelId} 
                    title={t('tickets.send_panel') || 'Invia Panel Ticket'}
                    style={{ color: 'var(--primary)', borderColor: sendingPanel ? 'var(--border)' : 'rgba(var(--primary-rgb), 0.2)' }}
                >
                    {sendingPanel ? <RotateCcw size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('common.save_changes')}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-v2" style={{ marginBottom: '32px' }}>
            <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                <Settings2 size={16} /> <span>{t('tickets.base_config')}</span>
            </button>
            <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>
                <Layout size={16} /> <span>{t('tickets.categories')}</span>
            </button>
            <button className={activeTab === 'responses' ? 'active' : ''} onClick={() => setActiveTab('responses')}>
                <MessageSquare size={16} /> <span>{t('tickets.canned')}</span>
            </button>
            <button className={activeTab === 'system_messages' ? 'active' : ''} onClick={() => setActiveTab('system_messages')}>
                <Settings2 size={16} /> <span>{t('common.tab_system_messages')}</span>
            </button>
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'settings' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 560px', gap: '32px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2">
                                <div className="header-icon"><Shield size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('tickets.perms_title')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>{t('tickets.support_roles')}</label>
                                        <DiscordSelector type="role" multiple={true} options={discordData.roles} value={config.staffRoleIds || []} onChange={v => setConfig({...config, staffRoleIds: v})} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('tickets.panel_channel') || 'Canale Pannello'}</label>
                                        <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 0 || c.type === 5)} value={config.panelChannelId} onChange={v => setConfig({...config, panelChannelId: v})} />
                                    </div>
                                </div>
                                <div className="pc-input-group-v2" style={{ marginTop: '24px' }}>
                                    <label>{t('tickets.log_channel')}</label>
                                    <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 0 || c.type === 5)} value={config.logChannelId} onChange={v => setConfig({...config, logChannelId: v})} />
                                    <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('tickets.log_channel_help')}</p>
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="card-header-v2">
                                <div className="header-icon"><Clock size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('tickets.auto_close')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-toggle-card-v2">
                                    <div className="v-stack">
                                        <strong>{t('tickets.auto_close_toggle')}</strong>
                                        <span>{t('tickets.auto_close_desc')}</span>
                                    </div>
                                    <label className="pc-toggle-v2 mini">
                                        <input type="checkbox" checked={config.autoCloseEnabled} onChange={e => setConfig({...config, autoCloseEnabled: e.target.checked})} />
                                        <span className="pc-slider-v2"></span>
                                    </label>
                                </div>
                                {config.autoCloseEnabled && (
                                    <div className="pc-input-group-v2 animate slide-up" style={{ marginTop: '24px' }}>
                                        <label>{t('tickets.inactivity_hours')}</label>
                                        <input className="pc-input-modern-v2" type="number" value={config.autoCloseHours || 24} onChange={e => setConfig({...config, autoCloseHours: parseInt(e.target.value)})} min="1" max="168" />
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon"><FileText size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('tickets.transcripts')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-toggle-card-v2">
                                    <div className="v-stack">
                                        <strong>{t('tickets.transcript_toggle')}</strong>
                                        <span>{t('tickets.transcript_desc')}</span>
                                    </div>
                                    <label className="pc-toggle-v2 mini">
                                        <input type="checkbox" checked={config.transcriptEnabled} onChange={e => setConfig({...config, transcriptEnabled: e.target.checked})} />
                                        <span className="pc-slider-v2"></span>
                                    </label>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            )}

            {activeTab === 'categories' && (
                <div className="v-stack animate slide-up">
                    <section className="pc-card-v2">
                        <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                            <div className="header-icon"><Layout size={20} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>{t('tickets.categories')}</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('tickets.categories_desc')}</p>
                            </div>
                            <button className="pc-btn-primary" onClick={addTicketType}>
                                <Plus size={20} /> <span>{t('common.add')}</span>
                            </button>
                        </div>
                        <div className="card-body-v2">
                            <div className="v-stack" style={{ gap: '24px' }}>
                                { (config.types || []).map((id) => (
                                    <div key={id} className="pc-sub-card-v2 animate slide-up">
                                        <div className="pc-bb-content" style={{ padding: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                                <input className="pc-input-ghost-v2" value={config.typesConfig[id]?.label || ''} onChange={e => {
                                                    const newTypes = { ...config.typesConfig };
                                                    newTypes[id] = { ...newTypes[id], label: e.target.value };
                                                    setConfig({ ...config, typesConfig: newTypes });
                                                }} placeholder={t('tickets.cat_title_placeholder')} />
                                                <button onClick={() => removeTicketType(id)} className="pc-btn-icon-danger-v2"><Trash2 size={20} /></button>
                                            </div>
                                            
                                            <div className="pc-bb-columns">
                                                <div className="pc-bb-col" style={{ width: '80px' }}>
                                                    <label>{t('common.emoji')}</label>
                                                    <div className="pc-bb-emoji-box">
                                                        <EmojiInput value={config.typesConfig[id]?.emoji || '🎫'} hideInput={true} onChange={e => {
                                                            const newTypes = { ...config.typesConfig };
                                                            newTypes[id] = { ...newTypes[id], emoji: e.target.value };
                                                            setConfig({ ...config, typesConfig: newTypes });
                                                        }} />
                                                    </div>
                                                </div>
                                                <div className="pc-bb-col">
                                                    <label>{t('tickets.target_category')}</label>
                                                    <DiscordSelector type="channel" options={discordData.categories} value={config.typesConfig[id]?.categoryId || ''} onChange={v => {
                                                        const newTypes = { ...config.typesConfig };
                                                        newTypes[id] = { ...newTypes[id], categoryId: v };
                                                        setConfig({ ...config, typesConfig: newTypes });
                                                    }} />
                                                    <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('tickets.target_category_help')}</p>
                                                </div>
                                            </div>

                                            <div className="pc-input-group-v2" style={{ marginTop: '24px' }}>
                                                <label>{t('tickets.welcome_message')}</label>
                                                <textarea 
                                                    className="pc-input-modern-v2" 
                                                    style={{ minHeight: '80px', width: '100%', resize: 'vertical' }}
                                                    value={config.typesConfig[id]?.welcomeMessage || ''}
                                                    onChange={e => {
                                                        const newTypes = { ...config.typesConfig };
                                                        newTypes[id] = { ...newTypes[id], welcomeMessage: e.target.value };
                                                        setConfig({ ...config, typesConfig: newTypes });
                                                    }}
                                                    placeholder={t('tickets.custom_welcome_placeholder')}
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

            {activeTab === 'responses' && (
                <div className="v-stack animate slide-up">
                    <section className="pc-card-v2">
                        <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                            <div className="header-icon"><MessageSquare size={20} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>{t('tickets.canned')}</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('tickets.canned_desc')}</p>
                            </div>
                            <button className="pc-btn-primary" onClick={addCannedResponse}>
                                <Plus size={20} /> <span>{t('common.add')}</span>
                            </button>
                        </div>
                        <div className="card-body-v2">
                            <div className="v-stack" style={{ gap: '24px' }}>
                                {(config.cannedResponses || []).length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-badge)', borderRadius: '20px', border: '1.5px dashed var(--border)' }}>
                                        <MessageSquare size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 700 }}>{t('tickets.canned_empty')}</p>
                                    </div>
                                ) : (
                                    (config.cannedResponses || []).map((res, index) => (
                                        <div key={index} className="pc-sub-card-v2 animate slide-up">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                                <input className="pc-input-ghost-v2" value={res.label || ''} onChange={e => {
                                                    const newRes = [...config.cannedResponses];
                                                    newRes[index] = { ...res, label: e.target.value };
                                                    setConfig({ ...config, cannedResponses: newRes });
                                                }} placeholder={t('tickets.cat_title_placeholder')} />
                                                <button onClick={() => removeCannedResponse(index)} className="pc-btn-icon-danger-v2"><Trash2 size={20} /></button>
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>{t('tickets.canned_responses')}</label>
                                                <textarea className="pc-input-modern-v2" style={{ minHeight: '100px', width: '100%', resize: 'vertical' }} value={res.content || ''} onChange={e => {
                                                    const newRes = [...config.cannedResponses];
                                                    newRes[index] = { ...res, content: e.target.value };
                                                    setConfig({ ...config, cannedResponses: newRes });
                                                }} placeholder={t('tickets.canned_placeholder')} />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
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
                            { key: 'cooldown', label: t('tickets.msg_cooldown'), placeholder: t('tickets.msg_cooldown_placeholder') },
                            { key: 'limit_reached', label: t('tickets.msg_limit'), placeholder: t('tickets.msg_limit_placeholder') },
                            { key: 'already_open', label: t('tickets.msg_already_open'), placeholder: t('tickets.msg_already_open_placeholder') },
                            { key: 'no_perms', label: t('tickets.msg_no_perms'), placeholder: t('tickets.msg_no_perms_placeholder') }
                        ]}
                    />
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1500px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
