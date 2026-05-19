import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { EmbedEditor, DiscordSelector, CustomSelect } from '../../../components/LazyConfigComponents';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import {
  Save, Palette, Eye, Send, Plus, Trash2, FolderOpen, Zap, Info, Layers, Sparkles, 
  Smartphone, Monitor, Clock, Calendar, ChevronDown, Box, MessageSquare, Lock, Crown, 
  RefreshCw, ChevronLeft, ArrowRight, MousePointer2, LayoutTemplate, Share2, Rocket,
  Target, RotateCcw
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
  const [currentEmbed, setCurrentEmbed] = useState({ title: t('embeds.new_project_title'), description: '...', color: '#10b981', fields: [] });
  const [customName, setCustomName] = useState(t('embeds.new_project_title'));
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
      setChannels((Array.isArray(channelsData) ? channelsData : []).filter(c => c.type === 0 || c.type === 5));
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
      setCurrentEmbed({ title: t('embeds.new_project_title'), description: '...', color: '#10b981', fields: [] });
      setCustomName(t('embeds.new_project_title'));
    } else {
      const template = customTemplates.find(t => t._id === val);
      if (template) {
        setCurrentEmbed(template.data);
        setCustomName(template.name);
        setSelectedChannel(template.targetChannelId || '');
      }
    }
  };

  const handleSave = async () => {
    const isNew = selectedTemplateId === 'new';
    
    if (isNew && !guildData?.isPremium && customTemplates.length >= 3) {
      showToast(t('embeds.toast_limit'), 'error');
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
          targetChannelId: selectedChannel,
          data: currentEmbed
        })
      });

      if (isNew) {
        setCustomTemplates([...customTemplates, saved]);
        setSelectedTemplateId(saved._id);
      } else {
        setCustomTemplates(customTemplates.map(t => t._id === saved._id ? saved : t));
      }

      showToast(t('embeds.toast_saved'));
    } catch (error) {
      showToast(t('embeds.toast_error'), 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleReset = () => {
    if (!confirm(t('common.reset_confirm'))) return;
    setCurrentEmbed({ title: t('embeds.new_project_title'), description: '...', color: '#10b981', fields: [] });
    setCustomName(t('embeds.new_project_title'));
    setSelectedTemplateId('new');
  };

  const handleSend = async () => {
    if (!selectedChannel) return showToast(t('embeds.toast_select_channel'), 'error');
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
      showToast(res.message || t('embeds.toast_sent'));
    } catch (error) {
      showToast(t('embeds.toast_send_error'), 'error');
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
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
                    <LayoutTemplate size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('embeds.title_pro')}</h1>
                    <div className={`pc-status-tag-v2 ${isPremium ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {isPremium ? t('embeds.premium_engine') : t('embeds.standard_engine')}
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
                        placeholder={t('embeds.target_channel_placeholder')} 
                    />
                </div>
                <button className="pc-btn-outline-v2" onClick={handleReset} title={t('common.reset_to_default')}>
                    <RotateCcw size={18} />
                </button>
                <button className="pc-btn-primary" onClick={handleSend} disabled={sending || !selectedChannel}>
                    <Send size={18} className={sending ? 'spin' : ''} />
                    <span>{sending ? t('embeds.transmitting') : t('embeds.transmit_btn')}</span>
                </button>
            </div>
        </header>

        <div className="pc-content-v2">
            <div className="v-stack" style={{ gap: '32px' }}>
                {/* Top Section: Library & Actions */}
                <section className="pc-card-v2 animate slide-up">
                    <div className="card-header-v2">
                        <div className="header-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><FolderOpen size={18} /></div>
                        <div className="v-stack" style={{ flex: 1 }}>
                            <h3 style={{ margin: 0 }}>{t('embeds.library_title')}</h3>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 650 }}>{t('embeds.library_desc')}</p>
                        </div>
                    </div>
                    <div className="card-body-v2">
                        <div className="pc-library-controls-v2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.5fr', gap: '20px' }}>
                            <div className="pc-input-group-v2">
                                <label>{t('embeds.template_source')}</label>
                                <CustomSelect 
                                    options={[
                                        { value: 'new', label: t('embeds.new_project_btn') },
                                        ...customTemplates.map(t => ({ value: t._id, label: t.name }))
                                    ]} 
                                    value={selectedTemplateId} 
                                    onChange={handleTemplateChange} 
                                />
                            </div>
                            <div className="pc-input-group-v2">
                                <label>{t('embeds.id_name')}</label>
                                <input className="pc-input-modern-v2" value={customName} onChange={e => setCustomName(e.target.value)} placeholder={t('embeds.id_name_placeholder')} />
                            </div>
                            <div className="pc-input-group-v2" style={{ justifyContent: 'flex-end' }}>
                                <button className="pc-btn-save-v2" onClick={handleSave} disabled={saving}>
                                    <Save size={18} />
                                    <span>{saving ? '...' : t('embeds.archive_btn')}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="pc-layout-grid-v2 embeds-main-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 420px', gap: '24px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        {/* Visual Designer */}
                        <section className="pc-card-v2 animate slide-up" style={{ padding: 0, animationDelay: '0.1s' }}>
                            <div style={{ background: 'var(--bg-badge)', padding: '24px 32px', borderBottom: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px', borderTopLeftRadius: '32px', borderTopRightRadius: '32px' }}>
                                <div className="header-icon" style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', width: '36px', height: '36px' }}><Palette size={16} /></div>
                                <h4 style={{ margin: 0, fontFamily: 'Inter', fontWeight: 700, color: 'var(--text-heading)' }}>{t('embeds.visual_designer')}</h4>
                            </div>
                            <div className="pc-editor-wrapper-v2 embed-designer-wrapper" style={{ padding: '24px' }}>
                                <EmbedEditor 
                                    embed={currentEmbed} 
                                    onChange={setCurrentEmbed} 
                                    variables={['user', 'guild', 'time', 'date', 'member_count']} 
                                    showButtonEditor={true}
                                />
                            </div>
                        </section>
                    </div>

                    <aside className="v-stack" style={{ gap: '32px' }}>
                        {/* Schedule Section */}
                        <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: '#fef2f2', color: '#ef4444' }}><Clock size={18} /></div>
                                <h3>{t('embeds.schedule_title')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-schedule-stack-v2" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { id: 'NOW', label: t('embeds.schedule_now'), icon: Zap, desc: t('embeds.schedule_now_desc') },
                                        { id: 'DELAY', label: t('embeds.schedule_delay'), icon: Clock, desc: t('embeds.schedule_delay_desc') },
                                        { id: 'TIME', label: t('embeds.schedule_time'), icon: Calendar, desc: t('embeds.schedule_time_desc') }
                                    ].map(type => (
                                        <button key={type.id} onClick={() => setScheduleType(type.id)} className={`pc-schedule-tab-v2 ${scheduleType === type.id ? 'active' : ''}`}>
                                            <div className="tab-icon-v2"><type.icon size={18} /></div>
                                            <div className="v-stack">
                                                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{type.label}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700 }}>{type.desc}</span>
                                            </div>
                                            {scheduleType === type.id && <div className="active-glow-v2"></div>}
                                        </button>
                                    ))}
                                </div>

                                {scheduleType === 'DELAY' && (
                                    <div className="pc-input-group-v2 animate slide-up" style={{ marginTop: '24px' }}>
                                        <label>{t('embeds.delay_minutes')}</label>
                                        <input type="number" className="pc-input-modern-v2" value={delayMinutes} onChange={e => setDelayMinutes(e.target.value)} />
                                    </div>
                                )}
                                
                                {scheduleType === 'TIME' && (
                                    <div className="pc-input-group-v2 animate slide-up" style={{ marginTop: '24px' }}>
                                        <label>{t('embeds.scheduled_timestamp')}</label>
                                        <input type="datetime-local" className="pc-input-modern-v2" value={specificTime} onChange={e => setSpecificTime(e.target.value)} />
                                    </div>
                                )}

                                <div className="pc-recurrence-studio-v2" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1.5px dashed var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                        <RefreshCw size={14} color="#6366f1" />
                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('embeds.recurrence_title')}</label>
                                    </div>
                                    <CustomSelect 
                                        options={[
                                            { value: 'none', label: t('embeds.recurrence_none') },
                                            { value: 'daily', label: t('embeds.recurrence_daily') },
                                            { value: 'weekly', label: t('embeds.recurrence_weekly') },
                                            { value: 'monthly', label: t('embeds.recurrence_monthly') }
                                        ]} 
                                        value={recurrence} 
                                        onChange={setRecurrence} 
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="pc-smart-preview-v2 animate slide-up">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <Target size={20} className="smart-icon" />
                                <span className="smart-label">{t('embeds.smart_preview')}</span>
                            </div>
                            <p className="smart-text" dangerouslySetInnerHTML={{ __html: t('embeds.smart_preview_desc') }} />
                        </div>
                    </aside>
                </div>
            </div>
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
            .pc-status-tag-v2.on { background: rgba(16, 185, 129, 0.1); color: #10b981; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: #ef4444; }
            .status-dot-v2 { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }

            .pc-btn-save-v2 { background: var(--bg-badge); color: var(--text-heading); border: 1.5px solid var(--border); padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; width: 100%; height: 56px; justify-content: center; }
            .pc-btn-save-v2:hover { background: var(--bg-card); border-color: var(--primary); color: var(--primary); }

            .embeds-main-grid { grid-template-columns: minmax(0, 1fr) 420px !important; gap: 24px !important; }
            .embed-designer-wrapper { overflow: hidden; }
            .embed-designer-wrapper :global(.pc-editor-layout-v2) {
                grid-template-columns: 1fr !important;
                max-width: 100% !important;
                margin: 0 !important;
            }
            .embed-designer-wrapper :global(.pc-preview-sidebar-v2) {
                position: static !important;
            }
            .embed-designer-wrapper :global(.pc-card-v2) {
                min-width: 0 !important;
            }

            /* Card V2 */
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; background: var(--bg-badge); color: var(--primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.3rem; font-weight: 700; color: var(--text-heading); }

            /* Schedule Tabs V2 */
            .pc-schedule-tab-v2 { display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--bg-badge); border: 1.5px solid var(--border); border-radius: 20px; cursor: pointer; transition: 0.3s; position: relative; text-align: left; width: 100%; }
            .pc-schedule-tab-v2:hover { border-color: var(--primary); background: var(--bg-card); }
            .pc-schedule-tab-v2.active { border-color: var(--primary); background: var(--bg-card); box-shadow: 0 8px 20px rgba(0,0,0,0.04); }
            .tab-icon-v2 { width: 44px; height: 44px; background: var(--bg-card); border-radius: 14px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); border: 1.5px solid var(--border); }
            .pc-schedule-tab-v2.active .tab-icon-v2 { color: var(--primary); border-color: var(--primary); }
            .active-glow-v2 { position: absolute; right: 20px; width: 8px; height: 8px; background: var(--primary); border-radius: 50%; box-shadow: 0 0 12px var(--primary); }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; }
            .pc-input-modern-v2 { width: 100%; background: var(--bg-badge); border: 1.5px solid var(--border); border-radius: 14px; padding: 12px 16px; font-weight: 700; color: var(--text-heading); outline: none; transition: 0.2s; font-size: 1rem; }
            .pc-input-modern-v2:focus { border-color: var(--primary); }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-schedule-tab-v2, :global(.light-theme) .pc-btn-save-v2 { box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }

            /* Smart Preview - Theme Aware */
            .pc-smart-preview-v2 { background: linear-gradient(135deg, #0f172a 0%, var(--bg-card) 100%); color: white; borderRadius: 32px; padding: 28px; border: 1px solid var(--border); }
            .smart-icon { color: #10b981; }
            .smart-label { fontWeight: 700; fontSize: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }
            .smart-text { margin: 0; fontSize: 0.85rem; color: rgba(255,255,255,0.7); lineHeight: 1.6; fontWeight: 700; }
            .smart-text code { background: rgba(255,255,255,0.1); color: #fff; padding: 2px 6px; borderRadius: 6px; }

            :global(.light-theme) .pc-smart-preview-v2 {
                background: white !important;
                color: var(--text-heading) !important;
                border: 1px solid var(--border) !important;
                box-shadow: var(--shadow-premium) !important;
            }
            :global(.light-theme) .smart-text {
                color: var(--text-dim) !important;
            }
            :global(.light-theme) .smart-text code {
                background: var(--bg-badge) !important;
                color: var(--primary) !important;
            }
        `}</style>
    </div>
  );
}
