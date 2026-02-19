import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../i18n';

interface PromoCardProps {
    to: string;
    icon: string;
    title: string;
    desc: string;
    buttonText: string;
    gradient: string;
}

const PromoCard = ({ to, icon, title, desc, buttonText, gradient }: PromoCardProps) => {
    return (
        <Link to={to} className="block w-full group">
            <div className={`bg-gradient-to-br ${gradient} rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 h-full min-h-[140px] flex flex-col justify-between`}>
                <div>
                    <div className="text-4xl mb-3 filter drop-shadow-sm">{icon}</div>
                    <h3 className="font-bold text-base mb-1 leading-tight">{title}</h3>
                    <p className="text-sm text-white/90 line-clamp-2 leading-snug">{desc}</p>
                </div>
                <div className="mt-3 text-right">
                    <span className="text-sm font-semibold bg-white/20 px-3 py-1.5 rounded-full group-hover:bg-white/30 transition-colors">
                        {buttonText} &rarr;
                    </span>
                </div>
            </div>
        </Link>
    );
};

interface PromoItem {
    icon: string;
    title: string;
    desc: string;
    path: string;
    gradient: string;
}

interface LocaleData {
    items: PromoItem[];
    buttonText: string;
}

const cardData: Record<string, LocaleData> = {
    ko: {
        items: [
            { icon: '\uD83D\uDDDC', title: '\uC774\uBBF8\uC9C0 \uC555\uCD95', desc: '\uC0AC\uC9C4 \uC6A9\uB7C9 \uC904\uC774\uAE30', path: '/compress', gradient: 'from-blue-500 to-blue-700' },
            { icon: '\uD83D\uDD04', title: '\uC774\uBBF8\uC9C0 \uBCC0\uD658', desc: '\uD3EC\uB9F7 \uC790\uC720\uB85C\uC6B4 \uBCC0\uD658', path: '/convert', gradient: 'from-green-500 to-green-700' },
            { icon: '\uD83D\uDD2D', title: '\uD06C\uAE30 \uC870\uC808', desc: '\uC6D0\uD558\uB294 \uD06C\uAE30\uB85C \uB9AC\uC0AC\uC774\uC988', path: '/resize', gradient: 'from-purple-500 to-purple-700' },
            { icon: '\uD83D\uDCF1', title: 'QR\uCF54\uB4DC \uC0DD\uC131', desc: 'QR\uCF54\uB4DC \uB9CC\uB4E4\uAE30', path: '/qr-code', gradient: 'from-orange-500 to-orange-700' },
            { icon: '\uD83D\uDCC4', title: 'PDF \uBCD1\uD569', desc: '\uC5EC\uB7EC PDF\uB97C \uD558\uB098\uB85C', path: '/pdf-merge', gradient: 'from-orange-500 to-red-500' },
            { icon: '📉', title: '이미지 압축', desc: '화질 유지하면서 용량 줄이기', path: '/compress', gradient: 'from-blue-500 to-blue-700' },
            { icon: '🔄', title: '포맷 변환', desc: 'HEIC 변환 완벽 지원', path: '/convert', gradient: 'from-green-500 to-green-700' },
            { icon: '📏', title: '리사이즈', desc: '원하는 크기로 조절', path: '/resize', gradient: 'from-indigo-500 to-indigo-700' },
            { icon: '📄', title: 'PDF 합치기', desc: '여러 PDF를 하나로', path: '/pdf-merge', gradient: 'from-red-500 to-red-700' },
            { icon: '✂️', title: '배경 제거', desc: 'AI 자동 누끼따기', path: '/remove-bg', gradient: 'from-pink-500 to-pink-700' },
            { icon: '🔐', title: '비밀번호 생성', desc: '강력한 암호 만들기', path: '/password-generator', gradient: 'from-teal-500 to-teal-700' },
            { icon: '🎬', title: 'Video to GIF', desc: '동영상을 GIF로 변환', path: '/video-to-gif', gradient: 'from-purple-500 to-purple-700' },
            { icon: '📝', title: 'OCR', desc: '이미지 텍스트 추출', path: '/ocr', gradient: 'from-amber-500 to-amber-700' },
            { icon: '💧', title: '워터마크', desc: '이미지에 워터마크 추가', path: '/watermark', gradient: 'from-cyan-500 to-cyan-700' },
        ],
        buttonText: '\uBC14\uB85C\uAC00\uAE30'
    },
    en: {
        items: [
            { icon: '\uD83D\uDDDC', title: 'Compress', desc: 'Reduce image size', path: '/compress', gradient: 'from-blue-500 to-blue-700' },
            { icon: '\uD83D\uDD04', title: 'Convert', desc: 'Change image format', path: '/convert', gradient: 'from-green-500 to-green-700' },
            { icon: '\uD83D\uDD2D', title: 'Resize', desc: 'Resize images', path: '/resize', gradient: 'from-purple-500 to-purple-700' },
            { icon: '\uD83D\uDCF1', title: 'QR Code', desc: 'Generate QR codes', path: '/qr-code', gradient: 'from-orange-500 to-orange-700' },
            { icon: '\uD83D\uDCC4', title: 'Merge PDF', desc: 'Combine PDFs', path: '/pdf-merge', gradient: 'from-orange-500 to-red-500' },
            { icon: '\u2702\uFE0F', title: 'Split PDF', desc: 'Extract pages', path: '/pdf-split', gradient: 'from-blue-500 to-indigo-500' },
            { icon: '\uD83D\uDCC9', title: 'Compress PDF', desc: 'Reduce size', path: '/pdf-compress', gradient: 'from-green-500 to-teal-500' },
            { icon: '\uD83D\uDDBC', title: 'Remove BG', desc: 'Transparent BG', path: '/remove-bg', gradient: 'from-purple-500 to-pink-500' },
            { icon: '\uD83D\uDD10', title: 'Password', desc: 'Strong passwords', path: '/password-generator', gradient: 'from-red-500 to-red-700' },
            { icon: '\uD83C\uDFAC', title: 'Video to GIF', desc: 'Convert to GIF', path: '/video-to-gif', gradient: 'from-pink-500 to-rose-700' },
            { icon: '📝', title: 'OCR', desc: 'Extract text from image', path: '/ocr', gradient: 'from-amber-500 to-amber-700' },
        ],
        buttonText: 'Go'
    },
    zh: {
        items: [
            { icon: '\uD83D\uDDDC', title: '\u56FE\u7247\u538B\u7F29', desc: '\u51CF\u5C0F\u56FE\u7247\u5927\u5C0F', path: '/compress', gradient: 'from-blue-500 to-blue-700' },
            { icon: '\uD83D\uDD04', title: '\u56FE\u7247\u8F6C\u6362', desc: '\u8F6C\u6362\u56FE\u7247\u683C\u5F0F', path: '/convert', gradient: 'from-green-500 to-green-700' },
            { icon: '\uD83D\uDD2D', title: '\u8C03\u6574\u5927\u5C0F', desc: '\u8C03\u6574\u56FE\u7247\u5C3A\u5BF8', path: '/resize', gradient: 'from-purple-500 to-purple-700' },
            { icon: '\uD83D\uDCF1', title: 'QR\u7801\u751F\u6210', desc: '\u521B\u5EFAQR\u7801', path: '/qr-code', gradient: 'from-orange-500 to-orange-700' },
            { icon: '\uD83D\uDCC4', title: '\u5408\u5E76PDF', desc: '\u5408\u5E76\u6587\u4EF6', path: '/pdf-merge', gradient: 'from-orange-500 to-red-500' },
            { icon: '\u2702\uFE0F', title: '\u62C6\u5206PDF', desc: '\u63D0\u53D6\u9875\u9762', path: '/pdf-split', gradient: 'from-blue-500 to-indigo-500' },
            { icon: '\uD83D\uDCC9', title: '\u538B\u7F29PDF', desc: '\u51CF\u5C0F\u5927\u5C0F', path: '/pdf-compress', gradient: 'from-green-500 to-teal-500' },
            { icon: '\uD83D\uDDBC', title: '\u53BB\u80CC\u666F', desc: '\u81EA\u52A8\u53BB\u80CC\u666F', path: '/remove-bg', gradient: 'from-purple-500 to-pink-500' },
            { icon: '\uD83D\uDD10', title: '\u5BC6\u7801\u751F\u6210', desc: '\u5F3A\u5BC6\u7801', path: '/password-generator', gradient: 'from-red-500 to-red-700' },
        ],
        buttonText: '\u524D\u5F80'
    },
    ja: {
        items: [
            { icon: '\uD83D\uDDDC', title: '\u753B\u50CF\u5727\u7E2E', desc: '\u30D5\u30A1\u30A4\u30EB\u30B5\u30A4\u30BA\u7E2E\u5C0F', path: '/compress', gradient: 'from-blue-500 to-blue-700' },
            { icon: '\uD83D\uDD04', title: '\u753B\u50CF\u5909\u63DB', desc: '\u30D5\u30A9\u30FC\u30DE\u30C3\u30C8\u5909\u63DB', path: '/convert', gradient: 'from-green-500 to-green-700' },
            { icon: '\uD83D\uDD2D', title: '\u30EA\u30B5\u30A4\u30BA', desc: '\u30B5\u30A4\u30BA\u8ABF\u6574', path: '/resize', gradient: 'from-purple-500 to-purple-700' },
            { icon: '\uD83D\uDCF1', title: 'QR\u30B3\u30FC\u30C9', desc: 'QR\u30B3\u30FC\u30C9\u751F\u6210', path: '/qr-code', gradient: 'from-orange-500 to-orange-700' },
            { icon: '\uD83D\uDCC4', title: 'PDF\u7D50\u5408', desc: '\u8907\u6570PDF\u3092\u7D50\u5408', path: '/pdf-merge', gradient: 'from-orange-500 to-red-500' },
            { icon: '\u2702\uFE0F', title: 'PDF\u5206\u5272', desc: '\u30DA\u30FC\u30B8\u62BD\u51FA', path: '/pdf-split', gradient: 'from-blue-500 to-indigo-500' },
            { icon: '\uD83D\uDCC9', title: 'PDF\u5727\u7E2E', desc: '\u30B5\u30A4\u30BA\u7E2E\u5C0F', path: '/pdf-compress', gradient: 'from-green-500 to-teal-500' },
            { icon: '\uD83D\uDDBC', title: '\u80CC\u666F\u9664\u53BB', desc: '\u81EA\u52D5\u80CC\u666F\u9664\u53BB', path: '/remove-bg', gradient: 'from-purple-500 to-pink-500' },
            { icon: '\uD83D\uDD10', title: '\u30D1\u30B9\u30EF\u30FC\u30C9', desc: '\u5F37\u529B\u30D1\u30B9\u30EF\u30FC\u30C9', path: '/password-generator', gradient: 'from-red-500 to-red-700' },
        ],
        buttonText: '\u79FB\u52D5'
    }
};

const SidePromo = () => {
    const { locale } = useTranslation();
    const location = useLocation();
    const currentPath = location.pathname;

    const data = cardData[locale] || cardData['en'];
    const filtered = data.items.filter(item => item.path !== currentPath);
    const displayed = filtered.slice(0, 3);

    return (
        <div className="space-y-4">
            {displayed.map((item, idx) => (
                <PromoCard
                    key={idx}
                    to={item.path}
                    icon={item.icon}
                    title={item.title}
                    desc={item.desc}
                    buttonText={data.buttonText}
                    gradient={item.gradient}
                />
            ))}
        </div>
    );
};

export default SidePromo;