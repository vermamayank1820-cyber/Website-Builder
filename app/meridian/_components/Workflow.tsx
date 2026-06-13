import { Reveal } from "./Reveal";

const STEPS = [
  {
    n: "01",
    title: "Connect once",
    body: "Point Meridian at your CI and your repo. It maps services and dependencies in minutes — no agents, no sidecars.",
  },
  {
    n: "02",
    title: "Ship as usual",
    body: "Keep your pipeline. Meridian watches every deploy, scores the blast radius, and writes the release narrative for you.",
  },
  {
    n: "03",
    title: "Stay in control",
    body: "Get a clear signal the moment something drifts — and a pre-armed rollback if you need it. Quiet until it matters.",
  },
];

export function Workflow() {
  return (
    <section id="workflow" className="m-section" style={{ background: "var(--m-paper-2)" }}>
      <div className="m-container">
        <div style={{ maxWidth: "40rem", marginBottom: "clamp(2.5rem, 2rem + 3vw, 4.5rem)" }}>
          <Reveal>
            <span className="m-eyebrow">How it fits</span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="m-h2" style={{ marginTop: "1.4rem" }}>
              It slots in around the pipeline you already trust.
            </h2>
          </Reveal>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0" }}>
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 100}>
              <div style={{ padding: "0 clamp(0.5rem, 1vw, 1.75rem)", borderLeft: "1px solid var(--m-line-2)" }}>
                <div style={{ fontFamily: "var(--m-mono)", fontSize: "0.78rem", color: "var(--m-accent)", letterSpacing: "0.1em" }}>
                  {step.n}
                </div>
                <h3 className="m-h3" style={{ marginTop: "1rem", fontSize: "1.5rem" }}>
                  {step.title}
                </h3>
                <p style={{ marginTop: "0.85rem", color: "var(--m-ink-2)", lineHeight: 1.55, maxWidth: "32ch" }}>
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
