import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Rocket, Shield, Zap, Sparkles, CheckCircle2, 
  ArrowRight, Search, LayoutGrid, Box, 
  ChevronRight, Terminal, Loader2, Server,
  ShieldCheck, Ticket, MousePointer2, ListChecks,
  Camera, Mic2, Globe, UserPlus, Bell, Users
} from 'lucide-react';
import api from '../../../utils/api';
import { useT } from '../../../contexts/LanguageContext';

export default function SetupWizard() {
  const { t, setLanguage: setGlobalLanguage } = useT();
  const router = useRouter();
  const { guildId } = router.query;
  const [phase, setPhase] = useState('welcome'); // welcome, scanner, language, presets, modules, essentials, finalizing, success
  const [progress, setProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState([]);
  
  // Settings State
  const [language, setLanguage] = useState('en');
  const [prefix, setPrefix] = useState('!');
  const [nickname, setNickname] = useState('');
  const [selectedModules, setSelectedModules] = useState(['whitelist', 'tickets', 'verify', 'polls']);
  const [roles, setRoles] = useState([]);
  const [selectedAdminRoles, setSelectedAdminRoles] = useState([]);
  const [selectedStaffRole, setSelectedStaffRole] = useState('');
  const [ticketCategory, setTicketCategory] = useState('--- SUPPORT ---');
  const [welcomeStyle, setWelcomeStyle] = useState('embed'); // text, embed
  const [channelNames, setChannelNames] = useState({
    whitelist: '⚖️-applications',
    tickets: '🎫-open-ticket',
    verify: '✅-verification',
    polls: '📊-polls',
    giveaway: '🎉-giveaways',
    photocontest: '📸-photo-contest',
    logs: '📜-verix-logs'
  });
  const [createChannels, setCreateChannels] = useState(true);
  const [loading, setLoading] = useState(false);
  const [guildInfo, setGuildInfo] = useState(null);

  useEffect(() => {
    if (guildId) {
      fetchInitialData();
    }
  }, [guildId]);

  const fetchInitialData = async () => {
    try {
      const res = await api.request(`/config/${guildId}`);
      if (res.guild?.setupCompleted) {
        router.push(`/config/${guildId}`);
        return;
      }
      setGuildInfo(res.guild);
      setRoles(res.roles || []);
      if (res.guild?.prefix) setPrefix(res.guild.prefix);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  const selectLanguage = (lang) => {
    setLanguage(lang);
    setGlobalLanguage(lang);
    
    // Update channel names based on language
    if (lang === 'it') {
        setChannelNames({
            whitelist: '⚖️-candidature',
            tickets: '🎫-apri-ticket',
            verify: '✅-verifica',
            polls: '📊-sondaggi',
            giveaway: '🎉-giveaways',
            photocontest: '📸-foto-contest',
            logs: '📜-verix-logs'
        });
        setTicketCategory('--- SUPPORTO ---');
    } else {
        setChannelNames({
            whitelist: '⚖️-applications',
            tickets: '🎫-open-ticket',
            verify: '✅-verification',
            polls: '📊-polls',
            giveaway: '🎉-giveaways',
            photocontest: '📸-photo-contest',
            logs: '📜-verix-logs'
        });
        setTicketCategory('--- SUPPORT ---');
    }
  };

  const applyPreset = (id) => {
    const presets = {
        social: ['polls', 'giveaway', 'photocontest', 'welcome'],
        security: ['whitelist', 'verify', 'logs'],
        support: ['tickets', 'support', 'logs'],
        all: ['whitelist', 'tickets', 'verify', 'polls', 'reactionRoles', 'photocontest', 'welcome', 'support', 'logs']
    };
    setSelectedModules(presets[id] || []);
    setPhase('modules');
  };

  const startScanning = () => {
    setPhase('scanning');
    const logs = [
      t('onboarding.scan_1'),
      t('onboarding.scan_2'),
      t('onboarding.scan_3'),
      t('onboarding.scan_4'),
      t('onboarding.scan_5'),
      t('onboarding.scan_6'),
      t('onboarding.scan_7')
    ];

    let currentLog = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setPhase('language'), 800);
          return 100;
        }
        
        if (prev % 15 === 0 && currentLog < logs.length) {
          setScanLogs(l => [...l, logs[currentLog]]);
          currentLog++;
        }
        
        return prev + 1;
      });
    }, 40);
  };

  const toggleModule = (id) => {
    setSelectedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setPhase('finalizing');
    setLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
        setProgress(prev => (prev < 95 ? prev + 2 : prev));
    }, 100);

    try {
      await api.request(`/config/${guildId}/onboarding/complete`, {
        method: 'POST',
        body: JSON.stringify({
          modules: selectedModules,
          autoChannels: createChannels,
          adminRoles: selectedAdminRoles,
          staffRole: selectedStaffRole,
          customChannelNames: channelNames,
          language,
          prefix,
          nickname,
          ticketCategory,
          welcomeStyle
        })
      });

      setProgress(100);
      clearInterval(interval);
      setTimeout(() => setPhase('success'), 1000);
    } catch (err) {
      console.error('Setup error:', err);
      alert(t('onboarding.error') || 'An error occurred during setup. Please try again.');
      setPhase('modules');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      setLoading(true);
      await api.request(`/config/${guildId}/onboarding/skip`, { method: 'POST' });
      router.push(`/config/${guildId}`);
    } catch (err) {
      console.error('Skip error:', err);
      // Fallback redirect even if API fails as guildId is available
      router.push(`/config/${guildId}`);
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    { id: 'whitelist', label: 'Whitelist', icon: ShieldCheck, color: '#6366f1', desc: t('onboarding.module_whitelist_desc') },
    { id: 'tickets', label: 'Ticket System', icon: Ticket, color: '#8b5cf6', desc: t('onboarding.module_tickets_desc') },
    { id: 'verify', label: 'Security', icon: Shield, color: '#06b6d4', desc: t('onboarding.module_verify_desc') },
    { id: 'polls', label: 'Poll Studio', icon: ListChecks, color: '#6366f1', desc: t('onboarding.module_polls_desc') },
    { id: 'reactionRoles', label: 'Reaction Roles', icon: MousePointer2, color: '#10b981', desc: t('onboarding.module_reactionroles_desc') },
    { id: 'photocontest', label: 'Photo Contest', icon: Camera, color: '#ec4899', desc: t('onboarding.module_photocontest_desc') },
    { id: 'welcome', label: 'Welcome Hub', icon: UserPlus, color: '#6366f1', desc: t('onboarding.module_welcome_desc') },
    { id: 'support', label: 'Voice Support', icon: Mic2, color: '#f43f5e', desc: t('onboarding.module_support_desc') }
  ];

  return (
    <div className="setup-wizard-container">
      <Head>
        <title>Verix Studio | Setup Wizard</title>
      </Head>

      <div className="setup-card-v2">
        {/* Progress Bar Top */}
        <div className="setup-progress-track">
            <div className="track-fill" style={{ width: phase === 'welcome' ? '0%' : phase === 'scanning' ? '25%' : phase === 'modules' ? '50%' : phase === 'finalizing' ? '80%' : '100%' }}></div>
        </div>

        {phase === 'welcome' && (
          <div className="phase-welcome animate fade-in">
            <div className="icon-main">
              <div className="logo-round-wrapper rocket-anim">
                <img src="/logo.png" alt="Verix Logo" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
              </div>
            </div>
            <h1>{t('onboarding.welcome_title')} <span className="highlight">Verix Studio</span></h1>
            <p dangerouslySetInnerHTML={{ __html: t('onboarding.welcome_desc', { guild: guildInfo?.guildName || t('common.this_server') }) }} />
            
            <div className="setup-features-preview">
                <div className="feature-item">
                    <Search size={20} />
                    <span>{t('onboarding.feat_scan')}</span>
                </div>
                <div className="feature-item">
                    <Box size={20} />
                    <span>{t('onboarding.feat_modules')}</span>
                </div>
                <div className="feature-item">
                    <Zap size={20} />
                    <span>{t('onboarding.feat_channels')}</span>
                </div>
            </div>

            <div className="setup-actions-welcome">
              <button className="setup-btn-primary" onClick={startScanning}>
                <span>{t('onboarding.start_btn')}</span>
                <ArrowRight size={20} />
              </button>

              <button className="setup-btn-skip" onClick={handleSkip} disabled={loading}>
                {loading ? <Loader2 size={18} className="spin" /> : t('onboarding.skip_btn')}
              </button>
            </div>
          </div>
        )}

        {phase === 'scanning' && (
          <div className="phase-scanning animate fade-in">
            <div className="scanner-ui">
              <div className="scanner-circle">
                <div className="scan-line"></div>
                <Server size={48} className="server-icon" />
              </div>
              <div className="progress-value">{progress}%</div>
            </div>
            <h2>{t('onboarding.scanning_title')}</h2>
            <div className="scan-logs">
              {scanLogs.map((log, i) => (
                <div key={i} className="log-entry">
                  <Terminal size={14} />
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === 'language' && (
          <div className="phase-language animate fade-in">
            <div className="header-compact">
                <Globe size={24} color="var(--primary)" />
                <h2>{t('onboarding.identity_title')}</h2>
                <p>{t('onboarding.identity_desc')}</p>
            </div>

            <div className="language-selection">
                <div 
                  className={`lang-card ${language === 'it' ? 'active' : ''}`}
                  onClick={() => selectLanguage('it')}
                >
                    <span className="flag">🇮🇹</span>
                    <div className="lang-info">
                        <strong>{t('onboarding.lang_it')}</strong>
                        <span>{t('onboarding.lang_it_desc')}</span>
                    </div>
                </div>
                <div 
                  className={`lang-card ${language === 'en' ? 'active' : ''}`}
                  onClick={() => selectLanguage('en')}
                >
                    <span className="flag">🇺🇸</span>
                    <div className="lang-info">
                        <strong>{t('onboarding.lang_en')}</strong>
                        <span>{t('onboarding.lang_en_desc')}</span>
                    </div>
                </div>
            </div>

            <div className="essentials-grid" style={{ marginTop: '32px' }}>
                <div className="channel-input-group">
                    <label>PREFIX</label>
                    <input type="text" value={prefix} onChange={(e) => setPrefix(e.target.value)} maxLength={3} />
                </div>
                {(guildInfo?.premiumTier === 'platinum' || guildInfo?.isPremium) && (
                    <div className="channel-input-group">
                        <label>BOT NICKNAME (PREMIUM)</label>
                        <input type="text" placeholder="Es: Verix Assistant" value={nickname} onChange={(e) => setNickname(e.target.value)} />
                    </div>
                )}
            </div>

            <button className="setup-btn-primary full" onClick={() => setPhase('presets')}>
              <span>{t('common.continue')}</span>
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {phase === 'presets' && (
          <div className="phase-presets animate fade-in">
            <div className="header-compact">
                <Zap size={24} color="#f59e0b" />
                <h2>{t('onboarding.presets_title')}</h2>
                <p>{t('onboarding.presets_desc')}</p>
            </div>

            <div className="presets-grid">
                {[
                    { id: 'social', label: t('onboarding.preset_social'), icon: Users, color: '#6366f1', desc: t('onboarding.preset_social_desc') },
                    { id: 'security', label: t('onboarding.preset_security'), icon: ShieldCheck, color: '#10b981', desc: t('onboarding.preset_security_desc') },
                    { id: 'support', label: t('onboarding.preset_support'), icon: Mic2, color: '#f43f5e', desc: t('onboarding.preset_support_desc') },
                    { id: 'all', label: t('onboarding.preset_all'), icon: Sparkles, color: '#a855f7', desc: t('onboarding.preset_all_desc') }
                ].map(p => (
                    <div key={p.id} className="preset-card" onClick={() => applyPreset(p.id)}>
                        <div className="p-icon" style={{ background: `${p.color}15`, color: p.color }}>
                            <p.icon size={24} />
                        </div>
                        <div className="p-text">
                            <h4>{p.label}</h4>
                            <p>{p.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="skip-link" onClick={() => setPhase('modules')}>{t('onboarding.manual_link')}</div>
          </div>
        )}

        {phase === 'modules' && (
          <div className="phase-modules animate fade-in">
            <div className="header-compact">
                <LayoutGrid size={24} className="icon-spark" />
                <h2>{t('onboarding.modules_title')}</h2>
                <p>{t('onboarding.modules_desc')}</p>
            </div>

            <div className="modules-selection-grid">
              {modules.map(mod => (
                <div 
                  key={mod.id} 
                  className={`mod-selector-card ${selectedModules.includes(mod.id) ? 'selected' : ''}`}
                  onClick={() => toggleModule(mod.id)}
                >
                  <div className="mod-icon" style={{ color: mod.color, background: `${mod.color}15` }}>
                    <mod.icon size={24} />
                  </div>
                  <div className="mod-info">
                    <h4>{mod.label}</h4>
                    <p>{mod.desc}</p>
                  </div>
                  <div className="mod-checkbox">
                    {selectedModules.includes(mod.id) && <CheckCircle2 size={18} />}
                  </div>
                </div>
              ))}
            </div>

            <div className="setup-options">
                <label className="option-toggle">
                    <input type="checkbox" checked={createChannels} onChange={(e) => setCreateChannels(e.target.checked)} />
                    <span className="toggle-slider"></span>
                    <div className="option-text">
                        <strong>{t('onboarding.auto_channels')}</strong>
                        <span>{t('onboarding.auto_channels_desc')}</span>
                    </div>
                </label>
            </div>

            <button className="setup-btn-primary full" onClick={() => setPhase('essentials')}>
              <span>{t('common.continue')}</span>
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {phase === 'essentials' && (
          <div className="phase-essentials animate fade-in">
            <div className="header-compact">
                <Shield size={24} className="icon-shield" />
                <h2>{t('onboarding.advanced_title')}</h2>
                <p>{t('onboarding.advanced_desc')}</p>
            </div>

            <div className="essentials-grid">
                <div className="essentials-section">
                    <h4><Users size={18} /> {t('onboarding.admin_roles')}</h4>
                    <div className="roles-selector-scroll">
                        {roles.map(role => (
                            <div 
                                key={role.id} 
                                className={`role-chip ${selectedAdminRoles.includes(role.id) ? 'active' : ''}`}
                                onClick={() => setSelectedAdminRoles(prev => prev.includes(role.id) ? prev.filter(r => r !== role.id) : [...prev, role.id])}
                            >
                                <div className="role-color" style={{ background: role.color }}></div>
                                <span>{role.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="essentials-flex-row">
                    <div className="essentials-section">
                        <h4><ShieldCheck size={18} /> {t('onboarding.staff_role')}</h4>
                        <select 
                            value={selectedStaffRole} 
                            onChange={(e) => setSelectedStaffRole(e.target.value)}
                            className="setup-select"
                        >
                            <option value="">{t('common.select')}</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="essentials-section">
                        <h4><UserPlus size={18} /> {t('onboarding.welcome_style')}</h4>
                        <div className="toggle-switch-v2">
                            <button className={welcomeStyle === 'text' ? 'active' : ''} onClick={() => setWelcomeStyle('text')}>{t('common.text')}</button>
                            <button className={welcomeStyle === 'embed' ? 'active' : ''} onClick={() => setWelcomeStyle('embed')}>Embed</button>
                        </div>
                    </div>
                </div>

                {selectedModules.includes('tickets') && (
                    <div className="essentials-section">
                        <h4><Ticket size={18} /> {t('tickets.categories')}</h4>
                        <input 
                          type="text" 
                          className="setup-input-v2" 
                          placeholder={language === 'it' ? 'Es: --- SUPPORTO ---' : 'Ex: --- SUPPORT ---'} 
                          value={ticketCategory} 
                          onChange={(e) => setTicketCategory(e.target.value)} 
                        />
                    </div>
                )}

                {createChannels && (
                    <div className="essentials-section full-width">
                        <h4><Bell size={18} /> {t('onboarding.channel_names')}</h4>
                        <div className="channel-names-grid">
                            {Object.keys(channelNames).map(key => {
                                if (!selectedModules.includes(key) && key !== 'logs') return null;
                                return (
                                    <div key={key} className="channel-input-group">
                                        <label>{key.toUpperCase()}</label>
                                        <input 
                                            type="text" 
                                            value={channelNames[key]} 
                                            onChange={(e) => setChannelNames(prev => ({ ...prev, [key]: e.target.value }))}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <button className="setup-btn-primary full" onClick={handleComplete}>
              <span>{t('onboarding.finalize_btn')}</span>
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {phase === 'finalizing' && (
          <div className="phase-finalizing animate fade-in">
            <Loader2 size={64} className="spin-loader" />
            <h2>{t('onboarding.finalizing_title')}</h2>
            <p>{t('onboarding.finalizing_desc')}</p>
            <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        {phase === 'success' && (
          <div className="phase-success animate fade-in">
            <div className="success-icon-wrapper">
                <CheckCircle2 size={80} color="#10b981" />
            </div>
            <h2>{t('onboarding.success_title')}</h2>
            <p>{t('onboarding.success_desc')}</p>
            <button className="setup-btn-success" onClick={() => router.push(`/config/${guildId}`)}>
              <span>{t('onboarding.dashboard_btn')}</span>
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .setup-wizard-container {
          min-height: 100vh;
          background: var(--bg-main);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }

        .setup-card-v2 {
          width: 100%;
          max-width: 800px;
          background: var(--bg-card);
          border-radius: 40px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-premium);
          padding: 60px;
          position: relative;
          overflow: hidden;
        }

        .setup-progress-track {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 6px;
            background: var(--bg-badge);
        }

        .track-fill {
            height: 100%;
            background: linear-gradient(to right, var(--primary), #a78bfa);
            transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Phases Common */
        .animate { animation: slide-up 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        
        h1 { font-size: 2.8rem; font-weight: 800; color: var(--text-heading); margin-bottom: 16px; letter-spacing: -0.02em; }
        h2 { font-size: 2rem; font-weight: 800; color: var(--text-heading); margin-bottom: 12px; }
        p { color: var(--text-muted); font-size: 1.1rem; line-height: 1.6; margin-bottom: 32px; font-weight: 500; }
        .highlight { color: var(--primary); font-weight: 800; }

        /* Welcome */
        .phase-welcome { text-align: center; }
        .icon-main { margin-bottom: 32px; color: var(--primary); }
        .rocket-anim { animation: float 3s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }

        .setup-features-preview { display: flex; justify-content: center; gap: 24px; margin-bottom: 48px; flex-wrap: wrap; }
        .feature-item { display: flex; align-items: center; gap: 10px; background: var(--bg-badge); padding: 12px 20px; border-radius: 100px; color: var(--text-muted); font-weight: 700; font-size: 0.9rem; border: 1px solid var(--border); }

        .setup-btn-primary { background: var(--primary); color: white; border: none; padding: 20px 40px; border-radius: 20px; font-size: 1.1rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 12px; margin: 0 auto; transition: 0.3s; box-shadow: 0 10px 30px rgba(var(--primary-rgb), 0.3); }

        .setup-btn-primary:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 20px 40px rgba(var(--primary-rgb), 0.4); }
        .setup-btn-primary.full { width: 100%; justify-content: center; margin-top: 40px; }

        .setup-actions-welcome { display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .setup-btn-skip { background: transparent; color: var(--text-muted); border: none; padding: 10px 20px; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: 0.3s; opacity: 0.7; }
        .setup-btn-skip:hover { opacity: 1; color: var(--primary); }
        .setup-btn-skip:disabled { cursor: not-allowed; opacity: 0.5; }
        .spin { animation: spin 2s linear infinite; }

        /* Scanning */
        .phase-scanning { text-align: center; }
        .scanner-ui { position: relative; width: 180px; height: 180px; margin: 0 auto 40px; }
        .scanner-circle { width: 100%; height: 100%; border-radius: 50%; border: 4px solid var(--border); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; background: var(--bg-badge); }
        .scan-line { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: var(--primary); box-shadow: 0 0 20px var(--primary); animation: scan 2s linear infinite; z-index: 2; }
        @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
        .server-icon { color: var(--primary); opacity: 0.8; }
        .progress-value { position: absolute; bottom: -10px; right: -10px; background: var(--primary); color: white; padding: 8px 16px; border-radius: 100px; font-weight: 800; font-size: 1rem; border: 4px solid var(--bg-card); }

        .scan-logs { background: #0a0a0a; border-radius: 20px; padding: 24px; text-align: left; max-height: 200px; overflow-y: auto; border: 1px solid #1a1a1a; }
        .log-entry { display: flex; align-items: center; gap: 12px; color: #10b981; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; margin-bottom: 8px; }

        /* Modules */
        .header-compact { text-align: center; margin-bottom: 40px; }
        .icon-spark { color: #6366f1; margin-bottom: 16px; animation: pulse 2s infinite; }
        .modules-selection-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 32px; }
        .mod-selector-card { display: flex; align-items: center; gap: 16px; padding: 20px; background: var(--bg-badge); border-radius: 24px; border: 2px solid var(--border); cursor: pointer; transition: 0.2s; position: relative; }
        .mod-selector-card:hover { border-color: var(--primary-muted); transform: scale(1.02); }
        .mod-selector-card.selected { border-color: var(--primary); background: rgba(var(--primary-rgb), 0.05); }
        
        .mod-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .mod-info h4 { margin: 0 0 4px 0; font-size: 1rem; font-weight: 700; color: var(--text-heading); }
        .mod-info p { margin: 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; }
        .mod-checkbox { margin-left: auto; color: var(--primary); }

        /* Language */
        .language-selection { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .lang-card { display: flex; align-items: center; gap: 16px; padding: 24px; background: var(--bg-badge); border-radius: 24px; border: 2px solid var(--border); cursor: pointer; transition: 0.2s; }
        .lang-card.active { border-color: var(--primary); background: rgba(var(--primary-rgb), 0.05); }
        .flag { font-size: 2rem; }
        .lang-info { display: flex; flex-direction: column; text-align: left; }
        .lang-info strong { color: var(--text-heading); }
        .lang-info span { font-size: 0.8rem; color: var(--text-muted); }

        /* Presets */
        .presets-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .preset-card { display: flex; align-items: center; gap: 16px; padding: 24px; background: var(--bg-badge); border-radius: 28px; border: 2px solid var(--border); cursor: pointer; transition: 0.2s; text-align: left; }
        .preset-card:hover { border-color: var(--primary); transform: translateY(-4px); }
        .p-icon { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .p-text h4 { margin: 0 0 4px 0; color: var(--text-heading); font-size: 1rem; }
        .p-text p { margin: 0; font-size: 0.75rem; color: var(--text-muted); line-height: 1.4; }
        .skip-link { margin-top: 32px; color: var(--text-muted); cursor: pointer; font-size: 0.9rem; font-weight: 700; text-decoration: underline; text-underline-offset: 4px; }
        .skip-link:hover { color: var(--primary); }

        /* Essentials */
        .essentials-grid { display: flex; flex-direction: column; gap: 32px; text-align: left; }
        .essentials-flex-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .essentials-section h4 { display: flex; align-items: center; gap: 10px; margin: 0 0 12px 0; color: var(--text-heading); font-size: 1rem; font-weight: 800; }
        .essentials-section p { font-size: 0.9rem; margin-bottom: 16px; }
        .full-width { grid-column: span 2; }

        .roles-selector-scroll { display: flex; flex-wrap: wrap; gap: 8px; max-height: 120px; overflow-y: auto; padding: 12px; background: var(--bg-badge); border-radius: 20px; border: 1px solid var(--border); }
        .role-chip { display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: var(--bg-card); border-radius: 100px; border: 1px solid var(--border); cursor: pointer; transition: 0.2s; font-size: 0.8rem; font-weight: 700; }
        .role-chip:hover { border-color: var(--primary); }
        .role-chip.active { background: var(--primary); color: white; border-color: var(--primary); }
        .role-color { width: 8px; height: 8px; border-radius: 50%; }

        .setup-select, .setup-input-v2 { width: 100%; padding: 14px; background: var(--bg-badge); border: 1px solid var(--border); border-radius: 16px; color: var(--text-heading); font-weight: 700; outline: none; }
        .setup-select:focus, .setup-input-v2:focus { border-color: var(--primary); }

        .toggle-switch-v2 { display: flex; background: var(--bg-badge); padding: 4px; border-radius: 12px; border: 1px solid var(--border); }
        .toggle-switch-v2 button { flex: 1; border: none; padding: 10px; border-radius: 10px; cursor: pointer; font-weight: 800; font-size: 0.85rem; background: transparent; color: var(--text-muted); transition: 0.3s; }
        .toggle-switch-v2 button.active { background: var(--primary); color: white; box-shadow: 0 4px 10px rgba(var(--primary-rgb), 0.2); }

        .channel-names-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .channel-input-group { display: flex; flex-direction: column; gap: 6px; }
        .channel-input-group label { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); letter-spacing: 1px; }
        .channel-input-group input { padding: 12px; background: var(--bg-badge); border: 1px solid var(--border); border-radius: 12px; color: var(--text-heading); font-weight: 700; outline: none; }
        .channel-input-group input:focus { border-color: var(--primary); }

        .setup-options { background: var(--bg-badge); padding: 24px; border-radius: 24px; border: 1px solid var(--border); }
        .option-toggle { display: flex; align-items: center; gap: 20px; cursor: pointer; }
        .option-text { display: flex; flex-direction: column; }
        .option-text strong { color: var(--text-heading); font-size: 1rem; }
        .option-text span { color: var(--text-muted); font-size: 0.85rem; }

        .toggle-slider { width: 50px; height: 26px; background: #cbd5e1; border-radius: 100px; position: relative; transition: 0.3s; flex-shrink: 0; }
        .toggle-slider:before { content: ""; position: absolute; width: 20px; height: 20px; background: white; border-radius: 50%; top: 3px; left: 3px; transition: 0.3s; }
        input:checked + .toggle-slider { background: var(--primary); }
        input:checked + .toggle-slider:before { transform: translateX(24px); }
        .option-toggle input { display: none; }

        /* Finalizing */
        .phase-finalizing { text-align: center; padding: 40px 0; }
        .spin-loader { color: var(--primary); margin-bottom: 32px; animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .progress-bar-container { width: 100%; height: 12px; background: var(--bg-badge); border-radius: 100px; margin-top: 40px; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: linear-gradient(to right, var(--primary), #a78bfa); border-radius: 100px; transition: 0.4s; }

        /* Success */
        .phase-success { text-align: center; }
        .success-icon-wrapper { margin-bottom: 32px; animation: bounce 1s cubic-bezier(0.2, 0.8, 0.2, 1); }
        @keyframes bounce { 0% { transform: scale(0); } 70% { transform: scale(1.2); } 100% { transform: scale(1); } }
        .setup-btn-success { background: #10b981; color: white; border: none; padding: 20px 40px; border-radius: 20px; font-size: 1.1rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 12px; margin: 0 auto; transition: 0.3s; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3); }
        .setup-btn-success:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(16, 185, 129, 0.4); }

        @media (max-width: 600px) {
            .setup-card-v2 { padding: 30px; }
            h1 { font-size: 2rem; }
            .modules-selection-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
