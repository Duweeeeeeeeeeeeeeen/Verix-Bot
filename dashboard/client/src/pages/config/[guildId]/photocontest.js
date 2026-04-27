import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
    Save, Camera, Clock, Settings2, RefreshCcw, Power, Palette, 
    Bell, Trophy, Zap, Info, Calendar, Layout as LayoutIcon, ChevronRight,
    Shield, Target, Image, MousePointer2, Sparkles, FileText, List, Play, CheckCircle2, XCircle,
    Plus, Trash2
} from 'lucide-react';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import api from '../../../utils/api';
import DiscordSelector from '../../../components/DiscordSelector';
import EmbedMessageManager from '../../../components/EmbedMessageManager';
import EmbedEditor from '../../../components/EmbedEditor';
import EmojiInput from '../../../components/EmojiInput';
import CustomSelect from '../../../components/CustomSelect';
import { mergeConfig } from '../../../utils/defaults';

export default function PhotoContestConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');

   const [roles, setRoles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState({});
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.request(`/messages/${guildId}/photocontest`);
      setMessages(res.data || res || {});
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (guildId && mounted) {
      fetchMessages();
      api.request(`/config/${guildId}/photocontest`)
        .then(data => {
          const moduleConfig = mergeConfig(data.data || data, 'photocontest');
          setConfig(moduleConfig);
          setLoading(false);
        })
        .catch(() => setLoading(false));
      
      api.request(`/config/${guildId}/discord-data`)
        .then(res => {
            setRoles(res?.data?.roles || res?.roles || []);
            setChannels(res?.data?.channels || res?.channels || []);
        });
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
      await Promise.all([
        api.request(`/config/${guildId}/photocontest`, { method: 'POST', body: JSON.stringify(config) }),
        api.request(`/messages/${guildId}/photocontest`, { method: 'POST', body: JSON.stringify(messages) })
      ]);
      showToast('Configurazione salvata!');
    } catch (error) {
      showToast('Errore salvataggio.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Vuoi davvero ripristinare?')) return;
    try {
        await api.request(`/config/${guildId}/reset/photocontest`, { method: 'POST' });
        window.location.reload();
    } catch (error) {}
  };

  const handleForceStart = async () => {
    setStarting(true);
    try {
        const res = await api.request(`/config/${guildId}/photocontest/force-start`, { method: 'POST' });
        showToast('Contest avviato!');
    } catch (error) {
        showToast('Errore avvio.', 'error');
    } finally { setStarting(false); }
  };

  const handleForceEnd = async () => {
    if(!confirm("Vuoi terminare il contest?")) return;
    setEnding(true);
    try {
        await api.request(`/config/${guildId}/photocontest/force-end`, { method: 'POST' });
        showToast('Contest terminato!');
    } catch (error) {
        showToast('Errore termine.', 'error');
    } finally { setEnding(false); }
  };

  if (!mounted || loading || !config) return <Skeleton type="config" />;

  return (
    <div className="config-page-layout animate">
      <div className="config-main-col">
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Camera size={24} />
              </div>
              <div className="header-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h1>Photo Contest</h1>
                  <label className="toggle-mini" title={config.enabled ? 'Modulo Attivo' : 'Modulo Disattivato'}>
                    <input type="checkbox" checked={!!config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                    <span className="slider-mini"></span>
                  </label>
                </div>
                <p>Automatizza sfide fotografiche e premia i migliori cittadini.</p>
              </div>
           </div>
           <div className="header-buttons-grid">
              <button onClick={handleForceEnd} className="btn-outline" style={{ color: 'var(--error)' }} disabled={ending}>
                <Clock size={16} /> Termina
              </button>
              <button onClick={handleForceStart} className="btn-outline" style={{ color: 'var(--success)' }} disabled={starting}>
                <Zap size={16} /> Avvia Ora
              </button>
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Salvataggio...' : 'Salva'}
              </button>
           </div>
        </header>

        <div className="tab-navigation">
            <button onClick={() => setActiveTab('settings')} className={`tab-link ${activeTab === 'settings' ? 'active' : ''}`}>
                <Settings2 size={16} />
                <span>Configurazione</span>
            </button>
            <button onClick={() => setActiveTab('themes')} className={`tab-link ${activeTab === 'themes' ? 'active' : ''}`}>
                <Image size={16} />
                <span>Temi</span>
            </button>
            <button onClick={() => setActiveTab('design')} className={`tab-link ${activeTab === 'design' ? 'active' : ''}`}>
                <Palette size={16} />
                <span>Design & Messaggi</span>
            </button>
        </div>

        <div className="tab-panel animate">
            {activeTab === 'settings' && (
                <div className="config-single-col-p animate fade-in">
                    <section className="card section-card-p" style={{ marginBottom: '24px' }}>
                        <h3 className="align-center"><Target size={18} color="var(--primary)" /> Destinazioni</h3>
                        <div className="fields-grid-p">
                            <div className="field-box">
                                <label className="text-label">Canale Contest</label>
                                <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.channelId || ''} onChange={val => setConfig({...config, channelId: val})} />
                            </div>
                            <div className="field-box">
                                <label className="text-label">Hall of Fame</label>
                                <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.hallOfFameChannelId || ''} onChange={val => setConfig({...config, hallOfFameChannelId: val})} />
                            </div>
                            <div className="field-box">
                                <label className="text-label">Ruolo Vincitore</label>
                                <DiscordSelector type="role" options={roles} value={config.prizeRoleId || ''} onChange={val => setConfig({...config, prizeRoleId: val})} />
                            </div>
                            <div className="field-box">
                                <label className="text-label">Intervallo (Ore)</label>
                                <input type="number" className="input" value={config.interval || 1} onChange={(e) => setConfig({...config, interval: parseInt(e.target.value) || 1})} />
                            </div>
                        </div>
                    </section>

                    <section className="card section-card-p">
                        <h3 className="align-center"><Shield size={18} color="var(--primary)" /> Autorizzazioni Staff</h3>
                        <div className="field-box" style={{ marginTop: '16px' }}>
                            <DiscordSelector type="role" multiple={true} options={roles} value={config.staffRoleIds || []} onChange={val => setConfig({...config, staffRoleIds: val})} />
                            <p className="field-help">I ruoli selezionati potranno forzare l'avvio o il termine del contest.</p>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'themes' && (
                <div className="animate fade-in">
                    <section className="card status-card-p" style={{ marginBottom: '24px' }}>
                         <div className="status-info-p">
                            <div className={`status-box-p ${config.automaticThemes ? 'on' : ''}`}>
                                <Zap size={20} />
                            </div>
                            <h3>Rotazione Automatica</h3>
                        </div>
                        <label className="toggle">
                            <input type="checkbox" checked={!!config.automaticThemes} onChange={e => setConfig({...config, automaticThemes: e.target.checked})} />
                            <span className="slider"></span>
                        </label>
                    </section>

                    <section className="card section-card-p">
                        <div className="section-header-p" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 className="align-center" style={{ margin: 0 }}><List size={18} color="var(--primary)" /> Lista Argomenti</h3>
                            <button className="btn-outline-sm" onClick={() => setConfig({...config, themesList: [...(config.themesList || []), '']})}>
                                <Plus size={14} /> Aggiungi
                            </button>
                        </div>
                        
                        <div className="themes-grid-p">
                            {config.themesList && config.themesList.length > 0 ? (
                                config.themesList.map((theme, idx) => (
                                    <div key={idx} className="theme-item-p animate fade-in">
                                        <div className="theme-index">{idx + 1}</div>
                                        <input 
                                            className="input-transparent-p" 
                                            value={theme} 
                                            onChange={e => {
                                                const newThemes = [...config.themesList];
                                                newThemes[idx] = e.target.value;
                                                setConfig({...config, themesList: newThemes});
                                            }}
                                            placeholder="Inserisci argomento..."
                                        />
                                        <button className="btn-icon-danger-sm" onClick={() => {
                                            const newThemes = config.themesList.filter((_, i) => i !== idx);
                                            setConfig({...config, themesList: newThemes});
                                        }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-themes-p">
                                    <Camera size={32} />
                                    <p>Nessun argomento configurato. Aggiungine uno!</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'design' && (
                <div className="animate fade-in">
                     <section className="card section-card-p" style={{ marginBottom: '24px' }}>
                        <h4 className="align-center"><MousePointer2 size={18} color="var(--primary)" /> Bottoni di Partecipazione</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                            <div className="field-box">
                                <label className="text-label">Bottone "Partecipa"</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: '8px' }}>
                                    <EmojiInput className="input" value={config.submitLabel || 'Invia Foto 📸'} onChange={e => setConfig({...config, submitLabel: e.target.value})} />
                                    <EmojiInput className="input" value={config.submitEmoji || '📸'} onChange={e => setConfig({...config, submitEmoji: e.target.value})} />
                                </div>
                            </div>
                            <div className="field-box">
                                <label className="text-label">Bottone "Vota"</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: '8px' }}>
                                    <EmojiInput className="input" value={config.voteLabel || 'Vota ⭐️'} onChange={e => setConfig({...config, voteLabel: e.target.value})} />
                                    <EmojiInput className="input" value={config.voteEmoji || '⭐️'} onChange={e => setConfig({...config, voteEmoji: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <EmbedMessageManager 
                        guildId={guildId}
                        module="photocontest"
                        slugs={[
                            { key: 'panel', label: 'Pannello Contest', description: 'Messaggio principale del concorso nel canale dedicato.', variables: ['themes'], group: '1. Contest', groupIcon: Camera },
                            { key: 'submission_confirmed', label: 'Conferma Invio', description: 'Risposta effimera mostrata all\'utente quando carica una foto.', variables: [], group: '1. Contest', groupIcon: CheckCircle2 },
                            { key: 'vote_up', label: 'Voto Aggiunto', description: 'Risposta effimera mostrata al click del voto.', variables: ['user'], group: '2. Voti', groupIcon: Trophy },
                            { key: 'interaction_notify', label: 'Notifica Autore (DM)', description: 'Messaggio privato per l\'autore quando la sua foto viene votata.', variables: ['voter', 'action'], group: '3. DM', groupIcon: Bell },
                            { key: 'leaderboard_display', label: 'Classifica (Comando)', description: 'Messaggio mostrato dal comando /leaderboard.', variables: ['ranking'], group: '🏆 Risultati', groupIcon: Trophy },
                            { key: 'contest_end_log', label: 'Proclamazione Vincitore', description: 'Messaggio finale inviato in Hall of Fame con il vincitore.', variables: ['user', 'votes'], group: '🏆 Risultati', groupIcon: Trophy },
                            { key: 'staff_log', label: 'Log Nuova Opera', description: 'Alert staff quando viene caricata una foto (se configurato).', variables: ['user'], group: '🛡️ Staff', groupIcon: Shield },
                            { key: 'already_submitted', label: 'Errore Limite Invio', description: 'Mostrato se l\'utente tenta di inviare più di una foto.', variables: ['user'], group: '🟥 Errori', groupIcon: Zap },
                            { key: 'error_no_participants', label: 'Errore Partecipanti', description: 'Mostrato se il contest termina senza partecipanti.', variables: [], group: '🟥 Errori', groupIcon: XCircle },
                            { key: 'leaderboard_error', label: 'Errore Classifica', description: 'Mostrato se il comando classifica fallisce.', variables: [], group: '🟥 Errori', groupIcon: XCircle }
                        ]}
                        extraButtons={(slug) => {
                            if (slug === 'panel') {
                                return [
                                    { label: config.submitLabel || 'Invia Foto 📸', emoji: config.submitEmoji || '📸', style: 'PRIMARY' },
                                    { label: config.voteLabel || 'Vota ⭐️', emoji: config.voteEmoji || '⭐️', style: 'SUCCESS' }
                                ];
                            }
                            return null;
                        }}
                    />
                </div>
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

            .config-grid-p { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
            .grid-main-p { display: flex; flex-direction: column; gap: 24px; }
            .status-card-p { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; }
            .status-info-p { display: flex; align-items: center; gap: 16px; }
            .status-box-p { width: 40px; height: 40px; background: #1e293b; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); border: 1px solid var(--border); transition: 0.3s; }
            .status-box-p.on { color: var(--primary); background: rgba(129, 140, 248, 0.1); border-color: rgba(129, 140, 248, 0.2); }
            
            .header-buttons-grid { display: flex; gap: 10px; }
            .fields-grid-p { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 16px; }

            .themes-grid-p { display: flex; flex-direction: column; gap: 10px; }
            .theme-item-p { display: flex; align-items: center; gap: 12px; padding: 10px 16px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 12px; transition: 0.2s; }
            .theme-item-p:hover { background: rgba(255,255,255,0.04); border-color: var(--primary); }
            .theme-index { width: 24px; height: 24px; background: rgba(99, 102, 241, 0.1); color: var(--primary); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; flex-shrink: 0; }
            .input-transparent-p { flex: 1; background: transparent; border: none; color: white; font-weight: 600; font-size: 0.9rem; padding: 4px 0; }
            .input-transparent-p:focus { outline: none; }
            .btn-icon-danger-sm { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; border-radius: 8px; cursor: pointer; transition: 0.2s; }
            .btn-icon-danger-sm:hover { background: #ef4444; color: white; }
            .empty-themes-p { padding: 40px; text-align: center; color: var(--text-dim); opacity: 0.5; display: flex; flex-direction: column; align-items: center; gap: 12px; }

            .align-center { display: flex; align-items: center; gap: 10px; }
            @media (max-width: 1000px) { .config-grid-p { grid-template-columns: 1fr; } .header-buttons-grid { flex-direction: column; } }
        `}</style>
    </div>
  );
}
