import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, 
    Trash2, 
    Plus, 
    Clock, 
    Zap,
    Layout,
    Power,
    X,
    Hash,
    MessageSquare,
    Send,
    MousePointer2,
    Settings2,
    Palette,
    ChevronLeft,
    Monitor,
    Smartphone
} from 'lucide-react';
import DiscordSelector from '../../../components/DiscordSelector';
import EmbedEditor from '../../../components/EmbedEditor';

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
  const [editingEmbedIndex, setEditingEmbedIndex] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
      const fetchData = async () => {
        try {
          const [configRes, discordRes] = await Promise.all([
            api.request(`/config/${guildId}/automations`),
            api.request(`/config/${guildId}/discord-data`)
          ]);
          
          if (configRes && configRes.data) {
            setConfig(configRes.data);
          } else if (configRes) {
            setConfig(configRes);
          }
          if (discordRes) {
            setChannels(discordRes.channels || []);
          }
          setLoading(false);
        } catch (error) {
          console.error("Error loading automations config:", error);
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [guildId, mounted]);

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/automations`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast(t('common.save_success'));
    } catch (error) {
      showToast(t('common.save_error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // --- Auto Clear Helpers ---
  const addClearSlot = () => {
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

  // --- Auto Message Helpers ---
  const addMessageSlot = () => {
    const newSlots = [...(config.autoMessage?.slots || []), { 
        id: `msg_${Date.now()}`, 
        channelId: '', 
        content: '', 
        triggerType: 'TIME', 
        triggerValue: 60, 
        enabled: true 
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

  if (loading || !config) return <><Skeleton height="500px" /></>;

  return (
    <div className="config-page-layout animate">
      <div className="config-main-col">
        {/* Module Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Settings2 size={24} />
              </div>
              <div className="header-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h1>{t('automations.title')}</h1>
                  <div className="status-badge-inline">
                    <div className="dot"></div>
                    <span>{t('dashboard.module_status')}</span>
                  </div>
                </div>
                <p>{t('automations.desc')}</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} strokeWidth={2.5} /> {saving ? t('common.loading') : t('common.save')}
              </button>
           </div>
        </header>

        {/* Tab Navigation */}
        <div className="tabs-container">
            <button 
                className={`tab-btn ${activeTab === 'autoclear' ? 'active' : ''}`}
                onClick={() => setActiveTab('autoclear')}
            >
                <Trash2 size={16} /> {t('automations.tab_autoclear')}
            </button>
            <button 
                className={`tab-btn ${activeTab === 'automessage' ? 'active' : ''}`}
                onClick={() => setActiveTab('automessage')}
            >
                <Send size={16} /> {t('automations.tab_automessage')}
            </button>
        </div>

        {activeTab === 'autoclear' ? (
            <div className="tab-content animate fade-in">
                <div className="section-header-row">
                    <div className="align-center">
                        <Layout size={20} color="var(--primary)" />
                        <h2>{t('automations.tab_autoclear')}</h2>
                    </div>
                    <button onClick={addClearSlot} className="btn-add-premium">
                        <Plus size={16} /> {t('automations.add_slot')}
                    </button>
                </div>

                <div className="slots-grid">
                    {config.autoClear?.slots?.length === 0 && (
                        <div className="empty-state-card card">
                            <Trash2 size={32} color="var(--text-muted)" />
                            <p>{t('automations.no_slots')}</p>
                        </div>
                    )}

                    {config.autoClear?.slots?.map((slot, index) => (
                        <div key={slot.id} className="slot-card card">
                            <div className="slot-header">
                                <div className="slot-title">
                                    <Hash size={14} />
                                    <span>{t('automations.slot_title', { index: index + 1 })}</span>
                                </div>
                                <div className="slot-actions">
                                    <label className="toggle-s">
                                        <input type="checkbox" checked={!!slot.enabled} onChange={e => updateClearSlot(index, 'enabled', e.target.checked)} />
                                        <span className="slider-s"></span>
                                    </label>
                                    <button className="btn-remove-premium" onClick={() => removeClearSlot(index)}><X size={14} /></button>
                                </div>
                            </div>

                            <div className="slot-body">
                                <div className="field-box">
                                    <label className="text-label">{t('automations.channel_label')}</label>
                                    <DiscordSelector 
                                        type="channel" 
                                        options={channels.filter(c => c.type === 0 || c.type === 5)} 
                                        value={slot.channelId || ''} 
                                        onChange={val => updateClearSlot(index, 'channelId', val)} 
                                    />
                                </div>

                                <div className="field-row" style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="field-box">
                                        <label className="text-label">{t('automations.freq_label')}</label>
                                        <div className="input-with-icon">
                                            <Clock size={16} className="icon-p" />
                                            <input 
                                                type="number" 
                                                className="input-p" 
                                                value={slot.intervalMinutes || 60} 
                                                onChange={e => updateClearSlot(index, 'intervalMinutes', parseInt(e.target.value) || 1)} 
                                                min="1"
                                            />
                                        </div>
                                    </div>
                                    <div className="field-box">
                                        <label className="text-label">{t('automations.amount_label')}</label>
                                        <div className="input-with-icon">
                                            <MessageSquare size={16} className="icon-p" />
                                            <input 
                                                type="number" 
                                                className="input-p" 
                                                value={slot.amount || 100} 
                                                onChange={e => updateClearSlot(index, 'amount', parseInt(e.target.value) || 1)} 
                                                min="1"
                                                max="100"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <section className="card manual-clear-hero" style={{ marginTop: '32px' }}>
                    <div className="align-center" style={{ marginBottom: '16px' }}>
                        <Zap size={20} color="var(--primary)" />
                        <h3>{t('automations.manual_clear')}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                         <div style={{ flex: 1 }}>
                            <DiscordSelector 
                                type="channel" 
                                options={channels.filter(c => c.type === 0 || c.type === 5)} 
                                value={config.manualChannelId || ''} 
                                onChange={val => setConfig({...config, manualChannelId: val})} 
                            />
                         </div>
                         <input 
                            type="number" 
                            className="input-p" 
                            style={{ width: '100px', paddingLeft: '16px' }}
                            placeholder={t('automations.qty_placeholder')}
                            value={config.manualAmount || 50} 
                            onChange={e => setConfig({...config, manualAmount: parseInt(e.target.value) || 1})}
                         />
                         <button className="btn-primary" style={{ background: 'var(--error)' }} onClick={async () => {
                             if(!config.manualChannelId) return showToast(t('common.select_channel'), 'error');
                             try {
                                 const res = await api.request(`/config/${guildId}/autoclear/manual`, {
                                     method: 'POST',
                                     body: JSON.stringify({ channelId: config.manualChannelId, amount: config.manualAmount || 50 })
                                 });
                                 showToast(t('automations.clear_success', { count: res.data?.count || 0 }));
                             } catch(e) { showToast(t('automations.clear_error'), 'error'); }
                         }}>
                            <Trash2 size={16} /> {t('automations.clear_now')}
                         </button>
                    </div>
                </section>
            </div>
        ) : editingEmbedIndex !== null ? (
            <div className="tab-content animate fade-in">
                <div className="section-header-row">
                    <div className="align-center">
                        <button onClick={() => setEditingEmbedIndex(null)} className="btn-back">
                            <ChevronLeft size={20} />
                        </button>
                        <Palette size={20} color="var(--primary)" />
                        <h2>{t('automations.editor_title', { index: editingEmbedIndex + 1 })}</h2>
                    </div>
                </div>

                <div className="card editor-container-p">
                    <EmbedEditor 
                        embed={config.autoMessage.slots[editingEmbedIndex]?.embed || {}} 
                        onChange={d => {
                            const newSlots = [...config.autoMessage.slots];
                            newSlots[editingEmbedIndex] = { 
                                ...newSlots[editingEmbedIndex], 
                                embed: d,
                                useEmbed: true 
                            };
                            setConfig({ ...config, autoMessage: { ...config.autoMessage, slots: newSlots } });
                        }}
                        variables={['guild', 'member_count', 'date', 'time']}
                    />
                </div>
            </div>
        ) : (
            <div className="tab-content animate fade-in">
                <div className="section-header-row">
                    <div className="align-center">
                        <MessageSquare size={20} color="var(--primary)" />
                        <h2>{t('automations.tab_automessage')}</h2>
                    </div>
                    <button onClick={addMessageSlot} className="btn-add-premium">
                        <Plus size={16} /> {t('automations.add_msg_slot')}
                    </button>
                </div>

                <div className="slots-grid">
                    {config.autoMessage?.slots?.length === 0 && (
                        <div className="empty-state-card card">
                            <Send size={32} color="var(--text-muted)" />
                            <p>{t('automations.no_msg_slots')}</p>
                        </div>
                    )}

                    {config.autoMessage?.slots?.map((slot, index) => (
                        <div key={slot.id} className="slot-card card">
                             <div className="slot-header">
                                <div className="slot-title">
                                    <Send size={14} />
                                    <span>{t('automations.msg_slot_title', { index: index + 1 })}</span>
                                </div>
                                <div className="slot-actions">
                                    <button 
                                        className={`btn-icon-p ${slot.useEmbed ? 'active' : ''}`} 
                                        onClick={() => setEditingEmbedIndex(index)}
                                        title={t('automations.customize_embed')}
                                    >
                                        <Palette size={14} />
                                    </button>
                                    <label className="toggle-s">
                                        <input type="checkbox" checked={!!slot.enabled} onChange={e => updateMessageSlot(index, 'enabled', e.target.checked)} />
                                        <span className="slider-s"></span>
                                    </label>
                                    <button className="btn-remove-premium" onClick={() => removeMessageSlot(index)}><X size={14} /></button>
                                </div>
                            </div>

                            <div className="slot-body">
                                <div className="field-box">
                                    <label className="text-label">{t('automations.channel_label')}</label>
                                    <DiscordSelector 
                                        type="channel" 
                                        options={channels.filter(c => c.type === 0 || c.type === 5)} 
                                        value={slot.channelId || ''} 
                                        onChange={val => updateMessageSlot(index, 'channelId', val)} 
                                    />
                                </div>

                                <div className="field-box" style={{ marginTop: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <label className="text-label" style={{ margin: 0 }}>{slot.useEmbed ? t('automations.content_with_embed') : t('automations.content_text_only')}</label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t('automations.use_embed')}</span>
                                            <label className="toggle-mini">
                                                <input type="checkbox" checked={!!slot.useEmbed} onChange={e => updateMessageSlot(index, 'useEmbed', e.target.checked)} />
                                                <span className="slider-mini"></span>
                                            </label>
                                        </div>
                                    </div>
                                    <textarea 
                                        className="textarea-p" 
                                        rows={slot.useEmbed ? "2" : "3"}
                                        placeholder={slot.useEmbed ? t('automations.placeholder_embed_text') : t('automations.placeholder_text')}
                                        value={slot.content || ''}
                                        onChange={e => updateMessageSlot(index, 'content', e.target.value)}
                                    ></textarea>
                                </div>
                                {slot.useEmbed && (
                                    <button className="btn-embed-quick" onClick={() => setEditingEmbedIndex(index)}>
                                        <Palette size={14} /> {t('automations.customize_embed')}
                                    </button>
                                )}

                                <div className="trigger-config" style={{ marginTop: '16px', background: 'var(--bg-badge)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <label className="text-label" style={{ marginBottom: '12px' }}>{t('automations.trigger_label')}</label>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button 
                                            className={`trigger-btn ${slot.triggerType === 'TIME' ? 'active' : ''}`}
                                            onClick={() => updateMessageSlot(index, 'triggerType', 'TIME')}
                                        >
                                            <Clock size={14} /> {t('automations.trigger_time')}
                                        </button>
                                        <button 
                                            className={`trigger-btn ${slot.triggerType === 'MESSAGES' ? 'active' : ''}`}
                                            onClick={() => updateMessageSlot(index, 'triggerType', 'MESSAGES')}
                                        >
                                            <MousePointer2 size={14} /> {t('automations.trigger_messages')}
                                        </button>
                                    </div>

                                    <div className="field-box" style={{ marginTop: '16px' }}>
                                        <label className="text-label">{slot.triggerType === 'TIME' ? t('automations.trigger_time') : t('automations.trigger_messages')}</label>
                                        <input 
                                            type="number" 
                                            className="input-p" 
                                            value={slot.triggerValue || 60} 
                                            onChange={e => updateMessageSlot(index, 'triggerValue', parseInt(e.target.value) || 1)} 
                                            min="1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

      <style jsx>{`
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-badge); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: var(--primary-glow); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; color: var(--text-main); }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }

            .status-badge-inline { display: flex; align-items: center; gap: 8px; background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
            .status-badge-inline .dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 8px #22c55e; }

            .tabs-container { display: flex; gap: 8px; margin-bottom: 32px; background: var(--bg-badge); padding: 6px; border-radius: 14px; width: fit-content; border: 1px solid var(--border); }
            .tab-btn { display: flex; align-items: center; gap: 10px; padding: 10px 20px; border-radius: 10px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; cursor: pointer; transition: 0.2s; font-size: 0.9rem; }
            .tab-btn:hover { color: var(--text-main); background: rgba(255,255,255,0.05); }
            .tab-btn.active { background: var(--bg-main); color: var(--primary); box-shadow: var(--shadow-sm); }

            .section-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
            .section-header-row h2 { font-size: 1.25rem; font-weight: 800; }

            .btn-add-premium { background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; }
            .btn-add-premium:hover { transform: translateY(-2px); filter: brightness(1.1); }

            .slots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 24px; }
            .slot-card { padding: 0 !important; overflow: hidden; transition: 0.3s; border-top: 3px solid var(--border); }
            .slot-card:hover { border-top-color: var(--primary); transform: translateY(-4px); }
            
            .slot-header { padding: 16px 20px; background: var(--bg-badge); border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
            .slot-title { display: flex; align-items: center; gap: 10px; color: var(--text-muted); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
            .slot-actions { display: flex; align-items: center; gap: 12px; }

            .slot-body { padding: 24px; }

            .input-with-icon { position: relative; display: flex; align-items: center; }
            .icon-p { position: absolute; left: 14px; color: var(--primary); }
            .input-p { background: var(--bg-dark); border: 1px solid var(--border); color: var(--text-main); padding: 12px 16px 12px 42px; border-radius: 12px; width: 100%; transition: 0.2s; }
            .input-p:focus { border-color: var(--primary); outline: none; }

            .textarea-p { background: var(--bg-dark); border: 1px solid var(--border); color: var(--text-main); padding: 12px 16px; border-radius: 12px; width: 100%; transition: 0.2s; resize: vertical; font-family: inherit; }
            .textarea-p:focus { border-color: var(--primary); outline: none; }

            .trigger-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-main); color: var(--text-muted); font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
            .trigger-btn:hover { background: var(--bg-elevated); color: var(--text-main); }
            .trigger-btn.active { border-color: var(--primary); color: var(--primary); background: var(--primary-glow); }

            .empty-state-card { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 40px; text-align: center; gap: 16px; border: 2px dashed var(--border); background: transparent; }
            
            .toggle-s { position: relative; width: 34px; height: 18px; }
            .toggle-s input { opacity: 0; width: 0; height: 0; }
            .slider-s { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--bg-badge); transition: 0.3s; border-radius: 20px; border: 1px solid var(--border); }
            .slider-s:before { position: absolute; content: ""; height: 12px; width: 12px; left: 2px; bottom: 2px; background-color: var(--text-muted); transition: 0.3s; border-radius: 50%; }
            input:checked + .slider-s { background-color: var(--primary); border-color: var(--primary); }
            input:checked + .slider-s:before { transform: translateX(16px); background-color: white; }

            .manual-clear-hero { padding: 24px; border-left: 4px solid var(--primary); }
            .align-center { display: flex; align-items: center; gap: 12px; }

            .btn-back { background: var(--bg-badge); border: 1px solid var(--border); color: var(--text-main); width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; margin-right: 8px; }
            .btn-back:hover { background: var(--bg-elevated); border-color: var(--primary); color: var(--primary); }

            .btn-icon-p { background: var(--bg-badge); border: 1px solid var(--border); color: var(--text-muted); width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
            .btn-icon-p:hover { background: var(--primary-glow); border-color: var(--primary); color: var(--primary); }
            .btn-icon-p.active { background: var(--primary); color: white; border-color: var(--primary); }

            .btn-embed-quick { width: 100%; margin-top: 12px; background: var(--primary-glow); color: var(--primary); border: 1px dashed var(--primary); padding: 10px; border-radius: 10px; font-size: 0.8rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
            .btn-embed-quick:hover { background: var(--primary); color: white; border-style: solid; }

            .editor-container-p { padding: 0 !important; overflow: hidden; background: transparent; border: none; }
            
            .toggle-mini { position: relative; width: 30px; height: 16px; }
            .toggle-mini input { opacity: 0; width: 0; height: 0; }
            .slider-mini { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--bg-badge); transition: 0.3s; border-radius: 20px; border: 1px solid var(--border); }
            .slider-mini:before { position: absolute; content: ""; height: 10px; width: 10px; left: 2px; bottom: 2px; background-color: var(--text-muted); transition: 0.3s; border-radius: 50%; }
            input:checked + .slider-mini { background-color: var(--primary); border-color: var(--primary); }
            input:checked + .slider-mini:before { transform: translateX(14px); background-color: white; }
        `}</style>
      </div>
    </div>
  );
}
