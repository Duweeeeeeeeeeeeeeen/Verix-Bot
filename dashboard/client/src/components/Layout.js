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
  ExternalLink
} from 'lucide-react';

export default function Layout({ children, guildId }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [toast, setToast] = useState(null);
  const [serverInfo, setServerInfo] = useState({ name: 'Loading...', icon: null });
  const [activeDropdown, setActiveDropdown] = useState(null); // 'notif' | 'more' | null

  // Fetch server info for the header
  useEffect(() => {
    if (guildId && user?.guilds) {
      const g = user.guilds.find(g => g.id === guildId);
      if (g) setServerInfo(g);
    }
  }, [guildId, user]);

  // Global Toast Handler
  useEffect(() => {
    const handleToast = (e) => {
      setToast(e.detail);
      setTimeout(() => setToast(null), 4000);
    };
    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.header-action-container')) {
        setActiveDropdown(null);
      }
    };
    if (activeDropdown) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: `/config/${guildId}` },
    { name: 'Whitelist', icon: ShieldCheck, path: `/config/${guildId}/whitelist` },
    { name: 'Sistema Verifica', icon: CheckCircle, path: `/config/${guildId}/verify` },
    { name: 'Welcome & Leave', icon: UserPlus, path: `/config/${guildId}/welcome` },
    { name: 'Support Tickets', icon: Ticket, path: `/config/${guildId}/tickets` },
    { name: 'Photo Contest', icon: Camera, path: `/config/${guildId}/photocontest` },
    { name: 'FiveM Status', icon: Globe, path: `/config/${guildId}/fivem` },
    { name: 'Embed Suite', icon: LayoutIcon, path: `/config/${guildId}/embeds` },
    { name: 'Impostazioni Globali', icon: Settings2, path: `/config/${guildId}/global` },
    { name: 'Audit Logs', icon: History, path: `/config/${guildId}/audit-logs` },
    { name: 'Guida Bot', icon: BookOpen, path: `/config/${guildId}/guide` },
  ];

  const getToastIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle size={22} color="var(--success)" />;
      case 'error': return <AlertCircle size={22} color="var(--error)" />;
      case 'warning': return <AlertTriangle size={22} color="var(--warning)" />;
      case 'info': return <Info size={22} color="var(--info)" />;
      default: return <Info size={22} color="var(--primary)" />;
    }
  };

  const getToastBg = (type) => {
    switch(type) {
      case 'success': return 'rgba(16, 185, 129, 0.1)';
      case 'error': return 'rgba(239, 68, 68, 0.1)';
      case 'warning': return 'rgba(245, 158, 11, 0.1)';
      case 'info': return 'rgba(59, 130, 246, 0.1)';
      default: return 'rgba(255, 255, 255, 0.05)';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar - Immersive & Glass */}
      <aside className="sidebar">
        <div className="logo-section" style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
              borderRadius: '14px',
              boxShadow: '0 8px 16px var(--primary-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              overflow: 'hidden',
              background: 'var(--bg-card)'
          }}>
             <img src="/logo.png" alt="V" onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<div style="font-weight: 800; font-size: 20px; color: var(--primary);">V</div>'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '-2px' }}>Verix</h2>
            <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Premium Suite</p>
          </div>
        </div>

        <nav className="nav-menu">
          <Link href="/selector" className="btn-back" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              color: 'var(--text-muted)', 
              textDecoration: 'none', 
              marginBottom: '32px', 
              fontSize: '0.85rem',
              fontWeight: '600',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              transition: 'var(--transition-fast)'
          }}>
             <ChevronLeft size={16} /> Server List
          </Link>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.asPath === item.path;
            
            return (
              <Link 
                key={item.name} 
                href={item.path}
                className={isActive ? 'menu-item active' : 'menu-item'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                  borderRadius: '16px',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  background: isActive ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'var(--transition-normal)',
                  marginBottom: '8px',
                  border: isActive ? '1px solid rgba(var(--primary-rgb), 0.2)' : '1px solid transparent',
                  position: 'relative',
                }}
              >
                {isActive && <div style={{ 
                    position: 'absolute', 
                    left: 0, 
                    top: '25%', 
                    bottom: '25%', 
                    width: '4px', 
                    background: 'var(--primary)', 
                    borderRadius: '0 40px 40px 0',
                    boxShadow: '0 0 10px var(--primary-glow)' 
                }} />}
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} color={isActive ? 'var(--primary)' : 'currentColor'} />
                <span style={{ fontWeight: isActive ? '700' : '500', fontSize: '0.95rem' }}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card - Now part of Flex Layout */}
        <div className="user-profile-container">
          <div className="user-profile-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                  <img 
                  src={user?.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                  alt="Avatar" 
                  style={{ width: '42px', height: '42px', borderRadius: '12px', border: '2px solid var(--border)' }} 
                  />
                  <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%', border: '2px solid var(--bg-sidebar)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.9rem', fontWeight: '750', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Server Admin</p>
              </div>
              <button onClick={logout} className="logout-btn" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Top Header - Contextual & Minimal */}
      <header className="top-header glass">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {serverInfo.icon ? (
                    <img src={`https://cdn.discordapp.com/icons/${guildId}/${serverInfo.icon}.png`} alt="S" style={{ width: '32px', height: '32px', borderRadius: '10px' }} />
                ) : (
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                        {serverInfo.name?.charAt(0)}
                    </div>
                )}
                <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{serverInfo.name}</h3>
            </div>
            <div className="divider"></div>
            <div className="bot-status-indicator">
                <div className="status-pulse"></div>
                <span>Bot Live</span>
            </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Notifications */}
            <div className="header-action-container">
                <div 
                    className={`header-icon-btn ${activeDropdown === 'notif' ? 'active' : ''}`} 
                    title="Notifiche"
                    onClick={() => setActiveDropdown(activeDropdown === 'notif' ? null : 'notif')}
                >
                    <Bell size={18} />
                    <div className="notif-badge"></div>
                </div>
                
                {activeDropdown === 'notif' && (
                    <div className="header-dropdown notification-drawer animate-in">
                        <div className="dropdown-header">
                            <span>Notifiche</span>
                            <button className="text-btn">Segna letti</button>
                        </div>
                        <div className="dropdown-body empty-state">
                            <BellOff size={32} opacity={0.2} />
                            <p>Nessuna nuova notifica</p>
                            <span>Ti avviseremo quando succede qualcosa di importante.</span>
                        </div>
                    </div>
                )}
            </div>

            {/* External Link */}
            <a 
                href="https://github.com/manuelemaggi/Verix-Bot" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="header-icon-btn" 
                title="Sito Web"
            >
                <Globe size={18} />
            </a>

            <div className="divider"></div>

            <Link href={`/config/${guildId}/guide`} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '10px', textDecoration: 'none' }}>
                <BookOpen size={16} /> Guida
            </Link>

            {/* More Menu */}
            <div className="header-action-container">
                <div 
                    className={`header-icon-btn ${activeDropdown === 'more' ? 'active' : ''}`}
                    onClick={() => setActiveDropdown(activeDropdown === 'more' ? null : 'more')}
                >
                    <MoreVertical size={20} color="var(--text-dim)" style={{ cursor: 'pointer' }} />
                </div>

                {activeDropdown === 'more' && (
                    <div className="header-dropdown more-menu animate-dropdown">
                    <Link href="/selector" className="dropdown-item dropdown-link">
                      <Server size={18} color="var(--primary)" />
                      <span>Cambia Server</span>
                    </Link>
                    
                    <div className="dropdown-divider"></div>
                    
                    <button className="dropdown-item text-error" onClick={handleLogout}>
                      <LogOut size={18} />
                      <span>Disconnetti</span>
                    </button>
                  </div>
                )}
            </div>
        </div>
      </header>

      <main className="main-content animate">
        <div className="content-wrapper">
          {children}
        </div>
      </main>

      {/* Premium Notification Toast */}
      {toast && (
        <div className="toast-container">
            <div className={`toast animate-in`}>
                <div style={{ 
                    padding: '10px', 
                    borderRadius: '12px', 
                    background: getToastBg(toast.type),
                    display: 'flex'
                }}>
                    {getToastIcon(toast.type)}
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '750', fontSize: '0.95rem', textTransform: 'capitalize' }}>{toast.type || 'Notifica'}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{toast.message}</p>
                </div>
            </div>
        </div>
      )}

      <style jsx>{`
        .dashboard-container {
            display: flex;
            min-height: 100vh;
        }

        .top-header {
            position: fixed;
            top: 20px;
            left: 300px; /* Sidebar width + gap */
            right: 20px;
            height: 70px;
            padding: 0 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 90;
            border-radius: 20px;
        }

        .divider {
            width: 1px;
            height: 24px;
            background: var(--border);
        }

        .header-icon-btn {
            color: var(--text-dim);
            cursor: pointer;
            transition: var(--transition-fast);
        }

        .header-icon-btn:hover {
            color: white;
            transform: translateY(-2px);
        }

        .bot-status-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--success);
            background: rgba(16, 185, 129, 0.08);
            padding: 6px 14px;
            border-radius: 100px;
            border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .status-pulse {
            width: 8px;
            height: 8px;
            background: var(--success);
            border-radius: 50%;
            box-shadow: 0 0 0 rgba(16, 185, 129, 0.4);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
            100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .nav-menu {
            flex: 1;
            overflow-y: auto;
            margin-bottom: 20px;
            padding-right: 4px;
        }

        .nav-menu::-webkit-scrollbar { width: 4px; }
        .nav-menu::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }

        .top-header {
            position: fixed;
            top: 20px;
            left: 310px; /* Sidebar width (280) + padding offset (30) */
            right: 30px;
            height: 70px;
            padding: 0 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 90;
            border-radius: 20px;
        }

        .user-profile-container {
            padding-top: 20px;
            border-top: 1px solid var(--border);
        }

        .user-profile-card {
            padding: 14px;
            background: rgba(255,255,255,0.02);
            border-radius: 18px;
            border: 1px solid var(--border);
            transition: var(--transition-fast);
        }

        .user-profile-card:hover {
            background: rgba(255,255,255,0.04);
            border-color: var(--border-light);
        }

        .logout-btn {
            background: rgba(239, 68, 68, 0.1);
            border: none;
            cursor: pointer;
            color: var(--error);
            padding: 10px;
            border-radius: 12px;
            transition: var(--transition-fast);
        }

        .logout-btn:hover {
            background: var(--error);
            color: white;
            transform: scale(1.05);
        }

        .menu-item:hover {
            color: white !important;
            background: rgba(255, 255, 255, 0.03) !important;
        }

        .btn-back:hover {
            border-color: var(--text-muted) !important;
            color: white !important;
            background: rgba(255, 255, 255, 0.05) !important;
        }

        .main-content {
            margin-top: 100px; /* Space for Top Header */
            flex: 1;
        }

        .header-action-container {
            position: relative;
        }

        .header-icon-btn.active {
            color: var(--primary);
            background: rgba(var(--primary-rgb), 0.1);
            border-radius: 8px;
            padding: 4px;
            margin: -4px;
        }

        .notif-badge {
            position: absolute;
            top: -2px;
            right: -2px;
            width: 8px;
            height: 8px;
            background: var(--error);
            border-radius: 50%;
            border: 2px solid var(--bg-dark);
        }

        .header-dropdown {
            position: absolute;
            top: calc(100% + 15px);
            right: 0;
            background: var(--glass-bg);
            backdrop-filter: var(--glass-blur);
            -webkit-backdrop-filter: var(--glass-blur);
            border: 1px solid var(--border-light);
            border-radius: 18px;
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
            z-index: 1000;
            overflow: hidden;
            animation: dropdownFade 0.3s var(--ease-premium);
        }

        @keyframes dropdownFade {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .notification-drawer {
            width: 320px;
        }

        .dropdown-header {
            padding: 16px 20px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .dropdown-header span {
            font-weight: 800;
            font-size: 0.9rem;
        }

        .text-btn {
            background: none;
            border: none;
            color: var(--primary);
            font-size: 0.75rem;
            font-weight: 700;
            cursor: pointer;
        }

        .dropdown-body.empty-state {
            padding: 40px 20px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
        }

        .dropdown-body.empty-state p {
            font-weight: 700;
            font-size: 0.95rem;
            margin-bottom: -4px;
        }

        .dropdown-body.empty-state span {
            font-size: 0.75rem;
            color: var(--text-muted);
            line-height: 1.4;
        }

        .more-menu {
            width: 220px;
            padding: 8px;
        }

        .dropdown-item, .dropdown-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            border-radius: 12px;
            color: white !important;
            text-decoration: none !important;
            font-size: 0.9rem;
            font-weight: 600;
            transition: var(--transition-fast);
            width: 100%;
            border: none;
            background: none;
            cursor: pointer;
            text-align: left;
        }

        .dropdown-item.danger:hover {
            background: rgba(239, 68, 68, 0.1);
            color: #ff6b6b;
        }

        .dropdown-divider {
            height: 1px;
            background: var(--border);
            margin: 8px;
        }
      `}</style>
    </div>
  );
}
