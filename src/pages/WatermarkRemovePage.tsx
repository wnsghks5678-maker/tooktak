import { useState, useRef, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from '../i18n';
import AdPlaceholder from '../components/AdPlaceholder';
import { updateSEO } from '../utils/seo';

declare global {
    interface Window { cv: any; Module: any; }
}

const loadOpenCV = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (window.cv && window.cv.inpaint) { resolve(); return; }
        const existing = document.getElementById('opencv-script');
        if (existing) {
            const check = setInterval(() => {
                if (window.cv && window.cv.inpaint) { clearInterval(check); resolve(); }
            }, 200);
            setTimeout(() => { clearInterval(check); reject(new Error('OpenCV load timeout')); }, 30000);
            return;
        }
        window.Module = {
            onRuntimeInitialized: () => {
                const check = setInterval(() => {
                    if (window.cv && window.cv.inpaint) { clearInterval(check); resolve(); }
                }, 100);
                setTimeout(() => { clearInterval(check); reject(new Error('OpenCV init timeout')); }, 15000);
            }
        };
        const script = document.createElement('script');
        script.id = 'opencv-script';
        script.async = true;
        script.src = 'https://docs.opencv.org/4.9.0/opencv.js';
        script.onerror = () => reject(new Error('Failed to load OpenCV.js'));
        document.head.appendChild(script);
    });
};

