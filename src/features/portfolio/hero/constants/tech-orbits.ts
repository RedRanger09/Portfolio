export interface TechOrbConfig {
  label: string
  /** Simple Icons slug — resolved to a CDN URL via `getSimpleIconUrl`. */
  logo: string
  /** "r,g,b" — used as the orb's per-brand radial glow color. */
  glow: string
  /** Position as a percentage of the visual container. */
  x: number
  y: number
  /** Stagger offset (seconds) for the pulse animation. */
  delay: number
  size: number
  /** Cursor-parallax intensity — higher orbs drift further from the cursor. */
  parallax: number
}

/**
 * Decorative floating technology logos in the Hero visual — purely
 * presentational configuration, not editorial content, so it lives beside
 * the component that renders it rather than in `data.ts`.
 */
export const TECH_ORBS: TechOrbConfig[] = [
  { label: 'Python', logo: 'python', glow: '55,118,171', x: 12, y: 14, delay: 0, size: 30, parallax: 0.8 },
  { label: 'PyTorch', logo: 'pytorch', glow: '238,77,44', x: 78, y: 7, delay: 0.3, size: 26, parallax: 1.2 },
  { label: 'React', logo: 'react', glow: '97,218,251', x: 88, y: 50, delay: 0.7, size: 28, parallax: 0.9 },
  { label: 'TensorFlow', logo: 'tensorflow', glow: '255,111,0', x: 6, y: 68, delay: 1.1, size: 26, parallax: 1.0 },
  { label: 'Gemini', logo: 'googlegemini', glow: '66,133,244', x: 62, y: 82, delay: 0.5, size: 24, parallax: 1.3 },
  { label: 'GitHub', logo: 'github', glow: '210,210,220', x: 90, y: 24, delay: 0.9, size: 26, parallax: 0.7 },
  { label: 'TailwindCSS', logo: 'tailwindcss', glow: '6,182,212', x: 26, y: 88, delay: 1.3, size: 24, parallax: 1.1 },
  { label: 'VS Code', logo: 'visualstudiocode', glow: '0,122,204', x: 4, y: 38, delay: 0.1, size: 28, parallax: 0.6 },
]
