import { useEffect, useState } from 'react';
import { useTranslation } from '../i18n';
import CoupangBanner from './CoupangBanner';
import AdsterraBanner from './AdsterraBanner';

export interface AdPlaceholderProps {
    id: string;
    className?: string;
    adCode?: string;
    showCoupang?: boolean;
}

const AdPlaceholder = ({
    id,
    className,
    adCode,
    showCoupang = false
}: AdPlaceholderProps) => {
    const { locale } = useTranslation();
    const [coupangSize, setCoupangSize] = useState({ width: '680', height: '140' });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            setIsMobile(w < 768);
            if (w < 640) {
                setCoupangSize({ width: '320', height: '100' });
            } else if (w < 1024) {
                setCoupangSize({ width: '680', height: '140' });
            } else {
                setCoupangSize({ width: '728', height: '160' });
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const wrapperClass = `flex justify-center w-full my-6 py-4 ${className || ''}`;

    if (adCode) {
        return (
            <div id={id} className={wrapperClass}>
                <div dangerouslySetInnerHTML={{ __html: adCode }} />
            </div>
        );
    }

    if (locale === 'ko' && !isMobile && showCoupang) {
        return (
            <div id={id} className={wrapperClass}>
                <CoupangBanner
                    width={coupangSize.width}
                    height={coupangSize.height}
                />
            </div>
        );
    }

    if (isMobile) {
        return (
            <div id={id} className={wrapperClass}>
                <AdsterraBanner
                    adKey="34e9876282b2acf6e57c9875a635b87a"
                    width={300}
                    height={250}
                />
            </div>
        );
    }

    return (
        <div id={id} className={wrapperClass}>
            <AdsterraBanner
                adKey="a97720a06cde3dce13690e50242279cc"
                width={728}
                height={90}
            />
        </div>
    );
};

export default AdPlaceholder;
