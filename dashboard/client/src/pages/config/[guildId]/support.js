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
                                        <div className="pc-input-wrapper-v2" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-badge)', border: '1.5px solid var(--border)', borderRadius: '16px' }}>
                                            <Layers size={16} style={{ marginLeft: '16px', color: 'var(--text-dim)' }} />
                                            <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '14px 16px', fontWeight: 700, outline: 'none' }} min="1" max="15" value={config.voiceSettings?.maxConcurrent || 1} onChange={e => setNested('voiceSettings.maxConcurrent', parseInt(e.target.value))} />
                                        </div>
                                    </div>
                                    <div className="pc-input-group-v2" style={{ gridColumn: 'span 2' }}>
                                        <label>Naming Template Canale</label>
                                        <div className="pc-input-wrapper-v2" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-badge)', border: '1.5px solid var(--border)', borderRadius: '16px' }}>
                                            <Activity size={16} style={{ marginLeft: '16px', color: 'var(--text-dim)' }} />
                                            <input type="text" style={{ width: '100%', border: 'none', background: 'transparent', padding: '14px 16px', fontWeight: 700, outline: 'none' }} value={config.voiceSettings?.channelNameTemplate || ''} onChange={e => setNested('voiceSettings.channelNameTemplate', e.target.value)} placeholder="es: 🆘 SOS - {user}" />
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
                                    <div className="pc-interactive-row-v2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-badge)', padding: '24px', borderRadius: '24px', border: '1.5px solid var(--border)' }}>
                                        <div className="v-stack">
                                            <strong style={{ fontWeight: 700, color: 'var(--text-heading)' }}>Auto-Cleanup Stanze</strong>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 650 }}>Elimina il canale quando l'ultimo partecipante esce.</span>
                                        </div>
                                        <label className="pc-toggle-v2">
                                            <input type="checkbox" checked={!!config.voiceSettings?.autoDelete} onChange={e => setNested('voiceSettings.autoDelete', e.target.checked)} />
                                            <span className="pc-slider-v2"></span>
                                        </label>
                                    </div>

                                    <div className="pc-interactive-row-v2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-badge)', padding: '24px', borderRadius: '24px', border: '1.5px solid var(--border)' }}>
                                        <div className="v-stack">
                                            <strong style={{ fontWeight: 700, color: 'var(--text-heading)' }}>Notifica Ruoli Staff</strong>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 650 }}>Menziona il team di supporto alla creazione della stanza.</span>
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
                                <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--text-muted)' }}><Hash size={18} /></div>
                                <h3 style={{ margin: 0 }}>Analytics SOS</h3>
                            </div>
                            <div className="card-body-v2">
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--bg-badge)' }}>
                                    <span style={{ fontWeight: 750, color: 'var(--text-muted)' }}>Interventi Totali</span>
                                    <strong style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '1.2rem' }}>{config.voiceSettings?.sessionCounter || 0}</strong>
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
            .pc-premium-wrapper { padding: 32px; max-width: 1500px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 12px 24px rgba(59, 130, 246, 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Inter', sans-serif; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 700; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px; }
            .pc-status-tag-v2.on { background: var(--bg-badge); color: #2563eb; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: #ef4444; }
            .status-dot-v2 { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: var(--bg-badge); color: var(--text-muted); border: 1.5px solid var(--border); padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: rgba(37, 99, 235, 0.1); color: #2563eb; border-color: #2563eb; }
            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 6px; background: var(--bg-badge); padding: 5px; border-radius: 18px; width: fit-content; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; font-size: 0.9rem; border-radius: 14px; cursor: pointer; transition: 0.2s; }
            .pc-tabs-v2 button.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

            /* Card V2 */
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; background: var(--bg-badge); color: var(--primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; }

            /* Toggle V2 */
            .pc-toggle-v2 { position: relative; width: 44px; height: 22px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: var(--border); transition: .4s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background: #fff; transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: var(--primary); }
            input:checked + .pc-slider-v2:before { transform: translateX(22px); }

            .pc-btn-outline-v2 { background: var(--bg-badge); color: var(--text-muted); border: 1.5px solid var(--border); padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
            .pc-btn-outline-v2:hover { background: var(--bg-card); border-color: var(--primary); color: var(--primary); }

            .pc-hint-v2 { font-size: 0.8rem; color: var(--text-muted); font-weight: 700; }
            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-interactive-row-v2 { box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
