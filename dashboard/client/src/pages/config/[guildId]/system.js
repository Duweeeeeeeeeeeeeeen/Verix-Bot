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
  HelpCircle,
  Save,
  MessageSquare,
  Shield,
  Layout,
  Globe
} from 'lucide-react';
import Head from 'next/head';

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

  if (!mounted || loading) return <Skeleton height="600px" />;

  const handleSave = () => {
      window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: t('common.saved_success'), type: 'success' } 
      }));
  };

  return (
    <div className="pc-premium-wrapper fade-in">
        <Head>
            <title>{t('system.title')} | Verix Dashboard</title>
        </Head>

        {/* V2 Header */}
        <header className="pc-header-v2">
            <div className="header-info">
                <div className="pc-icon-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
                    <Settings size={28} />
                </div>
                <div className="pc-title-row">
                    <h1>{t('system.messages')}</h1>
                    <div className="pc-status-tag-v2 on">
                        <div className="status-dot-v2"></div>
                        {t('system.global_tag')}
                    </div>
                </div>
            </div>
            
            <div className="header-controls">
                <button className="pc-btn-primary" onClick={handleSave}>
                    <Save size={18} />
                    <span>{t('common.save_all')}</span>
                </button>
            </div>
        </header>

        <div className="pc-content-v2">
            <section className="pc-card-v2">
                <div className="card-header-v2">
                    <div className="header-icon" style={{ background: 'var(--bg-badge)', color: 'var(--primary)' }}><MessageSquare size={18} /></div>
                    <h3 style={{ margin: 0 }}>{t('system.custom_resp')}</h3>
                </div>
                <div className="card-body-v2">
                    <EmbedMessageManager 
                        guildId={guildId}
                        module="system"
                        slugs={[
                            { key: 'no_permission', label: t('system.no_perm'), description: t('system.no_perm_desc'), variables: ['user', 'guild'], group: t('system.security'), groupIcon: Shield },
                            { key: 'module_disabled', label: t('system.mod_disabled'), description: t('system.mod_disabled_desc'), variables: ['user', 'module'], group: t('system.security'), groupIcon: Shield },
                            { key: 'role_hierarchy', label: t('system.role_hierarchy'), description: t('system.role_hierarchy_desc'), variables: ['user', 'role'], group: t('system.security'), groupIcon: Shield },
                            { key: 'generic_error', label: t('system.generic_err'), description: t('system.generic_err_desc'), variables: ['user', 'error'], group: t('system.system'), groupIcon: Layout },
                            { key: 'setup_success', label: t('system.setup_success'), description: t('system.setup_success_desc'), variables: ['user', 'guild'], group: t('system.system'), groupIcon: Layout },
                            { key: 'module_list', label: t('system.mod_list'), description: t('system.mod_list_desc'), variables: ['user', 'modules'], group: t('system.commands'), groupIcon: Globe },
                            { key: 'module_enabled', label: t('system.mod_enabled'), description: t('system.mod_enabled_desc'), variables: ['user', 'module'], group: t('system.commands'), groupIcon: Globe },
                            { key: 'module_disabled_success', label: t('system.mod_disabled_success'), description: t('system.mod_disabled_success_desc'), variables: ['user', 'module'], group: t('system.commands'), groupIcon: Globe },
                            { key: 'module_already_in_state', label: t('system.mod_already_state'), description: t('system.mod_already_state_desc'), variables: ['user', 'module', 'state'], group: t('system.commands'), groupIcon: Globe },
                            { key: 'module_not_found', label: t('system.mod_not_found'), description: t('system.mod_not_found_desc'), variables: ['user', 'module'], group: t('system.commands'), groupIcon: Globe }
                        ]}
                    />
                </div>
            </section>
        </div>

        <style jsx>{`
            .pc-premium-wrapper { padding: 32px; max-width: 1500px; margin: 0 auto; font-family: 'Inter', sans-serif; }
            
            /* Header V2 */
            .pc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: var(--bg-card); padding: 24px; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .pc-icon-box { width: 52px; height: 52px; color: #fff; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
            .pc-title-row h1 { font-family: 'Inter'; font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-heading); letter-spacing: normal; }
            
            .pc-status-tag-v2 { display: flex; align-items: center; gap: 6px; font-size: 0.6rem; font-weight: 700; padding: 4px 10px; border-radius: 100px;  width: fit-content; }
            .pc-status-tag-v2.on { background: rgba(16, 185, 129, 0.1); color: #10b981; }
            .status-dot-v2 { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

            .pc-btn-primary { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
            .pc-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }

            /* Cards */
            .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 32px; box-shadow: var(--shadow-premium); }
            .card-header-v2 { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
            .header-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
            .card-header-v2 h3 { margin: 0; font-family: 'Inter'; font-size: 1.3rem; font-weight: 700; color: var(--text-heading); }

            .v-stack { display: flex; flex-direction: column; }
            .animate { animation: slideUp 0.4s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
}
