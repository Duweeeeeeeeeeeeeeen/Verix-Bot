import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useT } from '../../../contexts/LanguageContext';
import { 
  History, 
  Search, 
  Trash2, 
  RefreshCcw, 
  User, 
  ShieldCheck, 
  BookOpen, 
  Mic2,
  AlertTriangle,
  XCircle,
  Clock,
  ExternalLink,
  Lock,
  HelpCircle,
  ChevronRight,
  FileText,
  Filter,
  Eye,
  EyeOff,
  PlusCircle,
  Send
} from 'lucide-react';

export default function ManagementPage() {
  const { user: authUser, login } = useAuth();
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState(null);
  const [userList, setUserList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  
  // Audit Logs State
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsLoaded, setLogsLoaded] = useState(false); // tracks if logs were fetched at least once
  const [expandedLog, setExpandedLog] = useState(null);
  const [logSearch, setLogSearch] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load user list only once at mount — NOT on every tab change
  useEffect(() => {
    if (guildId && mounted) {
      fetchUserList();
    }
  }, [guildId, mounted]);

  // Load logs lazily — only when the 'logs' tab is opened for the first time
  useEffect(() => {
    if (guildId && mounted && activeTab === 'logs' && !logsLoaded) {
      fetchLogs();
    }
  }, [guildId, mounted, activeTab]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredList(userList);
    } else {
      const lowSearch = searchTerm.toLowerCase();
      setFilteredList(userList.filter(u => 
        u.username?.toLowerCase().includes(lowSearch) || 
        u.discordId.includes(lowSearch)
      ));
    }
  }, [searchTerm, userList]);

  const fetchUserList = async () => {
    setListLoading(true);
    try {
      const res = await api.request(`/management/${guildId}/users`);
      if (res) {
        const list = Array.isArray(res) ? res : [];
        setUserList(list);
        setFilteredList(list);
      }
    } catch (err) {
      console.error('Fetch user list error:', err);
    } finally {
      setListLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await api.request(`/config/${guildId}/audit-logs`);
      const logsData = res.data || (Array.isArray(res) ? res : []);
      setLogs(logsData);
      setLogsLoaded(true);
    } catch (error) {
      console.error('Fetch logs error:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm(t('tickets.delete_cat_confirm'))) return;
    try {
      setLogsLoading(true);
      await api.request(`/config/${guildId}/audit-logs`, { method: 'DELETE' });
      await fetchLogs();
    } catch (error) {
    } finally {
      setLogsLoading(false);
    }
  };

  const getActionInfo = (action) => {
    if (action.startsWith('UPDATE')) return { icon: RefreshCcw, color: 'var(--primary)', label: t('management.action_update') };
    if (action.startsWith('CREATE')) return { icon: PlusCircle, color: 'var(--success)', label: t('management.action_create') };
    if (action.startsWith('DELETE')) return { icon: Trash2, color: 'var(--error)', label: t('management.action_delete') };
    if (action.startsWith('RESET')) return { icon: XCircle, color: 'var(--warning)', label: t('management.action_reset') };
    if (action.startsWith('SEND')) return { icon: Send, color: 'var(--info)', label: t('management.action_send') };
    return { icon: FileText, color: 'var(--text-dim)', label: t('management.details') };
  };

  const filteredLogs = logs.filter(log => 
    (log.username?.toLowerCase() || '').includes(logSearch.toLowerCase()) ||
    (log.action?.toLowerCase() || '').includes(logSearch.toLowerCase())
  );

  useEffect(() => {
    if (userData) {
      window.dispatchEvent(new CustomEvent('update-guide-context', { detail: userData }));
    }
  }, [userData]);

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSearch = async (e, manualId = null) => {
    if (e) e.preventDefault();
    const idToSearch = (manualId || userId || '').trim();
    
    if (!idToSearch || idToSearch.length < 15) {
      if (!manualId) showToast(t('management.search_placeholder'), 'error');
      return;
    }

    setSearching(true);
    setLoading(true);
    try {
      console.log(`[Management] Searching for user: ${idToSearch}`);
      const res = await api.request(`/management/${guildId}/search/${idToSearch}`);
      
      // The api.request utility already unwraps 'data' if success is true
      if (res) {
        setUserData(res);
        setUserId(idToSearch); // Always update state to keep it in sync
      } else {
        showToast('Nessun record trovato per questo ID', 'info');
        setUserData(null);
      }
    } catch (err) {
      console.error('Search error:', err);
      showToast(err.message || t('common.error'), 'error');
      setUserData(null);
    } finally {
      setSearching(false);
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm(t('management.delete_confirm'))) return;

    try {
      await api.request(`/management/${guildId}/records/${type}/${id}`, {
        method: 'DELETE'
      });
      showToast('Record eliminato con successo');
      handleSearch(null, userData?.user?.discordId || userId);
    } catch (err) {
      console.error('Delete error:', err);
      showToast(err.message || 'Errore durante l\'eliminazione', 'error');
    }
  };

  const handleResetAll = async () => {
    const targetId = userData?.user?.discordId || userId;
    if (!targetId) return showToast(t('common.error'), 'error');
    
    if (!confirm(t('management.reset_confirm'))) return;

    try {
      await api.request(`/management/${guildId}/reset-user/${targetId}`, {
        method: 'POST'
      });
      showToast('Stato utente resettato con successo');
      handleSearch(null, targetId);
    } catch (err) {
      console.error('Reset error:', err);
      showToast(err.message || 'Errore durante il reset', 'error');
    }
  };

  if (!mounted) return null;

  if (!authUser) {
    return (
      <div className="management-page animate">
        <div className="empty-state card">
          <Lock size={48} className="text-warning" style={{ marginBottom: '16px' }} />
          <h3>{t('management.login_required')}</h3>
          <p className="text-muted">{t('management.login_desc')}</p>
          <button onClick={login} className="btn-primary" style={{ marginTop: '20px' }}>
            {t('management.login_btn')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="management-container animate">
      {/* Left Sidebar: User List */}
      <aside className="user-list-sidebar card">
        <div className="sidebar-header">
          <div className="header-top">
            <User size={20} className="text-primary" />
            <h3>{t('management.citizen_list')}</h3>
            <span className="count-badge">{userList.length}</span>
          </div>
          <div className="sidebar-search">
            <Search size={16} />
            <input 
              type="text" 
              placeholder={t('management.filter_placeholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="users-scroll">
          {listLoading ? (
            <div className="list-skeletons">
              {[1,2,3,4,5].map(i => <Skeleton key={i} height="50px" borderRadius="10px" />)}
            </div>
          ) : filteredList.length === 0 ? (
            <div className="no-users">
              <Search size={32} />
              <p>{t('management.no_users')}</p>
            </div>
          ) : (
            filteredList.map(u => (
              <button 
                key={u.discordId} 
                className={`user-list-item ${userData?.user?.discordId === u.discordId ? 'active' : ''}`}
                onClick={() => handleSearch(null, u.discordId)}
              >
                <div className="user-avatar">
                  <User size={14} />
                </div>
                <div className="user-name-group">
                  <span className="name">{u.username}</span>
                  <span className="id">{u.discordId}</span>
                </div>
                <ChevronRight size={14} className="arrow" />
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="management-main">
        {/* Header Section */}
        <div className="page-header card">
          <div className="title-group">
            <div className="icon-badge primary">
              <History size={24} />
            </div>
            <div>
              <h1>{t('management.title')}</h1>
              <p className="text-muted">{t('management.desc')}</p>
            </div>
          </div>
          
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <User size={16} /> <span>{t('management.tab_users')}</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
              onClick={() => setActiveTab('logs')}
            >
              <History size={16} /> <span>{t('management.tab_logs')}</span>
            </button>
          </div>
        </div>

        <div className="content-area">
          {activeTab === 'users' ? (
            <div className="users-tab-content animate fade-in">
              <form className="search-box-v3" onSubmit={handleSearch}>
                <Search className="search-icon" size={20} />
                <input 
                  type="text" 
                  placeholder={t('management.search_placeholder')} 
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="search-input"
                />
                <button type="submit" disabled={searching} className="btn-search-p">
                  {searching ? '...' : t('management.search_btn')}
                </button>
              </form>

              {!userData && !loading && (
                <div className="empty-state-v2 card">
                  <div className="pulse-icon">
                    <User size={48} />
                  </div>
                  <h3>{t('management.select_citizen')}</h3>
                  <p className="text-muted">
                    {t('management.select_citizen_desc')}
                  </p>
                </div>
              )}

          {loading && (
            <div className="loading-grid">
              <Skeleton height="120px" borderRadius="16px" />
              <Skeleton height="400px" borderRadius="16px" />
            </div>
          )}

          {userData && !loading && (
            <div className="user-profile card animate fade-in">
              <div className="profile-main">
                <div className="avatar-placeholder">
                  <User size={32} />
                </div>
                <div className="profile-info">
                  <div className="name-badge-row">
                    <h2>{userData.user?.username || t('common.no_results')}</h2>
                    <span className="id-badge">{userData.user?.discordId}</span>
                  </div>
                  <p className="text-dim">{t('management.profile_title')}</p>
                </div>
                <button className="btn-reset" onClick={handleResetAll}>
                  <RefreshCcw size={18} />
                  <span>{t('management.reset_total')}</span>
                </button>
              </div>

              <div className="cooldowns-row">
                <div className="cooldown-item">
                  <ShieldCheck size={18} />
                  <span>Whitelist: {userData.whitelist?.status || 'Non Registrato'}</span>
                </div>
                <div className="cooldown-item">
                  <Mic2 size={18} />
                  <span>Background: {userData.background?.status || 'Non Presente'}</span>
                </div>
                <div className="cooldown-item">
                  <Clock size={18} />
                  <span>Cooldown: {userData.cooldowns?.some(c => new Date(c.endsAt) > new Date()) ? 'Attivo' : 'Nessuno'}</span>
                </div>
              </div>

              <div className="records-grid">
                <section className="record-section card">
                  <div className="section-header">
                    <ShieldCheck size={20} style={{ color: 'var(--success)' }} />
                    <h3>{t('management.whitelist_requests')}</h3>
                    <span className="count">{userData.whitelist?.history?.length || 0}</span>
                  </div>
                  <div className="records-list">
                    {userData.whitelist?.history?.length > 0 ? (
                      userData.whitelist.history.map((h, i) => (
                        <div key={i} className="record-item">
                          <div className="item-info">
                            <span className={`status-pill ${h.status?.toLowerCase()}`}>{h.status}</span>
                            <span className="date-text">{new Date(h.timestamp).toLocaleDateString('it-IT')}</span>
                          </div>
                          <button className="btn-remove-premium" onClick={() => handleDelete('whitelist', h._id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="no-users">
                        <p>{t('management.no_records')}</p>
                      </div>
                    )}
                  </div>
                </section>

                <section className="record-section card">
                  <div className="section-header">
                    <BookOpen size={20} style={{ color: 'var(--info)' }} />
                    <h3>{t('management.bg_story')}</h3>
                    <span className="count">{userData.background?.history?.length || 0}</span>
                  </div>
                  <div className="records-list">
                    {userData.background?.history?.length > 0 ? (
                      userData.background.history.map((h, i) => (
                        <div key={i} className="record-item">
                          <div className="item-info">
                            <span className="status-pill blue">{h.status || 'SUBMITTED'}</span>
                            <span className="date-text">{new Date(h.timestamp).toLocaleDateString('it-IT')}</span>
                          </div>
                          <button className="btn-remove-premium" onClick={() => handleDelete('background', h._id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="no-users">
                        <p>{t('management.no_records')}</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="logs-tab-content animate fade-in">
                <section className="card log-container-hub">
                    <div className="log-filters-row">
                        <Search size={18} className="search-icon-p" />
                        <input 
                            className="transparent-input" 
                            placeholder={t('management.log_filter')} 
                            value={logSearch}
                            onChange={(e) => setLogSearch(e.target.value)}
                        />
                        <div className="log-actions">
                            <button onClick={handleClearLogs} className="btn-danger-mini">
                                <Trash2 size={14} /> {t('management.clear_btn')}
                            </button>
                            <button onClick={fetchLogs} className="btn-refresh-p" disabled={logsLoading}>
                                <RefreshCcw size={14} className={logsLoading ? 'spin' : ''} />
                            </button>
                        </div>
                    </div>

                    <div className="log-table-wrapper">
                        <table className="log-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Admin</th>
                                    <th>Action</th>
                                    <th style={{ textAlign: 'right' }}>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log) => {
                                    const info = getActionInfo(log.action);
                                    return (
                                        <React.Fragment key={log._id}>
                                            <tr className={`log-row-p ${expandedLog === log._id ? 'expanded' : ''}`}>
                                                <td className="time-cell">
                                                    {new Date(log.timestamp).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="admin-cell">
                                                    <div className="admin-badge-p">
                                                        <User size={10} />
                                                        <span>{log.username || t('onboarding.step3.done')}</span>
                                                    </div>
                                                </td>
                                                <td className="action-cell-p">
                                                    <div className="action-tag" style={{ color: info.color, borderLeft: `2px solid ${info.color}` }}>
                                                        {info.label}
                                                    </div>
                                                    <code className="action-raw">{log.action}</code>
                                                </td>
                                                <td className="action-view">
                                                    <button onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)} className={`view-btn-p ${expandedLog === log._id ? 'active' : ''}`}>
                                                        {expandedLog === log._id ? <EyeOff size={14} /> : <Eye size={14} />}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedLog === log._id && (
                                                <tr className="expansion-row">
                                                    <td colSpan="4">
                                                        <div className="json-diff-p animate fade-in">
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
                                <p>{t('management.empty_logs')}</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .management-container {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 32px;
          height: calc(100vh - 140px);
          overflow: hidden;
        }

        /* Sidebar Styles */
        .user-list-sidebar {
          display: flex;
          flex-direction: column;
          background: var(--bg-sidebar-alt);
          border-radius: 20px;
          border: 1px solid var(--border);
          overflow: hidden;
        }

        .sidebar-header {
          padding: 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .header-top {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .header-top h3 { font-size: 1.1rem; flex: 1; }
        .count-badge {
          background: var(--primary-glow);
          color: var(--primary);
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 800;
        }

        .sidebar-search {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--bg-badge);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 0 14px;
        }
        .sidebar-search input {
          background: transparent;
          border: none;
          color: var(--text-main);
          padding: 12px 10px;
          font-size: 0.85rem;
          outline: none;
          width: 100%;
        }
        .sidebar-search :global(svg) { color: var(--text-dim); }

        .users-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .users-scroll::-webkit-scrollbar { width: 4px; }
        .users-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }

        .user-list-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          width: 100%;
          color: var(--text-muted);
        }
        .user-list-item:hover { background: var(--bg-badge); color: var(--text-main); }
        .user-list-item.active { 
          background: var(--primary-glow); 
          border-color: var(--primary); 
          color: var(--text-main); 
        }
        .user-list-item.active .user-avatar { background: var(--primary); color: var(--text-main); }
        .user-list-item.active .arrow { opacity: 1; transform: translateX(0); }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
        }

        .user-name-group { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .user-name-group .name { font-size: 0.9rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .user-name-group .id { font-size: 0.7rem; opacity: 0.5; font-family: monospace; }
        
        .arrow { opacity: 0; transition: 0.2s; transform: translateX(-5px); }

        /* Main Content Styles */
        .management-main {
          display: flex;
          flex-direction: column;
          gap: 24px;
          overflow-y: auto;
          padding-right: 8px;
          width: 100%;
        }
        .management-main::-webkit-scrollbar { width: 4px; }
        .management-main::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          background: var(--bg-sidebar-alt);
          border-radius: 20px;
          border: 1px solid var(--border);
          gap: 32px;
        }

        .tab-navigation { display: flex; gap: 8px; background: var(--bg-badge); padding: 4px; border-radius: 12px; border: 1px solid var(--border); }
        .tab-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: none; background: transparent; color: var(--text-dim); font-size: 0.85rem; font-weight: 600; border-radius: 8px; cursor: pointer; transition: 0.2s; }
        .tab-btn:hover { color: var(--text-main); background: var(--bg-badge); }
        .tab-btn.active { background: var(--primary); color: var(--text-main); }

        .search-box-v3 {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }
        .search-box-v3 .search-input { flex: 1; background: var(--bg-sidebar-alt); border: 1px solid var(--border); border-radius: 12px; padding: 12px 16px; color: var(--text-main); outline: none; }
        .btn-search-p { background: var(--primary); color: var(--text-main); border: none; padding: 0 24px; border-radius: 12px; font-weight: 700; cursor: pointer; }

        /* Logs Hub styles */
        .log-container-hub { padding: 0 !important; overflow: hidden; }
        .log-filters-row { display: flex; align-items: center; gap: 12px; padding: 12px 20px; border-bottom: 1px solid var(--border); background: var(--bg-badge); }
        .transparent-input { background: transparent; border: none; flex: 1; color: var(--text-main); font-size: 0.85rem; outline: none; }
        .log-actions { display: flex; gap: 8px; }
        .btn-danger-mini { background: var(--bg-badge); color: var(--error); border: 1px solid var(--border); padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; cursor: pointer; }
        .btn-refresh-p { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-dim); width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        
        .log-table-wrapper { overflow-x: auto; }
        .log-table { width: 100%; border-collapse: collapse; }
        .log-table th { text-align: left; padding: 12px 20px; font-size: 0.65rem; text-transform: uppercase; color: var(--text-dim); border-bottom: 1px solid var(--border); }
        .log-table td { padding: 12px 20px; border-bottom: 1px solid var(--border); font-size: 0.8rem; }
        
        .log-row-p:hover { background: var(--bg-badge); }
        .admin-badge-p { display: flex; align-items: center; gap: 6px; color: var(--text-muted); font-weight: 600; }
        .action-cell-p { display: flex; flex-direction: column; gap: 2px; }
        .action-tag { font-size: 0.6rem; font-weight: 900; text-transform: uppercase; padding-left: 6px; }
        
        .view-btn-p { background: transparent; border: 1px solid var(--border); color: var(--text-dim); padding: 6px; border-radius: 6px; cursor: pointer; }
        .view-btn-p.active { background: var(--primary); color: var(--text-main); border-color: var(--primary); }
        
        .json-diff-p { padding: 16px; background: var(--bg-dark); }
        .json-diff-p pre { margin: 0; font-size: 0.75rem; color: var(--primary); font-family: monospace; overflow-x: auto; }
        
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }

        .content-area { flex: 1; }

        .empty-state-v2 {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 100px 40px;
          text-align: center;
          background: var(--bg-badge);
          border: 2px dashed var(--border);
          border-radius: 24px;
        }
        .pulse-icon {
          width: 80px;
          height: 80px;
          background: var(--primary-glow);
          color: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(129, 140, 248, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(129, 140, 248, 0); }
          100% { box-shadow: 0 0 0 0 rgba(129, 140, 248, 0); }
        }

        .user-profile { padding: 32px; margin-bottom: 24px; }
        .profile-main { display: flex; align-items: center; gap: 24px; margin-bottom: 24px; }
        .avatar-placeholder {
          width: 64px;
          height: 64px;
          background: var(--border-strong);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-dim);
        }
        .profile-info { flex: 1; }
        .name-badge-row { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
        .id-badge { background: var(--border); padding: 2px 8px; border-radius: 6px; font-family: monospace; font-size: 0.75rem; color: var(--text-dim); }
        .text-dim { font-size: 0.85rem; color: var(--text-dim); }

        .btn-reset {
          background: var(--bg-badge);
          color: var(--error);
          border: 1px solid var(--border);
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: 0.2s;
        }
        .btn-reset:hover { background: var(--error); color: var(--text-on-primary); }

        .cooldowns-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }
        .cooldown-item {
          background: var(--bg-badge);
          padding: 14px 20px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .cooldown-item :global(svg) { color: var(--primary); opacity: 0.6; }

        .records-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .record-section { padding: 24px; }
        .section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .section-header .count { margin-left: auto; background: var(--border-strong); padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; }

        .records-list { display: flex; flex-direction: column; gap: 8px; }
        .record-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--bg-badge);
          border-radius: 10px;
          border: 1px solid var(--border);
        }
        .item-info { display: flex; align-items: center; gap: 12px; }
        .status-pill { font-size: 0.65rem; font-weight: 900; padding: 2px 8px; border-radius: 5px; text-transform: uppercase; }
        .status-pill.accepted { background: var(--primary-glow); color: var(--success); }
        .status-pill.rejected { background: var(--primary-glow); color: var(--error); }
        .status-pill.blue { background: var(--primary-glow); color: var(--info); }
        .status-pill.pending { background: var(--primary-glow); color: var(--primary); }

        .date-text { font-size: 0.8rem; color: var(--text-dim); font-family: monospace; }
        .btn-delete-mini:hover { background: var(--hover-bg); color: var(--error); }

        .no-records { padding: 30px; text-align: center; color: var(--text-dim); opacity: 0.5; }
        .no-records p { font-size: 0.85rem; margin-top: 8px; }

        .list-skeletons { display: flex; flex-direction: column; gap: 10px; }
        .no-users { text-align: center; padding: 40px 20px; color: var(--text-dim); opacity: 0.5; }
        .no-users p { margin-top: 10px; font-size: 0.85rem; }

        @media (max-width: 1100px) {
          .management-container { grid-template-columns: 1fr; }
          .user-list-sidebar { display: none; }
        }
      `}</style>
    </div>
  );
}
