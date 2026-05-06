import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, 
    MousePointer2, 
    Plus, 
    Trash2, 
    Send, 
    Layout, 
    Palette, 
    Type, 
    Layers,
    Smile,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Settings2
} from 'lucide-react';
import DiscordSelector from '../../../components/DiscordSelector';
import EmbedPreview from '../../../components/EmbedPreview';
import CustomSelect from '../../../components/CustomSelect';

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

  useEffect(() => {
    if (guildId) fetchData();
  }, [guildId]);

  const fetchData = async () => {
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [configRes, discordRes] = await Promise.all([
        api.request(`/config/${guildId}`),
        api.request(`/config/${guildId}/discord-data`)
      ]);
      
      if (configRes) {
          setConfig(configRes.reactionRoles || { enabled: false, panels: [] });
      }
      if (discordRes) {
        setRoles(discordRes.roles || []);
        setChannels(discordRes.channels?.filter(c => c.type === 0 || c.type === 5) || []);
      }
    } catch (e) {
      console.error(e);
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
      showToast(t('common.save_success'));
    } catch (e) {
      showToast(t('common.save_error'), 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleDeploy = async (panelId) => {
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const res = await api.request(`/config/${guildId}/reaction-roles/deploy/${panelId}`, {
        method: 'POST'
      });
      if (res.success) {
          showToast(t('common.save_success'));
          // Update messageId in local state
          const newPanels = config.panels.map(p => p.id === panelId ? { ...p, messageId: res.messageId } : p);
          setConfig({ ...config, panels: newPanels });
      }
    } catch (e) {
      showToast(e.message || t('common.save_error'), 'error');
    } finally {
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const addPanel = () => {
      const newPanel = {
          id: Math.random().toString(36).substr(2, 9),
          name: 'New Panel',
          channelId: '',
          messageId: null,
          type: 'BUTTON',
          roles: [],
          embed: {
              title: 'Reaction Roles',
              description: 'Select your roles below:',
              color: '#5865F2',
              footer: 'Reaction Roles | Verix'
          }
      };
      setConfig({ ...config, panels: [...config.panels, newPanel] });
      setActivePanelId(newPanel.id);
  };

  const removePanel = (id) => {
      if (!confirm(t('management.delete_confirm'))) return;
      setConfig({ ...config, panels: config.panels.filter(p => p.id !== id) });
      if (activePanelId === id) setActivePanelId(null);
  };

  const updatePanel = (id, data) => {
      setConfig({
          ...config,
          panels: config.panels.map(p => p.id === id ? { ...p, ...data } : p)
      });
  };

  const addRole = (panelId) => {
      const panel = config.panels.find(p => p.id === panelId);
      if (panel.roles.length >= 20) return showToast('Max 20 roles per panel', 'error');
      
      const newRoles = [...panel.roles, { roleId: '', emoji: '🔘', label: 'Role', style: 'PRIMARY' }];
      updatePanel(panelId, { roles: newRoles });
  };

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  if (loading || !config) return <Skeleton type="config" />;

  const activePanel = config.panels.find(p => p.id === activePanelId);

  return (
    <div className="config-page-layout animate">
      <div className="config-main-col">
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                <MousePointer2 size={24} />
              </div>
              <div className="header-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h1>{t('reactionroles.title')}</h1>
                  <label className="toggle-mini">
                    <input type="checkbox" checked={!!config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                    <span className="slider-mini"></span>
                  </label>
                </div>
                <p>{t('reactionroles.desc')}</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? t('common.saving') : t('common.save')}
              </button>
           </div>
        </header>

        <div className="rr-layout">
            {/* Sidebar Panels List */}
            <aside className="rr-sidebar">
                <div className="sidebar-header">
                    <h3>Panels ({config.panels.length})</h3>
                    <button onClick={addPanel} className="btn-add-sm">
                        <Plus size={14} />
                    </button>
                </div>
                <div className="panels-list">
                    {config.panels.map(p => (
                        <div 
                            key={p.id} 
                            className={`panel-item ${activePanelId === p.id ? 'active' : ''}`}
                            onClick={() => setActivePanelId(p.id)}
                        >
                            <div className="panel-info">
                                <span className="panel-name">{p.name}</span>
                                <span className="panel-meta">{p.type} • {p.roles.length} roles</span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); removePanel(p.id); }} className="btn-delete-sm">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {config.panels.length === 0 && (
                        <div className="empty-sidebar">
                            <Layers size={24} opacity="0.2" />
                            <p>No panels created</p>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Editor */}
            <main className="rr-editor">
                {activePanel ? (
                    <div className="animate fade-in">
                        <div className="editor-header">
                            <div className="align-center">
                                <Layout size={18} color="var(--primary)" />
                                <h2>{activePanel.name}</h2>
                            </div>
                            <button onClick={() => handleDeploy(activePanel.id)} className="btn-deploy">
                                <Send size={14} /> {t('reactionroles.deploy_btn')}
                            </button>
                        </div>

                        <div className="editor-grid">
                            <div className="editor-form">
                                {/* Basic Settings */}
                                <section className="card section-card">
                                    <div className="align-center mb-4">
                                        <Settings2 size={16} color="var(--text-dim)" />
                                        <h3>General Settings</h3>
                                    </div>
                                    <div className="fields-grid">
                                        <div className="field-box">
                                            <label className="text-label">{t('reactionroles.panel_name')}</label>
                                            <input 
                                                type="text" 
                                                className="input" 
                                                value={activePanel.name}
                                                onChange={e => updatePanel(activePanel.id, { name: e.target.value })}
                                            />
                                        </div>
                                        <div className="field-box">
                                            <label className="text-label">{t('reactionroles.panel_type')}</label>
                                            <CustomSelect 
                                                options={[
                                                    { value: 'BUTTON', label: t('reactionroles.type_button') },
                                                    { value: 'REACTION', label: t('reactionroles.type_reaction') }
                                                ]}
                                                value={activePanel.type}
                                                onChange={val => updatePanel(activePanel.id, { type: val })}
                                            />
                                        </div>
                                        <div className="field-box full-width">
                                            <label className="text-label">Target Channel</label>
                                            <DiscordSelector 
                                                type="channel" 
                                                options={channels} 
                                                value={activePanel.channelId}
                                                onChange={val => updatePanel(activePanel.id, { channelId: val })}
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Embed Editor */}
                                <section className="card section-card">
                                    <div className="align-center mb-4">
                                        <Palette size={16} color="var(--text-dim)" />
                                        <h3>Appearance</h3>
                                    </div>
                                    <div className="fields-grid">
                                        <div className="field-box full-width">
                                            <label className="text-label">Embed Title</label>
                                            <input 
                                                type="text" 
                                                className="input" 
                                                value={activePanel.embed.title}
                                                onChange={e => updatePanel(activePanel.id, { embed: { ...activePanel.embed, title: e.target.value } })}
                                            />
                                        </div>
                                        <div className="field-box full-width">
                                            <label className="text-label">Embed Description</label>
                                            <textarea 
                                                className="input" 
                                                rows="3"
                                                value={activePanel.embed.description}
                                                onChange={e => updatePanel(activePanel.id, { embed: { ...activePanel.embed, description: e.target.value } })}
                                            />
                                        </div>
                                        <div className="field-box">
                                            <label className="text-label">Color</label>
                                            <input 
                                                type="color" 
                                                value={activePanel.embed.color}
                                                onChange={e => updatePanel(activePanel.id, { embed: { ...activePanel.embed, color: e.target.value } })}
                                                style={{ width: '100%', height: '40px', padding: '0', border: 'none', background: 'none' }}
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Roles Configuration */}
                                <section className="card section-card">
                                    <div className="align-center mb-4" style={{ justifyContent: 'space-between' }}>
                                        <div className="align-center">
                                            <Layers size={16} color="var(--text-dim)" />
                                            <h3>{t('reactionroles.roles_title')}</h3>
                                        </div>
                                        <button onClick={() => addRole(activePanel.id)} className="btn-outline-sm">
                                            <Plus size={14} /> {t('common.add')}
                                        </button>
                                    </div>
                                    
                                    <div className="roles-editor-list">
                                        {activePanel.roles.map((role, idx) => (
                                            <div key={idx} className="role-config-item">
                                                <div className="role-config-main">
                                                    <div className="role-selector">
                                                        <DiscordSelector 
                                                            type="role" 
                                                            options={roles} 
                                                            value={role.roleId}
                                                            onChange={val => {
                                                                const newRoles = [...activePanel.roles];
                                                                newRoles[idx].roleId = val;
                                                                updatePanel(activePanel.id, { roles: newRoles });
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="role-emoji">
                                                        <input 
                                                            type="text" 
                                                            className="input" 
                                                            placeholder="Emoji"
                                                            value={role.emoji}
                                                            onChange={e => {
                                                                const newRoles = [...activePanel.roles];
                                                                newRoles[idx].emoji = e.target.value;
                                                                updatePanel(activePanel.id, { roles: newRoles });
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                {activePanel.type === 'BUTTON' && (
                                                    <div className="role-config-button">
                                                        <input 
                                                            type="text" 
                                                            className="input" 
                                                            placeholder="Label"
                                                            value={role.label}
                                                            onChange={e => {
                                                                const newRoles = [...activePanel.roles];
                                                                newRoles[idx].label = e.target.value;
                                                                updatePanel(activePanel.id, { roles: newRoles });
                                                            }}
                                                        />
                                                        <CustomSelect 
                                                            options={[
                                                                { value: 'PRIMARY', label: 'Blue' },
                                                                { value: 'SECONDARY', label: 'Gray' },
                                                                { value: 'SUCCESS', label: 'Green' },
                                                                { value: 'DANGER', label: 'Red' }
                                                            ]}
                                                            value={role.style}
                                                            onChange={val => {
                                                                const newRoles = [...activePanel.roles];
                                                                newRoles[idx].style = val;
                                                                updatePanel(activePanel.id, { roles: newRoles });
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                <button 
                                                    className="btn-remove-role"
                                                    onClick={() => {
                                                        const newRoles = activePanel.roles.filter((_, i) => i !== idx);
                                                        updatePanel(activePanel.id, { roles: newRoles });
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        {activePanel.roles.length === 0 && (
                                            <p className="empty-roles">No roles added to this panel.</p>
                                        )}
                                    </div>
                                </section>
                            </div>

                            <div className="editor-preview">
                                <div className="preview-sticky">
                                    <div className="preview-label">Live Preview</div>
                                    <EmbedPreview 
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
                                        <div className="reaction-preview">
                                            {activePanel.roles.map((r, i) => (
                                                <span key={i} className="preview-emoji">{r.emoji}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="editor-empty">
                        <Layout size={48} opacity="0.1" />
                        <h3>Select a panel to start editing</h3>
                        <p>Or create a new one using the button in the sidebar.</p>
                    </div>
                )}
            </main>
        </div>
      </div>

      <style jsx>{`
        .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; background: var(--bg-badge); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
        .header-info { display: flex; align-items: center; gap: 16px; }
        .header-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; }
        .header-text p { font-size: 0.85rem; color: var(--text-dim); }

        .rr-layout { display: grid; grid-template-columns: 280px 1fr; gap: 24px; height: calc(100vh - 250px); min-height: 600px; }
        
        .rr-sidebar { background: var(--bg-badge); border-radius: 16px; border: 1px solid var(--border); display: flex; flex-direction: column; overflow: hidden; }
        .sidebar-header { padding: 16px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .sidebar-header h3 { font-size: 0.9rem; font-weight: 700; }
        .panels-list { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
        
        .panel-item { padding: 12px; border-radius: 10px; cursor: pointer; transition: 0.2s; border: 1px solid transparent; display: flex; justify-content: space-between; align-items: center; }
        .panel-item:hover { background: var(--bg-sidebar-alt); }
        .panel-item.active { background: var(--primary-glow); border-color: var(--primary); }
        .panel-info { display: flex; flex-direction: column; gap: 2px; }
        .panel-name { font-size: 0.9rem; font-weight: 600; color: var(--text-main); }
        .panel-meta { font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; }
        
        .rr-editor { overflow-y: auto; padding-right: 8px; }
        .editor-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding: 0 4px; }
        .btn-deploy { display: flex; align-items: center; gap: 8px; padding: 10px 18px; background: var(--success-glow); color: var(--success); border: 1px solid var(--success); border-radius: 10px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-deploy:hover { background: var(--success); color: white; }

        .editor-grid { display: grid; grid-template-columns: 1fr 400px; gap: 24px; }
        .editor-preview { position: relative; }
        .preview-sticky { position: sticky; top: 0; }
        .preview-label { font-size: 0.75rem; font-weight: 800; color: var(--text-dim); text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1px; }

        .fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .field-box.full-width { grid-column: span 2; }
        
        .role-config-item { background: var(--bg-badge); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 12px; position: relative; display: flex; flex-direction: column; gap: 12px; }
        .role-config-main { display: grid; grid-template-columns: 1fr 80px; gap: 12px; }
        .role-config-button { display: grid; grid-template-columns: 1fr 120px; gap: 12px; }
        
        .btn-remove-role { position: absolute; top: -8px; right: -8px; width: 28px; height: 28px; border-radius: 50%; background: var(--error); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2); opacity: 0; transition: 0.2s; }
        .role-config-item:hover .btn-remove-role { opacity: 1; }

        .reaction-preview { display: flex; gap: 8px; margin-top: 16px; background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: 8px; width: fit-content; }
        .preview-emoji { font-size: 1.2rem; }

        .editor-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-dim); text-align: center; gap: 16px; }
        .empty-sidebar { padding: 40px 20px; text-align: center; color: var(--text-dim); font-size: 0.8rem; }
        
        .mb-4 { margin-bottom: 16px; }
        .align-center { display: flex; align-items: center; gap: 10px; }
        
        @media (max-width: 1200px) {
            .rr-layout { grid-template-columns: 1fr; height: auto; }
            .editor-grid { grid-template-columns: 1fr; }
            .rr-sidebar { height: 200px; }
        }
      `}</style>
    </div>
  );
}
