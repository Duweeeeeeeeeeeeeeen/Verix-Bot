import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, Hash, Shield, Check, AlertCircle, X } from 'lucide-react';

/**
 * Professional Discord Selector Component
 * @param {Array} options - List of roles or channels
 * @param {string} value - Current selected ID
 * @param {Function} onChange - Change handler
 * @param {string} type - 'role' | 'channel'
 * @param {string} placeholder - Empty state text
 * @param {string} error - Optional error message
 */
export default function DiscordSelector({ 
  options = [], 
  value = '', 
  onChange, 
  type = 'role', 
  placeholder = 'Seleziona...',
  error = '',
  multiple = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  const selectedOptions = useMemo(() => {
    if (multiple) {
      const values = Array.isArray(value) ? value : (value ? [value] : []);
      return options.filter(opt => values.includes(opt.id));
    }
    return options.find(opt => opt.id === value);
  }, [options, value, multiple]);

  const isSelected = (id) => {
    if (multiple) {
      const values = Array.isArray(value) ? value : (value ? [value] : []);
      return values.includes(id);
    }
    return value === id;
  };

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const s = search.toLowerCase();
    return options.filter(opt => 
      opt.name.toLowerCase().includes(s) || 
      opt.id.toLowerCase().includes(s)
    );
  }, [options, search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    if (option.assignable === false) return;
    
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : (value ? [value] : []);
      const newValues = currentValues.includes(option.id)
        ? currentValues.filter(v => v !== option.id)
        : [...currentValues, option.id];
      onChange(newValues);
    } else {
      onChange(option.id);
      setIsOpen(false);
    }
    setSearch('');
  };

  const removeValue = (id, e) => {
    e.stopPropagation();
    const currentValues = Array.isArray(value) ? value : [];
    onChange(currentValues.filter(v => v !== id));
  };

  return (
    <div className={`selector-container ${isOpen ? 'is-open' : ''}`} ref={containerRef}>
      <div 
        className={`selector-trigger ${isOpen ? 'active' : ''} ${error ? 'has-error' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="trigger-content">
          {multiple && Array.isArray(selectedOptions) && selectedOptions.length > 0 ? (
            <div className="tags-wrapper">
              {selectedOptions.map(opt => (
                <div key={opt.id} className="selector-tag">
                  {type === 'role' && <div className="tag-dot" style={{ background: opt.color || '#99aab5' }} />}
                  <span>{opt.name}</span>
                  <button className="btn-remove-premium" style={{ width: '20px', height: '20px', padding: '0', borderRadius: '50%' }} onClick={(e) => removeValue(opt.id, e)}>
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          ) : !multiple && selectedOptions ? (
            <div className="option-display">
              {type === 'role' ? (
                <div className="role-dot" style={{ background: selectedOptions.color || '#99aab5' }} />
              ) : (
                <Hash size={16} className="text-dim" />
              )}
              <span className="selected-text">{selectedOptions.name}</span>
              <button 
                className="btn-clear-single" 
                onClick={(e) => {
                    e.stopPropagation();
                    onChange('');
                }}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <span className="placeholder-text">{placeholder}</span>
          )}
        </div>
        <ChevronDown size={18} className={`chevron ${isOpen ? 'rotate' : ''}`} />
      </div>

      {isOpen && (
        <div className="selector-dropdown glass-heavy animate-fade-in">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input 
              autoFocus
              className="search-input"
              placeholder="Cerca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {search && <X size={14} className="clear-search" onClick={() => setSearch('')} />}
          </div>

          <div className="options-list">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div 
                  key={opt.id}
                  className={`option-item ${isSelected(opt.id) ? 'selected' : ''} ${opt.assignable === false ? 'disabled' : ''}`}
                  onClick={() => handleSelect(opt)}
                >
                  <div className="option-info">
                    {type === 'role' ? (
                      <div className="role-dot" style={{ background: opt.color || '#99aab5' }} />
                    ) : (
                      <Hash size={16} className="text-dim" />
                    )}
                    <div className="name-wrapper">
                      <span className="option-name">{opt.name}</span>
                      {type === 'role' && opt.position !== undefined && (
                        <span className="option-meta">Pos. {opt.position}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="option-status">
                    {isSelected(opt.id) && <Check size={16} className="text-primary" />}
                    {opt.assignable === false && (
                      <div className="disabled-badge" title="Ruolo superiore nella gerarchia del Bot">
                        <AlertCircle size={14} />
                        <span>non assegnabile</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                {options.length === 0 ? 'Nessun dato disponibile.' : 'Nessun risultato trovato.'}
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="error-hint">{error}</p>}

      <style jsx>{`
        .selector-container {
          position: relative;
          width: 100%;
          user-select: none;
          z-index: 10;
        }

        .selector-container.is-open {
          z-index: 1010;
        }

        .selector-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-input);
          border: 1px solid var(--border);
          padding: 12px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: var(--transition-fast);
          min-height: 48px;
        }

        .selector-trigger:hover {
          border-color: var(--border-light);
          background: var(--bg-elevated);
        }

        .selector-trigger.active {
          border-color: var(--primary);
          background: rgba(16, 185, 129, 0.05);
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }

        .selector-trigger.has-error {
          border-color: var(--error);
        }

        .trigger-content {
          flex: 1;
          display: flex;
          align-items: center;
          overflow: hidden;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tags-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 2px 0;
        }

        .selector-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-badge);
          border: 1px solid var(--border);
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-main);
          transition: var(--transition-fast);
        }

        .selector-tag:hover {
          background: var(--bg-elevated-hover);
          border-color: var(--border-strong);
        }

        .tag-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .tag-remove {
          cursor: pointer;
          color: var(--text-dim);
          transition: var(--transition-fast);
        }

        .tag-remove:hover {
          color: var(--error);
        }
        
        .btn-clear-single {
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: 0.2s;
          margin-left: auto;
        }
        
        .btn-clear-single:hover {
          background: var(--bg-badge);
          color: var(--error);
        }

        .option-display {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .selected-text {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .placeholder-text {
          color: var(--text-dim);
          font-size: 0.95rem;
        }

        .chevron {
          color: var(--text-dim);
          transition: transform 0.3s ease;
          margin-left: 12px;
        }

        .chevron.rotate {
          transform: rotate(180deg);
          color: var(--primary);
        }

        .selector-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          z-index: 1000;
          background: var(--bg-card); /* Use themed background */
          backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid var(--border-strong);
          overflow: hidden;
          box-shadow: var(--shadow-premium);
        }

        .search-box {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-elevated);
          gap: 12px;
        }

        .search-icon {
          color: var(--text-dim);
        }

        .search-input {
          background: none;
          border: none;
          color: var(--text-main);
          font-size: 0.9rem;
          width: 100%;
          outline: none;
          font-family: inherit;
        }

        .clear-search {
          color: var(--text-dim);
          cursor: pointer;
          transition: color 0.2s;
        }

        .clear-search:hover {
          color: var(--text-main);
        }

        .options-list {
          max-height: 280px;
          overflow-y: auto;
          padding: 8px;
        }

        .option-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 2px;
        }

        .option-item:hover:not(.disabled) {
          background: var(--bg-elevated-hover);
        }

        .option-item.selected {
          background: rgba(var(--primary-rgb), 0.1);
        }

        .option-item.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .option-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .role-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 0 8px rgba(0,0,0,0.3);
        }

        .name-wrapper {
          display: flex;
          flex-direction: column;
        }

        .option-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .option-meta {
          font-size: 0.7rem;
          color: var(--text-dim);
          font-weight: 500;
        }

        .disabled-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--error);
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          background: rgba(239, 68, 68, 0.1);
          padding: 4px 8px;
          border-radius: 6px;
        }

        .no-results {
          padding: 30px;
          text-align: center;
          color: var(--text-dim);
          font-size: 0.9rem;
        }

        .error-hint {
          color: var(--error);
          font-size: 0.75rem;
          font-weight: 600;
          margin-top: 6px;
          margin-left: 4px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fadeIn 0.2s var(--ease-premium);
        }
      `}</style>
    </div>
  );
}
