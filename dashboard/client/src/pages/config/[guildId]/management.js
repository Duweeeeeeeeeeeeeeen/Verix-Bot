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
  Send,
  UserCheck,
  Calendar,
  Layers,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import React from 'react';

export default function ManagementPage() {
  const { user: authUser, login } = useAuth();
  const { t, language } = useT();
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
  const [enabled, setEnabled] = useState(true);
  
  // Audit Logs State
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsLoaded, setLogsLoaded] = useState(false);
  const [expandedLog, setExpandedLog] = useState(null);
  const [logSearch, setLogSearch] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchUserList = async () => {
    if (!guildId || !mounted) return;
    setListLoading(true);
    try {
      const res = await api.request(`/management/${guildId}/users`);
      if (res) {
        const list = Array.isArray(res) ? res : (res.data || []);
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
    if (!guildId || !mounted) return;
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

  useEffect(() => {
    if (guildId && mounted) {
      fetchUserList();
    }
  }, [guildId, mounted]);

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

  const handleClearLogs = async () => {
    if (!window.confirm(t('management.logs.clear_confirm'))) return;
    try {
      setLogsLoading(true);
      await api.request(`/config/${guildId}/audit-logs`, { method: 'DELETE' });
      await fetchLogs();
    } catch (error) {
        console.error(error);
    } finally {
      setLogsLoading(false);
    }
  };

  const getActionInfo = (action) => {
    if (action.startsWith('UPDATE')) return { icon: RefreshCcw, color: '#6366f1', label: t('management.logs.actions.update') };
    if (action.startsWith('CREATE')) return { icon: PlusCircle, color: '#10b981', label: t('management.logs.actions.create') };
    if (action.startsWith('DELETE')) return { icon: Trash2, color: '#ef4444', label: t('management.logs.actions.delete') };
    if (action.startsWith('RESET')) return { icon: XCircle, color: '#f59e0b', label: t('management.logs.actions.reset') };
    if (action.startsWith('SEND')) return { icon: Send, color: '#3b82f6', label: t('management.logs.actions.send') };
    return { icon: FileText, color: 'var(--text-muted)', label: t('management.logs.actions.generic') };
  };

  const filteredLogs = logs.filter(log => 
    (log.username?.toLowerCase() || '').includes(logSearch.toLowerCase()) ||
    (log.action?.toLowerCase() || '').includes(logSearch.toLowerCase())
  );

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const prettyStatus = (status) => {
    const map = {
      ACCEPTED: t('management.status_accepted'),
      REJECTED: t('management.status_rejected'),
      PENDING: t('management.status_pending'),
      SUBMITTED: t('management.status_submitted'),
      WAITING_VOICE: t('management.status_waiting_voice'),
      WAITING_BACKGROUND: t('management.status_waiting_background'),
      SUBMITTED_BACKGROUND: t('management.status_submitted_background'),
      CANCELLED: t('management.status_cancelled'),
      EXPIRED: t('management.status_expired')
    };
    return map[status] || status || 'N/A';
  };

  const getActivityTitle = (event) => {
    const source = event.source === 'background'
      ? t('management.activity.background')
      : event.type === 'VOICE'
        ? t('management.activity.voice')
        : t('management.activity.whitelist');
    return `${source} - ${prettyStatus(event.status || event.action)}`;
  };

  const getActivityTone = (status) => {
    if (status === 'ACCEPTED') return 'green';
    if (['REJECTED', 'CANCELLED', 'EXPIRED'].includes(status)) return 'red';
    return 'blue';
  };

  const handleSearch = async (e, manualId = null) => {
    if (e) e.preventDefault();
    const idToSearch = manualId || userId;
    if (!idToSearch || idToSearch.length < 15) {
      if (!manualId) showToast(t('management.search.error_id'), 'error');
      return;
    }

    setSearching(true);
    setLoading(true);
    try {
      const res = await api.request(`/management/${guildId}/search/${idToSearch}`);
      if (res) {
        setUserData(res);
        setUserId(idToSearch);
      } else {
        showToast(t('management.search.not_found'), 'info');
        setUserData(null);
      }
    } catch (err) {
      showToast(err.message || t('common.error'), 'error');
      setUserData(null);
    } finally {
      setSearching(false);
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm(t('management.delete.confirm'))) return;
    try {
      await api.request(`/management/${guildId}/records/${type}/${id}`, { method: 'DELETE' });
      showToast(t('management.delete.success'));
      handleSearch(null, userData?.user?.discordId || userId);
    } catch (err) {
      showToast(err.message || t('common.error'), 'error');
    }
  };

  const handleResetAll = async () => {
    const targetId = userData?.user?.discordId || userId;
    if (!targetId) return;
    if (!confirm(t('management.hero.reset_confirm'))) return;
    try {
      await api.request(`/management/${guildId}/reset-user/${targetId}`, { method: 'POST' });
      showToast(t('common.success'));
      handleSearch(null, targetId);
    } catch (err) {
      showToast(err.message || t('common.error'), 'error');
    }
  };

  if (!mounted) return null;

  if (!authUser) {
    return (
      <div className="pc-premium-wrapper animate fade-in">
        <div className="pc-empty-state-v2" style={{ padding: '100px 40px' }}>
          <Lock size={64} color="var(--primary)" style={{ marginBottom: '24px' }} />
          <h2>{t('management.auth.denied_title')}</h2>
          <p>{t('management.auth.denied_desc')}</p>
          <button onClick={login} className="pc-btn-primary" style={{ marginTop: '24px' }}>
            {t('management.auth.login_btn')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pc-premium-wrapper fade-in">
        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
                    <History size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('management.title')}</h1>
                    <div className={`pc-status-tag-v2 ${enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {enabled ? t('management.active_tag') : t('management.inactive_tag')}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <div className="pc-toggle-container-v2">
                    <label className="pc-toggle-v2">
                        <input 
                            type="checkbox" 
                            checked={enabled} 
                            onChange={() => setEnabled(!enabled)} 
                        />
                        <span className="pc-slider-v2"></span>
                    </label>
                    <span className={enabled ? 'text-active' : 'text-inactive'}>
                        {enabled ? t('common.active') : t('common.inactive')}
                    </span>
                </div>
                <div className="pc-header-divider"></div>
                <nav className="pc-tabs-v2" style={{ marginBottom: 0 }}>
                    <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                        <User size={16} /> <span>{t('management.tabs.users')}</span>
                    </button>
                    <button className={activeTab === 'logs' ? 'active' : ''} onClick={() => setActiveTab('logs')}>
                        <History size={16} /> <span>{t('management.tabs.logs')}</span>
                    </button>
                </nav>
            </div>
        </header>

        <div className="pc-layout-v2-rr">
            {/* Sidebar Citizen List */}
            <aside className="pc-sidebar-rr">
                <div className="sidebar-header-v2">
                    <span>{t('management.sidebar.title')} ({userList.length})</span>
                </div>
                <div className="pc-search-box-v2">
                    <Search size={14} />
                    <input placeholder={t('management.sidebar.filter')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <nav className="pc-nav-rr" style={{ marginTop: '16px' }}>
                    {listLoading ? (
                        <div style={{ padding: '16px' }}><Skeleton height="40px" borderRadius="12px" /></div>
                    ) : filteredList.length === 0 ? (
                        <div className="pc-empty-sidebar">{t('management.sidebar.empty')}</div>
                    ) : (
                        filteredList.map(u => (
                            <button 
                                key={u.discordId}
                                className={`nav-item-rr ${userData?.user?.discordId === u.discordId ? 'active' : ''}`}
                                onClick={() => handleSearch(null, u.discordId)}
                            >
                                <div className="panel-icon-box-v2"><User size={16} /></div>
                                <div className="panel-text-v2">
                                    <span className="p-name-v2">{u.username}</span>
                                    <span className="p-meta-v2">{u.discordId}</span>
                                </div>
                                {userData?.user?.discordId === u.discordId && <ChevronRight size={16} className="active-arrow-v2" />}
                            </button>
                        ))
                    )}
                </nav>
            </aside>

            {/* Main Management Content */}
            <div className="pc-content-rr">
                {activeTab === 'users' ? (
                    <div className="animate slide-up">
                         <form className="pc-search-v2-full" onSubmit={handleSearch}>
                            <Search size={22} color="var(--primary)" />
                            <input placeholder={t('management.search.placeholder')} value={userId} onChange={e => setUserId(e.target.value)} />
                            <button type="submit" disabled={searching}>{searching ? '...' : t('management.search.btn')}</button>
                         </form>

                         {!userData && !loading && (
                            <div className="pc-empty-state-v2" style={{ marginTop: '40px' }}>
                                <UserCheck size={64} style={{ opacity: 0.1 }} />
                                <h3>{t('management.empty_state.title')}</h3>
                                <p>{t('management.empty_state.desc')}</p>
                            </div>
                         )}

                         {loading && <div style={{ marginTop: '40px' }}><Skeleton height="200px" /><Skeleton height="300px" style={{ marginTop: '32px' }} /></div>}

                         {userData && !loading && (
                            <div className="v-stack" style={{ gap: '32px', marginTop: '40px' }}>
                                <section className="pc-card-v2 profile-hero-v2">
                                    <div className="hero-main-v2">
                                        <div className="hero-avatar-box-v2"><User size={40} /></div>
                                        <div className="hero-info-v2">
                                            <div className="align-center" style={{ gap: '16px' }}>
                                                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, fontFamily: 'Inter' }}>{userData.user?.username}</h2>
                                                <div className="pc-status-tag-v2 on" style={{ fontSize: '0.6rem' }}>
                                                    <div className="status-dot-v2"></div>
                                                    {t('management.hero.registered')}
                                                </div>
                                            </div>
                                            <p className="pc-hint-v2" style={{ fontSize: '0.9rem', marginTop: '4px' }}>ID Discord: {userData.user?.discordId}</p>
                                        </div>
                                        <button className="pc-btn-primary" style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.1)' }} onClick={handleResetAll}>
                                            <RefreshCcw size={18} /> <span>{t('management.hero.reset_btn')}</span>
                                        </button>
                                    </div>
                                    <div className="hero-stats-grid-v2">
                                        <div className="h-stat-v2">
                                            <ShieldCheck size={18} />
                                            <div className="h-stat-text">
                                                <span>{t('management.hero.stats.whitelist')}</span>
                                                <strong>{prettyStatus(userData.whitelist?.status)}</strong>
                                            </div>
                                        </div>
                                        <div className="h-stat-v2">
                                            <Mic2 size={18} />
                                            <div className="h-stat-text">
                                                <span>{t('management.hero.stats.background')}</span>
                                                <strong>{prettyStatus(userData.background?.status)}</strong>
                                            </div>
                                        </div>
                                        <div className="h-stat-v2">
                                            <Clock size={18} />
                                            <div className="h-stat-text">
                                                <span>{t('management.hero.stats.cooldowns')}</span>
                                                <strong>{userData.cooldowns?.length || 0} {t('management.hero.stats.active')}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="pc-editor-grid-v2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                    <section className="pc-card-v2">
                                        <div className="card-header-v2">
                                            <div className="header-icon"><ShieldCheck size={18} /></div>
                                            <h3>{t('management.cards.whitelist.title')}</h3>
                                            <div className="pc-count-badge">{userData.whitelist?.history?.length || 0}</div>
                                        </div>
                                        <div className="card-body-v2">
                                            <div className="pc-item-grid-v2">
                                                {userData.whitelist?.history?.map((h, i) => (
                                                    <div key={i} className="pc-list-item-v2" style={{ justifyContent: 'space-between' }}>
                                                        <div className="align-center">
                                                            <div className={`pc-dot-v2 ${getActivityTone(h.status)}`}></div>
                                                            <div className="v-stack">
                                                                <span style={{ fontWeight: 700 }}>{prettyStatus(h.status)}</span>
                                                                <span className="pc-hint-v2">{new Date(h.timestamp).toLocaleString(language === 'it' ? 'it-IT' : 'en-US')}</span>
                                                                {h.reviewedBy && <span className="pc-hint-v2">{t('management.reviewed_by')}: {h.reviewedBy}</span>}
                                                                {h.rejectionReason && <span className="pc-hint-v2">{t('management.reason')}: {h.rejectionReason}</span>}
                                                            </div>
                                                        </div>
                                                        <button className="btn-del-mini-v2" onClick={() => handleDelete('whitelist', h._id)}><Trash2 size={14} /></button>
                                                    </div>
                                                ))}
                                                {(!userData.whitelist?.history || userData.whitelist.history.length === 0) && <div className="pc-empty-mini">{t('management.cards.empty')}</div>}
                                            </div>
                                        </div>
                                    </section>

                                    <section className="pc-card-v2">
                                        <div className="card-header-v2">
                                            <div className="header-icon"><BookOpen size={18} /></div>
                                            <h3>{t('management.cards.background.title')}</h3>
                                            <div className="pc-count-badge">{userData.background?.history?.length || 0}</div>
                                        </div>
                                        <div className="card-body-v2">
                                            <div className="pc-item-grid-v2">
                                                {userData.background?.history?.map((h, i) => (
                                                    <div key={i} className="pc-list-item-v2" style={{ justifyContent: 'space-between' }}>
                                                        <div className="align-center">
                                                            <div className={`pc-dot-v2 ${getActivityTone(h.status)}`}></div>
                                                            <div className="v-stack">
                                                                <span style={{ fontWeight: 700 }}>{prettyStatus(h.status)}</span>
                                                                <span className="pc-hint-v2">{new Date(h.timestamp).toLocaleString(language === 'it' ? 'it-IT' : 'en-US')}</span>
                                                                {h.reviewedBy && <span className="pc-hint-v2">{t('management.reviewed_by')}: {h.reviewedBy}</span>}
                                                                {h.rejectionReason && <span className="pc-hint-v2">{t('management.reason')}: {h.rejectionReason}</span>}
                                                                {h.link && <a className="pc-hint-v2" href={h.link} target="_blank" rel="noreferrer">{t('management.open_background')}</a>}
                                                            </div>
                                                        </div>
                                                        <button className="btn-del-mini-v2" onClick={() => handleDelete('background', h._id)}><Trash2 size={14} /></button>
                                                    </div>
                                                ))}
                                                {(!userData.background?.history || userData.background.history.length === 0) && <div className="pc-empty-mini">{t('management.cards.empty')}</div>}
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                <section className="pc-card-v2">
                                    <div className="card-header-v2">
                                        <div className="header-icon"><History size={18} /></div>
                                        <h3>{t('management.activity.title')}</h3>
                                        <div className="pc-count-badge">{userData.activity?.length || 0}</div>
                                    </div>
                                    <div className="card-body-v2">
                                        <div className="pc-item-grid-v2">
                                            {userData.activity?.map((event, i) => (
                                                <div key={event._id || i} className="pc-list-item-v2 activity-item-v2">
                                                    <div className="align-center">
                                                        <div className={`pc-dot-v2 ${getActivityTone(event.status || event.action)}`}></div>
                                                        <div className="v-stack">
                                                            <span style={{ fontWeight: 800 }}>{getActivityTitle(event)}</span>
                                                            <span className="pc-hint-v2">{new Date(event.timestamp).toLocaleString(language === 'it' ? 'it-IT' : 'en-US')}</span>
                                                            {event.staffId && <span className="pc-hint-v2">{t('management.reviewed_by')}: {event.staffId}</span>}
                                                            {event.reason && <span className="pc-hint-v2">{t('management.reason')}: {event.reason}</span>}
                                                            {event.link && <a className="pc-hint-v2" href={event.link} target="_blank" rel="noreferrer">{t('management.open_background')}</a>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!userData.activity || userData.activity.length === 0) && <div className="pc-empty-mini">{t('management.activity.empty')}</div>}
                                        </div>
                                    </div>
                                </section>
                            </div>
                         )}
                    </div>
                ) : (
                    <div className="animate slide-up">
                        <section className="pc-card-v2" style={{ padding: 0, overflow: 'hidden' }}>
                            <div className="pc-table-filters-v2">
                                <Search size={18} />
                                <input placeholder={t('management.logs.filter')} value={logSearch} onChange={e => setLogSearch(e.target.value)} />
                                <div className="align-center">
                                    <button className="pc-btn-outline" style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.1)' }} onClick={handleClearLogs}>
                                        <Trash2 size={16} /> <span>{t('management.logs.clear_btn')}</span>
                                    </button>
                                    <button className="pc-btn-outline" onClick={fetchLogs} disabled={logsLoading}>
                                        <RefreshCcw size={16} className={logsLoading ? 'spin' : ''} />
                                    </button>
                                </div>
                            </div>
                            <div className="pc-table-wrapper-v2">
                                <table className="pc-table-v2">
                                    <thead>
                                        <tr>
                                            <th>{t('management.logs.table.date')}</th>
                                            <th>{t('management.logs.table.admin')}</th>
                                            <th>{t('management.logs.table.action')}</th>
                                            <th style={{ textAlign: 'right' }}>{t('management.logs.table.details')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLogs.map(log => {
                                            const info = getActionInfo(log.action);
                                            return (
                                                <React.Fragment key={log._id}>
                                                    <tr className={expandedLog === log._id ? 'expanded' : ''}>
                                                        <td className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            {new Date(log.timestamp).toLocaleString(language === 'it' ? 'it-IT' : 'en-US', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                        </td>
                                                        <td>
                                                            <div className="align-center">
                                                                <div className="admin-avatar-mini"><User size={12} /></div>
                                                                <span style={{ fontWeight: 700 }}>{log.username || 'System'}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="align-center">
                                                                <span className="action-tag-v2" style={{ color: info.color }}>{info.label}</span>
                                                                <code className="pc-code-v2">{log.action}</code>
                                                            </div>
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <button className={`pc-btn-eye ${expandedLog === log._id ? 'active' : ''}`} onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}>
                                                                {expandedLog === log._id ? <EyeOff size={16} /> : <Eye size={16} />}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                     {expandedLog === log._id && (
                                                        <tr className="expand-row">
                                                            <td colSpan="4">
                                                                <div className="pc-json-viewer">
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
                                    <div className="pc-empty-state-v2" style={{ padding: '60px' }}>
                                        <History size={40} />
                                        <h3>{t('management.logs.empty')}</h3>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1650px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; color: #fff; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Inter', sans-serif; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 6px; font-size: 0.6rem; font-weight: 700; padding: 4px 10px; border-radius: 100px;  width: fit-content; }
            .pc-status-tag-v2.on { background: rgba(16, 185, 129, 0.1); color: #10b981; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: #ef4444; }
            .status-dot-v2 { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
            
            .header-controls { display: flex; gap: 16px; }
            .pc-tabs-v2 { display: flex; gap: 6px; background: var(--bg-badge); padding: 5px; border-radius: 18px; width: fit-content; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; font-size: 0.9rem; border-radius: 14px; cursor: pointer; transition: 0.2s; }
            .pc-tabs-v2 button.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

            /* Layout */
            .pc-layout-v2-rr { display: grid; grid-template-columns: 320px 1fr; gap: 40px; align-items: start; }
            .sidebar-header-v2 { display: flex; padding: 0 16px 12px; font-size: 0.65rem; font-weight: 700; color: var(--text-muted); letter-spacing: 1.2px; }
            .pc-search-box-v2 { display: flex; align-items: center; gap: 12px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 12px 16px; margin: 0 8px; }
            .pc-search-box-v2 input { border: none; background: transparent; outline: none; font-size: 0.85rem; width: 100%; color: var(--text-heading); }
            .pc-nav-rr { display: flex; flex-direction: column; gap: 8px; }
            .nav-item-rr { display: flex; align-items: center; gap: 16px; padding: 14px; border-radius: 18px; background: var(--bg-card); border: 1px solid var(--border); cursor: pointer; transition: 0.3s; text-align: left; width: 100%; }
            .nav-item-rr.active { border-color: var(--primary); background: var(--primary-glow); color: var(--primary); }
            .panel-icon-box-v2 { width: 36px; height: 36px; background: var(--bg-badge); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
            .nav-item-rr.active .panel-icon-box-v2 { background: var(--primary); color: #fff; }
            .panel-text-v2 { display: flex; flex-direction: column; gap: 2px; }
            .p-name-v2 { font-size: 0.9rem; font-weight: 700; }
            .p-meta-v2 { font-size: 0.7rem; color: var(--text-muted); }

            /* Content */
            .pc-search-v2-full { display: flex; align-items: center; gap: 20px; background: var(--bg-card); padding: 16px 24px; border-radius: 24px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .pc-search-v2-full input { flex: 1; border: none; background: transparent; outline: none; font-size: 1.1rem; font-weight: 700; color: var(--text-heading); }
            .pc-search-v2-full button { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; }
            .pc-search-v2-full button:hover { transform: translateY(-2px); }

            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .profile-hero-v2 { background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-badge) 100%); position: relative; overflow: hidden; }
            .hero-main-v2 { display: flex; align-items: center; gap: 24px; margin-bottom: 32px; position: relative; z-index: 2; }
            .hero-avatar-box-v2 { width: 72px; height: 72px; background: var(--primary-glow); color: var(--primary); border-radius: 20px; display: flex; align-items: center; justify-content: center; }
            .hero-info-v2 { flex: 1; }

            .hero-stats-grid-v2 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; border-top: 1px solid var(--border); margin-top: 32px; padding-top: 32px; }
            .h-stat-v2 { background: var(--bg-card); border: 1px solid var(--border); padding: 16px; border-radius: 16px; display: flex; align-items: center; gap: 16px; }
            .h-stat-v2 svg { color: var(--primary); opacity: 0.5; }
            .h-stat-text { display: flex; flex-direction: column; }
            .h-stat-text span { font-size: 0.65rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
            .h-stat-text strong { font-size: 1rem; color: var(--text-heading); }

            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; background: var(--bg-badge); color: var(--primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; }
            .card-header-v2 h3 { margin: 0; font-size: 1.3rem; font-weight: 700; color: var(--text-heading); }
            .pc-count-badge { background: var(--bg-badge); color: var(--text-muted); padding: 4px 10px; border-radius: 10px; font-weight: 700; font-size: 0.75rem; margin-left: auto; }

            .pc-item-grid-v2 { display: flex; flex-direction: column; gap: 12px; }
            .pc-list-item-v2 { display: flex; align-items: center; padding: 16px; background: var(--bg-badge); border-radius: 16px; border: 1px solid var(--border); }
            .activity-item-v2 { justify-content: space-between; align-items: flex-start; }
            .pc-dot-v2 { width: 10px; height: 10px; border-radius: 50%; }
            .pc-dot-v2.green { background: #10b981; box-shadow: 0 0 10px #10b98144; }
            .pc-dot-v2.red { background: #ef4444; box-shadow: 0 0 10px #ef444444; }
            .pc-dot-v2.blue { background: #3b82f6; box-shadow: 0 0 10px #3b82f644; }

            /* Audit Logs Table */
            .pc-table-filters-v2 { display: flex; align-items: center; gap: 20px; padding: 20px 32px; background: var(--bg-badge); border-bottom: 1px solid var(--border); }
            .pc-table-filters-v2 input { flex: 1; border: none; background: transparent; outline: none; font-size: 0.95rem; font-weight: 700; color: var(--text-heading); }
            
            .pc-table-v2 { width: 100%; border-collapse: collapse; }
            .pc-table-v2 th { text-align: left; padding: 16px 32px; font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid var(--border); }
            .pc-table-v2 td { padding: 16px 32px; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
            .pc-table-v2 tr:hover { background: var(--bg-badge); }
            .pc-table-v2 tr.expanded { background: var(--primary-glow); }

            .action-tag-v2 { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: rgba(0,0,0,0.05); }
            .pc-code-v2 { font-family: monospace; background: var(--bg-badge); padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; margin-left: 10px; }
            .pc-btn-eye { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-card); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
            .pc-btn-eye.active { background: var(--primary); color: #fff; border-color: var(--primary); }

            .pc-json-viewer { padding: 24px; background: var(--bg-badge); border: 1px solid var(--border); border-radius: 16px; margin: 8px 32px 24px; }
            .pc-json-viewer pre { margin: 0; color: var(--text-heading); font-size: 0.8rem; overflow-x: auto; }
            :global(.dark-theme) .pc-json-viewer { background: #1a1b1e; border-color: rgba(255,255,255,0.08); }
            :global(.dark-theme) .pc-json-viewer pre { color: #10b981; }

            .pc-empty-state-v2 { text-align: center; padding: 80px; color: var(--text-muted); }
            .btn-del-mini-v2 { width: 32px; height: 32px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; }

            .font-mono { font-family: monospace; }
            .align-center { display: flex; align-items: center; gap: 12px; }
            .v-stack { display: flex; flex-direction: column; }
            
            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .nav-item-rr { box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
