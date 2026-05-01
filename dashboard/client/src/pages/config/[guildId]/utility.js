import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import DiscordSelector from '../../../components/DiscordSelector';
import api from '../../../utils/api';
import { 
    Save, Cpu, Settings2, Power, Info, Shield
} from 'lucide-react';

export default function UtilityConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
   const [quickClear, setQuickClear] = useState({ channelId: '', amount: 10 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
      const fetchData = async () => {
        try {
          const [configRes, discordRes] = await Promise.all([
            api.request(`/config/${guildId}/utility`),
            api.request(`/config/${guildId}/discord-data`)
          ]);

          if (configRes && configRes.data) {
            setConfig(configRes.data);
          } else if (configRes) {
            setConfig(configRes);
          }
          if (discordRes && discordRes.data) {
            setDiscordData(discordRes.data);
          } else if (discordRes) {
            setDiscordData(discordRes);
          }
          setLoading(false);
        } catch (error) {
          console.error("Error loading utility config:", error);
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
      await api.request(`/config/${guildId}/utility`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast('Configurazione salvata!');
    } catch (error) {
        showToast('Errore durante il salvataggio', 'error');
    }
    finally { setSaving(false); }
  };

  const handleQuickClear = async () => {
    if (!quickClear.channelId) return showToast('Seleziona un canale!', 'error');
    if (quickClear.amount < 1 || quickClear.amount > 100) return showToast('Quantità non valida!', 'error');

    if (!confirm(`Sei sicuro di voler eliminare ${quickClear.amount} messaggi? Questa azione è irreversibile.`)) return;

    setClearing(true);
    try {
      const res = await api.request(`/config/${guildId}/utility/clear`, {
        method: 'POST',
        body: JSON.stringify(quickClear)
      });
      showToast(res.message || 'Messaggi eliminati!');
    } catch (error) {
      showToast(error.message || 'Errore durante la pulizia', 'error');
    } finally {
      setClearing(false);
    }
  };

  if (loading || !config) return <><Skeleton height="500px" /></>;

  return (
    <>
      <div className="animate">
        
        {/* Module Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Cpu size={24} />
              </div>
              <div className="header-text">
                <h1>Utility Module</h1>
                <p>Gestisci i comandi di utilità del bot come /clear.</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
           </div>
        </header>

        <div className="animate fade-in contents-grid">
            {/* Status Card */}
            <div className="card status-section">
                <div className="section-info">
                    <div className={`status-box ${config.enabled ? 'on' : ''}`}>
                        <Power size={20} />
                    </div>
                    <div>
                        <h3>Stato Modulo</h3>
                        <p className="text-muted">Abilita o disabilita le funzioni di utilità (es. /clear).</p>
                    </div>
                </div>
                <label className="toggle">
                    <input type="checkbox" checked={!!config.enabled} onChange={(e) => setConfig({...config, enabled: e.target.checked})} />
                    <span className="slider"></span>
                </label>
            </div>

            {/* Roles Card */}
            <section className="card content-card">
                <div className="card-header-p">
                    <div className="align-center">
                        <Shield size={18} color="var(--primary)" />
                        <h3>Permessi Comandi</h3>
                    </div>
                </div>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px', marginBottom: '16px' }}>
                    Oltre agli amministratori, seleziona i ruoli che possono utilizzare i comandi di utilità.
                </p>
                <div className="field-box">
                    <label className="text-label">Ruoli Autorizzati</label>
                    <DiscordSelector 
                        type="role" 
                        multi={true}
                        options={discordData.roles} 
                        value={config.allowedRoles} 
                        onChange={v => setConfig({...config, allowedRoles: v})} 
                    />
                </div>
            </section>

            {/* Info Card */}
            <div className="card info-card-p">
                <Info size={20} color="var(--primary)" />
                <p>Il comando <code>/clear</code> permette di eliminare fino a 100 messaggi alla volta, filtrandoli opzionalmente per utente.</p>
            </div>

            {/* Quick Actions Card */}
            <section className="card content-card quick-actions">
                <div className="card-header-p">
                    <div className="align-center">
                        <Settings2 size={18} color="var(--warning)" />
                        <h3>Azioni Rapide</h3>
                    </div>
                </div>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px', marginBottom: '16px' }}>
                    Esegui operazioni di pulizia direttamente dal dashboard.
                </p>
                
                <div className="quick-actions-form">
                    <div className="field-box">
                        <label className="text-label">Canale</label>
                        <DiscordSelector 
                            type="channel" 
                            options={discordData.channels.filter(c => c.type === 0 || c.type === 5)} 
                            value={quickClear.channelId} 
                            onChange={v => setQuickClear({...quickClear, channelId: v})} 
                        />
                    </div>
                    <div className="field-box">
                        <label className="text-label">Numero Messaggi (1-100)</label>
                        <input 
                            type="number" 
                            className="input" 
                            min="1" 
                            max="100" 
                            value={quickClear.amount} 
                            onChange={e => setQuickClear({...quickClear, amount: e.target.value})} 
                        />
                    </div>
                </div>
                
                <button 
                    onClick={handleQuickClear} 
                    className="btn-primary" 
                    style={{ marginTop: '20px', background: 'var(--error)', width: '100%', justifyContent: 'center' }}
                    disabled={clearing}
                >
                    {clearing ? 'Pulizia in corso...' : 'Elimina Messaggi Ora'}
                </button>
            </section>
        </div>

        <style jsx>{`
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-badge); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: rgba(129, 140, 248, 0.1); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }
            
            .status-section { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; margin-bottom: 24px; }
            .section-info { display: flex; align-items: center; gap: 16px; }
            .status-box { width: 40px; height: 40px; background: var(--bg-status-box); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); border: 1px solid var(--border); transition: 0.3s; }
            .status-box.on { color: var(--primary); background: rgba(129, 140, 248, 0.1); border-color: rgba(129, 140, 248, 0.2); }
            .section-info h3 { font-size: 1rem; margin-bottom: 2px; }

            .content-card { padding: 24px; }
            .card-header-p { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
            .card-header-p h3 { font-size: 1.05rem; }
            .align-center { display: flex; align-items: center; gap: 10px; }

            .info-card-p { margin-top: 24px; background: rgba(129, 140, 248, 0.05); border: 1px solid rgba(129, 140, 248, 0.1); display: flex; align-items: center; gap: 16px; padding: 16px 24px; font-size: 0.9rem; color: var(--text-muted); }
            .info-card-p code { background: var(--bg-badge); padding: 2px 6px; border-radius: 4px; color: var(--primary); font-family: monospace; }
        `}</style>
      </div>
    </>
  );
}
