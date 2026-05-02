import { useState, useEffect } from 'react';
import { HelpCircle, X, Lightbulb, Zap } from 'lucide-react';
import { useT } from '../contexts/LanguageContext';

const GUIDE_CONTENT = {
  whitelist: (context) => [
    {
      title: "guide.whitelist.mode.title",
      match: true,
      text: context.mode === 'HYBRID' 
        ? "guide.whitelist.mode.hybrid"
        : context.mode === 'VOICE'
        ? "guide.whitelist.mode.voice"
        : "guide.whitelist.mode.text"
    },
    {
      title: "guide.whitelist.cooldown.title",
      match: context.cooldown > 48,
      text: "guide.whitelist.cooldown.text",
      vars: { cooldown: context.cooldown }
    },
    {
      title: "guide.whitelist.staff.title",
      match: !context.staffRoleIds?.length,
      text: "guide.whitelist.staff.text"
    }
  ],
  welcome: (context) => [
      {
          title: "guide.welcome.msg.title",
          match: true,
          text: "guide.welcome.msg.text"
      },
      {
          title: "guide.welcome.embed.title",
          match: context.useEmbed,
          text: "guide.welcome.embed.text"
      }
  ],
  fivem: (context) => [
      {
          title: "guide.fivem.multi.title",
          match: context.servers?.length > 1,
          text: "guide.fivem.multi.text"
      }
  ],
  photocontest: (context) => [
    {
      title: "guide.photocontest.interval.title",
      match: context.interval < 12,
      text: "guide.photocontest.interval.text",
      vars: { interval: context.interval }
    },
    {
      title: "guide.photocontest.hall.title",
      match: !context.hallOfFameChannelId,
      text: "guide.photocontest.hall.text"
    },
    {
      title: "guide.photocontest.rewards.title",
      match: true,
      text: "guide.photocontest.rewards.text"
    }
  ],
  verify: (context) => [
    {
      title: "guide.verify.type.title",
      match: true,
      text: "guide.verify.type.text"
    },
    {
      title: "guide.verify.role.title",
      match: !context.roleId,
      text: "guide.verify.role.text"
    }
  ],
  tickets: (context) => [
    {
      title: "guide.tickets.panic.title",
      match: context.panicMode,
      text: "guide.tickets.panic.text"
    },
    {
      title: "guide.tickets.naming.title",
      match: true,
      text: "guide.tickets.naming.text"
    }
  ],
  global: (context) => [
    {
      title: "guide.global.master.title",
      match: context.adminRoleIds?.length > 1,
      text: "guide.global.master.text"
    },
    {
      title: "guide.global.logs.title",
      match: context.logs?.enabled && !context.logs?.channelId,
      text: "guide.global.logs.text"
    }
  ]
};

