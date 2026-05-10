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
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
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
                                <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-heading)' }}>Ottimizza la tua Infrastruttura</strong>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Passa a Premium per sbloccare slot illimitati e intervalli di pulizia sotto i 60 minuti.</span>
                            </div>
                            <button className="pc-btn-upgrade-v2" onClick={() => router.push(`/config/${guildId}/premium`)}>Upgrade</button>
                        </div>
                    )}
                    
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: '#fef2f2', color: '#ef4444' }}><Trash2 size={18} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>Canali in Auto-Pulizia</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 650 }}>Mantieni il tuo server pulito eliminando automaticamente messaggi obsoleti.</p>
                            </div>
                            <button className="pc-btn-add-v2" onClick={addClearSlot}>
                                <Plus size={18} /> <span>Nuovo Canale</span>
                            </button>
                        </div>
                        <div className="card-body-v2">
                            <div className="v-stack" style={{ gap: '28px' }}>
                                {(config.autoClear?.slots || []).map((slot, index) => (
                                    <div key={slot.id} className="pc-sub-card-v2 animate slide-up" style={{ background: 'var(--bg-badge)', padding: '32px', borderRadius: '28px', border: '1.5px solid var(--border)', position: 'relative' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', borderBottom: '1.5px dashed var(--border)', paddingBottom: '24px' }}>
                                            <div style={{ width: '48px', height: '48px', background: 'white', border: '1.5px solid var(--border)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}><Hash size={20} /></div>
                                            <div className="v-stack">
                                                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-heading)' }}>Slot Pulizia #{index + 1}</h4>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Engine Config</span>
                                            </div>
                                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                <div className="pc-status-tag-mini-v2" style={{ background: slot.enabled ? '#ecfdf5' : 'var(--bg-badge)', color: slot.enabled ? '#10b981' : 'var(--text-dim)' }}>{slot.enabled ? 'ATTIVO' : 'PAUSA'}</div>
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
                                                <div className="pc-input-wrapper-v2" style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: '16px' }}>
                                                    <Timer size={18} style={{ marginLeft: '16px', color: 'var(--text-dim)' }} />
                                                    <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '16px', fontWeight: 700, color: 'var(--text-heading)' }} value={slot.intervalMinutes || 60} onChange={e => updateClearSlot(index, 'intervalMinutes', parseInt(e.target.value))} />
                                                </div>
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>Messaggi per Ciclo</label>
                                                <div className="pc-input-wrapper-v2" style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: '16px' }}>
                                                    <Layers size={18} style={{ marginLeft: '16px', color: 'var(--text-dim)' }} />
                                                    <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '16px', fontWeight: 700, color: 'var(--text-heading)' }} value={slot.amount || 100} onChange={e => updateClearSlot(index, 'amount', parseInt(e.target.value))} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(config.autoClear?.slots || []).length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '120px 20px', color: 'var(--text-dim)', background: 'var(--bg-badge)', borderRadius: '32px', border: '2px dashed var(--border)' }}>
                                        <Box size={56} style={{ margin: '0 auto 24px', opacity: 0.2, color: '#ef4444' }} />
                                        <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Nessuna automazione di pulizia configurata.</p>
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
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 650 }}>Invia annunci periodici basati sul tempo o sull'attività della chat.</p>
                            </div>
                            <button className="pc-btn-add-v2" style={{ background: '#fffbeb', color: '#d97706', border: '1.5px solid #fde68a' }} onClick={addMessageSlot}>
                                <Plus size={18} /> <span>Nuovo Broadcast</span>
                            </button>
                        </div>
                        <div className="card-body-v2">
                            <div className="v-stack" style={{ gap: '28px' }}>
                                {(config.autoMessage?.slots || []).map((slot, index) => (
                                    <div key={slot.id} className="pc-sub-card-v2 animate slide-up" style={{ background: 'var(--bg-badge)', padding: '32px', borderRadius: '28px', border: '1.5px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', borderBottom: '1.5px dashed var(--border)', paddingBottom: '24px' }}>
                                            <div style={{ width: '48px', height: '48px', background: 'white', border: '1.5px solid var(--border)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}><Send size={20} /></div>
                                            <div className="v-stack">
                                                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-heading)' }}>Broadcast #{index + 1}</h4>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Studio Annunci</span>
                                            </div>
                                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <button onClick={() => setEditingEmbedIndex(index)} disabled={!isPremium} className={`pc-btn-studio-v2 ${slot.useEmbed ? 'active' : ''}`} style={{ opacity: isPremium ? 1 : 0.5, cursor: isPremium ? 'pointer' : 'not-allowed' }}>
                                                    <Palette size={16} /> <span>{slot.useEmbed ? 'Design Attivo' : 'Crea Embed'}</span>
                                                </button>
                                                <div style={{ width: '1.5px', height: '28px', background: 'var(--border)', margin: '0 4px' }}></div>
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
                                                <div className="pc-input-modern-v2">
                                                    <Activity size={18} style={{ color: 'var(--primary)' }} />
                                                    <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: 700, color: 'var(--text-heading)', outline: 'none' }} value={slot.triggerValue || 60} onChange={e => updateMessageSlot(index, 'triggerValue', parseInt(e.target.value))} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pc-input-group-v2" style={{ marginTop: '28px' }}>
                                            <label>Testo del Messaggio {slot.useEmbed && '(Inviato sopra l\'embed grafico)'}</label>
                                            <textarea 
                                                className="pc-input-modern-v2"
                                                style={{ minHeight: '100px', resize: 'none' }} 
                                                value={slot.content} 
                                                onChange={e => updateMessageSlot(index, 'content', e.target.value)} 
                                                placeholder="Scrivi qui il contenuto del tuo annuncio..." 
                                            />
                                        </div>
                                    </div>
                                ))}
                                {(config.autoMessage?.slots || []).length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '120px 20px', color: 'var(--text-dim)', background: 'var(--bg-badge)', borderRadius: '32px', border: '2px dashed var(--border)' }}>
                                        <MessageCircle size={56} style={{ margin: '0 auto 24px', opacity: 0.2, color: '#f59e0b' }} />
                                        <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Nessun broadcast programmato al momento.</p>
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
                            <h2 style={{ margin: 0, fontFamily: 'Inter', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-heading)' }}>Embed Designer: Slot #{editingEmbedIndex + 1}</h2>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 700 }}>Progetta un box grafico premium per il tuo broadcast.</p>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px', background: 'white', padding: '12px 24px', borderRadius: '20px', border: '1.5px solid var(--border)' }}>
                            <div className="v-stack" style={{ alignItems: 'flex-end' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-heading)' }}>Usa Design Grafico</span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700 }}>SOSTITUISCE IL TESTO SEMPLICE</span>
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
                                <div style={{ textAlign: 'center', padding: '140px 20px', color: 'var(--text-dim)', background: 'var(--bg-badge)', borderRadius: '32px', border: '3px dashed var(--border)' }}>
                                    <Terminal size={64} style={{ margin: '0 auto 24px', opacity: 0.2 }} />
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: 'var(--text-heading)', fontWeight: 700 }}>Designer in Standby</h4>
                                    <p style={{ fontWeight: 700, fontSize: '1rem', maxWidth: '400px', margin: '0 auto' }}>Attiva l'interruttore in alto a destra per iniziare a progettare l'embed per questo slot.</p>
                                </div>
                             )}
                         </div>
                    </section>
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1500px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #fff; }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Inter', sans-serif; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 6px; font-size: 0.6rem; font-weight: 700; padding: 4px 10px; border-radius: 100px;  width: fit-content; }
            .pc-status-tag-v2.on { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: var(--text-muted); }
            .status-dot-v2 { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }

            /* Premium Banner */
            .pc-premium-banner-v2 { display: flex; align-items: center; gap: 24px; background: var(--bg-badge); color: #1e40af; padding: 24px 32px; border-radius: 28px; border: 1.5px solid var(--border); box-shadow: 0 10px 25px rgba(59, 130, 246, 0.08); }
            .pc-btn-upgrade-v2 { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; }
            .pc-btn-upgrade-v2:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 6px; background: var(--bg-badge); padding: 5px; border-radius: 18px; width: fit-content; overflow-x: auto; max-width: 100%; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; font-size: 0.9rem; border-radius: 14px; cursor: pointer; transition: 0.2s; white-space: nowrap; }
            .pc-tabs-v2 button.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .pc-tab-badge-v2 { background: var(--primary); color: #fff; font-size: 0.65rem; padding: 1px 6px; border-radius: 100px; margin-left: 4px; }

            /* Card V2 */
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; background: var(--bg-badge); color: var(--primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.3rem; font-weight: 700; color: var(--text-heading); }

            .pc-btn-add-v2 { background: var(--bg-badge); color: var(--text-heading); border: 1.5px solid var(--border); padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
            .pc-btn-add-v2:hover { background: var(--bg-card); border-color: var(--primary); color: var(--primary); transform: translateY(-2px); }

            /* Sub Cards */
            .pc-sub-card-v2 { background: var(--bg-badge); padding: 24px; border-radius: 20px; border: 1.5px solid var(--border); }
            .pc-sub-card-v2:hover { border-color: var(--primary); box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
            .pc-status-tag-mini-v2 { font-size: 0.6rem; font-weight: 700; padding: 4px 10px; border-radius: 8px; }

            .pc-btn-delete-mini { width: 44px; height: 44px; border-radius: 14px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
            .pc-btn-delete-mini:hover { background: #ef4444; color: #fff; transform: rotate(8deg); }

            .pc-btn-studio-v2 { background: var(--bg-card); color: var(--text-muted); border: 1.5px solid var(--border); padding: 10px 18px; border-radius: 12px; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
            .pc-btn-studio-v2:hover:not(:disabled) { border-color: #7c3aed; color: #7c3aed; background: #f5f3ff; }
            .pc-btn-studio-v2.active { background: #7c3aed; color: #fff; border-color: #7c3aed; }

            .pc-btn-back-v2 { width: 52px; height: 52px; border-radius: 16px; border: 1.5px solid var(--border); background: var(--bg-card); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
            .pc-btn-back-v2:hover { border-color: var(--primary); color: var(--primary); background: #f5f3ff; }

            /* Toggle V2 */
            .pc-toggle-v2 { position: relative; width: 44px; height: 22px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: var(--border); transition: .4s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background: #fff; transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: var(--primary); }
            input:checked + .pc-slider-v2:before { transform: translateX(22px); }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; }

            .pc-input-modern-v2 { width: 100%; background: var(--bg-badge); border: 1.5px solid var(--border); border-radius: 14px; padding: 12px 16px; font-weight: 700; color: var(--text-heading); outline: none; transition: 0.2s; display: flex; align-items: center; gap: 12px; }
            .pc-input-modern-v2:focus-within { border-color: var(--primary); }
            .pc-input-modern-v2 input { width: 100%; background: transparent; border: none; font-weight: 700; color: var(--text-heading); outline: none; }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-sub-card-v2, :global(.light-theme) .pc-btn-back-v2 { box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
