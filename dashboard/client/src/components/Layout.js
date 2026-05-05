import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useT } from '../contexts/LanguageContext';
import { 
  ShieldCheck, 
  Mic2, 
  Ticket, 
  Bot,
  Gift,
  Layout as LayoutIcon, 
  LogOut, 
  Settings, 
  Settings2,
  ChevronLeft,
  Home,
  CheckCircle,
  AlertCircle,
  Bell,
  Cpu,
  Globe,
  Camera,
  MoreVertical,
  History,
  BookOpen,
  Info,
  AlertTriangle,
  User,
  UserPlus,
  Server,
  BellOff,
  ExternalLink,
  ChevronRight,
  Tv,
  RefreshCcw,
  Gavel,
  HelpCircle,
  Coins,
  Shield,
  Sun,
  Moon,
  Terminal,
  Crown,
  BarChart3,
  Sparkles
} from 'lucide-react';
import GuideSidebar from './GuideSidebar';
import { useTheme } from '../contexts/ThemeContext';

export default function Layout({ children, guildId: propGuildId, hideGuide = false }) {
  const { user, logout, currentGuildId, updateGuildId } = useAuth();
  const { t, language, setLanguage } = useT();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Use prop if available, otherwise fallback to context
  const guildId = propGuildId || currentGuildId || router.query.guildId;

  useEffect(() => {
    if (propGuildId) {
      updateGuildId(propGuildId);
    } else if (router.query.guildId) {
      updateGuildId(router.query.guildId);
    }
  }, [propGuildId, router.query.guildId]);
  
  const [toast, setToast] = useState(null);
  const [serverInfo, setServerInfo] = useState({ name: 'Loading...', icon: null });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideContext, setGuideContext] = useState({});
  const [isActivity, setIsActivity] = useState(false);

  // Persistence for Guide Sidebar
  useEffect(() => {
    const saved = localStorage.getItem('verix-guide-open');
    if (saved !== null) {
      setIsGuideOpen(saved === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('verix-guide-open', isGuideOpen);
  }, [isGuideOpen]);

  useEffect(() => {
    if (guildId && user?.guilds) {
      const g = user.guilds.find(g => g.id === guildId);
      if (g) {
        setServerInfo(g);
        if (g.premiumTier) setPremiumTier(g.premiumTier);
      }
    } else if (!guildId) {
      setServerInfo({ name: 'Verix System', icon: null });
    }
  }, [guildId, user]);

  useEffect(() => {
    const handleToast = (e) => {
      setToast(e.detail);
      setTimeout(() => setToast(null), 4000);
    };
    const handleGuideUpdate = (e) => {
      setGuideContext(e.detail || {});
    };

    const handleActivity = (e) => {
      setIsActivity(!!e.detail);
    };

    window.addEventListener('show-toast', handleToast);
    window.addEventListener('update-guide-context', handleGuideUpdate);
    window.addEventListener('set-activity', handleActivity);
    
    return () => {
      window.removeEventListener('show-toast', handleToast);
      window.removeEventListener('update-guide-context', handleGuideUpdate);
      window.removeEventListener('set-activity', handleActivity);
    };
  }, []);

  const getGuideType = (pathname) => {
    if (pathname.includes('/whitelist')) return 'whitelist';
    if (pathname.includes('/verify')) return 'verify';
    if (pathname.includes('/tickets')) return 'tickets';
    if (pathname.includes('/welcome')) return 'welcome';
    if (pathname.includes('/fivem')) return 'fivem';
    if (pathname.includes('/photocontest')) return 'photocontest';
    if (pathname.includes('/moderation')) return 'moderation_hub';
    if (pathname.includes('/socials')) return 'socials';
    if (pathname.includes('/giveaway')) return 'giveaway';
    if (pathname.includes('/tempvoice')) return 'tempvoice';
    if (pathname.includes('/voice')) return 'voice';
    if (pathname.includes('/support')) return 'support';
    if (pathname.includes('/management')) return 'management';
    if (pathname.includes('/embeds')) return 'embed_studio';
    if (pathname.includes('/automations')) return 'automations';
    if (pathname.includes('/system')) return 'system';
    if (pathname.includes('/global')) return 'global';
    return 'global';
  };

  const [premiumTier, setPremiumTier] = useState('none');

  useEffect(() => {
    if (guildId) {
      const fetchTier = async () => {
        try {
          const res = await fetch(`/api/config/${guildId}/guild`);
          const response = await res.json();
          if (response.success && response.data) {
            const guildData = response.data;
            setPremiumTier(guildData.premiumTier || (guildData.isPremium ? 'premium' : 'none'));
          }
        } catch (err) {
          console.error("Failed to fetch tier", err);
        }
      };
      fetchTier();
    }
  }, [guildId]);

  const navigationGroups = [
    {
      items: [
        { name: t('sidebar.home'), icon: Home, path: `/config/${guildId}`, id: 'home' },
        { name: t('sidebar.premium'), icon: Crown, path: `/config/${guildId}/premium`, id: 'premium' }
      ]
    },
    {
      title: 'Setup',
      items: [
        { name: t('sidebar.verify'), icon: CheckCircle, path: `/config/${guildId}/verify`, id: 'verify' },
        { name: t('sidebar.welcome'), icon: UserPlus, path: `/config/${guildId}/welcome`, id: 'welcome' }
      ]
    },
    {
      title: 'Community',
      items: [
        { name: t('sidebar.socials'), icon: Tv, path: `/config/${guildId}/socials`, id: 'socials' },
        { name: t('sidebar.giveaway'), icon: Gift, path: `/config/${guildId}/giveaway`, id: 'giveaway' },
        { name: t('sidebar.photocontest'), icon: Camera, path: `/config/${guildId}/photocontest`, id: 'photocontest' }
      ]
    },
    {
      title: 'Gestione',
      items: [
        { name: t('sidebar.tickets'), icon: Ticket, path: `/config/${guildId}/tickets`, id: 'tickets' },
        { name: t('sidebar.support'), icon: Mic2, path: `/config/${guildId}/support`, id: 'support' },
        { name: t('sidebar.tempvoice'), icon: Mic2, path: `/config/${guildId}/tempvoice`, id: 'tempvoice' }
      ]
    },
    {
      title: 'Moderazione',
      items: [
        { name: t('sidebar.moderation'), icon: Gavel, path: `/config/${guildId}/moderation`, id: 'moderation' }
      ]
    },
    {
      title: 'Tools',
      items: [
        { name: t('sidebar.automations'), icon: Cpu, path: `/config/${guildId}/automations`, id: 'automations' },
        { name: t('sidebar.embeds'), icon: LayoutIcon, path: `/config/${guildId}/embeds`, id: 'embeds' },
        { name: t('sidebar.analytics'), icon: BarChart3, path: `/config/${guildId}/analytics`, id: 'analytics' }
      ]
    },
    {
      title: 'FiveM',
      items: [
        { name: t('sidebar.fivem'), icon: Globe, path: `/config/${guildId}/fivem`, id: 'fivem' },
        { name: t('sidebar.whitelist'), icon: ShieldCheck, path: `/config/${guildId}/whitelist`, id: 'whitelist' }
      ]
    },
    {
      title: 'Log',
      items: [
        { name: t('sidebar.management'), icon: History, path: `/config/${guildId}/management`, id: 'management' },
        { name: 'Audit Log', icon: Shield, path: `/config/${guildId}/audit`, id: 'audit' }
      ]
    }
  ];

  const systemGroup = {
    title: 'Sistema',
    items: [
      { name: t('sidebar.system'), icon: Settings, path: `/config/${guildId}/system`, id: 'system' },
      
      // Show standard white-label ONLY if NOT Platinum
      ...(premiumTier !== 'platinum' ? [
        { name: t('sidebar.white_label'), icon: Sparkles, path: `/config/${guildId}/white-label`, id: 'white_label' }
      ] : []),

      // Show Private Bot ONLY if Platinum
      ...(premiumTier === 'platinum' ? [
        { name: t('sidebar.private_bot'), icon: Bot, path: `/config/${guildId}/private-bot`, id: 'private_bot' }
      ] : []),

      { name: 'System Ops', icon: Terminal, path: '/admin/system', id: 'system_ops', adminOnly: true }
    ]
  };

  const getToastIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle size={20} color="var(--success)" />;
      case 'error': return <AlertCircle size={20} color="var(--error)" />;
      case 'warning': return <AlertTriangle size={20} color="var(--warning)" />;
      default: return <Info size={20} color="var(--primary)" />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Premium Sidebar (Left) */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <img src="/logo.png" alt="Verix Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          {!isCollapsed && (
            <div className="brand-text animate fade-in">
              <h2>{t('sidebar.brand')}</h2>
              <span>{t('sidebar.dashboard')}</span>
            </div>
          )}
          <button 
            className="btn-collapse" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="nav-group">
           {navigationGroups.map((group, gIdx) => (
            <div key={gIdx} className="nav-section">
              {group.title && (
                !isCollapsed ? (
                  <div className="nav-group-title animate fade-in">{group.title}</div>
                ) : (
                  <div className="nav-divider"></div>
                )
              )}
              
              {group.items.map((item) => {
                // Admin Only Check
                if (item.adminOnly && (!user || !['361159834688552960', '314417452395626496'].includes(user.id))) {
                  return null;
                }

                const Icon = item.icon;
                const isActive = router.asPath === item.path;
                
                return (
                  <Link 
                    key={item.id} 
                    href={item.path} 
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    title={isCollapsed ? item.name : ''}
                  >
                    <div className="nav-link-icon">
                      <Icon size={18} strokeWidth={2.5} />
                    </div>
                    {!isCollapsed && <span className="nav-link-text animate fade-in">{item.name}</span>}
                    {isActive && !isCollapsed && <ChevronRight size={14} className="active-arrow" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* Fixed System Section */}
          <div className="nav-section" style={{ padding: '0 12px 4px 12px' }}>
              {!isCollapsed ? (
                <div className="nav-group-title animate fade-in" style={{ padding: '0 16px 4px 16px' }}>{systemGroup.title}</div>
              ) : (
                <div className="nav-divider" style={{ margin: '0 16px 8px 16px' }}></div>
              )}
              
              {systemGroup.items.map((item) => {
                if (item.adminOnly && (!user || !['361159834688552960', '314417452395626496'].includes(user.id))) {
                  return null;
                }

                const Icon = item.icon;
                const isActive = router.asPath === item.path;
                
                return (
                  <Link 
                    key={item.id} 
                    href={item.path} 
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    title={isCollapsed ? item.name : ''}
                  >
                    <div className="nav-link-icon">
                      <Icon size={18} strokeWidth={2.5} />
                    </div>
                    {!isCollapsed && <span className="nav-link-text animate fade-in">{item.name}</span>}
                    {isActive && !isCollapsed && <ChevronRight size={14} className="active-arrow" />}
                  </Link>
                );
              })}
          </div>

          <div className="user-mini-card">
            <img 
              src={user?.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'} 
              alt=""
            />
            {!isCollapsed && (
              <div className="user-info animate fade-in">
                <span className="name">{user?.username || 'User'}</span>
                <span className="role">{t('sidebar.administrator')}</span>
              </div>
            )}
            <button onClick={logout} className="btn-logout" title={t('sidebar.logout')}>
              <LogOut size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Layout Body */}
      <main className="main-content">
        <header className="top-header">
          <div className="header-left">
             <Link href="/selector" className="btn-back">
                <ChevronLeft size={16} strokeWidth={2.5} />
                <span>{t('sidebar.servers')}</span>
             </Link>
             <div className="header-divider"></div>
             <div className="server-crumb">
                {serverInfo.icon && (
                  <img 
                    src={`https://cdn.discordapp.com/icons/${guildId}/${serverInfo.icon}.png`} 
                    alt="" 
                  />
                )}
                <span>{serverInfo.name}</span>
             </div>
          </div>

          <div className="header-right">
              <div className="language-selector">
                  <button 
                    className={`lang-btn ${language === 'it' ? 'active' : ''}`}
                    onClick={() => setLanguage('it')}
                  >IT</button>
                  <button 
                    className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                    onClick={() => setLanguage('en')}
                  >EN</button>
              </div>
              <div className="status-badge">
                <div className="status-dot"></div>
                <span>{t('sidebar.bot_online')}</span>
              </div>
               <div className="header-actions">
                  <button className="icon-action theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? t('theme.light') : t('theme.dark')}>
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                 {!hideGuide && !isGuideOpen && (
                   <button className="icon-action help-toggle" onClick={() => setIsGuideOpen(true)} title="Show Guide">
                     <HelpCircle size={18} strokeWidth={2} className="text-amber" />
                     <span className="dot-pulse"></span>
                   </button>
                 )}
               </div>
          </div>
        </header>

        <div className="content-container">
          {children}
        </div>
      </main>

      {/* Global Right Guide Sidebar */}
      {!hideGuide && (
        <GuideSidebar 
          type={getGuideType(router.pathname)} 
          context={guideContext} 
          isOpen={isGuideOpen}
          onToggle={() => setIsGuideOpen(!isGuideOpen)}
        />
      )}

      {/* Premium Toast */}
      {toast && (
        <div className="toast-wrapper">
          <div className={`toast-premium ${toast.type}`}>
            {getToastIcon(toast.type)}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Verix Activity Indicator (Bottom Right) */}
      <div className={`verix-activity-indicator ${isActivity ? 'visible' : ''}`}>
          <div className="activity-orbit"></div>
          <div className="activity-logo">
              <img src="/logo.png" alt="" />
          </div>
          <div className="activity-glow"></div>
      </div>

      <style jsx>{`

        .main-content {
          flex: 1;
          min-width: 0;
          height: 100vh;
          overflow-y: auto;
          overflow-x: auto;
          position: relative;
          background: var(--bg-main);
        }

        .nav-section { margin-bottom: 0px; }
        .nav-group-title { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px; padding: 12px 16px 2px 16px; opacity: 0.6; }
        .nav-divider { height: 1px; background: var(--border); margin: 4px 16px; opacity: 0.3; }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 16px;
          border-radius: 12px;
          color: var(--text-muted);
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          white-space: nowrap;
        }

        .content-container {
          padding: 96px 48px 48px 48px;
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
        }

        .language-selector {
          display: flex;
          gap: 4px;
          background: var(--bg-secondary);
          padding: 4px;
          border-radius: 8px;
          margin-right: 16px;
        }

        .lang-btn {
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 700;
          border-radius: 6px;
          color: var(--text-muted);
          transition: all 0.2s;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .lang-btn:hover {
          color: var(--text-main);
          background: var(--hover-bg);
        }

        .lang-btn.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
        }

        .help-toggle {
          position: relative;
        }

        .text-amber { color: var(--warning); }

        .dot-pulse {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 6px;
          height: 6px;
          background: var(--warning);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--warning);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }

        .toast-wrapper {
          position: fixed;
          top: 32px;
          right: 32px;
          z-index: 9999;
          animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .verix-activity-indicator {
          position: fixed;
          bottom: 32px;
          right: 32px;
          width: 54px;
          height: 54px;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          opacity: 0;
          transform: scale(0.5) rotate(-45deg);
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .verix-activity-indicator.visible {
          opacity: 1;
          transform: scale(1) rotate(0deg);
        }

        .activity-logo {
          width: 32px;
          height: 32px;
          z-index: 2;
          animation: activity-pulse 2s ease-in-out infinite;
        }

        .activity-logo img {
          width: 100%;
          height: 100%;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .activity-orbit {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid transparent;
          border-top-color: var(--primary);
          border-right-color: rgba(99, 102, 241, 0.2);
          border-radius: 50%;
          animation: activity-spin 1s linear infinite;
        }

        .activity-glow {
          position: absolute;
          width: 40px;
          height: 40px;
          background: var(--primary);
          filter: blur(20px);
          opacity: 0.3;
          z-index: 1;
          animation: activity-glow-pulse 2s ease-in-out infinite;
        }

        @keyframes activity-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes activity-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes activity-glow-pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }

        @media (max-width: 1000px) {
          .verix-activity-indicator {
            bottom: 100px; /* Above toast in mobile */
            right: 20px;
          }
          .content-container {
            padding: 88px 16px 32px 16px;
          }
          .toast-wrapper {
            top: auto;
            bottom: 32px;
            right: 16px;
            left: 16px;
          }
          .toast-premium {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
