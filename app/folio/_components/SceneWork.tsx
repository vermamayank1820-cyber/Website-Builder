import { Reveal } from "./Reveal";
import { RESUME } from "../_data/resume";
import { PROJECT_VISUALS } from "./ProjectVisuals";

export function SceneWork() {
  return (
    <section id="work" className="f-scene" style={{ background: "var(--f-paper-2)" }}>
      <div className="f-container">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <Reveal>
              <span className="f-eyebrow">Selected work</span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="f-h2" style={{ marginTop: "1.5rem", maxWidth: "14ch" }}>
                Three things I made things with.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={140}>
            <span className="f-coord" style={{ maxWidth: "22ch", lineHeight: 1.6 }}>
              Selected from client &amp; open-source work, 2022 — 2024. NDA work on request.
            </span>
          </Reveal>
        </div>

        {RESUME.projects.map((p, i) => {
          const Visual = PROJECT_VISUALS[p.name];
          const reversed = i % 2 === 1;
          return (
            <Reveal key={p.name}>
              <article className="f-work-item">
                <div style={{ order: reversed ? 2 : 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.9rem" }}>
                    <span className="f-coord" style={{ color: "var(--f-blue)" }}>{p.index}</span>
                    <span className="f-coord">{p.kind} · {p.year}</span>
                  </div>
                  <h3 className="f-h3" style={{ marginTop: "0.9rem" }}>{p.name}</h3>
                  <p style={{ marginTop: "1rem", color: "var(--f-ink-2)", lineHeight: 1.55, maxWidth: "42ch" }}>
                    {p.summary}
                  </p>
                  <p style={{ marginTop: "1rem", fontFamily: "var(--f-mono)", fontSize: "0.8rem", color: "var(--f-ink)" }}>
                    → {p.outcome}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1.4rem" }}>
                    {p.stack.map((s) => (
                      <span key={s} className="f-tag">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="f-work-visual f-frame" style={{ order: reversed ? 1 : 2 }}>
                  {Visual ? <Visual /> : null}
                  <span className="f-mark tl" /><span className="f-mark tr" />
                  <span className="f-mark bl" /><span className="f-mark br" />
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