const WatermarkRemovePage = () => {
    const { t, locale } = useTranslation();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [isSelecting, setIsSelecting] = useState(false);
    const [selection, setSelection] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
    const [processedUrl, setProcessedUrl] = useState('');
    const [brushSize, setBrushSize] = useState(30);
    const [mode, setMode] = useState<'rect' | 'brush'>('rect');
    const [cvReady, setCvReady] = useState(false);
    const [cvLoading, setCvLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isPainting = useRef(false);

    useEffect(() => { updateSEO('watermarkRemove', locale); }, [locale]);

    // Load OpenCV on mount
    useEffect(() => {
        setCvLoading(true);
        loadOpenCV()
            .then(() => setCvReady(true))
            .catch(err => console.error('OpenCV load error:', err))
            .finally(() => setCvLoading(false));
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { alert(t('common.fileTooLarge')); return; }
        setImageFile(file);
        setImageUrl(URL.createObjectURL(file));
        setProcessedUrl('');
        setSelection(null);
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

    const drawImageToCanvas = useCallback(() => {
        if (!imageUrl || !canvasRef.current) return;
        const img = new Image();
        img.onload = () => {
            imgRef.current = img;
            const canvas = canvasRef.current!;
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0);
            if (overlayRef.current) {
                overlayRef.current.width = img.naturalWidth;
                overlayRef.current.height = img.naturalHeight;
                const octx = overlayRef.current.getContext('2d')!;
                octx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
            }
        };
        img.src = imageUrl;
    }, [imageUrl]);

    useEffect(() => { drawImageToCanvas(); }, [drawImageToCanvas]);

    const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    };

    // Rectangle selection
    const handleRectDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (mode !== 'rect') return;
        e.preventDefault();
        const { x, y } = getCanvasCoords(e);
        setIsSelecting(true);
        setSelection({ x, y, w: 0, h: 0 });
    };

    const handleRectMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (mode !== 'rect' || !isSelecting || !selection) return;
        e.preventDefault();
        const { x, y } = getCanvasCoords(e);
        const newSel = { ...selection, w: x - selection.x, h: y - selection.y };
        setSelection(newSel);
        drawRectOverlay(newSel);
    };

    const handleRectUp = () => { if (mode === 'rect') setIsSelecting(false); };

    const drawRectOverlay = (sel: { x: number; y: number; w: number; h: number }) => {
        if (!overlayRef.current) return;
        const ctx = overlayRef.current.getContext('2d')!;
        ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
        const x = sel.w < 0 ? sel.x + sel.w : sel.x;
        const y = sel.h < 0 ? sel.y + sel.h : sel.y;
        const w = Math.abs(sel.w);
        const h = Math.abs(sel.h);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
    };

    // Brush painting
    const handleBrushDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (mode !== 'brush') return;
        e.preventDefault();
        isPainting.current = true;
        paintBrush(e);
    };

    const handleBrushMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (mode !== 'brush' || !isPainting.current) return;
        e.preventDefault();
        paintBrush(e);
    };

    const handleBrushUp = () => { isPainting.current = false; };

    const paintBrush = (e: React.MouseEvent | React.TouchEvent) => {
        if (!overlayRef.current) return;
        const { x, y } = getCanvasCoords(e);
        const ctx = overlayRef.current.getContext('2d')!;
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    };

    const applyRemoval = async () => {
        if (!canvasRef.current || !imgRef.current || !overlayRef.current) return;
        if (!cvReady) {
            alert(locale === 'ko' ? 'OpenCV.js \uB85C\uB529 \uC911\uC785\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.' : 'OpenCV.js is loading. Please try again shortly.');
            return;
        }
        setProcessing(true);
        try {
            const cv = window.cv;
            const canvas = canvasRef.current;
            const cw = canvas.width;
            const ch = canvas.height;
            const ctx = canvas.getContext('2d')!;

            // Redraw original
            ctx.drawImage(imgRef.current, 0, 0);

            // Get source image data
            const srcImageData = ctx.getImageData(0, 0, cw, ch);

            // Build grayscale mask
            const maskData = new Uint8Array(cw * ch);

            if (mode === 'rect' && selection) {
                const rx = Math.round(selection.w < 0 ? selection.x + selection.w : selection.x);
                const ry = Math.round(selection.h < 0 ? selection.y + selection.h : selection.y);
                const rw = Math.round(Math.abs(selection.w));
                const rh = Math.round(Math.abs(selection.h));
                for (let y = Math.max(0, ry); y < Math.min(ch, ry + rh); y++) {
                    for (let x = Math.max(0, rx); x < Math.min(cw, rx + rw); x++) {
                        maskData[y * cw + x] = 255;
                    }
                }
            } else if (mode === 'brush') {
                const octx = overlayRef.current.getContext('2d')!;
                const overlayImgData = octx.getImageData(0, 0, cw, ch);
                for (let i = 0; i < cw * ch; i++) {
                    if (overlayImgData.data[i * 4 + 3] > 30) {
                        maskData[i] = 255;
                    }
                }
            }

            // Create OpenCV Mats from raw data
            const src = cv.matFromImageData(srcImageData);
            const srcBGR = new cv.Mat();
            cv.cvtColor(src, srcBGR, cv.COLOR_RGBA2BGR);

            const mask = new cv.Mat(ch, cw, cv.CV_8UC1);
            mask.data.set(maskData);

            // Dilate mask for better coverage
            const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(7, 7));
            const dilatedMask = new cv.Mat();
            cv.dilate(mask, dilatedMask, kernel);

            // Telea inpainting
            const dst = new cv.Mat();
            cv.inpaint(srcBGR, dilatedMask, dst, 5, cv.INPAINT_TELEA);

            // Convert back to RGBA
            const dstRGBA = new cv.Mat();
            cv.cvtColor(dst, dstRGBA, cv.COLOR_BGR2RGBA);

            // Put result on canvas
            const resultData = new ImageData(new Uint8ClampedArray(dstRGBA.data), cw, ch);
            ctx.putImageData(resultData, 0, 0);

            // Cleanup
            src.delete(); srcBGR.delete(); mask.delete();
            kernel.delete(); dilatedMask.delete(); dst.delete(); dstRGBA.delete();

            // Clear overlay
            const octx2 = overlayRef.current.getContext('2d')!;
            octx2.clearRect(0, 0, cw, ch);
            setSelection(null);

            canvas.toBlob(blob => {
                if (blob) setProcessedUrl(URL.createObjectURL(blob));
            }, 'image/png');
        } catch (err) {
            console.error('Inpainting error:', err);
            alert(locale === 'ko' ? '\uCC98\uB9AC \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.' : 'An error occurred during processing.');
        } finally {
            setProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!processedUrl) return;
        const a = document.createElement('a');
        a.href = processedUrl;
        a.download = `tooktak-watermark-removed-${Date.now()}.png`;
        a.click();
    };

    const handleRetry = () => {
        setImageFile(null); setImageUrl(''); setProcessedUrl('');
        setSelection(null);
    };

    const resetSelection = () => {
        setSelection(null);
        setProcessedUrl('');
        if (overlayRef.current) {
            const ctx = overlayRef.current.getContext('2d')!;
            ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
        }
        drawImageToCanvas();
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Helmet>
                <title>{locale === 'ko' ? '\uBB34\uB8CC \uC6CC\uD130\uB9C8\uD06C \uC81C\uAC70 | \uB69D\uB531' : 'Free Watermark Remover | TookTak'}</title>
                <meta name="description" content={locale === 'ko' ? '\uC774\uBBF8\uC9C0\uC5D0\uC11C \uC6CC\uD130\uB9C8\uD06C\uB97C \uBB34\uB8CC\uB85C \uC81C\uAC70\uD558\uC138\uC694. \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uBC14\uB85C \uCC98\uB9AC.' : 'Remove watermarks from images for free. 100% browser-based.'} />
                <link rel="canonical" href="https://tooktak.pages.dev/watermark-remove" />
            </Helmet>

            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {locale === 'ko' ? '\uC6CC\uD130\uB9C8\uD06C \uC81C\uAC70' : 'Watermark Remover'}
                </h1>
                <p className="text-gray-600">
                    {locale === 'ko' ? '\uC774\uBBF8\uC9C0\uC5D0\uC11C \uC6CC\uD130\uB9C8\uD06C \uC601\uC5ED\uC744 \uC120\uD0DD\uD558\uC5EC \uC81C\uAC70\uD569\uB2C8\uB2E4' : 'Select the watermark area on your image to remove it'}
                </p>
                {cvLoading && (
                    <div className="mt-2 inline-flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        {locale === 'ko' ? '\uC778\uD398\uC778\uD305 \uC5D4\uC9C4 \uB85C\uB529 \uC911...' : 'Loading inpainting engine...'}
                    </div>
                )}
                {cvReady && (
                    <div className="mt-2 inline-flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        {'\u2705'} {locale === 'ko' ? '\uC778\uD398\uC778\uD305 \uC5D4\uC9C4 \uC900\uBE44 \uC644\uB8CC' : 'Inpainting engine ready'}
                    </div>
                )}
            </div>

            <div className="w-full mb-10"><AdPlaceholder id="ad-wmr-top" showCoupang={true} /></div>

            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100 mb-8">
                {!imageFile ? (
                    <div onClick={() => fileInputRef.current?.click()} onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                        <div className="text-5xl mb-4">{'\uD83D\uDDBC\uFE0F'}</div>
                        <p className="text-lg font-semibold text-gray-700 mb-2">
                            {locale === 'ko' ? '\uC774\uBBF8\uC9C0\uB97C \uC5C5\uB85C\uB4DC\uD558\uC138\uC694' : 'Upload an image'}
                        </p>
                        <p className="text-sm text-gray-500">JPG, PNG, WEBP (Max 10MB)</p>
                        <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleFileSelect} className="hidden" />
                    </div>
                ) : (
                    <>
                        {/* Mode Toggle */}
                        <div className="flex gap-2 mb-4">
                            <button onClick={() => { setMode('rect'); resetSelection(); }}
                                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${mode === 'rect' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                {'\u25A1'} {locale === 'ko' ? '\uC0AC\uAC01\uD615 \uC120\uD0DD' : 'Rectangle'}
                            </button>
                            <button onClick={() => { setMode('brush'); resetSelection(); }}
                                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${mode === 'brush' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                {'\uD83D\uDD8C\uFE0F'} {locale === 'ko' ? '\uBE0C\uB7EC\uC2DC' : 'Brush'}
                            </button>
                        </div>

                        {mode === 'brush' && (
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    {locale === 'ko' ? '\uBE0C\uB7EC\uC2DC \uD06C\uAE30' : 'Brush Size'}: {brushSize}px
                                </label>
                                <input type="range" min={5} max={100} value={brushSize} onChange={e => setBrushSize(Number(e.target.value))}
                                    className="w-full accent-blue-600" />
                            </div>
                        )}

                        <p className="text-sm text-gray-500 mb-4 text-center">
                            {mode === 'rect'
                                ? (locale === 'ko' ? '\uC6CC\uD130\uB9C8\uD06C \uC601\uC5ED\uC744 \uB4DC\uB798\uADF8\uD558\uC5EC \uC120\uD0DD\uD558\uC138\uC694' : 'Drag to select the watermark area')
                                : (locale === 'ko' ? '\uC6CC\uD130\uB9C8\uD06C \uC704\uB97C \uBE0C\uB7EC\uC2DC\uB85C \uCE60\uD558\uC138\uC694' : 'Paint over the watermark with the brush')
                            }
                        </p>

                        <div className="relative mb-6 border rounded-xl overflow-hidden bg-gray-100" ref={containerRef}>
                            <canvas ref={canvasRef} className="w-full h-auto block" />
                            <canvas ref={overlayRef}
                                className="absolute inset-0 w-full h-full"
                                style={{ cursor: 'crosshair' }}
                                onMouseDown={mode === 'rect' ? handleRectDown : handleBrushDown}
                                onMouseMove={mode === 'rect' ? handleRectMove : handleBrushMove}
                                onMouseUp={mode === 'rect' ? handleRectUp : handleBrushUp}
                                onMouseLeave={mode === 'rect' ? handleRectUp : handleBrushUp}
                                onTouchStart={mode === 'rect' ? handleRectDown : handleBrushDown}
                                onTouchMove={mode === 'rect' ? handleRectMove : handleBrushMove}
                                onTouchEnd={mode === 'rect' ? handleRectUp : handleBrushUp}
                            />
                        </div>

                        <div className="flex gap-3 mb-4">
                            <button onClick={applyRemoval} disabled={processing || !cvReady}
                                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                {processing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                {processing
                                    ? (locale === 'ko' ? '\uCC98\uB9AC \uC911...' : 'Processing...')
                                    : (locale === 'ko' ? '\uC6CC\uD130\uB9C8\uD06C \uC81C\uAC70' : 'Remove Watermark')
                                }
                            </button>
                            <button onClick={resetSelection}
                                className="py-3 px-6 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-all">
                                {locale === 'ko' ? '\uCD08\uAE30\uD654' : 'Reset'}
                            </button>
                        </div>

                        {processedUrl && (
                            <div className="flex gap-3">
                                <button onClick={handleDownload}
                                    className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all">
                                    {locale === 'ko' ? '\uB2E4\uC6B4\uB85C\uB4DC' : 'Download'}
                                </button>
                                <button onClick={handleRetry}
                                    className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-all">
                                    {locale === 'ko' ? '\uB2E4\uB978 \uC774\uBBF8\uC9C0' : 'New Image'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">FAQ</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Q. {locale === 'ko' ? '\uC6CC\uD130\uB9C8\uD06C\uAC00 \uC644\uBCBD\uD558\uAC8C \uC81C\uAC70\uB418\uB098\uC694?' : 'Is the watermark perfectly removed?'}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{locale === 'ko' ? 'OpenCV Telea \uC778\uD398\uC778\uD305 \uC54C\uACE0\uB9AC\uC998\uC744 \uC0AC\uC6A9\uD558\uC5EC \uC8FC\uBCC0 \uD14D\uC2A4\uCC98\uB97C \uC790\uC5F0\uC2A4\uB7FD\uAC8C \uBCF5\uC6D0\uD569\uB2C8\uB2E4. \uB2E8\uC21C \uBE14\uB7EC\uAC00 \uC544\uB2CC \uC2E4\uC81C \uC778\uD398\uC778\uD305 \uAE30\uC220\uC774\uBBC0\uB85C \uD488\uC9C8\uC774 \uB6F0\uC5B4\uB0A9\uB2C8\uB2E4.' : 'Uses OpenCV Telea inpainting algorithm to naturally restore surrounding textures. This is real inpainting technology, not simple blur.'}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Q. {locale === 'ko' ? '\uC774\uBBF8\uC9C0\uAC00 \uC11C\uBC84\uC5D0 \uC5C5\uB85C\uB4DC\uB418\uB098\uC694?' : 'Are images uploaded to a server?'}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{locale === 'ko' ? '\uC544\uB2C8\uC694. \uBAA8\uB4E0 \uCC98\uB9AC\uB294 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uC774\uB8E8\uC5B4\uC9D1\uB2C8\uB2E4.' : 'No. All processing happens in your browser.'}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Q. {locale === 'ko' ? '\uC0AC\uAC01\uD615\uACFC \uBE0C\uB7EC\uC2DC \uBAA8\uB4DC\uC758 \uCC28\uC774\uB294?' : 'Difference between Rectangle and Brush?'}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{locale === 'ko' ? '\uC0AC\uAC01\uD615\uC740 \uB113\uC740 \uC601\uC5ED\uC744 \uBE60\uB974\uAC8C \uC120\uD0DD\uD560 \uB54C, \uBE0C\uB7EC\uC2DC\uB294 \uBD88\uADDC\uCE59\uD55C \uBAA8\uC591\uC758 \uC6CC\uD130\uB9C8\uD06C\uB97C \uC815\uBC00\uD558\uAC8C \uCE60\uD560 \uB54C \uC0AC\uC6A9\uD569\uB2C8\uB2E4.' : 'Rectangle for quick large area selection. Brush for precise painting over irregular watermarks.'}</p>
                    </div>
                </div>
            </div>

            <div className="w-full mt-10"><AdPlaceholder id="ad-wmr-bottom" showCoupang={true} /></div>
        </div>
    );
};

export default WatermarkRemovePage;