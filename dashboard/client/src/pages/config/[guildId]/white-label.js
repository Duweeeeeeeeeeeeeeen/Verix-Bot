import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Bot, Shield, Info, Save, Crown, EyeOff, MessageSquare, Zap, Sparkles, Check, 
    Plus, Trash2, Clock, CheckCircle2, AlertCircle, RefreshCw, Smartphone, Monitor,
    Fingerprint, UserCircle, Globe, Layout, Layers, Box, Cpu, Activity,
    ShieldCheck, XCircle, Rocket, Gauge, Palette, Search, Settings2, Power, ArrowRight,
    Key, ExternalLink, CheckCircle, Timer, Eye, ChevronLeft, Gem, X, Lock, HelpCircle
} from 'lucide-react';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import Head from 'next/head';

export default function BrandingPage() {
  const { t, language } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Status management
  const [statuses, setStatuses] = useState([]);
  const [rotationInterval, setRotationInterval] = useState(60);
  
  // Platinum specific states
  const [botData, setBotData] = useState(null);
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    if (!guildId || !mounted) return;
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
        const [guildRes, botRes] = await Promise.all([
            api.request(`/config/${guildId}/guild`),
            api.request(`/private-bot/${guildId}`).catch(() => ({ bot: null }))
        ]);
        
        const data = guildRes.data || guildRes;
        setConfig(data);
        setStatuses(data.customStatuses || []);
        setRotationInterval(data.statusRotationInterval || 60);
        
        if (botRes && botRes.success && botRes.data && botRes.data.bot) {
            setBotData(botRes.data.bot);
        } else if (botRes && botRes.bot) {
            setBotData(botRes.bot);
        }
    } catch (err) {
        console.error('Failed to fetch config:', err);
    } finally {
        setLoading(false);
        window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [guildId, mounted]);

  const addStatus = () => {
    setStatuses([...statuses, { text: '', type: 0 }]);
  };

  const removeStatus = (index) => {
    setStatuses(statuses.filter((_, i) => i !== index));
  };

  const updateStatus = (index, field, value) => {
    const newStatuses = [...statuses];
    newStatuses[index] = { ...newStatuses[index], [field]: value };
    setStatuses(newStatuses);
  };

  const handleSave = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
        await api.request(`/config/${guildId}/guild`, {
            method: 'PATCH',
            body: JSON.stringify({
                customBotName: config.customBotName,
                customStatuses: statuses,
                statusRotationInterval: rotationInterval,
                hideBranding: config.hideBranding
            })
        });
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('wl.sync_protocol'), type: 'success' } }));
    } catch (err) {
        console.error('Save failed:', err);
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.error'), type: 'error' } }));
    } finally {
        setSaving(false);
        window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  // Platinum specific handlers
  const handleSaveToken = async () => {
    if (!token && !botData) return;
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
        await api.request(`/private-bot/${guildId}`, {
            method: 'POST',
            data: { token: token || undefined, enabled: botData ? botData.enabled : true }
        });
        setToken('');
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('wl.token_saved'), type: 'success' } }));
        fetchData();
    } catch (err) {
        console.error('Token save failed:', err);
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('wl.token_error'), type: 'error' } }));
    } finally {
        setSaving(false);
        window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleToggleBot = async () => {
    if (!botData) return;
    try {
        const res = await api.request(`/private-bot/${guildId}/toggle`, { method: 'POST' });
        setBotData({ ...botData, enabled: res.enabled });
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: res.enabled ? t('wl.bot_enabled') : t('wl.bot_disabled'), type: 'success' } }));
    } catch (err) {
        console.error('Toggle failed:', err);
    }
  };

  const handleRestartBot = async () => {
    if (!botData || !botData.enabled) return;
    setRestarting(true);
    try {
        await api.request(`/private-bot/${guildId}/restart`, { method: 'POST' });
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('wl.restarting'), type: 'warning' } }));
        setTimeout(fetchData, 3000);
    } catch (err) {
        console.error('Restart failed:', err);
    } finally {
        setTimeout(() => setRestarting(false), 3000);
    }
  };

  if (!mounted || loading) return <Skeleton height="600px" />;

  const premiumTier = config?.premiumTier || (config?.isPremium ? 'premium' : 'none');
  const isPremium = ['premium', 'platinum'].includes(premiumTier);
  const isPlatinum = premiumTier === 'platinum';
  const langPath = language === 'it' ? '' : '/en';

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('wl.title')} | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
                    <Fingerprint size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('wl.title')}</h1>
                    <div className={`pc-status-tag-v2 ${isPremium ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {isPremium ? t('wl.active_tag') : t('wl.standby_tag')}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                {isPlatinum && (
                    <button className={`pc-btn-outline ${showGuide ? 'active' : ''}`} onClick={() => setShowGuide(!showGuide)} title={t('common.help')}>
                        <HelpCircle size={18} />
                        <span>{showGuide ? t('common.hide_guide') : t('common.show_guide')}</span>
                    </button>
                )}
                <div className="pc-header-divider" style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 4px' }}></div>
                {isPremium && (
                    <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                        <Save size={18} />
                        <span>{saving ? t('common.saving') : t('wl.save_identity')}</span>
                    </button>
                )}
            </div>
        </header>

        <div className="pc-content-v2">
            {!isPremium ? (
                <div className="pc-onboarding-gate animate fade-in">
                    <div className="gate-header">
                        <div className="gate-icon-main">
                            <Sparkles size={48} />
                        </div>
                        <h1>{t('wl.gate.custom_identity_part1') || 'Identità'} <span className="text-gradient">{t('wl.gate.custom_identity_part2') || 'Personalizzata'}</span></h1>
                        <p>{t('wl.gate.desc')}</p>
                    </div>
                    
                    <div className="gate-comparison-grid">
                        {/* Standard Card */}
                        <div className="gate-card standard">
                            <div className="card-badge">{t('wl.gate.standard_badge')}</div>
                            <div className="card-mockup legacy">
                                <div className="mock-avatar"></div>
                                <div className="mock-text">
                                    <Shield size={14} />
                                    <span>Powered by Verix</span>
                                </div>
                                <p>{t('wl.gate.standard_desc')}</p>
                            </div>
                            <div className="card-status-icon negative">
                                <XCircle size={24} />
                            </div>
                        </div>

                        {/* Platinum Card */}
                        <div className="gate-card platinum">
                            <div className="card-badge highlight">{t('wl.gate.platinum_badge')}</div>
                            <div className="card-mockup modern">
                                <div className="mock-avatar primary"></div>
                                <div className="mock-text-bold">{config?.name || t('wl.gate.your_brand') || 'Il Tuo Brand'}</div>
                                <p className="text-primary-bright">{t('wl.gate.platinum_desc')}</p>
                            </div>
                            <div className="card-status-icon positive">
                                <ShieldCheck size={28} />
                            </div>
                            <div className="platinum-glow"></div>
                        </div>
                    </div>

                    <button className="gate-btn-platinum" onClick={() => router.push(`/config/${guildId}/premium`)}>
                        <Crown size={22} />
                        <span>{t('wl.gate.activate_btn')}</span>
                        <ArrowRight size={20} />
                    </button>
                </div>
            ) : (
                <div className="v-stack" style={{ gap: '32px' }}>
                    {/* Integrated Guide (Toggleable) */}
                    {isPlatinum && showGuide && (
                        <section className="pc-card-v2 animate slide-up" style={{ border: '1.5px solid var(--primary-muted)', background: 'rgba(99, 102, 241, 0.02)' }}>
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: 'var(--primary)', color: 'white' }}><Layout size={18} /></div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>{t('wl.guide_title')}</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('wl.guide_desc')}</p>
                                </div>
                                <button className="pc-btn-close-v2" style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }} onClick={() => setShowGuide(false)}><X size={20} /></button>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-stepper-v2 horizontal">
                                    {[1,2,3,4].map(step => (
                                        <div key={step} className="pc-step-item-v2 compact">
                                            <div className="step-num">{step}</div>
                                            <div className="step-content">
                                                <h4 className="step-title">{t(`private_bot.step${step}_title`)}</h4>
                                                <div className="step-media-v2" onClick={() => setSelectedImage({ src: `/img/guide${langPath}/step${step}.png`, title: t(`private_bot.step${step}_title`) })}>
                                                    <img src={`/img/guide${langPath}/step${step}.png`} alt={`Step ${step}`} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 560px', gap: '32px' }}>
                        <div className="v-stack" style={{ gap: '32px' }}>
                            <section className="pc-card-v2 animate slide-up">
                                <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                    <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><UserCircle size={18} /></div>
                                    <h3 style={{ margin: 0 }}>{t('wl.identity_global')}</h3>
                                </div>
                                <div className="card-body-v2">
                                        <div className="pc-input-group-v2">
                                            <label>{t('wl.custom_nick')}</label>
                                            <div className="pc-input-wrapper-v2" style={{ background: 'var(--bg-badge)', border: '1.5px solid var(--border)', borderRadius: '22px', display: 'flex', alignItems: 'center', transition: '0.3s' }}>
                                                <Bot size={22} style={{ marginLeft: '24px', color: 'var(--primary)' }} />
                                                <input 
                                                    type="text" 
                                                    style={{ width: '100%', border: 'none', background: 'transparent', padding: '24px', fontWeight: 700, color: 'var(--text-heading)', fontSize: '1.2rem', outline: 'none' }}
                                                    value={config.customBotName || ''} 
                                                    onChange={(e) => setConfig({...config, customBotName: e.target.value})}
                                                    placeholder={t('wl.nick_placeholder')}
                                                />
                                            </div>
                                            <div style={{ marginTop: '24px', background: 'rgba(99, 102, 241, 0.05)', padding: '24px', borderRadius: '22px', border: '1.5px solid rgba(99, 102, 241, 0.2)', display: 'flex', gap: '20px', alignItems: 'center' }}>
                                                <Info size={24} color="#6366f1" style={{ flexShrink: 0 }} />
                                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: t('wl.nick_desc') }} />
                                            </div>
                                        </div>
                                </div>
                            </section>

                            {botData?.clientName ? (
                                <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                                    <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                        <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><RefreshCw size={18} /></div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: 0 }}>{t('wl.rotation_studio')}</h3>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t('wl.rotation_desc')}</p>
                                        </div>
                                        <button className="pc-btn-add-studio-v2" style={{ background: 'var(--bg-badge)', color: 'var(--primary)', border: '1.5px solid var(--border)', padding: '12px 24px', borderRadius: '14px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: '0.3s' }} onClick={addStatus}>
                                            <Plus size={18} /> <span>{t('wl.add_status')}</span>
                                        </button>
                                    </div>
                                    <div className="card-body-v2">
                                        <div className="v-stack" style={{ gap: '18px' }}>
                                            {statuses.map((s, index) => (
                                                <div key={index} className="pc-status-card-v2 animate slide-up" style={{ display: 'flex', gap: '20px', background: 'var(--bg-badge)', padding: '20px', borderRadius: '24px', border: '1.5px solid var(--border)', alignItems: 'center', transition: '0.3s', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                                    <div className="pc-select-wrapper-v2" style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1.5px solid var(--border)', padding: '0 16px' }}>
                                                            <select 
                                                                style={{ border: 'none', background: 'transparent', padding: '14px 0', color: '#6366f1', fontWeight: 700, outline: 'none', fontSize: '0.9rem', cursor: 'pointer', minWidth: '110px' }}
                                                            value={s.type || 0}
                                                            onChange={(e) => updateStatus(index, 'type', parseInt(e.target.value))}
                                                        >
                                                            <option value="0">Playing</option>
                                                            <option value="3">Watching</option>
                                                            <option value="2">Listening</option>
                                                            <option value="5">Competing</option>
                                                            <option value="4">Custom</option>
                                                        </select>
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        style={{ flex: 1, background: 'var(--bg-input)', border: '1.5px solid var(--border)', padding: '14px 24px', borderRadius: '16px', color: 'var(--text-heading)', fontWeight: 700, outline: 'none', fontSize: '1.05rem' }}
                                                        value={s.text || ''} 
                                                        onChange={(e) => updateStatus(index, 'text', e.target.value)}
                                                        placeholder={t('wl.status_placeholder')}
                                                    />
                                                    <button className="pc-btn-delete-studio-v2" style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => removeStatus(index)}><Trash2 size={22} /></button>
                                                </div>
                                            ))}
                                            {statuses.length === 0 && (
                                                <div style={{ textAlign: 'center', padding: '100px 40px', color: 'var(--border)', background: 'var(--bg-badge)', borderRadius: '32px', border: '2px dashed var(--border)' }}>
                                                    <Activity size={64} style={{ margin: '0 auto 24px', opacity: 0.3 }} />
                                                    <p style={{ fontWeight: 700, color: 'var(--text-dim)', fontSize: '1.1rem' }}>{t('wl.empty_status')}</p>
                                                </div>
                                            )}
                                        </div>
        
                                        {statuses.length > 1 && (
                                            <div style={{ marginTop: '40px', padding: '36px', background: 'linear-gradient(135deg, var(--bg-badge) 0%, var(--bg-badge) 100%)', borderRadius: '32px', border: '1.5px solid var(--border)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                                                    <div style={{ width: '48px', height: '48px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}><Timer size={22} /></div>
                                                    <div className="v-stack">
                                                        <span style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '1.1rem', letterSpacing: '-0.3px' }}>{t('wl.rotation_freq')}</span>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('wl.rotation_freq_desc')}</span>
                                                    </div>
                                                    <div style={{ marginLeft: 'auto', background: 'var(--bg-card)', padding: '10px 24px', borderRadius: '16px', border: '1.5px solid var(--border)', color: '#6366f1', fontWeight: 700, fontSize: '1.3rem' }}>
                                                        {rotationInterval}s
                                                    </div>
                                                </div>
                                                <input 
                                                    type="range" 
                                                    min="15" 
                                                    max="3600" 
                                                    step="15"
                                                    style={{ width: '100%', accentColor: '#6366f1', height: '10px', cursor: 'pointer' }}
                                                    value={rotationInterval} 
                                                    onChange={(e) => setRotationInterval(parseInt(e.target.value))}
                                                />
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                                                    <span>Velocità Alta (15s)</span>
                                                    <span>Lento (1h)</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            ) : (
                                <section className="pc-card-v2 animate slide-up" style={{ opacity: 0.8, filter: 'grayscale(0.3)', animationDelay: '0.1s' }}>
                                    <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                        <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--text-muted)' }}><Lock size={18} /></div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: 0, color: 'var(--text-dim)' }}>{t('wl.rotation_studio_locked')}</h3>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t('wl.rotation_locked_desc')}</p>
                                        </div>
                                    </div>
                                    <div className="card-body-v2">
                                         <div style={{ padding: '60px 40px', textAlign: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: '32px', border: '2px dashed var(--border)' }}>
                                             <Bot size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
                                             <p style={{ color: 'var(--text-dim)', fontWeight: 600 }}>{t('wl.rotation_locked_desc')}</p>
                                         </div>
                                    </div>
                                </section>
                            )}
                        </div>

                        <aside className="v-stack" style={{ gap: '32px' }}>
                            {/* Platinum Instance Monitor */}
                            {isPlatinum && (
                                <section className="pc-card-v2 status-monitor-v2 animate slide-up">
                                    <div className="card-header-v2">
                                        <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Power size={18} /></div>
                                        <h3 style={{ margin: 0 }}>Stato Istanza</h3>
                                    </div>
                                    <div className="card-body-v2">
                                        {botData ? (
                                            <div className="v-stack" style={{ gap: '24px' }}>
                                                <div className="pc-bot-identity-v2">
                                                    <img src={botData.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'} className="bot-avatar" />
                                                    <div className="bot-info">
                                                        <span className="bot-name">{botData.clientName || 'Private Bot'}</span>
                                                        <div className={`pc-status-tag-v2 ${botData.status === 'online' ? 'on' : 'off'}`}>
                                                            <div className="status-dot-v2"></div>
                                                            {botData.status.toUpperCase()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pc-action-row-v2">
                                                    <div className="v-stack">
                                                        <span className="action-label">{t('wl.enabled')}</span>
                                                        <span className="action-desc">{t('wl.enabled_desc')}</span>
                                                    </div>
                                                    <label className="pc-toggle-mini">
                                                        <input type="checkbox" checked={!!botData.enabled} onChange={handleToggleBot} />
                                                        <span className="pc-slider-mini"></span>
                                                    </label>
                                                </div>

                                                <button className="pc-btn-outline" style={{ width: '100%', height: '56px' }} onClick={handleRestartBot} disabled={restarting}>
                                                    <RefreshCw size={18} className={restarting ? 'animate-spin' : ''} />
                                                    <span>{restarting ? t('wl.restarting_btn') : t('wl.restart_btn')}</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="pc-empty-mini">{t('wl.token_setup_hint')}</div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* Platinum Credentials */}
                            {isPlatinum && (
                                <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                                    <div className="card-header-v2">
                                        <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Key size={18} /></div>
                                        <h3 style={{ margin: 0 }}>Credenziali</h3>
                                    </div>
                                    <div className="card-body-v2">
                                        <div className="pc-input-group-v2">
                                            <label>{t('wl.token_label')}</label>
                                            <div className="pc-input-wrapper-v2" style={{ background: 'var(--bg-badge)', border: '1.5px solid var(--border)', borderRadius: '16px', overflow: 'hidden', display: 'flex' }}>
                                                <input 
                                                    type={showToken ? 'text' : 'password'} 
                                                    style={{ flex: 1, background: 'transparent', border: 'none', padding: '16px', fontWeight: 700, color: 'var(--text-heading)', outline: 'none' }}
                                                    placeholder={botData ? '••••••••••••••••••••' : 'MTE3MjMx...'} 
                                                    value={token}
                                                    onChange={e => setToken(e.target.value)}
                                                />
                                                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0 16px' }} onClick={() => setShowToken(!showToken)}>
                                                    {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                            <button 
                                                className="pc-btn-primary" 
                                                style={{ width: '100%', marginTop: '16px' }} 
                                                onClick={handleSaveToken} 
                                                disabled={saving || (!token && !botData)}
                                            >
                                                <Save size={18} />
                                                <span>{t('wl.save_token_btn')}</span>
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            )}

                            <section className="pc-card-v2 animate slide-up">
                                <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                    <div className="header-icon" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}><EyeOff size={18} /></div>
                                    <h3 style={{ margin: 0 }}>Ghost Protocol</h3>
                                </div>
                                <div className="card-body-v2">
                                    <div style={{ background: 'var(--bg-badge)', padding: '32px', borderRadius: '28px', border: '1.5px solid var(--border)', boxShadow: '0 8px 20px rgba(0,0,0,0.02)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div className="v-stack" style={{ flex: 1, gap: '6px' }}>
                                                <strong style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-heading)', letterSpacing: '-0.5px' }}>{t('wl.hide_branding')}</strong>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.5 }}>{t('wl.hide_branding_desc')}</span>
                                            </div>
                                            <label className="pc-toggle-v2">
                                                <input 
                                                    type="checkbox" 
                                                    checked={config.hideBranding} 
                                                    onChange={(e) => setConfig({...config, hideBranding: e.target.checked})}
                                                />
                                                <span className="pc-slider-v2"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="pc-variable-card-v2 animate slide-up">
                                <div style={{ position: 'relative', zIndex: 2 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                        <div className="placeholder-icon-wrapper"><Globe size={24} /></div>
                                        <span style={{ fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('wl.placeholders')}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, opacity: 0.8, lineHeight: 1.7, marginBottom: '32px' }}>{t('wl.placeholders_desc')}</p>
                                    <div className="v-stack" style={{ gap: '16px' }}>
                                        <div className="placeholder-item-v2">
                                            <code>{`{players}`}</code>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Giocatori Online</span>
                                        </div>
                                        <div className="placeholder-item-v2">
                                            <code>{`{max_players}`}</code>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Slot Totali</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="placeholder-bg-icon"><Cpu size={200} /></div>
                            </div>
                        </aside>
                    </div>
                </div>
            )}
        </div>

        {selectedImage && (
            <div className="pc-lightbox-v2 fade-in" onClick={() => setSelectedImage(null)}>
                <div className="lightbox-content-v2 animate slide-up" onClick={e => e.stopPropagation()}>
                    <div className="lightbox-header-v2">
                        <span>{selectedImage.title}</span>
                        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }} onClick={() => setSelectedImage(null)}><X size={24} /></button>
                    </div>
                    <img src={selectedImage.src} alt={selectedImage.title} />
                </div>
            </div>
        )}

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1500px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Onboarding Gate Redesign */
            .pc-onboarding-gate { padding: 80px 40px; background: var(--bg-card); border-radius: 40px; border: 1px solid var(--border); text-align: center; box-shadow: var(--shadow-premium); max-width: 1200px; margin: 0 auto; position: relative; overflow: hidden; }
            .gate-header { margin-bottom: 60px; }
            .gate-icon-main { width: 100px; height: 100px; background: rgba(99, 102, 241, 0.1); color: #6366f1; border-radius: 32px; display: flex; align-items: center; justify-content: center; margin: 0 auto 32px; box-shadow: 0 20px 40px rgba(99, 102, 241, 0.1); }
            .gate-header h1 { font-size: 3.5rem; font-weight: 900; color: var(--text-heading); margin-bottom: 20px; letter-spacing: -2px; }
            .gate-header p { font-size: 1.2rem; color: var(--text-muted); max-width: 700px; margin: 0 auto; line-height: 1.7; font-weight: 500; }
            .text-gradient { background: linear-gradient(to right, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

            .gate-comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; max-width: 1000px; margin: 0 auto 60px; }
            .gate-card { position: relative; background: var(--bg-card); border: 1.5px solid var(--border); padding: 40px; border-radius: 32px; text-align: left; transition: 0.3s; }
            .gate-card.platinum { border-color: var(--primary-muted); background: linear-gradient(135deg, var(--bg-badge) 0%, var(--bg-card) 100%); }
            .gate-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.05); }

            .card-badge { font-size: 0.7rem; font-weight: 800; padding: 6px 16px; border-radius: 100px; background: var(--bg-badge); color: var(--text-muted); letter-spacing: 1px; width: fit-content; margin-bottom: 32px; }
            .card-badge.highlight { background: #6366f1; color: white; }

            .card-mockup { background: var(--bg-badge); border: 1.5px solid var(--border); border-radius: 20px; padding: 24px; position: relative; }
            .gate-card.platinum .card-mockup { background: var(--bg-badge); border-color: var(--primary-muted); box-shadow: 0 10px 30px rgba(var(--primary-rgb), 0.05); }
            .mock-avatar { width: 32px; height: 32px; border-radius: 10px; background: var(--border); margin-bottom: 16px; }
            .mock-avatar.primary { background: #6366f1; }
            .mock-text { display: flex; align-items: center; gap: 8px; color: var(--text-dim); font-weight: 700; font-size: 0.85rem; }
            .mock-text-bold { font-size: 1.1rem; font-weight: 800; color: var(--text-heading); }
            .text-primary-bright { color: #6366f1; font-weight: 700; font-size: 0.85rem; margin-top: 8px; }

            .card-status-icon { position: absolute; top: 40px; right: 40px; }
            .negative { color: var(--text-dim); }
            .positive { color: #6366f1; }

            .gate-btn-platinum { background: #6366f1; color: white; border: none; padding: 20px 60px; border-radius: 24px; font-size: 1.2rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 16px; margin: 0 auto; transition: 0.3s; box-shadow: 0 20px 40px rgba(99, 102, 241, 0.3); }
            .gate-btn-platinum:hover { transform: scale(1.05); box-shadow: 0 30px 60px rgba(99, 102, 241, 0.4); }

            .platinum-glow { position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: #6366f1; filter: blur(80px); opacity: 0.1; pointer-events: none; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 12px 24px rgba(var(--primary-rgb), 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Inter', sans-serif; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 700; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px;  width: fit-content; }
            .pc-status-tag-v2.on { background: rgba(16, 185, 129, 0.1); color: #10b981; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: #ef4444; }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 14px 28px; border-radius: 18px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.3s; box-shadow: 0 10px 20px rgba(var(--primary-rgb), 0.2); }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(var(--primary-rgb), 0.3); }

            .pc-btn-outline { display: flex; align-items: center; justify-content: center; gap: 12px; background: var(--bg-card); border: 1.5px solid var(--border); border-radius: 14px; padding: 10px 20px; font-weight: 700; color: var(--text-heading); cursor: pointer; transition: 0.2s; }
            .pc-btn-outline:hover { background: var(--bg-badge); transform: translateY(-2px); }
            .pc-btn-outline.active { background: var(--primary); color: white; border-color: var(--primary); }

            /* Card V2 */
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.5rem; font-weight: 700; color: var(--text-heading); }

            .pc-status-card-v2:hover { border-color: var(--primary) !important; transform: translateY(-3px); box-shadow: 0 10px 25px rgba(var(--primary-rgb), 0.05); }
            .pc-btn-delete-studio-v2:hover { background: #ef4444 !important; color: #fff !important; transform: rotate(8deg); }
            .pc-btn-add-studio-v2:hover { background: var(--primary) !important; color: #fff !important; transform: translateY(-3px); }

            /* Toggle V2 */
            .pc-toggle-v2 { position: relative; width: 44px; height: 22px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: var(--border); transition: .4s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background: #fff; transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: var(--primary); }
            input:checked + .pc-slider-v2:before { transform: translateX(22px); }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 10px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.2px; }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-status-card-v2, :global(.light-theme) .pc-onboarding-gate { box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
            
            .pc-stepper-v2 { display: flex; flex-direction: column; gap: 40px; }
            .pc-stepper-v2.horizontal { flex-direction: row; gap: 20px; overflow-x: auto; padding-bottom: 10px; }
            .pc-step-item-v2 { display: flex; gap: 24px; position: relative; text-align: left; }
            .pc-step-item-v2.compact { flex: 1; min-width: 200px; flex-direction: column; gap: 12px; }
            .pc-step-item-v2:not(:last-child):not(.compact):after { content: ''; position: absolute; left: 19px; top: 48px; bottom: -48px; width: 2px; background: var(--border); opacity: 0.3; }
            .step-num { width: 40px; height: 40px; border-radius: 14px; background: var(--bg-badge); border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--primary); z-index: 2; flex-shrink: 0; }
            .step-title { margin: 0 0 8px; font-size: 1.1rem; font-weight: 700; color: var(--text-heading); }
            .step-desc { font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 16px; }
            .step-media-v2 { border-radius: 20px; border: 1.5px solid var(--border); overflow: hidden; cursor: pointer; position: relative; max-width: 100%; transition: 0.3s; }
            .step-media-v2:hover { transform: scale(1.02); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .step-media-v2 img { width: 100%; display: block; }

            /* Status monitor */
            .pc-bot-identity-v2 { display: flex; align-items: center; gap: 20px; background: var(--bg-badge); padding: 20px; border-radius: 24px; }
            .bot-avatar { width: 64px; height: 64px; border-radius: 50%; border: 3px solid var(--border-strong); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
            .bot-info { display: flex; flex-direction: column; gap: 4px; }
            .bot-name { font-weight: 800; font-size: 1.2rem; color: var(--text-heading); }

            .pc-action-row-v2 { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: var(--bg-card); border: 1.5px solid var(--border); border-radius: 20px; }
            .action-label { font-weight: 700; color: var(--text-heading); font-size: 0.95rem; }
            .action-desc { font-size: 0.8rem; color: var(--text-muted); }

            .pc-btn-outline { display: flex; align-items: center; justify-content: center; gap: 12px; background: var(--bg-card); border: 1.5px solid var(--border); border-radius: 18px; font-weight: 700; color: var(--text-heading); cursor: pointer; transition: 0.3s; }
            .pc-btn-outline:hover { background: var(--bg-badge); transform: translateY(-2px); }

            .pc-toggle-mini { position: relative; width: 50px; height: 26px; }
            .pc-toggle-mini input { opacity: 0; width: 0; height: 0; }
            .pc-slider-mini { position: absolute; cursor: pointer; inset: 0; background: var(--border); transition: .4s; border-radius: 34px; }
            .pc-slider-mini:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background: var(--bg-card); transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-mini { background: #10b981; }
            input:checked + .pc-slider-mini:before { transform: translateX(24px); }

            .pc-lightbox-v2 { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 40px; backdrop-filter: blur(10px); }
            .lightbox-content-v2 { background: var(--bg-card); border-radius: 32px; overflow: hidden; max-width: 1000px; width: 100%; box-shadow: 0 40px 100px rgba(0,0,0,0.5); }
            .lightbox-header-v2 { padding: 24px 32px; border-bottom: 1.5px solid var(--border); display: flex; justify-content: space-between; align-items: center; font-weight: 800; font-size: 1.2rem; color: var(--text-heading); }
            .lightbox-header-v2 button { background: transparent; border: none; color: var(--text-dim); cursor: pointer; transition: 0.2s; }
            .lightbox-header-v2 button:hover { color: #ef4444; transform: rotate(90deg); }
            .lightbox-content-v2 img { width: 100%; height: auto; max-height: 80vh; object-fit: contain; }

            .animate-spin { animation: spin 1s linear infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

            @media (max-width: 900px) {
                .gate-comparison-grid { grid-template-columns: 1fr; }
                .gate-header h1 { font-size: 2.5rem; }
            }

            /* Variable Placeholders Card - Theme Aware */
            .pc-variable-card-v2 { background: linear-gradient(135deg, #1e1b4b 0%, #020617 100%); border-radius: 32px; padding: 40px; color: white; position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
            .placeholder-icon-wrapper { background: rgba(255,255,255,0.1); padding: 12px; border-radius: 16px; color: #38bdf8; }
            .placeholder-item-v2 { background: rgba(255,255,255,0.05); padding: 16px 20px; border-radius: 18px; display: flex; justify-content: space-between; alignItems: center; border: 1px solid rgba(255,255,255,0.1); }
            .placeholder-item-v2 code { background: #38bdf8; color: #0f172a; padding: 6px 14px; border-radius: 10px; fontWeight: 700; fontSize: 0.9rem; }
            .placeholder-bg-icon { position: absolute; right: -40px; bottom: -40px; opacity: 0.05; pointer-events: none; }

            :global(.light-theme) .pc-variable-card-v2 {
                background: white !important;
                color: var(--text-heading) !important;
                border: 1px solid var(--border) !important;
                box-shadow: var(--shadow-premium) !important;
            }
            :global(.light-theme) .placeholder-icon-wrapper {
                background: var(--bg-badge) !important;
                color: var(--primary) !important;
            }
            :global(.light-theme) .placeholder-item-v2 {
                background: var(--bg-badge) !important;
                border: 1.5px solid var(--border) !important;
                color: var(--text-main) !important;
            }
            :global(.light-theme) .placeholder-item-v2 code {
                background: var(--primary) !important;
                color: white !important;
            }
            :global(.light-theme) .placeholder-bg-icon {
                color: var(--primary) !important;
                opacity: 0.03 !important;
            }
        `}</style>
    </div>
  );
}
