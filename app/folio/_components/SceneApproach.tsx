import { Reveal } from "./Reveal";
import { RESUME } from "../_data/resume";

const PRINCIPLES = [
  {
    k: "01",
    title: "Prototype in the real medium",
    body: "Interaction can't be judged in a static file. I build it in code early, so we're deciding with the real thing in hand — not a guess of it.",
  },
  {
    k: "02",
    title: "Motion is an accessibility budget",
    body: "Every animation spends attention and, for some, comfort. I design motion with interruption rules and reduced-motion paths from the first frame.",
  },
  {
    k: "03",
    title: "Ship the last 10%",
    body: "The empty states, the focus rings, the millisecond a spring settles. The part most teams cut is the part users actually feel.",
  },
];

export function SceneApproach() {
  return (
    <section id="approach" className="f-scene f-container">
      <div style={{ maxWidth: "60rem" }}>
        <Reveal>
          <span className="f-eyebrow">How I work</span>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="f-h2" style={{ marginTop: "1.5rem", maxWidth: "16ch" }}>
            Taste is a craft, not a gift.
          </h2>
        </Reveal>
      </div>

      <div className="f-approach-grid" style={{ marginTop: "clamp(2.5rem, 2rem + 3vw, 4rem)" }}>
        {PRINCIPLES.map((p, i) => (
          <Reveal key={p.k} delay={i * 90} className="f-approach-cell">
            <span className="f-coord" style={{ color: "var(--f-blue)" }}>{p.k}</span>
            <h3 className="f-h3" style={{ marginTop: "1rem", fontSize: "clamp(1.25rem, 1rem + 0.9vw, 1.6rem)" }}>
              {p.title}
            </h3>
            <p style={{ marginTop: "0.9rem", color: "var(--f-ink-2)", lineHeight: 1.55 }}>
              {p.body}
            </p>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120}>
        <div style={{ marginTop: "clamp(2.5rem, 2rem + 3vw, 4rem)", display: "flex", flexWrap: "wrap", gap: "0.6rem", alignItems: "center" }}>
          <span className="f-coord" style={{ marginRight: "0.75rem" }}>Toolkit /</span>
          {RESUME.skills.map((s) => (
            <span key={s} className="f-tag">{s}</span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
