import { useEffect, useRef } from 'react';

interface AdsterraBannerProps {
    adKey: string;
    width: number;
    height: number;
    className?: string;
}

const AdsterraBanner = ({ adKey, width, height, className }: AdsterraBannerProps) => {
    const bannerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!bannerRef.current) return;

        const conf = document.createElement('script');
        const script = document.createElement('script');

        conf.type = 'text/javascript';
        conf.innerHTML = `
            atOptions = {
                'key' : '${adKey}',
                'format' : 'iframe',
                'height' : ${height},
                'width' : ${width},
                'params' : {}
            };
        `;

        script.type = 'text/javascript';
        script.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;

        // Clear previous content
        if (bannerRef.current) {
            bannerRef.current.innerHTML = '';
            bannerRef.current.appendChild(conf);
            bannerRef.current.appendChild(script);
        }

        return () => {
            if (bannerRef.current) {
                bannerRef.current.innerHTML = '';
            }
        };
    }, [adKey, width, height]);

    return (
        <div
            ref={bannerRef}
            className={`flex justify-center items-center overflow-hidden ${className || ''}`}
            style={{ width: width, height: height }}
        />
    );
};

export default AdsterraBanner;
