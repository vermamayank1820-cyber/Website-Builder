import { Reveal } from "./Reveal";
import { MagneticButton } from "./MagneticButton";
import { Parallax } from "./Parallax";
import { ProductSurface } from "./ProductSurface";
import { ReleaseMeridian } from "./ReleaseMeridian";

export function Hero() {
  return (
    <section
      id="top"
      style={{ paddingTop: "clamp(8rem, 6rem + 8vw, 12rem)", paddingBottom: "var(--m-section)" }}
    >
      <div className="m-container">
        <div className="m-hero-grid">
          {/* Copy column — kept deliberately spare */}
          <div style={{ maxWidth: "37rem" }}>
            <Reveal>
              <span className="m-eyebrow">Release intelligence</span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="m-display" style={{ marginTop: "1.6rem" }}>
                Ship with the <span className="m-italic">lights</span> on.
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="m-lead" style={{ marginTop: "1.75rem", maxWidth: "40ch" }}>
                Meridian turns every deploy into a calm, legible story — what
                shipped, what changed, and exactly what&rsquo;s at risk. Before
                it&rsquo;s a 2&nbsp;a.m. problem.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "2.25rem" }}>
                <MagneticButton href="#start" variant="primary">
                  Start free
                  <span className="m-btn-arrow" aria-hidden="true">→</span>
                </MagneticButton>
                <MagneticButton href="#product" variant="ghost">
                  See a live release
                </MagneticButton>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginTop: "2.75rem",
                  paddingTop: "1.5rem",
                  borderTop: "1px solid var(--m-line)",
                  maxWidth: "26rem",
                }}
              >
                <div style={{ fontFamily: "var(--m-display)", fontSize: "2.1rem", lineHeight: 1 }}>
                  2.4M
                </div>
                <p style={{ fontSize: "0.86rem", color: "var(--m-muted)", margin: 0, lineHeight: 1.4 }}>
                  deploys watched last quarter — zero surprise rollbacks for
                  teams on Meridian.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Product surface — the cinematic visual */}
          <Reveal delay={200} className="m-hero-visual">
            <Parallax speed={0.05}>
              <div style={{ position: "relative" }}>
                <ProductSurface />
                <div
                  className="m-float-card m-hero-float"
                  style={{ right: "-1.5rem", bottom: "2.5rem" }}
                >
                  <div style={{ fontFamily: "var(--m-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", color: "var(--m-faint)", textTransform: "uppercase" }}>
                    Auto-paused
                  </div>
                  <div style={{ fontFamily: "var(--m-display)", fontSize: "1.05rem", marginTop: "0.25rem" }}>
                    Rollback ready
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "var(--m-muted)", marginTop: "0.1rem" }}>
                    billing-worker · 1 click
                  </div>
                </div>
              </div>
            </Parallax>
          </Reveal>
        </div>

        <ReleaseMeridian />
      </div>
    </section>
  );
}
