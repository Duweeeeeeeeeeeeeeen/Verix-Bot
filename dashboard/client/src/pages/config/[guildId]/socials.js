import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import { DiscordSelector, CustomSelect, EmbedMessageManager } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { 
    Save, Settings2, Trash2, Plus, Tv, Youtube, Instagram, Twitter, Share2, Hash, 
    MessageSquare, BellRing, ChevronRight, Sparkles, Lock, Search, Zap, Users, 
    Info, Layout, ArrowRight, X, CheckCircle2, Monitor, Globe, Cpu, UserPlus, 
    Power, Radio, Send, Bell, Palette, Globe2, Link2, Ghost
} from 'lucide-react';
import { useT } from '../../../contexts/LanguageContext';
import Head from 'next/head';

const XLogo = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4l11.733 16H20L8.267 4H4z" fill={color} stroke="none" />
        <path d="M4 20l6.768-6.768m2.464-2.464L20 4" />
    </svg>
);

const PLATFORMS = [
    { id: 'twitch', name: 'Twitch Live', icon: Tv, color: '#9146ff', description: 'Monitora gli streaming live e avvisa i tuoi utenti quando sei online.' },
    { id: 'youtube', name: 'YouTube Channel', icon: Youtube, color: '#ff0000', description: 'Notifica i nuovi video e i live streaming del tuo canale.' },
    { id: 'instagram', name: 'Instagram Studio', icon: Instagram, color: '#e1306c', description: 'Condividi i nuovi post e storie direttamente su Discord.' },
    { id: 'tiktok', name: 'TikTok Feed', icon: Share2, color: '#000000', description: 'Avvisa la tua community per ogni nuovo video caricato.' },
    { id: 'twitter', name: '𝕏 (Twitter) Hub', icon: XLogo, color: '#000000', description: 'Sincronizza i tuoi tweet in tempo reale in un canale Discord.' }
];

