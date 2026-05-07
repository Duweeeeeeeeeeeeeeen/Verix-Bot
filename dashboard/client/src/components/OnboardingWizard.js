import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Shield, 
  ListChecks,
  Zap,
  Globe,
  Settings,
  ArrowRight,
  ShieldCheck,
  Ticket,
  UserCheck,
  Save,
  Rocket
} from 'lucide-react';
import api from '../utils/api';
import CustomSelect from './CustomSelect';
import { useT } from '../contexts/LanguageContext';

export default function OnboardingWizard({ config, guildId }) {
  const { t, setLanguage } = useT();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Onboarding State
  const [formData, setFormData] = useState({
    language: 'it',
    adminRoleIds: [],
    logChannelId: '',
    modules: {
      whitelist: true,
      tickets: true,
      verify: true
    },
    config: {
      whitelist: {
        categoryOpenId: '',
        whitelistRole: ''
      },
      tickets: {
        categoryOpenId: '',
        staffRoleIds: []
      },
      verify: {
        channelId: '',
        roleId: ''
      }
    }
  });

  // Load current config if exists
  useEffect(() => {
    if (config) {
      setFormData(prev => ({
        ...prev,
        language: config.globalConfig?.language || 'it',
        adminRoleIds: config.globalConfig?.adminRoleIds || [],
        logChannelId: config.globalConfig?.logs?.channelId || '',
        modules: {
          whitelist: config.whitelist?.enabled ?? true,
          tickets: config.tickets?.enabled ?? true,
          verify: config.verify?.enabled ?? true
        },
        config: {
          whitelist: {
            categoryOpenId: config.whitelist?.categoryOpenId || '',
            whitelistRole: config.whitelist?.rolesToAddOnTextPass?.[0] || ''
          },
          tickets: {
            categoryOpenId: config.tickets?.categoryOpenId || '',
            staffRoleIds: config.tickets?.staffRoleIds || []
          },
          verify: {
            channelId: config.verify?.channelId || '',
            roleId: config.verify?.roleId || ''
          }
        }
      }));
    }
  }, [config]);

  if (!config) return null;

  // If already configured (Staff roles + Log channel set), don't show the wizard unless success state is active
  const isConfigured = config.globalConfig?.adminRoleIds?.length > 0 && config.globalConfig?.logs?.channelId;
  if (isConfigured && !success) return null;

  const roles = config.roles || [];
  const channels = config.channels || [];
  const categories = channels.filter(c => c.type === 4); // 4 is Category
  const textChannels = channels.filter(c => c.type === 0); // 0 is Text

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request(`/config/${guildId}/onboarding`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setSuccess(true);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: t('onboarding.success.toast'), type: 'success' } 
      }));
      // Redirect to home or refresh
      setTimeout(() => router.reload(), 2000);
    } catch (error) {
      console.error('Onboarding error:', error);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: t('common.error'), type: 'error' } 
      }));
    } finally {
      setSaving(false);
    }
  };

  const progress = (step / 4) * 100;

  // Render Step 1: Base Settings
  const renderStep1 = () => (
    <div className="wizard-step animate slide-in">
      <div className="step-header">
        <div className="step-badge">{t('onboarding.step1.label', { step: 1, total: 4 }) || `Passo 1 di 4`}</div>
        <h2>{t('onboarding.step1.title')}</h2>
        <p>{t('onboarding.step1.desc')}</p>
      </div>

      <div className="step-content">
        <div className="form-group">
          <label className="text-label">{t('onboarding.step1.lang')}</label>
          <div className="stylized-select-wrapper">
            <CustomSelect 
              options={[
                { value: 'it', label: 'Italiano 🇮🇹' },
                { value: 'en', label: 'English 🇺🇸' }
              ]} 
              value={formData.language} 
              onChange={val => {
                setFormData({...formData, language: val});
                setLanguage(val); // Sync dashboard language too
              }} 
            />
          </div>
        </div>

        <div className="form-group">
          <label className="text-label">{t('onboarding.step1.staff')}</label>
          <p className="field-desc">{t('onboarding.step1.staff_desc')}</p>
          <div className="roles-selector-p">
            {roles.filter(r => r.name !== '@everyone').map(role => (
              <button 
                key={role.id}
                className={`role-tag-p ${formData.adminRoleIds.includes(role.id) ? 'active' : ''}`}
                onClick={() => {
                  const newRoles = formData.adminRoleIds.includes(role.id)
                    ? formData.adminRoleIds.filter(id => id !== role.id)
                    : [...formData.adminRoleIds, role.id];
                  setFormData({...formData, adminRoleIds: newRoles});
                }}
              >
                <div className="role-color-dot" style={{ backgroundColor: role.color }}></div>
                {role.name}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="text-label">{t('onboarding.step1.logs')}</label>
          <p className="field-desc">{t('onboarding.step1.logs_desc')}</p>
          <div className="stylized-select-wrapper">
            <CustomSelect 
              options={[
                { value: '', label: t('common.select_channel') },
                ...textChannels.map(c => ({ value: c.id, label: `# ${c.name}` }))
              ]} 
              value={formData.logChannelId} 
              onChange={val => setFormData({...formData, logChannelId: val})} 
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render Step 2: Module Toggles
  const renderStep2 = () => (
    <div className="wizard-step animate slide-in">
      <div className="step-header">
        <div className="step-badge">{t('onboarding.step2.label', { step: 2, total: 4 }) || `Passo 2 di 4`}</div>
        <h2>{t('onboarding.step2.title')}</h2>
        <p>{t('onboarding.step2.desc')}</p>
      </div>

      <div className="step-content modules-toggle-grid">
        {[
          { id: 'whitelist', label: t('onboarding.step2.whitelist'), icon: ShieldCheck, desc: t('onboarding.step2.whitelist_desc') },
          { id: 'tickets', label: t('onboarding.step2.tickets'), icon: Ticket, desc: t('onboarding.step2.tickets_desc') },
          { id: 'verify', label: t('onboarding.step2.verify'), icon: UserCheck, desc: t('onboarding.step2.verify_desc') }
        ].map(mod => (
          <div 
            key={mod.id} 
            className={`module-select-card ${formData.modules[mod.id] ? 'active' : ''}`}
            onClick={() => setFormData({
              ...formData, 
              modules: { ...formData.modules, [mod.id]: !formData.modules[mod.id] }
            })}
          >
            <div className="mod-icon">
              <mod.icon size={24} />
            </div>
            <div className="mod-info">
              <h3>{mod.label}</h3>
              <p>{mod.desc}</p>
            </div>
            <div className="mod-check">
              <div className={`checkbox-custom ${formData.modules[mod.id] ? 'checked' : ''}`}>
                {formData.modules[mod.id] && <CheckCircle2 size={16} />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Step 3: Minimal Config
  const renderStep3 = () => (
    <div className="wizard-step animate slide-in">
      <div className="step-header">
        <div className="step-badge">{t('onboarding.step3.label', { step: 3, total: 4 }) || `Passo 3 di 4`}</div>
        <h2>{t('onboarding.step3.title')}</h2>
        <p>{t('onboarding.step3.desc')}</p>
      </div>

      <div className="step-content scrollable-p">
        {formData.modules.whitelist && (
          <div className="config-section-p animate fade-in">
            <div className="section-header-p">
              <ShieldCheck size={20} color="var(--primary)" />
              <h3>{t('sidebar.whitelist')}</h3>
            </div>
            <div className="form-grid-p">
              <div className="form-group">
                <label className="text-label">{t('onboarding.step3.category_whitelist')}</label>
                <div className="stylized-select-wrapper">
                  <CustomSelect 
                    options={[
                      { value: '', label: t('onboarding.step3.category_whitelist_placeholder') },
                      ...categories.map(c => ({ value: c.id, label: c.name }))
                    ]} 
                    value={formData.config.whitelist.categoryOpenId} 
                    onChange={val => setFormData({
                      ...formData, 
                      config: { ...formData.config, whitelist: { ...formData.config.whitelist, categoryOpenId: val } }
                    })} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="text-label">{t('onboarding.step3.whitelist_role')}</label>
                <div className="stylized-select-wrapper">
                  <CustomSelect 
                    options={[
                      { value: '', label: t('onboarding.step3.whitelist_role_placeholder') },
                      ...roles.map(r => ({ value: r.id, label: r.name }))
                    ]} 
                    value={formData.config.whitelist.whitelistRole} 
                    onChange={val => setFormData({
                      ...formData, 
                      config: { ...formData.config, whitelist: { ...formData.config.whitelist, whitelistRole: val } }
                    })} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {formData.modules.tickets && (
          <div className="config-section-p animate fade-in" style={{ marginTop: '24px' }}>
            <div className="section-header-p">
              <Ticket size={20} color="#3b82f6" />
              <h3>{t('sidebar.tickets')}</h3>
            </div>
            <div className="form-grid-p">
              <div className="form-group">
                <label className="text-label">{t('onboarding.step3.category_tickets')}</label>
                <div className="stylized-select-wrapper">
                  <CustomSelect 
                    options={[
                      { value: '', label: t('onboarding.step3.category_whitelist_placeholder') },
                      ...categories.map(c => ({ value: c.id, label: c.name }))
                    ]} 
                    value={formData.config.tickets.categoryOpenId} 
                    onChange={val => setFormData({
                      ...formData, 
                      config: { ...formData.config, tickets: { ...formData.config.tickets, categoryOpenId: val } }
                    })} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="text-label">{t('onboarding.step3.staff_tickets')}</label>
                <div className="roles-selector-p">
                  {roles.filter(r => r.name !== '@everyone').map(role => (
                    <button 
                      key={role.id}
                      className={`role-tag-p ${formData.config.tickets.staffRoleIds.includes(role.id) ? 'active' : ''}`}
                      onClick={() => {
                        const newRoles = formData.config.tickets.staffRoleIds.includes(role.id)
                          ? formData.config.tickets.staffRoleIds.filter(id => id !== role.id)
                          : [...formData.config.tickets.staffRoleIds, role.id];
                        setFormData({
                          ...formData,
                          config: { ...formData.config, tickets: { ...formData.config.tickets, staffRoleIds: newRoles } }
                        });
                      }}
                    >
                      {role.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {formData.modules.verify && (
          <div className="config-section-p animate fade-in" style={{ marginTop: '24px' }}>
            <div className="section-header-p">
              <UserCheck size={20} color="var(--primary)" />
              <h3>{t('sidebar.verify')}</h3>
            </div>
            <div className="form-grid-p">
              <div className="form-group">
                <label className="text-label">{t('onboarding.step3.verify_channel')}</label>
                <div className="stylized-select-wrapper">
                  <CustomSelect 
                    options={[
                      { value: '', label: t('onboarding.step3.verify_channel_placeholder') },
                      ...textChannels.map(c => ({ value: c.id, label: `# ${c.name}` }))
                    ]} 
                    value={formData.config.verify.channelId} 
                    onChange={val => setFormData({
                      ...formData, 
                      config: { ...formData.config, verify: { ...formData.config.verify, channelId: val } }
                    })} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="text-label">{t('onboarding.step3.verify_role')}</label>
                <div className="stylized-select-wrapper">
                  <CustomSelect 
                    options={[
                      { value: '', label: t('onboarding.step3.whitelist_role_placeholder') },
                      ...roles.map(r => ({ value: r.id, label: r.name }))
                    ]} 
                    value={formData.config.verify.roleId} 
                    onChange={val => setFormData({
                      ...formData, 
                      config: { ...formData.config, verify: { ...formData.config.verify, roleId: val } }
                    })} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render Step 4: Summary
  const renderStep4 = () => (
    <div className="wizard-step animate slide-in">
      <div className="step-header">
        <div className="step-badge">{t('onboarding.step4.label', { step: 4, total: 4 }) || `Passo 4 di 4`}</div>
        <h2>{t('onboarding.step4.title')}</h2>
        <p>{t('onboarding.step4.desc')}</p>
      </div>

      <div className="step-content summary-p">
        <div className="summary-card-p">
          <div className="summary-row-p">
            <span className="summary-label-p">{t('onboarding.step4.lang_label')}</span>
            <span className="summary-value-p">{formData.language === 'it' ? 'Italiano 🇮🇹' : 'English 🇺🇸'}</span>
          </div>
          <div className="summary-row-p">
            <span className="summary-label-p">{t('onboarding.step4.staff_label')}</span>
            <span className="summary-value-p">{t('onboarding.step4.staff_value', { count: formData.adminRoleIds.length })}</span>
          </div>
          <div className="summary-row-p">
            <span className="summary-label-p">{t('onboarding.step4.modules_label')}</span>
            <div className="summary-tags-p">
              {formData.modules.whitelist && <span className="tag-p">{t('sidebar.whitelist')}</span>}
              {formData.modules.tickets && <span className="tag-p">{t('sidebar.tickets')}</span>}
              {formData.modules.verify && <span className="tag-p">{t('sidebar.verify')}</span>}
            </div>
          </div>
        </div>

        <div className="final-notice-p">
          <Rocket size={24} />
          <div>
            <h4>{t('onboarding.step4.ready')}</h4>
            <p>{t('onboarding.step4.notice')}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="success-state-p animate fade-in">
      <div className="success-icon-p">
        <CheckCircle2 size={64} />
      </div>
      <h2>{t('onboarding.success.title')}</h2>
      <p>{t('onboarding.success.desc')}</p>
      <button className="btn-primary" onClick={() => router.reload()}>{t('onboarding.success.btn')}</button>
    </div>
  );

  return (
    <div className="wizard-container-v2 card animate">
      {success ? renderSuccess() : (
        <>
          <div className="wizard-progress-p">
            <div className="progress-track-p">
              <div className="progress-fill-p" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="step-indicators-p">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`indicator-p ${step === s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
                  {step > s ? <CheckCircle2 size={14} /> : s}
                </div>
              ))}
            </div>
          </div>

          <div className="wizard-body-p">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </div>

          <div className="wizard-footer-p">
            {step > 1 && (
              <button className="btn-outline-p" onClick={prevStep} disabled={saving}>
                <ChevronLeft size={18} /> {t('common.back')}
              </button>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
              {step < 4 ? (
                <button className="btn-primary-p" onClick={nextStep}>
                  {t('common.continue')} <ChevronRight size={18} />
                </button>
              ) : (
                <button className="btn-save-p" onClick={handleSave} disabled={saving}>
                  {saving ? <div className="spinner-s"></div> : <><Save size={18} /> {t('common.finalize')}</>}
                </button>
              )}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .wizard-container-v2 {
          max-width: 900px;
          margin: 0 auto 48px auto;
          background: var(--bg-card);
          border-radius: 24px;
          padding: 0;
          overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-premium);
        }

        .wizard-progress-p {
          padding: 40px 64px;
          background: linear-gradient(to bottom, var(--bg-elevated), transparent);
          border-bottom: 1px solid var(--border);
          position: relative;
        }

        .progress-track-p {
          height: 6px;
          background: var(--bg-elevated-hover);
          border-radius: 10px;
          margin-bottom: 32px;
          overflow: hidden;
        }

        .progress-fill-p {
          height: 100%;
          background: var(--primary);
          box-shadow: 0 0 10px var(--primary-glow);
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .step-indicators-p {
          display: flex;
          justify-content: space-between;
          position: relative;
          z-index: 2;
        }

        .indicator-p {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: var(--bg-dark);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-muted);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .indicator-p.active {
          border-color: var(--primary);
          color: var(--text-heading);
          background: rgba(var(--primary-rgb), 0.1);
          box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.3);
          transform: scale(1.15) translateY(-2px);
        }

        .indicator-p.completed {
          background: var(--primary);
          border-color: var(--primary);
          color: var(--text-heading);
        }

        .wizard-body-p {
          padding: 48px;
          min-height: 450px;
        }

        .wizard-step h2 {
          font-size: 1.8rem;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .step-badge {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--primary);
          font-weight: 900;
          margin-bottom: 8px;
        }

        .step-header {
          margin-bottom: 40px;
        }

        .step-header p {
          color: var(--text-muted);
        }

        .form-group {
          margin-bottom: 24px;
        }

        .field-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .roles-selector-p {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        .role-tag-p {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-dim);
          padding: 8px 14px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
        }

        .role-tag-p:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .role-tag-p.active {
          background: rgba(var(--primary-rgb), 0.15);
          border-color: var(--primary);
          color: var(--text-heading);
          box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2);
        }

        .role-color-dot {
          width: 10px;
          height: 10px;
          border-radius: 3px;
          box-shadow: 0 0 5px rgba(0,0,0,0.5);
        }

        .roles-selector-p {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          max-height: 200px;
          overflow-y: auto;
          padding: 20px;
          background: var(--bg-inset);
          border-radius: 16px;
          border: 1px solid var(--border);
        }

        /* Custom Scrollbar for Roles */
        .roles-selector-p::-webkit-scrollbar { width: 4px; }
        .roles-selector-p::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 10px; }

        .select {
          appearance: none;
          background: rgba(15, 23, 42, 0.8) !important;
          border: 1px solid var(--border) !important;
          padding: 16px 20px !important;
          border-radius: 14px !important;
          font-weight: 500;
          color: var(--text-heading) !important;
          cursor: pointer;
        }

        .form-group label {
          margin-bottom: 12px;
          display: block;
        }

        .modules-toggle-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 16px;
        }

        .module-select-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 16px;
          cursor: pointer;
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .module-select-card:hover {
          background: var(--hover-bg);
          border-color: var(--text-muted);
          transform: translateY(-2px);
        }

        .module-select-card.active {
          background: rgba(var(--primary-rgb), 0.05);
          border-color: var(--primary);
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .mod-icon {
          width: 52px;
          height: 52px;
          background: var(--bg-elevated);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: 0.3s;
        }

        .module-select-card.active .mod-icon {
          background: var(--primary);
          color: var(--text-heading);
          box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.4);
        }

        .mod-info { flex: 1; }
        .mod-info h3 { font-size: 1.1rem; margin-bottom: 4px; }
        .mod-info p { font-size: 0.85rem; color: var(--text-muted); }

        .checkbox-custom {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          border: 2px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
        }

        .checkbox-custom.checked {
          background: var(--primary);
          border-color: var(--primary);
          color: var(--text-heading);
        }

        .wizard-footer-p {
          padding: 24px 48px;
          background: var(--bg-elevated);
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
        }

        .btn-primary-p {
          background: var(--primary);
          color: var(--text-heading);
          border: none;
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 750;
          font-size: 0.95rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.3);
        }

        .btn-primary-p:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.4);
        }

        .btn-save-p {
          background: var(--success);
          color: var(--text-heading);
          border: none;
          padding: 14px 32px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .btn-save-p:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
          filter: brightness(1.1);
        }

        .btn-outline-p {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-main);
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 650;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: 0.2s;
        }

        .btn-outline-p:hover {
          background: var(--bg-elevated-hover);
          border-color: var(--text-muted);
        }

        .config-section-p {
          padding: 24px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 18px;
        }

        .section-header-p {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-light);
        }

        .section-header-p h3 { font-size: 1rem; text-transform: uppercase; letter-spacing: 1px; }

        .form-grid-p {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .summary-card-p {
          background: rgba(2, 6, 23, 0.4);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }

        .summary-row-p {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-light);
        }

        .summary-row-p:last-child { border: none; }
        .summary-label-p { color: var(--text-muted); font-size: 0.9rem; font-weight: 600; }
        .summary-value-p { font-weight: 750; color: var(--text-heading); }

        .summary-tags-p { display: flex; gap: 8px; }
        .tag-p { 
          background: rgba(var(--primary-rgb), 0.1); 
          color: var(--primary); 
          padding: 4px 10px; 
          border-radius: 6px; 
          font-size: 0.75rem; 
          font-weight: 800; 
          border: 1px solid rgba(var(--primary-rgb), 0.2);
        }

        .final-notice-p {
          display: flex;
          gap: 20px;
          padding: 24px;
          background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.1) 0%, rgba(0,0,0,0) 100%);
          border: 1px solid rgba(var(--primary-rgb), 0.2);
          border-radius: 20px;
          color: var(--primary);
        }

        .final-notice-p h4 { margin-bottom: 4px; color: var(--text-heading); }
        .final-notice-p p { font-size: 0.85rem; color: var(--text-dim); }

        .success-state-p {
          padding: 80px 48px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .success-icon-p {
          width: 100px;
          height: 100px;
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.2);
        }

        .scrollable-p {
          max-height: 500px;
          overflow-y: auto;
          padding-right: 12px;
        }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner-s { width: 20px; height: 20px; border: 3px solid var(--border-strong); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }

        @media (max-width: 768px) {
          .form-grid-p { grid-template-columns: 1fr; }
          .wizard-body-p { padding: 32px 24px; }
          .wizard-progress-p { padding: 24px; }
        }
      `}</style>
    </div>
  );
}

