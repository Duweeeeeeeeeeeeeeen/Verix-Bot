import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, MousePointer2, Plus, Trash2, Send, Layout, Palette, Type, Layers, Smile, ChevronDown, 
    ChevronUp, AlertCircle, Settings2, Sun, Moon, Monitor, Smartphone, Power, Hash, Sparkles, 
    Trash, ChevronRight, ArrowRight, CheckCircle2, Box, Sparkle, RefreshCcw, Command,
    Fingerprint, Zap, AlignLeft, Paintbrush, GripVertical, RotateCcw, MessageSquare
} from 'lucide-react';
import { DiscordSelector, CustomSelect, SystemMessagesSection } from '../../../components/LazyConfigComponents';
import EmojiInput from '../../../components/EmojiInput';
import EmbedPreviewDrawer from '../../../components/EmbedPreviewDrawer';
import Head from 'next/head';

const countryCodeToFlagEmoji = (code) => {
  if (!code || typeof code !== 'string') return code;
  const clean = code.toUpperCase().trim();
  if (clean.length === 2 && /^[A-Z]{2}$/.test(clean)) {
    return String.fromCodePoint(
      clean.charCodeAt(0) - 65 + 0x1F1E6,
      clean.charCodeAt(1) - 65 + 0x1F1E6
    );
  }
  return code;
};

