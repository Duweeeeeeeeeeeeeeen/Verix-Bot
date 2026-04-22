import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldCheck, 
  Mic2, 
  Ticket, 
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
  Tv
} from 'lucide-react';

export default function Layout({ children, guildId }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [toast, setToast] = useState(null);
  const [serverInfo, setServerInfo] = useState({ name: 'Loading...', icon: null });
  const [activeDropdown, setActiveDropdown] = useState(null);

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
    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  const menuItems = [
    { name: 'Home', icon: Home, path: `/config/${guildId}` },
    { name: 'Whitelist', icon: ShieldCheck, path: `/config/${guildId}/whitelist` },
    { name: 'Twitch', icon: Tv, path: `/config/${guildId}/twitch` },
    { name: 'Verifica', icon: CheckCircle, path: `/config/${guildId}/verify` },
    { name: 'Welcome', icon: UserPlus, path: `/config/${guildId}/welcome` },
    { name: 'Tickets', icon: Ticket, path: `/config/${guildId}/tickets` },
    { name: 'Photo Contest', icon: Camera, path: `/config/${guildId}/photocontest` },
    { name: 'FiveM', icon: Globe, path: `/config/${guildId}/fivem` },
    { name: 'Log & Gestione', icon: History, path: `/config/${guildId}/management` },
    { name: 'Embed Suite', icon: LayoutIcon, path: `/config/${guildId}/embeds` },
    { name: 'Utility', icon: Cpu, path: `/config/${guildId}/utility` },
    { name: 'Voice Selection', icon: Mic2, path: `/config/${guildId}/voice` },
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
      {/* Premium Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <img src="/logo.png" alt="Verix Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div className="brand-text">

            <h2>Verix</h2>
            <span>Dashboard</span>
          </div>
        </div>

        <nav className="nav-group">
           {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.asPath === item.path;
            
            return (
              <Link key={item.name} href={item.path} className={`nav-link ${isActive ? 'active' : ''}`}>
                <div className="nav-link-icon">
                  <Icon size={18} strokeWidth={2.5} />
                </div>
                <span className="nav-link-text">{item.name}</span>
                {isActive && <ChevronRight size={14} className="active-arrow" />}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <Link 
            href={`/config/${guildId}/global`} 
            className={`nav-link ${router.asPath === `/config/${guildId}/global` ? 'active' : ''}`}
            style={{ marginBottom: '8px' }}
          >
            <div className="nav-link-icon">
              <Settings2 size={18} strokeWidth={2.5} />
            </div>
            <span className="nav-link-text">Config. Globale</span>
            {router.asPath === `/config/${guildId}/global` && <ChevronRight size={14} className="active-arrow" />}
          </Link>
          <Link 
            href={`/config/${guildId}/system`} 
            className={`nav-link ${router.asPath === `/config/${guildId}/system` ? 'active' : ''}`}
            style={{ marginBottom: '12px' }}
          >
            <div className="nav-link-icon">
              <Settings size={18} strokeWidth={2.5} />
            </div>
            <span className="nav-link-text">Sistema</span>
            {router.asPath === `/config/${guildId}/system` && <ChevronRight size={14} className="active-arrow" />}
          </Link>
          <div className="user-mini-card">
            <img 
              src={user?.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'} 
              alt=""
            />
            <div className="user-info">
              <span className="name">{user?.username || 'User'}</span>
              <span className="role">Administrator</span>
            </div>
            <button onClick={logout} className="btn-logout" title="Logout">
              <LogOut size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </aside>

      {/* Sleek Top Header */}
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
               <button className="icon-action" title="Notifications">
                 <Bell size={18} strokeWidth={2} />
               </button>
               <button className="icon-action" title="Settings">
                 <Settings size={18} strokeWidth={2} />
               </button>
            </div>
        </div>
      </header>

      <main className="main-content">
        <div className="content-container">
          {children}
        </div>
      </main>

      {/* Refined Toast */}
      {toast && (
        <div className="toast-wrapper">
          <div className={`toast-premium ${toast.type}`}>
            {getToastIcon(toast.type)}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Local layout refinements */
        .dashboard-container { display: flex; min-height: 100vh; background: var(--bg-dark); }
        
        /* Header Refinement */
        .top-header { 
          position: fixed; 
          top: 16px; 
          left: 296px; 
          right: 16px; 
          height: 64px; 
          background: rgba(15, 23, 42, 0.6); 
          backdrop-filter: blur(16px); 
          border: 1px solid var(--glass-border); 
          border-radius: 18px; 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          padding: 0 24px; 
          z-index: 90;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header-left { display: flex; align-items: center; gap: 16px; }
        .btn-back { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; text-decoration: none; transition: 0.2s; background: rgba(255,255,255,0.04); padding: 8px 14px; border-radius: 10px; border: 1px solid var(--border); }
        .btn-back:hover { color: white; border-color: var(--text-muted); }
        .header-divider { width: 1px; height: 20px; background: var(--border); }
        .server-crumb { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 0.95rem; }
        .server-crumb img { width: 28px; height: 28px; border-radius: 8px; border: 1px solid var(--glass-border); }

        .header-right { display: flex; align-items: center; gap: 20px; }
        .status-badge { display: flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.08); padding: 6px 14px; border-radius: 100px; border: 1px solid rgba(16, 185, 129, 0.1); font-size: 0.75rem; font-weight: 700; color: var(--success); }
        .status-dot { width: 6px; height: 6px; background: var(--success); border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        .icon-action { background: transparent; border: none; color: var(--text-muted); cursor: pointer; transition: 0.2s; padding: 6px; }
        .icon-action:hover { color: white; transform: translateY(-1px); }

        /* Toast Refinement */
        .toast-wrapper { position: fixed; bottom: 32px; right: 32px; z-index: 1000; animation: toastSlide 0.4s var(--transition-normal); }
        @keyframes toastSlide { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .toast-premium { display: flex; align-items: center; gap: 12px; padding: 16px 24px; background: #1e293b; border-radius: 14px; border: 1px solid var(--border-strong); box-shadow: var(--shadow-premium); font-weight: 600; font-size: 0.9rem; min-width: 280px; }
        .toast-premium.success { color: #f1f5f9; border-left: 4px solid var(--success); }
        .toast-premium.error { color: #f1f5f9; border-left: 4px solid var(--error); }
      `}</style>
    </div>
  );
}
