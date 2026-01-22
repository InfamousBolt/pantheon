/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#000000',
          card: '#0a0a0a',
          sidebar: '#0a0a0a',
          input: '#0f0f0f',
        },
        foreground: {
          DEFAULT: '#ffffff',
          muted: '#888888',
        },
        accent: {
          DEFAULT: '#d4486a',
          hover: '#e05a7c',
          light: '#f8e8ec',
        },
        thinking: {
          bg: '#1a0a10',
          border: '#d4486a',
        },
        source: {
          bg: '#1a0a10',
          border: '#d4486a',
        },
        border: {
          DEFAULT: '#222222',
          hover: '#d4486a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        typing: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        typing: 'typing 1s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
