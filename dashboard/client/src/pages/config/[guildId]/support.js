import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import { DiscordSelector } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { 
  Save, Settings2, Users, Palette, Power, Clock, ShieldCheck, BellRing, Mic2, Volume2, 
  Hash, RefreshCcw, Layout, MessageSquare, AlertCircle, ChevronRight, ArrowRight, 
  Info, Terminal, Activity, Award, Zap, Globe, Layers
} from 'lucide-react';
import CustomSelect from '../../../components/CustomSelect';
import { NotificationSettings } from '../../../components/LazyConfigComponents';
import { EmbedMessageManager } from '../../../components/LazyConfigComponents';
import { useT } from '../../../contexts/LanguageContext';
import Head from 'next/head';

export default function SupportConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [activeTab, setActiveTab] = useState('settings');
  const [config, setConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
      const fetchData = async () => {
        setLoading(true);
        window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
        try {
          const [suppData, discordRes] = await Promise.all([
            api.request(`/config/${guildId}/support`),
            api.request(`/config/${guildId}/discord-data`)
          ]);
          setConfig(suppData.data || suppData);
          setChannels(discordRes?.data?.channels || discordRes?.channels || []);
          setRoles(discordRes?.data?.roles || discordRes?.roles || []);
        } catch (err) {
          console.error("Support config load error:", err);
        } finally {
          setLoading(false);
          window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
        }
      };
      fetchData();
    }
  }, [guildId, mounted]);

  const setNested = (path, value) => {
    setConfig(prev => {
        const newConfig = { ...prev };
        const parts = path.split('.');
        let cur = newConfig;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!cur[parts[i]]) cur[parts[i]] = {};
            else cur[parts[i]] = { ...cur[parts[i]] };
            cur = cur[parts[i]];
        }
        cur[parts[parts.length - 1]] = value;
        return newConfig;
    });
  };

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/support`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast("Configurazione SOS salvata!");
    } catch (error) {
       showToast("Errore durante il salvataggio.", 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>Supporto Vocale SOS | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
                    <Mic2 size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>Supporto Vocale (SOS)</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? 'SISTEMA ASSISTENZA ATTIVO' : 'SISTEMA DISABILITATO'}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <button 
                  className={`pc-status-toggle-v2 ${config.enabled ? 'active' : ''}`}
                  onClick={() => setConfig({...config, enabled: !config.enabled})}
                >
                  <Power size={18} />
                  <span>{config.enabled ? 'Disattiva' : 'Attiva'}</span>
                </button>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? 'Salvataggio...' : 'Salva Modifiche'}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-container-v2" style={{ marginBottom: '40px' }}>
            <div className="pc-tabs-v2">
                <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                    <Settings2 size={16} /> <span>Configurazione Canale</span>
                </button>
                <button className={activeTab === 'design' ? 'active' : ''} onClick={() => setActiveTab('design')}>
                    <Palette size={16} /> <span>Design & Studio</span>
                </button>
            </div>
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'settings' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '32px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}><Volume2 size={18} /></div>
                                <h3 style={{ margin: 0 }}>Automazione SOS</h3>
                                <div style={{ marginLeft: 'auto' }}>
                                    <label className="pc-toggle-v2 mini">
                                        <input type="checkbox" checked={!config.voiceSettings?.paused} onChange={e => setNested('voiceSettings.paused', !e.target.checked)} />
                                        <span className="pc-slider-v2"></span>
                                    </label>
                                </div>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>Canale Trigger (Entrata)</label>
                                        <DiscordSelector type="channel" options={channels.filter(c => c.type === 2)} value={config.voiceSettings?.joinChannelId || ''} onChange={val => setNested('voiceSettings.joinChannelId', val)} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Categoria Destinazione</label>
                                        <DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.voiceSettings?.categoryId || ''} onChange={val => setNested('voiceSettings.categoryId', val)} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Canale Logs SOS</label>
                                        <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.logChannelId || ''} onChange={val => setConfig({...config, logChannelId: val})} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Capacità Massima Istanze</label>
                                        <div className="pc-input-wrapper-v2" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px' }}>
                                            <Layers size={16} style={{ marginLeft: '16px', color: '#94a3b8' }} />
                                            <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '14px 16px', fontWeight: 800, outline: 'none' }} min="1" max="15" value={config.voiceSettings?.maxConcurrent || 1} onChange={e => setNested('voiceSettings.maxConcurrent', parseInt(e.target.value))} />
                                        </div>
                                    </div>
                                    <div className="pc-input-group-v2" style={{ gridColumn: 'span 2' }}>
                                        <label>Naming Template Canale</label>
                                        <div className="pc-input-wrapper-v2" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px' }}>
                                            <Activity size={16} style={{ marginLeft: '16px', color: '#94a3b8' }} />
                                            <input type="text" style={{ width: '100%', border: 'none', background: 'transparent', padding: '14px 16px', fontWeight: 800, outline: 'none' }} value={config.voiceSettings?.channelNameTemplate || ''} onChange={e => setNested('voiceSettings.channelNameTemplate', e.target.value)} placeholder="es: 🆘 SOS - {user}" />
                                        </div>
                                        <p className="pc-hint-v2" style={{ marginTop: '12px' }}>Variabili: <code>{`{user}`}</code>, <code>{`{id}`}</code></p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: '#fef2f2', color: '#ef4444' }}><BellRing size={18} /></div>
                                <h3 style={{ margin: 0 }}>Logica di Gestione</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="v-stack" style={{ gap: '16px' }}>
                                    <div className="pc-interactive-row-v2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1.5px solid #e2e8f0' }}>
                                        <div className="v-stack">
                                            <strong style={{ fontWeight: 900, color: '#1e293b' }}>Auto-Cleanup Stanze</strong>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 650 }}>Elimina il canale quando l'ultimo partecipante esce.</span>
                                        </div>
                                        <label className="pc-toggle-v2">
                                            <input type="checkbox" checked={!!config.voiceSettings?.autoDelete} onChange={e => setNested('voiceSettings.autoDelete', e.target.checked)} />
                                            <span className="pc-slider-v2"></span>
                                        </label>
                                    </div>

                                    <div className="pc-interactive-row-v2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1.5px solid #e2e8f0' }}>
                                        <div className="v-stack">
                                            <strong style={{ fontWeight: 900, color: '#1e293b' }}>Notifica Ruoli Staff</strong>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 650 }}>Menziona il team di supporto alla creazione della stanza.</span>
                                        </div>
                                        <label className="pc-toggle-v2">
                                            <input type="checkbox" checked={!!config.voiceSettings?.pingStaffOnJoin} onChange={e => setNested('voiceSettings.pingStaffOnJoin', e.target.checked)} />
                                            <span className="pc-slider-v2"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: '#fdf4ff', color: '#d946ef' }}><ShieldCheck size={18} /></div>
                                <h3 style={{ margin: 0 }}>Team Operativo</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>Ruoli Supporto / Staff</label>
                                    <DiscordSelector type="role" multiple={true} options={roles} value={config.staffRoleIds || []} onChange={val => setConfig({...config, staffRoleIds: val})} />
                                </div>
                                <div className="pc-input-group-v2" style={{ marginTop: '24px' }}>
                                    <label>Ruolo Priorità VIP</label>
                                    <DiscordSelector type="role" options={roles} value={config.voiceSettings?.vipRoleId || ''} onChange={val => setNested('voiceSettings.vipRoleId', val)} />
                                    <p className="pc-hint-v2" style={{ marginTop: '12px' }}>Gli utenti VIP avranno priorità di risposta in caso di coda piena.</p>
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: '#f8fafc', color: '#475569' }}><Hash size={18} /></div>
                                <h3 style={{ margin: 0 }}>Analytics SOS</h3>
                            </div>
                            <div className="card-body-v2">
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ fontWeight: 750, color: '#64748b' }}>Interventi Totali</span>
                                    <strong style={{ fontWeight: 900, color: '#1e293b', fontSize: '1.2rem' }}>{config.voiceSettings?.sessionCounter || 0}</strong>
                                </div>
                                <button className="pc-btn-outline-v2" style={{ width: '100%', marginTop: '24px', justifyContent: 'center' }} onClick={() => setNested('voiceSettings.sessionCounter', 0)}>
                                    <RefreshCcw size={14} /> <span>Reset Statistiche</span>
                                </button>
                            </div>
                        </section>

                        <NotificationSettings 
                            guildId={guildId}
                            value={config.voiceSettings?.notifications}
                            onChange={val => setNested('voiceSettings.notifications', val)}
                            title="Notifiche Feedback"
                        />
                    </div>
                </div>
            )}

            {activeTab === 'design' && (
                <div className="v-stack animate slide-up">
                    <EmbedMessageManager 
                        guildId={guildId}
                        module="support"
                        slugs={[
                            { key: 'sessionStart', label: 'Benvenuto in SOS', description: 'Inviato all\'utente quando la stanza viene creata.', variables: ['user', 'guild', 'channel'], group: 'User UI', groupIcon: Zap },
                            { key: 'queueFull', label: 'Avviso Coda Piena', description: 'Inviato se il numero massimo di stanze è attivo.', variables: ['user', 'guild', 'position'], group: 'User UI', groupIcon: Users },
                            { key: 'paused', label: 'Sistema in Pausa', description: 'Inviato se un utente tenta l\'accesso durante una manutenzione.', variables: ['user', 'guild'], group: 'Status UI', groupIcon: Power },
                            { key: 'cooldown', label: 'Avviso Cooldown', description: 'Inviato se l\'utente abusa del sistema SOS.', variables: ['user', 'guild'], group: 'Status UI', groupIcon: Clock },
                            { key: 'staffLog', label: 'Log Apertura SOS', description: 'Menziona lo staff nel canale logs prescelto.', variables: ['user', 'voice_channel'], group: 'Staff UI', groupIcon: ShieldCheck },
                            { key: 'queue_log', label: 'Log Attesa Utente', description: 'Traccia gli utenti che entrano in coda.', variables: ['user', 'user_id', 'position', 'vip_text'], group: 'Staff UI', groupIcon: Terminal }
                        ]}
                    />
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 40px; max-width: 1600px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: white; padding: 32px; border-radius: 32px; box-shadow: var(--shadow-premium); border: 1px solid var(--border-light); }
            .header-info { display: flex; align-items: center; gap: 24px; }
            .pc-icon-box { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 12px 24px rgba(59, 130, 246, 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Outfit', sans-serif; font-size: 2.2rem; font-weight: 900; margin: 0; color: #1e293b; letter-spacing: -0.5px; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 900; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px; }
            .pc-status-tag-v2.on { background: #eff6ff; color: #2563eb; }
            .pc-status-tag-v2.off { background: #fef2f2; color: #ef4444; }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: #f8fafc; color: #64748b; border: 1.5px solid #e2e8f0; padding: 12px 24px; border-radius: 16px; font-weight: 800; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
            .pc-btn-primary { background: var(--primary); color: white; border: none; padding: 14px 28px; border-radius: 16px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 25px rgba(99, 102, 241, 0.3); }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 8px; background: #f1f5f9; padding: 6px; border-radius: 18px; width: fit-content; overflow-x: auto; max-width: 100%; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 10px; padding: 12px 24px; border: none; background: transparent; color: #64748b; font-weight: 800; font-size: 0.9rem; border-radius: 14px; cursor: pointer; transition: 0.2s; white-space: nowrap; }
            .pc-tabs-v2 button.active { background: white; color: var(--primary); box-shadow: 0 4px 15px rgba(0,0,0,0.05); }

            /* Card V2 */
            .pc-card-v2 { background: white; border: 1px solid var(--border-light); border-radius: 32px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
            .header-icon { width: 44px; height: 44px; background: #f5f3ff; color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
            .pc-input-group-v2 label { font-size: 0.7rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }

            /* Toggle V2 */
            .pc-toggle-v2 { position: relative; width: 44px; height: 22px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: #cbd5e1; transition: .4s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background: white; transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: var(--primary); }
            input:checked + .pc-slider-v2:before { transform: translateX(22px); }

            .pc-btn-outline-v2 { background: #f8fafc; color: #64748b; border: 1.5px solid #e2e8f0; padding: 12px 24px; border-radius: 16px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
            .pc-btn-outline-v2:hover { background: white; border-color: var(--primary); color: var(--primary); }

            .pc-hint-v2 { font-size: 0.8rem; color: #94a3b8; font-weight: 700; }
            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-interactive-row-v2 { background: #ffffff !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
