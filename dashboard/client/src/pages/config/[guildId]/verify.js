import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import DiscordSelector from '../../../components/DiscordSelector';
import EmbedMessageManager from '../../../components/EmbedMessageManager';
import api from '../../../utils/api';
import { 
    Save, ShieldCheck, Settings2, RefreshCcw, Power, 
    Palette, MessageSquare, Bell, Info, MousePointer2, 
    Type, ShieldAlert, ChevronRight, Hash, Shield, Send,
    Zap, MessageCircle, AlertCircle
} from 'lucide-react';
import CustomSelect from '../../../components/CustomSelect';
import { mergeConfig } from '../../../utils/defaults';
import EmojiInput from '../../../components/EmojiInput';
import NotificationSettings from '../../../components/NotificationSettings';

export default function VerifyConfig() {
  const router = useRouter();
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
    if (!guildId || !mounted) return;
    setLoading(true);
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
      console.error("Error loading verify config:", error);
      setConfig(mergeConfig({}, 'verify'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [guildId, mounted]);

  useEffect(() => {
    if (config) {
      window.dispatchEvent(new CustomEvent('update-guide-context', { detail: config }));
    }
  }, [config]);

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const getRoleError = (roleId) => {
    if (!roleId) return null;
    const role = discordData.roles.find(r => r.id === roleId);
    if (role && role.position >= discordData.botHighestPosition) {
        return "⚠️ Il ruolo è sopra quello del bot.";
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
    try {
      await api.request(`/config/${guildId}/verify`, { method: 'POST', body: JSON.stringify(config) });
      showToast('Configurazione salvata con successo!');
    } catch (error) {
      showToast('Errore durante il salvataggio.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendPanel = async () => {
    if (!config.channelId) return showToast('Configura prima un Canale Pannello!', 'error');
    setSendingPanel(true);
    try {
        await handleSave();
        const res = await api.request(`/config/${guildId}/verify/send-panel`, { method: 'POST' });
        showToast(res.message || 'Pannello inviato con successo!');
    } catch (error) {
        showToast('Errore durante l\'invio del pannello.', 'error');
    } finally {
        setSendingPanel(false);
    }
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  const tabs = [
    { id: 'settings', name: 'Settaggi', icon: Settings2 },
    { id: 'design', name: 'Design & Messaggi', icon: Palette },
  ];

  return (
    <div className="config-page-layout">
      <div className="config-main-col">
        <div className="animate">
            <header className="module-header">
                <div className="header-info">
                    <div className="header-icon">
                        <ShieldCheck size={24} />
                    </div>
                    <div className="header-text">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h1>Sistema Verifica</h1>
                            <label className="toggle-mini" title={config.enabled ? 'Modulo Attivo' : 'Modulo Disattivato'}>
                                <input type="checkbox" checked={!!config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                                <span className="slider-mini"></span>
                            </label>
                        </div>
                        <p>Configura il processo di verifica automatica per i nuovi membri.</p>
                    </div>
                </div>
                <div className="header-buttons">
                    <button onClick={handleSendPanel} className="btn-outline" disabled={sendingPanel || !config.channelId}>
                        <Send size={16} /> {sendingPanel ? 'Invio...' : 'Invia Pannello'}
                    </button>
                    <button onClick={handleSave} className="btn-primary" disabled={saving}>
                        <Save size={16} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}
                    </button>
                </div>
            </header>

            <div className="tab-navigation">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-link ${activeTab === tab.id ? 'active' : ''}`}>
                        <tab.icon size={16} />
                        <span>{tab.name}</span>
                    </button>
                ))}
            </div>

            <div className="tab-panel animate fade-in">
                {/* TAB: Settaggi */}
                {activeTab === 'settings' && (
                    <div className="config-grid">
                        <div className="grid-left">
                            <section className="card section-card">
                                <div className="section-header">
                                    <div className="align-center">
                                        <Shield size={18} color="var(--primary)" />
                                        <h3>Core Protocol</h3>
                                    </div>
                                </div>
                                <div className="fields-grid" style={{ marginTop: '20px' }}>
                                    <div className="field-box">
                                        <label className="text-label">Ruolo da Assegnare</label>
                                        <DiscordSelector type="role" options={discordData.roles} value={config.roleId} onChange={v => setNested('roleId', v)} error={getRoleError(config.roleId)} />
                                    </div>
                                    <div className="field-box">
                                        <label className="text-label">Canale Pannello</label>
                                        <DiscordSelector type="channel" options={discordData.channels} value={config.channelId} onChange={v => setNested('channelId', v)} />
                                    </div>
                                    <div className="field-box">
                                        <label className="text-label">Ruolo da Rimuovere</label>
                                        <DiscordSelector type="role" options={discordData.roles} value={config.removeRoleId} onChange={v => setNested('removeRoleId', v)} placeholder="Nessuno" />
                                    </div>
                                    <div className="field-box">
                                        <label className="text-label">Canale Audit Log</label>
                                        <DiscordSelector type="channel" options={discordData.channels} value={config.logChannelId} onChange={v => setNested('logChannelId', v)} placeholder="Nessuno" />
                                    </div>
                                </div>
                            </section>

                            <section className="card info-warn-v animate slide-up">
                                <ShieldAlert size={20} />
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Importante Gerarchia Ruoli</h4>
                                    <p style={{ margin: '4px 0 0 0', opacity: 0.8 }}>Il ruolo del bot deve essere <b>fisicamente sopra</b> i ruoli che desidera assegnare nella lista dei ruoli di Discord.</p>
                                </div>
                            </section>
                        </div>
                        <div className="grid-right">
                            <section className="card section-card">
                                <h3 className="sidebar-title align-center" style={{ marginBottom: '16px' }}><Bell size={18} /> Notifiche</h3>
                                <NotificationSettings 
                                    guildId={guildId}
                                    value={config.notifications}
                                    onChange={val => setConfig({...config, notifications: val})}
                                    title="Notifica Utente"
                                    description="Scegli come notificare l'utente dopo la verifica."
                                />
                                <div className="toggle-list-v">
                                    <div className="toggle-row-v">
                                        <span>Log Amministrazione</span>
                                        <label className="toggle"><input type="checkbox" checked={!!config.logEnabled} onChange={e => setNested('logEnabled', e.target.checked)} /><span className="slider"></span></label>
                                    </div>
                                </div>
                                <p className="text-description" style={{ marginTop: '12px' }}>Scegli se inviare un messaggio privato all'utente e un log nel canale staff dopo la verifica.</p>
                            </section>
                        </div>
                    </div>
                )}

                {/* TAB: Design & Messaggi */}
                {activeTab === 'design' && (
                    <div className="animate fade-in">
                        <section className="card section-card" style={{ marginBottom: '24px' }}>
                            <div className="align-center" style={{ marginBottom: '20px' }}>
                                <MousePointer2 size={18} color="var(--primary)" />
                                <h3>Branding Pulsante</h3>
                            </div>
                            <div className="btn-config-grid">
                                <div className="btn-config-card-v">
                                    <div className="fields-grid">
                                        <div className="field-box">
                                            <label className="label-tiny">Testo Bottone</label>
                                            <input className="input" value={config.buttons?.verify?.label || ''} onChange={e => setNested('buttons.verify.label', e.target.value)} placeholder="Verificati Ora" />
                                        </div>
                                        <div className="field-box">
                                            <label className="label-tiny">Emoji</label>
                                            <div style={{ width: '60px' }}>
                                                <EmojiInput value={config.buttons?.verify?.emoji || ''} onChange={e => setNested('buttons.verify.emoji', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="field-box" style={{ gridColumn: 'span 2' }}>
                                            <label className="label-tiny">Stile Pulsante</label>
                                            <div className="style-selector-v">
                                                {[
                                                    { id: 'SUCCESS', label: 'Verde', color: '#22c55e' },
                                                    { id: 'PRIMARY', label: 'Blu', color: '#6366f1' },
                                                    { id: 'SECONDARY', label: 'Grigio', color: '#64748b' },
                                                    { id: 'DANGER', label: 'Rosso', color: '#ef4444' },
                                                    { id: 'LINK', label: 'Link 🔗', color: '#3b82f6' }
                                                ].map(style => (
                                                    <button 
                                                        key={style.id}
                                                        onClick={() => setNested('buttons.verify.style', style.id)}
                                                        className={`style-btn ${config.buttons?.verify?.style === style.id ? 'active' : ''}`}
                                                    >
                                                        <div className="dot" style={{ backgroundColor: style.color }}></div>
                                                        <span>{style.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        {config.buttons?.verify?.style === 'LINK' && (
                                            <div className="field-box animate fade-in" style={{ gridColumn: 'span 2' }}>
                                                <label className="label-tiny">URL del Link</label>
                                                <input className="input" value={config.buttons?.verify?.url || ''} onChange={e => setNested('buttons.verify.url', e.target.value)} placeholder="https://google.com" />
                                                <p className="field-help" style={{ marginTop: '4px', fontSize: '0.7rem' }}>I bottoni Link aprono un sito web esterno e non attivano il sistema di verifica.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <EmbedMessageManager 
                            guildId={guildId}
                            module="verify"
                            slugs={[
                                { key: 'panel', label: 'Pannello Verifica', description: 'Il messaggio principale inviato nel canale di verifica.', variables: ['guild'], group: '✅ Verifica', groupIcon: ShieldCheck },
                                { key: 'success', label: 'Conferma Identità (DM)', description: 'Messaggio privato inviato all\'utente dopo la verifica riuscita.', variables: ['user', 'guild', 'member_count'], group: '✅ Successo', groupIcon: MessageCircle },
                                { key: 'success_reply', label: 'Risposta Pulsante', description: 'Risposta effimera mostrata al click del pulsante.', variables: ['user', 'guild'], group: '✅ Successo', groupIcon: Zap },
                                { key: 'already_verified', label: 'Già Verificato', description: 'Errore mostrato se l\'utente è già verificato.', variables: ['user', 'guild'], group: '🟥 Errori', groupIcon: AlertCircle },
                                { key: 'error', label: 'Errore Identificazione', description: 'Errore mostrato in caso di problemi tecnici durante la verifica.', variables: [], group: '🟥 Errori', groupIcon: XCircle },
                                { key: 'staff_log', label: 'Log Staff', description: 'Log inviato al canale staff quando qualcuno si verifica.', variables: ['user', 'role', 'timestamp'], group: '🛡️ Staff', groupIcon: Shield },
                            ]}
                            extraButtons={(slug) => {
                                if (slug === 'panel') {
                                    return [config.buttons?.verify || { label: 'Verificati Ora', emoji: '✅', style: 'SUCCESS' }];
                                }
                                return null;
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
      </div>

        <style jsx>{`
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: rgba(255,255,255,0.02); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: rgba(34, 197, 94, 0.1); color: #22c55e; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }
            
            .tab-navigation { display: flex; gap: 8px; margin-bottom: 32px; padding: 6px; background: #070912; border-radius: 14px; border: 1px solid var(--border); width: fit-content; }
            .tab-link { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border: none; background: transparent; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; border-radius: 10px; cursor: pointer; transition: 0.2s; }
            .tab-link:hover { color: white; background: rgba(255,255,255,0.03); }
            .tab-link.active { color: white; background: var(--bg-card); box-shadow: var(--shadow-sm); border: 1px solid var(--border); }

            .config-grid { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
            .grid-left { display: flex; flex-direction: column; gap: 24px; }
            
            .fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .field-box { display: flex; flex-direction: column; gap: 8px; }
            
            .toggle-list-v { display: flex; flex-direction: column; gap: 10px; }
            .toggle-row-v { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: rgba(255,255,255,0.02); border-radius: 10px; border: 1px solid var(--border); font-size: 0.85rem; font-weight: 600; }
            
            .info-warn-v { background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1); display: flex; align-items: center; gap: 16px; padding: 20px; color: #ef4444; border-radius: 16px; }
            
            .btn-config-card-v { background: rgba(255,255,255,0.015); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .label-tiny { font-size: 0.65rem; text-transform: uppercase; color: var(--text-dim); font-weight: 800; margin-bottom: 8px; display: block; }
            
            .style-selector-v { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 4px; }
            .style-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 10px; cursor: pointer; transition: 0.2s; color: var(--text-dim); font-size: 0.8rem; font-weight: 600; }
            .style-btn:hover { background: rgba(255,255,255,0.05); color: white; }
            .style-btn.active { border-color: var(--primary); background: rgba(99, 102, 241, 0.05); color: white; }
            .style-btn .dot { width: 8px; height: 8px; border-radius: 50%; }

            .align-center { display: flex; align-items: center; gap: 10px; }
            @media (max-width: 1000px) { .config-grid { grid-template-columns: 1fr; } .fields-grid { grid-template-columns: 1fr; } .style-selector-v { grid-template-columns: 1fr 1fr; } }
        `}</style>
    </div>
  );
}
