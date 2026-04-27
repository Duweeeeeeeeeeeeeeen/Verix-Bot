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
  CheckCircle2
} from 'lucide-react';

import LoadingScreen from '../../components/LoadingScreen';

export default function Selector() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, missing

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading]);

  if (loading || !user) return <LoadingScreen message="Caricamento dei tuoi server..." />;

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
    
    return (
      <div 
        className={`guild-card-p animate slide-in ${guild.botInGuild ? 'active-guild' : ''}`} 
        style={{ animationDelay: `${index * 0.05}s` }}
        onClick={() => {
          if (guild.botInGuild) {
            router.push(`/config/${guild.id}`);
          } else {
            window.open(guild.inviteUrl, '_blank');
          }
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="guild-icon-wrapper-p">
            {guild.icon ? (
              <img 
                src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} 
                alt={guild.name} 
                className="guild-icon-p"
              />
            ) : (
              <div className="guild-icon-fallback-p">{initials}</div>
            )}
          </div>
          
          <div className={`bot-status-badge-p ${guild.botInGuild ? 'active' : 'missing'}`}>
            <div className={`status-dot-s ${guild.botInGuild ? 'active' : 'missing'}`}></div>
            {guild.botInGuild ? 'Attivo' : 'Mancante'}
          </div>
        </div>

        <div style={{ flex: 1, marginTop: '8px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', marginBottom: '4px' }}>{guild.name}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>ID: {guild.id}</p>
        </div>

        <div style={{ 
          marginTop: 'auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255,255,255,0.05)'
        }}>
          <span style={{ 
            fontSize: '0.8rem', 
            fontWeight: '800', 
            color: guild.botInGuild ? 'var(--primary)' : 'var(--text-dim)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {guild.botInGuild ? 'Gestisci' : 'Configura'}
            <Plus size={12} />
          </span>
          <ExternalLink size={14} color="var(--text-muted)" opacity={0.5} />
        </div>
      </div>
    );
  };

  return (
    <div className="selector-page-p">
      <div className="landing-container-p">
        <header className="selector-header-p animate slide-up">
          <div className="logo-container-p">
            <img src="/logo.png" alt="Verix Logo" className="logo-img-p" />
            <div>
              <span className="portal-subtitle-p">Verix Portal</span>
              <h1 className="portal-title-p">Seleziona un Server</h1>
            </div>
          </div>
          
          <button onClick={logout} className="btn-outline-p" style={{ padding: '12px 24px' }}>
            <LogOut size={18} /> Esci
          </button>
        </header>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', marginBottom: '40px' }}>
          <div className="search-wrapper-p" style={{ flex: 1, marginBottom: 0 }}>
            <Search className="search-icon-p" size={20} />
            <input 
              type="text" 
              placeholder="Cerca tra i tuoi server..." 
              className="search-input-p" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group-p" style={{ marginBottom: 0 }}>
            {[
              { id: 'all', label: 'Tutti', icon: Filter },
              { id: 'active', label: 'Attivi', icon: CheckCircle2 },
              { id: 'missing', label: 'Da Invitare', icon: Plus }
            ].map((f) => (
              <button 
                key={f.id}
                className={`filter-chip-p ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                <f.icon size={14} style={{ marginRight: '8px', display: 'inline' }} />
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
          {/* Active Servers Section */}
          {(filter === 'all' || filter === 'active') && activeGuilds.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', color: 'var(--success)' }}>
                  <Shield size={20} />
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '850', color: 'white' }}>I Tuoi Regni Attivi</h2>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(255,255,255,0.1), transparent)' }}></div>
              </div>
              <div className="selector-grid-p" style={{ marginTop: 0 }}>
                {activeGuilds.map((guild, i) => (
                  <GuildCard key={guild.id} guild={guild} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* Pending Servers Section */}
          {(filter === 'all' || filter === 'missing') && pendingGuilds.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', color: 'var(--text-muted)' }}>
                  <Server size={20} />
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '850', color: 'var(--text-muted)' }}>Configura Nuovi Server</h2>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(255,255,255,0.05), transparent)' }}></div>
              </div>
              <div className="selector-grid-p" style={{ marginTop: 0 }}>
                {pendingGuilds.map((guild, i) => (
                  <GuildCard key={guild.id} guild={guild} index={activeGuilds.length + i} />
                ))}
              </div>
            </section>
          )}
        </div>

        {filteredGuilds.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '100px 0', 
            background: 'rgba(255,255,255,0.02)', 
            borderRadius: '24px',
            border: '1px dashed var(--border)',
            marginTop: '40px'
          }}>
            <Search size={48} color="var(--text-muted)" style={{ marginBottom: '20px', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '8px' }}>Nessun server trovato</h3>
            <p style={{ color: 'var(--text-muted)' }}>Prova a cambiare i filtri o il termine di ricerca.</p>
          </div>
        )}
      </div>
    </div>
  );
}
