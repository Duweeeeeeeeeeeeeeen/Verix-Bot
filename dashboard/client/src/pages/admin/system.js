import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useT } from '../../contexts/LanguageContext';
import { Rocket, Send, ShieldAlert, History, BarChart3, Terminal, Eye, EyeOff, Search, Crown, Zap, RefreshCcw, FileText } from 'lucide-react';
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
        changes: '',
        thumbnail: '',
        image: ''
    });
    const [previewTheme, setPreviewTheme] = useState('dark');

    // Guild Management State
    const [searchGuildId, setSearchGuildId] = useState('');
    const [foundGuild, setFoundGuild] = useState(null);
    const [searching, setSearching] = useState(false);
    const [updatingPremium, setUpdatingPremium] = useState(false);
    
    // Logs State
    const [activeTab, setActiveTab] = useState('status');
    const [botLogs, setBotLogs] = useState('');
    const [fetchingLogs, setFetchingLogs] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);

    const isOwner = user && OWNER_IDS.includes(user.id);

    useEffect(() => {
        if (isOwner) {
            fetchStats();
            fetchHistory();
        }
    }, [isOwner]);

    const fetchLogs = async () => {
        setFetchingLogs(true);
        try {
            const res = await fetch('/api/system/logs');
            const data = await res.json();
            if (data.success) {
                setBotLogs(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch logs');
        } finally {
            setFetchingLogs(false);
        }
    };

    useEffect(() => {
        let interval;
        if (activeTab === 'logs' && autoRefresh) {
            fetchLogs();
            interval = setInterval(fetchLogs, 5000);
        }
        return () => clearInterval(interval);
    }, [activeTab, autoRefresh]);

    useEffect(() => {
        if (activeTab === 'logs' && !botLogs) {
            fetchLogs();
        }
    }, [activeTab]);

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
        if (!window.confirm(t('system.confirm_broadcast'))) return;

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
                alert(t('system.broadcast_sent', { success: data.stats.success, failed: data.stats.failed }));
                setForm({ title: '', version: '', description: '', type: 'standard', changes: '', thumbnail: '', image: '' });
                fetchHistory(); // Refresh history
            } else {
                alert(t('common.save_error') + ': ' + data.error);
            }
        } catch (err) {
            alert(t('system.error_connection'));
        } finally {
            setSending(false);
        }
    };

    const handleSearchGuild = async () => {
        if (!searchGuildId) return;
        setSearching(true);
        setFoundGuild(null);
        try {
            const res = await fetch(`/api/system/guild/${searchGuildId}`);
            const data = await res.json();
            if (data.success) {
                setFoundGuild(data.data);
            } else {
                alert(t('admin.guild_not_found'));
            }
        } catch (err) {
            alert(t('admin.connection_error'));
        } finally {
            setSearching(false);
        }
    };

    const [updatingTier, setUpdatingTier] = useState(false);
 
    const handleUpdateTier = async (newTier) => {
        if (!foundGuild) return;
        setUpdatingTier(true);
        try {
            const res = await fetch(`/api/system/guild/${searchGuildId}/tier`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier: newTier })
            });
            const data = await res.json();
            if (data.success) {
                setFoundGuild({ 
                    ...foundGuild, 
                    premiumTier: newTier, 
                    isPremium: newTier !== 'none' 
                });
            } else {
                alert(t('common.save_error') + ": " + data.error);
            }
        } catch (err) {
            alert(t('admin.update_error'));
        } finally {
            setUpdatingTier(false);
        }
    };

    if (authLoading) return <div className="loading-screen">{t('common.loading')}</div>;
    
    if (!isOwner) {
        return (
            <div className="forbidden">
                <h1>{t('sidebar.administrator')}</h1>
                <p>{t('onboarding.step1.staff_desc')}</p>
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
                            <h1>{t('system.title')}</h1>
                            <p>{t('system.desc')}</p>
                        </div>
                    </div>
                </header>

                <div className="system-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'status' ? 'active' : ''}`}
                        onClick={() => setActiveTab('status')}
                    >
                        <Zap size={18} />
                        <span>{t('system.tab_status')}</span>
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('logs')}
                    >
                        <FileText size={18} />
                        <span>{t('system.tab_logs')}</span>
                    </button>
                </div>

                {activeTab === 'status' ? (
                    <>
                        <div className="system-grid">
                            {/* Broadcast Form */}
                            <section className="glass-card broadcast-section">
                                <div className="card-header">
                                    <Rocket size={20} />
                                    <h2>{t('system.broadcast_title')}</h2>
                                </div>
                                <form onSubmit={handleBroadcast} className="system-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>{t('system.patch_title')}</label>
                                            <input 
                                                type="text" 
                                                placeholder={t('system.patch_placeholder')}
                                                value={form.title}
                                                onChange={e => setForm({ ...form, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('system.version')}</label>
                                            <input 
                                                type="text" 
                                                placeholder={t('system.version_placeholder')}
                                                value={form.version}
                                                onChange={e => setForm({ ...form, version: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>{t('system.short_desc')}</label>
                                        <textarea 
                                            placeholder={t('system.desc_placeholder')}
                                            value={form.description}
                                            onChange={e => setForm({ ...form, description: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>{t('system.changes_list')}</label>
                                        <textarea 
                                            className="changelog-input"
                                            placeholder={t('system.changes_placeholder')}
                                            value={form.changes}
                                            onChange={e => setForm({ ...form, changes: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>{t('system.thumbnail_url')}</label>
                                            <input 
                                                type="text" 
                                                placeholder="https://...png" 
                                                value={form.thumbnail}
                                                onChange={e => setForm({ ...form, thumbnail: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('system.image_url')}</label>
                                            <input 
                                                type="text" 
                                                placeholder="https://...jpg" 
                                                value={form.image}
                                                onChange={e => setForm({ ...form, image: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                        {t('admin.tips_postimages')}
                                    </p>

                                    <div className="form-actions">
                                        <select 
                                            value={form.type} 
                                            onChange={e => setForm({ ...form, type: e.target.value })}
                                            className="type-select"
                                        >
                                            <option value="standard">{t('system.type_standard')}</option>
                                            <option value="emergency">{t('system.type_emergency')}</option>
                                        </select>
                                        <button type="submit" className="btn-send" disabled={sending}>
                                            {sending ? t('common.loading') : (
                                                <>
                                                    <Send size={18} />
                                                    {t('system.publish_btn')}
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
                                                title: form.title || t('system.patch_title'),
                                                description: form.description || t('system.desc_placeholder'),
                                                color: form.type === 'emergency' ? '#ef4444' : '#10b981',
                                                thumbnail: form.thumbnail,
                                                image: form.image,
                                                fields: form.changes ? [{ name: '🛠️ Changelog', value: form.changes.split('\n').map(c => `• ${c}`).join('\n') }] : [],
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
                                        <h2>{t('system.stats_title')}</h2>
                                    </div>
                                    {stats ? (
                                        <div className="stats-list">
                                            <div className="stat-item">
                                                <span>{t('system.stats_servers')}</span>
                                                <strong>{stats.guilds}</strong>
                                            </div>
                                            <div className="stat-item">
                                                <span>{t('system.stats_users')}</span>
                                                <strong>{stats.users}</strong>
                                            </div>
                                            <div className="stat-item">
                                                <span>{t('system.stats_ping')}</span>
                                                <strong>{stats.ping}ms</strong>
                                            </div>
                                            <div className="stat-item">
                                                <span>{t('system.stats_uptime')}</span>
                                                <strong>{Math.floor(stats.uptime / 3600)}h {Math.floor((stats.uptime % 3600) / 60)}m</strong>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="loading-stats">{t('common.loading')}</p>
                                    )}
                                    <button onClick={fetchStats} className="btn-refresh">{t('system.refresh_stats')}</button>
                                </section>

                                {/* Premium Management */}
                                <section className="glass-card premium-mgmt-card">
                                    <div className="card-header">
                                        <Crown size={20} color="#eab308" />
                                        <h2>{t('admin.premium_mgmt')}</h2>
                                    </div>
                                    <div className="guild-search-box">
                                        <input 
                                            type="text" 
                                            placeholder={t('admin.guild_id_placeholder')} 
                                            value={searchGuildId}
                                            onChange={e => setSearchGuildId(e.target.value)}
                                        />
                                        <button onClick={handleSearchGuild} disabled={searching} className="btn-search">
                                            <Search size={16} />
                                        </button>
                                    </div>

                                    {foundGuild && (
                                        <div className="guild-result animate fade-in">
                                            <div className="guild-info">
                                                <p className="id-tag">ID: {searchGuildId}</p>
                                                <div className="status-badge-row">
                                                    <span className={`status-badge ${foundGuild.premiumTier === 'platinum' ? 'platinum' : (foundGuild.isPremium ? 'premium' : 'free')}`}>
                                                        {(foundGuild.premiumTier || (foundGuild.isPremium ? 'premium' : 'none')).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="tier-selector-group">
                                                <label>{t('admin.select_plan')}</label>
                                                <select 
                                                    value={foundGuild.premiumTier || (foundGuild.isPremium ? 'premium' : 'none')}
                                                    onChange={(e) => handleUpdateTier(e.target.value)}
                                                    disabled={updatingTier}
                                                    className="tier-select-admin"
                                                >
                                                    <option value="none">{t('admin.plan_none')}</option>
                                                    <option value="premium">{t('admin.plan_premium')}</option>
                                                    <option value="platinum">{t('admin.plan_platinum')}</option>
                                                </select>
                                            </div>
                                         </div>
                                    )}

                                    <section className="glass-card danger-card">
                                        <div className="card-header">
                                            <ShieldAlert size={20} />
                                            <h2>{t('system.danger_zone')}</h2>
                                        </div>
                                        <p>{t('system.danger_desc')}</p>
                                        <button className="btn-outline-danger" disabled>{t('system.restart_modules')}</button>
                                    </section>
                                </section>
                            </div>
                        </div>

                        {/* History Section */}
                        <section className="glass-card history-section" style={{ marginTop: '2rem' }}>
                            <div className="card-header">
                                <History size={20} />
                                <h2>{t('system.history_title')}</h2>
                            </div>
                            <div className="history-table-wrapper">
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th>{t('system.version')}</th>
                                            <th>{t('system.patch_title')}</th>
                                            <th>{t('common.status')}</th>
                                            <th>{t('common.date')}</th>
                                            <th>{t('system.stats_users')}</th>
                                            <th>{t('system.history_actions')}</th>
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
                                                                type: item.type,
                                                                thumbnail: item.thumbnail || '',
                                                                image: item.image || ''
                                                            });
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                    >{t('system.history_restore')}</button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                                    {t('system.history_empty')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                ) : (
                    <div className="logs-view-section animate fade-in">
                        <section className="glass-card logs-card">
                            <div className="card-header">
                                <div className="header-info">
                                    <Terminal size={20} />
                                    <div>
                                        <h2>{t('system.logs_title')}</h2>
                                        <p>{t('system.logs_desc')}</p>
                                    </div>
                                </div>
                                <div className="header-actions">
                                    <div className="auto-refresh-toggle">
                                        <label className="switch">
                                            <input 
                                                type="checkbox" 
                                                checked={autoRefresh} 
                                                onChange={(e) => setAutoRefresh(e.target.checked)} 
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                        <span>{t('system.auto_refresh')}</span>
                                    </div>
                                    <button 
                                        className="refresh-btn" 
                                        onClick={fetchLogs}
                                        disabled={fetchingLogs}
                                    >
                                        <RefreshCcw size={16} className={fetchingLogs ? 'animate-spin' : ''} />
                                        {t('system.refresh_logs')}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="terminal-container">
                                <div className="terminal-header">
                                    <div className="dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <div className="terminal-title">bot.log</div>
                                </div>
                                <div className="terminal-body">
                                    {botLogs ? (
                                        <pre className="logs-pre">{botLogs}</pre>
                                    ) : (
                                        <div className="empty-logs">
                                            <Terminal size={48} />
                                            <p>{fetchingLogs ? t('system.terminal_placeholder') : t('system.no_logs')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                )}
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

                .premium-mgmt-card {
                    margin-top: 1.5rem;
                    border-color: rgba(234, 179, 8, 0.2);
                }

                .guild-search-box {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 1rem;
                }

                .guild-search-box input {
                    flex: 1;
                    padding: 8px 12px;
                    font-size: 0.85rem;
                }

                .btn-search {
                    background: var(--bg-badge);
                    border: 1px solid var(--border-color);
                    color: white;
                    padding: 8px;
                    border-radius: 8px;
                    cursor: pointer;
                }

                .guild-result {
                    background: rgba(0,0,0,0.2);
                    padding: 12px;
                    border-radius: 12px;
                    border: 1px solid var(--border-color);
                }

                .id-tag { font-size: 0.7rem; font-family: monospace; color: var(--text-muted); margin: 0; }
                
                .status-badge-row { margin: 8px 0; }
                .status-badge {
                    font-size: 0.65rem;
                    font-weight: 900;
                    padding: 2px 8px;
                    border-radius: 4px;
                }
                .status-badge.free { background: rgba(255,255,255,0.1); color: white; }
                .status-badge.premium { background: rgba(234, 179, 8, 0.1); color: #eab308; }
                .status-badge.platinum { background: rgba(168, 85, 247, 0.1); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.3); }

                .tier-selector-group {
                    margin-top: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .tier-selector-group label {
                    font-size: 0.7rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    color: var(--text-muted);
                }

                .tier-select-admin {
                    width: 100%;
                    padding: 8px;
                    border-radius: 8px;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid var(--border-color);
                    color: white;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .tier-select-admin:hover:not(:disabled) {
                    border-color: var(--primary);
                }

                .tier-select-admin:focus {
                    outline: none;
                    border-color: var(--primary);
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

                .system-tabs {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 2rem;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 8px;
                }

                .tab-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 700;
                    transition: 0.2s;
                }

                .tab-btn:hover {
                    color: white;
                    background: rgba(255,255,255,0.05);
                }

                .tab-btn.active {
                    color: var(--primary);
                    background: rgba(99, 102, 241, 0.1);
                }

                .logs-view-section {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .logs-card {
                    padding: 0;
                    overflow: hidden;
                }

                .logs-card .card-header {
                    padding: 1.5rem;
                    margin-bottom: 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .auto-refresh-toggle {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-muted);
                }

                .refresh-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--bg-badge);
                    border: 1px solid var(--border-color);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .refresh-btn:hover:not(:disabled) {
                    background: var(--primary);
                    border-color: var(--primary);
                }

                .refresh-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .terminal-container {
                    background: #0d1117;
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    height: 600px;
                }

                .terminal-header {
                    background: #161b22;
                    padding: 8px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    border-bottom: 1px solid #30363d;
                }

                .terminal-header .dots {
                    position: absolute;
                    left: 16px;
                    display: flex;
                    gap: 6px;
                }

                .terminal-header .dots span {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }

                .terminal-header .dots span:nth-child(1) { background: #ff5f56; }
                .terminal-header .dots span:nth-child(2) { background: #ffbd2e; }
                .terminal-header .dots span:nth-child(3) { background: #27c93f; }

                .terminal-title {
                    font-size: 0.75rem;
                    font-family: monospace;
                    color: #8b949e;
                    font-weight: 600;
                }

                .terminal-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1.5rem;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                }

                .logs-pre {
                    margin: 0;
                    white-space: pre-wrap;
                    word-break: break-all;
                    font-size: 0.85rem;
                    color: #e6edf3;
                    line-height: 1.5;
                }

                .empty-logs {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #484f58;
                    gap: 1rem;
                }

                .empty-logs p {
                    margin: 0;
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .animate-spin {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                /* Switch Toggle Styling */
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 36px;
                    height: 20px;
                }

                .switch input { opacity: 0; width: 0; height: 0; }

                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-color: #21262d;
                    transition: .4s;
                }

                .slider:before {
                    position: absolute;
                    content: "";
                    height: 14px; width: 14px;
                    left: 3px; bottom: 3px;
                    background-color: white;
                    transition: .4s;
                }

                input:checked + .slider { background-color: var(--primary); }
                input:focus + .slider { box-shadow: 0 0 1px var(--primary); }
                input:checked + .slider:before { transform: translateX(16px); }
                .slider.round { border-radius: 20px; }
                .slider.round:before { border-radius: 50%; }
            `}</style>
        </Layout>
    );
}
