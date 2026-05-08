import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  Shield, Ticket, Users, Mic2, ArrowRight, RefreshCcw, Zap, Activity, ShieldCheck,
  ExternalLink, Info, Camera, Globe, ShieldAlert, Power, UserPlus, Layout as LayoutIcon,
  ChevronRight, Box, Settings2, TrendingUp, Plus, MousePointer2, ListChecks, Crown,
  History, LayoutTemplate, CheckCircle2, AlertTriangle, Sparkles, Layers, Award,
  Cpu, MessageSquare, Terminal, Heart, Share2, Filter, Search, MoreHorizontal, Bell,
  Target, Rocket, Command, HelpCircle
} from 'lucide-react';
import Head from 'next/head';

export default function GuildHome() {
  const { t } = useT();
  const { user } = useAuth();
  const router = useRouter();
  const { guildId } = router.query;
  const [stats, setStats] = useState({ openTickets: 0, pendingWhitelist: 0, activeVoiceSessions: 0 });
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && guildId !== 'undefined' && mounted) {
      fetchData();
    }
  }, [guildId, mounted]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const responses = await Promise.all([
        api.request(`/config/${guildId}`),
        api.request(`/config/${guildId}/stats`)
      ]);

      const [configData, statsData] = responses;
      
      setConfig(configData);
      setStats(statsData?.data || statsData);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || "Errore di connessione");
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const toggleModule = async (moduleName, currentStatus) => {
    setUpdating(moduleName);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      let endpoint = `/config/${guildId}/${moduleName}`;
      if (moduleName === 'polls') endpoint = `/config/${guildId}/polls/config`;
      if (moduleName === 'reactionRoles') endpoint = `/config/${guildId}/reaction-roles`;

      await api.request(endpoint, {
        method: 'POST',
        body: JSON.stringify({ enabled: !currentStatus })
      });
      
      await fetchData();
      window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: `Modulo ${moduleName.toUpperCase()} ${!currentStatus ? 'attivato' : 'disattivato'}!`, type: 'success' } 
      }));
    } catch (error) {
        console.error('Toggle error:', error);
    } finally {
      setUpdating(null);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

   if (!mounted || loading) return <Skeleton height="600px" />;

  if (error) return (
    <div className="pc-error-view-v2 animate fade-in" style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: '32px', boxShadow: 'var(--shadow-premium)', border: '1px solid var(--border-light)', maxWidth: '600px', margin: '40px auto' }}>
      <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '24px' }} />
      <h2 style={{ fontFamily: 'Outfit', fontWeight: 950, marginBottom: '12px' }}>Connessione Fallita</h2>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>{error}</p>
      <button onClick={fetchData} className="pc-btn-primary" style={{ margin: '0 auto' }}>Riprova</button>
    </div>
  );

  const activeModulesCount = [
    'whitelist', 'tickets', 'verify', 'photocontest', 'support', 'fivem', 'welcome', 'reactionRoles', 'polls'
  ].filter(id => config?.[id]?.enabled).length;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>Dashboard Hub | {config?.guildName || 'Verix'}</title>
        </Head>

        {/* V2 Hero Studio */}
        <section className="pc-hero-studio-v2 animate slide-up">
            <div className="hero-visuals-v2">
                <div className="server-avatar-container-v2">
                    {config?.guildIcon ? (
                        <img src={config.guildIcon} alt={config.guildName} className="server-icon-v2" />
                    ) : (
                        <div className="avatar-placeholder-v2">{config?.guildName?.charAt(0)}</div>
                    )}
                    {config?.isPremium && (
                        <div className="premium-crown-v2">
                            <Crown size={14} fill="currentColor" />
                        </div>
                    )}
                </div>
                <div className="hero-text-v2">
                    <div className="status-row-v2">
                        <span className="live-tag-v2"><div className="pulse-dot"></div> ENGINE ONLINE</span>
                        <div className={`tier-badge-v2 ${config?.isPremium ? 'premium' : 'standard'}`}>
                            {config?.isPremium ? 'VERIX PLATINUM' : 'VERIX STANDARD'}
                        </div>
                    </div>
                    <h1>Bentornato, <span className="user-name-v2">{user?.username}</span></h1>
                    <p>Gestione operativa di <strong>{config?.guildName}</strong> • <strong>{activeModulesCount}</strong> moduli attivi</p>
                </div>
            </div>
            
            <div className="hero-controls-v2">
                {config?.mainBotMissing && (
                    <button className="pc-btn-invite-v2" onClick={() => window.open(config.mainBotInviteUrl, '_blank')}>
                        <Rocket size={20} />
                        <span>Invita Verix</span>
                    </button>
                )}
                <button className="pc-btn-refresh-v2" onClick={fetchData}>
                    <RefreshCcw size={20} className={loading ? 'spin' : ''} />
                </button>
            </div>
        </section>

        {/* V2 Metric Engine */}
        <div className="pc-metric-grid-v2">
            {[
                { label: 'Tickets Aperti', value: stats?.openTickets || 0, icon: Ticket, color: '#6366f1', trend: '+12% questa settimana' },
                { label: 'Richieste Whitelist', value: stats?.pendingWhitelist || 0, icon: ShieldCheck, color: '#f59e0b', trend: 'In attesa di revisione' },
                { label: 'Sessioni SOS', value: stats?.activeVoiceSessions || 0, icon: Activity, color: '#10b981', trend: 'Sistema di emergenza attivo' }
            ].map((stat, idx) => (
                <div key={idx} className="pc-metric-card-v2 animate slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div className="metric-header-v2">
                        <div className="metric-icon-v2" style={{ background: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={26} />
                        </div>
                        <div className="metric-value-v2">
                            <span className="count-v2">{stat.value}</span>
                            <span className="label-v2">{stat.label}</span>
                        </div>
                    </div>
                    <div className="metric-footer-v2">
                        <TrendingUp size={14} style={{ opacity: 0.6 }} />
                        <span>{stat.trend}</span>
                    </div>
                    <div className="metric-glow-v2" style={{ background: stat.color }}></div>
                </div>
            ))}
        </div>

        {/* V2 Workspace Layout */}
        <div className="pc-workspace-v2">
            <main className="pc-main-deck-v2">
                <div className="deck-header-v2">
                    <div className="title-group-v2">
                        <Box size={22} color="var(--primary)" />
                        <h3>Moduli Operativi</h3>
                    </div>
                    <div className="deck-stats-v2">
                        <span>{activeModulesCount} ATTIVI</span>
                        <div className="progress-bar-v2"><div className="fill" style={{ width: `${(activeModulesCount / 9) * 100}%` }}></div></div>
                    </div>
                </div>

                <div className="pc-module-grid-v2">
                    {[
                        { id: 'whitelist', label: 'Whitelist', icon: ShieldCheck, color: '#6366f1', path: 'whitelist', desc: 'Gestione accessi e selezioni.' },
                        { id: 'tickets', label: 'Ticket System', icon: Ticket, color: '#8b5cf6', path: 'tickets', desc: 'Assistenza e supporto utenti.' },
                        { id: 'reactionRoles', label: 'Ruoli a Reazione', icon: MousePointer2, color: '#10b981', path: 'reaction-roles', desc: 'Auto-assegnazione ruoli.' },
                        { id: 'polls', label: 'Poll Studio', icon: ListChecks, color: '#f59e0b', path: 'polls', desc: 'Creazione sondaggi avanzati.' },
                        { id: 'verify', label: 'Security Center', icon: Shield, color: '#06b6d4', path: 'verify', desc: 'Protezione bot e verifica.' },
                        { id: 'photocontest', label: 'Photo Contest', icon: Camera, color: '#ec4899', path: 'photocontest', desc: 'Competizioni fotografiche.' },
                        { id: 'support', label: 'Assistenza Vocale', icon: Mic2, color: '#f43f5e', path: 'support', desc: 'Canali di supporto SOS.' },
                        { id: 'fivem', label: 'FiveM Bridge', icon: Globe, color: '#14b8a6', path: 'fivem', desc: 'Integrazione server live.' },
                        { id: 'welcome', label: 'Welcome Hub', icon: UserPlus, color: '#6366f1', path: 'welcome', desc: 'Benvenuto e autoruoli.' }
                    ].map(module => {
                        const isEnabled = config?.[module.id]?.enabled;
                        return (
                            <div key={module.id} className={`pc-module-studio-card-v2 ${isEnabled ? 'on' : 'off'}`}>
                                <div className="card-top-v2">
                                    <div className="module-icon-v2" style={{ color: module.color }}>
                                        <module.icon size={26} />
                                    </div>
                                    <label className="pc-toggle-v2 mini">
                                        <input type="checkbox" checked={isEnabled} onChange={() => toggleModule(module.id, isEnabled)} disabled={updating === module.id} />
                                        <span className="pc-slider-v2"></span>
                                    </label>
                                </div>
                                <div className="card-body-v2" onClick={() => router.push(`/config/${guildId}/${module.path}`)}>
                                    <h4>{module.label}</h4>
                                    <p>{module.desc}</p>
                                </div>
                                <div className="card-footer-v2">
                                    <div className="status-indicator-v2">
                                        <div className="status-pill-v2">{isEnabled ? 'ONLINE' : 'OFFLINE'}</div>
                                    </div>
                                    <button className="pc-btn-enter-v2" onClick={() => router.push(`/config/${guildId}/${module.path}`)}>
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            <aside className="pc-control-panel-v2">
                <section className="pc-card-v2 side-panel-v2">
                    <div className="panel-header-v2">
                        <Command size={18} color="#6366f1" />
                        <h4>Centro di Comando</h4>
                    </div>
                    <div className="panel-nav-v2">
                        {[
                            { label: 'Embed Designer', path: 'embeds', icon: LayoutTemplate, color: '#10b981', sub: 'Progetta messaggi' },
                            { label: 'Automazioni', path: 'automations', icon: Cpu, color: '#f59e0b', sub: 'Auto-Clear & Broadcast' },
                            { label: 'White Label', path: 'white-label', icon: Sparkles, color: '#6366f1', sub: 'Branding Personalizzato' },
                            { label: 'Audit Registry', path: 'audit', icon: History, color: '#64748b', sub: 'Log delle attività' },
                            { label: 'Global Settings', path: 'global', icon: Settings2, color: '#1e293b', sub: 'Configurazione base' }
                        ].map(nav => (
                            <button key={nav.path} onClick={() => router.push(`/config/${guildId}/${nav.path}`)} className="nav-btn-v2">
                                <div className="nav-icon-v2" style={{ background: `${nav.color}10`, color: nav.color }}>
                                    <nav.icon size={20} />
                                </div>
                                <div className="nav-text-v2">
                                    <span className="main-v2">{nav.label}</span>
                                    <span className="sub-v2">{nav.sub}</span>
                                </div>
                                <ChevronRight size={14} className="arrow-v2" />
                            </button>
                        ))}
                    </div>
                    
                    <div className="panel-divider-v2"></div>
                    
                    <button className="pc-btn-danger-v2" onClick={() => confirm("ATTENZIONE: Questa azione ripristinerà TUTTI i moduli ai valori di fabbrica. Procedere?")}>
                        <RefreshCcw size={16} />
                        <span>Factory Reset</span>
                    </button>
                </section>

                <div className="pc-help-banner-v2">
                    <div className="help-icon-v2"><HelpCircle size={24} /></div>
                    <div className="help-text-v2">
                        <strong>Verix Academy</strong>
                        <p>Impara a configurare al meglio il tuo server.</p>
                        <button onClick={() => window.open('https://docs.verixbot.com', '_blank')}>Leggi Documentazione</button>
                    </div>
                </div>
            </aside>
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 40px; max-width: 1600px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Hero Studio V2 */
            .pc-hero-studio-v2 { display: flex; justify-content: space-between; align-items: center; background: white; padding: 48px; border-radius: 40px; box-shadow: var(--shadow-premium); border: 1px solid var(--border-light); margin-bottom: 40px; }
            .hero-visuals-v2 { display: flex; align-items: center; gap: 32px; }
            .server-avatar-container-v2 { position: relative; width: 110px; height: 110px; }
            .server-icon-v2 { width: 100%; height: 100%; border-radius: 32px; object-fit: cover; border: 4px solid white; box-shadow: 0 15px 35px rgba(0,0,0,0.1); }
            .avatar-placeholder-v2 { width: 100%; height: 100%; border-radius: 32px; background: var(--primary); color: white; display: flex; alignItems: center; justifyContent: center; fontSize: 2.8rem; fontWeight: 900; }
            .premium-crown-v2 { position: absolute; bottom: -8px; right: -8px; width: 36px; height: 36px; background: linear-gradient(135deg, #f59e0b, #fbbf24); color: white; border-radius: 50%; display: flex; alignItems: center; justifyContent: center; border: 4px solid white; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4); }
            
            .hero-text-v2 h1 { font-family: 'Outfit'; font-size: 2.8rem; fontWeight: 950; margin: 0; color: #1e293b; letterSpacing: -1.5px; }
            .user-name-v2 { background: linear-gradient(135deg, #6366f1 0%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .hero-text-v2 p { margin: 8px 0 0 0; color: #64748b; font-size: 1.15rem; fontWeight: 600; }
            .status-row-v2 { display: flex; gap: 12px; margin-bottom: 12px; }
            .live-tag-v2 { font-size: 0.65rem; fontWeight: 950; color: #10b981; background: #ecfdf5; padding: 4px 14px; border-radius: 100px; display: flex; alignItems: center; gap: 8px; letterSpacing: 1px; }
            .pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; animation: pulse 1.5s infinite; }
            @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
            .tier-badge-v2 { font-size: 0.65rem; fontWeight: 950; padding: 4px 14px; border-radius: 100px; letterSpacing: 1px; }
            .tier-badge-v2.premium { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
            .tier-badge-v2.standard { background: #f1f5f9; color: #64748b; }

            .hero-controls-v2 { display: flex; gap: 16px; }
            .pc-btn-invite-v2 { background: var(--primary); color: white; border: none; padding: 16px 32px; border-radius: 20px; font-weight: 900; cursor: pointer; display: flex; alignItems: center; gap: 12px; transition: 0.3s; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.25); }
            .pc-btn-invite-v2:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(99, 102, 241, 0.35); }
            .pc-btn-refresh-v2 { width: 56px; height: 56px; border-radius: 20px; border: 1.5px solid #e2e8f0; background: white; color: #64748b; cursor: pointer; display: flex; alignItems: center; justifyContent: center; transition: 0.2s; }
            .pc-btn-refresh-v2:hover { border-color: var(--primary); color: var(--primary); background: #f5f3ff; }

            /* Metrics V2 */
            .pc-metric-grid-v2 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin-bottom: 48px; }
            .pc-metric-card-v2 { background: white; border-radius: 32px; padding: 32px; border: 1.5px solid var(--border-light); position: relative; overflow: hidden; transition: 0.3s; box-shadow: 0 8px 30px rgba(0,0,0,0.02); }
            .pc-metric-card-v2:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,0.05); }
            .metric-header-v2 { display: flex; gap: 24px; align-items: center; margin-bottom: 24px; }
            .metric-icon-v2 { width: 64px; height: 64px; border-radius: 20px; display: flex; alignItems: center; justifyContent: center; }
            .metric-value-v2 { display: flex; flexDirection: column; }
            .count-v2 { font-size: 2.2rem; fontWeight: 950; color: #1e293b; lineHeight: 1; letterSpacing: -1px; }
            .label-v2 { font-size: 0.85rem; fontWeight: 800; color: #94a3b8; textTransform: uppercase; marginTop: 4px; letterSpacing: 0.5px; }
            .metric-footer-v2 { display: flex; alignItems: center; gap: 8px; font-size: 0.8rem; fontWeight: 700; color: #64748b; border-top: 1.5px dashed #f1f5f9; padding-top: 16px; }
            .metric-glow-v2 { position: absolute; bottom: 0; left: 0; width: 100%; height: 4px; opacity: 0.1; }

            /* Workspace V2 */
            .pc-workspace-v2 { display: grid; grid-template-columns: 1fr 380px; gap: 48px; }
            .deck-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
            .title-group-v2 { display: flex; alignItems: center; gap: 12px; }
            .title-group-v2 h3 { margin: 0; font-family: 'Outfit'; font-size: 1.4rem; fontWeight: 950; color: #1e293b; }
            .deck-stats-v2 { display: flex; alignItems: center; gap: 20px; }
            .deck-stats-v2 span { font-size: 0.75rem; fontWeight: 900; color: #94a3b8; letterSpacing: 1px; }
            .progress-bar-v2 { width: 120px; height: 8px; background: #f1f5f9; border-radius: 100px; overflow: hidden; }
            .progress-bar-v2 .fill { height: 100%; background: var(--primary); border-radius: 100px; transition: 0.6s cubic-bezier(0.4, 0, 0.2, 1); }

            /* Module Studio Cards V2 */
            .pc-module-grid-v2 { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
            .pc-module-studio-card-v2 { background: white; border-radius: 32px; padding: 32px; border: 1.5px solid var(--border-light); transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; }
            .pc-module-studio-card-v2:hover { transform: translateY(-8px); box-shadow: 0 15px 40px rgba(0,0,0,0.06); border-color: #cbd5e1; }
            .pc-module-studio-card-v2.on { border-color: #e0e7ff; background: linear-gradient(135deg, #ffffff 0%, #f9faff 100%); }
            
            .card-top-v2 { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
            .card-body-v2 { cursor: pointer; }
            .card-body-v2 h4 { margin: 0 0 10px 0; font-size: 1.25rem; fontWeight: 950; color: #1e293b; }
            .card-body-v2 p { margin: 0; font-size: 0.95rem; color: #64748b; lineHeight: 1.5; fontWeight: 650; }
            
            .card-footer-v2 { display: flex; justify-content: space-between; align-items: center; margin-top: 28px; padding-top: 20px; border-top: 1.5px solid #f1f5f9; }
            .status-pill-v2 { font-size: 0.65rem; fontWeight: 950; padding: 4px 12px; border-radius: 100px; background: #f8fafc; color: #94a3b8; border: 1px solid #e2e8f0; }
            .on .status-pill-v2 { background: #ecfdf5; color: #10b981; border-color: #d1fae5; }
            
            .pc-btn-enter-v2 { width: 44px; height: 44px; border-radius: 14px; background: #f8fafc; color: #cbd5e1; border: none; cursor: pointer; display: flex; alignItems: center; justifyContent: center; transition: 0.2s; }
            .on .pc-btn-enter-v2 { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2); }
            .pc-module-studio-card-v2:hover .pc-btn-enter-v2 { transform: translateX(4px); }

            /* Side Panel V2 */
            .side-panel-v2 { padding: 32px; border-radius: 40px; }
            .panel-header-v2 { display: flex; alignItems: center; gap: 12px; margin-bottom: 28px; }
            .panel-header-v2 h4 { margin: 0; font-family: 'Outfit'; font-size: 1.25rem; fontWeight: 950; color: #1e293b; }
            
            .panel-nav-v2 { display: flex; flexDirection: column; gap: 10px; }
            .nav-btn-v2 { display: flex; alignItems: center; gap: 16px; padding: 14px; background: #f8fafc; border: 1.5px solid transparent; border-radius: 20px; cursor: pointer; transition: 0.3s; text-align: left; }
            .nav-btn-v2:hover { background: white; border-color: #e2e8f0; transform: translateX(8px); box-shadow: 0 10px 25px rgba(0,0,0,0.03); }
            .nav-icon-v2 { width: 48px; height: 48px; border-radius: 16px; display: flex; alignItems: center; justifyContent: center; flex-shrink: 0; }
            .nav-text-v2 { display: flex; flexDirection: column; gap: 2px; }
            .main-v2 { font-weight: 900; font-size: 0.95rem; color: #1e293b; }
            .sub-v2 { font-size: 0.75rem; font-weight: 750; color: #94a3b8; }
            .arrow-v2 { margin-left: auto; color: #cbd5e1; transition: 0.2s; }
            .nav-btn-v2:hover .arrow-v2 { color: var(--primary); transform: translateX(2px); }

            .panel-divider-v2 { height: 1.5px; background: #f1f5f9; margin: 28px 0; }
            .pc-btn-danger-v2 { width: 100%; display: flex; alignItems: center; justifyContent: center; gap: 12px; padding: 16px; background: #fff1f2; color: #ef4444; border: 1.5px solid #fee2e2; border-radius: 18px; font-weight: 900; font-size: 0.9rem; cursor: pointer; transition: 0.2s; }
            .pc-btn-danger-v2:hover { background: #ef4444; color: white; border-color: #ef4444; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(239, 68, 68, 0.2); }

            .pc-help-banner-v2 { margin-top: 40px; padding: 32px; background: #f0f9ff; border: 1.5px solid #e0f2fe; border-radius: 32px; display: flex; gap: 20px; }
            .help-icon-v2 { width: 52px; height: 52px; background: white; color: #0ea5e9; border-radius: 16px; display: flex; alignItems: center; justifyContent: center; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.1); flex-shrink: 0; }
            .help-text-v2 strong { display: block; font-size: 1.1rem; fontWeight: 950; color: #0369a1; margin-bottom: 6px; }
            .help-text-v2 p { margin: 0 0 16px 0; font-size: 0.9rem; fontWeight: 700; color: #0ea5e9; lineHeight: 1.5; }
            .help-text-v2 button { background: #0ea5e9; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 900; font-size: 0.85rem; cursor: pointer; transition: 0.2s; }
            .help-text-v2 button:hover { background: #0369a1; transform: translateY(-2px); }

            /* Common V2 Toggles */
            .pc-toggle-v2 { position: relative; width: 44px; height: 22px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: #cbd5e1; transition: .4s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background: white; transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: var(--primary); }
            input:checked + .pc-slider-v2:before { transform: translateX(22px); }

            .spin { animation: spin 1s linear infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-hero-studio-v2, :global(.light-theme) .pc-metric-card-v2, :global(.light-theme) .pc-module-studio-card-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .nav-btn-v2 { background: #ffffff !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
