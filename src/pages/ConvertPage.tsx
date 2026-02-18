import { useState, useEffect } from 'react';
import AdPlaceholder from '../components/AdPlaceholder';
import FileUploader from '../components/FileUploader';
import ResultCard from '../components/ResultCard';
import { useTranslation } from '../i18n';
import { formatFileSize, downloadFile, downloadAsZip } from '../utils/fileHelpers';
import { convertImage, type ConvertResult } from '../utils/imageConvert';
import { updateSEO } from '../utils/seo';

const ConvertPage = () => {
    const { t, locale } = useTranslation();
    const [files, setFiles] = useState<File[]>([]);
    const [targetFormat, setTargetFormat] = useState<string>('JPG');
    const [results, setResults] = useState<ConvertResult[]>([]);
    const [isConverting, setIsConverting] = useState<boolean>(false);

    useEffect(() => {
        updateSEO('convert', locale);
    }, [locale]);

    const handleFilesSelected = (newFiles: File[]) => {
        if (files.length + newFiles.length > 20) {
            alert(t('common.error'));
            return;
        }
        setFiles(prev => [...prev, ...newFiles]);
        if (results.length > 0) setResults([]);
    };

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setResults([]);
    };

    const handleConvert = async () => {
        if (files.length === 0) return;

        setIsConverting(true);
        setResults([]);

        try {
            const convertPromises = files.map(file => convertImage(file, targetFormat));
            const convertResults = await Promise.all(convertPromises);
            setResults(convertResults);
        } catch (error) {
            console.error(error);
            alert(t('common.error'));
        } finally {
            setIsConverting(false);
        }
    };

    const handleDownloadAll = async () => {
        if (results.length === 0) return;
        try {
            const filesToZip = results.map(r => r.convertedFile);
            await downloadAsZip(filesToZip, 'tooktak-converted.zip');
        } catch (error) {
            console.error(error);
            alert(t('common.error'));
        }
    };

    const formats = ['JPG', 'PNG', 'WEBP', 'GIF', 'BMP', 'AVIF'];

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="text-center mb-10">
                <h1 className="text-2xl md:text-3xl font-bold text-[#1E3A5F] mb-2">{t('convert.title')}</h1>
                <p className="text-sm md:text-base text-gray-500">
                    {t('convert.subtitle')}
                </p>
            </div>

            <div className="w-full mb-10">
                <AdPlaceholder id="ad-convert-top" showCoupang={true} />
            </div>

            <FileUploader
                onFilesSelected={handleFilesSelected}
                acceptFormats="image/*,.heic,.heif,.tiff,.tif"
                uploadText={t('compress.upload')}
                hintText={t('compress.uploadHint')}
                maxFiles={20}
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
                                                    <span className="ml-2 text-gray-300">→</span>
                                                    <span className="ml-2 font-medium text-blue-600">{targetFormat}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFile(index)}
                                            className="text-gray-400 hover:text-red-500 p-1"
                                            disabled={isConverting}
                                        >
                                            ❌
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Settings */}
                        <div className="w-full md:w-80 border-l border-gray-100 pl-0 md:pl-8 pt-6 md:pt-0 border-t md:border-t-0">
                            <h3 className="font-semibold text-gray-800 mb-6">{t('convert.selectFormat')}</h3>

                            <div className="grid grid-cols-3 gap-2 mb-8">
                                {formats.map(fmt => (
                                    <button
                                        key={fmt}
                                        onClick={() => {
                                            setTargetFormat(fmt);
                                            setResults([]);
                                        }}
                                        className={`
                                            py-2 rounded-lg text-sm font-medium transition-all
                                            ${targetFormat === fmt
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }
                                        `}
                                    >
                                        {fmt}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleConvert}
                                disabled={isConverting || files.length === 0}
                                className={`
                                    w-full py-3 px-4 rounded-lg text-white font-medium transition-colors
                                    ${isConverting
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                                    }
                                `}
                            >
                                {isConverting ? t('convert.converting') : t('convert.startConvert')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <div className="mt-12">
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-xl font-bold text-gray-800">{t('convert.estimatedResult')}</h2>
                        {results.length > 1 && (
                            <button
                                onClick={handleDownloadAll}
                                className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                {t('convert.downloadAll')}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.map((result, index) => (
                            <ResultCard
                                key={index}
                                fileName={result.convertedFile.name}
                                originalSize={result.originalSize}
                                newSize={result.convertedSize}
                                onDownload={() => downloadFile(result.convertedFile, result.convertedFile.name)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* FAQ */}
            <div className="mt-20">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('convert.faqTitle')}</h2>
                <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-5">
                        <h3 className="font-medium text-gray-900 mb-2">Q: {t('convert.faq1q')}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            A: {t('convert.faq1a')}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-5">
                        <h3 className="font-medium text-gray-900 mb-2">Q: {t('convert.faq2q')}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            A: {t('convert.faq2a')}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-5">
                        <h3 className="font-medium text-gray-900 mb-2">Q: {t('convert.faq3q')}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            A: {t('convert.faq3a')}
                        </p>
                    </div>
                </div>

                <div className="w-full mt-10">
                    <AdPlaceholder id="ad-convert-bottom" showCoupang={true} />
                </div>
            </div>
        </div>
    );
};

export default ConvertPage;
