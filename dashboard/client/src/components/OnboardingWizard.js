import { useRouter } from 'next/router';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Shield, 
  Layout, 
  ListChecks,
  Settings,
  Zap,
  CheckCircle
} from 'lucide-react';

export default function OnboardingWizard({ config, guildId }) {
  const router = useRouter();

  if (!config) return null;

  const steps = [
    {
      id: 'staff',
      title: 'Configura Ruolo Staff',
      description: 'Definisci chi può gestire ticket e whitelist.',
      isCompleted: !!(config.globalConfig?.adminRoleIds?.length > 0),
      path: `/config/${guildId}/global`,
      icon: Shield
    },
    {
      id: 'logs',
      title: 'Canale Log Centrale',
      description: 'Imposta dove ricevere i log delle azioni.',
      isCompleted: !!config.globalConfig?.logs?.channelId,
      path: `/config/${guildId}/global`,
      icon: ListChecks
    },
    {
      id: 'verify',
      title: 'Attiva Modulo Verifica',
      description: 'Abilita il sistema di verifica automatica.',
      isCompleted: !!config.verify?.enabled,
      path: `/config/${guildId}/verify`,
      icon: CheckCircle
    },
    {
      id: 'whitelist',
      title: 'Attiva Modulo Whitelist',
      description: 'Apri le candidature per i nuovi utenti.',
      isCompleted: !!config.whitelist?.enabled,
      path: `/config/${guildId}/whitelist`,
      icon: Zap
    }
  ];

  const completedCount = steps.filter(s => s.isCompleted).length;
  const progress = (completedCount / steps.length) * 100;
  
  if (progress === 100) return null;

  return (
    <div className="card wizard-card animate" style={{ marginBottom: '48px', overflow: 'hidden' }}>
      <div style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                  🚀 Iniziamo il Setup
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                  Completa questi passi per rendere il bot operativo al 100%.
                </p>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>{progress}%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Completato</div>
            </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', marginBottom: '40px', position: 'relative' }}>
            <div style={{ 
                width: `${progress}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--primary), var(--accent))', 
                borderRadius: '100px',
                boxShadow: '0 0 15px var(--primary-glow)',
                transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
            }}></div>
        </div>

        {/* Grid of steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {steps.map((step) => {
                const Icon = step.icon;
                return (
                    <div 
                        key={step.id} 
                        className={`step-item ${step.isCompleted ? 'completed' : ''}`}
                        onClick={() => router.push(step.path)}
                    >
                        <div className="step-icon-container">
                            <Icon size={20} />
                            {step.isCompleted && (
                                <div className="step-check">
                                    <CheckCircle2 size={14} />
                                </div>
                            )}
                        </div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '750', marginBottom: '4px' }}>{step.title}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{step.description}</p>
                        
                        {!step.isCompleted && (
                            <div className="step-action">
                                Configura <ArrowRight size={12} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>

      <style jsx>{`
        .wizard-card {
            background: linear-gradient(145deg, rgba(var(--primary-rgb), 0.05), rgba(0,0,0,0));
            border: 1px solid rgba(var(--primary-rgb), 0.1);
        }

        .step-item {
            padding: 24px;
            background: rgba(255,255,255,0.02);
            border: 1px solid var(--border);
            border-radius: 20px;
            cursor: pointer;
            transition: var(--transition-normal);
            position: relative;
        }

        .step-item:hover {
            transform: translateY(-4px);
            background: rgba(255,255,255,0.05);
            border-color: var(--primary);
        }

        .step-icon-container {
            width: 44px;
            height: 44px;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
            color: var(--text-muted);
            position: relative;
        }

        .step-item.completed {
            border-color: rgba(16, 185, 129, 0.2);
            background: rgba(16, 185, 129, 0.02);
        }

        .step-item.completed .step-icon-container {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
        }

        .step-check {
            position: absolute;
            top: -6px;
            right: -6px;
            background: var(--success);
            color: white;
            border-radius: 50%;
            padding: 2px;
            display: flex;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }

        .step-action {
            margin-top: 16px;
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--primary);
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .step-item.completed:hover {
            border-color: var(--success);
        }
      `}</style>
    </div>
  );
}
