import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import api from '../../../utils/api';
import { Save, RefreshCcw, Mic2, Users, Search, Play, Plus, Trash2, Shield, User, Clock, Power } from 'lucide-react';
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

        // Role Inheritance: If local roles are empty, pre-fill from global admin roles
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
      showToast('Configurazione Vocale e impostazioni globali salvate!');
    } catch (error) {
       showToast('Errore durante il salvataggio.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Vuoi davvero ripristinare i valori predefiniti per la coda vocale?')) return;
    try {
        await api.request(`/config/${guildId}/reset/voice`, { 
            method: 'POST'
        });
        window.location.reload();
    } catch (error) {
        // Global toast handles errors
    }
  };

  if (loading && !config) return (
    <Layout guildId={guildId}>
      <div className="animate">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
             <Skeleton width="400px" height="40px" style={{ marginBottom: '12px' }} />
             <div style={{ display: 'flex', gap: '12px' }}>
                <Skeleton width="120px" height="45px" />
                <Skeleton width="180px" height="45px" />
             </div>
        </div>
        <Skeleton height="200px" style={{ marginBottom: '30px', borderRadius: '20px' }} />
        <Skeleton height="400px" style={{ borderRadius: '20px' }} />
      </div>
    </Layout>
  );
  
  return (
    <Layout guildId={guildId}>
      <div className="animate">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <div className="align-center" style={{ color: 'var(--primary)', marginBottom: '8px' }}>
                <Mic2 size={18} fill="currentColor" />
                <span className="text-label" style={{ marginBottom: 0 }}>Sistemi Audio</span>
            </div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-1.5px' }}>Voice Whitelist</h1>
            <p className="text-description" style={{ fontSize: '1.1rem' }}>Gestisci i colloqui vocali, le code e i canali temporanei.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleReset} className="btn-danger">
                <RefreshCcw size={18} /> Reset
            </button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={18} className={saving ? 'spin' : ''} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </header>

        <div className="card glass-heavy status-card" style={{ marginBottom: '40px' }}>
            <div className="align-center" style={{ gap: '15px' }}>
                <div className={`status-icon ${config.enabled ? 'active' : ''}`} style={{ display: 'flex' }}>
                    <Power size={22} />
                </div>
                <div>
                    <span style={{ fontWeight: '800', fontSize: '1rem', display: 'block' }}>Modulo Attivo</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Abilita o disabilita il sistema voice whitelist.</span>
                </div>
            </div>
            <label className="toggle">
                <input type="checkbox" checked={config.enabled} onChange={(e) => setConfig({...config, enabled: e.target.checked})} />
                <span className="slider"></span>
            </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '32px' }}>
            <section className="card glass" style={{ padding: '30px' }}>
                <div className="align-center" style={{ marginBottom: '24px' }}>
                    <Users size={22} color="var(--primary)" />
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Parametri Sessione</h3>
                    <HelpTooltip text="Configura dove gli utenti devono unirsi e la gestione canali." />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                   <div className="input-group">
                      <label className="text-label">Canale d'Attesa <HelpTooltip text="Il canale vocale pubblico dove gli utenti attendono lo staffer." /></label>
                      <DiscordSelector 
                        type="channel" 
                        options={channels.filter(c => c.type === 2)} 
                        value={config?.joinChannelId || ''} 
                        onChange={val => setConfig({...config, joinChannelId: val})} 
                      />
                   </div>
                   <div className="input-group">
                      <label className="text-label">Categoria Canali <HelpTooltip text="La categoria dove verranno creati i canali privati temporanei." /></label>
                      <DiscordSelector 
                        type="channel" 
                        options={channels.filter(c => c.type === 4)} 
                        value={config?.categoryId || ''} 
                        onChange={val => setConfig({...config, categoryId: val})} 
                      />
                   </div>
                   <div className="input-group">
                      <label className="text-label">Sessioni Simultanee <HelpTooltip text="Quanti canali di colloquio il bot può gestire contemporaneamente." /></label>
                      <input type="number" className="input" value={config?.maxConcurrent || 5} onChange={(e) => setConfig({...config, maxConcurrent: parseInt(e.target.value)})} />
                   </div>
                </div>
            </section>

            <section className="card glass" style={{ padding: '30px' }}>
                <div className="align-center" style={{ marginBottom: '24px' }}>
                    <Shield size={22} color="var(--primary)" />
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Ruoli & Permessi</h3>
                    <HelpTooltip text="Definisci chi può gestire i colloqui vocali." />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="input-group">
                        <label className="text-label">Ruoli Staff Voice</label>
                        <DiscordSelector 
                            type="role" 
                            multiple={true} 
                            options={roles} 
                            value={config?.staffRoleIds || []} 
                            onChange={val => setConfig({...config, staffRoleIds: val})} 
                        />
                        <p className="text-description" style={{ fontSize: '0.8rem', marginTop: '8px' }}>
                            Se vuoto, erediterà automaticamente i ruoli Amministratori definiti nelle impostazioni globali.
                        </p>
                    </div>
                </div>
            </section>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '32px' }}>
            <section className="card glass" style={{ padding: '30px' }}>
                <div className="align-center" style={{ marginBottom: '24px' }}>
                    <Type size={22} color="var(--primary)" />
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Naming & Logging</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="input-group">
                        <label className="text-label">Template Nome Canale Vocale</label>
                        <input 
                            className="input" 
                            value={globalConfig.naming?.voiceChannel || ''} 
                            onChange={e => setGlobalNested('naming.voiceChannel', e.target.value)} 
                            placeholder="wl-{user}"
                        />
                        <p className="text-description" style={{ fontSize: '0.75rem' }}>Variabili: {'{user}'}</p>
                    </div>
                    <div className="divider" style={{ background: 'var(--border)', height: '1px', margin: '10px 0' }}></div>
                    <div className="input-group">
                        <label className="text-label">Eventi Logging Vocale</label>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <label className="toggle" style={{ transform: 'scale(0.8)' }}>
                                <input type="checkbox" checked={globalConfig.logs?.log_onVoiceStart} onChange={e => setGlobalNested('logs.log_onVoiceStart', e.target.checked)} />
                                <span className="slider"></span>
                            </label>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Inizio Sessione</span>
                            <label className="toggle" style={{ transform: 'scale(0.8)' }}>
                                <input type="checkbox" checked={globalConfig.logs?.log_onVoiceEnd} onChange={e => setGlobalNested('logs.log_onVoiceEnd', e.target.checked)} />
                                <span className="slider"></span>
                            </label>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Fine Sessione</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="card glass" style={{ padding: '30px' }}>
                <div className="align-center" style={{ marginBottom: '24px' }}>
                    <MousePointer2 size={22} color="var(--primary)" />
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Bottoni Gestione</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {globalConfig.ui?.voiceButtons?.map((btn, idx) => (
                        <div key={btn.customId} style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-dim)' }}>{btn.customId}</span>
                                <label className="toggle" style={{ transform: 'scale(0.7)' }}>
                                    <input type="checkbox" checked={btn.enabled} onChange={e => updateButton(idx, 'enabled', e.target.checked)} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input className="input" style={{ padding: '6px 10px', fontSize: '0.8rem' }} value={btn.label} onChange={e => updateButton(idx, 'label', e.target.value)} />
                                <input className="input" style={{ width: '45px', padding: '6px', textAlign: 'center' }} value={btn.emoji} onChange={e => updateButton(idx, 'emoji', e.target.value)} />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>

        <section className="card glass" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
               <div className="align-center">
                  <ListFilter size={22} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Interview Checklist</h3>
                  <HelpTooltip text="Punti chiave da verificare durante il colloquio." />
               </div>
               <button 
                 onClick={() => setConfig({...config, interviewChecklist: [...(config?.interviewChecklist || []), 'Nuovo Punto']})}
                 className="btn-outline"
                 style={{ padding: '10px 20px', fontSize: '0.9rem' }}
               >
                   <Plus size={18} /> Aggiungi Punto
               </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {config?.interviewChecklist?.map((item, i) => (
                 <div key={i} className="checklist-item">
                    <input 
                       type="text" 
                       className="input" 
                       value={item} 
                       onChange={(e) => {
                         const newList = [...config.interviewChecklist];
                         newList[i] = e.target.value;
                         setConfig({...config, interviewChecklist: newList});
                       }}
                       placeholder="Es: Conoscenza Regolamento RP"
                    />
                    <button 
                      onClick={() => setConfig({...config, interviewChecklist: config.interviewChecklist.filter((_, idx) => idx !== i)})}
                      className="btn-icon-delete"
                    >
                       <Trash2 size={20} />
                    </button>
                 </div>
               ))}
               {(!config || !config.interviewChecklist || config.interviewChecklist.length === 0) && (
                   <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px', background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px dashed var(--border)' }}>Nessun punto nella checklist.</p>
               )}
            </div>
        </section>

        <div className="card" style={{ marginTop: '30px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', gap: '12px' }}>
            <Info size={20} color="var(--accent)" />
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                <b>Nota:</b> Assicurati che il bot abbia i permessi di <b>Gestire Canali</b> e <b>Spostare Membri</b> per il corretto funzionamento.
            </p>
        </div>
      </div>

      <style jsx>{`
        .checklist-item {
            display: flex;
            gap: 12px;
            align-items: center;
            background: rgba(255,255,255,0.02);
            padding: 12px;
            border-radius: 14px;
            border: 1px solid var(--border);
            transition: var(--transition-fast);
        }
        .checklist-item:hover {
            background: rgba(255,255,255,0.04);
            border-color: var(--primary);
        }
        .btn-icon-delete {
            background: rgba(239, 68, 68, 0.05);
            border: none;
            color: var(--error);
            padding: 10px;
            border-radius: 10px;
            cursor: pointer;
            transition: var(--transition-fast);
        }
        .btn-icon-delete:hover {
            background: var(--error);
            color: white;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Layout>
  );
}
