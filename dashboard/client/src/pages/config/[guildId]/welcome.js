import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Skeleton from '../../../components/Skeleton';
import DiscordSelector from '../../../components/DiscordSelector';
import api from '../../../utils/api';
import { Save, UserPlus, UserMinus, Settings2, RefreshCcw, Power, Palette, MessageSquare, Info } from 'lucide-react';

export default function WelcomeConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [], botHighestPosition: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (guildId) {
      const fetchData = async () => {
        try {
          const [configRes, discordRes] = await Promise.all([
            api.request(`/config/${guildId}`),
            api.request(`/config/${guildId}/discord-data`)
          ]);

          if (configRes && configRes.welcome) {
            setConfig(configRes.welcome);
          }
          if (discordRes) {
            setDiscordData(discordRes);
          }
          setLoading(false);
        } catch (error) {
          console.error("Error loading welcome config:", error);
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [guildId]);

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/welcome`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast('Configurazione Welcome salvata con successo!');
    } catch (error) {
       // Global toast handles errors
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Vuoi davvero ripristinare i valori predefiniti per il modulo Welcome?')) return;
    try {
        await api.request(`/config/${guildId}/reset/welcome`, { 
            method: 'POST'
        });
        window.location.reload();
    } catch (error) {
    }
  };

  const updateMessageConfig = (type, field, value) => {
    setConfig({
      ...config,
      [type]: {
        ...config[type],
        [field]: value
      }
    });
  };

  if (loading && !config) return (
    <Layout guildId={guildId}>
      <div className="animate">
        <Skeleton width="400px" height="40px" style={{ marginBottom: '40px' }} />
        <Skeleton height="600px" style={{ borderRadius: '20px' }} />
      </div>
    </Layout>
  );

  if (!config) return (
    <Layout guildId={guildId}>
      <div className="card glass" style={{ padding: '60px', textAlign: 'center' }}>
        <UserPlus size={64} className="text-error" opacity={0.5} />
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '20px' }}>Errore di Caricamento</h2>
        <p className="text-description" style={{ marginTop: '10px' }}>Non è stato possibile caricare il modulo.</p>
        <button onClick={() => window.location.reload()} className="btn-primary" style={{ marginTop: '30px' }}>Riprova</button>
      </div>
    </Layout>
  );

  return (
    <Layout guildId={guildId}>
      <div className="animate">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <div className="align-center" style={{ color: 'var(--primary)', marginBottom: '8px' }}>
                <UserPlus size={18} fill="currentColor" />
                <span className="text-label" style={{ marginBottom: 0 }}>Gestione Utenti</span>
            </div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-1.5px' }}>
              Welcome & Leave
            </h1>
            <p className="text-description" style={{ fontSize: '1.1rem' }}>Accogli i nuovi utenti e tieni traccia di chi lascia il server.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleReset} className="btn-danger">
                <RefreshCcw size={18} /> Reset
            </button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={18} className={saving ? 'spin' : ''} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </header>

        <div className="card glass-heavy status-card" style={{ marginBottom: '40px' }}>
            <div className="align-center" style={{ gap: '15px' }}>
                <div className={`status-icon ${config.enabled ? 'active' : ''}`} style={{ display: 'flex' }}>
                    <Power size={22} />
                </div>
                <div>
                    <span style={{ fontWeight: '800', fontSize: '1rem', display: 'block' }}>Modulo Attivo</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Abilita o disabilita l'intero sistema di messaggi join/leave.</span>
                </div>
            </div>
            <label className="toggle">
                <input type="checkbox" checked={config.enabled} onChange={(e) => setConfig({...config, enabled: e.target.checked})} />
                <span className="slider"></span>
            </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          {/* Welcome Section */}
          <section className={`card glass transition-all ${!config.welcome.enabled ? 'opacity-50' : ''}`} style={{ padding: '30px', borderTop: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div className="align-center">
                <UserPlus size={24} color="var(--primary)" />
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Benvenuto</h3>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={config.welcome.enabled} onChange={(e) => updateMessageConfig('welcome', 'enabled', e.target.checked)} />
                <span className="slider"></span>
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="input-group">
                <label className="text-label">Canale Invia Messaggio</label>
                <DiscordSelector
                  type="channel"
                  options={discordData.channels}
                  value={config.welcome.channelId}
                  onChange={val => updateMessageConfig('welcome', 'channelId', val)}
                  placeholder="Seleziona canale..."
                />
              </div>

              <div className="input-group">
                <label className="text-label">Stile Embed</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button 
                    className={`btn-outline ${config.welcome.style === 'SIMPLE' ? 'active' : ''}`}
                    onClick={() => updateMessageConfig('welcome', 'style', 'SIMPLE')}
                  >
                    Simple
                  </button>
                  <button 
                    className={`btn-outline ${config.welcome.style === 'ARTICULATED' ? 'active' : ''}`}
                    onClick={() => updateMessageConfig('welcome', 'style', 'ARTICULATED')}
                  >
                    Articulated
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="text-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Messaggio / Descrizione</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>{"{user}, {user_mention}, {guild}, {member_count}"}</span>
                </label>
                <textarea 
                  className="input" 
                  rows="4" 
                  value={config.welcome.message} 
                  onChange={(e) => updateMessageConfig('welcome', 'message', e.target.value)}
                  placeholder="Scrivi il messaggio..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                  <label className="text-label">Colore</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="color" className="input" style={{ width: '50px', padding: '4px' }} value={config.welcome.color} onChange={(e) => updateMessageConfig('welcome', 'color', e.target.value)} />
                    <input type="text" className="input" value={config.welcome.color} onChange={(e) => updateMessageConfig('welcome', 'color', e.target.value)} />
                  </div>
                </div>
                <div className="input-group">
                  <label className="text-label">Immagine Profilo</label>
                  <div className="align-center" style={{ height: '52px' }}>
                    <label className="toggle">
                      <input type="checkbox" checked={config.welcome.useImage} onChange={(e) => updateMessageConfig('welcome', 'useImage', e.target.checked)} />
                      <span className="slider"></span>
                    </label>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Mostra Avatar</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Leave Section */}
          <section className={`card glass transition-all ${!config.leave.enabled ? 'opacity-50' : ''}`} style={{ padding: '30px', borderTop: '4px solid var(--error)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div className="align-center">
                <UserMinus size={24} color="var(--error)" />
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Addio</h3>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={config.leave.enabled} onChange={(e) => updateMessageConfig('leave', 'enabled', e.target.checked)} />
                <span className="slider"></span>
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="input-group">
                <label className="text-label">Canale Invia Messaggio</label>
                <DiscordSelector
                  type="channel"
                  options={discordData.channels}
                  value={config.leave.channelId}
                  onChange={val => updateMessageConfig('leave', 'channelId', val)}
                  placeholder="Seleziona canale..."
                />
              </div>

              <div className="input-group">
                <label className="text-label">Stile Embed</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button 
                    className={`btn-outline ${config.leave.style === 'SIMPLE' ? 'active' : ''}`}
                    onClick={() => updateMessageConfig('leave', 'style', 'SIMPLE')}
                  >
                    Simple
                  </button>
                  <button 
                    className={`btn-outline ${config.leave.style === 'ARTICULATED' ? 'active' : ''}`}
                    onClick={() => updateMessageConfig('leave', 'style', 'ARTICULATED')}
                  >
                    Articulated
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="text-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Messaggio / Descrizione</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--error)' }}>{"{user}, {user_tag}, {guild}, {member_count}"}</span>
                </label>
                <textarea 
                  className="input" 
                  rows="4" 
                  value={config.leave.message} 
                  onChange={(e) => updateMessageConfig('leave', 'message', e.target.value)}
                  placeholder="Scrivi il messaggio..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                  <label className="text-label">Colore</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="color" className="input" style={{ width: '50px', padding: '4px' }} value={config.leave.color} onChange={(e) => updateMessageConfig('leave', 'color', e.target.value)} />
                    <input type="text" className="input" value={config.leave.color} onChange={(e) => updateMessageConfig('leave', 'color', e.target.value)} />
                  </div>
                </div>
                <div className="input-group">
                  <label className="text-label">Immagine Profilo</label>
                  <div className="align-center" style={{ height: '52px' }}>
                    <label className="toggle">
                      <input type="checkbox" checked={config.leave.useImage} onChange={(e) => updateMessageConfig('leave', 'useImage', e.target.checked)} />
                      <span className="slider"></span>
                    </label>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Mostra Avatar</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="card" style={{ marginTop: '40px', background: 'rgba(var(--primary-rgb), 0.05)', border: '1px solid var(--primary-glow)', display: 'flex', gap: '15px', alignItems: 'center', padding: '24px' }}>
            <Info size={24} color="var(--primary)" />
            <div>
                <p style={{ fontWeight: '800', color: 'white' }}>Variabili Disponibili</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <code className="code-tag">{"{user}"}</code>
                    <code className="code-tag">{"{user_mention}"}</code>
                    <code className="code-tag">{"{user_tag}"}</code>
                    <code className="code-tag">{"{guild}"}</code>
                    <code className="code-tag">{"{member_count}"}</code>
                </div>
            </div>
        </div>

        <style jsx>{`
            .status-card {
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                padding: 24px;
                border: 1px solid var(--border);
            }
            .status-icon {
                padding: 12px;
                background: rgba(255,255,255,0.05);
                border-radius: 14px;
                color: var(--text-dim);
            }
            .status-icon.active {
                background: rgba(var(--primary-rgb), 0.1);
                color: var(--primary);
                box-shadow: 0 0 15px rgba(var(--primary-rgb), 0.2);
            }
            .btn-outline.active {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
            }
            .code-tag {
                background: rgba(255,255,255,0.1);
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 0.8rem;
                font-family: monospace;
            }
            .align-center { display: flex; align-items: center; gap: 12px; }
            .spin { animation: spin 1s linear infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </Layout>
  );
}
