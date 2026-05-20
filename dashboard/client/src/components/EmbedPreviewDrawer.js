import { X } from 'lucide-react';
import EmbedPreviewContainer from './EmbedPreviewContainer';

export default function EmbedPreviewDrawer({ open, onClose, data, children }) {
  if (!open) return null;

  return (
    <div className="preview-drawer-layer" role="dialog" aria-modal="true">
      <button className="preview-drawer-backdrop" onClick={onClose} aria-label="Close preview" />
      <aside className="preview-drawer-panel">
        <header className="preview-drawer-header">
          <div>
            <span>Discord Preview</span>
            <p>Preview with proper message width.</p>
          </div>
          <button className="preview-drawer-close" onClick={onClose} aria-label="Close preview">
            <X size={18} />
          </button>
        </header>
        <div className="preview-drawer-body">
          <EmbedPreviewContainer data={data} style={{ minHeight: '100%' }}>
            {children}
          </EmbedPreviewContainer>
        </div>
      </aside>

      <style jsx>{`
        .preview-drawer-layer { position: fixed; inset: 0; z-index: 1000; display: flex; justify-content: flex-end; }
        .preview-drawer-backdrop { position: absolute; inset: 0; border: 0; background: rgba(15, 23, 42, 0.42); cursor: pointer; }
        .preview-drawer-panel {
          position: relative;
          width: min(760px, calc(100vw - 40px));
          height: 100vh;
          background: var(--bg-main);
          border-left: 1px solid var(--border);
          box-shadow: -24px 0 60px rgba(0,0,0,0.18);
          display: flex;
          flex-direction: column;
        }
        .preview-drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 18px 20px;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
        }
        .preview-drawer-header span { display: block; font-size: 1rem; font-weight: 850; color: var(--text-heading); }
        .preview-drawer-header p { margin: 4px 0 0 0; font-size: 0.78rem; font-weight: 650; color: var(--text-muted); }
        .preview-drawer-close {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg-badge);
          color: var(--text-main);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }
        .preview-drawer-body { padding: 18px; overflow: auto; flex: 1; }
        @media (max-width: 720px) {
          .preview-drawer-panel { width: 100vw; }
          .preview-drawer-body { padding: 12px; }
        }
      `}</style>
    </div>
  );
}
