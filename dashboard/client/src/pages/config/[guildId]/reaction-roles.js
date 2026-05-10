import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, MousePointer2, Plus, Trash2, Send, Layout, Palette, Type, Layers, Smile, ChevronDown, 
    ChevronUp, AlertCircle, Settings2, Sun, Moon, Monitor, Smartphone, Power, Hash, Sparkles, 
    Trash, ChevronRight, ArrowRight, CheckCircle2, Box, Sparkle, RefreshCcw, Command,
    Fingerprint, Zap, AlignLeft, Paintbrush, GripVertical
} from 'lucide-react';
import { DiscordSelector, CustomSelect } from '../../../components/LazyConfigComponents';
import EmojiInput from '../../../components/EmojiInput';
import EmbedPreviewContainer from '../../../components/EmbedPreviewContainer';
import Head from 'next/head';

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
  const [previewTheme, setPreviewTheme] = useState('dark');
  const [isPreviewMobile, setIsPreviewMobile] = useState(false);
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
              name: 'Main Roles Panel',
              channelId: '',
              messageId: null,
              type: 'BUTTON',
              roles: [
                  { roleId: '', emoji: '✨', label: 'Assign Role', style: 'PRIMARY' }
              ],
              embed: {
                  title: '✨ SELECT YOUR ROLES',
                  description: 'Interact with the components below to customize your experience on the server.',
                  color: '#6366f1',
                  footer: 'Powered by Verix Studio'
              }
          };
          rrConfig.panels = [defaultPanel];
          setActivePanelId(defaultPanel.id);
      } else if (!activePanelId) {
          setActivePanelId(rrConfig.panels[0].id);
      }
      setConfig(rrConfig);
      setRoles(discordRes.roles || discordRes.data?.roles || []);
      setChannels((discordRes.channels || discordRes.data?.channels || []).filter(c => c.type === 0 || c.type === 5));
    } catch (e) {
      console.error("RR config load error:", e);
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [guildId, mounted]);

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
      if (!confirm("Sei sicuro di voler eliminare definitivamente questo pannello dallo Studio?")) return;
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
      const newRoles = [...panel.roles, { roleId: '', emoji: '💠', label: 'New Role', style: 'PRIMARY' }];
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
                        {config.enabled ? t('rr.active_tag') : t('rr.standby_tag')}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-badge)', padding: '10px 20px', borderRadius: '14px', border: '1.5px solid var(--border)' }}>
                    <label className="pc-toggle-v2" style={{ position: 'relative', width: '42px', height: '22px' }}>
                        <input 
                            type="checkbox" 
                            style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                            checked={config.enabled} 
                            onChange={() => setConfig({...config, enabled: !config.enabled})} 
                        />
                        <span style={{ 
                            position: 'absolute', cursor: 'pointer', inset: 0, 
                            background: config.enabled ? '#10b981' : '#ef4444', 
                            transition: '.4s', borderRadius: '34px' 
                        }}>
                            <span style={{
                                position: 'absolute', content: '""', height: '16px', width: '16px', 
                                left: config.enabled ? '23px' : '3px', bottom: '3px', 
                                background: '#fff', transition: '.4s', borderRadius: '50%'
                            }}></span>
                        </span>
                    </label>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: config.enabled ? '#10b981' : '#ef4444' }}>
                        {config.enabled ? t('common.active') : t('common.inactive')}
                    </span>
                </div>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('rr.sync_studio')}</span>
                </button>
            </div>
        </header>

        <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '32px' }}>
            {/* Sidebar Navigator V2 */}
            <aside className="v-stack animate slide-up" style={{ gap: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="v-stack">
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('rr.fleet_repo')}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>{config.panels.length} {t('rr.panels')}</span>
                    </div>
                    <button onClick={addPanel} className="pc-btn-icon-v2"><Plus size={20} /></button>
                </div>
                <div className="v-stack" style={{ gap: '12px' }}>
                    {config.panels.map(p => (
                        <button 
                            key={p.id}
                            className={`pc-panel-nav-btn-v2 ${activePanelId === p.id ? 'active' : ''}`}
                            onClick={() => setActivePanelId(p.id)}
                        >
                            <div className="nav-icon"><Layout size={20} /></div>
                            <div className="nav-info">
                                <span className="nav-name">{p.name}</span>
                                <span className="nav-meta">{p.roles.length} {t('rr.roles')} • {p.type}</span>
                            </div>
                            {activePanelId === p.id && <ChevronRight size={16} />}
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Studio Area V2 */}
            <main className="pc-studio-content-v2">
                {activePanel ? (
                    <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                        <div className="pc-card-v2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="v-stack" style={{ gap: '4px' }}>
                                <h2 style={{ margin: 0, fontFamily: 'Inter', fontWeight: 700, fontSize: '1.6rem', color: 'var(--text-heading)' }}>{activePanel.name}</h2>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ID: {activePanel.id}</span>
                            </div>
                            <button className="pc-btn-primary" onClick={() => handleDeploy(activePanel.id)}>
                                <Send size={18} /> <span>{t('rr.launch_panel')}</span>
                            </button>
                        </div>

                        <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
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
                                            <DiscordSelector type="channel" options={channels} value={activePanel.channelId || ''} onChange={val => updatePanel(activePanel.id, { channelId: val })} />
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
                                            <textarea className="pc-input-modern-v2" style={{ minHeight: '100px' }} value={activePanel.embed.description} onChange={e => updatePanel(activePanel.id, { embed: { ...activePanel.embed, description: e.target.value } })} />
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
                                        <div className="v-stack" style={{ gap: '16px' }}>
                                            {activePanel.roles.map((role, idx) => (
                                                <div key={idx} className="pc-button-builder animate slide-up">
                                                    <div className="pc-bb-left">
                                                        <GripVertical size={20} color="rgba(255,255,255,0.2)" style={{ cursor: 'grab' }} />
                                                    </div>
                                                    <div className="pc-bb-content">
                                                        <div className="pc-bb-top-row">
                                                            <div className={`pc-bb-preview ${role.style || 'PRIMARY'}`}>
                                                                <span>{role.emoji || '🎫'}</span>
                                                                <span>{role.label || 'Select Role'}</span>
                                                            </div>
                                                            <div className="pc-bb-controls">
                                                                <button onClick={() => {
                                                                    const newRoles = activePanel.roles.filter((_, i) => i !== idx);
                                                                    updatePanel(activePanel.id, { roles: newRoles });
                                                                }} className="pc-bb-trash">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="pc-bb-columns">
                                                            <div className="pc-bb-col" style={{ width: '44px' }}>
                                                                <label>{t('common.emoji')}</label>
                                                                <div className="pc-bb-emoji-box">
                                                                    <EmojiInput value={role.emoji || '🎫'} hideInput={true} onChange={e => {
                                                                        const newRoles = [...activePanel.roles];
                                                                        newRoles[idx].emoji = e.target.value;
                                                                        updatePanel(activePanel.id, { roles: newRoles });
                                                                    }} />
                                                                </div>
                                                            </div>
                                                            <div className="pc-bb-col">
                                                                <label>{t('rr.label')}</label>
                                                                <div className="pc-bb-input-box">
                                                                    <input value={role.label || ''} onChange={e => {
                                                                        const newRoles = [...activePanel.roles];
                                                                        newRoles[idx].label = e.target.value;
                                                                        updatePanel(activePanel.id, { roles: newRoles });
                                                                    }} placeholder="Select Role" />
                                                                </div>
                                                            </div>
                                                            <div className="pc-bb-col">
                                                                <label>{t('common.color')}</label>
                                                                <div className="pc-bb-color-picker">
                                                                    {['PRIMARY', 'SUCCESS', 'DANGER', 'SECONDARY'].map(styleOption => (
                                                                        <div 
                                                                            key={styleOption}
                                                                            className={`pc-bb-swatch swatch-${styleOption} ${(role.style || 'PRIMARY') === styleOption ? 'active' : ''}`}
                                                                            onClick={() => {
                                                                                const newRoles = [...activePanel.roles];
                                                                                newRoles[idx].style = styleOption;
                                                                                updatePanel(activePanel.id, { roles: newRoles });
                                                                            }}
                                                                        >
                                                                            {(role.style || 'PRIMARY') === styleOption && <CheckCircle2 size={12} color="#fff" />}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="pc-input-group-v2" style={{ marginTop: '10px' }}>
                                                            <label>{t('rr.role')}</label>
                                                            <DiscordSelector type="role" options={roles} value={role.roleId} onChange={val => {
                                                                const newRoles = [...activePanel.roles];
                                                                newRoles[idx].roleId = val;
                                                                updatePanel(activePanel.id, { roles: newRoles });
                                                            }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                <button onClick={() => removePanel(activePanel.id)} className="pc-btn-danger-studio-v2">
                                    <Trash2 size={18} /> <span>{t('rr.del_panel')}</span>
                                </button>
                            </div>

                            <aside style={{ position: 'sticky', top: '32px', height: 'fit-content' }}>
                                <EmbedPreviewContainer 
                                    data={{
                                        ...activePanel.embed,
                                        buttons: activePanel.type === 'BUTTON' ? activePanel.roles.map(r => ({
                                            label: r.label,
                                            emoji: r.emoji,
                                            style: r.style
                                        })) : []
                                    }} 
                                />
                            </aside>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '100px 32px' }}>
                        <Fingerprint size={64} style={{ color: 'var(--primary)', marginBottom: '24px', opacity: 0.5 }} />
                        <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '2rem', color: 'var(--text-heading)' }}>{t('rr.no_panel_title')}</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>{t('rr.no_panel_desc')}</p>
                        <button onClick={addPanel} className="pc-btn-primary" style={{ margin: '0 auto' }}>
                            <Plus size={20} /> <span>Nuovo Pannello</span>
                        </button>
                    </div>
                )}
            </main>
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1500px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
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

            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: var(--bg-badge); }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.3rem; font-weight: 700; color: var(--text-heading); }

            .pc-sub-card-v2 { background: var(--bg-badge); padding: 24px; border-radius: 20px; border: 1.5px solid var(--border); }
            .pc-btn-icon-danger-v2 { width: 36px; height: 36px; border-radius: 10px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }

            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; display: block; }
            .pc-input-modern-v2 { width: 100%; background: var(--bg-badge); border: 1.5px solid var(--border); border-radius: 14px; padding: 12px 16px; font-weight: 700; color: var(--text-heading); outline: none; transition: 0.2s; }
            .pc-input-modern-v2:focus { border-color: var(--primary); }

            .pc-btn-danger-studio-v2 { width: 100%; padding: 16px; background: rgba(239, 68, 68, 0.05); color: #ef4444; border: 1.5px solid rgba(239, 68, 68, 0.1); border-radius: 20px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; }
            .pc-btn-danger-studio-v2:hover { background: #ef4444; color: #fff; }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
