import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useT } from '../../../contexts/LanguageContext';
import { 
    BarChart3, TrendingUp, Users, MessageSquare, 
    Zap, Crown, Lock, ChevronRight, Activity,
    Calendar, Download, Filter, RefreshCw, Shield,
    ArrowUpRight, Target, Clock, Star, AlertCircle,
    TrendingDown, CheckCircle2, ChevronLeft, Layout,
    PieChart, MousePointer2, Sparkles, LineChart,
    Users2, ShieldCheck, EyeOff, RefreshCcw
} from 'lucide-react';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import Head from 'next/head';

export default function AnalyticsPage() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [guildData, setGuildData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    if (!guildId || !mounted) return;
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
        const [gRes, aRes] = await Promise.all([
            api.request(`/config/${guildId}/guild`),
            api.request(`/analytics/${guildId}`).catch(() => ({ success: true, isPro: false, data: {
                tickets: { total: 0, new7d: 0 },
                moderation: { total: 0, activeMutes: 0 },
                heatmap: Array(24).fill(0),
                growth: [],
                staff: []
            } }))
        ]);
        
        setGuildData(gRes.data || gRes);
        setAnalytics(aRes);
    } catch (err) {
        console.error('Failed to fetch analytics data:', err);
    } finally {
        setLoading(false);
        window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [guildId, mounted]);

  if (!mounted || loading) return <Skeleton height="600px" />;

  const isPro = analytics?.isPro || guildData?.isPremium || ['premium', 'platinum'].includes(guildData?.premiumTier);
  const stats = analytics?.data || {};

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>Analytics & Reports | Verix Studio</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
                    <BarChart3 size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>Intelligence Hub</h1>
                    <div className="pc-status-tag-v2 on">
                        <div className="status-dot-v2"></div>
                        DATA SYNC LIVE
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                {isPro && (
                    <button className="pc-btn-outline-v2" onClick={() => {}}>
                        <Download size={18} /> <span>Export Dataset</span>
                    </button>
                )}
                <button className="pc-btn-primary" onClick={fetchData}>
                    <RefreshCw size={18} /> <span>Refresh Engine</span>
                </button>
            </div>
        </header>

        <div className="pc-content-v2">
            {/* V2 Stat Matrix */}
            <div className="pc-stat-matrix-v2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                <section className="pc-stat-card-v2 animate slide-up">
                    <div className="s-card-glow-v2" style={{ background: 'rgba(99, 102, 241, 0.05)' }}></div>
                    <div className="s-header-v2">
                        <div className="s-icon-box-v2" style={{ background: '#f5f3ff', color: '#6366f1' }}>
                            <MessageSquare size={20} />
                        </div>
                        <div className="v-stack">
                            <span className="s-label-v2">Operations Flow</span>
                            <h3 className="s-value-v2">{stats?.tickets?.total || 0}</h3>
                        </div>
                    </div>
                    <div className="s-footer-v2">
                        {isPro ? (
                            <div className="s-trend-box-v2 positive">
                                <ArrowUpRight size={14} />
                                <span>+{stats?.tickets?.new7d || 0} Ticket (7d)</span>
                            </div>
                        ) : (
                            <div className="s-lock-badge-v2"><Lock size={12} /> Pro-Trends Locked</div>
                        )}
                    </div>
                </section>

                <section className="pc-stat-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="s-card-glow-v2" style={{ background: 'rgba(239, 68, 68, 0.05)' }}></div>
                    <div className="s-header-v2">
                        <div className="s-icon-box-v2" style={{ background: '#fef2f2', color: '#ef4444' }}>
                            <Shield size={20} />
                        </div>
                        <div className="v-stack">
                            <span className="s-label-v2">Security Impact</span>
                            <h3 className="s-value-v2">{stats?.moderation?.total || 0}</h3>
                        </div>
                    </div>
                    <div className="s-footer-v2">
                        {isPro ? (
                            <div className="s-trend-box-v2 neutral">
                                <Activity size={14} />
                                <span>{stats?.moderation?.activeMutes || 0} Sanzioni Attive</span>
                            </div>
                        ) : (
                            <div className="s-lock-badge-v2"><Lock size={12} /> Impact Locked</div>
                        )}
                    </div>
                </section>

                <section className={`pc-stat-card-v2 animate slide-up tier-aware-v2 ${isPro ? 'pro' : 'base'}`} style={{ animationDelay: '0.2s' }} onClick={() => !isPro && router.push(`/config/${guildId}/premium`)}>
                    <div className="s-card-glow-v2"></div>
                    <div className="s-header-v2">
                        <div className="s-icon-box-v2">
                            <Crown size={20} />
                        </div>
                        <div className="v-stack">
                            <span className="s-label-v2">Intelligence Level</span>
                            <h3 className="s-value-v2" style={{ fontSize: '1.4rem' }}>{isPro ? 'PLATINUM' : 'STANDARD'}</h3>
                        </div>
                    </div>
                    <div className="s-footer-v2">
                        <div className="s-tier-action-v2">
                            {isPro ? (
                                <span>Accesso Completo Attivo</span>
                            ) : (
                                <>
                                    <span>Sblocca Studio Hub</span>
                                    <ChevronRight size={16} />
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            <div className="pc-analytics-engine-v2">
                {!isPro ? (
                    <div className="pc-pro-gate-box-v2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '48px', padding: '120px 40px', textAlign: 'center', maxWidth: '1000px', margin: '0 auto', boxShadow: 'var(--shadow-premium)' }}>
                         <div className="gate-icon-glow-v2" style={{ width: '100px', height: '100px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px', boxShadow: '0 20px 40px rgba(245, 158, 11, 0.2)' }}>
                            <LineChart size={52} />
                         </div>
                         <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '3rem', color: 'var(--text-heading)', marginBottom: '20px', letterSpacing: '-1.5px' }}>Intelligence Visual Studio</h2>
                         <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 60px', fontWeight: 650, lineHeight: 1.6 }}>Analizza l'andamento del tuo server con grafici di crescita, heatmap di attività staff e performance dettagliate in tempo reale.</p>
                         
                         <div className="gate-feature-matrix-v2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'left', maxWidth: '850px', margin: '0 auto 64px' }}>
                            {[
                                { icon: <Activity size={18} />, text: 'Staff Performance Heatmap' },
                                { icon: <Users2 size={18} />, text: 'Real-time Growth Engine' },
                                { icon: <ShieldCheck size={18} />, text: 'Security Impact Reports' }
                            ].map((p, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-badge)', padding: '18px', borderRadius: '20px', border: '1.5px solid var(--border)', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    <div style={{ color: '#f59e0b' }}>{p.icon}</div>
                                    <span>{p.text}</span>
                                </div>
                            ))}
                         </div>

                         <button className="pc-btn-platinum-v2" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', color: 'white', border: 'none', padding: '22px 56px', borderRadius: '22px', fontWeight: 700, fontSize: '1.15rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', margin: '0 auto', boxShadow: '0 15px 35px rgba(245, 158, 11, 0.3)', transition: '0.3s' }} onClick={() => router.push(`/config/${guildId}/premium`)}>
                            <Sparkles size={22} />
                            <span>Upgrade a Platinum Studio</span>
                         </button>
                    </div>
                ) : (
                    <div className="pc-studio-layout-v2" style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '32px' }}>
                        <div className="v-stack" style={{ gap: '32px' }}>
                            {/* Heatmap Section */}
                            <section className="pc-card-v2 animate slide-up">
                                <div className="card-header-v2">
                                    <div className="header-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><Activity size={18} /></div>
                                    <div className="v-stack" style={{ flex: 1 }}>
                                        <h3 style={{ margin: 0 }}>Traffic Distribution (24h)</h3>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 650 }}>Heatmap dell'attività globale rilevata sul server.</p>
                                    </div>
                                </div>
                                <div className="card-body-v2">
                                    <div className="pc-heatmap-engine-v2" style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '220px', paddingBottom: '32px' }}>
                                        {(stats?.heatmap || Array(24).fill(0)).map((val, hour) => {
                                            const max = Math.max(...(stats?.heatmap || [1]));
                                            const height = max > 0 ? (val / max) * 100 : 0;
                                            return (
                                                <div key={hour} className="h-column-v2" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', height: '100%', position: 'relative' }} title={`${hour}:00 - ${val} eventi`}>
                                                    <div className="h-fill-v2" style={{ width: '100%', background: 'linear-gradient(to top, #10b981, #34d399)', borderRadius: '10px', height: `${Math.max(height, 4)}%`, transition: '1.5s cubic-bezier(0.4, 0, 0.2, 1)', opacity: height > 0 ? 1 : 0.3, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}></div>
                                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-dim)' }}>{hour}h</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </section>

                            {/* Growth Chart Section */}
                            <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                                <div className="card-header-v2">
                                    <div className="header-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><LineChart size={18} /></div>
                                    <div className="v-stack" style={{ flex: 1 }}>
                                        <h3 style={{ margin: 0 }}>Community Growth Trend</h3>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 650 }}>Analisi storica dei membri acquisiti.</p>
                                    </div>
                                </div>
                                <div className="card-body-v2" style={{ height: '300px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {stats?.growth?.length > 1 ? (
                                        <svg viewBox="0 0 800 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                            <defs>
                                                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
                                                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                            <path d={`M 0,200 L ${stats.growth.map((s, i) => `${(i / (stats.growth.length - 1)) * 800},${200 - ((s.count / Math.max(...stats.growth.map(x => x.count))) * 160 + 20)}`).join(' L ')} L 800,200 Z`} fill="url(#growthGrad)" />
                                            <path d={`M ${stats.growth.map((s, i) => `${(i / (stats.growth.length - 1)) * 800},${200 - ((s.count / Math.max(...stats.growth.map(x => x.count))) * 160 + 20)}`).join(' L ')}`} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <div className="pc-empty-state-v2" style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
                                            <EyeOff size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                            <p style={{ fontWeight: 700 }}>Data Points Insufficienti</p>
                                            <span style={{ fontSize: '0.8rem' }}>Attendi la prossima scansione del sistema.</span>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        <aside className="v-stack" style={{ gap: '32px' }}>
                            <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.2s' }}>
                                <div className="card-header-v2">
                                    <div className="header-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}><Target size={18} /></div>
                                    <h3 style={{ margin: 0 }}>Staff Power</h3>
                                </div>
                                <div className="card-body-v2">
                                    <div className="pc-staff-engine-v2" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        {(stats?.staff || []).length > 0 ? stats.staff.map((s, i) => (
                                            <div key={i} className="pc-rank-bar-v2">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-heading)' }}>Moderator {s.id.slice(-4)}</span>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#7c3aed' }}>{s.closed}</span>
                                                </div>
                                                <div style={{ height: '10px', background: 'var(--bg-badge)', borderRadius: '10px', overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', background: 'linear-gradient(90deg, #7c3aed, #a855f7)', borderRadius: '10px', width: `${(s.closed / Math.max(...stats.staff.map(x => x.closed))) * 100}%`, transition: '1s ease-out' }}></div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-badge)', borderRadius: '20px', color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 700 }}>
                                                Nessun dato staffer rilevato.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <div className="pc-sync-alert-v2 animate slide-up">
                                 <div className="align-center" style={{ gap: '16px', position: 'relative', zIndex: 2 }}>
                                     <div className="sync-icon-wrapper">
                                        <RefreshCcw size={20} className="spin" />
                                     </div>
                                     <div className="v-stack">
                                         <span className="sync-label-v2">Frequenza Aggiornamento</span>
                                         <span className="sync-value-v2">Ciclo 6 Ore</span>
                                     </div>
                                 </div>
                                 <div className="sync-bg-icon">
                                    <Activity size={100} />
                                 </div>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1500px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 12px 24px rgba(99, 102, 241, 0.2); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Inter', sans-serif; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 700; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px;  width: fit-content; }
            .pc-status-tag-v2.on { background: rgba(16, 185, 129, 0.1); color: #10b981; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: #ef4444; }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 14px 28px; border-radius: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.3s; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 25px rgba(99, 102, 241, 0.3); }

            .pc-btn-outline-v2 { display: flex; align-items: center; gap: 10px; background: var(--bg-card); color: var(--text-muted); border: 1.5px solid var(--border); padding: 12px 24px; border-radius: 16px; font-weight: 700; cursor: pointer; transition: 0.2s; }
            .pc-btn-outline-v2:hover { border-color: var(--primary); color: var(--primary); }

            /* Stat Cards V2 */
            .pc-stat-card-v2 { background: var(--bg-card); border: 1px solid var(--border-light); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); position: relative; overflow: hidden; transition: 0.3s; }
            .pc-stat-card-v2:hover { transform: translateY(-5px); }
            .s-card-glow-v2 { position: absolute; inset: 0; z-index: 1; }
            .s-header-v2 { display: flex; align-items: center; gap: 20px; position: relative; z-index: 2; margin-bottom: 24px; }
            .s-icon-box-v2 { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
            .s-label-v2 { font-size: 0.75rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; }
            .s-value-v2 { margin: 4px 0 0 0; font-family: 'Inter'; font-size: 2.2rem; font-weight: 700; color: var(--text-heading); line-height: 1; }
            
            .s-footer-v2 { position: relative; z-index: 2; border-top: 1.5px solid var(--bg-badge); padding-top: 20px; }
            .s-trend-box-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 700; }
            .s-trend-box-v2.positive { color: #10b981; }
            .s-trend-box-v2.neutral { color: var(--primary); }
            .s-lock-badge-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.7rem; color: var(--text-dim); font-weight: 700; text-transform: uppercase; }

            .tier-aware-v2.base { cursor: pointer; background: var(--bg-badge); }
            .tier-aware-v2.pro { background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); border: none; color: #fff; }
            .tier-aware-v2.pro .s-label-v2, .tier-aware-v2.pro .s-value-v2, .tier-aware-v2.pro .s-tier-action-v2 { color: #fff; }
            .tier-aware-v2.pro .s-icon-box-v2 { background: rgba(255,255,255,0.2); color: #fff; }
            .s-tier-action-v2 { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: 700; }

            /* Card V2 */
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border-light); border-radius: 32px; padding: 40px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.5rem; font-weight: 700; color: var(--text-heading); }

            .v-stack { display: flex; flex-direction: column; }
            .align-center { display: flex; align-items: center; }
            .spin { animation: spin-slow 4s linear infinite; }
            @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-stat-card-v2, :global(.light-theme) .pc-pro-gate-box-v2 { box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }

            /* Sync Alert V2 - Theme Aware */
            .pc-sync-alert-v2 { background: linear-gradient(135deg, #1e1b4b 0%, #020617 100%); color: white; border-radius: 32px; padding: 32px; position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
            .sync-icon-wrapper { width: 48px; height: 48px; background: rgba(255,255,255,0.1); border-radius: 16px; display: flex; align-items: center; justify-content: center; }
            .sync-label-v2 { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: rgba(255,255,255,0.5); letter-spacing: 1px; }
            .sync-value-v2 { font-size: 1rem; font-weight: 700; }
            .sync-bg-icon { position: absolute; bottom: -20px; right: -20px; opacity: 0.1; pointer-events: none; }

            :global(.light-theme) .pc-sync-alert-v2 {
                background: white !important;
                color: var(--text-heading) !important;
                border: 1px solid var(--border) !important;
                box-shadow: var(--shadow-premium) !important;
            }
            :global(.light-theme) .sync-icon-wrapper {
                background: var(--bg-badge) !important;
                color: var(--primary) !important;
            }
            :global(.light-theme) .sync-label-v2 {
                color: var(--text-dim) !important;
            }
            :global(.light-theme) .sync-bg-icon {
                color: var(--primary) !important;
                opacity: 0.05 !important;
            }
        `}</style>
    </div>
  );
}
