import React from 'react';
import CustomSelect from './CustomSelect';
import DiscordSelector from './DiscordSelector';

const NotificationSettings = ({ 
    title = "Notifiche Utente", 
    description = "Scegli come l'utente riceverà le notifiche relative a questo modulo.",
    value, 
    onChange, 
    guildId 
}) => {
    const modes = [
        { value: 'DM', label: 'Solo DM (Messaggio Privato)', emoji: '📩' },
        { value: 'CHANNEL', label: 'Canale Specifico (Tag)', emoji: '📢' },
        { value: 'BOTH', label: 'Entrambi (DM + Canale)', emoji: '🔄' },
        { value: 'NONE', label: 'Nessuna Notifica', emoji: '🔇' }
    ];

    const handleModeChange = (newMode) => {
        onChange({ ...value, mode: newMode });
    };

    const handleChannelChange = (newChannelId) => {
        onChange({ ...value, channelId: newChannelId });
    };

    return (
        <div className="card section-card" style={{ marginBottom: '24px' }}>
            <div className="align-center" style={{ marginBottom: '20px' }}>
                <div style={{ 
                    padding: '8px', 
                    background: 'rgba(129, 140, 248, 0.1)', 
                    color: 'var(--primary)', 
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{title}</h3>
                    <p className="text-description" style={{ margin: 0, fontSize: '0.8rem' }}>{description}</p>
                </div>
            </div>

            <div className="fields-grid" style={{ display: 'grid', gridTemplateColumns: (value?.mode === 'CHANNEL' || value?.mode === 'BOTH') ? '1fr 1.2fr' : '1fr', gap: '20px' }}>
                <div className="field-box">
                    <label className="text-label">Modalità Notifica</label>
                    <CustomSelect
                        value={value?.mode || 'DM'}
                        onChange={handleModeChange}
                        options={modes}
                    />
                </div>

                {(value?.mode === 'CHANNEL' || value?.mode === 'BOTH') && (
                    <div className="field-box animate fade-in">
                        <label className="text-label">Canale Notifiche</label>
                        <DiscordSelector
                            type="channel"
                            guildId={guildId}
                            value={value?.channelId}
                            onChange={handleChannelChange}
                            placeholder="Seleziona un canale..."
                        />
                        <p className="field-help" style={{ marginTop: '8px' }}>
                            L'utente verrà menzionato in questo canale.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationSettings;
