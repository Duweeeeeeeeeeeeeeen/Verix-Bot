import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import api from '../../../utils/api';
import { 
    Save, Camera, Clock, Settings2, RefreshCcw, Power, Palette, 
    Bell, Trophy, Zap, Info, Calendar, Layout as LayoutIcon, ChevronRight,
    Shield, Target, Image
} from 'lucide-react';
import GuideSidebar from '../../../components/GuideSidebar';
import DiscordSelector from '../../../components/DiscordSelector';
import EmbedMessageManager from '../../../components/EmbedMessageManager';

export default function PhotoContestConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');

   const [roles, setRoles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
      Promise.all([
        api.request(`/config/${guildId}`),
        api.request(`/config/${guildId}/discord-data`)
      ]).then(([configRes, discordRes]) => {
        let moduleConfig = configRes?.photoContest || configRes || {};
        
        // --- SUPER AGGRESSIVE FALLBACK ---
        if (!moduleConfig.embedSettings) moduleConfig.embedSettings = {};
        
        const defaultTitle = '🖼️ Galleria d\'Arte: Esposizione Fotografica';
        const defaultDesc = 'La città è alla ricerca di scorci unici. Cattura un momento memorabile e depositalo in questa galleria per partecipare al concorso cittadino.';
        
        if (!moduleConfig.embedSettings.title || moduleConfig.embedSettings.title.trim() === '') {
            moduleConfig.embedSettings.title = defaultTitle;
        }
        if (!moduleConfig.embedSettings.description || moduleConfig.embedSettings.description.trim() === '') {
            moduleConfig.embedSettings.description = defaultDesc;
        }
        if (!moduleConfig.embedSettings.color) {
            moduleConfig.embedSettings.color = '#F39C12';
        }
        
        if (!moduleConfig.themesList || moduleConfig.themesList.length === 0) {
            moduleConfig.themesList = ['Natura', 'Architettura', 'Tramonti', 'Cibo', 'Minimalismo', 'Cyberpunk', 'Ritratti', 'Animali'];
        }
        // ---------------------------------

        setConfig(moduleConfig);
        const dData = discordRes || {};
        setRoles(dData.roles || []);
        setChannels(dData.channels || []);
        setLoading(false);
        
        console.log("[DEBUG] PhotoContest Config Loaded:", moduleConfig);
      }).catch(err => {
        console.error("Error loading photocontest data:", err);
        showToast("Errore di caricamento dati. Verifica la console.", "error");
        setLoading(false);
      });
    }
  }, [guildId, mounted]);

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Ensure interval is at least 1 to satisfy backend validation
      const updatedConfig = {
        ...config,
        interval: Math.max(1, config.interval || 1)
      };

      await api.request(`/config/${guildId}/photocontest`, {
        method: 'POST',
        body: JSON.stringify(updatedConfig)
      });
      
      setConfig(updatedConfig);
      showToast('Configurazione salvata!');
    } catch (error) {
      console.error("Save error:", error);
      const errorMsg = error.response?.data?.error || error.message || 'Errore durante il salvataggio';
      showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Vuoi davvero ripristinare?')) return;
    try {
        await api.request(`/config/${guildId}/reset/photocontest`, { method: 'POST' });
        window.location.reload();
    } catch (error) {}
  };

  const handleForceStart = async () => {
    setStarting(true);
    try {
        const res = await api.request(`/config/${guildId}/photocontest/force-start`, { method: 'POST' });
        showToast(res.message || 'Contest avviato!');
    } catch (error) {
        showToast(error.message || 'Errore durante l\'avvio', 'error');
    } finally { setStarting(false); }
  };

  const handleForceEnd = async () => {
    if(!confirm("Vuoi terminare il contest attivo?")) return;
    setEnding(true);
    try {
        const res = await api.request(`/config/${guildId}/photocontest/force-end`, { method: 'POST' });
        showToast(res.message || 'Contest terminato!');
    } catch (error) {
        showToast(error.message || 'Errore durante il termine', 'error');
    } finally { setEnding(false); }
  };

  if (!mounted || loading || !config) return <Layout guildId={guildId}><Skeleton height="500px" /></Layout>;

  return (
    <Layout guildId={guildId}>
      <div className="animate">
        
        {/* Module Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Camera size={24} />
              </div>
              <div className="header-text">
                <h1>Photo Contest</h1>
                <p>Crea engagement nel server con sfide fotografiche automatizzate.</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleForceEnd} className="btn-outline" style={{ color: 'var(--error)' }} disabled={ending}>
                <Clock size={16} /> {ending ? 'Terminando...' : 'Termina Contest'}
              </button>
              <button onClick={handleForceStart} className="btn-outline" style={{ color: 'var(--success)' }} disabled={starting}>
                <Zap size={16} /> {starting ? 'Avviando...' : 'Avvia Ora'}
              </button>
              <button onClick={handleReset} className="btn-outline">
                <RefreshCcw size={16} /> Reset
              </button>
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
           </div>
        </header>

        {/* Minimal Tab System */}
        <div className="tab-navigation">
            <button onClick={() => setActiveTab('settings')} className={`tab-link ${activeTab === 'settings' ? 'active' : ''}`}>
                <Settings2 size={16} />
                <span>Configurazione</span>
            </button>
            <button onClick={() => setActiveTab('themes')} className={`tab-link ${activeTab === 'themes' ? 'active' : ''}`}>
                <Image size={16} />
                <span>Temi & Rotazione</span>
            </button>
            <button onClick={() => setActiveTab('design')} className={`tab-link ${activeTab === 'design' ? 'active' : ''}`}>
                <Palette size={16} />
                <span>Style Embed</span>
            </button>
            <button onClick={() => setActiveTab('messages')} className={`tab-link ${activeTab === 'messages' ? 'active' : ''}`}>
                <RefreshCcw size={16} />
                <span>Messaggi</span>
            </button>
        </div>

        <div className="tab-panel animate">
            
            {activeTab === 'settings' && (
                <div className="config-grid-p">
                    <div className="grid-main-p">
                        <section className="card status-card-p" style={{ marginBottom: '24px' }}>
                            <div className="status-info-p">
                                <div className={`status-box-p ${config.enabled ? 'on' : ''}`}>
                                    <Power size={20} />
                                </div>
                                <div>
                                    <h3>Stato Modulo</h3>
                                    <p className="text-muted">Abilita o disabilita il sistema photocontest.</p>
                                </div>
                            </div>
                            <label className="toggle">
                                <input type="checkbox" checked={!!config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                                <span className="slider"></span>
                            </label>
                        </section>

                        <section className="card section-card-p">
                            <h3 className="align-center"><Target size={18} color="var(--primary)" /> Destinazioni Core</h3>
                            <div className="fields-grid-p">
                                <div className="field-box">
                                    <label className="text-label">Canale Contest</label>
                                    <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.channelId || ''} onChange={val => setConfig({...config, channelId: val})} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">Hall of Fame</label>
                                    <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.hallOfFameChannelId || ''} onChange={val => setConfig({...config, hallOfFameChannelId: val})} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">Ruolo Vincitore</label>
                                    <DiscordSelector type="role" options={roles} value={config.prizeRoleId || ''} onChange={val => setConfig({...config, prizeRoleId: val})} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">Intervallo (Ore)</label>
                                    <input type="number" className="input" value={config.interval || 1} onChange={(e) => setConfig({...config, interval: parseInt(e.target.value) || 1})} />
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="grid-side-p">
                        <section className="card section-card-p">
                            <h3 className="align-center"><Shield size={18} color="var(--primary)" /> Staff Permission</h3>
                            <div className="field-box" style={{ marginTop: '16px' }}>
                                <label className="text-label">Gestione Contest</label>
                                <DiscordSelector type="role" multiple={true} options={roles} value={config.staffRoleIds || []} onChange={val => setConfig({...config, staffRoleIds: val})} />
                            </div>
                        </section>
                        <div className="card info-box-p" style={{ marginTop: '20px' }}>
                            <Bell size={18} color="var(--primary)" />
                            <div className="toggle-row-p">
                                <span>Log Eventi Staff</span>
                                <label className="toggle">
                                    <input type="checkbox" checked={!!config.enableNotifications} onChange={(e) => setConfig({...config, enableNotifications: e.target.checked})} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </aside>

                    <div style={{ marginTop: '24px' }}>
                        <GuideSidebar type="photocontest" context={config} />
                    </div>
                </div>
            )}

            {activeTab === 'themes' && (
                <div className="animate fade-in">
                    <section className="card status-card-p" style={{ marginBottom: '24px' }}>
                         <div className="status-info-p">
                            <div className={`status-box-p ${config.automaticThemes ? 'on' : ''}`}>
                                <Zap size={20} />
                            </div>
                            <div>
                                <h3>Rotazione Automatica</h3>
                                <p className="text-muted">Il bot sceglierà un tema casuale ad ogni nuovo evento.</p>
                            </div>
                        </div>
                        <label className="toggle">
                            <input type="checkbox" checked={!!config.automaticThemes} onChange={e => setConfig({...config, automaticThemes: e.target.checked})} />
                            <span className="slider"></span>
                        </label>
                    </section>

                    <section className="card section-card-p">
                        <h3 className="align-center"><ListIcon size={18} color="var(--primary)" /> Lista Argomenti</h3>
                        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '16px' }}>Inserisci un tema per riga. Verranno estratti casualmente.</p>
                        <textarea 
                            className="input" 
                            rows="10" 
                            value={config.themesList?.join('\n') || ''}
                            onChange={(e) => setConfig({...config, themesList: e.target.value.split('\n').filter(t => t.trim())})}
                            placeholder="Es: Tramonti\nAuto Sportive\nStreet Photography..."
                            style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                        />
                    </section>
                </div>
            )}

            {activeTab === 'design' && (
                <section className="card section-card-p animate fade-in">
                    <h3 className="align-center" style={{ marginBottom: '24px' }}><Palette size={20} color="var(--primary)" /> Visual Design</h3>
                    <div className="design-grid-p">
                        <div className="fields-stack-p">
                            <div className="field-box">
                                <label className="text-label">Titolo Annuncio</label>
                                <input type="text" className="input" value={config.embedSettings?.title || ''} onChange={(e) => setConfig({...config, embedSettings: {...config.embedSettings, title: e.target.value}})} />
                            </div>
                            <div className="field-box">
                                <label className="text-label">Colore Tematico</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input type="color" className="input" style={{ width: '50px', height: '40px', padding: '4px' }} value={config.embedSettings?.color || '#000000'} onChange={(e) => setConfig({...config, embedSettings: {...config.embedSettings, color: e.target.value}})} />
                                    <input type="text" className="input" value={config.embedSettings?.color || ''} onChange={(e) => setConfig({...config, embedSettings: {...config.embedSettings, color: e.target.value}})} />
                                </div>
                            </div>
                        </div>
                        <div className="field-box">
                            <label className="text-label">Corpo del Messaggio (Regolamento)</label>
                            <textarea className="input" rows="8" value={config.embedSettings?.description || ''} onChange={(e) => setConfig({...config, embedSettings: {...config.embedSettings, description: e.target.value}})} style={{ resize: 'none' }} />
                        </div>
                    </div>
                </section>
            )}

            {activeTab === 'messages' && (
                <div className="animate fade-in">
                    <EmbedMessageManager 
                        guildId={guildId}
                        module="photocontest"
                        slugs={[
                            { key: 'entry_not_found', label: 'Voce non trovata', description: 'Inviato quando una foto non è più presente nel database durante il voto.', variables: [] },
                            { key: 'self_vote_error', label: 'Errore Autovoto', description: 'Inviato quando un utente tenta di votare la propria foto.', variables: [] }
                        ]}
                    />
                </div>
            )}
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

            .config-grid-p { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
            .grid-main-p { display: flex; flex-direction: column; gap: 24px; }
            .status-card-p { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; }
            .status-info-p { display: flex; align-items: center; gap: 16px; }
            .status-box-p { width: 40px; height: 40px; background: #1e293b; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); border: 1px solid var(--border); transition: 0.3s; }
            .status-box-p.on { color: var(--primary); background: rgba(129, 140, 248, 0.1); border-color: rgba(129, 140, 248, 0.2); }
            
            .fields-grid-p { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 16px; }
            .info-box-p { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
            .toggle-row-p { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: 600; }

            .design-grid-p { display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px; margin-top: 20px; }
            .fields-stack-p { display: flex; flex-direction: column; gap: 20px; }

            .align-center { display: flex; align-items: center; gap: 10px; }
            @media (max-width: 1000px) { .config-grid-p { grid-template-columns: 1fr; } .design-grid-p { grid-template-columns: 1fr; } }
        `}</style>
      </div>
    </Layout>
  );
}

function ListIcon({ size, color }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
}
