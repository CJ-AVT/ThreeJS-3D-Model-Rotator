import { type Config } from 'tailwindcss'
import appConfig from './public/app-config/appConfig.json'

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        'slide-in-left': {
          '0%': { transform: 'translateX(-100vw)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'slide-in-left': 'slide-in-left 0.5s ease-out forwards',
      },
      fontFamily: {
        'news-gothic-condensed-bold': ['"News Gothic Condensed Bold"', 'sans-serif'],
        'inter': ['"Inter"', 'sans-serif']
      },
    },
  },
  plugins: [],
} satisfies Config