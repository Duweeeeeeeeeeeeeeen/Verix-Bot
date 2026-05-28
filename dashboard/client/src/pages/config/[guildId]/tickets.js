import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import {
    Save, Ticket, Settings2, Shield, Plus, MessageSquare, Trash2,
    ChevronRight, CheckCircle2, Layout, Clock, UserPlus, FileText,
    RotateCcw, Send, GripVertical, AlertCircle, Palette, SlidersHorizontal, Eye,
    ChevronUp, ChevronDown
} from 'lucide-react';
import { DiscordSelector, CustomSelect, NotificationSettings, SystemMessagesSection } from '../../../components/LazyConfigComponents';
import EmojiInput from '../../../components/EmojiInput';
import EmbedPreviewDrawer from '../../../components/EmbedPreviewDrawer';
import EmbedEditor from '../../../components/EmbedEditor';
import { mergeConfig } from '../../../utils/defaults';
import Head from 'next/head';
import ConfirmModal from '../../../components/ConfirmModal';

const TICKET_MESSAGE_SLUGS = [
  { key: 'panel', labelKey: 'tickets.msg_panel', descKey: 'tickets.msg_panel_desc', groupKey: 'tickets.group_access', variables: ['guild'], icon: Layout },
  { key: 'ticket', labelKey: 'tickets.msg_ticket', descKey: 'tickets.msg_ticket_desc', groupKey: 'tickets.group_access', variables: ['type', 'user_id', 'priority', 'status', 'assignedStaff', 'tags'], icon: Ticket },
  { key: 'priority_select', labelKey: 'tickets.msg_priority_select', descKey: 'tickets.msg_priority_select_desc', groupKey: 'tickets.group_access', variables: ['type'], icon: SlidersHorizontal },
  { key: 'success_open', labelKey: 'tickets.msg_success_open', descKey: 'tickets.msg_success_open_desc', groupKey: 'tickets.group_access', variables: ['channel'], icon: CheckCircle2 },
  { key: 'created_success', labelKey: 'tickets.msg_success_open', descKey: 'tickets.msg_success_open_desc', groupKey: 'tickets.group_access', variables: ['channelId'], icon: CheckCircle2 },
  { key: 'already_exists', labelKey: 'tickets.msg_already_exists', descKey: 'tickets.msg_already_exists_desc', groupKey: 'tickets.group_errors', variables: ['type', 'channelId'], icon: AlertCircle },
  { key: 'category_not_available', labelKey: 'tickets.msg_close_error_category', descKey: 'tickets.msg_close_error_category_desc', groupKey: 'tickets.group_errors', variables: [], icon: AlertCircle },
  { key: 'blacklist_error', labelKey: 'tickets.msg_blacklisted', descKey: 'tickets.placeholder_blacklist_error', groupKey: 'tickets.group_errors', variables: [], icon: AlertCircle },
  { key: 'staff_only', labelKey: 'tickets.msg_no_perms', descKey: 'tickets.msg_no_perms_placeholder', groupKey: 'tickets.group_errors', variables: [], icon: Shield },
  { key: 'config_not_found', labelKey: 'tickets.msg_cannot_close', descKey: 'tickets.msg_cannot_close_desc', groupKey: 'tickets.group_errors', variables: [], icon: AlertCircle },
  { key: 'staff_claimed', labelKey: 'tickets.msg_staff_claimed', descKey: 'tickets.msg_staff_claimed_desc', groupKey: 'tickets.group_staff', variables: ['staff'], icon: UserPlus },
  { key: 'claim_already', labelKey: 'tickets.msg_already_claimed', descKey: 'tickets.msg_already_claimed_desc', groupKey: 'tickets.group_staff', variables: ['staffId'], icon: UserPlus },
  { key: 'quick_reply_menu', labelKey: 'tickets.msg_quick_reply_menu', descKey: 'tickets.msg_quick_reply_menu_desc', groupKey: 'tickets.group_staff_tools', variables: [], icon: MessageSquare },
  { key: 'tag_menu', labelKey: 'tickets.msg_tag_menu', descKey: 'tickets.msg_tag_menu_desc', groupKey: 'tickets.group_staff_tools', variables: [], icon: GripVertical },
  { key: 'note_success', labelKey: 'tickets.msg_opened', descKey: 'tickets.placeholder_status_updated', groupKey: 'tickets.group_staff_tools', variables: [], icon: FileText },
  { key: 'status_updated', labelKey: 'tickets.msg_status_updated', descKey: 'tickets.msg_status_updated_desc', groupKey: 'tickets.group_management', variables: ['status'], icon: Clock },
  { key: 'close', labelKey: 'tickets.msg_close', descKey: 'tickets.msg_close_desc', groupKey: 'tickets.group_closure', variables: ['user'], icon: FileText },
  { key: 'close_started', labelKey: 'tickets.msg_close_status', descKey: 'tickets.msg_close_status_desc', groupKey: 'tickets.group_closure', variables: [], icon: Clock },
  { key: 'inactivity_close', labelKey: 'tickets.msg_inactivity_close', descKey: 'tickets.msg_inactivity_close_desc', groupKey: 'tickets.group_closure', variables: [], icon: Clock },
  { key: 'staff_ticket_log', labelKey: 'tickets.msg_staff_ticket_log', descKey: 'tickets.msg_staff_ticket_log_desc', groupKey: 'tickets.group_closure', variables: ['user', 'type', 'staff'], icon: FileText }
];

const getTicketMessageSlugs = (t) => TICKET_MESSAGE_SLUGS.map(item => ({
  key: item.key,
  label: t(item.labelKey),
  description: t(item.descKey),
  group: t(item.groupKey),
  groupIcon: item.icon,
  variables: item.variables
}));

