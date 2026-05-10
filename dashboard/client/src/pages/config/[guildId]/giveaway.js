import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, Gift, Trophy, Clock, Users, Trash2, Plus, RefreshCcw, Settings2, Shield, Power, Palette, Zap, 
    Info, MessageSquare, ExternalLink, History, X, Calendar, ChevronRight, AlertCircle, Square, 
    Monitor, Smartphone, Sun, Moon, ArrowRight, Search, Sparkles, Layout, CheckCircle2, Box, Send, Star,
    MousePointer2, Timer, Award, UserCheck, ShieldAlert, Layers, Target, Eye, EyeOff, Wand2, RefreshCw
} from 'lucide-react';
import { DiscordSelector, CustomSelect } from '../../../components/LazyConfigComponents';
import EmbedPreviewContainer from '../../../components/EmbedPreviewContainer';
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
  const [isPreviewMobile, setIsPreviewMobile] = useState(false);
  const [previewTheme, setPreviewTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  const [newGw, setNewGw] = useState({
    prize: '',
    duration: 60,
    winnerCount: 1,
    channelId: '',
    scheduledStart: '',
    customTitle: '🎁 GIVEAWAY STUDIO: {prize}',
    customDescription: 'Unisciti alla sfida premium cliccando il bottone qui sotto!\n\n**Premio:** {prize}\n**Scadenza:** {endtime}',
    color: '#6366f1',
    buttonLabel: 'Partecipa Ora',
    buttonEmoji: '🎉',
    buttonStyle: 'PRIMARY'
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
    footer: 'Termina il',
    timestamp: true,
    fields: [
        { name: `👥 Partecipanti`, value: '1,248', inline: true }
    ],
    button: { 
        label: newGw.buttonLabel, 
        emoji: newGw.buttonEmoji, 
        style: newGw.buttonStyle 
    }
  };

  useEffect(() => {
    if (guildId && mounted) fetchData();
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
      
      setConfig(configRes.data || configRes || { enabled: false });
      if (discordRes) {
        setRoles(discordRes.roles || []);
        setChannels(discordRes.channels?.filter(c => c.type === 0 || c.type === 5) || []);
      }
      setActiveGiveaways(activeRes.data || activeRes || []);
      setScheduledGiveaways(scheduledRes.data || scheduledRes || []);
      setLogs(logsRes.data || logsRes || []);
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
                        {config.enabled ? t('giveaway.studio_active') : t('giveaway.studio_standby')}
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
                <button className="pc-btn-primary" onClick={handleSaveConfig} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('common.sync')}</span>
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
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2">
                                <div className="header-icon"><Award size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('giveaway.core_params')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>{t('giveaway.prize_name')}</label>
                                    <div className="pc-input-modern-v2">
                                        <Gift size={18} />
                                        <input value={newGw.prize} onChange={e => setNewGw({...newGw, prize: e.target.value})} placeholder="Es: Nitro Classic Premium..." />
                                    </div>
                                </div>
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginTop: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>{t('giveaway.target_channel')}</label>
                                        <DiscordSelector type="channel" options={channels} value={newGw.channelId} onChange={v => setNewGw({...newGw, channelId: v})} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('giveaway.winners_count')}</label>
                                        <input className="pc-input-modern-v2" type="number" value={newGw.winnerCount} onChange={e => setNewGw({...newGw, winnerCount: parseInt(e.target.value)})} min="1" max="50" />
                                    </div>
                                </div>
                                <div className="pc-input-group-v2" style={{ marginTop: '24px' }}>
                                    <label>{t('giveaway.duration')}</label>
                                    <input className="pc-input-modern-v2" type="number" value={newGw.duration} onChange={e => setNewGw({...newGw, duration: parseInt(e.target.value)})} min="1" />
                                    <div className="pc-time-presets-v2" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                        {[60, 1440, 10080].map(m => (
                                            <button key={m} onClick={() => setNewGw({...newGw, duration: m})} className="pc-tag-v2" style={{ cursor: 'pointer' }}>
                                                {m === 60 ? '1h' : m === 1440 ? '24h' : '1w'}
                                            </button>
                                        ))}
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
                                    <input className="pc-input-modern-v2" value={newGw.customTitle} onChange={e => setNewGw({...newGw, customTitle: e.target.value})} />
                                </div>
                                <div className="pc-input-group-v2" style={{ marginTop: '24px' }}>
                                    <label>{t('giveaway.embed_desc')}</label>
                                    <textarea className="pc-input-modern-v2" style={{ minHeight: '120px' }} value={newGw.customDescription} onChange={e => setNewGw({...newGw, customDescription: e.target.value})} />
                                </div>
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: '20px', marginTop: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>{t('giveaway.button_label')}</label>
                                        <input className="pc-input-modern-v2" value={newGw.buttonLabel} onChange={e => setNewGw({...newGw, buttonLabel: e.target.value})} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('giveaway.accent_color')}</label>
                                        <div className="pc-color-box-v2">
                                            <div className="color-preview" style={{ backgroundColor: newGw.color }}>
                                                <input type="color" value={newGw.color} onChange={e => setNewGw({...newGw, color: e.target.value})} />
                                            </div>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>PICK</span>
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
                                    <button className="pc-btn-secondary-v2" style={{ height: '56px', fontSize: '1.1rem' }} onClick={() => handleCreateGiveaway(false)} disabled={creating}>
                                        <Calendar size={20} /> <span>{t('giveaway.schedule_btn')}</span>
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="pc-preview-sticky-v2" style={{ position: 'sticky', top: '32px', height: 'fit-content' }}>
                        <EmbedPreviewContainer data={previewEmbed} />
                    </aside>
                </div>
            )}

            {activeTab === 'live' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
                        {activeGiveaways.map(gw => (
                            <div key={gw.messageId} className="pc-sub-card-v2" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                <div style={{ width: '64px', height: '64px', background: 'var(--bg-card)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '1.5px solid var(--border)' }}><Trophy size={32} /></div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-heading)' }}>{gw.prize}</h4>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}><Users size={14} /> {gw.participants?.length || 0} Entrate</span>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteGiveaway(gw.messageId)} className="pc-btn-icon-danger-v2"><Trash2 size={20} /></button>
                            </div>
                        ))}
                        {activeGiveaways.length === 0 && (
                            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '100px 32px', background: 'var(--bg-badge)', borderRadius: '32px', border: '2px dashed var(--border)' }}>
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
                                    <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prize</th>
                                    <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</th>
                                    <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Entries</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, i) => (
                                    <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                                        <td style={{ padding: '24px 32px', fontWeight: 700, color: 'var(--text-heading)' }}>{log.prize}</td>
                                        <td style={{ padding: '24px 32px', color: 'var(--text-muted)' }}>{new Date(log.endTime).toLocaleDateString()}</td>
                                        <td style={{ padding: '24px 32px' }}><span className="pc-tag-v2">{log.participants?.length || 0}</span></td>
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
            .pc-btn-secondary-v2 { background: var(--bg-card); color: var(--primary); border: 1.5px solid var(--border); padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }

            .pc-tabs-v2 { display: flex; gap: 6px; background: var(--bg-badge); padding: 5px; border-radius: 16px; width: fit-content; overflow-x: auto; max-width: 100%; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 10px; padding: 10px 24px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; font-size: 0.9rem; border-radius: 14px; cursor: pointer; transition: 0.2s; white-space: nowrap; }
            .pc-tabs-v2 button.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .pc-tab-badge-v2 { background: var(--primary); color: #fff; font-size: 0.7rem; padding: 2px 8px; border-radius: 100px; }

            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: var(--bg-badge); color: var(--primary); }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.3rem; font-weight: 700; color: var(--text-heading); }

            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; display: block; }
            .pc-input-modern-v2 { width: 100%; background: var(--bg-badge); border: 1.5px solid var(--border); border-radius: 14px; padding: 12px 16px; font-weight: 700; color: var(--text-heading); outline: none; transition: 0.2s; }
            .pc-input-modern-v2:focus { border-color: var(--primary); }
            .pc-sub-card-v2 { background: var(--bg-badge); padding: 24px; border-radius: 20px; border: 1.5px solid var(--border); }

            .pc-color-box-v2 { display: flex; align-items: center; gap: 10px; background: var(--bg-card); padding: 8px; border-radius: 12px; border: 1.5px solid var(--border); }
            .color-preview { width: 32px; height: 32px; border-radius: 8px; position: relative; overflow: hidden; border: 1px solid #fff; }
            .color-preview input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

            .pc-tag-v2 { background: var(--bg-badge); color: var(--text-muted); padding: 4px 12px; border-radius: 100px; border: 1.5px solid var(--border); font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }
            .pc-tag-v2.active { background: var(--primary-glow); color: var(--primary); border-color: var(--primary); }

            .pc-btn-icon-v2 { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 8px; border-radius: 10px; }
            .pc-btn-icon-v2.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .pc-btn-icon-danger-v2 { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; cursor: pointer; padding: 10px; border-radius: 12px; }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
