import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import { DiscordSelector } from '../../../components/LazyConfigComponents';
import { EmbedMessageManager } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, ShieldCheck, Settings2, RefreshCcw, Power, Palette, MessageSquare, Bell, Info, 
    MousePointer2, Type, ShieldAlert, ChevronRight, Hash, Shield, Send, Zap, MessageCircle, 
    AlertCircle, ArrowRight, CheckCircle2, Lock, Globe
} from 'lucide-react';
import CustomSelect from '../../../components/CustomSelect';
import { mergeConfig } from '../../../utils/defaults';
import EmojiInput from '../../../components/EmojiInput';
import { NotificationSettings } from '../../../components/LazyConfigComponents';
import Head from 'next/head';

export default function VerifyConfig() {
  const router = useRouter();
  const { t } = useT();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [], botHighestPosition: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingPanel, setSendingPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = async () => {
    if (!guildId || guildId === 'undefined' || !mounted) return;
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [configRes, discordRes] = await Promise.all([
        api.request(`/config/${guildId}/verify`).catch(() => ({ data: {} })),
        api.request(`/config/${guildId}/discord-data`).catch(() => ({ roles: [], channels: [], botHighestPosition: 0 }))
      ]);

      const data = configRes.data || configRes || {};
      setConfig(mergeConfig(data, 'verify'));
      
      const dData = discordRes.data || discordRes || {};
      setDiscordData({
        roles: dData.roles || [],
        channels: dData.channels || [],
        botHighestPosition: dData.botHighestPosition || 0
      });
    } catch (error) {
      console.error("Verify config load error:", error);
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  useEffect(() => {
    loadData();
  }, [guildId, mounted]);

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const getRoleError = (roleId) => {
    if (!roleId) return null;
    const role = discordData.roles.find(r => r.id === roleId);
    if (role && role.position >= discordData.botHighestPosition) {
        return "Gerarchia insufficiente: sposta il ruolo di Verix sopra questo ruolo nelle impostazioni del server.";
    }
    return null;
  };

  const setNested = (path, value) => {
    setConfig(prev => {
        const keys = path.split('.');
        const newConfig = { ...prev };
        let current = newConfig;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            else current[keys[i]] = { ...current[keys[i]] };
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newConfig;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/verify`, { method: 'POST', body: JSON.stringify(config) });
      showToast("Configurazione verifica salvata!");
    } catch (error) {
      showToast("Errore durante il salvataggio.", 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleSendPanel = async () => {
    if (!config.channelId) return showToast("Seleziona un canale per il panel!", 'error');
    setSendingPanel(true);
    try {
        await handleSave();
        await api.request(`/config/${guildId}/verify/send-panel`, { method: 'POST' });
        showToast("Panel di verifica inviato con successo!");
    } catch (error) {
        showToast("Errore nell'invio del panel.", 'error');
    } finally {
        setSendingPanel(false);
    }
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('verify.title')} | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    <ShieldCheck size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('verify.title')}</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? t('verify.active_tag') : t('verify.disabled_tag')}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <button 
                  className={`pc-status-toggle-v2 ${config.enabled ? 'active' : ''}`}
                  onClick={() => setConfig({...config, enabled: !config.enabled})}
                >
                  <Power size={18} />
                  <span>{config.enabled ? t('common.online') : t('common.offline')}</span>
                </button>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('whitelist.sync_config')}</span>
                </button>
            </div>
        </header>

        {/* V2 Tabs */}
        <nav className="pc-tabs-v2" style={{ marginBottom: '32px' }}>
            <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                <Settings2 size={16} /> <span>{t('verify.base_config')}</span>
            </button>
            <button className={activeTab === 'design' ? 'active' : ''} onClick={() => setActiveTab('design')}>
                <Palette size={16} /> <span>{t('verify.design_studio')}</span>
            </button>
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'settings' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Shield size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('whitelist.auto_roles')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>{t('verify.role_to_assign')}</label>
                                        <DiscordSelector type="role" options={discordData.roles} value={config.roleId} onChange={v => setNested('roleId', v)} error={getRoleError(config.roleId)} />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('verify.publish_channel')}</label>
                                        <DiscordSelector type="channel" options={discordData.channels.filter(c => c.type === 0 || c.type === 5)} value={config.channelId} onChange={v => setNested('channelId', v)} />
                                    </div>
                                    <div className="pc-input-group-v2" style={{ gridColumn: 'span 2', marginTop: '16px' }}>
                                        <label>{t('verify.role_to_remove')}</label>
                                        <DiscordSelector type="role" options={discordData.roles} value={config.removeRoleId} onChange={v => setNested('removeRoleId', v)} placeholder="Nessuno" />
                                        <p className="pc-hint-v2" style={{ marginTop: '8px' }}>{t('verify.remove_hint')}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="pc-info-banner-v2 orange">
                            <ShieldAlert size={20} />
                            <p>{t('verify.hierarchy_warn')}</p>
                        </div>
                    </div>

                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Bell size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('verify.log_audit')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-toggle-card-v2">
                                    <strong>{t('verify.active_tracking')}</strong>
                                    <label className="pc-toggle-v2 mini">
                                        <input type="checkbox" checked={!!config.logEnabled} onChange={e => setNested('logEnabled', e.target.checked)} />
                                        <span className="pc-slider-v2"></span>
                                    </label>
                                </div>
                                {config.logEnabled && (
                                    <div className="pc-input-group-v2 animate slide-up" style={{ marginTop: '24px' }}>
                                        <label>{t('verify.log_channel')}</label>
                                        <DiscordSelector type="channel" options={discordData.channels} value={config.logChannelId} onChange={v => setNested('logChannelId', v)} />
                                    </div>
                                )}
                            </div>
                        </section>

                        <button className="pc-btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSendPanel} disabled={sendingPanel || !config.channelId}>
                            <Send size={18} />
                            <span>{sendingPanel ? t('common.sending') : t('verify.send_panel')}</span>
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'design' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><MousePointer2 size={18} /></div>
                            <h3 style={{ margin: 0 }}>{t('verify.button_branding')}</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr', gap: '24px' }}>
                                <div className="pc-input-group-v2">
                                    <label>{t('verify.label')}</label>
                                    <div className="pc-input-modern-v2">
                                        <Type size={16} />
                                        <input value={config.buttons?.verify?.label || ''} onChange={e => setNested('buttons.verify.label', e.target.value)} placeholder={t('verify.placeholder')} />
                                    </div>
                                </div>
                                <div className="pc-input-group-v2">
                                    <label>{t('verify.emoji')}</label>
                                    <EmojiInput value={config.buttons?.verify?.emoji || ''} onChange={e => setNested('buttons.verify.emoji', e.target.value)} />
                                </div>
                                <div className="pc-input-group-v2">
                                    <label>{t('verify.style')}</label>
                                    <CustomSelect 
                                        options={[
                                            { value: 'SUCCESS', label: 'Verde' },
                                            { value: 'PRIMARY', label: 'Blurple' },
                                            { value: 'SECONDARY', label: 'Grigio' },
                                            { value: 'DANGER', label: 'Rosso' }
                                        ]} 
                                        value={config.buttons?.verify?.style || 'SUCCESS'} 
                                        onChange={val => setNested('buttons.verify.style', val)} 
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <EmbedMessageManager 
                        guildId={guildId}
                        module="verify"
                        slugs={[
                            { key: 'panel', label: 'Embed Panel', description: 'Messaggio iniziale.', variables: ['guild'], group: 'UI', groupIcon: ShieldCheck },
                            { key: 'success', label: 'DM Successo', description: 'Inviato alla verifica.', variables: ['user', 'guild'], group: 'UI', groupIcon: CheckCircle2 }
                        ]}
                    />
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1500px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; color: white; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
            .pc-title-row h1 { font-family: 'Inter'; font-size: 1.8rem; font-weight: 800; margin: 0; color: var(--text-heading); letter-spacing: -0.5px; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 6px; font-size: 0.6rem; font-weight: 800; padding: 4px 10px; border-radius: 100px; }
            .pc-status-tag-v2.on { background: rgba(16, 185, 129, 0.1); color: #10b981; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: var(--text-muted); }
            .status-dot-v2 { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: var(--bg-badge); color: var(--text-muted); border: 1.5px solid var(--border); padding: 10px 20px; border-radius: 14px; font-weight: 850; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: #10b981; }

            .pc-btn-primary { background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }

            .pc-tabs-v2 { display: flex; gap: 8px; background: var(--bg-badge); padding: 5px; border-radius: 16px; width: fit-content; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; background: transparent; color: var(--text-muted); font-weight: 850; font-size: 0.9rem; border-radius: 12px; cursor: pointer; transition: 0.2s; }
            .pc-tabs-v2 button.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: var(--bg-badge); }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.3rem; font-weight: 800; color: var(--text-heading); }

            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; display: block; }
            .pc-input-modern-v2 { display: flex; align-items: center; gap: 12px; background: var(--bg-badge); padding: 10px 16px; border-radius: 14px; border: 1.5px solid var(--border); }
            .pc-input-modern-v2 input { border: none; background: transparent; width: 100%; font-weight: 800; font-size: 1rem; outline: none; color: var(--text-heading); }

            .pc-toggle-card-v2 { background: var(--bg-badge); padding: 20px; border-radius: 20px; border: 1.5px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
            .pc-toggle-card-v2 strong { font-weight: 800; color: var(--text-heading); }
            
            .pc-toggle-v2 { position: relative; width: 40px; height: 20px; }
            .pc-toggle-v2 input { opacity: 0; width: 0; height: 0; }
            .pc-slider-v2 { position: absolute; cursor: pointer; inset: 0; background: var(--border); transition: .3s; border-radius: 34px; }
            .pc-slider-v2:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background: white; transition: .3s; border-radius: 50%; }
            input:checked + .pc-slider-v2 { background: var(--primary); }
            input:checked + .pc-slider-v2:before { transform: translateX(20px); }

            .pc-info-banner-v2 { display: flex; align-items: center; gap: 16px; padding: 20px; border-radius: 20px; border: 1.5px solid transparent; font-size: 0.9rem; font-weight: 700; }
            .pc-info-banner-v2.orange { background: rgba(255, 171, 0, 0.1); color: #ffab00; border-color: rgba(255, 171, 0, 0.2); }

            .pc-hint-v2 { font-size: 0.8rem; color: var(--text-muted); font-weight: 700; }
            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
