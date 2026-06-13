import { Reveal } from "./Reveal";

/**
 * The signature element: a release timeline rendered as a meridian line,
 * each release a light along it. The current release is lit and pulsing.
 * Ties the name, the tagline ("lights on") and the product into one mark.
 */
const RELEASES = [
  { v: "4.17", live: false },
  { v: "4.18", live: false },
  { v: "4.19", live: false },
  { v: "4.20", live: false },
  { v: "4.21", live: true },
];

export function ReleaseMeridian() {
  return (
    <Reveal className="m-meridian" delay={400}>
      <div className="m-meridian-glow" aria-hidden="true" />
      <div className="m-meridian-caption">
        <span className="m-eyebrow">Releases</span>
        <span style={{ fontFamily: "var(--m-mono)", fontSize: "0.7rem", color: "var(--m-muted)" }}>
          this quarter → now
        </span>
      </div>
      <div className="m-meridian-track" role="img" aria-label="Release timeline: 4.17 through 4.20 shipped, 4.21 deploying now">
        <div className="m-meridian-nodes">
          {RELEASES.map((r) => (
            <span key={r.v} className={`m-rnode ${r.live ? "is-live" : ""}`}>
              {r.live && <span className="m-rnode-halo" aria-hidden="true" />}
              <span className="m-rnode-dot" aria-hidden="true" />
              <span className="m-rnode-label">{r.live ? `${r.v} · live` : r.v}</span>
            </span>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
