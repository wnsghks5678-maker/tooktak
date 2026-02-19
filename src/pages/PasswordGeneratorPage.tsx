import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from '../i18n';
import AdPlaceholder from '../components/AdPlaceholder';
import { updateSEO } from '../utils/seo';

const PasswordGeneratorPage = () => {
    const { t, locale } = useTranslation();
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true
    });
    const [strength, setStrength] = useState<'weak' | 'fair' | 'strong' | 'veryStrong'>('fair');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        updateSEO('passwordGen', locale);
    }, [locale]);

    useEffect(() => {
        generatePassword();
    }, [length, options]);

    const generatePassword = () => {
        const charset: Record<string, string> = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+~|}{[]:;?><,./-='
        };

        let chars = '';
        if (options.uppercase) chars += charset.uppercase;
        if (options.lowercase) chars += charset.lowercase;
        if (options.numbers) chars += charset.numbers;
        if (options.symbols) chars += charset.symbols;

        if (chars === '') { setPassword(''); return; }

        let newPassword = '';
        const array = new Uint32Array(length);
        crypto.getRandomValues(array);
        for (let i = 0; i < length; i++) {
            newPassword += chars[array[i] % chars.length];
        }
        setPassword(newPassword);
        calculateStrength(newPassword);
    };

    const calculateStrength = (pass: string) => {
        let score = 0;
        if (pass.length >= 8) score++;
        if (pass.length >= 12) score++;
        if (pass.length >= 16) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[a-z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        if (score < 3) setStrength('weak');
        else if (score < 5) setStrength('fair');
        else if (score < 7) setStrength('strong');
        else setStrength('veryStrong');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleOption = (key: keyof typeof options) => {
        const activeCount = Object.values(options).filter(Boolean).length;
        if (activeCount === 1 && options[key]) return;
        setOptions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const getStrengthColor = () => {
        switch (strength) {
            case 'weak': return 'bg-red-500';
            case 'fair': return 'bg-yellow-500';
            case 'strong': return 'bg-green-500';
            case 'veryStrong': return 'bg-blue-500';
            default: return 'bg-gray-200';
        }
    };

    const sliderPercent = ((length - 8) / (64 - 8)) * 100;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Helmet>
                <title>{locale === 'ko' ? '\uBB34\uB8CC \uBE44\uBC00\uBC88\uD638 \uC0DD\uC131\uAE30 - \uAC15\uB825\uD55C \uB79C\uB364 \uBE44\uBC00\uBC88\uD638 | \uB69D\uB531' : 'Free Password Generator - Strong Random Passwords | TookTak'}</title>
                <meta name="description" content={locale === 'ko' ? '\uAC15\uB825\uD558\uACE0 \uC548\uC804\uD55C \uB79C\uB364 \uBE44\uBC00\uBC88\uD638\uB97C \uBB34\uB8CC\uB85C \uC0DD\uC131\uD558\uC138\uC694. \uB300\uBB38\uC790, \uC18C\uBB38\uC790, \uC22B\uC790, \uD2B9\uC218\uBB38\uC790 \uC870\uD569. \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uCC98\uB9AC, \uC11C\uBC84 \uC800\uC7A5 \uC5C6\uC74C.' : 'Generate strong, secure random passwords for free. Browser-based, nothing stored on servers.'} />
                <meta property="og:url" content="https://tooktak.pages.dev/password-generator" />
                <link rel="canonical" href="https://tooktak.pages.dev/password-generator" />
            </Helmet>

            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{t('passwordGen.title')}</h1>
                <p className="text-gray-600">{t('passwordGen.subtitle')}</p>
            </div>

            <div className="w-full mb-10">
                <AdPlaceholder id="ad-passwordgen-top" showCoupang={true} />
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100 mb-8">
                <div className="relative mb-8">
                    <div className="bg-gray-100 rounded-xl p-6 text-center break-all font-mono text-2xl md:text-3xl font-bold text-gray-800 tracking-wider">
                        {password}
                    </div>
                    <button
                        onClick={handleCopy}
                        className="absolute top-1/2 -translate-y-1/2 right-4 p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-gray-600 hover:text-blue-600 active:scale-95"
                        title={t('passwordGen.copy')}
                    >
                        {copied ? (
                            <span className="flex items-center gap-1 text-green-600 text-sm font-bold">{t('passwordGen.copied')}</span>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        )}
                    </button>
                </div>

                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-600">{t('passwordGen.strength')}</span>
                        <span className={`text-sm font-bold px-2 py-0.5 rounded ${getStrengthColor()} text-white`}>
                            {t(`passwordGen.${strength}`)}
                        </span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                            style={{ width: strength === 'weak' ? '25%' : strength === 'fair' ? '50%' : strength === 'strong' ? '75%' : '100%' }} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="font-semibold text-gray-700">{t('passwordGen.length')}</label>
                            <span className="bg-blue-100 text-blue-700 font-mono font-bold px-3 py-1 rounded-lg">{length}</span>
                        </div>
                        <div className="relative w-full h-8 flex items-center">
                            <div className="absolute w-full h-2 bg-gray-200 rounded-full" />
                            <div className="absolute h-2 bg-blue-500 rounded-full" style={{ width: `${sliderPercent}%` }} />
                            <input
                                type="range" min="8" max="64" value={length}
                                onChange={(e) => setLength(Number(e.target.value))}
                                className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer z-10
                                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                                    [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md
                                    [&::-webkit-slider-thumb]:hover:bg-blue-700 [&::-webkit-slider-thumb]:active:scale-110
                                    [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6
                                    [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0
                                    [&::-moz-range-thumb]:shadow-md"
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>8</span>
                            <span>20</span>
                            <span>36</span>
                            <span>50</span>
                            <span>64</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(options).map(([key, value]) => (
                            <button key={key} onClick={() => toggleOption(key as keyof typeof options)}
                                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${value ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}>
                                <span className="font-medium text-sm">{t(`passwordGen.${key}`)}</span>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${value ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`}>
                                    {value && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-8">
                    <button onClick={generatePassword}
                        className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 shadow-lg hover:shadow-blue-200 transition-all active:scale-[0.99] flex items-center justify-center gap-2">
                        {t('passwordGen.regenerate')}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t('passwordGen.faqTitle')}</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map(num => (
                        <div key={num}>
                            <h4 className="font-semibold text-gray-800 mb-1">Q. {t(`passwordGen.faq${num}q`)}</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">{t(`passwordGen.faq${num}a`)}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 mt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-3">{locale === 'ko' ? '\uC548\uC804\uD55C \uBE44\uBC00\uBC88\uD638\uB780?' : 'What is a Secure Password?'}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {locale === 'ko'
                        ? '\uC548\uC804\uD55C \uBE44\uBC00\uBC88\uD638\uB294 \uCD5C\uC18C 12\uC790 \uC774\uC0C1\uC774\uBA70 \uB300\uBB38\uC790, \uC18C\uBB38\uC790, \uC22B\uC790, \uD2B9\uC218\uBB38\uC790\uB97C \uBAA8\uB450 \uD3EC\uD568\uD558\uB294 \uBE44\uBC00\uBC88\uD638\uC785\uB2C8\uB2E4. \uB69D\uB531\uC758 \uBE44\uBC00\uBC88\uD638 \uC0DD\uC131\uAE30\uB294 \uC554\uD638\uD559\uC801\uC73C\uB85C \uC548\uC804\uD55C \uB09C\uC218 \uC0DD\uC131\uAE30(crypto.getRandomValues)\uB97C \uC0AC\uC6A9\uD558\uC5EC \uC608\uCE21 \uBD88\uAC00\uB2A5\uD55C \uBE44\uBC00\uBC88\uD638\uB97C \uB9CC\uB4ED\uB2C8\uB2E4. \uC0DD\uC131\uB41C \uBE44\uBC00\uBC88\uD638\uB294 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C\uB9CC \uCC98\uB9AC\uB418\uBA70 \uC11C\uBC84\uC5D0 \uC800\uC7A5\uB418\uAC70\uB098 \uC804\uC1A1\uB418\uC9C0 \uC54A\uC544 \uAC1C\uC778\uC815\uBCF4\uC640 \uD504\uB77C\uC774\uBC84\uC2DC\uAC00 \uBCF4\uC7A5\uB429\uB2C8\uB2E4.'
                        : 'A secure password is at least 12 characters long and includes uppercase, lowercase, numbers, and symbols. TookTak uses crypto.getRandomValues to create unpredictable passwords. Generated passwords are processed only in your browser and never stored on any server.'}
                </p>
            </div>

            <div className="w-full mt-10">
                <AdPlaceholder id="ad-passwordgen-bottom" showCoupang={true} />
            </div>
        </div>
    );
};

export default PasswordGeneratorPage;