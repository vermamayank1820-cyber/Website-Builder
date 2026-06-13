import { Reveal } from "./Reveal";
import { RESUME } from "../_data/resume";

export function SceneManifesto() {
  return (
    <section className="f-scene f-container">
      <div style={{ maxWidth: "64rem" }}>
        <Reveal>
          <span className="f-eyebrow">A — Position</span>
        </Reveal>
        <Reveal delay={90}>
          <p className="f-h2" style={{ marginTop: "2rem", maxWidth: "20ch" }}>
            Most software fails in the <span className="f-blue">gap</span> between the mockup and the merge.
          </p>
        </Reveal>
        <Reveal delay={170}>
          <p className="f-lead" style={{ marginTop: "2rem", maxWidth: "52ch" }}>
            I live in that gap. I prototype the interaction, write the production
            component, and hold the line on the details that survive to ship —
            the spring that doesn&rsquo;t stutter, the empty state that reassures,
            the frame that lands on the pixel. Twelve years between the design
            file and the deploy.
          </p>
        </Reveal>
      </div>

      {/* career line */}
      <div style={{ marginTop: "clamp(3.5rem, 2rem + 5vw, 6rem)" }}>
        <Reveal>
          <span className="f-eyebrow" style={{ marginBottom: "1.5rem", display: "inline-flex" }}>
            B — Trajectory
          </span>
        </Reveal>
        {RESUME.roles.map((role, i) => (
          <Reveal key={role.org} delay={i * 80}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr)",
                gap: "0.75rem",
                paddingBlock: "clamp(1.5rem, 1rem + 2vw, 2.5rem)",
                borderTop: "1px solid var(--f-line)",
              }}
              className="f-role"
            >
              <div className="f-role-grid">
                <div>
                  <span className="f-coord">{role.period}</span>
                </div>
                <div>
                  <h3 className="f-h3" style={{ fontSize: "clamp(1.3rem, 1rem + 1vw, 1.7rem)" }}>
                    {role.org}
                  </h3>
                  <p style={{ color: "var(--f-muted)", fontFamily: "var(--f-mono)", fontSize: "0.78rem", marginTop: "0.3rem" }}>
                    {role.title} · {role.location}
                  </p>
                </div>
                <p style={{ color: "var(--f-ink-2)", lineHeight: 1.55, maxWidth: "40ch" }}>
                  {role.blurb}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
