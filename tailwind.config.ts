import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#09090B',
        surface: '#18181B',
        primary: {
          DEFAULT: '#6366F1',
          hover: '#5558E3',
        },
        secondary: {
          DEFAULT: '#8B5CF6',
          hover: '#7C4FE0',
        },
        accent: {
          DEFAULT: '#22D3EE',
          hover: '#06B6D4',
        },
        section: {
          purple: '#A855F7',
          emerald: '#34D399',
          cyan: '#22D3EE',
          amber: '#FBBF24',
          pink: '#F472B6',
        },
      },
      boxShadow: {
        glow: '0 25px 80px rgba(99, 102, 241, 0.22)',
        'glow-accent': '0 0 30px rgba(34, 211, 238, 0.12)',
        card: '0 20px 60px rgba(0, 0, 0, 0.35)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        'gradient-cta': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        'gradient-cta-hover': 'linear-gradient(135deg, #5558E3 0%, #7C4FE0 100%)',
        'gradient-highlight': 'linear-gradient(135deg, rgba(99, 102, 241, 0.14) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(34, 211, 238, 0.08) 100%)',
        'gradient-hero': 'radial-gradient(circle at top left, rgba(99, 102, 241, 0.22), transparent 40%), radial-gradient(circle at bottom right, rgba(139, 92, 246, 0.16), transparent 35%)',
      },
    },
  },
  plugins: [],
}

export default config
