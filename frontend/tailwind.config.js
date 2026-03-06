/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                black: {
                    900: '#111111',
                    800: '#222222',
                    700: '#333333',
                },
                gray: {
                    100: '#f5f5f5',
                    200: '#eeeeee',
                    300: '#e0e0e0',
                    400: '#bdbdbd',
                    500: '#9e9e9e',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
                'sidebar': '280px',
            },
            transitionTimingFunction: {
                'slow-zoom': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
            }
        },
    },
    plugins: [],
}
