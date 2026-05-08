import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import { EmbedMessageManager } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
  Settings, 
  ShieldAlert, 
  BellRing,
  HelpCircle,
  Save,
  MessageSquare,
  Shield,
  Layout,
  Globe
} from 'lucide-react';

export default function SystemConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (guildId) {
        setLoading(false);
        window.dispatchEvent(new CustomEvent('update-guide-context', { detail: {} }));
    }
  }, [guildId]);

  if (!mounted || loading) return <Skeleton height="600px" />;

  const handleSave = () => {
      window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: "Configurazione sistema salvata!", type: 'success' } 
      }));
  };

  return (
    <div className="pc-premium-wrapper fade-in">
        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)' }}>
                    <Settings size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>Messaggi di Sistema</h1>
                    <div className="pc-status-pill active">CONFIGURAZIONE GLOBALE</div>
                </div>
            </div>
            
            <div className="header-controls">
                <button className="pc-btn-primary" onClick={handleSave}>
                    <Save size={18} />
                    <span>Salva Tutto</span>
                </button>
            </div>
        </header>

        <div className="pc-content-v2">
            <section className="pc-card-v2">
                <div className="card-header-v2">
                    <div className="header-icon"><MessageSquare size={18} /></div>
                    <h3>Personalizzazione Risposte</h3>
                </div>
                <div className="card-body-v2">
                    <EmbedMessageManager 
                        guildId={guildId}
                        module="system"
                        slugs={[
                            { key: 'no_permission', label: 'Permessi Insufficienti', description: 'Inviato quando un utente non ha i permessi per un comando', variables: ['user', 'guild'], group: 'Sicurezza', groupIcon: Shield },
                            { key: 'module_disabled', label: 'Modulo Disabilitato', description: 'Inviato quando un utente tenta di usare un modulo spento', variables: ['user', 'module'], group: 'Sicurezza', groupIcon: Shield },
                            { key: 'role_hierarchy', label: 'Gerarchia Ruoli', description: 'Inviato quando il bot non può agire per gerarchia', variables: ['user', 'role'], group: 'Sicurezza', groupIcon: Shield },
                            { key: 'generic_error', label: 'Errore Generico', description: 'Inviato in caso di errore inaspettato', variables: ['user', 'error'], group: 'Sistema', groupIcon: Layout },
                            { key: 'setup_success', label: 'Setup Completato', description: 'Inviato alla fine del setup iniziale', variables: ['user', 'guild'], group: 'Sistema', groupIcon: Layout },
                            { key: 'module_list', label: 'Lista Moduli', description: 'Inviato quando viene richiesta la lista dei moduli', variables: ['user', 'modules'], group: 'Comandi', groupIcon: Globe },
                            { key: 'module_enabled', label: 'Modulo Abilitato', description: 'Inviato all\'abilitazione di un modulo', variables: ['user', 'module'], group: 'Comandi', groupIcon: Globe },
                            { key: 'module_disabled_success', label: 'Modulo Disabilitato (Successo)', description: 'Inviato alla disabilitazione di un modulo', variables: ['user', 'module'], group: 'Comandi', groupIcon: Globe },
                            { key: 'module_already_in_state', label: 'Modulo Già in Stato', description: 'Inviato se il modulo è già attivo/spento', variables: ['user', 'module', 'state'], group: 'Comandi', groupIcon: Globe },
                            { key: 'module_not_found', label: 'Modulo Non Trovato', description: 'Inviato se il modulo specificato non esiste', variables: ['user', 'module'], group: 'Comandi', groupIcon: Globe }
                        ]}
                    />
                </div>
            </section>
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 40px; max-width: 1400px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: white; padding: 32px; border-radius: 32px; box-shadow: var(--shadow-premium); border: 1px solid var(--border-light); }
            .header-info { display: flex; align-items: center; gap: 24px; }
            .pc-icon-box { width: 64px; height: 64px; color: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; }
            .pc-title-row { display: flex; flex-direction: column; gap: 6px; }
            .pc-title-row h1 { font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 900; margin: 0; color: var(--text-main); letter-spacing: -0.5px; }
            .pc-status-pill { font-size: 0.65rem; font-weight: 900; padding: 4px 12px; border-radius: 100px; letter-spacing: 1px; width: fit-content; }
            .pc-status-pill.active { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

            .pc-btn-primary { display: flex; align-items: center; gap: 12px; background: var(--primary); color: white; border: none; padding: 14px 28px; border-radius: 16px; font-weight: 800; cursor: pointer; transition: 0.3s; }

            /* Cards */
            .pc-card-v2 { background: white; border: 1px solid var(--border-light); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 40px; height: 40px; background: var(--bg-badge); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .card-header-v2 h3 { margin: 0; font-size: 1.1rem; font-weight: 850; }

            :global(.light-theme) .pc-header-v2, :global(.light-theme) .pc-card-v2 { background: #ffffff !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; }
        `}</style>
    </div>
  );
}
