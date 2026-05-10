import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import { DiscordSelector } from '../../../components/LazyConfigComponents';
import { EmbedEditor } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, UserPlus, UserMinus, Settings2, RefreshCcw, Power, Palette, Info, Bell, Layout as LayoutIcon, 
    ChevronRight, Zap, ArrowRight, MessageSquare, Shield, Clock, Plus, Trash2, Camera, 
    Terminal, Layout, Sparkles, CheckCircle2, Box, MessageCircle, Hash, ArrowLeft,
    Monitor, Smartphone, Laptop
} from 'lucide-react';
import { mergeConfig } from '../../../utils/defaults';
import defaultMessagesMap from '../../../locales';
import Head from 'next/head';

export default function WelcomeConfig() {
  const router = useRouter();
  const { t, language } = useT();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const [activeEmbedKey, setActiveEmbedKey] = useState('welcome');
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
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [configRes, discordRes] = await Promise.all([
        api.request(`/config/${guildId}/welcome`),
        api.request(`/config/${guildId}/discord-data`)
      ]);

      if (configRes) {
        setConfig(mergeConfig(configRes.data || configRes, 'welcome'));
      }
      if (discordRes && (discordRes.data || discordRes)) {
        setDiscordData(discordRes.data || discordRes);
      }
      setLoading(false);
    } catch (error) {
      console.error("Welcome config load error:", error);
      setLoading(false);
    } finally {
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
      await api.request(`/config/${guildId}/welcome`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast("Configurazione accoglienza salvata!");
    } catch (error) {
        showToast("Errore durante il salvataggio.", 'error');
    } finally { 
        setSaving(false); 
        window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleTest = async () => {
    if (!config.welcome?.channelId) return showToast("Seleziona un canale per il test!", 'error');
    setTesting(true);
    try {
        const res = await api.request(`/config/${guildId}/welcome/test`, { method: 'POST' });
        showToast("Messaggio di test inviato correttamente!");
    } catch (error) {
        showToast('Errore durante l\'invio del test.', 'error');
    } finally { setTesting(false); }
  };

  const updateMessageConfig = (type, field, value) => {
    setConfig({
      ...config,
      [type]: {
        ...config[type],
        [field]: value
      }
    });
  };

  const updateEmbed = (key, data) => {
    const newConfig = { ...config };
    if (!newConfig[key]) newConfig[key] = { embed: {} };
    newConfig[key].embed = { ...newConfig[key].embed, ...data };
    setConfig(newConfig);
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>Benvenuti & Addii | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
                    <UserPlus size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>Accoglienza Community</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? 'SISTEMA AUTOMAZIONE ATTIVO' : 'SISTEMA DISABILITATO'}
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
                <button className={activeTab === 'personalization' ? 'active' : ''} onClick={() => setActiveTab('personalization')}>
                    <Palette size={16} /> <span>Studio Creativo (Design)</span>
                </button>
            </div>
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'settings' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2" style={{ marginBottom: '24px' }}>
                                <div className="header-icon" style={{ background: '#f0fdf4', color: '#10b981' }}><UserPlus size={18} /></div>
                                <div className="v-stack" style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>Benvenuto New Members</h3>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 650 }}>Attivato all'ingresso di un utente.</span>
                                </div>
                                <label className="pc-toggle-v2 mini">
                                    <input type="checkbox" checked={!!config.welcome?.enabled} onChange={e => updateMessageConfig('welcome', 'enabled', e.target.checked)} />
                                    <span className="pc-slider-v2"></span>
                                </label>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>Canale Pubblicazione</label>
                                    <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 0 || c.type === 5)} value={config.welcome?.channelId || ''} onChange={v => updateMessageConfig('welcome', 'channelId', v)} />
                                </div>
                                <button className="pc-btn-outline-v2" style={{ marginTop: '24px', width: '100%', justifyContent: 'center' }} onClick={handleTest} disabled={testing || !config.welcome?.channelId}>
                                    <Zap size={16} /> <span>{testing ? 'Invio in corso...' : 'Invia Messaggio Test'}</span>
                                </button>
                            </div>
                        </section>

                        <section className="pc-card-v2">
                            <div className="card-header-v2" style={{ marginBottom: '24px' }}>
                                <div className="header-icon" style={{ background: '#fef2f2', color: '#ef4444' }}><UserMinus size={18} /></div>
                                <div className="v-stack" style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>Messaggio di Addio</h3>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 650 }}>Attivato all'uscita di un utente.</span>
                                </div>
                                <label className="pc-toggle-v2 mini">
                                    <input type="checkbox" checked={!!config.leave?.enabled} onChange={e => updateMessageConfig('leave', 'enabled', e.target.checked)} />
                                    <span className="pc-slider-v2"></span>
                                </label>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>Canale Pubblicazione</label>
                                    <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 0 || c.type === 5)} value={config.leave?.channelId || ''} onChange={v => updateMessageConfig('leave', 'channelId', v)} />
                                </div>
                                <div style={{ marginTop: '24px', background: 'var(--bg-badge)', padding: '16px', borderRadius: '14px', border: '1.5px solid var(--border)', textAlign: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700 }}>Il test automatico non è disponibile per l'addio.</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--text-muted)' }}><Hash size={18} /></div>
                            <h3 style={{ margin: 0 }}>Variabili Dinamiche</h3>
                        </div>
                        <div className="card-body-v2">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                {[
                                    { k: '{user}', v: 'Username (es: Verix)' },
                                    { k: '{user_mention}', v: 'Menziona l\'utente' },
                                    { k: '{user_tag}', v: 'Tag completo (es: Verix#0001)' },
                                    { k: '{guild}', v: 'Nome di questo server' },
                                    { k: '{member_count}', v: 'Numero totale membri' }
                                ].map(x => (
                                    <div key={x.k} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-badge)', padding: '16px 20px', borderRadius: '18px', border: '1.5px solid var(--border)' }}>
                                        <code style={{ background: 'white', color: '#f43f5e', padding: '4px 10px', borderRadius: '10px', fontWeight: 700, border: '1px solid var(--border)', fontSize: '0.85rem' }}>{x.k}</code>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 750 }}>{x.v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'personalization' && (
                <div className="pc-card-v2 animate slide-up" style={{ padding: 0, overflow: 'hidden', minHeight: '750px' }}>
                    <div className="pc-studio-layout-v2" style={{ display: 'grid', gridTemplateColumns: '350px 1fr', height: '100%' }}>
                        <aside style={{ background: 'var(--bg-badge)', borderRight: '1px solid var(--border)', padding: '40px 32px' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '24px' }}>Editor Messaggi</div>
                            <div className="v-stack" style={{ gap: '12px' }}>
                                <button 
                                    className={`pc-studio-tab-v2 ${activeEmbedKey === 'welcome' ? 'active' : ''}`}
                                    onClick={() => setActiveEmbedKey('welcome')}
                                    style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 24px', border: 'none', borderRadius: '20px', cursor: 'pointer', transition: '0.2s', background: activeEmbedKey === 'welcome' ? 'white' : 'transparent', color: activeEmbedKey === 'welcome' ? 'var(--text-heading)' : 'var(--text-muted)', fontWeight: 700, textAlign: 'left', border: activeEmbedKey === 'welcome' ? '1.5px solid var(--border)' : '1.5px solid transparent', boxShadow: activeEmbedKey === 'welcome' ? '0 10px 20px rgba(0,0,0,0.04)' : 'none' }}
                                >
                                    <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserPlus size={18} /></div>
                                    <span style={{ flex: 1 }}>Welcome Studio</span>
                                    <ChevronRight size={16} style={{ opacity: activeEmbedKey === 'welcome' ? 1 : 0.3 }} />
                                </button>
                                <button 
                                    className={`pc-studio-tab-v2 ${activeEmbedKey === 'leave' ? 'active' : ''}`}
                                    onClick={() => setActiveEmbedKey('leave')}
                                    style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 24px', border: 'none', borderRadius: '20px', cursor: 'pointer', transition: '0.2s', background: activeEmbedKey === 'leave' ? 'white' : 'transparent', color: activeEmbedKey === 'leave' ? 'var(--text-heading)' : 'var(--text-muted)', fontWeight: 700, textAlign: 'left', border: activeEmbedKey === 'leave' ? '1.5px solid var(--border)' : '1.5px solid transparent', boxShadow: activeEmbedKey === 'leave' ? '0 10px 20px rgba(0,0,0,0.04)' : 'none' }}
                                >
                                    <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserMinus size={18} /></div>
                                    <span style={{ flex: 1 }}>Leave Studio</span>
                                    <ChevronRight size={16} style={{ opacity: activeEmbedKey === 'leave' ? 1 : 0.3 }} />
                                </button>
                            </div>
                            
                            <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '2px dashed var(--border)' }}>
                                <button className="pc-btn-reset-v2" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff1f2', color: '#ef4444', border: 'none', width: '100%', padding: '16px', borderRadius: '18px', fontWeight: 700, cursor: 'pointer', justifyContent: 'center', transition: '0.2s' }} onClick={() => {
                                    if (window.confirm('Ripristinare i parametri di default?')) {
                                        const defaults = defaultMessagesMap[language] || defaultMessagesMap['it'];
                                        const fallback = defaults['welcome']?.[activeEmbedKey] || { title: 'Verix Welcome', description: 'Benvenuto!', color: '#6366f1' };
                                        updateEmbed(activeEmbedKey, fallback);
                                    }
                                }}>
                                    <RefreshCcw size={18} /> <span>Ripristina Default</span>
                                </button>
                            </div>
                        </aside>
                        
                        <main style={{ padding: '50px', background: 'white', overflowY: 'auto' }}>
                            <EmbedEditor 
                                embed={config[activeEmbedKey]?.embed || {}} 
                                onChange={d => updateEmbed(activeEmbedKey, d)}
                                variables={['user', 'user_mention', 'user_tag', 'guild', 'member_count']}
                            />
                        </main>
                    </div>
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1500px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 12px 24px rgba(244, 63, 94, 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Inter', sans-serif; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: -0.03em; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 6px; font-size: 0.6rem; font-weight: 700; padding: 4px 10px; border-radius: 100px; }
            .pc-status-tag-v2.on { background: rgba(16, 185, 129, 0.1); color: #10b981; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: #ef4444; }
            .status-dot-v2 { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: var(--bg-badge); color: var(--text-muted); border: 1.5px solid var(--border); padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: #10b981; }
            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 6px; background: var(--bg-badge); padding: 5px; border-radius: 18px; width: fit-content; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; font-size: 0.9rem; border-radius: 14px; cursor: pointer; transition: 0.2s; }
            .pc-tabs-v2 button.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

            /* Card V2 */
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
            .header-icon { width: 44px; height: 44px; background: var(--bg-badge); color: var(--primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.3rem; font-weight: 700; color: var(--text-heading); }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; }

            /* Toggle V2 */
            .pc-toggle-v2 { position: relative; width: 44px; height: 22px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: var(--bg-badge); transition: .4s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background: #fff; transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: var(--primary); }
            input:checked + .pc-slider-v2:before { transform: translateX(22px); }

            .pc-btn-outline-v2 { background: var(--bg-badge); color: var(--text-muted); border: 1.5px solid var(--border); padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
            .pc-btn-outline-v2:hover:not(:disabled) { background: var(--bg-card); border-color: var(--primary); color: var(--primary); }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
