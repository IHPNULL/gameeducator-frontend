import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'

/**
 * GameEducator v1.95 - Sistema Operacional & Estação de Trabalho Utilitária
 * Paleta Hiper-realista dos Anos 90 (Win95 / OS Utilitário)
 */
const gameEducatorLight = {
  dark: false,
  colors: {
    primary: '#000080',
    'primary-darken-1': '#000050',
    secondary: '#808080',
    accent: '#5c7fb8',
    background: '#5c7fb8',
    surface: '#C0C0C0',
    'surface-variant': '#DFDFDF',
    'on-surface-variant': '#000000',
    'on-surface': '#000000',
    'on-background': '#FFFFFF',
    'on-primary': '#FFFFFF',
    success: '#008000',
    error: '#800000',
    warning: '#808000',
    info: '#5c7fb8',
  },
}

const gameEducatorDark = {
  dark: true,
  colors: {
    primary: '#00FF66',
    'primary-darken-1': '#009933',
    secondary: '#3E4743',
    accent: '#00FF66',
    background: '#111E1E',
    surface: '#2D3330',
    'surface-variant': '#3E4743',
    'on-surface-variant': '#00FF66',
    'on-surface': '#00FF66',
    'on-background': '#00FF66',
    'on-primary': '#000000',
    success: '#00FF66',
    error: '#FF4444',
    warning: '#FFAA00',
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
      gameEducator: gameEducatorLight,
    },
  },
  defaults: {
    VCard: { variant: 'flat', rounded: 0 },
    VBtn: { rounded: 0, elevation: 0, class: 'win-btn text-none' },
    VChip: { rounded: 0 },
    VTextField: { variant: 'outlined', density: 'compact', hideDetails: 'auto', rounded: 0 },
    VTextarea: { variant: 'outlined', density: 'compact', hideDetails: 'auto', rounded: 0 },
    VSelect: { variant: 'outlined', density: 'compact', hideDetails: 'auto', rounded: 0 },
    VAlert: { variant: 'flat', rounded: 0 },
  },
})
