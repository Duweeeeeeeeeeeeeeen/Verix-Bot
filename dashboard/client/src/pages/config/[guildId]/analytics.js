import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useT } from '../../../contexts/LanguageContext';
import { 
    BarChart3, TrendingUp, Users, MessageSquare, 
    Zap, Crown, Lock, ChevronRight, Activity,
    Calendar, Download, Filter, RefreshCw, Shield
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
        setAnalytics(aRes); // Keep the full response to access isPro
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

  const isPro = analytics?.isPro || guildData?.isPremium || ['premium', 'platinum'].includes(guildData?.premiumTier);
  const stats = analytics?.data || {};

  return (
    <div className="analytics-container animate">
        <header className="page-header">
            <div className="header-info">
                <div className="header-icon-glow">
                    <BarChart3 size={24} />
                </div>
                <div className="header-text">
                    <h1>{t('sidebar.analytics')}</h1>
                    <p>Monitoraggio in tempo reale e approfondimenti basati sui dati.</p>
                </div>
            </div>
            {isPro && (
                <div className="header-actions">
                    <button className="btn-glass">
                        <Download size={16} /> Esporta Report
                    </button>
                    <button className="btn-primary-premium" onClick={fetchData}>
                        <RefreshCw size={16} /> Sincronizza
                    </button>
                </div>
            )}
        </header>

        <div className="analytics-content fade-in">
            {/* Main Stats Grid */}
            <div className="stats-cards-grid">
                <div className="stat-card glass-card">
                    <div className="stat-label-row">
                        <MessageSquare size={14} />
                        <span>Ticket Totali</span>
                    </div>
                    <div className="stat-value">{stats?.tickets?.total || 0}</div>
                    {isPro ? (
                        <div className="stat-change positive">
                            <TrendingUp size={12} />
                            <span>+{stats?.tickets?.new7d || 0} nuovi (7gg)</span>
                        </div>
                    ) : (
                        <div className="stat-locked-label">Sblocca trend con PRO</div>
                    )}
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-label-row">
                        <Shield size={14} />
                        <span>Infrazioni</span>
                    </div>
                    <div className="stat-value">{stats?.moderation?.total || 0}</div>
                    {isPro ? (
                        <div className="stat-change neutral">
                            <Activity size={12} />
                            <span>{stats?.moderation?.activeMutes || 0} sanzioni attive</span>
                        </div>
                    ) : (
                        <div className="stat-locked-label">Sblocca monitoraggio PRO</div>
                    )}
                </div>

                <div className={`stat-card status-card ${isPro ? 'pro' : 'basic'}`} onClick={() => !isPro && router.push(`/config/${guildId}/premium`)}>
                    <div className="stat-label-row">
                        <Crown size={14} />
                        <span>Piano Attivo</span>
                    </div>
                    <div className="stat-value-status">
                        {isPro ? 'PREMIUM ACTIVE' : 'BASIC PLAN'}
                    </div>
                    <div className="stat-status-footer">
                        {isPro ? 'Tutti i report sbloccati' : 'Fai l\'upgrade per i report PRO'}
                        <ChevronRight size={14} />
                    </div>
                </div>
            </div>

            {/* Advanced Insights Section */}
            <div className={`advanced-section ${!isPro ? 'gated-container' : ''}`}>
                {!isPro && (
                    <div className="pro-gate-overlay">
                        <div className="gate-content">
                            <div className="lock-icon-container">
                                <Lock size={32} />
                            </div>
                            <h2>Report Avanzati Bloccati</h2>
                            <p>Accedi a grafici di crescita, heatmap di attività e analisi delle performance del team.</p>
                            <button className="btn-premium-upgrade" onClick={() => router.push(`/config/${guildId}/premium`)}>
                                Passa a Premium ora
                            </button>
                        </div>
                    </div>
                )}

                <div className="insights-grid">
                    {/* Activity Heatmap */}
                    <div className="insight-box glass-card wide">
                        <div className="insight-header">
                            <div className="insight-title">
                                <Activity size={18} />
                                <h3>Heatmap Attività (24h)</h3>
                            </div>
                            <span className="insight-desc">Distribuzione oraria delle interazioni</span>
                        </div>
                        <div className="heatmap-wrapper">
                            {stats?.heatmap ? (
                                <div className="heatmap-visual">
                                    {stats.heatmap.map((val, hour) => (
                                        <div 
                                            key={hour} 
                                            className="heatmap-column" 
                                            style={{ 
                                                '--val': val,
                                                '--max': Math.max(...stats.heatmap, 1),
                                                opacity: Math.max(0.15, (val / Math.max(...stats.heatmap, 1))) 
                                            }}
                                            title={`${hour}:00 - ${val} eventi`}
                                        >
                                            <div className="heatmap-bar"></div>
                                            <span className="heatmap-label">{hour}h</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-data-placeholder">
                                    <Calendar size={32} />
                                    <p>Dati non ancora disponibili per questo server.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Growth Chart */}
                    <div className="insight-box glass-card">
                        <div className="insight-header">
                            <div className="insight-title">
                                <Users size={18} />
                                <h3>Crescita Community</h3>
                            </div>
                        </div>
                        <div className="growth-chart-container">
                            {stats?.growth?.length > 1 ? (
                                <div className="svg-chart-wrapper">
                                    <svg viewBox="0 0 400 120" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                                                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path 
                                            d={`M 0,120 L ${stats.growth.map((s, i) => `${(i / (stats.growth.length - 1)) * 400},${120 - ((s.count / Math.max(...stats.growth.map(x => x.count))) * 90 + 10)}`).join(' L ')} L 400,120 Z`}
                                            fill="url(#chartGradient)"
                                        />
                                        <path 
                                            d={`M ${stats.growth.map((s, i) => `${(i / (stats.growth.length - 1)) * 400},${120 - ((s.count / Math.max(...stats.growth.map(x => x.count))) * 90 + 10)}`).join(' L ')}`} 
                                            fill="none" 
                                            stroke="var(--primary)" 
                                            strokeWidth="2.5" 
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            ) : (
                                <div className="no-data-placeholder mini">
                                    <p>Tracking in corso...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Staff Performance */}
                    <div className="insight-box glass-card">
                        <div className="insight-header">
                            <div className="insight-title">
                                <Zap size={18} />
                                <h3>Top Performance Staff</h3>
                            </div>
                        </div>
                        <div className="staff-leaderboard">
                            {stats?.staff?.length > 0 ? stats.staff.map((s, idx) => (
                                <div key={s.id} className="staff-item">
                                    <div className="staff-rank">{idx + 1}</div>
                                    <div className="staff-details">
                                        <div className="staff-name">Staffer {s.id.slice(-4)}</div>
                                        <div className="staff-progress-bg">
                                            <div 
                                                className="staff-progress-fill" 
                                                style={{ width: `${(s.closed / Math.max(...stats.staff.map(x => x.closed))) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="staff-score">{s.closed}</div>
                                </div>
                            )) : (
                                <div className="no-data-placeholder mini">
                                    <p>Nessun dato staffer.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <style jsx>{`
            .analytics-container { padding: 32px; max-width: 1400px; margin: 0 auto; }
            .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
            .header-info { display: flex; align-items: center; gap: 20px; }
            .header-icon-glow { 
                width: 56px; height: 56px; background: var(--primary-glow); 
                color: var(--primary); border-radius: 16px; display: flex; 
                align-items: center; justify-content: center;
                box-shadow: 0 8px 24px rgba(var(--primary-rgb), 0.2);
            }
            .header-text h1 { font-size: 2.2rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.5px; }
            .header-text p { color: var(--text-muted); font-size: 1rem; margin-top: 4px; }
            
            .header-actions { display: flex; gap: 12px; }

            /* Glass Cards */
            .glass-card {
                background: var(--bg-card-glass);
                backdrop-filter: blur(12px);
                border: 1px solid var(--border-light);
                border-radius: 24px;
                padding: 24px;
                transition: all 0.3s ease;
            }
            .glass-card:hover { border-color: var(--primary-muted); transform: translateY(-2px); }

            /* Stats Grid */
            .stats-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px; }
            .stat-card { display: flex; flex-direction: column; min-height: 160px; }
            .stat-label-row { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 0.85rem; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
            .stat-value { font-size: 2.8rem; font-weight: 900; color: var(--text-main); line-height: 1; }
            .stat-change { display: flex; align-items: center; gap: 4px; font-size: 0.85rem; font-weight: 700; margin-top: auto; }
            .stat-change.positive { color: var(--success); }
            .stat-change.neutral { color: var(--primary); }
            .stat-locked-label { font-size: 0.8rem; color: var(--text-muted); font-style: italic; margin-top: auto; }

            .status-card { 
                cursor: pointer; position: relative; overflow: hidden;
                background: linear-gradient(135deg, var(--bg-card-glass), var(--bg-badge));
            }
            .status-card.basic { border: 1px dashed var(--gold); }
            .status-card.pro { border: 1px solid var(--success-muted); }
            .stat-value-status { font-size: 1.5rem; font-weight: 900; margin: 8px 0; }
            .status-card.basic .stat-value-status { color: var(--gold); }
            .status-card.pro .stat-value-status { color: var(--success); }
            .stat-status-footer { display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-top: auto; }

            /* Advanced Section Gate */
            .advanced-section { position: relative; min-height: 500px; }
            .gated-container { filter: blur(6px); pointer-events: none; user-select: none; }
            .pro-gate-overlay {
                position: absolute; inset: -20px; z-index: 100;
                display: flex; align-items: center; justify-content: center;
                background: rgba(var(--bg-rgb), 0.4);
                backdrop-filter: blur(10px);
                border-radius: 32px;
            }
            .gate-content { text-align: center; max-width: 400px; padding: 40px; }
            .lock-icon-container { 
                width: 80px; height: 80px; background: var(--gold-glow); color: var(--gold);
                border-radius: 50%; display: flex; align-items: center; justify-content: center;
                margin: 0 auto 24px; box-shadow: 0 0 40px rgba(245, 158, 11, 0.2);
            }
            .gate-content h2 { font-size: 1.8rem; font-weight: 800; margin-bottom: 12px; color: var(--text-main); }
            .gate-content p { color: var(--text-muted); margin-bottom: 32px; line-height: 1.6; }

            /* Insights Grid */
            .insights-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; }
            .insight-box.wide { grid-column: span 2; }
            .insight-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
            .insight-title { display: flex; align-items: center; gap: 12px; color: var(--primary); }
            .insight-title h3 { font-size: 1.1rem; font-weight: 800; color: var(--text-main); }
            .insight-desc { font-size: 0.8rem; color: var(--text-muted); }

            /* Heatmap */
            .heatmap-wrapper { padding: 10px 0; }
            .heatmap-visual { display: flex; align-items: flex-end; gap: 6px; height: 100px; width: 100%; }
            .heatmap-column { 
                flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; 
                height: 100%; position: relative;
            }
            .heatmap-bar { 
                width: 100%; background: var(--primary); border-radius: 4px; 
                height: calc((var(--val) / var(--max)) * 100%);
                transition: height 1s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .heatmap-label { font-size: 0.65rem; color: var(--text-muted); font-weight: 600; }

            /* Chart */
            .growth-chart-container { height: 180px; position: relative; width: 100%; overflow: hidden; border-radius: 12px; }
            .svg-chart-wrapper { width: 100%; height: 100%; }

            /* Leaderboard */
            .staff-leaderboard { display: flex; flex-direction: column; gap: 16px; }
            .staff-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
            .staff-rank { 
                width: 28px; height: 28px; background: var(--bg-badge); 
                border-radius: 8px; display: flex; align-items: center; 
                justify-content: center; font-size: 0.8rem; font-weight: 800; color: var(--primary);
            }
            .staff-details { flex: 1; }
            .staff-name { font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-bottom: 6px; }
            .staff-progress-bg { height: 6px; background: var(--bg-badge); border-radius: 3px; overflow: hidden; }
            .staff-progress-fill { height: 100%; background: var(--primary); border-radius: 3px; }
            .staff-score { font-size: 0.9rem; font-weight: 800; color: var(--text-main); }

            /* Placeholders */
            .no-data-placeholder { 
                display: flex; flex-direction: column; align-items: center; justify-content: center; 
                gap: 16px; padding: 40px; color: var(--text-muted); text-align: center;
            }
            .no-data-placeholder.mini { padding: 20px; }
            .no-data-placeholder p { font-size: 0.9rem; font-style: italic; }

            /* Buttons */
            .btn-glass { 
                background: var(--bg-badge); color: var(--text-main); border: 1px solid var(--border);
                padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer;
                display: flex; align-items: center; gap: 8px; transition: 0.3s;
            }
            .btn-glass:hover { background: var(--bg-card-glass); border-color: var(--primary); }
            
            .btn-primary-premium {
                background: var(--primary); color: white; border: none;
                padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer;
                display: flex; align-items: center; gap: 8px; transition: 0.3s;
                box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
            }
            .btn-primary-premium:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.4); }

            .btn-premium-upgrade {
                background: linear-gradient(135deg, #f59e0b, #fbbf24);
                color: white; border: none; padding: 16px 32px; border-radius: 16px;
                font-size: 1.1rem; font-weight: 800; cursor: pointer; transition: 0.3s;
                box-shadow: 0 10px 30px rgba(245, 158, 11, 0.4);
            }
            .btn-premium-upgrade:hover { transform: scale(1.05); box-shadow: 0 15px 40px rgba(245, 158, 11, 0.5); }

            @media (max-width: 1000px) {
                .insights-grid { grid-template-columns: 1fr; }
                .stats-cards-grid { grid-template-columns: 1fr; }
            }

            /* Force Light Mode Visibility */
            :global(.light-theme) .stat-glass-card, :global(.light-theme) .insight-glass-card { 
                background: rgba(255, 255, 255, 0.9) !important; 
                border-color: rgba(0, 0, 0, 0.1) !important; 
                box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important;
            }
            :global(.light-theme) .page-header-premium { 
                background: white !important; 
                box-shadow: 0 4px 20px rgba(0,0,0,0.05) !important; 
                border-color: rgba(0,0,0,0.08) !important;
            }
            :global(.light-theme) .staff-progress-bg { background: #f1f5f9 !important; }
            :global(.light-theme) .insight-header h3 { color: #0f172a !important; }
        `}</style>
    </div>
  );
}
