/**
 * The WattLah bolt, as pixel art.
 *
 * NOT dead code, despite nothing importing it: `app/icon.svg` — the favicon —
 * was generated from this matrix, and this is the record of how. The on-screen
 * wordmark is Varun's PNG (`public/wattlah-logo.png`); only the tab icon comes
 * from here. Regenerate the icon from this file if the mark ever changes, so
 * the tab and the logo do not drift apart.
 *
 * Replaces the flat two-tone SVG path the wordmark used to carry. The shape is
 * the same bolt — top bar, step out to the right at the waist, long diagonal to
 * a point, step out to the left — but rasterised onto a grid so it can carry a
 * bevel: white along the lit left edge, deeper amber down the shaded right,
 * dark outline all round. That is what makes it read as an object rather than
 * as a silhouette.
 *
 * The trailing block is the dot of the exclamation mark, so the whole "!" is
 * one drawing and scales as one.
 *
 * Characters: O outline, H highlight, B body, S shade, . transparent.
 */

export const BOLT_W = 18
export const BOLT_H = 36

export const BOLT_MATRIX: readonly string[] = [
  '........OOOOOOOOOO',
  '.......OOHHHHHHHSO',
  '.......OBBBBBBBSOO',
  '......OOHBBBBBBSO.',
  '......OHBBBBBBSOO.',
  '.....OOBBBBBBBSO..',
  '.....OHBBBBBBSOO..',
  '....OOHBBBBBBSO...',
  '....OBBBBBBBSOO...',
  '...OOHBBBBBBSO....',
  '...OHBBBBBBSOOOOOO',
  '..OOBBBBBBBBBBBBSO',
  '..OHBBBBBBBBBBBSOO',
  '.OOHBBBBBBBBBBSOO.',
  '.OBBBBBBBBBBBSOO..',
  'OOHBBBBBBBBBSOO...',
  'OHSSSSSBBBBBSO....',
  'OOOOOOOBBBBSOO....',
  '.....OHBBBSOO.....',
  '.....OHBBSOO......',
  '....OOBBBSO.......',
  '....OHBBSOO.......',
  '....OHBSOO........',
  '...OOBSOO.........',
  '...OHSOO..........',
  '...OHSO...........',
  '..OOSOO...........',
  '..OHOO............',
  '..OOO.............',
  '..................',
  '......OOOOOOO.....',
  '......OHHBBSO.....',
  '......OHBBBSO.....',
  '......OHBBBSO.....',
  '......OBBSSSO.....',
  '......OOOOOOO.....',
]

/**
 * Theme tokens, not literals, so the mark follows the palette the rest of the
 * UI is built from. White stays white — it is the specular highlight.
 */
export const BOLT_COLORS: Record<string, string> = {
  O: 'var(--bg-deep)',
  H: '#ffffff',
  B: 'var(--amber)',
  S: 'var(--amber-deep)',
}
