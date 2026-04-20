import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
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
import GuideSidebar from '../../../components/GuideSidebar';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
      const fetchData = async () => {
        try {
          const [configRes, discordRes] = await Promise.all([
            api.request(`/config/${guildId}`),
            api.request(`/config/${guildId}/discord-data`)
          ]);

          if (configRes && configRes.data) {
            setConfig(configRes.data.verify || configRes.data);
          } else if (configRes && configRes.verify) {
            setConfig(configRes.verify);
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
      await api.request(`/config/${guildId}/verify`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast('Configurazione salvata!');
    } catch (error) {}
    finally { setSaving(false); }
  };

  const handleSendPanel = async () => {
    setSendingPanel(true);
    try {
        const res = await api.request(`/config/${guildId}/verify/send-panel`, { method: 'POST' });
        showToast(res.message || 'Pannello inviato!');
    } catch (error) {}
    finally { setSendingPanel(false); }
  };

  if (loading || !config) return <Layout guildId={guildId}><Skeleton height="500px" /></Layout>;

  return (
    <Layout guildId={guildId}>
      <div className="animate">
        
        {/* Module Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <ShieldCheck size={24} />
              </div>
              <div className="header-text">
                <h1>Sistema Verifica</h1>
                <p>Configura il portone d'ingresso del tuo server Discord.</p>
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
            <button onClick={() => setActiveTab('messages')} className={`tab-link ${activeTab === 'messages' ? 'active' : ''}`}>
                <MessageSquare size={16} />
                <span>Messaggi</span>
            </button>
            <button onClick={() => setActiveTab('personalization')} className={`tab-link ${activeTab === 'personalization' ? 'active' : ''}`}>
                <Palette size={16} />
                <span>Design</span>
            </button>
        </div>

        {activeTab === 'settings' && (
            <div className="animate fade-in contents-grid">
                <div className="card status-section">
                    <div className="section-info">
                        <div className={`status-box ${config.enabled ? 'on' : ''}`}>
                            <Power size={20} />
                        </div>
                        <div>
                            <h3>Stato Verifica</h3>
                            <p className="text-muted">Abilita o disabilita l'accesso protetto via bottone.</p>
                        </div>
                    </div>
                    <label className="toggle">
                        <input type="checkbox" checked={config.enabled} onChange={(e) => setConfig({...config, enabled: e.target.checked})} />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className="config-grid-v">
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

                    <aside className="side-v">
                        <div className="card section-card-v">
                             <div className="align-center" style={{ marginBottom: '16px' }}>
                                <Bell size={16} color="var(--primary)" />
                                <h3>Notifiche</h3>
                             </div>
                             <div className="toggle-list-v">
                                <div className="toggle-row-v">
                                    <span>Notifica DM Utente</span>
                                    <label className="toggle"><input type="checkbox" checked={config.dmEnabled} onChange={e => setNested('dmEnabled', e.target.checked)} /><span className="slider"></span></label>
                                </div>
                                <div className="toggle-row-v">
                                    <span>Log Amministrazione</span>
                                    <label className="toggle"><input type="checkbox" checked={config.logEnabled} onChange={e => setNested('logEnabled', e.target.checked)} /><span className="slider"></span></label>
                                </div>
                             </div>
                        </div>

                        <div className="card info-warn-v">
                             <ShieldAlert size={20} />
                             <p>Il ruolo del bot deve essere <b>fisicamente sopra</b> i ruoli che desidera assegnare nella lista dei ruoli di Discord.</p>
                        </div>

                        <div style={{ marginTop: '24px' }}>
                            <GuideSidebar type="verify" context={config} />
                        </div>
                    </aside>
                </div>
            </div>
        )}

        {activeTab === 'personalization' && (
            <div className="animate fade-in contents-grid">
                <div className="config-grid-v">
                    <section className="card editor-container-v">
                        <div className="editor-header-v">
                             <div className="align-center">
                                <Palette size={18} color="var(--primary)" />
                                <h3>Visual Experience</h3>
                             </div>
                             <select className="select" style={{ width: '180px', padding: '8px 12px' }} value={activeEmbedKey} onChange={e => setActiveEmbedKey(e.target.value)}>
                                <option value="panel">Pagina Verifica</option>
                                <option value="dm">Messaggio DM</option>
                             </select>
                        </div>
                        <div className="editor-p-v">
                             <EmbedEditor 
                                embed={config.embeds?.[activeEmbedKey] || {}} 
                                onChange={d => updateEmbed(activeEmbedKey, d)}
                                variables={['user', 'user_mention', 'guild', 'member_count']}
                             />
                        </div>
                    </section>

                    <aside className="side-v">
                        <section className="card section-card-v">
                             <h4 className="align-center" style={{ marginBottom: '16px' }}><MousePointer2 size={16} color="var(--primary)" /> Pulsante</h4>
                             <div className="fields-stack-v">
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
                                    <select className="select" value={config.buttons?.verify?.style || 'SUCCESS'} onChange={e => updateButton('style', e.target.value)}>
                                        <option value="SUCCESS">Success (Verde)</option>
                                        <option value="PRIMARY">Primary (Blu)</option>
                                        <option value="SECONDARY">Grey (Grigio)</option>
                                        <option value="DANGER">Danger (Rosso)</option>
                                    </select>
                                </div>
                             </div>
                        </section>

                        <section className="card section-card-v" style={{ marginTop: '24px' }}>
                             <h4 className="align-center" style={{ marginBottom: '16px' }}><Type size={16} color="var(--primary)" /> Microcopy</h4>
                             <div className="fields-stack-v">
                                <div className="field-box">
                                    <label className="text-label">Messaggio Già Verificato</label>
                                    <input className="input" value={config.messages?.alreadyVerified || ''} onChange={e => setNested('messages.alreadyVerified', e.target.value)} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">Messaggio Successo</label>
                                    <input className="input" value={config.messages?.successResponse || ''} onChange={e => setNested('messages.successResponse', e.target.value)} />
                                </div>
                             </div>
                        </section>
                    </aside>
                </div>
            </div>
        )}

            {activeTab === 'messages' && (
                <div className="animate">
                    <EmbedMessageManager 
                        guildId={guildId}
                        module="verify"
                        slugs={[
                            { key: 'success', label: 'Conferma Identità', description: 'Inviato in DM all\'utente dopo la verifica riuscita.', variables: ['guild'] },
                        ]}
                    />
                </div>
            )}
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

            .config-grid-v { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
            .fields-grid-v { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .toggle-list-v { display: flex; flex-direction: column; gap: 10px; }
            .toggle-row-v { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: rgba(255,255,255,0.02); border-radius: 10px; border: 1px solid var(--border); font-size: 0.85rem; font-weight: 600; }

            .info-warn-v { margin-top: 24px; background: rgba(244, 63, 94, 0.05); border: 1px solid rgba(244, 63, 94, 0.1); display: flex; align-items: center; gap: 16px; padding: 16px 20px; color: var(--error); font-size: 0.85rem; line-height: 1.4; }

            .editor-container-v { padding: 0 !important; }
            .editor-header-v { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
            .editor-p-v { padding: 24px; }

            .fields-stack-v { display: flex; flex-direction: column; gap: 16px; }
            .align-center { display: flex; align-items: center; gap: 10px; }

            @media (max-width: 1000px) { .config-grid-v { grid-template-columns: 1fr; } }
        `}</style>
      </div>
    </Layout>
  );
}
