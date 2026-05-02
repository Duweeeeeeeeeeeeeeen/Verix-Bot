import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useT } from '../../contexts/LanguageContext';
import { Rocket, Send, ShieldAlert, History, BarChart3, Terminal, Eye, EyeOff } from 'lucide-react';
import EmbedPreview from '../../components/EmbedPreview';

const OWNER_IDS = ['361159834688552960', '314417452395626496'];

export default function SystemUpdates() {
    const { user, loading: authLoading } = useAuth();
    const { t } = useT();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [history, setHistory] = useState([]);
    const [form, setForm] = useState({
        title: '',
        version: '',
        description: '',
        type: 'standard',
        changes: ''
    });
    const [previewTheme, setPreviewTheme] = useState('dark');

    const isOwner = user && OWNER_IDS.includes(user.id);

    useEffect(() => {
        if (isOwner) {
            fetchStats();
            fetchHistory();
        }
    }, [isOwner]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/system/status');
            const data = await res.json();
            if (data.success) setStats(data.data);
        } catch (err) {
            console.error('Failed to fetch stats');
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/system/history');
            const data = await res.json();
            if (data.success) setHistory(data.data);
        } catch (err) {
            console.error('Failed to fetch history');
        }
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!window.confirm('Sei sicuro di voler inviare questo aggiornamento a TUTTI i server?')) return;

        setSending(true);
        try {
            const changesArray = form.changes.split('\n').filter(c => c.trim() !== '');
            const res = await fetch('/api/system/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    changes: changesArray
                })
            });

            const data = await res.json();
            if (data.success) {
                alert(`Annuncio inviato! Successo: ${data.stats.success}, Falliti: ${data.stats.failed}`);
                setForm({ title: '', version: '', description: '', type: 'standard', changes: '' });
                fetchHistory(); // Refresh history
            } else {
                alert('Errore: ' + data.error);
            }
        } catch (err) {
            alert('Errore di connessione.');
        } finally {
            setSending(false);
        }
    };

    if (authLoading) return <div className="loading-screen">Caricamento...</div>;
    
    if (!isOwner) {
        return (
            <div className="forbidden">
                <h1>Accesso Negato</h1>
                <p>Questa area è riservata esclusivamente allo sviluppatore del bot.</p>
            </div>
        );
    }

    return (
        <Layout hideGuide={true}>
            <Head>
                <title>Verix System | Updates & Management</title>
            </Head>

            <div className="system-page animate fade-in">
                <header className="page-header">
                    <div className="title-group">
                        <Terminal className="header-icon" />
                        <div>
                            <h1>System Operations</h1>
                            <p>Gestione globale dei broadcast e monitoraggio infrastruttura.</p>
                        </div>
                    </div>
                </header>

                <div className="system-grid">
                    {/* Broadcast Form */}
                    <section className="glass-card broadcast-section">
                        <div className="card-header">
                            <Rocket size={20} />
                            <h2>Invia Aggiornamento Globale</h2>
                        </div>
                        <form onSubmit={handleBroadcast} className="system-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Titolo Patch</label>
                                    <input 
                                        type="text" 
                                        placeholder="es: Aggiornamento Primavera" 
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Versione</label>
                                    <input 
                                        type="text" 
                                        placeholder="es: 1.4.2" 
                                        value={form.version}
                                        onChange={e => setForm({ ...form, version: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Descrizione Breve</label>
                                <textarea 
                                    placeholder="Cosa c'è di nuovo in generale?"
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Lista Modifiche (una per riga)</label>
                                <textarea 
                                    className="changelog-input"
                                    placeholder="• Correzione bug whitelist\n• Nuovo sistema di log\n• Miglioramento performance"
                                    value={form.changes}
                                    onChange={e => setForm({ ...form, changes: e.target.value })}
                                />
                            </div>

                            <div className="form-actions">
                                <select 
                                    value={form.type} 
                                    onChange={e => setForm({ ...form, type: e.target.value })}
                                    className="type-select"
                                >
                                    <option value="standard">Aggiornamento Standard</option>
                                    <option value="emergency">Emergency Patch (Rosso)</option>
                                </select>
                                <button type="submit" className="btn-send" disabled={sending}>
                                    {sending ? 'Invio in corso...' : (
                                        <>
                                            <Send size={18} />
                                            Pubblica su tutti i server
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Real-time Preview */}
                        <div className="preview-container">
                            <div className="preview-header">
                                <div className="preview-title">
                                    <Eye size={16} />
                                    <span>{t('embeds.editor.preview')}</span>
                                </div>
                                <div className="preview-toggle">
                                    <button 
                                        className={`theme-btn ${previewTheme === 'dark' ? 'active' : ''}`}
                                        onClick={() => setPreviewTheme('dark')}
                                    >Dark</button>
                                    <button 
                                        className={`theme-btn ${previewTheme === 'light' ? 'active' : ''}`}
                                        onClick={() => setPreviewTheme('light')}
                                    >Light</button>
                                </div>
                            </div>
                            <div className="preview-wrapper">
                                <EmbedPreview 
                                    theme={previewTheme}
                                    data={{
                                        title: form.title || 'Titolo Update',
                                        description: `**Versione ${form.version || '1.0.0'}**\n\n${form.description || 'Descrizione dell\'aggiornamento...'}\n\n**Modifiche:**\n${form.changes || '• Nessuna modifica inserita'}`,
                                        color: form.type === 'emergency' ? '#ef4444' : '#6366f1',
                                        footer: { text: `Verix Bot System • ${new Date().toLocaleDateString()}` }
                                    }} 
                                />
                            </div>
                        </div>
                    </section>

                    {/* Stats Sidebar */}
                    <div className="stats-sidebar">
                        <section className="glass-card status-card">
                            <div className="card-header">
                                <BarChart3 size={20} />
                                <h2>Stato Infrastruttura</h2>
                            </div>
                            {stats ? (
                                <div className="stats-list">
                                    <div className="stat-item">
                                        <span>Server Attivi</span>
                                        <strong>{stats.guilds}</strong>
                                    </div>
                                    <div className="stat-item">
                                        <span>Utenza Totale</span>
                                        <strong>{stats.users}</strong>
                                    </div>
                                    <div className="stat-item">
                                        <span>Ping WS</span>
                                        <strong>{stats.ping}ms</strong>
                                    </div>
                                    <div className="stat-item">
                                        <span>Uptime</span>
                                        <strong>{Math.floor(stats.uptime / 3600)}h {Math.floor((stats.uptime % 3600) / 60)}m</strong>
                                    </div>
                                </div>
                            ) : (
                                <p className="loading-stats">Recupero dati...</p>
                            )}
                            <button onClick={fetchStats} className="btn-refresh">Aggiorna Dati</button>
                        </section>

                        <section className="glass-card danger-card">
                            <div className="card-header">
                                <ShieldAlert size={20} />
                                <h2>Area Pericolosa</h2>
                            </div>
                            <p>Queste azioni hanno effetto su ogni singola istanza del bot.</p>
                            <button className="btn-outline-danger" disabled>Forza Riavvio Moduli</button>
                        </section>
                    </div>
                </div>

                {/* History Section */}
                <section className="glass-card history-section" style={{ marginTop: '2rem' }}>
                    <div className="card-header">
                        <History size={20} />
                        <h2>Cronologia Broadcast (Stash)</h2>
                    </div>
                    <div className="history-table-wrapper">
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Versione</th>
                                    <th>Titolo</th>
                                    <th>Tipo</th>
                                    <th>Data</th>
                                    <th>Target</th>
                                    <th>Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length > 0 ? history.map(item => (
                                    <tr key={item._id}>
                                        <td><code className="version-tag">v{item.version}</code></td>
                                        <td>{item.title}</td>
                                        <td>
                                            <span className={`type-badge ${item.type}`}>
                                                {item.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>{new Date(item.sentAt).toLocaleString()}</td>
                                        <td>
                                            <div className="stats-mini">
                                                <span className="success">✓ {item.stats?.success || 0}</span>
                                                <span className="failed">✗ {item.stats?.failed || 0}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <button 
                                                className="btn-view" 
                                                onClick={() => {
                                                    setForm({
                                                        title: item.title,
                                                        version: item.version,
                                                        description: item.description,
                                                        changes: item.changes.join('\n'),
                                                        type: item.type
                                                    });
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                            >Ripristina</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                            Nessun broadcast inviato finora.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            <style jsx>{`
                .system-page {
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .page-header {
                    margin-bottom: 2rem;
                }

                .title-group {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .header-icon {
                    width: 48px;
                    height: 48px;
                    color: var(--primary);
                    background: rgba(99, 102, 241, 0.1);
                    padding: 10px;
                    border-radius: 12px;
                }

                h1 { margin: 0; font-size: 2rem; }
                p { margin: 0.5rem 0 0; color: var(--text-muted); }

                .system-grid {
                    display: grid;
                    grid-template-columns: 1fr 320px;
                    gap: 2rem;
                }

                @media (max-width: 1200px) {
                    .system-grid {
                        grid-template-columns: 1fr;
                    }
                    .stats-sidebar {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 1.5rem;
                    }
                }

                @media (max-width: 768px) {
                    .stats-sidebar {
                        grid-template-columns: 1fr;
                    }
                }

                .glass-card {
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    padding: 1.5rem;
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 1rem;
                }

                .card-header h2 { font-size: 1.25rem; margin: 0; }

                .form-row {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                }

                label { font-size: 0.9rem; font-weight: 600; color: var(--text-muted); }

                input, textarea, select {
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 0.75rem;
                    color: white;
                    font-size: 1rem;
                    transition: border-color 0.2s;
                }

                input:focus, textarea:focus {
                    border-color: var(--primary);
                    outline: none;
                }

                textarea { min-height: 100px; resize: vertical; }
                .changelog-input { min-height: 150px; font-family: monospace; }

                .form-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    align-items: center;
                }

                .btn-send {
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 0.75rem 1.5rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .preview-container {
                    margin-top: 2rem;
                    border-top: 1px solid var(--border-color);
                    padding-top: 2rem;
                }

                .preview-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .preview-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.8rem;
                    font-weight: 800;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .preview-toggle {
                    display: flex;
                    background: rgba(0,0,0,0.2);
                    padding: 4px;
                    border-radius: 8px;
                    gap: 4px;
                }

                .theme-btn {
                    padding: 4px 12px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: 0.2s;
                    border: none;
                    background: transparent;
                    color: var(--text-muted);
                }

                .theme-btn.active {
                    background: var(--primary);
                    color: white;
                }

                .preview-wrapper {
                    background: rgba(0,0,0,0.1);
                    padding: 20px;
                    border-radius: 12px;
                    border: 1px dashed var(--border-color);
                }

                .btn-send:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
                }

                .btn-send:disabled { opacity: 0.5; cursor: not-allowed; }

                .stats-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .stat-item {
                    display: flex;
                    justify-content: space-between;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .stat-item span { color: var(--text-muted); }
                .stat-item strong { color: var(--primary); }

                .btn-refresh {
                    width: 100%;
                    margin-top: 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border-color);
                    color: white;
                    padding: 0.5rem;
                    border-radius: 6px;
                    cursor: pointer;
                }

                .danger-card {
                    margin-top: 1.5rem;
                    border-color: rgba(239, 68, 68, 0.2);
                }

                .btn-outline-danger {
                    width: 100%;
                    margin-top: 1rem;
                    background: transparent;
                    border: 1px solid #ef4444;
                    color: #ef4444;
                    padding: 0.75rem;
                    border-radius: 8px;
                    cursor: not-allowed;
                    opacity: 0.5;
                }

                @media (max-width: 900px) {
                    .system-grid { grid-template-columns: 1fr; }
                }

                .history-table-wrapper {
                    overflow-x: auto;
                    margin-top: 1rem;
                }

                .history-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.9rem;
                }

                .history-table th {
                    text-align: left;
                    padding: 12px;
                    color: var(--text-muted);
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    border-bottom: 1px solid var(--border-color);
                }

                .history-table td {
                    padding: 16px 12px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
                    color: var(--text-main);
                }

                .version-tag {
                    background: var(--bg-badge);
                    padding: 4px 8px;
                    border-radius: 6px;
                    color: var(--primary);
                    font-weight: 700;
                }

                .type-badge {
                    font-size: 0.65rem;
                    font-weight: 900;
                    padding: 2px 8px;
                    border-radius: 4px;
                }

                .type-badge.standard { background: rgba(99, 102, 241, 0.1); color: var(--primary); }
                .type-badge.emergency { background: rgba(239, 68, 68, 0.1); color: var(--error); }

                .stats-mini {
                    display: flex;
                    gap: 12px;
                    font-size: 0.8rem;
                    font-weight: 700;
                }

                .stats-mini .success { color: var(--success); }
                .stats-mini .failed { color: var(--error); }

                .btn-view {
                    background: var(--bg-badge);
                    border: 1px solid var(--border-color);
                    color: var(--text-dim);
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.8rem;
                    transition: 0.2s;
                }

                .btn-view:hover {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }
            `}</style>
        </Layout>
    );
}
