import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import { DiscordSelector, CustomSelect, EmbedMessageManager, SystemMessagesSection, HelpTooltip } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, ShieldCheck, Settings2, Palette, MousePointer2, CheckCircle2, 
    Shield, Send, GripVertical, RotateCcw
} from 'lucide-react';
import EmojiInput from '../../../components/EmojiInput';
import { mergeConfig } from '../../../utils/defaults';
import Head from 'next/head';

export default function VerifyConfig() {
  const router = useRouter();
  const { t } = useT();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [], botHighestPosition: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingPanel, setSendingPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = async () => {
    if (!guildId || guildId === 'undefined' || !mounted) return;
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [configRes, discordRes] = await Promise.all([
        api.request(`/config/${guildId}/verify`).catch(() => ({ data: {} })),
        api.request(`/config/${guildId}/discord-data`).catch(() => ({ roles: [], channels: [], botHighestPosition: 0 }))
      ]);

      const data = configRes.data || configRes || {};
      setConfig(mergeConfig(data, 'verify'));
      
      const dData = discordRes.data || discordRes || {};
      setDiscordData({
        roles: dData.roles || [],
        channels: (dData.channels || []).filter(c => c.type === 0 || c.type === 5),
        botHighestPosition: dData.botHighestPosition || 0
      });
    } catch (error) {
      console.error("Verify config load error:", error);
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  useEffect(() => {
    loadData();
  }, [guildId, mounted]);

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const getRoleError = (roleId) => {
    if (!roleId) return null;
    const role = discordData.roles.find(r => r.id === roleId);
    if (role && role.position >= discordData.botHighestPosition) {
        return t('verify.hierarchy_error');
    }
    return null;
  };

  const setNested = (path, value) => {
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

  const handleReset = async () => {
    if (!confirm(t('common.reset_confirm'))) return;
    
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const res = await api.request(`/config/${guildId}/verify/reset`, { method: 'POST' });
      if (res.success) {
        setConfig(mergeConfig(res.data, 'verify'));
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
      await api.request(`/config/${guildId}/verify`, { method: 'POST', body: JSON.stringify(config) });
      showToast(t('verify.sync_success'));
    } catch (error) {
      showToast(t('common.save_error'), 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleSendPanel = async () => {
    if (!config.channelId) return showToast(t('verify.select_channel_error'), 'error');
    setSendingPanel(true);
    try {
        await handleSave();
        await api.request(`/config/${guildId}/verify/send-panel`, { method: 'POST' });
        showToast(t('verify.panel_sent_success'));
    } catch (error) {
        showToast(t('verify.panel_sent_error'), 'error');
    } finally {
        setSendingPanel(false);
    }
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('verify.title')} | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
                    <ShieldCheck size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('verify.title')}</h1>
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
                    disabled={sendingPanel || !config.channelId} 
                    title={t('verify.send_panel')}
                    style={{ color: 'var(--primary)', borderColor: sendingPanel ? 'var(--border)' : 'rgba(var(--primary-rgb), 0.2)' }}
                >
                    {sendingPanel ? <RotateCcw size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('common.sync')}</span>
                </button>
            </div>
        </header>

        {/* V2 Tabs */}
        <nav className="pc-tabs-v2" style={{ marginBottom: '32px' }}>
            <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                <Settings2 size={16} /> <span>{t('verify.base_config')}</span>
            </button>
            <button className={activeTab === 'design' ? 'active' : ''} onClick={() => setActiveTab('design')}>
                <Palette size={16} /> <span>{t('verify.design_studio')}</span>
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
                                <h3 style={{ margin: 0 }}>{t('whitelist.auto_roles')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <div className="pc-label-row">
                                            <label>{t('verify.role_to_assign')}</label>
                                            <HelpTooltip text={t('verify.role_to_assign_help')} />
                                        </div>
                                        <DiscordSelector type="role" options={discordData.roles} value={config.roleId} onChange={v => setNested('roleId', v)} error={getRoleError(config.roleId)} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <div className="pc-label-row">
                                            <label>{t('verify.publish_channel')}</label>
                                            <HelpTooltip text={t('verify.publish_channel_help')} />
                                        </div>
                                        <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 0 || c.type === 5)} value={config.channelId} onChange={v => setNested('channelId', v)} />
                                    </div>
                                    <div className="pc-input-group-v2" style={{ gridColumn: 'span 2', marginTop: '16px' }}>
                                        <label>{t('verify.role_to_remove')}</label>
                                        <DiscordSelector type="role" options={discordData.roles} value={config.removeRoleId} onChange={v => setNested('removeRoleId', v)} placeholder={t('common.none')} />
                                        <p className="pc-hint-v2" style={{ marginTop: '8px' }}>{t('verify.remove_hint')}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="pc-info-banner-v2 orange">
                            <ShieldCheck size={20} />
                            <p>{t('verify.hierarchy_warn')}</p>
                        </div>
                    </div>

                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon"><Shield size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('verify.log_audit')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-toggle-card-v2">
                                    <strong>{t('verify.active_tracking')}</strong>
                                    <label className="pc-toggle-v2 mini">
                                        <input type="checkbox" checked={!!config.logEnabled} onChange={e => setNested('logEnabled', e.target.checked)} />
                                        <span className="pc-slider-v2"></span>
                                    </label>
                                </div>
                                {config.logEnabled && (
                                    <div className="pc-input-group-v2 animate slide-up" style={{ marginTop: '24px' }}>
                                        <label>{t('verify.log_channel')}</label>
                                        <DiscordSelector type="channel" options={discordData.channels} value={config.logChannelId} onChange={v => setNested('logChannelId', v)} />
                                    </div>
                                )}
                            </div>
                        </section>

                        <div className="pc-card-v2" style={{ textAlign: 'center', background: 'var(--bg-badge)', border: '1.5px dashed var(--border)' }}>
                            <Send size={32} style={{ color: 'var(--primary)', marginBottom: '16px', opacity: 0.5 }} />
                            <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-heading)' }}>{t('verify.send_panel')}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0' }}>
                                {t('verify.header_send_hint')}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'design' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <EmbedMessageManager 
                        guildId={guildId}
                        module="verify"
                        slugs={[
                            { 
                                key: 'panel', 
                                label: t('verify.panel_id_label'), 
                                description: t('verify.panel_id_desc'), 
                                variables: ['user', 'guild'], 
                                group: 'UI', 
                                groupIcon: Palette,
                                extra: (
                                    <section className="pc-card-v2 animate slide-up" style={{ marginTop: '32px' }}>
                                        <div className="card-header-v2">
                                            <div className="header-icon"><MousePointer2 size={18} /></div>
                                            <h3 style={{ margin: 0 }}>{t('verify.button_branding')}</h3>
                                        </div>
                                        <div className="card-body-v2">
                                            <div className="pc-button-builder">
                                                <div className="pc-bb-left">
                                                    <GripVertical size={20} color="rgba(255,255,255,0.2)" />
                                                </div>
                                                <div className="pc-bb-content">
                                                    <div className="pc-bb-top-row">
                                                        <div className={`pc-bb-preview ${config.buttons?.verify?.style || 'PRIMARY'}`}>
                                                            <span>{config.buttons?.verify?.emoji || '✅'}</span>
                                                            <span>{config.buttons?.verify?.label || t('verify.btn_default')}</span>
                                                        </div>
                                                    </div>

                                                    <div className="pc-bb-columns">
                                                        <div className="pc-bb-col">
                                                            <label>{t('common.emoji')}</label>
                                                            <div className="pc-bb-emoji-box">
                                                                <EmojiInput value={config.buttons?.verify?.emoji || '✅'} hideInput={true} onChange={e => setNested('buttons.verify.emoji', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="pc-bb-col">
                                                            <label>{t('verify.btn_text')}</label>
                                                            <div className="pc-bb-input-box">
                                                                <input value={config.buttons?.verify?.label || ''} onChange={e => setNested('buttons.verify.label', e.target.value)} placeholder={t('verify.btn_default')} />
                                                            </div>
                                                        </div>
                                                        <div className="pc-bb-col">
                                                            <label>{t('common.color')}</label>
                                                            <div className="pc-bb-color-picker">
                                                                {['PRIMARY', 'SUCCESS', 'DANGER', 'SECONDARY'].map(styleOption => (
                                                                    <div 
                                                                        key={styleOption}
                                                                        className={`pc-bb-swatch swatch-${styleOption} ${(config.buttons?.verify?.style || 'PRIMARY') === styleOption ? 'active' : ''}`}
                                                                        onClick={() => setNested('buttons.verify.style', styleOption)}
                                                                    >
                                                                        {(config.buttons?.verify?.style || 'PRIMARY') === styleOption && <CheckCircle2 size={12} color="#fff" />}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                )
                            },
                            { key: 'success', label: t('verify.success_label'), description: t('verify.success_desc'), variables: ['user', 'guild'], group: 'UI', groupIcon: CheckCircle2 }
                        ]}
                    />

                </div>
            )}

            {activeTab === 'system_messages' && (
                <div className="v-stack animate slide-up">
                    <SystemMessagesSection 
                        config={config}
                        onUpdate={setConfig}
                        messages={[
                            { key: 'success', label: t('verify.msg_success'), placeholder: t('verify.msg_success_placeholder') },
                            { key: 'error', label: t('verify.msg_error'), placeholder: t('verify.msg_error_placeholder') },
                            { key: 'pending', label: t('verify.msg_pending'), placeholder: t('verify.msg_pending_placeholder') }
                        ]}
                    />
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1500px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: var(--bg-badge); color: var(--text-muted); border: 1.5px solid var(--border); padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: rgba(var(--primary-rgb), 0.1); color: var(--primary); border-color: rgba(var(--primary-rgb), 0.2); }
            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
