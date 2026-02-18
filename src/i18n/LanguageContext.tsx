import { createContext, useState, useEffect, type ReactNode } from 'react';
import detectLanguageByCountry from './detectCountry';
import ko from './locales/ko.json';
import en from './locales/en.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';

type Locale = 'ko' | 'en' | 'zh' | 'ja';
type Translations = typeof ko;

interface LanguageContextProps {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    isDetecting: boolean;
    t: (key: string, params?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextProps>({
    locale: 'ko',
    setLocale: () => { },
    isDetecting: false,
    t: (key: string) => key,
});

const translations: Record<Locale, Translations> = {
    ko,
    en,
    zh,
    ja,
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [locale, setLocaleState] = useState<Locale>('ko');
    const [isDetecting, setIsDetecting] = useState(true);

    // Helper to change locale and save to localStorage
    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('tooktak-lang', newLocale);
        document.documentElement.lang = newLocale;
    };

    useEffect(() => {
        const initLanguage = async () => {
            // 1. Check localStorage
            const saved = localStorage.getItem('tooktak-lang') as Locale;
            if (saved && ['ko', 'en', 'zh', 'ja'].includes(saved)) {
                setLocaleState(saved);
                document.documentElement.lang = saved;
                setIsDetecting(false);
                return;
            }

            // 2. Check IP Location
            try {
                const detectedLang = await detectLanguageByCountry();
                if (['ko', 'en', 'zh', 'ja'].includes(detectedLang)) {
                    setLocaleState(detectedLang as Locale);
                    document.documentElement.lang = detectedLang;
                } else {
                    setLocaleState('en');
                    document.documentElement.lang = 'en';
                }
            } catch (error) {
                console.error('Language detection failed', error);
                // 3. Fallback to browser language
                const browserLang = navigator.language.slice(0, 2);
                if (['ko', 'en', 'zh', 'ja'].includes(browserLang)) {
                    setLocaleState(browserLang as Locale);
                    document.documentElement.lang = browserLang;
                } else {
                    setLocaleState('en');
                    document.documentElement.lang = 'en';
                }
            } finally {
                setIsDetecting(false);
            }
        };

        initLanguage();
    }, []);

    // Translation function
    const t = (key: string, params?: Record<string, string | number>): string => {
        const keys = key.split('.');
        let value: any = translations[locale];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k as keyof typeof value];
            } else {
                return key; // Fallback to key if not found
            }
        }

        let result = typeof value === 'string' ? value : key;

        // Perform interpolation
        if (params && result) {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                result = result.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
            });
        }

        return result;
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, isDetecting, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
