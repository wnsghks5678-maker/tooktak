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
            <Helmet>
                <title>{locale === 'ko' ? '뚝딱 - 무료 온라인 이미지 압축, 변환, PDF 도구' : 'TookTak - Free Online Image Compression, Conversion & PDF Tools'}</title>
                <meta name="description" content={locale === 'ko' ? '이미지 압축, 포맷 변환, 크기 조절, PDF 합치기, 나누기, 압축, QR코드 생성까지. 100% 무료, 브라우저에서 바로 처리. 서버 업로드 없이 안전하게.' : 'Compress, convert, resize images. Merge, split, compress PDFs. Generate QR codes. 100% free, browser-based. No server upload.'} />
                <meta property="og:title" content={locale === 'ko' ? '뚝딱 - 무료 온라인 이미지 & PDF 도구' : 'TookTak - Free Online Image & PDF Tools'} />
                <meta property="og:description" content={locale === 'ko' ? '이미지 압축, 변환, PDF 편집 등 무료 온라인 도구' : 'Free online tools for images and PDFs'} />
                <meta property="og:url" content="https://tooktak.pages.dev/" />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://tooktak.pages.dev/" />
            </Helmet>

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

            {/* SEO Text Section */}
            <div className="bg-gray-50 rounded-2xl p-6 mt-12">
                <h2 className="text-lg font-bold text-gray-800 mb-3">{locale === 'ko' ? '뚝딱 - 무료 온라인 파일 도구' : 'TookTak - Free Online File Tools'}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {locale === 'ko'
                        ? '뚝딱은 이미지 압축, 이미지 포맷 변환, 이미지 크기 조절, PDF 합치기, PDF 나누기, PDF 압축, QR코드 생성, AI 배경 제거, AI 화질 개선 등 다양한 무료 온라인 도구를 제공합니다. 모든 파일은 사용자의 브라우저에서 직접 처리되어 서버에 업로드되지 않으므로 개인정보가 안전하게 보호됩니다. 회원가입 없이 누구나 무료로 이용할 수 있으며, JPG, PNG, WEBP, GIF, BMP, AVIF, TIFF, HEIC 등 다양한 이미지 포맷을 지원합니다.'
                        : 'TookTak provides free online tools including image compression, format conversion, resizing, PDF merge, split, compress, QR code generation, AI background removal, and AI image upscaling. All files are processed directly in your browser — never uploaded to any server — ensuring complete privacy. No signup required, supporting JPG, PNG, WEBP, GIF, BMP, AVIF, TIFF, HEIC and more.'}
                </p>
            </div>

            {/* Bottom Ad */}
            <div className="w-full mt-10">
                <AdPlaceholder id="home-bottom" showCoupang={true} />
            </div>
        </div>
    );
};

export default HomePage;
