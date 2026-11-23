// ─── Tempize Design System ───────────────────────────────────────────────────
// Charte graphique officielle v1

export const Colors = {
  // Palette signature
  prune: '#931269',
  framboise: '#C41236',
  rouge: '#E5211E',
  orange: '#FB7304',
  jaune: '#FDEE02',

  // Neutres chauds
  encre: '#241921',
  secondaire: '#796D75',
  ivoire: '#FAF7F4',
  contour: '#E9E1E5',

  // États
  confirme: '#25745C',
  confirmeBackground: '#E6F3EB',
  erreur: '#B72D38',

  // Surfaces (fond sombre)
  dark: {
    background: '#241921',
    surface: '#2E2129',
    surfaceRaised: '#38303A',
    border: '#3D3340',
  },

  // Surfaces (fond clair)
  light: {
    background: '#FAF7F4',
    surface: '#FFFFFF',
    border: '#E9E1E5',
  },

  white: '#FFFFFF',
  black: '#000000',
} as const;

export const Typography = {
  // Tailles définies par la charte
  screenTitle: 30,   // Titre écran
  cardTitle: 21,     // Titre carte
  action: 15,        // Boutons / actions
  body: 14,          // Texte courant
  meta: 11,          // Métadonnée

  // Graisses
  regular: '400' as const,
  medium: '500' as const,
  bold: '700' as const,

  // Famille
  fontFamily: 'Inter',
} as const;

export const Spacing = {
  // Grille 4/8 px
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 100,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#241921',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  subtle: {
    shadowColor: '#241921',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
} as const;

// Dégradé signature (de gauche à droite)
export const GradientColors = [
  Colors.prune,
  Colors.framboise,
  Colors.rouge,
  Colors.orange,
  Colors.jaune,
] as const;
