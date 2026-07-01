export function PaperGrain() {
  return (
    <svg
      className="pointer-events-none fixed inset-0 h-full w-full opacity-[0.18] mix-blend-multiply"
      aria-hidden
    >
      <filter id="paper-noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="2"
          stitchTiles="stitch"
        />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.18  0 0 0 0 0.13  0 0 0 0 0.09  0 0 0 0.55 0"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#paper-noise)" />
    </svg>
  );
}
