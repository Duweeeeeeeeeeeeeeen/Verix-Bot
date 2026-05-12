import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import api from '../../../utils/api';
import { 
    Save, Mic2, Users, MousePointer2, Shield, ListFilter, Info, CheckCircle, 
    XCircle, MessageSquare, Settings2, Palette, Zap, Power, Globe, Clock, Layout, Terminal,
    RotateCcw
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

  const handleReset = async () => {
    if (!confirm(t('common.reset_confirm'))) return;
    
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const res = await api.request(`/config/${guildId}/whitelist/reset`, { method: 'POST', body: JSON.stringify({ module: 'voice' }) });
      if (res.success) {
        // Special case for voice as it's part of whitelist on backend
        const wlData = res.data || {};
        const voiceConfig = {
            ...(wlData.voiceSettings || {}),
            embeds: wlData.embeds || {}
        };
        setConfig(mergeConfig(voiceConfig, 'voice'));
        showToast(t('common.reset_success'));
      }
    } catch (error) {
      console.error("Reset error:", error);
      showToast(t('common.reset_error'), 'error');
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
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
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
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
                <div className="pc-toggle-container-v2">
                    <label className="pc-toggle-v2">
                        <input 
                            type="checkbox" 
                            checked={config.enabled} 
                            onChange={() => setConfig({...config, enabled: !config.enabled})} 
                        />
                        <span className="pc-slider-v2"></span>
                    </label>
                    <span className={config.enabled ? 'text-active' : 'text-inactive'}>
                        {config.enabled ? t('common.active') : t('common.inactive')}
                    </span>
                </div>
                <div className="pc-header-divider" style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 4px' }}></div>
                <button className="pc-btn-outline-v2" onClick={handleReset} title={t('common.reset_to_default')}>
                    <RotateCcw size={18} />
                </button>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('common.sync')}</span>
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
                                    <div className="pc-input-wrapper-v2" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-badge)', border: '1.5px solid var(--border)', borderRadius: '16px' }}>
                                        <Clock size={16} style={{ marginLeft: '16px', color: 'var(--text-dim)' }} />
                                        <input type="number" style={{ width: '100%', border: 'none', background: 'transparent', padding: '14px 16px', fontWeight: 700, outline: 'none' }} value={config.rejectionCooldown || 24} onChange={e => setNested('rejectionCooldown', parseInt(e.target.value))} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', background: 'var(--bg-badge)', padding: '20px', borderRadius: '24px', border: '1.5px solid var(--border)' }}>
                                    <div className="v-stack">
                                        <strong style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.9rem' }}>Auto-Cleanup</strong>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 650 }}>Elimina canali inattivi.</span>
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
                                    <div key={btn.key} className="pc-sub-card-v2" style={{ background: 'var(--bg-badge)', padding: '24px', borderRadius: '28px', border: '1.5px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: btn.color, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                                <btn.icon size={16} />
                                            </div>
                                            <span style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{btn.label}</span>
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
                            <div className="pc-tabs-v2" style={{ marginBottom: '32px', background: 'var(--bg-badge)', padding: '6px' }}>
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
            .pc-premium-wrapper { padding: 32px; max-width: 1500px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #fff; }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Inter', sans-serif; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 6px; font-size: 0.6rem; font-weight: 700; padding: 4px 10px; border-radius: 100px;  width: fit-content; }
            .pc-status-tag-v2.on { background: rgba(6, 182, 212, 0.1); color: #0891b2; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: #ef4444; }
            .status-dot-v2 { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: var(--bg-badge); color: var(--text-muted); border: 1.5px solid var(--border); padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: rgba(var(--primary-rgb), 0.1); color: var(--primary); border-color: rgba(var(--primary-rgb), 0.2); }
            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 6px; background: var(--bg-badge); padding: 5px; border-radius: 18px; width: fit-content; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; font-size: 0.9rem; border-radius: 14px; cursor: pointer; transition: 0.2s; }
            .pc-tabs-v2 button.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

            /* Card V2 */
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
            .header-icon { width: 44px; height: 44px; background: var(--bg-badge); color: var(--primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; }
            .pc-input-modern-v2 { width: 100%; background: var(--bg-card); border: 1.5px solid var(--border); border-radius: 14px; padding: 12px 16px; font-weight: 700; color: var(--text-heading); outline: none; transition: 0.2s; }
            .pc-input-modern-v2:focus { border-color: var(--primary); }


            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2, :global(.light-theme) .pc-sub-card-v2 { box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
