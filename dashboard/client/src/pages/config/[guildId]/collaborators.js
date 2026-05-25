import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import LoadingScreen from '../../../components/LoadingScreen';
import ConfirmModal from '../../../components/ConfirmModal';
import { useAuth } from '../../../contexts/AuthContext';
import { useT } from '../../../contexts/LanguageContext';
import api from '../../../utils/api';
import { UserPlus, Trash2, Calendar, Shield, Users, Info } from 'lucide-react';

export default function Collaborators() {
  const router = useRouter();
  const { guildId } = router.query;
  const { t } = useT();
  const { user, loading: authLoading } = useAuth();
  
  const [collaborators, setCollaborators] = useState([]);
  const [limit, setLimit] = useState(1);
  const [newUserId, setNewUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null); // stores the collaborator object being deleted

  // Fetch collaborators list
  const fetchCollaborators = async () => {
    if (!guildId) return;
    try {
      const res = await api.request(`/collaborators/${guildId}`);
      if (res) {
        setCollaborators(res.collaborators || []);
        setLimit(res.limit || 1);
      }
    } catch (err) {
      console.error('Failed to fetch collaborators:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (guildId && user) {
      // Redirect if this user is themselves a collaborator (they shouldn't manage collaborators)
      const currentGuild = user.guilds?.find(g => g.id === guildId);
      if (currentGuild?.isCollaborator) {
        router.push(`/config/${guildId}`);
      } else {
        fetchCollaborators();
      }
    }
  }, [guildId, user]);

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    if (!newUserId.trim()) return;
    
    setActionLoading(true);
    try {
      const res = await api.request(`/collaborators/${guildId}`, {
        method: 'POST',
        data: { userId: newUserId.trim() }
      });

      if (res && res.success) {
        setCollaborators(res.collaborators || []);
        setNewUserId('');
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: t('collaborators.add_success') || 'Collaboratore aggiunto con successo!', type: 'success' } 
        }));
      }
    } catch (err) {
      console.error('Failed to add collaborator:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!isDeleting) return;
    
    setActionLoading(true);
    try {
      const res = await api.request(`/collaborators/${guildId}/${isDeleting.userId}`, {
        method: 'DELETE'
      });

      if (res) {
        setCollaborators(res.collaborators || []);
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: t('collaborators.remove_success') || 'Collaboratore rimosso con successo!', type: 'success' } 
        }));
      }
    } catch (err) {
      console.error('Failed to remove collaborator:', err);
    } finally {
      setActionLoading(false);
      setIsDeleting(null);
    }
  };

  if (authLoading || (loading && !collaborators.length)) {
    return <LoadingScreen message={t('common.loading') || 'Caricamento...'} />;
  }

  return (
    <>
      <div className="pc-collaborators-wrapper animate fade-in">
        <header className="page-header-v2">
          <div className="header-brand-v2">
            <div className="header-icon-v2">
              <Users size={24} />
            </div>
            <div className="header-text-v2">
              <h1>{t('collaborators.title') || 'Collaboratori Dashboard'}</h1>
              <p>{t('collaborators.subtitle') || 'Gestisci e invita collaboratori ad aiutarti a configurare il bot Verix per questo server.'}</p>
            </div>
          </div>
        </header>

        <div className="pc-grid-v2">
          {/* Left panel: Add collaborator form */}
          <div className="pc-card-v2 glass-card">
            <div className="card-header-v2">
              <h3>{t('collaborators.add_btn') || 'Aggiungi Collaboratore'}</h3>
            </div>
            
            <form onSubmit={handleAddCollaborator} className="add-form-v2">
              <div className="form-group-v2">
                <label>{t('collaborators.add_placeholder') || "Inserisci l'ID Discord del collaboratore..."}</label>
                <div className="input-group-v2">
                  <input
                    type="text"
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value)}
                    placeholder="E.g. 361159834688552960"
                    disabled={actionLoading || collaborators.length >= limit}
                    required
                  />
                  <button 
                    type="submit" 
                    className="pc-btn-primary"
                    disabled={actionLoading || collaborators.length >= limit || !newUserId}
                  >
                    <UserPlus size={16} />
                    <span>{actionLoading ? '...' : (t('collaborators.add_btn') || 'Aggiungi')}</span>
                  </button>
                </div>
              </div>

              {collaborators.length >= limit && (
                <div className="limit-banner animate shake">
                  <Info size={16} />
                  <span>
                    {t('collaborators.tier_limit_reached') || 
                      'Limite raggiunto. Aggiorna il piano del server per aggiungere più collaboratori.'}
                  </span>
                </div>
              )}
              
              <div className="info-box-v2 glass-card">
                <Shield size={16} className="info-icon" />
                <div className="info-text">
                  <h4>Note sulla Sicurezza</h4>
                  <p>I collaboratori hanno permessi completi di lettura/scrittura per la configurazione dei moduli, ma sono bloccati dall'accesso alle impostazioni di fatturazione Premium e alla gestione di altri collaboratori.</p>
                </div>
              </div>
            </form>
          </div>

          {/* Right panel: Active collaborators list */}
          <div className="pc-card-v2 glass-card table-card-v2">
            <div className="card-header-v2">
              <h3>
                Collaboratori Attivi 
                <span className="limit-badge-v2">
                  {collaborators.length} / {limit}
                </span>
              </h3>
            </div>

            {collaborators.length === 0 ? (
              <div className="empty-state-v2">
                <Users size={40} className="empty-icon-v2" />
                <h4>{t('collaborators.no_collaborators') || 'Nessun collaboratore attivo.'}</h4>
                <p>Usa il form a sinistra per invitare il tuo primo collaboratore inserendo il suo ID Discord.</p>
              </div>
            ) : (
              <div className="table-responsive-v2">
                <table className="pc-table-v2">
                  <thead>
                    <tr>
                      <th>{t('collaborators.table_user') || 'Collaboratore'}</th>
                      <th>{t('collaborators.table_added_at') || 'Aggiunto il'}</th>
                      <th className="text-right">{t('collaborators.table_actions') || 'Azioni'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collaborators.map((c) => (
                      <tr key={c.userId} className="table-row-v2">
                        <td>
                          <div className="collaborator-profile-v2">
                            <div className="avatar-placeholder-v2">
                              {c.username[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="profile-info-v2">
                              <span className="username-v2">{c.username}</span>
                              <span className="discord-id-v2">{c.userId}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="date-added-v2">
                            <Calendar size={14} />
                            <span>{new Date(c.addedAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="text-right">
                          <button 
                            className="pc-btn-action-delete"
                            onClick={() => setIsDeleting(c)}
                            disabled={actionLoading}
                            title="Rimuovi"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!isDeleting}
          onClose={() => setIsDeleting(null)}
          onConfirm={handleConfirmDelete}
          title={t('collaborators.remove_confirm_title') || 'Rimuovi Collaboratore'}
          message={
            isDeleting 
              ? `${t('collaborators.remove_confirm_desc') || 'Sei sicuro di voler rimuovere questo collaboratore? Perderà immediatamente l\'accesso.'} (${isDeleting.username})`
              : ''
          }
          confirmText={t('common.delete') || 'Rimuovi'}
          type="danger"
        />
      </div>

      <style jsx global>{`
        .pc-collaborators-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 28px 0;
        }

        .pc-grid-v2 {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 24px;
          margin-top: 24px;
        }

        .pc-card-v2 {
          background: var(--bg-card) !important;
          border: 1px solid var(--border) !important;
          border-radius: 20px;
          overflow: hidden;
          padding: 24px;
          box-shadow: var(--shadow-premium);
        }

        .card-header-v2 {
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-header-v2 h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.15rem;
          font-weight: 750;
          margin: 0;
          color: var(--text-heading);
        }

        .limit-badge-v2 {
          font-size: 0.78rem;
          font-weight: 700;
          background: rgba(99, 102, 241, 0.1);
          color: var(--accent);
          padding: 4px 10px;
          border-radius: 100px;
          margin-left: 10px;
          border: 1px solid rgba(99, 102, 241, 0.15);
        }

        .add-form-v2 {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group-v2 {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group-v2 label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .input-group-v2 {
          display: flex;
          gap: 8px;
          background: var(--bg-input);
          border: 1.5px solid var(--border);
          border-radius: 12px;
          padding: 4px;
          transition: 0.2s;
        }

        .input-group-v2:focus-within {
          border-color: var(--primary);
          background: var(--bg-card);
          box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.08);
        }

        .input-group-v2 input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 8px 12px;
          outline: none;
          color: var(--text-heading);
          font-weight: 600;
          font-size: 0.88rem;
        }

        .input-group-v2 input::placeholder {
          color: var(--text-dim);
        }

        .pc-btn-primary {
          background: var(--primary);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 750;
          font-size: 0.8rem;
          cursor: pointer;
          transition: 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pc-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2);
        }

        .pc-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .limit-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          font-size: 0.78rem;
          font-weight: 600;
        }

        .info-box-v2 {
          display: flex;
          gap: 12px;
          padding: 14px;
          background: var(--bg-badge) !important;
          border-radius: 12px;
          border: 1px solid var(--border) !important;
        }

        .info-icon {
          color: var(--accent);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .info-text h4 {
          font-size: 0.82rem;
          font-weight: 750;
          margin: 0 0 4px 0;
          color: var(--text-heading);
        }

        .info-text p {
          font-size: 0.75rem;
          line-height: 1.4;
          margin: 0;
          color: var(--text-muted);
        }

        .empty-state-v2 {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon-v2 {
          color: var(--text-dim);
          opacity: 0.45;
          margin-bottom: 16px;
        }

        .empty-state-v2 h4 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          margin: 0 0 6px 0;
          color: var(--text-heading);
        }

        .empty-state-v2 p {
          font-size: 0.78rem;
          color: var(--text-muted);
          max-width: 320px;
          margin: 0 auto;
          line-height: 1.4;
        }

        .table-card-v2 {
          display: flex;
          flex-direction: column;
        }

        .table-responsive-v2 {
          width: 100%;
          overflow-x: auto;
        }

        .pc-table-v2 {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .pc-table-v2 th {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--text-muted);
          padding: 12px 16px;
          border-bottom: 1.5px solid var(--border);
          letter-spacing: 0.5px;
        }

        .pc-table-v2 td {
          padding: 14px 16px;
          border-bottom: 1px solid var(--border);
          font-size: 0.82rem;
        }

        .table-row-v2:hover {
          background: var(--bg-badge);
        }

        .collaborator-profile-v2 {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar-placeholder-v2 {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--primary), var(--primary-hover));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.95rem;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
        }

        .profile-info-v2 {
          display: flex;
          flex-direction: column;
        }

        .username-v2 {
          font-weight: 750;
          color: var(--text-heading);
        }

        .discord-id-v2 {
          font-size: 0.72rem;
          color: var(--text-muted);
          margin-top: 1px;
        }

        .date-added-v2 {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
          font-size: 0.78rem;
          font-weight: 600;
        }

        .pc-btn-action-delete {
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.1);
          color: #ef4444;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.2s;
          margin-left: auto;
        }

        .pc-btn-action-delete:hover {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
          box-shadow: 0 4px 10px rgba(239, 68, 68, 0.2);
        }

        .text-right {
          text-align: right;
        }

        @media (max-width: 900px) {
          .pc-grid-v2 {
            grid-template-columns: 1fr;
          }
        }

        :global(.light-theme) .pc-collaborators-wrapper .pc-card-v2 {
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06) !important;
        }

        :global(.light-theme) .pc-collaborators-wrapper .info-box-v2 {
          background: #f8fafc !important;
        }

        :global(.light-theme) .pc-collaborators-wrapper .input-group-v2 {
          background: #f8fafc;
        }

        :global(.light-theme) .pc-collaborators-wrapper .input-group-v2:focus-within {
          background: #ffffff;
        }
      `}</style>
    </>
  );
}
