import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import {
    Save,
    Mic2,
    Settings2,
    Plus,
    Hash,
    Power,
    RefreshCcw,
    Layout,
    Info,
    MessageSquare,
    Zap,
    Users,
    ChevronRight,
    Palette
} from 'lucide-react';
import { DiscordSelector, SystemMessagesSection } from '../../../components/LazyConfigComponents';
import { useT } from '../../../contexts/LanguageContext';
import Head from 'next/head';

export default function TempVoiceConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('settings');
  const [mounted, setMounted] = useState(false);
  const [activeRooms, setActiveRooms] = useState([]);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editLimit, setEditLimit] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && mounted) {
      fetchData();
    }
  }, [guildId, mounted]);

  const fetchData = async () => {
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [configRes, discordRes, activeRes] = await Promise.all([
        api.request(`/config/${guildId}/tempvoice`),
        api.request(`/config/${guildId}/discord-data`),
        api.request(`/config/${guildId}/tempvoice/active`).catch(() => ({ data: [] }))
      ]);

      if (configRes) setConfig(configRes.data || configRes);
      if (discordRes) {
        const discordData = discordRes || {};
        const chanData = discordData.channels || [];
        setChannels(chanData.filter(c => c.type === 2)); // Voice
        setCategories(chanData.filter(c => c.type === 4)); // Category
      }
      if (activeRes) {
        setActiveRooms(activeRes.data || activeRes || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/tempvoice`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.save_success'), type: 'success' } }));
    } catch (e) {
      console.error(e);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.save_error'), type: 'error' } }));
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const setNested = (path, value) => {
    const newConfig = { ...config };
    const parts = path.split('.');
    let cur = newConfig;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!cur[parts[i]]) cur[parts[i]] = {};
        cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
    setConfig(newConfig);
  };

  const handleRename = async (channelId) => {
    if (!editName) return;
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/tempvoice/active/${channelId}/rename`, {
        method: 'POST',
        body: JSON.stringify({ name: editName })
      });
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.save_success'), type: 'success' } }));
      setEditingRoomId(null);
      const activeRes = await api.request(`/config/${guildId}/tempvoice/active`).catch(() => ({ data: [] }));
      setActiveRooms(activeRes.data || activeRes || []);
    } catch (e) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.save_error'), type: 'error' } }));
    } finally {
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleLimit = async (channelId) => {
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/tempvoice/active/${channelId}/limit`, {
        method: 'POST',
        body: JSON.stringify({ limit: editLimit })
      });
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.save_success'), type: 'success' } }));
      setEditingRoomId(null);
      const activeRes = await api.request(`/config/${guildId}/tempvoice/active`).catch(() => ({ data: [] }));
      setActiveRooms(activeRes.data || activeRes || []);
    } catch (e) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.save_error'), type: 'error' } }));
    } finally {
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleDisconnect = async (channelId) => {
    if (!confirm(t('common.delete_confirm') || 'Are you sure you want to disconnect all users and delete this channel?')) return;
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/tempvoice/active/${channelId}`, {
        method: 'DELETE'
      });
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.save_success'), type: 'success' } }));
      const activeRes = await api.request(`/config/${guildId}/tempvoice/active`).catch(() => ({ data: [] }));
      setActiveRooms(activeRes.data || activeRes || []);
    } catch (e) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.save_error'), type: 'error' } }));
    } finally {
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('tempvoice.title')} | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
                    <Mic2 size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('tempvoice.title')}</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? 'on' : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? t('tempvoice.active_tag') : t('tempvoice.inactive_tag')}
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
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('common.save_changes')}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-container-v2" style={{ marginBottom: '24px' }}>
            <div className="pc-tabs-v2">
                <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                    <Settings2 size={16} /> <span>{t('tempvoice.tab_settings')}</span>
                </button>
                <button className={activeTab === 'design' ? 'active' : ''} onClick={() => setActiveTab('design')}>
                    <Palette size={16} /> <span>{t('tempvoice.tab_design')}</span>
                </button>
                <button className={activeTab === 'active_rooms' ? 'active' : ''} onClick={() => setActiveTab('active_rooms')}>
                    <Users size={16} /> <span>{t('tempvoice.tab_active')}</span>
                    {activeRooms.length > 0 && <span className="pc-tab-badge-v2" style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '100px', marginLeft: '8px' }}>{activeRooms.length}</span>}
                </button>
            </div>
        </nav>

        <div className="pc-content-v2">
            {activeTab === 'settings' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: '#f0f9ff', color: '#0ea5e9' }}><Zap size={18} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>{t('tempvoice.generator_title')}</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('tempvoice.generator_desc')}</p>
                            </div>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div className="pc-input-group-v2">
                                    <label>{t('tempvoice.generator_channel')}</label>
                                    <DiscordSelector
                                        type="channel"
                                        options={channels}
                                        value={config.creatorChannelId || ''}
                                        onChange={val => setNested('creatorChannelId', val)}
                                    />
                                    <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('tempvoice.generator_help')}</p>
                                </div>
                                <div className="pc-input-group-v2">
                                    <label>{t('tempvoice.category')}</label>
                                    <DiscordSelector
                                        type="channel"
                                        options={categories}
                                        value={config.categoryId || ''}
                                        onChange={val => setNested('categoryId', val)}
                                    />
                                    <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('tempvoice.category_help')}</p>
                                </div>
                            </div>
                            <p className="pc-hint-v2" style={{ marginTop: '24px' }}>{t('tempvoice.category_hint')}</p>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'design' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: '#f5f3ff', color: '#6366f1' }}><Layout size={18} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>{t('tempvoice.appearance_title')}</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('tempvoice.appearance_desc')}</p>
                            </div>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div className="pc-input-group-v2">
                                    <label>{t('tempvoice.name_template')}</label>
                                    <div className="pc-input-wrapper-v2" style={{ background: 'var(--bg-badge)', border: '1.5px solid var(--border)', borderRadius: '14px' }}>
                                        <MessageSquare size={16} className="input-icon-v2" style={{ marginLeft: '16px', color: 'var(--text-dim)' }} />
                                        <input
                                            type="text"
                                            style={{ width: '100%', border: 'none', background: 'transparent', padding: '14px 16px', fontWeight: 700 }}
                                            value={config.channelNameTemplate || ''}
                                            onChange={e => setNested('channelNameTemplate', e.target.value)}
                                            placeholder={t('tempvoice.name_placeholder')}
                                        />
                                    </div>
                                    <p className="pc-hint-v2" style={{ marginTop: '8px' }}>{t('tempvoice.name_hint')}</p>
                                </div>
                                <div className="pc-input-group-v2">
                                    <label>{t('tempvoice.user_limit')}</label>
                                    <div className="pc-input-wrapper-v2" style={{ background: 'var(--bg-badge)', border: '1.5px solid var(--border)', borderRadius: '14px' }}>
                                        <Users size={16} className="input-icon-v2" style={{ marginLeft: '16px', color: 'var(--text-dim)' }} />
                                        <input
                                            type="number"
                                            style={{ width: '100%', border: 'none', background: 'transparent', padding: '14px 16px', fontWeight: 700 }}
                                            value={config.defaultUserLimit || 0}
                                            onChange={e => setNested('defaultUserLimit', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <p className="pc-hint-v2" style={{ marginTop: '8px' }}>{t('tempvoice.limit_hint')}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'design' && (
                <div className="v-stack animate slide-up">
                    <section className="pc-card-v2">
                        <SystemMessagesSection
                            config={config}
                            onUpdate={setConfig}
                            messages={[
                                { key: 'not_owner', label: t('tempvoice.msg_not_owner'), placeholder: t('tempvoice.msg_not_owner') },
                                { key: 'no_perms', label: t('tempvoice.msg_no_perms'), placeholder: t('tempvoice.msg_no_perms') },
                                { key: 'cooldown', label: t('tempvoice.msg_cooldown'), placeholder: t('tempvoice.msg_cooldown') }
                            ]}
                        />
                    </section>
                </div>
            )}

            {activeTab === 'active_rooms' && (
                <div className="v-stack animate slide-up" style={{ gap: '32px' }}>
                    <section className="pc-card-v2">
                        <div className="card-header-v2">
                            <div className="header-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><Users size={18} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>{t('tempvoice.tab_active')}</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('tempvoice.active_desc') || 'Manage and monitor all active voice rooms in real-time.'}</p>
                            </div>
                        </div>
                        <div className="card-body-v2">
                            {activeRooms.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)', fontWeight: 600 }}>
                                    <Mic2 size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                    <p>{t('tempvoice.no_active_rooms')}</p>
                                </div>
                            ) : (
                                <div className="v-stack" style={{ gap: '16px' }}>
                                    {activeRooms.map(room => (
                                        <div key={room.channelId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-badge)', padding: '16px 24px', borderRadius: '18px', border: '1px solid var(--border)', flexWrap: 'wrap', gap: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ width: '40px', height: '40px', background: 'var(--bg-card)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                                                    <Mic2 size={16} />
                                                </div>
                                                <div className="v-stack">
                                                    {editingRoomId === room.channelId ? (
                                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
                                                            <div className="pc-input-wrapper-v2" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '10px', width: '200px' }}>
                                                                <input
                                                                    type="text"
                                                                    style={{ width: '100%', border: 'none', background: 'transparent', padding: '8px 12px', fontSize: '0.9rem', fontWeight: 700 }}
                                                                    value={editName}
                                                                    onChange={e => setEditName(e.target.value)}
                                                                    placeholder={t('tempvoice.room_name')}
                                                                />
                                                            </div>
                                                            <div className="pc-input-wrapper-v2" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '10px', width: '80px' }}>
                                                                <input
                                                                    type="number"
                                                                    style={{ width: '100%', border: 'none', background: 'transparent', padding: '8px 12px', fontSize: '0.9rem', fontWeight: 700 }}
                                                                    value={editLimit}
                                                                    onChange={e => setEditLimit(parseInt(e.target.value) || 0)}
                                                                    min="0"
                                                                    max="99"
                                                                />
                                                            </div>
                                                            <button className="pc-btn-primary" style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem' }} onClick={() => {
                                                                handleRename(room.channelId);
                                                                handleLimit(room.channelId);
                                                            }}>
                                                                {t('common.save') || 'Save'}
                                                            </button>
                                                            <button className="pc-btn-secondary" style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }} onClick={() => setEditingRoomId(null)}>
                                                                {t('common.cancel') || 'Cancel'}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)' }}>{room.name}</span>
                                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', gap: '8px', marginTop: '4px' }}>
                                                                <span>ID: {room.channelId}</span>
                                                                <span>-</span>
                                                                <span>{t('tempvoice.room_owner')}: <strong style={{ color: 'var(--text-muted)' }}>{room.ownerName || room.ownerId}</strong></span>
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <span className="pc-tag-v2" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                                                        {t('tempvoice.room_users')}: {room.userCount || 0}
                                                    </span>
                                                    <span className="pc-tag-v2" style={{ fontSize: '0.75rem', fontWeight: 700, background: room.userLimit ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: room.userLimit ? '#f59e0b' : '#10b981' }}>
                                                        {room.userLimit ? `${t('tempvoice.action_limit')}: ${room.userLimit}` : 'Unlimited'}
                                                    </span>
                                                </div>

                                                {editingRoomId !== room.channelId && (
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            className="pc-tag-v2"
                                                            style={{ cursor: 'pointer', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--primary)' }}
                                                            onClick={() => {
                                                                setEditingRoomId(room.channelId);
                                                                setEditName(room.name);
                                                                setEditLimit(room.userLimit || 0);
                                                            }}
                                                        >
                                                            {t('tempvoice.action_rename')}
                                                        </button>
                                                        <button
                                                            className="pc-tag-v2"
                                                            style={{ cursor: 'pointer', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                                                            onClick={() => handleDisconnect(room.channelId)}
                                                        >
                                                            {t('tempvoice.action_disconnect')}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )}
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1650px; margin: 0 auto; font-family: 'Inter', sans-serif; }

            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #fff; }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Inter', sans-serif; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }

            .pc-status-tag-v2 { display: flex; align-items: center; gap: 6px; font-size: 0.6rem; font-weight: 700; padding: 4px 10px; border-radius: 100px;  width: fit-content; }
            .pc-status-tag-v2.on { background: rgba(14, 165, 233, 0.1); color: #0ea5e9; }
            .pc-status-tag-v2.off { background: var(--bg-badge); color: #ef4444; }
            .status-dot-v2 { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .pc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }

            .pc-status-toggle-v2 { display: flex; align-items: center; gap: 10px; background: var(--bg-badge); color: var(--text-muted); border: 1.5px solid var(--border); padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; }
            .pc-status-toggle-v2.active { background: rgba(var(--primary-rgb), 0.1); color: var(--primary); border-color: rgba(var(--primary-rgb), 0.2); }

            /* Tabs V2 */
            .pc-tabs-v2 { display: flex; gap: 8px; background: var(--bg-badge); padding: 6px; border-radius: 18px; width: fit-content; }
            .pc-tabs-v2 button { display: flex; align-items: center; gap: 10px; padding: 12px 24px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; font-size: 0.9rem; border-radius: 14px; cursor: pointer; transition: 0.2s; white-space: nowrap; }
            .pc-tabs-v2 button.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 4px 15px rgba(0,0,0,0.05); }

            /* Card V2 */
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; background: var(--bg-badge); color: var(--primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.2rem; font-weight: 700; color: var(--text-heading); }

            /* Inputs V2 */
            .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
            .pc-input-group-v2 label { font-size: 0.7rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; }

            .pc-hint-v2 { font-size: 0.8rem; color: var(--text-dim); font-weight: 600; }
            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2 { box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
