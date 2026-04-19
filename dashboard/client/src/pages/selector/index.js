import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { LogOut, Search, Server, Shield, ExternalLink } from 'lucide-react';

export default function Selector() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading]);

  if (loading || !user) return <div className="loading-screen">Caricamento portale...</div>;

  // Filter and split guilds
  const filteredGuilds = user.guilds
    .filter(g => (g.permissions & 0x8))
    .filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const activeGuilds = filteredGuilds.filter(g => g.botInGuild);
  const pendingGuilds = filteredGuilds.filter(g => !g.botInGuild);

  const GuildCard = ({ guild, index }) => (
    <div 
      className="card glass animate" 
      onClick={() => {
          if (guild.botInGuild) {
              router.push(`/config/${guild.id}`);
          } else {
              window.open(guild.inviteUrl, '_blank');
          }
      }}
      style={{ 
          cursor: 'pointer', 
          padding: '30px',
          animationDelay: `${index * 0.05}s`,
          opacity: guild.botInGuild ? 1 : 0.8
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ position: 'relative' }}>
              {guild.icon ? (
              <img 
                  src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} 
                  alt={guild.name} 
                  style={{ width: '80px', height: '80px', borderRadius: '24px', boxShadow: '0 8px 16px rgba(0,0,0,0.4)', filter: guild.botInGuild ? 'none' : 'grayscale(1)' }} 
              />
              ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                  <Server size={40} color="var(--text-muted)" />
              </div>
              )}
              <div style={{ 
                  position: 'absolute', 
                  bottom: '-4px', 
                  right: '-4px', 
                  width: '24px', 
                  height: '24px', 
                  background: guild.botInGuild ? 'var(--primary)' : 'var(--text-dim)', 
                  borderRadius: '50%', 
                  border: '4px solid var(--sidebar-bg)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
              }}>
                  <Shield size={12} color="white" />
              </div>
          </div>
          
          <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '6px', color: 'white' }}>{guild.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {guild.botInGuild ? (
                      <span className="badge badge-success">Attivo</span>
                  ) : (
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Non Attivo</span>
                  )}
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Admin</span>
              </div>
          </div>
      </div>

      <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: guild.botInGuild ? 'var(--primary)' : 'var(--accent)', fontWeight: '700' }}>
              {guild.botInGuild ? 'Gestisci Server' : 'Invita Verix'}
          </span>
          <ExternalLink size={16} color={guild.botInGuild ? 'var(--primary)' : 'var(--accent)'} />
      </div>
    </div>
  );

  return (
    <div className="animate" style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '60px' }}>
        <div>
           <h1 style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '10px', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
             Selettore Server
           </h1>
           <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Pannello Amministrativo Elite RP</p>
        </div>
        <button onClick={logout} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
           <LogOut size={18} /> Disconnetti
        </button>
      </header>

      <div style={{ position: 'relative', marginBottom: '48px', maxWidth: '600px' }}>
         <Search style={{ position: 'absolute', left: '20px', top: '16px', color: 'var(--text-muted)' }} size={20} />
         <input 
            type="text" 
            placeholder="Filtra i tuoi regni..." 
            className="input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '56px', fontSize: '1.1rem', height: '54px' }} 
         />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
        {/* SECTION: ACTIVE GUILDS */}
        {activeGuilds.length > 0 && (
            <section>
                <div className="align-center" style={{ gap: '12px', marginBottom: '32px' }}>
                    <div style={{ padding: '8px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '10px', color: 'var(--primary)', display: 'flex' }}>
                        <Shield size={20} />
                    </div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: '850', color: 'white' }}>I Tuoi Regni</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '30px' }}>
                    {activeGuilds.map((guild, i) => <GuildCard key={guild.id} guild={guild} index={i} />)}
                </div>
            </section>
        )}

        {/* SECTION: PENDING GUILDS */}
        {pendingGuilds.length > 0 && (
            <section>
                <div className="align-center" style={{ gap: '12px', marginBottom: '32px' }}>
                    <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', color: 'var(--text-muted)', display: 'flex' }}>
                        <Server size={20} />
                    </div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: '850', color: 'var(--text-muted)' }}>Espandi la Tua Influenza</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '30px' }}>
                    {pendingGuilds.map((guild, i) => (
                        <GuildCard key={guild.id} guild={guild} index={activeGuilds.length + i} />
                    ))}
                </div>
            </section>
        )}

        {filteredGuilds.length === 0 && (
            <div className="card glass" style={{ textAlign: 'center', padding: '80px' }}>
                <Shield size={64} color="var(--border)" style={{ marginBottom: '20px' }} />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Nessun Server Trovato</h3>
                <p style={{ color: 'var(--text-muted)' }}>Non sei amministratore in alcun server corrispondente alla ricerca.</p>
            </div>
        )}
      </div>

      <style jsx>{`
        .loading-screen {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary);
        }
      `}</style>
    </div>
  );
}
