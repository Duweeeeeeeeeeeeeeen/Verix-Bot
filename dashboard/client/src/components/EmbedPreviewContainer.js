import React, { useState } from 'react';
import { Monitor, Smartphone, Moon, Sun } from 'lucide-react';
import EmbedPreview from './EmbedPreview';
import { useT } from '../contexts/LanguageContext';

export default function EmbedPreviewContainer({ data, style = {}, children }) {
    const { t } = useT();
    const [isMobile, setIsMobile] = useState(false);
    const [theme, setTheme] = useState('dark');

    return (
        <div className="pc-embed-preview-container-v2 pc-card-v2" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', ...style }}>
            <div style={{ background: 'var(--bg-badge)', padding: '24px', borderBottom: '1.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, color: 'var(--text-heading)', fontSize: '1.05rem' }}>
                    <Monitor size={20} className="header-icon-primary" /> Anteprima
                </div>
                <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <button onClick={() => setIsMobile(false)} className={`view-btn-v2 ${!isMobile ? 'active' : ''}`} title="Desktop View">
                        <Monitor size={16} />
                    </button>
                    <button onClick={() => setIsMobile(true)} className={`view-btn-v2 ${isMobile ? 'active' : ''}`} title="Mobile View">
                        <Smartphone size={16} />
                    </button>
                </div>
            </div>
            
            <div style={{ 
                padding: '40px 20px', 
                background: theme === 'dark' ? 'var(--bg-dark)' : 'var(--bg-badge)', 
                minHeight: '450px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                overflowX: 'auto',
                transition: 'all 0.3s ease',
                position: 'relative',
                width: '100%'
            }}>
                <EmbedPreview data={data} isMobile={isMobile} theme={theme} />
            </div>
            
            <div style={{ padding: '16px', background: 'var(--bg-card)', borderTop: '1.5px solid var(--border)', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button onClick={() => setTheme('dark')} className={`theme-btn-v2 ${theme === 'dark' ? 'active' : ''}`} title="Dark Mode">
                    <Moon size={18} />
                </button>
                <button onClick={() => setTheme('light')} className={`theme-btn-v2 ${theme === 'light' ? 'active' : ''}`} title="Light Mode">
                    <Sun size={18} />
                </button>
            </div>

            {children && (
                <div style={{ padding: '16px', background: 'var(--bg-badge)', borderTop: '1.5px solid var(--border)' }}>
                    {children}
                </div>
            )}

            <style jsx>{`
                .view-btn-v2 { border: none; background: transparent; padding: 8px; border-radius: 8px; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; transition: 0.2s; }
                .view-btn-v2:hover { color: var(--text-main); }
                .view-btn-v2.active { background: var(--bg-card); color: var(--primary); box-shadow: var(--shadow-premium); border-color: var(--primary-muted); }
                
                .theme-btn-v2 { border: none; background: transparent; padding: 10px; border-radius: 50%; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
                .theme-btn-v2:hover { color: var(--text-main); background: var(--bg-badge); }
                .theme-btn-v2.active { color: var(--primary); background: var(--primary-glow); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15); }
                
                .header-icon-primary { color: var(--primary); }
                
                :global(.light-theme) .view-btn-v2.active { background: var(--bg-badge); }
                :global(.light-theme) .view-btn-v2.active { background: white !important; }
            `}</style>
        </div>
    );
}
