import { Reveal } from "./Reveal";
import { MagneticButton } from "./MagneticButton";

export function FinalCTA() {
  return (
    <section id="start" className="m-section">
      <div className="m-container">
        <Reveal>
          <div className="m-cta-panel">
            <div className="m-cta-grid" aria-hidden="true" />
            <div style={{ maxWidth: "40rem" }}>
              <span className="m-eyebrow" style={{ color: "rgba(245,243,238,0.6)" }}>
                Start in five minutes
              </span>
              <h2
                className="m-h2"
                style={{ marginTop: "1.5rem", color: "var(--m-paper)", maxWidth: "16ch" }}
              >
                Ship like the lights are on.
              </h2>
              <p style={{ marginTop: "1.5rem", color: "rgba(245,243,238,0.72)", fontSize: "1.1rem", lineHeight: 1.5, maxWidth: "44ch" }}>
                Connect your pipeline and watch your next deploy with Meridian.
                Free while you&rsquo;re small, priced fairly when you&rsquo;re not.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "2.5rem" }}>
                <MagneticButton
                  href="#"
                  variant="primary"
                  className="m-cta-invert"
                >
                  Start free
                  <span className="m-btn-arrow" aria-hidden="true">→</span>
                </MagneticButton>
                <a
                  href="#"
                  className="m-btn"
                  style={{ color: "var(--m-paper)", border: "1px solid rgba(245,243,238,0.3)" }}
                >
                  Talk to us
                </a>
              </div>
              <p style={{ marginTop: "1.75rem", fontFamily: "var(--m-mono)", fontSize: "0.72rem", letterSpacing: "0.06em", color: "rgba(245,243,238,0.5)" }}>
                No credit card · SOC 2 Type II · Self-host available
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
