import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '../contexts/AuthContext';
import { useT } from '../contexts/LanguageContext';
import { 
  ShieldCheck, 
  Bot,
  RefreshCcw,
  Gavel,
  Tv,
  Crown,
  BarChart3,
  Sparkles,
  Terminal,
  Shield,
  Ticket,
  Mic2,
  Gift,
  Layout as LayoutIcon, 
  LogOut, 
  Settings, 
  Settings2,
  ChevronLeft,
  Home,
  CheckCircle,
  MousePointer2,
  ListChecks,
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
  HelpCircle,
  Coins,
  Sun,
  Moon,
  Trash2
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmModal from './ConfirmModal';

const GuideSidebar = dynamic(() => import('./GuideSidebar'), {
  ssr: false,
  loading: () => <aside className="guide-sidebar loading" />
});

export default function Layout({ children, guildId: propGuildId, hideGuide = false, isNavigating = false }) {
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
  const [serverInfo, setServerInfo] = useState({ name: t('common.loading'), icon: null });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideContext, setGuideContext] = useState({});
  const [isActivity, setIsActivity] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

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
  const isPremium = premiumTier === 'premium' || premiumTier === 'platinum';

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
      title: t('sidebar.group_setup'),
      items: [
        { name: t('sidebar.verify'), icon: CheckCircle, path: `/config/${guildId}/verify`, id: 'verify' },
        { name: t('sidebar.welcome'), icon: UserPlus, path: `/config/${guildId}/welcome`, id: 'welcome' },
        { name: t('sidebar.reactionroles') || 'Reaction Roles', icon: MousePointer2, path: `/config/${guildId}/reaction-roles`, id: 'reaction-roles' }
      ]
    },
    {
      title: t('sidebar.group_community'),
      items: [
        { name: t('sidebar.socials'), icon: Tv, path: `/config/${guildId}/socials`, id: 'socials' },
        { name: t('sidebar.giveaway'), icon: Gift, path: `/config/${guildId}/giveaway`, id: 'giveaway' },
        { name: t('sidebar.photocontest'), icon: Camera, path: `/config/${guildId}/photocontest`, id: 'photocontest' },
        { name: t('sidebar.polls') || 'Polls', icon: ListChecks, path: `/config/${guildId}/polls`, id: 'polls' }
      ]
    },
    {
      title: t('sidebar.group_management'),
      items: [
        { name: t('sidebar.tickets'), icon: Ticket, path: `/config/${guildId}/tickets`, id: 'tickets' },
        { name: t('sidebar.support'), icon: Mic2, path: `/config/${guildId}/support`, id: 'support' },
        { name: t('sidebar.tempvoice'), icon: Mic2, path: `/config/${guildId}/tempvoice`, id: 'tempvoice' }
      ]
    },
    {
      title: t('sidebar.moderation'),
      items: [
        { name: t('sidebar.moderation'), icon: Gavel, path: `/config/${guildId}/moderation`, id: 'moderation' }
      ]
    },
    {
      title: t('sidebar.group_tools'),
      items: [
        { name: t('sidebar.automations'), icon: Cpu, path: `/config/${guildId}/automations`, id: 'automations' },
        { name: t('sidebar.embeds'), icon: LayoutIcon, path: `/config/${guildId}/embeds`, id: 'embeds' },
        { name: t('sidebar.analytics'), icon: BarChart3, path: `/config/${guildId}/analytics`, id: 'analytics' }
      ]
    },
    {
      title: t('sidebar.fivem'),
      items: [
        { name: t('sidebar.fivem'), icon: Globe, path: `/config/${guildId}/fivem`, id: 'fivem' },
        { name: t('sidebar.whitelist'), icon: ShieldCheck, path: `/config/${guildId}/whitelist`, id: 'whitelist' }
      ]
    },
    {
      title: t('sidebar.group_management'),
      items: [
        { name: t('sidebar.management'), icon: History, path: `/config/${guildId}/management`, id: 'management' },
        { name: t('management.audit_logs_title'), icon: Shield, path: `/config/${guildId}/audit`, id: 'audit' }
      ]
    }
  ];

  const systemGroup = {
    title: t('sidebar.group_system'),
    items: [
      { name: t('sidebar.system'), icon: Settings, path: `/config/${guildId}/system`, id: 'system' },
      
      // Unified White-Label for both Premium and Platinum
      ...(isPremium ? [
        { name: t('sidebar.white_label'), icon: Sparkles, path: `/config/${guildId}/white-label`, id: 'white_label' }
      ] : []),

      // Sync only for Platinum
      ...(premiumTier === 'platinum' ? [
        { name: t('common.sync') || 'Sync', icon: RefreshCcw, path: `/config/${guildId}/sync`, id: 'sync' }
      ] : []),

      { name: t('sidebar.system_ops') || 'System Ops', icon: Terminal, path: '/admin/system', id: 'system_ops', adminOnly: true }
    ]
  };

  const handleLeaveServer = async () => {
    setIsLeaving(true);
    try {
        const res = await fetch(`/api/config/${guildId}/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (data.success) {
            window.dispatchEvent(new CustomEvent('show-toast', { 
                detail: { message: t('management.bot_left_success') || 'Il bot ha lasciato il server!', type: 'success' } 
            }));
            router.push('/selector');
        } else {
            window.dispatchEvent(new CustomEvent('show-toast', { 
                detail: { message: data.message || t('common.error'), type: 'error' } 
            }));
        }
    } catch (err) {
        console.error('Leave error:', err);
        window.dispatchEvent(new CustomEvent('show-toast', { 
            detail: { message: t('common.error'), type: 'error' } 
        }));
    } finally {
        setIsLeaving(false);
        setShowLeaveModal(false);
    }
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
            <div key={gIdx} className={`nav-section ${!group.title ? 'nav-section-top' : 'nav-section-module'}`}>
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
          <div className="nav-section">
              {!isCollapsed ? (
                <div className="nav-group-title animate fade-in">{systemGroup.title}</div>
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
                <span className="name">{user?.username || t('common.user')}</span>
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
             <div 
               className="server-crumb interactive" 
               onClick={() => setShowLeaveModal(true)}
               title={t('management.leave_server') || 'Fai uscire il bot dal server'}
             >
                {serverInfo.icon && (
                  <img 
                    src={`https://cdn.discordapp.com/icons/${guildId}/${serverInfo.icon}.png`} 
                    alt="" 
                  />
                )}
                <span>{serverInfo.name}</span>
                <Trash2 size={12} className="leave-icon" />
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
          <div className={`content-transition-wrapper ${isNavigating ? 'navigating' : ''}`}>
            {children}
          </div>
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
      <div
        className={`verix-activity-indicator ${isActivity ? 'visible' : ''}`}
        aria-hidden={!isActivity}
        aria-label="Caricamento"
      >
          <span className="activity-dot"></span>
      </div>

      <ConfirmModal 
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={handleLeaveServer}
        title={t('management.leave_title') || 'Sei sicuro?'}
        message={t('management.leave_confirm') || 'Il bot lascerà questo server e non potrai più configurarlo finché non lo inviti nuovamente.'}
        confirmText={isLeaving ? t('common.processing') : (t('management.leave_btn') || 'Lascia Server')}
        type="danger"
      />

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

        .nav-section { margin-bottom: 2px; }
        .nav-group-title { font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; padding: 8px 16px 1px 16px; opacity: 0.5; }
        .nav-divider { height: 1px; background: var(--border); margin: 4px 16px; opacity: 0.3; }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 3px 14px;
          border-radius: 10px;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 11px;
          text-decoration: none;
          transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          white-space: nowrap;
        }

        /* Content Area */
        .content-container {
          padding: 96px 48px 48px 48px;
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
        }

        .server-crumb.interactive {
          cursor: pointer;
          transition: all 0.2s;
          padding: 4px 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .server-crumb.interactive:hover {
          background: rgba(239, 68, 68, 0.05);
          color: var(--error);
        }

        .server-crumb .leave-icon {
          opacity: 0;
          transition: 0.2s;
          color: var(--error);
        }

        .server-crumb.interactive:hover .leave-icon {
          opacity: 1;
          transform: scale(1.1);
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
          width: 34px;
          height: 34px;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          background: var(--bg-elevated);
          border: 1px solid var(--border-strong);
          border-radius: 8px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.18);
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.16s ease, transform 0.16s ease;
        }

        .verix-activity-indicator.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .activity-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--primary);
          animation: activity-dot-pulse 1s ease-in-out infinite;
        }

        @keyframes activity-dot-pulse {
          0%, 100% { opacity: 0.45; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
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
