import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import api from '../../../utils/api';
import { 
    Save, Mic2, Users, MousePointer2, Shield, ListFilter, Info, CheckCircle, 
    XCircle, MessageSquare, Settings2, Palette, Zap, Power, Globe, Clock, Layout, Terminal
} from 'lucide-react';
import { DiscordSelector } from '../../../components/LazyConfigComponents';
import { EmbedMessageManager } from '../../../components/LazyConfigComponents';
import { EmbedEditor } from '../../../components/LazyConfigComponents';
import { mergeConfig } from '../../../utils/defaults';
import CustomSelect from '../../../components/CustomSelect';
import { useT } from '../../../contexts/LanguageContext';
import Head from 'next/head';

export default function VoiceConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const [mounted, setMounted] = useState(false);
  const [activeEmbedKey, setActiveEmbedKey] = useState('voice_waiting');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
      setLoading(true);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
      Promise.all([
        api.request(`/config/${guildId}/whitelist`).catch(() => ({ data: {} })),
        api.request(`/config/${guildId}/discord-data`).catch(() => ({ roles: [], channels: [] }))
      ]).then(([wlRes, discordRes]) => {
        const wlData = wlRes?.data || wlRes || {};
        const voiceEmbeds = {};
        const voiceKeys = ['voice_waiting', 'voice_guide', 'voice_staff_log', 'voice_error_flow'];
        voiceKeys.forEach(k => {
            if (wlData.embeds?.[k]) voiceEmbeds[k] = wlData.embeds[k];
        });

        const voiceConfig = {
            ...(wlData.voiceSettings || {}),
            embeds: voiceEmbeds
        };
        
        setConfig(mergeConfig(voiceConfig, 'voice'));
        setChannels(discordRes?.data?.channels || discordRes?.channels || []);
        setRoles(discordRes?.data?.roles || discordRes?.roles || []);
      }).finally(() => {
        setLoading(false);
        window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
      });
    }
  }, [guildId, mounted]);

  const setNested = (path, value) => {
    setConfig(prev => {
        const newConfig = { ...prev };
        const parts = path.split('.');
        let cur = newConfig;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!cur[parts[i]]) cur[parts[i]] = {};
            else cur[parts[i]] = { ...cur[parts[i]] };
            cur = cur[parts[i]];
        }
        cur[parts[parts.length - 1]] = value;
        return newConfig;
    });
  };

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/whitelist`, {
        method: 'POST',
        body: JSON.stringify({ 
            voiceSettings: { ...config, embeds: undefined },
            embeds: { ...(config.embeds || {}) }
        })
      });
      showToast("Configurazione vocale salvata!");
    } catch (error) {
      showToast("Errore durante il salvataggio.", 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>Sistema Voice (Provini) | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)' }}>
                    <Mic2 size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>Interviste & Provini Vocali</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? 'SISTEMA CODE ATTIVO' : 'SISTEMA DISABILITATO'}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <button 
                  className={`pc-status-toggle-v2 ${config.enabled ? 'active' : ''}`}
                  onClick={() => setConfig({...config, enabled: !config.enabled})}
                >
                  <Power size={18} />
                  <span>{config.enabled ? 'Spegni' : 'Attiva'}</span>
                </button>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? 'Salvataggio...' : 'Salva Modifiche'}</span>
                </button>
            </div>
        </header>

        {/* V2 Tabs */}
        <nav className="pc-tabs-container-v2" style={{ marginBottom: '40px' }}>
            <div className="pc-tabs-v2">
                <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                    <Settings2 size={16} /> <span>Impostazioni Canali</span>
                </button>
                <button className={activeTab === 'ui' ? 'active' : ''} onClick={() => setActiveTab('ui')}>
                    <MousePointer2 size={16} /> <span>Pulsanti & Staff UI</span>
                </button>
                <button className={activeTab === 'design' ? 'active' : ''} onClick={() => setActiveTab('design')}>
                    <Palette size={16} /> <span>Design Studio</span>
                </button>
            </div>
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'settings' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '32px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: '#ecfeff', color: '#06b6d4' }}><Terminal size={18} /></div>
                                <h3 style={{ margin: 0 }}>Canali di Sistema</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>Canale di Entrata (Join)</label>
                                        <DiscordSelector type="channel" options={channels.filter(c => c.type === 2)} value={config.joinChannelId || ''} onChange={val => setNested('joinChannelId', val)} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Categoria Stanze Provini</label>
                                        <DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.categoryId || ''} onChange={val => setNested('categoryId', val)} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: '#f0f9ff', color: '#0ea5e9' }}><Zap size={18} /></div>
                                <h3 style={{ margin: 0 }}>Automazione Ruoli</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>Ruoli da Aggiungere (Successo)</label>
                                        <DiscordSelector type="role" multiple={true} options={roles} value={config.rolesToAdd || []} onChange={val => setNested('rolesToAdd', val)} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>Ruoli da Rimuovere (Successo)</label>
                                        <DiscordSelector type="role" multiple={true} options={roles} value={config.rolesToRemove || []} onChange={val => setNested('rolesToRemove', val)} />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: '#fdf2f8', color: '#db2777' }}><Shield size={18} /></div>
                                <h3 style={{ margin: 0 }}>Policy Valutazione</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>Team Valutatori</label>
                                    <DiscordSelector type="role" multiple={true} options={roles} value={config.staffRoleIds || []} onChange={val => setNested('staffRoleIds', val)} />
                                </div>
                                <div className="pc-input-group-v2" style={{ marginTop: '24px' }}>
                                    <label>Cooldown Rifiuto (Ore)</label>
                                    <div className="pc-input-wrapper-v2" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px' }}>
                                        <Clock size={16} style={{ marginLeft: '16px', color: '#94a3b8' }} />
                                        <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '14px 16px', fontWeight: 800, outline: 'none' }} value={config.rejectionCooldown || 24} onChange={e => setNested('rejectionCooldown', parseInt(e.target.value))} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', background: '#f8fafc', padding: '20px', borderRadius: '24px', border: '1.5px solid #e2e8f0' }}>
                                    <div className="v-stack">
                                        <strong style={{ fontWeight: 900, color: '#1e293b', fontSize: '0.9rem' }}>Auto-Cleanup</strong>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 650 }}>Elimina canali inattivi.</span>
                                    </div>
                                    <label className="pc-toggle-v2 mini">
                                        <input type="checkbox" checked={!!config.autoDelete} onChange={e => setNested('autoDelete', e.target.checked)} />
                                        <span className="pc-slider-v2"></span>
                                    </label>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            )}

            {activeTab === 'ui' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}><MousePointer2 size={18} /></div>
                            <h3 style={{ margin: 0 }}>Branding Pulsanti Staff</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-button-grid-v2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                                {[
                                    { key: 'approve', label: 'Approvazione', icon: CheckCircle, color: '#10b981' },
                                    { key: 'deny', label: 'Rifiuto', icon: XCircle, color: '#ef4444' },
                                    { key: 'reset', label: 'Reset Stato', icon: RefreshCcw, color: '#6366f1' }
                                ].map(btn => (
                                    <div key={btn.key} className="pc-sub-card-v2" style={{ background: '#f8fafc', padding: '24px', borderRadius: '28px', border: '1.5px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: btn.color, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                                <btn.icon size={16} />
                                            </div>
                                            <span style={{ fontWeight: 900, color: '#1e293b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{btn.label}</span>
                                        </div>
                                        <div className="v-stack" style={{ gap: '16px' }}>
                                            <div className="pc-input-group-v2">
                                                <label>Testo Visualizzato</label>
                                                <input className="pc-input-modern-v2" value={config.voiceButtons?.[btn.key]?.label || ''} onChange={e => setNested(`voiceButtons.${btn.key}.label`, e.target.value)} />
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>Stile Bottone</label>
                                                <CustomSelect 
                                                    options={[
                                                        { value: 'SUCCESS', label: 'Success (Verde)' },
                                                        { value: 'DANGER', label: 'Danger (Rosso)' },
                                                        { value: 'PRIMARY', label: 'Primary (Blu)' },
                                                        { value: 'SECONDARY', label: 'Secondary (Grigio)' }
                                                    ]} 
                                                    value={config.voiceButtons?.[btn.key]?.style || 'PRIMARY'} 
                                                    onChange={val => setNested(`voiceButtons.${btn.key}.style`, val)} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'design' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}><Palette size={18} /></div>
                            <h3 style={{ margin: 0 }}>Design Canale Temporaneo</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-tabs-v2" style={{ marginBottom: '32px', background: '#f8fafc', padding: '6px' }}>
                                {[
                                    { key: 'voice_waiting', label: 'In Attesa' },
                                    { key: 'voice_guide', label: 'Guida Staff' },
                                    { key: 'voice_staff_log', label: 'Log Eventi' },
                                    { key: 'voice_error_flow', label: 'Errore' }
                                ].map(k => (
                                    <button key={k.key} onClick={() => setActiveEmbedKey(k.key)} className={activeEmbedKey === k.key ? 'active' : ''}>
                                        <span>{k.label}</span>
                                    </button>
                                ))}
                            </div>
                            <EmbedEditor 
                                embed={config.embeds?.[activeEmbedKey] || {}} 
                                onChange={val => setNested(`embeds.${activeEmbedKey}`, val)}
                                variables={['user', 'staff', 'voice_channel', 'reason', 'cooldown']}
                            />
                        </div>
                    </section>

                    <EmbedMessageManager 
                        guildId={guildId}
                        module="voice"
                        slugs={[
                            { key: 'dm_accepted', label: 'Esito Positivo (DM)', description: 'Inviato all\'utente quando viene accettato dal vocale.', variables: ['user'], group: 'Outcome UI', groupIcon: CheckCircle },
                            { key: 'dm_rejected', label: 'Esito Negativo (DM)', description: 'Inviato all\'utente in caso di rifiuto con motivo.', variables: ['user', 'reason', 'cooldown'], group: 'Outcome UI', groupIcon: XCircle },
                            { key: 'staff_approved', label: 'Feedback Approvazione', description: 'Log visibile allo staff nell\'interfaccia di provino.', variables: ['user', 'staff'], group: 'Staff UI', groupIcon: Shield },
                            { key: 'staff_denied', label: 'Feedback Rifiuto', description: 'Log visibile allo staff con il motivo specificato.', variables: ['user', 'staff', 'reason'], group: 'Staff UI', groupIcon: Shield }
                        ]}
                    />
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 40px; max-width: 1600px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: white; padding: 32px; border-radius: 32px; box-shadow: var(--shadow-premium); border: 1px solid var(--border-light); }
            .header-info { display: flex; align-items: center; gap: 24px; }
            .pc-icon-box { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 12px 24px rgba(6, 182, 212, 0.25); }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Inter', sans-serif; font-size: 2.2rem; font-weight: 900; margin: 0; color: #1e293b; letter-spacing: -0.5px; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 900; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.5px; }
            .pc-status-tag-v2.on { background: #ecfeff; color: #0891b2; }
            .pc-status-tag-v2.off { background: #fef2f2; color: #ef4444; }
            .status-dot-v2 { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: #f8fafc; color: #64748b; border: 1.5px solid #e2e8f0; padding: 12px 24px; border-radius: 16px; font-weight: 800; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: #ecfeff; color: #0891b2; border-color: #a5f3fc; }
            .pc-btn-primary { background: var(--primary); color: white; border: none; padding: 14px 28px; border-radius: 16px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 25px rgba(99, 102, 241, 0.3); }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 8px; background: #f1f5f9; padding: 6px; border-radius: 18px; width: fit-content; overflow-x: auto; max-width: 100%; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 10px; padding: 12px 24px; border: none; background: transparent; color: #64748b; font-weight: 800; font-size: 0.9rem; border-radius: 14px; cursor: pointer; transition: 0.2s; white-space: nowrap; }
            .pc-tabs-v2 button.active { background: white; color: var(--primary); box-shadow: 0 4px 15px rgba(0,0,0,0.05); }

            /* Card V2 */
            .pc-card-v2 { background: white; border: 1px solid var(--border-light); border-radius: 32px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
            .header-icon { width: 44px; height: 44px; background: #f5f3ff; color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
            .pc-input-group-v2 label { font-size: 0.7rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
            .pc-input-modern-v2 { width: 100%; background: white; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 14px 16px; font-weight: 700; color: #1e293b; outline: none; }

            /* Toggle V2 */
            .pc-toggle-v2 { position: relative; width: 44px; height: 22px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: #cbd5e1; transition: .4s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background: white; transition: .4s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: var(--primary); }
            input:checked + .pc-slider-v2:before { transform: translateX(22px); }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-sub-card-v2 { background: #ffffff !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
