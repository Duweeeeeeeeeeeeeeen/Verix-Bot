import React, { useState, useEffect } from 'react';
import { Settings2, Save, RefreshCw, MessageSquare, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import EmbedEditor from './EmbedEditor';
import api from '../utils/api';

/**
 * Manages multiple configurable messages for a module.
 * @param {string} guildId
 * @param {string} module - Module name (whitelist, tickets, verify, system)
 * @param {Array} slugs - List of { key, label, description, variables }
 */
export default function EmbedMessageManager({ guildId, module, slugs = [] }) {
  const [messages, setMessages] = useState({});
  const [activeSlug, setActiveSlug] = useState(slugs[0]?.key || null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (guildId && module) {
      fetchMessages();
    }
  }, [guildId, module]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.request(`/messages/${guildId}/${module}`);
      setMessages(res.data || {});
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Impossibile caricare i messaggi personalizzati.');
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
        detail: { message: 'Messaggi salvati con successo!', type: 'success' } 
      }));
    } catch (err) {
      console.error('Error saving messages:', err);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Errore durante il salvataggio dei messaggi.', type: 'error' } 
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

  const activeSlugData = slugs.find(s => s.key === activeSlug);

  if (loading) return (
    <div className="card glass animate" style={{ padding: '40px', textAlign: 'center' }}>
      <RefreshCw className="spin" size={24} color="var(--primary)" />
      <p style={{ marginTop: '10px', color: 'var(--text-dim)' }}>Caricamento messaggi...</p>
    </div>
  );

  return (
    <div className="message-manager">
      <div className="manager-layout">
        {/* Sidebar Slugs */}
        <aside className="slug-sidebar">
          <div className="sidebar-header">
            <MessageSquare size={18} color="var(--primary)" />
            <h4>Lista Messaggi</h4>
          </div>
          <div className="slug-list">
            {slugs.map(slug => (
              <button
                key={slug.key}
                className={`slug-item ${activeSlug === slug.key ? 'active' : ''}`}
                onClick={() => setActiveSlug(slug.key)}
              >
                <div className="slug-info">
                  <span className="slug-label">{slug.label}</span>
                  <span className="slug-key">{slug.key}</span>
                </div>
                {activeSlug === slug.key ? <ChevronRight size={16} /> : null}
              </button>
            ))}
          </div>
        </aside>

        {/* Editor Area */}
        <main className="editor-area">
          {activeSlug && (
            <div className="animate">
              <header className="editor-header">
                <div className="header-text">
                  <h3>Modifica: {activeSlugData?.label}</h3>
                  <p>{activeSlugData?.description}</p>
                </div>
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="btn-primary"
                  style={{ minWidth: '130px' }}
                >
                  {saving ? <RefreshCw className="spin" size={18} /> : <Save size={18} />}
                  <span>{saving ? 'Salvataggio...' : 'Salva Tutti'}</span>
                </button>
              </header>

              <div className="editor-wrapper">
                <EmbedEditor
                  embed={messages[activeSlug] || {}}
                  onChange={(data) => updateMessage(activeSlug, data)}
                  variables={activeSlugData?.variables || ['user', 'guild']}
                />
              </div>
            </div>
          )}
          {!activeSlug && (
            <div className="card glass empty-state">
              <AlertCircle size={40} color="var(--text-dim)" />
              <p>Seleziona un messaggio dalla lista per iniziare la personalizzazione.</p>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        .message-manager {
          height: auto;
        }
        .manager-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
          align-items: flex-start;
        }
        .slug-sidebar {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          position: sticky;
          top: 20px;
        }
        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sidebar-header h4 {
          font-weight: 800;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .slug-list {
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .slug-item {
          background: none;
          border: none;
          padding: 12px 15px;
          border-radius: 12px;
          color: var(--text-dim);
          text-align: left;
          cursor: pointer;
          transition: 0.2s;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .slug-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }
        .slug-item.active {
          background: var(--primary);
          color: white;
          box-shadow: var(--primary-glow);
        }
        .slug-info {
          display: flex;
          flex-direction: column;
        }
        .slug-label {
          font-weight: 700;
          font-size: 0.9rem;
        }
        .slug-key {
          font-size: 0.7rem;
          opacity: 0.6;
          font-family: monospace;
        }
        .editor-header {
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .header-text h3 {
          font-size: 1.5rem;
          font-weight: 900;
          margin-bottom: 4px;
        }
        .header-text p {
          color: var(--text-dim);
          font-size: 0.9rem;
        }
        .empty-state {
          padding: 80px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          color: var(--text-dim);
        }
        @media (max-width: 1000px) {
          .manager-layout { grid-template-columns: 1fr; }
          .slug-sidebar { position: static; }
        }
      `}</style>
    </div>
  );
}
