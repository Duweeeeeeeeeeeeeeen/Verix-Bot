import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
    Users, Layout, Star, Zap, 
    Ticket, Bot, ChevronRight, 
    TrendingUp, Calendar, ShieldAlert
} from 'lucide-react';
import api from '../../utils/api';
import Skeleton from '../../components/Skeleton';
import { useT } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
    const { t } = useT();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const OWNER_IDS = ['361159834688552960', '314417452395626496'];
    const isOwner = user && OWNER_IDS.includes(user.id);

    useEffect(() => {
        if (!authLoading && !isOwner) {
            router.push('/');
        }
    }, [user, authLoading, isOwner]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.request('/admin/stats');
                setStats(res.data);
            } catch (err) {
                console.error('Failed to fetch admin stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading || !stats) return <Skeleton type="admin" height="600px" />;

    return (
        <div className="admin-page animate">
            <Head>
                <title>{t('admin.title')} | Verix</title>
            </Head>

            <header className="admin-header">
                <div className="header-content">
                    <div className="badge-admin">{t('admin.overview_badge')}</div>
                    <h1>{t('admin.title')}</h1>
                    <p>{t('admin.subtitle')}</p>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon"><Users /></div>
                    <div className="stat-info">
                        <h3>{stats.counts.guilds}</h3>
                        <p>{t('admin.total_servers')}</p>
                    </div>
                </div>
                <div className="stat-card premium">
                    <div className="stat-icon"><Star /></div>
                    <div className="stat-info">
                        <h3>{stats.counts.premium}</h3>
                        <p>{t('admin.premium_servers')}</p>
                    </div>
                </div>
                <div className="stat-card platinum">
                    <div className="stat-icon"><Zap /></div>
                    <div className="stat-info">
                        <h3>{stats.counts.platinum}</h3>
                        <p>{t('admin.platinum_servers')}</p>
                    </div>
                </div>
                <div className="stat-card ticket">
                    <div className="stat-icon"><Ticket /></div>
                    <div className="stat-info">
                        <h3>{stats.counts.tickets}</h3>
                        <p>{t('admin.total_tickets')}</p>
                    </div>
                </div>
            </div>

            <div className="admin-sections">
                <div className="recent-guilds card">
                    <div className="card-header">
                        <Calendar size={20} />
                        <h3>{t('admin.recent_guilds')}</h3>
                    </div>
                    <div className="guilds-list">
                        {stats.recentGuilds.map((guild) => (
                            <div key={guild.guildId} className="guild-item">
                                <div className="guild-main">
                                    <span className="guild-name">{guild.guildName}</span>
                                    <span className="guild-id">{guild.guildId}</span>
                                </div>
                                <div className="guild-meta">
                                    <span className={`badge-tier tier-${guild.premiumTier}`}>
                                        {guild.premiumTier.toUpperCase()}
                                    </span>
                                    <span className="join-date">
                                        {new Date(guild.joinedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="system-health card">
                    <div className="card-header">
                        <ShieldAlert size={20} />
                        <h3>{t('admin.system_status')}</h3>
                    </div>
                    <div className="health-metrics">
                        <div className="metric">
                            <span>{t('admin.private_bots')}</span>
                            <span className="metric-val">{stats.counts.privateBots}</span>
                        </div>
                        <div className="metric">
                            <span>{t('admin.system_version')}</span>
                            <span className="metric-val">v2.1.0-prod</span>
                        </div>
                        <div className="metric">
                            <span>{t('admin.node_env')}</span>
                            <span className="metric-val text-success">PRODUCTION</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .admin-page { padding: 40px; color: var(--text-main); }
                .admin-header { margin-bottom: 48px; position: relative; }
                .badge-admin { 
                    display: inline-block; padding: 4px 12px; background: var(--primary-glow); 
                    color: var(--primary); font-size: 0.7rem; font-weight: 800; 
                    border-radius: 20px; margin-bottom: 16px; 
                }
                .admin-header h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 8px; }
                .admin-header p { color: var(--text-muted); font-size: 1.1rem; }

                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 48px; }
                .stat-card { 
                    background: var(--bg-card); padding: 24px; border-radius: 24px; 
                    border: 1px solid var(--border); display: flex; align-items: center; gap: 20px;
                    transition: 0.3s;
                }
                .stat-card:hover { transform: translateY(-5px); border-color: var(--primary); }
                .stat-icon { 
                    width: 56px; height: 56px; border-radius: 16px; background: var(--bg-badge);
                    display: flex; align-items: center; justify-content: center; color: var(--text-muted);
                }
                .stat-card.premium .stat-icon { color: #fbbf24; background: rgba(251, 191, 36, 0.1); }
                .stat-card.platinum .stat-icon { color: #a855f7; background: rgba(168, 85, 247, 0.1); }
                .stat-card.ticket .stat-icon { color: #10b981; background: rgba(16, 185, 129, 0.1); }
                
                .stat-info h3 { font-size: 1.8rem; font-weight: 800; line-height: 1.2; }
                .stat-info p { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }

                .admin-sections { display: grid; grid-template-columns: 1.5fr 1fr; gap: 32px; }
                .card { background: var(--bg-card); border-radius: 24px; border: 1px solid var(--border); padding: 24px; }
                .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 16px; }
                .card-header h3 { font-size: 1.1rem; font-weight: 800; }

                .guilds-list { display: flex; flex-direction: column; gap: 12px; }
                .guild-item { 
                    display: flex; justify-content: space-between; align-items: center; 
                    padding: 16px; background: var(--bg-badge); border-radius: 16px; border: 1px solid var(--border);
                }
                .guild-main { display: flex; flex-direction: column; }
                .guild-name { font-weight: 700; font-size: 1rem; }
                .guild-id { font-size: 0.75rem; color: var(--text-muted); }

                .guild-meta { text-align: right; display: flex; flex-direction: column; gap: 4px; }
                .badge-tier { font-size: 0.65rem; font-weight: 900; padding: 2px 8px; border-radius: 6px; }
                .tier-none { background: rgba(255,255,255,0.05); color: var(--text-muted); }
                .tier-premium { background: rgba(251, 191, 36, 0.1); color: #fbbf24; }
                .tier-platinum { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
                .join-date { font-size: 0.75rem; color: var(--text-dim); }

                .health-metrics { display: flex; flex-direction: column; gap: 16px; }
                .metric { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-badge); border-radius: 12px; }
                .metric span:first-child { font-size: 0.9rem; color: var(--text-muted); font-weight: 600; }
                .metric-val { font-weight: 800; font-family: monospace; }
                .text-success { color: #10b981; }

                @media (max-width: 1000px) {
                    .stats-grid { grid-template-columns: 1fr 1fr; }
                    .admin-sections { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
