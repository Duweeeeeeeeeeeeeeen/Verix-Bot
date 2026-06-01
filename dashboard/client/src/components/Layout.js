import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '../contexts/AuthContext';
import { useT } from '../contexts/LanguageContext';
import api from '../utils/api';
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
  Command,
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
  Menu,
  X,
  Trophy,
  Trash2,
  MessageSquare,
  Activity,
  Search
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmModal from './ConfirmModal';
import { useModuleLock } from '../hooks/useModuleLock';
import LockWarningBanner from './LockWarningBanner';

const GuideSidebar = dynamic(() => import('./GuideSidebar'), {
  ssr: false,
  loading: () => <aside className="guide-sidebar loading" />
});

const CommandPalette = dynamic(() => import('./CommandPalette'), {
  ssr: false
});

export default function Layout({ children, guildId: propGuildId, hideGuide = false, isNavigating = false }) {
  const { user, logout, currentGuildId, updateGuildId, fetchUser } = useAuth();
  const { t, language, setLanguage } = useT();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Use prop if available, otherwise fallback to context
  const guildId = propGuildId || currentGuildId || router.query.guildId;

  // Real-time Concurrency locking
  const currentPathParts = router.pathname.split('/');
  const rawModule = currentPathParts[currentPathParts.length - 1];
  
  const lockableModules = [
      'whitelist', 'tickets', 'automations', 'moderation', 'fivem', 'welcome', 
      'verify', 'photocontest', 'giveaway', 'support', 'tempvoice', 'background', 
      'leveling', 'socials', 'utility', 'global', 'reaction-roles', 'polls', 'sync', 'white-label'
  ];
  
  const isLockable = lockableModules.includes(rawModule);
  
  let moduleToLock = null;
  if (isLockable && guildId && guildId !== 'undefined') {
      moduleToLock = rawModule;
      if (moduleToLock === 'reaction-roles') moduleToLock = 'reactionroles';
      if (moduleToLock === 'white-label') moduleToLock = 'global';
  }
  
  const { isLocked, lockOwner, forceUnlock } = useModuleLock(guildId, moduleToLock);

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const helpTimeoutRef = useRef(null);
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'it', label: 'Italiano' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'pt', label: 'Português' }
  ];
  const currentLanguage = languageOptions.find(option => option.value === language) || languageOptions[0];

  const handleHelpEnter = () => {
    if (helpTimeoutRef.current) clearTimeout(helpTimeoutRef.current);
    setIsHelpOpen(true);
  };

  const handleHelpLeave = () => {
    helpTimeoutRef.current = setTimeout(() => {
      setIsHelpOpen(false);
    }, 300); // 300ms delay to bridge the gap
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      setServerInfo({ name: t('common.loading_verix'), icon: null });
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

  const [enabledModules, setEnabledModules] = useState({});

  const fetchModuleStatus = async () => {
    if (!guildId || guildId === 'undefined') return;
    try {
      const response = await api.request(`/config/${guildId}/module-status`);
      if (response) {
        setEnabledModules(response.enabledModules || {});
        setPremiumTier(response.premiumTier || 'none');
      }
    } catch (err) {
      if (!api.isAuthError(err)) {
        console.error("Failed to fetch sidebar status", err);
      }
    }
  };

  useEffect(() => {
    fetchModuleStatus();
  }, [guildId]);

  useEffect(() => {
    setIsMobileNavOpen(false);
    setIsLanguageOpen(false);
  }, [router.asPath]);

  useEffect(() => {
    const handleRefresh = (event) => {
      if (!event.detail?.guildId || event.detail.guildId === guildId) {
        fetchModuleStatus();
      }
    };

    window.addEventListener('refresh-module-status', handleRefresh);
    return () => window.removeEventListener('refresh-module-status', handleRefresh);
  }, [guildId]);

  const isPremium = premiumTier !== 'none';
  const isPlatinum = premiumTier === 'platinum';

  const navigationGroups = [
    {
      title: t('sidebar.group_general'),
      items: [
        { name: t('sidebar.home'), icon: Home, path: `/config/${guildId}`, id: 'home' }
      ]
    },
    {
      title: t('sidebar.group_setup'),
      items: [
        { name: t('sidebar.verify'), icon: CheckCircle, path: `/config/${guildId}/verify`, id: 'verify' },
        { name: t('sidebar.welcome'), icon: UserPlus, path: `/config/${guildId}/welcome`, id: 'welcome' },
        { name: t('sidebar.leveling') || 'Leveling & Rewards', icon: Trophy, path: `/config/${guildId}/leveling`, id: 'leveling' },
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
        { name: t('sidebar.voice_interviste') || 'Voice & Interviste', icon: Mic2, path: `/config/${guildId}/voice`, id: 'voice' }
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
        { name: t('sidebar.utility') || 'Utility', icon: Command, path: `/config/${guildId}/utility`, id: 'utility' },
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
      title: t('sidebar.group_administration') || 'Amministrazione',
      items: [
        { name: t('sidebar.management'), icon: History, path: `/config/${guildId}/management`, id: 'management' },
        { name: t('management.audit_logs_title'), icon: Shield, path: `/config/${guildId}/audit`, id: 'audit' },
        ...(!serverInfo.isCollaborator ? [
          { name: t('sidebar.collaborators') || 'Collaboratori', icon: UserPlus, path: `/config/${guildId}/collaborators`, id: 'collaborators' }
        ] : [])
      ]
    }
  ];

  const systemGroup = {
    title: t('sidebar.group_system'),
    items: [
      { name: t('sidebar.system'), icon: Settings, path: `/config/${guildId}/system`, id: 'system' },
      
      // Unified White-Label for both Premium and Platinum
      ...(isPremium ? [
        { name: t('sidebar.branding') || 'Branding & Identità', icon: Sparkles, path: `/config/${guildId}/white-label`, id: 'white_label' }
      ] : []),

      // Sync only for Platinum
      ...(isPlatinum ? [
        { name: t('common.sync') || 'Sync', icon: RefreshCcw, path: `/config/${guildId}/sync`, id: 'sync' }
      ] : []),

      { name: t('sidebar.system_ops'), icon: Terminal, path: '/admin/system', id: 'system_ops', adminOnly: true }
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
            await fetchUser(); // Sync user data immediately
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
    <div className={`dashboard-container ${isMobileNavOpen ? 'mobile-nav-open' : ''}`}>
      <button
        type="button"
        className="mobile-nav-toggle"
        onClick={() => {
          setIsLanguageOpen(false);
          setIsHelpOpen(false);
          setIsMobileNavOpen(open => !open);
        }}
        aria-label={isMobileNavOpen ? 'Close navigation' : 'Open navigation'}
      >
        {isMobileNavOpen ? <X size={18} /> : <Menu size={18} />}
      </button>
      {isMobileNavOpen && <div className="mobile-nav-backdrop" onClick={() => setIsMobileNavOpen(false)} />}
      {/* Premium Sidebar (Left) */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileNavOpen ? 'mobile-open' : ''}`}>
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

        {/* New Module Search */}
        {!isCollapsed && (
          <div className="sidebar-search animate fade-in">
            <div className="search-wrapper">
              <Search size={14} className="search-icon" />
              <input 
                type="text" 
                placeholder={t('common.search_hint') || `${t('common.search')} (Ctrl+K)`} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        <nav className="nav-group">
           {navigationGroups.map((group, gIdx) => {
             const filteredItems = group.items.filter(item => 
               item.name.toLowerCase().includes(searchQuery.toLowerCase())
             );
             
             if (filteredItems.length === 0 && searchQuery) return null;

             return (
              <div key={gIdx} className={`nav-section ${!group.title ? 'nav-section-top' : 'nav-section-module'}`}>
                {group.title && (
                  !isCollapsed ? (
                    <div className="nav-group-title animate fade-in">{group.title}</div>
                  ) : (
                    <div className="nav-divider"></div>
                  )
                )}
                
                {filteredItems.map((item) => {
                  // Admin Only Check
                  if (item.adminOnly && (!user || !['361159834688552960', '314417452395626496'].includes(user.id))) {
                    return null;
                  }

                  const Icon = item.icon;
                  const isActive = router.asPath === item.path;
                  const showStatusDot = enabledModules[item.id] !== undefined && (enabledModules[item.id] || item.id !== 'socials');
                  
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
                      
                      {/* New Status Indicator Dot */}
                      {showStatusDot && (
                        <div className={`nav-status-dot ${isCollapsed ? 'collapsed' : ''} ${enabledModules[item.id] ? 'on' : 'off'}`} />
                      )}

                      {isActive && !isCollapsed && <ChevronRight size={14} className="active-arrow" />}
                    </Link>
                  );
                })}
              </div>
             );
           })}
        </nav>

        <div className="sidebar-footer">
          {/* Fixed System Section */}
          <div className="nav-section">
              {(!searchQuery || systemGroup.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))) && (
                !isCollapsed ? (
                  <div className="nav-group-title animate fade-in">{systemGroup.title}</div>
                ) : (
                  <div className="nav-divider" style={{ margin: '0 16px 8px 16px' }}></div>
                )
              )}
              
              {systemGroup.items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => {
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
                title={t('management.leave_hint')}
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
             
             {/* New Breadcrumbs Component */}
             <div className="pc-breadcrumbs-v2 animate fade-in">
                <ChevronRight size={14} className="bc-separator" />
                 <span className="bc-item active">
                    <div className="flex items-center gap-2">
                        {[...navigationGroups.flatMap(g => g.items), ...systemGroup.items]
                          .filter(i => i.id !== 'home')
                          .find(i => router.asPath.includes(i.path))?.name || 
                         t('sidebar.home')}
                        {/* Status dot in breadcrumbs */}
                        {(() => {
                            const activeItem = [...navigationGroups.flatMap(g => g.items), ...systemGroup.items]
                                .find(i => router.asPath.includes(i.path));
                            if (activeItem && enabledModules[activeItem.id] !== undefined && (enabledModules[activeItem.id] || activeItem.id !== 'socials')) {
                                return <div className={`nav-status-dot mini ${enabledModules[activeItem.id] ? 'on' : 'off'}`} style={{ position: 'static', marginLeft: '6px' }} />;
                            }
                            return null;
                        })()}
                    </div>
                 </span>
             </div>
          </div>

          <div className="header-right">
              <div className="language-selector">
                  <button
                    className={`lang-btn ${isLanguageOpen ? 'active' : ''}`}
                    onClick={() => setIsLanguageOpen(open => !open)}
                    title={currentLanguage.label}
                  >
                    <Globe size={15} />
                    <span>{language.toUpperCase()}</span>
                  </button>
                  {isLanguageOpen && (
                    <div className="language-menu animate fade-in">
                      {languageOptions.map(option => (
                        <button
                          key={option.value}
                          className={`language-menu-item ${language === option.value ? 'active' : ''}`}
                          onClick={() => {
                            setLanguage(option.value);
                            setIsLanguageOpen(false);
                          }}
                        >
                          <span>{option.label}</span>
                          <strong>{option.value.toUpperCase()}</strong>
                        </button>
                      ))}
                    </div>
                  )}
              </div>
              <div className="status-badge">
                <div className="status-dot"></div>
                <span>{t('sidebar.bot_online')}</span>
              </div>
               <div className="header-actions">
                  <button className="icon-action theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? t('theme.light') : t('theme.dark')}>
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                  
                  {/* Help Center Dropdown */}
                  <div className="help-center-wrapper" onMouseEnter={handleHelpEnter} onMouseLeave={handleHelpLeave}>
                    <button 
                        className={`icon-action help-btn ${isHelpOpen ? 'active' : ''}`} 
                        onClick={() => setIsHelpOpen(!isHelpOpen)}
                        title={t('common.help_center') || 'Help Center'}
                    >
                      <BookOpen size={18} strokeWidth={2} className="text-primary" />
                    </button>
                    
                    {isHelpOpen && (
                        <div className="help-dropdown fade-in">
                            <div className="dropdown-header">
                                <span>{t('common.help_center') || 'Centro Assistenza'}</span>
                            </div>
                            <div className="dropdown-body">
                                <Link href={`/config/${guildId}/academy`} legacyBehavior>
                                    <a className="dropdown-item">
                                        <div className="item-icon"><Sparkles size={16} /></div>
                                        <div className="item-text">
                                            <span className="title">{t('hub.academy_title') || 'Verix Academy'}</span>
                                            <span className="desc">{t('layout.help.academy_desc')}</span>
                                        </div>
                                    </a>
                                </Link>
                                <a href="https://discord.com/invite/Ck3rGpSV7U" target="_blank" rel="noreferrer" className="dropdown-item">
                                    <div className="item-icon" style={{ color: '#5865F2' }}><MessageSquare size={16} /></div>
                                    <div className="item-text">
                                        <span className="title">{t('layout.help.discord_title')}</span>
                                        <span className="desc">{t('layout.help.discord_desc')}</span>
                                    </div>
                                </a>
                                <Link href={`/status?from=${encodeURIComponent(router.asPath)}`} legacyBehavior>
                                    <a className="dropdown-item">
                                        <div className="item-icon" style={{ color: '#10b981' }}><Activity size={16} /></div>
                                        <div className="item-text">
                                            <span className="title">{t('status_page.title') || 'Status Sistema'}</span>
                                            <span className="desc">{t('layout.help.status_desc')}</span>
                                        </div>
                                    </a>
                                </Link>
                            </div>
                        </div>
                    )}
                  </div>

                  <Link href={`/config/${guildId}/premium`} legacyBehavior>
                    <a className={`icon-action premium-btn ${premiumTier !== 'none' ? `is-premium ${premiumTier === 'premium' ? 'premium-tier' : premiumTier}` : ''}`} title={t('sidebar.premium')}>
                      <Crown size={18} strokeWidth={2} className={premiumTier === 'platinum' ? 'text-platinum' : premiumTier === 'premium' ? 'text-gold' : premiumTier === 'lite' ? 'text-lite' : 'text-dim'} />
                      {premiumTier !== 'none' && <span className="premium-badge-dot"></span>}
                    </a>
                  </Link>

                 {!hideGuide && !isGuideOpen && (
                   <button className="icon-action help-toggle" onClick={() => setIsGuideOpen(true)} title={t('layout.show_guide')}>
                     <HelpCircle size={18} strokeWidth={2} className="text-amber" />
                     <span className="dot-pulse"></span>
                   </button>
                 )}
               </div>
          </div>
        </header>

        <div className="content-container">
          <LockWarningBanner isLocked={isLocked} lockOwner={lockOwner} forceUnlock={forceUnlock} />
          <fieldset style={{ border: 'none', padding: 0, margin: 0, minWidth: 0 }} disabled={isLocked}>
            <div className={`content-transition-wrapper ${isNavigating ? 'navigating' : ''}`}>
              {children}
            </div>
          </fieldset>
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
        aria-label={t('common.activity_loading')}
      >
          <span className="activity-dot"></span>
      </div>

      <ConfirmModal 
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={handleLeaveServer}
        title={t('management.leave_confirm_title')}
        message={t('management.leave_confirm_desc')}
        confirmText={isLeaving ? t('common.processing') : t('management.leave_btn')}
        type="danger"
      />

      <CommandPalette 
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        items={navigationGroups.concat(systemGroup)}
        guildId={guildId}
        enabledModules={enabledModules}
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

        .mobile-nav-toggle,
        .mobile-nav-backdrop {
          display: none;
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

        .nav-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-left: auto;
          transition: 0.2s;
        }
        .nav-status-dot.collapsed {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 4px;
          height: 4px;
          border: 1px solid var(--bg-card);
        }
        .nav-status-dot.mini {
          width: 5px;
          height: 5px;
        }
        .nav-status-dot.on { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
        .nav-status-dot.off { background: var(--text-dim); opacity: 0.3; }

        .active .nav-status-dot.off { opacity: 0.5; }

        /* Content Area */
        .content-container {
          padding: 80px 32px 32px 32px;
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

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: auto;
        }

        .icon-action {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          color: var(--text-muted);
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          padding: 0;
        }

        .icon-action:hover {
          color: var(--text-main);
          background: var(--hover-bg);
          border-color: var(--border-strong);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .language-selector {
          position: relative;
          margin-right: 16px;
        }

        .lang-btn {
          min-width: 74px;
          height: 38px;
          padding: 0 12px;
          font-size: 12px;
          font-weight: 700;
          border-radius: 12px;
          color: var(--text-muted);
          transition: all 0.2s;
          background: var(--bg-card);
          border: 1px solid var(--border);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
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

        .language-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 190px;
          padding: 8px;
          border-radius: 16px;
          background: var(--bg-card);
          border: 1px solid var(--border-strong);
          box-shadow: var(--shadow-lg);
          z-index: 9999;
        }

        .language-menu-item {
          width: 100%;
          height: 38px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 10px;
          cursor: pointer;
          font-weight: 700;
          transition: 0.18s ease;
        }

        .language-menu-item:hover {
          background: var(--hover-bg);
          color: var(--text-heading);
        }

        .language-menu-item.active {
          background: rgba(var(--primary-rgb), 0.12);
          color: var(--primary);
        }

        .language-menu-item strong {
          font-size: 0.68rem;
          color: inherit;
          opacity: 0.75;
        }

        .bc-item.active {
          color: var(--text-heading);
        }

        .premium-btn.is-premium.lite {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.2);
        }
        .premium-btn.is-premium.lite:hover {
          background: rgba(59, 130, 246, 0.2);
        }
        .premium-btn.is-premium.premium-tier {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.2);
        }
        .premium-btn.is-premium.premium-tier:hover {
          background: rgba(245, 158, 11, 0.2);
        }
        .premium-btn.is-premium.platinum {
          background: rgba(168, 85, 247, 0.1);
          border-color: rgba(168, 85, 247, 0.2);
        }
        .premium-btn.is-premium.platinum:hover {
          background: rgba(168, 85, 247, 0.2);
        }

        .text-gold { color: #ffd700; filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4)); }
        .text-platinum { color: #a855f7; filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.4)); }
        .text-lite { color: #3b82f6; filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.4)); }
        .text-dim { color: var(--text-dim); }

        .premium-badge-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 5px;
          height: 5px;
          background: #ffd700;
          border-radius: 50%;
          box-shadow: 0 0 10px #ffd700;
        }

        .help-center-wrapper {
          position: relative;
        }

        .help-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 12px;
          width: 280px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: var(--shadow-premium);
          z-index: 1000;
          overflow: hidden;
        }

        .help-dropdown::before {
          content: '';
          position: absolute;
          top: -24px;
          left: -20px;
          right: -20px;
          height: 30px;
          background: transparent;
        }

        .dropdown-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-secondary);
        }

        .dropdown-header span {
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .dropdown-body {
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
        }

        .dropdown-item:hover {
          background: var(--hover-bg);
          transform: translateX(4px);
        }

        .item-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-badge);
          border-radius: 10px;
          color: var(--primary);
        }

        .item-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .item-text .title {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .item-text .desc {
          font-size: 0.7rem;
          color: var(--text-dim);
        }

        .help-btn.active {
          background: var(--primary-glow);
          color: var(--primary);
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
          .mobile-nav-toggle {
            position: fixed;
            top: 18px;
            left: 16px;
            z-index: 260;
            width: 42px;
            height: 42px;
            border-radius: 12px;
            border: 1px solid var(--border);
            background: var(--bg-card);
            color: var(--text-heading);
            box-shadow: var(--shadow-premium);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          .mobile-nav-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 190;
            background: rgba(15, 23, 42, 0.42);
            backdrop-filter: blur(4px);
          }

          :global(.sidebar) {
            position: fixed;
            inset: 0 auto 0 0;
            width: min(86vw, 300px) !important;
            transform: translateX(-105%);
            transition: transform 0.22s ease !important;
            z-index: 220 !important;
            box-shadow: 24px 0 80px rgba(0, 0, 0, 0.25);
          }

          :global(.sidebar.mobile-open) {
            transform: translateX(0);
          }

          :global(.dashboard-container.mobile-nav-open .top-header) {
            z-index: 80;
            pointer-events: none;
            opacity: 0.18;
          }

          :global(.dashboard-container.mobile-nav-open .header-left),
          :global(.dashboard-container.mobile-nav-open .header-right) {
            pointer-events: none;
          }

          :global(.sidebar.mobile-open .brand-text),
          :global(.sidebar.mobile-open .nav-link-text),
          :global(.sidebar.mobile-open .user-info),
          :global(.sidebar.mobile-open .btn-logout),
          :global(.sidebar.mobile-open .sidebar-search),
          :global(.sidebar.mobile-open .nav-group-title) {
            display: flex !important;
          }

          :global(.sidebar.mobile-open .btn-collapse) {
            display: none;
          }

          .main-content {
            width: 100vw;
            overflow-x: hidden;
          }

          :global(.top-header) {
            top: 12px;
            margin: 0 12px 0 70px;
            height: auto;
            min-height: 56px;
            gap: 10px;
            align-items: flex-start;
          }

          :global(.header-left),
          :global(.header-right) {
            min-height: 54px;
            height: auto;
            padding: 8px 12px;
            border-radius: 14px;
          }

          :global(.header-left) {
            min-width: 0;
            flex: 1;
          }

          :global(.header-right) {
            gap: 8px;
          }

          :global(.pc-breadcrumbs-v2) {
            display: none !important;
          }

          :global(.server-crumb span) {
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .language-selector {
            margin-right: 0;
          }

          .status-badge {
            display: none;
          }

          .header-actions {
            gap: 8px;
          }

          .verix-activity-indicator {
            bottom: 100px; /* Above toast in mobile */
            right: 20px;
          }
          .content-container {
            padding: 92px 14px 32px 14px;
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

        @media (max-width: 640px) {
          :global(.top-header) {
            flex-direction: column;
            align-items: stretch;
          }

          :global(.header-left),
          :global(.header-right) {
            width: 100%;
          }

          :global(.header-right) {
            justify-content: space-between;
          }

          :global(.btn-back span),
          :global(.header-divider) {
            display: none;
          }

          .content-container {
            padding-top: 152px;
          }

          .help-dropdown,
          .language-menu {
            position: fixed;
            top: 76px;
            right: 12px;
            left: 12px;
            width: auto;
          }
        }
      `}</style>
    </div>
  );
}
