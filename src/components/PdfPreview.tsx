import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n';
import { setupPdfWorker, loadPdfDocument, pdfjsLib } from '../utils/pdfSetup';

// Initialize worker
setupPdfWorker();

interface PdfPreviewProps {
    file: File;
    pageCount: number;
    selectedPages?: number[]; // 1-based page numbers
    onPageToggle?: (pageNum: number) => void;
    showSelection?: boolean;
}

const PdfPreview = ({ file, pageCount, selectedPages = [], onPageToggle, showSelection = false }: PdfPreviewProps) => {
    const { t } = useTranslation();
    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [thumbnails, setThumbnails] = useState<Record<number, string>>({}); // thumbnail URL or "error" string
    const [error, setError] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(20); // Initial load count

    const renderQueue = useRef<number[]>([]);
    const isRendering = useRef(false);

    useEffect(() => {
        const loadPdf = async () => {
            try {
                const doc = await loadPdfDocument(file);
                setPdfDoc(doc);
                setError(null);
            } catch (err: any) {
                console.error("Error loading PDF for preview", err);
                if (err.name === 'PasswordException') {
                    setError("Password Protected");
                } else {
                    setError("Load Failed");
                }
            }
        };

        loadPdf();
    }, [file]);

    useEffect(() => {
        if (!pdfDoc) return;

        // Queue first batch
        const pagesToRender = Array.from({ length: Math.min(pageCount, visibleCount) }, (_, i) => i + 1);
        renderQueue.current = pagesToRender.filter(p => !thumbnails[p]);
        processQueue();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pdfDoc, visibleCount]);

    const renderPageThumbnail = async (doc: pdfjsLib.PDFDocumentProxy, pageNum: number): Promise<string | null> => {
        try {
            const page = await doc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 0.5 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');

            if (!ctx) return null;

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            await page.render(renderContext as any).promise;

            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

            // Cleanup
            canvas.width = 0;
            canvas.height = 0;

            return dataUrl;
        } catch (error) {
            console.warn(`Failed to render page ${pageNum}:`, error);
            return null;
        }
    };

    const processQueue = async () => {
        if (isRendering.current || renderQueue.current.length === 0 || !pdfDoc) return;

        isRendering.current = true;
        const pageNum = renderQueue.current.shift()!;

        try {
            const thumbUrl = await renderPageThumbnail(pdfDoc, pageNum);
            setThumbnails(prev => ({
                ...prev,
                [pageNum]: thumbUrl || 'error' // 'error' indicates failed render
            }));
        } catch (err) {
            console.error(`Error processing queue for page ${pageNum}`, err);
        } finally {
            isRendering.current = false;
            // Process next
            if (renderQueue.current.length > 0) {
                requestAnimationFrame(processQueue);
            }
        }
    };

    const handleShowMore = () => {
        setVisibleCount(prev => Math.min(prev + 20, pageCount));
    };

    if (error) {
        return (
            <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500 text-sm">
                ⚠️ {error}
            </div>
        );
    }

    if (!pdfDoc) {
        return (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-400 animate-pulse">
                {t('pdfPreview.loading')}
            </div>
        );
    }

    const displayedPages = Array.from({ length: Math.min(pageCount, visibleCount) }, (_, i) => i + 1);
    const progress = Object.keys(thumbnails).length;

    return (
        <div className="w-full">
            {progress < displayedPages.length && (
                <div className="text-xs text-gray-400 mb-2 text-right">
                    {t('pdfPreview.loadingProgress', { current: progress, total: displayedPages.length })}
                </div>
            )}

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {displayedPages.map(pageNum => {
                    const isSelected = selectedPages.includes(pageNum);
                    const thumb = thumbnails[pageNum];
                    const isError = thumb === 'error';

                    return (
                        <div
                            key={pageNum}
                            onClick={() => showSelection && onPageToggle && onPageToggle(pageNum)}
                            className={`
                                relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all aspect-[3/4] group
                                ${showSelection
                                    ? (isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300')
                                    : 'border-gray-200'
                                }
                            `}
                        >
                            {thumb && !isError ? (
                                <img src={thumb} alt={`Page ${pageNum}`} className="w-full h-full object-cover" />
                            ) : isError ? (
                                <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center">
                                    <span className="text-xl font-bold text-gray-400">{pageNum}</span>
                                    <span className="text-[10px] text-gray-500 mt-1">{t('common.error')}</span>
                                </div>
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <span className="text-gray-300 text-xs">...</span>
                                </div>
                            )}

                            {/* Page Number Overlay */}
                            <div className="absolute bottom-0 w-full bg-black/50 text-white text-[10px] sm:text-xs text-center py-1">
                                {pageNum}
                            </div>

                            {/* Selection Checkmark */}
                            {showSelection && isSelected && (
                                <div className="absolute top-1 left-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm z-10">
                                    ✓
                                </div>
                            )}

                            {/* Hover Selection Hint */}
                            {showSelection && !isSelected && (
                                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </div>
                    );
                })}
            </div>

            {visibleCount < pageCount && (
                <button
                    onClick={handleShowMore}
                    className="w-full mt-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors border border-dashed border-blue-200"
                >
                    {t('pdfPreview.showMore', { count: Math.min(20, pageCount - visibleCount) })}
                </button>
            )}
        </div>
    );
};

export default PdfPreview;
