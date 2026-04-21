import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
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
  Lock
} from 'lucide-react';

export default function ManagementPage() {
  const { user: authUser, login } = useAuth();
  const router = useRouter();
  const { guildId } = router.query;
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!userId || userId.length < 15) return showToast('Inserisci un ID Utente valido', 'error');

    setSearching(true);
    setLoading(true);
    try {
      const res = await api.request(`/management/${guildId}/search/${userId}`);
      // api.request unwraps success:true and returns the .data object directly
      if (res) {
        setUserData(res);
      } else {
        showToast('Nessun dato restituito dal server', 'error');
      }
    } catch (err) {
      console.error('Search error:', err);
      showToast('Errore durante la ricerca', 'error');
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
      // If we reach here, api.request didn't throw, so it was successful
      showToast('Record eliminato con successo');
      handleSearch();
    } catch (err) {
      console.error('Delete error:', err);
      showToast(err.message || 'Errore durante l\'eliminazione', 'error');
    }
  };

  const handleResetAll = async () => {
    if (!confirm(`ATTENZIONE: Stai per resettare TUTTA la cronologia dell'utente (Whitelist, Background e Cooldown). Vuoi procedere?`)) return;

    try {
      await api.request(`/management/${guildId}/reset-user/${userId}`, {
        method: 'POST'
      });
      showToast('Stato utente resettato con successo');
      handleSearch();
    } catch (err) {
      console.error('Reset error:', err);
      showToast(err.message || 'Errore durante il reset', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  if (!mounted) return null;

  if (!authUser) {
    return (
      <Layout guildId={guildId}>
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
      </Layout>
    );
  }

  return (
    <Layout guildId={guildId}>
      <div className="management-page animate">
        {/* Header Section */}
        <div className="page-header">
           <div className="title-group">
            <div className="icon-badge primary">
              <History size={24} />
            </div>
            <div>
              <h1>Log & Gestione Utenti</h1>
              <p className="text-muted">Ricerca e gestisci la cronologia whitelist di un cittadino.</p>
            </div>
          </div>
          
          <form className="search-box" onSubmit={handleSearch}>
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Inserisci ID Discord..." 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="search-input"
            />
            <button 
              type="submit" 
              disabled={searching}
              className="btn-primary"
            >
              {searching ? 'Ricerca...' : 'Cerca'}
            </button>
          </form>
        </div>

        {!userData && !loading && (
          <div className="empty-state card">
            <User size={48} className="text-muted" style={{ marginBottom: '16px' }} />
            <h3>Nessun utente selezionato</h3>
            <p className="text-muted">Inserisci un ID Discord sopra per visualizzare la sua cronologia e gestire i suoi record.</p>
          </div>
        )}

        {loading && (
          <div className="loading-grid">
            <Skeleton height="150px" borderRadius="16px" />
            <Skeleton height="300px" borderRadius="16px" />
          </div>
        )}

        {userData && !loading && (
          <div className="results-container">
            {/* User Overview Card */}
            <div className="user-profile card">
              <div className="profile-main">
                <div className="avatar-placeholder">
                  <User size={32} />
                </div>
                <div className="profile-info">
                  <h3>Utente: {userData.user.username || userId}</h3>
                  <code className="text-muted">{userId}</code>
                </div>
                <div className="profile-actions">
                  <button onClick={handleResetAll} className="btn-danger">
                    <RefreshCcw size={16} />
                    Resetta Stato Cittadino
                  </button>
                </div>
              </div>
              
              <div className="cooldowns-row">
                <div className="cooldown-item">
                  <Clock size={16} />
                  <span>Whitelist Scritta: {userData.user.lastWhitelistAttempt ? new Date(userData.user.lastWhitelistAttempt).toLocaleString() : 'Nessun cooldown'}</span>
                </div>
                <div className="cooldown-item">
                  <BookOpen size={16} />
                  <span>Background: {userData.user.lastBackgroundAttempt ? new Date(userData.user.lastBackgroundAttempt).toLocaleString() : 'Nessun cooldown'}</span>
                </div>
              </div>
            </div>

            <div className="records-grid">
              {/* Whitelist Records */}
              <div className="record-section card">
                <div className="section-header">
                  <ShieldCheck size={20} className="text-primary" />
                  <h3>Whitelist Scritta</h3>
                  <span className="badge">{userData.whitelist.length}</span>
                </div>
                
                {userData.whitelist.length === 0 ? (
                  <p className="text-muted no-data">Nessuna domanda trovata.</p>
                ) : (
                  <div className="records-list">
                    {userData.whitelist.map(app => (
                      <div key={app._id} className="record-item">
                        <div className="item-info">
                          <span className={`status-tag ${app.status.toLowerCase()}`}>{app.status}</span>
                          <span className="date">{new Date(app.submittedAt).toLocaleDateString()}</span>
                        </div>
                        <button onClick={() => handleDelete('whitelist', app._id)} className="icon-btn delete" title="Elimina">
                          <Trash2 size={16} />
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
                  <h3>Background Story</h3>
                  <span className="badge">{userData.backgrounds.length}</span>
                </div>
                
                {userData.backgrounds.length === 0 ? (
                  <p className="text-muted no-data">Nessuna storia trovata.</p>
                ) : (
                  <div className="records-list">
                    {userData.backgrounds.map(bg => (
                      <div key={bg._id} className="record-item">
                        <div className="item-info">
                          <span className={`status-tag ${bg.status.toLowerCase()}`}>{bg.status}</span>
                          <span className="date">{new Date(bg.submittedAt).toLocaleDateString()}</span>
                          {bg.link && <a href={bg.link} target="_blank" rel="noreferrer" className="link-icon"><ExternalLink size={14} /></a>}
                        </div>
                        <button onClick={() => handleDelete('background', bg._id)} className="icon-btn delete" title="Elimina">
                          <Trash2 size={16} />
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
                  <h3>Coda Vocale</h3>
                  <span className="badge">{userData.voice.length}</span>
                </div>
                
                {userData.voice.length === 0 ? (
                  <p className="text-muted no-data">Nessuna entry in coda.</p>
                ) : (
                  <div className="records-list">
                    {userData.voice.map(v => (
                      <div key={v._id} className="record-item">
                        <div className="item-info">
                          <span className="badge-outline">Coda</span>
                          <span className="date">{new Date(v.joinedAt).toLocaleString()}</span>
                        </div>
                        <button onClick={() => handleDelete('voice', v._id)} className="icon-btn delete" title="Elimina">
                          <Trash2 size={16} />
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

      <style jsx>{`
        .management-page { display: flex; flex-direction: column; gap: 32px; }
        
        .page-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-end; 
          gap: 24px;
          flex-wrap: wrap;
        }

        .title-group { display: flex; gap: 20px; align-items: center; }
        .icon-badge { 
          width: 52px; 
          height: 52px; 
          border-radius: 14px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-weight: bold;
        }
        .icon-badge.primary { background: rgba(129, 140, 248, 0.1); color: var(--primary); }
        .page-header h1 { font-size: 2rem; margin-bottom: 4px; }
        
        .search-box { 
          background: var(--bg-card); 
          border: 1px solid var(--border); 
          border-radius: 14px; 
          padding: 6px 6px 6px 18px; 
          display: flex; 
          align-items: center; 
          gap: 12px;
          min-width: 450px;
          box-shadow: var(--shadow-sm);
        }
        .search-icon { color: var(--text-muted); }
        .search-input { 
          background: transparent; 
          border: none; 
          color: white; 
          flex: 1; 
          font-size: 0.95rem; 
          outline: none; 
          font-family: inherit;
        }
        
        .empty-state { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          min-height: 300px;
          text-align: center;
          padding: 60px;
        }

        .results-container { display: flex; flex-direction: column; gap: 32px; }
        
        .user-profile { 
          display: flex; 
          flex-direction: column; 
          gap: 20px; 
        }

        .profile-main { display: flex; align-items: center; gap: 20px; }
        .avatar-placeholder { 
          width: 56px; 
          height: 56px; 
          border-radius: 50%; 
          background: var(--border-strong); 
          display: flex; 
          align-items: center; 
          justify-content: center;
          color: var(--text-muted);
        }
        .profile-info { flex: 1; }
        .profile-info h3 { font-size: 1.3rem; margin-bottom: 2px; }
        
        .cooldowns-row { 
          display: flex; 
          gap: 24px; 
          padding-top: 20px; 
          border-top: 1px solid var(--border);
          flex-wrap: wrap;
        }
        .cooldown-item { 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          font-size: 0.85rem; 
          color: var(--text-dim);
          background: rgba(255,255,255,0.03);
          padding: 8px 16px;
          border-radius: 8px;
        }

        .records-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
          gap: 24px; 
        }

        .section-header { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          margin-bottom: 24px;
          position: relative;
        }
        .section-header h3 { font-size: 1.1rem; }
        .badge { 
          background: var(--border-strong); 
          color: white; 
          padding: 2px 8px; 
          border-radius: 6px; 
          font-size: 0.75rem; 
          font-weight: bold;
        }

        .records-list { display: flex; flex-direction: column; gap: 12px; }
        .record-item { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          padding: 14px 18px; 
          background: rgba(255,255,255,0.03); 
          border-radius: 12px; 
          border: 1px solid var(--border-light);
          transition: 0.2s;
        }
        .record-item:hover { background: rgba(255,255,255,0.06); border-color: var(--border-strong); }
        
        .item-info { display: flex; align-items: center; gap: 12px; }
        .status-tag { 
          font-size: 0.7rem; 
          font-weight: 800; 
          padding: 2px 8px; 
          border-radius: 6px; 
          text-transform: uppercase;
        }
        .status-tag.accepted { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .status-tag.rejected { background: rgba(239, 68, 68, 0.1); color: var(--error); }
        .status-tag.pending, .status-tag.submitted { background: rgba(129, 140, 248, 0.1); color: var(--primary); }
        
        .date { font-size: 0.8rem; color: var(--text-muted); font-family: monospace; }
        .link-icon { color: var(--primary); opacity: 0.7; transition: 0.2s; }
        .link-icon:hover { opacity: 1; transform: scale(1.1); }

        .btn-danger { 
          background: rgba(239, 68, 68, 0.1); 
          color: #f87171; 
          border: 1px solid rgba(239, 68, 68, 0.2); 
          padding: 10px 18px; 
          border-radius: 12px; 
          font-weight: 700; 
          font-size: 0.85rem; 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          transition: all 0.2s;
        }
        .btn-danger:hover { background: var(--error); color: white; transform: translateY(-1px); }

        .icon-btn { 
          background: transparent; 
          border: none; 
          padding: 8px; 
          border-radius: 8px; 
          color: var(--text-muted); 
          transition: 0.2s;
        }
        .icon-btn.delete:hover { background: rgba(239, 68, 68, 0.1); color: var(--error); }

        .no-data { padding: 20px 0; text-align: center; font-style: italic; }
        .badge-outline { 
          font-size: 0.7rem; 
          font-weight: 700; 
          border: 1px solid var(--border-strong); 
          padding: 2px 8px; 
          border-radius: 6px; 
          color: var(--text-dim);
        }
        
        .loading-grid { display: flex; flex-direction: column; gap: 24px; }
      `}</style>
    </Layout>
  );
}
