import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useT } from '../../../contexts/LanguageContext';
import { 
    RefreshCcw, Shield, Zap, MessageSquare, 
    Layers, Settings2, Info, AlertTriangle, 
    CheckCircle2, Copy, ArrowRight, Server,
    Crown, Lock, ChevronRight, Layout, Sparkles, Gem,
    CheckCircle, ShieldCheck, Box, Globe, Cpu, UserCheck, MessageCircle
} from 'lucide-react';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import Head from 'next/head';

export default function GlobalSync() {
    const { t } = useT();
    const router = useRouter();
    const { guildId } = router.query;
    
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [guildData, setGuildData] = useState(null);
    const [userGuilds, setUserGuilds] = useState([]);
    const [sourceGuildId, setSourceGuildId] = useState('');
    const [selectedModules, setSelectedModules] = useState([
        'whitelist', 'tickets', 'automations', 'moderation', 'welcome', 'verify'
    ]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const modules = [
        { id: 'whitelist', label: t('sync.module_names.whitelist'), icon: Shield, desc: t('sync.module_descs.whitelist') },
        { id: 'tickets', label: t('sync.module_names.tickets'), icon: Layers, desc: t('sync.module_descs.tickets') },
        { id: 'automations', label: t('sync.module_names.automations'), icon: Zap, desc: t('sync.module_descs.automations') },
        { id: 'moderation', label: t('sync.module_names.moderation'), icon: ShieldCheck, desc: t('sync.module_descs.moderation') },
        { id: 'welcome', label: t('sync.module_names.welcome'), icon: MessageSquare, desc: t('sync.module_descs.welcome') },
        { id: 'verify', label: t('sync.module_names.verify'), icon: CheckCircle, desc: t('sync.module_descs.verify') },
        { id: 'socials', label: t('sync.module_names.socials'), icon: Globe, desc: t('sync.module_descs.socials') },
        { id: 'utility', label: t('sync.module_names.utility'), icon: Settings2, desc: t('sync.module_descs.utility') }
    ];

    const loadData = async () => {
        if (!guildId || !mounted) return;
        setLoading(true);
        window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
        try {
            const [gRes, uRes] = await Promise.all([
                api.request(`/config/${guildId}/guild`),
                api.request('/auth/user')
            ]);

            const gData = gRes.data || gRes;
            setGuildData(gData);
            
            const guilds = (uRes.guilds || []).filter(g => 
                (g.permissions & 0x8) && g.id !== guildId
            );
            setUserGuilds(guilds);
        } catch (err) {
            console.error('Failed to load sync data:', err);
        } finally {
            setLoading(false);
            window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
        }
    };

    useEffect(() => {
        loadData();
    }, [guildId, mounted]);

    const handleSync = async () => {
        if (!sourceGuildId) return;
        setSyncing(true);
        window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
        try {
            await api.request(`/config/${guildId}/sync`, {
                method: 'POST',
                body: JSON.stringify({ sourceGuildId, modules: selectedModules })
            });
            window.dispatchEvent(new CustomEvent('show-toast', { 
                detail: { message: t('sync.success'), type: 'success' } 
            }));
        } catch (err) {
            window.dispatchEvent(new CustomEvent('show-toast', { 
                detail: { message: t('sync.error'), type: 'error' } 
            }));
        } finally {
            setSyncing(false);
            window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
        }
    };

    const toggleModule = (id) => {
        setSelectedModules(prev => 
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    if (!mounted || loading || !guildData) return <Skeleton height="600px" />;

    const isPlatinum = guildData?.premiumTier === 'platinum';

    return (
        <div className="pc-premium-wrapper fade-in">
            <Head>
                <title>{t('sync.multi_server_title')} | Verix Dashboard</title>
            </Head>

            {/* V2 Header */}
            <header className="pc-header-v2">
                <div className="header-info">
                    <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
                        <RefreshCcw size={28} />
                    </div>
                    <div className="pc-title-row">
                        <h1>{t('sync.multi_server_title')}</h1>
                        <div className={`pc-status-tag-v2 ${isPlatinum ? 'on' : 'off'}`}>
                            <div className="status-dot-v2"></div>
                            {isPlatinum ? t('sync.platinum_active') : t('sync.blocked')}
                        </div>
                    </div>
                </div>
                
                <div className="header-controls">
                    {isPlatinum && (
                        <button className="pc-btn-primary" onClick={handleSync} disabled={!sourceGuildId || selectedModules.length === 0 || syncing}>
                            {syncing ? <RefreshCcw className="animate-spin" size={18} /> : <Copy size={18} />}
                            <span>{syncing ? t('common.syncing') : t('sync.start_clone')}</span>
                        </button>
                    )}
                    <button className="pc-btn-ghost-v2" onClick={() => router.push(`/config/${guildId}`)}>
                        <Layout size={18} /> <span>{t('common.back_to_hub')}</span>
                    </button>
                </div>
            </header>

            <div className="pc-content-v2">
                {!isPlatinum ? (
                    <div className="pc-pro-gate-box-big-v2 animate slide-up">
                        <div className="gate-content-v2">
                            <div className="gate-icon-glow-v2" style={{ width: '96px', height: '96px', background: '#fdf4ff', color: '#a855f7', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: '0 15px 35px rgba(168, 85, 247, 0.2)' }}>
                                <Gem size={48} />
                            </div>
                            <h2 style={{ fontFamily: 'Inter', fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '16px', textAlign: 'center' }}>{t('sync.multi_server_title')}</h2>
                            <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 600, margin: '0 auto 40px', textAlign: 'center' }}>{t('sync.multi_server_desc')}</p>
                            
                            <div className="gate-checklist-v2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '900px', margin: '0 auto 48px' }}>
                                {[
                                    { icon: <ShieldCheck size={20} />, title: t('sync.gate.whitelist.title'), desc: t('sync.gate.whitelist.desc') },
                                    { icon: <MessageCircle size={20} />, title: t('sync.gate.design.title'), desc: t('sync.gate.design.desc') },
                                    { icon: <Cpu size={20} />, title: t('sync.gate.bot.title'), desc: t('sync.gate.bot.desc') }
                                ].map((item, i) => (
                                    <div key={i} className="pc-card-v2" style={{ padding: '24px', background: '#fdf4ff', border: '1.5px solid #f5d0fe' }}>
                                        <div style={{ color: '#a855f7', marginBottom: '12px' }}>{item.icon}</div>
                                        <h4 style={{ margin: '0 0 4px 0', fontWeight: 700, color: '#701a75' }}>{item.title}</h4>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#a21caf', fontWeight: 600 }}>{item.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <button className="pc-btn-premium-v2" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', color: 'white', border: 'none', padding: '20px 48px', borderRadius: '20px', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, margin: '0 auto', transition: '0.3s', boxShadow: '0 10px 25px rgba(var(--primary-rgb), 0.3)' }} onClick={() => router.push(`/config/${guildId}/premium`)}>
                                <Sparkles size={18} />
                                <span>{t('common.pass_to_platinum')}</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 664px', gap: '32px' }}>
                        <div className="v-stack" style={{ gap: '32px' }}>
                            <section className="pc-card-v2">
                                <div className="card-header-v2">
                                    <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Server size={18} /></div>
                                    <h3>{t('sync.source_server')}</h3>
                                </div>
                                <div className="card-body-v2">
                                    <div className="pc-input-group-v2">
                                        <label>{t('sync.copy_from')}</label>
                                        <div className="pc-input-wrapper-v2" style={{ background: 'var(--bg-badge)', border: '1.5px solid var(--border)', borderRadius: '14px', position: 'relative' }}>
                                            <select 
                                                style={{ width: '100%', background: 'transparent', border: 'none', padding: '14px 16px', fontWeight: 700, color: 'var(--text-heading)', outline: 'none', appearance: 'none', cursor: 'pointer' }}
                                                value={sourceGuildId} 
                                                onChange={e => setSourceGuildId(e.target.value)}
                                            >
                                                <option value="">{t('sync.select_server')}</option>
                                                {userGuilds.map(g => (
                                                    <option key={g.id} value={g.id}>{g.name}</option>
                                                ))}
                                            </select>
                                            <ChevronRight size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                                        </div>
                                    </div>

                                    <div className="pc-alert-banner-v2" style={{ marginTop: '24px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', padding: '20px', display: 'flex', gap: '16px', color: '#ef4444' }}>
                                        <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                                        <div className="alert-text-v2">
                                            <strong style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '4px' }}>{t('common.warning')}</strong>
                                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, opacity: 0.8, lineHeight: 1.5 }}>{t('sync.overwrite_warn')}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="v-stack" style={{ gap: '32px' }}>
                            <section className="pc-card-v2">
                                <div className="card-header-v2">
                                    <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Box size={18} /></div>
                                    <h3>{t('sync.modules_to_sync')}</h3>
                                </div>
                                <div className="card-body-v2">
                                    <div className="pc-sync-modules-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                                        {modules.map(mod => (
                                            <div 
                                                key={mod.id} 
                                                className={`pc-sync-card-v2 ${selectedModules.includes(mod.id) ? 'active' : ''}`}
                                                style={{ padding: '20px', borderRadius: '20px', border: '1.5px solid var(--border)', background: 'var(--bg-badge)', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '16px' }}
                                                onClick={() => toggleModule(mod.id)}
                                            >
                                                <div className="sync-icon-box" style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                                                    <mod.icon size={20} />
                                                </div>
                                                <div className="v-stack" style={{ flex: 1 }}>
                                                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-heading)' }}>{mod.label}</span>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-dim)' }}>{mod.desc}</span>
                                                </div>
                                                <div className={`pc-sync-check ${selectedModules.includes(mod.id) ? 'active' : ''}`} style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {selectedModules.includes(mod.id) && <CheckCircle2 size={16} color="var(--primary)" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div style={{ marginTop: '40px', borderTop: '1px solid var(--bg-badge)', paddingTop: '32px' }}>
                                        <button 
                                            className="pc-btn-primary" 
                                            style={{ width: '100%', justifyContent: 'center', padding: '18px' }}
                                            onClick={handleSync}
                                            disabled={!sourceGuildId || selectedModules.length === 0 || syncing}
                                        >
                                            {syncing ? <RefreshCcw className="animate-spin" size={20} /> : <Copy size={20} />}
                                            <span style={{ fontSize: '1rem' }}>{syncing ? t('common.syncing') : t('sync.start_ecosystem_clone')}</span>
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .pc-premium-wrapper { padding: 32px; max-width: 1650px; margin: 0 auto; font-family: 'Inter', sans-serif; }
                
                @media (max-width: 1200px) {
                    .pc-layout-grid-v2 { grid-template-columns: 1fr !important; gap: 24px !important; }
                }
                
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; color: #fff; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Inter', sans-serif; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }
                
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 6px; font-size: 0.6rem; font-weight: 700; padding: 4px 10px; border-radius: 100px;  width: fit-content; }
            .pc-status-tag-v2.on { background: rgba(var(--primary-rgb), 0.1); color: var(--primary); }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: #ef4444; }
            .status-dot-v2 { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }
            .pc-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

            .pc-btn-ghost-v2 { background: transparent; color: var(--text-muted); border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
            .pc-btn-ghost-v2:hover { background: var(--bg-badge); color: var(--text-heading); }

                .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
                .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
                .header-icon { width: 44px; height: 44px; background: var(--bg-badge); color: var(--primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.2rem; font-weight: 700; color: var(--text-heading); }

                /* Sync Card Interactions */
                .pc-sync-card-v2:hover { border-color: var(--primary) !important; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.08); }
                .pc-sync-card-v2.active { background: var(--bg-card) !important; border-color: var(--primary) !important; box-shadow: 0 10px 25px rgba(var(--primary-rgb), 0.12) !important; }
                .pc-sync-card-v2.active .sync-icon-box { background: var(--bg-badge) !important; color: var(--primary) !important; border-color: var(--border) !important; }
                .pc-sync-card-v2.active .pc-sync-check { border-color: var(--primary) !important; }

                .v-stack { display: flex; flex-direction: column; }
                .animate { animation: slide-up 0.4s ease-out; }
                @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2 { box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
            `}</style>
        </div>
    );
}
