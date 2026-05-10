import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useT } from '../../../contexts/LanguageContext';
import { 
    History, Search, Filter, Shield, User, Calendar, ChevronRight, Lock, 
    Crown, Download, Trash2, Clock, CheckCircle2, ArrowRight, AlertTriangle, 
    FileText, Settings, ShieldCheck, Zap, Sparkles, Layout, Terminal, 
    ExternalLink, Globe, Smartphone, Monitor, Moon, Sun, Layers, Database,
    Activity, Fingerprint, Eye, MousePointer2, LayoutGrid
} from 'lucide-react';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import Head from 'next/head';

export default function AuditPage() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [guildData, setGuildData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    if (!guildId || !mounted) return;
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
        const gRes = await api.request(`/config/${guildId}/guild`);
        const gData = gRes.data || gRes;
        setGuildData(gData);

        const isPremiumTier = gData.isPremium || ['premium', 'platinum'].includes(gData.premiumTier);

        if (isPremiumTier) {
            const lRes = await api.request(`/config/${guildId}/audit-logs`);
            setLogs(lRes.data || lRes || []);
        }
    } catch (err) {
        console.error('Failed to fetch audit data:', err);
    } finally {
        setLoading(false);
        window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [guildId, mounted]);

  const filteredLogs = (logs || []).filter(log => {
      const matchesSearch = log.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.userId?.includes(searchTerm);
      const matchesAction = filterAction === 'ALL' || log.action === filterAction;
      return matchesSearch && matchesAction;
  });

  const getActionStyles = (action) => {
      const a = action?.toUpperCase() || '';
      if (a.includes('UPDATE')) return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', label: 'EDIT PROTOCOL', icon: Settings };
      if (a.includes('DELETE') || a.includes('RESET') || a.includes('REMOVE')) return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'DESTRUCTION', icon: Trash2 };
      if (a.includes('SAVE') || a.includes('CREATE') || a.includes('ADD')) return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'DEPLOYMENT', icon: Zap };
      if (a.includes('SEND')) return { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', label: 'DISPATCH', icon: ExternalLink };
      return { bg: 'var(--bg-badge)', color: 'var(--text-muted)', label: 'GENERAL', icon: FileText };
  };

  if (!mounted || loading) return <Skeleton height="600px" />;

  const isPremium = guildData?.isPremium || ['premium', 'platinum'].includes(guildData?.premiumTier);

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>Audit Studio Pro | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #0f172a 0%, var(--text-main) 100%)' }}>
                    <Fingerprint size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>Audit Studio Pro</h1>
                    <div className={`pc-status-tag-v2 ${isPremium ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {isPremium ? 'MONITORAGGIO LIVE ATTIVO' : 'ACCESSO LIMITATO'}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                {isPremium && (
                    <button className="pc-btn-outline-v2" onClick={() => {}}>
                        <Download size={18} />
                        <span>Esporta JSON</span>
                    </button>
                )}
                <button className="pc-btn-primary" onClick={() => router.push(`/config/${guildId}`)} style={{ background: 'var(--primary)' }}>
                    <LayoutGrid size={18} /> <span>Home Guild</span>
                </button>
            </div>
        </header>

        <div className="pc-content-v2">
            {!isPremium ? (
                <div className="pc-pro-gate-box-v2 animate slide-up">
                    <div className="gate-icon-glow-v2">
                        <ShieldCheck size={56} />
                    </div>
                    <h2>Audit Studio Professional</h2>
                    <p>Prendi il controllo totale della tua infrastruttura. Monitora ogni azione dello staff, previeni vulnerabilità e mantieni l'integrità del server.</p>
                    
                    <div className="gate-features-grid-v2">
                        {[
                            { icon: <Terminal size={24} />, title: "Live Traceability", desc: "Traccia ogni singolo comando e cambio di configurazione in tempo reale." },
                            { icon: <Shield size={24} />, title: "Staff Security", desc: "Monitora le attività critiche per prevenire abusi di potere amministrativo." },
                            { icon: <Database size={24} />, title: "Archivio Storico", desc: "Accesso a mesi di log dettagliati esportabili per reportistica esterna." }
                        ].map((f, i) => (
                            <div key={i} className="gate-feature-card-v2">
                                <div className="feature-icon-box-v2">{f.icon}</div>
                                <h4>{f.title}</h4>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>

                    <button className="pc-btn-primary gate-btn-v2" onClick={() => router.push(`/config/${guildId}/premium`)}>
                        <Sparkles size={24} />
                        <span>Sblocca Audit Studio</span>
                    </button>
                </div>
            ) : (
                <div className="v-stack" style={{ gap: '32px' }}>
                    <div className="pc-discovery-hub-v2 animate slide-up">
                        <div className="pc-search-v2">
                            <Search size={22} style={{ color: 'var(--text-muted)' }} />
                            <input 
                                type="text" 
                                placeholder="Cerca nello storico per staff, operazione o identità..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="pc-filter-v2">
                            <Filter size={22} style={{ color: 'var(--text-muted)' }} />
                            <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
                                <option value="ALL">Visualizza Tutti</option>
                                <option value="UPDATE_CONFIG">Configurazione Moduli</option>
                                <option value="UPDATE_WHITELIST">Modifiche Accessi</option>
                                <option value="SAVE_TEMPLATE">Design & Visual Studio</option>
                                <option value="SEND_PANEL">Emissione Pannelli</option>
                            </select>
                        </div>
                    </div>

                    <section className="pc-card-v2 audit-table-container-v2">
                        <div className="table-responsive-v2">
                            <table className="pc-table-v2">
                                <thead>
                                    <tr>
                                        <th>Staff / Responsible</th>
                                        <th>Action Taxonomy</th>
                                        <th>Studio Timeline</th>
                                        <th style={{ textAlign: 'right' }}>Identity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.length > 0 ? filteredLogs.map((log, idx) => {
                                        const styles = getActionStyles(log.action);
                                        return (
                                            <tr key={log._id || idx} className="pc-audit-row-v2">
                                                <td>
                                                    <div className="staff-cell-v2">
                                                        <div className="staff-avatar-box-v2">
                                                            <User size={24} />
                                                        </div>
                                                        <div className="v-stack">
                                                            <span className="staff-name-v2">{log.username || 'System Root'}</span>
                                                            <span className="staff-id-v2">{log.userId || 'VERIX_PROTOCOL'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="action-cell-v2">
                                                        <div className="action-tag-v2" style={{ background: styles.bg, color: styles.color, border: `1px solid ${styles.color}30` }}>
                                                            <styles.icon size={14} />
                                                            <span>{styles.label}</span>
                                                        </div>
                                                        <span className="action-raw-v2">{log.action}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="timeline-cell-v2">
                                                        <Clock size={16} />
                                                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button className="pc-audit-action-btn-v2">
                                                        <ChevronRight size={20} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="4">
                                                <div className="pc-empty-state-v2">
                                                    <div className="empty-icon-v2"><FileText size={48} /></div>
                                                    <h3>Database Protocol Clear</h3>
                                                    <p>Nessuna operazione registrata per questi parametri.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1500px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; color: white; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
            .pc-title-row h1 { font-family: 'Inter'; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 6px; font-size: 0.6rem; font-weight: 700; padding: 4px 10px; border-radius: 100px; }
            .pc-status-tag-v2.on { background: rgba(16, 185, 129, 0.1); color: #10b981; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: #ef4444; }
            .status-dot-v2 { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }
            .pc-btn-outline-v2 { background: var(--bg-badge); color: var(--text-heading); border: 1.5px solid var(--border); padding: 10px 20px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }

            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            
            /* Gate UI */
            .pc-pro-gate-box-v2 { text-align: center; padding: 80px 40px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 40px; }
            .gate-icon-glow-v2 { width: 90px; height: 90px; background: var(--bg-badge); color: var(--text-heading); border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 32px; border: 1px solid var(--border); }
            .pc-pro-gate-box-v2 h2 { font-family: 'Inter'; font-size: 2.2rem; font-weight: 700; color: var(--text-heading); margin-bottom: 12px; }
            .pc-pro-gate-box-v2 p { color: var(--text-muted); font-size: 1.1rem; line-height: 1.6; max-width: 600px; margin: 0 auto 48px; font-weight: 650; }
            
            .gate-features-grid-v2 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 900px; margin: 0 auto 48px; }
            .gate-feature-card-v2 { background: var(--bg-badge); padding: 24px; border-radius: 20px; border: 1px solid var(--border); text-align: left; }
            .feature-icon-box-v2 { color: var(--text-heading); margin-bottom: 16px; background: var(--bg-card); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border); }
            .gate-feature-card-v2 h4 { margin: 0 0 8px 0; color: var(--text-heading); font-weight: 700; }
            .gate-feature-card-v2 p { margin: 0; font-size: 0.85rem; color: var(--text-muted); font-weight: 650; line-height: 1.5; }

            /* Discovery Hub */
            .pc-discovery-hub-v2 { display: flex; gap: 16px; margin-bottom: 32px; }
            .pc-search-v2 { flex: 1; display: flex; align-items: center; gap: 12px; background: var(--bg-card); border: 1px solid var(--border); padding: 0 20px; border-radius: 18px; }
            .pc-search-v2 input { width: 100%; border: none; background: transparent; padding: 16px 0; font-weight: 700; color: var(--text-heading); outline: none; }
            .pc-filter-v2 { display: flex; align-items: center; gap: 12px; background: var(--bg-card); border: 1px solid var(--border); padding: 0 20px; border-radius: 18px; }
            .pc-filter-v2 select { border: none; background: transparent; padding: 16px 0; font-weight: 700; color: var(--text-heading); outline: none; cursor: pointer; min-width: 180px; }

            /* Table V2 */
            .audit-table-container-v2 { padding: 0; overflow: hidden; }
            .pc-table-v2 { width: 100%; border-collapse: collapse; }
            .pc-table-v2 th { text-align: left; padding: 20px 32px; background: var(--bg-badge); color: var(--text-muted); font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid var(--border); }
            .pc-table-v2 td { padding: 24px 32px; border-bottom: 1px solid var(--border); vertical-align: middle; }
            
            .staff-cell-v2 { display: flex; align-items: center; gap: 16px; }
            .staff-avatar-box-v2 { width: 44px; height: 44px; background: var(--bg-badge); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--text-heading); border: 1px solid var(--border); }
            .staff-name-v2 { font-weight: 700; color: var(--text-heading); font-size: 1rem; }
            .staff-id-v2 { font-size: 0.75rem; color: var(--text-muted); font-weight: 700; font-family: monospace; }

            .action-cell-v2 { display: flex; flex-direction: column; gap: 6px; }
            .action-tag-v2 { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 8px; font-size: 0.6rem; font-weight: 700; width: fit-content; }
            .action-raw-v2 { font-size: 0.85rem; color: var(--text-main); font-weight: 750; }

            .timeline-cell-v2 { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 0.9rem; font-weight: 750; }
            
            .pc-audit-action-btn-v2 { width: 40px; height: 40px; border-radius: 12px; background: var(--bg-badge); border: 1px solid var(--border); color: var(--text-heading); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
            .pc-audit-action-btn-v2:hover { background: var(--primary); color: #fff; border-color: var(--primary); transform: translateX(4px); }

            .pc-empty-state-v2 { text-align: center; padding: 80px 0; }
            .empty-icon-v2 { color: var(--border); margin-bottom: 24px; }
            .pc-empty-state-v2 h3 { margin: 0; color: var(--text-heading); font-weight: 700; }
            .pc-empty-state-v2 p { color: var(--text-muted); font-weight: 700; }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
