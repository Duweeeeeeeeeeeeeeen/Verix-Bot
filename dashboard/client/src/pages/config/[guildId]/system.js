import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
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
    if (guildId) setLoading(false);
  }, [guildId]);

  if (!mounted || loading) return (
    <Layout guildId={guildId}>
      <div className="animate">
        <Skeleton width="300px" height="40px" style={{ marginBottom: '40px' }} />
        <Skeleton height="600px" />
      </div>
    </Layout>
  );

  return (
    <Layout guildId={guildId}>
      <div className="animate">
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
                    }
                ]}
            />
        </div>

        <style jsx>{`
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: rgba(255,255,255,0.02); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: rgba(255, 255, 255, 0.05); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }
            .glass-dark { background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 24px; }
        `}</style>
      </div>
    </Layout>
  );
}
