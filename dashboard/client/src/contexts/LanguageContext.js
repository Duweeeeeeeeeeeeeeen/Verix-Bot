import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import it from '../locales/it.json';
import en from '../locales/en.json';

const LanguageContext = createContext();

const locales = { it, en };

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('verix-language');
        if (savedLang && locales[savedLang]) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang) => {
        if (locales[lang]) {
            setLanguageState(lang);
            localStorage.setItem('verix-language', lang);
        }
    };

    const t = useCallback((key, vars = {}) => {
        const locale = locales[language] || locales['en'];
        
        // Try exact key first (flat)
        let val = locale[key];

        // Fallback to nested if needed (optional, but keep it simple for now)
        if (!val && key.includes('.')) {
            const keys = key.split('.');
            val = locale;
            for (const k of keys) {
                val = val?.[k];
            }
        }

        if (typeof val !== 'string') {
            return key;
        }

        return val.replace(/\{\{?(\w+)\}\}?/g, (match, name) => {
            return vars[name] !== undefined ? vars[name] : match;
        });
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useT() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useT must be used within a LanguageProvider');
    }
    return context;
}
