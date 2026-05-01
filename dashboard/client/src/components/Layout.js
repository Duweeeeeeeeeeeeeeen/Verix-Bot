import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldCheck, 
  Mic2, 
  Ticket, 
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
  Moon
} from 'lucide-react';
import GuideSidebar from './GuideSidebar';

export default function Layout({ children, guildId }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [toast, setToast] = useState(null);
  const [serverInfo, setServerInfo] = useState({ name: 'Loading...', icon: null });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const [isActivity, setIsActivity] = useState(false);
  const [theme, setTheme] = useState('dark');

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
    const savedTheme = localStorage.getItem('verix-theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('verix-theme', newTheme);
    if (newTheme === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }
  };
  const [guideContext, setGuideContext] = useState({});

  useEffect(() => {
    if (guildId && user?.guilds) {
      const g = user.guilds.find(g => g.id === guildId);
      if (g) setServerInfo(g);
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
    if (pathname.includes('/autoclear')) return 'autoclear';
    if (pathname.includes('/system')) return 'system';
    if (pathname.includes('/global')) return 'global';
    return 'global';
  };

  const menuItems = [
    { name: 'Home', icon: Home, path: `/config/${guildId}` },
    { name: 'Whitelist', icon: ShieldCheck, path: `/config/${guildId}/whitelist` },
    { name: 'Socials', icon: Tv, path: `/config/${guildId}/socials` },
    { name: 'Verifica', icon: CheckCircle, path: `/config/${guildId}/verify` },
    { name: 'Welcome', icon: UserPlus, path: `/config/${guildId}/welcome` },
    { name: 'Tickets', icon: Ticket, path: `/config/${guildId}/tickets` },
    { name: 'Photo Contest', icon: Camera, path: `/config/${guildId}/photocontest` },
    { name: 'Giveaway', icon: Gift, path: `/config/${guildId}/giveaway` },
    { name: 'Moderazione', icon: Gavel, path: `/config/${guildId}/moderation` },
    { name: 'Temp Voice', icon: Mic2, path: `/config/${guildId}/tempvoice` },
    { name: 'Assistenza', icon: Mic2, path: `/config/${guildId}/support` },
    { name: 'FiveM', icon: Globe, path: `/config/${guildId}/fivem` },
    { name: 'Log & Gestione', icon: History, path: `/config/${guildId}/management` },
    { name: 'Embed Suite', icon: LayoutIcon, path: `/config/${guildId}/embeds` },
    { name: 'Auto Clear', icon: Cpu, path: `/config/${guildId}/autoclear` }
  ];

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
              <h2>Verix</h2>
              <span>Dashboard</span>
            </div>
          )}
          <button 
            className="btn-collapse" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Espandi" : "Contrai"}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="nav-group">
           {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.asPath === item.path;
            
            return (
              <Link 
                key={item.name} 
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
        </nav>

        <div className="sidebar-footer">
          <Link 
            href={`/config/${guildId}/global`} 
            className={`nav-link ${router.asPath === `/config/${guildId}/global` ? 'active' : ''}`}
            style={{ marginBottom: '8px' }}
            title={isCollapsed ? "Config. Globale" : ""}
          >
            <div className="nav-link-icon">
              <Settings2 size={18} strokeWidth={2.5} />
            </div>
            {!isCollapsed && <span className="nav-link-text animate fade-in">Config. Globale</span>}
          </Link>
          <Link 
            href={`/config/${guildId}/system`} 
            className={`nav-link ${router.asPath === `/config/${guildId}/system` ? 'active' : ''}`}
            style={{ marginBottom: '12px' }}
            title={isCollapsed ? "Sistema" : ""}
          >
            <div className="nav-link-icon">
              <Settings size={18} strokeWidth={2.5} />
            </div>
            {!isCollapsed && <span className="nav-link-text animate fade-in">Sistema</span>}
          </Link>
          <div className="user-mini-card">
            <img 
              src={user?.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'} 
              alt=""
            />
            {!isCollapsed && (
              <div className="user-info animate fade-in">
                <span className="name">{user?.username || 'User'}</span>
                <span className="role">Administrator</span>
              </div>
            )}
            <button onClick={logout} className="btn-logout" title="Logout">
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
                <span>Servers</span>
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
              <div className="status-badge">
                <div className="status-dot"></div>
                <span>Bot Online</span>
              </div>
               <div className="header-actions">
                  <button className="icon-action theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                 {!isGuideOpen && (
                   <button className="icon-action help-toggle" onClick={() => setIsGuideOpen(true)} title="Show Guide">
                     <HelpCircle size={18} strokeWidth={2} className="text-amber" />
                     <span className="dot-pulse"></span>
                   </button>
                 )}
                 <button className="icon-action" title="Notifications">
                   <Bell size={18} strokeWidth={2} />
                 </button>
              </div>
          </div>
        </header>

        <div className="content-container">
          {children}
        </div>
      </main>

      {/* Global Right Guide Sidebar */}
      <GuideSidebar 
        type={getGuideType(router.pathname)} 
        context={guideContext} 
        isOpen={isGuideOpen}
        onToggle={() => setIsGuideOpen(!isGuideOpen)}
      />

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
          overflow-x: hidden;
          position: relative;
          background: var(--bg-main);
        }

        .content-container {
          padding: 96px 48px 48px 48px;
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
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
