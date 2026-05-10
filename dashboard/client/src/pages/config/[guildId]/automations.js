import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, Trash2, Plus, Clock, Zap, Layout, Power, X, Hash, MessageSquare, Send, MousePointer2, 
    Settings2, Palette, ChevronLeft, Monitor, Smartphone, Lock, ArrowRight, ChevronRight, 
    Trash, CheckCircle2, AlertCircle, Globe, Cpu, Sparkles, Box, Activity, Info, Timer, MessageCircle, Star,
    Terminal, Layers, Shield, RefreshCcw
} from 'lucide-react';
import { DiscordSelector, EmbedEditor, CustomSelect } from '../../../components/LazyConfigComponents';
import Head from 'next/head';

export default function AutomationsConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('autoclear');
  const [guildData, setGuildData] = useState(null);
  const [editingEmbedIndex, setEditingEmbedIndex] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
      fetchData();
    }
  }, [guildId, mounted]);

  const fetchData = async () => {
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [configRes, discordRes, guildRes] = await Promise.all([
        api.request(`/config/${guildId}/automations`).catch(() => ({ autoClear: { slots: [] }, autoMessage: { slots: [] } })),
        api.request(`/config/${guildId}/discord-data`).catch(() => ({ channels: [] })),
        api.request(`/config/${guildId}/guild`).catch(() => ({ isPremium: false }))
      ]);
      
      setConfig(configRes.data || configRes);
      setChannels(discordRes.channels || discordRes.data?.channels || []);
      setGuildData(guildRes.data || guildRes);
    } catch (error) {
      console.error("Automations load error:", error);
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/automations`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast("Configurazione Automazioni applicata!");
    } catch (error) {
      showToast("Errore durante il salvataggio.", 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const addClearSlot = () => {
    if (!guildData?.isPremium && (config.autoClear?.slots || []).length >= 5) {
      showToast("Limite slot raggiunto per utenti gratuiti!", 'error');
      return;
    }
    const newSlots = [...(config.autoClear?.slots || []), { id: `slot_${Date.now()}`, channelId: '', intervalMinutes: 60, amount: 100, enabled: true }];
    setConfig({ ...config, autoClear: { ...config.autoClear, slots: newSlots } });
  };

  const removeClearSlot = (index) => {
    const newSlots = config.autoClear.slots.filter((_, i) => i !== index);
    setConfig({ ...config, autoClear: { ...config.autoClear, slots: newSlots } });
  };

  const updateClearSlot = (index, field, value) => {
    const newSlots = [...config.autoClear.slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setConfig({ ...config, autoClear: { ...config.autoClear, slots: newSlots } });
  };

  const addMessageSlot = () => {
    if (!guildData?.isPremium && (config.autoMessage?.slots || []).length >= 5) {
      showToast("Limite broadcast raggiunto per utenti gratuiti!", 'error');
      return;
    }
    const newSlots = [...(config.autoMessage?.slots || []), { 
        id: `msg_${Date.now()}`, 
        channelId: '', 
        content: '', 
        triggerType: 'TIME', 
        triggerValue: 60, 
        enabled: true,
        useEmbed: false,
        embed: {}
    }];
    setConfig({ ...config, autoMessage: { ...config.autoMessage, slots: newSlots } });
  };

  const removeMessageSlot = (index) => {
    const newSlots = config.autoMessage.slots.filter((_, i) => i !== index);
    setConfig({ ...config, autoMessage: { ...config.autoMessage, slots: newSlots } });
  };

  const updateMessageSlot = (index, field, value) => {
    const newSlots = [...config.autoMessage.slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setConfig({ ...config, autoMessage: { ...config.autoMessage, slots: newSlots } });
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  const isPremium = guildData?.isPremium;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>Automazioni Studio | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}>
                    <Cpu size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>Automazioni Studio</h1>
                    <div className={`pc-status-tag-v2 ${isPremium ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {isPremium ? 'POTENZA PREMIUM ATTIVA' : 'ACCESSO STANDARD'}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? 'Applicazione...' : 'Salva Studio'}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-container-v2" style={{ marginBottom: '40px' }}>
            <div className="pc-tabs-v2">
                <button className={activeTab === 'autoclear' ? 'active' : ''} onClick={() => setActiveTab('autoclear')}>
                    <Trash2 size={16} /> <span>Auto-Clear Hub</span>
                    {(config.autoClear?.slots || []).length > 0 && <span className="tab-count-v2">{(config.autoClear?.slots || []).length}</span>}
                </button>
                <button className={activeTab === 'automessage' ? 'active' : ''} onClick={() => setActiveTab('automessage')}>
                    <RefreshCcw size={16} /> <span>Broadcast Studio</span>
                    {(config.autoMessage?.slots || []).length > 0 && <span className="tab-count-v2">{(config.autoMessage?.slots || []).length}</span>}
                </button>
            </div>
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'autoclear' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    {!isPremium && (
                        <div className="pc-premium-banner-v2 animate slide-up">
                            <Star size={20} style={{ color: '#d97706' }} />
                            <div style={{ flex: 1 }}>
                                <strong style={{ display: 'block', fontSize: '1rem', color: '#1e293b' }}>Ottimizza la tua Infrastruttura</strong>
                                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Passa a Premium per sbloccare slot illimitati e intervalli di pulizia sotto i 60 minuti.</span>
                            </div>
                            <button className="pc-btn-upgrade-v2" onClick={() => router.push(`/config/${guildId}/premium`)}>Upgrade</button>
                        </div>
                    )}
                    
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: '#fef2f2', color: '#ef4444' }}><Trash2 size={18} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>Canali in Auto-Pulizia</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 650 }}>Mantieni il tuo server pulito eliminando automaticamente messaggi obsoleti.</p>
                            </div>
                            <button className="pc-btn-add-v2" onClick={addClearSlot}>
                                <Plus size={18} /> <span>Nuovo Canale</span>
                            </button>
                        </div>
                        <div className="card-body-v2">
                            <div className="v-stack" style={{ gap: '28px' }}>
                                {(config.autoClear?.slots || []).map((slot, index) => (
                                    <div key={slot.id} className="pc-sub-card-v2 animate slide-up" style={{ background: '#f8fafc', padding: '32px', borderRadius: '28px', border: '1.5px solid #e2e8f0', position: 'relative' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', borderBottom: '1.5px dashed #e2e8f0', paddingBottom: '24px' }}>
                                            <div style={{ width: '48px', height: '48px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}><Hash size={20} /></div>
                                            <div className="v-stack">
                                                <h4 style={{ margin: 0, fontWeight: 950, fontSize: '1.1rem', color: '#1e293b' }}>Slot Pulizia #{index + 1}</h4>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Engine Config</span>
                                            </div>
                                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                <div className="pc-status-tag-mini-v2" style={{ background: slot.enabled ? '#ecfdf5' : '#f1f5f9', color: slot.enabled ? '#10b981' : '#94a3b8' }}>{slot.enabled ? 'ATTIVO' : 'PAUSA'}</div>
                                                <label className="pc-toggle-v2 mini">
                                                    <input type="checkbox" checked={!!slot.enabled} onChange={e => updateClearSlot(index, 'enabled', e.target.checked)} />
                                                    <span className="pc-slider-v2"></span>
                                                </label>
                                                <button onClick={() => removeClearSlot(index)} className="pc-btn-delete-mini"><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                        
                                        <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '28px' }}>
                                            <div className="pc-input-group-v2">
                                                <label>Seleziona Canale</label>
                                                <DiscordSelector 
                                                    type="channel" 
                                                    options={channels.filter(c => c.type === 0 || c.type === 5)} 
                                                    value={slot.channelId || ''} 
                                                    onChange={val => updateClearSlot(index, 'channelId', val)} 
                                                />
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>Intervallo (Minuti)</label>
                                                <div className="pc-input-wrapper-v2" style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '16px' }}>
                                                    <Timer size={18} style={{ marginLeft: '16px', color: '#94a3b8' }} />
                                                    <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '16px', fontWeight: 850, color: '#1e293b' }} value={slot.intervalMinutes || 60} onChange={e => updateClearSlot(index, 'intervalMinutes', parseInt(e.target.value))} />
                                                </div>
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>Messaggi per Ciclo</label>
                                                <div className="pc-input-wrapper-v2" style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '16px' }}>
                                                    <Layers size={18} style={{ marginLeft: '16px', color: '#94a3b8' }} />
                                                    <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '16px', fontWeight: 850, color: '#1e293b' }} value={slot.amount || 100} onChange={e => updateClearSlot(index, 'amount', parseInt(e.target.value))} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(config.autoClear?.slots || []).length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '120px 20px', color: '#94a3b8', background: '#f8fafc', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
                                        <Box size={56} style={{ margin: '0 auto 24px', opacity: 0.2, color: '#ef4444' }} />
                                        <p style={{ fontWeight: 950, fontSize: '1.1rem' }}>Nessuna automazione di pulizia configurata.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'automessage' && editingEmbedIndex === null && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    {!isPremium && (
                        <div className="pc-premium-banner-v2 animate slide-up" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', color: '#92400e', border: '1.5px solid #fde68a' }}>
                            <Zap size={20} style={{ color: '#ea580c' }} />
                            <div style={{ flex: 1 }}>
                                <strong style={{ display: 'block', fontSize: '1rem', color: '#92400e' }}>Designer di Annunci Avanzato</strong>
                                <span style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 700 }}>Passa a Premium per sbloccare l'Embed Designer e inviare broadcast grafici professionali.</span>
                            </div>
                            <button className="pc-btn-upgrade-v2" style={{ background: '#ea580c' }} onClick={() => router.push(`/config/${guildId}/premium`)}>Sblocca Designer</button>
                        </div>
                    )}

                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}><MessageCircle size={18} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>Broadcast Ricorrenti</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 650 }}>Invia annunci periodici basati sul tempo o sull'attività della chat.</p>
                            </div>
                            <button className="pc-btn-add-v2" style={{ background: '#fffbeb', color: '#d97706', border: '1.5px solid #fde68a' }} onClick={addMessageSlot}>
                                <Plus size={18} /> <span>Nuovo Broadcast</span>
                            </button>
                        </div>
                        <div className="card-body-v2">
                            <div className="v-stack" style={{ gap: '28px' }}>
                                {(config.autoMessage?.slots || []).map((slot, index) => (
                                    <div key={slot.id} className="pc-sub-card-v2 animate slide-up" style={{ background: '#f8fafc', padding: '32px', borderRadius: '28px', border: '1.5px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', borderBottom: '1.5px dashed #e2e8f0', paddingBottom: '24px' }}>
                                            <div style={{ width: '48px', height: '48px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}><Send size={20} /></div>
                                            <div className="v-stack">
                                                <h4 style={{ margin: 0, fontWeight: 950, fontSize: '1.1rem', color: '#1e293b' }}>Broadcast #{index + 1}</h4>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Studio Annunci</span>
                                            </div>
                                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <button onClick={() => setEditingEmbedIndex(index)} disabled={!isPremium} className={`pc-btn-studio-v2 ${slot.useEmbed ? 'active' : ''}`} style={{ opacity: isPremium ? 1 : 0.5, cursor: isPremium ? 'pointer' : 'not-allowed' }}>
                                                    <Palette size={16} /> <span>{slot.useEmbed ? 'Design Attivo' : 'Crea Embed'}</span>
                                                </button>
                                                <div style={{ width: '1.5px', height: '28px', background: '#e2e8f0', margin: '0 4px' }}></div>
                                                <label className="pc-toggle-v2 mini">
                                                    <input type="checkbox" checked={!!slot.enabled} onChange={e => updateMessageSlot(index, 'enabled', e.target.checked)} />
                                                    <span className="pc-slider-v2"></span>
                                                </label>
                                                <button onClick={() => removeMessageSlot(index)} className="pc-btn-delete-mini"><Trash2 size={18} /></button>
                                            </div>
                                        </div>

                                        <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 0.6fr', gap: '28px' }}>
                                            <div className="pc-input-group-v2">
                                                <label>Canale Destinazione</label>
                                                <DiscordSelector 
                                                    type="channel" 
                                                    options={channels.filter(c => c.type === 0 || c.type === 5)} 
                                                    value={slot.channelId || ''} 
                                                    onChange={val => updateMessageSlot(index, 'channelId', val)} 
                                                />
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>Metrica di Attivazione</label>
                                                <CustomSelect 
                                                    options={[
                                                        { value: 'TIME', label: 'Cronometro (Minuti)' },
                                                        { value: 'MESSAGES', label: 'Contatore Chat (Messaggi)' }
                                                    ]} 
                                                    value={slot.triggerType || 'TIME'} 
                                                    onChange={val => updateMessageSlot(index, 'triggerType', val)} 
                                                />
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>Valore</label>
                                                <div className="pc-input-wrapper-v2" style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '16px' }}>
                                                    <Activity size={18} style={{ marginLeft: '16px', color: '#94a3b8' }} />
                                                    <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '16px', fontWeight: 850, color: '#1e293b' }} value={slot.triggerValue || 60} onChange={e => updateMessageSlot(index, 'triggerValue', parseInt(e.target.value))} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pc-input-group-v2" style={{ marginTop: '28px' }}>
                                            <label>Testo del Messaggio {slot.useEmbed && '(Inviato sopra l\'embed grafico)'}</label>
                                            <textarea 
                                                className="pc-textarea-v2"
                                                style={{ width: '100%', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '20px', padding: '20px', fontWeight: 750, color: '#1e293b', outline: 'none', minHeight: '100px', resize: 'none', fontSize: '1rem', lineHeight: 1.5 }} 
                                                value={slot.content} 
                                                onChange={e => updateMessageSlot(index, 'content', e.target.value)} 
                                                placeholder="Scrivi qui il contenuto del tuo annuncio..." 
                                            />
                                        </div>
                                    </div>
                                ))}
                                {(config.autoMessage?.slots || []).length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '120px 20px', color: '#94a3b8', background: '#f8fafc', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
                                        <MessageCircle size={56} style={{ margin: '0 auto 24px', opacity: 0.2, color: '#f59e0b' }} />
                                        <p style={{ fontWeight: 950, fontSize: '1.1rem' }}>Nessun broadcast programmato al momento.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {editingEmbedIndex !== null && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <header style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <button onClick={() => setEditingEmbedIndex(null)} className="pc-btn-back-v2">
                            <ChevronLeft size={22} />
                        </button>
                        <div className="v-stack">
                            <h2 style={{ margin: 0, fontFamily: 'Inter', fontSize: '1.8rem', fontWeight: 950, color: '#1e293b' }}>Embed Designer: Slot #{editingEmbedIndex + 1}</h2>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 700 }}>Progetta un box grafico premium per il tuo broadcast.</p>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px', background: 'white', padding: '12px 24px', borderRadius: '20px', border: '1.5px solid #e2e8f0' }}>
                            <div className="v-stack" style={{ alignItems: 'flex-end' }}>
                                <span style={{ fontWeight: 900, fontSize: '0.85rem', color: '#1e293b' }}>Usa Design Grafico</span>
                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800 }}>SOSTITUISCE IL TESTO SEMPLICE</span>
                            </div>
                            <label className="pc-toggle-v2 mini">
                                <input type="checkbox" checked={!!config.autoMessage.slots[editingEmbedIndex].useEmbed} onChange={e => updateMessageSlot(editingEmbedIndex, 'useEmbed', e.target.checked)} />
                                <span className="pc-slider-v2"></span>
                            </label>
                        </div>
                    </header>

                    <section className="pc-card-v2 animate slide-up" style={{ padding: '40px' }}>
                         <div className="card-body-v2">
                             {config.autoMessage.slots[editingEmbedIndex].useEmbed ? (
                                <div className="fade-in">
                                    <EmbedEditor 
                                        embed={config.autoMessage.slots[editingEmbedIndex].embed || {}} 
                                        onChange={val => {
                                            const newSlots = [...config.autoMessage.slots];
                                            newSlots[editingEmbedIndex].embed = val;
                                            setConfig({...config, autoMessage: {...config.autoMessage, slots: newSlots}});
                                        }}
                                        variables={['guild', 'member_count', 'date', 'time', 'channel']}
                                    />
                                </div>
                             ) : (
                                <div style={{ textAlign: 'center', padding: '140px 20px', color: '#94a3b8', background: '#f8fafc', borderRadius: '32px', border: '3px dashed #e2e8f0' }}>
                                    <Terminal size={64} style={{ margin: '0 auto 24px', opacity: 0.2 }} />
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: '#1e293b', fontWeight: 950 }}>Designer in Standby</h4>
                                    <p style={{ fontWeight: 800, fontSize: '1rem', maxWidth: '400px', margin: '0 auto' }}>Attiva l'interruttore in alto a destra per iniziare a progettare l'embed per questo slot.</p>
                                </div>
                             )}
                         </div>
                    </section>
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 40px; max-width: 1600px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: white; padding: 32px; border-radius: 32px; box-shadow: var(--shadow-premium); border: 1px solid var(--border-light); }
            .header-info { display: flex; align-items: center; gap: 24px; }
            .pc-icon-box { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 12px 24px rgba(245, 158, 11, 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Inter', sans-serif; font-size: 2.2rem; font-weight: 900; margin: 0; color: #1e293b; letter-spacing: -0.5px; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 900; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px; }
            .pc-status-tag-v2.on { background: #fffbeb; color: #d97706; }
            .pc-status-tag-v2.off { background: #f1f5f9; color: #94a3b8; }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: white; border: none; padding: 14px 28px; border-radius: 16px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 25px rgba(99, 102, 241, 0.3); }

            /* Premium Banner */
            .pc-premium-banner-v2 { display: flex; align-items: center; gap: 24px; background: #eff6ff; color: #1e40af; padding: 24px 32px; border-radius: 28px; border: 1.5px solid #bfdbfe; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.08); }
            .pc-btn-upgrade-v2 { background: var(--primary); color: white; border: none; padding: 12px 28px; border-radius: 14px; font-weight: 900; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2); }
            .pc-btn-upgrade-v2:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3); }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 8px; background: #f1f5f9; padding: 6px; border-radius: 18px; width: fit-content; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 10px; padding: 12px 24px; border: none; background: transparent; color: #64748b; font-weight: 800; font-size: 0.95rem; border-radius: 14px; cursor: pointer; transition: 0.2s; position: relative; }
            .pc-tabs-v2 button.active { background: white; color: var(--primary); box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .tab-count-v2 { background: var(--primary); color: white; font-size: 0.65rem; padding: 2px 8px; border-radius: 100px; margin-left: 4px; }

            /* Card V2 */
            .pc-card-v2 { background: white; border: 1px solid var(--border-light); border-radius: 32px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 20px; margin-bottom: 40px; }
            .header-icon { width: 52px; height: 52px; background: #f5f3ff; color: var(--primary); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.5rem; font-weight: 950; color: #1e293b; }

            .pc-btn-add-v2 { background: #f8fafc; color: #1e293b; border: 1.5px solid #e2e8f0; padding: 12px 24px; border-radius: 14px; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
            .pc-btn-add-v2:hover { background: white; border-color: var(--primary); color: var(--primary); transform: translateY(-2px); }

            /* Sub Cards */
            .pc-sub-card-v2:hover { border-color: #cbd5e1 !important; box-shadow: 0 10px 30px rgba(0,0,0,0.04) !important; }
            .pc-status-tag-mini-v2 { font-size: 0.6rem; font-weight: 950; padding: 4px 10px; border-radius: 8px; letter-spacing: 0.5px; }

            .pc-btn-delete-mini { width: 44px; height: 44px; border-radius: 14px; background: #fff1f2; color: #ef4444; border: none; cursor: pointer; display: flex; align-items: center; justifyContent: center; transition: 0.2s; }
            .pc-btn-delete-mini:hover { background: #ef4444; color: white; transform: rotate(8deg); }

            .pc-btn-studio-v2 { background: white; color: #64748b; border: 1.5px solid #e2e8f0; padding: 10px 18px; border-radius: 12px; font-weight: 900; fontSize: 0.85rem; cursor: pointer; display: flex; alignItems: center; gap: 8px; transition: 0.2s; }
            .pc-btn-studio-v2:hover:not(:disabled) { border-color: #7c3aed; color: #7c3aed; background: #f5f3ff; }
            .pc-btn-studio-v2.active { background: #7c3aed; color: white; border-color: #7c3aed; }

            .pc-btn-back-v2 { width: 52px; height: 52px; borderRadius: 16px; border: 1.5px solid #e2e8f0; background: white; color: #64748b; cursor: pointer; display: flex; alignItems: center; justifyContent: center; transition: 0.2s; }
            .pc-btn-back-v2:hover { border-color: var(--primary); color: var(--primary); background: #f5f3ff; }

            /* Toggle V2 */
            .pc-toggle-v2 { position: relative; width: 44px; height: 22px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: #cbd5e1; transition: .4s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background: white; transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: var(--primary); }
            input:checked + .pc-slider-v2:before { transform: translateX(22px); }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-sub-card-v2, :global(.light-theme) .pc-btn-back-v2 { background: #ffffff !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
