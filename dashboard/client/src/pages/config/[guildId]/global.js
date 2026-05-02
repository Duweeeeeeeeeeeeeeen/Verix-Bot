import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import DiscordSelector from '../../../components/DiscordSelector';
import api from '../../../utils/api';
import {
  Save, Settings2, Palette, Bell, FileText, Tag,
  Plus, Trash2, ToggleLeft, ToggleRight, Hash,
  RefreshCcw, Eye, ChevronRight, ChevronDown,
  Monitor, Mic2, Ticket, Shield, AlertCircle, Check,
  Zap, Info, Globe, ShieldAlert, Layers
} from 'lucide-react';
import { useT } from '../../../contexts/LanguageContext';
import CustomSelect from '../../../components/CustomSelect';

export default function GlobalConfigPage() {
  const { t, setLanguage: setDashboardLanguage } = useT();
  const router = useRouter();
  const { guildId } = router.query;

  const [config, setConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
        Promise.all([
            api.request(`/config/${guildId}/global`),
            api.request(`/config/${guildId}/discord-data`)
        ]).then(([cfgRes, discordRes]) => {
            setConfig(cfgRes?.data || cfgRes);
            setChannels(discordRes?.channels || []);
            setRoles(discordRes?.roles || []);
        }).catch(console.error).finally(() => setLoading(false));
    }
  }, [guildId, mounted]);

  useEffect(() => {
    if (config) {
      window.dispatchEvent(new CustomEvent('update-guide-context', { detail: config }));
    }
  }, [config]);

  const showToast = useCallback((message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/global`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      
      // Update dashboard language immediately if changed
      if (config.language) {
          setDashboardLanguage(config.language);
      }

      showToast(t('common.saved_success'));
    } catch (error) {
      showToast(t('common.error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const setNested = (path, value) => {
    const newConfig = { ...config };
    const parts = path.split('.');
    let cur = newConfig;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!cur[parts[i]]) cur[parts[i]] = {};
        cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
    setConfig(newConfig);
  };

  if (loading || !config) return <Skeleton height="600px" />;

  return (
    <div className="config-page-layout animate">
      <div className="config-main-col">
        {/* Module Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Globe size={24} />
              </div>
              <div className="header-text">
                <h1>{t('sidebar.management')}</h1>
                <p>{t('onboarding.step1.desc')}</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? t('common.loading') : t('common.save')}
              </button>
           </div>
        </header>

        {/* Tabs */}
        <div className="tab-navigation">
            {[
                { id: 'general', label: 'Generale', icon: Settings2 },
                { id: 'logs', label: 'Logging System', icon: FileText },
                { id: 'advanced', label: 'Dati Raw', icon: Layers }
            ].map(tab => (
                <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id)} 
                    className={`tab-link ${activeTab === tab.id ? 'active' : ''}`}
                >
                    <tab.icon size={16} />
                    {tab.label}
                </button>
            ))}
        </div>

        <div className="tab-content">
            {/* TAB: General */}
            {activeTab === 'general' && (
                <div className="config-grid-g animate fade-in">
                    <section className="card section-card-g">
                        <div className="align-center"><Shield size={18} color="var(--primary)" /> <h3>{t('onboarding.step1.staff')}</h3></div>
                        <div className="fields-stack-g">
                            <div className="field-box">
                                <label className="text-label">{t('onboarding.step1.lang')}</label>
                                <div className="stylized-select-wrapper">
                                    <CustomSelect 
                                        options={[
                                            { value: 'it', label: 'Italiano 🇮🇹' },
                                            { value: 'en', label: 'English 🇺🇸' }
                                        ]} 
                                        value={config.language || 'it'} 
                                        onChange={val => setNested('language', val)} 
                                    />
                                </div>
                            </div>
                            <div className="field-box">
                                <label className="text-label">{t('onboarding.step1.staff')}</label>
                                <DiscordSelector 
                                    type="role" 
                                    multiple 
                                    options={roles} 
                                    value={config.adminRoleIds || []} 
                                    onChange={val => setNested('adminRoleIds', val)} 
                                />
                                <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '8px' }}>{t('onboarding.step1.staff_desc')}</p>
                            </div>
                        </div>
                    </section>

                    <section className="card section-card-g">
                        <div className="align-center"><Palette size={18} color="var(--primary)" /> <h3>Personalizzazione</h3></div>
                        <div className="fields-stack-g">
                            <div className="field-box">
                                <label className="text-label">Colore Embed Default</label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <input type="color" value={config.embedColor || 'var(--primary)'} onChange={e => setNested('embedColor', e.target.value)} style={{ width: '44px', height: '44px', border: 'none', background: 'transparent', cursor: 'pointer' }} />
                                    <input type="text" className="input" value={config.embedColor || 'var(--primary)'} onChange={e => setNested('embedColor', e.target.value)} style={{ flex: 1 }} />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {/* TAB: Logging */}
            {activeTab === 'logs' && (
                <div className="config-grid-g animate fade-in">
                    <section className="card section-card-g">
                        <div className="align-center" style={{ marginBottom: '24px' }}><Bell size={20} color="var(--primary)" /> <h3>Logs di Sistema</h3></div>
                        <div className="fields-stack-g">
                            <div className="status-row-g">
                                <span>Attiva Logging Globale</span>
                                <label className="toggle">
                                    <input type="checkbox" checked={!!config.logs?.enabled} onChange={e => setNested('logs.enabled', e.target.checked)} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            
                            <div className="field-box">
                                <label className="text-label">Canale di Fallback</label>
                                <DiscordSelector type="channel" options={channels} value={config.logs?.channelId || ''} onChange={val => setNested('logs.channelId', val)} />
                                <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '8px' }}>Se un modulo non ha un log dedicato, scriverà qui.</p>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {/* TAB: Advanced */}
            {activeTab === 'advanced' && (
                <section className="card section-card-g animate fade-in">
                    <div className="align-center" style={{ marginBottom: '20px' }}><Layers size={20} color="var(--primary)" /> <h3>Raw Configuration Data</h3></div>
                    <textarea 
                        className="input" 
                        readOnly 
                        value={JSON.stringify(config, null, 2)} 
                        style={{ minHeight: '350px', fontFamily: 'monospace', fontSize: '0.8rem', background: 'var(--bg-inset)' }}
                    />
                </section>
            )}
        </div>
      </div>

      <style jsx>{`
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-badge); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: var(--primary-glow); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; color: var(--text-main); }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }
            
            .tab-navigation { display: flex; gap: 8px; margin-bottom: 32px; padding: 6px; background: var(--bg-sidebar-alt); border-radius: 14px; border: 1px solid var(--border); width: fit-content; }
            .tab-link { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border: none; background: transparent; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; border-radius: 10px; cursor: pointer; transition: 0.2s; }
            .tab-link:hover { color: var(--text-main); background: var(--bg-badge); }
            .tab-link.active { color: var(--text-main); background: var(--bg-card); box-shadow: var(--shadow-sm); border: 1px solid var(--border); }

            .config-grid-g { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 24px; }
            .fields-stack-g { display: flex; flex-direction: column; gap: 20px; margin-top: 16px; }
            .status-row-g { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: var(--bg-badge); border-radius: 10px; border: 1px solid var(--border); font-size: 0.85rem; font-weight: 700; }

            .align-center { display: flex; align-items: center; gap: 10px; }
            @media (max-width: 1000px) { .config-grid-g { grid-template-columns: 1fr; } }
        `}</style>
    </div>
  );
}
