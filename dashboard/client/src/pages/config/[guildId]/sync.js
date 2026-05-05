import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useT } from '../../../contexts/LanguageContext';
import { 
    RefreshCcw, Shield, Zap, MessageSquare, 
    Layers, Settings2, Info, AlertTriangle, 
    CheckCircle2, Copy, ArrowRight, Server,
    Crown, Lock
} from 'lucide-react';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';

export default function GlobalSync() {
    const { t } = useT();
    const router = useRouter();
    const { guildId } = router.query;
    
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [guildData, setGuildData] = useState(null);
    const [userGuilds, setUserGuilds] = useState([]);
    const [sourceGuildId, setSourceGuildId] = useState('');
    const [selectedModules, setSelectedModules] = useState([
        'whitelist', 'tickets', 'automations', 'moderation', 'welcome', 'verify'
    ]);

    const modules = [
        { id: 'whitelist', label: t('sidebar.whitelist'), icon: Shield },
        { id: 'tickets', label: t('sidebar.tickets'), icon: Layers },
        { id: 'automations', label: t('sidebar.automations'), icon: Zap },
        { id: 'moderation', label: t('sidebar.moderation'), icon: Shield },
        { id: 'welcome', label: t('sidebar.welcome'), icon: MessageSquare },
        { id: 'verify', label: t('sidebar.verify'), icon: CheckCircle2 },
        { id: 'socials', label: t('sidebar.socials'), icon: RefreshCcw },
        { id: 'utility', label: t('sidebar.utility'), icon: Settings2 }
    ];

    const loadData = async () => {
        if (!guildId) return;
        setLoading(true);
        try {
            const [gRes, uRes] = await Promise.all([
                api.request(`/config/${guildId}/guild`),
                api.request('/auth/user') // To get user guilds
            ]);

            const gData = gRes.data || gRes;
            setGuildData(gData);
            
            // Filter user guilds where user is admin and NOT current guild
            const guilds = (uRes.guilds || []).filter(g => 
                (g.permissions & 0x8) && g.id !== guildId
            );
            setUserGuilds(guilds);

            if (gData.premiumTier !== 'platinum') {
                // Not platinum? Show upsell logic
            }
        } catch (err) {
            console.error('Failed to load sync data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [guildId]);

    const handleSync = async () => {
        if (!sourceGuildId) return;
        if (!confirm(t('sync.confirm_msg'))) return;

        setSyncing(true);
        try {
            const res = await api.request(`/config/${guildId}/sync`, {
                method: 'POST',
                body: JSON.stringify({
                    sourceGuildId,
                    modules: selectedModules
                })
            });

            if (res.success) {
                window.dispatchEvent(new CustomEvent('show-toast', { 
                    detail: { message: t('sync.success_msg'), type: 'success' } 
                }));
            } else {
                throw new Error(res.error || 'Errore durante la sincronizzazione');
            }
        } catch (err) {
            window.dispatchEvent(new CustomEvent('show-toast', { 
                detail: { message: err.message, type: 'error' } 
            }));
        } finally {
            setSyncing(false);
        }
    };

    const toggleModule = (id) => {
        setSelectedModules(prev => 
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    if (loading) return <Skeleton height="600px" />;

    if (guildData?.premiumTier !== 'platinum') {
        return (
            <div className="sync-container animate">
                <div className="platinum-upsell card">
                    <div className="upsell-badge">PLATINUM EXCLUSIVE</div>
                    <Crown size={64} color="var(--gold)" />
                    <h2>{t('sync.title')}</h2>
                    <p>{t('sync.upsell_desc')}</p>
                    <button className="btn-premium-cta" onClick={() => router.push(`/config/${guildId}/premium`)}>
                        {t('sync.get_platinum')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="sync-container animate">
            <header className="page-header">
                <div className="header-info">
                    <div className="header-icon platinum">
                        <RefreshCcw size={24} />
                    </div>
                    <div className="header-text">
                        <h1>{t('sync.title')}</h1>
                        <p>{t('sync.desc')}</p>
                    </div>
                </div>
            </header>

            <div className="sync-grid">
                <div className="sync-selection card">
                    <div className="step-badge">1</div>
                    <h3>{t('sync.step_1')}</h3>
                    <p className="text-dim">{t('sync.step_1_desc')}</p>
                    
                    <div className="source-selector">
                        <select 
                            className="input" 
                            value={sourceGuildId} 
                            onChange={e => setSourceGuildId(e.target.value)}
                        >
                            <option value="">{t('sync.select_placeholder')}</option>
                            {userGuilds.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="sync-warning">
                        <AlertTriangle size={20} />
                        <div>
                            <strong>{t('sync.warning_title')}</strong> {t('sync.warning_desc', { name: guildData?.name })}
                        </div>
                    </div>
                </div>

                <div className="sync-modules card">
                    <div className="step-badge">2</div>
                    <h3>{t('sync.step_2')}</h3>
                    <p className="text-dim">{t('sync.step_2_desc')}</p>

                    <div className="modules-list">
                        {modules.map(mod => (
                            <div 
                                key={mod.id} 
                                className={`module-item ${selectedModules.includes(mod.id) ? 'active' : ''}`}
                                onClick={() => toggleModule(mod.id)}
                            >
                                <div className="mod-icon">
                                    <mod.icon size={18} />
                                </div>
                                <div className="mod-info">
                                    <span>{mod.label}</span>
                                </div>
                                <div className="mod-check">
                                    {selectedModules.includes(mod.id) ? <CheckCircle2 size={16} /> : <div className="uncheck" />}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="action-footer">
                        <button 
                            className="btn-sync" 
                            disabled={!sourceGuildId || selectedModules.length === 0 || syncing}
                            onClick={handleSync}
                        >
                            {syncing ? <RefreshCcw className="spin" size={18} /> : <Copy size={18} />}
                            {syncing ? t('sync.btn_syncing') : t('sync.btn_start')}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .sync-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
                .page-header { margin-bottom: 32px; }
                .header-info { display: flex; align-items: center; gap: 16px; }
                .header-icon { 
                    width: 48px; height: 48px; background: var(--primary-glow); 
                    color: var(--primary); border-radius: 12px; display: flex; 
                    align-items: center; justify-content: center; 
                }
                .header-icon.platinum { background: rgba(245, 158, 11, 0.1); color: var(--gold); }
                .header-text h1 { font-size: 1.8rem; font-weight: 800; color: var(--text-main); }
                .header-text p { color: var(--text-muted); font-size: 0.9rem; }

                .platinum-upsell { 
                    padding: 80px 40px; text-align: center; border: 1px solid var(--gold);
                    background: linear-gradient(180deg, var(--bg-card), var(--bg-dark));
                    border-radius: 24px; position: relative; overflow: hidden;
                }
                .upsell-badge { 
                    position: absolute; top: 20px; right: 20px; background: var(--gold);
                    color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 900;
                }
                .platinum-upsell h2 { font-size: 2.2rem; font-weight: 900; margin: 24px 0 12px; }
                .platinum-upsell p { font-size: 1.1rem; color: var(--text-muted); max-width: 600px; margin: 0 auto 32px; }

                .sync-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px; }
                .card { padding: 32px; background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border); position: relative; }
                .step-badge { 
                    position: absolute; top: -12px; left: 32px; width: 32px; height: 32px;
                    background: var(--primary); color: white; border-radius: 10px;
                    display: flex; align-items: center; justify-content: center; font-weight: 800;
                    box-shadow: 0 4px 12px var(--primary-glow);
                }

                h3 { font-size: 1.3rem; font-weight: 800; margin-bottom: 8px; color: var(--text-main); }
                .text-dim { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 24px; }

                .source-selector { margin-bottom: 32px; }
                .sync-warning { 
                    padding: 16px; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: 12px; display: flex; gap: 12px; color: #f87171; font-size: 0.85rem;
                }

                .modules-list { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 32px; }
                .module-item { 
                    display: flex; align-items: center; gap: 12px; padding: 14px;
                    background: var(--bg-badge); border-radius: 12px; border: 1px solid var(--border);
                    cursor: pointer; transition: 0.2s;
                }
                .module-item:hover { border-color: var(--primary); transform: translateY(-2px); }
                .module-item.active { border-color: var(--primary); background: var(--primary-glow); }
                
                .mod-icon { color: var(--text-muted); }
                .module-item.active .mod-icon { color: var(--primary); }
                .mod-info span { font-weight: 600; font-size: 0.9rem; color: var(--text-main); }
                
                .mod-check { margin-left: auto; color: var(--primary); }
                .uncheck { width: 18px; height: 18px; border: 2px solid var(--border); border-radius: 50%; }

                .action-footer { border-top: 1px solid var(--border); pt: 24px; display: flex; justify-content: flex-end; }
                .btn-sync { 
                    background: var(--primary); color: white; border: none; padding: 14px 28px;
                    border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; 
                    align-items: center; gap: 10px; transition: 0.3s;
                }
                .btn-sync:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px var(--primary-glow); }
                .btn-sync:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(1); }

                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .btn-premium-cta { 
                    background: linear-gradient(135deg, #f59e0b, #fbbf24); color: white;
                    border: none; padding: 16px 32px; border-radius: 14px; font-size: 1rem;
                    font-weight: 800; cursor: pointer; transition: 0.3s;
                    box-shadow: 0 10px 25px rgba(245, 158, 11, 0.4);
                }
                .btn-premium-cta:hover { transform: translateY(-2px); box-shadow: 0 15px 35px rgba(245, 158, 11, 0.5); }
            `}</style>
        </div>
    );
}
