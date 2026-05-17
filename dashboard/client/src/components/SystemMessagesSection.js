import { useT } from '../contexts/LanguageContext';

/**
 * Reusable component for managing module-specific system messages.
 * 
 * @param {Object} props
 * @param {Object} props.config - The module configuration object
 * @param {Function} props.onUpdate - Callback to update the config
 * @param {Array} props.messages - Array of message definitions: { key, label, placeholder, description }
 * @param {string} props.title - Optional section title
 * @param {string} props.description - Optional section description
 */
const SystemMessagesSection = ({ 
    config, 
    onUpdate, 
    messages = [], 
    title, 
    description
}) => {
    const { t } = useT();
    
    const displayTitle = title || t('common.system_messages');
    const displayDescription = description || t('common.system_messages_desc');

    const handleChange = (key, value) => {
        const updatedMessages = { ...(config.systemMessages || {}) };
        if (value.trim() === '') {
            delete updatedMessages[key];
        } else {
            updatedMessages[key] = value;
        }
        onUpdate({ ...config, systemMessages: updatedMessages });
    };

    return (
        <div className="system-messages-section">
            <div className="section-header-v2 mb-6">
                <h3 className="section-title-v2">{displayTitle}</h3>
                <p className="section-description-v2">
                    {displayDescription}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {messages.map((msg) => (
                    <div key={msg.key} className="pc-input-group-v2">
                        <div className="flex justify-between items-center mb-2">
                            <label className="pc-label-v2 flex items-center gap-2">
                                {msg.label}
                                {msg.description && (
                                    <span className="pc-help-icon-v2" title={msg.description}>?</span>
                                )}
                            </label>
                            {config.systemMessages?.[msg.key] && (
                                <span className="pc-status-tag-v2 success text-[10px]">{t('common.customized')}</span>
                            )}
                        </div>
                        <textarea
                            className="pc-input-modern-v2 min-h-[100px] py-3 resize-y"
                            value={config.systemMessages?.[msg.key] || ''}
                            onChange={(e) => handleChange(msg.key, e.target.value)}
                            placeholder={msg.placeholder || t('common.leave_empty_default')}
                        />
                        <p className="text-[11px] text-gray-500 mt-1">
                            {t('common.local_key')}: <code className="bg-gray-800 px-1 rounded">{msg.key}</code>
                        </p>
                    </div>
                ))}
            </div>

            {messages.length === 0 && (
                <div className="text-center py-10 border border-dashed border-gray-700 rounded-xl">
                    <p className="text-gray-500">{t('common.no_system_messages')}</p>
                </div>
            )}
        </div>
    );
};

export default SystemMessagesSection;
