/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff8243',
          hover: '#ff6b20',
          glow: 'rgba(255,130,67,0.4)',
          light: '#ffA070',
        },
        secondary: {
          DEFAULT: '#ffc0cb',
          hover: '#ffaab8',
          glow: 'rgba(255,192,203,0.3)',
        },
        background: {
          DEFAULT: '#060a14',
          alt: '#0c1020',
        },
        accent: {
          DEFAULT: '#609494',
          hover: '#4d7a7a',
          light: '#7db8b8',
        },
        punch: {
          yellow: '#fce883',
          orange: '#ff8243',
          pink: '#ffc0cb',
          teal: '#609494',
        },
        neon: {
          blue: '#00d4ff',
          purple: '#a855f7',
          green: '#22d3ee',
        },
        'level-up': '#fce883',
        'coin-gold': '#fce883',
        'streak-fire': '#ff6b35',
        'xp-orange': '#ff8243',
        'mission-blue': '#00d4ff',
        cyber: {
          dark: '#0c1020',
          darker: '#060a14',
          card: 'rgba(12,16,32,0.7)',
        },
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        orbitron: ['Orbitron', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse-slow 3s infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'code-scroll': 'code-scroll 20s linear infinite',
        'coin-spin': 'coin-spin 2s linear infinite',
        'streak-pulse': 'streak-pulse 1.5s ease-in-out infinite',
        'speed-line': 'speed-lines 1.5s linear infinite',
        'scan-line': 'scan-line 3s linear infinite',
        'gradient': 'gradient-shift 4s ease infinite',
        'holographic': 'holographic-shimmer 5s linear infinite',
        'glow-ring': 'glow-ring 2s ease-in-out infinite',
        'border-glow': 'border-glow 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'float': {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255,130,67,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(255,130,67,0.4)' },
        },
        'code-scroll': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        'coin-spin': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        'streak-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient': 'radial-gradient(ellipse at 20% 0%, #1a0e10 0%, #0a0e1a 40%, #060810 100%)',
      },
      boxShadow: {
        'neon-orange': '0 0 20px rgba(255,130,67,0.3), 0 0 40px rgba(255,130,67,0.15)',
        'neon-yellow': '0 0 20px rgba(252,232,131,0.3), 0 0 40px rgba(252,232,131,0.15)',
        'neon-teal': '0 0 20px rgba(96,148,148,0.3), 0 0 40px rgba(96,148,148,0.15)',
        'neon-pink': '0 0 20px rgba(255,192,203,0.3), 0 0 40px rgba(255,192,203,0.15)',
        'neon-blue': '0 0 20px rgba(0,212,255,0.3), 0 0 40px rgba(0,212,255,0.15)',
      },
    },
  },
  plugins: [],
}
