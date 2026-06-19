/** DS token values mirrored for JS usage (see src/styles/tokens/colors.css) */
export const theme = {
  colors: {
    canvas: '#1A1F2A',
    surface: '#2A3340',
    raised: '#3A4455',
    primary: '#DC2626',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#DC2626',
    text: '#FFFFFF',
    muted: '#C5D0DF',
    faint: '#9DAAB8',
    rooms: {
      hq: '#A1A5AA',
      vaccine: '#3B82F6',
      food: '#10B981',
      power: '#D4AF37',
      water: '#0EA5E9',
      firstAid: '#DC2626',
      recycling: '#059669',
      cargo: '#F97316',
    },
    plane: '#8B5CF6',
    active: '#D4AF37',
    highlight: '#10B981',
  },
  fonts: {
    display: '"Archivo", sans-serif',
    body: '"Public Sans", sans-serif',
    mono: '"Space Mono", monospace',
  },
} as const
