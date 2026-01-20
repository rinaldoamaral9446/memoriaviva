/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    gold: '#D4AF37',
                    purple: 'var(--color-primary)', // Dynamic Primary
                    cream: '#F5F5DC',
                    dark: '#1A1A1A',
                    light: '#FAFAFA',
                    // New Design System Colors
                    primary: 'var(--color-primary)',
                    'neutral-custom': '#64748b',
                    surface: '#f8fafc',
                    'success-al': '#10b981',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Merriweather', 'serif'],
                display: ['Merriweather', 'serif'], // For titles
            },
            borderRadius: {
                DEFAULT: '0.5rem',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                }
            }
        },
    },
    plugins: [],
}
