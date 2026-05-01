import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { 
    Save, 
    Gift, 
    Trophy,
    Clock,
    Users,
    Trash2,
    Plus,
    RefreshCcw,
    Settings2,
    Shield,
    Power,
    Palette,
    Zap,
    Info
} from 'lucide-react';
import DiscordSelector from '../../../components/DiscordSelector';

export default function GiveawayConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [roles, setRoles] = useState([]);
  const [activeGiveaways, setActiveGiveaways] = useState([]);
  const [activeTab, setActiveTab] = useState('settings');

  useEffect(() => {
    if (guildId) {
      fetchData();
    }
  }, [guildId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [configRes, discordRes, activeRes] = await Promise.all([
        api.request(`/config/${guildId}/giveaway`),
        api.request(`/config/${guildId}/discord-data`),
        api.request(`/config/${guildId}/giveaways/active`)
      ]);
      
      if (configRes) setConfig(configRes.data || configRes);
      if (discordRes) {
        const discordData = discordRes.data || {};
        setRoles(discordData.roles || []);
      }
      if (activeRes) setActiveGiveaways(activeRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/giveaway`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Configurazione salvata!', type: 'success' } }));
    } catch (e) {
      console.error(e);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Errore nel salvataggio', type: 'error' } }));
    } finally {
      setSaving(false);
    }
  };

  const setNested = (path, value) => {
    const newConfig = { ...config };
    const parts = path.split('.');
    let cur = newConfig;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!cur[parts[i]]) cur[parts[i]] = {};
        cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
    setConfig(newConfig);
  };

  if (loading || !config) return <Skeleton type="config" />;

  return (
    <div className="config-page-layout animate">
      <div className="config-main-col">
        {/* Module Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                <Gift size={24} />
              </div>
              <div className="header-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h1>Giveaway Manager</h1>
                  <label className="toggle-mini" title={config.enabled ? 'Modulo Attivo' : 'Modulo Disattivato'}>
                    <input type="checkbox" checked={!!config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                    <span className="slider-mini"></span>
                  </label>
                </div>
                <p>Gestisci estrazioni e premi per la tua community in modo semplice e automatico.</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
           </div>
        </header>

        {/* Tab Navigation */}
        <div className="tab-navigation">
            <button onClick={() => setActiveTab('settings')} className={`tab-link ${activeTab === 'settings' ? 'active' : ''}`}>
                <Settings2 size={16} /> <span>Settaggi</span>
            </button>
            <button onClick={() => setActiveTab('active')} className={`tab-link ${activeTab === 'active' ? 'active' : ''}`}>
                <Trophy size={16} /> <span>In Corso</span>
            </button>
        </div>

        <div className="tab-content">
            {activeTab === 'settings' && (
                <div className="config-grid-v animate fade-in">
                    <div className="grid-main-v">
                        <section className="card section-card-v">
                            <div className="align-center" style={{ marginBottom: '20px' }}>
                                <Shield size={18} color="var(--primary)" />
                                <h3>Permessi Manager</h3>
                            </div>
                            <div className="field-box">
                                <label className="text-label">Ruoli Manager</label>
                                <DiscordSelector 
                                    type="role" 
                                    multiple={true} 
                                    options={roles} 
                                    value={config.managerRoles || []} 
                                    onChange={val => setNested('managerRoles', val)} 
                                    placeholder="Ruoli che possono creare giveaway..."
                                />
                                <p className="field-help">I ruoli con permesso 'Gestisci Messaggi' possono sempre creare giveaway.</p>
                            </div>
                        </section>
                    </div>

                    <div className="grid-side-v">
                        <section className="card section-card-v">
                            <div className="align-center" style={{ marginBottom: '16px' }}>
                                <Zap size={16} color="var(--primary)" />
                                <h3>Quick Help</h3>
                            </div>
                            <p className="text-sm text-muted leading-relaxed">
                                Usa il comando <code>/giveaway start</code> su Discord per creare un nuovo giveaway istantaneamente.
                            </p>
                        </section>
                    </div>
                </div>
            )}

            {activeTab === 'active' && (
                <div className="animate fade-in">
                    <section className="card section-card-v">
                        <div className="align-center" style={{ marginBottom: '24px' }}>
                            <Clock size={18} color="var(--primary)" />
                            <h3>Giveaway Attualmente in Corso</h3>
                        </div>
                        
                        {activeGiveaways.length === 0 ? (
                            <div className="empty-state">
                                <Gift size={48} className="empty-icon" />
                                <p>Nessun giveaway attivo al momento.</p>
                                <span className="text-xs text-muted">Crea il primo con /giveaway start!</span>
                            </div>
                        ) : (
                            <div className="giveaway-list-grid">
                                {activeGiveaways.map(gw => (
                                    <div key={gw._id} className="gw-card">
                                        <div className="gw-card-header">
                                            <div className="gw-prize">{gw.prize}</div>
                                            <div className="gw-badge">ATTIVO</div>
                                        </div>
                                        <div className="gw-stats">
                                            <div className="gw-stat-item">
                                                <Users size={14} />
                                                <span>{gw.participants?.length || 0} Partecipanti</span>
                                            </div>
                                            <div className="gw-stat-item">
                                                <Trophy size={14} />
                                                <span>{gw.winnerCount} Vincitori</span>
                                            </div>
                                        </div>
                                        <div className="gw-footer">
                                            <Clock size={12} />
                                            <span>Termina: {new Date(gw.endTime).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}
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

            .config-grid-v { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
            .align-center { display: flex; align-items: center; gap: 10px; }
            
            .toggle-mini { position: relative; display: inline-block; width: 34px; height: 18px; }
            .toggle-mini input { opacity: 0; width: 0; height: 0; }
            .slider-mini { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #334155; transition: .3s; border-radius: 18px; }
            .slider-mini:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
            input:checked + .slider-mini { background-color: var(--primary); }
            input:checked + .slider-mini:before { transform: translateX(16px); }

            .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; background: rgba(255,255,255,0.02); border: 2px dashed var(--border); border-radius: 20px; }
            .empty-icon { color: var(--text-dim); margin-bottom: 16px; opacity: 0.3; }
            .empty-state p { color: var(--text-muted); font-weight: 500; }

            .giveaway-list-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
            .gw-card { padding: 20px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 16px; transition: 0.3s; }
            .gw-card:hover { border-color: var(--primary); background: rgba(255,255,255,0.05); }
            .gw-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
            .gw-prize { font-size: 1.1rem; font-weight: 700; color: white; }
            .gw-badge { font-size: 0.65rem; font-weight: 900; background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(34, 197, 94, 0.2); }
            .gw-stats { display: flex; gap: 16px; margin-bottom: 16px; }
            .gw-stat-item { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--text-muted); }
            .gw-footer { display: flex; align-items: center; gap: 6px; font-size: 0.7rem; color: var(--text-dim); border-top: 1px solid var(--border); pt: 12px; margin-top: 12px; pt: 12px; }

            @media (max-width: 1000px) { .config-grid-v { grid-template-columns: 1fr; } }
        `}</style>
    </div>
  );
}
