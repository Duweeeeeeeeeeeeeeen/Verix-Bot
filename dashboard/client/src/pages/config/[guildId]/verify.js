import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import DiscordSelector from '../../../components/DiscordSelector';
import EmbedEditor from '../../../components/EmbedEditor';
import EmbedMessageManager from '../../../components/EmbedMessageManager';
import api from '../../../utils/api';
import { 
    Save, ShieldCheck, Settings2, RefreshCcw, Power, 
    Palette, MessageSquare, Bell, Info, MousePointer2, 
    Type, ShieldAlert, ChevronRight
} from 'lucide-react';
import CustomSelect from '../../../components/CustomSelect';
import { mergeConfig } from '../../../utils/defaults';

export default function VerifyConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [], botHighestPosition: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingPanel, setSendingPanel] = useState(false);
   const [activeTab, setActiveTab] = useState('settings');
  const [activeEmbedKey, setActiveEmbedKey] = useState('panel');
  const [messages, setMessages] = useState({});
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.request(`/messages/${guildId}/verify`);
      setMessages(res.data || res || {});
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (guildId && mounted) {
      const fetchData = async () => {
        try {
          fetchMessages();
          const [configRes, discordRes] = await Promise.all([
            api.request(`/config/${guildId}/verify`),
            api.request(`/config/${guildId}/discord-data`)
          ]);

          if (configRes && (configRes.data || configRes)) {
            const data = configRes.data || configRes;
            setConfig(mergeConfig(data.verify || data, 'verify'));
          }
          if (discordRes && discordRes.data) {
            setDiscordData(discordRes.data);
          } else if (discordRes) {
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
    const keys = path.split('.');
    const newConfig = { ...config };
    let current = newConfig;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setConfig(newConfig);
  };

  const updateEmbed = (key, data) => {
    const newConfig = { ...config };
    if (!newConfig.embeds) newConfig.embeds = {};
    newConfig.embeds[key] = { ...newConfig.embeds[key], ...data };
    setConfig(newConfig);
  };

  const updateButton = (field, value) => {
    const newConfig = { ...config };
    if (!newConfig.buttons) newConfig.buttons = { verify: {} };
    if (!newConfig.buttons.verify) newConfig.buttons.verify = {};
    newConfig.buttons.verify[field] = value;
    setConfig(newConfig);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        api.request(`/config/${guildId}/verify`, { method: 'POST', body: JSON.stringify(config) }),
        api.request(`/messages/${guildId}/verify`, { method: 'POST', body: JSON.stringify(messages) })
      ]);
      showToast('Configurazione salvata con successo!');
    } catch (error) {
      showToast('Errore durante il salvataggio.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendPanel = async () => {
    setSendingPanel(true);
    try {
        const res = await api.request(`/config/${guildId}/verify/send-panel`, { method: 'POST' });
        showToast(res.message || 'Pannello inviato!');
    } catch (error) {}
    finally { setSendingPanel(false); }
  };

  if (loading || !config) return <><Skeleton height="500px" /></>;

  return (
    <div className="config-page-layout animate">
      <div className="config-main-col">
        {/* Module Header */}
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
                <p>Configura il processo di verifica per i nuovi membri.</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleSendPanel} className="btn-outline" disabled={sendingPanel || !config.channelId}>
                <MessageSquare size={16} /> {sendingPanel ? 'Invio...' : 'Invia Pannello'}
              </button>
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
           </div>
        </header>

        {/* Minimal Tabs */}
        <div className="tab-navigation">
            <button onClick={() => setActiveTab('settings')} className={`tab-link ${activeTab === 'settings' ? 'active' : ''}`}>
                <Settings2 size={16} />
                <span>Configurazione</span>
            </button>
            <button onClick={() => setActiveTab('personalization')} className={`tab-link ${activeTab === 'personalization' ? 'active' : ''}`}>
                <Palette size={16} />
                <span>Design & Messaggi</span>
            </button>
        </div>

        {activeTab === 'settings' && (
            <div className="animate fade-in">
                <section className="card section-card-v">
                    <div className="align-center" style={{ marginBottom: '24px' }}>
                        <Settings2 size={18} color="var(--primary)" />
                        <h3>Core Protocol</h3>
                    </div>
                    <div className="fields-grid-v">
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
            </div>
        )}

        {activeTab === 'personalization' && (
            <div className="animate fade-in">
                <section className="card editor-container-v" style={{ marginBottom: '24px' }}>
                    <div className="editor-header-v">
                         <div className="align-center">
                            <Palette size={18} color="var(--primary)" />
                            <h3>Visual Experience</h3>
                         </div>
                         <CustomSelect 
                            style={{ width: '200px' }} 
                            options={[
                                { value: 'panel', label: 'Pagina Verifica' },
                                { value: 'dm', label: 'Messaggio DM' }
                            ]} 
                            value={activeEmbedKey} 
                            onChange={val => setActiveEmbedKey(val)} 
                         />
                    </div>
                    <div className="editor-p-v">
                         <EmbedEditor 
                            embed={activeEmbedKey === 'panel' ? (messages.panel || {}) : (config.embeds?.dm || {})} 
                            onChange={(data) => activeEmbedKey === 'panel' ? setMessages({...messages, panel: data}) : updateEmbed('dm', data)}
                            variables={['user', 'user_mention', 'guild', 'member_count']}
                         />
                    </div>
                </section>

                <EmbedMessageManager 
                    guildId={guildId}
                    module="verify"
                    slugs={[
                        { key: 'success', label: 'Conferma Identità', description: 'Messaggio privato (DM) inviato all\'utente dopo la verifica riuscita.', variables: ['guild'], group: '✅ Successo' },
                        { key: 'success_reply', label: 'Risposta Pulsante Verifica', description: 'Risposta effimera al click del pulsante di verifica.', variables: ['user'], group: '✅ Successo' },
                        { key: 'already_verified', label: 'Utente Già Verificato', description: 'Risposta effimera se l\'utente è già verificato.', variables: ['user'], group: '🟥 Errori' },
                        { key: 'staff_log', label: 'Log Staff', description: 'Log inviato al canale staff quando qualcuno si verifica.', variables: ['user', 'timestamp'], group: '🛡️ Staff' },
                    ]}
                />
            </div>
        )}

        {/* Local Page Side-Content (Moved from legacy sidebar) */}
        <div className="verify-extra-config">
            <div className="card section-card-v">
                    <div className="align-center" style={{ marginBottom: '16px' }}>
                    <Bell size={16} color="var(--primary)" />
                    <h3>Notifiche</h3>
                    </div>
                    <div className="toggle-list-v">
                    <div className="toggle-row-v">
                        <span>Notifica DM Utente</span>
                        <label className="toggle"><input type="checkbox" checked={!!config.dmEnabled} onChange={e => setNested('dmEnabled', e.target.checked)} /><span className="slider"></span></label>
                    </div>
                    <div className="toggle-row-v">
                        <span>Log Amministrazione</span>
                        <label className="toggle"><input type="checkbox" checked={!!config.logEnabled} onChange={e => setNested('logEnabled', e.target.checked)} /><span className="slider"></span></label>
                    </div>
                    </div>
            </div>

            <div className="card info-warn-v">
                    <ShieldAlert size={20} />
                    <p>Il ruolo del bot deve essere <b>fisicamente sopra</b> i ruoli che desidera assegnare nella lista dei ruoli di Discord.</p>
            </div>
            
            {activeTab === 'personalization' && (
                <section className="card section-card-v" style={{ gridColumn: 'span 2' }}>
                    <h4 className="align-center" style={{ marginBottom: '16px' }}><MousePointer2 size={16} color="var(--primary)" /> Pulsante</h4>
                    <div className="fields-stack-v" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div className="field-box">
                            <label className="text-label">Testo</label>
                            <input className="input" value={config.buttons?.verify?.label || ''} onChange={e => updateButton('label', e.target.value)} />
                        </div>
                        <div className="field-box">
                            <label className="text-label">Emoji</label>
                            <input className="input" value={config.buttons?.verify?.emoji || ''} onChange={e => updateButton('emoji', e.target.value)} />
                        </div>
                        <div className="field-box">
                            <label className="text-label">Style</label>
                            <CustomSelect 
                                options={[
                                    { value: 'SUCCESS', label: 'Success (Verde)' },
                                    { value: 'PRIMARY', label: 'Primary (Blu)' },
                                    { value: 'SECONDARY', label: 'Grey (Grigio)' },
                                    { value: 'DANGER', label: 'Danger (Rosso)' }
                                ]} 
                                value={config.buttons?.verify?.style || 'SUCCESS'} 
                                onChange={val => updateButton('style', val)} 
                            />
                        </div>
                    </div>
                </section>
            )}
        </div>
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

            .status-section { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; margin-bottom: 24px; }
            .section-info { display: flex; align-items: center; gap: 16px; }
            .status-box { width: 40px; height: 40px; background: #1e293b; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); border: 1px solid var(--border); transition: 0.3s; }
            .status-box.on { color: var(--primary); background: rgba(129, 140, 248, 0.1); border-color: rgba(129, 140, 248, 0.2); }

            .fields-grid-v { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .toggle-list-v { display: flex; flex-direction: column; gap: 10px; }
            .toggle-row-v { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: rgba(255,255,255,0.02); border-radius: 10px; border: 1px solid var(--border); font-size: 0.85rem; font-weight: 600; }

            .info-warn-v { background: rgba(244, 63, 94, 0.05); border: 1px solid rgba(244, 63, 94, 0.1); display: flex; align-items: center; gap: 16px; padding: 16px 20px; color: var(--error); font-size: 0.85rem; line-height: 1.4; }
            .warn-title { color: white; margin-bottom: 4px; }

            .editor-container-v { padding: 0 !important; }
            .editor-header-v { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
            .editor-p-v { padding: 24px; }

            .fields-stack-v { display: flex; flex-direction: column; gap: 16px; }
            .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
            .align-center { display: flex; align-items: center; gap: 10px; }
            .verify-extra-config { margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
            .full-width { grid-column: span 2; }
            .spacer-bottom { margin-bottom: 24px; }
            .spacer-bottom-sm { margin-bottom: 16px; }
            .header-section-spacer { margin-bottom: 24px; }
        `}</style>
    </div>
  );
}
