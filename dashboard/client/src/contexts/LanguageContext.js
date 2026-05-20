import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from '../locales/en.json';

export const LanguageContext = createContext();

const supportedLocales = ['en', 'it', 'es', 'fr'];
const localeLoaders = {
    en: async () => en,
    it: () => import('../locales/it.json').then(module => module.default),
    es: () => import('../locales/es.json').then(module => module.default),
    fr: () => import('../locales/fr.json').then(module => module.default)
};

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState('en');
    const [loadedLocales, setLoadedLocales] = useState({ en });

    useEffect(() => {
        const savedLang = localStorage.getItem('verix-language');
        if (supportedLocales.includes(savedLang)) {
            setLanguage(savedLang);
        }
    }, []);

    const loadLocale = useCallback(async (lang) => {
        if (!supportedLocales.includes(lang)) return en;
        if (loadedLocales[lang]) return loadedLocales[lang];

        const messages = await localeLoaders[lang]();
        setLoadedLocales(prev => ({ ...prev, [lang]: messages }));
        return messages;
    }, [loadedLocales]);

    const setLanguage = useCallback((lang) => {
        if (!supportedLocales.includes(lang)) return;

        setLanguageState(lang);
        localStorage.setItem('verix-language', lang);
        loadLocale(lang).catch(() => {
            setLanguageState('en');
            localStorage.setItem('verix-language', 'en');
        });
    }, [loadLocale]);

    const t = useCallback((key, vars = {}) => {
        const locale = loadedLocales[language] || en;

        // Try exact key first (flat)
        let val = locale[key] ?? en[key];

        // Fallback to nested if needed (optional, but keep it simple for now)
        if (!val && key.includes('.')) {
            const keys = key.split('.');
            val = locale;
            for (const k of keys) {
                val = val?.[k];
            }

            if (val === undefined) {
                val = en;
                for (const k of keys) {
                    val = val?.[k];
                }
            }
        }

        if (typeof val !== 'string') {
            return key;
        }

        return val.replace(/\{\{?(\w+)\}\}?/g, (match, name) => {
            return vars[name] !== undefined ? vars[name] : match;
        });
    }, [language, loadedLocales]);

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
