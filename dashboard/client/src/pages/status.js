import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useT } from '../contexts/LanguageContext';
import api from '../utils/api';
import { 
  Activity, 
  Database, 
  Cpu, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Server
} from 'lucide-react';

export default function StatusPage() {
  const { t } = useT();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [privateBot, setPrivateBot] = useState(null);

  const handleBack = (e) => {
    e.preventDefault();
    const from = router.query.from;
    if (from) {
      router.push(from);
    } else {
      // Check if there is history, otherwise go to selector
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push('/selector');
      }
    }
  };

  const fromQuery = router.query.from;
  const guildId = router.query.guildId || (fromQuery && fromQuery.startsWith('/config/') ? fromQuery.split('/')[2] : null);

  const fetchStatus = async () => {
    try {
      const res = await api.request('/health');
      setData(res);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch health status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrivateBotStatus = async () => {
    if (!guildId) return;
    try {
      const res = await api.request(`/private-bot/${guildId}`);
      if (res && res.success && res.data && res.data.bot) {
        setPrivateBot(res.data.bot);
      }
    } catch (e) {
      console.error('Failed to fetch private bot status:', e);
    }
  };

  useEffect(() => {
    fetchStatus();
    if (router.isReady) {
      fetchPrivateBotStatus();
    }
    const interval = setInterval(() => {
      fetchStatus();
      fetchPrivateBotStatus();
    }, 30000);
    return () => clearInterval(interval);
  }, [router.isReady, router.query]);

  const formatUptime = (seconds) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok': return '#10b981';
      case 'degraded': return '#f59e0b';
      case 'down': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ok': return t('status_page.all_operational');
      case 'degraded': return t('status_page.degraded_performance');
      default: return t('status_page.major_outage');
    }
  };

  return (
    <div className="status-container">
      <Head>
        <title>{t('status_page.title')} | Verix Studio</title>
      </Head>

      <nav className="status-nav">
        <a href="#" className="back-btn" onClick={handleBack}>
          <ArrowLeft size={18} />
          <span>{t('status_page.back_to_dashboard')}</span>
        </a>
        <div className="verix-logo">
           <img src="/logo.png" alt="Verix Studio" className="logo-round" />
        </div>
      </nav>

      <main className="status-main">
        {loading ? (
          <div className="status-loading">
            <RefreshCw className="animate-spin" />
            <p>{t('status_page.checking')}</p>
          </div>
        ) : (
          <>
            {privateBot && (
              <div className="platinum-bot-hero animate fade-in">
                <div className="platinum-badge">
                  <span className="sparkle">✨</span> PLATINUM EXCLUSIVE
                </div>
                <div className="platinum-bot-content">
                  <div className="platinum-bot-avatar">
                    <img 
                      src={privateBot.avatar ? `https://cdn.discordapp.com/avatars/${privateBot.clientId}/${privateBot.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                      alt="" 
                      onError={(e) => { e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }}
                    />
                    <div className={`avatar-status-dot ${privateBot.status === 'online' ? 'online' : 'offline'}`}></div>
                  </div>
                  <div className="platinum-bot-info">
                    <h2>{privateBot.customName || 'Custom White-Label Bot'}</h2>
                    <p className="bot-id">Client ID: <code>{privateBot.clientId}</code></p>
                    <div className="live-metrics">
                      <div className="metric-badge">
                        <span className="metric-dot online"></span>
                        <span>Gateway: {privateBot.status === 'online' ? 'ONLINE' : privateBot.status === 'error' ? 'ERROR' : 'OFFLINE'}</span>
                      </div>
                      {privateBot.wsPing !== null && privateBot.wsPing !== undefined && (
                        <div className="metric-badge latency">
                          <span>Ping: <strong>{privateBot.wsPing}ms</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="status-hero" style={{ '--accent': getStatusColor(data?.status) }}>
              <div className="status-icon">
                {data?.status === 'ok' ? <ShieldCheck size={48} /> : <AlertCircle size={48} />}
              </div>
              <div className="status-text">
                <h1>{getStatusLabel(data?.status)}</h1>
                <p>{t('status_page.refresh_desc')}</p>
              </div>
            </div>

            <div className="status-grid">
              {/* Database Status */}
              <div className="status-card">
                <div className="card-header">
                  <Database size={20} />
                  <h3>{t('status_page.database')}</h3>
                  <div className={`status-dot ${data?.database?.status === 'connected' ? 'online' : 'offline'}`}></div>
                </div>
                <div className="card-body">
                  <span className="status-value">{data?.database?.status === 'connected' ? t('status_page.connected') : t('status_page.disconnected')}</span>
                </div>
              </div>

              {/* Discord Gateway */}
              <div className="status-card">
                <div className="card-header">
                  <Activity size={20} />
                  <h3>{t('status_page.discord_api')}</h3>
                  <div className={`status-dot ${data?.discord?.ready ? 'online' : 'offline'}`}></div>
                </div>
                <div className="card-body">
                  <span className="status-value">{data?.discord?.ready ? t('status_page.operational') : t('status_page.disconnected')}</span>
                  {data?.discord?.wsPing && (
                    <span className="status-sub">{t('status_page.api_latency')}: {data.discord.wsPing}ms</span>
                  )}
                </div>
              </div>

              {/* Uptime */}
              <div className="status-card">
                <div className="card-header">
                  <Clock size={20} />
                  <h3>{t('status_page.uptime')}</h3>
                </div>
                <div className="card-body">
                  <span className="status-value">{formatUptime(data?.uptime || 0)}</span>
                  <span className="status-sub">Verix Engine v1.5.0</span>
                </div>
              </div>

              {/* Memory */}
              <div className="status-card">
                <div className="card-header">
                  <Cpu size={20} />
                  <h3>{t('status_page.memory_usage')}</h3>
                </div>
                <div className="card-body">
                  <span className="status-value">{data?.process?.memoryMb || 0} MB</span>
                  <span className="status-sub">Node.js {data?.process?.node || 'v18+'}</span>
                </div>
              </div>
            </div>

            <div className="status-footer">
               <p>{t('status_page.last_update')}: {lastUpdate?.toLocaleTimeString()}</p>
            </div>
          </>
        )}
      </main>

      <style jsx>{`
        .status-container {
          min-height: 100vh;
          background: var(--bg-main);
          color: var(--text-main);
          font-family: 'Outfit', 'Inter', sans-serif;
          padding: 40px 20px;
        }

        .status-nav {
          max-width: 1000px;
          margin: 0 auto 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 600;
          transition: 0.2s;
          padding: 10px 18px;
          background: var(--bg-card);
          border-radius: 14px;
          border: 1px solid var(--border);
        }

        .back-btn:hover {
          color: var(--text-heading);
          background: var(--bg-badge);
          transform: translateX(-4px);
        }

        .verix-logo {
           display: flex;
           align-items: center;
        }
        .logo-round {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--border);
        }
        .v-accent { color: var(--primary); }
        .s-accent { color: #a855f7; }

        .status-main {
          max-width: 1000px;
          margin: 0 auto;
        }

        .status-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 100px 0;
          color: var(--text-muted);
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .status-hero {
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 50px;
          border-radius: 32px;
          display: flex;
          align-items: center;
          gap: 40px;
          margin-bottom: 32px;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-premium);
        }

        .status-hero::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 8px; height: 100%;
          background: var(--accent);
          box-shadow: 0 0 25px var(--accent);
        }

        .status-icon {
          width: 80px;
          height: 80px;
          background: var(--bg-badge);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          border: 1px solid var(--border);
          flex-shrink: 0;
        }

        .status-text h1 {
          font-size: 2.2rem;
          font-weight: 800;
          margin: 0 0 8px 0;
          color: var(--text-heading);
        }

        .status-text p {
          color: var(--text-muted);
          margin: 0;
          font-size: 0.95rem;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 20px;
        }

        .status-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 28px;
          border-radius: 24px;
          transition: all 0.3s ease;
        }

        .status-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
          background: var(--bg-badge);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          color: var(--text-muted);
          opacity: 0.8;
        }

        .card-header h3 {
          font-size: 0.85rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin: 0;
          flex: 1;
          color: var(--text-main);
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .status-dot.online { background: #10b981; box-shadow: 0 0 10px #10b981; }
        .status-dot.offline { background: #ef4444; box-shadow: 0 0 10px #ef4444; }

        .card-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .status-value {
          font-size: 1.4rem;
          font-weight: 800;
          color: #ffffff;
        }

        .status-sub {
          font-size: 0.85rem;
          color: #71717a;
        }

        .status-footer {
          margin-top: 60px;
          text-align: center;
          color: #52525b;
          font-size: 0.9rem;
        }

        .platinum-bot-hero {
          background: linear-gradient(135deg, rgba(30, 27, 75, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 32px;
          padding: 32px;
          margin-bottom: 32px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 32px 0 rgba(139, 92, 246, 0.1);
          backdrop-filter: blur(12px);
          animation: slideDown 0.4s ease-out;
        }

        .platinum-bot-hero::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167, 139, 250, 0.4), transparent);
        }

        .platinum-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(90deg, #a78bfa 0%, #ec4899 100%);
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 900;
          letter-spacing: 2px;
          padding: 6px 14px;
          border-radius: 99px;
          margin-bottom: 20px;
          box-shadow: 0 0 15px rgba(167, 139, 250, 0.3);
        }

        .platinum-bot-content {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .platinum-bot-avatar {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 2px solid rgba(167, 139, 250, 0.3);
          box-shadow: 0 0 20px rgba(167, 139, 250, 0.15);
        }

        .platinum-bot-avatar img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .avatar-status-dot {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 3px solid #0b0f19;
        }
        .avatar-status-dot.online { background: #10b981; box-shadow: 0 0 10px #10b981; }
        .avatar-status-dot.offline { background: #ef4444; box-shadow: 0 0 10px #ef4444; }

        .platinum-bot-info h2 {
          font-size: 1.6rem;
          font-weight: 800;
          margin: 0 0 4px 0;
          color: #ffffff;
          background: linear-gradient(90deg, #ffffff 0%, #e2e8f0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .bot-id {
          color: var(--text-muted);
          font-size: 0.85rem;
          margin: 0 0 16px 0;
        }

        .bot-id code {
          background: rgba(167, 139, 250, 0.1);
          color: #a78bfa;
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 0.8rem;
        }

        .live-metrics {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .metric-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 6px 14px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .metric-badge.latency {
          border-color: rgba(167, 139, 250, 0.15);
          background: rgba(167, 139, 250, 0.05);
        }

        .metric-badge.latency strong {
          color: #a78bfa;
          font-weight: 800;
        }

        .metric-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .metric-dot.online { background: #10b981; box-shadow: 0 0 8px #10b981; }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .platinum-bot-hero {
            padding: 24px;
          }
          .platinum-bot-content {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }
          .live-metrics {
            justify-content: center;
          }
          .status-hero {
            flex-direction: column;
            text-align: center;
            padding: 40px;
            gap: 20px;
          }
          .status-hero::before { width: 100%; height: 6px; }
          .status-text h1 { font-size: 1.6rem; }
        }
      `}</style>
    </div>
  );
}
