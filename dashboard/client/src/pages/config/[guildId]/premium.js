import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Crown, Check, Star, Zap, Shield, 
    Bot, Image, Settings, Globe, 
    ChevronRight, ChevronLeft, ArrowRight, Info,
    XCircle, CheckCircle2, Layout,
    Sparkles, Rocket, Gem, Award,
    CheckCircle, ShieldCheck, Target,
    Activity, Layers, Heart, ShieldAlert,
    Cpu, RefreshCcw
} from 'lucide-react';
import Head from 'next/head';

export default function PremiumHub() {
  const router = useRouter();
  const { t } = useT();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    if (!guildId || !mounted) return;
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const res = await api.request(`/config/${guildId}/guild`);
      setConfig(res.data || res);
    } catch (error) {
      console.error("Error loading guild data:", error);
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [guildId, mounted]);

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  const premiumTier = config.premiumTier || 'none';
  const isPremium = premiumTier === 'premium' || premiumTier === 'platinum';
  const isPlatinum = premiumTier === 'platinum';

  const currentTierColor = isPlatinum ? '#a855f7' : isPremium ? '#f59e0b' : '#6366f1';

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('ph.title')} | Verix Studio</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: `linear-gradient(135deg, ${currentTierColor} 0%, #000 100%)` }}>
                    <Gem size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('ph.title')}</h1>
                    <div className={`pc-status-tag-v2 ${isPremium ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {isPremium ? `${premiumTier.toUpperCase()} ${t('ph.active')}` : t('ph.standard_access')}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <button className="pc-btn-back-v2" onClick={() => router.push(`/config/${guildId}`)}>
                    <ChevronLeft size={20} />
                    <span>{t('common.dashboard')}</span>
                </button>
            </div>
        </header>

        <div className="pc-content-v2">
            {/* V2 Grand Hero Engine */}
            <section className={`pc-hero-engine-v2 ${premiumTier}`}>
                <div className="engine-glow-v2"></div>
                <div className="hero-content-v2">
                    <div className="hero-text-v2">
                        <div className="premium-badge-v2">
                            <Sparkles size={14} />
                            <span>{t('ph.hero_platinum')}</span>
                        </div>
                        <h2>{isPlatinum ? t('ph.hero_title_pl') : isPremium ? t('ph.hero_title_pr') : t('ph.hero_title_base')}</h2>
                        <p>{t('ph.hero_desc')}</p>
                        
                        <div className="hero-stats-row-v2">
                            <div className="hero-stat-item-v2">
                                <span className="stat-val-v2">∞</span>
                                <span className="stat-label-v2">{t('ph.automations')}</span>
                            </div>
                            <div className="hero-stat-item-v2">
                                <span className="stat-val-v2">24/7</span>
                                <span className="stat-label-v2">{t('ph.uptime')}</span>
                            </div>
                            <div className="hero-stat-item-v2">
                                <span className="stat-val-v2">Dedicated</span>
                                <span className="stat-label-v2">{t('ph.compute')}</span>
                            </div>
                        </div>

                        {!isPremium && (
                            <div className="hero-actions-v2">
                                <button className="pc-btn-primary invite-pulse" style={{ background: 'white', color: '#6366f1' }}>
                                    <Rocket size={18} />
                                    <span>{t('ph.explore')}</span>
                                </button>
                                <button className="pc-btn-outline-v2" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', background: 'rgba(255,255,255,0.1)' }}>
                                    <span>{t('ph.demo')}</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="hero-visual-v2">
                        <div className="tier-hologram-v2">
                            <div className="hologram-ring-1"></div>
                            <div className="hologram-ring-2"></div>
                            <div className="tier-symbol-v2">
                                {isPlatinum ? <Award size={80} /> : isPremium ? <Crown size={80} /> : <Rocket size={80} />}
                            </div>
                            <div className="tier-label-v2">{isPlatinum ? 'PLATINUM' : isPremium ? 'PREMIUM' : 'BASE'}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* V2 Pricing Grid */}
            <div className="pc-pricing-grid-v2">
                {/* Standard Plan */}
                <div className="pc-price-card-v2 standard">
                    <div className="price-header-v2">
                        <div className="price-title-v2">{t('ph.standard')}</div>
                        <div className="price-val-v2">€0<span>/{t('ph.always')}</span></div>
                    </div>
                    <div className="price-body-v2">
                        <ul className="feature-list-v2">
                            <li><CheckCircle2 size={16} /> Moderazione Base</li>
                            <li><CheckCircle2 size={16} /> 2 Slots Automazioni</li>
                            <li><CheckCircle2 size={16} /> 1 Server FiveM</li>
                            <li><XCircle size={16} style={{ opacity: 0.4 }} /> White-Label Bot</li>
                        </ul>
                    </div>
                    <button className="pc-btn-price-v2" disabled={!isPremium}>{t('ph.your_plan')}</button>
                </div>

                {/* Premium Plan */}
                <div className="pc-price-card-v2 premium active-border">
                    <div className="popular-tag-v2">{t('common.best_seller')}</div>
                    <div className="price-header-v2">
                        <div className="price-title-v2" style={{ color: '#f59e0b' }}>{t('ph.premium')}</div>
                        <div className="price-val-v2">€9.99<span>/{t('ph.month')}</span></div>
                    </div>
                    <div className="price-body-v2">
                        <ul className="feature-list-v2">
                            <li><CheckCircle2 size={16} color="#f59e0b" /> 10 Slots Automazioni</li>
                            <li><CheckCircle2 size={16} color="#f59e0b" /> Analytics Live</li>
                            <li><CheckCircle2 size={16} color="#f59e0b" /> Nessun Logo Verix</li>
                            <li><CheckCircle2 size={16} color="#f59e0b" /> Supporto Prioritario</li>
                        </ul>
                    </div>
                    <button className="pc-btn-price-v2 premium" disabled={premiumTier === 'premium'}>
                        {premiumTier === 'premium' ? t('ph.active') : t('ph.activate_pr')}
                    </button>
                </div>

                {/* Platinum Plan */}
                <div className="pc-price-card-v2 platinum">
                    <div className="elite-tag-v2">{t('common.elite_engine')}</div>
                    <div className="price-header-v2">
                        <div className="price-title-v2" style={{ color: '#a855f7' }}>{t('ph.platinum')}</div>
                        <div className="price-val-v2">€19.99<span>/{t('ph.month')}</span></div>
                    </div>
                    <div className="price-body-v2">
                        <ul className="feature-list-v2">
                            <li><CheckCircle2 size={16} color="#a855f7" /> <strong>White-Label Bot (Token)</strong></li>
                            <li><CheckCircle2 size={16} color="#a855f7" /> Slots Illimitati</li>
                            <li><CheckCircle2 size={16} color="#a855f7" /> 25+ FiveM Servers</li>
                            <li><CheckCircle2 size={16} color="#a855f7" /> API Developer Access</li>
                        </ul>
                    </div>
                    <button className="pc-btn-price-v2 platinum" disabled={isPlatinum}>
                        {isPlatinum ? t('ph.active') : t('ph.activate_pl')}
                    </button>
                </div>
            </div>

            {/* V2 Comparison Hub */}
            <section className="pc-card-v2 animate slide-up" style={{ marginTop: '48px' }}>
                <div className="card-header-v2">
                    <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Layers size={18} /></div>
                    <h3 style={{ margin: 0 }}>{t('ph.feat_matrix')}</h3>
                </div>
                <div className="card-body-v2">
                    <div className="pc-comparison-hub-v2">
                        <div className="hub-row-v2 header">
                            <div className="hub-col-v2 feat">{t('ph.feat_col')}</div>
                            <div className="hub-col-v2 val">{t('ph.standard')}</div>
                            <div className="hub-col-v2 val">{t('ph.premium')}</div>
                            <div className="hub-col-v2 val highlight">{t('ph.platinum')}</div>
                        </div>
                        {[
                            { name: 'Branding Personalizzato', s: false, p: true, pl: true },
                            { name: 'Vanity Bot Identity (Token)', s: false, p: false, pl: true },
                            { name: 'Analytics in Tempo Reale', s: false, p: true, pl: true },
                            { name: 'Automazioni Studio', s: '2 Slots', p: '10 Slots', pl: 'Illimitati' },
                            { name: 'Integrazione FiveM API', s: 'Limitata', p: 'Full Access', pl: 'Elite Access' },
                            { name: 'Supporto Dedicato', s: 'Community', p: 'Prioritario', pl: 'One-to-One' }
                        ].map((row, i) => (
                            <div key={i} className="hub-row-v2">
                                <div className="hub-col-v2 feat">{row.name}</div>
                                <div className="hub-col-v2 val">{typeof row.s === 'boolean' ? (row.s ? <CheckCircle size={16} color="#10b981" /> : <XCircle size={16} color="var(--text-muted)" />) : row.s}</div>
                                <div className="hub-col-v2 val">{typeof row.p === 'boolean' ? (row.p ? <CheckCircle size={16} color="#f59e0b" /> : <XCircle size={16} color="var(--text-muted)" />) : row.p}</div>
                                <div className="hub-col-v2 val highlight">{typeof row.pl === 'boolean' ? (row.pl ? <CheckCircle size={16} color="#a855f7" /> : <XCircle size={16} color="var(--text-muted)" />) : row.pl}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 40px; max-width: 1600px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: var(--bg-card); padding: 32px; border-radius: 40px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 24px; }
            .pc-icon-box { width: 72px; height: 72px; border-radius: 22px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 15px 35px rgba(0,0,0,0.2); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-size: 2.4rem; font-weight: 800; margin: 0; color: var(--text-heading); letter-spacing: -1.5px; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.7rem; font-weight: 800; padding: 6px 16px; border-radius: 100px; letter-spacing: 1px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); }
            .pc-status-tag-v2.on { background: rgba(16, 185, 129, 0.1); color: #10b981; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: var(--text-muted); }
            .status-dot-v2 { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }

            .pc-btn-back-v2 { display: flex; align-items: center; gap: 12px; background: var(--bg-card); color: var(--text-muted); border: 1.5px solid var(--border); padding: 14px 24px; border-radius: 20px; font-weight: 800; cursor: pointer; transition: 0.3s; }
            .pc-btn-back-v2:hover { border-color: var(--primary); color: var(--primary); transform: translateX(-5px); background: var(--primary-glow); }

            /* Hero Engine V2 */
            .pc-hero-engine-v2 { border-radius: 56px; padding: 60px 80px; position: relative; overflow: hidden; color: white; margin-bottom: 56px; background: #1e293b; box-shadow: 0 40px 100px rgba(0,0,0,0.2); }
            .pc-hero-engine-v2.premium { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
            .pc-hero-engine-v2.platinum { background: linear-gradient(135deg, #7c3aed 0%, #4338ca 100%); }
            .pc-hero-engine-v2.none { background: linear-gradient(135deg, #6366f1 0%, #1e1b4b 100%); }
            
            .pc-hero-engine-v2::after { content: ''; position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); opacity: 0.3; }

            .engine-glow-v2 { position: absolute; top: -150px; right: -150px; width: 500px; height: 500px; background: rgba(255,255,255,0.15); border-radius: 50%; filter: blur(100px); animation: move-glow 20s infinite alternate; }
            @keyframes move-glow { 0% { transform: translate(0, 0); } 100% { transform: translate(-100px, 100px); } }

            .hero-content-v2 { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 10; }
            .hero-text-v2 { max-width: 700px; }
            .premium-badge-v2 { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.15); padding: 8px 20px; border-radius: 100px; font-size: 0.75rem; font-weight: 800; letter-spacing: 1.5px; margin-bottom: 20px; width: fit-content; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(5px); }
            .hero-text-v2 h2 { font-size: 3.2rem; font-weight: 800; margin: 0 0 16px 0; line-height: 1; letter-spacing: -2px; text-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .hero-text-v2 p { font-size: 1.1rem; font-weight: 650; opacity: 0.85; margin: 0 0 40px 0; line-height: 1.6; max-width: 600px; }
            
            .hero-stats-row-v2 { display: flex; gap: 56px; margin-bottom: 56px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 40px; }
            .hero-stat-item-v2 { display: flex; flex-direction: column; gap: 4px; }
            .stat-val-v2 { font-size: 2.2rem; font-weight: 800; letter-spacing: -1px; }
            .stat-label-v2 { font-size: 0.8rem; font-weight: 800; opacity: 0.6; text-transform: uppercase; letter-spacing: 1px; }

            .hero-actions-v2 { display: flex; gap: 24px; }
            .pc-btn-primary { background: white !important; color: #1e293b !important; border: none; padding: 20px 48px; border-radius: 24px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 14px; transition: 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
            .pc-btn-primary:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 30px 70px rgba(0,0,0,0.3); }
            .pc-btn-outline-v2 { padding: 20px 48px; border-radius: 24px; font-weight: 800; cursor: pointer; transition: 0.4s; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.05); color: white; backdrop-filter: blur(10px); }
            .pc-btn-outline-v2:hover { background: rgba(255,255,255,0.15); border-color: white; transform: translateY(-3px); }

            .hero-visual-v2 { position: relative; padding-right: 40px; }
            .tier-hologram-v2 { position: relative; width: 280px; height: 280px; display: flex; align-items: center; justify-content: center; flex-direction: column; }
            .hologram-ring-1 { position: absolute; inset: 0; border: 4px solid rgba(255,255,255,0.08); border-radius: 50%; animation: spin 12s linear infinite; }
            .hologram-ring-2 { position: absolute; inset: 30px; border: 2px dashed rgba(255,255,255,0.15); border-radius: 50%; animation: spin-reverse 20s linear infinite; }
            .tier-symbol-v2 { color: white; animation: float 5s ease-in-out infinite; filter: drop-shadow(0 0 30px rgba(255,255,255,0.3)); }
            .tier-label-v2 { margin-top: 16px; font-size: 1.5rem; font-weight: 800; letter-spacing: 4px; text-shadow: 0 10px 30px rgba(0,0,0,0.3); opacity: 0.9; }

            /* Pricing Grid V2 */
            .pc-pricing-grid-v2 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
            .pc-price-card-v2 { background: var(--bg-card); border-radius: 48px; padding: 60px 48px; border: 1px solid var(--border); position: relative; transition: 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); display: flex; flex-direction: column; box-shadow: var(--shadow-premium); }
            .pc-price-card-v2:hover { transform: translateY(-12px); box-shadow: 0 40px 100px rgba(0,0,0,0.15); border-color: var(--border-strong); }
            
            .pc-price-card-v2.active-border { border: 2px solid #f59e0b; }
            .pc-price-card-v2.platinum { border: 2px solid #a855f7; }
            
            .popular-tag-v2 { position: absolute; top: -16px; left: 50%; transform: translateX(-50%); background: #f59e0b; color: white; padding: 8px 24px; border-radius: 100px; font-size: 0.75rem; font-weight: 950; letter-spacing: 1.5px; box-shadow: 0 10px 20px rgba(245, 158, 11, 0.3); }
            .elite-tag-v2 { position: absolute; top: -16px; left: 50%; transform: translateX(-50%); background: #a855f7; color: white; padding: 8px 24px; border-radius: 100px; font-size: 0.75rem; font-weight: 950; letter-spacing: 1.5px; box-shadow: 0 10px 20px rgba(168, 85, 247, 0.3); }

            .price-header-v2 { margin-bottom: 48px; }
            .price-title-v2 { font-size: 0.9rem; font-weight: 950; letter-spacing: 3px; color: var(--text-muted); margin-bottom: 16px; text-transform: uppercase; }
            .price-val-v2 { font-size: 3.5rem; font-weight: 950; color: var(--text-heading); line-height: 0.9; letter-spacing: -2px; }
            .price-val-v2 span { font-size: 1.2rem; color: var(--text-muted); font-weight: 700; margin-left: 6px; }

            .feature-list-v2 { list-style: none; padding: 0; margin: 0 0 56px 0; display: flex; flex-direction: column; gap: 20px; flex: 1; }
            .feature-list-v2 li { display: flex; align-items: center; gap: 16px; font-size: 1.05rem; font-weight: 700; color: var(--text-dim); }

            .pc-btn-price-v2 { width: 100%; padding: 22px; border-radius: 24px; font-weight: 950; font-size: 1.15rem; cursor: pointer; transition: 0.3s; border: 1.5px solid var(--border); background: var(--bg-badge); color: var(--text-muted); }
            .pc-btn-price-v2.premium { background: #f59e0b; color: white; border: none; }
            .pc-btn-price-v2.platinum { background: #a855f7; color: white; border: none; }
            .pc-btn-price-v2:disabled { opacity: 0.5; cursor: not-allowed; }
            .pc-btn-price-v2:hover:not(:disabled) { transform: translateY(-4px); }

            /* Comparison Matrix V2 */
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 48px; padding: 56px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 24px; margin-bottom: 56px; }
            .header-icon { width: 64px; height: 64px; background: var(--bg-badge); color: var(--primary); border-radius: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .card-header-v2 h3 { margin: 0; font-size: 1.8rem; font-weight: 950; color: var(--text-heading); letter-spacing: -0.5px; }

            .pc-comparison-hub-v2 { display: flex; flex-direction: column; }
            .hub-row-v2 { display: grid; grid-template-columns: 1fr 180px 180px 220px; align-items: center; padding: 28px 0; border-bottom: 1.5px solid var(--border); }
            .hub-row-v2.header { border-bottom: 2px solid var(--border-strong); padding-bottom: 32px; }
            .hub-row-v2.header .hub-col-v2 { font-size: 0.85rem; font-weight: 950; color: var(--text-muted); text-transform: uppercase; letter-spacing: 2px; }
            .hub-col-v2.feat { font-weight: 850; color: var(--text-heading); font-size: 1.15rem; }
            .hub-col-v2.val { text-align: center; font-weight: 900; color: var(--text-dim); }
            .hub-col-v2.highlight { color: #a855f7; font-weight: 950; }

            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
            @keyframes float { 0% { transform: translateY(0); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0); } }

            .animate { animation: slide-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
            @keyframes slide-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
