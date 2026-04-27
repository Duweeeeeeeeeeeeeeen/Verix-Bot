import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

import { useState, useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const handleStart = (url) => {
      if (url !== router.asPath) setIsNavigating(true);
    };
    const handleComplete = () => setIsNavigating(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router.asPath]);
  
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
        {isNavigating && <LoadingScreen message="Navigazione..." />}
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
