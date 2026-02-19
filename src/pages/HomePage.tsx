import { useEffect } from 'react';
import { useTranslation } from '../i18n';
import { Helmet } from 'react-helmet-async';
import AdPlaceholder from '../components/AdPlaceholder';
import ToolCard from '../components/ToolCard';
import { updateSEO } from '../utils/seo';

const HomePage = () => {
    const { t, locale } = useTranslation();

    useEffect(() => {
        updateSEO('home', locale);
    }, [locale]);

    const tools = [
        { icon: "\uD83D\uDDDC\uFE0F", titleKey: 'tools.compress.title', descKey: 'tools.compress.desc', link: "/compress", isComingSoon: false },
        { icon: "\uD83D\uDD04", titleKey: 'tools.convert.title', descKey: 'tools.convert.desc', link: "/convert", isComingSoon: false },
        { icon: "\uD83D\uDD2D", titleKey: 'tools.resize.title', descKey: 'tools.resize.desc', link: "/resize", isComingSoon: false },
        { icon: "\uD83D\uDCC4", titleKey: 'tools.pdfMerge.title', descKey: 'tools.pdfMerge.desc', link: "/pdf-merge", isComingSoon: false },
        { icon: "\u2702\uFE0F", titleKey: 'tools.pdfSplit.title', descKey: 'tools.pdfSplit.desc', link: "/pdf-split", isComingSoon: false },
        { icon: "\uD83D\uDCC9", titleKey: 'tools.pdfCompress.title', descKey: 'tools.pdfCompress.desc', link: "/pdf-compress", isComingSoon: false },
        { icon: "\uD83D\uDDBC\uFE0F", titleKey: 'tools.removeBg.title', descKey: 'tools.removeBg.desc', link: "/remove-bg", isComingSoon: false },
        { icon: "\uD83D\uDD0D", titleKey: 'tools.upscale.title', descKey: 'tools.upscale.desc', link: "/upscale", isComingSoon: false },
        { icon: "\uD83D\uDCF1", titleKey: 'tools.qrCode.title', descKey: 'tools.qrCode.desc', link: "/qr-code", isComingSoon: false },
        { icon: "🔐", titleKey: 'tools.passwordGen.title', descKey: 'tools.passwordGen.desc', link: "/password-generator", isComingSoon: false },
        { icon: "🎬", titleKey: 'tools.videoToGif.title', descKey: 'tools.videoToGif.desc', link: "/video-to-gif", isComingSoon: false },
        { icon: "📝", titleKey: 'tools.ocr.title', descKey: 'tools.ocr.desc', link: "/ocr", isComingSoon: false },
        { icon: "\uD83E\uDDF9", titleKey: 'tools.watermarkRemove.title', descKey: 'tools.watermarkRemove.desc', link: "/watermark-remove", isComingSoon: false },
        { icon: "💧", titleKey: 'tools.watermark.title', descKey: 'tools.watermark.desc', link: "/watermark", isComingSoon: false },
    ];

    return (
        <div className="w-full">
            <Helmet>
                <title>{locale === 'ko' ? '\uB69D\uB531 - \uBB34\uB8CC \uC628\uB77C\uC778 \uC774\uBBF8\uC9C0 \uC555\uCD95, \uBCC0\uD658, PDF \uB3C4\uAD6C' : 'TookTak - Free Online Image Compression, Conversion & PDF Tools'}</title>
                <meta name="description" content={locale === 'ko' ? '\uC774\uBBF8\uC9C0 \uC555\uCD95, \uD3EC\uB9F7 \uBCC0\uD658, \uD06C\uAE30 \uC870\uC808, PDF \uD569\uCE58\uAE30, \uB098\uB204\uAE30, \uC555\uCD95, QR\uCF54\uB4DC \uC0DD\uC131\uAE4C\uC9C0. 100% \uBB34\uB8CC, \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uBC14\uB85C \uCC98\uB9AC. \uC11C\uBC84 \uC5C5\uB85C\uB4DC \uC5C6\uC774 \uC548\uC804\uD558\uAC8C.' : 'Compress, convert, resize images. Merge, split, compress PDFs. Generate QR codes. 100% free, browser-based. No server upload.'} />
                <meta property="og:title" content={locale === 'ko' ? '\uB69D\uB531 - \uBB34\uB8CC \uC628\uB77C\uC778 \uC774\uBBF8\uC9C0 & PDF \uB3C4\uAD6C' : 'TookTak - Free Online Image & PDF Tools'} />
                <meta property="og:description" content={locale === 'ko' ? '\uC774\uBBF8\uC9C0 \uC555\uCD95, \uBCC0\uD658, PDF \uD3B8\uC9D1 \uB4F1 \uBB34\uB8CC \uC628\uB77C\uC778 \uB3C4\uAD6C' : 'Free online tools for images and PDFs'} />
                <meta property="og:url" content="https://tooktak.pages.dev/" />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://tooktak.pages.dev/" />
            </Helmet>

            <div className="w-full mb-10">
                <AdPlaceholder id="home-top" showCoupang={true} />
            </div>

            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-4 py-2">
                    {t('home.title')}
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    {t('home.subtitle')}
                </p>
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="lg:col-span-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center lg:text-left">{t('home.toolsTitle')}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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

            <div className="bg-gray-50 rounded-2xl p-6 mt-12">
                <h2 className="text-lg font-bold text-gray-800 mb-3">{locale === 'ko' ? '\uB69D\uB531 - \uBB34\uB8CC \uC628\uB77C\uC778 \uD30C\uC77C \uB3C4\uAD6C' : 'TookTak - Free Online File Tools'}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{t('home.seoText')}</p>
            </div>

            <div className="w-full mt-10">
                <AdPlaceholder id="home-bottom" showCoupang={true} />
            </div>
        </div>
    );
};

export default HomePage;