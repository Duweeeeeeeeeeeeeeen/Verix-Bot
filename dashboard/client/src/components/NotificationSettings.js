import React from 'react';
import { Bell } from 'lucide-react';
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
        <div className="card section-card" style={{ marginBottom: '24px', maxWidth: '420px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h3 className="align-center" style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}><Bell size={16} color="var(--primary)" /> {title}</h3>
                <p className="text-description" style={{ margin: 0, fontSize: '0.8rem', marginTop: '6px' }}>{description}</p>
            </div>

            <div className="fields-grid" style={{ display: 'grid', gridTemplateColumns: (value?.mode === 'CHANNEL' || value?.mode === 'BOTH') ? '1fr 1.2fr' : '1fr', gap: '20px' }}>
                <div className="field-box" style={{ maxWidth: (value?.mode === 'CHANNEL' || value?.mode === 'BOTH') ? '100%' : '350px' }}>
                    <label className="text-label" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 700, color: 'var(--text-muted)' }}>Modalità Notifica</label>
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
