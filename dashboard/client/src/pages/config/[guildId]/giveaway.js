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
    X,
    Calendar,
    ChevronRight,
    AlertCircle
} from 'lucide-react';
import DiscordSelector from '../../../components/DiscordSelector';
import EmbedPreview from '../../../components/EmbedPreview';
import CustomSelect from '../../../components/CustomSelect';

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
  const [scheduledGiveaways, setScheduledGiveaways] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('active');

  // Form State for new giveaway
  const [newGw, setNewGw] = useState({
    prize: '',
    duration: 60, // minutes
    winnerCount: 1,
    channelId: '',
    scheduledStart: '',
    customTitle: '🎁 NUOVO GIVEAWAY!',
    customDescription: 'Partecipa cliccando sul tasto qui sotto!\n\n🏆 **Premio:** {prize}\n⌛ **Termina:** {endtime}',
    color: '#5865F2',
    buttonLabel: 'Partecipa',
    buttonEmoji: '🎉',
    buttonStyle: 'PRIMARY'
  });

  const previewEmbed = {
    title: newGw.customTitle || `🎉 GIVEAWAY: ${newGw.prize || '...' }`,
    description: (newGw.customDescription || '')
        .replace(/{prize}/g, newGw.prize || '...')
        .replace(/{endtime}/g, `<t:${Math.floor((Date.now() + newGw.duration * 60000) / 1000)}:R>`),
    color: newGw.color,
    footer: 'Termina il',
    timestamp: true,
    fields: [
        { name: '👥 Partecipanti', value: '0', inline: true }
    ],
    button: { 
        label: newGw.buttonLabel, 
        emoji: newGw.buttonEmoji, 
        style: newGw.buttonStyle 
    }
  };

  useEffect(() => {
    if (guildId) {
      fetchData();
    }
  }, [guildId]);

  useEffect(() => {
    if (config) {
      window.dispatchEvent(new CustomEvent('update-guide-context', { detail: config }));
    }
  }, [config]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [configRes, discordRes, activeRes, scheduledRes, logsRes] = await Promise.all([
        api.request(`/config/${guildId}/giveaway`),
        api.request(`/config/${guildId}/discord-data`),
        api.request(`/config/${guildId}/giveaways/active`),
        api.request(`/config/${guildId}/giveaways/scheduled`),
        api.request(`/config/${guildId}/giveaways/logs`)
      ]);
      
      if (configRes) setConfig(configRes);
      if (discordRes) {
        setRoles(discordRes.roles || []);
        // Allow Text (0) and Announcement (5) channels
        setChannels(discordRes.channels?.filter(c => c.type === 0 || c.type === 5) || []);
      }
      if (activeRes) setActiveGiveaways(activeRes);
      if (scheduledRes) setScheduledGiveaways(scheduledRes);
      if (logsRes) setLogs(logsRes);
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

  const handleCreateGiveaway = async (gwData) => {
    const rawData = gwData || newGw;
    if (!rawData.prize || !rawData.channelId) return showToast('Compila tutti i campi!', 'error');
    
    // Convert to absolute timestamp to avoid timezone issues
    const dataToPost = {
        ...rawData,
        scheduledStart: rawData.scheduledStart ? new Date(rawData.scheduledStart).getTime() : ''
    };
    
    setCreating(true);
    try {
      const res = await api.request(`/config/${guildId}/giveaways/create`, {
        method: 'POST',
        body: JSON.stringify(dataToPost)
      });
      if (res.success) {
        showToast(dataToPost.scheduledStart ? 'Giveaway programmato con successo!' : 'Giveaway avviato con successo!');
        setNewGw({ 
          ...newGw, // Preserve channelId, customTitle, description, color, buttons
          prize: '', 
          duration: 60, 
          winnerCount: 1, 
          scheduledStart: ''
        });
        fetchData();
      }
    } catch (e) {
      showToast('Errore durante la creazione', 'error');
    }
    setCreating(false);
  };

  const handleDeleteGiveaway = async (id, isScheduled = false) => {
    const msg = isScheduled ? 'Sei sicuro di voler eliminare la programmazione?' : 'Sei sicuro di voler annullare questo giveaway? Il messaggio verrà rimosso.';
    if (!confirm(msg)) return;
    
    try {
      await api.request(`/config/${guildId}/giveaways/${id}`, { method: 'DELETE' });
      showToast('Operazione completata');
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
            <button onClick={() => setActiveTab('scheduled')} className={`tab-link ${activeTab === 'scheduled' ? 'active' : ''}`}>
                <Calendar size={16} /> <span>Programmati</span>
            </button>
            <button onClick={() => setActiveTab('logs')} className={`tab-link ${activeTab === 'logs' ? 'active' : ''}`}>
                <Clock size={16} /> <span>Cronologia</span>
            </button>
            <button onClick={() => setActiveTab('settings')} className={`tab-link ${activeTab === 'settings' ? 'active' : ''}`}>
                <Settings2 size={16} /> <span>Permessi</span>
            </button>
        </div>

        {/* Standardized Grid Layout with Sidebar */}
        <div className="config-grid-v">
            <div className="grid-main-v">
                <div className="tab-content">
                    {activeTab === 'active' && (
                        <div className="animate fade-in">
                            {/* Creation Form */}
                            <section className="card section-card-v" style={{ marginBottom: '24px' }}>
                                <div className="align-center" style={{ marginBottom: '20px' }}>
                                    <Plus size={18} color="#ec4899" />
                                    <h3>Nuovo Giveaway</h3>
                                </div>
                                
                                <div className="creation-split-v">
                                    <form className="create-gw-form">
                                        <div className="fields-grid-v" style={{ gridTemplateColumns: '1fr' }}>
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
                                            <div className="fields-row-v">
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

                                            <div className="field-divider">Personalizzazione Embed</div>

                                            <div className="field-box">
                                                <label className="text-label">Titolo Embed</label>
                                                <input 
                                                    type="text" 
                                                    className="input" 
                                                    value={newGw.customTitle}
                                                    onChange={e => setNewGw({...newGw, customTitle: e.target.value})}
                                                />
                                            </div>
                                            <div className="field-box">
                                                <label className="text-label">Descrizione Embed</label>
                                                <textarea 
                                                    className="input" 
                                                    rows="4"
                                                    value={newGw.customDescription}
                                                    onChange={e => setNewGw({...newGw, customDescription: e.target.value})}
                                                />
                                                <p className="field-help">Usa {'{prize}'} e {'{endtime}'} come variabili.</p>
                                            </div>
                                            <div className="field-box">
                                                <label className="text-label">Colore Embed</label>
                                                <div className="color-input-wrapper-v">
                                                    <input 
                                                        type="color" 
                                                        value={newGw.color}
                                                        onChange={e => setNewGw({...newGw, color: e.target.value})}
                                                    />
                                                    <input 
                                                        type="text" 
                                                        className="input"
                                                        value={newGw.color}
                                                        onChange={e => setNewGw({...newGw, color: e.target.value})}
                                                    />
                                                </div>
                                            </div>

                                            <div className="field-divider">Personalizzazione Bottone</div>

                                            <div className="fields-row-v">
                                                <div className="field-box">
                                                    <label className="text-label">Testo Bottone</label>
                                                    <input 
                                                        type="text" 
                                                        className="input"
                                                        value={newGw.buttonLabel}
                                                        onChange={e => setNewGw({...newGw, buttonLabel: e.target.value})}
                                                    />
                                                </div>
                                                <div className="field-box">
                                                    <label className="text-label">Emoji Bottone</label>
                                                    <input 
                                                        type="text" 
                                                        className="input"
                                                        value={newGw.buttonEmoji}
                                                        onChange={e => setNewGw({...newGw, buttonEmoji: e.target.value})}
                                                    />
                                                </div>
                                            </div>

                                            <div className="field-box">
                                                <label className="text-label">Stile Bottone</label>
                                                <CustomSelect 
                                                    options={[
                                                        { value: 'PRIMARY', label: 'Blu (Primary)' },
                                                        { value: 'SUCCESS', label: 'Verde (Success)' },
                                                        { value: 'DANGER', label: 'Rosso (Danger)' },
                                                        { value: 'SECONDARY', label: 'Grigio (Secondary)' }
                                                    ]}
                                                    value={newGw.buttonStyle}
                                                    onChange={val => setNewGw({...newGw, buttonStyle: val})}
                                                />
                                            </div>

                                            <div className="field-divider">Opzioni Avanzate</div>

                                            <div className="field-box">
                                                <label className="text-label">Avvio Programmato (Opzionale)</label>
                                                <input 
                                                    type="datetime-local" 
                                                    className="input" 
                                                    value={newGw.scheduledStart}
                                                    onChange={e => setNewGw({...newGw, scheduledStart: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="form-actions-v" style={{ marginTop: '32px' }}>
                                            <button 
                                                type="button" 
                                                className="btn-quick-start" 
                                                disabled={creating}
                                                onClick={(e) => {
                                                    const gw = { ...newGw, scheduledStart: '' };
                                                    handleCreateGiveaway(gw);
                                                }}
                                            >
                                                <Zap size={16} />
                                                Avvia Subito
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn-schedule" 
                                                disabled={creating}
                                                onClick={(e) => {
                                                    if (!newGw.scheduledStart) return showToast('Seleziona una data per programmare!', 'warning');
                                                    handleCreateGiveaway(newGw);
                                                }}
                                            >
                                                <Calendar size={16} />
                                                Programma
                                            </button>
                                        </div>
                                    </form>

                                    <div className="preview-container-v">
                                        <div className="preview-label">Anteprima Live</div>
                                        <div className="preview-sticky-v">
                                            <EmbedPreview data={previewEmbed} />
                                        </div>
                                    </div>
                                </div>
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
                    )}

                    {activeTab === 'scheduled' && (
                        <div className="animate fade-in">
                            <section className="card section-card-v">
                                <div className="align-center" style={{ marginBottom: '20px', justifyContent: 'space-between' }}>
                                    <div className="align-center">
                                        <Calendar size={18} color="#3498db" />
                                        <h3>Giveaway Programmati</h3>
                                    </div>
                                    <button className="btn-outline-sm" onClick={() => setActiveTab('active')}>
                                        <Plus size={14} /> Nuovo
                                    </button>
                                </div>
                                
                                {scheduledGiveaways.length === 0 ? (
                                    <div className="empty-state">
                                        <Clock size={32} opacity="0.2" />
                                        <p>Nessun giveaway programmato.</p>
                                    </div>
                                ) : (
                                    <div className="active-gw-list">
                                        {scheduledGiveaways.map(gw => (
                                            <div key={gw._id} className="active-gw-item scheduled">
                                                <div className="gw-info">
                                                    <h4>{gw.prize}</h4>
                                                    <div className="gw-meta">
                                                        <span><Calendar size={12}/> Avvio: <t className="time-tag-blue">{new Date(gw.startTime).toLocaleString()}</t></span>
                                                        <span><Clock size={12}/> Durata: {Math.round((new Date(gw.endTime) - new Date(gw.startTime)) / 60000)}m</span>
                                                    </div>
                                                </div>
                                                <div className="gw-actions">
                                                    <button onClick={() => handleDeleteGiveaway(gw._id, true)} className="btn-icon-danger" title="Elimina Programmazione">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    )}

                    {activeTab === 'logs' && (
                        <div className="animate fade-in">
                            <section className="card section-card-v">
                                <div className="align-center" style={{ marginBottom: '20px' }}>
                                    <History size={18} color="#94a3b8" />
                                    <h3>Ultimi Giveaway Conclusi</h3>
                                </div>
                                <div className="logs-table-wrapper">
                                    <table className="logs-table">
                                        <thead>
                                            <tr>
                                                <th>Premio</th>
                                                <th>Data</th>
                                                <th>Vincitori</th>
                                                <th>Iscritti</th>
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
                        <div className="animate fade-in">
                            <section className="card section-card-v">
                                <div className="align-center" style={{ marginBottom: '20px' }}>
                                    <Shield size={18} color="var(--primary)" />
                                    <h3>Autorizzazioni Staff</h3>
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
                    )}
                </div>
            </div>
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

            .config-grid-v { display: block; }
            .grid-main-v { display: flex; flex-direction: column; gap: 24px; }
            .fields-grid-v { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
            .align-center { display: flex; align-items: center; gap: 10px; }
            
            .create-gw-form { background: rgba(255,255,255,0.01); border-radius: 12px; }
            .creation-split-v { display: grid; grid-template-columns: 1fr 400px; gap: 40px; }
            .fields-row-v { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .field-divider { margin: 24px 0 16px; padding-bottom: 8px; border-bottom: 1px solid var(--border); font-size: 0.75rem; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 1px; }
            .color-input-wrapper-v { display: flex; gap: 12px; align-items: center; }
            .color-input-wrapper-v input[type="color"] { width: 42px; height: 42px; border: none; border-radius: 8px; background: none; cursor: pointer; }
            
            .preview-container-v { border-left: 1px solid var(--border); padding-left: 40px; }
            .preview-label { font-size: 0.7rem; font-weight: 800; color: var(--text-dim); text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1px; }
            .preview-sticky-v { position: sticky; top: 20px; }

            .form-actions-v { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 24px; }
            .btn-quick-start { padding: 14px; background: #ec4899; color: white; border: none; border-radius: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.2); }
            .btn-quick-start:hover { background: #db2777; transform: translateY(-2px); }
            .btn-schedule { padding: 14px; background: rgba(52, 152, 219, 0.1); color: #3498db; border: 1px solid rgba(52, 152, 219, 0.2); border-radius: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: 0.2s; }
            .btn-schedule:hover { background: rgba(52, 152, 219, 0.2); border-color: #3498db; }
            .btn-quick-start:disabled, .btn-schedule:disabled { opacity: 0.5; cursor: not-allowed; }

            .field-box.full-width { grid-column: span 1; }

            @media (max-width: 1200px) { .creation-split-v { grid-template-columns: 1fr; } .preview-container-v { border-left: none; padding-left: 0; padding-top: 40px; border-top: 1px solid var(--border); } }

            .active-gw-list { display: flex; flex-direction: column; gap: 12px; }
            .active-gw-item { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 12px; }
            .active-gw-item.scheduled { border-left: 4px solid #3498db; }
            .gw-info h4 { font-size: 1rem; font-weight: 700; color: white; margin-bottom: 4px; }
            .gw-meta { display: flex; gap: 12px; font-size: 0.75rem; color: var(--text-dim); }
            .gw-meta span { display: flex; align-items: center; gap: 4px; }
            .time-tag { color: #f1c40f; }
            .time-tag-blue { color: #3498db; font-weight: 700; }

            .btn-icon-danger { width: 36px; height: 36px; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.2); background: rgba(239, 68, 68, 0.05); color: #ef4444; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
            .btn-icon-danger:hover { background: #ef4444; color: white; }

            .logs-table-wrapper { overflow-x: auto; }
            .logs-table { width: 100%; border-collapse: collapse; }
            .logs-table th { text-align: left; padding: 12px; font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; border-bottom: 1px solid var(--border); }
            .logs-table td { padding: 16px 12px; border-bottom: 1px solid rgba(255,255,255,0.02); font-size: 0.85rem; color: var(--text-muted); }
            .winners-pill { background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; width: fit-content; }

            .tips-list { list-style: none; padding: 0; margin: 0; }
            .tips-list li { display: flex; gap: 12px; margin-bottom: 16px; color: var(--text-muted); font-size: 0.8rem; line-height: 1.4; }
            .tips-list li span { flex: 1; }
            .tips-list li :global(svg) { color: var(--primary); flex-shrink: 0; margin-top: 2px; }

            .empty-state { padding: 40px; text-align: center; color: var(--text-dim); }

            @media (max-width: 1000px) { .config-grid-v { grid-template-columns: 1fr; } .fields-grid-v { grid-template-columns: 1fr; } }
        `}</style>
    </div>
  );
}
