import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Search, Command, X, ChevronRight, Zap, Sparkles } from 'lucide-react';
import { useT } from '../contexts/LanguageContext';

export default function CommandPalette({ isOpen, onClose, items, guildId, enabledModules = {} }) {
  const { t } = useT();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Flatten items for easier searching
  const allItems = items.flatMap(group => group.items);
  const filteredItems = query === '' 
    ? allItems.slice(0, 8) // Show first 8 if empty
    : allItems.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.id.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  const handleSelect = (item) => {
    router.push(item.path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette-container" onClick={e => e.stopPropagation()}>
        <div className="palette-header">
          <Search size={20} className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder={t('common.command_palette_placeholder') || 'Cerca un modulo o un comando...'}
            value={query}
            onChange={e => {
                setQuery(e.target.value);
                setSelectedIndex(0);
            }}
          />
          <div className="palette-badge">
            <kbd>ESC</kbd>
          </div>
        </div>

        <div className="palette-results">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`palette-item ${index === selectedIndex ? 'selected' : ''}`}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => handleSelect(item)}
                >
                  <div className="item-icon-box">
                    <Icon size={18} />
                  </div>
                  <div className="item-info">
                    <div className="item-name-row">
                      <span className="item-name">{item.name}</span>
                      {enabledModules[item.id] !== undefined && (
                        <div className={`status-dot-mini ${enabledModules[item.id] ? 'on' : 'off'}`} />
                      )}
                    </div>
                    <span className="item-path">{item.path}</span>
                  </div>
                  {index === selectedIndex && (
                    <div className="item-action">
                      <span>{t('common.jump_to') || 'Vai a'}</span>
                      <ChevronRight size={14} />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="palette-empty">
              <Zap size={24} opacity={0.3} />
              <p>{t('common.no_results') || 'Nessun risultato trovato'}</p>
            </div>
          )}
        </div>

        <div className="palette-footer">
          <div className="footer-tips">
            <div className="tip">
              <kbd>↑↓</kbd> <span>{t('common.navigate') || 'Naviga'}</span>
            </div>
            <div className="tip">
              <kbd>↵</kbd> <span>{t('common.select') || 'Seleziona'}</span>
            </div>
          </div>
          <div className="footer-brand">
            <Sparkles size={14} />
            <span>Verix Platinum</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .command-palette-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          z-index: 10000;
          display: flex;
          justify-content: center;
          padding-top: 15vh;
          animation: fadeIn 0.2s ease-out;
        }

        .command-palette-container {
          width: 600px;
          height: fit-content;
          max-height: 500px;
          background: var(--bg-card);
          border: 1px solid var(--border-strong);
          border-radius: 20px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .palette-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-secondary);
        }

        .palette-header input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-main);
          font-size: 1.1rem;
          font-weight: 500;
          outline: none;
        }

        .palette-header input::placeholder {
          color: var(--text-muted);
          opacity: 0.6;
        }

        .search-icon {
          color: var(--primary);
        }

        .palette-badge kbd {
          background: var(--bg-badge);
          border: 1px solid var(--border);
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 700;
        }

        .palette-results {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .palette-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .palette-item.selected {
          background: var(--primary-glow);
          transform: translateX(4px);
        }

        .item-icon-box {
          width: 40px;
          height: 40px;
          background: var(--bg-badge);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: 0.2s;
        }

        .palette-item.selected .item-icon-box {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        .item-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .item-name {
          font-weight: 700;
          color: var(--text-main);
          font-size: 0.95rem;
        }

        .item-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-dot-mini {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .status-dot-mini.on { background: #10b981; box-shadow: 0 0 6px rgba(16, 185, 129, 0.4); }
        .status-dot-mini.off { background: var(--text-dim); opacity: 0.3; }

        .item-path {
          font-size: 0.75rem;
          color: var(--text-dim);
          font-family: var(--font-mono);
          opacity: 0.5;
        }

        .item-action {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--primary);
          font-size: 0.8rem;
          font-weight: 700;
          animation: fadeIn 0.2s ease-out;
        }

        .palette-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          color: var(--text-muted);
          gap: 12px;
        }

        .palette-empty p {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .palette-footer {
          padding: 16px 24px;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-tips {
          display: flex;
          gap: 20px;
        }

        .tip {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          color: var(--text-dim);
        }

        .tip kbd {
          background: var(--bg-badge);
          border: 1px solid var(--border);
          padding: 1px 5px;
          border-radius: 4px;
          font-weight: 800;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--primary);
          font-weight: 800;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}
