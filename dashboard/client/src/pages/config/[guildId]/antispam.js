import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import DiscordSelector from '../../../components/DiscordSelector';
import api from '../../../utils/api';
import { 
    Save, ShieldAlert, Settings2, Power, 
    MessageSquare, Bell, Info, Shield, 
    Clock, Trash2, UserCog, Ghost
} from 'lucide-react';
import GuideSidebar from '../../../components/GuideSidebar';

export default function AntiSpamConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
      const fetchData = async () => {
        try {
          const [configRes, discordRes] = await Promise.all([
            api.request(`/config/${guildId}/antispam`),
            api.request(`/config/${guildId}/discord-data`)
          ]);

          if (configRes && configRes.data) {
            setConfig(configRes.data);
          }
          if (discordRes && discordRes.data) {
            setDiscordData(discordRes.data);
          }
          setLoading(false);
        } catch (error) {
          console.error("Error loading antispam config:", error);
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [guildId, mounted]);

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/antispam`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast('Configurazione antispam salvata!');
    } catch (error) {
        showToast('Errore durante il salvataggio', 'error');
    }
    finally { setSaving(false); }
  };

  if (loading || !config) return <><Skeleton height="500px" /></>;

  return (
    <>
      <div className="animate">
        
        {/* Module Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Shield size={24} />
              </div>
              <div className="header-text">
                <h1>Anti-Spam Intelligente</h1>
                <p>Proteggi il tuo server dai messaggi ripetuti e massivi in modo automatico.</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
           </div>
        </header>

        <div className="contents-grid">
            <div className="card status-section">
                <div className="section-info">
                    <div className={`status-box ${config.enabled ? 'on' : ''}`}>
                        <Power size={20} />
                    </div>
                    <div>
                        <h3>Stato Modulo</h3>
                        <p className="text-muted">Attiva o disattiva il sistema di rilevamento spam.</p>
                    </div>
                </div>
                <label className="toggle">
                    <input type="checkbox" checked={!!config.enabled} onChange={(e) => setConfig({...config, enabled: e.target.checked})} />
                    <span className="slider"></span>
                </label>
            </div>

            <div className="config-grid-v">
                <div className="main-col-v">
                    {/* Detection Logic */}
                    <section className="card section-card-v">
                        <div className="align-center" style={{ marginBottom: '24px' }}>
                            <Settings2 size={18} color="var(--primary)" />
                            <h3>Parametri di Rilevamento</h3>
                        </div>
                        <div className="fields-grid-v">
                            <div className="field-box">
                                <label className="text-label">Limite Messaggi (X)</label>
                                <div className="input-with-icon">
                                    <MessageSquare size={16} />
                                    <input 
                                        type="number" 
                                        className="input" 
                                        value={config.maxMessages} 
                                        onChange={e => setConfig({...config, maxMessages: parseInt(e.target.value)})} 
                                    />
                                </div>
                                <p className="field-help">Quanti messaggi un utente può inviare prima di essere bloccato.</p>
                            </div>
                            <div className="field-box">
                                <label className="text-label">Finestra Temporale (ms)</label>
                                <div className="input-with-icon">
                                    <Clock size={16} />
                                    <input 
                                        type="number" 
                                        className="input" 
                                        value={config.timeWindow} 
                                        onChange={e => setConfig({...config, timeWindow: parseInt(e.target.value)})} 
                                    />
                                </div>
                                <p className="field-help">Tempo in millisecondi (es. 5000 = 5 secondi) entro cui contare i messaggi.</p>
                            </div>
                        </div>
                    </section>

                    {/* Actions */}
                    <section className="card section-card-v" style={{ marginTop: '24px' }}>
                        <div className="align-center" style={{ marginBottom: '24px' }}>
                            <Trash2 size={18} color="var(--error)" />
                            <h3>Azioni e Punizioni</h3>
                        </div>
                        <div className="toggle-list-v">
                            <div className="toggle-row-v">
                                <div>
                                    <span>Elimina Messaggi Spam</span>
                                    <p className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>Rimuove automaticamente i messaggi rilevati come spam.</p>
                                </div>
                                <label className="toggle"><input type="checkbox" checked={!!config.deleteSpam} onChange={e => setConfig({...config, deleteSpam: e.target.checked})} /><span className="slider"></span></label>
                            </div>
                            <div className="toggle-row-v">
                                <div>
                                    <span>Avvisa l'Utente</span>
                                    <p className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>Invia un messaggio di avvertimento temporaneo.</p>
                                </div>
                                <label className="toggle"><input type="checkbox" checked={!!config.warnUser} onChange={e => setConfig({...config, warnUser: e.target.checked})} /><span className="slider"></span></label>
                            </div>
                        </div>
                        
                        {config.warnUser && (
                            <div className="field-box" style={{ marginTop: '20px' }}>
                                <label className="text-label">Messaggio di Warning</label>
                                <textarea 
                                    className="input" 
                                    style={{ minHeight: '80px', padding: '12px' }}
                                    value={config.warnMessage} 
                                    onChange={e => setConfig({...config, warnMessage: e.target.value})} 
                                />
                                <p className="field-help">Usa <code>{'{user}'}</code> per menzionare l'utente.</p>
                            </div>
                        )}
                    </section>
                </div>

                <aside className="side-v">
                    <section className="card section-card-v">
                        <div className="align-center" style={{ marginBottom: '16px' }}>
                            <Ghost size={16} color="var(--primary)" />
                            <h3>Eccezioni (Ignore)</h3>
                        </div>
                        <div className="fields-stack-v">
                            <div className="field-box">
                                <label className="text-label">Ruoli Esclusi</label>
                                <DiscordSelector 
                                    type="role" 
                                    multiple 
                                    options={discordData.roles} 
                                    value={config.ignoredRoles} 
                                    onChange={v => setConfig({...config, ignoredRoles: v})} 
                                />
                                <p className="field-help">Staff e bot sono esclusi di default.</p>
                            </div>
                            <div className="field-box" style={{ marginTop: '16px' }}>
                                <label className="text-label">Canali Esclusi</label>
                                <DiscordSelector 
                                    type="channel" 
                                    multiple 
                                    options={discordData.channels} 
                                    value={config.ignoredChannels} 
                                    onChange={v => setConfig({...config, ignoredChannels: v})} 
                                />
                            </div>
                        </div>
                    </section>

                    <div className="card info-warn-v" style={{ marginTop: '24px' }}>
                         <Info size={20} />
                         <p>Il sistema anti-spam è progettato per essere leggero. Le punizioni sono temporanee per non interrompere il flusso del server.</p>
                    </div>

                    <div style={{ marginTop: '24px' }}>
                        <GuideSidebar type="antispam" context={config} />
                    </div>
                </aside>
            </div>
        </div>

        <style jsx>{`
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: rgba(255,255,255,0.02); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: rgba(129, 140, 248, 0.1); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }

            .status-section { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; margin-bottom: 24px; }
            .section-info { display: flex; align-items: center; gap: 16px; }
            .status-box { width: 40px; height: 40px; background: #1e293b; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); border: 1px solid var(--border); transition: 0.3s; }
            .status-box.on { color: var(--primary); background: rgba(129, 140, 248, 0.1); border-color: rgba(129, 140, 248, 0.2); }

            .config-grid-v { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
            .fields-grid-v { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .toggle-list-v { display: flex; flex-direction: column; gap: 10px; }
            .toggle-row-v { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: rgba(255,255,255,0.02); border-radius: 10px; border: 1px solid var(--border); font-size: 0.85rem; font-weight: 600; }

            .input-with-icon { position: relative; display: flex; align-items: center; }
            .input-with-icon :global(svg) { position: absolute; left: 12px; color: var(--text-muted); pointer-events: none; }
            .input-with-icon .input { padding-left: 40px; }

            .info-warn-v { background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.1); display: flex; align-items: center; gap: 16px; padding: 16px 20px; color: var(--primary); font-size: 0.85rem; line-height: 1.4; }

            .fields-stack-v { display: flex; flex-direction: column; gap: 16px; }
            .align-center { display: flex; align-items: center; gap: 10px; }

            @media (max-width: 1000px) { .config-grid-v { grid-template-columns: 1fr; } }
        `}</style>
      </div>
    </>
  );
}
