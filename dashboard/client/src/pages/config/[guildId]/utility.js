import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import { DiscordSelector } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { 
    Save, Cpu, Settings2, Power, Info, Shield,
    Trash2, MessageSquare, Zap, Terminal, Layout,
    CheckCircle2, AlertTriangle, ArrowRight, Sparkles,
    ShieldAlert, Hammer, Eraser, Command, ListChecks,
    Activity, Layers, MousePointer2
} from 'lucide-react';
import { useT } from '../../../contexts/LanguageContext';
import Head from 'next/head';

export default function UtilityConfig() {
  const { t } = useT();
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
        window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
        try {
          const [configRes, discordRes] = await Promise.all([
            api.request(`/config/${guildId}/utility`),
            api.request(`/config/${guildId}/discord-data`)
          ]);

          if (configRes) {
            setConfig(configRes.data || configRes);
          }
          if (discordRes) {
            setDiscordData(discordRes.data || discordRes);
          }
          setLoading(false);
        } catch (error) {
          console.error("Error loading utility config:", error);
          setLoading(false);
        } finally {
            window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
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
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/utility`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast("Protocollo Utility sincronizzato!");
    } catch (error) {
        showToast("Errore durante il salvataggio.", 'error');
    }
    finally { 
        setSaving(false); 
        window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleQuickClear = async () => {
    if (!quickClear.channelId) return showToast("Seleziona un canale target!", 'error');
    if (quickClear.amount < 1 || quickClear.amount > 100) return showToast("Quantità non valida (1-100)!", 'error');

    if (!confirm(`Sei sicuro di voler eliminare ${quickClear.amount} messaggi dal canale selezionato?`)) return;

    setClearing(true);
    try {
      const res = await api.request(`/config/${guildId}/utility/clear`, {
        method: 'POST',
        body: JSON.stringify(quickClear)
      });
      showToast(res.message || "Canale purificato con successo!");
    } catch (error) {
      showToast(error.message || "Errore durante la pulizia.", 'error');
    } finally {
      setClearing(false);
    }
  };

  if (loading || !config) return <Skeleton height="600px" />;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>Utility Studio Pro | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #475569 0%, #0f172a 100%)' }}>
                    <Command size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>Utility Studio Pro</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? 'MODULO OPERATIVO' : 'MODULO STANDBY'}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <button 
                  className={`pc-status-toggle-v2 ${config.enabled ? 'active' : ''}`}
                  onClick={() => setConfig({...config, enabled: !config.enabled})}
                >
                  <Power size={18} />
                  <span>{config.enabled ? 'Attivo' : 'Spento'}</span>
                </button>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving} style={{ background: '#1e293b' }}>
                    <Save size={18} />
                    <span>{saving ? 'Sincronizzazione...' : 'Salva Studio'}</span>
                </button>
            </div>
        </header>

        <div className="pc-content-v2">
            <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '40px' }}>
                <div className="v-stack" style={{ gap: '32px' }}>
                    <section className="pc-card-v2 animate slide-up">
                        <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                            <div className="header-icon" style={{ background: '#f1f5f9', color: '#1e293b' }}><ShieldAlert size={20} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>Management Protocol</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Definisci la gerarchia dello staff per le utility.</p>
                            </div>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-group-v2">
                                <label>Ruoli Staff Accreditati</label>
                                <DiscordSelector 
                                    type="role" 
                                    multiple={true}
                                    options={discordData.roles} 
                                    value={config.allowedRoles || []} 
                                    onChange={v => setConfig({...config, allowedRoles: v})} 
                                />
                                <div style={{ marginTop: '20px', background: '#f8fafc', padding: '20px', borderRadius: '18px', border: '1.5px solid #e2e8f0', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <Info size={20} color="#6366f1" />
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 700, lineHeight: 1.5 }}>I membri con questi ruoli potranno eseguire /clear, /embed e accedere ai tool amministrativi dello Studio.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                            <div className="header-icon" style={{ background: '#fef2f2', color: '#ef4444' }}><Eraser size={20} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>Quick Purge Studio</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Esegui operazioni di pulizia massiva istantaneamente.</p>
                            </div>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                <div className="pc-input-group-v2">
                                    <label>Canale Target</label>
                                    <DiscordSelector 
                                        type="channel" 
                                        options={discordData.channels} 
                                        value={quickClear.channelId} 
                                        onChange={v => setQuickClear({...quickClear, channelId: v})} 
                                    />
                                </div>
                                <div className="pc-input-group-v2">
                                    <label>Messaggi da Purificare (Max 100)</label>
                                    <div className="pc-input-wrapper-v2" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '18px', display: 'flex', alignItems: 'center' }}>
                                        <Layers size={18} style={{ marginLeft: '20px', color: '#94a3b8' }} />
                                        <input 
                                            type="number" 
                                            style={{ width: '100%', border: 'none', background: 'transparent', padding: '20px', fontWeight: 950, fontSize: '1.1rem', color: '#1e293b' }}
                                            min="1" 
                                            max="100" 
                                            value={quickClear.amount} 
                                            onChange={e => setQuickClear({...quickClear, amount: parseInt(e.target.value)})} 
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleQuickClear} 
                                className="pc-btn-danger-studio-v2" 
                                style={{ marginTop: '40px', width: '100%', padding: '24px', borderRadius: '24px', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: 'white', border: 'none', fontWeight: 950, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', boxShadow: '0 10px 30px rgba(239, 68, 68, 0.25)', transition: '0.3s' }}
                                disabled={clearing}
                            >
                                <Zap size={22} />
                                <span>{clearing ? 'Purificazione in Corso...' : 'Lancia Pulizia Istantanea'}</span>
                            </button>
                        </div>
                    </section>
                </div>

                <div className="v-stack" style={{ gap: '32px' }}>
                    <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                            <div className="header-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}><ListChecks size={20} /></div>
                            <h3 style={{ margin: 0 }}>Protocollo Operativo</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="v-stack" style={{ gap: '24px' }}>
                                {[
                                    { icon: <Clock size={18} />, text: 'Il comando purge è limitato a messaggi inviati negli ultimi 14 giorni per limitazioni API.' },
                                    { icon: <Shield size={18} />, text: 'Assicurati che Verix abbia i permessi "Gestire Messaggi" nel canale di destinazione.' },
                                    { icon: <Activity size={18} />, text: 'La pulizia tramite Studio è irreversibile. I dati vengono rimossi istantaneamente.' },
                                    { icon: <AlertTriangle size={18} color="#f59e0b" />, text: 'Usa con cautela: l\'operazione viene registrata nel registro di audit dello staff.' }
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', fontSize: '0.95rem', fontWeight: 700, color: '#475569', lineHeight: 1.6, background: '#f8fafc', padding: '16px', borderRadius: '18px', border: '1.5px solid #e2e8f0' }}>
                                        <div style={{ marginTop: '2px', color: '#6366f1' }}>{item.icon}</div>
                                        <span>{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <div className="pc-info-banner-v2 animate slide-up" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '32px', padding: '40px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', zIndex: 2 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <Sparkles size={20} style={{ color: '#fbbf24' }} />
                                <span style={{ fontWeight: 950, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Pro Utility Tip</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, opacity: 0.9, lineHeight: 1.7 }}>Sapevi che puoi creare Embed professionali direttamente dallo Studio per annunci istantanei?</p>
                        </div>
                        <div style={{ position: 'absolute', right: '-30px', bottom: '-30px', opacity: 0.05 }}><Terminal size={160} /></div>
                    </div>
                </div>
            </div>
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 40px; max-width: 1700px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: white; padding: 32px; border-radius: 32px; box-shadow: var(--shadow-premium); border: 1px solid var(--border-light); }
            .header-info { display: flex; align-items: center; gap: 24px; }
            .pc-icon-box { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 12px 24px rgba(30, 41, 59, 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Outfit', sans-serif; font-size: 2.3rem; font-weight: 950; margin: 0; color: #1e293b; letter-spacing: -1.5px; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 950; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px; }
            .pc-status-tag-v2.on { background: #ecfdf5; color: #10b981; }
            .pc-status-tag-v2.off { background: #fef2f2; color: #ef4444; }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: white; border: none; padding: 14px 28px; border-radius: 18px; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.3s; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(99, 102, 241, 0.3); }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: #f8fafc; color: #64748b; border: 1.5px solid #e2e8f0; padding: 12px 28px; border-radius: 18px; font-weight: 850; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }

            /* Card V2 */
            .pc-card-v2 { background: white; border: 1px solid var(--border-light); border-radius: 32px; padding: 40px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 20px; }
            .header-icon { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
            .card-header-v2 h3 { margin: 0; font-family: 'Outfit'; font-size: 1.5rem; font-weight: 950; color: #1e293b; }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 10px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 950; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px; }

            .pc-btn-danger-studio-v2:hover:not(:disabled) { transform: translateY(-4px); box-shadow: 0 15px 40px rgba(239, 68, 68, 0.35); }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2 { background: #ffffff !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
