import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Bot, Shield, Info, Save, 
    Crown, EyeOff, MessageSquare, 
    Zap, Sparkles, Check, Plus, Trash2, Clock
} from 'lucide-react';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';

export default function WhiteLabelPage() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Status management
  const [statuses, setStatuses] = useState([]);
  const [rotationInterval, setRotationInterval] = useState(60);

  const fetchData = async () => {
    if (!guildId || guildId === 'undefined') return;
    setLoading(true);
    try {
        const res = await api.request(`/config/${guildId}/guild`);
        const data = res.data || res;
        setConfig(data);
        setStatuses(data.customStatuses || []);
        setRotationInterval(data.statusRotationInterval || 60);
    } catch (err) {
        console.error('Failed to fetch config:', err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [guildId]);

  const addStatus = () => {
    setStatuses([...statuses, { text: '', type: 0 }]);
  };

  const removeStatus = (index) => {
    setStatuses(statuses.filter((_, i) => i !== index));
  };

  const updateStatus = (index, field, value) => {
    const newStatuses = [...statuses];
    newStatuses[index] = { ...newStatuses[index], [field]: value };
    setStatuses(newStatuses);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
        await api.request(`/config/${guildId}/guild`, {
            method: 'PATCH',
            data: {
                customBotName: config.customBotName,
                customStatuses: statuses,
                statusRotationInterval: rotationInterval,
                hideBranding: config.hideBranding
            }
        });
    } catch (err) {
        console.error('Save failed:', err);
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <Skeleton type="config" />;

  const isPremium = !!config?.isPremium;

  return (
    <div className="white-label-container animate">
        <header className="page-header">
            <div className="header-info">
                <div className="header-icon">
                    <Sparkles size={24} />
                </div>
                <div className="header-text">
                    <h1>{t('whitelabel.title')}</h1>
                    <p>{t('whitelabel.desc')}</p>
                </div>
            </div>
            {isPremium && (
                <button 
                    className="btn-save" 
                    onClick={handleSave} 
                    disabled={saving}
                >
                    {saving ? <Zap size={16} className="animate-spin" /> : <Save size={16} />}
                    {t('whitelabel.save')}
                </button>
            )}
        </header>

        {!isPremium ? (
            <div className="premium-upsell card">
                <div className="upsell-badge">PRO FEATURE</div>
                <div className="upsell-icon">
                    <Bot size={48} />
                </div>
                <h2>{t('whitelabel.upsell_title')}</h2>
                <p>{t('whitelabel.upsell_desc')}</p>
                
                <div className="preview-comparison">
                    <div className="preview-box free">
                        <span className="p-label">{t('whitelabel.free_version')}</span>
                        <div className="mock-embed">
                            <div className="embed-footer">Powered by Verix Bot</div>
                        </div>
                    </div>
                    <div className="preview-box premium">
                        <span className="p-label">{t('whitelabel.premium_version')}</span>
                        <div className="mock-embed">
                            <div className="embed-footer">© {config?.name || 'Il Tuo Server'}</div>
                        </div>
                    </div>
                </div>

                <button onClick={() => router.push(`/config/${guildId}/premium`)} className="btn-premium-cta">
                    {t('whitelabel.unlock_cta')}
                </button>
            </div>
        ) : (
            <div className="white-label-content fade-in">
                <div className="settings-grid">
                    <div className="settings-card card">
                        <div className="card-header">
                            <Bot size={20} />
                            <h3>{t('whitelabel.profile_title')}</h3>
                        </div>
                        <div className="input-group">
                            <label>{t('whitelabel.nickname_label')}</label>
                            <input 
                                type="text" 
                                value={config.customBotName || ''} 
                                onChange={(e) => setConfig({...config, customBotName: e.target.value})}
                                placeholder={t('whitelabel.nickname_placeholder')}
                            />
                            <p className="hint">{t('whitelabel.nickname_hint')}</p>
                        </div>
                        
                        <div className="status-section">
                            <div className="section-header">
                                <label>{t('whitelabel.status_rotation_title')}</label>
                                <button className="btn-add-status" onClick={addStatus}>
                                    <Plus size={14} /> {t('whitelabel.add_status')}
                                </button>
                            </div>
                            
                            <div className="statuses-list">
                                {statuses.map((s, index) => (
                                    <div key={index} className="status-item animate-slide-in">
                                        <select 
                                            className="status-type-select"
                                            value={s.type || 0}
                                            onChange={(e) => updateStatus(index, 'type', parseInt(e.target.value))}
                                        >
                                            <option value="0">{t('whitelabel.status_play')}</option>
                                            <option value="3">{t('whitelabel.status_watch')}</option>
                                            <option value="2">{t('whitelabel.status_listen')}</option>
                                            <option value="5">{t('whitelabel.status_compete')}</option>
                                            <option value="4">{t('whitelabel.status_custom')}</option>
                                        </select>
                                        <input 
                                            type="text" 
                                            value={s.text || ''} 
                                            onChange={(e) => updateStatus(index, 'text', e.target.value)}
                                            placeholder={t('whitelabel.status_placeholder')}
                                        />
                                        <button className="btn-delete-status" onClick={() => removeStatus(index)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                {statuses.length === 0 && (
                                    <div className="empty-statuses">
                                        {t('whitelabel.empty_statuses')}
                                    </div>
                                )}
                            </div>

                            {statuses.length > 1 && (
                                <div className="input-group rotation-interval">
                                    <label><Clock size={14} /> {t('whitelabel.rotation_interval_label')}</label>
                                    <input 
                                        type="number" 
                                        min="15"
                                        value={rotationInterval} 
                                        onChange={(e) => setRotationInterval(parseInt(e.target.value))}
                                    />
                                    <p className="hint">{t('whitelabel.rotation_interval_hint', { interval: rotationInterval })}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="settings-card card">
                        <div className="card-header">
                            <EyeOff size={20} />
                            <h3>{t('whitelabel.branding_title')}</h3>
                        </div>
                        <div className="toggle-group">
                            <div className="toggle-info">
                                <h4>{t('whitelabel.remove_branding_label')}</h4>
                                <p>{t('whitelabel.remove_branding_desc')}</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={config.hideBranding} 
                                    onChange={(e) => setConfig({...config, hideBranding: e.target.checked})}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        
                        <div className="placeholder-info card mt-4">
                            <h4>{t('whitelabel.placeholders_title')}</h4>
                            <p>{t('whitelabel.placeholders_desc')}</p>
                            <ul>
                                <li><code>{`{players}`}</code> - {t('whitelabel.placeholder_players')}</li>
                                <li><code>{`{max_players}`}</code> - {t('whitelabel.placeholder_max_players')}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <style jsx>{`
            .white-label-container { padding: 20px; }
            .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: var(--primary-glow); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.8rem; font-weight: 800; color: var(--text-main); }
            .header-text p { color: var(--text-muted); font-size: 0.9rem; }
            
            .btn-save { background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.3s; }
            .btn-save:hover { transform: translateY(-2px); box-shadow: var(--primary-glow); }

            .premium-upsell { 
                display: flex; flex-direction: column; align-items: center; justify-content: center; 
                padding: 60px 40px; text-align: center; max-width: 900px; margin: 40px auto;
                background: var(--bg-card);
                border: 1px solid var(--border);
                border-radius: 24px;
            }
            .upsell-badge { background: var(--primary-glow); color: var(--primary); padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 900; margin-bottom: 20px; }
            .upsell-icon { width: 100px; height: 100px; background: var(--primary-glow); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
            .premium-upsell h2 { font-size: 2rem; font-weight: 900; margin-bottom: 12px; }
            .preview-comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; width: 100%; max-width: 700px; margin-bottom: 48px; }
            .preview-box { background: var(--bg-badge); padding: 24px; border-radius: 16px; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 16px; }
            .btn-premium-cta { background: var(--primary); color: white; border: none; padding: 18px 36px; border-radius: 16px; font-size: 1.1rem; font-weight: 800; cursor: pointer; transition: 0.3s; box-shadow: var(--primary-glow); }

            .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
            .settings-card { padding: 24px; }
            .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
            .card-header h3 { font-size: 1.1rem; font-weight: 700; color: var(--text-main); }

            .input-group { margin-bottom: 20px; }
            .input-group label { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; }
            .input-group input { width: 100%; background: var(--bg-badge); border: 1px solid var(--border); padding: 12px 16px; border-radius: 12px; color: var(--text-main); outline: none; transition: 0.2s; }
            
            .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; margin-top: 32px; }
            .section-header label { font-size: 0.9rem; font-weight: 700; color: var(--text-main); }
            .btn-add-status { background: var(--primary-glow); color: var(--primary); border: none; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 4px; cursor: pointer; transition: 0.2s; }
            .btn-add-status:hover { background: var(--primary); color: white; }

            .statuses-list { display: flex; flex-direction: column; gap: 12px; }
            .status-item { display: flex; gap: 10px; background: var(--bg-badge); padding: 12px; border-radius: 16px; border: 1px solid var(--border); align-items: center; }
            .status-type-select { background: var(--bg-card); border: 1px solid var(--border); padding: 8px; border-radius: 8px; color: var(--text-main); outline: none; font-size: 0.85rem; }
            .status-item input { flex: 1; background: transparent; border: none; color: var(--text-main); outline: none; font-size: 0.9rem; }
            .btn-delete-status { color: var(--danger); background: transparent; border: none; cursor: pointer; opacity: 0.6; transition: 0.2s; }
            .btn-delete-status:hover { opacity: 1; transform: scale(1.1); }
            
            .empty-statuses { text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.85rem; background: var(--bg-badge); border-radius: 16px; border: 1px dashed var(--border); }
            .rotation-interval { margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border); }

            .placeholder-info { padding: 16px; background: rgba(var(--primary-rgb), 0.05); border: 1px solid var(--primary-glow); border-radius: 16px; }
            .placeholder-info h4 { font-size: 0.9rem; font-weight: 700; color: var(--primary); margin-bottom: 12px; }
            .placeholder-info p { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px; }
            .placeholder-info ul { list-style: none; padding: 0; }
            .placeholder-info li { font-size: 0.8rem; color: var(--text-main); margin-bottom: 4px; }
            .placeholder-info code { background: var(--bg-card); padding: 2px 6px; border-radius: 4px; color: var(--primary); font-weight: 700; }

            .switch { position: relative; display: inline-block; width: 50px; height: 26px; }
            .slider.round { border-radius: 34px; }
            .mt-4 { margin-top: 16px; }
        `}</style>
    </div>
  );
}
