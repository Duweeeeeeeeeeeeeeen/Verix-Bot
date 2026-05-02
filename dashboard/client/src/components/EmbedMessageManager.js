import React, { useState, useEffect } from 'react';
import { 
  Settings2, 
  Save, 
  RefreshCw, 
  MessageSquare, 
  ChevronDown, 
  ChevronRight, 
  AlertCircle,
  Play,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Info,
  Clock,
  Layers
} from 'lucide-react';
import api from '../utils/api';
import { useT } from '../contexts/LanguageContext';

/**
 * Manages multiple configurable messages for a module, grouped by context.
 * @param {string} guildId
 * @param {string} module - Module name (whitelist, tickets, verify, system)
 * @param {Array} slugs - List of { key, label, description, variables, group, groupIcon }
 * @param {Function} extraButtons - Optional function (slug) => [buttons] for preview
 */
export default function EmbedMessageManager({ guildId, module, slugs = [], extraButtons }) {
  const { t } = useT();
  const [messages, setMessages] = useState({});
  const [activeSlug, setActiveSlug] = useState(slugs[0]?.key || null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [openGroups, setOpenGroups] = useState({});

  // Grouping logic
  const groups = slugs.reduce((acc, slug) => {
    const groupName = slug.group || t('common.general');
    if (!acc[groupName]) acc[groupName] = { name: groupName, items: [], icon: slug.groupIcon || Layers };
    acc[groupName].items.push(slug);
    return acc;
  }, {});

  useEffect(() => {
    if (guildId && module) {
      fetchMessages();
    }
  }, [guildId, module]);

  // Open the group containing the active slug (runs only when activeSlug changes,
  // avoids re-running fetchMessages unnecessarily)
  useEffect(() => {
    if (!activeSlug) return;
    const activeGroup = Object.values(groups).find(g => g.items.some(s => s.key === activeSlug));
    if (activeGroup) {
      setOpenGroups(prev => ({ ...prev, [activeGroup.name]: true }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug]); // `groups` is derived from `slugs` which is stable — no extra dep needed

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.request(`/messages/${guildId}/${module}`);
      const dbData = res || {};
      const defaults = defaultMessages[module] || {};
      
      // Ensure every slug has at least the default content
      const merged = { ...dbData };
      slugs.forEach(slug => {
        if (!merged[slug.key]) {
          merged[slug.key] = defaults[slug.key] || {
            title: t('embeds.manager.missing_title'),
            description: t('embeds.manager.missing_desc'),
            color: '#6366f1'
          };
        }
      });

      setMessages(merged);
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      // Fallback to defaults
      const defaults = defaultMessages[module] || {};
      const fallback = {};
      slugs.forEach(slug => {
        fallback[slug.key] = defaults[slug.key] || {
          title: t('embeds.manager.missing_title'),
          description: t('embeds.manager.missing_desc'),
          color: '#6366f1'
        };
      });
      setMessages(fallback);
      setError(null); 
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request(`/messages/${guildId}/${module}`, {
        method: 'POST',
        body: JSON.stringify(messages)
      });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: t('common.saved_success'), type: 'success' } 
      }));
    } catch (err) {
      console.error('Error saving messages:', err);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: t('common.error'), type: 'error' } 
      }));
    } finally {
      setSaving(false);
    }
  };

  const updateMessage = (slug, data) => {
    setMessages(prev => ({
      ...prev,
      [slug]: data
    }));
  };

  const toggleGroup = (groupName) => {
    setOpenGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const activeSlugData = slugs.find(s => s.key === activeSlug);

  const getGroupStyles = (name) => {
    const n = name.toLowerCase();
    // Keywords mapping for styles (supporting multiple languages if needed, or just generic tags)
    const BLUE = ['avvio', 'start', 'apertura', 'open', 'entrata', 'join', 'welcome'];
    const AMBER = ['domande', 'questions', 'gestione', 'management', 'coda', 'queue', 'pending'];
    const GREEN = ['esito', 'result', 'successo', 'success', 'colloquio', 'interview', 'accepted'];
    const RED = ['errore', 'error', 'timeout', 'chiusura', 'close', 'denied', 'rejected'];

    if (BLUE.some(k => n.includes(k))) return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
    if (AMBER.some(k => n.includes(k))) return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
    if (GREEN.some(k => n.includes(k))) return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
    if (RED.some(k => n.includes(k))) return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
    return { color: 'var(--primary)', bg: 'rgba(99, 102, 241, 0.1)' };
  };

  if (loading) return (
    <div className="card glass animate" style={{ padding: '60px', textAlign: 'center' }}>
      <RefreshCw className="spin" size={32} color="var(--primary)" />
      <p style={{ marginTop: '16px', color: 'var(--text-dim)', fontWeight: 600 }}>{t('embeds.manager.syncing')}</p>
    </div>
  );

  return (
    <div className="message-manager">
      <div className="manager-layout">
        {/* Sidebar Groups */}
        <aside className="slug-sidebar">
          <div className="sidebar-header">
            <Layers size={18} color="var(--primary)" />
            <h4>{t('embeds.manager.sidebar_title')}</h4>
          </div>
          <div className="group-list">
            {Object.values(groups).map(group => {
               const styles = getGroupStyles(group.name);
               const isOpen = openGroups[group.name];
               const hasActive = group.items.some(s => s.key === activeSlug);

               return (
                 <div key={group.name} className={`message-group ${isOpen ? 'is-open' : ''} ${hasActive ? 'has-active' : ''}`}>
                    <button className="group-header" onClick={() => toggleGroup(group.name)}>
                      <div className="group-title">
                        <div className="group-icon-wrapper" style={{ backgroundColor: styles.bg, color: styles.color }}>
                          <group.icon size={16} />
                        </div>
                        <span>{group.name}</span>
                      </div>
                      <div className="group-meta">
                        <span className="count-badge">{group.items.length}</span>
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </div>
                    </button>
                    
                    {isOpen && (
                      <div className="group-content animate fade-in">
                        {group.items.map(slug => (
                          <button
                            key={slug.key}
                            className={`slug-item-v2 ${activeSlug === slug.key ? 'active' : ''}`}
                            onClick={() => setActiveSlug(slug.key)}
                          >
                            <div className="slug-dot"></div>
                            <span className="slug-label-v2">{slug.label}</span>
                            {activeSlug === slug.key && <div className="active-indicator"></div>}
                          </button>
                        ))}
                      </div>
                    )}
                 </div>
               );
            })}
          </div>
        </aside>

        {/* Editor Area */}
        <main className="editor-area-v2">
          {activeSlug && (
            <div className="animate slide-up">
              <header className="editor-header-v2">
                <div className="header-text-v2">
                  <div className="badge-context" style={{ backgroundColor: getGroupStyles(activeSlugData?.group || '').bg, color: getGroupStyles(activeSlugData?.group || '').color }}>
                    {activeSlugData?.group || t('common.general')}
                  </div>
                  <h3>{activeSlugData?.label}</h3>
                  <p>{activeSlugData?.description}</p>
                </div>
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="btn-save-all"
                >
                  {saving ? <RefreshCw className="spin" size={18} /> : <Save size={18} />}
                  <span>{saving ? t('embeds.manager.saving') : t('embeds.manager.save_changes')}</span>
                </button>
              </header>

              <div className="editor-card-p">
                <EmbedEditor
                  embed={messages[activeSlug] || defaultMessages[module]?.[activeSlug] || {
                    title: t('embeds.manager.missing_title'),
                    description: t('embeds.manager.missing_desc'),
                    color: '#6366f1'
                  }}
                  onChange={(data) => updateMessage(activeSlug, data)}
                  variables={activeSlugData?.variables || ['user', 'guild']}
                  previewButtons={extraButtons ? extraButtons(activeSlug) : null}
                />
              </div>
            </div>
          )}
          
          {!activeSlug && (
            <div className="empty-manager-state">
              <div className="empty-icon-p">
                <MessageSquare size={48} />
              </div>
              <h3>{t('embeds.manager.empty_title')}</h3>
              <p>{t('embeds.manager.empty_desc')}</p>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        .manager-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 32px;
          align-items: flex-start;
        }

        .slug-sidebar {
          background: var(--bg-sidebar-alt);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          position: sticky;
          top: 24px;
          box-shadow: var(--shadow-premium);
        }

        .sidebar-header {
          padding: 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sidebar-header h4 {
          font-weight: 800;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-dim);
        }

        .group-list {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .message-group {
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid transparent;
          transition: 0.2s;
        }

        .message-group.has-active {
          border-color: rgba(99, 102, 241, 0.1);
          background: var(--bg-elevated);
        }

        .group-header {
          width: 100%;
          padding: 14px 16px;
          background: none;
          border: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: 0.2s;
        }

        .group-header:hover {
          background: var(--bg-elevated);
        }

        .group-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-main);
        }

        .group-icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .group-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
        }

        .count-badge {
          font-size: 0.7rem;
          font-weight: 800;
          background: var(--bg-elevated-hover);
          padding: 2px 8px;
          border-radius: 6px;
        }

        .group-content {
          padding: 4px 12px 12px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .slug-item-v2 {
          width: 100%;
          padding: 10px 14px;
          background: none;
          border: none;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-dim);
          text-align: left;
          cursor: pointer;
          transition: 0.2s;
          position: relative;
        }

        .slug-item-v2:hover {
          background: var(--hover-bg);
          color: var(--text-main);
        }

        .slug-item-v2.active {
          background: rgba(var(--primary-rgb), 0.08);
          color: var(--text-main);
        }

        .slug-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--text-muted);
          opacity: 0.3;
        }

        .slug-item-v2.active .slug-dot {
          background: var(--primary);
          opacity: 1;
          box-shadow: 0 0 8px var(--primary);
        }

        .slug-label-v2 {
          font-size: 0.85rem;
          font-weight: 600;
        }

        .active-indicator {
          position: absolute;
          right: 12px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--primary);
        }

        .editor-header-v2 {
          margin-bottom: 32px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 0 4px;
        }

        .badge-context {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 0.65rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }

        .header-text-v2 h3 {
          font-size: 1.8rem;
          font-weight: 900;
          margin-bottom: 8px;
        }

        .header-text-v2 p {
          color: var(--text-dim);
          font-size: 0.95rem;
          max-width: 600px;
        }

        .btn-save-all {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--primary);
          color: var(--text-on-primary);
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: 0.2s;
          box-shadow: var(--primary-glow);
        }

        .btn-save-all:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }

        .editor-card-p {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 32px;
          box-shadow: var(--shadow-premium);
        }

        .empty-manager-state {
          padding: 100px 40px;
          text-align: center;
          background: var(--bg-elevated);
          border: 2px dashed var(--border);
          border-radius: 32px;
          color: var(--text-muted);
        }

        .empty-icon-p {
          width: 80px;
          height: 80px;
          background: var(--bg-elevated);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px auto;
          color: var(--border);
        }

        .empty-manager-state h3 {
          font-size: 1.4rem;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        @media (max-width: 1200px) {
          .manager-layout { grid-template-columns: 1fr; }
          .slug-sidebar { position: static; }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

