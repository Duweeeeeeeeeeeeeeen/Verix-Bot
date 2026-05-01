import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Smile, X } from 'lucide-react';

export default function EmojiInput({ value, onChange, placeholder, className, style, alignPicker = 'right', hideInput = false }) {
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef(null);

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

    return (
        <div style={{ position: 'relative', display: 'flex', width: '100%', height: '100%', flex: 1, ...style }}>
            {!hideInput ? (
                <>
                    <input 
                        className={className || 'input'} 
                        style={{ paddingRight: '40px', width: '100%' }} 
                        value={value} 
                        onChange={onChange} 
                        placeholder={placeholder} 
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPicker(!showPicker)}
                        style={{ 
                            position: 'absolute', 
                            right: '6px', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            background: 'transparent', 
                            border: 'none', 
                            color: 'var(--text-muted)', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px',
                            borderRadius: '4px',
                            transition: '0.2s',
                            zIndex: 2
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                        <Smile size={18} />
                    </button>
                </>
            ) : (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <button 
                        type="button"
                        onClick={() => setShowPicker(!showPicker)}
                        className="emoji-selector-btn"
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            background: 'var(--bg-input)', 
                            border: '1px solid var(--border)', 
                            borderRadius: '10px',
                            color: 'var(--text-main)',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: '0.2s',
                            padding: '0'
                        }}
                    >
                        {value || <Smile size={20} opacity={0.3} />}
                    </button>
                    {value && (
                        <button 
                            type="button"
                            onClick={handleClear}
                            style={{
                                position: 'absolute',
                                top: '-6px',
                                right: '-6px',
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: 'var(--error)',
                                border: 'none',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 3,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                            }}
                        >
                            <X size={10} strokeWidth={4} />
                        </button>
                    )}
                </div>
            )}
            
            {showPicker && (
                <div ref={pickerRef} style={{ 
                    position: 'absolute', 
                    zIndex: 2000, 
                    top: '100%', 
                    ...(alignPicker === 'right' ? { right: 0 } : { left: 0 }),
                    marginTop: '8px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-strong)'
                }}>
                    <EmojiPicker 
                        theme={typeof document !== 'undefined' && document.body.classList.contains('light-theme') ? Theme.LIGHT : Theme.DARK} 
                        onEmojiClick={handleEmojiClick}
                        autoFocusSearch={false}
                        lazyLoadEmojis={true}
                        width={320}
                        height={400}
                    />
                </div>
            )}
        </div>
    );
}
