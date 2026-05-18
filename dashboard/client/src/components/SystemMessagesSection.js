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

            <div className="system-messages-grid">
                {messages.map((msg) => (
                    <div key={msg.key} className="pc-input-group-v2 system-message-card">
                        <div className="message-label-row">
                            <label className="pc-label-v2">
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
                            className="pc-input-modern-v2 system-message-textarea"
                            value={config.systemMessages?.[msg.key] || ''}
                            onChange={(e) => handleChange(msg.key, e.target.value)}
                            placeholder={msg.placeholder || t('common.leave_empty_default')}
                        />
                        <p className="system-message-key">
                            {t('common.local_key')}: <code>{msg.key}</code>
                        </p>
                    </div>
                ))}
            </div>

            {messages.length === 0 && (
                <div className="text-center py-10 border border-dashed border-gray-700 rounded-xl">
                    <p className="text-gray-500">{t('common.no_system_messages')}</p>
                </div>
            )}

            <style jsx>{`
                .system-messages-section {
                    width: 100%;
                }

                .system-messages-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
                    gap: 18px;
                }

                .system-message-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-light);
                    border-radius: 16px;
                    padding: 18px;
                }

                .message-label-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 10px;
                }

                .pc-label-v2 {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    min-width: 0;
                }

                .system-message-textarea {
                    min-height: 135px;
                    padding: 14px;
                    resize: vertical;
                    line-height: 1.5;
                    font-family: inherit;
                }

                .system-message-key {
                    margin: 8px 0 0;
                    font-size: 11px;
                    color: var(--text-muted);
                }

                .system-message-key code {
                    background: var(--bg-badge);
                    color: var(--text-main);
                    padding: 2px 6px;
                    border-radius: 6px;
                }

                @media (max-width: 720px) {
                    .system-messages-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default SystemMessagesSection;
