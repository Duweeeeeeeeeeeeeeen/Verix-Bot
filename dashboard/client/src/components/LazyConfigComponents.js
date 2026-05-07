import dynamic from 'next/dynamic';

const configFallback = () => <div className="config-component-skeleton" />;

export const DesignSectionManager = dynamic(() => import('./DesignSectionManager'), {
  ssr: false,
  loading: configFallback
});

export const DiscordSelector = dynamic(() => import('./DiscordSelector'), {
  ssr: false,
  loading: configFallback
});

export const EmbedEditor = dynamic(() => import('./EmbedEditor'), {
  ssr: false,
  loading: configFallback
});

export const EmbedMessageManager = dynamic(() => import('./EmbedMessageManager'), {
  ssr: false,
  loading: configFallback
});

export const NotificationSettings = dynamic(() => import('./NotificationSettings'), {
  ssr: false,
  loading: configFallback
});

export const OnboardingWizard = dynamic(() => import('./OnboardingWizard'), {
  ssr: false,
  loading: configFallback
});
