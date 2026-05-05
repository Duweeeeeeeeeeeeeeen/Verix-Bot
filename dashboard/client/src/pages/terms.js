import Head from 'next/head';
import { FileText, Gavel, AlertCircle, CheckCircle, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/router';

export default function TermsOfService() {
  const router = useRouter();

  return (
    <div className="legal-container">
      <Head>
        <title>Terms of Service | Verix Bot</title>
      </Head>

      <div className="background-glow"></div>

      <div className="content-wrapper animate fade-in">
        <button className="btn-back" onClick={() => router.push('/')}>
          <ChevronLeft size={18} /> Back to Home
        </button>

        <header className="legal-header">
          <img src="/logo.png" alt="Verix Logo" className="verix-logo" />
          <div className="icon-wrapper">
            <Gavel size={40} />
          </div>
          <h1>Terms of Service</h1>
          <p className="last-updated">Last updated: May 5, 2026</p>
        </header>

        <main className="legal-glass-card">
          <section className="legal-section">
            <div className="section-title">
              <FileText size={20} />
              <h2>1. Acceptance of Terms</h2>
            </div>
            <p>
              By using Verix Bot and its associated services (Dashboard, API), you agree to be bound by these Terms of Service and Discord's Terms of Service. If you do not agree, please remove the bot from your server immediately.
            </p>
          </section>

          <section className="legal-section">
            <div className="section-title">
              <AlertCircle size={20} />
              <h2>2. Permitted Use</h2>
            </div>
            <p>
              You may not use Verix for any illegal activities, spamming, or violating Discord Community Guidelines. 
              Any abuse of the API or attempts to exploit the bot will result in an immediate and permanent ban from our services.
            </p>
          </section>

          <section className="legal-section">
            <div className="section-title">
              <CheckCircle size={20} />
              <h2>3. Premium & Subscriptions</h2>
            </div>
            <p>
              Certain features are reserved for Premium or Platinum subscribers.
            </p>
            <ul>
              <li>Payments are processed via secure third-party providers (Stripe).</li>
              <li>Subscriptions are generally non-refundable.</li>
              <li>We reserve the right to modify pricing with prior notice.</li>
            </ul>
          </section>

          <section className="legal-section disclaimer">
            <h2>Disclaimer</h2>
            <p>
              Verix is provided "as is". We are not responsible for any data loss or server issues. 
              The bot is constantly evolving and features may change over time.
            </p>
          </section>
        </main>
      </div>

      <style jsx>{`
        .legal-container {
          min-height: 100vh;
          background: #0a0a0c;
          color: #ffffff;
          padding: 60px 20px;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        .background-glow {
          position: absolute;
          top: -10%;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          height: 500px;
          background: radial-gradient(circle, rgba(88, 101, 242, 0.15) 0%, rgba(0,0,0,0) 70%);
          pointer-events: none;
        }

        .content-wrapper {
          max-width: 900px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .btn-back {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #a0a0a0;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 40px;
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-back:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          transform: translateX(-5px);
        }

        .legal-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .verix-logo {
          width: 120px;
          height: auto;
          margin-bottom: 30px;
          filter: drop-shadow(0 0 20px rgba(88, 101, 242, 0.3));
        }

        .icon-wrapper {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #5865f2, #4752c4);
          color: white;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          box-shadow: 0 10px 30px rgba(88, 101, 242, 0.3);
        }

        h1 {
          font-size: 3.5rem;
          font-weight: 900;
          letter-spacing: -2px;
          margin-bottom: 12px;
          background: linear-gradient(to bottom, #ffffff, #a0a0a0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .last-updated {
          color: #666;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .legal-glass-card {
          background: rgba(15, 15, 18, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 32px;
          padding: 60px;
          backdrop-filter: blur(20px);
          box-shadow: 0 40px 100px rgba(0,0,0,0.5);
        }

        .legal-section {
          margin-bottom: 50px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
          color: #5865f2;
        }

        .section-title h2 {
          font-size: 1.6rem;
          font-weight: 800;
          margin: 0;
          color: #ffffff;
        }

        .legal-section p {
          line-height: 1.8;
          color: #b0b0b0;
          font-size: 1.1rem;
        }

        ul {
          list-style: none;
          padding: 0;
          margin-top: 20px;
        }

        li {
          position: relative;
          padding-left: 28px;
          margin-bottom: 15px;
          color: #d0d0d0;
          font-weight: 500;
        }

        li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 10px;
          width: 8px;
          height: 8px;
          background: #5865f2;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(88, 101, 242, 0.5);
        }

        .disclaimer {
          margin-top: 60px;
          padding-top: 40px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          text-align: center;
        }

        .disclaimer h2 {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 10px;
        }

        .disclaimer p {
          font-size: 0.95rem;
          color: #555;
        }

        @media (max-width: 768px) {
          .legal-glass-card { padding: 30px; }
          h1 { font-size: 2.5rem; }
        }
      `}</style>
    </div>
  );
}
