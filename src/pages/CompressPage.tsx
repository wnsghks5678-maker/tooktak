import { useState, useMemo, useEffect } from 'react';
import AdPlaceholder from '../components/AdPlaceholder';
import FileUploader from '../components/FileUploader';
import ResultCard from '../components/ResultCard';
import { formatFileSize, downloadFile, downloadAsZip } from '../utils/fileHelpers';
import { compressImage, type CompressionResult } from '../utils/imageCompress';
import { updateSEO } from '../utils/seo';

import { useTranslation } from '../i18n';

const CompressPage = () => {
    const { t, locale } = useTranslation();
    const [files, setFiles] = useState<File[]>([]);
    const [results, setResults] = useState<CompressionResult[]>([]);
    const [quality, setQuality] = useState<number>(70);
    const [isCompressing, setIsCompressing] = useState<boolean>(false);

    useEffect(() => {
        updateSEO('compress', locale);
    }, [locale]);

    const totalOriginalSize = useMemo(() => {
        return files.reduce((acc, file) => acc + file.size, 0);
    }, [files]);

    const estimatedSize = useMemo(() => {
        if (totalOriginalSize === 0) return 0;
        return totalOriginalSize * (quality / 100);
    }, [totalOriginalSize, quality]);

    const handleFilesSelected = (newFiles: File[]) => {
        if (files.length + newFiles.length > 10) {
            alert(t('common.error') + ': ' + t('compress.uploadHint')); // Simplified alert
            return;
        }
        setFiles(prev => [...prev, ...newFiles]);
        if (results.length > 0) setResults([]);
    };

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setResults([]);
    };

    const handleCompress = async () => {
        if (files.length === 0) return;

        setIsCompressing(true);
        setResults([]);

        try {
            const compressionPromises = files.map(file => compressImage(file, quality));
            const compressionResults = await Promise.all(compressionPromises);
            setResults(compressionResults);
        } catch (error) {
            console.error(error);
            alert(t('common.error'));
        } finally {
            setIsCompressing(false);
        }
    };

    const handleDownloadAll = async () => {
        if (results.length === 0) return;
        try {
            const filesToZip = results.map(r => r.compressedFile);
            await downloadAsZip(filesToZip, 'tooktak-compressed.zip');
        } catch (error) {
            console.error(error);
            alert(t('common.error'));
        }
    };

    return (
        <div className="flex justify-center gap-6 px-4 py-8 max-w-[1600px] mx-auto">
            {/* Left Ad Column */}
            <div className="hidden lg:block w-[160px] flex-shrink-0">
                <div className="sticky top-24">
                    <AdPlaceholder id="ad-compress-left" height="600px" width="160px" />
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-3xl">
                <div className="text-center mb-10">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#1E3A5F] mb-2">{t('compress.title')}</h1>
                    <p className="text-sm md:text-base text-gray-500">
                        {t('compress.subtitle')}
                    </p>
                </div>

                {/* Top Ad */}
                <AdPlaceholder id="ad-compress-top" className="mb-6" showCoupang={true} />

                {/* FAQ Section */}
                <FileUploader
                    onFilesSelected={handleFilesSelected}
                    acceptFormats="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif,image/tiff,image/heic,image/heif,.heic,.heif,.tiff,.tif,.bmp,.avif"
                    uploadText={t('compress.upload')}
                    hintText={t('compress.uploadHint')}
                />

                {/* File List & Settings */}
                {files.length > 0 && (
                    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* File List */}
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 mb-4">{t('compress.selectedFiles')} ({files.length})</h3>
                                <ul className="space-y-3">
                                    {files.map((file, index) => (
                                        <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <span className="text-xl">📄</span>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {formatFileSize(file.size)}
                                                        {(file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') ||
                                                            file.type === 'image/tiff' || file.name.toLowerCase().endsWith('.tiff') || file.name.toLowerCase().endsWith('.tif')) &&
                                                            <span className="ml-2 text-blue-500 font-medium text-xs">Converting...</span>
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFile(index)}
                                                className="text-gray-400 hover:text-red-500 p-1"
                                                disabled={isCompressing}
                                            >
                                                ❌
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Settings */}
                            <div className="w-full md:w-80 border-l border-gray-100 pl-0 md:pl-8 pt-6 md:pt-0 border-t md:border-t-0">
                                <h3 className="font-semibold text-gray-800 mb-6">{t('compress.quality')}</h3>

                                <div className="mb-8 relative pt-6 pb-2">
                                    {/* Floating Tooltip */}
                                    <div
                                        className="absolute -top-1 transform -translate-x-1/2 bg-blue-600 text-white text-sm rounded-md px-2 py-1 font-bold shadow-sm transition-all duration-75"
                                        style={{ left: `${(quality - 10) * 100 / 90}%` }}
                                    >
                                        {quality}%
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-blue-600"></div>
                                    </div>

                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        step="5"
                                        value={quality}
                                        onChange={(e) => {
                                            setQuality(Number(e.target.value));
                                            setResults([]);
                                        }}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        style={{
                                            background: `linear-gradient(to right, #3B82F6 0%, #2563EB ${(quality - 10) * 100 / 90}%, #E5E7EB ${(quality - 10) * 100 / 90}%, #E5E7EB 100%)`
                                        }}
                                    />
                                    {/* Styled Range Input CSS (Inline for simplicity, or move to css) */}
                                    <style>{`
                                        input[type=range]::-webkit-slider-thumb {
                                            -webkit-appearance: none;
                                            height: 24px;
                                            width: 24px;
                                            border-radius: 50%;
                                            background: #ffffff;
                                            border: 2px solid #3B82F6;
                                            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                                            cursor: pointer;
                                            margin-top: -8px;
                                        }
                                        input[type=range]::-webkit-slider-runnable-track {
                                            height: 8px;
                                            border-radius: 9999px;
                                        }
                                    `}</style>

                                    <div className="flex justify-between mt-6 text-xs text-gray-500 font-medium">
                                        <span>{t('compress.minSize')}</span>
                                        <span>{t('compress.maxQuality')}</span>
                                    </div>
                                </div>

                                {/* Estimated Size Display */}
                                <div className="bg-gray-50 rounded-lg p-3 mb-6">
                                    <p className="text-sm font-medium text-gray-700 mb-1">{t('compress.estimatedResult')}</p>
                                    <div className="text-sm text-gray-600">
                                        <span>{t('compress.original')}: {formatFileSize(totalOriginalSize)}</span>
                                        <span className="mx-1">→</span>
                                        <span className="font-semibold text-gray-900">{t('compress.estimated')}: ~{formatFileSize(estimatedSize)}</span>
                                    </div>
                                    <p className={`text-sm font-bold mt-1 ${100 - quality >= 10 ? 'text-green-600' : 'text-gray-500'}`}>
                                        ({t('compress.saved')} {100 - quality}%)
                                    </p>
                                </div>

                                <button
                                    onClick={handleCompress}
                                    disabled={isCompressing || files.length === 0}
                                    className={`
                                        w-full py-3 px-4 rounded-lg text-white font-medium transition-colors
                                        ${isCompressing
                                            ? 'bg-blue-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                                        }
                                    `}
                                >
                                    {isCompressing ? t('compress.compressing') : t('compress.startCompress')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results */}
                {results.length > 0 && (
                    <div className="mt-12">
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="text-xl font-bold text-gray-800">{t('compress.estimatedResult')}</h2>
                            {results.length > 1 && (
                                <button
                                    onClick={handleDownloadAll}
                                    className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    {t('compress.downloadAll')}
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {results.map((result, index) => (
                                <ResultCard
                                    key={index}
                                    fileName={result.originalFile.name}
                                    originalSize={result.originalSize}
                                    newSize={result.compressedSize}
                                    onDownload={() => downloadFile(result.compressedFile, `compressed_${result.originalFile.name}`)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* FAQ & Bottom Ad */}
                <div className="mt-20">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('compress.faqTitle')}</h2>
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-5">
                            <h3 className="font-medium text-gray-900 mb-2">Q: {t('compress.faq1q')}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                A: {t('compress.faq1a')}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-5">
                            <h3 className="font-medium text-gray-900 mb-2">Q: {t('compress.faq2q')}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                A: {t('compress.faq2a')}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-5">
                            <h3 className="font-medium text-gray-900 mb-2">Q: {t('compress.faq3q')}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                A: {t('compress.faq3a')}
                            </p>
                        </div>
                    </div>

                    <div className="mt-12">
                        <AdPlaceholder id="ad-compress-bottom" showCoupang={true} />
                    </div>
                </div>
            </div>

            {/* Right Ad Column */}
            <div className="hidden lg:block w-[160px] flex-shrink-0">
                <div className="sticky top-24">
                    <AdPlaceholder id="ad-compress-right" height="600px" width="160px" />
                </div>
            </div>
        </div>
    );
};

export default CompressPage;
