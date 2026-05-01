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
  Rocket
} from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

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
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }}></div>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>VERIX DASHBOARD PREVIEW</div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '30%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                <div style={{ width: '60%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ height: '60px', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '12px', border: '1px solid rgba(129, 140, 248, 0.2)' }}></div>
                <div style={{ height: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}></div>
                <div style={{ height: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}></div>
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
              <div className="feature-icon-p">
                <f.icon size={24} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer / Final CTA */}
      <footer className="landing-container-p" style={{ padding: '80px 0', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
          <img src="/logo.png" alt="Verix" style={{ width: '40px' }} />
          <span style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--text-main)' }}>Verix Bot</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} Verix Team. Gestisci il tuo server con stile.
        </p>
      </footer>
    </div>
  );
}
