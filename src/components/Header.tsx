import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../i18n';

const Header = () => {
    const { t, locale, setLocale } = useTranslation();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);

    // Close menus when route changes
    useEffect(() => {
        setIsMenuOpen(false);
        setIsLangOpen(false);
    }, [location]);

    const languages = [
        { code: 'ko', label: '한국어', flag: '🇰🇷' },
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'zh', label: '中文', flag: '🇨🇳' },
        { code: 'ja', label: '日本語', flag: '🇯🇵' },
    ];

    const currentLang = languages.find(l => l.code === locale) || languages[0];

    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm h-16">
            <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <span className="text-xl">🔨</span>
                    <span className="text-xl font-bold text-[#1E3A5F]">
                        {t('header.siteName')}
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link
                        to="/compress"
                        className={`text-sm font-medium transition-colors ${location.pathname === '/compress' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
                            }`}
                    >
                        {t('header.compress')}
                    </Link>
                    <Link
                        to="/convert"
                        className={`text-sm font-medium transition-colors ${location.pathname === '/convert' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
                            }`}
                    >
                        {t('header.convert')}
                    </Link>
                    <Link
                        to="/resize"
                        className={`text-sm font-medium transition-colors ${location.pathname === '/resize' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
                            }`}
                    >
                        {t('header.resize')}
                    </Link>

                    {/* Language Switcher (Desktop) */}
                    <div className="relative">
                        <button
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors px-2 py-1 rounded-md hover:bg-gray-50"
                        >
                            <span>🌐</span>
                            <span>{currentLang.label}</span>
                        </button>

                        {isLangOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setLocale(lang.code as any);
                                                setIsLangOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex items-center justify-between"
                                        >
                                            <span className="flex items-center gap-2">
                                                <span>{lang.flag}</span>
                                                <span>{lang.label}</span>
                                            </span>
                                            {locale === lang.code && <span className="text-blue-600">✓</span>}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-2xl text-gray-700"
                    onClick={() => setIsMenuOpen(true)}
                >
                    ☰
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 bg-white flex flex-col">
                    <div className="h-16 px-6 flex items-center justify-between border-b border-gray-100">
                        <Link to="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                            <span className="text-xl">🔨</span>
                            <span className="text-xl font-bold text-[#1E3A5F]">
                                {t('header.siteName')}
                            </span>
                        </Link>
                        <button
                            className="text-2xl text-gray-500"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            ✕
                        </button>
                    </div>

                    <nav className="flex-1 px-6 py-6 overflow-y-auto">
                        <ul className="flex flex-col">
                            <li>
                                <Link
                                    to="/compress"
                                    className="block text-lg py-4 border-b border-gray-100 text-gray-700 font-medium"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t('header.compress')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/convert"
                                    className="block text-lg py-4 border-b border-gray-100 text-gray-700 font-medium"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t('header.convert')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/resize"
                                    className="block text-lg py-4 border-b border-gray-100 text-gray-700 font-medium"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t('header.resize')}
                                </Link>
                            </li>
                        </ul>

                        {/* Language Selection (Mobile) */}
                        <div className="mt-8">
                            <p className="text-sm text-gray-500 mb-3">Language</p>
                            <div className="flex flex-wrap gap-2">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => setLocale(lang.code as any)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${locale === lang.code
                                                ? 'bg-blue-100 border-blue-200 text-blue-700 font-semibold'
                                                : 'bg-white border-gray-200 text-gray-600'
                                            }`}
                                    >
                                        <span>{lang.flag}</span>
                                        <span>{lang.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
