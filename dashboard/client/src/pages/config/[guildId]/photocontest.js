import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import api from '../../../utils/api';
import { Save, Camera, Clock, Settings2, RefreshCcw, Power, Palette, Bell, Trophy, Zap, Info, Calendar, Layout as LayoutIcon } from 'lucide-react';

export default function PhotoContestConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [roles, setRoles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [globalConfig, setGlobalConfig] = useState(null);

  useEffect(() => {
    if (guildId) {
      Promise.all([
        api.request(`/config/${guildId}`),
        api.request(`/config/${guildId}/global`),
        api.request(`/config/${guildId}/discord-data`)
      ]).then(([data, globalData, discordRes]) => {
        let moduleConfig = data?.photoContest || {};
        const globalConfigData = globalData?.data || globalData;

        // Role Inheritance: If local roles are empty, pre-fill from global admin roles
        if ((!moduleConfig.staffRoleIds || moduleConfig.staffRoleIds.length === 0) && globalConfigData.adminRoleIds?.length > 0) {
            moduleConfig.staffRoleIds = [...globalConfigData.adminRoleIds];
        }

        setConfig(moduleConfig);
        setGlobalConfig(globalConfigData);
        setRoles(discordRes?.roles || discordRes?.data?.roles || []);
        setChannels(discordRes?.channels || discordRes?.data?.channels || []);
        setLoading(false);
      }).catch(err => {
        console.error("Error loading photocontest data:", err);
        setLoading(false);
      });
    }
  }, [guildId]);

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/photocontest`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast('Configurazione Contest salvata con successo!');
    } catch (error) {
       // Global toast handles errors
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Vuoi davvero ripristinare i valori predefiniti per il Photo Contest? Tutti i temi verranno resettati.')) return;
    try {
        await api.request(`/config/${guildId}/reset/photocontest`, { 
            method: 'POST'
        });
        window.location.reload();
    } catch (error) {
        // Global toast handles errors
    }
  };

  if (loading && !config) return (
    <Layout guildId={guildId}>
      <div className="animate">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
             <Skeleton width="400px" height="40px" style={{ marginBottom: '12px' }} />
             <div style={{ display: 'flex', gap: '12px' }}>
                <Skeleton width="120px" height="45px" />
                <Skeleton width="180px" height="45px" />
             </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <Skeleton height="80px" style={{ borderRadius: '16px' }} />
            <Skeleton height="80px" style={{ borderRadius: '16px' }} />
            <Skeleton height="80px" style={{ borderRadius: '16px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', marginBottom: '30px' }}>
            <Skeleton height="300px" style={{ borderRadius: '20px' }} />
            <Skeleton height="300px" style={{ borderRadius: '20px' }} />
        </div>
        <Skeleton height="400px" style={{ borderRadius: '20px' }} />
      </div>
    </Layout>
  );
  
  if (!config) return (
    <Layout guildId={guildId}>
      <div className="card glass" style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ marginBottom: '20px' }}><Camera size={64} color="var(--error)" opacity={0.5} /></div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Errore di Caricamento</h2>
        <p className="text-description" style={{ marginTop: '10px' }}>Non è stato possibile sincronizzare il modulo contest con il database.</p>
        <button onClick={() => window.location.reload()} className="btn-primary" style={{ marginTop: '30px' }}>Riprova Sincronizzazione</button>
      </div>
    </Layout>
  );

  return (
    <Layout guildId={guildId}>
      <div className="animate">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <div className="align-center" style={{ color: 'var(--primary)', marginBottom: '8px' }}>
                <Camera size={18} fill="currentColor" />
                <span className="text-label" style={{ marginBottom: 0 }}>Community Events</span>
            </div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-1.5px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              Photo Contest <span style={{ fontSize: '0.8rem', background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '10px', verticalAlign: 'middle', fontWeight: '800', letterSpacing: '1px' }}>PRO</span>
            </h1>
            <p className="text-description" style={{ fontSize: '1.1rem' }}>Crea coinvolgimento nel server con contest fotografici automatizzati.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleReset} className="btn-danger">
                <RefreshCcw size={18} /> Reset Modulo
            </button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={18} className={saving ? 'spin' : ''} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </header>

        {/* Status & Options Rack */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '40px' }}>
            <div className="card glass-heavy status-card">
                <div className="align-center" style={{ gap: '15px' }}>
                    <div className={`status-icon ${config.enabled ? 'active' : ''}`} style={{ display: 'flex' }}>
                        <Power size={22} />
                    </div>
                    <div>
                        <span style={{ fontWeight: '800', fontSize: '1rem', display: 'block' }}>Modulo Attivo</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Abilita il sistema photocontest.</span>
                    </div>
                </div>
                <label className="toggle">
                    <input type="checkbox" checked={config.enabled} onChange={(e) => setConfig({...config, enabled: e.target.checked})} />
                    <span className="slider"></span>
                </label>
            </div>
            <div className="card glass-heavy status-card">
                <div className="align-center" style={{ gap: '15px' }}>
                    <div className={`status-icon ${config.automaticThemes ? 'active' : ''}`} style={{ color: '#F1C40F', display: 'flex' }}>
                        <Zap size={22} fill="currentColor" />
                    </div>
                    <div>
                        <span style={{ fontWeight: '800', fontSize: '1rem', display: 'block' }}>Rotazione Temi</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Cambia tema automaticamente.</span>
                    </div>
                </div>
                <label className="toggle">
                    <input type="checkbox" checked={config.automaticThemes} onChange={(e) => setConfig({...config, automaticThemes: e.target.checked})} />
                    <span className="slider"></span>
                </label>
            </div>
            <div className="card glass-heavy status-card">
                <div className="align-center" style={{ gap: '15px' }}>
                    <div className={`status-icon ${config.enableNotifications ? 'active' : ''}`} style={{ color: '#00FF7F', display: 'flex' }}>
                        <Bell size={22} fill="currentColor" />
                    </div>
                    <div>
                        <span style={{ fontWeight: '800', fontSize: '1rem', display: 'block' }}>Notifiche Voti</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Avvisa quando qualcuno vota.</span>
                    </div>
                </div>
                <label className="toggle">
                    <input type="checkbox" checked={config.enableNotifications} onChange={(e) => setConfig({...config, enableNotifications: e.target.checked})} />
                    <span className="slider"></span>
                </label>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px', marginBottom: '40px' }}>
          <section className="card glass" style={{ padding: '30px' }}>
            <div className="align-center" style={{ marginBottom: '28px' }}>
                <Settings2 size={22} color="var(--primary)" />
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Canali e Premi</h3>
                <HelpTooltip text="Imposta i canali di invio e il ruolo premio." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="input-group">
                <label className="text-label">Canale Contest <HelpTooltip text="Il canale dove gli utenti inviano le proprie foto." /></label>
                <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.channelId || ''} onChange={val => setConfig({...config, channelId: val})} />
              </div>
              <div className="input-group">
                <label className="text-label">Ruolo Premio <HelpTooltip text="Il ruolo assegnato temporaneamente al vincitore." /></label>
                <DiscordSelector type="role" options={roles} value={config.prizeRoleId || ''} onChange={val => setConfig({...config, prizeRoleId: val})} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="text-label">Canale Hall of Fame</label>
                <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.hallOfFameChannelId || ''} onChange={val => setConfig({...config, hallOfFameChannelId: val})} />
              </div>
            </div>
          </section>

          <section className="card glass" style={{ padding: '30px' }}>
            <div className="align-center" style={{ marginBottom: '28px' }}>
                <Shield size={22} color="var(--primary)" />
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Ruoli & Permessi</h3>
                <HelpTooltip text="Gestione dello staff del contest." />
            </div>
            <div className="input-group">
                <label className="text-label">Ruoli Staff Contest</label>
                <DiscordSelector 
                    type="role" 
                    multiple={true} 
                    options={roles} 
                    value={config.staffRoleIds || []} 
                    onChange={val => setConfig({...config, staffRoleIds: val})} 
                />
                <p className="text-description" style={{ fontSize: '0.8rem', marginTop: '8px' }}>
                    Eredita automaticamente i ruoli Amministratori dalle impostazioni globali se lasciato vuoto.
                </p>
            </div>
            <div className="input-group" style={{ marginTop: '20px' }}>
                <label className="text-label">Notifiche Staff</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label className="toggle">
                        <input type="checkbox" checked={config.enableNotifications} onChange={(e) => setConfig({...config, enableNotifications: e.target.checked})} />
                        <span className="slider"></span>
                    </label>
                    <span style={{ fontSize: '0.9rem' }}>Invia log eventi contest</span>
                </div>
            </div>
          </section>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px', marginBottom: '40px' }}>
          <section className="card glass" style={{ padding: '30px' }}>
            <div className="align-center" style={{ marginBottom: '28px' }}>
                <Clock size={22} color="var(--primary)" />
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Pianificazione</h3>
                <HelpTooltip text="Configura durata e intervallo del contest." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="input-group">
                <label className="text-label">Intervallo (Ore) <HelpTooltip text="Tempo tra un contest e il prossimo." /></label>
                <input type="number" className="input" value={config.interval} onChange={(e) => setConfig({...config, interval: parseInt(e.target.value)})} />
              </div>
              <div className="input-group">
                <label className="text-label">Durata (Ore) <HelpTooltip text="Tempo per invio e votazioni." /></label>
                <input type="number" className="input" value={config.duration} onChange={(e) => setConfig({...config, duration: parseInt(e.target.value)})} />
              </div>
            </div>
          </section>
        </div>

        {config.automaticThemes && (
            <section className="card glass" style={{ marginBottom: '40px', borderColor: 'rgba(241, 196, 15, 0.3)', padding: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <Zap size={22} color="#F1C40F" />
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Banca Dati Temi</h3>
                    <HelpTooltip text="Una lista di argomenti che il bot pescherà casualmente per ogni nuovo contest." />
                </div>
                <p className="text-description" style={{ marginBottom: '16px' }}>Inserisci un tema per riga (es: Paesaggi, Notte, Azione).</p>
                <textarea 
                    className="input" 
                    rows="5" 
                    value={config.themesList.join('\n')}
                    onChange={(e) => setConfig({...config, themesList: e.target.value.split('\n').filter(t => t.trim())})}
                    style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem', color: '#F1C40F', background: 'rgba(241, 196, 15, 0.05)' }}
                />
            </section>
        )}

        <section className="card glass" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <Palette size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Design dell'Evento</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="input-group">
                   <label className="text-label">Titolo dell'Embed</label>
                   <input type="text" className="input" value={config.embedSettings.title} onChange={(e) => setConfig({...config, embedSettings: {...config.embedSettings, title: e.target.value}})} />
                </div>
                <div className="input-group">
                   <label className="text-label">Colore Tematico</label>
                   <div style={{ display: 'flex', gap: '12px' }}>
                        <input type="color" className="input" style={{ width: '60px', height: '50px', padding: '6px' }} value={config.embedSettings.color} onChange={(e) => setConfig({...config, embedSettings: {...config.embedSettings, color: e.target.value}})} />
                        <input type="text" className="input" value={config.embedSettings.color} onChange={(e) => setConfig({...config, embedSettings: {...config.embedSettings, color: e.target.value}})} placeholder="#HEX" />
                   </div>
                </div>
             </div>
             <div className="input-group">
                <label className="text-label">Regolamento e Descrizione</label>
                <textarea className="input" rows="7" value={config.embedSettings.description} onChange={(e) => setConfig({...config, embedSettings: {...config.embedSettings, description: e.target.value}})} placeholder="Spiega agli utenti come partecipare..." style={{ resize: 'none' }} />
                <p className="text-description" style={{ marginTop: '10px' }}>Questo testo apparirà nell'annuncio di inizio contest.</p>
             </div>
          </div>
        </section>

        <div className="card" style={{ marginTop: '40px', background: 'rgba(var(--primary-rgb), 0.05)', border: '1px solid var(--primary-glow)', display: 'flex', gap: '15px', alignItems: 'center', padding: '24px' }}>
            <Info size={24} color="var(--primary)" />
            <div>
                <p style={{ fontWeight: '800', color: 'white' }}>Ottimizzazione Voti</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Il sistema utilizza reazioni Discord per le votazioni. Assicurati che il bot possa <b>Aggiungere Reazioni</b> nel canale selezionato.
                </p>
            </div>
        </div>

        <style jsx>{`
            .status-card {
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                padding: 24px;
                border: 1px solid var(--border);
                transition: var(--transition-normal);
            }
            .status-card:hover {
                border-color: var(--primary);
                background: rgba(var(--primary-rgb), 0.02);
            }
            .status-icon {
                padding: 12px;
                background: rgba(255,255,255,0.05);
                border-radius: 14px;
                color: var(--text-dim);
                transition: var(--transition-fast);
            }
            .status-icon.active {
                background: rgba(var(--primary-rgb), 0.1);
                color: var(--primary);
                box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.1);
            }
            .spin { animation: spin 1s linear infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </Layout>
  );
}
