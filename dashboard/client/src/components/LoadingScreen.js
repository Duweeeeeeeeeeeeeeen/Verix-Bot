import React from 'react';
import { useT } from '../contexts/LanguageContext';

export default function LoadingScreen({ message }) {
  const { t } = useT();
  const displayMessage = message || t('loading.default');
  
  return (
    <div className="loading-screen-wrapper">
      <div className="loading-content">
        <div className="logo-container">
          <img src="/logo.png" alt="Verix Logo" className="pulse-logo" />
        </div>
        <div className="loading-text">
          <h2>VERIX</h2>
          <div className="progress-bar-container">
            <div className="progress-bar-fill"></div>
          </div>
          <p>{displayMessage}</p>
        </div>
      </div>

      <style jsx>{`
        .loading-screen-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: var(--bg-main);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 99999;
          overflow: hidden;
          backdrop-filter: blur(8px);
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 28px;
          width: min(320px, calc(100vw - 48px));
          padding: 32px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: color-mix(in srgb, var(--bg-card) 88%, transparent);
          box-shadow: var(--shadow-xl);
        }

        .logo-container {
          position: relative;
          width: 72px;
          height: 72px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .pulse-logo {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
        }

        .loading-text {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        h2 {
          font-family: 'Inter', sans-serif;
          font-size: 1.45rem;
          font-weight: 900;
          letter-spacing: 0;
          color: var(--text-main);
          margin: 0;
        }

        .progress-bar-container {
          width: 100%;
          height: 4px;
          background: var(--bg-elevated-hover);
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-bar-fill {
          width: 40%;
          height: 100%;
          background: linear-gradient(90deg, transparent, var(--primary, #6366f1), transparent);
          animation: progress-slide 1.5s ease-in-out infinite;
        }

        @keyframes progress-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        p {
          color: var(--text-muted, #64748b);
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
