import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n';
import AdPlaceholder from '../components/AdPlaceholder';
import { generateQRCode } from '../utils/qrGenerate';
import { updateSEO } from '../utils/seo';

type QrType = 'url' | 'text' | 'phone' | 'email' | 'wifi';

const QrCodePage = () => {
    const { t, locale } = useTranslation();
    const [activeTab, setActiveTab] = useState<QrType>('url');
    // Removed unused qrValue
    const [generatedQr, setGeneratedQr] = useState<{ png: string, svg: string } | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Style Settings
    const [width, setWidth] = useState(300);
    const [colorDark, setColorDark] = useState('#000000');
    const [colorLight, setColorLight] = useState('#ffffff');

    // Input States
    const [inputUrl, setInputUrl] = useState('');
    const [inputText, setInputText] = useState('');
    const [inputPhone, setInputPhone] = useState('');
    const [inputEmail, setInputEmail] = useState('');
    const [wifiSsid, setWifiSsid] = useState('');
    const [wifiPassword, setWifiPassword] = useState('');
    const [wifiEncryption, setWifiEncryption] = useState('WPA');
    // Removed unused wifiHidden

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Update SEO
    updateSEO('qrCode', locale);

    // Construct QR Data based on type
    const constructQrData = () => {
        switch (activeTab) {
            case 'url':
                if (!inputUrl) return '';
                let url = inputUrl.trim();
                // Basic validation/fix
                if (!/^https?:\/\//i.test(url)) {
                    url = 'https://' + url;
                }
                return url;
            case 'text':
                return inputText;
            case 'phone':
                return inputPhone ? `tel:${inputPhone}` : '';
            case 'email':
                return inputEmail ? `mailto:${inputEmail}` : '';
            case 'wifi':
                if (!wifiSsid) return '';
                // Simple WIFI format: WIFI:T:WPA;S:mynetwork;P:mypass;;
                return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};;`;
            default:
                return '';
        }
    };

    const handleGenerate = async () => {
        const data = constructQrData();
        if (!data) {
            setGeneratedQr(null);
            return;
        }

        setIsGenerating(true);
        try {
            const result = await generateQRCode(data, {
                width: width,
                color: {
                    dark: colorDark,
                    light: colorLight
                }
            });
            setGeneratedQr({ png: result.pngDataUrl, svg: result.svgString });
        } catch (error) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Auto-generate on input change with debounce
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {
            handleGenerate();
        }, 300);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        inputUrl, inputText, inputPhone, inputEmail,
        wifiSsid, wifiPassword, wifiEncryption,
        width, colorDark, colorLight, activeTab
    ]);

    const handleDownload = (type: 'png' | 'svg') => {
        if (!generatedQr) return;

        const link = document.createElement('a');
        if (type === 'png') {
            link.href = generatedQr.png;
            link.download = 'tooktak-qrcode.png';
        } else {
            const blob = new Blob([generatedQr.svg], { type: 'image/svg+xml' });
            link.href = URL.createObjectURL(blob);
            link.download = 'tooktak-qrcode.svg';
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const TabButton = ({ type, label }: { type: QrType, label: string }) => (
        <button
            onClick={() => setActiveTab(type)}
            className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${activeTab === type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
        >
            {label}
        </button>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{t('qrCode.title')}</h1>
                <p className="text-gray-600">{t('qrCode.subtitle')}</p>
            </div>

            <div className="w-full mb-10">
                <AdPlaceholder id="ad-qrcode-top" showCoupang={true} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Settings */}
                <div className="space-y-6">
                    {/* Type Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">{t('qrCode.type')}</label>
                        <div className="flex flex-wrap gap-2">
                            <TabButton type="url" label={t('qrCode.typeUrl')} />
                            <TabButton type="text" label={t('qrCode.typeText')} />
                            <TabButton type="phone" label={t('qrCode.typePhone')} />
                            <TabButton type="email" label={t('qrCode.typeEmail')} />
                            <TabButton type="wifi" label={t('qrCode.typeWifi')} />
                        </div>
                    </div>

                    {/* Input Fields */}
                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <label className="text-sm font-semibold text-gray-700">{t('qrCode.inputLabel')}</label>

                        {activeTab === 'url' && (
                            <input
                                type="text"
                                value={inputUrl}
                                onChange={(e) => setInputUrl(e.target.value)}
                                placeholder={t('qrCode.urlPlaceholder')}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        )}

                        {activeTab === 'text' && (
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value.slice(0, 500))}
                                placeholder={t('qrCode.textPlaceholder')}
                                rows={4}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        )}
                        {activeTab === 'text' && (
                            <div className="text-right text-xs text-gray-400">
                                {inputText.length} / 500
                            </div>
                        )}

                        {activeTab === 'phone' && (
                            <input
                                type="tel"
                                value={inputPhone}
                                onChange={(e) => setInputPhone(e.target.value)}
                                placeholder={t('qrCode.phonePlaceholder')}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        )}

                        {activeTab === 'email' && (
                            <input
                                type="email"
                                value={inputEmail}
                                onChange={(e) => setInputEmail(e.target.value)}
                                placeholder={t('qrCode.emailPlaceholder')}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        )}

                        {activeTab === 'wifi' && (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={wifiSsid}
                                    onChange={(e) => setWifiSsid(e.target.value)}
                                    placeholder={t('qrCode.wifiSsid')}
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                />
                                <input
                                    type="password"
                                    value={wifiPassword}
                                    onChange={(e) => setWifiPassword(e.target.value)}
                                    placeholder={t('qrCode.wifiPassword')}
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                />
                                <select
                                    value={wifiEncryption}
                                    onChange={(e) => setWifiEncryption(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                >
                                    <option value="WPA">WPA/WPA2</option>
                                    <option value="WEP">WEP</option>
                                    <option value="nopass">None</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Style Settings */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700">{t('qrCode.style')}</h3>

                        {/* Size */}
                        <div className="flex gap-2">
                            <span className="text-sm text-gray-500 w-16 py-2">{t('qrCode.size')}</span>
                            {[200, 300, 400, 500].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setWidth(s)}
                                    className={`
                                            px-3 py-1 rounded text-sm transition-colors
                                            ${width === s ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}
                                        `}
                                >
                                    {s}px
                                </button>
                            ))}
                        </div>

                        {/* Colors */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500">{t('qrCode.fgColor')}</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={colorDark}
                                        onChange={(e) => setColorDark(e.target.value)}
                                        className="w-10 h-10 rounded cursor-pointer border-0"
                                    />
                                    <span className="text-sm font-mono text-gray-600">{colorDark}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500">{t('qrCode.bgColor')}</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={colorLight}
                                        onChange={(e) => setColorLight(e.target.value)}
                                        className="w-10 h-10 rounded cursor-pointer border-0"
                                    />
                                    <span className="text-sm font-mono text-gray-600">{colorLight}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Preview */}
                <div className="md:col-start-2">
                    <div className="sticky top-24 bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col items-center">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 self-start">{t('qrCode.preview')}</h3>

                        <div className="w-full flex items-center justify-center min-h-[300px] bg-gray-50 rounded-lg mb-6 border-2 border-dashed border-gray-200">
                            {isGenerating ? (
                                <div className="flex flex-col items-center text-gray-400 animate-pulse">
                                    <span className="text-4xl mb-2">⚡</span>
                                    <span>{t('qrCode.generating')}</span>
                                </div>
                            ) : generatedQr ? (
                                <img
                                    src={generatedQr.png}
                                    alt="QR Code"
                                    className="max-w-full h-auto shadow-sm rounded-lg border border-gray-200"
                                    style={{ maxWidth: '280px' }}
                                />
                            ) : (
                                <div className="text-center text-gray-400 p-4">
                                    <span className="text-4xl block mb-2">📱</span>
                                    {t('qrCode.inputPlaceholder')}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => handleDownload('png')}
                                disabled={!generatedQr}
                                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md font-medium"
                            >
                                {t('qrCode.downloadPng')}
                            </button>
                            <button
                                onClick={() => handleDownload('svg')}
                                disabled={!generatedQr}
                                className="flex-1 bg-gray-700 text-white py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md font-medium"
                            >
                                {t('qrCode.downloadSvg')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full mt-10">
                <AdPlaceholder id="ad-qrcode-bottom" showCoupang={true} />
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t('qrCode.faqTitle')}</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map(num => (
                        <div key={num}>
                            <h4 className="font-semibold text-gray-800 mb-1">Q. {t(`qrCode.faq${num}q`)}</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">{t(`qrCode.faq${num}a`)}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default QrCodePage;
