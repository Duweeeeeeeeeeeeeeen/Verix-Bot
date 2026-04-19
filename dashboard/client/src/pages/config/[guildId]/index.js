import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
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
  UserPlus
} from 'lucide-react';

export default function GuildHome() {
  const router = useRouter();
  const { guildId } = router.query;
  const [stats, setStats] = useState({ openTickets: 0, pendingWhitelist: 0, activeVoiceSessions: 0 });
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    if (guildId) {
      fetchData();
    }
  }, [guildId]);

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
      const endpoint = moduleName;
      await api.request(`/config/${guildId}/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify({ enabled: !currentStatus })
      });
      
      await fetchData();
      window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: `Modulo ${moduleName.toUpperCase()} ${!currentStatus ? 'Attivato' : 'Disattivato'}`, type: 'success' } 
      }));
    } catch (error) {
      // Global errorHandler takes care of failure toast if success: false
    } finally {
      setUpdating(null);
    }
  };

  if (loading && !config) return (
    <Layout guildId={guildId}>
      <div className="animate">
        <div style={{ marginBottom: '40px' }}>
          <Skeleton width="300px" height="40px" style={{ marginBottom: '12px' }} />
          <Skeleton width="500px" height="20px" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
          <Skeleton height="160px" style={{ borderRadius: '20px' }} />
          <Skeleton height="160px" style={{ borderRadius: '20px' }} />
          <Skeleton height="160px" style={{ borderRadius: '20px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Skeleton height="100px" style={{ borderRadius: '20px' }} />
            <Skeleton height="100px" style={{ borderRadius: '20px' }} />
          </div>
          <Skeleton height="300px" style={{ borderRadius: '20px' }} />
        </div>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout guildId={guildId}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '24px', textAlign: 'center' }}>
        <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', border: '2px solid var(--error)' }}>
            <Zap size={48} color="var(--error)" />
        </div>
        <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>Sistema Bloccato</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>Non siamo riusciti a caricare i dati: <br/><strong>{error}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={fetchData} className="btn-primary" style={{ padding: '12px 24px' }}>
                <RefreshCcw size={18} /> Riprova
            </button>
            <button onClick={() => router.push('/selector')} className="btn-outline" style={{ padding: '12px 24px' }}>
                Torna al Selettore
            </button>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout guildId={guildId}>
      <div className="animate">
        {/* Welcome Header */}
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div className="align-center" style={{ color: 'var(--primary)', marginBottom: '8px' }}>
                <Zap size={18} fill="currentColor" />
                <span className="text-label" style={{ marginBottom: 0 }}>Centro operativo</span>
            </div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '900', marginBottom: '8px', letterSpacing: '-1.5px' }}>Dashboard Home</h1>
            <p className="text-description" style={{ fontSize: '1.1rem' }}>Monitoraggio real-time e gestione moduli attivi.</p>
          </div>
          <button onClick={fetchData} className="btn-outline" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <RefreshCcw size={18} className={loading ? 'spin' : ''} /> Aggiorna Dati
          </button>
        </header>
        
        {/* Setup Wizard (Guided Onboarding) */}
        <OnboardingWizard config={config} guildId={guildId} />
 
        {/* Dynamic Stats Grid */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
           <div className="card stats-card" style={{ borderBottom: '4px solid var(--primary)' }}>
              <div className="align-center" style={{ justifyContent: 'space-between' }}>
                <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', display: 'flex' }}>
                    <Ticket color="var(--primary)" size={22} />
                </div>
                <span className="badge badge-success">Live</span>
              </div>
              <div className="stats-value">{stats.openTickets}</div>
              <div className="text-label" style={{ textTransform: 'none', letterSpacing: 0 }}>Ticket di Supporto Aperti</div>
           </div>

           <div className="card stats-card" style={{ borderBottom: '4px solid var(--accent)' }}>
              <div className="align-center" style={{ justifyContent: 'space-between' }}>
                <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', display: 'flex' }}>
                    <Shield color="var(--accent)" size={22} />
                </div>
                <span className="badge badge-warning">Pending</span>
              </div>
              <div className="stats-value">{stats.pendingWhitelist}</div>
              <div className="text-label" style={{ textTransform: 'none', letterSpacing: 0 }}>Candidature Whitelist</div>
           </div>

           <div className="card stats-card" style={{ borderBottom: '4px solid #f472b6' }}>
              <div className="align-center" style={{ justifyContent: 'space-between' }}>
                <div style={{ padding: '10px', background: 'rgba(244,114,182,0.1)', borderRadius: '12px', display: 'flex' }}>
                    <Mic2 color="#f472b6" size={22} />
                </div>
                <span className="badge" style={{ background: 'rgba(244,114,182,0.1)', color: '#f472b6', border: '1px solid rgba(244,114,182,0.2)' }}>Active</span>
              </div>
              <div className="stats-value">{stats.activeVoiceSessions}</div>
              <div className="text-label" style={{ textTransform: 'none', letterSpacing: 0 }}>Colloqui Vocali Simultanei</div>
           </div>
        </div>

        {/* Modules Control Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
            <section>
                <div className="align-center" style={{ marginBottom: '24px' }}>
                    <Activity size={24} color="var(--primary)" />
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Stato Moduli</h2>
                    <HelpTooltip text="Attiva o disattiva i sistemi principali." />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Whitelist Module Toggle */}
                    <div className="card glass-heavy" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
                        <div className="align-center" style={{ gap: '20px' }}>
                            <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)', display: 'flex' }}>
                                <ShieldCheck size={28} color="var(--primary)" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '750', marginBottom: '4px' }}>Sistema Whitelist</h3>
                                <p className="text-description" style={{ marginTop: 0 }}>
                                    {config?.whitelist?.enabled ? 'Attivo - Candidature aperte' : 'Disattivato - Servizio non disponibile'}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {updating === 'whitelist' && <div className="spinner-small"></div>}
                            <label className="toggle">
                                <input 
                                    type="checkbox" 
                                    checked={config.whitelist?.enabled} 
                                    onChange={() => toggleModule('whitelist', config.whitelist?.enabled)}
                                    disabled={updating === 'whitelist'}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>

                    {/* Tickets Module Toggle */}
                    <div className="card glass-heavy" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
                        <div className="align-center" style={{ gap: '20px' }}>
                            <div style={{ padding: '14px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.2)', display: 'flex' }}>
                                <Ticket size={28} color="var(--accent)" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '750', marginBottom: '4px' }}>Supporto Ticket</h3>
                                <p className="text-description" style={{ marginTop: 0 }}>
                                    {config?.tickets?.enabled ? 'Attivo - Bot pronto al supporto' : 'Disattivato - Nessun ticket creabile'}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {updating === 'tickets' && <div className="spinner-small"></div>}
                            <label className="toggle">
                                <input 
                                    type="checkbox" 
                                    checked={config.tickets?.enabled} 
                                    onChange={() => toggleModule('tickets', config.tickets?.enabled)}
                                    disabled={updating === 'tickets'}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>

                    {/* Verify Module Toggle */}
                    <div className="card glass-heavy" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
                        <div className="align-center" style={{ gap: '20px' }}>
                            <div style={{ padding: '14px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '16px', border: '1px solid rgba(var(--primary-rgb), 0.2)', display: 'flex' }}>
                                <Shield size={28} color="var(--primary)" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '750', marginBottom: '4px' }}>Sistema Verifica</h3>
                                <p className="text-description" style={{ marginTop: 0 }}>
                                    {config?.verify?.enabled ? 'Attivo - Protezione entry attiva' : 'Disattivato - Accesso libero'}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {updating === 'verify' && <div className="spinner-small"></div>}
                            <label className="toggle">
                                <input 
                                    type="checkbox" 
                                    checked={config.verify?.enabled} 
                                    onChange={() => toggleModule('verify', config.verify?.enabled)}
                                    disabled={updating === 'verify'}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>

                    {/* Voice Module Toggle */}
                    <div className="card glass-heavy" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
                        <div className="align-center" style={{ gap: '20px' }}>
                            <div style={{ padding: '14px', background: 'rgba(244,114,182,0.1)', borderRadius: '16px', border: '1px solid rgba(244,114,182,0.2)', display: 'flex' }}>
                                <Mic2 size={28} color="#f472b6" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '750', marginBottom: '4px' }}>Voice Interview</h3>
                                <p className="text-description" style={{ marginTop: 0 }}>
                                    {config?.voice?.enabled ? 'Attivo - Stanze colloqui pronte' : 'Disattivato - Canali chiusi'}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {updating === 'voice' && <div className="spinner-small"></div>}
                            <label className="toggle">
                                <input 
                                    type="checkbox" 
                                    checked={config.voice?.enabled} 
                                    onChange={() => toggleModule('voice', config.voice?.enabled)}
                                    disabled={updating === 'voice'}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>

                    {/* Photo Contest Toggle */}
                    <div className="card glass-heavy" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
                        <div className="align-center" style={{ gap: '20px' }}>
                            <div style={{ padding: '14px', background: 'rgba(245,158,11,0.1)', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.2)', display: 'flex' }}>
                                <Camera size={28} color="#f59e0b" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '750', marginBottom: '4px' }}>Photo Contest</h3>
                                <p className="text-description" style={{ marginTop: 0 }}>
                                    {config?.photocontest?.enabled ? 'Attivo - Evento in corso' : 'Disattivato - Nessun contest'}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {updating === 'photocontest' && <div className="spinner-small"></div>}
                            <label className="toggle">
                                <input 
                                    type="checkbox" 
                                    checked={config.photocontest?.enabled} 
                                    onChange={() => toggleModule('photocontest', config.photocontest?.enabled)}
                                    disabled={updating === 'photocontest'}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>

                    {/* FiveM Toggle */}
                    <div className="card glass-heavy" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
                        <div className="align-center" style={{ gap: '20px' }}>
                            <div style={{ padding: '14px', background: 'rgba(59,130,246,0.1)', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.2)', display: 'flex' }}>
                                <Globe size={28} color="#3b82f6" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '750', marginBottom: '4px' }}>FiveM Status</h3>
                                <p className="text-description" style={{ marginTop: 0 }}>
                                    {config?.fivem?.enabled ? 'Attivo - Tracking server in corso' : 'Disattivato - Pinger spento'}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {updating === 'fivem' && <div className="spinner-small"></div>}
                            <label className="toggle">
                                <input 
                                    type="checkbox" 
                                    checked={config.fivem?.enabled} 
                                    onChange={() => toggleModule('fivem', config.fivem?.enabled)}
                                    disabled={updating === 'fivem'}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>

                    {/* Welcome Module Toggle */}
                    <div className="card glass-heavy" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
                        <div className="align-center" style={{ gap: '20px' }}>
                            <div style={{ padding: '14px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '16px', border: '1px solid rgba(var(--primary-rgb), 0.2)', display: 'flex' }}>
                                <UserPlus size={28} color="var(--primary)" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '750', marginBottom: '4px' }}>Welcome & Leave</h3>
                                <p className="text-description" style={{ marginTop: 0 }}>
                                    {config?.welcome?.enabled ? 'Attivo - Messaggi d\'accoglienza attivi' : 'Disattivato - Nessun benvenuto inviato'}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {updating === 'welcome' && <div className="spinner-small"></div>}
                            <label className="toggle">
                                <input 
                                    type="checkbox" 
                                    checked={config.welcome?.enabled} 
                                    onChange={() => toggleModule('welcome', config.welcome?.enabled)}
                                    disabled={updating === 'welcome'}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Actions & Links */}
            <section>
                <div className="align-center" style={{ marginBottom: '24px' }}>
                    <Zap size={24} color="var(--warning)" />
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Azioni Rapide</h2>
                </div>
                <div className="card" style={{ background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <button onClick={() => router.push(`/config/${guildId}/whitelist`)} className="btn-action">
                        <span>🛡️ Configura Whitelist</span>
                        <ArrowRight size={18} />
                    </button>
                    <button onClick={() => router.push(`/config/${guildId}/verify`)} className="btn-action">
                        <span>✅ Sistema Verifica</span>
                        <ArrowRight size={18} />
                    </button>
                    <button onClick={() => router.push(`/config/${guildId}/tickets`)} className="btn-action">
                        <span>🎫 Support Tickets</span>
                        <ArrowRight size={18} />
                    </button>
                    <button onClick={() => router.push(`/config/${guildId}/photocontest`)} className="btn-action">
                        <span>📸 Photo Contest</span>
                        <ArrowRight size={18} />
                    </button>
                    <button onClick={() => router.push(`/config/${guildId}/fivem`)} className="btn-action">
                        <span>🎮 FiveM Status</span>
                        <ArrowRight size={18} />
                    </button>
                    <button onClick={() => router.push(`/config/${guildId}/embeds`)} className="btn-action">
                        <span>📝 Embed Suite</span>
                        <ArrowRight size={18} />
                    </button>
                    <button onClick={() => router.push(`/config/${guildId}/welcome`)} className="btn-action" style={{ background: 'rgba(var(--primary-rgb), 0.05)' }}>
                        <span>👋 Welcome & Leave</span>
                        <ArrowRight size={18} />
                    </button>
                    <button onClick={() => router.push(`/config/${guildId}/global`)} className="btn-action" style={{ borderColor: 'rgba(var(--primary-rgb), 0.3)', background: 'rgba(var(--primary-rgb), 0.05)' }}>
                        <span>⚙️ Impostazioni Globali</span>
                        <ArrowRight size={18} />
                    </button>
                    <button onClick={() => router.push(`/config/${guildId}/audit-logs`)} className="btn-action">
                        <span>📜 Audit Logs</span>
                        <ArrowRight size={18} />
                    </button>
                    <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }}></div>
                    <button 
                        onClick={() => { if(confirm('Attenzione: Questa azione resetterà tutte le impostazioni. Procedere?')) alert('Reset inviato!'); }}
                        className="btn-danger"
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        <RefreshCcw size={18} /> Reset Configurazione Totale
                    </button>
                </div>
            </section>
        </div>
      </div>

      <style jsx>{`
        .stats-grid .card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 15px 45px -10px rgba(0,0,0,0.5);
        }

        .btn-action {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border);
            color: white;
            padding: 16px 20px;
            border-radius: 14px;
            cursor: pointer;
            font-weight: 600;
            transition: var(--transition-fast);
        }

        .btn-action:hover {
            background: rgba(255,255,255,0.08);
            border-color: var(--text-muted);
            transform: translateX(4px);
        }

        .spinner-small {
            width: 18px;
            height: 18px;
            border: 2px solid rgba(255,255,255,0.1);
            border-top: 2px solid var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        .spin {
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
      `}</style>
    </Layout>
  );
}
