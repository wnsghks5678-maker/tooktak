import { useEffect, useRef, useState } from 'react';

interface CoupangBannerProps {
    width?: string | number;
    height?: string | number;
    className?: string;
}

export default function CoupangBanner({ width = '680', height = '140', className = '' }: CoupangBannerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const loadedRef = useRef(false);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        // If already loaded or container not ready, skip
        // Note: We need to handle re-renders if width/height changes?
        // Coupang script might not support dynamic update without full reload/re-init.
        // For now, assume width/height are stable or component re-mounts on resize (key change).
        if (loadedRef.current || !containerRef.current) return;

        // Reset check if props changed? 
        // Actually, if React re-renders this component, loadedRef.current persists.
        // If we want to support resizing, we might need a key on the parent or handle cleanup.
        // But for simplicity and stability, we'll try to init once.

        const initBanner = () => {
            // Prevent running if unmounted
            if (!containerRef.current) return;

            // Mark as loaded to prevent double-init
            loadedRef.current = true;

            if ((window as any).PartnersCoupang) {
                try {
                    new (window as any).PartnersCoupang.G({
                        id: 965860,
                        template: 'carousel',
                        trackingCode: 'AF9381483',
                        width: String(width),
                        height: String(height),
                        tsource: '',
                        container: containerRef.current
                    });
                } catch (e) {
                    console.error('Coupang banner error:', e);
                    setIsError(true);
                }
            }
        };

        // Check if script exists
        const existingScript = document.querySelector('script[src="https://ads-partners.coupang.com/g.js"]');

        if (existingScript && (window as any).PartnersCoupang) {
            initBanner();
        } else if (!existingScript) {
            const script = document.createElement('script');
            script.src = 'https://ads-partners.coupang.com/g.js';
            script.async = true;
            script.onload = () => initBanner();
            script.onerror = () => setIsError(true);
            document.head.appendChild(script);
        } else if (existingScript) {
            // Script exists but not loaded yet
            existingScript.addEventListener('load', initBanner);
        }

        return () => {
            if (existingScript) {
                existingScript.removeEventListener('load', initBanner);
            }
        };
    }, [width, height]);

    if (isError) return null; // Fallback to nothing (or let parent handle fallback via checks?)
    // Actually if this returns null, parent styling might break.
    // Better to just render empty div and let parent decide? 
    // Or we keep it simple.

    return (
        <div
            ref={containerRef}
            className={`flex items-center justify-center overflow-hidden ${className}`}
            style={{ width: '100%', minHeight: `${height}px` }}
        >
            {/* Banner injected here */}
        </div>
    );
}