export default function SocialsConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [guildData, setGuildData] = useState(null);
  
  const [activePlatform, setActivePlatform] = useState('twitch');
  const [activeTab, setActiveTab] = useState('settings'); 

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
      const [configRes, discordRes, guildRes] = await Promise.all([
        api.request(`/config/${guildId}/socials`),
        api.request(`/config/${guildId}/discord-data`),
        api.request(`/config/${guildId}/guild`)
      ]);
      let moduleConfig = configRes?.data || configRes || { platforms: {} };
      if (!moduleConfig.platforms) moduleConfig.platforms = {};
      
      PLATFORMS.forEach(p => {
          if (!moduleConfig.platforms[p.id]) {
              moduleConfig.platforms[p.id] = { enabled: false, notificationChannelId: null, roleId: null, mentionEveryone: false, accounts: [], embed: {} };
          }
      });
      
      setConfig(moduleConfig);
      setDiscordData(discordRes?.data || discordRes || { roles: [], channels: [] });
      setGuildData(guildRes?.data || guildRes);
    } catch (err) {
      console.error("Failed to load socials config", err);
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/socials`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Social Protocol sincronizzato!", type: 'success' } }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Errore durante la sincronizzazione.", type: 'error' } }));
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const updatePlatform = (field, value) => {
    const newConfig = { ...config };
    newConfig.platforms[activePlatform][field] = value;
    setConfig(newConfig);
  };

  const addAccount = () => {
    const newConfig = { ...config };
    newConfig.platforms[activePlatform].accounts.push({ username: '', discordUserId: null });
    setConfig(newConfig);
  };

  const removeAccount = (index) => {
    const newConfig = { ...config };
    newConfig.platforms[activePlatform].accounts.splice(index, 1);
    setConfig(newConfig);
  };

  const updateAccount = (index, field, value) => {
    const newConfig = { ...config };
    newConfig.platforms[activePlatform].accounts[index][field] = value;
    setConfig(newConfig);
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  const currentPlatformConfig = config.platforms[activePlatform];
  const pData = PLATFORMS.find(p => p.id === activePlatform);
  const isLocked = !guildData?.isPremium && activePlatform !== 'twitch' && !['premium', 'platinum'].includes(guildData?.premiumTier);

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>Social Studio Pro | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #d946ef 100%)' }}>
                    <Globe2 size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>Social Studio Pro</h1>
                    <div className="pc-status-tag-v2 on">
                        <div className="status-dot-v2"></div>
                        MULTI-SYNC ENGINE ACTIVE
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? 'Sincronizzazione...' : 'Salva Studio'}</span>
                </button>
            </div>
        </header>

        <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '40px' }}>
            {/* V2 Platform Navigator Sidebar */}
            <aside className="v-stack animate slide-up" style={{ gap: '32px' }}>
                <div className="pc-sidebar-card-v2" style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '32px', boxShadow: 'var(--shadow-premium)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 950, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px', display: 'block' }}>Platform Repository</span>
                    <nav className="pc-nav-stack-v2" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {PLATFORMS.map(p => {
                            const locked = !guildData?.isPremium && p.id !== 'twitch' && !['premium', 'platinum'].includes(guildData?.premiumTier);
                            const active = activePlatform === p.id;
                            const isEnabled = config.platforms[p.id]?.enabled;
                            return (
                                <button 
                                    key={p.id} 
                                    className={`pc-nav-item-v2 ${active ? 'active' : ''} ${locked ? 'locked' : ''}`}
                                    onClick={() => setActivePlatform(p.id)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: 'none', background: active ? 'var(--bg-badge)' : 'transparent', borderRadius: '22px', cursor: locked ? 'not-allowed' : 'pointer', transition: '0.3s', border: active ? '1.5px solid var(--border-strong)' : '1.5px solid transparent', position: 'relative' }}
                                >
                                    <div className="p-icon-box-v2" style={{ width: '48px', height: '48px', borderRadius: '14px', background: active ? p.color : 'var(--bg-badge)', color: active ? 'white' : locked ? 'var(--text-muted)' : p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }}>
                                        {locked ? <Lock size={20} /> : <p.icon size={22} />}
                                    </div>
                                    <div className="v-stack" style={{ flex: 1, textAlign: 'left' }}>
                                        <span style={{ fontWeight: 950, fontSize: '1rem', color: active ? 'var(--text-heading)' : 'var(--text-main)' }}>{p.name}</span>
                                        {isEnabled && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}><div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }}></div><span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 900, textTransform: 'uppercase' }}>Synchronized</span></div>}
                                    </div>
                                    {active && <ChevronRight size={18} color="var(--primary)" style={{ opacity: 0.5 }} />}
                                    {locked && <div style={{ position: 'absolute', right: '14px', top: '14px', background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', color: 'white', padding: '4px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(124, 58, 237, 0.2)' }}><Sparkles size={10} /></div>}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="pc-pro-card-v2" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '32px', borderRadius: '32px', color: 'white', border: 'none', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '14px', color: '#38bdf8' }}><Cpu size={22} /></div>
                            <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 950 }}>Edge Monitoring</h4>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.7, fontWeight: 700 }}>Le nostre istanze Edge monitorano i social in tempo reale. Latenza media di notifica inferiore a 45 secondi.</p>
                    </div>
                    <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05 }}><Globe2 size={120} /></div>
                </div>
            </aside>

            {/* V2 Main Platform Studio Area */}
            <main className="v-stack" style={{ gap: '32px' }}>
                {isLocked ? (
                    <div className="pc-tier-gate-v2 animate slide-up" style={{ padding: '100px 40px', background: 'var(--bg-card)', borderRadius: '40px', border: '1px solid var(--border)', textAlign: 'center', boxShadow: 'var(--shadow-premium)' }}>
                        <div style={{ width: '100px', height: '100px', background: 'var(--bg-badge)', color: 'var(--primary)', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px', boxShadow: '0 20px 40px rgba(124, 58, 237, 0.15)' }}>
                            <Lock size={48} />
                        </div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 950, marginBottom: '16px', color: 'var(--text-heading)', letterSpacing: '-1.5px' }}>Premium Studio Slot</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', marginBottom: '48px', maxWidth: '500px', margin: '0 auto 48px', fontWeight: 650, lineHeight: 1.6 }}>Il monitoraggio professionale di <strong>{pData.name}</strong> è riservato ai partner con abbonamento Platinum.</p>
                        <button className="pc-btn-primary" style={{ margin: '0 auto', background: 'linear-gradient(135deg, #6366f1 0%, #d946ef 100%)', padding: '20px 52px', fontSize: '1.1rem', borderRadius: '20px' }} onClick={() => router.push(`/config/${guildId}/premium`)}>
                            <Sparkles size={22} />
                            <span>Effettua Upgrade Ora</span>
                        </button>
                    </div>
                ) : (
                    <div className="v-stack animate slide-up" key={activePlatform} style={{ gap: '32px' }}>
                        <section className="pc-platform-banner-v2" style={{ display: 'flex', alignItems: 'center', gap: '32px', padding: '40px', background: 'var(--bg-card)', borderRadius: '32px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-premium)' }}>
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '10px', background: pData.color }}></div>
                            <div className="p-hero-icon-v2" style={{ width: '80px', height: '80px', borderRadius: '22px', background: 'var(--bg-badge)', color: pData.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 1.5px rgba(0,0,0,0.03)' }}>
                                <pData.icon size={42} />
                            </div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 950, color: 'var(--text-heading)', letterSpacing: '-0.5px' }}>Hub {pData.name}</h2>
                                <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 650, lineHeight: 1.5 }}>{pData.description}</p>
                            </div>
                            <div className="v-stack" style={{ alignItems: 'flex-end', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: currentPlatformConfig.enabled ? '#ecfdf5' : '#f1f5f9', color: currentPlatformConfig.enabled ? '#10b981' : '#94a3b8', padding: '6px 14px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 950, border: currentPlatformConfig.enabled ? '1.5px solid #d1fae5' : '1.5px solid #e2e8f0' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                                    {currentPlatformConfig.enabled ? 'SERVIZIO ATTIVO' : 'SERVIZIO STANDBY'}
                                </div>
                                <label className="pc-toggle-v2">
                                    <input type="checkbox" checked={currentPlatformConfig.enabled} onChange={e => updatePlatform('enabled', e.target.checked)} />
                                    <span className="pc-slider-v2"></span>
                                </label>
                            </div>
                        </section>

                        {!currentPlatformConfig.enabled ? (
                            <div className="pc-card-v2" style={{ textAlign: 'center', padding: '120px 40px', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '40px' }}>
                                <div style={{ width: '90px', height: '90px', background: 'white', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', color: '#cbd5e1', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                                    <Radio size={48} />
                                </div>
                                <h3 style={{ margin: 0, fontWeight: 950, color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Pronto per la Sincronizzazione?</h3>
                                <p style={{ color: '#64748b', margin: '16px 0 40px', fontWeight: 700, fontSize: '1.1rem', maxWidth: '450px', marginInline: 'auto' }}>Attiva il monitoraggio di {pData.name} per iniziare a ricevere notifiche automatiche nel tuo server.</p>
                                <button className="pc-btn-primary" style={{ margin: '0 auto', padding: '18px 48px', borderRadius: '20px' }} onClick={() => updatePlatform('enabled', true)}>Deploy Modulo {pData.name}</button>
                            </div>
                        ) : (
                            <>
                                <nav className="pc-tabs-v2" style={{ display: 'flex', gap: '8px', background: 'var(--bg-badge)', padding: '6px', borderRadius: '20px', width: 'fit-content' }}>
                                    <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px', border: 'none', background: activeTab === 'settings' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'settings' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 950, fontSize: '0.95rem', borderRadius: '16px', cursor: 'pointer', transition: '0.2s', boxShadow: activeTab === 'settings' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}>
                                         <UserPlus size={18} /> <span>Account Studio</span>
                                     </button>
                                     <button className={activeTab === 'design' ? 'active' : ''} onClick={() => setActiveTab('design')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px', border: 'none', background: activeTab === 'design' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'design' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 950, fontSize: '0.95rem', borderRadius: '16px', cursor: 'pointer', transition: '0.2s', boxShadow: activeTab === 'design' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}>
                                         <Palette size={18} /> <span>Creative Design</span>
                                     </button>
                                 </nav>

                                 {activeTab === 'settings' && (
                                     <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px' }}>
                                         <div className="v-stack" style={{ gap: '32px' }}>
                                             <section className="pc-card-v2">
                                                 <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                                     <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Users size={18} /></div>
                                                     <h3 style={{ margin: 0 }}>Canali Monitorati</h3>
                                                 </div>
                                                 <div className="card-body-v2">
                                                     <div className="v-stack" style={{ gap: '20px' }}>
                                                         {currentPlatformConfig.accounts.map((acc, i) => (
                                                             <div key={i} className="pc-sub-card-v2 animate slide-up" style={{ display: 'flex', gap: '20px', background: 'var(--bg-badge)', padding: '24px', borderRadius: '24px', border: '1.5px solid var(--border)', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                                                 <div className="v-stack" style={{ flex: 1, gap: '10px' }}>
                                                                     <label style={{ fontSize: '0.75rem', fontWeight: 950, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{pData.name} Identity / URL</label>
                                                                     <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-card)', padding: '10px 20px', borderRadius: '16px', border: '1.5px solid var(--border)' }}>
                                                                         <Link2 size={18} color="var(--text-muted)" />
                                                                         <input 
                                                                             style={{ border: 'none', background: 'transparent', padding: '8px 0', width: '100%', fontWeight: 900, fontSize: '1.05rem', outline: 'none', color: 'var(--text-heading)' }}
                                                                             placeholder={`Es: ${pData.id === 'twitch' ? 'verix_official' : 'VerixBot'}`}
                                                                             value={acc.username}
                                                                             onChange={e => updateAccount(i, 'username', e.target.value)}
                                                                         />
                                                                     </div>
                                                                 </div>
                                                                 <button onClick={() => removeAccount(i)} className="pc-btn-delete-studio-v2" style={{ marginTop: '26px', width: '48px', height: '48px', borderRadius: '14px', background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>
                                                                     <Trash2 size={22} />
                                                                 </button>
                                                             </div>
                                                         ))}
                                                         <button className="pc-btn-add-account" onClick={addAccount} style={{ width: '100%', padding: '28px', border: '2.5px dashed var(--border)', background: 'var(--bg-card)', borderRadius: '28px', color: 'var(--text-muted)', fontWeight: 950, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', transition: '0.3s', fontSize: '1rem' }}>
                                                             <Plus size={24} /> <span>Connect New {pData.name} Account</span>
                                                         </button>
                                                     </div>
                                                 </div>
                                             </section>
                                         </div>

                                        <div className="v-stack" style={{ gap: '32px' }}>
                                            <section className="pc-card-v2">
                                                <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                                                    <div className="header-icon" style={{ background: '#f0f9ff', color: '#0ea5e9' }}><Bell size={18} /></div>
                                                    <h3 style={{ margin: 0 }}>Dispatch Settings</h3>
                                                </div>
                                                <div className="card-body-v2">
                                                    <div className="pc-input-group-v2">
                                                        <label>Target Notification Channel</label>
                                                        <DiscordSelector type="channel" options={discordData.channels} value={currentPlatformConfig.notificationChannelId || ''} onChange={val => updatePlatform('notificationChannelId', val)} />
                                                    </div>
                                                    <div className="pc-input-group-v2" style={{ marginTop: '32px' }}>
                                                        <label>Target Mention Role</label>
                                                        <DiscordSelector type="role" options={discordData.roles} value={currentPlatformConfig.roleId || ''} onChange={val => updatePlatform('roleId', val)} />
                                                    </div>
                                                    <div style={{ marginTop: '40px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', padding: '32px', borderRadius: '28px', border: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div className="v-stack" style={{ gap: '4px' }}>
                                                            <strong style={{ fontWeight: 950, fontSize: '1.1rem', color: '#1e293b', letterSpacing: '-0.5px' }}>Global @everyone Tag</strong>
                                                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Forza la notifica a tutti i membri.</span>
                                                        </div>
                                                        <label className="pc-toggle-v2">
                                                            <input type="checkbox" checked={currentPlatformConfig.mentionEveryone} onChange={e => updatePlatform('mentionEveryone', e.target.checked)} />
                                                            <span className="pc-slider-v2"></span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'design' && (
                                    <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                                        <EmbedMessageManager 
                                            guildId={guildId}
                                            module="socials"
                                            slugs={[
                                                { key: pData.id, label: `${pData.name} Announcement`, description: `Design del messaggio inviato quando l'account ${pData.name} pubblica un nuovo contenuto.`, variables: ['username', 'link', 'title', 'preview_url', 'platform'], group: 'Social Studio', groupIcon: Globe2 },
                                            ]}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 40px; max-width: 1700px; margin: 0 auto; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: var(--bg-card); padding: 32px; border-radius: 32px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 24px; }
            .pc-icon-box { width: 64px; height: 64px; color: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 24px rgba(99, 102, 241, 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-size: 2.2rem; font-weight: 950; margin: 0; color: var(--text-heading); letter-spacing: -1.2px; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 950; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px; }
            .pc-status-tag-v2.on { background: var(--primary-glow); color: var(--primary); }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; animation: dot-pulse 2s infinite; }
            @keyframes dot-pulse { 0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(99, 102, 241, 0); } 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } }

            .pc-btn-primary { background: var(--primary); color: white; border: none; padding: 14px 28px; border-radius: 18px; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.3s; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(99, 102, 241, 0.3); }

            /* Card V2 */
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 32px; padding: 40px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 20px; }
            .header-icon { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
            .card-header-v2 h3 { margin: 0; font-size: 1.5rem; font-weight: 950; color: var(--text-heading); }

            /* Navigation & Inputs */
            .pc-nav-item-v2.active { background: var(--primary-glow) !important; border-color: var(--primary) !important; box-shadow: 0 8px 24px rgba(99, 102, 241, 0.05); }
            .pc-btn-add-account:hover { border-color: var(--primary) !important; color: var(--primary) !important; background: var(--primary-glow) !important; transform: translateY(-3px); }
            .pc-btn-delete-studio-v2:hover { background: #ef4444 !important; color: white !important; transform: rotate(8deg); }

            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 950; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }

            .pc-toggle-v2 { position: relative; width: 44px; height: 22px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: var(--bg-badge); transition: .4s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background: white; transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: var(--primary); }
            input:checked + .pc-slider-v2:before { transform: translateX(22px); }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
