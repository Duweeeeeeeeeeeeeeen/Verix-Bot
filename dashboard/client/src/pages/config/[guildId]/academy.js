import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useT } from '../../../contexts/LanguageContext';
import { 
  BookOpen, 
  Shield, 
  UserPlus, 
  MousePointer2, 
  Gavel, 
  Gift, 
  ListChecks, 
  Ticket, 
  Mic2, 
  Layout, 
  Cpu, 
  Globe, 
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle2,
  Zap,
  Target,
  Rocket,
  ShieldCheck,
  MessageSquare,
  Activity,
  ArrowRight,
  Trophy
} from 'lucide-react';

export default function AcademyPage() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [activeModule, setActiveModule] = useState('global');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const modules = [
    { 
      id: 'global', 
      icon: <Target size={20} />, 
      title: t('sidebar.group_system'), 
      color: '#6366f1',
      desc: t('academy_page.module_global_desc'),
      features: [
        { title: t('academy_page.module_global_f1_title'), text: t('academy_page.module_global_f1_text') },
        { title: t('academy_page.module_global_f2_title'), text: t('academy_page.module_global_f2_text') },
        { title: t('academy_page.module_global_f3_title'), text: t('academy_page.module_global_f3_text') }
      ]
    },
    { 
      id: 'moderation', 
      icon: <Shield size={20} />, 
      title: t('sidebar.moderation'), 
      color: '#ef4444',
      desc: t('academy_page.module_moderation_desc'),
      features: [
        { title: t('academy_page.module_moderation_f1_title'), text: t('academy_page.module_moderation_f1_text') },
        { title: t('academy_page.module_moderation_f2_title'), text: t('academy_page.module_moderation_f2_text') },
        { title: t('academy_page.module_moderation_f3_title'), text: t('academy_page.module_moderation_f3_text') }
      ]
    },
    { 
      id: 'verify', 
      icon: <CheckCircle2 size={20} />, 
      title: t('sidebar.verify'), 
      color: '#10b981',
      desc: t('academy_page.module_verify_desc'),
      features: [
        { title: t('academy_page.module_verify_f1_title'), text: t('academy_page.module_verify_f1_text') },
        { title: t('academy_page.module_verify_f2_title'), text: t('academy_page.module_verify_f2_text') },
        { title: t('academy_page.module_verify_f3_title'), text: t('academy_page.module_verify_f3_text') }
      ]
    },
    { 
      id: 'tickets', 
      icon: <Ticket size={20} />, 
      title: t('sidebar.tickets'), 
      color: '#f59e0b',
      desc: t('academy_page.module_tickets_desc'),
      features: [
        { title: t('academy_page.module_tickets_f1_title'), text: t('academy_page.module_tickets_f1_text') },
        { title: t('academy_page.module_tickets_f2_title'), text: t('academy_page.module_tickets_f2_text') },
        { title: t('academy_page.module_tickets_f3_title'), text: t('academy_page.module_tickets_f3_text') }
      ]
    },
    { 
      id: 'embeds', 
      icon: <Layout size={20} />, 
      title: t('sidebar.embeds'), 
      color: '#8b5cf6',
      desc: t('academy_page.module_embeds_desc'),
      features: [
        { title: t('academy_page.module_embeds_f1_title'), text: t('academy_page.module_embeds_f1_text') },
        { title: t('academy_page.module_embeds_f2_title'), text: t('academy_page.module_embeds_f2_text') },
        { title: t('academy_page.module_embeds_f3_title'), text: t('academy_page.module_embeds_f3_text') }
      ]
    },
    { 
      id: 'automations', 
      icon: <Cpu size={20} />, 
      title: t('sidebar.automations'), 
      color: '#3b82f6',
      desc: t('academy_page.module_automations_desc'),
      features: [
        { title: t('academy_page.module_automations_f1_title'), text: t('academy_page.module_automations_f1_text') },
        { title: t('academy_page.module_automations_f2_title'), text: t('academy_page.module_automations_f2_text') },
        { title: t('academy_page.module_automations_f3_title'), text: t('academy_page.module_automations_f3_text') }
      ]
    },
    { 
      id: 'whitelist', 
      icon: <ShieldCheck size={20} />, 
      title: t('sidebar.whitelist'), 
      color: '#f43f5e',
      desc: t('academy_page.module_whitelist_desc'),
      features: [
        { title: t('academy_page.module_whitelist_f1_title'), text: t('academy_page.module_whitelist_f1_text') },
        { title: t('academy_page.module_whitelist_f2_title'), text: t('academy_page.module_whitelist_f2_text') },
        { title: t('academy_page.module_whitelist_f3_title'), text: t('academy_page.module_whitelist_f3_text') }
      ]
    },
    { 
      id: 'socials', 
      icon: <Globe size={20} />, 
      title: t('sidebar.socials'), 
      color: '#a855f7',
      desc: t('academy_page.module_socials_desc'),
      features: [
        { title: t('academy_page.module_socials_f1_title'), text: t('academy_page.module_socials_f1_text') },
        { title: t('academy_page.module_socials_f2_title'), text: t('academy_page.module_socials_f2_text') },
        { title: t('academy_page.module_socials_f3_title'), text: t('academy_page.module_socials_f3_text') }
      ]
    },
    { 
      id: 'giveaway', 
      icon: <Gift size={20} />, 
      title: t('sidebar.giveaway'), 
      color: '#ec4899',
      desc: t('academy_page.module_giveaway_desc'),
      features: [
        { title: t('academy_page.module_giveaway_f1_title'), text: t('academy_page.module_giveaway_f1_text') },
        { title: t('academy_page.module_giveaway_f2_title'), text: t('academy_page.module_giveaway_f2_text') },
        { title: t('academy_page.module_giveaway_f3_title'), text: t('academy_page.module_giveaway_f3_text') }
      ]
    },
    { 
      id: 'reactionroles', 
      icon: <MousePointer2 size={20} />, 
      title: t('sidebar.reactionroles'), 
      color: '#06b6d4',
      desc: t('academy_page.module_reactionroles_desc'),
      features: [
        { title: t('academy_page.module_reactionroles_f1_title'), text: t('academy_page.module_reactionroles_f1_text') },
        { title: t('academy_page.module_reactionroles_f2_title'), text: t('academy_page.module_reactionroles_f2_text') },
        { title: t('academy_page.module_reactionroles_f3_title'), text: t('academy_page.module_reactionroles_f3_text') }
      ]
    },
    { 
      id: 'voice', 
      icon: <Mic2 size={20} />, 
      title: t('sidebar.voice_interviste'), 
      color: '#fbbf24',
      desc: t('academy_page.module_voice_desc'),
      features: [
        { title: t('academy_page.module_voice_f1_title'), text: t('academy_page.module_voice_f1_text') },
        { title: t('academy_page.module_voice_f2_title'), text: t('academy_page.module_voice_f2_text') },
        { title: t('academy_page.module_voice_f3_title'), text: t('academy_page.module_voice_f3_text') }
      ]
    },
    { 
      id: 'white-label', 
      icon: <Sparkles size={20} />, 
      title: t('sidebar.branding'), 
      color: '#a855f7',
      desc: t('academy_page.module_branding_desc'),
      features: [
        { title: t('academy_page.module_branding_f1_title'), text: t('academy_page.module_branding_f1_text') },
        { title: t('academy_page.module_branding_f2_title'), text: t('academy_page.module_branding_f2_text') },
        { title: t('academy_page.module_branding_f3_title'), text: t('academy_page.module_branding_f3_text') }
      ]
    },
    { 
      id: 'leveling', 
      icon: <Trophy size={20} />, 
      title: t('sidebar.leveling'), 
      color: '#f59e0b',
      desc: t('academy_page.module_leveling_desc'),
      features: [
        { title: t('academy_page.module_leveling_f1_title'), text: t('academy_page.module_leveling_f1_text') },
        { title: t('academy_page.module_leveling_f2_title'), text: t('academy_page.module_leveling_f2_text') },
        { title: t('academy_page.module_leveling_f3_title'), text: t('academy_page.module_leveling_f3_text') }
      ]
    }
  ];

  const currentModule = modules.find(m => m.id === activeModule) || modules[0];

  return (
    <div className="academy-wrapper fade-in">
      <Head>
        <title>Verix Academy | Impara a configurare il tuo server</title>
      </Head>

      {/* Hero Section */}
      <section className="academy-hero">
        <div className="hero-content">
          <div className="badge-premium">
            <Sparkles size={14} />
            <span>Verix Academy</span>
          </div>
          <h1>{t('academy_page.hero_title')}</h1>
          <p>{t('academy_page.hero_subtitle')}</p>
        </div>
        <div className="hero-visual">
          <div className="floating-card c1"><Shield size={32} /></div>
          <div className="floating-card c2"><Rocket size={32} /></div>
          <div className="floating-card c3"><Zap size={32} /></div>
        </div>
      </section>

      <div className="academy-layout">
        {/* Module Sidebar */}
        <aside className="module-nav">
          <h3>{t('academy_page.modules_available')}</h3>
          <div className="nav-list">
            {modules.map(m => (
              <button 
                key={m.id} 
                className={`nav-item ${activeModule === m.id ? 'active' : ''}`}
                onClick={() => setActiveModule(m.id)}
                style={{ '--accent': m.color }}
              >
                <div className="item-icon">{m.icon}</div>
                <span>{m.title}</span>
                <ChevronRight size={16} className="arrow" />
              </button>
            ))}
          </div>
          
          <div className="support-card-mini">
            <Info size={18} />
            <p>{t('academy_page.support_card_text')}</p>
            <a href="https://discord.com/invite/Ck3rGpSV7U" target="_blank" rel="noreferrer">{t('academy_page.support_card_btn')}</a>
          </div>
        </aside>

        {/* Module Content */}
        <main className="module-content">
          <div className="content-card pc-card-v2">
            <div className="module-header">
              <div className="header-icon-box" style={{ background: currentModule.color + '20', color: currentModule.color }}>
                {currentModule.icon}
              </div>
              <div className="header-text">
                <h2>{currentModule.title}</h2>
                <p>{currentModule.desc}</p>
              </div>
            </div>

            <div className="features-grid">
              {currentModule.features.map((f, i) => (
                <div key={i} className="feature-item">
                  <div className="feature-marker" style={{ background: currentModule.color }}></div>
                  <div className="feature-info">
                    <h4>{f.title}</h4>
                    <p>{f.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pro-tip-box">
              <div className="tip-header">
                <Zap size={18} />
                <span>Pro Tip</span>
              </div>
              <p>
                {activeModule === 'global' && t('academy_page.tip_global')}
                {activeModule === 'moderation' && t('academy_page.tip_moderation')}
                {activeModule === 'verify' && t('academy_page.tip_verify')}
                {activeModule === 'tickets' && t('academy_page.tip_tickets')}
                {activeModule === 'embeds' && t('academy_page.tip_embeds')}
                {activeModule === 'automations' && t('academy_page.tip_automations')}
                {activeModule === 'whitelist' && t('academy_page.tip_whitelist')}
                {activeModule === 'socials' && t('academy_page.tip_socials')}
                {activeModule === 'giveaway' && t('academy_page.tip_giveaway')}
                {activeModule === 'reactionroles' && t('academy_page.tip_reactionroles')}
                {activeModule === 'voice' && t('academy_page.tip_voice')}
                {activeModule === 'white-label' && t('academy_page.tip_branding')}
                {activeModule === 'leveling' && t('academy_page.tip_leveling')}
              </p>
            </div>

            <div className="action-footer">
              <button className="pc-btn-primary" onClick={() => router.push(`/config/${guildId}/${activeModule}`)}>
                <span>{t('academy_page.config_module_btn')}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Quick FAQ / Insights */}
          <div className="insights-row">
            <div className="insight-card pc-card-v2">
              <Activity size={20} color="var(--primary)" />
              <h4>{t('academy_page.why_use_title')}</h4>
              <p>{t('academy_page.why_use_desc')}</p>
            </div>
            <div className="insight-card pc-card-v2">
              <ShieldCheck size={20} color="#10b981" />
              <h4>{t('academy_page.security_title')}</h4>
              <p>{t('academy_page.security_desc')}</p>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .academy-wrapper { padding: 0 24px 48px 24px; max-width: 1650px; margin: 0 auto; }
        
        /* Hero */
        .academy-hero { 
          display: flex; justify-content: space-between; align-items: center; 
          padding: 80px 48px; background: var(--bg-card); border-radius: 40px;
          margin-bottom: 48px; border: 1px solid var(--border); position: relative;
          overflow: hidden; box-shadow: var(--shadow-premium);
        }
        .hero-content { max-width: 600px; position: relative; z-index: 2; }
        .hero-content h1 { font-size: 3.5rem; font-weight: 800; margin: 16px 0; color: var(--text-heading); line-height: 1.1; }
        .hero-content p { font-size: 1.1rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 0; }
        
        .badge-premium { 
          display: inline-flex; align-items: center; gap: 8px; 
          background: var(--primary-glow); color: var(--primary);
          padding: 6px 14px; border-radius: 100px; font-weight: 700; font-size: 0.8rem;
          text-transform: uppercase; letter-spacing: 1px;
        }

        .hero-visual { position: relative; width: 300px; height: 200px; }
        .floating-card {
          position: absolute; width: 80px; height: 80px; border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-elevated); border: 1.5px solid var(--border);
          box-shadow: var(--shadow-premium); color: var(--primary);
          animation: float 4s ease-in-out infinite;
        }
        .c1 { top: -20px; left: 20px; animation-delay: 0s; }
        .c2 { top: 60px; left: 140px; animation-delay: 1s; color: #10b981; }
        .c3 { top: 120px; left: 40px; animation-delay: 2s; color: #f59e0b; }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }

        /* Layout */
        .academy-layout { display: grid; grid-template-columns: 320px 1fr; gap: 48px; }

        /* Sidebar */
        .module-nav { display: flex; flex-direction: column; gap: 24px; }
        .module-nav h3 { font-size: 1rem; color: var(--text-heading); margin-bottom: 8px; padding-left: 12px; }
        .nav-list { display: flex; flex-direction: column; gap: 10px; }
        .nav-item {
          display: flex; align-items: center; gap: 14px; padding: 14px 18px;
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 18px; color: var(--text-muted); cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); text-align: left;
        }
        .nav-item:hover { transform: translateX(5px); border-color: var(--accent); color: var(--text-main); }
        .nav-item.active { background: var(--accent); color: white; border-color: transparent; box-shadow: 0 8px 20px -5px var(--accent); }
        .nav-item .item-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: rgba(0,0,0,0.05); }
        .nav-item.active .item-icon { background: rgba(255,255,255,0.2); }
        .nav-item span { flex: 1; font-weight: 700; font-size: 0.95rem; }
        .nav-item .arrow { opacity: 0; transition: 0.2s; }
        .nav-item.active .arrow { opacity: 1; }

        .support-card-mini {
          margin-top: auto; padding: 24px; background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%);
          border-radius: 24px; border: 1px solid var(--border); text-align: center;
        }
        .support-card-mini p { font-size: 0.85rem; color: var(--text-muted); margin: 12px 0; }
        .support-card-mini a { color: var(--primary); font-weight: 700; font-size: 0.9rem; text-decoration: none; }

        /* Content */
        .module-content { display: flex; flex-direction: column; gap: 32px; }
        .content-card { padding: 48px; }
        .module-header { display: flex; align-items: flex-start; gap: 24px; margin-bottom: 48px; }
        .header-icon-box { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .header-text h2 { font-size: 2rem; font-weight: 800; margin: 0 0 12px 0; color: var(--text-heading); }
        .header-text p { font-size: 1.1rem; color: var(--text-muted); line-height: 1.6; margin: 0; }

        .features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 32px; margin-bottom: 48px; }
        .feature-item { display: flex; gap: 16px; }
        .feature-marker { width: 4px; height: 100%; border-radius: 2px; flex-shrink: 0; opacity: 0.5; }
        .feature-info h4 { font-size: 1.1rem; font-weight: 700; margin: 0 0 8px 0; color: var(--text-main); }
        .feature-info p { font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; margin: 0; }

        .pro-tip-box { 
          background: var(--bg-badge); border-radius: 24px; padding: 24px 32px;
          border: 1.5px dashed var(--border); margin-bottom: 48px;
        }
        .tip-header { display: flex; align-items: center; gap: 10px; color: #f59e0b; margin-bottom: 12px; }
        .tip-header span { font-weight: 800; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; }
        .pro-tip-box p { font-size: 0.95rem; color: var(--text-main); font-style: italic; margin: 0; line-height: 1.6; }

        .action-footer { display: flex; justify-content: flex-end; }
        .action-footer .pc-btn-primary { padding: 16px 32px; border-radius: 18px; font-size: 1rem; }

        .insights-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .insight-card { padding: 24px; display: flex; flex-direction: column; gap: 12px; }
        .insight-card h4 { margin: 0; font-size: 1rem; font-weight: 700; }
        .insight-card p { margin: 0; font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; }

        @media (max-width: 1100px) {
          .academy-layout { grid-template-columns: 1fr; }
          .academy-hero { padding: 48px; }
          .hero-content h1 { font-size: 2.5rem; }
          .hero-visual { display: none; }
        }
      `}</style>
    </div>
  );
}
