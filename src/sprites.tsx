import type { PersonLook } from './look';

// All sprites are drawn in "pixel" units inside an SVG viewBox and scaled up
// with crisp edges, so they stay sharp at any size.

type R = [x: number, y: number, w: number, h: number, fill: string];

function Rects({ rects }: { rects: R[] }) {
  return (
    <>
      {rects.map(([x, y, w, h, fill], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={fill} />
      ))}
    </>
  );
}

const BODY = '#eef0f2';
const BODY_SHADE = '#b9bec6';
const GLASS = '#1d2b3a';
const DARK = '#22252b';
const ENGINE = '#8b929c';

/** Side view, nose to the right. 64 × 26 pixels. The tail fin carries the flight id. */
export function PlaneSprite({ livery, tail, scale = 4 }: { livery: string; tail: string | number; scale?: number }) {
  const windows: R[] = [];
  for (let x = 17; x <= 50; x += 3) windows.push([x, 13, 1, 1, GLASS]);
  const rects: R[] = [
    // tail fin (stepped)
    [6, 0, 5, 1, livery],
    [5, 1, 7, 1, livery],
    [4, 2, 9, 2, livery],
    [3, 4, 11, 2, livery],
    [2, 6, 13, 3, livery],
    [1, 9, 15, 2, livery],
    // fuselage
    [1, 11, 55, 6, BODY],
    [0, 11, 1, 3, BODY],
    [56, 12, 3, 5, BODY],
    [59, 13, 2, 4, BODY],
    [61, 14, 2, 2, BODY],
    // cheat line + belly
    [1, 15, 60, 1, livery],
    [3, 17, 53, 1, BODY_SHADE],
    [56, 17, 4, 1, BODY_SHADE],
    // cockpit
    [57, 13, 3, 1, GLASS],
    [60, 14, 1, 1, GLASS],
    ...windows,
    // door
    [53, 12, 1, 4, BODY_SHADE],
    // horizontal stabiliser
    [0, 10, 8, 1, BODY_SHADE],
    // wing + engine
    [24, 17, 18, 2, BODY_SHADE],
    [27, 19, 10, 3, ENGINE],
    [37, 19, 1, 3, DARK],
    [27, 21, 10, 1, '#6c727b'],
    // landing gear
    [14, 18, 1, 4, DARK],
    [13, 22, 3, 3, DARK],
    [51, 18, 1, 4, DARK],
    [50, 22, 3, 3, DARK],
  ];
  const label = String(tail);
  const fontSize = label.length > 2 ? 3.4 : 4.6;
  return (
    <svg
      viewBox="0 0 64 26"
      width={64 * scale}
      height={26 * scale}
      shapeRendering="crispEdges"
      aria-hidden="true"
      className="sprite"
    >
      <Rects rects={rects} />
      {/* beacon */}
      <rect className="beacon" x={8} y={0} width={1} height={1} fill="#ff3b30" />
      <text
        x={8}
        y={8.6}
        textAnchor="middle"
        fontFamily="'Press Start 2P', monospace"
        fontSize={fontSize}
        fill="#ffffff"
        style={{ textRendering: 'geometricPrecision' }}
      >
        {label}
      </text>
    </svg>
  );
}

/** Standing person, 12 × 24 pixels. */
export function PersonSprite({ look, scale = 3, carrying = 0, bagColors = [] }: {
  look: PersonLook;
  scale?: number;
  carrying?: number;
  bagColors?: string[];
}) {
  const shown = Math.min(carrying, 2);
  const width = 12 + (shown > 0 ? 7 : 0);
  const rects: R[] = [
    // hair
    [3, 0, 6, 2, look.hair],
    [2, 1, 1, 3, look.hair],
    [9, 1, 1, 2, look.hair],
    // head
    [3, 2, 6, 5, look.skin],
    [4, 4, 1, 1, DARK],
    [7, 4, 1, 1, DARK],
    // neck
    [5, 7, 2, 1, look.skin],
    // shirt + arms
    [2, 8, 8, 7, look.shirt],
    [1, 9, 1, 5, look.shirt],
    [10, 9, 1, 5, look.shirt],
    [1, 14, 1, 1, look.skin],
    [10, 14, 1, 1, look.skin],
    // trousers
    [3, 15, 6, 6, look.pants],
    [5, 18, 2, 3, 'rgba(0,0,0,0.25)'],
    // shoes
    [2, 21, 3, 2, DARK],
    [7, 21, 3, 2, DARK],
  ];
  // bags held at the right hand
  bagColors.slice(0, shown).forEach((c, i) => {
    const bx = 11 + i * 4 - (i > 0 ? 1 : 0);
    rects.push([bx + 1, 14, 2, 1, DARK]); // handle
    rects.push([bx, 15, 4, 7, c]);
    rects.push([bx, 18, 4, 1, 'rgba(0,0,0,0.3)']);
    rects.push([bx, 22, 1, 1, DARK]);
    rects.push([bx + 3, 22, 1, 1, DARK]);
  });
  return (
    <svg
      viewBox={`0 0 ${width} 24`}
      width={width * scale}
      height={24 * scale}
      shapeRendering="crispEdges"
      aria-hidden="true"
      className="sprite"
    >
      <Rects rects={rects} />
    </svg>
  );
}

/** Seated passenger seen through the cabin cutaway, 8 × 10 pixels. */
export function SeatedSprite({ look, scale = 4 }: { look: PersonLook; scale?: number }) {
  const rects: R[] = [
    [0, 2, 2, 8, '#3a4f7a'], // seat back
    [2, 0, 4, 1, look.hair],
    [2, 1, 4, 3, look.skin],
    [5, 2, 1, 1, DARK],
    [2, 4, 4, 4, look.shirt],
    [2, 8, 6, 2, '#3a4f7a'], // seat pan
  ];
  return (
    <svg viewBox="0 0 8 10" width={8 * scale} height={10 * scale} shapeRendering="crispEdges" aria-hidden="true" className="sprite">
      <Rects rects={rects} />
    </svg>
  );
}

/** Suitcase lying on the carousel, 8 × 6 pixels. */
export function BagSprite({ color, scale = 4 }: { color: string; scale?: number }) {
  const rects: R[] = [
    [3, 0, 2, 1, DARK],
    [0, 1, 8, 5, color],
    [0, 3, 8, 1, 'rgba(0,0,0,0.3)'],
    [6, 1, 1, 2, '#f0e6c8'], // luggage tag
  ];
  return (
    <svg viewBox="0 0 8 6" width={8 * scale} height={6 * scale} shapeRendering="crispEdges" aria-hidden="true" className="sprite">
      <Rects rects={rects} />
    </svg>
  );
}
