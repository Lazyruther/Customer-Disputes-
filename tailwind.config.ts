import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5fbff',
          100: '#e0f2ff',
          200: '#b9e2ff',
          300: '#7bc7ff',
          400: '#369eff',
          500: '#0c75ff',
          600: '#0058db',
          700: '#0046b1',
          800: '#003a8a',
          900: '#032f69'
        }
      }
    }
  },
  plugins: []
};

export default config;
