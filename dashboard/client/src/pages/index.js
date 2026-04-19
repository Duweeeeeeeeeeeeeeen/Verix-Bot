import { useAuth } from '../contexts/AuthContext';
import { LogIn, Rocket, Shield, Zap } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const { user, login, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/selector');
  }, [user]);

  if (loading) return null;

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at top, #1a1a1e 0%, #0c0c0e 100%)',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '800px' }}>
        <div style={{ 
          background: 'rgba(88,101,242,0.1)', 
          padding: '12px 24px', 
          borderRadius: '100px', 
          color: 'var(--primary)',
          fontSize: '0.9rem',
          fontWeight: '600',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px',
          border: '1px solid rgba(88,101,242,0.2)'
        }}>
          <Rocket size={16} /> Nuova Dashboard MVP v1.0
        </div>
        
        <h1 style={{ fontSize: '4rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px' }}>
          Gestisci il tuo <span style={{ color: 'var(--primary)' }}>Bot Discord</span> con Eleganza.
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>
          Configura whitelist, canali vocali e ticket tramite un'interfaccia moderna, veloce e sicura.
        </p>

        <button onClick={login} className="btn-primary" style={{ fontSize: '1.1rem', padding: '16px 32px', margin: '0 auto' }}>
          <LogIn size={20} /> Accedi con Discord
        </button>

        <div style={{ 
          marginTop: '80px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '24px',
          textAlign: 'left'
        }}>
          {[
            { icon: Shield, title: 'Sicuro', desc: 'Controllo accessi granulare basato sui permessi admin.' },
            { icon: Zap, title: 'Veloce', desc: 'Sincronizzazione istantanea tra web e Discord.' },
            { icon: Rocket, title: 'Modulare', desc: 'Ogni modulo bot può essere configurato separatamente.' }
          ].map((item, i) => (
            <div key={i} className="card">
              <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><item.icon size={28} /></div>
              <h3 style={{ marginBottom: '8px' }}>{item.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
