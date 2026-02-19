import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from '../i18n';
import AdPlaceholder from '../components/AdPlaceholder';
import { updateSEO } from '../utils/seo';
import GIF from 'gif.js';

const VideoToGifPage = () => {
    const { t, locale } = useTranslation();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [gifUrl, setGifUrl] = useState('');
    const [gifSize, setGifSize] = useState(0);
    const [converting, setConverting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [complete, setComplete] = useState(false);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(5);
    const [fps, setFps] = useState(10);
    const [outputWidth, setOutputWidth] = useState(480);
    const [videoDuration, setVideoDuration] = useState(0);

    // Crop states
    const [crop, setCrop] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [appliedCrop, setAppliedCrop] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [isCropMode, setIsCropMode] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    useEffect(() => { updateSEO('videoToGif', locale); }, [locale]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 50 * 1024 * 1024) { alert(t('common.fileTooLarge')); return; }
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['mp4', 'webm', 'mov', 'avi'].includes(ext || '')) { alert(t('common.unsupportedFormat')); return; }
        setVideoFile(file);
        setGifUrl(''); setComplete(false); setProgress(0);
        setVideoUrl(URL.createObjectURL(file));
        setStartTime(0); setEndTime(5);
        setCrop(null); setAppliedCrop(null); setIsCropMode(false);
    };

    const handleVideoLoaded = () => {
        if (videoRef.current) {
            const dur = videoRef.current.duration;
            setVideoDuration(dur);
            setEndTime(Math.min(5, dur));
        }
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

    // Range slider
    const handleRangeDrag = (e: React.MouseEvent | React.TouchEvent, type: 'start' | 'end') => {
        e.preventDefault();
        const slider = sliderRef.current;
        if (!slider) return;
        const updateTime = (clientX: number) => {
            const rect = slider.getBoundingClientRect();
            const pct = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
            const time = pct * videoDuration;
            if (type === 'start') {
                setStartTime(Math.max(0, Math.min(time, endTime - 1)));
                if (videoRef.current) videoRef.current.currentTime = time;
            } else {
                setEndTime(Math.min(videoDuration, Math.max(time, startTime + 1)));
                if (videoRef.current) videoRef.current.currentTime = time;
            }
        };
        const onMove = (ev: MouseEvent | TouchEvent) => {
            updateTime('touches' in ev ? ev.touches[0].clientX : ev.clientX);
        };
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onUp);
    };

    // Crop
    const enterCropMode = () => {
        if (!videoRef.current) return;
        const { videoWidth: vw, videoHeight: vh } = videoRef.current;
        setCrop({ x: vw * 0.25, y: vh * 0.25, width: vw * 0.5, height: vh * 0.5 });
        setIsCropMode(true);
    };

    const applyCropFn = () => {
        if (crop) setAppliedCrop({ ...crop });
        setIsCropMode(false);
    };

    const cancelCropFn = () => {
        setCrop(appliedCrop ? { ...appliedCrop } : null);
        setIsCropMode(false);
    };

    const resetCropFn = () => {
        setCrop(null); setAppliedCrop(null); setIsCropMode(false);
    };

    const getVideoScale = () => {
        if (!videoRef.current) return 1;
        return videoRef.current.videoWidth / videoRef.current.offsetWidth;
    };

    const handleCropMouseDown = (e: React.MouseEvent | React.TouchEvent, handle: string | null) => {
        e.preventDefault(); e.stopPropagation();
        if (!crop) return;
        const cx0 = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const cy0 = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const initCrop = { ...crop };
        setResizeHandle(handle);

        const onMove = (ev: MouseEvent | TouchEvent) => {
            const cx = 'touches' in ev ? ev.touches[0].clientX : ev.clientX;
            const cy = 'touches' in ev ? ev.touches[0].clientY : ev.clientY;
            if (!videoRef.current) return;
            const scale = getVideoScale();
            const dx = (cx - cx0) * scale;
            const dy = (cy - cy0) * scale;
            const { videoWidth: vw, videoHeight: vh } = videoRef.current;
            const min = 50;
            const nc = { ...initCrop };
            if (!handle) {
                nc.x = Math.min(Math.max(0, initCrop.x + dx), vw - initCrop.width);
                nc.y = Math.min(Math.max(0, initCrop.y + dy), vh - initCrop.height);
            } else {
                if (handle.includes('w')) { const nw = Math.max(min, initCrop.width - dx); const nx = Math.max(0, initCrop.x + dx); if (nx >= 0) { nc.x = nx; nc.width = nw; } }
                if (handle.includes('e')) { nc.width = Math.min(Math.max(min, initCrop.width + dx), vw - initCrop.x); }
                if (handle.includes('n')) { const nh = Math.max(min, initCrop.height - dy); const ny = Math.max(0, initCrop.y + dy); if (ny >= 0) { nc.y = ny; nc.height = nh; } }
                if (handle.includes('s')) { nc.height = Math.min(Math.max(min, initCrop.height + dy), vh - initCrop.y); }
            }
            if (nc.x < 0) nc.x = 0;
            if (nc.y < 0) nc.y = 0;
            setCrop(nc);
        };
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onUp);
            setResizeHandle(null);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onUp);
    };

    const convertToGif = async () => {
        if (!videoFile || !videoRef.current || !canvasRef.current) return;
        setConverting(true); setProgress(0);
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        const useCrop = appliedCrop;
        const sx = useCrop ? useCrop.x : 0;
        const sy = useCrop ? useCrop.y : 0;
        const sw = useCrop ? useCrop.width : video.videoWidth;
        const sh = useCrop ? useCrop.height : video.videoHeight;
        const scale = outputWidth / sw;
        const dh = Math.round(sh * scale);
        canvas.width = outputWidth; canvas.height = dh;
        const totalFrames = Math.floor((endTime - startTime) * fps);
        const delay = Math.round(1000 / fps);
        const gif = new GIF({ workers: 2, quality: 10, width: outputWidth, height: dh, workerScript: '/gif.worker.js', repeat: 0 });

        const captureFrame = (time: number): Promise<void> => {
            return new Promise(resolve => {
                const onSeeked = () => { video.removeEventListener('seeked', onSeeked); ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outputWidth, dh); gif.addFrame(ctx, { copy: true, delay }); resolve(); };
                video.addEventListener('seeked', onSeeked);
                video.currentTime = time;
            });
        };

        try {
            for (let i = 0; i < totalFrames; i++) {
                const time = startTime + i / fps;
                if (time > endTime) break;
                await captureFrame(time);
                setProgress(Math.round(((i + 1) / totalFrames) * 70));
            }
            gif.on('progress', (p: number) => setProgress(70 + Math.round(p * 30)));
            gif.on('finished', (blob: Blob) => {
                setGifSize(blob.size); setGifUrl(URL.createObjectURL(blob)); setComplete(true); setProgress(100); setConverting(false);
            });
            gif.render();
        } catch (err) { console.error(err); alert(t('common.error')); setConverting(false); }
    };

    const handleDownload = () => {
        if (!gifUrl) return;
        const a = document.createElement('a'); a.href = gifUrl;
        a.download = `tooktak-${videoFile?.name?.replace(/\.[^/.]+$/, '') || 'video'}.gif`;
        a.click();
    };

    const handleRetry = () => {
        setVideoFile(null); setVideoUrl(''); setGifUrl(''); setComplete(false);
        setStartTime(0); setEndTime(5); setProgress(0);
        setCrop(null); setAppliedCrop(null); setIsCropMode(false);
    };

    const formatSize = (b: number) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';

    const renderCropOverlay = () => {
        if (!isCropMode || !crop || !videoRef.current) return null;
        const { videoWidth: vw, videoHeight: vh } = videoRef.current;
        const style = { left: `${(crop.x / vw) * 100}%`, top: `${(crop.y / vh) * 100}%`, width: `${(crop.width / vw) * 100}%`, height: `${(crop.height / vh) * 100}%` };
        const handles = ['nw', 'ne', 'sw', 'se'];
        const pos: Record<string, string> = {
            nw: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize',
            ne: 'top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize',
            sw: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize',
            se: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize'
        };
        return (
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-auto cursor-move"
                    style={style} onMouseDown={e => handleCropMouseDown(e, null)} onTouchStart={e => handleCropMouseDown(e, null)}>
                    {handles.map(h => (
                        <div key={h} className={`absolute w-4 h-4 bg-blue-500 rounded-full border border-white ${pos[h]} ${resizeHandle === h ? 'scale-125' : ''}`}
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
                <title>{locale === 'ko' ? '\uBB34\uB8CC Video to GIF \uBCC0\uD658\uAE30 | \uB69D\uB531' : 'Free Video to GIF Converter | TookTak'}</title>
                <meta name="description" content={locale === 'ko' ? '\uB3D9\uC601\uC0C1\uC744 GIF\uB85C \uBB34\uB8CC \uBCC0\uD658. MP4, WEBM, MOV \uC9C0\uC6D0.' : 'Convert videos to GIF for free. Supports MP4, WEBM, MOV.'} />
                <meta property="og:url" content="https://tooktak.pages.dev/video-to-gif" />
                <link rel="canonical" href="https://tooktak.pages.dev/video-to-gif" />
            </Helmet>

            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{t('videoToGif.title')}</h1>
                <p className="text-gray-600">{t('videoToGif.subtitle')}</p>
            </div>

            <div className="w-full mb-10"><AdPlaceholder id="ad-vtg-top" showCoupang={true} /></div>
            <canvas ref={canvasRef} className="hidden" />

            {!complete ? (
                <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100 mb-8">
                    {!videoFile ? (
                        <div onClick={() => fileInputRef.current?.click()} onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                            <div className="text-5xl mb-4">{'\uD83C\uDFAC'}</div>
                            <p className="text-lg font-semibold text-gray-700 mb-2">{t('videoToGif.upload')}</p>
                            <p className="text-sm text-gray-500">{t('videoToGif.uploadHint')}</p>
                            <input ref={fileInputRef} type="file" accept=".mp4,.webm,.mov,.avi,video/*" onChange={handleFileSelect} className="hidden" />
                        </div>
                    ) : (
                        <>
                            <div className="relative mb-6">
                                <video ref={videoRef} src={videoUrl} controls={!isCropMode} onLoadedMetadata={handleVideoLoaded}
                                    className="w-full max-h-[500px] rounded-xl bg-black" />
                                {renderCropOverlay()}
                                {appliedCrop && !isCropMode && videoRef.current && (
                                    <div className="absolute inset-0 pointer-events-none">
                                        <div className="absolute border-2 border-green-400 border-dashed" style={{
                                            left: `${(appliedCrop.x / videoRef.current.videoWidth) * 100}%`,
                                            top: `${(appliedCrop.y / videoRef.current.videoHeight) * 100}%`,
                                            width: `${(appliedCrop.width / videoRef.current.videoWidth) * 100}%`,
                                            height: `${(appliedCrop.height / videoRef.current.videoHeight) * 100}%`
                                        }}>
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                                                {'\u2705'} {Math.round(appliedCrop.width)}x{Math.round(appliedCrop.height)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Crop buttons */}
                            {isCropMode ? (
                                <div className="flex gap-2 mb-6">
                                    <button onClick={applyCropFn} className="flex-1 py-3 px-4 rounded-lg font-bold bg-green-500 text-white hover:bg-green-600 shadow-lg text-base animate-pulse">
                                        {'\u2714'} {locale === 'ko' ? '\uC801\uC6A9' : 'Apply'}
                                    </button>
                                    <button onClick={cancelCropFn} className="flex-1 py-3 px-4 rounded-lg font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg text-base">
                                        {locale === 'ko' ? '\uCDE8\uC18C' : 'Cancel'}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2 mb-6">
                                    <button onClick={enterCropMode} className="flex-1 py-2 px-4 rounded-lg font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                                        {'\u2702\uFE0F'} {locale === 'ko' ? '\uC601\uC5ED \uC120\uD0DD' : 'Select Area'}
                                    </button>
                                    {appliedCrop && (
                                        <button onClick={resetCropFn} className="py-2 px-4 rounded-lg font-semibold bg-red-50 border border-red-200 text-red-600 hover:bg-red-100">
                                            {locale === 'ko' ? '\uCD08\uAE30\uD654' : 'Reset'}
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="space-y-6 mb-8">
                                <div>
                                    <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                                        <span>{t('videoToGif.range')}</span>
                                        <span>{t('videoToGif.selectedTime', { start: startTime.toFixed(1), end: endTime.toFixed(1), duration: (endTime - startTime).toFixed(1) })}</span>
                                    </div>
                                    <div className="relative h-10 select-none touch-none" ref={sliderRef}>
                                        <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-200 rounded-full -translate-y-1/2" />
                                        <div className="absolute top-1/2 h-2 bg-blue-500 -translate-y-1/2"
                                            style={{ left: `${(startTime / videoDuration) * 100}%`, width: `${((endTime - startTime) / videoDuration) * 100}%` }} />
                                        <div className="absolute top-1/2 w-6 h-6 bg-white border-2 border-blue-500 rounded-full -translate-y-1/2 -translate-x-1/2 cursor-ew-resize shadow hover:scale-110 transition-transform z-10"
                                            style={{ left: `${(startTime / videoDuration) * 100}%` }}
                                            onMouseDown={e => handleRangeDrag(e, 'start')} onTouchStart={e => handleRangeDrag(e, 'start')} />
                                        <div className="absolute top-1/2 w-6 h-6 bg-white border-2 border-blue-500 rounded-full -translate-y-1/2 -translate-x-1/2 cursor-ew-resize shadow hover:scale-110 transition-transform z-10"
                                            style={{ left: `${(endTime / videoDuration) * 100}%` }}
                                            onMouseDown={e => handleRangeDrag(e, 'end')} onTouchStart={e => handleRangeDrag(e, 'end')} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">{t('videoToGif.fps')}</label>
                                        <select value={fps} onChange={e => setFps(Number(e.target.value))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                                            <option value={5}>5</option><option value={10}>10</option><option value={15}>15</option><option value={20}>20</option><option value={25}>25</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">{t('videoToGif.width')}</label>
                                        <select value={outputWidth} onChange={e => setOutputWidth(Number(e.target.value))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                                            <option value={240}>240px</option><option value={320}>320px</option><option value={480}>480px</option><option value={640}>640px</option><option value={800}>800px</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {converting && (
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>{t('videoToGif.converting')}</span><span>{progress}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>
                            )}

                            <button onClick={convertToGif} disabled={converting || isCropMode}
                                className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                {converting ? t('videoToGif.converting') : t('videoToGif.convert')}
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100 mb-8">
                    <div className="text-center mb-6">
                        <div className="text-4xl mb-2">{'\u2705'}</div>
                        <h2 className="text-xl font-bold text-gray-900">{t('videoToGif.complete')}</h2>
                        <p className="text-sm text-gray-500 mt-1">{t('videoToGif.fileSize')}: {formatSize(gifSize)}</p>
                    </div>
                    <div className="flex justify-center mb-6">
                        <img src={gifUrl} alt="GIF" className="max-w-full max-h-[400px] rounded-xl border" />
                    </div>
                    <div className="flex gap-4">
                        <button onClick={handleDownload} className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700">{t('videoToGif.download')}</button>
                        <button onClick={handleRetry} className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300">{t('videoToGif.retry')}</button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t('videoToGif.faqTitle')}</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map(num => (
                        <div key={num}>
                            <h4 className="font-semibold text-gray-800 mb-1">Q. {t(`videoToGif.faq${num}q`)}</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">{t(`videoToGif.faq${num}a`)}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full mt-10"><AdPlaceholder id="ad-vtg-bottom" showCoupang={true} /></div>
        </div>
    );
};

export default VideoToGifPage;