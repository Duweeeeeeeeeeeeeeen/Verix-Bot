import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { 
    Save, 
    Gift, 
    Trophy,
    Clock,
    Users,
    Trash2,
    Plus,
    RefreshCcw,
    Settings2,
    Shield,
    Power
} from 'lucide-react';
import DiscordSelector from '../../../components/DiscordSelector';

export default function GiveawayConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [roles, setRoles] = useState([]);
  const [activeGiveaways, setActiveGiveaways] = useState([]);

  useEffect(() => {
    if (guildId) {
      fetchConfig();
      fetchGiveaways();
      fetchDiscordData();
    }
  }, [guildId]);

  const fetchConfig = async () => {
    try {
      const res = await api.request(`/config/${guildId}/giveaway`);
      if (res) setConfig(res.data || res);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const fetchGiveaways = async () => {
    try {
      const res = await api.request(`/config/${guildId}/giveaways/active`);
      if (res) setActiveGiveaways(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDiscordData = async () => {
    try {
      const res = await api.request(`/guilds/${guildId}/roles`);
      if (res) setRoles(res.data || res);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/giveaway`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Configurazione salvata!', type: 'success' } }));
    } catch (e) {
      console.error(e);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Errore nel salvataggio', type: 'error' } }));
    }
    setSaving(false);
  };

  if (loading || !config) return <Skeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-pink-500/20 rounded-xl border border-pink-500/20">
            <Gift className="w-8 h-8 text-pink-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Giveaway Manager</h1>
            <p className="text-slate-400">Gestisci estrazioni e premi per la tua community</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 border ${
              config.enabled 
              ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' 
              : 'bg-slate-800 text-slate-400 border-white/5 hover:bg-slate-700'
            }`}
          >
            <Power className="w-4 h-4" />
            {config.enabled ? 'Attivo' : 'Disattivato'}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-pink-600/20"
          >
            {saving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Salvataggio...' : 'Salva Modifiche'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-2">
              <Shield className="w-5 h-5 text-pink-400" />
              Permessi
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Ruoli Manager</label>
              <DiscordSelector
                type="role"
                multiple={true}
                value={config.managerRoles}
                onChange={(val) => setConfig({ ...config, managerRoles: val })}
                options={roles}
                placeholder="Ruoli che possono creare giveaway..."
              />
              <p className="mt-2 text-xs text-slate-500">I ruoli con permesso 'Gestisci Messaggi' possono sempre creare giveaway.</p>
            </div>
          </div>
        </div>

        {/* Active Giveaways */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Giveaway Attivi
              </div>
              <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-lg text-xs font-bold border border-white/5">
                {activeGiveaways.length} In Corso
              </span>
            </div>

            {activeGiveaways.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                <div className="p-4 bg-slate-800 rounded-full mb-4">
                  <Gift className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-500 font-medium">Nessun giveaway attivo al momento.</p>
                <p className="text-slate-600 text-sm">Usa il comando /giveaway start su Discord!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeGiveaways.map((gw) => (
                  <div key={gw._id} className="bg-slate-800/50 border border-white/5 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="text-white font-bold text-lg truncate pr-2">{gw.prize}</h4>
                      <div className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                        <Clock className="w-3 h-3" />
                        Attivo
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Users className="w-3.5 h-3.5" />
                        <span>{gw.participants?.length || 0} Partecipanti</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>{gw.winnerCount} Vincitori</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">Termina: {new Date(gw.endTime).toLocaleString()}</span>
                        {/* Optional: Add button to end manually or delete */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
