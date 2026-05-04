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

  const isPremium = !!config.isPremium;

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
        <div className={`status-card card ${isPremium ? 'premium-active' : 'free-active'}`}>
            <div className="status-header">
                <h3>Stato Attuale</h3>
                {isPremium ? (
                    <span className="badge-premium-tag"><Star size={12} /> PREMIUM</span>
                ) : (
                    <span className="badge-free-tag">PIANO FREE</span>
                )}
            </div>
            <div className="status-body">
                {isPremium ? (
                    <div className="status-active-msg">
                        <CheckCircle2 size={40} color="var(--success)" />
                        <div>
                            <h4>Il tuo server è Premium!</h4>
                            <p>Tutte le funzioni avanzate sono sbloccate.</p>
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
                    <div className="plan-col highlight">Premium</div>
                </div>

                <div className="comp-row">
                    <div className="feat-col">
                        <Bot size={16} /> <span>Identità Custom Bot (White-label)</span>
                        <Info size={12} className="info-icon" title="Usa il tuo bot personale con nome e icona scelti da te." />
                    </div>
                    <div className="plan-col"><XCircle size={18} className="text-muted" /></div>
                    <div className="plan-col"><CheckCircle2 size={18} className="text-primary" /></div>
                </div>

                <div className="comp-row">
                    <div className="feat-col">
                        <Settings size={16} /> <span>Status Personalizzato</span>
                    </div>
                    <div className="plan-col"><XCircle size={18} className="text-muted" /></div>
                    <div className="plan-col"><CheckCircle2 size={18} className="text-primary" /></div>
                </div>

                <div className="comp-row">
                    <div className="feat-col">
                        <Image size={16} /> <span>Rimozione Branding "Powered by"</span>
                    </div>
                    <div className="plan-col"><XCircle size={18} className="text-muted" /></div>
                    <div className="plan-col"><CheckCircle2 size={18} className="text-primary" /></div>
                </div>

                <div className="comp-row">
                    <div className="feat-col">
                        <Globe size={16} /> <span>FiveM Monitoring</span>
                    </div>
                    <div className="plan-col">1 Server</div>
                    <div className="plan-col">Illimitati</div>
                </div>

                <div className="comp-row">
                    <div className="feat-col">
                        <Zap size={16} /> <span>Tickets & Supporto</span>
                    </div>
                    <div className="plan-col">2 Categorie</div>
                    <div className="plan-col">Illimitate</div>
                </div>

                <div className="comp-row">
                    <div className="feat-col">
                        <Shield size={16} /> <span>Auto-Whitelist & Log HTML</span>
                    </div>
                    <div className="plan-col"><XCircle size={18} className="text-muted" /></div>
                    <div className="plan-col"><CheckCircle2 size={18} className="text-primary" /></div>
                </div>
            </div>
        </div>
      </div>

      <div className="pricing-cta-section">
          <h2>Pronto a diventare Pro?</h2>
          <div className="pricing-cards">
              <div className="price-card">
                  <div className="card-top">
                    <h4>Mensile</h4>
                    <div className="price">€9.99 <span>/mese</span></div>
                  </div>
                  <ul className="price-list">
                      <li><Check size={14} /> Tutte le funzioni Premium</li>
                      <li><Check size={14} /> Supporto prioritario</li>
                      <li><Check size={14} /> Badge Discord</li>
                  </ul>
                  <button className="btn-buy">Inizia Ora</button>
              </div>

              <div className="price-card popular">
                  <div className="popular-tag">PIÙ SCELTO</div>
                  <div className="card-top">
                    <h4>Annuale</h4>
                    <div className="price">€89.99 <span>/anno</span></div>
                    <div className="save-tag">Risparmia 25%</div>
                  </div>
                  <ul className="price-list">
                      <li><Check size={14} /> Tutte le funzioni Premium</li>
                      <li><Check size={14} /> Supporto prioritario</li>
                      <li><Check size={14} /> Badge Discord</li>
                      <li><Check size={14} /> Setup Assistito Gratuito</li>
                  </ul>
                  <button className="btn-buy-premium">Ottieni Sconto</button>
              </div>
          </div>
      </div>

      <style jsx>{`
        .premium-page { color: var(--text-main); }
        
        .premium-hero {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
            padding: 80px 40px;
            border-radius: 32px;
            text-align: center;
            border: 1px solid var(--border);
            margin-bottom: 48px;
            position: relative;
            overflow: hidden;
        }

        .premium-hero::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%);
            animation: rotate 20s linear infinite;
        }

        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

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
            box-shadow: 0 0 30px rgba(99, 102, 241, 0.3);
            animation: float 4s ease-in-out infinite;
        }

        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

        .premium-hero h1 { font-size: 3rem; font-weight: 800; margin-bottom: 16px; background: linear-gradient(to right, #fff, var(--primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .premium-hero p { font-size: 1.1rem; color: var(--text-muted); max-width: 600px; margin: 0 auto; line-height: 1.6; }

        .premium-grid { display: grid; grid-template-columns: 350px 1fr; gap: 32px; margin-bottom: 64px; }

        .status-card { background: var(--bg-card); padding: 32px; display: flex; flex-direction: column; gap: 24px; }
        .status-card.premium-active { border: 2px solid var(--primary); box-shadow: 0 0 20px rgba(99, 102, 241, 0.1); }
        
        .status-header { display: flex; justify-content: space-between; align-items: center; }
        .badge-premium-tag { background: var(--primary-glow); color: var(--primary); padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; display: flex; align-items: center; gap: 6px; }
        .badge-free-tag { background: var(--bg-badge); color: var(--text-muted); padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; }

        .status-active-msg { display: flex; align-items: center; gap: 16px; padding: 20px; background: rgba(16, 185, 129, 0.05); border-radius: 16px; border: 1px solid rgba(16, 185, 129, 0.1); }
        .status-active-msg h4 { margin-bottom: 4px; }
        .status-active-msg p { font-size: 0.85rem; color: var(--text-muted); }

        .limit-item { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.9rem; color: var(--text-muted); }
        .limit-item span:last-child { font-weight: 700; color: var(--text-main); }
        .btn-upgrade-main { width: 100%; background: var(--primary); color: #fff; border: none; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 20px; transition: 0.3s; }
        .btn-upgrade-main:hover { transform: translateY(-2px); box-shadow: var(--primary-glow); }

        .comparison-section { background: var(--bg-card); border-radius: 24px; border: 1px solid var(--border); padding: 32px; }
        .comparison-table { display: flex; flex-direction: column; gap: 8px; }
        .comp-row { display: grid; grid-template-columns: 1fr 120px 120px; padding: 16px; border-radius: 12px; transition: 0.2s; align-items: center; }
        .comp-row:not(.head):hover { background: var(--bg-badge); }
        .comp-row.head { font-weight: 800; font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border); margin-bottom: 8px; }
        
        .feat-col { display: flex; align-items: center; gap: 12px; }
        .plan-col { text-align: center; font-weight: 700; font-size: 0.9rem; }
        .plan-col.highlight { color: var(--primary); }
        .info-icon { opacity: 0.4; cursor: help; }

        .pricing-cta-section { text-align: center; margin-bottom: 80px; }
        .pricing-cta-section h2 { font-size: 2rem; margin-bottom: 40px; }
        .pricing-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; max-width: 900px; margin: 0 auto; }
        
        .price-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; padding: 40px; text-align: left; position: relative; transition: 0.3s; }
        .price-card.popular { border-color: var(--primary); box-shadow: 0 10px 40px rgba(99, 102, 241, 0.1); transform: scale(1.05); }
        
        .popular-tag { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: var(--primary); color: #fff; padding: 4px 16px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; }
        
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

        @media (max-width: 1000px) {
            .premium-grid { grid-template-columns: 1fr; }
            .pricing-cards { grid-template-columns: 1fr; }
            .price-card.popular { transform: none; margin-top: 20px; }
            .premium-hero h1 { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
}
