import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import { EmbedMessageManager, DiscordSelector, CustomSelect, SystemMessagesSection } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import {
  Save, ShieldCheck, Settings2, ListChecks, Palette, Plus, Trash2, Power, Clock,
  RefreshCcw, Zap, Command, Mic2, Send, FileText, ChevronLeft, ChevronRight,
  Sparkles, Award, CheckCircle2, XCircle, Layout, RotateCcw, MessageCircle
} from 'lucide-react';
import Head from 'next/head';

export default function WhitelistConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [activeTab, setActiveTab] = useState('settings');
  const [config, setConfig] = useState(null);
  const [bgConfig, setBgConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingPanel, setSendingPanel] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    if (!guildId || !mounted) return;
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [wlRes, bgRes, discordRes] = await Promise.all([
        api.request(`/config/${guildId}/whitelist`),
        api.request(`/config/${guildId}/background`),
        api.request(`/config/${guildId}/discord-data`)
      ]);

      setConfig(wlRes?.data || wlRes);
      setBgConfig(bgRes?.data || bgRes);
      setDiscordData(discordRes?.data || discordRes || { roles: [], channels: [] });
    } catch (err) {
      console.error("Admission data load error:", err);
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [guildId, mounted]);

  const handleSendPanel = async () => {
    if (!config.panelChannelId) return window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('whitelist.panel_channel_error'), type: 'error' } }));
    setSendingPanel(true);
    try {
      await api.request(`/config/${guildId}/whitelist/send-panel`, { method: 'POST' });
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('whitelist.panel_success') || 'Pannello inviato!', type: 'success' } }));
    } catch (e) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('whitelist.panel_error') || 'Errore invio pannello', type: 'error' } }));
    } finally {
      setSendingPanel(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await Promise.all([
        api.request(`/config/${guildId}/whitelist`, { method: 'POST', body: JSON.stringify(config) }),
        api.request(`/config/${guildId}/background`, { method: 'POST', body: JSON.stringify(bgConfig) })
      ]);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('whitelist.sync_success'), type: 'success' } }));
    } catch (error) {
       window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.save_error'), type: 'error' } }));
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleReset = async () => {
    if (!window.confirm(t('common.reset_confirm') || 'Sei sicuro di voler ripristinare questo modulo ai valori di default?')) return;
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      // Whitelist reset also resets background as they are linked in this UI
      const res = await api.request(`/config/${guildId}/whitelist/reset`, { method: 'POST' });
      if (res.success) {
        setConfig(res.data);
        // Refresh background too
        const bgRes = await api.request(`/config/${guildId}/background`);
        setBgConfig(bgRes?.data || bgRes);
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.reset_success') || 'Modulo ripristinato!', type: 'success' } }));
      }
    } catch (error) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.reset_error') || 'Errore durante il reset', type: 'error' } }));
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  const tabs = [
    { id: 'settings', name: t('whitelist.core_setup'), icon: Settings2 },
    { id: 'questions', name: t('whitelist.written_test'), icon: ListChecks },
    (config.mode === 'VOICE' || config.mode === 'HYBRID' || config.mode === 'FULL') ?
      { id: 'voice', name: t('whitelist.tab_voice'), icon: Mic2 } : null,
    { id: 'background', name: t('whitelist.staff_recruits'), icon: Command },
    { id: 'system_messages', name: t('common.system_messages'), icon: MessageCircle },
    { id: 'design', name: t('whitelist.creative_design'), icon: Palette },
  ].filter(Boolean);

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('whitelist.studio_title')} | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
                    <ShieldCheck size={26} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('whitelist.studio_title')}</h1>
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
                    title={t('whitelist.send_panel')}
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

        {/* V2 Tabs */}
        <nav className="pc-tabs-v2" style={{ marginBottom: '32px' }}>
            {tabs.map(tab => (
                <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
                    <tab.icon size={16} /> <span>{tab.name}</span>
                </button>
            ))}
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'settings' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 360px)', gap: '32px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Zap size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('whitelist.structure_title')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2">
                                    <div className="pc-input-group-v2">
                                        <label>{t('whitelist.selection_method')}</label>
                                        <CustomSelect
                                            options={[
                                                { value: 'TEXT', label: t('whitelist.mode_text_only') },
                                                { value: 'VOICE', label: t('whitelist.mode_voice_only') },
                                                { value: 'HYBRID', label: t('whitelist.mode_hybrid_text_voice') },
                                                { value: 'FULL', label: t('whitelist.mode_full_ecosystem') }
                                            ]}
                                            value={config.mode || 'TEXT'}
                                            onChange={val => setConfig({...config, mode: val})}
                                        />
                                    </div>
                                    <div className="pc-input-group-v2" style={{ marginTop: '24px' }}>
                                        <label>{t('whitelist.panel_channel')}</label>
                                        <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 0 || c.type === 5)} value={config.panelChannelId || ''} onChange={val => setConfig({...config, panelChannelId: val})} />
                                    </div>
                                    <div className="pc-input-group-v2" style={{ marginTop: '24px' }}>
                                        <label>{t('whitelist.log_channel')}</label>
                                        <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 0 || c.type === 5)} value={config.logChannelId || ''} onChange={val => setConfig({...config, logChannelId: val})} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: 'var(--bg-badge)', color: '#f59e0b' }}><Clock size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('whitelist.time_limits')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>{t('whitelist.expiration_minutes')}</label>
                                        <div className="pc-input-modern-v2">
                                            <Clock size={16} />
                                            <input type="number" value={config.timeLimit || 30} onChange={e => setConfig({...config, timeLimit: parseInt(e.target.value)})} />
                                        </div>
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('whitelist.cooldown_hours')}</label>
                                        <div className="pc-input-modern-v2">
                                            <RefreshCcw size={16} />
                                            <input type="number" value={config.cooldown || 24} onChange={e => setConfig({...config, cooldown: parseInt(e.target.value)})} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: 'var(--bg-badge)', color: '#10b981' }}><Award size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('whitelist.auto_roles')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>{t('whitelist.roles_to_add')}</label>
                                    <DiscordSelector type="role" multiple={true} options={discordData.roles} value={config.rolesToAddOnTextPass || []} onChange={val => setConfig({...config, rolesToAddOnTextPass: val})} />
                                </div>
                                <div className="pc-input-group-v2" style={{ marginTop: '24px' }}>
                                    <label>{t('whitelist.roles_to_remove')}</label>
                                    <DiscordSelector type="role" multiple={true} options={discordData.roles} value={config.rolesToRemoveOnTextPass || []} onChange={val => setConfig({...config, rolesToRemoveOnTextPass: val})} />
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            )}

            {activeTab === 'questions' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><ListChecks size={18} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>{t('whitelist.questions_bank')}</h3>
                                <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 650 }}>{t('whitelist.questions_desc')}</p>
                            </div>
                            <button className="pc-btn-primary mini-v2" onClick={() => setConfig({...config, questions: [{ text: '', minLength: 30 }, ...(config.questions || [])]})}>
                                <Plus size={16} /> <span>{t('common.add')}</span>
                            </button>
                        </div>
                        <div className="card-body-v2">
                            <div className="v-stack" style={{ gap: '16px' }}>
                                {(config.questions || []).map((q, idx) => (
                                    <div key={idx} className="pc-sub-card-v2">
                                        <div className="v-stack" style={{ gap: '16px' }}>
                                            <div className="pc-input-group-v2">
                                                <label>Domanda #{idx + 1}</label>
                                                <textarea
                                                    className="pc-textarea-v2"
                                                    value={q.text || ''}
                                                    onChange={e => {
                                                        const qs = [...config.questions];
                                                        qs[idx].text = e.target.value;
                                                        setConfig({...config, questions: qs});
                                                    }}
                                                    placeholder={t('automations.placeholder_text')}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div className="v-stack" style={{ gap: '4px' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{t('whitelist.min_characters')}: {q.minLength || 0}</span>
                                                    <input type="range" min="0" max="500" step="10" value={q.minLength || 0} onChange={e => {
                                                        const qs = [...config.questions];
                                                        qs[idx].minLength = parseInt(e.target.value);
                                                        setConfig({...config, questions: qs});
                                                    }} style={{ width: '150px' }} />
                                                </div>
                                                <button className="pc-btn-icon-danger-v2" onClick={() => setConfig({...config, questions: config.questions.filter((_, i) => i !== idx)})}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'background' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <div className="pc-settings-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: 'var(--bg-badge)', color: '#a855f7' }}><Command size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('whitelist.staff_apps')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>{t('whitelist.recruitment_status')}</label>
                                    <div className="pc-toggle-card-v2" style={{ marginTop: '0' }}>
                                        <span>{t('whitelist.enable_apps')}</span>
                                        <label className="pc-toggle-v2">
                                            <input type="checkbox" checked={bgConfig?.enabled} onChange={e => setBgConfig({...bgConfig, enabled: e.target.checked})} />
                                            <span className="pc-slider-v2"></span>
                                        </label>
                                    </div>
                                </div>
                                <div className="pc-input-group-v2" style={{ marginTop: '24px' }}>
                                    <label>{t('whitelist.staff_panel_channel')}</label>
                                    <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 0 || c.type === 5)} value={bgConfig?.panelChannelId || ''} onChange={val => setBgConfig({...bgConfig, panelChannelId: val})} />
                                </div>
                                <div className="pc-input-group-v2" style={{ marginTop: '24px' }}>
                                    <label>{t('whitelist.log_channel')}</label>
                                    <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 0 || c.type === 5)} value={bgConfig?.logChannelId || ''} onChange={val => setBgConfig({...bgConfig, logChannelId: val})} />
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: 'var(--bg-badge)', color: '#10b981' }}><Award size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('whitelist.staff_roles')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>{t('whitelist.staff_eval_roles')}</label>
                                    <DiscordSelector type="role" multiple={true} options={discordData.roles} value={bgConfig?.staffRoleIds || []} onChange={val => setBgConfig({...bgConfig, staffRoleIds: val})} />
                                </div>
                                <div className="pc-input-group-v2" style={{ marginTop: '24px' }}>
                                    <label>{t('whitelist.assign_on_submit')}</label>
                                    <DiscordSelector type="role" options={discordData.roles} value={bgConfig?.roleToAssign || ''} onChange={val => setBgConfig({...bgConfig, roleToAssign: val})} />
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><ListChecks size={18} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>{t('whitelist.questions_bank')} (Staff)</h3>
                                <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 650 }}>{t('whitelist.staff_questions_desc')}</p>
                            </div>
                            <button className="pc-btn-primary mini-v2" onClick={() => setBgConfig({...bgConfig, questions: [{ text: '', minLength: 50 }, ...(bgConfig.questions || [])]})}>
                                <Plus size={16} /> <span>{t('common.add')}</span>
                            </button>
                        </div>
                        <div className="card-body-v2">
                            <div className="v-stack" style={{ gap: '16px' }}>
                                {(bgConfig?.questions || []).map((q, idx) => (
                                    <div key={idx} className="pc-sub-card-v2">
                                        <div className="v-stack" style={{ gap: '16px' }}>
                                            <div className="pc-input-group-v2">
                                                <label>{t('whitelist.question_number', { number: idx + 1 })}</label>
                                                <textarea
                                                    className="pc-textarea-v2"
                                                    value={q.text || ''}
                                                    onChange={e => {
                                                        const qs = [...bgConfig.questions];
                                                        qs[idx].text = e.target.value;
                                                        setBgConfig({...bgConfig, questions: qs});
                                                    }}
                                                    placeholder={t('whitelist.staff_questions_placeholder')}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div className="v-stack" style={{ gap: '4px' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{t('whitelist.min_characters')}: {q.minLength || 0}</span>
                                                    <input type="range" min="0" max="1000" step="50" value={q.minLength || 0} onChange={e => {
                                                        const qs = [...bgConfig.questions];
                                                        qs[idx].minLength = parseInt(e.target.value);
                                                        setBgConfig({...bgConfig, questions: qs});
                                                    }} style={{ width: '150px' }} />
                                                </div>
                                                <button className="pc-btn-icon-danger-v2" onClick={() => setBgConfig({...bgConfig, questions: bgConfig.questions.filter((_, i) => i !== idx)})}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'voice' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <div className="pc-settings-grid-v2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 360px)', gap: '32px' }}>
                        <div className="v-stack" style={{ gap: '32px' }}>
                            <section className="pc-card-v2">
                                <div className="card-header-v2">
                                    <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Mic2 size={18} /></div>
                                    <h3 style={{ margin: 0 }}>{t('whitelist.voice_config_title')}</h3>
                                </div>
                                <div className="card-body-v2">
                                    <div className="pc-input-grid-v2">
                                        <div className="pc-input-group-v2">
                                            <label>{t('whitelist.voice_category')}</label>
                                            <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 4)} value={config.voiceCategoryId || ''} onChange={val => setConfig({...config, voiceCategoryId: val})} />
                                        </div>
                                        <div className="pc-input-group-v2" style={{ marginTop: '24px' }}>
                                            <label>{t('whitelist.voice_name_template')}</label>
                                            <div className="pc-input-modern-v2">
                                                <Layout size={16} />
                                                <input value={config.voiceNameTemplate || 'whitelist-{user}'} onChange={e => setConfig({...config, voiceNameTemplate: e.target.value})} placeholder="whitelist-{user}" />
                                            </div>
                                            <p className="pc-text-v2-caption-bold" style={{ marginTop: '8px', opacity: 0.6 }}>{t('whitelist.voice_help_template')}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="pc-card-v2">
                                <div className="card-header-v2">
                                    <div className="header-icon" style={{ background: 'var(--bg-badge)', color: '#f59e0b' }}><Clock size={18} /></div>
                                    <h3 style={{ margin: 0 }}>{t('whitelist.voice_auto_cooldown')}</h3>
                                </div>
                                <div className="card-body-v2">
                                    <div className="v-stack" style={{ gap: '24px' }}>
                                        <div className="pc-toggle-card-v2">
                                            <div className="v-stack">
                                                <strong>{t('whitelist.voice_auto_delete')}</strong>
                                                <span>{t('whitelist.voice_auto_delete_desc')}</span>
                                            </div>
                                            <label className="pc-toggle-v2">
                                                <input type="checkbox" checked={config.voiceAutoDelete} onChange={e => setConfig({...config, voiceAutoDelete: e.target.checked})} />
                                                <span className="pc-slider-v2"></span>
                                            </label>
                                        </div>
                                        <div className="pc-toggle-card-v2">
                                            <div className="v-stack">
                                                <strong>{t('whitelist.voice_ping_staff')}</strong>
                                                <span>{t('whitelist.voice_ping_staff_desc')}</span>
                                            </div>
                                            <label className="pc-toggle-v2">
                                                <input type="checkbox" checked={config.voicePingStaff} onChange={e => setConfig({...config, voicePingStaff: e.target.checked})} />
                                                <span className="pc-slider-v2"></span>
                                            </label>
                                        </div>
                                        <div className="pc-input-group-v2">
                                            <label>{t('whitelist.voice_rejection_cooldown')}</label>
                                            <div className="pc-input-modern-v2">
                                                <RefreshCcw size={16} />
                                                <input type="number" value={config.voiceRejectionCooldown || 48} onChange={e => setConfig({...config, voiceRejectionCooldown: parseInt(e.target.value)})} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="v-stack" style={{ gap: '32px' }}>
                            <section className="pc-card-v2">
                                <div className="card-header-v2">
                                    <div className="header-icon" style={{ background: 'var(--bg-badge)', color: '#10b981' }}><Award size={18} /></div>
                                    <h3 style={{ margin: 0 }}>{t('whitelist.voice_staffers')}</h3>
                                </div>
                                <div className="card-body-v2">
                                    <div className="pc-input-group-v2">
                                        <label>{t('whitelist.voice_eval_roles')}</label>
                                        <DiscordSelector type="role" multiple={true} options={discordData.roles} value={config.voiceStafferRoles || []} onChange={val => setConfig({...config, voiceStafferRoles: val})} />
                                    </div>
                                </div>
                            </section>

                            <section className="pc-card-v2">
                                <div className="card-header-v2">
                                    <div className="header-icon" style={{ background: 'var(--bg-badge)', color: '#ef4444' }}><RotateCcw size={18} /></div>
                                    <h3 style={{ margin: 0 }}>{t('whitelist.voice_counter_title')}</h3>
                                </div>
                                <div className="card-body-v2">
                                    <div className="v-stack" style={{ gap: '16px' }}>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('whitelist.voice_counter_desc', { count: config.voiceCounter || 0 })}</p>
                                        <button className="pc-btn-outline-v2" onClick={() => {
                                            if(window.confirm(t('whitelist.voice_reset_confirm'))) setConfig({...config, voiceCounter: 0});
                                        }} style={{ width: '100%', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                                            <RotateCcw size={16} /> <span>{t('whitelist.voice_reset_btn')}</span>
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'design' && (
                <div className="v-stack animate slide-up">
                    <EmbedMessageManager
                        guildId={guildId}
                        module="whitelist"
                        slugs={[
                            { key: 'panel', label: t('whitelist.msg_panel'), description: t('whitelist.msg_panel_desc') || 'Messaggio principale per l\'accesso.', variables: ['guild'], group: 'Entry UI', groupIcon: Layout },
                            { key: 'dm_accepted', label: t('whitelist.msg_accepted'), description: t('whitelist.msg_accepted_desc') || 'Inviato in DM all\'utente promosso.', variables: ['user'], group: 'DM Alerts', groupIcon: CheckCircle2 },
                            { key: 'dm_rejected', label: t('whitelist.msg_rejected'), description: t('whitelist.msg_rejected_desc') || 'Inviato in DM all\'utente bocciato.', variables: ['user', 'reason'], group: 'DM Alerts', groupIcon: XCircle }
                        ]}
                    />
                </div>
            )}

            {activeTab === 'system_messages' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <SystemMessagesSection
                            config={config}
                            onUpdate={setConfig}
                            title={t('whitelist.system_messages') || 'Whitelist System Messages'}
                            messages={[
                                { key: 'already_exists', label: t('whitelist.msg_already_exists'), placeholder: t('whitelist.msg_already_exists_placeholder') },
                                { key: 'cooldown_error', label: t('whitelist.msg_cooldown_error'), placeholder: t('whitelist.msg_cooldown_error_placeholder') },
                                { key: 'blacklist_error', label: t('whitelist.msg_blacklist_error'), placeholder: t('whitelist.msg_blacklist_error_placeholder') },
                                { key: 'test_passed', label: t('whitelist.msg_test_passed'), placeholder: t('whitelist.msg_test_passed_placeholder') },
                                { key: 'test_failed', label: t('whitelist.msg_test_failed'), placeholder: t('whitelist.msg_test_failed_placeholder') }
                            ]}
                        />
                    </section>

                    <section className="pc-card-v2">
                        <SystemMessagesSection
                            config={bgConfig}
                            onUpdate={setBgConfig}
                            title={t('background.system_messages') || 'Background System Messages'}
                            messages={[
                                { key: 'already_exists', label: t('background.msg_already_exists'), placeholder: t('background.msg_already_exists_placeholder') },
                                { key: 'cooldown_error', label: t('background.msg_cooldown_error'), placeholder: t('background.msg_cooldown_error_placeholder') },
                                { key: 'submission_success', label: t('background.msg_submission_success'), placeholder: t('background.msg_submission_success_placeholder') }
                            ]}
                        />
                    </section>
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1650px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            @media (max-width: 1200px) {
                .pc-layout-grid-v2, .pc-settings-grid-v2 { grid-template-columns: 1fr !important; gap: 24px !important; }
            }

            /* Header V2 */
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

            .header-controls { display: flex; align-items: center; gap: 12px; }
            .pc-header-divider { width: 1.5px; height: 24px; background: var(--border); margin: 0 4px; }

            .text-active { color: #10b981; }
            .text-inactive { color: #ef4444; }

            .pc-btn-outline-v2 { background: var(--bg-badge); color: var(--text-muted); border: 1.5px solid var(--border); width: 44px; height: 44px; border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
            .pc-btn-outline-v2:hover:not(:disabled) { background: var(--bg-card); border-color: var(--primary); color: var(--primary); transform: translateY(-2px); }
            .pc-btn-outline-v2:disabled { opacity: 0.5; cursor: not-allowed; }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 6px; background: var(--bg-badge); padding: 5px; border-radius: 18px; width: fit-content; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; font-size: 0.9rem; border-radius: 14px; cursor: pointer; transition: 0.2s; }
            .pc-tabs-v2 button.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

            /* Card V2 */
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: var(--bg-badge); }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.3rem; font-weight: 700; color: var(--text-heading); }

            /* Inputs */
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; display: block; }
            .pc-input-modern-v2 { display: flex; align-items: center; gap: 12px; background: var(--bg-badge); padding: 10px 16px; border-radius: 14px; border: 1.5px solid var(--border); transition: 0.2s; }
            .pc-input-modern-v2:focus-within { border-color: var(--primary); }
            .pc-input-modern-v2 input { border: none; background: transparent; width: 100%; font-weight: 700; font-size: 1rem; outline: none; color: var(--text-heading); }
            .pc-textarea-v2 { width: 100%; background: var(--bg-badge); border: 1.5px solid var(--border); border-radius: 16px; padding: 16px; font-weight: 700; color: var(--text-heading); outline: none; min-height: 100px; resize: none; transition: 0.2s; }
            .pc-textarea-v2:focus { border-color: var(--primary); }

            .pc-sub-card-v2 { background: var(--bg-badge); padding: 20px; border-radius: 20px; border: 1.5px solid var(--border); }
            .pc-btn-icon-danger-v2 { width: 40px; height: 40px; border-radius: 12px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }

            .pc-toggle-card-v2 { background: var(--bg-badge); padding: 20px; border-radius: 20px; border: 1.5px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
            .pc-toggle-card-v2 strong { font-weight: 700; color: var(--text-heading); }
            .pc-toggle-card-v2 span { font-size: 0.75rem; color: var(--text-muted); font-weight: 700; }


            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
