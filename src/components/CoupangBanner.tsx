import { useEffect, useRef, useState } from 'react';

interface CoupangBannerProps {
    width?: number | string;
    height?: number | string;
    className?: string;
}

export default function CoupangBanner({ width = 680, height = 140, className = '' }: CoupangBannerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const loadedRef = useRef(false);
    const [isError, setIsError] = useState(false);

    // 사이드바용이면 작은 사이즈로 조정
    const isSidebar = Number(width) <= 200;

    const bannerWidth = isSidebar ? '160' : String(width);
    const bannerHeight = isSidebar ? '600' : String(height);

    useEffect(() => {
        if (loadedRef.current || !containerRef.current) return;

        const initBanner = () => {
            if (!containerRef.current) return;
            loadedRef.current = true;

            if ((window as any).PartnersCoupang) {
                try {
                    new (window as any).PartnersCoupang.G({
                        id: 965860,
                        template: isSidebar ? 'banner' : 'carousel',
                        trackingCode: 'AF9381483',
                        width: bannerWidth,
                        height: bannerHeight,
                        tsource: '',
                        container: containerRef.current
                    });
                } catch (e) {
                    console.error('Coupang banner error:', e);
                    setIsError(true);
                }
            }
        };

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
            existingScript.addEventListener('load', initBanner);
        }

        return () => {
            if (existingScript) {
                existingScript.removeEventListener('load', initBanner);
            }
        };
    }, [bannerWidth, bannerHeight, isSidebar]);

    if (isError) return null;

    return (
        <div
            ref={containerRef}
            className={`flex items-center justify-center overflow-hidden ${className}`}
            style={{
                width: `${bannerWidth}px`,
                maxWidth: `${bannerWidth}px`,
                minHeight: `${bannerHeight}px`,
                overflow: 'hidden'
            }}
        />
    );
}
