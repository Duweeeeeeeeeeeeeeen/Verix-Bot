import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { 
  Sun,
  Moon,
  LogOut, 
  Search, 
  Shield, 
  Plus,
  LayoutGrid,
  CheckCircle2,
  Crown,
  Sparkles,
  ArrowRight,
  Globe,
  RefreshCw
} from 'lucide-react';

import LoadingScreen from '../../components/LoadingScreen';
import { useT } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function Selector() {
  const { t, language, setLanguage } = useT();
  const { user, loading, logout, fetchUser, refreshGuilds } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, missing
  const [mounted, setMounted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showLang, setShowLang] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user && mounted) router.push('/');
    
    // Auto-refresh when user comes back to the tab (useful after inviting bot)
    const handleFocus = () => {
      if (mounted && user) fetchUser();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, loading, mounted]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
        await refreshGuilds();
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('selector.refresh_success'), type: 'success' } }));
    } catch (e) {
        console.error('Refresh failed:', e);
    } finally {
        setRefreshing(false);
    }
  };

  if (!mounted || (loading && !user)) return <LoadingScreen message={t('selector.loading')} />;
  if (!user) return null;


  // Filter logic
  const manageableGuilds = (user.guilds || [])
    .filter(g => (g.permissions & 0x8) || (g.permissions & 0x20) || g.isCollaborator) // Admin, Manage Server, or Collaborator
  const filteredGuilds = manageableGuilds
    .filter(g => {
      if (filter === 'active') return g.botInGuild;
      if (filter === 'missing') return !g.botInGuild;
      return true;
    })
    .filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const activeGuilds = filteredGuilds.filter(g => g.botInGuild);
  const pendingGuilds = filteredGuilds.filter(g => !g.botInGuild);

  const GuildCard = ({ guild, index }) => {
    const initials = guild.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const isPlatinum = guild.premiumTier === 'platinum';
    const isPremium = guild.isPremium;
    
    return (
      <div 
        className={`pc-guild-card-v2 animate slide-up ${guild.botInGuild ? 'active' : 'pending'}`} 
        style={{ animationDelay: `${index * 0.05}s` }}
        onClick={() => {
          if (guild.botInGuild) {
            router.push(`/config/${guild.id}`);
          } else {
            window.open(guild.inviteUrl, '_blank');
          }
        }}
      >
        <div className="card-top-v2">
          <div className="guild-avatar-v2">
            {guild.icon ? (
              <img 
                src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} 
                alt={guild.name} 
                loading="lazy"
              />
            ) : (
              <div className="avatar-fallback">{initials}</div>
            )}
            <div className={`status-ring-v2 ${guild.botInGuild ? 'online' : 'offline'}`}></div>
          </div>
          
          <div className="tier-badges-v2">
            {isPlatinum ? (
                <div className="pc-badge-platinum">
                    <Sparkles size={12} /> <span>PLATINUM</span>
                </div>
            ) : isPremium ? (
                <div className="pc-badge-premium">
                    <Crown size={12} /> <span>PREMIUM</span>
                </div>
            ) : null}
          </div>
        </div>

        <div className="card-body-v2">
            <h3>{guild.name}</h3>
            <div className="guild-meta-v2">
                <div className={`status-pill-v2 ${guild.botInGuild ? 'active' : 'missing'}`}>
                    {guild.botInGuild ? t('selector.status_active') : t('selector.status_missing')}
                </div>
            </div>
        </div>

        <div className="card-footer-v2">
            <span className="action-text-v2">
                {guild.botInGuild ? t('selector.manage_btn') : t('selector.add_btn')}
            </span>
            <div className="action-icon-v2">
                <ArrowRight size={16} />
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`pc-selector-wrapper fade-in ${theme}-mode`}>
        <header className="pc-selector-header-v2 glass-header">
            <div className="portal-brand-v2">
                <div className="brand-logo-v2">
                    <img src="/logo.png" alt="Verix" />
                </div>
                <div className="brand-text-v2">
                    <span className="portal-tag-v2">VERIX PORTAL</span>
                    <h1 className="outfit-font">{t('selector.title')}</h1>
                </div>
            </div>

            <div className="header-actions-v2">
                <div className="user-profile-premium">
                    <div className="user-avatar-p">
                        <img src={user?.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'} alt={user.username} />
                        <div className="online-indicator"></div>
                    </div>
                    <div className="user-info-p">
                        <span className="u-name-p">{user.username}</span>
                        <div className="badge-staff-v2">{t('sidebar.administrator')}</div>
                    </div>
                </div>
                <div className="action-btns-group">
                    <div className="lang-selector-container-p">
                        <button className="theme-toggle-btn-v2 lang-toggle-v2" onClick={() => setShowLang(!showLang)}>
                            <Globe size={18} />
                            <span className="lang-code-v2">{language.toUpperCase()}</span>
                        </button>
                        {showLang && (
                            <div className="lang-dropdown-p animate fade-in">
                                {['it', 'en', 'es', 'fr'].map(lang => (
                                    <button
                                        key={lang}
                                        className={`lang-dropdown-item-p ${language === lang ? 'active' : ''}`}
                                        onClick={() => {
                                            setLanguage(lang);
                                            setShowLang(false);
                                        }}
                                    >
                                        {lang.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="theme-toggle-btn-v2" onClick={toggleTheme}>
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <button 
                    onClick={handleRefresh} 
                    className={`pc-refresh-btn-v2 ${refreshing ? 'spinning' : ''}`}
                    disabled={refreshing}
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button onClick={logout} className="pc-logout-btn-v2">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>

        <div className="pc-selector-content-v2">
            <div className="pc-controls-bar-v2 glass-controls">
                <div className="pc-search-box-v2">
                    <Search className="search-icon" size={20} />
                    <input 
                      type="text" 
                      placeholder={t('selector.search_placeholder')} 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="pc-filters-row-v2">
                    {[
                        { id: 'all', label: t('selector.filter.all'), icon: LayoutGrid },
                        { id: 'active', label: t('selector.filter.active'), icon: CheckCircle2 },
                        { id: 'missing', label: t('selector.filter.missing'), icon: Plus }
                    ].map(f => (
                        <button 
                          key={f.id} 
                          className={`filter-chip-v2 ${filter === f.id ? 'active' : ''}`}
                          onClick={() => setFilter(f.id)}
                        >
                            <f.icon size={16} />
                            <span>{f.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="pc-guilds-sections-v2">
                {activeGuilds.length > 0 && (filter === 'all' || filter === 'active') && (
                    <section className="guild-section-v2">
                        <div className="section-title-v2">
                            <div className="title-icon-v2" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                <Shield size={18} />
                            </div>
                            <h2 className="outfit-font">{t('selector.active_servers')}</h2>
                            <span className="count-pill-v2">{activeGuilds.length}</span>
                        </div>
                        <div className="pc-guilds-grid-v2">
                            {activeGuilds.map((g, i) => <GuildCard key={g.id} guild={g} index={i} />)}
                        </div>
                    </section>
                )}

                {pendingGuilds.length > 0 && (filter === 'all' || filter === 'missing') && (
                    <section className="guild-section-v2">
                        <div className="section-title-v2">
                            <div className="title-icon-v2" style={{ background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' }}>
                                <Globe size={18} />
                            </div>
                            <h2 className="outfit-font">{t('selector.other_servers')}</h2>
                            <span className="count-pill-v2">{pendingGuilds.length}</span>
                        </div>
                        <div className="pc-guilds-grid-v2">
                            {pendingGuilds.map((g, i) => <GuildCard key={g.id} guild={g} index={activeGuilds.length + i} />)}
                        </div>
                    </section>
                )}

                {manageableGuilds.length === 0 && (
                    <div className="pc-empty-selector-v2 glass-card">
                        <div className="empty-icon-v2"><Shield size={48} /></div>
                        <h3>{t('selector.no_manageable_servers')}</h3>
                        <p>{t('selector.no_manageable_servers_desc')}</p>
                        <button className="pc-btn-primary-v2" onClick={handleRefresh}>
                            {t('selector.refresh_servers')}
                        </button>
                    </div>
                )}

                {manageableGuilds.length > 0 && filteredGuilds.length === 0 && (
                    <div className="pc-empty-selector-v2 glass-card">
                        <div className="empty-icon-v2"><Search size={48} /></div>
                        <h3>{t('selector.no_servers')}</h3>
                        <p>{t('selector.no_servers_desc')}</p>
                        <button className="pc-btn-primary-v2" onClick={() => {setSearchTerm(''); setFilter('all');}}>
                            {t('selector.reset_filters')}
                        </button>
                    </div>
                )}
            </div>
        </div>

        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Inter:wght@400;600;800&display=swap');

            :root {
                --bg-primary: #02040a;
                --text-primary: #ffffff;
                --text-secondary: #94a3b8;
                --card-bg: rgba(15, 23, 42, 0.3);
                --card-border: rgba(255, 255, 255, 0.04);
                --glass-header: rgba(15, 23, 42, 0.4);
                --accent: #6366f1;
            }

            .light-mode {
                --bg-primary: #f8fafc;
                --text-primary: #0f172a;
                --text-secondary: #475569;
                --card-bg: #ffffff;
                --card-border: rgba(0,0,0,0.05);
                --glass-header: rgba(255, 255, 255, 0.8);
            }

            .pc-selector-wrapper {
                min-height: 100vh;
                padding: 32px;
                background: var(--bg-primary); 
                color: var(--text-primary);
                font-family: 'Inter', sans-serif;
                position: relative;
                overflow-x: hidden;
                transition: background 0.3s, color 0.3s;
            }

            .outfit-font { font-family: 'Outfit', sans-serif !important; }

            /* Header */
            .pc-selector-header-v2 { 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                margin-bottom: 28px;
                max-width: 1400px; 
                margin-left: auto; 
                margin-right: auto; 
                position: relative;
                z-index: 10;
            }
            
            .glass-header {
                background: var(--glass-header);
                backdrop-filter: blur(14px);
                padding: 18px 24px;
                border-radius: 18px;
                border: 1px solid var(--card-border);
            }

            .portal-brand-v2 { display: flex; align-items: center; gap: 16px; }
            .brand-logo-v2 { width: 48px; height: 48px; border-radius: 14px; background: rgba(255,255,255,0.03); padding: 8px; border: 1px solid var(--card-border); }
            .brand-logo-v2 img { width: 100%; height: 100%; border-radius: 9px; }
            .brand-text-v2 { display: flex; flex-direction: column; gap: 0; }
            .brand-text-v2 h1 { font-size: 1.55rem; font-weight: 800; margin: -4px 0 0 0; color: var(--text-primary); letter-spacing: 0; }
            .portal-tag-v2 { font-size: 0.62rem; font-weight: 900; color: var(--accent); letter-spacing: 1px; line-height: 1; }

            .header-actions-v2 { display: flex; align-items: center; gap: 20px; }
            
            .user-profile-premium { 
                display: flex; 
                align-items: center; 
                gap: 16px; 
                background: var(--card-bg); 
                padding: 7px 14px 7px 7px;
                border-radius: 14px;
                border: 1px solid var(--card-border);
                transition: 0.2s;
            }
            .user-profile-premium:hover { background: rgba(255,255,255,0.05); border-color: var(--accent); }
            
            .user-avatar-p { position: relative; }
            .user-avatar-p img { width: 38px; height: 38px; border-radius: 10px; border: 1px solid var(--card-border); }
            .online-indicator { position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; background: #10b981; border: 2px solid var(--bg-primary); border-radius: 50%; }
            
            .user-info-p { display: flex; flex-direction: column; }
            .u-name-p { font-size: 0.95rem; font-weight: 800; color: var(--text-primary); }
            .badge-staff-v2 { font-size: 0.6rem; font-weight: 900; color: var(--accent); letter-spacing: 0; }
            
            .lang-toggle-v2 { width: auto !important; padding: 0 16px !important; gap: 8px; }
            .lang-code-v2 { font-size: 0.75rem; font-weight: 900; }

            .action-btns-group { display: flex; gap: 12px; }
            .theme-toggle-btn-v2, .pc-refresh-btn-v2, .pc-logout-btn-v2 {
                width: 42px; height: 42px; border-radius: 12px;
                border: 1px solid var(--card-border); 
                background: var(--card-bg); 
                color: var(--text-primary); cursor: pointer; transition: 0.3s; 
                display: flex; align-items: center; justify-content: center; 
            }
            .theme-toggle-btn-v2:hover { background: var(--accent); color: #fff; }
            .pc-refresh-btn-v2:hover { background: rgba(99, 102, 241, 0.1); color: var(--accent); border-color: var(--accent); }
            .pc-logout-btn-v2:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: #ef4444; }

            /* Controls */
            .pc-controls-bar-v2 { 
                max-width: 1400px; margin: 0 auto 28px;
                display: flex; justify-content: space-between; align-items: center; 
                gap: 24px; position: relative; z-index: 5;
            }
            .glass-controls {
                background: var(--card-bg);
                backdrop-filter: blur(10px);
                padding: 10px;
                border-radius: 16px;
                border: 1px solid var(--card-border);
            }

            .pc-search-box-v2 { 
                flex: 1; position: relative; display: flex; align-items: center; 
                background: var(--card-bg); 
                border: 1px solid var(--card-border); 
                border-radius: 12px; transition: 0.2s; padding: 0 16px;
            }
            .pc-search-box-v2:focus-within { border-color: var(--accent); background: rgba(255,255,255,0.04); }
            .pc-search-box-v2 input { width: 100%; background: transparent; border: none; padding: 13px 10px; font-weight: 600; color: var(--text-primary); outline: none; font-size: 0.95rem; }
            .search-icon { color: var(--text-secondary); }

            .pc-filters-row-v2 { display: flex; gap: 6px; background: rgba(0,0,0,0.1); padding: 5px; border-radius: 12px; }
            .filter-chip-v2 { 
                display: flex; align-items: center; gap: 8px; padding: 9px 14px;
                border-radius: 9px; border: none; background: transparent;
                color: var(--text-secondary); font-weight: 700; font-size: 0.82rem; cursor: pointer; transition: 0.2s;
            }
            .filter-chip-v2.active { background: var(--accent); color: white; }
            .filter-chip-v2:not(.active):hover { color: var(--text-primary); background: rgba(255,255,255,0.03); }

            /* Section */
            .guild-section-v2 { position: relative; z-index: 1; margin-bottom: 44px; }
            .section-title-v2 { max-width: 1400px; margin: 0 auto 16px; display: flex; align-items: center; gap: 12px; }
            .title-icon-v2 { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
            .section-title-v2 h2 { margin: 0; font-size: 1.25rem; font-weight: 800; color: var(--text-primary); letter-spacing: 0; }
            .count-pill-v2 { background: var(--card-bg); color: var(--text-secondary); padding: 4px 12px; border-radius: 100px; font-size: 0.8rem; font-weight: 800; border: 1px solid var(--card-border); }

            .pc-guilds-grid-v2 { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; justify-content: center; max-width: 1400px; margin: 0 auto; }
            
            /* Card V2 */
            .pc-guild-card-v2 { 
                background: var(--card-bg); 
                backdrop-filter: blur(10px);
                border-radius: 14px; padding: 18px;
                border: 1px solid var(--card-border); 
                transition: 0.2s;
                cursor: pointer; display: flex; flex-direction: column; 
                position: relative; overflow: hidden;
            }
            .pc-guild-card-v2:hover { transform: translateY(-2px); border-color: var(--accent); background: var(--card-bg); }
            
            .card-top-v2 { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
            .guild-avatar-v2 { position: relative; width: 56px; height: 56px; }
            .guild-avatar-v2 img { width: 100%; height: 100%; border-radius: 14px; object-fit: cover; border: 1px solid var(--card-border); }
            .avatar-fallback { width: 100%; height: 100%; border-radius: 14px; background: var(--card-border); color: var(--text-secondary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; border: 1px solid var(--card-border); }
            .status-ring-v2 { position: absolute; bottom: -4px; right: -4px; width: 22px; height: 22px; border-radius: 50%; border: 4px solid var(--bg-primary); }
            .status-ring-v2.online { background: #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.5); }
            .status-ring-v2.offline { background: #64748b; }

            .tier-badges-v2 { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }
            .pc-badge-platinum { background: rgba(168, 85, 247, 0.1); color: #a855f7; padding: 6px 12px; border-radius: 100px; font-size: 0.65rem; font-weight: 900; border: 1px solid rgba(168, 85, 247, 0.2); display: flex; align-items: center; gap: 6px; }
            .pc-badge-premium { background: rgba(217, 119, 6, 0.1); color: #d97706; padding: 6px 12px; border-radius: 100px; font-size: 0.65rem; font-weight: 900; border: 1px solid rgba(217, 119, 6, 0.2); display: flex; align-items: center; gap: 6px; }

            .card-body-v2 h3 { margin: 0 0 8px; font-family: 'Outfit'; font-size: 1.15rem; font-weight: 800; color: var(--text-primary); letter-spacing: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .guild-meta-v2 { display: flex; justify-content: flex-start; align-items: center; margin-bottom: 18px; }
            .status-pill-v2 { font-size: 0.7rem; font-weight: 900; letter-spacing: 0; }
            .status-pill-v2.active { color: #10b981; }
            .status-pill-v2.missing { color: var(--text-secondary); }

            .card-footer-v2 { border-top: 1px solid var(--card-border); padding-top: 14px; display: flex; justify-content: space-between; align-items: center; }
            .action-text-v2 { font-size: 0.9rem; font-weight: 800; color: var(--text-secondary); transition: 0.3s; }
            .pc-guild-card-v2:hover .action-text-v2 { color: var(--text-primary); }
            .action-icon-v2 { width: 32px; height: 32px; border-radius: 10px; background: var(--card-bg); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); transition: 0.2s; }
            .pc-guild-card-v2:hover .action-icon-v2 { background: var(--accent); color: white; transform: translateX(5px); }

            /* Empty State */
            .pc-empty-selector-v2 { text-align: center; padding: 100px 40px; border-radius: 40px; border: 2px dashed var(--card-border); margin-top: 40px; }
            .empty-icon-v2 { width: 90px; height: 90px; background: var(--card-bg); color: var(--text-secondary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 32px; }
            .pc-empty-selector-v2 h3 { font-size: 1.8rem; font-weight: 800; margin-bottom: 12px; color: var(--text-primary); }
            .pc-empty-selector-v2 p { color: var(--text-secondary); margin-bottom: 40px; }
            .pc-btn-primary-v2 { background: var(--accent); color: white; border: none; padding: 18px 36px; border-radius: 18px; font-weight: 800; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
            .pc-btn-primary-v2:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(99, 102, 241, 0.3); }

        .lang-selector-container-p {
            position: relative;
        }
        .lang-dropdown-p {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--card-border);
            border-radius: 12px;
            padding: 6px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            min-width: 100px;
            z-index: 1100;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        }
        .lang-dropdown-item-p {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 0.8rem;
            font-weight: 700;
            text-align: left;
            cursor: pointer;
            transition: 0.2s;
            width: 100%;
        }
        .lang-dropdown-item-p:hover {
            background: rgba(255,255,255,0.05);
            color: var(--text-primary);
        }
        .lang-dropdown-item-p.active {
            background: var(--accent);
            color: white;
        }

            @media (max-width: 768px) {
                .pc-selector-wrapper { padding: 30px 20px; }
                .pc-selector-header-v2 { flex-direction: column; gap: 32px; align-items: stretch; text-align: center; }
                .portal-brand-v2 { flex-direction: column; gap: 16px; }
                .header-actions-v2 { justify-content: center; }
                .pc-controls-bar-v2 { flex-direction: column; align-items: stretch; }
                .pc-guilds-grid-v2 { grid-template-columns: 1fr; }
            }
        `}</style>
    </div>
  );
}
