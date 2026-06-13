import { Reveal } from "./Reveal";

const METRICS = [
  { value: "73%", label: "fewer surprise rollbacks in the first 90 days" },
  { value: "12s", label: "median time from signal to safe state" },
  { value: "2.4M", label: "deploys observed across customer teams" },
  { value: "4.9", label: "average rating from platform engineers" },
];

export function Metrics() {
  return (
    <section className="m-section" style={{ paddingBlock: "clamp(3rem, 2rem + 4vw, 6rem)" }}>
      <div className="m-container">
        <Reveal>
          <div className="m-metric-grid">
            {METRICS.map((m) => (
              <div key={m.label} className="m-metric">
                <span className="m-metric-value">{m.value}</span>
                <span style={{ fontSize: "0.85rem", color: "var(--m-muted)", lineHeight: 1.45, maxWidth: "22ch" }}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
