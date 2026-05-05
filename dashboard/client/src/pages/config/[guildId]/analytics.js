import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useT } from '../../../contexts/LanguageContext';
import { 
    BarChart3, TrendingUp, Users, MessageSquare, 
    Zap, Crown, Lock, ChevronRight, Activity,
    Calendar, Download, Filter, RefreshCw
} from 'lucide-react';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';

export default function AnalyticsPage() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [guildData, setGuildData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!guildId || guildId === 'undefined') return;
    setLoading(true);
    try {
        const [gRes, aRes] = await Promise.all([
            api.request(`/config/${guildId}/guild`),
            api.request(`/analytics/${guildId}`).catch(() => ({ success: true, isPro: false, data: {} }))
        ]);
        
        setGuildData(gRes.data || gRes);
        setAnalytics(aRes.data || aRes);
    } catch (err) {
        console.error('Failed to fetch analytics data:', err);
    } finally {
        setLoading(false);
    }

  };

  useEffect(() => {
    setGuildData(null);
    setAnalytics(null);
    setLoading(true);
    fetchData();
  }, [guildId]);

  if (loading) return <Skeleton type="config" />;

  return (
    <div className="analytics-container animate">
        <header className="page-header">
            <div className="header-info">
                <div className="header-icon">
                    <BarChart3 size={24} />
                </div>
                <div className="header-text">
                    <h1>{t('sidebar.analytics')}</h1>
                    <p>Statistiche avanzate e monitoraggio attività del server.</p>
                </div>
            </div>
            {guildData?.isPremium && (
                <div className="header-actions">
                    <button className="btn-outline">
                        <Download size={16} /> Export CSV
                    </button>
                    <button className="btn-primary">
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>
            )}
        </header>
        <div className="analytics-content fade-in">
            {/* Stats Cards - Always visible (Basic data) */}
            <div className="stats-cards-grid">
                <div className="stat-card">
                    <div className="stat-label">Ticket Totali</div>
                    <div className="stat-value">{analytics?.tickets?.total || 0}</div>
                    {analytics?.isPro && (
                        <div className="stat-change positive">+{analytics?.tickets?.new7d || 0} questa settimana</div>
                    )}
                </div>
                <div className="stat-card">
                    <div className="stat-label">Infrazioni Totali</div>
                    <div className="stat-value">{analytics?.moderation?.total || 0}</div>
                    {analytics?.isPro && (
                        <div className="stat-change negative">{analytics?.moderation?.activeMutes || 0} mute attivi</div>
                    )}
                </div>
                <div className="stat-card premium-promo-card" onClick={() => !analytics?.isPro && router.push(`/config/${guildId}/premium`)}>
                    <div className="stat-label">Stato Servizio</div>
                    <div className="stat-value" style={{ fontSize: '1.5rem', color: analytics?.isPro ? 'var(--success)' : 'var(--gold)' }}>
                        {analytics?.isPro ? 'PREMIUM ACTIVE' : 'BASIC PLAN'}
                    </div>
                    {!analytics?.isPro && <div className="stat-change">Clicca per sbloccare i report</div>}
                </div>
            </div>

            {/* Advanced Section - Gated */}
            <div className={`advanced-analytics-section ${!analytics?.isPro ? 'gated' : ''}`}>
                {!analytics?.isPro && (
                    <div className="gate-overlay">
                        <Lock size={40} />
                        <h3>Analytics PRO Richieste</h3>
                        <p>Sblocca heatmap, performance staff e grafici di crescita con il piano Premium.</p>
                        <button className="btn-premium-cta" onClick={() => router.push(`/config/${guildId}/premium`)}>
                            Passa a Premium
                        </button>
                    </div>
                )}

                <div className="charts-grid" style={{ marginBottom: '24px' }}>
                    <div className="chart-box card" style={{ gridColumn: 'span 2' }}>
                        <div className="chart-header">
                            <h3>Heatmap Attività (24h)</h3>
                            <Activity size={16} />
                        </div>
                        <div className="heatmap-container">
                            {analytics?.data?.heatmap ? (
                                <div className="heatmap-grid">
                                    {analytics.data.heatmap.map((val, hour) => (
                                        <div 
                                            key={hour} 
                                            className="heatmap-cell" 
                                            style={{ opacity: Math.max(0.1, (val / Math.max(...analytics.data.heatmap, 1))) }}
                                            title={`${hour}:00 - ${val} azioni`}
                                        >
                                            <span className="hour-label">{hour}h</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-data-msg">Dati heatmap non disponibili.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="charts-grid">
                    <div className="chart-box card">
                        <div className="chart-header">
                            <h3>Crescita Membri (30gg)</h3>
                            <Users size={16} />
                        </div>
                        <div className="chart-placeholder">
                            {analytics?.data?.growth?.length > 1 ? (
                                <div className="mock-chart-container">
                                    <svg viewBox="0 0 400 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                        <path 
                                            d={`M ${analytics.data.growth.map((s, i) => `${(i / (analytics.data.growth.length - 1)) * 400},${100 - ((s.count / Math.max(...analytics.data.growth.map(x => x.count))) * 80 + 10)}`).join(' L ')}`} 
                                            fill="none" 
                                            stroke="var(--primary)" 
                                            strokeWidth="3" 
                                            strokeLinecap="round"
                                            style={{ filter: 'drop-shadow(0 0 8px var(--primary))' }}
                                        />
                                    </svg>
                                </div>
                            ) : (
                                <div className="no-data-msg">In attesa di raccogliere abbastanza dati...</div>
                            )}
                        </div>
                    </div>
                    <div className="chart-box card">
                        <div className="chart-header">
                            <h3>Performance Staff</h3>
                            <Shield size={16} />
                        </div>
                        <div className="staff-stats-list">
                            {analytics?.data?.staff?.length > 0 ? analytics.data.staff.map(s => (
                                <div key={s.id} className="staff-row">
                                    <div className="staff-id">ID: {s.id.substring(0, 8)}...</div>
                                    <div className="staff-bar-bg">
                                        <div className="staff-bar-fill" style={{ width: `${(s.closed / Math.max(...analytics.data.staff.map(x => x.closed))) * 100}%` }}></div>
                                    </div>
                                    <div className="staff-count">{s.closed}</div>
                                </div>
                            )) : (
                                <div className="no-data-msg">Nessuna attività staff registrata.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <style jsx>{`
            .analytics-container { padding: 20px; }
            .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: var(--primary-glow); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.8rem; font-weight: 800; color: var(--text-main); }
            .header-text p { color: var(--text-muted); font-size: 0.9rem; }
            
            .header-actions { display: flex; gap: 12px; }

            /* Upsell Styles */
            .premium-upsell { 
                display: flex; flex-direction: column; align-items: center; justify-content: center; 
                padding: 80px 40px; text-align: center; max-width: 800px; margin: 40px auto;
                background: linear-gradient(180deg, var(--bg-card), var(--bg-dark));
                border: 1px solid var(--gold);
                position: relative;
                overflow: hidden;
                border-radius: 24px;
            }
            .upsell-badge { 
                position: absolute; top: 20px; right: 20px; 
                background: var(--gold); color: white; padding: 4px 12px; 
                border-radius: 20px; font-size: 0.7rem; font-weight: 900;
                box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
            }
            .upsell-icon { 
                width: 100px; height: 100px; background: rgba(245, 158, 11, 0.1); 
                color: var(--gold); border-radius: 50%; display: flex; 
                align-items: center; justify-content: center; margin-bottom: 24px;
                animation: float 3s ease-in-out infinite;
            }
            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            .premium-upsell h2 { font-size: 2rem; font-weight: 900; margin-bottom: 12px; color: var(--text-main); }
            .premium-upsell p { color: var(--text-muted); font-size: 1.1rem; line-height: 1.6; max-width: 600px; margin-bottom: 40px; }
            
            .feature-grid { 
                display: grid; grid-template-columns: 1fr 1fr; gap: 20px; 
                text-align: left; margin-bottom: 40px; width: 100%; max-width: 600px;
            }
            .feat-item { 
                display: flex; align-items: center; gap: 12px; padding: 16px; 
                background: var(--bg-badge); border-radius: 12px; border: 1px solid var(--border);
                color: var(--text-main); font-weight: 600;
            }
            .feat-item svg { color: var(--gold); }

            .btn-premium-cta { 
                background: linear-gradient(135deg, #f59e0b, #fbbf24); 
                color: white; border: none; padding: 18px 36px; border-radius: 16px; 
                font-size: 1.1rem; font-weight: 800; cursor: pointer; transition: 0.3s;
                box-shadow: 0 10px 30px rgba(245, 158, 11, 0.4);
            }
            .btn-premium-cta:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 15px 40px rgba(245, 158, 11, 0.5); }

            /* Gated Section Styles */
            .advanced-analytics-section { position: relative; transition: 0.5s; }
            .advanced-analytics-section.gated { filter: blur(4px); pointer-events: none; user-select: none; }
            .gate-overlay { 
                position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
                z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center;
                background: rgba(10, 10, 12, 0.4); backdrop-filter: blur(8px);
                border-radius: 24px; text-align: center; color: white;
                padding: 40px;
            }
            .gate-overlay h3 { font-size: 1.5rem; font-weight: 800; margin: 16px 0 8px; }
            .gate-overlay p { font-size: 0.95rem; color: var(--text-muted); max-width: 400px; margin-bottom: 24px; }
            
            .premium-promo-card { 
                background: linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(245, 158, 11, 0.15)) !important;
                border: 1px dashed var(--gold) !important;
                cursor: pointer; transition: 0.3s;
            }
            .premium-promo-card:hover { transform: translateY(-2px); background: rgba(245, 158, 11, 0.2) !important; }

            /* Content Styles */
            .stats-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 24px; }
            .stat-card { padding: 24px; background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border); }
            .stat-label { color: var(--text-muted); font-size: 0.85rem; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; }
            .stat-value { font-size: 2.2rem; font-weight: 900; color: var(--text-main); margin-bottom: 8px; }
            .stat-change { font-size: 0.85rem; font-weight: 700; }
            .stat-change.positive { color: var(--success); }
            .stat-change.negative { color: var(--error); }

            .charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
            .chart-box { padding: 24px; }
            .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
            .chart-header h3 { font-size: 1.1rem; font-weight: 800; color: var(--text-main); }
            .chart-placeholder { height: 180px; display: flex; align-items: center; justify-content: center; position: relative; }
            
            .mock-chart-container { width: 100%; height: 100%; display: flex; align-items: flex-end; }
            .mock-bars { display: flex; align-items: flex-end; gap: 12px; height: 100%; width: 100%; justify-content: center; }
            .bar { width: 30px; background: var(--primary); border-radius: 8px 8px 0 0; opacity: 0.6; transition: 0.3s; }
            .bar:hover { opacity: 1; transform: scaleY(1.05); }

            .heatmap-grid { 
                display: grid; 
                grid-template-columns: repeat(24, 1fr); 
                gap: 4px; 
                height: 60px; 
                margin-top: 20px;
            }
            .heatmap-cell { 
                background: var(--primary); 
                border-radius: 4px; 
                height: 100%; 
                display: flex; 
                align-items: flex-end; 
                justify-content: center;
                position: relative;
                cursor: help;
            }
            .hour-label { 
                font-size: 0.6rem; 
                color: var(--text-muted); 
                position: absolute; 
                bottom: -20px; 
                white-space: nowrap;
                transform: rotate(-45deg);
            }

            .staff-stats-list { display: flex; flex-direction: column; gap: 16px; margin-top: 10px; }
            .staff-row { display: flex; align-items: center; gap: 12px; }
            .staff-id { font-size: 0.75rem; color: var(--text-muted); width: 80px; font-family: monospace; }
            .staff-bar-bg { flex: 1; height: 8px; background: var(--bg-badge); border-radius: 4px; overflow: hidden; }
            .staff-bar-fill { height: 100%; background: var(--primary); border-radius: 4px; }
            .staff-count { font-size: 0.85rem; font-weight: 800; color: var(--text-main); width: 30px; text-align: right; }
            .no-data-msg { color: var(--text-muted); font-size: 0.85rem; font-style: italic; text-align: center; margin: auto; }

            .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text-muted); padding: 10px 18px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; }
            .btn-primary { background: var(--primary); color: white; border: none; padding: 10px 18px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; }
        `}</style>
    </div>
  );
}
