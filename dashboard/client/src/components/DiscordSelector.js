import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, Hash, Shield, Check, AlertCircle, X, Volume2, Folder, Megaphone } from 'lucide-react';
import { useT } from '../contexts/LanguageContext';

/**
 * Premium Discord Selector Component V2
 */
export default function DiscordSelector({ 
  options = [], 
  value = '', 
  onChange, 
  type = 'role', 
  placeholder,
  error = '',
  multiple = false
}) {
  const { t } = useT();
  const displayPlaceholder = placeholder || t('common.select_placeholder');
   const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  const getChannelIcon = (option, size = 16) => {
    if (!option) return <Hash size={size} className="ds-icon-muted" />;
    const channelType = option.type;
    if (channelType === 2 || channelType === 13) {
      return <Volume2 size={size} className="ds-icon-muted" />;
    } else if (channelType === 4) {
      return <Folder size={size} className="ds-icon-muted" />;
    } else if (channelType === 5) {
      return <Megaphone size={size} className="ds-icon-muted" />;
    }
    return <Hash size={size} className="ds-icon-muted" />;
  };

  const selectedOptions = useMemo(() => {
    if (multiple) {
      const values = Array.isArray(value) ? value : (value ? [value] : []);
      return options.filter(opt => values.includes(opt.id));
    }
    return options.find(opt => opt.id === value);
  }, [options, value, multiple]);

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
    <div className={`ds-container-v2 ${isOpen ? 'is-open' : ''}`} ref={containerRef}>
      <div 
        className={`ds-trigger-v2 ${isOpen ? 'active' : ''} ${error ? 'has-error' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="ds-trigger-content">
          {multiple && Array.isArray(selectedOptions) && selectedOptions.length > 0 ? (
            <div className="ds-tags-grid">
              {selectedOptions.map(opt => (
                <div key={opt.id} className="ds-tag-v2">
                  {type === 'role' && <div className="ds-tag-dot" style={{ background: opt.color || '#94a3b8' }} />}
                  <span>{opt.name}</span>
                  <button className="ds-btn-remove" onClick={(e) => removeValue(opt.id, e)}>
                    <X size={10} strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>
          ) : !multiple && selectedOptions ? (
            <div className="ds-selected-single">
              {type === 'role' ? (
                <div className="ds-role-v2">
                   <div className="ds-tag-dot" style={{ background: selectedOptions.color || '#94a3b8' }} />
                   <span>{selectedOptions.name}</span>
                </div>
              ) : (
                <div className="ds-channel-v2">
                  {getChannelIcon(selectedOptions, 14)}
                  <span>{selectedOptions.name}</span>
                </div>
              )}
            </div>
          ) : (
            <span className="ds-placeholder">{displayPlaceholder}</span>
          )}
        </div>
        <div className="ds-trigger-arrow">
          <ChevronDown size={18} />
        </div>
      </div>

      {isOpen && (
        <div className="ds-dropdown-v2 fade-in">
          <div className="ds-search-box">
            <Search size={16} />
            <input 
              autoFocus
              placeholder={t('common.search_placeholder')} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="ds-options-list">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => {
                const active = multiple ? Array.isArray(value) && value.includes(opt.id) : value === opt.id;
                return (
                  <div 
                    key={opt.id} 
                    className={`ds-option-v2 ${active ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleSelect(opt); }}
                  >
                    <div className="ds-option-left">
                       {type === 'role' ? (
                         <div className="ds-role-preview">
                           <div className="ds-tag-dot" style={{ background: opt.color || '#94a3b8' }} />
                           <span className="ds-opt-name">{opt.name}</span>
                         </div>
                       ) : (
                         <div className="ds-channel-preview">
                            {getChannelIcon(opt, 16)}
                            <span className="ds-opt-name">{opt.name}</span>
                         </div>
                       )}
                    </div>
                    {active && <Check size={16} className="ds-check-icon" />}
                  </div>
                );
              })
            ) : (
              <div className="ds-no-results">{t('common.no_results')}</div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="ds-error-text">
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}

      <style jsx>{`
        .ds-container-v2 { position: relative; width: 100%; font-family: 'Inter', sans-serif; }
        
        .ds-trigger-v2 {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-input);
          border: 1.5px solid var(--border);
          border-radius: 14px;
          padding: 10px 16px;
          min-height: 48px;
          cursor: pointer;
          transition: 0.3s var(--ease-premium);
        }
        .ds-trigger-v2:hover { border-color: var(--primary-muted); }
        .ds-trigger-v2.active { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-glow); }
        .ds-trigger-v2.has-error {
          border-color: var(--error);
          background: rgba(239, 68, 68, 0.06);
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
        }
        
        .ds-trigger-content { flex: 1; display: flex; align-items: center; min-width: 0; }
        .ds-placeholder { color: var(--text-muted); font-size: 0.95rem; font-weight: 600; }
        
        .ds-tags-grid { display: flex; flex-wrap: wrap; gap: 6px; }
        .ds-tag-v2 {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-badge);
          border: 1px solid var(--border);
          padding: 4px 6px 4px 10px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 700;
          box-shadow: 0 4px 10px rgba(0,0,0,0.02);
          color: var(--text-heading);
        }
        .ds-tag-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        
        .ds-btn-remove {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: none;
          background: var(--bg-badge);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.2s;
        }
        .ds-btn-remove:hover { background: var(--error); color: white; }

        .ds-selected-single { font-weight: 700; font-size: 0.95rem; color: var(--text-main); }
        .ds-role-v2, .ds-channel-v2 { display: flex; align-items: center; gap: 10px; }
        .ds-icon-muted { color: var(--text-muted); opacity: 0.6; }

        .ds-trigger-arrow { color: var(--text-muted); transition: 0.3s; }
        .ds-container-v2.is-open .ds-trigger-arrow { transform: rotate(180deg); color: var(--primary); }

        .ds-dropdown-v2 {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          box-shadow: var(--shadow-premium);
          z-index: 1000;
          overflow: hidden;
          padding: 12px;
        }

        .ds-search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-badge);
          padding: 10px 16px;
          border-radius: 12px;
          margin-bottom: 12px;
          border: 1px solid var(--border-light);
        }
        .ds-search-box input { border: none; background: transparent; width: 100%; font-weight: 700; outline: none; color: var(--text-main); font-size: 0.9rem; }
        .ds-search-box svg { color: var(--text-muted); }

        .ds-options-list { max-height: 250px; overflow-y: auto; padding-right: 4px; }
        .ds-option-v2 {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: 0.2s;
          margin-bottom: 4px;
        }
        .ds-option-v2:hover { background: var(--bg-badge); }
        .ds-option-v2.active { background: var(--primary-glow); color: var(--primary); }
        
        .ds-role-preview, .ds-channel-preview { display: flex; align-items: center; gap: 12px; }
        .ds-opt-name { font-weight: 700; font-size: 0.9rem; }
        .ds-check-icon { color: var(--primary); }
        .ds-no-results { padding: 32px; text-align: center; color: var(--text-muted); font-weight: 600; font-size: 0.9rem; }
        .ds-error-text {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          color: var(--error);
          font-size: 0.78rem;
          font-weight: 700;
        }
        .ds-error-text svg { flex-shrink: 0; }

        /* Custom Scrollbar */
        .ds-options-list::-webkit-scrollbar { width: 6px; }
        .ds-options-list::-webkit-scrollbar-track { background: transparent; }
        .ds-options-list::-webkit-scrollbar-thumb { background: var(--border-light); border-radius: 10px; }

        :global(.light-theme) .ds-dropdown-v2 { background: #ffffff !important; box-shadow: 0 20px 50px rgba(0,0,0,0.08) !important; border-color: var(--border-light) !important; }
        :global(.light-theme) .ds-tag-v2 { background: #ffffff !important; border-color: #f1f5f9 !important; color: var(--text-main) !important; }
        :global(.light-theme) .ds-option-v2:hover { background: #f8fafc !important; }
      `}</style>
    </div>
  );
}
