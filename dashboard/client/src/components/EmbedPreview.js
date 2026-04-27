import React from 'react';

/**
 * A high-fidelity Discord UI Simulator.
 * Emulates exactly how an embed looks in the Discord Dark Mode desktop client.
 */
export default function EmbedPreview({ data, isMobile = false }) {
  if (!data) return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)', border: '2px dashed var(--border)', borderRadius: '12px' }}>
      Nessun dato da mostrare nell'anteprima
    </div>
  );

  // Constants matching Discord CSS
  const colors = {
    bg_message: '#313338',
    bg_embed: '#2b2d31',
    text_normal: '#dbdee1',
    text_muted: '#949ba4',
    text_header: '#ffffff',
    text_link: '#00a8fc',
    bot_tag_bg: '#5865f2'
  };

  /**
   * Resolves semantic color names to hex codes
   */
  const resolveColor = (color) => {
    if (!color) return '#1e1f22'; // Discord fallback
    if (color.startsWith('#')) return color;
    
    // Semantic naming mapping
    const mapping = {
      'primary': '#818cf8',
      'success': '#10b981',
      'error': '#f43f5e',
      'warning': '#f59e0b',
      'info': '#3b82f6'
    };

    return mapping[color.toLowerCase()] || color;
  };

  return (
    <div className={`discord-preview ${isMobile ? 'mobile-view' : ''}`} style={{
      background: colors.bg_message,
      padding: '20px',
      borderRadius: '12px',
      fontFamily: '"gg sans", "Whitney", "Helvetica Neue", Helvetica, Arial, sans-serif',
      color: colors.text_normal,
      fontSize: '1rem',
      maxWidth: isMobile ? '360px' : '100%',
      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
      border: '1px solid var(--border)',
      transition: 'var(--transition-normal)',
      margin: '0 auto'
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
 
            {/* The Embed Skeleton */}
            <div className="embed-container" style={{
                background: colors.bg_embed,
                borderLeft: `4px solid ${resolveColor(data.color)}`,
                borderRadius: '4px',
                padding: '12px 16px',
                marginTop: '8px',
                maxWidth: '520px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                {/* Author Field */}
                {data.author && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        {typeof data.author_icon === 'string' && data.author_icon && <img src={data.author_icon} style={{ width: '24px', height: '24px', borderRadius: '50%' }} alt="" />}
                        <span style={{ fontWeight: '600', fontSize: '0.875rem', color: 'white', cursor: 'pointer' }}>
                            {processPlaceholders(data.author)}
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
                                        <div style={{ fontWeight: '700', color: 'white', fontSize: '0.875rem', marginBottom: '2px' }}>{processPlaceholders(f.name)}</div>
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
                            {data.footer && <span>{processPlaceholders(data.footer)}</span>}
                            {data.footer && data.timestamp && <span style={{ margin: '0 4px' }}>•</span>}
                            {data.timestamp && <span>{new Date().toLocaleDateString()}</span>}
                        </div>
                    </div>
                )}
            </div>

            {/* Simulated Discord Buttons */}
            {(data.button || data.buttons) && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {data.buttons ? (
                        data.buttons.map((btn, i) => (
                            <button key={i} style={{
                                background: btn.style === 'SUCCESS' ? '#248046' : (btn.style === 'DANGER' ? '#da373c' : (btn.style === 'SECONDARY' ? '#4e5058' : '#5865f2')),
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
                            </button>
                        ))
                    ) : (
                        <button style={{
                            background: data.button.style === 'SUCCESS' ? '#248046' : (data.button.style === 'DANGER' ? '#da373c' : (data.button.style === 'SECONDARY' ? '#4e5058' : '#5865f2')),
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
                        </button>
                    )}
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
    if (typeof text !== 'string') return text;
    
    return text
        .replace(/{user}/g, '@AdminRoleplay')
        .replace(/{user_name}/g, 'Mario Rossi')
        .replace(/{staff}/g, '@StaffRP')
        .replace(/{guild}/g, 'Grand Roleplay')
        .replace(/{status}/g, 'ATTIVO')
        .replace(/{ticket_id}/g, '#042')
        .replace(/{time}/g, new Date().toLocaleTimeString());
}
