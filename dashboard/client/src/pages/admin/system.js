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
                                            <div className="stat-item animate fade-in" style={{ animationDelay: '0.1s' }}>
                                                <div className="stat-label">
                                                    <BarChart3 size={16} />
                                                    <span>{t('system.stats_servers')}</span>
                                                </div>
                                                <strong>{stats.guilds}</strong>
                                            </div>
                                            <div className="stat-item animate fade-in" style={{ animationDelay: '0.2s' }}>
                                                <div className="stat-label">
                                                    <Crown size={16} />
                                                    <span>{t('system.stats_users')}</span>
                                                </div>
                                                <strong>{stats.users}</strong>
                                            </div>
                                            <div className="stat-item animate fade-in" style={{ animationDelay: '0.3s' }}>
                                                <div className="stat-label">
                                                    <Zap size={16} />
                                                    <span>{t('system.stats_ping')}</span>
                                                </div>
                                                <strong>{stats.ping}ms</strong>
                                            </div>
                                            <div className="stat-item animate fade-in" style={{ animationDelay: '0.4s' }}>
                                                <div className="stat-label">
                                                    <History size={16} />
                                                    <span>{t('system.stats_uptime')}</span>
                                                </div>
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
                                        <div className="guild-result animate slide-up">
                                            <div className="guild-info">
                                                <div className="guild-header-mini">
                                                    <Search size={14} className="text-muted" />
                                                    <p className="id-tag">{searchGuildId}</p>
                                                </div>
                                                <div className="status-badge-row">
                                                    <span className={`status-badge ${foundGuild.premiumTier === 'platinum' ? 'platinum' : (foundGuild.isPremium ? 'premium' : 'free')}`}>
                                                        <Crown size={10} style={{ marginRight: '4px' }} />
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
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .page-header {
                    margin-bottom: 3rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }

                .title-group {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .header-icon {
                    width: 56px;
                    height: 56px;
                    color: white;
                    background: linear-gradient(135deg, var(--primary), #818cf8);
                    padding: 12px;
                    border-radius: 16px;
                    box-shadow: 0 8px 16px rgba(99, 102, 241, 0.2);
                }

                h1 { 
                    margin: 0; 
                    font-size: 2.5rem; 
                    font-weight: 800;
                    letter-spacing: -0.01em;
                }
                
                .title-group p { 
                    margin: 0.25rem 0 0; 
                    color: var(--text-muted);
                    font-size: 1.1rem;
                }

                .system-grid {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 2.5rem;
                }

                .glass-card {
                    background: var(--card-bg);
                    backdrop-filter: blur(12px);
                    border: 1px solid var(--border-color);
                    border-radius: 24px;
                    padding: 2rem;
                    box-shadow: var(--shadow-sm);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 1.25rem;
                }

                .card-header h2 { 
                    font-size: 1.25rem; 
                    margin: 0; 
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .system-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                label { 
                    font-size: 0.85rem; 
                    font-weight: 700; 
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                input, textarea, select {
                    background: var(--bg-input);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 1rem;
                    color: var(--text-main);
                    font-size: 1rem;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                input:focus, textarea:focus {
                    border-color: var(--primary);
                    background: var(--bg-card);
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                    outline: none;
                }

                textarea { min-height: 120px; resize: vertical; }
                .changelog-input { min-height: 180px; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; }

                .form-actions {
                    display: flex;
                    gap: 1.25rem;
                    justify-content: flex-end;
                    align-items: center;
                    padding-top: 1rem;
                    border-top: 1px solid var(--border-color);
                }

                .type-select {
                    min-width: 180px;
                    padding: 0.75rem 1rem;
                }

                .btn-send {
                    background: linear-gradient(135deg, var(--primary), #4f46e5);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 0.85rem 2rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
                }

                .btn-send:hover:not(:disabled) {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 8px 20px rgba(79, 70, 229, 0.4);
                }

                .preview-container {
                    margin-top: 3rem;
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 20px;
                    padding: 1.5rem;
                }

                .preview-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .preview-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.85rem;
                    font-weight: 800;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }

                .preview-toggle {
                    display: flex;
                    background: var(--bg-badge);
                    padding: 4px;
                    border-radius: 10px;
                    gap: 4px;
                }

                .theme-btn {
                    padding: 6px 16px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    border-radius: 7px;
                    cursor: pointer;
                    transition: 0.2s;
                    border: none;
                    background: transparent;
                    color: var(--text-muted);
                }

                .theme-btn.active {
                    background: var(--primary);
                    color: white;
                    box-shadow: var(--shadow-sm);
                }

                .preview-wrapper {
                    padding: 1rem;
                    border-radius: 16px;
                }

                .stats-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .stat-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 12px;
                    border: 1px solid var(--border-color);
                }

                .stat-item span { 
                    color: var(--text-muted); 
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .stat-item strong { 
                    color: var(--primary); 
                    font-size: 1.1rem;
                    font-weight: 800;
                }

                .stat-label {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: var(--text-muted);
                }

                .guild-header-mini {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .btn-refresh {
                    width: 100%;
                    margin-top: 1.5rem;
                    background: transparent;
                    border: 1px solid var(--border-color);
                    color: var(--text-main);
                    padding: 0.75rem;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-refresh:hover {
                    background: var(--bg-badge);
                    border-color: var(--primary);
                }

                .premium-mgmt-card {
                    margin-top: 2rem;
                }

                .guild-search-box {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 1.5rem;
                }

                .btn-search {
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 10px;
                    border-radius: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: 0.2s;
                }

                .guild-result {
                    background: var(--bg-badge);
                    padding: 1.5rem;
                    border-radius: 16px;
                    border: 1px solid var(--border-color);
                    margin-bottom: 2rem;
                }

                .id-tag { 
                    font-size: 0.75rem; 
                    font-family: monospace; 
                    color: var(--text-muted); 
                    background: rgba(0,0,0,0.1);
                    padding: 2px 8px;
                    border-radius: 4px;
                }
                
                .status-badge-row { margin: 12px 0; }
                .status-badge {
                    font-size: 0.7rem;
                    font-weight: 900;
                    padding: 4px 12px;
                    border-radius: 6px;
                    text-transform: uppercase;
                }
                .status-badge.free { background: rgba(255,255,255,0.1); color: var(--text-main); }
                .status-badge.premium { background: rgba(234, 179, 8, 0.1); color: #eab308; border: 1px solid rgba(234, 179, 8, 0.2); }
                .status-badge.platinum { background: rgba(168, 85, 247, 0.1); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.3); }

                .danger-card {
                    margin-top: 2.5rem;
                    background: rgba(239, 68, 68, 0.05);
                    border-color: rgba(239, 68, 68, 0.2);
                }

                .btn-outline-danger {
                    width: 100%;
                    margin-top: 1rem;
                    background: transparent;
                    border: 1px solid #ef4444;
                    color: #ef4444;
                    padding: 1rem;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: not-allowed;
                    opacity: 0.5;
                }

                .system-tabs {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2.5rem;
                    background: var(--bg-badge);
                    padding: 6px;
                    border-radius: 16px;
                    width: fit-content;
                }

                .tab-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    padding: 10px 24px;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 700;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .tab-btn:hover {
                    color: var(--text-main);
                    background: rgba(255, 255, 255, 0.05);
                }

                .tab-btn.active {
                    color: white;
                    background: var(--primary);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }

                .history-table-wrapper {
                    overflow-x: auto;
                    border-radius: 16px;
                    border: 1px solid var(--border-color);
                }

                .history-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .history-table th {
                    background: var(--bg-badge);
                    text-align: left;
                    padding: 1.25rem 1rem;
                    color: var(--text-muted);
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .history-table td {
                    padding: 1.25rem 1rem;
                    border-bottom: 1px solid var(--border-color);
                    vertical-align: middle;
                }

                .history-table tr:hover td {
                    background: rgba(255, 255, 255, 0.02);
                }

                .version-tag {
                    background: var(--bg-badge);
                    padding: 6px 12px;
                    border-radius: 8px;
                    color: var(--primary);
                    font-weight: 800;
                    font-size: 0.85rem;
                    border: 1px solid rgba(99, 102, 241, 0.2);
                }

                .btn-view {
                    background: transparent;
                    border: 1px solid var(--border-color);
                    color: var(--text-muted);
                    padding: 8px 16px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 0.85rem;
                    transition: 0.2s;
                }

                .btn-view:hover {
                    border-color: var(--primary);
                    color: var(--primary);
                    background: rgba(99, 102, 241, 0.05);
                }

                .terminal-container {
                    background: #0d1117;
                    border-radius: 0 0 24px 24px;
                    display: flex;
                    flex-direction: column;
                    height: 700px;
                    box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
                }

                .terminal-header {
                    background: #161b22;
                    padding: 12px 20px;
                    border-bottom: 1px solid #30363d;
                }

                .logs-pre {
                    font-size: 0.9rem;
                    line-height: 1.6;
                }

                @media (max-width: 1200px) {
                    .system-grid { grid-template-columns: 1fr; }
                    .stats-sidebar { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                }

                @media (max-width: 768px) {
                    .stats-sidebar { grid-template-columns: 1fr; }
                    .form-row { grid-template-columns: 1fr; }
                }
            `}</style>
        </Layout>
    );
}

