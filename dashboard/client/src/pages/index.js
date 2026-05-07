import { useAuth } from '../contexts/AuthContext';
import { useT } from '../contexts/LanguageContext';
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
  const { t } = useT();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/selector');
  }, [user]);

  const features = [
    { 
      icon: ShieldCheck, 
      title: t('landing.feat_whitelist_title'), 
      desc: t('landing.feat_whitelist_desc') 
    },
    { 
      icon: Ticket, 
      title: t('landing.feat_tickets_title'), 
      desc: t('landing.feat_tickets_desc') 
    },
    { 
      icon: Mic2, 
      title: t('landing.feat_voice_title'), 
      desc: t('landing.feat_voice_desc') 
    },
    { 
      icon: Layout, 
      title: t('landing.feat_dashboard_title'), 
      desc: t('landing.feat_dashboard_desc') 
    },
    { 
      icon: Camera, 
      title: t('landing.feat_contest_title'), 
      desc: t('landing.feat_contest_desc') 
    },
    { 
      icon: Tv, 
      title: t('landing.feat_socials_title'), 
      desc: t('landing.feat_socials_desc') 
    },
    {
      icon: Trash2,
      title: t('landing.feat_autoclear_title'),
      desc: t('landing.feat_autoclear_desc'),
      isNew: true
    },
    {
      icon: ShieldAlert,
      title: t('landing.feat_moderation_title'),
      desc: t('landing.feat_moderation_desc'),
      isNew: true
    },
    {
      icon: Bot,
      title: t('landing.feat_whitelabel_title'),
      desc: t('landing.feat_whitelabel_desc'),
      isNew: true
    },
    {
      icon: Settings2,
      title: t('landing.feat_global_title'),
      desc: t('landing.feat_global_desc'),
      isNew: true
    }
  ];

  const news = [
    {
      title: t('landing.news_v2_title'),
      date: t('landing.news_date_today'),
      desc: t('landing.news_v2_desc'),
      tag: 'MAJOR'
    },
    {
      title: t('landing.news_contest_title'),
      date: t('landing.news_date_yesterday'),
      desc: t('landing.news_contest_desc'),
      tag: 'HOT'
    },
    {
      title: t('landing.news_premium_title'),
      date: t('landing.news_date_2days'),
      desc: t('landing.news_premium_desc'),
      tag: 'PREMIUM'
    }
  ];

  if (loading || user) return <LoadingScreen message={t('landing.syncing')} />;

  return (
    <div className="landing-page-p">
      {/* Hero Section */}
      <section className="landing-container-p">
        <div className="hero-grid-p">
          <div className="hero-content-p animate slide-in">
            <div className="step-badge" style={{ marginBottom: '24px' }}>
              <Rocket size={14} style={{ marginRight: '8px' }} /> Verix Bot v2.0
            </div>
            <h1 style={{ color: 'var(--text-main)' }}>{t('landing.title')}</h1>
            <p>
              {t('landing.subtitle')}
            </p>
            
            <div className="cta-group-p" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <button onClick={login} className="btn-discord-p">
                <LogIn size={20} /> {t('landing.cta_login')}
              </button>
              <a 
                href={`https://discord.com/oauth2/authorize?client_id=1493270512195862538&permissions=8&scope=bot%20applications.commands`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-invite-p"
              >
                <ExternalLink size={20} /> {t('landing.cta_invite')}
              </a>
            </div>

            <div style={{ marginTop: '48px', display: 'flex', gap: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={20} style={{ color: 'var(--primary)' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>{t('landing.security_admin')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Zap size={20} style={{ color: 'var(--primary)' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>{t('landing.setup_instant')}</span>
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
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--text-main)' }}>{t('landing.features_title')}</h2>
          <p style={{ color: 'var(--text-dim)', maxWidth: '600px', margin: '0 auto' }}>
            {t('landing.features_subtitle')}
          </p>
        </div>

        <div className="features-grid-p">
          {features.map((f, i) => (
            <div key={i} className="feature-card-p animate slide-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="feature-icon-p">
                  <f.icon size={24} />
                </div>
                {f.isNew && <span className="badge-new-p">{t('landing.new_badge')}</span>}
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
            <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '8px' }}>{t('landing.news_title')}</h2>
            <p style={{ color: 'var(--text-dim)' }}>{t('landing.news_subtitle')}</p>
          </div>
          <div className="step-badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
            {t('landing.updated_at', { date: new Date().toLocaleDateString() })}
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
          <img src="/logo.png" alt="Verix" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
          <span style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--text-main)' }}>Verix Bot</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '24px' }}>
          <Link href="/terms" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: '600' }} className="footer-link">
            {t('landing.terms')}
          </Link>
          <Link href="/privacy" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: '600' }} className="footer-link">
            {t('landing.privacy')}
          </Link>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {t('landing.copyright', { year: new Date().getFullYear() })}
        </p>

        <style jsx>{`
          .footer-link:hover { color: var(--primary) !important; }
        `}</style>
      </footer>
    </div>
  );
}
