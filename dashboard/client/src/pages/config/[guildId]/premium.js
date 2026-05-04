import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Crown, Check, Star, Zap, Shield, 
    Bot, Image, Settings, Globe, 
    ChevronRight, ArrowRight, Info,
    XCircle, CheckCircle2
} from 'lucide-react';

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

  useEffect(() => {
    if (guildId && mounted) {
      const fetchData = async () => {
        try {
          const res = await api.request(`/config/${guildId}/guild`);
          if (res) {
              setConfig(res.data || res);
          }
          setLoading(false);
        } catch (error) {
          console.error("Error loading guild data:", error);
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [guildId, mounted]);

  if (loading || !config) return <><Skeleton height="600px" /></>;

  const premiumTier = config.premiumTier || 'none';
  const isPremium = premiumTier === 'premium' || premiumTier === 'platinum';
  const isPlatinum = premiumTier === 'platinum';

  const getTierName = () => {
    if (isPlatinum) return 'PLATINUM';
    if (isPremium) return 'PREMIUM';
    return 'PIANO FREE';
  };

  return (
    <div className="premium-page animate">
      <div className="premium-hero">
        <div className="hero-content">
            <div className="premium-badge-glow">
                <Crown size={32} />
            </div>
            <h1>Premium Hub</h1>
            <p>Porta il tuo server Discord al livello successivo con funzioni professionali e identità personalizzata.</p>
        </div>
      </div>

      <div className="premium-grid">
        {/* Status Card */}
        <div className={`status-card card tier-${premiumTier}`}>
            <div className="status-header">
                <h3>Stato Attuale</h3>
                <span className={`badge-tier-tag tier-${premiumTier}`}>
                    {premiumTier === 'platinum' ? <Zap size={12} /> : (isPremium ? <Star size={12} /> : null)} 
                    {getTierName()}
                </span>
            </div>
            <div className="status-body">
                {premiumTier !== 'none' ? (
                    <div className="status-active-msg">
                        <CheckCircle2 size={40} color={isPlatinum ? "#a855f7" : "var(--primary)"} />
                        <div>
                            <h4>Il tuo server è {getTierName()}!</h4>
                            <p>{isPlatinum ? "Hai accesso a tutte le funzioni, incluso il True White-label." : "Tutte le funzioni avanzate sono sbloccate."}</p>
                        </div>
                    </div>
                ) : (
                    <div className="status-upgrade-msg">
                        <div className="limit-item">
                            <span>FiveM Servers</span>
                            <span>1 / 1</span>
                        </div>
                        <div className="limit-item">
                            <span>Ticket Categories</span>
                            <span>2 / 2</span>
                        </div>
                        <button className="btn-upgrade-main">Upgrade Ora <ArrowRight size={16} /></button>
                    </div>
                )}
            </div>
        </div>

        {/* Feature Comparison */}
        <div className="comparison-section">
            <div className="section-title">
                <h2>Confronta i Piani</h2>
            </div>
            
            <div className="comparison-table">
                <div className="comp-row head">
                    <div className="feat-col">Funzionalità</div>
                    <div className="plan-col">Free</div>
                    <div className="plan-col">Premium</div>
                    <div className="plan-col platinum">Platinum</div>
                </div>

                <div className="comp-row">
                    <div className="feat-col">
                        <Bot size={16} /> <span>True White-label (Private Bot)</span>
                        <Info size={12} className="info-icon" title="Usa il tuo bot personale con nome e icona scelti da te. Nessun riferimento a Verix." />
                    </div>
                    <div className="plan-col"><XCircle size={18} className="text-muted" /></div>
                    <div className="plan-col"><XCircle size={18} className="text-muted" /></div>
                    <div className="plan-col"><CheckCircle2 size={18} className="text-platinum" /></div>
                </div>

                <div className="comp-row">
                    <div className="feat-col">
                        <Shield size={16} /> <span>Identità Custom (Status & Nome)</span>
                    </div>
                    <div className="plan-col"><XCircle size={18} className="text-muted" /></div>
                    <div className="plan-col"><CheckCircle2 size={18} className="text-primary" /></div>
                    <div className="plan-col"><CheckCircle2 size={18} className="text-platinum" /></div>
                </div>

                <div className="comp-row">
                    <div className="feat-col">
                        <Image size={16} /> <span>Rimozione Branding "Powered by"</span>
                    </div>
                    <div className="plan-col"><XCircle size={18} className="text-muted" /></div>
                    <div className="plan-col"><CheckCircle2 size={18} className="text-primary" /></div>
                    <div className="plan-col"><CheckCircle2 size={18} className="text-platinum" /></div>
                </div>

                <div className="comp-row">
                    <div className="feat-col">
                        <Globe size={16} /> <span>Moduli Avanzati (FiveM, Social, Logs)</span>
                    </div>
                    <div className="plan-col">Limitati</div>
                    <div className="plan-col">Illimitati</div>
                    <div className="plan-col">Illimitati</div>
                </div>

                <div className="comp-row">
                    <div className="feat-col">
                        <Zap size={16} /> <span>Tickets & Supporto Priority</span>
                    </div>
                    <div className="plan-col">Base</div>
                    <div className="plan-col">Priority</div>
                    <div className="plan-col">Dedicated</div>
                </div>
            </div>
        </div>
      </div>

      <div className="pricing-cta-section">
          <h2>Scegli il tuo pacchetto</h2>
          <div className="pricing-cards">
              <div className="price-card">
                  <div className="card-top">
                    <h4>Premium</h4>
                    <div className="price">€9.99 <span>/mese</span></div>
                  </div>
                  <ul className="price-list">
                      <li><Check size={14} /> Funzioni Pro sbloccate</li>
                      <li><Check size={14} /> Moduli illimitati</li>
                      <li><Check size={14} /> Supporto prioritario</li>
                  </ul>
                  <button className="btn-buy">Scegli Premium</button>
              </div>

              <div className="price-card platinum popular">
                  <div className="popular-tag">TOP QUALITY</div>
                  <div className="card-top">
                    <h4>Platinum</h4>
                    <div className="price">€19.99 <span>/mese</span></div>
                    <div className="save-tag">Il più completo</div>
                  </div>
                  <ul className="price-list">
                      <li><Check size={14} /> <strong>TUTTO</strong> il pacchetto Premium</li>
                      <li><Check size={14} /> <strong>True White-label (Bot Privato)</strong></li>
                      <li><Check size={14} /> Rimozione totale branding</li>
                      <li><Check size={14} /> Setup dedicato System Ops</li>
                  </ul>
                  <button className="btn-buy-platinum">Ottieni Platinum</button>
              </div>
          </div>
      </div>

      <style jsx>{`
        .premium-page { color: var(--text-main); }
        
        .premium-hero {
            background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
            padding: 80px 40px;
            border-radius: 32px;
            text-align: center;
            border: 1px solid var(--border);
            margin-bottom: 48px;
            position: relative;
            overflow: hidden;
        }
 
        .hero-content { position: relative; z-index: 2; }
        .premium-badge-glow {
            width: 80px;
            height: 80px;
            background: var(--primary-glow);
            color: var(--primary);
            border-radius: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px auto;
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.3);
            animation: float 4s ease-in-out infinite;
        }
 
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
 
        .premium-hero h1 { font-size: 3rem; font-weight: 800; margin-bottom: 16px; background: linear-gradient(to right, #fff, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .premium-hero p { font-size: 1.1rem; color: var(--text-muted); max-width: 600px; margin: 0 auto; line-height: 1.6; }
 
        .premium-grid { display: grid; grid-template-columns: 320px 1fr; gap: 32px; margin-bottom: 64px; }
 
        .status-card { background: var(--bg-card); padding: 32px; display: flex; flex-direction: column; gap: 24px; border: 1px solid var(--border); border-radius: 24px; }
        .status-card.tier-premium { border: 2px solid var(--primary); box-shadow: 0 0 20px rgba(99, 102, 241, 0.1); }
        .status-card.tier-platinum { border: 2px solid #a855f7; box-shadow: 0 0 30px rgba(168, 85, 247, 0.15); background: linear-gradient(180deg, var(--bg-card) 0%, rgba(168, 85, 247, 0.05) 100%); }
        
        .status-header { display: flex; justify-content: space-between; align-items: center; }
        .badge-tier-tag { padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; display: flex; align-items: center; gap: 6px; }
        .badge-tier-tag.tier-none { background: var(--bg-badge); color: var(--text-muted); }
        .badge-tier-tag.tier-premium { background: var(--primary-glow); color: var(--primary); }
        .badge-tier-tag.tier-platinum { background: rgba(168, 85, 247, 0.1); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.3); }
 
        .status-active-msg { display: flex; align-items: center; gap: 16px; padding: 20px; background: rgba(16, 185, 129, 0.05); border-radius: 16px; border: 1px solid rgba(16, 185, 129, 0.1); }
        .status-active-msg h4 { margin-bottom: 4px; }
        .status-active-msg p { font-size: 0.85rem; color: var(--text-muted); }
 
        .limit-item { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.9rem; color: var(--text-muted); }
        .limit-item span:last-child { font-weight: 700; color: var(--text-main); }
        .btn-upgrade-main { width: 100%; background: var(--primary); color: #fff; border: none; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 20px; transition: 0.3s; }
        .btn-upgrade-main:hover { transform: translateY(-2px); box-shadow: var(--primary-glow); }
 
        .comparison-section { background: var(--bg-card); border-radius: 24px; border: 1px solid var(--border); padding: 32px; }
        .comparison-table { display: flex; flex-direction: column; gap: 8px; }
        .comp-row { display: grid; grid-template-columns: 1fr 100px 100px 100px; padding: 16px; border-radius: 12px; transition: 0.2s; align-items: center; }
        .comp-row:not(.head):hover { background: var(--bg-badge); }
        .comp-row.head { font-weight: 800; font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border); margin-bottom: 8px; }
        
        .feat-col { display: flex; align-items: center; gap: 12px; }
        .plan-col { text-align: center; font-weight: 700; font-size: 0.9rem; }
        .plan-col.platinum { color: #a855f7; }
        .text-platinum { color: #a855f7; }
        .text-primary { color: var(--primary); }
        .info-icon { opacity: 0.4; cursor: help; }
 
        .pricing-cta-section { text-align: center; margin-bottom: 80px; }
        .pricing-cta-section h2 { font-size: 2rem; margin-bottom: 40px; }
        .pricing-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; max-width: 900px; margin: 0 auto; }
        
        .price-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; padding: 40px; text-align: left; position: relative; transition: 0.3s; }
        .price-card.popular { border-color: var(--primary); box-shadow: 0 10px 40px rgba(99, 102, 241, 0.1); transform: scale(1.05); }
        .price-card.platinum.popular { border-color: #a855f7; box-shadow: 0 10px 40px rgba(168, 85, 247, 0.2); transform: scale(1.05); }
        
        .popular-tag { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: var(--primary); color: #fff; padding: 4px 16px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; z-index: 10; }
        .price-card.platinum .popular-tag { background: linear-gradient(90deg, #6366f1, #a855f7); }
        
        .card-top h4 { color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
        .price { font-size: 2.5rem; font-weight: 800; margin-bottom: 24px; }
        .price span { font-size: 1rem; color: var(--text-muted); font-weight: 400; }
        
        .save-tag { background: rgba(16, 185, 129, 0.1); color: var(--success); padding: 4px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; display: inline-block; margin-bottom: 24px; }
 
        .price-list { list-style: none; padding: 0; margin-bottom: 40px; display: flex; flex-direction: column; gap: 12px; }
        .price-list li { display: flex; align-items: center; gap: 10px; font-size: 0.95rem; color: var(--text-muted); }
        
        .btn-buy { width: 100%; padding: 16px; border-radius: 14px; border: 1px solid var(--border); background: var(--bg-badge); color: var(--text-main); font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-buy:hover { background: var(--border); }
        .btn-buy-premium { width: 100%; padding: 16px; border-radius: 14px; border: none; background: var(--primary); color: #fff; font-weight: 700; cursor: pointer; box-shadow: var(--primary-glow); transition: 0.3s; }
        .btn-buy-premium:hover { transform: translateY(-3px); filter: brightness(1.1); }
        .btn-buy-platinum { width: 100%; padding: 16px; border-radius: 14px; border: none; background: linear-gradient(135deg, #6366f1, #a855f7); color: #fff; font-weight: 700; cursor: pointer; box-shadow: 0 10px 20px rgba(168, 85, 247, 0.3); transition: 0.3s; }
        .btn-buy-platinum:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(168, 85, 247, 0.4); }
 
        @media (max-width: 1000px) {
            .premium-grid { grid-template-columns: 1fr; }
            .pricing-cards { grid-template-columns: 1fr; }
            .price-card.popular { transform: none; margin-top: 20px; }
            .premium-hero h1 { font-size: 2rem; }
            .comp-row { grid-template-columns: 1fr 60px 60px 60px; font-size: 0.8rem; }
        }
      `}</style>
    </div>
  );
}
