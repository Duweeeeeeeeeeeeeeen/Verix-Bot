import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Bot, Shield, Info, Save, 
    Key, Power, AlertTriangle, 
    ExternalLink, CheckCircle, XCircle, Zap
} from 'lucide-react';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';

export default function PrivateBotPage() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [botData, setBotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState('');

  const fetchData = async () => {
    if (!guildId || guildId === 'undefined') return;
    setLoading(true);
    try {
        const guildRes = await api.request(`/config/${guildId}/guild`);
        setConfig(guildRes.data || guildRes);

        const botRes = await api.request(`/private-bot/${guildId}`);
        setBotData(botRes.bot);
    } catch (err) {
        console.error('Failed to fetch data:', err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [guildId]);

  const handleSave = async () => {
    if (!token && !botData) {
        alert('Inserisci un token valido');
        return;
    }

    setSaving(true);
    try {
        await api.request(`/private-bot/${guildId}`, {
            method: 'POST',
            data: {
                token: token || undefined,
                enabled: botData ? botData.enabled : true
            }
        });
        setToken('');
        fetchData();
    } catch (err) {
        console.error('Save failed:', err);
    } finally {
        setSaving(false);
    }
  };

  const handleToggle = async () => {
    if (!botData) return;
    try {
        const res = await api.request(`/private-bot/${guildId}/toggle`, { method: 'POST' });
        setBotData({ ...botData, enabled: res.enabled });
    } catch (err) {
        console.error('Toggle failed:', err);
    }
  };

  if (loading) return <Skeleton type="config" />;

  const isPremium = !!config?.isPremium;

  return (
    <div className="private-bot-container animate">
        <header className="page-header">
            <div className="header-info">
                <div className="header-icon">
                    <Key size={24} />
                </div>
                <div className="header-text">
                    <h1>True White-label</h1>
                    <p>Usa il tuo bot personale con foto e banner personalizzati.</p>
                </div>
            </div>
            {isPremium && (
                <button 
                    className="btn-save" 
                    onClick={handleSave} 
                    disabled={saving || (!token && !botData)}
                >
                    {saving ? <Zap size={16} className="animate-spin" /> : <Save size={16} />}
                    Salva Configurazione
                </button>
            )}
        </header>

        {!isPremium ? (
            <div className="premium-upsell card">
                <div className="upsell-badge">PLATINUM FEATURE</div>
                <div className="upsell-icon">
                    <Bot size={48} />
                </div>
                <h2>Il tuo Bot Personale</h2>
                <p>Vuoi che il bot abbia la tua foto e il tuo nome ovunque? La funzione Private Bot ti permette di collegare il tuo account bot a Verix.</p>
                <button onClick={() => router.push(`/config/${guildId}/premium`)} className="btn-premium-cta">
                    Passa a Platinum
                </button>
            </div>
        ) : (
            <div className="private-bot-content fade-in">
                <div className="grid-layout">
                    <div className="main-card card">
                        <div className="card-header">
                            <Bot size={20} />
                            <h3>Configurazione Token</h3>
                        </div>
                        
                        <div className="alert warning">
                            <AlertTriangle size={20} />
                            <div>
                                <strong>Attenzione:</strong> Non condividere MAI il tuo token con nessuno. Verix lo salverà in modo criptato e sicuro.
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Discord Bot Token</label>
                            <input 
                                type="password" 
                                value={token} 
                                onChange={(e) => setToken(e.target.value)}
                                placeholder={botData ? '••••••••••••••••••••••••••••' : 'Incolla qui il tuo token...'}
                            />
                            <p className="hint">Puoi ottenere il token dal <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer">Discord Developer Portal <ExternalLink size={12} /></a></p>
                        </div>

                        <div className="setup-stepper">
                            <h4>Guida alla Configurazione Rapida</h4>
                            
                            <div className="step-item">
                                <div className="step-number">1</div>
                                <div className="step-content">
                                    <h5>Crea l'Applicazione</h5>
                                    <p>Vai sul <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer">Developer Portal</a> e clicca su <strong>"New Application"</strong>. Scegli l'opzione <strong>"Bot"</strong> come mostrato sotto.</p>
                                    <div className="step-img-container">
                                        <img src="/img/guide/step1.png" alt="Schermata New Application" />
                                    </div>
                                </div>
                            </div>

                            <div className="step-item">
                                <div className="step-number">2</div>
                                <div className="step-content">
                                    <h5>Prendi il Token</h5>
                                    <p>Nel menu a sinistra seleziona <strong>"Bot"</strong>. Clicca su <strong>"Resetta token"</strong> per visualizzare e copiare la tua chiave segreta.</p>
                                    <div className="step-img-container">
                                        <img src="/img/guide/step2.png" alt="Sezione Bot & Token" />
                                    </div>
                                </div>
                            </div>

                            <div className="step-item warning">
                                <div className="step-number">3</div>
                                <div className="step-content">
                                    <h5>Abilita i Permessi (Cruciale)</h5>
                                    <p>Sempre nella tab <strong>"Bot"</strong>, scendi fino a <strong>"Privileged Gateway Intents"</strong> e attiva tutti e tre gli interruttori come mostrato nella foto sotto. Senza questi, il bot non potrà leggere i messaggi o vedere i membri.</p>
                                    <div className="step-img-container">
                                        <img src="/img/guide/step3.png" alt="Gateway Intents" />
                                    </div>
                                </div>
                            </div>

                            <div className="step-item">
                                <div className="step-number">4</div>
                                <div className="step-content">
                                    <h5>Salva e Avvia</h5>
                                    <p>Torna qui, incolla il token e clicca su <strong>"Salva Configurazione"</strong>. Poi usa l'interruttore "Stato Istanza" per accenderlo!</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="status-card card">
                        <div className="card-header">
                            <Power size={20} />
                            <h3>Stato Istanza</h3>
                        </div>

                        {botData ? (
                            <div className="bot-status-info">
                                <div className="bot-profile">
                                    <img src={botData.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'} alt="Bot Avatar" />
                                    <div className="bot-details">
                                        <h4>{botData.clientName || 'Private Bot'}</h4>
                                        <span className={`badge status-${botData.status}`}>
                                            {botData.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <div className="toggle-control">
                                    <span>Accendi / Spegni Bot</span>
                                    <label className="switch">
                                        <input 
                                            type="checkbox" 
                                            checked={botData.enabled} 
                                            onChange={handleToggle}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                {botData.status === 'error' && (
                                    <div className="error-log">
                                        <strong>Ultimo errore:</strong>
                                        <p>{botData.lastError}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="empty-status">
                                <Info size={40} />
                                <p>Nessun bot privato configurato per questo server.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        <style jsx>{`
            .private-bot-container { padding: 20px; }
            .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: var(--primary-glow); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.8rem; font-weight: 800; color: var(--text-main); }
            
            .btn-save { background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.3s; }
            
            .grid-layout { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; }
            .card { padding: 24px; }
            .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 16px; }
            
            .alert { display: flex; gap: 12px; padding: 16px; border-radius: 12px; margin-bottom: 24px; font-size: 0.9rem; }
            .alert.warning { background: rgba(255, 152, 0, 0.1); border: 1px solid rgba(255, 152, 0, 0.3); color: #ff9800; }
            
            .input-group { margin-bottom: 24px; }
            .input-group label { display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-muted); }
            .input-group input { width: 100%; padding: 12px 16px; background: var(--bg-badge); border: 1px solid var(--border); border-radius: 12px; color: var(--text-main); outline: none; transition: 0.2s; }
            .input-group input:focus { border-color: var(--primary); }
            
            .setup-stepper { margin-top: 32px; border-top: 1px solid var(--border); padding-top: 24px; }
            .setup-stepper h4 { font-size: 1.1rem; margin-bottom: 24px; color: var(--text-main); font-weight: 700; }
            
            .step-item { display: flex; gap: 16px; margin-bottom: 32px; position: relative; }
            .step-item:not(:last-child):after { content: ''; position: absolute; left: 16px; top: 32px; bottom: -32px; width: 2px; background: var(--border); opacity: 0.5; }
            
            .step-number { width: 32px; height: 32px; background: var(--bg-badge); border: 2px solid var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; flex-shrink: 0; z-index: 2; }
            .step-item.warning .step-number { border-color: #ff9800; color: #ff9800; background: rgba(255, 152, 0, 0.1); }
            
            .step-content h5 { font-size: 1rem; margin-bottom: 6px; color: var(--text-main); }
            .step-content p { font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 12px; }
            .step-content strong { color: var(--text-main); }
            
            .intent-list { list-style: none; padding: 0; margin-bottom: 16px; }
            .intent-list li { font-size: 0.85rem; color: var(--text-main); display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
            .intent-list li:before { content: '✓'; color: #4caf50; font-weight: 900; }

            .step-img-container { width: 100%; max-width: 500px; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); margin-top: 12px; background: var(--bg-badge); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .step-img-container img { width: 100%; height: auto; display: block; }

            .bot-profile { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; background: var(--bg-badge); padding: 16px; border-radius: 16px; }
            .bot-profile img { width: 64px; height: 64px; border-radius: 50%; border: 2px solid var(--primary); }
            .bot-details h4 { font-size: 1.2rem; margin-bottom: 4px; }
            
            .badge { padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 800; }
            .status-online { background: rgba(76, 175, 80, 0.1); color: #4caf50; }
            .status-offline { background: rgba(158, 158, 158, 0.1); color: #9e9e9e; }
            .status-error { background: rgba(244, 67, 54, 0.1); color: #f44336; }

            .toggle-control { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-badge); border-radius: 12px; }
            
            .error-log { margin-top: 24px; padding: 12px; background: rgba(244, 67, 54, 0.05); border-radius: 8px; border: 1px solid rgba(244, 67, 54, 0.2); }
            .error-log p { font-size: 0.8rem; color: #f44336; margin-top: 4px; }

            .empty-status { text-align: center; padding: 40px; color: var(--text-muted); }
            .empty-status p { margin-top: 12px; font-size: 0.9rem; }

            .switch { position: relative; display: inline-block; width: 50px; height: 26px; }
            .switch input { opacity: 0; width: 0; height: 0; }
            .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--bg-card); transition: .4s; border: 1px solid var(--border); }
            .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
            input:checked + .slider { background-color: var(--primary); border-color: var(--primary); }
            input:checked + .slider:before { transform: translateX(24px); }
            .slider.round { border-radius: 34px; }
            .slider.round:before { border-radius: 50%; }

            .premium-upsell { text-align: center; padding: 60px; margin-top: 40px; }
            .btn-premium-cta { background: var(--primary); color: white; padding: 14px 28px; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; margin-top: 24px; }
        `}</style>
    </div>
  );
}
