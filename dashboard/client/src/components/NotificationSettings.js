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
        <div className="bg-[#1a1c23] border border-white/5 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <p className="text-sm text-gray-400">{description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Modalità Notifica</label>
                    <CustomSelect
                        value={value?.mode || 'DM'}
                        onChange={handleModeChange}
                        options={modes}
                    />
                </div>

                {(value?.mode === 'CHANNEL' || value?.mode === 'BOTH') && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Canale Notifiche</label>
                        <DiscordSelector
                            type="channel"
                            guildId={guildId}
                            value={value?.channelId}
                            onChange={handleChannelChange}
                            placeholder="Seleziona un canale..."
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            L'utente verrà menzionato in questo canale per attirare la sua attenzione.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationSettings;
