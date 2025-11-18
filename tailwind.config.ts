import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './emails/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        scout: {
          50: '#fef3e2',
          100: '#fde4b8',
          200: '#fbd389',
          300: '#f9c259',
          400: '#f8b535',
          500: '#f7a910',
          600: '#f69d0e',
          700: '#f48d0b',
          800: '#f27e09',
          900: '#ef6105',
        },
      },
    },
  },
  plugins: [],
}
export default config
