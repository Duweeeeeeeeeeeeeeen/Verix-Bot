import React from 'react';

/**
 * A high-fidelity Discord UI Simulator.
 * Emulates exactly how an embed looks in the Discord Dark Mode desktop client.
 */
export default function EmbedPreview({ data, isMobile = false, theme = 'dark' }) {
  if (!data) return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)', border: '2px dashed var(--border)', borderRadius: '12px' }}>
      Nessun dato da mostrare nell'anteprima
    </div>
  );

  const isLight = theme === 'light';

  // Constants matching Discord CSS for both themes
  const colors = {
    bg_message: isLight ? '#ffffff' : '#313338',
    bg_embed: isLight ? '#f2f3f5' : '#2b2d31',
    text_normal: isLight ? '#313338' : '#dbdee1',
    text_muted: isLight ? '#5c6370' : '#949ba4',
    text_header: isLight ? '#060607' : '#ffffff',
    text_link: isLight ? '#0067e0' : '#00a8fc',
    bot_tag_bg: '#5865f2'
  };

  /**
   * Resolves semantic color names to hex codes
   */
  const resolveColor = (color) => {
    if (!color) return '#1e1f22'; // Discord fallback
    
    // Handle numeric/decimal colors from Discord API
    if (typeof color === 'number') {
      return '#' + color.toString(16).padStart(6, '0');
    }

    if (typeof color === 'string') {
      if (color.startsWith('#')) return color;
      
      const mapping = {
        'primary': '#818cf8',
        'success': '#10b981',
        'error': '#f43f5e',
        'warning': '#f59e0b',
        'info': '#3b82f6'
      };

      return mapping[color.toLowerCase()] || color;
    }

    return '#1e1f22';
  };

  return (
    <div className={`discord-preview ${isMobile ? 'mobile-view' : ''}`} style={{
      background: colors.bg_message,
      padding: '24px',
      borderRadius: '24px',
      fontFamily: '"Inter", "gg sans", "Whitney", "Helvetica Neue", Helvetica, Arial, sans-serif',
      color: colors.text_normal,
      fontSize: '0.95rem',
      width: isMobile ? '100%' : '624px',
      minWidth: isMobile ? 'auto' : '624px',
      maxWidth: isMobile ? '360px' : 'none',
      boxShadow: 'var(--shadow-premium)',
      border: '1.5px solid var(--border)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', gap: '16px' }}>
         {/* Avatar Simulation */}
         <div style={{ 
             width: '40px', 
             height: '40px', 
             borderRadius: '50%', 
             background: 'var(--bg-dark)', 
             overflow: 'hidden',
             flexShrink: 0, 
             display: 'flex', 
             alignItems: 'center', 
             justifyContent: 'center', 
             color: 'white', 
             fontWeight: '800',
             fontSize: '1.2rem',
             boxShadow: '0 4px 10px var(--primary-glow)' 
         }}>
             <img src="/logo.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
         </div>
         
         <div style={{ flex: 1, minWidth: 0 }}>
            {/* Message Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', color: colors.text_header, cursor: 'pointer' }}>Verix</span>
                <span style={{ 
                    background: colors.bot_tag_bg, 
                    color: 'white', 
                    fontSize: '0.65rem', 
                    padding: '1px 4px', 
                    borderRadius: '3px', 
                    fontWeight: '700', 
                    display: 'flex', 
                    alignItems: 'center',
                    height: '15px'
                }}>✓ APP</span>
                <span style={{ color: colors.text_muted, fontSize: '0.75rem' }}>Oggi alle {new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, '0')}</span>
            </div>
 
            <div className="embed-container" style={{
                background: theme === 'dark' ? 'rgba(43, 45, 49, 0.8)' : 'rgba(242, 243, 245, 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: '8px',
                padding: '16px 20px',
                marginTop: '12px',
                width: isMobile ? '100%' : '520px',
                minWidth: isMobile ? 'auto' : '520px',
                maxWidth: '520px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderLeft: `4px solid ${resolveColor(data.color)}`
            }}>
                {/* Author Field */}
                {data.author && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        {typeof data.author_icon === 'string' && data.author_icon && <img src={data.author_icon} style={{ width: '24px', height: '24px', borderRadius: '50%' }} alt="" />}
                        <span style={{ fontWeight: '600', fontSize: '0.875rem', color: colors.text_header, cursor: 'pointer' }}>
                            {processPlaceholders(typeof data.author === 'object' ? data.author.name : data.author)}
                        </span>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Title */}
                        {data.title && (
                            <div style={{ fontWeight: '700', color: colors.text_link, marginBottom: '8px', fontSize: '1rem', cursor: 'pointer' }}>
                                {processPlaceholders(data.title)}
                            </div>
                        )}

                        {/* Description */}
                        {data.description && (
                            <div style={{ 
                                fontSize: '0.875rem', 
                                whiteSpace: 'pre-wrap', 
                                color: colors.text_normal, 
                                lineHeight: '1.375',
                                wordWrap: 'break-word'
                            }}>
                                {processPlaceholders(data.description)}
                            </div>
                        )}
                        
                        {/* Fields */}
                        {data.fields && data.fields.length > 0 && (
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(120px, 1fr))', 
                                gap: '8px 16px', 
                                marginTop: '12px' 
                            }}>
                                {data.fields.map((f, i) => (
                                    <div key={i} style={{ gridColumn: f.inline && !isMobile ? 'auto' : '1 / -1' }}>
                                        <div style={{ fontWeight: '700', color: colors.text_header, fontSize: '0.875rem', marginBottom: '2px' }}>{processPlaceholders(f.name)}</div>
                                        <div style={{ fontSize: '0.875rem', color: colors.text_normal }}>{processPlaceholders(f.value)}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Thumbnail */}
                    {typeof data.thumbnail === 'string' && data.thumbnail && !isMobile && (
                        <img src={data.thumbnail} alt="" style={{ width: '80px', height: '80px', borderRadius: '4px', flexShrink: 0, objectFit: 'cover' }} />
                    )}
                </div>

                {/* Main Image */}
                {typeof data.image === 'string' && data.image && (
                    <div style={{ marginTop: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                        <img src={data.image} alt="" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', background: 'rgba(0,0,0,0.2)' }} />
                    </div>
                )}

                {/* Footer */}
                {(data.footer || data.timestamp) && (
                    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: colors.text_muted, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {typeof data.footer_icon === 'string' && data.footer_icon && <img src={data.footer_icon} style={{ width: '20px', height: '20px', borderRadius: '50%' }} alt="" />}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {data.footer && <span>{processPlaceholders(typeof data.footer === 'object' ? data.footer.text : data.footer)}</span>}
                            {data.footer && data.timestamp && <span style={{ margin: '0 4px' }}>•</span>}
                            {data.timestamp && <span>{new Date().toLocaleDateString()}</span>}
                        </div>
                    </div>
                )}
            </div>

            {/* Simulated Discord Buttons */}
            {data.type !== 'REACTION' && (data.button || data.buttons) && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {data.buttons ? (
                        data.buttons.map((btn, i) => (
                            <button key={i} style={{
                                background: btn.style === 'SUCCESS' ? '#248046' : (btn.style === 'DANGER' ? '#da373c' : (btn.style === 'SECONDARY' || btn.style === 'LINK' ? '#4e5058' : '#5865f2')),
                                color: 'white',
                                border: 'none',
                                padding: '6px 16px',
                                borderRadius: '3px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'default'
                            }}>
                                {btn.emoji && <span>{btn.emoji}</span>}
                                {btn.label && <span>{processPlaceholders(btn.label)}</span>}
                                {btn.style === 'LINK' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>}
                            </button>
                        ))
                    ) : data.button && (
                        <button style={{
                            background: data.button.style === 'SUCCESS' ? '#248046' : (data.button.style === 'DANGER' ? '#da373c' : (data.button.style === 'SECONDARY' || data.button.style === 'LINK' ? '#4e5058' : '#5865f2')),
                            color: 'white',
                            border: 'none',
                            padding: '6px 16px',
                            borderRadius: '3px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'default'
                        }}>
                            {data.button.emoji && <span>{data.button.emoji}</span>}
                            {data.button.label && <span>{processPlaceholders(data.button.label)}</span>}
                            {data.button.style === 'LINK' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>}
                        </button>
                    )}
                </div>
            )}

            {/* Simulated Discord Reactions (Classic) */}
            {data.type === 'REACTION' && data.reactions && data.reactions.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {data.reactions.map((r, i) => (
                        <div key={i} style={{
                            background: 'rgba(88, 101, 242, 0.1)',
                            border: '1px solid rgba(88, 101, 242, 0.3)',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'default'
                        }}>
                            <span>{r.emoji}</span>
                            <span style={{ color: '#5865f2', fontWeight: '700', fontSize: '0.75rem' }}>1</span>
                        </div>
                    ))}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)'
                    }}>
                        +
                    </div>
                </div>
            )}
         </div>
      </div>

      <style jsx>{`
        .discord-preview:hover {
            box-shadow: 0 15px 40px rgba(0,0,0,0.5);
        }
        .mobile-view .embed-container {
            max-width: 100%;
        }
      `}</style>
    </div>
  );
}

/**
 * Enhanced Placeholder Processor
 */
function processPlaceholders(text) {
    if (!text) return '';
    if (typeof text !== 'string') return String(text || '');
    
    return text
        .replace(/{user}/g, '@AdminRoleplay')
        .replace(/{user_name}/g, 'Mario Rossi')
        .replace(/{staff}/g, '@StaffRP')
        .replace(/{guild}/g, 'Grand Roleplay')
        .replace(/{status}/g, 'ATTIVO')
        .replace(/{ticket_id}/g, '#042')
        .replace(/{time}/g, new Date().toLocaleTimeString());
}
