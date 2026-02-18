import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import AdPlaceholder from '../components/AdPlaceholder';
import FileUploader from '../components/FileUploader';
import { getPdfPageCount } from '../utils/pdfMerge'; // Reuse this util
import { splitPDF, splitPDFToIndividual } from '../utils/pdfSplit';
import { formatFileSize, downloadFile, downloadAsZip } from '../utils/fileHelpers';
import { updateSEO } from '../utils/seo';
import PdfPreview from '../components/PdfPreview';

const PdfSplitPage = () => {
    const { t, locale } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState<number>(0);
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [rangeInput, setRangeInput] = useState('');
    const [viewMode, setViewMode] = useState<'preview' | 'numbers'>('preview');

    const [isSplitting, setIsSplitting] = useState(false);

    // SEO
    useEffect(() => {
        updateSEO('pdfSplit', locale);
    }, [locale]);

    const handleFilesSelected = async (files: File[]) => {
        if (files.length === 0) return;
        const selectedFile = files[0];

        // Validation: Max 20MB
        if (selectedFile.size > 20 * 1024 * 1024) {
            alert(t('common.fileTooLarge'));
            return;
        }

        try {
            const count = await getPdfPageCount(selectedFile);
            setFile(selectedFile);
            setPageCount(count);
            setSelectedPages([]);
            setRangeInput('');
            setViewMode('preview'); // Default to preview
        } catch (error) {
            console.error("Error loading PDF", error);
            alert(t('common.error'));
        }
    };

    const togglePage = (pageNum: number) => {
        setSelectedPages(prev => {
            if (prev.includes(pageNum)) {
                return prev.filter(p => p !== pageNum).sort((a, b) => a - b);
            } else {
                return [...prev, pageNum].sort((a, b) => a - b);
            }
        });
    };

    const selectAll = () => {
        const all = Array.from({ length: pageCount }, (_, i) => i + 1);
        setSelectedPages(all);
    };

    const deselectAll = () => {
        setSelectedPages([]);
    };

    const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setRangeInput(val);

        // Parse range: "1,3,5-8,12"
        const newSelected = new Set<number>();
        const parts = val.split(',');

        parts.forEach(part => {
            const trimmed = part.trim();
            if (trimmed.includes('-')) {
                const [start, end] = trimmed.split('-').map(Number);
                if (!isNaN(start) && !isNaN(end)) {
                    for (let i = start; i <= end; i++) {
                        if (i >= 1 && i <= pageCount) newSelected.add(i);
                    }
                }
            } else {
                const num = Number(trimmed);
                if (!isNaN(num) && num >= 1 && num <= pageCount) {
                    newSelected.add(num);
                }
            }
        });

        setSelectedPages(Array.from(newSelected).sort((a, b) => a - b));
    };

    const handleDownloadSelected = async () => {
        if (!file || selectedPages.length === 0) return;

        setIsSplitting(true);
        try {
            const blob = await splitPDF(file, selectedPages);
            downloadFile(blob, 'tooktak-split.pdf');
        } catch (error) {
            console.error(error);
            alert(t('common.error'));
        } finally {
            setIsSplitting(false);
        }
    };

    const handleDownloadIndividual = async () => {
        if (!file || selectedPages.length === 0) return;

        setIsSplitting(true);
        try {
            const results = await splitPDFToIndividual(file, selectedPages);

            // Convert to File objects for downloadAsZip
            const filesToZip = results.map(r =>
                new File([r.blob], `page-${r.page}.pdf`, { type: 'application/pdf' })
            );

            await downloadAsZip(filesToZip, 'tooktak-split.zip');
        } catch (error) {
            console.error(error);
            alert(t('common.error'));
        } finally {
            setIsSplitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">{t('pdfSplit.title')}</h1>
            <p className="text-center text-gray-600 mb-8">{t('pdfSplit.subtitle')}</p>

            {/* Ads Top */}
            <div className="w-full mb-10">
                <AdPlaceholder id="ad-pdfsplit-top" showCoupang={true} />
            </div>

            <div className="space-y-8">

                {/* Upload Section */}
                {!file && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <FileUploader
                            onFilesSelected={handleFilesSelected}
                            maxFiles={1}
                            maxSizeMB={20}
                            acceptFormats={'application/pdf,.pdf'}
                            description={t('pdfSplit.uploadHint')}
                            uploadText={t('pdfSplit.upload')}
                            icon={<span className="text-4xl mb-3">✂️</span>}
                        />
                    </div>
                )}

                {/* Page Selection UI */}
                {file && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold">📄 {file.name}</span>
                                <span className="text-sm text-gray-500">({formatFileSize(file.size)})</span>
                            </div>
                            <button
                                onClick={() => { setFile(null); setPageCount(0); setSelectedPages([]); }}
                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                                ❌ Change File
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between items-end mb-4">
                                <label className="text-sm font-medium text-gray-700">
                                    {t('pdfSplit.pageSelection')} ({selectedPages.length}/{pageCount})
                                </label>
                                <div className="space-x-4 text-sm">
                                    <button onClick={selectAll} className="text-blue-600 hover:underline">{t('pdfSplit.selectAll')}</button>
                                    <button onClick={deselectAll} className="text-gray-500 hover:underline">{t('pdfSplit.deselectAll')}</button>
                                </div>
                            </div>

                            {/* View Mode Tabs */}
                            <div className="flex border-b border-gray-200 mb-4">
                                <button
                                    onClick={() => setViewMode('preview')}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors
                                            ${viewMode === 'preview'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {t('pdfPreview.viewThumbnails')}
                                </button>
                                <button
                                    onClick={() => setViewMode('numbers')}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors
                                            ${viewMode === 'numbers'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {t('pdfPreview.viewNumbers')}
                                </button>
                            </div>

                            {/* Content Area */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 max-h-[500px] overflow-y-auto">
                                {viewMode === 'preview' ? (
                                    <PdfPreview
                                        file={file}
                                        pageCount={pageCount}
                                        selectedPages={selectedPages}
                                        onPageToggle={togglePage}
                                        showSelection={true}
                                    />
                                ) : (
                                    <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
                                        {Array.from({ length: pageCount }, (_, i) => i + 1).map(pageNum => (
                                            <button
                                                key={pageNum}
                                                onClick={() => togglePage(pageNum)}
                                                className={`
                                                        w-full aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                                                        ${selectedPages.includes(pageNum)
                                                        ? 'bg-blue-600 text-white shadow-md scale-105'
                                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                                    }
                                                    `}
                                            >
                                                {pageNum}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col space-y-2 mt-4">
                                <label className="text-sm font-medium text-gray-700">{t('pdfSplit.rangeInput')}</label>
                                <input
                                    type="text"
                                    value={rangeInput}
                                    onChange={handleRangeChange}
                                    placeholder={t('pdfSplit.rangeHint')}
                                    className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                            <button
                                onClick={handleDownloadSelected}
                                disabled={selectedPages.length === 0 || isSplitting}
                                className={`flex-1 px-6 py-3 rounded-xl font-bold text-white shadow-md transition-all
                                        ${selectedPages.length === 0 || isSplitting
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                                    }`}
                            >
                                {isSplitting ? t('pdfSplit.splitting') : t('pdfSplit.downloadSelected')}
                            </button>
                            <button
                                onClick={handleDownloadIndividual}
                                disabled={selectedPages.length === 0 || isSplitting}
                                className={`flex-1 px-6 py-3 rounded-xl font-bold text-blue-700 bg-blue-50 border border-blue-200 shadow-sm transition-all
                                        ${selectedPages.length === 0 || isSplitting
                                        ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
                                        : 'hover:bg-blue-100 hover:shadow-md'
                                    }`}
                            >
                                {isSplitting ? t('pdfSplit.splitting') : t('pdfSplit.downloadEach')}
                            </button>
                        </div>
                    </div>
                )}


                {/* FAQ */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{t('pdfSplit.faqTitle')}</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-gray-800 mb-1">Q. {t('pdfSplit.faq1q')}</h4>
                            <p className="text-gray-600 text-sm">{t('pdfSplit.faq1a')}</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-800 mb-1">Q. {t('pdfSplit.faq2q')}</h4>
                            <p className="text-gray-600 text-sm">{t('pdfSplit.faq2a')}</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-800 mb-1">Q. {t('pdfSplit.faq3q')}</h4>
                            <p className="text-gray-600 text-sm">{t('pdfSplit.faq3a')}</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Ads Bottom */}
            <div className="w-full mt-10">
                <AdPlaceholder id="ad-pdfsplit-bottom" showCoupang={true} />
            </div>
        </div>
    );
};

export default PdfSplitPage;
