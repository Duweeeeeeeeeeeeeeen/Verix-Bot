import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Bot, Shield, Info, Save, Crown, EyeOff, MessageSquare, Zap, Sparkles, Check, 
    Plus, Trash2, Clock, CheckCircle2, AlertCircle, RefreshCw, Smartphone, Monitor,
    Fingerprint, UserCircle, Globe, Layout, Layers, Box, Cpu, Activity,
    ShieldCheck, XCircle, Rocket, Gauge, Palette, Search, Settings2, Power
} from 'lucide-react';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import Head from 'next/head';

export default function WhiteLabelPage() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Status management
  const [statuses, setStatuses] = useState([]);
  const [rotationInterval, setRotationInterval] = useState(60);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    if (!guildId || !mounted) return;
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
        const res = await api.request(`/config/${guildId}/guild`);
        const data = res.data || res;
        setConfig(data);
        setStatuses(data.customStatuses || []);
        setRotationInterval(data.statusRotationInterval || 60);
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

  if (!mounted || loading) return <Skeleton height="600px" />;

  const isPremium = config?.isPremium || ['premium', 'platinum'].includes(config?.premiumTier);

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
                <div className="pc-pro-gate-box-v2 animate slide-up" style={{ padding: '120px 40px', background: 'white', borderRadius: '40px', border: '1px solid var(--border)', textAlign: 'center', boxShadow: 'var(--shadow-premium)', maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="gate-icon-glow-v2" style={{ width: '110px', height: '110px', background: '#eef2ff', color: '#6366f1', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px', boxShadow: '0 20px 40px rgba(99, 102, 241, 0.15)' }}>
                        <Rocket size={56} />
                    </div>
                    <h2 style={{ fontFamily: 'Inter', fontSize: '3.2rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '20px', letterSpacing: '-1px' }}>{t('wl.gate_title')}</h2>
                    <p style={{ fontSize: '1.3rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 650, margin: '0 auto 64px', fontWeight: 600 }}>{t('wl.gate_desc')}</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', maxWidth: '1000px', margin: '0 auto 64px' }}>
                        {/* Standard Card */}
                        <div style={{ background: 'white', border: '1.5px solid var(--border)', padding: '48px', borderRadius: '32px', textAlign: 'left', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--bg-badge)', padding: '8px 20px', borderRadius: '100px', color: 'var(--text-muted)', letterSpacing: '1px' }}>{t('wl.standard_bot')}</span>
                                <XCircle size={24} color="var(--text-dim)" />
                            </div>
                            <div style={{ background: 'var(--bg-badge)', border: '1.5px solid var(--border)', borderRadius: '22px', padding: '32px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--border)', marginBottom: '20px' }}></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Shield size={18} color="#6366f1" /> 
                                    <span style={{ fontWeight: 700, color: 'var(--text-dim)' }}>{t('wl.powered_by')} Verix</span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '12px', fontWeight: 600 }}>{t('wl.branding_visible')}</p>
                            </div>
                        </div>

                        {/* Platinum Card */}
                        <div style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, var(--bg-card) 100%)', border: '2.5px solid #ddd6fe', padding: '48px', borderRadius: '32px', textAlign: 'left', position: 'relative', boxShadow: '0 20px 50px rgba(99, 102, 241, 0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#6366f1', padding: '8px 20px', borderRadius: '100px', color: 'white', letterSpacing: '1px' }}>{t('wl.platinum_studio')}</span>
                                <ShieldCheck size={28} color="#6366f1" />
                            </div>
                            <div style={{ background: 'white', border: '1.5px solid #ddd6fe', borderRadius: '22px', padding: '32px', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.05)' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#6366f1', marginBottom: '20px' }}></div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)' }}>{config?.name || 'Your Global Brand'}</div>
                                <p style={{ fontSize: '0.85rem', color: '#6366f1', marginTop: '12px', fontWeight: 700 }}>{t('wl.ghost_mode')}</p>
                            </div>
                        </div>
                    </div>

                    <button className="pc-btn-primary" style={{ padding: '24px 72px', fontSize: '1.25rem', borderRadius: '24px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }} onClick={() => router.push(`/config/${guildId}/premium`)}>
                        <Sparkles size={24} />
                        <span>Upgrade to Platinum Studio</span>
                    </button>
                </div>
            ) : (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: '40px' }}>
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
                                        <Bot size={22} style={{ marginLeft: '24px', color: 'var(--text-dim)' }} />
                                        <input 
                                            type="text" 
                                            style={{ width: '100%', border: 'none', background: 'transparent', padding: '24px', fontWeight: 700, color: 'var(--text-heading)', fontSize: '1.2rem', outline: 'none' }}
                                            value={config.customBotName || ''} 
                                            onChange={(e) => setConfig({...config, customBotName: e.target.value})}
                                            placeholder={t('wl.nick_placeholder')}
                                        />
                                    </div>
                                    <div style={{ marginTop: '24px', background: 'rgba(99, 102, 241, 0.03)', padding: '24px', borderRadius: '22px', border: '1.5px solid var(--border)', display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <Info size={24} color="#6366f1" style={{ flexShrink: 0 }} />
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 700, lineHeight: 1.6 }}>{t('wl.nick_desc')}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

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
                                            <div className="pc-select-wrapper-v2" style={{ background: 'white', borderRadius: '16px', border: '1.5px solid var(--border)', padding: '0 16px' }}>
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
                                                style={{ flex: 1, background: 'white', border: '1.5px solid var(--border)', padding: '14px 24px', borderRadius: '16px', color: 'var(--text-heading)', fontWeight: 700, outline: 'none', fontSize: '1.05rem' }}
                                                value={s.text || ''} 
                                                onChange={(e) => updateStatus(index, 'text', e.target.value)}
                                                placeholder={t('wl.status_placeholder')}
                                            />
                                            <button className="pc-btn-delete-studio-v2" style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => removeStatus(index)}><Trash2 size={22} /></button>
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
                                            <div style={{ width: '48px', height: '48px', background: '#f5f3ff', color: '#6366f1', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}><Timer size={22} /></div>
                                            <div className="v-stack">
                                                <span style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '1.1rem', letterSpacing: '-0.3px' }}>{t('wl.rotation_freq')}</span>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('wl.rotation_freq_desc')}</span>
                                            </div>
                                            <div style={{ marginLeft: 'auto', background: 'white', padding: '10px 24px', borderRadius: '16px', border: '1.5px solid var(--border)', color: '#6366f1', fontWeight: 700, fontSize: '1.3rem' }}>
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
                                            <span>Ultra High (15s)</span>
                                            <span>Slow (1h)</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    <aside className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                <div className="header-icon" style={{ background: '#fef2f2', color: '#ef4444' }}><EyeOff size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('wl.ghost_protocol')}</h3>
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

                        <div className="pc-variable-card-v2 animate slide-up" style={{ background: 'linear-gradient(135deg, var(--text-heading) 0%, #0f172a 100%)', borderRadius: '32px', padding: '40px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'relative', zIndex: 2 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '16px', color: '#38bdf8' }}><Globe size={24} /></div>
                                    <span style={{ fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('wl.placeholders')}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, opacity: 0.8, lineHeight: 1.7, marginBottom: '32px' }}>{t('wl.placeholders_desc')}</p>
                                <div className="v-stack" style={{ gap: '16px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px 20px', borderRadius: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <code style={{ background: '#38bdf8', color: '#0f172a', padding: '6px 14px', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem' }}>{`{players}`}</code>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Online Count</span>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px 20px', borderRadius: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <code style={{ background: '#38bdf8', color: '#0f172a', padding: '6px 14px', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem' }}>{`{max_players}`}</code>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Total Slots</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.05 }}><Cpu size={200} /></div>
                        </div>
                    </aside>
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1500px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
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

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-status-card-v2, :global(.light-theme) .pc-pro-gate-box-v2 { box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
