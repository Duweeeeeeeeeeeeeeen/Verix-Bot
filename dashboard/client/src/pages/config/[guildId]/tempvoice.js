import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import api from '../../../utils/api';
import { 
    Save, 
    Mic2, 
    Settings2, 
    Plus, 
    Hash, 
    Power,
    RefreshCcw,
    Layout,
    Info,
    MessageSquare,
    Zap,
    Users
} from 'lucide-react';
import DiscordSelector from '../../../components/DiscordSelector';

export default function TempVoiceConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (guildId) {
      fetchConfig();
      fetchChannels();
    }
  }, [guildId]);

  const fetchConfig = async () => {
    try {
      const res = await api.request(`/config/${guildId}/tempvoice`);
      if (res) setConfig(res.data || res);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const res = await api.request(`/guilds/${guildId}/channels`);
      if (res) {
        const chanData = res.data || res;
        setChannels(chanData.filter(c => c.type === 2)); // Voice
        setCategories(chanData.filter(c => c.type === 4)); // Category
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/tempvoice`, {
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
          <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/20">
            <Mic2 className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Temp Voice</h1>
            <p className="text-slate-400">Crea canali vocali temporanei automatici</p>
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
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-blue-600/20"
          >
            {saving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Salvataggio...' : 'Salva Modifiche'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Config */}
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 space-y-6">
          <div className="flex items-center gap-2 text-white font-bold text-lg mb-2">
            <Settings2 className="w-5 h-5 text-blue-400" />
            Configurazione Base
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Canale Generatore (Join to Create)</label>
              <DiscordSelector
                type="channel"
                value={config.creatorChannelId}
                onChange={(val) => setConfig({ ...config, creatorChannelId: val })}
                options={channels}
                placeholder="Seleziona un canale vocale..."
              />
              <p className="mt-1 text-xs text-slate-500 italic">Quando un utente entra in questo canale, ne verrà creato uno nuovo per lui.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 text-white">Categoria di Destinazione</label>
              <DiscordSelector
                type="channel"
                value={config.categoryId}
                onChange={(val) => setConfig({ ...config, categoryId: val })}
                options={categories}
                placeholder="Default (Stessa del generatore)"
              />
            </div>
          </div>
        </div>

        {/* Customization */}
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 space-y-6">
          <div className="flex items-center gap-2 text-white font-bold text-lg mb-2">
            <Layout className="w-5 h-5 text-purple-400" />
            Personalizzazione
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 text-white">Template Nome Canale</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MessageSquare className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={config.channelNameTemplate}
                  onChange={(e) => setConfig({ ...config, channelNameTemplate: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 bg-slate-800 border border-white/5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Es: 🔊 Stanza di {user}"
                />
              </div>
              <div className="mt-2 flex gap-2">
                <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400">Placeholders: {"{user}"}, {"{tag}"}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 text-white">Limite Utenti Default</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={config.defaultUserLimit}
                  onChange={(e) => setConfig({ ...config, defaultUserLimit: parseInt(e.target.value) })}
                  className="block w-full pl-10 pr-3 py-2 bg-slate-800 border border-white/5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">0 = Nessun limite</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-2xl flex gap-4">
        <div className="p-2 bg-blue-500/20 rounded-lg h-fit">
          <Info className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Come funziona?</h3>
          <p className="text-slate-400 text-sm leading-relaxed mt-1">
            Il modulo Temp Voice permette agli utenti di creare i propri canali vocali semplicemente entrando in un canale "generatore". 
            Il bot creerà un nuovo canale vocale, sposterà l'utente al suo interno e gli darà i permessi per gestirlo (modificare il nome, limite utenti, ecc.). 
            Quando l'ultimo utente lascia il canale, questo verrà eliminato automaticamente.
          </p>
        </div>
      </div>
    </div>
  );
}
