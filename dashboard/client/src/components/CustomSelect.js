import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Premium Custom Select Component
 * Replaces native HTML <select> with a fully stylizable dropdown.
 */
export default function CustomSelect({ 
  options = [], 
  value = '', 
  onChange, 
  placeholder = 'Seleziona...',
  className = '',
  style = {}
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div 
      className={`custom-select-container ${isOpen ? 'is-open' : ''} ${className}`} 
      ref={containerRef}
      style={style}
    >
      <div 
        className={`custom-select-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? 'selected-text' : 'placeholder-text'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={18} className={`chevron ${isOpen ? 'rotate' : ''}`} />
      </div>

      {isOpen && (
        <div className="custom-select-dropdown animate fade-in">
          <div className="options-list">
            {options.map((opt) => (
              <div 
                key={opt.value}
                className={`option-item ${value === opt.value ? 'selected' : ''}`}
                onClick={() => handleSelect(opt.value)}
              >
                <span className="option-label">{opt.label}</span>
                {value === opt.value && <Check size={16} className="text-primary" />}
              </div>
            ))}
            {options.length === 0 && (
              <div className="no-options">Nessuna opzione disponibile</div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-select-container {
          position: relative;
          width: 100%;
          user-select: none;
        }

        .custom-select-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-input);
          border: 1px solid var(--border);
          padding: 12px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: 0.2s;
          min-height: 48px;
        }

        .custom-select-trigger:hover {
          border-color: var(--border-strong);
          background: var(--bg-elevated);
        }

        .custom-select-trigger.active {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .selected-text {
          font-weight: 600;
          color: var(--text-main);
          font-size: 0.95rem;
        }

        .placeholder-text {
          color: var(--text-dim);
          font-size: 0.95rem;
        }

        .chevron {
          color: var(--text-muted);
          transition: 0.3s;
        }

        .chevron.rotate {
          transform: rotate(180deg);
          color: var(--primary);
        }

        .custom-select-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          z-index: 99999;
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid var(--border-strong);
          overflow: hidden;
          box-shadow: var(--shadow-premium);
        }

        .options-list {
          max-height: 250px;
          overflow-y: auto;
          padding: 8px;
        }

        .option-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          border-radius: 10px;
          cursor: pointer;
          transition: 0.2s;
          margin-bottom: 2px;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-main);
        }

        .option-item:hover {
          background: var(--bg-badge);
          color: var(--text-main);
        }

        .option-item.selected {
          background: rgba(var(--primary-rgb), 0.1);
          color: var(--primary);
        }

        .text-primary { color: var(--primary); }

        .no-options {
          padding: 20px;
          text-align: center;
          color: var(--text-dim);
          font-size: 0.85rem;
        }

        /* Custom Scrollbar */
        .options-list::-webkit-scrollbar { width: 4px; }
        .options-list::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 10px; }
      `}</style>
    </div>
  );
}
