import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import api from '../../../utils/api';
import { 
  Shield, 
  User as UserIcon, 
  Clock, 
  FileText, 
  Eye, 
  EyeOff,
  Search,
  CheckCircle,
  XCircle,
  RefreshCw,
  PlusCircle,
  Trash2,
  Send,
  History,
  Zap,
  Info,
  ChevronRight,
  Filter
} from 'lucide-react';

export default function AuditLogs() {
  const router = useRouter();
  const { guildId } = router.query;
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLog, setExpandedLog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (guildId) {
      fetchLogs();
    }
  }, [guildId]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.request(`/config/${guildId}/audit-logs`);
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch logs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Cancellare tutta la cronologia?')) return;
    try {
      setLoading(true);
      await api.request(`/config/${guildId}/audit-logs`, { method: 'DELETE' });
      await fetchLogs();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getActionInfo = (action) => {
    if (action.startsWith('UPDATE')) return { icon: RefreshCw, color: '#6366f1', label: 'Aggiornamento' };
    if (action.startsWith('CREATE')) return { icon: PlusCircle, color: '#22c55e', label: 'Creazione' };
    if (action.startsWith('DELETE')) return { icon: Trash2, color: '#ef4444', label: 'Eliminazione' };
    if (action.startsWith('RESET')) return { icon: XCircle, color: '#f59e0b', label: 'Reset' };
    if (action.startsWith('SEND')) return { icon: Send, color: '#a855f7', label: 'Invio' };
    return { icon: FileText, color: 'var(--text-dim)', label: 'Azione' };
  };

  const toggleExpand = (id) => {
    setExpandedLog(expandedLog === id ? null : id);
  };

  const filteredLogs = logs.filter(log => 
    (log.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (log.action?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (loading && logs.length === 0) return <Layout guildId={guildId}><Skeleton height="500px" /></Layout>;

  return (
    <Layout guildId={guildId}>
      <div className="animate">
        
        {/* Module Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <History size={24} />
              </div>
              <div className="header-text">
                <h1>Audit Logs</h1>
                <p>Tracking completo delle azioni amministrative sul pannello.</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleClearLogs} className="btn-danger-v2">
                <Trash2 size={16} /> Pulisci
              </button>
              <button onClick={fetchLogs} className="btn-primary" disabled={loading}>
                <RefreshCw size={16} className={loading ? 'spin' : ''} /> Aggiorna
              </button>
           </div>
        </header>

        <section className="card log-container-v2">
            <div className="log-filters-row">
                <Search size={18} className="search-icon-p" />
                <input 
                    className="transparent-input" 
                    placeholder="Filtra per amministratore o azione..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Filter size={18} color="var(--primary)" style={{ opacity: 0.5 }} />
            </div>

            <div className="log-table-wrapper">
                <table className="log-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Admin</th>
                            <th>Action Type</th>
                            <th style={{ textAlign: 'right' }}>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map((log) => {
                            const info = getActionInfo(log.action);
                            return (
                                <React.Fragment key={log._id}>
                                    <tr className={`log-row-v2 ${expandedLog === log._id ? 'expanded' : ''}`}>
                                        <td className="time-cell">
                                            {new Date(log.timestamp).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="admin-cell">
                                            <div className="admin-badge">
                                                <div className="avatar-placeholder"><UserIcon size={12} /></div>
                                                <span>{log.username || 'Sistema'}</span>
                                            </div>
                                        </td>
                                        <td className="action-cell">
                                            <div className="action-badge-p" style={{ backgroundColor: `${info.color}15`, color: info.color }}>
                                                <info.icon size={12} />
                                                <span>{info.label.toUpperCase()}</span>
                                            </div>
                                            <code className="action-raw">{log.action}</code>
                                        </td>
                                        <td className="action-view">
                                            <button onClick={() => toggleExpand(log._id)} className={`view-btn-p ${expandedLog === log._id ? 'active' : ''}`}>
                                                {expandedLog === log._id ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedLog === log._id && (
                                        <tr className="expansion-row">
                                            <td colSpan="4">
                                                <div className="json-diff-v2 animate fade-in">
                                                    <div className="diff-header">
                                                        <FileText size={14} />
                                                        <span>Payload Modificato</span>
                                                    </div>
                                                    <pre>{JSON.stringify(log.changes, null, 2)}</pre>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
                {filteredLogs.length === 0 && (
                    <div className="empty-logs">
                        <History size={40} />
                        <p>Nessun log trovato.</p>
                    </div>
                )}
            </div>
        </section>

        <style jsx>{`
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: rgba(255,255,255,0.02); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: rgba(129, 140, 248, 0.1); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }
            .header-buttons { display: flex; gap: 12px; }

            .log-container-v2 { padding: 0 !important; overflow: hidden; border-radius: 16px; }
            .log-filters-row { display: flex; align-items: center; gap: 12px; padding: 16px 24px; border-bottom: 1px solid var(--border); background: #070912; }
            .search-icon-p { color: var(--text-dim); }
            .transparent-input { background: transparent; border: none; flex: 1; color: white; font-size: 0.9rem; outline: none; }
            
            .log-table-wrapper { overflow-x: auto; }
            .log-table { width: 100%; border-collapse: collapse; }
            .log-table th { text-align: left; padding: 16px 24px; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-dim); border-bottom: 1px solid var(--border); }
            .log-table td { padding: 14px 24px; vertical-align: middle; }
            
            .log-row-v2 { border-bottom: 1px solid var(--border); transition: 0.2s; }
            .log-row-v2:hover { background: rgba(255,255,255,0.02); }
            .log-row-v2.expanded { background: rgba(129, 140, 248, 0.03); }
            
            .time-cell { font-size: 0.8rem; color: var(--text-muted); white-space: nowrap; }
            .admin-badge { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 0.9rem; }
            .avatar-placeholder { width: 24px; height: 24px; border-radius: 6px; background: var(--border); display: flex; align-items: center; justify-content: center; color: var(--text-dim); }
            
            .action-cell { display: flex; flex-direction: column; gap: 4px; }
            .action-badge-p { display: flex; align-items: center; gap: 6px; width: fit-content; padding: 3px 8px; border-radius: 6px; font-size: 0.65rem; font-weight: 900; }
            .action-raw { font-size: 0.7rem; color: var(--text-dim); font-family: monospace; }
            
            .action-view { text-align: right; }
            .view-btn-p { border: 1px solid var(--border); background: transparent; color: var(--text-dim); padding: 8px; border-radius: 8px; cursor: pointer; transition: 0.2s; }
            .view-btn-p:hover { color: var(--primary); border-color: var(--primary); }
            .view-btn-p.active { background: var(--primary); color: white; border-color: var(--primary); }
            
            .expansion-row td { padding: 0; }
            .json-diff-v2 { padding: 24px; background: rgba(0,0,0,0.2); border-bottom: 1px solid var(--border); }
            .diff-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 0.7rem; text-transform: uppercase; color: var(--text-dim); font-weight: 800; }
            .json-diff-v2 pre { margin: 0; padding: 16px; background: #020617; border-radius: 10px; border: 1px solid var(--border); font-size: 0.8rem; color: #a5b4fc; font-family: 'JetBrains Mono', monospace; overflow-x: auto; }

            .btn-danger-v2 { background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1); color: #ef4444; padding: 8px 16px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 700; transition: 0.2s; }
            .btn-danger-v2:hover { background: #ef4444; color: white; }

            .empty-logs { text-align: center; padding: 80px 24px; color: var(--text-dim); display: flex; flex-direction: column; align-items: center; gap: 16px; }
            .empty-logs p { font-weight: 600; font-size: 0.9rem; }

            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .spin { animation: spin 1s linear infinite; }
            @media (max-width: 800px) { .header-info { display: none; } }
        `}</style>
      </div>
    </Layout>
  );
}
