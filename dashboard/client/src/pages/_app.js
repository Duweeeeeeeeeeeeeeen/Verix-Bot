import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider, useT } from '../contexts/LanguageContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import ErrorBoundary from '../components/ErrorBoundary';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

import { useState, useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen';

// Map route paths to human-readable page titles
const PAGE_TITLES = {
  '/': 'Home',
  '/selector': 'Selezione Server',
  '/config/[guildId]': 'Dashboard',
  '/config/[guildId]/whitelist': 'Whitelist',
  '/config/[guildId]/tickets': 'Tickets',
  '/config/[guildId]/voice': 'Whitelist Vocale',
  '/config/[guildId]/support': 'Assistenza Vocale',
  '/config/[guildId]/verify': 'Verifica',
  '/config/[guildId]/fivem': 'FiveM',
  '/config/[guildId]/giveaway': 'Giveaway',
  '/config/[guildId]/photocontest': 'Photo Contest',
  '/config/[guildId]/socials': 'Social Notifiche',
  '/config/[guildId]/welcome': 'Benvenuto',
  '/config/[guildId]/embeds': 'Embed Suite',
  '/config/[guildId]/autoclear': 'AutoClear',
  '/config/[guildId]/moderation': 'Moderazione',
  '/config/[guildId]/management': 'Gestione',
  '/config/[guildId]/global': 'Config Globali',
  '/config/[guildId]/system': 'Sistema',
  '/config/[guildId]/guide': 'Guida',
  '/config/[guildId]/tempvoice': 'TempVoice',
};

function NavLoading() {
  const { t } = useT();
  return <LoadingScreen message={t('loading.navigation')} />;
}

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
  
  const pageName = PAGE_TITLES[router.pathname];
  const pageTitle = pageName ? `${pageName} — Verix Panel` : 'Verix Panel';

  // Decide if we should wrap with Layout
  // Generally, any page under /config/[guildId] needs the layout
  const isConfigPage = router.pathname.startsWith('/config/[guildId]');

  return (
    <ErrorBoundary>
      <Head>
        <title>{pageTitle}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Verix Bot Administration Panel — manage modules, tickets, whitelist and more." />
      </Head>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            {isNavigating && <NavLoading />}
            {isConfigPage ? (
              <Layout guildId={router.query.guildId}>
                <Component {...pageProps} />
              </Layout>
            ) : (
              <Component {...pageProps} />
            )}
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
