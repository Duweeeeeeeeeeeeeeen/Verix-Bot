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
  Zap, Info, Globe, ShieldAlert, Layers
} from 'lucide-react';
import GuideSidebar from '../../../components/GuideSidebar';

export default function GlobalConfigPage() {
  const router = useRouter();
  const { guildId } = router.query;

  const [config, setConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (!guildId) return;
    Promise.all([
      api.request(`/config/${guildId}/global`),
      api.request(`/config/${guildId}/discord-data`)
    ]).then(([cfgRes, discordRes]) => {
      setConfig(cfgRes?.data || cfgRes);
      setChannels(discordRes?.channels || []);
      setRoles(discordRes?.roles || []);
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
      showToast('Configurazione salvata!');
    } catch {
    } finally {
      setSaving(false);
    }
  };

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

  if (loading || !config) return <Layout guildId={guildId}><Skeleton height="500px" /></Layout>;

  return (
    <Layout guildId={guildId}>
      <div className="animate">
        
        {/* Modern Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Globe size={24} />
              </div>
              <div className="header-text">
                <h1>Configurazioni Globali</h1>
                <p>Gestione permessi master, logging centralizzato e identità del bot.</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
           </div>
        </header>

        {/* Minimal Tab System */}
        <div className="tab-navigation">
            <button onClick={() => setActiveTab('general')} className={`tab-link ${activeTab === 'general' ? 'active' : ''}`}>
                <Settings2 size={16} />
                <span>Base</span>
            </button>
            <button onClick={() => setActiveTab('security')} className={`tab-link ${activeTab === 'security' ? 'active' : ''}`}>
                <ShieldAlert size={16} />
                <span>Sicurezza</span>
            </button>
            <button onClick={() => setActiveTab('logs')} className={`tab-link ${activeTab === 'logs' ? 'active' : ''}`}>
                <FileText size={16} />
                <span>Logging</span>
            </button>
            <button onClick={() => setActiveTab('advanced')} className={`tab-link ${activeTab === 'advanced' ? 'active' : ''}`}>
                <Zap size={16} />
                <span>Data</span>
            </button>
        </div>

        <div className="tab-panel animate">
            
            {/* TAB: General */}
            {activeTab === 'general' && (
                <div className="config-grid-g">
                    <section className="card section-card-g">
                        <div className="align-center"><Globe size={18} color="var(--primary)" /> <h3>Localizzazione & Identità</h3></div>
                        <div className="fields-stack-g">
                            <div className="field-box">
                                <label className="text-label">Lingua Principale</label>
                                <select className="select" value={config.language || 'it'} onChange={e => setNested('language', e.target.value)}>
                                    <option value="it">🇮🇹 Italiano</option>
                                    <option value="en">🇬🇧 English</option>
                                </select>
                            </div>
                            <div className="field-box">
                                <label className="text-label">Nome Instance</label>
                                <input className="input" value={config.instanceName || 'Verix Bot'} onChange={e => setNested('instanceName', e.target.value)} />
                            </div>
                        </div>
                    </section>

                    <section className="card section-card-g">
                        <div className="align-center"><Palette size={18} color="var(--primary)" /> <h3>Estetica UI Discord</h3></div>
                        <div className="fields-stack-g">
                            <div className="field-box">
                                <label className="text-label">Sintassi Bottoni</label>
                                <select className="select">
                                    <option>Standard (Verix v2)</option>
                                    <option>Legacy (Discord native)</option>
                                </select>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {/* TAB: Security */}
            {activeTab === 'security' && (
                <section className="card section-card-g animate fade-in" style={{ maxWidth: '800px' }}>
                    <div className="align-center" style={{ marginBottom: '24px' }}>
                        <Shield size={20} color="var(--primary)" />
                        <h3>Permessi Amministratore Bot</h3>
                    </div>
                    <p className="text-muted" style={{ marginBottom: '20px' }}>I ruoli qui selezionati avranno pieno potere su ogni comando e modulo, bypassando i limiti dei singoli moduli.</p>
                    <div className="field-box">
                        <label className="text-label">Ruoli con Accesso Master</label>
                        <DiscordSelector type="role" multiple={true} options={roles} value={config.adminRoleIds || []} onChange={val => setNested('adminRoleIds', val)} />
                    </div>
                </section>
            )}

            {/* TAB: Logs */}
            {activeTab === 'logs' && (
                <div className="config-grid-g animate fade-in">
                    <section className="card section-card-g">
                        <div className="align-center"><FileText size={18} color="var(--primary)" /> <h3>Logging Centrale</h3></div>
                        <div className="fields-stack-g">
                            <div className="status-row-g">
                                <span>Attiva Log Principali</span>
                                <label className="toggle">
                                    <input type="checkbox" checked={!!config.logs?.enabled} onChange={() => setNested('logs.enabled', !config.logs?.enabled)} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="field-box">
                                <label className="text-label">Canale di Fallback</label>
                                <DiscordSelector type="channel" options={channels} value={config.logs?.channelId || ''} onChange={val => setNested('logs.channelId', val)} />
                                <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '8px' }}>Se un modulo non ha un log dedicato, scriverà qui.</p>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {/* TAB: Advanced */}
            {activeTab === 'advanced' && (
                <section className="card section-card-g animate fade-in">
                    <div className="align-center" style={{ marginBottom: '20px' }}><Layers size={20} color="var(--primary)" /> <h3>Raw Configuration Data</h3></div>
                    <textarea 
                        className="input" 
                        readOnly 
                        value={JSON.stringify(config, null, 2)} 
                        style={{ minHeight: '350px', fontFamily: 'monospace', fontSize: '0.8rem', background: 'rgba(0,0,0,0.1)' }}
                    />
                </section>
            )}

            <div style={{ marginTop: '32px' }}>
                <GuideSidebar type="global" context={config} />
            </div>
        </div>

        <style jsx>{`
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: rgba(255,255,255,0.02); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: rgba(129, 140, 248, 0.1); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }
            
            .tab-navigation { display: flex; gap: 8px; margin-bottom: 32px; padding: 6px; background: #070912; border-radius: 14px; border: 1px solid var(--border); width: fit-content; }
            .tab-link { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border: none; background: transparent; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; border-radius: 10px; cursor: pointer; transition: 0.2s; }
            .tab-link:hover { color: white; background: rgba(255,255,255,0.03); }
            .tab-link.active { color: white; background: var(--bg-card); box-shadow: var(--shadow-sm); border: 1px solid var(--border); }

            .config-grid-g { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 24px; }
            .fields-stack-g { display: flex; flex-direction: column; gap: 20px; margin-top: 16px; }
            .status-row-g { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: rgba(255,255,255,0.02); border-radius: 10px; border: 1px solid var(--border); font-size: 0.85rem; font-weight: 700; }

            .align-center { display: flex; align-items: center; gap: 10px; }
            @media (max-width: 1000px) { .config-grid-g { grid-template-columns: 1fr; } }
        `}</style>
      </div>
    </Layout>
  );
}
