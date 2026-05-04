import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Bot, Shield, Info, Save, 
    Crown, EyeOff, MessageSquare, 
    Zap, Sparkles, Check
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

  const fetchData = async () => {
    if (!guildId || guildId === 'undefined') return;
    setLoading(true);
    try {
        const res = await api.request(`/config/${guildId}/guild`);
        setConfig(res.data || res);
    } catch (err) {
        console.error('Failed to fetch config:', err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [guildId]);

  const handleSave = async () => {
    setSaving(true);
    try {
        await api.request(`/config/${guildId}/guild`, {
            method: 'PATCH',
            data: {
                customBotName: config.customBotName,
                customStatus: config.customStatus,
                customStatusType: config.customStatusType,
                hideBranding: config.hideBranding
            }
        });
        // Show success toast? (Assuming Layout handles it)
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
                    <h1>White-label & Identity</h1>
                    <p>Personalizza l'aspetto del bot nel tuo server per renderlo unico.</p>
                </div>
            </div>
            {isPremium && (
                <button 
                    className="btn-save" 
                    onClick={handleSave} 
                    disabled={saving}
                >
                    {saving ? <Zap size={16} className="animate-spin" /> : <Save size={16} />}
                    Salva Modifiche
                </button>
            )}
        </header>

        {!isPremium ? (
            <div className="premium-upsell card">
                <div className="upsell-badge">PRO FEATURE</div>
                <div className="upsell-icon">
                    <Bot size={48} />
                </div>
                <h2>Rendi il bot "Tuo"</h2>
                <p>Con il piano Premium, puoi rimuovere ogni riferimento a Verix e personalizzare l'identità del bot nel tuo server.</p>
                
                <div className="preview-comparison">
                    <div className="preview-box free">
                        <span className="p-label">VERSIONE FREE</span>
                        <div className="mock-embed">
                            <div className="embed-footer">Powered by Verix Bot</div>
                        </div>
                    </div>
                    <div className="preview-box premium">
                        <span className="p-label">VERSIONE PREMIUM</span>
                        <div className="mock-embed">
                            <div className="embed-footer">© {config?.name || 'Il Tuo Server'}</div>
                        </div>
                    </div>
                </div>

                <button onClick={() => router.push(`/config/${guildId}/premium`)} className="btn-premium-cta">
                    Sblocca Identità Personalizzata
                </button>
            </div>
        ) : (
            <div className="white-label-content fade-in">
                <div className="settings-grid">
                    <div className="settings-card card">
                        <div className="card-header">
                            <Bot size={20} />
                            <h3>Profilo Bot</h3>
                        </div>
                        <div className="input-group">
                            <label>Nickname Personalizzato</label>
                            <input 
                                type="text" 
                                value={config.customBotName || ''} 
                                onChange={(e) => setConfig({...config, customBotName: e.target.value})}
                                placeholder="Esempio: Assistente Verix"
                            />
                            <p className="hint">Il bot cambierà il suo nickname in questo server.</p>
                        </div>
                        <div className="input-group">
                            <label>Status Personalizzato (Attività)</label>
                            <div className="status-inputs">
                                <select 
                                    className="status-type-select"
                                    value={config.customStatusType || 0}
                                    onChange={(e) => setConfig({...config, customStatusType: parseInt(e.target.value)})}
                                >
                                    <option value="0">Gioca a</option>
                                    <option value="3">Guarda</option>
                                    <option value="2">Ascolta</option>
                                    <option value="5">Competi in</option>
                                </select>
                                <input 
                                    type="text" 
                                    value={config.customStatus || ''} 
                                    onChange={(e) => setConfig({...config, customStatus: e.target.value})}
                                    placeholder="Esempio: il server..."
                                />
                            </div>
                            <p className="hint">Lo status verrà aggiornato globalmente (non solo in questo server).</p>
                        </div>
                    </div>

                    <div className="settings-card card">
                        <div className="card-header">
                            <EyeOff size={20} />
                            <h3>Branding & Footer</h3>
                        </div>
                        <div className="toggle-group">
                            <div className="toggle-info">
                                <h4>Rimuovi "Powered by Verix"</h4>
                                <p>Nasconde il marchio Verix dal footer di tutti gli embed generati dal bot.</p>
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

            /* Upsell Styles */
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
            .premium-upsell p { color: var(--text-muted); margin-bottom: 40px; max-width: 500px; }

            .preview-comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; width: 100%; max-width: 700px; margin-bottom: 48px; }
            .preview-box { background: var(--bg-badge); padding: 24px; border-radius: 16px; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 16px; }
            .preview-box.premium { border-color: var(--primary); }
            .p-label { font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
            .mock-embed { background: #2f3136; height: 80px; border-radius: 4px; border-left: 4px solid var(--primary); padding: 12px; display: flex; flex-direction: column; justify-content: flex-end; }
            .embed-footer { font-size: 0.7rem; color: #b9bbbe; }

            .btn-premium-cta { background: var(--primary); color: white; border: none; padding: 18px 36px; border-radius: 16px; font-size: 1.1rem; font-weight: 800; cursor: pointer; transition: 0.3s; box-shadow: var(--primary-glow); }

            /* Content Styles */
            .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
            .settings-card { padding: 24px; }
            .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
            .card-header h3 { font-size: 1.1rem; font-weight: 700; color: var(--text-main); }
            .card-header svg { color: var(--primary); }

            .input-group { margin-bottom: 20px; }
            .input-group label { display: block; font-size: 0.9rem; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; }
            .input-group input { width: 100%; background: var(--bg-badge); border: 1px solid var(--border); padding: 12px 16px; border-radius: 12px; color: var(--text-main); outline: none; transition: 0.2s; }
            .input-group input:focus { border-color: var(--primary); background: var(--bg-card); }
            
            .status-inputs { display: flex; gap: 10px; }
            .status-type-select { 
                background: var(--bg-badge); 
                border: 1px solid var(--border); 
                padding: 12px; 
                border-radius: 12px; 
                color: var(--text-main); 
                outline: none;
                cursor: pointer;
            }
            .status-type-select:focus { border-color: var(--primary); }

            .hint { font-size: 0.75rem; color: var(--text-muted); margin-top: 6px; }

            .toggle-group { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-badge); border-radius: 16px; }
            .toggle-info h4 { font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px; }
            .toggle-info p { font-size: 0.8rem; color: var(--text-muted); }

            .switch { position: relative; display: inline-block; width: 50px; height: 26px; }
            .switch input { opacity: 0; width: 0; height: 0; }
            .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--bg-card); transition: .4s; border: 1px solid var(--border); }
            .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
            input:checked + .slider { background-color: var(--primary); border-color: var(--primary); }
            input:checked + .slider:before { transform: translateX(24px); }
            .slider.round { border-radius: 34px; }
            .slider.round:before { border-radius: 50%; }
        `}</style>
    </div>
  );
}
