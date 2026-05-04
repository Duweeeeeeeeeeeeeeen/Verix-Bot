import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import api from '../../../utils/api';
import OnboardingWizard from '../../../components/OnboardingWizard';
import { useT } from '../../../contexts/LanguageContext';
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
  TrendingUp,
  Box
} from 'lucide-react';

export default function GuildHome() {
  const { t } = useT();
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
      await api.request(`/config/${guildId}/${moduleName}`, {
        method: 'POST',
        body: JSON.stringify({ enabled: !currentStatus })
      });
      
      await fetchData();
      const statusKey = !currentStatus ? 'dashboard.module_enabled' : 'dashboard.module_disabled';
      window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: t(statusKey, { module: moduleName.toUpperCase() }), type: 'success' } 
      }));
    } catch (error) {
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
    <div className="animate">
      
      {/* Modern Header */}
      <header className="module-header-v2">
         <div className="header-info-p">
            <div className="header-icon-p" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
              <Box size={24} />
            </div>
            <div className="header-text-p">
              <h1>{t('dashboard.title')}</h1>
              <p>{t('dashboard.subtitle', { guild: config?.guildName || t('common.your_server') || 'il tuo server' })}</p>
            </div>
         </div>
         <div className="header-actions-p" style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={fetchData} className="btn-outline-p">
              <RefreshCcw size={16} className={loading ? 'spin' : ''} /> {t('dashboard.refresh')}
            </button>
         </div>
      </header>
      
      {/* Guided Setup */}
      <OnboardingWizard config={config} guildId={guildId} />

      {/* Refined Stats Grid */}
      <div className="stats-grid-p">
         <div className="stat-card-v2">
            <div className="stat-icon-v2 indigo">
              <Ticket size={20} />
            </div>
            <div className="stat-data-v2">
              <span className="stat-label-v2">{t('dashboard.tickets_open')}</span>
              <span className="stat-value-v2">{stats?.openTickets || 0}</span>
            </div>
            <TrendingUp size={16} className="stat-trend-v2" />
         </div>

         <div className="stat-card-v2">
            <div className="stat-icon-v2 amber">
              <Shield size={20} />
            </div>
            <div className="stat-data-v2">
              <span className="stat-label-v2">{t('dashboard.whitelist_pending')}</span>
              <span className="stat-value-v2">{stats?.pendingWhitelist || 0}</span>
            </div>
         </div>

      </div>

      {/* Dashboard Content Layout */}
      <div className="dashboard-grid-p">
          {/* Left: Module Management */}
          <section className="modules-management-p">
              <div className="section-title-p">
                  <Activity size={20} />
                  <h2>{t('dashboard.module_status')}</h2>
              </div>
              
              <div className="modules-list-p">
                  {[
                      { id: 'whitelist', label: t('dashboard.module_whitelist'), desc: t('dashboard.module_whitelist_desc'), icon: ShieldCheck, color: 'var(--primary)', config: config.whitelist },
                      { id: 'tickets', label: t('dashboard.module_tickets'), desc: t('dashboard.module_tickets_desc'), icon: Ticket, color: 'var(--info)', config: config.tickets },
                      { id: 'verify', label: t('dashboard.module_verify'), desc: t('dashboard.module_verify_desc'), icon: Shield, color: 'var(--primary)', config: config.verify },

                      { id: 'photocontest', label: t('dashboard.module_photocontest'), desc: t('dashboard.module_photocontest_desc'), icon: Camera, color: 'var(--warning)', config: config.photocontest },
                      { id: 'support', label: t('dashboard.module_support'), desc: t('dashboard.module_support_desc'), icon: Mic2, color: 'var(--warning)', config: config.support },
                      { id: 'fivem', label: t('dashboard.module_fivem'), desc: t('dashboard.module_fivem_desc'), icon: Globe, color: 'var(--info)', config: config.fivem },
                      { id: 'welcome', label: t('dashboard.module_welcome'), desc: t('dashboard.module_welcome_desc'), icon: UserPlus, color: 'var(--primary)', config: config.welcome }
                  ].map(module => (
                      <div key={module.id} className="module-toggle-card">
                          <div className="m-card-info">
                              <div className="m-card-icon" style={{ backgroundColor: 'var(--primary-glow)', color: module.color }}>
                                  <module.icon size={24} />
                              </div>
                              <div className="m-card-text">
                                  <h3>{module.label}</h3>
                                  <p>{module.desc}</p>
                              </div>
                          </div>
                          <div className="m-card-action">
                              {updating === module.id && <div className="spinner-s"></div>}
                              <label className="toggle">
                                  <input 
                                      type="checkbox" 
                                      checked={module.config?.enabled} 
                                      onChange={() => toggleModule(module.id, module.config?.enabled)}
                                      disabled={updating === module.id}
                                  />
                                  <span className="slider"></span>
                              </label>
                          </div>
                      </div>
                  ))}
              </div>
          </section>

          {/* Right: Navigation & Global Actions */}
          <aside className="dashboard-side-p">
              <div className="section-title-p">
                  <Zap size={20} />
                  <h2>{t('dashboard.navigation')}</h2>
              </div>
              <div className="nav-stack-p">
                  {[
                      { label: t('sidebar.whitelist'), path: 'whitelist', emoji: '🛡️' },
                      { label: t('sidebar.verify'), path: 'verify', emoji: '✅' },
                      { label: t('sidebar.tickets'), path: 'tickets', emoji: '🎫' },
                      { label: t('sidebar.support'), path: 'support', emoji: '🎙️' },
                      { label: t('sidebar.photocontest'), path: 'photocontest', emoji: '📸' },
                      { label: t('sidebar.fivem'), path: 'fivem', emoji: '🎮' },
                      { label: t('sidebar.embeds'), path: 'embeds', emoji: '📝' },
                      { label: t('sidebar.welcome'), path: 'welcome', emoji: '👋' },
                      { label: t('sidebar.management'), path: 'global', emoji: '⚙️' }
                  ].map(nav => (
                      <button key={nav.path} onClick={() => router.push(`/config/${guildId}/${nav.path}`)} className="nav-item-v2">
                          <span className="nav-label-v2">{nav.emoji} &nbsp; {nav.label}</span>
                          <ChevronRight size={14} className="nav-arrow-v2" />
                      </button>
                  ))}
                  
                  <div className="side-separator-p"></div>
                  
                  <button 
                      onClick={() => { if(confirm(t('dashboard.reset_confirm'))) alert('Inviato!'); }}
                      className="btn-danger-v2"
                  >
                      <RefreshCcw size={16} /> {t('dashboard.reset_total')}
                  </button>
              </div>
          </aside>
      </div>

      <style jsx>{`
          .module-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; padding: 0 4px; }
          .header-info-p { display: flex; align-items: center; gap: 16px; }
          .header-icon-p { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
          .header-text-p h1 { font-size: 1.5rem; margin-bottom: 2px; color: var(--text-main); }
          .header-text-p p { font-size: 0.85rem; color: var(--text-muted); }
          .btn-outline-p { background: var(--bg-badge); border: 1px solid var(--border); color: var(--text-main); padding: 8px 16px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 700; transition: 0.2s; }
          .btn-outline-p:hover { background: var(--bg-badge); }

          .stats-grid-p { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
          .stat-card-v2 { background: var(--bg-card); border: 1px solid var(--border); padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 16px; position: relative; transition: 0.2s; }
          .stat-card-v2:hover { border-color: var(--primary); transform: translateY(-2px); }
          .stat-icon-v2 { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
          .stat-icon-v2.indigo { background: var(--primary-glow); color: var(--primary); }
          .stat-icon-v2.amber { background: var(--primary-glow); color: var(--warning); }
          .stat-icon-v2.rose { background: var(--primary-glow); color: var(--error); }
          .stat-data-v2 { display: flex; flex-direction: column; }
          .stat-label-v2 { font-size: 0.75rem; color: var(--text-muted); font-weight: 700; }
          .stat-value-v2 { font-size: 1.4rem; font-weight: 800; color: var(--text-main); }
          .stat-trend-v2 { position: absolute; top: 16px; right: 16px; color: var(--success); opacity: 0.5; }

          .dashboard-grid-p { display: grid; grid-template-columns: 1fr 300px; gap: 32px; }
          .section-title-p { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; color: var(--text-muted); }
          .section-title-p h2 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 900; color: var(--text-dim); }

          .modules-list-p { display: flex; flex-direction: column; gap: 12px; }
          .module-toggle-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; transition: 0.2s; }
          .module-toggle-card:hover { border-color: var(--primary); background: var(--bg-elevated); }
          .m-card-info { display: flex; align-items: center; gap: 16px; }
          .m-card-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
          .m-card-text h3 { font-size: 0.95rem; margin-bottom: 2px; color: var(--text-main); }
          .m-card-text p { font-size: 0.75rem; color: var(--text-muted); }
          .m-card-action { display: flex; align-items: center; gap: 12px; }
          .spinner-s { width: 14px; height: 14px; border: 2px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }

          .nav-stack-p { display: flex; flex-direction: column; gap: 8px; }
          .nav-item-v2 { display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted); padding: 12px 16px; border-radius: 12px; cursor: pointer; font-size: 0.85rem; font-weight: 700; transition: 0.2s; }
          .nav-item-v2:hover { background: var(--bg-elevated); color: var(--text-main); border-color: var(--primary); transform: translateX(4px); }
          .nav-arrow-v2 { opacity: 0.3; transition: 0.2s; }
          .nav-item-v2:hover .nav-arrow-v2 { color: var(--primary); opacity: 1; transform: translateX(2px); }

          .side-separator-p { height: 1px; background: var(--border); margin: 12px 0; }
          .btn-danger-v2 { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; background: var(--bg-badge); color: var(--error); border: 1px solid var(--border); border-radius: 12px; cursor: pointer; font-size: 0.85rem; font-weight: 900; transition: 0.2s; }
          .btn-danger-v2:hover { background: var(--error); color: var(--text-on-primary); }

          .error-container-p { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; gap: 20px; text-align: center; }

          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @media (max-width: 1000px) { .dashboard-grid-p { grid-template-columns: 1fr; } .stats-grid-p { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
