import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-card glass-heavy animate">
            <div className="error-icon-wrapper">
              <AlertTriangle size={48} color="var(--error)" />
            </div>
            
            <h1 className="error-title">Ops! Qualcosa è andato storto</h1>
            <p className="error-message">
              Si è verificato un errore imprevisto durante il rendering di questa pagina. 
              Abbiamo già segnalato il problema al nostro team tecnico.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <div className="debug-info">
                <code>{this.state.error?.toString()}</code>
              </div>
            )}

            <div className="error-actions">
              <button 
                onClick={() => window.location.reload()} 
                className="btn-primary"
              >
                <RefreshCw size={18} /> Ricarica Pagina
              </button>
              <button 
                onClick={() => window.location.href = '/selector'} 
                className="btn-outline"
              >
                <Home size={18} /> Torna al Selettore
              </button>
            </div>
          </div>

          <style jsx>{`
            .error-boundary-container {
              height: 100vh;
              width: 100vw;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #09090b;
              padding: 20px;
            }
            .error-card {
              max-width: 500px;
              width: 100%;
              padding: 48px;
              text-align: center;
              border-radius: 32px;
              border: 1px solid var(--border);
            }
            .error-icon-wrapper {
              width: 80px;
              height: 80px;
              background: rgba(239, 68, 68, 0.1);
              border-radius: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 24px;
              border: 1px solid rgba(239, 68, 68, 0.2);
            }
            .error-title {
              font-size: 2rem;
              font-weight: 900;
              margin-bottom: 16px;
              letter-spacing: -1px;
            }
            .error-message {
              color: var(--text-muted);
              line-height: 1.6;
              margin-bottom: 32px;
            }
            .debug-info {
              background: var(--bg-elevated);
              padding: 12px;
              border-radius: 12px;
              margin-bottom: 24px;
              text-align: left;
              max-height: 150px;
              overflow-y: auto;
            }
            .debug-info code {
              font-family: monospace;
              font-size: 0.8rem;
              color: var(--error);
            }
            .error-actions {
              display: flex;
              flex-direction: column;
              gap: 12px;
            }
            .error-actions button {
              width: 100%;
              justify-content: center;
              padding: 14px;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
