import { useEffect, useRef } from 'react';

const AdsterraSocialBar = () => {
    const scriptLoaded = useRef(false);

    useEffect(() => {
        if (scriptLoaded.current) return;

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//pl28740492.effectivegatecpm.com/c5/cf/01/c5cf01ea174cbcfc7a3e1169223164ba.js';
        script.async = true;

        document.body.appendChild(script);
        scriptLoaded.current = true;

        return () => {
            // Usually we don't remove social bar script as it might be needed for navigation between routes
            // but if rigorous cleanup is needed:
            // if (document.body.contains(script)) {
            //    document.body.removeChild(script);
            // }
        };
    }, []);

    return null; // This component doesn't render anything visual itself
};

export default AdsterraSocialBar;
