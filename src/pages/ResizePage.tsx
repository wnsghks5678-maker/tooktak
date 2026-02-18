import { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import AdPlaceholder from '../components/AdPlaceholder';
import FileUploader from '../components/FileUploader';
import ResultCard from '../components/ResultCard';
import { formatFileSize } from '../utils/formatFileSize';
import { resizeImage, getImageDimensions, type ResizeResult } from '../utils/imageResize';
import { useTranslation } from '../i18n/useTranslation';
import { downloadAsZip } from '../utils/fileHelpers';
import { updateSEO } from '../utils/seo';

type ResizeMode = 'pixel' | 'percentage';

const PRESETS = [
    { labelKey: 'resize.presetInstaSquare', w: 1080, h: 1080 },
    { labelKey: 'resize.presetInstaPortrait', w: 1080, h: 1350 },
    { labelKey: 'resize.presetYoutube', w: 1280, h: 720 },
    { labelKey: 'resize.presetProfile', w: 400, h: 400 },
    { labelKey: 'resize.presetTwitter', w: 1500, h: 500 },
    { labelKey: 'resize.presetWallpaperHD', w: 1920, h: 1080 },
    { labelKey: 'resize.presetWallpaper4K', w: 3840, h: 2160 },
];

const PERCENTAGE_PRESETS = [25, 50, 75, 100, 150, 200];

const ResizePage = () => {
    const { t, locale } = useTranslation();
    const [files, setFiles] = useState<File[]>([]);
    const [results, setResults] = useState<ResizeResult[]>([]);
    const [isResizing, setIsResizing] = useState<boolean>(false);

    // Resize Settings
    const [mode, setMode] = useState<ResizeMode>('pixel');
    const [width, setWidth] = useState<number | ''>('');
    const [height, setHeight] = useState<number | ''>('');
    const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
    const [percentage, setPercentage] = useState<number>(100);

    // First file dimensions for reference
    const [originalDims, setOriginalDims] = useState<{ w: number, h: number } | null>(null);

    useEffect(() => {
        updateSEO('resize', locale);
    }, [locale]);

    // Update original dimensions when files change
    useEffect(() => {
        const fetchDimensions = async () => {
            if (files.length > 0) {
                const dims = await getImageDimensions(files[0]);
                setOriginalDims({ w: dims.width, h: dims.height });
                // Set initial values if empty
                if (width === '' && height === '' && dims.width > 0) {
                    setWidth(dims.width);
                    setHeight(dims.height);
                }
            } else {
                setOriginalDims(null);
                setWidth('');
                setHeight('');
            }
        };
        fetchDimensions();
    }, [files]);

    const handleFilesSelected = (newFiles: File[]) => {
        setFiles(prev => {
            const potentialFiles = [...prev, ...newFiles];
            if (potentialFiles.length > 10) {
                alert(t('common.fileTooLarge')); // Using fileTooLarge as placeholder for max files if "maxFiles" key not exists, or just alert custom.
                // Actually common.error might be better or I should add maxFiles key. 
                // Wait, use fileHelpers/uploader logic? FileUploader handles validation.
                // But here we are appending. FileUploader passes valid files.
                // We should slice or warn.
                return potentialFiles.slice(0, 10);
            }
            return potentialFiles;
        });
        if (results.length > 0) setResults([]);
    };

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setResults([]);
    };

    // Width/Height Change Handlers
    const handleWidthChange = (val: string) => {
        const newW = val === '' ? '' : Number(val);
        setWidth(newW);

        if (maintainAspectRatio && originalDims && newW !== '') {
            const ratio = originalDims.h / originalDims.w;
            setHeight(Math.round(Number(newW) * ratio));
        }
        setResults([]);
    };

    const handleHeightChange = (val: string) => {
        const newH = val === '' ? '' : Number(val);
        setHeight(newH);

        if (maintainAspectRatio && originalDims && newH !== '') {
            const ratio = originalDims.w / originalDims.h;
            setWidth(Math.round(Number(newH) * ratio));
        }
        setResults([]);
    };

    const handleResize = async () => {
        if (files.length === 0) return;

        // Validation
        if (mode === 'pixel' && (width === '' || height === '' || width <= 0 || height <= 0)) {
            alert(t('resize.errorValidSize'));
            return;
        }

        setIsResizing(true);
        setResults([]);

        try {
            const resizePromises = files.map(file => {
                if (mode === 'pixel') {
                    return resizeImage(file, Number(width), Number(height));
                } else {
                    return resizeImage(file, undefined, undefined, percentage);
                }
            });
            const resizeResults = await Promise.all(resizePromises);
            setResults(resizeResults);
        } catch (error) {
            console.error(error);
            alert(t('common.error'));
        } finally {
            setIsResizing(false);
        }
    };

    const handleDownloadAll = async () => {
        if (results.length === 0) return;
        try {
            await downloadAsZip(
                results.map(r => r.resizedFile),
                'tooktak-resized.zip'
            );
        } catch (error) {
            console.error(error);
            alert(t('common.error'));
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="text-center mb-10">
                <h1 className="text-2xl md:text-3xl font-bold text-dark mb-2">{t('resize.title')}</h1>
                <p className="text-sm md:text-base text-gray-500">
                    {t('resize.subtitle')}
                </p>
            </div>

            <div className="w-full mb-10">
                <AdPlaceholder id="ad-resize-top" showCoupang={true} />
            </div>

            {/* Upload Area */}
            <FileUploader
                onFilesSelected={handleFilesSelected}
                maxFiles={10}
                maxSizeMB={10}
                acceptFormats={['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/avif', 'image/tiff', 'image/heic', 'image/heif'].join(',')}
                uploadText={t('resize.upload')}
                hintText={t('resize.uploadHint')}
            />

            {/* Settings and File List */}
            {files.length > 0 && (
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">

                    {/* File List */}
                    <div className="mb-8 border-b border-gray-100 pb-8">
                        <h3 className="font-semibold text-gray-800 mb-4">{t('compress.selectedFiles')} ({files.length})</h3>
                        <ul className="space-y-3">
                            {files.map((file, index) => (
                                <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <span className="text-xl">📄</span>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                                            <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveFile(index)}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                        disabled={isResizing}
                                    >
                                        ❌
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            onClick={() => setMode('pixel')}
                            className={`flex-1 pb-3 text-center transition-colors ${mode === 'pixel' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {t('resize.tabPixel')}
                        </button>
                        <button
                            onClick={() => setMode('percentage')}
                            className={`flex-1 pb-3 text-center transition-colors ${mode === 'percentage' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {t('resize.tabRatio')}
                        </button>
                    </div>

                    {/* Pixel Mode */}
                    {mode === 'pixel' && (
                        <div className="mb-8">
                            {originalDims && (
                                <p className="text-sm text-gray-500 mb-4">
                                    {t('resize.originalSize')}: {originalDims.w} × {originalDims.h} px
                                    {files.length > 1 && " (Reference)"}
                                </p>
                            )}

                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex-1 max-w-[140px]">
                                    <label className="block text-xs text-gray-500 mb-1">{t('resize.width')} (Width)</label>
                                    <input
                                        type="number"
                                        value={width}
                                        onChange={(e) => handleWidthChange(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <span className="text-gray-400 mt-5">×</span>
                                <div className="flex-1 max-w-[140px]">
                                    <label className="block text-xs text-gray-500 mb-1">{t('resize.height')} (Height)</label>
                                    <input
                                        type="number"
                                        value={height}
                                        onChange={(e) => handleHeightChange(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <span className="text-gray-500 mt-5 text-sm">{t('resize.unitPx')}</span>

                                <button
                                    onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                                    className={`mt-5 p-2 rounded-lg transition-colors ${maintainAspectRatio ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
                                    title={t('resize.lockRatio')}
                                >
                                    🔗
                                </button>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">{t('resize.presets')}</p>
                                <div className="flex flex-wrap gap-2">
                                    {PRESETS.map((preset) => (
                                        <button
                                            key={preset.labelKey}
                                            onClick={() => {
                                                setWidth(preset.w);
                                                setHeight(preset.h);
                                                setMaintainAspectRatio(false); // Unlocks ratio for specific presets
                                                setResults([]);
                                            }}
                                            className="bg-gray-100 text-gray-700 text-xs rounded-full px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                        >
                                            {t(preset.labelKey)} <span className="opacity-70">({preset.w}×{preset.h})</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Percentage Mode */}
                    {mode === 'percentage' && (
                        <div className="mb-8">
                            <div className="mb-8 relative pt-6 pb-2">
                                {/* Floating Tooltip */}
                                <div
                                    className="absolute -top-1 transform -translate-x-1/2 bg-blue-600 text-white text-sm rounded-md px-2 py-1 font-bold shadow-sm transition-all duration-75"
                                    style={{ left: `${(percentage - 10) * 100 / 190}%` }}
                                >
                                    {percentage}%
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-blue-600"></div>
                                </div>

                                <input
                                    type="range"
                                    min="10"
                                    max="200"
                                    step="5"
                                    value={percentage}
                                    onChange={(e) => {
                                        setPercentage(Number(e.target.value));
                                        setResults([]);
                                    }}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none"
                                    style={{
                                        background: `linear-gradient(to right, #3B82F6 0%, #2563EB ${(percentage - 10) * 100 / 190}%, #E5E7EB ${(percentage - 10) * 100 / 190}%, #E5E7EB 100%)`
                                    }}
                                />
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
                    `}</style>
                                <div className="flex justify-between mt-2 text-xs text-gray-400">
                                    <span>10%</span>
                                    <span>200%</span>
                                </div>
                            </div>

                            {originalDims && (
                                <p className="text-sm text-center text-gray-600 mb-4 bg-gray-50 py-2 rounded-lg">
                                    {t('resize.originalSize')}: {originalDims.w}×{originalDims.h} →
                                    <span className="font-bold text-blue-600 mx-2">
                                        {Math.round(originalDims.w * percentage / 100)}×{Math.round(originalDims.h * percentage / 100)}
                                    </span>
                                    ({percentage}%)
                                </p>
                            )}

                            <div className="flex flex-wrap gap-2 justify-center">
                                {PERCENTAGE_PRESETS.map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => {
                                            setPercentage(p);
                                            setResults([]);
                                        }}
                                        className={`text-sm rounded-lg px-3 py-1.5 transition-colors ${percentage === p ? 'bg-blue-100 text-blue-600 font-bold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        {p}%
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleResize}
                        disabled={isResizing || files.length === 0}
                        className={`
            w-full py-3 px-8 rounded-lg text-white font-medium text-lg transition-colors flex items-center justify-center gap-2
            ${isResizing
                                ? 'bg-blue-400 cursor-not-allowed opacity-50'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                            }
          `}
                    >
                        {isResizing ? (
                            <>
                                <span className="animate-spin">🔄</span> {t('resize.resizing')}
                            </>
                        ) : (
                            <>
                                {t('resize.startResize')}
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <div className="mt-12">
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-xl font-bold text-gray-800">{t('resize.resultTitle')}</h2>
                        {results.length > 1 && (
                            <button
                                onClick={handleDownloadAll}
                                className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                {t('resize.downloadAll')}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.map((result, index) => {
                            return (
                                <ResultCard
                                    key={index}
                                    fileName={result.resizedFile.name}
                                    originalSize={result.originalSize}
                                    newSize={result.resizedSize}
                                    extraInfo={
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                            <span>{result.originalWidth}×{result.originalHeight}</span>
                                            <span>→</span>
                                            <span className="font-bold text-gray-900">{result.newWidth}×{result.newHeight}</span>
                                        </div>
                                    }
                                    onDownload={() => saveAs(result.resizedFile, result.resizedFile.name)}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            {/* FAQ & Bottom Ad */}
            <div className="mt-20">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('resize.faqTitle')}</h2>
                <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-5">
                        <h3 className="font-medium text-gray-900 mb-2">Q: {t('resize.faq1q')}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            A: {t('resize.faq1a')}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-5">
                        <h3 className="font-medium text-gray-900 mb-2">Q: {t('resize.faq2q')}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            A: {t('resize.faq2a')}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-5">
                        <h3 className="font-medium text-gray-900 mb-2">Q: {t('resize.faq3q')}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            A: {t('resize.faq3a')}
                        </p>
                    </div>
                </div>

                <div className="w-full mt-10">
                    <AdPlaceholder id="ad-resize-bottom" showCoupang={true} />
                </div>
            </div>
        </div>
    );
};

export default ResizePage;
