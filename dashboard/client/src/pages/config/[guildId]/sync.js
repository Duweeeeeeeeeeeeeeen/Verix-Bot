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
        { id: 'whitelist', label: 'Whitelist', icon: Shield, desc: 'Ruoli e permessi staff' },
        { id: 'tickets', label: 'Tickets', icon: Layers, desc: 'Configurazione supporto' },
        { id: 'automations', label: 'Automazioni', icon: Zap, desc: 'Comandi e script auto' },
        { id: 'moderation', label: 'Moderazione', icon: ShieldCheck, desc: 'Filtri anti-spam e raid' },
        { id: 'welcome', label: 'Welcome', icon: MessageSquare, desc: 'Messaggi di benvenuto' },
        { id: 'verify', label: 'Verifica', icon: CheckCircle, desc: 'Sistemi di captcha/ruoli' },
        { id: 'socials', label: 'Socials', icon: Globe, desc: 'Twitch, YouTube, Post' },
        { id: 'utility', label: 'Utility', icon: Settings2, desc: 'Embed e configurazioni' }
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
                detail: { message: "Sincronizzazione completata!", type: 'success' } 
            }));
        } catch (err) {
            window.dispatchEvent(new CustomEvent('show-toast', { 
                detail: { message: "Errore sincronizzazione", type: 'error' } 
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
                <title>Ecosystem Sync | Verix Dashboard</title>
            </Head>

            {/* V2 Header */}
            <header className="pc-header-v2">
                <div className="header-info">
                    <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' }}>
                        <RefreshCcw size={28} />
                    </div>
                    <div className="pc-title-row">
                        <h1>Ecosystem Sync</h1>
                        <div className={`pc-status-tag-v2 ${isPlatinum ? 'on' : 'off'}`}>
                            <div className="status-dot-v2"></div>
                            {isPlatinum ? 'SISTEMA PLATINUM ATTIVO' : 'FUNZIONE BLOCCATA'}
                        </div>
                    </div>
                </div>
                
                <div className="header-controls">
                    {isPlatinum && (
                        <button className="pc-btn-primary" style={{ background: '#7c3aed', boxShadow: '0 10px 20px rgba(124, 58, 237, 0.2)' }} onClick={handleSync} disabled={!sourceGuildId || selectedModules.length === 0 || syncing}>
                            {syncing ? <RefreshCcw className="animate-spin" size={18} /> : <Copy size={18} />}
                            <span>{syncing ? 'Sincronizzazione...' : 'Avvia Clonazione'}</span>
                        </button>
                    )}
                    <button className="pc-btn-ghost-v2" onClick={() => router.push(`/config/${guildId}`)}>
                        <Layout size={18} /> <span>Dashboard</span>
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
                            <h2 style={{ fontFamily: 'Inter', fontSize: '2.5rem', fontWeight: 900, color: '#1e293b', marginBottom: '16px', textAlign: 'center' }}>Sincronizzazione Multi-Server</h2>
                            <p style={{ fontSize: '1.15rem', color: '#64748b', lineHeight: 1.6, maxWidth: 600, margin: '0 auto 40px', textAlign: 'center' }}>Gestisci un network di server? Copia istantaneamente intere configurazioni tra le tue community con un solo click e mantieni la coerenza assoluta.</p>
                            
                            <div className="gate-checklist-v2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '900px', margin: '0 auto 48px' }}>
                                {[
                                    { icon: <ShieldCheck size={20} />, title: "Sync Whitelist", desc: "Copia ruoli staff e permessi." },
                                    { icon: <MessageCircle size={20} />, title: "Sync Design", desc: "Copia template embed e messaggi." },
                                    { icon: <Cpu size={20} />, title: "Sync Bot", desc: "Copia automazioni e comandi." }
                                ].map((item, i) => (
                                    <div key={i} className="pc-card-v2" style={{ padding: '24px', background: '#fdf4ff', border: '1.5px solid #f5d0fe' }}>
                                        <div style={{ color: '#a855f7', marginBottom: '12px' }}>{item.icon}</div>
                                        <h4 style={{ margin: '0 0 4px 0', fontWeight: 900, color: '#701a75' }}>{item.title}</h4>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#a21caf', fontWeight: 600 }}>{item.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <button className="pc-btn-premium-v2" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', color: 'white', border: 'none', padding: '20px 48px', borderRadius: '20px', fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, margin: '0 auto', transition: '0.3s', boxShadow: '0 10px 25px rgba(168, 85, 247, 0.3)' }} onClick={() => router.push(`/config/${guildId}/premium`)}>
                                <Sparkles size={18} />
                                <span>Attiva Piano Platinum</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '32px' }}>
                        <div className="v-stack" style={{ gap: '32px' }}>
                            <section className="pc-card-v2">
                                <div className="card-header-v2">
                                    <div className="header-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}><Server size={18} /></div>
                                    <h3>Server Sorgente</h3>
                                </div>
                                <div className="card-body-v2">
                                    <div className="pc-input-group-v2">
                                        <label>Copia dati da:</label>
                                        <div className="pc-input-wrapper-v2" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', position: 'relative' }}>
                                            <select 
                                                style={{ width: '100%', background: 'transparent', border: 'none', padding: '14px 16px', fontWeight: 700, color: '#1e293b', outline: 'none', appearance: 'none', cursor: 'pointer' }}
                                                value={sourceGuildId} 
                                                onChange={e => setSourceGuildId(e.target.value)}
                                            >
                                                <option value="">Seleziona un server...</option>
                                                {userGuilds.map(g => (
                                                    <option key={g.id} value={g.id}>{g.name}</option>
                                                ))}
                                            </select>
                                            <ChevronRight size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: '#94a3b8', pointerEvents: 'none' }} />
                                        </div>
                                    </div>

                                    <div className="pc-alert-banner-v2" style={{ marginTop: '24px', background: '#fff1f2', border: '1px solid #fee2e2', borderRadius: '20px', padding: '20px', display: 'flex', gap: '16px', color: '#ef4444' }}>
                                        <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                                        <div className="alert-text-v2">
                                            <strong style={{ display: 'block', fontSize: '0.9rem', fontWeight: 900, marginBottom: '4px' }}>Attenzione</strong>
                                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, opacity: 0.8, lineHeight: 1.5 }}>Le impostazioni attuali verranno rimpiazzate da quelle del server sorgente. Questa azione non può essere annullata.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="pc-card-v2" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', color: 'white', border: 'none', boxShadow: '0 15px 35px rgba(124, 58, 237, 0.2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <Info size={22} />
                                    <h4 style={{ margin: 0, fontWeight: 900 }}>Suggerimento Platinum</h4>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, opacity: 0.9, lineHeight: 1.6 }}>
                                    La sincronizzazione funziona al meglio se i nomi dei canali e dei ruoli sono identici tra i due server. Verix mapperà automaticamente gli ID corrispondenti.
                                </p>
                            </section>
                        </div>

                        <div className="v-stack" style={{ gap: '32px' }}>
                            <section className="pc-card-v2">
                                <div className="card-header-v2">
                                    <div className="header-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}><Box size={18} /></div>
                                    <h3>Moduli da Sincronizzare</h3>
                                </div>
                                <div className="card-body-v2">
                                    <div className="pc-sync-modules-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                                        {modules.map(mod => (
                                            <div 
                                                key={mod.id} 
                                                className={`pc-sync-card-v2 ${selectedModules.includes(mod.id) ? 'active' : ''}`}
                                                style={{ padding: '20px', borderRadius: '20px', border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '16px' }}
                                                onClick={() => toggleModule(mod.id)}
                                            >
                                                <div className="sync-icon-box" style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', border: '1px solid #e2e8f0' }}>
                                                    <mod.icon size={20} />
                                                </div>
                                                <div className="v-stack" style={{ flex: 1 }}>
                                                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>{mod.label}</span>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8' }}>{mod.desc}</span>
                                                </div>
                                                <div className={`pc-sync-check ${selectedModules.includes(mod.id) ? 'active' : ''}`} style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {selectedModules.includes(mod.id) && <CheckCircle2 size={16} color="#7c3aed" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div style={{ marginTop: '40px', borderTop: '1px solid #f1f5f9', paddingTop: '32px' }}>
                                        <button 
                                            className="pc-btn-primary" 
                                            style={{ width: '100%', justifyContent: 'center', background: '#7c3aed', padding: '18px' }}
                                            onClick={handleSync}
                                            disabled={!sourceGuildId || selectedModules.length === 0 || syncing}
                                        >
                                            {syncing ? <RefreshCcw className="animate-spin" size={20} /> : <Copy size={20} />}
                                            <span style={{ fontSize: '1rem' }}>{syncing ? 'Sincronizzazione in corso...' : 'Avvia Clonazione Ecosystem'}</span>
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .pc-premium-wrapper { padding: 40px; max-width: 1550px; margin: 0 auto; font-family: 'Inter', sans-serif; }
                
                /* Header V2 */
                .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: white; padding: 32px; border-radius: 32px; box-shadow: var(--shadow-premium); border: 1px solid var(--border-light); }
                .header-info { display: flex; align-items: center; gap: 24px; }
                .pc-icon-box { width: 64px; height: 64px; color: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 24px rgba(124, 58, 237, 0.25); }
                .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
                .pc-title-row h1 { font-family: 'Inter', sans-serif; font-size: 2rem; font-weight: 900; margin: 0; color: #1e293b; letter-spacing: -0.5px; }
                
                .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 900; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px; }
                .pc-status-tag-v2.on { background: #f5f3ff; color: #7c3aed; }
                .pc-status-tag-v2.off { background: #fdf4ff; color: #a855f7; }
                .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

                .pc-btn-primary { background: var(--primary); color: white; border: none; padding: 14px 28px; border-radius: 16px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
                .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 25px rgba(124, 58, 237, 0.3); }
                .pc-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

                .pc-btn-ghost-v2 { background: transparent; color: #64748b; border: none; padding: 12px 24px; border-radius: 16px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
                .pc-btn-ghost-v2:hover { background: #f1f5f9; color: #1e293b; }

                .pc-card-v2 { background: white; border: 1px solid var(--border-light); border-radius: 32px; padding: 32px; box-shadow: var(--shadow-premium); }
                .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
                .header-icon { width: 44px; height: 44px; background: #f5f3ff; color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.2rem; font-weight: 900; color: #1e293b; }

                /* Sync Card Interactions */
                .pc-sync-card-v2:hover { border-color: #7c3aed !important; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(124, 58, 237, 0.08); }
                .pc-sync-card-v2.active { background: white !important; border-color: #7c3aed !important; box-shadow: 0 10px 25px rgba(124, 58, 237, 0.12) !important; }
                .pc-sync-card-v2.active .sync-icon-box { background: #f5f3ff !important; color: #7c3aed !important; border-color: #ddd6fe !important; }
                .pc-sync-card-v2.active .pc-sync-check { border-color: #7c3aed !important; }

                .v-stack { display: flex; flex-direction: column; }
                .animate { animation: slide-up 0.4s ease-out; }
                @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2 { background: #ffffff !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
            `}</style>
        </div>
    );
}
