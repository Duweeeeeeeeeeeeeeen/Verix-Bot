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
            <div className="system-section-header">
                <div>
                    <h3>{displayTitle}</h3>
                    <p>{displayDescription}</p>
                </div>
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

                .system-section-header {
                    margin-bottom: 22px;
                    display: flex;
                    justify-content: space-between;
                    gap: 16px;
                }

                .system-section-header h3 {
                    margin: 0;
                    color: var(--text-heading);
                    font-size: 1.15rem;
                    font-weight: 800;
                    letter-spacing: 0;
                }

                .system-section-header p {
                    margin: 6px 0 0;
                    max-width: 760px;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    font-weight: 650;
                    line-height: 1.45;
                }

                .system-messages-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
                    gap: 16px;
                }

                .system-message-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 14px;
                    padding: 16px;
                    min-width: 0;
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
                    color: var(--text-heading);
                    font-size: 0.88rem;
                    font-weight: 750;
                    letter-spacing: 0;
                }

                .system-message-textarea {
                    width: 100%;
                    min-height: 150px;
                    padding: 14px;
                    resize: vertical;
                    line-height: 1.5;
                    font-family: inherit;
                    border-radius: 12px;
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

                    .system-section-header {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
};

export default SystemMessagesSection;
