import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import api from '../../../utils/api';
import OnboardingWizard from '../../../components/OnboardingWizard';
import { 
  Shield, 
  Ticket, 
  Users, 
  Mic2, 
  ArrowRight, 
  RefreshCcw, 
  Zap, 
  Activity, 
  ShieldCheck,
  ExternalLink,
  Info,
  Camera,
  Globe,
  ShieldAlert,
  Power,
  UserPlus,
  Layout as LayoutIcon,
  ChevronRight,
  TrendingUp,
  Box
} from 'lucide-react';

export default function GuildHome() {
  const router = useRouter();
  const { guildId } = router.query;
  const [stats, setStats] = useState({ openTickets: 0, pendingWhitelist: 0, activeVoiceSessions: 0 });
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
      fetchData();
    }
  }, [guildId, mounted]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const responses = await Promise.all([
        api.request(`/config/${guildId}`),
        api.request(`/config/${guildId}/stats`)
      ]);

      const [configData, statsData] = responses;
      
      setConfig(configData);
      setStats(statsData);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Errore durante il caricamento dei dati.');
      setLoading(false);
    }
  };

  const toggleModule = async (moduleName, currentStatus) => {
    setUpdating(moduleName);
    try {
      await api.request(`/config/${guildId}/${moduleName}`, {
        method: 'POST',
        body: JSON.stringify({ enabled: !currentStatus })
      });
      
      await fetchData();
      window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: `Modulo ${moduleName.toUpperCase()} ${!currentStatus ? 'Attivato' : 'Disattivato'}`, type: 'success' } 
      }));
    } catch (error) {
    } finally {
      setUpdating(null);
    }
  };

   if (!mounted || (loading && !config)) return <Skeleton height="600px" />;

  if (error) return (
    <div className="error-container-p animate fade-in">
      <Zap size={48} color="var(--error)" />
      <h2>Connessione Fallita</h2>
      <p>{error}</p>
      <button onClick={fetchData} className="btn-primary">Riprova</button>
    </div>
  );

  return (
    <div className="animate">
      
      {/* Modern Header */}
      <header className="module-header-v2">
         <div className="header-info-p">
            <div className="header-icon-p">
              <Box size={24} />
            </div>
            <div className="header-text-p">
              <h1>Dashboard Operativa</h1>
              <p>Monitoraggio e gestione in tempo reale del bot per <b>{config.guildName || 'il tuo server'}</b>.</p>
            </div>
         </div>
         <div className="header-actions-p" style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={fetchData} className="btn-outline-p">
              <RefreshCcw size={16} className={loading ? 'spin' : ''} /> Aggiorna
            </button>
         </div>
      </header>
      
      {/* Guided Setup */}
      <OnboardingWizard config={config} guildId={guildId} />

      {/* Refined Stats Grid */}
      <div className="stats-grid-p">
         <div className="stat-card-v2">
            <div className="stat-icon-v2 indigo">
              <Ticket size={20} />
            </div>
            <div className="stat-data-v2">
              <span className="stat-label-v2">Ticket Aperti</span>
              <span className="stat-value-v2">{stats.openTickets}</span>
            </div>
            <TrendingUp size={16} className="stat-trend-v2" />
         </div>

         <div className="stat-card-v2">
            <div className="stat-icon-v2 amber">
              <Shield size={20} />
            </div>
            <div className="stat-data-v2">
              <span className="stat-label-v2">Whitelist Pending</span>
              <span className="stat-value-v2">{stats.pendingWhitelist}</span>
            </div>
         </div>

      </div>

      {/* Dashboard Content Layout */}
      <div className="dashboard-grid-p">
          {/* Left: Module Management */}
          <section className="modules-management-p">
              <div className="section-title-p">
                  <Activity size={20} />
                  <h2>Stato Moduli</h2>
              </div>
              
              <div className="modules-list-p">
                  {[
                      { id: 'whitelist', label: 'Sistema Whitelist', desc: 'Gestione cittadini e orali.', icon: ShieldCheck, color: 'var(--primary)', config: config.whitelist },
                      { id: 'tickets', label: 'Support Tickets', desc: 'Assistenza utenti via canali.', icon: Ticket, color: '#3b82f6', config: config.tickets },
                      { id: 'verify', label: 'Sistema Verifica', desc: 'Protezione entry e ruoli.', icon: Shield, color: 'var(--primary)', config: config.verify },

                      { id: 'photocontest', label: 'Photo Contest', desc: 'Eventi e contest community.', icon: Camera, color: '#f59e0b', config: config.photocontest },
                      { id: 'support', label: 'Assistenza Vocale', desc: 'Coda assistenza automatica.', icon: Mic2, color: '#f1c40f', config: config.support },
                      { id: 'fivem', label: 'FiveM Status', desc: 'Tracking server di gioco.', icon: Globe, color: '#3b82f6', config: config.fivem },
                      { id: 'welcome', label: 'Welcome & Leave', desc: 'Accoglienza nuovi membri.', icon: UserPlus, color: 'var(--primary)', config: config.welcome }
                  ].map(module => (
                      <div key={module.id} className="module-toggle-card">
                          <div className="m-card-info">
                              <div className="m-card-icon" style={{ backgroundColor: `${module.color}15`, color: module.color }}>
                                  <module.icon size={24} />
                              </div>
                              <div className="m-card-text">
                                  <h3>{module.label}</h3>
                                  <p>{module.desc}</p>
                              </div>
                          </div>
                          <div className="m-card-action">
                              {updating === module.id && <div className="spinner-s"></div>}
                              <label className="toggle">
                                  <input 
                                      type="checkbox" 
                                      checked={module.config?.enabled} 
                                      onChange={() => toggleModule(module.id, module.config?.enabled)}
                                      disabled={updating === module.id}
                                  />
                                  <span className="slider"></span>
                              </label>
                          </div>
                      </div>
                  ))}
              </div>
          </section>

          {/* Right: Navigation & Global Actions */}
          <aside className="dashboard-side-p">
              <div className="section-title-p">
                  <Zap size={20} />
                  <h2>Navigazione</h2>
              </div>
              <div className="nav-stack-p">
                  {[
                      { label: 'Whitelist', path: 'whitelist', emoji: '🛡️' },
                      { label: 'Verifica', path: 'verify', emoji: '✅' },
                      { label: 'Supporto', path: 'tickets', emoji: '🎫' },
                      { label: 'Assistenza', path: 'support', emoji: '🎙️' },
                      { label: 'Contest', path: 'photocontest', emoji: '📸' },
                      { label: 'Status Server', path: 'fivem', emoji: '🎮' },
                      { label: 'Embed Suite', path: 'embeds', emoji: '📝' },
                      { label: 'Accoglienza', path: 'welcome', emoji: '👋' },
                      { label: 'Config Globali', path: 'global', emoji: '⚙️' }
                  ].map(nav => (
                      <button key={nav.path} onClick={() => router.push(`/config/${guildId}/${nav.path}`)} className="nav-item-v2">
                          <span className="nav-label-v2">{nav.emoji} &nbsp; {nav.label}</span>
                          <ChevronRight size={14} className="nav-arrow-v2" />
                      </button>
                  ))}
                  
                  <div className="side-separator-p"></div>
                  
                  <button 
                      onClick={() => { if(confirm('Tutte le impostazioni verranno azzerate. Confermi?')) alert('Inviato!'); }}
                      className="btn-danger-v2"
                  >
                      <RefreshCcw size={16} /> Reset Totale
                  </button>
              </div>
          </aside>
      </div>

      <style jsx>{`
          .module-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; padding: 0 4px; }
          .header-info-p { display: flex; align-items: center; gap: 16px; }
          .header-icon-p { width: 44px; height: 44px; background: rgba(129, 140, 248, 0.1); color: var(--primary); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
          .header-text-p h1 { font-size: 1.5rem; margin-bottom: 2px; }
          .header-text-p p { font-size: 0.85rem; color: var(--text-muted); }
          .btn-outline-p { background: rgba(255,255,255,0.02); border: 1px solid var(--border); color: white; padding: 8px 16px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 700; transition: 0.2s; }
          .btn-outline-p:hover { background: rgba(255,255,255,0.05); }

          .stats-grid-p { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
          .stat-card-v2 { background: var(--bg-card); border: 1px solid var(--border); padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 16px; position: relative; transition: 0.2s; }
          .stat-card-v2:hover { border-color: var(--primary); transform: translateY(-2px); }
          .stat-icon-v2 { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
          .stat-icon-v2.indigo { background: rgba(129,140,248,0.1); color: var(--primary); }
          .stat-icon-v2.amber { background: rgba(245,158,11,0.1); color: #f59e0b; }
          .stat-icon-v2.rose { background: rgba(244,114,182,0.1); color: #f472b6; }
          .stat-data-v2 { display: flex; flex-direction: column; }
          .stat-label-v2 { font-size: 0.75rem; color: var(--text-muted); font-weight: 700; }
          .stat-value-v2 { font-size: 1.4rem; font-weight: 800; color: white; }
          .stat-trend-v2 { position: absolute; top: 16px; right: 16px; color: #10b981; opacity: 0.5; }

          .dashboard-grid-p { display: grid; grid-template-columns: 1fr 300px; gap: 32px; }
          .section-title-p { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; color: var(--text-muted); }
          .section-title-p h2 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 900; color: var(--text-dim); }

          .modules-list-p { display: flex; flex-direction: column; gap: 12px; }
          .module-toggle-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; transition: 0.2s; }
          .module-toggle-card:hover { border-color: var(--primary); background: rgba(255,255,255,0.01); }
          .m-card-info { display: flex; align-items: center; gap: 16px; }
          .m-card-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
          .m-card-text h3 { font-size: 0.95rem; margin-bottom: 2px; }
          .m-card-text p { font-size: 0.75rem; color: var(--text-muted); }
          .m-card-action { display: flex; align-items: center; gap: 12px; }
          .spinner-s { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }

          .nav-stack-p { display: flex; flex-direction: column; gap: 8px; }
          .nav-item-v2 { display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted); padding: 12px 16px; border-radius: 12px; cursor: pointer; font-size: 0.85rem; font-weight: 700; transition: 0.2s; }
          .nav-item-v2:hover { background: rgba(255,255,255,0.03); color: white; border-color: var(--primary); transform: translateX(4px); }
          .nav-arrow-v2 { opacity: 0.3; transition: 0.2s; }
          .nav-item-v2:hover .nav-arrow-v2 { color: var(--primary); opacity: 1; transform: translateX(2px); }

          .side-separator-p { height: 1px; background: var(--border); margin: 12px 0; }
          .btn-danger-v2 { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; background: rgba(244, 63, 94, 0.05); color: var(--error); border: 1px solid rgba(244, 63, 94, 0.1); border-radius: 12px; cursor: pointer; font-size: 0.85rem; font-weight: 900; transition: 0.2s; }
          .btn-danger-v2:hover { background: var(--error); color: white; }

          .error-container-p { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; gap: 20px; text-align: center; }

          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @media (max-width: 1000px) { .dashboard-grid-p { grid-template-columns: 1fr; } .stats-grid-p { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
