/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#2563EB',
                dark: '#1E3A5F',
                background: '#FFFFFF',
                gray: '#F8FAFC',
                success: '#10B981',
                text: '#334155',
            },
            fontFamily: {
                sans: ['"Noto Sans KR"', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
