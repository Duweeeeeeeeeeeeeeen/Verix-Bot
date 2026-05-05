import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useT } from '../../../contexts/LanguageContext';
import { 
    History, Search, Filter, Shield, 
    User, Calendar, ChevronRight, Lock, 
    Crown, Download, Trash2, Clock
} from 'lucide-react';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';

export default function AuditPage() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [guildData, setGuildData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const fetchData = async () => {
    if (!guildId || guildId === 'undefined') return;
    setLoading(true);
    try {
        const gRes = await api.request(`/config/${guildId}/guild`);
        const gData = gRes.data || gRes;
        setGuildData(gData);

        if (gData.isPremium) {
            const lRes = await api.request(`/config/${guildId}/audit-logs`);
            setLogs(lRes.data || lRes);
        }
    } catch (err) {
        console.error('Failed to fetch audit data:', err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [guildId]);

  const filteredLogs = logs.filter(log => {
      const matchesSearch = log.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAction = filterAction === 'ALL' || log.action === filterAction;
      return matchesSearch && matchesAction;
  });

  const getActionBadgeClass = (action) => {
      if (action.includes('UPDATE')) return 'badge-update';
      if (action.includes('DELETE') || action.includes('RESET')) return 'badge-danger';
      if (action.includes('SAVE') || action.includes('CREATE')) return 'badge-success';
      return 'badge-info';
  };

  if (loading) return <Skeleton type="config" />;

  return (
    <div className="audit-container animate">
        <header className="page-header">
            <div className="header-info">
                <div className="header-icon">
                    <History size={24} />
                </div>
                <div className="header-text">
                    <h1>{t('audit.title')}</h1>
                    <p>{t('audit.desc')}</p>
                </div>
            </div>
            {guildData?.isPremium && (
                <div className="header-actions">
                    <button className="btn-outline">
                        <Download size={16} /> {t('audit.export')}
                    </button>
                </div>
            )}
        </header>

        {!guildData?.isPremium ? (
            <div className="premium-upsell card">
                <div className="upsell-badge">{t('audit.pro_badge')}</div>
                <div className="upsell-icon">
                    <Crown size={48} />
                </div>
                <h2>{t('audit.upsell_title')}</h2>
                <p>{t('audit.upsell_desc')}</p>
                
                <div className="feature-grid">
                    <div className="feat-item">
                        <User size={20} />
                        <span>{t('audit.feat_staff')}</span>
                    </div>
                    <div className="feat-item">
                        <Clock size={20} />
                        <span>{t('audit.feat_history')}</span>
                    </div>
                    <div className="feat-item">
                        <Shield size={20} />
                        <span>{t('audit.feat_prevention')}</span>
                    </div>
                    <div className="feat-item">
                        <Download size={20} />
                        <span>{t('audit.feat_export')}</span>
                    </div>
                </div>

                <button onClick={() => router.push(`/config/${guildId}/premium`)} className="btn-premium-cta">
                    {t('audit.unlock_btn')}
                </button>
            </div>
        ) : (
            <div className="audit-content fade-in">
                <div className="filters-bar card">
                    <div className="search-box">
                        <Search size={18} />
                        <input 
                            type="text" 
                            placeholder={t('audit.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-select">
                        <Filter size={18} />
                        <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
                            <option value="ALL">{t('audit.filter_all')}</option>
                            <option value="UPDATE_CONFIG">{t('audit.filter_update')}</option>
                            <option value="UPDATE_WHITELIST">{t('audit.filter_whitelist')}</option>
                            <option value="SAVE_TEMPLATE">{t('audit.filter_template')}</option>
                        </select>
                    </div>
                </div>

                <div className="audit-table-card card">
                    <table className="audit-table">
                        <thead>
                            <tr>
                                <th>{t('audit.table_staff')}</th>
                                <th>{t('audit.table_action')}</th>
                                <th>{t('audit.table_date')}</th>
                                <th style={{ textAlign: 'right' }}>{t('audit.table_details')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.length > 0 ? filteredLogs.map((log, idx) => (
                                <tr key={log._id || idx}>
                                    <td>
                                        <div className="staff-info">
                                            <div className="staff-avatar-mini">
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <div className="staff-name">{log.username}</div>
                                                <div className="staff-id">{log.userId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`action-badge ${getActionBadgeClass(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="timestamp-cell">
                                            <Calendar size={14} />
                                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn-details" title={t('audit.table_details')}>
                                            <Shield size={14} /> {t('audit.details_btn')}
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="empty-state">
                                        {t('audit.empty_state')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        <style jsx>{`
            .audit-container { padding: 20px; }
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
                border-radius: 24px;
            }
            .upsell-badge { position: absolute; top: 20px; right: 20px; background: var(--gold); color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 900; }
            .upsell-icon { width: 100px; height: 100px; background: rgba(245, 158, 11, 0.1); color: var(--gold); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; animation: float 3s ease-in-out infinite; }
            @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
            .premium-upsell h2 { font-size: 2rem; font-weight: 900; margin-bottom: 12px; color: var(--text-main); }
            .premium-upsell p { color: var(--text-muted); font-size: 1.1rem; line-height: 1.6; max-width: 600px; margin-bottom: 40px; }
            
            .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: left; margin-bottom: 40px; width: 100%; max-width: 600px; }
            .feat-item { display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--bg-badge); border-radius: 12px; border: 1px solid var(--border); color: var(--text-main); font-weight: 600; }
            .feat-item svg { color: var(--gold); }

            .btn-premium-cta { background: linear-gradient(135deg, #f59e0b, #fbbf24); color: white; border: none; padding: 18px 36px; border-radius: 16px; font-size: 1.1rem; font-weight: 800; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 30px rgba(245, 158, 11, 0.4); }
            .btn-premium-cta:hover { transform: translateY(-3px); }

            /* Content Styles */
            .filters-bar { display: flex; gap: 20px; padding: 16px 24px; margin-bottom: 24px; align-items: center; }
            .search-box { flex: 1; display: flex; align-items: center; gap: 12px; background: var(--bg-badge); padding: 8px 16px; border-radius: 12px; border: 1px solid var(--border); }
            .search-box input { background: transparent; border: none; color: var(--text-main); width: 100%; outline: none; font-size: 0.9rem; }
            .filter-select { display: flex; align-items: center; gap: 12px; background: var(--bg-badge); padding: 8px 16px; border-radius: 12px; border: 1px solid var(--border); }
            .filter-select select { background: transparent; border: none; color: var(--text-main); outline: none; font-size: 0.9rem; cursor: pointer; }

            .audit-table-card { padding: 0 !important; overflow: hidden; }
            .audit-table { width: 100%; border-collapse: collapse; }
            .audit-table th { text-align: left; padding: 16px 24px; background: var(--bg-badge); color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 800; }
            .audit-table td { padding: 16px 24px; border-bottom: 1px solid var(--border); }
            .audit-table tr:last-child td { border-bottom: none; }
            
            .staff-info { display: flex; align-items: center; gap: 12px; }
            .staff-avatar-mini { width: 32px; height: 32px; background: var(--bg-badge); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); border: 1px solid var(--border); }
            .staff-name { font-weight: 700; color: var(--text-main); font-size: 0.95rem; }
            .staff-id { font-size: 0.7rem; color: var(--text-muted); font-family: monospace; }

            .action-badge { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
            .badge-update { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
            .badge-success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
            .badge-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
            .badge-info { background: rgba(255, 255, 255, 0.1); color: white; }

            .timestamp-cell { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 0.85rem; }
            .btn-details { background: var(--bg-badge); border: 1px solid var(--border); color: var(--text-muted); padding: 6px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 600; transition: 0.2s; }
            .btn-details:hover { background: var(--primary-glow); color: var(--primary); border-color: var(--primary); }

            .empty-state { text-align: center; padding: 40px !important; color: var(--text-muted); font-style: italic; }

            .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text-muted); padding: 10px 18px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; }
        `}</style>
    </div>
  );
}
