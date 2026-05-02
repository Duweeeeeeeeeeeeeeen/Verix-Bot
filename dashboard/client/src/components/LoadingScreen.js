import React from 'react';

export default function LoadingScreen({ message = "Caricamento in corso..." }) {
  return (
    <div className="loading-screen-wrapper">
      <div className="loading-content">
        <div className="logo-container">
          <img src="/logo.png" alt="Verix Logo" className="pulse-logo" />
          <div className="orbit-container">
            <div className="orbit-ring"></div>
            <div className="orbit-planet"></div>
          </div>
        </div>
        <div className="loading-text">
          <h2 className="glitch-text" data-text="VERIX">VERIX</h2>
          <div className="progress-bar-container">
            <div className="progress-bar-fill"></div>
          </div>
          <p>{message}</p>
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
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
        }

        .logo-container {
          position: relative;
          width: 120px;
          height: 120px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .pulse-logo {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          z-index: 10;
          animation: logo-pulse 2s ease-in-out infinite;
          box-shadow: 0 0 30px rgba(99, 102, 241, 0.4);
        }

        @keyframes logo-pulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.05); filter: brightness(1.2); }
        }

        .orbit-container {
          position: absolute;
          width: 140px;
          height: 140px;
          animation: rotate 3s linear infinite;
        }

        .orbit-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid rgba(99, 102, 241, 0.1);
          border-radius: 50%;
        }

        .orbit-planet {
          position: absolute;
          top: -5px;
          left: 50%;
          width: 10px;
          height: 10px;
          background: var(--primary, #6366f1);
          border-radius: 50%;
          box-shadow: 0 0 15px var(--primary, #6366f1);
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .loading-text {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .glitch-text {
          font-family: 'Outfit', sans-serif;
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: 8px;
          color: var(--text-main);
          position: relative;
          margin: 0;
        }

        .progress-bar-container {
          width: 200px;
          height: 4px;
          background: var(--bg-elevated-hover);
          border-radius: 10px;
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
