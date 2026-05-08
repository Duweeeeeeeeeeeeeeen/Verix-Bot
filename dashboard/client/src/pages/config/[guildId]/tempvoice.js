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
  const [mounted, setMounted] = useState(false);

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
      const [configRes, discordRes] = await Promise.all([
        api.request(`/config/${guildId}/tempvoice`),
        api.request(`/config/${guildId}/discord-data`)
      ]);
      
      if (configRes) setConfig(configRes.data || configRes);
      if (discordRes) {
        const discordData = discordRes || {};
        const chanData = discordData.channels || [];
        setChannels(chanData.filter(c => c.type === 2)); // Voice
        setCategories(chanData.filter(c => c.type === 4)); // Category
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
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
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

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('tempvoice.title')} | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' }}>
                    <Mic2 size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>Canali Vocali Temporanei</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? 'SISTEMA OPERATIVO' : 'SISTEMA DISABILITATO'}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <button 
                  className={`pc-status-toggle-v2 ${config.enabled ? 'active' : ''}`}
                  onClick={() => setConfig({...config, enabled: !config.enabled})}
                >
                  <Power size={18} />
                  <span>{config.enabled ? 'Spegni' : 'Attiva'}</span>
                </button>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? 'Salvataggio...' : 'Salva Modifiche'}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-container-v2" style={{ marginBottom: '40px' }}>
            <div className="pc-tabs-v2">
                <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                    <Settings2 size={16} /> <span>Configurazione Canali</span>
                </button>
                <button className={activeTab === 'design' ? 'active' : ''} onClick={() => setActiveTab('design')}>
                    <Palette size={16} /> <span>Design & Template</span>
                </button>
            </div>
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'settings' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: '#f0f9ff', color: '#0ea5e9' }}><Zap size={18} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>Canale Generatore</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Il canale che gli utenti devono joinare per creare la propria stanza.</p>
                            </div>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div className="pc-input-group-v2">
                                    <label>Canale Sorgente (Join to Create)</label>
                                    <DiscordSelector 
                                        type="channel" 
                                        options={channels} 
                                        value={config.creatorChannelId || ''} 
                                        onChange={val => setNested('creatorChannelId', val)} 
                                    />
                                </div>
                                <div className="pc-input-group-v2">
                                    <label>Categoria di Destinazione</label>
                                    <DiscordSelector 
                                        type="channel" 
                                        options={categories} 
                                        value={config.categoryId || ''} 
                                        onChange={val => setNested('categoryId', val)} 
                                    />
                                </div>
                            </div>
                            <p className="pc-hint-v2" style={{ marginTop: '24px' }}>Tutte le stanze create verranno posizionate sotto la categoria selezionata.</p>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'design' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: '#f5f3ff', color: '#6366f1' }}><Layout size={18} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>Aspetto e Limiti</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Personalizza come appaiono le stanze create dagli utenti.</p>
                            </div>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div className="pc-input-group-v2">
                                    <label>Template Nome Canale</label>
                                    <div className="pc-input-wrapper-v2" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px' }}>
                                        <MessageSquare size={16} className="input-icon-v2" style={{ marginLeft: '16px', color: '#94a3b8' }} />
                                        <input 
                                            type="text" 
                                            style={{ width: '100%', border: 'none', background: 'transparent', padding: '14px 16px', fontWeight: 700 }}
                                            value={config.channelNameTemplate || ''} 
                                            onChange={e => setNested('channelNameTemplate', e.target.value)} 
                                            placeholder="es: Stanza di {user}"
                                        />
                                    </div>
                                    <p className="pc-hint-v2" style={{ marginTop: '8px' }}>Usa <code>{`{user}`}</code> per inserire il nome del creatore.</p>
                                </div>
                                <div className="pc-input-group-v2">
                                    <label>Limite Membri Predefinito</label>
                                    <div className="pc-input-wrapper-v2" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px' }}>
                                        <Users size={16} className="input-icon-v2" style={{ marginLeft: '16px', color: '#94a3b8' }} />
                                        <input 
                                            type="number" 
                                            style={{ width: '100%', border: 'none', background: 'transparent', padding: '14px 16px', fontWeight: 700 }}
                                            value={config.defaultUserLimit || 0} 
                                            onChange={e => setNested('defaultUserLimit', parseInt(e.target.value))} 
                                        />
                                    </div>
                                    <p className="pc-hint-v2" style={{ marginTop: '8px' }}>0 per nessun limite (max 99).</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 40px; max-width: 1400px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: white; padding: 32px; border-radius: 32px; box-shadow: var(--shadow-premium); border: 1px solid var(--border-light); }
            .header-info { display: flex; align-items: center; gap: 24px; }
            .pc-icon-box { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 12px 24px rgba(14, 165, 233, 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 900; margin: 0; color: #1e293b; letter-spacing: -0.5px; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 900; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px; }
            .pc-status-tag-v2.on { background: #eff6ff; color: #2563eb; }
            .pc-status-tag-v2.off { background: #fef2f2; color: #ef4444; }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: white; border: none; padding: 14px 28px; border-radius: 16px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 25px rgba(99, 102, 241, 0.3); }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: #f8fafc; color: #64748b; border: 1.5px solid #e2e8f0; padding: 12px 24px; border-radius: 16px; font-weight: 800; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: #f0f9ff; color: #0ea5e9; border-color: #bae6fd; }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 8px; background: #f1f5f9; padding: 6px; border-radius: 18px; width: fit-content; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 10px; padding: 12px 24px; border: none; background: transparent; color: #64748b; font-weight: 800; font-size: 0.9rem; border-radius: 14px; cursor: pointer; transition: 0.2s; white-space: nowrap; }
            .pc-tabs-v2 button.active { background: white; color: var(--primary); box-shadow: 0 4px 15px rgba(0,0,0,0.05); }

            /* Card V2 */
            .pc-card-v2 { background: white; border: 1px solid var(--border-light); border-radius: 32px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
            .header-icon { width: 44px; height: 44px; background: #f5f3ff; color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .card-header-v2 h3 { margin: 0; font-family: 'Outfit'; font-size: 1.2rem; font-weight: 900; color: #1e293b; }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
            .pc-input-group-v2 label { font-size: 0.7rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }

            .pc-hint-v2 { font-size: 0.8rem; color: #94a3b8; font-weight: 600; }
            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2 { background: #ffffff !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
