import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import { DiscordSelector, CustomSelect, EmbedMessageManager, NotificationSettings, SystemMessagesSection } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
    Save, Plus, Trash2, Settings2, Power, RefreshCcw, Server, Activity, Users, 
    MessageSquare, Globe, Cpu, Info, X, Crown, Lock, ChevronRight, BellRing, Palette, 
    Share2, Play, ExternalLink, Map, Zap, Layout, Terminal, Radio, Network, Wifi,
    Link2, MousePointer2, AlertCircle, Sparkles, Layers, RotateCcw
} from 'lucide-react';
import { mergeConfig } from '../../../utils/defaults';
import Head from 'next/head';

export default function FiveMConfig() {
  const router = useRouter();
  const { t } = useT();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [guildData, setGuildData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('servers');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    if (!guildId || !mounted) return;
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [configRes, discordRes, guildRes] = await Promise.all([
        api.request(`/config/${guildId}/fivem`),
        api.request(`/config/${guildId}/discord-data`),
        api.request(`/config/${guildId}/guild`)
      ]);
      
      const data = configRes?.data || configRes || { servers: [] };
      const merged = mergeConfig(data, 'fivem');
      if (!merged.servers) merged.servers = [];
      setConfig(merged);
      const rawChannels = discordRes?.data?.channels || discordRes?.channels || [];
      setChannels(rawChannels.filter(c => c.type === 0 || c.type === 5));
      setGuildData(guildRes?.data || guildRes);
    } catch (error) {
      console.error("FiveM config load error:", error);
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  useEffect(() => {
    fetchData();
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

  const handleReset = async () => {
    if (!confirm(t('common.reset_confirm'))) return;
    
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const res = await api.request(`/config/${guildId}/fivem/reset`, { method: 'POST' });
      if (res.success) {
        setConfig(res.data);
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.reset_success'), type: 'success' } }));
      }
    } catch (error) {
      console.error("Reset error:", error);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.reset_error'), type: 'error' } }));
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/fivem`, { method: 'POST', body: JSON.stringify(config) });
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('fivem.sync_success'), type: 'success' } }));
    } catch (error) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.save_error'), type: 'error' } }));
    } finally { 
      setSaving(false); 
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const addServer = () => {
    const newServers = [...(config.servers || []), { 
        id: Date.now().toString(), 
        name: t('fivem.new_instance'), 
        serverIp: '', 
        statusChannelId: '',
        enabled: true,
        buttons: []
    }];
    setConfig({ ...config, servers: newServers });
  };

  const removeServer = (id) => {
    setConfig({ ...config, servers: config.servers.filter(s => s.id !== id) });
  };

  const updateServer = (id, field, value) => {
    const newServers = config.servers.map(s => s.id === id ? { ...s, [field]: value } : s);
    setConfig({ ...config, servers: newServers });
  };

  const addButton = (serverId) => {
    const server = config.servers.find(s => s.id === serverId);
    const newButtons = [...(server.buttons || []), { label: t('fivem.connect_now'), url: '', style: 'LINK' }];
    updateServer(serverId, 'buttons', newButtons);
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  const isPremium = guildData?.isPremium || ['premium', 'platinum'].includes(guildData?.premiumTier);

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('fivem.title')} | Verix Studio</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
                    <Radio size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('fivem.title')}</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? t('fivem.active') : t('fivem.inactive')}
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

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-v2" style={{ marginBottom: '32px' }}>
            <button className={activeTab === 'servers' ? 'active' : ''} onClick={() => setActiveTab('servers')}>
                <Server size={16} /> <span>{t('fivem.instance_fleet')}</span>
                {config.servers?.length > 0 && <span className="pc-tab-badge-v2">{config.servers.length}</span>}
            </button>
            <button className={activeTab === 'design' ? 'active' : ''} onClick={() => setActiveTab('design')}>
                <Palette size={16} /> <span>{t('fivem.visual_studio')}</span>
            </button>
            <button className={activeTab === 'system_messages' ? 'active' : ''} onClick={() => setActiveTab('system_messages')}>
                <Settings2 size={16} /> <span>{t('common.tab_system_messages')}</span>
            </button>
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'servers' && (
                <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 560px', gap: '32px' }}>
                    <div className="v-stack" style={{ gap: '32px' }}>
                        {config.servers?.length > 0 ? (
                            config.servers.map(server => (
                                <section key={server.id} className="pc-card-v2 animate slide-up" style={{ borderLeft: '6px solid var(--primary)' }}>
                                    <div className="card-header-v2">
                                        <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Wifi size={18} /></div>
                                        <div className="v-stack" style={{ flex: 1 }}>
                                            <input 
                                                className="pc-input-ghost-v2" 
                                                value={server.name} 
                                                onChange={e => updateServer(server.id, 'name', e.target.value)} 
                                                placeholder={t('fivem.instance_name')}
                                            />
                                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>ID: {server.id}</span>
                                        </div>
                                        <button onClick={() => removeServer(server.id)} className="pc-btn-icon-danger-v2"><Trash2 size={18} /></button>
                                    </div>
                                    <div className="card-body-v2">
                                        <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <div className="pc-input-group-v2">
                                                <label>{t('fivem.status_channel')}</label>
                                                <DiscordSelector type="channel" options={channels} value={server.statusChannelId || ''} onChange={val => updateServer(server.id, 'statusChannelId', val)} />
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>{t('fivem.endpoint_ip')}</label>
                                                <div className="pc-input-modern-v2">
                                                    <Globe size={16} />
                                                    <input placeholder="play.verix.gg" value={server.serverIp || ''} onChange={e => updateServer(server.id, 'serverIp', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pc-sub-card-v2" style={{ marginTop: '24px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <strong>{t('fivem.actions_title')}</strong>
                                                <button className="pc-btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => addButton(server.id)}><Plus size={16} /> <span>{t('fivem.add_btn')}</span></button>
                                            </div>
                                            <div className="v-stack" style={{ gap: '12px' }}>
                                                {(server.buttons || []).map((btn, idx) => (
                                                    <div key={idx} className="pc-input-row-v2" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                        <input className="pc-input-modern-v2" style={{ flex: 1 }} value={btn.label || ''} onChange={e => {
                                                            const newBtns = [...server.buttons];
                                                            newBtns[idx].label = e.target.value;
                                                            updateServer(server.id, 'buttons', newBtns);
                                                        }} placeholder={t('fivem.label_placeholder')} />
                                                        <input className="pc-input-modern-v2" style={{ flex: 2 }} value={btn.url || ''} onChange={e => {
                                                            const newBtns = [...server.buttons];
                                                            newBtns[idx].url = e.target.value;
                                                            updateServer(server.id, 'buttons', newBtns);
                                                        }} placeholder={t('fivem.url_placeholder')} />
                                                        <button className="pc-btn-icon-danger-v2" onClick={() => {
                                                            const newBtns = server.buttons.filter((_, i) => i !== idx);
                                                            updateServer(server.id, 'buttons', newBtns);
                                                        }}><X size={16} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            ))
                        ) : (
                            <div className="pc-card-v2" style={{ textAlign: 'center', padding: '100px 32px' }}>
                                <Network size={64} style={{ color: 'var(--primary)', marginBottom: '24px', opacity: 0.5 }} />
                                <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '2rem', color: 'var(--text-heading)' }}>{t('fivem.deployment_title')}</h2>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>{t('fivem.deployment_desc')}</p>
                                <button className="pc-btn-primary" style={{ margin: '0 auto' }} onClick={addServer}><Plus size={20} /> <span>{t('fivem.deploy_first')}</span></button>
                            </div>
                        )}
                    </div>

                    <div className="v-stack" style={{ gap: '32px' }}>
                        <section className="pc-card-v2">
                            <div className="card-header-v2">
                                <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Layers size={18} /></div>
                                <h3 style={{ margin: 0 }}>{t('fivem.fleet_mgmt')}</h3>
                            </div>
                            <div className="card-body-v2">
                                <button className="pc-btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={addServer}>
                                    <Plus size={20} /> <span>{t('fivem.add_new')}</span>
                                </button>
                            </div>
                        </section>

                        <div className="pc-card-v2">
                            <NotificationSettings 
                                guildId={guildId}
                                value={config.notifications}
                                onChange={val => setNested('notifications', val)}
                                title={t('fivem.network_alerts')}
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'design' && (
                <div className="v-stack animate slide-up">
                    <EmbedMessageManager 
                        guildId={guildId}
                        module="fivem"
                        slugs={[
                            { key: 'status_embed', label: t('fivem.status_online_label'), description: t('fivem.status_online_desc'), variables: ['server_name', 'players', 'max_players', 'ip'], group: t('fivem.network_ui'), groupIcon: Activity },
                            { key: 'offline_embed', label: t('fivem.status_offline_label'), description: t('fivem.status_offline_desc'), variables: ['server_name', 'ip'], group: t('fivem.network_ui'), groupIcon: Power }
                        ]}
                    />
                </div>
            )}

            {activeTab === 'system_messages' && (
                <div className="v-stack animate slide-up">
                    <SystemMessagesSection 
                        config={config}
                        onUpdate={setConfig}
                        messages={[
                            { key: 'error', label: t('fivem.msg_error'), placeholder: t('fivem.msg_error') },
                            { key: 'ip_copied', label: t('fivem.msg_ip_copied'), placeholder: t('fivem.msg_ip_copied') }
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

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: var(--bg-badge); color: var(--text-muted); border: 1.5px solid var(--border); padding: 10px 20px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: rgba(var(--primary-rgb), 0.1); color: var(--primary); border-color: rgba(var(--primary-rgb), 0.2); }

            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }

            .pc-tabs-v2 { display: flex; gap: 6px; background: var(--bg-badge); padding: 5px; border-radius: 16px; width: fit-content; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; font-size: 0.9rem; border-radius: 12px; cursor: pointer; transition: 0.2s; }
            .pc-tabs-v2 button.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .pc-tab-badge-v2 { background: var(--primary); color: #fff; font-size: 0.65rem; padding: 1px 6px; border-radius: 100px; margin-left: 4px; }

            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: var(--bg-badge); }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.3rem; font-weight: 700; color: var(--text-heading); }

            .pc-sub-card-v2 { background: var(--bg-badge); padding: 24px; border-radius: 20px; border: 1.5px solid var(--border); }
            .pc-input-ghost-v2 { border: none; background: transparent; font-size: 1.2rem; font-weight: 700; color: var(--text-heading); outline: none; flex: 1; font-family: 'Inter'; }
            .pc-btn-icon-danger-v2 { width: 36px; height: 36px; border-radius: 10px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }

            .pc-input-group-v2 label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; display: block; }
            .pc-input-modern-v2 { display: flex; align-items: center; gap: 12px; background: var(--bg-badge); padding: 10px 16px; border-radius: 14px; border: 1.5px solid var(--border); transition: 0.2s; }
            .pc-input-modern-v2:focus-within { border-color: var(--primary); }
            .pc-input-modern-v2 input { border: none; background: transparent; width: 100%; font-weight: 700; font-size: 1rem; outline: none; color: var(--text-heading); }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
