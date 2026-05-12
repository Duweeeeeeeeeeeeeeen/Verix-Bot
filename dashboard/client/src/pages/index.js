import { useAuth } from '../contexts/AuthContext';
import { useT } from '../contexts/LanguageContext';
import { Sun, Moon, ShieldCheck, Ticket, Mic2, Layout, Camera, Tv, LogIn, ExternalLink, ChevronRight, Shield, Zap, Rocket, PlusCircle, Bell, Settings2, Trash2, ShieldAlert, Bot, MessageCircle, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import LoadingScreen from '../components/LoadingScreen';

export default function Home() {
  const { user, login, loading } = useAuth();
  const { t, language, setLanguage } = useT();
  const router = useRouter();
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (user) router.push('/selector');
    const savedTheme = localStorage.getItem('verix-theme') || 'dark';
    setTheme(savedTheme);
  }, [user]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('verix-theme', newTheme);
  };

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
    <div className={`landing-page-p ${theme}-mode`}>
      {/* Navbar with Logo and Toggle */}
      <nav className="landing-nav-v2 glass-v2">
        <div className="nav-left">
            <div className="nav-logo-circle">
                <img src="/logo.png" alt="Verix" />
            </div>
            <span className="nav-brand outfit-font">VERIX</span>
        </div>
        <div className="nav-actions">
            <button className="lang-btn-v2" onClick={() => setLanguage(language === 'it' ? 'en' : 'it')}>
                <Globe size={18} />
                <span>{language.toUpperCase()}</span>
            </button>
            <button className="theme-btn" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={login} className="nav-login-btn">
                <LogIn size={18} /> {t('landing.cta_login')}
            </button>
        </div>
      </nav>
      {/* Background Orbs */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>

      {/* Hero Section */}
      <section className="landing-container-p">
        <div className="hero-grid-p">
          <div className="hero-content-p animate slide-in">
            <div className="step-badge premium-badge" style={{ marginBottom: '24px' }}>
              <Rocket size={14} style={{ marginRight: '8px' }} /> Verix Bot v2.0
            </div>
            <h1 className="hero-title">{t('landing.title')}</h1>
            <p className="hero-subtitle">
              {t('landing.subtitle')}
            </p>
            
            <div className="cta-group-p">
              <button onClick={login} className="btn-discord-p premium-glow">
                <LogIn size={20} /> {t('landing.cta_login')}
              </button>
              <a 
                href="https://discord.gg/Ck3rGpSV7U" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-invite-p secondary-glass"
              >
                <MessageCircle size={20} /> {t('landing.cta_invite')}
              </a>
            </div>

            <div className="hero-trust-bar">
              <div className="trust-item">
                <Shield size={20} className="trust-icon" />
                <span>{t('landing.security_admin')}</span>
              </div>
              <div className="trust-item">
                <Zap size={20} className="trust-icon" />
                <span>{t('landing.setup_instant')}</span>
              </div>
            </div>
          </div>

          <div className="hero-visual-p animate fadeIn">
            <div className="floating-elements">
                <div className="float-item f-1"><ShieldCheck size={24} /></div>
                <div className="float-item f-2"><Bell size={20} /></div>
                <div className="float-item f-3"><Zap size={22} /></div>
            </div>
            <div className="mockup-card-p glass-v2">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <div className="dot red"></div>
                  <div className="dot yellow"></div>
                  <div className="dot green"></div>
                </div>
                <div className="mockup-label">VERIX DASHBOARD STUDIO</div>
              </div>
              <div className="mockup-skeleton">
                <div className="skeleton-line full"></div>
                <div className="skeleton-line half"></div>
                <div className="skeleton-grid">
                  <div className="skeleton-box accent"></div>
                  <div className="skeleton-box"></div>
                  <div className="skeleton-box"></div>
                  <div className="skeleton-box success"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="landing-container-p features-section-p">
        <div className="section-header">
          <h2 className="section-title">{t('landing.features_title')}</h2>
          <p className="section-desc">
            {t('landing.features_subtitle')}
          </p>
        </div>

        <div className="features-grid-p">
          {features.map((f, i) => (
            <div key={i} className="feature-card-p-v2 animate slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-card-inner">
                <div className="feature-icon-wrapper">
                  <f.icon size={26} />
                </div>
                {f.isNew && <span className="badge-new-v2">{t('landing.new_badge')}</span>}
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* News Section */}
      <section className="landing-container-p news-section-p">
        <div className="news-header">
          <div className="news-title-group">
            <h2 className="section-title">{t('landing.news_title')}</h2>
            <p className="section-desc">{t('landing.news_subtitle')}</p>
          </div>
          <div className="update-badge">
            {t('landing.updated_at', { date: new Date().toLocaleDateString() })}
          </div>
        </div>

        <div className="news-grid-p">
          {news.map((item, i) => (
            <div key={i} className="news-card-p-v2 animate fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="news-tag" style={{ 
                  background: item.tag === 'MAJOR' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                  color: item.tag === 'MAJOR' ? '#ef4444' : 'var(--primary)'
              }}>{item.tag}</div>
              <span className="news-date">{item.date}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer-v2">
        <div className="footer-container">
            <div className="footer-brand">
                <img src="/logo.png" alt="Verix" className="footer-logo" />
                <span>Verix Bot</span>
            </div>
            
            <div className="footer-links">
                <Link href="/terms" className="footer-link-v2">{t('landing.terms')}</Link>
                <Link href="/privacy" className="footer-link-v2">{t('landing.privacy')}</Link>
            </div>

            <p className="footer-copy">
                {t('landing.copyright', { year: new Date().getFullYear() })}
            </p>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Inter:wght@400;600;800&display=swap');

        :root {
            --bg-primary: #02040a;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --card-bg: rgba(255,255,255,0.02);
            --card-border: rgba(255,255,255,0.05);
            --glass-bg: rgba(15, 23, 42, 0.6);
            --primary: #6366f1;
        }

        .light-mode {
            --bg-primary: #f8fafc;
            --text-primary: #0f172a;
            --text-secondary: #475569;
            --card-bg: #ffffff;
            --card-border: rgba(0,0,0,0.05);
            --glass-bg: rgba(255,255,255,0.8);
        }

        .landing-page-p { 
            position: relative;
            overflow-x: hidden;
            background: var(--bg-primary);
            color: var(--text-primary);
            font-family: 'Inter', sans-serif;
            transition: background 0.3s, color 0.3s;
        }

        .outfit-font { font-family: 'Outfit', sans-serif; }

        /* Navbar */
        .landing-nav-v2 {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: calc(100% - 40px);
            max-width: 1300px;
            z-index: 1000;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 24px;
            border-radius: 20px;
            border: 1px solid var(--card-border);
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
        }
        .nav-left { display: flex; align-items: center; gap: 12px; }
        .nav-logo-circle { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; border: 2px solid var(--primary); }
        .nav-logo-circle img { width: 100%; height: 100%; object-fit: cover; }
        .nav-brand { font-size: 1.2rem; font-weight: 800; letter-spacing: 1px; color: var(--text-primary); }
        
        .nav-actions { display: flex; align-items: center; gap: 16px; }
        
        .lang-btn-v2 {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            color: var(--text-primary);
            padding: 8px 16px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: 0.3s;
        }
        .lang-btn-v2:hover { background: rgba(255,255,255,0.05); border-color: var(--accent); }

        .theme-btn { background: var(--card-bg); border: 1px solid var(--card-border); color: var(--text-primary); width: 40px; height: 40px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
        .theme-btn:hover { background: var(--primary); color: #fff; transform: rotate(15deg); }
        .nav-login-btn { background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; }
        .nav-login-btn:hover { opacity: 0.9; transform: translateY(-2px); }

        /* Background Orbs */
        .bg-orb {
            position: fixed;
            border-radius: 50%;
            filter: blur(120px);
            z-index: 0;
            opacity: 0.15;
            pointer-events: none;
        }
        .orb-1 { width: 600px; height: 600px; background: #6366f1; top: -200px; right: -200px; animation: float 20s infinite alternate; }
        .orb-2 { width: 500px; height: 500px; background: #ec4899; bottom: -100px; left: -100px; animation: float 25s infinite alternate-reverse; }
        .orb-3 { width: 400px; height: 400px; background: #3b82f6; top: 30%; left: 10%; opacity: 0.1; }

        @keyframes float {
            0% { transform: translate(0, 0); }
            100% { transform: translate(100px, 50px); }
        }

        .landing-container-p { max-width: 1300px; margin: 0 auto; padding: 0 40px; position: relative; z-index: 1; }
        
        /* Hero */
        .hero-section-p { padding-top: 120px; }
        .hero-grid-p { display: grid; grid-template-columns: 1.2fr 1fr; gap: 60px; padding: 100px 0; align-items: center; }
        .hero-title { font-family: 'Outfit', sans-serif; font-size: 4rem; font-weight: 800; line-height: 1.1; margin-bottom: 24px; letter-spacing: -0.04em; color: var(--text-primary); }
        .light-mode .hero-title { background: linear-gradient(to bottom right, #0f172a 50%, #475569); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .dark-mode .hero-title { background: linear-gradient(to bottom right, #fff 50%, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        .hero-subtitle { font-size: 1.25rem; color: var(--text-secondary); line-height: 1.6; max-width: 540px; margin-bottom: 40px; }
        
        .cta-group-p { display: flex; gap: 20px; margin-bottom: 48px; }
        .btn-discord-p { background: #6366f1; color: white; padding: 16px 32px; border-radius: 16px; font-weight: 700; border: none; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3); }
        .btn-discord-p:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(99, 102, 241, 0.4); }
        
        .btn-invite-p { background: var(--card-bg); backdrop-filter: blur(10px); border: 1px solid var(--card-border); color: var(--text-primary); padding: 16px 32px; border-radius: 16px; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: 0.3s; }
        .btn-invite-p:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); transform: translateY(-3px); }

        .hero-trust-bar { display: flex; gap: 32px; }
        .trust-item { display: flex; align-items: center; gap: 10px; }
        .trust-icon { color: #6366f1; }
        .trust-item span { color: var(--text-secondary); font-size: 0.9rem; font-weight: 600; }

        /* Mockup */
        .hero-visual-p { position: relative; }
        .mockup-card-p { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--card-border); border-radius: 32px; padding: 32px; box-shadow: 0 50px 100px rgba(0,0,0,0.2); position: relative; z-index: 2; }
        .mockup-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 1px solid var(--card-border); }
        .mockup-dots { display: flex; gap: 8px; }
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .dot.red { background: #ff5f56; }
        .dot.yellow { background: #ffbd2e; }
        .dot.green { background: #27c93f; }
        .mockup-label { font-size: 0.7rem; font-weight: 800; color: var(--text-secondary); letter-spacing: 1px; }

        .skeleton-line { height: 10px; border-radius: 5px; background: var(--card-border); margin-bottom: 12px; }
        .skeleton-line.full { width: 100%; }
        .skeleton-line.half { width: 50%; margin-bottom: 32px; }
        .skeleton-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .skeleton-box { height: 80px; border-radius: 16px; background: var(--card-bg); border: 1px solid var(--card-border); }
        .skeleton-box.accent { background: rgba(99, 102, 241, 0.1); border-color: rgba(99, 102, 241, 0.2); }
        .skeleton-box.success { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.2); }

        .floating-elements { position: absolute; width: 100%; height: 100%; top: 0; left: 0; pointer-events: none; }
        .float-item { position: absolute; width: 50px; height: 50px; background: rgba(99, 102, 241, 0.2); backdrop-filter: blur(5px); border: 1px solid var(--card-border); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; z-index: 3; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .f-1 { top: -20px; right: 40px; animation: float-slow 4s infinite alternate; }
        .f-2 { bottom: 40px; left: -30px; animation: float-slow 5s infinite alternate-reverse; }
        .f-3 { top: 40%; right: -20px; animation: float-slow 3.5s infinite alternate; }

        @keyframes float-slow {
            from { transform: translateY(0) rotate(0deg); }
            to { transform: translateY(-20px) rotate(10deg); }
        }

        /* Features */
        .features-section-p { padding: 100px 40px; }
        .section-header { text-align: center; margin-bottom: 80px; }
        .section-title { font-family: 'Outfit', sans-serif; font-size: 3rem; font-weight: 800; margin-bottom: 16px; letter-spacing: -0.02em; color: var(--text-primary); }
        .section-desc { color: var(--text-secondary); font-size: 1.1rem; max-width: 800px; margin: 0 auto; line-height: 1.6; }

        .features-grid-p { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 32px; }
        .feature-card-p-v2 { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 24px; padding: 32px; transition: 0.3s; position: relative; overflow: hidden; }
        .feature-card-p-v2:hover { background: rgba(99, 102, 241, 0.03); border-color: #6366f1; transform: translateY(-10px); }
        .feature-icon-wrapper { width: 60px; height: 60px; border-radius: 18px; background: rgba(99, 102, 241, 0.1); color: #6366f1; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
        .feature-card-p-v2 h3 { font-family: 'Outfit', sans-serif; font-size: 1.4rem; font-weight: 700; margin-bottom: 12px; color: var(--text-primary); }
        .feature-card-p-v2 p { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; }
        .badge-new-v2 { position: absolute; top: 32px; right: 32px; background: #6366f1; color: white; padding: 4px 10px; border-radius: 100px; font-size: 0.65rem; font-weight: 900; }

        /* News */
        .news-section-p { padding: 80px 40px; background: rgba(99, 102, 241, 0.02); border-radius: 60px; margin-bottom: 100px; border: 1px solid var(--card-border); }
        .news-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px; }
        .update-badge { background: rgba(99, 102, 241, 0.1); color: #6366f1; padding: 10px 20px; border-radius: 100px; font-size: 0.85rem; font-weight: 700; }
        
        .news-grid-p { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .news-card-p-v2 { background: var(--glass-bg); border: 1px solid var(--card-border); padding: 32px; border-radius: 24px; }
        .news-tag { display: inline-block; padding: 4px 10px; border-radius: 8px; font-size: 0.65rem; font-weight: 900; margin-bottom: 16px; }
        .news-date { display: block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 8px; font-weight: 600; }
        .news-card-p-v2 h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 12px; color: var(--text-primary); }
        .news-card-p-v2 p { color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; }

        /* Footer */
        .footer-v2 { padding: 80px 40px; border-top: 1px solid var(--card-border); text-align: center; }
        .footer-brand { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 32px; }
        .footer-logo { width: 48px; height: 48px; border-radius: 50%; border: 2px solid #6366f1; }
        .footer-brand span { font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 800; color: var(--text-primary); }
        .footer-links { display: flex; justify-content: center; gap: 40px; margin-bottom: 32px; }
        .footer-link-v2 { color: var(--text-secondary); text-decoration: none; font-weight: 600; font-size: 0.95rem; transition: 0.2s; }
        .footer-link-v2:hover { color: #6366f1; }
        .footer-copy { color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; opacity: 0.8; }

        @media (max-width: 1100px) {
            .hero-grid-p { grid-template-columns: 1fr; text-align: center; gap: 80px; }
            .hero-subtitle { margin: 0 auto 40px; }
            .cta-group-p { justify-content: center; }
            .hero-trust-bar { justify-content: center; }
            .hero-title { font-size: 3rem; }
            .news-grid-p { grid-template-columns: 1fr; }
            .landing-nav-v2 { width: calc(100% - 20px); top: 10px; }
        }
      `}</style>
    </div>
  );
}
