import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useT } from '../../../contexts/LanguageContext';
import { 
    History, Search, Filter, Shield, User, Calendar, ChevronRight, Lock, 
    Crown, Download, Trash2, Clock, CheckCircle2, ArrowRight, AlertTriangle, 
    FileText, Settings, ShieldCheck, Zap, Sparkles, Layout, Terminal, 
    ExternalLink, Globe, Smartphone, Monitor, Moon, Sun, Layers, Database,
    Activity, Fingerprint, Eye, MousePointer2
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
      if (a.includes('UPDATE')) return { bg: '#eff6ff', color: '#3b82f6', label: 'EDIT PROTOCOL', icon: Settings };
      if (a.includes('DELETE') || a.includes('RESET') || a.includes('REMOVE')) return { bg: '#fef2f2', color: '#ef4444', label: 'DESTRUCTION', icon: Trash2 };
      if (a.includes('SAVE') || a.includes('CREATE') || a.includes('ADD')) return { bg: '#ecfdf5', color: '#10b981', label: 'DEPLOYMENT', icon: Zap };
      if (a.includes('SEND')) return { bg: '#f5f3ff', color: '#8b5cf6', label: 'DISPATCH', icon: ExternalLink };
      return { bg: '#f8fafc', color: '#64748b', label: 'GENERAL', icon: FileText };
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
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)' }}>
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
                <button className="pc-btn-primary" onClick={() => router.push(`/config/${guildId}`)} style={{ background: '#1e293b' }}>
                    <LayoutGrid size={18} /> <span>Home Guild</span>
                </button>
            </div>
        </header>

        <div className="pc-content-v2">
            {!isPremium ? (
                <div className="pc-pro-gate-box-v2 animate slide-up" style={{ padding: '120px 40px', background: 'white', borderRadius: '40px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: 'var(--shadow-premium)', maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="gate-icon-glow-v2" style={{ width: '110px', height: '110px', background: '#f8fafc', color: '#1e293b', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1.5px solid #e2e8f0' }}>
                        <ShieldCheck size={56} />
                    </div>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: '3rem', fontWeight: 950, color: '#1e293b', marginBottom: '16px', letterSpacing: '-1.5px' }}>Audit Studio Professional</h2>
                    <p style={{ fontSize: '1.25rem', color: '#64748b', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 56px', fontWeight: 650 }}>Prendi il controllo totale della tua infrastruttura. Monitora ogni azione dello staff, previeni vulnerabilità e mantieni l'integrità del server.</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', maxWidth: '1000px', margin: '0 auto 64px' }}>
                        {[
                            { icon: <Terminal size={24} />, title: "Live Traceability", desc: "Traccia ogni singolo comando e cambio di configurazione in tempo reale." },
                            { icon: <Shield size={24} />, title: "Staff Security", desc: "Monitora le attività critiche per prevenire abusi di potere amministrativo." },
                            { icon: <Database size={24} />, title: "Archivio Storico", desc: "Accesso a mesi di log dettagliati esportabili per reportistica esterna." }
                        ].map((f, i) => (
                            <div key={i} style={{ background: '#f8fafc', padding: '32px', borderRadius: '28px', border: '1.5px solid #e2e8f0', textAlign: 'left', transition: '0.3s' }}>
                                <div style={{ color: '#1e293b', marginBottom: '20px', background: 'white', width: '52px', height: '52px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>{f.icon}</div>
                                <h4 style={{ margin: '0 0 10px 0', fontWeight: 950, color: '#1e293b', fontSize: '1.15rem' }}>{f.title}</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 700, lineHeight: 1.6 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>

                    <button className="pc-btn-primary" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '22px 64px', fontSize: '1.2rem', borderRadius: '22px', margin: '0 auto' }} onClick={() => router.push(`/config/${guildId}/premium`)}>
                        <Sparkles size={24} />
                        <span>Sblocca Audit Studio</span>
                    </button>
                </div>
            ) : (
                <div className="v-stack" style={{ gap: '32px' }}>
                    <div className="pc-discovery-hub-v2 animate slide-up" style={{ display: 'flex', gap: '24px' }}>
                        <div className="pc-search-v2" style={{ flex: 1, background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '24px', padding: '0 28px', display: 'flex', alignItems: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
                            <Search size={22} style={{ color: '#94a3b8' }} />
                            <input 
                                style={{ width: '100%', border: 'none', background: 'transparent', padding: '22px 20px', fontWeight: 900, outline: 'none', color: '#1e293b', fontSize: '1.1rem' }}
                                type="text" 
                                placeholder="Cerca nello storico per staff, operazione o identità..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="pc-filter-v2" style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '24px', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
                            <Filter size={22} style={{ color: '#94a3b8' }} />
                            <select style={{ border: 'none', background: 'transparent', padding: '22px 0', fontWeight: 950, color: '#1e293b', outline: 'none', cursor: 'pointer', minWidth: '240px', fontSize: '1rem' }} value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
                                <option value="ALL">Visualizza Tutti</option>
                                <option value="UPDATE_CONFIG">Configurazione Moduli</option>
                                <option value="UPDATE_WHITELIST">Modifiche Accessi</option>
                                <option value="SAVE_TEMPLATE">Design & Visual Studio</option>
                                <option value="SEND_PANEL">Emissione Pannelli</option>
                            </select>
                        </div>
                    </div>

                    <section className="pc-card-v2" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: 'var(--shadow-premium)' }}>
                        <div style={{ width: '100%', overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                                        <th style={{ textAlign: 'left', padding: '24px 40px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Staff / Responsible</th>
                                        <th style={{ textAlign: 'left', padding: '24px 40px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Action Taxonomy</th>
                                        <th style={{ textAlign: 'left', padding: '24px 40px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Studio Timeline</th>
                                        <th style={{ textAlign: 'right', padding: '24px 40px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Identity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.length > 0 ? filteredLogs.map((log, idx) => {
                                        const styles = getActionStyles(log.action);
                                        return (
                                            <tr key={log._id || idx} className="pc-audit-row-v2" style={{ borderBottom: '1.5px solid #f1f5f9', transition: '0.3s' }}>
                                                <td style={{ padding: '32px 40px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                        <div style={{ width: '56px', height: '56px', background: '#f8fafc', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 8px rgba(0,0,0,0.02)' }}>
                                                            <User size={24} />
                                                        </div>
                                                        <div className="v-stack">
                                                            <span style={{ fontWeight: 950, color: '#1e293b', fontSize: '1.1rem', letterSpacing: '-0.3px' }}>{log.username || 'System Root'}</span>
                                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 750, fontFamily: 'monospace' }}>{log.userId || 'VERIX_PROTOCOL'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '32px 40px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 16px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase', background: styles.bg, color: styles.color, border: `1.5px solid ${styles.color}15` }}>
                                                            <styles.icon size={16} />
                                                            <span>{styles.label}</span>
                                                        </div>
                                                        <span style={{ fontSize: '0.95rem', color: '#475569', fontWeight: 800 }}>{log.action}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '32px 40px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', fontSize: '1rem', fontWeight: 850 }}>
                                                        <Clock size={18} style={{ opacity: 0.5 }} />
                                                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right', padding: '32px 40px' }}>
                                                    <button className="pc-audit-action-btn-v2" style={{ width: '52px', height: '52px', borderRadius: '18px', border: '1.5px solid #e2e8f0', background: 'white', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s', marginLeft: 'auto' }}>
                                                        <ChevronRight size={24} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '140px 40px', textAlign: 'center' }}>
                                                <div className="v-stack" style={{ alignItems: 'center', gap: '28px' }}>
                                                    <div style={{ width: '90px', height: '90px', background: '#f8fafc', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}><FileText size={48} /></div>
                                                    <div className="v-stack" style={{ gap: '8px' }}>
                                                        <h3 style={{ margin: 0, color: '#1e293b', fontWeight: 950, fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Database Protocol Clear</h3>
                                                        <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#94a3b8' }}>Nessuna operazione registrata per questi parametri.</p>
                                                    </div>
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
            .pc-premium-wrapper { padding: 40px; max-width: 1700px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: white; padding: 32px; border-radius: 32px; box-shadow: var(--shadow-premium); border: 1px solid var(--border-light); }
            .header-info { display: flex; align-items: center; gap: 24px; }
            .pc-icon-box { width: 64px; height: 64px; color: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 24px rgba(30, 41, 59, 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Outfit', sans-serif; font-size: 2.3rem; font-weight: 950; margin: 0; color: #1e293b; letter-spacing: -1.2px; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 950; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px; }
            .pc-status-tag-v2.on { background: #ecfdf5; color: #10b981; }
            .pc-status-tag-v2.off { background: #fff7ed; color: #f59e0b; }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: white; border: none; padding: 14px 28px; border-radius: 18px; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.3s; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(99, 102, 241, 0.3); }

            .pc-btn-outline-v2 { background: #f8fafc; color: #64748b; border: 1.5px solid #e2e8f0; padding: 12px 28px; border-radius: 16px; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
            .pc-btn-outline-v2:hover { background: #f1f5f9; color: #1e293b; border-color: #cbd5e1; }

            .pc-card-v2 { background: white; border: 1px solid var(--border-light); border-radius: 32px; padding: 40px; box-shadow: var(--shadow-premium); }
            
            .pc-audit-row-v2:hover td { background: #fcfdfe; }
            :global(.pc-audit-action-btn-v2:hover) { background: #1e293b !important; color: white !important; border-color: #1e293b !important; transform: translateX(6px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-audit-row-v2 { background: #ffffff !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
