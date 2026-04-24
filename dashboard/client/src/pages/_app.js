import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  // Decide if we should wrap with Layout
  // Generally, any page under /config/[guildId] needs the layout
  const isConfigPage = router.pathname.startsWith('/config/[guildId]');

  return (
    <ErrorBoundary>
      <Head>
        <title>Verix Panel</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AuthProvider>
        {isConfigPage ? (
          <Layout guildId={router.query.guildId}>
            <Component {...pageProps} />
          </Layout>
        ) : (
          <Component {...pageProps} />
        )}
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
