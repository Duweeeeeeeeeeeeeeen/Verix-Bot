import React from 'react';
import { AlertTriangle, Lock, ShieldAlert } from 'lucide-react';
import { useT } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

/**
 * Premium glassmorphic banner that alerts the user when editing is locked by another collaborator.
 * @param {object} props - Component props: { isLocked, lockOwner, forceUnlock }
 */
export default function LockWarningBanner({ isLocked, lockOwner, forceUnlock }) {
  const { t } = useT();
  const { user, currentGuildId } = useAuth();

  if (!isLocked || !lockOwner) return null;

  // Check if current user is a native Discord Administrator/Manage Server holder for this guild
  const currentGuild = user?.guilds?.find(g => g.id === currentGuildId);
  const isNativeAdmin = currentGuild 
    ? ((currentGuild.permissions & 0x8) || (currentGuild.permissions & 0x20))
    : false;

  return (
    <div className="pc-lock-banner glass-card animate slide-down">
      <div className="lock-content">
        <div className="lock-icon-wrapper">
          <Lock size={18} className="lock-icon" />
        </div>
        <div className="lock-text">
          <span>
            {t('collaborators.concurrency_warning', { username: lockOwner.username }) || 
              `🔒 Modifiche bloccate: questa sezione è attualmente in fase di configurazione da parte di ${lockOwner.username}.`}
          </span>
        </div>
      </div>
      
      {isNativeAdmin && (
        <button className="pc-btn-force-unlock" onClick={forceUnlock}>
          <ShieldAlert size={14} />
          <span>{t('collaborators.force_unlock') || 'Sblocca Forzatamente'}</span>
        </button>
      )}

      <style jsx>{`
        .pc-lock-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 12px 20px;
          margin-bottom: 24px;
          background: rgba(217, 119, 6, 0.08) !important;
          border: 1px solid rgba(217, 119, 6, 0.25) !important;
          border-radius: 12px;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(10px);
          position: relative;
          z-index: 100;
        }

        .lock-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .lock-icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(217, 119, 6, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f59e0b;
        }

        .lock-text {
          font-size: 0.85rem;
          font-weight: 600;
          color: #fca5a5;
          letter-spacing: 0.2px;
        }

        .pc-btn-force-unlock {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 8px 14px;
          border-radius: 8px;
          color: #ef4444;
          font-size: 0.78rem;
          font-weight: 750;
          cursor: pointer;
          transition: 0.2s;
        }

        .pc-btn-force-unlock:hover {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
          transform: translateY(-1px);
        }

        @media (max-width: 640px) {
          .pc-lock-banner {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .pc-btn-force-unlock {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
