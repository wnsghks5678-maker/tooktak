import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from '../i18n';
import AdPlaceholder from '../components/AdPlaceholder';
import { updateSEO } from '../utils/seo';
import Tesseract from 'tesseract.js';

const OcrPage = () => {
    const { t, locale } = useTranslation();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [language, setLanguage] = useState('eng');
    const [resultText, setResultText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [confidence, setConfidence] = useState(0);
    const [copySuccess, setCopySuccess] = useState(false);

    // Crop states
    const [crop, setCrop] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [appliedCrop, setAppliedCrop] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [isCropMode, setIsCropMode] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => { updateSEO('ocr', locale); }, [locale]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { alert(t('common.fileTooLarge')); return; }
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'].includes(ext || '')) { alert(t('common.unsupportedFormat')); return; }
        setImageFile(file);
        setImageUrl(URL.createObjectURL(file));
        setResultText('');
        setProgress(0);
        setConfidence(0);
        setCrop(null);
        setAppliedCrop(null);
        setIsCropMode(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            const dt = new DataTransfer();
            dt.items.add(file);
            if (fileInputRef.current) {
                fileInputRef.current.files = dt.files;
                handleFileSelect({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
            }
        }
    };

    const enterCropMode = () => {
        if (!imageRef.current) return;
        const { naturalWidth, naturalHeight } = imageRef.current;
        setCrop({ x: naturalWidth * 0.1, y: naturalHeight * 0.1, width: naturalWidth * 0.8, height: naturalHeight * 0.8 });
        setIsCropMode(true);
    };

    const applyCrop = () => {
        if (crop) {
            setAppliedCrop({ ...crop });
        }
        setIsCropMode(false);
    };

    const cancelCrop = () => {
        setCrop(appliedCrop ? { ...appliedCrop } : null);
        setIsCropMode(false);
    };

    const resetCrop = () => {
        setCrop(null);
        setAppliedCrop(null);
        setIsCropMode(false);
    };

    const getRenderScale = () => {
        if (!imageRef.current) return 1;
        return imageRef.current.naturalWidth / imageRef.current.offsetWidth;
    };

    const handleCropMouseDown = (e: React.MouseEvent | React.TouchEvent, handle: string | null) => {
        e.preventDefault();
        e.stopPropagation();
        if (!crop) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const initCrop = { ...crop };
        setResizeHandle(handle);

        const handleMove = (ev: MouseEvent | TouchEvent) => {
            const cx = 'touches' in ev ? ev.touches[0].clientX : ev.clientX;
            const cy = 'touches' in ev ? ev.touches[0].clientY : ev.clientY;
            if (!imageRef.current) return;
            const scale = getRenderScale();
            const dx = (cx - clientX) * scale;
            const dy = (cy - clientY) * scale;
            const { naturalWidth: nw, naturalHeight: nh } = imageRef.current;
            const min = 50;
            const nc = { ...initCrop };
            if (!handle) {
                nc.x = Math.min(Math.max(0, initCrop.x + dx), nw - initCrop.width);
                nc.y = Math.min(Math.max(0, initCrop.y + dy), nh - initCrop.height);
            } else {
                if (handle.includes('w')) { const nw2 = Math.max(min, initCrop.width - dx); const nx = Math.max(0, initCrop.x + dx); if (nx >= 0) { nc.x = nx; nc.width = nw2; } }
                if (handle.includes('e')) { nc.width = Math.min(Math.max(min, initCrop.width + dx), nw - initCrop.x); }
                if (handle.includes('n')) { const nh2 = Math.max(min, initCrop.height - dy); const ny = Math.max(0, initCrop.y + dy); if (ny >= 0) { nc.y = ny; nc.height = nh2; } }
                if (handle.includes('s')) { nc.height = Math.min(Math.max(min, initCrop.height + dy), nh - initCrop.y); }
            }
            if (nc.x < 0) nc.x = 0;
            if (nc.y < 0) nc.y = 0;
            setCrop(nc);
        };

        const handleUp = () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleUp);
            setResizeHandle(null);
        };
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleUp);
    };

    const startOcr = async () => {
        if (!imageFile || !imageRef.current) return;
        setIsProcessing(true);
        setProgress(0);
        setResultText('');
        try {
            let source: File | Blob = imageFile;
            const cropToUse = appliedCrop;
            if (cropToUse) {
                const canvas = document.createElement('canvas');
                canvas.width = cropToUse.width;
                canvas.height = cropToUse.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(imageRef.current, cropToUse.x, cropToUse.y, cropToUse.width, cropToUse.height, 0, 0, cropToUse.width, cropToUse.height);
                    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
                    if (blob) source = blob;
                }
            }
            const { data } = await Tesseract.recognize(source, language, {
                logger: m => { if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100)); }
            });
            setResultText(data.text);
            setConfidence(data.confidence);
        } catch (err) {
            console.error(err);
            alert(t('common.error'));
        } finally {
            setIsProcessing(false);
            setProgress(100);
        }
    };

    const handleCopy = () => {
        if (!resultText) return;
        navigator.clipboard.writeText(resultText);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleDownload = () => {
        if (!resultText) return;
        const blob = new Blob([resultText], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `tooktak-ocr-${Date.now()}.txt`;
        a.click();
    };

    const handleRetry = () => {
        setImageFile(null); setImageUrl(''); setResultText(''); setProgress(0); setConfidence(0);
        setCrop(null); setAppliedCrop(null); setIsCropMode(false);
    };

    const renderCropOverlay = () => {
        if (!isCropMode || !crop || !imageRef.current) return null;
        const { naturalWidth: nw, naturalHeight: nh } = imageRef.current;
        const style = {
            left: `${(crop.x / nw) * 100}%`,
            top: `${(crop.y / nh) * 100}%`,
            width: `${(crop.width / nw) * 100}%`,
            height: `${(crop.height / nh) * 100}%`
        };
        const handles = ['nw', 'ne', 'sw', 'se'];
        const pos: Record<string, string> = {
            nw: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize',
            ne: 'top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize',
            sw: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize',
            se: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize'
        };
        return (
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute border-2 border-blue-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-auto cursor-move"
                    style={style} onMouseDown={e => handleCropMouseDown(e, null)} onTouchStart={e => handleCropMouseDown(e, null)}>
                    {handles.map(h => (
                        <div key={h} className={`absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full ${pos[h]} ${resizeHandle === h ? 'scale-125 bg-blue-100' : ''}`}
                            onMouseDown={e => handleCropMouseDown(e, h)} onTouchStart={e => handleCropMouseDown(e, h)} />
                    ))}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {Math.round(crop.width)} x {Math.round(crop.height)} px
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Helmet>
                <title>{locale === 'ko' ? '\uBB34\uB8CC \uC774\uBBF8\uC9C0 OCR \uD14D\uC2A4\uD2B8 \uCD94\uCD9C | \uB69D\uB531' : 'Free Image Text Extraction (OCR) | TookTak'}</title>
                <meta name="description" content={locale === 'ko' ? '\uC774\uBBF8\uC9C0\uC5D0\uC11C \uD14D\uC2A4\uD2B8\uB97C \uBB34\uB8CC\uB85C \uCD94\uCD9C\uD558\uC138\uC694. \uD55C\uAD6D\uC5B4, \uC601\uC5B4, \uC77C\uBCF8\uC5B4, \uC911\uAD6D\uC5B4 \uC9C0\uC6D0.' : 'Extract text from images for free. Supports Korean, English, Japanese, Chinese.'} />
                <meta property="og:url" content="https://tooktak.pages.dev/ocr" />
                <link rel="canonical" href="https://tooktak.pages.dev/ocr" />
            </Helmet>

            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{t('ocr.title')}</h1>
                <p className="text-gray-600">{t('ocr.subtitle')}</p>
            </div>

            <div className="w-full mb-10"><AdPlaceholder id="ad-ocr-top" showCoupang={true} /></div>

            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100 mb-8">
                {!imageFile ? (
                    <div onClick={() => fileInputRef.current?.click()} onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                        <div className="text-5xl mb-4">{'\uD83D\uDCCE'}</div>
                        <p className="text-lg font-semibold text-gray-700 mb-2">{t('ocr.upload')}</p>
                        <p className="text-sm text-gray-500">{t('ocr.uploadHint')}</p>
                        <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.bmp,.gif" onChange={handleFileSelect} className="hidden" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <div className="mb-4 relative">
                                <img ref={imageRef} src={imageUrl} alt="Preview" className="w-full max-h-[500px] object-contain rounded-lg border bg-gray-50" />
                                {renderCropOverlay()}
                                {appliedCrop && !isCropMode && imageRef.current && (
                                    <div className="absolute inset-0 pointer-events-none">
                                        <div className="absolute border-2 border-green-500 border-dashed" style={{
                                            left: `${(appliedCrop.x / imageRef.current.naturalWidth) * 100}%`,
                                            top: `${(appliedCrop.y / imageRef.current.naturalHeight) * 100}%`,
                                            width: `${(appliedCrop.width / imageRef.current.naturalWidth) * 100}%`,
                                            height: `${(appliedCrop.height / imageRef.current.naturalHeight) * 100}%`
                                        }}>
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                                                {'\u2705'} {Math.round(appliedCrop.width)}x{Math.round(appliedCrop.height)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Crop Buttons */}
                            {isCropMode ? (
                                <div className="flex gap-2 mb-4">
                                    <button onClick={applyCrop} className="flex-1 py-3 px-4 rounded-lg font-bold bg-green-500 text-white hover:bg-green-600 transition-colors shadow-lg text-base animate-pulse">
                                        {'\u2714'} {locale === 'ko' ? '\uC801\uC6A9' : 'Apply'}
                                    </button>
                                    <button onClick={cancelCrop} className="flex-1 py-3 px-4 rounded-lg font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg text-base">
                                        {locale === 'ko' ? '\uCDE8\uC18C' : 'Cancel'}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2 mb-4">
                                    <button onClick={enterCropMode} className="flex-1 py-2 px-4 rounded-lg font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                                        {'\u2702\uFE0F'} {locale === 'ko' ? '\uC601\uC5ED \uC120\uD0DD' : 'Select Area'}
                                    </button>
                                    {appliedCrop && (
                                        <button onClick={resetCrop} className="py-2 px-4 rounded-lg font-semibold bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors">
                                            {locale === 'ko' ? '\uCD08\uAE30\uD654' : 'Reset'}
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('ocr.language')}</label>
                                <select value={language} onChange={e => setLanguage(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" disabled={isProcessing}>
                                    <option value="kor">{t('ocr.langKo')}</option>
                                    <option value="eng">{t('ocr.langEn')}</option>
                                    <option value="jpn">{t('ocr.langJa')}</option>
                                    <option value="chi_sim">{t('ocr.langZh')}</option>
                                </select>
                            </div>

                            {isProcessing && (
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>{t('ocr.processing')}</span><span>{progress}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>
                            )}

                            {!resultText && (
                                <button onClick={startOcr} disabled={isProcessing || isCropMode}
                                    className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isProcessing ? t('ocr.processing') : t('ocr.startOcr')}
                                </button>
                            )}
                            {resultText && (
                                <button onClick={handleRetry} className="w-full py-3 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-all mt-4">
                                    {t('ocr.retry')}
                                </button>
                            )}
                        </div>

                        <div>
                            <div className="h-full flex flex-col">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold text-gray-700">{t('ocr.result')}</span>
                                    {confidence > 0 && (
                                        <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                            {t('ocr.confidence')}: {Math.round(confidence)}%
                                        </span>
                                    )}
                                </div>
                                <textarea className="flex-1 w-full p-4 border border-gray-300 rounded-xl bg-gray-50 font-mono text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[300px]"
                                    value={resultText || t('ocr.noText')} readOnly />
                                <div className="flex gap-3 mt-4">
                                    <button onClick={handleCopy} disabled={!resultText}
                                        className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>
                                        {copySuccess ? t('ocr.copied') : t('ocr.copy')}
                                    </button>
                                    <button onClick={handleDownload} disabled={!resultText}
                                        className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                        {t('ocr.download')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t('ocr.faqTitle')}</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map(num => (
                        <div key={num}>
                            <h4 className="font-semibold text-gray-800 mb-1">Q. {t(`ocr.faq${num}q`)}</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">{t(`ocr.faq${num}a`)}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full mt-10"><AdPlaceholder id="ad-ocr-bottom" showCoupang={true} /></div>
        </div>
    );
};

export default OcrPage;