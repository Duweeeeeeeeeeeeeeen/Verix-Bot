import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import DiscordSelector from '../../../components/DiscordSelector';
import api from '../../../utils/api';
import { 
    Save, ShieldAlert, Settings2, Power, 
    Clock, Trash2, Plus, X, AlertTriangle, 
    Shield, Gavel, History, MessageSquare, 
    Type, AtSign, List, Ghost, RefreshCcw
} from 'lucide-react';
import CustomSelect from '../../../components/CustomSelect';
import EmbedMessageManager from '../../../components/EmbedMessageManager';
import { mergeConfig } from '../../../utils/defaults';
import NotificationSettings from '../../../components/NotificationSettings';

export default function ModerationConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('antispam');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
      const fetchData = async () => {
        try {
          const [configRes, discordRes] = await Promise.all([
            api.request(`/config/${guildId}/moderation`),
            api.request(`/config/${guildId}/discord-data`)
          ]);
          if (configRes) {
            setConfig(mergeConfig(configRes.data || configRes, 'moderation'));
          }
          if (discordRes) {
            setDiscordData(discordRes.data || discordRes);
          }
          setLoading(false);
        } catch (error) {
          console.error("Error loading moderation config:", error);
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
      await api.request(`/config/${guildId}/moderation`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast('Configurazione moderazione salvata!');
    } catch (error) {
        showToast('Errore durante il salvataggio', 'error');
    }
    finally { setSaving(false); }
  };

  const updateNested = (path, value) => {
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

  const addPunishment = () => {
    const newPunishments = [...(config.punishments || []), { level: 1, action: 'warn', duration: 0, message: '' }];
    setConfig({ ...config, punishments: newPunishments });
  };

  const removePunishment = (index) => {
    const newPunishments = config.punishments.filter((_, i) => i !== index);
    setConfig({ ...config, punishments: newPunishments });
  };

  const updatePunishment = (index, field, value) => {
    const newPunishments = [...config.punishments];
    newPunishments[index] = { ...newPunishments[index], [field]: value };
    setConfig({ ...config, punishments: newPunishments });
  };

  const addBlacklistWord = (word) => {
    if (!word) return;
    const words = [...(config.blacklist?.words || [])];
    if (!words.includes(word)) {
        words.push(word);
        updateNested('blacklist.words', words);
    }
  };

  const removeBlacklistWord = (word) => {
    const words = (config.blacklist?.words || []).filter(w => w !== word);
    updateNested('blacklist.words', words);
  };

  if (loading || !config) return <><Skeleton height="500px" /></>;

  return (
    <div className="config-page-layout animate">
      <div className="config-main-col">
        {/* Module Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Shield size={24} />
              </div>
              <div className="header-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h1>Hub Moderazione</h1>
                  <label className="toggle-mini" title={config.enabled ? 'Modulo Attivo' : 'Modulo Disattivato'}>
                    <input type="checkbox" checked={!!config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                    <span className="slider-mini"></span>
                  </label>
                </div>
                <p>Configura tutti i filtri e le protezioni automatiche del tuo server.</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
           </div>
        </header>

        {/* Tab Navigation */}
        <div className="tab-navigation">
            <button onClick={() => setActiveTab('antispam')} className={`tab-link ${activeTab === 'antispam' ? 'active' : ''}`}>
                <MessageSquare size={16} /> <span>Anti-Spam</span>
            </button>
            <button onClick={() => setActiveTab('filters')} className={`tab-link ${activeTab === 'filters' ? 'active' : ''}`}>
                <Type size={16} /> <span>Filtri</span>
            </button>
            <button onClick={() => setActiveTab('punishments')} className={`tab-link ${activeTab === 'punishments' ? 'active' : ''}`}>
                <Gavel size={16} /> <span>Punizioni</span>
            </button>
            <button onClick={() => setActiveTab('exceptions')} className={`tab-link ${activeTab === 'exceptions' ? 'active' : ''}`}>
                <Ghost size={16} /> <span>Eccezioni</span>
            </button>
            <button onClick={() => setActiveTab('messages')} className={`tab-link ${activeTab === 'messages' ? 'active' : ''}`}>
                <RefreshCcw size={16} /> <span>Design & Messaggi</span>
            </button>
        </div>

        <div className="contents-grid-m">
            <div className="main-col-m">
                
                {/* TAB: ANTI-SPAM */}
                {activeTab === 'antispam' && config.antispam && (
                    <section className="card section-card-v animate fade-in">
                        <div className="section-title-row">
                            <div className="align-center">
                                <MessageSquare size={18} color="var(--primary)" />
                                <h3>Protezione Anti-Spam</h3>
                            </div>
                            <label className="toggle">
                                <input type="checkbox" checked={!!config.antispam.enabled} onChange={e => updateNested('antispam.enabled', e.target.checked)} />
                                <span className="slider"></span>
                            </label>
                        </div>
                        <div className="fields-grid-v" style={{ marginTop: '24px' }}>
                            <div className="field-box">
                                <label className="text-label">Max Messaggi</label>
                                <input type="number" className="input" value={config.antispam.maxMessages} onChange={e => updateNested('antispam.maxMessages', parseInt(e.target.value))} />
                                <p className="field-help">Soglia messaggi prima della violazione.</p>
                            </div>
                            <div className="field-box">
                                <label className="text-label">Intervallo (ms)</label>
                                <input type="number" className="input" value={config.antispam.timeWindow} onChange={e => updateNested('antispam.timeWindow', parseInt(e.target.value))} />
                                <p className="field-help">Finestra temporale di controllo.</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* TAB: FILTERS (Caps, Mentions, Blacklist) */}
                {activeTab === 'filters' && (
                    <div className="animate fade-in">
                        {/* Caps Lock */}
                        {config.capsLock && (
                            <section className="card section-card-v">
                                <div className="section-title-row">
                                    <div className="align-center">
                                        <Type size={18} color="var(--primary)" />
                                        <h3>Caps Lock</h3>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" checked={!!config.capsLock.enabled} onChange={e => updateNested('capsLock.enabled', e.target.checked)} />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="fields-grid-v" style={{ marginTop: '24px' }}>
                                    <div className="field-box">
                                        <label className="text-label">Percentuale Max (%)</label>
                                        <input type="number" className="input" value={config.capsLock.percentage} onChange={e => updateNested('capsLock.percentage', parseInt(e.target.value))} />
                                    </div>
                                    <div className="field-box">
                                        <label className="text-label">Caratteri Minimi</label>
                                        <input type="number" className="input" value={config.capsLock.minCharacters} onChange={e => updateNested('capsLock.minCharacters', parseInt(e.target.value))} />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Mention Spam */}
                        {config.mentionSpam && (
                            <section className="card section-card-v" style={{ marginTop: '24px' }}>
                                <div className="section-title-row">
                                    <div className="align-center">
                                        <AtSign size={18} color="var(--primary)" />
                                        <h3>Mention Spam</h3>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" checked={!!config.mentionSpam.enabled} onChange={e => updateNested('mentionSpam.enabled', e.target.checked)} />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="field-box" style={{ marginTop: '24px' }}>
                                    <label className="text-label">Limite Menzioni</label>
                                    <input type="number" className="input" value={config.mentionSpam.limit} onChange={e => updateNested('mentionSpam.limit', parseInt(e.target.value))} />
                                    <p className="field-help">Numero massimo di menzioni per singolo messaggio.</p>
                                </div>
                            </section>
                        )}

                        {/* Blacklist */}
                        {config.blacklist && (
                            <section className="card section-card-v" style={{ marginTop: '24px' }}>
                                <div className="section-title-row">
                                    <div className="align-center">
                                        <List size={18} color="var(--primary)" />
                                        <h3>Blacklist Parole</h3>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" checked={!!config.blacklist.enabled} onChange={e => updateNested('blacklist.enabled', e.target.checked)} />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div style={{ marginTop: '24px' }}>
                                    <div className="add-word-row">
                                        <input type="text" className="input" id="new-word" placeholder="Aggiungi parola..." onKeyDown={e => e.key === 'Enter' && (addBlacklistWord(e.target.value), e.target.value = '')} />
                                        <button className="btn-add-word" onClick={() => {
                                            const inp = document.getElementById('new-word');
                                            addBlacklistWord(inp.value);
                                            inp.value = '';
                                        }}><Plus size={16} /></button>
                                    </div>
                                    <div className="words-tags-container">
                                        {config.blacklist.words?.map(word => (
                                            <div key={word} className="word-tag">
                                                <span>{word}</span>
                                                <button className="btn-remove-premium" style={{ padding: '2px', borderRadius: '4px' }} onClick={() => removeBlacklistWord(word)}><X size={10} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                )}

                {/* TAB: PUNISHMENTS */}
                {activeTab === 'punishments' && (
                    <section className="card section-card-v animate fade-in">
                        <div className="header-with-action">
                            <div className="align-center">
                                <Gavel size={18} color="var(--warning)" />
                                <h3>Sistema Sanzionatorio</h3>
                            </div>
                            <button className="btn-add-small" onClick={addPunishment}>
                                <Plus size={14} /> Aggiungi Livello
                            </button>
                        </div>
                        <NotificationSettings 
                            guildId={guildId}
                            value={config.notifications}
                            onChange={val => setConfig({...config, notifications: val})}
                            title="Notifiche Infrazioni"
                            description="Scegli come l'utente riceverà l'avviso per i suoi richiami (Ban, Kick, Warn, etc)."
                        />

                        <div className="punishments-list" style={{ marginTop: '24px' }}>
                            {(config.punishments || []).sort((a,b) => a.level - b.level).map((p, index) => (
                                <div key={index} className="punishment-item card">
                                    <div className="p-item-header">
                                        <div className="p-level-badge">Soglia {p.level} Infrazioni</div>
                                        <button className="btn-remove-premium" onClick={() => removePunishment(index)}><X size={14} /></button>
                                    </div>
                                    <div className="p-item-grid">
                                        <div className="field-box">
                                            <label className="text-label">Soglia</label>
                                            <input type="number" className="input" value={p.level} onChange={e => updatePunishment(index, 'level', parseInt(e.target.value))} />
                                        </div>
                                        <div className="field-box">
                                            <label className="text-label">Azione</label>
                                            <CustomSelect 
                                                options={[
                                                    { value: 'warn', label: 'Warning' },
                                                    { value: 'timeout', label: 'Timeout' },
                                                    { value: 'mute', label: 'Mute' },
                                                    { value: 'kick', label: 'Kick' },
                                                    { value: 'ban', label: 'Ban' }
                                                ]} 
                                                value={p.action} 
                                                onChange={val => updatePunishment(index, 'action', val)} 
                                            />
                                        </div>
                                        {(p.action === 'timeout' || p.action === 'mute') && (
                                            <div className="field-box">
                                                <label className="text-label">Minuti</label>
                                                <input type="number" className="input" value={p.duration} onChange={e => updatePunishment(index, 'duration', parseInt(e.target.value))} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="field-box" style={{ marginTop: '12px' }}>
                                        <label className="text-label">Messaggio</label>
                                        <input className="input" value={p.message || ''} onChange={e => updatePunishment(index, 'message', e.target.value)} placeholder="Messaggio opzionale..." />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* TAB: EXCEPTIONS */}
                {activeTab === 'exceptions' && (
                    <section className="card section-card-v animate fade-in">
                        <div className="align-center" style={{ marginBottom: '24px' }}>
                            <Ghost size={18} color="var(--primary)" />
                            <h3>Canali e Ruoli Ignorati</h3>
                        </div>
                        <div className="fields-stack-v">
                            <div className="field-box">
                                <label className="text-label">Ruoli Esenti</label>
                                <DiscordSelector type="role" multiple options={discordData.roles} value={config.ignoredRoles || []} onChange={v => setConfig({...config, ignoredRoles: v})} />
                                <p className="field-help">Gli utenti con questi ruoli non verranno mai puniti.</p>
                            </div>
                            <div className="field-box" style={{ marginTop: '24px' }}>
                                <label className="text-label">Canali Esenti</label>
                                <DiscordSelector type="channel" multiple options={discordData.channels} value={config.ignoredChannels || []} onChange={v => setConfig({...config, ignoredChannels: v})} />
                                <p className="field-help">La moderazione automatica è disattivata in questi canali.</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* TAB: MESSAGES */}
                {activeTab === 'messages' && (
                    <div className="animate fade-in">
                        <EmbedMessageManager 
                            guildId={guildId}
                            module="moderation"
                            slugs={[
                                { key: 'warn', label: 'Richiamo Ufficiale (Warn)', description: 'Inviato in DM all\'utente richiamato.', variables: ['user', 'reason', 'moderator'], group: '🛡️ Azioni', groupIcon: ShieldAlert },
                                { key: 'timeout', label: 'Isolamento (Timeout)', description: 'Inviato in DM all\'utente messo in isolamento.', variables: ['user', 'duration', 'reason', 'moderator'], group: '🛡️ Azioni', groupIcon: Clock },
                                { key: 'kick', label: 'Espulsione (Kick)', description: 'Inviato in DM all\'utente espulso.', variables: ['user', 'reason', 'moderator'], group: '🛡️ Azioni', groupIcon: AlertTriangle },
                                { key: 'ban', label: 'Esilio Definitivo (Ban)', description: 'Inviato in DM all\'utente bannato.', variables: ['user', 'reason', 'moderator'], group: '🛡️ Azioni', groupIcon: Gavel },
                                { key: 'command_ban', label: 'Risposta Comando Ban', description: 'Risposta effimera/canale al comando /ban.', variables: ['user', 'target', 'reason'], group: '💬 Comandi', groupIcon: MessageSquare },
                                { key: 'command_kick', label: 'Risposta Comando Kick', description: 'Risposta effimera/canale al comando /kick.', variables: ['user', 'target', 'reason'], group: '💬 Comandi', groupIcon: MessageSquare }
                            ]}
                        />
                    </div>
                )}

                {/* Global Config can go into a new tab or at the bottom of Antispam */}
                {activeTab === 'antispam' && (
                    <section className="card section-card-v" style={{ marginTop: '24px' }}>
                        <div className="align-center" style={{ marginBottom: '16px' }}>
                            <Settings2 size={16} color="var(--primary)" />
                            <h3>Configurazione Globale</h3>
                        </div>
                        <div className="field-box">
                            <label className="text-label">Reset Infrazioni (Minuti)</label>
                            <input type="number" className="input" value={config.resetTime || 0} onChange={e => setConfig({...config, resetTime: parseInt(e.target.value)})} />
                            <p className="field-help">Tempo dopo il quale le infrazioni di un utente vengono azzerate.</p>
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

            .status-section { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; margin-bottom: 24px; }
            .section-info { display: flex; align-items: center; gap: 16px; }
            .status-box { width: 40px; height: 40px; background: #1e293b; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); border: 1px solid var(--border); transition: 0.3s; }
            .status-box.on { color: var(--primary); background: rgba(129, 140, 248, 0.1); border-color: rgba(129, 140, 248, 0.2); }

            .tab-navigation { display: flex; gap: 8px; margin-bottom: 32px; padding: 6px; background: #070912; border-radius: 14px; border: 1px solid var(--border); width: fit-content; }
            .tab-link { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border: none; background: transparent; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; border-radius: 10px; cursor: pointer; transition: 0.2s; }
            .tab-link:hover { color: white; background: rgba(255,255,255,0.03); }
            .tab-link.active { color: white; background: var(--bg-card); box-shadow: var(--shadow-sm); border: 1px solid var(--border); }

            .section-title-row { display: flex; justify-content: space-between; align-items: center; }
            .header-with-action { display: flex; justify-content: space-between; align-items: center; }
            
            .btn-add-small { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: 0.2s; }
            
            .add-word-row { display: flex; gap: 12px; }
            .btn-add-word { background: var(--primary); color: white; border: none; border-radius: 8px; width: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
            
            .words-tags-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
            .word-tag { display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid var(--border); font-size: 0.85rem; }
            .word-tag button { background: transparent; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; }
            .word-tag button:hover { color: var(--error); }
            .punishment-item { padding: 16px; background: rgba(255,255,255,0.01); margin-bottom: 12px; border-radius: 12px; border: 1px solid var(--border); }
            .p-item-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
            .p-level-badge { padding: 4px 8px; background: rgba(129, 140, 248, 0.1); color: var(--primary); border-radius: 6px; font-size: 0.65rem; font-weight: 700; }
            .p-item-grid { display: grid; grid-template-columns: 1fr 1.5fr 1fr; gap: 12px; }
            .fields-grid-v { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .align-center { display: flex; align-items: center; gap: 10px; }
        `}</style>
      </div>
    </div>
  );
}
