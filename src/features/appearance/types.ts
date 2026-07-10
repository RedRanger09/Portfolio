export type AppearanceTheme = 'dark' | 'light' | 'system'
export type AppearanceFontFamily = 'sans' | 'serif' | 'mono'
export type AppearanceFontSize = 'sm' | 'md' | 'lg' | 'xl'
export type AppearanceLetterSpacing = 'tight' | 'normal' | 'wide'
export type AppearanceLineHeight = 'compact' | 'normal' | 'relaxed'

export interface AppearancePreferences {
  theme: AppearanceTheme
  fontFamily: AppearanceFontFamily
  fontSize: AppearanceFontSize
  letterSpacing: AppearanceLetterSpacing
  lineHeight: AppearanceLineHeight
}

export const DEFAULT_APPEARANCE: AppearancePreferences = {
  theme: 'dark',
  fontFamily: 'sans',
  fontSize: 'md',
  letterSpacing: 'normal',
  lineHeight: 'normal',
}

export const APPEARANCE_STORAGE_KEY = 'portfolio-appearance'

export const FONT_SIZE_SCALE: Record<AppearanceFontSize, string> = {
  sm: '0.925',
  md: '1',
  lg: '1.075',
  xl: '1.15',
}

export const LETTER_SPACING_VALUE: Record<AppearanceLetterSpacing, string> = {
  tight: '-0.02em',
  normal: '0em',
  wide: '0.03em',
}

export const LINE_HEIGHT_VALUE: Record<AppearanceLineHeight, string> = {
  compact: '1.45',
  normal: '1.6',
  relaxed: '1.8',
}