export default function ReactionRolesConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [roles, setRoles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [activePanelId, setActivePanelId] = useState(null);
  const [activeTab, setActiveTab] = useState('settings');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    if (!guildId || !mounted) return;
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [configRes, discordRes] = await Promise.all([
        api.request(`/config/${guildId}`).catch(() => ({ reactionRoles: {} })),
        api.request(`/config/${guildId}/discord-data`).catch(() => ({ roles: [], channels: [] }))
      ]);
      
      let rrConfig = configRes.data?.reactionRoles || configRes.reactionRoles || { enabled: false, panels: [] };
      if (!rrConfig.panels || rrConfig.panels.length === 0) {
          const defaultPanel = {
              id: 'panel-' + Math.random().toString(36).substr(2, 4),
              name: t('rr.panel_default_name'),
              channelId: '',
              messageId: null,
              type: 'BUTTON',
              roles: [
                  { roleId: '', emoji: '✨', label: t('rr.slot_default_label'), style: 'PRIMARY' }
              ],
              embed: {
                  title: t('rr.panel_default_title'),
                  description: t('rr.panel_default_desc'),
                  color: '#6366f1',
                  footer: t('rr.panel_default_footer')
              }
          };
          rrConfig.panels = [defaultPanel];
          setActivePanelId(defaultPanel.id);
      } else if (!activePanelId) {
          setActivePanelId(rrConfig.panels[0].id);
      }
      
      // Sanitize loaded panel emojis
      if (rrConfig.panels) {
        rrConfig.panels.forEach(p => {
          if (p.roles) {
            p.roles.forEach(r => {
              if (r.emoji) r.emoji = countryCodeToFlagEmoji(r.emoji);
            });
          }
        });
      }

      setConfig(rrConfig);
      setRoles(discordRes.roles || discordRes.data?.roles || []);
      setChannels((discordRes.channels || discordRes.data?.channels || []).filter(c => c.type === 0 || c.type === 5));
    } catch (e) {
      if (!api.isAuthError(e)) {
        console.error("RR config load error:", e);
      }
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [guildId, mounted]);

  const handleReset = async () => {
    if (!confirm(t('common.reset_confirm'))) return;
    
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const res = await api.request(`/config/${guildId}/reaction-roles/reset`, { method: 'POST' });
      if (res.success) {
        let rrConfig = res.data;
        if (rrConfig && rrConfig.panels) {
          rrConfig.panels.forEach(p => {
            if (p.roles) {
              p.roles.forEach(r => {
                if (r.emoji) r.emoji = countryCodeToFlagEmoji(r.emoji);
              });
            }
          });
        }
        setConfig(rrConfig);
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.reset_success'), type: 'success' } }));
      }
    } catch (error) {
      if (!api.isAuthError(error)) {
        console.error("Reset error:", error);
      }
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.reset_error'), type: 'error' } }));
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/reaction-roles`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('rr.sync_success'), type: 'success' } }));
    } catch (e) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.save_error'), type: 'error' } }));
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleDeploy = async (panelId) => {
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await handleSave();
      const res = await api.request(`/config/${guildId}/reaction-roles/deploy/${panelId}`, { method: 'POST' });
      if (res.success) {
          window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('rr.panel_success'), type: 'success' } }));
          const newPanels = config.panels.map(p => p.id === panelId ? { ...p, messageId: res.messageId } : p);
          setConfig({ ...config, panels: newPanels });
      }
    } catch (e) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('rr.panel_error'), type: 'error' } }));
    } finally {
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const addPanel = () => {
      const newPanel = {
          id: 'panel-' + Math.random().toString(36).substr(2, 6),
          name: 'New Custom Panel',
          channelId: '',
          messageId: null,
          type: 'BUTTON',
          roles: [],
          embed: {
              title: 'CUSTOM ROLES',
              description: 'Select your preferred roles below.',
              color: '#6366f1',
              footer: 'Verix • Interaction Studio'
          }
      };
      setConfig({ ...config, panels: [...config.panels, newPanel] });
      setActivePanelId(newPanel.id);
  };

  const removePanel = (id) => {
      if (!confirm(t('rr.delete_confirm'))) return;
      const filtered = config.panels.filter(p => p.id !== id);
      setConfig({ ...config, panels: filtered });
      if (activePanelId === id) setActivePanelId(filtered[0]?.id || null);
  };

  const updatePanel = (id, data) => {
      setConfig({
          ...config,
          panels: config.panels.map(p => p.id === id ? { ...p, ...data } : p)
      });
  };

  const addRole = (panelId) => {
      const panel = config.panels.find(p => p.id === panelId);
      if (panel.roles.length >= 25) return window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('rr.max_components'), type: 'error' } }));
      const newRoles = [...panel.roles, { id: 'role-' + Math.random().toString(36).substr(2, 6), roleId: '', emoji: '💠', label: 'New Role', style: 'PRIMARY' }];
      updatePanel(panelId, { roles: newRoles });
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  const activePanel = config.panels.find(p => p.id === activePanelId);

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('rr.title')} | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
                    <Fingerprint size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('rr.title')}</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? t('common.active_system') : t('common.inactive_system')}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <div className="pc-toggle-container-v2">
                    <label className="pc-toggle-v2">
                        <input 
                            type="checkbox" 
                            checked={config.enabled} 
                            onChange={() => setConfig({...config, enabled: !config.enabled})} 
                        />
                        <span className="pc-slider-v2"></span>
                    </label>
                    <span className={config.enabled ? 'text-active' : 'text-inactive'}>
                        {config.enabled ? t('common.active') : t('common.inactive')}
                    </span>
                </div>
                <div className="pc-header-divider"></div>
                <button className="pc-btn-outline-v2" onClick={handleReset} title={t('common.reset_to_default')}>
                    <RotateCcw size={18} />
                </button>
                {activePanel && (
                    <button 
                        className="pc-btn-outline-v2" 
                        onClick={() => handleDeploy(activePanel.id)} 
                        disabled={saving || !activePanel.channelId} 
                        title={t('rr.launch_panel') || 'Invia Pannello'}
                        style={{ color: 'var(--primary)', borderColor: 'rgba(var(--primary-rgb), 0.2)' }}
                    >
                        <Send size={18} />
                    </button>
                )}
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('common.save_changes')}</span>
                </button>
            </div>
        </header>

        {/* Fleet Repository Horizontal Top Bar */}
        <section className="rr-top-bar animate slide-up">
            <div className="top-bar-header">
                <div className="v-stack">
                    <span className="top-bar-label">{t('rr.fleet_repo')}</span>
                    <span className="top-bar-count">{config.panels.length} {t('rr.panels')}</span>
                </div>
                <button onClick={addPanel} className="pc-btn-icon-v2 add-panel-btn"><Plus size={20} /></button>
            </div>
            <div className="rr-horizontal-list">
                {config.panels.map(p => (
                    <button 
                        key={p.id}
                        className={`pc-panel-nav-btn-horizontal ${activePanelId === p.id ? 'active' : ''}`}
                        onClick={() => setActivePanelId(p.id)}
                    >
                        <div className="nav-icon-horizontal"><Layout size={18} /></div>
                        <div className="nav-info-horizontal">
                            <span className="nav-name-horizontal">{p.name}</span>
                            <span className="nav-meta-horizontal">{p.roles.length} {t('rr.roles')} • {p.type}</span>
                        </div>
                    </button>
                ))}
            </div>
        </section>

        <div className="pc-layout-grid-v2 rr-layout-outer">
            {/* Main Studio Area V2 */}
            <main className="pc-studio-content-v2">
                <nav className="pc-tabs-v2" style={{ marginBottom: '32px' }}>
                    <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                        <Layout size={16} /> <span>{t('rr.tab_studio')}</span>
                    </button>
                </nav>

                {activeTab === 'settings' && activePanel && (
                    <div className="v-stack animate slide-up" style={{ gap: '20px' }}>
                        <section className="pc-card-v2 preview-action-bar">
                            <div>
                                <h3 style={{ margin: 0 }}>{activePanel.name || t('rr.panel_identity')}</h3>
                                <p>{t('rr.panel_meta', {
                                    roles: activePanel.roles.length,
                                    type: activePanel.type === 'REACTION' ? t('rr.reactions') : t('rr.buttons'),
                                    channel: activePanel.channelId ? t('rr.channel_selected') : t('rr.channel_missing')
                                })}</p>
                            </div>
                            <div className="preview-action-buttons">
                                <button className="pc-btn-outline-v2 preview-action-btn" onClick={() => setPreviewOpen(true)}>
                                    <Monitor size={18} /> <span>{t('common.preview')}</span>
                                </button>
                                <button onClick={() => handleDeploy(activePanel.id)} className="pc-btn-primary preview-action-btn" disabled={saving || !activePanel.channelId}>
                                    <Send size={18} /> <span>{t('rr.launch_panel') || 'Send Panel'}</span>
                                </button>
                            </div>
                        </section>

                        <div className="pc-layout-grid-v2 rr-layout-inner">
                            <div className="v-stack" style={{ gap: '32px' }}>
                                <section className="pc-card-v2">
                                    <div className="card-header-v2">
                                        <div className="header-icon"><Settings2 size={18} /></div>
                                        <h3 style={{ margin: 0 }}>{t('rr.panel_identity')}</h3>
                                    </div>
                                    <div className="card-body-v2">
                                        <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <div className="pc-input-group-v2">
                                                <label>{t('rr.display_name')}</label>
                                                <input className="pc-input-modern-v2" value={activePanel.name} onChange={e => updatePanel(activePanel.id, { name: e.target.value })} />
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>{t('rr.interaction')}</label>
                                                <CustomSelect 
                                                    options={[
                                                        { value: 'BUTTON', label: 'Buttons (V2)' },
                                                        { value: 'REACTION', label: 'Reactions (Classic)' }
                                                    ]} 
                                                    value={activePanel.type || 'BUTTON'} 
                                                    onChange={val => updatePanel(activePanel.id, { type: val })} 
                                                />
                                            </div>
                                        </div>
                                        <div className="pc-input-group-v2" style={{ marginTop: '20px' }}>
                                            <label>{t('rr.target_channel')}</label>
                                            <DiscordSelector type="channel" options={channels} value={activePanel.channelId || ''} onChange={val => updatePanel(activePanel.id, { channelId: val })} error={config.enabled && !activePanel.channelId ? t('common.required_field') : ''} />
                                        </div>
                                    </div>
                                </section>

                                <section className="pc-card-v2">
                                    <div className="card-header-v2">
                                        <div className="header-icon"><Palette size={18} /></div>
                                        <h3 style={{ margin: 0 }}>{t('rr.design_studio')}</h3>
                                    </div>
                                    <div className="card-body-v2">
                                        <div className="pc-input-group-v2">
                                            <label>{t('rr.embed_title')}</label>
                                            <input className="pc-input-modern-v2" value={activePanel.embed.title} onChange={e => updatePanel(activePanel.id, { embed: { ...activePanel.embed, title: e.target.value } })} />
                                        </div>
                                        <div className="pc-input-group-v2" style={{ marginTop: '20px' }}>
                                            <label>{t('rr.embed_desc')}</label>
                                            <textarea className="pc-input-modern-v2" style={{ minHeight: '220px' }} value={activePanel.embed.description} onChange={e => updatePanel(activePanel.id, { embed: { ...activePanel.embed, description: e.target.value } })} />
                                        </div>
                                        <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 180px) 1fr', gap: '16px', marginTop: '20px' }}>
                                            <div className="pc-input-group-v2">
                                                <label>{t('common.color')}</label>
                                                <input
                                                    type="color"
                                                    className="pc-input-modern-v2"
                                                    value={activePanel.embed.color || '#5865F2'}
                                                    onChange={e => updatePanel(activePanel.id, { embed: { ...activePanel.embed, color: e.target.value } })}
                                                />
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>Footer</label>
                                                <input
                                                    className="pc-input-modern-v2"
                                                    value={activePanel.embed.footer || ''}
                                                    onChange={e => updatePanel(activePanel.id, { embed: { ...activePanel.embed, footer: e.target.value } })}
                                                />
                                            </div>
                                        </div>
                                        <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
                                            <div className="pc-input-group-v2">
                                                <label>Thumbnail URL</label>
                                                <input
                                                    className="pc-input-modern-v2"
                                                    value={activePanel.embed.thumbnail || ''}
                                                    onChange={e => updatePanel(activePanel.id, { embed: { ...activePanel.embed, thumbnail: e.target.value } })}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>Image URL</label>
                                                <input
                                                    className="pc-input-modern-v2"
                                                    value={activePanel.embed.image || ''}
                                                    onChange={e => updatePanel(activePanel.id, { embed: { ...activePanel.embed, image: e.target.value } })}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="pc-card-v2">
                                    <div className="card-header-v2">
                                        <div className="header-icon"><Layers size={18} /></div>
                                        <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 style={{ margin: 0 }}>{t('rr.role_matrix')}</h3>
                                            <button className="pc-btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => addRole(activePanel.id)}>
                                                <Plus size={16} /> <span>{t('rr.add_slot')}</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body-v2">
                                        <div className="v-stack" style={{ gap: '12px' }}>
                                            {activePanel.roles.map((role, idx) => (
                                                <div key={role.id || role._id || idx} className="pc-button-builder animate slide-up" style={{ minHeight: 'auto' }}>
                                                    <div className="pc-bb-left" style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center', justifyContent: 'center', padding: '0 8px', borderRight: '1.5px solid var(--border)' }}>
                                                        <button 
                                                            disabled={idx === 0} 
                                                            onClick={() => {
                                                                if (idx === 0) return;
                                                                const newRoles = [...activePanel.roles];
                                                                const temp = newRoles[idx];
                                                                newRoles[idx] = newRoles[idx - 1];
                                                                newRoles[idx - 1] = temp;
                                                                updatePanel(activePanel.id, { roles: newRoles });
                                                            }}
                                                            className="pc-bb-reorder-btn"
                                                            title={t('rr.move_up') || 'Sposta su'}
                                                        >
                                                            <ChevronUp size={14} />
                                                        </button>
                                                        <GripVertical size={14} color="rgba(255,255,255,0.2)" />
                                                        <button 
                                                            disabled={idx === activePanel.roles.length - 1} 
                                                            onClick={() => {
                                                                if (idx === activePanel.roles.length - 1) return;
                                                                const newRoles = [...activePanel.roles];
                                                                const temp = newRoles[idx];
                                                                newRoles[idx] = newRoles[idx + 1];
                                                                newRoles[idx + 1] = temp;
                                                                updatePanel(activePanel.id, { roles: newRoles });
                                                            }}
                                                            className="pc-bb-reorder-btn"
                                                            title={t('rr.move_down') || 'Sposta giù'}
                                                        >
                                                            <ChevronDown size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="pc-bb-content" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', padding: '12px 16px', flex: 1, flexWrap: 'nowrap' }}>
                                                        {/* Emoji Box */}
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '44px' }}>
                                                            <label style={{ fontSize: '0.62rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('common.emoji')}</label>
                                                            <div className="pc-bb-emoji-box" style={{ width: '44px', height: '44px' }}>
                                                                <EmojiInput hideInput={true} value={role.emoji} onChange={e => {
                                                                    const newRoles = [...activePanel.roles];
                                                                    newRoles[idx].emoji = countryCodeToFlagEmoji(e.target.value);
                                                                    updatePanel(activePanel.id, { roles: newRoles });
                                                                }} />
                                                            </div>
                                                        </div>

                                                        {/* Label Input */}
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 150px', marginLeft: '12px' }}>
                                                            <label style={{ fontSize: '0.62rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('rr.label')}</label>
                                                            <input 
                                                                className="pc-input-modern-v2"
                                                                style={{ height: '44px', width: '100%', fontSize: '0.9rem', padding: '0 16px' }}
                                                                value={role.label || ''} 
                                                                onChange={e => {
                                                                    const newRoles = [...activePanel.roles];
                                                                    newRoles[idx].label = e.target.value;
                                                                    updatePanel(activePanel.id, { roles: newRoles });
                                                                }} 
                                                                placeholder={t('rr.slot_default_label') || "Select Role"} 
                                                            />
                                                        </div>

                                                        {/* Discord Role Selector */}
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1.5 1 180px' }}>
                                                            <label style={{ fontSize: '0.62rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('rr.role')}</label>
                                                            <DiscordSelector type="role" options={roles} value={role.roleId} onChange={val => {
                                                                const newRoles = [...activePanel.roles];
                                                                newRoles[idx].roleId = val;
                                                                updatePanel(activePanel.id, { roles: newRoles });
                                                            }} />
                                                        </div>

                                                        {/* Color Swatches */}
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '135px' }}>
                                                            <label style={{ fontSize: '0.62rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('common.color')}</label>
                                                            <div className="pc-bb-color-picker" style={{ height: '44px', padding: '0 8px', gap: '6px', width: '100%' }}>
                                                                {['PRIMARY', 'SUCCESS', 'DANGER', 'SECONDARY'].map(styleOption => (
                                                                    <div 
                                                                        key={styleOption}
                                                                        className={`pc-bb-swatch swatch-${styleOption} ${(role.style || 'PRIMARY') === styleOption ? 'active' : ''}`}
                                                                        style={{ width: '20px', height: '20px' }}
                                                                        onClick={() => {
                                                                            const newRoles = [...activePanel.roles];
                                                                            newRoles[idx].style = styleOption;
                                                                            updatePanel(activePanel.id, { roles: newRoles });
                                                                        }}
                                                                    >
                                                                        {(role.style || 'PRIMARY') === styleOption && <CheckCircle2 size={10} color="#fff" />}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Trash Button */}
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '40px' }}>
                                                            <label style={{ fontSize: '0.62rem', fontWeight: '800', opacity: 0, userSelect: 'none' }}>DEL</label>
                                                            <button onClick={() => {
                                                                const newRoles = activePanel.roles.filter((_, i) => i !== idx);
                                                                updatePanel(activePanel.id, { roles: newRoles });
                                                            }} className="pc-bb-trash" style={{ width: '40px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                            </div>

                            <aside className="v-stack" style={{ gap: '16px' }}>
                                <section className="pc-card-v2 rr-summary-card">
                                    <div className="card-header-v2">
                                        <div className="header-icon"><Layout size={18} /></div>
                                        <h3 style={{ margin: 0 }}>{t('rr.panel_summary')}</h3>
                                    </div>
                                    <div className="v-stack" style={{ gap: '12px' }}>
                                        <div className="rr-summary-row">
                                            <span>{t('rr.target_channel')}</span>
                                            <strong className={activePanel.channelId ? 'ok' : 'warn'}>{activePanel.channelId ? t('rr.selected') : t('rr.missing')}</strong>
                                        </div>
                                        <div className="rr-summary-row">
                                            <span>{t('rr.interaction')}</span>
                                            <strong>{activePanel.type === 'REACTION' ? t('rr.reactions') : t('rr.buttons')}</strong>
                                        </div>
                                        <div className="rr-summary-row">
                                            <span>{t('rr.role_matrix')}</span>
                                            <strong>{activePanel.roles.length}</strong>
                                        </div>
                                        <div className="rr-summary-row">
                                            <span>{t('rr.embed_title')}</span>
                                            <strong>{activePanel.embed.title ? t('rr.ready') : t('rr.missing')}</strong>
                                        </div>
                                    </div>
                                </section>

                                <button onClick={() => removePanel(activePanel.id)} className="pc-btn-danger-studio-v2 rr-danger-action">
                                    <Trash2 size={18} /> <span>{t('rr.del_panel')}</span>
                                </button>
                                <EmbedPreviewDrawer
                                    open={previewOpen}
                                    onClose={() => setPreviewOpen(false)}
                                    data={{
                                        ...activePanel.embed,
                                        type: activePanel.type,
                                        buttons: activePanel.type === 'BUTTON' ? activePanel.roles.map(r => ({
                                            label: r.label,
                                            emoji: r.emoji,
                                            style: r.style
                                        })) : [],
                                        reactions: activePanel.type === 'REACTION' ? activePanel.roles.map(r => ({
                                            emoji: r.emoji
                                        })) : []
                                    }}
                                />
                            </aside>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && !activePanel && (
                    <div style={{ textAlign: 'center', padding: '100px 32px' }}>
                        <Fingerprint size={64} style={{ color: 'var(--primary)', marginBottom: '24px', opacity: 0.5 }} />
                        <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '2rem', color: 'var(--text-heading)' }}>{t('rr.no_panel_title')}</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>{t('rr.no_panel_desc')}</p>
                        <button onClick={addPanel} className="pc-btn-primary" style={{ margin: '0 auto' }}>
                            <Plus size={20} /> <span>{t('rr.new_panel')}</span>
                        </button>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="v-stack animate slide-up">
                        <SystemMessagesSection 
                            config={config}
                            onUpdate={setConfig}
                            messages={[
                                { key: 'role_added', label: t('rr.msg_role_added'), placeholder: t('rr.msg_role_added_placeholder') },
                                { key: 'role_removed', label: t('rr.msg_role_removed'), placeholder: t('rr.msg_role_removed_placeholder') },
                                { key: 'error', label: t('rr.msg_error'), placeholder: t('rr.msg_error_placeholder') }
                            ]}
                        />
                    </div>
                )}
            </main>
        </div>

        <style jsx>{`
            .rr-layout-outer { display: block !important; }
            .rr-layout-inner { display: grid !important; grid-template-columns: minmax(0, 1fr) 320px !important; gap: 24px !important; align-items: start !important; }
            .pc-premium-wrapper { padding: 32px; max-width: 1650px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            .preview-action-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 20px !important; }
            .preview-action-bar p { margin: 4px 0 0 0; color: var(--text-muted); font-size: 0.85rem; font-weight: 650; }
            .preview-action-buttons { display: flex; align-items: center; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
            .preview-action-btn { min-height: 44px; justify-content: center; }
            .rr-summary-card { position: sticky; top: 24px; padding: 20px !important; }
            .rr-summary-card .card-header-v2 { margin-bottom: 16px; }
            .rr-summary-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
            .rr-summary-row:last-child { border-bottom: none; }
            .rr-summary-row span { color: var(--text-muted); font-size: 0.78rem; font-weight: 750; }
            .rr-summary-row strong { color: var(--text-heading); font-size: 0.82rem; font-weight: 800; text-align: right; }
            .rr-summary-row strong.ok { color: #10b981; }
            .rr-summary-row strong.warn { color: #ef4444; }
            .rr-danger-action { border-radius: 16px !important; }

            /* Horizontal Top Bar styles */
            .rr-top-bar { display: flex; align-items: center; gap: 24px; padding: 16px 24px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; box-shadow: var(--shadow-premium); margin-bottom: 32px; }
            .top-bar-header { display: flex; align-items: center; gap: 16px; padding-right: 24px; border-right: 1.5px solid var(--border); }
            .top-bar-label { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
            .top-bar-count { font-size: 0.8rem; font-weight: 800; color: var(--primary); }
            .add-panel-btn { width: 36px !important; height: 36px !important; border-radius: 10px !important; }
            
            .rr-horizontal-list { display: flex; gap: 12px; overflow-x: auto; padding: 4px 0; flex: 1; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
            .rr-horizontal-list::-webkit-scrollbar { height: 4px; }
            .rr-horizontal-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
            
            .pc-panel-nav-btn-horizontal { display: flex; align-items: center; gap: 12px; padding: 10px 18px; background: var(--bg-badge); border: 1.5px solid var(--border); border-radius: 16px; cursor: pointer; transition: all 0.2s ease; flex-shrink: 0; }
            .pc-panel-nav-btn-horizontal:hover { border-color: var(--primary); }
            .pc-panel-nav-btn-horizontal.active { background: var(--bg-card); border-color: var(--primary); box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.08); }
            
            .nav-icon-horizontal { width: 32px; height: 32px; border-radius: 8px; background: var(--bg-card); display: flex; align-items: center; justify-content: center; color: var(--text-muted); transition: 0.2s; }
            .pc-panel-nav-btn-horizontal.active .nav-icon-horizontal { color: var(--primary); background: var(--bg-badge); }
            
            .nav-info-horizontal { display: flex; flex-direction: column; text-align: left; }
            .nav-name-horizontal { font-weight: 700; color: var(--text-heading); font-size: 0.85rem; }
            .nav-meta-horizontal { font-size: 0.62rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; }

            @media (max-width: 1200px) {
                .rr-layout-inner { grid-template-columns: 1fr !important; gap: 24px !important; }
                .rr-summary-card { position: static; }
            }
            @media (max-width: 992px) {
                .rr-top-bar { flex-direction: column; align-items: stretch; gap: 16px; }
                .top-bar-header { border-right: none; border-bottom: 1.5px solid var(--border); padding-right: 0; padding-bottom: 16px; justify-content: space-between; }
            }
            @media (max-width: 720px) {
                .preview-action-bar { align-items: stretch; flex-direction: column; }
                .preview-action-buttons { justify-content: stretch; }
                .preview-action-buttons button { width: 100%; }
            }
            
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; color: #fff; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
            .pc-title-row h1 { font-family: 'Inter'; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 6px; font-size: 0.65rem; font-weight: 700; padding: 4px 10px; border-radius: 100px;  width: fit-content; }
            .pc-status-tag-v2.on { background: rgba(16, 185, 129, 0.1); color: #10b981; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: #ef4444; }
            .status-dot-v2 { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: var(--bg-badge); color: var(--text-muted); border: 1.5px solid var(--border); padding: 12px 24px; border-radius: 16px; font-weight: 700; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: rgba(var(--primary-rgb), 0.1); color: var(--primary); border-color: rgba(var(--primary-rgb), 0.2); }

            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }

            .pc-btn-icon-v2 { width: 40px; height: 40px; border-radius: 12px; background: var(--bg-badge); color: var(--primary); border: 1.5px solid var(--border); cursor: pointer; display: flex; align-items: center; justify-content: center; }

            .pc-panel-nav-btn-v2 { display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--bg-badge); border: 1.5px solid var(--border); border-radius: 20px; cursor: pointer; transition: 0.2s; width: 100%; text-align: left; }
            .pc-panel-nav-btn-v2:hover { border-color: var(--primary); }
            .pc-panel-nav-btn-v2.active { background: var(--bg-card); border-color: var(--primary); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .pc-panel-nav-btn-v2 .nav-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--bg-card); display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
            .pc-panel-nav-btn-v2.active .nav-icon { color: var(--primary); }
            .pc-panel-nav-btn-v2 .nav-info { display: flex; flex-direction: column; flex: 1; }
            .pc-panel-nav-btn-v2 .nav-name { font-weight: 700; color: var(--text-heading); font-size: 1rem; }
            .pc-panel-nav-btn-v2 .nav-meta { font-size: 0.7rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; }

            .pc-btn-danger-studio-v2 { width: 100%; padding: 16px; background: rgba(239, 68, 68, 0.08); color: #ef4444; border: 1.5px solid rgba(239, 68, 68, 0.1); border-radius: 20px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; }
            .pc-btn-danger-studio-v2:hover { background: #ef4444; color: #fff; }

            /* Compact Role Matrix Panels */
            :global(.pc-button-builder) {
                background: var(--bg-elevated, rgba(255,255,255,0.02)) !important;
                border-radius: 16px !important;
                margin-bottom: 0px !important;
            }
            :global(.pc-bb-left) {
                padding: 12px 10px !important;
                border-right: 1.5px solid var(--border) !important;
                width: 44px !important;
            }
            :global(.pc-bb-content) {
                padding: 16px 20px !important;
                gap: 12px !important;
            }
            :global(.pc-bb-top-row) {
                gap: 12px !important;
                margin-bottom: 4px !important;
            }
            :global(.pc-bb-preview) {
                padding: 8px 14px !important;
                font-size: 0.85rem !important;
                min-width: 120px !important;
                border-radius: 8px !important;
                height: 36px !important;
            }
            :global(.pc-bb-trash) {
                width: 32px !important;
                height: 32px !important;
                border-radius: 8px !important;
            }
            :global(.pc-bb-columns) {
                gap: 12px !important;
                align-items: flex-end !important;
            }
            :global(.pc-bb-emoji-box) {
                width: 44px !important;
                height: 44px !important;
                font-size: 1.2rem !important;
                border-radius: 12px !important;
                flex-shrink: 0;
            }
            :global(.pc-bb-col) {
                display: flex;
                flex-direction: column;
                gap: 6px;
                flex: 1;
            }
            :global(.pc-bb-col label) {
                font-size: 0.65rem;
                font-weight: 700;
                color: var(--text-muted);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 2px;
            }
            :global(.pc-bb-input-box) {
                flex: 1 !important;
                height: 44px !important;
                background: var(--bg-badge) !important;
                border: 1.5px solid var(--border) !important;
                border-radius: 12px !important;
                padding: 0 12px !important;
            }
            :global(.pc-bb-input-box input) {
                width: 100%;
                background: transparent !important;
                border: none !important;
                padding: 0 !important;
                font-size: 0.85rem !important;
                font-weight: 600;
                color: var(--text-heading);
                outline: none;
                height: 100% !important;
            }
            :global(.pc-bb-input-box input:focus) {
                border-color: transparent !important;
            }
            :global(.pc-bb-color-picker) {
                height: 44px !important;
                border-radius: 12px !important;
                padding: 0 10px !important;
                gap: 8px !important;
                background: var(--bg-badge) !important;
                border: 1.5px solid var(--border) !important;
            }
            :global(.pc-bb-swatch) {
                width: 18px !important;
                height: 18px !important;
            }

            :global(.pc-bb-reorder-btn) {
                background: transparent !important;
                border: none !important;
                color: var(--text-muted) !important;
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                padding: 4px !important;
                border-radius: 6px !important;
                transition: 0.2s !important;
                opacity: 0.6 !important;
            }
            :global(.pc-bb-reorder-btn:hover:not(:disabled)) {
                background: var(--border) !important;
                color: var(--primary) !important;
                opacity: 1 !important;
            }
            :global(.pc-bb-reorder-btn:disabled) {
                opacity: 0.15 !important;
                cursor: not-allowed !important;
            }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
