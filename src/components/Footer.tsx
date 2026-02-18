import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';

const Footer = () => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-[#1E3A5F] text-white py-10 mt-auto">
            <div className="max-w-[1200px] mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
                    {/* Left: Branding */}
                    <div className="md:w-1/3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">🔨</span>
                            <span className="text-xl font-bold">{t('header.siteName')}</span>
                        </div>
                        <p className="text-sm text-gray-300">
                            {t('footer.slogan')}
                        </p>
                    </div>

                    {/* Center: Tools */}
                    <div className="md:w-1/3">
                        <h3 className="text-sm font-semibold text-gray-300 uppercase mb-4 tracking-wider">
                            {t('footer.toolsTitle')}
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/compress" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    {t('header.compress')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/convert" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    {t('header.convert')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/resize" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    {t('header.resize')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Right: Info */}
                    <div className="md:w-1/3">
                        <h3 className="text-sm font-semibold text-gray-300 uppercase mb-4 tracking-wider">
                            {t('footer.infoTitle')}
                        </h3>
                        <ul className="space-y-2">
                            <li className="text-sm text-gray-400 flex items-center gap-2">
                                <span>🔒</span> {t('footer.browserOnly')}
                            </li>
                            <li className="text-sm text-gray-400 flex items-center gap-2">
                                <span>☁️</span> {t('footer.noUpload')}
                            </li>
                            <li className="text-sm text-gray-400 flex items-center gap-2">
                                <span>👤</span> {t('footer.noSignup')}
                            </li>
                        </ul>
                        {/* Coupang Disclosure */}
                        <div className="mt-6 text-xs text-gray-500">
                            {t('footer.coupangDisclosure')}
                        </div>
                    </div>
                </div>

                {/* Bottom: Copyright */}
                <div className="border-t border-gray-500/30 pt-6 text-center">
                    <p className="text-sm text-gray-400">
                        © {currentYear} {t('header.siteName')} TookTak. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
