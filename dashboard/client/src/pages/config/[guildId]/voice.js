import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import api from '../../../utils/api';
import { 
    Save, Mic2, Users, MousePointer2, Shield, 
    ListFilter, Info, CheckCircle, XCircle, MessageSquare,
    Settings2, Palette, Zap, Power
} from 'lucide-react';
import DiscordSelector from '../../../components/DiscordSelector';
import EmbedMessageManager from '../../../components/EmbedMessageManager';
import EmbedEditor from '../../../components/EmbedEditor';
import { mergeConfig } from '../../../utils/defaults';
import CustomSelect from '../../../components/CustomSelect';
import { useT } from '../../../contexts/LanguageContext';
import Head from 'next/head';

export default function VoiceConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState(null); // This will be voiceSettings
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
      Promise.all([
        api.request(`/config/${guildId}/whitelist`).catch(() => ({ data: {} })),
        api.request(`/config/${guildId}/discord-data`).catch(() => ({ roles: [], channels: [] }))
      ]).then(([wlRes, discordRes]) => {
        const wlData = wlRes?.data || wlRes || {};
        
        // Voice embeds are at the root of WhitelistConfig in the database
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
        setLoading(false);
      }).catch(err => {
        console.error("Error loading voice data:", err);
        setConfig(mergeConfig({}, 'voice'));
        setLoading(false);
      });
    }
  }, [guildId, mounted]);

  useEffect(() => {
    if (config) {
      window.dispatchEvent(new CustomEvent('update-guide-context', { detail: config }));
    }
  }, [config]);

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

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/whitelist`, {
        method: 'POST',
        body: JSON.stringify({ 
            voiceSettings: { ...config, embeds: undefined },
            embeds: { 
                ...(config.embeds || {}) 
            }
        })
      });
      });
      showToast(t('common.save_success'));
    } catch (error) {
      console.error('Error saving voice config:', error);
      showToast(t('common.save_error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || loading || !config) return <Skeleton type="config" />;

  return (
    <div className="config-page-layout animate">
      <div className="config-main-col">
        <Head>
            <title>{t('voice.title')} | Verix</title>
        </Head>
        {/* Module Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Mic2 size={24} />
              </div>
              <div className="header-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h1>{t('voice.title')}</h1>
                  <label className="toggle-mini" title={config.enabled ? t('common.enabled') : t('common.disabled')}>
                    <input type="checkbox" checked={!!config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                    <span className="slider-mini"></span>
                  </label>
                </div>
                <p>{t('voice.desc')}</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? t('common.saving') : t('common.save_changes')}
              </button>
           </div>
        </header>

        {/* Tab Navigation */}
        <div className="tab-navigation">
            <button onClick={() => setActiveTab('settings')} className={`tab-link ${activeTab === 'settings' ? 'active' : ''}`}>
                <Settings2 size={16} /> <span>{t('voice.tab_settings')}</span>
            </button>
            <button onClick={() => setActiveTab('ui')} className={`tab-link ${activeTab === 'ui' ? 'active' : ''}`}>
                <MousePointer2 size={16} /> <span>{t('voice.tab_ui')}</span>
            </button>
            <button onClick={() => setActiveTab('design')} className={`tab-link ${activeTab === 'design' ? 'active' : ''}`}>
                <Palette size={16} /> <span>{t('voice.tab_design')}</span>
            </button>
        </div>

        <div className="tab-content">
            {activeTab === 'settings' && (
                <div className="config-grid-v animate fade-in">
                    <div className="grid-main-v">
                        <section className="card section-card-v" style={{ marginBottom: '24px' }}>
    
                        </section>

                        <section className="card section-card-v">
                            <div className="align-center" style={{ marginBottom: '20px' }}>
                                <ListFilter size={18} color="var(--primary)" />
                                <h3>{t('voice.system_channels')}</h3>
                            </div>
                            <div className="fields-grid-v">
                                <div className="field-box">
                                    <label className="text-label">{t('voice.join_channel')}</label>
                                    <DiscordSelector type="channel" options={channels.filter(c => c.type === 2)} value={config.joinChannelId || ''} onChange={val => setNested('joinChannelId', val)} />
                                    <p className="field-help">{t('voice.join_channel_help')}</p>
                                </div>
                                <div className="field-box">
                                    <label className="text-label">{t('voice.category')}</label>
                                    <DiscordSelector type="channel" options={channels.filter(c => c.type === 4)} value={config.categoryId || ''} onChange={val => setNested('categoryId', val)} />
                                    <p className="field-help">{t('voice.category_help')}</p>
                                </div>
                            </div>
                        </section>

                        <section className="card section-card-v" style={{ marginTop: '24px' }}>
                            <div className="align-center" style={{ marginBottom: '20px' }}>
                                <Zap size={18} color="var(--primary)" />
                                <h3>{t('voice.auto_actions')}</h3>
                            </div>
                            <div className="fields-grid-v">
                                <div className="field-box">
                                    <label className="text-label">{t('voice.roles_to_add')}</label>
                                    <DiscordSelector type="role" multiple={true} options={roles} value={config.rolesToAdd || []} onChange={val => setNested('rolesToAdd', val)} />
                                </div>
                                <div className="field-box">
                                    <label className="text-label">{t('voice.roles_to_remove')}</label>
                                    <DiscordSelector type="role" multiple={true} options={roles} value={config.rolesToRemove || []} onChange={val => setNested('rolesToRemove', val)} />
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="grid-side-v">
                         <section className="card section-card-v">
                            <div className="align-center" style={{ marginBottom: '16px' }}>
                                <Shield size={16} color="var(--primary)" />
                                <h3>{t('voice.staff_roles')}</h3>
                            </div>
                            <DiscordSelector type="role" multiple={true} options={roles} value={config.staffRoleIds || []} onChange={val => setNested('staffRoleIds', val)} />
                            <p className="field-help" style={{ marginTop: '12px' }}>{t('voice.staff_roles_help')}</p>
                        </section>

                        <section className="card section-card-v" style={{ marginTop: '24px' }}>
                            <div className="align-center" style={{ marginBottom: '16px' }}>
                                <Info size={16} color="var(--primary)" />
                                <h3>{t('voice.other_options')}</h3>
                            </div>
                            <div className="field-box">
                                <label className="text-label">{t('voice.rejection_cooldown')}</label>
                                <input type="number" className="input" value={config.rejectionCooldown || 24} onChange={e => setNested('rejectionCooldown', parseInt(e.target.value))} />
                            </div>
                            <div className="toggle-item-v" style={{ marginTop: '16px' }}>
                                <span>{t('voice.auto_delete')}</span>
                                <label className="toggle">
                                    <input type="checkbox" checked={!!config.autoDelete} onChange={e => setNested('autoDelete', e.target.checked)} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </section>
                    </div>
                </div>
            )}

            {activeTab === 'ui' && (
                <div className="animate fade-in">
                    <section className="card section-card-v">
                        <div className="align-center" style={{ marginBottom: '24px' }}>
                            <MousePointer2 size={18} color="var(--primary)" />
                            <h3>{t('voice.buttons_config')}</h3>
                        </div>
                        <div className="buttons-editor-grid">
                            {['approve', 'deny', 'reset'].map(key => (
                                <div key={key} className="btn-edit-box">
                                    <div className="btn-label-tag">{key.toUpperCase()}</div>
                                    <div className="field-box">
                                        <label className="text-label">{t('voice.btn_label')}</label>
                                        <input className="input" value={config.voiceButtons?.[key]?.label || ''} onChange={e => setNested(`voiceButtons.${key}.label`, e.target.value)} />
                                    </div>
                                    <div className="field-box" style={{ marginTop: '12px' }}>
                                        <label className="text-label">{t('voice.btn_color')}</label>
                                        <CustomSelect 
                                            options={[
                                                { value: 'SUCCESS', label: t('voice.btn_color_green') },
                                                { value: 'DANGER', label: t('voice.btn_color_red') },
                                                { value: 'PRIMARY', label: t('voice.btn_color_blue') },
                                                { value: 'SECONDARY', label: t('voice.btn_color_gray') }
                                            ]} 
                                            value={config.voiceButtons?.[key]?.style || 'PRIMARY'} 
                                            onChange={val => setNested(`voiceButtons.${key}.style`, val)} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'design' && (
                <div className="animate fade-in">
                    <section className="card section-card-v" style={{ marginBottom: '24px' }}>
                        <div className="align-center" style={{ marginBottom: '20px' }}>
                            <Palette size={18} color="var(--primary)" />
                            <h3>{t('voice.design_title')}</h3>
                        </div>
                        <div className="embed-selector-v">
                            {['voice_waiting', 'voice_guide', 'voice_staff_log', 'voice_error_flow'].map(k => (
                                <button key={k} onClick={() => setActiveEmbedKey(k)} className={`selector-btn ${activeEmbedKey === k ? 'active' : ''}`}>
                                    {k.replace('voice_', '').replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                        <div style={{ marginTop: '24px' }}>
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
                            { key: 'dm_accepted', label: t('voice.msg_dm_accepted'), description: t('voice.msg_dm_accepted_desc'), variables: ['user'], group: '✅ Outcome', groupIcon: CheckCircle },
                            { key: 'dm_rejected', label: t('voice.msg_dm_rejected'), description: t('voice.msg_dm_rejected_desc'), variables: ['user', 'reason', 'cooldown'], group: '❌ Outcome', groupIcon: XCircle },
                            { key: 'staff_approved', label: t('voice.msg_staff_approved'), description: t('voice.msg_staff_approved_desc'), variables: ['user', 'staff'], group: '🛡️ Staff', groupIcon: Shield },
                            { key: 'staff_denied', label: t('voice.msg_staff_denied'), description: t('voice.msg_staff_denied_desc'), variables: ['user', 'staff', 'reason'], group: '🛡️ Staff', groupIcon: Shield }
                        ]}
                    />
                </div>
            )}
        </div>
      </div>

      <style jsx>{`
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-badge); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: var(--primary-glow); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; color: var(--text-main); }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }
            
            .tab-navigation { display: flex; gap: 8px; margin-bottom: 32px; padding: 6px; background: var(--bg-sidebar-alt); border-radius: 14px; border: 1px solid var(--border); width: fit-content; }
            .tab-link { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border: none; background: transparent; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; border-radius: 10px; cursor: pointer; transition: 0.2s; }
            .tab-link:hover { color: var(--text-main); background: var(--bg-badge); }
            .tab-link.active { color: var(--text-main); background: var(--bg-card); box-shadow: var(--shadow-sm); border: 1px solid var(--border); }

            .config-grid-v { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
            .status-row-v { display: flex; justify-content: space-between; align-items: center; }
            .status-icon-v { width: 40px; height: 40px; background: var(--bg-status-box); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); border: 1px solid var(--border); }
            .status-icon-v.on { color: var(--primary); background: var(--primary-glow); border-color: var(--primary); }

            .fields-grid-v { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .toggle-item-v { display: flex; justify-content: space-between; align-items: center; }

            .buttons-editor-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
            .btn-edit-box { padding: 16px; background: var(--bg-badge); border: 1px solid var(--border); border-radius: 12px; }
            .btn-label-tag { font-size: 0.65rem; font-weight: 800; color: var(--text-dim); margin-bottom: 12px; }

            .embed-selector-v { display: flex; gap: 8px; flex-wrap: wrap; }
            .selector-btn { padding: 8px 14px; background: transparent; border: 1px solid var(--border); border-radius: 8px; color: var(--text-muted); font-size: 0.8rem; cursor: pointer; transition: 0.2s; text-transform: capitalize; }
            .selector-btn:hover { color: var(--text-main); border-color: var(--text-dim); }
            .selector-btn.active { background: var(--primary); color: var(--text-main); border-color: var(--primary); }

            .align-center { display: flex; align-items: center; gap: 10px; }
            @media (max-width: 1000px) { .config-grid-v { grid-template-columns: 1fr; } }
        `}</style>
    </div>
  );
}
