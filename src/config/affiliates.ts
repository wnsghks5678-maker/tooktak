export interface AffiliateConfig {
    id: string;
    name: string;
    url: string;
    image?: string;
    text: {
        ko: string;
        en: string;
        zh: string;
        ja: string;
        [key: string]: string;
    };
    desc: {
        ko: string;
        en: string;
        zh: string;
        ja: string;
        [key: string]: string;
    };
    bgGradient: string;
    targetLocales: string[];
}

export const affiliates: AffiliateConfig[] = [
    {
        id: 'coupang',
        name: '쿠팡',
        url: '', // Insert Coupang Partners link here
        image: '', // Insert Banner Image URL here
        text: {
            ko: '🛒 오늘의 쿠팡 특가!',
            en: '🛒 Coupang Deals!',
            zh: '🛒 酷澎特价！',
            ja: '🛒 クーパンセール！'
        },
        desc: {
            ko: '최대 70% 할인 상품을 확인하세요 →',
            en: 'Up to 70% off →',
            zh: '最高7折优惠 →',
            ja: '最大70%オフ →'
        },
        bgGradient: 'from-red-500 to-rose-600',
        targetLocales: ['ko']
    },
    {
        id: 'ali',
        name: 'AliExpress',
        url: '', // Insert AliExpress Affiliate link here
        image: '',
        text: {
            ko: '🎁 알리익스프레스 초특가',
            en: '🎁 AliExpress Super Deals',
            zh: '🎁 速卖通超值优惠',
            ja: '🎁 AliExpress スーパーセール'
        },
        desc: {
            ko: '전 세계 최저가 상품 모음 →',
            en: 'Lowest prices worldwide →',
            zh: '全球最低价 →',
            ja: '世界最安値 →'
        },
        bgGradient: 'from-orange-500 to-red-500',
        targetLocales: ['ko', 'en', 'zh', 'ja']
    },
    {
        id: 'temu',
        name: 'Temu',
        url: '', // Insert Temu Affiliate link here
        image: '',
        text: {
            ko: '🏷️ 테무에서 쇼핑하세요',
            en: '🏷️ Shop like a billionaire',
            zh: '🏷️ 拼多多跨境购物',
            ja: '🏷️ Temuでお買い物'
        },
        desc: {
            ko: '파격 할인 + 무료배송 →',
            en: 'Crazy deals + Free shipping →',
            zh: '疯狂折扣 + 免费配送 →',
            ja: '驚きの割引 + 送料無料 →'
        },
        bgGradient: 'from-orange-400 to-yellow-500',
        targetLocales: ['ko', 'en', 'zh', 'ja']
    }
];

export function getAffiliateForLocale(locale: string): AffiliateConfig | null {
    // Filter affiliates that target this locale and have a URL set
    const available = affiliates.filter(a =>
        (a.targetLocales.includes(locale) || a.targetLocales.includes('all')) &&
        (a.url && a.url.trim() !== '')
    );

    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
}

export default affiliates;
