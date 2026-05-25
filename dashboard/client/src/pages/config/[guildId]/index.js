import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  Shield, Ticket, Mic2, RefreshCcw, Activity, ShieldCheck,
  Camera, Globe, UserPlus,
  ChevronRight, Box, Settings2, TrendingUp, MousePointer2, ListChecks, Crown, Star, Award,
  History, LayoutTemplate, AlertTriangle, Sparkles,
  Cpu, Rocket, Command
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
      const [configData, statsData] = await Promise.all([
        api.request(`/config/${guildId}`),
        api.request(`/config/${guildId}/stats`).catch(err => {
          console.warn('Stats fetch failed:', err);
          return { openTickets: 0, pendingWhitelist: 0, activeVoiceSessions: 0 };
        })
      ]);
      
      setConfig(configData);
      setStats(statsData?.data || statsData);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || t('admin.connection_error'));
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
      window.dispatchEvent(new CustomEvent('refresh-module-status', { detail: { guildId } }));
      window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: t(!currentStatus ? 'hub.module_activated' : 'hub.module_disabled', { name: moduleName.toUpperCase() }), type: 'success' } 
      }));
    } catch (error) {
        console.error('Toggle error:', error);
    } finally {
      setUpdating(null);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleFactoryReset = async () => {
    if (!window.confirm(t('hub.factory_reset_confirm'))) return;
    
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/factory-reset`, {
        method: 'POST'
      });
      await fetchData();
      window.dispatchEvent(new CustomEvent('refresh-module-status', { detail: { guildId } }));
      
      window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: t('hub.factory_reset_success'), type: 'success' } 
      }));
      
      router.replace(`/config/${guildId}`);
    } catch (error) {
      console.error('Factory Reset error:', error);
      window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: t('hub.reset_error'), type: 'error' } 
      }));
      setLoading(false);
    } finally {
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

   if (!mounted || loading) return <Skeleton height="600px" />;

  if (error) return (
    <div className="pc-error-view-v2 animate fade-in" style={{ padding: '80px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '32px', boxShadow: 'var(--shadow-premium)', border: '1px solid var(--border)', maxWidth: '600px', margin: '40px auto' }}>
      <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '24px' }} />
      <h2 style={{ fontWeight: 700, marginBottom: '12px', color: 'var(--text-heading)' }}>{t('dashboard.connection_failed')}</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>{error}</p>
      <button onClick={fetchData} className="pc-btn-primary" style={{ margin: '0 auto' }}>{t('dashboard.retry')}</button>
    </div>
  );

  const activeModulesCount = [
    'whitelist', 'tickets', 'verify', 'photocontest', 'support', 'fivem', 'welcome', 'reactionRoles', 'polls'
  ].filter(id => config?.[id]?.enabled).length;

  const hasPremium = config?.isPremium || ['lite', 'premium', 'platinum'].includes(config?.premiumTier);
  const premiumTier = config?.premiumTier || (config?.isPremium ? 'premium' : 'none');

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('hub.title')} | {config?.guildName || 'Verix'}</title>
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
                    {hasPremium && (
                        <div className={`premium-crown-v2 ${premiumTier}`}>
                            {premiumTier === 'platinum' ? <Award size={14} fill="currentColor" /> : premiumTier === 'premium' ? <Crown size={14} fill="currentColor" /> : <Star size={14} fill="currentColor" />}
                        </div>
                    )}
                </div>
                <div className="hero-text-v2">
                    <div className="status-row-v2">
                        <span className="live-tag-v2"><div className="pulse-dot"></div> {t('hub.engine_online')}</span>
                        <div className={`tier-badge-v2 ${premiumTier}`}>
                            {premiumTier === 'platinum' ? 'VERIX PLATINUM' : premiumTier === 'premium' ? 'VERIX PREMIUM' : premiumTier === 'lite' ? 'VERIX LITE' : 'VERIX STANDARD'}
                        </div>
                    </div>
                    <h1>{t('hub.welcome')} <span className="user-name-v2">{user?.username}</span></h1>
                    <p>{t('hub.operational_desc_prefix')} <strong>{config?.guildName}</strong> • <strong>{activeModulesCount}</strong> {t('hub.active_modules')}</p>
                </div>
            </div>
            
            <div className="hero-controls-v2">
                {config?.mainBotMissing && (
                    <button className="pc-btn-invite-v2" onClick={() => window.open(config.mainBotInviteUrl, '_blank')}>
                        <Rocket size={20} />
                        <span>{t('hub.invite_bot')}</span>
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
                { label: t('hub.open_tickets'), value: stats?.openTickets || 0, icon: Ticket, color: '#6366f1', trend: t('hub.live_status') },
                { label: t('hub.whitelist_req'), value: stats?.pendingWhitelist || 0, icon: ShieldCheck, color: '#f59e0b', trend: t('hub.pending_review') },
                { label: t('hub.sos_sessions'), value: stats?.activeVoiceSessions || 0, icon: Activity, color: '#10b981', trend: t('hub.sos_active') }
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
                        <h3>{t('hub.operational_modules')}</h3>
                    </div>
                    <div className="deck-stats-v2">
                        <span>{activeModulesCount} {t('hub.active_caps')}</span>
                        <div className="progress-bar-v2"><div className="fill" style={{ width: `${(activeModulesCount / 9) * 100}%` }}></div></div>
                    </div>
                </div>

                <div className="pc-module-grid-v2">
                    {[
                        { id: 'whitelist', label: t('sidebar.whitelist'), icon: ShieldCheck, color: '#6366f1', path: 'whitelist', desc: t('dashboard.module_whitelist_desc_v2') },
                        { id: 'tickets', label: t('sidebar.tickets'), icon: Ticket, color: '#8b5cf6', path: 'tickets', desc: t('dashboard.module_tickets_desc_v2') },
                        { id: 'reactionRoles', label: t('sidebar.reactionroles'), icon: MousePointer2, color: '#10b981', path: 'reaction-roles', desc: t('dashboard.module_reactionroles_desc_v2') },
                        { id: 'polls', label: t('sidebar.polls'), icon: ListChecks, color: '#f59e0b', path: 'polls', desc: t('dashboard.module_polls_desc_v2') },
                        { id: 'verify', label: t('sidebar.verify'), icon: Shield, color: '#06b6d4', path: 'verify', desc: t('dashboard.module_verify_desc_v2') },
                        { id: 'photocontest', label: t('sidebar.photocontest'), icon: Camera, color: '#ec4899', path: 'photocontest', desc: t('dashboard.module_photocontest_desc_v2') },
                        { id: 'support', label: t('sidebar.support'), icon: Mic2, color: '#f43f5e', path: 'support', desc: t('dashboard.module_support_desc_v2') },
                        { id: 'fivem', label: t('sidebar.fivem'), icon: Globe, color: '#14b8a6', path: 'fivem', desc: t('dashboard.module_fivem_desc_v2') },
                        { id: 'welcome', label: t('sidebar.welcome'), icon: UserPlus, color: '#6366f1', path: 'welcome', desc: t('dashboard.module_welcome_desc_v2') }
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
                                        <div className="status-pill-v2">{isEnabled ? t('hub.module_status_on') : t('hub.module_status_off')}</div>
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
                        <Command size={18} color="var(--primary)" />
                        <h4>{t('hub.command_center')}</h4>
                    </div>
                    <div className="panel-nav-v2">
                        {[
                            { label: t('hub.nav_embed_designer'), path: 'embeds', icon: LayoutTemplate, color: '#10b981', sub: t('hub.nav_embeds') },
                            { label: t('hub.nav_automations_title'), path: 'automations', icon: Cpu, color: '#f59e0b', sub: t('hub.nav_automations') },
                            { label: t('automations.utility.title') || 'Utility Config', path: 'utility', icon: Command, color: '#06b6d4', sub: t('automations.utility.quick_purge') || 'Purificazione Rapida' },
                            { label: t('hub.nav_whitelabel_title'), path: 'white-label', icon: Sparkles, color: '#6366f1', sub: t('hub.nav_whitelabel') },
                            { label: t('hub.nav_audit_title'), path: 'audit', icon: History, color: 'var(--text-muted)', sub: t('hub.nav_audit') },
                            { label: t('hub.nav_global_title'), path: 'global', icon: Settings2, color: 'var(--text-heading)', sub: t('hub.nav_global') }
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
                    
                    <button className="pc-btn-danger-v2" onClick={handleFactoryReset} disabled={loading}>
                        <RefreshCcw size={16} className={loading ? 'spin' : ''} />
                        <span>{t('hub.factory_reset')}</span>
                    </button>
                </section>

            </aside>
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 24px; max-width: 1650px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Hero Studio V2 */
            .pc-hero-studio-v2 { 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                background: var(--bg-card); 
                padding: 24px 28px;
                border-radius: 18px;
                border: 1px solid var(--border); 
                margin-bottom: 24px;
                position: relative;
                overflow: hidden;
            }
            .hero-visuals-v2 { display: flex; align-items: center; gap: 24px; position: relative; z-index: 1; }
            .server-avatar-container-v2 { position: relative; width: 60px; height: 60px; }
            .server-icon-v2 { width: 100%; height: 100%; border-radius: 16px; object-fit: cover; border: 2px solid var(--bg-card); }
            .avatar-placeholder-v2 { width: 100%; height: 100%; border-radius: 16px; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; }
            .premium-crown-v2 { position: absolute; bottom: -4px; right: -4px; width: 28px; height: 28px; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid var(--bg-card); }
            .premium-crown-v2.none { display: none; }
            .premium-crown-v2.platinum { background: linear-gradient(135deg, #7c3aed, #c084fc); box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4); }
            .premium-crown-v2.premium { background: linear-gradient(135deg, #f59e0b, #fbbf24); box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3); }
            .premium-crown-v2.lite { background: linear-gradient(135deg, #3b82f6, #60a5fa); box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3); }
            
            .hero-text-v2 h1 { font-size: 1.7rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }
            .user-name-v2 { font-weight: 800; background: linear-gradient(135deg, var(--primary) 0%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .hero-text-v2 p { margin: 4px 0 0 0; color: var(--text-dim); font-size: 1rem; font-weight: 600; }
            .status-row-v2 { display: flex; gap: 8px; margin-bottom: 8px; }
            .live-tag-v2 { font-size: 0.65rem; font-weight: 700; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 4px 12px; border-radius: 100px; display: flex; align-items: center; gap: 6px; letter-spacing: 0.5px; }
            .pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; animation: pulse 2s infinite; }
            @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
            .tier-badge-v2 { font-size: 0.65rem; font-weight: 700; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px; }
            .tier-badge-v2.platinum { background: rgba(124, 58, 237, 0.1); color: #c084fc; border: 1px solid rgba(124, 58, 237, 0.2); }
            .tier-badge-v2.premium { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
            .tier-badge-v2.lite { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }
            .tier-badge-v2.standard { background: var(--bg-badge); color: var(--text-muted); border: 1px solid var(--border); }

            .hero-controls-v2 { display: flex; gap: 16px; position: relative; z-index: 1; }
            .pc-btn-invite-v2 { background: var(--primary); color: #fff; border: none; padding: 13px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
            .pc-btn-refresh-v2 { width: 46px; height: 46px; border-radius: 12px; border: 1.5px solid var(--border); background: var(--bg-card); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
            .pc-btn-refresh-v2:hover { color: var(--primary); border-color: var(--primary); }

            /* Metrics V2 */
            .pc-metric-grid-v2 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
            .pc-metric-card-v2 { background: var(--bg-card); border-radius: 16px; padding: 18px; border: 1px solid var(--border); position: relative; overflow: hidden; transition: 0.2s; }
            .pc-metric-card-v2:hover { transform: translateY(-2px); }
            .metric-header-v2 { display: flex; gap: 14px; align-items: center; margin-bottom: 14px; }
            .metric-icon-v2 { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: var(--bg-badge); }
            .metric-value-v2 { display: flex; flex-direction: column; }
            .count-v2 { font-size: 1.8rem; font-weight: 700; color: var(--text-heading); line-height: 1; letter-spacing: normal; }
            .label-v2 { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-top: 4px; letter-spacing: 0.5px; }
            .metric-footer-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; font-weight: 750; color: var(--text-muted); border-top: 1.5px solid var(--border); padding-top: 16px; }
            .metric-glow-v2 { position: absolute; bottom: 0; left: 0; width: 100%; height: 4px; opacity: 0.2; }

            /* Workspace V2 */
            .pc-workspace-v2 { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
            .deck-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .title-group-v2 { display: flex; align-items: center; gap: 14px; }
            .title-group-v2 h3 { margin: 0; font-size: 1.6rem; font-weight: 700; color: var(--text-heading); letter-spacing: normal; }
            .deck-stats-v2 { display: flex; align-items: center; gap: 24px; }
            .deck-stats-v2 span { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); letter-spacing: 1.5px; }
            .progress-bar-v2 { width: 140px; height: 10px; background: var(--bg-badge); border-radius: 100px; overflow: hidden; }
            .progress-bar-v2 .fill { height: 100%; background: linear-gradient(to right, var(--primary), #a78bfa); border-radius: 100px; transition: 1s; }

            /* Module Studio Cards V2 */
            .pc-module-grid-v2 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
            .pc-module-studio-card-v2 { background: var(--bg-card); border-radius: 16px; padding: 18px; border: 1px solid var(--border); transition: 0.2s; position: relative; overflow: hidden; }
            .pc-module-studio-card-v2:hover { transform: translateY(-2px); border-color: var(--primary-muted); }
            .pc-module-studio-card-v2.on { border-color: var(--primary-muted); }
            
            .card-top-v2 { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
            .module-icon-v2 { width: 44px; height: 44px; border-radius: 14px; background: var(--bg-badge); display: flex; align-items: center; justify-content: center; }
            
            .card-body-v2 h4 { margin: 0 0 8px 0; font-size: 1.2rem; font-weight: 700; color: var(--text-heading); letter-spacing: normal; }
            .card-body-v2 p { margin: 0; font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; font-weight: 600; }
            
            .card-footer-v2 { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 1.5px solid var(--border); }
            .status-pill-v2 { font-size: 0.7rem; font-weight: 700; padding: 6px 16px; border-radius: 100px; background: var(--bg-badge); color: var(--text-muted); border: 1px solid var(--border); }
            .on .status-pill-v2 { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: rgba(16, 185, 129, 0.2); }
            
            .pc-btn-enter-v2 { width: 38px; height: 38px; border-radius: 12px; background: var(--bg-badge); color: var(--text-muted); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
            .pc-btn-enter-v2:hover { background: var(--primary); color: #fff; }

            /* Side Panel V2 */
            .side-panel-v2 { padding: 20px; border-radius: 16px; background: var(--bg-card) !important; border: 1px solid var(--border); }
            .panel-header-v2 { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
            .panel-header-v2 h4 { margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--text-heading); letter-spacing: normal; }
            
            .panel-nav-v2 { display: flex; flex-direction: column; gap: 12px; }
            .nav-btn-v2 { display: flex; align-items: center; gap: 12px; padding: 11px; background: var(--bg-badge); border: 1px solid var(--border); border-radius: 12px; cursor: pointer; transition: 0.2s; text-align: left; }
            .nav-btn-v2:hover { border-color: var(--primary); background: var(--bg-card); }
            .nav-icon-v2 { width: 38px; height: 38px; border-radius: 10px; background: var(--bg-card); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .nav-text-v2 { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
            .main-v2 { font-weight: 700; font-size: 0.9rem; color: var(--text-heading); }
            .sub-v2 { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); }
            .arrow-v2 { margin-left: auto; color: var(--text-muted); }

            .panel-divider-v2 { height: 1.5px; background: var(--border); margin: 16px 0; }
            .pc-btn-danger-v2 { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.2s; }
            .pc-btn-danger-v2:hover { background: #ef4444; color: #fff; }

            /* Common V2 Toggles */
            .pc-toggle-v2 { position: relative; width: 52px; height: 26px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: var(--bg-badge); transition: .4s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background: #fff; transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: var(--primary); }
            input:checked + .pc-slider-v2:before { transform: translateX(26px); }

            .animate { animation: slide-up 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
            @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
