import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import api from '../../../utils/api';
import OnboardingWizard from '../../../components/OnboardingWizard';
import { useT } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  Shield, 
  Ticket, 
  Users, 
  Mic2, 
  ArrowRight, 
  RefreshCcw, 
  Zap, 
  Activity, 
  ShieldCheck,
  ExternalLink,
  Info,
  Camera,
  Globe,
  ShieldAlert,
  Power,
  UserPlus,
  Layout as LayoutIcon,
  ChevronRight,
  Box,
  Settings2,
  TrendingUp,
  Plus,
  MousePointer2,
  ListChecks
} from 'lucide-react';

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
    try {
      const responses = await Promise.all([
        api.request(`/config/${guildId}`),
        api.request(`/config/${guildId}/stats`)
      ]);

      const [configData, statsData] = responses;
      
      setConfig(configData);
      setStats(statsData?.data || statsData);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || t('common.error'));
      setLoading(false);
    }
  };

  const toggleModule = async (moduleName, currentStatus) => {
    setUpdating(moduleName);
    try {
      // Handle special route cases for toggling
      let endpoint = `/config/${guildId}/${moduleName}`;
      if (moduleName === 'polls') endpoint = `/config/${guildId}/polls/config`;
      if (moduleName === 'reactionRoles') endpoint = `/config/${guildId}/reaction-roles`;

      await api.request(endpoint, {
        method: 'POST',
        body: JSON.stringify({ enabled: !currentStatus })
      });
      
      await fetchData();
      const statusKey = !currentStatus ? 'dashboard.module_enabled' : 'dashboard.module_disabled';
      window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: t(statusKey, { module: moduleName.toUpperCase() }), type: 'success' } 
      }));
    } catch (error) {
        console.error('Toggle error:', error);
    } finally {
      setUpdating(null);
    }
  };

   if (!mounted || (loading && !config)) return <Skeleton height="600px" />;

  if (error) return (
    <div className="error-container-p animate fade-in">
      <Zap size={48} color="var(--error)" />
      <h2>{t('dashboard.connection_failed')}</h2>
      <p>{error}</p>
      <button onClick={fetchData} className="btn-primary">{t('dashboard.retry')}</button>
    </div>
  );

  return (
    <div className="dashboard-wrapper-p animate">
      {/* Background Glow Blobs */}
      <div className="glow-blob blob-1"></div>
      <div className="glow-blob blob-2"></div>
      
      <div className="dashboard-content-main-p">
        {/* Modern Hero Header - SPLIT VERSION */}
        <div className="top-split-container animate slide-up">
          <header className="hero-banner-p hero-left">
            <div className="hero-info-p">
              <div className="server-avatar-container">
                {config?.guildIcon ? (
                  <img src={config.guildIcon} alt={config.guildName} className="server-avatar-glow" />
                ) : (
                  <img src="/logo.png" alt="Verix" className="server-avatar-glow" />
                )}
                <div className="premium-badge-mini">
                  <Zap size={10} fill="currentColor" />
                </div>
              </div>
              <div className="hero-text-p">
                <div className="badge-setup">{t('dashboard.setup_active')}</div>
                <h1 className="hero-title">{t('dashboard.welcome_back')}, <span className="text-gradient">{user?.username || 'User'}</span></h1>
                <p className="hero-subtitle">
                  {t('dashboard.hero_desc', { 
                    count: [
                      'whitelist', 'tickets', 'verify', 'photocontest', 'support', 'fivem', 'welcome', 'reactionRoles', 'polls'
                    ].filter(id => config?.[id]?.enabled).length 
                  })} — <span className="server-label">{config?.guildName}</span>
                </p>
              </div>
            </div>
          </header>

          <div className="hero-banner-p hero-right">
            <div className="hero-actions-p">
              {config?.mainBotMissing && (
                <button 
                  onClick={() => window.open(config.mainBotInviteUrl, '_blank')} 
                  className="btn-glass-p pulse-primary"
                  style={{ background: 'rgba(99, 102, 241, 0.2)', borderColor: 'var(--primary)' }}
                >
                  <Plus size={18} />
                  <span>Invita Verix Bot</span>
                </button>
              )}
              <button onClick={fetchData} className="btn-glass-p">
                <RefreshCcw size={18} className={loading ? 'spin' : ''} />
                <span>{t('dashboard.refresh_data')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid - Glass Edition */}
        <div className="stats-glass-grid">
          <div className="stat-glass-card indigo">
            <div className="stat-glass-icon">
              <Ticket size={24} />
            </div>
            <div className="stat-glass-info">
              <h3>{stats?.openTickets || 0}</h3>
              <p>{t('dashboard.active_tickets')}</p>
            </div>
            <div className="stat-sparkline indigo"></div>
          </div>

          <div className="stat-glass-card amber">
            <div className="stat-glass-icon">
              <ShieldCheck size={24} />
            </div>
            <div className="stat-glass-info">
              <h3>{stats?.pendingWhitelist || 0}</h3>
              <p>{t('dashboard.whitelist_req')}</p>
            </div>
            <div className="stat-sparkline amber"></div>
          </div>

          <div className="stat-glass-card success">
            <div className="stat-glass-icon">
              <Activity size={24} />
            </div>
            <div className="stat-glass-info">
              <h3>{stats?.activeVoiceSessions || 0}</h3>
              <p>{t('dashboard.voice_active')}</p>
            </div>
            <div className="stat-sparkline success"></div>
          </div>
        </div>

        {/* Main Dashboard Layout */}
        <div className="main-grid-p">
          
          {/* Module Grid - The Core Experience */}
          <section className="modules-grid-section">
            <div className="grid-header-p">
              <div className="grid-title-p">
                <LayoutIcon size={20} className="text-primary" />
                <h2>{t('dashboard.modules_center')}</h2>
              </div>
              <span className="grid-count-p">
                {[
                  'whitelist', 'tickets', 'verify', 'photocontest', 'support', 'fivem', 'welcome', 'reactionRoles', 'polls'
                ].filter(id => config?.[id]?.enabled).length} {t('dashboard.active_modules')}
              </span>
            </div>

            <div className="features-grid-p">
              {[
                { id: 'whitelist', label: t('dashboard.module_whitelist'), desc: t('dashboard.module_whitelist_desc'), icon: ShieldCheck, color: '#6366f1', path: 'whitelist' },
                { id: 'tickets', label: t('dashboard.module_tickets'), desc: t('dashboard.module_tickets_desc'), icon: Ticket, color: '#8b5cf6', path: 'tickets' },
                { id: 'reactionRoles', label: t('dashboard.module_reactionroles') || 'Reaction Roles', desc: t('dashboard.module_reactionroles_desc') || 'Assign roles via buttons or emojis.', icon: MousePointer2, color: '#10b981', path: 'reaction-roles' },
                { id: 'polls', label: t('dashboard.module_polls') || 'Polls', desc: t('dashboard.module_polls_desc') || 'Create interactive surveys with duration.', icon: ListChecks, color: '#f59e0b', path: 'polls' },
                { id: 'verify', label: t('dashboard.module_verify'), desc: t('dashboard.module_verify_desc'), icon: Shield, color: '#06b6d4', path: 'verify' },
                { id: 'photocontest', label: t('dashboard.module_photocontest'), desc: t('dashboard.module_photocontest_desc'), icon: Camera, color: '#f59e0b', path: 'photocontest' },
                { id: 'support', label: t('dashboard.module_support'), desc: t('dashboard.module_support_desc'), icon: Mic2, color: '#ec4899', path: 'support' },
                { id: 'fivem', label: t('dashboard.module_fivem'), desc: t('dashboard.module_fivem_desc'), icon: Globe, color: '#10b981', path: 'fivem' },
                { id: 'welcome', label: t('dashboard.module_welcome'), desc: t('dashboard.module_welcome_desc'), icon: UserPlus, color: '#6366f1', path: 'welcome' }
              ].map(module => (
                <div key={module.id} className={`feature-glass-card ${config[module.id]?.enabled ? 'enabled' : 'disabled'}`}>
                  <div className="feature-card-inner">
                    <div className="feature-card-header">
                      <div className="feature-icon-box" style={{ '--module-color': module.color }}>
                        <module.icon size={26} />
                      </div>
                      <label className="toggle-premium">
                        <input 
                          type="checkbox" 
                          checked={config[module.id]?.enabled} 
                          onChange={() => toggleModule(module.id, config[module.id]?.enabled)}
                          disabled={updating === module.id}
                        />
                        <span className="slider-premium"></span>
                      </label>
                    </div>
                    <div className="feature-card-content" onClick={() => router.push(`/config/${guildId}/${module.path}`)}>
                      <h3>{module.label}</h3>
                      <p>{module.desc}</p>
                    </div>
                    <div className="feature-card-footer">
                      <div className={`status-pill ${config[module.id]?.enabled ? 'online' : 'offline'}`}>
                        <div className="status-pulse"></div>
                        {config[module.id]?.enabled ? t('common.active') : t('common.inactive')}
                      </div>
                      <ChevronRight size={16} className="footer-arrow" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Side Panel - Quick Navigation */}
          <aside className="side-panel-p">
            <div className="panel-card-p">
              <div className="panel-header-p">
                <Zap size={18} className="text-warning" />
                <h3>{t('dashboard.quick_access')}</h3>
              </div>
              <div className="nav-list-p">
                {[
                  { label: t('sidebar.embeds'), path: 'embeds', icon: LayoutIcon },
                  { label: t('sidebar.management'), path: 'global', icon: Settings2 },
                  { label: t('sidebar.audit'), path: 'audit', icon: Activity },
                  { label: t('sidebar.analytics'), path: 'analytics', icon: TrendingUp }
                ].map(nav => (
                  <button key={nav.path} onClick={() => router.push(`/config/${guildId}/${nav.path}`)} className="nav-btn-p">
                    <div className="nav-btn-icon">
                      <nav.icon size={18} />
                    </div>
                    <span>{nav.label}</span>
                    <ChevronRight size={14} className="nav-btn-arrow" />
                  </button>
                ))}
              </div>
              
              <div className="panel-divider-p"></div>
              
              <button className="danger-zone-btn" onClick={() => { if(confirm(t('dashboard.reset_confirm'))) alert('Inviato!'); }}>
                <RefreshCcw size={16} />
                <span>{t('dashboard.factory_reset')}</span>
              </button>
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .dashboard-wrapper-p {
          position: relative;
          min-height: 100vh;
          padding: 40px;
          color: var(--text-main);
          overflow: hidden;
        }

        /* Glow Blobs */
        .glow-blob {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
          filter: blur(80px);
          z-index: -1;
          opacity: 0.4;
          pointer-events: none;
        }
        .blob-1 { top: -200px; right: -100px; }
        .blob-2 { bottom: -200px; left: -100px; background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%); }

        .dashboard-content-main-p {
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Hero Banner */
        .top-split-container {
          display: flex;
          gap: 24px;
          margin-bottom: 48px;
        }

        .hero-banner-p {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.03);
          padding: 32px;
          border-radius: 24px;
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(10px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.1);
        }

        .hero-right {
          flex: 0 0 auto;
          min-width: 300px;
          justify-content: center;
        }

        .hero-info-p { display: flex; align-items: center; gap: 28px; }
        .hero-title { font-size: 2.5rem; font-weight: 800; margin: 0; color: var(--text-main); }
        .hero-subtitle { font-size: 1.1rem; color: var(--text-muted); margin: 0; font-weight: 500; }
        .server-label { color: var(--primary); font-weight: 700; opacity: 1; }
        
        .server-avatar-container {
          position: relative;
          width: 80px;
          height: 80px;
        }
        .server-avatar-glow {
          width: 100%;
          height: 100%;
          border-radius: 20px;
          object-fit: cover;
          box-shadow: 0 10px 30px var(--primary-glow);
          border: 2px solid var(--border-strong);
        }
        .server-avatar-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 20px;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 800;
        }
        .premium-badge-mini {
          position: absolute;
          bottom: -5px;
          right: -5px;
          width: 24px;
          height: 24px;
          background: var(--warning);
          color: black;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg-card);
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }

        .badge-setup {
          background: var(--primary-glow);
          color: var(--primary);
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          width: fit-content;
          margin-bottom: 12px;
          border: 1px solid var(--primary);
        }
        .hero-title { font-size: 2.2rem; font-weight: 900; line-height: 1.1; margin-bottom: 8px; }
        .text-gradient { background: linear-gradient(135deg, var(--primary) 0%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-subtitle { color: var(--text-dim); font-size: 1rem; }

        .btn-glass-p {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-strong);
          color: var(--text-main);
          padding: 12px 24px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.3s;
          backdrop-filter: blur(5px);
        }
        .btn-glass-p:hover { background: rgba(255, 255, 255, 0.1); border-color: var(--primary); transform: translateY(-2px); }

        /* Stats Grid */
        .stats-glass-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 48px;
        }
        .stat-glass-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          padding: 24px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
          transition: 0.3s;
        }
        .stat-glass-card:hover { transform: translateY(-5px); border-color: var(--border-strong); background: rgba(255, 255, 255, 0.05); }
        .stat-glass-icon {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-inset);
          color: var(--text-dim);
          transition: 0.3s;
        }
        .stat-glass-card.indigo .stat-glass-icon { color: var(--primary); background: var(--primary-glow); }
        .stat-glass-card.amber .stat-glass-icon { color: var(--warning); background: rgba(245, 158, 11, 0.1); }
        .stat-glass-card.success .stat-glass-icon { color: var(--success); background: rgba(16, 185, 129, 0.1); }
        
        .stat-glass-info h3 { font-size: 1.8rem; font-weight: 800; margin-bottom: 2px; }
        .stat-glass-info p { font-size: 0.8rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

        .stat-sparkline { position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; }
        .stat-sparkline.indigo { background: linear-gradient(90deg, transparent, var(--primary)); }
        .stat-sparkline.amber { background: linear-gradient(90deg, transparent, var(--warning)); }
        .stat-sparkline.success { background: linear-gradient(90deg, transparent, var(--success)); }

        /* Main Grid */
        .main-grid-p { display: grid; grid-template-columns: 1fr 340px; gap: 40px; }

        .grid-header-p { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
        .grid-title-p { display: flex; align-items: center; gap: 12px; }
        .grid-title-p h2 { font-size: 1.1rem; color: var(--text-main); }
        .grid-count-p { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }

        /* Feature Cards Grid */
        .features-grid-p {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .feature-glass-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: 22px;
          position: relative;
          transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          backdrop-filter: blur(8px);
        }
        .feature-glass-card:hover { transform: scale(1.03); border-color: var(--primary); background: rgba(255, 255, 255, 0.04); box-shadow: 0 15px 40px rgba(0,0,0,0.2); }
        .feature-glass-card.enabled { border-color: rgba(99, 102, 241, 0.3); }
        
        .feature-card-inner { padding: 24px; height: 100%; display: flex; flex-direction: column; }
        
        .feature-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .feature-icon-box {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-inset);
          color: var(--module-color);
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.2);
          position: relative;
        }
        .feature-icon-box::after {
          content: ''; position: absolute; inset: -4px; border-radius: 18px; border: 2px solid var(--module-color); opacity: 0.1;
        }
        
        .feature-card-content { flex: 1; cursor: pointer; }
        .feature-card-content h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 8px; }
        .feature-card-content p { font-size: 0.85rem; color: var(--text-dim); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        .feature-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border); }
        .status-pill { display: flex; align-items: center; gap: 8px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 10px; border-radius: 100px; }
        .status-pill.online { color: var(--success); background: rgba(16, 185, 129, 0.1); }
        .status-pill.offline { color: var(--text-muted); background: var(--bg-inset); }
        
        .status-pulse { width: 6px; height: 6px; border-radius: 50%; background: currentColor; position: relative; }
        .online .status-pulse::after { content: ''; position: absolute; inset: -2px; border-radius: 50%; background: currentColor; animation: pulse 2s infinite; }
        
        @keyframes pulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(3); opacity: 0; } }
        
        .footer-arrow { opacity: 0; transition: 0.3s; color: var(--primary); }
        .feature-glass-card:hover .footer-arrow { opacity: 1; transform: translateX(5px); }

        /* Toggles */
        .toggle-premium { position: relative; width: 44px; height: 22px; }
        .toggle-premium input { opacity: 0; width: 0; height: 0; }
        .slider-premium { position: absolute; cursor: pointer; inset: 0; background: var(--bg-inset); border: 1px solid var(--border); transition: 0.3s; border-radius: 34px; }
        .slider-premium:before { position: absolute; content: ""; height: 14px; width: 14px; left: 4px; bottom: 3px; background: var(--text-muted); transition: 0.3s; border-radius: 50%; }
        input:checked + .slider-premium { background: var(--primary); border-color: var(--primary); }
        input:checked + .slider-premium:before { transform: translateX(22px); background: white; }

        /* Side Panel */
        .panel-card-p { background: rgba(255, 255, 255, 0.03); border: 1px solid var(--glass-border); border-radius: 24px; padding: 28px; backdrop-filter: blur(10px); position: sticky; top: 40px; }
        .panel-header-p { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .panel-header-p h3 { font-size: 1rem; color: var(--text-main); }
        
        .nav-list-p { display: flex; flex-direction: column; gap: 10px; }
        .nav-btn-p { 
          display: flex; align-items: center; gap: 14px; padding: 14px; background: var(--bg-inset); border: 1px solid transparent; border-radius: 16px; color: var(--text-dim); font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.3s; text-align: left;
        }
        .nav-btn-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.03); }
        .nav-btn-p:hover { background: rgba(255,255,255,0.06); color: var(--text-main); border-color: var(--border-strong); transform: translateX(8px); }
        .nav-btn-p:hover .nav-btn-icon { background: var(--primary-glow); color: var(--primary); }
        .nav-btn-arrow { margin-left: auto; opacity: 0; transition: 0.3s; }
        .nav-btn-p:hover .nav-btn-arrow { opacity: 1; transform: translateX(4px); }

        .panel-divider-p { height: 1px; background: var(--border); margin: 24px 0; }
        
        .danger-zone-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 16px; background: rgba(239, 68, 68, 0.05); color: var(--error); border: 1px solid rgba(239, 68, 68, 0.1); border-radius: 16px; font-weight: 800; font-size: 0.85rem; cursor: pointer; transition: 0.3s;
        }
        .danger-zone-btn:hover { background: var(--error); color: white; box-shadow: 0 10px 20px rgba(239, 68, 68, 0.2); }

        .pulse-primary { animation: pulse-shadow 2s infinite; }
        @keyframes pulse-shadow {
          0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); }
          100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 1100px) {
          .main-grid-p { grid-template-columns: 1fr; }
          .side-panel-p { position: static; width: 100%; }
          .stats-glass-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 768px) {
          .dashboard-wrapper-p { padding: 20px; }
          .hero-banner-p { flex-direction: column; text-align: center; gap: 24px; }
          .hero-info-p { flex-direction: column; }
          .stats-glass-grid { grid-template-columns: 1fr; }
          .hero-title { font-size: 1.8rem; }
        }
      `}</style>
    </div>
  );
}
