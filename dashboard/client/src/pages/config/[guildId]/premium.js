import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Crown, Check, Star, Zap, Shield, 
    Bot, Image, Settings, Globe, 
    ChevronRight, ArrowRight, Info,
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
            <title>Premium Hub | Verix Studio</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: `linear-gradient(135deg, ${currentTierColor} 0%, #000 100%)` }}>
                    <Gem size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>Sottoscrizioni Studio</h1>
                    <div className={`pc-status-tag-v2 ${isPremium ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {isPremium ? `${premiumTier.toUpperCase()} ATTIVO` : 'ACCESSO STANDARD'}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <button className="pc-btn-back-v2" onClick={() => router.push(`/config/${guildId}`)}>
                    <ChevronLeft size={20} />
                    <span>Dashboard</span>
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
                            <span>VERIX PLATINUM PROGRAM</span>
                        </div>
                        <h2>{isPlatinum ? 'Potenza Platinum Attiva' : isPremium ? 'Abbonamento Premium Attivo' : 'Sblocca il Prossimo Livello'}</h2>
                        <p>Trasforma la tua community con strumenti di moderazione d'elite, personalizzazione totale e un'infrastruttura dedicata ad alte prestazioni.</p>
                        
                        <div className="hero-stats-row-v2">
                            <div className="hero-stat-item-v2">
                                <span className="stat-val-v2">∞</span>
                                <span className="stat-label-v2">Automazioni</span>
                            </div>
                            <div className="hero-stat-item-v2">
                                <span className="stat-val-v2">24/7</span>
                                <span className="stat-label-v2">Uptime Core</span>
                            </div>
                            <div className="hero-stat-item-v2">
                                <span className="stat-val-v2">Dedicated</span>
                                <span className="stat-label-v2">Compute</span>
                            </div>
                        </div>

                        {!isPremium && (
                            <div className="hero-actions-v2">
                                <button className="pc-btn-primary invite-pulse" style={{ background: 'white', color: '#6366f1' }}>
                                    <Rocket size={18} />
                                    <span>Esplora Piani</span>
                                </button>
                                <button className="pc-btn-outline-v2" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', background: 'rgba(255,255,255,0.1)' }}>
                                    <span>Vedi Demo Platinum</span>
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
                        <div className="price-title-v2">STANDARD</div>
                        <div className="price-val-v2">€0<span>/sempre</span></div>
                    </div>
                    <div className="price-body-v2">
                        <ul className="feature-list-v2">
                            <li><CheckCircle2 size={16} /> Moderazione Base</li>
                            <li><CheckCircle2 size={16} /> 2 Slots Automazioni</li>
                            <li><CheckCircle2 size={16} /> 1 Server FiveM</li>
                            <li><XCircle size={16} opacity={0.4} /> White-Label Bot</li>
                        </ul>
                    </div>
                    <button className="pc-btn-price-v2" disabled={!isPremium}>Il tuo piano</button>
                </div>

                {/* Premium Plan */}
                <div className="pc-price-card-v2 premium active-border">
                    <div className="popular-tag-v2">BEST SELLER</div>
                    <div className="price-header-v2">
                        <div className="price-title-v2" style={{ color: '#f59e0b' }}>PREMIUM</div>
                        <div className="price-val-v2">€9.99<span>/mese</span></div>
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
                        {premiumTier === 'premium' ? 'Attivo' : 'Attiva Premium'}
                    </button>
                </div>

                {/* Platinum Plan */}
                <div className="pc-price-card-v2 platinum">
                    <div className="elite-tag-v2">ELITE ENGINE</div>
                    <div className="price-header-v2">
                        <div className="price-title-v2" style={{ color: '#a855f7' }}>PLATINUM</div>
                        <div className="price-val-v2">€19.99<span>/mese</span></div>
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
                        {isPlatinum ? 'Attivo' : 'Passa a Platinum'}
                    </button>
                </div>
            </div>

            {/* V2 Comparison Hub */}
            <section className="pc-card-v2 animate slide-up" style={{ marginTop: '48px' }}>
                <div className="card-header-v2">
                    <div className="header-icon" style={{ background: '#f5f3ff', color: '#6366f1' }}><Layers size={18} /></div>
                    <h3 style={{ margin: 0 }}>Matrice delle Funzionalità</h3>
                </div>
                <div className="card-body-v2">
                    <div className="pc-comparison-hub-v2">
                        <div className="hub-row-v2 header">
                            <div className="hub-col-v2 feat">Caratteristica</div>
                            <div className="hub-col-v2 val">Standard</div>
                            <div className="hub-col-v2 val">Premium</div>
                            <div className="hub-col-v2 val highlight">Platinum</div>
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
                                <div className="hub-col-v2 val">{typeof row.s === 'boolean' ? (row.s ? <CheckCircle size={16} color="#10b981" /> : <XCircle size={16} color="#cbd5e1" />) : row.s}</div>
                                <div className="hub-col-v2 val">{typeof row.p === 'boolean' ? (row.p ? <CheckCircle size={16} color="#f59e0b" /> : <XCircle size={16} color="#cbd5e1" />) : row.p}</div>
                                <div className="hub-col-v2 val highlight">{typeof row.pl === 'boolean' ? (row.pl ? <CheckCircle size={16} color="#a855f7" /> : <XCircle size={16} color="#cbd5e1" />) : row.pl}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 40px; max-width: 1600px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: white; padding: 32px; border-radius: 32px; box-shadow: var(--shadow-premium); border: 1px solid var(--border-light); }
            .header-info { display: flex; align-items: center; gap: 24px; }
            .pc-icon-box { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 12px 24px rgba(0,0,0,0.2); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Outfit', sans-serif; font-size: 2.2rem; font-weight: 900; margin: 0; color: #1e293b; letter-spacing: -1px; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 900; padding: 4px 12px; border-radius: 100px; letter-spacing: 1px; }
            .pc-status-tag-v2.on { background: #ecfdf5; color: #10b981; }
            .pc-status-tag-v2.off { background: #f1f5f9; color: #94a3b8; }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

            .pc-btn-back-v2 { display: flex; align-items: center; gap: 10px; background: white; color: #64748b; border: 1.5px solid #e2e8f0; padding: 12px 20px; border-radius: 16px; font-weight: 800; cursor: pointer; transition: 0.2s; }
            .pc-btn-back-v2:hover { border-color: var(--primary); color: var(--primary); }

            /* Hero Engine V2 */
            .pc-hero-engine-v2 { border-radius: 48px; padding: 80px; position: relative; overflow: hidden; color: white; margin-bottom: 48px; background: #1e293b; }
            .pc-hero-engine-v2.premium { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
            .pc-hero-engine-v2.platinum { background: linear-gradient(135deg, #7c3aed 0%, #4338ca 100%); }
            .pc-hero-engine-v2.none { background: linear-gradient(135deg, #6366f1 0%, #1e1b4b 100%); }
            
            .engine-glow-v2 { position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: rgba(255,255,255,0.1); border-radius: 50%; filter: blur(80px); }
            .hero-content-v2 { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 10; }
            .hero-text-v2 { max-width: 650px; }
            .premium-badge-v2 { display: flex; alignItems: center; gap: 8px; background: rgba(255,255,255,0.2); padding: 6px 16px; border-radius: 100px; font-size: 0.7rem; fontWeight: 950; letterSpacing: 1px; margin-bottom: 24px; width: fit-content; }
            .hero-text-v2 h2 { font-family: 'Outfit'; font-size: 3.5rem; fontWeight: 950; margin: 0 0 20px 0; lineHeight: 1.1; letterSpacing: -2px; }
            .hero-text-v2 p { font-size: 1.25rem; fontWeight: 600; opacity: 0.9; margin: 0 0 40px 0; lineHeight: 1.6; }
            
            .hero-stats-row-v2 { display: flex; gap: 40px; margin-bottom: 48px; border-top: 1.5px solid rgba(255,255,255,0.1); padding-top: 32px; }
            .hero-stat-item-v2 { display: flex; flexDirection: column; }
            .stat-val-v2 { font-size: 1.8rem; fontWeight: 950; font-family: 'Outfit'; }
            .stat-label-v2 { font-size: 0.75rem; fontWeight: 800; opacity: 0.7; textTransform: uppercase; letterSpacing: 0.5px; }

            .hero-actions-v2 { display: flex; gap: 20px; }
            .pc-btn-primary { background: white; color: var(--primary); border: none; padding: 18px 40px; border-radius: 20px; font-weight: 950; cursor: pointer; display: flex; alignItems: center; gap: 12px; transition: 0.3s; }
            .pc-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(0,0,0,0.2); }
            .invite-pulse { animation: invite-glow 2s infinite; }
            @keyframes invite-glow { 0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); } 70% { box-shadow: 0 0 0 15px rgba(255,255,255,0); } 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); } }

            .hero-visual-v2 { position: relative; padding-right: 40px; }
            .tier-hologram-v2 { position: relative; width: 240px; height: 240px; display: flex; alignItems: center; justifyContent: center; flexDirection: column; }
            .hologram-ring-1 { position: absolute; inset: 0; border: 4px solid rgba(255,255,255,0.1); border-radius: 50%; animation: spin 10s linear infinite; }
            .hologram-ring-2 { position: absolute; inset: 20px; border: 2px dashed rgba(255,255,255,0.2); border-radius: 50%; animation: spin-reverse 15s linear infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
            .tier-symbol-v2 { font-size: 5rem; animation: float 4s ease-in-out infinite; }
            @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
            .tier-label-v2 { margin-top: 10px; font-size: 1.2rem; fontWeight: 950; letterSpacing: 2px; text-shadow: 0 4px 10px rgba(0,0,0,0.2); }

            /* Pricing Grid V2 */
            .pc-pricing-grid-v2 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
            .pc-price-card-v2 { background: white; border-radius: 40px; padding: 48px 40px; border: 1.5px solid #e2e8f0; position: relative; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flexDirection: column; }
            .pc-price-card-v2:hover { transform: translateY(-10px); box-shadow: 0 25px 60px rgba(0,0,0,0.06); border-color: #cbd5e1; }
            .active-border { border-color: #f59e0b !important; }
            .platinum.pc-price-card-v2 { border-color: #a855f7; background: linear-gradient(135deg, #ffffff 0%, #fdf4ff 100%); }
            
            .popular-tag-v2 { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: #f59e0b; color: white; padding: 6px 18px; border-radius: 100px; font-size: 0.65rem; font-weight: 950; letterSpacing: 1px; }
            .elite-tag-v2 { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: #a855f7; color: white; padding: 6px 18px; border-radius: 100px; font-size: 0.65rem; font-weight: 950; letterSpacing: 1px; }

            .price-header-v2 { margin-bottom: 40px; }
            .price-title-v2 { font-size: 0.8rem; fontWeight: 950; letterSpacing: 2px; color: #94a3b8; margin-bottom: 12px; }
            .price-val-v2 { font-family: 'Outfit'; font-size: 3rem; fontWeight: 950; color: #1e293b; lineHeight: 1; }
            .price-val-v2 span { font-size: 1.1rem; color: #94a3b8; fontWeight: 700; margin-left: 4px; }

            .feature-list-v2 { list-style: none; padding: 0; margin: 0 0 48px 0; display: flex; flexDirection: column; gap: 16px; flex: 1; }
            .feature-list-v2 li { display: flex; alignItems: center; gap: 14px; font-size: 1rem; fontWeight: 750; color: #475569; }

            .pc-btn-price-v2 { width: 100%; padding: 20px; border-radius: 20px; font-weight: 950; font-size: 1.1rem; cursor: pointer; transition: 0.3s; border: 1.5px solid #e2e8f0; background: #f8fafc; color: #94a3b8; }
            .pc-btn-price-v2.premium { background: #f59e0b; color: white; border: none; box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3); }
            .pc-btn-price-v2.platinum { background: #a855f7; color: white; border: none; box-shadow: 0 10px 25px rgba(168, 85, 247, 0.3); }
            .pc-btn-price-v2:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
            .pc-btn-price-v2:hover:not(:disabled) { transform: scale(1.02); }

            /* Comparison Matrix V2 */
            .pc-card-v2 { background: white; border: 1px solid var(--border-light); border-radius: 32px; padding: 40px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 20px; margin-bottom: 40px; }
            .header-icon { width: 52px; height: 52px; background: #f5f3ff; color: var(--primary); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
            .card-header-v2 h3 { margin: 0; font-family: 'Outfit'; font-size: 1.5rem; font-weight: 950; color: #1e293b; }

            .pc-comparison-hub-v2 { display: flex; flexDirection: column; }
            .hub-row-v2 { display: flex; alignItems: center; padding: 24px 0; border-bottom: 1.5px solid #f1f5f9; }
            .hub-row-v2.header { border-bottom: 2.5px solid #e2e8f0; }
            .hub-row-v2.header .hub-col-v2 { font-size: 0.8rem; fontWeight: 950; color: #94a3b8; textTransform: uppercase; letterSpacing: 1px; }
            .hub-col-v2.feat { flex: 1; font-weight: 850; color: #1e293b; font-size: 1.05rem; }
            .hub-col-v2.val { width: 140px; text-align: center; font-weight: 900; color: #64748b; }
            .hub-col-v2.highlight { color: #a855f7; background: #fdf4ff; border-radius: 12px; padding: 12px 0; }

            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-price-card-v2 { background: #ffffff !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
