import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
  Save, Ticket, Clock, Plus, Trash2, Power, Settings2, Info, ChevronRight, MessageSquare, 
  Type, Hash, Shield, Palette, Layers, Archive, FileText, XCircle, CheckCircle2, Zap, Send, 
  Users, ShieldAlert, BarChart3, Lock, Crown, Trash, ArrowRight, Sparkles, Star, Layout, 
  Terminal, BellRing, Globe, MessageCircle, Timer, Activity, MousePointer2, Play,
  Settings, LineChart, ShieldCheck, Mail, History, LifeBuoy
} from 'lucide-react';
import { DiscordSelector, CustomSelect, EmbedMessageManager } from '../../../components/LazyConfigComponents';
import EmojiInput from '../../../components/EmojiInput';
import { mergeConfig } from '../../../utils/defaults';
import Head from 'next/head';

export default function TicketConfig() {
  const router = useRouter();
  const { t } = useT();
  const { guildId } = router.query;
  
  const [activeTab, setActiveTab] = useState('settings');
  const [config, setConfig] = useState(null);
  const [globalConfig, setGlobalConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingPanel, setSendingPanel] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [guildData, setGuildData] = useState(null);
  const [blacklistInput, setBlacklistInput] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = async () => {
    if (!guildId || !mounted) return;
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [data, globalData, discordRes, guildRes] = await Promise.all([
        api.request(`/config/${guildId}/tickets`).catch(() => ({ data: {} })),
        api.request(`/config/${guildId}/global`).catch(() => ({ data: {} })),
        api.request(`/config/${guildId}/discord-data`).catch(() => ({ roles: [], channels: [] })),
        api.request(`/config/${guildId}/guild`).catch(() => ({ data: {} }))
      ]);

      const moduleConfig = mergeConfig(data?.data || data || {}, 'tickets');
      const globalConfigData = globalData?.data || globalData || {};
      
      setConfig(moduleConfig);
      setGlobalConfig(globalConfigData);
      setDiscordData(discordRes?.data || discordRes || { roles: [], channels: [] });
      setGuildData(guildRes?.data || guildRes || {});
    } catch (err) {
      console.error("Ticket data load error:", err);
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  useEffect(() => {
    loadData();
  }, [guildId, mounted]);

  const handleSave = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await Promise.all([
        api.request(`/config/${guildId}/tickets`, { method: 'POST', body: JSON.stringify(config) }),
        api.request(`/config/${guildId}/global`, { method: 'POST', body: JSON.stringify(globalConfig) })
      ]);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('tickets.sync_success'), type: 'success' } }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.save_error'), type: 'error' } }));
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleSendPanel = async () => {
    if (!config.panelChannelId) return window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('tickets.panel_no_channel'), type: 'error' } }));
    setSendingPanel(true);
    try {
      await handleSave();
      await api.request(`/config/${guildId}/tickets/send-panel`, { method: 'POST' });
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('tickets.panel_success'), type: 'success' } }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('tickets.panel_error'), type: 'error' } }));
    } finally {
      setSendingPanel(false);
    }
  };

  const setGlobalNested = (path, value) => {
    setGlobalConfig(prev => {
        const newGlobal = { ...prev };
        const parts = path.split('.');
        let cur = newGlobal;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!cur[parts[i]]) cur[parts[i]] = {};
            else cur[parts[i]] = { ...cur[parts[i]] };
            cur = cur[parts[i]];
        }
        cur[parts[parts.length - 1]] = value;
        return newGlobal;
    });
  };

  const addCategory = () => {
    const id = `cat_${Math.random().toString(36).substr(2, 5)}`;
    const newTypes = { ...(config.typesConfig || {}) };
    newTypes[id] = { label: 'Nuova Categoria Supporto', emoji: '🎫', color: '#6366f1', style: 'PRIMARY', staffRoleIds: [] };
    setConfig({ ...config, typesConfig: newTypes });
  };

  const addCannedResponse = () => {
    setConfig({
        ...config,
        cannedResponses: [...(config.cannedResponses || []), { label: 'Template Risposta', content: 'Gentile utente, grazie per averci contattato...' }]
    });
  };

  const removeCannedResponse = (index) => {
    const newResponses = [...(config.cannedResponses || [])];
    newResponses.splice(index, 1);
    setConfig({ ...config, cannedResponses: newResponses });
  };

  const addToBlacklist = () => {
    if (!blacklistInput) return;
    setConfig({
        ...config,
        blacklist: [...new Set([...(config.blacklist || []), blacklistInput])]
    });
    setBlacklistInput('');
  };

  const removeFromBlacklist = (userId) => {
    setConfig({
        ...config,
        blacklist: (config.blacklist || []).filter(id => id !== userId)
    });
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
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}>
                    <Ticket size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('tickets.title')}</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? t('tickets.active_tag') : t('tickets.disabled_tag')}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <button 
                  className={`pc-status-toggle-v2 ${config.enabled ? 'active' : ''}`}
                  onClick={() => setConfig({...config, enabled: !config.enabled})}
                >
                  <Power size={18} />
                  <span>{config.enabled ? t('common.online') : t('common.offline')}</span>
                </button>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('tickets.sync_studio')}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-v2" style={{ marginBottom: '32px' }}>
            {[
                { id: 'settings', icon: <Settings2 size={18} />, label: t('tickets.core_config') },
                { id: 'categories', icon: <Layers size={18} />, label: t('tickets.categories'), count: Object.keys(config.typesConfig || {}).length },
                { id: 'automation', icon: <Zap size={18} />, label: t('tickets.automation') },
                { id: 'responses', icon: <MessageSquare size={18} />, label: t('tickets.canned'), count: config.cannedResponses?.length },
                { id: 'blacklist', icon: <ShieldAlert size={18} />, label: t('tickets.blacklist') },
                { id: 'design', icon: <Palette size={18} />, label: t('tickets.design') },
                { id: 'stats', icon: <BarChart3 size={18} />, label: t('tickets.stats') }
            ].map(tab => (
                <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
                    {tab.icon} <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && <span className="pc-tab-badge-v2">{tab.count}</span>}
                </button>
            ))}
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'settings' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Hash size={20} /></div>
                                <h3 style={{ margin: 0 }}>{t('tickets.channels_dest')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2">
                                    <div className="pc-input-group-v2">
                                        <label>{t('tickets.public_panel')}</label>
                                        <DiscordSelector type="channel" options={discordData.channels} value={config.panelChannelId || ''} onChange={val => setConfig({...config, panelChannelId: val})} />
                                    </div>
                                    <div className="pc-input-group-v2" style={{ marginTop: '24px' }}>
                                        <label>{t('tickets.log_transcript')}</label>
                                        <DiscordSelector type="channel" options={discordData.channels} value={config.logChannelId || ''} onChange={val => setConfig({...config, logChannelId: val})} />
                                    </div>
                                    <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                                        <div className="pc-input-group-v2">
                                            <label>{t('tickets.category_open')}</label>
                                            <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 4)} value={config.categoryOpenId || ''} onChange={val => setConfig({...config, categoryOpenId: val})} />
                                        </div>
                                        <div className="pc-input-group-v2">
                                            <label>{t('tickets.close_protocol')}</label>
                                            <CustomSelect 
                                                options={[
                                                    { value: 'DELETE', label: t('tickets.delete') },
                                                    { value: 'MOVE', label: t('tickets.move') }
                                                ]} 
                                                value={config.closeMode || 'DELETE'} 
                                                onChange={val => setConfig({...config, closeMode: val})} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><ShieldCheck size={20} /></div>
                                <h3 style={{ margin: 0 }}>{t('tickets.master_mods')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>Master Moderators Roles</label>
                                    <DiscordSelector type="role" multiple={true} options={discordData.roles} value={config.staffRoleIds || []} onChange={val => setConfig({...config, staffRoleIds: val})} />
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="v-stack" style={{ gap: '32px' }}>
                        <div className="pc-card-v2" style={{ textAlign: 'center', background: 'var(--bg-badge)' }}>
                            <Mail size={32} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
                            <h3 style={{ margin: '0 0 8px 0' }}>{t('tickets.panel_dist')}</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>{t('tickets.panel_dist_desc')}</p>
                            <button className="pc-btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSendPanel} disabled={sendingPanel}>
                                <Send size={18} />
                                <span>{sendingPanel ? t('common.sending') : t('tickets.send_panel')}</span>
                            </button>
                        </div>

                        <div className="pc-toggle-card-v2">
                            <div className="v-stack" style={{ gap: '4px' }}>
                                <strong>Ticket Protocol</strong>
                                <span>{t('tickets.service_active')}</span>
                            </div>
                            <label className="pc-toggle-v2">
                                <input type="checkbox" checked={config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                                <span className="pc-slider-v2"></span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'categories' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                            <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Layers size={20} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>{t('tickets.support_cats')}</h3>
                            </div>
                            <button className="pc-btn-primary" onClick={addCategory}>
                                <Plus size={20} /> <span>{t('common.add')}</span>
                            </button>
                        </div>
                        <div className="card-body-v2">
                            <div className="v-stack" style={{ gap: '16px' }}>
                                {Object.entries(config.typesConfig || {}).map(([id, data]) => (
                                    <div key={id} className="pc-sub-card-v2">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                            <div style={{ width: '44px', height: '44px', background: 'var(--bg-card)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <EmojiInput value={data.emoji || '🎫'} hideInput={true} onChange={e => {
                                                    const newTypes = { ...config.typesConfig };
                                                    newTypes[id] = { ...data, emoji: e.target.value };
                                                    setConfig({ ...config, typesConfig: newTypes });
                                                }} />
                                            </div>
                                            <input className="pc-input-ghost-v2" value={data.label || ''} onChange={e => {
                                                const newTypes = { ...config.typesConfig };
                                                newTypes[id] = { ...data, label: e.target.value };
                                                setConfig({ ...config, typesConfig: newTypes });
                                            }} placeholder={t('tickets.cat_title_placeholder')} />
                                            <button onClick={() => {
                                                const newTypes = { ...config.typesConfig };
                                                delete newTypes[id];
                                                setConfig({ ...config, typesConfig: newTypes });
                                            }} className="pc-btn-icon-danger-v2"><Trash2 size={20} /></button>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <div className="pc-input-group-v2">
                                                <label>{t('tickets.staff_role')}</label>
                                                <DiscordSelector type="role" multiple={true} options={discordData.roles} value={data.staffRoleIds || []} onChange={val => {
                                                    const newTypes = { ...config.typesConfig };
                                                    newTypes[id] = { ...data, staffRoleIds: val };
                                                    setConfig({ ...config, typesConfig: newTypes });
                                                }} />
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>{t('tickets.btn_style')}</label>
                                                <CustomSelect 
                                                    options={[
                                                        { value: 'PRIMARY', label: 'Blurple' },
                                                        { value: 'SUCCESS', label: 'Green' },
                                                        { value: 'DANGER', label: 'Red' },
                                                        { value: 'SECONDARY', label: 'Gray' }
                                                    ]} 
                                                    value={data.style || 'PRIMARY'} 
                                                    onChange={val => {
                                                        const newTypes = { ...config.typesConfig };
                                                        newTypes[id] = { ...data, style: val };
                                                        setConfig({ ...config, typesConfig: newTypes });
                                                    }} 
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

            {activeTab === 'automation' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Terminal size={20} /></div>
                            <h3 style={{ margin: 0 }}>{t('tickets.system_logic')}</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-group-v2">
                                <label>{t('tickets.channel_name_fmt')}</label>
                                <div className="pc-input-modern-v2">
                                    <Type size={18} />
                                    <input value={globalConfig?.naming?.ticket || ''} onChange={e => setGlobalNested('naming.ticket', e.target.value)} placeholder="ticket-{user}" />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'design' && (
                <div className="v-stack animate slide-up">
                    <EmbedMessageManager 
                        guildId={guildId}
                        module="tickets"
                        slugs={[
                            { key: 'panel', label: 'Public Panel Design', description: 'Messaggio nel canale pubblico.', variables: ['guild'], group: 'Entry', groupIcon: Play },
                            { key: 'ticket', label: 'Ticket Welcome Design', description: 'Messaggio all\'interno del ticket.', variables: ['user', 'category'], group: 'Process', groupIcon: MessageSquare }
                        ]}
                    />
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1500px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; color: #fff; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
            .pc-title-row h1 { font-family: 'Inter'; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 6px; font-size: 0.6rem; font-weight: 700; padding: 4px 10px; border-radius: 100px; }
            .pc-status-tag-v2.on { background: rgba(16, 185, 129, 0.1); color: #10b981; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: #ef4444; }
            .status-dot-v2 { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: var(--bg-badge); color: var(--text-muted); border: 1.5px solid var(--border); padding: 10px 20px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; border-color: rgba(139, 92, 246, 0.2); }

            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 6px; background: var(--bg-badge); padding: 5px; border-radius: 18px; width: fit-content; overflow-x: auto; max-width: 100%; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; font-size: 0.9rem; border-radius: 14px; cursor: pointer; transition: 0.2s; white-space: nowrap; }
            .pc-tabs-v2 button.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .pc-tab-badge-v2 { background: var(--primary); color: #fff; font-size: 0.65rem; padding: 1px 6px; border-radius: 100px; margin-left: 4px; }

            /* Card V2 */
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: var(--bg-badge); }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.3rem; font-weight: 700; color: var(--text-heading); }

            /* Sub Card */
            .pc-sub-card-v2 { background: var(--bg-badge); padding: 24px; border-radius: 20px; border: 1.5px solid var(--border); }
            .pc-input-ghost-v2 { border: none; background: transparent; font-size: 1.2rem; font-weight: 700; color: var(--text-heading); outline: none; flex: 1; font-family: 'Inter'; }
            .pc-btn-icon-danger-v2 { width: 40px; height: 40px; border-radius: 12px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }

            /* Inputs */
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; display: block; }
            .pc-input-modern-v2 { display: flex; align-items: center; gap: 12px; background: var(--bg-badge); padding: 10px 16px; border-radius: 14px; border: 1.5px solid var(--border); transition: 0.2s; }
            .pc-input-modern-v2:focus-within { border-color: var(--primary); }
            .pc-input-modern-v2 input { border: none; background: transparent; width: 100%; font-weight: 700; font-size: 1rem; outline: none; color: var(--text-heading); }

            /* Toggle V2 */
            .pc-toggle-card-v2 { background: var(--bg-badge); padding: 20px; border-radius: 20px; border: 1.5px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
            .pc-toggle-card-v2 strong { font-weight: 700; color: var(--text-heading); }
            .pc-toggle-card-v2 span { font-size: 0.75rem; color: var(--text-muted); font-weight: 700; }

            .pc-toggle-v2 { position: relative; width: 40px; height: 20px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: var(--border); transition: .3s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background: #fff; transition: .3s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: var(--primary); }
            input:checked + .pc-slider-v2:before { transform: translateX(20px); }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
