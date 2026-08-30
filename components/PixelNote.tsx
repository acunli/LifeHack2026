/**
 * The music toggle's icon, as pixel art.
 *
 * It used to be the literal characters "♪" and "♪̸". The first is whatever
 * musical glyph the system font happens to carry — a smooth vector shape in a
 * UI built entirely from pixels. The second is a note plus a combining long
 * solidus, which browsers position differently and some fonts do not compose
 * at all.
 *
 * On/off is carried by colour rather than by a slash through the note. A
 * struck-through note needs a gap between the stroke and the shape to stay
 * legible, and at twelve pixels square there is no room for one: the gap eats
 * the note and both read as speckle. Amber for playing against dim ink for
 * muted is unmistakable at a glance, and the button still carries its label
 * and aria-pressed for anyone not going by colour.
 */

const NOTE: readonly string[] = [
  '.......###..',
  '.......####.',
  '.......####.',
  '.......###..',
  '.......##...',
  '.......##...',
  '.......##...',
  '.......##...',
  '.......##...',
  '..####.##...',
  '.########...',
  '.######.....',
  '..####......',
]

const W = NOTE[0].length
const H = NOTE.length

export default function PixelNote({ muted = false }: { muted?: boolean }) {
  const rects: React.ReactNode[] = []
  NOTE.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      if (row[x] !== '#') {
        x++
        continue
      }
      let run = 1
      while (x + run < row.length && row[x + run] === '#') run++
      rects.push(<rect key={`${y}-${x}`} x={x} y={y} width={run} height={1} />)
      x += run
    }
  })

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      shapeRendering="crispEdges"
      aria-hidden
      style={{
        display: 'block',
        fill: muted ? 'currentColor' : 'var(--amber)',
        opacity: muted ? 0.45 : 1,
      }}
    >
      {rects}
    </svg>
  )
}
