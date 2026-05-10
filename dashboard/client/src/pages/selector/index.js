import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { 
  LogOut, 
  Search, 
  Server, 
  Shield, 
  ExternalLink, 
  Plus,
  LayoutGrid,
  Filter,
  CheckCircle2,
  Crown,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Zap,
  Layout,
  Globe,
  RefreshCw
} from 'lucide-react';

import LoadingScreen from '../../components/LoadingScreen';
import { useT } from '../../contexts/LanguageContext';

export default function Selector() {
  const { t } = useT();
  const { user, loading, logout, fetchUser } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, missing
  const [mounted, setMounted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
        await fetchUser();
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Lista server aggiornata!', type: 'success' } }));
    } catch (e) {
        console.error('Refresh failed:', e);
    } finally {
        setRefreshing(false);
    }
  };

  if (!mounted || (loading && !user)) return <LoadingScreen message={t('selector.loading')} />;
  if (!user) return null;

  // Filter logic
  const filteredGuilds = user.guilds
    .filter(g => (g.permissions & 0x8)) // Must be Admin
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
                <span className="guild-id-v2">ID: {guild.id}</span>
                <div className={`status-pill-v2 ${guild.botInGuild ? 'active' : 'missing'}`}>
                    {guild.botInGuild ? 'COLLEGATO' : 'NON PRESENTE'}
                </div>
            </div>
        </div>

        <div className="card-footer-v2">
            <span className="action-text-v2">
                {guild.botInGuild ? 'Gestisci Server' : 'Aggiungi al Server'}
            </span>
            <div className="action-icon-v2">
                <ArrowRight size={16} />
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pc-selector-wrapper fade-in">
        <header className="pc-selector-header-v2">
            <div className="portal-brand-v2">
                <div className="brand-logo-v2">
                    <img src="/logo.png" alt="Verix" />
                </div>
                <div className="brand-text-v2">
                    <span className="portal-tag-v2">VERIX PORTAL</span>
                    <h1>Seleziona un Server</h1>
                </div>
            </div>

            <div className="header-actions-v2">
                <div className="user-profile-mini-v2">
                    <img src={user?.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'} alt={user.username} />
                    <div className="user-info-v2">
                        <span className="u-name-v2">{user.username}</span>
                        <span className="u-status-v2">Amministratore</span>
                    </div>
                </div>
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
        </header>

        <div className="pc-selector-content-v2">
            <div className="pc-controls-bar-v2">
                <div className="pc-search-box-v2">
                    <Search className="search-icon" size={20} />
                    <input 
                      type="text" 
                      placeholder="Cerca tra i tuoi server..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="pc-filters-row-v2">
                    {[
                        { id: 'all', label: 'Tutti', icon: LayoutGrid },
                        { id: 'active', label: 'Attivi', icon: CheckCircle2 },
                        { id: 'missing', label: 'Da Aggiungere', icon: Plus }
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
                            <div className="title-icon-v2" style={{ background: '#ecfdf5', color: '#10b981' }}>
                                <Shield size={18} />
                            </div>
                            <h2>Server Attivi</h2>
                            <span className="count-pill-v2">{activeGuilds.length}</span>
                        </div>
                        <div className="pc-guilds-grid-v2">
                            {activeGuilds.map((g, i) => <GuildCard key={g.id} guild={g} index={i} />)}
                        </div>
                    </section>
                )}

                {pendingGuilds.length > 0 && (filter === 'all' || filter === 'missing') && (
                    <section className="guild-section-v2" style={{ marginTop: '48px' }}>
                        <div className="section-title-v2">
                            <div className="title-icon-v2" style={{ background: '#f9fafb', color: '#6b7280' }}>
                                <Globe size={18} />
                            </div>
                            <h2>Altri Server</h2>
                            <span className="count-pill-v2">{pendingGuilds.length}</span>
                        </div>
                        <div className="pc-guilds-grid-v2">
                            {pendingGuilds.map((g, i) => <GuildCard key={g.id} guild={g} index={activeGuilds.length + i} />)}
                        </div>
                    </section>
                )}

                {filteredGuilds.length === 0 && (
                    <div className="pc-empty-selector-v2">
                        <div className="empty-icon-v2"><Search size={48} /></div>
                        <h3>Nessun server trovato</h3>
                        <p>Prova a cambiare i filtri o la chiave di ricerca.</p>
                        <button className="pc-btn-primary" onClick={() => {setSearchTerm(''); setFilter('all');}}>
                            Resetta Filtri
                        </button>
                    </div>
                )}
            </div>
        </div>

        <style jsx global>{`
            .pc-selector-wrapper { min-height: 100vh; padding: 40px; background: var(--bg-main); font-family: 'Inter', sans-serif; }
            
            /* Header */
            .pc-selector-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 48px; max-width: 1400px; margin-left: auto; margin-right: auto; }
            .portal-brand-v2 { display: flex; align-items: center; gap: 24px; }
            .brand-logo-v2 { width: 56px; height: 56px; border-radius: 18px; background: var(--bg-card); padding: 8px; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
            .brand-logo-v2 img { width: 100%; height: 100%; border-radius: 10px; }
            .brand-text-v2 h1 { font-family: 'Inter', sans-serif; font-size: 1.8rem; font-weight: 800; margin: 0; color: var(--text-heading); letter-spacing: -0.03em; }
            .portal-tag-v2 { font-size: 0.65rem; font-weight: 800; color: var(--primary); letter-spacing: 2px; }

            .header-actions-v2 { display: flex; align-items: center; gap: 24px; }
            .user-profile-mini-v2 { display: flex; align-items: center; gap: 12px; background: var(--bg-card); padding: 8px 16px 8px 8px; border-radius: 100px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid var(--border); }
            .user-profile-mini-v2 img { width: 36px; height: 36px; border-radius: 50%; }
            .user-info-v2 { display: flex; flex-direction: column; }
            .u-name-v2 { font-size: 0.85rem; font-weight: 800; color: var(--text-heading); }
            .u-status-v2 { font-size: 0.65rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
            
            .pc-refresh-btn-v2 { width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--border); background: var(--bg-card); color: var(--primary); cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
            .pc-refresh-btn-v2:hover { background: var(--bg-badge); transform: scale(1.05); }
            .pc-refresh-btn-v2.spinning :global(svg) { animation: spin 1s linear infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

            .pc-logout-btn-v2 { width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--border); background: var(--bg-card); color: var(--error); cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
            .pc-logout-btn-v2:hover { background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); transform: scale(1.05); }

            /* Controls */
            .pc-controls-bar-v2 { max-width: 1400px; margin: 0 auto 48px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px; }
            .pc-search-box-v2 { flex: 1; min-width: 300px; position: relative; display: flex; align-items: center; background: var(--bg-card); border: 1.5px solid var(--border); border-radius: 20px; transition: 0.2s; padding: 0 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
            .pc-search-box-v2:focus-within { border-color: var(--primary); box-shadow: 0 10px 20px rgba(var(--primary-rgb), 0.1); }
            .pc-search-box-v2 input { width: 100%; background: transparent; border: none; padding: 18px 12px; font-weight: 700; color: var(--text-main); outline: none; font-size: 1rem; }
            .search-icon { color: var(--text-dim); }

            .pc-filters-row-v2 { display: flex; gap: 12px; background: var(--bg-card); padding: 8px; border-radius: 20px; border: 1.5px solid var(--border); }
            .filter-chip-v2 { display: flex; align-items: center; gap: 10px; padding: 10px 20px; border-radius: 14px; border: none; background: transparent; color: var(--text-muted); font-weight: 800; font-size: 0.85rem; cursor: pointer; transition: 0.2s; }
            .filter-chip-v2.active { background: var(--primary); color: white; box-shadow: 0 8px 16px rgba(var(--primary-rgb), 0.2); }

            /* Grid */
            .pc-guilds-sections-v2 { max-width: 1400px; margin: 0 auto; }
            .section-title-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
            .title-icon-v2 { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .section-title-v2 h2 { margin: 0; font-family: 'Inter'; font-size: 1.5rem; font-weight: 800; color: var(--text-heading); letter-spacing: -0.02em; }
            .count-pill-v2 { background: var(--bg-badge); color: var(--text-muted); padding: 4px 10px; border-radius: 100px; font-size: 0.75rem; font-weight: 800; }

            .pc-guilds-grid-v2 { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
            
            /* Guild Card V2 */
            .pc-guild-card-v2 { background: var(--bg-card); border-radius: 28px; padding: 24px; border: 1px solid var(--border); transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; display: flex; flex-direction: column; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
            .pc-guild-card-v2:hover { transform: translateY(-8px); border-color: var(--primary); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
            
            .card-top-v2 { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
            .guild-avatar-v2 { position: relative; width: 64px; height: 64px; }
            .guild-avatar-v2 img { width: 100%; height: 100%; border-radius: 20px; object-fit: cover; }
            .avatar-fallback { width: 100%; height: 100%; border-radius: 20px; background: var(--bg-badge); color: var(--text-dim); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.4rem; }
            .status-ring-v2 { position: absolute; bottom: -4px; right: -4px; width: 20px; height: 20px; border-radius: 50%; border: 4px solid var(--bg-card); }
            .status-ring-v2.online { background: var(--success); }
            .status-ring-v2.offline { background: var(--text-dim); }

            .tier-badges-v2 { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }
            .pc-badge-platinum { background: rgba(168, 85, 247, 0.1); color: #a855f7; padding: 4px 10px; border-radius: 8px; font-size: 0.6rem; font-weight: 800; border: 1px solid rgba(168, 85, 247, 0.2); display: flex; align-items: center; gap: 6px; }
            .pc-badge-premium { background: rgba(217, 119, 6, 0.1); color: #d97706; padding: 4px 10px; border-radius: 8px; font-size: 0.6rem; font-weight: 800; border: 1px solid rgba(217, 119, 6, 0.2); display: flex; align-items: center; gap: 6px; }

            .card-body-v2 h3 { margin: 0 0 8px; font-family: 'Inter'; font-size: 1.25rem; font-weight: 800; color: var(--text-heading); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.02em; }
            .guild-meta-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
            .guild-id-v2 { font-size: 0.75rem; font-weight: 700; color: var(--text-dim); }
            .status-pill-v2 { font-size: 0.65rem; font-weight: 800; letter-spacing: 0.5px; }
            .status-pill-v2.active { color: var(--success); }
            .status-pill-v2.missing { color: var(--text-dim); }

            .card-footer-v2 { border-top: 1px solid var(--border); padding-top: 20px; display: flex; justify-content: space-between; align-items: center; }
            .action-text-v2 { font-size: 0.85rem; font-weight: 800; color: var(--text-muted); }
            .pc-guild-card-v2.active .action-text-v2 { color: var(--primary); }
            .action-icon-v2 { width: 32px; height: 32px; border-radius: 50%; background: var(--bg-badge); display: flex; align-items: center; justify-content: center; color: var(--text-muted); transition: 0.2s; }
            .pc-guild-card-v2:hover .action-icon-v2 { background: var(--primary); color: white; transform: rotate(-45deg); }

            /* Empty State */
            .pc-empty-selector-v2 { text-align: center; padding: 80px; background: var(--bg-card); border-radius: 40px; border: 2px dashed var(--border); margin-top: 40px; }
            .empty-icon-v2 { width: 80px; height: 80px; background: var(--bg-badge); color: var(--text-dim); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
            .pc-empty-selector-v2 h3 { font-family: 'Inter'; font-size: 1.5rem; font-weight: 800; margin-bottom: 8px; color: var(--text-heading); }
            .pc-empty-selector-v2 p { color: var(--text-muted); margin-bottom: 32px; }

            .pc-btn-primary { background: var(--primary); color: white; border: none; padding: 16px 32px; border-radius: 16px; font-weight: 700; cursor: pointer; transition: 0.3s; }
            
            @media (max-width: 768px) {
                .pc-selector-wrapper { padding: 20px; }
                .pc-controls-bar-v2 { flex-direction: column; align-items: stretch; }
                .pc-guilds-grid-v2 { grid-template-columns: 1fr; }
            }
        `}</style>
    </div>
  );
}

