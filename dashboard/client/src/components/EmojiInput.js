import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Smile } from 'lucide-react';

export default function EmojiInput({ value, onChange, placeholder, className, style, alignPicker = 'right' }) {
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
        const newValue = (value || '') + emojiData.emoji;
        onChange({ target: { value: newValue } });
    };

    return (
        <div style={{ position: 'relative', display: 'flex', width: '100%', flex: 1 }}>
            <input 
                className={className} 
                style={{ ...style, paddingRight: '40px', width: '100%' }} 
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
                    transition: '0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
                <Smile size={18} />
            </button>
            
            {showPicker && (
                <div ref={pickerRef} style={{ 
                    position: 'absolute', 
                    zIndex: 1000, 
                    top: '100%', 
                    ...(alignPicker === 'right' ? { right: 0 } : { left: 0 }),
                    marginTop: '8px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}>
                    <EmojiPicker 
                        theme={Theme.DARK} 
                        onEmojiClick={handleEmojiClick}
                        autoFocusSearch={false}
                        lazyLoadEmojis={true}
                    />
                </div>
            )}
        </div>
    );
}
