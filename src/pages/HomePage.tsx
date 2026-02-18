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
            {/* Hero Section */}
            <section className="bg-gray-50 py-16 px-6 text-center">
                <div className="max-w-[1200px] mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-3">
                        {t('home.title')}
                    </h1>
                    <p className="text-base text-gray-500 mt-3 mb-6 max-w-2xl mx-auto">
                        {t('home.subtitle')}
                    </p>

                    <div className="flex flex-wrap justify-center gap-3">
                        <div className="bg-blue-50 text-blue-700 text-sm rounded-full px-4 py-1.5 font-medium border border-blue-100">
                            ✅ {t('home.badge1')}
                        </div>
                        <div className="bg-blue-50 text-blue-700 text-sm rounded-full px-4 py-1.5 font-medium border border-blue-100">
                            ✅ {t('home.badge2')}
                        </div>
                        <div className="bg-blue-50 text-blue-700 text-sm rounded-full px-4 py-1.5 font-medium border border-blue-100">
                            ✅ {t('home.badge3')}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content with Side Ads */}
            <section className="px-4 py-12 max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar Ad */}
                    <div className="hidden lg:block lg:col-span-2">
                        <AdPlaceholder id="ad-home-left" width="100%" height={600} className="sticky top-20" />
                    </div>

                    {/* Middle Content */}
                    <div className="lg:col-span-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center lg:text-left">{t('home.toolsTitle')}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tools.map((tool, index) => (
                                <ToolCard
                                    key={index}
                                    icon={tool.icon}
                                    title={t(tool.titleKey || '')}
                                    description={t(tool.descKey || '')}
                                    link={tool.link}
                                    isComingSoon={tool.isComingSoon}
                                />
                            ))}
                        </div>

                        <div className="mt-12">
                            <AdPlaceholder id="ad-main-bottom" className="w-full h-[150px]" showCoupang={true} />

                            {/* SEO Text */}
                            <div className="mt-12 p-6 bg-gray-50 rounded-xl text-sm text-gray-500 leading-relaxed border border-gray-100">
                                {t('home.seoText')}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar Ad */}
                    <div className="hidden lg:block lg:col-span-2">
                        <AdPlaceholder id="ad-home-right" width="100%" height={600} className="sticky top-20" />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
