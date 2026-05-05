import Head from 'next/head';
import Link from 'next/link';
import { ChevronLeft, Shield, Eye, Lock } from 'lucide-react';

export default function PrivacyPolicy() {
    const lastUpdate = "5 Maggio 2026";

    return (
        <div className="policy-container">
            <Head>
                <title>Privacy Policy | Verix Bot</title>
                <meta name="description" content="Informativa sulla privacy di Verix Bot." />
            </Head>

            <nav className="policy-nav">
                <Link href="/" className="back-link">
                    <ChevronLeft size={20} /> Torna alla Home
                </Link>
                <div className="brand">Verix</div>
            </nav>

            <main className="policy-content">
                <header className="content-header">
                    <div className="icon-badge">
                        <Shield size={32} />
                    </div>
                    <h1>Informativa sulla Privacy</h1>
                    <p className="update-date">Ultimo aggiornamento: {lastUpdate}</p>
                </header>

                <section className="policy-section">
                    <h2>1. Informazioni che Raccogliamo</h2>
                    <p>
                        Verix Bot raccoglie solo i dati strettamente necessari per il funzionamento del servizio. Questi includono:
                    </p>
                    <ul>
                        <li><strong>Dati di Discord:</strong> ID utente, ID server, ID canali, ruoli e avatar per gestire permessi e configurazioni.</li>
                        <li><strong>Log del Bot:</strong> Registrazioni di azioni di moderazione, aperture di ticket e attività della whitelist (IP se forniti volontariamente per whitelist server).</li>
                        <li><strong>Dati di Pagamento:</strong> Se sottoscrivi un piano Premium, i dati di pagamento sono gestiti interamente da processori terzi (Stripe/PayPal). Verix non memorizza mai i dettagli della tua carta di credito.</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2>2. Come Utilizziamo i Dati</h2>
                    <p>
                        I dati raccolti vengono utilizzati esclusivamente per:
                    </p>
                    <ul>
                        <li>Fornire le funzionalità del bot richieste dai proprietari dei server.</li>
                        <li>Gestire gli abbonamenti Premium e Platinum.</li>
                        <li>Fornire supporto tecnico tramite la dashboard o il server Discord.</li>
                        <li>Prevenire abusi e garantire la sicurezza del bot e dei server.</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2>3. Conservazione dei Dati</h2>
                    <p>
                        I dati vengono conservati finché il bot è presente nel server o finché l'utente non richiede la cancellazione. I log dei ticket e della moderazione possono essere cancellati manualmente dagli amministratori del server in qualsiasi momento tramite la dashboard.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>4. Condivisione dei Dati con Terze Parti</h2>
                    <p>
                        Verix non vende né affitta i tuoi dati a terzi. Condividiamo informazioni solo quando necessario per fornire il servizio (es. con Discord per le API o con i processori di pagamento per gli abbonamenti).
                    </p>
                </section>

                <section className="policy-section">
                    <h2>5. I Tuoi Diritti (GDPR)</h2>
                    <p>
                        Se sei un utente residente nell'Unione Europea, hai il diritto di accedere, rettificare o cancellare i tuoi dati personali. Puoi richiedere la cancellazione totale dei tuoi dati archiviati da Verix contattando il team di supporto nel server ufficiale.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>6. Sicurezza</h2>
                    <p>
                        Adottiamo misure tecniche avanzate per proteggere i tuoi dati, inclusa la crittografia dei token sensibili e l'accesso limitato al database.
                    </p>
                </section>
            </main>

            <style jsx>{`
                .policy-container {
                    min-height: 100vh;
                    background: var(--bg-dark);
                    color: var(--text-main);
                    font-family: 'Inter', sans-serif;
                }
                .policy-nav {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 40px;
                    background: rgba(0,0,0,0.2);
                    backdrop-filter: blur(10px);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    border-bottom: 1px solid var(--border);
                }
                .back-link {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--text-muted);
                    text-decoration: none;
                    font-weight: 600;
                    transition: 0.2s;
                }
                .back-link:hover { color: var(--primary); }
                .brand { font-weight: 900; font-size: 1.5rem; letter-spacing: -1px; }

                .policy-content {
                    max-width: 800px;
                    margin: 60px auto;
                    padding: 0 20px;
                }
                .content-header { text-align: center; margin-bottom: 60px; }
                .icon-badge {
                    width: 64px; height: 64px; background: rgba(59, 130, 246, 0.1);
                    color: #3b82f6; border-radius: 16px; margin: 0 auto 20px;
                    display: flex; align-items: center; justify-content: center;
                }
                h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 10px; }
                .update-date { color: var(--text-muted); font-size: 0.9rem; }

                .policy-section { margin-bottom: 40px; line-height: 1.6; }
                h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 15px; color: #3b82f6; }
                p { color: var(--text-muted); margin-bottom: 15px; }
                ul { padding-left: 20px; color: var(--text-muted); }
                li { margin-bottom: 10px; }

                @media (max-width: 768px) {
                    .policy-nav { padding: 15px 20px; }
                    h1 { font-size: 2rem; }
                }
            `}</style>
        </div>
    );
}
