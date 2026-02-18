async function detectLanguageByCountry(): Promise<string> {
    try {
        // Primary Service: ipapi.co
        const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const countryCode = data.country_code; // "KR", "JP", "CN", "US" etc.

        const countryToLang: Record<string, string> = {
            KR: 'ko',
            JP: 'ja',
            CN: 'zh',
            TW: 'zh',
            HK: 'zh',
            MO: 'zh',
        };

        return countryToLang[countryCode] || 'en';
    } catch (error) {
        console.warn('Primary IP detection failed, trying backup...', error);
        try {
            // Backup Service: ip-api.com
            const response = await fetch('http://ip-api.com/json/?fields=countryCode', { signal: AbortSignal.timeout(3000) });
            if (!response.ok) throw new Error('Backup network response was not ok');
            const data = await response.json();
            const countryCode = data.countryCode;

            const countryToLang: Record<string, string> = {
                KR: 'ko',
                JP: 'ja',
                CN: 'zh',
                TW: 'zh',
                HK: 'zh',
                MO: 'zh',
            };
            return countryToLang[countryCode] || 'en';
        } catch (backupError) {
            console.warn('All IP detection failed, falling back to browser language.', backupError);
            // Fallback to browser language
            const browserLang = navigator.language.slice(0, 2);
            const langMap: Record<string, string> = { ko: 'ko', ja: 'ja', zh: 'zh' };
            return langMap[browserLang] || 'en';
        }
    }
}

export default detectLanguageByCountry;
