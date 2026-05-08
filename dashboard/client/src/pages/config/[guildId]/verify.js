import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import { DiscordSelector } from '../../../components/LazyConfigComponents';
import { EmbedMessageManager } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, ShieldCheck, Settings2, RefreshCcw, Power, Palette, MessageSquare, Bell, Info, 
    MousePointer2, Type, ShieldAlert, ChevronRight, Hash, Shield, Send, Zap, MessageCircle, 
    AlertCircle, ArrowRight, CheckCircle2, Lock, Globe
} from 'lucide-react';
import CustomSelect from '../../../components/CustomSelect';
import { mergeConfig } from '../../../utils/defaults';
import EmojiInput from '../../../components/EmojiInput';
import { NotificationSettings } from '../../../components/LazyConfigComponents';
import Head from 'next/head';

export default function VerifyConfig() {
  const router = useRouter();
  const { t } = useT();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [], botHighestPosition: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingPanel, setSendingPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = async () => {
    if (!guildId || guildId === 'undefined' || !mounted) return;
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [configRes, discordRes] = await Promise.all([
        api.request(`/config/${guildId}/verify`).catch(() => ({ data: {} })),
        api.request(`/config/${guildId}/discord-data`).catch(() => ({ roles: [], channels: [], botHighestPosition: 0 }))
      ]);

      const data = configRes.data || configRes || {};
      setConfig(mergeConfig(data, 'verify'));
      
      const dData = discordRes.data || discordRes || {};
      setDiscordData({
        roles: dData.roles || [],
        channels: dData.channels || [],
        botHighestPosition: dData.botHighestPosition || 0
      });
    } catch (error) {
      console.error("Verify config load error:", error);
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  useEffect(() => {
    loadData();
  }, [guildId, mounted]);

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const getRoleError = (roleId) => {
    if (!roleId) return null;
    const role = discordData.roles.find(r => r.id === roleId);
    if (role && role.position >= discordData.botHighestPosition) {
        return "Gerarchia insufficiente: sposta il ruolo di Verix sopra questo ruolo nelle impostazioni del server.";
    }
    return null;
  };

  const setNested = (path, value) => {
    setConfig(prev => {
        const keys = path.split('.');
        const newConfig = { ...prev };
        let current = newConfig;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            else current[keys[i]] = { ...current[keys[i]] };
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newConfig;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/verify`, { method: 'POST', body: JSON.stringify(config) });
      showToast("Configurazione verifica salvata!");
    } catch (error) {
      showToast("Errore durante il salvataggio.", 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleSendPanel = async () => {
    if (!config.channelId) return showToast("Seleziona un canale per il panel!", 'error');
    setSendingPanel(true);
    try {
        await handleSave();
        await api.request(`/config/${guildId}/verify/send-panel`, { method: 'POST' });
        showToast("Panel di verifica inviato con successo!");
    } catch (error) {
        showToast("Errore nell'invio del panel.", 'error');
    } finally {
        setSendingPanel(false);
    }
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>Sistema di Verifica | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    <ShieldCheck size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>Protocollo di Verifica</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? 'SISTEMA SICUREZZA ATTIVO' : 'SISTEMA DISABILITATO'}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <button 
                  className={`pc-status-toggle-v2 ${config.enabled ? 'active' : ''}`}
                  onClick={() => setConfig({...config, enabled: !config.enabled})}
                >
                  <Power size={18} />
                  <span>{config.enabled ? 'Spegni' : 'Attiva'}</span>
                </button>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? 'Salvataggio...' : 'Salva Modifiche'}</span>
                </button>
            </div>
        </header>

        {/* V2 Tabs */}
        <nav className="pc-tabs-container-v2" style={{ marginBottom: '40px' }}>
            <div className="pc-tabs-v2">
                <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                    <Settings2 size={16} /> <span>Configurazione Base</span>
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
                                <div className="header-icon" style={{ background: '#f0fdf4', color: '#10b981' }}><Shield size={18} /></div>
                                <h3 style={{ margin: 0 }}>Automazione Ruoli</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>Ruolo da Assegnare (Passato)</label>
                                        <DiscordSelector type="role" options={discordData.roles} value={config.roleId} onChange={v => setNested('roleId', v)} error={getRoleError(config.roleId)} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Canale Pubblicazione Panel</label>
                                        <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 0 || c.type === 5)} value={config.channelId} onChange={v => setNested('channelId', v)} />
                                    </div>
                                    <div className="pc-input-group-v2" style={{ gridColumn: 'span 2' }}>
                                        <label>Ruolo da Rimuovere (Opzionale)</label>
                                        <DiscordSelector type="role" options={discordData.roles} value={config.removeRoleId} onChange={v => setNested('removeRoleId', v)} placeholder="Nessun ruolo da rimuovere" />
                                        <p className="pc-hint-v2" style={{ marginTop: '12px' }}>Rimuovi ruoli come "Ospite" o "Non Verificato" al completamento del processo.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2 animate slide-up" style={{ background: '#fffbeb', border: '1.5px solid #fde68a', animationDelay: '0.1s' }}>
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: 'white', color: '#d97706' }}><ShieldAlert size={18} /></div>
                                <h3 style={{ margin: 0, color: '#92400e' }}>Gerarchia dei Permessi</h3>
                            </div>
                            <div className="card-body-v2">
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#b45309', fontWeight: 700, lineHeight: 1.6 }}>
                                    Per garantire il corretto funzionamento, il ruolo <b>"Verix"</b> (o l'integrazione del Bot) deve essere posizionato <b>SOPRA</b> i ruoli di verifica all'interno della lista ruoli del server Discord.
                                </p>
                            </div>
                        </section>
                    </div>

                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: '#f8fafc', color: '#475569' }}><Bell size={18} /></div>
                                <h3 style={{ margin: 0 }}>Log & Audit</h3>
                            </div>
                            <div className="card-body-v2">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1.5px solid #e2e8f0' }}>
                                    <div className="v-stack">
                                        <strong style={{ fontWeight: 900, color: '#1e293b' }}>Tracciamento Attivo</strong>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 650 }}>Registra ogni verifica riuscita.</span>
                                    </div>
                                    <label className="pc-toggle-v2 mini">
                                        <input type="checkbox" checked={!!config.logEnabled} onChange={e => setNested('logEnabled', e.target.checked)} />
                                        <span className="pc-slider-v2"></span>
                                    </label>
                                </div>
                                {config.logEnabled && (
                                    <div className="pc-input-group-v2 animate slide-up" style={{ marginTop: '24px' }}>
                                        <label>Canale di Log dedicato</label>
                                        <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 0 || c.type === 5)} value={config.logChannelId} onChange={v => setNested('logChannelId', v)} />
                                    </div>
                                )}
                            </div>
                        </section>

                        <button className="pc-btn-primary" style={{ width: '100%', background: '#ecfdf5', color: '#10b981', border: '1.5px solid #d1fae5', boxShadow: 'none', justifyContent: 'center' }} onClick={handleSendPanel} disabled={sendingPanel || !config.channelId}>
                            <Send size={18} />
                            <span>{sendingPanel ? 'Invio in corso...' : 'Invia Panel Verifica'}</span>
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'design' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}><MousePointer2 size={18} /></div>
                            <h3 style={{ margin: 0 }}>Branding del Bottone</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.5fr 100px 1.2fr', gap: '24px' }}>
                                <div className="pc-input-group-v2">
                                    <label>Etichetta Bottone</label>
                                    <div className="pc-input-wrapper-v2" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px' }}>
                                        <Type size={16} style={{ marginLeft: '16px', color: '#94a3b8' }} />
                                        <input style={{ width: '100%', border: 'none', background: 'transparent', padding: '14px 16px', fontWeight: 800, outline: 'none' }} value={config.buttons?.verify?.label || ''} onChange={e => setNested('buttons.verify.label', e.target.value)} placeholder="Verificati Ora" />
                                    </div>
                                </div>
                                <div className="pc-input-group-v2">
                                    <label>Emoji</label>
                                    <EmojiInput value={config.buttons?.verify?.emoji || ''} onChange={e => setNested('buttons.verify.emoji', e.target.value)} />
                                </div>
                                <div className="pc-input-group-v2">
                                    <label>Stile Discord</label>
                                    <CustomSelect 
                                        options={[
                                            { value: 'SUCCESS', label: 'Verde (Success)' },
                                            { value: 'PRIMARY', label: 'Blurple (Standard)' },
                                            { value: 'SECONDARY', label: 'Gray (Neutral)' },
                                            { value: 'DANGER', label: 'Red (Urgent)' },
                                            { value: 'LINK', label: 'URL (External)' }
                                        ]} 
                                        value={config.buttons?.verify?.style || 'SUCCESS'} 
                                        onChange={val => setNested('buttons.verify.style', val)} 
                                    />
                                </div>
                            </div>
                            {config.buttons?.verify?.style === 'LINK' && (
                                <div className="pc-input-group-v2 animate slide-up" style={{ marginTop: '24px' }}>
                                    <label>Destinazione Link Esterno</label>
                                    <div className="pc-input-wrapper-v2" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px' }}>
                                        <Globe size={16} style={{ marginLeft: '16px', color: '#94a3b8' }} />
                                        <input style={{ width: '100%', border: 'none', background: 'transparent', padding: '14px 16px', fontWeight: 800, outline: 'none' }} value={config.buttons?.verify?.url || ''} onChange={e => setNested('buttons.verify.url', e.target.value)} placeholder="https://portal.verix.gg/verify" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    <EmbedMessageManager 
                        guildId={guildId}
                        module="verify"
                        slugs={[
                            { key: 'panel', label: 'Embed Panel Verifica', description: 'Visualizzato nel canale di benvenuto per avviare il processo.', variables: ['guild'], group: 'Entry UI', groupIcon: ShieldCheck },
                            { key: 'success', label: 'Messaggio Benvenuto (DM)', description: 'Inviato all\'utente quando riceve il ruolo verificato.', variables: ['user', 'guild', 'member_count'], group: 'Outcome UI', groupIcon: CheckCircle2 },
                            { key: 'already_verified', label: 'Messaggio Già Verificato', description: 'Mostrato in modalità effimera se l\'utente ha già il ruolo.', variables: ['user', 'guild'], group: 'Feedback UI', groupIcon: Info },
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
            .pc-icon-box { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 12px 24px rgba(16, 185, 129, 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Outfit', sans-serif; font-size: 2.2rem; font-weight: 900; margin: 0; color: #1e293b; letter-spacing: -0.5px; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 900; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px; }
            .pc-status-tag-v2.on { background: #ecfdf5; color: #10b981; }
            .pc-status-tag-v2.off { background: #fef2f2; color: #ef4444; }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: #f8fafc; color: #64748b; border: 1.5px solid #e2e8f0; padding: 12px 24px; border-radius: 16px; font-weight: 800; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: #f0fdf4; color: #10b981; border-color: #bbf7d0; }
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

            .pc-hint-v2 { font-size: 0.8rem; color: #94a3b8; font-weight: 700; }
            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2 { background: #ffffff !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
