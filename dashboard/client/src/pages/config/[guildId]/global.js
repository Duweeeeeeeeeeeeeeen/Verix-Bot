import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import {
  Save, Settings2, Palette, Bell, FileText, Tag, Plus, Trash2, Hash, RefreshCcw, Eye, 
  ChevronRight, ChevronDown, Monitor, Mic2, Ticket, Shield, AlertCircle, Check, Zap, 
  Info, Globe, ShieldAlert, Layers, User, Lock, Crown, Key, Bot, Activity, Layout, 
  Sparkles, Terminal, Globe2, BellRing, Settings, CheckCircle2, Languages, ShieldCheck,
  MousePointer2, Palette as PaletteIcon
} from 'lucide-react';
import { useT } from '../../../contexts/LanguageContext';
import { DiscordSelector, CustomSelect } from '../../../components/LazyConfigComponents';
import Head from 'next/head';

export default function GlobalConfigPage() {
  const { t, setLanguage: setDashboardLanguage } = useT();
  const router = useRouter();
  const { guildId } = router.query;

  const [config, setConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [guildData, setGuildData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
        window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
        Promise.all([
            api.request(`/config/${guildId}/global`),
            api.request(`/config/${guildId}/discord-data`),
            api.request(`/config/${guildId}/guild`)
        ]).then(([cfgRes, discordRes, guildRes]) => {
            setConfig(cfgRes?.data || cfgRes);
            setChannels(discordRes?.channels || []);
            setRoles(discordRes?.roles || []);
            setGuildData(guildRes?.data || guildRes);
        }).catch(console.error).finally(() => {
            setLoading(false);
            window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
        });
    }
  }, [guildId, mounted]);

  const showToast = useCallback((message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/global`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      
      if (config.language) {
          setDashboardLanguage(config.language);
      }

      showToast("Configurazione Globale applicata con successo!");
    } catch (error) {
      showToast("Errore durante il salvataggio.", 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const setNested = (path, value) => {
    setConfig(prev => {
        const newConfig = { ...prev };
        const parts = path.split('.');
        let cur = newConfig;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!cur[parts[i]]) cur[parts[i]] = {};
            else cur[parts[i]] = { ...cur[parts[i]] };
            cur = cur[parts[i]];
        }
        cur[parts[parts.length - 1]] = value;
        return newConfig;
    });
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  const isPremium = guildData?.isPremium;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>Configurazione Globale | Verix Studio</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
                    <Settings size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>Core System Studio</h1>
                    <div className="pc-status-tag-v2 on" style={{ background: '#eff6ff', color: '#2563eb' }}>
                        <div className="status-dot-v2"></div>
                        CONTROLLO GLOBALE ATTIVO
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? 'Sincronizzazione...' : 'Salva Modifiche'}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-container-v2" style={{ marginBottom: '40px' }}>
            <div className="pc-tabs-v2">
                <button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>
                    <Settings2 size={16} /> <span>Impostazioni Core</span>
                </button>
                <button className={`${activeTab === 'identity' ? 'active' : ''} ${!isPremium ? 'premium-locked-tab' : ''}`} onClick={() => setActiveTab('identity')}>
                    <User size={16} /> <span>Identity Engine</span>
                    {!isPremium && <Lock size={12} style={{ marginLeft: '6px' }} />}
                </button>
                <button className={activeTab === 'logs' ? 'active' : ''} onClick={() => setActiveTab('logs')}>
                    <BellRing size={16} /> <span>Log Registry</span>
                </button>
                <button className={activeTab === 'advanced' ? 'active' : ''} onClick={() => setActiveTab('advanced')}>
                    <Terminal size={16} /> <span>Advanced Dev</span>
                </button>
            </div>
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'general' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                    <section className="pc-card-v2 animate slide-up">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><Languages size={18} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>Localizzazione & Permessi</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 650 }}>Definisci la lingua del bot e chi può controllarlo.</p>
                            </div>
                        </div>
                        <div className="card-body-v2">
                            <div className="v-stack" style={{ gap: '28px' }}>
                                <div className="pc-input-group-v2">
                                    <label>Lingua di Sistema</label>
                                    <CustomSelect 
                                        options={[
                                            { value: 'it', label: 'Italiano 🇮🇹' },
                                            { value: 'en', label: 'English 🇺🇸' }
                                        ]} 
                                        value={config.language || 'en'} 
                                        onChange={val => setNested('language', val)} 
                                    />
                                    <p className="pc-hint-v2" style={{ marginTop: '12px' }}>La lingua selezionata influenzerà tutti i messaggi pubblici e privati del bot.</p>
                                </div>
                                
                                <div className="pc-divider-v2" style={{ height: '1.5px', background: '#f1f5f9' }}></div>

                                <div className="pc-input-group-v2">
                                    <label>Ruoli Amministratori Verix</label>
                                    <DiscordSelector 
                                        type="role" 
                                        multiple 
                                        options={roles} 
                                        value={config.adminRoleIds || []} 
                                        onChange={val => setNested('adminRoleIds', val)} 
                                    />
                                    <p className="pc-hint-v2" style={{ marginTop: '12px' }}>I membri con questi ruoli potranno configurare il bot e usare i comandi amministrativi.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}><PaletteIcon size={18} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>Global UI Branding</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 650 }}>Personalizza l'estetica degli embed nel server.</p>
                            </div>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-group-v2">
                                <label>Colore Embed Predefinito</label>
                                <div className="pc-color-studio-v2" style={{ display: 'flex', alignItems: 'center', gap: '20px', background: '#f8fafc', padding: '16px', borderRadius: '24px', border: '1.5px solid #e2e8f0' }}>
                                    <div className="color-preview-v2" style={{ width: '56px', height: '56px', borderRadius: '16px', border: '3px solid white', backgroundColor: config.embedColor || '#6366f1', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', position: 'relative' }}>
                                        <input type="color" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} value={config.embedColor || '#6366f1'} onChange={e => setNested('embedColor', e.target.value)} />
                                    </div>
                                    <div className="v-stack" style={{ flex: 1 }}>
                                        <input type="text" style={{ border: 'none', background: 'transparent', fontWeight: 950, color: '#1e293b', fontSize: '1.1rem', outline: 'none', width: '100%' }} value={config.embedColor || '#6366f1'} onChange={e => setNested('embedColor', e.target.value)} />
                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Hex Code</span>
                                    </div>
                                    <button className="pc-btn-reset-v2" style={{ padding: '8px', color: '#94a3b8', border: 'none', background: 'transparent', cursor: 'pointer' }} onClick={() => setNested('embedColor', '#6366f1')}>
                                        <RefreshCcw size={16} />
                                    </button>
                                </div>
                                <p className="pc-hint-v2" style={{ marginTop: '20px' }}>Questo colore verrà usato per tutti i messaggi automatici del bot (Whitelist, Benvenuto, etc.).</p>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'identity' && (
                <div className="v-stack animate slide-up">
                    {!isPremium ? (
                        <div className="pc-pro-gate-box-big-v2" style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '40px', padding: '100px 40px', textAlign: 'center', maxWidth: '1000px', margin: '0 auto', boxShadow: 'var(--shadow-premium)' }}>
                             <div className="gate-icon-glow-v2" style={{ width: '120px', height: '120px', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', color: '#f59e0b', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px', boxShadow: '0 20px 40px rgba(245, 158, 11, 0.2)' }}>
                                <Crown size={64} />
                             </div>
                             <h2 style={{ fontFamily: 'Outfit', fontWeight: 950, fontSize: '3rem', color: '#1e293b', marginBottom: '20px', letterSpacing: '-1.5px' }}>Custom Identity Engine</h2>
                             <p style={{ color: '#64748b', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 60px', fontWeight: 650, lineHeight: 1.6 }}>Rimuovi Verix dalla tua community. Configura un'istanza privata con il tuo token, nome e avatar personalizzati.</p>
                             
                             <div className="gate-feature-grid-v2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', textAlign: 'left', maxWidth: '750px', margin: '0 auto 64px' }}>
                                {[
                                    { icon: <Bot size={20} />, text: 'Proprio Token (Discord Dev)' },
                                    { icon: <RefreshCw size={20} />, text: 'Status & Attività Custom' },
                                    { icon: <User size={20} />, text: 'Personalità Unica del Bot' },
                                    { icon: <EyeOff size={20} />, text: 'Zero Branding Verix' }
                                ].map((p, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1.5px solid #e2e8f0', fontWeight: 850, color: '#475569', fontSize: '0.95rem' }}>
                                        <div style={{ color: '#f59e0b' }}>{p.icon}</div>
                                        <span>{p.text}</span>
                                    </div>
                                ))}
                             </div>

                             <button className="pc-btn-platinum-v2" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', color: 'white', border: 'none', padding: '24px 64px', borderRadius: '24px', fontWeight: 950, fontSize: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', margin: '0 auto', boxShadow: '0 15px 35px rgba(245, 158, 11, 0.3)', transition: '0.3s' }} onClick={() => router.push(`/config/${guildId}/premium`)}>
                                <Sparkles size={24} />
                                <span>Attiva Platinum Engine</span>
                             </button>
                        </div>
                    ) : (
                        <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                             <section className="pc-card-v2 animate slide-up">
                                <div className="card-header-v2">
                                    <div className="header-icon" style={{ background: '#fef3c7', color: '#d97706' }}><Bot size={18} /></div>
                                    <h3 style={{ margin: 0 }}>Parametri Private Bot</h3>
                                </div>
                                <div className="card-body-v2">
                                    <div className="v-stack" style={{ gap: '28px' }}>
                                        <div className="pc-input-group-v2">
                                            <label>Discord Developer Token</label>
                                            <div className="pc-input-wrapper-v2" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '20px', display: 'flex', alignItems: 'center' }}>
                                                <Key size={20} style={{ marginLeft: '20px', color: '#94a3b8' }} />
                                                <input 
                                                    type="password" 
                                                    style={{ width: '100%', border: 'none', background: 'transparent', padding: '20px', fontWeight: 800, fontSize: '1.1rem', outline: 'none' }}
                                                    placeholder="MTE5MzQyNjU0..." 
                                                    value={config.customBot?.token || ''} 
                                                    onChange={e => setNested('customBot.token', e.target.value)} 
                                                />
                                            </div>
                                            <div className="pc-alert-mini-v2" style={{ display: 'flex', gap: '12px', background: '#fffbeb', border: '1.5px solid #fde68a', padding: '16px', borderRadius: '16px', marginTop: '16px' }}>
                                                <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0 }} />
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#92400e', fontWeight: 700, lineHeight: 1.5 }}>Non condividere mai questo token. Verix userà questa chiave solo per l'istanza dedicata al tuo server.</p>
                                            </div>
                                        </div>
                                        <div className="pc-input-group-v2">
                                            <label>Nome Visualizzato</label>
                                            <input 
                                                className="pc-input-modern-v2" 
                                                style={{ padding: '18px 24px', fontSize: '1.1rem', borderRadius: '18px' }}
                                                placeholder="Il nome del tuo server..."
                                                value={config.customBot?.name || ''} 
                                                onChange={e => setNested('customBot.name', e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                </div>
                             </section>

                             <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                                <div className="card-header-v2">
                                    <div className="header-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><Activity size={18} /></div>
                                    <h3 style={{ margin: 0 }}>Presenza & Status</h3>
                                </div>
                                <div className="card-body-v2">
                                    <div className="v-stack" style={{ gap: '32px' }}>
                                        <div className="pc-input-group-v2">
                                            <label>Messaggio di Attività</label>
                                            <textarea 
                                                className="pc-input-modern-v2" 
                                                style={{ minHeight: '100px', padding: '20px', fontSize: '1rem', borderRadius: '20px', resize: 'none' }}
                                                placeholder="Es: Gioca a TuoServer.it..."
                                                value={config.customBot?.status || ''} 
                                                onChange={e => setNested('customBot.status', e.target.value)} 
                                            />
                                        </div>
                                        <div className="pc-toggle-card-v2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', background: '#f0fdf4', borderRadius: '24px', border: '1.5px solid #d1fae5' }}>
                                            <div className="v-stack">
                                                <strong style={{ fontSize: '1.05rem', fontWeight: 950, color: '#065f46' }}>White-Labeling Premium</strong>
                                                <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 750, marginTop: '4px' }}>Rimuove ogni watermark di Verix dal footer.</span>
                                            </div>
                                            <label className="pc-toggle-v2">
                                                <input type="checkbox" checked={!!config.customBot?.noBranding} onChange={e => setNested('customBot.noBranding', e.target.checked)} />
                                                <span className="pc-slider-v2"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                             </section>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="v-stack animate slide-up">
                    <section className="pc-card-v2" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: '#fef2f2', color: '#ef4444' }}><BellRing size={18} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>Fallback Registry</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 650 }}>Canale centrale per i log di sistema non categorizzati.</p>
                            </div>
                            <label className="pc-toggle-v2">
                                <input type="checkbox" checked={!!config.logs?.enabled} onChange={e => setNested('logs.enabled', e.target.checked)} />
                                <span className="pc-slider-v2"></span>
                            </label>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-group-v2">
                                <label>Canale di Destinazione</label>
                                <DiscordSelector type="channel" options={channels.filter(c => c.type === 0 || c.type === 5)} value={config.logs?.channelId || ''} onChange={val => setNested('logs.channelId', val)} />
                                <div className="pc-info-box-v2" style={{ display: 'flex', gap: '16px', background: '#f8fafc', padding: '24px', borderRadius: '24px', marginTop: '24px', border: '1.5px solid #e2e8f0' }}>
                                    <Info size={20} color="#6366f1" style={{ flexShrink: 0 }} />
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 650, lineHeight: 1.5 }}>
                                        Qui verranno inviati avvisi di sistema, errori critici di configurazione e attività degli amministratori che non hanno un modulo di log dedicato.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'advanced' && (
                <div className="v-stack animate slide-up">
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: '#1e293b', color: 'white' }}><Terminal size={18} /></div>
                            <h3 style={{ margin: 0 }}>System Configuration JSON</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-code-shell-v2" style={{ background: '#0f172a', padding: '40px', borderRadius: '32px', overflow: 'hidden', boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.3)', border: '1px solid #1e293b' }}>
                                <pre style={{ margin: 0, fontFamily: 'JetBrains Mono, Fira Code, monospace', fontSize: '0.9rem', color: '#38bdf8', lineHeight: 1.7 }}><code>{JSON.stringify(config, null, 2)}</code></pre>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 40px; max-width: 1600px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: white; padding: 32px; border-radius: 32px; box-shadow: var(--shadow-premium); border: 1px solid var(--border-light); }
            .header-info { display: flex; align-items: center; gap: 24px; }
            .pc-icon-box { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 12px 24px rgba(37, 99, 235, 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Outfit', sans-serif; font-size: 2.2rem; font-weight: 900; margin: 0; color: #1e293b; letter-spacing: -0.5px; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 900; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px; }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: white; border: none; padding: 14px 28px; border-radius: 16px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 25px rgba(99, 102, 241, 0.3); }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 8px; background: #f1f5f9; padding: 6px; border-radius: 20px; width: fit-content; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 10px; padding: 14px 28px; border: none; background: transparent; color: #64748b; font-weight: 800; font-size: 0.95rem; border-radius: 16px; cursor: pointer; transition: 0.2s; white-space: nowrap; }
            .pc-tabs-v2 button.active { background: white; color: var(--primary); box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .premium-locked-tab { color: #f59e0b !important; }

            /* Card V2 */
            .pc-card-v2 { background: white; border: 1px solid var(--border-light); border-radius: 32px; padding: 40px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 20px; margin-bottom: 40px; }
            .header-icon { width: 52px; height: 52px; borderRadius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
            .card-header-v2 h3 { margin: 0; font-family: 'Outfit'; font-size: 1.5rem; font-weight: 950; color: #1e293b; }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; }
            .pc-input-modern-v2 { width: 100%; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 14px 20px; font-weight: 800; color: #1e293b; outline: none; transition: 0.2s; }
            .pc-input-modern-v2:focus { border-color: var(--primary); background: white; }

            .pc-toggle-v2 { position: relative; width: 44px; height: 22px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: #cbd5e1; transition: .4s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background: white; transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: var(--primary); }
            input:checked + .pc-slider-v2:before { transform: translateX(22px); }

            .pc-hint-v2 { font-size: 0.85rem; color: #94a3b8; font-weight: 650; line-height: 1.5; }
            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-pro-gate-box-big-v2, :global(.light-theme) .pc-color-studio-v2, :global(.light-theme) .pc-toggle-card-v2 { background: #ffffff !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
