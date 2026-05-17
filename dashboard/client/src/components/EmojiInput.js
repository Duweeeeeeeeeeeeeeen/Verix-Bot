import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Smile, X, Type } from 'lucide-react';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
    ssr: false,
    loading: () => (
        <div className="emoji-picker-loading">
            <Smile size={18} />
        </div>
    )
});

export default function EmojiInput({ value, onChange, placeholder, className, style, alignPicker = 'right', hideInput = false }) {
    const [showPicker, setShowPicker] = useState(false);
    const [isPasting, setIsPasting] = useState(false);
    const pickerRef = useRef(null);
    const inputRef = useRef(null);

    // Close picker when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleEmojiClick = (emojiData) => {
        const newValue = hideInput ? emojiData.emoji : (value || '') + emojiData.emoji;
        onChange({ target: { value: newValue } });
        setShowPicker(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange({ target: { value: '' } });
    };

    const handlePaste = (e) => {
        const pastedText = e.clipboardData.getData('text');
        // Extract first emoji
        const emojiMatch = pastedText.match(/(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u);
        if (emojiMatch) {
            e.preventDefault();
            onChange({ target: { value: hideInput ? emojiMatch[0] : (value || '') + emojiMatch[0] } });
            
            // Visual feedback
            setIsPasting(true);
            setTimeout(() => setIsPasting(false), 600);
        }
    };

    return (
        <div className="pc-emoji-input-wrapper" style={{ position: 'relative', display: 'flex', width: '100%', height: '100%', flex: 1, ...style }}>
            {!hideInput ? (
                <>
                    <input 
                        ref={inputRef}
                        className={className || 'pc-input-modern-v2'} 
                        style={{ paddingRight: '44px', width: '100%' }} 
                        value={value} 
                        onChange={onChange} 
                        onPaste={handlePaste}
                        placeholder={placeholder} 
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPicker(!showPicker)}
                        className="picker-trigger"
                        style={{ 
                            position: 'absolute', 
                            right: '8px', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            background: 'var(--bg-badge)', 
                            border: '1.5px solid var(--border)', 
                            color: 'var(--text-muted)', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            transition: '0.2s',
                            zIndex: 2
                        }}
                    >
                        <Smile size={18} />
                    </button>
                </>
            ) : (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <div 
                        className={`emoji-selector-box ${showPicker ? 'active' : ''}`}
                        onClick={() => setShowPicker(!showPicker)}
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            background: 'var(--bg-inset)', 
                            border: '1.5px solid var(--border)', 
                            borderRadius: '14px',
                            color: 'var(--text-heading)',
                            fontSize: '1.4rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            padding: '0',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Invisible input to allow pasting/typing */}
                        <input 
                            style={{
                                position: 'absolute',
                                opacity: 0,
                                width: '100%',
                                height: '100%',
                                cursor: 'text',
                                zIndex: 5
                            }}
                            value={value || ''}
                            onChange={onChange}
                            onPaste={handlePaste}
                            onFocus={() => setIsPasting(true)}
                            onBlur={() => setIsPasting(false)}
                            title="Paste emoji here or click to open picker"
                        />
                        <div style={{ pointerEvents: 'none', zIndex: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                            {value ? (
                                <span style={{ fontSize: '2.5rem' }}>{value}</span>
                            ) : (
                                <Smile size={28} style={{ opacity: 0.2 }} />
                            )}
                        </div>
                        
                        {isPasting && (
                            <div style={{ position: 'absolute', inset: 0, border: '2px solid var(--primary)', borderRadius: '14px', pointerEvents: 'none', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(var(--primary-rgb), 0.05)' }}>
                                <Type size={16} style={{ color: 'var(--primary)', opacity: 0.8 }} />
                            </div>
                        )}
                    </div>
                    {value && (
                        <button 
                            type="button"
                            onClick={handleClear}
                            className="clear-emoji-btn"
                            style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                background: '#ef4444',
                                border: '2px solid var(--bg-card)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 10,
                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                                transition: '0.2s'
                            }}
                        >
                            <X size={12} strokeWidth={3} />
                        </button>
                    )}
                </div>
            )}
            
            {showPicker && (
                <div ref={pickerRef} className="emoji-picker-dropdown animate-scale-in" style={{ 
                    position: 'absolute', 
                    zIndex: 2000, 
                    top: '100%', 
                    ...(alignPicker === 'right' ? { right: 0 } : { left: 0 }),
                    marginTop: '12px',
                    boxShadow: 'var(--shadow-premium)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-strong)',
                    background: 'var(--bg-card)'
                }}>
                    <EmojiPicker
                        theme={typeof document !== 'undefined' && document.body.classList.contains('light-theme') ? 'light' : 'dark'}
                        onEmojiClick={handleEmojiClick}
                        autoFocusSearch={false}
                        lazyLoadEmojis={true}
                        width={320}
                        height={400}
                    />
                </div>
            )}
            
            <style jsx>{`
                .picker-trigger:hover { background: var(--primary-glow) !important; color: var(--primary) !important; border-color: var(--primary) !important; }
                .emoji-selector-box:hover { border-color: var(--primary); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); background: var(--bg-badge); }
                .emoji-selector-box.active { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-glow); }
                .clear-emoji-btn:hover { transform: scale(1.1); background: #f87171; }
                
                .emoji-picker-loading {
                    width: 320px;
                    height: 400px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                    background: var(--bg-card);
                }

                .animate-scale-in {
                    animation: scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95) translateY(-10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}
