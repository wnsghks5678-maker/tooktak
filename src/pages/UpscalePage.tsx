import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from '../i18n';
import AdPlaceholder from '../components/AdPlaceholder';
import FileUploader from '../components/FileUploader';
import { updateSEO } from '../utils/seo';
import { upscaleImage } from '../utils/imageUpscale';
import { formatFileSize } from '../utils/fileHelpers';

const UpscalePage = () => {
    const { t, locale } = useTranslation();

    // SEO
    useEffect(() => {
        updateSEO('upscale', locale);
    }, [locale]);

    const [file, setFile] = useState<File | null>(null);
    const [originalUrl, setOriginalUrl] = useState<string | null>(null);
    const [originalDims, setOriginalDims] = useState<{ w: number, h: number } | null>(null);

    // Processed state
    const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
    const [processedUrl, setProcessedUrl] = useState<string | null>(null);
    const [processedDims, setProcessedDims] = useState<{ w: number, h: number } | null>(null);

    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Options
    const [scale, setScale] = useState<2 | 3 | 4>(2);

    const handleFileSelect = (files: File[]) => {
        if (files.length > 0) {
            const selectedFile = files[0];
            setFile(selectedFile);

            const url = URL.createObjectURL(selectedFile);
            setOriginalUrl(url);

            // Get dimensions
            const img = new Image();
            img.onload = () => {
                setOriginalDims({ w: img.width, h: img.height });
            };
            img.src = url;

            setProcessedBlob(null);
            setProcessedUrl(null);
            setProcessedDims(null);
            setError(null);
        }
    };

    const handleUpscale = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);

        try {
            const result = await upscaleImage(file, scale);
            setProcessedBlob(result.blob);
            setProcessedUrl(URL.createObjectURL(result.blob));
            setProcessedDims({ w: result.newWidth, h: result.newHeight });
        } catch (err) {
            console.error(err, error);
            setError(t('common.error'));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!processedUrl || !file) return;

        const link = document.createElement('a');
        link.href = processedUrl;

        const fileName = file.name.replace(/\.[^/.]+$/, "") + `_upscaled_${scale}x.png`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRetry = () => {
        setFile(null);
        setOriginalUrl(null);
        setOriginalDims(null);
        setProcessedBlob(null);
        setProcessedUrl(null);
        setProcessedDims(null);
        setError(null);
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Helmet>
                <title>{locale === 'ko' ? '이미지 업스케일링 - 사진 해상도 높이기, 화질 개선 | 뚝딱' : 'Image Upscaler - Increase Image Resolution & Quality | TookTak'}</title>
                <meta name="description" content={locale === 'ko' ? 'AI 기술로 이미지 해상도를 2배, 3배, 4배까지 높여보세요. 깨진 사진 복원, 선명한 화질 개선. 무료, 로그인 필요 없음.' : 'Upscale images up to 4x with AI. Restore blurry photos and improve quality. Free, no login required.'} />
                <meta property="og:url" content="https://tooktak.pages.dev/upscale" />
                <link rel="canonical" href="https://tooktak.pages.dev/upscale" />
            </Helmet>

            <main className="flex-grow pt-24 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {t('upscale.title')}
                        </h1>
                        <p className="text-gray-600">
                            {t('upscale.subtitle')}
                        </p>
                    </div>

                    {!file ? (
                        <div className="max-w-2xl mx-auto">
                            <FileUploader
                                onFilesSelected={handleFileSelect}
                                acceptFormats="image/*"
                                maxFiles={1}
                                maxSizeMB={5}
                                description={t('upscale.uploadHint')}
                                uploadText={t('upscale.upload')}
                                icon={<span className="text-4xl mb-3">🔍</span>}
                            />

                            <div className="w-full mb-10">
                                <AdPlaceholder id="ad-upscale-top" showCoupang={true} />
                            </div>
                        </div>
                    ) : !processedUrl ? (
                        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                            {/* Preview Original */}
                            <div className="flex flex-col items-center mb-8">
                                <div className="relative h-48 w-full bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center mb-4">
                                    {originalUrl && (
                                        <img src={originalUrl} alt="Original" className="max-w-full max-h-full object-contain" />
                                    )}
                                </div>
                                <div className="text-sm text-gray-500 font-medium">
                                    {t('upscale.originalSize')}: {originalDims?.w} x {originalDims?.h} px
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {formatFileSize(file.size)}
                                </div>
                            </div>

                            {/* Scale Options */}
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-gray-800 mb-4 text-center">{t('upscale.scale')}</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {[2, 3, 4].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setScale(s as 2 | 3 | 4)}
                                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${scale === s ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}
                                        >
                                            <span className="text-2xl font-bold mb-1">{s}x</span>
                                            <span className="text-xs text-center opacity-80">
                                                {s === 4 ? t('upscale.scale4x') : s === 3 ? t('upscale.scale3x') : t('upscale.scale2x')}
                                            </span>
                                            {s === 4 && (
                                                <span className="text-[10px] text-orange-500 mt-1 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
                                                    Slow
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Estimated Result */}
                                {originalDims && (
                                    <div className="text-center mt-4 text-sm text-gray-500">
                                        {t('upscale.estimated') || 'Estimated'}:
                                        <span className="font-medium text-gray-800 ml-2">
                                            {originalDims.w * scale} x {originalDims.h * scale} px
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Action */}
                            <div className="text-center">
                                <button
                                    onClick={handleUpscale}
                                    disabled={isProcessing}
                                    className="w-full md:w-auto px-8 py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>{t('upscale.upscaling')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>🔍</span>
                                            <span>{t('upscale.startUpscale')}</span>
                                        </>
                                    )}
                                </button>
                                <div className="mt-3 text-xs text-gray-400">
                                    {t('upscale.upscalingDetail')}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Result View
                        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                {/* Original */}
                                <div className="space-y-3">
                                    <div className="text-sm font-medium text-gray-500 text-center">{t('upscale.original')}</div>
                                    <div className="bg-gray-50 rounded-xl overflow-hidden h-[300px] flex items-center justify-center border border-gray-100">
                                        {originalUrl && (
                                            <img src={originalUrl} alt="Original" className="max-w-full max-h-full object-contain" />
                                        )}
                                    </div>
                                    <div className="text-center text-xs text-gray-500 leading-relaxed">
                                        {originalDims?.w} x {originalDims?.h} px<br />
                                        {formatFileSize(file.size)}
                                    </div>
                                </div>

                                {/* Result */}
                                <div className="space-y-3">
                                    <div className="text-sm font-medium text-blue-600 text-center">{t('upscale.result')}</div>
                                    <div className="bg-gray-50 rounded-xl overflow-hidden h-[300px] flex items-center justify-center border border-gray-100 relative group">
                                        {processedUrl && (
                                            <img src={processedUrl} alt="Result" className="max-w-full max-h-full object-contain" />
                                        )}
                                    </div>
                                    <div className="text-center text-xs text-blue-600 font-medium leading-relaxed">
                                        {processedDims?.w} x {processedDims?.h} px<br />
                                        {processedBlob && formatFileSize(processedBlob.size)}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={handleRetry}
                                    className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                                >
                                    {t('upscale.retry')}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="px-8 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <span>📥</span>
                                    {t('upscale.download')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* FAQ */}
                    <div className="mt-16 max-w-3xl mx-auto">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">{t('upscale.faqTitle')}</h3>
                        <div className="grid gap-6">
                            {[1, 2, 3].map((num) => (
                                <div key={num} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                    <h4 className="font-semibold text-gray-800 mb-2">
                                        Q. {t(`upscale.faq${num}q`)}
                                    </h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        A. {t(`upscale.faq${num}a`)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 mt-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-3">{locale === 'ko' ? '이미지 업스케일링이랑?' : 'What is Image Upscaling?'}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {locale === 'ko'
                                ? '이미지 업스케일링은 저해상도 이미지의 품질을 잃지 않고 크기를 키우는 기술입니다. 뚝딱은 최신 AI 알고리즘을 사용하여 이미지를 분석하고 픽셀을 보간하여 선명하게 확대합니다. 작은 이미지를 인쇄용으로 만들거나 옛날 사진의 화질을 개선할 때 유용합니다.'
                                : 'Image upscaling increases image size without losing quality. TookTak uses advanced AI algorithms to analyze the image and interpolate pixels for a sharp, high-resolution result. Perfect for enlarging small images for print or restoring old photos.'}
                        </p>
                    </div>

                    <div className="w-full mt-10">
                        <AdPlaceholder id="ad-upscale-bottom" showCoupang={true} />
                    </div>
                </div>
            </main>

        </div>
    );
};

export default UpscalePage;
