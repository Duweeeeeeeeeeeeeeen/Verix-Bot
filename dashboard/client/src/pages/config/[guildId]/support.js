import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import DiscordSelector from '../../../components/DiscordSelector';
import api from '../../../utils/api';
import { 
  Save, 
  Settings2, 
  Users, 
  Palette, 
  Power, 
  Clock, 
  ShieldCheck, 
  BellRing,
  Mic2,
  Volume2,
  Hash,
  RefreshCcw,
  Layout,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import CustomSelect from '../../../components/CustomSelect';

export default function SupportConfig() {
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
      Promise.all([
        api.request(`/config/${guildId}/support`),
        api.request(`/config/${guildId}/discord-data`)
      ]).then(([suppData, discordRes]) => {
        setConfig(suppData.data || suppData);
        setChannels(discordRes?.data?.channels || discordRes?.channels || []);
        setRoles(discordRes?.data?.roles || discordRes?.roles || []);
        setLoading(false);
      }).catch(err => {
        console.error("Error loading support data:", err);
        setLoading(false);
      });
    }
  }, [guildId, mounted]);

  const setNested = (path, value) => {
    const newConfig = { ...config };
    const parts = path.split('.');
    let cur = newConfig;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!cur[parts[i]]) cur[parts[i]] = {};
        cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
    setConfig(newConfig);
  };

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/support`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast('Configurazione assistenza salvata!');
    } catch (error) {
       showToast('Errore durante il salvataggio.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || loading || !config) return <Skeleton type="config" />;

  const tabs = [
    { id: 'settings', name: 'Impostazioni', icon: Settings2 },
    { id: 'messages', name: 'Messaggi & Embed', icon: MessageSquare },
  ];

  return (
    <div className="config-page-layout">
      <div className="config-main-col">
        <div className="animate">
        
        {/* Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Mic2 size={24} />
              </div>
              <div className="header-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h1>Assistenza Vocale</h1>
                  <label className="toggle-mini" title={config.enabled ? 'Modulo Attivo' : 'Modulo Disattivato'}>
                    <input type="checkbox" checked={!!config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                    <span className="slider-mini"></span>
                  </label>
                </div>
                <p>Gestisci la coda di assistenza vocale e le stanze private automatiche.</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Salvando...' : 'Salva'}
              </button>
           </div>
        </header>

        {/* Tab Navigation */}
        <div className="tab-navigation">
            {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-link ${activeTab === tab.id ? 'active' : ''}`}>
                        <Icon size={16} />
                        <span>{tab.name}</span>
                    </button>
                );
            })}
        </div>

        <div className="tab-panel animate">
            
            {/* TAB: Settings */}
            {activeTab === 'settings' && (
                <div className="config-grid">
                    <div className="grid-left">
                        <section className="card section-card">
                            <div className="section-header">
                                <div className="align-center">
                                    <Settings2 size={18} color="var(--primary)" />
                                    <h3>Configurazione Canali</h3>
                                </div>
                                <label className="toggle">
                                    <input type="checkbox" checked={!config.voiceSettings?.paused} onChange={e => setNested('voiceSettings.paused', !e.target.checked)} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            
                            <div className="fields-grid" style={{ marginTop: '24px' }}>
                                <div className="field-box">
                                    <label className="text-label">Canale Join (Sala d'Attesa)</label>
                                    <DiscordSelector type="channel" options={channels.filter(c => c.type === 2)} value={config.voiceSettings?.joinChannelId || ''} onChange={val => setNested('voiceSettings.joinChannelId', val)} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">Categoria Stanze Private</label>
                                    <DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.voiceSettings?.categoryId || ''} onChange={val => setNested('voiceSettings.categoryId', val)} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">Canale Log Staff</label>
                                    <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.logChannelId || ''} onChange={val => setConfig({...config, logChannelId: val})} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">Max Sessioni Contemporanee</label>
                                    <input type="number" className="input" min="1" max="10" value={config.voiceSettings?.maxConcurrent || 1} onChange={e => setNested('voiceSettings.maxConcurrent', parseInt(e.target.value))} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">Ruolo Prioritario (VIP / Saltacoda)</label>
                                    <DiscordSelector type="role" options={roles} value={config.voiceSettings?.vipRoleId || ''} onChange={val => setNested('voiceSettings.vipRoleId', val)} />
                                </div>
                                <div className="field-box" style={{ gridColumn: 'span 2' }}>
                                    <label className="text-label flex-between">
                                        Template Nome Canale
                                        <HelpTooltip text="Placeholders: {user}, {id}, {count}" />
                                    </label>
                                    <input 
                                        type="text" 
                                        className="input" 
                                        placeholder="es: assistenza-{user}" 
                                        value={config.voiceSettings?.channelNameTemplate || ''} 
                                        onChange={e => setNested('voiceSettings.channelNameTemplate', e.target.value)} 
                                    />
                                </div>
                            </div>

                            <div className="toggle-list" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div className="toggle-box">
                                    <div className="flex-col">
                                        <span style={{ fontWeight: 600 }}>Cancellazione Automatica</span>
                                        <p className="text-dim" style={{ fontSize: '0.75rem' }}>Elimina la stanza quando tutti escono.</p>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" checked={!!config.voiceSettings?.autoDelete} onChange={e => setNested('voiceSettings.autoDelete', e.target.checked)} />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="toggle-box">
                                    <div className="flex-col">
                                        <span style={{ fontWeight: 600 }}>Ping Staff all'Ingresso</span>
                                        <p className="text-dim" style={{ fontSize: '0.75rem' }}>Menziona i ruoli staff nel canale log.</p>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" checked={!!config.voiceSettings?.pingStaffOnJoin} onChange={e => setNested('voiceSettings.pingStaffOnJoin', e.target.checked)} />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="grid-right">
                        <section className="card section-card">
                            <h3 className="sidebar-title align-center" style={{ marginBottom: '16px' }}><Users size={18} /> Ruoli Assistenti</h3>
                            <DiscordSelector type="role" multiple={true} options={roles} value={config.staffRoleIds || []} onChange={val => setConfig({...config, staffRoleIds: val})} />
                            <p className="text-description" style={{ marginTop: '12px' }}>Questi ruoli avranno i permessi nelle stanze create e riceveranno i ping.</p>
                        </section>

                        <section className="card section-card" style={{ marginTop: '24px' }}>
                            <div className="align-center" style={{ marginBottom: '12px' }}>
                                <Hash size={18} />
                                <h3>Statistiche</h3>
                            </div>
                            <div className="stat-row">
                                <span>Sessioni Totali</span>
                                <strong>{config.voiceSettings?.sessionCounter || 0}</strong>
                            </div>
                            <button 
                                className="btn-outline-sm w-full" 
                                style={{ marginTop: '12px' }}
                                onClick={() => setNested('voiceSettings.sessionCounter', 0)}
                            >
                                <RefreshCcw size={14} /> Reset Contatore
                            </button>
                        </section>
                    </div>
                </div>
            )}

            {/* TAB: Messages */}
            {activeTab === 'messages' && (
                <div className="config-grid">
                    <div className="grid-left">
                        <section className="card section-card">
                            <div className="section-header">
                                <div className="align-center">
                                    <MessageSquare size={18} color="var(--primary)" />
                                    <h3>Messaggi di Sistema (DM)</h3>
                                </div>
                            </div>
                            <div className="fields-grid" style={{ marginTop: '24px' }}>
                                <div className="field-box" style={{ gridColumn: 'span 2' }}>
                                    <label className="text-label">Messaggio Servizio Chiuso</label>
                                    <textarea className="input" rows="2" value={config.voiceSettings?.messages?.paused || ''} onChange={e => setNested('voiceSettings.messages.paused', e.target.value)} />
                                </div>
                                <div className="field-box" style={{ gridColumn: 'span 2' }}>
                                    <label className="text-label">Messaggio Cooldown</label>
                                    <textarea className="input" rows="2" value={config.voiceSettings?.messages?.cooldown || ''} onChange={e => setNested('voiceSettings.messages.cooldown', e.target.value)} />
                                </div>
                                <div className="field-box" style={{ gridColumn: 'span 2' }}>
                                    <label className="text-label">Messaggio Coda Piena</label>
                                    <textarea className="input" rows="2" value={config.voiceSettings?.messages?.queueFull || ''} onChange={e => setNested('voiceSettings.messages.queueFull', e.target.value)} />
                                </div>
                                <div className="field-box" style={{ gridColumn: 'span 2' }}>
                                    <label className="text-label">Messaggio Inizio Sessione</label>
                                    <textarea className="input" rows="2" value={config.voiceSettings?.messages?.sessionStart || ''} onChange={e => setNested('voiceSettings.messages.sessionStart', e.target.value)} />
                                </div>
                            </div>
                        </section>

                        <section className="card section-card" style={{ marginTop: '24px' }}>
                            <div className="section-header">
                                <div className="align-center">
                                    <Palette size={18} color="var(--primary)" />
                                    <h3>Embed Log Staff</h3>
                                </div>
                            </div>
                            <div className="fields-grid" style={{ marginTop: '24px' }}>
                                <div className="field-box">
                                    <label className="text-label">Titolo Embed</label>
                                    <input type="text" className="input" value={config.embeds?.staffLog?.title || ''} onChange={e => setNested('embeds.staffLog.title', e.target.value)} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">Colore Embed</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input type="color" value={config.embeds?.staffLog?.color || '#f1c40f'} onChange={e => setNested('embeds.staffLog.color', e.target.value)} style={{ width: '40px', height: '40px', padding: '0', border: 'none', background: 'transparent' }} />
                                        <input type="text" className="input" value={config.embeds?.staffLog?.color || ''} onChange={e => setNested('embeds.staffLog.color', e.target.value)} placeholder="#HEX" />
                                    </div>
                                </div>
                                <div className="field-box" style={{ gridColumn: 'span 2' }}>
                                    <label className="text-label flex-between">
                                        Descrizione Embed
                                        <HelpTooltip text="Placeholders: {user}, {voice_channel}" />
                                    </label>
                                    <textarea className="input" rows="3" value={config.embeds?.staffLog?.description || ''} onChange={e => setNested('embeds.staffLog.description', e.target.value)} />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            )}
        </div>
      </div>

      <style jsx>{`
          .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: rgba(255,255,255,0.02); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
          .header-info { display: flex; align-items: center; gap: 16px; }
          .header-icon { width: 48px; height: 48px; background: rgba(241, 196, 15, 0.1); color: #f1c40f; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
          .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; }
          .header-text p { font-size: 0.85rem; color: var(--text-muted); }
          
          .tab-navigation { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px; padding: 6px; background: #070912; border-radius: 14px; border: 1px solid var(--border); }
          .tab-link { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border: none; background: transparent; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; border-radius: 10px; cursor: pointer; transition: 0.2s; }
          .tab-link:hover { color: white; background: rgba(255,255,255,0.03); }
          .tab-link.active { color: white; background: var(--bg-card); box-shadow: var(--shadow-sm); border: 1px solid var(--border); }

          .config-grid { display: grid; grid-template-columns: 1fr 300px; gap: 24px; }
          .grid-left { display: flex; flex-direction: column; gap: 24px; }
          .section-header { display: flex; justify-content: space-between; align-items: center; }
          
          .fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .field-box { display: flex; flex-direction: column; gap: 8px; }
          
          .toggle-box { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid var(--border); }
          .flex-col { display: flex; flex-direction: column; }
          
          .stat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
          .stat-row:last-of-type { border-bottom: none; }
          
          .align-center { display: flex; align-items: center; gap: 10px; }
          @media (max-width: 1000px) { .config-grid { grid-template-columns: 1fr; } }
      `}</style>
      </div>
    </div>
  );
}
