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
  Info
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
    if (!window.confirm('Sei sicuro di voler cancellare TUTTA la cronologia dei log? Questa azione non è reversibile.')) {
      return;
    }

    try {
      setLoading(true);
      await api.request(`/config/${guildId}/audit-logs`, { method: 'DELETE' });
      await fetchLogs(); // Refresh (should be empty or contain only the reset action)
    } catch (error) {
       console.error('Clear logs error:', error);
       alert('Errore durante la cancellazione dei log.');
    } finally {
      setLoading(false);
    }
  };

  const getActionInfo = (action) => {
    if (action.startsWith('UPDATE')) return { icon: RefreshCw, color: 'var(--accent)', label: 'Aggiornamento' };
    if (action.startsWith('CREATE')) return { icon: PlusCircle, color: 'var(--success)', label: 'Creazione' };
    if (action.startsWith('DELETE')) return { icon: Trash2, color: 'var(--error)', label: 'Eliminazione' };
    if (action.startsWith('RESET')) return { icon: XCircle, color: 'var(--warning)', label: 'Reset' };
    if (action.startsWith('SEND')) return { icon: Send, color: '#9b59b6', label: 'Invio' };
    return { icon: FileText, color: 'var(--text-dim)', label: 'Azione' };
  };

  const toggleExpand = (id) => {
    setExpandedLog(expandedLog === id ? null : id);
  };

  const filteredLogs = logs.filter(log => 
    (log.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (log.action?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (loading && logs.length === 0) return (
    <Layout guildId={guildId}>
      <div className="animate">
        <header style={{ marginBottom: '40px' }}>
            <Skeleton width="350px" height="40px" style={{ marginBottom: '12px' }} />
            <Skeleton width="500px" height="20px" />
        </header>
        <section className="card glass" style={{ padding: '0' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '15px' }}>
                <Skeleton width="100%" height="45px" />
                <Skeleton width="150px" height="45px" />
            </div>
            <div style={{ padding: '20px' }}>
                <Skeleton height="50px" style={{ marginBottom: '10px' }} />
                <Skeleton height="50px" style={{ marginBottom: '10px' }} />
                <Skeleton height="50px" style={{ marginBottom: '10px' }} />
                <Skeleton height="50px" style={{ marginBottom: '10px' }} />
                <Skeleton height="50px" />
            </div>
        </section>
      </div>
    </Layout>
  );

  return (
    <Layout guildId={guildId}>
      <div className="animate">
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div className="align-center" style={{ color: 'var(--primary)', marginBottom: '8px' }}>
                <History size={18} fill="currentColor" />
                <span className="text-label" style={{ marginBottom: 0 }}>Tracciabilità</span>
            </div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-1.5px' }}>Audit Logs</h1>
            <p className="text-description" style={{ fontSize: '1.1rem' }}>
              Cronologia completa delle azioni amministrative eseguite tramite il pannello web.
              <HelpTooltip text="I log vengono conservati per un massimo di 90 giorni." />
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={handleClearLogs} 
                className="btn-danger" 
                style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
                disabled={loading || logs.length === 0}
              >
                <Trash2 size={18} /> Cancella Tutto
              </button>
              <button 
                onClick={fetchLogs} 
                className="btn-outline" 
                style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
                disabled={loading}
              >
                <RefreshCw size={18} className={loading ? 'spin' : ''} /> Aggiorna Logs
              </button>
          </div>
        </header>

        <section className="card glass" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border)', display: 'flex', gap: '15px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dim)' }} />
              <input 
                className="input" 
                style={{ paddingLeft: '44px' }} 
                placeholder="Cerca per amministratore o tipo di azione..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '18px 24px' }} className="text-label">Data / Ora</th>
                  <th style={{ padding: '18px 24px' }} className="text-label">Amministratore</th>
                  <th style={{ padding: '18px 24px' }} className="text-label">Azione</th>
                  <th style={{ padding: '18px 24px', textAlign: 'right' }} className="text-label">Vedi Modifiche</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const actionInfo = getActionInfo(log.action);
                  const Icon = actionInfo.icon;
                  
                  return (
                    <React.Fragment key={log._id}>
                      <tr className="log-row">
                        <td style={{ padding: '15px 24px' }}>
                          <div className="align-center" style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600' }}>
                            <Clock size={14} color="var(--text-dim)" />
                            {new Date(log.timestamp).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td style={{ padding: '15px 24px' }}>
                          <div className="align-center" style={{ gap: '12px' }}>
                            <div style={{ 
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '10px', 
                                background: 'var(--border)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                              <UserIcon size={16} color="var(--text-muted)" />
                            </div>
                            <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{log.username || 'Sistema'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '15px 24px' }}>
                          <div className="align-center">
                            <div style={{ padding: '6px', background: `${actionInfo.color}15`, borderRadius: '8px', display: 'flex' }}>
                                <Icon size={16} color={actionInfo.color} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: actionInfo.color }}>{actionInfo.label.toUpperCase()}</span>
                                <code style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{log.action}</code>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '15px 24px', textAlign: 'right' }}>
                          <button 
                            onClick={() => toggleExpand(log._id)} 
                            className={`btn-icon-action ${expandedLog === log._id ? 'active' : ''}`}
                          >
                            {expandedLog === log._id ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </td>
                      </tr>
                      {expandedLog === log._id && (
                        <tr style={{ background: 'rgba(0,0,0,0.15)' }}>
                          <td colSpan="4" style={{ padding: '24px' }}>
                            <div className="card glass-heavy" style={{ padding: '20px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: actionInfo.color }}></div>
                                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Payload Modificato (JSON)</span>
                              </div>
                              <pre style={{ 
                                  margin: '0', 
                                  padding: '16px',
                                  background: 'rgba(0,0,0,0.3)',
                                  borderRadius: '10px',
                                  fontSize: '0.85rem', 
                                  color: '#cbd5e1', 
                                  overflowX: 'auto', 
                                  whiteSpace: 'pre-wrap',
                                  border: '1px solid rgba(255,255,255,0.05)',
                                  fontFamily: 'JetBrains Mono, monospace'
                              }}>
                                {JSON.stringify(log.changes, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '80px', color: 'var(--text-dim)' }}>
                      <div style={{ marginBottom: '16px' }}><Search size={48} opacity={0.2} /></div>
                      <p style={{ fontWeight: '600' }}>Nessun log trovato.</p>
                      <p style={{ fontSize: '0.85rem' }}>Prova a cambiare i criteri di ricerca o aggiorna la lista.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <style jsx>{`
          .log-row {
            border-bottom: 1px solid var(--border);
            transition: var(--transition-fast);
          }
          .log-row:hover {
            background: rgba(var(--primary-rgb), 0.02);
          }
          .btn-icon-action {
            background: none;
            border: 1px solid transparent;
            color: var(--text-dim);
            padding: 10px;
            border-radius: 10px;
            cursor: pointer;
            transition: var(--transition-fast);
          }
          .btn-icon-action:hover {
            color: var(--primary);
            background: rgba(var(--primary-rgb), 0.1);
            border-color: rgba(var(--primary-rgb), 0.2);
          }
          .btn-icon-action.active {
            color: white;
            background: var(--primary);
          }
          .spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </Layout>
  );
}
