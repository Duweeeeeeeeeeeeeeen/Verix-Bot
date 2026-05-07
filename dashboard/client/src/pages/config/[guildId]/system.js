import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '../../../components/Skeleton';
import { EmbedMessageManager } from '../../../components/LazyConfigComponents';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';
import { 
  Settings, 
  ShieldAlert, 
  BellRing,
  HelpCircle
} from 'lucide-react';

export default function SystemConfig() {
  const { t } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (guildId) {
        setLoading(false);
        window.dispatchEvent(new CustomEvent('update-guide-context', { detail: {} }));
    }
  }, [guildId]);

  if (!mounted || loading) return (
    <div className="config-page-layout animate">
      <div className="config-main-col">
        <Skeleton width="300px" height="40px" style={{ marginBottom: '40px' }} />
        <Skeleton height="600px" />
      </div>
    </div>
  );

  return (
    <div className="config-page-layout animate">
      <div className="config-main-col">
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Settings size={24} />
              </div>
              <div className="header-text">
                <h1>{t('system_config.title')}</h1>
                <p>{t('system_config.desc')}</p>
              </div>
           </div>
           <div className="header-buttons">
              <button onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t('common.saved_success'), type: 'success' } }))} className="btn-primary">
                 <Settings size={16} /> {t('system_config.save')}
              </button>
           </div>
        </header>

        <div className="card glass-dark" style={{ marginBottom: '32px', padding: '32px' }}>
            <EmbedMessageManager 
                guildId={guildId}
                module="system"
                 slugs={[
                    { 
                        key: 'no_permission', 
                        label: t('system_config.no_permission_label'), 
                        description: t('system_config.no_permission_desc'),
                        variables: ['user', 'guild'] 
                    },
                    { 
                        key: 'module_disabled', 
                        label: t('system_config.module_disabled_label'), 
                        description: t('system_config.module_disabled_desc'),
                        variables: ['user', 'module'] 
                    },
                    { 
                        key: 'role_hierarchy', 
                        label: t('system_config.role_hierarchy_label'), 
                        description: t('system_config.role_hierarchy_desc'),
                        variables: ['user', 'role'] 
                    },
                    { 
                        key: 'generic_error', 
                        label: t('system_config.generic_error_label'), 
                        description: t('system_config.generic_error_desc'),
                        variables: ['user', 'error'] 
                    },
                    { 
                        key: 'setup_success', 
                        label: t('system_config.setup_success_label'), 
                        description: t('system_config.setup_success_desc'),
                        variables: ['user', 'guild'] 
                    },
                    { 
                        key: 'module_list', 
                        label: t('system_config.module_list_label'), 
                        description: t('system_config.module_list_desc'),
                        variables: ['user', 'modules'] 
                    },
                    { 
                        key: 'module_enabled', 
                        label: t('system_config.module_enabled_label'), 
                        description: t('system_config.module_enabled_desc'),
                        variables: ['user', 'module'] 
                    },
                    { 
                        key: 'module_disabled_success', 
                        label: t('system_config.module_disabled_success_label'), 
                        description: t('system_config.module_disabled_success_desc'),
                        variables: ['user', 'module'] 
                    },
                    { 
                        key: 'module_already_in_state', 
                        label: t('system_config.module_already_in_state_label'), 
                        description: t('system_config.module_already_in_state_desc'),
                        variables: ['user', 'module', 'state'] 
                    },
                    { 
                        key: 'module_not_found', 
                        label: t('system_config.module_not_found_label'), 
                        description: t('system_config.module_not_found_desc'),
                        variables: ['user', 'module'] 
                    }
                ]}
            />
        </div>
      </div>

      <style jsx>{`
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-badge); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: var(--bg-elevated-hover); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }
            .glass-dark { background: var(--bg-badge); border: 1px solid var(--border); border-radius: 24px; }
        `}</style>
    </div>
  );
}
