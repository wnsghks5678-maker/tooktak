import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from '../i18n';
import AdPlaceholder from '../components/AdPlaceholder';
import FileUploader from '../components/FileUploader';
import { mergePDFs, getPdfPageCount } from '../utils/pdfMerge';
import { formatFileSize, downloadFile } from '../utils/fileHelpers';
import { updateSEO } from '../utils/seo';
import PdfPreview from '../components/PdfPreview';

interface PdfFile {
    id: string;
    file: File;
    pageCount: number;
    selectedPages: number[]; // 1-based page numbers
    isExpanded: boolean;
}

const PdfMergePage = () => {
    const { t, locale } = useTranslation();
    const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
    const [isMerging, setIsMerging] = useState(false);
    const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
    const [outputName, setOutputName] = useState('tooktak-merged');

    // SEO
    useEffect(() => {
        updateSEO('pdfMerge', locale);
    }, [locale]);

    const handleFilesSelected = async (files: File[]) => {
        const newPdfFiles: PdfFile[] = [];

        for (const file of files) {
            // Validation: Max 20MB
            if (file.size > 20 * 1024 * 1024) {
                alert(t('common.fileTooLarge'));
                continue;
            }

            try {
                const pageCount = await getPdfPageCount(file);
                const allPages = Array.from({ length: pageCount }, (_, i) => i + 1);
                newPdfFiles.push({
                    id: Math.random().toString(36).substr(2, 9),
                    file,
                    pageCount,
                    selectedPages: allPages,
                    isExpanded: false
                });
            } catch (error) {
                console.error("Error loading PDF", error);
                alert(t('common.error'));
            }
        }

        setPdfFiles(prev => [...prev, ...newPdfFiles].slice(0, 20)); // Limit to 20 files
        setMergedBlob(null); // Reset result
    };

    const removeFile = (id: string) => {
        setPdfFiles(prev => prev.filter(f => f.id !== id));
        setMergedBlob(null);
    };

    const toggleExpand = (id: string) => {
        setPdfFiles(prev => prev.map(f =>
            f.id === id ? { ...f, isExpanded: !f.isExpanded } : f
        ));
    };

    const togglePageSelection = (fileId: string, pageNum: number) => {
        setPdfFiles(prev => prev.map(f => {
            if (f.id !== fileId) return f;

            const newSelected = f.selectedPages.includes(pageNum)
                ? f.selectedPages.filter(p => p !== pageNum).sort((a, b) => a - b)
                : [...f.selectedPages, pageNum].sort((a, b) => a - b);

            return { ...f, selectedPages: newSelected };
        }));
        setMergedBlob(null);
    };

    const selectAllPages = (fileId: string) => {
        setPdfFiles(prev => prev.map(f => {
            if (f.id !== fileId) return f;
            const allPages = Array.from({ length: f.pageCount }, (_, i) => i + 1);
            return { ...f, selectedPages: allPages };
        }));
        setMergedBlob(null);
    };

    const deselectAllPages = (fileId: string) => {
        setPdfFiles(prev => prev.map(f => {
            if (f.id !== fileId) return f;
            return { ...f, selectedPages: [] };
        }));
        setMergedBlob(null);
    };

    // Drag and Drop Reordering
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;

        const _pdfFiles = [...pdfFiles];
        const draggedItemContent = _pdfFiles[dragItem.current];

        _pdfFiles.splice(dragItem.current, 1);
        _pdfFiles.splice(dragOverItem.current, 0, draggedItemContent);

        dragItem.current = null;
        dragOverItem.current = null;
        setPdfFiles(_pdfFiles);
        setMergedBlob(null);
    };

    const handleMerge = async () => {
        if (pdfFiles.length === 0) return;

        // Check if any pages are selected
        const totalSelectedPages = pdfFiles.reduce((acc, f) => acc + f.selectedPages.length, 0);
        if (totalSelectedPages === 0) {
            alert(t('pdfPreview.selectPages')); // Or some other warning
            return;
        }

        setIsMerging(true);
        try {
            const inputs = pdfFiles.map(p => ({
                file: p.file,
                selectedPages: p.selectedPages
            }));
            const blob = await mergePDFs(inputs);
            setMergedBlob(blob);
        } catch (error) {
            console.error("Merge failed", error);
            alert(t('common.error'));
        } finally {
            setIsMerging(false);
        }
    };

    const handleDownload = () => {
        if (mergedBlob) {
            const fileName = outputName.trim() ? `${outputName}.pdf` : 'merged.pdf';
            downloadFile(mergedBlob, fileName);
        }
    };


    const totalSelectedPages = pdfFiles.reduce((acc, curr) => acc + curr.selectedPages.length, 0);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Helmet>
                <title>{locale === 'ko' ? 'PDF 합치기 - 여러 PDF 파일 하나로 합치기 | 뚝딱' : 'Merge PDF - Combine Multiple PDF Files | TookTak'}</title>
                <meta name="description" content={locale === 'ko' ? '여러 PDF 파일을 하나로 합쳐보세요. 드래그로 순서 변경, 페이지 선택 가능. 무료, 서버 업로드 없음.' : 'Merge multiple PDF files into one. Drag to reorder, select pages. Free, no server upload.'} />
                <meta property="og:url" content="https://tooktak.pages.dev/pdf-merge" />
                <link rel="canonical" href="https://tooktak.pages.dev/pdf-merge" />
            </Helmet>

            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">{t('pdfMerge.title')}</h1>
            <p className="text-center text-gray-600 mb-8">{t('pdfMerge.subtitle')}</p>

            {/* Ads Top */}
            <div className="w-full mb-10">
                <AdPlaceholder id="ad-pdfmerge-top" showCoupang={true} />
            </div>

            <div className="space-y-8">

                {/* Upload Section */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <FileUploader
                        onFilesSelected={handleFilesSelected}
                        maxFiles={20}
                        maxSizeMB={20}
                        acceptFormats="application/pdf,.pdf"
                        description={t('pdfMerge.uploadHint')}
                        uploadText={t('pdfMerge.upload')}
                        icon={<span className="text-4xl mb-3">📑</span>}
                    />
                </div>

                {/* File List */}
                {pdfFiles.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900">{t('common.selectedFiles')} ({pdfFiles.length})</h2>
                            <p className="text-sm text-gray-500">{t('pdfMerge.dragToReorder')}</p>
                        </div>

                        <div className="space-y-4 mb-6">
                            {pdfFiles.map((item, index) => (
                                <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:border-blue-200 transition-colors">
                                    {/* Header Row */}
                                    <div
                                        className="flex items-center justify-between p-3 bg-gray-50 cursor-move"
                                        draggable
                                        onDragStart={() => (dragItem.current = index)}
                                        onDragEnter={() => (dragOverItem.current = index)}
                                        onDragEnd={handleSort}
                                        onDragOver={(e) => e.preventDefault()}
                                    >
                                        <div className="flex items-center space-x-3 overflow-hidden flex-1">
                                            <span className="text-gray-400 font-medium w-6 text-center">{index + 1}</span>
                                            <span className="text-xl">📄</span>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-medium text-gray-900 truncate max-w-[200px] sm:max-w-xs">{item.file.name}</span>
                                                <div className="flex items-center text-xs text-gray-500 space-x-2">
                                                    <span>{item.pageCount} p</span>
                                                    <span>•</span>
                                                    <span>{formatFileSize(item.file.size)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleExpand(item.id)}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1
                                                        ${item.isExpanded
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {t('pdfPreview.selectPages')} {item.isExpanded ? '▲' : '▼'}
                                            </button>
                                            <button
                                                onClick={() => removeFile(item.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                                                aria-label="Remove"
                                            >
                                                ❌
                                            </button>
                                        </div>
                                    </div>

                                    {/* Page Selection Area */}
                                    {item.isExpanded && (
                                        <div className="p-4 bg-gray-50 border-t border-gray-100 animate-fade-in">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="text-xs text-gray-500">
                                                    {t('pdfPreview.pageSelected', { count: item.selectedPages.length, total: item.pageCount })}
                                                </div>
                                                <div className="space-x-3 text-sm">
                                                    <button onClick={() => selectAllPages(item.id)} className="text-blue-600 hover:underline text-xs font-medium">
                                                        {t('pdfSplit.selectAll')}
                                                    </button>
                                                    <button onClick={() => deselectAllPages(item.id)} className="text-gray-500 hover:underline text-xs font-medium">
                                                        {t('pdfSplit.deselectAll')}
                                                    </button>
                                                </div>
                                            </div>

                                            <PdfPreview
                                                file={item.file}
                                                pageCount={item.pageCount}
                                                selectedPages={item.selectedPages}
                                                onPageToggle={(pageNum) => togglePageSelection(item.id, pageNum)}
                                                showSelection={true}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="text-sm text-gray-600">
                                    <p>{t('pdfPreview.mergeSummary', { files: pdfFiles.length, pages: totalSelectedPages })}</p>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                    <div className="relative flex items-center">
                                        <label className="mr-2 text-sm text-gray-600 whitespace-nowrap">{t('pdfMerge.fileName')}:</label>
                                        <input
                                            type="text"
                                            value={outputName}
                                            onChange={(e) => setOutputName(e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                        <span className="ml-1 text-gray-500 text-sm">.pdf</span>
                                    </div>

                                    <button
                                        onClick={handleMerge}
                                        disabled={isMerging || pdfFiles.length === 0 || totalSelectedPages === 0}
                                        className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-md transition-all w-full sm:w-auto
                                                ${isMerging || pdfFiles.length === 0 || totalSelectedPages === 0
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-primary hover:bg-blue-700 hover:shadow-lg active:transform active:scale-95'
                                            }`}
                                    >
                                        {isMerging ? t('pdfMerge.merging') : t('pdfMerge.startMerge')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Result Section */}
                {mergedBlob && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 animate-fade-in text-center">
                        <div className="mb-4 text-5xl">✅</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {t('common.download')}
                        </h2>
                        <div className="flex justify-center items-center gap-4 text-gray-600 mb-6">
                            <span>{totalSelectedPages} p</span>
                            <span>•</span>
                            <span>{formatFileSize(mergedBlob.size)}</span>
                        </div>

                        <button
                            onClick={handleDownload}
                            className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-lg 
                                         hover:bg-green-700 shadow-lg hover:shadow-xl transition-all 
                                         flex items-center justify-center mx-auto gap-2"
                        >
                            📥 {t('pdfMerge.download')}
                        </button>
                    </div>
                )}

                {/* FAQ */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{t('pdfMerge.faqTitle')}</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-gray-800 mb-1">Q. {t('pdfMerge.faq1q')}</h4>
                            <p className="text-gray-600 text-sm">{t('pdfMerge.faq1a')}</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-800 mb-1">Q. {t('pdfMerge.faq2q')}</h4>
                            <p className="text-gray-600 text-sm">{t('pdfMerge.faq2a')}</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-800 mb-1">Q. {t('pdfMerge.faq3q')}</h4>
                            <p className="text-gray-600 text-sm">{t('pdfMerge.faq3a')}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 mt-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">{locale === 'ko' ? 'PDF 합치기란?' : 'What is PDF Merging?'}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {locale === 'ko'
                            ? 'PDF 합치기는 여러 개의 PDF 파일을 하나의 파일로 결합하는 기능입니다. 뚝딱에서는 최대 20개의 PDF 파일을 한 번에 합칠 수 있으며, 드래그 앤 드롭으로 순서를 변경하고 특정 페이지만 선택하여 합칠 수도 있습니다. 모든 처리가 브라우저에서 이루어지므로 파일이 서버에 업로드되지 않아 기밀 문서도 안전하게 합칠 수 있습니다.'
                            : 'PDF merging combines multiple PDF files into a single document. TookTak lets you merge up to 20 PDFs at once, drag and drop to reorder, and select specific pages. All processing happens in your browser — no server upload — so confidential documents stay safe.'}
                    </p>
                </div>

            </div>

            {/* Ads Bottom */}
            <div className="w-full mt-10">
                <AdPlaceholder id="ad-pdfmerge-bottom" showCoupang={true} />
            </div>
        </div>
    );
};

export default PdfMergePage;
