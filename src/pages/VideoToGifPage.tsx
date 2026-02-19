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
    const [crop, setCrop] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);

    // Crop drag state
    // dragStart is not currently used for rendering, but kept for future extensibility if needed.
    // To satisfy linter, we can remove it if strictly unused, but here we will just remove the state
    // and use local variables in handler as we already do.
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);

    useEffect(() => { updateSEO('videoToGif', locale); }, [locale]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 50 * 1024 * 1024) { alert(t('common.fileTooLarge')); return; }
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['mp4', 'webm', 'mov', 'avi'].includes(ext || '')) { alert(t('common.unsupportedFormat')); return; }
        setVideoFile(file);
        setGifUrl('');
        setComplete(false);
        setProgress(0);
        setVideoUrl(URL.createObjectURL(file));
        setStartTime(0);
        setEndTime(5);
        setCrop(null);
        setIsCropping(false);
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

    // Range Slider Logic
    const handleRangeDrag = (e: React.MouseEvent | React.TouchEvent, type: 'start' | 'end') => {
        e.preventDefault(); // Fix unused 'e' lint
        const slider = sliderRef.current;
        if (!slider) return;

        const updateTime = (clientX: number) => {
            const rect = slider.getBoundingClientRect();
            const percent = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
            const time = percent * videoDuration;

            if (type === 'start') {
                const newStart = Math.min(time, endTime - 1); // Min 1s duration
                setStartTime(Math.max(0, newStart));
                if (videoRef.current) videoRef.current.currentTime = newStart;
            } else {
                const newEnd = Math.max(time, startTime + 1); // Min 1s duration
                setEndTime(Math.min(videoDuration, newEnd));
                if (videoRef.current) videoRef.current.currentTime = newEnd;
            }
        };

        const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
            const clientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
            updateTime(clientX);
        };

        const handleUp = () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleUp);
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleUp);
    };

    // Crop Logic
    const initCrop = () => {
        if (!videoRef.current) return;
        const { videoWidth, videoHeight } = videoRef.current;
        // Default crop: center 50%
        setCrop({
            x: videoWidth * 0.25,
            y: videoHeight * 0.25,
            width: videoWidth * 0.5,
            height: videoHeight * 0.5
        });
        setIsCropping(true);
    };

    const getVideoScale = () => {
        if (!videoRef.current) return 1;
        return videoRef.current.videoWidth / videoRef.current.offsetWidth;
    };

    const handleCropMouseDown = (e: React.MouseEvent | React.TouchEvent, handle: string | null) => {
        e.preventDefault();
        e.stopPropagation();
        if (!crop) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        // Removing setDragStart as it was unused state
        setResizeHandle(handle);

        const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
            const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
            const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

            // We need to pass these to the calculation function
            // directly using closure values from this scope
            updateCrop(currentX, currentY, clientX, clientY, { ...crop }, handle);
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

    const updateCrop = (currentX: number, currentY: number, startX: number, startY: number, initialCrop: { x: number, y: number, width: number, height: number }, handle: string | null) => {
        if (!videoRef.current) return;

        const scale = getVideoScale();
        const deltaX = (currentX - startX) * scale;
        const deltaY = (currentY - startY) * scale;
        const { videoWidth, videoHeight } = videoRef.current;
        const minSize = 50; // Minimum 50px

        let newCrop = { ...initialCrop };

        if (!handle) {
            // Move
            newCrop.x = Math.min(Math.max(0, initialCrop.x + deltaX), videoWidth - initialCrop.width);
            newCrop.y = Math.min(Math.max(0, initialCrop.y + deltaY), videoHeight - initialCrop.height);
        } else {
            // Resize
            if (handle.includes('w')) {
                const newWidth = Math.max(minSize, initialCrop.width - deltaX);
                const newX = Math.min(Math.max(0, initialCrop.x + deltaX), initialCrop.x + initialCrop.width - minSize);
                // Only update if within bounds
                if (newX >= 0) {
                    newCrop.x = newX;
                    newCrop.width = newWidth;
                }
            }
            if (handle.includes('e')) {
                newCrop.width = Math.min(Math.max(minSize, initialCrop.width + deltaX), videoWidth - initialCrop.x);
            }
            if (handle.includes('n')) {
                const newHeight = Math.max(minSize, initialCrop.height - deltaY);
                const newY = Math.min(Math.max(0, initialCrop.y + deltaY), initialCrop.y + initialCrop.height - minSize);
                if (newY >= 0) {
                    newCrop.y = newY;
                    newCrop.height = newHeight;
                }
            }
            if (handle.includes('s')) {
                newCrop.height = Math.min(Math.max(minSize, initialCrop.height + deltaY), videoHeight - initialCrop.y);
            }
        }

        // Final boundary check to be safe
        if (newCrop.x < 0) newCrop.x = 0;
        if (newCrop.y < 0) newCrop.y = 0;
        if (newCrop.x + newCrop.width > videoWidth) newCrop.x = videoWidth - newCrop.width;
        if (newCrop.y + newCrop.height > videoHeight) newCrop.y = videoHeight - newCrop.height;

        setCrop(newCrop);
    };

    const convertToGif = async () => {
        if (!videoFile || !videoRef.current || !canvasRef.current) return;
        setConverting(true);
        setProgress(0);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

        // Determine dimensions
        const sourceX = crop ? crop.x : 0;
        const sourceY = crop ? crop.y : 0;
        const sourceWidth = crop ? crop.width : video.videoWidth;
        const sourceHeight = crop ? crop.height : video.videoHeight;

        const scale = outputWidth / sourceWidth;
        const destHeight = Math.round(sourceHeight * scale);

        canvas.width = outputWidth;
        canvas.height = destHeight;

        const fpsInterval = 1 / fps;
        const totalFrames = Math.floor((endTime - startTime) * fps);
        const delay = Math.round(1000 / fps);

        const gif = new GIF({
            workers: 2,
            quality: 10,
            width: outputWidth,
            height: destHeight,
            workerScript: '/gif.worker.js',
            repeat: 0
        });

        const captureFrame = (time: number): Promise<void> => {
            return new Promise((resolve) => {
                const onSeeked = () => {
                    video.removeEventListener('seeked', onSeeked);
                    // Draw only the cropped area
                    ctx.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, outputWidth, destHeight);
                    gif.addFrame(ctx, { copy: true, delay });
                    resolve();
                };
                video.addEventListener('seeked', onSeeked);
                video.currentTime = time;
            });
        };

        try {
            for (let i = 0; i < totalFrames; i++) {
                const time = startTime + i * fpsInterval;
                if (time > endTime) break;
                await captureFrame(time);
                setProgress(Math.round(((i + 1) / totalFrames) * 70));
            }

            gif.on('progress', (p: number) => {
                setProgress(70 + Math.round(p * 30));
            });

            gif.on('finished', (blob: Blob) => {
                setGifSize(blob.size);
                setGifUrl(URL.createObjectURL(blob));
                setComplete(true);
                setProgress(100);
                setConverting(false);
            });

            gif.render();
        } catch (err) {
            console.error(err);
            alert(t('common.error'));
            setConverting(false);
        }
    };

    const handleDownload = () => {
        if (!gifUrl) return;
        const a = document.createElement('a');
        a.href = gifUrl;
        a.download = `tooktak-${videoFile?.name?.replace(/\.[^/.]+$/, '') || 'video'}.gif`;
        a.click();
    };

    const handleRetry = () => {
        setVideoFile(null);
        setVideoUrl('');
        setGifUrl('');
        setComplete(false);
        setStartTime(0);
        setEndTime(5);
        setProgress(0);
        setCrop(null);
        setIsCropping(false);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Render helper for Crop Overlay (simplified for update)
    // In a real implementation, we would need complex drag/resize logic here.
    // I will implement a basic "Center Crop" visualizer for now to match the "crop" state.
    // Since full drag/resize logic is complex to inject in one go, I'll rely on the logic that 
    // the user provided in the prompt: "Draggable overlay... Resize handles".
    // I will implement the visual part first.

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Helmet>
                <title>{locale === 'ko' ? '무료 Video to GIF 변환기 | 뚝딱' : 'Free Video to GIF Converter | TookTak'}</title>
                <meta name="description" content={locale === 'ko' ? '동영상을 GIF로 무료 변환. MP4, WEBM, MOV 지원. 브라우저에서 바로 처리.' : 'Convert videos to GIF for free. Supports MP4, WEBM, MOV. 100% browser-based.'} />
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
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                        >
                            <div className="text-5xl mb-4">🎬</div>
                            <p className="text-lg font-semibold text-gray-700 mb-2">{t('videoToGif.upload')}</p>
                            <p className="text-sm text-gray-500">{t('videoToGif.uploadHint')}</p>
                            <input ref={fileInputRef} type="file" accept=".mp4,.webm,.mov,.avi,video/*" onChange={handleFileSelect} className="hidden" />
                        </div>
                    ) : (
                        <>
                            <div className="relative mb-6 group" ref={videoContainerRef}>
                                <video ref={videoRef} src={videoUrl} controls={!isCropping} onLoadedMetadata={handleVideoLoaded}
                                    className="w-full max-h-[500px] rounded-xl bg-black" />

                                {isCropping && crop && videoRef.current && (
                                    <div className="absolute inset-0 pointer-events-none">
                                        {/* Simple visual representation of crop - advanced drag/resize requires more code */}
                                        <div
                                            className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-auto cursor-move"
                                            style={{
                                                left: `${(crop.x / videoRef.current.videoWidth) * 100}%`,
                                                top: `${(crop.y / videoRef.current.videoHeight) * 100}%`,
                                                width: `${(crop.width / videoRef.current.videoWidth) * 100}%`,
                                                height: `${(crop.height / videoRef.current.videoHeight) * 100}%`
                                            }}
                                            onMouseDown={(e) => handleCropMouseDown(e, null)}
                                            onTouchStart={(e) => handleCropMouseDown(e, null)}
                                        >
                                            {/* Handles */}
                                            <div className={`absolute top-0 left-0 w-4 h-4 bg-blue-500 rounded-full border border-white -translate-x-1/2 -translate-y-1/2 cursor-nw-resize ${resizeHandle === 'nw' ? 'scale-125 bg-blue-600' : ''}`}
                                                onMouseDown={(e) => handleCropMouseDown(e, 'nw')} onTouchStart={(e) => handleCropMouseDown(e, 'nw')} />
                                            <div className={`absolute top-0 right-0 w-4 h-4 bg-blue-500 rounded-full border border-white translate-x-1/2 -translate-y-1/2 cursor-ne-resize ${resizeHandle === 'ne' ? 'scale-125 bg-blue-600' : ''}`}
                                                onMouseDown={(e) => handleCropMouseDown(e, 'ne')} onTouchStart={(e) => handleCropMouseDown(e, 'ne')} />
                                            <div className={`absolute bottom-0 left-0 w-4 h-4 bg-blue-500 rounded-full border border-white -translate-x-1/2 translate-y-1/2 cursor-sw-resize ${resizeHandle === 'sw' ? 'scale-125 bg-blue-600' : ''}`}
                                                onMouseDown={(e) => handleCropMouseDown(e, 'sw')} onTouchStart={(e) => handleCropMouseDown(e, 'sw')} />
                                            <div className={`absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full border border-white translate-x-1/2 translate-y-1/2 cursor-se-resize ${resizeHandle === 'se' ? 'scale-125 bg-blue-600' : ''}`}
                                                onMouseDown={(e) => handleCropMouseDown(e, 'se')} onTouchStart={(e) => handleCropMouseDown(e, 'se')} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="space-y-6 mb-8">
                                {/* Range Slider */}
                                <div>
                                    <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                                        <span>{t('videoToGif.range')}</span>
                                        <span>{t('videoToGif.selectedTime', { start: startTime.toFixed(1), end: endTime.toFixed(1), duration: (endTime - startTime).toFixed(1) })}</span>
                                    </div>
                                    <div className="relative h-10 select-none touch-none" ref={sliderRef}>
                                        <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-200 rounded-full -translate-y-1/2"></div>
                                        <div
                                            className="absolute top-1/2 h-2 bg-blue-500 -translate-y-1/2"
                                            style={{
                                                left: `${(startTime / videoDuration) * 100}%`,
                                                width: `${((endTime - startTime) / videoDuration) * 100}%`
                                            }}
                                        />
                                        {/* Start Thumb */}
                                        <div
                                            className="absolute top-1/2 w-6 h-6 bg-white border-2 border-blue-500 rounded-full -translate-y-1/2 -translate-x-1/2 cursor-ew-resize shadow hover:scale-110 transition-transform z-10"
                                            style={{ left: `${(startTime / videoDuration) * 100}%` }}
                                            onMouseDown={(e) => handleRangeDrag(e, 'start')}
                                            onTouchStart={(e) => handleRangeDrag(e, 'start')}
                                        />
                                        {/* End Thumb */}
                                        <div
                                            className="absolute top-1/2 w-6 h-6 bg-white border-2 border-blue-500 rounded-full -translate-y-1/2 -translate-x-1/2 cursor-ew-resize shadow hover:scale-110 transition-transform z-10"
                                            style={{ left: `${(endTime / videoDuration) * 100}%` }}
                                            onMouseDown={(e) => handleRangeDrag(e, 'end')}
                                            onTouchStart={(e) => handleRangeDrag(e, 'end')}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {/* FPS Select */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">{t('videoToGif.fps')}</label>
                                        <select value={fps} onChange={(e) => setFps(Number(e.target.value))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={15}>15</option>
                                            <option value={20}>20</option>
                                            <option value={25}>25</option>
                                        </select>
                                    </div>
                                    {/* Width Select */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">{t('videoToGif.width')}</label>
                                        <select value={outputWidth} onChange={(e) => setOutputWidth(Number(e.target.value))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                                            <option value={240}>240px</option>
                                            <option value={320}>320px</option>
                                            <option value={480}>480px</option>
                                            <option value={640}>640px</option>
                                            <option value={800}>800px</option>
                                        </select>
                                    </div>
                                    {/* Crop Toggle */}
                                    <div className="col-span-2 flex items-end">
                                        <button
                                            onClick={() => isCropping ? setIsCropping(false) : initCrop()}
                                            className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${isCropping ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            {isCropping ? t('videoToGif.disableCrop') : t('videoToGif.enableCrop')}
                                        </button>
                                    </div>
                                </div>

                                {isCropping && crop && (
                                    <div className="text-sm text-center text-gray-500 bg-gray-50 p-2 rounded-lg">
                                        {t('videoToGif.cropInfo', { width: Math.round(crop.width), height: Math.round(crop.height) })}
                                    </div>
                                )}
                            </div>

                            {converting && (
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>{t('videoToGif.converting')}</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                                    </div>
                                    <p className="text-xs text-gray-500 text-center mt-2">{t('videoToGif.convertingDetail')}</p>
                                </div>
                            )}

                            <button onClick={convertToGif} disabled={converting}
                                className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed">
                                {converting ? t('videoToGif.converting') : t('videoToGif.convert')}
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100 mb-8">
                    <div className="text-center mb-6">
                        <div className="text-4xl mb-2">✅</div>
                        <h2 className="text-xl font-bold text-gray-900">{t('videoToGif.complete')}</h2>
                        <p className="text-sm text-gray-500 mt-1">{t('videoToGif.fileSize')}: {formatSize(gifSize)}</p>
                    </div>
                    <div className="flex justify-center mb-6">
                        <img src={gifUrl} alt="GIF result" className="max-w-full max-h-[400px] rounded-xl border" />
                    </div>
                    <div className="flex gap-4">
                        <button onClick={handleDownload}
                            className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all">
                            {t('videoToGif.download')}
                        </button>
                        <button onClick={handleRetry}
                            className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-all">
                            {t('videoToGif.retry')}
                        </button>
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