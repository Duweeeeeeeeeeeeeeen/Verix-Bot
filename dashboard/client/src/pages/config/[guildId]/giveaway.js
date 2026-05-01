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
    Info,
    MessageSquare,
    ExternalLink,
    History,
    X
} from 'lucide-react';
import DiscordSelector from '../../../components/DiscordSelector';

export default function GiveawayConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [config, setConfig] = useState(null);
  const [roles, setRoles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [activeGiveaways, setActiveGiveaways] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('active');

  // Form State for new giveaway
  const [newGw, setNewGw] = useState({
    prize: '',
    duration: 60, // minutes
    winnerCount: 1,
    channelId: ''
  });

  useEffect(() => {
    if (guildId) {
      fetchData();
    }
  }, [guildId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [configRes, discordRes, activeRes, logsRes] = await Promise.all([
        api.request(`/config/${guildId}/giveaway`),
        api.request(`/config/${guildId}/discord-data`),
        api.request(`/config/${guildId}/giveaways/active`),
        api.request(`/config/${guildId}/giveaways/logs`)
      ]);
      
      if (configRes) setConfig(configRes.data || configRes);
      if (discordRes) {
        const dData = discordRes.data || {};
        setRoles(dData.roles || []);
        setChannels(dData.channels?.filter(c => c.type === 0) || []); // Text channels
      }
      if (activeRes) setActiveGiveaways(activeRes.data || []);
      if (logsRes) setLogs(logsRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/giveaway`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast('Configurazione salvata!');
    } catch (e) {
      showToast('Errore nel salvataggio', 'error');
    }
    setSaving(false);
  };

  const handleCreateGiveaway = async (e) => {
    e.preventDefault();
    if (!newGw.prize || !newGw.channelId) return showToast('Compila tutti i campi!', 'error');
    
    setCreating(true);
    try {
      const res = await api.request(`/config/${guildId}/giveaways/create`, {
        method: 'POST',
        body: JSON.stringify(newGw)
      });
      if (res.success) {
        showToast('Giveaway avviato con successo!');
        setNewGw({ prize: '', duration: 60, winnerCount: 1, channelId: '' });
        fetchData();
      }
    } catch (e) {
      showToast('Errore durante la creazione', 'error');
    }
    setCreating(false);
  };

  const handleDeleteGiveaway = async (messageId) => {
    if (!confirm('Sei sicuro di voler annullare questo giveaway? Il messaggio su Discord verrà eliminato.')) return;
    try {
      await api.request(`/config/${guildId}/giveaways/${messageId}`, { method: 'DELETE' });
      showToast('Giveaway eliminato');
      fetchData();
    } catch (e) {
      showToast('Errore durante l\'eliminazione', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  if (loading || !config) return <Skeleton type="config" />;

  return (
    <div className="config-page-layout animate">
      <div className="config-main-col">
        {/* Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                <Gift size={24} />
              </div>
              <div className="header-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h1>Giveaway Manager</h1>
                  <label className="toggle-mini">
                    <input type="checkbox" checked={!!config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                    <span className="slider-mini"></span>
                  </label>
                </div>
                <p>Gestisci le estrazioni del tuo server direttamente dalla dashboard.</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleSaveConfig} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Salvataggio...' : 'Salva Impostazioni'}
              </button>
           </div>
        </header>

        {/* Navigation */}
        <div className="tab-navigation">
            <button onClick={() => setActiveTab('active')} className={`tab-link ${activeTab === 'active' ? 'active' : ''}`}>
                <Zap size={16} /> <span>Live & Crea</span>
            </button>
            <button onClick={() => setActiveTab('logs')} className={`tab-link ${activeTab === 'logs' ? 'active' : ''}`}>
                <Clock size={16} /> <span>Cronologia</span>
            </button>
            <button onClick={() => setActiveTab('settings')} className={`tab-link ${activeTab === 'settings' ? 'active' : ''}`}>
                <Settings2 size={16} /> <span>Permessi</span>
            </button>
        </div>

        <div className="tab-content">
            {activeTab === 'active' && (
                <div className="config-grid-v animate fade-in">
                    <div className="grid-main-v">
                        {/* Creation Form */}
                        <section className="card section-card-v" style={{ marginBottom: '24px' }}>
                            <div className="align-center" style={{ marginBottom: '20px' }}>
                                <Plus size={18} color="#ec4899" />
                                <h3>Avvia Nuovo Giveaway</h3>
                            </div>
                            <form onSubmit={handleCreateGiveaway} className="create-gw-form">
                                <div className="fields-grid-v">
                                    <div className="field-box">
                                        <label className="text-label">Premio in palio</label>
                                        <input 
                                            type="text" 
                                            className="input" 
                                            placeholder="Es: VIP Gold per 1 mese"
                                            value={newGw.prize}
                                            onChange={e => setNewGw({...newGw, prize: e.target.value})}
                                        />
                                    </div>
                                    <div className="field-box">
                                        <label className="text-label">Canale Discord</label>
                                        <DiscordSelector 
                                            type="channel" 
                                            options={channels} 
                                            value={newGw.channelId} 
                                            onChange={val => setNewGw({...newGw, channelId: val})}
                                        />
                                    </div>
                                    <div className="field-box">
                                        <label className="text-label">Durata (Minuti)</label>
                                        <input 
                                            type="number" 
                                            className="input" 
                                            min="1"
                                            value={newGw.duration}
                                            onChange={e => setNewGw({...newGw, duration: parseInt(e.target.value)})}
                                        />
                                    </div>
                                    <div className="field-box">
                                        <label className="text-label">Numero Vincitori</label>
                                        <input 
                                            type="number" 
                                            className="input" 
                                            min="1"
                                            max="50"
                                            value={newGw.winnerCount}
                                            onChange={e => setNewGw({...newGw, winnerCount: parseInt(e.target.value)})}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn-create-gw" disabled={creating}>
                                    {creating ? <RefreshCcw className="animate-spin" size={16} /> : <Zap size={16} />}
                                    Avvia Giveaway
                                </button>
                            </form>
                        </section>

                        {/* Active List */}
                        <section className="card section-card-v">
                            <div className="align-center" style={{ marginBottom: '20px' }}>
                                <Trophy size={18} color="#f1c40f" />
                                <h3>Giveaway in Corso</h3>
                            </div>
                            
                            {activeGiveaways.length === 0 ? (
                                <div className="empty-state">
                                    <Gift size={32} opacity="0.2" />
                                    <p>Nessun giveaway attivo.</p>
                                </div>
                            ) : (
                                <div className="active-gw-list">
                                    {activeGiveaways.map(gw => (
                                        <div key={gw._id} className="active-gw-item">
                                            <div className="gw-info">
                                                <h4>{gw.prize}</h4>
                                                <div className="gw-meta">
                                                    <span><Clock size={12}/> <t className="time-tag">{new Date(gw.endTime).toLocaleString()}</t></span>
                                                    <span><Users size={12}/> {gw.participants?.length || 0} iscritti</span>
                                                </div>
                                            </div>
                                            <div className="gw-actions">
                                                <button onClick={() => handleDeleteGiveaway(gw.messageId)} className="btn-icon-danger" title="Elimina/Annulla">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    <div className="grid-side-v">
                         <section className="card section-card-v">
                            <div className="align-center" style={{ marginBottom: '16px' }}>
                                <Info size={16} color="var(--primary)" />
                                <h3>Tips</h3>
                            </div>
                            <p className="text-sm text-muted">
                                Puoi gestire i partecipanti direttamente da qui. In futuro aggiungeremo la possibilità di visualizzare la lista completa dei nomi.
                            </p>
                        </section>
                    </div>
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="animate fade-in">
                    <section className="card section-card-v">
                        <div className="align-center" style={{ marginBottom: '20px' }}>
                            <History size={18} color="var(--primary)" />
                            <h3>Ultimi 20 Giveaway Conclusi</h3>
                        </div>
                        <div className="logs-table-wrapper">
                            <table className="logs-table">
                                <thead>
                                    <tr>
                                        <th>Premio</th>
                                        <th>Data</th>
                                        <th>Vincitori</th>
                                        <th>Partecipanti</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map(log => (
                                        <tr key={log._id}>
                                            <td className="font-bold">{log.prize}</td>
                                            <td>{new Date(log.endTime).toLocaleDateString()}</td>
                                            <td>
                                                <div className="winners-pill">
                                                    {log.winners?.length || 0} Estratti
                                                </div>
                                            </td>
                                            <td>{log.participants?.length || 0}</td>
                                        </tr>
                                    ))}
                                    {logs.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                                                Nessun log disponibile.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="config-grid-v animate fade-in">
                    <div className="grid-main-v">
                        <section className="card section-card-v">
                            <div className="align-center" style={{ marginBottom: '20px' }}>
                                <Shield size={18} color="var(--primary)" />
                                <h3>Autorizzazioni</h3>
                            </div>
                            <div className="field-box">
                                <label className="text-label">Ruoli con permessi Giveaway</label>
                                <DiscordSelector 
                                    type="role" 
                                    multiple={true} 
                                    options={roles} 
                                    value={config.managerRoles || []} 
                                    onChange={val => setConfig({...config, managerRoles: val})} 
                                />
                                <p className="field-help">I ruoli selezionati potranno usare i comandi di gestione giveaway su Discord.</p>
                            </div>
                        </section>
                    </div>
                </div>
            )}
        </div>
      </div>

      <style jsx>{`
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: rgba(255,255,255,0.02); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }
            
            .tab-navigation { display: flex; gap: 8px; margin-bottom: 32px; padding: 6px; background: #070912; border-radius: 14px; border: 1px solid var(--border); width: fit-content; }
            .tab-link { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border: none; background: transparent; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; border-radius: 10px; cursor: pointer; transition: 0.2s; }
            .tab-link:hover { color: white; background: rgba(255,255,255,0.03); }
            .tab-link.active { color: white; background: var(--bg-card); box-shadow: var(--shadow-sm); border: 1px solid var(--border); }

            .config-grid-v { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
            .fields-grid-v { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
            .align-center { display: flex; align-items: center; gap: 10px; }
            
            .create-gw-form { background: rgba(255,255,255,0.01); border-radius: 12px; }
            .btn-create-gw { width: 100%; padding: 14px; background: #ec4899; color: white; border: none; border-radius: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.2); }
            .btn-create-gw:hover { background: #db2777; transform: translateY(-2px); }
            .btn-create-gw:disabled { opacity: 0.5; cursor: not-allowed; }

            .active-gw-list { display: flex; flex-direction: column; gap: 12px; }
            .active-gw-item { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 12px; }
            .gw-info h4 { font-size: 1rem; font-weight: 700; color: white; margin-bottom: 4px; }
            .gw-meta { display: flex; gap: 12px; font-size: 0.75rem; color: var(--text-dim); }
            .gw-meta span { display: flex; align-items: center; gap: 4px; }
            .time-tag { color: #f1c40f; }

            .btn-icon-danger { width: 36px; height: 36px; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.2); background: rgba(239, 68, 68, 0.05); color: #ef4444; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
            .btn-icon-danger:hover { background: #ef4444; color: white; }

            .logs-table-wrapper { overflow-x: auto; }
            .logs-table { width: 100%; border-collapse: collapse; }
            .logs-table th { text-align: left; padding: 12px; font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; border-bottom: 1px solid var(--border); }
            .logs-table td { padding: 16px 12px; border-bottom: 1px solid rgba(255,255,255,0.02); font-size: 0.85rem; color: var(--text-muted); }
            .winners-pill { background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; width: fit-content; }

            .empty-state { padding: 40px; text-align: center; color: var(--text-dim); }

            @media (max-width: 1000px) { .config-grid-v { grid-template-columns: 1fr; } .fields-grid-v { grid-template-columns: 1fr; } }
        `}</style>
    </div>
  );
}
