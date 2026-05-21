import React from 'react';
import { Bell } from 'lucide-react';
import CustomSelect from './CustomSelect';
import DiscordSelector from './DiscordSelector';
import { useT } from '../contexts/LanguageContext';

const NotificationSettings = ({ 
    title, 
    description,
    value, 
    onChange, 
    guildId 
}) => {
    const { t } = useT();
    const displayTitle = title || t('notifications.title');
    const displayDescription = description || t('notifications.description');
    const modes = [
        { value: 'DM', label: t('notifications.mode_dm'), emoji: 'DM' },
        { value: 'CHANNEL', label: t('notifications.mode_channel'), emoji: '#' },
        { value: 'BOTH', label: t('notifications.mode_both'), emoji: '+#' },
        { value: 'NONE', label: t('notifications.mode_none'), emoji: 'OFF' }
    ];

    const handleModeChange = (newMode) => {
        onChange({ ...value, mode: newMode });
    };

    const handleChannelChange = (newChannelId) => {
        onChange({ ...value, channelId: newChannelId });
    };

    return (
        <div className="card section-card" style={{ marginBottom: '24px', maxWidth: '420px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h3 className="align-center" style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}><Bell size={16} color="var(--primary)" /> {displayTitle}</h3>
                <p className="text-description" style={{ margin: 0, fontSize: '0.8rem', marginTop: '6px' }}>{displayDescription}</p>
            </div>

            <div className="fields-grid" style={{ display: 'grid', gridTemplateColumns: (value?.mode === 'CHANNEL' || value?.mode === 'BOTH') ? '1fr 1.2fr' : '1fr', gap: '20px' }}>
                <div className="field-box" style={{ maxWidth: (value?.mode === 'CHANNEL' || value?.mode === 'BOTH') ? '100%' : '350px' }}>
                    <label className="text-label" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 700, color: 'var(--text-muted)' }}>{t('notifications.mode_label')}</label>
                    <CustomSelect
                        value={value?.mode || 'DM'}
                        onChange={handleModeChange}
                        options={modes}
                    />
                </div>

                {(value?.mode === 'CHANNEL' || value?.mode === 'BOTH') && (
                    <div className="field-box animate fade-in">
                        <label className="text-label">{t('notifications.channel_label')}</label>
                        <DiscordSelector
                            type="channel"
                            guildId={guildId}
                            value={value?.channelId}
                            onChange={handleChannelChange}
                            placeholder={t('notifications.channel_placeholder')}
                        />
                        <p className="field-help" style={{ marginTop: '8px' }}>
                            {t('notifications.channel_help')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationSettings;
