import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
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
  FileText
} from 'lucide-react';

export default function ManagementPage() {
  const { user: authUser, login } = useAuth();
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
      fetchUserList();
    }
  }, [guildId, mounted]);

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
        // api.request returns res.data directly
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
      if (!manualId) showToast('Inserisci un ID Utente valido (17-19 cifre)', 'error');
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
      showToast(err.message || 'Errore durante la ricerca', 'error');
      setUserData(null);
    } finally {
      setSearching(false);
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm(`Sei sicuro di voler eliminare questo record? Questa operazione è irreversibile.`)) return;

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
    if (!targetId) return showToast('Nessun utente selezionato', 'error');
    
    if (!confirm(`ATTENZIONE: Stai per resettare TUTTA la cronologia dell'utente (Whitelist, Background e Cooldown). Vuoi procedere?`)) return;

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
          <h3>Accesso Richiesto</h3>
          <p className="text-muted">La tua sessione è scaduta o non sei autorizzato. Effettua nuovamente il login per gestire i record.</p>
          <button onClick={login} className="btn-primary" style={{ marginTop: '20px' }}>
            Effettua il Login
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
            <h3>Lista Cittadini</h3>
            <span className="count-badge">{userList.length}</span>
          </div>
          <div className="sidebar-search">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Filtra per nome o ID..." 
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
              <p>Nessun utente trovato</p>
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
              <h1>Log & Gestione Utenti</h1>
              <p className="text-muted">Ricerca diretta tramite ID o gestione della cronologia cittadina.</p>
            </div>
          </div>
          
          <form className="search-box-v2" onSubmit={handleSearch}>
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Inserisci ID Discord per ricerca rapida..." 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="search-input"
            />
            <button 
              type="submit" 
              disabled={searching}
              className="btn-search"
            >
              {searching ? '...' : <Search size={18} />}
            </button>
          </form>
        </div>

        <div className="content-area">
          {!userData && !loading && (
            <div className="empty-state-v2 card">
              <div className="pulse-icon">
                <User size={48} />
              </div>
              <h3>Seleziona un Cittadino</h3>
              <p className="text-muted">
                Usa la lista a sinistra per navigare tra i cittadini registrati,<br />
                oppure inserisci un ID Discord sopra per una ricerca istantanea.
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
            <div className="results-container animate fade-in">
              {/* User Overview Card */}
              <div className="user-profile card">
                <div className="profile-main">
                  <div className="avatar-placeholder">
                    <User size={32} />
                  </div>
                  <div className="profile-info">
                    <div className="name-badge-row">
                      <h3>{userData.user.username || 'Sconosciuto'}</h3>
                      <span className="id-badge">{userData.user.discordId || userId}</span>
                    </div>
                    <p className="text-dim">Dati archiviati nel database globale Verix</p>
                  </div>
                  <div className="profile-actions">
                    <button onClick={handleResetAll} className="btn-reset">
                      <RefreshCcw size={16} />
                      Resetta Tutto
                    </button>
                  </div>
                </div>
                
                <div className="cooldowns-row">
                  <div className="cooldown-item">
                    <ShieldCheck size={16} />
                    <span>Ultima Whitelist: {userData.user.lastWhitelistAttempt ? new Date(userData.user.lastWhitelistAttempt).toLocaleString() : 'Mai effettuata'}</span>
                  </div>
                  <div className="cooldown-item">
                    <BookOpen size={16} />
                    <span>Ultimo Background: {userData.user.lastBackgroundAttempt ? new Date(userData.user.lastBackgroundAttempt).toLocaleString() : 'Mai effettuato'}</span>
                  </div>
                </div>
              </div>

              <div className="records-grid">
                {/* Whitelist Records */}
                <div className="record-section card">
                  <div className="section-header">
                    <ShieldCheck size={20} className="text-primary" />
                    <h3>Iter Whitelist</h3>
                    <span className="count">{userData.whitelist.length}</span>
                  </div>
                  
                  {userData.whitelist.length === 0 ? (
                    <div className="no-records">
                      <XCircle size={24} />
                      <p>Nessuna prova scritta</p>
                    </div>
                  ) : (
                    <div className="records-list">
                      {userData.whitelist.map(app => (
                        <div key={app._id} className="record-item">
                          <div className="item-info">
                            <span className={`status-pill ${app.status.toLowerCase()}`}>{app.status}</span>
                            <span className="date-text">{new Date(app.submittedAt || app.startTime).toLocaleDateString()}</span>
                          </div>
                          <button onClick={() => handleDelete('whitelist', app._id)} className="btn-delete-mini" title="Elimina">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Background Records */}
                <div className="record-section card">
                  <div className="section-header">
                    <BookOpen size={20} className="text-warning" />
                    <h3>Dossier Background</h3>
                    <span className="count">{userData.backgrounds.length}</span>
                  </div>
                  
                  {userData.backgrounds.length === 0 ? (
                    <div className="no-records">
                      <FileText size={24} />
                      <p>Nessuna storia inviata</p>
                    </div>
                  ) : (
                    <div className="records-list">
                      {userData.backgrounds.map(bg => (
                        <div key={bg._id} className="record-item">
                          <div className="item-info">
                            <span className={`status-pill ${bg.status.toLowerCase()}`}>{bg.status}</span>
                            <span className="date-text">{new Date(bg.submittedAt).toLocaleDateString()}</span>
                            {bg.link && <a href={bg.link} target="_blank" rel="noreferrer" className="external-link-icon"><ExternalLink size={14} /></a>}
                          </div>
                          <button onClick={() => handleDelete('background', bg._id)} className="btn-delete-mini" title="Elimina">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Voice Queue Records */}
                <div className="record-section card">
                  <div className="section-header">
                    <Mic2 size={20} className="text-info" />
                    <h3>Coda Colloqui</h3>
                    <span className="count">{userData.voice.length}</span>
                  </div>
                  
                  {userData.voice.length === 0 ? (
                    <div className="no-records">
                      <Mic2 size={24} />
                      <p>Mai entrato in coda</p>
                    </div>
                  ) : (
                    <div className="records-list">
                      {userData.voice.map(v => (
                        <div key={v._id} className="record-item">
                          <div className="item-info">
                            <span className="status-pill blue">CODA VOCALE</span>
                            <span className="date-text">{new Date(v.joinedAt).toLocaleString()}</span>
                          </div>
                          <button onClick={() => handleDelete('voice', v._id)} className="btn-delete-mini" title="Elimina">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
          background: #070912;
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
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 0 14px;
        }
        .sidebar-search input {
          background: transparent;
          border: none;
          color: white;
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
        .user-list-item:hover { background: rgba(255,255,255,0.03); color: white; }
        .user-list-item.active { 
          background: var(--primary-glow); 
          border-color: var(--primary-light); 
          color: white; 
        }
        .user-list-item.active .user-avatar { background: var(--primary); color: white; }
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
        }
        .management-main::-webkit-scrollbar { width: 4px; }
        .management-main::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          background: #070912;
          border-radius: 20px;
          border: 1px solid var(--border);
          gap: 32px;
        }

        .title-group { display: flex; gap: 20px; align-items: center; }
        .icon-badge { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .icon-badge.primary { background: var(--primary-glow); color: var(--primary); }
        .page-header h1 { font-size: 1.5rem; margin-bottom: 2px; }

        .search-box-v2 {
          display: flex;
          align-items: center;
          background: rgba(0,0,0,0.3);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 4px;
          flex: 1;
          max-width: 400px;
        }
        .search-box-v2 .search-icon { margin-left: 14px; color: var(--text-dim); }
        .search-box-v2 .search-input {
          background: transparent;
          border: none;
          color: white;
          flex: 1;
          padding: 10px 12px;
          font-size: 0.9rem;
          outline: none;
        }
        .btn-search {
          background: var(--primary);
          color: white;
          border: none;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-search:hover { filter: brightness(1.2); transform: scale(1.05); }

        .content-area { flex: 1; }

        .empty-state-v2 {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 100px 40px;
          text-align: center;
          background: rgba(255,255,255,0.01);
          border-style: dashed;
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
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: 0.2s;
        }
        .btn-reset:hover { background: #ef4444; color: white; }

        .cooldowns-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }
        .cooldown-item {
          background: rgba(255,255,255,0.02);
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
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
          border: 1px solid var(--border-light);
        }
        .item-info { display: flex; align-items: center; gap: 12px; }
        .status-pill { font-size: 0.65rem; font-weight: 900; padding: 2px 8px; border-radius: 5px; text-transform: uppercase; }
        .status-pill.accepted { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
        .status-pill.rejected { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .status-pill.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .status-pill.pending { background: rgba(129, 140, 248, 0.1); color: var(--primary); }

        .date-text { font-size: 0.8rem; color: var(--text-dim); font-family: monospace; }
        .btn-delete-mini { background: transparent; border: none; padding: 6px; border-radius: 6px; color: var(--text-dim); transition: 0.2s; }
        .btn-delete-mini:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

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
