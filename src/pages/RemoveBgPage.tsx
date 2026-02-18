import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import AdPlaceholder from '../components/AdPlaceholder';
import FileUploader from '../components/FileUploader';
import { updateSEO } from '../utils/seo';
import { removeBackground, addWhiteBackground, addColorBackground } from '../utils/removeBg';

const RemoveBgPage = () => {
    const { t, locale } = useTranslation();

    // SEO
    useEffect(() => {
        updateSEO('removeBg', locale);
    }, [locale]);

    const [file, setFile] = useState<File | null>(null);
    const [originalUrl, setOriginalUrl] = useState<string | null>(null);
    const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
    const [processedUrl, setProcessedUrl] = useState<string | null>(null);
    const [displayUrl, setDisplayUrl] = useState<string | null>(null); // For showing color/white variations

    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Background options: 'transparent' | 'white' | 'custom'
    const [bgOption, setBgOption] = useState<'transparent' | 'white' | 'custom'>('transparent');
    const [customColor, setCustomColor] = useState('#ff0000');

    const handleFileSelect = (files: File[]) => {
        if (files.length > 0) {
            const selectedFile = files[0];
            setFile(selectedFile);
            setOriginalUrl(URL.createObjectURL(selectedFile));
            setError(null);

            // Start processing immediately
            processFile(selectedFile);
        }
    };

    const processFile = async (inputFile: File) => {
        setIsProcessing(true);
        setProgress(0);
        setError(null);
        setProcessedBlob(null);
        setProcessedUrl(null);
        setDisplayUrl(null);
        setBgOption('transparent');

        try {
            const blob = await removeBackground(inputFile, (p) => setProgress(p));
            setProcessedBlob(blob);
            const url = URL.createObjectURL(blob);
            setProcessedUrl(url);
            setDisplayUrl(url); // Default to transparent result
        } catch (err) {
            console.error(err, error); // Log error to use variable
            setError(t('common.error'));
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle background color change
    useEffect(() => {
        if (!processedBlob || !processedUrl) return;

        const updateBackground = async () => {
            let newBlob: Blob;
            if (bgOption === 'transparent') {
                setDisplayUrl(processedUrl);
                return;
            } else if (bgOption === 'white') {
                newBlob = await addWhiteBackground(processedBlob);
            } else {
                newBlob = await addColorBackground(processedBlob, customColor);
            }

            const newUrl = URL.createObjectURL(newBlob);
            setDisplayUrl(newUrl);

            // Clean up previous displayUrl if it wasn't the base processedUrl
            return () => {
                if (newUrl !== processedUrl) URL.revokeObjectURL(newUrl);
            };
        };

        // We can't easily await the cleanup in useEffect cleanup
        // But we can just run the update
        updateBackground();

        // This effect depends on bgOption state
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bgOption, customColor, processedBlob, processedUrl]);

    const handleDownload = () => {
        if (!displayUrl || !file) return;

        const link = document.createElement('a');
        link.href = displayUrl;

        let ext = 'png';
        if (bgOption === 'white' || (bgOption === 'custom')) {
            // Check mime type if possible, or just force jpg/png based on choice
            // addColorBackground returns png by default unless specified
            ext = 'png'; // keeping png for custom colors to support potential transparency if alpha used, though input is solid hex
            if (bgOption === 'white') ext = 'jpg';
        }

        const fileName = file.name.replace(/\.[^/.]+$/, "") + `_no-bg.${ext}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRetry = () => {
        setFile(null);
        setOriginalUrl(null);
        setProcessedBlob(null);
        setProcessedUrl(null);
        setDisplayUrl(null);
        setError(null);
        setProgress(0);
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">

            <main className="flex-grow pt-24 pb-16 px-4">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Ad */}
                    <div className="hidden lg:block lg:col-span-2">
                        <AdPlaceholder id="ad-removebg-left" width="100%" height={600} className="sticky top-24" />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {t('removeBg.title')}
                            </h1>
                            <p className="text-gray-600">
                                {t('removeBg.subtitle')}
                            </p>
                        </div>

                        {!file ? (
                            <div className="max-w-2xl mx-auto">
                                <FileUploader
                                    onFilesSelected={handleFileSelect}
                                    acceptFormats="image/*"
                                    maxFiles={1}
                                    maxSizeMB={10}
                                    description={t('removeBg.uploadHint')}
                                    uploadText={t('removeBg.upload')}
                                    icon={<span className="text-4xl mb-3">✨</span>}
                                />

                                <div className="mt-8">
                                    <AdPlaceholder id="ad-removebg-top" className="w-full h-[100px]" showCoupang={true} />
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-4xl mx-auto">
                                {isProcessing ? (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                            {t('removeBg.removing')}
                                        </h3>
                                        <div className="w-full max-w-md mx-auto bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {progress}%
                                        </p>
                                        <p className="text-xs text-gray-400 mt-4 bg-yellow-50 inline-block px-3 py-1 rounded-full text-yellow-700">
                                            ⚠️ {t('removeBg.removingDetail')}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                            {/* Original */}
                                            <div className="space-y-3">
                                                <div className="text-sm font-medium text-gray-500 text-center">{t('removeBg.original')}</div>
                                                <div className="bg-gray-50 rounded-xl overflow-hidden h-[300px] flex items-center justify-center border border-gray-100">
                                                    {originalUrl && (
                                                        <img
                                                            src={originalUrl}
                                                            alt="Original"
                                                            className="max-w-full max-h-full object-contain"
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Result */}
                                            <div className="space-y-3">
                                                <div className="text-sm font-medium text-blue-600 text-center">{t('removeBg.result')}</div>
                                                <div className="bg-gray-50 rounded-xl overflow-hidden h-[300px] flex items-center justify-center border border-gray-100 relative">
                                                    {/* Checkboard background */}
                                                    <div className="absolute inset-0" style={{
                                                        backgroundImage: 'linear-gradient(45deg, #ddd 25%, transparent 25%), linear-gradient(-45deg, #ddd 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ddd 75%), linear-gradient(-45deg, transparent 75%, #ddd 75%)',
                                                        backgroundSize: '20px 20px',
                                                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                                                        opacity: 0.3
                                                    }}></div>

                                                    {displayUrl && (
                                                        <img
                                                            src={displayUrl}
                                                            alt="Result"
                                                            className="max-w-full max-h-full object-contain relative z-10"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Background Options */}
                                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8 p-4 bg-gray-50 rounded-xl">
                                            <span className="text-sm font-medium text-gray-700">{t('removeBg.bgColor')}:</span>
                                            <div className="flex gap-4">
                                                {/* Transparent */}
                                                <button
                                                    onClick={() => setBgOption('transparent')}
                                                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center overflow-hidden transition-all ${bgOption === 'transparent' ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-300 hover:border-gray-400'}`}
                                                    title={t('removeBg.transparent')}
                                                >
                                                    <div className="w-full h-full bg-gray-200" style={{
                                                        backgroundImage: 'linear-gradient(45deg, #999 25%, transparent 25%), linear-gradient(-45deg, #999 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #999 75%), linear-gradient(-45deg, transparent 75%, #999 75%)',
                                                        backgroundSize: '8px 8px'
                                                    }}></div>
                                                </button>

                                                {/* White */}
                                                <button
                                                    onClick={() => setBgOption('white')}
                                                    className={`w-10 h-10 rounded-full border-2 bg-white transition-all ${bgOption === 'white' ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-300 hover:border-gray-400'}`}
                                                    title={t('removeBg.white')}
                                                ></button>

                                                {/* Custom */}
                                                <div className="relative">
                                                    <input
                                                        type="color"
                                                        value={customColor}
                                                        onChange={(e) => {
                                                            setCustomColor(e.target.value);
                                                            setBgOption('custom');
                                                        }}
                                                        className="w-10 h-10 p-0 border-0 rounded-full overflow-hidden cursor-pointer opacity-0 absolute inset-0"
                                                    />
                                                    <div
                                                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center pointer-events-none transition-all ${bgOption === 'custom' ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-300'}`}
                                                        style={{ backgroundColor: customColor }}
                                                    >
                                                        {bgOption === 'custom' && (
                                                            <span className="text-white text-xs drop-shadow-md">✓</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                            <button
                                                onClick={handleRetry}
                                                className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                                            >
                                                {t('removeBg.retry')}
                                            </button>
                                            <button
                                                onClick={handleDownload}
                                                className="px-8 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2"
                                            >
                                                <span>📥</span>
                                                {bgOption === 'transparent' ? t('removeBg.downloadPng') : t('removeBg.downloadWhite')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* FAQ */}
                        <div className="mt-16 max-w-3xl mx-auto">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">{t('removeBg.faqTitle')}</h3>
                            <div className="grid gap-6">
                                {[1, 2, 3].map((num) => (
                                    <div key={num} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                        <h4 className="font-semibold text-gray-800 mb-2">
                                            Q. {t(`removeBg.faq${num}q`)}
                                        </h4>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            A. {t(`removeBg.faq${num}a`)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-12">
                            <AdPlaceholder id="ad-removebg-bottom" className="w-full h-[150px]" showCoupang={true} />
                        </div>
                    </div>

                    {/* Right Ad */}
                    <div className="hidden lg:block lg:col-span-2">
                        <AdPlaceholder id="ad-removebg-right" width="100%" height={600} className="sticky top-24" />
                    </div>
                </div>
            </main>

        </div>
    );
};

export default RemoveBgPage;
