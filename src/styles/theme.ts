/** DS token values mirrored for JS usage (see src/styles/tokens/colors.css) */
export const theme = {
  colors: {
    canvas: '#212121',
    surface: '#2C2C2C',
    raised: '#383838',
    primary: '#F44336',
    success: '#4CAF50',
    warning: '#FFC107',
    danger: '#F44336',
    text: '#FFFFFF',
    muted: '#B4B4B4',
    faint: '#7E7E7E',
    rooms: {
      hq: '#9E9E9E',
      vaccine: '#4DA6D6',
      food: '#7CB342',
      power: '#FFD54F',
      water: '#29B6F6',
      firstAid: '#EF5350',
      recycling: '#558B2F',
      cargo: '#FF9800',
    },
    plane: '#AB47BC',
    active: '#FFD54F',
    highlight: '#4CAF50',
  },
  fonts: {
    display: '"Archivo", sans-serif',
    body: '"Public Sans", sans-serif',
    mono: '"Space Mono", monospace',
  },
} as const
