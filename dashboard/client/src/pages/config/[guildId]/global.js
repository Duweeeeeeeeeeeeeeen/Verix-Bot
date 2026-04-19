import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import DiscordSelector from '../../../components/DiscordSelector';
import api from '../../../utils/api';
import {
  Save, Settings2, Palette, Bell, FileText, Tag,
  Plus, Trash2, ToggleLeft, ToggleRight, Hash,
  RefreshCcw, Eye, ChevronRight, ChevronDown,
  Monitor, Mic2, Ticket, Shield, AlertCircle, Check,
  Zap, Info
} from 'lucide-react';

// ─── CONSTANTS ────────────────────────────────────────────────────
const TABS = [
  { id: 'general',       label: 'Generali',         icon: Settings2 },
  { id: 'advanced',      label: 'Avanzate',         icon: Zap },
];

const BUTTON_STYLES = [
  { value: 'PRIMARY',   label: 'Primary',   color: '#5865F2' },
  { value: 'SUCCESS',   label: 'Success',   color: '#57F287' },
  { value: 'DANGER',    label: 'Danger',    color: '#ED4245' },
  { value: 'SECONDARY', label: 'Secondary', color: '#4f545c' },
];

const PANELS = [
  { key: 'whitelist', label: 'Whitelist',      icon: Shield },
  { key: 'tickets',   label: 'Support Ticket', icon: Ticket },
  { key: 'voice',     label: 'Voice Interview', icon: Mic2 },
];

const WL_EVENTS = [
  { key: 'onSubmit', label: 'Candidatura Inviata', desc: 'Quando un utente invia la candidatura' },
  { key: 'onAccept', label: 'Candidatura Accettata', desc: 'Quando lo staff accetta' },
  { key: 'onReject', label: 'Candidatura Rifiutata', desc: 'Quando lo staff rifiuta' },
];
const TK_EVENTS = [
  { key: 'onOpen',  label: 'Ticket Aperto', desc: 'Quando viene creato un nuovo ticket' },
  { key: 'onClose', label: 'Ticket Chiuso', desc: 'Quando un ticket viene chiuso' },
];

const LOG_EVENTS = [
  { key: 'onSubmit',    label: 'WL Candidatura Inviata' },
  { key: 'onAccept',    label: 'WL Candidatura Accettata' },
  { key: 'onReject',    label: 'WL Candidatura Rifiutata' },
  { key: 'onOpen',      label: 'Ticket Aperto' },
  { key: 'onClose',     label: 'Ticket Chiuso' },
  { key: 'onVoiceStart','label': 'Colloquio Voice Avviato' },
  { key: 'onVoiceEnd',  label: 'Colloquio Voice Terminato' },
];

const PLACEHOLDERS = ['{user}', '{id}', '{type}', '{emoji}'];

// ─── HELPERS ──────────────────────────────────────────────────────
function resolvePreview(template, vars = {}) {
  const d = { user: 'mario_rossi', id: '12345', type: 'supporto', emoji: '🟢', ...vars };
  return template
    .replace(/\{user\}/gi, d.user)
    .replace(/\{id\}/gi, d.id)
    .replace(/\{type\}/gi, d.type)
    .replace(/\{emoji\}/gi, d.emoji)
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 100);
}

const styleColor = (s) => BUTTON_STYLES.find(b => b.value === s)?.color || '#5865F2';

// ─── SUB COMPONENTS ───────────────────────────────────────────────

function ButtonPreview({ btn }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 18px',
      borderRadius: '4px',
      background: styleColor(btn.style),
      color: 'white',
      fontFamily: 'Whitney, sans-serif',
      fontSize: '0.875rem',
      fontWeight: '600',
      opacity: btn.enabled ? 1 : 0.35,
      boxShadow: `0 2px 8px ${styleColor(btn.style)}55`,
      transition: 'all 0.2s',
      cursor: 'default',
      userSelect: 'none',
      minWidth: '80px',
      justifyContent: 'center'
    }}>
      {btn.emoji && <span>{btn.emoji}</span>}
      <span>{btn.label || btn.customId}</span>
    </div>
  );
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <label className="toggle" style={{ opacity: disabled ? 0.5 : 1, width: '45px', height: '24px' }}>
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
      <span className="slider" />
    </label>
  );
}

