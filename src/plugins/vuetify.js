import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'

/**
 * GameEducator 2026 Modern Design System:
 * Paleta refinada com suporte a Light e Dark mode, bordas sutis, tipografia limpa
 * e toques de gamificacao em esmeralda, indigo e dourado.
 */
const gameEducatorLight = {
  dark: false,
  colors: {
    primary: '#059669',
    'primary-darken-1': '#047857',
    secondary: '#10B981',
    accent: '#6366F1',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    'surface-variant': '#ECFDF5',
    'on-surface-variant': '#065F46',
    'on-surface': '#0F172A',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#0EA5E9',
  },
}

const gameEducatorDark = {
  dark: true,
  colors: {
    primary: '#10B981',
    'primary-darken-1': '#059669',
    secondary: '#34D399',
    accent: '#818CF8',
    background: '#090D16',
    surface: '#111827',
    'surface-variant': '#1F2937',
    'on-surface-variant': '#E5E7EB',
    'on-surface': '#F9FAFB',
    success: '#10B981',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#38BDF8',
  },
}

export default createVuetify({
  display: { mobileBreakpoint: 'md' },
  theme: {
    defaultTheme: 'gameEducatorLight',
    themes: {
      gameEducatorLight,
      gameEducatorDark,
      // Alias retrocompativel com os testes que checam gameEducator
      gameEducator: gameEducatorLight,
    },
  },
  defaults: {
    VCard: { variant: 'flat', rounded: 'xl', border: true },
    VBtn: { color: 'primary', rounded: 'lg', class: 'text-none font-weight-medium' },
    VChip: { rounded: 'pill' },
    VTextField: { variant: 'outlined', density: 'comfortable', hideDetails: 'auto', rounded: 'lg' },
    VTextarea: { variant: 'outlined', density: 'comfortable', hideDetails: 'auto', rounded: 'lg' },
    VSelect: { variant: 'outlined', density: 'comfortable', hideDetails: 'auto', rounded: 'lg' },
    VAlert: { variant: 'tonal', rounded: 'xl' },
  },
})
