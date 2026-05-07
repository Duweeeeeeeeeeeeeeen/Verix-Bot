import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { 
    Save, 
    Mic2, 
    Settings2, 
    Plus, 
    Hash, 
    Power,
    RefreshCcw,
    Layout,
    Info,
    MessageSquare,
    Zap,
    Users,
    ChevronRight,
    Palette
} from 'lucide-react';
import { DiscordSelector } from '../../../components/LazyConfigComponents';
import { useT } from '../../../contexts/LanguageContext';
import Head from 'next/head';

export default function TempVoiceConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('settings');

  useEffect(() => {
    if (guildId) {
      fetchData();
    }
  }, [guildId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [configRes, discordRes] = await Promise.all([
        api.request(`/config/${guildId}/tempvoice`),
        api.request(`/config/${guildId}/discord-data`)
      ]);
      
      if (configRes) setConfig(configRes.data || configRes);
      if (discordRes) {
        // api.request already returns result.data
        const discordData = discordRes || {};
        const chanData = discordData.channels || [];
        setChannels(chanData.filter(c => c.type === 2)); // Voice
        setCategories(chanData.filter(c => c.type === 4)); // Category
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/tempvoice`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.save_success'), type: 'success' } }));
    } catch (e) {
      console.error(e);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.save_error'), type: 'error' } }));
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

  if (loading || !config) return <Skeleton type="config" />;

  return (
    <div className="config-page-layout animate">
      <div className="config-main-col">
        <Head>
            <title>{t('tempvoice.title')} | Verix</title>
        </Head>
        {/* Module Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Mic2 size={24} />
              </div>
              <div className="header-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h1>{t('tempvoice.title')}</h1>
                  <label className="toggle-mini" title={config.enabled ? t('common.enabled') : t('common.disabled')}>
                    <input type="checkbox" checked={!!config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                    <span className="slider-mini"></span>
                  </label>
                </div>
                <p>{t('tempvoice.desc')}</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? t('common.saving') : t('common.save_changes')}
              </button>
           </div>
        </header>

        {/* Tab Navigation */}
        <div className="tab-navigation">
            <button onClick={() => setActiveTab('settings')} className={`tab-link ${activeTab === 'settings' ? 'active' : ''}`}>
                <Settings2 size={16} /> <span>{t('tempvoice.tab_settings')}</span>
            </button>
            <button onClick={() => setActiveTab('design')} className={`tab-link ${activeTab === 'design' ? 'active' : ''}`}>
                <Palette size={16} /> <span>{t('tempvoice.tab_design')}</span>
            </button>
        </div>

        <div className="tab-content">
            {activeTab === 'settings' && (
                <div className="animate fade-in">
                    <section className="card section-card-v">
                        <div className="align-center" style={{ marginBottom: '20px' }}>
                            <Zap size={18} color="var(--primary)" />
                            <h3>{t('tempvoice.config_title')}</h3>
                        </div>
                        <div className="fields-grid-v">
                            <div className="field-box">
                                <label className="text-label">{t('tempvoice.creator_label')}</label>
                                <DiscordSelector 
                                    type="channel" 
                                    options={channels} 
                                    value={config.creatorChannelId || ''} 
                                    onChange={val => setNested('creatorChannelId', val)} 
                                    placeholder={t('tempvoice.creator_placeholder')}
                                />
                                <p className="field-help">{t('tempvoice.creator_help')}</p>
                            </div>
                            <div className="field-box">
                                <label className="text-label">{t('tempvoice.category_label')}</label>
                                <DiscordSelector 
                                    type="channel" 
                                    options={categories} 
                                    value={config.categoryId || ''} 
                                    onChange={val => setNested('categoryId', val)} 
                                    placeholder={t('tempvoice.category_placeholder')}
                                />
                                <p className="field-help">{t('tempvoice.category_help')}</p>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'design' && (
                <div className="config-grid-v animate fade-in">
                    <div className="grid-main-v">
                        <section className="card section-card-v">
                            <div className="align-center" style={{ marginBottom: '20px' }}>
                                <Layout size={18} color="var(--primary)" />
                                <h3>{t('tempvoice.design_title')}</h3>
                            </div>
                            <div className="fields-grid-v">
                                <div className="field-box">
                                    <label className="text-label">{t('tempvoice.template_label')}</label>
                                    <input 
                                        type="text" 
                                        className="input" 
                                        value={config.channelNameTemplate || ''} 
                                        onChange={e => setNested('channelNameTemplate', e.target.value)} 
                                        placeholder={t('tempvoice.template_placeholder')}
                                    />
                                    <p className="field-help">{t('tempvoice.template_help')}</p>
                                </div>
                                <div className="field-box">
                                    <label className="text-label">{t('tempvoice.limit_label')}</label>
                                    <input 
                                        type="number" 
                                        className="input" 
                                        value={config.defaultUserLimit || 0} 
                                        onChange={e => setNested('defaultUserLimit', parseInt(e.target.value))} 
                                    />
                                    <p className="field-help">{t('tempvoice.limit_help')}</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
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

            .config-grid-v { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
            .fields-grid-v { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .align-center { display: flex; align-items: center; gap: 10px; }
            
            .toggle-mini { position: relative; display: inline-block; width: 34px; height: 18px; }
            .toggle-mini input { opacity: 0; width: 0; height: 0; }
            .slider-mini { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--bg-sidebar-alt); transition: .3s; border-radius: 18px; border: 1px solid var(--border); }
            .slider-mini:before { position: absolute; content: ""; height: 10px; width: 10px; left: 3px; bottom: 3px; background-color: var(--text-main); transition: .3s; border-radius: 50%; }
            input:checked + .slider-mini { background-color: var(--primary); }
            input:checked + .slider-mini:before { transform: translateX(16px); }

            @media (max-width: 1000px) { .config-grid-v { grid-template-columns: 1fr; } .fields-grid-v { grid-template-columns: 1fr; } }
        `}</style>
    </div>
  );
}
