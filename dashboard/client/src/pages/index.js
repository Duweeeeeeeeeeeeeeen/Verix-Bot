import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldCheck, 
  Ticket, 
  Mic2, 
  Layout, 
  Camera, 
  Tv,
  LogIn,
  ExternalLink,
  ChevronRight,
  Shield,
  Zap,
  Rocket,
  PlusCircle,
  Bell,
  Settings2,
  Trash2,
  ShieldAlert,
  Bot
} from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import LoadingScreen from '../components/LoadingScreen';

export default function Home() {
  const { user, login, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/selector');
  }, [user]);

  const features = [
    { 
      icon: ShieldCheck, 
      title: 'Whitelist Intelligente', 
      desc: 'Gestisci gli accessi al tuo server con criteri personalizzati e automazione completa.' 
    },
    { 
      icon: Ticket, 
      title: 'Ticket System Avanzato', 
      desc: 'Supporto professionale per i tuoi utenti con categorie, log e trascrizioni automatiche.' 
    },
    { 
      icon: Mic2, 
      title: 'Voice Queue Automatica', 
      desc: 'Crea e gestisci canali vocali temporanei per mantenere il server pulito e organizzato.' 
    },
    { 
      icon: Layout, 
      title: 'Dashboard Web Premium', 
      desc: 'Controlla ogni aspetto del bot da un\'interfaccia web moderna, veloce e intuitiva.' 
    },
    { 
      icon: Camera, 
      title: 'Contest System', 
      desc: 'Organizza concorsi fotografici e contest con votazioni integrate direttamente su Discord.' 
    },
    { 
      icon: Tv, 
      title: 'Twitch Live Alerts', 
      desc: 'Notifiche istantanee quando i tuoi streamer preferiti vanno in diretta, con embed eleganti.' 
    },
    {
      icon: Trash2,
      title: 'AutoClear Advanced',
      desc: 'Mantieni puliti i tuoi canali eliminando automaticamente i messaggi vecchi o di sistema.',
      isNew: true
    },
    {
      icon: ShieldAlert,
      title: 'Sistema Moderazione',
      desc: 'Proteggi il tuo server con filtri anti-spam, blacklist di parole e log dettagliati.',
      isNew: true
    },
    {
      icon: Bot,
      title: 'True White-Label',
      desc: 'Gestisci il tuo bot privato con token personalizzato, nome e attività dedicate (Esclusivo Platinum).',
      isNew: true
    },
    {
      icon: Settings2,
      title: 'Configurazioni Globali',
      desc: 'Sincronizza le impostazioni tra più server per una gestione centralizzata e veloce.',
      isNew: true
    }
  ];

  const news = [
    {
      title: 'Lancio Verix v2.0',
      date: 'Oggi',
      desc: 'Nuova interfaccia web, velocità raddoppiata e supporto multi-lingua completo.',
      tag: 'MAJOR'
    },
    {
      title: 'Modulo Photo Contest',
      date: 'Ieri',
      desc: 'Ora puoi gestire concorsi fotografici automatizzati con votazioni dei membri.',
      tag: 'HOT'
    },
    {
      title: 'White-Label Branding',
      date: '2 giorni fa',
      desc: 'Personalizza il bot con il tuo logo e nome (esclusivo Platinum).',
      tag: 'PREMIUM'
    }
  ];

  if (loading || user) return <LoadingScreen message="Sincronizzazione account..." />;

  return (
    <div className="landing-page-p">
      {/* Hero Section */}
      <section className="landing-container-p">
        <div className="hero-grid-p">
          <div className="hero-content-p animate slide-in">
            <div className="step-badge" style={{ marginBottom: '24px' }}>
              <Rocket size={14} style={{ marginRight: '8px' }} /> Verix Bot v2.0
            </div>
            <h1 style={{ color: 'var(--text-main)' }}>Gestisci il tuo server Discord come un professionista</h1>
            <p>
              Whitelist, Ticket, Voice, Verify, Contest e molto altro — tutto racchiuso in una dashboard moderna e ultra-veloce.
            </p>
            
            <div className="cta-group-p" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <button onClick={login} className="btn-discord-p">
                <LogIn size={20} /> Accedi con Discord
              </button>
              <a 
                href={`https://discord.com/oauth2/authorize?client_id=1493270512195862538&permissions=8&scope=bot%20applications.commands`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-invite-p"
              >
                <ExternalLink size={20} /> Invita il Bot
              </a>
            </div>

            <div style={{ marginTop: '48px', display: 'flex', gap: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={20} style={{ color: 'var(--primary)' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>Sicurezza Admin</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Zap size={20} style={{ color: 'var(--primary)' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>Setup Istantaneo</span>
              </div>
            </div>
          </div>

          <div className="hero-visual-p animate fadeIn">
            <div className="mockup-card-p">
              {/* Mockup Content */}
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }}></div>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>VERIX DASHBOARD PREVIEW</div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '30%', height: '8px', background: 'var(--border)', borderRadius: '4px' }}></div>
                <div style={{ width: '60%', height: '8px', background: 'var(--bg-badge)', borderRadius: '4px' }}></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ height: '60px', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '12px', border: '1px solid rgba(129, 140, 248, 0.2)' }}></div>
                <div style={{ height: '60px', background: 'var(--bg-badge)', borderRadius: '12px', border: '1px solid var(--border)' }}></div>
                <div style={{ height: '60px', background: 'var(--bg-badge)', borderRadius: '12px', border: '1px solid var(--border)' }}></div>
                <div style={{ height: '60px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="landing-container-p features-section-p">
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--text-main)' }}>Tutto quello che ti serve in un unico posto</h2>
          <p style={{ color: 'var(--text-dim)', maxWidth: '600px', margin: '0 auto' }}>
            Dimentica i bot frammentati. Verix consolida le funzionalità più richieste in un'unica piattaforma potente e facile da usare.
          </p>
        </div>

        <div className="features-grid-p">
          {features.map((f, i) => (
            <div key={i} className="feature-card-p animate slide-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="feature-icon-p">
                  <f.icon size={24} />
                </div>
                {f.isNew && <span className="badge-new-p">NUOVO</span>}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* News Section */}
      <section className="landing-container-p news-section-p">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '8px' }}>Ultime Novità</h2>
            <p style={{ color: 'var(--text-dim)' }}>Scopri cosa abbiamo aggiunto di recente al progetto.</p>
          </div>
          <div className="step-badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
            Aggiornato al {new Date().toLocaleDateString()}
          </div>
        </div>

        <div className="news-grid-p">
          {news.map((item, i) => (
            <div key={i} className="news-card-p animate fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="news-date-p">{item.date}</span>
                <span style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: '900', 
                  padding: '4px 8px', 
                  borderRadius: '6px',
                  background: item.tag === 'MAJOR' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                  color: item.tag === 'MAJOR' ? '#ef4444' : 'var(--primary)',
                  border: `1px solid ${item.tag === 'MAJOR' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`
                }}>{item.tag}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem' }}>{item.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-container-p" style={{ padding: '80px 0', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
          <img src="/logo.png" alt="Verix" style={{ width: '40px' }} />
          <span style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--text-main)' }}>Verix Bot</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '24px' }}>
          <Link href="/terms" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: '600' }} className="footer-link">
            Termini di Servizio
          </Link>
          <Link href="/privacy" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: '600' }} className="footer-link">
            Privacy Policy
          </Link>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          &copy; {new Date().getFullYear()} Verix Team. Gestisci il tuo server con stile.
        </p>

        <style jsx>{`
          .footer-link:hover { color: var(--primary) !important; }
        `}</style>
      </footer>
    </div>
  );
}
