import { useEffect } from 'react';
import { useTranslation } from '../i18n';
import AdPlaceholder from '../components/AdPlaceholder';
import ToolCard from '../components/ToolCard';
import { updateSEO } from '../utils/seo';

const HomePage = () => {
    const { t, locale } = useTranslation();

    useEffect(() => {
        updateSEO('home', locale);
    }, [locale]);

    const tools = [
        {
            icon: "🗜️",
            titleKey: 'tools.compress.title',
            descKey: 'tools.compress.desc',
            link: "/compress",
            isComingSoon: false
        },
        {
            icon: "🔄",
            titleKey: 'tools.convert.title',
            descKey: 'tools.convert.desc',
            link: "/convert",
            isComingSoon: false
        },
        {
            icon: "📐",
            titleKey: 'tools.resize.title',
            descKey: 'tools.resize.desc',
            link: "/resize",
            isComingSoon: false
        },
        {
            id: 'pdfMerge',
            icon: '📄',
            titleKey: 'tools.pdfMerge.title',
            descKey: 'tools.pdfMerge.desc',
            link: '/pdf-merge',
            color: 'bg-red-50 text-red-600'
        },
        {
            id: 'pdfSplit',
            icon: '✂️',
            titleKey: 'tools.pdfSplit.title',
            descKey: 'tools.pdfSplit.desc',
            link: '/pdf-split',
            color: 'bg-orange-50 text-orange-600'
        },
        {
            icon: "📦",
            titleKey: 'tools.pdfCompress.title',
            descKey: 'tools.pdfCompress.desc',
            link: "/pdf-compress",
            isComingSoon: false
        },
        {
            icon: "✨",
            titleKey: 'tools.removeBg.title',
            descKey: 'tools.removeBg.desc',
            link: "/remove-bg",
            isComingSoon: false
        },
        {
            icon: "🔍",
            titleKey: 'tools.upscale.title',
            descKey: 'tools.upscale.desc',
            link: "/upscale",
            isComingSoon: false
        },
        {
            icon: "📱",
            titleKey: 'tools.qrCode.title',
            descKey: 'tools.qrCode.desc',
            link: "/qr-code",
            isComingSoon: false
        },
    ];

    return (
        <div className="w-full">
            {/* Top Ad */}
            <div className="w-full mb-10">
                <AdPlaceholder id="home-top" showCoupang={true} />
            </div>

            {/* Hero Section */}
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-4 py-2">
                    {t('home.title')}
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    {t('home.subtitle')}
                </p>
            </div>

            {/* Tools Grid Section */}
            <div className="max-w-7xl mx-auto">
                <div className="lg:col-span-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center lg:text-left">{t('home.toolsTitle')}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tools.map((tool, index) => (
                            <ToolCard
                                key={index}
                                icon={tool.icon}
                                title={t(tool.titleKey || '')}
                                description={t(tool.descKey || '')}
                                link={tool.link}
                                isComingSoon={tool.isComingSoon}
                                className="min-w-0 break-words"
                                titleClassName="text-base font-bold"
                                descriptionClassName="text-sm text-gray-500"
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Ad */}
            <div className="w-full mt-10">
                <AdPlaceholder id="home-bottom" showCoupang={true} />
            </div>
        </div>
    );
};

export default HomePage;
