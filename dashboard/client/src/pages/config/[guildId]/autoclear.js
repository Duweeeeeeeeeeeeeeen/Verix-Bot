import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { 
    Save, 
    Trash2, 
    Plus, 
    Settings2, 
    Clock, 
    Shield, 
    Info, 
    Zap,
    Layout,
    RefreshCcw,
    Power,
    ChevronRight,
    MessageSquare,
    AlertCircle,
    X,
    Hash
} from 'lucide-react';
import DiscordSelector from '../../../components/DiscordSelector';

export default function AutoClearConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [channels, setChannels] = useState([]);
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
            api.request(`/config/${guildId}/autoclear`),
            api.request(`/config/${guildId}/discord-data`)
          ]);
          
          if (configRes) {
            setConfig(configRes);
          }
          if (discordRes) {
            setChannels(discordRes.channels || []);
          }
          setLoading(false);
        } catch (error) {
          console.error("Error loading autoclear config:", error);
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [guildId, mounted]);

  useEffect(() => {
    if (config) {
      window.dispatchEvent(new CustomEvent('update-guide-context', { detail: config }));
    }
  }, [config]);

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/autoclear`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast('Configurazione Auto-Clear salvata!');
    } catch (error) {
      showToast('Errore durante il salvataggio', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addSlot = () => {
    const newSlots = [...(config.slots || []), { id: `slot_${Date.now()}`, channelId: '', intervalMinutes: 60, amount: 100, enabled: true }];
    setConfig({ ...config, slots: newSlots });
  };

  const removeSlot = (index) => {
    const newSlots = config.slots.filter((_, i) => i !== index);
    setConfig({ ...config, slots: newSlots });
  };

  const updateSlot = (index, field, value) => {
    const newSlots = [...config.slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setConfig({ ...config, slots: newSlots });
  };

  if (loading || !config) return <><Skeleton height="500px" /></>;

  return (
    <div className="config-page-layout animate">
      <div className="config-main-col">
        {/* Module Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Trash2 size={24} />
              </div>
              <div className="header-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h1>Auto-Clear System</h1>
                  <label className="toggle-mini" title={config.enabled ? 'Modulo Attivo' : 'Modulo Disattivato'}>
                    <input type="checkbox" checked={!!config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                    <span className="slider-mini"></span>
                  </label>
                </div>
                <p>Mantieni puliti i tuoi canali eliminando messaggi periodicamente.</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} strokeWidth={2.5} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
           </div>
        </header>



        {/* Slots Grid */}
        <div className="section-header-row">
            <div className="align-center">
                <Layout size={20} color="var(--primary)" />
                <h2>Canali in Pulizia</h2>
            </div>
            <button onClick={addSlot} className="btn-add-premium">
                <Plus size={16} /> Aggiungi Canale
            </button>
        </div>

        <div className="slots-container">
            {config.slots?.length === 0 && (
                <div className="empty-state-card card">
                    <Info size={32} color="var(--text-muted)" />
                    <p>Nessun canale configurato per l'eliminazione automatica.</p>
                    <button onClick={addSlot} className="btn-outline">Crea il primo slot</button>
                </div>
            )}

            <div className="slots-grid">
                {config.slots?.map((slot, index) => (
                    <div key={index} className="slot-card card animate fade-in">
                        <div className="slot-header">
                             <div className="slot-title">
                                <Hash size={16} />
                                <span>Slot #{index + 1}</span>
                             </div>
                             <div className="slot-actions">
                                <label className="toggle-s">
                                    <input type="checkbox" checked={!!slot.enabled} onChange={e => updateSlot(index, 'enabled', e.target.checked)} />
                                    <span className="slider-s"></span>
                                </label>
                                <button className="btn-remove-premium" onClick={() => removeSlot(index)}><X size={14} /></button>
                             </div>
                        </div>

                        <div className="slot-body">
                            <div className="field-box">
                                <label className="text-label">Canale Target</label>
                                <DiscordSelector 
                                    type="channel" 
                                    options={channels.filter(c => c.type === 0 || c.type === 5)} 
                                    value={slot.channelId || ''} 
                                    onChange={val => updateSlot(index, 'channelId', val)} 
                                />
                            </div>

                            <div className="field-box" style={{ marginTop: '16px' }}>
                                <label className="text-label">Frequenza Pulizia (Minuti)</label>
                                <div className="input-with-icon">
                                    <Clock size={16} className="icon-p" />
                                    <input 
                                        type="number" 
                                        className="input-p" 
                                        value={slot.intervalMinutes || 60} 
                                        onChange={e => updateSlot(index, 'intervalMinutes', parseInt(e.target.value) || 1)} 
                                        min="1"
                                    />
                                </div>
                                <p className="field-help">Il bot eliminerà tutti i messaggi ogni {slot.intervalMinutes || 60} minuti.</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Manual Clear Section */}
        <section className="card animate fade-in" style={{ marginTop: '32px', borderLeft: '4px solid var(--primary)' }}>
            <div className="section-header">
                <Zap size={20} color="var(--primary)" />
                <h3>Pulizia Manuale Rapida</h3>
            </div>
            <p className="text-muted" style={{ marginBottom: '20px', fontSize: '0.9rem' }}>Elimina istantaneamente un numero specifico di messaggi in un canale.</p>
            
            <div className="manual-clear-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 120px 180px', gap: '16px', alignItems: 'flex-end' }}>
                <div className="field-box">
                    <label className="text-label">Canale</label>
                    <DiscordSelector 
                        type="channel" 
                        options={channels.filter(c => c.type === 0 || c.type === 5)} 
                        value={config.manualChannelId || ''} 
                        onChange={val => setConfig({...config, manualChannelId: val})} 
                    />
                </div>
                <div className="field-box">
                    <label className="text-label">Quantità (1-100)</label>
                    <input 
                        type="number" 
                        className="input-p" 
                        style={{ paddingLeft: '16px' }}
                        value={config.manualAmount || 50} 
                        onChange={e => setConfig({...config, manualAmount: parseInt(e.target.value) || 1})}
                        min="1"
                        max="100"
                    />
                </div>
                <button 
                    onClick={async () => {
                        if (!config.manualChannelId) return showToast('Seleziona un canale!', 'error');
                        try {
                            const res = await api.request(`/config/${guildId}/autoclear/manual`, {
                                method: 'POST',
                                body: JSON.stringify({ channelId: config.manualChannelId, amount: config.manualAmount || 50 })
                            });
                            if (res && res.count !== undefined) showToast(`Eliminati ${res.count} messaggi!`);
                        } catch (e) {
                            showToast('Errore durante la pulizia.', 'error');
                        }
                    }}
                    className="btn-primary" 
                    style={{ height: '45px', width: '100%', justifyContent: 'center', background: 'var(--primary)' }}
                >
                    <Trash2 size={16} /> Pulisci Ora
                </button>
            </div>
        </section>

        {/* Local Page Side-Content (Moved from legacy sidebar) */}
        <section className="card info-premium-v" style={{ marginTop: '24px' }}>
             <Shield size={20} color="var(--primary)" />
             <h4>Sicurezza</h4>
             <p className="text-muted" style={{ fontSize: '0.8rem' }}>Assicurati che il bot abbia i permessi di "Gestire Messaggi" nei canali selezionati.</p>
        </section>
      </div>

      <style jsx>{`
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-badge); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: var(--primary-glow); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; color: var(--text-main); }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }

            .status-hero { display: flex; justify-content: space-between; align-items: center; padding: 24px 32px; background: var(--bg-badge); margin-bottom: 40px; border-left: 4px solid var(--primary); border-radius: 16px; }
            .hero-info { display: flex; align-items: center; gap: 20px; }
            .status-orb { width: 44px; height: 44px; background: var(--bg-status-box); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); transition: 0.4s; border: 1px solid var(--border); }
            .status-orb.active { color: var(--primary); background: var(--primary-glow); box-shadow: 0 0 20px var(--primary-glow); }

            .section-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
            .section-header-row h2 { font-size: 1.25rem; font-weight: 800; }

            .btn-add-premium { background: var(--primary); color: var(--text-main); border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; box-shadow: var(--primary-glow); }
            .btn-add-premium:hover { transform: translateY(-2px); filter: brightness(1.1); }

            .slots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 24px; }
            .slot-card { padding: 0 !important; overflow: hidden; border-top: 3px solid var(--border); transition: 0.3s; }
            .slot-card:hover { border-top-color: var(--primary); transform: translateY(-4px); }
            
            .slot-header { padding: 16px 20px; background: var(--bg-badge); border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
            .slot-title { display: flex; align-items: center; gap: 10px; color: var(--text-muted); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
            .slot-actions { display: flex; align-items: center; gap: 12px; }

            .slot-body { padding: 24px; }

            .input-with-icon { position: relative; display: flex; align-items: center; }
            .icon-p { position: absolute; left: 14px; color: var(--primary); }
            .input-p { background: var(--bg-dark); border: 1px solid var(--border); color: var(--text-main); padding: 12px 16px 12px 42px; border-radius: 12px; width: 100%; transition: 0.2s; }
            .input-p:focus { border-color: var(--primary); outline: none; }

            .empty-state-card { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 40px; text-align: center; gap: 16px; border: 2px dashed var(--border); background: transparent; }
            
            .info-premium-v { padding: 20px; display: flex; flex-direction: column; gap: 10px; }
            .info-premium-v h4 { margin: 0; font-size: 0.9rem; }

            .toggle-s { position: relative; width: 36px; height: 20px; }
            .toggle-s input { opacity: 0; width: 0; height: 0; }
            .slider-s { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--bg-badge); transition: 0.3s; border-radius: 20px; border: 1px solid var(--border); }
            .slider-s:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: var(--text-main); transition: 0.3s; border-radius: 50%; }
            input:checked + .slider-s { background-color: var(--primary); }
            input:checked + .slider-s:before { transform: translateX(16px); }

            .align-center { display: flex; align-items: center; gap: 12px; }
        `}</style>
    </div>
  );
}