export default function GuideSidebar({ type, context = {}, isOpen, onToggle }) {
  const { t, language } = useT();
  const [hints, setHints] = useState([]);

  useEffect(() => {
    if (GUIDE_CONTENT[type]) {
      setHints(GUIDE_CONTENT[type](context || {}).filter(h => h.match));
    } else {
      setHints([]);
    }
  }, [type, context]);

  return (
    <>
      <aside className={`global-guide-sidebar animate fade-in ${isOpen ? 'is-open' : 'is-closed'}`}>
        <div className="guide-header">
          <div className="guide-title">
            <HelpCircle size={18} className="text-primary" />
            <span>{t('guide.title')}</span>
          </div>
          <button onClick={onToggle} className="guide-close-btn">
            <X size={18} />
          </button>
        </div>

        <div className="guide-scroll-area">
          <div className="guide-content">
            {hints.map((hint, i) => (
              <div key={i} className="guide-card animate fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="guide-card-header">
                  <Lightbulb size={14} className="text-amber" />
                  <span className="guide-card-title">{t(hint.title)}</span>
                </div>
                <p className="guide-card-text">{t(hint.text, hint.vars || {})}</p>
              </div>
            ))}
            
            <div className="guide-pro-tip">
                <div className="pro-tip-header">
                    <Zap size={14} />
                    <span>{t('guide.pro_tip')}</span>
                </div>
                <p>{t('guide.pro_tip_desc')}</p>
            </div>

            <div className="guide-status-footer">
                <Zap size={20} opacity={0.3} />
                <p>{t('guide.empty')}</p>
            </div>
          </div>
        </div>


        <style jsx>{`
          .global-guide-sidebar {
            width: 320px;
            height: 100vh;
            background: var(--bg-sidebar);
            border-left: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
            overflow: hidden;
            position: relative;
            z-index: 50;
          }

          .global-guide-sidebar.is-closed {
            width: 0;
            border-left: none;
            opacity: 0;
            pointer-events: none;
          }

          .guide-header {
            padding: 32px 24px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--bg-sidebar);
            height: 108px;
            flex-shrink: 0;
            min-width: 320px; /* Prevent content squishing during transition */
          }

          .guide-title {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .guide-title span {
            font-size: 0.75rem;
            font-weight: 850;
            color: var(--text-main);
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .guide-close-btn {
            background: var(--bg-badge);
            border: 1px solid var(--border);
            color: var(--text-dim);
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: 0.2s;
          }

          .guide-close-btn:hover { 
            background: var(--error); 
            color: var(--text-on-primary); 
            border-color: var(--error);
          }

          .guide-scroll-area {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
          }

          /* Scrollbar Customization */
          .guide-scroll-area::-webkit-scrollbar { width: 4px; }
          .guide-scroll-area::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 10px; }

          .guide-content {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .guide-card {
            background: var(--bg-badge);
            border-radius: 16px;
            padding: 20px;
            border: 1px solid var(--border);
            transition: 0.3s;
          }

          .guide-card:hover {
            background: var(--bg-badge);
            border-color: var(--primary);
            transform: translateY(-2px);
          }

          .guide-card-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
          }

          .guide-card-title {
            font-size: 0.7rem;
            font-weight: 900;
            color: #f59e0b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .guide-card-text {
            font-size: 0.85rem;
            color: var(--text-dim);
            line-height: 1.6;
          }

          .guide-pro-tip {
            margin-top: 24px;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%);
            border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 16px;
            padding: 20px;
          }

          .pro-tip-header {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--primary);
            font-weight: 800;
            font-size: 0.75rem;
            text-transform: uppercase;
            margin-bottom: 8px;
          }

          .pro-tip-header span { letter-spacing: 1px; }

          .guide-pro-tip p {
            font-size: 0.8rem;
            color: var(--text-dim);
            line-height: 1.5;
          }

          .guide-empty p { font-size: 0.85rem; line-height: 1.5; }
          
          .guide-status-footer {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 32px 20px;
            text-align: center;
            gap: 12px;
            color: var(--text-muted);
            opacity: 0.7;
          }

          .guide-status-footer p {
            font-size: 0.8rem;
            line-height: 1.5;
            max-width: 200px;
          }

          .guide-footer {
            padding: 24px;
            border-top: 1px solid var(--border);
            background: var(--bg-sidebar-alt);
          }

          .footer-logo {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 4px;
          }

          .footer-logo img { width: 16px; height: 16px; opacity: 0.5; }
          .footer-logo span { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }

          .guide-footer p {
            font-size: 0.6rem;
            color: var(--text-muted);
          }


          .guide-dot {
            position: absolute;
            top: -4px;
            right: -4px;
            width: 14px;
            height: 14px;
            background: #f59e0b;
            border: 3px solid var(--bg-sidebar);
            border-radius: 50%;
            animation: pulse-amber 2s infinite;
          }

          @keyframes pulse-amber {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.5); }
            70% { transform: scale(1.3); box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
          }

          .text-primary { color: var(--primary); }
          .text-amber { color: #f59e0b; }

          @media (max-width: 1000px) {
            .global-guide-sidebar {
              display: none;
            }
          }
        `}</style>
      </aside>
    </>
  );
}
