import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { EmbedEditor, DiscordSelector, CustomSelect } from '../../../components/LazyConfigComponents';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import {
  Save, Palette, Eye, Send, Plus, Trash2, FolderOpen, Zap, Info, Layers, Sparkles, 
  Smartphone, Monitor, Clock, Calendar, ChevronDown, Box, MessageSquare, Lock, Crown, 
  RefreshCw, ChevronLeft, ArrowRight, MousePointer2, LayoutTemplate, Share2, Rocket,
  Target, SendHorizontal
} from 'lucide-react';
import { useT } from '../../../contexts/LanguageContext';
import Head from 'next/head';

export default function EmbedBuilder() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Data State
  const [customTemplates, setCustomTemplates] = useState([]);
  const [channels, setChannels] = useState([]);
  const [guildData, setGuildData] = useState(null);

  // Interaction State
  const [selectedTemplateId, setSelectedTemplateId] = useState('new');
  const [currentEmbed, setCurrentEmbed] = useState({ title: 'Nuovo Progetto', description: '...', color: '#10b981', fields: [] });
  const [customName, setCustomName] = useState('Nuovo Progetto');
  const [selectedChannel, setSelectedChannel] = useState('');

  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  // Scheduling State
  const [scheduleType, setScheduleType] = useState('NOW'); // 'NOW' | 'DELAY' | 'TIME'
  const [delayMinutes, setDelayMinutes] = useState(10);
  const [specificTime, setSpecificTime] = useState('');
  const [recurrence, setRecurrence] = useState('none');

  const loadAllData = async () => {
    if (!guildId || !mounted) return;
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const responses = await Promise.all([
        api.request(`/embeds/${guildId}/templates`),
        api.request(`/embeds/${guildId}/channels`),
        api.request(`/config/${guildId}/guild`)
      ]);

      const [templatesData, channelsData, guildRes] = responses;

      if (guildRes) {
        setGuildData(guildRes.data || guildRes);
      }
      setCustomTemplates(Array.isArray(templatesData) ? templatesData : []);
      setChannels(Array.isArray(channelsData) ? channelsData : []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  useEffect(() => {
    loadAllData();
  }, [guildId, mounted]);

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleTemplateChange = (val) => {
    setSelectedTemplateId(val);

    if (val === 'new') {
      setCurrentEmbed({ title: 'Nuovo Progetto', description: '...', color: '#10b981', fields: [] });
      setCustomName('Nuovo Progetto');
    } else {
      const template = customTemplates.find(t => t._id === val);
      if (template) {
        setCurrentEmbed(template.data);
        setCustomName(template.name);
      }
    }
  };

  const handleSave = async () => {
    const isNew = selectedTemplateId === 'new';
    
    if (isNew && !guildData?.isPremium && customTemplates.length >= 3) {
      showToast("Limite template raggiunto per utenti base", 'error');
      router.push(`/config/${guildId}/premium`);
      return;
    }

    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const saved = await api.request(`/embeds/${guildId}/templates`, {
        method: 'POST',
        body: JSON.stringify({
          id: isNew ? undefined : selectedTemplateId,
          name: customName,
          data: currentEmbed
        })
      });

      if (isNew) {
        setCustomTemplates([...customTemplates, saved]);
        setSelectedTemplateId(saved._id);
      } else {
        setCustomTemplates(customTemplates.map(t => t._id === saved._id ? saved : t));
      }

      showToast("Progetto archiviato con successo!");
    } catch (error) {
        showToast("Errore durante l'archiviazione.", 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleSend = async () => {
    if (!selectedChannel) return showToast("Seleziona un canale di destinazione", 'error');
    setSending(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const payload = {
        channelId: selectedChannel,
        embed: currentEmbed
      };

      if (scheduleType !== 'NOW' || recurrence !== 'none') {
        payload.schedule = {
          type: scheduleType === 'NOW' ? 'TIME' : scheduleType,
          delayMinutes: scheduleType === 'DELAY' ? parseInt(delayMinutes) : undefined,
          specificTime: scheduleType === 'TIME' ? specificTime : (scheduleType === 'NOW' ? new Date().toISOString() : undefined),
          recurrence: recurrence
        };
      }

      const res = await api.request(`/embeds/${guildId}/send`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast(res.message || "Messaggio inviato correttamente!");
    } catch (error) {
        showToast("Errore durante l'invio.", 'error');
    } finally {
      setSending(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  if (!mounted || loading) return <Skeleton height="600px" />;

  const isPremium = guildData?.isPremium;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>Embed Designer Studio | Verix Studio</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #10b981 0%, #065f46 100%)' }}>
                    <LayoutTemplate size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>Embed Studio Pro</h1>
                    <div className={`pc-status-tag-v2 ${isPremium ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {isPremium ? 'MOTORE GRAFICO PREMIUM' : 'DESIGNER STANDARD'}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <div className="pc-channel-box-v2" style={{ width: '280px' }}>
                    <DiscordSelector 
                        type="channel" 
                        options={channels.filter(c => c.type === 0 || c.type === 5)} 
                        value={selectedChannel} 
                        onChange={setSelectedChannel} 
                        placeholder="Canale di Trasmissione" 
                    />
                </div>
                <button className="pc-btn-primary" onClick={handleSend} disabled={sending || !selectedChannel}>
                    <SendHorizontal size={18} className={sending ? 'spin' : ''} />
                    <span>{sending ? 'In Trasmissione...' : 'Lancia Broadcast'}</span>
                </button>
            </div>
        </header>

        <div className="pc-content-v2">
            <div className="pc-studio-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
                <main className="v-stack" style={{ gap: '32px' }}>
                    <section className="pc-card-v2 animate slide-up">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><FolderOpen size={18} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>Libreria Progetti</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 650 }}>Gestisci i tuoi template salvati e carica vecchi progetti.</p>
                            </div>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-library-controls-v2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.5fr', gap: '20px' }}>
                                <div className="pc-input-group-v2">
                                    <label>Origine Template</label>
                                    <CustomSelect 
                                        options={[
                                            { value: 'new', label: '+ Crea Nuovo Progetto' },
                                            ...customTemplates.map(t => ({ value: t._id, label: t.name }))
                                        ]} 
                                        value={selectedTemplateId} 
                                        onChange={handleTemplateChange} 
                                    />
                                </div>
                                <div className="pc-input-group-v2">
                                    <label>Nome Identificativo</label>
                                    <input className="pc-input-modern-v2" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Es: Regolamento Server..." />
                                </div>
                                <div className="pc-input-group-v2" style={{ justifyContent: 'flex-end' }}>
                                    <button className="pc-btn-save-v2" onClick={handleSave} disabled={saving}>
                                        <Save size={18} />
                                        <span>{saving ? '...' : 'Archivia'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="pc-card-v2 animate slide-up" style={{ padding: 0, animationDelay: '0.1s' }}>
                        <div style={{ background: '#f8fafc', padding: '24px 32px', borderBottom: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', borderTopLeftRadius: '32px', borderTopRightRadius: '32px' }}>
                            <div className="header-icon" style={{ background: 'white', color: '#10b981', width: '36px', height: '36px' }}><Palette size={16} /></div>
                            <h4 style={{ margin: 0, fontFamily: 'Inter', fontWeight: 900, color: '#1e293b' }}>Designer Visuale</h4>
                        </div>
                        <div className="pc-editor-wrapper-v2">
                            <EmbedEditor 
                                embed={currentEmbed} 
                                onChange={setCurrentEmbed} 
                                variables={['user', 'guild', 'time', 'date', 'member_count']} 
                                showButtonEditor={true}
                            />
                        </div>
                    </section>
                </main>

                <aside className="v-stack" style={{ gap: '32px' }}>
                    <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: '#fef2f2', color: '#ef4444' }}><Clock size={18} /></div>
                            <h3>Shedulazione Invio</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-schedule-stack-v2" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { id: 'NOW', label: 'Immediato', icon: Zap, desc: 'Senza alcun ritardo' },
                                    { id: 'DELAY', label: 'In Differita', icon: Clock, desc: 'Pausa di sicurezza' },
                                    { id: 'TIME', label: 'Programmato', icon: Calendar, desc: 'Data e ora specifica' }
                                ].map(type => (
                                    <button key={type.id} onClick={() => setScheduleType(type.id)} className={`pc-schedule-tab-v2 ${scheduleType === type.id ? 'active' : ''}`}>
                                        <div className="tab-icon-v2"><type.icon size={18} /></div>
                                        <div className="v-stack">
                                            <span style={{ fontWeight: 950, fontSize: '0.95rem' }}>{type.label}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>{type.desc}</span>
                                        </div>
                                        {scheduleType === type.id && <div className="active-glow-v2"></div>}
                                    </button>
                                ))}
                            </div>

                            {scheduleType === 'DELAY' && (
                                <div className="pc-input-group-v2 animate slide-up" style={{ marginTop: '24px' }}>
                                    <label>Ritardo in Minuti</label>
                                    <input type="number" className="pc-input-modern-v2" value={delayMinutes} onChange={e => setDelayMinutes(e.target.value)} />
                                </div>
                            )}
                            
                            {scheduleType === 'TIME' && (
                                <div className="pc-input-group-v2 animate slide-up" style={{ marginTop: '24px' }}>
                                    <label>Timestamp Programmato</label>
                                    <input type="datetime-local" className="pc-input-modern-v2" value={specificTime} onChange={e => setSpecificTime(e.target.value)} />
                                </div>
                            )}

                            <div className="pc-recurrence-studio-v2" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1.5px dashed #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <RefreshCw size={14} color="#6366f1" />
                                    <label style={{ fontSize: '0.75rem', fontWeight: 950, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Ricorrenza</label>
                                </div>
                                <CustomSelect 
                                    options={[
                                        { value: 'none', label: 'Invio Singolo' },
                                        { value: 'daily', label: 'Ogni 24 Ore' },
                                        { value: 'weekly', label: 'Ogni Settimana' },
                                        { value: 'monthly', label: 'Ogni Mese' }
                                    ]} 
                                    value={recurrence} 
                                    onChange={setRecurrence} 
                                />
                                <div className="pc-info-badge-v2" style={{ marginTop: '16px', background: '#f5f3ff', color: '#6366f1', padding: '12px 16px', borderRadius: '14px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Sparkles size={14} />
                                    <span>{recurrence !== 'none' ? 'Modalità Ciclica Attivata' : 'Esecuzione One-Shot'}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="pc-alert-box-v2" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', borderRadius: '32px', padding: '28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Target size={20} color="#10b981" />
                            <span style={{ fontWeight: 950, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Smart Preview</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, fontWeight: 700 }}>
                            Il trasmettitore Verix supporta placeholder dinamici. Usa <code>{'{user}'}</code> per menzionare chi invia o <code>{'{guild}'}</code> per il nome del server.
                        </p>
                    </div>
                </aside>
            </div>
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 40px; max-width: 1600px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: white; padding: 32px; border-radius: 32px; box-shadow: var(--shadow-premium); border: 1px solid var(--border-light); }
            .header-info { display: flex; align-items: center; gap: 24px; }
            .pc-icon-box { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 12px 24px rgba(16, 185, 129, 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Inter', sans-serif; font-size: 2.2rem; font-weight: 900; margin: 0; color: #1e293b; letter-spacing: -0.5px; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 900; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px; }
            .pc-status-tag-v2.on { background: #ecfdf5; color: #10b981; }
            .pc-status-tag-v2.off { background: #f1f5f9; color: #94a3b8; }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: white; border: none; padding: 16px 32px; border-radius: 18px; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.3s; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.2); }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(99, 102, 241, 0.3); }

            .pc-btn-save-v2 { background: #f8fafc; color: #1e293b; border: 1.5px solid #e2e8f0; padding: 12px 24px; border-radius: 16px; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; width: 100%; height: 56px; justifyContent: center; }
            .pc-btn-save-v2:hover { background: white; border-color: var(--primary); color: var(--primary); }

            /* Card V2 */
            .pc-card-v2 { background: white; border: 1px solid var(--border-light); border-radius: 32px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; }
            .header-icon { width: 52px; height: 52px; background: #ecfdf5; color: #10b981; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.5rem; font-weight: 950; color: #1e293b; }

            /* Schedule Tabs V2 */
            .pc-schedule-tab-v2 { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 20px; cursor: pointer; transition: 0.3s; position: relative; text-align: left; width: 100%; }
            .pc-schedule-tab-v2:hover { border-color: #cbd5e1; background: white; }
            .pc-schedule-tab-v2.active { border-color: #ef4444; background: #fef2f2; }
            .tab-icon-v2 { width: 44px; height: 44px; background: white; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #94a3b8; border: 1.5px solid #e2e8f0; }
            .pc-schedule-tab-v2.active .tab-icon-v2 { color: #ef4444; border-color: #fecaca; }
            .active-glow-v2 { position: absolute; right: 20px; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 12px #ef4444; }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; }
            .pc-input-modern-v2 { width: 100%; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 14px 20px; font-weight: 800; color: #1e293b; outline: none; transition: 0.2s; font-size: 1rem; }
            .pc-input-modern-v2:focus { border-color: #10b981; background: white; }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-schedule-tab-v2, :global(.light-theme) .pc-btn-save-v2 { background: #ffffff !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
