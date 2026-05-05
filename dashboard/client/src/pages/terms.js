import Head from 'next/head';
import Link from 'next/link';
import { ChevronLeft, Shield, Gavel, Scale } from 'lucide-react';

export default function TermsOfService() {
    const lastUpdate = "5 Maggio 2026";

    return (
        <div className="policy-container">
            <Head>
                <title>Termini di Servizio | Verix Bot</title>
                <meta name="description" content="Termini di servizio e condizioni d'uso di Verix Bot." />
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
                        <Gavel size={32} />
                    </div>
                    <h1>Termini di Servizio</h1>
                    <p className="update-date">Ultimo aggiornamento: {lastUpdate}</p>
                </header>

                <section className="policy-section">
                    <h2>1. Accettazione dei Termini</h2>
                    <p>
                        Utilizzando Verix Bot e i suoi servizi correlati (il "Servizio"), l'utente accetta di essere vincolato dai presenti Termini di Servizio. Se non si accettano tali termini, è necessario interrompere immediatamente l'utilizzo del bot e rimuoverlo dai propri server Discord.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>2. Descrizione del Servizio</h2>
                    <p>
                        Verix è un bot multifunzionale per Discord progettato per la gestione di server, automazione, sicurezza (whitelist), ticket e analytics. Il servizio è fornito "così com'è" e può subire modifiche o interruzioni in qualsiasi momento.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>3. Piani Premium e Platinum</h2>
                    <p>
                        Alcune funzionalità di Verix sono riservate agli utenti che sottoscrivono un abbonamento Premium o Platinum.
                    </p>
                    <ul>
                        <li>I pagamenti sono gestiti tramite processori terzi sicuri.</li>
                        <li>Gli abbonamenti non sono rimborsabili, salvo casi eccezionali valutati dal team di supporto.</li>
                        <li>La violazione dei termini di Discord o dei presenti termini può comportare la revoca dell'accesso ai servizi premium senza rimborso.</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2>4. Utilizzo Appropriato</h2>
                    <p>
                        L'utente si impegna a non utilizzare Verix per:
                    </p>
                    <ul>
                        <li>Violare le Condizioni d'uso di Discord.</li>
                        <li>Spammare o disturbare gli utenti.</li>
                        <li>Tentare di hackerare, decodificare o interrompere il funzionamento del bot.</li>
                        <li>Gestire contenuti illegali o dannosi tramite i moduli del bot (es. ticket o whitelist).</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2>5. Limitazione di Responsabilità</h2>
                    <p>
                        Il team di Verix non è responsabile per eventuali danni derivanti dall'uso del bot, inclusi ma non limitati a: perdita di dati del server, ban di utenti o interruzioni del servizio dovute a problemi tecnici di terze parti (es. Discord API).
                    </p>
                </section>

                <section className="policy-section">
                    <h2>6. Modifiche ai Termini</h2>
                    <p>
                        Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. Gli utenti verranno informati delle modifiche significative tramite il server di supporto ufficiale.
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
                    width: 64px; height: 64px; background: var(--primary-glow);
                    color: var(--primary); border-radius: 16px; margin: 0 auto 20px;
                    display: flex; align-items: center; justify-content: center;
                }
                h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 10px; }
                .update-date { color: var(--text-muted); font-size: 0.9rem; }

                .policy-section { margin-bottom: 40px; line-height: 1.6; }
                h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 15px; color: var(--primary); }
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
