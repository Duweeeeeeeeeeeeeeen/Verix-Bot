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

function TopProgressBar({ isAnimating }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (isAnimating) {
      setWidth(30);
      const timer = setInterval(() => {
        setWidth(prev => {
          if (prev >= 90) return prev;
          return prev + 5;
        });
      }, 400);
      return () => clearInterval(timer);
    } else {
      setWidth(100);
    }
  }, [isAnimating]);

  return (
    <div 
      className="top-progress-bar" 
      style={{ 
        width: `${width}%`, 
        opacity: isAnimating || width < 100 ? 1 : 0,
        transition: width === 100 ? 'width 0.2s, opacity 0.4s 0.2s' : 'width 0.4s'
      }} 
    />
  );
}

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    let timer;
    const handleStart = (url) => {
      if (url !== router.asPath) {
        setIsNavigating(true); // Immediate for top bar
        // Only show full-screen loader if navigation takes more than 1000ms
        timer = setTimeout(() => {
          window.dispatchEvent(new CustomEvent('show-full-loader'));
        }, 1000);
      }
    };
    const handleComplete = () => {
      clearTimeout(timer);
      setIsNavigating(false);
      setShowFullLoader(false);
    };

    const handleShowFullLoader = () => setShowFullLoader(true);
    window.addEventListener('show-full-loader', handleShowFullLoader);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('show-full-loader', handleShowFullLoader);
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router.asPath]);

  const [showFullLoader, setShowFullLoader] = useState(false);
  
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
            <TopProgressBar isAnimating={isNavigating} />
            {showFullLoader && <NavLoading />}
            {isConfigPage ? (
              <Layout guildId={router.query.guildId} isNavigating={isNavigating}>
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
