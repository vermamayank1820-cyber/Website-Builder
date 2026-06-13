/* Bespoke per-project visuals — CSS/SVG only, in the plotter-blue language.
   Each one depicts the actual project, not decoration. */

/** Tideline — contour lines forming a coastline / flood gradient. */
export function TidelineVisual() {
  const lines = Array.from({ length: 9 });
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }} aria-hidden="true">
      <rect width="400" height="250" fill="var(--f-paper-2)" />
      {lines.map((_, i) => {
        const y = 40 + i * 22;
        const amp = 10 + i * 1.6;
        const d = `M-10 ${y} C 60 ${y - amp}, 120 ${y + amp}, 200 ${y - amp * 0.6} S 340 ${y + amp}, 410 ${y - amp * 0.4}`;
        const lit = i > 5;
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={lit ? "var(--f-blue)" : "var(--f-line-3)"}
            strokeWidth={lit ? 1.4 : 1}
            opacity={lit ? 0.9 : 0.5}
          />
        );
      })}
      <circle cx="200" cy="150" r="3" fill="var(--f-red)" />
      <text x="208" y="153" fontFamily="var(--f-mono)" fontSize="8" fill="var(--f-muted)">
        +1.4m
      </text>
    </svg>
  );
}

/** Plotter Type — a glyph drawn as one continuous plotted path. */
export function PlotterVisual() {
  return (
    <svg viewBox="0 0 400 250" style={{ width: "100%", height: "100%" }} aria-hidden="true">
      <rect width="400" height="250" fill="var(--f-paper-2)" />
      {/* faint plotter grid */}
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={`v${i}`} x1={50 + i * 40} y1="40" x2={50 + i * 40} y2="210" stroke="var(--f-line)" strokeWidth="1" />
      ))}
      {/* a large "a" built from continuous strokes */}
      <path
        d="M250 70 C 250 180, 250 180, 250 200 M250 95 C 200 70, 130 78, 120 130 C 110 185, 180 200, 250 165"
        fill="none"
        stroke="var(--f-blue)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="250" cy="70" r="3" fill="var(--f-red)" />
      <text x="56" y="225" fontFamily="var(--f-mono)" fontSize="8" fill="var(--f-muted)">
        G01 X250 Y70 — pen down
      </text>
    </svg>
  );
}

/** Calm Motion — a spring response curve settling without overshoot jank. */
export function MotionVisual() {
  // sample an underdamped-but-tasteful spring
  const pts: string[] = [];
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const x = 30 + t * 340;
    const env = Math.exp(-3.2 * t);
    const y = 150 - (1 - env * Math.cos(t * 9)) * 90;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return (
    <svg viewBox="0 0 400 250" style={{ width: "100%", height: "100%" }} aria-hidden="true">
      <rect width="400" height="250" fill="var(--f-paper-2)" />
      <line x1="30" y1="60" x2="370" y2="60" stroke="var(--f-line)" strokeDasharray="3 4" strokeWidth="1" />
      <line x1="30" y1="150" x2="370" y2="150" stroke="var(--f-line-2)" strokeWidth="1" />
      <polyline points={pts.join(" ")} fill="none" stroke="var(--f-blue)" strokeWidth="2" strokeLinecap="round" />
      <text x="34" y="52" fontFamily="var(--f-mono)" fontSize="8" fill="var(--f-muted)">
        target
      </text>
      <text x="300" y="170" fontFamily="var(--f-mono)" fontSize="8" fill="var(--f-muted)">
        settle · no jank
      </text>
    </svg>
  );
}

export const PROJECT_VISUALS: Record<string, () => React.ReactElement> = {
  Tideline: TidelineVisual,
  "Plotter Type": PlotterVisual,
  "Calm Motion": MotionVisual,
};
