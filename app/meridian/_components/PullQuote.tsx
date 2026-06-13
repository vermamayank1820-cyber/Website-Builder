import { Reveal } from "./Reveal";

export function PullQuote() {
  return (
    <section id="customers" className="m-section" style={{ background: "var(--m-paper-2)" }}>
      <div className="m-container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem", maxWidth: "62rem", marginInline: "auto" }}>
          <Reveal>
            <span className="m-eyebrow" style={{ justifyContent: "center", display: "flex" }}>
              From the on-call channel
            </span>
          </Reveal>
          <Reveal delay={120}>
            <blockquote style={{ margin: 0, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <p className="m-quote" style={{ maxWidth: "26ch" }}>
                &ldquo;The first tool that made deploys feel
                {" "}
                <span className="m-italic m-accent-text">boring</span> — in the
                best possible way.&rdquo;
              </p>
              <footer style={{ marginTop: "2.5rem", display: "flex", alignItems: "center", gap: "0.9rem" }}>
                <span className="m-avatar" style={{ width: 40, height: 40, background: "var(--m-ink)", fontSize: "0.8rem" }}>
                  DR
                </span>
                <span style={{ textAlign: "left" }}>
                  <span style={{ display: "block", fontWeight: 500 }}>Dana Reyes</span>
                  <span style={{ display: "block", fontSize: "0.85rem", color: "var(--m-muted)" }}>
                    Head of Platform, Northwind
                  </span>
                </span>
              </footer>
            </blockquote>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
