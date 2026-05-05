import { useT } from '../contexts/LanguageContext';
import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type = 'danger' }) {
  const { t } = useT();
  const finalConfirmText = confirmText || t('common.confirm');
  const finalCancelText = cancelText || t('common.cancel');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate fade-in">
      <div className="modal-content animate slide-up">
        <div className="modal-header">
          <div className={`icon-box ${type}`}>
            <AlertTriangle size={24} />
          </div>
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body">
          <p>{message}</p>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>{finalCancelText}</button>
          <button className={`btn-confirm ${type}`} onClick={() => { onConfirm(); onClose(); }}>
            {finalConfirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--bg-overlay);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }

        .modal-content {
          background: var(--bg-card);
          border: 1px solid var(--border-strong);
          border-radius: 24px;
          width: 100%;
          max-width: 450px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .modal-header {
          padding: 24px 24px 12px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
        }

        .icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-box.danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .icon-box.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .icon-box.primary { background: rgba(99, 102, 241, 0.1); color: #6366f1; }

        h3 { font-size: 1.25rem; margin: 0; font-weight: 700; color: var(--text-heading); }

        .close-btn {
          position: absolute;
          top: 24px;
          right: 24px;
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          transition: 0.2s;
        }

        .close-btn:hover { color: var(--text-main); }

        .modal-body {
          padding: 0 24px 24px 24px;
        }

        .modal-body p {
          color: var(--text-dim);
          line-height: 1.6;
          margin: 0;
        }

        .modal-footer {
          padding: 20px 24px;
          background: var(--bg-inset);
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid var(--glass-border);
        }

        .btn-cancel {
          padding: 10px 20px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-main);
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .btn-cancel:hover { background: var(--bg-elevated-hover); }

        .btn-confirm {
          padding: 10px 24px;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          color: var(--text-on-primary);
          cursor: pointer;
          transition: 0.2s;
        }

        .btn-confirm.danger { background: #ef4444; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3); }
        .btn-confirm.danger:hover { background: #dc2626; transform: translateY(-1px); }

        .btn-confirm.warning { background: #f59e0b; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3); }
        .btn-confirm.warning:hover { background: #d97706; transform: translateY(-1px); }

        .btn-confirm.primary { background: #6366f1; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3); }
        .btn-confirm.primary:hover { background: #4f46e5; transform: translateY(-1px); }
      `}</style>
    </div>
  );
}
