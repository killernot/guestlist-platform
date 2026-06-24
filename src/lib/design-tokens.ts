/* ============================================================
   GUESTLIST PLATFORM — Design Tokens (TypeScript)
   Source: design-system/SPEC.md
   Use these constants in JS/TS logic (e.g. date formatting, status maps)
   ============================================================ */

// ---- Colors ----
export const colors = {
  bg: {
    base: '#0A0A0F',
    surface: '#12121A',
    elevated: '#1A1A26',
    overlay: 'rgba(0, 0, 0, 0.8)',
  },
  neon: {
    orange: '#E87A24',
    gold: '#F5C542',
    purple: '#A855F7',
    pink: '#EC4899',
    blue: '#3B82F6',
    green: '#22C55E',
    amber: '#F59E0B',
    red: '#EF4444',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0B0',
    tertiary: '#5A5A6E',
    inverse: '#0A0A0F',
  },
  border: {
    default: 'rgba(255, 255, 255, 0.08)',
    hover: 'rgba(255, 255, 255, 0.16)',
    focus: '#A855F7',
    success: '#22C55E',
  },
} as const;

// ---- Typography ----
export const fonts = {
  display: "'Space Grotesk', 'Helvetica Neue', sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
} as const;

export const typeScale = {
  display: { size: 48, lineHeight: 52, letterSpacing: '-0.02em', weight: 700 },
  headline: { size: 32, lineHeight: 36, letterSpacing: '-0.01em', weight: 700 },
  title: { size: 24, lineHeight: 28, letterSpacing: '0', weight: 600 },
  subtitle: { size: 18, lineHeight: 24, letterSpacing: '0', weight: 500 },
  bodyLg: { size: 16, lineHeight: 24, letterSpacing: '0', weight: 400 },
  body: { size: 14, lineHeight: 20, letterSpacing: '0', weight: 400 },
  bodySm: { size: 12, lineHeight: 16, letterSpacing: '0.01em', weight: 400 },
  label: { size: 13, lineHeight: 16, letterSpacing: '0.02em', weight: 500 },
  caption: { size: 11, lineHeight: 14, letterSpacing: '0.02em', weight: 400 },
  button: { size: 14, lineHeight: 16, letterSpacing: '0.02em', weight: 600 },
  code: { size: 16, lineHeight: 20, letterSpacing: '0.08em', weight: 700 },
} as const;

// ---- Spacing (8px base) ----
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

// ---- Border Radius ----
export const radius = {
  card: 16,
  button: 12,
  input: 12,
  badge: 20,
} as const;

// ---- Shadows ----
export const shadows = {
  glow: '0 0 20px rgba(168, 85, 247, 0.3)',
  card: '0 4px 12px rgba(0, 0, 0, 0.3)',
  modal: '0 24px 48px rgba(0, 0, 0, 0.5)',
} as const;

// ---- Transitions ----
export const transitions = {
  fast: '150ms ease',
  base: '200ms ease',
  slow: '300ms ease',
} as const;

// ---- Gradients ----
export const gradients = {
  primary: 'linear-gradient(135deg, #E87A24 0%, #F5C542 100%)',
  glow: 'radial-gradient(ellipse at center, rgba(232, 122, 36, 0.15) 0%, transparent 70%)',
  surface: 'linear-gradient(180deg, #1A1A26 0%, #12121A 100%)',
} as const;

// ---- Status Badge Mapping ----
export const statusColors = {
  APPROVED: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22C55E' },
  PENDING: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' },
  REJECTED: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' },
  CHECKED_IN: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6' },
  SOLD_OUT: { bg: '#1A1A26', text: '#5A5A6E' },
} as const;

export type ReservationStatus = keyof typeof statusColors;
