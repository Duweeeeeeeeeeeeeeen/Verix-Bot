import React, { useState } from 'react';
import { 
  Palette, 
  Layout, 
  MousePointer2, 
  Type, 
  Layers, 
  ChevronDown, 
  ChevronRight,
  Sparkles,
  FileText,
  CircleDot
} from 'lucide-react';

/**
 * Manages Design sections with grouping and accordions for consistency.
 * @param {Array} groups - List of { name, icon, description, children }
 */
export default function DesignSectionManager({ groups = [] }) {
  const [openGroups, setOpenGroups] = useState({ [groups[0]?.name]: true });

  const toggleGroup = (name) => {
    setOpenGroups(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const getGroupStyles = (name) => {
    const n = name.toLowerCase();
    if (n.includes('generale') || n.includes('aspetto')) return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
    if (n.includes('bottoni') || n.includes('controlli') || n.includes('azioni')) return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
    if (n.includes('embed') || n.includes('contenuto') || n.includes('layout')) return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
    return { color: 'var(--primary)', bg: 'rgba(99, 102, 241, 0.1)' };
  };

  return (
    <div className="design-manager animate fade-in">
      <div className="design-stack">
        {groups.map((group, idx) => {
          const isOpen = openGroups[group.name];
          const styles = getGroupStyles(group.name);
          const Icon = group.icon || Palette;

          return (
            <div key={group.name} className={`design-group-card ${isOpen ? 'is-open' : ''}`}>
              <button className="group-trigger" onClick={() => toggleGroup(group.name)}>
                <div className="group-info">
                  <div className="group-icon-box" style={{ backgroundColor: styles.bg, color: styles.color }}>
                    <Icon size={20} />
                  </div>
                  <div className="group-text">
                    <h4>{group.name}</h4>
                    <p>{group.description}</p>
                  </div>
                </div>
                <div className="group-action">
                  {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </button>

              {isOpen && (
                <div className="group-body animate slide-up">
                  {group.children}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .design-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .design-group-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          transition: 0.3s;
        }

        .design-group-card.is-open {
          border-color: rgba(99, 102, 241, 0.2);
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }

        .group-trigger {
          width: 100%;
          padding: 24px;
          background: none;
          border: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: 0.2s;
        }

        .group-trigger:hover {
          background: var(--bg-elevated);
        }

        .group-info {
          display: flex;
          align-items: center;
          gap: 20px;
          text-align: left;
        }

        .group-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .group-text h4 {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-heading);
          margin-bottom: 2px;
        }

        .group-text p {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .group-action {
          color: var(--text-muted);
        }

        .group-body {
          padding: 0 24px 24px 24px;
          border-top: 1px solid var(--border);
          background: var(--bg-inset);
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