function SectionCard({ title, icon: Icon, color, children, collapsible }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="gc-card">
      <div
        className="gc-card-header"
        onClick={collapsible ? () => setOpen(o => !o) : undefined}
        style={{ cursor: collapsible ? 'pointer' : 'default' }}
      >
        <div className="align-center" style={{ gap: '12px' }}>
          <div style={{ padding: '8px', background: `${color}22`, borderRadius: '10px', display: 'flex' }}>
            <Icon size={18} color={color} />
          </div>
          <span style={{ fontWeight: '750', fontSize: '1rem' }}>{title}</span>
        </div>
        {collapsible && (open ? <ChevronDown size={16} color="var(--text-dim)" /> : <ChevronRight size={16} color="var(--text-dim)" />)}
      </div>
      {(!collapsible || open) && <div className="gc-card-body">{children}</div>}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────

export default function GlobalConfigPage() {
  const router = useRouter();
  const { guildId } = router.query;

  const [config, setConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Filter tabs: hide Naming in basic mode
  useEffect(() => {
    if (!guildId) return;
    Promise.all([
      api.request(`/config/${guildId}/global`),
      api.request(`/config/${guildId}/discord-data`)
    ]).then(([cfgRes, discordRes]) => {
      setConfig(cfgRes?.data || cfgRes);
      const fetchedChannels = discordRes?.channels || [];
      const fetchedRoles = discordRes?.roles || [];
      console.log(`[DEBUG] Loaded ${fetchedChannels.length} channels and ${fetchedRoles.length} roles from discord-data.`);
      setChannels(fetchedChannels);
      setRoles(fetchedRoles);
    }).catch(console.error).finally(() => setLoading(false));
  }, [guildId]);

  const showToast = useCallback((message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/global`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast('Configurazione globale salvata!');
    } catch {
      // handled by api util
    } finally {
      setSaving(false);
    }
  };

  // Deep update helpers
  const setNested = (path, value) => {
    setConfig(prev => {
      const clone = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let cur = clone;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!cur[keys[i]]) cur[keys[i]] = {};
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return clone;
    });
  };

  // ── Button Helpers ──
  const getUiKey = (panel) => panel === 'tickets' ? 'ticketButtons' : `${panel}Buttons`;

  const updateBtn = (panel, idx, field, value) => {
    const key = getUiKey(panel);
    const btns = [...(config.ui?.[key] || [])];
    btns[idx] = { ...btns[idx], [field]: value };
    setNested(`ui.${key}`, btns);
  };

  const addBtn = (panel) => {
    const key = getUiKey(panel);
    const btns = [...(config.ui?.[key] || [])];
    btns.push({ customId: `btn_${Date.now()}`, label: 'Nuovo Bottone', emoji: '', style: 'PRIMARY', enabled: true });
    setNested(`ui.${key}`, btns);
  };

  const removeBtn = (panel, idx) => {
    const key = getUiKey(panel);
    const btns = (config.ui?.[key] || []).filter((_, i) => i !== idx);
    setNested(`ui.${key}`, btns);
  };

  if (loading || !config) {
    return (
      <Layout guildId={guildId}>
        <div className="animate">
          <div style={{ marginBottom: '40px' }}>
            <Skeleton width="400px" height="40px" style={{ marginBottom: '12px' }} />
            <Skeleton width="500px" height="20px" />
          </div>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
            {[1,2,3,4].map(i => <Skeleton key={i} width="140px" height="44px" style={{ borderRadius: '12px' }} />)}
          </div>
          <Skeleton height="500px" style={{ borderRadius: '20px' }} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout guildId={guildId}>
      <div className="animate">
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <div className="align-center" style={{ color: 'var(--primary)', marginBottom: '8px' }}>
              <Settings2 size={18} fill="currentColor" />
              <span className="text-label" style={{ marginBottom: 0 }}>Sistema Globale</span>
            </div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-1.5px' }}>Configurazione Globale</h1>
            <p className="text-description" style={{ fontSize: '1.1rem' }}>
              Personalizza bottoni, notifiche, log e naming senza toccare il codice.
            </p>

            {/* Tip Banner */}
            <div className="gc-info-banner" style={{ marginTop: '20px', maxWidth: '800px' }}>
              <Info size={16} /> Abbiamo spostato le impostazioni dei bottoni e delle notifiche direttamente nei moduli dedicati.
            </div>
          </div>
          <button onClick={handleSave} className="btn-primary" disabled={saving}>
            <Save size={20} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}
          </button>
        </header>

        {/* Tab Navigation */}
        <div className="gc-tabs" style={{ marginBottom: '32px' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`gc-tab ${active ? 'active' : ''}`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="gc-content-area">
          {/* ════ TAB: GENERAL ════ */}
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                  <SectionCard title="Logging Principale" icon={FileText} color="var(--primary)">
                      <p className="text-description" style={{ marginBottom: '20px' }}>
                          Il canale di log principale raccoglie tutti gli eventi abilitati nei singoli moduli.
                      </p>
                      <div className="input-group">
                          <label className="text-label">Stato Logging Master</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <Toggle
                                  checked={!!config.logs?.enabled}
                                  onChange={() => setNested('logs.enabled', !config.logs?.enabled)}
                              />
                              <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                                  {config.logs?.enabled ? 'Master Logging Attivo' : 'Logging Disabilitato'}
                              </span>
                          </div>
                      </div>
                      <div className="input-group" style={{ marginTop: '24px' }}>
                          <label className="text-label">Canale Log Principale</label>
                          <DiscordSelector
                              type="channel"
                              options={channels}
                              value={config.logs?.channelId || ''}
                              onChange={val => setNested('logs.channelId', val)}
                          />
                          <p className="text-description" style={{ fontSize: '0.8rem', marginTop: '8px' }}>
                              Se un modulo non ha un canale specifico impostato, userà questo come fallback.
                          </p>
                      </div>
                  </SectionCard>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <SectionCard title="Permissioni Globali" icon={Shield} color="var(--primary)">
                          <p className="text-description" style={{ marginBottom: '20px' }}>
                              I ruoli amministratori hanno accesso completo a tutti i comandi e le configurazioni del bot, indipendentemente dalle impostazioni dei singoli moduli.
                          </p>
                          <div className="input-group">
                              <label className="text-label">Ruoli Amministratori Bot</label>
                              <DiscordSelector
                                  type="role"
                                  multiple={true}
                                  options={roles}
                                  value={config.adminRoleIds || []}
                                  onChange={val => setNested('adminRoleIds', val)}
                                  placeholder="Seleziona ruoli..."
                              />
                          </div>
                      </SectionCard>

                      <SectionCard title="Identità & Fallback" icon={Tag} color="#10b981">
                          <p className="text-description" style={{ marginBottom: '16px' }}>Impostazioni di base ed estetica del bot.</p>
                          <div className="input-group" style={{ marginBottom: '16px' }}>
                              <label className="text-label">Lingua Principale (i18n)</label>
                              <select 
                                  className="input" 
                                  style={{ padding: '8px 12px', background: '#111', color: '#fff' }}
                                  value={config.language || 'it'}
                                  onChange={(e) => setNested('language', e.target.value)}
                              >
                                  <option value="it">🇮🇹 Italiano (Predefinito)</option>
                                  <option value="en">🇬🇧 English</option>
                              </select>
                              <p className="text-description" style={{ fontSize: '0.8rem', marginTop: '6px' }}>Scegli la lingua per i messaggi predefiniti del Bot.</p>
                          </div>
                          <div className="input-group">
                              <label className="text-label">Default UI Style</label>
                              <select className="input" style={{ padding: '8px 12px', background: '#111', color: '#fff' }}>
                                  <option>Modern Glass (Default)</option>
                                  <option>Discord Native</option>
                              </select>
                          </div>
                      </SectionCard>
                  </div>
              </div>
            </div>
          )}

          {/* ════ TAB: ADVANCED ════ */}
          {activeTab === 'advanced' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <SectionCard title="Configurazione Avanzata (JSON)" icon={Zap} color="var(--error)">
                  <p className="text-description" style={{ marginBottom: '20px' }}>
                      Modifica direttamente la struttura dati della configurazione globale. 
                      <span style={{ color: 'var(--error)', fontWeight: '700' }}> Attenzione: modifiche errate possono rompere il bot.</span>
                  </p>
                  <textarea 
                      className="input" 
                      style={{ minHeight: '400px', fontFamily: 'monospace', fontSize: '0.85rem', padding: '20px' }}
                      value={JSON.stringify(config, null, 2)}
                      readOnly
                  />
                  <button className="btn-outline" style={{ marginTop: '16px' }} onClick={() => showToast('Funzione di editing JSON in sviluppo', 'info')}>
                      Abilita Editing Raw
                  </button>
              </SectionCard>
            </div>
          )}
        </div>
      </div>

      {/* ═══ STYLES ═══════════════════════════════════════════════ */}
      <style jsx>{`
        .gc-tabs {
          display: flex;
          gap: 8px;
          background: rgba(255,255,255,0.02);
          padding: 6px;
          border-radius: 16px;
          border: 1px solid var(--border);
          width: fit-content;
        }
        .gc-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .gc-tab:hover {
          background: rgba(255,255,255,0.04);
          color: white;
        }
        .gc-tab.active {
          background: rgba(var(--primary-rgb), 0.12);
          border-color: rgba(var(--primary-rgb), 0.3);
          color: white;
        }

        .gc-view-switcher {
          display: flex;
          gap: 4px;
          background: rgba(255,255,255,0.02);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid var(--border);
          width: fit-content;
        }
        .gc-view-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 9px;
          border: none;
          background: transparent;
          color: var(--text-dim);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .gc-view-btn.active {
          background: rgba(255,255,255,0.05);
          color: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .gc-view-btn:not(.active):hover {
          color: white;
          background: rgba(255,255,255,0.02);
        }

        .gc-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .gc-card:hover { border-color: var(--border-light); }
        .gc-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }
        .gc-card-body { padding: 24px; }

        /* gc-toggle replaced by global .toggle */

        .gc-btn-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          border-radius: 14px;
          transition: all 0.2s;
        }
        .gc-btn-row:hover {
          background: rgba(255,255,255,0.04);
          border-color: var(--border-light);
        }
        .gc-input-sm {
          width: auto !important;
          padding: 8px 10px !important;
          font-size: 0.88rem !important;
          height: 40px;
        }
        .gc-input-flex {
          flex: 1;
          padding: 8px 12px !important;
          font-size: 0.88rem !important;
          height: 40px;
        }
        .gc-style-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          transition: transform 0.15s;
        }
        .gc-style-dot:hover { transform: scale(1.25); }
        .gc-btn-delete {
          background: rgba(239,68,68,0.08);
          border: 1px solid transparent;
          color: var(--error);
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
        }
        .gc-btn-delete:hover {
          background: var(--error);
          color: white;
        }
        .gc-add-btn {
          margin-top: 16px;
          width: 100%;
          justify-content: center;
          font-size: 0.85rem;
          padding: 10px;
        }

        .gc-event-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 16px 0;
          border-bottom: 1px solid var(--border);
        }
        .gc-event-row:last-child { border-bottom: none; }
        .gc-event-controls {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }
        .gc-event-toggle-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .gc-badge {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }
        .gc-select-sm {
          padding: 6px 10px !important;
          font-size: 0.82rem !important;
          height: 36px;
          min-width: 180px;
        }

        .gc-log-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }
        .gc-log-row:last-child { border-bottom: none; }

        .gc-name-preview {
          margin-top: 16px;
          padding: 14px 16px;
          background: rgba(0,0,0,0.2);
          border-radius: 10px;
          border: 1px solid var(--border);
        }

        .gc-info-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 18px;
          background: rgba(var(--primary-rgb), 0.06);
          border: 1px solid rgba(var(--primary-rgb), 0.2);
          border-radius: 12px;
          font-size: 0.87rem;
          color: var(--text-muted);
          font-weight: 500;
        }
      `}</style>
    </Layout>
  );
}
