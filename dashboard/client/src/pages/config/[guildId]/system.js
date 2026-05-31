import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import { DiscordSelector, EmbedMessageManager, CustomSelect } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
  Settings, 
  Save,
  MessageSquare,
  Shield,
  Layout,
  Globe,
  Megaphone,
  Hash
} from 'lucide-react';
import Head from 'next/head';

export default function SystemConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalConfig, setGlobalConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ channels: [] });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && guildId !== 'undefined' && mounted) {
        loadData();
        window.dispatchEvent(new CustomEvent('update-guide-context', { detail: {} }));
    }
  }, [guildId, mounted]);

  const loadData = async () => {
      setLoading(true);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
      try {
          const [globalRes, discordRes] = await Promise.all([
              api.request(`/config/${guildId}/global`),
              api.request(`/config/${guildId}/discord-data`).catch(() => ({ channels: [] }))
          ]);

          const data = globalRes?.data || globalRes || {};
          const dData = discordRes?.data || discordRes || {};

          setGlobalConfig({
              ...data,
              logs: {
                  enabled: data.logs?.enabled ?? true,
                  channelId: data.logs?.channelId || '',
                  ...(data.logs || {})
              }
          });
          setDiscordData({
              channels: (dData.channels || []).filter(c => c.type === 0 || c.type === 5)
          });
      } catch (error) {
          if (!api.isAuthError(error)) {
              console.error('System config load error:', error);
          }
          window.dispatchEvent(new CustomEvent('show-toast', {
              detail: { message: t('common.error'), type: 'error' }
          }));
      } finally {
          setLoading(false);
          window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
      }
  };

  const handleSave = async () => {
      if (!globalConfig) return;
      setSaving(true);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
      try {
          await api.request(`/config/${guildId}/global`, {
              method: 'POST',
              body: JSON.stringify({
                  logs: globalConfig.logs,
                  language: globalConfig.language || 'en',
                  prefix: globalConfig.prefix || '!'
              })
          });
          window.dispatchEvent(new CustomEvent('show-toast', {
              detail: { message: t('common.save_success'), type: 'success' }
          }));
      } catch (error) {
          window.dispatchEvent(new CustomEvent('show-toast', {
              detail: { message: t('common.save_error'), type: 'error' }
          }));
      } finally {
          setSaving(false);
          window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
      }
  };

  const updateLogs = (patch) => {
      setGlobalConfig(prev => ({
          ...prev,
          logs: {
              ...(prev?.logs || {}),
              ...patch
          }
      }));
  };

  const updateGlobal = (patch) => {
      setGlobalConfig(prev => ({
          ...prev,
          ...patch
      }));
  };

  if (!mounted || loading || !globalConfig) return <Skeleton height="600px" />;

  const updateChannelName = discordData.channels.find(c => c.id === globalConfig.logs?.channelId)?.name;

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('system.title')} | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
                    <Settings size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('system.messages')}</h1>
                    <div className="pc-status-tag-v2 on">
                        <div className="status-dot-v2"></div>
                        {t('system.global_tag')}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('common.save_all')}</span>
                </button>
            </div>
        </header>

        <div className="pc-content-v2">
            <section className="pc-card-v2 system-settings-card">
                <div className="card-header-v2">
                    <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Megaphone size={18} /></div>
                    <div className="v-stack" style={{ flex: 1 }}>
                        <h3 style={{ margin: 0 }}>{t('system.update_channel_title')}</h3>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 650 }}>{t('system.update_channel_desc')}</p>
                    </div>
                </div>
                <div className="card-body-v2 system-settings-grid">
                    <div className="pc-input-group-v2">
                        <label>{t('system.update_channel_label')}</label>
                        <DiscordSelector
                            type="channel"
                            options={discordData.channels}
                            value={globalConfig.logs?.channelId || ''}
                            onChange={value => updateLogs({ channelId: value })}
                            placeholder={t('common.select_channel')}
                        />
                        <p className="pc-hint-v2">{t('system.update_channel_help')}</p>
                    </div>
                    <div className="pc-toggle-card-v2 system-toggle-card">
                        <div className="v-stack">
                            <strong>{t('system.update_broadcasts_toggle')}</strong>
                            <span>{updateChannelName ? `#${updateChannelName}` : t('system.update_channel_not_set')}</span>
                        </div>
                        <label className="pc-toggle-v2">
                            <input
                                type="checkbox"
                                checked={globalConfig.logs?.enabled ?? true}
                                onChange={e => updateLogs({ enabled: e.target.checked })}
                            />
                            <span className="pc-slider-v2"></span>
                        </label>
                    </div>
                </div>
            </section>

            <section className="pc-card-v2 system-settings-card">
                <div className="card-header-v2">
                    <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><Settings size={18} /></div>
                    <div className="v-stack" style={{ flex: 1 }}>
                        <h3 style={{ margin: 0 }}>{t('global.prefix_config')}</h3>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 650 }}>{t('dashboard.module_global_desc_v2')}</p>
                    </div>
                </div>
                <div className="card-body-v2 system-core-grid">
                    <div className="pc-input-group-v2">
                        <label>{t('global.primary_language')}</label>
                        <CustomSelect
                            options={[
                                { value: 'en', label: 'English' },
                                { value: 'it', label: 'Italiano' },
                                { value: 'es', label: 'Español' },
                                { value: 'fr', label: 'Français' },
                                { value: 'de', label: 'Deutsch' },
                                { value: 'pt', label: 'Português' }
                            ]}
                            value={globalConfig.language || 'en'}
                            onChange={value => updateGlobal({ language: value })}
                        />
                        <p className="pc-hint-v2">{t('global.lang_hint')}</p>
                    </div>
                    <div className="pc-input-group-v2">
                        <label>{t('global.bot_prefix')}</label>
                        <div className="pc-input-modern-v2">
                            <Hash size={18} color="var(--text-dim)" />
                            <input
                                value={globalConfig.prefix || '!'}
                                onChange={e => updateGlobal({ prefix: e.target.value })}
                                maxLength={5}
                            />
                        </div>
                        <p className="pc-hint-v2">{t('global.prefix_hint')}</p>
                    </div>
                </div>
            </section>

            <section className="pc-card-v2">
                <div className="card-header-v2">
                    <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><MessageSquare size={18} /></div>
                    <h3 style={{ margin: 0 }}>{t('system.custom_resp')}</h3>
                </div>
                <div className="card-body-v2">
                    <EmbedMessageManager 
                        guildId={guildId}
                        module="system"
                        slugs={[
                            { key: 'no_permission', label: t('system.no_perm'), description: t('system.no_perm_desc'), variables: ['user', 'guild'], group: t('system.security'), groupIcon: Shield },
                            { key: 'module_disabled', label: t('system.mod_disabled'), description: t('system.mod_disabled_desc'), variables: ['user', 'module'], group: t('system.security'), groupIcon: Shield },
                            { key: 'role_hierarchy', label: t('system.role_hierarchy'), description: t('system.role_hierarchy_desc'), variables: ['user', 'role'], group: t('system.security'), groupIcon: Shield },
                            { key: 'generic_error', label: t('system.generic_err'), description: t('system.generic_err_desc'), variables: ['user', 'error'], group: t('system.system'), groupIcon: Layout },
                            { key: 'setup_success', label: t('system.setup_success'), description: t('system.setup_success_desc'), variables: ['user', 'guild'], group: t('system.system'), groupIcon: Layout },
                            { key: 'module_list', label: t('system.mod_list'), description: t('system.mod_list_desc'), variables: ['user', 'modules'], group: t('system.commands'), groupIcon: Globe },
                            { key: 'module_enabled', label: t('system.mod_enabled'), description: t('system.mod_enabled_desc'), variables: ['user', 'module'], group: t('system.commands'), groupIcon: Globe },
                            { key: 'module_disabled_success', label: t('system.mod_disabled_success'), description: t('system.mod_disabled_success_desc'), variables: ['user', 'module'], group: t('system.commands'), groupIcon: Globe },
                            { key: 'module_already_in_state', label: t('system.mod_already_state'), description: t('system.mod_already_state_desc'), variables: ['user', 'module', 'state'], group: t('system.commands'), groupIcon: Globe },
                            { key: 'module_not_found', label: t('system.mod_not_found'), description: t('system.mod_not_found_desc'), variables: ['user', 'module'], group: t('system.commands'), groupIcon: Globe }
                        ]}
                    />
                </div>
            </section>
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1650px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; color: #fff; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
            .pc-title-row h1 { font-family: 'Inter'; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 6px; font-size: 0.6rem; font-weight: 700; padding: 4px 10px; border-radius: 100px;  width: fit-content; }
            .pc-status-tag-v2.on { background: rgba(16, 185, 129, 0.1); color: #10b981; }
            .status-dot-v2 { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .pc-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }

            /* Cards */
            .pc-content-v2 { display: flex; flex-direction: column; gap: 24px; }
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.3rem; font-weight: 700; color: var(--text-heading); }

            .system-settings-grid { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 24px; align-items: end; }
            .system-core-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(220px, 320px); gap: 24px; align-items: start; }
            .system-toggle-card { min-height: 86px; margin: 0; }
            .system-toggle-card span { color: var(--text-muted); font-size: 0.85rem; margin-top: 4px; }
            .pc-hint-v2 { margin: 8px 0 0; color: var(--text-muted); font-size: 0.82rem; font-weight: 600; }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            @media (max-width: 900px) {
                .system-settings-grid { grid-template-columns: 1fr; }
                .system-core-grid { grid-template-columns: 1fr; }
            }
        `}</style>
    </div>
  );
}
