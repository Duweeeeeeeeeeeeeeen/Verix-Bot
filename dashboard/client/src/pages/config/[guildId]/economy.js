import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import EmbedMessageManager from '../../../components/EmbedMessageManager';
import api from '../../../utils/api';
import { 
  Coins,
  Settings,
  Banknote,
  Clock,
  AlertTriangle
} from 'lucide-react';

export default function EconomyConfig() {
  const router = useRouter();
  const { guildId } = router.query;
  const [config, setConfig] = useState({ enabled: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (guildId) {
        setLoading(true);
        api.request(`/config/${guildId}/economy`).then(res => {
            setConfig(res?.data || res || { enabled: true });
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
        window.dispatchEvent(new CustomEvent('update-guide-context', { detail: {} }));
    }
  }, [guildId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/economy`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Configurazione economia salvata!', type: 'success' } }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Errore salvataggio', type: 'error' } }));
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || loading) return (
    <div className="config-page-layout animate">
      <div className="config-main-col">
        <Skeleton width="300px" height="40px" style={{ marginBottom: '40px' }} />
        <Skeleton height="600px" />
      </div>
    </div>
  );

  return (
    <div className="config-page-layout animate">
      <div className="config-main-col">
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Coins size={24} />
              </div>
              <div className="header-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h1>Economia RP</h1>
                  <label className="toggle-mini" title={config.enabled ? 'Modulo Attivo' : 'Modulo Disattivato'}>
                    <input type="checkbox" checked={!!config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} />
                    <span className="slider-mini"></span>
                  </label>
                </div>
                <p>Gestisci i messaggi legati ai conti bancari, premi giornalieri e transazioni.</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                 <Save size={16} /> {saving ? 'Salvataggio...' : 'Salva'}
              </button>
           </div>
        </header>

        <div className="card glass-dark" style={{ marginBottom: '32px', padding: '32px' }}>
            <EmbedMessageManager 
                guildId={guildId}
                module="economy"
                slugs={[
                    { 
                        key: 'balance', 
                        label: 'Estratto Conto', 
                        description: 'Il messaggio mostrato quando un utente controlla il proprio saldo.',
                        variables: ['user', 'cash', 'bank'],
                        group: '💰 Finanze',
                        groupIcon: Banknote
                    },
                    { 
                        key: 'daily', 
                        label: 'Premio Giornaliero', 
                        description: 'Messaggio di conferma quando l\'utente ritira il premio giornaliero.',
                        variables: ['user', 'amount'],
                        group: '🎁 Premi',
                        groupIcon: Coins
                    },
                    { 
                        key: 'cooldown', 
                        label: 'Attesa Premio', 
                        description: 'Avviso mostrato se l\'utente tenta di ritirare il premio prima dello scadere del tempo.',
                        variables: ['user', 'time'],
                        group: '⏰ Limiti',
                        groupIcon: Clock
                    },
                    { 
                        key: 'user_not_found', 
                        label: 'Utente Non Trovato', 
                        description: 'Mostrato quando si tenta di interagire col conto di un utente non registrato.',
                        variables: ['user'],
                        group: '🟥 Errori',
                        groupIcon: AlertTriangle
                    },
                    { 
                        key: 'generic_error', 
                        label: 'Errore Transazione', 
                        description: 'Errore generico in caso di fallimento delle operazioni bancarie.',
                        variables: ['user'],
                        group: '🟥 Errori',
                        groupIcon: AlertTriangle
                    }
                ]}
            />
        </div>
      </div>

      <style jsx>{`
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: rgba(255,255,255,0.02); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: rgba(245, 158, 11, 0.1); color: var(--warning); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }
            .glass-dark { background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 24px; }
        `}</style>
    </div>
  );
}
