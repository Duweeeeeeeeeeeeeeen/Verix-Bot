import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import DiscordSelector from '../../../components/DiscordSelector';
import api from '../../../utils/api';
import { Save, ShieldCheck, Settings2, RefreshCcw, Power, Palette, MessageSquare, Bell, Info } from 'lucide-react';

export default function VerifyConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [], botHighestPosition: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingPanel, setSendingPanel] = useState(false);

  useEffect(() => {
    if (guildId) {
      const fetchData = async () => {
        try {
          const [configRes, discordRes] = await Promise.all([
            api.request(`/config/${guildId}`),
            api.request(`/config/${guildId}/discord-data`)
          ]);

          if (configRes && configRes.verify) {
            const vConfig = configRes.verify;
            // Ensure new fields have defaults in state
            if (vConfig.dmEnabled === undefined) vConfig.dmEnabled = true;
            if (vConfig.logEnabled === undefined) vConfig.logEnabled = true;
            if (!vConfig.dmEmbed) {
                vConfig.dmEmbed = {
                    title: '✅ Verifica Completata',
                    description: vConfig.dmMessage || 'Ti sei verificato correttamente!',
                    color: '#2ecc71'
                };
            }
            setConfig(vConfig);
          }
          if (discordRes) {
            console.log(`[DEBUG] Loaded ${discordRes.roles?.length || 0} roles and ${discordRes.channels?.length || 0} channels for verification.`);
            setDiscordData(discordRes);
          }
          setLoading(false);
        } catch (error) {
          console.error("Error loading verify config:", error);
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [guildId]);

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const getRoleError = (roleId) => {
    if (!roleId) return null;
    const role = discordData.roles.find(r => r.id === roleId);
    if (role && role.position >= discordData.botHighestPosition) {
        return "⚠️ Il ruolo è sopra quello del bot nella gerarchia.";
    }
    return null;
  };

  const hasHierarchyError = getRoleError(config?.roleId) || getRoleError(config?.removeRoleId);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/verify`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast('Configurazione Verifica salvata con successo!');
    } catch (error) {
       // Global toast handles errors
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Vuoi davvero ripristinare i valori predefiniti per il modulo Verifica?')) return;
    try {
        await api.request(`/config/${guildId}/reset/verify`, { 
            method: 'POST'
        });
        window.location.reload();
    } catch (error) {
        // Global toast handles errors
    }
  };

  const handleSendPanel = async () => {
    if (!config.channelId) {
        return showToast('Seleziona prima un canale di verifica!', 'error');
    }
    
    setSendingPanel(true);
    try {
        const res = await api.request(`/config/${guildId}/verify/send-panel`, {
            method: 'POST'
        });
        showToast(res.message || 'Pannello inviato correttamente!');
    } catch (error) {
        // Global toast handles errors
    } finally {
        setSendingPanel(false);
    }
  };

  if (loading && !config) return (
    <Layout guildId={guildId}>
      <div className="animate">
        <Skeleton width="400px" height="40px" style={{ marginBottom: '40px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
            <Skeleton height="400px" style={{ borderRadius: '20px' }} />
            <Skeleton height="400px" style={{ borderRadius: '20px' }} />
        </div>
      </div>
    </Layout>
  );

  if (!config) return (
    <Layout guildId={guildId}>
      <div className="card glass" style={{ padding: '60px', textAlign: 'center' }}>
        <ShieldCheck size={64} className="text-error" opacity={0.5} />
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '20px' }}>Errore di Caricamento</h2>
        <p className="text-description" style={{ marginTop: '10px' }}>Non è stato possibile sincronizzare il modulo verifica.</p>
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
                <ShieldCheck size={18} fill="currentColor" />
                <span className="text-label" style={{ marginBottom: 0 }}>Sicurezza & Accessi</span>
            </div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-1.5px' }}>
              Sistema Verifica
            </h1>
            <p className="text-description" style={{ fontSize: '1.1rem' }}>Gestisci l'accesso degli utenti al server tramite pulsante interattivo.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleReset} className="btn-danger">
                <RefreshCcw size={18} /> Reset
            </button>
            <button onClick={handleSendPanel} className="btn-outline" disabled={sendingPanel || !config.channelId} style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                <MessageSquare size={18} className={sendingPanel ? 'spin' : ''} /> {sendingPanel ? 'Invio...' : 'Invia Pannello'}
            </button>
            <button onClick={handleSave} className="btn-primary" disabled={saving || hasHierarchyError}>
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
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Abilita o disabilita il sistema di verifica globale.</span>
                </div>
            </div>
            <label className="toggle">
                <input type="checkbox" checked={config.enabled} onChange={(e) => setConfig({...config, enabled: e.target.checked})} />
                <span className="slider"></span>
            </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px', marginBottom: '40px' }}>
          <section className="card glass" style={{ padding: '30px' }}>
            <div className="align-center" style={{ marginBottom: '28px' }}>
                <Settings2 size={22} color="var(--primary)" />
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Configurazione Tecnica</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="input-group">
                <label className="text-label">Ruolo da Assegnare</label>
                <DiscordSelector
                  type="role"
                  options={discordData.roles}
                  value={config.roleId}
                  onChange={val => setConfig({...config, roleId: val})}
                  placeholder="Seleziona un ruolo..."
                  error={getRoleError(config.roleId)}
                />
              </div>
              <div className="input-group">
                <label className="text-label">Ruolo da Rimuovere (Opzionale)</label>
                <DiscordSelector
                  type="role"
                  options={discordData.roles}
                  value={config.removeRoleId}
                  onChange={val => setConfig({...config, removeRoleId: val})}
                  placeholder="Nessuno"
                  error={getRoleError(config.removeRoleId)}
                />
              </div>
              <div className="input-group">
                <label className="text-label">Canale di Verifica</label>
                <DiscordSelector
                  type="channel"
                  options={discordData.channels}
                  value={config.channelId}
                  onChange={val => setConfig({...config, channelId: val})}
                  placeholder="Seleziona un canale..."
                />
              </div>
              <div className="input-group">
                <label className="text-label">Canale Log</label>
                <DiscordSelector
                  type="channel"
                  options={discordData.channels}
                  value={config.logChannelId}
                  onChange={val => setConfig({...config, logChannelId: val})}
                  placeholder="Nessuno"
                />
              </div>
            </div>
          </section>

          <section className="card glass" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div className="align-center">
                    <Bell size={22} color="var(--primary)" />
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Notifiche & Log</h3>
                </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div>
                        <span style={{ fontWeight: '700', display: 'block' }}>Abilita DM</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Invia un messaggio privato all'utente dopo la verifica.</span>
                    </div>
                    <label className="toggle">
                        <input type="checkbox" checked={config.dmEnabled} onChange={(e) => setConfig({...config, dmEnabled: e.target.checked})} />
                        <span className="slider"></span>
                    </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div>
                        <span style={{ fontWeight: '700', display: 'block' }}>Abilita Log Admin</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Invia un log nel canale dedicato quando qualcuno si verifica. (Opzionale)</span>
                    </div>
                    <label className="toggle">
                        <input type="checkbox" checked={config.logEnabled} onChange={(e) => setConfig({...config, logEnabled: e.target.checked})} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
          </section>
        </div>

        {config.dmEnabled && (
        <section className="card glass animate fade-in" style={{ padding: '30px', marginBottom: '40px', border: '1px solid var(--primary-glow)' }}>
          <div className="align-center" style={{ marginBottom: '28px' }}>
            <MessageSquare size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Personalizzazione DM (Embed)</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="input-group">
                   <label className="text-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Titolo DM</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>Variabili: {"{user}, {guild}"}</span>
                   </label>
                   <input type="text" className="input" value={config.dmEmbed?.title || ''} onChange={(e) => setConfig({...config, dmEmbed: {...config.dmEmbed, title: e.target.value}})} />
                </div>
                <div className="input-group">
                   <label className="text-label">Colore Embed DM</label>
                   <div style={{ display: 'flex', gap: '12px' }}>
                        <input type="color" className="input" style={{ width: '60px', height: '52px', padding: '6px' }} value={config.dmEmbed?.color || '#2ecc71'} onChange={(e) => setConfig({...config, dmEmbed: {...config.dmEmbed, color: e.target.value}})} />
                        <input type="text" className="input" value={config.dmEmbed?.color || '#2ecc71'} onChange={(e) => setConfig({...config, dmEmbed: {...config.dmEmbed, color: e.target.value}})} placeholder="#HEX" />
                   </div>
                </div>
             </div>
             <div className="input-group">
                <label className="text-label">Contenuto Messaggio (Descrizione)</label>
                <textarea 
                    className="input" 
                    rows="7" 
                    style={{ resize: 'none' }}
                    value={config.dmEmbed?.description || ''} 
                    onChange={(e) => setConfig({...config, dmEmbed: {...config.dmEmbed, description: e.target.value}})} 
                    placeholder="Benvenuto! Ti sei verificato con successo..." 
                />
             </div>
          </div>
        </section>
        )}

        <section className="card glass" style={{ padding: '30px' }}>
          <div className="align-center" style={{ marginBottom: '28px' }}>
            <Palette size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Personalizzazione Embed</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="input-group">
                   <label className="text-label">Titolo</label>
                   <input type="text" className="input" value={config.embed.title} onChange={(e) => setConfig({...config, embed: {...config.embed, title: e.target.value}})} />
                </div>
                <div className="input-group">
                   <label className="text-label">Colore Tematico</label>
                   <div style={{ display: 'flex', gap: '12px' }}>
                        <input type="color" className="input" style={{ width: '60px', height: '52px', padding: '6px' }} value={config.embed.color} onChange={(e) => setConfig({...config, embed: {...config.embed, color: e.target.value}})} />
                        <input type="text" className="input" value={config.embed.color} onChange={(e) => setConfig({...config, embed: {...config.embed, color: e.target.value}})} placeholder="#HEX" />
                   </div>
                </div>
             </div>
             <div className="input-group">
                <label className="text-label">Descrizione dell'Embed</label>
                <textarea 
                    className="input" 
                    rows="7" 
                    style={{ resize: 'none' }}
                    value={config.embed.description} 
                    onChange={(e) => setConfig({...config, embed: {...config.embed, description: e.target.value}})} 
                    placeholder="Benvenuti! Cliccate qui per accedere..." 
                />
             </div>
          </div>
        </section>

        <div className="card" style={{ marginTop: '40px', background: 'rgba(var(--primary-rgb), 0.05)', border: '1px solid var(--primary-glow)', display: 'flex', gap: '15px', alignItems: 'center', padding: '24px' }}>
            <Info size={24} color="var(--primary)" />
            <div>
                <p style={{ fontWeight: '800', color: 'white' }}>Importante</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Assicurati che il ruolo del Bot sia <b>sopra</b> il ruolo che desideri assegnare nella gerarchia di Discord.
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
            .select.error {
                border-color: var(--error);
                background: rgba(var(--error-rgb), 0.05);
            }
            .error-text {
                color: var(--error);
                font-size: 0.75rem;
                margin-top: 6px;
                display: block;
                font-weight: 600;
            }
            .align-center { display: flex; align-items: center; gap: 12px; }
            .spin { animation: spin 1s linear infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </Layout>
  );
}
