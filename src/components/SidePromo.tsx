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

// Hardcoded data for SidePromo
const cardData = {
    ko: {
        items: [
            { icon: '🗜️', title: '이미지 압축', desc: '사진 용량 줄이기', path: '/compress', gradient: 'from-blue-500 to-blue-700' },
            { icon: '🔄', title: '이미지 변환', desc: '포맷 자유롭게 변환', path: '/convert', gradient: 'from-green-500 to-green-700' },
            { icon: '📐', title: '크기 조절', desc: '원하는 크기로 리사이즈', path: '/resize', gradient: 'from-purple-500 to-purple-700' },
            { icon: '📱', title: 'QR코드 생성', desc: 'QR코드 만들기', path: '/qr-code', gradient: 'from-orange-500 to-orange-700' },
        ],
        buttonText: '바로가기'
    },
    en: {
        items: [
            { icon: '🗜️', title: 'Compress', desc: 'Reduce image size', path: '/compress', gradient: 'from-blue-500 to-blue-700' },
            { icon: '🔄', title: 'Convert', desc: 'Change image format', path: '/convert', gradient: 'from-green-500 to-green-700' },
            { icon: '📐', title: 'Resize', desc: 'Resize images', path: '/resize', gradient: 'from-purple-500 to-purple-700' },
            { icon: '📱', title: 'QR Code', desc: 'Generate QR codes', path: '/qr-code', gradient: 'from-orange-500 to-orange-700' },
        ],
        buttonText: 'Go'
    },
    zh: {
        items: [
            { icon: '🗜️', title: '图片压缩', desc: '缩小图片大小', path: '/compress', gradient: 'from-blue-500 to-blue-700' },
            { icon: '🔄', title: '图片转换', desc: '转换图片格式', path: '/convert', gradient: 'from-green-500 to-green-700' },
            { icon: '📐', title: '调整大小', desc: '调整图片尺寸', path: '/resize', gradient: 'from-purple-500 to-purple-700' },
            { icon: '📱', title: 'QR生成器', desc: '创建QR码', path: '/qr-code', gradient: 'from-orange-500 to-orange-700' },
        ],
        buttonText: '前往'
    },
    ja: {
        items: [
            { icon: '🗜️', title: '画像圧縮', desc: '画像サイズを縮小', path: '/compress', gradient: 'from-blue-500 to-blue-700' },
            { icon: '🔄', title: '画像変換', desc: 'フォーマットを変換', path: '/convert', gradient: 'from-green-500 to-green-700' },
            { icon: '📐', title: 'サイズ変更', desc: '画像サイズ変更', path: '/resize', gradient: 'from-purple-500 to-purple-700' },
            { icon: '📱', title: 'QRコード', desc: 'QRコード作成', path: '/qr-code', gradient: 'from-orange-500 to-orange-700' },
        ],
        buttonText: '詳細'
    }
};

const SidePromo = () => {
    const { locale } = useTranslation();
    const location = useLocation();

    // Fallback to English if locale not found
    const currentData = cardData[locale as keyof typeof cardData] || cardData.en;
    const items = currentData.items;
    const buttonText = currentData.buttonText;

    return (
        <div className="flex flex-col gap-3 w-full">
            {items.map((item) => {
                // Filter out current page
                if (location.pathname === item.path) return null;

                return (
                    <PromoCard
                        key={item.path}
                        to={item.path}
                        icon={item.icon}
                        title={item.title}
                        desc={item.desc}
                        buttonText={buttonText}
                        gradient={item.gradient}
                    />
                );
            })}
        </div>
    );
};

export default SidePromo;
