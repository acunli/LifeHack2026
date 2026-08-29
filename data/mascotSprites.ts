/**
 * Sprite map for WattLah mascots.
 *
 * The repository ships original pixel-art mascots rendered as crisp SVG from
 * the compact color matrices below (no third-party sprite sheets). Each mascot
 * has a palette and an idle sequence of facings (front / left / right).
 *
 * `assetPath` documents the local PNG location convention so these mascots can
 * later be swapped for real sprite assets under /public without touching the
 * consuming components. Serve such PNGs directly (image-rendering: pixelated),
 * never through Next.js Image optimization.
 */

export type Facing = 'front' | 'left' | 'right'

export type MascotName = 'Alex' | 'Adam' | 'Amelia' | 'Bob'

export type MascotPalette = {
  hat: string
  skin: string
  shirt: string
  shirtDark: string
  pants: string
  eye: string
}

export type MascotDef = {
  name: MascotName
  assetPath: string
  palette: MascotPalette
}

export const MASCOT_ORDER: MascotName[] = ['Alex', 'Adam', 'Amelia', 'Bob']

export const MASCOTS: Record<MascotName, MascotDef> = {
  Alex: {
    name: 'Alex',
    assetPath: '/assets/characters/alex.png',
    palette: {
      hat: '#ffc866',
      skin: '#e8c39e',
      shirt: '#5fa072',
      shirtDark: '#3f6b4e',
      pants: '#223a2c',
      eye: '#0d1813',
    },
  },
  Adam: {
    name: 'Adam',
    assetPath: '/assets/characters/adam.png',
    palette: {
      hat: '#ffc866',
      skin: '#d8a97a',
      shirt: '#9be564',
      shirtDark: '#5fa072',
      pants: '#223a2c',
      eye: '#0d1813',
    },
  },
  Amelia: {
    name: 'Amelia',
    assetPath: '/assets/characters/amelia.png',
    palette: {
      hat: '#ffc866',
      skin: '#e7c6a5',
      shirt: '#d99a2b',
      shirtDark: '#a86f1c',
      pants: '#223a2c',
      eye: '#0d1813',
    },
  },
  Bob: {
    name: 'Bob',
    assetPath: '/assets/characters/bob.png',
    palette: {
      hat: '#ffc866',
      skin: '#c98f63',
      shirt: '#2f5240',
      shirtDark: '#16261d',
      pants: '#0d1813',
      eye: '#0d1813',
    },
  },
}

/**
 * Base mascot matrix (11 wide x 14 tall). Characters map to palette keys:
 *   '.' transparent   'H' hat        's' skin
 *   'b' shirt         'B' shirtDark  'p' pants   'e' eye
 * The eye row (index 3) is generated per-facing; see `EYE_COLUMNS`.
 */
export const MASCOT_MATRIX: string[] = [
  '...HHHHH...',
  '.HHHHHHHHH.',
  '..sssssss..',
  '..s.....s..', // eye row placeholder (index 3)
  '..sssssss..',
  '...sssss...',
  '..bbbbbbb..',
  '.bBbbbbbBb.',
  '.bbbbbbbbb.',
  '.sbbbbbbbs.',
  '..bbbbbbb..',
  '..ppp.ppp..',
  '..ppp.ppp..',
  '..pp...pp..',
]

/** Column indices (into the 11-wide grid) for the two eyes, per facing. */
export const EYE_COLUMNS: Record<Facing, [number, number]> = {
  front: [3, 7],
  left: [2, 5],
  right: [5, 8],
}

/** The idle animation sequence cycled by the Mascot component. */
export const IDLE_SEQUENCE: Facing[] = ['front', 'left', 'front', 'right']

/**
 * Build the rendered matrix for a given facing by stamping eyes onto the
 * base skin row. Deterministic and pure.
 */
export function matrixForFacing(facing: Facing): string[] {
  const [a, b] = EYE_COLUMNS[facing]
  return MASCOT_MATRIX.map((row, r) => {
    if (r !== 3) return row
    // Fill the head row with skin, then place eyes.
    const chars = '..sssssss..'.split('')
    if (chars[a] === 's') chars[a] = 'e'
    if (chars[b] === 's') chars[b] = 'e'
    return chars.join('')
  })
}

export function paletteColor(palette: MascotPalette, key: string): string | null {
  switch (key) {
    case 'H':
      return palette.hat
    case 's':
      return palette.skin
    case 'b':
      return palette.shirt
    case 'B':
      return palette.shirtDark
    case 'p':
      return palette.pants
    case 'e':
      return palette.eye
    default:
      return null
  }
}

/** Deterministically assign a mascot to a user id (no Math.random). */
export function mascotForId(userId: string): MascotName {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0
  }
  return MASCOT_ORDER[hash % MASCOT_ORDER.length]
}
