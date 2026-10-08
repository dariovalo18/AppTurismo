export const darkColors = {
  background: '#161826',
  surface: '#232532',
  text: '#e9e9ed',
  accent: '#9184d9',
  accentMuted: '#a7a1db',
  muted: '#9397ab',
  border: '#3f424d',
  onAccent: '#161826',
}

export type Palette = typeof darkColors

export const lightColors: Palette = {
  background: '#f4f5f8',
  surface: '#ffffff',
  text: '#161826',
  accent: '#6d5ec4',
  accentMuted: '#7d74b8',
  muted: '#5c6070',
  border: '#d8dbe3',
  onAccent: '#ffffff',
}

export const colors = darkColors

export const palettes = {
  light: lightColors,
  dark: darkColors,
}
