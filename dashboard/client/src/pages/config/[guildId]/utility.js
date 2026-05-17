import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import { DiscordSelector, SystemMessagesSection } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { 
    Save, Cpu, Settings2, Power, Info, Shield,
    Trash2, MessageSquare, Zap, Terminal, Layout,
    CheckCircle2, AlertTriangle, ArrowRight,
    ShieldAlert, Hammer, Eraser, Command, ListChecks,
    Activity, Layers, MousePointer2, Clock, RefreshCw, RotateCcw
} from 'lucide-react';
import { useT } from '../../../contexts/LanguageContext';
import Head from 'next/head';

export default function UtilityConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [quickClear, setQuickClear] = useState({ channelId: '', amount: 10 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
      const fetchData = async () => {
        window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
        try {
          const [configRes, discordRes] = await Promise.all([
            api.request(`/config/${guildId}/utility`),
            api.request(`/config/${guildId}/discord-data`)
          ]);

          if (configRes) {
            setConfig(configRes.data || configRes);
          }
          if (discordRes) {
            const dData = discordRes.data || discordRes;
            setDiscordData({
              ...dData,
              channels: (dData.channels || []).filter(c => c.type === 0 || c.type === 5)
            });
          }
          setLoading(false);
        } catch (error) {
          console.error("Error loading utility config:", error);
          setLoading(false);
        } finally {
            window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
        }
      };
      fetchData();
    }
  }, [guildId, mounted]);

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleReset = async () => {
    if (!confirm(t('common.reset_confirm'))) return;
    
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const res = await api.request(`/config/${guildId}/utility/reset`, { method: 'POST' });
      if (res.success) {
        setConfig(res.data);
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
      await api.request(`/config/${guildId}/utility`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      showToast(t('utility.sync_success'));
    } catch (error) {
        showToast(t('common.save_error'), 'error');
    }
    finally { 
        setSaving(false); 
        window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleQuickClear = async () => {
    if (!quickClear.channelId) return showToast(t('utility.select_channel_error'), 'error');
    if (quickClear.amount < 1 || quickClear.amount > 100) return showToast(t('utility.invalid_amount_error'), 'error');

    if (!confirm(t('utility.purge_confirm', { amount: quickClear.amount }))) return;

    setClearing(true);
    try {
      const res = await api.request(`/config/${guildId}/utility/clear`, {
        method: 'POST',
        body: JSON.stringify(quickClear)
      });
      showToast(res.message || t('utility.purge_success'));
    } catch (error) {
      showToast(error.message || t('utility.purge_error'), 'error');
    } finally {
      setClearing(false);
    }
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('utility.title')} | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
                    <Command size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('utility.title')}</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? t('common.active_system') : t('common.inactive_system')}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-badge)', padding: '10px 20px', borderRadius: '14px', border: '1.5px solid var(--border)' }}>
                    <label className="pc-toggle-v2" style={{ position: 'relative', width: '42px', height: '22px' }}>
                        <input 
                            type="checkbox" 
                            style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                            checked={config.enabled} 
                            onChange={() => setConfig({...config, enabled: !config.enabled})} 
                        />
                        <span style={{ 
                            position: 'absolute', cursor: 'pointer', inset: 0, 
                            background: config.enabled ? '#10b981' : '#ef4444', 
                            transition: '.4s', borderRadius: '34px' 
                        }}>
                            <span style={{
                                position: 'absolute', content: '""', height: '16px', width: '16px', 
                                left: config.enabled ? '23px' : '3px', bottom: '3px', 
                                background: '#fff', transition: '.4s', borderRadius: '50%'
                            }}></span>
                        </span>
                    </label>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: config.enabled ? '#10b981' : '#ef4444' }}>
                        {config.enabled ? t('common.active') : t('common.inactive')}
                    </span>
                </div>
                <button className="pc-btn-outline-v2" onClick={handleReset} title={t('common.reset_to_default')}>
                    <RotateCcw size={18} />
                </button>
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('common.sync')}</span>
                </button>
            </div>
        </header>

        <nav className="pc-tabs-v2" style={{ marginBottom: '32px' }}>
            {[
                { id: 'settings', icon: <Settings2 size={16} />, label: t('common.tab_settings') },
                { id: 'system_messages', icon: <MessageSquare size={16} />, label: t('common.tab_system_messages') }
            ].map(tab => (
                <button key={tab.id} className={(activeTab || 'settings') === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
                    {tab.icon} <span>{tab.label}</span>
                </button>
            ))}
        </nav>
        <div className="pc-content-v2">
            {(activeTab === 'settings' || !activeTab) && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '32px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 animate slide-up">
                            <div className="card-header-v2">
                                <div className="header-icon"><Shield size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('utility.management_perms')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-group-v2">
                                    <label>{t('utility.auth_roles')}</label>
                                    <DiscordSelector 
                                        type="role" 
                                        multiple={true}
                                        options={discordData.roles} 
                                        value={config.allowedRoles || []} 
                                        onChange={v => setConfig({...config, allowedRoles: v})} 
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><Eraser size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('utility.quick_purge')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="pc-input-group-v2">
                                        <label>{t('utility.target_channel')}</label>
                                        <DiscordSelector 
                                            type="channel" 
                                            options={discordData.channels} 
                                            value={quickClear.channelId} 
                                            onChange={v => setQuickClear({...quickClear, channelId: v})} 
                                        />
                                    </div>
                                    <div className="pc-input-group-v2">
                                        <label>{t('utility.amount_max')}</label>
                                        <input 
                                            className="pc-input-modern-v2"
                                            type="number" 
                                            min="1" 
                                            max="100" 
                                            value={quickClear.amount} 
                                            onChange={e => setQuickClear({...quickClear, amount: parseInt(e.target.value)})} 
                                        />
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={handleQuickClear} 
                                    className="pc-btn-primary" 
                                    style={{ marginTop: '24px', width: '100%', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' }}
                                    disabled={clearing}
                                >
                                    <Zap size={18} />
                                    <span>{clearing ? t('utility.purging') : t('utility.execute_purge')}</span>
                                </button>
                            </div>
                        </section>
                    </div>

                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2 animate slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="card-header-v2">
                                <div className="header-icon"><ListChecks size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('utility.system_notes')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <div className="v-stack" style={{ gap: '16px' }}>
                                    {[
                                        { icon: <Clock size={16} />, text: t('utility.note_14days') },
                                        { icon: <Shield size={16} />, text: t('utility.note_manage_msgs') },
                                        { icon: <Activity size={16} />, text: t('utility.note_irreversible') }
                                    ].map((item, i) => (
                                        <div key={i} className="pc-tag-v2" style={{ padding: '12px', border: 'none' }}>
                                            <div style={{ color: 'var(--primary)' }}>{item.icon}</div>
                                            <span>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            )}

            {(activeTab === 'system_messages') && (
                <div className="v-stack animate slide-up">
                    <SystemMessagesSection 
                        config={config}
                        onUpdate={setConfig}
                        messages={[
                            { key: 'clear_success', label: t('utility.msg_clear_success'), placeholder: t('utility.msg_clear_success_placeholder') },
                            { key: 'no_perms', label: t('utility.msg_no_perms'), placeholder: t('utility.msg_no_perms_placeholder') }
                        ]}
                    />
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1500px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; color: #fff; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
            .pc-title-row h1 { font-family: 'Inter'; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 6px; font-size: 0.6rem; font-weight: 700; padding: 4px 10px; border-radius: 100px;  width: fit-content; }
            .pc-status-tag-v2.on { background: rgba(16, 185, 129, 0.1); color: #10b981; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: #ef4444; }
            .status-dot-v2 { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: var(--bg-badge); color: var(--text-muted); border: 1.5px solid var(--border); padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: rgba(var(--primary-rgb), 0.1); color: var(--primary); border-color: rgba(var(--primary-rgb), 0.2); }

            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: var(--bg-badge); color: var(--primary); }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.3rem; font-weight: 700; color: var(--text-heading); }

            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; display: block; }
            .pc-input-modern-v2 { width: 100%; background: var(--bg-badge); border: 1.5px solid var(--border); border-radius: 14px; padding: 12px 16px; font-weight: 700; color: var(--text-heading); outline: none; transition: 0.2s; }
            .pc-input-modern-v2:focus { border-color: var(--primary); }

            .pc-tag-v2 { display: flex; align-items: center; gap: 8px; background: var(--bg-badge); padding: 10px 16px; border-radius: 12px; border: 1.5px solid var(--border); font-size: 0.9rem; font-weight: 700; color: var(--text-heading); transition: 0.2s; }
            .pc-tag-v2:hover { border-color: var(--primary); background: var(--bg-card); }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
