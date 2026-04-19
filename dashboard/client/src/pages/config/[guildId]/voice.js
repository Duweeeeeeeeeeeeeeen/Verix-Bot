import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import api from '../../../utils/api';
import { Save, RefreshCcw, Mic2, Users, Search, Play, Plus, Trash2, Shield, User, Clock, Power, Type, MousePointer2, ListFilter, Info } from 'lucide-react';
import DiscordSelector from '../../../components/DiscordSelector';

export default function VoiceConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [globalConfig, setGlobalConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');

  useEffect(() => {
    if (guildId) {
      Promise.all([
        api.request(`/config/${guildId}`),
        api.request(`/config/${guildId}/global`),
        api.request(`/config/${guildId}/discord-data`)
      ]).then(([data, globalData, discordRes]) => {
        let moduleConfig = {};
        if (data?.whitelist?.voiceSettings) {
             moduleConfig = data.whitelist.voiceSettings;
        } else if (data?.voice) {
             moduleConfig = data.voice;
        }

        const globalConfigData = globalData?.data || globalData;
        
        if ((!moduleConfig.staffRoleIds || moduleConfig.staffRoleIds.length === 0) && globalConfigData.adminRoleIds?.length > 0) {
            moduleConfig.staffRoleIds = [...globalConfigData.adminRoleIds];
        }

        setConfig(moduleConfig);
        setGlobalConfig(globalConfigData);
        setChannels(discordRes?.data?.channels || discordRes?.channels || []);
        setRoles(discordRes?.data?.roles || discordRes?.roles || []);
        setLoading(false);
      }).catch(err => {
        console.error("Error loading voice data:", err);
        setLoading(false);
      });
    }
  }, [guildId]);

  const setGlobalNested = (path, value) => {
    const newGlobal = { ...globalConfig };
    const parts = path.split('.');
    let cur = newGlobal;
    for (let i = 0; i < parts.length - 1; i++) {
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
    setGlobalConfig(newGlobal);
  };

  const updateButton = (index, field, value) => {
    const buttons = [...globalConfig.ui.voiceButtons];
    buttons[index] = { ...buttons[index], [field]: value };
    setGlobalNested('ui.voiceButtons', buttons);
  };

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        api.request(`/config/${guildId}/whitelist`, {
          method: 'POST',
          body: JSON.stringify({ voiceSettings: config })
        }),
        api.request(`/config/${guildId}/global`, {
          method: 'POST',
          body: JSON.stringify(globalConfig)
        })
      ]);
      showToast('Configurazione salvata!');
    } catch (error) {
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Vuoi davvero ripristinare?')) return;
    try {
        await api.request(`/config/${guildId}/reset/voice`, { method: 'POST' });
        window.location.reload();
    } catch (error) {}
  };

  if (loading || !config) return <Layout guildId={guildId}><Skeleton height="500px" /></Layout>;
  
  return (
    <Layout guildId={guildId}>
      <div className="animate">
        
        {/* Module Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Mic2 size={24} />
              </div>
              <div className="header-text">
                <h1>Voice Selection</h1>
                <p>Gestione code audio e stanze private per colloqui orali.</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleReset} className="btn-outline">
                <RefreshCcw size={16} /> Reset
              </button>
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
           </div>
        </header>

        {/* Minimal Tab System */}
        <div className="tab-navigation">
            <button onClick={() => setActiveTab('settings')} className={`tab-link ${activeTab === 'settings' ? 'active' : ''}`}>
                <Power size={16} />
                <span>Base</span>
            </button>
            <button onClick={() => setActiveTab('checklist')} className={`tab-link ${activeTab === 'checklist' ? 'active' : ''}`}>
                <ListFilter size={16} />
                <span>Checklist Staff</span>
            </button>
            <button onClick={() => setActiveTab('ui')} className={`tab-link ${activeTab === 'ui' ? 'active' : ''}`}>
                <MousePointer2 size={16} />
                <span>Interface</span>
            </button>
        </div>

        <div className="tab-panel animate">
            
            {activeTab === 'settings' && (
                <div className="config-grid-v">
                    <div className="grid-main-v">
                        <section className="card status-section-v" style={{ marginBottom: '24px' }}>
                            <div className="status-info-v">
                                <div className={`status-box-v ${config.enabled ? 'on' : ''}`}>
                                    <Mic2 size={20} />
                                </div>
                                <div>
                                    <h3>Sistema Vocale</h3>
                                    <p className="text-muted">Abilita la gestione automatica dei colloqui.</p>
                                </div>
                            </div>
                            <label className="toggle">
                                <input type="checkbox" checked={config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                                <span className="slider"></span>
                            </label>
                        </section>

                        <section className="card section-card-v">
                            <h3 className="align-center"><Users size={18} color="var(--primary)" /> Parametri Sessione</h3>
                            <div className="fields-grid-v">
                                <div className="field-box">
                                    <label className="text-label">Canale Join</label>
                                    <DiscordSelector type="channel" options={channels.filter(c => c.type === 2)} value={config.joinChannelId || ''} onChange={val => setConfig({...config, joinChannelId: val})} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">Categoria Temp</label>
                                    <DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.categoryId || ''} onChange={val => setConfig({...config, categoryId: val})} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">Naming Template</label>
                                    <input className="input" value={globalConfig.naming?.voiceChannel || ''} onChange={e => setGlobalNested('naming.voiceChannel', e.target.value)} placeholder="wl-{user}" />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">Max Sessioni</label>
                                    <input type="number" className="input" value={config.maxConcurrent || 5} onChange={e => setConfig({...config, maxConcurrent: parseInt(e.target.value)})} />
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="grid-side-v">
                        <section className="card section-card-v">
                            <h3 className="align-center"><Shield size={18} color="var(--primary)" /> Staff Permission</h3>
                            <div className="field-box" style={{ marginTop: '16px' }}>
                                <label className="text-label">Ruoli Abilitati</label>
                                <DiscordSelector type="role" multiple={true} options={roles} value={config.staffRoleIds || []} onChange={val => setConfig({...config, staffRoleIds: val})} />
                            </div>
                        </section>
                        <div className="card info-box-v" style={{ marginTop: '20px' }}>
                            <Info size={18} color="var(--primary)" />
                            <p>Assicurati che il bot possa <b>Spostare Membri</b> e <b>Gestire Canali</b>.</p>
                        </div>
                    </aside>
                </div>
            )}

            {activeTab === 'checklist' && (
                <section className="card section-card-v animate fade-in">
                    <div className="card-header-v">
                        <h3 className="align-center"><ListFilter size={20} color="var(--primary)" /> Checklist per lo Staff</h3>
                        <button className="btn-outline" onClick={() => setConfig({...config, interviewChecklist: [...(config.interviewChecklist || []), 'Nuovo Punto']})}>
                            <Plus size={14} /> Aggiungi
                        </button>
                    </div>
                    <div className="checklist-stack">
                        {config.interviewChecklist?.map((item, i) => (
                            <div key={i} className="checklist-row-p">
                                <input className="input-v" value={item} onChange={e => {
                                    const newList = [...config.interviewChecklist];
                                    newList[i] = e.target.value;
                                    setConfig({...config, interviewChecklist: newList});
                                }} />
                                <button className="btn-icon-danger" onClick={() => setConfig({...config, interviewChecklist: config.interviewChecklist.filter((_, idx) => idx !== i)})}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {activeTab === 'ui' && (
                <section className="card section-card-v animate fade-in">
                    <h3 className="align-center" style={{ marginBottom: '24px' }}><MousePointer2 size={20} color="var(--primary)" /> Bottoni di Controllo</h3>
                    <div className="buttons-grid-v">
                        {globalConfig.ui?.voiceButtons?.map((btn, idx) => (
                            <div key={btn.customId} className="btn-config-card-v">
                                <div className="btn-v-header">
                                    <span className="btn-v-id">{btn.customId}</span>
                                    <label className="toggle">
                                        <input type="checkbox" checked={btn.enabled} onChange={e => updateButton(idx, 'enabled', e.target.checked)} />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="btn-v-fields">
                                    <input className="input-v" value={btn.label} onChange={e => updateButton(idx, 'label', e.target.value)} />
                                    <input className="input-v emoji" value={btn.emoji} onChange={e => updateButton(idx, 'emoji', e.target.value)} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

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

            .config-grid-v { display: grid; grid-template-columns: 1fr 300px; gap: 24px; }
            .grid-main-v { display: flex; flex-direction: column; gap: 24px; }
            .status-section-v { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; }
            .status-info-v { display: flex; align-items: center; gap: 16px; }
            .status-box-v { width: 40px; height: 40px; background: #1e293b; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); border: 1px solid var(--border); }
            .status-box-v.on { color: var(--primary); background: rgba(129, 140, 248, 0.1); border-color: rgba(129, 140, 248, 0.2); }
            
            .fields-grid-v { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 16px; }
            .info-box-v { padding: 16px; display: flex; flex-direction: column; gap: 10px; font-size: 0.75rem; color: var(--text-muted); }
            
            .card-header-v { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
            .checklist-stack { display: flex; flex-direction: column; gap: 10px; }
            .checklist-row-p { display: flex; gap: 12px; align-items: center; padding: 12px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid var(--border); }
            .input-v { background: #020617; border: 1px solid var(--border); padding: 8px 12px; border-radius: 8px; color: white; flex: 1; font-size: 0.9rem; }
            .input-v.emoji { width: 50px; text-align: center; }

            .buttons-grid-v { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
            .btn-config-card-v { background: rgba(255,255,255,0.02); padding: 16px; border-radius: 14px; border: 1px solid var(--border); }
            .btn-v-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
            .btn-v-id { font-size: 0.65rem; font-weight: 900; color: var(--primary); text-transform: uppercase; }
            .btn-v-fields { display: flex; gap: 8px; }

            .align-center { display: flex; align-items: center; gap: 10px; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .spin { animation: spin 1s linear infinite; }
            @media (max-width: 1000px) { .config-grid-v { grid-template-columns: 1fr; } }
        `}</style>
      </div>
    </Layout>
  );
}
