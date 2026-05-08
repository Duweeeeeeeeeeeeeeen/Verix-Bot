import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, MousePointer2, Plus, Trash2, Send, Layout, Palette, Type, Layers, Smile, ChevronDown, 
    ChevronUp, AlertCircle, Settings2, Sun, Moon, Monitor, Smartphone, Power, Hash, Sparkles, 
    Trash, ChevronRight, ArrowRight, CheckCircle2, Box, Sparkle, RefreshCcw, Command,
    Fingerprint, Zap, AlignLeft, Paintbrush
} from 'lucide-react';
import { DiscordSelector, CustomSelect } from '../../../components/LazyConfigComponents';
import EmbedPreview from '../../../components/EmbedPreview';
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
      showToast("Configurazione Reaction Roles sincronizzata!");
    } catch (e) {
      showToast("Errore durante il salvataggio.", 'error');
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
          showToast("Pannello inviato correttamente allo Studio!");
          const newPanels = config.panels.map(p => p.id === panelId ? { ...p, messageId: res.messageId } : p);
          setConfig({ ...config, panels: newPanels });
      }
    } catch (e) {
      showToast("Errore invio panel. Verifica i permessi del bot.", 'error');
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
      if (panel.roles.length >= 25) return showToast("Limite massimo raggiunto (25 componenti).", 'error');
      const newRoles = [...panel.roles, { roleId: '', emoji: '💠', label: 'New Role', style: 'PRIMARY' }];
      updatePanel(panelId, { roles: newRoles });
  };

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  const activePanel = config.panels.find(p => p.id === activePanelId);

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>Reaction Roles Studio | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' }}>
                    <Fingerprint size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>Interaction Studio Pro</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? 'SISTEMA INTERAZIONI ATTIVO' : 'SISTEMA IN STANDBY'}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <button 
                  className={`pc-status-toggle-v2 ${config.enabled ? 'active' : ''}`}
                  onClick={() => setConfig({...config, enabled: !config.enabled})}
                >
                  <Power size={18} />
                  <span>{config.enabled ? 'Online' : 'Offline'}</span>
                </button>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? 'Sincronizzazione...' : 'Salva Studio'}</span>
                </button>
            </div>
        </header>

        <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '40px' }}>
            {/* Sidebar Navigator V2 */}
            <aside className="v-stack animate slide-up" style={{ gap: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px' }}>
                    <div className="v-stack">
                        <span style={{ fontSize: '0.75rem', fontWeight: 950, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Fleet Repository</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#6366f1' }}>{config.panels.length} PANNELLI CONFIGURATI</span>
                    </div>
                    <button onClick={addPanel} className="pc-btn-add-mini-v2" style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f5f3ff', border: '1.5px solid #ddd6fe', color: '#6366f1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}><Plus size={20} /></button>
                </div>
                <div className="v-stack" style={{ gap: '14px' }}>
                    {config.panels.map(p => (
                        <button 
                            key={p.id}
                            className={`pc-panel-nav-btn-v2 ${activePanelId === p.id ? 'active' : ''}`}
                            onClick={() => setActivePanelId(p.id)}
                        >
                            <div className="nav-icon" style={{ width: '48px', height: '48px', borderRadius: '14px', background: activePanelId === p.id ? 'white' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: activePanelId === p.id ? '#6366f1' : '#94a3b8', transition: '0.2s' }}>
                                <Layout size={22} />
                            </div>
                            <div className="nav-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', flex: 1 }}>
                                <span className="nav-name" style={{ fontWeight: 950, fontSize: '1.05rem', color: activePanelId === p.id ? '#4338ca' : '#1e293b' }}>{p.name}</span>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>{p.roles.length} RUOLI</span>
                                    <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#cbd5e1' }}></div>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>{p.type}</span>
                                </div>
                            </div>
                            {activePanelId === p.id && <ChevronRight size={18} style={{ color: '#6366f1', opacity: 0.5 }} />}
                        </button>
                    ))}
                </div>

                <div className="pc-pro-tip-v2" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', padding: '24px', borderRadius: '28px', border: '1.5px solid #e2e8f0', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                        <Zap size={18} style={{ color: '#f59e0b' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 950, color: '#1e293b' }}>Studio Pro Tip</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 700, lineHeight: 1.6 }}>Usa i componenti **BUTTON (V2)** per un'interfaccia moderna e pulita. Le reazioni classiche sono ottime per nostalgici ma meno performanti.</p>
                </div>
            </aside>

            {/* Main Studio Area V2 */}
            <main className="pc-studio-content-v2">
                {activePanel ? (
                    <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', background: 'white', padding: '32px', borderRadius: '32px', boxShadow: 'var(--shadow-premium)', border: '1px solid var(--border-light)' }}>
                            <div className="v-stack" style={{ gap: '6px' }}>
                                <h2 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 950, fontSize: '2rem', color: '#1e293b', letterSpacing: '-1px' }}>{activePanel.name}</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div className="pc-id-badge-v2" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f5f3ff', color: '#6366f1', padding: '4px 12px', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 950, border: '1px solid #ddd6fe' }}>
                                        <Command size={10} /> <span>{activePanel.id}</span>
                                    </div>
                                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }}></div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8' }}>PRONTO PER IL DEPLOY</span>
                                </div>
                            </div>
                            <button className="pc-btn-primary" style={{ padding: '16px 32px', borderRadius: '18px', fontSize: '1.05rem' }} onClick={() => handleDeploy(activePanel.id)}>
                                <Send size={20} /> <span>Lancia nello Studio</span>
                            </button>
                        </div>

                        <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 460px', gap: '32px' }}>
                            <div className="v-stack" style={{ gap: '32px' }}>
                                <section className="pc-card-v2">
                                    <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                        <div className="header-icon" style={{ background: '#f8fafc', color: '#1e293b' }}><Settings2 size={18} /></div>
                                        <h3 style={{ margin: 0 }}>Panel Identity</h3>
                                    </div>
                                    <div className="card-body-v2">
                                        <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                                            <div className="pc-input-group-v2">
                                                <label>Nome Visualizzato</label>
                                                <input className="pc-input-modern-v2" style={{ padding: '16px 20px', borderRadius: '18px', fontSize: '1.05rem' }} value={activePanel.name} onChange={e => updatePanel(activePanel.id, { name: e.target.value })} />
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>Metodo Interazione</label>
                                                <CustomSelect 
                                                    options={[
                                                        { value: 'BUTTON', label: 'Componenti Button (V2)' },
                                                        { value: 'REACTION', label: 'Emoji Reaction (Classic)' }
                                                    ]} 
                                                    value={activePanel.type || 'BUTTON'} 
                                                    onChange={val => updatePanel(activePanel.id, { type: val })} 
                                                />
                                            </div>
                                        </div>
                                        <div className="pc-input-group-v2" style={{ marginTop: '32px' }}>
                                            <label>Target Dispatch Channel</label>
                                            <DiscordSelector type="channel" options={channels} value={activePanel.channelId || ''} onChange={val => updatePanel(activePanel.id, { channelId: val })} />
                                        </div>
                                    </div>
                                </section>

                                <section className="pc-card-v2">
                                    <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                        <div className="header-icon" style={{ background: '#f5f3ff', color: '#6366f1' }}><Palette size={18} /></div>
                                        <h3 style={{ margin: 0 }}>Visual Branding Studio</h3>
                                    </div>
                                    <div className="card-body-v2">
                                        <div className="pc-input-group-v2">
                                            <label>Headline Embed</label>
                                            <input className="pc-input-modern-v2" style={{ padding: '16px 20px', borderRadius: '18px' }} value={activePanel.embed.title} onChange={e => updatePanel(activePanel.id, { embed: { ...activePanel.embed, title: e.target.value } })} />
                                        </div>
                                        <div className="pc-input-group-v2" style={{ marginTop: '32px' }}>
                                            <label>Corpo del Messaggio</label>
                                            <textarea className="pc-input-modern-v2" style={{ padding: '20px', borderRadius: '22px', minHeight: '130px', resize: 'none', lineHeight: 1.6 }} value={activePanel.embed.description} onChange={e => updatePanel(activePanel.id, { embed: { ...activePanel.embed, description: e.target.value } })} />
                                        </div>
                                        <div className="pc-input-group-v2" style={{ marginTop: '32px' }}>
                                            <label>Accent Color</label>
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: activePanel.embed.color || '#6366f1', border: '3px solid white', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}></div>
                                                <input type="color" style={{ width: '0', height: '0', opacity: 0, position: 'absolute' }} id="rr-color-studio-input" value={activePanel.embed.color || '#6366f1'} onChange={e => updatePanel(activePanel.id, { embed: { ...activePanel.embed, color: e.target.value } })} />
                                                <button onClick={() => document.getElementById('rr-color-studio-input').click()} className="pc-btn-outline-v2" style={{ background: '#f8fafc', padding: '14px 24px', borderRadius: '14px', fontWeight: 950, fontSize: '0.85rem', border: '1.5px solid #e2e8f0', cursor: 'pointer' }}>HEX PICKER</button>
                                                <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 950, fontFamily: 'monospace' }}>{activePanel.embed.color?.toUpperCase() || '#6366F1'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="pc-card-v2">
                                    <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                        <div className="header-icon" style={{ background: '#fdf4ff', color: '#d946ef' }}><Layers size={18} /></div>
                                        <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 style={{ margin: 0 }}>Role Matrix Studio</h3>
                                            <button className="pc-btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem', borderRadius: '14px', background: 'linear-gradient(135deg, #d946ef 0%, #a855f7 100%)', boxShadow: '0 8px 20px rgba(217, 70, 239, 0.2)' }} onClick={() => addRole(activePanel.id)}>
                                                <Plus size={18} /> <span>Aggiungi Slot</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body-v2">
                                        <div className="v-stack" style={{ gap: '24px' }}>
                                            {activePanel.roles.map((role, idx) => (
                                                <div key={idx} className="pc-role-item-v2 animate slide-up" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '28px', padding: '32px', position: 'relative', transition: '0.3s' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950, color: '#6366f1', fontSize: '0.85rem', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 8px rgba(0,0,0,0.02)' }}>{idx + 1}</div>
                                                            <div className="v-stack">
                                                                <span style={{ fontSize: '0.75rem', fontWeight: 950, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Slot Configuration</span>
                                                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8' }}>MAPPING RUOLO & UI</span>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => {
                                                            const filtered = activePanel.roles.filter((_, i) => i !== idx);
                                                            updatePanel(activePanel.id, { roles: filtered });
                                                        }} className="pc-btn-delete-studio-v2" style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fff1f2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}><Trash2 size={20} /></button>
                                                    </div>
                                                    <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '24px' }}>
                                                        <div className="pc-input-group-v2">
                                                            <label>Target Discord Role</label>
                                                            <DiscordSelector type="role" options={roles} value={role.roleId} onChange={val => {
                                                                const newRoles = [...activePanel.roles];
                                                                newRoles[idx].roleId = val;
                                                                updatePanel(activePanel.id, { roles: newRoles });
                                                            }} />
                                                        </div>
                                                        <div className="pc-input-group-v2">
                                                            <label>Visual Emoji</label>
                                                            <input className="pc-input-modern-v2" style={{ textAlign: 'center', fontSize: '1.5rem', padding: '12px', borderRadius: '16px' }} value={role.emoji} onChange={e => {
                                                                const newRoles = [...activePanel.roles];
                                                                newRoles[idx].emoji = e.target.value;
                                                                updatePanel(activePanel.id, { roles: newRoles });
                                                            }} />
                                                        </div>
                                                    </div>
                                                    
                                                    {activePanel.type === 'BUTTON' && (
                                                        <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginTop: '24px' }}>
                                                            <div className="pc-input-group-v2">
                                                                <label>Label Componente</label>
                                                                <input className="pc-input-modern-v2" style={{ padding: '14px 18px', borderRadius: '16px', fontWeight: 850 }} value={role.label} onChange={e => {
                                                                    const newRoles = [...activePanel.roles];
                                                                    newRoles[idx].label = e.target.value;
                                                                    updatePanel(activePanel.id, { roles: newRoles });
                                                                }} />
                                                            </div>
                                                            <div className="pc-input-group-v2">
                                                                <label>UI Branding Style</label>
                                                                <CustomSelect 
                                                                    options={[
                                                                        { value: 'PRIMARY', label: 'Indigo Focus' },
                                                                        { value: 'SECONDARY', label: 'Glass Slate' },
                                                                        { value: 'SUCCESS', label: 'Emerald Active' },
                                                                        { value: 'DANGER', label: 'Crimson Alert' }
                                                                    ]} 
                                                                    value={role.style || 'PRIMARY'} 
                                                                    onChange={val => {
                                                                        const newRoles = [...activePanel.roles];
                                                                        newRoles[idx].style = val;
                                                                        updatePanel(activePanel.id, { roles: newRoles });
                                                                    }} 
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {activePanel.roles.length === 0 && (
                                                <div style={{ textAlign: 'center', padding: '100px 40px', background: '#f8fafc', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
                                                    <Sparkles size={48} style={{ color: '#6366f1', opacity: 0.1, marginBottom: '24px' }} />
                                                    <h4 style={{ margin: 0, fontWeight: 950, color: '#94a3b8', fontSize: '1.1rem' }}>No roles assigned to this matrix.</h4>
                                                    <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>Add your first role to begin designing the interface.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                <button onClick={() => removePanel(activePanel.id)} className="pc-btn-danger-studio-v2" style={{ width: '100%', padding: '24px', background: '#fef2f2', color: '#ef4444', border: '1.5px solid #fee2e2', borderRadius: '28px', fontWeight: 950, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', transition: '0.3s' }}>
                                    <Trash2 size={22} /> <span>Termina Sessione Pannello</span>
                                </button>
                            </div>

                            <aside style={{ position: 'sticky', top: '40px', height: 'fit-content' }}>
                                <div className="pc-card-v2" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: '0 25px 60px rgba(0,0,0,0.1)' }}>
                                    <div style={{ background: '#f8fafc', padding: '28px', borderBottom: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 950, color: '#1e293b', fontSize: '1rem' }}><Monitor size={22} className="color-primary" /> Studio Live View</div>
                                        <div style={{ display: 'flex', gap: '6px', background: 'white', padding: '6px', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
                                            <button onClick={() => setIsPreviewMobile(false)} className={`pc-preview-toggle-v2 ${!isPreviewMobile ? 'active' : ''}`} style={{ border: 'none', background: !isPreviewMobile ? '#f1f5f9' : 'transparent', color: !isPreviewMobile ? '#6366f1' : '#94a3b8', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: '0.2s' }}><Monitor size={18} /></button>
                                            <button onClick={() => setIsPreviewMobile(true)} className={`pc-preview-toggle-v2 ${isPreviewMobile ? 'active' : ''}`} style={{ border: 'none', background: isPreviewMobile ? '#f1f5f9' : 'transparent', color: isPreviewMobile ? '#6366f1' : '#94a3b8', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: '0.2s' }}><Smartphone size={18} /></button>
                                        </div>
                                    </div>
                                    <div style={{ padding: '40px', background: previewTheme === 'dark' ? '#0f172a' : '#f8fafc', minHeight: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                        <EmbedPreview 
                                            theme={previewTheme}
                                            isMobile={isPreviewMobile}
                                            data={{
                                                ...activePanel.embed,
                                                buttons: activePanel.type === 'BUTTON' ? activePanel.roles.map(r => ({
                                                    label: r.label,
                                                    emoji: r.emoji,
                                                    style: r.style
                                                })) : []
                                            }} 
                                        />
                                        {activePanel.type === 'REACTION' && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '24px', background: previewTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: '24px', marginTop: '32px', border: '1.5px solid rgba(255,255,255,0.05)' }}>
                                                {activePanel.roles.map((r, i) => (
                                                    <span key={i} style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.1))' }}>{r.emoji}</span>
                                                ))}
                                                {activePanel.roles.length === 0 && <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 800 }}>NESSUNA REAZIONE</span>}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ padding: '24px 32px', background: 'white', borderTop: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                                        <button onClick={() => setPreviewTheme('dark')} style={{ border: 'none', background: previewTheme === 'dark' ? '#f1f5f9' : 'transparent', color: previewTheme === 'dark' ? '#6366f1' : '#64748b', fontWeight: 950, fontSize: '0.8rem', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}><Moon size={16} /> DARK</button>
                                        <button onClick={() => setPreviewTheme('light')} style={{ border: 'none', background: previewTheme === 'light' ? '#f1f5f9' : 'transparent', color: previewTheme === 'light' ? '#6366f1' : '#64748b', fontWeight: 950, fontSize: '0.8rem', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}><Sun size={16} /> LIGHT</button>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '180px 40px', background: 'white', borderRadius: '48px', boxShadow: 'var(--shadow-premium)', border: '1px solid var(--border-light)' }}>
                        <div style={{ width: '120px', height: '120px', background: '#f5f3ff', color: '#6366f1', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px', boxShadow: '0 20px 40px rgba(99, 102, 241, 0.1)' }}>
                            <Fingerprint size={64} />
                        </div>
                        <h2 style={{ fontFamily: 'Outfit', fontWeight: 950, fontSize: '2.5rem', color: '#1e293b', letterSpacing: '-1.5px', marginBottom: '16px' }}>Interaction Studio</h2>
                        <p style={{ color: '#64748b', fontSize: '1.2rem', fontWeight: 650, marginBottom: '48px', maxWidth: '500px', margin: '0 auto 48px' }}>Seleziona un pannello esistente dalla repository o creane uno nuovo per iniziare la configurazione.</p>
                        <button onClick={addPanel} className="pc-btn-primary" style={{ margin: '0 auto', padding: '18px 44px', borderRadius: '22px', fontSize: '1.15rem' }}>
                            <Plus size={24} /> <span>Nuovo Progetto Panel</span>
                        </button>
                    </div>
                )}
            </main>
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 40px; max-width: 1750px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: white; padding: 32px; border-radius: 32px; box-shadow: var(--shadow-premium); border: 1px solid var(--border-light); }
            .header-info { display: flex; align-items: center; gap: 24px; }
            .pc-icon-box { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 12px 24px rgba(99, 102, 241, 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Outfit', sans-serif; font-size: 2.2rem; font-weight: 950; margin: 0; color: #1e293b; letter-spacing: -1.2px; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 950; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px; }
            .pc-status-tag-v2.on { background: #eef2ff; color: #4338ca; }
            .pc-status-tag-v2.off { background: #fef2f2; color: #ef4444; }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: white; border: none; padding: 14px 28px; border-radius: 18px; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.3s; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(99, 102, 241, 0.3); }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: #f8fafc; color: #64748b; border: 1.5px solid #e2e8f0; padding: 12px 28px; border-radius: 18px; font-weight: 850; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: #eef2ff; color: #4338ca; border-color: #c7d2fe; }

            /* Panel Nav V2 */
            .pc-panel-nav-btn-v2 { display: flex; align-items: center; gap: 20px; padding: 20px; background: white; border: 1.5px solid #f1f5f9; border-radius: 28px; cursor: pointer; transition: 0.3s; width: 100%; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
            .pc-panel-nav-btn-v2:hover { border-color: #ddd6fe; transform: translateX(8px); background: #fdfbff; }
            .pc-panel-nav-btn-v2.active { border-color: var(--primary); background: #f5f3ff; box-shadow: 0 12px 30px rgba(99, 102, 241, 0.08); }

            /* Card V2 */
            .pc-card-v2 { background: white; border: 1px solid var(--border-light); border-radius: 32px; padding: 40px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 20px; }
            .header-icon { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
            .card-header-v2 h3 { margin: 0; font-family: 'Outfit'; font-size: 1.5rem; font-weight: 950; color: #1e293b; }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 950; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
            .pc-input-modern-v2 { width: 100%; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 18px; padding: 16px 20px; font-weight: 900; color: #1e293b; outline: none; transition: 0.2s; }
            .pc-input-modern-v2:focus { border-color: var(--primary); background: white; }

            .pc-btn-delete-studio-v2:hover { background: #ef4444 !important; color: white !important; transform: rotate(8deg); }
            .pc-btn-danger-studio-v2:hover { background: #ef4444 !important; color: white !important; transform: translateY(-3px); box-shadow: 0 10px 25px rgba(239, 68, 68, 0.2) !important; }

            .color-primary { color: var(--primary); }
            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-panel-nav-btn-v2, :global(.light-theme) .pc-role-item-v2, :global(.light-theme) .pc-pro-tip-v2 { background: #ffffff !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
