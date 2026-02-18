import { useRef, useEffect, useState } from 'react';
import { useTranslation } from '../i18n';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAffiliateForLocale, type AffiliateConfig } from '../config/affiliates';
import CoupangBanner from './CoupangBanner';

export interface AdPlaceholderProps {
    id: string;
    width?: string | number;
    height?: string | number;
    className?: string;
    adCode?: string;
    affiliateUrl?: string; // Optional direct override
    affiliateImage?: string; // Optional direct override
    affiliateText?: string; // Optional direct override
    showCoupang?: boolean;
}

interface BannerDef {
    id: number;
    bgClass: string;
    icon?: string;
    titleKey: string;
    descKey: string;
    link: string;
    excludePath: string;
}

const AdPlaceholder = ({
    id,
    width,
    height,
    className,
    adCode,
    affiliateUrl: propAffUrl,
    affiliateImage: propAffImg,
    affiliateText: propAffText,
    showCoupang = false
}: AdPlaceholderProps) => {
    const { t, locale } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const bannerIdRef = useRef<number | null>(null);
    const [selectedBanner, setSelectedBanner] = useState<BannerDef | null>(null);
    const [activeAffiliate, setActiveAffiliate] = useState<AffiliateConfig | null>(null);
    const [coupangSize, setCoupangSize] = useState({ width: '680', height: '140' });

    // Determine if this is a narrow/vertical ad based on width, height, or ID
    const isVertical =
        (typeof width === 'number' && width <= 250) ||
        (typeof width === 'string' && width.includes('px') && parseInt(width) <= 250) ||
        (typeof height === 'number' && height >= 400) || // Tall ads are usually vertical sidebars
        id.includes('left') || id.includes('right'); // IDs often indicate position

    // Self-promotion banners
    const banners: BannerDef[] = [
        {
            id: 1,
            bgClass: 'bg-gradient-to-r from-blue-500 to-blue-600',
            titleKey: 'ads.banner1Title',
            descKey: 'ads.banner1Desc',
            link: '/compress',
            excludePath: '/compress'
        },
        {
            id: 2,
            bgClass: 'bg-gradient-to-r from-purple-500 to-pink-500',
            titleKey: 'ads.banner2Title',
            descKey: 'ads.banner2Desc',
            link: '/convert',
            excludePath: '/convert'
        },
        {
            id: 3,
            bgClass: 'bg-gradient-to-r from-green-500 to-teal-500',
            titleKey: 'ads.banner3Title',
            descKey: 'ads.banner3Desc',
            link: '/remove-bg',
            excludePath: '/remove-bg'
        },
        {
            id: 4,
            bgClass: 'bg-gradient-to-r from-orange-500 to-red-500',
            titleKey: 'ads.banner4Title',
            descKey: 'ads.banner4Desc',
            link: '/qr-code',
            excludePath: '/qr-code'
        },
        {
            id: 5,
            bgClass: 'bg-gradient-to-r from-red-500 to-rose-500',
            titleKey: 'ads.banner5Title',
            descKey: 'ads.banner5Desc',
            link: '/pdf-merge',
            excludePath: '/pdf-merge'
        },
        {
            id: 6,
            bgClass: 'bg-gradient-to-r from-indigo-500 to-blue-500',
            titleKey: 'ads.banner6Title',
            descKey: 'ads.banner6Desc',
            link: '/',
            excludePath: '/'
        }
    ];

    useEffect(() => {
        // Responsive logic for Coupang
        const updateCoupangSize = () => {
            const w = window.innerWidth;
            if (w < 640) {
                setCoupangSize({ width: '320', height: '100' });
            } else if (w < 1024) {
                setCoupangSize({ width: '480', height: '120' });
            } else {
                setCoupangSize({ width: '680', height: '140' });
            }
        };

        if (showCoupang) {
            updateCoupangSize();
            // We don't add resize listener to avoid re-rendering Coupang iframe too often/incorrectly
            // But if we want real responsiveness we might need it.
            // However, Coupang script might not handle dynamic resize well without full re-mount.
            // For now, simple initial check on mount.
        }
    }, [showCoupang]);

    useEffect(() => {
        // 1. adCode is highest priority (handled in render)
        if (adCode) return;

        // 2. Coupang check
        // If showCoupang is true and locale is 'ko', we will render CoupangBanner.
        // But we shouldn't render affiliate or self-promo in that case.
        if (showCoupang && locale === 'ko' && !isVertical) {
            // Note: Coupang banner doesn't support vertical/side ads well in this implementation
            return;
        }

        // 3. Check for affiliate (either from props or auto-selected)
        let affiliate: AffiliateConfig | null = null;

        if (propAffUrl) {
            affiliate = {
                id: 'custom',
                name: 'Custom',
                url: propAffUrl,
                image: propAffImg,
                text: { [locale]: propAffText || '' } as any,
                desc: { [locale]: '' } as any,
                bgGradient: 'from-gray-700 to-gray-900', // Default
                targetLocales: ['all']
            };
        } else {
            affiliate = getAffiliateForLocale(locale);
        }

        if (affiliate && affiliate.url) {
            setActiveAffiliate(affiliate);
            return;
        }

        // 4. Fallback to self-promotion
        const validBanners = banners.filter(b => b.excludePath !== location.pathname);
        if (validBanners.length === 0) return;

        if (bannerIdRef.current === null) {
            const randomIndex = Math.floor(Math.random() * validBanners.length);
            const banner = validBanners[randomIndex];
            bannerIdRef.current = banner.id;
            setSelectedBanner(banner);
        } else {
            const existing = validBanners.find(b => b.id === bannerIdRef.current);
            if (existing) {
                setSelectedBanner(existing);
            } else {
                const randomIndex = Math.floor(Math.random() * validBanners.length);
                const banner = validBanners[randomIndex];
                bannerIdRef.current = banner.id;
                setSelectedBanner(banner);
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname, adCode, locale, propAffUrl, showCoupang, isVertical]);

    // 1. Render AdCode
    if (adCode) {
        return (
            <div
                id={id}
                className={`bg-gray-50 border border-gray-100 rounded-lg flex flex-col items-center justify-center overflow-hidden ${className || ''}`}
                style={{ width: width ? width : '100%', height: height ? height : 'auto' }}
            >
                <div dangerouslySetInnerHTML={{ __html: adCode }} />
            </div>
        );
    }

    // 2. Render Coupang Banner (Only if showCoupang is true, locale is 'ko', and not effective vertical side ad)
    if (showCoupang && locale === 'ko' && !isVertical) {
        return (
            <CoupangBanner
                width={coupangSize.width}
                height={coupangSize.height}
                className={className}
            />
        );
    }

    // 3. Render Affiliate Banner
    if (activeAffiliate) {
        const affUrl = activeAffiliate.url;
        const affImg = activeAffiliate.image;
        const affTitle = activeAffiliate.text && activeAffiliate.text[locale] ? activeAffiliate.text[locale] : activeAffiliate.text['en'] || '';
        const affDesc = activeAffiliate.desc && activeAffiliate.desc[locale] ? activeAffiliate.desc[locale] : activeAffiliate.desc['en'] || '';

        if (affImg) {
            return (
                <a
                    id={id}
                    href={affUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className={`block rounded-lg overflow-hidden relative ${className || ''}`}
                    style={{ width: width ? width : '100%', height: height ? height : 'auto' }}
                >
                    <img
                        src={affImg}
                        alt="Ad"
                        className="w-full h-full object-cover"
                        style={{ maxWidth: '100%', height: '100%' }}
                    />
                    <span className="absolute bottom-1 right-2 text-[10px] text-gray-400 bg-white/80 px-1 rounded shadow-sm">Ad</span>
                </a>
            );
        } else {
            return (
                <a
                    id={id}
                    href={affUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className={`rounded-lg flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity p-4 text-center text-white shadow-sm relative bg-gradient-to-r ${activeAffiliate.bgGradient} ${className || ''}`}
                    style={{ width: width ? width : '100%', height: height ? height : 'auto' }}
                >
                    <div className={`font-bold leading-tight ${isVertical ? 'text-sm mb-2' : 'text-lg mb-1'}`}>
                        {affTitle}
                    </div>
                    <div className={`${isVertical ? 'text-xs opacity-90' : 'text-sm opacity-95'}`}>
                        {affDesc}
                    </div>
                    <span className="absolute bottom-1 right-2 text-[10px] text-white/50">Ad</span>
                </a>
            );
        }
    }

    // 4. Render Self-Promotion Banner
    if (!selectedBanner) {
        return (
            <div
                id={id}
                className={`bg-gray-100 border border-gray-200 rounded-lg flex flex-col items-center justify-center overflow-hidden ${className || ''}`}
                style={{ width: width ? width : '100%', height: height ? height : 'auto' }}
            >
            </div>
        );
    }

    return (
        <div
            id={id}
            onClick={() => navigate(selectedBanner.link)}
            className={`rounded-lg flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity p-4 text-center text-white shadow-sm ${selectedBanner.bgClass} ${className || ''}`}
            style={{ width: width ? width : '100%', height: height ? height : 'auto' }}
        >
            <div className={`font-bold leading-tight ${isVertical ? 'text-sm mb-2' : 'text-lg mb-1'}`}>
                {t(selectedBanner.titleKey)}
            </div>
            <div className={`${isVertical ? 'text-xs opacity-90' : 'text-sm opacity-95'}`}>
                {t(selectedBanner.descKey)}
            </div>
        </div>
    );
};

export default AdPlaceholder;
