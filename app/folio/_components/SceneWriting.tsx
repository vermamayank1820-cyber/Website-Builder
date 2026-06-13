import { Reveal } from "./Reveal";
import { RESUME } from "../_data/resume";

export function SceneWriting() {
  return (
    <section id="writing" className="f-scene" style={{ background: "var(--f-paper-2)" }}>
      <div className="f-container">
        <Reveal>
          <span className="f-eyebrow">Writing &amp; talks</span>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="f-h2" style={{ marginTop: "1.5rem", maxWidth: "18ch" }}>
            I think out loud, in public.
          </h2>
        </Reveal>

        <div style={{ marginTop: "clamp(2.5rem, 2rem + 3vw, 4rem)" }}>
          {RESUME.writing.map((w, i) => (
            <Reveal key={w.title} delay={i * 70}>
              <a href="#" className="f-write-row" style={{ textDecoration: "none", color: "var(--f-ink)" }}>
                <span className="f-coord" style={{ color: "var(--f-blue)" }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: "var(--f-display)", fontWeight: 540, fontSize: "clamp(1.15rem, 1rem + 0.8vw, 1.6rem)", letterSpacing: "-0.02em" }}>
                  {w.title}
                </span>
                <span className="f-coord" style={{ whiteSpace: "nowrap", color: "var(--f-muted)" }}>
                  {w.venue} · {w.year}
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
