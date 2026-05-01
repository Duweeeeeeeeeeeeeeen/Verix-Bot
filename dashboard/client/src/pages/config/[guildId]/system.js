import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import EmbedMessageManager from '../../../components/EmbedMessageManager';
import api from '../../../utils/api';
import { 
  Settings, 
  ShieldAlert, 
  BellRing,
  HelpCircle
} from 'lucide-react';

export default function SystemConfig() {
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
                <Settings size={24} />
              </div>
              <div className="header-text">
                <h1>Configurazione Sistema</h1>
                <p>Gestisci i messaggi globali, gli errori e le notifiche di rete del bot.</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Configurazioni messaggi salvate automaticamente.', type: 'success' } }))} className="btn-primary">
                 <Settings size={16} /> Salva
              </button>
           </div>
        </header>

        <div className="card glass-dark" style={{ marginBottom: '32px', padding: '32px' }}>
            <EmbedMessageManager 
                guildId={guildId}
                module="system"
                slugs={[
                    { 
                        key: 'no_permission', 
                        label: 'Permessi Insufficienti', 
                        description: 'Messaggio mostrato quando un utente non ha i ruoli necessari per un comando o azione.',
                        variables: ['user', 'guild'] 
                    },
                    { 
                        key: 'module_disabled', 
                        label: 'Modulo Disattivato', 
                        description: 'Mostrato quando si tenta di interagire con un modulo (es. Tickets) temporaneamente spento.',
                        variables: ['user', 'module'] 
                    },
                    { 
                        key: 'role_hierarchy', 
                        label: 'Gerarchia Ruoli', 
                        description: 'Errore mostrato quando il bot non può assegnare un ruolo perché troppo alto nella lista del server.',
                        variables: ['user', 'role'] 
                    },
                    { 
                        key: 'generic_error', 
                        label: 'Errore Generico', 
                        description: 'Messaggio di fallback per anomalie impreviste del sistema.',
                        variables: ['user', 'error'] 
                    },
                    { 
                        key: 'setup_success', 
                        label: 'Setup Completato', 
                        description: 'Messaggio mostrato al completamento del setup base del bot.',
                        variables: ['user', 'guild'] 
                    },
                    { 
                        key: 'module_list', 
                        label: 'Lista Moduli', 
                        description: 'Risposta che elenca lo stato di tutti i moduli (attivo/spento).',
                        variables: ['user', 'modules'] 
                    },
                    { 
                        key: 'module_enabled', 
                        label: 'Modulo Attivato', 
                        description: 'Conferma di attivazione di un modulo specifico.',
                        variables: ['user', 'module'] 
                    },
                    { 
                        key: 'module_disabled_success', 
                        label: 'Modulo Disattivato (Successo)', 
                        description: 'Conferma di spegnimento manuale di un modulo.',
                        variables: ['user', 'module'] 
                    },
                    { 
                        key: 'module_already_in_state', 
                        label: 'Modulo Già in Stato', 
                        description: 'Errore mostrato se il modulo è già acceso/spento come richiesto.',
                        variables: ['user', 'module', 'state'] 
                    },
                    { 
                        key: 'module_not_found', 
                        label: 'Modulo Non Trovato', 
                        description: 'Errore mostrato se il modulo specificato non esiste.',
                        variables: ['user', 'module'] 
                    }
                ]}
            />
        </div>
      </div>

      <style jsx>{`
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-badge); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: rgba(255, 255, 255, 0.05); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }
            .glass-dark { background: var(--bg-badge); border: 1px solid var(--border); border-radius: 24px; }
        `}</style>
    </div>
  );
}