export default function TicketConfig() {
  const router = useRouter();
  const { t } = useT();
  const { guildId } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [discordData, setDiscordData] = useState({ roles: [], channels: [], categories: [] });
  const [activeTab, setActiveTab] = useState('settings');
  const [mounted, setMounted] = useState(false);
  const [sendingPanel, setSendingPanel] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [activePanelId, setActivePanelId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: () => {}
  });
  const buttonStyleOptions = [
    { value: 'PRIMARY', label: t('tickets.btn_style_blue') },
    { value: 'SECONDARY', label: t('tickets.btn_style_gray') },
    { value: 'SUCCESS', label: t('tickets.btn_style_green') },
    { value: 'DANGER', label: t('tickets.btn_style_red') },
    { value: 'LINK', label: t('tickets.btn_style_link') }
  ];
  const closeModeOptions = [
    { value: 'DELETE', label: t('tickets.close_delete') },
    { value: 'MOVE', label: t('tickets.close_move') }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guildId && guildId !== 'undefined' && mounted) fetchData();
  }, [guildId, mounted]);

  const fetchData = async () => {
    setLoading(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      const [configRes, discordRes] = await Promise.all([
        api.request(`/config/${guildId}/tickets`).catch(() => ({ enabled: false })),
        api.request(`/config/${guildId}/discord-data`).catch(() => ({ roles: [], channels: [], categories: [] }))
      ]);

      const rawConfig = configRes?.data || configRes || { enabled: false };
      const merged = mergeConfig(rawConfig, 'tickets');
      const globalTypeIds = Array.from(new Set([
        ...(merged.types || merged.enabledTypes || []),
        ...Object.keys(merged.typesConfig || {})
      ]));
      merged.panels = (merged.panels || []).map((panel, index) => ({
        ...panel,
        staffRoleIds: panel.staffRoleIds || [],
        categoryOpenId: panel.categoryOpenId || '',
        categoryClosedId: panel.categoryClosedId || '',
        logChannelId: panel.logChannelId || '',
        closeMode: panel.closeMode || 'DELETE',
        cannedResponses: panel.cannedResponses || [],
        types: panel.types || (index === 0 ? globalTypeIds : []),
        enabledTypes: panel.enabledTypes || panel.types || (index === 0 ? globalTypeIds : []),
        typesConfig: panel.typesConfig || (index === 0 ? (merged.typesConfig || {}) : {}),
        embed: panel.embed || (index === 0 ? (merged.embeds?.panel || {}) : {
          title: t('tickets.default_panel_title'),
          description: t('tickets.default_panel_description'),
          color: '#2ECC71',
          footer: t('tickets.default_panel_footer')
        })
      }));
      setConfig(merged);
      if (merged.panels && merged.panels.length > 0) {
        setActivePanelId(merged.panels[0].id);
      }

      if (discordRes) {
        setDiscordData({
          roles: discordRes.roles || [],
          channels: discordRes.channels?.filter(c => c.type === 0 || c.type === 5) || [],
          categories: discordRes.channels?.filter(c => c.type === 4) || []
        });
      }
    } catch (e) {
      if (!api.isAuthError(e)) {
        console.error("Ticket config load error:", e);
      }
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
    try {
      await api.request(`/config/${guildId}/tickets`, {
        method: 'POST',
        body: JSON.stringify({
          ...config,
          autoClose: {
            ...(config.autoClose || {}),
            enabled: !!config.autoClose?.enabled,
            hours: Number(config.autoClose?.hours || 24)
          },
          inactivityTimeout: Number(config.autoClose?.hours || config.inactivityTimeout || 24),
          transcriptionEnabled: !!config.transcriptionEnabled
        })
      });
      showToast(t('tickets.sync_success'));
    } catch (e) {
      showToast(t('common.error'), 'error');
    } finally {
      setSaving(false);
      window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
    }
  };

  const handleSendPanel = async (panelId) => {
    const panel = config.panels?.find(p => p.id === panelId);
    if (!panel || !panel.channelId) return showToast(t('tickets.panel_no_channel'), 'error');
    setSendingPanel(true);
    try {
        await handleSave();
        const res = await api.request(`/config/${guildId}/tickets/send-panel/${panelId}`, { method: 'POST' });
        showToast(t('tickets.panel_success'));
        if (res.success && res.messageId) {
            const newPanels = config.panels.map(p => p.id === panelId ? { ...p, messageId: res.messageId } : p);
            setConfig({ ...config, panels: newPanels });
        }
    } catch (e) {
        showToast(t('tickets.panel_error'), 'error');
    } finally {
        setSendingPanel(false);
    }
  };

  const handleReset = async () => {
    setConfirmModal({
      isOpen: true,
      title: t('common.reset_confirm_title'),
      message: t('common.reset_confirm'),
      onConfirm: async () => {
        setSaving(true);
        window.dispatchEvent(new CustomEvent('set-activity', { detail: true }));
        try {
          const res = await api.request(`/config/${guildId}/tickets/reset`, { method: 'POST' });
          if (res.success) {
            setConfig(mergeConfig(res.data, 'tickets'));
            showToast(t('common.reset_success'));
          }
        } catch (e) {
          showToast(t('common.reset_error'), 'error');
        } finally {
          setSaving(false);
          window.dispatchEvent(new CustomEvent('set-activity', { detail: false }));
        }
      }
    });
  };

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const addPanel = () => {
      const newPanel = {
          id: 'panel-' + Math.random().toString(36).substr(2, 6),
          name: t('tickets.default_panel_name'),
          channelId: '',
          messageId: null,
          inputType: 'BUTTONS',
          categories: [],
          staffRoleIds: [],
          categoryOpenId: '',
          categoryClosedId: '',
          logChannelId: '',
          closeMode: 'DELETE',
          cannedResponses: [],
          types: [],
          enabledTypes: [],
          typesConfig: {},
          embed: {
              title: t('tickets.default_panel_title'),
              description: t('tickets.default_panel_description'),
              color: '#2ECC71',
              footer: t('tickets.default_panel_footer')
          }
      };
      setConfig({ ...config, panels: [...(config.panels || []), newPanel] });
      setActivePanelId(newPanel.id);
  };

  const removePanel = (id) => {
      setConfirmModal({
          isOpen: true,
          title: t('tickets.delete_confirm_title'),
          message: t('tickets.delete_confirm'),
          onConfirm: () => {
              const filtered = config.panels.filter(p => p.id !== id);
              setConfig({ ...config, panels: filtered });
              if (activePanelId === id) setActivePanelId(filtered[0]?.id || null);
          }
      });
  };

  const updatePanel = (id, data) => {
      setConfig({
          ...config,
          panels: config.panels.map(p => p.id === id ? { ...p, ...data } : p)
      });
  };

  const getActivePanel = () => (config.panels || []).find(p => p.id === activePanelId) || null;

  const updateActivePanel = (data) => {
      const activePanel = getActivePanel();
      if (!activePanel) return;
      updatePanel(activePanel.id, data);
  };

  const toggleCategoryInPanel = (panelId, categoryId) => {
      const panel = config.panels.find(p => p.id === panelId);
      if (!panel) return;
      
      const currentCategories = panel.categories || [];
      const newCategories = currentCategories.includes(categoryId)
          ? currentCategories.filter(id => id !== categoryId)
          : [...currentCategories, categoryId];
          
      updatePanel(panelId, { categories: newCategories });
  };

  const addPanelCannedResponse = (panelId) => {
      const panel = config.panels.find(p => p.id === panelId);
      updatePanel(panelId, {
          cannedResponses: [...(panel?.cannedResponses || []), { label: '', content: '' }]
      });
  };

  const updatePanelCannedResponse = (panelId, index, data) => {
      const panel = config.panels.find(p => p.id === panelId);
      const responses = [...(panel?.cannedResponses || [])];
      responses[index] = { ...responses[index], ...data };
      updatePanel(panelId, { cannedResponses: responses });
  };

  const removePanelCannedResponse = (panelId, index) => {
      const panel = config.panels.find(p => p.id === panelId);
      const responses = [...(panel?.cannedResponses || [])];
      responses.splice(index, 1);
      updatePanel(panelId, { cannedResponses: responses });
  };

  const addTicketType = () => {
    const activePanel = getActivePanel();
    if (!activePanel) return;
    const id = 'type_' + Date.now();
    const currentTypes = activePanel.types || activePanel.enabledTypes || [];
    updatePanel(activePanel.id, {
      types: [...currentTypes, id],
      enabledTypes: [...currentTypes, id],
      typesConfig: {
        ...(activePanel.typesConfig || {}),
        [id]: { label: t('tickets.new_ticket_default'), emoji: '🎫', welcomeMessage: t('tickets.welcome_message_default') }
      }
    });
  };

  const removeTicketType = (id) => {
    const activePanel = getActivePanel();
    if (!activePanel) return;
    const newTypes = (activePanel.types || activePanel.enabledTypes || []).filter(tid => tid !== id);
    const newConfig = { ...(activePanel.typesConfig || {}) };
    delete newConfig[id];
    updatePanel(activePanel.id, { types: newTypes, enabledTypes: newTypes, typesConfig: newConfig });
  };

  const moveTicketType = (index, direction) => {
    const activePanel = getActivePanel();
    if (!activePanel) return;
    const currentTypes = [...(activePanel.types || activePanel.enabledTypes || [])];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentTypes.length) return;
    [currentTypes[index], currentTypes[targetIndex]] = [currentTypes[targetIndex], currentTypes[index]];
    updatePanel(activePanel.id, { types: currentTypes, enabledTypes: currentTypes });
  };

  const addCannedResponse = () => {
    const activePanel = getActivePanel();
    if (!activePanel) return;
    updatePanel(activePanel.id, {
      cannedResponses: [...(activePanel.cannedResponses || []), { label: '', content: '' }]
    });
  };

  const removeCannedResponse = (index) => {
    const activePanel = getActivePanel();
    if (!activePanel) return;
    const newResponses = [...(activePanel.cannedResponses || [])];
    newResponses.splice(index, 1);
    updatePanel(activePanel.id, { cannedResponses: newResponses });
  };

  if (!mounted || loading || !config) return <Skeleton height="600px" />;

  const hasWarning = config.enabled && (!(config.panels || []).length || (config.panels || []).some(panel => (
    !panel.channelId ||
    !((panel.types || panel.enabledTypes || []).length || Object.keys(panel.typesConfig || {}).length) ||
    !(panel.staffRoleIds || []).length ||
    !panel.categoryOpenId ||
    ((panel.closeMode || 'DELETE') === 'MOVE' && !panel.categoryClosedId)
  )));

  const activePanel = getActivePanel();
  const activeTypesConfig = activePanel?.typesConfig || {};
  const ticketTypes = activePanel
    ? (activePanel.types || (Object.keys(activeTypesConfig).length > 0 ? Object.keys(activeTypesConfig) : activePanel.enabledTypes || []))
    : [];
  const isButtonPanel = (activePanel?.inputType || 'BUTTONS') === 'BUTTONS';
  const openTicketWelcomePreview = (id) => {
    const panel = getActivePanel();
    const typeConfig = panel?.typesConfig?.[id] || {};
    const fields = [
      { name: t('tickets.category_open'), value: panel?.categoryOpenId ? `<#${panel.categoryOpenId}>` : t('common.none'), inline: true }
    ];
    if (typeConfig.pingRoleId) {
      fields.push({ name: t('tickets.target_role'), value: `<@&${typeConfig.pingRoleId}>`, inline: true });
    }
    setPreviewData({
      title: `${typeConfig.emoji || '🎫'} ${typeConfig.label || id}`,
      description: typeConfig.welcomeMessage || t('tickets.welcome_message_default'),
      color: typeConfig.color || '#2ECC71',
      fields,
      footer: 'Verix Ticket System'
    });
  };

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('tickets.title')} | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className={`pc-header-v2 ${hasWarning ? 'incomplete' : ''}`}>
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'var(--bg-badge)', color: '#8b5cf6', boxShadow: 'none' }}>
                    <Ticket size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('tickets.title')}</h1>
                    <div className={`pc-status-tag-v2 ${config.enabled ? (hasWarning ? 'warning' : 'on') : 'off'}`}>
                        <div className="status-dot-v2"></div>
                        {config.enabled ? (hasWarning ? t('common.incomplete_system') : t('common.active_system')) : t('common.inactive_system')}
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
                <div className="pc-header-divider"></div>
                <button className="pc-btn-outline-v2" onClick={handleReset} title={t('common.reset_to_default')}>
                    <RotateCcw size={18} />
                </button>
                {activePanelId && (
                    <button
                        className="pc-btn-outline-v2"
                        onClick={() => handleSendPanel(activePanelId)}
                        disabled={sendingPanel}
                        title={t('tickets.send_active_panel')}
                        style={{ color: 'var(--primary)', borderColor: 'rgba(var(--primary-rgb), 0.2)' }}
                    >
                        {sendingPanel ? <RotateCcw size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                )}
                <button className="pc-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? t('common.saving') : t('common.save_changes')}</span>
                </button>
            </div>
        </header>

        {/* V2 Navigation Tabs */}
        <nav className="pc-tabs-v2" style={{ marginBottom: '32px' }}>
            <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                <Settings2 size={16} /> <span>{t('tickets.base_config')}</span>
            </button>
            <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>
                <Layout size={16} /> <span>{t('tickets.categories')}</span>
            </button>
            <button className={activeTab === 'design' ? 'active' : ''} onClick={() => setActiveTab('design')}>
                <Palette size={16} /> <span>{t('tickets.design')}</span>
            </button>
            <button className={activeTab === 'responses' ? 'active' : ''} onClick={() => setActiveTab('responses')}>
                <MessageSquare size={16} /> <span>{t('tickets.canned')}</span>
            </button>
        </nav>

        <div className="pc-content-v2">

            {activeTab === 'categories' && (
                <div className="v-stack animate slide-up">
                    <section className="pc-card-v2">
                        <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                            <div className="header-icon"><Layout size={20} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>{t('tickets.categories')}</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('tickets.categories_desc')}</p>
                            </div>
                            <button className="pc-btn-primary" onClick={addTicketType}>
                                <Plus size={20} /> <span>{t('common.add')}</span>
                            </button>
                        </div>
                        <div className="card-body-v2">
                            <div className="v-stack ticket-category-list" style={{ gap: '12px' }}>
                                {ticketTypes.map((id, index) => (
                                    <div key={id} className="pc-sub-card-v2 ticket-category-card animate slide-up">
                                        <div className="pc-bb-content" style={{ padding: 0 }}>
                                            <div className="ticket-category-head">
                                                <input className="pc-input-ghost-v2" value={activeTypesConfig[id]?.label || ''} onChange={e => {
                                                    const newTypes = { ...activeTypesConfig };
                                                    newTypes[id] = { ...newTypes[id], label: e.target.value };
                                                    updateActivePanel({ typesConfig: newTypes });
                                                }} placeholder={t('tickets.cat_title_placeholder')} />
                                                <div className="ticket-category-actions">
                                                    <button type="button" className="pc-btn-outline-v2 ticket-order-btn" onClick={() => moveTicketType(index, -1)} disabled={index === 0} title={t('rr.move_up') || 'Move up'}>
                                                        <ChevronUp size={16} />
                                                    </button>
                                                    <button type="button" className="pc-btn-outline-v2 ticket-order-btn" onClick={() => moveTicketType(index, 1)} disabled={index === ticketTypes.length - 1} title={t('rr.move_down') || 'Move down'}>
                                                        <ChevronDown size={16} />
                                                    </button>
                                                    <button type="button" className="pc-btn-outline-v2 ticket-preview-btn compact" onClick={() => openTicketWelcomePreview(id)} title={t('preview.discord_title')}>
                                                        <Eye size={17} />
                                                    </button>
                                                </div>
                                                <button onClick={() => removeTicketType(id)} className="pc-btn-icon-danger-v2"><Trash2 size={20} /></button>
                                            </div>

                                            <div className="pc-bb-columns ticket-category-controls">
                                                <div className="pc-bb-col ticket-emoji-col">
                                                    <label>{t('common.emoji')}</label>
                                                    <div className="pc-bb-emoji-box">
                                                        <EmojiInput value={activeTypesConfig[id]?.emoji || '🎫'} hideInput={true} onChange={e => {
                                                            const newTypes = { ...activeTypesConfig };
                                                            newTypes[id] = { ...newTypes[id], emoji: e.target.value };
                                                            updateActivePanel({ typesConfig: newTypes });
                                                        }} />
                                                    </div>
                                                </div>
                                                <div className="pc-input-group-v2">
                                                    <label>{isButtonPanel ? t('common.color') : t('tickets.embed_color') || 'Embed color'}</label>
                                                    {isButtonPanel ? (
                                                        <div className="ticket-style-picker">
                                                            {[
                                                                { value: 'PRIMARY', color: '#5865f2' },
                                                                { value: 'SUCCESS', color: '#248046' },
                                                                { value: 'DANGER', color: '#da373c' },
                                                                { value: 'SECONDARY', color: '#4e5058' },
                                                                { value: 'LINK', color: '#f3f4f6' }
                                                            ].map(option => (
                                                                <button
                                                                    key={option.value}
                                                                    type="button"
                                                                    className={(activeTypesConfig[id]?.style || 'PRIMARY') === option.value ? 'active' : ''}
                                                                    onClick={() => {
                                                                        const newTypes = { ...activeTypesConfig };
                                                                        newTypes[id] = { ...newTypes[id], style: option.value };
                                                                        updateActivePanel({ typesConfig: newTypes });
                                                                    }}
                                                                    style={{ background: option.color }}
                                                                    title={option.value}
                                                                />
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="ticket-embed-color-control">
                                                            <input
                                                                type="color"
                                                                value={activeTypesConfig[id]?.color || '#3498db'}
                                                                onChange={e => {
                                                                    const newTypes = { ...activeTypesConfig };
                                                                    newTypes[id] = { ...newTypes[id], color: e.target.value };
                                                                    updateActivePanel({ typesConfig: newTypes });
                                                                }}
                                                            />
                                                            <span>{(activeTypesConfig[id]?.color || '#3498db').toUpperCase()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="pc-input-group-v2 ticket-role-field">
                                                    <label>{t('tickets.target_role')}</label>
                                                    <DiscordSelector type="role" options={discordData.roles} value={activeTypesConfig[id]?.pingRoleId || ''} onChange={v => {
                                                        const newTypes = { ...activeTypesConfig };
                                                        newTypes[id] = { ...newTypes[id], pingRoleId: v };
                                                        updateActivePanel({ typesConfig: newTypes });
                                                    }} />
                                                </div>
                                            </div>

                                            {isButtonPanel && activeTypesConfig[id]?.style === 'LINK' && (
                                            <div className="pc-input-grid-v2 ticket-category-options">
                                                <div className="pc-input-group-v2">
                                                    <label>URL</label>
                                                    <input className="pc-input-modern-v2" value={activeTypesConfig[id]?.url || ''} onChange={e => {
                                                            const newTypes = { ...activeTypesConfig };
                                                            newTypes[id] = { ...newTypes[id], url: e.target.value };
                                                            updateActivePanel({ typesConfig: newTypes });
                                                    }} placeholder="https://..." />
                                                </div>
                                            </div>
                                            )}

                                            {!isButtonPanel && (
                                                <div className="pc-input-group-v2" style={{ marginTop: '24px' }}>
                                                    <label>{t('tickets.category_description')}</label>
                                                    <input
                                                        className="pc-input-modern-v2"
                                                        value={activeTypesConfig[id]?.description || ''}
                                                        onChange={e => {
                                                            const newTypes = { ...activeTypesConfig };
                                                            newTypes[id] = { ...newTypes[id], description: e.target.value };
                                                            updateActivePanel({ typesConfig: newTypes });
                                                        }}
                                                        placeholder={t('tickets.category_description_placeholder')}
                                                        maxLength={100}
                                                    />
                                                    <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {(activeTypesConfig[id]?.description || '').length}/100
                                                    </p>
                                                </div>
                                            )}

                                            <div className="pc-input-group-v2" style={{ marginTop: '24px' }}>
                                                <label>{t('tickets.welcome_message')}</label>
                                                <textarea
                                                    className="pc-input-modern-v2"
                                                    style={{ minHeight: '80px', width: '100%', resize: 'vertical' }}
                                                    value={activeTypesConfig[id]?.welcomeMessage || ''}
                                                    onChange={e => {
                                                        const newTypes = { ...activeTypesConfig };
                                                        newTypes[id] = { ...newTypes[id], welcomeMessage: e.target.value };
                                                        updateActivePanel({ typesConfig: newTypes });
                                                    }}
                                                    placeholder={t('tickets.custom_welcome_placeholder')}
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

            {activeTab === 'settings' && (
                <div className="v-stack animate slide-up" style={{ gap: '20px' }}>
                    {/* Fleet Repository Horizontal Top Bar */}
                    <section className="rr-top-bar" style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '16px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', boxShadow: 'var(--shadow-premium)' }}>
                        <div className="top-bar-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingRight: '24px', borderRight: '1.5px solid var(--border)' }}>
                            <div className="v-stack">
                                <span className="top-bar-label" style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('tickets.available_panels')}</span>
                                <span className="top-bar-count" style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>{t('tickets.panels_count', { count: (config.panels || []).length })}</span>
                            </div>
                            <button type="button" onClick={addPanel} className="pc-btn-icon-v2 add-panel-btn" style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={20} /></button>
                        </div>
                        <div className="rr-horizontal-list" style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '4px 0', flex: 1 }}>
                            {(config.panels || []).map(p => (
                                <button 
                                    type="button"
                                    key={p.id}
                                    className={`pc-panel-nav-btn-horizontal ${activePanelId === p.id ? 'active' : ''}`}
                                    onClick={() => setActivePanelId(p.id)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 18px', background: 'var(--bg-badge)', border: '1.5px solid var(--border)', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0 }}
                                >
                                    <div className="nav-icon-horizontal" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: activePanelId === p.id ? 'var(--primary)' : 'var(--text-muted)' }}><Layout size={18} /></div>
                                    <div className="nav-info-horizontal" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                        <span className="nav-name-horizontal" style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.85rem' }}>{p.name}</span>
                                        <span className="nav-meta-horizontal" style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{t('tickets.panel_meta', { count: ((p.types || p.enabledTypes || []).length || Object.keys(p.typesConfig || {}).length), input: p.inputType || 'BUTTONS' })}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    {activePanelId && (config.panels || []).find(p => p.id === activePanelId) && (() => {
                        const activePanel = config.panels.find(p => p.id === activePanelId);
                        return (
                            <div className="pc-layout-grid-v2 rr-layout-inner" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '24px', alignItems: 'start' }}>
                                <div className="v-stack" style={{ gap: '32px' }}>
                                    
                                    {/* Panel Identity */}
                                    <section className="pc-card-v2">
                                        <div className="card-header-v2">
                                            <div className="header-icon"><Settings2 size={18} /></div>
                                            <h3 style={{ margin: 0 }}>{t('tickets.panel_identity')}</h3>
                                        </div>
                                        <div className="card-body-v2">
                                            <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <div className="pc-input-group-v2">
                                                    <label>{t('tickets.display_name')}</label>
                                                    <input className="pc-input-modern-v2" value={activePanel.name} onChange={e => updatePanel(activePanel.id, { name: e.target.value })} />
                                                </div>
                                                <div className="pc-input-group-v2">
                                                    <label>{t('tickets.input_mode')}</label>
                                                    <CustomSelect 
                                                        options={[
                                                            { value: 'BUTTONS', label: t('tickets.input_buttons_recommended') },
                                                            { value: 'SELECT', label: t('tickets.input_select') }
                                                        ]} 
                                                        value={activePanel.inputType || 'BUTTONS'} 
                                                        onChange={val => updatePanel(activePanel.id, { inputType: val })} 
                                                    />
                                                </div>
                                            </div>
                                            <div className="pc-input-group-v2" style={{ marginTop: '20px' }}>
                                                <label>{t('tickets.destination_channel')}</label>
                                                <DiscordSelector 
                                                    type="channel" 
                                                    options={discordData.channels} 
                                                    value={activePanel.channelId || ''} 
                                                    onChange={val => updatePanel(activePanel.id, { channelId: val })} 
                                                    error={config.enabled && !activePanel.channelId ? t('common.required_field') : ''} 
                                                />
                                            </div>
                                            <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                                                <div className="pc-input-group-v2">
                                                    <label>{t('tickets.support_roles')}</label>
                                                    <DiscordSelector
                                                        type="role"
                                                        multiple={true}
                                                        options={discordData.roles}
                                                        value={activePanel.staffRoleIds || []}
                                                        onChange={val => updatePanel(activePanel.id, { staffRoleIds: val })}
                                                        error={config.enabled && !(activePanel.staffRoleIds || []).length ? t('common.required_field') : ''}
                                                    />
                                                </div>
                                                <div className="pc-input-group-v2">
                                                    <label>{t('tickets.category_open')}</label>
                                                    <DiscordSelector
                                                        type="channel"
                                                        options={discordData.categories}
                                                        value={activePanel.categoryOpenId || ''}
                                                        onChange={val => updatePanel(activePanel.id, { categoryOpenId: val })}
                                                        error={config.enabled && !activePanel.categoryOpenId ? t('common.required_field') : ''}
                                                    />
                                                </div>
                                            </div>
                                            <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '20px' }}>
                                                <div className="pc-input-group-v2">
                                                    <label>{t('tickets.log_channel')}</label>
                                                    <DiscordSelector
                                                        type="channel"
                                                        options={discordData.channels}
                                                        value={activePanel.logChannelId || ''}
                                                        onChange={val => updatePanel(activePanel.id, { logChannelId: val })}
                                                    />
                                                </div>
                                                <div className="pc-input-group-v2">
                                                    <label>{t('tickets.close_mode')}</label>
                                                    <CustomSelect
                                                        value={activePanel.closeMode || 'DELETE'}
                                                        onChange={val => updatePanel(activePanel.id, { closeMode: val })}
                                                        options={closeModeOptions}
                                                    />
                                                </div>
                                                {(activePanel.closeMode || 'DELETE') === 'MOVE' && (
                                                    <div className="pc-input-group-v2">
                                                        <label>{t('tickets.category_closed')}</label>
                                                        <DiscordSelector
                                                            type="channel"
                                                            options={discordData.categories}
                                                            value={activePanel.categoryClosedId || ''}
                                                            onChange={val => updatePanel(activePanel.id, { categoryClosedId: val })}
                                                            error={config.enabled && !activePanel.categoryClosedId ? t('common.required_field') : ''}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </section>


                                </div>

                                {/* Sidebar Control for Deleting / Deploying Panel */}
                                <aside className="v-stack" style={{ gap: '16px' }}>
                                    <section className="pc-card-v2 rr-summary-card">
                                        <div className="card-header-v2">
                                            <div className="header-icon"><SlidersHorizontal size={18} /></div>
                                            <h3 style={{ margin: 0 }}>{t('tickets.panel_status')}</h3>
                                        </div>
                                        <div className="v-stack" style={{ gap: '12px' }}>
                                            <div className="rr-summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('tickets.panel_channel')}</span>
                                                <strong className={activePanel.channelId ? 'ok' : 'warn'} style={{ color: activePanel.channelId ? '#10b981' : '#ef4444' }}>{activePanel.channelId ? t('common.selected') : t('common.missing')}</strong>
                                            </div>
                                            <div className="rr-summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('tickets.input_mode')}</span>
                                                <strong>{activePanel.inputType || 'BUTTONS'}</strong>
                                            </div>
                                        </div>
                                    </section>

                                    <button 
                                        type="button" 
                                        onClick={() => handleSendPanel(activePanel.id)} 
                                        disabled={sendingPanel || !activePanel.channelId} 
                                        className="pc-btn-primary" 
                                        style={{ height: '48px', justifyContent: 'center', width: '100%', gap: '8px' }}
                                    >
                                        <Send size={18} />
                                        <span>{t('tickets.send_panel_discord')}</span>
                                    </button>

                                    <button 
                                        type="button" 
                                        onClick={() => removePanel(activePanel.id)} 
                                        className="pc-btn-outline-v2" 
                                        style={{ height: '48px', justifyContent: 'center', width: '100%', gap: '8px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                    >
                                        <Trash2 size={18} />
                                        <span>{t('tickets.delete_panel')}</span>
                                    </button>
                                </aside>
                            </div>
                        );
                    })()}

                    {/* Global Ticket Settings */}
                    {config.panels && config.panels.length > 0 && (
                        <div className="v-stack" style={{ gap: '24px', marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
                            <div className="section-title-v2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '4px', height: '18px', background: 'var(--primary)', borderRadius: '2px' }}></div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                                    {t('tickets.global_settings') || 'Global Ticket Settings'}
                                </h2>
                            </div>
                            
                            <div className="pc-layout-grid-v2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 360px)', gap: '24px' }}>
                                <div className="v-stack" style={{ gap: '24px' }}>
                                    <section className="pc-card-v2 animate slide-up" style={{ height: '100%' }}>
                                        <div className="card-header-v2">
                                            <div className="header-icon"><Clock size={18} /></div>
                                            <h3 style={{ margin: 0 }}>{t('tickets.auto_close')}</h3>
                                        </div>
                                        <div className="card-body-v2">
                                            <div className="pc-toggle-card-v2">
                                                <div className="v-stack">
                                                    <strong>{t('tickets.auto_close_toggle')}</strong>
                                                    <span>{t('tickets.auto_close_desc')}</span>
                                                </div>
                                                <label className="pc-toggle-v2 mini">
                                                    <input type="checkbox" checked={!!config.autoClose?.enabled} onChange={e => setConfig({...config, autoClose: { ...(config.autoClose || {}), enabled: e.target.checked }})} />
                                                    <span className="pc-slider-v2"></span>
                                                </label>
                                            </div>
                                            {config.autoClose?.enabled && (
                                                <div className="pc-input-group-v2 animate slide-up" style={{ marginTop: '24px' }}>
                                                    <label>{t('tickets.inactivity_hours')}</label>
                                                    <input className="pc-input-modern-v2" type="number" value={config.autoClose?.hours || 24} onChange={e => setConfig({...config, autoClose: { ...(config.autoClose || {}), hours: parseInt(e.target.value, 10) || 24 }})} min="1" max="168" />
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>

                                <div className="v-stack" style={{ gap: '24px' }}>
                                    <section className="pc-card-v2">
                                        <div className="card-header-v2">
                                            <div className="header-icon"><FileText size={18} /></div>
                                            <h3 style={{ margin: 0 }}>{t('tickets.transcripts')}</h3>
                                        </div>
                                        <div className="card-body-v2">
                                            <div className="pc-toggle-card-v2">
                                                <div className="v-stack">
                                                    <strong>{t('tickets.transcript_toggle')}</strong>
                                                    <span>{t('tickets.transcript_desc')}</span>
                                                </div>
                                                <label className="pc-toggle-v2 mini">
                                                    <input type="checkbox" checked={!!config.transcriptionEnabled} onChange={e => setConfig({...config, transcriptionEnabled: e.target.checked})} />
                                                    <span className="pc-slider-v2"></span>
                                                </label>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="pc-card-v2">
                                        <NotificationSettings
                                            value={config.notifications || { mode: 'DM', channelId: null }}
                                            onChange={notifications => setConfig({ ...config, notifications })}
                                            guildId={guildId}
                                            title={t('tickets.notif_user_title')}
                                            description={t('tickets.notif_user_desc')}
                                        />
                                    </section>
                                </div>
                            </div>
                        </div>
                    )}

                    {(!config.panels || config.panels.length === 0) && (
                        <div style={{ textAlign: 'center', padding: '100px 32px' }}>
                            <Ticket size={64} style={{ color: 'var(--primary)', marginBottom: '24px', opacity: 0.5 }} />
                            <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '2rem', color: 'var(--text-heading)' }}>{t('tickets.no_panels_title')}</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>{t('tickets.no_panels_desc')}</p>
                            <button type="button" onClick={addPanel} className="pc-btn-primary" style={{ margin: '0 auto' }}>
                                <Plus size={20} /> <span>{t('tickets.new_panel')}</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'design' && (
                <div className="v-stack animate slide-up">
                    <section className="pc-card-v2">
                        <div className="card-header-v2" style={{ marginBottom: '24px' }}>
                            <div className="header-icon"><Palette size={18} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>{activePanel?.name || t('tickets.msg_panel')}</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {t('tickets.msg_panel_desc')}
                                </p>
                            </div>
                        </div>
                        <EmbedEditor
                            embed={activePanel?.embed || {
                                title: t('tickets.default_panel_title'),
                                description: t('tickets.default_panel_description'),
                                color: '#2ECC71',
                                footer: t('tickets.default_panel_footer')
                            }}
                            onChange={(embed) => updateActivePanel({ embed })}
                            variables={['guild']}
                            previewButtons={(activePanel?.inputType || 'BUTTONS') === 'SELECT' ? [{
                                type: 'SELECT',
                                label: t('tickets.input_select'),
                                placeholder: t('tickets.cat_title_placeholder'),
                                options: ticketTypes.map(id => ({
                                    label: activeTypesConfig?.[id]?.label || id,
                                    emoji: activeTypesConfig?.[id]?.emoji || '🎫',
                                    description: activeTypesConfig?.[id]?.description || undefined
                                }))
                            }] : ticketTypes.slice(0, 5).map(id => ({
                                label: activeTypesConfig?.[id]?.label || id,
                                style: activeTypesConfig?.[id]?.style || 'PRIMARY',
                                emoji: activeTypesConfig?.[id]?.emoji || '🎫'
                            }))}
                            compact={true}
                        />
                    </section>

                    <div className="pc-info-note" style={{ margin: '18px 0 0 0', padding: '14px 18px', background: 'rgba(var(--primary-rgb), 0.06)', border: '1px solid rgba(var(--primary-rgb), 0.15)', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <AlertCircle size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                            {t('tickets.welcome_override_note')}
                        </p>
                    </div>

                    <section className="pc-card-v2" style={{ marginTop: '24px' }}>
                        <div className="card-header-v2">
                            <div className="header-icon"><SlidersHorizontal size={18} /></div>
                            <h3 style={{ margin: 0 }}>{t('tickets.button_branding')}</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '18px' }}>
                                {[
                                    ['claim', t('tickets.claim_btn'), '🙋'],
                                    ['close', t('tickets.close_btn'), '🔒'],
                                    ['quickReply', t('tickets.msg_quick_reply_menu'), '📝'],
                                    ['tag', t('tickets.tag_btn'), '🏷️'],
                                    ['transcript', t('tickets.transcripts'), '📄']
                                ].map(([key, label, emoji]) => (
                                    <div key={key} className="pc-sub-card-v2">
                                        <div className="pc-input-group-v2">
                                            <label>{label}</label>
                                            <input
                                                className="pc-input-modern-v2"
                                                value={config.buttons?.[key]?.label || ''}
                                                onChange={e => setConfig({
                                                    ...config,
                                                    buttons: {
                                                        ...(config.buttons || {}),
                                                        [key]: { ...(config.buttons?.[key] || {}), label: e.target.value }
                                                    }
                                                })}
                                                placeholder={label}
                                            />
                                        </div>
                                        <div className="pc-input-grid-v2" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px', marginTop: '12px' }}>
                                            <EmojiInput value={config.buttons?.[key]?.emoji || emoji} hideInput={true} onChange={e => setConfig({
                                                ...config,
                                                buttons: {
                                                    ...(config.buttons || {}),
                                                    [key]: { ...(config.buttons?.[key] || {}), emoji: e.target.value }
                                                }
                                            })} />
                                            <CustomSelect value={config.buttons?.[key]?.style || 'PRIMARY'} onChange={v => setConfig({
                                                ...config,
                                                buttons: {
                                                    ...(config.buttons || {}),
                                                    [key]: { ...(config.buttons?.[key] || {}), style: v }
                                                }
                                            })} options={buttonStyleOptions} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="pc-card-v2" style={{ marginTop: '24px' }}>
                        <SystemMessagesSection
                            config={config}
                            onUpdate={setConfig}
                            title={t('tickets.system_messages')}
                            description={t('tickets.system_messages_desc')}
                            messages={[
                                { key: 'cooldown', label: t('tickets.msg_cooldown'), placeholder: t('tickets.msg_cooldown_placeholder') },
                                { key: 'already_exists', label: t('tickets.msg_already_exists'), placeholder: t('tickets.placeholder_already_exists') },
                                { key: 'no_quick_replies', label: t('tickets.msg_no_quick_replies'), placeholder: t('tickets.placeholder_no_quick_replies') },
                                { key: 'quick_reply_placeholder', label: t('tickets.msg_quick_reply_menu'), placeholder: t('tickets.msg_quick_reply_menu_desc') },
                                { key: 'tag_placeholder', label: t('tickets.msg_tag_menu'), placeholder: t('tickets.msg_tag_menu_desc') },
                                { key: 'status_updated_msg', label: t('tickets.msg_status_updated'), placeholder: t('tickets.placeholder_status_updated') },
                                { key: 'new_ticket_ping', label: t('tickets.msg_new_ticket_ping'), placeholder: t('tickets.placeholder_new_ticket_ping') }
                            ]}
                        />
                    </section>
                </div>
            )}

            {activeTab === 'responses' && (
                <div className="v-stack animate slide-up">
                    <section className="pc-card-v2">
                        <div className="card-header-v2" style={{ marginBottom: '32px' }}>
                            <div className="header-icon"><MessageSquare size={20} /></div>
                            <div className="v-stack" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>{t('tickets.canned')}</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('tickets.canned_desc')}</p>
                            </div>
                            <button className="pc-btn-primary" onClick={addCannedResponse}>
                                <Plus size={20} /> <span>{t('common.add')}</span>
                            </button>
                        </div>
                        <div className="card-body-v2">
                            <div className="v-stack" style={{ gap: '24px' }}>
                                {((activePanel?.cannedResponses || []) || []).length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-badge)', borderRadius: '20px', border: '1.5px dashed var(--border)' }}>
                                        <MessageSquare size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 700 }}>{t('tickets.canned_empty')}</p>
                                    </div>
                                ) : (
                                    ((activePanel?.cannedResponses || []) || []).map((res, index) => (
                                        <div key={index} className="pc-sub-card-v2 animate slide-up">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                                <input className="pc-input-ghost-v2" value={res.label || ''} onChange={e => {
                                                    const newRes = [...(activePanel?.cannedResponses || [])];
                                                    newRes[index] = { ...res, label: e.target.value };
                                                    updateActivePanel({ cannedResponses: newRes });
                                                }} placeholder={t('tickets.cat_title_placeholder')} />
                                                <button onClick={() => removeCannedResponse(index)} className="pc-btn-icon-danger-v2"><Trash2 size={20} /></button>
                                            </div>
                                            <div className="pc-input-group-v2">
                                                <label>{t('tickets.canned_responses')}</label>
                                                <textarea className="pc-input-modern-v2" style={{ minHeight: '100px', width: '100%', resize: 'vertical' }} value={res.content || ''} onChange={e => {
                                                    const newRes = [...(activePanel?.cannedResponses || [])];
                                                    newRes[index] = { ...res, content: e.target.value };
                                                    updateActivePanel({ cannedResponses: newRes });
                                                }} placeholder={t('tickets.canned_placeholder')} />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            <EmbedPreviewDrawer open={!!previewData} onClose={() => setPreviewData(null)} data={previewData} />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1650px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            .ticket-category-list {
                max-width: 1120px;
            }
            .ticket-category-card {
                padding: 14px 16px !important;
                border-radius: 16px !important;
                background: var(--bg-card) !important;
            }
            .ticket-category-head {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 14px;
                padding-bottom: 12px;
                border-bottom: 1px solid var(--border);
            }
            .ticket-category-head :global(.pc-input-ghost-v2) {
                max-width: 340px;
                font-size: 0.95rem !important;
            }
            .ticket-category-actions {
                margin-left: auto;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .ticket-order-btn,
            .ticket-preview-btn.compact {
                width: 40px;
                height: 40px;
                min-height: 40px;
                padding: 0 !important;
                justify-content: center;
            }
            .ticket-order-btn:disabled {
                opacity: 0.45;
                cursor: not-allowed;
            }
            .ticket-category-controls {
                display: grid !important;
                grid-template-columns: 60px 170px minmax(180px, 280px);
                align-items: end;
                gap: 12px !important;
            }
            .ticket-emoji-col {
                width: 60px !important;
            }
            .ticket-category-controls :global(.pc-bb-emoji-box) {
                width: 40px !important;
                height: 40px !important;
            }
            .ticket-role-field {
                max-width: 280px;
            }
            .ticket-category-options {
                display: grid;
                grid-template-columns: minmax(240px, 420px);
                gap: 12px !important;
                margin-top: 14px !important;
                align-items: end;
            }
            .ticket-category-list textarea {
                min-height: 130px !important;
                max-height: 350px;
                padding: 12px 14px !important;
                line-height: 1.5;
                font-size: 0.9rem;
            }
            .ticket-style-picker {
                min-height: 40px;
                max-width: 170px;
                display: flex;
                align-items: center;
                gap: 7px;
                padding: 0 10px;
                border: 1px solid var(--border);
                border-radius: 12px;
                background: var(--bg-input);
            }
            .ticket-style-picker button {
                width: 22px;
                height: 22px;
                border-radius: 999px;
                border: 2px solid transparent;
                cursor: pointer;
                transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
            }
            .ticket-style-picker button:hover {
                transform: scale(1.1);
            }
            .ticket-style-picker button.active {
                border-color: var(--bg-input);
                box-shadow: 0 0 0 2px var(--primary);
                transform: scale(1.15);
            }
            .ticket-embed-color-control {
                min-height: 48px;
                width: 210px;
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 7px 10px;
                border: 1px solid var(--border);
                border-radius: 12px;
                background: var(--bg-input);
            }
            .ticket-embed-color-control input {
                width: 30px;
                height: 30px;
                padding: 0;
                border: none;
                border-radius: 8px;
                background: transparent;
                cursor: pointer;
            }
            .ticket-embed-color-control span {
                font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
                font-size: 0.8rem;
                font-weight: 800;
                color: var(--text-heading);
            }
            .rr-layout-inner { display: grid !important; grid-template-columns: minmax(0, 1fr) 320px !important; gap: 24px !important; align-items: start !important; }
            .rr-summary-card { position: sticky; top: 24px; padding: 20px !important; }
            .rr-summary-card .card-header-v2 { margin-bottom: 16px; }
            .rr-summary-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
            .rr-summary-row:last-child { border-bottom: none; }
            .rr-summary-row span { color: var(--text-muted); font-size: 0.78rem; font-weight: 750; }
            .rr-summary-row strong { color: var(--text-heading); font-size: 0.82rem; font-weight: 800; text-align: right; }
            
            /* Horizontal Top Bar styles */
            .rr-top-bar { display: flex; align-items: center; gap: 24px; padding: 16px 24px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; box-shadow: var(--shadow-premium); margin-bottom: 32px; }
            .top-bar-header { display: flex; align-items: center; gap: 16px; padding-right: 24px; border-right: 1.5px solid var(--border); }
            .top-bar-label { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
            .top-bar-count { font-size: 0.8rem; font-weight: 800; color: var(--primary); }
            .add-panel-btn { width: 36px !important; height: 36px !important; border-radius: 10px !important; }
            
            .rr-horizontal-list { display: flex; gap: 12px; overflow-x: auto; padding: 4px 0; flex: 1; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
            .rr-horizontal-list::-webkit-scrollbar { height: 4px; }
            .rr-horizontal-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
            
            .pc-panel-nav-btn-horizontal { display: flex; align-items: center; gap: 12px; padding: 10px 18px; background: var(--bg-badge); border: 1.5px solid var(--border); border-radius: 16px; cursor: pointer; transition: all 0.2s ease; flex-shrink: 0; }
            .pc-panel-nav-btn-horizontal:hover { border-color: var(--primary); }
            .pc-panel-nav-btn-horizontal.active { background: var(--bg-card); border-color: var(--primary); box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.08); }
            
            .nav-icon-horizontal { width: 32px; height: 32px; border-radius: 8px; background: var(--bg-card); display: flex; align-items: center; justify-content: center; color: var(--text-muted); transition: 0.2s; }
            .pc-panel-nav-btn-horizontal.active .nav-icon-horizontal { color: var(--primary); background: var(--bg-badge); }
            
            .nav-info-horizontal { display: flex; flex-direction: column; text-align: left; }
            .nav-name-horizontal { font-weight: 700; color: var(--text-heading); font-size: 0.85rem; }
            .nav-meta-horizontal { font-size: 0.62rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; }
            @media (max-width: 900px) {
                .ticket-category-controls,
                .ticket-category-options {
                    grid-template-columns: 1fr !important;
                }
                .ticket-category-actions {
                    margin-left: 0;
                }
            }
            
            @media (max-width: 1200px) {
                .pc-layout-grid-v2 { grid-template-columns: 1fr !important; gap: 24px !important; }
            }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
