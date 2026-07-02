/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  safelist: [
    'bg-spring-pink',
    'bg-spring-mint',
    'bg-spring-sky',
    'bg-spring-lemon',
  ],
  theme: {
    extend: {
      colors: {
        // BTS RE:TURN PH palette — BTS purple + bright spring accents
        purple: {
          DEFAULT: '#7B4FE0',
          light: '#9E7BF0',
          dark: '#5A34B0',
        },
        spring: {
          pink: '#FF9EC4',
          mint: '#8FE3C6',
          sky: '#8FC7FF',
          lemon: '#FFE49E',
        },
        ink: '#1B1440',
        // BTS in the City: Manila — brand kit palette (concert section only)
        city: {
          crimson: '#EC1E50',
          orange: '#F07E27',
          yellow: '#FBC01E',
          cream: '#FBF4DA',
          sky: '#1CA9DD',
          ink: '#141414',
        },
      },
      fontFamily: {
        display: ['"Poppins"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Manila brand: Anton (heavy condensed display, matches the logo) + Barlow body
        manila: ['"Anton"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'manila-body': ['"Barlow"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(135deg, #7B4FE0 0%, #9E7BF0 40%, #8FC7FF 100%)',
      },
    },
  },
  plugins: [],
}
